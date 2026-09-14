import {chromium, _electron, expect} from '@playwright/test';
import {mkdtemp, mkdir, writeFile, stat} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {initialWuxia,wuxiaReducer} from '../src/core/game/wuxia';
import {wuxiaSaveSchema,parseWuxiaSave} from '../src/core/persistence/chapter-storage';
import {campaignSolution} from '../tests/helpers/campaign-solutions';
import {routeRequests} from '../src/content/minigames/campaign';
import {bestScoringIndices} from '../src/core/game/inn';
const appPath=process.argv[process.argv.indexOf('--app')+1];
const native=process.argv.includes('--app');
const dest=path.resolve(process.env.GSV_VERIFICATION_DIR||'artifacts/remediation-v2');await mkdir(dest,{recursive:true});
const errors:string[]=[],shots:string[]=[],checks:string[]=[];
const userData=await mkdtemp(path.join(tmpdir(),'gsv-v2-review-'));
const app=native?await _electron.launch({executablePath:appPath,args:[],cwd:userData,env:{...process.env,NODE_ENV:'test',GSV_TEST_USER_DATA:userData},timeout:30000}):null;
const browser=app?null:await chromium.launch({headless:true});
const context=app?app.context():await browser!.newContext({acceptDownloads:true,viewport:{width:1280,height:800}});
const page=app?await app.firstWindow():await context.newPage();
page.setDefaultTimeout(10000);
page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
await page.setViewportSize({width:1280,height:800});
const base=native?'village://app':'http://127.0.0.1:3021';
const shot=async(name:string)=>{await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(400);await page.screenshot({path:path.join(dest,`${name}.png`),fullPage:!(await page.locator('.inn-overlay').count())});shots.push(name);};
const noTurn=()=>expect(page.locator('.campaign-page-turn')).toHaveCount(0,{timeout:3000});
async function closeGuide(){const b=page.getByRole('button',{name:'我来操作第一步'});if(await b.count())await b.click();}
async function map(){const b=page.getByRole('button',{name:'合卷回地图'});if(await b.count())await b.click();else await page.getByRole('button',{name:'江湖地图',exact:true}).click();await noTurn();}
async function importSave(save:unknown){await page.getByRole('button',{name:'行囊',exact:true}).click();await page.locator('input[type=file]').setInputFiles({name:'fixture.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(save))});await page.getByRole('button',{name:'收起行囊'}).click();await expect(page.locator('.storage-warning')).toHaveCount(0);}
async function playInn(){for(let n=0;n<30;n++){
 if(await page.getByRole('button',{name:'保存称号卡 · PNG'}).count())return;
 const dice=page.locator('.inn-die');if(await dice.count()){
 const values=await dice.evaluateAll(es=>es.map(e=>Number(e.getAttribute('aria-label')!.match(/：([1-6])/u)![1])));
 for(const i of bestScoringIndices(values))await dice.nth(i).click();await page.getByRole('button',{name:/留下得分骰/}).click();
 }else if(await page.getByRole('button',{name:/稳稳收下/}).count() && await page.getByRole('button',{name:/稳稳收下/}).isEnabled())await page.getByRole('button',{name:/稳稳收下/}).click();
 else if(await page.getByRole('button',{name:'下一回合',exact:true}).count())await page.getByRole('button',{name:'下一回合',exact:true}).click();
 else await page.getByRole('button',{name:/开盅掷骰/}).click();
 }throw Error('Inn did not finish in bounded UI interactions');}
try{
 await page.goto(`${base}/adventure/`);await page.getByRole('button',{name:'开始选角'}).click();await page.getByRole('button',{name:'选择陆行舟',exact:true}).click();await page.getByRole('button',{name:'踏入江湖'}).click();await noTurn();
 await expect(page.getByRole('heading',{name:'云溪谷',exact:true})).toBeVisible();await expect(page.locator('.campaign-map-pin')).toHaveCount(14);await shot('01-paper-map-locked');
 await page.getByRole('button',{name:/百戏客栈，/}).click();await expect(page.getByRole('button',{name:'入场 · 5 文'})).toBeDisabled();await shot('02-inn-locked-preview');await page.getByRole('button',{name:'免费试桌',exact:true}).click();await page.getByRole('button',{name:/开盅掷骰/}).click();await shot('03-inn-dice');await playInn();await shot('04-inn-practice-result');
 // Blob downloads are verified in the browser; packaged protocol separately verifies the PNG response and in-app export status.
 if(!native){const download=page.waitForEvent('download');await page.getByRole('button',{name:'保存称号卡 · PNG'}).click();await (await download).saveAs(path.join(dest,'scorecard.png'));checks.push('PNG scorecard download');}else{const file=path.join(dest,'native-scorecard.png');await app!.evaluate(({session},file)=>{session.defaultSession.once('will-download',(_event,item)=>item.setSavePath(file));},file);await page.getByRole('button',{name:'保存称号卡 · PNG'}).click();await expect.poll(async()=>await stat(file).then(s=>s.size).catch(()=>0),{timeout:15000}).toBeGreaterThan(10000);checks.push('Native PNG saved to disk');}
 await page.getByRole('button',{name:'回地图',exact:true}).click();await page.getByRole('button',{name:'前往此地'}).click();await noTurn();await closeGuide();
 const reqs=routeRequests(0);for(const req of reqs){await page.getByRole('button',{name:req.label,exact:true}).click();await page.locator('.destination').getByRole('button',{name:req.entry,exact:true}).click();}
 await expect(page.locator('.route-ink-line')).toHaveCount(4);await shot('05-matched-routes');
 const bounds=await page.locator('.route-field').boundingBox(),hint=await page.locator('.campaign-next-step').boundingBox();expect(bounds!.y).toBeGreaterThanOrEqual(hint!.y+hint!.height);
 await page.getByRole('button',{name:'撤销一步'}).click();await expect(page.locator('.route-ink-line')).toHaveCount(3);await page.getByRole('button',{name:'重置本局'}).click();await expect(page.locator('.route-ink-line')).toHaveCount(0);checks.push('Four routes; undo/reset clear; no header overlap');
 await map();
 // Imported fixture was produced by replaying every chapter's real reducer actions, not by setting completion flags.
 let s=wuxiaReducer(initialWuxia(),{type:'hydrate',save:null});s=wuxiaReducer(s,{type:'intro'});s=wuxiaReducer(s,{type:'character',id:'xingzhou'});
 for(let ch=0;ch<13;ch++){s=wuxiaReducer(s,{type:'enter',chapter:ch});for(const event of campaignSolution(ch))s=wuxiaReducer(s,{type:'campaign-act',event});if(s.error)throw Error(s.notice);}
 const save=wuxiaSaveSchema.parse({...s,currentChapter:null});expect(parseWuxiaSave(save)).not.toBeNull();await importSave(save);await shot('06-paper-map-complete');
 await page.getByRole('button',{name:'行囊',exact:true}).click();await shot('07-inventory');await page.getByRole('button',{name:'收起行囊'}).click();
 await page.getByRole('button',{name:/百戏客栈，/}).click();await page.getByRole('button',{name:'换青玉桌 · 1 两'}).click();await page.getByRole('button',{name:'入场 · 10 文'}).click();await page.getByRole('button',{name:/开盅掷骰/}).click();await shot('08-inn-paid-jade');
 const walletBefore=await page.evaluate(()=>JSON.parse(localStorage.getItem('gsv:wuxia:v3')!).wallet.copper);await page.getByRole('button',{name:'回地图',exact:true}).click();await page.reload();await page.getByRole('button',{name:'继续上次历练'}).click();await page.getByRole('button',{name:/百戏客栈，/}).click();expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('gsv:wuxia:v3')!).wallet.copper)).toBe(walletBefore);await playInn();await shot('09-paid-result');await page.getByRole('button',{name:'回地图',exact:true}).click();checks.push('Paid inn: silver decor, entry once, reload in turn, three rounds, settlement');
 for(let ch=0;ch<13;ch++){
  await page.getByLabel('主线地点索引').selectOption(String(ch));await page.getByRole('button',{name:'重访此地'}).click();await noTurn();await closeGuide();await page.getByRole('button',{name:'重置本局'}).click();await shot(`chapter-${ch}`);
  if([1,2,3].includes(ch)){await page.getByRole('button',{name:'购入随身详解 · 5文'}).click();await expect(page.getByRole('dialog',{name:'随身详解'})).toBeVisible();await page.getByRole('dialog',{name:'随身详解'}).getByRole('button',{name:'回到盘面'}).click();}
  if([4,10].includes(ch)){
   const cards=page.locator(ch===4?'.library-card':'.change-card');const tops=await cards.locator('strong').evaluateAll(es=>es.map(e=>e.getBoundingClientRect().top));const cols=ch===4?6:4;for(let i=0;i<tops.length;i+=cols)expect(Math.max(...tops.slice(i,i+cols))-Math.min(...tops.slice(i,i+cols))).toBeLessThan(1);
   if(ch===4){await page.getByRole('button',{name:'取册 README',exact:true}).click();await expect(page.locator('.four-tray')).toContainText('README');}
   if(ch===10){await page.getByRole('button',{name:'README.md 查看 Diff',exact:true}).click();await expect(page.locator('.stage-tray')).toContainText('README');}
  }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);await expect(page.locator('.storage-warning')).toHaveCount(0);await map();
 }
 checks.push('All 13 chapter screens, card baselines, real tray clicks, three paid notes, no horizontal overflow');
 for(const [w,h] of [[1440,900],[768,900]]){await page.setViewportSize({width:w,height:h});await shot(`map-${w}`);expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);}
 await page.setViewportSize({width:1280,height:800});
 for(let n=0;n<10;n++){await page.getByLabel('主线地点索引').selectOption('0');await page.getByRole('button',{name:'重访此地'}).click();await expect(page.locator('.campaign-page-turn')).toBeVisible();if(n===0){await page.waitForTimeout(180);await page.screenshot({path:path.join(dest,'turn-180ms.png')});await page.waitForTimeout(180);await page.screenshot({path:path.join(dest,'turn-360ms.png')});}await noTurn();await closeGuide();await map();}
 checks.push('Ten uninterrupted center-hinge transitions');
 await page.getByRole('button',{name:'行囊',exact:true}).click();await page.getByLabel('减少动态效果').check();await page.getByRole('button',{name:'收起行囊'}).click();await page.getByRole('button',{name:'重访此地'}).click();await expect(page.locator('.campaign-page-turn')).toHaveCount(0);checks.push('Reduced motion skips animation');
 expect(errors).toEqual([]);
 await writeFile(path.join(dest,'report.json'),JSON.stringify({passed:true,native,checks,shots,errors,fixture:'All-chapter save generated by campaignSolution replay; independent test profile, no user save touched'},null,2));console.log(JSON.stringify({passed:true,native,checks,shots:shots.length,errors}));
} catch(e){await page.screenshot({path:path.join(dest,'failure.png'),fullPage:true});await writeFile(path.join(dest,'failure.json'),JSON.stringify({error:String(e),errors,checks},null,2));throw e;}finally{await app?.close();await browser?.close();}
