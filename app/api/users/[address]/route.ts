import { NextResponse } from "next/server";
import User from "../../../../models/User";
import dbConnect from "../../../../lib/mongodb"; // <-- ADDED IMPORT

export async function GET(request: Request, { params }: { params: { address: string } }) {
  try {
    await dbConnect(); // <-- ADDED AWAIT

    // Access params.address here
    const normalizedAddress = params.address.toLowerCase();

    console.log(`Workspaceing user for address: ${normalizedAddress}`); // Optional log

    // Find the user by walletAddress
    const user = await User.findOne({ walletAddress: normalizedAddress }).lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    // This will catch connection errors or findOne errors
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { address: string } }) {
  try {
     await dbConnect(); // <-- ADDED AWAIT

     const address = params.address; // Access params here is likely okay in PUT
     const body = await request.json();

     // Check if body is properly formatted (optional validation)
     if (!body || Object.keys(body).length === 0) {
       return NextResponse.json({ error: "No data provided" }, { status: 400 });
     }

     // Fields that shouldn't be updated directly
     const { walletAddress, role, verified, ...updateFields } = body;

     // Add the current timestamp for updatedAt
     updateFields.updatedAt = new Date();

     // Update user data
     const user = await User.findOneAndUpdate(
       { walletAddress: address.toLowerCase() }, // Ensure case-insensitivity here too
       { $set: updateFields },
       { new: true, runValidators: true },
     );

     if (!user) {
       return NextResponse.json({ error: "User not found" }, { status: 404 });
     }

     return NextResponse.json(user, { status: 200 });
  } catch (error) {
     console.error("Error updating user:", error);
     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}