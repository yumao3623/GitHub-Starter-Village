import { readFile, writeFile, mkdir } from "node:fs/promises";
import { execFileSync, spawnSync } from "node:child_process";
import path from "node:path";
import brand from "../src/config/brand.json" with { type: "json" };
import config from "../src/config/distribution.json" with { type: "json" };
import desktop from "../src/config/desktop.json" with { type: "json" };
import pkg from "../package.json" with { type: "json" };
import { downloadSection, verifyArtifact } from "./lib/distribution.mjs";

const root = process.cwd();
const artifactArg = process.argv.indexOf("--artifact");
const artifactPath = artifactArg >= 0 ? process.argv[artifactArg + 1] : null;
const publicMode = process.argv.includes("--public");
const date = new Date().toISOString().slice(0, 10);
const outputDir = path.join(root, "docs/releases");
const jsonPath = path.join(outputDir, `PHASE_E_RELEASE_READINESS_${date}.json`);
const markdownPath = path.join(outputDir, `PHASE_E_RELEASE_READINESS_${date}.md`);
const blockers = [];
const warnings = [];
const checks = {};

function check(name, passed, detail, okDetail = "已通过") {
  checks[name] = { status: passed ? "passed" : "blocked", detail: passed ? okDetail : detail };
  if (!passed) blockers.push(detail);
}
function warn(name, detail) {
  checks[name] = { status: "warning", detail };
  warnings.push(detail);
}

const expectedReadme = downloadSection(brand, config, desktop.executableName, pkg.version);
const readme = await readFile(path.join(root, "README.md"), "utf8");
check("readme", readme.includes(expectedReadme), "README 下载区与当前候选配置不一致，请运行 npm run desktop:release-check -- --print-readme 后更新标记区。", "与当前候选配置一致");
check("repository", /^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(brand.repositoryUrl), "brand.json 尚未配置可验证的 GitHub 仓库地址。", brand.repositoryUrl);
check("status", config.status !== "published", "distribution.json 仍标记为 published；只有真实 Release 资产、签名、公证和下载复核完成后才能改为 published。", `当前状态为 ${config.status}`);
check("versionTag", config.releaseTag === `v${pkg.version}`, `Release 标签 ${config.releaseTag ?? "(空)"} 与 package.json 版本 v${pkg.version} 不一致。`, `标签与版本一致：${config.releaseTag}`);

let artifact = null;
if (artifactPath) {
  try {
    artifact = await verifyArtifact(path.resolve(root, artifactPath));
    check("artifact", true, artifact.filename, artifact.filename);
    check("artifactVersion", artifact.version === pkg.version, `产物版本 ${artifact.version ?? "(空)"} 与 package.json 版本 ${pkg.version} 不一致。`, `版本一致：${artifact.version}`);
    check("source", artifact.sourceDirty === false, "候选产物由未提交工作树构建，不能作为可追溯公开 Release。");
    warn("signing", `签名状态为 ${artifact.signing ?? "(空)"}；本项目按 GitHub 下载试用分发，可保留 ad-hoc 签名。`);
    warn("notarization", `公证状态为 ${artifact.notarization ?? "(空)"}；GitHub 下载试用不要求 Apple 公证。`);
    warn("systemAcceptance", `干净系统验收状态为 ${artifact.systemAcceptance ?? "(空)"}；发布后由维护者下载实测。`);
    check("publishedFlag", artifact.published === false, "产物清单已经标记 published，不能重复或未经核对地上传。", "产物仍标记为未发布");
  } catch (error) {
    check("artifact", false, `产物清单无法验证：${error.message}`);
  }
} else {
  check("artifact", false, "未提供 artifact.json；请先用同一源码运行 npm run desktop:build 与 npm run desktop:package。");
}

const statusLines = execFileSync("git", ["status", "--porcelain"], { encoding: "utf8" }).trim().split("\n").filter(Boolean);
const generatedReports = new Set([
  `docs/releases/PHASE_E_RELEASE_READINESS_${date}.json`,
  `docs/releases/PHASE_E_RELEASE_READINESS_${date}.md`,
]);
const dirtyPaths = statusLines.filter((line) => !generatedReports.has(line.slice(3)));
check("worktree", dirtyPaths.length === 0, "当前工作树仍有未提交变更；发布候选必须记录对应提交并由维护者审核。", "工作树干净（忽略本次生成的报告文件）");
check("targets", config.targets.every((target) => target.public === false), "仍有目标平台标记为 public；在真实下载复核前必须保持关闭。", "所有目标平台公开开关均已关闭");
const authResult = spawnSync("gh", ["auth", "status"], { encoding: "utf8" });
const authOutput = `${authResult.stdout ?? ""}\n${authResult.stderr ?? ""}`;
if (authResult.status !== 0 || /failed to log in|invalid token|not logged in/i.test(authOutput)) {
  warn("githubCli", "gh CLI 当前令牌不可用；可改用已登录的 GitHub 网页会话完成 Release 上传。");
} else {
  check("githubCli", true, "", "GitHub CLI 已登录");
}
if (publicMode) blockers.push("--public 仅用于最终人工门禁，本命令不会执行 GitHub 上传或标签推送。");

const result = {
  schemaVersion: 1,
  phase: "E",
  purpose: "local-release-preparation",
  generatedAt: new Date().toISOString(),
  repository: brand.repositoryUrl,
  releaseTag: config.releaseTag,
  packageVersion: pkg.version,
  artifact: artifact ? { path: path.relative(root, path.resolve(root, artifactPath)), filename: artifact.filename, sha256: artifact.sha256, appAsarSha256: artifact.appAsarSha256, sourceCommit: artifact.sourceCommit } : null,
  checks,
  blockers,
  warnings,
  publicReleaseReady: blockers.length === 0,
  githubWritePerformed: false,
};
await mkdir(outputDir, { recursive: true });
await writeFile(jsonPath, JSON.stringify(result, null, 2) + "\n");
const lines = [
  `# 阶段 E · GitHub 发布准备（${date}）`,
  "",
  "本文件由 `npm run desktop:release-prepare` 生成，只记录本地候选发布门禁；脚本不会登录、上传 GitHub、推送标签或修改 Release。",
  "",
  `- 仓库：${brand.repositoryUrl}`,
  `- Release 标签：${config.releaseTag ?? "未配置"}`,
  `- package.json 版本：${pkg.version}`,
  `- 候选产物：${artifact?.filename ?? "未提供"}`,
  `- publicReleaseReady：**${result.publicReleaseReady ? "true" : "false"}**`,
  "",
  "## 检查结果",
  "",
  ...Object.entries(checks).map(([name, value]) => `- ${value.status === "passed" ? "✅" : "⛔"} ${name}：${value.detail}`),
  "",
  "## 发布动作边界",
  "",
  "只有完成 Developer ID/公证、干净系统与目标平台实机验收、最终 SHA 复核，并得到维护者单独批准后，才可以在 GitHub 创建或更新 Release。当前没有执行任何 GitHub 写入。",
  "",
  "## 阻塞项",
  "",
  ...(blockers.length ? blockers.map((item) => `- ${item}`) : ["- 无"]),
  "",
  "## 提醒",
  "",
  ...(warnings.length ? warnings.map((item) => `- ${item}`) : ["- 无"]),
  "",
  `机器可读证据：[${path.basename(jsonPath)}](${path.basename(jsonPath)})`,
  "",
].join("\n");
await writeFile(markdownPath, lines);
console.log(JSON.stringify({ jsonPath, markdownPath, publicReleaseReady: result.publicReleaseReady, blockers }, null, 2));
if (publicMode || result.publicReleaseReady) process.exit(publicMode ? 1 : 0);
