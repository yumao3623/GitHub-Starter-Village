import { packager } from "@electron/packager";
import { cp, mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import config from "../src/config/desktop.json" with { type: "json" };

const target = process.argv[2] ?? process.platform;
if (!["darwin", "win32"].includes(target)) throw new Error("阶段 A 只配置 darwin 或 win32 打包。");
const architecture = target === "win32" ? "x64" : "arm64";
const root = process.cwd();
const stage = await mkdtemp(path.join(tmpdir(), "gsv-desktop-stage-"));
const pkg = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const checksums = JSON.parse(await readFile(path.join(root, "node_modules/electron/checksums.json"), "utf8"));
await mkdir(path.join(stage, "src/config"), { recursive: true });
await cp(path.join(root, "out"), path.join(stage, "out"), { recursive: true });
await cp(path.join(root, "desktop"), path.join(stage, "desktop"), { recursive: true });
await cp(path.join(root, "src/config/desktop.json"), path.join(stage, "src/config/desktop.json"));
await cp(path.join(root, "LICENSE"), path.join(stage, "LICENSE"));
await cp(path.join(root, "docs/assets"), path.join(stage, "asset-notices"), { recursive: true });
await writeFile(path.join(stage, "package.json"), JSON.stringify({ name: pkg.name, version: pkg.version, description: pkg.description, main: "desktop/main.mjs", type: "module", license: "MIT" }, null, 2));
const output = path.join(root, "artifacts/desktop", `${target}-${architecture}-${Date.now()}`);
const packages = await packager({ dir: stage, out: output, platform: target, arch: architecture, name: config.executableName,
  appBundleId: config.appId, appVersion: pkg.version, electronVersion: pkg.devDependencies.electron, asar: true,
  download: { cacheRoot: path.join(root, "artifacts/electron-cache"), checksums },
  prune: false, overwrite: false, ...(target === "darwin" ? { darwinDarkModeSupport: false } : {}),
});
console.log(JSON.stringify({ packages, stage, signed: false, published: false }, null, 2));
