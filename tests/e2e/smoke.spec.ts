import { expect, test } from "@playwright/test";

test("landing offers guest and account choices", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /pakai langsung/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /buka ruang kerja lokal/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /masuk atau daftar/i })).toBeVisible();
});

test("workspace can be opened without authentication", async ({ page }) => {
  await page.goto("/workspace");
  await expect(page.getByText(/mode perangkat/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /kelas & murid/i })).toBeVisible();
  await expect(page.getByText("Tersimpan otomatis", { exact: true })).toBeVisible();
});

test("login uses email and password", async ({ page }) => {
  await page.goto("/login?next=/workspace");
  await expect(page.getByRole("heading", { name: /masuk dengan email dan sandi/i })).toBeVisible();
  await expect(page.getByLabel(/^email$/i)).toBeVisible();
  await expect(page.getByLabel(/^kata sandi$/i)).toBeVisible();
  await expect(page.getByRole("link", { name: /lupa kata sandi/i })).toBeVisible();
});

test("health endpoint reports a healthy service", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.ok()).toBe(true);
  await expect(response.json()).resolves.toMatchObject({
    status: "ok",
    service: "temanguru",
  });
});

test("public pages have no horizontal overflow", async ({ page }) => {
  for (const path of ["/", "/workspace", "/login", "/forgot-password", "/privacy", "/terms"]) {
    await page.goto(path);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflow, `${path} should not overflow horizontally`).toBe(false);
  }
});
