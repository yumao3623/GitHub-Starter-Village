import {describe,it,expect} from 'vitest';
import {applyCampaignEvent,freshCampaignBoard,freshCampaignRun,replayCampaign,validCampaignRun,type CampaignEvent} from '@/core/game/campaign';
import {campaignSolution} from '../helpers/campaign-solutions';
import {campaignChapters,campaignNextStep} from '@/content/minigames/campaign';
import {initialWuxia,wuxiaReducer,nextChapter} from '@/core/game/wuxia';
import {parseWuxiaSave,writeWuxiaSave} from '@/core/persistence/chapter-storage';
function run(ch:number,events:CampaignEvent[],seed=0){let b=freshCampaignBoard(ch,seed);for(const e of events){const result=applyCampaignEvent(ch,b,e);expect(result.error,`${ch}/${seed} ${JSON.stringify(e)}`).toBeUndefined();b=result.board;}return b;}
describe('13 chapters, real state and alternative situations',()=>{
 for(const ch of campaignChapters)for(const seed of [0,1])it(`chapter ${ch} variant ${seed}: solvable and replayable`,()=>{const events=campaignSolution(ch,seed),b=run(ch,events,seed);expect(b.done).toBe(true);expect(b.evidence.length).toBeGreaterThan(2);expect(replayCampaign(ch,{seed,events})).toEqual(b);expect(validCampaignRun(ch,{...freshCampaignRun(seed),events})).toBe(true);});
 it('Fetch does not move local or working; web sync does not update the computer',()=>{const b=run(8,campaignSolution(8).slice(0,3));expect(b.values.tracking).toBe('u1');expect(b.values.local).toBe('u0');expect(b.values.working).toBe('u0');const synced=applyCampaignEvent(8,b,{type:'sync'}).board;expect(synced.values.origin).toBe('u1');expect(synced.values.local).toBe('u0');expect(applyCampaignEvent(8,synced,{type:'push',target:'upstream'}).error).toBeTruthy();});
 it('Stage keeps a snapshot after another working edit and prevents stale commit',()=>{const b=run(10,[{type:'take',id:'readme'},{type:'stage',id:'readme'},{type:'edit-again'}]);expect(b.values['s:readme']).not.toBe(b.values['w:readme']);expect(applyCampaignEvent(10,b,{type:'commit',value:'修复 README 南门入口说明'}).error).toBeTruthy();expect(b.values.local).toBe('模拟 c0');});
 it('blocked cards and finite trays matter; release and main are not same version',()=>{let b=freshCampaignBoard(4);expect(applyCampaignEvent(4,b,{type:'take',id:'license'}).error).toBeTruthy();b=run(4,['readme','branch','history','release'].map(id=>({type:'take',id})));expect(applyCampaignEvent(4,b,{type:'take',id:'public'}).error).toBeTruthy();expect(applyCampaignEvent(4,b,{type:'return',id:'history'}).board.lists.tray).toHaveLength(3);});
 it('branch creation does not switch and dirty overlap blocks switching',()=>{const b=run(9,[{type:'create',target:'m1',value:'fix/east-bridge'}],1);expect(b.values.current).toBe('main');expect(applyCampaignEvent(9,b,{type:'switch'}).error).toBeTruthy();expect(b.values.main).toBe('m1');});
 it('new conflict resolution invalidates previous approval',()=>{const events=campaignSolution(11);const b=run(11,events.slice(0,11));expect(b.flags).toContain('resolved');expect(b.numbers.approved).toBe(0);expect(applyCampaignEvent(11,b,{type:'merge'}).error).toBeTruthy();});
 it('rerun of c1 still fails after c2 pushed; only a new run sees c2',()=>{const b=run(12,campaignSolution(12).slice(0,10));expect(b.values.remote).toBe('c2');expect(b.values.runSha).toBe('c1');expect(b.values.status).toBe('Failed');});
 it('save and economy survive all chapters, repeated clears, undo, exchange and reload',()=>{let s=wuxiaReducer(initialWuxia(),{type:'hydrate',save:null});s=wuxiaReducer(s,{type:'intro'});s=wuxiaReducer(s,{type:'character',id:'atuan'});for(const ch of campaignChapters){s=wuxiaReducer(s,{type:'enter',chapter:ch});expect(s.error).toBe(false);for(const event of campaignSolution(ch))s=wuxiaReducer(s,{type:'campaign-act',event});expect(s.error,s.notice).toBe(false);expect(nextChapter(s)).toBe(Math.min(ch+1,12));expect(parseWuxiaSave(s)).not.toBeNull();}expect(s.wallet.copper).toBe(130);expect(s.wallet.passes).toHaveLength(6);s=wuxiaReducer(s,{type:'wallet-exchange'});expect(s.wallet.silver).toBe(4);expect(s.wallet.copper).toBe(30);s=wuxiaReducer(s,{type:'campaign-undo'});s=wuxiaReducer(s,{type:'campaign-act',event:campaignSolution(12).at(-1)!});expect(s.wallet.copper).toBe(30);let raw='';writeWuxiaSave({setItem:(_,v)=>{raw=v;}},s);expect(parseWuxiaSave(JSON.parse(raw))?.wallet).toEqual(s.wallet);});
 it('bad replay cannot masquerade as completion',()=>{expect(validCampaignRun(8,{...freshCampaignRun(),events:[{type:'receipt'}]})).toBe(false);});
 it('next-step guidance follows the migrated mail order',()=>{
  const b=freshCampaignBoard(6,1);
  expect(campaignNextStep(6,b)).toContain('Watch');
  const read={...b,flags:['flying','read:bad3']};
  expect(campaignNextStep(1,{...freshCampaignBoard(1,1),flags:['read:bad3']})).toContain('读完来信');
  expect(campaignNextStep(6,{...read,step:1})).toContain('信件用途');
 });
 it('chapter passes create an optional cross-chapter aid without bypassing the lesson',()=>{
  let b=freshCampaignBoard(10);
  for(const id of ['readme','route','notice','duplicate'])b=applyCampaignEvent(10,b,{type:'take',id}).board;
  expect(applyCampaignEvent(10,b,{type:'take',id:'translation'}).error).toContain('4个阅读槽');
  b=applyCampaignEvent(10,b,{type:'use-item',id:'分支竹签'}).board;
  expect(b.flags).toContain('aid:分支竹签');
  expect(applyCampaignEvent(10,b,{type:'take',id:'translation'}).error).toBeUndefined();
  expect(applyCampaignEvent(10,b,{type:'use-item',id:'分支竹签'}).error).toContain('已经用过');
 });
 it('reducer refuses an aid that is not in the pouch',()=>{
  let s=wuxiaReducer(initialWuxia(true),{type:'hydrate',save:null});
  s=wuxiaReducer(s,{type:'intro'});s=wuxiaReducer(s,{type:'character',id:'atuan'});s=wuxiaReducer(s,{type:'enter',chapter:1});
  s=wuxiaReducer(s,{type:'campaign-act',event:{type:'use-item',id:'云溪路引'}});
  expect(s.error).toBe(true);expect(s.notice).toContain('没有这件');
 });
});
