import { ObjectId } from 'mongodb';

export interface User {
  _id?: ObjectId;
  address: string;
  name?: string;
  companyName?: string;
  email?: string;
  phone?: string;
  location?: string;
  role?: 'provider' | 'manufacturer' | 'distributor' | 'retailer';
  registrationId?: string;
  licenseNumber?: string;
  verified?: boolean;
  billNotificationsEnabled?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryItem {
  _id?: ObjectId;
  userId: ObjectId;
  name: string;
  description: string;
  quantity: number;
  price: number;
  category: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
} 