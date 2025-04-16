const mongoose = require('mongoose');

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

async function populateMongoDB() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/medx_supply_chain');
    console.log('Connected to MongoDB');

    // Get the Inventory model
    const Inventory = mongoose.model('Inventory', new mongoose.Schema({
      walletAddress: String,
      name: String,
      description: String,
      quantity: Number,
      price: Number,
      category: String,
      imageUrl: String
    }));

    // Clear existing inventory
    await Inventory.deleteMany({});
    console.log('Cleared existing inventory');

    // Insert sample medicines
    const result = await Inventory.insertMany(sampleMedicines);
    console.log('Successfully inserted medicines:', result.length);

    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

populateMongoDB(); 