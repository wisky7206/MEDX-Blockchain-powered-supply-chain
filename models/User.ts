import mongoose, { Schema, type Document } from "mongoose"

export interface IUser extends Document {
  walletAddress: string
  role: "provider" | "manufacturer" | "distributor" | "retailer" | "admin"
  name: string
  companyName: string
  email: string
  phone?: string
  location?: string
  registrationId?: string
  licenseNumber?: string
  verified: boolean
  createdAt: Date
  updatedAt: Date
}

const UserSchema: Schema = new Schema({
  walletAddress: { type: String, required: true, unique: true },
  role: {
    type: String,
    required: true,
    enum: ["provider", "manufacturer", "distributor", "retailer", "admin"],
  },
  name: { type: String, required: true },
  companyName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  location: { type: String },
  registrationId: { type: String },
  licenseNumber: { type: String },
  verified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema)
