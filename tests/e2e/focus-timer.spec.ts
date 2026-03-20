import { expect, test } from "@playwright/test";

test("logs a focus session from the dashboard", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel(/password/i).fill("tracker");
  await page.getByRole("button", { name: "Unlock" }).click();

  await expect(page.getByText("FOCUS SESSION")).toBeVisible();

  const sessionsCard = page.locator(".stat-card").filter({ hasText: "sessions" }).first();
  const startingText = (await sessionsCard.innerText()).trim();

  await page.getByRole("button", { name: "Start" }).click();
  await page.getByRole("button", { name: "Finish Session" }).click();

  await expect(page.getByText(/sessions logged today/i)).toBeVisible();
  await expect
    .poll(async () => {
      return (await sessionsCard.innerText()).trim();
    })
    .not.toBe(startingText);
});
