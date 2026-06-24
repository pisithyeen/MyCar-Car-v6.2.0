/**
 * MyCar Care KH - Spare Parts Shop Admin Dashboard Data & Types
 * Cambodian localized contexts (ABA Pay, Phnom Penh, Sen Sok, etc.)
 */

export interface PartProduct {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  qrCode: string;
  partNumber: string;
  brand: string; // e.g. "Toyota Dual VVT-i", "Denso"
  category: string;
  costPrice: number;
  sellingPrice: number;
  wholesalePrice: number;
  retailPrice: number;
  stockQuantity: number;
  minStockAlert: number;
  supplierId: string;
  shelfLocation: string; // e.g. "A-12-Shelf3"
  warrantyMonths: number;
  images: string[];
  condition: 'New' | 'Used' | 'Refurbished';
  status: 'Active' | 'Inactive' | 'Low Stock' | 'Out of Stock';
  compatibility: {
    brand: string;
    model: string;
    year: string;
    engineType?: string;
    fuelType?: string;
    compatibleCategory?: string;
  }[];
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  date: string;
  staffName: string;
  qtyBefore: number;
  qtyChanged: number; // e.g., +20 or -1
  qtyAfter: number;
  type: 'Stock In' | 'Stock Out' | 'POS Sale' | 'Online Order' | 'Return' | 'Damage' | 'Lost Item' | 'Manual Adjustment' | 'Supplier Delivery' | 'Branch Transfer';
  reason: string;
  referenceNo: string; // e.g. Invoice ID or PO ID
}

export interface POSCartItem {
  product: PartProduct;
  quantity: number;
  price: number;
  discount: number; // USD
  warrantyMonths: number;
  taxPercent: number; // e.g., 10% VAT
  notes?: string;
}

export interface SalesInvoice {
  id: string;
  invoiceNumber: string;
  date: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  vehicleInfo?: string; // e.g. "Toyota Prius 2010 Gold"
  items: {
    productId: string;
    name: string;
    sku: string;
    price: number;
    quantity: number;
    discount: number;
    taxAmount: number;
    warrantyExpiry: string;
  }[];
  subtotal: number;
  totalDiscount: number;
  totalTax: number;
  totalAmount: number;
  paymentMethod: 'Cash' | 'ABA Pay' | 'KHQR' | 'Bank Transfer' | 'Mixed Payment' | 'Credit Sale';
  paymentDetails?: string;
  staffName: string;
  status: 'Paid' | 'Refunded' | 'Partially Refunded' | 'Credit Outstanding';
  isReturned?: boolean;
}

export interface OnlineOrder {
  id: string;
  orderNumber: string;
  date: string;
  customerName: string;
  customerPhone: string;
  vehicleInfo?: string;
  items: {
    productId: string;
    name: string;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  paymentMethod: string;
  deliveryMethod: 'GrabExpress' | 'Tada Delivery' | 'J&T Express' | 'Self-Pickup' | 'VET Express';
  address: string;
  status: 'New' | 'Confirmed' | 'Waiting for Payment' | 'Paid' | 'Preparing' | 'Ready for Pickup' | 'Out for Delivery' | 'Completed' | 'Cancelled' | 'Returned';
  assignedStaff: string;
  notes?: string;
}

export interface PartMarketplacePost {
  id: string;
  title: string;
  category: string;
  brand: string;
  vehicleBrand: string;
  vehicleModel: string;
  yearRange: string;
  condition: 'New' | 'Used' | 'Refurbished';
  price: number;
  stockAvailable: number;
  description: string;
  warranty: string;
  deliveryOption: string;
  pickupLocation: string;
  images: string[];
  video?: string;
  sellerProfile: string;
  postType: 'Sell Part' | 'Used Part' | 'Refurbished Part' | 'Promotion' | 'Wholesale Offer' | 'Clearance Stock' | 'Pre-Order' | 'Rare Part Request' | 'Donate' | 'Exchange';
  status: 'Draft' | 'Pending Approval' | 'Approved' | 'Rejected' | 'Active' | 'Sold Out' | 'Hidden' | 'Expired';
  isBoosted: boolean;
  boostDuration?: '3 days' | '7 days' | '15 days' | '30 days';
  boostExpiry?: string;
  views: number;
  clicks: number;
  messages: number;
  createdAt: string;
}

export interface CustomerProfile {
  id: string;
  name: string;
  phone: string;
  telegram?: string;
  email?: string;
  vehiclesOwned: string[]; // e.g. ["Toyota Prius (2012) Space Grey", "Lexus RX350 (2015) White"]
  purchaseHistoryCount: number;
  totalSpending: number;
  notes?: string;
}

export interface GarageBuyerProfile {
  id: string;
  garageName: string;
  contactPerson: string;
  phone: string;
  location: string; // e.g. "Toul Kork, Phnom Penh"
  purchaseCount: number;
  creditBalance: number;
  wholesalePricingTier: 'Tier A (VIP -20%)' | 'Tier B (Standard -10%)' | 'Tier C (Retail)';
  frequentPartsOrdered: string[];
  monthlyPurchaseVolume: number;
}

export interface SupplierProfile {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  address: string;
  productCategories: string[];
  purchaseHistoryCount: number;
  paymentStatus: 'Cleared' | 'Outstanding Bills';
  deliveryLeadTimeDays: number;
  notes?: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  date: string;
  expectedDeliveryDate: string;
  items: {
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
    costPrice: number;
  }[];
  totalCost: number;
  paymentTerm: 'COD' | 'Net 15' | 'Net 30' | 'Advanced 50%';
  status: 'Draft' | 'Sent to Supplier' | 'Confirmed' | 'Partially Received' | 'Fully Received' | 'Cancelled';
}

export interface ReturnWarrantyRecord {
  id: string;
  invoiceNumber: string;
  customerPhone: string;
  productName: string;
  sku: string;
  warrantyStatus: 'Active' | 'Expired' | 'Claimed';
  returnDate?: string;
  reason?: string;
  productConditionOnReturn?: 'New' | 'Damaged' | 'Opened / Normal Wear';
  refundAmount?: number;
  staffName: string;
  status: 'Pending Review' | 'Approved' | 'Rejected';
}

export interface PartPromotion {
  id: string;
  title: string;
  description: string;
  discountPercent: number;
  startDate: string;
  endDate: string;
  applicableCategories: string[];
  isActive: boolean;
}

// Staff Role Permissions Matrix
export type StaffRole = 'Shop Owner' | 'Manager' | 'Cashier' | 'Stock Controller' | 'Online Sales' | 'Accountant';

export interface RolePermissions {
  role: StaffRole;
  salesPOS: boolean;
  inventoryEdit: boolean;
  stockAdjust: boolean;
  marketplacePost: boolean;
  reportsView: boolean;
  refundsApproval: boolean;
  suppliersManage: boolean;
  purchaseOrders: boolean;
  staffManagement: boolean;
}

export const ROLE_PERMISSIONS_MATRIX: Record<StaffRole, RolePermissions> = {
  'Shop Owner': {
    role: 'Shop Owner',
    salesPOS: true,
    inventoryEdit: true,
    stockAdjust: true,
    marketplacePost: true,
    reportsView: true,
    refundsApproval: true,
    suppliersManage: true,
    purchaseOrders: true,
    staffManagement: true
  },
  'Manager': {
    role: 'Manager',
    salesPOS: true,
    inventoryEdit: true,
    stockAdjust: true,
    marketplacePost: true,
    reportsView: true,
    refundsApproval: true,
    suppliersManage: true,
    purchaseOrders: true,
    staffManagement: false
  },
  'Cashier': {
    role: 'Cashier',
    salesPOS: true,
    inventoryEdit: false,
    stockAdjust: false,
    marketplacePost: false,
    reportsView: false,
    refundsApproval: false,
    suppliersManage: false,
    purchaseOrders: false,
    staffManagement: false
  },
  'Stock Controller': {
    role: 'Stock Controller',
    salesPOS: false,
    inventoryEdit: true,
    stockAdjust: true,
    marketplacePost: false,
    reportsView: false,
    refundsApproval: false,
    suppliersManage: true,
    purchaseOrders: true,
    staffManagement: false
  },
  'Online Sales': {
    role: 'Online Sales',
    salesPOS: false,
    inventoryEdit: false,
    stockAdjust: false,
    marketplacePost: true,
    reportsView: false,
    refundsApproval: false,
    suppliersManage: false,
    purchaseOrders: false,
    staffManagement: false
  },
  'Accountant': {
    role: 'Accountant',
    salesPOS: false,
    inventoryEdit: false,
    stockAdjust: false,
    marketplacePost: false,
    reportsView: true,
    refundsApproval: false,
    suppliersManage: false,
    purchaseOrders: false,
    staffManagement: false
  }
};

// --- PREPOPULATED IN-MEMORY SEED DATABASES ---

export const INITIAL_PRODUCTS: PartProduct[] = [
  {
    id: "p1",
    name: "Front Ceramic Brake Pads set (Premium)",
    sku: "BRK-PR-2010",
    barcode: "84729104820",
    qrCode: "QR_BRK_PR_2010",
    partNumber: "04465-47070",
    brand: "Akebono Japan",
    category: "Braking System",
    costPrice: 18.00,
    sellingPrice: 32.00,
    wholesalePrice: 24.00,
    retailPrice: 32.00,
    stockQuantity: 24,
    minStockAlert: 8,
    supplierId: "s1",
    shelfLocation: "Row B-Shelf 2",
    warrantyMonths: 12,
    images: ["https://images.unsplash.com/photo-1578844251758-2f71da64c96f?w=400&auto=format&fit=crop&q=60"],
    condition: "New",
    status: "Active",
    compatibility: [
      { brand: "Toyota", model: "Prius", year: "2010", fuelType: "Hybrid", compatibleCategory: "Brakes" },
      { brand: "Lexus", model: "CT200h", year: "2012", fuelType: "Hybrid", compatibleCategory: "Brakes" }
    ]
  },
  {
    id: "p2",
    name: "Original Denso Spark Plugs (Iridium-core)",
    sku: "SP-DEN-IK20",
    barcode: "490600293021",
    qrCode: "QR_DEN_IK20",
    partNumber: "IK20FT-98",
    brand: "Denso Japan",
    category: "Electrical & Ignition",
    costPrice: 6.50,
    sellingPrice: 12.00,
    wholesalePrice: 8.50,
    retailPrice: 12.00,
    stockQuantity: 4, // Trigger Low Stock Warning
    minStockAlert: 15,
    supplierId: "s2",
    shelfLocation: "Row A-Cabinet 4",
    warrantyMonths: 6,
    images: ["https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400&auto=format&fit=crop&q=60"],
    condition: "New",
    status: "Low Stock",
    compatibility: [
      { brand: "Toyota", model: "Camry", year: "2007", FuelType: "Gasoline" } as any,
      { brand: "Lexus", model: "RX300", year: "2003", FuelType: "Gasoline" } as any
    ]
  },
  {
    id: "p3",
    name: "Prius Gen 3 Hybrid Battery Cell Pack (Grade-A Rebuilt)",
    sku: "HYB-CELL-P3",
    barcode: "75029300181",
    qrCode: "QR_HYC_P3",
    partNumber: "G9510-47060-R",
    brand: "MyCar Refurb Tech",
    category: "High Voltage / Energy",
    costPrice: 85.00,
    sellingPrice: 160.00,
    wholesalePrice: 130.00,
    retailPrice: 160.00,
    stockQuantity: 8,
    minStockAlert: 3,
    supplierId: "s3",
    shelfLocation: "Battery Safe Zone-A",
    warrantyMonths: 18,
    images: ["https://images.unsplash.com/photo-1548345680-f5475ea5df84?w=400&auto=format&fit=crop&q=60"],
    condition: "Refurbished",
    status: "Active",
    compatibility: [
      { brand: "Toyota", model: "Prius", year: "2010", fuelType: "Hybrid" },
      { brand: "Toyota", model: "Prius", year: "2012", fuelType: "Hybrid" }
    ]
  },
  {
    id: "p4",
    name: "Engine Cabin Air Filter (Anti-Soot Carbon)",
    sku: "FIL-ENG-CAB",
    barcode: "69384910385",
    qrCode: "QR_FIL_CAB",
    partNumber: "17801-21050",
    brand: "Valvoline",
    category: "Filters & Maintenance",
    costPrice: 4.55,
    sellingPrice: 9.50,
    wholesalePrice: 6.00,
    retailPrice: 9.50,
    stockQuantity: 1, // Trigger out of stock warning almost
    minStockAlert: 10,
    supplierId: "s1",
    shelfLocation: "Row F-Shelf 1",
    warrantyMonths: 3,
    images: [],
    condition: "New",
    status: "Low Stock",
    compatibility: [
      { brand: "Toyota", model: "Yaris", year: "2015", engineType: "1.3L" }
    ]
  }
];

export const INITIAL_CUSTOMERS: CustomerProfile[] = [
  {
    id: "c1",
    name: "Piseth Yeen",
    phone: "012 345 678",
    telegram: "@piseth_ye",
    email: "piseth.yeen@gmail.com",
    vehiclesOwned: ["Toyota Prius (2010) Sparkling Gold", "Lexus RX350 (2016) White Pearl"],
    purchaseHistoryCount: 5,
    totalSpending: 245.50,
    notes: "Regular client. Prefers premium Japanese filter and braking brands."
  },
  {
    id: "c2",
    name: "Sophea Kem",
    phone: "089 778 112",
    telegram: "@sophea_kem",
    vehiclesOwned: ["Toyota Highlander (2004) Silver"],
    purchaseHistoryCount: 2,
    totalSpending: 48.00,
    notes: "Always asks for discount."
  }
];

export const INITIAL_GARAGES: GarageBuyerProfile[] = [
  {
    id: "g1",
    garageName: "Sen Sok Pro Auto Repair",
    contactPerson: "Mr. Vantha Chann",
    phone: "015 993 847",
    location: "Russian Blvd, Sen Sok, Phnom Penh",
    purchaseCount: 42,
    creditBalance: 150.00,
    wholesalePricingTier: "Tier A (VIP -20%)",
    frequentPartsOrdered: ["Toyota Prius Brake Pads", "Denso Spark Plugs", "Oil Filters Prius"],
    monthlyPurchaseVolume: 850.00
  },
  {
    id: "g2",
    garageName: "Toul Kork Hybrid Center",
    contactPerson: "Bona Seng",
    phone: "093 333 445",
    location: "Street 289, Toul Kork, Phnom Penh",
    purchaseCount: 18,
    creditBalance: 0.00,
    wholesalePricingTier: "Tier B (Standard -10%)",
    frequentPartsOrdered: ["Hybrid Battery Cell blocks", "Inverter Coolant"],
    monthlyPurchaseVolume: 420.00
  }
];

export const INITIAL_SUPPLIERS: SupplierProfile[] = [
  {
    id: "s1",
    name: "Asean Consolidated Auto Parts Co.",
    contactPerson: "Oknha Rithy Choeun",
    phone: "023 884 929",
    address: "Street 51, Phnom Penh",
    productCategories: ["Braking System", "Filters & Maintenance", "Suspension System"],
    purchaseHistoryCount: 14,
    paymentStatus: "Cleared",
    deliveryLeadTimeDays: 3,
    notes: "Largest supplier in Cambodia for Japanese OEM parts. Offers Net 30 terms."
  },
  {
    id: "s2",
    name: "Squire Electronic Sourcing China",
    contactPerson: "Ying Wang",
    phone: "+86 138 291 049",
    address: "Shenzhen Electronics Industrial Zone, China",
    productCategories: ["Electrical & Ignition", "Sensors & Diagnostics"],
    purchaseHistoryCount: 5,
    paymentStatus: "Outstanding Bills",
    deliveryLeadTimeDays: 14,
    notes: "Import shipments directly by sea or air. Great prices for bulk Spark plug orders."
  },
  {
    id: "s3",
    name: "MyCar Central Sourcing",
    contactPerson: "Platform Admin KH",
    phone: "017 483 192",
    address: "Street 1986, Sen Sok, Phnom Penh",
    productCategories: ["High Voltage / Energy", "Custom Accessories"],
    purchaseHistoryCount: 8,
    paymentStatus: "Cleared",
    deliveryLeadTimeDays: 1,
    notes: "Direct backup warehouse sourcing channel."
  }
];

export const INITIAL_INVOICES: SalesInvoice[] = [
  {
    id: "inv-2026-001",
    invoiceNumber: "INV-MC-001",
    date: "2026-06-01T10:30:00Z",
    customerId: "c1",
    customerName: "Piseth Yeen",
    customerPhone: "012 345 678",
    vehicleInfo: "Toyota Prius 2010 Gold",
    items: [
      {
        productId: "p1",
        name: "Front Ceramic Brake Pads set (Premium)",
        sku: "BRK-PR-2010",
        price: 32.00,
        quantity: 1,
        discount: 2.00,
        taxAmount: 3.00,
        warrantyExpiry: "2027-06-01"
      },
      {
        productId: "p2",
        name: "Original Denso Spark Plugs (Iridium-core)",
        sku: "SP-DEN-IK20",
        price: 12.00,
        quantity: 4,
        discount: 0.00,
        taxAmount: 4.80,
        warrantyExpiry: "2026-12-01"
      }
    ],
    subtotal: 80.00,
    totalDiscount: 2.00,
    totalTax: 7.80,
    totalAmount: 85.80,
    paymentMethod: "ABA Pay",
    paymentDetails: "ABA Bank App • Ref: 8291048",
    staffName: "David Chan - Senior Cashier",
    status: "Paid"
  },
  {
    id: "inv-2026-002",
    invoiceNumber: "INV-MC-002",
    date: "2026-06-02T08:15:00Z",
    customerName: "Anonymous Walk-In",
    customerPhone: "015 849 201",
    items: [
      {
        productId: "p4",
        name: "Engine Cabin Air Filter (Anti-Soot Carbon)",
        sku: "FIL-ENG-CAB",
        price: 9.50,
        quantity: 1,
        discount: 0.50,
        taxAmount: 0.90,
        warrantyExpiry: "2026-09-02"
      }
    ],
    subtotal: 9.50,
    totalDiscount: 0.50,
    totalTax: 0.90,
    totalAmount: 9.90,
    paymentMethod: "Cash",
    staffName: "Sokha Srun - Cashier",
    status: "Paid"
  }
];

export const INITIAL_MOVEMENTS: StockMovement[] = [
  {
    id: "m1",
    productId: "p1",
    productName: "Front Ceramic Brake Pads set (Premium)",
    sku: "BRK-PR-2010",
    date: "2026-05-25T11:00:00Z",
    staffName: "Tola Hem - Sourcing Head",
    qtyBefore: 4,
    qtyChanged: 20,
    qtyAfter: 24,
    type: "Supplier Delivery",
    reason: "Bulk restock shipment from Asean Auto Parts Co.",
    referenceNo: "PO-MC-492"
  },
  {
    id: "m2",
    productId: "p1",
    productName: "Front Ceramic Brake Pads set (Premium)",
    sku: "BRK-PR-2010",
    date: "2026-06-01T10:30:00Z",
    staffName: "David Chan",
    qtyBefore: 24,
    qtyChanged: -1,
    qtyAfter: 23,
    type: "POS Sale",
    reason: "Completed retail sale transaction on Invoice INV-MC-001",
    referenceNo: "inv-2026-001"
  }
];

export const INITIAL_ORDERS: OnlineOrder[] = [
  {
    id: "ord-101",
    orderNumber: "ORD-KH-8801",
    date: "2026-06-02T03:00:00Z",
    customerName: "Ly Sophea",
    customerPhone: "011 223 344",
    vehicleInfo: "Lexus CT200h (2014)",
    items: [
      { productId: "p3", name: "Prius Gen 3 Hybrid Battery Cell Pack (Grade-A Rebuilt)", quantity: 1, price: 160.00 }
    ],
    totalAmount: 160.00,
    paymentMethod: "KHQR (ABA Bank)",
    deliveryMethod: "GrabExpress",
    address: "Condo de Toul Kork, Street 289, Phnom Penh",
    status: "Paid",
    assignedStaff: "Sokha Srun",
    notes: "Deliver before 4:00 PM please. Handle components carefully."
  }
];

export const INITIAL_MARKETPLACE_POSTS: PartMarketplacePost[] = [
  {
    id: "post1",
    title: "Premium Ceramic Brake Pads for Toyota Prius (2009-15)",
    category: "Braking System",
    brand: "Akebono",
    vehicleBrand: "Toyota",
    vehicleModel: "Prius",
    yearRange: "2009-2015",
    condition: "New",
    price: 32.00,
    stockAvailable: 23,
    description: "Highly rated Japanese friction pads. Minimal noise emission, zero rotors wear. Best for taxi fleets operating in Phnom Penh city boundaries.",
    warranty: "1 year merchant replacement warranty",
    deliveryOption: "GrabExpress Phnom Penh shipping / Nationwide transport",
    pickupLocation: "Sen Sok Warehouse Shop, Russian Blvd",
    images: ["https://images.unsplash.com/photo-1578844251758-2f71da64c96f?w=400&auto=format&fit=crop&q=60"],
    sellerProfile: "MyCar Care KH Official Shop",
    postType: "Sell Part",
    status: "Active",
    isBoosted: true,
    boostDuration: "7 days",
    boostExpiry: "2026-06-08T12:00:00Z",
    views: 142,
    clicks: 39,
    messages: 12,
    createdAt: "2026-06-01T10:00:00Z"
  }
];

export const INITIAL_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: "po-1",
    poNumber: "PO-MC-001",
    supplierId: "s1",
    supplierName: "Asean Consolidated Auto Parts Co.",
    date: "2026-06-01T09:00:00Z",
    expectedDeliveryDate: "2026-06-05T12:00:00Z",
    items: [
      { productId: "p1", productName: "Front Ceramic Brake Pads set (Premium)", sku: "BRK-PR-2010", quantity: 30, costPrice: 18.00 }
    ],
    totalCost: 540.00,
    paymentTerm: "Net 30",
    status: "Sent to Supplier"
  }
];

export const INITIAL_WARRANTIES: ReturnWarrantyRecord[] = [
  {
    id: "w1",
    invoiceNumber: "INV-MC-001",
    customerPhone: "012 345 678",
    productName: "Front Ceramic Brake Pads set (Premium)",
    sku: "BRK-PR-2010",
    warrantyStatus: "Active",
    staffName: "Sokha Srun",
    status: "Pending Review"
  }
];

export const INITIAL_PROMOTIONS: PartPromotion[] = [
  {
    id: "prom-1",
    title: "Rainy Season Safety Drive Promo",
    description: "20% off all high-grade brake pads and wiper sweeps to secure vehicle friction stability.",
    discountPercent: 20,
    startDate: "2026-06-01",
    endDate: "2026-06-30",
    applicableCategories: ["Braking System", "Wiper System"],
    isActive: true
  }
];

export function getPlatformState() {
  if (typeof window === "undefined") {
    return {
      products: INITIAL_PRODUCTS,
      customers: INITIAL_CUSTOMERS,
      garages: INITIAL_GARAGES,
      suppliers: INITIAL_SUPPLIERS,
      invoices: INITIAL_INVOICES,
      movements: INITIAL_MOVEMENTS,
      orders: INITIAL_ORDERS,
      marketplacePosts: INITIAL_MARKETPLACE_POSTS,
      purchaseOrders: INITIAL_PURCHASE_ORDERS,
      warranties: INITIAL_WARRANTIES,
      promotions: INITIAL_PROMOTIONS
    };
  }

  const loadData = (key: string, seed: any) => {
    const val = localStorage.getItem(`mycar_spareparts_${key}`);
    return val ? JSON.parse(val) : seed;
  };

  return {
    products: loadData("products", INITIAL_PRODUCTS) as PartProduct[],
    customers: loadData("customers", INITIAL_CUSTOMERS) as CustomerProfile[],
    garages: loadData("garages", INITIAL_GARAGES) as GarageBuyerProfile[],
    suppliers: loadData("suppliers", INITIAL_SUPPLIERS) as SupplierProfile[],
    invoices: loadData("invoices", INITIAL_INVOICES) as SalesInvoice[],
    movements: loadData("movements", INITIAL_MOVEMENTS) as StockMovement[],
    orders: loadData("orders", INITIAL_ORDERS) as OnlineOrder[],
    marketplacePosts: loadData("marketplacePosts", INITIAL_MARKETPLACE_POSTS) as PartMarketplacePost[],
    purchaseOrders: loadData("purchaseOrders", INITIAL_PURCHASE_ORDERS) as PurchaseOrder[],
    warranties: loadData("warranties", INITIAL_WARRANTIES) as ReturnWarrantyRecord[],
    promotions: loadData("promotions", INITIAL_PROMOTIONS) as PartPromotion[]
  };
}

export function savePlatformState(state: any) {
  if (typeof window === "undefined") return;
  Object.keys(state).forEach(key => {
    localStorage.setItem(`mycar_spareparts_${key}`, JSON.stringify(state[key]));
  });
}
