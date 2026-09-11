import { readFile, readdir, access } from "node:fs/promises";
import { sha256 } from "./lib/distribution.mjs";
const manifest = JSON.parse(await readFile("docs/assets/manifest.json","utf8"));
const files = (await readdir("public",{recursive:true})).filter(file=>/\.(png|jpg|webp|svg|wav|mp3|ogg)$/i.test(file)).map(file=>`public/${file}`);
if(manifest.schemaVersion!==1 || new Set(manifest.assets.map(a=>a.id)).size!==manifest.assets.length || new Set(manifest.assets.map(a=>a.file)).size!==manifest.assets.length) throw new Error("素材清单版本或 ID 重复");
if(files.some(file=>!manifest.assets.some(a=>a.file===file))) throw new Error("存在未登记素材");
for(const asset of manifest.assets){
  for(const key of ["id","file","kind","sourceRecord","distribution","attribution","review","creator","license"]) if(!asset[key]) throw new Error(`缺少 ${key}`);
  if(!files.includes(asset.file) || await sha256(asset.file)!==asset.sha256) throw new Error(`素材缺失或哈希改变：${asset.file}`);
  await access(asset.sourceRecord);
  if(asset.file.endsWith(".png")){const bytes=await readFile(asset.file);if(bytes.readUInt32BE(16)!==asset.width || bytes.readUInt32BE(20)!==asset.height)throw new Error("图集尺寸不符");}
}
console.log(JSON.stringify({passed:true,assets:files.length,provenanceGaps:manifest.assets.filter(a=>a.review==="legacy-provenance-gap").map(a=>a.file),note:"来源与完整性检查，不是法律权属认证"},null,2));
if(process.argv.includes("--public") && manifest.assets.some(a=>a.review!=="internal-reviewed"))process.exit(1);
