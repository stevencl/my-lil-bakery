import { NextRequest, NextResponse } from "next/server"
import { createOrder } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json()
    const order = await createOrder(orderData)
    return NextResponse.json(order)
  } catch (error) {
    console.error("Error creating order:", error)
    
    // Check if it's our custom error about missing products
    if (error instanceof Error && error.message.includes('no longer exist')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    )
  }
}
