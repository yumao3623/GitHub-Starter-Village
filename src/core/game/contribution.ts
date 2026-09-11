import { z } from "zod";

export const originalReadme = "# 江湖夜行图\n安全入口：北门\n路线：沿溪水前往客栈。";
export const fixedReadme = originalReadme.replace("北门", "南门");
export const reviewedReadme = `${fixedReadme}\n夜间请结伴通行。`;
const operations = ["inspect-issues", "issue", "fetch", "pull", "remote-push", "branch", "edit", "diff", "stage", "commit", "push", "compare", "pr", "ready", "review", "resolve", "approve", "conflict", "run", "step", "logs", "changelog", "merge", "release", "delete"] as const;
export const chainEventSchema = z.object({ op: z.enum(operations), value: z.string().max(3000).default(""), extra: z.string().max(3000).default("") });
export type ChainEvent = z.infer<typeof chainEventSchema>;
export const chainSaveSchema = z.object({
  version: z.literal(1), active: z.boolean(), chapter: z.number().int().min(7).max(12),
  events: z.array(chainEventSchema).max(500), drafts: z.record(z.string(), z.string().max(3000)),
  mistakes: z.number().int().nonnegative(), archives: z.array(z.array(chainEventSchema).max(500)).max(3),
});
export type ChainSave = z.infer<typeof chainSaveSchema>;
export const freshChain = (): ChainSave => ({ version: 1, active: false, chapter: 7, events: [], drafts: {}, mistakes: 0, archives: [] });
export type ChainModel = {
  inspected: boolean; issue: { title: string; body: string } | null;
  fetched: number; local: number; origin: number; upstream: number;
  branch: string; readme: string; diff: string | null; staged: string | null;
  commits: Array<{ sha: string; readme: string; message: string }>; pushed: number;
  compared: boolean; pr: "none" | "draft" | "ready"; reviewed: boolean; resolved: boolean; approved: boolean;
  conflict: string | null; status: "idle" | "running" | "failed" | "passed"; step: number; runs: number; logs: boolean;
  changelog: string; merged: boolean; release: { tag: string; notes: string } | null; deleted: boolean;
};
export function initialChainModel(): ChainModel {
  return { inspected: false, issue: null, fetched: 0, local: 0, origin: 0, upstream: 1, branch: "main", readme: originalReadme, diff: null, staged: null, commits: [], pushed: 0, compared: false, pr: "none", reviewed: false, resolved: false, approved: false, conflict: null, status: "idle", step: 0, runs: 0, logs: false, changelog: "", merged: false, release: null, deleted: false };
}
export function chainCompleted(m: ChainModel): number[] {
  return [m.issue ? 7 : 0, m.issue && m.local === 1 && m.origin === 1 ? 8 : 0,
    m.pushed >= 1 ? 9 : 0, m.pr === "ready" ? 10 : 0,
    m.approved && m.conflict ? 11 : 0, m.release && m.deleted ? 12 : 0].filter(Boolean);
}
export function eventChapter(m: ChainModel, op: ChainEvent["op"]) {
  if (["inspect-issues", "issue"].includes(op)) return 7;
  if (["fetch", "pull", "remote-push"].includes(op)) return 8;
  if (["compare", "pr", "ready"].includes(op)) return 10;
  if (["review", "resolve", "approve", "conflict"].includes(op)) return 11;
  if (["run", "step", "logs", "changelog", "merge", "release", "delete"].includes(op)) return 12;
  return m.pr === "ready" ? 11 : 9;
}
type Result = { model: ChainModel; kind: "error" | "success" | "info"; message: string; changed: boolean };
// Pure domain transition. No caller-supplied correctness/completion flags; no shell or network.
export function applyChainEvent(model: ChainModel, event: ChainEvent): Result {
  const m: ChainModel = { ...model, commits: [...model.commits] };
  const fail = (message: string): Result => ({ model, kind: "error", message, changed: false });
  const repeat = (message = "这项操作已经完成，状态没有重复改变。可继续下一步。"): Result => ({ model, kind: "info", message, changed: false });
  const ok = (message: string): Result => ({ model: m, kind: "success", message, changed: true });
  const chapter = eventChapter(model, event.op);
  if (chapter > 7 && !chainCompleted(model).includes(chapter - 1)) return fail("先完成前一章的交付物，再操作本场景。不能越过地图依赖。");
  const { value, extra } = event;
  switch (event.op) {
    case "inspect-issues": if (m.inspected) return repeat(); m.inspected = true; return ok("已搜索已有 Issue：#12 是桥梁问题，与本次入口文字错误不同，不应标 duplicate。");
    case "issue": {
      if (m.issue) return repeat("Issue #13 已存在，不重复创建相同问题。");
      if (!m.inspected) return fail("先搜索已有 Issue，避免重复报告。");
      const [actual, expected, label] = extra.split("\n---\n");
      if (value.trim().length < 5 || !actual?.includes("北门") || !expected?.includes("南门") || label !== "bug") return fail("标题应具体；实际结果写北门、期望结果写南门。这是 bug，而不是 enhancement；先完善报告再提交。");
      m.issue = { title: value.trim(), body: extra }; return ok("Issue #13 已建立：Open · bug。它讨论问题，还没有修改代码。");
    }
    case "fetch": if (value !== "upstream") return fail("任务是取得上游的新提交。origin 当前仍旧，请选 upstream。"); if (m.fetched === 1) return repeat(); m.fetched = 1; return ok("Fetch 更新了远端跟踪记录；本地工作分支仍在旧提交。");
    case "pull": if (!m.fetched) return fail("请先 Fetch 并观察远端记录，再进行本练习的整合。真实 git pull 自身会先 fetch。"); if (value !== "upstream") return fail("origin 没有新提交；整合的是 upstream/main。"); if (m.local === 1) return repeat(); m.local = 1; return ok("Pull 整合上游 main，本地前进到 u1；origin 还未改变。");
    case "remote-push": if (value !== "origin") return fail("你没有向上游直接写入的权限。请 Push 到自己的 origin。"); if (!m.local) return fail("本地尚未整合 u1，先 Fetch/Pull。"); if (m.origin === 1) return repeat(); m.origin = 1; return ok("origin/main 收到 u1。三处位置同步，接下来建立修复分支。");
    case "branch": if (m.branch !== "main") return repeat(); if (!/^fix\/[a-z0-9-]{3,40}$/.test(value)) return fail("请输入独立修复分支名，例如 fix/south-gate。不能直接修改 main。"); m.branch = value; return ok(`已创建并切换到 ${value}；main 仍保持原样。`);
    case "edit": if (m.branch === "main" || m.merged) return fail("先在修复分支编辑，不直接改变 main 或已合并分支。"); if (m.readme === value) return repeat(); m.readme = value; m.diff = null; m.approved = false; m.resolved = false; return ok("工作区已修改。已暂存的快照不会自动更新，请重新查看 Diff 和 Stage。");
    case "diff": if (m.branch === "main") return fail("先创建修复分支并修改文件。"); if (m.diff === m.readme) return repeat(); m.diff = m.readme; return ok("Diff 已检查。红色是删除、绿色是新增；请只暂存相关文件。");
    case "stage": if (value !== "README.md") return fail("notes.txt 是无关便条，不属于这个 Issue。仅暂存 README.md。"); if (m.diff !== m.readme) return fail("当前内容尚未查看 Diff。编辑后需要重新检查。"); if (m.staged === m.readme) return repeat(); m.staged = m.readme; return ok("README.md 的当前快照进入暂存区；notes.txt 留在工作区。");
    case "commit": {
      if (!m.staged) return fail("暂存区为空；先 Stage README.md。Commit 不会自动包含所有修改。");
      if (m.staged !== fixedReadme && m.staged !== reviewedReadme) return fail("暂存内容必须修正南门，并保留标题和路线。请根据 Diff 修复，不要删除无关说明。");
      if (value.trim().length < 8) return fail("提交说明至少 8 个字符，写清修复意图。长度检查只检查格式，不代表自动理解语义。");
      if (m.commits.at(-1)?.readme === m.staged) return repeat("没有新的暂存差异，不能制造重复 Commit。");
      m.commits.push({ sha: `c${m.commits.length + 1}`, readme: m.staged, message: value.trim() }); m.staged = null; m.status = "idle";
      return ok("已建立本地 Commit。origin 尚未收到它，需要 Push。");
    }
    case "push": if (value !== "origin") return fail("请推送到自己的 origin 修复分支，不是 upstream/main。"); if (!m.commits.length) return fail("还没有 Commit，不能把未提交工作区当作提交上传。"); if (m.pushed === m.commits.length) return repeat(); m.pushed = m.commits.length; m.status = "idle"; return ok(`origin/${m.branch} 已收到 ${m.commits.at(-1)?.sha}。`);
    case "compare": if (value !== "village/nightwalk-map:main" || extra !== `learner/nightwalk-map:${m.branch}`) return fail("Base 是接收方 village/main；Head 是 learner Fork 的修复分支。不要反向合并。"); if (m.compared) return repeat(); m.compared = true; return ok("比较方向正确：将 learner 修复分支的差异提议合入 village/main（教学模拟）。");
    case "pr": if (!m.compared) return fail("先确认 base/head 并查看 Compare changes。"); if (m.pr !== "none") return repeat(); m.pr = "draft"; return ok("Draft PR #14 已创建。它是合并变更提案，不是已经 Merge。");
    case "ready": if (m.pr === "none") return fail("先创建 Draft PR。"); if (m.pr === "ready") return repeat(); m.pr = "ready"; return ok("Ready for review：维护者可以开始审阅，来源提交保持可追踪。");
    case "review": if (m.reviewed) return repeat(); m.reviewed = true; return ok("维护者 Request changes：请增加‘夜间请结伴通行。’，之后 Commit、Push 再回应。");
    case "resolve": if (!m.reviewed || m.commits[m.pushed - 1]?.readme !== reviewedReadme) return fail("先阅读 Review，补充夜间说明并 Stage、Commit、Push；不能只关闭讨论。"); if (m.resolved) return repeat(); m.resolved = true; return ok("Resolve conversation 记录此讨论已处理，不等于批准或检查通过。");
    case "approve": if (!m.resolved) return fail("先完成修改并解决讨论，再请求维护者复查。"); if (m.approved) return repeat(); m.approved = true; return ok("模拟维护者复查后 Approve。玩家并没有批准自己的 PR。");
    case "conflict": if (!value.includes("南门") || !value.includes("18:00") || /[<>]{3}/.test(value)) return fail("两边分别修了入口与开放时间。保留南门与 18:00，移除冲突标记，不盲目覆盖其中一侧。"); if (m.conflict) return repeat(); m.conflict = value; return ok("冲突练习保留了双方意图。此独立练习不改写主线 PR 的文件。");
    case "run": if (m.status === "running") return repeat("Workflow 正在执行，继续查看下一 Step。"); if (m.status === "passed") return repeat(); m.status = "running"; m.step = 0; m.runs++; return ok(`Workflow run #${m.runs} 开始，Job: validate。`);
    case "step": if (m.status !== "running") return fail("先启动 Workflow run；终态检查不能凭点击改成 Passed。"); m.step++; if (m.step === 3) { m.status = m.changelog.length >= 12 ? "passed" : "failed"; return ok(m.status === "passed" ? "三个 Step 通过：Checks Passed，可以由维护者决定 Merge。" : "检查 Failed：release-note Step 缺少 Changelog。打开日志定位原因。"); } return ok(`Step ${m.step} 已通过，下一项继续执行。`);
    case "logs": if (m.status !== "failed") return fail("本轮还没有失败日志；先执行检查。"); if (m.logs) return repeat(); m.logs = true; return ok("日志：release-note failed — 缺少变更说明。修复 Changelog 后重新运行。");
    case "changelog": if (!m.logs) return fail("先查看失败日志，再修复对应问题。"); if (value.trim().length < 12 || !value.includes("南门")) return fail("变更说明需至少 12 个字符，并交代南门修复。本模拟只检查这一明确约束。"); if (m.changelog === value) return repeat(); m.changelog = value; return ok("已补齐发布记录。此模拟检查读取发布草稿；真实项目修改文件需要另行 Commit/Push。");
    case "merge": if (m.merged) return repeat(); if (!m.approved || m.status !== "passed" || m.pushed !== m.commits.length || m.readme !== m.commits.at(-1)?.readme) return fail("合并前需维护者批准、最新提交 Checks 通过、没有未推送或未提交改动。"); m.merged = true; return ok("模拟维护者 Merge 完成，目标 main 收到已审阅的变更。");
    case "release": if (!m.merged) return fail("先完成 Merge 再发布本练习版本。"); if (m.release) return repeat(); if (!/^v\d+\.\d+\.\d+$/.test(value) || extra.trim().length < 12) return fail("Tag 使用 v1.0.1 这类版本格式，并填写至少 12 字符的发布说明。"); m.release = { tag: value, notes: extra }; return ok("Release 已关联合并后的版本，附带发布说明。Tag 与 Release 不是同一概念。");
    case "delete": if (!m.merged) return fail("先合并再删除来源分支，不要丢失尚未交付的工作。"); if (m.deleted) return repeat(); m.deleted = true; return ok("来源分支已删除，已合并的提交仍在历史中。贡献链完成。");
  }
}
export function replayChain(events: ChainEvent[]): ChainModel | null {
  let m = initialChainModel();
  for (const event of events) { const result = applyChainEvent(m, event); if (!result.changed) return null; m = result.model; }
  return m;
}
export function validChain(save: ChainSave) {
  const model = replayChain(save.events);
  return model && (save.chapter === 7 || chainCompleted(model).includes(save.chapter - 1)) && save.archives.every(events => replayChain(events));
}
