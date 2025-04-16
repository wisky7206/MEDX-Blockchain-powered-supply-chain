import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Inventory from "@/models/Inventory";
import { sampleMedicines } from "@/lib/sample-medicines";

export async function POST() {
  try {
    await dbConnect();

    // Get all users
    const users = await User.find({});
    
    if (!users || users.length === 0) {
      return NextResponse.json(
        { error: "No users found in the database" },
        { status: 404 }
      );
    }

    const results = [];

    // For each user, add 4-5 random medicines
    for (const user of users) {
      // Randomly select 4-5 medicines
      const numMedicines = Math.floor(Math.random() * 2) + 4; // 4 or 5
      const selectedMedicines = [...sampleMedicines]
        .sort(() => 0.5 - Math.random())
        .slice(0, numMedicines);

      // Add each selected medicine to the user's inventory
      for (const medicine of selectedMedicines) {
        const quantity = Math.floor(Math.random() * 50) + 10; // Random quantity between 10 and 60

        const inventoryItem = await Inventory.create({
          walletAddress: user.walletAddress,
          name: medicine.name,
          description: medicine.description,
          quantity: quantity,
          price: medicine.price,
          category: medicine.category,
        });

        results.push({
          user: user.walletAddress,
          item: inventoryItem,
        });
      }
    }

    return NextResponse.json({
      message: "Inventory populated successfully",
      results,
    });
  } catch (error) {
    console.error("Error populating inventory:", error);
    return NextResponse.json(
      { error: "Failed to populate inventory" },
      { status: 500 }
    );
  }
} 