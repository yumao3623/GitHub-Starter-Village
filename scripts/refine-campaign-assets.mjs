// Extract connected illustrated objects, not assumed equal atlas rectangles.
// Color key is used only for newly generated assets explicitly authored on magenta.
import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';
const out='public/assets/phase-c/refined';
await fs.mkdir(out,{recursive:true});
function components(data,w,h){
 const seen=new Uint8Array(w*h), queue=new Int32Array(w*h), parts=[];
 for(let i=0;i<w*h;i++){
  if(seen[i]||data[i*4+3]<32)continue;
  let head=0,tail=1;queue[0]=i;seen[i]=1;const p={pixels:[],x:w,y:h,right:0,bottom:0};
  while(head<tail){const k=queue[head++],x=k%w,y=Math.floor(k/w);p.pixels.push(k);p.x=Math.min(p.x,x);p.y=Math.min(p.y,y);p.right=Math.max(p.right,x);p.bottom=Math.max(p.bottom,y);
   for(const j of [x? k-1:-1,x<w-1?k+1:-1,y?k-w:-1,y<h-1?k+w:-1])if(j>=0&&!seen[j]&&data[j*4+3]>=32){seen[j]=1;queue[tail++]=j;}
  }parts.push(p);
 }return parts.sort((a,b)=>b.pixels.length-a.pixels.length);
}
const report=[];
for(let chapter=0;chapter<13;chapter++){
 const source=`public/assets/phase-c/props/chapter-${chapter}.png`;
 const {data,info:{width:w,height:h}}=await sharp(source).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const parts=components(data,w,h), major=parts.filter(p=>p.pixels.length>800);
 const used=new Set();
 for(let index=0;index<8;index++){
  const cx=(index%4+.5)*w/4,cy=(Math.floor(index/4)+.5)*h/2;
  const candidates=major.filter(p=>!used.has(p)&&Math.abs((p.x+p.right)/2-cx)<w/4*.7&&Math.abs((p.y+p.bottom)/2-cy)<h/2*.7);
  const main=candidates.sort((a,b)=>Math.hypot(((a.x+a.right)/2-cx)/w,((a.y+a.bottom)/2-cy)/h)-Math.hypot(((b.x+b.right)/2-cx)/w,((b.y+b.bottom)/2-cy)/h))[0];
  if(!main)throw new Error(`Missing illustrated object ${chapter}:${index}`);used.add(main);
  const keep=[main,...parts.filter(p=>p!==main&&p.pixels.length>=12&&p.pixels.length<main.pixels.length*.03&&p.x>=main.x-7&&p.right<=main.right+7&&p.y>=main.y-7&&p.bottom<=main.bottom+7)];
  const mask=new Uint8Array(w*h);for(const p of keep)for(const k of p.pixels)mask[k]=1;
  // Keep antialias pixels adjacent to retained components, while excluding stray atlas pieces.
  const buf=Buffer.from(data);for(let k=0;k<w*h;k++)if(!mask[k]){const near=[k-1,k+1,k-w,k+w].some(i=>i>=0&&i<w*h&&mask[i]);if(!near)buf[k*4+3]=0;}
  const left=Math.max(0,Math.min(...keep.map(p=>p.x))-2),top=Math.max(0,Math.min(...keep.map(p=>p.y))-2);
  const right=Math.min(w-1,Math.max(...keep.map(p=>p.right))+2),bottom=Math.min(h-1,Math.max(...keep.map(p=>p.bottom))+2);
  const target=`${out}/ch${chapter}-${index}.png`;
  await sharp(buf,{raw:{width:w,height:h,channels:4}}).extract({left,top,width:right-left+1,height:bottom-top+1}).resize(440,440,{fit:'contain',background:'#00000000'}).extend({top:20,bottom:20,left:20,right:20,background:'#00000000'}).png().toFile(target);
  report.push({chapter,index,source,file:target,crop:{left,top,right,bottom},retained:keep.length,removedComponents:parts.length-keep.length});
 }
}
const generated='/Users/maoyu/.codex/generated_images/01a09e38-6bd2-7da3-88a9-33a41982357f';
for(const [file,name] of [
 ['exec-ede8ceb7-e95e-4800-9f25-a35e3a41dba1.png','map-paper'],
 ['exec-3c1a6d84-9f02-470d-9e5c-e395ebb4b4ae.png','inn-nodes'],
 ['exec-ebe08120-8b8b-4090-b09e-403a2acd9db3.png','bone-die']]){
 const {data,info}=await sharp(path.join(generated,file)).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 for(let k=0;k<data.length;k+=4){const r=data[k],g=data[k+1],b=data[k+2];const excess=Math.min(r,b)-g;
  if(excess>35){const alpha=Math.max(0,Math.min(1,(180-excess)/145));data[k+3]=Math.round(data[k+3]*alpha);if(alpha>0){data[k]=Math.min(r,g+22);data[k+2]=Math.min(b,g+8);}}
 }
 await sharp(data,{raw:info}).png().toFile(`${out}/${name}.png`);
 report.push({source:path.join(generated,file),file:`${out}/${name}.png`,method:'Generated magenta backdrop keyed to alpha; fringe despill'});
}
await fs.writeFile('docs/assets/phase-c/refined-extraction.json',JSON.stringify(report,null,2));
console.log(`Extracted ${report.length} assets`);
