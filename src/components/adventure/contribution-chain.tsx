"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CharacterArt } from "./character-art";
import { contributionByChapter } from "@/content/minigames/contribution-lessons";
import { chainCompleted, originalReadme, replayChain, type ChainEvent, type ChainModel } from "@/core/game/contribution";
import type { AdventureAction, AdventureState } from "@/core/game/adventure";
import { vocabularyById } from "@/content/vocabulary/zh-CN";

type DeskProps = {
  m: ChainModel; draft: (key: string, fallback?: string) => string;
  set: (key: string, value: string) => void; act: (op: ChainEvent["op"], value?: string, extra?: string) => void;
};
function FileDesk({ m, draft, set, act }: DeskProps) {
  return <div className="file-desk">
    <div className="branch-strip"><span>main · u1</span><span>→ {m.branch}</span><span>origin · {m.pushed ? `c${m.pushed}` : "未推送"}</span></div>
    <label>README.md · Working directory 工作区<textarea aria-label="README 工作区" rows={5} value={draft("readme", m.readme)} onChange={e => set("readme", e.target.value)} /></label>
    <div className="scene-actions"><Button onClick={() => act("edit", draft("readme", m.readme))}>保存工作区修改</Button><Button variant="secondary" onClick={() => act("diff")}>查看 Diff</Button></div>
    {m.diff !== null && <><p>对照最新本地提交与已查看的工作区快照；Commit 后两边一致是正常的。</p><div className="diff-view" aria-label="文件差异"><div><strong>最新提交内容</strong><pre>{m.commits.at(-1)?.readme ?? originalReadme}</pre></div><div><strong>工作区快照</strong><pre>{m.diff}</pre></div></div></>}
    <div className="stage-tray"><div><h3>Changes · 待暂存</h3><Button variant="secondary" onClick={() => act("stage", "README.md")}>Stage README.md</Button><Button variant="secondary" onClick={() => act("stage", "notes.txt")}>Stage notes.txt（无关便条）</Button></div><div><h3>Staged changes · 暂存快照</h3><pre>{m.staged ?? "暂存区为空"}</pre></div></div>
    <label>Commit message · 提交说明<input value={draft("commit-message")} onChange={e => set("commit-message", e.target.value)} /></label>
    <div className="scene-actions"><Button onClick={() => act("commit", draft("commit-message"))}>Commit 暂存快照</Button><Button variant="secondary" onClick={() => act("push", "origin")}>Push 修复分支</Button></div>
    <ol className="commit-history" aria-label="提交历史">{m.commits.map(commit => <li key={commit.sha}><b>{commit.sha}</b> {commit.message} <small>{m.commits.indexOf(commit) < m.pushed ? "已抵达 origin" : "仅本地"}</small></li>)}</ol>
  </div>;
}
function IssueDesk({ m, draft, set, act }: DeskProps) {
  return <div className="issue-desk"><div className="notice-board"><h3>旅人手记</h3><p>打开 README → 阅读安全入口：实际显示「北门」，但夜行地图指向「南门」。</p><Button variant="secondary" onClick={() => act("inspect-issues")}>Search 已有 Issues</Button>{m.inspected && <p>#12：木桥栏杆松动 · Open（不是重复问题）</p>}</div>
    <label>Title · 议题标题<input value={draft("issue-title")} onChange={e => set("issue-title", e.target.value)} /></label>
    <label>实际结果<textarea rows={2} value={draft("actual")} onChange={e => set("actual", e.target.value)} /></label>
    <label>期望结果<textarea rows={2} value={draft("expected")} onChange={e => set("expected", e.target.value)} /></label>
    <label>Label · 标签建议<select value={draft("label", "")} onChange={e => set("label", e.target.value)}><option value="">选择标签</option><option>bug</option><option>enhancement</option><option>duplicate</option></select></label>
    <Button onClick={() => act("issue", draft("issue-title"), [draft("actual"), draft("expected"), draft("label")].join("\n---\n"))}>Submit new issue</Button>
    {m.issue && <article className="scene-artifact"><h3>Issue #13 · Open · bug</h3><strong>{m.issue.title}</strong><pre>{m.issue.body.split("\n---\n").slice(0,2).join("\n→\n")}</pre><p>Assignee：青砚（模拟维护者） · Milestone：夜行图修订</p></article>}
  </div>;
}
function RemoteDesk({ m, draft, set, act }: DeskProps) {
  const [mode, setMode] = useState("graphic");
  return <div><div className="scene-actions"><Button variant="secondary" onClick={() => setMode("graphic")}>图形路线</Button><Button variant="secondary" onClick={() => setMode("command")}>命令对照</Button></div>
    <div className="postal-stations">{[["Local 本地",m.local],["origin 我的 Fork",m.origin],["upstream 原项目",m.upstream]].map(([name, rev]) => <article key={name} className="postal-station"><span className="station-icon">驿</span><h3>{name}</h3><div key={rev} className="commit-parcel">main → u{rev}</div></article>)}</div>
    <p>远端跟踪记录 upstream/main → u{m.fetched}。Fetch 只更新这个记录，不直接改变本地 main。</p>
    <label>目标远端<select value={draft("remote", "origin")} onChange={e => set("remote", e.target.value)}><option>origin</option><option>upstream</option></select></label>
    <div className="scene-actions"><Button onClick={() => act("fetch", draft("remote", "origin"))}>Fetch 取信</Button><Button onClick={() => act("pull", draft("remote", "origin"))}>Pull 整合</Button><Button onClick={() => act("remote-push", draft("remote", "origin"))}>Push 送信</Button></div>
    {mode === "command" && <pre className="command-slip">git fetch upstream{"\n"}git pull --ff-only upstream main{"\n"}git push origin main{"\n"}# 仅命令对照，不执行电脑上的 Git</pre>}
    <p>Desktop 提示：Fetch origin / Pull origin 对应当前 origin。毕业练习无需给上游配置写权限；上游同步遇到冲突时停下检查，不使用 force push。</p>
  </div>;
}
function PullRequestDesk({ m, draft, set, act }: DeskProps) {
  return <div><div className="pr-lecterns"><label>Base · 接收方<select value={draft("base", "")} onChange={e => set("base", e.target.value)}><option value="">选择目标仓库与分支</option><option value="village/nightwalk-map:main">village/nightwalk-map : main</option><option value={`learner/nightwalk-map:${m.branch}`}>learner/nightwalk-map : {m.branch}</option></select></label><span aria-hidden>←</span><label>Head / Compare · 来源<select value={draft("head", "")} onChange={e => set("head", e.target.value)}><option value="">选择来源仓库与分支</option><option value="village/nightwalk-map:main">village/nightwalk-map : main</option><option value={`learner/nightwalk-map:${m.branch}`}>learner/nightwalk-map : {m.branch}</option></select></label></div>
    <Button onClick={() => act("compare", draft("base"), draft("head"))}>Compare changes</Button>
    {m.compared && <article className="scene-artifact"><h3>Files changed · README.md</h3><pre>{m.commits[m.pushed - 1]?.readme}</pre><p>Commits：{m.pushed} · 关联 Issue #13</p></article>}
    <div className="scene-actions"><Button onClick={() => act("pr")}>Create draft pull request</Button><Button variant="secondary" onClick={() => act("ready")}>Ready for review</Button></div><p>PR #14：{m.pr === "none" ? "尚未创建" : m.pr === "draft" ? "Draft · 草稿" : "Ready for review · 待审阅"}</p>
  </div>;
}
function ReviewDesk(props: DeskProps) {
  const { m, draft, set, act } = props;
  return <div><Button onClick={() => act("review")}>打开 Review</Button>{m.reviewed && <blockquote className="review-comment"><strong>青砚 · Request changes</strong><p>请在文末增加：夜间请结伴通行。</p></blockquote>}
    <FileDesk {...props}/><div className="scene-actions"><Button onClick={() => act("resolve")}>Resolve conversation</Button><Button variant="secondary" onClick={() => act("approve")}>请求维护者复查</Button></div><p>讨论：{m.resolved ? "Resolved" : "未解决"} · 审阅：{m.approved ? "Approve（NPC 模拟）" : "等待修改"}</p>
    <div className="conflict-lab"><h3>Merge conflict · 独立冲突练习</h3><div className="diff-view"><pre>你的变更：安全入口：南门</pre><pre>另一方变更：北门，18:00 开放</pre></div><label>编辑合并结果<input value={draft("conflict")} onChange={e => set("conflict", e.target.value)} /></label><Button onClick={() => act("conflict", draft("conflict"))}>保存冲突处理结果</Button>{m.conflict && <p>保留的双方意图：{m.conflict}</p>}</div>
  </div>;
}
function ChecksDesk({ m, draft, set, act }: DeskProps) {
  return <div><p>Workflow：nightwalk-validation · Run #{m.runs} · Job：validate</p><div className="forge-steps">{["文件完整性","路线测试","release-note"].map((name,i) => <article key={name} data-step-state={m.step > i ? (i === 2 && m.status === "failed" ? "failed" : "passed") : m.status === "running" && m.step === i ? "running" : "pending"}><span>炉 {i+1}</span><h3>{name}</h3><p>{m.step > i ? (i === 2 && m.status === "failed" ? "Failed" : "Passed") : "待执行"}</p></article>)}</div>
    <div className="scene-actions"><Button onClick={() => act("run")}>Run workflow / Re-run</Button><Button onClick={() => act("step")}>执行下一 Step</Button><Button variant="secondary" onClick={() => act("logs")}>查看失败日志</Button></div><p className="checks-result">Checks：{m.status}</p>
    {m.logs && <pre className="failure-log">release-note failed: missing changelog{"\n"}请修复发布草稿，再重新运行。</pre>}
    <label>Changelog · 发布草稿<textarea rows={2} value={draft("changelog")} onChange={e => set("changelog", e.target.value)} /></label><Button variant="secondary" onClick={() => act("changelog", draft("changelog"))}>保存发布草稿</Button>
    <div className="scene-actions"><Button onClick={() => act("merge")}>Merge pull request（模拟维护者）</Button></div><p>目标 main：{m.merged ? m.commits.at(-1)?.sha : "u1"} · {m.merged ? "Merged" : "尚未合并"}</p>
    <label>Tag · 版本标签<input value={draft("tag")} onChange={e => set("tag", e.target.value)} placeholder="v1.0.1"/></label>
    <label>Release notes · 发布说明<textarea rows={2} value={draft("release-notes")} onChange={e => set("release-notes", e.target.value)} /></label>
    <div className="scene-actions"><Button onClick={() => act("release", draft("tag"), draft("release-notes"))}>Publish release（模拟）</Button><Button variant="secondary" onClick={() => act("delete")}>Delete branch</Button></div>
    {m.release && <article className="scene-artifact"><h3>Release {m.release.tag}</h3><p>{m.release.notes}</p><p>来源分支：{m.deleted ? "已删除 · 历史保留" : "仍保留"}</p></article>}
  </div>;
}
export function ContributionChain({ state, dispatch, openBook }: { state: AdventureState; dispatch: React.Dispatch<AdventureAction>; openBook: (termId?: string) => void }) {
  const sim = state.journey.simulation;
  const m = replayChain(sim.events)!;
  const lesson = contributionByChapter(sim.chapter);
  const done = chainCompleted(m);
  const [reset, setReset] = useState(false);
  const draft = (key: string, fallback = "") => sim.drafts[key] ?? fallback;
  const set = (key: string, value: string) => dispatch({ type: "chain-draft", key, value });
  const act = (op: ChainEvent["op"], value = "", extra = "") => dispatch({ type: "chain-event", event: { op, value, extra } });
  const props = { m, draft, set, act };
  return <section className="chain-scene" data-chapter={sim.chapter}>
    <header className="chain-header"><div><span className="seal-small">第 {sim.chapter} 章 · {lesson.place}</span><h1>{lesson.title}</h1><p>{lesson.objective}</p></div><Button variant="secondary" onClick={() => dispatch({ type: "navigate", view: "map" })}>返回江湖地图</Button></header>
    <div className="chain-layout"><aside className="chain-story"><div className="scene-panorama" style={{ backgroundPosition: `${((sim.chapter - 7) % 3) * 50}% ${sim.chapter < 10 ? 0 : 100}%` }} aria-hidden/>{state.character && <CharacterArt id={state.character} pose="standing" className="chain-hero"/>}<div className="story-scroll"><strong>青砚的来信</strong><p>{lesson.story}</p><small>原创教学模拟 · 不操作真实仓库</small></div><nav aria-label="贡献链地点">{[7,8,9,10,11,12].map(chapter => <Button key={chapter} variant={chapter === sim.chapter ? "default" : "secondary"} aria-disabled={chapter > 7 && !done.includes(chapter - 1)} onClick={() => dispatch({ type: "contribution-enter", chapter })}>{chapter} · {contributionByChapter(chapter).place}{done.includes(chapter) ? " ✓" : ""}</Button>)}</nav></aside>
    <section className="chain-workbench" aria-label={lesson.place}>
      <div className={`chain-feedback ${state.feedbackKind}`} role="status">{state.feedback}</div>
      {sim.chapter === 7 ? <IssueDesk {...props}/> : sim.chapter === 8 ? <RemoteDesk {...props}/> : sim.chapter === 9 ? <><label>Create branch · 修复分支名<input value={draft("branch")} onChange={e => set("branch", e.target.value)} placeholder="fix/south-gate"/></label><Button onClick={() => act("branch", draft("branch"))}>创建并切换 Branch</Button><FileDesk {...props}/></> : sim.chapter === 10 ? <PullRequestDesk {...props}/> : sim.chapter === 11 ? <ReviewDesk {...props}/> : <ChecksDesk {...props}/>}
      {done.includes(sim.chapter) && <section className="chain-success"><strong>第 {sim.chapter} 章交付完成</strong><p>操作记录已保存。重复点击不会重复创建交付物。</p>{sim.chapter < 12 ? <Button onClick={() => dispatch({ type: "contribution-enter", chapter: sim.chapter + 1 })}>前往第 {sim.chapter + 1} 章</Button> : <Link href="/field-practice/">前往自己的 Fork 完成真实实践 →</Link>}</section>}
      <details className="chain-notes"><summary>武林宝典 · 本场景英文与使用边界</summary>{lesson.notes.map(note => <p key={note}>{note}</p>)}<div className="scene-actions">{lesson.termIds.map(termId => <Button key={termId} variant="ghost" onClick={() => openBook(termId)}>{vocabularyById.get(termId)?.english} · {vocabularyById.get(termId)?.chinese}</Button>)}</div><a href={lesson.sourceUrl} target="_blank" rel="noreferrer">官方依据 · 核验于 {lesson.lastVerifiedAt}</a>{lesson.commands.length > 0 && <pre>{lesson.commands.join("\n")}</pre>}</details>
      <p className="chain-footnote">本轮有效操作 {sim.events.length} 次，错误尝试 {sim.mistakes} 次。不是能力认证，不增加旧版 P0 掌握率。</p>
      <Button variant="ghost" onClick={() => setReset(true)}>重新练习整条贡献链</Button>{reset && <div role="group" aria-label="确认重新练习"><p>归档当前链路并重新从第 7 章开始；鉴宝与角色不变。</p><Button onClick={() => { dispatch({ type: "chain-restart" }); setReset(false); }}>确认重新练习</Button><Button variant="secondary" onClick={() => setReset(false)}>取消</Button></div>}
    </section></div>
  </section>;
}
