import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Inventory, { IInventoryItem } from "@/models/Inventory"

// Cache for frequently accessed inventory items
const inventoryCache = new Map<string, IInventoryItem[]>()

// Helper function to clear cache
const clearInventoryCache = (walletAddress: string) => {
  inventoryCache.delete(walletAddress.toLowerCase())
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get("walletAddress")

    if (!walletAddress) {
      return NextResponse.json({ error: "Wallet address is required" }, { status: 400 })
    }

    const normalizedAddress = walletAddress.toLowerCase()

    // Check cache first
    const cachedItems = inventoryCache.get(normalizedAddress)
    if (cachedItems) {
      return NextResponse.json(cachedItems, { status: 200 })
    }

    await dbConnect()
    const items = await Inventory.find({ walletAddress: normalizedAddress }).lean()

    // Cache the items
    inventoryCache.set(normalizedAddress, items as unknown as IInventoryItem[])

    return NextResponse.json(items, { status: 200 })
  } catch (error) {
    console.error("Error fetching inventory:", error)
    return NextResponse.json({ error: "Failed to fetch inventory" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { walletAddress, name, description, quantity, price, category, imageUrl } = body;

    // Validate required fields
    if (!walletAddress || !name || !description || !quantity || !price || !category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create new inventory item
    const newItem = await Inventory.create({
      walletAddress,
      name,
      description,
      quantity: Number(quantity),
      price: Number(price),
      category,
      imageUrl: imageUrl || undefined
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error: any) {
    console.error("Error adding inventory item:", error);
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "An item with this name already exists in your inventory" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to add inventory item" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const itemData = await request.json()
    const { walletAddress, name, ...updateData } = itemData

    if (!walletAddress || !name) {
      return NextResponse.json({ error: "Wallet address and item name are required" }, { status: 400 })
    }

    const normalizedAddress = walletAddress.toLowerCase()

    await dbConnect()

    const updatedItem = await Inventory.findOneAndUpdate(
      { walletAddress: normalizedAddress, name },
      { $set: { ...updateData, updatedAt: new Date() } },
      { new: true, runValidators: true }
    ).lean()

    if (!updatedItem) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    // Clear cache for this wallet
    clearInventoryCache(normalizedAddress)

    return NextResponse.json(updatedItem, { status: 200 })
  } catch (error) {
    console.error("Error updating inventory item:", error)
    return NextResponse.json({ error: "Failed to update inventory item" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get("walletAddress")
    const name = searchParams.get("name")

    if (!walletAddress || !name) {
      return NextResponse.json({ error: "Wallet address and item name are required" }, { status: 400 })
    }

    const normalizedAddress = walletAddress.toLowerCase()

    await dbConnect()

    const deletedItem = await Inventory.findOneAndDelete({
      walletAddress: normalizedAddress,
      name,
    }).lean()

    if (!deletedItem) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    // Clear cache for this wallet
    clearInventoryCache(normalizedAddress)

    return NextResponse.json({ message: "Item deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting inventory item:", error)
    return NextResponse.json({ error: "Failed to delete inventory item" }, { status: 500 })
  }
} 