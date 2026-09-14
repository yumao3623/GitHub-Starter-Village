import {readFileSync,writeFileSync,readdirSync,existsSync} from 'node:fs';
import {resolve,relative} from 'node:path';
import {createHash} from 'node:crypto';
import sharp from 'sharp';
const dir=resolve(import.meta.dirname,'..');
const prompts=JSON.parse(readFileSync(resolve(dir,'generation-prompts.json'),'utf8'));
const selected=new Set(['icon-a','icon-b','icon-c','lock-a','lock-b','button-final','slip-final','coin-pouch','silver-note','travel-pass','lock-open-final','lock-complete-final','chapter10-artboard']);
const rejected=new Set(['button-refined','slip-refined','lock-open','lock-complete']);
const manifest=[];
for(const p of prompts){
 const file=`assets/${p.id}.png`,buf=readFileSync(resolve(dir,file)),m=await sharp(buf).metadata();
 const entry={id:p.id,file,width:m.width,height:m.height,hasAlpha:!!m.hasAlpha,bytes:buf.length,sha256:createHash('sha256').update(buf).digest('hex'),selectedForStageA:selected.has(p.id),productionReady:false,userApproved:false,appIntegrated:false,source:'built-in imagegen',originalPath:p.originalPath,promptRecord:'generation-prompts.json#'+p.id,status:rejected.has(p.id)?'REJECTED: checkerboard baked into opaque output':selected.has(p.id)?'A review sample; not user-approved production asset':'Unused earlier composition; retained for generation history'};
 if(selected.has(p.id)&&!p.id.startsWith('icon-')&&p.id!=='chapter10-artboard'&&!m.hasAlpha)throw Error('Selected sprite has no alpha '+p.id);
 if(m.hasAlpha){const {data,info}=await sharp(buf).raw().toBuffer({resolveWithObject:true});let transparent=0,solid=0;for(let i=info.channels-1;i<data.length;i+=info.channels){if(data[i]===0)transparent++;if(data[i]>=250)solid++;}entry.transparentPixelRatio=Number((transparent/(m.width*m.height)).toFixed(4));entry.solidPixelRatio=Number((solid/(m.width*m.height)).toFixed(4));}
 manifest.push(entry);
}
writeFileSync(resolve(dir,'asset-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
const walk=d=>readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(resolve(d,e.name)):[resolve(d,e.name)]);
const files=walk(dir).filter(f=>!f.includes('/evidence/')&&!f.endsWith('FILE_HASHES.sha256'));
writeFileSync(resolve(dir,'FILE_HASHES.sha256'),files.map(f=>createHash('sha256').update(readFileSync(f)).digest('hex')+'  '+relative(dir,f)).join('\n')+'\n');
const proof={generatedCalls:manifest.length,selectedReviewImages:manifest.filter(e=>e.selectedForStageA).length,rejectedImages:manifest.filter(e=>rejected.has(e.id)).length,selectedSprites:manifest.filter(e=>e.selectedForStageA&&e.hasAlpha).map(e=>({id:e.id,alpha:e.transparentPixelRatio})),note:'Native .icns container exported only; game integration and device acceptance remain B/C/D.'};
writeFileSync(resolve(dir,'evidence/asset-audit.json'),JSON.stringify(proof,null,2)+'\n');console.log(JSON.stringify(proof));
