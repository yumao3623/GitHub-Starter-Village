import { z } from 'zod';
import { campaignChapters, routeRequests, routeEntries, securityRequests, workshopOrders, shelfCards, shelfQuestions, marketProjects, mailBatch, issueFragments, changeSlips } from '@/content/minigames/campaign';

export const campaignEventSchema=z.object({type:z.string().max(60),id:z.string().max(100).optional(),target:z.string().max(160).optional(),value:z.string().max(3000).optional()});
export type CampaignEvent=z.infer<typeof campaignEventSchema>;
export const campaignRunSchema=z.object({attempt:z.number().int().nonnegative().default(0),paid:z.boolean().default(false),seed:z.number().int().min(0).max(1),events:z.array(campaignEventSchema).max(500),archives:z.array(z.object({seed:z.number().int().min(0).max(1),events:z.array(campaignEventSchema).max(500)})).max(4)});
export type CampaignRun=z.infer<typeof campaignRunSchema>;
export type CampaignBoard={chapter:number;seed:number;done:boolean;step:number;values:Record<string,string>;numbers:Record<string,number>;flags:string[];lists:Record<string,string[]>;feedback:string;evidence:string[];last:string};
export const freshCampaignRun=(seed=0):CampaignRun=>({seed,events:[],archives:[],attempt:0,paid:false});
export function freshCampaignBoard(chapter:number,seed=0):CampaignBoard{
 const b:CampaignBoard={chapter,seed,done:false,step:0,values:{},numbers:{},flags:[],lists:{},feedback:'先看本章目标，再操作盘面。',evidence:[],last:''};
 if(chapter===3){b.values={directory:'Downloads',environment:'未核对',phase:'boot'};b.numbers={pipe0:0,pipe1:0};}
 if(chapter===4)b.lists={tray:[],archived:[]};
 if(chapter===5){b.numbers={budget:4,wager:0};b.lists={investigated:[]};}
 if(chapter===6)b.values={rule:'none',deliveryRule:'none'};
 if(chapter===8)b.values={upstream:seed?'u2':'u1',origin:seed?'u2':'u0',local:seed?'u1':'u0',working:seed?'u1':'u0',tracking:seed?'u1':'u0',note:'私人便条（未提交）'};
 if(chapter===9)b.values={main:seed?'m1':'m0',current:'main',base:seed?'m1':'m0',dirty:seed?'会覆盖未提交便条':'无冲突'};
 if(chapter===10){b.values={local:'模拟 c0',remote:'模拟 c0'};for(const slip of changeSlips(seed))b.values[`w:${slip.id}`]=slip.after;b.lists={tray:[]};}
 if(chapter===11){b.values={status:'未建议案',conflict:seed?'<<<<<<< 修复\n东桥\n=======\n西桥，18:00 开放\n>>>>>>> main':'<<<<<<< 修复\n南门\n=======\n北门，18:00 开放\n>>>>>>> main'};b.numbers={local:1,remote:1,approved:0};}
 if(chapter===12){b.values={local:'c1',remote:'c1',runSha:'',status:'待运行',artifact:'',tag:'',changelog:'',notes:''};b.numbers={job:0};}
 return b;
}
const has=(b:CampaignBoard,f:string)=>b.flags.includes(f);
const add=(b:CampaignBoard,f:string)=>{if(!has(b,f))b.flags.push(f);};
const list=(b:CampaignBoard,k:string)=>b.lists[k]??(b.lists[k]=[]);
export function routePath(seed:number,requestIndex:number,entryIndex:number,cleared:string[]=[],maxTurns=2):number[][]|null{
 const requests=routeRequests(seed),from=[0,requestIndex+1],to=[5,entryIndex+1];
 const stones=seed?[[2,2],[3,4],[3,1]]:[[2,1],[3,3],[2,4]];
 const blocked=new Set(stones.map(p=>p.join(',')));
 requests.forEach((r,i)=>{if(i!==requestIndex&&!cleared.includes(r.id))blocked.add(`0,${i+1}`);});
 routeEntries.forEach((entry,i)=>{if(i!==entryIndex&&!requests.some(r=>r.entry===entry&&cleared.includes(r.id)))blocked.add(`5,${i+1}`);});
 const queue:{x:number;y:number;dir:number;turns:number;path:number[][]}[]=[{x:from[0],y:from[1],dir:-1,turns:0,path:[from]}];const visited=new Set<string>();
 while(queue.length){const q=queue.shift()!;if(q.x===to[0]&&q.y===to[1])return q.path;
 [[1,0],[0,1],[-1,0],[0,-1]].forEach(([dx,dy],dir)=>{const x=q.x+dx,y=q.y+dy,turns=q.turns+Number(q.dir!==-1&&q.dir!==dir),key=`${x},${y},${dir},${turns}`;if(x<0||x>5||y<0||y>5||turns>maxTurns||blocked.has(`${x},${y}`)||visited.has(key))return;visited.add(key);queue.push({x,y,dir,turns,path:[...q.path,[x,y]]});});
 }return null;
}
export function applyCampaignEvent(chapter:number,original:CampaignBoard,event:CampaignEvent):{board:CampaignBoard;error?:string}{
 const fail=(error:string)=>({board:original,error});if(original.done)return fail('本局已完成。可返回地图或开启变体，不重复记功。');
 const b:CampaignBoard=JSON.parse(JSON.stringify(original));const {type,id='',target='',value=''}=event;const seed=b.seed;
 const ok=(message:string,proof=false)=>{b.last=type;b.feedback=message;if(proof&&!b.evidence.includes(message))b.evidence.push(message);return {board:b};};
 if(type==='use-item'){
  if(has(b,`aid:${id}`))return fail('这件凭证本局已经用过；撤销或换一局会重新安排。');
  const aids:Record<number,string>={1:'云溪路引',2:'护身符',3:'拓印纸',8:'贡献路引',10:'分支竹签',12:'议事令'};
  if(aids[chapter]!==id)return fail('这件凭证与当前地点无关；先查看行囊中的签发用途。');
  add(b,`aid:${id}`);
  return ok(chapter===10?'分支竹签插入暂存台：本局可容纳第五格复核。':`已使用${id}，盘面标出一条额外线索；仍需亲自完成操作。`,true);
 }
 if(type==='inspect'){if(!id)return fail('先选择一件物件。');add(b,`read:${id}`);return ok('已展开物件说明。请依据具体用途与局面选择下一步。');}
 switch(chapter){
 case 0:{
  const requests=routeRequests(seed),cleared=list(b,'connected');
  if(type==='connect'){const i=requests.findIndex(r=>r.id===id),j=routeEntries.indexOf(target);if(i<0||j<0)return fail('先选旅人，再点右侧入口。');if(cleared.includes(id))return fail('这位旅人已抵达。');if(requests[i].entry!==target)return fail(`用途不符：${requests[i].label}应该通向 ${requests[i].entry}。${requests[i].result}`);const path=routePath(seed,i,j,cleared,has(b,'aid:云溪路引')?3:2);if(!path)return fail('知识配对正确，但山道被挡或转弯超过两次。先接通其他旅人腾出道路，或使用云溪路引拓开一处山道。');cleared.push(id);b.values[`path:${id}`]=JSON.stringify(path);return ok(requests[i].result,true);}
  if(type==='journey'){if(cleared.length!==requests.length)return fail('先让四位旅人抵达。');const required=seed?['README','Releases','macOS 附件']:['README','自己的 Fork','Clone'];if(required[b.step]!==id)return fail(`这条旅人路线下一站需要 ${required[b.step]}。`);b.step++;b.done=b.step===required.length;return ok(seed?'成品旅人选择对应系统附件；这条路线无需 Fork。':'贡献旅人先了解项目，再取得账号副本，最后 Clone 到电脑。',true);}
  break;
 }
 case 1:{const requests=securityRequests(seed);const order=seed?[...requests].reverse():requests;const req=order[b.step];if(type==='route-request'){if(!req||id!==req.id||!has(b,`read:${id}`))return fail('请先展开当前来信，阅读来源与目的。');if(target!==req.target)return fail(`「${req.title}」应送到「${req.target}」。${req.detail}`);b.values[req.id]=target;b.step++;b.done=b.step===order.length;return ok(`${req.title} → ${target}。游戏仅处理类型牌，未接收任何真实凭据。`,true);}break;}
 case 2:{const orders=workshopOrders(seed);if(type==='produce'){const order=orders.find(o=>o.id===id);if(!order)return fail('选择一张订单。');if(list(b,'delivered').includes(id)||Object.values(b.values).some(v=>v===id))return fail('此订单已在加工或已经交付。');if(target!==order.method)return fail(`工艺不满足需求。${order.need}：需要 ${order.method}，其产物${order.history}。`);if(!['0','1'].includes(value)||b.values[`station${value}`])return fail('两个工位已占用，先交付一件产物腾出位置。');b.values[`station${value}`]=id;return ok(`${order.method} 已生成产物：${order.owner} / ${order.history} / ${order.relation}。`,true);}
 if(type==='protocol'){if(!['HTTPS','SSH 公钥认证'].includes(target))return fail('SSH 私钥不可作为交付物。HTTPS 和 SSH 公钥认证都可以连接；秘密仍在本人环境。');b.values.protocol=target;return ok(`${target} 连接方式已核对，不索取凭据。`,true);}
 if(type==='deliver'){const slot=['0','1'].find(n=>b.values[`station${n}`]===id),order=orders.find(o=>o.id===id);if(slot===undefined||!order)return fail('先生产这张订单的产物。');if(target!==order.station)return fail(`产物应该在${order.station}。Fork 不会把文件送到电脑。`);if(order.method==='Clone'&&!b.values.protocol)return fail('先核对 HTTPS 或 SSH 公钥认证的连接方式。');delete b.values[`station${slot}`];list(b,'delivered').push(id);b.done=list(b,'delivered').length===orders.length;return ok(`${order.need}已交付到${target}；${order.history}，${order.relation}。`,true);}break;}
 case 3:{
  if(type==='rotate'&&['pipe0','pipe1'].includes(id)){b.numbers[id]=(b.numbers[id]+1)%4;return ok('接头已旋转，箭头表示材料的流向。');}
  if(type==='directory'){b.values.directory=target;return ok(`当前 Directory：${target}。Terminal 命令作用于当前目录。`,true);}
  if(type==='environment'){if(target!=='Node 22 / npm')return fail('本项目声明 Node ≥22；先满足运行条件。');b.values.environment=target;return ok('Node.js 运行时与 npm 工具分别就绪。',true);}
  if(type==='log'){add(b,`log:${b.values.phase}`);return ok(b.values.directory!=='project'?'日志：当前目录没有项目的 package.json。':b.values.phase==='fault'&&seed?'日志：端口被其他模拟进程占用，先停止占用。':'日志：Dependency 未准备，检查 npm install 与接头。',true);}
  if(type==='free-port'){if(!has(b,'log:fault'))return fail('先读故障日志，不能盲目清理。');add(b,'portFree');return ok('仅停止了模拟占用进程，已安装依赖保留。',true);}
  if(type==='install'){if(b.values.directory!=='project')return fail('日志：此处没有 package.json。先切换项目目录。');if(!b.values.environment.includes('Node'))return fail('先核对 Node.js 与 npm。');if(b.numbers.pipe0!==1||b.numbers.pipe1!==(seed?3:2))return fail('材料管路未接通。旋转两个接头，使方向分别为东和本局出口方向。');if(b.values.phase==='fault'&&!has(b,'log:fault'))return fail('发生新故障时先查看日志。');add(b,'dependencies');return ok('npm install 已准备 Dependency；开发服务仍未启动。',true);}
  if(type==='start'){if(!has(b,'dependencies'))return fail('日志：缺少 Dependency。安装成功后再启动。');if(b.values.phase==='fault'&&seed&&!has(b,'portFree'))return fail('日志：端口占用。重复 npm run dev 不能修复，先查看日志。');add(b,'running');return ok('npm run dev 启动开发服务器，localhost 现在可访问。',true);}
  if(type==='visit'){if(!has(b,'running'))return fail('服务未运行，localhost 展示窗不可访问；它是本机地址。');add(b,`visited:${b.values.phase}`);return ok('localhost 显示本地页面；这不是互联网发布。',true);}
  if(type==='stop'){if(!has(b,'running')||!has(b,`visited:${b.values.phase}`))return fail('先启动并实际访问展示窗，再停止服务。');b.flags=b.flags.filter(f=>f!=='running');if(b.values.phase==='boot'){b.values.phase='fault';if(!seed)b.flags=b.flags.filter(f=>f!=='dependencies');return ok('服务已停止，依赖仍独立保存。现在出现一个新故障，请读日志定位。',true);}b.done=true;return ok('新故障已按日志修复；停止后 localhost 熄灭，依赖箱仍在。',true);}break;
 }
 case 4:{const tray=list(b,'tray'),archived=list(b,'archived');if(type==='take'){const card=shelfCards.find(c=>c.id===id);if(!card||tray.includes(id)||archived.includes(id))return fail('此册不在书架上。');if(shelfCards.some(c=>c.covers.includes(id)&&!tray.includes(c.id)&&!archived.includes(c.id)))return fail('上层册页遮挡，请先取走压住它的册页。');if(tray.length>=4)return fail('四格托盘已满，可以免费退回不需要的册页。');tray.push(id);return ok(card.detail,true);}
 if(type==='return'){b.lists.tray=tray.filter(v=>v!==id);return ok('册页回到书架空位，不影响真实仓库文件。');}
 if(type==='archive'){const q=shelfQuestions(seed)[b.step];if(!q.cards.every(c=>tray.includes(c)))return fail(`证据不足：「${q.label}」需要对应证据，Stars 不能代替 License。`);if(q.id==='version'&&target!=='不同')return fail('Release 的 Tag 指向 c0，主分支已到 c1，不能当作同一个版本。');archived.push(...q.cards);b.lists.tray=tray.filter(c=>!q.cards.includes(c));b.step++;b.done=b.step===shelfQuestions(seed).length;return ok(`已举证：${q.label}。所用证据 ${q.cards.map(id=>shelfCards.find(c=>c.id===id)!.label).join('、')}。`,true);}break;}
 case 5:{
  if(type==='wager'){if(has(b,'wagerSet')||![0,5,10].includes(Number(value)))return fail('本局彩头只能在开始前选择 0、5 或 10 文一次。');b.numbers.wager=Number(value);add(b,'wagerSet');return ok(`本局虚拟彩头 ${value} 文。正确举证净得同额，失败最多损失投入；零彩头不影响学习。`);}
  if(type==='search'){b.values.search=target;return ok(`Search 以 Language / Topics 筛选：${target}。热度仍不能证明适配。`,true);}
  if(type==='investigate'){if(!has(b,'wagerSet'))return fail('先用零彩头开局，或主动选择虚拟彩头。');const p=marketProjects(seed).find(p=>p.id===id);if(!p||!['req','license','docs','maintenance'].includes(target))return fail('选择项目及需要调查的证据。');const key=`${id}:${target}`,read=list(b,'investigated');if(read.includes(key))return fail('这项证据已读，不重复消耗回合。');if(read.length>=b.numbers.budget)return fail('调查回合已用完，可免费退回一项旧证据换查；或用钱袋买额外线索。');read.push(key);return ok(`${p.name}：${p[target as 'req']}。`,true);}
  if(type==='exchange'){b.lists.investigated=list(b,'investigated').filter(k=>k!==id);return ok('退回一项证据，空出调查回合。');}
  if(type==='dispute'){if(target!=='Stars 不等于适配')return fail('请指出宣传与证据的具体矛盾。');add(b,'disputed');return ok('Stars / Forks 只是热度线索；Archived 与 Updated 是维护线索，均不能代替运行环境或 License。',true);}
  if(type==='conclude'){const p=marketProjects(seed).find(p=>p.id===id);if(!p)return fail('先选择交付项目。');if(!p.fit){add(b,'marketLost');return ok(`${p.name}不满足本轮 Node ${seed?24:22} / ${seed?'需要 Node 24 新接口':'可改编'}要求。彩头最多结算一次，回到调查补齐证据。`,true);}if(!has(b,'disputed')||!b.values.search||!['req','license','docs','maintenance'].every(f=>list(b,'investigated').includes(`${id}:${f}`)))return fail('需要四项证据、检索条件与一次有效质疑，不能只选对名称。');b.done=true;return ok('运行环境、License、Documentation 与维护风险共同支撑本次交付；不是安全认证。',true);}break;
 }
 case 6:{const mails=mailBatch(seed);if(type==='rule'){if(!['release','all','none'].includes(target))return fail('选择可解释的 Watch 范围。');b.values.rule=target;return ok('规则已改；已投递的信保留，下一封使用新范围。',true);}
 if(type==='launch'){if(b.values.rule!==(seed?'all':'release'))return fail(`本轮委托需要 ${seed?'All activity':'仅 Releases'}，先调整 Watch。`);add(b,'flying');b.values.deliveryRule=b.values.rule;return ok('飞鸽已从鸽台出发，当前信件停在可处理位置。');}
 if(type==='pause'){b.flags=has(b,'paused')?b.flags.filter(f=>f!=='paused'):[...b.flags,'paused'];return ok(has(b,'paused')?'来信已暂停，仍可点选分流。':'继续传书。');}
 if(type==='sort'){const mail=mails[b.step];if(!has(b,'flying')||!mail||mail.id!==id)return fail('先配置规则并放飞来信。');if(target!==mail.target)return fail(`「${mail.label}」应到 ${mail.target}。收藏、通知、作者关注和账号副本各有作用。`);if(mail.kind==='issue'&&b.values.deliveryRule!==(seed?'all':'release'))return fail('当前批次范围不满足委托；调整规则后重新放飞，旧回执不会丢失。');b.values[mail.id]=target;b.step++;b.values.deliveryRule=b.values.rule;b.done=b.step===mails.length;return ok(`${mail.label} → ${target}。这里只模拟事件，不向真实仓库发信。`,true);}break;}
 case 7:{
  if(type==='charter'){if(!['Contributing','Code of conduct','Security policy'].includes(id))return fail('先阅读三份协作告示。');add(b,id);return ok(`${id} 已核对；普通贡献、交流约定与敏感报告各有渠道。`,true);}
  if(type==='fragment'){const f=issueFragments(seed).find(f=>f.id===id);if(!f||f.slot!==target||f.slot==='无关')return fail('这块线索与问题不一致；现象、复现、期望要能相互验证。');b.values[target]=id;return ok(`${target}拼片已落位：${f.label}。`,true);}
  if(type==='case-route'){if((id==='duplicate'&&target!=='关联已有 Issue')||(id==='security'&&target!=='私下 Security policy'))return fail('重复问题需关联已有 Issue；敏感漏洞按 Security policy 私下报告说明处理。');add(b,id);return ok(`${id==='duplicate'?'重复案卷':'敏感案卷'}已分流，没有真实发布。`,true);}
  if(type==='assign'){const required:Record<string,string>={Label:'bug',Assignee:seed?'知微':'青砚',Milestone:seed?'修桥计划':'夜行图修订',Subscribe:'跟进'};if(required[id]!==target)return fail(`本轮 ${id} 需要 ${required[id]}；根据职责和目标指派。`);b.values[id]=target;return ok(`${id} → ${target}。本关具有模拟维护权限；真实权限由仓库决定。`,true);}
  if(type==='submit'){if(!['现象','复现','期望','Label','Assignee','Milestone','Subscribe'].every(k=>b.values[k])||!['duplicate','security','Contributing','Code of conduct','Security policy'].every(f=>has(b,f)))return fail('案卷或协作条件不齐，先补缺失位置。');b.values.status='Open';return ok('NPC 已按步骤复现，Issue 进入 Open；good first issue 只是适合新人的标签，不自动授予权限。',true);}
  if(type==='comment'){if(b.values.status!=='Open'||value.trim().length<8)return fail('先形成 Open 案卷，再留下具体的复现 Comment。');add(b,'comment');return ok('Comment 已加入可复现线索。',true);}
  if(type==='mention'){if(target!==b.values.Assignee||!has(b,'comment'))return fail('先补复现评论，再 Mention 本案负责人。');add(b,'mention');return ok(`已在模拟讨论中提及 ${target}；提及与订阅影响通知。`,true);}
  if(type==='repair'){if(!has(b,'mention'))return fail('先把证据送给负责人。');add(b,'repaired');return ok('NPC 依据案卷完成模拟修复，现在可以核对并归档。');}
  if(type==='close'){if(!has(b,'repaired'))return fail('还没完成修复，保持 Open 等待；不能提前按 Closed 交差。');b.values.status='Closed';b.done=true;return ok('Issue 已关闭归档；Closed 不自动意味着代码已 Merge。',true);}break;
 }
 case 8:{
  if(type==='alias'){if((id==='origin'&&target!=='自己的 Fork')||(id==='upstream'&&target!=='原项目'))return fail('origin 指向自己的 Fork；upstream 指向原项目。本练习别名不授予写权限。');b.values[`alias:${id}`]=target;return ok(`${id} 地址与归属已核对。`,true);}
  if(type==='fetch'){if(!b.values['alias:upstream'])return fail('先核对 upstream 指向。');b.values.tracking=b.values.upstream;add(b,'fetched');return ok(`Fetch 取回跟踪信息 ${b.values.tracking}；本地分支 ${b.values.local}、工作区 ${b.values.working} 均未改变。`,true);}
  if(type==='pull'){if(!has(b,'fetched'))return fail('先 Fetch 观察远端记录，才能对照本地整合结果。');b.values.local=b.values.tracking;b.values.working=b.values.tracking;return ok('Pull 本关使用 fetch + merge 整合；本地分支和工作区已更新，私人便条仍留本地。',true);}
  if(type==='push'){if(target!=='origin')return fail('没有 upstream 写权限，改回自己的 origin；不提供 force push 绕过。');if(!b.values['alias:origin']||b.values.local!==b.values.upstream)return fail('先核对 origin，并让本地整合目标提交。');b.values.origin=b.values.local;return ok(`Push 发送已提交历史 ${b.values.local}；私人便条未被发送。`,true);}
  if(type==='sync'){b.values.origin=b.values.upstream;return ok(`网页 Sync fork 将 origin 更新到 ${b.values.origin}，电脑仍是 ${b.values.local}。`,true);}
  if(type==='note'){if(target!=='留在本地，先 Commit')return fail('Working directory 中未提交便条不是 Push 的提交货件。');add(b,'privateLocal');return ok('已识别未提交工作区边界。',true);}
  if(type==='receipt'){if(!has(b,'privateLocal')||!has(b,'fetched')||b.values.origin!==b.values.upstream||b.values.local!==b.values.upstream)return fail('货运尚未完成，请对照五栏状态与未提交便条。');b.done=true;return ok('远端、跟踪记录、本地分支和工作区已按各自操作更新，边界验证完成。',true);}break;
 }
 case 9:{
  if(type==='create'){if(!/^fix\/[a-z0-9-]{3,40}$/.test(value))return fail('修复分支名用 fix/ 加英文短名，例如 fix/south-gate。');if(target!==b.values.base)return fail(`任务要求从 ${b.values.base} 创建引用，先核对起点。`);if(b.values.branch)return fail('分支已创建。创建不会自动切换 current。');b.values.branch=value;b.values.branchAt=target;return ok(`创建 ${value} → ${target}；current 仍是 main。分支只是提交引用，没有复制新仓库。`,true);}
  if(type==='clear-note'){if(!seed)return fail('此局没有阻止切换的便条。');b.values.dirty='已妥善撤回模拟便条';return ok('本训练便条已撤回，不涉及电脑文件；现在可安全切换。',true);}
  if(type==='switch'){if(!b.values.branch)return fail('先创建修复分支。');if(b.values.dirty==='会覆盖未提交便条')return fail('切换会覆盖未提交便条，被安全阻止；先撤回本关模拟便条。未提交改动不会天然隔离。');b.values.current=b.values.branch;return ok(`current 已切到 ${b.values.current}；main 仍指向 ${b.values.main}。`,true);}
  if(type==='edit'){if(b.values.current==='main')return fail('只创建还没切换，current 仍在 main；先切入修复线路。');if(!value.includes(seed?'东桥':'南门'))return fail(`本轮目标是${seed?'东桥':'南门'}，请只修正对应说明。`);b.values.diff=value;return ok(`Working directory 已修改；main 指针保持 ${b.values.main}，尚未产生 Commit。`,true);}
  if(type==='review-diff'){if(!b.values.diff||target!==(seed?'西桥 → 东桥':'北门 → 南门'))return fail('先在修复分支编辑，再识别 Diff 的删除与新增。');b.done=true;return ok('Changes 是文件级变化；Diff 展示行级删增。修复分支、main 和工作区分别可见。',true);}break;
 }
 case 10:{const slips=changeSlips(seed),tray=list(b,'tray');
  if(type==='take'){const slip=slips.find(s=>s.id===id);if(!slip||tray.includes(id))return fail('选择还在叠签区的改动。');if(slips.some(s=>s.covers.includes(id)&&!tray.includes(s.id)&&!has(b,`lifted:${s.id}`)))return fail('改动签被上层压住，先取走顶签。');const capacity=has(b,'aid:分支竹签')?5:4;if(tray.length>=capacity)return fail(`${capacity}个阅读槽已满。可以免费退回无关签，不花钱解围。`);tray.push(id);add(b,`lifted:${id}`);return ok(`${slip.file}：删除「${slip.before}」，新增「${b.values[`w:${id}`]}」。`,true);}
  if(type==='return'){b.lists.tray=tray.filter(v=>v!==id);delete b.values[`s:${id}`];return ok('改动签退回工作区，暂存项同时撤回；原工作内容保留。');}
  if(type==='stage'){if(!tray.includes(id))return fail('先取签查看 Diff，再放进暂存台。');const s=slips.find(s=>s.id===id)!;if(!s.related)return fail(`${s.file}与本次任务无关，不能夹带私人便条或配置误改。`);if(!b.values[`s:${id}`]&&Object.keys(b.values).filter(k=>k.startsWith('s:')).length>=4)return fail('暂存操作槽满，可以免费退回。');b.values[`s:${id}`]=b.values[`w:${id}`];return ok(`Stage 保存 ${s.file} 此刻快照；历史和远端均未改变。`,true);}
  if(type==='edit-again'){if(!b.values['s:readme'])return fail('先暂存 README，才能观察再次编辑的影响。');b.values['w:readme']=`${slips[0].after}；夜行带灯`;add(b,'editedAfterStage');return ok('工作区 README 再次编辑，Stage 仍是旧快照。请对照后重新 Stage。',true);}
  if(type==='commit'){const needed=slips.filter(s=>s.related);if(!has(b,'editedAfterStage')||!needed.every(s=>b.values[`s:${s.id}`]===b.values[`w:${s.id}`])||Object.keys(b.values).filter(k=>k.startsWith('s:')).length!==needed.length)return fail('只收本轮相关改动，并确保再次编辑后的 README 已重新 Stage。');if(value.trim().length<8||!/(南门|README|路线)/.test(value)||!/(修复|说明|更新)/.test(value))return fail('Commit message 请写清修改对象和目的，例如「修复 README 南门入口说明」。');b.values.message=value;b.values.local=`模拟 c${seed+1}`;b.values.snapshot=JSON.stringify(Object.fromEntries(needed.map(s=>[s.file,b.values[`s:${s.id}`]])));return ok(`Commit 新增本地快照 ${b.values.local}，远端仍为 ${b.values.remote}。`,true);}
  if(type==='push'){if(!b.values.snapshot||target!=='origin')return fail('先 Commit，再把历史 Push 到自己的 origin。');b.values.remote=b.values.local;return ok(`远端回执到达 ${b.values.remote}；无关和未提交内容仍留在工作区。`,true);}
  if(type==='receipt'){if(!b.values.snapshot||b.values.local!==b.values.remote||value!==b.values.remote)return fail('请对照本地 Commit 与远端回执，标识和内容必须一致。');b.done=true;return ok('提交仅含相关快照，远端收到相同模拟 SHA。四种状态已分别核验。',true);}break;
 }
 case 11:{
  if(type==='direction'){if((id==='base'&&target!=='自己的 Fork / main')||(id==='head'&&target!=='自己的 Fork / fix'))return fail('Base 接收修改，Head / Compare 提供修改；两端均在自己的 Fork。');b.values[id]=target;return ok(`${id==='base'?'Base repository / Base branch':'Head repository / Compare branch'} 已摆好。`,true);}
  if(type==='files'){add(b,'files');return ok('Files changed 展开实际修改，Conversation 是讨论记录，二者不能替代。',true);}
  if(type==='draft'){if(!b.values.base||!b.values.head||!has(b,'files'))return fail('先选对来源目标并检查 Files changed。');b.values.status='Draft';return ok('New pull request 建立 Draft；还不能当作已批准或已合并。',true);}
  if(type==='ready'){if(b.values.status!=='Draft')return fail('先建立 Draft。');b.values.status='Request changes';return ok('Ready for review 后，NPC 提出 Request changes：保留入口并补充夜间结伴说明。',true);}
  if(type==='revise'){if(b.values.status!=='Request changes'||!value.includes(seed?'东桥':'南门')||!value.includes('结伴'))return fail(`按意见实际修订，保留${seed?'东桥':'南门'}并写明夜间结伴。Comment 不是批准。`);b.values.revision=value;b.numbers.local++;return ok('修订生成新的本地 Commit，需 Push 后才可处理讨论。',true);}
  if(type==='push'){if(!b.values.revision)return fail('先回应意见，产生新提交。');b.numbers.remote=b.numbers.local;return ok(`修订已 Push，远端当前模拟 c${b.numbers.remote}。`,true);}
  if(type==='resolve'){if(!b.values.revision||b.numbers.remote!==b.numbers.local)return fail('修订尚未送达，不可空按 Resolve conversation。');add(b,'resolved');return ok('讨论已解决，Approve 仍需独立复查。',true);}
  if(type==='conflict'){if(!value.includes(seed?'东桥':'南门')||!value.includes('18:00')||/(<<<|===|>>>|北门|西桥)/.test(value))return fail(`保留双方有效意图：${seed?'东桥':'南门'}与 18:00，并移除全部冲突标记。`);b.values.conflict=value;add(b,'conflictResolved');b.numbers.local++;b.numbers.approved=0;return ok('Merge conflict 已实际修卷，产生新版本；旧批准失效，需 Push 并重新复查。',true);}
  if(type==='approve'){if(!has(b,'resolved')||b.numbers.remote!==b.numbers.local)return fail('解决讨论并推送最新修改后，再请求 NPC 复查。');b.numbers.approved=b.numbers.remote;return ok(`NPC Approve 仅针对模拟 c${b.numbers.approved}，不代表所有合并条件都满足。`,true);}
  if(type==='merge'){if(!has(b,'conflictResolved')||!has(b,'resolved')||!b.numbers.approved||b.numbers.approved!==b.numbers.remote||b.numbers.remote!==b.numbers.local)return fail('合并需要：最新提交被批准、讨论已解决、冲突已修复。逐项核对。');b.values.status='Merged';b.done=true;return ok('本模拟规则的合并条件齐备，完成 Merge；真实仓库还受权限和规则限制。',true);}break;
 }
 case 12:{
  if(type==='dependency'){if((id==='build'&&target!=='check')||(id==='deliver'&&target!=='build'))return fail('构建依赖检查，交付依赖构建；不能从没有输入的工位开始。');b.values[`needs:${id}`]=target;return ok(`${id} 依赖 ${target}；Job 和 Step 的因果关系已连接。`,true);}
  if(type==='run'){if(!b.values['needs:build']||!b.values['needs:deliver'])return fail('先连好 Workflow 的依赖工位。');b.values.runSha=b.values.remote;b.values.status='Running';b.numbers.job=0;return ok(`新 Workflow run 绑定 SHA ${b.values.runSha}，之后的新提交不会改变此运行。`,true);}
  if(type==='tick'){if(b.values.status!=='Running')return fail('先启动运行。');if(b.values.runSha==='c1'){b.values.status='Failed';return ok(seed?'Step 日志：任务配置缺少必需字段。Checks Failed，先定位再修复。':'Step 日志：缺少 Changelog。Checks Failed，先定位再修复。',true);}b.numbers.job++;if(b.numbers.job===3){b.values.status='Passed';b.values.artifact=`nightwalk-${b.values.runSha}.zip`;}return ok(b.values.status==='Passed'?`所有 Job / Step Passed，产出 Artifact ${b.values.artifact}；尚未成为 Release 附件。`:`Job ${b.numbers.job} Passed，后继工位获得输入。`,true);}
  if(type==='log'){if(b.values.status!=='Failed')return fail('失败时展开具体 Step 日志。');add(b,'readLog');return ok(`当前 run(${b.values.runSha}) 失败：${seed?'配置字段不全，修订任务配置并记录变更':'缺 Changelog，需要补足变更说明'}。`,true);}
  if(type==='repair'){if(seed&&!value.includes('needs: check'))return fail('配置故障需要补充 needs: check，再记录 Changelog。');if(!has(b,'readLog')||value.trim().length<12||!value.includes('南门')||!value.includes('修复'))return fail('先读失败 Step 日志，再写至少 12 字的说明，包含南门与修复。');b.values.changelog=value;return ok('修复在工作区，旧 run 的 SHA 仍未改变。',true);}
  if(type==='commit'){if(!b.values.changelog)return fail('先修复日志指出的问题。');b.values.local='c2';return ok('Stage / Commit 把修复写入本地 c2；远端还没更新。',true);}
  if(type==='push'){if(b.values.local!=='c2')return fail('先提交修复。');b.values.remote='c2';return ok('修复已 Push 为 c2；已有 run(c1) 仍绑定 c1。',true);}
  if(type==='cancel'){if(b.values.status!=='Running')return fail('只可取消正在运行的 Workflow。');b.values.status='Cancelled';add(b,'cancelled');return ok('Cancelled 不等于 Passed，没有通过的构建产物。',true);}
  if(type==='rerun'){if(!['Failed','Cancelled','Passed'].includes(b.values.status))return fail('等待运行结束或取消，再重跑该次运行。');b.values.status='Running';b.numbers.job=0;return ok(`Re-run all jobs 仍绑定 ${b.values.runSha} / 原 REF，不读取未来提交。`,true);}
  if(type==='tag'){if(!/^v\d+\.\d+\.\d+$/.test(value)||target!==b.values.runSha||b.values.status!=='Passed')return fail('Tag 必须指向已 Passed 的 SHA，版本格式如 v1.0.1。');b.values.tag=value;b.values.tagSha=target;return ok(`Tag ${value} → ${target}，Version 与具体提交位置已关联。`,true);}
  if(type==='release'){if(!has(b,'cancelled')||b.values.status!=='Passed'||!b.values.tag||b.values.tagSha!==b.values.runSha||target!==b.values.artifact||value.trim().length<12||!value.includes('南门'))return fail('先经历取消与重跑，再核对 Passed SHA、Tag、对应 Artifact 和清楚的发行说明。');b.values.notes=value;add(b,'released');return ok('Publish release（模拟）：标签、说明和附件已装配；没有向真实 GitHub 发布。',true);}
  if(type==='pages'){if(!has(b,'released')||target!=='静态展示')return fail('Release 提供发行附件；GitHub Pages 用于静态站点展示。先完成发行模拟。');b.done=true;return ok('Pages 静态展示用途已核对。全线模拟完成，可在自己的 Fork 按指南自我检查。',true);}break;
 }
 }
 return fail('这个动作不适用于当前局面，请查看本章规则。');
}
export function replayCampaign(chapter:number,run:Pick<CampaignRun,'seed'|'events'>):CampaignBoard|null{
 if(!campaignChapters.includes(chapter))return null;let b=freshCampaignBoard(chapter,run.seed);for(const e of run.events){const r=applyCampaignEvent(chapter,b,e);if(r.error)return null;b=r.board;}return b;
}
export function hasCampaignAward(chapter:number,run?:CampaignRun,seed?:number){return !!run&&[run,...run.archives].some(r=>(seed===undefined||r.seed===seed)&&replayCampaign(chapter,r)?.done);}
export function validCampaignRun(chapter:number,run:CampaignRun){return replayCampaign(chapter,run)!==null&&run.archives.every(r=>!!replayCampaign(chapter,r)?.done);}
