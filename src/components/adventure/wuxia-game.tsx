'use client';
import { useEffect, useReducer, useRef, useState } from 'react';
import { Backpack, BookOpenText, ArrowRight, MapTrifold, DownloadSimple, CheckCircle } from '@phosphor-icons/react';
import { characters } from '@/content/characters';
import { chapterLessons } from '@/content/minigames/chapters';
import { initialWuxia, wuxiaReducer, earnedChapters } from '@/core/game/wuxia';
import { initialAdventure, type AdventureAction } from '@/core/game/adventure';
import { loadWuxiaSave, writeWuxiaSave, wuxiaSaveSchema, WUXIA_STORAGE_KEY } from '@/core/persistence/chapter-storage';
import { replayChapter } from '@/core/game/chapter-games';
import { brandConfig } from '@/config/brand';
import { Button } from '@/components/ui/button';
import { CharacterArt } from './character-art';
import { ChapterWorkbench } from './chapter-workbench';
import { JianghuMap } from './jianghu-map';
import { Handbook } from './handbook';
export function WuxiaGame({ demo = false, onExit }: {
    demo?: boolean;
    onExit?: () => void;
}) {
    const [state, dispatch] = useReducer(wuxiaReducer, demo, initialWuxia);
    const [bag, setBag] = useState(false);
    const [explore, setExplore] = useState(false);
    const [book, setBook] = useState<{
        id?: string;
    } | null>(null);
    const [guide, setGuide] = useState(false);
    const [resetPending, setResetPending] = useState(false);
    const focus = useRef<HTMLHeadingElement>(null);
    const bookTrigger = useRef<HTMLElement | null>(null);
    useEffect(() => { if (demo) {
        dispatch({ type: 'hydrate', save: null });
        return;
    } try {
        const loaded = loadWuxiaSave(localStorage);
        dispatch({ type: 'hydrate', save: loaded.save, issue: loaded.issue });
    }
    catch {
        dispatch({ type: 'hydrate', save: null, issue: '浏览器未开放本地存储。可体验并导出当前进度。' });
    } }, [demo]);
    useEffect(() => { if (!state.ready || demo || state.storageIssue)
        return; try {
        writeWuxiaSave(localStorage, state);
    }
    catch (e) {
        dispatch({ type: 'storage-error', issue: `保存失败：${e instanceof Error ? e.message : '无法写入浏览器存储'}。请导出本轮记录。` });
    } }, [state, demo]);
    useEffect(() => { focus.current?.focus(); }, [state.view, state.currentChapter]);
    const openBook = (id?: string) => { bookTrigger.current = document.activeElement as HTMLElement; setBook({ id }); };
    function download(raw: string, name: string) { const url = URL.createObjectURL(new Blob([raw], { type: 'application/json' })); const a = document.createElement('a'); a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url); }
    const oldBook = initialAdventure();
    oldBook.character = state.character;
    oldBook.journey.bookmarks = state.bookmarks;
    const practiced = Object.entries(state.runs).flatMap(([ch, run]) => { const m = replayChapter(Number(ch), run.events); return chapterLessons[Number(ch)].stages.slice(0, m?.stage ?? 0).flatMap(s => s.termIds); });
    const bookDispatch = (a: AdventureAction) => { if (a.type === 'bookmark')
        dispatch({ type: 'bookmark', id: a.termId }); };
    if (explore)
        return <WuxiaGame demo onExit={() => setExplore(false)}/>;
    return <div className="adventure wuxia-v3" data-reduced-motion={state.reducedMotion}>
 <header className="adventure-header"><a className="adventure-brand" href="/adventure"><span className="brand-seal">侠</span><span>{brandConfig.chineseName}<small>{demo ? '演示与复习' : '云溪谷历练'}</small></span></a><nav aria-label="江湖导航"><Button variant="ghost" disabled={!state.character} onClick={() => dispatch({ type: 'map' })}><MapTrifold />江湖地图</Button><Button variant="ghost" onClick={() => openBook()}><BookOpenText />武林宝典</Button><Button variant="ghost" aria-expanded={bag} onClick={() => setBag(!bag)}><Backpack />行囊</Button></nav><span className="save-status">{demo ? '演示，不代表真实玩家成绩' : state.storageIssue ? '保存异常' : state.ready ? '进度保存在本机' : '正在读取行囊'}</span></header>
 {demo && <div className="demo-shelf"><p>演示 / 复习：不读取或修改正式进度，不代表真实玩家成绩。</p>{!state.character ? <Button onClick={() => { dispatch({ type: 'intro' }); dispatch({ type: 'character', id: 'atuan' }); dispatch({ type: 'map' }); }}>准备演示角色</Button> : state.view !== 'chapter' && <label>自由探索列表<select aria-label="自由探索章节" value="" onChange={e => dispatch({ type: 'enter', chapter: Number(e.target.value) })}><option value="" disabled>选择演示章节</option>{chapterLessons.map(l => <option key={l.chapter} value={l.chapter}>第 {l.chapter} 章 · {l.title}</option>)}</select></label>}{onExit && <Button variant="secondary" onClick={onExit}>返回正式历练</Button>}</div>}
 {state.storageIssue && <p role="alert" className="storage-warning">{state.storageIssue}</p>}
 {bag && <section className="adventure-settings" aria-label="行囊"><h2>行囊</h2><p>已获道具：{earnedChapters(state).map(c => chapterLessons[c].reward).join('、') || '完成村口路标，取得第一张残页。'}</p><label><input type="checkbox" checked={state.reducedMotion} onChange={e => dispatch({ type: 'motion', reduced: e.target.checked })}/>减少动态效果</label><Button variant="secondary" onClick={() => setGuide(v => !v)}>重看入村引导</Button>{!demo && <><Button variant="secondary" onClick={() => download(JSON.stringify(wuxiaSaveSchema.parse(state), null, 2), 'github-village-v3.json')}><DownloadSimple />导出当前进度</Button><Button variant="secondary" onClick={() => { const raw = localStorage.getItem(WUXIA_STORAGE_KEY); if (raw)
        download(raw, 'github-village-original.json'); }}>导出原存档</Button><Button variant="secondary" onClick={() => setExplore(true)}>进入自由探索</Button><Button variant="ghost" onClick={() => setResetPending(v => !v)}>重置本轮历练</Button>{resetPending && <Button variant="secondary" onClick={() => { localStorage.removeItem(WUXIA_STORAGE_KEY); dispatch({ type: 'reset-save' }); setResetPending(false); setBag(false); }}>确认重置 v3，保留旧版存档</Button>}</>}{guide && <p>阅读中文 README → 在 GitHub 官方网站 Fork → Clone / GitHub Desktop / Codespaces → 本地运行 → 游戏学习 → 回自己的 Fork 完成安全毕业练习。这里不收集凭据，不验证真实操作。</p>}</section>}
 <h2 ref={focus} className="sr-only" tabIndex={-1}>{state.view === 'chapter' ? `第 ${state.currentChapter} 章 ${chapterLessons[state.currentChapter!].title}` : state.view === 'intro' ? '入村引导' : state.view === 'choose' ? '选择角色' : '江湖地图'}</h2>
 {!state.ready ? <div className="adventure-loading">正在展开江湖画卷…</div> : state.view === 'intro' ? <section className="village-intro"><div><span className="seal-small">入村引路</span><h1>先读路标，再入江湖。</h1><p>你将沿十三处地点，从认识仓库走到安全贡献。这里是武侠 2D 页游，每一步 GitHub 动作都在本地模拟。</p><p className="intro-route">中文 README → Fork → Clone / Desktop / Codespaces → 本地运行 → 回到自己的 Fork</p><Button size="lg" onClick={() => dispatch({ type: 'intro' })}>{state.character ? '继续上次历练' : '开始选角'}<ArrowRight /></Button><small>真实登录只在 GitHub 官方环境；不收集密码、Token、SSH 私钥或恢复代码。</small></div></section> : state.view === 'choose' ? <section className="character-selection"><div className="selection-copy"><span className="seal-small">初入云溪谷</span><h1>选一位少侠，<br />共赴新手村。</h1><p>三个角色，同一条学习路线。<br />凭观察和操作，让整张地图亮起来。</p><div className="selected-character"><strong>{characters.find(c => c.id === state.character)?.name ?? '谁与你同行？'}</strong><p>{characters.find(c => c.id === state.character)?.description ?? '选择之后，才可踏入江湖。'}</p></div><Button disabled={!state.character} size="lg" onClick={() => dispatch({ type: 'map' })}>踏入江湖<ArrowRight /></Button></div><div className="character-options">{characters.map(c => <Button key={c.id} variant="ghost" className={`character-option ${state.character === c.id ? 'chosen' : ''}`} aria-label={`选择${c.name}`} aria-pressed={state.character === c.id} onClick={() => dispatch({ type: 'character', id: c.id })}><CharacterArt id={c.id}/><span className="character-name">{c.name}<small>{c.role}</small></span>{state.character === c.id && <CheckCircle className="character-check"/>}</Button>)}</div></section> : state.view === 'map' ? <JianghuMap state={state} dispatch={dispatch}/> : <ChapterWorkbench key={state.currentChapter} state={state} dispatch={dispatch} openBook={openBook}/>}
 {book && <Handbook termId={book.id} state={oldBook} dispatch={bookDispatch} currentChapter={state.currentChapter ?? undefined} practicedTermIds={practiced} reviewIds={state.review} onReview={id => dispatch({ type: 'review', id })} close={() => { setBook(null); bookTrigger.current?.focus(); }}/>}
 <footer className="adventure-footer"><p>本地教学模拟。真实 GitHub 操作由本人自我检查；不强制 Star、分享、赞助或向原仓库提 PR。</p><p>{brandConfig.disclaimer} <a href="/start/">Fork / Clone 指南</a> · <a href="/about/">关于项目</a></p></footer>
 </div>;
}
