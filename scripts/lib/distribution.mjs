import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
export const artifactName = (name, version, platform, arch) => `${name}-${version}-${platform}-${arch}.zip`;
export const macosFirstOpenNotice = "当前 macOS 包使用本机临时签名，尚未经过 Apple 公证。首次打开可能提示“Apple 无法验证”。请先确认下载自本项目 Release 且文件未遭篡改，再按这套官方引导：1）点击警告框右上角“？”打开帮助，进入 Apple 官方提示（地址应为 support.apple.com）；2）返回警告框点“完成”；3）打开苹果菜单 → 系统设置 → 隐私与安全性，在安全性区域找到 GitHubStarterVillage，点“仍要打开”；4）再次确认点“打开”。如果系统要求，输入你自己的 Mac 登录密码；密码只在 macOS 系统设置中输入，不要发给维护者或输入游戏。不要关闭系统安全保护。";
export async function sha256(file) {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(file)) hash.update(chunk);
  return hash.digest("hex");
}
export async function verifyArtifact(manifestPath) {
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  if (manifest.schemaVersion !== 1 || !/^[a-zA-Z0-9._-]+\.zip$/.test(manifest.filename) || !/^[a-f0-9]{64}$/.test(manifest.sha256)) throw new Error("产物清单不合法");
  const file = path.join(path.dirname(manifestPath), manifest.filename);
  if ((await stat(file)).size !== manifest.bytes || await sha256(file) !== manifest.sha256) throw new Error("产物大小或 SHA-256 不一致");
  return manifest;
}
export function downloadSection(brand, config, executableName, version) {
  const repoReady = /^https:\/\/github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(brand.repositoryUrl) && !brand.repositoryUrl.includes("/OWNER/");
  const published = repoReady && config.status === "published" && /^v[\w.-]+$/.test(config.releaseTag ?? "");
  const rows = config.targets.map(target => {
    const name = artifactName(executableName, version, target.platform, target.arch);
    const link = published && target.public ? `[下载 ${target.label}](${brand.repositoryUrl}/releases/download/${config.releaseTag}/${name})` : `${target.label}：**暂未开放公开下载**`;
    return `- ${link}；文件名：\`${name}\``;
  });
  return ["<!-- BEGIN GENERATED DOWNLOADS -->", "## 下载桌面应用", "", ...rows, "", published ? `[版本说明与 SHA-256 校验值](${brand.repositoryUrl}/releases/tag/${config.releaseTag})` : "目前只有内部验收候选包：未完成签名/公证及跨系统验收，未上传 Release。请勿把源码 ZIP 当作应用。", "", "成品包自带运行环境，不需要安装 Node.js、npm 或 Git。下载后完整解压，再打开应用（保留 Windows 解压文件夹内的运行时文件）。", "", ...(config.targets.some(target => target.platform === "darwin" && target.public) ? [macosFirstOpenNotice, ""] : []), "[下载位置、解压和首次打开说明](docs/setup/DOWNLOAD_APP.md) · [源码运行指南](docs/setup/DESKTOP_PREVIEW.md)", "<!-- END GENERATED DOWNLOADS -->"].join("\n");
}
