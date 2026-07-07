import { integer, pgTable, serial, text, timestamp, boolean, real } from 'drizzle-orm/pg-core';

// 1. Users Table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').default(''),
  role: text('role').notNull(), // 'Vehicle Owner' | 'Garage Owner' | etc.
  location: text('location').default('Phnom Penh'),
  status: text('status').default('Approved'), // 'Pending' | 'Approved' | 'Suspended'
  businessName: text('business_name'),
  licenseNumber: text('license_number'),
  
  // Subscription parameters for MyCar Care KH MVP
  subscriptionTier: text('subscription_tier').default('Free'), // 'Free' | 'Home' | 'Pro' | 'Enterprise'
  subscriptionStatus: text('subscription_status').default('active'), // 'active' | 'canceled' | 'past_due'
  subscriptionExpiry: text('subscription_expiry').default(''), // YYYY-MM-DD
  aiUsageCount: integer('ai_usage_count').default(0),
  aiUsageLimit: integer('ai_usage_limit').default(3),
  businessSubscriptionTier: text('business_subscription_tier').default('None'), // 'None', 'Garage_Basic', 'Garage_Pro', 'Shop_Basic', 'Shop_Pro' etc.
  verifiedBadge: boolean('verified_badge').default(false),
  boostCredits: integer('boost_credits').default(0),

  createdAt: timestamp('created_at').defaultNow()
});

// 2. Vehicles Table
export const vehicles = pgTable('vehicles', {
  id: text('id').primaryKey(),
  ownerUid: text('owner_uid').references(() => users.uid, { onDelete: 'cascade' }).notNull(),
  brand: text('brand').notNull(),
  model: text('model').notNull(),
  year: integer('year').notNull(),
  mileage: integer('mileage').notNull(),
  fuelType: text('fuel_type').notNull(), // 'Gasoline' | 'Diesel' | 'EV' | 'Hybrid'
  plateNumber: text('plate_number').default(''),
  chassisNumber: text('chassis_number').default(''),
  notes: text('notes').default(''),
  engineType: text('engine_type').default(''),
  transmission: text('transmission').default(''),
  vehicleType: text('vehicle_type').default(''),
  createdAt: timestamp('created_at').defaultNow()
});

// 3. Maintenance Records Table
export const maintenanceRecords = pgTable('maintenance_records', {
  id: text('id').primaryKey(),
  vehicleId: text('vehicle_id').references(() => vehicles.id, { onDelete: 'cascade' }).notNull(),
  serviceCategory: text('service_category').notNull(),
  description: text('description').default(''),
  cost: integer('cost').notNull(), // standard integer/num
  mileage: integer('mileage').notNull(),
  date: text('date').notNull(), // YYYY-MM-DD
  provider: text('provider').notNull(),
  createdAt: timestamp('created_at').defaultNow()
});

// 4. Garages Table (Seeded for local Phnom Penh search maps)
export const garages = pgTable('garages', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'Garage / Repair Shop' | 'Car Wash' | 'EV Charging' etc.
  rating: real('rating').default(4.5),
  reviewsCount: integer('reviews_count').default(10),
  address: text('address').notNull(),
  phone: text('phone').notNull(),
  lat: real('lat').notNull(),
  lng: real('lng').notNull(),
  imageUrl: text('image_url').default(''),
  description: text('description').default(''),
  isPartner: boolean('is_partner').default(false),
  createdAt: timestamp('created_at').defaultNow()
});

// 5. Smart Reminders Table
export const reminders = pgTable('reminders', {
  id: text('id').primaryKey(),
  vehicleId: text('vehicle_id').references(() => vehicles.id, { onDelete: 'cascade' }).notNull(),
  service: text('service').notNull(),
  title: text('title').default(''),
  category: text('category').default(''),
  reminderType: text('reminder_type').default('date_based'),
  status: text('status').default('Good'), // 'Due soon' | 'Overdue' | 'Good' | etc.
  reason: text('reason').default(''),
  action: text('action').default(''),
  priority: text('priority').default('Medium'),
  dueDate: text('due_date'), // YYYY-MM-DD
  dueMileage: integer('due_mileage'),
  createdAt: timestamp('created_at').defaultNow()
});

// 6. Expenses Table
export const expenses = pgTable('expenses', {
  id: text('id').primaryKey(),
  vehicleId: text('vehicle_id').references(() => vehicles.id, { onDelete: 'cascade' }).notNull(),
  category: text('category').notNull(),
  amount: integer('amount').notNull(),
  date: text('date').notNull(), // YYYY-MM-DD
  mileage: integer('mileage').notNull(),
  provider: text('provider').default(''),
  paymentMethod: text('payment_method').default('ABA Pay'),
  notes: text('notes').default(''),
  createdAt: timestamp('created_at').defaultNow()
});

// 7. Attached Documents Table
export const attachedDocuments = pgTable('attached_documents', {
  id: text('id').primaryKey(),
  vehicleId: text('vehicle_id').references(() => vehicles.id, { onDelete: 'cascade' }).notNull(),
  category: text('category').notNull(),
  title: text('title').notNull(),
  fileName: text('file_name').notNull(),
  fileSize: text('file_size').default(''),
  uploadDate: text('upload_date').notNull(),
  fileUrl: text('file_url').default(''),
  createdAt: timestamp('created_at').defaultNow()
});

// 8. Notification Logs Table
export const notificationLogs = pgTable('notification_logs', {
  id: text('id').primaryKey(),
  vehicleId: text('vehicle_id'),
  reminderId: text('reminder_id'),
  title: text('title').notNull(),
  message: text('message').notNull(),
  channel: text('channel').default('In-App'),
  status: text('status').default('unread'), // 'read' | 'unread'
  sentAt: text('sent_at').notNull(),
  createdAt: timestamp('created_at').defaultNow()
});

// 9. Forum Posts Table
export const forumPosts = pgTable('forum_posts', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  vehicleBrand: text('vehicle_brand').notNull(),
  vehicleModel: text('vehicle_model').notNull(),
  vehicleYear: integer('vehicle_year').notNull(),
  category: text('category').notNull(),
  location: text('location').notNull(),
  urgency: text('urgency').default('Medium'),
  photoUrl: text('photo_url').default(''),
  needMechanic: boolean('need_mechanic').default(false),
  needRecommendation: boolean('need_recommendation').default(false),
  needSparePart: boolean('need_spare_part').default(false),
  budget: text('budget').default(''),
  preferredDate: text('preferred_date').default(''),
  visibility: text('visibility').default('Public'),
  status: text('status').default('Open'),
  authorUid: text('author_uid').references(() => users.uid, { onDelete: 'cascade' }).notNull(),
  authorName: text('author_name').notNull(),
  authorRole: text('author_role').notNull(),
  createdAt: text('created_at').notNull(),
  upvotes: integer('upvotes').default(0)
});

// 10. Forum Comments Table
export const forumComments = pgTable('forum_comments', {
  id: text('id').primaryKey(),
  postId: text('post_id').references(() => forumPosts.id, { onDelete: 'cascade' }).notNull(),
  authorUid: text('author_uid').references(() => users.uid, { onDelete: 'cascade' }).notNull(),
  authorName: text('author_name').notNull(),
  authorRole: text('author_role').notNull(),
  authorBadge: text('author_badge').default(''),
  content: text('content').notNull(),
  timestamp: text('timestamp').notNull(),
  upvotes: integer('upvotes').default(0),
  commentType: text('comment_type').default('General'), // 'General' | 'Technical Solution' | etc.
  partName: text('part_name'),
  partCondition: text('part_condition'),
  partCompatibility: text('part_compatibility'),
  price: integer('price'), // in USD
  deliveryTime: text('delivery_time'),
  warranty: text('warranty'),
  supplierContact: text('supplier_contact')
});

// 11. Spare Part Listings Table
export const partListings = pgTable('part_listings', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  postType: text('post_type').notNull(), // 'Sell' | 'Donate' | 'Exchange' etc.
  category: text('category').notNull(),
  vehicleBrand: text('vehicle_brand').notNull(),
  vehicleModel: text('vehicle_model').notNull(),
  yearRange: text('year_range').notNull(),
  engineType: text('engine_type').default(''),
  partNumber: text('part_number').default(''),
  condition: text('condition').notNull(), // 'New' | 'Used' | etc.
  price: integer('price'), // USD
  negotiable: boolean('negotiable').default(false),
  donationOption: boolean('donation_option').default(false),
  exchangeOption: boolean('exchange_option').default(false),
  exchangeDetails: text('exchange_details').default(''),
  location: text('location').notNull(),
  contactName: text('contact_name').notNull(),
  contactPhone: text('contact_phone').notNull(),
  contactTelegram: text('contact_telegram').default(''),
  sellerType: text('seller_type').notNull(), // 'Owner' | 'Garage' | etc.
  verifiedSeller: boolean('verified_seller').default(false),
  availabilityStatus: text('availability_status').default('In Stock'),
  status: text('status').default('Active'),
  views: integer('views').default(0),
  offerCount: integer('offer_count').default(0),
  createdAt: text('created_at').notNull(),
  isBoosted: boolean('is_boosted').default(false)
});

// 12. Part Offers Table
export const partOffers = pgTable('part_offers', {
  id: text('id').primaryKey(),
  listingId: text('listing_id').references(() => partListings.id, { onDelete: 'cascade' }).notNull(),
  listingTitle: text('listing_title').notNull(),
  offerType: text('offer_type').notNull(), // 'Buy For Cash' | etc.
  amount: integer('amount'),
  exchangeDetails: text('exchange_details'),
  contactName: text('contact_name').notNull(),
  contactPhone: text('contact_phone').notNull(),
  contactTelegram: text('contact_telegram'),
  notes: text('notes'),
  status: text('status').default('Pending'), // 'Pending' | 'Accepted' | 'Declined'
  createdAt: text('created_at').notNull()
});

// 13. Part Reports Table
export const partReports = pgTable('part_reports', {
  id: text('id').primaryKey(),
  listingId: text('listing_id').references(() => partListings.id, { onDelete: 'cascade' }).notNull(),
  listingTitle: text('listing_title').notNull(),
  reason: text('reason').notNull(),
  reporterName: text('reporter_name').notNull(),
  reporterPhone: text('reporter_phone').notNull(),
  comments: text('comments').default(''),
  status: text('status').default('Pending'), // 'Pending' | 'Reviewed' | 'Dismissed'
  createdAt: text('created_at').notNull()
});

// 14. User Roles Table (supporting multiple roles per account)
export const userRoles = pgTable('user_roles', {
  id: serial('id').primaryKey(),
  userUid: text('user_uid').references(() => users.uid, { onDelete: 'cascade' }).notNull(),
  role: text('role').notNull(), // 'Vehicle Owner' | 'Garage Owner' | 'Spare Parts Shop' | 'Petrol Station' | 'EV Charging Station' | 'Freelancer Mechanic' | 'Staff User' | 'Super Admin'
  createdAt: timestamp('created_at').defaultNow()
});

// 15. Vehicle QR Codes Table
export const vehicleQrCodes = pgTable('vehicle_qr_codes', {
  id: text('id').primaryKey(), // QR secure token / ID
  vehicleId: text('vehicle_id').references(() => vehicles.id, { onDelete: 'cascade' }).notNull(),
  secureToken: text('secure_token').notNull(),
  qrImageBase64: text('qr_image_base64'),
  createdAt: timestamp('created_at').defaultNow()
});

// 16. Service Tickets Table (garage-created logs pending owner approval)
export const serviceTickets = pgTable('service_tickets', {
  id: text('id').primaryKey(),
  vehicleId: text('vehicle_id').references(() => vehicles.id, { onDelete: 'cascade' }).notNull(),
  garageId: text('garage_id').notNull(), // ID of the submitting garage
  garageName: text('garage_name').notNull(),
  serviceDate: text('service_date').notNull(),
  serviceMileage: integer('service_mileage').notNull(),
  serviceType: text('service_type').notNull(),
  description: text('description'),
  partsChanged: text('parts_changed'), // JSON or text listing parts
  laborCost: integer('labor_cost').notNull(),
  partsCost: integer('parts_cost').notNull(),
  totalCost: integer('total_cost').notNull(),
  receiptPhotoUrl: text('receipt_photo_url'),
  status: text('status').default('Pending'), // 'Pending' | 'Approved' | 'Rejected'
  rejectionReason: text('rejection_reason'),
  createdBy: text('created_by').notNull(), // 'owner' | 'garage' | 'mechanic' | 'admin'
  createdAt: timestamp('created_at').defaultNow()
});

// 17. Garage Profiles Table
export const garageProfiles = pgTable('garage_profiles', {
  id: text('id').primaryKey(),
  userUid: text('user_uid').references(() => users.uid, { onDelete: 'cascade' }).notNull(),
  garageName: text('garage_name').notNull(),
  ownerName: text('owner_name').notNull(),
  phone: text('phone').notNull(),
  telegram: text('telegram'),
  address: text('address').notNull(),
  lat: real('lat'),
  lng: real('lng'),
  openingHours: text('opening_hours'),
  servicesOffered: text('services_offered'), // comma-separated values
  businessVerificationDocs: text('business_verification_docs'), // filenames or links
  status: text('status').default('Pending'), // 'Pending' | 'Approved' | 'Suspended'
  createdAt: timestamp('created_at').defaultNow()
});

// 18. Garage Staff Table
export const garageStaff = pgTable('garage_staff', {
  id: serial('id').primaryKey(),
  garageId: text('garage_id').references(() => garageProfiles.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  phone: text('phone'),
  permissionLevel: text('permission_level').default('Mechanic'), // 'Manager' | 'Mechanic' | 'Staff'
  createdAt: timestamp('created_at').defaultNow()
});

// 19. Garage Services Table
export const garageServices = pgTable('garage_services', {
  id: serial('id').primaryKey(),
  garageId: text('garage_id').references(() => garageProfiles.id, { onDelete: 'cascade' }).notNull(),
  serviceName: text('service_name').notNull(),
  price: integer('price'), // Est cost in USD
  durationMins: integer('duration_mins'),
  createdAt: timestamp('created_at').defaultNow()
});

// 20. Spare Part Shops Table
export const sparePartShops = pgTable('spare_part_shops', {
  id: text('id').primaryKey(),
  userUid: text('user_uid').references(() => users.uid, { onDelete: 'cascade' }).notNull(),
  shopName: text('shop_name').notNull(),
  ownerName: text('owner_name').notNull(),
  phone: text('phone').notNull(),
  telegram: text('telegram'),
  address: text('address').notNull(),
  licenseNumber: text('license_number'),
  status: text('status').default('Pending'),
  createdAt: timestamp('created_at').defaultNow()
});

// 21. Spare Parts Inventory Table
export const sparePartsInventory = pgTable('spare_parts_inventory', {
  id: serial('id').primaryKey(),
  shopId: text('shop_id').references(() => sparePartShops.id, { onDelete: 'cascade' }).notNull(),
  partName: text('part_name').notNull(),
  partNumber: text('part_number'),
  category: text('category').notNull(),
  compatibleVehicles: text('compatible_vehicles'),
  price: integer('price').notNull(),
  stockQuantity: integer('stock_quantity').notNull(),
  createdAt: timestamp('created_at').defaultNow()
});

// 22. Petrol Stations Table
export const petrolStations = pgTable('petrol_stations', {
  id: text('id').primaryKey(),
  userUid: text('user_uid').references(() => users.uid, { onDelete: 'cascade' }).notNull(),
  stationName: text('station_name').notNull(),
  brand: text('brand').notNull(), // 'TotalEnergies' | 'PTT' | 'Tela' | 'Caltex' | etc.
  phone: text('phone').notNull(),
  address: text('address').notNull(),
  hasFuelRegular: boolean('has_fuel_regular').default(true),
  priceRegular: real('price_regular'),
  hasFuelPremium: boolean('has_fuel_premium').default(true),
  pricePremium: real('price_premium'),
  status: text('status').default('Pending'),
  createdAt: timestamp('created_at').defaultNow()
});

// 23. EV Charging Stations Table
export const evChargingStations = pgTable('ev_charging_stations', {
  id: text('id').primaryKey(),
  userUid: text('user_uid').references(() => users.uid, { onDelete: 'cascade' }).notNull(),
  stationName: text('station_name').notNull(),
  phone: text('phone').notNull(),
  address: text('address').notNull(),
  chargerTypes: text('charger_types'), // CSV like CCS2, GB/T, Type 2
  powerKw: integer('power_kw'),
  hasAvailableCords: boolean('has_available_cords').default(true),
  status: text('status').default('Pending'),
  createdAt: timestamp('created_at').defaultNow()
});

// 24. Freelancer Mechanics Table
export const freelancerMechanics = pgTable('freelancer_mechanics', {
  id: text('id').primaryKey(),
  userUid: text('user_uid').references(() => users.uid, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  telegram: text('telegram'),
  skills: text('skills').notNull(),
  locationServiceRadiusKm: integer('location_service_radius_km').default(10),
  pricingModel: text('pricing_model'), // 'Hourly' | 'Per Task'
  verificationStatus: text('verification_status').default('Pending'),
  createdAt: timestamp('created_at').defaultNow()
});

// 25. Verification Requests Table
export const verificationRequests = pgTable('verification_requests', {
  id: text('id').primaryKey(),
  userUid: text('user_uid').references(() => users.uid, { onDelete: 'cascade' }).notNull(),
  businessType: text('business_type').notNull(), // 'Garage' | 'SparePart' | 'Petrol' | 'EVCharging' | 'Freelancer'
  businessId: text('business_id').notNull(),
  businessName: text('business_name').notNull(),
  submittedDocuments: text('submitted_documents'),
  status: text('status').default('Pending'), // 'Pending' | 'Approved' | 'Rejected'
  reviewNotes: text('review_notes'),
  reviewedBy: text('reviewed_by'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// 26. Admin Logs Table
export const adminLogs = pgTable('admin_logs', {
  id: serial('id').primaryKey(),
  adminUid: text('admin_uid').notNull(),
  action: text('action').notNull(),
  targetUid: text('target_uid'),
  details: text('details'),
  createdAt: timestamp('created_at').defaultNow()
});

// 27. Fleet Profiles Table
export const fleetProfiles = pgTable('fleet_profiles', {
  id: text('id').primaryKey(),
  ownerUid: text('owner_uid').references(() => users.uid, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(), // Family Fleet, Company Fleet, etc.
  fleetType: text('fleet_type').notNull(), // 'Family' | 'Company' | 'Private Boss' | etc.
  managerName: text('manager_name').default(''),
  subscriptionPlanId: text('subscription_plan_id').default('basic'),
  telegramChatId: text('telegram_chat_id'),
  createdAt: timestamp('created_at').defaultNow()
});

// 28. Fleet Vehicles Table (mapping vehicles to fleets)
export const fleetVehicles = pgTable('fleet_vehicles', {
  id: serial('id').primaryKey(),
  fleetId: text('fleet_id').references(() => fleetProfiles.id, { onDelete: 'cascade' }).notNull(),
  vehicleId: text('vehicle_id').references(() => vehicles.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').defaultNow()
});

// 29. Driver Assignments Table
export const driverAssignments = pgTable('driver_assignments', {
  id: text('id').primaryKey(),
  fleetId: text('fleet_id').references(() => fleetProfiles.id, { onDelete: 'cascade' }).notNull(),
  driverUid: text('driver_uid').references(() => users.uid, { onDelete: 'cascade' }).notNull(),
  vehicleId: text('vehicle_id').references(() => vehicles.id, { onDelete: 'cascade' }),
  assignmentType: text('assignment_type').notNull(), // 'Permanent' | 'Temporary' | 'Trip-based'
  status: text('status').default('Active'), // 'Active' | 'Inactive'
  startDate: text('start_date'),
  endDate: text('end_date'),
  createdAt: timestamp('created_at').defaultNow()
});

// 30. Trip Logs Table
export const tripLogs = pgTable('trip_logs', {
  id: text('id').primaryKey(),
  vehicleId: text('vehicle_id').references(() => vehicles.id, { onDelete: 'cascade' }).notNull(),
  driverUid: text('driver_uid').references(() => users.uid, { onDelete: 'cascade' }).notNull(),
  startTime: text('start_time').notNull(),
  endTime: text('end_time'),
  startOdometer: integer('start_odometer').notNull(),
  endOdometer: integer('end_odometer'),
  startLocation: text('start_location').notNull(),
  endLocation: text('end_location'),
  purpose: text('purpose').notNull(), // 'Boss transport' | 'Family trip' | etc.
  notes: text('notes'),
  status: text('status').default('Active'), // 'Active' | 'Completed'
  createdAt: timestamp('created_at').defaultNow()
});

// 31. Fuel Charging Logs Table
export const fuelChargingLogs = pgTable('fuel_charging_logs', {
  id: text('id').primaryKey(),
  vehicleId: text('vehicle_id').references(() => vehicles.id, { onDelete: 'cascade' }).notNull(),
  driverUid: text('driver_uid').references(() => users.uid, { onDelete: 'cascade' }).notNull(),
  logType: text('log_type').notNull(), // 'Fuel' | 'Charging'
  energyType: text('energy_type').notNull(), // Regular 92, Premium 95, AC, DC, etc.
  stationName: text('station_name').notNull(),
  amountPaid: real('amount_paid').notNull(),
  quantity: real('quantity').notNull(), // Liters or kWh
  odometer: integer('odometer').notNull(),
  receiptPhotoUrl: text('receipt_photo_url'),
  location: text('location').notNull(),
  approvalStatus: text('approval_status').default('Pending'), // 'Pending' | 'Approved' | 'Rejected'
  createdAt: timestamp('created_at').defaultNow()
});

// 32. Vehicle Expenses Table (Extended for fleet drivers)
export const vehicleExpensesExtended = pgTable('vehicle_expenses_extended', {
  id: text('id').primaryKey(),
  vehicleId: text('vehicle_id').references(() => vehicles.id, { onDelete: 'cascade' }).notNull(),
  driverUid: text('driver_uid').references(() => users.uid, { onDelete: 'cascade' }).notNull(),
  category: text('category').notNull(), // 'Fuel' | 'EV Charging' | 'Parking' | etc.
  amount: real('amount').notNull(),
  date: text('date').notNull(),
  odometer: integer('odometer'),
  provider: text('provider'),
  receiptPhotoUrl: text('receipt_photo_url'),
  notes: text('notes'),
  approvalStatus: text('approval_status').default('Pending'), // 'Pending' | 'Approved' | 'Rejected'
  createdAt: timestamp('created_at').defaultNow()
});

// 33. Approval Records Table
export const approvalRecords = pgTable('approval_records', {
  id: text('id').primaryKey(),
  fleetId: text('fleet_id').references(() => fleetProfiles.id, { onDelete: 'cascade' }).notNull(),
  targetType: text('target_type').notNull(), // 'Expense' | 'FuelLog' | 'Trip'
  targetId: text('target_id').notNull(),
  managerUid: text('manager_uid').references(() => users.uid, { onDelete: 'cascade' }).notNull(),
  status: text('status').notNull(), // 'Approved' | 'Rejected'
  comments: text('comments'),
  createdAt: timestamp('created_at').defaultNow()
});

// 34. Fleet Notifications Table
export const fleetNotifications = pgTable('fleet_notifications', {
  id: text('id').primaryKey(),
  fleetId: text('fleet_id').references(() => fleetProfiles.id, { onDelete: 'cascade' }).notNull(),
  userUid: text('user_uid').references(() => users.uid, { onDelete: 'cascade' }).notNull(), // target user
  title: text('title').notNull(),
  message: text('message').notNull(),
  channel: text('channel').default('In-App'), // 'In-App' | 'Telegram' | 'Email'
  status: text('status').default('unread'),
  createdAt: timestamp('created_at').defaultNow()
});

// 35. Fleet Subscription Plans Table
export const fleetSubscriptionPlans = pgTable('fleet_subscription_plans', {
  id: text('id').primaryKey(),
  name: text('name').notNull(), // e.g., 'Bronze Family', 'SME Fleet Pro'
  priceMonthly: integer('price_monthly').notNull(), // USD
  vehicleLimit: integer('vehicle_limit').notNull(),
  driverLimit: integer('driver_limit').notNull(),
  features: text('features'), // CSV or text
  createdAt: timestamp('created_at').defaultNow()
});

// 36. QR Sticker & Metal Plate Orders Table
export const qrStickerOrders = pgTable('qr_sticker_orders', {
  id: text('id').primaryKey(),
  userUid: text('user_uid').references(() => users.uid, { onDelete: 'cascade' }).notNull(),
  vehicleId: text('vehicle_id').references(() => vehicles.id, { onDelete: 'cascade' }).notNull(),
  stickerType: text('sticker_type').notNull(), // 'Standard QR Decal', 'Reflective Vinyl', 'Retro Metal Plate'
  quantity: integer('quantity').notNull(),
  phone: text('phone').notNull(),
  deliveryAddress: text('delivery_address').notNull(),
  deliveryFee: integer('delivery_fee').notNull(), // in USD
  totalCost: integer('total_cost').notNull(), // in USD
  paymentStatus: text('payment_status').default('Pending'), // 'Pending' | 'Paid'
  status: text('status').default('Ordered'), // 'Ordered' | 'Shipped' | 'Delivered'
  createdAt: timestamp('created_at').defaultNow()
});

