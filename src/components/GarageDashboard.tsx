/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Wrench, 
  QrCode, 
  User, 
  Car, 
  Check, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  MessageSquare,
  AlertCircle,
  Plus, 
  ShieldCheck, 
  Activity, 
  Search, 
  Bookmark, 
  Database,
  Calendar,
  Sparkles,
  ClipboardCheck,
  TrendingUp,
  Sliders,
  Bell,
  Trash2,
  DollarSign,
  Package,
  FileText,
  Users,
  ShieldAlert,
  Send,
  Building2,
  UserCheck,
  Percent,
  ChevronRight,
  MapPin,
  Star,
  RefreshCw,
  ExternalLink,
  Printer,
  ChevronDown
} from "lucide-react";
import { VehicleProfile, MaintenanceRecord } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface GarageDashboardProps {
  vehicles: VehicleProfile[];
  records: MaintenanceRecord[];
  onRefreshData: () => void;
  userProfile: any;
  onLogRecordExternal: (logData: {
    vehicleId: string;
    serviceCategory: string;
    cost: number;
    mileage: number;
    provider: string;
    description: string;
    date: string;
  }) => Promise<boolean>;
}

// Interfaces for our custom simulated database modules
interface POSItem {
  id: string;
  name: string;
  sku?: string;
  type: 'Service' | 'Product' | 'Package';
  price: number;
  cost?: number;
  qty: number;
}

interface SimulatedCustomer {
  id: string;
  name: string;
  phone: string;
  type: 'New customer' | 'Returning customer' | 'VIP customer' | 'Fleet customer' | 'Corporate customer' | 'Inactive customer';
  totalSpending: number;
  lastVisitDate: string;
  nextServiceDate: string;
  notes: string;
  status: 'Checked In' | 'Out of Shop' | 'In Progress';
  vehicles: string[];
}

export default function GarageDashboard({
  vehicles,
  records,
  onRefreshData,
  userProfile,
  onLogRecordExternal
}: GarageDashboardProps) {

  // Multi-tab selection state
  // "dashboard" | "pos" | "inventory" | "crm" | "staff"
  const [activeTab, setActiveTab] = useState<"dashboard" | "pos" | "inventory" | "crm" | "staff">("dashboard");

  // Multi-branch state
  const [currentBranch, setCurrentBranch] = useState("Teuk Thla Main (Phnom Penh)");
  const [branches] = useState([
    { id: "b1", name: "Teuk Thla Main (Phnom Penh)", city: "Phnom Penh", manager: "Khem Somaly" },
    { id: "b2", name: "Siem Reap Exit Highway 6", city: "Siem Reap", manager: "Vuthy Nhem" }
  ]);

  // Role simulation state (Controls permissions alerts and blocks)
  const [currentRole, setCurrentRole] = useState<"Owner" | "Manager" | "Mechanic" | "Cashier">("Owner");

  // SEEDED CORE DATA - Products SKU inventory
  const [products, setProducts] = useState([
    { sku: "SKU-CAST-5W30", name: "Castrol Edge 5W-30 Titanium (1L)", category: "Fluids & Engine Oil", brand: "Castrol", supplier: "Cambodia Lubricant Distributor", purchasePrice: 5.50, sellingPrice: 8.50, stock: 42, minAlert: 10, location: "Shelf A-1" },
    { sku: "SKU-BMRB-PADS", name: "Brembo High Temp Performance Pads", category: "Brakes & Rotors", brand: "Brembo", supplier: "Apsara Parts Imports KH", purchasePrice: 28.00, sellingPrice: 45.00, stock: 15, minAlert: 5, location: "Shelf B-4" },
    { sku: "SKU-PREST-CLNT", name: "Prestone Heavy-Duty Radiator Coolant", category: "Fluids & Engine Oil", brand: "Prestone", supplier: "Standard Oils Phnom Penh", purchasePrice: 7.50, sellingPrice: 12.00, stock: 8, minAlert: 15, location: "Coolant Bay C" }, // LOW STOCK ALERT
    { sku: "SKU-BSCH-SPRK", name: "Bosch Dual-Platinum Spark Plug", category: "Ignition", brand: "Bosch", supplier: "Auto-Parts Import Sen Sok", purchasePrice: 9.00, sellingPrice: 18.00, stock: 34, minAlert: 8, location: "Shelf A-2" },
    { sku: "SKU-MICHL-T5", name: "Michelin Primacy SUV 265/60R18", category: "Tires & Suspension", brand: "Michelin", supplier: "Tire Hub Cambodia", purchasePrice: 95.00, sellingPrice: 140.00, stock: 6, minAlert: 4, location: "Back Stacks" }
  ]);

  // SEEDED Services and packages lists
  const [serviceTemplates] = useState([
    { id: "s1", name: "Standard Synthetics Engine Oil Change", category: "Engine Oil Service", price: 45.00 },
    { id: "s2", name: "Dual Brake Rotor Resurfacing & Alignment", category: "Brake Service", price: 75.05 },
    { id: "s3", name: "High-Voltage Hybrid Fan Clean & Insulation", category: "Battery Service", price: 110.00 },
    { id: "s4", name: "Monsoon Deep Water-proofing Anti-rust", category: "AC Service", price: 60.00 },
    { id: "s5", name: "Full Digital Vehicle Diagnostics", category: "Full Inspection", price: 15.00 }
  ]);

  // SEEDED Customers Profiles (CRM)
  const [customers, setCustomers] = useState<SimulatedCustomer[]>([
    { id: "cust_kh092", name: "Kiri Prasath", phone: "+855 16 990 120", type: "VIP customer", totalSpending: 1450.00, lastVisitDate: "2026-04-12", nextServiceDate: "2026-07-12", notes: "Prefers Castrol Titanium only. Highly detail-oriented. Drives Prius 2010.", status: "Checked In", vehicles: ["veh_prius2010"] },
    { id: "cust_kh104", name: "Serey Rath", phone: "+855 98 221 442", type: "Returning customer", totalSpending: 395.00, lastVisitDate: "2026-05-18", nextServiceDate: "2026-08-18", notes: "Acceled RX450h owner. Needs coolant inspections.", status: "Out of Shop", vehicles: ["veh_lex450"] },
    { id: "cust_kh085", name: "Sophea Srun", phone: "+855 12 555 984", type: "Fleet customer", totalSpending: 3220.00, lastVisitDate: "2026-05-25", nextServiceDate: "2026-06-25", notes: "Wholesale fleet trucks. Prefers Ford Ranger specific replacement components.", status: "In Progress", vehicles: ["veh_ranger"] },
    { id: "cust_kh111", name: "Oudom Meas", phone: "+855 77 413 881", type: "New customer", totalSpending: 45.00, lastVisitDate: "2026-05-29", nextServiceDate: "2026-08-29", notes: "First-time visitor. Found garage via Phnom Penh Service Locator.", status: "Checked In", vehicles: ["veh_byd"] },
    { id: "cust_kh049", name: "Chanlina Pen", phone: "+855 89 313 120", type: "Inactive customer", totalSpending: 890.00, lastVisitDate: "2025-12-10", nextServiceDate: "2026-03-10", notes: "Needs custom spark replacements. Not visited for over 5 months.", status: "Out of Shop", vehicles: ["veh_tundra"] }
  ]);

  // SEEDED Customer Feedback log
  const [feedbackList] = useState([
    { id: 1, customer: "Kiri Prasath", rating: 5, date: "2026-05-15", comments: "Clean battery cooling fan service. Inverter check completed with AI guidelines in minutes. Sen Sok's best shop.", speed: "Outstanding", quality: "Very Satisfied" },
    { id: 2, customer: "Sophea Srun", rating: 5, date: "2026-05-27", comments: "Brought 3 of our delivery Rangers. Prompt checkout and complete printable tax invoice.", speed: "Excellent", quality: "Satisfied" },
    { id: 3, customer: "Serey Rath", rating: 4, date: "2026-05-28", comments: "Reasonable diagnostic fee, clear hybrid diagnostics.", speed: "Good", quality: "Satisfied" }
  ]);

  // SEEDED quotations and status tracking
  const [quotations, setQuotations] = useState([
    { id: "QT-2026-004", customer: "Sophea Srun", vehicle: "Ford Ranger Wildtrak", service: "Solenoid Gearbox Diagnostics", cost: 180.00, date: "2026-05-29", status: "Awaiting Client Sign-Off" },
    { id: "QT-2026-005", customer: "Serey Rath", vehicle: "Lexus RX450h", service: "AC Replacement Core", cost: 340.00, date: "2026-05-28", status: "Approved by Customer" }
  ]);

  // Trigger Notifications Simulated logs
  const [notificationsLog, setNotificationsLog] = useState<string[]>([
    "Initial automated SMS reminder: Kiri Prasath Due for 185,000 km Hybrid Battery filter check (Sent 22h ago)",
    "Customer App Alert: Service status of Toyota Prius changed to 'Waiting for customer approval' (Sent 2h ago)"
  ]);

  // POS CART STATES
  const [posCart, setPosCart] = useState<POSItem[]>([]);
  const [posSelectedCustomerId, setPosSelectedCustomerId] = useState(customers[0].id);
  const [posDiscountPercentage, setPosDiscountPercentage] = useState(0);
  const [posPaymentMethod, setPosPaymentMethod] = useState("ABA Pay QR");
  const [posIsPaid, setPosIsPaid] = useState(true);
  const [generatedInvoice, setGeneratedInvoice] = useState<any | null>(null);

  // INVENTORY ADD ITEM
  const [newProdSku, setNewProdSku] = useState("");
  const [newProdName, setNewProdName] = useState("");
  const [newProdCategory, setNewProdCategory] = useState("Fluids & Engine Oil");
  const [newProdPurchasePrice, setNewProdPurchasePrice] = useState("");
  const [newProdSellingPrice, setNewProdSellingPrice] = useState("");
  const [newProdStock, setNewProdStock] = useState("");

  // EXISTING SCAN SYSTEM COMPATIBLE STATES
  const [selectedVehicleId, setSelectedVehicleId] = useState(vehicles[0]?.id || "");
  const [selectedScannedVehicle, setSelectedScannedVehicle] = useState<VehicleProfile | null>(vehicles[0] || null);
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'success'>('idle');
  const [isBusinessApproved, setIsBusinessApproved] = useState(true);

  // Job creator log states
  const [logCategory, setLogCategory] = useState("Engine Oil Service");
  const [logCost, setLogCost] = useState("45");
  const [logMileage, setLogMileage] = useState("");
  const [logNotes, setLogNotes] = useState("Replaced standard engine filters. Checked inverter water levels.");
  const [logLoading, setLogLoading] = useState(false);
  const [logSuccess, setLogSuccess] = useState(false);

  // Telegram dispatch state variables
  const [tgTargetCustomer, setTgTargetCustomer] = useState('g1'); // represent active garage
  const [tgTemplateType, setTgTemplateType] = useState('service_update');
  const [tgCustomText, setTgCustomText] = useState('');
  const [tgSending, setTgSending] = useState(false);
  const [tgSuccessInfo, setTgSuccessInfo] = useState('');
  const [tgErrorInfo, setTgErrorInfo] = useState('');
  const [tgStatusData, setTgStatusData] = useState<any>(null);

  // CRM Subtab & Templates states
  const [crmSubTab, setCrmSubTab] = useState<'dashboard' | 'message' | 'templates' | 'history' | 'blocked' | 'settings'>('dashboard');
  const [garageTemplates, setGarageTemplates] = useState<any[]>([]);
  const [selectedTmplId, setSelectedTmplId] = useState<string>('');
  const [editingTmplBody, setEditingTmplBody] = useState<string>('');
  const [editingTmplName, setEditingTmplName] = useState<string>('');
  const [editingTmplCategory, setEditingTmplCategory] = useState<string>('service_update');
  const [isEditingTmpl, setIsEditingTmpl] = useState<boolean>(false);
  const [telegramSentHistory, setTelegramSentHistory] = useState<any[]>([]);
  const [cronStatusMessage, setCronStatusMessage] = useState<string | null>(null);
  const [cronLoading, setCronLoading] = useState<boolean>(false);

  const fetchGarageTemplates = async () => {
    try {
      const res = await fetch("/api/telegram/garage-templates?garageId=g1");
      if (res.ok) {
        const list = await res.json();
        setGarageTemplates(list);
        const match = list.find((t: any) => t.id === selectedTmplId) || list[0];
        if (match) {
          setSelectedTmplId(match.id);
          setEditingTmplBody(match.messageBody);
          setEditingTmplName(match.templateName);
          setEditingTmplCategory(match.templateType || 'service_update');
        }
      }
    } catch (err) {
      console.error("Failed to load templates:", err);
    }
  };

  const fetchNotificationLogs = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        setTelegramSentHistory(await res.json());
      }
    } catch (err) {
      console.error("Failed to load logs:", err);
    }
  };

  // Run automated crawler simulating system-crons checks for oil dates, tire wear, and battery status
  const handleTriggerAutomatedReminders = async () => {
    setCronLoading(true);
    setCronStatusMessage(null);
    try {
      // Simulate calling Daily Automated Reminders
      const res = await fetch("/api/telegram/garage-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          garageId: "g1",
          templateType: "reminder",
          customText: "🔧 Automated System Checkup: Sophea Srun due for Ford Ranger Oil and Transmission diagnostic test (Scheduled check: Tomorrow)."
        })
      });
      if (res.ok) {
        setCronStatusMessage("SUCCESS: Daily Automated Reminder crawler successfully scanned customer database. Sent 1 alert to Sophea Srun (Kiri Prasath and Chanlina Pen muted/skipped by preferences).");
        fetchNotificationLogs();
        fetchTgStatus();
      } else {
        const errData = await res.json();
        setCronStatusMessage(`CRAWLIER FINISHED: Scanned 5 clients records. Output channel muted because of user global preferences. Status: ${errData.error || 'Muted'}`);
      }
    } catch (err: any) {
      setCronStatusMessage(`Crawler error: ${err?.message || err}`);
    } finally {
      setCronLoading(false);
    }
  };

  // Interactive diagnostic bay telemetry
  const [activeBays, setActiveBays] = useState([
    { id: 1, car: "Toyota Prius (2010)", status: "Repairing / Servicing", stage: "Engine Flush", timeRemaining: "15 min" },
    { id: 2, car: "Lexus RX450h (2015)", status: "Quality Check", stage: "Hybrid Cell Replace", timeRemaining: "Ready" },
    { id: 3, car: "Ford Ranger Wildtrak (2018)", status: "Waiting for Parts", stage: "Brake Machining", timeRemaining: "Delayed" },
    { id: 4, car: "EMPTY BAY", status: "Available", stage: "-", timeRemaining: "-" }
  ]);

  const [bookings, setBookings] = useState([
    { id: "b1", owner: "Kiri Prasath", vehicle: "BYD Atto 3 (2023)", type: "EV Leveling test", date: "Today, 4:30 PM", status: "Awaiting Arrival" },
    { id: "b2", owner: "Serey Rath", vehicle: "Toyota Tacoma (2008)", type: "Suspension check", date: "Tomorrow, 9:00 AM", status: "Confirmed" }
  ]);

  // AI Assistant Chat interactive prompt state
  const [aiInsightAnswer, setAiInsightAnswer] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Sync state if vehicles lists load
  useEffect(() => {
    if (vehicles.length > 0 && !selectedVehicleId) {
      setSelectedVehicleId(vehicles[0].id);
      setSelectedScannedVehicle(vehicles[0]);
    }
  }, [vehicles]);

  const fetchTgStatus = async () => {
    try {
      const res = await fetch("/api/telegram/status");
      if (res.ok) {
        const data = await res.json();
        setTgStatusData(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTgStatus();
    fetchGarageTemplates();
    fetchNotificationLogs();
  }, [activeTab, selectedTmplId]);

  const handleSendTgMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setTgSending(true);
    setTgSuccessInfo('');
    setTgErrorInfo('');
    try {
      const res = await fetch("/api/telegram/garage-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          garageId: "g1", // Active garage (Apsara Auto Repair)
          templateType: tgTemplateType,
          customText: tgCustomText
        })
      });

      const data = await res.json();
      if (res.ok) {
        setTgSuccessInfo(`Success! ${data.message || 'Telegram message dispatched successfully.'}`);
        setTgCustomText('');
        fetchTgStatus();
        if (data.log && data.log.message) {
          setNotificationsLog(p => [`Telegram Broadcast: ${data.log.message}`, ...p]);
        }
      } else {
        setTgErrorInfo(data.error || "Unhandled transmission error.");
      }
    } catch (err: any) {
      setTgErrorInfo(`Transmission failed: ${err?.message || err}`);
    } finally {
      setTgSending(false);
    }
  };

  // Existing check: simulate scan code decoding
  const handleScanCarSimulation = () => {
    setScanState('scanning');
    setTimeout(() => {
      const match = vehicles.find(v => v.id === selectedVehicleId);
      setSelectedScannedVehicle(match || null);
      if (match) {
        setLogMileage(String(match.mileage + 1200));
      }
      setScanState('success');
    }, 1200);
  };

  // QR Decoder Simulator for deep link format user request (mycarcarekh://customer/verify?userId=...)
  const handleTriggerDeepLinkScan = (deepLink: string) => {
    const params = new URLSearchParams(deepLink.split('?')[1]);
    const uId = params.get("userId");
    const vId = params.get("vehicleId");
    
    // Find customer and vehicles
    const cust = customers.find(c => c.id === uId);
    if (cust) {
      // Find matching vehicle
      const vProfile = vehicles.find(v => v.id === vId);
      if (vProfile) {
        setSelectedVehicleId(vProfile.id);
        setSelectedScannedVehicle(vProfile);
        setLogMileage(String(vProfile.mileage + 1000));
        setScanState('success');
        
        // Notify
        const newSMS = `Verified customer QR scan token for ${cust.name}. Placed vehicle brand "${vProfile.brand} ${vProfile.model}" directly into Diagnostic Bay 1.`;
        setNotificationsLog(p => [newSMS, ...p]);
      }
    }
  };

  // Log diagnostic service record
  const handleLogTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedScannedVehicle) return;

    setLogLoading(true);
    setLogSuccess(false);

    try {
      const success = await onLogRecordExternal({
        vehicleId: selectedScannedVehicle.id,
        serviceCategory: logCategory,
        cost: Number(logCost),
        mileage: Number(logMileage),
        provider: "Apsara Premium Diagnostics and Tuning",
        description: `[Admin Authenticated Log] ${logNotes}`,
        date: new Date().toISOString().split('T')[0]
      });

      if (success) {
        setLogSuccess(true);
        onRefreshData();
        
        const custName = customers.find(c => c.vehicles.includes(selectedScannedVehicle.id))?.name || "Customer";
        const logMsg = `Diagnostic Service Log written: ${logCategory} for ${custName} (${logCost} USD). Sent app validation approval request.`;
        setNotificationsLog(p => [logMsg, ...p]);
        
        setTimeout(() => setLogSuccess(false), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLogLoading(false);
    }
  };

  // CRM status/notes modifiers
  const handleModifyCustomerNotes = (id: string, notes: string) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, notes } : c));
  };

  // POS INVENTORY MODIFIERS
  const addToCart = (type: 'Service' | 'Product' | 'Package', item: any) => {
    // Permission check: Cashier/Manager/Owner can POS add
    setPosCart(current => {
      const existing = current.find(i => i.id === item.sku || i.id === item.id);
      if (existing) {
        return current.map(i => (i.id === item.sku || i.id === item.id) ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...current, {
        id: item.sku || item.id,
        name: item.name,
        qty: 1,
        price: item.sellingPrice || item.price,
        cost: item.purchasePrice,
        type
      }];
    });
  };

  const updateCartQty = (id: string, qty: number) => {
    if (qty <= 0) {
      setPosCart(prev => prev.filter(i => i.id !== id));
    } else {
      setPosCart(prev => prev.map(i => i.id === id ? { ...i, qty } : i));
    }
  };

  const handlePOSCheckoutSubmit = () => {
    if (posCart.length === 0) return;

    // Build receipt details
    const selectedCustomer = customers.find(c => c.id === posSelectedCustomerId)!;
    const invNo = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const subtotal = posCart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const discountAmount = subtotal * (posDiscountPercentage / 100);
    const total = subtotal - discountAmount;

    const invoiceObj = {
      invoiceNumber: invNo,
      date: new Date().toISOString().split('T')[0],
      customerName: selectedCustomer.name,
      customerPhone: selectedCustomer.phone,
      paymentMethod: posPaymentMethod,
      payStatus: posIsPaid ? "Paid" : "Unpaid",
      items: [...posCart],
      discountPerc: posDiscountPercentage,
      subtotal,
      discountAmount,
      total,
      cashier: `${userProfile?.name || "Keo Sorya"} (${currentRole})`
    };

    setGeneratedInvoice(invoiceObj);

    // Apply stock decrement in state
    setProducts(prevProducts => {
      return prevProducts.map(prod => {
        const cartItem = posCart.find(c => c.id === prod.sku);
        if (cartItem && cartItem.type === 'Product') {
          return { ...prod, stock: Math.max(0, prod.stock - cartItem.qty) };
        }
        return prod;
      });
    });

    // CRM Customer Spendings Update
    setCustomers(prev => prev.map(c => c.id === selectedCustomer.id ? {
      ...c,
      totalSpending: c.totalSpending + total,
      lastVisitDate: new Date().toISOString().split('T')[0]
    } : c));

    // Notifications push
    const notificationText = `Invoice Checkout successful: ${invNo} for ${selectedCustomer.name}. Amount: $${total.toFixed(2)} USD. Payments channels: ${posPaymentMethod}.`;
    setNotificationsLog(p => [notificationText, ...p]);

    // Clear cart
    setPosCart([]);
  };

  // INVENTORY ADJUSTER
  const handleStockAdjust = (sku: string, amount: number) => {
    if (currentRole === "Mechanic") {
      alert("Permission denied. Mechanics cannot adjust stock sheets.");
      return;
    }
    setProducts(prev => prev.map(p => p.sku === sku ? { ...p, stock: Math.max(0, p.stock + amount) } : p));
  };

  // INVENTORY REGISTER NEW
  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentRole === "Mechanic") {
      alert("Mechanics cannot submit SKUs.");
      return;
    }
    const newProd = {
      sku: newProdSku || `SKU-PART-${Math.floor(100 + Math.random() * 900)}`,
      name: newProdName,
      category: newProdCategory,
      brand: "General Import",
      supplier: "Phnom Penh Wholesaler",
      purchasePrice: Number(newProdPurchasePrice) || 5.00,
      sellingPrice: Number(newProdSellingPrice) || 12.00,
      stock: Number(newProdStock) || 10,
      minAlert: 5,
      location: "Bay B Cage"
    };

    setProducts(p => [...p, newProd]);
    setNewProdSku("");
    setNewProdName("");
    setNewProdPurchasePrice("");
    setNewProdSellingPrice("");
    setNewProdStock("");
  };

  // AI ADVISOR SCRIPTED INSIGHT ENGINE
  const handleRunAIInsight = (questionType: "revenue" | "reorder" | "promotion" | "streaks") => {
    setAiLoading(true);
    setAiInsightAnswer(null);

    setTimeout(() => {
      if (questionType === "revenue") {
        setAiInsightAnswer(
          "Your revenue increased by 14.5% this month! The main driver was the higher volume of standard synthetic oil change packages and AC repair jobs. VIP Kiri Prasath represents 8% of recent transaction volumes. Recommendations: Focus marketing on pre-monsoon water-proofing undercarriage coats scheduled next."
        );
      } else if (questionType === "reorder") {
        const lows = products.filter(p => p.stock <= p.minAlert);
        if (lows.length > 0) {
          setAiInsightAnswer(
            `ALERT: ${lows.length} items are below safety thresholds! Reorder 15 bottles of "${lows[0].name}" from "Standard Oils" today because weekly consumption is compounding due to the monsoon surge.`
          );
        } else {
          setAiInsightAnswer("All fluid and parts stocks are currently secure above safety limits.");
        }
      } else if (questionType === "promotion") {
        setAiInsightAnswer(
          "We identified 48 consumers who visited over 120 days ago but are due for standard recurring fluid checks. Run a custom 'Sen Sok Monsoon Traction Pack' promotion offering 10% discount off Brembo pad kits with free wiper blades replacement."
        );
      } else {
        setAiInsightAnswer(
          "Outstanding Staff Performance: Khem Somaly completed 18 diagnostic logs in May with a 98% customer approval rate speed. Safe operations threshold exceeded! Average vehicle completion time is 45 minutes."
        );
      }
      setAiLoading(false);
    }, 1000);
  };

  // Quotation approver Simulator
  const handleQuotationChangeStatus = (id: string, nextStatus: string) => {
    setQuotations(prev => prev.map(q => q.id === id ? { ...q, status: nextStatus } : q));
    const notifyStr = `Quotation status update: ${id} changed to "${nextStatus}" after customer interaction.`;
    setNotificationsLog(p => [notifyStr, ...p]);
  };

  // Trigger outbound promotion message
  const handleTriggerOutboundPromo = (custName: string) => {
    const notifyMsg = `Outbound SMS Campaign: Placed promotional custom checklist discount message to ${custName} directly.`;
    setNotificationsLog(p => [notifyMsg, ...p]);
    alert(`SMS and App push scheduled successfully for ${custName}!`);
  };

  // Helper check status styling
  const getCRMTypeColor = (type: string) => {
    if (type.includes("VIP")) return "bg-pink-500/10 text-pink-400 border border-pink-500/20";
    if (type.includes("Corporate") || type.includes("Fleet")) return "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20";
    if (type.includes("Returning")) return "bg-sky-500/10 text-sky-400 border border-sky-500/20";
    if (type.includes("Inactive")) return "bg-rose-500/10 text-rose-450 text-rose-400 border border-rose-500/20";
    return "bg-slate-800 text-slate-400 border border-slate-700";
  };

  return (
    <div className="space-y-6" id="garage-owner-admin-panel">
      
      {/* SECTION A: SYSTEM CONTROLS & COMPLIANCE (ROLE SWITCHER & MULTI-BRANCH SIMULATOR) */}
      <div className="bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-800 p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        {/* Left identity segment */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-400" />
            <select
              value={currentBranch}
              onChange={(e) => setCurrentBranch(e.target.value)}
              className="bg-transparent text-slate-100 font-extrabold text-sm focus:outline-none border-b border-dashed border-slate-700 cursor-pointer pr-3"
            >
              {branches.map(b => (
                <option key={b.id} value={b.name} className="bg-slate-950 font-bold">{b.name}</option>
              ))}
            </select>
          </div>
          <p className="text-[10px] text-slate-400 flex items-center gap-1">
            <Wrench className="w-3 h-3 text-slate-500" />
            <span>Active Diagnostics Licensing approval: <strong>MPTC-PP-9831-2025</strong></span>
          </p>
        </div>

        {/* Dynamic simulator workspace state indicator */}
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Simulator Role Permissions:</span>
          <div className="bg-slate-950 border border-slate-800/80 p-1 rounded-xl flex gap-1">
            {(["Owner", "Manager", "Mechanic", "Cashier"] as const).map((role) => (
              <button
                key={role}
                onClick={() => {
                  setCurrentRole(role);
                  if (role === "Mechanic") {
                    setActiveTab("dashboard"); // Mechanics blocked from POS Tab
                  }
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                  currentRole === role
                    ? "bg-emerald-500 text-slate-950 shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {role === "Owner" && <UserCheck className="w-3 h-3 shrink-0" />}
                <span>{role}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* COMPLIANCE ALERT CARDS TO NOTIFY REGARDING SWITCHED ROLE LIMITATIONS */}
      {currentRole === "Mechanic" && (
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-2.5 text-rose-400 text-xs shadow-md">
          <ShieldAlert className="w-4.5 h-4.5 text-rose-500 mt-0.5 shrink-0 animate-bounce" />
          <div className="space-y-0.5">
            <h4 className="font-bold">Role Limitation: Mechanic View Enabled</h4>
            <p className="text-rose-450 text-[11px] leading-relaxed">
              Mechanics are strictly restricted from POS checkouts, invoices deletion, custom stock reordering sheets, and pricing formulas. You can log service diagnostic checklists or update bay repairs telemetry.
            </p>
          </div>
        </div>
      )}

      {currentRole === "Cashier" && (
        <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-2.5 text-amber-300 text-xs shadow-md">
          <ShieldAlert className="w-4.5 h-4.5 text-amber-500 mt-0.5 shrink-0 animate-pulse" />
          <div className="space-y-0.5">
            <h4 className="font-bold">Role Limitation: Cashier View Enabled</h4>
            <p className="text-amber-400 text-[11px] leading-relaxed">
              Cashiers can create invoices and accept cash/ABA checkout, but cannot edit inventory wholesale purchase rates, adjust overall stores value margins, or review monthly profit charts.
            </p>
          </div>
        </div>
      )}

      {/* SECTION B: CORE NAVIGATION TABS */}
      <div className="flex border-b border-slate-800 pb-0.5 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`pb-3 px-4 text-xs font-bold transition-all relative shrink-0 cursor-pointer flex items-center gap-1.5 ${
            activeTab === "dashboard" ? "text-slate-100 border-b-2 border-emerald-500" : "text-slate-450 hover:text-slate-200"
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          <span>Dashboard Reports & Bays</span>
        </button>

        {currentRole !== "Mechanic" && (
          <button
            onClick={() => setActiveTab("pos")}
            className={`pb-3 px-4 text-xs font-bold transition-all relative shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeTab === "pos" ? "text-slate-100 border-b-2 border-emerald-500" : "text-slate-450 hover:text-slate-200"
            }`}
          >
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <span>Mini POS & Invoices</span>
            {posCart.length > 0 && (
              <span className="bg-pink-500 text-slate-950 font-mono text-[9px] font-extrabold px-1 rounded-full animate-bounce">
                {posCart.reduce((s, i) => s + i.qty, 0)}
              </span>
            )}
          </button>
        )}

        <button
          onClick={() => setActiveTab("crm")}
          className={`pb-3 px-4 text-xs font-bold transition-all relative shrink-0 cursor-pointer flex items-center gap-1.5 ${
            activeTab === "crm" ? "text-slate-100 border-b-2 border-emerald-500" : "text-slate-450 hover:text-slate-200"
          }`}
        >
          <Users className="w-3.5 h-3.5 text-sky-400" />
          <span>Customer CRM & QR Registry</span>
        </button>

        <button
          onClick={() => setActiveTab("inventory")}
          className={`pb-3 px-4 text-xs font-bold transition-all relative shrink-0 cursor-pointer flex items-center gap-1.5 ${
            activeTab === "inventory" ? "text-slate-100 border-b-2 border-emerald-500" : "text-slate-450 hover:text-slate-200"
          }`}
        >
          <Package className="w-3.5 h-3.5 text-indigo-450 text-indigo-400" />
          <span>SKU Inventory & Templates</span>
        </button>

        <button
          onClick={() => setActiveTab("staff")}
          className={`pb-3 px-4 text-xs font-bold transition-all relative shrink-0 cursor-pointer flex items-center gap-1.5 ${
            activeTab === "staff" ? "text-slate-100 border-b-2 border-emerald-500" : "text-slate-450 hover:text-slate-200"
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-amber-400" />
          <span>Staff Permissions</span>
        </button>
      </div>

      {/* SECTION C: ACTIVATED TAB CONTROLLER PANEL */}
      
      {/* TAB 1: DASHBOARD REPORT OVERVIEW */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          
          {/* Bento-grid of live KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-950/40 rounded-2xl border border-slate-800">
              <span className="text-[10px] tracking-wider uppercase font-extrabold text-slate-500">Today Revenue</span>
              <div className="flex transition-all justify-between items-baseline mt-1">
                <span className="text-xl font-black text-slate-100 tracking-tight">$1,450.00 <span className="text-[11px] font-sans font-normal text-slate-450 text-slate-400">USD</span></span>
                <span className="text-[9px] bg-emerald-500/10 text-emerald-400 font-mono font-bold px-1 py-0.2 rounded">+18.5%</span>
              </div>
              <span className="text-[9px] text-slate-500 block mt-1">Combined branches totals</span>
            </div>

            <div className="p-4 bg-slate-950/40 rounded-2xl border border-slate-800">
              <span className="text-[10px] tracking-wider uppercase font-extrabold text-slate-500">Today Orders</span>
              <div className="flex justify-between items-baseline mt-1">
                <span className="text-xl font-black text-slate-100">14 Jobs</span>
                <span className="text-[9px] text-emerald-400 font-bold">100% capacity</span>
              </div>
              <span className="text-[9px] text-slate-500 block mt-1">6 Pending, 8 Completed</span>
            </div>

            <div className="p-4 bg-slate-950/40 rounded-2xl border border-slate-800">
              <span className="text-[10px] tracking-wider uppercase font-extrabold text-slate-500">Inventory Value</span>
              <div className="flex justify-between items-baseline mt-1">
                <span className="text-xl font-black text-indigo-400">$2,410.50</span>
                {products.filter(p=>p.stock<=p.minAlert).length > 0 ? (
                  <span className="text-[9px] bg-rose-500/15 text-rose-400 font-bold px-1.5 py-0.5 rounded animate-pulse">Low Stock</span>
                ) : (
                  <span className="text-[9px] text-emerald-400 font-bold">Secure</span>
                )}
              </div>
              <span className="text-[9px] text-slate-500 block mt-1">{products.length} distinct spare part SKUs</span>
            </div>

            <div className="p-4 bg-slate-950/40 rounded-2xl border border-slate-800">
              <span className="text-[10px] tracking-wider uppercase font-extrabold text-slate-500">Public rating</span>
              <div className="flex justify-between items-baseline mt-1">
                <span className="text-xl font-black text-amber-400">4.9 / 5.0</span>
                <span className="text-[9px] text-indigo-400 font-bold flex items-center gap-0.5">
                  <Star className="w-2.5 h-2.5 fill-amber-450 text-amber-400" /> Verified
                </span>
              </div>
              <span className="text-[9px] text-slate-500 block mt-1">Based on CRM client feedback logs</span>
            </div>
          </div>

          {/* TWO COLUMN GRID: CHART AND AI INSTRUCTIONS ASSISTANT */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left box: Sales chart trends & Branch comparisons */}
            <div className="lg:col-span-7 bg-slate-950/30 rounded-2xl border border-slate-800 p-5 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <div className="space-y-0.5">
                  <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-300">Monthly Revenue & Volume Trend</h3>
                  <p className="text-[10px] text-slate-500">Interactive financial trends inside Cambodia</p>
                </div>
                <div className="flex gap-2">
                  <span className="inline-flex items-center gap-1 text-[9px] text-emerald-400 font-bold bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">
                    <Building2 className="w-3 h-3" /> Multi-Branch Enabled
                  </span>
                </div>
              </div>

              {/* Monthly stats trend SVG / CSS charts bars */}
              <div className="pt-3 h-48 flex items-end justify-between gap-3 bg-slate-950/60 p-4 rounded-xl border border-slate-900">
                {[
                  { m: "Dec", val: 3200, color: "bg-indigo-500" },
                  { m: "Jan", val: 4100, color: "bg-indigo-500" },
                  { m: "Feb", val: 3804, color: "bg-indigo-500" },
                  { m: "Mar", val: 5200, color: "bg-indigo-500" },
                  { m: "Apr", val: 4900, color: "bg-indigo-500" },
                  { m: "May (Monsoon)", val: 6850, color: "bg-gradient-to-t from-emerald-500 to-indigo-500" }
                ].map((item, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <span className="text-[9px] font-mono font-bold text-slate-350 tracking-tighter">${item.val.toLocaleString()}</span>
                    <div className={`w-full max-w-[32px] rounded-t-md transition-all duration-500 ${item.color}`} style={{ height: `${(item.val / 7000) * 100}%` }} />
                    <span className="text-[9px] font-semibold text-slate-500 text-center truncate w-full">{item.m}</span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 pt-1">
                <div className="p-2.5 rounded-xl border border-slate-850 bg-slate-950/40 text-xs">
                  <span className="text-slate-550 text-[10px] block font-bold text-slate-500">TOP PERFORMANCE SERVICE</span>
                  <p className="font-bold text-slate-100 mt-0.5">Synthetics Engine Package ($45.00)</p>
                  <span className="text-[9px] text-slate-500 font-mono">18 sales completed during May monsoons</span>
                </div>
                <div className="p-2.5 rounded-xl border border-slate-850 bg-slate-950/40 text-xs">
                  <span className="text-slate-550 text-[10px] block font-bold text-slate-550 text-slate-500">TOP SELLING SPARE SKU</span>
                  <p className="font-bold text-pink-400 mt-0.5">Brembo Brake Kits ($45.00)</p>
                  <span className="text-[9px] text-slate-550 text-slate-500 font-mono">12 units sold with average profit margins of 38%</span>
                </div>
              </div>
            </div>

            {/* Right box: AI Report Assistant dashboard panel */}
            <div className="lg:col-span-5 bg-gradient-to-br from-indigo-950/30 to-slate-950 p-5 rounded-2xl border border-indigo-500/10 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-900 pb-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">MyCar Care AI Business Assistant</h3>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                Connect live telemetry with model insights to evaluate diagnostic growth, customer retention profiles and restock alerts. Click a question below for an immediate report:
              </p>

              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => handleRunAIInsight("revenue")}
                  className="p-2 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-900 text-left text-[11px] text-indigo-300 font-medium flex justify-between items-center transition cursor-pointer"
                >
                  <span>📊 Why did my revenue increase this month?</span>
                  <ChevronRight className="w-3.5 h-3.5 text-indigo-400" />
                </button>
                <button
                  onClick={() => handleRunAIInsight("reorder")}
                  className="p-2 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-900 text-left text-[11px] text-indigo-300 font-medium flex justify-between items-center transition cursor-pointer"
                >
                  <span>⚠️ Which products need high-priority reorder?</span>
                  <ChevronRight className="w-3.5 h-3.5 text-indigo-400" />
                </button>
                <button
                  onClick={() => handleRunAIInsight("promotion")}
                  className="p-2 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-900 text-left text-[11px] text-indigo-300 font-medium flex justify-between items-center transition cursor-pointer"
                >
                  <span>🎯 Recommend my next marketing campaign</span>
                  <ChevronRight className="w-3.5 h-3.5 text-indigo-400" />
                </button>
                <button
                  onClick={() => handleRunAIInsight("streaks")}
                  className="p-2 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-900 text-left text-[11px] text-indigo-300 font-medium flex justify-between items-center transition cursor-pointer"
                >
                  <span>🔧 Which technician completed most tasks safely?</span>
                  <ChevronRight className="w-3.5 h-3.5 text-indigo-400" />
                </button>
              </div>

              <div className="bg-slate-950/90 rounded-xl p-3 border border-indigo-500/10 min-h-[90px] flex items-center justify-center">
                {aiLoading ? (
                  <div className="flex flex-col items-center gap-2">
                    <RefreshCw className="w-5 h-5 text-indigo-400 animate-spin" />
                    <span className="text-[10px] font-mono text-slate-500 animate-pulse">EVALUATING FINANCIAL PARAMETERS...</span>
                  </div>
                ) : aiInsightAnswer ? (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-extrabold text-pink-400 uppercase tracking-widest block font-mono">✦ AI Insight:</span>
                    <p className="text-[11px] text-slate-200 leading-relaxed font-sans">{aiInsightAnswer}</p>
                  </div>
                ) : (
                  <span className="text-slate-500 font-mono text-[10px] text-center">Click any diagnostic prompt to run smart analysis.</span>
                )}
              </div>
            </div>
          </div>

          {/* COMPATIBLE QR SCANNER & DIGITAL RECORD LOGGER ROW (PROMPT SPECIFIED SECURITY RULES PRESERVED) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left box: Live QR simulation check-in interface */}
            <div className="lg:col-span-6 bg-slate-950/30 rounded-2xl border border-slate-800 p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                <div className="flex items-center gap-1.5">
                  <QrCode className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-xs font-black text-slate-200 uppercase">Simulate Service Deep Link Scan</h3>
                </div>
                <span className="text-[9px] bg-emerald-500/10 text-emerald-400 font-mono font-bold px-2 py-0.5 rounded">QR Decrypt v2</span>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                Enter deep-link secure transit tags representing registered vehicles. This safely preloads customer segment details, prevents plain-text exposures, and verifies diagnostics safety code:
              </p>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase">Quick Transit Token Selector</label>
                  <select
                    value={selectedVehicleId}
                    onChange={(e) => {
                      setSelectedVehicleId(e.target.value);
                      const match = vehicles.find(v => v.id === e.target.value);
                      if (match) setSelectedScannedVehicle(match);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 p-2 text-xs rounded-xl text-slate-100"
                  >
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.brand} {v.model} ({v.year}) - Odo: {v.mileage.toLocaleString()} km
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleScanCarSimulation}
                    disabled={scanState === 'scanning'}
                    className="flex-1 py-2 px-3 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {scanState === 'scanning' ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <QrCode className="w-4 h-4" />
                        <span>Decrypt Scanner Tag</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      const deepLinkMock = `mycarcarekh://customer/verify?userId=cust_kh092&vehicleId=${selectedVehicleId}&token=sec_k89a`;
                      handleTriggerDeepLinkScan(deepLinkMock);
                    }}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition cursor-pointer"
                    title="Simulate reading a direct deep-linked QR string from owner app"
                  >
                    Format Link Scan
                  </button>
                </div>

                {/* Scanned Decrypted Profile specs card */}
                {scanState === 'success' && selectedScannedVehicle && (
                  <div className="p-3.5 bg-emerald-500/5 rounded-xl border border-emerald-500/20 space-y-2.5 animate-fadeIn">
                    <div className="flex justify-between items-center border-b border-emerald-500/10 pb-1.5">
                      <div>
                        <span className="text-[10px] font-extrabold text-slate-100 uppercase">{selectedScannedVehicle.brand} {selectedScannedVehicle.model} ({selectedScannedVehicle.year})</span>
                        <p className="text-[8px] font-mono text-slate-500 mt-0.5">Encrypted ID: {selectedScannedVehicle.id.substring(0, 12)}</p>
                      </div>
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-350 px-1.5 py-0.5 rounded border border-emerald-500/15 font-bold">APPROVED</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div>
                        <span className="text-slate-500 text-[9px] block uppercase font-bold">Registered Odo:</span>
                        <span className="font-mono text-slate-200">{selectedScannedVehicle.mileage.toLocaleString()} km</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[9px] block uppercase font-bold">Fuel Standard:</span>
                        <span className="text-slate-200">{selectedScannedVehicle.fuelType}</span>
                      </div>
                    </div>

                    {/* Preheated Model Weaknesses */}
                    {selectedScannedVehicle.weaknessReport && (
                      <div className="border-t border-emerald-500/10 pt-2 space-y-1.5">
                        <span className="text-[9px] font-bold text-amber-400 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Preheated Advisory Weaknesses ({selectedScannedVehicle.brand}):</span>
                        </span>
                        <div className="max-h-[60px] overflow-y-auto pr-1 space-y-1">
                          {selectedScannedVehicle.weaknessReport.commonIssues.slice(0, 2).map((item, index) => (
                            <div key={index} className="text-[9px] text-slate-300 flex items-start gap-1">
                              <span className="text-emerald-400 font-bold">•</span>
                              <span><strong>{item.issue}</strong>: {item.advice}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right box: Logger form to submit service log directly */}
            <div className="lg:col-span-6 bg-slate-950/30 rounded-2xl border border-slate-800 p-5 space-y-4">
              <div className="border-b border-slate-850 pb-2">
                <h3 className="text-xs font-black text-slate-200 uppercase flex items-center gap-1.5">
                  <ClipboardCheck className="w-5 h-5 text-emerald-400" />
                  <span>Digitize Maintenance Log Ticket</span>
                </h3>
              </div>

              {!selectedScannedVehicle ? (
                <div className="py-12 text-center text-slate-500 text-xs flex flex-col items-center justify-center space-y-2">
                  <Wrench className="w-8 h-8 text-slate-600 opacity-40 animate-pulse" />
                  <span>Simulate scanner check-in in left window to preload details.</span>
                </div>
              ) : (
                <form onSubmit={handleLogTicketSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500 uppercase block">Service Type</label>
                      <select
                        value={logCategory}
                        onChange={(e) => setLogCategory(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 p-2 text-xs rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500/40"
                      >
                        <option value="Engine Oil Service">Engine Oil Service</option>
                        <option value="Brake Service">Brake Service</option>
                        <option value="Tire Service">Tire Service</option>
                        <option value="Battery Service">Battery Service</option>
                        <option value="EV Service">High-Voltage EV Service</option>
                        <option value="AC Service">AC Service</option>
                        <option value="Full Inspection">Full Inspection / Audit</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500 uppercase block">Labor Cost ($ USD)</label>
                      <input
                        type="number"
                        required
                        value={logCost}
                        onChange={(e) => setLogCost(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 p-2 text-xs rounded-xl text-slate-200 font-mono focus:outline-none focus:border-emerald-500/40"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500 uppercase block">Odometer current (km)</label>
                      <input
                        type="number"
                        required
                        value={logMileage}
                        onChange={(e) => setLogMileage(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 p-2 text-xs rounded-xl text-slate-200 font-mono focus:outline-none focus:border-emerald-500/40"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500 uppercase block">Date log</label>
                      <input
                        type="text"
                        disabled
                        value={new Date().toISOString().split('T')[0]}
                        className="w-full bg-slate-950 border border-slate-850 p-2 text-xs rounded-xl text-slate-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase block">Mechanic Repair Notes</label>
                    <textarea
                      required
                      value={logNotes}
                      onChange={(e) => setLogNotes(e.target.value)}
                      rows={2}
                      className="w-full bg-slate-950 border border-slate-800 p-2 text-xs rounded-xl text-slate-200 resize-none focus:outline-none focus:border-emerald-500/40"
                    />
                  </div>

                  {logSuccess && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl text-[10px] text-emerald-400 flex items-center gap-1.5">
                      <Check className="w-4 h-4 shrink-0" />
                      <span>Approved! Digital certificate pushed for owner signature approval.</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={logLoading}
                    className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 uppercase tracking-wide cursor-pointer"
                  >
                    {logLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Database className="w-4 h-4" />
                        <span>Push Service Register</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* TELEMETRY WORKSTATIONS BAY & RESERVATION LIST */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Active bay workstations */}
            <div className="lg:col-span-7 bg-slate-950/30 rounded-2xl border border-slate-800 p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                <h3 className="text-xs font-bold text-slate-350 uppercase tracking-widest flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span>Workshop Bays Telemetry (Live)</span>
                </h3>
                <span className="text-[10px] text-slate-500">4 total bays</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {activeBays.map(bay => (
                  <div
                    key={bay.id}
                    className={`p-3.5 rounded-2xl border flex flex-col justify-between h-28 relative ${
                      bay.status === 'Available'
                        ? "bg-slate-950/20 border-dashed border-slate-850 text-slate-500"
                        : "bg-slate-950/80 border-slate-800"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-extrabold uppercase font-mono tracking-widest text-slate-500">Station {bay.id}</span>
                      <span className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded ${
                        bay.status.includes("Repairing") ? "bg-amber-500/10 text-amber-300 animate-pulse" :
                        bay.status.includes("Quality") ? "bg-sky-500/10 text-sky-400" :
                        bay.status === "Available" ? "bg-slate-800 text-slate-400" : "bg-rose-500/10 text-rose-400"
                      }`}>
                        {bay.status}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="text-xs font-bold text-slate-200">{bay.car}</div>
                      <span className="text-[10px] text-slate-500 block truncate">Task: <strong>{bay.stage}</strong></span>
                    </div>

                    <div className="flex justify-between items-center mt-1 border-t border-slate-900 pt-1">
                      <span className="text-[9px] text-slate-500 font-mono">Release: {bay.timeRemaining}</span>
                      {bay.status !== "Available" && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              // Change status simulator
                              const nextStatuses: Record<string, string> = {
                                "Repairing / Servicing": "Quality Check",
                                "Quality Check": "Completed",
                                "Waiting for Parts": "Repairing / Servicing"
                              };
                              const currentStatus = bay.status;
                              setActiveBays(prev => prev.map(b => b.id === bay.id ? { ...b, status: nextStatuses[currentStatus] || "Available", stage: nextStatuses[currentStatus] === "Completed" ? "-" : b.stage } : b));
                            }}
                            className="bg-slate-800 hover:bg-slate-705 px-1.5 py-0.5 rounded text-[8px] font-bold text-slate-300 cursor-pointer"
                          >
                            Advance ➔
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live SMS & Alerts Event Notifications Stream */}
            <div className="lg:col-span-5 bg-slate-950/30 rounded-2xl border border-slate-800 p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                <h3 className="text-xs font-bold text-slate-350 uppercase tracking-widest flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-pink-400" />
                  <span>App Notifications & SMS logs</span>
                </h3>
                <span className="text-[8px] text-slate-500 font-mono">Stream Active</span>
              </div>

              <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                {notificationsLog.map((log, index) => (
                  <div key={index} className="p-2.5 rounded-xl border border-slate-900 bg-slate-950/60 text-[10.5px] text-slate-300 leading-normal flex items-start gap-2 animate-fadeIn">
                    <Send className="w-3.5 h-3.5 text-indigo-400 mt-0.5 shrink-0" />
                    <span>{log}</span>
                  </div>
                ))}
              </div>

              <div className="p-2 bg-pink-500/5 rounded-xl text-[10px] text-slate-400 flex items-start gap-1 pb-1">
                <Sparkles className="w-3.5 h-3.5 text-pink-400 mt-0.5 shrink-0" />
                <span>Customer alerts prevent compliance audit queries. Ensure all logged services include correct odometer readouts.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MINI POS SYSTEM & INVOICE CHECKOUT */}
      {activeTab === "pos" && (
        <div className="space-y-6 animate-fadeIn">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left box: POS Catalog Selector */}
            <div className="lg:col-span-7 bg-slate-950/30 rounded-2xl border border-slate-800 p-5 space-y-5">
              <div className="flex justify-between items-center border-b border-slate-800/80 pb-2.5">
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-200">Catalog POS Sourcing</h3>
                  <p className="text-[10px] text-slate-500">Pick products or services to pack onto checkout basket</p>
                </div>
                <span className="text-xs bg-slate-900 p-1 rounded-xl text-slate-400">Main Warehouse</span>
              </div>

              {/* SERVICES LIST SECTION */}
              <div className="space-y-2.5">
                <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest block font-mono">1. Available Service Templates</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {serviceTemplates.map(srv => (
                    <div key={srv.id} className="p-3 rounded-xl border border-slate-850 bg-slate-950/40 hover:border-indigo-500/20 hover:bg-slate-900/30 flex justify-between items-center transition">
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-slate-200 block">{srv.name}</span>
                        <span className="text-[10px] text-slate-450 text-slate-400 block">{srv.category}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-mono font-extrabold block text-emerald-400">${srv.price.toFixed(2)}</span>
                        <button
                          onClick={() => addToCart('Service', srv)}
                          className="mt-1 px-2 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-slate-100 text-[10px] font-bold transition cursor-pointer"
                        >
                          + Add POS
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* PRODUCTS SKU SECTION */}
              <div className="space-y-2.5 pt-2">
                <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest block font-mono">2. Inventory Spare Parts SKU</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {products.map(prod => (
                    <div key={prod.sku} className="p-3 rounded-xl border border-slate-850 bg-slate-950/40 hover:border-indigo-500/20 hover:bg-slate-900/30 flex justify-between items-center transition">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-200">{prod.name}</span>
                          {prod.stock <= prod.minAlert && (
                            <span className="bg-rose-500/10 text-rose-450 text-rose-400 text-[8px] font-bold px-1 rounded animate-pulse">Low</span>
                          )}
                        </div>
                        <span className="text-[9px] text-slate-500 block font-mono">SKU: {prod.sku} • Stock: <strong>{prod.stock} left</strong></span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-mono font-extrabold block text-slate-200">${prod.sellingPrice.toFixed(2)}</span>
                        <button
                          disabled={prod.stock === 0}
                          onClick={() => addToCart('Product', prod)}
                          className="mt-1 px-2 py-0.5 rounded bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 disabled:text-slate-600 font-bold text-slate-950 text-[10px] transition cursor-pointer"
                        >
                          {prod.stock === 0 ? "Out" : "+ Add POS"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right box: Realtime Bill Builder Invoice compiler */}
            <div className="lg:col-span-5 bg-slate-950/40 rounded-2xl border border-slate-800 p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                <h3 className="text-xs font-black text-slate-200 uppercase flex items-center gap-1">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <span>Basket Invoice Compiler</span>
                </h3>
                <span className="text-[8.5px] bg-indigo-500/10 text-indigo-400 font-bold px-1.5 py-0.5 rounded">Checkout Gate</span>
              </div>

              {/* Basket list of selected products or items */}
              {posCart.length === 0 ? (
                <div className="py-12 border border-slate-850 rounded-xl bg-slate-950/60 text-center text-slate-500 text-xs flex flex-col items-center justify-center space-y-2">
                  <Package className="w-8 h-8 text-slate-600 opacity-40 animate-bounce" />
                  <span>No items added into POS checkout basket. Click "+ Add POS" on catalog entries.</span>
                </div>
              ) : (
                <div className="space-y-4">
                  
                  {/* Select Customer Profile registry to tie to invoice */}
                  <div className="space-y-1 bg-slate-950/90 p-3 rounded-xl border border-slate-900">
                    <label className="text-[9px] font-extrabold text-indigo-400 block uppercase font-mono">Select Invoice Customer Profile</label>
                    <select
                      value={posSelectedCustomerId}
                      onChange={(e) => setPosSelectedCustomerId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 p-2 text-xs rounded-lg text-slate-100 font-sans focus:outline-none"
                    >
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.type}) - Phone: {c.phone}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
                    {posCart.map(item => (
                      <div key={item.id} className="p-2 bg-slate-950 rounded-lg border border-slate-900 flex justify-between items-center text-xs gap-3">
                        <div className="truncate flex-1 space-y-0.5">
                          <span className="font-bold text-slate-205 text-slate-200 block truncate">{item.name}</span>
                          <span className="text-[9px] text-slate-500 uppercase">{item.type} • Price: ${item.price.toFixed(2)}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => updateCartQty(item.id, item.qty - 1)}
                            className="w-5 h-5 rounded bg-slate-800 flex items-center justify-center text-slate-320 font-black hover:bg-slate-705 text-slate-350 cursor-pointer"
                          >
                            -
                          </button>
                          <span className="font-mono font-bold text-slate-200 text-xs w-4 text-center">{item.qty}</span>
                          <button
                            onClick={() => updateCartQty(item.id, item.qty + 1)}
                            className="w-5 h-5 rounded bg-slate-800 flex items-center justify-center text-slate-320 font-black hover:bg-slate-705 text-slate-350 cursor-pointer"
                          >
                            +
                          </button>
                        </div>

                        <div className="text-right font-mono font-extrabold text-slate-200 w-16 shrink-0">
                          ${(item.price * item.qty).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pricing slider and discounts */}
                  <div className="p-3 rounded-xl border border-slate-900 bg-slate-950/60 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-bold flex items-center gap-1">
                        <Percent className="w-3.5 h-3.5 text-pink-400" /> Adjust Discount:
                      </span>
                      <select
                        value={posDiscountPercentage}
                        onChange={(e) => setPosDiscountPercentage(Number(e.target.value))}
                        className="bg-slate-950 border border-slate-850 p-1 text-xs rounded text-slate-200 font-mono"
                      >
                        <option value="0">0% Discount</option>
                        <option value="5">5% Campaign Off</option>
                        <option value="10">10% VIP Off</option>
                        <option value="15">15% Fleet Off</option>
                        <option value="20">20% Partner Off</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-bold">Payment Methods</span>
                      <select
                        value={posPaymentMethod}
                        onChange={(e) => setPosPaymentMethod(e.target.value)}
                        className="bg-slate-950 border border-slate-850 p-1 text-xs rounded text-slate-200"
                      >
                        <option value="ABA Pay QR">ABA Pay QR Code</option>
                        <option value="Acleda Realtime">Acleda QR Terminal</option>
                        <option value="Cash USD">Cash in USD</option>
                        <option value="Visa Card">Visa / Mastercard</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-bold">Settlement Status</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={posIsPaid}
                          onChange={(e) => setPosIsPaid(e.target.checked)}
                          id="is-paid-indicator"
                          className="rounded border-slate-800 text-emerald-500 accent-emerald-500 cursor-pointer"
                        />
                        <label htmlFor="is-paid-indicator" className="text-[10px] text-slate-300 font-semibold cursor-pointer">Set Paid Settlement</label>
                      </div>
                    </div>

                    {/* Breakdown counts */}
                    <div className="border-t border-slate-900 pt-2 space-y-1 text-xs font-mono">
                      <div className="flex justify-between text-slate-500">
                        <span>Items Subtotal:</span>
                        <span>${posCart.reduce((s, i) => s + (i.price * i.qty), 0).toFixed(2)}</span>
                      </div>
                      {posDiscountPercentage > 0 && (
                        <div className="flex justify-between text-pink-400">
                          <span>Discount Applied:</span>
                          <span>-${(posCart.reduce((s, i) => s + (i.price * i.qty), 0) * (posDiscountPercentage / 100)).toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-slate-100 font-bold border-t border-slate-900 pt-1.5 text-sm">
                        <span>Total Checkout:</span>
                        <span className="text-emerald-400">${(posCart.reduce((s, i) => s + (item => item.price * item.qty)(i), 0) * (1 - posDiscountPercentage/100)).toFixed(2)} USD</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handlePOSCheckoutSubmit}
                    className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-extrabold text-xs rounded-xl tracking-wider uppercase transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <ClipboardCheck className="w-4 h-4" />
                    <span>Run Transaction & Print Invoice</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ACTIVE GENERATED INVOICE MODAL OR CONTAINER PIECE (PROMPTS SPECIFIED INVOICE DETAIL RULES PRINTABLE) */}
          {generatedInvoice && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-slate-950 rounded-2xl border border-slate-800 p-6 max-w-2xl mx-auto space-y-5 shadow-2xl relative overflow-hidden"
              id="invoice-printable-card"
            >
              <div className="absolute top-0 right-0 p-3 flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-slate-100 font-semibold text-[10px] flex items-center gap-1 transition cursor-pointer"
                >
                  <Printer className="w-3 h-3" /> Print Invoice
                </button>
                <button
                  onClick={() => setGeneratedInvoice(null)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-350 text-[10px] transition cursor-pointer"
                >
                  Dismiss Invoice Close
                </button>
              </div>

              {/* Printable receipt structure format */}
              <div className="border border-slate-850 p-5 rounded-xl bg-slate-950 space-y-4 text-xs font-mono text-slate-300">
                
                {/* Header info */}
                <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-800">
                  <h4 className="text-sm font-black uppercase text-slate-100">Apsara Premium Diagnostics</h4>
                  <p className="text-[10px] text-slate-500 text-slate-400">MPTC Registered No: MPTC-PP-9831-2025</p>
                  <p className="text-[10px] text-slate-400">Phnom Penh Outlet, Teuk Thla, Cambodia</p>
                  <p className="text-[10px] text-slate-500 mt-2"><strong>INVOICE: {generatedInvoice.invoiceNumber}</strong> • Date: {generatedInvoice.date}</p>
                </div>

                {/* Consumer identities validation */}
                <div className="grid grid-cols-2 gap-3 pb-3 border-b border-dashed border-slate-800 text-[10.5px]">
                  <div>
                    <span className="text-slate-500 block uppercase text-[9px] font-bold">Bill Customer:</span>
                    <strong className="text-slate-200">{generatedInvoice.customerName}</strong>
                    <p className="text-slate-400">{generatedInvoice.customerPhone}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase text-[9px] font-bold">Settlement details:</span>
                    <p className="text-slate-200">Receipt Gate: {generatedInvoice.paymentMethod}</p>
                    <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${generatedInvoice.payStatus === 'Paid' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400 animate-pulse'}`}>{generatedInvoice.payStatus}</span>
                  </div>
                </div>

                {/* Basket columns */}
                <div className="space-y-2 py-1">
                  <div className="grid grid-cols-12 text-[10px] text-slate-500 font-extrabold pb-1 border-b border-slate-900">
                    <span className="col-span-6 uppercase">Description & SKU</span>
                    <span className="col-span-2 text-center uppercase">Qty</span>
                    <span className="col-span-2 text-right uppercase">Rate</span>
                    <span className="col-span-2 text-right uppercase">Amount</span>
                  </div>

                  {generatedInvoice.items.map((item: any, idx: number) => (
                    <div key={idx} className="grid grid-cols-12 text-[10.5px]">
                      <span className="col-span-6 text-slate-200 truncate">{item.name}</span>
                      <span className="col-span-2 text-center font-mono">{item.qty}</span>
                      <span className="col-span-2 text-right font-mono">${item.price.toFixed(2)}</span>
                      <span className="col-span-2 text-right font-mono text-slate-100">${(item.price * item.qty).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Subtotals checkout calculation details */}
                <div className="border-t border-dashed border-slate-800 pt-3 space-y-1 text-right max-w-xs ml-auto">
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>Items Subtotal:</span>
                    <span className="font-mono">${generatedInvoice.subtotal.toFixed(2)}</span>
                  </div>
                  {generatedInvoice.discountPerc > 0 && (
                    <div className="flex justify-between text-pink-400 text-[11px]">
                      <span>Discount ({generatedInvoice.discountPerc}%):</span>
                      <span className="font-mono">-${generatedInvoice.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-105 text-slate-100 font-bold border-t border-slate-900 pt-1.5 text-xs">
                    <span>Total USD:</span>
                    <span className="text-emerald-400 font-mono">${generatedInvoice.total.toFixed(2)} USD</span>
                  </div>
                </div>

                {/* Footer notes & Next recommended diagnostic checkpoint */}
                <div className="border-t border-dashed border-slate-800 pt-3 text-center space-y-1.5">
                  <div className="p-2 rounded bg-slate-900 text-[10px] text-slate-400 text-left">
                    <span className="text-amber-400 font-bold block mb-0.5">⚙️ Next Service Recommendation:</span>
                    <span>Monitor dual cooling inverter fan efficiency level. Standard test scheduled at 187,000 km.</span>
                  </div>
                  <span className="text-[9.5px] text-slate-500 block uppercase tracking-wider font-extrabold mt-2">Logged by: {generatedInvoice.cashier}</span>
                  <p className="text-[9px] text-slate-600 font-bold italic">*** Secure AI-Signed Blockchain Log Certification ***</p>
                </div>

              </div>
            </motion.div>
          )}

        </div>
      )}

      {/* TAB 3: CUSTOMER CRM & QR REGISTRY */}
      {activeTab === "crm" && (
        <div className="space-y-6 animate-fadeIn">

          {/* TELEGRAM PARTNER OUTBOUND COMMUNICATION HUB */}
          <div className="bg-slate-950/40 rounded-3xl border border-slate-800 p-6 space-y-6">
            
            {/* Outreach Header & Subtab Selector */}
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 border-b border-slate-850 pb-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-cyan-500/15 rounded-lg border border-cyan-500/20">
                    <MessageSquare className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-100 uppercase tracking-wider">Outreach & Customer Telegram Hub</h3>
                    <p className="text-xs text-slate-400">Manage templates, automated scheduler cron crawlers, direct alerts, and access consent.</p>
                  </div>
                </div>
              </div>

              {/* Subtabs Menu */}
              <div className="flex flex-wrap gap-1.5 bg-slate-950 p-1 rounded-2xl border border-slate-850 self-start lg:self-center">
                <button
                  type="button"
                  onClick={() => setCrmSubTab('dashboard')}
                  className={`px-3 py-1.5 rounded-xl text-[10.5px] uppercase font-black transition cursor-pointer select-none ${
                    crmSubTab === 'dashboard' ? 'bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/10' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Dashboard & CRM
                </button>
                <button
                  type="button"
                  onClick={() => setCrmSubTab('message')}
                  className={`px-3 py-1.5 rounded-xl text-[10.5px] uppercase font-black transition cursor-pointer select-none ${
                    crmSubTab === 'message' ? 'bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/10' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Direct Msg
                </button>
                <button
                  type="button"
                  onClick={() => setCrmSubTab('templates')}
                  className={`px-3 py-1.5 rounded-xl text-[10.5px] uppercase font-black transition cursor-pointer select-none ${
                    crmSubTab === 'templates' ? 'bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/10' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Templates
                </button>
                <button
                  type="button"
                  onClick={() => setCrmSubTab('history')}
                  className={`px-3 py-1.5 rounded-xl text-[10.5px] uppercase font-black transition cursor-pointer select-none ${
                    crmSubTab === 'history' ? 'bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/10' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Sent Logs
                </button>
                <button
                  type="button"
                  onClick={() => setCrmSubTab('blocked')}
                  className={`px-3 py-1.5 rounded-xl text-[10.5px] uppercase font-black transition cursor-pointer select-none ${
                    crmSubTab === 'blocked' ? 'bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/10' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Access Grid
                </button>
              </div>
            </div>

            {/* CONDITIONAL RENDERING OF SUBTABS */}

            {/* SUBTAB 1: CRM & SCHEDULER CRAWLER DASHBOARD */}
            {crmSubTab === 'dashboard' && (
              <div className="space-y-6">
                
                {/* Visual Telemetry Matrix */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-sans">
                  <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40">
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">Total CRM Clients</span>
                    <strong className="text-xl font-black text-slate-200 block mt-0.5">{customers.length} Accounts</strong>
                    <span className="text-[8.5px] text-slate-500 block">Active Cambodian VIP users</span>
                  </div>
                  
                  <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40">
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">Bot Connection Pairing</span>
                    <strong className="text-xl font-black text-emerald-400 block mt-0.5">
                      {tgStatusData?.settings?.telegramConnected ? "Connected 🟢" : "Simulated Online"}
                    </strong>
                    <span className="text-[8.5px] text-slate-500 block">Pairing code verification active</span>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40">
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">Daily Msg Limit</span>
                    <strong className="text-xl font-black text-indigo-400 block mt-0.5">5 Per Partner</strong>
                    <span className="text-[8.5px] text-slate-500 block">Safeguards from API suspension</span>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40">
                    <span className="text-[9px] uppercase font-bold text-slate-500 block font-bold text-slate-550 block">User Consent Mutes</span>
                    <strong className="text-xl font-black text-amber-500 block mt-0.5">Opt-In Guard</strong>
                    <span className="text-[8.5px] text-slate-500 block">Requires explicit chat links</span>
                  </div>
                </div>

                {/* Automation Crawler / Scheduler Engine Box */}
                <div className="p-5 bg-indigo-950/20 rounded-2xl border border-indigo-500/10 space-y-3 font-sans">
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
                    <div className="space-y-1">
                      <h4 className="text-xs font-black uppercase text-indigo-400 tracking-wider">Automated Campaign Reminder Crawler (Cron-Job Simulator)</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed max-w-2xl">
                        Simulate the system's background crawler which automatically executes checks periodically. It parses registered mileage thresholds, fluid statuses, and upcoming oil dates, then files direct Telegram alarms to authorized users.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleTriggerAutomatedReminders}
                      disabled={cronLoading}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl tracking-wide uppercase transition shrink-0 cursor-pointer"
                    >
                      {cronLoading ? "Scanning Engine..." : "Simulate Daily Scan 🔄"}
                    </button>
                  </div>

                  {cronStatusMessage && (
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 text-[10.5px] font-mono leading-relaxed text-indigo-300">
                      {cronStatusMessage}
                    </div>
                  )}
                </div>

                {/* CRM Search & Registry Details */}
                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-slate-850 pb-3">
                    <div>
                      <dt className="text-xs font-black text-slate-200 uppercase tracking-widest">Active CRM Customer Registry</dt>
                      <dd className="text-[10px] text-slate-500">Track visit histories, membership segments, and next scheduled check dates</dd>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-850 w-full md:max-w-xs shrink-0 h-9">
                      <Search className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <input
                        type="text"
                        placeholder="Search clients CRM name..."
                        className="bg-transparent text-xs text-slate-200 focus:outline-none w-full"
                        onChange={(e) => {
                          const query = e.target.value.toLowerCase();
                          setCustomers(prev => prev.map(c => {
                            if (c.name.toLowerCase().includes(query)) return { ...c, visible: true };
                            return { ...c, visible: false };
                          }));
                        }}
                      />
                    </div>
                  </div>

                  {/* Customer registry bento-like listing */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {customers.filter(c => c.visible !== false).map(cust => (
                      <div key={cust.id} className="p-4 rounded-2xl border border-slate-850 bg-slate-950/45 hover:border-slate-800 transition space-y-3.5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-slate-800/5 rounded-full blur-xl" />
                        
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <strong className="text-sm font-extrabold text-slate-100">{cust.name}</strong>
                              <span className={`text-[8.5px] font-extrabold px-1.5 rounded-full uppercase tracking-wider ${getCRMTypeColor(cust.type)}`}>
                                {cust.type}
                              </span>
                            </div>
                            <span className="text-[9px] text-slate-500 font-mono">ID: {cust.id} • Phone: {cust.phone}</span>
                          </div>

                          <div className="text-right">
                            <span className="text-[8px] font-mono text-slate-500 block uppercase font-bold">Total spent:</span>
                            <strong className="text-emerald-400 font-mono text-sm">${cust.totalSpending.toFixed(2)}</strong>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-1 text-[10.5px]">
                          <div>
                            <span className="text-[9px] text-slate-500 block font-bold uppercase tracking-wide">Last service:</span>
                            <span className="text-slate-300 block mt-0.5">{cust.lastVisitDate}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 block font-bold uppercase tracking-wide">Next Check Suggested:</span>
                            <span className="text-amber-400 block mt-0.5 font-bold">{cust.nextServiceDate}</span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-semibold text-slate-500 uppercase block">Internal Garage Notes & Specific Sourcing Requirements</label>
                          <textarea
                            value={cust.notes || ''}
                            onChange={(e) => handleModifyCustomerNotes(cust.id, e.target.value)}
                            rows={2}
                            className="w-full bg-slate-950 border border-slate-900 p-2 text-[10px] text-slate-300 rounded-xl resize-none focus:outline-none focus:border-slate-800 font-sans"
                            placeholder="Add car specific notes (e.g. requires dual exhaust gasket, prefer synthetics brand oil)..."
                          />
                        </div>

                        <div className="flex gap-2 pt-1.5 border-t border-slate-900/40">
                          <button
                            type="button"
                            onClick={() => {
                              alert(`Successfully pushed next maintenance schedule template SMS log details directly to customer phone ${cust.phone}`);
                              setNotificationsLog(p => [`Manual Service alert pushed to ${cust.name} - Next recurring scheduled date configured: ${cust.nextServiceDate}.`, ...p]);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-slate-100 text-[10px] font-bold tracking-wide transition flex items-center gap-1 cursor-pointer"
                          >
                            <Bell className="w-3 h-3 text-indigo-300" /> Push Next Check Reminder
                          </button>

                          <button
                            type="button"
                            onClick={() => handleTriggerOutboundPromo(cust.name)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[10px] font-bold transition cursor-pointer"
                          >
                            Outbound Promo Coup
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SUBTAB 2: DIRECT MESSAGE DISPATCH ENGINE */}
            {crmSubTab === 'message' && (
              <div className="space-y-6">
                <div className="p-5 bg-slate-950/85 rounded-2xl border border-slate-850 space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-xs font-extrabold uppercase text-cyan-400 tracking-wider">Outbound Direct Messenger Dispatcher</h4>
                    <p className="text-[11px] text-slate-400">
                      Compose customized texts or trigger template categories to paired user numbers. The system checks connection locks and permission controls before dispatching.
                    </p>
                  </div>

                  {/* Consent Summary Board */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-900 text-xs text-slate-400">
                    <div className="space-y-1">
                      <span className="text-[8px] uppercase tracking-wider text-slate-500 block">General Linked Profile</span>
                      <strong className="text-slate-100 font-extrabold flex items-center gap-1.5">
                        Yeon Pisith (ID: 1)
                        {tgStatusData?.settings?.telegramConnected ? (
                          <span className="text-[8px] bg-emerald-500/15 text-emerald-400 px-1.5 py-0.2 rounded font-bold uppercase">Paired Bot</span>
                        ) : (
                          <span className="text-[8px] bg-rose-500/15 text-rose-455 px-1.5 py-0.2 rounded font-bold uppercase">Simulated Online</span>
                        )}
                      </strong>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[8px] uppercase tracking-wider text-slate-500 block">Mute Notification Switch</span>
                      <strong className={`font-mono font-bold ${tgStatusData?.settings?.telegramEnabled ? "text-emerald-400" : "text-amber-450 text-slate-400"}`}>
                        {tgStatusData?.settings?.telegramEnabled ? "ON (Consented)" : "OFF (Muted Overall)"}
                      </strong>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[8px] uppercase tracking-wider text-slate-500 block">Apsara Permission Status</span>
                      {(() => {
                        const pPerm = tgStatusData?.permissions?.find((p: any) => p.garageId === 'g1');
                        if (pPerm?.reportedSpam) {
                          return <strong className="text-red-500 font-bold uppercase">REPORTED SPAM 🛡️</strong>;
                        }
                        if (pPerm?.blockedByUser) {
                          return <strong className="text-rose-500 font-bold uppercase">Blocked by Client 🛑</strong>;
                        }
                        return <strong className="text-emerald-400 font-bold">Whitelisted Ok 🟢</strong>;
                      })()}
                    </div>

                    <div className="space-y-1">
                      <span className="text-[8px] uppercase tracking-wider text-slate-500 block">Daily Message Budget</span>
                      {(() => {
                        const pPerm = tgStatusData?.permissions?.find((p: any) => p.garageId === 'g1');
                        const count = pPerm?.dailyMessagesCount || 0;
                        return (
                          <strong className={`font-sans ${count >= 5 ? 'text-red-500' : 'text-slate-205'}`}>
                            {count} / 5 sent today
                          </strong>
                        );
                      })()}
                    </div>
                  </div>

                  {/* DISPATCH CONTROLLER FORM */}
                  <form onSubmit={handleSendTgMessage} className="space-y-4 text-xs font-sans">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-400 uppercase font-bold">Target Recipient (CRM Select)</label>
                        <select
                          className="w-full bg-slate-900 border border-slate-800 p-2.5 text-slate-200 text-xs font-semibold rounded-xl focus:outline-none cursor-pointer"
                        >
                          {customers.map(c => (
                            <option key={c.id} value={c.id}>{c.name} ({c.phone}) - {c.type}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-400 uppercase font-bold">Select Template Category</label>
                        <select
                          value={tgTemplateType}
                          onChange={(e) => setTgTemplateType(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 p-2.5 text-slate-200 text-xs font-semibold rounded-xl focus:outline-none cursor-pointer"
                        >
                          <option value="service_update">🔧 Diagnostics / Service Status</option>
                          <option value="pickup">🏁 Ready for Pickup Release</option>
                          <option value="invoice">🧾 Invoice Bill Finalization</option>
                          <option value="payment">⏰ Payment Reminder Alert</option>
                          <option value="quotation">📋 Quotation Request Sign-off</option>
                          <option value="reminder">📅 Suggested Maintenance Event</option>
                          <option value="promotion">✨ Coupon & Special Promotion</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-400 uppercase font-bold">Custom Notification Text Override (Optional)</label>
                      <textarea
                        placeholder="Type customized override context here... Leave empty to fetch preheated layout matched to category."
                        value={tgCustomText}
                        onChange={(e) => setTgCustomText(e.target.value)}
                        rows={3}
                        className="w-full bg-slate-900 border border-slate-800 p-3 text-slate-200 text-xs rounded-xl focus:outline-none focus:border-slate-700 resize-none font-sans"
                      />
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="submit"
                        disabled={tgSending}
                        className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black uppercase text-xs rounded-xl tracking-wider shadow-lg hover:shadow-emerald-500/10 transition-all cursor-pointer inline-flex items-center gap-1.5"
                      >
                        {tgSending ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Transmitting...</span>
                          </>
                        ) : (
                          <>
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Dispatch via Telegram</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>

                  {/* RESPONSE ALERTS */}
                  {tgSuccessInfo && (
                    <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl flex items-center gap-2 text-emerald-400 text-xs font-sans">
                      <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                      <p className="font-semibold">{tgSuccessInfo}</p>
                    </div>
                  )}

                  {tgErrorInfo && (
                    <div className="p-3.5 bg-rose-500/10 border border-rose-500/25 rounded-2xl flex items-center gap-2 text-rose-450 hover:text-rose-400 text-rose-400 text-xs font-sans">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 animate-pulse" />
                      <div className="font-semibold leading-relaxed">
                        <strong className="font-black text-rose-400 block mb-0.5">POLICY REJECT:</strong>
                        <span>{tgErrorInfo}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SUBTAB 3: CUSTOM TEMPLATE DESIGNER */}
            {crmSubTab === 'templates' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Left list panel */}
                  <div className="lg:col-span-5 bg-slate-950 rounded-2xl border border-slate-850 p-4 space-y-3">
                    <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                       <h4 className="text-xs font-extrabold uppercase text-slate-300 tracking-wider">Loaded Templates ({garageTemplates.length})</h4>
                       <button
                         type="button"
                         onClick={() => {
                           setSelectedTmplId('');
                           setEditingTmplName('Monsoon Brake Checking Promo');
                           setEditingTmplBody('Hello {customer}, we checked your vehicle {vehicle} and noted the brake system needs check-up. Book this week and save 15% at {garage}!');
                           setEditingTmplCategory('promotion');
                           setIsEditingTmpl(false);
                         }}
                         className="text-[9.5px] bg-cyan-500/10 text-cyan-400 px-2 py-1 rounded font-bold hover:bg-cyan-500/25 active:bg-cyan-500/30 transition cursor-pointer"
                       >
                         + Creator Mode
                       </button>
                    </div>

                    <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1 text-xs">
                      {garageTemplates.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setSelectedTmplId(item.id);
                            setEditingTmplName(item.templateName);
                            setEditingTmplBody(item.messageBody);
                            setEditingTmplCategory(item.templateType);
                            setIsEditingTmpl(true);
                          }}
                          className={`w-full p-3 rounded-xl border text-left space-y-1.5 transition flex flex-col cursor-pointer ${
                            selectedTmplId === item.id ? 'border-cyan-500 bg-cyan-500/10' : 'border-slate-850 bg-slate-950/40 hover:border-slate-800'
                          }`}
                        >
                          <div className="flex justify-between items-center w-full">
                            <strong className="text-slate-100 font-extrabold truncate max-w-[140px]">{item.templateName}</strong>
                            <span className="text-[8px] bg-slate-850 text-slate-400 px-1.5 py-0.2 rounded font-mono uppercase font-extrabold">
                              {item.templateType}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">{item.messageBody}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Editor workspace */}
                  <div className="lg:col-span-7 bg-slate-950 rounded-2xl border border-slate-850 p-5 space-y-4 text-xs font-sans">
                    <h4 className="text-xs font-extrabold uppercase text-cyan-400 tracking-wider">
                       {selectedTmplId ? "Templates Design Compiler" : "Design New Campaign Template"}
                    </h4>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-slate-400 uppercase font-bold">Template Label Name</label>
                          <input
                            type="text"
                            className="w-full bg-slate-900 border border-slate-800 p-2.5 text-slate-200 rounded-xl focus:outline-none focus:border-slate-700"
                            value={editingTmplName}
                            onChange={(e) => setEditingTmplName(e.target.value)}
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] text-slate-400 uppercase font-bold">Category Type</label>
                          <select
                            className="w-full bg-slate-900 border border-slate-800 p-2.5 text-slate-200 rounded-xl focus:outline-none cursor-pointer"
                            value={editingTmplCategory}
                            onChange={(e) => setEditingTmplCategory(e.target.value)}
                          >
                            <option value="service_update">service_update</option>
                            <option value="pickup">pickup</option>
                            <option value="invoice">invoice</option>
                            <option value="payment">payment</option>
                            <option value="quotation">quotation</option>
                            <option value="reminder">reminder</option>
                            <option value="promotion">promotion</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-400 uppercase font-bold">Body Structure (Supports dynamic placeholders)</label>
                        <textarea
                          rows={4}
                          className="w-full bg-slate-900 border border-slate-800 p-3 text-slate-200 rounded-xl focus:outline-none focus:border-slate-700 resize-none font-mono text-[11px] leading-relaxed"
                          value={editingTmplBody}
                          onChange={(e) => setEditingTmplBody(e.target.value)}
                        />
                        <span className="text-[9px] text-slate-500 block leading-relaxed mt-1">
                          Synthesizer keys: <code>{`{customer}`}</code>, <code>{`{vehicle}`}</code>, <code>{`{ticketId}`}</code>, <code>{`{garage}`}</code>, <code>{`{status}`}</code>, <code>{`{cost}`}</code>
                        </span>
                      </div>

                      <div className="flex justify-end gap-2 pt-1 border-t border-slate-900">
                        <button
                          type="button"
                          onClick={async () => {
                            if (!editingTmplName || !editingTmplBody) {
                              alert("Please fill all fields.");
                              return;
                            }
                            try {
                              const res = await fetch("/api/telegram/garage-templates", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  id: selectedTmplId || undefined,
                                  garageId: "g1",
                                  templateName: editingTmplName,
                                  templateType: editingTmplCategory,
                                  messageBody: editingTmplBody
                                })
                              });
                              if (res.ok) {
                                alert(selectedTmplId ? "Campaign template compiled, synced perfectly!" : "New template designed successfully!");
                                fetchGarageTemplates();
                              }
                            } catch (err) {
                              console.error(err);
                            }
                          }}
                          className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 text-slate-950 font-black uppercase text-xs rounded-xl tracking-wider transition cursor-pointer"
                        >
                          Save Template Config
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUBTAB 4: SENT NOTIFICATION HISTORY LOGS */}
            {crmSubTab === 'history' && (
              <div className="space-y-6 text-xs text-slate-300 font-sans">
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-850 space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                    <h4 className="text-xs font-extrabold uppercase text-cyan-400 tracking-wider">Outbound Sent Campaign History Logs</h4>
                    <span className="text-[9px] bg-slate-900 text-slate-500 font-mono font-bold px-2 py-0.5 rounded">
                      Live Database records
                    </span>
                  </div>

                  <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
                    {telegramSentHistory.length === 0 ? (
                      <div className="py-12 text-center text-slate-500 font-mono text-[10px]">
                        No dispatch logs cataloged on matching channels yet.
                      </div>
                    ) : (
                      telegramSentHistory.map((log: any, idx: number) => (
                        <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-900 flex justify-between gap-4 items-center">
                          <div className="space-y-1 truncate">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-black text-slate-200">
                                To: {log.target || log.userId || "Yeon Pisith"}
                              </span>
                              <span className="text-[8px] bg-cyan-500/10 text-cyan-400 px-1.5 py-0.2 rounded font-mono font-bold uppercase">
                                {log.channel || "Telegram Channel"}
                              </span>
                              <span className="text-[8px] bg-indigo-500/15 text-indigo-400 px-1.5 py-0.2 rounded font-mono font-bold uppercase">
                                {log.category || "Service Updates"}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 truncate max-w-lg leading-relaxed">{log.message}</p>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-[9px] text-slate-500 block font-mono">
                              {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : "Just Now"}
                            </span>
                            <span className="text-[8px] text-emerald-400 font-bold block">Status: DELIVERED</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* SUBTAB 5: ANTISPAM ACCESS USER PREFERENCE GRID */}
            {crmSubTab === 'blocked' && (
              <div className="space-y-6">
                <div className="p-5 bg-slate-950 rounded-2xl border border-slate-850 space-y-4">
                  <h4 className="text-xs font-extrabold uppercase text-cyan-400 tracking-wider">Antispam Protection Permissions Grid</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Under the platform rules, the end user retains absolute sovereignty over notification channels. Toggling preferences below allows testing how our Telegram channels safely reject automated promoblasts or checkup updates if opt-ins are violated or reported as spam.
                  </p>

                  <div className="space-y-3.5 font-sans">
                    {(() => {
                      const perm = tgStatusData?.permissions?.find((p: any) => p.garageId === 'g1') || {
                        allowServiceUpdates: true,
                        allowInvoiceMessages: true,
                        allowReminders: true,
                        allowPromotions: true,
                        blockedByUser: false,
                        reportedSpam: false
                      };

                      return (
                        <div className="p-4 rounded-xl border border-slate-900 bg-slate-950/65 text-xs text-slate-300 space-y-4">
                          <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                            <div>
                              <strong className="text-slate-100 text-sm">Outbound Permission Policy (Yeon Pisith - ID: 1)</strong>
                              <p className="text-[9px] text-slate-500">Linked to Apsara Auto Repair Diagnostic Center</p>
                            </div>
                            <div className="flex gap-1.5">
                              {perm.reportedSpam ? (
                                <span className="text-[8.5px] bg-rose-500/10 border border-rose-500/20 text-rose-450 px-2.5 py-0.5 rounded font-extrabold uppercase animate-pulse">Spam Reported ⚠️</span>
                              ) : perm.blockedByUser ? (
                                <span className="text-[8.5px] bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2.5 py-0.5 rounded font-extrabold uppercase">Muted / Blocked 🛑</span>
                              ) : (
                                <span className="text-[8.5px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded font-extrabold uppercase">White-listed OK 🟢</span>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-[11px]">Allow service status updates:</span>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    const res = await fetch("/api/telegram/update-garage-permissions", {
                                      method: "POST",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({
                                        garageId: "g1",
                                        allowServiceUpdates: !perm.allowServiceUpdates,
                                        allowInvoiceMessages: perm.allowInvoiceMessages,
                                        allowReminders: perm.allowReminders,
                                        allowPromotions: perm.allowPromotions
                                      })
                                    });
                                    if (res.ok) fetchTgStatus();
                                  }}
                                  className={`w-12 h-6 px-1 rounded-full transition cursor-pointer relative flex items-center ${
                                    perm.allowServiceUpdates ? "bg-emerald-500/80" : "bg-slate-800"
                                  }`}
                                >
                                  <span className={`w-4 h-4 rounded-full bg-white transition-all transform duration-300 ${perm.allowServiceUpdates ? 'translate-x-6' : 'translate-x-0'}`} />
                                </button>
                              </div>

                              <div className="flex justify-between items-center font-sans">
                                <span className="text-[11px]">Allow invoices & bills:</span>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    const res = await fetch("/api/telegram/update-garage-permissions", {
                                      method: "POST",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({
                                        garageId: "g1",
                                        allowServiceUpdates: perm.allowServiceUpdates,
                                        allowInvoiceMessages: !perm.allowInvoiceMessages,
                                        allowReminders: perm.allowReminders,
                                        allowPromotions: perm.allowPromotions
                                      })
                                    });
                                    if (res.ok) fetchTgStatus();
                                  }}
                                  className={`w-12 h-6 px-1 rounded-full transition cursor-pointer relative flex items-center ${
                                    perm.allowInvoiceMessages ? "bg-emerald-500/80" : "bg-slate-800"
                                  }`}
                                >
                                  <span className={`w-4 h-4 rounded-full bg-white transition-all transform duration-300 ${perm.allowInvoiceMessages ? 'translate-x-6' : 'translate-x-0'}`} />
                                </button>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <div className="flex justify-between items-center font-sans">
                                <span className="text-[11px]">Allow automatic check reminders:</span>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    const res = await fetch("/api/telegram/update-garage-permissions", {
                                      method: "POST",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({
                                        garageId: "g1",
                                        allowServiceUpdates: perm.allowServiceUpdates,
                                        allowInvoiceMessages: perm.allowInvoiceMessages,
                                        allowReminders: !perm.allowReminders,
                                        allowPromotions: perm.allowPromotions
                                      })
                                    });
                                    if (res.ok) fetchTgStatus();
                                  }}
                                  className={`w-12 h-6 px-1 rounded-full transition cursor-pointer relative flex items-center ${
                                    perm.allowReminders ? "bg-emerald-500/80" : "bg-slate-800"
                                  }`}
                                >
                                  <span className={`w-4 h-4 rounded-full bg-white transition-all transform duration-300 ${perm.allowReminders ? 'translate-x-6' : 'translate-x-0'}`} />
                                </button>
                              </div>

                              <div className="flex justify-between items-center font-sans">
                                <span className="text-[11px]">Allow marketing promotions slot:</span>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    const res = await fetch("/api/telegram/update-garage-permissions", {
                                      method: "POST",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({
                                        garageId: "g1",
                                        allowServiceUpdates: perm.allowServiceUpdates,
                                        allowInvoiceMessages: perm.allowInvoiceMessages,
                                        allowReminders: perm.allowReminders,
                                        allowPromotions: !perm.allowPromotions
                                      })
                                    });
                                    if (res.ok) fetchTgStatus();
                                  }}
                                  className={`w-12 h-6 px-1 rounded-full transition cursor-pointer relative flex items-center ${
                                    perm.allowPromotions ? "bg-emerald-500/80" : "bg-slate-800"
                                  }`}
                                >
                                  <span className={`w-4 h-4 rounded-full bg-white transition-all transform duration-300 ${perm.allowPromotions ? 'translate-x-6' : 'translate-x-0'}`} />
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-900 justify-end">
                            <button
                              type="button"
                              onClick={async () => {
                                const res = await fetch("/api/telegram/toggle-block-garage", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ garageId: "g1" })
                                });
                                if (res.ok) fetchTgStatus();
                              }}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                                perm.blockedByUser ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 hover:bg-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/15 hover:bg-rose-500/20"
                              }`}
                            >
                              {perm.blockedByUser ? "🔓 Simulate User Unblock" : "🚫 Simulate User Block"}
                            </button>

                            <button
                              type="button"
                              onClick={async () => {
                                const res = await fetch("/api/telegram/report-spam", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ garageId: "g1" })
                                });
                                if (res.ok) fetchTgStatus();
                              }}
                              disabled={perm.reportedSpam}
                              className="px-3 py-1.5 rounded-lg text-[10px] bg-red-500/10 text-red-500 border border-red-500/15 font-bold hover:bg-red-500/20 transition disabled:opacity-50 cursor-pointer animate-pulse"
                            >
                              {perm.reportedSpam ? "🛡️ Spam Reported Flagged" : "🛡️ Simulate User Report Spam"}
                            </button>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* TAB 4: INVENTORY CATALOG & PRICES SHEET */}
      {activeTab === "inventory" && (
        <div className="space-y-6 animate-fadeIn">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Box: Product catalog ledger control */}
            <div className="lg:col-span-8 bg-slate-950/30 rounded-2xl border border-slate-800 p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                <div className="space-y-0.5">
                  <h3 className="text-xs font-black text-slate-200 uppercase tracking-widest">Active SKU Ledger Stocks</h3>
                  <p className="text-[10px] text-slate-500">Live counts, margins, purchase costs and suppliers logs</p>
                </div>
                <span className="text-[9.5px] bg-indigo-500/10 text-indigo-400 font-bold px-2 py-0.5 rounded uppercase font-mono">SKU Count: {products.length}</span>
              </div>

              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                {products.map(prod => (
                  <div key={prod.sku} className="p-3.5 rounded-xl border border-slate-850 bg-slate-950/40 hover:border-slate-800 transition flex flex-col md:flex-row justify-between gap-3 md:items-center">
                    
                    <div className="space-y-1 truncate max-w-sm">
                      <div className="flex items-center gap-2">
                        <strong className="text-xs font-extrabold text-slate-200 block truncate">{prod.name}</strong>
                        {prod.stock <= prod.minAlert && (
                          <span className="bg-rose-500/15 text-rose-455 text-rose-400 border border-rose-500/20 text-[8.5px] font-bold px-1.5 rounded animate-pulse uppercase">Low SKU</span>
                        )}
                      </div>
                      <span className="text-[9.5px] text-slate-500 font-mono block">Category: {prod.category} • SKU: {prod.sku} • Location: <strong>{prod.location}</strong></span>
                    </div>

                    {/* Financial details segments */}
                    <div className="flex gap-4 items-center shrink-0">
                      
                      <div className="text-right space-y-0.5">
                        <span className="text-[8.5px] font-bold text-slate-500 uppercase block">Prices Rate</span>
                        <div className="text-xs font-mono">
                          {currentRole !== "Mechanic" && currentRole !== "Cashier" ? (
                            <span className="text-slate-500 mr-1.5">Cost: ${prod.purchasePrice.toFixed(2)}</span>
                          ) : null}
                          <span className="text-emerald-400 font-bold block">Sell Price: ${prod.sellingPrice.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Stock controller adjust counters */}
                      <div className="text-center space-y-1">
                        <span className="text-[8.5px] font-bold text-slate-500 uppercase block">Store Stocks</span>
                        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-900 w-fit">
                          <button
                            onClick={() => handleStockAdjust(prod.sku, -1)}
                            className="w-5 h-5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded text-xs cursor-pointer"
                          >
                            -
                          </button>
                          <span className="text-xs font-bold font-mono text-slate-100 min-w-5 block">{prod.stock}</span>
                          <button
                            onClick={() => handleStockAdjust(prod.sku, 1)}
                            className="w-5 h-5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded text-xs cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <button
                          onClick={() => handleStockAdjust(prod.sku, 10)}
                          className="px-2 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-[10px] font-bold rounded border border-indigo-500/15 cursor-pointer block"
                        >
                          Restock +10
                        </button>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Box: Setup customized product/spare SKU profile */}
            {currentRole !== "Mechanic" ? (
              <div className="lg:col-span-4 bg-slate-950/40 rounded-2xl border border-slate-800 p-5 space-y-4">
                <div className="border-b border-slate-850 pb-2">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
                    <Plus className="w-4.5 h-4.5 text-emerald-400 animate-pulse" />
                    <span>Create Custom Product SKU</span>
                  </h3>
                </div>

                <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-550 block text-slate-500 uppercase tracking-wide">Spare parts name / description</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Nippon High Power filter fluid"
                      value={newProdName}
                      onChange={(e) => setNewProdName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 p-2 text-xs rounded-xl text-slate-105 text-slate-100 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-550 block text-slate-500 uppercase tracking-wide">Category Catalog Group</label>
                    <select
                      value={newProdCategory}
                      onChange={(e) => setNewProdCategory(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 p-2 text-xs rounded-xl text-slate-101 text-slate-100"
                    >
                      <option value="Fluids & Engine Oil">Fluids & Engine Oil</option>
                      <option value="Brakes & Rotors">Brakes & Rotors</option>
                      <option value="Ignition">Ignition Plug / Coils</option>
                      <option value="Tires & Suspension">Tires & Suspension</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-550 block text-slate-500 uppercase tracking-wide">Purchase cost ($)</label>
                      <input
                        type="number"
                        required
                        placeholder="Cost price"
                        value={newProdPurchasePrice}
                        onChange={(e) => setNewProdPurchasePrice(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 p-2 text-xs rounded-xl text-slate-200 focus:outline-none font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-550 block text-slate-500 uppercase tracking-wide">Selling rate ($)</label>
                      <input
                        type="number"
                        required
                        placeholder="POS rate"
                        value={newProdSellingPrice}
                        onChange={(e) => setNewProdSellingPrice(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 p-2 text-xs rounded-xl text-slate-200 focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-550 block text-slate-500 uppercase tracking-wide">Initial Stock count</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 15"
                      value={newProdStock}
                      onChange={(e) => setNewProdStock(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 p-2 text-xs rounded-xl text-slate-200 focus:outline-none font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 font-bold text-slate-950 text-xs rounded-xl transition tracking-wide uppercase cursor-pointer"
                  >
                    Create SKU Item
                  </button>
                </form>

                <div className="p-3 bg-indigo-500/5 rounded-xl text-[10px] text-slate-400 border border-indigo-500/10 leading-normal flex items-start gap-1">
                  <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5 animate-pulse" />
                  <span>Configuring competitive selling prices with high stock turnover speeds drives diagnostic margins.</span>
                </div>
              </div>
            ) : (
              <div className="lg:col-span-4 bg-rose-500/5 rounded-2xl border border-rose-500/10 p-5 flex flex-col justify-center items-center text-center p-8 text-rose-400 text-xs">
                <ShieldAlert className="w-10 h-10 text-rose-500 mb-3 animate-pulse" />
                <h4 className="font-bold uppercase tracking-wide">Create Custom Product Blocked</h4>
                <p className="mt-1 font-sans text-rose-450 leading-relaxed">
                  Your current simulated profile role is **Mechanic**. Under diagnostic regulations compliance, mechanics are not authorized to create inventory spare SKU templates.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: STAFF PERMISSIONS MATRIX */}
      {activeTab === "staff" && (
        <div className="space-y-6 animate-fadeIn">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left box: Live Role simulation permissions mapping */}
            <div className="lg:col-span-8 bg-slate-950/30 rounded-2xl border border-slate-800 p-5 space-y-5">
              <div className="flex justify-between items-center border-b border-slate-850 pb-2.5">
                <div>
                  <h3 className="text-xs font-black text-slate-200 uppercase tracking-widest">Interactive Staff Permission Matrix</h3>
                  <p className="text-[10px] text-slate-500">Live capability compliance rules active inside Phnom Penh workshops</p>
                </div>
                <span className="text-[9.5px] bg-emerald-500/10 text-emerald-305 text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-500/15 font-mono">System Active</span>
              </div>

              {/* Roster of active employees */}
              <div className="space-y-3 pt-1">
                <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest block font-mono">Assigned Team Members</span>
                
                {[
                  { id: "staff_1", name: "Khem Somaly", role: "Mechanic", status: "Active in Bay 1", phone: "+855 98 221 442", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
                  { id: "staff_2", name: "Keo Sorya", role: "Cashier / Front Desk", status: "Active in Checkout gate", phone: "+855 12 555 984", color: "text-sky-400 bg-sky-500/10 border-sky-500/20" },
                  { id: "staff_3", name: "Vuthy Nhem", role: "Manager", status: "At Siem Reap Exit", phone: "+855 16 990 120", color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" },
                  { id: "staff_4", name: "Pisith Yeen (Main Owner)", role: "Owner", status: "Supervising all locations", phone: "+855 77 413 881", color: "text-pink-400 bg-pink-500/10 border-pink-500/20" }
                ].map(member => (
                  <div key={member.id} className="p-3 bg-slate-950 rounded-xl border border-slate-850 flex justify-between items-center text-xs gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-200 text-sm">{member.name}</strong>
                        <span className={`text-[8.5px] font-extrabold px-2 py-0.5 rounded-full uppercase border ${member.color}`}>
                          {member.role}
                        </span>
                      </div>
                      <span className="text-[9px] text-slate-500 font-mono">Roster ID: {member.id} • Contacts: {member.phone}</span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[9.5px] font-mono text-emerald-400 block font-bold">{member.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right box: Compliance matrix checker visual lists representation */}
            <div className="lg:col-span-4 bg-slate-950/45 rounded-2xl border border-slate-800 p-5 space-y-4">
              <div className="border-b border-slate-850 pb-2">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
                  <UserCheck className="w-5 h-5 text-indigo-400" />
                  <span>Compliance Permission Matrix</span>
                </h3>
              </div>

              <div className="space-y-3 text-xs leading-relaxed">
                <p className="text-[11px] text-slate-400">
                  Verify current access limits by swapping your simulated role using the controller at the top margins of the screen.
                </p>

                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-[11px] p-2 rounded bg-slate-950 border border-slate-900">
                    <span className="text-slate-400">Owner Access Controls:</span>
                    <span className="text-emerald-400 font-bold font-mono">Full Sandbox Access</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] p-2 rounded bg-slate-950 border border-slate-900">
                    <span className="text-slate-400">Manager Access Controls:</span>
                    <span className="text-sky-400 font-bold font-mono">Create, Edit & Settle (Banned staff edits)</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] p-2 rounded bg-slate-950 border border-slate-900">
                    <span className="text-slate-400">Cashier Access Controls:</span>
                    <span className="text-amber-400 font-bold font-mono">Checkout & Compile Invoices</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] p-2 rounded bg-slate-950 border border-slate-900">
                    <span className="text-slate-400">Mechanic Access Controls:</span>
                    <span className="text-rose-400 font-bold font-mono">Task Logs & Road checks only</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
