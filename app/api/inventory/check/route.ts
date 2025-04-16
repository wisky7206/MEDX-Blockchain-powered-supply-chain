import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Inventory from "@/models/Inventory";

export async function GET() {
  try {
    await dbConnect();
    
    // Get all inventory items
    const allInventory = await Inventory.find({}).lean();
    
    // Group by wallet address
    const inventoryByUser: Record<string, any[]> = {};
    allInventory.forEach(item => {
      if (!inventoryByUser[item.walletAddress]) {
        inventoryByUser[item.walletAddress] = [];
      }
      inventoryByUser[item.walletAddress].push({
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        price: item.price,
        category: item.category,
        imageUrl: item.imageUrl
      });
    });

    return NextResponse.json({
      success: true,
      totalItems: allInventory.length,
      inventoryByUser
    });
  } catch (error) {
    console.error("Error checking inventory:", error);
    return NextResponse.json(
      { success: false, error: "Failed to check inventory" },
      { status: 500 }
    );
  }
} 