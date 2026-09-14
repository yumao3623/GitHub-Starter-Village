import { z } from 'zod';
import { innRunSchema } from '@/core/game/inn';
import { chapterRunSchema, validChapterRun, hasChapterAward } from '@/core/game/chapter-games';
import { campaignRunSchema, validCampaignRun, hasCampaignAward } from '@/core/game/campaign';
import { campaignChapters, lastCampaignChapter, passDefinitions } from '@/content/minigames/campaign';
import { journeyConfig } from '@/config/journey';
export const WUXIA_STORAGE_KEY = journeyConfig.storageKey;
const transactionSchema=z.object({id:z.string().max(100),amount:z.number().int(),reason:z.string().max(200)});
const walletSchema=z.object({copper:z.number().int().nonnegative().default(0),silver:z.number().int().nonnegative().default(0),passes:z.array(z.string()).max(30).default([]),awardedChapters:z.array(z.number().int().min(0).max(lastCampaignChapter)).max(campaignChapters.length).default([]),ledger:z.array(transactionSchema).max(10000).default([])});
const sidequestSchema=z.object({plays:z.number().int().nonnegative().default(0),bestScore:z.number().int().nonnegative().default(0),titles:z.array(z.string().max(80)).max(20).default([])});
const innSchema=z.object({version:z.literal(2),plays:z.number().int().nonnegative(),bestScore:z.number().int().nonnegative(),titles:z.array(z.string().max(80)).max(20),decor:z.boolean(),active:innRunSchema.nullable()});
export const wuxiaSaveSchema=z.object({version:z.literal(3),campaignVersion:z.literal(1).default(1),introRead:z.boolean(),character:z.enum(['xingzhou','zhiwei','atuan']).nullable(),runs:z.record(z.string(),chapterRunSchema),campaign:z.record(z.string(),campaignRunSchema).default({}),tutorials:z.array(z.number().int()).default([]),bookmarks:z.array(z.string()).max(500),review:z.array(z.string()).max(500),reducedMotion:z.boolean(),currentChapter:z.number().int().min(0).max(lastCampaignChapter).nullable(),wallet:walletSchema.default({copper:0,silver:0,passes:[],awardedChapters:[],ledger:[]}),sidequest:sidequestSchema.default({plays:0,bestScore:0,titles:[]}),inn:innSchema.default({version:2,plays:0,bestScore:0,titles:[],decor:false,active:null})});
export type WuxiaSave=z.infer<typeof wuxiaSaveSchema>;
export const freshWuxiaSave=():WuxiaSave=>wuxiaSaveSchema.parse({version:3,introRead:false,character:null,runs:{},bookmarks:[],review:[],reducedMotion:false,currentChapter:null});
export function chapterEarned(s:Pick<WuxiaSave,'runs'|'campaign'>,chapter:number){return hasChapterAward(chapter,s.runs[chapter])||hasCampaignAward(chapter,s.campaign[chapter]);}
export function parseWuxiaSave(value:unknown):WuxiaSave|null{
 const result=wuxiaSaveSchema.safeParse(value);if(!result.success)return null;const s=result.data;
 if(s.character&&!s.introRead)return null;
 const keys=[...Object.keys(s.runs),...Object.keys(s.campaign)];
 if((keys.length||s.currentChapter!==null)&&!s.character)return null;
 for(const [id,run] of Object.entries(s.runs))if(!campaignChapters.includes(Number(id))||!validChapterRun(Number(id),run))return null;
 for(const [id,run] of Object.entries(s.campaign))if(!campaignChapters.includes(Number(id))||!validCampaignRun(Number(id),run))return null;
 for(const id of keys)for(const earlier of campaignChapters.filter(n=>n<Number(id)))if(!chapterEarned(s,earlier))return null;
 if(new Set(s.wallet.ledger.map(t=>t.id)).size!==s.wallet.ledger.length)return null;
 // An opening entry preserves previously spent currency during the version-3 migration.
 if(!s.wallet.ledger.length&&s.wallet.copper+s.wallet.silver*100)s.wallet.ledger.push({id:'legacy-opening',amount:s.wallet.copper+s.wallet.silver*100,reason:'旧行囊余额迁入'});
 for(const ch of campaignChapters.filter(c=>chapterEarned(s,c))){
  if(!s.wallet.awardedChapters.includes(ch)){s.wallet.copper+=10;s.wallet.awardedChapters.push(ch);s.wallet.ledger.push({id:`clear:${ch}`,amount:10,reason:`第 ${ch} 章首通`});}
  for(const p of passDefinitions.filter(p=>p.chapter===ch))if(!s.wallet.passes.includes(p.id))s.wallet.passes.push(p.id);
 }
 if(s.wallet.ledger.reduce((sum,t)=>sum+t.amount,0)!==s.wallet.copper+s.wallet.silver*100)return null;
 return s;
}
export function loadWuxiaSave(storage:Pick<Storage,'getItem'>){try{const raw=storage.getItem(WUXIA_STORAGE_KEY);if(!raw)return {save:null};const save=parseWuxiaSave(JSON.parse(raw));return {save,issue:save?undefined:'存档校验失败，原记录保留。请导出原存档后检查。'};}catch{return {save:null,issue:'无法读取本项目存档；可以临时体验并导出进度。'};}}
export function writeWuxiaSave(storage:Pick<Storage,'setItem'>,save:WuxiaSave){const valid=parseWuxiaSave(save);if(!valid)throw new Error('章节操作记录校验失败');storage.setItem(WUXIA_STORAGE_KEY,JSON.stringify(valid));}
