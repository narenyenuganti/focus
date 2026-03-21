import { expect, test } from "@playwright/test";
import { resetTestData } from "./test-data";

test.beforeEach(async () => {
  await resetTestData();
});

test("renders the unlock screen", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText(/unlock your tracker/i)).toBeVisible();

  await page.goto("/login");
  await page.getByLabel(/password/i).fill("tracker");
  await page.getByRole("button", { name: "Unlock" }).click();
  await expect(page.getByRole("heading", { name: "Next Routine" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Check it out" })).toBeVisible();
  await expect(page.locator(".hub-topbar")).toBeHidden();

  await page.getByRole("button", { name: "Jump in" }).click();

  await expect(page.locator(".hub-topbar")).toBeVisible();
  await expect(page.locator(".hub-bottombar")).toBeVisible();
});
