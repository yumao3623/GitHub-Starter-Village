'use client';
import Image from 'next/image';
import {campaignChapters,passDefinitions,campaignRules,chapterAidCopy} from '@/content/minigames/campaign';
import {Act} from './campaign/shared';
import {JourneyEnding} from './campaign/ending';
import {hasCampaignAward} from '@/core/game/campaign';
import type {WuxiaAction} from '@/core/game/wuxia';
import { useEffect, useReducer, useRef, useState } from 'react';
import { ArrowRight, DownloadSimple, CheckCircle } from '@phosphor-icons/react';
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
    const [state, rawDispatch] = useReducer(wuxiaReducer, demo, initialWuxia);
    const [turn,setTurn]=useState(false);
    const turning=useRef(false);
    const dispatch:React.Dispatch<WuxiaAction>=(action)=>{
      if(action.type==='map'||action.type==='enter'){
        if(turning.current)return;
        const next=wuxiaReducer(state,action);
        if(next.error){rawDispatch(action);return;}
        if(!demo){try{writeWuxiaSave(localStorage,next);}catch(e){rawDispatch({type:'storage-error',issue:`保存失败，未切换画面：${e instanceof Error?e.message:'无法写入'}。请导出进度后重试。`});return;}}
        rawDispatch(action);
        if(!state.reducedMotion&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){turning.current=true;setTurn(true);}
      }else rawDispatch(action);
    };
    useEffect(()=>{if(!turn)return;const timer=window.setTimeout(()=>{setTurn(false);turning.current=false;},1000);return()=>clearTimeout(timer);},[turn]);
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
        rawDispatch({ type: 'demo-start' });
        return;
    } try {
        const loaded = loadWuxiaSave(localStorage);
        rawDispatch({ type: 'hydrate', save: loaded.save, issue: loaded.issue });
    }
    catch {
        rawDispatch({ type: 'hydrate', save: null, issue: '浏览器未开放本地存储。可体验并导出当前进度。' });
    } }, [demo]);
    useEffect(() => { if (!state.ready || demo || state.storageIssue)
        return; try {
        writeWuxiaSave(localStorage, state);
    }
    catch (e) {
        rawDispatch({ type: 'storage-error', issue: `保存失败：${e instanceof Error ? e.message : '无法写入浏览器存储'}。请导出本轮记录。` });
    } }, [state, demo]);
    useEffect(() => { focus.current?.focus(); }, [state.view, state.currentChapter]);
    const openBook = (id?: string) => { bookTrigger.current = document.activeElement as HTMLElement; setBook({ id }); };
    function download(raw: string, name: string) { const url = URL.createObjectURL(new Blob([raw], { type: 'application/json' })); const a = document.createElement('a'); a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url); }
    const oldBook = initialAdventure();
    oldBook.character = state.character;
    oldBook.journey.bookmarks = state.bookmarks;
    const practicedLegacy = Object.entries(state.runs).flatMap(([ch, run]) => { const m = replayChapter(Number(ch), run.events); return chapterLessons[Number(ch)].stages.slice(0, m?.stage ?? 0).flatMap(s => s.termIds); });
    const practiced=[...new Set([...practicedLegacy,...campaignChapters.filter(c=>hasCampaignAward(c,state.campaign[c])).flatMap(c=>campaignRules[c].termIds)])];
    const bookDispatch = (a: AdventureAction) => { if (a.type === 'bookmark')
        dispatch({ type: 'bookmark', id: a.termId }); };
    if (explore)
        return <WuxiaGame demo onExit={() => setExplore(false)}/>;
    return <div className="adventure wuxia-v3" data-reduced-motion={state.reducedMotion}>
 <header className="adventure-header"><a className="adventure-brand" href="/adventure"><Image className="brand-manual" src="/brand/jianghu-manual-icon-v1.png" alt="云溪武林宝典" width={46} height={46} unoptimized/><span>{brandConfig.chineseName}<small>{demo ? '演示与复习' : '云溪谷历练'}</small></span></a><nav aria-label="江湖导航"><Button variant="ghost" disabled={!state.character} onClick={() => dispatch({ type: 'map' })}><Image className="nav-object" src="/assets/phase-c/travel-pass.png" alt="" width={30} height={30} unoptimized/>江湖地图</Button><Button variant="ghost" onClick={() => openBook()}><Image className="nav-object" src="/brand/jianghu-manual-icon-v1.png" alt="" width={30} height={30} unoptimized/>武林宝典</Button><Button variant="ghost" aria-expanded={bag} onClick={() => setBag(!bag)}><Image className="nav-object" src="/assets/phase-c/coin-pouch.png" alt="" width={30} height={30} unoptimized/>行囊</Button></nav><span className="save-status">{demo ? '演示，不代表真实玩家成绩' : state.storageIssue ? '保存异常' : state.ready ? '进度保存在本机' : '正在读取行囊'}</span></header>
 {demo && <div className="demo-shelf"><p>演示 / 复习：不读取或修改正式进度，不代表真实玩家成绩。</p>{!state.character ? <Button onClick={() => { rawDispatch({ type: 'demo-start' }); }}>准备演示角色</Button> : state.view !== 'chapter' && <label>自由探索列表<select aria-label="自由探索章节" value="" onChange={e => dispatch({ type: 'enter', chapter: Number(e.target.value) })}><option value="" disabled>选择演示章节</option>{chapterLessons.map(l => <option key={l.chapter} value={l.chapter}>第 {l.chapter} 章 · {l.title}</option>)}</select></label>}{onExit && <Button variant="secondary" onClick={onExit}>返回正式历练</Button>}</div>}
 {state.storageIssue && <p role="alert" className="storage-warning">{state.storageIssue}</p>}
 {bag && <section className="adventure-settings" aria-label="行囊"><h2>行囊 · 江湖账本</h2><Act onClick={()=>setBag(false)}>收起行囊</Act><div className="wallet-items"><div><Image src="/assets/phase-c/coin-pouch.png" alt="铜钱袋" width={88} height={88} unoptimized/><strong>{state.wallet.copper} 文铜钱</strong></div><div><Image src="/assets/phase-c/silver-note.png" alt="银票" width={88} height={88} unoptimized/><strong>{state.wallet.silver} 两银票</strong></div><Act onClick={()=>dispatch({type:'wallet-exchange'})}>一百文换一两</Act></div><p className="wallet-help">铜钱可购章内详解、进入百戏客栈；银票可换永久青玉骰桌。首通 10 文，完整重玩 4 文；第四、八、十二章各赠一两。</p><div className="wallet-passes">{passDefinitions.filter(p=>state.wallet.passes.includes(p.id)).map(p=><div key={p.id} className="wallet-pass"><Image src="/assets/phase-c/travel-pass.png" alt="" width={64} height={75} unoptimized/><div><strong>{p.id}</strong><p>签发：{p.issuer} · 用途：{p.use}</p><small>可在第 {p.chapter+1} 章使用：{chapterAidCopy(p.chapter+1)}</small></div></div>)}</div><details><summary>逐笔收支（虚拟货币）</summary><div className="wallet-ledger">{state.wallet.ledger.map(t=><p key={t.id}>{t.reason} · {t.amount>0?'+':''}{t.amount} 文</p>)}</div></details><p>已获道具：{earnedChapters(state).map(c => chapterLessons[c].reward).join('、') || '完成村口路标，取得第一张残页。'}</p><div className="bag-preferences"><label><input type="checkbox" checked={state.reducedMotion} onChange={e => dispatch({ type: 'motion', reduced: e.target.checked })}/>减少动态效果</label><Button variant="secondary" onClick={() => setGuide(v => !v)}>重看入村引导</Button></div>{!demo && <><label className="campaign-field">导入备份行囊<input type="file" accept=".json,application/json" onChange={async e=>{const file=e.target.files?.[0];if(!file)return;try{dispatch({type:'import',save:JSON.parse(await file.text())});}catch{rawDispatch({type:'storage-error',issue:'备份不是有效 JSON，原进度保留。'});}}}/></label><Button variant="secondary" onClick={() => download(JSON.stringify(wuxiaSaveSchema.parse(state), null, 2), 'github-village-v3.json')}><DownloadSimple />导出当前进度</Button><Button variant="secondary" onClick={() => { const raw = localStorage.getItem(WUXIA_STORAGE_KEY); if (raw)
        download(raw, 'github-village-original.json'); }}>导出原存档</Button><Button variant="secondary" onClick={() => setExplore(true)}>进入自由探索</Button><Button variant="ghost" onClick={() => setResetPending(v => !v)}>重置本轮历练</Button>{resetPending && <Button variant="secondary" onClick={() => { localStorage.removeItem(WUXIA_STORAGE_KEY); dispatch({ type: 'reset-save' }); setResetPending(false); setBag(false); }}>确认重置 v3，保留旧版存档</Button>}</>}{guide && <p>阅读中文 README → 在 GitHub 官方网站 Fork → Clone / GitHub Desktop / Codespaces → 本地运行 → 游戏学习 → 回自己的 Fork 完成安全毕业练习。这里不收集凭据，不验证真实操作。</p>}</section>}
 <h2 ref={focus} className="sr-only" tabIndex={-1}>{state.view === 'chapter' ? `第 ${state.currentChapter} 章 ${chapterLessons[state.currentChapter!].title}` : state.view === 'intro' ? '入村引导' : state.view === 'choose' ? '选择角色' : '江湖地图'}</h2>
 {!state.ready ? <div className="adventure-loading">正在展开江湖画卷…</div> : state.view === 'intro' ? <section className="village-intro"><div><span className="seal-small">入村引路</span><h1>先读路标，再入江湖。</h1><p>从村口出发，跟着每一关的小任务学会 GitHub。</p><Button size="lg" onClick={() => dispatch({ type: 'intro' })}>{state.character ? '继续上次历练' : '开始选角'}<ArrowRight /></Button><small>这是本地教学模拟；真实登录请回到 GitHub 官方网站。</small></div></section> : state.view === 'choose' ? <section className="character-selection"><div className="selection-copy"><span className="seal-small">初入云溪谷</span><h1>选一位少侠，<br />共赴新手村。</h1><p>三个角色，同一条学习路线。<br />凭观察和操作，让整张地图亮起来。</p><div className="selected-character"><strong>{characters.find(c => c.id === state.character)?.name ?? '谁与你同行？'}</strong><p>{characters.find(c => c.id === state.character)?.description ?? '选择之后，才可踏入江湖。'}</p></div><Button disabled={!state.character} size="lg" onClick={() => dispatch({ type: 'map' })}>踏入江湖<ArrowRight /></Button></div><div className="character-options">{characters.map(c => <Button key={c.id} variant="ghost" className={`character-option ${state.character === c.id ? 'chosen' : ''}`} aria-label={`选择${c.name}`} aria-pressed={state.character === c.id} onClick={() => dispatch({ type: 'character', id: c.id })}><CharacterArt id={c.id}/><span className="character-name">{c.name}<small>{c.role}</small></span>{state.character === c.id && <CheckCircle className="character-check"/>}</Button>)}</div></section> : state.view === 'map' ? <JianghuMap state={state} dispatch={dispatch}/> : <ChapterWorkbench key={state.currentChapter} state={state} dispatch={dispatch} openBook={openBook}/>}
 {earnedChapters(state).length===campaignChapters.length&&state.view==='map'&&<JourneyEnding/>}
 {turn&&<div className="campaign-page-turn" aria-label="翻书过场"><div className="page-turn-base" aria-hidden/><div className="page-turn-left" aria-hidden/><div className="page-turn-right" aria-hidden><div className="page-face-front"/><div className="page-face-back"/></div><span className="page-turn-spine" aria-hidden/><Act onClick={()=>{setTurn(false);turning.current=false;}}>跳过翻书</Act></div>}
 {book && <Handbook termId={book.id} state={oldBook} dispatch={bookDispatch} currentChapter={state.currentChapter ?? undefined} practicedTermIds={practiced} reviewIds={state.review} onReview={id => dispatch({ type: 'review', id })} close={() => { setBook(null); bookTrigger.current?.focus(); }}/>}
 <footer className="adventure-footer"><p>本地教学模拟。真实 GitHub 操作由本人自我检查；不强制 Star、分享、赞助或向原仓库提 PR。</p><p>{brandConfig.disclaimer} <a href="/start/">Fork / Clone 指南</a> · <a href="/about/">关于项目</a></p></footer>
 </div>;
}
