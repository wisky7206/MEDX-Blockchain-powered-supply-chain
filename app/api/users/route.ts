import { NextResponse } from "next/server";
import User from "../../../models/User";
import dbConnect from "../../../lib/mongodb";
import { connectToDatabase } from "@/lib/mongodb";
import { User as UserModel } from "@/models/User";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");

    await dbConnect();

    // If role is provided, filter by role
    const query = role ? { role } : {};
    const users = await User.find(query).select("-password");

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    console.log("POST /api/users route handler hit"); // Optional log
    await dbConnect(); // <-- ADDED AWAIT

    const body = await request.json();
    console.log("Received request body:", body); // Optional log

    // Validate required fields
    if (!body.walletAddress || !body.role || !body.name || !body.companyName || !body.email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if user with wallet address already exists
    const existingUser = await User.findOne({ walletAddress: body.walletAddress });
    if (existingUser) {
      return NextResponse.json({ error: "User with this wallet address already exists" }, { status: 409 });
    }

    // Create new user
    const user = new User({
      walletAddress: body.walletAddress,
      role: body.role,
      name: body.name,
      companyName: body.companyName,
      email: body.email,
      phone: body.phone || "",
      location: body.location || "",
      registrationId: body.registrationId || "",
      licenseNumber: body.licenseNumber || "",
      verified: false, // Default to unverified
    });

    await user.save();

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error); // <-- This should now show specific DB errors if they occur
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}