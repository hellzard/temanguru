import { expect, test } from "@playwright/test";

test("landing page and demo dashboard are reachable", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /catat sekali/i })).toBeVisible();
  await page.getByRole("link", { name: /lihat demo dashboard/i }).click();
  await expect(page.getByRole("heading", { name: /masuk ke ruang kerja guru/i })).toBeVisible();
});

test("mobile layout has no horizontal overflow", async ({ page }) => {
  await page.goto("/dashboard");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBe(false);
});
