import { expect, test } from "@playwright/test";

const storedTheme = {
  version: 1,
  mode: "dark",
  kind: "gradient",
  presetId: "aurora",
  customAccent: "#22c55e",
  customGradient: { from: "#0ea5e9", to: "#8b5cf6", angle: 120 },
  wallpaper: { enabled: false, fit: "cover", position: "center", repeat: false, overlay: 68, blur: 0, brightness: 92 },
  glass: 8,
};

test("theme is restored before and after reload", async ({ page }) => {
  await page.addInitScript((theme) => {
    localStorage.setItem("temanguru:theme:v1", JSON.stringify(theme));
  }, storedTheme);

  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme-mode", "dark");
  await expect(page.locator("html")).toHaveAttribute("data-theme-kind", "gradient");

  const primary = await page.locator("html").evaluate((element) =>
    getComputedStyle(element).getPropertyValue("--tg-primary").trim(),
  );
  expect(primary).toBe("#22c55e");

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme-mode", "dark");
});
