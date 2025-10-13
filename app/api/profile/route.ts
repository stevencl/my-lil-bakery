import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { updateProfileSchema } from "@/lib/validations"
import { ZodError } from "zod"

// GET /api/profile - Get current user's profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions) as any

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        dateOfBirth: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      } as any,
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user }, { status: 200 })
  } catch (error) {
    console.error("Profile fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT /api/profile - Update current user's profile
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as any

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateProfileSchema.parse(body)

    // Check if email is being changed and if it's already in use
    if (validatedData.email && validatedData.email !== session.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: validatedData.email },
      })

      if (existingUser && existingUser.id !== session.user.id) {
        return NextResponse.json(
          { error: "This email is already in use by another account" },
          { status: 400 }
        )
      }
    }

    // Prepare update data
    const updateData: any = {}
    
    if (validatedData.name !== undefined) updateData.name = validatedData.name
    if (validatedData.email !== undefined) updateData.email = validatedData.email
    if (validatedData.phone !== undefined) {
      updateData.phone = validatedData.phone || null
    }
    if (validatedData.address !== undefined) {
      updateData.address = validatedData.address || null
    }
    if (validatedData.dateOfBirth !== undefined) {
      updateData.dateOfBirth = validatedData.dateOfBirth
        ? new Date(validatedData.dateOfBirth)
        : null
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        dateOfBirth: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      } as any,
    })

    return NextResponse.json(
      {
        message: "Profile updated successfully",
        user: updatedUser,
      },
      { status: 200 }
    )
  } catch (error) {
    // Handle validation errors
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        },
        { status: 400 }
      )
    }

    // Handle Prisma unique constraint errors
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "This email is already in use by another account" },
        { status: 400 }
      )
    }

    console.error("Profile update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
