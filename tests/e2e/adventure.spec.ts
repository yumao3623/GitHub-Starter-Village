import { test, expect, type Page } from "@playwright/test";
import { categories, categoryLabels, dossierTabs, getProjects, verdictLabels } from "../../src/content/minigames/appraisal";

async function enter(page: Page, role = "选择练功小猫阿团") {
  await page.goto("/adventure/");
  await page.getByRole("button", { name: role }).click();
  await page.getByRole("button", { name: "踏入江湖" }).click();
  await page.getByRole("button", { name: "集市鉴宝 可进入" }).click();
}
async function solve(page: Page, variant = 0, keyboard = false) {
  const activate = async (locator: ReturnType<Page["getByRole"]>) => {
    if (keyboard) { await locator.focus(); await page.keyboard.press("Enter"); } else await locator.click();
  };
  for (const project of getProjects(variant)) {
    await activate(page.getByRole("button", { name: `${project.name} 展开卷轴` }));
    for (const category of categories) {
      const fact = project.facts.find(f => f.category === category)!;
      const tab = dossierTabs.find(item => item.id === fact.tab)!;
      await activate(page.getByRole("button", { name: `${tab.english} ${tab.chinese}`, exact: true }));
      await activate(page.getByRole("button", { name: "收集这条证据", exact: true }));
      await activate(page.getByRole("button", { name: `放入${categoryLabels[category]}证据`, exact: true }));
    }
    await activate(page.getByRole("button", { name: verdictLabels[project.verdict], exact: true }));
    await expect(page.locator(".approved-verdict")).toContainText(verdictLabels[project.verdict]);
  }
  const winner = getProjects(variant).find(p => p.verdict === "suitable")!;
  await activate(page.getByRole("button", { name: `${winner.name} 已鉴定` }));
  await activate(page.getByRole("button", { name: `交付「${winner.name}」作为推荐` }));
  await expect(page.getByRole("heading", { name: "眼力初成，迷雾已散。" })).toBeVisible();
}
test.use({ viewport: { width: 1440, height: 940 } });

test("evidence, useful errors, reload persistence, unlock and variant replay", async ({ page }) => {
  const errors: string[] = []; page.on("pageerror", error => errors.push(error.message));
  await enter(page);
  await page.getByRole("button", { name: "Stars 收藏数量", exact: true }).click();
  await page.getByRole("button", { name: "收集这条证据", exact: true }).click();
  await page.getByRole("button", { name: "放入运行环境证据" }).click();
  await expect(page.locator(".task-feedback")).toContainText("Stars 反映关注度");
  await page.screenshot({ path: "artifacts/phase-a/appraisal-feedback.png", fullPage: true });
  await page.reload();
  await expect(page.getByRole("heading", { name: "集市鉴宝", exact: true })).toBeVisible();
  await solve(page);
  await page.getByRole("button", { name: "查看解锁地图" }).click();
  await expect(page.getByRole("button", { name: "飞鸽台 已解锁" })).toBeVisible();
  await page.screenshot({ path: "artifacts/phase-a/unlocked-map.png", fullPage: true });
  await page.reload();
  await expect(page.getByRole("button", { name: "飞鸽台 已解锁" })).toBeVisible();
  await page.getByRole("button", { name: "飞鸽台 已解锁" }).click();
  await page.getByRole("button", { name: "换一组条件再练" }).click();
  await solve(page, 1);
  expect(errors).toEqual([]);
});

test("keyboard-only task, reduced motion and searchable handbook", async ({ page }) => {
  await page.goto("/adventure/");
  await page.getByRole("button", { name: "选择女侠客沈知微" }).focus(); await page.keyboard.press("Enter");
  await page.getByRole("button", { name: "踏入江湖" }).focus(); await page.keyboard.press("Enter");
  await page.getByRole("button", { name: "行囊", exact: true }).focus(); await page.keyboard.press("Enter");
  await page.getByRole("checkbox", { name: "减少动态效果" }).focus(); await page.keyboard.press("Space");
  await expect(page.locator(".adventure")).toHaveAttribute("data-reduced-motion", "true");
  await page.getByRole("button", { name: "武林宝典", exact: true }).focus(); await page.keyboard.press("Enter");
  await expect(page.getByPlaceholder("例如 License、许可证")).toBeFocused();
  await page.keyboard.type("License"); await expect(page.locator(".book-results")).toContainText("许可证");
  await page.keyboard.press("Escape"); await expect(page.getByRole("button", { name: "武林宝典", exact: true })).toBeFocused();
  await page.getByRole("button", { name: "集市鉴宝 可进入" }).focus(); await page.keyboard.press("Enter");
  await solve(page, 0, true);
});

test("demo never reads or changes learner storage", async ({ page }) => {
  await page.goto("/adventure/");
  await page.getByRole("button", { name: "选择男侠客陆行舟" }).click();
  const before = await page.evaluate(() => localStorage.getItem("gsv:adventure:v2"));
  await page.goto("/adventure-demo/");
  await expect(page.getByRole("button", { name: "踏入江湖" })).toBeDisabled();
  await page.getByRole("button", { name: "选择练功小猫阿团" }).click();
  expect(await page.evaluate(() => localStorage.getItem("gsv:adventure:v2"))).toBe(before);
});

test("invalid save stays intact and can be recovered through explicit reset", async ({ page }) => {
  await page.goto("/adventure/");
  await expect(page.locator(".save-status")).toContainText("进度自动保存在本机");
  await expect.poll(() => page.evaluate(() => localStorage.getItem("gsv:adventure:v2"))).not.toBeNull();
  await page.evaluate(() => localStorage.setItem("gsv:adventure:v2", "broken"));
  await page.reload(); await expect(page.locator(".storage-warning")).toContainText("存档");
  expect(await page.evaluate(() => localStorage.getItem("gsv:adventure:v2"))).toBe("broken");
  await page.getByRole("button", { name: "行囊", exact: true }).click();
  await page.getByRole("button", { name: "重置样板", exact: true }).click();
  await page.getByRole("button", { name: "确认重置", exact: true }).click();
  await expect(page.locator(".storage-warning")).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem("gsv:adventure:v2:before-reset"))).toBe("broken");
});

test("1024 desktop layout has readable controls without horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 720 });
  await enter(page);
  await expect(page.getByRole("button", { name: "收集这条证据", exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: "artifacts/phase-a/desktop-1024.png", fullPage: true });
});
