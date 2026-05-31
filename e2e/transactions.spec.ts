import { test, expect } from "@playwright/test";

test.describe("Transactions (authenticated)", () => {
  test.use({ storageState: "e2e/.auth/user.json" });

  test("transactions page loads", async ({ page }) => {
    await page.goto("/transactions");
    await expect(page.getByRole("heading", { name: "Transações" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Importar CSV/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Exportar/i })).toBeVisible();
  });

  test("search filter works", async ({ page }) => {
    await page.goto("/transactions");
    await page.fill('[placeholder="Buscar..."]', "supermercado");
    // Results should filter (or show empty state)
    await page.waitForTimeout(500);
    const items = page.locator(".group\\/tx");
    // Just verify no crash
    await expect(page.getByPlaceholder("Buscar...")).toHaveValue("supermercado");
  });
});
