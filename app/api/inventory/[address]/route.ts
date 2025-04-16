import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Inventory from "@/models/Inventory";

export async function GET(
  request: Request,
  { params }: { params: { address: string } }
) {
  try {
    await dbConnect();
    const { address } = params;

    // Find all inventory items for the given wallet address
    const inventoryItems = await Inventory.find({ walletAddress: address }).lean();

    if (!inventoryItems || inventoryItems.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    return NextResponse.json(inventoryItems);
  } catch (error) {
    console.error("Error fetching inventory:", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory" },
      { status: 500 }
    );
  }
} 