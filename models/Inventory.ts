import mongoose from 'mongoose';

export interface IInventoryItem {
  walletAddress: string;
  name: string;
  description: string;
  quantity: number;
  price: number;
  category: string;
  imageUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const inventorySchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  category: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: false,
  },
}, {
  timestamps: true,
});

// Create a compound index to ensure uniqueness of walletAddress and name combination
inventorySchema.index({ walletAddress: 1, name: 1 }, { unique: true });

// Check if the model already exists to prevent overwriting
const Inventory = mongoose.models.Inventory || mongoose.model('Inventory', inventorySchema);

export default Inventory; 