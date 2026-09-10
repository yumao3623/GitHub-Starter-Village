import { vocabulary } from "../src/content/vocabulary/zh-CN";

const allowedHosts = new Set(["docs.github.com", "git-scm.com", "nodejs.org", "docs.npmjs.com"]);
const urls = [...new Set(vocabulary.map((item) => item.sourceUrl))];
const errors: string[] = [];

for (const url of urls) {
  const parsed = new URL(url);
  if (!allowedHosts.has(parsed.hostname)) errors.push(`${url}: 不是官方来源域名`);
  if (process.env.CONTENT_SOURCE_LIVE === "1") {
    try {
      const response = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(15_000) });
      if (!response.ok) errors.push(`${url}: HTTP ${response.status}`);
    } catch (error) {
      errors.push(`${url}: ${error instanceof Error ? error.message : "连接失败"}`);
    }
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`来源校验通过：${urls.length} 个唯一官方链接${process.env.CONTENT_SOURCE_LIVE === "1" ? "，已在线访问" : "，已检查域名与 URL；设置 CONTENT_SOURCE_LIVE=1 可在线访问"}。`);
