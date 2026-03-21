import { expect, test } from "@playwright/test";
import { resetTestData } from "./test-data";

test.beforeEach(async () => {
  await resetTestData();
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

  await page.getByRole("button", { name: "View history" }).click();
  await expect(page.getByRole("heading", { name: "Local sync metadata" })).toBeVisible();

  await page.getByRole("button", { name: "Insights" }).click();
  await expect(page.getByRole("heading", { name: "Where the habits compound" })).toBeVisible();
});
