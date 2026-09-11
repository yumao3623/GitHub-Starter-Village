import { z } from "zod";
import { adventureSchema as legacySchema, adventureReducer as legacyReducer, initialAdventure as legacyInitial, parseAdventure as parseLegacy, type AdventureSave as LegacySave, type AdventureAction as LegacyAction } from "./appraisal";
import { achievedObjectives } from "./objectives";
import { canEnterNode, worldNodes } from "@/content/world";
import { dialogueById } from "@/content/story";
import { vocabulary } from "@/content/vocabulary/zh-CN";
import { appraisalIntentSchema } from "@/content/minigames/objectives";
import { getProjects } from "@/content/minigames/appraisal";
import { applyChainEvent, chainCompleted, chainEventSchema, chainSaveSchema, eventChapter, freshChain, replayChain, validChain, type ChainEvent } from "./contribution";
import { applyRegion, freshRegions, regionSchema, regionDone, validRegions, type RegionEvent } from "./regions";
import { regionLessons, type RegionId } from "@/content/minigames/region-lessons";

const runSchema = z.object({ mode: z.enum(["practice", "assessment"]), aided: z.boolean(), baselineVariant: z.number().int().min(0).max(1).nullable() });
const archiveSchema = z.object({ key: z.string(), run: runSchema, origin: z.enum(["phase-a", "phase-b"]), snapshot: legacySchema });
const journeySchema = z.object({
  metrics: z.object({ activeMs: z.number().int().min(0).max(315360000000), sound: z.boolean(), firstAssessment: z.record(z.string(), z.boolean()) }).default({ activeMs: 0, sound: false, firstAssessment: {} }),
  lastNode: z.string(),
  encountered: z.array(z.string()).max(500), bookmarks: z.array(z.string()).max(500),
  dialogues: z.record(z.string(), z.object({ index: z.number().int().nonnegative(), dismissed: z.boolean() })),
  run: runSchema, archives: z.array(archiveSchema).max(4),
  migration: z.enum(["fresh", "phase-a"]),
  contribution: z.object({ currentChapter: z.number().int().min(7).max(12), completedChapters: z.array(z.number().int().min(7).max(12)).max(6), stepIndex: z.number().int().min(0).max(2), attempts: z.record(z.string(), z.number().int().nonnegative()), lastAction: z.string().nullable() }).default({ currentChapter: 7, completedChapters: [], stepIndex: 0, attempts: {}, lastAction: null }),
  foundations: z.array(z.number().int().min(0).max(6)).max(7).default([]), foundationProgress: z.record(z.string(), z.number().int().min(0).max(3)).default({}),
  simulation: chainSaveSchema.default(freshChain),
  regions: regionSchema.default(freshRegions),
});
export const adventureSchema = legacySchema.extend({ version: z.literal(2), journey: journeySchema });
export type AdventureSave = z.infer<typeof adventureSchema>;
export type AdventureState = AdventureSave & {
  ready: boolean; feedback: string; feedbackKind: "info" | "error" | "success"; storageIssue: string | null;
  sessionMode: "mainline" | "demo" | "explore";
};
const freshJourney = (): AdventureSave["journey"] => ({
  metrics: { activeMs: 0, sound: false, firstAssessment: {} },
  lastNode: "inn", encountered: [], bookmarks: [], dialogues: {},
  run: { mode: "practice", aided: false, baselineVariant: null }, archives: [], migration: "fresh",
  contribution: { currentChapter: 7, completedChapters: [], stepIndex: 0, attempts: {}, lastAction: null }, foundations: [], foundationProgress: {},
  simulation: freshChain(),
  regions: freshRegions(),
});
export const toLegacy = (state: AdventureSave): LegacySave => legacySchema.parse({ ...state, version: 1 });
export function initialAdventure(): AdventureState {
  return { ...legacyInitial(), version: 2, journey: freshJourney(), sessionMode: "mainline" };
}
export function completedGoals(state: AdventureSave): string[] {
  const model = replayChain(state.journey.simulation.events);
  return [...new Set([...achievedObjectives(toLegacy(state)), ...state.journey.archives.flatMap(record => achievedObjectives(record.snapshot)), ...state.journey.foundations.map(chapter => `foundation-${chapter}`), ...(model ? chainCompleted(model).map(chapter => `chain-${chapter}`) : []), ...Object.keys(regionLessons).filter(id=>regionDone(state.journey.regions,id as RegionId)).map(id=>`region-${id}`)])];
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
  if (!validChain(save.journey.simulation) || !validRegions(save.journey.regions)) return null;
  if (save.journey.simulation.active && (save.view !== "pavilion" || !save.character || !hasCompletedMarket(save))) return null;
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
  const legacyMarketProgress = save.view === "market" && !save.completed && save.journey.lastNode === "market";
  const marketCompatibility = save.journey.lastNode === "market" && save.completed && goals.includes("market-delivered");
  const activeContribution = save.view === "pavilion" && save.journey.simulation.active && save.journey.simulation.chapter >= 7;
  const pavilionCompatibility = save.journey.lastNode === "pavilion" && goals.includes("market-delivered");
  const foundationCompatibility = save.view === "pavilion" && /^chapter-[0-6]$/.test(save.journey.lastNode) && save.journey.foundations.includes(Number(save.journey.lastNode.slice(8)));
  if ((!canEnterNode(save.journey.lastNode, goals) && !legacyMarketProgress && !marketCompatibility && !activeContribution && !pavilionCompatibility && !foundationCompatibility) || (save.view === "pavilion" && !canEnterNode("pavilion", goals) && !activeContribution && !pavilionCompatibility && !foundationCompatibility)) return null;
  return save;
}

export type AdventureAction = Exclude<LegacyAction, { type: "hydrate" }> |
  { type: "active-time"; milliseconds: number } | { type: "sound"; enabled: boolean } |
  { type: "hydrate"; save: AdventureSave | null; issue?: string; sessionMode?: AdventureState["sessionMode"] } |
  { type: "travel"; nodeId: string } |
  { type: "dialogue"; id: string; operation: "next" | "previous" | "dismiss" | "replay" } |
  { type: "encounter" | "bookmark"; termId: string } |
  { type: "request-hint" } | { type: "start-assessment" } |
  { type: "contribution-enter"; chapter: number } | { type: "chain-event"; event: ChainEvent } |
  { type: "foundation-step"; chapter: number; step: number } |
  { type: "chain-draft"; key: string; value: string } | { type: "chain-restart" } | { type: "region-event"; event:RegionEvent };

function message(state: AdventureState, feedback: string, feedbackKind: AdventureState["feedbackKind"] = "info"): AdventureState { return { ...state, feedback, feedbackKind }; }
export function adventureReducer(state: AdventureState, action: AdventureAction): AdventureState {
  if (action.type === "hydrate") {
    const save = action.save ? parseAdventure(action.save) : null;
    const issue = action.issue ?? (action.save && !save ? "存档不合法，原记录未覆盖。" : null);
    return { ...initialAdventure(), ...save, ready: true, sessionMode: action.sessionMode ?? state.sessionMode, storageIssue: issue,
      feedback: issue ?? (save?.journey.migration === "phase-a" ? "阶段 A 进度已安全接续；原始存档保留，旧成绩不自动换算为独立评估。" : save ? "已恢复本地历练进度。" : "先选一位同行的少侠。") };
  }
  if (!state.ready) return state;
  if (action.type === "character") return { ...state, character: action.id, feedback: "角色已选定。身份不会改变课程难度。", feedbackKind: "success" };
  if (action.type === "active-time") {
    if (state.sessionMode !== "mainline" || !Number.isFinite(action.milliseconds) || action.milliseconds <= 0 || action.milliseconds > 5000) return state;
    return { ...state, journey: { ...state.journey, metrics: { ...state.journey.metrics, activeMs: Math.min(315360000000, state.journey.metrics.activeMs + Math.round(action.milliseconds)) } } };
  }
  if (action.type === "sound") return { ...state, journey: { ...state.journey, metrics: { ...state.journey.metrics, sound: action.enabled } } };
  if (action.type === "reset") return { ...initialAdventure(), ready: true, sessionMode: state.sessionMode };
  if (action.type === "storage-error") return { ...state, storageIssue: action.message };
  if (action.type === "region-event") {
    if (!state.character || state.view!=="pavilion" || state.journey.lastNode!==`region-${action.event.region}` || !canEnterNode(state.journey.lastNode,completedGoals(state))) return message(state,"先进入已解锁的地点。","error");
    const result=applyRegion(state.journey.regions,action.event);
    return {...state,journey:{...state.journey,regions:result.state},feedback:result.message,feedbackKind:result.kind};
  }
  if (action.type === "foundation-step") {
    const node = worldNodes.find(item => item.chapter === action.chapter);
    if (!node || node.kind !== "foundation" || !state.character || (!canEnterNode(node.id, completedGoals(state)) && state.sessionMode === "mainline")) return message(state, "前方迷雾未散：先完成上一处历练。", "error");
    const progress = state.journey.foundationProgress[String(action.chapter)] ?? 0;
    if (action.step !== progress) return message(state, `先完成当前引导的第 ${progress + 1} 步。`, "error");
    if (action.step === 2) return { ...state, journey: { ...state.journey, foundations: [...new Set([...state.journey.foundations, action.chapter])], foundationProgress: { ...state.journey.foundationProgress, [action.chapter]: 3 }, lastNode: node.id }, feedback: "路标已盖印。下一处地点会在地图上向右显现。", feedbackKind: "success" };
    return { ...state, journey: { ...state.journey, foundationProgress: { ...state.journey.foundationProgress, [action.chapter]: progress + 1 } }, feedback: ["找到了第一处线索。先观察页面上的英文标签。", "很好，把这个动作和 GitHub 的真实用途连起来。"][action.step] ?? "继续查看任务卡。", feedbackKind: "success" };
  }
  if (action.type === "contribution-enter") {
    const chapter = action.chapter;
    const goals = completedGoals(state);
    const chapterSevenCompatibility = chapter === 7 && hasCompletedMarket(state);
    const chainCompatibility = chapter >= 8 && goals.includes(`chain-${chapter - 1}`);
    if (!state.character || (!canEnterNode(`chapter-${chapter}`, goals) && !chapterSevenCompatibility && !chainCompatibility && state.sessionMode === "mainline")) return message(state, "前方迷雾未散：先完成鉴宝与上一处协作委托。", "error");
    return { ...state, view: "pavilion", journey: { ...state.journey, lastNode: `chapter-${chapter}`, simulation: { ...state.journey.simulation, active: true, chapter } }, feedback: `已进入第 ${chapter} 章。上次编辑和操作记录已恢复。`, feedbackKind: "info" };
  }
  if (action.type === "chain-draft" || action.type === "chain-event" || action.type === "chain-restart") {
    const sim = state.journey.simulation;
    if (!state.character || !sim.active || state.view !== "pavilion" || !hasCompletedMarket(state)) return message(state, "先从地图进入已解锁的场景。", "error");
    if (action.type === "chain-draft") {
      if (!/^[a-z-]{1,30}$/.test(action.key) || action.value.length > 3000) return state;
      return { ...state, journey: { ...state.journey, simulation: { ...sim, drafts: { ...sim.drafts, [action.key]: action.value } } } };
    }
    if (action.type === "chain-restart") return { ...state, view: "map", journey: { ...state.journey, lastNode: "pavilion", simulation: { ...freshChain(), archives: [...sim.archives, sim.events].slice(-3) } }, feedback: "已开启新一轮贡献链。上一轮操作另存为历史，鉴宝成绩不变。", feedbackKind: "info" };
    if (!chainEventSchema.safeParse(action.event).success) return message(state, "操作数据无法识别。", "error");
    const model = replayChain(sim.events)!;
    if (eventChapter(model, action.event.op) !== sim.chapter) return message(state, "此操作不属于当前场景，请通过地图进入对应地点。", "error");
    const result = applyChainEvent(model, action.event);
    if (result.changed && sim.events.length >= 500) return message(state, "本轮记录已满，请导出后重新历练。", "error");
    return { ...state, journey: { ...state.journey, simulation: { ...sim, events: result.changed ? [...sim.events, action.event] : sim.events, mistakes: sim.mistakes + Number(result.kind === "error") } }, feedback: result.message, feedbackKind: result.kind };
  }
  if (action.type === "travel") {
    const node = worldNodes.find(item => item.id === action.nodeId);
    if (node?.id === "pavilion" && !hasCompletedMarket(state) && state.sessionMode === "mainline") return message(state, "先完成集市鉴宝，再进入协作山门。", "error");
    if (!node || (node.id !== "market" && node.id !== "pavilion" && !canEnterNode(node.id, completedGoals(state)) && state.sessionMode === "mainline") || (node.id === "pavilion" && !hasCompletedMarket(state) && state.sessionMode === "mainline")) return message(state, "迷雾未散：先完成上一章的历练，才能进入该地点。", "error");
    if (node.chapter !== undefined && node.kind === "foundation") return { ...state, view: "pavilion", journey: { ...state.journey, lastNode: node.id, simulation: { ...state.journey.simulation, active: false } }, feedback: `已进入第 ${node.chapter} 章。先完成三步引导，再回地图。`, feedbackKind: "info" };
    if (node.chapter !== undefined && node.chapter >= 7) return adventureReducer(state, { type: "contribution-enter", chapter: node.chapter });
    if (node.region) return {...state,view:"pavilion",journey:{...state.journey,lastNode:node.id,simulation:{...state.journey.simulation,active:false}},feedback:regionLessons[node.region].story,feedbackKind:"info"};
    return adventureReducer(state, { type: "navigate", view: node.view });
  }
  if (action.type === "navigate") {
    if (!state.character && action.view !== "choose") return message(state, "请先选择角色。");
    if (action.view === "pavilion" && !hasCompletedMarket(state) && state.sessionMode !== "explore") return message(state, "先完成集市鉴宝，再进入协作山门。", "error");
    const node = worldNodes.find(item => item.view === action.view);
    if (node && action.view !== "market" && !canEnterNode(node.id, completedGoals(state)) && state.sessionMode === "mainline") return message(state, "迷雾未散：完成三卷鉴定并交付推荐，才能解锁飞鸽台。");
    if (action.view === "ending" && !state.completed) return message(state, "当前一轮尚未交付，不能进入结算。");
    return { ...state, view: action.view, selectedFact: null, journey: { ...state.journey, simulation: { ...state.journey.simulation, active: false }, lastNode: node?.id ?? state.journey.lastNode }, feedback: "沿路标继续历练。", feedbackKind: "info" };
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
      journey: { ...state.journey, simulation: { ...state.journey.simulation, active: false }, lastNode: "market", run: { mode: action.type === "start-assessment" ? "assessment" : "practice", aided: false, baselineVariant: action.type === "start-assessment" ? baseline! : null } },
      feedback: action.type === "start-assessment" ? "迁移评估：项目条件发生变化。可查宝典，但查阅后本轮只记辅助练习。" : "新一轮练习已开始。历史完成、解锁和评估保留。" };
  }
  const isIntent = ["inspect", "collect", "attach", "verdict", "deliver"].includes(action.type);
  if (isIntent && !appraisalIntentSchema.safeParse(action).success) return state;
  const next = legacyReducer({ ...state, version: 1 }, action as LegacyAction);
  let journey = state.journey;
  if (journey.run.mode === "assessment" && !journey.run.aided && !state.completed && state.view === "market" && ["attach", "verdict", "deliver"].includes(action.type)) {
    const key = `${state.variant}:${action.type === "deliver" ? "recommendation" : state.activeProject}:${action.type}:${action.type === "attach" ? action.category : "result"}`;
    if (!(key in journey.metrics.firstAssessment)) journey = { ...journey, metrics: { ...journey.metrics, firstAssessment: { ...journey.metrics.firstAssessment, [key]: next.feedbackKind !== "error" } } };
  }
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
