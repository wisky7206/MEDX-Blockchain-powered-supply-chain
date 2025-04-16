import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Inventory from "@/models/Inventory";

const sampleMedicines = [
  {
    walletAddress: "0x1234567890123456789012345678901234567890",
    name: "Paracetamol 500mg",
    description: "Pain reliever and fever reducer",
    quantity: 100,
    price: 5.99,
    category: "Pain Relief",
    imageUrl: "https://example.com/paracetamol.jpg"
  },
  {
    walletAddress: "0x1234567890123456789012345678901234567890",
    name: "Ibuprofen 200mg",
    description: "Anti-inflammatory pain reliever",
    quantity: 75,
    price: 7.99,
    category: "Pain Relief",
    imageUrl: "https://example.com/ibuprofen.jpg"
  },
  {
    walletAddress: "0x1234567890123456789012345678901234567890",
    name: "Amoxicillin 500mg",
    description: "Antibiotic for bacterial infections",
    quantity: 50,
    price: 12.99,
    category: "Antibiotics",
    imageUrl: "https://example.com/amoxicillin.jpg"
  },
  {
    walletAddress: "0x1234567890123456789012345678901234567890",
    name: "Loratadine 10mg",
    description: "Antihistamine for allergies",
    quantity: 60,
    price: 8.99,
    category: "Allergy",
    imageUrl: "https://example.com/loratadine.jpg"
  },
  {
    walletAddress: "0x1234567890123456789012345678901234567890",
    name: "Omeprazole 20mg",
    description: "Proton pump inhibitor for acid reflux",
    quantity: 40,
    price: 15.99,
    category: "Digestive Health",
    imageUrl: "https://example.com/omeprazole.jpg"
  }
];

export async function POST() {
  try {
    await dbConnect();

    // Clear existing inventory
    await Inventory.deleteMany({});

    // Insert sample medicines
    const result = await Inventory.insertMany(sampleMedicines);

    return NextResponse.json({
      message: "Inventory populated successfully",
      count: result.length,
      medicines: result
    });
  } catch (error) {
    console.error("Error populating inventory:", error);
    return NextResponse.json(
      { error: "Failed to populate inventory" },
      { status: 500 }
    );
  }
} 