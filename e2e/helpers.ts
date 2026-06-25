import { Page } from "@playwright/test";

export async function signIn(page: Page, email: string, password: string) {
  await page.goto("/auth");
  await page.fill('[type="email"]', email);
  await page.fill('[type="password"]', password);
  await page.click('[type="submit"]');
  await page.waitForURL("/home", { timeout: 15000 });
}
