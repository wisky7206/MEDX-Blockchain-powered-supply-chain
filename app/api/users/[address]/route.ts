import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User, { IUser } from "@/models/User";
import { Document } from "mongoose";

// Cache for frequently accessed users
const userCache = new Map<string, IUser>();

// Helper function to normalize address
const normalizeAddress = (address: string) => address.toLowerCase();

// Helper function to clear cache
const clearUserCache = (address: string) => {
  userCache.delete(normalizeAddress(address));
};

export async function GET(request: Request, { params }: { params: { address: string } }) {
  try {
    const normalizedAddress = normalizeAddress(params.address);
    console.log(`Fetching user for address: ${normalizedAddress}`);

    // Check cache first
    const cachedUser = userCache.get(normalizedAddress);
    if (cachedUser) {
      return NextResponse.json(cachedUser, { status: 200 });
    }

    await dbConnect();
    const user = await User.findOne({ walletAddress: normalizedAddress }).lean();

    if (user) {
      // Cache the user data
      userCache.set(normalizedAddress, user as unknown as IUser);
    }

    return NextResponse.json(user || null, { status: 200 });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { address: string } }) {
  try {
    const normalizedAddress = normalizeAddress(params.address);
    const updateData = await request.json();

    // Remove fields that shouldn't be updated
    const { walletAddress, role, verified, ...allowedUpdates } = updateData;

    await dbConnect();
    const updatedUser = await User.findOneAndUpdate(
      { walletAddress: normalizedAddress },
      { $set: { ...allowedUpdates, updatedAt: new Date() } },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update cache
    userCache.set(normalizedAddress, updatedUser as unknown as IUser);

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userData = await request.json();
    const normalizedAddress = normalizeAddress(userData.walletAddress);

    await dbConnect();

    // Check cache first
    const cachedUser = userCache.get(normalizedAddress);
    if (cachedUser) {
      return NextResponse.json(
        { error: "User with this wallet address already exists" },
        { status: 409 }
      );
    }

    const existingUser = await User.findOne({
      walletAddress: normalizedAddress,
    }).lean();

    if (existingUser) {
      // Cache the existing user
      userCache.set(normalizedAddress, existingUser as unknown as IUser);
      return NextResponse.json(
        { error: "User with this wallet address already exists" },
        { status: 409 }
      );
    }

    const newUser = new User({
      ...userData,
      walletAddress: normalizedAddress,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const savedUser = await newUser.save();
    const userObject = savedUser.toObject();

    // Cache the new user
    userCache.set(normalizedAddress, userObject as unknown as IUser);

    return NextResponse.json(userObject, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}