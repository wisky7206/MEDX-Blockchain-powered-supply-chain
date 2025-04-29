import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { User } from "@/lib/models/User";
import { ObjectId } from "mongodb";

// Cache for frequently accessed users
const userCache = new Map<string, User>();

// Helper function to normalize address
const normalizeAddress = (address: string) => address.toLowerCase();

// Helper function to clear cache
const clearUserCache = (address: string) => {
  userCache.delete(normalizeAddress(address));
};

export async function GET(request: Request, { params }: { params: { address: string } }) {
  try {
    const client = await clientPromise;
    const db = client.db("medx");
    const user = await db.collection<User>("users").findOne({ address: params.address });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: { params: { address: string } }) {
  try {
    const body = await request.json();
    const updateData = {
      ...body,
      updatedAt: new Date(),
    };

    delete updateData._id; // Remove _id if present to avoid MongoDB errors

    const client = await clientPromise;
    const db = client.db("medx");
    
    const result = await db.collection<User>("users").updateOne(
      { address: params.address },
      { 
        $set: updateData,
        $setOnInsert: { createdAt: new Date() }
      },
      { upsert: true }
    );

    if (result.matchedCount === 0 && !result.upsertedId) {
      return NextResponse.json(
        { error: "Failed to update user" },
        { status: 400 }
      );
    }

    const updatedUser = await db.collection<User>("users").findOne({ address: params.address });
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { address: string } }
) {
  try {
    const client = await clientPromise;
    const db = client.db("medx");
    
    const result = await db.collection<User>("users").deleteOne({ address: params.address });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const userData = await request.json();
    const normalizedAddress = normalizeAddress(userData.walletAddress);

    await clientPromise;

    // Check cache first
    const cachedUser = userCache.get(normalizedAddress);
    if (cachedUser) {
      return NextResponse.json(
        { error: "User with this wallet address already exists" },
        { status: 409 }
      );
    }

    const existingUser = await clientPromise.then(client => client.db("medx").collection<User>("users").findOne({ address: normalizedAddress }));

    if (existingUser) {
      // Cache the existing user
      userCache.set(normalizedAddress, existingUser as unknown as User);
      return NextResponse.json(
        { error: "User with this wallet address already exists" },
        { status: 409 }
      );
    }

    const newUser = new User({
      ...userData,
      address: normalizedAddress,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await clientPromise.then(client => client.db("medx").collection<User>("users").insertOne(newUser));
    const savedUser = await clientPromise.then(client => client.db("medx").collection<User>("users").findOne({ _id: result.insertedId }));
    const userObject = savedUser.toObject();

    // Cache the new user
    userCache.set(normalizedAddress, userObject as unknown as User);

    return NextResponse.json(userObject, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}