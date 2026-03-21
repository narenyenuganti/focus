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

test("logs sleep, workout, health, and daily reflection entries", async ({ page }) => {
  await unlock(page);

  await page.getByRole("button", { name: "Groups", exact: true }).click();
  await page.getByRole("button", { name: "Sleep" }).click();
  await expect(page.getByRole("button", { name: "Groups", exact: true })).toHaveClass(/is-active/);
  await page.getByLabel("Hours").fill("7.5");
  await page.getByRole("button", { name: "Save sleep entry" }).click();
  await expect(page.locator(".panel-list").getByText("7.5h").first()).toBeVisible();

  await page.getByRole("button", { name: "Groups", exact: true }).click();
  await page.getByRole("button", { name: "Workouts" }).click();
  await expect(page.getByRole("button", { name: "Groups", exact: true })).toHaveClass(/is-active/);
  await page.getByLabel("Workout type").fill("Run");
  await page.getByLabel("Duration").fill("35");
  await page.getByRole("button", { name: "Save workout" }).click();
  await expect(page.locator(".panel-list").getByText(/Run/).first()).toBeVisible();

  await page.getByRole("button", { name: "Groups", exact: true }).click();
  await page.getByRole("button", { name: "Health" }).click();
  await expect(page.getByRole("button", { name: "Groups", exact: true })).toHaveClass(/is-active/);
  await page.getByLabel("Weight").fill("174.5");
  await page.getByLabel("Resting heart rate").fill("52");
  await page.getByRole("button", { name: "Save health metric" }).click();
  await expect(page.locator(".panel-list").getByText(/174.5 lb/).first()).toBeVisible();

  await page.getByRole("button", { name: "Leaderboard", exact: true }).click();
  await page.getByRole("button", { name: "Daily log" }).click();
  await expect(page.getByRole("button", { name: "Leaderboard", exact: true })).toHaveClass(/is-active/);
  await page.getByLabel("Gratitude (comma separated)").fill("Good run, Calm start");
  await page.getByLabel("Wins (comma separated)").fill("Shipped tracker");
  await page.getByRole("button", { name: "Save daily log" }).click();
  await expect(page.locator(".panel-list").getByText(/gratitude items/).first()).toBeVisible();

  await page.getByRole("button", { name: "Settings", exact: true }).click();
  const focusGoalInput = page.getByLabel("Weekly focus goal minutes");
  const firstPreset = page.locator(".panel-list article").first();
  await focusGoalInput.fill("1500");
  await firstPreset.getByLabel("Preset label").fill("Sprint");
  await firstPreset.getByLabel("Minutes", { exact: true }).fill("40");
  await page.getByRole("button", { name: "Save settings" }).click();
  await expect(page.getByText("Settings saved")).toBeVisible();

  await page.goto("/");
  await page.getByRole("button", { name: "Jump in" }).click();
  await expect(page.getByText("1500m weekly goal")).toBeVisible();
  await expect(page.getByRole("button", { name: /Sprint/i })).toBeVisible();
  await expect(page.getByText("40m")).toBeVisible();
});
