import mongoose, { Schema, type Document } from "mongoose"

export interface IProduct extends Document {
  productId: string
  name: string
  category: string
  description: string
  manufacturer: string
  batchNumber?: string
  manufactureDate: Date
  expiryDate: Date
  price: number
  quantity: number
  unit: string
  imageUrl?: string
  status: "Available" | "Low Stock" | "Out of Stock"
  blockchainId?: string // Reference to blockchain record
  createdAt: Date
  updatedAt: Date
}

const ProductSchema: Schema = new Schema({
  productId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  manufacturer: { type: String, required: true },
  batchNumber: { type: String },
  manufactureDate: { type: Date, required: true },
  expiryDate: { type: Date, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  imageUrl: { type: String },
  status: {
    type: String,
    required: true,
    enum: ["Available", "Low Stock", "Out of Stock"],
    default: "Available",
  },
  blockchainId: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

export default mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema)
