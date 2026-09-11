import { spawnSync } from "node:child_process";
import { writeFile } from "node:fs/promises";
import { buildInputDigest } from "./lib/build-inputs.mjs";
const sourceDigest = await buildInputDigest(process.cwd());
const result = spawnSync(process.execPath, ["node_modules/next/dist/bin/next", "build", "--webpack"], { stdio: "inherit", env: { ...process.env, GSV_DESKTOP_EXPORT: "1" } });
if (result.status === 0) {
  if (sourceDigest !== await buildInputDigest(process.cwd())) throw new Error("构建期间源码改变，请重跑 desktop:build。");
  await writeFile("out/build-info.json",JSON.stringify({sourceDigest,builtAt:new Date().toISOString()},null,2));
}
process.exit(result.status ?? 1);
