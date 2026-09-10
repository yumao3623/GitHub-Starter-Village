import { z } from "zod";
import { adventureSchema as legacySchema, adventureReducer as legacyReducer, initialAdventure as legacyInitial, parseAdventure as parseLegacy, type AdventureSave as LegacySave, type AdventureAction as LegacyAction } from "./appraisal";
import { achievedObjectives } from "./objectives";
import { canEnterNode, worldNodes } from "@/content/world";
import { dialogueById } from "@/content/story";
import { vocabulary } from "@/content/vocabulary/zh-CN";
import { appraisalIntentSchema } from "@/content/minigames/objectives";
import { getProjects } from "@/content/minigames/appraisal";

const runSchema = z.object({ mode: z.enum(["practice", "assessment"]), aided: z.boolean(), baselineVariant: z.number().int().min(0).max(1).nullable() });
const archiveSchema = z.object({ key: z.string(), run: runSchema, origin: z.enum(["phase-a", "phase-b"]), snapshot: legacySchema });
const journeySchema = z.object({
  lastNode: z.enum(["inn", "market", "pavilion"]),
  encountered: z.array(z.string()).max(500), bookmarks: z.array(z.string()).max(500),
  dialogues: z.record(z.string(), z.object({ index: z.number().int().nonnegative(), dismissed: z.boolean() })),
  run: runSchema, archives: z.array(archiveSchema).max(4),
  migration: z.enum(["fresh", "phase-a"]),
});
export const adventureSchema = legacySchema.extend({ version: z.literal(2), journey: journeySchema });
export type AdventureSave = z.infer<typeof adventureSchema>;
export type AdventureState = AdventureSave & {
  ready: boolean; feedback: string; feedbackKind: "info" | "error" | "success"; storageIssue: string | null;
  sessionMode: "mainline" | "demo" | "explore";
};
const freshJourney = (): AdventureSave["journey"] => ({
  lastNode: "inn", encountered: [], bookmarks: [], dialogues: {},
  run: { mode: "practice", aided: false, baselineVariant: null }, archives: [], migration: "fresh",
});
export const toLegacy = (state: AdventureSave): LegacySave => legacySchema.parse({ ...state, version: 1 });
export function initialAdventure(): AdventureState {
  return { ...legacyInitial(), version: 2, journey: freshJourney(), sessionMode: "mainline" };
}
export function completedGoals(state: AdventureSave): string[] {
  return [...new Set([...achievedObjectives(toLegacy(state)), ...state.journey.archives.flatMap(record => achievedObjectives(record.snapshot))])];
}
export function hasCompletedMarket(state: AdventureSave) { return completedGoals(state).includes("market-delivered"); }

export function migratePhaseA(input: unknown): AdventureSave | null {
  const old = parseLegacy(input);
  if (!old) return null;
  const journey = freshJourney(); journey.migration = "phase-a";
  journey.lastNode = old.view === "pavilion" ? "pavilion" : ["market", "ending"].includes(old.view) ? "market" : "inn";
  if (old.completed) journey.archives.push({ key: `practice:${old.variant}`, run: journey.run, origin: "phase-a", snapshot: old });
  return { ...old, version: 2, journey };
}

export function parseAdventure(input: unknown): AdventureSave | null {
  if (typeof input === "object" && input !== null && "version" in input && input.version === 1) return migratePhaseA(input);
  const parsed = adventureSchema.safeParse(input);
  if (!parsed.success) return null;
  const save = parsed.data;
  if (!parseLegacy({ ...save, version: 1, view: save.view === "pavilion" ? "map" : save.view })) return null;
  const unique = (items: string[]) => new Set(items).size === items.length;
  if (!unique(save.journey.encountered) || !unique(save.journey.bookmarks)) return null;
  if ([...save.journey.encountered, ...save.journey.bookmarks].some(id => !vocabulary.some(term => term.id === id))) return null;
  if (!unique(save.journey.archives.map(record => record.key))) return null;
  for (const record of save.journey.archives) {
    if (!parseLegacy(record.snapshot) || !record.snapshot.completed || record.key !== `${record.run.mode}:${record.snapshot.variant}`) return null;
    if (record.origin === "phase-a" && record.run.mode !== "practice") return null;
    if (record.run.mode === "assessment" && (record.run.baselineVariant === null || record.run.baselineVariant === record.snapshot.variant)) return null;
    if (record.run.mode === "assessment" && !save.journey.archives.some(baseline => baseline.run.mode === "practice" && baseline.snapshot.variant === record.run.baselineVariant)) return null;
  }
  if (save.journey.run.mode === "assessment") {
    const baseline = save.journey.run.baselineVariant;
    if (baseline === null || baseline === save.variant || !save.journey.archives.some(record => record.snapshot.variant === baseline && record.run.mode === "practice")) return null;
  }
  const goals = completedGoals(save);
  for (const [id, cursor] of Object.entries(save.journey.dialogues)) {
    const dialogue = dialogueById(id);
    if (!dialogue || cursor.index >= dialogue.lines.length || !dialogue.requiredGoals.every(goal => goals.includes(goal))) return null;
  }
  if (!canEnterNode(save.journey.lastNode, goals) || (save.view === "pavilion" && !canEnterNode("pavilion", goals))) return null;
  return save;
}

export type AdventureAction = Exclude<LegacyAction, { type: "hydrate" }> |
  { type: "hydrate"; save: AdventureSave | null; issue?: string; sessionMode?: AdventureState["sessionMode"] } |
  { type: "travel"; nodeId: string } |
  { type: "dialogue"; id: string; operation: "next" | "previous" | "dismiss" | "replay" } |
  { type: "encounter" | "bookmark"; termId: string } |
  { type: "request-hint" } | { type: "start-assessment" };

function message(state: AdventureState, feedback: string): AdventureState { return { ...state, feedback, feedbackKind: "info" }; }
export function adventureReducer(state: AdventureState, action: AdventureAction): AdventureState {
  if (action.type === "hydrate") {
    const save = action.save ? parseAdventure(action.save) : null;
    const issue = action.issue ?? (action.save && !save ? "存档不合法，原记录未覆盖。" : null);
    return { ...initialAdventure(), ...save, ready: true, sessionMode: action.sessionMode ?? state.sessionMode, storageIssue: issue,
      feedback: issue ?? (save?.journey.migration === "phase-a" ? "阶段 A 进度已安全接续；原始存档保留，旧成绩不自动换算为独立评估。" : save ? "已恢复本地历练进度。" : "先选一位同行的少侠。") };
  }
  if (!state.ready) return state;
  if (action.type === "reset") return { ...initialAdventure(), ready: true, sessionMode: state.sessionMode };
  if (action.type === "storage-error") return { ...state, storageIssue: action.message };
  if (action.type === "travel") {
    const node = worldNodes.find(item => item.id === action.nodeId);
    if (!node || (!canEnterNode(node.id, completedGoals(state)) && state.sessionMode !== "explore")) return message(state, "迷雾未散：完成三卷鉴定并交付推荐，才能进入该地点。");
    return adventureReducer(state, { type: "navigate", view: node.view });
  }
  if (action.type === "navigate") {
    if (!state.character && action.view !== "choose") return message(state, "请先选择角色。");
    const node = worldNodes.find(item => item.view === action.view);
    if (node && !canEnterNode(node.id, completedGoals(state)) && state.sessionMode !== "explore") return message(state, "迷雾未散：完成三卷鉴定并交付推荐，才能解锁飞鸽台。");
    if (action.view === "ending" && !state.completed) return message(state, "当前一轮尚未交付，不能进入结算。");
    return { ...state, view: action.view, selectedFact: null, journey: { ...state.journey, lastNode: (node?.id ?? state.journey.lastNode) as AdventureSave["journey"]["lastNode"] }, feedback: "沿路标继续历练。", feedbackKind: "info" };
  }
  if (action.type === "dialogue") {
    const dialogue = dialogueById(action.id);
    const node = worldNodes.find(item => item.id === dialogue?.nodeId);
    if (!dialogue || state.view !== node?.view || (!dialogue.requiredGoals.every(goal => completedGoals(state).includes(goal)) && state.sessionMode !== "explore")) return state;
    const current = state.journey.dialogues[action.id] ?? { index: 0, dismissed: false };
    const cursor = action.operation === "dismiss" ? { ...current, dismissed: true } : action.operation === "replay" ? { index: 0, dismissed: false }
      : { index: Math.max(0, Math.min(dialogue.lines.length - 1, current.index + (action.operation === "next" ? 1 : -1))), dismissed: false };
    return { ...state, journey: { ...state.journey, dialogues: { ...state.journey.dialogues, [action.id]: cursor } } };
  }
  if (action.type === "request-hint") return { ...state, journey: { ...state.journey, run: { ...state.journey.run, aided: state.journey.run.aided || (!state.completed && (state.view === "market" || state.journey.run.mode === "assessment")) } } };
  if (action.type === "encounter" || action.type === "bookmark") {
    if (!vocabulary.some(term => term.id === action.termId)) return state;
    const key = action.type === "encounter" ? "encountered" : "bookmarks";
    const previous = state.journey[key];
    const values = action.type === "bookmark" && previous.includes(action.termId) ? previous.filter(id => id !== action.termId) : [...new Set([...previous, action.termId])];
    return { ...state, journey: { ...state.journey, [key]: values } };
  }
  if (action.type === "new-round" || action.type === "start-assessment") {
    if (!hasCompletedMarket(state)) return message(state, "请先完成鉴宝，再开始复玩或迁移评估。");
    if (!state.completed && state.inspected.length > 0) return message(state, "请完成当前一轮，避免覆盖未交付的证据。");
    const baseline = state.journey.archives.find(record => record.run.mode === "practice")?.snapshot.variant;
    if (action.type === "start-assessment" && baseline === undefined) return state;
    const variant = (action.type === "start-assessment" ? baseline : state.variant) === 0 ? 1 : 0;
    return { ...initialAdventure(), ready: true, character: state.character, view: "market", variant, reducedMotion: state.reducedMotion,
      sessionMode: state.sessionMode, storageIssue: state.storageIssue,
      journey: { ...state.journey, lastNode: "market", run: { mode: action.type === "start-assessment" ? "assessment" : "practice", aided: false, baselineVariant: action.type === "start-assessment" ? baseline! : null } },
      feedback: action.type === "start-assessment" ? "迁移评估：项目条件发生变化。可查宝典，但查阅后本轮只记辅助练习。" : "新一轮练习已开始。历史完成、解锁和评估保留。" };
  }
  const isIntent = ["inspect", "collect", "attach", "verdict", "deliver"].includes(action.type);
  if (isIntent && !appraisalIntentSchema.safeParse(action).success) return state;
  const next = legacyReducer({ ...state, version: 1 }, action as LegacyAction);
  let journey = state.journey;
  if (action.type === "inspect" && state.view === "market" && !state.completed) {
    const termId = getProjects(state.variant).find(project => project.id === action.project)?.facts.find(fact => fact.tab === action.tab)?.termId;
    journey = { ...journey, lastNode: "market", encountered: termId ? [...new Set([...journey.encountered, termId])] : journey.encountered };
  }
  if (!state.completed && next.completed) {
    const key = `${journey.run.mode}:${next.variant}`;
    const existing = journey.archives.find(record => record.key === key);
    const record = { key, run: journey.run, origin: "phase-b" as const, snapshot: legacySchema.parse(next) };
    if (!existing || (existing.run.aided && !record.run.aided)) journey = { ...journey, archives: [...journey.archives.filter(item => item.key !== key), record] };
  }
  return { ...next, version: 2, journey, sessionMode: state.sessionMode };
}
