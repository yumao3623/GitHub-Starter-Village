'use client';

import { useState } from 'react';
import { ArrowRight, Coins, MapTrifold, Package, Scroll, SealCheck, Sparkle } from '@phosphor-icons/react';
import { chapterLessons } from '@/content/minigames/chapters';
import { replayChapter, freshChapter } from '@/core/game/chapter-games';
import type { WuxiaAction, WuxiaState } from '@/core/game/wuxia';
import { Button } from '@/components/ui/button';

type Props = { state: WuxiaState; dispatch: React.Dispatch<WuxiaAction>; openBook: (id?: string) => void };

const sampleCopy: Record<number, { eyebrow: string; rule: string; art: string; labels: string[] }> = {
  0: { eyebrow: '连线寻路 · 路牌连连看', rule: '把 GitHub 的入口路牌接到它真正的用途；路线亮起后，旅人才不会走错门。', art: 'route', labels: ['README', 'Code', 'Releases', 'Fork'] },
  8: { eyebrow: '三站调度 · 货运棋盘', rule: '先辨认远端版本，再按 Fetch → Pull → Push 的因果调度货件。', art: 'dispatch', labels: ['origin', 'upstream', 'Fetch', 'Pull', 'Push'] },
  10: { eyebrow: '有限槽叠签 · 合卷台', rule: '从工作区取出相关改动，放进暂存槽，封卷后再送到自己的 origin。', art: 'staging', labels: ['Diff', 'Stage', 'Commit', 'Push'] },
};

export function RepresentativePlayground({ state, dispatch, openBook }: Props) {
  const chapter = state.currentChapter!;
  const lesson = chapterLessons[chapter];
  const run = state.runs[chapter] ?? freshChapter();
  const model = replayChapter(chapter, run.events)!;
  const stage = lesson.stages[model.stage];
  const copy = sampleCopy[chapter];
  const [selected, setSelected] = useState('');
  const [draft, setDraft] = useState('');
  const [hintUsed, setHintUsed] = useState(false);
  const [turning, setTurning] = useState(false);
  const returnToMap = () => {
    if (state.reducedMotion) { dispatch({ type: 'map' }); return; }
    setTurning(true);
    window.setTimeout(() => dispatch({ type: 'map' }), 720);
  };
  const act = (item: string, value = '') => {
    if (!item) return;
    dispatch({ type: 'act', event: { stage: model.stage, item, value } });
    setSelected('');
    setDraft('');
  };
  const steps = stage?.mode === 'sequence' ? stage.order ?? [] : stage?.items ?? [];
  const current = stage?.mode === 'sequence' ? stage.order?.[model.steps.length] : undefined;
  const done = !stage;
  const showHint = () => {
    if (state.wallet.copper >= 5 && !hintUsed) { dispatch({ type: 'wallet-spend', amount: 5, reason: '请青砚递来一条额外线索' }); setHintUsed(true); }
    else dispatch({ type: 'wallet-spend', amount: 0, reason: state.wallet.copper < 5 ? '钱袋不足，青砚仍提供免费线索' : '免费复看线索' });
  };
  return <section className={`chapter-canvas representative-playground sample-${copy.art} ${turning ? 'is-turning' : ''}`} data-chapter={chapter} aria-labelledby="sample-title">
    <header className="sample-header chapter-hud"><div><small>第 {chapter} 章 · {copy.eyebrow}</small><h1 id="sample-title">{lesson.title}</h1><p>{copy.rule}</p></div><div className="sample-wallet" aria-label={`钱袋余额 ${state.wallet.copper} 枚铜钱`}><Coins size={22}/><strong>{state.wallet.copper}</strong><span>铜钱</span></div><Button variant="secondary" onClick={returnToMap}><MapTrifold/>返回地图</Button></header>
    <div className="sample-board" role="group" aria-label={`${lesson.title}可玩样板`}>
      <div className="sample-art" aria-hidden="true"><span className="sample-art-label">{chapter === 0 ? '村口路引' : chapter === 8 ? '三城驿站' : '合卷叠签'}</span></div>
      <div className="sample-playfield chapter-operation">
        <h2 className="sr-only">{done ? `收束 · ${lesson.title}已盖印` : stage.title}</h2>
        <div className="sample-stage"><span>当前局面</span><strong>{done ? '已封卷' : stage.title}</strong><small>{done ? '奖励已记入本机存档' : `${model.steps.length} / ${steps.length} 个动作`}</small></div>
        {!done && stage.mode === 'explore' && <div className="sample-tile-grid">{stage.items.map(item => <button key={item} aria-label={item} className={model.steps.includes(item) ? 'sample-tile selected' : 'sample-tile'} disabled={model.steps.includes(item)} onClick={() => act(item)}><Scroll size={24}/><strong>{item}</strong><small>{model.steps.includes(item) ? '已点亮' : '调查路牌'}</small></button>)}</div>}
        {!done && stage.mode === 'place' && <><div className="sample-card-row">{stage.items.map(item => <button key={item} aria-label={item} className={`sample-card ${selected === item ? 'selected' : ''} ${model.steps.includes(item) ? 'placed' : ''}`} disabled={model.steps.includes(item)} onClick={() => setSelected(item)}><Package size={20}/><strong>{item}</strong><small>{model.steps.includes(item) ? '已归位' : '取牌'}</small></button>)}</div><div className="sample-target-row">{stage.targets?.map(target => <button key={target} aria-label={`放入${target}`} className="sample-target" disabled={!selected} onClick={() => act(selected, target)}><SealCheck size={20}/><strong>{target}</strong><small>{Object.entries(model.placed).filter(([, value]) => value === target).map(([item]) => item).join('、') || '放入此处'}</small></button>)}</div></>}
        {!done && stage.mode === 'sequence' && <div className="sample-sequence"><div className="sample-route-line" aria-hidden="true"/>{steps.map((item, i) => <button key={item} aria-label={item} className={`sample-step ${model.steps.includes(item) ? 'done' : item === current ? 'next' : ''}`} disabled={model.steps.includes(item) || item !== current} onClick={() => act(item)}><span>{i + 1}</span><strong>{item}</strong><small>{model.steps.includes(item) ? '已完成' : item === current ? '当前可走' : '等待前置'}</small></button>)}</div>}
        {!done && stage.mode === 'edit' && <div className="sample-editor"><label htmlFor="sample-draft">{stage.instruction}<textarea aria-label={stage.title} id="sample-draft" value={draft || stage.initial || ''} onChange={e => setDraft(e.target.value)} rows={5}/></label><Button aria-label="保存并验印" onClick={() => act('save', draft || stage.initial || '')}><SealCheck/>验印并继续</Button></div>}
        {!done && chapter === 10 && stage.mode === 'place' && <p className="sample-note">暂存台只收本轮相关改动；无关便签留在工作区，混入会被退回。</p>}
        {done && <div className="scene-reward sample-complete"><Sparkle size={34}/><h2>{lesson.reward}</h2><p>这一局把 GitHub 的状态变化变成了可见的局面。铜钱已结算，回到地图后下一章才会解锁。</p><Button onClick={returnToMap}>领取{lesson.reward}，返回地图<ArrowRight/></Button></div>}
      </div>
    </div>
    <footer className="sample-footer"><div><strong>规则提示</strong><p className={`chapter-feedback ${state.error ? 'error' : 'success'}`}>{state.notice || '选择一个动作开始；错误会保留局面并说明原因。'}</p></div><div className="sample-actions"><Button variant="ghost" onClick={() => openBook(stage?.termIds[0])}><Scroll/>查宝典</Button><Button variant="ghost" onClick={showHint}><Sparkle/>额外线索（5 铜钱）</Button><Button variant="ghost" disabled={!run.events.length} onClick={() => dispatch({ type: 'undo' })}>撤销</Button><Button variant="ghost" onClick={() => dispatch({ type: 'restart' })}>重试</Button></div></footer>
    {turning && <div className="sample-page-turn" aria-live="polite">正在翻过本章游记…</div>}
  </section>;
}
