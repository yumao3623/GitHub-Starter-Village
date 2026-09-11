import { useRef, useEffect, useState } from "react";
import { X, ArrowSquareOut, CaretLeft, CaretRight, BookmarkSimple } from "@phosphor-icons/react";
import { vocabulary } from "@/content/vocabulary/zh-CN";
import { contributionMissions } from "@/content/minigames/contribution-lessons";
import { learningEvidence } from "@/core/mastery/adventure-evidence";
import type { AdventureState, AdventureAction } from "@/core/game/adventure";
import { chapterLessons } from "@/content/minigames/chapters";
import { Button } from "@/components/ui/button";
const topicNames: Record<string, string> = { concept: "技术概念", navigation: "页面导航", action: "操作", status: "状态", permission: "权限", security: "安全", "git-command": "Git 命令", file: "文件", community: "社区" };
const chainTerms = new Set(contributionMissions.flatMap(lesson => lesson.termIds));
export function Handbook({ termId, close, state, dispatch, currentChapter, practicedTermIds, reviewIds, onReview }: {
    termId?: string;
    close: () => void;
    state: AdventureState;
    dispatch: React.Dispatch<AdventureAction>;
    currentChapter?: number;
    practicedTermIds?: string[];
    reviewIds?: string[];
    onReview?: (id: string) => void;
}) {
    const [search, setSearch] = useState(termId ? vocabulary.find(term => term.id === termId)?.english ?? "" : "");
    const [filter, setFilter] = useState("all");
    const [volume, setVolume] = useState("all");
    const [chapterIndex, setChapterIndex] = useState("all");
    const sceneTerms = new Set(currentChapter === undefined ? [] : chapterLessons[currentChapter].stages.flatMap(s => s.termIds));
    const volumeTerms = new Set(chapterLessons.filter(l => volume === "all" || (volume === "entry" ? l.chapter <= 3 : volume === "repo" ? l.chapter >= 4 && l.chapter <= 7 : volume === "collab" ? l.chapter >= 8 && l.chapter <= 11 : l.chapter === 12)).flatMap(l => l.stages.flatMap(s => s.termIds)));
    const chapterTerms = new Set(chapterIndex === "all" ? [] : chapterLessons[Number(chapterIndex)].stages.flatMap(s => s.termIds));
    const [topic, setTopic] = useState("all");
    const [selectedId, setSelectedId] = useState(termId ?? vocabulary[0]?.id);
    const input = useRef<HTMLInputElement>(null);
    const dialog = useRef<HTMLDialogElement>(null);
    useEffect(() => { dialog.current?.showModal(); input.current?.focus(); }, []);
    function dismiss() { dialog.current?.close(); close(); }
    const terms = vocabulary.filter(term => {
        const evidence = learningEvidence(state, term.id);
        return `${term.english} ${term.chinese}`.toLowerCase().includes(search.trim().toLowerCase()) && (topic === "all" || term.kind === topic) && (volume === "all" || volumeTerms.has(term.id)) && (chapterIndex === "all" || chapterTerms.has(term.id)) &&
            (filter === "all" || (filter === "chain" && chainTerms.has(term.id)) || (filter === "scene" && (currentChapter === undefined ? evidence.supported : sceneTerms.has(term.id))) || (filter === "bookmarks" && state.journey.bookmarks.includes(term.id)) || (filter === "review" && (reviewIds ? reviewIds.includes(term.id) : evidence.practiced.length > 0 && evidence.assessed.length === 0)));
    });
    const selected = terms.find(term => term.id === selectedId) ?? terms[0];
    const selectedIndex = selected ? terms.findIndex(term => term.id === selected.id) : -1;
    const move = (delta: number) => { if (!terms.length)
        return; setSelectedId(terms[(selectedIndex + delta + terms.length) % terms.length].id); };
    return <dialog ref={dialog} className="handbook" aria-labelledby="handbook-title" onCancel={event => { event.preventDefault(); dismiss(); }}>
    <div className="handbook-cover"><div><small>云溪谷 · 线装秘籍</small><h2 id="handbook-title">武林宝典</h2><p>{currentChapter === undefined ? "从入村到发布，随身查阅" : `当前：第 ${currentChapter} 章 · ${chapterLessons[currentChapter].title}`} · 已练 {new Set(practicedTermIds ?? []).size} 条</p></div><Button variant="ghost" size="icon" onClick={dismiss} aria-label="收起武林宝典"><X size={22}/></Button></div>
    <div className="handbook-body"><aside className="book-catalog"><strong>分卷目录</strong>{[["all", "全书"], ["entry", "卷一 · 入村"], ["repo", "卷二 · 仓库"], ["collab", "卷三 · 协作"], ["release", "卷四 · 发布"]].map(([id, name]) => <button key={id} aria-pressed={volume === id} className={volume === id ? 'active' : ''} onClick={() => { setVolume(id); setChapterIndex('all'); setSearch(''); }}>{name}</button>)}<label className="catalog-index">章节索引<select aria-label="宝典章节索引" value={chapterIndex} onChange={e => { setChapterIndex(e.target.value); setVolume('all'); setSearch(''); }}><option value="all">全部章节</option>{chapterLessons.map(l => <option key={l.chapter} value={l.chapter}>第 {l.chapter} 章 · {l.title}</option>)}</select></label><div className="catalog-terms">{terms.map(term => <button key={term.id} className={term.id === selected?.id ? "active" : ""} onClick={() => setSelectedId(term.id)}>{term.english}</button>)}</div></aside><main className="book-reading">
    <label className="book-search">查找英文或中文<input ref={input} value={search} onChange={event => setSearch(event.target.value)} placeholder="例如 License、许可证"/></label>
    <div className="book-filters"><label>范围<select aria-label="范围" value={filter} onChange={event => setFilter(event.target.value)}><option value="all">全部术语</option><option value="scene">当前场景</option><option value="chain">贡献链相关</option><option value="bookmarks">我的书签</option><option value="review">待复习</option></select></label><label>主题<select aria-label="主题" value={topic} onChange={event => setTopic(event.target.value)}><option value="all">全部类型</option>{[...new Set(vocabulary.map(term => term.kind))].map(kind => <option key={kind} value={kind}>{topicNames[kind]}</option>)}</select></label></div>
    <p className="book-note">见过 ≠ 练过 ≠ 独立掌握。操作记录来自本地模拟，不代表真实 GitHub 操作已验证。</p>
    {selected ? <article className="book-entry"><h3>{selected.english}<span>{selected.chinese} · {selected.literalTranslation}</span></h3><p>{selected.beginnerMeaning}</p>
        <p><strong>非字面理解：</strong>{selected.officialMeaningSummary}</p><p><strong>当前场景例子：</strong>{(currentChapter !== undefined && chapterLessons[currentChapter].stages.find(s => s.termIds.includes(selected.id))?.evidence) || chapterLessons.flatMap(l => l.stages).find(s => s.termIds.includes(selected.id))?.evidence || selected.currentStoryExample}</p>
        <p><strong>用途：</strong>{selected.purpose}</p><p><strong>怎么用：</strong>{selected.howToUseIt}</p>
        <p><strong>易混淆：</strong>{selected.confusedWith.map(id => { const term = vocabulary.find(t => t.id === id); return term ? `${term.english}（${term.chinese}）` : id; }).join("、") || "无"}</p>
        <div className="book-entry-meta"><BookmarkSimple size={18}/>{state.journey.bookmarks.includes(selected.id) ? "已加入书签" : "保存此条以便查阅"}<Button variant="secondary" onClick={() => dispatch({ type: "bookmark", termId: selected.id })}>{state.journey.bookmarks.includes(selected.id) ? "移除书签" : "加入书签"}</Button></div>{onReview && <div className="book-review"><span>{practicedTermIds?.includes(selected.id) ? '已在本地关卡中练习' : '尚无本地动作记录'}</span><Button variant="ghost" onClick={() => onReview(selected.id)}>{reviewIds?.includes(selected.id) ? '移出待复习' : '加入待复习'}</Button></div>}
        <a href={selected.sourceUrl} target="_blank" rel="noreferrer">查阅官方来源 · {selected.sourceTitle} <ArrowSquareOut size={15} aria-hidden/></a><small className="source-date">核验：{selected.lastVerifiedAt}</small>
      </article> : <p>没有找到匹配术语。试试“全部术语”。</p>}
    <div className="book-navigation"><Button variant="secondary" onClick={() => move(-1)} disabled={!terms.length}><CaretLeft />上一条</Button><span>{selected ? `${selectedIndex + 1} / ${terms.length}` : "0 / 0"}</span><Button variant="secondary" onClick={() => move(1)} disabled={!terms.length}>下一条<CaretRight /></Button><Button onClick={dismiss}>回到当前任务</Button></div>
    </main></div>
  </dialog>;
}
