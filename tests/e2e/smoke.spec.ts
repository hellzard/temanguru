import { expect, test } from "@playwright/test";

test("landing page and login are reachable", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /catat sekali/i })).toBeVisible();
  await page.getByRole("link", { name: /lihat demo dashboard/i }).click();
  await expect(page.getByRole("heading", { name: /masuk ke ruang kerja guru/i })).toBeVisible();
});

test("mobile public pages have no horizontal overflow", async ({ page }) => {
  for (const path of ["/", "/login"]) {
    await page.goto(path);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflow, `${path} should not overflow horizontally`).toBe(false);
  }
});
