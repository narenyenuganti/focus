import { expect, test } from "@playwright/test";
import { resetTestData } from "./test-data";

test.beforeEach(async () => {
  await resetTestData();
});

test("keeps the shell chrome visible while panels open", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel(/password/i).fill("tracker");
  await page.getByRole("button", { name: "Unlock" }).click();
  await page.getByRole("button", { name: "Jump in" }).click();

  await expect(page.locator(".hub-topbar")).toBeVisible();
  await expect(page.locator(".hub-bottombar")).toBeVisible();
  await expect(page.locator(".hub-bottombar .utility-cluster")).toHaveCount(2);
  await expect(page.locator(".hub-bottombar .nav-cluster")).toBeVisible();
  await expect(page.getByRole("button", { name: "Play ambient track" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Next track" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Expand player" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Start", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Sync tracker data", exact: true })).toBeVisible();
  await expect(page.getByText("Classic Pomodoro", { exact: true })).toBeVisible();
  await expect(page.getByText("25 minute block", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Switch focus preset")).toBeVisible();
  await expect(page.getByRole("button", { name: /Classic Pomodoro/i })).toHaveCount(0);
  const miniPlayer = page.locator(".mini-player");
  const bottomBar = page.locator(".hub-bottombar");
  await expect(miniPlayer).toBeVisible();
  await expect(bottomBar).toBeVisible();
  const miniPlayerBox = await miniPlayer.boundingBox();
  const bottomBarBox = await bottomBar.boundingBox();
  expect(miniPlayerBox).not.toBeNull();
  expect(bottomBarBox).not.toBeNull();
  expect(miniPlayerBox!.y + miniPlayerBox!.height).toBeLessThan(bottomBarBox!.y);
  await expect(page.getByRole("button", { name: "View sync history", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "View history", exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Finish Session" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Reset" })).toHaveCount(0);

  await page.getByRole("button", { name: "Statistics", exact: true }).click();
  await expect(page.locator(".hub-panel-column.is-visible")).toBeVisible();
  await expect(page.getByRole("heading", { name: "FOCUS SESSION" })).toBeVisible();
});

test("logs a focus session from the dashboard", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel(/password/i).fill("tracker");
  await page.getByRole("button", { name: "Unlock" }).click();
  await page.getByRole("button", { name: "Jump in" }).click();

  await expect(page.getByRole("heading", { name: "FOCUS SESSION" })).toBeVisible();

  const sessionsMetric = page.locator(".metric-pill").filter({ hasText: "sessions" }).first();
  const startingText = (await sessionsMetric.innerText()).trim();

  await page.getByRole("button", { name: "Start" }).click();
  await page.getByRole("button", { name: "Finish Session" }).click();

  await expect(page.getByText(/sessions logged today/i)).toBeVisible();
  await expect
    .poll(async () => {
      return (await sessionsMetric.innerText()).trim();
    })
    .not.toBe(startingText);

  await page.getByRole("button", { name: "Sync tracker data", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Local sync metadata" })).toBeVisible();
  await expect(page.getByLabel("Sync history").getByText(/nothing to sync\.|sync complete\./i).first()).toBeVisible();

  await page.getByRole("region", { name: "Sync history" }).getByRole("button", { name: "Hide sync history" }).click();
  await page.getByRole("button", { name: "View sync history", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Local sync metadata" })).toBeVisible();

  await page.getByRole("button", { name: "Achievements", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Where the habits compound" })).toBeVisible();
});
