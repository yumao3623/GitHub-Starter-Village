import { z } from "zod";
import { categories, getProjects, projectIds, verdicts, type Category, type DossierTab, type ProjectId, type Verdict } from "@/content/minigames/appraisal";
import type { CharacterId } from "@/content/characters";

const slotsSchema = z.object({ environment: z.string().nullable(), permission: z.string().nullable(), maintenance: z.string().nullable() });
const appraisalSchema = z.object({ slots: slotsSchema, verdict: z.enum(verdicts).nullable() });
export const adventureSchema = z.object({
  version: z.literal(1), character: z.enum(["xingzhou", "zhiwei", "atuan"]).nullable(),
  view: z.enum(["choose", "map", "market", "ending", "pavilion"]), variant: z.number().int().min(0).max(1),
  activeProject: z.enum(projectIds), tab: z.enum(["requirements", "license", "release", "stars"]),
  inspected: z.array(z.string()).max(12), collected: z.array(z.string()).max(12), selectedFact: z.string().nullable(),
  dossiers: z.object({ reed: appraisalSchema, cloud: appraisalSchema, mist: appraisalSchema }),
  completed: z.boolean(), mistakes: z.number().int().min(0), reducedMotion: z.boolean(),
});
export type AdventureSave = z.infer<typeof adventureSchema>;
export type AdventureState = AdventureSave & { ready: boolean; feedback: string; feedbackKind: "info" | "error" | "success"; storageIssue: string | null };
const emptyDossier = () => ({ slots: { environment: null, permission: null, maintenance: null }, verdict: null });
export function initialAdventure(): AdventureState {
  return { version: 1, character: null, view: "choose", variant: 0, activeProject: "reed", tab: "requirements", inspected: [], collected: [], selectedFact: null,
    dossiers: { reed: emptyDossier(), cloud: emptyDossier(), mist: emptyDossier() }, completed: false, mistakes: 0, reducedMotion: false,
    ready: false, feedback: "先选一位同行的少侠。三位角色的课程和难度相同。", feedbackKind: "info", storageIssue: null };
}
export function allAppraised(state: AdventureSave) {
  return projectIds.every(id => state.dossiers[id].verdict === getProjects(state.variant).find(p => p.id === id)?.verdict && categories.every(category => {
    const fact = getProjects(state.variant).find(p => p.id === id)?.facts.find(f => f.id === state.dossiers[id].slots[category]);
    return fact?.category === category && state.collected.includes(fact.id) && state.inspected.includes(fact.id);
  }));
}
// Imported saves are local practice records, never external verification. Validate references and dependencies too.
export function parseAdventure(input: unknown): AdventureSave | null {
  const result = adventureSchema.safeParse(input);
  if (!result.success) return null;
  const state = result.data;
  const facts = getProjects(state.variant).flatMap(p => p.facts);
  const validIds = new Set(facts.map(f => f.id));
  if ([...state.inspected, ...state.collected].some(id => !validIds.has(id))) return null;
  if (new Set(state.collected).size !== state.collected.length || new Set(state.inspected).size !== state.inspected.length) return null;
  if (state.collected.some(id => !state.inspected.includes(id))) return null;
  if (state.selectedFact && !state.collected.includes(state.selectedFact)) return null;
  if (state.view !== "choose" && !state.character) return null;
  for (const project of getProjects(state.variant)) {
    const record = state.dossiers[project.id];
    for (const category of categories) {
      const id = record.slots[category];
      if (id && (!state.collected.includes(id) || !project.facts.some(f => f.id === id && f.category === category))) return null;
    }
    if (record.verdict && (record.verdict !== project.verdict || categories.some(c => !record.slots[c]))) return null;
  }
  if (state.completed && !allAppraised(state)) return null;
  if (["ending", "pavilion"].includes(state.view) && !state.completed) return null;
  return state;
}

export type AdventureAction =
  | { type: "hydrate"; save: AdventureSave | null; issue?: string }
  | { type: "character"; id: CharacterId }
  | { type: "navigate"; view: AdventureSave["view"] }
  | { type: "inspect"; project: ProjectId; tab: DossierTab }
  | { type: "collect"; factId: string }
  | { type: "attach"; category: Category }
  | { type: "verdict"; verdict: Verdict }
  | { type: "deliver"; project: ProjectId }
  | { type: "motion"; reduced: boolean }
  | { type: "new-round" }
  | { type: "reset" }
  | { type: "storage-error"; message: string };

function info(state: AdventureState, feedback: string, feedbackKind: AdventureState["feedbackKind"] = "info"): AdventureState {
  return { ...state, feedback, feedbackKind, mistakes: state.mistakes + (feedbackKind === "error" ? 1 : 0) };
}
export function adventureReducer(state: AdventureState, action: AdventureAction): AdventureState {
  if (action.type === "hydrate") return { ...initialAdventure(), ...(action.save ?? {}), ready: true, storageIssue: action.issue ?? null, feedback: action.issue ?? (action.save ? "已恢复本地样板进度。" : "先选一位同行的少侠。") };
  if (action.type === "reset") return { ...initialAdventure(), ready: true };
  if (action.type === "storage-error") return { ...state, storageIssue: action.message };
  if (action.type === "motion") return { ...state, reducedMotion: action.reduced };
  if (action.type === "character") return info({ ...state, character: action.id }, "角色已选定。身份不会影响课程和难度。");
  if (action.type === "navigate") {
    if (!state.character && action.view !== "choose") return info(state, "先选择角色，再踏入江湖。", "error");
    if (["pavilion", "ending"].includes(action.view) && !state.completed) return info(state, "迷雾未散：完成三卷鉴定并交付推荐，才能解锁飞鸽台。", "error");
    return info({ ...state, view: action.view, selectedFact: null }, action.view === "market" ? "点击一份卷轴，开始查阅证据。" : "沿地图路标继续你的历练。");
  }
  if (action.type === "new-round") {
    if (!state.completed) return state;
    return { ...initialAdventure(), ready: true, character: state.character, variant: state.variant === 0 ? 1 : 0, view: "market", reducedMotion: state.reducedMotion, feedback: "委托条件相同，但两份卷轴的运行要求变了。请重新查证。", storageIssue: state.storageIssue };
  }
  if (state.view !== "market" || !state.character || state.completed) return state;
  const projects = getProjects(state.variant);
  const active = projects.find(p => p.id === state.activeProject)!;
  if (action.type === "inspect") {
    const fact = projects.find(p => p.id === action.project)?.facts.find(f => f.tab === action.tab);
    if (!fact) return state;
    return info({ ...state, activeProject: action.project, tab: action.tab, selectedFact: null, inspected: [...new Set([...state.inspected, fact.id])] }, "读资料，找到可以支持鉴定的证据。");
  }
  if (action.type === "collect") {
    const fact = active.facts.find(f => f.id === action.factId);
    if (!fact || !state.inspected.includes(fact.id)) return info(state, "请先查阅这份资料，再收集证据。", "error");
    return info({ ...state, collected: [...new Set([...state.collected, fact.id])], selectedFact: fact.id }, `已选中「${fact.title}」。请放入下方对应证据栏。`);
  }
  if (action.type === "attach") {
    const fact = active.facts.find(f => f.id === state.selectedFact);
    if (!fact) return info(state, "先在资料中选中一条证据。", "error");
    if (fact.category === null) return info(state, "Stars 反映关注度，不能证明环境适配、使用许可或维护情况。请查阅对应资料。", "error");
    if (fact.category !== action.category) return info(state, "这条证据回答的不是这个问题。运行要求查 Requirements，使用条件查 License，维护线索查 Releases。", "error");
    const record = state.dossiers[state.activeProject];
    return info({ ...state, selectedFact: null, dossiers: { ...state.dossiers, [state.activeProject]: { ...record, slots: { ...record.slots, [action.category]: fact.id } } } }, "证据归位。下一条也要有出处。", "success");
  }
  if (action.type === "verdict") {
    const record = state.dossiers[state.activeProject];
    if (categories.some(c => !record.slots[c])) return info(state, "证据尚未齐全。先完成运行环境、使用条件、维护线索三个栏位。", "error");
    if (action.verdict !== active.verdict) return info(state, active.explanation, "error");
    return info({ ...state, dossiers: { ...state.dossiers, [state.activeProject]: { ...record, verdict: action.verdict } } }, `「${active.name}」鉴定成立。${active.explanation}`, "success");
  }
  if (action.type === "deliver") {
    if (!allAppraised(state)) return info(state, "三份卷轴还未全部完成有证据的鉴定。请继续查阅。", "error");
    if (projects.find(p => p.id === action.project)?.verdict !== "suitable") return info(state, "请交付符合委托条件的卷轴，而不是仅仅热门或资料不全的卷轴。", "error");
    return info({ ...state, completed: true, view: "ending" }, "鉴宝完成，通往飞鸽台的迷雾散开了。", "success");
  }
  return state;
}
