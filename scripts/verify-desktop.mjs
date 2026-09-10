import { _electron as electron } from "playwright";
import { createRequire } from "node:module";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import assert from "node:assert/strict";

const require = createRequire(import.meta.url);
const appFlag = process.argv.indexOf("--app");
if (appFlag !== -1 && !process.argv[appFlag + 1]) throw new Error("--app requires the packaged executable path");
const packagedExecutable = appFlag !== -1 ? path.resolve(process.argv[appFlag + 1]) : process.env.GSV_DESKTOP_EXECUTABLE;
const executablePath = packagedExecutable || require("electron");
const userData = await mkdtemp(path.join(tmpdir(), "gsv-electron-test-"));
const screenshots = path.resolve(process.env.GSV_VERIFICATION_DIR || "artifacts/phase-a");
await mkdir(screenshots, { recursive: true });
const reportPath = path.join(screenshots, packagedExecutable ? "desktop-packaged-verification.json" : "desktop-verification.json");
const options = { executablePath, args: packagedExecutable ? [] : [path.resolve("desktop/main.mjs")],
  // A packaged launch also runs outside the checkout: no relative fallback to src/ or out/.
  cwd: packagedExecutable ? userData : process.cwd(),
  env: { ...process.env, NODE_ENV: "test", GSV_TEST_USER_DATA: userData, PATH: "/usr/bin:/bin" }, timeout: 30000 };
let app;
const errors = [];
const consoleErrors = [];
const failedRequests = [];
const completedHeadCancellations = [];
const badResponses = [];
const flightResponses = [];
function observe(page) {
  const statuses = new WeakMap();
  page.on("response", response => {
    statuses.set(response.request(), response.status());
    if (response.status() >= 400) badResponses.push({ url: response.url(), status: response.status() });
    if (response.status() === 200 && new URL(response.url()).pathname.endsWith(".txt")) flightResponses.push(response.url());
  });
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => { if (message.type() === "error") consoleErrors.push(message.text()); });
  page.on("requestfailed", request => {
    const record = { url: request.url(), method: request.method(), status: statuses.get(request), error: request.failure()?.errorText, resourceType: request.resourceType(), navigation: request.isNavigationRequest() };
    // Chromium can cancel an already-answered HEAD fetch after its consumer uses
    // the headers. Keep this diagnostic; never suppress a missing/non-200 HEAD,
    // navigation, GET failure, or any request carrying an actual payload.
    if (record.method === "HEAD" && record.status === 200 && record.error === "net::ERR_ABORTED" && record.resourceType === "fetch" && !record.navigation && record.url.startsWith("village://app/")) completedHeadCancellations.push(record);
    else failedRequests.push(record);
  });
}
try {
  app = await electron.launch(options);
  const page = await app.firstWindow();
  observe(page);
  await page.getByRole("button", { name: "选择女侠客沈知微" }).waitFor();
  assert.equal(await page.evaluate(() => location.protocol), "village:");
  assert.equal(await page.evaluate(() => typeof window.require), "undefined");
  const preferences = await app.evaluate(({ BrowserWindow }) => {
    const p = BrowserWindow.getAllWindows()[0].webContents.getLastWebPreferences();
    return { sandbox: p.sandbox, contextIsolation: p.contextIsolation, nodeIntegration: p.nodeIntegration };
  });
  assert.deepEqual(preferences, { sandbox: true, contextIsolation: true, nodeIntegration: false });
  const probes = await page.evaluate(async () => {
    const results = [];
    for (const method of ["GET", "HEAD"]) {
      try { const response = await fetch("/start/", { method }); results.push({ method, status: response.status, textLength: (await response.text()).length }); }
      catch (error) { results.push({ method, error: String(error) }); }
    }
    return results;
  });
  console.log("Private protocol probes:", probes);
  assert.ok(probes.every(result => result.status === 200), "Private protocol GET and HEAD must both succeed");
  await page.screenshot({ path: path.join(screenshots, "desktop-character-selection.png"), fullPage: true });
  // Disallow network at the browser context as well as the desktop shell's request policy.
  await app.context().setOffline(true);
  await page.getByRole("button", { name: "选择女侠客沈知微" }).click();
  await page.getByRole("button", { name: "踏入江湖" }).click();
  await page.screenshot({ path: path.join(screenshots, "desktop-locked-map.png"), fullPage: true });
  await page.getByRole("button", { name: "集市鉴宝 可进入" }).click();
  await page.reload();
  await page.getByRole("heading", { name: "集市鉴宝", exact: true }).waitFor();
  for (const [project, verdict] of [["芦岸图", "适合当前委托"], ["云栈图", "不符合当前条件"], ["旧雾图", "信息不足，需核实"]]) {
    await page.getByRole("button", { name: `${project} 展开卷轴` }).click();
    for (const [tab, category] of [["Requirements 运行要求", "运行环境"], ["License 许可证", "使用条件"], ["Releases 发布版本", "维护线索"]]) {
      await page.getByRole("button", { name: tab, exact: true }).click();
      await page.getByRole("button", { name: "收集这条证据", exact: true }).click();
      await page.getByRole("button", { name: `放入${category}证据` }).click();
    }
    await page.getByRole("button", { name: verdict, exact: true }).click();
  }
  await page.getByRole("button", { name: "芦岸图 已鉴定" }).click();
  await page.getByRole("button", { name: "交付「芦岸图」作为推荐" }).click();
  await page.getByRole("heading", { name: "眼力初成，迷雾已散。" }).waitFor();
  await page.screenshot({ path: path.join(screenshots, "desktop-completed.png"), fullPage: true });
  await app.close(); app = await electron.launch(options);
  const restored = await app.firstWindow();
  observe(restored);
  await app.context().setOffline(true);
  await restored.getByRole("heading", { name: "眼力初成，迷雾已散。" }).waitFor();
  // Verify non-game static route + return navigation under the private protocol.
  await restored.getByRole("link", { name: "准备好真实实践？查看 Fork / Clone 指南 →" }).click();
  await restored.waitForURL("**/start/");
  assert.ok((await restored.locator("body").innerText()).includes("Fork"));
  await restored.getByRole("link", { name: "武侠样板", exact: true }).click();
  await restored.getByRole("heading", { name: "眼力初成，迷雾已散。" }).waitFor();
  assert.ok(flightResponses.length > 0, "Static client navigation must load local RSC payloads");
  assert.deepEqual(badResponses, []);
  assert.deepEqual(errors, []);
  assert.deepEqual(consoleErrors, []);
  assert.deepEqual(failedRequests, []);
  const report = { passed: true, platform: process.platform, arch: process.arch, packaged: Boolean(packagedExecutable), executablePath, privateProtocol: true,
    rendererIsolated: true, offlineTaskComplete: true, restartRestored: true, staticRoutes: true, nodeAbsentFromPath: true,
    errors, consoleErrors, failedRequests, badResponses, completedHeadCancellations, flightResponseCount: flightResponses.length, userData, verifiedAt: new Date().toISOString(), note: "本机验证，不等于干净系统安装、签名公证或 Windows 实机验证。已收到 200 响应的 HEAD 取消单独记录，不计作资源加载失败。" };
  await writeFile(reportPath, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  if (app) {
    const windows = app.windows();
    if (windows[0]) { await windows[0].screenshot({ path: path.join(screenshots, "desktop-error.png") }).catch(() => {}); console.error(await windows[0].locator("body").innerText().catch(() => "No page body")); }
  }
  console.error({ errors, consoleErrors, failedRequests, completedHeadCancellations, badResponses });
  await writeFile(reportPath, JSON.stringify({ passed: false, platform: process.platform, arch: process.arch,
    packaged: Boolean(packagedExecutable), executablePath, error: String(error), errors, consoleErrors, failedRequests, completedHeadCancellations, badResponses,
    verifiedAt: new Date().toISOString(), note: "失败诊断，不得当作桌面验收通过。" }, null, 2));
  throw error;
} finally { if (app) await app.close().catch(() => {}); }
