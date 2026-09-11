import { test, expect, type Page } from "@playwright/test";
import { adventureReducer, initialAdventure, toLegacy, type AdventureState } from "../../src/core/game/adventure";
import { categories, categoryLabels, dossierTabs, getProjects, verdictLabels } from "../../src/content/minigames/appraisal";

function fixture(completed = false) {
  let state = adventureReducer(initialAdventure(), { type: "hydrate", save: null });
  state = adventureReducer(state, { type: "character", id: "atuan" });
  state = adventureReducer(state, { type: "travel", nodeId: "market" });
  if (!completed) return adventureReducer(state, { type: "inspect", project: "cloud", tab: "license" });
  for (const project of getProjects(0)) {
    for (const category of categories) {
      const fact = project.facts.find(item => item.category === category)!;
      state = adventureReducer(state, { type: "inspect", project: project.id, tab: fact.tab });
      state = adventureReducer(state, { type: "collect", factId: fact.id });
      state = adventureReducer(state, { type: "attach", category });
    }
    state = adventureReducer(state, { type: "verdict", verdict: project.verdict });
  }
  return adventureReducer(state, { type: "deliver", project: "reed" });
}
async function seed(page: Page, state: AdventureState, legacy = false) {
  await page.goto("/adventure/");
  await expect(page.getByRole("button", { name: "踏入江湖" })).toBeVisible();
  const raw = JSON.stringify(legacy ? toLegacy(state) : state);
  await page.evaluate(({ raw, legacy }) => {
    localStorage.removeItem("gsv:adventure:v2");
    localStorage.setItem(legacy ? "gsv:adventure:phase-a:v1" : "gsv:adventure:v2", raw);
  }, { raw, legacy });
  await page.reload();
  await expect.poll(() => page.evaluate(() => {
    const raw = localStorage.getItem("gsv:adventure:v2");
    return raw && JSON.parse(raw).version === 2 && !("ready" in JSON.parse(raw));
  })).toBe(true);
  return raw;
}
async function solve(page: Page, variant: number) {
  for (const project of getProjects(variant)) {
    await page.getByRole("button", { name: `${project.name} 展开卷轴` }).click();
    for (const category of categories) {
      const fact = project.facts.find(item => item.category === category)!;
      const tab = dossierTabs.find(item => item.id === fact.tab)!;
      await page.getByRole("button", { name: `${tab.english} ${tab.chinese}`, exact: true }).click();
      await page.getByRole("button", { name: "收集这条证据", exact: true }).click();
      await page.getByRole("button", { name: `放入${categoryLabels[category]}证据`, exact: true }).click();
    }
    await page.getByRole("button", { name: verdictLabels[project.verdict], exact: true }).click();
  }
  const winner = getProjects(variant).find(item => item.verdict === "suitable")!;
  await page.getByRole("button", { name: `${winner.name} 已鉴定` }).click();
  await page.getByRole("button", { name: `交付「${winner.name}」作为推荐` }).click();
  await expect(page.getByRole("heading", { name: "眼力初成，迷雾已散。" })).toBeVisible();
}
test.use({ viewport: { width: 1440, height: 940 } });
test("phase A partial save migrates without modifying original; dialogue and bookmark survive reload", async ({ page }) => {
  const raw = await seed(page, fixture(), true);
  await expect(page.locator(".dossier-title")).toContainText("云栈图");
  await page.getByRole("button", { name: "下一句", exact: true }).click();
  await page.reload();
  await expect(page.getByRole("region", { name: "青砚的对话" })).toContainText("受欢迎不等于适合");
  await page.getByRole("button", { name: "武林宝典", exact: true }).click();
  await page.getByPlaceholder("例如 License、许可证").fill("License");
  await page.getByRole("button", { name: "加入书签", exact: true }).click();
  await page.keyboard.press("Escape");
  await page.reload();
  await page.getByRole("button", { name: "武林宝典", exact: true }).click();
  await page.getByLabel("范围", { exact: true }).selectOption("bookmarks");
  await expect(page.locator(".book-results")).toContainText("License");
  expect(await page.evaluate(() => localStorage.getItem("gsv:adventure:phase-a:v1"))).toBe(raw);
  await page.screenshot({ path: "artifacts/phase-b/handbook.png" });
});
test("locked UI bypass and URL do not unlock; explore is isolated and returns to exact mainline state", async ({ page }) => {
  await seed(page, fixture());
  await page.getByRole("button", { name: "江湖地图", exact: true }).click();
  await page.locator('[data-node-id="pavilion"]').evaluate((node: HTMLElement) => node.click());
  await expect(page.getByRole("heading", { name: "云溪谷" })).toBeVisible();
  await page.goto("/adventure/?node=pavilion");
  await expect(page.locator('[data-node-id="pavilion"]')).toHaveAttribute("data-node-state", "locked");
  const before = await page.evaluate(() => localStorage.getItem("gsv:adventure:v2"));
  await page.getByRole("button", { name: "行囊", exact: true }).click();
  await page.getByRole("button", { name: "进入自由探索" }).click();
  await page.getByRole("button", { name: "选择男侠客陆行舟" }).click();
  await page.getByRole("button", { name: "踏入江湖" }).click();
  await page.locator('[data-node-id="pavilion"]').click();
  await expect(page.getByRole("heading", { name: "下一封信，写给江湖。" })).toBeVisible();
  await page.getByRole("button", { name: "返回正式历练" }).click();
  await expect(page.locator('[data-node-id="pavilion"]')).toHaveAttribute("data-node-state", "locked");
  expect(await page.evaluate(() => localStorage.getItem("gsv:adventure:v2"))).toBe(before);
});
test("assessment uses operation receipts, keeps unlock on replay and has no browser errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  await seed(page, fixture(true));
  await page.getByRole("button", { name: "开始迁移评估" }).click();
  await expect(page.locator(".session-banner")).toContainText("独立操作中");
  await solve(page, 1);
  await page.getByRole("button", { name: "换一组条件再练" }).click();
  await page.getByRole("button", { name: "江湖地图", exact: true }).click();
  await page.reload();
  await expect(page.locator('[data-node-id="pavilion"]')).toHaveAttribute("data-node-state", "available");
  await page.getByRole("button", { name: "武林宝典", exact: true }).click();
  await page.getByPlaceholder("例如 License、许可证").fill("License");
  await expect(page.locator(".book-results")).toContainText("迁移评估已通过");
  expect(errors).toEqual([]);
});
test("invalid import preserves progress and original future version is not overwritten", async ({ page }) => {
  await seed(page, fixture());
  const before = await page.evaluate(() => localStorage.getItem("gsv:adventure:v2"));
  await page.getByRole("button", { name: "行囊", exact: true }).click();
  await page.getByLabel("选择存档文件").setInputFiles({ name: "invalid.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify({ version: 99 })) });
  await expect(page.locator(".adventure-settings")).toContainText("现有进度没有改变");
  expect(await page.evaluate(() => localStorage.getItem("gsv:adventure:v2"))).toBe(before);
  await page.evaluate(() => localStorage.setItem("gsv:adventure:v2", '{"version":99}'));
  await page.reload();
  await expect(page.locator(".storage-warning")).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("gsv:adventure:v2"))).toBe('{"version":99}');
});
