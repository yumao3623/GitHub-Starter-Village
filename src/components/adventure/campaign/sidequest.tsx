'use client';
import {useEffect, useRef, useState} from 'react';
import {earnedChapters, type WuxiaAction, type WuxiaState} from '@/core/game/wuxia';
import {bestScoringIndices, innPayout, innTotal, rollDice, scoreDice, type InnRun} from '@/core/game/inn';
import {innRank, innRules} from '@/content/minigames/inn';
import {Act} from './shared';

const pipPositions: Record<number, number[]> = {1:[4],2:[0,8],3:[0,4,8],4:[0,2,6,8],5:[0,2,4,6,8],6:[0,2,3,5,6,8]};
export async function exportInnCard(run: InnRun) {
  await document.fonts.ready;
  const paper = new window.Image();
  paper.src = '/assets/phase-c/refined/map-paper.png'; await paper.decode();
  const canvas=document.createElement('canvas');canvas.width=960;canvas.height=1440;
  const c=canvas.getContext('2d');if(!c)throw new Error('无法生成成绩卡');
  c.fillStyle='#d9ddcc';c.fillRect(0,0,960,1440);
  c.save();c.translate(480,720);c.rotate(Math.PI/2);c.drawImage(paper,-720,-480,1440,960);c.restore();
  const text=(value:string,y:number,size=32,heading=false)=>{c.fillStyle='#29443a';c.font=`${size}px "${heading?'Ma Shan Zheng':'LXGW WenKai'}", serif`;c.textAlign='center';c.fillText(value,480,y,790);};
  text('云溪谷 · 百戏客栈',185,40);text(innRules.name,325,82,true);
  text(run.stake===0?'试桌留影':innRank(innTotal(run)).title,445,58,true);
  text(String(innTotal(run)),625,112);text('三回合总分',685,29);
  c.strokeStyle='#8c785957';c.beginPath();c.moveTo(180,760);c.lineTo(780,760);c.stroke();
  run.scores.forEach((score,i)=>text(`第 ${i+1} 回合     ${score} 分`,840+i*75,34));
  text(run.stake===0?'免费试桌 · 不计收益':`入场 ${run.stake} 文 · 返还 ${innPayout(run)} 文`,1115,31);
  text('GitHub 新手村',1240,36,true);text('离线单机成绩 · 仅虚拟货币',1300,25);
  const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('图片导出失败')),'image/png'));
  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`云溪谷-六骰聚财-${innTotal(run)}分.png`;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);
}

export function SideQuest({state,dispatch,onClose}:{state:WuxiaState;dispatch:React.Dispatch<WuxiaAction>;onClose:()=>void}) {
  const [selected,setSelected]=useState<number[]>([]),[rules,setRules]=useState(false),[exportNotice,setExportNotice]=useState(''),[leaving,setLeaving]=useState(false);
  const dialog=useRef<HTMLDivElement>(null);
  const unlocked=state.demo||earnedChapters(state).length>=innRules.unlockChapters;
  const run=state.inn.active, total=run?innTotal(run):0;
  const points=run?scoreDice(selected.map(i=>run.dice[i])):0;
  const nextRank=innRules.payouts.find(t=>t.score>total+(run?.pot??0));
  useEffect(()=>{const previous=document.activeElement as HTMLElement|null;const priorOverflow=document.body.style.overflow;document.body.style.overflow='hidden';dialog.current?.focus();return()=>{document.body.style.overflow=priorOverflow;previous?.focus();};},[]);
  function keyDown(e:React.KeyboardEvent){
    if(e.key==='Escape'){e.preventDefault();onClose();}
    if(e.key==='Tab'){
      const nodes=dialog.current?.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input,select,summary');if(!nodes?.length)return;
      if(e.shiftKey&&(document.activeElement===nodes[0]||document.activeElement===dialog.current)){e.preventDefault();nodes[nodes.length-1].focus();}
      else if(!e.shiftKey&&document.activeElement===nodes[nodes.length-1]){e.preventDefault();nodes[0].focus();}
    }
  }
  const start=(stake:number)=>{setSelected([]);setExportNotice('');dispatch({type:'inn-start',stake});requestAnimationFrame(()=>dialog.current?.scrollTo({top:0}));};
  const play=(event:Parameters<typeof dispatch>[0])=>{setSelected([]);dispatch(event);};
  return <div className="inn-overlay"><div ref={dialog} className={`inn-room ${state.inn.decor?'jade-table':''}`} role="dialog" aria-modal="true" aria-label="百戏客栈 · 六骰聚财" tabIndex={-1} onKeyDown={keyDown}>
    <header className="inn-heading"><div><small>百戏客栈</small><h2>{innRules.name}</h2><p>见好就收，还是再掷一手？</p></div><div className="inn-wallet"><strong>{state.wallet.copper} 文 · {state.wallet.silver} 两</strong><span>最高 {state.inn.bestScore} 分</span></div><Act onClick={onClose}>回地图</Act></header>
    <div className="inn-layout"><section className="inn-table">
      {!run||run.stage==='finished'?<>
        {run?.stage==='finished'?<div className="inn-results" aria-live="polite"><small>{run.stake===0?'试桌结算':'本轮结算'}</small><h3>{innRank(total).title}</h3><strong className="inn-score">{total}<small> 分</small></strong><div className="inn-rounds">{run.scores.map((score,i)=><div key={i}><small>第 {i+1} 回合</small><strong>{score} 分</strong></div>)}</div><p>{run.stake===0?'本次试桌不增减铜钱，不计最高分。':`返还 ${innPayout(run)} 文（含本金），本轮净${innPayout(run)>=run.stake?'得':'支出'} ${Math.abs(innPayout(run)-run.stake)} 文。`}</p><Act onClick={async()=>{try{await exportInnCard(run);setExportNotice('成绩卡已导出。');}catch{setExportNotice('未能导出图片，请重试。');}}}>保存称号卡 · PNG</Act><span role="status">{exportNotice}</span></div>:<div className="inn-welcome"><span className="inn-host-art" aria-hidden/><h3>一盅六骰，三回合定高下。</h3><ol>{innRules.steps.map(t=><li key={t}>{t}</li>)}</ol></div>}
        <div className="inn-entry"><h3>{run?'另开一轮':'选一张桌'}</h3>{!unlocked&&<p>第零至第四章完成后开门。现在可先试桌，熟悉玩法。</p>}<div className="choice-row"><Act onClick={()=>start(0)}>免费试桌</Act>{innRules.stakes.map(stake=><Act key={stake} disabled={!unlocked||state.demo||state.wallet.copper<stake||(stake===20&&!state.inn.decor)} onClick={()=>start(stake)}>{stake===20?'高手场':'入场'} · {stake} 文</Act>)}</div><small>一轮只收一次入场筹码。中途离开会保留桌面，可随时回来继续。</small></div>
      </>:<>
        <div className="inn-round-heading"><span>第 {run.round} / 3 回合{run.stake===0?' · 试桌':''}</span><span>已收 {total} 分 · 入场 {run.stake} 文</span></div>
        <div className="inn-pot"><small>本回合未收</small><strong>{run.pot}<span> 分</span></strong><p>{nextRank?`距「${nextRank.title}」还差 ${nextRank.score-total-run.pot} 分`:'已达最高称号，收下即可保住分数。'}</p></div>
        <div key={`${run.id}-${run.rolls}`} className={`inn-dice ${run.stage==='choose'&&!state.reducedMotion?'just-rolled':''}`} aria-label="骰子盘面">
          {run.stage==='choose'?run.dice.map((die,i)=><button key={i} className={`inn-die ${selected.includes(i)?'selected':''}`} aria-label={`第 ${i+1} 颗：${die} 点`} aria-pressed={selected.includes(i)} onClick={()=>setSelected(ids=>ids.includes(i)?ids.filter(n=>n!==i):[...ids,i])}><span className={`die-pips ${die===1||die===4?'red-pips':''}`} aria-hidden>{Array.from({length:9},(_,p)=><i key={p} className={pipPositions[die].includes(p)?'dot':''}/>)}</span></button>):<div className="inn-cup"><span aria-hidden className="inn-host-art"/><p>{run.stage==='round-end'?'这一回合结束了':`${run.remaining} 颗骰子待掷`}</p></div>}
        </div>
        <p className="inn-message" role="status">{state.error?state.notice:run.message}</p>
        <div className="inn-controls">
          {run.stage==='choose'&&<><Act disabled={!points} onClick={()=>play({type:'inn-act',event:{type:'keep',indices:selected}})}>留下得分骰{points?` · ${points} 分`:''}</Act><button className="text-action" onClick={()=>setSelected(bestScoringIndices(run.dice))}>帮我选得分骰</button></>}
          {run.stage==='roll'&&<><Act onClick={()=>play({type:'inn-act',event:{type:'roll',dice:rollDice(run.remaining)}})}>{run.pot?'再掷一手':'开盅掷骰'} · {run.remaining} 颗</Act><Act disabled={run.pot===0} onClick={()=>play({type:'inn-act',event:{type:'bank'}})}>稳稳收下 {run.pot} 分</Act></>}
          {run.stage==='round-end'&&<Act onClick={()=>play({type:'inn-act',event:{type:'next'}})}>下一回合</Act>}
        </div>
        <div className="inn-rounds">{[0,1,2].map(i=><div key={i}><small>第 {i+1} 回合</small><strong>{run.scores[i]===undefined?'待收分':`${run.scores[i]} 分`}</strong></div>)}</div>
        {leaving?<div className="choice-row"><span>放弃本回合未收分数，按已收分数结算？</span><Act onClick={()=>{setLeaving(false);play({type:'inn-act',event:{type:'abandon'}});}}>提前结算</Act><Act onClick={()=>setLeaving(false)}>继续玩</Act></div>:<button className="text-action inn-leave" onClick={()=>setLeaving(true)}>提前结算这一轮</button>}
      </>}
    </section><aside className="inn-rulebook"><h3>聚财榜</h3><p>三回合总分决定返还，返还已含入场本金。</p><table><thead><tr><th>总分</th><th>返还</th><th>称号</th></tr></thead><tbody>{innRules.payouts.map(t=><tr key={t.score} className={run&&innRank(total).score===t.score?'current-rank':''}><td>{t.score}+</td><td>{t.multiplier} 倍</td><td>{t.title}</td></tr>)}</tbody></table><button className="text-action" onClick={()=>setRules(v=>!v)} aria-expanded={rules}>{rules?'收起':'查看'}得分组合</button>{rules?<ul>{innRules.combinations.map(t=><li key={t}>{t}</li>)}</ul>:<p>一点、五点、三同都能得分。选中后留骰，再决定收分或续掷。</p>}<div className="inn-decoration"><h3>青玉骰桌</h3><p>一两银票，永久换桌面与 20 文高手场。骰子概率相同。</p><Act disabled={state.inn.decor||state.wallet.silver<1} onClick={()=>dispatch({type:'inn-decor'})}>{state.inn.decor?'青玉桌已入藏':'换青玉桌 · 1 两'}</Act></div><small>主线首通得 10 文；完整重玩得 4 文。第四、八、十二章另赠一两。铜钱可买章内详解、入场；银票换永久藏品。</small><p className="inn-disclaimer">离线娱乐 · 仅虚拟货币</p></aside></div>
  </div></div>;
}
