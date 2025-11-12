"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, ShoppingCart, ArrowLeft, Clock } from "lucide-react"
import { useCart } from "@/components/cart-context"
import { useFavorites } from "@/components/favorites-context"
import { useSession } from "next-auth/react"
import { CartSidebar } from "@/components/cart-sidebar"

export default function FavoritesPage() {
  const { data: session } = useSession()
  const { favorites, removeFromFavorites, loading } = useFavorites()
  const { addToCart, cartItems, toggleCart, isCartOpen } = useCart()

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-cream-50 to-yellow-50">
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
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-md mx-auto">
            <Heart className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Sign In Required</h1>
            <p className="text-gray-600 mb-8">
              Please sign in to view and manage your favorite products.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <Link href="/auth/signin">
                <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

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
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-pink-500 text-white text-xs">
                    {cartItemCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <Heart className="h-8 w-8 text-pink-600 fill-pink-600" />
            <h1 className="text-4xl font-bold text-gray-800">My Favorites</h1>
          </div>
          <p className="text-gray-600">
            {favorites.length === 0
              ? "You haven't added any favorites yet."
              : `You have ${favorites.length} favorite ${favorites.length === 1 ? "product" : "products"}.`}
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
        ) : favorites.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-24 w-24 mx-auto mb-4 text-gray-300" />
            <h2 className="text-2xl font-bold text-gray-700 mb-2">No Favorites Yet</h2>
            <p className="text-gray-600 mb-8">
              Start adding products to your favorites by clicking the heart icon on any product.
            </p>
            <Link href="/">
              <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
                Browse Products
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((product) => (
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
                  {!product.inStock && (
                    <Badge className="absolute top-2 right-2 bg-red-500 text-white text-xs">Out of Stock</Badge>
                  )}
                  <Button
                    onClick={() => removeFromFavorites(product.id)}
                    variant="ghost"
                    size="icon"
                    className="absolute bottom-2 right-2 bg-white/80 hover:bg-white h-8 w-8"
                  >
                    <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                  </Button>
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
