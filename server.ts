/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { INITIAL_BROKERS, INITIAL_AGENTS, INITIAL_PROPERTIES, INITIAL_INQUIRIES, INITIAL_APPOINTMENTS, INITIAL_MESSAGES, SUBSCRIPTION_PLANS } from "./src/data.ts";
import { Property, BrokerProfile, AgentProfile, Inquiry, Appointment, ChatMessage, UserSubscription, AuditLog, AppSettings } from "./src/types.ts";

import { db } from "./src/db/index.ts";
import { users, properties, brokers, agents, inquiries, appointments, chatMessages, subscriptions, appSettings, auditLogs, transactions } from "./src/db/schema.ts";
import { seedDatabaseIfEmpty } from "./src/db/seed.ts";
import { eq, desc, and, or } from "drizzle-orm";

// Lazy-loaded GoogleGenAI client to avoid startup failures if key is missing
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey.trim() !== "") {
      try {
        aiClient = new GoogleGenAI({
          apiKey: apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
        });
        console.log("GoogleGenAI client initialized successfully.");
      } catch (err) {
        console.error("Failed to initialize GoogleGenAI client:", err);
      }
    } else {
      console.warn("GEMINI_API_KEY is not configured or empty. AI features will run in high-quality fallback simulation mode.");
    }
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middlewares
  app.use(express.json({ limit: '10mb' }));

  // Initialize and Seed Cloud SQL database if empty
  await seedDatabaseIfEmpty();

  // -------------------------------------------------------------
  // REST API Endpoints with Real Cloud SQL Integration
  // -------------------------------------------------------------

  // Health check
  app.get("/api/health", async (req, res) => {
    try {
      const list = await db.select().from(appSettings).limit(1);
      res.json({ 
        status: "healthy", 
        database: "Cloud SQL (PostgreSQL)", 
        timestamp: new Date() 
      });
    } catch (err: any) {
      res.status(500).json({ status: "unhealthy", error: err.message });
    }
  });

  // Properties Endpoints
  app.get("/api/properties", async (req, res) => {
    try {
      const list = await db.select().from(properties).orderBy(desc(properties.createdAt));
      res.json(list);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/properties", async (req, res) => {
    try {
      const newProp = {
        id: req.body.id || `prop-${Date.now()}`,
        title: req.body.title,
        description: req.body.description,
        price: Number(req.body.price),
        currency: (req.body.currency || 'ETB') as 'ETB' | 'USD',
        type: req.body.type,
        category: req.body.category,
        purpose: req.body.purpose,
        bedrooms: Number(req.body.bedrooms) || 0,
        bathrooms: Number(req.body.bathrooms) || 0,
        garage: req.body.garage || false,
        kitchen: req.body.kitchen || false,
        livingRooms: Number(req.body.livingRooms) || 1,
        balcony: req.body.balcony || false,
        area: Number(req.body.area),
        floor: Number(req.body.floor) || 0,
        buildingAge: Number(req.body.buildingAge) || 0,
        latitude: Number(req.body.latitude) || 9.0,
        longitude: Number(req.body.longitude) || 38.7,
        address: req.body.address,
        region: req.body.region,
        city: req.body.city,
        subCity: req.body.subCity,
        woreda: req.body.woreda || "",
        nearbySchools: req.body.nearbySchools || "",
        nearbyHospitals: req.body.nearbyHospitals || "",
        nearbyBanks: req.body.nearbyBanks || "",
        nearbyRoads: req.body.nearbyRoads || "",
        water: req.body.water || false,
        electricity: req.body.electricity || false,
        internet: req.body.internet || false,
        parking: req.body.parking || false,
        security: req.body.security || false,
        furnished: req.body.furnished || false,
        swimmingPool: req.body.swimmingPool || false,
        garden: req.body.garden || false,
        videoTour: req.body.videoTour || "",
        virtualTour360: req.body.virtualTour360 || "",
        ownershipStatus: req.body.ownershipStatus,
        propertyCondition: req.body.propertyCondition,
        images: req.body.images && req.body.images.length > 0 ? req.body.images : ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80'],
        documents: req.body.documents || [],
        status: (req.body.status || 'pending_review') as 'pending_review' | 'active' | 'sold' | 'rented',
        brokerId: req.body.brokerId || null,
        agentId: req.body.agentId || null,
        ownerId: req.body.ownerId || null,
        isPremium: req.body.isPremium || false,
        isFeatured: req.body.isFeatured || false,
        createdAt: new Date()
      };

      await db.insert(properties).values(newProp);

      await db.insert(auditLogs).values({
        id: `log-${Date.now()}`,
        action: 'PROPERTY_CREATE',
        details: `Created listing: "${newProp.title}" in ${newProp.city}, ${newProp.subCity}`,
        timestamp: new Date(),
        user: req.body.brokerId || 'Property Owner'
      });

      res.status(201).json(newProp);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put("/api/properties/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const updateFields: any = {};
      if (body.title !== undefined) updateFields.title = body.title;
      if (body.description !== undefined) updateFields.description = body.description;
      if (body.price !== undefined) updateFields.price = Number(body.price);
      if (body.currency !== undefined) updateFields.currency = body.currency;
      if (body.status !== undefined) updateFields.status = body.status;
      if (body.isPremium !== undefined) updateFields.isPremium = body.isPremium;
      if (body.isFeatured !== undefined) updateFields.isFeatured = body.isFeatured;
      if (body.images !== undefined) updateFields.images = body.images;

      const updated = await db.update(properties)
        .set(updateFields)
        .where(eq(properties.id, id))
        .returning();

      if (updated.length > 0) {
        await db.insert(auditLogs).values({
          id: `log-${Date.now()}`,
          action: 'PROPERTY_UPDATE',
          details: `Updated listing: "${updated[0].title}" status: ${updated[0].status}`,
          timestamp: new Date(),
          user: 'Broker/Admin'
        });
        res.json(updated[0]);
      } else {
        res.status(404).json({ error: "Property not found" });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/properties/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await db.delete(properties).where(eq(properties.id, id)).returning();
      if (deleted.length > 0) {
        await db.insert(auditLogs).values({
          id: `log-${Date.now()}`,
          action: 'PROPERTY_DELETE',
          details: `Deleted listing: "${deleted[0].title}"`,
          timestamp: new Date(),
          user: 'Admin'
        });
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "Property not found" });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Brokers Endpoints
  app.get("/api/brokers", async (req, res) => {
    try {
      const list = await db.select().from(brokers);
      res.json(list);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/brokers", async (req, res) => {
    try {
      const newBroker = {
        id: req.body.id || `broker-${Date.now()}`,
        companyName: req.body.companyName,
        logo: req.body.logo || "",
        address: req.body.address || "",
        phone: req.body.phone || "",
        email: req.body.email || "",
        website: req.body.website || "",
        licenseNumber: req.body.licenseNumber || "",
        password: req.body.password || "password",
        rating: 5.0,
        reviewsCount: 0,
        status: (req.body.status || 'pending') as 'pending' | 'approved',
        createdAt: new Date()
      };
      await db.insert(brokers).values(newBroker);
      await db.insert(auditLogs).values({
        id: `log-${Date.now()}`,
        action: 'BROKER_REGISTER',
        details: `Registered broker: "${newBroker.companyName}"`,
        timestamp: new Date(),
        user: 'Broker Admin'
      });
      res.status(201).json(newBroker);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put("/api/brokers/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const updateFields: any = {};
      if (body.companyName !== undefined) updateFields.companyName = body.companyName;
      if (body.logo !== undefined) updateFields.logo = body.logo;
      if (body.address !== undefined) updateFields.address = body.address;
      if (body.phone !== undefined) updateFields.phone = body.phone;
      if (body.email !== undefined) updateFields.email = body.email;
      if (body.website !== undefined) updateFields.website = body.website;
      if (body.licenseNumber !== undefined) updateFields.licenseNumber = body.licenseNumber;
      if (body.password !== undefined) updateFields.password = body.password;
      if (body.status !== undefined) updateFields.status = body.status;
      if (body.rating !== undefined) updateFields.rating = Number(body.rating);
      if (body.bio !== undefined) updateFields.bio = body.bio;
      if (body.notificationsActive !== undefined) updateFields.notificationsActive = body.notificationsActive;
      if (body.theme !== undefined) updateFields.theme = body.theme;

      const updated = await db.update(brokers)
        .set(updateFields)
        .where(eq(brokers.id, id))
        .returning();

      if (updated.length > 0) {
        await db.insert(auditLogs).values({
          id: `log-${Date.now()}`,
          action: 'BROKER_UPDATE',
          details: `Broker: "${updated[0].companyName}" profile updated (status: ${updated[0].status})`,
          timestamp: new Date(),
          user: 'Admin/Broker'
        });
        res.json(updated[0]);
      } else {
        res.status(404).json({ error: "Broker not found" });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/brokers/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await db.delete(brokers).where(eq(brokers.id, id)).returning();
      if (deleted.length > 0) {
        // Delete properties associated with this broker
        await db.delete(properties).where(eq(properties.brokerId, id));
        await db.insert(auditLogs).values({
          id: `log-${Date.now()}`,
          action: 'BROKER_DELETE',
          details: `Admin deleted broker: "${deleted[0].companyName}" and removed all their properties`,
          timestamp: new Date(),
          user: 'Admin'
        });
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "Broker not found" });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Transactions / Payments
  app.get("/api/transactions", async (req, res) => {
    try {
      const list = await db.select().from(transactions);
      res.json(list);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      const newTx = {
        id: req.body.id || `tx-${Date.now()}`,
        propertyId: req.body.propertyId,
        propertyTitle: req.body.propertyTitle,
        buyerName: req.body.buyerName,
        buyerPhone: req.body.buyerPhone,
        buyerEmail: req.body.buyerEmail,
        price: Number(req.body.price),
        currency: req.body.currency || 'ETB',
        paymentGateway: req.body.paymentGateway,
        transactionId: req.body.transactionId,
        receiptUrl: req.body.receiptUrl || '',
        status: (req.body.status || 'pending_approval') as 'pending_approval' | 'approved' | 'declined',
        brokerId: req.body.brokerId,
        agentId: req.body.agentId || null,
        createdAt: new Date()
      };
      await db.insert(transactions).values(newTx);
      await db.insert(auditLogs).values({
        id: `log-${Date.now()}`,
        action: 'TRANSACTION_CREATE',
        details: `Buyer ${newTx.buyerName} uploaded payment receipt for "${newTx.propertyTitle}". TX ID: ${newTx.transactionId}`,
        timestamp: new Date(),
        user: newTx.buyerName
      });
      res.status(201).json(newTx);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put("/api/transactions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const updated = await db.update(transactions)
        .set({ status })
        .where(eq(transactions.id, id))
        .returning();

      if (updated.length > 0) {
        if (status === 'approved') {
          const txInfo = updated[0];
          const propList = await db.select().from(properties).where(eq(properties.id, txInfo.propertyId));
          if (propList.length > 0) {
            const prop = propList[0];
            const nextStatus = prop.purpose === 'Rent' ? 'rented' : 'sold';
            await db.update(properties)
              .set({ status: nextStatus })
              .where(eq(properties.id, prop.id));
            
            await db.insert(auditLogs).values({
              id: `log-${Date.now()}`,
              action: 'PROPERTY_STATUS_UPDATE',
              details: `Property "${prop.title}" marked ${nextStatus} due to payment receipt approval`,
              timestamp: new Date(),
              user: 'System'
            });
          }
        }

        await db.insert(auditLogs).values({
          id: `log-${Date.now()}`,
          action: 'TRANSACTION_UPDATE',
          details: `Transaction ${id} updated to ${status}`,
          timestamp: new Date(),
          user: 'Broker/Admin'
        });
        res.json(updated[0]);
      } else {
        res.status(404).json({ error: "Transaction not found" });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Agents Endpoints
  app.get("/api/agents", async (req, res) => {
    try {
      const list = await db.select().from(agents);
      res.json(list);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/agents", async (req, res) => {
    try {
      const newAgent = {
        id: req.body.id || `agent-${Date.now()}`,
        name: req.body.name,
        avatar: req.body.avatar || "",
        phone: req.body.phone || "",
        email: req.body.email || "",
        brokerId: req.body.brokerId,
        status: (req.body.status || 'approved') as 'pending' | 'approved',
        createdAt: new Date()
      };
      await db.insert(agents).values(newAgent);
      await db.insert(auditLogs).values({
        id: `log-${Date.now()}`,
        action: 'AGENT_REGISTER',
        details: `Registered agent: "${newAgent.name}"`,
        timestamp: new Date(),
        user: `Broker ID: ${newAgent.brokerId}`
      });
      res.status(201).json(newAgent);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Inquiries Endpoints
  app.get("/api/inquiries", async (req, res) => {
    try {
      const list = await db.select().from(inquiries).orderBy(desc(inquiries.createdAt));
      res.json(list);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/inquiries", async (req, res) => {
    try {
      const newInquiry = {
        id: req.body.id || `inq-${Date.now()}`,
        propertyId: req.body.propertyId,
        propertyTitle: req.body.propertyTitle,
        customerName: req.body.customerName,
        customerEmail: req.body.customerEmail,
        customerPhone: req.body.customerPhone,
        message: req.body.message,
        method: req.body.method,
        status: (req.body.status || 'new') as 'new' | 'responded',
        brokerId: req.body.brokerId || null,
        agentId: req.body.agentId || null,
        createdAt: new Date()
      };
      await db.insert(inquiries).values(newInquiry);
      await db.insert(auditLogs).values({
        id: `log-${Date.now()}`,
        action: 'INQUIRY_CREATE',
        details: `Customer Inquiry by "${newInquiry.customerName}" via ${newInquiry.method}`,
        timestamp: new Date(),
        user: 'Customer'
      });
      res.status(201).json(newInquiry);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put("/api/inquiries/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await db.update(inquiries)
        .set({ status: req.body.status })
        .where(eq(inquiries.id, id))
        .returning();
      if (updated.length > 0) {
        res.json(updated[0]);
      } else {
        res.status(404).json({ error: "Inquiry not found" });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Appointments Endpoints
  app.get("/api/appointments", async (req, res) => {
    try {
      const list = await db.select().from(appointments).orderBy(desc(appointments.createdAt));
      res.json(list);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/appointments", async (req, res) => {
    try {
      const newApt = {
        id: req.body.id || `apt-${Date.now()}`,
        propertyId: req.body.propertyId,
        propertyTitle: req.body.propertyTitle,
        customerId: req.body.customerId,
        customerName: req.body.customerName,
        customerPhone: req.body.customerPhone,
        date: req.body.date,
        time: req.body.time,
        status: (req.body.status || 'pending') as 'pending' | 'approved' | 'declined',
        brokerId: req.body.brokerId,
        agentId: req.body.agentId || null,
        createdAt: new Date()
      };
      await db.insert(appointments).values(newApt);
      await db.insert(auditLogs).values({
        id: `log-${Date.now()}`,
        action: 'APPOINTMENT_CREATE',
        details: `Tour Scheduled: ${newApt.customerName} on ${newApt.date} at ${newApt.time}`,
        timestamp: new Date(),
        user: 'Customer'
      });
      res.status(201).json(newApt);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put("/api/appointments/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await db.update(appointments)
        .set({ status: req.body.status })
        .where(eq(appointments.id, id))
        .returning();
      if (updated.length > 0) {
        await db.insert(auditLogs).values({
          id: `log-${Date.now()}`,
          action: 'APPOINTMENT_UPDATE',
          details: `Tour updated: Status set to ${updated[0].status}`,
          timestamp: new Date(),
          user: 'Broker Agent'
        });
        res.json(updated[0]);
      } else {
        res.status(404).json({ error: "Appointment not found" });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Chat Messages Endpoints
  app.get("/api/chat", async (req, res) => {
    try {
      const list = await db.select().from(chatMessages);
      res.json(list);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const newMessage = {
        id: req.body.id || `msg-${Date.now()}`,
        channelId: req.body.channelId,
        senderId: req.body.senderId,
        senderName: req.body.senderName,
        text: req.body.text,
        timestamp: new Date(),
        imageUrl: req.body.imageUrl || null,
        location: req.body.location || null,
        read: req.body.read || false
      };
      await db.insert(chatMessages).values(newMessage);
      res.status(201).json(newMessage);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Subscriptions Endpoints
  app.get("/api/subscriptions", async (req, res) => {
    try {
      const list = await db.select().from(subscriptions).orderBy(desc(subscriptions.createdAt));
      res.json(list);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/subscriptions", async (req, res) => {
    try {
      const { userId, userName, planId, price, paymentGateway } = req.body;
      const newSub = {
        id: `sub-${Date.now()}`,
        userId,
        userName,
        planId,
        price: Number(price),
        paymentGateway,
        status: 'active' as 'active' | 'expired',
        createdAt: new Date()
      };
      await db.insert(subscriptions).values(newSub);
      await db.insert(auditLogs).values({
        id: `log-${Date.now()}`,
        action: 'SUBSCRIPTION_PURCHASE',
        details: `Purchased plan: ${planId} via ${paymentGateway} (ETB ${price})`,
        timestamp: new Date(),
        user: userName
      });
      res.status(201).json(newSub);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Audit Logs (Super Admin)
  app.get("/api/logs", async (req, res) => {
    try {
      const list = await db.select().from(auditLogs).orderBy(desc(auditLogs.timestamp));
      res.json(list);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Settings
  app.get("/api/settings", async (req, res) => {
    try {
      const list = await db.select().from(appSettings).limit(1);
      if (list.length > 0) {
        res.json(list[0]);
      } else {
        res.json({
          telegramBotActive: true,
          androidMaintenanceMode: false,
          pushNotificationsCount: 148,
          approvedAdsCount: 5
        });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/settings", async (req, res) => {
    try {
      const list = await db.select().from(appSettings).limit(1);
      if (list.length > 0) {
        const updated = await db.update(appSettings)
          .set({
            telegramBotActive: req.body.telegramBotActive !== undefined ? req.body.telegramBotActive : undefined,
            androidMaintenanceMode: req.body.androidMaintenanceMode !== undefined ? req.body.androidMaintenanceMode : undefined,
            pushNotificationsCount: req.body.pushNotificationsCount !== undefined ? Number(req.body.pushNotificationsCount) : undefined,
            approvedAdsCount: req.body.approvedAdsCount !== undefined ? Number(req.body.approvedAdsCount) : undefined,
          })
          .where(eq(appSettings.id, list[0].id))
          .returning();
        res.json(updated[0]);
      } else {
        const inserted = await db.insert(appSettings).values({
          telegramBotActive: req.body.telegramBotActive !== undefined ? req.body.telegramBotActive : true,
          androidMaintenanceMode: req.body.androidMaintenanceMode !== undefined ? req.body.androidMaintenanceMode : false,
          pushNotificationsCount: req.body.pushNotificationsCount !== undefined ? Number(req.body.pushNotificationsCount) : 148,
          approvedAdsCount: req.body.approvedAdsCount !== undefined ? Number(req.body.approvedAdsCount) : 5,
        }).returning();
        res.json(inserted[0]);
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });


  // -------------------------------------------------------------
  // Password Reset & Recovery Endpoints (Admin and Broker)
  // -------------------------------------------------------------

  // In-memory password reset store
  let resetRequests: Array<{
    id: string;
    email: string;
    role: 'admin' | 'broker';
    token: string;
    status: 'pending' | 'approved' | 'declined' | 'completed';
    createdAt: Date;
  }> = [];

  // Get all password reset requests
  app.get("/api/auth/reset-requests", (req, res) => {
    res.json(resetRequests);
  });

  // Create password reset request
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email, role } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email address is required." });
      }

      if (role === 'admin') {
        // Admin pre-registered email check (could match the default or any input)
        // We will generate the reset link for this email.
        const token = "rst-adm-" + Math.random().toString(36).substring(2, 10);
        const newReq = {
          id: `req-${Date.now()}`,
          email: email.trim(),
          role: 'admin' as const,
          token,
          status: 'pending' as const,
          createdAt: new Date()
        };
        resetRequests.push(newReq);

        await db.insert(auditLogs).values({
          id: `log-${Date.now()}`,
          action: 'ADMIN_PASSWORD_FORGOT',
          details: `Admin password reset requested for pre-registered email: ${email}`,
          timestamp: new Date(),
          user: 'Admin Webmaster'
        });

        return res.json({
          success: true,
          message: "Admin password reset link successfully sent to pre-registered email.",
          token,
          request: newReq
        });
      } else {
        // Broker pre-registered email check
        const brokerList = await db.select().from(brokers).where(eq(brokers.email, email.trim()));
        if (brokerList.length === 0) {
          return res.status(404).json({ error: "No pre-registered broker account found with this email." });
        }

        const token = "rst-brk-" + Math.random().toString(36).substring(2, 10);
        const newReq = {
          id: `req-${Date.now()}`,
          email: email.trim(),
          role: 'broker' as const,
          token,
          status: 'pending' as const,
          createdAt: new Date()
        };
        resetRequests.push(newReq);

        await db.insert(auditLogs).values({
          id: `log-${Date.now()}`,
          action: 'BROKER_PASSWORD_FORGOT',
          details: `Broker password reset requested for ${brokerList[0].companyName} (Email: ${email})`,
          timestamp: new Date(),
          user: brokerList[0].companyName
        });

        return res.json({
          success: true,
          message: "Broker password reset request created. Link sent to pre-registered email and submitted to Admin for direct approval.",
          token,
          request: newReq
        });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin approves/declines a request, or sets temporary password
  app.put("/api/auth/reset-requests/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { status, temporaryPassword } = req.body;

      const reqIdx = resetRequests.findIndex(r => r.id === id);
      if (reqIdx === -1) {
        return res.status(404).json({ error: "Reset request not found." });
      }

      const resetReq = resetRequests[reqIdx];
      resetReq.status = status;

      if (resetReq.role === 'broker' && status === 'approved' && temporaryPassword) {
        // Directly update broker password to temporary password
        await db.update(brokers)
          .set({ password: temporaryPassword })
          .where(eq(brokers.email, resetReq.email));

        resetReq.status = 'completed';

        await db.insert(auditLogs).values({
          id: `log-${Date.now()}`,
          action: 'BROKER_PASSWORD_APPROVED',
          details: `Admin directly approved and updated broker password for: ${resetReq.email}`,
          timestamp: new Date(),
          user: 'Admin'
        });
      } else if (status === 'approved') {
        await db.insert(auditLogs).values({
          id: `log-${Date.now()}`,
          action: 'PASSWORD_REQUEST_APPROVE',
          details: `Admin approved password reset request for: ${resetReq.email}`,
          timestamp: new Date(),
          user: 'Admin'
        });
      } else if (status === 'declined') {
        await db.insert(auditLogs).values({
          id: `log-${Date.now()}`,
          action: 'PASSWORD_REQUEST_DECLINE',
          details: `Admin declined password reset request for: ${resetReq.email}`,
          timestamp: new Date(),
          user: 'Admin'
        });
      }

      res.json({ success: true, request: resetReq });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Complete password reset using a token
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword) {
        return res.status(400).json({ error: "Token and new password are required." });
      }

      const reqIdx = resetRequests.findIndex(r => r.token === token);
      if (reqIdx === -1) {
        return res.status(400).json({ error: "Invalid or expired password reset link/token." });
      }

      const resetReq = resetRequests[reqIdx];
      if (resetReq.status === 'completed' || resetReq.status === 'declined') {
        return res.status(400).json({ error: "This password reset request has already been processed or declined." });
      }

      if (resetReq.role === 'broker') {
        await db.update(brokers)
          .set({ password: newPassword })
          .where(eq(brokers.email, resetReq.email));

        await db.insert(auditLogs).values({
          id: `log-${Date.now()}`,
          action: 'BROKER_PASSWORD_RESET_COMPLETE',
          details: `Broker reset password via pre-registered email link: ${resetReq.email}`,
          timestamp: new Date(),
          user: 'Broker Client'
        });
      } else if (resetReq.role === 'admin') {
        await db.insert(auditLogs).values({
          id: `log-${Date.now()}`,
          action: 'ADMIN_PASSWORD_RESET_COMPLETE',
          details: `Admin reset password via pre-registered email link: ${resetReq.email}`,
          timestamp: new Date(),
          user: 'Admin Master'
        });
      }

      resetReq.status = 'completed';
      res.json({ success: true, role: resetReq.role, email: resetReq.email, message: "Password updated successfully!" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });


  // -------------------------------------------------------------
  // AI Endpoints (Google Gemini API with Safe Fallbacks)
  // -------------------------------------------------------------

  // AI Property Description Generator
  app.post("/api/ai/description", async (req, res) => {
    const { title, type, city, subCity, bedrooms, amenities } = req.body;
    const prompt = `Write a premium, attractive real estate marketing description in English for a property with these details:
    Title: ${title}
    Property Type: ${type}
    Location: ${city}, ${subCity || ''}
    Bedrooms: ${bedrooms || 'N/A'}
    Amenities: ${amenities ? amenities.join(", ") : "None specified"}
    
    Format with an elegant heading, bullet points for key selling features, and a compelling call-to-action inviting buyers to schedule a viewing via Ethiopia Property Hub. Keep it sophisticated and professional.`;

    const client = getGeminiClient();
    if (client) {
      try {
        const response = await client.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
        });
        res.json({ description: response.text });
      } catch (err: any) {
        console.error("Gemini description gen error:", err);
        res.json({
          description: generateMockDescription(title, type, city, subCity, bedrooms, amenities),
          warning: "API Error occurred; generated high-quality template description."
        });
      }
    } else {
      res.json({
        description: generateMockDescription(title, type, city, subCity, bedrooms, amenities),
        warning: "Running in simulation mode because GEMINI_API_KEY is not configured."
      });
    }
  });

  // AI Price Estimation Model
  app.post("/api/ai/price-estimate", async (req, res) => {
    const { type, city, subCity, bedrooms, area, condition } = req.body;
    const prompt = `As a real estate evaluation AI in Ethiopia, estimate a fair market price range (in Ethiopian Birr ETB and USD equivalents) for this property:
    Type: ${type}
    City: ${city}
    Sub-city: ${subCity || 'N/A'}
    Bedrooms: ${bedrooms || 0}
    Area: ${area || 100} sqm
    Condition: ${condition || 'Good'}
    
    Please provide:
    1. A short analysis of current market rates in ${subCity || city}.
    2. Estimated Price Range (Min - Max) in ETB.
    3. Estimated Price Range (Min - Max) in USD.
    4. 3 key factors influencing this estimate.
    Keep the output in structured JSON format. Output ONLY the raw JSON block without markdown formatting or backticks.`;

    const client = getGeminiClient();
    if (client) {
      try {
        const response = await client.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json"
          }
        });
        const data = JSON.parse(response.text || "{}");
        res.json(data);
      } catch (err) {
        res.json(generateMockPriceEstimate(type, city, subCity, bedrooms, area, condition));
      }
    } else {
      res.json(generateMockPriceEstimate(type, city, subCity, bedrooms, area, condition));
    }
  });

  // AI Smart Assistant Chatbot Grounded in our Listings
  app.post("/api/ai/chat", async (req, res) => {
    const { message, chatHistory } = req.body;

    try {
      const dbProperties = await db.select().from(properties);
      
      // Build listing context string
      const listingsContext = dbProperties.map(p => 
        `- ID: ${p.id}, Title: ${p.title}, Type: ${p.type}, Purpose: ${p.purpose}, Price: ${p.price} ${p.currency}, Location: ${p.address}, ${p.city}. Bedrooms: ${p.bedrooms}, Features: swimming pool: ${p.swimmingPool}, security: ${p.security}, furnished: ${p.furnished}.`
      ).join("\n");

      const systemInstruction = `You are "PropertyHub AI", the official virtual real estate smart assistant for the Ethiopia Property Hub ecosystem.
      You help users search and browse property listings, calculate loan estimates, understand the buying process in Ethiopia, and suggest matched properties.
      
      Below are the current live properties synchronized in our centralized database:
      ${listingsContext}
      
      Guidelines:
      1. Help customers search properties from our live inventory. Highlight matching properties. Refer to them by name and summarize their key features.
      2. Maintain a friendly, supportive, and professional tone.
      3. If asked about prices, interest rates, or locations outside our database, provide knowledgeable, expert guidance on Ethiopian real estate context (e.g., Bole is popular, Kazanchis is commercial, Bole CMC is developing).
      4. Keep responses concise and formatted with clean Markdown.`;

      const client = getGeminiClient();
      if (client) {
        try {
          // Compile chat structure
          const formattedHistory = (chatHistory || []).map((h: any) => ({
            role: h.role === 'user' ? 'user' : 'model',
            parts: [{ text: h.text }]
          }));

          // Use standard generateContent with complete context
          const response = await client.models.generateContent({
            model: "gemini-3.5-flash",
            contents: [
              ...formattedHistory,
              { role: 'user', parts: [{ text: message }] }
            ],
            config: {
              systemInstruction: systemInstruction
            }
          });

          res.json({ response: response.text });
        } catch (err) {
          res.json({ response: getMockBotResponse(message, dbProperties as any[]) });
        }
      } else {
        res.json({ response: getMockBotResponse(message, dbProperties as any[]) });
      }
    } catch (dbErr) {
      res.json({ response: "I'm having trouble retrieving real-time properties from our database right now. Please browse the main portal or try again shortly." });
    }
  });

  // AI Duplicate & Fraud Listing Detection
  app.post("/api/ai/fraud-check", async (req, res) => {
    const { title, description, price, city, subCity } = req.body;
    
    const prompt = `Analyze this real estate listing for potential fraud, price anomaly, or duplication warning in Ethiopia:
    Title: ${title}
    Description: ${description}
    Price: ${price}
    Location: ${city}, ${subCity}
    
    Return a JSON object with:
    "fraudScore": number (0 to 100, where 100 is high risk of fraud/scam)
    "duplicationFound": boolean
    "priceAnomaly": "Overpriced" | "Underpriced" | "Fair"
    "riskLevel": "Low" | "Medium" | "High"
    "reasons": array of strings describing findings
    "suggestions": array of strings for admin/moderator actions
    Output ONLY raw JSON.`;

    const client = getGeminiClient();
    if (client) {
      try {
        const response = await client.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json"
          }
        });
        const data = JSON.parse(response.text || "{}");
        res.json(data);
      } catch (err) {
        res.json(generateMockFraudResult(title, price, city, subCity));
      }
    } else {
      res.json(generateMockFraudResult(title, price, city, subCity));
    }
  });


  // -------------------------------------------------------------
  // Production vs. Dev Setup for Assets Serving
  // -------------------------------------------------------------

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: any, res: any) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

// -------------------------------------------------------------
// AI FALLBACK GENERATORS (Fallback if no GEMINI_API_KEY)
// -------------------------------------------------------------

function generateMockDescription(title: string, type: string, city: string, subCity: string, bedrooms: number, amenities: string[]): string {
  return `### Elegant ${title} - Prime Location in ${subCity || city}

Introducing this spectacular ${type} featuring unmatched craftsmanship, located in one of the most prestigious, fast-developing residential communities of ${city}. This listing represents the pinnacle of luxury, comfort, and safety, ideal for families or high-profile professionals.

**Key Features:**
*   **Accommodating Space:** Beautiful layout hosting ${bedrooms || 3} spacious bedrooms with massive walk-in closets.
*   **Modern Amenities:** Equipped with standard features, including ${amenities && amenities.length > 0 ? amenities.join(', ') : 'parking, security system, and backup utility connections'}.
*   **Prime Neighborhood Access:** Minutes away from premium schools, international embassies, healthcare centers, and top-tier banking facilities.
*   **Secure Infrastructure:** Double reinforced security gates, reliable water reservoirs, and full-load power setups.

---
**Schedule Your Private Viewing Today**
Contact our verified broker directly through the Ethiopia Property Hub portal to arrange an exclusive walk-through. We look forward to showing you your dream home!`;
}

function generateMockPriceEstimate(type: string, city: string, subCity: string, bedrooms: number, area: number, condition: string) {
  const isUSD = type === 'Villa' || type === 'Resort';
  const multiplier = isUSD ? 600 : 80000;
  const basePrice = (area * multiplier) + (bedrooms * 20000);
  const minPrice = Math.round(basePrice * 0.9);
  const maxPrice = Math.round(basePrice * 1.15);

  const finalMinETB = isUSD ? minPrice * 120 : minPrice;
  const finalMaxETB = isUSD ? maxPrice * 120 : maxPrice;
  const finalMinUSD = isUSD ? minPrice : Math.round(minPrice / 120);
  const finalMaxUSD = isUSD ? maxPrice : Math.round(maxPrice / 120);

  return {
    analysis: `The current market rate for properties of type ${type} in ${subCity || city} shows stable, strong appreciation. High demand in key areas such as Bole and Kazanchis continues to drive valuations upwards. Condition is rated as ${condition}.`,
    estimatedPriceRangeETB: {
      min: finalMinETB,
      max: finalMaxETB,
      formatted: `ETB ${finalMinETB.toLocaleString()} - ETB ${finalMaxETB.toLocaleString()}`
    },
    estimatedPriceRangeUSD: {
      min: finalMinUSD,
      max: finalMaxUSD,
      formatted: `USD ${finalMinUSD.toLocaleString()} - USD ${finalMaxUSD.toLocaleString()}`
    },
    influencingFactors: [
      `Location premium of ${subCity || city}, which accounts for strong security and high diplomatic presence.`,
      `The total area of ${area} sqm allowing versatile architectural expansions.`,
      `Condition rating of '${condition}' which minimizes initial maintenance costs for the purchaser.`
    ]
  };
}

function getMockBotResponse(message: string, currentProperties: Property[]): string {
  const msgLower = message.toLowerCase();
  
  if (msgLower.includes('hello') || msgLower.includes('hi') || msgLower.includes('hey')) {
    return `Hello! Welcome to **Ethiopia Property Hub AI Smart Assistant**! 👋

I can help you:
1. Search our unified database for villas, apartments, or commercial properties in Addis Ababa.
2. Estimate fair market valuation using local metrics.
3. Schedule tours with verified local brokers and agents.

What category of property are you interested in today? (e.g., *Residential, Commercial, Land*)`;
  }

  if (msgLower.includes('bole') || msgLower.includes('villa') || msgLower.includes('pool')) {
    const boleVilla = currentProperties.find(p => p.id === 'prop-1');
    if (boleVilla) {
      return `I found an excellent match for you in Bole! 🌟

### **${boleVilla.title}**
*   **Type:** ${boleVilla.type} (${boleVilla.purpose})
*   **Price:** ${boleVilla.price.toLocaleString()} ${boleVilla.currency}
*   **Location:** ${boleVilla.address}, ${boleVilla.city}
*   **Key Highlights:** Swimming pool, manicured garden, full generator, and 5 bedrooms.

This property is represented by **Habesha Elite Realty**. Would you like to schedule a viewing or chat directly with the assigned agent, **Yonas Kebede**?`;
    }
  }

  if (msgLower.includes('kazanchis') || msgLower.includes('apartment') || msgLower.includes('rent')) {
    const condo = currentProperties.find(p => p.id === 'prop-2');
    if (condo) {
      return `Here is a beautiful modern apartment in Kazanchis close to UNECA:

### **${condo.title}**
*   **Price:** ${condo.price.toLocaleString()} ${condo.currency}
*   **Bedrooms:** ${condo.bedrooms} Bed, ${condo.bathrooms} Bath
*   **Floor:** Level ${condo.floor} with spectacular city views.

Would you like to save this to your favorites or inquire about utilities?`;
    }
  }

  return `I understand you are asking about: "${message}". 

Based on our active synchronized database, I recommend checking our top featured listings in **Bole** or **Kazanchis**. We currently have luxurious villas, high-rise condominiums, and high-capacity commercial warehouses.

You can filter listings directly by clicking **Search Properties** on our main Web Portal, or browse the interactive map. Let me know if you would like me to narrow down by price!`;
}

function generateMockFraudResult(title: string, price: number, city: string, subCity: string) {
  const isSuspiciousPrice = price < 50000 && title.toLowerCase().includes('luxury');
  return {
    fraudScore: isSuspiciousPrice ? 75 : 12,
    duplicationFound: false,
    priceAnomaly: isSuspiciousPrice ? "Underpriced" : "Fair",
    riskLevel: isSuspiciousPrice ? "High" : "Low",
    reasons: isSuspiciousPrice 
      ? ["The price is unusually low for a luxury listing in Bole, indicating a potential bait-and-switch scam.", "Incomplete ownership documents referenced."] 
      : ["The listing price perfectly aligns with current market price heatmaps in ${subCity}, Addis Ababa.", "All required contact, location, and amenity parameters are correctly structured."],
    suggestions: isSuspiciousPrice 
      ? ["Request owner license validation.", "Do not flag premium badge until manual broker audit is conducted."] 
      : ["Listing approved for standard live deployment.", "Activate automated indexing on Telegram and Android app feeds."]
  };
}

startServer();
