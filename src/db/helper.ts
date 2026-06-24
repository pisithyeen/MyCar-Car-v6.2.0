import { db } from './index.ts';
import { eq, and } from 'drizzle-orm';
import { 
  users, 
  vehicles, 
  maintenanceRecords, 
  garages, 
  reminders, 
  expenses, 
  attachedDocuments, 
  notificationLogs, 
  forumPosts, 
  forumComments, 
  partListings, 
  partOffers, 
  partReports 
} from './schema.ts';
import { 
  UserProfile, 
  VehicleProfile, 
  MaintenanceRecord, 
  GaragePartner, 
  SmartReminder, 
  VehicleExpense, 
  AttachedDocument, 
  NotificationLog, 
  ForumPost, 
  ForumComment, 
  PartListing, 
  PartOffer, 
  PartReport 
} from '../types.ts';

function isDbAvailable(): boolean {
  return typeof process !== 'undefined' && !!process.env.SQL_HOST;
}

// Helper to seed initial data if database is dry
export async function seedInitialDataOnlyIfDry() {
  if (!isDbAvailable()) {
    console.log("[SQL Seed] SQL_HOST is not set. Bypassing SQL Database seeding.");
    return;
  }
  try {
    const existingUsers = await db.select().from(users).limit(1);
    if (existingUsers.length > 0) {
      console.log("[SQL Seed] Database already seeded. Skipping initial seed.");
      return;
    }

    console.log("[SQL Seed] Seeding initial regulatory users and assets...");
    
    // Seed Users
    const initialUsers = [
      {
        uid: "user-owner-1",
        name: "Yeon Pisith",
        email: "pisith.yeen@gmail.com",
        phone: "+855 12 345 678",
        role: "Vehicle Owner",
        location: "Phnom Penh",
        status: "Approved"
      },
      {
        uid: "user-owner-2",
        name: "Chan Rotha",
        email: "rotha@mycar.com.kh",
        phone: "+855 12 555 901",
        role: "Vehicle Owner",
        location: "Phnom Penh",
        status: "Approved"
      },
      {
        uid: "user-garage-1",
        name: "Chan Kiri",
        email: "kiri@angkor-repair.kh",
        phone: "+855 15 999 888",
        role: "Garage Owner",
        location: "Siem Reap",
        status: "Approved",
        businessName: "Angkor Speed Auto Repair",
        licenseNumber: "Co-8271/2026-KH"
      },
      {
        uid: "user-petrol-1",
        name: "Sothy Leakhena",
        email: "leakhena@total-sothearos.kh",
        phone: "+855 11 112 233",
        role: "Petrol Station Partner",
        location: "Phnom Penh",
        status: "Approved",
        businessName: "TotalEnergies Sothearos Blvd",
        licenseNumber: "Co-6211/2026-KH"
      },
      {
        uid: "user-parts-1",
        name: "Preap Norith",
        email: "norith@toyota-parts.kh",
        phone: "+855 12 777 666",
        role: "Spare Part Shop",
        location: "Sihanoukville",
        status: "Approved",
        businessName: "Sihanoukville Toyota Parts",
        licenseNumber: "Co-1934/2026-KH"
      },
      {
        uid: "user-freelance-1",
        name: "Sokna Highway Helper",
        email: "highway@roadside.kh",
        phone: "+855 93 456 789",
        role: "Freelance Mechanic",
        location: "Battambang",
        status: "Approved",
        businessName: "Sokna Express Towing",
        licenseNumber: "Co-4188/2026-KH"
      },
      {
        uid: "user-admin-1",
        name: "Platform Administrator",
        email: "admin@mycar.com.kh",
        phone: "+855 23 888 888",
        role: "Admin",
        location: "Phnom Penh",
        status: "Approved"
      }
    ];

    for (const u of initialUsers) {
      await db.insert(users).values(u);
    }

    // Seed Garages (PP Map search)
    const initialGarages = [
      {
        id: "g1",
        name: "Sokha Auto Garage",
        type: "Garage / Repair Shop",
        rating: 4.8,
        reviewsCount: 124,
        address: "#45, St 143, Boeung Keng Kang 3, Phnom Penh",
        phone: "+855 23 888 123",
        lat: 11.5512,
        lng: 104.9189,
        imageUrl: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=400",
        description: "Premium full-service garage specializing in diagnostics, suspension repair, and fluid changes for premium trucks and family SUVs.",
        isPartner: true
      },
      {
        id: "g2",
        name: "EV & Hybrid Care Center",
        type: "Garage / Repair Shop",
        rating: 4.9,
        reviewsCount: 42,
        address: "#22, Preah Sihanouk Blvd, Tonle Bassac, Phnom Penh",
        phone: "+855 23 999 456",
        lat: 11.5592,
        lng: 104.9254,
        imageUrl: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=400",
        description: "The capital's central EV & Hybrid service center featuring state-of-the-art fast diagnostic feeds and battery diagnostics.",
        isPartner: true
      },
      {
        id: "g3",
        name: "Phnom Penh Diesel Garage",
        type: "Garage / Repair Shop",
        rating: 4.7,
        reviewsCount: 98,
        address: "#89, Cambodian Federation Blvd, Tuol Kork, Phnom Penh",
        phone: "+855 12 555 789",
        lat: 11.5678,
        lng: 104.8992,
        imageUrl: "https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&q=80&w=400",
        description: "Specialized diesel engines maintenance clinic focusing on injectors calibration and high mileage commercial trucks.",
        isPartner: true
      },
      {
        id: "g4",
        name: "VIP Car Detail & Ceramic Coating",
        type: "Car Wash",
        rating: 4.6,
        reviewsCount: 150,
        address: "St 217 (Veng Sreng Blvd), Sen Sok, Phnom Penh",
        phone: "+855 88 777 665",
        lat: 11.5421,
        lng: 104.8698,
        imageUrl: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&q=80&w=400",
        description: "Full service active foam body washes, mud guard cleaning, paint corrections, and dust barrier ceramic coating.",
        isPartner: false
      },
      {
        id: "g5",
        name: "Mekong Lube, Express Oil & Petrol",
        type: "Petrol Station / Partner",
        rating: 4.5,
        reviewsCount: 80,
        address: "#102, National Road 1, Chbar Ampov, Phnom Penh",
        phone: "+855 92 444 111",
        lat: 11.5305,
        lng: 104.9525,
        imageUrl: "https://images.unsplash.com/photo-1527018601619-a508a2be00cd?auto=format&fit=crop&q=80&w=400",
        description: "Rapid express drive-thru bay providing lubricant filter changes, battery tests and fresh air filters on the go.",
        isPartner: true
      }
    ];

    for (const g of initialGarages) {
      await db.insert(garages).values(g);
    }

    // Seed Vehicles
    const initialVehicles = [
      {
        id: "v1",
        ownerUid: "user-owner-1",
        brand: "Toyota",
        model: "Tacoma 2006",
        year: 2006,
        mileage: 186500,
        fuelType: "Gasoline",
        plateNumber: "2AB-4589",
        chassisNumber: "JT2BF1FK6FC112233",
        notes: "A reliable daily pickup. Serves as the primary transport vehicle for high clearance province trips."
      },
      {
        id: "v2",
        ownerUid: "user-owner-1",
        brand: "BYD",
        model: "Shark 2025",
        year: 2025,
        mileage: 12800,
        fuelType: "Hybrid",
        plateNumber: "2CD-8899",
        chassisNumber: "BYDSHARK2025PHEV99",
        notes: "Cutting-edge plug-in hybrid pickup truck."
      },
      {
        id: "v3",
        ownerUid: "user-owner-2",
        brand: "Toyota",
        model: "Prius 2010",
        year: 2010,
        mileage: 211500,
        fuelType: "Hybrid",
        plateNumber: "2AF-1234",
        chassisNumber: "JTDKN3DU8A1234567",
        notes: "Phnom Penh workhorse taxi car, hybrid battery cells checked."
      }
    ];

    for (const v of initialVehicles) {
      await db.insert(vehicles).values(v);
    }

    // Seed Maintenance Records
    const initialRecords = [
      {
        id: "m1",
        vehicleId: "v1",
        serviceCategory: "Engine Oil Service",
        description: "Exchanged 5W-30 synthetic lubricant and secondary engine filters.",
        cost: 45,
        mileage: 180500,
        date: "2026-05-15",
        provider: "Sokha Auto Garage"
      },
      {
        id: "m2",
        vehicleId: "v1",
        serviceCategory: "Brake Fluid Inspection",
        description: "Cleaned caliper pins and pads, flushed DOT4 fluid entirely.",
        cost: 35,
        mileage: 178500,
        date: "2026-04-10",
        provider: "Apsara Auto Repair"
      },
      {
        id: "m3",
        vehicleId: "v3",
        serviceCategory: "Hybrid Battery Fan & Duct Lint Clean",
        description: "Primary battery cells scanned. Clear clean fan flow filter installed.",
        cost: 25,
        mileage: 210000,
        date: "2026-05-20",
        provider: "EV & Hybrid Care Center"
      }
    ];

    for (const r of initialRecords) {
      await db.insert(maintenanceRecords).values(r);
    }

    // Seed Spare Part Listings
    const initialListings = [
      {
        id: "part-1",
        title: "Genuine Toyota Tacoma (2005-2015) Front Brake Rotors - Set of 2",
        description: "Brand new, OEM front disc brake rotors sitting in original box packaging. Perfect replacement to solve pedal shaking.",
        postType: "Sell",
        category: "Brake system",
        vehicleBrand: "Toyota",
        vehicleModel: "Tacoma",
        yearRange: "2005-2015",
        engineType: "2.7L / 4.0L V6",
        partNumber: "43512-04020",
        condition: "New",
        price: 90,
        negotiable: true,
        location: "Phnom Penh",
        contactName: "Norith Parts Co",
        contactPhone: "+855 12 777 666",
        contactTelegram: "@norith_toyota",
        sellerType: "Merchant",
        verifiedSeller: true,
        availabilityStatus: "In Stock",
        status: "Active",
        views: 42,
        offerCount: 1,
        createdAt: new Date().toISOString(),
        isBoosted: true
      },
      {
        id: "part-2",
        title: "Prius 2010 Auxiliary Battery Cell - Donation",
        description: "Functioning battery cell 7.6V. Free for student hobbyists or needy owners.",
        postType: "Donate",
        category: "EV battery / EV parts",
        vehicleBrand: "Toyota",
        vehicleModel: "Prius",
        yearRange: "2010-2015",
        engineType: "1.8L Hybrid",
        partNumber: "NP2-Modules",
        condition: "Used",
        price: 0,
        negotiable: false,
        donationOption: true,
        exchangeOption: false,
        location: "Phnom Penh",
        contactName: "Sokna Highway Helper",
        contactPhone: "+855 93 456 789",
        sellerType: "Owner",
        verifiedSeller: false,
        availabilityStatus: "In Stock",
        status: "Active",
        views: 128,
        offerCount: 0,
        createdAt: new Date().toISOString(),
        isBoosted: false
      }
    ];

    for (const l of initialListings) {
      await db.insert(partListings).values(l);
    }

    console.log("[SQL Seed] Seeding finalized successfully.");
  } catch (error) {
    console.error("[SQL Seed] Error during seed sequence:", error);
  }
}

// User Actions
export async function getUserByUid(uid: string) {
  if (!isDbAvailable()) return null;
  const result = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
  return result[0] || null;
}

export async function getUserByEmail(email: string) {
  if (!isDbAvailable()) return null;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0] || null;
}

export async function upsertUserProfile(profile: any) {
  if (!isDbAvailable()) return profile;
  // If email already exists, update their details, otherwise insert
  const existing = await getUserByEmail(profile.email);
  if (existing) {
    await db.update(users)
      .set({
        name: profile.name,
        phone: profile.phone || existing.phone,
        role: profile.role || existing.role,
        location: profile.location || existing.location,
        status: profile.status || existing.status,
        businessName: profile.businessName || existing.businessName,
        licenseNumber: profile.licenseNumber || existing.licenseNumber,
      })
      .where(eq(users.email, profile.email));
    return await getUserByEmail(profile.email);
  } else {
    const uid = profile.uid || `user-${Date.now()}`;
    await db.insert(users).values({
      uid: uid,
      name: profile.name,
      email: profile.email,
      phone: profile.phone || '',
      role: profile.role || 'Vehicle Owner',
      location: profile.location || 'Phnom Penh',
      status: profile.status || 'Approved',
      businessName: profile.businessName || null,
      licenseNumber: profile.licenseNumber || null,
    });
    return await getUserByUid(uid);
  }
}

export async function getAllUsers() {
  if (!isDbAvailable()) return [];
  return await db.select().from(users);
}

// Vehicle Actions
export async function getVehiclesByOwner(ownerUid: string) {
  if (!isDbAvailable()) return [];
  return await db.select().from(vehicles).where(eq(vehicles.ownerUid, ownerUid));
}

export async function getAllVehicles() {
  if (!isDbAvailable()) return [];
  return await db.select().from(vehicles);
}

export async function insertVehicle(v: any) {
  if (!isDbAvailable()) return v;
  await db.insert(vehicles).values({
    id: v.id,
    ownerUid: v.ownerUid,
    brand: v.brand,
    model: v.model,
    year: parseInt(v.year.toString()) || 2010,
    mileage: parseInt(v.mileage.toString()) || 100000,
    fuelType: v.fuelType || 'Gasoline',
    plateNumber: v.plateNumber || '',
    chassisNumber: v.chassisNumber || '',
    notes: v.notes || '',
    engineType: v.engineType || '',
    transmission: v.transmission || '',
    vehicleType: v.vehicleType || '',
  });
  return v;
}

// Maintenance Records
export async function getMaintenanceByVehicle(vehicleId: string) {
  if (!isDbAvailable()) return [];
  return await db.select().from(maintenanceRecords).where(eq(maintenanceRecords.vehicleId, vehicleId));
}

export async function getMaintenanceAll() {
  if (!isDbAvailable()) return [];
  return await db.select().from(maintenanceRecords);
}

export async function insertMaintenance(r: any) {
  if (!isDbAvailable()) return r;
  await db.insert(maintenanceRecords).values({
    id: r.id,
    vehicleId: r.vehicleId,
    serviceCategory: r.serviceCategory,
    description: r.description || '',
    cost: parseInt(r.cost.toString()) || 0,
    mileage: parseInt(r.mileage.toString()) || 0,
    date: r.date,
    provider: r.provider,
  });
  
  // also automatically sync/update the vehicle odometer mileage
  await db.update(vehicles)
    .set({ mileage: parseInt(r.mileage.toString()) })
    .where(eq(vehicles.id, r.vehicleId));

  return r;
}

// Garages
export async function getAllGarages() {
  if (!isDbAvailable()) return [];
  return await db.select().from(garages);
}

// Reminders
export async function getRemindersByVehicle(vehicleId: string) {
  if (!isDbAvailable()) return [];
  return await db.select().from(reminders).where(eq(reminders.vehicleId, vehicleId));
}

export async function insertReminder(rem: any) {
  if (!isDbAvailable()) return;
  await db.insert(reminders).values({
    id: rem.id,
    vehicleId: rem.vehicleId,
    service: rem.service,
    title: rem.title || '',
    category: rem.category || '',
    reminderType: rem.reminderType || 'date_based',
    status: rem.status || 'Good',
    reason: rem.reason || '',
    action: rem.action || '',
    priority: rem.priority || 'Medium',
    dueDate: rem.dueDate || null,
    dueMileage: rem.dueMileage ? parseInt(rem.dueMileage.toString()) : null,
  });
}

// Expenses
export async function getExpensesByVehicle(vehicleId: string) {
  if (!isDbAvailable()) return [];
  return await db.select().from(expenses).where(eq(expenses.vehicleId, vehicleId));
}

export async function insertExpense(exp: any) {
  if (!isDbAvailable()) return;
  await db.insert(expenses).values({
    id: exp.id,
    vehicleId: exp.vehicleId,
    category: exp.category,
    amount: parseInt(exp.amount.toString()) || 0,
    date: exp.date,
    mileage: parseInt(exp.mileage.toString()) || 0,
    provider: exp.provider || '',
    paymentMethod: exp.paymentMethod || 'ABA Pay',
    notes: exp.notes || '',
  });
}

// Attached Documents
export async function getDocumentsByVehicle(vehicleId: string) {
  if (!isDbAvailable()) return [];
  return await db.select().from(attachedDocuments).where(eq(attachedDocuments.vehicleId, vehicleId));
}

export async function insertDocument(doc: any) {
  if (!isDbAvailable()) return;
  await db.insert(attachedDocuments).values({
    id: doc.id,
    vehicleId: doc.vehicleId,
    category: doc.category,
    title: doc.title,
    fileName: doc.fileName,
    fileSize: doc.fileSize || '',
    uploadDate: doc.uploadDate,
    fileUrl: doc.fileUrl || '',
  });
}

// Notifications
export async function getNotificationsByVehicle(vehicleId: string) {
  if (!isDbAvailable()) return [];
  return await db.select().from(notificationLogs).where(eq(notificationLogs.vehicleId, vehicleId));
}

export async function markNotificationsRead(vehicleId: string) {
  if (!isDbAvailable()) return;
  await db.update(notificationLogs)
    .set({ status: 'read' })
    .where(eq(notificationLogs.vehicleId, vehicleId));
}

export async function insertNotification(n: any) {
  if (!isDbAvailable()) return;
  await db.insert(notificationLogs).values({
    id: n.id,
    vehicleId: n.vehicleId || null,
    reminderId: n.reminderId || null,
    title: n.title,
    message: n.message,
    channel: n.channel || 'In-App',
    status: n.status || 'unread',
    sentAt: n.sentAt || new Date().toISOString(),
  });
}

// Help Forums
export async function getForumPostsWithComments() {
  if (!isDbAvailable()) return [];
  const posts = await db.select().from(forumPosts);
  const result: any[] = [];
  for (const post of posts) {
    const comments = await db.select().from(forumComments).where(eq(forumComments.postId, post.id));
    result.push({
      ...post,
      comments: comments
    });
  }
  return result;
}

export async function insertForumPost(post: any) {
  if (!isDbAvailable()) return;
  await db.insert(forumPosts).values({
    id: post.id,
    title: post.title,
    description: post.description,
    vehicleBrand: post.vehicleBrand,
    vehicleModel: post.vehicleModel,
    vehicleYear: parseInt(post.vehicleYear.toString()) || 2010,
    category: post.category,
    location: post.location,
    urgency: post.urgency || 'Medium',
    photoUrl: post.photoUrl || '',
    needMechanic: !!post.needMechanic,
    needRecommendation: !!post.needRecommendation,
    needSparePart: !!post.needSparePart,
    budget: post.budget || '',
    preferredDate: post.preferredDate || '',
    visibility: post.visibility || 'Public',
    status: post.status || 'Open',
    authorUid: post.authorUid || 'user-owner-1',
    authorName: post.authorName,
    authorRole: post.authorRole || 'Vehicle Owner',
    createdAt: post.createdAt || new Date().toISOString(),
    upvotes: parseInt(post.upvotes?.toString() || '0'),
  });
}

export async function insertForumComment(comment: any) {
  if (!isDbAvailable()) return;
  await db.insert(forumComments).values({
    id: comment.id,
    postId: comment.postId,
    authorUid: comment.authorUid || 'user-garage-1',
    authorName: comment.authorName,
    authorRole: comment.authorRole || 'Verified Garage',
    authorBadge: comment.authorBadge || '',
    content: comment.content,
    timestamp: comment.timestamp || new Date().toISOString(),
    upvotes: parseInt(comment.upvotes?.toString() || '0'),
    commentType: comment.commentType || 'General',
    partName: comment.partName || null,
    partCondition: comment.partCondition || null,
    partCompatibility: comment.partCompatibility || null,
    price: comment.price ? parseInt(comment.price.toString()) : null,
    deliveryTime: comment.deliveryTime || null,
    warranty: comment.warranty || null,
    supplierContact: comment.supplierContact || null,
  });
}

// Spare Parts Listings
export async function getPartListings() {
  if (!isDbAvailable()) return [];
  return await db.select().from(partListings);
}

export async function insertPartListing(l: any) {
  if (!isDbAvailable()) return;
  await db.insert(partListings).values({
    id: l.id,
    title: l.title,
    description: l.description,
    postType: l.postType,
    category: l.category,
    vehicleBrand: l.vehicleBrand,
    vehicleModel: l.vehicleModel,
    yearRange: l.yearRange,
    engineType: l.engineType || '',
    partNumber: l.partNumber || '',
    condition: l.condition,
    price: l.price ? parseInt(l.price.toString()) : null,
    negotiable: !!l.negotiable,
    donationOption: !!l.donationOption,
    exchangeOption: !!l.exchangeOption,
    exchangeDetails: l.exchangeDetails || '',
    location: l.location,
    contactName: l.contactName,
    contactPhone: l.contactPhone,
    contactTelegram: l.contactTelegram || '',
    sellerType: l.sellerType || 'Owner',
    verifiedSeller: !!l.verifiedSeller,
    availabilityStatus: l.availabilityStatus || 'In Stock',
    status: l.status || 'Active',
    views: parseInt(l.views?.toString() || '0'),
    offerCount: parseInt(l.offerCount?.toString() || '0'),
    createdAt: l.createdAt || new Date().toISOString(),
    isBoosted: !!l.isBoosted,
  });
}

export async function insertPartOffer(o: any) {
  if (!isDbAvailable()) return;
  await db.insert(partOffers).values({
    id: o.id,
    listingId: o.listingId,
    listingTitle: o.listingTitle,
    offerType: o.offerType,
    amount: o.amount ? parseInt(o.amount.toString()) : null,
    exchangeDetails: o.exchangeDetails || null,
    contactName: o.contactName,
    contactPhone: o.contactPhone,
    contactTelegram: o.contactTelegram || null,
    notes: o.notes || null,
    status: o.status || 'Pending',
    createdAt: o.createdAt || new Date().toISOString(),
  });
}

export async function insertPartReport(r: any) {
  if (!isDbAvailable()) return;
  await db.insert(partReports).values({
    id: r.id,
    listingId: r.listingId,
    listingTitle: r.listingTitle,
    reason: r.reason,
    reporterName: r.reporterName,
    reporterPhone: r.reporterPhone,
    comments: r.comments || '',
    status: r.status || 'Pending',
    createdAt: r.createdAt || new Date().toISOString(),
  });
}
