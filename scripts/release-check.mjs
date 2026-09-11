import { readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import brand from "../src/config/brand.json" with { type: "json" };
import config from "../src/config/distribution.json" with { type: "json" };
import desktop from "../src/config/desktop.json" with { type: "json" };
import pkg from "../package.json" with { type: "json" };
import { downloadSection, verifyArtifact } from "./lib/distribution.mjs";

const expected = downloadSection(brand, config, desktop.executableName, pkg.version);
if (process.argv.includes("--print-readme")) { console.log(expected); process.exit(0); }
const readme = await readFile("README.md", "utf8");
if (!readme.includes(expected)) throw new Error("README 下载区与配置不一致；运行 --print-readme 后更新标记区。");
const flag = process.argv.indexOf("--artifact");
const artifact = flag >= 0 ? await verifyArtifact(process.argv[flag + 1]) : null;
const identityCount = process.platform === "darwin" ? (() => {
  try { return Number(execFileSync("security", ["find-identity", "-v", "-p", "codesigning"], { encoding: "utf8" }).match(/(\d+) valid identities found/)?.[1] ?? 0); } catch { return null; }
})() : null;
const blockers = [
  ...(brand.repositoryUrl.includes("/OWNER/") ? ["尚未配置真实仓库地址"] : []),
  ...config.targets.filter(t => !t.public).map(t => `${t.label} 未批准公开分发`),
  "签名、公证、干净系统安装/升级/卸载与下载后系统安全检查须提供同一产物的实际记录",
];
// Hash integrity alone cannot authorize a public release.
console.log(JSON.stringify({ localChecksPassed: true, artifactVerified: artifact?.filename ?? null, configuredStatus: config.status, codeSigningIdentityCount: identityCount, publicReleaseReady: false, blockers }, null, 2));
if (process.argv.includes("--public")) { console.error("公开发布门禁未开放：当前只生成内部候选包，需完成验收后单独审核发布配置。"); process.exit(1); }
