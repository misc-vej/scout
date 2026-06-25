import { test, expect } from "@playwright/test";

for (const path of ["/home", "/beastiary", "/discover", "/profile"]) {
  test(`unauthenticated ${path} redirects to /auth`, async ({ page }) => {
    await page.goto(path);
    await expect(page).toHaveURL(/\/auth/, { timeout: 10000 });
  });
}
