import { useRef, useEffect, useState } from "react";
import { X, ArrowSquareOut } from "@phosphor-icons/react";
import { vocabulary } from "@/content/vocabulary/zh-CN";
import { learningEvidence } from "@/core/mastery/adventure-evidence";
import type { AdventureState, AdventureAction } from "@/core/game/adventure";
import { Button } from "@/components/ui/button";

const topicNames: Record<string, string> = { concept: "技术概念", navigation: "页面导航", action: "操作", status: "状态", permission: "权限", security: "安全", "git-command": "Git 命令", file: "文件", community: "社区" };
export function Handbook({ termId, close, state, dispatch }: { termId?: string; close: () => void; state: AdventureState; dispatch: React.Dispatch<AdventureAction> }) {
  const [search, setSearch] = useState(termId ? vocabulary.find(term => term.id === termId)?.english ?? "" : "");
  const [filter, setFilter] = useState("all");
  const [topic, setTopic] = useState("all");
  const input = useRef<HTMLInputElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { dialog.current?.showModal(); input.current?.focus(); }, []);
  function dismiss() { dialog.current?.close(); close(); }
  const terms = vocabulary.filter(term => {
    const evidence = learningEvidence(state, term.id);
    return `${term.english} ${term.chinese}`.toLowerCase().includes(search.trim().toLowerCase()) && (topic === "all" || term.kind === topic) &&
      (filter === "all" || (filter === "scene" && evidence.supported) || (filter === "bookmarks" && state.journey.bookmarks.includes(term.id)) || (filter === "review" && evidence.practiced.length > 0 && evidence.assessed.length === 0));
  });
  return <dialog ref={dialog} className="handbook" aria-labelledby="handbook-title" onCancel={event => { event.preventDefault(); dismiss(); }}>
    <div className="handbook-header"><div><small>随身查阅，不限进度</small><h2 id="handbook-title">武林宝典</h2></div><Button variant="ghost" size="icon" onClick={dismiss} aria-label="收起武林宝典"><X size={22} /></Button></div>
    <label className="book-search">查找英文或中文<input ref={input} value={search} onChange={event => setSearch(event.target.value)} placeholder="例如 License、许可证" /></label>
    <div className="book-filters"><label>范围<select aria-label="范围" value={filter} onChange={event => setFilter(event.target.value)}><option value="all">全部术语</option><option value="scene">鉴宝相关</option><option value="bookmarks">我的书签</option><option value="review">待独立评估</option></select></label><label>主题<select aria-label="主题" value={topic} onChange={event => setTopic(event.target.value)}><option value="all">全部类型</option>{[...new Set(vocabulary.map(term => term.kind))].map(kind => <option key={kind} value={kind}>{topicNames[kind]}</option>)}</select></label></div>
    <p className="book-note">见过 ≠ 练过 ≠ 评估通过。仅鉴宝目标有操作证据；其他课程未接入。不代表真实 GitHub 验证。评估中查宝典，本轮记辅助练习。</p>
    <div className="book-results">{terms.length ? terms.map(term => {
      const evidence = learningEvidence(state, term.id);
      return <article key={term.id}><h3>{term.english}<span>{term.chinese}</span></h3><p>{term.beginnerMeaning}</p>
        <small className="evidence-status">{evidence.assessed.length ? "迁移评估已通过" : evidence.practiced.length ? "已练习 · 待独立评估" : evidence.encountered ? "已查阅" : "尚未查阅"}{!evidence.supported ? " · 本阶段未提供评估" : ""}</small>
        <div className="book-actions"><Button variant="ghost" aria-pressed={state.journey.bookmarks.includes(term.id)} onClick={() => dispatch({ type: "bookmark", termId: term.id })}>{state.journey.bookmarks.includes(term.id) ? "移除书签" : "加入书签"}</Button></div>
        <details onToggle={event => { if (event.currentTarget.open) dispatch({ type: "encounter", termId: term.id }); }}><summary>用途、误区与操作说明</summary><p>{term.purpose}</p><p>{term.howToUseIt}</p><ul>{term.commonMistakes.map(mistake => <li key={mistake}>{mistake}</li>)}</ul><p>易混淆：{term.confusedWith.join("、") || "无"}</p></details>
        <a href={term.sourceUrl} target="_blank" rel="noreferrer">查阅官方来源 <ArrowSquareOut size={15} aria-hidden /></a>
        <small className="source-date">核验：{term.lastVerifiedAt}</small>
      </article>;
    }) : <p>没有找到。试试更短的关键词或“全部术语”。</p>}</div>
  </dialog>;
}
