/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from "./types/database";

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'Vehicle Owner' | 'Vehicle Manager' | 'Driver' | 'Garage Owner' | 'Garage Staff' | 'Spare Part Shop' | 'Petrol Station Partner' | 'EV Charging Station Partner' | 'Freelance Mechanic' | 'Admin';
  location: string; // e.g., "Phnom Penh", "Siem Reap", "Battambang"
  status?: 'Pending' | 'Approved' | 'Suspended';
  businessName?: string;
  licenseNumber?: string;
  activatedModules?: string[];
  isMultiService?: boolean;

  // Multi-role logic state fields
  active_role?: 'Vehicle Owner' | 'Vehicle Manager' | 'Driver' | 'Garage Owner' | 'Garage Staff' | 'Spare Part Shop' | 'Petrol Station Partner' | 'EV Charging Station Partner' | 'Freelance Mechanic' | 'Admin';
  active_vehicle_id?: string;
  active_business_id?: string;
  active_module?: 'garage' | 'spare_part_shop' | 'petrol_station' | 'ev_charging_station' | 'marketplace_seller';
  permission_group?: 'Receptionist' | 'Mechanic' | 'Cashier' | 'Garage Manager' | 'Super Admin';
  user_roles?: ('Vehicle Owner' | 'Vehicle Manager' | 'Driver' | 'Garage Owner' | 'Garage Staff' | 'Spare Part Shop' | 'Petrol Station Partner' | 'EV Charging Station Partner' | 'Freelance Mechanic' | 'Admin')[];
  subscription_status?: 'Free' | 'Premium';
  subscription_plan?: 'basic' | 'pro' | 'business';
}

export type EngineType =
  | 'Petrol / Gasoline'
  | 'Diesel'
  | 'Hybrid'
  | 'Plug-in Hybrid / PHEV'
  | 'EV / Fully Electric Vehicle'
  | 'LPG / CNG Gas Vehicle'
  | 'Petrol Motorcycle'
  | 'Electric Motorcycle / E-Bike'
  | 'Other';

export interface VehicleProfile {
  id: string;
  brand: string;
  model: string;
  year: number;
  mileage: number; // in km
  fuelType: 'Gasoline' | 'Diesel' | 'EV' | 'Hybrid';
  publicVehicleId?: string;
  qrSecureToken?: string;
  qrSecureLink?: string;
  lastOilChangeMileage?: number;
  lastServiceDate?: string; // YYYY-MM-DD
  weaknessReport?: VehicleWeaknessReport;
  nickname?: string;
  plateNumber?: string;
  vehicleType?: 'Sedan' | 'SUV' | 'Pickup' | 'Van' | 'Moto' | 'Truck' | 'Hatchback' | 'Other';
  purchaseDate?: string;
  purchasePrice?: number;
  photoUrl?: string;
  notes?: string;

  // New improved vehicle registration fields
  owner?: string;
  engineType?: EngineType;
  chassisNumber?: string;
  transmission?: 'Automatic' | 'Manual' | 'CVT' | 'Dual-Clutch' | 'Single-Speed' | 'Other';
  regCardPhotoUrl?: string;

  // New compatibility system fields
  vehicleCategory?: 'car' | 'motorbike' | 'truck' | 'van' | 'pickup' | 'tuk tuk' | 'bus' | 'EV' | 'hybrid' | 'heavy equipment';
  engineTypeNew?: 'petrol' | 'diesel' | 'electric' | 'hybrid' | 'plug-in hybrid' | 'LPG/CNG' | 'unknown';
  fuelEnergyType?: 'petrol' | 'diesel' | 'electric' | 'petrol + electric' | 'diesel + electric' | 'gas';
  transmissionType?: 'manual' | 'automatic' | 'CVT' | 'EV single-speed' | 'unknown';
  usageType?: 'personal' | 'family' | 'company' | 'delivery' | 'taxi' | 'ride-hailing' | 'fleet' | 'rental' | 'off-road';

  // Petrol/Gasoline specific fields (also can apply to Petrol Motorcycle)
  gasolineFuelType?: 'Regular 92' | 'Premium 95' | 'Super 98';
  engineSize?: string;
  oilChangeInterval?: number;
  fuelConsumptionEstimate?: string;

  // Diesel specific fields
  dieselEngineSize?: string;
  dieselHasTurbo?: boolean;
  dieselHasDpf?: boolean;
  dieselFuelFilterInterval?: number;
  dieselOilChangeInterval?: number;

  // Hybrid & PHEV specific fields
  hybridType?: 'Mild Hybrid' | 'Full Hybrid' | 'Plug-in Hybrid';
  hybridEngineSize?: string;
  hybridBatteryHealth?: number; // e.g. 85 for 85%
  hybridEvRange?: number;
  hybridBatteryInspectionInterval?: number; // in km or months

  // EV / Electric Motorcycle specific fields
  evBatteryCapacity?: number; // kWh
  evBatteryHealth?: number; // %
  evDrivingRange?: number; // km
  evChargingType?: 'AC' | 'DC Fast Charge' | 'Both';
  evChargingPortType?: string; // e.g. GB/T, CCS2, Type 2
  evHasHomeCharger?: boolean;
  evBatteryCoolingType?: 'Air Cooled' | 'Liquid Cooled' | 'None';

  // LPG / CNG specific fields
  lpgCngType?: 'LPG' | 'CNG';
  lpgCngHasPetrolBackup?: boolean;
  lpgCngTankInstallationDate?: string;
  lpgCngTankInspectionExpiryDate?: string;
  lpgCngInspectionInterval?: number;

  // Motorcycle (Petrol / Electric) specific fields
  motorcycleEngineSizeCc?: string; // e.g., "125cc" or "3kW"
  motorcycleBatteryCapacityKwh?: number;
  motorcycleRangeKm?: number;
  motorcycleChargingTimeHours?: number;
  motorcycleDriveType?: 'Chain' | 'Belt' | 'Shaft' | 'Direct Hub Drive';
  
  // Status and Ownership details
  status?: 'Active' | 'Inactive' | 'Under Repair' | 'Sold/Transferred' | 'Archived';
  statusReason?: string;
  statusDate?: string;
  statusNote?: string;
  statusDocUrl?: string;

  repairGarageName?: string;
  repairStatus?: string;
  repairEstCompletion?: string;
  repairPendingInvoice?: number | string;

  previousOwners?: Array<{
    ownerId?: string;
    ownerName: string;
    ownerContact?: string;
    ownershipPeriod: string;
    price?: number;
    transferDate: string;
    note?: string;
  }>;

  transferStatus?: 'None' | 'Pending' | 'Accepted' | 'Rejected';
  pendingTransferTarget?: string;
  pendingTransferPrice?: number;
  pendingTransferDate?: string;
  pendingTransferNote?: string;
  pendingTransferType?: 'Full History Transfer' | 'Partial History Transfer' | 'Vehicle Profile Only';
  pendingTransferSelectedRecords?: string[];
  transferDocUrl?: string;
}

export interface VehicleExpense {
  id: string;
  vehicleId: string;
  category: 'Fuel' | 'Oil change' | 'Maintenance' | 'Repair' | 'Spare parts' | 'Tire' | 'Battery' | 'Car wash' | 'Parking' | 'Toll fee' | 'Insurance' | 'Road tax' | 'Loan payment' | 'Accessories' | 'Emergency repair' | 'Other';
  amount: number;
  date: string; // YYYY-MM-DD
  mileage: number;
  provider: string; // Garage or shop name
  paymentMethod: 'Cash' | 'ABA Pay' | 'Wing' | 'Credit Card' | 'Other';
  receiptImage?: string; // photo or base64 or placeholder
  notes?: string;
}

export interface AttachedDocument {
  id: string;
  vehicleId: string;
  category: 'Registration Card' | 'Insurance Document' | 'Road Tax Document' | 'Purchase Invoice' | 'Warranty Card' | 'Service Invoice' | 'Spare Parts Receipt' | 'Garage Receipt' | 'Other';
  title: string;
  fileName: string;
  fileSize?: string;
  uploadDate: string; // YYYY-MM-DD
  fileUrl?: string; // mock URL
}

export interface VehicleWeaknessReport {
  commonIssues: { issue: string; advice: string; risk: 'low' | 'medium' | 'high' }[];
  maintenancePriority: string[];
  strongPoints: string[];
  weakPoints: string[];
  monthlyChecklist: string[];
  longTripChecklist: string[];
  recommendedSchedule: { task: string; interval: string }[];
  warningSigns: string[];
}

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  serviceCategory: string;
  description: string;
  cost: number; // in USD
  mileage: number; // in km
  date: string; // YYYY-MM-DD
  provider: string; // e.g., "Apsara Garage"
  attachmentUrl?: string;
}

export interface GaragePartner {
  id: string;
  name: string;
  type: 'Garage / Repair Shop' | 'Petrol Station / Partner' | 'Spare Part Shop' | 'Car Wash' | 'EV Charging';
  rating: number;
  reviewsCount: number;
  address: string;
  phone: string;
  lat: number;
  lng: number;
  services: string[];
  imageUrl: string;
  description: string;
  isPartner: boolean;
}

export interface SmartReminder {
  id: string;
  vehicleId: string;
  service: string; // fits category name or custom title
  title?: string;
  category?: string;
  reminderType?: 'date_based' | 'mileage_based' | 'date_and_mileage' | 'repeating' | 'custom';
  status: 'Due soon' | 'Overdue' | 'Good' | 'Due today' | 'Completed' | 'Snoozed';
  reason: string;
  action: string;
  priority: 'Low' | 'Medium' | 'High' | 'Emergency';
  dueDate?: string; // YYYY-MM-DD
  dueMileage?: number; // km
  repeatType?: 'none' | 'daily' | 'weekly' | 'monthly' | 'every_3_months' | 'every_6_months' | 'yearly' | 'custom';
  notificationTime?: string; // HH:MM
  description?: string; // custom notes
  isAiSuggested?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface NotificationLog {
  id: string;
  vehicleId?: string;
  reminderId?: string;
  title: string;
  message: string;
  channel: 'Push' | 'In-App' | 'Telegram' | 'Email' | 'SMS';
  status: 'unread' | 'read' | 'snoozed';
  sentAt: string;
  category?: string; // 'maintenance' | 'safety' | 'garage' | 'booking' | 'marketplace' | 'forum' | 'admin' | 'custom'
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  sourceType?: 'system' | 'garage' | 'admin' | 'user' | 'marketplace' | 'forum';
  actionUrl?: string;
  actionLabel?: string;
  garageId?: string;
  garageName?: string;
  relatedRecordId?: string;
  relatedRecordData?: any;
  snoozedUntil?: string;
  readAt?: string;
}

export interface NotificationTemplate {
  id: string;
  title: string;
  message: string;
  category: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  roleTarget: string;
  actionType?: string;
  createdAt: string;
}

export interface UserNotificationSettings {
  userId: string;
  pushEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
  telegramEnabled: boolean;
  maintenanceEnabled: boolean;
  garageEnabled: boolean;
  bookingEnabled: boolean;
  marketplaceEnabled: boolean;
  forumEnabled: boolean;
  safetyAlertEnabled: boolean;
  adminAnnouncementEnabled: boolean;
  customAlarmEnabled: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
}

export interface AIDiagnosisResult {
  summary: string;
  possible_causes: string[];
  risk_level: 'low' | 'medium' | 'high' | 'emergency';
  safe_user_checks: string[];
  garage_inspection_needed: string[];
  recommended_service_category: string;
  urgency: string;
  continue_driving_advice: 'safe_to_continue_short_term' | 'drive_carefully_to_garage' | 'do_not_drive' | 'call_emergency_support';
  safety_warning: string;
  confidence_level: 'low' | 'medium' | 'high';
}

export interface AdminAnalyticsReport {
  overdueCount: number;
  soonCount: number;
  totalVehicles: number;
  byFuelType: { name: string; value: number }[];
  byBrand: { name: string; value: number }[];
  byProvince: { name: string; value: number }[];
  suggestedCampaign: string;
  suggestedPromotion: string;
}

export interface ForumComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorRole: 'Vehicle Owner' | 'Normal User' | 'Verified Mechanic' | 'Verified Garage' | 'Spare-Part Supplier' | 'Admin';
  authorAvatar?: string;
  authorBadge?: string;
  content: string;
  timestamp: string;
  upvotes: number;
  commentType: 'General' | 'Technical Solution' | 'Garage Recommendation' | 'Mechanic Offer' | 'Spare-part Offer' | 'Price Estimate' | 'Warning' | 'Similar Experience' | 'Admin Note';
  
  // Spare-part offer specific fields
  partName?: string;
  partCondition?: 'New' | 'Used';
  partCompatibility?: string;
  price?: number;
  deliveryTime?: string;
  warranty?: string;
  supplierContact?: string;
  
  isHelpful?: boolean;
}

export interface ForumPost {
  id: string;
  title: string;
  description: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleYear: number;
  engineType?: string;
  mileage?: number;
  category: string;
  location: string;
  urgency: 'Low' | 'Medium' | 'High' | 'Emergency';
  photoUrl?: string;
  audioUrl?: string;
  needMechanic: boolean;
  needRecommendation: boolean;
  needSparePart: boolean;
  budget?: string;
  preferredDate?: string;
  visibility: 'Public' | 'Private' | 'Community Only';
  status: 'Open' | 'Waiting for Answer' | 'Mechanic Needed' | 'Spare Part Needed' | 'Quotation Received' | 'In Repair' | 'Solved' | 'Closed' | 'Reported';
  
  authorId: string;
  authorName: string;
  authorRole: string;
  authorAvatar?: string;
  createdAt: string;
  upvotes: number;
  comments: ForumComment[];
  acceptedCommentId?: string;
  
  resolvedNote?: string;
  resolvedCost?: number;
  resolvedGarage?: string;
  resolvedPartUsed?: string;
  
  aiSuggestion?: {
    suggestedTitle: string;
    suggestedCategories: string[];
    possibleCauses: string[];
    suggestedChecks: string[];
    safetyWarning: string;
    similarCasesFound: string[];
  };
}

export type ListingType = 'Sell' | 'Donate' | 'Exchange' | 'Cash Exchange' | 'Looking for' | 'Garage Stock';
export type PartCondition = 'New' | 'Used' | 'Refurbished' | 'Damaged';
export type ListingStatus = 'Active' | 'Sold' | 'Donated' | 'Exchanged' | 'Expired' | 'Pending Approval' | 'Suspended' | 'Draft';
export type SellerType = 'Owner' | 'Garage' | 'Spare Part Shop' | 'Mechanic' | 'Supplier';

export interface PartComment {
  id: string;
  listingId: string;
  authorName: string;
  content: string;
  photoUrl?: string; // photo comment
  createdAt: string;
}

export interface PartListing {
  id: string;
  title: string;
  description: string;
  postType: ListingType;
  category: string;
  vehicleBrand: string;
  vehicleModel: string;
  yearRange: string; // e.g. "2005-2015"
  engineType?: string;
  partNumber?: string;
  condition: PartCondition;
  price?: number; // USD
  negotiable: boolean;
  donationOption?: boolean;
  exchangeOption?: boolean;
  exchangeDetails?: string; // what the seller wants in exchange
  location: string; // Province/City
  photos: string[]; // Mock or uploaded URLs
  videos?: string[]; // Mock or uploaded video URLs
  comments?: PartComment[]; // Discussion/comments with photo attachments
  contactName: string;
  contactPhone: string;
  contactTelegram?: string; // e.g. "@username"
  sellerType: SellerType;
  verifiedSeller: boolean;
  availabilityStatus: 'In Stock' | 'Pre-Order' | 'Low Stock' | 'Sold Out';
  status: ListingStatus;
  views: number;
  offerCount: number;
  createdAt: string;
  isBoosted: boolean;
  aiCompatibilityComment?: string;
  aiSuggestedPriceRange?: string;
  requiredProofPhotoUpload?: boolean;
  isVehicleSellingPost?: boolean;
  vehicleYear?: number;
  fuelType?: string;
  transmission?: string;
  mileage?: number;
  color?: string;
  serviceHistorySummary?: string;
  lastMaintenanceRecord?: string;
  garageServiceRecords?: string;
  reasonForSelling?: string;
  accidentHistory?: string;
  floodHistory?: string;
  ownershipDocStatus?: string;
  loanStatus?: string;
  warrantyStatus?: string;
  inspectionAvailability?: boolean;
  healthScore?: number;
  clicks?: number;
  chatRequests?: number;
  testDriveRequests?: number;
  inspectionBookings?: any[];
}

export interface PartOffer {
  id: string;
  listingId: string;
  listingTitle: string;
  offerType: 'Buy For Cash' | 'Propose Exchange' | 'Request Donation';
  amount?: number; // for cash offers
  exchangeDetails?: string; // if proposing exchange
  contactName: string;
  contactPhone: string;
  contactTelegram?: string;
  notes?: string;
  status: 'Pending' | 'Accepted' | 'Declined';
  createdAt: string;
}

export interface PartReport {
  id: string;
  listingId: string;
  listingTitle: string;
  reason: 'Fake Part / Counterfeit' | 'Stolen Part Suspected' | 'Scam / Inaccurate Price' | 'Wrong Category or Spam';
  reporterName: string;
  reporterPhone: string;
  comments: string;
  status: 'Pending' | 'Reviewed' | 'Dismissed';
  createdAt: string;
}

export interface Appointment {
  id: string; // appointment_id
  vehicleId: string;
  ownerId: string;
  garageId: string;
  garageName: string;
  serviceType: string;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // HH:MM
  assignedMechanic?: string;
  estimatedCost?: string;
  status: 'Requested' | 'Confirmed' | 'Rescheduled' | 'Completed' | 'Cancelled' | 'No-show';
  note?: string;
  createdAt: string;
  location?: string;
}

export interface MonthlyMaintenance {
  id: string; // monthly_id
  vehicleId: string;
  ownerId: string;
  month: string; // e.g. "June 2026"
  year: number;
  checklistItems: {
    id: string;
    name: string;
    status: 'Pending' | 'In Progress' | 'Completed' | 'Skipped';
    checkedBy: 'Owner' | 'Garage' | 'None';
    photoUrl?: string;
    note?: string;
  }[];
  notes?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface GarageConnection {
  id: string; // connection_id
  vehicleId: string;
  ownerId: string;
  garageId: string;
  garageName: string;
  permissionLevel: 'private' | 'basic_profile' | 'view_history' | 'full_history';
  allowCreateLogs: boolean;
  allowSendAppointments: boolean;
  allowTelegramReminders: boolean;
  allowInvoiceUpload: boolean;
  status: 'connected' | 'disconnected';
  connectedAt: string;
}

export interface RepairRequest {
  id: string;
  vehicleId?: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleYear: number;
  engineType: string;
  currentMileage: number;
  location: string;
  category: string;
  description: string;
  status: 'Draft' | 'Posted' | 'Waiting for Bids' | 'Bids Received' | 'Provider Selected' | 'Inspection Scheduled' | 'Repair In Progress' | 'Waiting for Owner Approval' | 'Completed' | 'Paid' | 'Reviewed' | 'Closed' | 'Dispute';
  photoUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  urgency: 'Low' | 'Medium' | 'High' | 'Emergency';
  budgetRange: string;
  towingNeed: boolean;
  preferredServiceType: 'Ask for Advice' | 'Find Garage' | 'Find Freelance Mechanic' | 'Request Price Bidding' | 'Emergency Help' | 'Need Spare Part' | 'Share Experience' | 'Review Garage/Mechanic' | 'Donation/Exchange Spare Part';
  ownerId: string;
  ownerName: string;
  createdAt: string;
  isUrgentBoosted?: boolean;
  priceFinalApproved?: boolean;
}

export interface ServiceBid {
  id: string;
  requestId: string;
  providerId: string;
  providerName: string;
  providerType: 'Garage' | 'Freelance Mechanic' | 'Mobile Mechanic' | 'EV Specialist' | 'Hybrid Specialist' | 'Spare Parts Shop' | 'Towing Service';
  estimatedPrice: number;
  diagnosisFee: number;
  laborFee: number;
  sparePartsEstimate: number;
  serviceLocation: string;
  availability: string;
  repairTime: string;
  warrantyPeriod: string;
  providerNote: string;
  photosOfPreviousWork?: string[];
  providerRating: number;
  isMobileAvailable: boolean;
  bidType: 'Fixed Price Bid' | 'Estimated Price Bid' | 'Diagnosis First Bid' | 'Mobile Service Bid' | 'Garage Visit Bid' | 'Spare Parts + Installation Bid';
  status: 'Pending' | 'Accepted' | 'Declined';
  createdAt: string;
  priceApprovedByOwner?: boolean;
}



