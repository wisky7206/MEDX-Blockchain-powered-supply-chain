import { NextResponse } from "next/server";
import User from "../../../models/User";
import dbConnect from "../../../lib/mongodb"; // <-- ADDED IMPORT

export async function GET() {
  try {
    // Optional: Add await dbConnect(); here if you need DB access in GET all
    await dbConnect(); // <-- ADDED (if needed for GET all)
    const users = await User.find({}).lean();
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
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