"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import type { ProductWithCategory } from "@/lib/database"

interface FavoritesContextType {
  favorites: ProductWithCategory[]
  isFavorite: (productId: string) => boolean
  addToFavorites: (product: ProductWithCategory) => Promise<void>
  removeFromFavorites: (productId: string) => Promise<void>
  toggleFavorite: (product: ProductWithCategory) => Promise<void>
  loading: boolean
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const [favorites, setFavorites] = useState<ProductWithCategory[]>([])
  const [loading, setLoading] = useState(false)

  // Load favorites when user logs in
  useEffect(() => {
    if (session?.user) {
      loadFavorites()
    } else {
      setFavorites([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user])

  const loadFavorites = useCallback(async () => {
    if (!session?.user) return

    setLoading(true)
    try {
      const response = await fetch("/api/favorites")
      if (response.ok) {
        const data = await response.json()
        setFavorites(data)
      }
    } catch (error) {
      console.error("Error loading favorites:", error)
    } finally {
      setLoading(false)
    }
  }, [session?.user])

  const isFavorite = useCallback(
    (productId: string) => {
      return favorites.some((fav) => fav.id === productId)
    },
    [favorites]
  )

  const addToFavorites = useCallback(
    async (product: ProductWithCategory) => {
      if (!session?.user) {
        // Could show a toast/notification here
        return
      }

      try {
        const response = await fetch("/api/favorites", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ productId: product.id }),
        })

        if (response.ok) {
          setFavorites((prev) => [product, ...prev])
        } else if (response.status === 401) {
          console.error("Not authenticated")
        }
      } catch (error) {
        console.error("Error adding to favorites:", error)
      }
    },
    [session?.user]
  )

  const removeFromFavorites = useCallback(
    async (productId: string) => {
      if (!session?.user) return

      try {
        const response = await fetch(`/api/favorites?productId=${productId}`, {
          method: "DELETE",
        })

        if (response.ok) {
          setFavorites((prev) => prev.filter((fav) => fav.id !== productId))
        }
      } catch (error) {
        console.error("Error removing from favorites:", error)
      }
    },
    [session?.user]
  )

  const toggleFavorite = useCallback(
    async (product: ProductWithCategory) => {
      if (isFavorite(product.id)) {
        await removeFromFavorites(product.id)
      } else {
        await addToFavorites(product)
      }
    },
    [isFavorite, addToFavorites, removeFromFavorites]
  )

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        isFavorite,
        addToFavorites,
        removeFromFavorites,
        toggleFavorite,
        loading,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider")
  }
  return context
}
