import mongoose from "mongoose"

export interface IOrder {
  orderId: string
  buyerAddress: string
  sellerAddress?: string
  items: {
    name: string
    quantity: number
    price: number
  }[]
  totalAmount: number
  status: "pending" | "accepted" | "completed" | "cancelled"
  metadataUri: string
  transactionHash?: string
  createdAt: Date
  updatedAt: Date
}

const orderSchema = new mongoose.Schema<IOrder>(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    buyerAddress: {
      type: String,
      required: true,
    },
    sellerAddress: {
      type: String,
    },
    items: [
      {
        name: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "completed", "cancelled"],
      default: "pending",
    },
    metadataUri: {
      type: String,
      required: true,
    },
    transactionHash: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
)

// Create index for faster queries
orderSchema.index({ buyerAddress: 1, status: 1 })
orderSchema.index({ sellerAddress: 1, status: 1 })

export default mongoose.models.Order || mongoose.model<IOrder>("Order", orderSchema)
