import { test, expect } from "@playwright/test";

// These tests require an authenticated session.
// Set PLAYWRIGHT_BASE_URL and run with a pre-seeded test user.
test.describe("Dashboard (authenticated)", () => {
  test.use({ storageState: "e2e/.auth/user.json" });

  test("dashboard loads with key sections", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Score de Saúde Financeira")).toBeVisible();
    await expect(page.getByText("Últimas transações")).toBeVisible();
    await expect(page.getByText("Pontos de Dor Detectados")).toBeVisible();
  });

  test("sidebar navigation works", async ({ page }) => {
    await page.goto("/");
    await page.click('a:has-text("Transações")');
    await expect(page).toHaveURL(/\/transactions/);
    await page.click('a:has-text("Contas")');
    await expect(page).toHaveURL(/\/accounts/);
  });

  test("add transaction dialog opens", async ({ page }) => {
    await page.goto("/");
    await page.click('button:has-text("Adicionar")');
    await expect(page.getByText("Nova transação")).toBeVisible();
  });
});
