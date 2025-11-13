import type React from "react"
import { renderHook, act } from "@testing-library/react"
import { FavoritesProvider, useFavorites } from "@/components/favorites-context"

const wrapper = ({ children }: { children: React.ReactNode }) => <FavoritesProvider>{children}</FavoritesProvider>

// Mock localStorage for testing
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe("FavoritesContext", () => {
  beforeEach(() => {
    // Clear localStorage mock before each test
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockClear();
  });

  test("should add product to favorites", () => {
    const { result } = renderHook(() => useFavorites(), { wrapper })

    act(() => {
      result.current.addToFavorites("product-1");
    })

    expect(result.current.favorites).toHaveLength(1);
    expect(result.current.favorites[0]).toBe("product-1");
  })

  test("should not add duplicate product to favorites", () => {
    const { result } = renderHook(() => useFavorites(), { wrapper })

    act(() => {
      result.current.addToFavorites("product-1");
      result.current.addToFavorites("product-1");
    })

    expect(result.current.favorites).toHaveLength(1);
  })

  test("should remove product from favorites", () => {
    const { result } = renderHook(() => useFavorites(), { wrapper })

    act(() => {
      result.current.addToFavorites("product-1");
      result.current.removeFromFavorites("product-1");
    })

    expect(result.current.favorites).toHaveLength(0);
  })

  test("should toggle favorite on and off", () => {
    const { result } = renderHook(() => useFavorites(), { wrapper })

    // Toggle on
    act(() => {
      result.current.toggleFavorite("product-1");
    })

    expect(result.current.favorites).toHaveLength(1);
    expect(result.current.isFavorite("product-1")).toBe(true);

    // Toggle off
    act(() => {
      result.current.toggleFavorite("product-1");
    })

    expect(result.current.favorites).toHaveLength(0);
    expect(result.current.isFavorite("product-1")).toBe(false);
  })

  test("should check if product is favorite", () => {
    const { result } = renderHook(() => useFavorites(), { wrapper })

    expect(result.current.isFavorite("product-1")).toBe(false);

    act(() => {
      result.current.addToFavorites("product-1");
    })

    expect(result.current.isFavorite("product-1")).toBe(true);
    expect(result.current.isFavorite("product-2")).toBe(false);
  })

  test("should handle multiple favorites", () => {
    const { result } = renderHook(() => useFavorites(), { wrapper })

    act(() => {
      result.current.addToFavorites("product-1");
      result.current.addToFavorites("product-2");
      result.current.addToFavorites("product-3");
    })

    expect(result.current.favorites).toHaveLength(3);
    expect(result.current.favorites).toContain("product-1");
    expect(result.current.favorites).toContain("product-2");
    expect(result.current.favorites).toContain("product-3");
  })

  test("should persist favorites to localStorage", () => {
    const { result } = renderHook(() => useFavorites(), { wrapper })

    act(() => {
      result.current.addToFavorites("product-1");
    })

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "favorites",
      JSON.stringify(["product-1"])
    );
  })

  test("should load favorites from localStorage on mount", () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify(["product-1", "product-2"]));

    const { result } = renderHook(() => useFavorites(), { wrapper })

    expect(result.current.favorites).toHaveLength(2);
    expect(result.current.favorites).toContain("product-1");
    expect(result.current.favorites).toContain("product-2");
  })

  test("should handle invalid localStorage data gracefully", () => {
    localStorageMock.getItem.mockReturnValue("invalid json");

    const { result } = renderHook(() => useFavorites(), { wrapper })

    expect(result.current.favorites).toHaveLength(0);
  })

  test("should throw error when useFavorites is used outside FavoritesProvider", () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = jest.fn();

    expect(() => {
      renderHook(() => useFavorites());
    }).toThrow("useFavorites must be used within a FavoritesProvider");

    console.error = originalError;
  })
})
