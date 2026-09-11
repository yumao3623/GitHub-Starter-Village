'use client';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Flag, LockKey, Stamp, Compass } from '@phosphor-icons/react';
import { chapterScenes } from '@/content/scenarios/chapter-scenes';
import { earnedChapters, nextChapter, type WuxiaState, type WuxiaAction } from '@/core/game/wuxia';
import { PlacedCharacter } from './character-placement';
import { Button } from '@/components/ui/button';
export function JianghuMap({ state, dispatch }: {
    state: WuxiaState;
    dispatch: React.Dispatch<WuxiaAction>;
}) {
    const scroll = useRef<HTMLDivElement>(null);
    const [size, setSize] = useState({ w: 1200, h: 700 });
    const [arrived, setArrived] = useState(false);
    useEffect(() => { if (!scroll.current)
        return; const observer = new ResizeObserver(([entry]) => setSize({ w: entry.contentRect.width, h: entry.contentRect.height })); observer.observe(scroll.current); return () => observer.disconnect(); }, []);
    const earned = earnedChapters(state);
    const next = nextChapter(state);
    const target = chapterScenes[next];
    const from = state.rewardFrom !== null ? chapterScenes[state.rewardFrom] : target;
    const moving = state.rewardFrom !== null && state.rewardFrom < 12;
    const route = chapterScenes.slice(from.chapter + 1, next + 1).map((p, i) => { const prev = chapterScenes[from.chapter + i].mapAnchor; const q = p.mapAnchor; return `Q ${(prev.x + q.x) * size.w / 200} ${(prev.y + q.y) * size.h / 200 + 35} ${q.x * size.w / 100} ${q.y * size.h / 100}`; }).join(' ');
    const path = `path('M ${from.mapAnchor.x * size.w / 100} ${from.mapAnchor.y * size.h / 100} ${route}')`;
    return <section className="jianghu-map" aria-labelledby="jianghu-title"><header className="map-caption"><small>从村口入谷，沿山道向右历练</small><h1 id="jianghu-title">云溪谷 · 十三章江湖</h1><p>地点、道具与迷雾记录你的主线进度。</p></header>
  <div ref={scroll} className="jianghu-scroll"><div className="jianghu-art"/>
   <svg className="jianghu-road" viewBox="0 0 1200 700" preserveAspectRatio="none" aria-hidden>{chapterScenes.slice(1).map((scene, i) => { const p = chapterScenes[i].mapAnchor; const q = scene.mapAnchor; return <path key={scene.chapter} className={scene.chapter <= next ? 'open' : ''} d={`M ${p.x * 12} ${p.y * 7} Q ${(p.x + q.x) * 6} ${(p.y + q.y) * 3.5 + 35} ${q.x * 12} ${q.y * 7}`}/>; })}</svg>
   {chapterScenes.map(scene => {
            const locked = scene.chapter > next;
            const anchor = scene.mapAnchor;
            const clearing = moving && scene.chapter === next;
            return <div key={scene.chapter} className="map-region" data-region={scene.parentMapRegionId}>
    {(scene.chapter === next + 1 || clearing) && <div aria-hidden data-fog-for={scene.chapter} className={`jianghu-fog ${clearing ? 'revealing' : ''}`} style={{ left: `${anchor.x - 6}%`, width: scene.chapter === next + 1 ? `${100 - anchor.x + 6}%` : undefined }}/>}
    <div className={`place-pin ${locked ? 'locked' : earned.includes(scene.chapter) ? 'earned' : 'current'}`} style={{ left: `${anchor.x}%`, top: `${anchor.y}%` }}>{locked ? <span className="locked-landmark" aria-label={`第 ${scene.chapter} 章 ${scene.title}，完成前一章解锁`}><LockKey size={20}/><small>{scene.chapter}</small></span> : <button aria-label={`第 ${scene.chapter} 章 · ${scene.title}`} onClick={() => dispatch({ type: 'enter', chapter: scene.chapter })}>{earned.includes(scene.chapter) ? <Stamp size={24}/> : <Flag size={26}/>}<strong>{scene.chapter} · {scene.title}</strong>{earned.includes(scene.chapter) && <small>{scene.returnMapReward.item}</small>}</button>}</div>
   </div>;
        })}
   <div className="map-character-plane"><div key={`${state.rewardFrom}-${next}`} onAnimationEnd={e => { if (e.animationName === 'walk-road')
        setArrived(true); }} className={`map-traveller ${moving ? 'travelling' : ''}`} style={{ left: moving ? 0 : `${target.mapAnchor.x}%`, top: moving ? 0 : `${target.mapAnchor.y}%`, offsetPath: moving ? path : undefined } as CSSProperties}><PlacedCharacter id={state.character!} pose={moving && !arrived ? 'walking' : 'standing'}/></div></div>
  </div>
  <div className="map-next"><Compass size={30}/><div><strong>{earned.length === 13 ? '云溪谷全线贯通' : `下一站：第 ${next} 章 · ${target.title}`}</strong><p role="status">{state.notice || '只有当前与已完成地点可以进入。'}</p></div><Button onClick={() => dispatch({ type: 'enter', chapter: next })}>{earned.length === 13 ? '重访百炼炉' : '前往当前任务'}</Button></div>
  <details className="map-chapter-index"><summary>主线地点索引（键盘可用）</summary><ol>{chapterScenes.map(scene => <li key={scene.chapter}><button disabled={scene.chapter > next} onClick={() => dispatch({ type: 'enter', chapter: scene.chapter })}>第 {scene.chapter} 章 · {scene.title}</button><span>{earned.includes(scene.chapter) ? '已获印章' : scene.chapter === next ? '当前历练' : '迷雾覆盖'}</span></li>)}</ol></details>
 </section>;
}
