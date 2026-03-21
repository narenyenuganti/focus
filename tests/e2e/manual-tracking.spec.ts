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

test("keeps personal tracking reachable through the single-user tracking surface", async ({
  page,
}) => {
  await unlock(page);

  await page.getByRole("button", { name: "Tracking" }).click();
  await page.getByRole("tab", { name: "Daily log" }).click();
  await page.getByLabel("Mood").fill("9");
  await page.getByLabel("Gratitude (comma separated)").fill("Focused, Calm");
  await page.getByLabel("Wins (comma separated)").fill("Shipped tracker, Kept streak");
  await page.getByRole("button", { name: "Save daily log" }).click();
  await expect(
    page.locator(".panel-list").getByText("Mood 9 • 2 gratitude items").first(),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Workouts" }).click();
  await page.getByLabel("Workout type").fill("Run");
  await page.getByLabel("Duration").fill("35");
  await page.getByLabel("Intensity").selectOption("hard");
  await page.getByRole("button", { name: "Save workout" }).click();
  await expect(page.locator(".panel-list").getByText("Run").first()).toBeVisible();

  await page.getByRole("tab", { name: "Sleep" }).click();
  await page.getByLabel("Hours").fill("7.5");
  await page.getByLabel("Quality").fill("9");
  await page.getByLabel("Bedtime").fill("22:15");
  await page.getByLabel("Wake time").fill("06:45");
  await page.getByRole("button", { name: "Save sleep entry" }).click();
  await expect(page.locator(".panel-list").getByText("7.5h").first()).toBeVisible();
  await page.getByRole("tab", { name: "Health" }).click();
  await page.getByLabel("Weight").fill("174.5");
  await page.getByLabel("Resting heart rate").fill("52");
  await page.getByLabel("Energy").fill("8");
  await page.getByRole("button", { name: "Save health metric" }).click();
  await expect(page.locator(".panel-list").getByText("174.5 lb").first()).toBeVisible();
  await expect(page.locator(".panel-list").getByText("52 bpm").first()).toBeVisible();

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

  await page.goto("/");
  await page.getByRole("button", { name: "Jump in" }).click();
  await expect(page.getByText("1500m weekly goal")).toBeVisible();
  await expect(page.locator(".focus-preset-strip").getByText("Sprint").first()).toBeVisible();
  await expect(page.getByText("40 minute block")).toBeVisible();
});
