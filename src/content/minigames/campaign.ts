import { chapterLessons } from './chapters';
export const campaignChapters = chapterLessons.map(l => l.chapter);
export const lastCampaignChapter = campaignChapters.at(-1)!;
export const numerals = ['零','一','二','三','四','五','六','七','八','九','十','十一','十二'];
export const campaignRules = [
 ['山道连连看','选择旅人，再点入口；用途正确且山道最多拐两次才可到达。','接通四位旅人，并完成贡献路线。','先把「阅读说明」接到 README。石障只影响路径，不改变入口用途。'],
 ['护匣守门','展开当前请求，读来源和目的，再放到官方入口、自己保管匣或拒绝槽。','安全处置全部来信；秘密类型牌只认识名称。','先展开第一封信，辨认是已有账号还是新访客。'],
 ['三台拓印机','选择订单、工艺和空工位，再把产物交给正确地点。两个工位可以同时安排。','交付所有订单，检查归属、位置、历史和关联。','先看旅人需要账号副本、协作历史还是文件快照。'],
 ['引火接管','旋转两处管件，核对目录和运行环境；看日志定位故障，再安装、启动、访问和停止。','修好局部故障，看到 localhost 点亮，再安全停止。','先读日志并把操作目录切到项目根目录。安装依赖不等于启动服务。'],
 ['叠卷寻证','只能取未被盖住的册页；四格托盘可退回。用正确版本的证据回答访客问题。','解决五个证据问题；归档不会删除仓库文件。','取走压在 License 上方的 README，观察下层解锁。'],
 ['凭据斗智','根据用途调查项目证据，四次调查足够找出适配项目；彩头默认零，胜负由证据决定。','调查、拆穿热度宣传，再举证交付合适项目。','先看本轮环境要求，再调查 Requirements 和 License。'],
 ['飞笺分流','先选 Watch 接收范围，再放飞来信；可随时暂停。点信、选槽，调整规则只影响后续批次。','正确分流十二封信，并控制通知范围。','先选择仅 Releases，预览哪些事件会被送来。Star 不代替 Watch。'],
 ['案卷拼图','拼合一致的现象、复现和期望，再去重、分流敏感问题、安排负责人与里程碑。','让 NPC 能复现普通问题，修复后归档。','先读贡献约定，再挑与南门问题对应的复现步骤。'],
 ['三站运卷','先核对远端别名；Fetch 更新消息册，Pull 整合本地，Push 只运已提交历史。','让本地和自己的 origin 到达目标版号，私人便条留本地。','先发 Fetch 信使，观察消息册更新而本地工作区不变。'],
 ['双径修路','从指定提交创建分支，再独立切换；分支是指针，创建不自动切换。','在正确分支查看并修改 Diff，main 指针保持原位。','先给修复分支命名；随后查看 current 是否真的改变。'],
 ['合卷叠签','从无遮挡的改动签取快照，四格暂存台只收相关内容；工作区再编辑不更新暂存快照。','只提交目标变更，写清对象和目的，再 Push 核对同一 SHA。','取一张签读 Diff，暂存后比较工作区、Stage、本地历史和远端四栏。'],
 ['合卷议事','选来源与目标，针对意见实际修订；解决讨论、获得批准、消除冲突是三个独立条件。','让最新提交得到批准，保留冲突双方意图后合并。','先摆好 Base 接收修改、Head 提供修改的方向。'],
 ['连炉铸卷','连接检查、构建、交付依赖；失败先读 Step 日志。重跑旧 run 仍使用旧 SHA。','修复并用新版本运行，核对 Artifact、Tag、说明后发布模拟。','先排好三个工位依赖，第一次失败后展开日志。']
].map(([name,rule,goal,firstStep], chapter) => ({chapter,name,rule,goal,firstStep, termIds: [...new Set(chapterLessons[chapter].stages.flatMap(s=>s.termIds))], source: chapterLessons[chapter].source}));
export const assetSubjects = [
 ['路牌木座','用途布幡','石障桥口','入谷旗','路引托盘','山道纹理','旅人行囊','木桥'],
 ['护身匣','请求笺','核验印','拒绝槽','门禁横闩','安全护符','信使布包','灯笼'],
 ['Fork 拓印机','Clone 装订机','ZIP 包扎台','原卷副本册','产物检验架','运输马车','工位木托','云端工坊'],
 ['运行炉膛','目录木匣','依赖箱','铜管接头','日志长卷','服务观察窗','风箱开关','火苗'],
 ['多层书架','档案册页','四格托盘','版本书签','问题签','归档匣','许可印记','档案封皮'],
 ['鉴宝案桌','项目卷牌','证据短签','摊主口供牌','彩头盘','质疑印','交付匣','摊幡'],
 ['信鸽','信台','来信信封','仓库通知笺','人物动态笺','规则拨签','投信回执','风铃'],
 ['悬赏公告板','案卷底纸','证据拼片','人物指派令','里程碑旗','安全封信','归档印','告示钉'],
 ['本地站台','origin 城门','upstream 远站','运卷货车','版本货件','远端消息册','驿站回执','桥面'],
 ['分叉竹径','提交石标','main 门牌','修复竹签','当前分支绳结','差异竹简','切换机关','竹叶'],
 ['改动签','四槽暂存案','Diff 对照卷','封卷册','合卷印章','提交记录简','快递封套','私人便条'],
 ['议事长桌','来源目标卷架','评审意见牌','举证行动牌','冲突合卷册','待复查封签','批准印','席位旗'],
 ['分层百炼炉','状态火苗','依赖机关带','任务工牌','日志长卷','产物箱','发行卷标签','烟口']
];
export const routeRequests = (seed:number) => seed === 0 ? [
 {id:'read',label:'阅读项目说明',entry:'README',result:'README 展开用途、安装和贡献说明。'},
 {id:'files',label:'查看仓库文件',entry:'Code tab',result:'Code tab 展示当前分支的文件与目录。'},
 {id:'binary',label:'找 macOS 成品包',entry:'Releases',result:'Releases 中仍须核对 macOS 附件，源码 ZIP 不等于安装包。'},
 {id:'fork',label:'取得自己账号的贡献副本',entry:'Fork',result:'副本在 GitHub 账号下，电脑仍没有项目文件。'}
] : [
 {id:'read',label:'先了解运行要求',entry:'README',result:'README 提供运行要求，不能跳过依赖条件。'},
 {id:'source',label:'只取源码快照',entry:'Code button',result:'Download ZIP 得到文件快照，没有正常 Git 历史。'},
 {id:'binary',label:'直接运行发行成品',entry:'Releases',result:'检查系统和架构对应的发行附件。'},
 {id:'clone',label:'直接 Clone 原仓库',entry:'Code button',result:'Clone 可以直接来自原仓库；并非必须先 Fork。'}
];
export const routeEntries=['README','Code tab','Releases','Fork','Code button'];
export const securityRequests = (seed:number) => [
 {id:'known',title:seed?'老旅人再次入谷':'已有账号的访客',source:'github.com 官方说明',detail:'需要进入已有账号，不创建新的身份。',target:'Sign in'},
 {id:'new',title:'第一次建立账号',source:'github.com 官方说明',detail:'还没有账号，需要了解注册入口。',target:'Sign up'},
 {id:'name',title:'公开名帖',source:'公开资料',detail:'需要知道 GitHub 身份的名称标识。',target:'Username'},
 {id:'profile',title:'看看旅人的公开资料',source:'公开资料',detail:'要查看个人简介与公开活动。',target:'Profile'},
 {id:'settings',title:'调整账号安全',source:'github.com 官方说明',detail:'了解安全设置所在入口。',target:'Settings'},
 ...['2FA','Passkey','Recovery codes'].map((v,i)=>({id:`safe${i}`,title:v,source:'仅凭据类型牌',detail:`${v} 是防护/恢复方法，本游戏不填写任何真实值。`,target:'本人保管匣'})),
 ...['密码','Token','SSH 私钥','恢复代码'].map((v,i)=>({id:`bad${i}`,title:`${seed?'自称维护者':'陌生掌柜'}索要${v}`,source:'陌生索取请求',detail:`要求将${v}交给对方换取帮助。`,target:'拒绝槽'}))
];
export const securityTargets=['Sign in','Sign up','Username','Profile','Settings','本人保管匣','拒绝槽'];
export const workshopOrders=(seed:number)=>[
 {id:'o0',need:'在自己的 GitHub 账号拥有贡献副本',method:'Fork',station:'自己的账号',owner:'自己',history:'有 Git 历史',relation:'关联原仓库'},
 {id:'o1',need:seed?'使用 SSH 在电脑协作（仅公钥认证说明）':'使用 HTTPS 在电脑保留协作历史',method:'Clone',station:'电脑',owner:'本地使用者',history:'有 Git 历史',relation:'remote 指向来源'},
 {id:'o2',need:'只读一份源码快照',method:'Download ZIP',station:'电脑',owner:'文件使用者',history:'无 Git 历史',relation:'无 Git remote'},
 {id:'o3',need:'在浏览器打开云端 Terminal 开发',method:'Codespaces',station:'云端',owner:'云端工作区使用者',history:'仓库工作副本',relation:'连接选定仓库'}
];
export const shelfCards=[
 {id:'readme',label:'README',detail:'项目入口说明。',covers:['license'],asset:1},
 {id:'branch',label:'Branch / main',detail:'当前浏览分支 main；另一变体默认分支为 trunk。',covers:['files'],asset:3},
 {id:'history',label:'Commits / Commit history',detail:'提交时间、作者与变更记录，贡献者不等同仓库 Owner。',covers:['owner'],asset:1},
 {id:'release',label:'Release v1.0.0',detail:'发行关联 Tag v1.0.0，不保证与当前 main 相同。',covers:['tag'],asset:7},
 {id:'public',label:'Public / Private',detail:'Public 公开可见；Private 需授权。可见不等于可以任意使用。',covers:[],asset:4},
 {id:'stars',label:'Stars 9,000',detail:'收藏热度，不能证明许可、完整或安全。',covers:[],asset:4},
 {id:'license',label:'License',detail:'MIT：使用时须遵守并保留许可声明。',covers:[],asset:6},
 {id:'files',label:'Files / Folders',detail:'main/src/ 中的文件结构及 README 路径。',covers:[],asset:1},
 {id:'owner',label:'Owner / Contributors',detail:'Owner 云溪社；Contributors 青砚等参与者。',covers:[],asset:3},
 {id:'tag',label:'Tag v1.0.0 → c0',detail:'Tag 指向 c0；main 已到 c1。发行附件来自 c0。',covers:[],asset:3},
 {id:'private',label:'Private 需授权',detail:'仅被授予访问的人可以查看私有仓库。',covers:[],asset:7},
 {id:'archive',label:'归档说明',detail:'本盘归档只移动牌，不会删除 GitHub 文件。',covers:[],asset:5}
];
export const shelfQuestions=(seed:number)=>[
 {id:'use',label:'能否按许可使用这个 Public 项目？',cards:['license','public']},
 {id:'file',label:`要查 ${seed?'trunk':'main'} 下的目录和文件`,cards:['branch','files']},
 {id:'source',label:'分别追溯改动者与仓库归属',cards:['history','owner']},
 {id:'version',label:'发行版是否等于当前主分支？',cards:['release','tag']},
 {id:'visibility',label:'谁可以看 Private 仓库？本盘归档会删文件吗？',cards:['private','archive']}
];
export const marketProjects=(seed:number)=>[
 {id:'reed',name:'芦岸图',language:'TypeScript',topics:'map',stars:'1,280',forks:'42',req:'Node ≥20',license:'MIT',docs:'npm install → npm run dev',maintenance:'Updated：最近修复；Issues 有回应',fit:seed===0},
 {id:'cloud',name:'云栈图',language:'TypeScript',topics:'map',stars:'18,600',forks:'760',req:'Node ≥24',license:'MIT',docs:'Node 24 下 npm install',maintenance:'活跃维护',fit:seed===1},
 {id:'mist',name:'旧雾图',language:'JavaScript',topics:'map',stars:'42,000',forks:'2100',req:'Node ≥20',license:'未发现 License',docs:'旧版 Documentation',maintenance:'Archived；最近无回应',fit:false}
];
export const mailBatch=(seed:number)=>[
 {id:'m0',label:'保存项目以便下次找到',target:'Star',kind:'intent'}, {id:'m1',label:'订阅仓库版本消息',target:'Watch',kind:'intent'},
 {id:'m2',label:'关注作者公开动态',target:'Follow',kind:'intent'}, {id:'m3',label:'建立账号下仓库副本',target:'Fork',kind:'intent'},
 {id:'m4',label:'Release v1.1 发布',target:'收件箱',kind:'release'}, {id:'m5',label:'陌生 Issue 更新',target:seed?'收件箱':'静音归档',kind:'issue'},
 {id:'m6',label:'Release v1.2 发布',target:'收件箱',kind:'release'}, {id:'m7',label:'仓库普通讨论事件',target:seed?'收件箱':'静音归档',kind:'issue'},
 {id:'m8',label:'有步骤可复现的报错',target:'Issue',kind:'intent'}, {id:'m9',label:'开放的使用经验交流',target:'Discussions',kind:'intent'},
 {id:'m10',label:'另一封未参与 Issue 事件',target:seed?'收件箱':'静音归档',kind:'issue'}, {id:'m11',label:'Release v1.3 发布',target:'收件箱',kind:'release'}
];
export const issueFragments=(seed:number)=>[
 {id:'symptom',label:seed?'路线页把东桥写成西桥':'README 将南门写成北门',slot:'现象'},
 {id:'steps',label:seed?'打开 route.md，查看桥梁方向':'打开 README，查看安全入口一行',slot:'复现'},
 {id:'expected',label:seed?'桥梁方向应为东桥':'安全入口应显示南门',slot:'期望'},
 {id:'noise',label:'希望整个页面变为红色',slot:'无关'},
 {id:'vague',label:'它就是坏了，快修！',slot:'无关'}
];
export const changeSlips=(seed:number)=>[
 {id:'readme',file:'README.md',before:'入口：北门',after:seed?'入口：南门；结伴通行':'入口：南门',related:true,covers:['route'],asset:0},
 {id:'route',file:'route.md',before:'沿旧桥',after:'沿石桥到南门',related:true,covers:[],asset:0},
 {id:'notice',file:'notice.md',before:'夜行未说明',after:'夜间请结伴通行',related:seed===0,covers:['notes'],asset:0},
 {id:'notes',file:'notes.txt',before:'私人便条',after:'私人计划不要提交',related:false,covers:[],asset:7},
 {id:'color',file:'theme.css',before:'墨绿',after:'亮红',related:false,covers:[],asset:0},
 {id:'duplicate',file:'截图副本',before:'重复线索',after:'重复线索',related:false,covers:[],asset:2},
 {id:'translation',file:'draft.txt',before:'未完成',after:'仍未完成译文',related:false,covers:[],asset:7},
 {id:'config',file:'config.json',before:'安全配置',after:'无关配置误改',related:false,covers:[],asset:0}
];
export const passDefinitions=[{id:'云溪路引',chapter:0,issuer:'村口青砚',use:'护身堂核验入谷身份'}, {id:'护身符',chapter:1,issuer:'护身堂',use:'拓印坊确认已学会拒绝索取'}, {id:'拓印纸',chapter:2,issuer:'拓印坊',use:'营火工坊确认已认识工作副本'}, {id:'贡献路引',chapter:7,issuer:'悬赏亭',use:'双城驿站开启协作运输'}, {id:'分支竹签',chapter:9,issuer:'分流竹林',use:'合卷台确认修复线路'}, {id:'议事令',chapter:11,issuer:'议事堂',use:'百炼炉核验交付来源'}];
export const requiredPass=(chapter:number)=>passDefinitions.find(p=>p.chapter+1===chapter);
/**
 * A completed chapter can leave a pass in the learner's pouch.  The next
 * chapter may spend that pass once for a small, visible convenience.  It is
 * never required for graduation, so learners who prefer the clean puzzle can
 * ignore it.
 */
export const chapterAid=(chapter:number)=>requiredPass(chapter);
export const chapterAidCopy=(chapter:number)=>({
  1:'云溪路引：标出第一封信的正式入口。',
  2:'护身符：在工位盘上保留一次安全核验提示。',
  3:'拓印纸：为管路盘留下上一次正确方向。',
  8:'贡献路引：在远端别名盘标出可写的 origin。',
  10:'分支竹签：把暂存台扩成第五格，容纳一次复核。',
  12:'议事令：在发行盘标出“已批准提交”检查项。'
}[chapter] ?? '本章通行凭证：展开一条额外线索。');

/** The short, actionable line shown above every board. */
export function campaignNextStep(chapter:number,b:{seed:number;step:number;flags:string[];values:Record<string,string>;lists:Record<string,string[]>;done:boolean}){
  if(b.done)return '本章已记功：核对证据后回地图，或换一局检验理解。';
  const hasFlag=(f:string)=>b.flags.includes(f);
  const list=(k:string)=>b.lists[k]??[];
  const securityIds=(b.seed?[...securityRequests(b.seed)].reverse():securityRequests(b.seed)).map(r=>r.id);
  switch(chapter){
    case 0:return list('connected').length<4?'先选左侧一位旅人，再点与用途相符的入口。':'按亮起的路线依次走完贡献路径。';
    case 1:return hasFlag(`read:${securityIds[b.step]??''}`)?'读完来信后，把它放入对应入口。':'先展开当前来信，查看来源与目的。';
    case 2:return list('delivered').length<4?'先选订单与工艺，安排到空工位，再交付到正确地点。':'四件产物已交付，核对 Clone 的连接方式。';
    case 3:return !hasFlag('dependencies')?'先把目录切到 project，读日志，再旋转两处管件。':!hasFlag('running')?'安装依赖后启动 localhost。':'访问 localhost，再安全停止服务。';
    case 4:return `取走未被遮挡的册页，围绕第 ${Math.min(b.step+1,5)} 个问题凑齐证据。`;
    case 5:return !hasFlag('wagerSet')?'先选零彩头或虚拟彩头，再查 Requirements 与 License。':!hasFlag('disputed')?'查完证据后质疑 Stars，不让热度替代判断。':'四项证据齐全后交付适配项目。';
    case 6:return !hasFlag('flying')?'先选 Watch 范围，再放飞来信。':'按信件用途分到正确槽位，规则只影响下一封。';
    case 7:return !b.values.status?'先拼出现象、复现、期望，再进入协作分流。':b.values.status==='Open'?'补 Comment、Mention 负责人，等修复后再关闭。':'核对协作告示与敏感问题分流。';
    case 8:return !hasFlag('fetched')?'先核对 upstream / origin，再 Fetch 观察远端消息。':!hasFlag('privateLocal')?'Pull 整合后把私人便条留在本地，再 Push origin。':'对照五栏状态与远端回执。';
    case 9:return !b.values.branch?'先用 fix/ 英文短名创建修复分支。':b.values.current==='main'?'切换 current 到修复分支，再编辑路线。':'修改后核对 Diff 与 main。';
    case 10:return !hasFlag('editedAfterStage')?'取签、读 Diff，只暂存本轮相关改动。':!b.values.snapshot?'README 再编辑后重新 Stage，再写清 Commit message。':'Push 后抄写远端 SHA，完成回执。';
    case 11:return !b.values.status?'先摆好 Base / Head，检查 Files changed，再建立 Draft。':b.values.status==='Request changes'?'按意见修订并 Push，随后 Resolve。':'解决冲突、Push 最新提交，再请求 Approve。';
    case 12:return !b.values['needs:build']||!b.values['needs:deliver']?'先连好 check → build → deliver 依赖。':b.values.status==='Failed'?'展开失败 Step 日志，修复后提交新版本。':!b.values.tag?'运行通过后核对 Artifact 与 Tag。':'写发行说明并完成 Pages 静态展示。';
    default:return '先看本章目标，再操作盘面。';
  }
}
