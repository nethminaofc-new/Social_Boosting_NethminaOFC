import { LucideIcon } from 'lucide-react';

export enum PlatformId {
  TIKTOK = 'tiktok',
  YOUTUBE = 'youtube',
  INSTAGRAM = 'instagram',
  FACEBOOK = 'facebook',
}

export enum BoostType {
  FOLLOWERS = 'Followers',
  LIKES = 'Likes',
  VIEWS = 'Views',
  COMMENTS = 'Comments',
  FAVOURITES = 'Favorites',
  SUBSCRIBERS = 'Subscribers',
}

export interface PlatformConfig {
  id: PlatformId;
  name: string;
  icon: LucideIcon;
  color: string;
  gradient: string;
  allowedBoosts: BoostType[];
}

export interface OrderState {
  platform: PlatformId | null;
  boostType: BoostType | null;
  quantity: string | null;
  link: string;
  whatsapp: string;
  note: string;
  price: number;
}

export interface CartItem {
  id: string;
  platform: PlatformId;
  boostType: BoostType;
  quantityLabel: string;
  link: string;
  whatsapp: string;
  note?: string;
  price: number; // Price per unit
  count: number; // Quantity of units
}

export interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

// --- Auth & Admin Types ---

export type UserRole = 'customer' | 'admin';

export interface User {
  id: string; // CUS...
  email: string;
  phone: string; // WhatsApp
  password?: string; // Stored hashed (mock)
  role: UserRole;
  name?: string;
}

export type OrderStatus = 'Pending' | 'Processing' | 'Completed' | 'Cancelled';

export interface PaymentDetails {
  method: 'Ez Cash';
  senderPhone: string;
  referenceNumber?: string;
  receiptImage?: string; // Base64 string
}

export interface StoredOrder {
  orderId: string;
  customerId: string; // Links to User.id
  customerContact: string;
  orderDate: string;
  items: CartItem[];
  totalAmount: number;
  status: OrderStatus;
  payment: PaymentDetails;
  adminNote?: string; // Message from admin to customer
}