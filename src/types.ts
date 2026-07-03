/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'admin' | 'broker' | 'agent' | 'owner' | 'customer';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: 'pending' | 'verified';
  brokerId?: string; // If agent or broker profile
}

export interface BrokerProfile {
  id: string;
  companyName: string;
  logo: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  licenseNumber: string;
  rating: number;
  reviewsCount: number;
  status: 'pending' | 'approved' | 'frozen';
  password?: string;
  bio?: string;
  notificationsActive?: boolean;
  theme?: string;
}

export interface AgentProfile {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  email: string;
  brokerId: string;
  status: 'pending' | 'approved';
}

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: 'ETB' | 'USD';
  type: 'Villa' | 'House' | 'Apartment' | 'Condominium' | 'Studio' | 'Office' | 'Shop' | 'Hotel' | 'Warehouse' | 'Factory' | 'Residential Land' | 'Commercial Land' | 'Farm Land' | 'Industrial Land' | 'Resort' | 'Building' | 'Guest House' | 'Investment Projects';
  category: 'Residential' | 'Commercial' | 'Land' | 'Special';
  purpose: 'Sale' | 'Rent' | 'Lease';
  bedrooms: number;
  bathrooms: number;
  garage: boolean;
  kitchen: boolean;
  livingRooms: number;
  balcony: boolean;
  area: number; // in sq meters
  floor: number;
  buildingAge: number;
  latitude: number;
  longitude: number;
  address: string;
  region: string;
  city: string;
  subCity: string;
  woreda: string;
  nearbySchools?: string;
  nearbyHospitals?: string;
  nearbyBanks?: string;
  nearbyRoads?: string;
  water: boolean;
  electricity: boolean;
  internet: boolean;
  parking: boolean;
  security: boolean;
  furnished: boolean;
  swimmingPool: boolean;
  garden: boolean;
  videoTour?: string;
  virtualTour360?: string;
  ownershipStatus: 'Clean Title' | 'Bank Collateral' | 'Under Construction' | 'Leasehold';
  propertyCondition: 'New' | 'Excellent' | 'Good' | 'Needs Renovation';
  images: string[];
  documents?: string[]; // PDF names
  status: 'pending_review' | 'active' | 'sold' | 'rented';
  brokerId?: string;
  agentId?: string;
  ownerId?: string;
  isPremium: boolean;
  isFeatured: boolean;
  createdAt: string;
}

export interface Inquiry {
  id: string;
  propertyId: string;
  propertyTitle: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  message: string;
  method: 'Phone' | 'Telegram' | 'WhatsApp' | 'Email' | 'Live Chat';
  status: 'new' | 'responded';
  brokerId?: string;
  agentId?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  channelId: string; // "customer_broker" or similar
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  imageUrl?: string;
  location?: { lat: number; lng: number };
  read?: boolean;
}

export interface Appointment {
  id: string;
  propertyId: string;
  propertyTitle: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  date: string;
  time: string;
  status: 'pending' | 'approved' | 'declined';
  brokerId: string;
  agentId?: string;
  createdAt: string;
}

export interface SubscriptionPlan {
  id: 'Free' | 'Silver' | 'Gold' | 'Premium';
  name: string;
  price: number; // in ETB
  durationMonths: number;
  features: string[];
}

export interface UserSubscription {
  id: string;
  userId: string;
  userName: string;
  planId: 'Free' | 'Silver' | 'Gold' | 'Premium';
  price: number;
  paymentGateway: 'Telebirr' | 'CBE Birr' | 'Chapa' | 'SantimPay' | 'Stripe' | 'PayPal';
  status: 'active' | 'expired';
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  user: string;
}

export interface AppSettings {
  telegramBotActive: boolean;
  androidMaintenanceMode: boolean;
  pushNotificationsCount: number;
  approvedAdsCount: number;
}

export interface Transaction {
  id: string;
  propertyId: string;
  propertyTitle: string;
  buyerName: string;
  buyerPhone: string;
  buyerEmail: string;
  price: number;
  currency: string;
  paymentGateway: 'Telebirr' | 'CBE Birr' | 'Chapa' | 'SantimPay' | 'Stripe' | 'PayPal';
  transactionId: string;
  receiptUrl?: string;
  status: 'pending_approval' | 'approved' | 'declined';
  brokerId: string;
  agentId?: string;
  createdAt: string;
}

export interface PasswordResetRequest {
  id: string;
  email: string;
  role: 'admin' | 'broker';
  token: string;
  status: 'pending' | 'approved' | 'declined' | 'completed';
  createdAt: string;
}

