import {chromium} from '@playwright/test';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {writeFileSync} from 'node:fs';
const dir=resolve(import.meta.dirname,'..');
const browser=await chromium.connectOverCDP(process.env.PHASE_A_CDP);
const context=browser.contexts()[0];
const page=await context.newPage();
const base=process.env.PHASE_A_URL?process.env.PHASE_A_URL+'/review/sample.html':pathToFileURL(resolve(dir,'review/sample.html')).href;
const result={date:'2026-09-12',scope:'Stage A standalone review only, not application acceptance',cases:[],fontEvidence:[],uiChecks:[],errors:[]};
page.on('pageerror',e=>result.errors.push(e.message));
page.on('console',m=>{if(m.type()==='error')result.errors.push(m.text());});
// All specimen resources are local; block external HTTP requests for offline proof.
await context.route(/^https?:\/\//,route=>['localhost','127.0.0.1'].includes(new URL(route.request().url()).hostname)?route.continue():route.abort());
const sizes=[[1440,900],[1280,800],[1024,720]];
const views=['intro','choose','map','chapter','book','bag','thanks','guide','errors'];
for(const [width,height] of sizes){
 await page.setViewportSize({width,height});
 for(const view of views){
  await page.goto(base+'?view='+view,{waitUntil:'load'});
  await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));});
  const check=await page.evaluate(()=>{
   const rect=el=>{if(!el)return null;const r=el.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom,right:r.right};};
   const main=document.querySelector('.sample-content');
   const controls=[...document.querySelectorAll('.sample-actions button')].map(el=>({text:el.textContent,...rect(el)}));
   return{viewport:[innerWidth,innerHeight],scroll:[document.documentElement.scrollWidth,document.documentElement.scrollHeight],scene:rect(main),footer:rect(document.querySelector('.sample-footer')),controls,images:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src),fonts:[...document.fonts].filter(f=>f.status==='error').map(f=>f.family),fontStatus:document.fonts.status};
  });
  check.view=view;check.size=`${width}x${height}`;
  check.pass=check.scroll[0]<=width&&check.scroll[1]<=height&&check.controls.every(c=>c.y>=0&&c.bottom<=height&&c.right<=width)&&!check.images.length&&!check.fonts.length;
  result.cases.push(check);
  if(width===1280||view==='chapter'||view==='map')await page.screenshot({path:resolve(dir,`evidence/${view}-${width}x${height}.png`)});
 }
 for(const chapter of [0,8]){
  await page.goto(base+`?view=chapter&chapter=${chapter}`);await page.evaluate(()=>document.fonts.ready);
  const box=await page.locator('.sample-content').boundingBox();
  const ref=result.cases.find(c=>c.view==='chapter'&&c.size===`${width}x${height}`).scene;
  result.uiChecks.push({case:`chapter ${chapter} vs chapter 10 ${width}x${height}`,sameFrame:box.x===ref.x&&box.y===ref.y&&box.width===ref.width&&box.height===ref.height});
  await page.screenshot({path:resolve(dir,`evidence/chapter-${chapter}-${width}x${height}.png`)});
 }
}
await page.setViewportSize({width:1280,height:800});
for(const node of ['a','b','open','complete']){
 await page.goto(base+'?view=map&node='+node);await page.evaluate(()=>document.fonts.ready);
 await page.screenshot({path:resolve(dir,`evidence/map-node-${node}.png`)});
 if(node==='b'){
  await page.getByRole('button',{name:'第四章藏图阁，节点造型对照'}).click();
  await page.screenshot({path:resolve(dir,'evidence/pass-dialog.png')});
  result.uiChecks.push({case:'map node dialog',pass:await page.locator('dialog').evaluate(el=>el.open)});
  await page.getByRole('button',{name:'收起',exact:true}).click();
  result.uiChecks.push({case:'dialog closes',pass:!(await page.locator('dialog').evaluate(el=>el.open))});
 }
}
await page.goto(base+'?view=chapter');await page.evaluate(()=>document.fonts.ready);
const cdp=await context.newCDPSession(page);await cdp.send('DOM.enable');await cdp.send('CSS.enable');
const doc=await cdp.send('DOM.getDocument');
for(const selector of ['.sample-title h1','.aside-note p','.sample-actions .paper-button','.sample-footer p','.change-card .en']){
 const {nodeId}=await cdp.send('DOM.querySelector',{nodeId:doc.root.nodeId,selector});
 const {fonts}=await cdp.send('CSS.getPlatformFontsForNode',{nodeId});
 result.fontEvidence.push({selector,fonts});
}
await page.goto(base+'?view=chapter&font=old');await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:resolve(dir,'evidence/chapter-legacy-font-direction.png')});
const index=process.env.PHASE_A_URL?process.env.PHASE_A_URL+'/review/index.html':pathToFileURL(resolve(dir,'review/index.html')).href;
for(const tab of ['overview','icons','type','chapters','motion','ledger']){
 await page.goto(index+'#'+tab);await page.evaluate(()=>document.fonts.ready);
 await page.screenshot({path:resolve(dir,`evidence/review-${tab}.png`),fullPage:tab==='overview'||tab==='icons'});
}
await page.locator('#ledgerSearch').fill('C10-01');result.uiChecks.push({case:'ledger search',pass:(await page.locator('#ledgerRows tr').count())===1});
await page.getByRole('button',{name:'主线玩法',exact:true}).click();await page.locator('[data-chapter="8"]').click();result.uiChecks.push({case:'chapter card selection',pass:(await page.locator('#chapterDetail h1').textContent()).includes('双城驿站')});
await context.unroute(/^https?:\/\//);
result.pass=result.cases.every(c=>c.pass)&&result.uiChecks.every(c=>c.pass??c.sameFrame)&&result.fontEvidence.every(e=>e.fonts.some(f=>f.isCustomFont))&&!result.errors.length;
writeFileSync(resolve(dir,'evidence/browser-review-audit.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({pass:result.pass,cases:result.cases.length,failed:result.cases.filter(c=>!c.pass),ui:result.uiChecks,fonts:result.fontEvidence,errors:result.errors}));
await page.close();await browser.close();
if(!result.pass)process.exitCode=1;
