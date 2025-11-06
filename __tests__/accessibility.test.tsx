import { render, screen } from "@testing-library/react"
import { CartProvider } from "@/components/cart-context"
import HomePage from "@/app/page"
import { SkipLink } from "@/components/skip-link"

const renderWithCart = (component: React.ReactElement) => {
  return render(<CartProvider>{component}</CartProvider>)
}

describe("Accessibility - Semantic Landmarks and Skip Links", () => {
  describe("Skip Link", () => {
    test("renders skip link component", () => {
      render(<SkipLink />)
      const skipLink = screen.getByText("Skip to main content")
      expect(skipLink).toBeInTheDocument()
      expect(skipLink).toHaveAttribute("href", "#main-content")
    })

    test("skip link has proper accessibility classes", () => {
      render(<SkipLink />)
      const skipLink = screen.getByText("Skip to main content")
      expect(skipLink).toHaveClass("sr-only")
      expect(skipLink.className).toContain("focus:not-sr-only")
    })
  })

  describe("Semantic HTML Landmarks", () => {
    test("page has main landmark with id", () => {
      const { container } = renderWithCart(<HomePage />)
      const mainElement = container.querySelector("main#main-content")
      expect(mainElement).toBeInTheDocument()
    })

    test("page has header landmark", () => {
      const { container } = renderWithCart(<HomePage />)
      const header = container.querySelector("header")
      expect(header).toBeInTheDocument()
    })

    test("page has footer landmark", () => {
      const { container } = renderWithCart(<HomePage />)
      const footer = container.querySelector("footer")
      expect(footer).toBeInTheDocument()
    })

    test("page has nav element inside header", () => {
      const { container } = renderWithCart(<HomePage />)
      const nav = container.querySelector("header nav")
      expect(nav).toBeInTheDocument()
    })
  })

  describe("ARIA labels for sections", () => {
    test("hero section has aria-labelledby", () => {
      const { container } = renderWithCart(<HomePage />)
      const heroSection = container.querySelector('section[aria-labelledby="hero-heading"]')
      expect(heroSection).toBeInTheDocument()
      
      const heroHeading = container.querySelector("#hero-heading")
      expect(heroHeading).toBeInTheDocument()
      expect(heroHeading?.textContent).toContain("Sweet Dreams")
    })

    test("featured products section has aria-labelledby", () => {
      const { container } = renderWithCart(<HomePage />)
      const featuredSection = container.querySelector('section[aria-labelledby="featured-heading"]')
      expect(featuredSection).toBeInTheDocument()
      
      const featuredHeading = container.querySelector("#featured-heading")
      expect(featuredHeading).toBeInTheDocument()
      expect(featuredHeading?.textContent).toBe("Our Signature Creations")
    })

    test("products section has aria-labelledby", () => {
      const { container } = renderWithCart(<HomePage />)
      const productsSection = container.querySelector('section#products[aria-labelledby="products-heading"]')
      expect(productsSection).toBeInTheDocument()
      
      const productsHeading = container.querySelector("#products-heading")
      expect(productsHeading).toBeInTheDocument()
      expect(productsHeading?.textContent).toBe("All Products")
    })

    test("about section has aria-labelledby", () => {
      const { container } = renderWithCart(<HomePage />)
      const aboutSection = container.querySelector('section#about[aria-labelledby="about-heading"]')
      expect(aboutSection).toBeInTheDocument()
      
      const aboutHeading = container.querySelector("#about-heading")
      expect(aboutHeading).toBeInTheDocument()
      expect(aboutHeading?.textContent).toBe("Baking Dreams Since 2020")
    })

    test("contact section has aria-labelledby", () => {
      const { container } = renderWithCart(<HomePage />)
      const contactSection = container.querySelector('section#contact[aria-labelledby="contact-heading"]')
      expect(contactSection).toBeInTheDocument()
      
      const contactHeading = container.querySelector("#contact-heading")
      expect(contactHeading).toBeInTheDocument()
      expect(contactHeading?.textContent).toBe("Visit Our Bakery")
    })
  })
})
