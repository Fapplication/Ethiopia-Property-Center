import { db } from './index.ts';
import { brokers, agents, properties, inquiries, appointments, chatMessages, subscriptions, appSettings, auditLogs } from './schema.ts';
import { INITIAL_BROKERS, INITIAL_AGENTS, INITIAL_PROPERTIES, INITIAL_INQUIRIES, INITIAL_APPOINTMENTS, INITIAL_MESSAGES } from '../data.ts';

export async function seedDatabaseIfEmpty() {
  try {
    console.log("Checking if database needs seeding...");

    // 1. Seed Brokers
    const existingBrokers = await db.select().from(brokers);
    if (existingBrokers.length === 0) {
      console.log("Seeding brokers...");
      await db.insert(brokers).values(INITIAL_BROKERS.map(b => ({
        id: b.id,
        companyName: b.companyName,
        logo: b.logo,
        address: b.address,
        phone: b.phone,
        email: b.email,
        website: b.website,
        licenseNumber: b.licenseNumber,
        password: b.password || 'password',
        rating: b.rating,
        reviewsCount: b.reviewsCount,
        status: b.status,
      })));
    }

    // 2. Seed Agents
    const existingAgents = await db.select().from(agents);
    if (existingAgents.length === 0) {
      console.log("Seeding agents...");
      await db.insert(agents).values(INITIAL_AGENTS.map(a => ({
        id: a.id,
        name: a.name,
        avatar: a.avatar,
        phone: a.phone,
        email: a.email,
        brokerId: a.brokerId,
        status: a.status,
      })));
    }

    // 3. Seed Properties
    const existingProperties = await db.select().from(properties);
    if (existingProperties.length === 0) {
      console.log("Seeding properties...");
      await db.insert(properties).values(INITIAL_PROPERTIES.map(p => ({
        id: p.id,
        title: p.title,
        description: p.description,
        price: p.price,
        currency: p.currency,
        type: p.type,
        category: p.category,
        purpose: p.purpose,
        bedrooms: p.bedrooms,
        bathrooms: p.bathrooms,
        garage: p.garage,
        kitchen: p.kitchen,
        livingRooms: p.livingRooms,
        balcony: p.balcony,
        area: p.area,
        floor: p.floor,
        buildingAge: p.buildingAge,
        latitude: p.latitude,
        longitude: p.longitude,
        address: p.address,
        region: p.region,
        city: p.city,
        subCity: p.subCity,
        woreda: p.woreda,
        nearbySchools: p.nearbySchools,
        nearbyHospitals: p.nearbyHospitals,
        nearbyBanks: p.nearbyBanks,
        nearbyRoads: p.nearbyRoads,
        water: p.water,
        electricity: p.electricity,
        internet: p.internet,
        parking: p.parking,
        security: p.security,
        furnished: p.furnished,
        swimmingPool: p.swimmingPool,
        garden: p.garden,
        videoTour: p.videoTour,
        virtualTour360: p.virtualTour360,
        ownershipStatus: p.ownershipStatus,
        propertyCondition: p.propertyCondition,
        images: p.images,
        documents: p.documents || [],
        status: p.status,
        brokerId: p.brokerId,
        agentId: p.agentId,
        ownerId: p.ownerId,
        isPremium: p.isPremium,
        isFeatured: p.isFeatured,
        createdAt: p.createdAt ? new Date(p.createdAt) : undefined,
      })));
    }

    // 4. Seed Inquiries
    const existingInquiries = await db.select().from(inquiries);
    if (existingInquiries.length === 0) {
      console.log("Seeding inquiries...");
      await db.insert(inquiries).values(INITIAL_INQUIRIES.map(i => ({
        id: i.id,
        propertyId: i.propertyId,
        propertyTitle: i.propertyTitle,
        customerName: i.customerName,
        customerEmail: i.customerEmail,
        customerPhone: i.customerPhone,
        message: i.message,
        method: i.method,
        status: i.status,
        brokerId: i.brokerId,
        agentId: i.agentId,
        createdAt: i.createdAt ? new Date(i.createdAt) : undefined,
      })));
    }

    // 5. Seed Appointments
    const existingAppointments = await db.select().from(appointments);
    if (existingAppointments.length === 0) {
      console.log("Seeding appointments...");
      await db.insert(appointments).values(INITIAL_APPOINTMENTS.map(a => ({
        id: a.id,
        propertyId: a.propertyId,
        propertyTitle: a.propertyTitle,
        customerId: a.customerId,
        customerName: a.customerName,
        customerPhone: a.customerPhone,
        date: a.date,
        time: a.time,
        status: a.status,
        brokerId: a.brokerId,
        agentId: a.agentId,
        createdAt: a.createdAt ? new Date(a.createdAt) : undefined,
      })));
    }

    // 6. Seed Chat Messages
    const existingMessages = await db.select().from(chatMessages);
    if (existingMessages.length === 0) {
      console.log("Seeding chat messages...");
      await db.insert(chatMessages).values(INITIAL_MESSAGES.map(m => ({
        id: m.id,
        channelId: m.channelId,
        senderId: m.senderId,
        senderName: m.senderName,
        text: m.text,
        timestamp: m.timestamp ? new Date(m.timestamp) : undefined,
        imageUrl: m.imageUrl,
        location: m.location,
        read: m.read || false,
      })));
    }

    // 7. Seed Settings
    const existingSettings = await db.select().from(appSettings);
    if (existingSettings.length === 0) {
      console.log("Seeding app settings...");
      await db.insert(appSettings).values({
        telegramBotActive: true,
        androidMaintenanceMode: false,
        pushNotificationsCount: 148,
        approvedAdsCount: 5,
      });
    }

    // 8. Seed Audit Logs
    const existingLogs = await db.select().from(auditLogs);
    if (existingLogs.length === 0) {
      console.log("Seeding audit logs...");
      await db.insert(auditLogs).values([
        {
          id: 'log-1',
          action: 'SYSTEM_BOOT',
          details: 'Ethiopia Property Hub server started and successfully synchronized with Cloud SQL database.',
          timestamp: new Date(),
          user: 'System',
        },
        {
          id: 'log-2',
          action: 'DB_SEED',
          details: 'PostgreSQL database seeded with 6 initial prime Ethiopian listings and verified broker profiles.',
          timestamp: new Date(),
          user: 'System',
        }
      ]);
    }

    console.log("Database verification and seeding completed successfully!");
  } catch (error) {
    console.error("Failed to seed database:", error);
  }
}
