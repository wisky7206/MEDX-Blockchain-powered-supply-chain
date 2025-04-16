const mongoose = require('mongoose');
require('dotenv').config();

const medicines = [
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
    description: "Anti-inflammatory pain reliever",
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
  }
];

const sampleUsers = [
  {
    walletAddress: "0x1234567890123456789012345678901234567890",
    role: "manufacturer",
    name: "PharmaCo Inc",
    email: "contact@pharmaco.com"
  },
  {
    walletAddress: "0x0987654321098765432109876543210987654321",
    role: "distributor",
    name: "MediDistributors",
    email: "info@medidist.com"
  },
  {
    walletAddress: "0xabcdef1234567890abcdef1234567890abcdef12",
    role: "retailer",
    name: "HealthPlus Pharmacy",
    email: "orders@healthplus.com"
  }
];

async function populateAllUsers() {
  try {
    // Connect to MongoDB using the same URI as the application
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error("Please define the MONGODB_URI environment variable in .env.local");
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
      retryWrites: true,
      retryReads: true,
      maxPoolSize: 10,
      minPoolSize: 5,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      heartbeatFrequencyMS: 10000,
    });
    console.log('Connected to MongoDB');

    // Get the User and Inventory models
    const User = mongoose.model('User', new mongoose.Schema({
      walletAddress: String,
      role: String,
      name: String,
      email: String
    }));

    const Inventory = mongoose.model('Inventory', new mongoose.Schema({
      walletAddress: String,
      name: String,
      description: String,
      quantity: Number,
      price: Number,
      category: String,
      imageUrl: String
    }));

    // Check if users exist, if not create sample users
    const existingUsers = await User.find({});
    if (existingUsers.length === 0) {
      console.log('No users found, creating sample users...');
      await User.insertMany(sampleUsers);
      console.log('Created sample users');
    }

    // Get all users with role "manufacturer" or "distributor"
    const users = await User.find({
      role: { $in: ['manufacturer', 'distributor'] }
    });

    console.log(`Found ${users.length} users to populate inventory for`);

    // Clear existing inventory
    await Inventory.deleteMany({});
    console.log('Cleared existing inventory');

    // Add medicines for each user
    for (const user of users) {
      const userMedicines = medicines.map(medicine => ({
        ...medicine,
        walletAddress: user.walletAddress,
        quantity: Math.floor(Math.random() * 100) + 50 // Random quantity between 50-150
      }));

      await Inventory.insertMany(userMedicines);
      console.log(`Added medicines for user ${user.walletAddress}`);
    }

    // Verify the data
    const totalItems = await Inventory.countDocuments();
    console.log(`\nTotal items in inventory: ${totalItems}`);

    // Display the inventory
    const allItems = await Inventory.find({});
    console.log('\nInventory Items:');
    allItems.forEach(item => {
      console.log(`- ${item.name} (${item.quantity} units) - ${item.walletAddress}`);
    });

    // Close the connection
    await mongoose.connection.close();
    console.log('\nMongoDB connection closed');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

populateAllUsers(); 