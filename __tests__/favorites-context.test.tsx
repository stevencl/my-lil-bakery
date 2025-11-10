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

  test("should add item to favorites", () => {
    const { result } = renderHook(() => useFavorites(), { wrapper })

    act(() => {
      result.current.addToFavorites("product-1");
    })

    expect(result.current.favorites).toHaveLength(1);
    expect(result.current.favorites[0]).toBe("product-1");
  })

  test("should not add duplicate item to favorites", () => {
    const { result } = renderHook(() => useFavorites(), { wrapper })

    act(() => {
      result.current.addToFavorites("product-1");
      result.current.addToFavorites("product-1");
    })

    expect(result.current.favorites).toHaveLength(1);
  })

  test("should remove item from favorites", () => {
    const { result } = renderHook(() => useFavorites(), { wrapper })

    act(() => {
      result.current.addToFavorites("product-1");
      result.current.removeFromFavorites("product-1");
    })

    expect(result.current.favorites).toHaveLength(0);
  })

  test("should toggle favorite on", () => {
    const { result } = renderHook(() => useFavorites(), { wrapper })

    act(() => {
      result.current.toggleFavorite("product-1");
    })

    expect(result.current.favorites).toHaveLength(1);
    expect(result.current.favorites[0]).toBe("product-1");
  })

  test("should toggle favorite off", () => {
    const { result } = renderHook(() => useFavorites(), { wrapper })

    act(() => {
      result.current.addToFavorites("product-1");
      result.current.toggleFavorite("product-1");
    })

    expect(result.current.favorites).toHaveLength(0);
  })

  test("should check if item is favorite", () => {
    const { result } = renderHook(() => useFavorites(), { wrapper })

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
    expect(result.current.isFavorite("product-1")).toBe(true);
    expect(result.current.isFavorite("product-2")).toBe(true);
    expect(result.current.isFavorite("product-3")).toBe(true);
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
})
