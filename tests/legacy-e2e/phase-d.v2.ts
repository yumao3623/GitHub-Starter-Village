import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { demoStops } from "../../src/core/game/demo";
test.use({ viewport: { width: 1440, height: 940 } });
test("recording fast jumps preserve storage, reset and export both PNG sizes", async ({ page }) => {
  const errors: string[] = []; page.on("pageerror", e => errors.push(e.message));
  page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
  await page.goto("/adventure-demo/");
  await page.evaluate(() => localStorage.setItem("gsv:adventure:v2", "untouched-record"));
  for (const stop of demoStops) {
    await page.getByLabel("演示场景", { exact: true }).selectOption(stop.id);
    await expect(page.locator(".storage-warning")).toHaveCount(0);
    if (stop.id.startsWith("chapter-")) await expect(page.locator(".chain-scene")).toHaveAttribute("data-chapter", stop.id.slice(8));
  }
  await expect(page.getByRole("region", { name: "江湖留影分享卡" }).first()).toContainText("6 / 6");
  const card = page.getByRole("region", { name: "江湖留影分享卡" }).first();
  for (const [name, width, height] of [["1080×1920 竖版", 1080, 1920], ["1200×630 横版", 1200, 630]] as const) {
    await card.getByRole("button", { name }).click();
    const downloadEvent = page.waitForEvent("download");
    await card.getByRole("button", { name: "下载江湖分享卡" }).click();
    const download = await downloadEvent;
    const file = await download.path(); expect(file).not.toBeNull();
    const bytes = await readFile(file!); expect(bytes.subarray(1,4).toString()).toBe("PNG");
    expect(bytes.readUInt32BE(16)).toBe(width); expect(bytes.readUInt32BE(20)).toBe(height);
    await download.saveAs(`artifacts/phase-d/share-${width}.png`);
  }
  await page.getByRole("button", { name: "一键重置演示" }).click();
  await expect(page.getByRole("button", { name: "踏入江湖" })).toBeDisabled();
  expect(await page.evaluate(() => localStorage.getItem("gsv:adventure:v2"))).toBe("untouched-record");
  expect(errors).toEqual([]);
});
test("recording layout and reduced motion work with keyboard", async ({ page }) => {
  await page.goto("/adventure-demo/");
  await page.getByLabel("演示场景", { exact: true }).selectOption("chapter-9");
  await page.getByLabel("竖版录屏构图").check();
  await page.getByRole("button", { name: "行囊", exact: true }).click();
  await page.getByLabel("减少动态效果").check();
  await expect(page.locator(".adventure")).toHaveAttribute("data-reduced-motion", "true");
  await expect(page.getByLabel("轻提示音", { exact: false })).not.toBeChecked();
  await page.getByRole("button", { name: "创建并切换 Branch" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".chain-feedback")).not.toBeEmpty();
  await page.screenshot({ path: "artifacts/phase-d/recording-portrait-layout.png", fullPage: true });
});
