/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Car, 
  Calendar, 
  Gauge, 
  Plus, 
  RotateCcw, 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  Wrench,
  DollarSign,
  MapPin,
  Sparkles,
  ClipboardList,
  FlameKindling,
  X,
  CreditCard,
  Eye,
  FileText,
  Bell,
  Sliders,
  QrCode,
  Tag,
  Activity,
  Check,
  Edit,
  Clock,
  TrendingUp,
  Download,
  AlertCircle,
  HelpCircle,
  Brain,
  Compass,
  Zap,
  ChevronUp,
  ChevronDown,
  MessageSquare,
  Send,
  Key,
  RefreshCw,
  Lock,
  Shield,
  ExternalLink,
  Battery,
  BatteryCharging,
  Thermometer,
  Star,
  Phone
} from "lucide-react";
import { VehicleProfile, MaintenanceRecord, SmartReminder, VehicleExpense, AttachedDocument, UserNotificationSettings, UserProfile, GaragePartner } from "../types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, LineChart, Line, AreaChart, Area, ComposedChart } from "recharts";
import {
  hasEvBatteryAndCharging,
  hasElectricChargingPlug,
  hasPetrolSystem,
  isPureEV,
  hasDieselSystem,
  hasLpgCngSystem
} from "../utils/compatibility";

// Import modular Cambodia MyCar Care KH subtab interfaces
import VehicleFleetView from "./VehicleFleetView";
import PendingRequestsTab from "./PendingRequestsTab";
import MonthlyMaintenanceTab from "./MonthlyMaintenanceTab";
import AppointmentsTab from "./AppointmentsTab";
import GarageConnectionsTab from "./GarageConnectionsTab";
import QrCodeTab from "./QrCodeTab";

interface DashboardProps {
  vehicles: VehicleProfile[];
  onAddVehicle: () => void;
  onSelectVehicle: (v: VehicleProfile | null) => void;
  selectedVehicle: VehicleProfile | null;
  records: MaintenanceRecord[];
  onDeleteVehicle: (id: string) => void;
  onAddRecord: () => void;
  onDeleteRecord: (id: string) => void;
  onNavigateTab?: (tabName: string) => void;
  setVehicles?: React.Dispatch<React.SetStateAction<VehicleProfile[]>>;
  userProfile?: UserProfile;
  garages?: GaragePartner[];
}

// Predict automatic maintenance milestone checks based on engine specs, age brackets and total mileage history
export function getCalculatedMilestones(vehicle: VehicleProfile): {
  id: string;
  title: string;
  category: string;
  triggerReason: string;
  description: string;
  intervalType: string;
  estimatedDueDate: string;
  targetOdo: number;
  recommendedProduct: string;
}[] {
  const miles = vehicle.mileage;
  const currentYear = 2026;
  const ageYears = currentYear - vehicle.year;
  const engine = vehicle.engineType || vehicle.fuelType || 'Gasoline';
  
  const milestonesList: {
    id: string;
    title: string;
    category: string;
    triggerReason: string;
    description: string;
    intervalType: string;
    estimatedDueDate: string;
    targetOdo: number;
    recommendedProduct: string;
  }[] = [];

  const getOffsetDate = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  // 1. Specific engine type checks
  if (engine.includes('EV') || engine.includes('Electric')) {
    milestonesList.push({
      id: 'ms-ev-coolant',
      title: "EV Drive Unit Dielectric Coolant Flush",
      category: "EV Power Unit Maintenance",
      triggerReason: `Identified for Fully Electric Drivetrain (${vehicle.brand} ${vehicle.model})`,
      description: "EV power electronics require specific non-conductive dielectric coolants to prevent extreme temperature triggers and high-voltage circuit shorts during hot periods.",
      intervalType: "Odometer Specific",
      estimatedDueDate: getOffsetDate(180),
      targetOdo: Math.floor(miles / 100000 + 1) * 100000,
      recommendedProduct: "Non-conductive original dielectric battery coolant agent"
    });
    milestonesList.push({
      id: 'ms-ev-aux',
      title: "12V Auxiliary Lithium Battery Capacity Sweeps",
      category: "EV System Diagnostic",
      triggerReason: `Identified by vehicle age (${ageYears} yrs) as crucial to avoid complete vehicle blackout risks`,
      description: "Low-voltage auxiliary batteries power high-voltage isolation keys. If they drain, the main EV drivetrain cannot initialize or boot.",
      intervalType: "Age/Time Based",
      estimatedDueDate: getOffsetDate(90),
      targetOdo: miles + 10000,
      recommendedProduct: "12V Deep Cycle SLA diagnostic tester verification"
    });
  } else if (engine.includes('Hybrid') || engine.includes('PHEV')) {
    milestonesList.push({
      id: 'ms-hybrid-fan',
      title: "Hybrid Auxiliary Battery Duct Dust Filtering Check",
      category: "Hybrid Cooling Care",
      triggerReason: "Critical for Hybrid / PHEV cars matching high Cambodian humidity profiles",
      description: "Clogged rear seat cabin auxiliary fan air inlets can overheat high-voltage Lithium packs, reducing fuel efficiency and creating permanent vehicle system damage.",
      intervalType: "Recurring Odometer Milestone",
      estimatedDueDate: getOffsetDate(45),
      targetOdo: Math.floor(miles / 10000 + 1) * 10000,
      recommendedProduct: "HEPA high-flow back seat cabin replacement elements"
    });
    milestonesList.push({
      id: 'ms-hybrid-loop',
      title: "Hybrid Inverter Cooling Loop flushing",
      category: "Hybrid Inverter Service",
      triggerReason: `Calculated from hybrid design metrics at current ${miles.toLocaleString()} km odometer depth`,
      description: "The auxiliary electrical invertor runs an isolated cooling loop. Sludge buildup causes rapid inverter thermal triggers.",
      intervalType: "Extreme Range Limit",
      estimatedDueDate: getOffsetDate(120),
      targetOdo: Math.floor(miles / 80000 + 1) * 80000,
      recommendedProduct: "Super-long-life ethylene-glycol pink fluid agent"
    });
  } else if (engine.includes('Diesel')) {
    milestonesList.push({
      id: 'ms-diesel-filter',
      title: "Primary Fuel & Moisture Separation Filter Update",
      category: "Diesel Fuel Quality Maintenance",
      triggerReason: "Diesel high-sulfur levels logged in regional Cambodia fuel terminals require strict monitoring",
      description: "High moisture content damages common-rail high-pressure injection pumps. Release fuel moisture content regularly and replace filters on time to preserve compression index.",
      intervalType: "Water separation cycle",
      estimatedDueDate: getOffsetDate(30),
      targetOdo: Math.floor(miles / 15000 + 1) * 15000,
      recommendedProduct: "Premium water-separation dual stage cartridge"
    });
    milestonesList.push({
      id: 'ms-diesel-dpf',
      title: "Exhaust DPF/AdBlue System Regenerative Burn Checks",
      category: "Diesel Exhaust Emission Control",
      triggerReason: `High-density stop-and-go Phnom Penh traffic triggers particulate build-up quickly`,
      description: "Slow traffic causes quick particulate blockages. Inspect the exhaust systems or drive at elevated highway speeds to clear filter elements dynamic soot layers.",
      intervalType: "Exhaust wear standard",
      estimatedDueDate: getOffsetDate(75),
      targetOdo: miles + 6000,
      recommendedProduct: "Professional DPF aerosol wash cleaner additive"
    });
  } else {
    // Petrol Gasoline
    milestonesList.push({
      id: 'ms-gas-plugs',
      title: "Combustion Spark Plugs & Ignition Coil Inspection",
      category: "Gasoline Combustion Care",
      triggerReason: `Spark combustion standard cycle prediction for ${vehicle.brand} engine`,
      description: "Worn or heavily carbon-encrusted electrodes cause engine micro-knocking, poor throttle response, and low mileage efficiency.",
      intervalType: "Standard ignition wear index",
      estimatedDueDate: getOffsetDate(90),
      targetOdo: Math.floor(miles / 40000 + 1) * 40000,
      recommendedProduct: "Iridium High-Performance long-span thread spark plugs"
    });
    milestonesList.push({
      id: 'ms-gas-throttle',
      title: "Electronic Throttle Valve Butterfly & Air Intake Decarbonizing",
      category: "Gasoline Air Intake System",
      triggerReason: "Risk of combustion blow-by gas oil accumulations in throttle valve",
      description: "Gummy oil deposits degrade perfect idle regulation, causing rev drops and rough chassis vibrations during AC engagement.",
      intervalType: "Throttle body cleaning interval",
      estimatedDueDate: getOffsetDate(60),
      targetOdo: Math.floor(miles / 20000 + 1) * 20000,
      recommendedProduct: "Solvent-based high pressure throttle cleaner aerosol"
    });
  }

  // 2. Vehicle age checks
  if (ageYears >= 10) {
    milestonesList.push({
      id: 'ms-age-bushing',
      title: "Chassis Suspension Rubber Bushings & Shock Mount Check",
      category: "Vintage Suspension Security",
      triggerReason: `Evaluated dynamically for vehicle age of ${ageYears} years (Vintage Bracket Indicator)`,
      description: "Phnom Penh dirt roads degrade old suspension rubber parts quickly. Bushing damage causes uneven tire wear and steering feedback wobble.",
      intervalType: "Lubricant dry-out checks",
      estimatedDueDate: getOffsetDate(30),
      targetOdo: miles + 5000,
      recommendedProduct: "Polyurethane heavy duty aftermarket replacement kit"
    });
    milestonesList.push({
      id: 'ms-age-hose',
      title: "Rubber Coolant Hose & Pressure Radiator Cap swap",
      category: "Overheating Prevention",
      triggerReason: "Rubber brittleness risk in high hot ambient temperatures in Cambodia (>40C)",
      description: "Severe radiator hose cracking under extreme pressures can empty core water reservoirs in seconds, wrapping engine blocks permanently.",
      intervalType: "Thermal stress fatigue limit",
      estimatedDueDate: getOffsetDate(60),
      targetOdo: miles + 8000,
      recommendedProduct: "Reinforced silicone multi-ply coolant hose set"
    });
  } else if (ageYears >= 5) {
    milestonesList.push({
      id: 'ms-age-fluid',
      title: "Transmission CVT / Automatic Fluid Flush & Oil Filter swap",
      category: "Transmission Care",
      triggerReason: `Calculated from your middle-aged bracket of ${ageYears} years`,
      description: "Metal friction particles gather in gearbox sumps, clogging main oil regulation solenoids and preventing smooth clutch shifting.",
      intervalType: "Viscosity degradation wear",
      estimatedDueDate: getOffsetDate(150),
      targetOdo: Math.floor(miles / 60000 + 1) * 60000,
      recommendedProduct: "Premium fully-synthetic high-temp ATF/CVT fluid pack"
    });
  } else {
    milestonesList.push({
      id: 'ms-age-diag',
      title: "Full Digital Module & Electronic Sensors Diagnostic Sweep",
      category: "New Car Assurance",
      triggerReason: `Suggested for pristine young-aged vehicles (${ageYears} years old)`,
      description: "Perform state-of-the-art OBD diagnostics logs scanning to identify any minor code registers before warning lamps populate in the clusters.",
      intervalType: "Annual precision tuneup",
      estimatedDueDate: getOffsetDate(120),
      targetOdo: miles + 12000,
      recommendedProduct: "Original manufacturer software diagnostic scanning"
    });
  }

  // 3. Mileage history checks
  if (miles >= 150000) {
    milestonesList.push({
      id: 'ms-mil-timing',
      title: "Engine Overhead Timing Belt / Chain Wear inspection",
      category: "Extreme Lifecycle Safety",
      triggerReason: `Critical priority triggered based on high-wear odometer mileage (${miles.toLocaleString()} km)`,
      description: "Frayed rubber timing belts can snap instantly, causing pistons to violently strike valvetrains, completely destroying engine heads.",
      intervalType: "High stress failure mitigation",
      estimatedDueDate: getOffsetDate(25),
      targetOdo: Math.floor(miles / 50000 + 1) * 50000,
      recommendedProduct: "EPDM synthetic fiber-reinforced timing kit"
    });
  } else if (miles >= 80000) {
    milestonesList.push({
      id: 'ms-mil-shocks',
      title: "Suspension Strut Dampers & Steering Tie-Rods replacement Check",
      category: "Steering Stability",
      triggerReason: `Indicated by normal mid-to-high mileage fatigue milestones (${miles.toLocaleString()} km)`,
      description: "Worn hydraulic shocks leak internal oils, which drastically increases vehicle stopping distance and sways during high freeway speeds.",
      intervalType: "Hydraulic stress calculation",
      estimatedDueDate: getOffsetDate(100),
      targetOdo: Math.floor(miles / 40000 + 1) * 40000,
      recommendedProduct: "Premium twin-tube gas charged shock struts"
    });
  } else {
    // Low Mileage
    milestonesList.push({
      id: 'ms-mil-breakin',
      title: "Subtle Tire Pressure & Minor Bolt Tighten inspections",
      category: "Break-in Optimization",
      triggerReason: `Suggested for smooth break-in mileage history range (${miles.toLocaleString()} km)`,
      description: "Brand new vehicle chassis components stretch and shift slightly. Minor inspections prevent long term bolt loosening.",
      intervalType: "Initial wear settling check",
      estimatedDueDate: getOffsetDate(90),
      targetOdo: 30000,
      recommendedProduct: "Precision torque wrench and digital tire pressure calibrations"
    });
  }

  return milestonesList;
}

// Generate calendar synchronizer .ics download files for system agendas
export function syncToCalendar(milestone: { title: string; estimatedDueDate: string; description: string }) {
  const titleFormatted = milestone.title.replace(/[,;]/g, '');
  const descriptionFormatted = (milestone.description || '').replace(/[,;]/g, '');
  const dateFormatted = milestone.estimatedDueDate.replace(/-/g, '');
  
  const icsLines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//MyCar Care Cambodia//NONSGML v1.0//EN",
    "BEGIN:VEVENT",
    `UID:uid-${Date.now()}-${Math.floor(Math.random() * 100000)}@mycar.kh`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    `DTSTART;VALUE=DATE:${dateFormatted}`,
    `DTEND;VALUE=DATE:${dateFormatted}`,
    `SUMMARY:MyCar Care Reminder: ${titleFormatted}`,
    `DESCRIPTION:${descriptionFormatted}`,
    "STATUS:CONFIRMED",
    "SEQUENCE:0",
    "END:VEVENT",
    "END:VCALENDAR"
  ];

  const blob = new Blob([icsLines.join("\r\n")], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `mycar_milestone_${titleFormatted.toLowerCase().replace(/\s+/g, '_')}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

const CustomTooltipComponent = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const categories = data?.categoryBreakdown ? Object.keys(data.categoryBreakdown) : [];
    
    return (
      <div className="bg-slate-950/95 border border-white/10 rounded-2xl p-3.5 shadow-2xl backdrop-blur-xl space-y-2 text-xs min-w-[200px] z-50">
        <p className="font-extrabold text-slate-100 border-b border-white/10 pb-1.5">{label}</p>
        <div className="space-y-1.5 pt-0.5">
          {payload.map((entry: any) => (
            <div key={entry.name} className="flex justify-between items-center gap-6">
              <span className="flex items-center gap-1.5 font-bold text-slate-450 text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.fill || entry.color }}></span>
                {entry.name}:
              </span>
              <span className="font-mono font-black text-slate-100">${(entry.value || 0).toLocaleString()}</span>
            </div>
          ))}
          {data.totalCost > 0 && payload.length > 1 && (
            <div className="pt-1.5 border-t border-white/5 flex justify-between items-center gap-6 font-black text-emerald-400 text-[11px]">
              <span>Accumulated:</span>
              <span className="font-mono">${data.totalCost.toLocaleString()}</span>
            </div>
          )}
        </div>
        
        {/* Category breakdown listing */}
        {categories.length > 0 && (
          <div className="pt-2 border-t border-white/5 space-y-1 font-sans">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block">Primary Expenses</span>
            <div className="max-h-24 overflow-y-auto space-y-1 pr-1 scrollbar-none">
              {Object.entries(data.categoryBreakdown)
                .sort((a: any, b: any) => b[1] - a[1])
                .slice(0, 3)
                .map(([cat, val]: any) => (
                  <div key={cat} className="flex justify-between items-center text-[10px] text-slate-400">
                    <span className="truncate max-w-[125px] font-medium">{cat}</span>
                    <span className="font-mono text-slate-300">${(val || 0).toLocaleString()}</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    );
  }
  return null;
};

export default function Dashboard({
  vehicles,
  onAddVehicle,
  onSelectVehicle,
  selectedVehicle,
  records,
  onDeleteVehicle,
  onAddRecord,
  onDeleteRecord,
  onNavigateTab,
  setVehicles,
  userProfile,
  garages
}: DashboardProps) {
  // Navigation inside the Driver dashboard
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'vehicles' | 'expenses' | 'reminders' | 'documents' | 'settings' | 'ai' | 'telegram'>('overview');

  // Reminders and Fetching
  const [reminders, setReminders] = useState<SmartReminder[]>([]);
  const [reminderLoading, setReminderLoading] = useState(false);

  // Custom DB elements
  const [expenses, setExpenses] = useState<VehicleExpense[]>([]);
  const [documents, setDocuments] = useState<AttachedDocument[]>([]);
  const [expenseLoading, setExpenseLoading] = useState(false);
  const [documentLoading, setDocumentLoading] = useState(false);

  // Connect Telegram details
  const [tgToken, setTgToken] = useState("");
  const [tgConnecting, setTgConnecting] = useState(false);
  const [tgIsConnected, setTgIsConnected] = useState(false);
  const [tgUserName, setTgUserName] = useState("");
  const [tgLogAlert, setTgLogAlert] = useState<{ type: 'success' | 'info' | 'error', text: string } | null>(null);
  const [tgFullStatus, setTgFullStatus] = useState<any>({
    settings: {},
    connections: [],
    permissions: []
  });
  const [simulatedCommand, setSimulatedCommand] = useState("");
  const [simulatedReplies, setSimulatedReplies] = useState<{ sender: 'bot' | 'user'; text: string; timestamp: string }[]>([
    {
      sender: 'bot',
      text: "🤖 Welcome to MyCar Care KH Telegram Bot. Ready to monitor daily vehicle telemetry and active garage checkups!\n\nTo safely pair your driver account, click the 'Initiate Connection Handshake' button on the left to obtain a secure verification key, then enter `/start KEY` here.",
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [copied, setCopied] = useState(false);

  // Edit vehicle states
  const [isEditingVehicle, setIsEditingVehicle] = useState(false);
  const [editNickname, setEditNickname] = useState("");
  const [editPlateNumber, setEditPlateNumber] = useState("");
  const [editVehicleType, setEditVehicleType] = useState<'Sedan' | 'SUV' | 'Pickup' | 'Van' | 'Moto' | 'Truck' | 'Hatchback' | 'Other'>('Sedan');
  const [editPurchaseDate, setEditPurchaseDate] = useState("");
  const [editPurchasePrice, setEditPurchasePrice] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editIsForSale, setEditIsForSale] = useState(false);
  const [editSalePrice, setEditSalePrice] = useState("");
  const [editSaleDescription, setEditSaleDescription] = useState("");
  const [editMarketplaceStatus, setEditMarketplaceStatus] = useState<'Not Listed' | 'Listed for Sale' | 'Sold'>('Not Listed');
  const [savingVehicle, setSavingVehicle] = useState(false);

  // State for Nearby Recommended garages widget
  const [selectedNearbyCity, setSelectedNearbyCity] = useState(userProfile?.location || 'Phnom Penh');
  const [selectedNearbyCategory, setSelectedNearbyCategory] = useState<'All' | 'EV & Hybrid' | 'Diesel' | 'General Repair' | 'Wash & Detail' | 'Petrol & Lube'>('All');
  const [bookingSuccessGarageId, setBookingSuccessGarageId] = useState<string | null>(null);

  // Synchronize the selected nearby city when the user profile location shifts
  React.useEffect(() => {
    if (userProfile?.location) {
      setSelectedNearbyCity(userProfile.location);
    }
  }, [userProfile]);

  // Add Expense states
  const [showAddExpensePanel, setShowAddExpensePanel] = useState(false);
  const [expCategory, setExpCategory] = useState<'Fuel' | 'Oil change' | 'Maintenance' | 'Repair' | 'Spare parts' | 'Tire' | 'Battery' | 'Car wash' | 'Parking' | 'Toll fee' | 'Insurance' | 'Road tax' | 'Loan payment' | 'Accessories' | 'Emergency repair' | 'Other'>('Fuel');
  const [expAmount, setExpAmount] = useState("");
  const [expDate, setExpDate] = useState(new Date().toISOString().split('T')[0]);
  const [expMileage, setExpMileage] = useState("");
  const [expProvider, setExpProvider] = useState("");
  const [expPaymentMethod, setExpPaymentMethod] = useState<'Cash' | 'ABA Pay' | 'Wing' | 'Credit Card' | 'Other'>('ABA Pay');
  const [expNotes, setExpNotes] = useState("");

  // Add Custom Reminder states
  const [showAddReminderPanel, setShowAddReminderPanel] = useState(false);
  const [remTitle, setRemTitle] = useState("");
  const [remCategory, setRemCategory] = useState("Custom reminder");
  const [remType, setRemType] = useState<'date_based' | 'mileage_based' | 'date_and_mileage' | 'repeating' | 'custom'>('date_based');
  const [remDueDate, setRemDueDate] = useState("");
  const [remDueMileage, setRemDueMileage] = useState("");
  const [remRepeatType, setRemRepeatType] = useState<'none' | 'daily' | 'weekly' | 'monthly' | 'every_3_months' | 'every_6_months' | 'yearly' | 'custom'>('none');
  const [remNotes, setRemNotes] = useState("");
  const [remPriority, setRemPriority] = useState<'Low' | 'Medium' | 'High' | 'Emergency'>('Medium');
  const [remSaving, setRemSaving] = useState(false);

  // Document registration states
  const [showAddDocModal, setShowAddDocModal] = useState(false);
  const [docCategory, setDocCategory] = useState<'Registration Card' | 'Insurance Document' | 'Road Tax Document' | 'Purchase Invoice' | 'Warranty Card' | 'Service Invoice' | 'Spare Parts Receipt' | 'Garage Receipt' | 'Other'>('Registration Card');
  const [docTitle, setDocTitle] = useState("");
  const [docFileName, setDocFileName] = useState("");
  const [docSaving, setDocSaving] = useState(false);

  // AI Driver insights states
  const [aiInsights, setAiInsights] = useState<{
    maintenanceInsights?: string;
    spendingInsights?: string;
    warningMessages?: string;
    ownershipAdvice?: string;
    costPrediction?: string;
  } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Notification Settings Preferences states (Client-controlled persistent simulation)
  const [appNotifSettings, setAppNotifSettings] = useState({
    pushEnabled: true,
    emailEnabled: true,
    smsEnabled: false,
    telegramEnabled: false,
    maintenanceEnabled: true,
    garageEnabled: true,
    bookingEnabled: true,
    marketplaceEnabled: false,
    forumEnabled: true,
    safetyAlertEnabled: true,
    adminAnnouncementEnabled: true,
    customAlarmEnabled: true
  });
  const [settingsStatusMessage, setSettingsStatusMessage] = useState("");

  // Detailed 9-tab state management for Selected Vehicle Detail Page
  const [activeSpecTab, setActiveSpecTab] = useState<'overview' | 'pending_requests' | 'service_history' | 'monthly_maintenance' | 'appointments' | 'reminder_settings' | 'qr_code' | 'documents' | 'garage_connections' | 'qr_scan_history'>('overview');
  const [quickMenuOpen, setQuickMenuOpen] = useState(false);
  const [scanHistory, setScanHistory] = useState<any[]>([]);
  const [scanHistoryLoading, setScanHistoryLoading] = useState(false);
  const [simulationLoading, setSimulationLoading] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [pendingRequestsLoading, setPendingRequestsLoading] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [monthlyChecklists, setMonthlyChecklists] = useState<any[]>([]);
  const [monthlyLoading, setMonthlyLoading] = useState(false);
  const [connections, setConnections] = useState<any[]>([]);
  const [connectionsLoading, setConnectionsLoading] = useState(false);

  // Vehicle Status & Ownership Transfer states
  const [showStatusUpdateModal, setShowStatusUpdateModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [statusValue, setStatusValue] = useState<'Active' | 'Inactive' | 'Under Repair' | 'Sold/Transferred' | 'Archived'>('Active');
  const [statusReason, setStatusReason] = useState("");
  const [statusDate, setStatusDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusNote, setStatusNote] = useState("");
  const [statusDocName, setStatusDocName] = useState("");

  const [repairGarageNameState, setRepairGarageNameState] = useState("Apsara Auto Repair & Diagnostics");
  const [repairStatusState, setRepairStatusState] = useState("Work in progress");
  const [repairEstCompletionState, setRepairEstCompletionState] = useState("");
  const [repairPendingInvoiceState, setRepairPendingInvoiceState] = useState("120");

  const [transferTarget, setTransferTarget] = useState("");
  const [transferDateState, setTransferDateState] = useState(new Date().toISOString().split('T')[0]);
  const [transferPrice, setTransferPrice] = useState("");
  const [transferNote, setTransferNote] = useState("");
  const [transferType, setTransferType] = useState<'Full History Transfer' | 'Partial History Transfer' | 'Vehicle Profile Only'>('Full History Transfer');
  const [transferDocName, setTransferDocName] = useState("");
  const [selectedRecordsToTransfer, setSelectedRecordsToTransfer] = useState<string[]>([
    'maintenance', 'garage_records', 'spare_parts', 'accident', 'documents', 'mileage', 'expenses'
  ]);

  // Demo incoming transfers requests state (Transfer Inbox)
  const [incomingTransfers, setIncomingTransfers] = useState<any[]>([
    {
      id: "tr-rec-1",
      vehicleBrand: "Lexus",
      vehicleModel: "RX350 Luxury",
      vehicleYear: 2013,
      plateNumber: "PP-2A-9988",
      fromOwner: "Chamroeun Sok",
      transferDate: "2026-06-05",
      sellingPrice: 24500,
      note: "Transferring full electronic history card of RX350 after successful ABA Pay settlement.",
      transferType: "Full History Transfer",
      selectedRecords: ['maintenance', 'garage_records', 'spare_parts', 'documents', 'expenses'],
      status: "Pending" // "Pending" | "Accepted" | "Rejected"
    }
  ]);

  // General applet-wide simulation user roles (for transfer approvals & admin tracking)
  const [demoUserRole, setDemoUserRole] = useState<'Owner' | 'Garage' | 'Super Admin'>('Owner');
  const [isPremiumDemo, setIsPremiumDemo] = useState(false);

  // Correction feedback trigger
  const [correctionFeedbackNotes, setCorrectionFeedbackNotes] = useState("");
  const [correctingRecordId, setCorrectingRecordId] = useState<string | null>(null);

  // Dispute feedback trigger
  const [disputeNotes, setDisputeNotes] = useState("");
  const [disputingRecordId, setDisputingRecordId] = useState<string | null>(null);

  // New Booking interactive trigger
  const [showAddBookingModal, setShowAddBookingModal] = useState(false);
  const [bookingGarageId, setBookingGarageId] = useState("g1");
  const [bookingGarageName, setBookingGarageName] = useState("Sokha Auto Garage");
  const [bookingServiceType, setBookingServiceType] = useState("Engine Oil Service");
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookingTime, setBookingTime] = useState("09:00");
  const [bookingNote, setBookingNote] = useState("");
  const [bookingSubmitting, setBookingSubmitting] = useState(false);

  // New Connection trigger
  const [showAddConnectionModal, setShowAddConnectionModal] = useState(false);
  const [connGarageId, setConnGarageId] = useState("g1");
  const [connPermissionLevel, setConnPermissionLevel] = useState<'private' | 'basic_profile' | 'view_history' | 'full_history'>('full_history');
  const [connAllowLogs, setConnAllowLogs] = useState(true);
  const [connAllowAppointments, setConnAllowAppointments] = useState(true);
  const [connAllowReminders, setConnAllowReminders] = useState(true);
  const [connAllowInvoices, setConnAllowInvoices] = useState(true);
  const [connSaving, setConnSaving] = useState(false);

  // --- RECHARTS BAR CHART ANALYTICS STATE & COMPILERS ---
  const [chartScope, setChartScope] = useState<'all' | 'active'>('all');
  const [chartRange, setChartRange] = useState<6 | 12>(6);
  const [chartMetric, setChartMetric] = useState<'service' | 'combined'>('service');

  // --- RECHARTS MAINTENANCE COST OVER TIME STATE & COMPILERS ---
  const [costOverTimeVehicleId, setCostOverTimeVehicleId] = useState<string>("");
  const [costOverTimeViewMode, setCostOverTimeViewMode] = useState<'cumulative' | 'individual' | 'overlay'>('cumulative');

  // --- RECHARTS VISUAL COST & FREQUENCY TRENDS STATE & COMPILERS ---
  const [visualTrendViewMode, setVisualTrendViewMode] = useState<'monthly' | 'chronological'>('monthly');

  // --- BATTERY HEALTH MONITOR STATE ---
  const [dcFastChargingPct, setDcFastChargingPct] = useState<number>(30); // DC Fast Charging vs Home/AC. Default 30%
  const [operatingTempC, setOperatingTempC] = useState<number>(32); // Average operating temperature in Celsius. Default 32°C (Phnom Penh climate)


  // Sync selected vehicle automatically with cumulative cost chart state
  React.useEffect(() => {
    if (selectedVehicle) {
      setCostOverTimeVehicleId(selectedVehicle.id);
    } else if (vehicles.length > 0 && !costOverTimeVehicleId) {
      setCostOverTimeVehicleId(vehicles[0].id);
    }
  }, [selectedVehicle, vehicles]);

  // Derived target vehicle for the Cost Over Time Chart
  const costOverTimeVehicle = React.useMemo(() => {
    return vehicles.find(v => v.id === costOverTimeVehicleId) || selectedVehicle || vehicles[0] || null;
  }, [vehicles, costOverTimeVehicleId, selectedVehicle]);

  // Aggregate selected vehicle's maintenance records over time
  const selectedVehicleRecordsChartData = React.useMemo(() => {
    const targetVeh = costOverTimeVehicle;
    if (!targetVeh) return [];
    
    // Filter records by design
    const vehRecs = records.filter(r => r.vehicleId === targetVeh.id);
    
    // Sort chronologically by date
    const sorted = [...vehRecs].sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateA - dateB;
    });
    
    let cumulative = 0;
    return sorted.map((r, index) => {
      cumulative += r.cost;
      return {
        index: index + 1,
        date: r.date || "Unknown Date",
        category: r.serviceCategory || "General Maintenance",
        cost: r.cost,
        cumulative: cumulative,
        mileage: r.mileage ? `${r.mileage.toLocaleString()} km` : "N/A",
        provider: r.provider || "Unknown Provider"
      };
    });
  }, [costOverTimeVehicle, records]);

  // Chronological event-based trend data (Single records sorted by date)
  const visualTrendChronologicalData = React.useMemo(() => {
    const targetVeh = costOverTimeVehicle;
    if (!targetVeh) return [];
    
    const vehRecs = records.filter(r => r.vehicleId === targetVeh.id);
    
    // Sort chronologically by date
    const sorted = [...vehRecs].sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateA - dateB;
    });

    return sorted.map((r, index) => ({
      index: index + 1,
      date: r.date || "Unknown",
      cost: Number(r.cost) || 0,
      frequency: index + 1, // continuous cumulative count
      category: r.serviceCategory || "General Maintenance",
      mileage: r.mileage ? `${r.mileage.toLocaleString()} km` : "N/A",
      provider: r.provider || "Unknown Provider"
    }));
  }, [costOverTimeVehicle, records]);

  // Calendar monthly aggregated trend data (Grouped costs vs frequency counts by month)
  const visualTrendMonthlyData = React.useMemo(() => {
    const targetVeh = costOverTimeVehicle;
    if (!targetVeh) return [];
    
    const vehRecs = records.filter(r => r.vehicleId === targetVeh.id);
    
    // Sort chronologically by date
    const sorted = [...vehRecs].sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateA - dateB;
    });

    const groups: { [key: string]: { cost: number; frequency: number; year: number; month: number } } = {};
    sorted.forEach((r) => {
      if (!r.date) return;
      const d = new Date(r.date);
      if (isNaN(d.getTime())) return;
      const year = d.getFullYear();
      const month = d.getMonth(); // 0-11
      const key = `${year}-${String(month + 1).padStart(2, '0')}`;

      if (!groups[key]) {
        groups[key] = { cost: 0, frequency: 0, year, month };
      }
      groups[key].cost += Number(r.cost) || 0;
      groups[key].frequency += 1; // counts visit frequencies in this month
    });

    return Object.keys(groups)
      .sort()
      .map(key => {
        const item = groups[key];
        const d = new Date(item.year, item.month, 1);
        const label = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
        return {
          key,
          label,
          cost: item.cost,
          frequency: item.frequency
        };
      });
  }, [costOverTimeVehicle, records]);

  // --- BATTERY HEALTH SIMULATOR STATES ---
  const [is12VSimulating, setIs12VSimulating] = useState<boolean>(false);
  const [sim12VHealthScore, setSim12VHealthScore] = useState<number>(88);
  const [sim12VVoltage, setSim12VVoltage] = useState<number>(12.6);
  const [sim12VCrankingV, setSim12VCrankingV] = useState<number>(10.4);
  const [forceEvPreview, setForceEvPreview] = useState<boolean>(false);

  // --- EV LIVE CHARGE & MILEAGE DEGRADATION STATES ---
  const [evCurrentCharge, setEvCurrentCharge] = useState<number>(82);
  const [evIsCharging, setEvIsCharging] = useState<boolean>(false);
  const [evSimMileageOffset, setEvSimMileageOffset] = useState<number>(0);
  const [evDiagScanActive, setEvDiagScanActive] = useState<boolean>(false);
  const [evDiagProgress, setEvDiagProgress] = useState<number>(0);
  const [evDiagScanCompleted, setEvDiagScanCompleted] = useState<boolean>(false);

  // Diagnostics scan simulation effect
  useEffect(() => {
    let interval: any;
    if (evDiagScanActive) {
      setEvDiagProgress(0);
      setEvDiagScanCompleted(false);
      interval = setInterval(() => {
        setEvDiagProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setEvDiagScanActive(false);
            setEvDiagScanCompleted(true);
            return 100;
          }
          return prev + 10;
        });
      }, 150);
    }
    return () => clearInterval(interval);
  }, [evDiagScanActive]);

  // --- DYNAMIC BATTERY HEALTH ANALYSIS ANALYSIS AND DEGRADATION PLOTTER ---
  const batteryHealthData = React.useMemo(() => {
    const v = selectedVehicle || vehicles[0] || null;
    if (!v) return null;

    // Is it an EV/Hybrid model (or did the user force EV preview mode for simulation purposes)
    const isEvOrHybrid = v.fuelType === 'Hybrid' || v.fuelType === 'EV' || forceEvPreview;
    const ageYears = Math.max(0, 2026 - v.year); // App baseline current year is 2026
    const mileage = (v.mileage || 0) + evSimMileageOffset;

    // 1. Calendar Degradation Baseline: 1.8% per year
    const calendarDegradationRate = 1.8;
    
    // Phnom Penh average temperature is around 32°C. Elevated temperatures accelerate capacity decay.
    let tempMultiplier = 1.0;
    if (operatingTempC > 25) {
      tempMultiplier = 1.0 + (operatingTempC - 25) * 0.045; // 4.5% annual loss compounding multiplier per Celsius above 25°C
    } else {
      tempMultiplier = Math.max(0.7, 1.0 - (25 - operatingTempC) * 0.015);
    }
    const totalCalendarLoss = ageYears * calendarDegradationRate * tempMultiplier;

    // 2. Mileage-use degradation. Baseline: 1.1% per 10,000 km
    const mileageDegradationRate = 1.1;
    // DC fast charging penalty multiplier (heats up cells and causes micro-fracturing of anodization layers)
    const chargingPenalty = 1.0 + (dcFastChargingPct / 100) * 0.55; 
    const totalMileageLoss = (mileage / 10000) * mileageDegradationRate * chargingPenalty;

    // 3. Service records adjustments
    const vehicleRecords = records.filter(r => r.vehicleId === v.id);
    let serviceBonus = 0;
    let hasBatteryCoolantFlush = false;
    let hasCellRebalance = false;
    let hasBatteryDiagnostics = false;
    let hasFullReplacement = false;
    let lastReplacementYear = v.year;

    vehicleRecords.forEach(r => {
      const desc = (r.description || "").toLowerCase();
      const cat = (r.serviceCategory || "").toLowerCase();
      const combinedText = `${desc} ${cat}`;

      if (
        combinedText.includes("battery replacement") || 
        combinedText.includes("replaced hv battery") || 
        combinedText.includes("new battery pack") ||
        combinedText.includes("traction battery pack")
      ) {
        hasFullReplacement = true;
        const recordVal = r.date ? new Date(r.date) : null;
        if (recordVal) {
          const repYear = recordVal.getFullYear();
          if (repYear > lastReplacementYear) {
            lastReplacementYear = repYear;
          }
        }
      }
      
      if (
        combinedText.includes("coolant flush") || 
        combinedText.includes("battery cooling") || 
        combinedText.includes("battery filter") ||
        combinedText.includes("fan clean")
      ) {
        hasBatteryCoolantFlush = true;
        serviceBonus += 3.5; // Optimized thermal management restores cell efficiency
      }
      if (
        combinedText.includes("rebalance") || 
        combinedText.includes("balancing") || 
        combinedText.includes("cell tuning")
      ) {
        hasCellRebalance = true;
        serviceBonus += 2.5; // BMS cell rebalancing restores voltage uniformity
      }
      if (
        combinedText.includes("diagnostic scan") || 
        combinedText.includes("battery health check") || 
        combinedText.includes("capacity sweep")
      ) {
        hasBatteryDiagnostics = true;
        serviceBonus += 1.5; // Calibration adjustments
      }
    });

    // Solve effective calendar age using replacement date if applicable
    const activeAgeYears = hasFullReplacement ? Math.max(0, 2026 - lastReplacementYear) : ageYears;
    const adjustedCalendarLoss = activeAgeYears * calendarDegradationRate * tempMultiplier;
    const cappedServiceBonus = Math.min(9.0, serviceBonus);

    // Calc capacity State of Health
    let calculatedSOH = 100 - (adjustedCalendarLoss + totalMileageLoss) + cappedServiceBonus;
    calculatedSOH = Math.max(40, Math.min(100, calculatedSOH));

    // Warranty replacement threshold is standard 70% SOH. Remaining automotive utility lifespan:
    const thresholdSOH = 70.0;
    const currentDegradationRatePerYear = 
      (calendarDegradationRate * tempMultiplier) + 
      ((mileage / Math.max(1, ageYears)) / 10000 * mileageDegradationRate * chargingPenalty);

    let remainingYears = 0;
    if (calculatedSOH > thresholdSOH) {
      remainingYears = (calculatedSOH - thresholdSOH) / Math.max(0.4, currentDegradationRatePerYear);
    } else {
      remainingYears = 0;
    }
    remainingYears = Math.min(12, Math.max(0, remainingYears));

    // Compile 10-year SOH decay curve prediction projection
    const projections = [];
    for (let yr = 0; yr <= 10; yr++) {
      const yrLossCal = yr * calendarDegradationRate * tempMultiplier;
      const annualAvgMileage = ageYears > 0 ? (mileage / ageYears) : 14000;
      const yrLossMil = ((annualAvgMileage * yr) / 10000) * mileageDegradationRate * chargingPenalty;
      const projectedSoh = 100 - (yrLossCal + yrLossMil) + (yr >= activeAgeYears ? cappedServiceBonus : 0);
      projections.push({
        year: yr,
        yearLabel: `Year ${yr}`,
        soh: Math.round(Math.max(40, Math.min(100, projectedSoh))),
        threshold: 70
      });
    }

    return {
      isEvOrHybrid,
      calculatedSOH: parseFloat(calculatedSOH.toFixed(1)),
      remainingYears: parseFloat(remainingYears.toFixed(1)),
      projections,
      hasBatteryCoolantFlush,
      hasCellRebalance,
      hasBatteryDiagnostics,
      hasFullReplacement,
      lastReplacementYear,
      bonusAdded: cappedServiceBonus,
      ageYears: activeAgeYears,
      mileage,
      healthReport: calculatedSOH >= 88 ? "Prisitne SOH Status" : calculatedSOH >= 78 ? "Healthy Status" : calculatedSOH >= 70 ? "Accelerated Degradation Risk" : "Critical Swap Advised",
      estCapacityKwh: isEvOrHybrid ? (v.fuelType === 'EV' ? 75 : 1.3) : 0, // Mock baseline packs
    };
  }, [selectedVehicle, vehicles, records, dcFastChargingPct, operatingTempC, forceEvPreview, evSimMileageOffset]);

  // --- FILTERED NEARBY RECOMMENDED GARAGES COMPUTATION GRID ---
  const filteredNearbyGarages = React.useMemo(() => {
    // Fallback list of partners if standard garages prop empty
    const baselineGarages: any[] = garages && garages.length > 0 ? garages : [
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
        services: ["Engine oil change", "Brake check", "AC repair", "Diagnostic scan", "Full Inspection", "Brake Inspection"],
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
        services: ["EV battery health scan", "AC service", "Hybrid battery scan", "Cooling system check", "Software diagnostic scan", "Brake regeneration test", "Hybrid System Inspection"],
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
        services: ["Diesel Engine Repair", "Tire rotation", "Wheel alignment", "Brake service", "Suspension upgrade", "Fuel injector cleaning", "Diesel filter check", "Engine noise inspection", "Exhaust smoke check"],
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
        services: ["Detailing wash", "Foam treatment", "Ceramic coat protection", "Interior sanitation"],
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
        services: ["Engine oil change", "Brake inspection", "Coolant top-off", "Battery change"],
        imageUrl: "https://images.unsplash.com/photo-1527018601619-a508a2be00cd?auto=format&fit=crop&q=80&w=400",
        description: "Rapid express drive-thru bay providing lubricant filter changes, battery tests and fresh air filters on the go.",
        isPartner: true
      },
      // Siem Reap
      {
        id: "g_sr1",
        name: "Angkor Auto Clinic",
        type: "Garage / Repair Shop",
        rating: 4.9,
        reviewsCount: 88,
        address: "National Road 6, Near Angkor High School, Siem Reap",
        phone: "+855 63 111 222",
        lat: 13.3612,
        lng: 103.8592,
        services: ["General Repair", "Brake alignment", "Aircon service", "Engine diagnosis", "Oil change"],
        imageUrl: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=400",
        description: "Top luxury and family SUV servicing center in Siem Reap.",
        isPartner: true
      },
      {
        id: "g_sr2",
        name: "Siem Reap Eco-Drive Station",
        type: "Garage / Repair Shop",
        rating: 4.8,
        reviewsCount: 30,
        address: "Sivatha Road, Next to Smart Store, Siem Reap",
        phone: "+855 63 333 444",
        lat: 13.3552,
        lng: 103.8524,
        services: ["Hybrid Engine Diagnosis", "Inverter system check", "Battery Care", "AC cooling check"],
        imageUrl: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=400",
        description: "Phnom Penh network affiliate specializing in fuel-saving and hybrid engines.",
        isPartner: true
      },
      {
        id: "g_sr3",
        name: "Temple City Car Wash & Wax",
        type: "Car Wash",
        rating: 4.5,
        reviewsCount: 65,
        address: "Street 60, Siem Reap Town",
        phone: "+855 63 555 666",
        lat: 13.3718,
        lng: 103.8692,
        services: ["Body Polish", "Foam wash", "Chassis flush", "Interior detail"],
        imageUrl: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&q=80&w=400",
        description: "Deep dirt removals and undercarriage high power wash.",
        isPartner: false
      },
      // Battambang
      {
        id: "g_bb1",
        name: "Sangkhae River Mechanics",
        type: "Garage / Repair Shop",
        rating: 4.8,
        reviewsCount: 45,
        address: "National Road 5, Near River sangkat, Battambang",
        phone: "+855 53 777 888",
        lat: 13.0952,
        lng: 103.1992,
        services: ["Mobile mechanic support", "Tire rescue", "Engine overhaul", "Brake service", "Towing support"],
        imageUrl: "https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&q=80&w=400",
        description: "Battambang's premier diesel and gasoline repair bay with mobile dispatch units.",
        isPartner: true
      },
      {
        id: "g_bb2",
        name: "Battambang Express Oil & Battery",
        type: "Petrol Station / Partner",
        rating: 4.4,
        reviewsCount: 28,
        address: "Street 3, Battambang City, Battambang",
        phone: "+855 53 999 111",
        lat: 13.0911,
        lng: 103.1925,
        services: ["Oil top ups", "Starter battery check", "Air Filter replacement", "Transmission fluid change"],
        imageUrl: "https://images.unsplash.com/photo-1527018601619-a508a2be00cd?auto=format&fit=crop&q=80&w=400",
        description: "Quick bay for standard passenger cars and motorcycles.",
        isPartner: false
      }
    ];

    // Filter by selected nearby city
    let res = baselineGarages.filter(g => 
      g.address.toLowerCase().includes(selectedNearbyCity.toLowerCase())
    );

    // Filter by selected category pill
    if (selectedNearbyCategory !== 'All') {
      res = res.filter(g => {
        if (selectedNearbyCategory === 'EV & Hybrid') {
          return (
            g.name.toLowerCase().includes("electric") ||
            g.name.toLowerCase().includes("ev") ||
            g.name.toLowerCase().includes("hybrid") ||
            g.services.some((s: string) => s.toLowerCase().includes("ev") || s.toLowerCase().includes("hybrid"))
          );
        } else if (selectedNearbyCategory === 'Diesel') {
          return (
            g.name.toLowerCase().includes("diesel") ||
            g.services.some((s: string) => s.toLowerCase().includes("diesel") || s.toLowerCase().includes("truck"))
          );
        } else if (selectedNearbyCategory === 'General Repair') {
          return g.type === 'Garage / Repair Shop';
        } else if (selectedNearbyCategory === 'Wash & Detail') {
          return g.type === 'Car Wash';
        } else if (selectedNearbyCategory === 'Petrol & Lube') {
          return g.type === 'Petrol Station / Partner' || g.services.some((s: string) => s.toLowerCase().includes("oil") || s.toLowerCase().includes("lube"));
        }
        return true;
      });
    }

    // Sort order:
    // If a vehicle is selected, prioritize partners matching the fuel type of the selected vehicle (EV/Hybrid or Diesel vs Gasoline)
    const sorted = [...res].sort((a, b) => {
      if (selectedVehicle) {
        const fuel = (selectedVehicle.fuelType || '').toLowerCase();
        
        let aMatch = false;
        let bMatch = false;

        if (fuel.includes('ev') || fuel.includes('hybrid')) {
          aMatch = a.name.toLowerCase().includes('ev') || a.name.toLowerCase().includes('hybrid') || a.services.some((s: string) => s.toLowerCase().includes('ev') || s.toLowerCase().includes('hybrid'));
          bMatch = b.name.toLowerCase().includes('ev') || b.name.toLowerCase().includes('hybrid') || b.services.some((s: string) => s.toLowerCase().includes('ev') || s.toLowerCase().includes('hybrid'));
        } else if (fuel.includes('diesel')) {
          aMatch = a.name.toLowerCase().includes('diesel') || a.services.some((s: string) => s.toLowerCase().includes('diesel'));
          bMatch = b.name.toLowerCase().includes('diesel') || b.services.some((s: string) => s.toLowerCase().includes('diesel'));
        }

        if (aMatch && !bMatch) return -1;
        if (!aMatch && bMatch) return 1;
      }

      // Fallback ranking by rating descending
      return b.rating - a.rating;
    });

    return sorted;
  }, [selectedNearbyCity, selectedNearbyCategory, garages, selectedVehicle]);

  // Client-side CSV exporter for maintenance record history
  const downloadServiceHistoryCsv = () => {
    const targetVeh = selectedVehicle || vehicles[0];
    if (!targetVeh) return;
    
    const vehicleRecords = records.filter(r => r.vehicleId === targetVeh.id);
    if (vehicleRecords.length === 0) return;

    // CSV Document headers matching standard spreadsheets
    const headers = [
      "Record ID",
      "Vehicle Brand",
      "Vehicle Model",
      "Vehicle Year",
      "Service Category",
      "Cost (USD)",
      "Odometer (km)",
      "Log Date",
      "Service Provider",
      "Description",
      "Has Receipt Attachment"
    ];

    // Safe cell escaper to support commas, carriage returns, and inner quote characters comfortably
    const rows = vehicleRecords.map(r => {
      const escape = (val: any) => {
        const text = String(val === null || val === undefined ? '' : val);
        return `"${text.replace(/"/g, '""')}"`;
      };
      return [
        escape(r.id),
        escape(targetVeh.brand),
        escape(targetVeh.model),
        escape(targetVeh.year),
        escape(r.serviceCategory || 'General Maintenance'),
        r.cost || 0,
        r.mileage || 0,
        escape(r.date || ''),
        escape(r.provider || ''),
        escape(r.description || ''),
        escape(r.attachmentUrl ? "Yes" : "No")
      ];
    });

    const csvContent = "\uFEFF" + [  // UTF-8 BOM indicator for spreadsheet software auto-recognition
      headers.join(","),
      ...rows.map(e => e.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${targetVeh.brand.toLowerCase()}_${targetVeh.model.toLowerCase()}_service_history.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Synchronize scope to selected vehicle when defined
  React.useEffect(() => {
    if (selectedVehicle) {
      setChartScope('active');
    } else {
      setChartScope('all');
    }
  }, [selectedVehicle]);

  const monthlyChartData = React.useMemo(() => {
    const listCount = chartRange;
    const items = [];
    const refDate = new Date(); // June 2026 or real current date
    
    // Fill months backward chronologically
    for (let i = listCount - 1; i >= 0; i--) {
      const d = new Date(refDate.getFullYear(), refDate.getMonth() - i, 1);
      const year = d.getFullYear();
      const monthNum = String(d.getMonth() + 1).padStart(2, '0');
      const monthStr = d.toLocaleString('en-US', { month: 'short' });
      items.push({
        key: `${year}-${monthNum}`,
        label: `${monthStr} ${year}`,
        serviceCost: 0,
        otherCost: 0,
        totalCost: 0,
        serviceCount: 0,
        otherCount: 0,
        categoryBreakdown: {} as Record<string, number>
      });
    }

    // Records filter
    const targetRecs = chartScope === 'active' && selectedVehicle
      ? records.filter(r => r.vehicleId === selectedVehicle.id)
      : records;

    targetRecs.forEach(rec => {
      if (!rec.date) return;
      const monthKey = rec.date.substring(0, 7); // "YYYY-MM"
      const bucket = items.find(item => item.key === monthKey);
      if (bucket) {
        bucket.serviceCost += rec.cost;
        bucket.totalCost += rec.cost;
        bucket.serviceCount += 1;
        const cat = rec.serviceCategory || "General Maintenance";
        bucket.categoryBreakdown[cat] = (bucket.categoryBreakdown[cat] || 0) + rec.cost;
      }
    });

    // Expenses filter (if combined metrics toggled)
    const targetExps = chartScope === 'active' && selectedVehicle
      ? expenses.filter(e => e.vehicleId === selectedVehicle.id)
      : expenses;

    targetExps.forEach(exp => {
      if (!exp.date) return;
      const monthKey = exp.date.substring(0, 7);
      const bucket = items.find(item => item.key === monthKey);
      if (bucket) {
        bucket.otherCost += exp.amount;
        bucket.totalCost += exp.amount;
        bucket.otherCount += 1;
        const cat = exp.category || "General Expense";
        bucket.categoryBreakdown[cat] = (bucket.categoryBreakdown[cat] || 0) + exp.amount;
      }
    });

    return items;
  }, [records, expenses, selectedVehicle, chartScope, chartRange]);

  // Camera-based QR Code Scanner states
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraPermissionError, setCameraPermissionError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scannedVehicle, setScannedVehicle] = useState<VehicleProfile | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  // Auto handle camera permissions and start/stop streams
  const handleStartCamera = async () => {
    setCameraPermissionError(null);
    setScanResult(null);
    setScannedVehicle(null);
    setIsScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      setCameraStream(stream);
      // Wait for a brief render tick to make sure ref exists
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err: any) {
      console.error("Camera stream retrieval failed:", err);
      setCameraPermissionError("Denied camera access or secure iFrame context block. Please use the simulated capture panel below to test diagnostic recall lookup.");
      setIsScanning(false);
    }
  };

  const handleStopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsScanning(false);
    setIsQrScannerOpen(false);
  };

  const handleVerifyQrCode = (code: string) => {
    setScanResult(code);
    setIsScanning(false);
    
    // Stop real camera stream once successfully scanned
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }

    // Try to find matching vehicle profile in user's profile
    const matched = vehicles.find(v => 
      v.id.toLowerCase() === code.toLowerCase() || 
      code.toUpperCase().includes(v.brand.toUpperCase()) || 
      code.toUpperCase().includes(v.model.toUpperCase())
    ) || (vehicles.length > 0 ? vehicles[0] : null);

    if (matched) {
      setScannedVehicle(matched);
      onSelectVehicle(matched);
    }
  };

  // Ensure camera tracks stop on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  // Load backend expenses & papers on selection
  const fetchExpenses = async () => {
    setExpenseLoading(true);
    try {
      const response = await fetch("/api/expenses");
      if (response.ok) {
        const data = await response.json();
        setExpenses(data);
      }
    } catch (err) {
      console.error("Error loading expenses database:", err);
    } finally {
      setExpenseLoading(false);
    }
  };

  const fetchDocuments = async () => {
    setDocumentLoading(true);
    try {
      const response = await fetch("/api/documents");
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      }
    } catch (err) {
      console.error("Error loading papers database:", err);
    } finally {
      setDocumentLoading(false);
    }
  };

  const fetchTgStatus = async () => {
    try {
      const res = await fetch("/api/telegram/status");
      if (res.ok) {
        const payload = await res.json();
        const connected = payload.settings?.telegramConnected || false;
        const userName = payload.settings?.telegramUsername || "";
        const token = payload.settings?.verificationToken || "";
        
        setTgIsConnected(connected);
        setTgUserName(userName);
        if (connected) {
          setAppNotifSettings(prev => ({ ...prev, telegramEnabled: true }));
        }
        if (token) {
          setTgToken(token);
        }
        setTgFullStatus(payload);
      }
    } catch (e) {
      console.error("Error loading Telegram status:", e);
    }
  };

  // Fetch reminders and other models when active vehicle changes
  const fetchReminders = async () => {
    if (!selectedVehicle) return;
    setReminderLoading(true);
    try {
      const response = await fetch(`/api/reminders/${selectedVehicle.id}`);
      if (response.ok) {
        const data = await response.json();
        setReminders(data);
      }
    } catch (err) {
      console.error("Error fetching vehicle reminders:", err);
    } finally {
      setReminderLoading(false);
    }
  };

  const fetchPendingRequests = async () => {
    setPendingRequestsLoading(true);
    try {
      const response = await fetch("/api/owner/pending-records");
      if (response.ok) {
        const data = await response.json();
        setPendingRequests(data);
      }
    } catch (err) {
      console.error("Error loading pending service requests:", err);
    } finally {
      setPendingRequestsLoading(false);
    }
  };

  const fetchAppointments = async () => {
    setAppointmentsLoading(true);
    try {
      const response = await fetch("/api/owner/appointments");
      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      }
    } catch (err) {
      console.error("Error loading appointments:", err);
    } finally {
      setAppointmentsLoading(false);
    }
  };

  const fetchMonthlyChecklists = async () => {
    setMonthlyLoading(true);
    try {
      const response = await fetch("/api/owner/monthly-maintenance");
      if (response.ok) {
        const data = await response.json();
        setMonthlyChecklists(data);
      }
    } catch (err) {
      console.error("Error loading monthly checklist:", err);
    } finally {
      setMonthlyLoading(false);
    }
  };

  const fetchConnections = async () => {
    setConnectionsLoading(true);
    try {
      const response = await fetch("/api/owner/garage-connections");
      if (response.ok) {
        const data = await response.json();
        setConnections(data);
      }
    } catch (err) {
      console.error("Error loading connections:", err);
    } finally {
      setConnectionsLoading(false);
    }
  };

  const fetchScanHistory = async () => {
    if (!selectedVehicle) return;
    setScanHistoryLoading(true);
    try {
      const response = await fetch(`/api/vehicles/${selectedVehicle.id}/scan-logs`);
      if (response.ok) {
        const data = await response.json();
        setScanHistory(data);
      }
    } catch (err) {
      console.error("Error loading scan history:", err);
    } finally {
      setScanHistoryLoading(false);
    }
  };

  const simulatePartnerScan = async (garageId: string, garageName: string) => {
    if (!selectedVehicle) return;
    setSimulationLoading(true);
    try {
      const res = await fetch("/api/qr/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: selectedVehicle.qrSecureToken || `MCC-CAR-${selectedVehicle.id.toUpperCase()}`,
          scannedByGarageId: garageId,
          scannedByGarageName: garageName
        })
      });
      if (res.ok) {
        await fetchScanHistory();
      } else {
        alert("Failed to simulate professional QR scan.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSimulationLoading(false);
    }
  };

  const [quickLogging, setQuickLogging] = useState(false);
  const handleQuickLogService = async (category: string, desc: string, cost: number, mileage: number) => {
    if (!selectedVehicle) return;
    setQuickLogging(true);
    try {
      const response = await fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId: selectedVehicle.id,
          serviceCategory: category,
          description: desc,
          cost: cost,
          mileage: mileage,
          date: new Date().toISOString().split('T')[0],
          provider: "Self-logged Recommendation"
        })
      });
      if (response.ok) {
        alert(`Successfully logged "${category}" checkup in your history portfolio!`);
        window.location.reload();
      } else {
        alert("Failed to quick-log service.");
      }
    } catch (err) {
      console.error("Error quick logging service:", err);
    } finally {
      setQuickLogging(false);
    }
  };

  const triggerExportAction = () => {
    if (!selectedVehicle) return;
    
    const vehicleRecords = records.filter(r => r.vehicleId === selectedVehicle.id);
    const vehicleReminders = reminders.filter(r => r.vehicleId === selectedVehicle.id);
    
    let reportText = `====================================================\n`;
    reportText += `       CAMBODIAN CAR BLUEPRINT DOSSIER REPORT       \n`;
    reportText += `====================================================\n\n`;
    reportText += `Vehicle Profile:\n`;
    reportText += `  Brand Model:     ${selectedVehicle.brand} ${selectedVehicle.model} (${selectedVehicle.year})\n`;
    reportText += `  Plate Number:    ${selectedVehicle.plateNumber || 'N/A'}\n`;
    reportText += `  Nickname:        ${selectedVehicle.nickname || 'N/A'}\n`;
    reportText += `  Odometer Val:    ${selectedVehicle.mileage.toLocaleString()} km\n`;
    reportText += `  Combustion Class:${selectedVehicle.fuelType}\n`;
    if (selectedVehicle.chassisNumber) {
      reportText += `  Chassis Code:    ${selectedVehicle.chassisNumber}\n`;
    }
    reportText += `\n----------------------------------------------------\n`;
    reportText += `Registered Maintenance Logs / History Timeframe:\n`;
    reportText += `----------------------------------------------------\n`;
    
    if (vehicleRecords.length === 0) {
      reportText += `  No services logged to date.\n`;
    } else {
      vehicleRecords.forEach((rec, idx) => {
        reportText += `  [${idx + 1}] Date: ${rec.date}\n`;
        reportText += `      Category:    ${rec.serviceCategory}\n`;
        reportText += `      Provider:    ${rec.provider}\n`;
        reportText += `      Price:       $${rec.cost} USD\n`;
        reportText += `      Mileage:     ${rec.mileage.toLocaleString()} km\n`;
        reportText += `      Details:     "${rec.description}"\n\n`;
      });
    }
    
    reportText += `----------------------------------------------------\n`;
    reportText += `Active Safety Alarm Reminders:\n`;
    reportText += `----------------------------------------------------\n`;
    if (vehicleReminders.length === 0) {
      reportText += `  No active warnings or reminders set.\n`;
    } else {
      vehicleReminders.forEach((rem, idx) => {
        reportText += `  [${idx + 1}] Title: ${rem.title}\n`;
        reportText += `      Category:    ${rem.category}\n`;
        reportText += `      Due Date:    ${rem.dueDate || 'N/A'}\n`;
        reportText += `      Due Mileage: ${rem.dueMileage ? rem.dueMileage.toLocaleString() + ' km' : 'N/A'}\n`;
        reportText += `      Status:      ${rem.status}\n\n`;
      });
    }
    
    reportText += `\nGenerated dynamically on: ${new Date().toLocaleString()}\n`;
    reportText += `Export Node ID: ${selectedVehicle.id.toUpperCase()}\n`;
    reportText += `====================================================\n`;
    
    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `car_blueprint_${selectedVehicle.brand.toLowerCase()}_${selectedVehicle.model.toLowerCase()}_report.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleApproveRecord = async (id: string) => {
    try {
      const res = await fetch(`/api/owner/service-records/${id}/approve`, {
        method: "POST"
      });
      if (res.ok) {
        await fetchPendingRequests();
        alert("Service record successfully authorized and saved to your vehicle timeline!");
        window.location.reload(); // Quick refresh to sync both lists
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRequestCorrectionRecord = async (id: string, notes: string) => {
    await fetch(`/api/owner/service-records/${id}/request-correction`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes })
    });
    await fetchPendingRequests();
  };

  const handleDisputeRecord = async (id: string, reason: string) => {
    await fetch(`/api/owner/service-records/${id}/dispute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason })
    });
    await fetchPendingRequests();
  };

  const handleToggleMonthlyItem = async (checklistId: string, itemId: string, status: string, checkedBy: string) => {
    await fetch(`/api/owner/monthly-maintenance/${checklistId}/toggle-item`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, status, checkedBy })
    });
    await fetchMonthlyChecklists();
  };

  const handleCreateMonthlyChecklist = async (vehicleId: string, month: string, year: number, checklistItems: any[], notes: string) => {
    await fetch("/api/owner/monthly-maintenance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vehicleId, month, year, checklistItems, notes })
    });
    await fetchMonthlyChecklists();
  };

  const handleBookAppointment = async (fields: any) => {
    await fetch("/api/owner/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields)
    });
    await fetchAppointments();
  };

  const handleCancelAppointment = async (id: string) => {
    await fetch(`/api/owner/appointments/${id}`, {
      method: "DELETE"
    });
    await fetchAppointments();
  };

  const handleUpdateConnection = async (id: string, updatedFields: any) => {
    await fetch(`/api/owner/garage-connections/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedFields)
    });
    await fetchConnections();
  };

  const handleAddConnection = async (fields: any) => {
    await fetch("/api/owner/garage-connections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields)
    });
    await fetchConnections();
  };

  const handleDisconnectGarage = async (id: string) => {
    await fetch(`/api/owner/garage-connections/${id}`, {
      method: "DELETE"
    });
    await fetchConnections();
  };

  const handleRegenerateToken = async (id: string) => {
    const res = await fetch(`/api/vehicles/regenerate-qr/${id}`, {
      method: "POST"
    });
    return await res.json();
  };

  useEffect(() => {
    fetchExpenses();
    fetchDocuments();
    fetchTgStatus();
    fetchPendingRequests();
    fetchAppointments();
    fetchMonthlyChecklists();
    fetchConnections();
  }, []);

  // Real-time Multi-user collaborative synchronization (SSE)
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimeout: any = null;
    let active = true;
    
    const connectSSE = () => {
      if (!active) return;
      console.log("Connecting to Cambodian Garage real-time ticket sync stream...");
      eventSource = new EventSource("/api/realtime/stream");
      
      eventSource.onopen = () => {
        console.log("Real-time ticket connection successfully established with server.");
      };
      
      eventSource.addEventListener("scan_registered", (e: any) => {
        console.log("SSE scan_registered received:", e.data);
        fetchScanHistory();
      });
      
      eventSource.addEventListener("ticket_created", (e: any) => {
        console.log("SSE ticket_created received:", e.data);
        fetchPendingRequests();
      });
      
      eventSource.addEventListener("ticket_updated", (e: any) => {
        console.log("SSE ticket_updated received:", e.data);
        fetchPendingRequests();
        if (typeof setVehicles === "function") {
          fetch("/api/vehicles").then(res => res.json()).then(data => setVehicles(data)).catch(() => {});
        }
      });
      
      eventSource.addEventListener("partner_request_created", (e: any) => {
        console.log("SSE partner_request_created received:", e.data);
        fetchConnections();
      });

      eventSource.addEventListener("partner_request_updated", (e: any) => {
        console.log("SSE partner_request_updated received:", e.data);
        fetchConnections();
        fetchPendingRequests();
      });

      eventSource.onerror = (err) => {
        console.warn("SSE connection closed or timed out. Reconnecting in 5 seconds...");
        if (eventSource) {
          eventSource.close();
        }
        if (active) {
          clearTimeout(reconnectTimeout);
          reconnectTimeout = setTimeout(connectSSE, 5000);
        }
      };
    };
    
    connectSSE();
    
    return () => {
      active = false;
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [selectedVehicle]);

  useEffect(() => {
    if (selectedVehicle) {
      fetchReminders();
      fetchScanHistory();
      // Initialize edit fields
      setEditNickname(selectedVehicle.nickname || "");
      setEditPlateNumber(selectedVehicle.plateNumber || "");
      setEditVehicleType(selectedVehicle.vehicleType || "Sedan");
      setEditPurchaseDate(selectedVehicle.purchaseDate || "");
      setEditPurchasePrice(selectedVehicle.purchasePrice ? selectedVehicle.purchasePrice.toString() : "");
      setEditNotes(selectedVehicle.notes || "");
      setEditIsForSale(selectedVehicle.isForSale || false);
      setEditSalePrice(selectedVehicle.salePrice ? selectedVehicle.salePrice.toString() : "");
      setEditSaleDescription(selectedVehicle.saleDescription || "");
      setEditMarketplaceStatus(selectedVehicle.marketplaceStatus || "Not Listed");
      setAiInsights(null); // Clear insights for a fresh fetch experience

      // Reset vehicle-specific simulation and telemetry states to prevent cross-contamination
      setEvCurrentCharge(82);
      setEvIsCharging(false);
      setEvSimMileageOffset(0);
      setEvDiagScanActive(false);
      setEvDiagProgress(0);
      setEvDiagScanCompleted(false);
      setSim12VHealthScore(88);
      setSim12VVoltage(12.6);
      setSim12VCrankingV(10.4);
      setIs12VSimulating(false);
      setForceEvPreview(false);
    }
  }, [selectedVehicle, records]);

  useEffect(() => {
    if (selectedVehicle && activeSpecTab === 'qr_scan_history') {
      fetchScanHistory();
    }
  }, [selectedVehicle, activeSpecTab]);

  useEffect(() => {
    const handleTabChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setActiveSpecTab(customEvent.detail);
      }
    };
    window.addEventListener("changeDetailTab", handleTabChange);
    return () => {
      window.removeEventListener("changeDetailTab", handleTabChange);
    };
  }, []);

  // Compute calculated values
  const totalVehiclesCount = vehicles.length;

  const activeExpenses = expenses.filter(
    (e) => e.vehicleId === selectedVehicle?.id
  );

  const activeRecords = records.filter(
    (r) => r.vehicleId === selectedVehicle?.id
  );

  const activeDocuments = documents.filter(
    (d) => d.vehicleId === selectedVehicle?.id
  );

  // Dynamic monthly expense summing for active vehicle
  const currentMonthYearStr = new Date().toISOString().substring(0, 7); // "YYYY-MM"
  const monthlyExpenseSum = expenses
    .filter(e => e.date.substring(0, 7) === currentMonthYearStr)
    .reduce((accumulation, item) => accumulation + item.amount, 0) +
    records
    .filter(r => r.date.substring(0, 7) === currentMonthYearStr)
    .reduce((accumulation, item) => accumulation + item.cost, 0);

  // Total expense sum across all owned vehicles as request-compliant card
  const totalFuelSumAcrossAll = expenses
    .reduce((acc, rec) => acc + rec.amount, 0) +
    records.reduce((acc, rec) => acc + rec.cost, 0);

  // Reminders counting
  const upcomingRemindersCount = reminders.filter(r => r.status === 'Due soon' || r.status === 'Due today').length;
  const urgentAlertsCount = reminders.filter(r => r.status === 'Overdue' || r.priority === 'High' || r.priority === 'Emergency').length;

  // Health score evaluation (Starts at 100, drops by 15 for overdue and 5 for high priority alerts)
  const calculateHealthScore = () => {
    if (!selectedVehicle) return 100;
    let score = 100;
    reminders.forEach((r) => {
      if (r.status === 'Overdue') {
        score -= 20;
      } else if (r.status === 'Due soon') {
        score -= 5;
      }
    });
    return Math.max(30, score);
  };
  const healthScore = calculateHealthScore();

  // Helper status color mapping
  const getCategoryStatusPill = (category: string) => {
    const normCategory = category.toLowerCase().trim();
    const matched = reminders.find(r => {
      const serviceName = r.service ? r.service.toLowerCase().trim() : "";
      const reminderCategory = r.category ? r.category.toLowerCase().trim() : "";
      const titleName = r.title ? r.title.toLowerCase().trim() : "";

      return (
        serviceName === normCategory ||
        reminderCategory === normCategory ||
        titleName === normCategory ||
        serviceName.includes(normCategory) ||
        normCategory.includes(serviceName) ||
        reminderCategory.includes(normCategory) ||
        normCategory.includes(reminderCategory)
      );
    });

    const status = matched ? matched.status : 'Good';
    let bgClass = "bg-emerald-500/10 text-emerald-400 border-emerald-500/25";
    
    if (status === 'Overdue') {
      bgClass = "bg-rose-500/10 text-rose-400 border-rose-500/25";
    } else if (status === 'Due soon' || status === 'Due today') {
      bgClass = "bg-amber-400/10 text-amber-400 border-amber-400/25";
    }

    return (
      <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border font-bold ${bgClass}`}>
        {status}
      </span>
    );
  };

  // Connect Telegram verification logic
  const handleInitiateTelegram = async () => {
    setTgConnecting(true);
    try {
      const res = await fetch("/api/telegram/generate-token", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setTgToken(data.token);
        setTgLogAlert({
          type: "info",
          text: `Verification connection token ${data.token} generated successfully! Enter this in the Telegram chatbot simulation block.`
        });
        
        // Update the full telemetry DB
        await fetchTgStatus();
      }
    } catch (e) {
      console.error("Error creating telegram verification linkage ticket:", e);
    } finally {
      setTgConnecting(false);
    }
  };

  const handleUpdateGaragePermission = async (garageId: string, fields: any) => {
    try {
      const res = await fetch("/api/telegram/update-garage-permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ garageId, ...fields })
      });
      if (res.ok) {
        await fetchTgStatus();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleBlockGarage = async (garageId: string) => {
    try {
      const res = await fetch("/api/telegram/toggle-block-garage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ garageId })
      });
      if (res.ok) {
        await fetchTgStatus();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleReportSpamGarage = async (garageId: string) => {
    try {
      const res = await fetch("/api/telegram/report-spam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ garageId })
      });
      if (res.ok) {
        await fetchTgStatus();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendBotCommand = async (cmdText?: string) => {
    const textToSend = (cmdText || simulatedCommand).trim();
    if (!textToSend) return;
    
    // Append user message
    setSimulatedReplies(prev => [...prev, {
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString()
    }]);
    
    if (!cmdText) {
      setSimulatedCommand("");
    }
    
    try {
      const res = await fetch("/api/telegram/simulate-bot-command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToSend })
      });
      if (res.ok) {
        const data = await res.json();
        setSimulatedReplies(prev => [...prev, {
          sender: 'bot',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString()
        }]);
        
        // Reload statuses to reflect any connection linkages
        await fetchTgStatus();
      }
    } catch (err) {
      console.error("Simulation error:", err);
    }
  };

  const handleVerifyTelegramConnection = async () => {
    if (!tgToken) return;
    setTgConnecting(true);
    setTgLogAlert({ type: "info", text: "Querying robot state on Cambodia server..." });
    
    setTimeout(async () => {
      try {
        const payload = {
          telegramChatId: "@test_driver_chat",
          telegramUserName: tgUserName || "kheang_driver",
          connected: true
        };
        const response = await fetch("/api/telegram/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          setTgIsConnected(true);
          setTgUserName(payload.telegramUserName);
          setAppNotifSettings(prev => ({ ...prev, telegramEnabled: true }));
          setTgLogAlert({
            type: "success",
            text: `🎉 Successfully verified Connection! Chat node mapped with @${payload.telegramUserName}.`
          });
        }
      } catch (err) {
        setTgLogAlert({ type: "error", text: "Verify connection timeout. Check token entry." });
      } finally {
        setTgConnecting(false);
      }
    }, 1200);
  };

  // Update Vehicle Status
  const handleUpdateVehicleStatus = async (
    status: 'Active' | 'Inactive' | 'Under Repair' | 'Sold/Transferred' | 'Archived', 
    reason: string, 
    date: string, 
    note: string, 
    docName: string
  ) => {
    if (!selectedVehicle) return;
    try {
      const response = await fetch(`/api/vehicles/${selectedVehicle.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          statusReason: reason,
          statusDate: date,
          statusNote: note,
          statusDocUrl: docName,
          repairGarageName: status === 'Under Repair' ? repairGarageNameState : undefined,
          repairStatus: status === 'Under Repair' ? repairStatusState : undefined,
          repairEstCompletion: status === 'Under Repair' ? repairEstCompletionState : undefined,
          repairPendingInvoice: status === 'Under Repair' ? repairPendingInvoiceState : undefined
        })
      });

      if (response.ok) {
        const updatedVehicle = await response.json();
        onSelectVehicle(updatedVehicle);
        if (setVehicles) {
          setVehicles(prev => prev.map(v => v.id === updatedVehicle.id ? updatedVehicle : v));
        }
        setShowStatusUpdateModal(false);
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  // Transfer Ownership Initiate
  const handleTransferOwnership = async (
    target: string,
    date: string,
    price: string,
    note: string,
    type: 'Full History Transfer' | 'Partial History Transfer' | 'Vehicle Profile Only',
    docName: string,
    selectedRecs: string[]
  ) => {
    if (!selectedVehicle) return;
    try {
      const response = await fetch(`/api/vehicles/${selectedVehicle.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transferStatus: 'Pending',
          pendingTransferTarget: target,
          pendingTransferPrice: price ? Number(price) : undefined,
          pendingTransferDate: date,
          pendingTransferNote: note,
          pendingTransferType: type,
          pendingTransferSelectedRecords: selectedRecs,
          transferDocUrl: docName
        })
      });

      if (response.ok) {
        const updatedVehicle = await response.json();
        onSelectVehicle(updatedVehicle);
        if (setVehicles) {
          setVehicles(prev => prev.map(v => v.id === updatedVehicle.id ? updatedVehicle : v));
        }
        setShowTransferModal(false);
      }
    } catch (err) {
      console.error("Error initiating transfer:", err);
    }
  };

  // Cancel Pending Transfer
  const handleCancelTransfer = async () => {
    if (!selectedVehicle) return;
    try {
      const response = await fetch(`/api/vehicles/${selectedVehicle.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transferStatus: 'None',
          pendingTransferTarget: undefined,
          pendingTransferPrice: undefined,
          pendingTransferDate: undefined,
          pendingTransferNote: undefined,
          pendingTransferType: undefined,
          pendingTransferSelectedRecords: undefined
        })
      });

      if (response.ok) {
        const updatedVehicle = await response.json();
        onSelectVehicle(updatedVehicle);
        if (setVehicles) {
          setVehicles(prev => prev.map(v => v.id === updatedVehicle.id ? updatedVehicle : v));
        }
      }
    } catch (err) {
      console.error("Error cancelling transfer:", err);
    }
  };

  // Accept incoming transfer request
  const handleAcceptTransferRequest = async (request: any) => {
    const newVehicleId = `v-${Date.now()}`;
    const newVehicle: VehicleProfile = {
      id: newVehicleId,
      brand: request.vehicleBrand,
      model: request.vehicleModel,
      year: request.vehicleYear,
      plateNumber: request.plateNumber || "PP-2X-4505",
      mileage: 121000,
      fuelType: "Gasoline",
      owner: "Yeon Pisith",
      status: "Active",
      previousOwners: [
        {
          ownerName: request.fromOwner,
          ownershipPeriod: `Until ${request.transferDate}`,
          price: request.sellingPrice,
          transferDate: request.transferDate,
          note: request.note
        }
      ]
    };

    try {
      const response = await fetch(`/api/vehicles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newVehicle)
      });

      if (response.ok) {
        const added = await response.json();
        if (setVehicles) {
          setVehicles(prev => [...prev, added]);
        }
        onSelectVehicle(added);
        setIncomingTransfers(prev => prev.filter(t => t.id !== request.id));
      }
    } catch (err) {
      console.error("Error accepting transfer:", err);
    }
  };

  const handleRejectTransferRequest = (reqId: string) => {
    setIncomingTransfers(prev => prev.filter(t => t.id !== reqId));
  };

  // Edit Vehicle properties submission
  const handleSubmitVehicleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle) return;
    setSavingVehicle(true);

    try {
      const response = await fetch(`/api/vehicles/${selectedVehicle.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname: editNickname,
          plateNumber: editPlateNumber,
          vehicleType: editVehicleType,
          purchaseDate: editPurchaseDate,
          purchasePrice: editPurchasePrice ? Number(editPurchasePrice) : null,
          notes: editNotes,
          isForSale: editIsForSale,
          salePrice: editSalePrice ? Number(editSalePrice) : null,
          saleDescription: editSaleDescription,
          marketplaceStatus: editMarketplaceStatus
        })
      });

      if (response.ok) {
        const updatedVehicle = await response.json();
        onSelectVehicle(updatedVehicle);
        setIsEditingVehicle(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingVehicle(false);
    }
  };

  // Edit Expense track action
  const handleAddExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle || !expAmount) return;
    setExpenseLoading(true);

    try {
      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId: selectedVehicle.id,
          category: expCategory,
          amount: Number(expAmount),
          date: expDate,
          mileage: expMileage ? Number(expMileage) : null,
          provider: expProvider,
          paymentMethod: expPaymentMethod,
          notes: expNotes
        })
      });

      if (response.ok) {
        await fetchExpenses();
        // Update current mileage if new mileage exceeds existing odometer
        if (expMileage && Number(expMileage) > selectedVehicle.mileage) {
          selectedVehicle.mileage = Number(expMileage);
        }
        // Reset form
        setExpAmount("");
        setExpNotes("");
        setExpProvider("");
        setExpMileage("");
        setShowAddExpensePanel(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setExpenseLoading(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this expense history log?")) return;
    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: "DELETE"
      });
      if (response.ok) {
        await fetchExpenses();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Add custom reminder scheduling
  const handleAddReminderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle || !remTitle) return;
    setRemSaving(true);

    try {
      const response = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId: selectedVehicle.id,
          title: remTitle,
          category: remCategory,
          reminderType: remType,
          dueDate: remDueDate || null,
          dueMileage: remDueMileage ? Number(remDueMileage) : null,
          repeatType: remRepeatType,
          description: remNotes,
          priority: remPriority
        })
      });

      if (response.ok) {
        await fetchReminders();
        // Reset Custom Reminder fields
        setRemTitle("");
        setRemDueDate("");
        setRemDueMileage("");
        setRemNotes("");
        setShowAddReminderPanel(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRemSaving(false);
    }
  };

  // Complete / Snooze interactive mechanics
  const handleCompleteReminder = async (id: string) => {
    try {
      const response = await fetch(`/api/reminders/${id}/complete`, {
        method: "POST"
      });
      if (response.ok) {
        await fetchReminders();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSnoozeReminder = async (id: string) => {
    try {
      const response = await fetch(`/api/reminders/${id}/snooze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days: 30 }) // snooze for 30 days
      });
      if (response.ok) {
        await fetchReminders();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Upload custom vehicle attachment paper
  const handleAddDocSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle || !docTitle || !docFileName) return;
    setDocSaving(true);

    try {
      const response = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId: selectedVehicle.id,
          category: docCategory,
          title: docTitle,
          fileName: docFileName,
          fileSize: `${(0.5 + Math.random() * 2.5).toFixed(1)} MB`
        })
      });

      if (response.ok) {
        await fetchDocuments();
        setDocTitle("");
        setDocFileName("");
        setShowAddDocModal(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDocSaving(false);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (!window.confirm("Remove this document from your vehicle wallet?")) return;
    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: "DELETE"
      });
      if (response.ok) {
        await fetchDocuments();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Dynamic AI Adviser trigger
  const handleTriggerAiInsights = async () => {
    if (!selectedVehicle) return;
    setAiLoading(true);

    try {
      const response = await fetch("/api/ai/driver-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicleId: selectedVehicle.id })
      });

      if (response.ok) {
        const data = await response.json();
        setAiInsights(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  // Standard interactive mock configs save
  const handleSaveNotificationSettings = () => {
    setSettingsStatusMessage("Saving preferences state on workspace router...");
    setTimeout(() => {
      setSettingsStatusMessage("✅ Preferences saved securely. Driver triggers synced with backend.");
      setTimeout(() => setSettingsStatusMessage(""), 4000);
    }, 1000);
  };

  // Render Category Spent SVG graph
  const renderSVGSpendGraph = () => {
    if (activeExpenses.length === 0) {
      return (
        <div className="h-40 flex items-center justify-center text-slate-500 text-xs">
          Fuel logs and invoices will automatically populate spending distributions.
        </div>
      );
    }

    // Grouping category spend
    const spendMap: Record<string, number> = {};
    activeExpenses.forEach(e => {
      spendMap[e.category] = (spendMap[e.category] || 0) + e.amount;
    });

    const entries = Object.entries(spendMap).sort((a, b) => b[1] - a[1]);
    const maxVal = Math.max(...entries.map(e => e[1]), 1);

    return (
      <div className="space-y-3.5 pt-2">
        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Expenditure Category Allocation</h4>
        {entries.map(([category, amt]) => {
          const ratio = (amt / maxVal) * 100;
          return (
            <div key={category} className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium">{category}</span>
                <span className="font-mono text-sky-400 font-semibold">${amt.toLocaleString()} USD</span>
              </div>
              <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="bg-gradient-to-r from-sky-400 to-indigo-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${ratio}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Dynamic welcome header with vehicle select overview strip */}
      <div className="relative">
        <div className="absolute right-0 top-0 w-80 h-40 bg-sky-500/10 rounded-full blur-3xl pointer-events-none select-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-sky-400 text-xs font-bold uppercase tracking-wider">
              <Activity className="w-4 h-4 text-sky-400 animate-pulse" />
              <span>DRIVER CORE HUB</span>
            </div>
            <h1 className="text-2xl font-black text-slate-100 tracking-tight">
              {selectedVehicle ? `${selectedVehicle.brand} ${selectedVehicle.model}` : "My Fleet Dashboard"}
            </h1>
            <p className="text-slate-400 text-xs mt-0.5">
              Manage telemetry parameters, expense invoices, attachment docs, and retrieve Gemini diagnostics.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onAddVehicle}
              className="p-3 bg-sky-500 hover:bg-sky-600 text-slate-900 rounded-2xl flex items-center justify-center gap-1.5 font-bold text-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Register Car</span>
            </button>
          </div>
        </div>

        {/* Dynamic active vehicle selectors */}
        {vehicles.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto py-3 no-scrollbar border-b border-white/10 mt-2">
            {vehicles.map((v) => (
              <button
                key={v.id}
                onClick={() => onSelectVehicle(v)}
                className={`flex-shrink-0 p-3 px-4 rounded-xl border text-left transition ${
                  selectedVehicle?.id === v.id
                    ? "bg-white/10 border-white/20 select-none"
                    : "bg-transparent border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-sky-400" />
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">
                      {v.nickname || `${v.brand} ${v.model}`}
                    </span>
                    <span className="text-[9px] text-slate-500 block font-mono">
                      {v.plateNumber ? `${v.plateNumber}` : `${v.year}`} • {v.mileage.toLocaleString()} km
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {vehicles.length === 0 ? (
        <div className="glass rounded-3xl p-12 text-center max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 bg-white/5 text-slate-400 rounded-2xl flex items-center justify-center mx-auto border border-white/10">
            <Car className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-100">No Vehicles Registered</h3>
            <p className="text-slate-400 text-sm">
              Register your vehicle model and year to calculate personalized maintenance parameters and generate custom AI reports.
            </p>
          </div>
          <button
            onClick={onAddVehicle}
            className="px-5 py-2.5 bg-sky-500 text-slate-900 rounded-xl font-medium text-sm hover:bg-sky-600 transition shadow-md cursor-pointer"
          >
            Create Your First Profile
          </button>
        </div>
      ) : (
        <>
          {/* Driver Sub-Tabs Horizontal Navigation Strip */}
          <div className="flex border-b border-white/15 select-none overflow-x-auto no-scrollbar gap-2">
            {[
              { id: 'overview', label: 'Overview', icon: <Car className="w-3.5 h-3.5" /> },
              { id: 'vehicles', label: 'My Vehicles', icon: <Wrench className="w-3.5 h-3.5" /> },
              { id: 'expenses', label: 'Expenses & Reports', icon: <DollarSign className="w-3.5 h-3.5" /> },
              { id: 'reminders', label: 'Reminders', icon: <Calendar className="w-3.5 h-3.5" /> },
              { id: 'documents', label: 'Document Wallet', icon: <FileText className="w-3.5 h-3.5" /> },
              { id: 'ai', label: 'AI Diagnosis Insights', icon: <Brain className="w-3.5 h-3.5" /> },
              { id: 'settings', label: 'Notifications', icon: <Bell className="w-3.5 h-3.5" /> },
              { id: 'telegram', label: 'Telegram Integration', icon: <MessageSquare className="w-3.5 h-3.5" /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveSubTab(tab.id as any);
                  setTgLogAlert(null);
                  setSettingsStatusMessage("");
                }}
                className={`pb-3 px-4 font-bold text-xs flex items-center gap-1.5 border-b-2 transition ${
                  activeSubTab === tab.id
                    ? "border-sky-400 text-sky-400"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>


          {/* Dashboard Level Offline Sync Pending Log Notification Banner */}
          {records.filter(r => (r as any).isPending).length > 0 && (
            <div className="p-4 bg-gradient-to-r from-yellow-500/10 via-yellow-500/5 to-transparent border border-yellow-500/20 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg mt-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-yellow-500/10 text-yellow-400 border border-yellow-500/25 rounded-xl shrink-0">
                  <Wrench className="w-5 h-5 animate-spin" style={{ animationDuration: '4s' }} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-yellow-400 uppercase tracking-wider leading-none">Offline Queue Active</h4>
                  <p className="text-[11px] text-slate-350 mt-1.5 leading-normal max-w-2xl">
                    You have <strong className="text-yellow-400 font-mono text-xs">{records.filter(r => (r as any).isPending).length} pending service logs</strong> stored locally in browser storage. These logs are actively visible in lists and charts but will automatically sync and upload to the secure server database once internet connectivity is re-established.
                  </p>
                </div>
              </div>
              <div className="text-[10px] text-yellow-400 border border-yellow-500/30 bg-yellow-500/5 px-2.5 py-1 rounded-lg font-bold font-mono tracking-wide self-end sm:self-center">
                Waiting for server...
              </div>
            </div>
          )}

          {/* Subscreen: Tab 1: OVERVIEW */}
          {activeSubTab === 'overview' && (
            <div className="space-y-6">
              {/* Bento Grid Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass p-4 rounded-2xl flex flex-col justify-between space-y-3 shadow-md">
                  <div className="flex justify-between items-center text-slate-500">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Garaged Fleet</span>
                    <div className="p-1.5 bg-sky-500/10 rounded-lg text-sky-400"><Car className="w-4 h-4" /></div>
                  </div>
                  <div>
                    <span className="text-xl font-bold text-slate-150 font-mono block leading-none">{totalVehiclesCount}</span>
                    <span className="text-[10px] text-slate-500 block mt-1">Vehicles configured</span>
                  </div>
                </div>

                <div className="glass p-4 rounded-2xl flex flex-col justify-between space-y-3 shadow-md">
                  <div className="flex justify-between items-center text-slate-500">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Monthly Outflow</span>
                    <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-400"><DollarSign className="w-4 h-4" /></div>
                  </div>
                  <div>
                    <span className="text-xl font-bold text-slate-150 font-mono block leading-none">${monthlyExpenseSum}</span>
                    <span className="text-[10px] text-slate-500 block mt-1">Odometer & log costs</span>
                  </div>
                </div>

                <div className="glass p-4 rounded-2xl flex flex-col justify-between space-y-3 shadow-md">
                  <div className="flex justify-between items-center text-slate-500">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Active Reminders</span>
                    <div className="p-1.5 bg-amber-500/10 rounded-lg text-amber-500"><Calendar className="w-4 h-4" /></div>
                  </div>
                  <div>
                    <span className="text-xl font-bold text-slate-150 font-mono block leading-none">{upcomingRemindersCount}</span>
                    <span className="text-[10px] text-slate-500 block mt-1">Schedules due soon</span>
                  </div>
                </div>

                <div className="glass p-4 rounded-2xl flex flex-col justify-between space-y-3 shadow-md">
                  <div className="flex justify-between items-center text-slate-500">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Vehicle Health</span>
                    <div className="p-1.5 bg-rose-500/10 rounded-lg text-rose-500"><Activity className="w-4 h-4" /></div>
                  </div>
                  <div>
                    <span className={`text-xl font-bold font-mono block leading-none ${
                      healthScore > 80 ? 'text-emerald-400' : healthScore > 60 ? 'text-amber-400' : 'text-rose-450'
                    }`}>
                      {healthScore}%
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">Calculated integrity index</span>
                  </div>
                </div>
              </div>

              {/* INTERACTIVE EV BATTERY HEALTH & LIVE CHARGE MONITOR COMPONENT */}
              {selectedVehicle && hasEvBatteryAndCharging(selectedVehicle) && (
                <div id="ev-battery-health-indicator" className="glass p-5 rounded-2xl border border-white/5 space-y-5 shadow-lg bg-slate-900/40 relative overflow-hidden backdrop-blur-md">
                  {/* Background decorative pulsing light */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none animate-pulse"></div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-slate-100 tracking-tight flex items-center gap-2">
                        <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
                          <BatteryCharging className="w-4 h-4 text-emerald-400" />
                        </div>
                        <span>EV/Hybrid Battery Health & Live Charge Monitor</span>
                      </h3>
                      <p className="text-slate-400 text-[11px] leading-normal max-w-xl">
                        Real-time BMS (Battery Management System) telemetry, active charge load sliders, and dynamic mileage degradation curves calibrated for the Cambodian climate.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {selectedVehicle?.fuelType === 'EV' ? (
                        <span className="px-2 py-1 text-[9px] font-black uppercase tracking-wider rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                          EV Active
                        </span>
                      ) : selectedVehicle?.fuelType === 'Hybrid' ? (
                        <span className="px-2 py-1 text-[9px] font-black uppercase tracking-wider rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                          Hybrid Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-[9px] font-black uppercase tracking-wider rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
                          <span>Simulated EV Model ({selectedVehicle ? `${selectedVehicle.brand} ${selectedVehicle.model}` : "Standard Pack"})</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                    {/* LEFT COLUMN: LIVE STATE OF CHARGE (SOC) MONITOR & CURRENT RANGE */}
                    <div className="p-4 bg-slate-950/40 border border-white/5 rounded-xl flex flex-col justify-between space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">State of Charge (SOC)</span>
                        <span className="text-[10px] font-mono text-slate-500">BMS PACK TELEMETRY</span>
                      </div>

                      <div className="flex items-center gap-5">
                        {/* Interactive Battery Cell Visualizer */}
                        <div className="relative flex-1 flex items-center h-24 bg-slate-950 rounded-xl border border-white/5 p-2 overflow-hidden">
                          {/* Segmented Battery Fill */}
                          <div 
                            className="h-full rounded-lg transition-all duration-500 ease-out flex items-center justify-end pr-3"
                            style={{ 
                              width: `${evCurrentCharge}%`, 
                              background: evCurrentCharge > 40 
                                ? 'linear-gradient(90deg, rgba(16,185,129,0.15) 0%, rgba(16,185,129,0.3) 100%)' 
                                : evCurrentCharge > 20 
                                  ? 'linear-gradient(90deg, rgba(245,158,11,0.15) 0%, rgba(245,158,11,0.3) 100%)' 
                                  : 'linear-gradient(90deg, rgba(244,63,94,0.15) 0%, rgba(244,63,94,0.3) 100%)',
                              borderRight: `2px solid ${evCurrentCharge > 40 ? '#10b981' : evCurrentCharge > 20 ? '#f59e0b' : '#f43f5e'}`
                            }}
                          >
                            {evIsCharging && (
                              <Zap className="w-4 h-4 text-emerald-400 animate-pulse" />
                            )}
                          </div>

                          {/* Centered Overlay Percentage */}
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                            <span className="text-3xl font-black font-mono text-slate-100 leading-none">
                              {evCurrentCharge}%
                            </span>
                            <span className="text-[9px] text-slate-400 font-bold tracking-tight uppercase mt-1">
                              {evIsCharging ? "Fast Charging Active" : "Discharging (Aux Standard)"}
                            </span>
                          </div>
                        </div>

                        {/* Display Range Figure */}
                        <div className="text-left py-1">
                          <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider">Est. Driving Range</span>
                          <span className="text-2xl font-black font-mono text-emerald-400 leading-none">
                            {Math.round(evCurrentCharge * (selectedVehicle?.evDrivingRange ? selectedVehicle.evDrivingRange / 100 : 4.5))} km
                          </span>
                          <span className="text-[9px] text-slate-400 block mt-1">
                            Max: {selectedVehicle?.evDrivingRange || 450} km at 100%
                          </span>
                        </div>
                      </div>

                      {/* Interactive Slider Control */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-[10px] font-bold">
                          <label htmlFor="charge-range-slider" className="text-slate-400">Adjust Simulated Charge State</label>
                          <span className="text-emerald-400 font-mono">{evCurrentCharge}%</span>
                        </div>
                        <input 
                          id="charge-range-slider"
                          type="range" 
                          min="0" 
                          max="100" 
                          value={evCurrentCharge}
                          onChange={(e) => setEvCurrentCharge(parseInt(e.target.value))}
                          className="w-full accent-emerald-500 h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer border border-white/5"
                        />
                      </div>

                      {/* Charging Switch and Info */}
                      <div className="flex items-center justify-between pt-1 border-t border-white/5">
                        <button
                          onClick={() => setEvIsCharging(!evIsCharging)}
                          className={`p-2 px-3.5 text-[10px] uppercase font-bold rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                            evIsCharging 
                              ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.2)]"
                              : "bg-slate-950/40 border-white/5 text-slate-400 hover:text-white"
                          }`}
                        >
                          <Zap className={`w-3.5 h-3.5 ${evIsCharging ? "animate-bounce" : ""}`} />
                          <span>{evIsCharging ? "Plugged in (Charging)" : "Connect Charger"}</span>
                        </button>

                        {evIsCharging && (
                          <div className="text-right leading-tight">
                            <span className="text-[9px] text-emerald-400 font-mono font-bold block">DC FAST: 45.8 kW Input</span>
                            <span className="text-[8px] text-slate-500 font-mono">390V / 117A • Temp: 32.4°C</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* RIGHT COLUMN: MILEAGE DEGRADATION & STATE OF HEALTH (SOH) ESTIMATOR */}
                    <div className="p-4 bg-slate-950/40 border border-white/5 rounded-xl flex flex-col justify-between space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Traction SOH & Degradation</span>
                        <span className="text-[9px] text-slate-500 font-mono font-bold">CALIBRATED COUPLING MODEL</span>
                      </div>

                      {/* Primary metrics row */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-950/50 p-2.5 rounded-xl border border-white/5 leading-tight">
                          <span className="text-[9px] text-slate-500 font-bold block uppercase">State of Health (SOH)</span>
                          <span className="text-xl font-black font-mono text-slate-100 block mt-0.5">
                            {batteryHealthData ? batteryHealthData.calculatedSOH : "92.0"}%
                          </span>
                          <span className={`text-[8.5px] font-semibold uppercase block mt-1 ${
                            !batteryHealthData ? "text-emerald-400" :
                            batteryHealthData.calculatedSOH >= 88 ? "text-emerald-400" :
                            batteryHealthData.calculatedSOH >= 78 ? "text-amber-400" : "text-rose-400"
                          }`}>
                            {batteryHealthData ? batteryHealthData.healthReport : "Healthy Status"}
                          </span>
                        </div>

                        <div className="bg-slate-950/50 p-2.5 rounded-xl border border-white/5 leading-tight">
                          <span className="text-[9px] text-slate-500 font-bold block uppercase">Battery Degradation</span>
                          <span className="text-xl font-black font-mono text-rose-400 block mt-0.5">
                            {batteryHealthData ? (100 - batteryHealthData.calculatedSOH).toFixed(1) : "8.0"}%
                          </span>
                          <span className="text-[8.5px] text-slate-400 block mt-1">
                            Total capacity loss estimate
                          </span>
                        </div>
                      </div>

                      {/* Degradation Breakdown List */}
                      <div className="space-y-1.5 text-[10.5px]">
                        <div className="flex justify-between items-center text-slate-400">
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-sky-400 rounded-full"></span>
                            <span>Cyclic Mileage Wear:</span>
                          </span>
                          <span className="font-mono text-slate-200">
                            {selectedVehicle ? ((selectedVehicle.mileage + evSimMileageOffset) * 0.00015).toFixed(2) : "0.00"}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-slate-400">
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>
                            <span>Calendar Age Wear (1.8%/yr):</span>
                          </span>
                          <span className="font-mono text-slate-200">
                            {selectedVehicle ? (Math.max(1, 2026 - selectedVehicle.year) * 1.8).toFixed(1) : "3.6"}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-slate-400">
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse"></span>
                            <span>Phnom Penh Hot Climate Penalty:</span>
                          </span>
                          <span className="font-mono text-amber-300">
                            +1.2% (Tropical thermal factor)
                          </span>
                        </div>
                      </div>

                      {/* Simulation Controllers */}
                      <div className="flex flex-wrap items-center gap-2 pt-1.5 border-t border-white/5">
                        <span className="text-[9px] font-bold text-slate-500 uppercase block mr-1">Simulation:</span>
                        <button
                          onClick={() => setEvSimMileageOffset(prev => prev + 10000)}
                          className="px-2.5 py-1 text-[9.5px] font-bold bg-white/5 hover:bg-white/10 text-slate-300 rounded border border-white/5 transition cursor-pointer"
                        >
                          Drive +10k km
                        </button>
                        <button
                          onClick={() => setEvSimMileageOffset(prev => prev + 25000)}
                          className="px-2.5 py-1 text-[9.5px] font-bold bg-white/5 hover:bg-white/10 text-slate-300 rounded border border-white/5 transition cursor-pointer"
                        >
                          Drive +25k km
                        </button>
                        {(evSimMileageOffset > 0 || evDiagScanCompleted) && (
                          <button
                            onClick={() => {
                              setEvSimMileageOffset(0);
                              setEvDiagScanCompleted(false);
                              setEvDiagProgress(0);
                            }}
                            className="px-2.5 py-1 text-[9.5px] font-bold bg-rose-500/10 hover:bg-rose-500/15 text-rose-300 rounded border border-rose-500/20 transition cursor-pointer flex items-center gap-1 ml-auto"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Reset</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* BOTTOM ACTION: DEEP DIAGNOSTIC SCANNER TRIGGER */}
                  <div className="p-3 bg-slate-950/20 border border-white/5 rounded-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Thermometer className="w-4 h-4 text-amber-500" />
                        <div>
                          <span className="text-[10px] font-bold text-slate-300 block">BMS Calibration & Thermal Checkup</span>
                          <p className="text-[9.5px] text-slate-500">Continuous load cell balancing protects the pack integrity from Phnom Penh thermal stress.</p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setEvDiagScanActive(true);
                          setEvDiagScanCompleted(false);
                        }}
                        disabled={evDiagScanActive}
                        className={`p-2 px-4 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                          evDiagScanActive
                            ? "bg-slate-950 text-slate-500 border border-white/5 cursor-not-allowed"
                            : "bg-emerald-500 text-slate-950 hover:bg-emerald-600 shadow-[0_0_12px_rgba(16,185,129,0.25)]"
                        }`}
                      >
                        {evDiagScanActive ? (
                          <>
                            <div className="w-3 h-3 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></div>
                            <span>Scanning Pack ({evDiagProgress}%)</span>
                          </>
                        ) : (
                          <>
                            <Activity className="w-3.5 h-3.5" />
                            <span>Trigger Deep Diagnostics Scan</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Progressive Calibration scan output */}
                    {evDiagScanActive && (
                      <div className="mt-3 space-y-1.5 animate-pulse">
                        <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full rounded-full transition-all duration-150" style={{ width: `${evDiagProgress}%` }}></div>
                        </div>
                        <span className="text-[9px] font-mono text-slate-500 block">
                          {evDiagProgress < 30 ? "⚡ Accessing cell state registers..." :
                           evDiagProgress < 65 ? "⚡ Measuring cell voltage differentials..." :
                           evDiagProgress < 90 ? "⚡ Calibrating coolant flow parameters..." :
                           "⚡ Finalizing State of Health computation..."}
                        </span>
                      </div>
                    )}

                    {/* Scanned results */}
                    {evDiagScanCompleted && !evDiagScanActive && (
                      <div className="mt-3 p-3 bg-emerald-500/5 border border-emerald-500/15 rounded-xl space-y-2 animate-fade-in text-[10.5px]">
                        <div className="flex items-center gap-1 font-bold text-emerald-400">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Diagnostics Completed Successfully</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-300 font-mono text-[9.5px]">
                          <div>
                            <span className="text-slate-500 block">MAX CELL DELTA</span>
                            <span className="text-slate-200 font-bold">8.4 mV (Optimal)</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">CELL TEMPERATURE</span>
                            <span className="text-slate-200 font-bold">31.8 °C (Safe)</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">COOLING SYSTEM FLOW</span>
                            <span className="text-slate-200 font-bold">98% (Active Liquid)</span>
                          </div>
                          <div>
                            <span className="text-slate-200 font-bold">INTERNAL RESISTANCE</span>
                            <span className="text-slate-200 font-bold">1.25 mΩ (Healthy)</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Quick Actions Panel */}
              <div className="glass p-5 rounded-2xl space-y-3 shadow-md border border-white/5">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-sky-400" />
                  <span>Quick Action Deck</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 pt-1">
                  <button onClick={onAddVehicle} className="p-3 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 rounded-xl space-y-1.5 text-center flex flex-col items-center justify-center transition group">
                    <Car className="w-5 h-5 text-sky-400 group-hover:scale-110 transition" />
                    <span className="text-[10px] font-bold">Add Vehicle</span>
                  </button>
                  <button 
                    onClick={() => {
                      setIsQrScannerOpen(true);
                      handleStartCamera();
                    }} 
                    className="p-3 bg-rose-500/10 hover:bg-rose-500/15 text-rose-350 border border-rose-500/20 rounded-xl space-y-1.5 text-center flex flex-col items-center justify-center transition group relative overflow-hidden"
                  >
                    <div className="absolute top-1 right-1 flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500"></span>
                    </div>
                    <QrCode className="w-5 h-5 text-rose-450 group-hover:scale-110 transition" />
                    <span className="text-[10px] font-bold">Scan Vehicle QR</span>
                  </button>
                  <button onClick={() => { setActiveSubTab('expenses'); setShowAddExpensePanel(true); }} className="p-3 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 rounded-xl space-y-1.5 text-center flex flex-col items-center justify-center transition group">
                    <DollarSign className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition" />
                    <span className="text-[10px] font-bold">Add Expense</span>
                  </button>
                  {selectedVehicle && isPureEV(selectedVehicle) ? (
                    <button onClick={() => { setActiveSubTab('expenses'); setShowAddExpensePanel(true); setExpCategory('Other'); }} className="p-3 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 rounded-xl space-y-1.5 text-center flex flex-col items-center justify-center transition group">
                      <Zap className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition" />
                      <span className="text-[10px] font-bold">Add Charge Log</span>
                    </button>
                  ) : (
                    <button onClick={() => { setActiveSubTab('expenses'); setShowAddExpensePanel(true); setExpCategory('Fuel'); }} className="p-3 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 rounded-xl space-y-1.5 text-center flex flex-col items-center justify-center transition group">
                      <FlameKindling className="w-5 h-5 text-amber-500 group-hover:scale-110 transition" />
                      <span className="text-[10px] font-bold">Add Fuel Log</span>
                    </button>
                  )}
                  <button onClick={onAddRecord} className="p-3 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 rounded-xl space-y-1.5 text-center flex flex-col items-center justify-center transition group">
                    <Wrench className="w-5 h-5 text-blue-400 group-hover:scale-110 transition" />
                    <span className="text-[10px] font-bold">Log Maintenance</span>
                  </button>
                  <button 
                    onClick={downloadServiceHistoryCsv} 
                    disabled={!selectedVehicle || records.filter(r => r.vehicleId === selectedVehicle.id).length === 0}
                    className={`p-3 rounded-xl space-y-1.5 text-center flex flex-col items-center justify-center transition group cursor-pointer ${
                      selectedVehicle && records.filter(r => r.vehicleId === selectedVehicle.id).length > 0
                        ? "bg-indigo-500/10 hover:bg-indigo-500/15 text-indigo-300 border border-indigo-500/20"
                        : "bg-white/5 opacity-40 text-slate-500 border border-white/5 cursor-not-allowed"
                    }`}
                    title={!selectedVehicle ? "Select a vehicle first" : records.filter(r => r.vehicleId === selectedVehicle.id).length === 0 ? "No records to export" : "Download service history CSV"}
                  >
                    <Download className={`w-5 h-5 ${selectedVehicle && records.filter(r => r.vehicleId === selectedVehicle.id).length > 0 ? "text-indigo-400 group-hover:scale-110" : "text-slate-500"} transition`} />
                    <span className="text-[10px] font-bold">Export CSV</span>
                  </button>
                  <button onClick={() => setActiveSubTab('expenses')} className="p-3 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 rounded-xl space-y-1.5 text-center flex flex-col items-center justify-center transition group">
                    <TrendingUp className="w-5 h-5 text-pink-400 group-hover:scale-110 transition" />
                    <span className="text-[10px] font-bold">View Report</span>
                  </button>
                  <button onClick={() => setActiveSubTab('settings')} className="p-3 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 rounded-xl space-y-1.5 text-center flex flex-col items-center justify-center transition group">
                    <QrCode className="w-5 h-5 text-violet-400 group-hover:scale-110 transition" />
                    <span className="text-[10px] font-bold">My QR Code</span>
                  </button>
                  <button 
                    onClick={() => {
                      if (onNavigateTab && selectedVehicle) {
                        (window as any).__sellVehiclePreFill = selectedVehicle;
                        onNavigateTab("classifieds");
                        setTimeout(() => {
                          window.dispatchEvent(new CustomEvent("sellVehiclePreFill", { detail: selectedVehicle }));
                        }, 100);
                      }
                    }} 
                    className="p-3 bg-amber-500/10 hover:bg-amber-500/15 text-amber-300 border border-amber-500/20 rounded-xl space-y-1.5 text-center flex flex-col items-center justify-center transition group relative overflow-hidden cursor-pointer"
                  >
                    <div className="absolute top-1 right-1 flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
                    </div>
                    <Tag className="w-5 h-5 text-amber-500 group-hover:scale-110 transition animate-bounce" />
                    <span className="text-[10px] font-black">Sell This Vehicle</span>
                  </button>
                  {onNavigateTab && (
                    <button 
                      onClick={() => onNavigateTab("fix_my_car_bidding")}
                      className="p-3 bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-350 border border-emerald-500/20 rounded-xl space-y-1.5 text-center flex flex-col items-center justify-center transition group relative overflow-hidden"
                    >
                      <div className="absolute top-1 right-1 flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                      </div>
                      <Wrench className="w-5 h-5 text-emerald-350 group-hover:scale-110 transition" />
                      <span className="text-[10px] font-black text-emerald-400">Fix My Car Bids</span>
                    </button>
                  )}
                </div>
              </div>

              {/* INTEGRATED QR CODE CAMERA SCANNING CONSOLE */}
              {isQrScannerOpen && (
                <div className="bg-slate-950/80 border border-rose-500/25 rounded-3xl p-6 space-y-5 shadow-2xl relative overflow-hidden backdrop-blur-xl animate-fade-in">
                  <div className="absolute right-0 top-0 text-rose-500/5 translate-x-1/4 -translate-y-1/4 pointer-events-none">
                    <QrCode className="w-72 h-72 stroke-[0.2]" />
                  </div>
                  
                  <div className="flex items-center justify-between border-b border-white/10 pb-3 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse animate-duration-500"></div>
                      <h3 className="text-sm font-bold text-slate-100 tracking-tight flex items-center gap-1.5 font-sans">
                        <QrCode className="w-4 h-4 text-rose-455" />
                        <span>Interactive Vehicle QR Scanner</span>
                      </h3>
                    </div>
                    <button 
                      onClick={handleStopCamera}
                      className="p-1 px-2.5 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold rounded-lg border border-white/10 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Close Scanner</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                    {/* Camera Video Deck */}
                    <div className="lg:col-span-6 bg-black/60 rounded-2xl border border-white/5 relative flex flex-col overflow-hidden aspect-video min-h-[220px]">
                      {isScanning ? (
                        <>
                          <video 
                            ref={videoRef} 
                            autoPlay 
                            playsInline 
                            className="w-full h-full object-cover relative z-10" 
                          />
                          {/* Green scanning laser animation */}
                          <div className="absolute inset-x-0 h-0.5 bg-emerald-400 shadow-[0_0_10px_2px_rgba(52,211,153,0.7)] z-20 animate-bounce top-0 pointer-events-none"></div>
                          {/* Corner alignment markers */}
                          <div className="absolute inset-4 border-2 border-dashed border-rose-500/25 z-20 rounded-xl pointer-events-none flex items-center justify-center">
                            <span className="text-[10px] font-mono font-bold bg-black/50 text-rose-400 px-2 py-0.5 rounded tracking-widest">POSITION QR IN BOX</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3 z-10 relative">
                          <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-slate-400">
                            <QrCode className="w-7 h-7" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-200">Camera Feed Idle</span>
                            <p className="text-[10px] text-slate-500 mt-0.5">Please switch stream on or invoke simulation check-in below.</p>
                          </div>
                          <button 
                            onClick={handleStartCamera}
                            className="px-4 py-2 bg-rose-500 text-slate-950 text-xs font-bold rounded-xl hover:bg-rose-600 transition shadow-md"
                          >
                            Re-Open Camera Frame
                          </button>
                        </div>
                      )}

                      {cameraPermissionError && (
                        <div className="absolute inset-0 bg-slate-950/95 z-30 p-6 flex flex-col items-center justify-center text-center space-y-2 leading-relaxed">
                          <AlertTriangle className="w-8 h-8 text-amber-500 animate-bounce" />
                          <span className="text-xs font-bold text-slate-200">Camera Permission Required</span>
                          <p className="text-[10px] text-slate-400 max-w-xs">{cameraPermissionError}</p>
                          <button 
                            onClick={handleStartCamera}
                            className="px-3.5 py-1.5 bg-amber-500 text-slate-950 text-xs font-bold rounded-xl transition"
                          >
                            Grant Authorization
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Simulation Console, Presets & Instantly Pulled Record Results */}
                    <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
                      <div className="space-y-3.5">
                        <span className="text-[9px] font-bold text-rose-400 uppercase tracking-widest">Diagnostic Decoder Input</span>
                        <h4 className="font-bold text-slate-200 text-xs leading-none">Instant Verification Lookup</h4>
                        <p className="text-slate-400 text-[11px] leading-relaxed">
                          Your vehicle holds a unique token QR. Simulate scanning or selecting a token code to instantly query the Cloud database and retrieve the service logs timeline.
                        </p>

                        {/* Interactive presets of user vehicles */}
                        <div className="space-y-2">
                          <span className="text-[10px] text-slate-500 block">Or select/simulate scanning predefined vehicle target barcodes:</span>
                          <div className="flex flex-col gap-1.5">
                            {vehicles.map(v => (
                              <button
                                key={v.id}
                                onClick={() => handleVerifyQrCode(`MCC-CAR-${v.id.substring(0, 8).toUpperCase()}`)}
                                className={`p-2.5 rounded-xl border text-left transition flex items-center justify-between text-xs cursor-pointer ${
                                  scanResult && scanResult.toLowerCase().includes(v.id.substring(0, 4).toLowerCase())
                                    ? "bg-rose-500/10 border-rose-500/30 text-rose-200"
                                    : "bg-white/3 border-white/5 hover:border-white/12 text-slate-300"
                                }`}
                              >
                                <div>
                                  <span className="font-bold block text-[11px]">{v.brand} {v.model} ({v.year})</span>
                                  <span className="text-[9px] text-slate-500 block font-mono">ID: MCC-CAR-{v.id.substring(0, 8).toUpperCase()}</span>
                                </div>
                                <span className="text-[10px] font-bold text-rose-400 tracking-wider">TAP SCAN</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Decoded results block if any scanned */}
                      {scanResult && scannedVehicle && (
                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl space-y-2 animate-fade-in">
                          <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold uppercase tracking-wide">
                            <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>Scan Approved • Service Logs Transmitted</span>
                          </div>
                          <div className="text-xs">
                            <span className="text-slate-200 font-bold block">{scannedVehicle.brand} {scannedVehicle.model} ({scannedVehicle.year})</span>
                            <p className="text-slate-400 text-[11px] mt-0.5 leading-normal">
                              Successfully fetched <strong className="text-slate-300 font-mono">{records.filter(r => r.vehicleId === scannedVehicle.id).length} service tickets</strong> and generated weakness diagnostics reports instantly.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Main Content Split: Important alerts of active vehicle vs Recent activity logs */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-4">
                {/* Urgent checklist of alerts */}
                <div className="lg:col-span-5 glass p-5 rounded-2xl h-80 flex flex-col justify-between">
                  <div className="space-y-3.5">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-rose-500" />
                        <span>Critical Tasks Checklist ({urgentAlertsCount})</span>
                      </h3>
                    </div>
                    
                    <div className="space-y-2 overflow-y-auto max-h-56 pr-1 no-scrollbar">
                      {reminders.filter(r => r.status === 'Overdue' || r.priority === 'High' || r.priority === 'Emergency').slice(0, 3).map(item => (
                        <div key={item.id} className="p-3 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/15 rounded-xl flex items-start gap-2 text-xs transition">
                          <AlertTriangle className="w-4.5 h-4.5 text-rose-400 shrink-0 mt-0.5" />
                          <div className="space-y-0.5">
                            <span className="font-bold text-slate-200 block">{item.title}</span>
                            <p className="text-slate-400 text-[11px] leading-relaxed">{item.reason}</p>
                            <span className="text-[9px] text-rose-400 font-mono tracking-tighter uppercase font-bold mt-1 block">ACTION: {item.action}</span>
                          </div>
                        </div>
                      ))}
                      {reminders.filter(r => r.status === 'Overdue' || r.priority === 'High' || r.priority === 'Emergency').length === 0 && (
                        <div className="text-center py-10 text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
                          <CheckCircle className="w-7 h-7 text-emerald-400" />
                          <span>Wow, no critical vehicle tasks are currently overdue. Keep it up!</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {selectedVehicle && (
                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Telemetry odometer feed: <strong className="text-slate-200 font-mono">{selectedVehicle.mileage.toLocaleString()} km</strong></span>
                      <button onClick={() => setActiveSubTab('reminders')} className="text-sky-400 font-semibold hover:underline">Manage All</button>
                    </div>
                  )}
                </div>

                {/* Combined Recent logs (Maintenance + Custom Logging) */}
                <div className="lg:col-span-7 glass p-5 rounded-2xl h-80 flex flex-col justify-between">
                  <div className="space-y-3.5">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <ClipboardList className="w-4 h-4 text-emerald-400" />
                        <span>Recent Logging Activity ({activeRecords.length + activeExpenses.length})</span>
                      </h3>
                      <span className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-tight">Combined timeline</span>
                    </div>

                    <div className="space-y-2.5 overflow-y-auto max-h-56 pr-1 no-scrollbar text-xs">
                      {/* Merge and sort last actions */}
                      {[
                        ...activeRecords.map(r => ({ ...r, type: 'maintenance' as const, sortDate: r.date })),
                        ...activeExpenses.map(e => ({ ...e, type: 'expense' as const, sortDate: e.date }))
                      ]
                        .sort((a, b) => new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime())
                        .slice(0, 4)
                        .map((act) => (
                          <div key={act.id} className="p-3 bg-white/3 hover:bg-white/5 border border-white/5 rounded-xl flex items-center justify-between gap-3 text-xs transition">
                            <div className="flex items-center gap-2.5">
                              <div className={`p-2 rounded-lg border ${
                                act.type === 'maintenance' ? 'bg-sky-500/10 border-sky-500/20 text-sky-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                              }`}>
                                {act.type === 'maintenance' ? <Wrench className="w-3.5 h-3.5" /> : <DollarSign className="w-3.5 h-3.5" />}
                              </div>
                              <div>
                                <span className="font-bold text-slate-200 flex items-center gap-1.5 flex-wrap">
                                  <span>{act.type === 'maintenance' ? act.serviceCategory : (act as any).category}</span>
                                  {act.type === 'maintenance' && (act as any).isPending && (
                                    <span className="text-[8.5px] bg-yellow-500/15 text-yellow-500 font-extrabold uppercase px-1 py-0.5 rounded border border-yellow-500/20 animate-pulse">⏳ Sync Pending</span>
                                  )}
                                </span>
                                <span className="text-[10px] text-slate-500 block">
                                  {act.date} • {act.provider || "N/A"}
                                </span>
                              </div>
                            </div>
                            <span className="font-mono font-bold text-slate-200">
                              -${act.type === 'maintenance' ? (act as any).cost : (act as any).amount} USD
                            </span>
                          </div>
                      ))}

                      {activeRecords.length + activeExpenses.length === 0 && (
                        <div className="text-center py-10 text-xs text-slate-500">
                          Log recent oil services or receipts to review combined timeline.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Lifelog fuel & service spend: <strong className="text-slate-200 font-mono">${totalFuelSumAcrossAll} USD</strong></span>
                    <button onClick={() => setActiveSubTab('expenses')} className="text-emerald-400 font-semibold hover:underline">Manage Finances</button>
                  </div>
                </div>
              </div>

              {/* RECHARTS MONTHLY MAINTENANCE SPENDING ANALYSIS BAR CHART */}
              <div className="glass p-5 rounded-2xl border border-white/5 space-y-4 shadow-md bg-slate-900/40 relative overflow-hidden backdrop-blur-md">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/5 pb-3">
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-sky-450 text-sky-400" />
                      <span>Monthly Service & Maintenance spending decoder</span>
                    </h3>
                    <p className="text-slate-400 text-[11px] leading-normal max-w-xl">
                      Comprehensive visual audit of your service contracts, repair expenses, and fluid change outlays compiled across chronologically grouped billing periods.
                    </p>
                  </div>

                  {/* Filter controls */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {/* Range filter selector */}
                    <div className="flex bg-slate-950/65 border border-white/10 rounded-lg p-0.5" id="range-filter">
                      <button
                        onClick={() => setChartRange(6)}
                        className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                          chartRange === 6 
                            ? "bg-sky-500 text-slate-950 shadow-sm" 
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        6 Months
                      </button>
                      <button
                        onClick={() => setChartRange(12)}
                        className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                          chartRange === 12 
                            ? "bg-sky-500 text-slate-950 shadow-sm" 
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        12 Months
                      </button>
                    </div>

                    {/* Scope filter selector */}
                    <div className="flex bg-slate-950/65 border border-white/10 rounded-lg p-0.5" id="scope-filter">
                      <button
                        onClick={() => setChartScope('all')}
                        className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                          chartScope === 'all' 
                            ? "bg-indigo-500 text-white shadow-sm font-black" 
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        All Fleet
                      </button>
                      <button
                        onClick={() => selectedVehicle && setChartScope('active')}
                        disabled={!selectedVehicle}
                        title={!selectedVehicle ? "Please pick an active vehicle first in Vehicle sub-tab" : "View active vehicle service costs"}
                        className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                          !selectedVehicle 
                            ? "opacity-35 cursor-not-allowed" 
                            : chartScope === 'active'
                              ? "bg-indigo-500 text-white shadow-sm font-black"
                              : "text-slate-400 hover:text-white"
                        }`}
                      >
                        <span>Active Car</span>
                        {selectedVehicle && (
                          <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-pulse"></span>
                        )}
                      </button>
                    </div>

                    {/* Combined / Service only switcher */}
                    <div className="flex bg-slate-950/65 border border-white/10 rounded-lg p-0.5" id="metric-filter">
                      <button
                        onClick={() => setChartMetric('service')}
                        className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                          chartMetric === 'service' 
                            ? "bg-emerald-500 text-slate-950 shadow-sm font-black" 
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Cost of Service Records
                      </button>
                      <button
                        onClick={() => setChartMetric('combined')}
                        className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                          chartMetric === 'combined' 
                            ? "bg-emerald-500 text-slate-950 shadow-sm font-black" 
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Combined Wallet Spend
                      </button>
                    </div>
                  </div>
                </div>

                {/* Primary Chart Area */}
                <div className="w-full relative mt-1 min-h-[280px]">
                  {/* Empty state safeguard indicator if zero spend exists on the entire chart data range */}
                  {monthlyChartData.reduce((total, m) => total + m.totalCost, 0) === 0 && (
                    <div className="absolute inset-0 z-15 bg-slate-950/20 backdrop-blur-[1px] flex flex-col items-center justify-center text-center p-8 pointer-events-none">
                      <Info className="w-8 h-8 text-slate-500 mb-2 animate-bounce" />
                      <span className="text-xs font-bold text-slate-350">No maintenance bills on active filters</span>
                      <p className="text-[10px] text-slate-500 max-w-xs mt-1">
                        Select a different car or register new service invoices manually or using the Quick Service Log block.
                      </p>
                    </div>
                  )}

                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart
                      data={monthlyChartData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                      <XAxis 
                        dataKey="label" 
                        stroke="#475569" 
                        fontSize={9} 
                        fontWeight="semibold"
                        tickLine={false} 
                        axisLine={false}
                        dy={6}
                      />
                      <YAxis 
                        stroke="#475569" 
                        fontSize={9} 
                        fontWeight="semibold"
                        tickLine={false} 
                        axisLine={false}
                        tickFormatter={(v) => `$${v}`}
                        dx={-4}
                      />
                      <RechartsTooltip
                        content={
                          <CustomTooltipComponent />
                        }
                        cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
                      />
                      <Legend 
                        verticalAlign="top" 
                        height={36} 
                        iconType="circle"
                        iconSize={7}
                        wrapperStyle={{ fontSize: '10px', color: '#94a3b8', fontWeight: 'bold' }}
                      />
                      {chartMetric === 'service' ? (
                        <Bar 
                          dataKey="serviceCost" 
                          name="Professional Services ($ USD)" 
                          fill="#38bdf8" 
                          radius={[4, 4, 0, 0]} 
                          maxBarSize={45} 
                        />
                      ) : (
                        <>
                          <Bar 
                            dataKey="serviceCost" 
                            name="Maintenance Logs ($ USD)" 
                            fill="#38bdf8" 
                            stackId="a" 
                            radius={[0, 0, 0, 0]} 
                            maxBarSize={45} 
                          />
                          <Bar 
                            dataKey="otherCost" 
                            name="Receipt Expenses ($ USD)" 
                            fill="#10b981" 
                            stackId="a" 
                            radius={[4, 4, 0, 0]} 
                            maxBarSize={45} 
                          />
                        </>
                      )}
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Analytical summary row below the chart */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-white/5">
                  <div className="p-2 border border-white/3 bg-slate-950/20 rounded-xl leading-snug">
                    <span className="text-[9px] text-slate-500 font-bold uppercase block tracking-wider">Accumulated cost</span>
                    <span className="text-[14px] font-mono font-bold text-slate-200">
                      ${monthlyChartData.reduce((acc, m) => acc + (chartMetric === 'service' ? m.serviceCost : m.totalCost), 0).toLocaleString()} USD
                    </span>
                    <span className="text-[9px] text-slate-450 block mt-0.5">Across chosen time slice</span>
                  </div>

                  <div className="p-2 border border-white/3 bg-slate-950/20 rounded-xl leading-snug">
                    <span className="text-[9px] text-slate-500 font-bold uppercase block tracking-wider">Average / Month</span>
                    <span className="text-[14px] font-mono font-bold text-sky-400">
                      ${Math.round(
                        monthlyChartData.reduce((acc, m) => acc + (chartMetric === 'service' ? m.serviceCost : m.totalCost), 0) / chartRange
                      ).toLocaleString()} USD
                    </span>
                    <span className="text-[9px] text-slate-450 block mt-0.5">Calculated standard median</span>
                  </div>

                  <div className="p-2 border border-white/3 bg-slate-950/20 rounded-xl leading-snug">
                    <span className="text-[9px] text-slate-500 font-bold uppercase block tracking-wider">Registered tasks</span>
                    <span className="text-[14px] font-mono font-bold text-slate-250 text-slate-200">
                      {monthlyChartData.reduce((acc, m) => acc + (chartMetric === 'service' ? m.serviceCount : m.serviceCount + m.otherCount), 0)} Log entries
                    </span>
                    <span className="text-[9px] text-slate-450 block mt-0.5">Verified database indexes</span>
                  </div>

                  <div className="p-2 border border-white/3 bg-slate-950/20 rounded-xl leading-snug">
                    <span className="text-[9px] text-slate-500 font-bold uppercase block tracking-wider">Peak single month</span>
                    <span className="text-[14px] font-mono font-bold text-rose-450 text-rose-400">
                      ${Math.max(...monthlyChartData.map(m => chartMetric === 'service' ? m.serviceCost : m.totalCost)).toLocaleString()} USD
                    </span>
                    <span className="text-[9px] text-slate-450 block mt-0.5">
                      Max: {monthlyChartData.find(m => (chartMetric === 'service' ? m.serviceCost : m.totalCost) === Math.max(...monthlyChartData.map(val => chartMetric === 'service' ? val.serviceCost : val.totalCost)))?.label || "None"}
                    </span>
                  </div>
                </div>
              </div>

              {/* NEW SECTION: DETAILED MAINTENANCE COST OVER TIME PROGRESSION (SELECTED VEHICLE) */}
              <div id="cost-over-time-panel" className="glass p-5 rounded-2xl border border-white/5 space-y-4 shadow-md bg-slate-900/40 relative overflow-hidden backdrop-blur-md">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/5 pb-3">
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      <span>Maintenance Cost Over Time progression</span>
                    </h3>
                    <p className="text-slate-400 text-[11px] leading-normal max-w-xl">
                      Custom interactive analysis plot tracking the step-wise financial impact and cumulative running cost of services for your chosen vehicle.
                    </p>
                  </div>

                  {/* Dropdowns & Selectors */}
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    {/* Vehicle Select Dropdown (in alignment with global dashboard select) */}
                    <div className="flex items-center gap-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Vehicle:</label>
                      <select
                        value={costOverTimeVehicleId}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCostOverTimeVehicleId(val);
                          const matchingV = vehicles.find(v => v.id === val);
                          if (matchingV && onSelectVehicle) {
                            onSelectVehicle(matchingV);
                          }
                        }}
                        className="bg-slate-950/75 text-slate-100 border border-white/10 rounded-lg p-1.5 text-xs focus:outline-none focus:border-emerald-500"
                      >
                        {vehicles.length === 0 ? (
                          <option value="">No Vehicles Configured</option>
                        ) : (
                          vehicles.map(v => (
                            <option key={v.id} value={v.id}>
                              {v.brand} {v.model} ({v.year})
                            </option>
                          ))
                        )}
                      </select>
                    </div>

                    {/* View mode buttons: Cumulative vs Individual vs Overlay */}
                    <div className="flex bg-slate-950/65 border border-white/10 rounded-lg p-0.5">
                      <button
                        onClick={() => setCostOverTimeViewMode('cumulative')}
                        className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                          costOverTimeViewMode === 'cumulative'
                            ? "bg-emerald-500 text-slate-950 shadow-sm"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Cumulative
                      </button>
                      <button
                        onClick={() => setCostOverTimeViewMode('individual')}
                        className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                          costOverTimeViewMode === 'individual'
                            ? "bg-emerald-500 text-slate-950 shadow-sm"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Individual
                      </button>
                      <button
                        onClick={() => setCostOverTimeViewMode('overlay')}
                        className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                          costOverTimeViewMode === 'overlay'
                            ? "bg-emerald-500 text-slate-950 shadow-sm"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Overlay Split
                      </button>
                    </div>
                  </div>
                </div>

                {/* Main plot area */}
                <div className="w-full relative min-h-[300px]">
                  {!costOverTimeVehicle ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                      <Info className="w-8 h-8 text-slate-500 mb-2" />
                      <span className="text-xs font-bold text-slate-400">No Selected Vehicle</span>
                      <p className="text-[10px] text-slate-500 mt-1 max-w-xs">
                        Configure a vehicle or tap a preset to begin reviewing maintenance expenses.
                      </p>
                    </div>
                  ) : selectedVehicleRecordsChartData.length === 0 ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                      <Wrench className="w-8 h-8 text-slate-600 mb-2" />
                      <span className="text-xs font-bold text-slate-400">No Services Logged for {costOverTimeVehicle.brand} {costOverTimeVehicle.model}</span>
                      <p className="text-[10px] text-slate-500 mt-1 max-w-xs">
                        This vehicle does not have any recorded maintenance tickets yet. Click "Log Maintenance" in the quick action deck to register one!
                      </p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      {costOverTimeViewMode === 'cumulative' ? (
                        <AreaChart
                          data={selectedVehicleRecordsChartData}
                          margin={{ top: 15, right: 15, left: -20, bottom: 5 }}
                        >
                          <defs>
                            <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                          <XAxis 
                            dataKey="date" 
                            stroke="#475569"
                            fontSize={9}
                            fontWeight="semibold"
                            tickLine={false}
                          />
                          <YAxis 
                            stroke="#475569"
                            fontSize={9}
                            fontWeight="semibold"
                            tickLine={false}
                            tickFormatter={(v) => `$${v}`}
                          />
                          <RechartsTooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-slate-950/95 border border-white/10 p-3 rounded-xl shadow-xl space-y-1 text-left min-w-[200px]">
                                    <div className="text-[10px] font-bold text-slate-500 uppercase">{data.date}</div>
                                    <div className="text-xs font-semibold text-slate-200">{data.category}</div>
                                    <div className="text-[10px] text-slate-400 mt-0.5">Odometer: <strong className="text-slate-350">{data.mileage}</strong></div>
                                    <div className="border-t border-white/5 my-1.5 pt-1 flex justify-between items-center text-xs">
                                      <span className="text-slate-450 text-slate-400">Invoice:</span>
                                      <span className="font-mono font-bold text-emerald-400">${data.cost.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                      <span className="text-slate-400">Cumulative:</span>
                                      <span className="font-mono font-black text-sky-400">${data.cumulative.toLocaleString()}</span>
                                    </div>
                                    <div className="text-[9px] text-slate-500 italic mt-0.5">{data.provider}</div>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '10px' }} />
                          <Area 
                            type="monotone" 
                            dataKey="cumulative" 
                            name="Cumulative Spend ($ USD)" 
                            stroke="#10b981" 
                            strokeWidth={2.5}
                            fillOpacity={1} 
                            fill="url(#colorCumulative)" 
                          />
                        </AreaChart>
                      ) : costOverTimeViewMode === 'individual' ? (
                        <BarChart
                          data={selectedVehicleRecordsChartData}
                          margin={{ top: 15, right: 15, left: -20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.04)" vertical={false} />
                          <XAxis 
                            dataKey="date" 
                            stroke="#475569"
                            fontSize={9.5}
                            fontWeight="semibold"
                            tickLine={false}
                          />
                          <YAxis 
                            stroke="#475569"
                            fontSize={9.5}
                            fontWeight="semibold"
                            tickLine={false}
                            tickFormatter={(v) => `$${v}`}
                          />
                          <RechartsTooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-slate-950/95 border border-white/10 p-3 rounded-xl shadow-xl space-y-1 text-left min-w-[200px]">
                                    <div className="text-[10px] font-bold text-slate-500 uppercase">{data.date}</div>
                                    <div className="text-xs font-semibold text-slate-200">{data.category}</div>
                                    <div className="text-[10px] text-slate-400">Provider: <strong className="text-slate-350">{data.provider}</strong></div>
                                    <div className="text-[10px] text-slate-400">Distance: <strong className="text-slate-350">{data.mileage}</strong></div>
                                    <div className="border-t border-white/5 my-1.5 pt-1.5 flex justify-between items-center text-xs">
                                      <span className="text-slate-400">Service Cost:</span>
                                      <span className="font-mono font-bold text-sky-400">${data.cost.toLocaleString()}</span>
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '10px' }} />
                          <Bar 
                            dataKey="cost" 
                            name="Individual Ticket Cost ($ USD)" 
                            fill="#6366f1" 
                            radius={[4, 4, 0, 0]}
                            maxBarSize={40}
                          />
                        </BarChart>
                      ) : (
                        // OVERLAY split mode
                        <LineChart
                          data={selectedVehicleRecordsChartData}
                          margin={{ top: 15, right: 15, left: -20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.04)" vertical={false} />
                          <XAxis 
                            dataKey="date" 
                            stroke="#475569"
                            fontSize={9}
                            fontWeight="semibold"
                            tickLine={false}
                          />
                          <YAxis 
                            stroke="#475569"
                            fontSize={9}
                            fontWeight="semibold"
                            tickLine={false}
                            tickFormatter={(v) => `$${v}`}
                          />
                          <RechartsTooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-slate-950/95 border border-white/10 p-3 rounded-xl shadow-xl space-y-1 text-left min-w-[200px]">
                                    <div className="text-[10px] font-bold text-slate-500">{data.date}</div>
                                    <div className="text-xs font-semibold text-slate-250 text-slate-100">{data.category}</div>
                                    <div className="border-t border-white/5 my-1 pt-1 space-y-0.5">
                                      <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-400">Single Cost:</span>
                                        <span className="font-mono font-bold text-violet-400">${data.cost.toLocaleString()}</span>
                                      </div>
                                      <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-400">Total To Date:</span>
                                        <span className="font-mono font-bold text-emerald-400">${data.cumulative.toLocaleString()}</span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '10px' }} />
                          <Line 
                            type="monotone" 
                            dataKey="cumulative" 
                            name="Cumulative Flow ($)" 
                            stroke="#10b981" 
                            strokeWidth={3} 
                            activeDot={{ r: 6 }} 
                          />
                          <Line 
                            type="monotone" 
                            dataKey="cost" 
                            name="Service Charge ($)" 
                            stroke="#6366f1" 
                            strokeWidth={2} 
                            strokeDasharray="4 4"
                          />
                        </LineChart>
                      )}
                    </ResponsiveContainer>
                  )}
                </div>

                {/* Dynamic analytical breakdown figures for chosen vehicle */}
                {costOverTimeVehicle && selectedVehicleRecordsChartData.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-white/5">
                    <div className="p-2 border border-white/3 bg-slate-950/20 rounded-xl leading-snug">
                      <span className="text-[9px] text-slate-500 font-bold uppercase block tracking-wider">Total Lifetime Outlay</span>
                      <span className="text-[14px] font-mono font-bold text-slate-200">
                        ${selectedVehicleRecordsChartData[selectedVehicleRecordsChartData.length - 1].cumulative.toLocaleString()} USD
                      </span>
                      <span className="text-[9px] text-emerald-400 block mt-0.5">Aggregated from all tickets</span>
                    </div>

                    <div className="p-2 border border-white/3 bg-slate-950/20 rounded-xl leading-snug">
                      <span className="text-[9px] text-slate-500 font-bold uppercase block tracking-wider">Average Service Cost</span>
                      <span className="text-[14px] font-mono font-bold text-sky-400">
                        ${Math.round(
                          selectedVehicleRecordsChartData.reduce((acc, r) => acc + r.cost, 0) / selectedVehicleRecordsChartData.length
                        ).toLocaleString()} USD
                      </span>
                      <span className="text-[9px] text-slate-450 block mt-0.5">Per maintenance event</span>
                    </div>

                    <div className="p-2 border border-white/3 bg-slate-950/20 rounded-xl leading-snug">
                      <span className="text-[9px] text-slate-500 font-bold uppercase block tracking-wider">Peak Ticket Peak</span>
                      <span className="text-[14px] font-mono font-bold text-violet-400">
                        ${Math.max(...selectedVehicleRecordsChartData.map(r => r.cost)).toLocaleString()} USD
                      </span>
                      <span className="text-[9px] text-slate-450 block mt-0.5">
                        Highest single charge
                      </span>
                    </div>

                    <div className="p-2 border border-white/3 bg-slate-950/20 rounded-xl leading-snug">
                      <span className="text-[9px] text-slate-500 font-bold uppercase block tracking-wider">Registered Events</span>
                      <span className="text-[14px] font-mono font-bold text-amber-500">
                        {selectedVehicleRecordsChartData.length} records
                      </span>
                      <span className="text-[9px] text-slate-450 block mt-0.5">All historic sessions</span>
                    </div>
                  </div>
                )}
              </div>

              {/* NEW SECTION: VISUAL SERVICE COST & FREQUENCY TRENDS (RECHARTS DUAL-AXIS COMBO CHART) */}
              <div id="service-cost-frequency-trends-panel" className="glass p-5 rounded-2xl border border-white/5 space-y-4 shadow-md bg-slate-900/40 relative overflow-hidden backdrop-blur-md">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/5 pb-3">
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-sky-400" />
                      <span>Service Cost & Frequency Trends Tracker</span>
                    </h3>
                    <p className="text-slate-400 text-[11px] leading-normal max-w-xl">
                      Correlate your dollar expenditures alongside maintenance frequency events over time to analyze lifecycle intensity and identify spikes in service frequency.
                    </p>
                  </div>

                  {/* Period Aggregations vs Timeline Selector */}
                  <div className="flex bg-slate-950/65 border border-white/10 rounded-lg p-0.5" id="trend-selector">
                    <button
                      onClick={() => setVisualTrendViewMode('monthly')}
                      className={`px-3 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                        visualTrendViewMode === 'monthly'
                          ? "bg-sky-500 text-slate-950 shadow-sm font-extrabold"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Monthly Aggregated
                    </button>
                    <button
                      onClick={() => setVisualTrendViewMode('chronological')}
                      className={`px-3 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                        visualTrendViewMode === 'chronological'
                          ? "bg-sky-500 text-slate-950 shadow-sm font-extrabold"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Event Chronological
                    </button>
                  </div>
                </div>

                {/* Primary Chart Area */}
                <div className="w-full relative min-h-[300px]">
                  {!costOverTimeVehicle ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                      <Info className="w-8 h-8 text-slate-500 mb-2" />
                      <span className="text-xs font-bold text-slate-400">No Selected Vehicle</span>
                      <p className="text-[10px] text-slate-500 mt-1 max-w-xs">
                        Configure a vehicle to see expenditure and frequency correlation trends.
                      </p>
                    </div>
                  ) : (visualTrendViewMode === 'monthly' ? visualTrendMonthlyData : visualTrendChronologicalData).length === 0 ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                      <Wrench className="w-8 h-8 text-slate-600 mb-2" />
                      <span className="text-xs font-bold text-slate-400">No Trends Available</span>
                      <p className="text-[10px] text-slate-500 mt-1 max-w-xs">
                        There are no recorded repair tickets to calculate frequency metrics. Use Quick Actions to log elements first!
                      </p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <ComposedChart
                        data={visualTrendViewMode === 'monthly' ? visualTrendMonthlyData : visualTrendChronologicalData}
                        margin={{ top: 15, right: -5, left: -20, bottom: 5 }}
                      >
                        <defs>
                          <linearGradient id="trendCostGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                        <XAxis 
                          dataKey={visualTrendViewMode === 'monthly' ? 'label' : 'date'} 
                          stroke="#475569"
                          fontSize={9}
                          fontWeight="semibold"
                          tickLine={false}
                        />
                        {/* Left Y-Axis for Service Cost */}
                        <YAxis 
                          yAxisId="left"
                          stroke="#38bdf8"
                          fontSize={9}
                          fontWeight="bold"
                          tickLine={false}
                          tickFormatter={(v) => `$${v}`}
                          label={{ value: 'Cost ($ USD)', angle: -90, position: 'insideLeft', offset: 10, fill: '#38bdf8', fontSize: 9, fontWeight: 'bold' }}
                        />
                        {/* Right Y-Axis for Visit Frequency */}
                        <YAxis 
                          yAxisId="right"
                          orientation="right"
                          stroke="#fbbf24"
                          fontSize={9}
                          fontWeight="bold"
                          tickLine={false}
                          tickFormatter={(v) => String(Math.round(v))}
                          label={{ value: visualTrendViewMode === 'monthly' ? 'Visits/Month' : 'Cumulative visits', angle: 90, position: 'insideRight', offset: 10, fill: '#fbbf24', fontSize: 9, fontWeight: 'bold' }}
                        />
                        <RechartsTooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-slate-950/95 border border-white/10 p-3 rounded-xl shadow-xl space-y-1.5 text-left min-w-[220px]">
                                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{data.label || data.date}</div>
                                  {visualTrendViewMode === 'chronological' && (
                                    <div className="text-xs font-semibold text-slate-100">{data.category}</div>
                                  )}
                                  
                                  <div className="border-t border-white/5 my-1.5 pt-1.5 space-y-1 text-xs">
                                    <div className="flex justify-between items-center">
                                      <span className="text-slate-400">Service Cost:</span>
                                      <span className="font-mono font-bold text-sky-400">${data.cost.toLocaleString()} USD</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span className="text-slate-400">
                                        {visualTrendViewMode === 'monthly' ? 'Visits in Month:' : 'Cumulative Visit #:'}
                                      </span>
                                      <span className="font-mono font-bold text-amber-400 flex items-center gap-1">
                                        {data.frequency} {data.frequency === 1 ? 'visit' : 'visits'}
                                      </span>
                                    </div>
                                  </div>

                                  {visualTrendViewMode === 'chronological' && (
                                    <div className="text-[9px] text-slate-500 flex flex-col gap-0.5 border-t border-white/5 pt-1 mt-1 font-mono">
                                      <div>Odometer: <strong className="text-slate-400">{data.mileage}</strong></div>
                                      <div>Workshop: <strong className="text-slate-400">{data.provider}</strong></div>
                                    </div>
                                  )}
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '10px' }} />
                        
                        {/* Service Cost is rendered as a Bar or Area */}
                        <Bar 
                          yAxisId="left"
                          dataKey="cost" 
                          name="Service Cost ($)" 
                          fill="#38bdf8" 
                          radius={[4, 4, 0, 0]}
                          maxBarSize={45}
                          opacity={0.8}
                        />

                        {/* Frequency is plotted as a Line with highlight dots */}
                        <Line 
                          yAxisId="right"
                          type="monotone"
                          dataKey="frequency" 
                          name={visualTrendViewMode === 'monthly' ? "Monthly Visit Intensity" : "Cumulative Visit Rank"} 
                          stroke="#fbbf24" 
                          strokeWidth={3}
                          activeDot={{ r: 7 }}
                          dot={{ stroke: '#fbbf24', strokeWidth: 2, r: 4, fill: '#1e293b' }}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  )}
                </div>

                {/* KPI Breakdown row for trends summary */}
                {costOverTimeVehicle && (visualTrendViewMode === 'monthly' ? visualTrendMonthlyData : visualTrendChronologicalData).length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-white/5">
                    <div className="p-2 border border-white/3 bg-slate-950/20 rounded-xl leading-snug text-left">
                      <span className="text-[9px] text-slate-500 font-bold uppercase block tracking-wider font-mono">Lifetime Tickets</span>
                      <strong className="text-[14px] font-mono font-bold text-slate-200">
                        {visualTrendChronologicalData.length} records
                      </strong>
                      <span className="text-[9px] text-sky-400 block mt-0.5">Visits logged</span>
                    </div>

                    <div className="p-2 border border-white/3 bg-slate-950/20 rounded-xl leading-snug text-left">
                      <span className="text-[9px] text-slate-500 font-bold uppercase block tracking-wider font-mono">Avg Month Outlay</span>
                      <strong className="text-[14px] font-mono font-bold text-emerald-400">
                        ${Math.round(
                          visualTrendMonthlyData.reduce((acc, m) => acc + m.cost, 0) / (visualTrendMonthlyData.length || 1)
                        ).toLocaleString()} USD
                      </strong>
                      <span className="text-[9px] text-slate-400 block mt-0.5">Average monthly spend</span>
                    </div>

                    <div className="p-2 border border-white/3 bg-slate-950/20 rounded-xl leading-snug text-left">
                      <span className="text-[9px] text-slate-500 font-bold uppercase block tracking-wider font-mono">Max Single Cost</span>
                      <strong className="text-[14px] font-mono font-bold text-amber-400">
                        ${Math.max(...visualTrendChronologicalData.map(r => r.cost)).toLocaleString()} USD
                      </strong>
                      <span className="text-[9px] text-slate-400 block mt-0.5">Peak repairs invoice</span>
                    </div>

                    <div className="p-2 border border-white/3 bg-slate-950/20 rounded-xl leading-snug text-left">
                      <span className="text-[9px] text-slate-500 font-bold uppercase block tracking-wider font-mono">Peak Monthly Frequency</span>
                      <strong className="text-[14px] font-mono font-bold text-yellow-400">
                        {Math.max(...visualTrendMonthlyData.map(m => m.frequency))} visits
                      </strong>
                      <span className="text-[9px] text-slate-400 block mt-0.5">
                        Max: {visualTrendMonthlyData.find(m => m.frequency === Math.max(...visualTrendMonthlyData.map(val => val.frequency)))?.label || "None"}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* NEW SECTION: BATTERY HEALTH & CAPACITY LIFESPAN DEGRADATION ANALYZER */}
              <div id="battery-health-panel" className="glass p-5 rounded-2xl border border-white/5 space-y-4 shadow-md bg-slate-900/40 relative overflow-hidden backdrop-blur-md">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/5 pb-3">
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <BatteryCharging className="w-4 h-4 text-amber-400" />
                      <span>{batteryHealthData?.isEvOrHybrid ? "High-Voltage Traction Battery Health & Lifespan Analyzer" : "Auxiliary 12V Starter Battery & Alternator Diagnostics"}</span>
                    </h3>
                    <p className="text-slate-400 text-[11px] leading-normal max-w-xl">
                      {batteryHealthData?.isEvOrHybrid 
                        ? `Custom electrochemical simulation engine projecting cell capacity State-of-Health (SOH) and life-expectancy based on age and service logs for ${selectedVehicle?.brand} ${selectedVehicle?.model}.`
                        : `Diagnostic load analyzer tracking cold-cranking voltage spikes, state-of-health, and alternator charging output for combustion platforms.`
                      }
                    </p>
                  </div>

                  {/* Toggle Mode to preview alternate platform */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setForceEvPreview(!forceEvPreview)}
                      className={`px-2.5 py-1 text-[10px] uppercase font-bold rounded border cursor-pointer transition-all ${
                        forceEvPreview 
                          ? "bg-amber-500/20 border-amber-500/30 text-amber-300"
                          : "border-white/10 hover:border-white/25 text-slate-400 hover:text-white"
                      }`}
                    >
                      {forceEvPreview ? "Disable EV Simulation" : "Simulate EV SOH View"}
                    </button>
                  </div>
                </div>

                {!selectedVehicle ? (
                  <div className="text-center py-8 text-xs text-slate-500">
                    <Info className="w-7 h-7 mx-auto mb-2 text-slate-600" />
                    Please configure and select a vehicle to inspect battery analytics.
                  </div>
                ) : batteryHealthData?.isEvOrHybrid ? (
                  /* ----------------- EV / HYBRID ACTIVE DECK ----------------- */
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    {/* Gauge & Metrics Card */}
                    <div className="lg:col-span-4 flex flex-col justify-between p-4 bg-slate-950/40 border border-white/5 rounded-xl space-y-4">
                      <div className="text-center space-y-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider animate-pulse">State of Health (SOH)</span>
                        <div className="relative inline-flex items-center justify-center p-3">
                          {/* Circle progress bar */}
                          <svg className="w-28 h-28 transform -rotate-90">
                            <circle
                              cx="56"
                              cy="56"
                              r="46"
                              stroke="rgba(255, 255, 255, 0.05)"
                              strokeWidth="8"
                              fill="transparent"
                            />
                            <circle
                              cx="56"
                              cy="56"
                              r="46"
                              stroke={batteryHealthData.calculatedSOH >= 85 ? "#10b981" : batteryHealthData.calculatedSOH >= 75 ? "#f1f5f9" : "#f43f5e"}
                              strokeWidth="8"
                              fill="transparent"
                              strokeDasharray={2 * Math.PI * 46}
                              strokeDashoffset={((100 - batteryHealthData.calculatedSOH) / 100) * (2 * Math.PI * 46)}
                              className="transition-all duration-500 ease-out"
                            />
                          </svg>
                          <div className="absolute flex flex-col items-center justify-center text-center">
                            <span className="text-2xl font-black font-mono text-slate-100">{batteryHealthData.calculatedSOH}%</span>
                            <span className="text-[8.5px] text-slate-400 uppercase tracking-tighter block mt-0.5 max-w-[85px] leading-tight font-semibold">{batteryHealthData.healthReport}</span>
                          </div>
                        </div>
                      </div>

                      {/* Primary figures */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-white/5">
                          <span className="text-[9px] text-slate-500 font-bold block uppercase">Remaining Life</span>
                          <span className="text-sm font-black font-mono text-amber-400">{batteryHealthData.remainingYears} Years</span>
                          <span className="text-[8px] text-slate-500 block mt-0.5">SOH threshold 70%</span>
                        </div>
                        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-white/5">
                          <span className="text-[9px] text-slate-500 font-bold block uppercase">Cap Capacity</span>
                          <span className="text-sm font-black font-mono text-sky-400">
                            {selectedVehicle.fuelType === 'EV' ? "75 kWh" : selectedVehicle.fuelType === 'Hybrid' ? "1.6 kWh" : "85 kWh"}
                          </span>
                          <span className="text-[8px] text-slate-500 block mt-0.5">Traction chemistry</span>
                        </div>
                      </div>

                      {/* Service Bonuses Logged */}
                      <div className="space-y-1.5 pt-1.5 border-t border-white/5 text-[10px]">
                        <span className="text-slate-500 uppercase tracking-wider font-bold">Ledger Diagnostic Handshakes:</span>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">HV Cooling Service:</span>
                            <span className={`font-mono ${batteryHealthData.hasBatteryCoolantFlush ? "text-emerald-400 font-bold" : "text-slate-600"}`}>
                              {batteryHealthData.hasBatteryCoolantFlush ? "Optimized" : "No record"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Cell Rebalancing:</span>
                            <span className={`font-mono ${batteryHealthData.hasCellRebalance ? "text-emerald-400 font-bold" : "text-slate-600"}`}>
                              {batteryHealthData.hasCellRebalance ? "Executed" : "No record"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Capacity Sweep:</span>
                            <span className={`font-mono ${batteryHealthData.hasBatteryDiagnostics ? "text-emerald-400 font-bold" : "text-slate-600"}`}>
                              {batteryHealthData.hasBatteryDiagnostics ? "Logged" : "No record"}
                            </span>
                          </div>
                          {batteryHealthData.bonusAdded > 0 && (
                            <div className="bg-emerald-500/10 text-emerald-400 p-1.5 rounded text-[9px] flex items-center justify-between font-bold mt-1">
                              <span>Total Ledger Bonus:</span>
                              <span>+{batteryHealthData.bonusAdded}% SOH</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Projections Chart */}
                    <div className="lg:col-span-5 flex flex-col justify-between p-4 bg-slate-950/40 border border-white/5 rounded-xl">
                      <div className="space-y-1 mb-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider">10-Year SOH Degradation curve</span>
                        <p className="text-[9.5px] text-slate-450 text-slate-500">Compounded capacity decay prediction over standard calendar periods.</p>
                      </div>

                      <div className="w-full h-44 mt-1">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={batteryHealthData.projections} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                            <defs>
                              <linearGradient id="sohGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.03)" vertical={false} />
                            <XAxis dataKey="yearLabel" stroke="#475569" fontSize={8} tickLine={false} />
                            <YAxis domain={[40, 100]} stroke="#475569" fontSize={8} tickLine={false} />
                            <RechartsTooltip
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  const item = payload[0].payload;
                                  return (
                                    <div className="bg-slate-950 border border-white/10 p-2 rounded-lg text-[10px] text-left">
                                      <div className="font-bold text-slate-400">Year {item.year} Projection</div>
                                      <div className="text-emerald-450 font-mono font-bold mt-0.5 text-emerald-400">Projected SOH: {item.soh}%</div>
                                      <div className="text-slate-500 mt-0.5 text-[8.5px]">Warranty Safe-limit: 70%</div>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <Area
                              type="monotone"
                              dataKey="soh"
                              stroke="#10b981"
                              strokeWidth={2}
                              fillOpacity={1}
                              fill="url(#sohGradient)"
                              name="State of Health"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="p-2 border border-rose-500/10 bg-rose-500/5 text-rose-450 rounded-lg text-[9px] mt-2 flex items-center gap-1.5 border-dashed">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span>High temperatures in Cambodia accelerate chemical aging profiles of lithium batteries.</span>
                      </div>
                    </div>

                    {/* SLIDERS / INTERACTIVE CONTROL CORNER */}
                    <div className="lg:col-span-3 flex flex-col justify-between p-4 bg-slate-950/40 border border-white/5 rounded-xl space-y-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider">Electrochemical Inputs</span>
                        <p className="text-[9.5px] text-slate-500">Adjust simulation fields in real-time to preview degradation rates under specific conditions.</p>
                      </div>

                      {/* Slider 1: DC Fast Charging % */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-slate-400 uppercase tracking-tight flex items-center gap-1"><Zap className="w-3 h-3 text-amber-400" /> DC Fast Charge %</span>
                          <span className="font-mono font-bold text-amber-400">{dcFastChargingPct}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={dcFastChargingPct}
                          onChange={(e) => setDcFastChargingPct(parseInt(e.target.value))}
                          className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                        />
                        <span className="text-[8px] text-slate-500 block leading-tight">Frequent DC fast-charging increases battery cell heat profiles and micro-expansion cracking.</span>
                      </div>

                      {/* Slider 2: Operating Temp */}
                      <div className="space-y-1.5 border-t border-white/5 pt-3">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-slate-400 uppercase tracking-tight flex items-center gap-1"><Thermometer className="w-3 h-3 text-red-400" /> Ambient Cell Temp</span>
                          <span className="font-mono font-bold text-red-400">{operatingTempC}°C</span>
                        </div>
                        <input
                          type="range"
                          min="15"
                          max="45"
                          step="1"
                          value={operatingTempC}
                          onChange={(e) => setOperatingTempC(parseInt(e.target.value))}
                          className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-500"
                        />
                        <div className="flex justify-between items-center text-[8px] text-slate-500 mt-1">
                          <span>15°C (Temperate)</span>
                          {operatingTempC >= 32 && <span className="text-amber-500 font-semibold uppercase">Tropical Heat</span>}
                          <span>45°C (Arid)</span>
                        </div>
                      </div>

                      <div className="text-[8.5px] text-slate-500 italic border-t border-white/5 pt-2 leading-relaxed">
                        *Estimations utilize Arrhenius chemistry degradation calculations matched with local climate parameters.
                      </div>
                    </div>
                  </div>
                ) : (
                  /* ----------------- COMBUSTION ENGINE 12V ACTIVE DECK ----------------- */
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                    {/* Diagnostic Summary */}
                    <div className="md:col-span-5 p-4 bg-slate-950/40 border border-white/5 rounded-xl flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider">12V Starter Lead-Acid Health</span>
                          <span className="text-[9px] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full font-bold">Health Pass</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                          <div className="p-2 border border-white/3 bg-slate-950/20 rounded-lg leading-tight">
                            <span className="text-[8px] text-slate-500 font-bold block uppercase">Static Volt</span>
                            <span className="text-[13px] font-mono font-bold text-slate-200">{sim12VVoltage}V</span>
                          </div>
                          <div className="p-2 border border-white/3 bg-slate-950/20 rounded-lg leading-tight">
                            <span className="text-[8px] text-slate-500 font-bold block uppercase">Cranking Volt</span>
                            <span className={`text-[13px] font-mono font-bold ${sim12VCrankingV >= 9.6 ? "text-emerald-400" : "text-rose-450"}`}>{sim12VCrankingV}V</span>
                          </div>
                          <div className="p-2 border border-white/3 bg-slate-950/20 rounded-lg leading-tight">
                            <span className="text-[8px] text-slate-500 font-bold block uppercase">Est SOH</span>
                            <span className="text-[13px] font-mono font-bold text-sky-400">{sim12VHealthScore}%</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">Cranking Diagnostic Analysis:</span>
                        <p className="text-[10px] text-slate-400 leading-normal">
                          Starter systems trigger high-amp motor draws. If dynamic cracking discharge drops below <strong className="text-amber-500 font-mono">9.6V</strong>, starter plates are likely oxidized indicating imminent cold-cranking failure.
                        </p>
                      </div>

                      {/* Simulation Button */}
                      <button
                        onClick={() => {
                          setIs12VSimulating(true);
                          setSim12VCrankingV(7.8);
                          setSim12VVoltage(11.2);
                          setTimeout(() => {
                            setSim12VCrankingV(10.2);
                            setSim12VVoltage(12.7);
                            setSim12VHealthScore(94);
                            setIs12VSimulating(false);
                          }, 1800);
                        }}
                        disabled={is12VSimulating}
                        className={`w-full py-2 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 rounded-xl text-[11px] font-bold uppercase transition flex items-center justify-center gap-1.5 cursor-pointer ${
                          is12VSimulating ? "animate-pulse border-emerald-500/25" : ""
                        }`}
                      >
                        <Activity className={`w-4 h-4 text-emerald-400 ${is12VSimulating ? "animate-spin" : ""}`} />
                        <span>{is12VSimulating ? "Measuring System Volt Swings..." : "Initiate Crank Load Diagnostic Audit"}</span>
                      </button>
                    </div>

                    {/* Explanatory Info Card */}
                    <div className="md:col-span-7 p-4 bg-slate-950/40 border border-white/5 rounded-xl flex flex-col justify-between space-y-3.5">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider">Traditional Starter vs. Traction Hybrid Architectures</span>
                        <p className="text-[10px] text-slate-450 text-slate-400 leading-relaxed">
                          Your chosen vehicle runs on an **Internal Combustion Engine**. These rely on basic 12V lead-acid batteries to provide short cranking energy spikes during starting sessions. However, modern electric/hybrid systems utilize larger high-voltage traction packs with electrochemical cooling circuits and intelligent cell rebalancing systems.
                        </p>
                      </div>

                      <div className="p-3 bg-indigo-500/5 border border-indigo-500/15 rounded-lg space-y-1 text-xs">
                        <span className="font-bold text-indigo-300 block flex items-center gap-1 text-[11px]">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Simulate EV SOH curve plotter!</span>
                        </span>
                        <p className="text-[10px] text-slate-400">
                          Curious to explore how our live capacity models and Arrhenius thermal degradation algorithms map battery State-of-Health projections over a 10-Year period for full EV/Hybrid models? Enable simulation with the link below.
                        </p>
                        <button
                          onClick={() => setForceEvPreview(true)}
                          className="mt-1 text-[10px] font-bold text-indigo-400 hover:text-indigo-300 underline block cursor-pointer"
                        >
                          Unlock Hybrid/EV Battery SOH View &rarr;
                        </button>
                      </div>

                      <div className="text-[9px] text-slate-500 italic border-t border-white/5 pt-2 leading-relaxed flex justify-between items-center">
                        <span>Lead-acid terminal monitor loaded.</span>
                        <span>Fitted with warm environment voltage adjustment triggers.</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* NEW SECTION: NEARBY RECOMMENDED SERVICE PARTNERS */}
              <div id="nearby-recommended-partners" className="glass p-5 rounded-2xl border border-white/5 space-y-4 shadow-md bg-slate-900/45 relative overflow-hidden backdrop-blur-md">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/5 pb-3">
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Compass className="w-4 h-4 text-emerald-450 text-emerald-400 animate-spin animate-duration-10000 shrink-0" />
                      <span>Nearby Recommended Service Partners</span>
                    </h3>
                    <p className="text-slate-400 text-[11px] leading-normal max-w-xl">
                      Automated high-integrity service matching based on your account residence coordinates and active vehicle specifications.
                    </p>
                  </div>

                  {/* Filters / controls */}
                  <div className="flex flex-wrap items-center gap-3">
                    {/* City Selector dropdown or pill switches */}
                    <div className="flex items-center gap-1.5 text-xs bg-slate-950/60 border border-white/10 rounded-xl p-1">
                      <span className="text-[10px] text-slate-550 text-slate-500 font-bold uppercase px-1.5">Region:</span>
                      {['Phnom Penh', 'Siem Reap', 'Battambang'].map((city) => (
                        <button
                          key={city}
                          onClick={() => {
                            setSelectedNearbyCity(city);
                            setBookingSuccessGarageId(null);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                            selectedNearbyCity.toLowerCase() === city.toLowerCase()
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm"
                              : "text-slate-450 hover:text-white border border-transparent"
                          }`}
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Detected specifications banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {selectedVehicle ? (
                      <div className="flex items-center gap-1.5 text-[10px] bg-sky-500/10 border border-sky-500/20 text-sky-450 text-sky-450 text-sky-400 font-bold px-2.5 py-1 rounded-lg">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>Active Vehicle: {selectedVehicle.brand} {selectedVehicle.model} ({selectedVehicle.fuelType})</span>
                        <span className="text-slate-500 font-normal shrink-0">
                          • Matches detected
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-[10px] bg-slate-950/40 border border-white/5 text-slate-400 px-2.5 py-1 rounded-lg">
                        <Info className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>Select a vehicle above to configure smart drive spec recommendations.</span>
                      </div>
                    )}
                  </div>

                  {userProfile && (
                    <div className="text-[10px] text-slate-500 flex items-center gap-1 text-right">
                      <MapPin className="w-3.5 h-3.5 text-rose-500/80 shrink-0" />
                      <span>Home City configured: <strong className="text-slate-350">{userProfile.location || "Not Confirmed"}</strong></span>
                    </div>
                  )}
                </div>

                {/* Category Selection Carousel/Row */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar pt-1">
                  {(['All', 'EV & Hybrid', 'Diesel', 'General Repair', 'Wash & Detail', 'Petrol & Lube'] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedNearbyCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-[10.5px] font-medium transition cursor-pointer whitespace-nowrap border shrink-0 ${
                        selectedNearbyCategory === cat
                          ? "bg-slate-100 hover:bg-slate-200 text-slate-950 border-slate-200 font-bold shadow-md shadow-white/5"
                          : "bg-white/3 hover:bg-white/6 text-slate-300 border-white/5 hover:border-white/10"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Garages matched grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                  {filteredNearbyGarages.map((gar) => {
                    // Calculate simulated distance based on lat/lng or indices
                    const simulatedDistance = selectedVehicle 
                      ? ((Math.abs(gar.lat - 11.5) + Math.abs(gar.lng - 104.9)) * 100).toFixed(1) 
                      : (2.5 + (gar.rating % 0.8) * 8).toFixed(1);

                    const isRecommendedForVehicle = selectedVehicle && (
                      ((selectedVehicle.fuelType === "Hybrid" || selectedVehicle.fuelType === "EV") && (gar.name.toLowerCase().includes("ev") || gar.name.toLowerCase().includes("hybrid") || gar.services.some((s: string) => s.toLowerCase().includes("ev") || s.toLowerCase().includes("hybrid")))) ||
                      (selectedVehicle.fuelType === "Diesel" && (gar.name.toLowerCase().includes("diesel") || gar.services.some((s: string) => s.toLowerCase().includes("diesel"))))
                    );

                    return (
                      <div 
                        key={gar.id} 
                        className={`group relative flex flex-col justify-between p-4 rounded-2xl border transition-all duration-300 overflow-hidden ${
                          isRecommendedForVehicle
                            ? "bg-slate-900/50 hover:bg-slate-900/80 border-sky-500/25 shadow-lg shadow-sky-500/5"
                            : gar.isPartner
                              ? "bg-slate-900/30 hover:bg-slate-900/60 border-emerald-500/15"
                              : "bg-white/2 hover:bg-white/4 border-white/5 hover:border-white/10"
                        }`}
                      >
                        {/* Overlay Sparkle for auto-matching matches */}
                        {isRecommendedForVehicle && (
                          <div className="absolute top-2 right-2 bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md flex items-center gap-0.5 z-10">
                            <Sparkles className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                            <span>DRIVE MATCH</span>
                          </div>
                        )}

                        {/* Traditional partner seal */}
                        {!isRecommendedForVehicle && gar.isPartner && (
                          <div className="absolute top-2 right-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] font-bold px-1.5 py-0.5 rounded-md z-10">
                            PARTNER OUTLET
                          </div>
                        )}

                        <div className="space-y-3.5">
                          {/* Image Box */}
                          <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950/45 border border-white/5">
                            <img 
                              src={gar.imageUrl || "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=400"} 
                              alt={gar.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" 
                            />
                            {/* Short Distance badge bottom absolute left */}
                            <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-slate-950/80 text-white font-mono text-[9px] rounded-md font-bold leading-none border border-white/5">
                              {simulatedDistance} km away
                            </span>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-start justify-between gap-1">
                              <span className="text-[12.5px] font-black text-slate-100 group-hover:text-emerald-400 transition leading-tight">{gar.name}</span>
                            </div>

                            {/* Reviews & type column */}
                            <div className="flex items-center gap-2 text-[10px] text-slate-400">
                              <span className="text-[10px] text-slate-500 bg-white/5 px-2 py-0.5 rounded-md font-medium">{gar.type}</span>
                              <div className="flex items-center text-amber-400 font-bold shrink-0">
                                <Star className="w-3 h-3 fill-amber-400 inline shrink-0 mr-0.5 text-amber-400" />
                                <span>{gar.rating}</span>
                                <span className="text-slate-500 font-normal ml-0.5">({gar.reviewsCount})</span>
                              </div>
                            </div>

                            <p className="text-[10.5px] text-slate-400 leading-normal line-clamp-2 pt-1">{gar.description}</p>
                          </div>

                          {/* Detail Address Info */}
                          <div className="space-y-1.5 text-[10px] text-slate-500 pt-1.5 border-t border-white/5">
                            <div className="flex items-start gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                              <span className="line-clamp-1 leading-normal">{gar.address}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                              <span className="leading-none">{gar.phone}</span>
                            </div>
                          </div>

                          {/* Services Tags Column */}
                          <div className="flex flex-wrap gap-1 pt-1">
                            {gar.services?.slice(0, 3).map((serv: string) => (
                              <span key={serv} className="text-[8.5px] bg-slate-950/50 hover:bg-slate-950 text-slate-400 px-2 py-0.5 rounded-md border border-white/5 font-mono leading-none">
                                {serv}
                              </span>
                            ))}
                            {gar.services && gar.services.length > 3 && (
                              <span className="text-[8.5px] text-slate-500 px-1 font-mono leading-none flex items-center">
                                +{gar.services.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Booking Success Toast or CTS Buttons */}
                        <div className="pt-3 mt-3 border-t border-white/5">
                          {bookingSuccessGarageId === gar.id ? (
                            <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 p-2.5 rounded-xl text-[10px] space-y-1 animate-fade-in flex flex-col items-start w-full">
                              <span className="font-extrabold flex items-center gap-1 leading-none text-[11px] text-emerald-400">
                                <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                                Reservation Received!
                              </span>
                              <span>A service receptionist will reach out to you at {gar.phone} to finalize the checkup ticket.</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => {
                                  setBookingSuccessGarageId(gar.id);
                                  setTimeout(() => {
                                    setBookingSuccessGarageId(null);
                                  }, 5000);
                                }}
                                className="flex-1 py-1.5 px-3 bg-emerald-500 hover:bg-emerald-450 active:scale-95 text-slate-950 text-[10.5px] font-bold rounded-xl transition cursor-pointer text-center"
                              >
                                Book Appointment
                              </button>
                              {onNavigateTab && (
                                <button 
                                  onClick={() => onNavigateTab("garages")}
                                  className="p-1.5 px-2.5 bg-white/5 hover:bg-white/10 active:scale-95 rounded-xl border border-white/10 text-slate-300 text-[10.5px] font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0"
                                  title="View on Service Locator Map Route"
                                >
                                  <span>Route Maps</span>
                                  <ExternalLink className="w-3 h-3 shrink-0" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {filteredNearbyGarages.length === 0 && (
                    <div className="col-span-1 md:col-span-2 lg:col-span-3 py-10 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-3 bg-slate-950/20 border border-white/5 rounded-2xl">
                      <Compass className="w-10 h-10 text-slate-600 animate-pulse shrink-0" />
                      <div>
                        <span className="font-bold text-slate-350 block">No Service Outlets Found</span>
                        <span className="text-[10px] text-slate-500 mt-1 block">Adjust the category filters or select a different region of operations.</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Subscreen: Tab 2: VEHICLE MANAGEMENT DETAIL & FLEET VIEW */}
          {activeSubTab === 'vehicles' && (
            <div className="space-y-6">
              {!selectedVehicle ? (
                /* 1. Fleet Dashboard (Multi-car Card Grid) */
                <VehicleFleetView
                  vehicles={vehicles}
                  records={records}
                  pendingRequests={pendingRequests}
                  appointments={appointments}
                  onSelectVehicle={(v) => {
                    onSelectVehicle(v);
                    setActiveSpecTab('overview');
                  }}
                  onOpenQr={(v) => {
                    onSelectVehicle(v);
                    setActiveSpecTab('qr_code');
                  }}
                  onAddVehicle={onAddVehicle}
                  onBookGarage={(v) => {
                    onSelectVehicle(v);
                    setActiveSpecTab('appointments');
                  }}
                />
              ) : (
                /* 2. Full 9-Tab Vehicle Detail Page */
                <div className="space-y-6">
                  {/* Outer Subpage Header */}
                  <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4 border-b border-white/5 pb-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <button
                        onClick={() => onSelectVehicle(null)}
                        className="p-2.5 px-4 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-bold transition flex items-center gap-1 border border-white/5 cursor-pointer"
                      >
                        <span>← Back to Fleet</span>
                      </button>
                      <div className="space-y-0.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-xl font-black text-slate-100 tracking-tight">
                            {selectedVehicle.brand} {selectedVehicle.model} ({selectedVehicle.year})
                          </h2>
                          <span className="p-0.5 px-2 bg-sky-500/10 text-sky-400 font-mono text-[10px] font-bold rounded-lg border border-sky-500/20">
                            {selectedVehicle.plateNumber || "NO REG"}
                          </span>
                          <span className={`p-0.5 px-2 font-mono text-[10px] font-bold rounded-lg border uppercase ${
                            (selectedVehicle.status || 'Active') === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            (selectedVehicle.status || 'Active') === 'Inactive' ? 'bg-slate-500/10 text-slate-400 border-slate-500/20' :
                            (selectedVehicle.status || 'Active') === 'Under Repair' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse' :
                            (selectedVehicle.status || 'Active') === 'Sold/Transferred' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                            'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                          }`}>
                            Status: {selectedVehicle.status || 'Active'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">
                          {selectedVehicle.nickname ? `"${selectedVehicle.nickname}" • ` : ""}Manage authorization workflows, checklist logs, and ownership logs.
                        </p>
                      </div>
                    </div>

                    {/* Management and sandbox tools */}
                    <div className="flex flex-wrap items-center gap-2 self-start xl:self-auto">
                      {/* Sandbox switcher */}
                      <div className="flex items-center gap-1 p-0.5 bg-slate-950 rounded-xl border border-white/5 text-[10px] font-bold">
                        <span className="text-slate-500 px-1.5 uppercase text-[9px] tracking-wider">Role Play:</span>
                        {(['Owner', 'Garage', 'Super Admin'] as const).map((r) => (
                          <button
                            key={r}
                            onClick={() => {
                              setDemoUserRole(r);
                            }}
                            className={`p-1 px-2 rounded-lg transition text-[9px] ${demoUserRole === r ? 'bg-sky-500 text-slate-950 font-black' : 'text-slate-400 hover:text-slate-200'}`}
                          >
                            {r}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => {
                          setStatusValue(selectedVehicle.status || 'Active');
                          setStatusReason(selectedVehicle.statusReason || "");
                          setStatusDate(selectedVehicle.statusDate || new Date().toISOString().split('T')[0]);
                          setStatusNote(selectedVehicle.statusNote || "");
                          setStatusDocName(selectedVehicle.statusDocUrl || "");
                          if (selectedVehicle.repairGarageName) setRepairGarageNameState(selectedVehicle.repairGarageName);
                          if (selectedVehicle.repairStatus) setRepairStatusState(selectedVehicle.repairStatus);
                          if (selectedVehicle.repairEstCompletion) setRepairEstCompletionState(selectedVehicle.repairEstCompletion);
                          if (selectedVehicle.repairPendingInvoice) setRepairPendingInvoiceState(selectedVehicle.repairPendingInvoice);

                          setShowStatusUpdateModal(true);
                        }}
                        className="p-2 px-3 bg-sky-500 hover:bg-sky-600 text-slate-950 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow"
                      >
                        <Sliders className="w-3.5 h-3.5 text-slate-950" />
                        <span>Update Status</span>
                      </button>

                      <button
                        onClick={() => {
                          setTransferTarget(selectedVehicle.pendingTransferTarget || "");
                          setTransferDateState(selectedVehicle.pendingTransferDate || new Date().toISOString().split('T')[0]);
                          setTransferPrice(selectedVehicle.pendingTransferPrice ? String(selectedVehicle.pendingTransferPrice) : "");
                          setTransferNote(selectedVehicle.pendingTransferNote || "");
                          setTransferType(selectedVehicle.pendingTransferType || 'Full History Transfer');
                          setTransferDocName(selectedVehicle.transferDocUrl || "");
                          if (selectedVehicle.pendingTransferSelectedRecords) {
                            setSelectedRecordsToTransfer(selectedVehicle.pendingTransferSelectedRecords);
                          }
                          setShowTransferModal(true);
                        }}
                        className="p-2 px-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow"
                      >
                        <Send className="w-3.5 h-3.5 text-white" />
                        <span>Transfer Ownership</span>
                      </button>
                    </div>
                  </div>

                  {/* Horizontal Tab Bar switcher */}
                  <div className="flex gap-2 p-1.5 bg-slate-900/60 rounded-2xl overflow-x-auto border border-white/5 no-scrollbar scroll-smooth">
                    {[
                      { id: 'overview', name: 'Overview' },
                      { 
                        id: 'pending_requests', 
                        name: 'Pending Requests', 
                        badge: pendingRequests.filter(r => r.vehicleId === selectedVehicle.id && r.approvalStatus === 'pending_owner_approval').length 
                      },
                      { id: 'service_history', name: 'Service History' },
                      { id: 'monthly_maintenance', name: 'Monthly Checklist' },
                      { id: 'appointments', name: 'Appointments' },
                      { id: 'reminder_settings', name: 'Reminder Settings' },
                      { id: 'qr_code', name: 'QR Code' },
                      { id: 'documents', name: 'Documents' },
                      { id: 'garage_connections', name: 'Garage Access' },
                      { id: 'qr_scan_history', name: 'QR Scan History' },
                      { 
                        id: 'ownership_transfer', 
                        name: 'Transfer & Status', 
                        badge: incomingTransfers.filter(t => t.status === 'Pending').length 
                      },
                      { id: 'ownership_timeline', name: 'Timeline' },
                      { id: 'history_report', name: 'History Report' }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveSpecTab(tab.id as any)}
                        className={`p-2 px-4 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                          activeSpecTab === tab.id
                            ? 'bg-sky-500 text-slate-950 shadow'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                        }`}
                      >
                        <span>{tab.name}</span>
                        {!!tab.badge && (
                          <span className={`p-0.5 px-1.5 rounded-full text-[9px] font-black ${activeSpecTab === tab.id ? 'bg-slate-950 text-sky-400' : 'bg-rose-500 text-white animate-pulse'}`}>
                            {tab.badge}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Rendering Active Detail Sub-Tab */}
                  <div className="pt-2">
                    {/* SUBTAB 1: Overview Specs & Identity Profile */}
                    {activeSpecTab === 'overview' && (
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-4">
                        {/* LEFT COLUMN: VEHICLE DOSSIER, USEFUL INFO, & RESALE RATING */}
                        <div className="lg:col-span-5 space-y-6">
                          {/* 1. Identity & Spec parameters card */}
                          <div className="glass bg-slate-900/40 rounded-3xl p-5 space-y-4 relative overflow-hidden shadow-md border border-white/5">
                            <div className="flex items-center justify-between">
                              <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase flex items-center gap-1">
                                <Car className="w-4 h-4 text-sky-400" />
                                <span>Technical Passport</span>
                              </h3>
                              <button
                                onClick={() => setIsEditingVehicle(!isEditingVehicle)}
                                className="p-1 px-2.5 bg-sky-500/10 text-sky-450 border border-sky-500/20 text-[10px] uppercase font-bold rounded-lg hover:bg-sky-500/20 transition flex items-center gap-1 cursor-pointer"
                              >
                                <span>{isEditingVehicle ? "Close passport" : "Edit Details"}</span>
                              </button>
                            </div>

                            {isEditingVehicle ? (
                              <form onSubmit={handleSubmitVehicleEdit} className="space-y-4 text-xs">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-400 uppercase">Nickname Designator</label>
                                  <input
                                    type="text"
                                    value={editNickname}
                                    onChange={(e) => setEditNickname(e.target.value)}
                                    placeholder="e.g. Phnom Penh Executive Daily"
                                    className="w-full bg-slate-950/80 border border-white/10 p-2.5 rounded-xl text-slate-100 placeholder-slate-500 text-xs"
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Cambodian Plate Registration</label>
                                    <input
                                      type="text"
                                      value={editPlateNumber}
                                      onChange={(e) => setEditPlateNumber(e.target.value)}
                                      className="w-full bg-slate-950/80 border border-white/10 p-2.5 rounded-xl text-slate-100 font-mono text-xs"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Vehicle Type Style</label>
                                    <select
                                      value={editVehicleType}
                                      onChange={(e) => setEditVehicleType(e.target.value as any)}
                                      className="w-full bg-slate-950/80 border border-white/10 p-2.5 rounded-xl text-slate-100 text-xs"
                                    >
                                      {['Sedan', 'SUV', 'Pickup', 'Van', 'Moto', 'Truck', 'Hatchback', 'Other'].map(vTyp => (
                                        <option key={vTyp} value={vTyp}>{vTyp}</option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Acquisition Date</label>
                                    <input
                                      type="date"
                                      value={editPurchaseDate}
                                      onChange={(e) => setEditPurchaseDate(e.target.value)}
                                      className="w-full bg-slate-950/80 border border-white/10 p-2.5 rounded-xl text-slate-100 text-xs"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Investment Capital (USD)</label>
                                    <input
                                      type="number"
                                      value={editPurchasePrice}
                                      onChange={(e) => setEditPurchasePrice(e.target.value)}
                                      className="w-full bg-slate-950/80 border border-white/10 p-2.5 rounded-xl text-slate-100 font-mono text-xs"
                                    />
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-400 uppercase">Owner Personal Memo / Logs</label>
                                  <textarea
                                    value={editNotes}
                                    onChange={(e) => setEditNotes(e.target.value)}
                                    className="w-full h-16 bg-slate-950/80 border border-white/10 p-2.5 rounded-xl text-slate-100 resize-none text-xs"
                                  ></textarea>
                                </div>

                                <div className="border-t border-white/10 pt-3 space-y-3">
                                  <h4 className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">Marketplace Listing (SaaS Monetization MVP)</h4>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      id="editIsForSale"
                                      checked={editIsForSale}
                                      onChange={(e) => {
                                        setEditIsForSale(e.target.checked);
                                        if (e.target.checked) setEditMarketplaceStatus('Listed for Sale');
                                        else setEditMarketplaceStatus('Not Listed');
                                      }}
                                      className="w-4 h-4 rounded bg-slate-950 border-white/10 text-sky-500 focus:ring-sky-500 cursor-pointer"
                                    />
                                    <label htmlFor="editIsForSale" className="text-[11px] font-bold text-slate-300 cursor-pointer">
                                      List this vehicle for sale in Marketplace
                                    </label>
                                  </div>

                                  {editIsForSale && (
                                    <div className="space-y-2.5">
                                      <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                          <label className="text-[10px] font-bold text-slate-400 uppercase">Target Sale Price (USD)</label>
                                          <input
                                            type="number"
                                            value={editSalePrice}
                                            onChange={(e) => setEditSalePrice(e.target.value)}
                                            placeholder="e.g. 15500"
                                            className="w-full bg-slate-950/80 border border-white/10 p-2.5 rounded-xl text-slate-100 font-mono text-xs"
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <label className="text-[10px] font-bold text-slate-400 uppercase">Marketplace Status</label>
                                          <select
                                            value={editMarketplaceStatus}
                                            onChange={(e) => setEditMarketplaceStatus(e.target.value as any)}
                                            className="w-full bg-slate-950/80 border border-white/10 p-2.5 rounded-xl text-slate-100 text-xs"
                                          >
                                            <option value="Listed for Sale">Listed for Sale</option>
                                            <option value="Sold">Sold</option>
                                          </select>
                                        </div>
                                      </div>
                                      <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase">Listing Description / Ad Copy</label>
                                        <textarea
                                          value={editSaleDescription}
                                          onChange={(e) => setEditSaleDescription(e.target.value)}
                                          placeholder="Provide condition, upgrades, and pedigree for Cambodian buyers..."
                                          className="w-full h-16 bg-slate-950/80 border border-white/10 p-2.5 rounded-xl text-slate-100 resize-none text-xs"
                                        ></textarea>
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <button
                                  type="submit"
                                  disabled={savingVehicle}
                                  className="w-full py-2.5 bg-sky-550 bg-sky-400 text-slate-950 font-extrabold rounded-xl hover:bg-sky-500 transition cursor-pointer text-xs uppercase tracking-wider"
                                >
                                  {savingVehicle ? "Modifying passport parameter..." : "Update Technical Passport"}
                                </button>
                              </form>
                            ) : (
                              <div className="space-y-3.5 text-xs text-slate-300">
                                <div className="flex justify-between py-1.5 border-b border-white/5">
                                  <span className="text-slate-500 font-medium">Model Designation</span>
                                  <span className="font-extrabold text-slate-200">{selectedVehicle.brand} {selectedVehicle.model} ({selectedVehicle.year})</span>
                                </div>
                                <div className="flex justify-between py-1.5 border-b border-white/5">
                                  <span className="text-slate-500 font-medium">Plate Registration Number</span>
                                  <span className="font-mono font-bold text-sky-450 text-sky-400 bg-sky-400/5 px-2 py-0.5 rounded border border-sky-500/10">{selectedVehicle.plateNumber || "PP-2X-4505"}</span>
                                </div>
                                <div className="flex justify-between py-1.5 border-b border-white/5">
                                  <span className="text-slate-500 font-medium">Active Odometer Value</span>
                                  <span className="font-bold text-slate-200 font-mono">{selectedVehicle.mileage.toLocaleString()} km</span>
                                </div>
                                <div className="flex justify-between py-1.5 border-b border-white/5">
                                  <span className="text-slate-500 font-medium">Last Sync'd Service</span>
                                  <span className="font-bold text-emerald-400 font-mono">
                                    {selectedVehicle.lastServiceDate ? new Date(selectedVehicle.lastServiceDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : "None logged yet"}
                                  </span>
                                </div>
                                <div className="flex justify-between py-1.5 border-b border-white/5">
                                  <span className="text-slate-500 font-medium">Primary Fuel / Energy System</span>
                                  <span className="font-bold text-sky-450 text-sky-400 uppercase tracking-widest">{selectedVehicle.fuelType}</span>
                                </div>
                                {selectedVehicle.engineType && (
                                  <div className="flex justify-between py-1.5 border-b border-white/5">
                                    <span className="text-slate-500 font-medium">Engine Form Factor</span>
                                    <span className="font-bold text-slate-200">{selectedVehicle.engineType}</span>
                                  </div>
                                )}
                                {selectedVehicle.chassisNumber && (
                                  <div className="flex justify-between py-1.5 border-b border-white/5">
                                    <span className="text-slate-500 font-medium">Chassis Serial Number</span>
                                    <span className="font-mono text-slate-300 text-[10.5px] uppercase select-all">{selectedVehicle.chassisNumber}</span>
                                  </div>
                                )}
                                {selectedVehicle.transmission && (
                                  <div className="flex justify-between py-1.5 border-b border-white/5">
                                    <span className="text-slate-500 font-medium">Gearbox Transmission</span>
                                    <span className="font-bold text-slate-300">{selectedVehicle.transmission}</span>
                                  </div>
                                )}
                                {selectedVehicle.purchasePrice && (
                                  <div className="flex justify-between py-1.5 border-b border-white/5">
                                    <span className="text-slate-500 font-medium font-mono">Declared Asset Value</span>
                                    <span className="font-bold text-emerald-400 font-mono">${selectedVehicle.purchasePrice.toLocaleString()} USD</span>
                                  </div>
                                )}
                                <div className="pt-2 border-t border-white/5">
                                  <div className="flex justify-between py-1">
                                    <span className="text-slate-500 font-medium">Marketplace Listing Status</span>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                      selectedVehicle.isForSale
                                        ? selectedVehicle.marketplaceStatus === 'Sold'
                                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                          : 'bg-sky-500/10 text-sky-400 border border-sky-500/20 animate-pulse'
                                        : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                                    }`}>
                                      {selectedVehicle.isForSale ? selectedVehicle.marketplaceStatus || 'Listed for Sale' : 'Not Listed'}
                                    </span>
                                  </div>
                                  {selectedVehicle.isForSale && (
                                    <>
                                      <div className="flex justify-between py-1 font-mono text-xs mt-1">
                                        <span className="text-slate-500">Asking Ad Price</span>
                                        <span className="font-bold text-emerald-400">${selectedVehicle.salePrice?.toLocaleString() || "N/A"} USD</span>
                                      </div>
                                      {selectedVehicle.saleDescription && (
                                        <div className="mt-1 p-2 bg-slate-950/40 rounded-xl border border-white/5 text-[11px] text-slate-400 leading-relaxed italic">
                                          "{selectedVehicle.saleDescription}"
                                        </div>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* 2. Useful Cambodian Season Guide (Unique suggested highlight feature) */}
                          <div className="glass bg-sky-950/10 rounded-3xl p-5 space-y-4 border border-sky-500/10">
                            <h4 className="text-[11px] font-bold text-sky-400 uppercase tracking-widest flex items-center gap-1.5">
                              <Compass className="w-4 h-4 text-sky-400" />
                              <span>Cambodian Driving Guide - Monsoon Season</span>
                            </h4>
                            <p className="text-[11.5px] text-slate-300 leading-relaxed">
                              Phnom Penh is experiencing active tropical rainstorms during June. Ensure these safe limits are followed to shield your vehicle from heavy damage:
                            </p>
                            <div className="grid grid-cols-2 gap-3 text-[11px]">
                              {/* Limit 1 */}
                              <div className="p-2.5 bg-slate-900/60 rounded-xl space-y-1 border border-white/5">
                                <span className="text-slate-500 block uppercase font-mono tracking-wider font-extrabold text-[9px]">Wading Limit</span>
                                <span className="text-emerald-400 font-black block text-xs">
                                  {selectedVehicle.vehicleType === 'SUV' || selectedVehicle.vehicleType === 'Pickup' ? "600 mm (Safe clearance)" : "350 mm (Avoid deep pooling)"}
                                </span>
                              </div>
                              {/* Limit 2 */}
                              <div className="p-2.5 bg-slate-900/60 rounded-xl space-y-1 border border-white/5">
                                <span className="text-slate-500 block uppercase font-mono tracking-wider font-extrabold text-[9px]">Road Traction caution</span>
                                <span className="text-amber-400 font-black block text-xs">Monsoon Slick Danger</span>
                              </div>
                            </div>
                            <div className="p-3 bg-sky-500/5 rounded-2xl border border-sky-500/15 text-[11px] text-slate-350 leading-relaxed italic">
                              <strong>Wet-road Protection Tip:</strong> Hybrid models (like BYD PHEVs and Toyota Prius) have air intakes for high-voltage battery cooling packs located low. Never drive into standing water matching or exceeding your low door levels!
                            </div>
                          </div>

                          {/* 3. Specifications details based on Car (fuel, oil grades, tire pressure) */}
                          <div className="glass bg-slate-900/40 rounded-3xl p-5 space-y-4 border border-white/5">
                            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                              <Info className="w-4 h-4 text-sky-400" />
                              <span>Useful Diagnostic Specs</span>
                            </h4>
                            <div className="space-y-3.5 text-xs">
                              {/* Tire Pressure */}
                              <div className="p-3 bg-slate-950/60 rounded-2xl border border-white/5 flex justify-between items-center">
                                <div className="space-y-0.5">
                                  <span className="text-slate-400 font-bold block text-[11px]">Ideal Cold Tire Pressure</span>
                                  <span className="text-slate-500 text-[10px]">Adjust every 30 days</span>
                                </div>
                                <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/5 border border-amber-500/20 px-2 py-1 rounded-xl">
                                  {selectedVehicle.vehicleType === 'SUV' || selectedVehicle.vehicleType === 'Pickup' ? "35 PSI (Front/Rear)" : "32 PSI (Standard)"}
                                </span>
                              </div>

                              {/* Cambodia Fuel compatibility */}
                              <div className="p-3 bg-slate-950/60 rounded-2xl border border-white/5 flex justify-between items-center">
                                <div className="space-y-0.5">
                                  <span className="text-slate-400 font-bold block text-[11px]">Cambodia Fuel Suitability</span>
                                  <span className="text-slate-500 text-[10px]">Fuel efficiency optimization</span>
                                </div>
                                <span className="font-mono text-xs font-bold text-sky-400 bg-sky-500/5 border border-sky-500/20 px-2 py-1 rounded-xl">
                                  {selectedVehicle.fuelType === 'Diesel' ? 'Premium Diesel Euro 5' : 'Gasoline Premium 95'}
                                </span>
                              </div>

                              {/* A/C Refrigerant guidelines */}
                              <div className="p-3 bg-slate-950/60 rounded-2xl border border-white/5 flex justify-between items-center">
                                <div className="space-y-0.5">
                                  <span className="text-slate-400 font-bold block text-[11px]">A/C Compressor Refrigerant</span>
                                  <span className="text-slate-500 text-[10px]">Essential in tropical climate</span>
                                </div>
                                <span className="font-mono text-[11px] font-bold text-slate-300">
                                  {selectedVehicle.year > 2018 ? "R1234yf (ECO Class)" : "R134a (Climate Class)"}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* 4. Resale Value Retention Rating Card */}
                          <div className="glass bg-slate-900/40 rounded-3xl p-5 space-y-4 border border-white/5 relative overflow-hidden">
                            <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl"></div>
                            <div className="flex items-center gap-2">
                              <TrendingUp className="w-4 h-4 text-emerald-400" />
                              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Cambodian Resale Retention Rating</h4>
                            </div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-3xl font-black text-emerald-400 font-mono">
                                {selectedVehicle.brand === 'Toyota' ? "94%" : selectedVehicle.brand === 'Lexus' ? "88%" : "83%"}
                              </span>
                              <span className="text-xs text-slate-400 font-medium">Value Retention Score</span>
                            </div>
                            <p className="text-[11.5px] text-slate-400 leading-relaxed leading-relaxed">
                              Japanese models (Toyota & Lexus) and verified utility heavy commercial platforms maintain exceptionally high secondary prices in Phnom Penh and Siem Reap.
                            </p>
                            <div className="p-3 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 text-[11px] text-emerald-300 font-medium">
                              💡 <strong>Boost resale up to +12%:</strong> Showcasing a consolidated, digital timeline of verified service logs completely verified by QR scan with certified garages eliminates buyer odometer worries.
                            </div>
                          </div>

                          {/* Retaining model manual warnings correctly */}
                          {selectedVehicle.weaknessReport && (
                            <div className="glass rounded-3xl p-5 space-y-3.5 border border-white/5">
                              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                                <span>Specific Model Vulnerability Points</span>
                              </h4>
                              <p className="text-slate-400 text-xs leading-relaxed italic">
                                "{ (selectedVehicle.weaknessReport as any).knownIssuesSummary || (selectedVehicle.weaknessReport.commonIssues && selectedVehicle.weaknessReport.commonIssues[0]?.issue) || "No explicit high priority vulnerabilities detected." }"
                              </p>
                              <div className="pt-2 space-y-2">
                                {selectedVehicle.weaknessReport.monthlyChecklist.map((ch, idx) => (
                                  <div key={idx} className="flex items-center gap-2 text-xs p-2 bg-white/5 border border-white/5 rounded-xl">
                                    <span className="h-1.5 w-1.5 bg-sky-400 rounded-full"></span>
                                    <span className="text-slate-300 font-semibold">{ch}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* RIGHT COLUMN: ACTIONABLE GARAGE REQUESTS, DYNAMIC SUGGESTIONS, & SERVICE HISTORY TIMELINE */}
                        <div className="lg:col-span-7 space-y-6">
                          
                          {/* 1. Pending Garage Approvals Teaser Link (A request pending from garage integration) */}
                          {pendingRequests.filter(r => r.vehicleId === selectedVehicle.id && r.approvalStatus === 'pending_owner_approval').length > 0 && (
                            <div className="glass bg-amber-500/10 border-2 border-amber-500/40 p-5 rounded-3xl space-y-4 relative overflow-hidden active-ring shadow-xl">
                              <div className="absolute right-0 top-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl"></div>
                              <div className="flex items-center gap-2.5">
                                <div className="p-2 bg-amber-400 text-slate-950 rounded-xl">
                                  <Activity className="w-4 h-4 animate-spin" />
                                </div>
                                <div className="space-y-0.5">
                                  <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest font-mono">Action Required</span>
                                  <h4 className="font-extrabold text-slate-100 text-sm">Pending Garage Service Ticket</h4>
                                </div>
                              </div>
                              <p className="text-xs text-slate-305 text-slate-300">
                                A Cambodian service bay has scanned this vehicle and submitted diagnostic log checklists and billing itemizations requesting your express approval.
                              </p>

                              <div className="space-y-2">
                                {pendingRequests
                                  .filter(r => r.vehicleId === selectedVehicle.id && r.approvalStatus === 'pending_owner_approval')
                                  .slice(0, 2)
                                  .map((request) => (
                                    <div key={request.id} className="p-3.5 bg-slate-950/80 rounded-2xl border border-white/5 space-y-3">
                                      <div className="flex justify-between items-start">
                                        <div>
                                          <h5 className="text-[12.5px] font-black text-slate-200">{request.providerName}</h5>
                                          <p className="text-[10px] text-slate-500 font-mono">{request.serviceDate} • Odometer: {request.currentMileage?.toLocaleString()} km</p>
                                        </div>
                                        <span className="font-mono text-sm font-black text-amber-400">${request.cost}</span>
                                      </div>
                                      <p className="text-xs text-slate-400 italic">"{request.note || "System diagnostics check"}"</p>
                                      
                                      <div className="flex gap-2.5 pt-1">
                                        <button
                                          onClick={() => handleApproveRecord(request.id)}
                                          className="flex-1 py-1.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-[11px] rounded-lg tracking-wider transition cursor-pointer uppercase font-mono"
                                        >
                                          Approve & Add to Log
                                        </button>
                                        <button
                                          onClick={() => setActiveSpecTab('pending_requests')}
                                          className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-[11px] rounded-lg transition cursor-pointer text-center"
                                        >
                                          Review Details
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}

                          {/* 2. AI Dynamic Preventive Suggestion Planner (Based on mileage and fuel type) */}
                          <div className="glass bg-slate-900/40 p-6 rounded-3xl border border-white/5 space-y-4">
                            <div className="flex justify-between items-center border-b border-white/5 pb-3">
                              <div className="flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-sky-400" />
                                <div>
                                  <h3 className="text-xs font-black text-slate-200 uppercase tracking-widest font-mono">Dynamic Monthly Suggestions</h3>
                                  <p className="text-[10.5px] text-slate-450 text-slate-450 text-slate-400">Custom preventive items based on {selectedVehicle.brand} specs & logs.</p>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-3 pt-1">
                              {/* Resolve recommendations dynamically */}
                              {[
                                ...(selectedVehicle.fuelType === 'Hybrid' || selectedVehicle.fuelType === 'EV' ? [
                                  {
                                    id: "rec1",
                                    cat: "Battery Cooling",
                                    title: "Clean High-Voltage Battery Cooling Fan Inlet",
                                    desc: "Prevent battery deck overheating during Phnom Penh noon humidity cycles.",
                                    estCost: 45,
                                    dueKm: selectedVehicle.mileage + 3000
                                  },
                                  {
                                    id: "rec2",
                                    cat: "Software Update",
                                    title: "Firmware Diagnostics & OTA Audit",
                                    desc: "Request certified garage to update vehicle management controller codes.",
                                    estCost: 15,
                                    dueKm: selectedVehicle.mileage + 8000
                                  }
                                ] : selectedVehicle.fuelType === 'Diesel' ? [
                                  {
                                    id: "rec1",
                                    cat: "Fuel System",
                                    title: "Flushing Diesel Fuel Water Separator",
                                    desc: "Avoid high-sulfur diesel impurities blocking fuel injectors and causing dark smoke.",
                                    estCost: 35,
                                    dueKm: selectedVehicle.mileage + 4000
                                  },
                                  {
                                    id: "rec2",
                                    cat: "DPF Exhaust",
                                    title: "Inspect DPF (Diesel Particulate Filter) Ash",
                                    desc: "Keep backpressure balanced during heavy freight cargo deliveries.",
                                    estCost: 80,
                                    dueKm: selectedVehicle.mileage + 12000
                                  }
                                ] : [
                                  {
                                    id: "rec1",
                                    cat: "Engine System",
                                    title: "Throttle Body & Fuel Injection Scan",
                                    desc: "Restore idling smoothness during high-traffic urban gridlocks.",
                                    estCost: 55,
                                    dueKm: selectedVehicle.mileage + 5000
                                  },
                                  {
                                    id: "rec2",
                                    cat: "Drive System",
                                    title: "Timing System Belt Seam Check",
                                    desc: "Crucial for older classic engine blocks to offset sudden road snaps.",
                                    estCost: 120,
                                    dueKm: selectedVehicle.mileage + 15000
                                  }
                                ]),
                                {
                                  id: "rec3",
                                  cat: "Brake System",
                                  title: "Inspect Hydraulic Brake Oil Transparency",
                                  desc: "Moisture breaks safety limits during sudden downpours. Essential checklist log.",
                                  estCost: 20,
                                  dueKm: selectedVehicle.mileage + 2000
                                }
                              ].map((recommendation) => (
                                <div key={recommendation.id} className="p-4 bg-slate-950/60 rounded-2xl border border-white/5 hover:border-sky-500/10 transition leading-snug space-y-2.5">
                                  <div className="flex justify-between items-start gap-2">
                                    <div>
                                      <span className="p-0.5 px-2 bg-slate-900 border border-white/10 text-slate-400 uppercase tracking-wider font-mono text-[8px] font-bold rounded-md">
                                        {recommendation.cat}
                                      </span>
                                      <h5 className="font-extrabold text-[12.5px] text-slate-200 mt-1">{recommendation.title}</h5>
                                      <p className="text-[11.5px] text-slate-400 mt-1 leading-normal">{recommendation.desc}</p>
                                    </div>
                                    <div className="text-right">
                                      <span className="text-xs font-mono font-bold text-emerald-400 block">${recommendation.estCost}</span>
                                      <span className="text-[9px] text-slate-500 block font-mono">Est. Price</span>
                                    </div>
                                  </div>

                                  <div className="flex justify-between items-center text-[10.5px] pt-1.5 border-t border-white/5">
                                    <span className="text-slate-500">Suggested Action within: <strong className="text-slate-355 font-mono text-slate-300">{(recommendation.dueKm - selectedVehicle.mileage).toLocaleString()} km</strong></span>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleQuickLogService(recommendation.cat, recommendation.title, recommendation.estCost, selectedVehicle.mileage)}
                                        disabled={quickLogging}
                                        className="p-1 px-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase rounded-lg transition cursor-pointer"
                                      >
                                        {quickLogging ? "Saving..." : "Log Done"}
                                      </button>
                                      <button
                                        onClick={() => setActiveSpecTab('appointments')}
                                        className="p-1 px-2.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 text-[10px] font-bold uppercase rounded-lg transition cursor-pointer"
                                      >
                                        Book Garage
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* 3. Dynamic Maintenance Logs Timeline */}
                          <div className="glass rounded-3xl p-6 space-y-4 shadow-md border border-white/5">
                            <div className="flex justify-between items-center border-b border-white/5 pb-3">
                              <div className="space-y-0.5">
                                <h3 className="text-xs font-black text-slate-200 uppercase tracking-widest font-mono flex items-center gap-1.5">
                                  <ClipboardList className="w-4 h-4 text-sky-400" />
                                  <span>Logged Services & Receipts</span>
                                </h3>
                                <p className="text-[10px] text-slate-500">Comprehensive self-archived chronological logs.</p>
                              </div>
                              <div className="flex items-center gap-2">
                                {activeRecords.length > 0 && (
                                  <button
                                    onClick={downloadServiceHistoryCsv}
                                    title="Download Service History as CSV"
                                    className="p-1.5 px-3 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-450 text-indigo-400 font-bold border border-indigo-500/20 rounded-xl text-xs transition flex items-center gap-1 cursor-pointer"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                    <span>Download CSV</span>
                                  </button>
                                )}
                                <button
                                  onClick={onAddRecord}
                                  className="p-1.5 px-3 bg-sky-500/10 hover:bg-sky-500/20 text-sky-450 text-sky-400 font-bold border border-sky-500/20 rounded-xl text-xs transition flex items-center gap-1 cursor-pointer"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Add Record</span>
                                </button>
                              </div>
                            </div>

                            <div className="space-y-4 relative pl-4 border-l border-white/10 mt-3 max-h-[420px] overflow-y-auto pr-2 no-scrollbar">
                              {activeRecords.map(rec => (
                                <div key={rec.id} className="relative space-y-1">
                                  <span className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 bg-sky-400 rounded-full border-2 border-slate-900"></span>
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="text-[9px] bg-sky-500/10 text-sky-450 text-sky-400 font-black uppercase py-0.5 px-2 rounded-md border border-sky-550/15">{rec.serviceCategory}</span>
                                        {(rec as any).isPending && (
                                          <span className="text-[9px] bg-yellow-500/15 text-yellow-500 font-extrabold uppercase py-0.5 px-2 rounded-md border border-yellow-500/20 animate-pulse">⏳ Offline Sync Pending</span>
                                        )}
                                      </div>
                                      <h4 className="text-xs font-extrabold text-slate-200 mt-1">{rec.provider}</h4>
                                    </div>
                                    <span className="text-xs font-mono font-bold text-sky-400 mt-1">${rec.cost}</span>
                                  </div>
                                  <p className="text-xs text-slate-400 leading-relaxed font-medium">"{rec.description}"</p>
                                  <div className="flex gap-4 text-[10px] text-slate-500 font-medium pt-1">
                                    <span>Odometer: {rec.mileage.toLocaleString()} km</span>
                                    <span>Logged: {rec.date}</span>
                                  </div>
                                  <div className="flex justify-end pt-0.5">
                                    <button
                                      onClick={() => onDeleteRecord(rec.id)}
                                      className="text-[9px] text-slate-500 hover:text-rose-400 font-bold uppercase transition hover:underline cursor-pointer"
                                    >
                                      Delete log
                                    </button>
                                  </div>
                                </div>
                              ))}

                              {activeRecords.length === 0 && (
                                <div className="text-center py-12 text-slate-500 text-xs text-slate-400 border border-dashed border-white/10 rounded-2xl bg-white/5 space-y-1">
                                  <p className="font-extrabold text-slate-300 text-sm">No historical logs registered</p>
                                  <p className="text-slate-400 max-w-sm mx-auto leading-relaxed text-[11px] px-4">Create a service log from invoices, parts purchases, or mechanical tasks manually above to bootstrap metrics!</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SUBTAB 2: Pending Garage Authorization Requests */}
                    {activeSpecTab === 'pending_requests' && (
                      <PendingRequestsTab
                        vehicleId={selectedVehicle.id}
                        pendingRequests={pendingRequests}
                        onApprove={handleApproveRecord}
                        onRequestCorrection={handleRequestCorrectionRecord}
                        onDispute={handleDisputeRecord}
                        refreshData={fetchPendingRequests}
                      />
                    )}

                    {/* SUBTAB 3: Combined Approved Service History Timeline */}
                    {activeSpecTab === 'service_history' && (
                      <div className="glass rounded-3xl p-6 border border-white/5 space-y-4">
                        <div>
                          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                            Authorized Service History Portfolio
                          </h3>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Combined verified history logged by car owner and approved partner garages.
                          </p>
                        </div>

                        <div className="space-y-6 relative pl-4 border-l border-white/10 mt-6 max-h-[600px] overflow-y-auto pr-2">
                          {[
                            ...activeRecords.map(r => ({ ...r, origin: 'manual' })),
                            ...pendingRequests.filter(r => r.vehicleId === selectedVehicle.id && r.approvalStatus === 'approved').map(r => ({ ...r, origin: 'garage', provider: r.providerName, description: r.note, date: r.serviceDate }))
                          ]
                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                            .map((item, idx) => (
                              <div key={item.id || idx} className="relative space-y-2">
                                <span className={`absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${item.origin === 'garage' ? 'bg-emerald-400' : 'bg-sky-400'}`}></span>
                                <div className="flex justify-between items-start">
                                  <div className="space-y-1">
                                    <div className="flex flex-wrap items-center gap-1.5">
                                      <span className="text-[10px] bg-slate-900 text-slate-300 font-bold uppercase py-0.5 px-2 rounded-md border border-white/5">
                                        {item.serviceCategory}
                                      </span>
                                      <span className={`p-0.5 px-1.5 rounded text-[8px] font-bold uppercase font-mono ${item.origin === 'garage' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-sky-500/10 text-sky-400'}`}>
                                        {item.origin === 'garage' ? "Approved Garage Ticket" : "Manual Log"}
                                      </span>
                                    </div>
                                    <h4 className="text-sm font-extrabold text-slate-100">{item.provider || "Self-made Log"}</h4>
                                  </div>
                                  <span className="text-sm font-mono font-black text-emerald-400">${item.cost}</span>
                                </div>
                                <p className="text-xs text-slate-400 leading-relaxed italic font-medium">
                                  "{item.description || "No specific detailed description logged."}"
                                </p>
                                <div className="flex flex-wrap gap-4 text-[10px] text-slate-500 font-semibold pt-1 uppercase font-mono">
                                  <span>Odometer: {item.mileage?.toLocaleString()} km</span>
                                  <span>Date: {item.date}</span>
                                  {item.partsChanged && <span>Replaced: {item.partsChanged}</span>}
                                  {item.warranty && <span className="text-amber-400 font-bold">Warranty: {item.warranty}</span>}
                                </div>
                              </div>
                            ))}

                          {activeRecords.length === 0 && pendingRequests.filter(r => r.vehicleId === selectedVehicle.id && r.approvalStatus === 'approved').length === 0 && (
                            <div className="text-center py-12 text-slate-500 text-xs">
                              No historical logs registered or approved yet.
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* SUBTAB 4: Monthly Inspection Checklist */}
                    {activeSpecTab === 'monthly_maintenance' && (
                      <MonthlyMaintenanceTab
                        vehicleId={selectedVehicle.id}
                        checklists={monthlyChecklists}
                        onToggleItem={handleToggleMonthlyItem}
                        onCreateChecklist={handleCreateMonthlyChecklist}
                        refreshData={fetchMonthlyChecklists}
                      />
                    )}

                    {/* SUBTAB 5: Booking & Scheduling */}
                    {activeSpecTab === 'appointments' && (
                      <AppointmentsTab
                        vehicleId={selectedVehicle.id}
                        appointments={appointments}
                        onBookAppointment={handleBookAppointment}
                        onCancelAppointment={handleCancelAppointment}
                        refreshData={fetchAppointments}
                      />
                    )}

                    {/* SUBTAB 6: Intelligent Notifications Reminders (retaining smart algorithms correctly) */}
                    {activeSpecTab === 'reminder_settings' && (
                      <div className="space-y-6 pb-4">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                          {/* Pre-existing Add reminder segment */}
                          <div className="lg:col-span-5 space-y-6">
                            <div className="glass rounded-3xl p-5 space-y-4 shadow-md">
                              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase">
                                  Configure Intelligent Service Rule
                                </h3>
                                <button
                                  onClick={() => setShowAddReminderPanel(!showAddReminderPanel)}
                                  className="p-1 px-2.5 bg-sky-505/10 text-sky-400 border border-sky-505/20 text-[10px] uppercase font-bold rounded-lg transition flex items-center gap-1 cursor-pointer"
                                >
                                  <span>{showAddReminderPanel ? "Collapse" : "Create"}</span>
                                </button>
                              </div>

                              {showAddReminderPanel ? (
                                <form onSubmit={handleAddReminderSubmit} className="space-y-4 text-xs">
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Reminder Title</label>
                                    <input
                                      type="text"
                                      value={remTitle}
                                      onChange={(e) => setRemTitle(e.target.value)}
                                      placeholder="e.g. Rotate Rear Tyres"
                                      required
                                      className="w-full bg-white/5 border border-white/10 p-2 rounded-xl text-slate-100 font-medium"
                                    />
                                  </div>
                                  <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                      <label className="text-[10px] font-bold text-slate-400 uppercase">Interval Category</label>
                                      <select
                                        value={remCategory}
                                        onChange={(e) => setRemCategory(e.target.value)}
                                        className="w-full bg-slate-900 border border-white/10 p-2 rounded-xl text-slate-100 font-medium"
                                      >
                                        {['Engine oil service', 'Cabin air filter', 'Gearbox oil flush', 'Tyre alignment check', 'Brake pads inspect', 'Custom reminder'].map(cRem => (
                                          <option key={cRem} value={cRem}>{cRem}</option>
                                        ))}
                                      </select>
                                    </div>
                                    <div className="space-y-1">
                                      <label className="text-[10px] font-bold text-slate-400 uppercase">Interval Rules Engine</label>
                                      <select
                                        value={remType}
                                        onChange={(e) => setRemType(e.target.value as any)}
                                        className="w-full bg-slate-900 border border-white/10 p-2 rounded-xl text-slate-100 font-medium"
                                      >
                                        <option value="date_based">Date-Based alarm ONLY</option>
                                        <option value="mileage_based">Odometer Limit ONLY</option>
                                        <option value="date_and_mileage">Hybrid Interval (First occurrences)</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                      <label className="text-[10px] font-bold text-slate-400 uppercase">Due Date limit</label>
                                      <input
                                        type="date"
                                        value={remDueDate}
                                        onChange={(e) => setRemDueDate(e.target.value)}
                                        className="w-full bg-white/5 border border-white/15 p-2 rounded-xl text-slate-100 font-mono"
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <label className="text-[10px] font-bold text-slate-400 uppercase">Odometer limit (km)</label>
                                      <input
                                        type="number"
                                        value={remDueMileage}
                                        onChange={(e) => setRemDueMileage(e.target.value)}
                                        className="w-full bg-white/5 border border-white/15 p-2 rounded-xl text-slate-100 font-mono"
                                      />
                                    </div>
                                  </div>
                                  <button
                                    type="submit"
                                    disabled={remSaving}
                                    className="w-full py-2 bg-sky-500 text-slate-950 font-black rounded-xl hover:bg-sky-600 transition cursor-pointer"
                                  >
                                    {remSaving ? "Compiling rules..." : "Inject Smart Reminder"}
                                  </button>
                                </form>
                              ) : (
                                <div className="text-xs text-slate-400 leading-relaxed space-y-2 font-medium">
                                  <p>
                                    Intelligent intervals process both time vectors and odometer wear vectors.
                                  </p>
                                  <p>
                                    <strong>Hybrid mode:</strong> Triggers notifications as soon as either limit passes first. Useful for engine lubrication.
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* List of reminders */}
                          <div className="lg:col-span-7 glass rounded-3xl p-6 space-y-4 shadow-md border border-white/5">
                            <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Active Alarm Reminders</h4>
                            <div className="space-y-3.5 pr-1 max-h-[450px] overflow-y-auto">
                              {reminders.map((rem) => {
                                const isOverdue = rem.status === 'Overdue';
                                return (
                                  <div key={rem.id} className="p-3.5 bg-slate-950/40 border border-white/5 rounded-2xl flex justify-between items-start text-xs hover:border-white/10 transition">
                                    <div className="space-y-1.5 max-w-xs">
                                      <div className="flex items-center gap-2">
                                        <span className="font-extrabold text-slate-200">{rem.title}</span>
                                        <span className={`p-0.5 px-1.5 border rounded-lg text-[8px] font-bold font-mono tracking-wider ${isOverdue ? 'color-rose-badge border-rose-500/20 text-rose-400 bg-rose-500/10 animate-pulse' : 'border-sky-500/20 text-sky-400 bg-sky-500/10'}`}>
                                          {rem.status}
                                        </span>
                                      </div>
                                      <p className="text-[11px] text-slate-400">{rem.category}</p>
                                      <div className="flex gap-3 text-[10px] text-slate-500 font-mono">
                                        {rem.dueDate && <span>Date Due: {rem.dueDate}</span>}
                                        {rem.dueMileage && <span>OD Due: {rem.dueMileage.toLocaleString()} km</span>}
                                      </div>
                                    </div>
                                    <div className="flex gap-1">
                                      <button
                                        onClick={() => handleCompleteReminder(rem.id)}
                                        className="p-1 px-2.5 bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded-lg transition hover:scale-101 cursor-pointer"
                                        title="Mark Complete"
                                      >
                                        Done
                                      </button>
                                      <button
                                        onClick={() => handleSnoozeReminder(rem.id)}
                                        className="p-1 px-2.5 bg-slate-900 border border-white/10 hover:bg-slate-800 text-slate-355 text-[10px] font-bold rounded-lg transition cursor-pointer"
                                      >
                                        Snooze
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}

                              {reminders.length === 0 && (
                                <p className="text-center text-slate-500 py-12 font-semibold">No reminders currently active.</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Automated Maintenance Milestone Predictor Engine */}
                        <div className="glass rounded-[2rem] p-6 border border-white/5 shadow-2xl relative overflow-hidden bg-slate-900/60 space-y-6">
                          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/5 pb-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="p-1 px-2.5 bg-sky-400 text-slate-950 font-black text-[9px] rounded-full uppercase tracking-widest leading-none">AUTO-BOT ENGINE</span>
                                <h4 className="text-sm font-black text-slate-100 uppercase tracking-widest flex items-center gap-1.5">
                                  <Brain className="w-4 h-4 text-sky-400 animate-pulse" />
                                  <span>Automated Maintenance Milestones</span>
                                </h4>
                              </div>
                              <p className="text-[11px] text-slate-400 max-w-2xl">
                                Our dynamic diagnostic predictor engine analyzes engine blueprint specs (<strong className="text-slate-350">{selectedVehicle.engineType || selectedVehicle.fuelType || "Gasoline"}</strong>), wear-history (<strong className="text-slate-350">{selectedVehicle.mileage.toLocaleString()} km</strong>), and chassis age (<strong className="text-slate-350">{2026 - selectedVehicle.year} years</strong>) to generate critical upcoming system thresholds.
                              </p>
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono self-end">
                              Engine Status: Online
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {getCalculatedMilestones(selectedVehicle).map((ms) => (
                              <div key={ms.id} className="p-4 bg-slate-950/40 hover:bg-slate-950/60 border border-white/5 rounded-2xl flex flex-col justify-between space-y-4 transition hover:border-sky-500/20 group relative overflow-hidden">
                                <span className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-2xl group-hover:bg-sky-500/10 transition-colors"></span>
                                
                                <div className="space-y-2.5 relative z-10">
                                  <div className="flex justify-between items-center">
                                    <span className="text-[9px] font-black uppercase tracking-wider text-sky-400 bg-sky-500/10 p-0.5 px-2 rounded-lg border border-sky-500/10">
                                      {ms.category}
                                    </span>
                                    <span className="text-[8px] font-mono text-slate-500">
                                      {ms.intervalType}
                                    </span>
                                  </div>

                                  <h5 className="text-xs font-black text-slate-200 leading-snug group-hover:text-white transition">
                                    {ms.title}
                                  </h5>

                                  <p className="text-[11px] text-slate-400 leading-relaxed">
                                    {ms.description}
                                  </p>

                                  <div className="p-2 bg-white/3 rounded-xl space-y-1 border border-white/5">
                                    <span className="text-[8px] font-mono p-0.5 px-1.5 uppercase tracking-wider text-slate-400 bg-slate-900 rounded block w-max leading-none mb-1">
                                      Milestone Triggers
                                    </span>
                                    <p className="text-[9.5px] font-bold text-slate-300 leading-relaxed">
                                      {ms.triggerReason}
                                    </p>
                                  </div>
                                </div>

                                <div className="space-y-3 pt-2 border-t border-white/5 relative z-10">
                                  <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
                                    <span>Target Range:</span>
                                    <strong className="text-slate-300">{ms.targetOdo.toLocaleString()} km</strong>
                                  </div>
                                  <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
                                    <span>Target Date:</span>
                                    <strong className="text-slate-300">{ms.estimatedDueDate}</strong>
                                  </div>
                                  <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
                                    <span>Recommended Part:</span>
                                    <strong className="text-sky-400 text-[9px] text-right max-w-[140px] truncate" title={ms.recommendedProduct}>
                                      {ms.recommendedProduct}
                                    </strong>
                                  </div>

                                  <button
                                    onClick={() => syncToCalendar(ms)}
                                    className="w-full py-2 bg-white/5 hover:bg-sky-400/10 hover:text-sky-400 border border-white/10 hover:border-sky-500/20 text-slate-300 font-mono text-[9px] uppercase tracking-wider font-extrabold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                                  >
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span>Sync to Calendar</span>
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SUBTAB 7: Cryptographic QR Code Certificate Certificate */}
                    {activeSpecTab === 'qr_code' && (
                      <QrCodeTab
                        vehicle={selectedVehicle}
                        onRegenerateToken={handleRegenerateToken}
                        refreshData={() => {
                          // Quick parent page refresh to load regenerated token parameters
                          window.location.reload();
                        }}
                      />
                    )}

                    {/* SUBTAB 8: Secure Paper Cabinet Documents Registration */}
                    {activeSpecTab === 'documents' && (
                      <div className="glass rounded-3xl p-6 border border-white/5 space-y-5">
                        <div className="flex justify-between items-center border-b border-white/5 pb-2">
                          <div>
                            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                              Secure Document Cabinet Wallet
                            </h3>
                            <p className="text-xs text-slate-400 mt-0.5">
                              Store and retrieve registration, Forte insurance, and other vehicle papers.
                            </p>
                          </div>
                          <button
                            onClick={() => setShowAddDocModal(true)}
                            className="p-2 bg-sky-505/10 hover:bg-sky-500/20 text-sky-450 font-bold border border-sky-555/15 rounded-xl text-xs transition flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5 animate-pulse" />
                            <span>Upload Document</span>
                          </button>
                        </div>

                        {/* List of documents */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {activeDocuments.map((doc) => (
                            <div key={doc.id} className="p-3.5 bg-slate-950/40 border border-white/5 hover:border-white/10 rounded-2xl transition flex justify-between items-center text-xs">
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-slate-400" />
                                <div>
                                  <span className="font-bold text-slate-200 block">{doc.title}</span>
                                  <span className="text-[10px] text-slate-500 block">{doc.category} • {doc.fileSize} • {doc.uploadDate}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <a
                                  href={doc.fileUrl || "#"}
                                  className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-sky-400 border border-white/5 transition"
                                  title="Download card copy"
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  <Download className="w-3.5 h-3.5 text-sky-400" />
                                </a>
                                <button
                                  onClick={() => handleDeleteDocument(doc.id)}
                                  className="p-1.5 hover:bg-rose-500/10 rounded-lg text-slate-500 hover:text-rose-455 transition cursor-pointer"
                                  title="Remove file mapping"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}

                          {activeDocuments.length === 0 && (
                            <div className="md:col-span-2 text-center py-12 text-slate-500 font-semibold">
                              Cabinet is currently empty. Re-save paperwork using the upload trigger.
                            </div>
                          )}
                        </div>

                        {/* Add Document interactive panel form popup */}
                        {showAddDocModal && (
                          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-955/80 backdrop-blur-md">
                            <form onSubmit={handleAddDocSubmit} className="glass rounded-3xl p-4 max-w-sm w-full relative z-10 space-y-4 shadow-2xl border border-white/10">
                              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                                  <FileText className="w-4.5 h-4.5 text-sky-400" />
                                  <span>Archive Paper Copy</span>
                                </h3>
                                <button type="button" onClick={() => setShowAddDocModal(false)} className="cursor-pointer"><X className="w-4 h-4 text-slate-400" /></button>
                              </div>

                              <div className="space-y-4 text-xs">
                                <div className="space-y-1">
                                  <label className="text-[10px] uppercase font-bold text-slate-400">Class Category</label>
                                  <select
                                    value={docCategory}
                                    onChange={(e) => setDocCategory(e.target.value as any)}
                                    className="w-full bg-slate-900 border border-white/10 p-2 rounded-xl focus:border-white/20"
                                  >
                                    <option value="Registration Card">Registration Card (Yellow card)</option>
                                    <option value="Insurance Document">Insurance Document policy</option>
                                    <option value="Road Tax Document">Road Tax Document annual slip</option>
                                    <option value="Purchase Invoice">Purchase invoice receipt</option>
                                    <option value="Service Invoice">Service invoice copy</option>
                                    <option value="Other">Other Miscellaneous Paper</option>
                                  </select>
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] uppercase font-bold text-slate-400">File Display Label</label>
                                  <input
                                    type="text"
                                    value={docTitle}
                                    onChange={(e) => setDocTitle(e.target.value)}
                                    placeholder="e.g. Yellow card registration Tacoma"
                                    required
                                    className="w-full bg-white/5 border border-white/10 p-2 rounded-xl text-slate-100 font-medium"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] uppercase font-bold text-slate-400">Simulated Filename Link</label>
                                  <input
                                    type="text"
                                    value={docFileName}
                                    onChange={(e) => setDocFileName(e.target.value)}
                                    placeholder="e.g. tacoma_registration.pdf"
                                    required
                                    className="w-full bg-white/5 border border-white/10 p-2 rounded-xl font-mono text-slate-100"
                                  />
                                </div>
                                <button
                                  type="submit"
                                  disabled={docSaving}
                                  className="w-full py-2 bg-sky-500 hover:bg-sky-600 text-slate-950 font-black rounded-xl transition cursor-pointer"
                                >
                                  {docSaving ? "Storing data..." : "Archive File Copy"}
                                </button>
                              </div>
                            </form>
                          </div>
                        )}
                      </div>
                    )}

                    {/* SUBTAB 9: Connected Workshop Authorizations Access */}
                    {activeSpecTab === 'garage_connections' && (
                      <GarageConnectionsTab
                        vehicleId={selectedVehicle.id}
                        connections={connections}
                        onUpdateConnection={handleUpdateConnection}
                        onAddConnection={handleAddConnection}
                        onDisconnectGarage={handleDisconnectGarage}
                        refreshData={fetchConnections}
                      />
                    )}

                    {/* SUBTAB 10: QR Scan History Log */}
                    {activeSpecTab === 'qr_scan_history' && (
                      <div className="space-y-6">
                        {/* Summary panel/Intro card */}
                        <div className="glass bg-slate-900/40 p-5 rounded-3xl border border-white/5 space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-sky-500/10 text-sky-400 rounded-2xl border border-sky-500/20">
                              <QrCode className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="text-sm font-black text-slate-200 uppercase tracking-wider">QR Code Scan Event Ledger</h3>
                              <p className="text-xs text-slate-450 text-slate-400">
                                Chronological audit stream of workshops, mechanics, or partners requesting access to this vehicle's maintenance blueprint.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          {/* Left Column: Information Card & Simulation Controls */}
                          <div className="lg:col-span-1 space-y-6">
                            <div className="glass bg-slate-950/30 p-5 rounded-3xl border border-white/15 space-y-4">
                              <h4 className="text-[11px] font-bold text-slate-450 uppercase tracking-wider block">Security Credentials</h4>
                              <div className="p-3.5 bg-slate-950/80 rounded-xl space-y-2.5 border border-slate-800">
                                <div className="flex justify-between items-center text-[10px] text-slate-450 border-b border-white/5 pb-1.5">
                                  <span className="text-slate-400">Vehicle ID:</span>
                                  <span className="font-mono font-bold text-slate-200">{selectedVehicle.id}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] text-slate-455 border-b border-white/5 pb-1.5">
                                  <span className="text-slate-400">Secure Scan Code:</span>
                                  <span className="font-mono font-bold text-amber-400">{selectedVehicle.qrSecureToken || `MCC-CAR-${selectedVehicle.id.toUpperCase()}`}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] text-slate-460">
                                  <span className="text-slate-400">Privacy Target:</span>
                                  <span className="font-mono font-bold text-emerald-400">Zero-Trust ABAC</span>
                                </div>
                              </div>
                              <p className="text-[11.5px] text-slate-400 leading-relaxed">
                                Our zero-trust architecture restricts garages from reading private records unless explicit consent was registered via the Garage Access tab.
                              </p>
                            </div>

                            {/* Simulation Workshop scanner controller */}
                            <div className="glass bg-sky-950/10 p-5 rounded-3xl border border-sky-500/20 space-y-4">
                              <div className="flex items-center gap-2 text-sky-400">
                                <Activity className="w-4 h-4" />
                                <h4 className="text-xs font-bold uppercase tracking-wider">Local Scanner Simulator</h4>
                              </div>
                              <p className="text-[11px] text-slate-400 leading-relaxed">
                                Check the ledger responsiveness by simulating immediate digital scans from any participating Cambodian workshop below:
                              </p>

                              <div className="space-y-2">
                                {[
                                  { id: 'g1', name: 'Sokha Auto Garage', location: 'Phnom Penh' },
                                  { id: 'g2', name: 'Angkor Speedy Repair', location: 'Siem Reap' },
                                  { id: 'g3', name: 'Sihanoukville EV Lab', location: 'Sihanoukville' },
                                  { id: 'g4', name: 'Battambang Moto Center', location: 'Battambang' }
                                ].map((shop) => (
                                  <button
                                    key={shop.id}
                                    onClick={() => simulatePartnerScan(shop.id, shop.name)}
                                    disabled={simulationLoading}
                                    className="w-full p-2.5 bg-sky-500/5 hover:bg-sky-500/15 text-sky-300 font-medium text-xs rounded-xl border border-sky-500/10 hover:border-sky-500/30 text-left transition flex items-center justify-between cursor-pointer"
                                  >
                                    <div className="space-y-0.5">
                                      <span className="font-bold block text-slate-200">{shop.name}</span>
                                      <span className="text-[9px] text-slate-400 italic font-normal">{shop.location}</span>
                                    </div>
                                    <span className="text-[9px] font-black uppercase text-sky-400 bg-sky-500/10 p-1 px-2 rounded-lg border border-sky-500/20">
                                      SCAN {shop.id.toUpperCase()}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Right Column: Scans List Ledger */}
                          <div className="lg:col-span-2 space-y-4">
                            <div className="flex justify-between items-center px-1">
                              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Scanning Registry Ledger</h4>
                              <button
                                onClick={fetchScanHistory}
                                className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-200 cursor-pointer"
                                disabled={scanHistoryLoading}
                              >
                                <RotateCcw className={`w-3.5 h-3.5 ${scanHistoryLoading ? 'animate-spin' : ''}`} />
                                <span>Reload Feed</span>
                              </button>
                            </div>

                            {scanHistoryLoading ? (
                              <div className="p-8 text-center bg-slate-900/20 border border-white/5 rounded-3xl space-y-3">
                                <RotateCcw className="w-8 h-8 mx-auto text-sky-500 animate-spin" />
                                <p className="text-xs text-slate-400 font-medium">Retrieving secure scan logs from Cambodian Cloud nodes...</p>
                              </div>
                            ) : scanHistory.length === 0 ? (
                              <div className="p-8 text-center bg-slate-900/20 border border-white/5 rounded-3xl space-y-4">
                                <QrCode className="w-12 h-12 mx-auto text-slate-500 animate-pulse" />
                                <div className="space-y-1">
                                  <p className="text-sm font-bold text-slate-200">No Scanning Footprints Registered</p>
                                  <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                                    Your secure token is active. Unverified garages can scan the sticker QR to ping this car profile and generate diagnostic checklists.
                                  </p>
                                </div>
                                <div className="p-3.5 bg-slate-950/60 rounded-xl max-w-sm mx-auto text-[11px] text-slate-400 leading-relaxed border border-white/5">
                                  <strong className="text-amber-400">Quick Demo Tip:</strong> Tap one of the simulator scan buttons on the left panel to immediately fire a scan log events ping!
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {scanHistory.map((scan: any) => {
                                  // Formatting scan time and date nicely
                                  const scanDate = new Date(scan.scannedAt);
                                  const formattedDate = scanDate.toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  });
                                  const formattedTime = scanDate.toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit'
                                  });

                                  return (
                                    <div
                                      key={scan.id}
                                      className="p-4 bg-slate-900/40 border border-white/5 hover:border-white/10 rounded-2xl relative overflow-hidden transition flex items-start gap-4"
                                    >
                                      {/* Left highlight strip indicating scan approved status */}
                                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>

                                      <div className="p-2.5 bg-emerald-500/5 text-emerald-400 rounded-xl border border-emerald-500/10">
                                        <Wrench className="w-4 h-4" />
                                      </div>

                                      <div className="flex-1 space-y-2">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                                          <div>
                                            <h5 className="font-black text-slate-150 text-sm leading-snug">
                                              {scan.scannedByGarageName || "Unverified Service Bay"}
                                            </h5>
                                            <p className="text-[10px] text-slate-400 font-mono">
                                              ID: <span>{scan.scannedByGarageId || "guest-garage"}</span>
                                            </p>
                                          </div>
                                          <div className="text-left sm:text-right">
                                            <span className="p-1 px-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase rounded-lg">
                                              Scan Authorized
                                            </span>
                                          </div>
                                        </div>

                                        <div className="p-2.5 bg-slate-950/60 rounded-xl text-left border border-white/5 space-y-1.5">
                                          <div className="flex justify-between text-[10px] leading-tight text-slate-400">
                                            <span>Scan Token used:</span>
                                            <span className="font-mono text-amber-450 text-amber-450 font-semibold">{scan.token}</span>
                                          </div>
                                          <div className="flex justify-between text-[10px] leading-tight text-slate-400">
                                            <span>Target Class:</span>
                                            <span className="uppercase text-[9px] font-bold text-slate-300 font-mono">{scan.targetType || "vehicle"}</span>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-4 text-[10px] text-slate-400">
                                          <div className="flex items-center gap-1">
                                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                                            <span>{formattedDate}</span>
                                          </div>
                                          <div className="flex items-center gap-1">
                                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                                            <span>{formattedTime}</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SUBTAB 11: Transfer and Status Panel */}
                    {activeSpecTab === 'ownership_transfer' && (
                      <div className="space-y-6">
                        {/* Summary panel/Intro card */}
                        <div className="glass bg-slate-900/40 p-5 rounded-3xl border border-white/5 space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20">
                              <Send className="w-5 h-5 flex shrink-0" />
                            </div>
                            <div>
                              <h3 className="text-sm font-black text-slate-200 uppercase tracking-wider">Vehicle Status & Secure Ownership Transfer</h3>
                              <p className="text-xs text-slate-400">
                                Maintain technical status records, configure garage repair diagnostic pipelines, and initiate secure cryptographic ownership logs to other users.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Incoming Transfer Requests Inbox (Transfer Inbox) */}
                        <div className="glass bg-indigo-950/15 p-6 rounded-3xl border border-indigo-500/20 space-y-4">
                          <div className="flex items-center gap-2">
                            <Bell className="w-5 h-5 text-indigo-400" />
                            <h3 className="text-sm font-black text-slate-200 uppercase tracking-wider">Transfer Request Inbox</h3>
                          </div>
                          <p className="text-xs text-slate-300">
                            Secure cryptographic handshake requests received from other owners trying to transfer service history passports to you.
                          </p>

                          {incomingTransfers.length === 0 ? (
                            <div className="p-4 text-center bg-slate-900/25 border border-white/5 rounded-2xl text-xs text-slate-400">
                              No pending handshakes in your incoming transfer inbox.
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {incomingTransfers.map((req) => (
                                <div key={req.id} className="p-4 bg-slate-950/60 rounded-2xl border border-white/5 space-y-3">
                                  <div className="flex justify-between items-start flex-wrap gap-2">
                                    <div>
                                      <h4 className="font-extrabold text-sm text-slate-100">{req.vehicleBrand} {req.vehicleModel} ({req.vehicleYear})</h4>
                                      <p className="text-[10px] text-indigo-400 font-mono">PLATE: {req.plateNumber} • FROM: {req.fromOwner}</p>
                                    </div>
                                    <span className="p-1 px-2.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold rounded-lg uppercase">
                                      Incoming Handshake
                                    </span>
                                  </div>

                                  <div className="p-2.5 bg-slate-900/45 rounded-xl text-xs space-y-1 text-slate-300">
                                    <div><strong>Intended Transfer Style:</strong> <span className="text-sky-400">{req.transferType}</span></div>
                                    <div><strong>Settlement Amount:</strong> <span className="text-emerald-400">${req.sellingPrice.toLocaleString()}</span></div>
                                    {req.note && <div><strong>Seller's Handshake Note:</strong> <span className="italic">"{req.note}"</span></div>}
                                    <div className="pt-1.5 flex flex-wrap gap-1">
                                      <strong className="text-[10px] uppercase text-slate-400 block w-full mb-1">Bundled Records:</strong>
                                      {req.selectedRecords.map((rec: string) => (
                                        <span key={rec} className="text-[9px] bg-indigo-500/10 text-indigo-400 p-0.5 px-1.5 rounded-md border border-indigo-500/15 uppercase font-mono">{rec.replace('_', ' ')}</span>
                                      ))}
                                    </div>
                                  </div>

                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleAcceptTransferRequest(req)}
                                      className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-lg transition cursor-pointer"
                                    >
                                      Accept & Log Transfer
                                    </button>
                                    <button
                                      onClick={() => handleRejectTransferRequest(req.id)}
                                      className="py-1.5 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-450 font-bold text-xs rounded-lg transition cursor-pointer"
                                    >
                                      Reject
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Active Outbound Transfer Status card */}
                          <div className="glass bg-slate-950/30 p-5 rounded-3xl border border-white/5 space-y-4">
                            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Outbound cryptolink Handshake</h4>
                            {selectedVehicle.transferStatus === 'Pending' ? (
                              <div className="space-y-4 bg-slate-900/60 p-4 rounded-2xl border border-indigo-500/20">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5 text-amber-500 text-xs font-bold animate-pulse">
                                    <AlertCircle className="w-4 h-4" />
                                    <span>PENDING CRYPTOGRAPHIC HANDSHAKE</span>
                                  </div>
                                  <p className="text-[11px] text-slate-350 text-slate-300 leading-normal">
                                    Waiting for the target recipient at <strong className="text-white">{selectedVehicle.pendingTransferTarget}</strong> to confirm receipt. Lock active on current record update nodes.
                                  </p>
                                </div>

                                <div className="p-3 bg-slate-950/80 rounded-xl space-y-1.5 text-xs text-slate-300">
                                  <div><strong>Target Recipient:</strong> {selectedVehicle.pendingTransferTarget}</div>
                                  <div><strong>Est Settlement Date:</strong> {selectedVehicle.pendingTransferDate}</div>
                                  {selectedVehicle.pendingTransferPrice && <div><strong>Settlement Value:</strong> ${selectedVehicle.pendingTransferPrice}</div>}
                                  <div><strong>Transfer Bundle Type:</strong> <span className="text-indigo-400">{selectedVehicle.pendingTransferType}</span></div>
                                </div>

                                <button
                                  onClick={handleCancelTransfer}
                                  className="w-full py-2 bg-rose-500/15 hover:bg-rose-500/25 text-rose-450 font-bold text-xs rounded-xl transition border border-rose-500/20"
                                >
                                  Cancel Active Outbound Transfer
                                </button>
                              </div>
                            ) : (
                              <div className="p-6 text-center bg-slate-900/10 rounded-2xl border border-white/5 space-y-3">
                                <Send className="w-8 h-8 text-slate-500 mx-auto" />
                                <div className="space-y-1">
                                  <h5 className="text-xs font-bold text-slate-300">No Pending Outbound Transfers</h5>
                                  <p className="text-[11px] text-slate-400 max-w-xs mx-auto leading-normal">
                                    This vehicle is active and associated with your digital garage account. Use the "Transfer" button to initiate a secure transfer.
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Current Vehicle Status Card Dossier */}
                            <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/5 space-y-3">
                              <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Current Status Log Dossier</h5>
                              <div className="p-3.5 bg-slate-950/70 rounded-xl text-xs space-y-2 text-slate-300">
                                <div className="flex justify-between">
                                  <span className="text-slate-400 font-medium">Current Status:</span>
                                  <span className="font-bold text-sky-400 font-mono uppercase">{selectedVehicle.status || "Active"}</span>
                                </div>
                                {selectedVehicle.statusReason && (
                                  <div className="flex justify-between">
                                    <span className="text-slate-400 font-medium">Registered Reason:</span>
                                    <span className="font-semibold text-slate-200">{selectedVehicle.statusReason}</span>
                                  </div>
                                )}
                                {selectedVehicle.statusDate && (
                                  <div className="flex justify-between">
                                    <span className="text-slate-400 font-medium font-mono">Log Date:</span>
                                    <span className="font-mono text-slate-200">{selectedVehicle.statusDate}</span>
                                  </div>
                                )}
                                {selectedVehicle.statusNote && (
                                  <div className="pt-1.5 border-t border-white/5 mt-1.5 text-slate-400 text-[11px]">
                                    <strong>Notes:</strong> "{selectedVehicle.statusNote}"
                                  </div>
                                )}
                                {selectedVehicle.statusDocUrl && (
                                  <div className="pt-1 text-[10px] text-sky-450 text-sky-400 flex items-center gap-1">
                                    <FileText className="w-3.5 h-3.5" />
                                    <span>Document attached: <strong>{selectedVehicle.statusDocUrl}</strong></span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Under Repair Diagnostic Status pipeline (if status Under Repair is selected) */}
                          <div className="space-y-6">
                            {(selectedVehicle.status || 'Active') === 'Under Repair' && (
                              <div className="glass bg-amber-500/5 p-5 rounded-3xl border border-amber-500/20 space-y-4">
                                <div className="flex items-center gap-2 text-amber-500">
                                  <Wrench className="w-4 h-4" />
                                  <h4 className="text-xs font-black uppercase tracking-wider">Active Garage Repair Node</h4>
                                </div>
                                <p className="text-[11px] text-slate-350 text-slate-300 leading-normal">
                                  This vehicle is marked as <strong>Under Repair</strong>. Standard automated notifications and reminders are temporarily paused until repaired.
                                </p>

                                <div className="p-3.5 bg-slate-950/80 rounded-xl space-y-2 text-xs text-slate-300 border border-amber-500/10">
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">Assigned Shop:</span>
                                    <span className="font-bold text-slate-200">{selectedVehicle.repairGarageName || "Apsara Auto Repair"}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-400 font-medium">Service Status Node:</span>
                                    <span className="font-semibold text-amber-400 font-mono text-[10px] uppercase bg-amber-500/10 p-0.5 px-2 rounded-lg border border-amber-500/20 animate-pulse">{selectedVehicle.repairStatus || "Tear-down & Diagnostics"}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-400 font-medium font-mono">Est Completion Date:</span>
                                    <span className="font-bold text-slate-200">{selectedVehicle.repairEstCompletion || "To Be Estimated"}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-400 font-medium">Estimated Invoice:</span>
                                    <span className="font-bold text-emerald-400">${selectedVehicle.repairPendingInvoice || "120"}</span>
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="glass bg-slate-950/20 p-5 rounded-3xl border border-white/5 space-y-4">
                              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Access Permissions & Authorization Matrix</h4>
                              <div className="space-y-3 text-[11px] text-slate-300">
                                <div className="p-2.5 bg-slate-950 rounded-xl flex items-start gap-2 border border-white/5">
                                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                  <div>
                                    <span className="font-extrabold text-slate-200 block">Owner Clearance</span>
                                    Full read, write, transfer, status transitions, timeline exports, and document attaches.
                                  </div>
                                </div>
                                <div className="p-2.5 bg-slate-950 rounded-xl flex items-start gap-2 border border-white/5">
                                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                  <div>
                                    <span className="font-extrabold text-slate-200 block">Garage Technician</span>
                                    Write logs only after scanning valid secure token and gaining owner verification handshake.
                                  </div>
                                </div>
                                <div className="p-2.5 bg-slate-950 rounded-xl flex items-start gap-2 border border-white/5">
                                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                  <div>
                                    <span className="font-extrabold text-slate-200 block">Super Administrator</span>
                                    Review dispute resolution triggers, unlock locked records, and analyze global transfers.
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SUBTAB 12: Ownership Chronology Timeline */}
                    {activeSpecTab === 'ownership_timeline' && (
                      <div className="space-y-6">
                        {/* Summary panel/Intro card */}
                        <div className="glass bg-slate-900/40 p-5 rounded-3xl border border-white/5 space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-sky-500/10 text-sky-400 rounded-2xl border border-sky-500/20">
                              <Calendar className="w-5 h-5 flex animate-pulse shrink-0" />
                            </div>
                            <div>
                              <h3 className="text-sm font-black text-slate-200 uppercase tracking-wider">Secure Ownership Timeline log</h3>
                              <p className="text-xs text-slate-400">
                                Chronological catalog of former registered legal owners, settlement transaction logs, and historic ownership durations.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="glass bg-slate-950/30 p-6 rounded-3xl border border-white/5 relative overflow-hidden">
                          {/* Inner vertical timeline accent line */}
                          <div className="absolute left-10 top-16 bottom-16 w-0.5 bg-gradient-to-b from-sky-500/40 via-indigo-500/20 to-transparent"></div>

                          <div className="space-y-8 relative">
                            {/* Node 1: Current Owner */}
                            <div className="flex items-start gap-6 relative">
                              <div className="p-2.5 bg-sky-500 text-slate-950 rounded-full border-4 border-slate-950 font-black text-xs shrink-0 z-10">
                                NOW
                              </div>
                              <div className="bg-slate-900/60 p-4 rounded-2xl border border-sky-500/30 space-y-2 flex-1">
                                <div className="flex justify-between items-center flex-wrap gap-2">
                                  <div>
                                    <h4 className="font-black text-sm text-slate-100">Yeon Pisith (Current Registered Owner)</h4>
                                    <p className="text-[10px] text-sky-400 uppercase font-mono tracking-wider">Active Ownership Node</p>
                                  </div>
                                  <span className="p-1 px-2 bg-sky-500/10 text-sky-400 border border-sky-500/15 text-[9px] font-bold rounded-lg leading-none uppercase">Present Owner</span>
                                </div>
                                <p className="text-xs text-slate-350 text-slate-300">
                                  Fully verified electronic technical passport holder. Actively logging servicing checkups, diagnostic checkups, and fuel allocations.
                                </p>
                              </div>
                            </div>

                            {/* Node list representing past ownership historical timelines */}
                            {(!selectedVehicle.previousOwners || selectedVehicle.previousOwners.length === 0) ? (
                              <div className="flex items-start gap-6 relative">
                                <div className="p-2 bg-slate-800 text-slate-450 text-slate-400 rounded-full border-4 border-slate-950 shrink-0 font-bold text-xs z-10 flex justify-center items-center h-10 w-10">
                                  O1
                                </div>
                                <div className="p-4 bg-slate-900/25 border border-white/5 rounded-2xl text-xs text-slate-400 flex-1 leading-normal">
                                  This vehicle represents a single-owner vehicle passport. No previous electronic transfers have been registered on the "MyCar Care KH" blockchain ledger yet.
                                </div>
                              </div>
                            ) : (
                              selectedVehicle.previousOwners.map((owner: any, index: number) => (
                                <div key={index} className="flex items-start gap-6 relative">
                                  <div className="p-4 bg-slate-800 text-slate-300 rounded-full border-4 border-slate-950 font-black text-xs shrink-0 z-10 flex justify-center items-center h-10 w-10">
                                    O{index + 2}
                                  </div>
                                  <div className="bg-slate-900/30 p-4 rounded-xl border border-white/5 space-y-1.5 flex-1">
                                    <div className="flex justify-between items-center">
                                      <h5 className="font-extrabold text-xs text-slate-200">{owner.ownerName}</h5>
                                      <span className="font-mono text-[9px] text-slate-400">{owner.ownershipPeriod}</span>
                                    </div>
                                    <p className="text-xs text-slate-300 font-mono text-emerald-400 font-semibold">
                                      Sold at settlement value: ${owner.price ? owner.price.toLocaleString() : "N/A"}
                                    </p>
                                    {owner.note && (
                                      <p className="text-[11px] text-slate-400 italic">
                                        "{owner.note}"
                                      </p>
                                    )}
                                    <div className="pt-1 text-[9px] text-slate-450 font-mono uppercase">
                                      Handshake Verified Date: {owner.transferDate}
                                    </div>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SUBTAB 13: Vehicle History Report & Export */}
                    {activeSpecTab === 'history_report' && (
                      <div className="space-y-6">
                        {/* Summary panel/Intro card */}
                        <div className="glass bg-slate-900/40 p-5 rounded-3xl border border-white/5 space-y-3">
                          <div className="flex items-center justify-between gap-4 flex-wrap">
                            <div className="flex items-center gap-3">
                              <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
                                <FileText className="w-5 h-5 flex shrink-0" />
                              </div>
                              <div>
                                <h3 className="text-sm font-black text-slate-200 uppercase tracking-wider">Certified Vehicle History report card</h3>
                                <p className="text-xs text-slate-400">
                                  Comprehensive verification passport detailing odometer checks, service ledger continuity, and verified diagnostic stamps.
                                </p>
                              </div>
                            </div>

                            {/* Demo Sandbox Control: Premium Status Switcher */}
                            <button
                              onClick={() => setIsPremiumDemo(!isPremiumDemo)}
                              className={`p-2 px-3.5 rounded-xl font-bold text-xs transition border flex items-center gap-1.5 cursor-pointer ${
                                isPremiumDemo 
                                  ? 'bg-rose-500 text-white hover:bg-rose-600 border-rose-500/20 font-extrabold' 
                                  : 'bg-emerald-500 text-slate-950 hover:bg-emerald-600 border-emerald-500/20'
                              }`}
                            >
                              <Sparkles className="w-4 h-4 shrink-0" />
                              <span>{isPremiumDemo ? "Switch to Free Mode" : "Activate Premium Suite"}</span>
                            </button>
                          </div>
                        </div>

                        {!isPremiumDemo ? (
                          /* FREE Lockout Showcase Interface */
                          <div className="glass bg-slate-950/40 rounded-3xl p-8 text-center space-y-6 max-w-2xl mx-auto border border-emerald-500/20 relative overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-sky-500 to-indigo-500"></div>
                            
                            <div className="w-20 h-20 bg-emerald-500/10 text-emerald-400 rounded-3xl flex items-center justify-center mx-auto border border-emerald-500/20">
                              <Sparkles className="w-10 h-10 text-emerald-400 animate-spin" />
                            </div>

                            <div className="space-y-2">
                              <h3 className="text-xl font-black text-slate-100 uppercase tracking-tight">Unlock Certified History Passport & PDF Exports</h3>
                              <p className="text-xs text-slate-400 max-w-lg mx-auto leading-relaxed">
                                Professional car owners and premium pre-sale developers use our Certified vehicle dashboard logs to sell used vehicles 4x faster with complete transparency.
                              </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-md mx-auto pt-4 text-xs text-slate-300">
                              <div className="p-3 bg-slate-950 rounded-xl border border-white/5 flex items-start gap-2">
                                <Check className="w-4 h-4 text-emerald-450 text-emerald-400 shrink-0 mt-0.5" />
                                <div>
                                  <strong className="block text-slate-200">Verified PDF Exporter</strong>
                                  Securely compile odometer logs, garage receipts, and previous sellers to professional PDFs.
                                </div>
                              </div>
                              <div className="p-3 bg-slate-950 rounded-xl border border-white/5 flex items-start gap-2">
                                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                <div>
                                  <strong className="block text-slate-200">Trust Integrity Ranking</strong>
                                  Get an algorithmic score from 0-100 indicating vehicle ledger reliability.
                                </div>
                              </div>
                              <div className="p-3 bg-slate-950 rounded-xl border border-white/5 flex items-start gap-2">
                                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                <div>
                                  <strong className="block text-slate-200">Real-time Valuation Pings</strong>
                                  Estimated market depreciation rates matched relative to active Cambodian markets.
                                </div>
                              </div>
                              <div className="p-3 bg-slate-950 rounded-xl border border-white/5 flex items-start gap-2">
                                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                <div>
                                  <strong className="block text-slate-200">Digital QR Token</strong>
                                  Publish verifiable visual checklists on public vehicle windshield sticker boards.
                                </div>
                              </div>
                            </div>

                            <div className="pt-4 max-w-sm mx-auto">
                              <button
                                onClick={() => setIsPremiumDemo(true)}
                                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-600 hover:to-sky-600 text-slate-950 font-black text-sm rounded-xl transition cursor-pointer shadow-lg leading-none uppercase tracking-wide"
                              >
                                Activate Premium Suite (Free Sandbox Trial)
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* PREMIUM High-Fidelity Report Sheet */
                          <div className="space-y-6">
                            {/* Action Buttons: PDF Export Trigger */}
                            <div className="flex justify-between items-center p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                              <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span className="text-xs font-bold text-emerald-400 font-mono">CERTIFIED TRUST REPORT SECURED</span>
                              </div>
                              
                              <button
                                onClick={() => {
                                  alert(`Successfully compiling ${selectedVehicle.brand} ${selectedVehicle.model} verified Technical history passport.\nSaved to: mycar-care-${selectedVehicle.id}-history-report.pdf`);
                                }}
                                className="p-2 px-4 bg-emerald-400 hover:bg-emerald-500 text-slate-950 font-black text-xs rounded-xl transition flex items-center gap-2 cursor-pointer shadow leading-none"
                              >
                                <Download className="w-4 h-4 text-slate-950 font-extrabold" />
                                <span>Export Certified PDF Report</span>
                              </button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                              {/* Left parameters: algorithmic health rating */}
                              <div className="space-y-6">
                                <div className="glass bg-slate-950/40 p-6 rounded-3xl border border-white/5 space-y-4 text-center">
                                  <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">MyCar Care Trust Alignment Index</h4>
                                  
                                  <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
                                    <div className="absolute inset-0 border-[6px] border-emerald-500/20 rounded-full"></div>
                                    <div className="absolute inset-0 border-[6px] border-emerald-500 rounded-full clip-half transform rotate-45"></div>
                                    <div className="text-center z-10">
                                      <span className="text-4xl font-black text-slate-100 font-mono">92</span>
                                      <span className="text-xs text-slate-450 block text-slate-450 font-bold uppercase mt-0.5">SCORE</span>
                                    </div>
                                  </div>

                                  <div className="space-y-1">
                                    <div className="text-emerald-400 font-extrabold text-xs">EXCELLENT TRUST GRADE</div>
                                    <p className="text-[10px] text-slate-400 leading-normal max-w-xs mx-auto font-medium">
                                      Based on consistent monthly checklists, verifiable garage repair node handshakes, and strict odometer continuity metrics.
                                    </p>
                                  </div>
                                </div>

                                {/* Active market value valuation rates */}
                                <div className="glass bg-slate-950/20 p-5 rounded-3xl border border-white/5 space-y-3.5">
                                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider font-mono">Cambodian Market Valuation Metrics</h4>
                                  
                                  <div className="p-3 bg-slate-950 rounded-xl space-y-1.5 text-xs text-slate-300">
                                    <div className="flex justify-between items-center text-[11px]">
                                      <span className="text-slate-400">Estimated Resale Price:</span>
                                      <strong className="text-emerald-400 font-mono">${(selectedVehicle.purchasePrice ? selectedVehicle.purchasePrice * 0.85 : 18500).toLocaleString()}</strong>
                                    </div>
                                    <div className="flex justify-between items-center text-[11px]">
                                      <span className="text-slate-400 text-slate-450">Est Annual Depreciation:</span>
                                      <span className="text-slate-200 font-mono">~ 7.2% / year</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[11px]">
                                      <span className="text-slate-400 font-normal">Market Liquid State:</span>
                                      <span className="text-sky-400 font-bold uppercase text-[10.5px]">Highly Liquid (High Demand)</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Right parameters: chronological compiled audit sheets */}
                              <div className="lg:col-span-2 glass bg-slate-900/10 p-6 rounded-3xl border border-white/5 space-y-5">
                                <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider pb-2 border-b border-white/5">Certified Historical Logs Registry</h4>
                                
                                <div className="space-y-4">
                                  <div className="p-4 bg-slate-950/40 rounded-xl relative overflow-hidden border border-white/5 text-left">
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-400"></div>
                                    <h5 className="font-extrabold text-xs text-slate-200 uppercase">Verification Registry Check</h5>
                                    <p className="text-[11px] text-slate-400 leading-normal mt-1">
                                      Verify document upload matches original Cambodia Tax Ministry entries. Check alignment index: Odometer 121,000 km is authenticated. No discrepancies.
                                    </p>
                                  </div>

                                  <div className="p-4 bg-slate-950/40 rounded-xl relative overflow-hidden border border-white/5 text-left">
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-sky-400"></div>
                                    <h5 className="font-extrabold text-xs text-slate-200 uppercase">Interactive Service History Ledger Continuity</h5>
                                    <p className="text-[11px] text-slate-400 leading-normal mt-1">
                                      Compiled {records.filter(r => r.vehicleId === selectedVehicle.id).length} service invoices with matching receipts and mechanics signatures. 
                                    </p>
                                  </div>

                                  <div className="p-4 bg-slate-950/40 rounded-xl relative overflow-hidden border border-white/5 text-left">
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500"></div>
                                    <h5 className="font-extrabold text-xs text-slate-200 uppercase">AI-Driven Mileage Validation Model</h5>
                                    <p className="text-[11px] text-slate-400 leading-normal mt-1">
                                      Odo reading regression checks show continuous upward progress without rolls. Estimated discrepancy probability: &lt; 0.015%.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Glowing Quick Action Floating Accessibility Menu */}
                  <div className="fixed bottom-6 right-6 z-[999] flex flex-col items-end">
                    {/* Collapsible Shortcut Menu Items */}
                    {quickMenuOpen && (
                      <div className="glass bg-slate-950/95 border border-slate-800/80 p-2.5 rounded-2xl shadow-2xl min-w-[220px] mb-3 space-y-1">
                        <div className="px-3 py-1 border-b border-white/5 mb-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                          One-Tap Shortcuts
                        </div>
                        
                        <button
                          onClick={() => {
                            setActiveSpecTab('appointments');
                            setQuickMenuOpen(false);
                          }}
                          className="w-full p-2.5 hover:bg-sky-500/10 text-slate-200 hover:text-sky-300 font-bold text-xs rounded-xl transition flex items-center gap-2.5 text-left cursor-pointer"
                        >
                          <div className="p-1.5 bg-sky-500/10 rounded-lg text-sky-400">
                            <Calendar className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <span className="block text-[11px]">Book Appointment</span>
                            <span className="text-[9px] text-slate-400 font-normal">Reserve a service slot</span>
                          </div>
                        </button>

                        <button
                          onClick={() => {
                            onAddRecord();
                            setQuickMenuOpen(false);
                          }}
                          className="w-full p-2.5 hover:bg-emerald-500/10 text-slate-200 hover:text-emerald-300 font-bold text-xs rounded-xl transition flex items-center gap-2.5 text-left cursor-pointer"
                        >
                          <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-400">
                            <Plus className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <span className="block text-[11px]">Log Service</span>
                            <span className="text-[9px] text-slate-400 font-normal">Archive receipt manually</span>
                          </div>
                        </button>

                        <button
                          onClick={() => {
                            triggerExportAction();
                            setQuickMenuOpen(false);
                          }}
                          className="w-full p-2.5 hover:bg-purple-500/10 text-slate-200 hover:text-purple-300 font-bold text-xs rounded-xl transition flex items-center gap-2.5 text-left cursor-pointer"
                        >
                          <div className="p-1.5 bg-purple-500/10 rounded-lg text-purple-400">
                            <Download className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <span className="block text-[11px]">Export Report</span>
                            <span className="text-[9px] text-slate-400 font-normal">Download spec dossier (.txt)</span>
                          </div>
                        </button>
                      </div>
                    )}

                    {/* Quick Trigger FAB Activator */}
                    <button
                      onClick={() => setQuickMenuOpen(!quickMenuOpen)}
                      className="p-3.5 bg-sky-400 text-slate-950 font-black rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all outline-none duration-200 z-[1000] flex items-center justify-center gap-2 group cursor-pointer relative overflow-hidden"
                      title="Quick Access Shortcuts"
                    >
                      <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      
                      <div className="flex items-center gap-1.5">
                        <Zap className={`w-5 h-5 ${quickMenuOpen ? 'rotate-45' : ''} transition-transform duration-300`} />
                        <span className="text-xs font-black uppercase tracking-wider hidden md:inline-block max-w-0 overflow-hidden group-hover:max-w-[120px] transition-all duration-300 whitespace-nowrap">
                          Quick Actions
                        </span>
                      </div>
                      
                      {/* Pulse Notification dot when menu is sleeping */}
                      {!quickMenuOpen && (
                        <span className="absolute top-0 right-0 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Subscreen: Tab 3: EXPENSE TRACKER */}
          {activeSubTab === 'expenses' && selectedVehicle && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-4">
              <div className="lg:col-span-5 space-y-6">
                {/* Outflow tracker toggler */}
                <div className="glass rounded-3xl p-5 space-y-4 shadow-md">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase">
                      Log Custom Log Expense Receipt
                    </h3>
                    <button
                      onClick={() => setShowAddExpensePanel(!showAddExpensePanel)}
                      className="p-1 px-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] uppercase font-bold rounded-lg hover:bg-emerald-500/20 transition flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>{showAddExpensePanel ? "Collapse Form" : "Log Expense"}</span>
                    </button>
                  </div>

                  {showAddExpensePanel ? (
                    <form onSubmit={handleAddExpenseSubmit} className="space-y-4 text-xs">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Expense Category</label>
                          <select
                            value={expCategory}
                            onChange={(e) => setExpCategory(e.target.value as any)}
                            className="w-full bg-slate-900 border border-white/10 p-2 text-xs rounded-xl text-slate-100 placeholder-slate-500 text-slate-300 font-medium"
                          >
                            {['Fuel', 'Oil change', 'Maintenance', 'Repair', 'Spare parts', 'Tire', 'Battery', 'Car wash', 'Parking', 'Toll fee', 'Insurance', 'Road tax', 'Loan payment', 'Accessories', 'Emergency repair', 'Other'].map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Amount spent (USD)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={expAmount}
                            onChange={(e) => setExpAmount(e.target.value)}
                            required
                            placeholder="e.g., 40.00"
                            className="w-full bg-white/5 border border-white/10 p-2 text-xs rounded-xl text-slate-100 font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Registered Date</label>
                          <input
                            type="date"
                            value={expDate}
                            onChange={(e) => setExpDate(e.target.value)}
                            required
                            className="w-full bg-white/5 border border-white/10 p-2 text-xs rounded-xl text-slate-100"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Odometer Checkpoint (km)</label>
                          <input
                            type="number"
                            value={expMileage}
                            onChange={(e) => setExpMileage(e.target.value)}
                            placeholder="Odometer limit to cross"
                            className="w-full bg-white/5 border border-white/10 p-2 text-xs rounded-xl text-slate-100 font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Vendor Garage / Shop</label>
                          <input
                            type="text"
                            value={expProvider}
                            onChange={(e) => setExpProvider(e.target.value)}
                            placeholder="e.g., Tela Gas, ABA payment"
                            className="w-full bg-white/5 border border-white/10 p-2 text-xs rounded-xl text-slate-100"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Payment Method</label>
                          <select
                            value={expPaymentMethod}
                            onChange={(e) => setExpPaymentMethod(e.target.value as any)}
                            className="w-full bg-slate-900 border border-white/10 p-2 text-xs rounded-xl text-slate-100"
                          >
                            <option value="ABA Pay">ABA Pay (QR)</option>
                            <option value="Cash">Cash (Standard KHR/USD)</option>
                            <option value="Wing">Wing transfer</option>
                            <option value="Credit Card">Credit Card</option>
                            <option value="Other">Other Gateway</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Notes & Description</label>
                        <input
                          type="text"
                          value={expNotes}
                          onChange={(e) => setExpNotes(e.target.value)}
                          placeholder="Warranty duration or receipt code values"
                          className="w-full bg-white/5 border border-white/10 p-2 text-xs rounded-xl"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs hover:bg-emerald-600 transition"
                      >
                        Register Financial Outflow
                      </button>
                    </form>
                  ) : (
                    <div className="space-y-2 text-xs">
                      <p className="text-slate-400 leading-relaxed">
                        Log fuel fillings, spare parts receipt logs, car washes and municipal parking coupons to compile automated visual reports and predict monthly car ownership overheads.
                      </p>
                      <button 
                        onClick={() => setShowAddExpensePanel(true)}
                        className="w-full py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition text-slate-350 font-bold"
                      >
                        Launch Log Form View
                      </button>
                    </div>
                  )}
                </div>

                {/* SVG Visual Spend stats box */}
                <div className="glass rounded-3xl p-5 space-y-4 shadow-md">
                  {renderSVGSpendGraph()}
                </div>
              </div>

              {/* Expense records layout list */}
              <div className="lg:col-span-7 glass rounded-3xl p-5 space-y-4 shadow-md">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <h3 className="text-sm font-bold text-slate-100 uppercase tracking-widest flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <span>Outflow Ledger & Invoices ({activeExpenses.length})</span>
                  </h3>
                  <span className="text-xs font-semibold text-emerald-400 font-mono">Month dynamic limit: active</span>
                </div>

                <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-2 no-scrollbar text-xs">
                  {activeExpenses.map(item => (
                    <div key={item.id} className="p-3 bg-white/3 hover:bg-white/5 border border-white/5 rounded-xl flex items-center justify-between gap-3 text-xs transition">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg">
                          <DollarSign className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-200">{item.category}</span>
                            <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-slate-400 font-mono tracking-tighter uppercase font-bold">{item.paymentMethod}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 block">{item.date} • {item.provider} {item.mileage > 0 ? `• Odo ${item.mileage.toLocaleString()} km` : ''}</span>
                          {item.notes && <p className="text-slate-400 text-[11px] mt-1 leading-normal italic">Notes: {item.notes}</p>}
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1 font-mono">
                        <span className="text-sm font-bold text-sky-450">-${item.amount} USD</span>
                        <button
                          onClick={() => handleDeleteExpense(item.id)}
                          className="text-[10px] text-slate-500 hover:text-rose-400 font-bold hover:underline"
                        >
                          delete record
                        </button>
                      </div>
                    </div>
                  ))}

                  {activeExpenses.length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                      No expenses logged. Add synthetic fuel items or accessories to review distributions.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Subscreen: Tab 4: REMINDERS PANEL */}
          {activeSubTab === 'reminders' && selectedVehicle && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-4">
              <div className="lg:col-span-5 space-y-6">
                {/* Custom Scheduler */}
                <div className="glass rounded-3xl p-5 space-y-4 shadow-md">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase">
                      Configure Custom Reminder
                    </h3>
                    <button
                      onClick={() => setShowAddReminderPanel(!showAddReminderPanel)}
                      className="p-1 px-2.5 bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px] uppercase font-bold rounded-lg hover:bg-sky-500/20 transition flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>{showAddReminderPanel ? "Collapse" : "Add Alert"}</span>
                    </button>
                  </div>

                  {showAddReminderPanel ? (
                    <form onSubmit={handleAddReminderSubmit} className="space-y-4 text-xs font-sans">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Alert Title / Task Name</label>
                        <input
                          type="text"
                          value={remTitle}
                          onChange={(e) => setRemTitle(e.target.value)}
                          placeholder="e.g., Annual road tax check Forte, Left suspension vibration"
                          required
                          className="w-full bg-white/5 border border-white/10 p-2 rounded-xl text-slate-100"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Reminder Category</label>
                          <select
                            value={remCategory}
                            onChange={(e) => setRemCategory(e.target.value)}
                            className="w-full bg-slate-900 border border-white/10 p-2 text-xs rounded-xl"
                          >
                            <option value="Oil change">Oil change timing</option>
                            <option value="Tire change">Tire rotate / replace</option>
                            <option value="Battery check">Battery check review</option>
                            <option value="Brake inspection">Brake inspection check</option>
                            <option value="Insurance renewal">Insurance renewal</option>
                            <option value="Vehicle tax renewal">Vehicle tax renewal</option>
                            <option value="Car wash">Car wash schedule</option>
                            <option value="Custom reminder">My Custom alert</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Trigger Formula</label>
                          <select
                            value={remType}
                            onChange={(e) => setRemType(e.target.value as any)}
                            className="w-full bg-slate-900 border border-white/10 p-2 text-xs rounded-xl text-slate-100"
                          >
                            <option value="date_based">Date limits only</option>
                            <option value="mileage_based">Odometer mileage only</option>
                            <option value="date_and_mileage">Date and Mileage both</option>
                            <option value="repeating">Repeating interval</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Due Date Limits (Optional)</label>
                          <input
                            type="date"
                            value={remDueDate}
                            onChange={(e) => setRemDueDate(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 p-2 text-xs rounded-xl"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Due Odometer mileage (km)</label>
                          <input
                            type="number"
                            value={remDueMileage}
                            onChange={(e) => setRemDueMileage(e.target.value)}
                            placeholder="e.g. 185000"
                            className="w-full bg-white/5 border border-white/10 p-2 text-xs rounded-xl font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Repeat Cadence</label>
                          <select
                            value={remRepeatType}
                            onChange={(e) => setRemRepeatType(e.target.value as any)}
                            className="w-full bg-slate-900 border border-white/10 p-2 text-xs rounded-xl"
                          >
                            <option value="none">One-time check</option>
                            <option value="monthly">Monthly cycle</option>
                            <option value="every_6_months">Every 6 months</option>
                            <option value="yearly">Every year (Annual slip)</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Severity Priority</label>
                          <select
                            value={remPriority}
                            onChange={(e) => setRemPriority(e.target.value as any)}
                            className="w-full bg-slate-900 border border-white/10 p-2 text-xs rounded-xl text-slate-150"
                          >
                            <option value="Low">Low priority</option>
                            <option value="Medium">Medium scale</option>
                            <option value="High">High attention</option>
                            <option value="Emergency">Urgent Emergency</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Action description steps</label>
                        <input
                          type="text"
                          value={remNotes}
                          onChange={(e) => setRemNotes(e.target.value)}
                          placeholder="e.g. Bring to Angkor Auto Repair before upcoming rain slip"
                          className="w-full bg-white/5 border border-white/10 p-2 text-xs rounded-xl"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={remSaving}
                        className="w-full py-2.5 bg-sky-500 text-slate-950 font-bold rounded-xl hover:bg-sky-600 transition"
                      >
                        {remSaving ? "Saving alerts database..." : "Settle Smart Alert"}
                      </button>
                    </form>
                  ) : (
                    <div className="space-y-2 text-xs text-slate-400 leading-normal font-medium">
                      Configure dynamic reminders matching dates or odometer targets. The vehicle calculates safety ranges to flag warning signs properly ahead of monsoon cycles.
                      <button
                        onClick={() => setShowAddReminderPanel(true)}
                        className="w-full py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-slate-300 font-bold transition mt-2 cursor-pointer"
                      >
                        Open alert schedule setup Form
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Reminders List Column */}
              <div className="lg:col-span-7 glass rounded-3xl p-5 space-y-4 shadow-md">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <h3 className="text-sm font-bold text-slate-100 uppercase tracking-widest">
                    Telemetry Checkpoints ({reminders.length})
                  </h3>
                  {reminderLoading && <span className="text-xs text-sky-400 animate-pulse">Syncing checklists...</span>}
                </div>

                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 no-scrollbar text-xs">
                  {reminders.map(item => (
                    <div key={item.id} className="p-4 bg-white/3 hover:bg-white/5 border border-white/5 rounded-2xl space-y-3 transition">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              item.status === 'Overdue' ? 'bg-rose-500 text-white' : item.status === 'Due soon' ? 'bg-amber-400 text-slate-900' : 'bg-emerald-600 text-white'
                            }`}>
                              {item.status}
                            </span>
                            <span className="text-slate-500 text-[10px] font-bold font-mono">ID: {item.id}</span>
                          </div>
                          <h4 className="text-base font-bold text-slate-200 pt-1 leading-snug">{item.title}</h4>
                        </div>
                        {item.priority === 'High' || item.priority === 'Emergency' ? (
                          <span className="p-1 bg-rose-500/10 text-rose-450 border border-rose-500/20 text-[9px] font-bold uppercase rounded leading-none shrink-0">CRITICAL ASPECT</span>
                        ) : null}
                      </div>

                      <p className="text-slate-350 leading-relaxed text-[11px]">{item.reason}</p>
                      
                      {item.action && (
                        <div className="flex items-start gap-1 p-2 px-3 bg-white/5 rounded-xl border border-white/5 text-[11px] text-slate-400">
                          <Info className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                          <span><strong>Expert Action:</strong> {item.action}</span>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-4 text-[10px] text-slate-500 font-medium">
                        {item.dueDate && <span>Date Deadline: {item.dueDate}</span>}
                        {item.dueMileage && <span>Odo Target: {item.dueMileage.toLocaleString()} km</span>}
                        {item.repeatType && item.repeatType !== 'none' && <span className="capitalize">Interval: {item.repeatType.replace(/_/g, ' ')}</span>}
                      </div>

                      <div className="flex justify-between items-center border-t border-white/5 pt-3">
                        <button
                          onClick={() => handleSnoozeReminder(item.id)}
                          className="px-3 py-1 bg-white/5 hover:bg-white/10 text-slate-300 font-bold rounded-lg border border-white/10 text-[10px] uppercase transition cursor-pointer"
                        >
                          Snooze 30 Days
                        </button>
                        <button
                          onClick={() => handleCompleteReminder(item.id)}
                          className="px-3.5 py-1 bg-sky-500 hover:bg-sky-600 text-slate-950 font-bold rounded-lg text-[10px] uppercase transition flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Mark Done</span>
                        </button>
                      </div>
                    </div>
                  ))}

                  {reminders.length === 0 && (
                    <div className="text-center py-10 text-slate-500">
                      No active telemetry checkpoints found. Add custom targets to trigger.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Subscreen: Tab 5: DOCUMENT WALLET (STANDALONE ARCHIVE VIEW) */}
          {activeSubTab === 'documents' && (
            <div className="space-y-6">
              <div className="glass rounded-3xl p-6 space-y-4 shadow-md">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <div>
                    <h2 className="text-base font-black text-slate-100">Driver Document Wallet File</h2>
                    <p className="text-xs text-slate-500">Centralized safe custody storage for all registered vehicles.</p>
                  </div>
                  {selectedVehicle && (
                    <button
                      onClick={() => setShowAddDocModal(true)}
                      className="p-2 px-4 bg-sky-500 text-slate-900 text-xs font-bold rounded-xl hover:bg-sky-600 transition flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Attach Car Paper</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
                  {documents.map(doc => {
                    const car = vehicles.find(v => v.id === doc.vehicleId);
                    return (
                      <div key={doc.id} className="p-4 bg-white/3 hover:bg-white/5 border border-white/5 rounded-2xl flex flex-col justify-between space-y-3 text-xs transition">
                        <div>
                          <div className="flex justify-between items-start">
                            <span className="text-[9px] bg-white/10 text-slate-400 font-bold uppercase tracking-wider py-0.5 px-1.5 rounded">{doc.category}</span>
                            <span className="text-slate-500 text-[9px] font-mono">{doc.fileSize}</span>
                          </div>
                          <h4 className="text-sm font-black text-slate-200 mt-2">{doc.title}</h4>
                          <p className="text-slate-400 text-[11px] font-mono leading-none pt-1">{doc.fileName}</p>
                        </div>

                        <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                          <span className="text-slate-500 text-[10px]">Car: <strong>{car ? `${car.brand} ${car.model}` : 'Generic'}</strong></span>
                          <div className="flex items-center gap-1.5 pt-0.5">
                            <a
                              href={doc.fileUrl || "#"}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-sky-400 border border-white/5 transition"
                            >
                              <Download className="w-3.5 h-3.5 text-sky-400" />
                            </a>
                            <button
                              onClick={() => handleDeleteDocument(doc.id)}
                              className="p-1.5 hover:bg-rose-500/10 rounded-lg text-slate-500 hover:text-rose-450 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {documents.length === 0 && (
                    <div className="col-span-full text-center py-12 text-slate-500 text-xs">
                      No documents uploaded yet to the custody vault. Check matching vehicles to attach papers.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Subscreen: Tab 6: AI INSIGHTS DIAGNOSTICS */}
          {activeSubTab === 'ai' && selectedVehicle && (
            <div className="space-y-6">
              <div className="glass rounded-3xl p-6 space-y-5 relative overflow-hidden shadow-xl">
                <div className="absolute right-0 top-0 w-80 h-40 bg-purple-500/5 rounded-full blur-3xl pointer-events-none select-none"></div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <div className="flex items-center gap-1 text-purple-400 text-xs font-bold tracking-widest uppercase mb-1">
                      <Brain className="w-4 h-4 animate-pulse" />
                      <span>Gemini 3.5 Flash Diagnostics Engine</span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-150">Vulnerability and Ownership Optimization</h2>
                    <p className="text-xs text-slate-400">Retreive custom insights matching tracked odometer points and expense allocations in Cambodia gridlock contexts.</p>
                  </div>
                  <button
                    onClick={handleTriggerAiInsights}
                    disabled={aiLoading}
                    className="p-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:scale-[1.02] text-white rounded-xl flex items-center justify-center gap-1.5 font-bold text-xs transition shadow-lg shrink-0 cursor-pointer"
                  >
                    {aiLoading ? <RotateCcw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    <span>{aiInsights ? "Re-evaluate Insights" : "Generate AI Insights"}</span>
                  </button>
                </div>

                {aiLoading ? (
                  <div className="py-20 text-center space-y-3.5">
                    <div className="w-10 h-10 border-4 border-sky-400/20 border-t-sky-400 rounded-full animate-spin mx-auto"></div>
                    <p className="text-xs text-slate-400 animate-pulse">Running advanced machine learning diagnostics on vehicle files...</p>
                  </div>
                ) : aiInsights ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1 text-xs">
                    {/* Maintenance Suggestions */}
                    <div className="p-4.5 bg-white/3 border border-white/5 rounded-2xl space-y-2">
                      <h4 className="text-xs font-bold text-sky-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Wrench className="w-4 h-4" />
                        <span>Maintenance Telemetry Suggestions</span>
                      </h4>
                      <p className="text-slate-300 leading-relaxed leading-normal">{aiInsights.maintenanceInsights}</p>
                    </div>

                    {/* Financial Insights */}
                    <div className="p-4.5 bg-white/3 border border-white/5 rounded-2xl space-y-2">
                      <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4" />
                        <span>Monthly Spending Insights</span>
                      </h4>
                      <p className="text-slate-300 leading-relaxed leading-normal">{aiInsights.spendingInsights}</p>
                    </div>

                    {/* Cost Warning */}
                    <div className="p-4.5 bg-white/3 border border-white/5 rounded-2xl space-y-2">
                      <h4 className="text-xs font-bold text-rose-450 uppercase tracking-widest flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4" />
                        <span>Risk & Omission Warnings</span>
                      </h4>
                      <p className="text-slate-300 leading-relaxed leading-normal">{aiInsights.warningMessages}</p>
                    </div>

                    {/* Ownership Advice */}
                    <div className="p-4.5 bg-white/3 border border-white/5 rounded-2xl space-y-2">
                      <h4 className="text-xs font-bold text-violet-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Sliders className="w-4 h-4" />
                        <span>Parts & Garage Advice (Cambodia Markets)</span>
                      </h4>
                      <p className="text-slate-300 leading-relaxed leading-normal">{aiInsights.ownershipAdvice}</p>
                    </div>

                    {/* Cost prediction */}
                    <div className="p-5.5 bg-gradient-to-r from-purple-950/20 to-indigo-950/20 border border-purple-500/10 rounded-2xl md:col-span-2 space-y-1 text-center">
                      <span className="text-[10px] text-purple-400 uppercase tracking-widest font-bold">Upcoming 6-12 Months Prediction</span>
                      <p className="text-lg font-black text-slate-100">{aiInsights.costPrediction}</p>
                      <p className="text-[11px] text-slate-500">Predicted dynamic overheads matching historical timelines.</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-14 max-w-md mx-auto space-y-3.5">
                    <div className="p-3 bg-purple-500/10 rounded-full border border-purple-500/20 w-12 h-12 flex items-center justify-center mx-auto text-purple-400">
                      <Brain className="w-6 h-6 shrink-0" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-200">Insights engine waiting to start</h4>
                      <p className="text-xs text-slate-500">Provide odometer logging and maintenance histories, then trigger generative diagnostics to evaluate parts reliability advice tailored to Cambodia gridlock situations.</p>
                    </div>
                    <button
                      onClick={handleTriggerAiInsights}
                      className="px-4 py-2 text-xs font-bold bg-white/5 border border-white/10 hover:border-white/20 transition rounded-xl text-slate-300"
                    >
                      Initiate Engine Now
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Subscreen: Tab 7: CUSTOM NOTIFICATIONS SETTINGS & TG PORTAL */}
          {activeSubTab === 'settings' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-4">
              {/* Telegram Gateway */}
              <div className="lg:col-span-5 glass rounded-3xl p-5 space-y-4 shadow-md relative overflow-hidden">
                <div className="absolute right-0 top-0 text-white/5 translate-x-1/3 -translate-y-1/3 pointer-events-none select-none">
                  <FlameKindling className="w-48 h-48 stroke-[0.3]" />
                </div>
                <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                  <div className="p-1.5 bg-sky-500/10 text-sky-400 border border-sky-500/15 rounded-lg">
                    <FlameKindling className="w-4.5 h-4.5" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-100 uppercase tracking-widest">Telegram Connection Portal</h3>
                </div>

                {tgIsConnected ? (
                  <div className="space-y-4 text-xs font-sans">
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/15 rounded-2xl flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-600/20 flex items-center justify-center text-emerald-400">
                        <Check className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-200 block">Telegram Hook Active</span>
                        <span className="text-[10px] text-slate-500 block">Mapped handler username: @{tgUserName}</span>
                      </div>
                    </div>

                    <p className="text-slate-400 leading-relaxed text-[11px]">
                      The security connection check passed. Automated maintenance warnings, budget overruns, and parts warranties messages will be routed instantly to your official account.
                    </p>

                    <button
                      onClick={() => {
                        if (window.confirm("Disconnect Telegram notifications loop?")) {
                          setTgIsConnected(false);
                          setTgUserName("");
                          setAppNotifSettings(prev => ({ ...prev, telegramEnabled: false }));
                        }
                      }}
                      className="w-full py-2 bg-rose-500/10 text-rose-455 hover:bg-rose-500/20 border border-rose-500/15 font-bold rounded-xl text-xs transition"
                    >
                      Disconnect Telegram Account
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 text-xs font-sans">
                    <p className="text-slate-400 leading-relaxed text-[11px]">
                      Receive automated maintenance alerts and garage invoices directly on your Telegram! Tap Connect below to initiate secure handshake.
                    </p>

                    {tgToken ? (
                      <div className="p-3.5 bg-slate-950/60 border border-white/10 rounded-xl space-y-3 font-mono text-[11px] text-slate-300">
                        <div className="space-y-1">
                          <span className="text-slate-500 text-[10px] uppercase block font-bold leading-none">Step 1: Open robot dialog</span>
                          <span className="text-sky-400 underline block cursor-pointer">@MyCarCareKHBot</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-slate-500 text-[10px] uppercase block font-bold leading-none">Step 2: Enter token verify code</span>
                          <span className="text-slate-100 font-bold block bg-white/5 p-1 px-2 rounded tracking-widest text-center border border-white/10">{tgToken}</span>
                        </div>
                        <div className="space-y-1 pt-1.5">
                          <label className="text-[9px] text-slate-450 uppercase block font-bold font-sans">Simulate active telegram nickname</label>
                          <input
                            type="text"
                            value={tgUserName}
                            onChange={(e) => setTgUserName(e.target.value)}
                            placeholder="e.g. johan_driver"
                            className="w-full bg-white/5 p-1.5 rounded text-xs focus:outline-none placeholder-slate-600 border border-white/10 font-sans"
                          />
                        </div>
                        <button
                          onClick={handleVerifyTelegramConnection}
                          className="w-full py-2 bg-gradient-to-r from-sky-400 to-indigo-500 text-slate-900 leading-none py-2.5 font-bold font-sans rounded-xl text-xs transition mt-2 cursor-pointer"
                        >
                          Verify Channel Mapping
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={handleInitiateTelegram}
                        className="w-full py-2.5 bg-sky-500 hover:bg-sky-600 text-slate-950 font-bold rounded-xl transition cursor-pointer"
                      >
                        Connect Telegram Notification
                      </button>
                    )}

                    {tgLogAlert && (
                      <div className={`p-3 rounded-xl border flex items-start gap-2 text-[11px] leading-tight ${
                        tgLogAlert.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/15' : 'bg-sky-500/10 text-sky-300 border-sky-500/15'
                      }`}>
                        <Info className="w-4 h-4 shrink-0" />
                        <span>{tgLogAlert.text}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Toggle Preferences UI Grid */}
              <div className="lg:col-span-7 glass rounded-3xl p-5 space-y-4 shadow-md">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase">
                    Notification Dispatch Settings
                  </h3>
                  <button
                    onClick={handleSaveNotificationSettings}
                    className="px-3 py-1.5 bg-sky-500 text-slate-950 text-xs font-bold rounded-xl hover:bg-sky-600 transition cursor-pointer"
                  >
                    Save Preferences
                  </button>
                </div>

                {settingsStatusMessage && (
                  <p className="text-emerald-400 text-xs py-1 animate-pulse font-medium">{settingsStatusMessage}</p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 text-xs">
                  {[
                    { id: 'pushEnabled', label: 'App Push Notifications', desc: 'Alert dialog trigger' },
                    { id: 'telegramEnabled', label: 'Telegram notifications', desc: 'Secure bot connection', disabled: !tgIsConnected },
                    { id: 'emailEnabled', label: 'Email Reports dispatch', desc: 'Monthly summary' },
                    { id: 'smsEnabled', label: 'SMS backup trigger link', desc: 'Cambodia carrier loop' },
                    { id: 'maintenanceEnabled', label: 'Maintenance alerts', desc: 'Service predictions' },
                    { id: 'garageEnabled', label: 'Garage status notifications', desc: 'Active diagnostics logs' },
                    { id: 'bookingEnabled', label: 'Invoice confirmations', desc: 'Billed transaction notifications' },
                    { id: 'marketplaceEnabled', label: 'Quotation answers', desc: 'RFQ matching' },
                    { id: 'forumEnabled', label: 'Warranty milestones', desc: 'Expired intervals warning' },
                    { id: 'safetyAlertEnabled', label: 'Emergency Alerts', desc: 'Safety anomalies flags' }
                  ].map(pref => (
                    <div key={pref.id} className={`p-3 border rounded-xl flex items-center justify-between gap-3 ${
                      pref.disabled ? 'bg-white/1 opacity-50 border-white/5' : 'bg-white/3 border-white/5'
                    }`}>
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-200 block">{pref.label}</span>
                        <span className="text-[10px] text-slate-500 block">{pref.desc}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={(appNotifSettings as any)[pref.id]}
                        disabled={pref.disabled}
                        onChange={(e) => setAppNotifSettings(prev => ({ ...prev, [pref.id]: e.target.checked }))}
                        className="w-4 h-4 cursor-pointer accent-sky-400"
                      />
                    </div>
                  ))}
                </div>

                {/* Unique Scanner QR Grid view */}
                <div className="p-4 bg-slate-950/40 border border-white/5 rounded-2xl flex flex-col md:flex-row items-center gap-4 pt-4 mt-2">
                  <div className="p-2.5 bg-white rounded-xl shadow-lg shrink-0">
                    <div className="w-24 h-24 bg-slate-100 border-2 border-dashed border-sky-500/20 rounded flex flex-col items-center justify-center relative select-none">
                      {/* Simulated high value matrix blocks for QR code scanner */}
                      <div className="grid grid-cols-5 gap-1.5 w-16 h-16">
                        {Array.from({ length: 25 }).map((_, i) => (
                          <div 
                            key={i} 
                            className={`w-2 h-2 rounded-sm ${
                              (i % 2 === 0 && i % 3 !== 0) || i === 0 || i === 4 || i === 20 || i === 24 ? 'bg-slate-900' : 'bg-transparent'
                            }`}
                          ></div>
                        ))}
                      </div>
                      <span className="absolute bottom-1 right-1 text-[7px] font-bold text-sky-600 tracking-tighter">SECURE</span>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-center md:text-left text-xs leading-relaxed font-sans">
                    <span className="text-amber-500 font-bold uppercase tracking-widest text-[9px] block">AUTHORIZED GARAGE ACCESS KEY</span>
                    <h4 className="font-bold text-slate-200 text-sm">Personal Member QR Connector</h4>
                    <p className="text-slate-400 text-[11px]">
                      Pristine authorization barcode. Authorized partner garages can scan this card to fetch specs, attachments, and register maintenance logs directly.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Subscreen: Tab 8: TELEGRAM INTEGRATION COCKPIT */}
          {activeSubTab === 'telegram' && (
            <div className="space-y-6">
              {/* Telegram Header Branding */}
              <div className="p-6 bg-slate-900/60 border border-white/10 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="p-2 bg-sky-550/15 text-sky-400 rounded-xl">
                      <MessageSquare className="w-5 h-5" />
                    </span>
                    <h2 className="text-lg font-black text-slate-100 tracking-tight">Secure Telegram Notification Engine</h2>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    Enable secure drivers OAuth-like mapping loops, audit communication feeds, and control diagnostic workshop consent thresholds dynamically.
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Gateway State:</span>
                  <div className={`px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 ${
                    tgIsConnected
                      ? "bg-emerald-555/15 text-emerald-400 border border-emerald-500/20"
                      : "bg-amber-555/15 text-amber-400 border border-amber-500/20"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${tgIsConnected ? "bg-emerald-400 animate-pulse" : "bg-amber-400 animate-pulse"}`} />
                    <span>{tgIsConnected ? "ACTIVE MAPPED LOCK" : "AWAITING MUTUAL AUTH"}</span>
                  </div>
                </div>
              </div>

              {/* Handshake Progress Pipeline */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`p-4 rounded-xl border ${tgToken ? "bg-sky-955/10 border-sky-500/25 text-sky-250" : "bg-slate-900/20 border-white/5 text-slate-400"} flex items-center gap-3.5`}>
                  <div className={`p-2.5 rounded-xl text-xs font-black ${tgToken ? "bg-sky-500 text-slate-900" : "bg-slate-800 text-slate-500"}`}>1</div>
                  <div className="text-xs">
                    <p className="font-bold">Generate Access link</p>
                    <p className="text-[10px] text-slate-400">{tgToken ? `Token: ${tgToken}` : "Pending key click"}</p>
                  </div>
                </div>
                <div className={`p-4 rounded-xl border ${tgIsConnected ? "bg-sky-955/10 border-sky-500/25 text-sky-250" : tgToken ? "bg-amber-955/10 border-amber-500/25 text-amber-250" : "bg-slate-900/20 border-white/5 text-slate-400"} flex items-center gap-3.5`}>
                  <div className={`p-2.5 rounded-xl text-xs font-black ${tgIsConnected ? "bg-sky-500 text-slate-900" : tgToken ? "bg-amber-500 text-slate-900" : "bg-slate-800 text-slate-500"}`}>2</div>
                  <div className="text-xs">
                    <p className="font-bold">Bot Handshake Verify</p>
                    <p className="text-[10px] text-slate-400">{tgIsConnected ? "Verified via /start" : tgToken ? "Awaiting start token" : "Generate token first"}</p>
                  </div>
                </div>
                <div className={`p-4 rounded-xl border ${tgIsConnected ? "bg-emerald-955/10 border-emerald-500/25 text-emerald-250" : "bg-slate-900/20 border-white/5 text-slate-400"} flex items-center gap-3.5`}>
                  <div className={`p-2.5 rounded-xl text-xs font-black ${tgIsConnected ? "bg-emerald-500 text-slate-900" : "bg-slate-800 text-slate-500"}`}>3</div>
                  <div className="text-xs">
                    <p className="font-bold">Secure Dispatch Live</p>
                    <p className="text-[10px] text-slate-400">{tgIsConnected ? "Active secure tunnel" : "Locked offline"}</p>
                  </div>
                </div>
              </div>

              {/* Grid split */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Column A: Connecting and subscribing parameters */}
                <div className="lg:col-span-5 space-y-6">
                  
                  {/* Token generator and deep link card */}
                  <div className="p-5.5 bg-slate-900/40 border border-white/5 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300 flex items-center gap-2">
                        <Key className="w-3.5 h-3.5 text-sky-450" />
                        <span>Linkage Token Control</span>
                      </h3>
                      {tgIsConnected && (
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/10">Secure</span>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="text-xs text-slate-400 space-y-2">
                        <p>
                          Generate a pristine verification handshake token to map this Driver Profile inside your Telegram chat.
                        </p>
                      </div>

                      {/* Monospace token display */}
                      <div className="p-4 bg-slate-950 border border-white/10 rounded-xl relative flex flex-col items-center justify-center space-y-2 select-all font-mono">
                        <span className="text-[9px] text-slate-500 absolute top-2 left-3 font-bold uppercase tracking-widest">Driver Handshake Token</span>
                        <div className="text-2xl font-black text-sky-400 tracking-widest py-1 pt-4">
                          {tgToken || "KH-XXXX"}
                        </div>
                        {tgToken ? (
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(tgToken);
                              setCopied(true);
                              setTimeout(() => setCopied(false), 2000);
                            }}
                            className="text-[10px] text-sky-400 hover:text-sky-350 underline flex items-center gap-1 cursor-pointer"
                          >
                            {copied ? "Copied!" : "Copy Handshake Key"}
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-500">Click button below to initiate linkage ticket</span>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <button
                          onClick={handleInitiateTelegram}
                          disabled={tgConnecting}
                          className="w-full py-2.5 px-4 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-slate-900 font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${tgConnecting ? 'animate-spin' : ''}`} />
                          <span>{tgToken ? "Regenerate Handshake Key" : "Initiate Connection Handshake"}</span>
                        </button>

                        <a 
                          href={`https://t.me/MyCarCareKHBot?start=${tgToken}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-750 text-slate-150 font-bold rounded-xl text-xs transition text-center flex items-center justify-center gap-1.5 border border-white/5"
                        >
                          <span>Launch Telegram Bot App</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>

                      {tgLogAlert && (
                        <div className={`p-3 rounded-xl border text-xs leading-normal font-sans ${
                          tgLogAlert.type === 'success' 
                            ? 'bg-emerald-500/10 border-emerald-555/20 text-emerald-450' 
                            : 'bg-indigo-500/10 border-indigo-555/20 text-indigo-400'
                        }`}>
                          {tgLogAlert.text}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* General settings preferences sync under telegram */}
                  <div className="p-5.5 bg-slate-900/40 border border-white/5 rounded-2xl space-y-4">
                    <div className="border-b border-white/5 pb-3">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300 flex items-center gap-2">
                        <Sliders className="w-3.5 h-3.5 text-sky-450" />
                        <span>Driver Notification Subscriptions</span>
                      </h3>
                    </div>

                    <div className="space-y-3">
                      {[
                        { id: 'allowMaintenanceReminders', label: 'Routine Diagnostics & Mileage Overdue', desc: 'Alert when engine parts/oil are prediction-overdue.' },
                        { id: 'allowInvoiceNotifications', label: 'Invoice Receipts & Billing Summaries', desc: 'Receive secure PDF/Image invoices over matching chat node.' },
                        { id: 'allowGarageServiceUpdates', label: 'Garage Mechanics Status Updates', desc: 'Realtime updates when vehicle enters diagnostic check.' },
                        { id: 'allowGaragePromotions', label: 'Venture Coupons & Discount Bundles', desc: 'Seasonal Cambodia car maintenance promotional campaigns.' }
                      ].map((pref) => {
                        const isChecked = tgFullStatus.settings ? !!tgFullStatus.settings[pref.id] : true;
                        return (
                          <div key={pref.id} className="flex items-start justify-between p-2.5 bg-slate-950/20 border border-white/5 rounded-xl hover:bg-slate-950/40 transition gap-4">
                            <div className="space-y-0.5 text-xs font-sans">
                              <p className="font-bold text-slate-200">{pref.label}</p>
                              <p className="text-[10px] text-slate-400 leading-normal">{pref.desc}</p>
                            </div>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={async (e) => {
                                try {
                                  await fetch("/api/notifications/settings", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ [pref.id]: e.target.checked })
                                  });
                                  await fetchTgStatus();
                                } catch (err) {
                                  console.error(err);
                                }
                              }}
                              className="w-4 h-4 cursor-pointer accent-sky-400 shrink-0 mt-0.5"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>

                {/* Column B: Terminal bot simulator */}
                <div className="lg:col-span-7 flex flex-col">
                  <div className="p-5.5 bg-slate-900/40 border border-white/5 rounded-2xl flex flex-col h-[550px] space-y-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-3 shrink-0">
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300 flex items-center gap-2">
                          <Activity className="w-3.5 h-3.5 text-sky-450" />
                          <span>MyCar Care KH Active Bot Simulator</span>
                        </h3>
                        <p className="text-[10px] text-slate-400 mt-1">Simulate live bot interaction with actual backend state resolution</p>
                      </div>
                      <span className="px-2 py-0.5 bg-slate-950 border border-white/10 text-slate-500 font-mono text-[9px] rounded uppercase">Local Node</span>
                    </div>

                    {/* Chat console feed */}
                    <div className="flex-1 bg-slate-950/90 border border-white/10 rounded-xl p-4 overflow-y-auto space-y-3.5 font-mono text-xs no-scrollbar">
                      {simulatedReplies.map((reply, index) => (
                        <div
                          key={index}
                          className={`flex flex-col max-w-[85%] ${
                            reply.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 text-[9px] text-slate-500 mb-1">
                            <span>{reply.sender === 'bot' ? '🤖 MyCar Care Bot' : '👤 You'}</span>
                            <span>•</span>
                            <span>{reply.timestamp}</span>
                          </div>
                          <div className={`p-3 rounded-2xl text-[11px] whitespace-pre-wrap leading-relaxed leading-normal ${
                            reply.sender === 'user'
                              ? 'bg-sky-955/20 text-sky-300 border border-sky-500/20 rounded-tr-none'
                              : 'bg-slate-900/90 text-slate-200 border border-white/5 rounded-tl-none'
                          }`}>
                            {reply.text}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Autocomplete helper pills */}
                    <div className="space-y-1.5 shrink-0">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider font-sans">Quick sandbox triggers:</span>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          onClick={() => handleSendBotCommand(`/start ${tgToken || 'KH-9901'}`)}
                          className="px-2.5 py-1 bg-slate-950 hover:bg-slate-900 border border-white/10 rounded-lg text-[10px] font-mono text-sky-400 hover:text-sky-350 cursor-pointer"
                        >
                          /start {tgToken || 'KH-LINK'}
                        </button>
                        <button
                          onClick={() => handleSendBotCommand('/status')}
                          className="px-2.5 py-1 bg-slate-950 hover:bg-slate-900 border border-white/10 rounded-lg text-[10px] font-mono text-slate-300 hover:text-slate-200 cursor-pointer"
                        >
                          /status
                        </button>
                        <button
                          onClick={() => handleSendBotCommand('/on')}
                          className="px-2.5 py-1 bg-slate-950 hover:bg-slate-900 border border-white/10 rounded-lg text-[10px] font-mono text-emerald-400 hover:text-emerald-350 cursor-pointer"
                        >
                          /on
                        </button>
                        <button
                          onClick={() => handleSendBotCommand('/off')}
                          className="px-2.5 py-1 bg-slate-950 hover:bg-slate-900 border border-white/10 rounded-lg text-[10px] font-mono text-amber-400 hover:text-amber-350 cursor-pointer"
                        >
                          /off
                        </button>
                        <button
                          onClick={() => handleSendBotCommand('/disconnect')}
                          className="px-2.5 py-1 bg-slate-950 hover:bg-slate-900 border border-white/10 rounded-lg text-[10px] font-mono text-rose-400 hover:text-rose-350 cursor-pointer"
                        >
                          /disconnect
                        </button>
                      </div>
                    </div>

                    {/* Chat inputs */}
                    <div className="flex gap-2 shrink-0">
                      <input
                        type="text"
                        placeholder="Type telegram bot commands here (e.g. /status)"
                        value={simulatedCommand}
                        onChange={(e) => setSimulatedCommand(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSendBotCommand();
                          }
                        }}
                        className="flex-1 bg-slate-950 border border-white/10 focus:border-sky-500/40 rounded-xl px-4 py-2.5 text-xs text-slate-200 font-mono focus:outline-none"
                      />
                      <button
                        onClick={() => handleSendBotCommand()}
                        className="p-2.5 bg-sky-500 hover:bg-sky-600 text-slate-900 rounded-xl cursor-pointer"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                </div>

              </div>

              {/* CRM permissions consent map matrix directory */}
              <div className="p-6 bg-slate-900/40 border border-white/5 rounded-2xl space-y-4">
                <div className="border-b border-white/5 pb-3.5">
                  <h3 className="text-sm font-black text-slate-200 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-sky-400" />
                    <span>Workshop Dispatch & Authorization Consent Panel</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    Granularly customize which partner garages have authorization to issue real-time Telegram notices, dispatch PDF receipt templates, or trigger active scheduled overhaul notifications representing your linked driver profile.
                  </p>
                </div>

                <div className="divide-y divide-white/5 space-y-4 pt-1">
                  {(tgFullStatus?.permissions || []).map((perm: any) => (
                    <div key={perm.id} className="pt-4 first:pt-0 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-sky-450 shrink-0" />
                          <h4 className="font-bold text-slate-200 text-sm leading-tight">{perm.garageName}</h4>
                          {perm.blockedByUser && (
                            <span className="px-1.5 py-0.5 bg-rose-500/10 border border-rose-500/20 text-rose-450 text-[9px] uppercase font-bold tracking-wider rounded">Blocked</span>
                          )}
                          {perm.reportedSpam && (
                            <span className="px-1.5 py-0.5 bg-red-500/10 border border-red-500/20 text-red-450 text-[9px] uppercase font-bold tracking-wider rounded">Reported Spam</span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 max-w-xl leading-relaxed">
                          Secure partner node linked on {new Date(perm.createdAt || "").toLocaleDateString()}. Allowed message channels are synced directly below.
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-5 justify-end">
                        {/* Interactive triggers */}
                        {!perm.blockedByUser && (
                          <div className="grid grid-cols-2 sm:flex sm:items-center gap-3">
                            <button
                              onClick={() => handleUpdateGaragePermission(perm.garageId, { allowServiceUpdates: !perm.allowServiceUpdates })}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition ${
                                perm.allowServiceUpdates 
                                  ? 'bg-sky-500/10 border-sky-500/25 text-sky-400 hover:bg-sky-500/15'
                                  : 'bg-transparent border-white/5 text-slate-450 hover:bg-white/3'
                              }`}
                            >
                              ⚙️ Diagnostics: {perm.allowServiceUpdates ? "ON" : "OFF"}
                            </button>
                            <button
                              onClick={() => handleUpdateGaragePermission(perm.garageId, { allowInvoiceMessages: !perm.allowInvoiceMessages })}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition ${
                                perm.allowInvoiceMessages 
                                  ? 'bg-sky-500/10 border-sky-500/25 text-sky-400 hover:bg-sky-500/15'
                                  : 'bg-transparent border-white/5 text-slate-450 hover:bg-white/3'
                              }`}
                            >
                              📄 Invoices: {perm.allowInvoiceMessages ? "ON" : "OFF"}
                            </button>
                            <button
                              onClick={() => handleUpdateGaragePermission(perm.garageId, { allowReminders: !perm.allowReminders })}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition ${
                                perm.allowReminders 
                                  ? 'bg-sky-500/10 border-sky-500/25 text-sky-400 hover:bg-sky-500/15'
                                  : 'bg-transparent border-white/5 text-slate-450 hover:bg-white/3'
                              }`}
                            >
                              ⏰ Schedules: {perm.allowReminders ? "ON" : "OFF"}
                            </button>
                            <button
                              onClick={() => handleUpdateGaragePermission(perm.garageId, { allowPromotions: !perm.allowPromotions })}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition ${
                                perm.allowPromotions 
                                  ? 'bg-sky-500/10 border-sky-500/25 text-sky-400 hover:bg-sky-500/15'
                                  : 'bg-transparent border-white/5 text-slate-450 hover:bg-white/3'
                              }`}
                            >
                              🏷️ Campaigns: {perm.allowPromotions ? "ON" : "OFF"}
                            </button>
                          </div>
                        )}

                        {/* Block/Spam shield switches */}
                        <div className="flex items-center gap-2 border-l border-white/5 sm:pl-4">
                          <button
                            onClick={() => handleToggleBlockGarage(perm.garageId)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition ${
                              perm.blockedByUser 
                                ? 'bg-amber-500 text-slate-900 border-amber-550' 
                                : 'bg-transparent border-white/10 text-amber-500 hover:bg-amber-500/10'
                            }`}
                          >
                            {perm.blockedByUser ? "Unblock Access" : "Block Garage"}
                          </button>
                          <button
                            onClick={() => handleReportSpamGarage(perm.garageId)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition ${
                              perm.reportedSpam 
                                ? 'bg-rose-500 text-white border-rose-550 cursor-not-allowed' 
                                : 'bg-transparent border-white/10 text-rose-450 hover:bg-rose-500/10'
                            }`}
                            disabled={perm.reportedSpam}
                          >
                            {perm.reportedSpam ? "Spam Flagged" : "Report Spam"}
                          </button>
                        </div>

                      </div>
                    </div>
                  ))}

                  {(!tgFullStatus?.permissions || tgFullStatus.permissions.length === 0) && (
                    <div className="text-center py-6 text-slate-500 text-xs font-sans">
                      No active workshop communication connections linked. Scan your Member barcode at partner workshops to prompt authorization mappings.
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}
        </>
      )}

      {/* 1. UPDATE VEHICLE STATUS MODAL */}
      {showStatusUpdateModal && (
        <div id="status-update-modal" className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-955/80 backdrop-blur-md">
          <div className="glass bg-slate-900 border border-white/10 rounded-3xl p-6 max-w-lg w-full relative z-[10000] space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-white/5 pb-3 pb-3 border-white/5">
              <h3 className="text-sm font-black text-slate-100 flex items-center gap-2 uppercase tracking-wide">
                <Wrench className="w-4.5 h-4.5 text-sky-400" />
                <span>Update Vehicle Status Node</span>
              </h3>
              <button 
                type="button" 
                onClick={() => setShowStatusUpdateModal(false)}
                className="p-1 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Select Status Node */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-extrabold text-slate-400">Select Status Option</label>
                <select
                  value={statusValue}
                  onChange={(e) => setStatusValue(e.target.value as any)}
                  className="w-full bg-slate-950 border border-white/10 p-2.5 rounded-xl text-slate-100 focus:border-sky-500 transition cursor-pointer font-bold"
                >
                  <option value="Active">Active (Current owner tracking)</option>
                  <option value="Inactive">Inactive (Temporarily dormant or broken)</option>
                  <option value="Under Repair">Under Repair (Garage diagnostic cycle)</option>
                  <option value="Sold/Transferred">Sold / Ownership Transferred</option>
                  <option value="Archived">Archived (Hide from main dashboard fleet list)</option>
                </select>
              </div>

              {/* Status Change Reason */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-extrabold text-slate-400">Transition Reason</label>
                <input
                  type="text"
                  placeholder="e.g. Scheduled general inspection overhaul, sold after cash deal"
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 p-2.5 rounded-xl text-slate-100 focus:border-sky-500 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Event Date */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-extrabold text-slate-400">Action logged Date</label>
                  <input
                    type="date"
                    value={statusDate}
                    onChange={(e) => setStatusDate(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 p-2.5 rounded-xl text-slate-100 focus:border-sky-500 transition cursor-pointer font-mono text-center"
                  />
                </div>

                {/* Optional Status Document simulation */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-extrabold text-slate-400">Attach Document / receipt</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="No document attached"
                      value={statusDocName}
                      onChange={(e) => setStatusDocName(e.target.value)}
                      className="flex-1 bg-slate-950 border border-white/10 p-2.5 rounded-xl text-slate-100 focus:border-sky-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const dummyDocs = ["garage-diagnostics-report.pdf", "resale-deed-of-sale.pdf", "insurance-incident-logs.pdf", "archived-proof.pdf"];
                        setStatusDocName(dummyDocs[Math.floor(Math.random() * dummyDocs.length)]);
                      }}
                      className="p-2.5 bg-sky-500 text-slate-950 font-bold rounded-xl hover:bg-sky-600 transition text-[10px] shrink-0 cursor-pointer"
                    >
                      Browse
                    </button>
                  </div>
                </div>
              </div>

              {/* Specific Under Repair controls */}
              {statusValue === 'Under Repair' && (
                <div className="p-4 bg-amber-500/5 rounded-2xl border border-amber-500/20 space-y-3 pt-3 animate-fade-in text-left">
                  <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-1">
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Configure Active Garage Repair Record</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold text-slate-400">Assigned Shop</label>
                      <input
                        type="text"
                        value={repairGarageNameState}
                        onChange={(e) => setRepairGarageNameState(e.target.value)}
                        className="w-full bg-slate-950 border border-white/5 p-2 rounded-xl text-slate-100 focus:border-amber-500 transition"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold text-slate-400">Diagnosis / Repair Status</label>
                      <input
                        type="text"
                        value={repairStatusState}
                        onChange={(e) => setRepairStatusState(e.target.value)}
                        className="w-full bg-slate-950 border border-white/5 p-2 rounded-xl text-slate-100 focus:border-amber-500 transition"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold text-slate-400">Est Completion Date</label>
                      <input
                        type="date"
                        value={repairEstCompletionState}
                        onChange={(e) => setRepairEstCompletionState(e.target.value)}
                        className="w-full bg-slate-950 border border-white/5 p-2 rounded-xl text-slate-100 focus:border-amber-500 transition font-mono text-center cursor-pointer"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold text-slate-400">Est Pending Invoice ($ USD)</label>
                      <input
                        type="number"
                        value={repairPendingInvoiceState}
                        onChange={(e) => setRepairPendingInvoiceState(e.target.value)}
                        className="w-full bg-slate-950 border border-white/5 p-2 rounded-xl text-slate-100 focus:border-amber-500 transition font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Status Note Description */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-extrabold text-slate-400">Detailed Transition Narrative Note</label>
                <textarea
                  placeholder="Provide details about why the vehicle status is changing. This note becomes part of the permanent timeline passport logs."
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-950 border border-white/10 p-2.5 rounded-xl text-slate-100 focus:border-sky-500 transition resize-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowStatusUpdateModal(false)}
                  className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 font-bold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateVehicleStatus(statusValue, statusReason, statusDate, statusNote, statusDocName)}
                  className="flex-1 py-2.5 bg-sky-500 hover:bg-sky-600 text-slate-950 font-black rounded-xl transition cursor-pointer uppercase tracking-wider"
                >
                  Commit Status Node
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. SECURE TRANSFER OWNERSHIP MODAL */}
      {showTransferModal && (
        <div id="transfer-ownership-modal" className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-955/80 backdrop-blur-md">
          <div className="glass bg-slate-900 border border-white/10 rounded-3xl p-6 max-w-xl w-full relative z-[10000] space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="text-sm font-black text-indigo-400 flex items-center gap-2 uppercase tracking-wide">
                <Send className="w-4.5 h-4.5" />
                <span>Initiate Historical Passport Transfer</span>
              </h3>
              <button 
                type="button" 
                onClick={() => setShowTransferModal(false)}
                className="p-1 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 text-[11px] text-indigo-200 text-left">
                🚀 Only transfer to verified Phone Numbers, Emails, or cryptographic "MyCar Care KH" account IDs. Once verified and handshaked, ownership keys and digital logs migrate.
              </div>

              {/* Target phone/email/id */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-extrabold text-slate-400">Target Recipient Address (Phone / Email / Account ID)</label>
                <input
                  type="text"
                  placeholder="e.g. +855 12 345 678, client@example.com, MCC-USER-8910"
                  value={transferTarget}
                  onChange={(e) => setTransferTarget(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 p-2.5 rounded-xl text-slate-100 focus:border-indigo-500 transition font-medium"
                />
              </div>

              {/* Price estimation & Transfer Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-extrabold text-slate-400">Settlement Deal Price ($ USD)</label>
                  <input
                    type="number"
                    placeholder="e.g. 18500"
                    value={transferPrice}
                    onChange={(e) => setTransferPrice(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 p-2.5 rounded-xl text-slate-100 focus:border-indigo-500 transition font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-extrabold text-slate-400">Settlement Transfer Date</label>
                  <input
                    type="date"
                    value={transferDateState}
                    onChange={(e) => setTransferDateState(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 p-2.5 rounded-xl text-slate-100 focus:border-indigo-500 transition cursor-pointer font-mono text-center"
                  />
                </div>
              </div>

              {/* Transfer Style Choice */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-extrabold text-slate-400">Transfer Style Configuration</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Full History Transfer', 'Partial History Transfer', 'Vehicle Profile Only'] as const).map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => setTransferType(style)}
                      className={`p-2.5 text-[10px] font-black uppercase rounded-xl transition border text-center flex flex-col justify-center items-center leading-tight gap-1.5 cursor-pointer ${
                        transferType === style
                          ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400'
                          : 'bg-transparent border-white/5 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span>{style.split(' ')[0]} {style.split(' ')[1] || ""}</span>
                      <span className="text-[8px] font-normal lowercase text-slate-400 block">{style.split(' ').slice(2).join(' ') || "Full Data"}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* If Partial Transfer: Custom Checkbox Selector Matrix */}
              {transferType === 'Partial History Transfer' && (
                <div className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/15 space-y-2 pt-2.5 animate-fade-in text-left">
                  <label className="text-[9px] uppercase font-black text-indigo-400 tracking-wider">Select Bundled Data Packages</label>
                  <p className="text-[10px] text-slate-400 pb-1">Uncheck logs that you want to exclude from the handshakable electronic transfer contract:</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {[
                      { id: 'maintenance', label: '🛠️ Service Journal' },
                      { id: 'garage_records', label: '🏦 Garage History' },
                      { id: 'spare_parts', label: '🔩 Parts Receipts' },
                      { id: 'expenses', label: '💵 Expenses Logs' },
                      { id: 'documents', label: '📁 Documents Cabinet' },
                      { id: 'mileage', label: '📉 Odometer Track' }
                    ].map((item) => {
                      const active = selectedRecordsToTransfer.includes(item.id);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            if (active) {
                              setSelectedRecordsToTransfer(prev => prev.filter(r => r !== item.id));
                            } else {
                              setSelectedRecordsToTransfer(prev => [...prev, item.id]);
                            }
                          }}
                          className={`p-2 rounded-xl text-[10px] font-semibold flex items-center gap-1.5 transition text-left border cursor-pointer ${
                            active 
                              ? 'bg-indigo-600/15 border-indigo-500/20 text-indigo-300' 
                              : 'bg-slate-950/20 border-white/5 text-slate-450'
                          }`}
                        >
                          <span className={`w-3.5 h-3.5 rounded border border-white/10 flex items-center justify-center text-[8px] ${active ? 'bg-indigo-500 text-slate-950' : 'bg-transparent'}`}>
                            {active ? '✓' : ''}
                          </span>
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Optional verification document attached */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-extrabold text-slate-400">Transfer Deed Bill-of-Sale Document Verification</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Attach signed bill of sale or receipt"
                    value={transferDocName}
                    onChange={(e) => setTransferDocName(e.target.value)}
                    className="flex-1 bg-slate-950 border border-white/10 p-2.5 rounded-xl text-slate-100 focus:border-indigo-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setTransferDocName("signed-bill-of-sale-deed.pdf");
                    }}
                    className="p-2.5 bg-indigo-500 text-slate-950 font-bold rounded-xl hover:bg-indigo-600 transition text-[10px] shrink-0 cursor-pointer animate-pulse"
                  >
                    Load Document
                  </button>
                </div>
              </div>

              {/* Seller's note */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-extrabold text-slate-400">Personal message / seller notes</label>
                <textarea
                  placeholder="Enter a message to be transferred directly to the new owner's registration request inbox..."
                  value={transferNote}
                  onChange={(e) => setTransferNote(e.target.value)}
                  rows={2.5}
                  className="w-full bg-slate-950 border border-white/10 p-2.5 rounded-xl text-slate-100 focus:border-indigo-500 transition resize-none font-medium"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 font-bold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleTransferOwnership(transferTarget, transferDateState, transferPrice, transferNote, transferType, transferDocName, selectedRecordsToTransfer)}
                  disabled={!transferTarget}
                  className="flex-1 py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-black rounded-xl transition cursor-pointer uppercase tracking-wider"
                >
                  Initiate Secure Transfer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
