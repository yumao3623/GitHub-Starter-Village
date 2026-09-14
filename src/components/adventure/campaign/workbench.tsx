'use client';
import {useState} from 'react';
import {mentorNotes} from '@/content/minigames/mentor-notes';
import type {WuxiaState,WuxiaAction} from '@/core/game/wuxia';
import {freshCampaignRun,replayCampaign} from '@/core/game/campaign';
import {campaignRules,numerals,passDefinitions,requiredPass,chapterAid,chapterAidCopy,campaignNextStep} from '@/content/minigames/campaign';
import {chapterLessons} from '@/content/minigames/chapters';
import {Act,Art} from './shared';
import {RouteBoard,SecurityBoard,WorkshopBoard,FurnaceBoard,ShelfBoard} from './early-boards';
import {MarketBoard,MailBoard,IssueBoard,TransportBoard} from './middle-boards';
import {BranchBoard,StageBoard,ReviewBoard,PipelineBoard} from './late-boards';
const boards=[RouteBoard,SecurityBoard,WorkshopBoard,FurnaceBoard,ShelfBoard,MarketBoard,MailBoard,IssueBoard,TransportBoard,BranchBoard,StageBoard,ReviewBoard,PipelineBoard];
export function CampaignWorkbench({state,dispatch,openBook}:{state:WuxiaState;dispatch:React.Dispatch<WuxiaAction>;openBook:(id?:string)=>void}){
 const chapter=state.currentChapter!,run=state.campaign[chapter]??freshCampaignRun(),b=replayCampaign(chapter,run)!;
 const rule=campaignRules[chapter],lesson=chapterLessons[chapter],Board=boards[chapter];
 const [guide,setGuide]=useState(!state.tutorials.includes(chapter)),[evidence,setEvidence]=useState(false);
 const [notes,setNotes]=useState(false);
 const hasNotes=state.wallet.ledger.some(t=>t.id===`hint:${chapter}`);
 const pass=requiredPass(chapter),reward=passDefinitions.find(p=>p.chapter===chapter);
 const aid=chapterAid(chapter),aidReady=!!aid&&state.wallet.passes.includes(aid.id)&&!b.flags.includes(`aid:${aid.id}`);
 return <section className={`campaign-workbench chapter-${chapter}`} data-chapter={chapter} data-seed={run.seed} data-complete={b.done}>
 <header className="campaign-heading"><div><small>第{numerals[chapter]}章 · {run.seed?'迁移挑战':'主线历练'} · 本地教学模拟</small><h1>{lesson.title}<span>{rule.name}</span></h1></div><div className="campaign-mission"><strong>{rule.goal}</strong><small>{pass?`已核验通行凭证：${pass.id}`:'从阅读 README 开始'} · {state.wallet.copper} 文 / {state.wallet.silver} 两</small></div><Act onClick={()=>dispatch({type:'map'})}>合卷回地图</Act></header>
 <div className="campaign-rule"><span>{rule.rule}</span><button className="text-action" onClick={()=>setGuide(true)}>看师父演示</button></div>
 <div className="campaign-next-step" role="note"><strong>下一步</strong><span>{campaignNextStep(chapter,b)}</span>{aid&&state.wallet.passes.includes(aid.id)&&<span title={chapterAidCopy(chapter)}><Act className="aid-action" chosen={!aidReady} disabled={!aidReady} onClick={()=>dispatch({type:'campaign-act',event:{type:'use-item',id:aid.id}})}>{b.flags.includes(`aid:${aid.id}`)?`已用${aid.id}`:`使用${aid.id} · 获一条线索`}</Act></span>}<Act className="hint-action" disabled={!hasNotes&&state.wallet.copper<5} onClick={()=>{if(!hasNotes)dispatch({type:'buy-hint'});setNotes(true);}}>{hasNotes?'翻看随身详解':'购入随身详解 · 5文'}</Act></div>
 <div className="campaign-playarea"><Board key={`${chapter}-${run.seed}`} b={b} send={event=>dispatch({type:'campaign-act',event})}/></div>
 <footer className="campaign-feedback"><div role={state.error?'alert':'status'} className={state.error?'error':''}><strong>{b.done?'本章已记功':state.error?'再观察一步':'场景回声'}</strong><p>{state.notice||b.feedback}</p></div><div className="choice-row"><Act onClick={()=>dispatch({type:'campaign-undo'})}>撤销一步</Act><Act onClick={()=>dispatch({type:'campaign-restart'})}>重置本局</Act><Act onClick={()=>setEvidence(true)}>证据与知识</Act>{b.done&&<><Act onClick={()=>dispatch({type:'campaign-variant'})}>换一局检验理解</Act><Act onClick={()=>dispatch({type:'map'})}>收起{reward?.id??'残页'} · 回地图</Act></>}</div></footer>
 {guide&&<div className="campaign-overlay"><section role="dialog" aria-modal="true" aria-label="本章师父演示"><Art chapter={chapter} index={0}/><small>青砚 · 手把手引路</small><h2>{rule.name}</h2><p>{rule.firstStep}</p><p>{rule.rule}</p><ol><li>读清本局委托，点选盘面中的实物。</li><li>观察状态变化；错误会指出具体原因，随时免费撤销。</li><li>完成后核对知识证据，再收取路引。换一局会改变局面。</li></ol><p>鼠标点选或 Tab / Enter 均可操作。飞笺可暂停，所有章节均无倒计时。</p><Act onClick={()=>{dispatch({type:'tutorial-done'});setGuide(false);}}>我来操作第一步</Act></section></div>}
 {notes&&hasNotes&&<div className="campaign-overlay"><section role="dialog" aria-modal="true" aria-label="随身详解"><h2>{lesson.title} · 师父手记</h2>{mentorNotes[chapter].map(t=><p key={t}>{t}</p>)}<small>已经收进行囊，本章重访不再收费。</small><div className="choice-row"><Act onClick={()=>setNotes(false)}>回到盘面</Act></div></section></div>}
 {evidence&&<div className="campaign-overlay"><section role="dialog" aria-modal="true" aria-label="本章证据"><h2>随身札记 · {rule.name}</h2><p>这些记录来自本局已完成的操作；真实 GitHub 行为仍由本人自我检查。</p><div className="evidence-reading">{b.evidence.length?b.evidence.map((e,i)=><p key={i}>{e}</p>):<p>先动手操作，证据会随场景变化记录。</p>}<div className="choice-row">{rule.termIds.map(id=><button className="text-action" key={id} onClick={()=>openBook(id)}>{id}</button>)}</div><a href={rule.source} target="_blank" rel="noreferrer">阅读 GitHub 官方说明</a></div><Act onClick={()=>setEvidence(false)}>回到盘面</Act></section></div>}
 </section>;
}
