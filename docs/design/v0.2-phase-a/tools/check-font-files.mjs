// Read-only integrity and code point range audit for the bundled specimen fonts.
import {readFileSync,readdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
const dir=resolve(import.meta.dirname,'..');
const fonts=resolve(dir,'fonts');
const report={date:'2026-09-12',fontFiles:[],unicodeRangeCoverage:{},note:'TTF table bounds and WOFF2 header lengths check structural integrity, not aesthetic approval. Actual rendered fonts also checked in the review browser.'};
for(const name of ['mashanzheng.ttf','zhimangxing.ttf','cormorant.ttf']){
 const b=readFileSync(resolve(fonts,name));const tables=b.readUInt16BE(4);let valid=true;
 for(let i=0;i<tables;i++){const p=12+i*16;if(p+16>b.length){valid=false;break;}if(b.readUInt32BE(p+8)+b.readUInt32BE(p+12)>b.length)valid=false;}
 if(!valid)throw Error(`Truncated TTF ${name}`);
 report.fontFiles.push({name,bytes:b.length,sha256:createHash('sha256').update(b).digest('hex'),tableBoundsValid:valid});
}
for(const name of readdirSync(resolve(fonts,'wenkai-web/files'))){const b=readFileSync(resolve(fonts,'wenkai-web/files',name));const valid=b.toString('ascii',0,4)==='wOF2'&&b.readUInt32BE(8)===b.length;if(!valid)throw Error(`Invalid WOFF2 ${name}`);report.fontFiles.push({name:'wenkai-web/files/'+name,bytes:b.length,sha256:createHash('sha256').update(b).digest('hex'),woff2LengthValid:true});}
const walk=d=>readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(resolve(d,e.name)):[resolve(d,e.name)]);
const root=resolve(dir,'../../..');
const corpus=walk(resolve(root,'src')).filter(f=>/\.(tsx?|css)$/.test(f)).map(f=>readFileSync(f,'utf8')).join('')+walk(resolve(dir,'review')).filter(f=>/\.(html|js|css)$/.test(f)).map(f=>readFileSync(f,'utf8')).join('');
const chars=[...new Set([...corpus].filter(c=>/\p{Script=Han}/u.test(c)))];
for(const family of ['lxgwwenkai-regular','lxgwwenkaimono-regular']){const css=readFileSync(resolve(fonts,'wenkai-web',family+'.css'),'utf8');const ranges=[...css.matchAll(/U\+([a-f\d]+)(?:-([a-f\d]+))?/ig)].map(m=>[parseInt(m[1],16),parseInt(m[2]||m[1],16)]);const missing=chars.filter(c=>!ranges.some(([a,b])=>c.codePointAt(0)>=a&&c.codePointAt(0)<=b));report.unicodeRangeCoverage[family]={hanCharacters:chars.length,missing};if(missing.length)process.exitCode=1;}
writeFileSync(resolve(dir,'evidence/font-file-audit.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({files:report.fontFiles.length,coverage:report.unicodeRangeCoverage}));
