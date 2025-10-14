"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Package, Calendar, Clock, Phone, Mail, Loader2, ShoppingBag } from "lucide-react"
import Link from "next/link"

interface OrderItem {
  id: string
  productId: string
  quantity: number
  price: number
  product: {
    id: string
    name: string
    image: string | null
  }
}

interface Order {
  id: string
  status: string
  total: number
  customerName: string
  customerEmail: string
  customerPhone: string | null
  deliveryAddress: string | null
  pickupDate: string | null
  pickupTime: string | null
  specialInstructions: string | null
  createdAt: string
  orderItems: OrderItem[]
}

export default function OrdersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/orders")
    }
  }, [status, router])

  // Fetch user orders
  useEffect(() => {
    const fetchOrders = async () => {
      if ((session?.user as any)?.id) {
        try {
          const response = await fetch("/api/orders/user")
          if (response.ok) {
            const data = await response.json()
            setOrders(data)
          } else {
            console.error("Failed to fetch orders")
          }
        } catch (error) {
          console.error("Error fetching orders:", error)
        } finally {
          setIsLoading(false)
        }
      }
    }

    if (status === "authenticated") {
      fetchOrders()
    }
  }, [session, status])

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "READY":
        return "bg-green-100 text-green-800 border-green-200"
      case "COMPLETED":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-cream-50 to-yellow-50">
        <Loader2 className="h-8 w-8 animate-spin text-pink-600" />
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-cream-50 to-yellow-50 py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-pink-400 to-purple-600 flex items-center justify-center">
                <Package className="h-8 w-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">My Orders</CardTitle>
                <CardDescription>View and track your bakery orders</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Orders Yet</h3>
              <p className="text-gray-500 mb-6 text-center">
                You haven&apos;t placed any orders yet. Start shopping to see your orders here!
              </p>
              <Link href="/#products">
                <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
                  Browse Products
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        Order #{order.id.slice(-9).toUpperCase()}
                      </CardTitle>
                      <CardDescription>
                        Placed on {formatDate(order.createdAt)} at {formatTime(order.createdAt)}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(order.status)} variant="outline">
                      {order.status}
                    </Badge>
                  </div>
                </CardHeader>
                <Separator />
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    {/* Order Items */}
                    <div>
                      <h4 className="font-semibold mb-3">Items</h4>
                      <div className="space-y-2">
                        {order.orderItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              {item.product.image && (
                                <img
                                  src={item.product.image}
                                  alt={item.product.name}
                                  className="w-12 h-12 object-cover rounded"
                                />
                              )}
                              <div>
                                <p className="font-medium">{item.product.name}</p>
                                <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                              </div>
                            </div>
                            <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Details */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <h4 className="font-semibold">Pickup Details</h4>
                        {order.pickupDate && (
                          <div className="flex items-start gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-gray-500 mt-0.5" />
                            <div>
                              <p className="font-medium">Pickup Date</p>
                              <p className="text-gray-600">{formatDate(order.pickupDate)}</p>
                            </div>
                          </div>
                        )}
                        {order.pickupTime && (
                          <div className="flex items-start gap-2 text-sm">
                            <Clock className="h-4 w-4 text-gray-500 mt-0.5" />
                            <div>
                              <p className="font-medium">Pickup Time</p>
                              <p className="text-gray-600">{order.pickupTime}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-semibold">Contact Information</h4>
                        <div className="flex items-start gap-2 text-sm">
                          <Mail className="h-4 w-4 text-gray-500 mt-0.5" />
                          <div>
                            <p className="font-medium">Email</p>
                            <p className="text-gray-600">{order.customerEmail}</p>
                          </div>
                        </div>
                        {order.customerPhone && (
                          <div className="flex items-start gap-2 text-sm">
                            <Phone className="h-4 w-4 text-gray-500 mt-0.5" />
                            <div>
                              <p className="font-medium">Phone</p>
                              <p className="text-gray-600">{order.customerPhone}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Special Instructions */}
                    {order.specialInstructions && (
                      <div>
                        <h4 className="font-semibold mb-2">Special Instructions</h4>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                          {order.specialInstructions}
                        </p>
                      </div>
                    )}

                    {/* Total */}
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Total</span>
                      <span className="text-2xl font-bold text-pink-600">
                        ${order.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
