"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Star } from "lucide-react"
import type { ProductWithCategory } from "@/lib/database"

interface ProductCardProps {
  product: ProductWithCategory
  onAddToCart: (product: ProductWithCategory) => void
  variant?: "featured" | "default"
}

export function ProductCard({ product, onAddToCart, variant = "default" }: ProductCardProps) {
  const isFeatured = variant === "featured"

  return (
    <Card
      className={`group bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden ${
        isFeatured ? "hover:scale-105" : ""
      }`}
    >
      <div className="relative aspect-square overflow-hidden rounded-t-lg">
        <Image
          src={product.image || "/placeholder.svg?height=400&width=400"}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-300"
        />
        {product.featured && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-yellow-400 text-yellow-900 hover:bg-yellow-500">
              <Star className="h-3 w-3 mr-1 fill-current" />
              Featured
            </Badge>
          </div>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="destructive" className="text-sm">
              Out of Stock
            </Badge>
          </div>
        )}
      </div>

      <CardContent className={isFeatured ? "p-6" : "p-4"}>
        <div className="mb-2">
          <Badge className="bg-pink-100 text-pink-700 hover:bg-pink-200 text-xs">
            {product.category.name}
          </Badge>
        </div>

        <h3 className={`font-bold text-gray-800 mb-2 ${isFeatured ? "text-xl" : "text-lg"}`}>
          {product.name}
        </h3>

        {product.description && (
          <p className={`text-gray-600 mb-4 line-clamp-2 ${isFeatured ? "text-sm" : "text-xs"}`}>
            {product.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className={`font-bold text-pink-600 ${isFeatured ? "text-2xl" : "text-xl"}`}>
              ${product.price.toFixed(2)}
            </span>
            {product.preOrder && (
              <span className="text-xs text-gray-500">Pre-order only</span>
            )}
          </div>

          <Button
            onClick={() => onAddToCart(product)}
            disabled={!product.inStock}
            className={`bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 ${
              isFeatured ? "" : "px-3"
            }`}
            size={isFeatured ? "default" : "sm"}
          >
            <ShoppingCart className={`${isFeatured ? "mr-2 h-4 w-4" : "h-4 w-4"}`} />
            {isFeatured && "Add to Cart"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
