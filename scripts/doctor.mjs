import { execFileSync } from "node:child_process";

const [major, minor] = process.versions.node.split(".").map(Number);
console.log(`Node.js ${process.version}`);
if (major < 22 || (major === 22 && minor < 13)) {
  console.error("需要 Node.js 22.13 或更高版本。请从 https://nodejs.org 下载 LTS 版本。");
  process.exit(1);
}
try {
  console.log(`npm ${execFileSync("npm", ["--version"], { encoding: "utf8" }).trim()}`);
  console.log("环境检查通过。下一步执行 npm install，再执行 npm run dev。");
} catch {
  console.error("没有找到 npm。请重新安装 Node.js LTS。");
  process.exit(1);
}
