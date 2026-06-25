import { test, expect } from "@playwright/test";
import { signIn } from "./helpers";

const E2E_EMAIL = process.env.E2E_EMAIL ?? "test@scout.dev";
const E2E_PASSWORD = process.env.E2E_PASSWORD ?? "Test12345!";

test.describe("authenticated home", () => {
  test("renders nav shell with all four tabs", async ({ page }) => {
    await signIn(page, E2E_EMAIL, E2E_PASSWORD);
    await expect(page).toHaveURL("/home");
    await expect(page.getByRole("link", { name: "Beastiary" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Discover" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Profile" })).toBeVisible();
  });

  test("Beastiary tab navigates to /beastiary", async ({ page }) => {
    await signIn(page, E2E_EMAIL, E2E_PASSWORD);
    await page.getByRole("link", { name: "Beastiary" }).first().click();
    await expect(page).toHaveURL("/beastiary");
    await expect(page.getByText("Your Beastiary")).toBeVisible();
  });

  test("Discover tab navigates to /discover", async ({ page }) => {
    await signIn(page, E2E_EMAIL, E2E_PASSWORD);
    await page.getByRole("link", { name: "Discover" }).first().click();
    await expect(page).toHaveURL("/discover");
    await expect(page.getByText("Discover")).toBeVisible();
  });

  test("Profile tab navigates to /profile", async ({ page }) => {
    await signIn(page, E2E_EMAIL, E2E_PASSWORD);
    await page.getByRole("link", { name: "Profile" }).first().click();
    await expect(page).toHaveURL("/profile");
    await expect(page.getByText("Profile")).toBeVisible();
  });
});
