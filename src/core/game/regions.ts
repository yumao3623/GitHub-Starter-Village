import { z } from "zod";
import { regionLessons, type RegionId } from "@/content/minigames/region-lessons";
export const regionSchema = z.object({ version: z.literal(1), placements: z.record(z.string(),z.string()), domain: z.string(), subscriptions: z.object({ star:z.boolean(), follow:z.boolean(), watch:z.enum(["none","releases","all"]) }), delivered:z.boolean(), confidential:z.boolean(), mistakes:z.number().int().nonnegative() });
export const freshRegions = (): z.infer<typeof regionSchema> => ({ version:1, placements:{}, domain:"", subscriptions:{ star:false, follow:false, watch:"none" }, delivered:false, confidential:false, mistakes:0 });
export type Regions = z.infer<typeof regionSchema>;
export type RegionEvent = { region:RegionId; op:"place"|"domain"|"subscribe"|"deliver"|"report"|"reset"; key:string; value:string };
export function regionDone(state:Regions, id:RegionId) {
  if(id==="follow") return state.delivered;
  const lesson=regionLessons[id];
  return Object.entries(lesson.pairs).every(([card,target])=>state.placements[`${id}:${card}`]===target) && (id!=="safety"||state.domain==="https://github.com/login") && (id!=="governance"||state.confidential);
}
export function validRegions(state:Regions) {
  for(const [key,value] of Object.entries(state.placements)) {
    const [id,...parts]=key.split(":"); const region=regionLessons[id as RegionId];
    if(!region || !("pairs" in region) || Object.entries(region.pairs).find(([card])=>card===parts.join(":"))?.[1]!==value) return false;
  }
  return (!state.domain || state.domain==="https://github.com/login") && (!state.delivered || state.subscriptions.star && state.subscriptions.follow && state.subscriptions.watch==="releases") && (!state.confidential || Object.entries(regionLessons.governance.pairs).every(([card,target])=>state.placements[`governance:${card}`]===target));
}
export function applyRegion(state:Regions, event:RegionEvent): { state:Regions; message:string; kind:"success"|"error"|"info" } {
  const error=(message:string)=>({state:{...state,mistakes:state.mistakes+1},message,kind:"error" as const});
  const ok=(next:Regions,message:string,kind:"success"|"info"="success")=>({state:next,message,kind});
  const lesson=regionLessons[event.region];
  if(event.op==="reset") {
    const placements=Object.fromEntries(Object.entries(state.placements).filter(([key])=>!key.startsWith(`${event.region}:`)));
    return ok({...state,placements,...(event.region==="safety"?{domain:""}:{}),...(event.region==="follow"?{subscriptions:freshRegions().subscriptions,delivered:false}:{}),...(event.region==="governance"?{confidential:false}:{})},"本地点已重新布置；其他地点与贡献链不变。");
  }
  if(event.op==="place" && "pairs" in lesson) {
    const target=Object.entries(lesson.pairs).find(([key])=>key===event.key)?.[1];
    if(!target||target!==event.value) return error(`这件物品不属于这里。${lesson.explanation}`);
    const key=`${event.region}:${event.key}`;
    if(state.placements[key]===event.value) return ok(state,"这件物品已经归位，不重复记功。","info");
    return ok({...state,placements:{...state.placements,[key]:event.value}},`${event.key} 已归入「${event.value}」。${lesson.explanation}`);
  }
  if(event.op==="domain" && event.region==="safety") {
    if(event.value!=="https://github.com/login") return error("域名是 github.com.example.org，不是 github.com。不要继续，更不输入凭据。");
    return ok({...state,domain:event.value},state.domain?"已核对官方域名，不重复记录。":"目标域名核对通过（只判断本游戏卡片，不验证真实登录）。",state.domain?"info":"success");
  }
  if(event.op==="subscribe" && event.region==="follow") {
    if(!["star","follow","watch"].includes(event.key)) return error("未知订阅项目。");
    if(event.key==="watch"&&!['none','releases','all'].includes(event.value)) return error("未知 Watch 模式。");
    return ok({...state,delivered:false,subscriptions:{...state.subscriptions,[event.key]:event.key==="watch"?event.value:event.value==="true"}},"模拟设置已改变，投递信件看看结果。真实账号没有任何变化。");
  }
  if(event.op==="deliver" && event.region==="follow") {
    if(!state.subscriptions.star||!state.subscriptions.follow||state.subscriptions.watch!=="releases") return error("委托要收藏项目、关注作者、只订阅发布。Star、Follow、Watch 各自负责不同目标；请调整后重试。");
    return ok({...state,delivered:true},state.delivered?"这批信已分拣，不重复投递。":"发布信已进收件箱，普通 Issue 事件未进入；已保存本关模拟偏好。",state.delivered?"info":"success");
  }
  if(event.op==="report"&&event.region==="governance") {
    if(!Object.entries(regionLessons.governance.pairs).every(([card,target])=>state.placements[`governance:${card}`]===target)) return error("先装配五份文书，读到 SECURITY 的报告渠道再投递。");
    if(event.value!=="security") return error("敏感漏洞不要公开到 Issue；先按 SECURITY 中的私密渠道报告。游戏不接收真实漏洞细节。");
    return ok({...state,confidential:true},state.confidential?"已归档投递决定，不重复发送。":"已选 SECURITY 指定私密渠道（仅模拟，未发送消息）。",state.confidential?"info":"success");
  }
  return error("这项操作不属于当前地点。");
}
