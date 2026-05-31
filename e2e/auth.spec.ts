import { test, expect } from "@playwright/test";

test.describe("Auth", () => {
  test("login page renders correctly", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText("Another Finance App")).toBeVisible();
    await expect(page.getByRole("button", { name: /Google/i })).toBeVisible();
    await expect(page.getByPlaceholder("seu@email.com")).toBeVisible();
  });

  test("unauthenticated → redirect to login", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login/);
  });

  test("magic link form submits", async ({ page }) => {
    await page.goto("/login");
    await page.fill('[type="email"]', "test@example.com");
    await page.click('button:has-text("Enviar link")');
    await expect(page.getByText("Verifique seu email")).toBeVisible({ timeout: 8000 });
  });
});
