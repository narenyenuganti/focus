import { expect, test } from "@playwright/test";

test("renders the unlock screen", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText(/unlock your tracker/i)).toBeVisible();
});
