import { test, expect } from "@playwright/test";
import type { Browser } from "@playwright/test";
import { signIn } from "./helpers";

test.describe("cross-device auth (AUTH-03)", () => {
  test("same account accessible from two browser contexts", async ({ browser }: { browser: Browser }) => {
    const email = `cross+${Date.now()}@scout.dev`;
    const password = "Scout12345!";

    // Context A: sign up
    const ctxA = await browser.newContext();
    const pageA = await ctxA.newPage();
    await signIn(pageA, email, password);
    await expect(pageA).toHaveURL("/home");
    const emailTextA = await pageA.getByText(email).textContent();
    expect(emailTextA).toContain(email);

    // Context B: sign in with same credentials
    const ctxB = await browser.newContext();
    const pageB = await ctxB.newPage();
    await signIn(pageB, email, password);
    await expect(pageB).toHaveURL("/home");
    const emailTextB = await pageB.getByText(email).textContent();
    expect(emailTextB).toContain(email);

    await ctxA.close();
    await ctxB.close();
  });

  test("sign out on context A does not prevent context B from accessing /home", async ({ browser }: { browser: Browser }) => {
    const email = `cross2+${Date.now()}@scout.dev`;
    const password = "Scout12345!";

    const ctxA = await browser.newContext();
    const ctxB = await browser.newContext();
    const pageA = await ctxA.newPage();
    const pageB = await ctxB.newPage();

    // Both sign in
    await signIn(pageA, email, password);
    await signIn(pageB, email, password);

    // A signs out
    await pageA.getByRole("button", { name: /sign out/i }).first().click();
    await expect(pageA).toHaveURL("/auth", { timeout: 10000 });

    // B can still navigate to /home (session is independent)
    await pageB.goto("/home");
    await expect(pageB).toHaveURL("/home");

    await ctxA.close();
    await ctxB.close();
  });
});
