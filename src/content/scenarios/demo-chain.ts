import { fixedReadme, reviewedReadme, type ChainEvent } from "@/core/game/contribution";
export const event = (op: ChainEvent["op"], value = "", extra = ""): ChainEvent => ({ op, value, extra });
// Disclosed recording fixtures. Replayed through the same rules as a learner;
// no fabricated completion flags and no reads of browser storage.
export const chapterEvents: Record<number, ChainEvent[]> = {
  7: [event("inspect-issues"), event("issue", "修复南门入口标记", "README 写成北门\n---\n应当显示南门\n---\nbug")],
  8: [event("fetch", "upstream"), event("pull", "upstream"), event("remote-push", "origin")],
  9: [event("branch", "fix/south-gate"), event("edit", fixedReadme), event("diff"), event("stage", "README.md"), event("commit", "fix: correct south gate label"), event("push", "origin")],
  10: [event("compare", "village/nightwalk-map:main", "learner/nightwalk-map:fix/south-gate"), event("pr"), event("ready")],
  11: [event("review"), event("edit", reviewedReadme), event("diff"), event("stage", "README.md"), event("commit", "docs: explain night route safety"), event("push", "origin"), event("resolve"), event("approve"), event("conflict", "安全入口：南门，18:00 开放")],
  12: [event("run"), event("step"), event("step"), event("step"), event("logs"), event("changelog", "修复南门入口标记，并补充夜间通行的安全提示。"), event("run"), event("step"), event("step"), event("step"), event("merge"), event("release", "v1.0.1", "修复南门标记并补充夜间结伴通行说明。"), event("delete")],
};
