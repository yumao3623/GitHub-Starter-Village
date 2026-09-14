import {advanceInn,newInnRun,innTotal,innPayout,type InnEvent} from './inn';
import {innRank,innRules} from '@/content/minigames/inn';
import { applyCampaignEvent, freshCampaignRun, hasCampaignAward, replayCampaign, type CampaignEvent } from './campaign';
import { lastCampaignChapter, passDefinitions, requiredPass } from '@/content/minigames/campaign';
import { freshWuxiaSave, parseWuxiaSave, type WuxiaSave, chapterEarned } from "@/core/persistence/chapter-storage";
import { chapterLessons } from "@/content/minigames/chapters";
import { applyChapterEvent, freshChapter, replayChapter, runComplete, type ChapterEvent } from "./chapter-games";
export type WuxiaState = WuxiaSave & {
    ready: boolean;
    view: 'intro' | 'choose' | 'map' | 'chapter';
    notice: string;
    error: boolean;
    storageIssue: string | null;
    rewardFrom: number | null;
    demo: boolean;
};
export const initialWuxia = (demo = false): WuxiaState => ({ ...freshWuxiaSave(), ready: demo, introRead: demo, character: demo ? 'atuan' : null, view: demo ? 'map' : 'intro', notice: demo ? '演示地图已展开；这里不读取正式存档。' : '', error: false, storageIssue: null, rewardFrom: null, demo });
export type WuxiaAction = { type: 'campaign-act'; event: CampaignEvent } | {type:'campaign-undo'|'campaign-restart'|'campaign-variant'|'wallet-exchange'|'tutorial-done'|'demo-start'} | {type:'inn-start';stake:number} | {type:'inn-act';event:InnEvent} | {type:'inn-decor'} | {type:'buy-hint'} | { type:'import'; save:unknown } | {
    type: 'hydrate';
    save: WuxiaSave | null;
    issue?: string;
} | {
    type: 'intro';
} | {
    type: 'character';
    id: WuxiaSave['character'];
} | {
    type: 'map';
} | {
    type: 'enter';
    chapter: number;
} | {
    type: 'act';
    event: ChapterEvent;
} | {
    type: 'undo' | 'restart';
} | {
    type: 'bookmark' | 'review';
    id: string;
} | {
    type: 'motion';
    reduced: boolean;
} | {
    type: 'storage-error';
    issue: string;
} | {
    type: 'wallet-spend';
    amount: number;
    reason: string;
} | {
    type: 'show-intro' | 'reset-save';
};
export const earnedChapters = (s: Pick<WuxiaSave, 'runs' | 'campaign'>) => chapterLessons.filter(l => chapterEarned(s,l.chapter)).map(l => l.chapter);
export const nextChapter = (s: Pick<WuxiaSave, 'runs' | 'campaign'>) => chapterLessons.find(l => !chapterEarned(s,l.chapter))?.chapter ?? lastCampaignChapter;
export function wuxiaReducer(s: WuxiaState, a: WuxiaAction): WuxiaState {
    const error = (notice: string) => ({ ...s, notice, error: true });
    if (a.type === 'import') { const saved=parseWuxiaSave(a.save); return saved?{...s,...saved,ready:true,view:'map',storageIssue:null,notice:'行囊已恢复。',error:false}:error('无法导入：记录未通过章节与账本校验，当前行囊保留。'); }
    if (a.type === 'wallet-exchange') { if(s.wallet.copper<100)return error('兑换一两银票需要一百文铜钱。');return {...s,wallet:{...s.wallet,copper:s.wallet.copper-100,silver:s.wallet.silver+1},notice:'一百文铜钱已换一两银票；总值不变。',error:false}; }
    if (a.type === 'inn-decor') {
        if(s.inn.decor)return s;
        if(s.wallet.silver<innRules.decorPrice)return error('一两银票可换青玉骰桌；普通桌与免费试桌仍可玩。');
        return {...s,inn:{...s.inn,decor:true},wallet:{...s.wallet,silver:s.wallet.silver-1,ledger:[...s.wallet.ledger,{id:'inn:jade',amount:-100,reason:'购入青玉骰桌与高手场（永久）'}]},notice:'青玉骰桌已铺好，20 文高手场开放。',error:false};
    }
    if (a.type === 'inn-start') {
        if(s.inn.active&&s.inn.active.stage!=='finished')return error('桌上还有一轮未结束，可继续或提前结算。');
        if(a.stake!==0&&!innRules.stakes.includes(a.stake as 5|10|20))return error('请选择桌上的筹码档位。');
        if(a.stake>0&&!s.demo&&earnedChapters(s).length<innRules.unlockChapters)return error('完成第零至第四章后可入场；现在可免费试桌。');
        if(a.stake===20&&!s.inn.decor)return error('先用银票换青玉桌，再进入高手场。');
        if(s.wallet.copper<a.stake)return error('铜钱不足，可免费试桌或重访主线赚取盘缠。');
        const id=(s.inn.active?.id??0)+1;
        const stake=s.demo?0:a.stake;
        return {...s,inn:{...s.inn,active:newInnRun(id,stake)},wallet:{...s.wallet,copper:s.wallet.copper-stake,ledger:stake?[...s.wallet.ledger,{id:`inn:${id}:entry`,amount:-stake,reason:'六骰聚财入场'}]:s.wallet.ledger},notice:'骰盅已备。',error:false};
    }
    if (a.type === 'inn-act') {
        if(!s.inn.active)return error('先选一张桌。');
        const result=advanceInn(s.inn.active,a.event);if(result.error)return error(result.error);
        const active=result.run,inn={...s.inn,active},wallet=structuredClone(s.wallet);
        if(active.stage==='finished'&&!active.settled){
            active.settled=true;
            if(active.stake>0){
                const score=innTotal(active),payout=innPayout(active),title=innRank(score).title;
                wallet.copper+=payout;wallet.ledger.push({id:`inn:${active.id}:settled`,amount:payout,reason:`六骰聚财 ${score} 分返还`});
                inn.plays++;inn.bestScore=Math.max(inn.bestScore,score);inn.titles=[...new Set([...inn.titles,title])];
            }
        }
        return {...s,inn,wallet,notice:active.message,error:false};
    }
    if (a.type === 'hydrate') {
        const saved = a.save ? parseWuxiaSave(a.save) : null;
        return { ...s, ...saved, ready: true, view: saved?.character ? 'intro' : saved?.introRead ? 'choose' : 'intro', storageIssue: a.issue ?? null, notice: saved?.character ? '继续上次历练，或重新查看入村指南。' : '本地教学模拟，所有真实 GitHub 操作由你自己完成。' };
    }
    if (a.type === 'demo-start')
        return { ...s, ready: true, introRead: true, character: 'atuan', view: 'map', currentChapter: null, notice: '演示地图已展开；这里不读取正式存档。', error: false };
    if (!s.ready)
        return s;
    if (a.type === 'storage-error')
        return { ...s, storageIssue: a.issue };
    if (a.type === 'reset-save')
        return { ...initialWuxia(s.demo), ready: true };
    if (a.type === 'show-intro')
        return { ...s, view: 'intro' };
    if (a.type === 'intro')
        return { ...s, introRead: true, view: s.character ? 'map' : 'choose', currentChapter: null };
    if (a.type === 'character')
        return s.introRead ? { ...s, character: a.id } : s;
    if (a.type === 'motion')
        return { ...s, reducedMotion: a.reduced };
    if (a.type === 'wallet-spend') {
        if (!Number.isInteger(a.amount) || a.amount < 0 || s.wallet.copper < a.amount)
            return error('钱袋不足；免费提示仍可使用。');
        return { ...s, wallet: { ...s.wallet, copper: s.wallet.copper - a.amount, ledger:[...s.wallet.ledger,{id:`spend:${s.wallet.ledger.length}`,amount:-a.amount,reason:a.reason}] }, notice: `${a.reason}，耗用 ${a.amount} 枚铜钱。`, error: false };
    }
    if (a.type === 'bookmark' || a.type === 'review') {
        const key = a.type === 'bookmark' ? 'bookmarks' : 'review';
        return { ...s, [key]: s[key].includes(a.id) ? s[key].filter(id => id !== a.id) : [...s[key], a.id] };
    }
    if (a.type === 'map') {
        if (!s.character)
            return error('先选择同行角色。');
        const chapter = s.currentChapter;
        return { ...s, view: 'map', rewardFrom: chapter !== null && chapterEarned(s,chapter) ? chapter : null, currentChapter: null, notice: chapter !== null && chapterEarned(s,chapter) ? `${chapterLessons[chapter].reward} 已收入行囊。下一段道路已显现。` : '沿山道寻找当前地点。', error: false };
    }
    if (a.type === 'enter') {
        if (!s.character || !chapterLessons[a.chapter])
            return error('先选择角色并进入地图。');
        if (!s.demo && a.chapter > nextChapter(s))
            return error('前方仍有迷雾，先完成前一章。');
        const pass=requiredPass(a.chapter);
        // Pass gating belongs to the Stage C campaign. Legacy causal runs may
        // still be replayed/imported without the new pass ledger.
        if(!s.demo&&Object.keys(s.campaign).length>0&&pass&&!s.wallet.passes.includes(pass.id))return error(`先取得${pass.issuer}签发的${pass.id}。`);
        // Keep the legacy run slot materialized for save compatibility while
        // the Stage C campaign journal lives beside it. This lets older
        // imports and the original causal-action tests resume cleanly.
        const runs = s.runs[a.chapter] ? s.runs : { ...s.runs, [a.chapter]: freshChapter() };
        return { ...s, runs, view: 'chapter', currentChapter: a.chapter, rewardFrom: null, notice: chapterLessons[a.chapter].story, error: false };
    }
    const chapter = s.currentChapter;
    if (chapter === null || s.view !== 'chapter')
        return s;
    if(a.type==='buy-hint'){
      const id=`hint:${chapter}`;if(s.wallet.ledger.some(t=>t.id===id))return s;
      if(s.wallet.copper<5)return error('铜钱不足，免费引路仍可使用。');
      return {...s,wallet:{...s.wallet,copper:s.wallet.copper-5,ledger:[...s.wallet.ledger,{id,amount:-5,reason:`第 ${chapter} 章购入随身详解（永久）`}]},notice:'随身详解已展开，本章重访仍可免费查看。',error:false};
    }
    if(a.type==='tutorial-done')return {...s,tutorials:[...new Set([...s.tutorials,chapter])]};
    if(a.type.startsWith('campaign-')){
      const run=s.campaign[chapter]??freshCampaignRun();
      const board=replayCampaign(chapter,run);if(!board)return error('当前机关记录异常，请导出行囊。');
      if(a.type==='campaign-undo'||a.type==='campaign-restart'||a.type==='campaign-variant'){
        const archives=board.done&&!run.archives.some(r=>r.seed===run.seed)?[...run.archives,{seed:run.seed,events:run.events}]:run.archives;
        return {...s,campaign:{...s.campaign,[chapter]:{seed:a.type==='campaign-variant'?1-run.seed:run.seed,events:a.type==='campaign-undo'?run.events.slice(0,-1):[],archives,attempt:a.type==='campaign-undo'?run.attempt:run.attempt+1,paid:a.type==='campaign-undo'?run.paid:false}},notice:'机关已复位。完整重玩一局可得 4 文盘缠，撤销不重复领奖。',error:false};
      }
      if(a.type==='campaign-act'){
        if(run.events.length>=450)return error('本局动作记录已满，可免费重置后继续，历史奖励保留。');
        if(a.event.type==='use-item'&&!s.wallet.passes.includes(a.event.id??''))return error('行囊中没有这件通行凭证；先完成签发它的前一章。');
        const result=applyCampaignEvent(chapter,board,a.event);if(result.error)return error(result.error);
        const wallet=structuredClone(s.wallet);
        const transact=(id:string,amount:number,reason:string)=>{if(wallet.ledger.some(t=>t.id===id))return;wallet.copper+=amount;wallet.ledger.push({id,amount:amount||0,reason});};
        const wagerId=`wager:${chapter}:${run.seed}`;
        const existingWager=wallet.ledger.find(t=>t.id===wagerId);
        if(chapter===5&&a.event.type==='wager'&&existingWager&&Number(a.event.value)!==-existingWager.amount)return error(`本轮已选择 ${-existingWager.amount} 文彩头，重置不改变已入账投入；请选择相同金额。`);
        if(chapter===5&&a.event.type==='wager'&&!existingWager){
          const amount=Number(a.event.value);if(amount>wallet.copper)return error('铜钱不足，可选零彩头；所有知识与奖励一致。');transact(wagerId,-amount,'鉴宝虚拟彩头入盘');
        }
        if(chapter===5&&(result.board.done||result.board.flags.includes('marketLost'))&&!wallet.ledger.some(t=>t.id===`${wagerId}:settled`))transact(`${wagerId}:settled`,result.board.flags.includes('marketLost')?0:result.board.numbers.wager*2,result.board.flags.includes('marketLost')?'彩头败局结算（仅一次）':'凭证赢回彩头（本金与同额奖励）');
        if(result.board.done){
          if(run.attempt>0&&!run.paid)transact(`replay:${chapter}:${run.attempt}`,4,`第 ${chapter} 章重访完成`);
          if([4,8,12].includes(chapter)&&!wallet.ledger.some(t=>t.id===`silver:${chapter}`)){wallet.silver++;wallet.ledger.push({id:`silver:${chapter}`,amount:100,reason:`第 ${chapter} 章里程碑银票`});}
          if(!wallet.awardedChapters.includes(chapter)){transact(`clear:${chapter}`,10,`第 ${chapter} 章首通`);wallet.awardedChapters.push(chapter);}
          if(run.seed===1&&!hasCampaignAward(chapter,run,1))transact(`transfer:${chapter}`,5,`第 ${chapter} 章迁移挑战`);
          passDefinitions.filter(p=>p.chapter===chapter).forEach(p=>{if(!wallet.passes.includes(p.id))wallet.passes.push(p.id);});
        }
        return {...s,wallet,campaign:{...s.campaign,[chapter]:{...run,events:[...run.events,a.event],paid:run.paid||result.board.done}},notice:result.board.done?'本局奖励已收入行囊。可前往下一站，或完整重玩一局赚取 4 文盘缠。':result.board.feedback,error:false};
      }
    }
    const run = s.runs[chapter] ?? freshChapter();
    if (a.type === 'undo' || a.type === 'restart') {
        const archives = runComplete(chapter, run.events) ? [...run.archives, run.events].slice(-3) : run.archives;
        return { ...s, runs: { ...s.runs, [chapter]: { ...run, archives, events: a.type === 'undo' ? run.events.slice(0, -1) : [] } }, notice: a.type === 'undo' ? '已撤销最后一个动作。已领取的奖励保留。' : '本章机关已复位，其他章节与历史奖励保留。', error: false };
    }
    if (a.type === 'act') {
        const m = replayChapter(chapter, run.events)!;
        const result = applyChapterEvent(chapter, m, a.event);
        if (result.error)
            return { ...error(result.error), runs: { ...s.runs, [chapter]: { ...run, mistakes: run.mistakes + 1 } } };
        const completedNow = result.model.stage === chapterLessons[chapter].stages.length && m.stage < result.model.stage;
        const alreadyAwarded = s.wallet.awardedChapters.includes(chapter);
        const wallet = completedNow && !alreadyAwarded ? { ...s.wallet, copper: s.wallet.copper + 10, ledger:[...s.wallet.ledger,{id:`clear:${chapter}`,amount:10,reason:`第 ${chapter} 章首通`}], awardedChapters: [...s.wallet.awardedChapters, chapter], passes: chapter === 0 && !s.wallet.passes.includes('云溪路引') ? [...s.wallet.passes, '云溪路引'] : s.wallet.passes } : s.wallet;
        const rewardNotice = completedNow && !alreadyAwarded ? `${chapterLessons[chapter].reward} 已入行囊，铜钱 +10${chapter === 0 ? '，取得云溪路引。' : '。'}` : undefined;
        return { ...s, wallet, runs: { ...s.runs, [chapter]: { ...run, events: result.model.history } }, notice: rewardNotice ?? (result.model.stage > m.stage ? result.model.evidence.at(-1)! : `${a.event.item} 已改变场景状态。继续观察下一件物件。`), error: false };
    }
    return s;
}
