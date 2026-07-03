import { pgTable, serial, text, integer, boolean, real, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  name: text('name'),
  phone: text('phone'),
  role: text('role').$type<'admin' | 'broker' | 'agent' | 'owner' | 'customer'>().default('customer'),
  status: text('status').$type<'pending' | 'verified'>().default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const brokers = pgTable('brokers', {
  id: text('id').primaryKey(),
  companyName: text('company_name').notNull(),
  logo: text('logo'),
  address: text('address'),
  phone: text('phone'),
  email: text('email'),
  website: text('website'),
  licenseNumber: text('license_number'),
  password: text('password'),
  rating: real('rating').default(5.0),
  reviewsCount: integer('reviews_count').default(0),
  status: text('status').$type<'pending' | 'approved' | 'frozen'>().default('pending'),
  bio: text('bio'),
  notificationsActive: boolean('notifications_active').default(true),
  theme: text('theme').default('light'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const agents = pgTable('agents', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  avatar: text('avatar'),
  phone: text('phone'),
  email: text('email'),
  brokerId: text('broker_id').notNull(),
  status: text('status').$type<'pending' | 'approved'>().default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const properties = pgTable('properties', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  price: real('price').notNull(),
  currency: text('currency').$type<'ETB' | 'USD'>().default('ETB'),
  type: text('type').notNull(),
  category: text('category').notNull(),
  purpose: text('purpose').notNull(),
  bedrooms: integer('bedrooms').default(0),
  bathrooms: integer('bathrooms').default(0),
  garage: boolean('garage').default(false),
  kitchen: boolean('kitchen').default(false),
  livingRooms: integer('living_rooms').default(1),
  balcony: boolean('balcony').default(false),
  area: real('area').notNull(),
  floor: integer('floor').default(0),
  buildingAge: integer('building_age').default(0),
  latitude: real('latitude').default(9.0),
  longitude: real('longitude').default(38.7),
  address: text('address').notNull(),
  region: text('region').notNull(),
  city: text('city').notNull(),
  subCity: text('sub_city').notNull(),
  woreda: text('woreda'),
  nearbySchools: text('nearby_schools'),
  nearbyHospitals: text('nearby_hospitals'),
  nearbyBanks: text('nearby_banks'),
  nearbyRoads: text('nearby_roads'),
  water: boolean('water').default(false),
  electricity: boolean('electricity').default(false),
  internet: boolean('internet').default(false),
  parking: boolean('parking').default(false),
  security: boolean('security').default(false),
  furnished: boolean('furnished').default(false),
  swimmingPool: boolean('swimming_pool').default(false),
  garden: boolean('garden').default(false),
  videoTour: text('video_tour'),
  virtualTour360: text('virtual_tour_360'),
  ownershipStatus: text('ownership_status').notNull(),
  propertyCondition: text('property_condition').notNull(),
  images: jsonb('images').$type<string[]>().notNull(),
  documents: jsonb('documents').$type<string[]>(),
  status: text('status').$type<'pending_review' | 'active' | 'sold' | 'rented'>().default('pending_review'),
  brokerId: text('broker_id'),
  agentId: text('agent_id'),
  ownerId: text('owner_id'),
  isPremium: boolean('is_premium').default(false),
  isFeatured: boolean('is_featured').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const inquiries = pgTable('inquiries', {
  id: text('id').primaryKey(),
  propertyId: text('property_id').notNull(),
  propertyTitle: text('property_title').notNull(),
  customerName: text('customer_name').notNull(),
  customerEmail: text('customer_email').notNull(),
  customerPhone: text('customer_phone').notNull(),
  message: text('message').notNull(),
  method: text('method').notNull(),
  status: text('status').$type<'new' | 'responded'>().default('new'),
  brokerId: text('broker_id'),
  agentId: text('agent_id'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const appointments = pgTable('appointments', {
  id: text('id').primaryKey(),
  propertyId: text('property_id').notNull(),
  propertyTitle: text('property_title').notNull(),
  customerId: text('customer_id').notNull(),
  customerName: text('customer_name').notNull(),
  customerPhone: text('customer_phone').notNull(),
  date: text('date').notNull(),
  time: text('time').notNull(),
  status: text('status').$type<'pending' | 'approved' | 'declined'>().default('pending'),
  brokerId: text('broker_id').notNull(),
  agentId: text('agent_id'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const chatMessages = pgTable('chat_messages', {
  id: text('id').primaryKey(),
  channelId: text('channel_id').notNull(),
  senderId: text('sender_id').notNull(),
  senderName: text('sender_name').notNull(),
  text: text('text').notNull(),
  timestamp: timestamp('timestamp').defaultNow(),
  imageUrl: text('image_url'),
  location: jsonb('location').$type<{ lat: number; lng: number }>(),
  read: boolean('read').default(false),
});

export const subscriptions = pgTable('subscriptions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  userName: text('user_name').notNull(),
  planId: text('plan_id').notNull(),
  price: real('price').notNull(),
  paymentGateway: text('payment_gateway').notNull(),
  status: text('status').$type<'active' | 'expired'>().default('active'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const appSettings = pgTable('app_settings', {
  id: serial('id').primaryKey(),
  telegramBotActive: boolean('telegram_bot_active').default(true),
  androidMaintenanceMode: boolean('android_maintenance_mode').default(false),
  pushNotificationsCount: integer('push_notifications_count').default(0),
  approvedAdsCount: integer('approved_ads_count').default(0),
});

export const auditLogs = pgTable('audit_logs', {
  id: text('id').primaryKey(),
  action: text('action').notNull(),
  details: text('details').notNull(),
  timestamp: timestamp('timestamp').defaultNow(),
  user: text('user').notNull(),
});

export const transactions = pgTable('transactions', {
  id: text('id').primaryKey(),
  propertyId: text('property_id').notNull(),
  propertyTitle: text('property_title').notNull(),
  buyerName: text('buyer_name').notNull(),
  buyerPhone: text('buyer_phone').notNull(),
  buyerEmail: text('buyer_email').notNull(),
  price: real('price').notNull(),
  currency: text('currency').default('ETB'),
  paymentGateway: text('payment_gateway').notNull(),
  transactionId: text('transaction_id').notNull(),
  receiptUrl: text('receipt_url'),
  status: text('status').$type<'pending_approval' | 'approved' | 'declined'>().default('pending_approval'),
  brokerId: text('broker_id').notNull(),
  agentId: text('agent_id'),
  createdAt: timestamp('created_at').defaultNow(),
});
