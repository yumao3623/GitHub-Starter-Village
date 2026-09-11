import { expect, test } from "@playwright/test";
import { missions } from "../../src/content/missions/zh-CN";
import { graduationQuiz } from "../../src/content/quizzes/zh-CN/graduation";

test("home, glossary and game task are usable", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /先读路标/ })).toBeVisible();
  await page.getByRole("link", { name: /Fork \/ Clone 指南/ }).first().click();
  await expect(page).toHaveURL(/\/start/);
  await page.goto("/glossary");
  await page.getByPlaceholder(/搜索 Pull Request/).fill("Pull Request");
  await expect(page.getByRole("heading", { name: "Pull Request", exact: true })).toBeVisible();
  await page.goto("/play");
  await expect(page.getByRole("heading", { name: "仓库地图" })).toBeVisible();
  await page.getByRole("button", { name: /LICENSE/ }).click();
  await expect(page.getByText("判断正确")).toBeVisible();
});

test("all fourteen chapters can be completed without an upstream action", async ({ page }) => {
  await page.goto("/play");
  for (const mission of missions) {
    await page.getByRole("button", { name: new RegExp(`^${mission.chapter}\\.`) }).click();
    const task = mission.tasks[0];
    await page.locator("section").getByRole("button", { name: task.options[task.correctIndex], exact: true }).click();
    await expect(page.getByText("判断正确")).toBeVisible();
  }
  await expect(page.getByText("14/14 章完成")).toBeVisible();
  await expect(page.getByText("P0 25/25")).toBeVisible();
  await expect(page.getByRole("button", { name: /进入毕业任务/ })).toBeVisible();
});

test("demo reset does not read or overwrite ordinary progress", async ({ page }) => {
  await page.goto("/play");
  await page.evaluate(() => {
    localStorage.setItem("gsv:progress:v1", JSON.stringify({
      version: 1,
      assistMode: "challenge",
      currentMissionId: "chapter-9",
      completedMissionIds: ["sentinel"],
      masteredP0TermIds: [],
      taskAttempts: {},
      startedAt: null,
      elapsedSeconds: 0,
    }));
  });
  await page.goto("/demo");
  await page.getByRole("button", { name: "准备演示角色" }).click();
  await expect(page.getByRole("combobox", { name: "自由探索章节" })).toBeVisible();
  const stored = await page.evaluate(() => localStorage.getItem("gsv:progress:v1"));
  expect(JSON.parse(stored ?? "{}").completedMissionIds).toEqual(["sentinel"]);
});

test("graduation test, self-check and local share card form a complete capstone", async ({ page }) => {
  await page.goto("/capstone");
  for (const question of graduationQuiz) {
    await page.getByRole("button", { name: question.options[question.correctIndex], exact: true }).click();
    await page.getByRole("button", { name: "下一题" }).click();
  }
  await expect(page.getByRole("heading", { name: "P0 结业测试通过" })).toBeVisible();
  for (const checkbox of await page.getByRole("checkbox").all()) await checkbox.check();
  await expect(page.getByRole("heading", { name: "你已完成自我检查" })).toBeVisible();
  await page.getByRole("button", { name: "1200×630" }).click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "下载 PNG" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("github-starter-village-landscape.png");
});
