import { _electron as electron } from "playwright";
import { createRequire } from "node:module";
import { mkdtemp, mkdir, writeFile, readFile } from "node:fs/promises";
import { tmpdir, release, cpus, totalmem } from "node:os";
import path from "node:path";
import assert from "node:assert/strict";
import { playChapter, playRegions } from "../tests/helpers/contribution-flow.mjs";

const require = createRequire(import.meta.url);
const appFlag = process.argv.indexOf("--app");
if (appFlag !== -1 && !process.argv[appFlag + 1]) throw new Error("--app requires the packaged executable path");
const packagedExecutable = appFlag !== -1 ? path.resolve(process.argv[appFlag + 1]) : process.env.GSV_DESKTOP_EXECUTABLE;
const executablePath = packagedExecutable || require("electron");
const verifyChain = process.argv.includes("--chain");
const phaseD = process.argv.includes("--phase-d");
const startedAt = performance.now();
const userData = await mkdtemp(path.join(tmpdir(), "gsv-electron-test-"));
const screenshots = path.resolve(process.env.GSV_VERIFICATION_DIR || (phaseD ? "artifacts/phase-d" : "artifacts/phase-a"));
await mkdir(screenshots, { recursive: true });
const reportPath = path.join(screenshots, phaseD ? "desktop-phase-d-verification.json" : verifyChain ? "desktop-phase-c-verification.json" : packagedExecutable ? "desktop-packaged-verification.json" : "desktop-verification.json");
const options = { executablePath, args: packagedExecutable ? [] : [path.resolve("desktop/main.mjs")],
  // A packaged launch also runs outside the checkout: no relative fallback to src/ or out/.
  cwd: packagedExecutable ? userData : process.cwd(),
  env: { ...process.env, NODE_ENV: "test", GSV_TEST_USER_DATA: userData, PATH: process.platform === "win32" ? `${process.env.SystemRoot}\\System32;${process.env.SystemRoot}` : "/usr/bin:/bin" }, timeout: 30000 };
let startupMs = 0;
const shareExports = [];
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
  startupMs = Math.round(performance.now() - startedAt);
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
  if (verifyChain) {
    let chainPage = restored;
    await chainPage.getByRole("button", { name: "查看解锁地图" }).click();
    await chainPage.locator('[data-node-id="chapter-7"]').click();
    for (let chapter = 7; chapter <= 12; chapter++) {
      await playChapter(chainPage, chapter);
      await chainPage.screenshot({ path: path.join(screenshots, `desktop-chapter-${chapter}.png`), fullPage: true });
      if (chapter === 9) {
        await app.close(); app = await electron.launch(options);
        chainPage = await app.firstWindow(); observe(chainPage); await app.context().setOffline(true);
        await chainPage.locator('.chain-success').filter({ hasText: '第 9 章交付完成' }).waitFor();
      }
      if (chapter < 12) await chainPage.getByRole("button", { name: `前往第 ${chapter + 1} 章`, exact: true }).click();
    }
    await playRegions(chainPage);
    await chainPage.getByRole("button", { name:"返回江湖地图", exact:true }).click();
    await chainPage.screenshot({ path:path.join(screenshots,"desktop-full-map.png"),fullPage:true });
    await chainPage.locator('[data-node-id="chapter-12"]').click();
    await app.close(); app = await electron.launch(options);
    chainPage = await app.firstWindow(); observe(chainPage); await app.context().setOffline(true);
    await chainPage.locator('.chain-success').filter({ hasText: '第 12 章交付完成' }).waitFor();
    await chainPage.getByRole("link", { name: "前往自己的 Fork 完成真实实践 →" }).click();
    await chainPage.getByRole("heading", { name: "出师实战，只在自己的 Fork" }).waitFor();
    await chainPage.getByRole("checkbox").first().check(); await chainPage.reload();
    assert.equal(await chainPage.getByRole("checkbox").first().isChecked(), true);
    await chainPage.screenshot({ path: path.join(screenshots, 'desktop-field-practice.png'), fullPage: true });
  }
  if (phaseD) {
    const current = await app.firstWindow();
    await current.goto("village://app/adventure/");
    await current.getByRole("button", { name: "江湖留影", exact: true }).click();
    const card = current.getByRole("region", { name: "江湖留影分享卡" }).first();
    for (const [label, width, height] of [["1080×1920 竖版",1080,1920],["1200×630 横版",1200,630]]) {
      await card.getByRole("button", { name: label }).click();
      const saved = path.join(screenshots, `desktop-share-${width}.png`);
      await app.evaluate(({ session }, destination) => {
        globalThis.__gsvDownloadResult = null;
        session.defaultSession.once("will-download", (_event, item) => {
          item.setSavePath(destination);
          item.once("done", (_event, state) => { globalThis.__gsvDownloadResult = { state, receivedBytes:item.getReceivedBytes(), path:item.getSavePath() }; });
        });
      }, saved);
      await card.getByRole("button", { name: "下载江湖分享卡" }).click();
      let result;
      for (let attempt=0;attempt<100;attempt++) {
        result = await app.evaluate(() => globalThis.__gsvDownloadResult);
        if (result) break;
        await new Promise(resolve=>setTimeout(resolve,100));
      }
      assert.equal(result?.state,"completed","Electron native download must finish");
      assert.equal(result.path,saved);
      const png = await readFile(saved); assert.equal(png.readUInt32BE(16),width); assert.equal(png.readUInt32BE(20),height);
      shareExports.push({ width,height });
    }
    const before = await current.evaluate(() => localStorage.getItem("gsv:adventure:v2"));
    await current.goto("village://app/adventure-demo/");
    await current.getByLabel("演示场景", { exact:true }).selectOption("chapter-9");
    await current.locator('[data-chapter="9"]').waitFor();
    await current.getByLabel("演示场景", { exact:true }).selectOption("ending");
    assert.ok((await current.getByRole("region", {name:"江湖留影分享卡"}).first().innerText()).includes("6 / 6"));
    await current.getByRole("button", { name:"一键重置演示" }).click();
    assert.equal(await current.getByRole("button", { name:"踏入江湖" }).isDisabled(),true);
    assert.equal(await current.evaluate(() => localStorage.getItem("gsv:adventure:v2")),before);
    await current.screenshot({path:path.join(screenshots,"desktop-demo.png"),fullPage:true});
  }
  assert.deepEqual(badResponses, []);
  assert.deepEqual(errors, []);
  assert.deepEqual(consoleErrors, []);
  assert.deepEqual(failedRequests, []);
  const memorySample = await app.evaluate(({ app }) => app.getAppMetrics().map(item => ({type:item.type, workingSetKB:item.memory.workingSetSize, peakWorkingSetKB:item.memory.peakWorkingSetSize})));
  const report = { passed: true, platform: process.platform, arch: process.arch, osRelease:release(), cpu:cpus()[0]?.model, totalMemoryBytes:totalmem(), startupMs, memorySample, shareExports, demoIsolated:phaseD, packaged: Boolean(packagedExecutable), executablePath, privateProtocol: true,
    rendererIsolated: true, offlineTaskComplete: true, restartRestored: true, staticRoutes: true, nodeAbsentFromPath: true,
    contributionChapters: verifyChain ? [7,8,9,10,11,12] : [], contributionRestartRestored: verifyChain, fieldPracticeSelfCheck: verifyChain,
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
