import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
export async function buildInputDigest(root) {
  const files = ["package.json","package-lock.json","next.config.ts"];
  for (const folder of ["src","public","desktop"]) {
    for (const entry of await readdir(path.join(root,folder),{recursive:true,withFileTypes:true})) {
      if(entry.isFile())files.push(path.relative(root,path.join(entry.parentPath,entry.name)));
    }
  }
  const hash=createHash("sha256");
  for(const file of files.sort()) { hash.update(file.replaceAll(path.sep,"/"));hash.update("\0");hash.update(await readFile(path.join(root,file)));hash.update("\0"); }
  return hash.digest("hex");
}
