'use client';
import { useEffect, useRef, useState } from 'react';
import { MapTrifold, ArrowCounterClockwise, BookOpenText, Stamp, Scroll, Envelope, Flame, Signpost, Gear, Tree, Package, CaretRight } from '@phosphor-icons/react';
import type { Icon } from '@phosphor-icons/react';
import { chapterLessons } from '@/content/minigames/chapters';
import { chapterSceneByChapter } from '@/content/scenarios/chapter-scenes';
import { replayChapter, freshChapter } from '@/core/game/chapter-games';
import type { WuxiaAction, WuxiaState } from '@/core/game/wuxia';
import { PlacedCharacter } from './character-placement';
import { MechanismTrace } from './mechanism-trace';
import { SceneEnvironment, QingyanPortrait } from './scene-environment';
import { Button } from '@/components/ui/button';
const propIcons: Icon[] = [Signpost, Gear, Scroll, Flame, BookOpenText, Stamp, Envelope, Scroll, Package, Tree, Scroll, BookOpenText, Flame];
export function ChapterWorkbench({ state, dispatch, openBook }: {
    state: WuxiaState;
    dispatch: React.Dispatch<WuxiaAction>;
    openBook: (id?: string) => void;
}) {
    const chapter = state.currentChapter!;
    const lesson = chapterLessons[chapter];
    const scene = chapterSceneByChapter.get(chapter)!;
    const run = state.runs[chapter] ?? freshChapter();
    const m = replayChapter(chapter, run.events)!;
    const stage = lesson.stages[m.stage];
    const done = !stage;
    const [selected, setSelected] = useState('');
    const [draft, setDraft] = useState<{
        stage: number;
        value: string;
    }>({ stage: -1, value: '' });
    const [x, setX] = useState(12);
    const [npcOpen, setNpcOpen] = useState(true);
    const [walking, setWalking] = useState(false);
    const Icon = propIcons[chapter];
    const stageHeading = useRef<HTMLHeadingElement>(null);
    useEffect(() => { stageHeading.current?.focus(); }, [m.stage]);
    const value = draft.stage === m.stage ? draft.value : stage?.initial ?? '';
    const act = (item: string, text = '') => { dispatch({ type: 'act', event: { stage: m.stage, item, value: text } }); setSelected(''); };
    const branchName = state.runs[9]?.events.find(e => e.item === 'save')?.value ?? 'fix/south-gate（演示分支）';
    const ground = scene.walkableGround[0];
    const hotspots = scene.interactiveHotspots.filter(h => h.stage === m.stage);
    const needed = stage?.mode === 'sequence' ? stage.order?.length : stage?.items.length;
    return <section className="chapter-canvas" data-chapter={chapter} data-parent-map-region={scene.parentMapRegionId}>
  <header className="chapter-hud"><div><small>第 {chapter} 章 · {lesson.mechanic}</small><h1>{lesson.title}</h1></div><div className="chapter-current"><strong>{done ? '本章交付完成' : stage.title}</strong><span>{Math.min(m.stage + 1, lesson.stages.length)} / {lesson.stages.length} 项目标 {stage?.mode === 'place' || stage?.mode === 'explore' || stage?.mode === 'sequence' ? ` · ${m.steps.length} / ${needed} 件操作` : ''}</span></div><Button variant="secondary" onClick={() => dispatch({ type: 'map' })}><MapTrifold />返回地图</Button></header>
  <div className="chapter-panorama" tabIndex={0} role="group" aria-label="局部场景，左右方向键移动主角" style={{ backgroundPosition: `${scene.cameraStart.x}% ${scene.cameraStart.y}%`, backgroundSize: `${scene.cameraStart.zoom * 100}% auto` }} onKeyDown={e => { if (e.target !== e.currentTarget)
        return; if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        setWalking(true);
        setX(v => Math.max(ground.x, Math.min(ground.x + ground.width, v + (e.key === 'ArrowRight' ? 6 : -6))));
    } }}>
   <div className="panorama-vignette" aria-hidden/><SceneEnvironment chapter={chapter}/><MechanismTrace chapter={chapter} model={m} x={x}/><p className="scene-landmarks">{lesson.landmarks.join(' / ')}</p>
   <div className="scene-walkway" style={{ left: `${ground.x}%`, width: `${ground.width}%`, top: `${ground.y + ground.height}%` }} aria-hidden/>
   {stage && stage.mode !== 'edit' && stage.mode !== 'slider' && <div className={`scene-objects ${stage.mode}`} aria-label="当前场景机关">{hotspots.map((spot, i) => { const lit = m.steps.includes(spot.label); return <button type="button" key={spot.id} draggable={stage.mode === 'place' && !lit} aria-label={spot.label} aria-pressed={selected === spot.label || lit} data-lit={lit} className={`scene-object ${selected === spot.label ? 'held' : ''}`} style={{ left: `${spot.x}%`, top: `${spot.y}%` }} onDragStart={e => { e.dataTransfer.setData('text/plain', spot.label); e.dataTransfer.effectAllowed = 'move'; }} onClick={() => { setWalking(true); setX(spot.x); if (stage.mode === 'place')
        setSelected(spot.label);
    else
        act(spot.label); }}><Icon size={stage.mode === 'place' ? 26 : 36} weight="duotone"/><strong>{spot.label}</strong><small>{lit ? '已归位' : stage.mode === 'place' ? '拿起物件' : stage.mode === 'sequence' && stage.order?.[m.steps.length] === spot.label ? '当前线路' : '调查'}</small><span className="object-number">{i + 1}</span></button>; })}</div>}
   {stage?.mode === 'edit' && <div className="scene-scroll-preview"><Scroll size={40}/><pre>{value || '卷轴等待落笔'}</pre><small>{m.stage > 0 ? '前置机关已就绪' : '工作区尚未保存'}</small></div>}
   {stage?.mode === 'slider' && <div className="scene-mailboxes"><div className={value !== '0' ? 'has-mail' : ''}><Envelope size={42}/><strong>Releases 版本信</strong><span>{value !== '0' ? '已进入信箱' : '未投递'}</span></div><div className={value === '2' ? 'has-mail' : ''}><Envelope size={42}/><strong>普通 Issue 信</strong><span>{value === '2' ? '已进入信箱' : '未投递'}</span></div></div>}
   {chapter === 8 && <p className="scene-state-line">upstream u1 <CaretRight /> {m.stage > 1 ? '本地 u1 / origin u1' : `本地 ${m.steps.length >= 2 ? 'u1' : 'u0'} / origin u0`} {m.stage === 1 && m.steps.length === 1 ? ' · 远端跟踪记录已取回' : ''}</p>}
   {chapter >= 9 && chapter <= 11 && <p className="scene-state-line">main 竹门保留原状 · {chapter === 9 && m.stage === 0 ? '尚未建立 Branch' : branchName}</p>}
   {chapter === 12 && <p className="scene-state-line">Workflow / Job / Step · {m.stage === 0 && m.steps.length >= 3 ? 'Failed' : m.stage === 2 && m.steps.at(-1)?.includes('Cancelled') ? 'Cancelled' : m.stage > 2 ? 'Passed' : '等待炉火指令'}</p>}
   {chapter === 0 && !done && <button className="scene-decoration" aria-label="调查普通石灯" onClick={() => act("普通石灯")}>石灯 · 无路牌</button>}
   <div className="scene-actor" onTransitionEnd={() => setWalking(false)} style={{ left: `${x}%`, top: `${ground.y + ground.height}%` }}><PlacedCharacter id={state.character!} pose={done ? 'celebrating' : selected ? 'inspecting' : walking ? 'walking' : 'standing'}/></div>
   {scene.npcAnchors.map(npc => <button key={npc.id} className="scene-npc" style={{ left: `${npc.x}%`, top: `${npc.y}%` }} aria-expanded={npcOpen} onClick={() => setNpcOpen(v => !v)}><span className="npc-portrait"><QingyanPortrait /></span><strong>{npc.name}</strong><small>交谈 / 收起</small></button>)}
   {done && <div className="scene-reward"><Stamp size={48}/><h2>{lesson.reward}</h2><p>地点印章已点亮，回到地图揭开下一段迷雾。</p></div>}
  </div>
  <div className="chapter-taskbar"><aside className="chapter-dialogue">{npcOpen ? <><strong>青砚的委托</strong><p>{lesson.story}</p><small>本地教学模拟，不连接 GitHub 账号。</small></> : <Button variant="ghost" onClick={() => setNpcOpen(true)}>重新听取委托</Button>}<div className="chapter-tools"><Button variant="ghost" onClick={() => openBook(stage?.termIds[0])}><BookOpenText />查阅宝典</Button><Button variant="ghost" disabled={!run.events.length} onClick={() => { dispatch({ type: 'undo' }); setSelected(''); }}><ArrowCounterClockwise />撤销</Button><Button variant="ghost" onClick={() => { dispatch({ type: 'restart' }); setSelected(''); setDraft({ stage: -1, value: '' }); }}>重试本章</Button></div></aside>
   <div className="chapter-operation">
    {stage ? <><h2 ref={stageHeading} tabIndex={-1}>{stage.title}</h2><p>{stage.instruction}</p>
     {stage.mode === 'place' && <div className="drop-targets">{stage.targets!.map(target => <button key={target} className="drop-target" aria-label={`放入${target}`} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); act(e.dataTransfer.getData('text/plain'), target); }} onClick={() => act(selected, target)}><Package size={22}/><strong>{target}</strong><span>{Object.entries(m.placed).filter(([, v]) => v === target).map(([k]) => k).join('、') || '等待物件'}</span></button>)}</div>}
     {stage.mode === 'edit' && <div className="scroll-editor"><label htmlFor="chapter-edit">{stage.title}<textarea id="chapter-edit" value={value} onChange={e => setDraft({ stage: m.stage, value: e.target.value })} rows={3} maxLength={3000}/></label><Button onClick={() => act('save', value)}><Stamp />保存并验印</Button></div>}
     {stage.mode === 'slider' && <div className="notification-slider"><label>Watch 通知风铃：{stage.items[Number(value)]}<input aria-label="Watch 通知风铃" type="range" min="0" max="2" value={value} onChange={e => setDraft({ stage: m.stage, value: e.target.value })}/></label><Button onClick={() => act('deliver', value)}>投递并检查信箱</Button></div>}
     {(stage.mode === 'explore' || stage.mode === 'sequence') && <p className="operation-tip">{stage.mode === 'sequence' ? `下一步：${stage.order?.[m.steps.length]}` : '调查场景内物件，观察脚步、路灯与操作证据的变化。'}</p>}
    </> : <><h2 ref={stageHeading} tabIndex={-1}>收束 · {lesson.title}已盖印</h2><p>{scene.returnMapReward.nextHint}</p><Button onClick={() => dispatch({ type: 'map' })}>领取{lesson.reward}，返回地图</Button>{chapter === 12 && <a className="graduation-link" href="/field-practice/">前往自己的 Fork 完成安全毕业练习</a>}</>}
    <p className={`chapter-feedback ${state.error ? 'error' : 'success'}`} role="status">{state.notice}</p>
    <details className="chapter-evidence"><summary>本次动作证据 {m.evidence.length} 条 / 官方来源</summary>{m.evidence.map((text, i) => <p key={text}>{i + 1}. {text}</p>)}<a href={lesson.source} target="_blank" rel="noreferrer">打开官方依据</a>{chapter >= 10 && <p>真实迁移：打开自己的 Fork → 创建修复分支 → Commit / Push → 在自己的 Fork 内创建 Pull Request。均由本人自我检查，不向原仓库发送练习 PR。</p>}</details>
   </div>
  </div>
 </section>;
}
