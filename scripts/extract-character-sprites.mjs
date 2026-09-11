/** Deterministic RGBA extraction. No new model or network calls. */
import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';
const records=[];
async function sprite(source,id,pose,rect){
 const {data,info}=await sharp(source).extract(rect).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const w=info.width,h=info.height,seen=new Uint8Array(w*h);let largest=[];
 const visible=i=>data[i*4+3]>110;
 for(let i=0;i<w*h;i++)if(!seen[i]&&visible(i)){
  const comp=[],stack=[i];seen[i]=1;
  while(stack.length){const p=stack.pop();comp.push(p);const x=p%w,y=Math.floor(p/w);for(const q of [x?p-1:-1,x<w-1?p+1:-1,y?p-w:-1,y<h-1?p+w:-1])if(q>=0&&!seen[q]&&visible(q)){seen[q]=1;stack.push(q)}}
  if(comp.length>largest.length)largest=comp;
 }
 const keep=new Uint8Array(w*h);for(const p of largest)keep[p]=1;
 // Preserve antialias only next to the actual silhouette, discard disconnected colored residue.
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const p=y*w+x,j=p*4;let adjacent=keep[p];if(!adjacent)for(const q of [x?p-1:-1,x<w-1?p+1:-1,y?p-w:-1,y<h-1?p+w:-1])if(q>=0&&keep[q])adjacent=1;
  const r=data[j],g=data[j+1],b=data[j+2];const fringe=(r>220&&g<55&&b<65)||(b>215&&r<60&&g<90)||(r>225&&g>220&&b<60);
  if(!adjacent||data[j+3]<55||fringe){data[j+3]=0;continue;}
  data[j+3]=Math.min(255,Math.round((data[j+3]-55)*255/190));
 }
 let minX=w,minY=h,maxX=0,maxY=0;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(data[(y*w+x)*4+3]>20){minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y)}
 const cut={left:minX,top:minY,width:maxX-minX+1,height:maxY-minY+1};
 const targetH=id==='atuan'?350:600;
 const body=await sharp(data,{raw:{width:w,height:h,channels:4}}).extract(cut).resize({height:targetH,width:390,fit:'inside'}).png().toBuffer();
 const meta=await sharp(body).metadata();const left=Math.floor((420-meta.width)/2),top=632-meta.height;
 const file=`public/characters/${id}-${pose}.png`;
 await sharp({create:{width:420,height:640,channels:4,background:'#00000000'}}).composite([{input:body,left,top}]).png().toFile(file);
 records.push({path:file,width:420,height:640,channels:4,hasAlpha:true,source,crop:{...rect,foreground:cut},footBaseline:632,visualCenter:{x:210,y:top+meta.height/2},direction:'right',light:'upper-left',revision:2,review:'metadata-and-contact-sheet',discardedComponents:true});
}
for(const [id,left,width] of [['xingzhou',0,600],['zhiwei',600,500],['atuan',1100,436]])await sprite('public/characters/wuxia-cast-transparent-final.png',id,'standing',{left,top:0,width,height:1024});
for(const [id,top,height] of [['xingzhou',0,382],['zhiwei',383,374],['atuan',758,213]])for(const [pose,left] of [['walking',324],['inspecting',972],['celebrating',1296]])await sprite('public/characters/wuxia-actions-transparent-final.png',id,pose,{left,top,width:324,height});
await writeFile('docs/assets/character-sprites-v2.json',JSON.stringify(records,null,2)+'\n');
// Build review contact sheet at actual rendered scale on light and dark backgrounds.
const composite=[];
for(let i=0;i<records.length;i++){const r=records[i];const img=await sharp(r.path).resize(126,192).toBuffer();for(let bg=0;bg<2;bg++)composite.push({input:img,left:(i%4)*170+22+bg*700,top:Math.floor(i/4)*220+12})}
await sharp({create:{width:1400,height:660,channels:4,background:'#eee7d5'}}).composite([{input:await sharp({create:{width:700,height:660,channels:4,background:'#213d37'}}).png().toBuffer(),left:700,top:0},...composite]).png().toFile('artifacts/character-contact-sheet.png');
console.log(`Extracted ${records.length} isolated RGBA sprites; transparent corners, shared foot baseline 632/640.`);
