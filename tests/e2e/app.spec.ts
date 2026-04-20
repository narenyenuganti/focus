import { expect, test } from "@playwright/test";
import { resetTestData } from "./test-data";

test.beforeEach(async () => {
  await resetTestData();
});

test("renders the unlock screen", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Naren");
  await expect(page.getByText(/unlock your tracker/i)).toBeVisible();
  await expect(page.locator('link[rel="icon"]').first()).toHaveAttribute("href", /%F0%9F%91%91/);

  await page.goto("/login");
  await page.getByLabel(/password/i).fill("tracker");
  await page.getByRole("button", { name: "Unlock" }).click();
  await expect(page.getByRole("dialog", { name: "Tracker announcement" })).toHaveCount(0);
  await expect(page.getByText("Next Routine", { exact: true })).toHaveCount(0);
  await expect(page.locator(".announcement-visual")).toHaveCount(0);
  await expect(page.locator(".announcement-card")).toHaveCount(0);

  await expect(page.locator(".topbar")).toBeVisible();
  await expect(page.locator(".nav")).toBeVisible();
  await expect(page.locator(".hub-dots")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Begin", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Sync tracker data", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "View sync history", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Statistics", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Tracking" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Achievements" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Sync", exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Music" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Play ambient track" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Next track" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Expand player" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Insights" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Groups" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Leaderboard" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Sleep" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Health" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Workouts" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Daily log" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Finish Session" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Reset" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Jump in" })).toHaveCount(0);
});

test("unlocks directly into the tracker shell", async ({ page }) => {
  await page.goto("/login");
  await expect(page).toHaveTitle("Naren");
  await page.getByLabel(/password/i).fill("tracker");
  await page.getByRole("button", { name: "Unlock" }).click();

  await expect(page.locator(".topbar")).toBeVisible();
  await expect(page.getByRole("dialog", { name: "Tracker announcement" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Close announcement" })).toHaveCount(0);
});
