import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {resolve,relative} from 'node:path';
import {cards,sharedAssets} from '../design-data.mjs';
const root=resolve(import.meta.dirname,'../../../..');
const dir=resolve(import.meta.dirname,'..');
const read=p=>JSON.parse(readFileSync(resolve(dir,p),'utf8'));
const write=(p,s)=>writeFileSync(resolve(dir,p),s);
const chapters=read('baseline-chapters.json');
const scenes=read('baseline-scenes.json');
const terms=[];
for (const c of cards) {
 const expected=new Set(chapters[c.id].stages.flatMap(s=>s.termIds));
 const actual=new Set(c.groups.flatMap(g=>g[0].split(' ')));
 for(const id of expected) if(!actual.has(id)) throw Error(`Missing chapter ${c.id} term ${id}`);
 for(const id of actual) if(!expected.has(id)) throw Error(`Unexpected chapter ${c.id} term ${id}`);
 c.groups.forEach((g,i)=>g[0].split(' ').forEach(id=>terms.push({chapter:c.id,term:id,actionId:`CH${String(c.id).padStart(2,'0')}-K${i+1}`,action:g[1],result:g[2],transfer:c.variant,source:chapters[c.id].source,sourceStatus:'沿用内容配置；语义关键来源另见 ART_DIRECTION.md；逐词 UI 最新性属 B/C 内容审读'})));
}
const family=new Set(cards.map(c=>c.family));
const entries=sharedAssets.map(([id,name,old,format,use])=>({id,name,old,source:id==='G01'?'desktop/main.mjs; scripts/package-desktop.mjs; src/components/adventure/wuxia-game.tsx':'src/components/adventure; src/components/layout; src/components/ui',use,format,states:'默认｜聚焦｜按下｜禁用｜选中｜错误（按语义取适用态）',anchor:'50% 100% 接地；UI 类 50% 50%',size:'源图长边 1024+；地图 52–72 CSS px；UI 图标 24–32 CSS px；按钮 176×48 起',generated:false,aestheticApproved:false,integrated:false,deviceVerified:false}));
const byName=new Map();
for(const c of cards){c.assetIds=c.assets.map((name,i)=>{
 if(byName.has(name)){const id=byName.get(name);entries.find(e=>e.id===id).use+=`；第 ${c.id} 章 ${c.name}`;return id;}
 const id=`C${String(c.id).padStart(2,'0')}-${String(i+1).padStart(2,'0')}`;byName.set(name,id);
 entries.push({id,name,old:`第 ${c.id} 章 SVG 场景器物、通用 scene-object 及拟新增玩法道具`,source:'src/components/adventure/scene-environment.tsx; chapter-workbench.tsx; mechanism-trace.tsx',use:`第 ${c.id} 章 ${c.name} · ${c.game}`,format:'透明 PNG｜WebP 分层；动态部件独立导出',states:'静止｜可操作｜被遮挡｜操作中｜成功｜可恢复错误，见本章设计卡',anchor:'角色与器物以接地点定位；桌面道具以底边定位',size:'源图长边 1024+；章节核心器物 96–320 CSS px',generated:false,aestheticApproved:false,integrated:false,deviceVerified:false});return id;});}
const sampleMap={G01:['icon-a','icon-b','icon-c'],G11:['button-final'],G17:['lock-a','lock-b','lock-open-final','lock-complete-final'],G26:['coin-pouch'],G27:['silver-note'],G28:['travel-pass'],'C10-01':['slip-final'],'C10-02':['chapter10-artboard']};
for(const e of entries){e.sampleFiles=(sampleMap[e.id]||[]).map(f=>'assets/'+f+'.png');e.generated=e.sampleFiles.length>0;e.sampleStatus=e.generated?'已生成 A 阶段样品；阶段 A 审美已确认，待 B 接入':'已冻结生产条目；B、C 按清单生产';}
write('asset-ledger.json',JSON.stringify(entries,null,2)+'\n');
write('knowledge-action-matrix.json',JSON.stringify(terms,null,2)+'\n');
write('chapter-design-cards.json',JSON.stringify(cards,null,2)+'\n');
const coverage={chapters:cards.length,configuredChapterIds:chapters.map(c=>c.chapter),mechanismFamilies:family.size,termOccurrences:terms.length,uniqueTerms:new Set(terms.map(t=>t.term)).size,missingTerms:[],productionItems:entries.length,generatedSampleGroups:entries.filter(e=>e.generated).length,integrated:0,userAestheticApproved:1};
write('evidence/design-coverage.json',JSON.stringify(coverage,null,2)+'\n');
let md='# A 阶段 · 主线章节玩法设计卡\n\n2026-09-12 · 设计定稿供审阅。全部规则为拟实现规格，未接入游戏。来源配置为 `src/content/minigames/chapters.ts`，快照见 baseline-chapters.json。\n\n';
md+=`覆盖 ${cards.length} 章、${family.size} 类规则组合、${terms.length} 个章内术语映射（${coverage.uniqueTerms} 个不同术语）。这是现有武侠主线映射审计，不代表已经覆盖整个词库 P0 与 P1 或全部 GitHub 知识。术语逐条可追溯表见 knowledge-action-matrix.json。\n\n`;
md+='默认无强制倒计时。一次核心循环控制在 30–90 秒；每章以数个产生新判断的局面组成，不能用等待凑时长。所有章节支持点选替代拖放、Tab｜方向键与 Enter、免费教程、错误后保留正确步骤、局内撤销、重新开局。撤销只影响局面，不能重复发奖；已发奖后重玩不撤销主线进度。随机变体先由可解模板生成，再扰动合法参数，B、C 验证不可解局面。\n\n';
md+='|章|地点|主玩法|首次目标时长|\n|---|---|---|---|\n'+cards.map(c=>`|${c.id}|${c.name}|${c.game}|${c.minutes} 分钟|`).join('\n')+'\n\n';
for(const c of cards){md+=`## 第 ${c.id} 章 · ${c.name}｜${c.game}\n\n`;
 for(const [k,title] of Object.entries({opening:'初始局面',goal:'玩家目标',actions:'可执行动作',rules:'规则与约束',states:'可见状态变化',mistake:'错误与修复',variant:'重玩与迁移变体',onboarding:'首次操作教学',proof:'过关证据',reward:'结算与跨章用途',motion:'动效位置与反馈'}))md+=`**${title}**：${c[k]}\n\n`;
 md+='**正式资产**：'+c.assets.map((a,i)=>`${c.assetIds[i]} ${a}`).join('；')+'。\n\n';
 md+='|知识组|必须做的动作|必须看见的结果|\n|---|---|---|\n'+c.groups.map(g=>`|${g[0].split(' ').map(t=>'`'+t+'`').join('、')}|${g[1]}|${g[2]}|`).join('\n')+'\n\n';
 md+=`内容配置的主来源：[官方参考](${chapters[c.id].source})。逐词来源沿用词库，进入实现时按具体 UI 核验；古风玩法并非来源建议。\n\n`;
}
write('CHAPTER_DESIGN_CARDS.md',md);
let ledger='# A 阶段 · 全量素材替换台账\n\n';
ledger+=`冻结 ${entries.length} 件独立生产条目。日志长卷等同物件跨章复用只计一次；缩放导出、状态层、候选和序列帧不另算独立资产。A 阶段交付候选｜样品与生产设计，正式应用接入 0，用户审美批准 1；“已生成样品”不等于整组正式资产已经完成。\n\n`;
ledger+='所有素材默认源图保留，按目标尺寸另导出。透明图核验实际 alpha、边缘 200% 放大与整景；图内常变文案采用 DOM，章号用授权字体/已核验字形合成导出；不让生图随机生成 GitHub 标签。主按钮最小 48 px 高、图标热区 44×44 px。\n\n';
ledger+='|ID|新素材|旧元素｜范围|正式使用位置|A 阶段状态|\n|---|---|---|---|---|\n'+entries.map(e=>`|${e.id}|${e.name}|${e.old}|${e.use}|${e.sampleStatus}|`).join('\n')+'\n\n';
ledger+='## 截图逐项去向\n\n|用户截图|旧元素|对应条目|\n|---|---|---|\n|图 3|线条书案｜卷轴|C10-02、C10-04、C11-01、C11-05|\n|图 4|线条炉火｜Run workflow 卡片|C12-01、C12-02、C12-04、G11|\n|图 5|棚架｜README 与 Code 卡片|G38、C00-01、C00-02、G11|\n|图 6|旗帜｜地点矩形牌|G18、G20|\n|图 7|侠字方框|G01|\n|图 8|地面与粗线通路|G39、G21、C00-06|\n|图 9|锁和裸数字|G17–G20|\n|图 10|书架｜License 线性图标|C04-01、C04-02、C04-07|\n|图 11|Electron 默认原子|G01，B 阶段实机替换|\n\n';
ledger+='## 旧实例追踪\n\n`old-instance-ledger.json` 按所有章节阶段及物件逐条枚举旧实例，记录对应章节资产组；`source-visual-inventory.json` 枚举当前所有带图标库或内联 SVG 的组件。旧路线仍可达时也需要换字体｜公共素材；不能只检查新主入口。\n\n';
ledger+='## 四列交付状态\n\n机器台账独立保存 generated、aestheticApproved、integrated、deviceVerified。A 阶段为样品生成，不标注全组已产出。B、C 逐条填真实文件、锚点｜状态层、引用组件和实机证据；D 再按候选包核对缺失。正式替换率分母为全部旧实例，当前为 0，禁止将设计文档的覆盖率写成替换率。\n';
write('ASSET_REPLACEMENT_LEDGER.md',ledger);
const walk=d=>readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(resolve(d,e.name)):[resolve(d,e.name)]);
const visuals=walk(resolve(root,'src/components')).filter(f=>/\.(tsx|ts)$/.test(f)).flatMap(f=>{const text=readFileSync(f,'utf8');if(!/phosphor|<svg|<path/.test(text))return[];return[{file:relative(root,f),iconImports:[...text.matchAll(/import\s*\{([^}]+)\}\s*from\s*['"]@phosphor-icons\/react['"]/g)].flatMap(m=>m[1].split(',').map(x=>x.trim())),inlineSvg:/<svg|<path/.test(text),strategy:f.includes('scene-environment')?'按章节器物替换；禁止保留粗线正式道具':f.includes('mechanism-trace')?'语义线仅作解释层，货件/炉具/印章改用生成资产':'按公共 G 组和本章 C 组替换；兼容入口一并验收'}];});
write('source-visual-inventory.json',JSON.stringify(visuals,null,2)+'\n');
const old=[];for(const c of chapters) for(const [s,stage] of c.stages.entries())for(const [i,label] of stage.items.entries())old.push({id:`old-${c.chapter}-${s}-${i}`,chapter:c.chapter,stage:s,label,oldMode:stage.mode,source:'src/components/adventure/chapter-workbench.tsx',newAssetGroup:cards[c.chapter].assetIds,disposition:'随本章主玩法重做；该旧物件知识与功能按 knowledge-action-matrix 转入新动作'});
write('old-instance-ledger.json',JSON.stringify(old,null,2)+'\n');
const routes=walk(resolve(root,'src/app')).filter(f=>/(page|error|loading|not-found)\.tsx$/.test(f)).map(f=>({source:relative(root,f),route:relative(resolve(root,'src/app'),f).replace(/\/?page\.tsx$/,'')||'/',roles:'标题=马善政；品牌短句=志莽行书；正文｜错误｜输入｜中文数字=霞鹜文楷；英文标签=Cormorant；代码｜路径=等宽',sample: /adventure|play|map/.test(f)?'review/sample.html?view=chapter':/error|loading|not-found/.test(f)?'review/sample.html?view=errors':'review/sample.html?view=guide',mustAudit:'正文、按钮、placeholder、focus、disabled、动态消息与页脚；继承后逐组件覆盖清除现代字体声明',stage:'A 规范与全页样张；B/C 接入；D 离线实机'}));
write('typography-route-matrix.json',JSON.stringify(routes,null,2)+'\n');
write('review/data.js','window.PHASE_A='+JSON.stringify({cards,entries,coverage,scenes,routes})+';\n');
console.log(JSON.stringify({...coverage,oldInstances:old.length,visualSourceFiles:visuals.length,routes:routes.length}));
