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
}

test("keeps the shell chrome visible while panels open", async ({ page }) => {
  await unlock(page);

  await expect(page.locator(".hub-topbar")).toBeVisible();
  await expect(page.locator(".hub-bottombar")).toBeVisible();
  await expect(page.locator(".hub-bottombar .utility-cluster")).toHaveCount(2);
  await expect(page.locator(".hub-bottombar .nav-cluster")).toBeVisible();
  await expect(page.getByRole("button", { name: "Start", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Sync tracker data", exact: true })).toBeVisible();
  await expect(page.getByText("Classic Pomodoro", { exact: true })).toBeVisible();
  await expect(page.getByText("25 minute block", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Switch focus preset")).toBeVisible();
  await expect(page.locator(".focus-ring__svg")).toBeVisible();
  await expect(page.getByRole("button", { name: "Classic Pomodoro", exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Tracking" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Achievements" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Groups" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Leaderboard" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Play ambient track" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Next track" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Expand player" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Music" })).toHaveCount(0);
  await expect(page.locator(".mini-player")).toHaveCount(0);
  const bottomBar = page.locator(".hub-bottombar");
  const main = page.locator(".hub-main");
  const focusColumn = page.locator(".hub-focus-column");
  await expect(bottomBar).toBeVisible();
  const bottomBarBox = await bottomBar.boundingBox();
  expect(bottomBarBox).not.toBeNull();
  const mainBox = await main.boundingBox();
  const focusColumnBox = await focusColumn.boundingBox();
  expect(mainBox).not.toBeNull();
  expect(focusColumnBox).not.toBeNull();
  expect(
    Math.abs(
      focusColumnBox!.x +
        focusColumnBox!.width / 2 -
        (mainBox!.x + mainBox!.width / 2),
    ),
  ).toBeLessThan(2);
  await expect(page.getByRole("button", { name: "View sync history", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "View history", exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Finish Session" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Reset" })).toHaveCount(0);

  const timer = page.locator(".timer-display");
  const focusRing = page.locator(".focus-ring");
  await page.getByRole("button", { name: "Start" }).click();
  await expect(page.getByRole("button", { name: "Pause" })).toBeVisible();
  const measurements = [];
  for (let index = 0; index < 4; index += 1) {
    await page.waitForTimeout(1100);
    measurements.push(await timer.boundingBox());
  }
  const widths = measurements
    .filter((measurement): measurement is NonNullable<typeof measurement> => measurement !== null)
    .map((measurement) => measurement.width);
  const leftEdges = measurements
    .filter((measurement): measurement is NonNullable<typeof measurement> => measurement !== null)
    .map((measurement) => measurement.x);
  expect(widths.length).toBeGreaterThan(0);
  expect(leftEdges.length).toBeGreaterThan(0);
  expect(Math.max(...widths) - Math.min(...widths)).toBeLessThan(2);
  expect(Math.max(...leftEdges) - Math.min(...leftEdges)).toBeLessThan(2);
  const focusRingBox = await focusRing.boundingBox();
  expect(focusRingBox).not.toBeNull();
  expect(Math.max(...widths)).toBeLessThan(focusRingBox!.width - 32);

  const pausedText = await timer.innerText();
  await page.getByRole("button", { name: "Pause" }).click();
  await expect(page.getByRole("button", { name: "Resume" })).toBeVisible();
  await page.waitForTimeout(1200);
  await expect(timer).toHaveText(pausedText);
  await page.getByRole("button", { name: "Resume" }).click();
  await expect(page.getByRole("button", { name: "Pause" })).toBeVisible();
  await page.waitForTimeout(1200);
  await expect(timer).not.toHaveText(pausedText);

  await page.getByRole("button", { name: "Statistics", exact: true }).click();
  await expect(page.locator(".hub-panel-column.is-visible")).toBeVisible();
  await expect(page.getByRole("heading", { name: "FOCUS SESSION" })).toBeVisible();
});

test("keeps mobile shell spacing clear", async ({ page }) => {
  await unlock(page);
  await page.setViewportSize({ width: 390, height: 844 });

  const focusRing = page.locator(".focus-ring");
  const bottomBar = page.locator(".hub-bottombar");
  await expect(focusRing).toBeVisible();
  await expect(bottomBar).toBeVisible();

  const focusRingBox = await focusRing.boundingBox();
  const bottomBarBox = await bottomBar.boundingBox();
  expect(focusRingBox).not.toBeNull();
  expect(bottomBarBox).not.toBeNull();
  expect(focusRingBox!.y + focusRingBox!.height).toBeLessThan(bottomBarBox!.y);

  await page.getByRole("button", { name: "View sync history", exact: true }).dispatchEvent("click");
  const syncHistory = page.getByRole("region", { name: "Sync history" });
  await expect(syncHistory).toBeVisible();

  const syncHistoryBox = await syncHistory.boundingBox();
  expect(syncHistoryBox).not.toBeNull();
  expect(syncHistoryBox!.x).toBeGreaterThanOrEqual(0);
  expect(syncHistoryBox!.y).toBeGreaterThanOrEqual(0);
  expect(syncHistoryBox!.x + syncHistoryBox!.width).toBeLessThanOrEqual(390);
});

test("keeps tablet shell spacing clear", async ({ page }) => {
  await unlock(page);
  await page.setViewportSize({ width: 768, height: 900 });

  const focusRing = page.locator(".focus-ring");
  const bottomBar = page.locator(".hub-bottombar");
  await expect(focusRing).toBeVisible();
  await expect(bottomBar).toBeVisible();

  const focusRingBox = await focusRing.boundingBox();
  const bottomBarBox = await bottomBar.boundingBox();
  expect(focusRingBox).not.toBeNull();
  expect(bottomBarBox).not.toBeNull();
  expect(focusRingBox!.y + focusRingBox!.height).toBeLessThan(bottomBarBox!.y);

  await page.getByRole("button", { name: "View sync history", exact: true }).click();
  const syncHistory = page.getByRole("region", { name: "Sync history" });
  await expect(syncHistory).toBeVisible();

  const syncHistoryBox = await syncHistory.boundingBox();
  expect(syncHistoryBox).not.toBeNull();
  expect(syncHistoryBox!.x).toBeGreaterThanOrEqual(0);
  expect(syncHistoryBox!.y).toBeGreaterThanOrEqual(0);
  expect(syncHistoryBox!.x + syncHistoryBox!.width).toBeLessThanOrEqual(768);
});

test("keeps mid-range shell spacing clear", async ({ page }) => {
  await unlock(page);
  await page.setViewportSize({ width: 700, height: 900 });

  const focusRing = page.locator(".focus-ring");
  const bottomBar = page.locator(".hub-bottombar");
  await expect(focusRing).toBeVisible();
  await expect(bottomBar).toBeVisible();

  const focusRingBox = await focusRing.boundingBox();
  const bottomBarBox = await bottomBar.boundingBox();
  expect(focusRingBox).not.toBeNull();
  expect(bottomBarBox).not.toBeNull();
  expect(focusRingBox!.y + focusRingBox!.height).toBeLessThan(bottomBarBox!.y);

  await page.getByRole("button", { name: "View sync history", exact: true }).click();
  const syncHistory = page.getByRole("region", { name: "Sync history" });
  await expect(syncHistory).toBeVisible();

  const syncHistoryBox = await syncHistory.boundingBox();
  expect(syncHistoryBox).not.toBeNull();
  expect(syncHistoryBox!.x).toBeGreaterThanOrEqual(0);
  expect(syncHistoryBox!.y).toBeGreaterThanOrEqual(0);
  expect(syncHistoryBox!.x + syncHistoryBox!.width).toBeLessThanOrEqual(700);
});

test("logs a focus session from the dashboard", async ({ page }) => {
  await unlock(page);

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
  await expect(page.getByRole("region", { name: "Sync history" })).toHaveCount(0);
  await page.getByRole("button", { name: "View sync history", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Local sync metadata" })).toBeVisible();
  await expect(page.getByLabel("Sync history").getByText(/nothing to sync\.|sync complete\./i).first()).toBeVisible();

  await expect(page.getByRole("button", { name: "Achievements" })).toHaveCount(0);
});

test("shows short guidance for the selected preset", async ({ page }) => {
  await unlock(page);

  await page.getByLabel("Switch focus preset").selectOption("50");
  const eisenhowerInfo = page.getByRole("button", { name: "About Eisenhower" });
  await expect(eisenhowerInfo).toBeVisible();
  await eisenhowerInfo.click();
  await expect(page.getByRole("tooltip")).toContainText(
    "A longer planning-first block for important work that needs room to think.",
  );

  await page.getByLabel("Switch focus preset").selectOption("90");
  const deepWorkInfo = page.getByRole("button", { name: "About Deep Work" });
  await expect(deepWorkInfo).toBeVisible();
  await deepWorkInfo.click();
  await expect(page.getByRole("tooltip")).toContainText(
    "A long uninterrupted session for cognitively demanding work with one clear objective.",
  );
});
