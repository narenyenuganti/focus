import { expect, test, type Page } from "@playwright/test";
import { resetTestData } from "./test-data";

test.beforeEach(async () => {
  await resetTestData();
});

async function unlock(page: Page) {
  await page.goto("/login");
  await page.getByLabel(/password/i).fill("tracker");
  await page.getByRole("button", { name: "Unlock" }).click();
  await page.getByRole("button", { name: "Jump in" }).click();
  await expect(page.getByRole("heading", { name: "FOCUS SESSION" })).toBeVisible();
}

test("keeps personal tracking reachable through the grouped surfaces", async ({
  page,
}) => {
  await unlock(page);

  await page.getByRole("button", { name: "Groups" }).click();
  await page.getByRole("tab", { name: "Daily log" }).click();
  await page.getByRole("button", { name: "Save daily log" }).click();
  await page.getByRole("tab", { name: "Workouts" }).click();
  await page.getByRole("button", { name: "Save workout" }).click();

  await page.getByRole("button", { name: "Leaderboard" }).click();
  await page.getByRole("tab", { name: "Sleep" }).click();
  await page.getByRole("button", { name: "Save sleep entry" }).click();
  await page.getByRole("tab", { name: "Health" }).click();
  await page.getByRole("button", { name: "Save health metric" }).click();

  await page.getByRole("button", { name: "Achievements" }).click();
  await expect(page.getByRole("heading", { name: /compound|achievement/i })).toBeVisible();

  await page.getByRole("button", { name: "Settings", exact: true }).click();
  const focusGoalInput = page.getByLabel("Weekly focus goal minutes");
  const firstPreset = page.locator(".panel-list article").first();
  await focusGoalInput.fill("1500");
  await firstPreset.getByLabel("Preset label").fill("Sprint");
  await firstPreset.getByLabel("Minutes", { exact: true }).fill("40");
  await page.getByRole("button", { name: "Save settings" }).click();
  await expect(page.getByText("Settings saved")).toBeVisible();
});
