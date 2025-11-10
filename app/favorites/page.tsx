"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, ShoppingCart, ArrowLeft, Clock } from "lucide-react"
import { useCart } from "@/components/cart-context"
import { useFavorites } from "@/components/favorites-context"
import { CartSidebar } from "@/components/cart-sidebar"
import type { ProductWithCategory } from "@/lib/database"

export default function FavoritesPage() {
  const { addToCart, toggleCart, isCartOpen } = useCart()
  const { favorites, toggleFavorite } = useFavorites()
  const [products, setProducts] = useState<ProductWithCategory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch('/api/products')
        if (!response.ok) {
          throw new Error('Failed to fetch products')
        }
        const productsData = await response.json()
        setProducts(productsData)
      } catch (error) {
        console.error('Error loading products:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  const favoriteProducts = products.filter((product) => favorites.includes(product.id))

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-cream-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-pink-100 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">🧁</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Sweet Dreams Bakery
              </span>
            </Link>

            <div className="flex items-center space-x-4">
              <Button
                onClick={toggleCart}
                variant="outline"
                size="icon"
                className="relative border-pink-200 hover:bg-pink-50 bg-transparent"
              >
                <ShoppingCart className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-gray-600 hover:text-pink-600 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Shop
          </Link>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">My Favorites</h1>
          <p className="text-gray-600">
            {favoriteProducts.length === 0
              ? "You haven't added any favorites yet. Start browsing to add your favorite items!"
              : `You have ${favoriteProducts.length} favorite item${favoriteProducts.length !== 1 ? "s" : ""}`}
          </p>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-t-lg"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : favoriteProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="h-12 w-12 text-pink-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">No Favorites Yet</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start adding items to your favorites by clicking the heart icon on any product.
            </p>
            <Link href="/">
              <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
                Browse Products
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favoriteProducts.map((product) => (
              <Card
                key={product.id}
                className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <div className="relative overflow-hidden rounded-t-lg">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    width={300}
                    height={300}
                    className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.preOrder && (
                    <Badge className="absolute top-2 left-2 bg-purple-500 text-white text-xs">Pre-Order</Badge>
                  )}
                  <Button
                    onClick={() => toggleFavorite(product.id)}
                    variant="ghost"
                    size="icon"
                    className={`absolute h-8 w-8 bg-white/80 backdrop-blur-sm hover:bg-white rounded-full ${!product.inStock ? "top-2 right-14" : "top-2 right-2"}`}
                    aria-label="Remove from favorites"
                  >
                    <Heart className="h-4 w-4 fill-pink-500 text-pink-500" />
                  </Button>
                  {!product.inStock && (
                    <Badge className="absolute top-2 right-2 bg-red-500 text-white text-xs">Out of Stock</Badge>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-1 line-clamp-1">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-pink-600">${product.price}</span>
                    <Button
                      onClick={() => addToCart(product)}
                      size="sm"
                      disabled={!product.inStock}
                      className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:opacity-50"
                    >
                      {product.inStock ? "Add to Cart" : "Out of Stock"}
                    </Button>
                  </div>
                  {product.preOrder && (
                    <p className="text-xs text-purple-600 mt-2 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      Min {product.minOrderTime}h notice required
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Cart Sidebar */}
      <CartSidebar isOpen={isCartOpen} onClose={() => toggleCart()} />
    </div>
  )
}
