import { expect, test } from "@playwright/test";

test("a mission answer can be focused and activated with the keyboard", async ({ page }) => {
  await page.goto("/play");
  const answer = page.getByRole("button", { name: /LICENSE/ });
  await answer.focus();
  await expect(answer).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByText("判断正确")).toBeVisible();
});
