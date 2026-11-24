import { expect, test } from "@playwright/test"

test("home page lists products", async ({ page }) => {
  await page.goto("/")
  await expect(page.getByRole("button", { name: "Add to Cart" }).first()).toBeVisible()
})

test("adding a product puts it in the cart", async ({ page }) => {
  await page.goto("/")
  await page.getByRole("button", { name: "Add to Cart" }).first().click()

  // The cart button has no accessible name yet, so find it by its icon.
  await page.locator("button:has(svg.lucide-shopping-cart)").first().click()

  await expect(page.getByTestId("empty-cart")).toHaveCount(0)
  await expect(page.getByTestId("cart-total")).toHaveText(/^\$\d+\.\d{2}$/)
})
