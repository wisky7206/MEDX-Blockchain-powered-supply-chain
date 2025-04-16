const mongoose = require('mongoose');

interface InventoryItem {
  walletAddress: string;
  name: string;
  description: string;
  quantity: number;
  price: number;
  category: string;
  imageUrl: string;
}

async function verifyInventory() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/medx_supply_chain');
    console.log('Connected to MongoDB');

    // Get the Inventory model
    const Inventory = mongoose.model<InventoryItem>('Inventory', new mongoose.Schema({
      walletAddress: String,
      name: String,
      description: String,
      quantity: Number,
      price: Number,
      category: String,
      imageUrl: String
    }));

    // Fetch all inventory items
    const items = await Inventory.find({});
    console.log('\nTotal items found:', items.length);
    
    // Display items by category
    const itemsByCategory: { [key: string]: InventoryItem[] } = {};
    items.forEach((item: InventoryItem) => {
      if (!itemsByCategory[item.category]) {
        itemsByCategory[item.category] = [];
      }
      itemsByCategory[item.category].push(item);
    });

    console.log('\nInventory by Category:');
    console.log('====================');
    
    for (const [category, categoryItems] of Object.entries(itemsByCategory)) {
      console.log(`\n${category}:`);
      categoryItems.forEach(item => {
        console.log(`  - ${item.name}`);
        console.log(`    Quantity: ${item.quantity}`);
        console.log(`    Price: $${item.price}`);
        console.log(`    Wallet: ${item.walletAddress.substring(0, 10)}...`);
      });
    }

    // Close the connection
    await mongoose.connection.close();
    console.log('\nMongoDB connection closed');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

verifyInventory(); 