import mongoose, { Schema, type Document } from "mongoose"

export interface OrderItem {
  product: Schema.Types.ObjectId
  quantity: number
  price: number
}

export interface IOrder extends Document {
  orderId: string
  buyer: Schema.Types.ObjectId
  seller: Schema.Types.ObjectId
  items: OrderItem[]
  totalAmount: number
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Completed" | "Cancelled" | "Rejected"
  transactionHash?: string
  blockchainOrderId?: string
  shippingAddress?: string
  trackingInfo?: {
    carrier?: string
    trackingNumber?: string
    estimatedDelivery?: Date
    updates?: {
      status: string
      location?: string
      timestamp: Date
      description: string
    }[]
  }
  createdAt: Date
  updatedAt: Date
}

const OrderSchema: Schema = new Schema({
  orderId: { type: String, required: true, unique: true },
  buyer: { type: Schema.Types.ObjectId, ref: "User", required: true },
  seller: { type: Schema.Types.ObjectId, ref: "User", required: true },
  items: [
    {
      product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
    },
  ],
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    required: true,
    enum: ["Pending", "Processing", "Shipped", "Delivered", "Completed", "Cancelled", "Rejected"],
    default: "Pending",
  },
  transactionHash: { type: String },
  blockchainOrderId: { type: String },
  shippingAddress: { type: String },
  trackingInfo: {
    carrier: { type: String },
    trackingNumber: { type: String },
    estimatedDelivery: { type: Date },
    updates: [
      {
        status: { type: String, required: true },
        location: { type: String },
        timestamp: { type: Date, default: Date.now },
        description: { type: String, required: true },
      },
    ],
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

export default mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema)
