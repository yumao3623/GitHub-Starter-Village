import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
export const artifactName = (name, version, platform, arch) => `${name}-${version}-${platform}-${arch}.zip`;
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
  return ["<!-- BEGIN GENERATED DOWNLOADS -->", "## 下载桌面应用", "", ...rows, "", published ? `[版本说明与 SHA-256 校验值](${brand.repositoryUrl}/releases/tag/${config.releaseTag})` : "目前只有内部验收候选包：未完成签名/公证及跨系统验收，未上传 Release。请勿把源码 ZIP 当作应用。", "", "成品包自带运行环境，不需要安装 Node.js、npm 或 Git。公开后：按电脑类型下载 → 解压 → Mac 打开 .app，Windows 打开解压文件夹内的 .exe（保留同目录文件）。第一次打开若被系统阻止，请停止并联系维护者，不要关闭系统安全保护。", "", "[下载位置、解压和校验图解](docs/setup/DOWNLOAD_APP.md) · [源码运行指南](docs/setup/DESKTOP_PREVIEW.md)", "<!-- END GENERATED DOWNLOADS -->"].join("\n");
}
