import dbConnect from "@/lib/mongodb";
import Inventory from "@/models/Inventory";
import User from "@/models/User";

const sampleMedicines = [
  {
    name: "Paracetamol 500mg",
    description: "Pain reliever and fever reducer",
    quantity: 100,
    price: 5.99,
    category: "Pain Relief",
    imageUrl: "https://example.com/paracetamol.jpg"
  },
  {
    name: "Ibuprofen 200mg",
    description: "Nonsteroidal anti-inflammatory drug",
    quantity: 75,
    price: 7.99,
    category: "Pain Relief",
    imageUrl: "https://example.com/ibuprofen.jpg"
  },
  {
    name: "Amoxicillin 500mg",
    description: "Antibiotic for bacterial infections",
    quantity: 50,
    price: 12.99,
    category: "Antibiotics",
    imageUrl: "https://example.com/amoxicillin.jpg"
  },
  {
    name: "Loratadine 10mg",
    description: "Antihistamine for allergies",
    quantity: 60,
    price: 8.99,
    category: "Allergy",
    imageUrl: "https://example.com/loratadine.jpg"
  },
  {
    name: "Omeprazole 20mg",
    description: "Proton pump inhibitor for acid reflux",
    quantity: 40,
    price: 15.99,
    category: "Digestive Health",
    imageUrl: "https://example.com/omeprazole.jpg"
  },
  {
    name: "Atorvastatin 20mg",
    description: "Cholesterol-lowering medication",
    quantity: 30,
    price: 18.99,
    category: "Cardiovascular",
    imageUrl: "https://example.com/atorvastatin.jpg"
  }
];

async function seedInventory() {
  try {
    await dbConnect();
    console.log("Connected to database");

    // Get all users
    const users = await User.find({});
    console.log(`Found ${users.length} users`);

    // Add medicines to each user's inventory
    for (const user of users) {
      console.log(`Adding medicines for user: ${user.walletAddress}`);
      
      for (const medicine of sampleMedicines) {
        try {
          await Inventory.create({
            ...medicine,
            walletAddress: user.walletAddress
          });
          console.log(`Added ${medicine.name} to ${user.walletAddress}'s inventory`);
        } catch (error: any) {
          // If item already exists, skip it
          if (error.code === 11000) {
            console.log(`${medicine.name} already exists for ${user.walletAddress}`);
            continue;
          }
          throw error;
        }
      }
    }

    console.log("Inventory seeding completed successfully");
  } catch (error) {
    console.error("Error seeding inventory:", error);
  } finally {
    process.exit(0);
  }
}

seedInventory(); 