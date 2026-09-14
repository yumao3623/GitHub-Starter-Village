import { packager } from "@electron/packager";
import { cp, mkdir, mkdtemp, readFile, writeFile, stat, readdir } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import path from "node:path";
import config from "../src/config/desktop.json" with { type: "json" };
import distribution from "../src/config/distribution.json" with { type: "json" };
import { artifactName, macosFirstOpenNotice, sha256, verifyArtifact } from "./lib/distribution.mjs";
import { buildInputDigest } from "./lib/build-inputs.mjs";

const target = process.argv[2] ?? process.platform;
const architecture = process.argv[3] ?? (target === "win32" ? "x64" : process.arch);
if (!distribution.targets.some(t => t.platform === target && t.arch === architecture)) throw new Error("目标平台未配置；支持 darwin arm64 / darwin x64 / win32 x64。");
if (target === "darwin" && process.platform !== "darwin") throw new Error("Mac 应用须在 macOS 打包以保留权限与符号链接。");
const root = process.cwd();
const buildInfo = JSON.parse(await readFile(path.join(root,"out/build-info.json"),"utf8").catch(()=>{ throw new Error("请先运行 npm run desktop:build，生成构建指纹。"); }));
if (buildInfo.sourceDigest !== await buildInputDigest(root)) throw new Error("源码已变化，静态导出过期。请先运行 npm run desktop:build。");
const stage = await mkdtemp(path.join(tmpdir(), "gsv-desktop-stage-"));
const pkg = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const checksums = JSON.parse(await readFile(path.join(root, "node_modules/electron/checksums.json"), "utf8"));
await mkdir(path.join(stage, "src/config"), { recursive: true });
// Preserve the historical source asset in Git, but do not distribute an unused
// legacy illustration without a complete provenance record.
await cp(path.join(root, "out"), path.join(stage, "out"), { recursive: true, filter: source => !source.endsWith("starter-village-map.png") });
await cp(path.join(root, "desktop"), path.join(stage, "desktop"), { recursive: true });
await cp(path.join(root, "src/config/desktop.json"), path.join(stage, "src/config/desktop.json"));
await cp(path.join(root, "LICENSE"), path.join(stage, "LICENSE"));
await cp(path.join(root, "docs/assets"), path.join(stage, "asset-notices"), { recursive: true });
await cp(path.join(root, "THIRD_PARTY_NOTICES.md"), path.join(stage, "THIRD_PARTY_NOTICES.md"));
const licenseRoot = path.join(root, "node_modules");
for (const entry of await readdir(licenseRoot, { recursive: true, withFileTypes: true })) {
  if (!entry.isFile() || !/^(licen[cs]e|copying|notice)([.\-_]|$)/i.test(entry.name)) continue;
  const source = path.join(entry.parentPath, entry.name);
  const destination = path.join(stage, "dependency-licenses", path.relative(licenseRoot, source));
  await mkdir(path.dirname(destination), { recursive: true }); await cp(source, destination);
}
await writeFile(path.join(stage, "package.json"), JSON.stringify({ name: pkg.name, version: pkg.version, description: pkg.description, main: "desktop/main.mjs", type: "module", license: "MIT" }, null, 2));
const output = path.join(root, "artifacts/desktop", `${target}-${architecture}-${Date.now()}`);
const packages = await packager({ dir: stage, out: output, platform: target, arch: architecture, name: config.executableName,
  appBundleId: config.appId, appVersion: pkg.version, electronVersion: pkg.devDependencies.electron, asar: true,
  download: { cacheRoot: path.join(root, "artifacts/electron-cache"), checksums },
  prune: false, overwrite: false, ...(target === "darwin" ? { darwinDarkModeSupport: false, icon: path.join(stage, "out/brand/jianghu-manual-icon-v1.icns") } : {}),
  ...(target === "win32" ? { win32metadata: { CompanyName: config.publisherLabel } } : {}),
});
const folder = packages[0];
await cp(path.join(root, "THIRD_PARTY_NOTICES.md"), path.join(folder, "THIRD_PARTY_NOTICES.md"));
await cp(path.join(root, "LICENSE"), path.join(folder, "PROJECT_LICENSE.txt"));
await cp(path.join(root, "docs/assets"), path.join(folder, "asset-notices"), { recursive: true });
await cp(path.join(stage, "dependency-licenses"), path.join(folder, "dependency-licenses"), { recursive: true });
await writeFile(path.join(folder, "START_HERE.txt"), `这是 GitHub 新手村桌面预览版。\n完整解压后打开 .app 或 .exe；Windows 请保留所有同目录文件。\n不需要安装 Node.js、npm 或 Git。\n${target === "darwin" ? `${macosFirstOpenNotice}\nApple 官方说明：https://support.apple.com/zh-cn/102445\n若提示“已损坏”或检测到恶意软件，请停止并联系维护者。\n` : "若有系统安全提示，请停止并联系维护者。\n"}请只从项目 GitHub Release 下载并核对 SHA-256。\n存档位于系统应用数据目录，可在行囊导出；删除应用不会自动删除存档。\n本项目独立开发，非 GitHub 官方产品；不收集凭据。\n`);
if (target === "darwin") {
  // Packager 20 may retain Electron's fallback icon when the source bundle
  // already has an icon plist. Replace that fallback explicitly so Finder and
  // the Dock show the same wuxia manual mark as the running app.
  const appBundle = path.join(folder, `${config.executableName}.app`);
  const resources = path.join(appBundle, "Contents/Resources");
  await cp(path.join(stage, "out/brand/jianghu-manual-icon-v1.icns"), path.join(resources, "jianghu-manual-icon-v1.icns"));
  await execFileSync("/usr/libexec/PlistBuddy", ["-c", "Set :CFBundleIconFile jianghu-manual-icon-v1.icns", path.join(appBundle, "Contents/Info.plist")]);
  await execFileSync("rm", ["-f", path.join(resources, "electron.icns")]);
  // Electron's packager leaves linker signatures on nested binaries. Any files
  // copied above change the final bundle, so re-sign the complete app before
  // archiving; otherwise Gatekeeper reports the downloaded app as damaged.
  execFileSync("codesign", ["--deep", "--force", "--verbose", "--sign", "-", appBundle], { stdio: "inherit" });
  execFileSync("codesign", ["--verify", "--deep", "--strict", appBundle], { stdio: "inherit" });
}
const filename = artifactName(config.executableName, pkg.version, target, architecture);
const archive = path.join(output, filename);
if (process.platform === "darwin" && target === "darwin") execFileSync("ditto", ["-c", "-k", "--sequesterRsrc", "--keepParent", folder, archive]);
else if (process.platform === "win32") execFileSync("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", "Compress-Archive -LiteralPath $env:GSV_ARCHIVE_INPUT -DestinationPath $env:GSV_ARCHIVE_OUTPUT"], { env: { ...process.env, GSV_ARCHIVE_INPUT: folder, GSV_ARCHIVE_OUTPUT: archive } });
else execFileSync("zip", ["-q", "-r", archive, path.basename(folder)], { cwd: output });
const sha = await sha256(archive);
const asar = path.join(folder, target === "darwin" ? `${config.executableName}.app/Contents/Resources/app.asar` : "resources/app.asar");
const manifest = { schemaVersion: 1, filename, bytes: (await stat(archive)).size, sha256: sha, appAsarSha256: await sha256(asar), platform: target, arch: architecture,
  version: pkg.version, electron: pkg.devDependencies.electron, builtAt: new Date().toISOString(), sourceCommit: execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim(),
  sourceDirty: Boolean(execFileSync("git", ["status", "--porcelain"], { encoding: "utf8" }).trim()), sourceDigest:buildInfo.sourceDigest, signing: target === "darwin" ? "adhoc" : "not-performed", notarization: "not-performed", systemAcceptance: "pending", published: false };
const manifestPath = path.join(output, "artifact.json");
await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
await writeFile(path.join(output, "SHA256SUMS.txt"), `${sha}  ${filename}\n`);
await verifyArtifact(manifestPath);
console.log(JSON.stringify({ packages, archive, manifestPath, bytes: manifest.bytes, sha256: sha, signed: false, published: false }, null, 2));
