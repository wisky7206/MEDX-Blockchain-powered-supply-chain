import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { InventoryItem } from "@/lib/models/User";
import { ObjectId } from "mongodb";

export async function GET(
  request: Request,
  { params }: { params: { address: string } }
) {
  try {
    const client = await clientPromise;
    const db = client.db("medx");
    
    // First get the user's ID
    const user = await db.collection("users").findOne({ address: params.address });
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Then get their inventory items
    const items = await db.collection<InventoryItem>("inventory")
      .find({ userId: user._id })
      .toArray();

    return NextResponse.json(items);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { address: string } }
) {
  try {
    const body = await request.json();
    const client = await clientPromise;
    const db = client.db("medx");
    
    // First get the user's ID
    const user = await db.collection("users").findOne({ address: params.address });
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const newItem: InventoryItem = {
      ...body,
      userId: user._id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection<InventoryItem>("inventory").insertOne(newItem);
    
    if (!result.insertedId) {
      return NextResponse.json(
        { error: "Failed to create inventory item" },
        { status: 400 }
      );
    }

    const insertedItem = await db.collection<InventoryItem>("inventory").findOne({ _id: result.insertedId });
    return NextResponse.json(insertedItem, { status: 201 });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 