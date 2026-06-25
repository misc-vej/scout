import { test, expect } from "@playwright/test";

const email = `test+${Date.now()}@scout.dev`;
const password = "Scout12345!";

test("signup creates account and lands on home", async ({ page }) => {
  await page.goto("/auth");
  await page.fill('[type="email"]', email);
  await page.fill('[type="password"]', password);
  await page.click('[type="submit"]');
  await expect(page).toHaveURL("/home", { timeout: 15000 });
  await expect(page.locator("text=beastiary")).toBeVisible();
});

test("signout redirects to /auth", async ({ page }) => {
  await page.goto("/auth");
  await page.fill('[type="email"]', email);
  await page.fill('[type="password"]', password);
  await page.click('[type="submit"]');
  await expect(page).toHaveURL("/home", { timeout: 15000 });
  await page.click('button:has-text("Sign out")');
  await expect(page).toHaveURL("/auth", { timeout: 10000 });
});
