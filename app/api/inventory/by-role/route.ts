import { NextResponse } from "next/server"
import Inventory from "@/models/Inventory"
import dbConnect from "@/lib/mongodb"

export async function GET(req: Request) {
  try {
    await dbConnect()
    const { searchParams } = new URL(req.url)
    const role = searchParams.get("role")

    if (!role) {
      return NextResponse.json(
        { error: "Role is required" },
        { status: 400 }
      )
    }

    // Get all users with the specified role
    const users = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users?role=${role}`)
      .then(res => res.json())

    if (!users || users.length === 0) {
      return NextResponse.json([])
    }

    // Get inventory items for all users with the specified role
    const inventoryItems = await Inventory.find({
      walletAddress: { $in: users.map((user: any) => user.walletAddress) }
    })

    // Group items by user
    const itemsByUser = users.map((user: any) => ({
      user: {
        walletAddress: user.walletAddress,
        name: user.name,
        companyName: user.companyName,
        role: user.role
      },
      items: inventoryItems.filter(item => item.walletAddress === user.walletAddress)
    }))

    return NextResponse.json(itemsByUser)
  } catch (error: any) {
    console.error("Error fetching inventory by role:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch inventory" },
      { status: 500 }
    )
  }
} 