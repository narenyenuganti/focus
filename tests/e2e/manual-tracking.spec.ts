import { expect, test, type Page } from "@playwright/test";

async function unlock(page: Page) {
  await page.goto("/login");
  await page.getByLabel(/password/i).fill("tracker");
  await page.getByRole("button", { name: "Unlock" }).click();
  await expect(page.getByText("FOCUS SESSION")).toBeVisible();
}

test("logs sleep, workout, health, and daily reflection entries", async ({ page }) => {
  await unlock(page);

  await page.getByRole("button", { name: "Sleep" }).click();
  await page.getByLabel("Hours").fill("7.5");
  await page.getByRole("button", { name: "Save sleep entry" }).click();
  await expect(page.locator(".panel-list").getByText("7.5h").first()).toBeVisible();

  await page.getByRole("button", { name: "Workouts" }).click();
  await page.getByLabel("Workout type").fill("Run");
  await page.getByLabel("Duration").fill("35");
  await page.getByRole("button", { name: "Save workout" }).click();
  await expect(page.locator(".panel-list").getByText(/Run/).first()).toBeVisible();

  await page.getByRole("button", { name: "Health" }).click();
  await page.getByLabel("Weight").fill("174.5");
  await page.getByLabel("Resting heart rate").fill("52");
  await page.getByRole("button", { name: "Save health metric" }).click();
  await expect(page.locator(".panel-list").getByText(/174.5 lb/).first()).toBeVisible();

  await page.getByLabel("Daily log").click();
  await page.getByLabel("Gratitude (comma separated)").fill("Good run, Calm start");
  await page.getByLabel("Wins (comma separated)").fill("Shipped tracker");
  await page.getByRole("button", { name: "Save daily log" }).click();
  await expect(page.locator(".panel-list").getByText(/gratitude items/).first()).toBeVisible();
});
