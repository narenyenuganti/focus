import { expect, test } from "@playwright/test";
import { resetTestData } from "./test-data";

test.beforeEach(async () => {
  await resetTestData();
});

test("renders the unlock screen", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText(/unlock your tracker/i)).toBeVisible();
});
