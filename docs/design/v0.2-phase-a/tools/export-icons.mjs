// Format/size exports only. The actual artwork was created with Imagegen.
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {execFileSync} from 'node:child_process';
import sharp from 'sharp';
const dir=resolve(import.meta.dirname,'../assets');
for(const id of ['a','b','c']){
 const set=resolve(dir,`icon-${id}.iconset`);mkdirSync(set,{recursive:true});
 for(const size of [16,32,128,256,512]) for(const scale of [1,2]){
  await sharp(resolve(dir,`icon-${id}.png`)).resize(size*scale,size*scale).png().toFile(resolve(set,`icon_${size}x${size}${scale===2?'@2x':''}.png`));
 }
 execFileSync('/usr/bin/iconutil',['-c','icns',set,'-o',resolve(dir,`icon-${id}.icns`)]);
 const b=readFileSync(resolve(dir,`icon-${id}.icns`));
 if(b.toString('ascii',0,4)!=='icns'||b.readUInt32BE(4)!==b.length)throw Error('Invalid icns '+id);
 console.log(`icon-${id}.icns: ${b.length} bytes, valid container`);
}
writeFileSync(resolve(dir,'ICON_EXPORTS.md'),'# 秘籍候选导出\n\n三张 Imagegen 母图分别生成标准 iconset 的 16/32/128/256/512 及 @2x 图片，再由 macOS iconutil 转为 .icns。\n\n这些是候选设计资源，尚未接入 Electron 打包链或在 Finder、Dock、应用切换器验证。不要把 .icns 导出成功写成原生图标已替换。\n');
