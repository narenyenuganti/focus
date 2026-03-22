import { expect, test, type Page } from "@playwright/test";
import { resetTestData } from "./test-data";

test.beforeEach(async () => {
  await resetTestData();
});

async function unlock(page: Page) {
  await page.goto("/login");
  await page.getByLabel(/password/i).fill("tracker");
  await page.getByRole("button", { name: "Unlock" }).click();
  await expect(page.getByText("FOCUS SESSION", { exact: true })).toHaveCount(1);
}

test("keeps the trimmed shell focused on statistics and settings", async ({
  page,
}) => {
  await unlock(page);

  await expect(page.getByRole("button", { name: "Tracking" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Achievements" })).toHaveCount(0);
  await page.getByRole("button", { name: "Statistics" }).click();
  await expect(page.getByText("FOCUS SESSION", { exact: true })).toHaveCount(1);
  await expect(page.locator(".stat-card")).toHaveCount(2);
  await expect(page.getByText("Watch your progress grow")).toHaveCount(0);
  await expect(page.locator(".heatmap-panel")).toHaveCount(0);
  await expect(page.locator(".stat-card").filter({ hasText: "sleep" })).toHaveCount(0);
  await expect(page.locator(".stat-card").filter({ hasText: "workouts" })).toHaveCount(0);

  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await expect(page.getByText("Sleep goal")).toHaveCount(0);
  await expect(page.getByText("Sleep goal hours")).toHaveCount(0);
  await expect(page.getByText("Weekly workout goal minutes")).toHaveCount(0);
  const focusGoalInput = page.getByLabel("Weekly focus goal minutes");
  const firstPreset = page.locator(".panel-list article").first();
  await focusGoalInput.fill("1500");
  await firstPreset.getByLabel("Preset label").fill("Sprint");
  await firstPreset.getByLabel("Minutes", { exact: true }).fill("40");
  await page.getByRole("button", { name: "Save settings" }).click();
  await expect(page.getByText("Settings saved")).toBeVisible();

  await page.goto("/");
  await expect(page.getByText("1500m weekly goal")).toBeVisible();
  await expect(page.locator(".focus-preset-strip").getByText("Sprint").first()).toBeVisible();
  await expect(page.getByText("40 minute block")).toBeVisible();
});
