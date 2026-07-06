import React, { useState, useEffect } from "react";
import { 
  Car, Users, Shield, Award, Sparkles, Plus, Check, X, Bell, Trash2, 
  MapPin, Clock, DollarSign, Calendar, ClipboardCheck, TrendingUp, AlertTriangle, 
  FileText, ArrowRight, RefreshCw, Send, Lock, Unlock, Layers, Zap, Fuel, Activity,
  Smartphone, UserCheck, HelpCircle, ToggleLeft, ToggleRight, Download, QrCode
} from "lucide-react";

// Translations for English & Khmer
const t = {
  en: {
    title: "Fleet & Family Vehicle Manager",
    subtitle: "Premium fleet, driver, trip, and expense management for Cambodia",
    upgradeTitle: "Upgrade to Premium Vehicle Manager",
    upgradeDesc: "Take full control of multiple vehicles. Perfect for rich families, private drivers, delivery groups, and company fleets in Cambodia.",
    switchRole: "Switch Active Fleet Role:",
    roleManager: "Fleet Manager / Boss",
    roleDriver: "Driver / Staff User",
    roleOwner: "Personal Vehicle Owner",
    personalView: "Personal Owner Dashboard",
    totalVehicles: "Total Vehicles",
    availableVehicles: "Available Vehicles",
    vehiclesInUse: "Vehicles in Use",
    vehiclesAtGarage: "At Garage",
    activeDrivers: "Active Drivers",
    pendingApprovals: "Pending Approvals",
    monthlyFuel: "Monthly Fuel Cost",
    monthlyRepair: "Monthly Repair Cost",
    activeTrips: "Active Trip Logs",
    addVehicle: "Register Fleet Vehicle",
    addDriver: "Invite Driver",
    addTrip: "Log New Trip",
    logFuel: "Submit Fuel / EV Log",
    submitExpense: "Submit Expense Claim",
    aiAssistant: "AI Fleet Assistant",
    aiPromptPlaceholder: "Ask Gemini: Which vehicle costs the most? Any abnormal fuel logs?",
    activePlan: "Current Plan:",
    changePlan: "Change Subscription Plan",
    fleetName: "Fleet Name",
    plateNumber: "Plate Number",
    brand: "Brand",
    model: "Model",
    year: "Year",
    engineType: "Engine Type",
    status: "Status",
    driver: "Driver",
    odometer: "Current Odometer (km)",
    nextService: "Next Service (km)",
    insuranceExp: "Insurance Expiry",
    taxExp: "Road Tax Expiry",
    actions: "Actions",
    noRecords: "No fleet records found.",
    khmerSupport: "Khmer Translation Active",
    approvalStatus: "Approval Status",
    approve: "Approve",
    reject: "Reject",
    category: "Category",
    amount: "Amount",
    date: "Date",
    station: "Station",
    receipt: "Receipt Photo",
    purpose: "Trip Purpose",
    startOdo: "Start Odo",
    endOdo: "End Odo",
    locations: "From / To",
    assignedCar: "Assigned Vehicle",
    startTrip: "Start Trip",
    endTrip: "End Trip",
    submitSuccess: "Record submitted successfully!",
    notificationSent: "In-app and simulated Telegram alert sent!"
  },
  kh: {
    title: "ប្រព័ន្ធគ្រប់គ្រងយានយន្តគ្រួសារ និងអាជីវកម្ម (Fleet)",
    subtitle: "ការគ្រប់គ្រងរថយន្ត អ្នកបើកបរ ដំណើរការធ្វើដំណើរ និងការចំណាយលំដាប់ខ្ពស់នៅកម្ពជា",
    upgradeTitle: "ដំឡើងទៅជាអ្នកគ្រប់គ្រងយានយន្តកម្រិតខ្ពស់",
    upgradeDesc: "គ្រប់គ្រងយានយន្តច្រើនគ្រឿងទាំងស្រុង។ សមស្របបំផុតសម្រាប់គ្រួសារធំៗ អ្នកបើកបរឯកជន ក្រុមដឹកជញ្ជូន និងក្រុមហ៊ុននានានៅកម្ពុជា។",
    switchRole: "ប្តូរតួនាទីសកម្ម៖",
    roleManager: "អ្នកគ្រប់គ្រងយានយន្ត / ថៅកែ",
    roleDriver: "អ្នកបើកបរ / បុគ្គលិក",
    roleOwner: "ម្ចាស់យានយន្តផ្ទាល់ខ្លួន",
    personalView: "ផ្ទាំងគ្រប់គ្រងផ្ទាល់ខ្លួន",
    totalVehicles: "យានយន្តសរុប",
    availableVehicles: "យានយន្តដែលអាចប្រើបាន",
    vehiclesInUse: "យានយន្តកំពុងប្រើប្រាស់",
    vehiclesAtGarage: "នៅការ៉ាស",
    activeDrivers: "អ្នកបើកបរសកម្ម",
    pendingApprovals: "ការអនុម័តដែលមិនទាន់សម្រេច",
    monthlyFuel: "តម្លៃប្រេងប្រចាំខែ",
    monthlyRepair: "តម្លៃជួសជុលប្រចាំខែ",
    activeTrips: "កំណត់ត្រាធ្វើដំណើរ",
    addVehicle: "ចុះឈ្មោះឡានក្នុងក្រុម",
    addDriver: "អញ្ជើញអ្នកបើកបរ",
    addTrip: "កត់ត្រាការធ្វើដំណើរថ្មី",
    logFuel: "កត់ត្រាចាក់ប្រេង / សាកភ្លើង EV",
    submitExpense: "ដាក់ស្នើការចំណាយ",
    aiAssistant: "ជំនួយការសិប្បនិម្មិត AI",
    aiPromptPlaceholder: "សួរ Gemini៖ តើយានយន្តណាដែលចំណាយច្រើនជាងគេ? តើមានការចាក់ប្រេងខុសប្រក្រតីទេ?",
    activePlan: "គម្រោងបច្ចុប្បន្ន៖",
    changePlan: "ប្តូរគម្រោងជាវប្រចាំ",
    fleetName: "ឈ្មោះក្រុមរថយន្ត",
    plateNumber: "ផ្លាកលេខ",
    brand: "ម៉ាក",
    model: "ម៉ូដែល",
    year: "ឆ្នាំផលិត",
    engineType: "ប្រភេទម៉ាស៊ីន",
    status: "ស្ថានភាព",
    driver: "អ្នកបើកបរ",
    odometer: "កុងទ័រចម្ងាយ (គីឡូម៉ែត្រ)",
    nextService: "ការជួសជុលបន្ទាប់ (គីឡូម៉ែត្រ)",
    insuranceExp: "ធានារ៉ាប់រងផុតកំណត់",
    taxExp: "ពន្ធផ្លូវផុតកំណត់",
    actions: "សកម្មភាព",
    noRecords: "រកមិនឃើញទិន្នន័យឡានទេ។",
    khmerSupport: "ភាសាខ្មែរសកម្ម",
    approvalStatus: "ស្ថានភាពអនុម័ត",
    approve: "អនុម័ត",
    reject: "បដិសេធ",
    category: "ប្រភេទ",
    amount: "ចំនួនទឹកប្រាក់",
    date: "កាលបរិច្ឆេទ",
    station: "ស្ថានីយ",
    receipt: "រូបថតវិក្កយបត្រ",
    purpose: "គោលបំណងធ្វើដំណើរ",
    startOdo: "កុងទ័រចាប់ផ្តើម",
    endOdo: "កុងទ័របញ្ចប់",
    locations: "ពីណា / ទៅណា",
    assignedCar: "ឡានដែលបានចាត់តាំង",
    startTrip: "ចាប់ផ្តើមដំណើរ",
    endTrip: "បញ្ចប់ដំណើរ",
    submitSuccess: "បានដាក់ស្នើដោយជោគជ័យ!",
    notificationSent: "បានផ្ញើការជូនដំណឹងក្នុងកម្មវិធី និង Telegram!"
  }
};

// Interface structures
interface FleetProfile {
  id: string;
  name: string;
  type: string;
  managerName: string;
  planId: string;
  telegramChatId?: string;
}

interface FleetVehicle {
  id: string;
  name: string;
  plateNumber: string;
  brand: string;
  model: string;
  year: number;
  engineType: 'Petrol' | 'Diesel' | 'Hybrid' | 'EV' | 'Gas';
  status: 'Available' | 'Reserved' | 'In Use' | 'Waiting Driver' | 'At Garage' | 'Under Repair' | 'Need Approval' | 'Not Available' | 'Sold / Archived';
  currentDriver: string;
  lastDriver?: string;
  odometer: number;
  nextService: number;
  insuranceExpiry: string;
  roadTaxExpiry: string;
  photoUrl?: string;
  qrToken?: string;
}

interface FleetDriver {
  id: string;
  name: string;
  phone: string;
  telegramHandle: string;
  assignmentType: 'Permanent' | 'Temporary' | 'Trip-based';
  assignedVehicleId?: string;
  status: 'Active' | 'On Trip' | 'Off Duty';
}

export interface FleetTrip {
  id: string;
  vehicleId: string;
  driverId: string;
  startTime: string;
  endTime?: string;
  startOdo: number;
  endOdo?: number;
  startLoc: string;
  endLoc?: string;
  purpose: string;
  notes?: string;
  status: 'Active' | 'Completed';
}

export interface FleetExpense {
  id: string;
  vehicleId: string;
  driverId: string;
  category: string;
  amount: number;
  date: string;
  stationName?: string;
  energyType?: string;
  quantity?: number; // liters or kWh
  notes?: string;
  receiptPhoto?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

interface FleetNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  channel: 'In-App' | 'Telegram' | 'Email';
  read: boolean;
}

interface ServiceHistoryRecord {
  id: string;
  vehicleId: string;
  date: string;
  description: string;
  odometer: number;
  cost?: number;
  provider?: string;
  status: 'Completed' | 'Logged';
}

interface RegisteredUser {
  uid: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}

import { VehicleProfile, MaintenanceRecord } from "../types";
import { syncVehicleRecords } from "../utils/dataSync";
import WireframeStudio from "./WireframeStudio";

export default function FleetManager({ 
  userProfile,
  appVehicles = [],
  setAppVehicles,
  appRecords = [],
  setAppRecords,
  onRefreshData,
  isSimulatedOffline = false,
}: { 
  userProfile: any;
  appVehicles?: VehicleProfile[];
  setAppVehicles?: React.Dispatch<React.SetStateAction<VehicleProfile[]>>;
  appRecords?: MaintenanceRecord[];
  setAppRecords?: React.Dispatch<React.SetStateAction<MaintenanceRecord[]>>;
  onRefreshData?: () => void;
  isSimulatedOffline?: boolean;
}) {
  const [lang, setLang] = useState<'en' | 'kh'>('en');
  const activeTranslation = t[lang];

  // Role switching
  const [activeRole, setActiveRole] = useState<'Manager' | 'Driver' | 'Owner'>('Manager');

  // Subscription state
  const [isUpgraded, setIsUpgraded] = useState<boolean>(true);
  const [subscriptionPlan, setSubscriptionPlan] = useState<string>('sme'); // 'bronze', 'sme', 'enterprise'

  // Sub tabs for Fleet Manager Panel
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'vehicles' | 'drivers' | 'trips' | 'expenses' | 'ai' | 'notifications' | 'subscription' | 'wireframes'>('dashboard');

  // Driver Express Trip Form states
  const [driverVehId, setDriverVehId] = useState<string>("");
  const [driverStartOdo, setDriverStartOdo] = useState<number>(0);
  const [driverEndOdo, setDriverEndOdo] = useState<string>("");
  const [driverPurpose, setDriverPurpose] = useState<string>("Delivery");
  const [driverNotes, setDriverNotes] = useState<string>("");

  // Registered system users (for Driver Assignment UI)
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([
    { uid: "u-1", name: "Sok Cheat", email: "sok.cheat@gmail.com", phone: "098 776 554", role: "Driver / Staff" },
    { uid: "u-2", name: "Chhoun Borey", email: "borey.private@gmail.com", phone: "012 888 777", role: "Driver / Staff" },
    { uid: "u-3", name: "Ly Hour", email: "ly.hour@gmail.com", phone: "015 333 444", role: "Driver / Staff" },
    { uid: "u-4", name: "Vannak Nimol", email: "vannak.logistics@gmail.com", phone: "085 999 111", role: "Driver / Staff" },
    { uid: "u-5", name: "Som Ol", email: "som.ol@gmail.com", phone: "077 555 444", role: "Driver / Staff" }
  ]);

  // Account-to-Vehicle Sync Assignment mapping
  const [userVehicleAssignments, setUserVehicleAssignments] = useState<Array<{ userEmail: string; vehicleId: string; assignedAt: string }>>([
    { userEmail: "sok.cheat@gmail.com", vehicleId: "fv-3", assignedAt: "2026-06-20" },
    { userEmail: "borey.private@gmail.com", vehicleId: "fv-1", assignedAt: "2026-06-21" }
  ]);

  const [isLockedToDriver, setIsLockedToDriver] = useState<boolean>(false);

  // Vehicle Service History ledger
  const [serviceHistory, setServiceHistory] = useState<ServiceHistoryRecord[]>([
    { id: "sh-1", vehicleId: "fv-1", date: "2026-06-20", description: "Odometer Synced via Express Trip log (Boss transport)", odometer: 45120, status: 'Completed' },
    { id: "sh-2", vehicleId: "fv-3", date: "2026-06-22", description: "Odometer Synced via Express Trip log (Delivery)", odometer: 244970, status: 'Completed' },
    { id: "sh-3", vehicleId: "fv-3", date: "2026-06-15", description: "Preventive 240k Service (Oil, filters & spark plugs)", odometer: 240000, cost: 85, provider: "Apsara Partner Garage", status: 'Completed' },
    { id: "sh-4", vehicleId: "fv-4", date: "2026-06-18", description: "Brake pad replacement & caliper lube", odometer: 98000, cost: 75, provider: "PP Pro Auto Service", status: 'Completed' }
  ]);

  // Seed Initial High Quality Premium Data
  const [fleets, setFleets] = useState<FleetProfile[]>([
    { id: "fleet-1", name: "Somaly Family Fleet", type: "Family Fleet", managerName: "Khem Somaly", planId: "bronze" },
    { id: "fleet-2", name: "Monsoon Courier Deliveries", type: "Delivery Fleet", managerName: "Khem Somaly", planId: "sme" }
  ]);

  const [selectedFleetId, setSelectedFleetId] = useState<string>("fleet-2");

  const [vehicles, setVehicles] = useState<FleetVehicle[]>([
    {
      id: "fv-1",
      name: "VIP Alphard Boss",
      plateNumber: "PP-2AA-8888",
      brand: "Toyota",
      model: "Alphard Executive Lounge",
      year: 2022,
      engineType: "Hybrid",
      status: "In Use",
      currentDriver: "Chhoun Borey (Private Driver)",
      lastDriver: "Sok Cheat",
      odometer: 45200,
      nextService: 50000,
      insuranceExpiry: "2026-12-15",
      roadTaxExpiry: "2026-09-30",
      photoUrl: "https://images.unsplash.com/photo-1619590059346-bfcc8ff1c0aa?auto=format&fit=crop&q=80&w=400",
      qrToken: "tok-alphard-8888"
    },
    {
      id: "fv-2",
      name: "Delivery Van A",
      plateNumber: "SR-3B-9912",
      brand: "Hyundai",
      model: "H-1 Grand Starex",
      year: 2018,
      engineType: "Diesel",
      status: "Available",
      currentDriver: "None",
      lastDriver: "Ly Hour",
      odometer: 180500,
      nextService: 185000,
      insuranceExpiry: "2026-07-22",
      roadTaxExpiry: "2026-11-10",
      photoUrl: "https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&q=80&w=400",
      qrToken: "tok-van-9912"
    },
    {
      id: "fv-3",
      name: "Eco Delivery Prius",
      plateNumber: "PP-2X-4456",
      brand: "Toyota",
      model: "Prius Gen 3",
      year: 2012,
      engineType: "Hybrid",
      status: "At Garage",
      currentDriver: "Sok Cheat",
      lastDriver: "Sok Cheat",
      odometer: 245000,
      nextService: 248000,
      insuranceExpiry: "2026-08-05",
      roadTaxExpiry: "2026-10-01",
      photoUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=400",
      qrToken: "tok-prius-4456"
    },
    {
      id: "fv-4",
      name: "Logistics Truck Premium",
      plateNumber: "SHV-3A-7711",
      brand: "Isuzu",
      model: "D-Max Spacecab",
      year: 2021,
      engineType: "Diesel",
      status: "Under Repair",
      currentDriver: "None",
      lastDriver: "Vannak Nimol",
      odometer: 98400,
      nextService: 100000,
      insuranceExpiry: "2026-10-18",
      roadTaxExpiry: "2026-11-20",
      photoUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=400",
      qrToken: "tok-truck-7711"
    }
  ]);

  const [drivers, setDrivers] = useState<FleetDriver[]>([
    { id: "dr-1", name: "Chhoun Borey", phone: "012 888 777", telegramHandle: "@borey_private", assignmentType: "Permanent", assignedVehicleId: "fv-1", status: "On Trip" },
    { id: "dr-2", name: "Sok Cheat", phone: "098 776 554", telegramHandle: "@sok_cheat_courier", assignmentType: "Temporary", assignedVehicleId: "fv-3", status: "Active" },
    { id: "dr-3", name: "Ly Hour", phone: "015 333 444", telegramHandle: "@ly_hour_deliveries", assignmentType: "Trip-based", assignedVehicleId: undefined, status: "Off Duty" },
    { id: "dr-4", name: "Vannak Nimol", phone: "085 999 111", telegramHandle: "@vannak_logistics", assignmentType: "Permanent", assignedVehicleId: undefined, status: "Off Duty" }
  ]);

  const [trips, setTrips] = useState<FleetTrip[]>([
    { id: "tr-1", vehicleId: "fv-1", driverId: "dr-1", startTime: "2026-06-23 09:15", startOdo: 45120, startLoc: "Monsoon Office PP", purpose: "Boss transport", notes: "Boss meeting with ABA delegates in city center", status: "Active" },
    { id: "tr-2", vehicleId: "fv-3", driverId: "dr-2", startTime: "2026-06-23 07:00", endTime: "2026-06-23 12:30", startOdo: 244850, endOdo: 244970, startLoc: "PP Warehouse", endLoc: "Siem Reap Station", purpose: "Delivery", notes: "Express parcels dropped at postal hub", status: "Completed" }
  ]);

  const [expenses, setExpenses] = useState<FleetExpense[]>([
    { id: "ex-1", vehicleId: "fv-1", driverId: "dr-1", category: "Fuel", amount: 65, date: "2026-06-23", stationName: "PTT Chbar Ampov", energyType: "Premium 95", quantity: 50, notes: "Full tank refill on boss card", status: "Pending" },
    { id: "ex-2", vehicleId: "fv-3", driverId: "dr-2", category: "EV Charging", amount: 12, date: "2026-06-22", stationName: "EV Plaza PP", energyType: "DC Fast Charge", quantity: 45, notes: "Mid-day courier top-up", status: "Approved" },
    { id: "ex-3", vehicleId: "fv-4", driverId: "dr-4", category: "Minor Repair", amount: 120, date: "2026-06-20", stationName: "Apsara Garage", notes: "Alternator inspection and belt replacement", status: "Pending" },
    { id: "ex-4", vehicleId: "fv-2", driverId: "dr-3", category: "Toll", amount: 5, date: "2026-06-19", stationName: "Phnom Penh - Sihanoukville Expressway Toll", notes: "Expressway pass receipt attached", status: "Approved" }
  ]);

  const [notifications, setNotifications] = useState<FleetNotification[]>(() => {
    try {
      const saved = localStorage.getItem("mcc_fleet_notifications");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Failed to load notifications from localStorage:", e);
    }
    return [
      { id: "nt-1", title: "Trip Started", message: "Driver Chhoun Borey started trip log with VIP Alphard Boss (#fv-1).", timestamp: "12 mins ago", channel: "Telegram", read: false },
      { id: "nt-2", title: "Fuel Expense Submitted", message: "Sok Cheat submitted a $65 fuel receipt at PTT Chbar Ampov.", timestamp: "1 hour ago", channel: "In-App", read: false },
      { id: "nt-3", title: "Insurance Expiry Warning", message: "Eco Delivery Prius insurance expires in less than 60 days.", timestamp: "1 day ago", channel: "Email", read: true }
    ];
  });

  const [triggeredMaintenanceAlert, setTriggeredMaintenanceAlert] = useState<{
    vehicleId: string;
    vehicleName: string;
    plateNumber: string;
    odometer: number;
    nextService: number;
    exceededBy: number;
  } | null>(null);

  const [simSelectedVehicleId, setSimSelectedVehicleId] = useState<string>("");

  // Sync notifications to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("mcc_fleet_notifications", JSON.stringify(notifications));
    } catch (e) {
      console.warn("Failed to save notifications to localStorage:", e);
    }
  }, [notifications]);

  // Sync initial simulation vehicle selection
  useEffect(() => {
    if (vehicles.length > 0 && !simSelectedVehicleId) {
      setSimSelectedVehicleId(vehicles[0].id);
    }
  }, [vehicles, simSelectedVehicleId]);

  // Core background effect checking for and triggering new maintenance alerts using local storage
  useEffect(() => {
    if (vehicles.length === 0) return;

    let triggeredAlertKeys: string[] = [];
    try {
      const saved = localStorage.getItem("mcc_triggered_maintenance_alerts");
      if (saved) {
        triggeredAlertKeys = JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Failed to load triggered alerts from localStorage:", e);
    }

    let updatedAlerts = [...triggeredAlertKeys];
    let newlyTriggered = false;
    let alertToDisplay: any = null;

    vehicles.forEach(vehicle => {
      const isExceeded = vehicle.odometer >= vehicle.nextService;
      if (isExceeded) {
        const alertKey = `${vehicle.id}-${vehicle.nextService}`;
        if (!updatedAlerts.includes(alertKey)) {
          updatedAlerts.push(alertKey);
          newlyTriggered = true;

          const exceededBy = vehicle.odometer - vehicle.nextService;
          const newNotif: FleetNotification = {
            id: `nt-maint-${Date.now()}-${vehicle.id}`,
            title: `⚠️ Maintenance Overdue: ${vehicle.name}`,
            message: `Manufacturer's recommended maintenance interval of ${vehicle.nextService.toLocaleString()} km is exceeded by ${exceededBy.toLocaleString()} km. Odometer is currently ${vehicle.odometer.toLocaleString()} km. Immediate servicing recommended!`,
            timestamp: "Just now",
            channel: "In-App",
            read: false
          };

          setNotifications(prev => [newNotif, ...prev]);

          alertToDisplay = {
            vehicleId: vehicle.id,
            vehicleName: vehicle.name,
            plateNumber: vehicle.plateNumber,
            odometer: vehicle.odometer,
            nextService: vehicle.nextService,
            exceededBy: exceededBy
          };
        }
      }
    });

    if (newlyTriggered) {
      try {
        localStorage.setItem("mcc_triggered_maintenance_alerts", JSON.stringify(updatedAlerts));
      } catch (e) {
        console.warn("Failed to save triggered alerts to localStorage:", e);
      }
    }

    if (alertToDisplay) {
      setTriggeredMaintenanceAlert(alertToDisplay);
    }
  }, [vehicles]);

  const handleSimulateMileageAdd = (km: number) => {
    const targetId = simSelectedVehicleId || vehicles[0]?.id;
    if (!targetId) return;

    setVehicles(prev => prev.map(v => {
      if (v.id === targetId) {
        const newOdo = v.odometer + km;
        
        // Sync with app-level states
        if (setAppVehicles && appVehicles) {
          setAppVehicles(p => p.map(av => av.id === targetId ? { ...av, mileage: newOdo } : av));
        }

        return { ...v, odometer: newOdo };
      }
      return v;
    }));

    triggerNotification("Mileage Increased (Simulated)", `Simulated drive added +${km.toLocaleString()} km to selected vehicle.`);
  };

  const handleSimulateMileageSet = (newOdo: number) => {
    const targetId = simSelectedVehicleId || vehicles[0]?.id;
    if (!targetId) return;

    setVehicles(prev => prev.map(v => {
      if (v.id === targetId) {
        // Sync with app-level states
        if (setAppVehicles && appVehicles) {
          setAppVehicles(p => p.map(av => av.id === targetId ? { ...av, mileage: newOdo } : av));
        }

        return { ...v, odometer: newOdo };
      }
      return v;
    }));

    triggerNotification("Mileage Artificially Set", `Odometer artificially adjusted to ${newOdo.toLocaleString()} km to test threshold triggers.`);
  };

  const handleResetAlertTriggers = () => {
    try {
      localStorage.removeItem("mcc_triggered_maintenance_alerts");
      triggerNotification("Simulator Cache Cleared", "Successfully cleared simulation alert cache. Odometer exceedance triggers will re-fire on next update!");
    } catch (e) {
      console.warn("Failed to clear alert triggers:", e);
    }
  };

  const [bootstrapped, setBootstrapped] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>("Synced just now");

  // Synchronize appVehicles and appRecords with FleetManager local states
  useEffect(() => {
    if (!appVehicles) return;

    // 1. Map existing appVehicles into local fleet vehicles state
    setVehicles(prevVehicles => {
      const merged = [...prevVehicles];
      
      appVehicles.forEach(appV => {
        const appPlateClean = appV.plateNumber ? appV.plateNumber.replace(/\s+/g, "").toLowerCase() : "";
        const matchIndex = merged.findIndex(v => 
          v.id === appV.id || 
          (appPlateClean && v.plateNumber && v.plateNumber.replace(/\s+/g, "").toLowerCase() === appPlateClean)
        );

        if (matchIndex !== -1) {
          // Update matched vehicle
          merged[matchIndex] = {
            ...merged[matchIndex],
            odometer: appV.mileage,
            name: appV.nickname || merged[matchIndex].name,
            brand: appV.brand,
            model: appV.model,
            year: appV.year,
            photoUrl: appV.photoUrl || merged[matchIndex].photoUrl,
            plateNumber: appV.plateNumber || merged[matchIndex].plateNumber,
            engineType: (appV.fuelType === 'Gasoline' ? 'Petrol' : appV.fuelType) as any,
          };
        } else {
          // Add newly discovered app vehicle
          merged.push({
            id: appV.id,
            name: appV.nickname || `${appV.brand} ${appV.model}`,
            plateNumber: appV.plateNumber || "N/A",
            brand: appV.brand,
            model: appV.model,
            year: appV.year,
            engineType: (appV.fuelType === 'Gasoline' ? 'Petrol' : appV.fuelType) as any,
            status: 'Available',
            currentDriver: 'None',
            odometer: appV.mileage,
            nextService: appV.lastOilChangeMileage ? appV.lastOilChangeMileage + (appV.oilChangeInterval || 5000) : appV.mileage + 5000,
            insuranceExpiry: "2027-06-23",
            roadTaxExpiry: "2026-12-31",
            photoUrl: appV.photoUrl,
            qrToken: appV.qrSecureToken || `tok-${appV.id}`
          });
        }
      });

      return merged;
    });

    // 2. Map existing appRecords into local serviceHistory
    if (appRecords && appRecords.length > 0) {
      setServiceHistory(prevSvc => {
        const mergedSvc = [...prevSvc];
        appRecords.forEach(rec => {
          if (!mergedSvc.some(s => s.id === rec.id)) {
            mergedSvc.unshift({
              id: rec.id,
              vehicleId: rec.vehicleId,
              date: rec.date,
              description: `${rec.serviceCategory}: ${rec.description}`,
              odometer: rec.mileage,
              cost: rec.cost,
              provider: rec.provider,
              status: 'Completed'
            });
          }
        });
        return mergedSvc;
      });
    }

    // 3. Auto-bootstrap seeded vehicles to backend if they aren't registered yet
    if (!bootstrapped) {
      const localOnlySeeded = vehicles.filter(v => 
        !appVehicles.some(appV => 
          appV.id === v.id || 
          (v.plateNumber && appV.plateNumber && v.plateNumber.replace(/\s+/g, "").toLowerCase() === appV.plateNumber.replace(/\s+/g, "").toLowerCase())
        )
      );

      if (localOnlySeeded.length > 0) {
        setBootstrapped(true);
        if (isSimulatedOffline) {
          console.log("[FleetManager] App is in simulated offline state. Skipping vehicle auto-bootstrap.");
          return;
        }
        Promise.all(localOnlySeeded.map(async (v) => {
          try {
            await fetch("/api/vehicles", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id: v.id,
                brand: v.brand,
                model: v.model,
                year: v.year,
                mileage: v.odometer,
                fuelType: (v.engineType === 'Petrol' ? 'Gasoline' : v.engineType),
                nickname: v.name,
                plateNumber: v.plateNumber,
                photoUrl: v.photoUrl,
                notes: "Seeded Fleet Vehicle auto-synced to My Vehicle & Logger"
              })
            });
          } catch (e) {
            console.error("Failed to auto-bootstrap fleet vehicle to backend:", e);
          }
        })).then(() => {
          if (onRefreshData) {
            onRefreshData();
          }
        });
      } else {
        setBootstrapped(true);
      }
    }
  }, [appVehicles, appRecords, bootstrapped]);

  const handleManualSync = async () => {
    setIsSyncing(true);
    if (onRefreshData) {
      await onRefreshData();
    }
    setTimeout(() => {
      setIsSyncing(false);
      setLastSyncTime(`Synced at ${new Date().toLocaleTimeString()}`);
      triggerNotification("Unified Database Synced", "All active driver Trip Logs, Odometer metrics, and Service histories are synchronized.");
    }, 800);
  };

  // AI assistant state
  const [aiPrompt, setAiPrompt] = useState<string>("");
  const [aiResponse, setAiResponse] = useState<string>("");
  const [aiLoading, setAiLoading] = useState<boolean>(false);

  // Form states for Modal Inputs
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [showAddDriverModal, setShowAddDriverModal] = useState(false);
  const [showAddTripModal, setShowAddTripModal] = useState(false);
  const [showLogFuelModal, setShowLogFuelModal] = useState(false);

  // Driver Assignment Input states
  const [assignmentUserEmail, setAssignmentUserEmail] = useState("");
  const [assignmentVehicleId, setAssignmentVehicleId] = useState("");
  const [assignmentForceDriver, setAssignmentForceDriver] = useState(true);

  // Form Fields
  const [newVehName, setNewVehName] = useState("");
  const [newVehPlate, setNewVehPlate] = useState("");
  const [newVehBrand, setNewVehBrand] = useState("Toyota");
  const [newVehModel, setNewVehModel] = useState("");
  const [newVehYear, setNewVehYear] = useState(2022);
  const [newVehEngine, setNewVehEngine] = useState<'Petrol' | 'Diesel' | 'Hybrid' | 'EV' | 'Gas'>("Hybrid");
  const [newVehOdo, setNewVehOdo] = useState(30000);
  const [newVehNextSvc, setNewVehNextSvc] = useState(35000);

  const [newDrvName, setNewDrvName] = useState("");
  const [newDrvPhone, setNewDrvPhone] = useState("");
  const [newDrvTg, setNewDrvTg] = useState("");
  const [newDrvAssign, setNewDrvAssign] = useState<'Permanent' | 'Temporary' | 'Trip-based'>("Permanent");

  const [newTripVeh, setNewTripVeh] = useState("");
  const [newTripDrv, setNewTripDrv] = useState("");
  const [newTripLoc, setNewTripLoc] = useState("");
  const [newTripPurpose, setNewTripPurpose] = useState("Boss transport");
  const [newTripNotes, setNewTripNotes] = useState("");

  const [newFuelVeh, setNewFuelVeh] = useState("");
  const [newFuelType, setNewFuelType] = useState("Fuel");
  const [newFuelAmount, setNewFuelAmount] = useState(45);
  const [newFuelStation, setNewFuelStation] = useState("");
  const [newFuelNotes, setNewFuelNotes] = useState("");
  const [newFuelOdo, setNewFuelOdo] = useState<number>(0);

  // Prefill odometer when selected fuel vehicle changes
  useEffect(() => {
    const activeVehId = newFuelVeh || (vehicles[0]?.id || "");
    const matched = vehicles.find(v => v.id === activeVehId);
    if (matched) {
      setNewFuelOdo(matched.odometer);
    }
  }, [newFuelVeh, vehicles]);

  // Set default driver form pre-fills when driverVehId or vehicles change
  useEffect(() => {
    if (vehicles.length > 0 && !driverVehId) {
      setDriverVehId(vehicles[0].id);
      setDriverStartOdo(vehicles[0].odometer);
    }
  }, [vehicles, driverVehId]);

  // Sync starting odometer when vehicle is selected in driver form
  useEffect(() => {
    if (driverVehId) {
      const selected = vehicles.find(v => v.id === driverVehId);
      if (selected) {
        setDriverStartOdo(selected.odometer);
      }
    }
  }, [driverVehId, vehicles]);

  // Dynamically register active logged-in user so they can select themselves in the driver assignment list
  useEffect(() => {
    if (userProfile && userProfile.email) {
      const emailLower = userProfile.email.toLowerCase();
      setRegisteredUsers(prev => {
        const exists = prev.some(u => u.email.toLowerCase() === emailLower);
        if (exists) return prev;
        return [
          ...prev,
          {
            uid: "u-logged-in",
            name: userProfile.name || "Manager (You)",
            email: userProfile.email,
            phone: userProfile.phone || "012 999 999",
            role: userProfile.role || "Manager"
          }
        ];
      });
    }
  }, [userProfile]);

  // Lock Role for Assigned Drivers or Driver Role Profile
  useEffect(() => {
    if (userProfile) {
      const emailMatch = userProfile.email ? userProfile.email.toLowerCase() : "";
      const isAssigned = userVehicleAssignments.some(
        a => a.userEmail.toLowerCase() === emailMatch
      );
      
      // Look up user in registeredUsers list to check if toggled to Driver role
      const matchedRu = registeredUsers.find(ru => ru.email.toLowerCase() === emailMatch);
      const isDriverRole = matchedRu 
        ? (matchedRu.role === 'Driver / Staff' || matchedRu.role === 'Driver') 
        : (userProfile.role === 'Driver / Staff' || userProfile.role === 'Driver');

      if (isAssigned && isDriverRole) {
        setIsLockedToDriver(true);
        setActiveRole('Driver');
        // Force subtab constraint
        if (['dashboard', 'vehicles', 'drivers', 'ai', 'notifications', 'subscription'].includes(activeSubTab)) {
          setActiveSubTab('trips');
        }
      } else {
        setIsLockedToDriver(false);
      }
    }
  }, [userProfile, userVehicleAssignments, registeredUsers, activeSubTab]);

  // Helper: Calculate Dashboard Alerts for Notification Badges
  const getDashboardAlerts = () => {
    const alerts: Array<{ id: string; type: 'expense' | 'insurance' | 'service'; title: string; desc: string; severity: 'high' | 'medium' | 'low'; actionLabel?: string; refId: string }> = [];

    // 1. Pending Expense Approvals
    const pendingExpenses = expenses.filter(e => e.status === 'Pending');
    pendingExpenses.forEach(exp => {
      const veh = vehicles.find(v => v.id === exp.vehicleId);
      const drv = drivers.find(d => d.id === exp.driverId);
      alerts.push({
        id: `alert-exp-${exp.id}`,
        type: 'expense',
        title: `Pending Approval: $${exp.amount} ${exp.category}`,
        desc: `${drv ? drv.name : 'Driver'} submitted a receipt for ${veh ? veh.name : 'Vehicle'} at ${exp.stationName || 'station'}.`,
        severity: 'high',
        actionLabel: 'Approve / Reject',
        refId: exp.id
      });
    });

    // 2. Upcoming Insurance Renewals
    const today = new Date("2026-06-23");
    vehicles.forEach(v => {
      if (v.insuranceExpiry) {
        const expDate = new Date(v.insuranceExpiry);
        const diffTime = expDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 90 && diffDays > 0) {
          alerts.push({
            id: `alert-ins-${v.id}`,
            type: 'insurance',
            title: `Insurance Renew: ${v.name}`,
            desc: `Policy expires in ${diffDays} days (${v.insuranceExpiry}) for plate ${v.plateNumber}.`,
            severity: diffDays <= 30 ? 'high' : 'medium',
            actionLabel: 'Renew',
            refId: v.id
          });
        }
      }
    });

    // 3. Service Due Dates
    vehicles.forEach(v => {
      const diffKm = v.nextService - v.odometer;
      if (diffKm <= 2000 && diffKm > 0) {
        alerts.push({
          id: `alert-svc-${v.id}`,
          type: 'service',
          title: `Service Due: ${v.name}`,
          desc: `Vehicle is ${diffKm} km away from its scheduled maintenance goal (${v.nextService.toLocaleString()} km).`,
          severity: diffKm <= 850 ? 'high' : 'medium',
          actionLabel: 'Schedule Service',
          refId: v.id
        });
      } else if (diffKm <= 0) {
        alerts.push({
          id: `alert-svc-overdue-${v.id}`,
          type: 'service',
          title: `Service Overdue: ${v.name}`,
          desc: `Scheduled at ${v.nextService.toLocaleString()} km. Odometer is currently ${v.odometer.toLocaleString()} km.`,
          severity: 'high',
          actionLabel: 'Schedule Service',
          refId: v.id
        });
      }
    });

    return alerts;
  };

  // Helper: Dynamic High-Cost Vehicle Analytics
  const getHighCostVehicleAnalytics = () => {
    const costMap: { [key: string]: { fuel: number; repair: number; total: number } } = {};
    
    // Initialize for all vehicles
    vehicles.forEach(v => {
      costMap[v.id] = { fuel: 0, repair: 0, total: 0 };
    });

    expenses.forEach(e => {
      if (!costMap[e.vehicleId]) {
        costMap[e.vehicleId] = { fuel: 0, repair: 0, total: 0 };
      }
      const amount = e.amount;
      if (e.category === 'Fuel' || e.category === 'EV Charging') {
        costMap[e.vehicleId].fuel += amount;
      } else if (e.category === 'Minor Repair' || e.category === 'Repair' || e.category === 'Spare Parts / Repairs') {
        costMap[e.vehicleId].repair += amount;
      } else {
        costMap[e.vehicleId].fuel += amount; // fallback general expense
      }
      costMap[e.vehicleId].total += amount;
    });

    let maxVehicleId = "fv-1"; // default
    let maxCost = -1;

    Object.keys(costMap).forEach(vId => {
      if (costMap[vId].total > maxCost) {
        maxCost = costMap[vId].total;
        maxVehicleId = vId;
      }
    });

    const maxVeh = vehicles.find(v => v.id === maxVehicleId);
    return {
      vehicle: maxVeh,
      stats: maxVeh ? costMap[maxVehicleId] : { fuel: 0, repair: 0, total: 0 }
    };
  };

  // Driver completed trip submission
  const handleDriverTripSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!driverVehId || !driverEndOdo || !driverPurpose) {
      alert("Please specify the vehicle, end odometer, and trip purpose.");
      return;
    }

    const matchedVeh = vehicles.find(v => v.id === driverVehId);
    if (!matchedVeh) return;

    if (Number(driverEndOdo) <= Number(driverStartOdo)) {
      alert("Ending odometer reading must be greater than starting odometer reading!");
      return;
    }

    const newTripId = `tr-drv-${Date.now()}`;
    const newTrip: FleetTrip = {
      id: newTripId,
      vehicleId: driverVehId,
      driverId: "dr-2", // Default Sok Cheat for display
      startTime: new Date().toISOString().replace("T", " ").substring(0, 16),
      endTime: new Date().toISOString().replace("T", " ").substring(0, 16),
      startOdo: Number(driverStartOdo),
      endOdo: Number(driverEndOdo),
      startLoc: "Phnom Penh Main Terminal",
      endLoc: "HQ Terminal / Destination",
      purpose: driverPurpose,
      notes: driverNotes,
      status: "Completed"
    };

    // 1. Update vehicle odometer and status
    const updatedVehicles = vehicles.map(v => {
      if (v.id === driverVehId) {
        return {
          ...v,
          odometer: Number(driverEndOdo),
          status: 'Available' as const, // return to available pool
          currentDriver: 'None'
        };
      }
      return v;
    });
    setVehicles(updatedVehicles);

    // 2. Add to Trips history
    setTrips([newTrip, ...trips]);

    // 3. Integrate into vehicle's Service History
    const newServiceRecord: ServiceHistoryRecord = {
      id: `sh-drv-${Date.now()}`,
      vehicleId: driverVehId,
      date: new Date().toISOString().split('T')[0],
      description: `Odometer Sync & Trip Record (${driverPurpose}). Driven by ${userProfile?.name || 'Driver'}. Notes: ${driverNotes}`,
      odometer: Number(driverEndOdo),
      status: 'Completed'
    };
    setServiceHistory([newServiceRecord, ...serviceHistory]);

    // Sync trip metrics and odometer to the backend endpoints
    const todayStr = new Date().toISOString().split('T')[0];

    if (setAppVehicles && appVehicles) {
      setAppVehicles(prev => prev.map(v => v.id === driverVehId ? {
        ...v,
        mileage: Number(driverEndOdo),
        lastServiceDate: todayStr
      } : v));
    }

    if (setAppRecords && appRecords) {
      const newAppRec: MaintenanceRecord = {
        id: `m-drv-${Date.now()}`,
        vehicleId: driverVehId,
        serviceCategory: "Diagnostic Scan",
        description: `Odometer Sync & Trip Record (${driverPurpose}). Driven by ${userProfile?.name || 'Driver'}. Notes: ${driverNotes}`,
        cost: 0,
        mileage: Number(driverEndOdo),
        date: todayStr,
        provider: "Cambodian Fleet Express Log Sync"
      };
      setAppRecords(prev => [newAppRec, ...prev]);
    }

    fetch(`/api/vehicles/${driverVehId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mileage: Number(driverEndOdo),
        lastServiceDate: todayStr
      })
    }).then(() => {
      return fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId: driverVehId,
          serviceCategory: "Diagnostic Scan",
          description: `Odometer Sync & Trip Record (${driverPurpose}). Driven by ${userProfile?.name || 'Driver'}. Notes: ${driverNotes}`,
          cost: 0,
          mileage: Number(driverEndOdo),
          date: todayStr,
          provider: "Cambodian Fleet Express Log Sync"
        })
      });
    }).then(() => {
      if (onRefreshData) onRefreshData();
    }).catch(e => {
      console.error("Failed to sync completed trip to backend:", e);
    });

    // Clear form inputs
    setDriverEndOdo("");
    setDriverNotes("");

    // Notification
    triggerNotification("Odometer Ledger Updated", `${matchedVeh.name} odometer synced to ${Number(driverEndOdo).toLocaleString()} km via completed trip.`);
    alert("Trip successfully completed! Odometer sync registered and logged to vehicle service history.");
  };

  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVehName || !newVehPlate) return;

    const newVeh: FleetVehicle = {
      id: `fv-${Date.now()}`,
      name: newVehName,
      plateNumber: newVehPlate,
      brand: newVehBrand,
      model: newVehModel || "Custom",
      year: Number(newVehYear),
      engineType: newVehEngine,
      status: "Available",
      currentDriver: "None",
      odometer: Number(newVehOdo),
      nextService: Number(newVehNextSvc),
      insuranceExpiry: "2027-01-01",
      roadTaxExpiry: "2026-12-31",
      qrToken: `tok-new-${Date.now()}`
    };

    setVehicles([newVeh, ...vehicles]);

    if (setAppVehicles && appVehicles) {
      const appNewVeh: VehicleProfile = {
        id: newVeh.id,
        brand: newVeh.brand,
        model: newVeh.model,
        year: newVeh.year,
        mileage: newVeh.odometer,
        fuelType: (newVeh.engineType === 'Petrol' ? 'Gasoline' : newVeh.engineType) as any,
        nickname: newVeh.name,
        plateNumber: newVeh.plateNumber,
        photoUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=400",
        notes: "Registered via Fleet & Family Manager"
      };
      setAppVehicles([appNewVeh, ...appVehicles]);
    }

    // Save to the backend so that they sync to the parent My Vehicle & Logger dashboard as well!
    fetch("/api/vehicles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: newVeh.id,
        brand: newVeh.brand,
        model: newVeh.model,
        year: newVeh.year,
        mileage: newVeh.odometer,
        fuelType: (newVeh.engineType === 'Petrol' ? 'Gasoline' : newVeh.engineType),
        nickname: newVeh.name,
        plateNumber: newVeh.plateNumber,
        photoUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=400",
        notes: "Registered via Fleet & Family Manager"
      })
    }).then(() => {
      if (onRefreshData) onRefreshData();
    }).catch(e => {
      console.error("Failed to sync newly registered vehicle to backend:", e);
    });

    setShowAddVehicleModal(false);
    triggerNotification("Vehicle Added", `Registered new fleet vehicle ${newVehName} with plate ${newVehPlate}.`);
    
    // Clear fields
    setNewVehName("");
    setNewVehPlate("");
    setNewVehModel("");
  };

  const handleAddDriver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDrvName || !newDrvPhone) return;

    const newDrv: FleetDriver = {
      id: `dr-${Date.now()}`,
      name: newDrvName,
      phone: newDrvPhone,
      telegramHandle: newDrvTg || `@${newDrvName.toLowerCase().replace(" ", "_")}`,
      assignmentType: newDrvAssign,
      status: "Active"
    };

    setDrivers([newDrv, ...drivers]);
    setShowAddDriverModal(false);
    triggerNotification("Driver Invited", `Invited new driver ${newDrvName}. Verification token sent to Telegram handle ${newDrv.telegramHandle}.`);

    setNewDrvName("");
    setNewDrvPhone("");
    setNewDrvTg("");
  };

  const handleAddTrip = (e: React.FormEvent) => {
    e.preventDefault();
    const vehId = newTripVeh || vehicles[0]?.id;
    const drvId = newTripDrv || drivers[0]?.id;
    if (!vehId || !drvId) return;

    const matchedVeh = vehicles.find(v => v.id === vehId);
    if (!matchedVeh) return;

    const newTrip: FleetTrip = {
      id: `tr-${Date.now()}`,
      vehicleId: vehId,
      driverId: drvId,
      startTime: new Date().toISOString().replace("T", " ").substring(0, 16),
      startOdo: matchedVeh.odometer,
      startLoc: newTripLoc || "Phnom Penh Main Office",
      purpose: newTripPurpose,
      notes: newTripNotes,
      status: "Active"
    };

    // Update vehicle status
    setVehicles(vehicles.map(v => v.id === vehId ? { ...v, status: 'In Use', currentDriver: drivers.find(d => d.id === drvId)?.name || 'Unknown' } : v));
    setTrips([newTrip, ...trips]);
    setShowAddTripModal(false);
    triggerNotification("Trip Started", `Trip started for ${matchedVeh.name} driven by ${drivers.find(d => d.id === drvId)?.name || "assigned driver"}.`);

    setNewTripLoc("");
    setNewTripNotes("");
  };

  const handleLogFuel = (e: React.FormEvent) => {
    e.preventDefault();
    const vehId = newFuelVeh || vehicles[0]?.id;
    const drvId = drivers[0]?.id;
    if (!vehId || !drvId) return;

    const matchedVeh = vehicles.find(v => v.id === vehId);
    if (!matchedVeh) return;

    const todayStr = new Date().toISOString().split('T')[0];

    const newExp: FleetExpense = {
      id: `ex-${Date.now()}`,
      vehicleId: vehId,
      driverId: drvId,
      category: newFuelType,
      amount: Number(newFuelAmount),
      date: todayStr,
      stationName: newFuelStation || "TotalEnergies Sothearos",
      energyType: newFuelType === "Fuel" ? "Regular 92" : "AC Charge",
      quantity: 35,
      notes: newFuelNotes || "Driver fuel log",
      status: "Pending"
    };

    // 1. Update local vehicles
    setVehicles(vehicles.map(v => v.id === vehId ? {
      ...v,
      odometer: Math.max(v.odometer, newFuelOdo)
    } : v));

    setExpenses([newExp, ...expenses]);
    setShowLogFuelModal(false);
    triggerNotification("Expense Logged", `Driver Sok Cheat logged a pending ${newFuelType} bill of $${newFuelAmount} USD with odometer reading of ${newFuelOdo} km.`);

    // 2. Sync to parent application states
    if (setAppVehicles && appVehicles) {
      const updated = syncVehicleRecords(appVehicles, vehId, {
        mileage: newFuelOdo,
        lastServiceDate: todayStr
      });
      setAppVehicles(updated);
    }

    if (setAppRecords && appRecords) {
      const newAppRec: MaintenanceRecord = {
        id: `m-fuel-${Date.now()}`,
        vehicleId: vehId,
        serviceCategory: newFuelType === "Fuel" ? "Fuel Refuel" : "EV Charging",
        description: `Logged ${newFuelType} at ${newFuelStation || "TotalEnergies Sothearos"}. Notes: ${newFuelNotes || "Driver fuel log"}`,
        cost: Number(newFuelAmount),
        mileage: newFuelOdo,
        date: todayStr,
        provider: newFuelStation || "TotalEnergies Sothearos"
      };
      setAppRecords(prev => [newAppRec, ...prev]);
    }

    // 3. Sync to database backend
    fetch(`/api/vehicles/${vehId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mileage: newFuelOdo,
        lastServiceDate: todayStr
      })
    }).then(() => {
      return fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId: vehId,
          serviceCategory: newFuelType === "Fuel" ? "Fuel Refuel" : "EV Charging",
          description: `Logged ${newFuelType} at ${newFuelStation || "TotalEnergies Sothearos"}. Notes: ${newFuelNotes || "Driver fuel log"}`,
          cost: Number(newFuelAmount),
          mileage: newFuelOdo,
          date: todayStr,
          provider: newFuelStation || "TotalEnergies"
        })
      });
    }).then(() => {
      if (onRefreshData) onRefreshData();
    }).catch((e) => {
      console.error("Failed to sync fuel log to database:", e);
    });

    setNewFuelStation("");
    setNewFuelNotes("");
  };

  const handleApproveExpense = (id: string) => {
    setExpenses(expenses.map(exp => exp.id === id ? { ...exp, status: "Approved" } : exp));
    triggerNotification("Expense Approved", `Approved expense of $${expenses.find(e => e.id === id)?.amount} USD.`);
  };

  const handleRejectExpense = (id: string) => {
    setExpenses(expenses.map(exp => exp.id === id ? { ...exp, status: "Rejected" } : exp));
    triggerNotification("Expense Rejected", `Rejected expense of $${expenses.find(e => e.id === id)?.amount} USD.`);
  };

  const triggerNotification = (title: string, message: string) => {
    const newNotif: FleetNotification = {
      id: `nt-${Date.now()}`,
      title,
      message,
      timestamp: "Just now",
      channel: "Telegram",
      read: false
    };
    setNotifications([newNotif, ...notifications]);
  };

  // Run AI Fleet Advisor analysis using Gemini model
  const runAiAdvisor = async () => {
    setAiLoading(true);
    setAiResponse("");

    const dataPayload = {
      vehicles,
      drivers,
      expenses,
      trips,
      query: aiPrompt || "Analyze my fleet expenses and suggest optimization tips for Cambodia."
    };

    try {
      const promptText = `
        You are the "My Vehicle Care" Premium AI Fleet Advisor in Phnom Penh, Cambodia. 
        Analyze the following fleet configuration, drivers, trips, and expenses:
        Vehicles: ${JSON.stringify(vehicles)}
        Drivers: ${JSON.stringify(drivers)}
        Expenses: ${JSON.stringify(expenses)}
        Trips: ${JSON.stringify(trips)}

        Address the user's inquiry: "${dataPayload.query}".
        Provide 3-4 professional, highly analytical, clear bullet points in clean, engaging display English.
        Include:
        1. High-cost outlier rifs (Which vehicle costs the most and why).
        2. Potential fuel fraud or duplicate logs (checking if amount vs station is abnormal).
        3. Driver fuel efficiency and vehicle utilization rates.
        4. Clear action advice for the Fleet Manager.
        Keep it professional, concise, with clean Cambodian context (Expressways, Phnom Penh local traffic, petrol stations like PTT/Caltex/TotalEnergies, and EV charging options). Do not output markdown code blocks.
      `;

      const response = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptText })
      });

      if (response.ok) {
        const result = await response.json();
        setAiResponse(result.text || "No insights found. Check fleet metrics and try again.");
      } else {
        // Fallback simulated smart output if server key is unavailable
        setTimeout(() => {
          setAiResponse(`
            *   **High-Cost Outlier:** VIP Alphard Boss (#fv-1) is running the highest fuel cost ($65/tank) at PTT Chbar Ampov, which matches expected executive usage, but the Eco Delivery Prius (#fv-3) is frequently in repair with over 245,000 km, leading to high maintenance overhead.
            *   **Abnormal fuel alert:** Sok Cheat logged $65 USD for the Prius Gen 3 hybrid which is extremely high for standard delivery tasks unless dual shifts are being run. Recommend cross-checking odometer values.
            *   **Underutilization:** Delivery Van A (#fv-2) has been Idle for 4 days with "Ly Hour" marked Off-Duty. Consider re-assigning Ly Hour on a trip-based route.
            *   **Recommendations:** Set a weekly strict fuel spending limit of $50 per driver for delivery couriers and migrate minor repairs to Apsara Partner Garage for Care Coin cashbacks.
          `);
        }, 1500);
      }
    } catch (e) {
      setAiResponse("AI Advisor connection timed out. Showing local simulated advice instead.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn font-sans" id="premium-fleet-manager">
      {/* Header Banner with Premium Styling and Lang selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-2xl -ml-16 -mb-16 pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 z-10 relative">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-emerald-500/25">
              <Shield className="w-3 h-3 text-emerald-400" />
              <span>Premium Phase 2 Activated</span>
            </span>
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Layers className="w-6 h-6 text-emerald-400" />
              <span>{activeTranslation.title}</span>
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl">
              {activeTranslation.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* EN / KH toggle button */}
            <button
              onClick={() => setLang(lang === 'en' ? 'kh' : 'en')}
              className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-bold px-3 py-2 rounded-xl transition cursor-pointer"
            >
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>{lang === 'en' ? "ភាសាខ្មែរ (KH)" : "English (EN)"}</span>
            </button>
          </div>
        </div>

        {/* Role switcher segment */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-indigo-400" />
              <span>{activeTranslation.switchRole}</span>
            </span>
            {isLockedToDriver ? (
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold px-3 py-1.5 rounded-xl">
                  <Lock className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                  <span>Account Locked to Driver Role ({userProfile?.email || "Staff"})</span>
                </div>
                <button
                  onClick={() => {
                    const emailMatch = userProfile?.email ? userProfile.email.toLowerCase() : "";
                    setUserVehicleAssignments(userVehicleAssignments.filter(as => as.userEmail.toLowerCase() !== emailMatch));
                    setRegisteredUsers(registeredUsers.map(ru => ru.email.toLowerCase() === emailMatch ? { ...ru, role: 'Manager' } : ru));
                    triggerNotification("Test Unlocked", "Released active driver restriction for your account.");
                  }}
                  className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 hover:text-rose-300 rounded-xl transition cursor-pointer flex items-center gap-1 shadow-sm"
                  title="Testing bypass: Click to unlock"
                >
                  <Unlock className="w-3 h-3 text-rose-400" />
                  <span>Release My Test Lock</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => { setActiveRole('Manager'); setActiveSubTab('dashboard'); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    activeRole === 'Manager' 
                      ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/15" 
                      : "bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400"
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>{activeTranslation.roleManager}</span>
                </button>
                <button
                  onClick={() => { setActiveRole('Driver'); setActiveSubTab('trips'); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    activeRole === 'Driver' 
                      ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/15" 
                      : "bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400"
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>{activeTranslation.roleDriver}</span>
                </button>
                <button
                  onClick={() => { setActiveRole('Owner'); setActiveSubTab('dashboard'); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    activeRole === 'Owner' 
                      ? "bg-slate-800 text-slate-100 border border-slate-700" 
                      : "bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400"
                  }`}
                >
                  <Car className="w-3.5 h-3.5" />
                  <span>{activeTranslation.roleOwner}</span>
                </button>
              </div>
            )}
          </div>

          {isLockedToDriver && (
            <div className="text-[10px] text-slate-500 italic">
              🔒 Admin linkage restricts your workspace to Assigned Driver dashboard only.
            </div>
          )}
        </div>
      </div>

      {/* Fleet Selector Segment (Manager Only) */}
      {activeRole === 'Manager' && (
        <div className="flex flex-wrap gap-2 items-center bg-slate-950 border border-slate-900 rounded-2xl p-3">
          <span className="text-xs font-bold text-slate-500 uppercase px-2">Active Group:</span>
          {fleets.map((fl) => (
            <button
              key={fl.id}
              onClick={() => setSelectedFleetId(fl.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedFleetId === fl.id 
                  ? "bg-slate-800 text-slate-100 border border-slate-700" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {fl.name} ({fl.type})
            </button>
          ))}
          <button 
            onClick={() => {
              const newFleetName = prompt("Enter new Fleet name:", "Sihanoukville Cargo Fleet");
              if (newFleetName) {
                const newF: FleetProfile = {
                  id: `fleet-${Date.now()}`,
                  name: newFleetName,
                  type: "Company Fleet",
                  managerName: "Khem Somaly",
                  planId: "sme"
                };
                setFleets([...fleets, newF]);
                setSelectedFleetId(newF.id);
              }
            }}
            className="ml-auto px-2.5 py-1 text-slate-400 hover:text-white hover:bg-slate-900 border border-dashed border-slate-800 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>Create Fleet</span>
          </button>
        </div>
      )}

      {/* SUB TABS NAVIGATION FOR FLEET MANAGER */}
      <div className="flex border-b border-slate-850 overflow-x-auto gap-2 no-scrollbar">
        {activeRole === 'Manager' && (
          <>
            <button
              onClick={() => setActiveSubTab('dashboard')}
              className={`pb-3 text-xs font-bold px-1 transition relative whitespace-nowrap cursor-pointer ${
                activeSubTab === 'dashboard' ? "text-emerald-400" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>Dashboard</span>
              {activeSubTab === 'dashboard' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full"></div>}
            </button>
            <button
              onClick={() => setActiveSubTab('vehicles')}
              className={`pb-3 text-xs font-bold px-1 transition relative whitespace-nowrap cursor-pointer ${
                activeSubTab === 'vehicles' ? "text-emerald-400" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>Vehicles ({vehicles.length})</span>
              {activeSubTab === 'vehicles' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full"></div>}
            </button>
            <button
              onClick={() => setActiveSubTab('drivers')}
              className={`pb-3 text-xs font-bold px-1 transition relative whitespace-nowrap cursor-pointer ${
                activeSubTab === 'drivers' ? "text-emerald-400" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>Drivers ({drivers.length})</span>
              {activeSubTab === 'drivers' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full"></div>}
            </button>
          </>
        )}

        {/* Common Tabs */}
        <button
          onClick={() => setActiveSubTab('trips')}
          className={`pb-3 text-xs font-bold px-1 transition relative whitespace-nowrap cursor-pointer ${
            activeSubTab === 'trips' ? "text-emerald-400" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <span>Trips ({trips.length})</span>
          {activeSubTab === 'trips' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full"></div>}
        </button>
        <button
          onClick={() => setActiveSubTab('expenses')}
          className={`pb-3 text-xs font-bold px-1 transition relative whitespace-nowrap cursor-pointer ${
            activeSubTab === 'expenses' ? "text-emerald-400" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <span>Expenses & Fuel</span>
          {activeSubTab === 'expenses' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full"></div>}
        </button>
        <button
          onClick={() => setActiveSubTab('wireframes')}
          className={`pb-3 text-xs font-bold px-1 transition relative whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === 'wireframes' ? "text-emerald-400 font-extrabold" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          <span className="text-indigo-300">Wireframe Studio</span>
          {activeSubTab === 'wireframes' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full"></div>}
        </button>

        {activeRole === 'Manager' && (
          <>
            <button
              onClick={() => setActiveSubTab('ai')}
              className={`pb-3 text-xs font-bold px-1 transition relative whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                activeSubTab === 'ai' ? "text-emerald-400 font-extrabold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
              <span>AI Fleet Advisor</span>
              {activeSubTab === 'ai' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full"></div>}
            </button>
            <button
              onClick={() => setActiveSubTab('notifications')}
              className={`pb-3 text-xs font-bold px-1 transition relative whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                activeSubTab === 'notifications' ? "text-emerald-400" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>Notifications</span>
              <span className="bg-red-500/20 text-red-400 text-[9px] px-1.5 py-0.5 rounded-full font-mono">
                {notifications.filter(n => !n.read).length}
              </span>
              {activeSubTab === 'notifications' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full"></div>}
            </button>
            <button
              onClick={() => setActiveSubTab('subscription')}
              className={`pb-3 text-xs font-bold px-1 transition relative whitespace-nowrap cursor-pointer ${
                activeSubTab === 'subscription' ? "text-emerald-400" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>Subscription & Limits</span>
              {activeSubTab === 'subscription' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full"></div>}
            </button>
          </>
        )}
      </div>

      {/* -------------------- 1. MANAGER DASHBOARD TAB -------------------- */}
      {activeSubTab === 'dashboard' && activeRole === 'Manager' && (
        <div className="space-y-6 animate-fadeIn">
          {/* CRITICAL FLEET BULLETINS & NOTIFICATION BADGE BAR */}
          {(() => {
            const dashboardAlerts = getDashboardAlerts();
            if (dashboardAlerts.length === 0) return null;
            return (
              <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 space-y-3.5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-xl pointer-events-none"></div>
                <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                    </span>
                    <h3 className="text-xs font-black text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                      <Bell className="w-4 h-4 text-rose-500" />
                      <span>Active Fleet Bulletins</span>
                    </h3>
                  </div>
                  <span className="px-2.5 py-0.5 bg-rose-500/10 text-rose-400 text-[10px] font-black uppercase rounded-full border border-rose-500/20">
                    {dashboardAlerts.length} Action Items
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {dashboardAlerts.slice(0, 4).map((bulletin) => (
                    <div key={bulletin.id} className="p-3 bg-slate-900/60 border border-slate-850 rounded-xl hover:border-slate-800 transition flex items-start gap-3">
                      <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                        bulletin.type === 'expense' ? 'bg-amber-500/10 text-amber-500' :
                        bulletin.type === 'insurance' ? 'bg-rose-500/10 text-rose-500' : 'bg-sky-500/10 text-sky-400'
                      }`}>
                        {bulletin.type === 'expense' && <DollarSign className="w-4 h-4" />}
                        {bulletin.type === 'insurance' && <Shield className="w-4 h-4" />}
                        {bulletin.type === 'service' && <Clock className="w-4 h-4" />}
                      </div>
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-200 truncate">{bulletin.title}</span>
                          <span className={`text-[8px] px-1 rounded font-black uppercase shrink-0 ${
                            bulletin.severity === 'high' ? 'bg-rose-500/15 text-rose-400' : 'bg-amber-500/15 text-amber-400'
                          }`}>
                            {bulletin.severity}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-normal">{bulletin.desc}</p>
                        <div className="pt-1.5 flex gap-2">
                          {bulletin.type === 'expense' && (
                            <button 
                              onClick={() => {
                                setActiveSubTab('dashboard');
                                const element = document.getElementById('receipt-approval-desk');
                                if (element) element.scrollIntoView({ behavior: 'smooth' });
                              }}
                              className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-0.5 hover:underline cursor-pointer bg-transparent border-0 p-0"
                            >
                              <span>Go to Approval Desk</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                          {bulletin.type === 'insurance' && (
                            <button 
                              onClick={() => {
                                window.alert(`Renewing insurance for vehicle ${bulletin.refId}. Direct API payload submitted to Forte Insurance Cambodia.`);
                                setVehicles(vehicles.map(v => v.id === bulletin.refId ? { ...v, insuranceExpiry: "2027-06-23" } : v));
                              }}
                              className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-0.5 hover:underline cursor-pointer bg-transparent border-0 p-0"
                            >
                              <span>Renew with Forte Ins</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                          {bulletin.type === 'service' && (
                            <button 
                              onClick={() => {
                                window.alert(`Scheduling maintenance for vehicle ${bulletin.refId}. Simulated booking request sent to partner garage.`);
                                const targetVeh = vehicles.find(v => v.id === bulletin.refId);
                                if (targetVeh) {
                                  const svcMileage = targetVeh.nextService;
                                  const todayStr = new Date().toISOString().split('T')[0];
                                  
                                  // Update local list
                                  setVehicles(vehicles.map(v => v.id === bulletin.refId ? { ...v, odometer: svcMileage, nextService: svcMileage + 5000, status: 'Available' } : v));

                                  // Update parent state instantly for My Vehicle & Logger tab
                                  if (setAppVehicles && appVehicles) {
                                    setAppVehicles(prev => prev.map(v => v.id === bulletin.refId ? {
                                      ...v,
                                      mileage: svcMileage,
                                      lastServiceDate: todayStr
                                    } : v));
                                  }

                                  if (setAppRecords && appRecords) {
                                    const newAppRec: MaintenanceRecord = {
                                      id: `m-prev-${Date.now()}`,
                                      vehicleId: bulletin.refId,
                                      serviceCategory: "Preventive Maintenance",
                                      description: "Scheduled 5,000 km Preventive Service (Oil, Filter, & Safety check). Completed via Partner Garage booking.",
                                      cost: 150,
                                      mileage: svcMileage,
                                      date: todayStr,
                                      provider: "Apsara Partner Garage"
                                    };
                                    setAppRecords(prev => [newAppRec, ...prev]);
                                  }

                                  // Sync back to backend database
                                  fetch(`/api/vehicles/${bulletin.refId}`, {
                                    method: "PUT",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ 
                                      mileage: svcMileage,
                                      lastServiceDate: todayStr
                                    })
                                  }).then(() => {
                                    return fetch("/api/maintenance", {
                                      method: "POST",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({
                                        vehicleId: bulletin.refId,
                                        serviceCategory: "Preventive Maintenance",
                                        description: "Scheduled 5,000 km Preventive Service (Oil, Filter, & Safety check). Completed via Partner Garage booking.",
                                        cost: 150,
                                        mileage: svcMileage,
                                        date: todayStr,
                                        provider: "Apsara Partner Garage"
                                      })
                                    });
                                  }).then(() => {
                                    if (onRefreshData) onRefreshData();
                                  }).catch(e => {
                                    console.error("Failed to sync preventive service action to backend:", e);
                                  });
                                }
                              }}
                              className="text-[10px] text-sky-400 hover:text-sky-300 font-bold flex items-center gap-0.5 hover:underline cursor-pointer bg-transparent border-0 p-0"
                            >
                              <span>Schedule Preventive Service</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* UNIFIED DATA-SYNC STATUS UTILITY PANEL */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-emerald-950/10 border border-emerald-500/15 rounded-3xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl shrink-0 mt-0.5">
                <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : 'animate-pulse'}`} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[9px] font-black tracking-wider uppercase rounded-full border border-emerald-500/20 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                    <span>Live Database Sync Connected</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Channel: WebSockets/REST</span>
                </div>
                <h4 className="text-xs font-black text-slate-200 uppercase tracking-wide">Unified Odometer & Record Sync Utility</h4>
                <p className="text-[11px] text-slate-400 max-w-2xl leading-relaxed">
                  Links driver-logged Odometer trip completions and vehicle service entries in real-time. Updates are immediately published across both the <strong className="text-slate-300">My Vehicle & Logger</strong> home view and the <strong className="text-slate-300">Fleet & Family Manager</strong>.
                </p>
              </div>
            </div>

            <div className="flex flex-row md:flex-col items-start md:items-end justify-between w-full md:w-auto gap-4 md:gap-1.5 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800 md:border-none shrink-0">
              <div className="text-left md:text-right">
                <span className="text-[9px] text-slate-500 uppercase font-bold block">Status State</span>
                <span className="text-xs font-black text-emerald-400 font-mono flex items-center gap-1">
                  {lastSyncTime}
                </span>
                <span className="text-[9px] text-slate-500 block mt-0.5">Auto-Refreshes on Action</span>
              </div>
              
              <button 
                onClick={handleManualSync}
                disabled={isSyncing}
                className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-800/30 disabled:text-emerald-500/50 text-slate-950 text-xs font-black rounded-xl transition flex items-center gap-1.5 cursor-pointer select-none border-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? "Syncing..." : "Sync Now"}</span>
              </button>
            </div>
          </div>

          {/* Dashboard bento grids */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-500">{activeTranslation.totalVehicles}</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-black text-slate-100 font-mono">{vehicles.length}</span>
                <Car className="w-5 h-5 text-sky-400" />
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-500">{activeTranslation.availableVehicles}</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-black text-emerald-400 font-mono">{vehicles.filter(v => v.status === 'Available').length}</span>
                <span className="text-[9px] font-bold bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded">Ready</span>
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-500">{activeTranslation.vehiclesInUse}</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-black text-indigo-400 font-mono">{vehicles.filter(v => v.status === 'In Use').length}</span>
                <Activity className="w-4 h-4 text-indigo-400 animate-pulse" />
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-500">{activeTranslation.pendingApprovals}</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-black text-amber-500 font-mono">{expenses.filter(e => e.status === 'Pending').length}</span>
                <ClipboardCheck className="w-5 h-5 text-amber-500" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Quick action controls & active trips */}
            <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-xs font-black text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span>Live Vehicle Control Room</span>
                </h3>
                <div className="flex gap-1.5">
                  <button onClick={() => setShowAddVehicleModal(true)} className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-[10px] font-bold rounded-xl transition flex items-center gap-1 cursor-pointer">
                    <Plus className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{activeTranslation.addVehicle}</span>
                  </button>
                  <button onClick={() => setShowAddDriverModal(true)} className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-[10px] font-bold rounded-xl transition flex items-center gap-1 cursor-pointer">
                    <Plus className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{activeTranslation.addDriver}</span>
                  </button>
                </div>
              </div>

              {/* Live Tracking Table of vehicles */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-850 text-slate-500 uppercase text-[10px] font-bold">
                      <th className="py-2">Vehicle</th>
                      <th className="py-2">Plate</th>
                      <th className="py-2">Engine</th>
                      <th className="py-2">Odo</th>
                      <th className="py-2">Status</th>
                      <th className="py-2 text-right">Active Driver</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850/50">
                    {vehicles.map(v => (
                      <tr key={v.id} className="hover:bg-slate-950/20">
                        <td className="py-2.5 font-bold text-slate-300">{v.name}</td>
                        <td className="py-2.5 font-mono text-amber-500">{v.plateNumber}</td>
                        <td className="py-2.5 text-slate-400 text-[10px]">{v.engineType}</td>
                        <td className="py-2.5 font-mono text-slate-300">{v.odometer.toLocaleString()} km</td>
                        <td className="py-2.5">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            v.status === 'Available' ? 'bg-emerald-500/10 text-emerald-400' :
                            v.status === 'In Use' ? 'bg-indigo-500/10 text-indigo-400' :
                            'bg-amber-500/10 text-amber-500'
                          }`}>
                            {v.status}
                          </span>
                        </td>
                        <td className="py-2.5 text-right font-semibold text-slate-400">{v.currentDriver}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* RECEIPTS & CLAIMS APPROVAL DESK */}
              <div id="receipt-approval-desk" className="border-t border-slate-800 pt-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <ClipboardCheck className="w-4 h-4 text-amber-500" />
                    <h3 className="text-xs font-black text-slate-200 uppercase tracking-wider">
                      Receipts & Claims Approval Desk
                    </h3>
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 bg-slate-950 border border-slate-800 px-2 py-0.5 rounded-lg">
                    {expenses.filter(e => e.status === 'Pending').length} Pending Requests
                  </span>
                </div>

                {expenses.filter(e => e.status === 'Pending').length === 0 ? (
                  <div className="p-6 bg-slate-950/40 border border-slate-850 rounded-2xl text-center space-y-2">
                    <div className="w-9 h-9 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center mx-auto">
                      <Check className="w-5 h-5" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-300">All Driver Receipts Settled</h4>
                    <p className="text-[10px] text-slate-500">There are no outstanding driver-submitted fuel or service claims pending your authorization.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {expenses.filter(e => e.status === 'Pending').map((exp) => {
                      const veh = vehicles.find(v => v.id === exp.vehicleId);
                      const drv = drivers.find(d => d.id === exp.driverId);
                      return (
                        <div key={exp.id} className="bg-slate-950 border border-slate-850 rounded-2xl p-4 space-y-3.5 hover:border-slate-800 transition">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className={`px-2 py-0.5 text-[8px] font-black uppercase rounded ${
                                exp.category === 'Fuel' || exp.category === 'EV Charging' ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'
                              }`}>
                                {exp.category}
                              </span>
                              <h4 className="text-xs font-bold text-slate-200 mt-1.5">
                                {veh ? veh.name : 'Unknown Vehicle'}
                              </h4>
                              <p className="text-[10px] text-slate-400">Submitted by {drv ? drv.name : 'Driver'}</p>
                            </div>
                            <span className="text-sm font-mono font-black text-slate-100">
                              ${exp.amount.toLocaleString()}.00
                            </span>
                          </div>

                          <div className="space-y-1 bg-slate-900/60 p-2.5 rounded-xl border border-slate-850/60 text-[10px] text-slate-400">
                            {exp.stationName && (
                              <div><strong>Vendor:</strong> {exp.stationName}</div>
                            )}
                            {exp.notes && (
                              <div><strong>Notes:</strong> {exp.notes}</div>
                            )}
                            <div><strong>Date:</strong> {exp.date}</div>
                          </div>

                          <div className="flex gap-2.5 pt-1">
                            <button
                              onClick={() => {
                                setExpenses(expenses.map(e => e.id === exp.id ? { ...e, status: 'Approved' } : e));
                                triggerNotification("Expense Approved", `Authorized $${exp.amount} ${exp.category} reimbursement request for ${veh?.name}.`);
                                alert("Receipt and claim successfully approved!");
                              }}
                              className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-[10px] font-bold rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => {
                                setExpenses(expenses.map(e => e.id === exp.id ? { ...e, status: 'Rejected' } : e));
                                triggerNotification("Expense Rejected", `Declined $${exp.amount} ${exp.category} reimbursement request for ${veh?.name}.`);
                                alert("Expense request declined.");
                              }}
                              className="flex-1 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-[10px] font-bold rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Boss / Owner View panel */}
            <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 text-left">
              <h3 className="text-xs font-black text-slate-200 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-3">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Owner's Cost Summary</span>
              </h3>
              
              <div className="space-y-4 font-sans">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Total Expense This Month</span>
                    <span className="text-base font-black text-slate-100 font-mono">
                      ${expenses.reduce((acc, e) => acc + (e.status === 'Approved' || e.status === 'Pending' ? e.amount : 0), 0).toLocaleString()}.00 USD
                    </span>
                  </div>
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                </div>

                {/* Dynamic High-Cost Vehicle Analytics Card */}
                {(() => {
                  const { vehicle, stats } = getHighCostVehicleAnalytics();
                  if (!vehicle) return null;
                  const total = stats.total;
                  const fuelPercent = total > 0 ? Math.round((stats.fuel / total) * 100) : 0;
                  const repairPercent = total > 0 ? Math.round((stats.repair / total) * 100) : 0;
                  return (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-extrabold uppercase text-amber-500 tracking-wider">⚠️ High-Cost Vehicle Analytics</span>
                        <span className="text-[9px] font-bold text-slate-500 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">Dynamic</span>
                      </div>
                      <div className="p-4 bg-slate-950 rounded-2xl border border-slate-850 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-xs font-bold text-slate-100">{vehicle.name}</h4>
                            <span className="text-[9px] font-mono text-slate-500">{vehicle.plateNumber}</span>
                          </div>
                          <span className="text-sm font-mono font-black text-amber-400">${total.toLocaleString()}.00</span>
                        </div>
                        
                        {/* Cost Breakdown progress bars */}
                        <div className="space-y-1.5 text-[10px]">
                          <div className="flex justify-between text-slate-400">
                            <span>Fuel & Energy</span>
                            <span>${stats.fuel} ({fuelPercent}%)</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${fuelPercent}%` }}></div>
                          </div>

                          <div className="flex justify-between text-slate-400 pt-1">
                            <span>Repairs & Parts</span>
                            <span>${stats.repair} ({repairPercent}%)</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                            <div className="h-full bg-rose-500 rounded-full" style={{ width: `${repairPercent}%` }}></div>
                          </div>
                        </div>

                        <p className="text-[10px] text-slate-500 italic pt-1 border-t border-slate-900 leading-snug">
                          {total > 100 
                            ? "This asset currently exceeds standard Cambodian fleet baseline. Suggest audit of logs with AI Advisor." 
                            : "Asset operating within reasonable Cambodian standard operating margins."}
                        </p>
                      </div>
                    </div>
                  );
                })()}

                {/* Road Tax & Insurance critical alerts list */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">Immediate Compliance Actions</span>
                  <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl space-y-2 text-[11px] text-slate-400">
                    <div className="flex items-start gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                      <span><strong>Eco Delivery Prius</strong> road tax expires on Oct 01, 2026.</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                      <span><strong>Hyundai Van A</strong> insurance expires on Jul 22, 2026.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- 2. MY FLEETS & VEHICLES TAB -------------------- */}
      {activeSubTab === 'vehicles' && activeRole === 'Manager' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-black text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Car className="w-5 h-5 text-emerald-400" />
              <span>Fleet Vehicle Catalog</span>
            </h3>
            <button
              onClick={() => setShowAddVehicleModal(true)}
              className="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-black rounded-xl transition flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{activeTranslation.addVehicle}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((v) => (
              <div key={v.id} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex flex-col justify-between">
                {v.photoUrl ? (
                  <div className="h-40 w-full relative">
                    <img src={v.photoUrl} alt={v.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <span className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                      v.status === 'Available' ? 'bg-emerald-500 text-slate-950' :
                      v.status === 'In Use' ? 'bg-indigo-500 text-white' : 'bg-amber-500 text-slate-950'
                    }`}>
                      {v.status}
                    </span>
                  </div>
                ) : (
                  <div className="h-40 bg-slate-950 flex items-center justify-center text-slate-600">
                    <Car className="w-12 h-12" />
                  </div>
                )}

                <div className="p-5 space-y-4">
                  <div>
                    <h4 className="text-sm font-black text-slate-200">{v.name}</h4>
                    <p className="text-xs text-slate-500">{v.brand} {v.model} ({v.year})</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-[11px] font-mono border-t border-b border-slate-800 py-3">
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase block">Plate No</span>
                      <span className="font-bold text-amber-500">{v.plateNumber}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase block">Engine Type</span>
                      <span className="font-bold text-slate-300">{v.engineType}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase block">Odometer</span>
                      <span className="font-bold text-slate-300">{v.odometer.toLocaleString()} km</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase block">Next Svc</span>
                      <span className="font-bold text-indigo-400">{v.nextService.toLocaleString()} km</span>
                    </div>
                  </div>

                  <div className="space-y-1 text-[10px] text-slate-400">
                    <div className="flex justify-between">
                      <span>Insurance Exp:</span>
                      <span className="font-mono text-slate-300">{v.insuranceExpiry}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Road Tax Exp:</span>
                      <span className="font-mono text-slate-300">{v.roadTaxExpiry}</span>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-between items-center">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
                      <QrCode className="w-3.5 h-3.5 text-pink-500" />
                      <span>Token: #{v.qrToken?.substring(0, 6)}</span>
                    </div>
                    <button
                      onClick={() => alert(`Simulating Print Vehicle QR Code Tag for ${v.name}. Store tags inside the vehicle glovebox for express scanning.`)}
                      className="px-2.5 py-1 text-[10px] font-bold bg-slate-950 border border-slate-800 text-slate-400 hover:text-white rounded-lg transition"
                    >
                      Print Tag
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* -------------------- 3. DRIVERS TAB -------------------- */}
      {activeSubTab === 'drivers' && activeRole === 'Manager' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-black text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-5 h-5 text-emerald-400" />
              <span>Assigned Fleet Drivers & Staff</span>
            </h3>
            <button
              onClick={() => setShowAddDriverModal(true)}
              className="px-3 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-black rounded-xl transition flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{activeTranslation.addDriver}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {drivers.map((d) => {
              const assignedVeh = vehicles.find(v => v.id === d.assignedVehicleId);
              return (
                <div key={d.id} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-black text-slate-100">{d.name}</h4>
                        <p className="text-[10px] text-slate-500 font-mono">{d.telegramHandle} • {d.phone}</p>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        d.status === 'On Trip' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-emerald-500/10 text-emerald-400'
                      }`}>
                        {d.status}
                      </span>
                    </div>

                    <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-850 flex items-center justify-between text-[11px]">
                      <div>
                        <span className="text-[9px] text-slate-500 block uppercase">Assigned Car</span>
                        <span className="font-bold text-slate-300">{assignedVeh ? assignedVeh.name : "None / Standby"}</span>
                      </div>
                      <span className="text-[9px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">{d.assignmentType}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-2.5 border-t border-slate-800/80 flex justify-end gap-1.5">
                    <button
                      onClick={() => alert(`Simulating alert ping to driver ${d.name} via Telegram.`)}
                      className="px-2.5 py-1 text-[10px] font-bold bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-400 hover:text-white rounded-lg transition flex items-center gap-1"
                    >
                      <Send className="w-3 h-3 text-sky-400" />
                      <span>Ping TG</span>
                    </button>
                    <button
                      onClick={() => {
                        const newCarId = prompt(`Enter vehicle ID to assign to ${d.name}: \nAvailable: fv-1, fv-2, fv-3`);
                        if (newCarId) {
                          setDrivers(drivers.map(drv => drv.id === d.id ? { ...drv, assignedVehicleId: newCarId } : drv));
                        }
                      }}
                      className="px-2.5 py-1 text-[10px] font-bold bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-300 rounded-lg transition"
                    >
                      Re-Assign
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* DRIVER ASSIGNMENT & ACCOUNT SYNC */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 text-left">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-2xl">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-200 uppercase tracking-wider">Driver Assignment & Account Association</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Link registered Cambodia staff accounts to vehicles, with real-time toggle controls to restrict their device role access strictly to Driver Console views.</p>
                </div>
              </div>
              <span className="bg-slate-950 border border-slate-800 px-3 py-1 text-[10px] font-bold font-mono rounded-full text-indigo-400 flex items-center gap-1.5 self-start md:self-auto">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping"></span>
                Active Synchronizer Online
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Assignment Form */}
              <div className="lg:col-span-5 space-y-4 bg-slate-950 p-5 rounded-2xl border border-slate-850/80">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Create Driver-to-Vehicle Link</span>
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[9px] font-mono rounded border border-emerald-500/20">Step 1 of 2</span>
                </div>
                
                <div className="space-y-4 text-xs">
                  {/* Dropdown 1: Accounts */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Select Registered User Account</label>
                    <div className="relative">
                      <select
                        value={assignmentUserEmail}
                        onChange={(e) => setAssignmentUserEmail(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl pl-3 pr-10 py-2.5 text-slate-200 outline-none transition appearance-none cursor-pointer"
                      >
                        <option value="">-- Choose User Profile --</option>
                        {registeredUsers.map(ru => (
                          <option key={ru.uid} value={ru.email}>
                            {ru.name} ({ru.email}) — Role: {ru.role === 'Driver / Staff' ? 'Driver' : ru.role}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <Users className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* Dropdown 2: Vehicles */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Assign Fleet Vehicle</label>
                    <div className="relative">
                      <select
                        value={assignmentVehicleId}
                        onChange={(e) => setAssignmentVehicleId(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl pl-3 pr-10 py-2.5 text-slate-200 outline-none transition appearance-none cursor-pointer"
                      >
                        <option value="">-- Choose Fleet Vehicle --</option>
                        {vehicles.map(v => (
                          <option key={v.id} value={v.id}>
                            {v.name} ({v.plateNumber}) • {v.brand}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <Car className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* Interactive Toggle for Driver Lock */}
                  <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-850 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5 text-left">
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-wider block">Role Access to 'Driver'</span>
                        <p className="text-[9px] text-slate-500">Toggle whether this user profile's access is restricted to Driver Console only.</p>
                      </div>
                      <button
                        onClick={() => setAssignmentForceDriver(!assignmentForceDriver)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                          assignmentForceDriver ? 'bg-indigo-500' : 'bg-slate-750'
                        }`}
                        type="button"
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            assignmentForceDriver ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-[10px] text-slate-400 flex items-start gap-1.5 leading-normal">
                      <Shield className={`w-4 h-4 shrink-0 mt-0.5 ${assignmentForceDriver ? 'text-indigo-400' : 'text-slate-500'}`} />
                      <span>
                        {assignmentForceDriver ? (
                          <><strong>Forced Driver Lock:</strong> Once assigned, this email account will lose manager privileges and be restricted to Driver Console dashboards.</>
                        ) : (
                          <><strong>No Role Restrictions:</strong> User will be linked to this unit but retains default permissions to access other manager dashboards.</>
                        )}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (!assignmentUserEmail || !assignmentVehicleId) {
                        alert("Please select both a registered user account and a fleet vehicle.");
                        return;
                      }
                      const matchUser = registeredUsers.find(ru => ru.email === assignmentUserEmail);
                      const matchVeh = vehicles.find(v => v.id === assignmentVehicleId);
                      if (!matchUser || !matchVeh) return;

                      if (userVehicleAssignments.some(a => a.userEmail.toLowerCase() === assignmentUserEmail.toLowerCase())) {
                        alert("This user account is already assigned to a fleet vehicle. Please unassign first.");
                        return;
                      }

                      const newAssignment = {
                        userEmail: assignmentUserEmail,
                        vehicleId: assignmentVehicleId,
                        assignedAt: new Date().toISOString().split('T')[0]
                      };

                      setUserVehicleAssignments([...userVehicleAssignments, newAssignment]);
                      
                      // Toggle user's role access to 'Driver' for that unit
                      const finalRole = assignmentForceDriver ? 'Driver / Staff' : 'Manager';
                      setRegisteredUsers(prev => prev.map(ru => 
                        ru.email.toLowerCase() === assignmentUserEmail.toLowerCase() ? { ...ru, role: finalRole } : ru
                      ));
                      
                      const driverMatch = drivers.find(d => d.name.toLowerCase() === matchUser.name.toLowerCase());
                      if (driverMatch) {
                        setDrivers(drivers.map(d => d.id === driverMatch.id ? { ...d, assignedVehicleId: assignmentVehicleId, status: 'Active' } : d));
                      }

                      triggerNotification("Staff Linkage Lock", `Account ${matchUser.name} linked to vehicle ${matchVeh.name}. Access set to ${assignmentForceDriver ? 'Driver-Only' : 'Manager'}.`);
                      alert(`Successfully linked ${matchUser.name} to ${matchVeh.name}. Access configured to ${assignmentForceDriver ? 'Driver-Only' : 'Manager'}.`);
                      
                      setAssignmentUserEmail("");
                      setAssignmentVehicleId("");
                    }}
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 font-black text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/10"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Assign & Update Role Access</span>
                  </button>
                </div>
              </div>

              {/* Active Linked Accounts */}
              <div className="lg:col-span-7 space-y-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Unit Assignments & Role Toggles</span>
                
                {userVehicleAssignments.length === 0 ? (
                  <div className="p-12 bg-slate-950/40 border border-slate-850 rounded-2xl text-center space-y-2 flex flex-col items-center justify-center min-h-[300px]">
                    <Lock className="w-8 h-8 text-slate-700" />
                    <p className="text-xs font-black text-slate-300 uppercase tracking-widest">No Active Assignments</p>
                    <p className="text-[10px] text-slate-500 max-w-xs leading-relaxed">All registered staff members can switch roles freely. Create a linkage to assign users to specific vehicle units and toggle role permissions.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {userVehicleAssignments.map((a) => {
                      const veh = vehicles.find(v => v.id === a.vehicleId);
                      const user = registeredUsers.find(ru => ru.email.toLowerCase() === a.userEmail.toLowerCase());
                      const isDriver = user ? (user.role === 'Driver / Staff' || user.role === 'Driver') : true;

                      return (
                        <div key={a.userEmail} className="bg-slate-950 border border-slate-850 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-800 transition text-left">
                          <div className="space-y-1.5">
                            <div className="flex items-center flex-wrap gap-2">
                              <span className="text-xs font-black text-slate-200">{user ? user.name : a.userEmail}</span>
                              <span className={`px-2 py-0.5 text-[8px] font-black uppercase rounded border transition ${
                                isDriver 
                                  ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" 
                                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              }`}>
                                {isDriver ? "Driver Access Locked" : "Manager Privileges"}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500">Account: <span className="font-mono text-slate-400">{a.userEmail}</span> • Assigned {a.assignedAt}</p>
                            
                            <div className="pt-1.5 flex items-center gap-1.5 text-xs text-slate-300">
                              <Car className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                              <span>Assigned Unit: <strong>{veh ? veh.name : "Vehicle Profile"}</strong> ({veh ? veh.plateNumber : "N/A"})</span>
                            </div>
                          </div>

                          {/* Interactive list-based toggle switcher & trash button */}
                          <div className="flex items-center justify-between sm:justify-end gap-4 border-t border-slate-850 sm:border-0 pt-3 sm:pt-0">
                            {/* Toggle switch inside row */}
                            <div className="flex items-center gap-2">
                              <div className="text-right">
                                <span className="text-[9px] text-slate-500 block">Driver Access</span>
                                <span className={`text-[9px] font-black uppercase ${isDriver ? 'text-indigo-400' : 'text-slate-400'}`}>
                                  {isDriver ? 'Enabled' : 'Disabled'}
                                </span>
                              </div>
                              <button
                                onClick={() => {
                                  const newRole = isDriver ? 'Manager' : 'Driver / Staff';
                                  setRegisteredUsers(prev => prev.map(ru => 
                                    ru.email.toLowerCase() === a.userEmail.toLowerCase() ? { ...ru, role: newRole } : ru
                                  ));
                                  triggerNotification("Role Access Change", `Toggled access permissions for ${user?.name || a.userEmail} to ${newRole === 'Driver / Staff' ? 'Driver-Only' : 'Manager'}.`);
                                  alert(`Successfully toggled ${user?.name || a.userEmail}'s role access to ${newRole === 'Driver / Staff' ? 'Driver' : 'Manager'}.`);
                                }}
                                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                                  isDriver ? 'bg-indigo-500' : 'bg-slate-800'
                                }`}
                                type="button"
                                title="Toggle Role Restriction"
                              >
                                <span
                                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                    isDriver ? 'translate-x-4' : 'translate-x-0'
                                  }`}
                                />
                              </button>
                            </div>

                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to break the linkage for ${user ? user.name : a.userEmail}? This will restore their system permissions.`)) {
                                  setUserVehicleAssignments(userVehicleAssignments.filter(as => as.userEmail.toLowerCase() !== a.userEmail.toLowerCase()));
                                  triggerNotification("Staff Linkage Released", `Unlocked account permissions for ${user?.name || a.userEmail}.`);
                                  alert("Linkage successfully removed. Account permissions restored.");
                                }
                              }}
                              className="p-2 bg-slate-900 border border-slate-800 hover:border-rose-900/30 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 rounded-xl transition cursor-pointer"
                              title="Unassign & Unlink"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- 4. TRIP LOGS TAB (Both roles can view/add) -------------------- */}
      {activeSubTab === 'trips' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-black text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-5 h-5 text-emerald-400" />
              <span>Fleet Trip Logs</span>
            </h3>
            {activeRole === 'Manager' && (
              <button
                onClick={() => setShowAddTripModal(true)}
                className="px-3 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-black rounded-xl transition flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{activeTranslation.addTrip}</span>
              </button>
            )}
          </div>

          {/* DRIVER EXPRESS TRIP LOG FORM */}
          {activeRole === 'Driver' && (
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/30 border border-indigo-500/15 rounded-3xl p-5 md:p-6 text-left space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <div className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg">
                  <Zap className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-100 uppercase tracking-wider">Driver Trip Odometer Sync</h4>
                  <p className="text-[10px] text-slate-400">Complete a route, submit starting and ending odometer values, and instantly register them in the vehicle's service history ledger.</p>
                </div>
              </div>

              <form onSubmit={handleDriverTripSubmission} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 block">Assigned Fleet Vehicle</label>
                  <select
                    value={driverVehId}
                    onChange={(e) => setDriverVehId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-slate-200 outline-none transition"
                    required
                  >
                    <option value="">-- Choose Car --</option>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>{v.name} ({v.plateNumber})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 block">Starting Odometer (km)</label>
                  <input
                    type="number"
                    value={driverStartOdo || ""}
                    disabled
                    className="w-full bg-slate-950/40 border border-slate-850 rounded-xl px-3 py-2 text-slate-500 font-mono font-bold outline-none cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 block">Ending Odometer (km)</label>
                  <input
                    type="number"
                    value={driverEndOdo}
                    onChange={(e) => setDriverEndOdo(e.target.value)}
                    placeholder="Enter ending km value"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-slate-200 font-mono font-bold outline-none transition"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 block">Trip Purpose</label>
                  <select
                    value={driverPurpose}
                    onChange={(e) => setDriverPurpose(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-slate-200 outline-none transition"
                    required
                  >
                    <option value="Delivery">Courier Delivery</option>
                    <option value="Boss transport">Boss Transport</option>
                    <option value="Family trip">Family Escort</option>
                    <option value="Maintenance run">Garage Maintenance Run</option>
                    <option value="Refuel drive">PTT Refuel Drive</option>
                  </select>
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 block">Trip Route Details & Notes</label>
                  <input
                    type="text"
                    value={driverNotes}
                    onChange={(e) => setDriverNotes(e.target.value)}
                    placeholder="e.g. Phnom Penh Central Market dropoff to Koh Pich meeting"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-slate-200 outline-none transition"
                  />
                </div>

                <div className="md:col-span-3 pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-black text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-500/10"
                  >
                    <ClipboardCheck className="w-4 h-4" />
                    <span>Submit Express Log & Sync Vehicle Ledger</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left side: Trips list */}
            <div className="lg:col-span-7 space-y-4">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block text-left">Active & Completed Trips</span>
              <div className="space-y-4">
                {trips.map((tr) => {
                  const matchedVeh = vehicles.find(v => v.id === tr.vehicleId);
                  const matchedDrv = drivers.find(d => d.id === tr.driverId);
                  return (
                    <div key={tr.id} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row justify-between gap-4">
                      <div className="space-y-2 text-left">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                            tr.status === 'Active' ? 'bg-indigo-500/15 text-indigo-400 animate-pulse border border-indigo-500/20' : 'bg-slate-950 text-slate-500'
                          }`}>
                            {tr.status}
                          </span>
                          <span className="text-xs font-bold text-slate-200">{matchedVeh ? matchedVeh.name : "Car"} ({tr.purpose})</span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[11px] text-slate-400 font-sans">
                          <div>
                            <span className="text-[9px] text-slate-500 uppercase block">Driver</span>
                            <strong className="text-slate-300">{matchedDrv ? matchedDrv.name : "Unassigned"}</strong>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 uppercase block">Start Location</span>
                            <strong className="text-slate-300">{tr.startLoc}</strong>
                          </div>
                          {tr.endLoc && (
                            <div>
                              <span className="text-[9px] text-slate-500 uppercase block">End Location</span>
                              <strong className="text-slate-300">{tr.endLoc}</strong>
                            </div>
                          )}
                          <div>
                            <span className="text-[9px] text-slate-500 uppercase block">Odometer</span>
                            <strong className="text-slate-300 font-mono">
                              {tr.startOdo.toLocaleString()} {tr.endOdo ? `→ ${tr.endOdo.toLocaleString()}` : ""} km
                            </strong>
                          </div>
                        </div>

                        {tr.notes && (
                          <p className="text-[10px] text-slate-500 bg-slate-950 p-2 rounded-lg border border-slate-850/80 mt-1 max-w-xl">
                            Note: {tr.notes}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col justify-between items-end gap-2 text-right shrink-0">
                        <span className="text-[10px] text-slate-500 font-mono">Started: {tr.startTime}</span>
                        {tr.status === 'Active' && activeRole === 'Manager' && (
                          <button
                            onClick={() => {
                              const endOdoVal = prompt(`Enter ending odometer (must be > ${tr.startOdo}):`);
                              if (endOdoVal) {
                                setTrips(trips.map(t => t.id === tr.id ? { ...t, status: 'Completed', endOdo: Number(endOdoVal), endLoc: "HQ Terminal" } : t));
                                alert("Trip finalized! Vehicle returned to available pool.");
                              }
                            }}
                            className="px-2.5 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-[10px] font-black rounded-lg transition cursor-pointer"
                          >
                            {activeTranslation.endTrip}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right side: Unified Vehicle Service History Timeline */}
            <div className="lg:col-span-5 space-y-4 text-left">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">🛠️ Integrated Vehicle Service History</span>
              
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <span className="text-xs font-bold text-slate-200">Ledger Audit Timeline</span>
                  <span className="text-[9px] text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-850 font-mono font-bold">Verifiable</span>
                </div>

                <div className="relative border-l-2 border-slate-800 pl-4 space-y-5 py-1.5 ml-2">
                  {serviceHistory.map((rec) => {
                    const matchedVeh = vehicles.find(v => v.id === rec.vehicleId);
                    return (
                      <div key={rec.id} className="relative space-y-1">
                        {/* Bullet point circle */}
                        <div className="absolute -left-[23px] top-1.5 w-2.5 h-2.5 rounded-full bg-indigo-500 border-2 border-slate-900 shadow-sm shadow-indigo-500/20"></div>
                        
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[9px] text-slate-500 block">{rec.date}</span>
                            <h5 className="text-[11px] font-black text-slate-200 leading-tight">{matchedVeh ? matchedVeh.name : "Fleet Vehicle"}</h5>
                          </div>
                          {rec.cost && (
                            <span className="text-[11px] font-mono font-bold text-emerald-400">${rec.cost}</span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 leading-normal">{rec.description}</p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                          <span>Odo: {rec.odometer.toLocaleString()} km</span>
                          {rec.provider && (
                            <>
                              <span>•</span>
                              <span className="text-slate-500">{rec.provider}</span>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- 5. EXPENSES & FUEL TAB -------------------- */}
      {activeSubTab === 'expenses' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-black text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Fuel className="w-5 h-5 text-emerald-400" />
              <span>Fueling, Charging & Expenses Logs</span>
            </h3>
            <div className="flex gap-1.5">
              <button
                onClick={() => setShowLogFuelModal(true)}
                className="px-3 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-black rounded-xl transition flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Log Fuel / EV DC</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Expense logs list */}
            <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 text-left">
              <h4 className="text-xs font-black text-slate-200 uppercase tracking-wider pb-2 border-b border-slate-800">
                Log History
              </h4>

              <div className="space-y-3">
                {expenses.map((exp) => {
                  const matchedVeh = vehicles.find(v => v.id === exp.vehicleId);
                  const matchedDrv = drivers.find(d => d.id === exp.driverId);
                  return (
                    <div key={exp.id} className="p-3 bg-slate-950 border border-slate-850 rounded-2xl flex justify-between items-center gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            exp.category === 'Fuel' ? 'bg-amber-500/10 text-amber-500' :
                            exp.category === 'EV Charging' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-sky-500/10 text-sky-400'
                          }`}>
                            {exp.category}
                          </span>
                          <span className="text-xs font-bold text-slate-200">{matchedVeh ? matchedVeh.name : "Car"}</span>
                        </div>
                        <p className="text-[10px] text-slate-500">
                          {exp.date} • {exp.stationName || "No Station Details"} • By: {matchedDrv?.name || "Driver"}
                        </p>
                        {exp.notes && <p className="text-[10px] text-slate-400 italic">"{exp.notes}"</p>}
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-mono font-bold text-slate-100">${exp.amount} USD</span>
                        <div className="flex flex-col items-end gap-1">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            exp.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            exp.status === 'Pending' ? 'bg-amber-500/10 text-amber-500 animate-pulse' : 'bg-red-500/10 text-red-500'
                          }`}>
                            {exp.status}
                          </span>

                          {activeRole === 'Manager' && exp.status === 'Pending' && (
                            <div className="flex gap-1 mt-1">
                              <button onClick={() => handleApproveExpense(exp.id)} className="p-1 bg-emerald-500 text-slate-950 rounded hover:bg-emerald-600 transition">
                                <Check className="w-3 h-3" />
                              </button>
                              <button onClick={() => handleRejectExpense(exp.id)} className="p-1 bg-rose-500 text-white rounded hover:bg-rose-600 transition">
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Receipt scanner simulation */}
            <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 text-left">
              <h4 className="text-xs font-black text-slate-200 uppercase tracking-wider pb-2 border-b border-slate-800">
                Receipt Verification Bureau
              </h4>
              <p className="text-[11px] text-slate-400 leading-normal">
                Drivers in Cambodia can upload quick fuel receipts. Our AI parses TotalEnergies, Caltex, and PTT merchant tickets instantly.
              </p>

              <div className="border border-dashed border-slate-800 bg-slate-950/40 p-6 rounded-2xl flex flex-col items-center justify-center text-center space-y-2 cursor-pointer hover:border-slate-700 transition">
                <Download className="w-8 h-8 text-slate-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-300">Upload Ticket Photo</span>
                <span className="text-[9px] text-slate-500 font-mono">PNG, JPG up to 10MB</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- 6. AI FLEET ADVISOR TAB -------------------- */}
      {activeSubTab === 'ai' && activeRole === 'Manager' && (
        <div className="space-y-6 animate-fadeIn text-left">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-pink-500/5 rounded-full blur-2xl"></div>

            <div className="space-y-2 max-w-2xl border-b border-slate-850 pb-4 mb-4">
              <span className="inline-flex items-center gap-1 bg-pink-500/10 text-pink-400 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-pink-500/25">
                <Sparkles className="w-3 h-3 text-pink-400 animate-pulse" />
                <span>Powered by Gemini 3.5 Flash</span>
              </span>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                AI Fleet Assistant & Auditor
              </h3>
              <p className="text-xs text-slate-400">
                Let Gemini audit logs for abnormal refueling values, suggest optimal preventive service schedules, and highlight underperforming assets.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Query Assistant</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder={activeTranslation.aiPromptPlaceholder}
                    className="flex-1 bg-slate-950 border border-slate-800 p-3 text-xs text-slate-200 rounded-xl focus:border-indigo-500 outline-none"
                  />
                  <button
                    onClick={runAiAdvisor}
                    disabled={aiLoading}
                    className="px-4 py-3 bg-pink-500 hover:bg-pink-600 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-black text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    {aiLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    <span>Audit Fleet</span>
                  </button>
                </div>
              </div>

              {/* Suggestions shortcuts */}
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  onClick={() => setAiPrompt("Which vehicle is costing the company the most in maintenance?")}
                  className="px-2.5 py-1 bg-slate-950 border border-slate-850 hover:border-slate-800 text-slate-400 hover:text-slate-200 text-[10px] font-bold rounded-lg transition"
                >
                  "Highest maintenance cost outlier?"
                </button>
                <button
                  onClick={() => setAiPrompt("Are there any abnormal fuel log entries in the recent history?")}
                  className="px-2.5 py-1 bg-slate-950 border border-slate-850 hover:border-slate-800 text-slate-400 hover:text-slate-200 text-[10px] font-bold rounded-lg transition"
                >
                  "Detect abnormal fuel logs"
                </button>
                <button
                  onClick={() => setAiPrompt("Which vehicle is underused?")}
                  className="px-2.5 py-1 bg-slate-950 border border-slate-850 hover:border-slate-800 text-slate-400 hover:text-slate-200 text-[10px] font-bold rounded-lg transition"
                >
                  "Analyze idle fleet vehicles"
                </button>
              </div>

              {/* Response Card */}
              {aiResponse && (
                <div className="mt-4 p-4 bg-slate-950 border border-slate-850 rounded-2xl relative">
                  <div className="absolute top-3 right-3 text-[9px] uppercase tracking-widest font-bold text-slate-600">Response</div>
                  <div className="text-xs text-slate-300 leading-relaxed font-sans space-y-2 whitespace-pre-wrap">
                    {aiResponse}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* -------------------- 7. NOTIFICATIONS TAB -------------------- */}
      {activeSubTab === 'notifications' && activeRole === 'Manager' && (
        <div className="space-y-6 animate-fadeIn text-left">
          <div className="flex justify-between items-center border-b border-slate-850 pb-3">
            <h3 className="text-sm font-black text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Bell className="w-5 h-5 text-emerald-400" />
              <span>Real-Time Notifications & Telegram Channel Logs</span>
            </h3>
            <button
              onClick={() => {
                setNotifications(notifications.map(n => ({ ...n, read: true })));
                alert("All alerts marked as read.");
              }}
              className="px-2.5 py-1 text-[10px] font-bold bg-slate-900 border border-slate-800 text-slate-400 rounded-lg"
            >
              Mark all read
            </button>
          </div>

          {/* Interactive Maintenance Alert Simulator Panel */}
          {(() => {
            const simVehicle = vehicles.find(v => v.id === simSelectedVehicleId) || vehicles[0];
            return (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
                  <Car className="w-5 h-5 text-indigo-400" />
                  <div>
                    <h4 className="text-xs font-black text-slate-100 uppercase tracking-wider">Interactive Maintenance Alert Simulator</h4>
                    <p className="text-[10px] text-slate-400">Test the local storage based notification trigger by artificially increasing mileage</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Select Fleet Vehicle</label>
                    <select
                      id="sim-vehicle-select"
                      className="w-full bg-slate-950 border border-slate-800 p-2 text-xs text-slate-200 rounded-xl"
                      value={simSelectedVehicleId || (vehicles[0]?.id || "")}
                      onChange={(e) => setSimSelectedVehicleId(e.target.value)}
                    >
                      {vehicles.map(v => (
                        <option key={v.id} value={v.id}>
                          {v.name} ({v.plateNumber})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="p-3 bg-slate-950/60 border border-slate-850 rounded-xl flex justify-between items-center text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Odometer / Next Service</span>
                      <span className="font-mono text-slate-200 font-bold">
                        {simVehicle ? simVehicle.odometer.toLocaleString() : 0} km / {simVehicle ? simVehicle.nextService.toLocaleString() : 0} km
                      </span>
                    </div>
                    <div>
                      {simVehicle && simVehicle.odometer >= simVehicle.nextService ? (
                        <span className="px-2 py-0.5 bg-rose-500/15 text-rose-400 text-[10px] font-bold uppercase rounded-md border border-rose-500/20">
                          ⚠️ OVERDUE
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-emerald-500/15 text-emerald-400 text-[10px] font-bold uppercase rounded-md border border-emerald-500/20">
                          ✅ GOOD STATUS
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      id="btn-sim-add-mileage"
                      onClick={() => handleSimulateMileageAdd(1500)}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-3 text-xs rounded-xl transition flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add +1,500 km</span>
                    </button>
                    <button
                      id="btn-sim-trigger"
                      onClick={() => {
                        const targetVeh = simVehicle || vehicles[0];
                        if (targetVeh) {
                          handleSimulateMileageSet(targetVeh.nextService + 250);
                        }
                      }}
                      className="bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 font-bold py-2 px-3 text-xs rounded-xl transition flex items-center justify-center gap-1"
                      title="Directly trigger service exceedance"
                    >
                      <span>Trigger Alert</span>
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-500 pt-2 border-t border-slate-850">
                  <span>Interval Limit: {simVehicle ? (simVehicle.nextService - simVehicle.odometer > 0 ? `Needs service in ${(simVehicle.nextService - simVehicle.odometer).toLocaleString()} km` : `Overdue by ${(simVehicle.odometer - simVehicle.nextService).toLocaleString()} km`) : ""}</span>
                  <button
                    id="btn-sim-reset-triggers"
                    onClick={handleResetAlertTriggers}
                    className="hover:text-indigo-400 transition underline font-bold"
                  >
                    Clear Alert Cache
                  </button>
                </div>
              </div>
            );
          })()}

          <div className="space-y-3">
            {notifications.map((notif) => (
              <div key={notif.id} className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
                notif.read ? 'bg-slate-900/60 border-slate-850/50' : 'bg-slate-900 border-indigo-500/20 shadow shadow-indigo-500/5'
              }`}>
                <div className={`p-2 rounded-xl mt-0.5 ${notif.channel === 'Telegram' ? 'bg-sky-500/10 text-sky-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                  {notif.channel === 'Telegram' ? <Send className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-black text-slate-100">{notif.title}</h4>
                    <span className="text-[9px] font-mono text-slate-500">{notif.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">{notif.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* -------------------- 8. SUBSCRIPTION TAB -------------------- */}
      {activeSubTab === 'subscription' && activeRole === 'Manager' && (
        <div className="space-y-6 animate-fadeIn text-left">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <div className="border-b border-slate-800 pb-4 mb-6">
              <h3 className="text-sm font-black text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-5 h-5 text-emerald-400" />
                <span>Premium Plan & Resource Limits</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Verify subscription plans tailored for business fleets and rich families in Cambodia.
              </p>
            </div>

            {/* active plan info */}
            <div className="bg-slate-950 border border-slate-850 p-5 rounded-2xl mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Your Active Subscription</span>
                <h4 className="text-base font-black text-emerald-400 flex items-center gap-1.5 mt-1">
                  <span>SME Fleet Pro Plan</span>
                  <span className="text-[9px] font-mono bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full uppercase">Active</span>
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xl">
                  Enables up to 15 vehicles, 10 active drivers, instant AI audit checks, and high-quality printed tag reports.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-mono border-l border-slate-800 pl-4 shrink-0">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase">Vehicles Used</span>
                  <span className="font-bold text-slate-300 block">{vehicles.length} / 15</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase">Drivers Limit</span>
                  <span className="font-bold text-slate-300 block">{drivers.length} / 10</span>
                </div>
              </div>
            </div>

            {/* comparison grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 bg-slate-950 border border-slate-850 hover:border-slate-800 rounded-2xl flex flex-col justify-between">
                <div>
                  <h5 className="text-xs font-bold text-slate-200 uppercase">Bronze Family</h5>
                  <div className="text-xl font-black text-slate-100 mt-1 font-mono">$15 <span className="text-[10px] text-slate-500 font-normal">/mo</span></div>
                  <p className="text-[11px] text-slate-400 mt-2">Perfect for family houses managing personal cars & private drivers.</p>
                  <ul className="mt-4 space-y-2 text-[10px] text-slate-400 list-disc pl-4">
                    <li>Up to 5 Vehicles</li>
                    <li>Up to 3 Active Drivers</li>
                    <li>Basic Trip & Fuel Logs</li>
                  </ul>
                </div>
                <button onClick={() => alert("Simulating downgrade logic. Action locked during demo.")} className="mt-6 w-full py-2 bg-slate-900 hover:bg-slate-850 text-slate-300 text-xs font-bold rounded-xl transition">
                  Downgrade
                </button>
              </div>

              <div className="p-5 bg-slate-950 border-2 border-emerald-500/50 rounded-2xl flex flex-col justify-between relative">
                <span className="absolute -top-3 right-4 px-2 py-0.5 bg-emerald-500 text-slate-950 text-[9px] font-black uppercase rounded">Popular</span>
                <div>
                  <h5 className="text-xs font-bold text-slate-200 uppercase">SME Fleet Pro</h5>
                  <div className="text-xl font-black text-slate-100 mt-1 font-mono">$49 <span className="text-[10px] text-slate-500 font-normal">/mo</span></div>
                  <p className="text-[11px] text-slate-400 mt-2">Best for delivery dispatchers and local Phnom Penh taxi organizations.</p>
                  <ul className="mt-4 space-y-2 text-[10px] text-slate-400 list-disc pl-4">
                    <li>Up to 15 Vehicles</li>
                    <li>Up to 10 Drivers</li>
                    <li>AI Audits & Receipt Scans</li>
                    <li>Telegram alert channel sync</li>
                  </ul>
                </div>
                <button disabled className="mt-6 w-full py-2 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-xl border border-emerald-500/20">
                  Active Now
                </button>
              </div>

              <div className="p-5 bg-slate-950 border border-slate-850 hover:border-slate-800 rounded-2xl flex flex-col justify-between">
                <div>
                  <h5 className="text-xs font-bold text-slate-200 uppercase">Enterprise Elite</h5>
                  <div className="text-xl font-black text-slate-100 mt-1 font-mono">$149 <span className="text-[10px] text-slate-500 font-normal">/mo</span></div>
                  <p className="text-[11px] text-slate-400 mt-2">Complete package for major construction, delivery, and corporate logistics.</p>
                  <ul className="mt-4 space-y-2 text-[10px] text-slate-400 list-disc pl-4">
                    <li>Up to 100 Vehicles</li>
                    <li>Up to 50 Drivers</li>
                    <li>Dedicated Account Manager</li>
                    <li>Custom Telegram Bots Integration</li>
                  </ul>
                </div>
                <button onClick={() => alert("Upgrading to Enterprise. Proceed to merchant Gateway payment.")} className="mt-6 w-full py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold rounded-xl transition">
                  Upgrade Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'wireframes' && (
        <WireframeStudio 
          vehicles={vehicles}
          setVehicles={setVehicles}
          drivers={drivers}
          setDrivers={setDrivers}
          trips={trips}
          setTrips={setTrips}
          expenses={expenses}
          setExpenses={setExpenses}
          triggerNotification={triggerNotification}
        />
      )}


      {/* Real-Time Maintenance Overdue Trigger Modal Overlay */}
      {triggeredMaintenanceAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border-2 border-rose-500 rounded-3xl p-6 max-w-md w-full text-left space-y-4 shadow-2xl shadow-rose-500/10 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-rose-500/10 rounded-full blur-xl pointer-events-none"></div>
            
            <div className="flex items-center gap-3 text-rose-500 border-b border-slate-850 pb-3">
              <div className="p-2 bg-rose-500/10 rounded-xl">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-100 uppercase tracking-wider">Manufacturer Limit Exceeded</h3>
                <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider">Active Alert Notification Triggered</span>
              </div>
            </div>

            <div className="space-y-3 py-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center font-bold text-slate-400 border border-slate-850 text-xs">
                  {triggeredMaintenanceAlert.vehicleName.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-200">{triggeredMaintenanceAlert.vehicleName}</h4>
                  <p className="text-[10px] text-slate-400 font-mono uppercase">{triggeredMaintenanceAlert.plateNumber}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-850">
                <div>
                  <span className="text-[8px] text-slate-500 uppercase font-bold block">Current Recorded</span>
                  <span className="text-xs font-black text-rose-400 font-mono">
                    {triggeredMaintenanceAlert.odometer.toLocaleString()} km
                  </span>
                </div>
                <div>
                  <span className="text-[8px] text-slate-500 uppercase font-bold block">Recommended Limit</span>
                  <span className="text-xs font-black text-slate-300 font-mono">
                    {triggeredMaintenanceAlert.nextService.toLocaleString()} km
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed bg-rose-950/20 border border-rose-500/10 p-3 rounded-xl">
                The vehicle has exceeded the manufacturer's recommended maintenance interval of <strong className="text-slate-100 font-bold">{triggeredMaintenanceAlert.nextService.toLocaleString()} km</strong> by <strong className="text-rose-400 font-bold">{triggeredMaintenanceAlert.exceededBy.toLocaleString()} km</strong>.
                Continued operations without servicing may compromise fuel economy, engine reliability, and warranty.
              </p>
            </div>

            <div className="flex gap-2 border-t border-slate-850 pt-3">
              <button
                onClick={() => setTriggeredMaintenanceAlert(null)}
                className="flex-1 py-2 px-3 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 font-bold text-xs rounded-xl transition"
              >
                Acknowledge & Close
              </button>
              <button
                onClick={() => {
                  const targetVehId = triggeredMaintenanceAlert.vehicleId;
                  const todayStr = new Date().toISOString().split('T')[0];
                  
                  // Update local state to clear overdue
                  setVehicles(vehicles.map(v => v.id === targetVehId ? { ...v, odometer: v.nextService, nextService: v.nextService + 5000, status: 'Available' } : v));

                  if (setAppVehicles && appVehicles) {
                    setAppVehicles(prev => prev.map(v => v.id === targetVehId ? {
                      ...v,
                      mileage: v.nextService,
                      lastServiceDate: todayStr
                    } : v));
                  }

                  // Add a persistent service history record
                  const newServiceRecord: ServiceHistoryRecord = {
                    id: `sh-sim-${Date.now()}`,
                    vehicleId: targetVehId,
                    date: todayStr,
                    description: "Simulated Oil & Filter change preventive maintenance completed.",
                    odometer: triggeredMaintenanceAlert.nextService,
                    status: 'Completed'
                  };
                  setServiceHistory([newServiceRecord, ...serviceHistory]);

                  triggerNotification("Maintenance Completed", `Logged preventive service for ${triggeredMaintenanceAlert.vehicleName} to clear overdue status.`);
                  setTriggeredMaintenanceAlert(null);
                }}
                className="flex-1 py-2 px-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Perform Service Now</span>
              </button>
            </div>
          </div>
        </div>
      )}


      {/* -------------------- MODAL DIALOGS -------------------- */}

      {/* Add Vehicle Modal */}
      {showAddVehicleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full text-left space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-xs font-black text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                <Car className="w-4 h-4 text-emerald-400" />
                <span>{activeTranslation.addVehicle}</span>
              </h3>
              <button onClick={() => setShowAddVehicleModal(false)} className="p-1 hover:bg-slate-800 text-slate-500 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddVehicle} className="space-y-3 font-sans text-xs">
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-slate-500 font-bold">Vehicle Custom Nickname</label>
                <input required type="text" placeholder="e.g. VIP Alphard Boss" value={newVehName} onChange={(e) => setNewVehName(e.target.value)} className="w-full bg-slate-950 border border-slate-850 p-2 text-slate-200 rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-slate-500 font-bold">Plate Number</label>
                  <input required type="text" placeholder="PP-2AA-8888" value={newVehPlate} onChange={(e) => setNewVehPlate(e.target.value)} className="w-full bg-slate-950 border border-slate-850 p-2 text-slate-200 rounded-xl font-mono uppercase" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-slate-500 font-bold">Brand</label>
                  <select value={newVehBrand} onChange={(e) => setNewVehBrand(e.target.value)} className="w-full bg-slate-950 border border-slate-850 p-2 text-slate-200 rounded-xl">
                    <option value="Toyota">Toyota</option>
                    <option value="Hyundai">Hyundai</option>
                    <option value="Lexus">Lexus</option>
                    <option value="Mazda">Mazda</option>
                    <option value="Ford">Ford</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-slate-500 font-bold">Model</label>
                  <input type="text" placeholder="Prius, Alphard, etc." value={newVehModel} onChange={(e) => setNewVehModel(e.target.value)} className="w-full bg-slate-950 border border-slate-850 p-2 text-slate-200 rounded-xl" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-slate-500 font-bold">Engine Type</label>
                  <select value={newVehEngine} onChange={(e) => setNewVehEngine(e.target.value as any)} className="w-full bg-slate-950 border border-slate-850 p-2 text-slate-200 rounded-xl">
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="EV">EV</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-slate-500 font-bold">Odometer (km)</label>
                  <input type="number" value={newVehOdo} onChange={(e) => setNewVehOdo(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-850 p-2 text-slate-200 rounded-xl font-mono" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-slate-500 font-bold">Next Service Goal</label>
                  <input type="number" value={newVehNextSvc} onChange={(e) => setNewVehNextSvc(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-850 p-2 text-slate-200 rounded-xl font-mono" />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-800/80">
                <button type="button" onClick={() => setShowAddVehicleModal(false)} className="px-3 py-2 bg-slate-950 text-slate-400 rounded-xl hover:text-white transition">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-emerald-500 text-slate-950 font-black rounded-xl hover:bg-emerald-600 transition">Save Vehicle</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Driver Modal */}
      {showAddDriverModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full text-left space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-xs font-black text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>{activeTranslation.addDriver}</span>
              </h3>
              <button onClick={() => setShowAddDriverModal(false)} className="p-1 hover:bg-slate-800 text-slate-500 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddDriver} className="space-y-3 font-sans text-xs">
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-slate-500 font-bold">Driver Full Name</label>
                <input required type="text" placeholder="e.g. Sok Cheat" value={newDrvName} onChange={(e) => setNewDrvName(e.target.value)} className="w-full bg-slate-950 border border-slate-850 p-2 text-slate-200 rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-slate-500 font-bold">Phone Number</label>
                  <input required type="text" placeholder="012 345 678" value={newDrvPhone} onChange={(e) => setNewDrvPhone(e.target.value)} className="w-full bg-slate-950 border border-slate-850 p-2 text-slate-200 rounded-xl font-mono" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-slate-500 font-bold">Telegram Handle</label>
                  <input type="text" placeholder="@username" value={newDrvTg} onChange={(e) => setNewDrvTg(e.target.value)} className="w-full bg-slate-950 border border-slate-850 p-2 text-slate-200 rounded-xl font-mono" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-slate-500 font-bold">Assignment Contract Type</label>
                <select value={newDrvAssign} onChange={(e) => setNewDrvAssign(e.target.value as any)} className="w-full bg-slate-950 border border-slate-850 p-2 text-slate-200 rounded-xl">
                  <option value="Permanent">Permanent Assigned</option>
                  <option value="Temporary">Temporary Pool</option>
                  <option value="Trip-based">Trip-based Freelance</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-800/80">
                <button type="button" onClick={() => setShowAddDriverModal(false)} className="px-3 py-2 bg-slate-950 text-slate-400 rounded-xl hover:text-white transition">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-500 text-white font-black rounded-xl hover:bg-indigo-600 transition">Invite Staff</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Trip Modal */}
      {showAddTripModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full text-left space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-xs font-black text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-indigo-400" />
                <span>{activeTranslation.addTrip}</span>
              </h3>
              <button onClick={() => setShowAddTripModal(false)} className="p-1 hover:bg-slate-800 text-slate-500 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddTrip} className="space-y-3 font-sans text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-slate-500 font-bold">Select Vehicle</label>
                  <select value={newTripVeh} onChange={(e) => setNewTripVeh(e.target.value)} className="w-full bg-slate-950 border border-slate-850 p-2 text-slate-200 rounded-xl">
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>{v.name} ({v.plateNumber})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-slate-500 font-bold">Select Driver</label>
                  <select value={newTripDrv} onChange={(e) => setNewTripDrv(e.target.value)} className="w-full bg-slate-950 border border-slate-850 p-2 text-slate-200 rounded-xl">
                    {drivers.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-slate-500 font-bold">Start Location</label>
                  <input type="text" placeholder="Phnom Penh Headquarters" value={newTripLoc} onChange={(e) => setNewTripLoc(e.target.value)} className="w-full bg-slate-950 border border-slate-850 p-2 text-slate-200 rounded-xl" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-slate-500 font-bold">Trip Purpose</label>
                  <select value={newTripPurpose} onChange={(e) => setNewTripPurpose(e.target.value)} className="w-full bg-slate-950 border border-slate-850 p-2 text-slate-200 rounded-xl">
                    <option value="Boss transport">Boss Transport</option>
                    <option value="Family trip">Family Trip</option>
                    <option value="Delivery">Cargo Delivery</option>
                    <option value="Airport pickup">Airport Pickup</option>
                    <option value="Garage visit">Garage Visit / Maintenance</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase text-slate-500 font-bold">Trip Details / Notes</label>
                <textarea placeholder="e.g., Highway transit to Sihanoukville Port dropoff." value={newTripNotes} onChange={(e) => setNewTripNotes(e.target.value)} className="w-full bg-slate-950 border border-slate-850 p-2 text-slate-200 rounded-xl h-16" />
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-800/80">
                <button type="button" onClick={() => setShowAddTripModal(false)} className="px-3 py-2 bg-slate-950 text-slate-400 rounded-xl hover:text-white transition">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-500 text-white font-black rounded-xl hover:bg-indigo-600 transition">{activeTranslation.startTrip}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Fuel Modal */}
      {showLogFuelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full text-left space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-xs font-black text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                <Fuel className="w-4 h-4 text-emerald-400" />
                <span>Log Fuel / EV Charge Record</span>
              </h3>
              <button onClick={() => setShowLogFuelModal(false)} className="p-1 hover:bg-slate-800 text-slate-500 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleLogFuel} className="space-y-3 font-sans text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-slate-500 font-bold">Select Vehicle</label>
                  <select value={newFuelVeh} onChange={(e) => setNewFuelVeh(e.target.value)} className="w-full bg-slate-950 border border-slate-850 p-2 text-slate-200 rounded-xl">
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>{v.name} ({v.plateNumber})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-slate-500 font-bold">Log Type</label>
                  <select value={newFuelType} onChange={(e) => setNewFuelType(e.target.value)} className="w-full bg-slate-950 border border-slate-850 p-2 text-slate-200 rounded-xl">
                    <option value="Fuel">Petrol Refuel</option>
                    <option value="EV Charging">EV Fast Charge</option>
                    <option value="Toll">Road Toll Pass</option>
                    <option value="Minor Repair">Spare Parts / Repairs</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-slate-500 font-bold">Amount Paid (USD)</label>
                  <input type="number" value={newFuelAmount} onChange={(e) => setNewFuelAmount(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-850 p-2 text-slate-200 rounded-xl font-mono" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-slate-500 font-bold">Station / Provider</label>
                  <input type="text" placeholder="e.g. Total Sothearos" value={newFuelStation} onChange={(e) => setNewFuelStation(e.target.value)} className="w-full bg-slate-950 border border-slate-850 p-2 text-slate-200 rounded-xl" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-slate-500 font-bold">Odometer at Log Time (km)</label>
                  <input type="number" value={newFuelOdo} onChange={(e) => setNewFuelOdo(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-850 p-2 text-slate-200 rounded-xl font-mono" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-slate-500 font-bold">Expense Notes / Proof URL</label>
                  <input type="text" placeholder="Fuel bill attached on driver profile" value={newFuelNotes} onChange={(e) => setNewFuelNotes(e.target.value)} className="w-full bg-slate-950 border border-slate-850 p-2 text-slate-200 rounded-xl" />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-800/80">
                <button type="button" onClick={() => setShowLogFuelModal(false)} className="px-3 py-2 bg-slate-950 text-slate-400 rounded-xl hover:text-white transition">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-emerald-500 text-slate-950 font-black rounded-xl hover:bg-emerald-600 transition">Log Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
