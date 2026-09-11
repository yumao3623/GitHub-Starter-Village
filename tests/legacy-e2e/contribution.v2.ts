import { test, expect } from "@playwright/test";
import { winMarket, playChapter, playRegions } from "../helpers/contribution-flow.mjs";
test.use({ viewport: { width: 1440, height: 940 } });
test("Phase C: independent scenes, retries, map locks, restoration and own-Fork guide", async ({ page }) => {
  test.setTimeout(120000);
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto("/adventure/"); await winMarket(page);
  await expect(page.getByRole("button", { name: "12 · 百炼炉", exact: true })).toHaveAttribute("aria-disabled", "true");
  // aria-disabled controls are intentionally focusable; reducer is the final guard.
  await page.getByRole("button", { name: "12 · 百炼炉", exact: true }).focus(); await page.keyboard.press("Enter");
  await expect(page.locator(".chain-scene")).toHaveAttribute("data-chapter", "7");
  for (let chapter=7;chapter<=12;chapter++) {
    if (chapter===9) await page.setViewportSize({ width:1024,height:768 });
    await playChapter(page, chapter, { keyboard: true });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path:`artifacts/phase-c/browser-chapter-${chapter}.png`,fullPage:true });
    if (chapter<12) await page.getByRole("button", { name:`前往第 ${chapter+1} 章`,exact:true }).click();
  }
  await playRegions(page);
  await page.getByRole("button", { name:"返回江湖地图",exact:true }).click();
  await expect(page.locator('[data-node-id="chapter-12"]')).toHaveAttribute("data-node-state","completed");
  await page.screenshot({ path:"artifacts/phase-c/browser-full-map.png",fullPage:true });
  await page.locator('[data-node-id="chapter-12"]').click();
  await page.getByRole("link", { name:"前往自己的 Fork 完成真实实践 →" }).click();
  await expect(page.getByRole("heading", { name:"出师实战，只在自己的 Fork" })).toBeVisible();
  await page.getByRole("checkbox").first().check(); await page.reload(); await expect(page.getByRole("checkbox").first()).toBeChecked();
  await expect(page.getByRole("status")).toContainText("没有验证任何真实 GitHub 操作");
  expect(errors).toEqual([]);
});
