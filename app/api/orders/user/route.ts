import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { getOrdersByUserOrEmail } from "@/lib/database"

export async function GET() {
  try {
    const session = await getServerSession(authOptions) as any
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const userId = session.user.id || null
    const userEmail = session.user.email
    
    if (!userEmail) {
      return NextResponse.json(
        { error: "User email not found" },
        { status: 400 }
      )
    }

    // Fetch orders by userId OR by email (for guest/stale session orders)
    const orders = await getOrdersByUserOrEmail(userId, userEmail)
    return NextResponse.json(orders)
  } catch (error) {
    console.error("Error fetching user orders:", error)
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    )
  }
}
