// NPC derived only from the project's original cast: preserve brushwork, light and alpha.
import sharp from 'sharp';
import {writeFile,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const source='public/characters/xingzhou-inspecting.png';
const {data,info}=await sharp(source).raw().toBuffer({resolveWithObject:true});
for(let i=0;i<data.length;i+=4){const r=data[i],g=data[i+1],b=data[i+2];if(data[i+3]&&b>r*1.16&&b>g*1.05){data[i]=Math.round(r*.84);data[i+1]=Math.round(g*.45+b*.38);data[i+2]=Math.round(b*.53+r*.23);}}
const file='public/characters/qingyan-inspecting.png';await sharp(data,{raw:info}).png().toFile(file);
const manifestPath='docs/assets/manifest.json';const manifest=JSON.parse(await readFile(manifestPath,'utf8'));const original=manifest.assets.find(a=>a.file===source);const asset={...original,id:'characters/qingyan-inspecting',file,sha256:createHash('sha256').update(await readFile(file)).digest('hex'),references:[source],creator:'Original project cast derivative, robe palette adjusted locally',sourceRecord:'docs/assets/SPRITE_EXTRACTION_2026-09-11.md'};manifest.assets=manifest.assets.filter(a=>a.file!==file);manifest.assets.push(asset);await writeFile(manifestPath,JSON.stringify(manifest,null,2)+'\n');
