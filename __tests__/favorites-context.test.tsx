import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { FavoritesProvider, useFavorites } from "@/components/favorites-context"
import { useSession } from "next-auth/react"

// Mock next-auth
jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}))

// Type the mock
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>

// Mock fetch
global.fetch = jest.fn()

const mockSession = {
  data: {
    user: { email: "test@example.com", name: "Test User" },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  },
  status: "authenticated" as const,
  update: jest.fn() as any,
}

describe("FavoritesContext", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseSession.mockReturnValue(mockSession)
  })

  it("loads favorites on mount when user is logged in", async () => {
    const mockFavorites = [
      {
        id: "1",
        name: "Test Product",
        price: 10,
        category: { id: "cat1", name: "Cakes" },
      },
    ]

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockFavorites,
    })

    function TestComponent() {
      const { favorites } = useFavorites()
      return (
        <div>
          {favorites.map((fav) => (
            <div key={fav.id}>{fav.name}</div>
          ))}
        </div>
      )
    }

    render(
      <FavoritesProvider>
        <TestComponent />
      </FavoritesProvider>
    )

    await waitFor(() => {
      expect(screen.getByText("Test Product")).toBeInTheDocument()
    })

    expect(global.fetch).toHaveBeenCalledWith("/api/favorites")
  })

  it("does not load favorites when user is not logged in", () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: "unauthenticated",
      update: jest.fn() as any,
    })

    function TestComponent() {
      const { favorites } = useFavorites()
      return <div>Count: {favorites.length}</div>
    }

    render(
      <FavoritesProvider>
        <TestComponent />
      </FavoritesProvider>
    )

    expect(screen.getByText("Count: 0")).toBeInTheDocument()
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it("checks if a product is a favorite", async () => {
    const mockFavorites = [
      {
        id: "1",
        name: "Test Product",
        price: 10,
        category: { id: "cat1", name: "Cakes" },
      },
    ]

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockFavorites,
    })

    function TestComponent() {
      const { isFavorite } = useFavorites()
      return (
        <div>
          <div>Product 1: {isFavorite("1") ? "Yes" : "No"}</div>
          <div>Product 2: {isFavorite("2") ? "Yes" : "No"}</div>
        </div>
      )
    }

    render(
      <FavoritesProvider>
        <TestComponent />
      </FavoritesProvider>
    )

    await waitFor(() => {
      expect(screen.getByText("Product 1: Yes")).toBeInTheDocument()
    })
    expect(screen.getByText("Product 2: No")).toBeInTheDocument()
  })

  it("adds a product to favorites", async () => {
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: "1", name: "New Product" }),
      })

    const product = {
      id: "1",
      name: "New Product",
      price: 15,
      category: { id: "cat1", name: "Cakes" },
    }

    function TestComponent() {
      const { addToFavorites, favorites } = useFavorites()
      return (
        <div>
          <button onClick={() => addToFavorites(product as any)}>Add</button>
          <div>Count: {favorites.length}</div>
        </div>
      )
    }

    render(
      <FavoritesProvider>
        <TestComponent />
      </FavoritesProvider>
    )

    const addButton = screen.getByText("Add")
    await userEvent.click(addButton)

    await waitFor(() => {
      expect(screen.getByText("Count: 1")).toBeInTheDocument()
    })

    expect(global.fetch).toHaveBeenCalledWith("/api/favorites", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ productId: "1" }),
    })
  })

  it("removes a product from favorites", async () => {
    const mockFavorites = [
      {
        id: "1",
        name: "Test Product",
        price: 10,
        category: { id: "cat1", name: "Cakes" },
      },
    ]

    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockFavorites,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      })

    function TestComponent() {
      const { removeFromFavorites, favorites } = useFavorites()
      return (
        <div>
          <button onClick={() => removeFromFavorites("1")}>Remove</button>
          <div>Count: {favorites.length}</div>
        </div>
      )
    }

    render(
      <FavoritesProvider>
        <TestComponent />
      </FavoritesProvider>
    )

    await waitFor(() => {
      expect(screen.getByText("Count: 1")).toBeInTheDocument()
    })

    const removeButton = screen.getByText("Remove")
    await userEvent.click(removeButton)

    await waitFor(() => {
      expect(screen.getByText("Count: 0")).toBeInTheDocument()
    })

    expect(global.fetch).toHaveBeenCalledWith("/api/favorites?productId=1", {
      method: "DELETE",
    })
  })

  it("toggles a favorite", async () => {
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: "1", name: "Product" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      })

    const product = {
      id: "1",
      name: "Product",
      price: 10,
      category: { id: "cat1", name: "Cakes" },
    }

    function TestComponent() {
      const { toggleFavorite, favorites } = useFavorites()
      return (
        <div>
          <button onClick={() => toggleFavorite(product as any)}>Toggle</button>
          <div>Count: {favorites.length}</div>
        </div>
      )
    }

    render(
      <FavoritesProvider>
        <TestComponent />
      </FavoritesProvider>
    )

    const toggleButton = screen.getByText("Toggle")

    // Add to favorites
    await userEvent.click(toggleButton)
    await waitFor(() => {
      expect(screen.getByText("Count: 1")).toBeInTheDocument()
    })

    // Remove from favorites
    await userEvent.click(toggleButton)
    await waitFor(() => {
      expect(screen.getByText("Count: 0")).toBeInTheDocument()
    })
  })
})
