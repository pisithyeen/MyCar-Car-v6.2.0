import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Wrench, 
  MapPin, 
  AlertTriangle, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  Hourglass, 
  Check, 
  ThumbsUp, 
  ThumbsDown, 
  UserCheck, 
  Percent, 
  Lock, 
  Coins, 
  FileText, 
  ShieldAlert, 
  TrendingUp, 
  Truck, 
  DollarSign, 
  ShieldCheck, 
  MessageSquare,
  Sparkles,
  Zap,
  Star,
  Map,
  Activity,
  User,
  ExternalLink,
  ChevronRight,
  Bookmark,
  Calendar,
  AlertCircle
} from "lucide-react";
import { UserProfile, VehicleProfile, MaintenanceRecord } from "../types";

// Extracted RepairRequest and ServiceBid types
interface RepairRequest {
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

interface ServiceBid {
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

interface DisputeRecord {
  id: string;
  requestId: string;
  requestTitle: string;
  providerName: string;
  complainantRole: 'Car Owner' | 'Service Provider';
  reason: string;
  details: string;
  status: 'Pending Review' | 'In Mediation' | 'Resolved' | 'Refund Triggered';
  createdAt: string;
}

interface FixMyCarBiddingModuleProps {
  userProfile: UserProfile;
  vehicles: VehicleProfile[];
  records: MaintenanceRecord[];
  onAddRecordExternal: (logData: {
    vehicleId: string;
    serviceCategory: string;
    cost: number;
    mileage: number;
    provider: string;
    description: string;
    date: string;
  }) => Promise<boolean>;
  onRefreshData?: () => void;
  // Optional pre-selected emergency category
  initialEmergencyCategory?: string;
}

export default function FixMyCarBiddingModule({
  userProfile,
  vehicles,
  records,
  onAddRecordExternal,
  onRefreshData,
  initialEmergencyCategory
}: FixMyCarBiddingModuleProps) {
  
  // Local Coin Wallet Simulation
  const [coinsBalance, setCoinsBalance] = useState<number>(() => {
    const saved = localStorage.getItem("care_coins_balance");
    return saved ? Number(saved) : 120;
  });

  const spendCoinsLocal = (amount: number, reason: string) => {
    const newBal = Math.max(0, coinsBalance - amount);
    setCoinsBalance(newBal);
    localStorage.setItem("care_coins_balance", String(newBal));
    // Trigger notification
    addNotification(`Coins Spent: -${amount} Coins`, reason);
  };

  const earnCoinsLocal = (amount: number, reason: string) => {
    const newBal = coinsBalance + amount;
    setCoinsBalance(newBal);
    localStorage.setItem("care_coins_balance", String(newBal));
    addNotification(`Coins Earned: +${amount} Coins`, reason);
  };

  // Notification logs system
  const [notifications, setNotifications] = useState<string[]>([]);
  const addNotification = (title: string, msg: string) => {
    setNotifications(prev => [`[${new Date().toLocaleTimeString()}] ${title} - ${msg}`, ...prev.slice(0, 8)]);
  };

  // State Databases (Loaded from localStorage or pre-populated with high-fidelity Cambodia specific mock data)
  const [requests, setRequests] = useState<RepairRequest[]>(() => {
    const saved = localStorage.getItem("fix_my_car_requests");
    if (saved) return JSON.parse(saved);
    
    // Default mock requests matching Cambodian specialties (EV, Hybrid, heavy diagnostics)
    const defaults: RepairRequest[] = [
      {
        id: "req-1",
        vehicleBrand: "Toyota",
        vehicleModel: "Prius",
        vehicleYear: 2012,
        engineType: "Hybrid",
        currentMileage: 185000,
        location: "Phnom Penh",
        category: "Hybrid Battery/Inverter Warning",
        description: "Red triangle check Hybrid system is on. Fuel consumption dropped drastically. Need diagnostic scan and cells replacement quote.",
        status: "Bids Received",
        urgency: "High",
        budgetRange: "$300 - $600",
        towingNeed: false,
        preferredServiceType: "Request Price Bidding",
        ownerId: "u-1",
        ownerName: "Yeon Pisith",
        createdAt: "2026-06-05T09:00:00Z",
        isUrgentBoosted: true
      },
      {
        id: "req-2",
        vehicleBrand: "BYD",
        vehicleModel: "Atto 3",
        vehicleYear: 2023,
        engineType: "EV / Fully Electric Vehicle",
        currentMileage: 28000,
        location: "Phnom Penh",
        category: "EV Power Delivery and Charging System",
        description: "DC Fast charging aborts after 3 minutes near Toul Kork. AC home charging works fine. Need specialist diagnostic and EV software check.",
        status: "Waiting for Bids",
        urgency: "Medium",
        budgetRange: "$50 - $150",
        towingNeed: false,
        preferredServiceType: "Find Freelance Mechanic",
        ownerId: "u-1",
        ownerName: "Yeon Pisith",
        createdAt: "2026-06-06T04:20:00Z"
      },
      {
        id: "req-3",
        vehicleBrand: "Lexus",
        vehicleModel: "RX400h",
        vehicleYear: 2008,
        engineType: "Hybrid",
        currentMileage: 245000,
        location: "Siem Reap",
        category: "Suspension squeak and shaking",
        description: "Loud clanking sound when driving on unsealed provincial path near Angkor Wat. Left stabilizer arm might be worn out.",
        status: "Completed",
        urgency: "Low",
        budgetRange: "$100 - $250",
        towingNeed: false,
        preferredServiceType: "Find Garage",
        ownerId: "u-18",
        ownerName: "Kosal Seng",
        createdAt: "2026-06-01T10:00:00Z"
      },
      {
        id: "req-4",
        vehicleBrand: "Hyundai",
        vehicleModel: "H1",
        vehicleYear: 2018,
        engineType: "Diesel",
        currentMileage: 142000,
        location: "Battambang",
        category: "Overheating & Radiator steam",
        description: "White smoke emerging from engine bay on Sihanouk highway. Engine temperature is maximum limit on dashboard. Towing or roadside helper search now!",
        status: "Provider Selected",
        urgency: "Emergency",
        budgetRange: "$80 - $200",
        towingNeed: true,
        preferredServiceType: "Emergency Help",
        ownerId: "u-1",
        ownerName: "Yeon Pisith",
        createdAt: "2026-06-06T12:00:00Z"
      }
    ];
    return defaults;
  });

  const [bids, setBids] = useState<ServiceBid[]>(() => {
    const saved = localStorage.getItem("fix_my_car_bids");
    if (saved) return JSON.parse(saved);

    // Initial mock bids matching requests
    const defaults: ServiceBid[] = [
      {
        id: "bid-1",
        requestId: "req-1",
        providerId: "prov-1",
        providerName: "Heng Hybrid Tech Toul Kork",
        providerType: "Hybrid Specialist",
        estimatedPrice: 420,
        diagnosisFee: 15,
        laborFee: 80,
        sparePartsEstimate: 325,
        serviceLocation: "Toul Kork, Phnom Penh",
        availability: "Today, Afternoon",
        repairTime: "4 Hours",
        warrantyPeriod: "6 Months Warranty",
        providerNote: "We have original Toyota Prius Grade-A refurbished battery cells. Comprehensive diagnostic scan is free if you do repair here.",
        providerRating: 4.9,
        isMobileAvailable: true,
        bidType: "Spare Parts + Installation Bid",
        status: "Pending",
        createdAt: "2026-06-05T11:30:00Z",
        photosOfPreviousWork: ["https://images.unsplash.com/photo-1542282088-fe8426682b8f"]
      },
      {
        id: "bid-2",
        requestId: "req-1",
        providerId: "prov-2",
        providerName: "Angkor Speed Auto Engineering",
        providerType: "Garage",
        estimatedPrice: 580,
        diagnosisFee: 0,
        laborFee: 120,
        sparePartsEstimate: 460,
        serviceLocation: "Boeung Keng Kang, Phnom Penh",
        availability: "Immediate",
        repairTime: "1 Day",
        warrantyPeriod: "1 Year Extended Warranty",
        providerNote: "Brand new replacement cells with Japanese safety testing. Complete diagnostic scan included in the labor rate.",
        providerRating: 4.8,
        isMobileAvailable: false,
        bidType: "Fixed Price Bid",
        status: "Pending",
        createdAt: "2026-06-05T12:15:00Z"
      },
      {
        id: "bid-3",
        requestId: "req-1",
        providerId: "prov-3",
        providerName: "Sokha Mobile Mechanic Clinic",
        providerType: "Mobile Mechanic",
        estimatedPrice: 350,
        diagnosisFee: 20,
        laborFee: 65,
        sparePartsEstimate: 265,
        serviceLocation: "Sensok, Phnom Penh",
        availability: "Tomorrow, 8 AM",
        repairTime: "6 Hours",
        warrantyPeriod: "3 Months Warranty",
        providerNote: "I can come and rebuild your hybrid battery pack directly in your drive or home garage. No towing fee! Best budget price.",
        providerRating: 4.6,
        isMobileAvailable: true,
        bidType: "Mobile Service Bid",
        status: "Pending",
        createdAt: "2026-06-05T14:45:00Z"
      },
      {
        id: "bid-4",
        requestId: "req-4",
        providerId: "prov-4",
        providerName: "Cambodian Rapid Road Rescue",
        providerType: "Towing Service",
        estimatedPrice: 95,
        diagnosisFee: 0,
        laborFee: 30,
        sparePartsEstimate: 65,
        serviceLocation: "Highway Route 4, Battambang Area",
        availability: "Within 25 Minutes",
        repairTime: "30 Mins Towing + Mobile assistance",
        warrantyPeriod: "Immediate rescue warranty",
        providerNote: "Professional hydraulic flatbed towing. We will transport your Hyundai H1 safely to Battambang town or repair on the spot if it's just a hose leak.",
        providerRating: 4.7,
        isMobileAvailable: true,
        bidType: "Mobile Service Bid",
        status: "Pending",
        createdAt: "2026-06-06T12:15:00Z"
      }
    ];
    return defaults;
  });

  const [disputes, setDisputes] = useState<DisputeRecord[]>(() => {
    const saved = localStorage.getItem("fix_my_car_disputes");
    if (saved) return JSON.parse(saved);
    return [
      {
        id: "dis-1",
        requestId: "req-3",
        requestTitle: "Suspension squeak and shaking",
        providerName: "Angkor Speed Auto Engineering",
        complainantRole: "Car Owner",
        reason: "Unauthorized price change",
        details: "The provider initially bid $120 but after inspection added $80 without my explicit in-app approval.",
        status: "In Mediation",
        createdAt: "2026-06-03T08:00:00Z"
      }
    ];
  });

  const [emergencyAlertActive, setEmergencyAlertActive] = useState(false);
  const [favoriteMechanics, setFavoriteMechanics] = useState<string[]>([
    "Sokha Mobile Mechanic Clinic", 
    "Heng Hybrid Tech Toul Kork"
  ]);

  // Persists databases to local storage
  useEffect(() => {
    localStorage.setItem("fix_my_car_requests", JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem("fix_my_car_bids", JSON.stringify(bids));
  }, [bids]);

  useEffect(() => {
    localStorage.setItem("fix_my_car_disputes", JSON.stringify(disputes));
  }, [disputes]);

  // General App View State
  const [activeSubTab, setActiveSubTab] = useState<'listings' | 'post-job' | 'my-dashboard' | 'emergency-now' | 'dispute-center'>('listings');
  
  // Create Post Job Form States
  const [pBrand, setPBrand] = useState("Toyota");
  const [pModel, setPModel] = useState("Prius");
  const [pYear, setPYear] = useState(2015);
  const [pEngine, setPEngine] = useState("Hybrid");
  const [pMileage, setPMileage] = useState(120000);
  const [pLocation, setPLocation] = useState("Phnom Penh");
  const [pCategory, setPCategory] = useState("Engine Oil & Flushes");
  const [pDesc, setPDesc] = useState("");
  const [pUrgency, setPUrgency] = useState<'Low' | 'Medium' | 'High' | 'Emergency'>("Medium");
  const [pBudgetRange, setPBudgetRange] = useState("$50 - $120");
  const [pTowingNeed, setPTowingNeed] = useState(false);
  const [pServiceType, setPServiceType] = useState<RepairRequest['preferredServiceType']>("Request Price Bidding");

  // Post image, video, audio attachment mock inputs
  const [photoAttachment, setPhotoAttachment] = useState<string>("");
  const [audioAttached, setAudioAttached] = useState<boolean>(false);
  const [videoAttached, setVideoAttached] = useState<boolean>(false);

  // Bid Creation Form State (for mechanics)
  const [selectedReqForBid, setSelectedReqForBid] = useState<RepairRequest | null>(null);
  const [bidPrice, setBidPrice] = useState("");
  const [bidDiagnosis, setBidDiagnosis] = useState("10");
  const [bidLabor, setBidLabor] = useState("");
  const [bidParts, setBidParts] = useState("");
  const [bidLocation, setBidLocation] = useState(userProfile.location || "Phnom Penh");
  const [bidAvailability, setBidAvailability] = useState("Today, Noon");
  const [bidRepairTime, setBidRepairTime] = useState("3 Hours");
  const [bidWarranty, setBidWarranty] = useState("1 Month Warranty");
  const [bidNote, setBidNote] = useState("");
  const [bidIsMobile, setBidIsMobile] = useState(false);
  const [bidCategoryType, setBidCategoryType] = useState<ServiceBid['bidType']>("Estimated Price Bid");

  // Bid Filters states
  const [searchFilter, setSearchFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [bidSortBy, setBidSortBy] = useState<'cheapest' | 'nearest' | 'highest rating' | 'fastest response' | 'mobile service' | 'warranty included' | 'all'>('all');

  // AI Assistant Suggestions states
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any | null>(null);
  const [aiTestingStatus, setAiTestingStatus] = useState<string>("");
  const [aiMatchingSuggestion, setAiMatchingSuggestion] = useState<any[]>([]);

  // Price adjustment (No silent price increases)
  const [requestingPriceIncrease, setRequestingPriceIncrease] = useState<string | null>(null); // holds bidId
  const [increasedPriceVal, setIncreasedPriceVal] = useState("");
  const [increasedPriceNote, setIncreasedPriceNote] = useState("");

  // Dispute creation state
  const [newDisputeReason, setNewDisputeReason] = useState("Incorrect Pricing on service check");
  const [newDisputeNote, setNewDisputeNote] = useState("");
  const [disputedBidId, setDisputedBidId] = useState("");

  // Garage Assigned Freelancer Mechanic State
  const [assignedMechanicId, setAssignedMechanicId] = useState("");
  const [assignedMechanicNote, setAssignedMechanicNote] = useState("");

  // Selected vehicle integration
  useEffect(() => {
    if (vehicles.length > 0) {
      const activeV = vehicles[0];
      setPBrand(activeV.brand);
      setPModel(activeV.model);
      setPYear(activeV.year);
      setPEngine(activeV.fuelType === "EV" ? "EV / Fully Electric Vehicle" : activeV.fuelType === "Hybrid" ? "Hybrid" : "Petrol / Gasoline");
      setPMileage(activeV.mileage);
    }
  }, [vehicles]);

  // Trigger Emergency category pre-fill
  useEffect(() => {
    if (initialEmergencyCategory) {
      setPCategory(initialEmergencyCategory);
      setPUrgency("Emergency");
      setPServiceType("Emergency Help");
      setActiveSubTab("post-job");
    }
  }, [initialEmergencyCategory]);

  // AI Diagnostic Advisor Helper Logic - Instant tailored guidance
  const runAiDiagnosisSuggestion = () => {
    if (!pDesc) {
      alert("Please describe the vehicle issue first so the AI Diagnosis helper can analyze.");
      return;
    }
    setAiTestingStatus("Analyzing your description with AI mechanical model...");
    setTimeout(() => {
      // Deterministic dynamic responses depending on phrases
      const descLower = pDesc.toLowerCase();
      let outcome = {
        causes: ["Electrical harness degradation", "Sensor contamination"],
        urgency: "Medium Warning",
        safety: "Safe to drive to nearby certified workshop, avoid speeding.",
        expectedRange: "$40 - $120",
        towRequired: "No",
        providerSpecial: "General Mechanic Shop"
      };

      if (descLower.includes("overheat") || descLower.includes("smoke") || descLower.includes("temperature")) {
        outcome = {
          causes: ["Coolant hose burst leak", "Radiator failure", "Cylinder head gasket leak"],
          urgency: "Critical Stop Immediately!",
          safety: "⚠️ EMERGENCY WARNING: Do NOT drive. Running high temperature will permanently crack the engine cylinder block and cost $2000+ to overhaul.",
          expectedRange: "$80 - $250 (Excluding head gasket rebuild if cracked)",
          towRequired: "Yes, recommended flatbed towing service.",
          providerSpecial: "Engine Coolant & Rad Specialist"
        };
      } else if (descLower.includes("hybrid") || descLower.includes("battery") || descLower.includes("triangle") || descLower.includes("prius")) {
        outcome = {
          causes: ["Hybrid Battery Cell degradation / high delta air gaps", "Cooling fan dust accumulation", "Inverter assembly short"],
          urgency: "High Action Required",
          safety: "Safe to drive short distances. High-voltage system performance is limited. Avoid highway provincial climbing.",
          expectedRange: "$350 - $750 (Refurbished cells)",
          towRequired: "No",
          providerSpecial: "Hybrid battery specialist"
        };
      } else if (descLower.includes("ev") || descLower.includes("charge") || descLower.includes("byd")) {
        outcome = {
          causes: ["DC charging contactor overheat", "BMS software requires update patch", "Charging port pin corrosion"],
          urgency: "Medium Action Required",
          safety: "Safe to charge with default AC home charger slow cycle. Plan diagnostics before next public road-trip.",
          expectedRange: "$50 - $180",
          towRequired: "No",
          providerSpecial: "EV Specialist Garage"
        };
      } else if (descLower.includes("start") || descLower.includes("click") || descLower.includes("dead")) {
        outcome = {
          causes: ["Lead-acid 12V starter battery exhaustion", "Alternator brush wear", "Keyless engine switch sensor failure"],
          urgency: "High Lockout",
          safety: "Try Jumpstart process carefully with matching copper cables or hire roadside freelancer mobile mechanic.",
          expectedRange: "$45 - $115 (Replacement starter 12V block list)",
          towRequired: "Only if jumpstart fails",
          providerSpecial: "Mobile Electrical Helper"
        };
      }

      setAiAnalysisResult(outcome);
      setAiTestingStatus("");
      addNotification("AI Diagnosis Triggered", `Analyzed: ${pBrand} ${pModel} issue.`);
    }, 1200);
  };

  // Submit new Fix My Car job request
  const handleCreateJobRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pDesc) {
      alert("Please specify the description!");
      return;
    }

    const newReq: RepairRequest = {
      id: `req-${Date.now()}`,
      vehicleBrand: pBrand,
      vehicleModel: pModel,
      vehicleYear: Number(pYear),
      engineType: pEngine,
      currentMileage: Number(pMileage),
      location: pLocation,
      category: pCategory,
      description: pDesc,
      status: pUrgency === "Emergency" ? "Posted" : "Waiting for Bids",
      urgency: pUrgency,
      budgetRange: pBudgetRange,
      towingNeed: pTowingNeed,
      preferredServiceType: pServiceType,
      ownerId: "u-1", // Logged owner
      ownerName: userProfile.name,
      createdAt: new Date().toISOString(),
      photoUrl: photoAttachment || "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=400&q=80"
    };

    setRequests(prev => [newReq, ...prev]);
    addNotification("Repair Request Appended", `"${newReq.vehicleBrand} ${newReq.vehicleModel}" problem has been broadcast.`);
    
    // Auto spend coins if boosted
    if (pUrgency === "Emergency") {
      setEmergencyAlertActive(true);
      alert("🚨 Emergency Mode Activated! An instant broadcast is dispatching to all freelance mechanics, tow services and certified garaging within Phnom Penh.");
    }

    // Reset Form
    setPDesc("");
    setPhotoAttachment("");
    setAudioAttached(false);
    setVideoAttached(false);
    setAiAnalysisResult(null);

    // Redirect
    setActiveSubTab("my-dashboard");
  };

  // Spend coins to boost job visibility
  const handleBoostRequestCoins = (reqId: string) => {
    if (coinsBalance < 15) {
      alert("Inadequate coins! Unlock more via spare-parts contributions or helpful reviews.");
      return;
    }
    spendCoinsLocal(15, `Boosted Repair Post ${reqId} priority allocation`);
    setRequests(prev => prev.map(r => r.id === reqId ? { ...r, isUrgentBoosted: true } : r));
    alert("🔥 Success! Your request has been pin-boosted to the top of the job boards for all Mechanics & Garages in Phnom Penh.");
  };

  // Bidders: Garage/Mechanic submits a bid
  const handleSubmitBidOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReqForBid) return;
    if (!bidPrice) {
      alert("Please state estimated repair price.");
      return;
    }

    // Spend coins to place high value bid
    if (coinsBalance < 5) {
      alert("Inadequate Coins! Providers require 5 Coins per application bid.");
      return;
    }
    spendCoinsLocal(5, `Bid Placement Token spent on request from ${selectedReqForBid.ownerName}`);

    const newBid: ServiceBid = {
      id: `bid-${Date.now()}`,
      requestId: selectedReqForBid.id,
      providerId: `prov-${userProfile.id}`,
      providerName: userProfile.businessName || userProfile.name,
      providerType: userProfile.role === "Freelance Mechanic" ? "Freelance Mechanic" : userProfile.role === "Spare Part Shop" ? "Spare Parts Shop" : "Garage",
      estimatedPrice: Number(bidPrice),
      diagnosisFee: Number(bidDiagnosis),
      laborFee: Number(bidLabor) || 15,
      sparePartsEstimate: Number(bidParts) || 0,
      serviceLocation: bidLocation,
      availability: bidAvailability,
      repairTime: bidRepairTime,
      warrantyPeriod: bidWarranty,
      providerNote: bidNote,
      providerRating: 4.8,
      isMobileAvailable: bidIsMobile,
      bidType: bidCategoryType,
      status: "Pending",
      createdAt: new Date().toISOString()
    };

    setBids(prev => [newBid, ...prev]);
    // Transition request status
    setRequests(prev => prev.map(r => r.id === selectedReqForBid.id ? { ...r, status: "Bids Received" } : r));

    alert("🎉 Bid submitted! The car owner has been notified and can compare your pricing and warranty details.");
    setSelectedReqForBid(null);
  };

  // Car Owner accepts a Bid
  const handleAcceptBid = (bid: ServiceBid) => {
    // Escrow simulation
    const alertMsg = `Confirming Provider: "${bid.providerName}"\n\n` +
      `Estimated pricing: $${bid.estimatedPrice}\n` +
      `Warranty: ${bid.warrantyPeriod}\n` +
      `Verification Badge: Certified Safe Provider\n\n` +
      `To protect your budget, we will hold this in Platform Escrow. Would you like to lock this booking deposit?`;
    
    if (!window.confirm(alertMsg)) return;

    // Transition bid and request
    setBids(prev => prev.map(b => b.requestId === bid.requestId ? { ...b, status: b.id === bid.id ? "Accepted" : "Declined" } : b));
    setRequests(prev => prev.map(r => r.id === bid.requestId ? { ...r, status: "Provider Selected" } : r));
    addNotification("Provider Confirmed", `Selected "${bid.providerName}" for your vehicle repair.`);
  };

  // Car Owner triggers workflow updates (Simulating client inspection and execution)
  const handleUpdateStatus = (reqId: string, nextStatus: RepairRequest['status']) => {
    setRequests(prev => prev.map(r => {
      if (r.id === reqId) {
        addNotification("Workflow Updated", `Request "${r.vehicleBrand}" changed to state: ${nextStatus}`);
        return { ...r, status: nextStatus };
      }
      return r;
    }));
  };

  // Price protection change request submitter (By Mechanics/Garages after scanning the vehicle)
  const handleRequestPriceAdjustment = (bidId: string) => {
    const matchedBid = bids.find(b => b.id === bidId);
    if (!matchedBid) return;
    setRequestingPriceIncrease(bidId);
    setIncreasedPriceVal(String(matchedBid.estimatedPrice + 25));
    setIncreasedPriceNote("Found supplementary sensor oxidation during direct physical scans.");
  };

  const submitPriceAdjustment = () => {
    if (!requestingPriceIncrease) return;
    setBids(prev => prev.map(b => b.id === requestingPriceIncrease ? { 
      ...b, 
      estimatedPrice: Number(increasedPriceVal), 
      providerNote: `[UPDATED INVOICE APPROVED NEEDED] ${increasedPriceNote} (Prev Note: ${b.providerNote})`,
      priceApprovedByOwner: false 
    } : b));

    // Change request state
    const matchedBid = bids.find(b => b.id === requestingPriceIncrease);
    if (matchedBid) {
      setRequests(prev => prev.map(r => r.id === matchedBid.requestId ? { ...r, status: "Waiting for Owner Approval" } : r));
    }

    alert("Price amendment sent to Car Owner! Repair cannot resume until they approve this adjustment (Anti-Hidden-Fee Protection).");
    setRequestingPriceIncrease(null);
  };

  // Owner approves pricing adjust
  const handleApprovePriceAdjust = (reqId: string, bidId: string) => {
    setBids(prev => prev.map(b => b.id === bidId ? { ...b, priceApprovedByOwner: true } : b));
    setRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: "Repair In Progress", priceFinalApproved: true } : r));
    addNotification("Price Approved", "You acknowledged and approved the technician fee modification draft.");
    earnCoinsLocal(5, "Bonus coins received for prompt transparent transaction approval.");
  };

  // Owner Completes and syncs to Vehicle History Database (Critical request #11)
  const handleCompleteAndInvoiceSync = (req: RepairRequest, acceptedBid: ServiceBid) => {
    const repairCost = acceptedBid.estimatedPrice;
    
    // Save record to vehicle maintenance list
    onAddRecordExternal({
      vehicleId: req.vehicleId || "v-default",
      serviceCategory: req.category,
      cost: repairCost,
      mileage: req.currentMileage + 350, // mock mileage progress
      provider: acceptedBid.providerName,
      description: `[Bidding Marketplace Job] ${req.description} - Technician comments: ${acceptedBid.providerNote}. Warranty period: ${acceptedBid.warrantyPeriod}.`,
      date: new Date().toISOString().split('T')[0]
    });

    handleUpdateStatus(req.id, "Completed");
    earnCoinsLocal(20, `Service feedback & completion reward for job #${req.id}`);
    alert(`🎉 Success! Repair logged. $${repairCost} paid from Escrow Account directly to ${acceptedBid.providerName}.\n\nThis full checklist, parts list, and service log has been recorded to your vehicle history ledger!`);
  };

  // Dispute Handler
  const handleRegisterDispute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDisputeNote) {
      alert("Provide dispute breakdown notes.");
      return;
    }

    const newDisp: DisputeRecord = {
      id: `dis-${Date.now()}`,
      requestId: disputedBidId || "req-1",
      requestTitle: "Main Engine System Diagnostics",
      providerName: "Heng Hybrid Tech Toul Kork",
      complainantRole: "Car Owner",
      reason: newDisputeReason,
      details: newDisputeNote,
      status: "Pending Review",
      createdAt: new Date().toISOString()
    };

    setDisputes(prev => [newDisp, ...prev]);
    // Transition request to dispute status
    if (disputedBidId) {
      setRequests(prev => prev.map(r => r.id === disputedBidId ? { ...r, status: "Dispute" } : r));
    }

    alert("Arbitration request logged. Super Admin is assigned to review this pricing and invoice difference.");
    setNewDisputeNote("");
    setActiveSubTab("dispute-center");
  };

  // AI Quality Checker: analyzes potential scams/underbids
  const getAiBidSafetyCheck = (bid: ServiceBid, reqBudget: string) => {
    if (bid.estimatedPrice < 20 && reqBudget.includes("300")) {
      return { status: "DANGEROUS", text: "⚠️ AI ALERT: Unreasonably cheap estimate. Probable bait-and-switch or low quality parts." };
    }
    if (bid.estimatedPrice > 1000) {
      return { status: "WARNING", text: "⚠️ AI ALERT: Estimate exceeds typical Phnom Penh market rates for this repair class." };
    }
    return { status: "SECURE", text: "✅ AI APPROVED: Pricing complies with localized Cambodia spare-parts and labor parameters." };
  };

  // Filter & match calculation based on selected filters
  const getFilteredRequests = () => {
    return requests.filter(req => {
      // General check
      const matchesSearch = req.vehicleBrand.toLowerCase().includes(searchFilter.toLowerCase()) || 
                            req.vehicleModel.toLowerCase().includes(searchFilter.toLowerCase()) ||
                            req.description.toLowerCase().includes(searchFilter.toLowerCase());
      const matchesCat = categoryFilter ? req.category === categoryFilter : true;
      return matchesSearch && matchesCat;
    });
  };

  // Smart Matching highlights for mechanics
  const getMatchingScore = (req: RepairRequest) => {
    let score = 50;
    if (userProfile.role === "Freelance Mechanic") {
      if (req.preferredServiceType === "Find Freelance Mechanic") score += 25;
    }
    if (req.location === userProfile.location) score += 20;
    if (userProfile.activatedModules?.includes("EV / Hybrid") && req.engineType.includes("EV") || req.engineType.includes("Hybrid")) {
      score += 30; // specialist match!
    }
    return score;
  };

  return (
    <div className="space-y-6">
      
      {/* -------------------- BANNER & BALANCE HEAD -------------------- */}
      <div className="bg-slate-900/60 border border-white/5 rounded-3xl p-6 relative overflow-hidden shadow-lg">
        <div className="absolute right-0 top-0 text-sky-500/5 translate-x-1/6 translate-y-[-10%] pointer-events-none">
          <Wrench className="w-56 h-56 stroke-[0.3]" />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 block animate-pulse"></span>
              <span className="text-[10px] text-emerald-400 uppercase tracking-wider font-mono font-bold">Fix My Car Bidding Hub</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-white mt-1">
              Bidding Marketplace Module
            </h1>
            <p className="text-xs text-slate-400 max-w-xl leading-normal mt-1">
              Connect vehicle mechanical issues directly to the local marketplace. Get bespoke solution bids from freelance helpers, parts suppliers and nearby garages.
            </p>
          </div>

          {/* Care Coins Quick Wallet */}
          <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-3.5 flex items-center justify-between gap-6 shrink-0 min-w-[200px]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 animate-pulse">
                <Coins className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[9px] text-slate-500 uppercase tracking-widest block font-bold font-mono">My Coins Balance</span>
                <span className="text-base font-black text-amber-400 font-mono mt-0.5 block">{coinsBalance} Care Coins</span>
              </div>
            </div>
            <button 
              onClick={() => earnCoinsLocal(50, "Demo referral promotion code")} 
              className="text-[10px] font-bold text-sky-400 hover:text-sky-300 hover:underline shrink-0"
              title="Demo claim reward coins for platform engagement"
            >
              + Get Demo Coins
            </button>
          </div>
        </div>

        {/* Local Stream notifications Ticker */}
        {notifications.length > 0 && (
          <div className="mt-4 pt-3.5 border-t border-white/5 flex items-center gap-2 text-[10px] text-sky-400 font-mono">
            <span className="px-1.5 py-0.5 rounded bg-sky-500/10 uppercase font-black shrink-0">Bidding System Log</span>
            <span className="truncate text-slate-400">{notifications[0]}</span>
          </div>
        )}
      </div>

      {/* -------------------- INTERNAL SUB-TABS SELECTOR -------------------- */}
      <div className="flex border-b border-white/15 overflow-x-auto gap-1">
        <button
          onClick={() => setActiveSubTab('listings')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === 'listings'
              ? "border-sky-500 text-white"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>Browse Public Postings</span>
        </button>

        <button
          onClick={() => setActiveSubTab('post-job')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === 'post-job'
              ? "border-sky-500 text-white"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Plus className="w-3.5 h-3.5 text-sky-400" />
          <span>Create Problem Request</span>
        </button>

        <button
          onClick={() => setActiveSubTab('my-dashboard')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === 'my-dashboard'
              ? "border-sky-500 text-white"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Role-Based Dashboard</span>
        </button>

        <button
          onClick={() => setActiveSubTab('dispute-center')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === 'dispute-center'
              ? "border-sky-500 text-white"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
          <span>Dispute Center ({disputes.length})</span>
        </button>
      </div>

      {/* -------------------- TAB CONTENT -------------------- */}
      <div className="space-y-6">
        
        {/* TAB 1: LISTINGS / BROWSE POSTINGS */}
        {activeSubTab === 'listings' && (
          <div className="space-y-4">
            
            {/* Filter Panel */}
            <div className="bg-slate-900/30 border border-white/5 rounded-2.5xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative w-full md:max-w-md">
                <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter by vehicle brand or description keyword..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500/40"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-slate-950/80 border border-white/10 text-slate-300 text-xs py-2.5 px-3 rounded-xl focus:outline-none cursor-pointer"
                >
                  <option value="">All Problem Categories</option>
                  <option value="Hybrid Battery/Inverter Warning">Hybrid Battery/Inverter Warning</option>
                  <option value="EV Power Delivery and Charging System">EV Power Delivery and Charging System</option>
                  <option value="Suspension squeak and shaking">Suspension squeak and shaking</option>
                  <option value="Overheating & Radiator steam">Overheating & Radiator steam</option>
                  <option value="Engine Problems">Engine Problems</option>
                </select>

                <select
                  value={bidSortBy}
                  onChange={(e) => setBidSortBy(e.target.value as any)}
                  className="bg-slate-950/80 border border-white/10 text-slate-300 text-xs py-2.5 px-3 rounded-xl focus:outline-none cursor-pointer"
                >
                  <option value="all">Default Matching Score</option>
                  <option value="cheapest">Cheapest Estimate Limit</option>
                  <option value="nearest">Distance: Nearest First</option>
                  <option value="highest rating">Provider Rating: 4.5+</option>
                </select>
              </div>
            </div>

            {/* Public Postings List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getFilteredRequests().map((req) => {
                const matchScore = getMatchingScore(req);
                return (
                  <div 
                    key={req.id} 
                    className={`bg-slate-900/40 border rounded-2.5xl p-5 space-y-4 relative overflow-hidden transition-all duration-300 ${
                      req.isUrgentBoosted ? "border-amber-500/30 bg-amber-500/[0.02]" : "border-white/5 hover:border-white/15"
                    }`}
                  >
                    {/* Top Labels */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded font-mono ${
                          req.urgency === 'Emergency' ? 'bg-rose-500/10 text-rose-450 text-rose-400 animate-pulse' :
                          req.urgency === 'High' ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-850 text-slate-400'
                        }`}>
                          {req.urgency} Urgency
                        </span>

                        {req.isUrgentBoosted && (
                          <span className="text-[9px] font-black uppercase text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded flex items-center gap-1">
                            <Zap className="w-2.5 h-2.5 animate-bounce" />
                            <span>COIN BOOSTED</span>
                          </span>
                        )}
                      </div>

                      <span className="text-[9px] text-slate-500 font-mono font-medium">{req.createdAt.split('T')[0]}</span>
                    </div>

                    {/* Vehicle Description Details */}
                    <div>
                      <div className="flex items-baseline gap-2">
                        <h3 className="text-base font-black text-white">{req.vehicleBrand} {req.vehicleModel}</h3>
                        <span className="text-[11px] font-mono font-bold text-slate-500">{req.vehicleYear} • {req.engineType}</span>
                      </div>
                      
                      <div className="flex items-center gap-1.5 text-xs text-sky-400/95 font-semibold mt-1">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{req.location}</span>
                        <span className="text-slate-600 font-normal">|</span>
                        <span className="text-slate-400 font-sans text-[11px]">{req.category}</span>
                      </div>

                      <p className="text-xs text-slate-300 mt-2.5 line-clamp-3 leading-relaxed">
                        {req.description}
                      </p>
                    </div>

                    {/* Metadata Flags */}
                    <div className="grid grid-cols-2 gap-2 text-center pt-2">
                      <div className="bg-slate-950/40 p-2 rounded-xl text-left border border-white/5">
                        <span className="text-[8px] text-slate-500 uppercase tracking-wide block">Owner Budget Cap</span>
                        <span className="text-xs font-black text-emerald-400 font-mono mt-0.5 block">{req.budgetRange}</span>
                      </div>
                      <div className="bg-slate-950/40 p-2 rounded-xl text-left border border-white/5">
                        <span className="text-[8px] text-slate-500 uppercase tracking-wide block">Preferred Service</span>
                        <span className="text-xs font-black text-sky-400 font-sans mt-0.5 block truncate">{req.preferredServiceType}</span>
                      </div>
                    </div>

                    {/* Bottom Match Index & Action Button */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                      <div className="flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-[10px] text-slate-400 font-semibold font-mono">Smart Match: {matchScore}%</span>
                      </div>

                      {/* Bidding trigger for Mechanics & Garages */}
                      {userProfile.role !== "Vehicle Owner" && userProfile.role !== "Admin" ? (
                        <button
                          onClick={() => {
                            setSelectedReqForBid(req);
                            setBidPrice(req.budgetRange.split(' ')[0].replace('$', ''));
                          }}
                          className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs py-2 px-3.5 rounded-xl cursor-pointer transition flex items-center gap-1"
                        >
                          <Wrench className="w-3.5 h-3.5" />
                          <span>Submit Repair Bid</span>
                        </button>
                      ) : (
                        <span className={`text-[10px] font-black uppercase tracking-wider font-mono ${
                          req.status === 'Completed' ? 'text-emerald-400' : 'text-amber-400 animate-pulse'
                        }`}>
                          Status: {req.status}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mechanics Bidding Modal */}
            <AnimatePresence>
              {selectedReqForBid && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-slate-900 border border-white/10 rounded-3xl p-6 max-w-xl w-full space-y-4 max-h-[90vh] overflow-y-auto"
                  >
                    <div className="flex justify-between items-start border-b border-white/5 pb-3">
                      <div>
                        <h4 className="text-xs text-slate-400 uppercase tracking-wider font-mono">Bidding Portal for {userProfile.role}</h4>
                        <h3 className="text-base font-black text-white">
                          Bid on {selectedReqForBid.vehicleBrand} {selectedReqForBid.vehicleModel}
                        </h3>
                      </div>
                      <button 
                        onClick={() => setSelectedReqForBid(null)}
                        className="p-1 px-2.5 rounded-lg bg-white/5 text-slate-400 hover:text-white font-bold cursor-pointer"
                      >
                        ✕ Close
                      </button>
                    </div>

                    <div className="bg-slate-950/50 p-4 rounded-xl space-y-2 border border-white/5">
                      <p className="text-xs text-sky-400 font-semibold">{selectedReqForBid.category}</p>
                      <p className="text-xs text-slate-300 leading-normal italic">
                        "{selectedReqForBid.description}"
                      </p>
                      <p className="text-[11px] text-slate-400">Budget Range Expected: <span className="text-emerald-400 font-bold">{selectedReqForBid.budgetRange}</span></p>
                    </div>

                    {/* Bidding Input form */}
                    <form onSubmit={handleSubmitBidOffer} className="space-y-4">
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Total Estimated Bid ($ USD)</label>
                          <input
                            type="number"
                            required
                            placeholder="e.g. 150"
                            value={bidPrice}
                            onChange={(e) => setBidPrice(e.target.value)}
                            className="w-full bg-slate-950 border border-white/10 p-2.5 rounded-xl text-xs text-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Diagnostic Scan Fee ($ USD)</label>
                          <input
                            type="number"
                            required
                            placeholder="e.g. 15"
                            value={bidDiagnosis}
                            onChange={(e) => setBidDiagnosis(e.target.value)}
                            className="w-full bg-slate-950 border border-white/10 p-2.5 rounded-xl text-xs text-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Service Type Class</label>
                          <select
                            value={bidCategoryType}
                            onChange={(e) => setBidCategoryType(e.target.value as any)}
                            className="w-full bg-slate-950 border border-white/10 p-2.5 rounded-xl text-xs text-white"
                          >
                            <option value="Fixed Price Bid">Fixed Price Bid (Guaranteed)</option>
                            <option value="Estimated Price Bid">Estimated Price Bid (Range)</option>
                            <option value="Diagnosis First Bid">Diagnosis First Bid (Scan then bid)</option>
                            <option value="Mobile Service Bid">Mobile Service (At Customer Road)</option>
                            <option value="Garage Visit Bid">Garage Visit Required</option>
                            <option value="Spare Parts + Installation Bid">Spare Parts + Installation Offer</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Warranty Period Offered</label>
                          <input
                            type="text"
                            placeholder="e.g. 3 Months Warranty"
                            value={bidWarranty}
                            onChange={(e) => setBidWarranty(e.target.value)}
                            className="w-full bg-slate-950 border border-white/10 p-2.5 rounded-xl text-xs text-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Estimated Repair Time</label>
                          <input
                            type="text"
                            placeholder="e.g. 4 Hours / 1 Day"
                            value={bidRepairTime}
                            onChange={(e) => setBidRepairTime(e.target.value)}
                            className="w-full bg-slate-950 border border-white/10 p-2.5 rounded-xl text-xs text-white"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Next Available Slot</label>
                          <input
                            type="text"
                            placeholder="e.g. Today 3:00 PM"
                            value={bidAvailability}
                            onChange={(e) => setBidAvailability(e.target.value)}
                            className="w-full bg-slate-950 border border-white/10 p-2.5 rounded-xl text-xs text-white"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="bidIsMobile"
                          checked={bidIsMobile}
                          onChange={(e) => setBidIsMobile(e.target.checked)}
                          className="rounded border-white/10 text-sky-500"
                        />
                        <label htmlFor="bidIsMobile" className="text-xs text-slate-300">
                          We offer Mobile/Roadside service for this request at customer location
                        </label>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold">Technician remarks and parts details</label>
                        <textarea
                          placeholder="Please breakdown labor charges and replacement spare parts compatibility context..."
                          value={bidNote}
                          onChange={(e) => setBidNote(e.target.value)}
                          className="w-full bg-slate-950 border border-white/10 p-2.5 rounded-xl text-xs text-slate-200 min-h-[90px]"
                        />
                      </div>

                      <div className="pt-2 flex items-center justify-between border-t border-white/5 bg-slate-950/40 p-4 rounded-xl text-[11px] text-slate-400">
                        <span>Bid cost: <span className="text-amber-400 font-extrabold font-mono">5 Care Coins</span> token charge status</span>
                        <button
                          type="submit"
                          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs py-2.5 px-5 rounded-xl transition cursor-pointer"
                        >
                          Submit Binding Offer
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* TAB 2: POST PROBLEM REQUEST FORM (With AI Diagnostic Helper) */}
        {activeSubTab === 'post-job' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Main Form Left (7-cols) */}
            <div className="lg:col-span-7 bg-slate-900/40 border border-white/5 rounded-3xl p-6 shadow-md space-y-4">
              <h2 className="text-base font-bold text-white border-b border-white/5 pb-2">
                Log a Problem & Request Private Bids
              </h2>

              <form onSubmit={handleCreateJobRequest} className="space-y-4">
                
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-400 uppercase font-mono font-bold">Vehicle Brand</label>
                    <input
                      type="text"
                      required
                      value={pBrand}
                      onChange={(e) => setPBrand(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 p-2.5 rounded-xl text-xs text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-400 uppercase font-mono font-bold">Model Name</label>
                    <input
                      type="text"
                      required
                      value={pModel}
                      onChange={(e) => setPModel(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 p-2.5 rounded-xl text-xs text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-400 uppercase font-mono font-bold">Year</label>
                    <input
                      type="number"
                      required
                      value={pYear}
                      onChange={(e) => setPYear(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-white/10 p-2.5 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-400 uppercase font-mono font-bold">Engine / Battery Type</label>
                    <select
                      value={pEngine}
                      onChange={(e) => setPEngine(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 p-2.5 rounded-xl text-xs text-slate-200"
                    >
                      <option value="Hybrid">Hybrid Syst.</option>
                      <option value="EV / Fully Electric Vehicle">EV / Electric</option>
                      <option value="Petrol / Gasoline">Petrol</option>
                      <option value="Diesel">Diesel</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-400 uppercase font-mono font-bold">Mileage (km)</label>
                    <input
                      type="number"
                      required
                      value={pMileage}
                      onChange={(e) => setPMileage(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-white/10 p-2.5 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-400 uppercase font-mono font-bold">Location (City/Province)</label>
                    <select
                      value={pLocation}
                      onChange={(e) => setPLocation(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 p-2.5 rounded-xl text-xs text-slate-200"
                    >
                      <option value="Phnom Penh">Phnom Penh</option>
                      <option value="Siem Reap">Siem Reap</option>
                      <option value="Battambang">Battambang</option>
                      <option value="Sihanoukville">Sihanoukville</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-400 uppercase font-mono font-bold">Problem Category</label>
                    <select
                      value={pCategory}
                      onChange={(e) => setPCategory(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 p-2.5 rounded-xl text-xs text-slate-200"
                    >
                      <option value="Engine Problems">Engine / Spark issues</option>
                      <option value="Hybrid Battery/Inverter Warning">Hybrid Pack Warning Lights</option>
                      <option value="EV Power Delivery and Charging System">EV Power & DC Chg Failure</option>
                      <option value="Brakes and Braking safety">Brakes Squeal & ABS Warning</option>
                      <option value="Suspension squeak and shaking">Suspension rattle/Strut failure</option>
                      <option value="Roadside Emergency Help">Roadside Emergency Check</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-400 uppercase font-mono font-bold">Estimated Budget Range</label>
                    <input
                      type="text"
                      value={pBudgetRange}
                      onChange={(e) => setPBudgetRange(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 p-2.5 rounded-xl text-xs text-white"
                      placeholder="e.g. $100 - $250"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-400 uppercase font-mono font-bold">Urgency Priority</label>
                    <select
                      value={pUrgency}
                      onChange={(e) => setPUrgency(e.target.value as any)}
                      className="w-full bg-slate-950 border border-white/10 p-2.5 rounded-xl text-xs text-slate-200"
                    >
                      <option value="Low">Low (No rush, next service)</option>
                      <option value="Medium">Medium Warning (Drive carefully)</option>
                      <option value="High">High Warning (Get quotes immediately)</option>
                      <option value="Emergency">🚨 Emergency Now (Stuck/Rescue request!)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-400 uppercase font-mono font-bold">Requested Service Method</label>
                    <select
                      value={pServiceType}
                      onChange={(e) => setPServiceType(e.target.value as any)}
                      className="w-full bg-slate-950 border border-white/10 p-2.5 rounded-xl text-xs text-slate-200"
                    >
                      <option value="Request Price Bidding">Request Price Bidding Competition</option>
                      <option value="Find Garage">Find Certified Garage/Workshop</option>
                      <option value="Find Freelance Mechanic">Hire Freelance Mobile Mechanic</option>
                      <option value="Donation/Exchange Spare Part">Spare Part Donation matching</option>
                      <option value="Emergency Help">Emergency Help & Towing rescue</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-slate-950/40 p-3 rounded-xl border border-white/5">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      id="towing"
                      checked={pTowingNeed}
                      onChange={(e) => setPTowingNeed(e.target.checked)}
                      className="rounded text-sky-500"
                    />
                    <label htmlFor="towing" className="text-xs text-slate-300 font-semibold cursor-pointer">
                      I require Flatbed Towing service
                    </label>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-black">Issue Description Details</label>
                  <textarea
                    required
                    placeholder="Provide troubleshooting details, warning symptoms, and dashboard signs. Explain when the sound or issue triggers..."
                    value={pDesc}
                    onChange={(e) => setPDesc(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 p-2.5 rounded-2xl text-xs text-slate-200 min-h-[140px]"
                  />
                </div>

                {/* Simulated Media Attachments */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[9px] text-slate-500 uppercase tracking-wide font-bold block">Attach Media Proof</span>
                  <div className="grid grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setPhotoAttachment("https://images.unsplash.com/photo-1486006920555-c77dce18193b")}
                      className={`py-2 px-3 border border-dashed rounded-xl text-[10px] uppercase font-mono font-bold transition ${
                        photoAttachment ? "border-emerald-500 text-emerald-400 bg-emerald-500/5" : "border-white/10 text-slate-400 hover:border-white/25"
                      }`}
                    >
                      📷 {photoAttachment ? "Photo Attached" : "Simulate Photo Upload"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setAudioAttached(true)}
                      className={`py-2 px-3 border border-dashed rounded-xl text-[10px] uppercase font-mono font-bold transition ${
                        audioAttached ? "border-emerald-500 text-emerald-400 bg-emerald-500/5" : "border-white/10 text-slate-400 hover:border-white/25"
                      }`}
                    >
                      🎤 {audioAttached ? "Voice Rec Attached" : "Capture Live Engine Noise"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setVideoAttached(true)}
                      className={`py-2 px-3 border border-dashed rounded-xl text-[10px] uppercase font-mono font-bold transition ${
                        videoAttached ? "border-emerald-500 text-emerald-400 bg-emerald-500/5" : "border-white/10 text-slate-400 hover:border-white/25"
                      }`}
                    >
                      🎥 {videoAttached ? "Video Attached" : "Attach Smoke Clip"}
                    </button>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={runAiDiagnosisSuggestion}
                    className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4 animate-pulse" />
                    <span>AI Diagnosis Check</span>
                  </button>

                  <button
                    type="submit"
                    className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs py-2.5 px-6 rounded-xl transition cursor-pointer"
                  >
                    Broadcast Request
                  </button>
                </div>
              </form>
            </div>

            {/* AI Assistant Diagnosis Helper Panel Right (5-cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-slate-900/60 border border-purple-500/20 rounded-3xl p-5 space-y-4 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-purple-400 uppercase tracking-widest flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
                    <span>AI Diagnostic Advisor</span>
                  </h3>
                  <span className="text-[9px] font-mono font-bold text-sky-400 bg-sky-400/10 px-2 py-0.5 rounded uppercase">BETA Helper</span>
                </div>

                {aiTestingStatus ? (
                  <div className="py-8 text-center space-y-2">
                    <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs text-slate-400 font-mono italic">{aiTestingStatus}</p>
                  </div>
                ) : aiAnalysisResult ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3 pb-2 text-xs"
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 font-mono uppercase font-black block">Suggested Causes</span>
                      <ul className="space-y-1 pl-1">
                        {aiAnalysisResult.causes.map((c: string, i: number) => (
                          <li key={i} className="text-slate-100 flex items-start gap-1.5 leading-relaxed font-bold">
                            <span className="text-rose-455 text-rose-400">•</span>
                            <span>{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-white/5 font-mono">
                      <div>
                        <span className="text-[8px] text-slate-500 block">EST. BUDGET GAP</span>
                        <span className="text-emerald-400 font-bold block">{aiAnalysisResult.expectedRange}</span>
                      </div>
                      <div>
                        <span className="text-[8px] text-slate-500 block">TOW INSTRUCTION</span>
                        <span className="text-amber-400 font-bold block">{aiAnalysisResult.towRequired}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/5 space-y-1 bg-rose-500/[0.04] p-3 rounded-xl border border-rose-500/10">
                      <span className="text-[9px] font-black text-rose-400 uppercase tracking-wider block">Safety Warning Instruction</span>
                      <p className="text-[11px] text-slate-300 leading-normal font-sans">
                        {aiAnalysisResult.safety}
                      </p>
                    </div>

                    <p className="text-[10px] text-slate-400 italic">
                      Matched Specialization provider: <span className="font-extrabold text-white underline">{aiAnalysisResult.providerSpecial}</span>
                    </p>
                  </motion.div>
                ) : (
                  <div className="text-center py-10 space-y-2">
                    <Sparkles className="w-8 h-8 text-purple-400/30 mx-auto" />
                    <h4 className="text-xs font-semibold text-slate-350">Request Live Diagnostic Analysis</h4>
                    <p className="text-[11px] text-slate-500 max-w-xs mx-auto leading-normal">
                      Fill out the vehicle brand and description detail of your car problem, then trigger the AI Advisor to checkout possible failure vector results.
                    </p>
                  </div>
                )}
              </div>

              {/* Verified Badge requirements Check */}
              <div className="bg-slate-900/30 border border-white/5 rounded-3xl p-5 space-y-2.5">
                <h4 className="text-[11px] font-bold text-slate-300 tracking-wide uppercase flex items-center gap-1.5 pb-2 border-b border-white/10">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Trust & Safety Protocols</span>
                </h4>
                <div className="space-y-1.5 text-xs text-slate-400 leading-normal">
                  <p className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Anti-Price-Hike Policy:</strong> Mechanics cannot update invoice values mid-repair without user approval action.</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Verified Providers:</strong> Approved technicians hold phone and business license registration stamps under Cambodian Bureau.</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ROLE-BASED DASHBOARDS */}
        {activeSubTab === 'my-dashboard' && (
          <div className="space-y-6">
            
            {/* CAR OWNER DASHBOARD (Selected by default for Owner) */}
            {userProfile.role === "Vehicle Owner" && (
              <div className="space-y-6">
                
                {/* Active Repair Requests */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold uppercase text-slate-450 tracking-wider">My Active Car Repair Requests</h3>
                  
                  {requests.filter(r => r.ownerId === "u-1").length === 0 ? (
                    <div className="glass p-8 text-center text-slate-400">
                      Not currently active with any repair requests. Submit a job from the 'Create Request' portal page.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {requests.filter(r => r.ownerId === "u-1").map((req) => {
                        // Gather matching active bids
                        const activeBids = bids.filter(b => b.requestId === req.id);
                        const confirmedBid = bids.find(b => b.requestId === req.id && b.status === "Accepted");

                        return (
                          <div key={req.id} className="bg-slate-900/60 border border-white/5 rounded-3xl p-6 space-y-4 shadow-md">
                            
                            {/* Request Info Strip */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-white/5 pb-3">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-base font-black text-white">{req.vehicleBrand} {req.vehicleModel} ({req.vehicleYear})</span>
                                  <span className={`text-[9px] uppercase tracking-wider font-mono font-bold px-1.5 py-0.5 rounded ${
                                    req.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' :
                                    req.status === 'Dispute' ? 'bg-rose-500/10 text-rose-455 text-rose-400' : 'bg-sky-500/10 text-sky-400'
                                  }`}>
                                    {req.status}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-400 mt-1">{req.category} • Budget Range Expected: {req.budgetRange}</p>
                              </div>

                              <div className="flex items-center gap-1.5">
                                {!req.isUrgentBoosted && req.status !== "Completed" && (
                                  <button
                                    onClick={() => handleBoostRequestCoins(req.id)}
                                    className="bg-amber-400/10 text-amber-400 hover:bg-amber-400 hover:text-slate-950 px-3 py-1.5 rounded-xl font-bold text-[10px] transition cursor-pointer flex items-center gap-1"
                                  >
                                    <Zap className="w-3 h-3" />
                                    <span>Urgent Boost (15 Coins)</span>
                                  </button>
                                )}

                                {req.status === "Waiting for Owner Approval" && confirmedBid && (
                                  <button
                                    onClick={() => handleApprovePriceAdjust(req.id, confirmedBid.id)}
                                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3 py-1.5 rounded-xl font-bold text-[10px] transition cursor-pointer flex items-center gap-1"
                                  >
                                    <Check className="w-3 h-3" />
                                    <span>Approve Amendment Quote</span>
                                  </button>
                                )}

                                {req.status === "Repair In Progress" && confirmedBid && (
                                  <button
                                    onClick={() => handleCompleteAndInvoiceSync(req, confirmedBid)}
                                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3 py-1.5 rounded-xl font-black text-[10px] transition cursor-pointer flex items-center gap-1 animate-pulse"
                                  >
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>Confirm Completion</span>
                                  </button>
                                )}

                                {req.status !== "Completed" && req.status !== "Dispute" && (
                                  <button
                                    onClick={() => {
                                      setDisputedBidId(req.id);
                                      setNewDisputeReason("Unsatisfactory invoice discrepancy");
                                      setActiveSubTab("dispute-center");
                                    }}
                                    className="bg-rose-500/10 text-rose-455 text-rose-400 hover:bg-rose-500/20 px-3 py-1.5 rounded-xl font-bold text-[10px] transition cursor-pointer"
                                  >
                                    Report dispute
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Connected bids or comparison list */}
                            {req.status === "Waiting for Bids" || req.status === "Bids Received" ? (
                              <div className="space-y-3 pt-1">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Compare Bid Offers ({activeBids.length})</h4>
                                
                                {activeBids.length === 0 ? (
                                  <div className="text-xs text-slate-400 py-3 italic">
                                    No bids submitted yet. Garages and mobile freelance mechanics are evaluating diagnostics parameters.
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-1 gap-3">
                                    {activeBids.map((bid) => {
                                      const compliance = getAiBidSafetyCheck(bid, req.budgetRange);
                                      return (
                                        <div key={bid.id} className="bg-slate-950/60 border border-white/5 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                                          <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                              <span className="text-xs font-bold text-slate-100">{bid.providerName}</span>
                                              <span className="text-[9px] bg-sky-500/15 text-sky-400 font-bold px-1.5 py-0.5 rounded leading-tight">
                                                {bid.providerType}
                                              </span>
                                              <span className="text-[10px] text-amber-400 font-mono font-bold flex items-center gap-0.5 ml-1">
                                                ★ {bid.providerRating}
                                              </span>
                                            </div>

                                            <div className="grid grid-cols-3 gap-4 text-[11px] font-mono">
                                              <div>
                                                <span className="text-[8px] text-slate-500 block">EST. PRICE</span>
                                                <span className="text-emerald-400 font-extrabold">${bid.estimatedPrice}</span>
                                              </div>
                                              <div>
                                                <span className="text-[8px] text-slate-500 block">REPAIR TIME</span>
                                                <span className="text-slate-300">{bid.repairTime}</span>
                                              </div>
                                              <div>
                                                <span className="text-[8px] text-slate-500 block">WARRANTY</span>
                                                <span className="text-sky-400 font-semibold">{bid.warrantyPeriod}</span>
                                              </div>
                                            </div>

                                            <p className="text-xs text-slate-400 italic">
                                              "{bid.providerNote}"
                                            </p>

                                            <p className={`text-[10px] font-mono ${
                                              compliance.status === 'DANGEROUS' ? 'text-rose-400 font-bold' : 'text-slate-500'
                                            }`}>
                                              {compliance.text}
                                            </p>
                                          </div>

                                          <div className="flex flex-col items-end justify-between gap-2 self-start md:self-center">
                                            <span className="text-[10px] text-slate-500 font-mono">Slot: {bid.availability}</span>
                                            <button
                                              onClick={() => handleAcceptBid(bid)}
                                              className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs py-2 px-4 rounded-xl transition cursor-pointer"
                                            >
                                              Accept Bid (Escrow)
                                            </button>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            ) : confirmedBid ? (
                              <div className="bg-slate-950/40 p-4 rounded-2xl border border-white/5 space-y-2">
                                <span className="text-[9px] text-slate-500 uppercase tracking-widest font-mono block">Confirmed Provider Details</span>
                                <div className="flex items-center justify-between">
                                  <div className="text-xs space-y-1">
                                    <p className="font-extrabold text-white text-sm">{confirmedBid.providerName} ({confirmedBid.providerType})</p>
                                    <p className="text-slate-350">Service Address Location: {confirmedBid.serviceLocation}</p>
                                    <p className="text-slate-400 leading-normal italic">Notes: "{confirmedBid.providerNote}"</p>
                                  </div>
                                  <span className="text-base font-black text-emerald-400 font-mono">${confirmedBid.estimatedPrice}</span>
                                </div>
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Sub features checklists: Favorite mechanics list */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-900/30 border border-white/5 p-5 rounded-3xl space-y-3">
                    <h4 className="text-xs font-bold text-slate-350 uppercase tracking-wider flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span>My Favorite Mechanical Experts</span>
                    </h4>
                    <div className="divide-y divide-white/5">
                      {favoriteMechanics.map((mech, idx) => (
                        <div key={idx} className="flex justify-between items-center py-2.5 text-xs text-slate-200 font-semibold">
                          <span>{mech}</span>
                          <span className="text-[10.5px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded uppercase font-bold">Approved Speciality</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Trust details */}
                  <div className="bg-slate-900/30 border border-white/5 p-5 rounded-3xl space-y-2 text-xs text-slate-400 leading-normal">
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-white/10">
                      <Lock className="w-4 h-4 text-sky-400" />
                      <span>Booking Deposit escrow</span>
                    </h4>
                    <p>
                      The bidding engine leverages simulated <strong>Platform Escrow</strong>. Once you accept a bid, your funding is held securely. It is only released to the freelance helper or workshop mechanic after you inspect the final job and submit confirmation.
                    </p>
                    <p className="text-[11px] text-slate-500 italic">
                      Contact support channels or register arbitration complaints instantly inside the Dispute tab if any unexpected items occur.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* FREELANCE MECHANIC DASHBOARD */}
            {userProfile.role === "Freelance Mechanic" && (
              <div className="space-y-6">
                
                {/* Available job notifications matches */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold uppercase text-rose-450 text-rose-400 tracking-wider flex items-center gap-2">
                    <Zap className="w-4 h-4 animate-bounce" />
                    <span>Live Match Opportunity Alerts (Phnom Penh)</span>
                  </h3>

                  <div className="grid grid-cols-1 gap-4">
                    {requests.map(req => {
                      const matchPct = getMatchingScore(req);
                      return (
                        <div key={req.id} className="bg-slate-900/40 border border-white/10 p-5 rounded-3xl space-y-3 hover:border-sky-500/20 transition">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-base font-black text-white">{req.vehicleBrand} {req.vehicleModel} ({req.vehicleYear})</h4>
                                <span className="text-[10px] bg-slate-950 text-slate-400 px-2 py-0.5 rounded font-mono uppercase">{req.engineType}</span>
                              </div>
                              <p className="text-[11.5px] italic text-sky-400/90 mt-1">Location Address: {req.location} • Diagnostic: {req.category}</p>
                            </div>
                            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">Smart Match: {matchPct}%</span>
                          </div>

                          <p className="text-xs text-slate-300 leading-normal line-clamp-2 bg-slate-950/40 p-3 rounded-xl italic">
                            "{req.description}"
                          </p>

                          <div className="flex justify-between items-center text-xs font-mono">
                            <span className="text-slate-500">Exp. Budget Range: <strong className="text-emerald-400">{req.budgetRange}</strong></span>
                            <button
                              onClick={() => {
                                setSelectedReqForBid(req);
                                setBidPrice("120");
                              }}
                              className="bg-emerald-500 text-slate-950 font-black py-1.5 px-4 rounded-xl cursor-pointer"
                            >
                              Send Bid Offer
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Mechanic active status list */}
                <div className="bg-slate-900/20 border border-white/5 p-5 rounded-3xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold uppercase text-slate-450 tracking-wider">My Active Soluted Invoices</h3>
                    <span className="text-xs text-slate-500">Total earnings: <strong className="text-emerald-400 font-mono">$1,845</strong></span>
                  </div>

                  <div className="divide-y divide-white/5 text-xs text-slate-300">
                    <div className="py-2.5 flex justify-between">
                      <span>Toyota Prius inverter replacement repair</span>
                      <span className="font-mono text-emerald-400">+$350 (Paid)</span>
                    </div>
                    <div className="py-2.5 flex justify-between">
                      <span>Lexus RX structural bushing assembly</span>
                      <span className="font-mono text-emerald-400">+$120 (Paid)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* GARAGE OWNER DASHBOARD */}
            {userProfile.role === "Garage Owner" && (
              <div className="space-y-6">
                
                {/* Available garaging opportunities */}
                <div className="bg-slate-900/40 border border-white/5 p-6 rounded-3xl space-y-4 shadow-lg">
                  <h3 className="text-sm font-black uppercase text-slate-300 flex items-center gap-1.5">
                    <Wrench className="w-4 h-4 text-emerald-400" />
                    <span>Public Sourcing Workshop Pipelines</span>
                  </h3>

                  <div className="space-y-3">
                    {requests.slice(0, 3).map(req => (
                      <div key={req.id} className="bg-slate-950/50 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                        <div className="space-y-1 text-xs">
                          <p className="font-extrabold text-white">{req.vehicleBrand} {req.vehicleModel} - {req.category}</p>
                          <p className="text-slate-400">Location: {req.location} • Estimate Needed range: {req.budgetRange}</p>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedReqForBid(req);
                            setBidPrice("250");
                          }}
                          className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs py-1.5 px-4.5 rounded-xl transition cursor-pointer"
                        >
                          Place Bid
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bid price lock adjustments & assignments */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-900/20 border border-white/5 p-5 rounded-3xl space-y-3">
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
                      <Lock className="w-4 h-4 text-amber-400" />
                      <span>Price Protection Amend (No hidden prices)</span>
                    </h4>
                    <p className="text-xs text-slate-400 leading-normal">
                      Need to update an estimate value after conducting diagnostic scanner check? Send a transparent approval proposal request first. Use this tool:
                    </p>

                    <div className="space-y-2">
                      <button
                        onClick={() => handleRequestPriceAdjustment("bid-1")}
                        className="w-full text-left bg-slate-950/40 p-2 text-xs text-slate-300 rounded border border-white/5 font-mono hover:bg-slate-950 transition"
                      >
                        Adjust bid estimate on Prius: Increase by +$25
                      </button>
                    </div>

                    {requestingPriceIncrease && (
                      <div className="p-3 bg-slate-950 rounded-xl space-y-2 text-xs">
                        <input
                          type="number"
                          placeholder="Adjust Price"
                          value={increasedPriceVal}
                          onChange={(e) => setIncreasedPriceVal(e.target.value)}
                          className="w-full bg-slate-900 border border-white/5 p-2 rounded text-white"
                        />
                        <input
                          type="text"
                          placeholder="Reason notes"
                          value={increasedPriceNote}
                          onChange={(e) => setIncreasedPriceNote(e.target.value)}
                          className="w-full bg-slate-900 border border-white/5 p-2 rounded text-white"
                        />
                        <button
                          onClick={submitPriceAdjustment}
                          className="bg-emerald-500 text-slate-950 px-3 py-1 rounded text-[11px]"
                        >
                          Submit Amendment
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Assigned mechanic card checks */}
                  <div className="bg-slate-900/20 border border-white/5 p-5 rounded-3xl space-y-3">
                    <h4 className="text-xs font-bold text-slate-350 uppercase tracking-widest block">Assign Mechanic to accepted repairs</h4>
                    <div className="space-y-2">
                      <select
                        value={assignedMechanicId}
                        onChange={(e) => setAssignedMechanicId(e.target.value)}
                        className="w-full bg-slate-950 p-2 rounded text-xs border border-white/10"
                      >
                        <option value="">Select internal helper...</option>
                        <option value="m-1">Sophea Khorn (EV Tech Specialist)</option>
                        <option value="m-2">Vibol Phirun (Primary Welder helper)</option>
                      </select>
                      <button
                        onClick={() => {
                          if (!assignedMechanicId) return;
                          alert(`Assigned mechanic successfully! Internal workspace alerts have been sent to their handheld terminal.`);
                          setAssignedMechanicId("");
                        }}
                        className="bg-sky-500 text-slate-950 px-3 py-1.5 rounded-xl font-bold text-[11px]"
                      >
                        Appoint Mechanic
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SPARE PARTS SHOP VIEW */}
            {userProfile.role === "Spare Part Shop" && (
              <div className="space-y-4">
                <div className="bg-slate-900/40 border border-white/10 p-6 rounded-3xl space-y-3">
                  <h3 className="text-sm font-black text-white">Sourcing Spare Parts matching Pipeline</h3>
                  <p className="text-xs text-slate-450 leading-relaxed">
                    Public requests marked as "Need Spare Part" or "Donation" are matched directly to your inventory fitments here.
                  </p>

                  <div className="space-y-3">
                    {requests.slice(0, 2).map((req) => (
                      <div key={req.id} className="bg-slate-950 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between text-xs border border-white/5">
                        <div>
                          <p className="font-extrabold text-white">{req.vehicleBrand} {req.vehicleModel} (Year: {req.vehicleYear})</p>
                          <p className="text-sky-400 mt-0.5">Needed Element: {req.category}</p>
                          <p className="text-slate-450 italic mt-1 font-sans">"{req.description}"</p>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedReqForBid(req);
                            setBidPrice("85");
                          }}
                          className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold py-1.5 px-4 rounded-xl shrink-0 cursor-pointer text-xs"
                        >
                          Offer Parts Quote
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SUPER ADMIN PANEL VIEW */}
            {userProfile.role === "Admin" && (
              <div className="space-y-4">
                <div className="bg-slate-900/60 p-6 rounded-3xl border border-white/10 space-y-4 shadow-lg">
                  <h3 className="text-sm font-black uppercase tracking-wider text-sky-400">Super Admin Bidding Audit Ledger</h3>
                  
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-slate-950 p-3 rounded-xl">
                      <span className="text-[10px] text-slate-500 uppercase block font-bold">All Public Posts</span>
                      <span className="text-lg font-bold font-mono text-white">{requests.length}</span>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-xl">
                      <span className="text-[10px] text-slate-500 uppercase block font-bold">Total Offers Submitted</span>
                      <span className="text-lg font-bold font-mono text-emerald-400">{bids.length}</span>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-xl">
                      <span className="text-[10px] text-slate-500 uppercase block font-bold">Active arbitrations</span>
                      <span className="text-lg font-bold font-mono text-rose-450 text-rose-400">{disputes.length}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest block">Fake Bid Detection Logs</h4>
                    <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5 space-y-1 text-xs font-mono text-slate-400 select-none">
                      <p className="text-emerald-400">✔ Verified safe IP traces for active mechanics.</p>
                      <p className="text-slate-500">System scanning: Sophea Mobile Mechanic Clinic bid velocity (Approved 0.05 limit/s).</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* TAB 4: DISPUTE CENTER */}
        {activeSubTab === 'dispute-center' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Create Disputes Form on Left (5 cols) */}
            <div className="lg:col-span-5 bg-slate-900/40 border border-white/5 p-6 rounded-3xl space-y-4 shadow-md">
              <h3 className="text-sm font-bold text-white border-b border-white/5 pb-2">
                Register a Repair Dispute / Complaint
              </h3>

              <form onSubmit={handleRegisterDispute} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-400 uppercase font-mono font-bold">Reason Category</label>
                  <select
                    value={newDisputeReason}
                    onChange={(e) => setNewDisputeReason(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 p-2.5 rounded-xl text-xs text-slate-200 focus:outline-none cursor-pointer"
                  >
                    <option value="Incorrect Pricing on service check">Incorrect / Hidden Price Increase</option>
                    <option value="Bait and Switch parts usage">Bait and Switch parts compatibility</option>
                    <option value="Technician did not complete appointment">Technician did not attend</option>
                    <option value="Safety concern on repair block">Safety concerns with repair</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-slate-400 uppercase font-mono font-bold">Related Repair Request ID</label>
                  <select
                    value={disputedBidId}
                    onChange={(e) => setDisputedBidId(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 p-2.5 rounded-xl text-xs text-slate-200 focus:outline-none cursor-pointer"
                  >
                    <option value="">Select a request...</option>
                    {requests.map(r => (
                      <option key={r.id} value={r.id}>{r.vehicleBrand} {r.vehicleModel} - {r.category.substring(0, 20)}...</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold">Give Details</label>
                  <textarea
                    required
                    placeholder="Provide pricing discrepancies, invoice quotes, photos, and chronological repair remarks to facilitate super admin mediation audit..."
                    value={newDisputeNote}
                    onChange={(e) => setNewDisputeNote(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 p-2.5 rounded-2xl text-xs text-slate-200 min-h-[120px]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-rose-500 hover:bg-rose-400 text-slate-950 font-black text-xs py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Register Complaint to Admin</span>
                </button>
              </form>
            </div>

            {/* Arbitration Records on Right (7-cols) */}
            <div className="lg:col-span-7 space-y-4">
              <h3 className="text-sm font-bold uppercase text-slate-450 tracking-wider">Active dispute Mediations Cases</h3>
              
              {disputes.length === 0 ? (
                <div className="glass p-8 text-center text-slate-400">
                  Wonderful! No dispute mediations currently logged on the platform.
                </div>
              ) : (
                <div className="space-y-3">
                  {disputes.map((dis) => (
                    <div key={dis.id} className="bg-slate-900/60 border border-rose-500/10 p-5 rounded-3xl space-y-3 shadow-md">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[9px] uppercase font-mono font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">
                            {dis.status}
                          </span>
                          <h4 className="text-sm font-black text-white mt-1.5">
                            "{dis.requestTitle}"
                          </h4>
                          <p className="text-[10.5px] text-slate-400 mt-1">Provider Ref: {dis.providerName} • Filed by {dis.complainantRole}</p>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">{dis.createdAt.split('T')[0]}</span>
                      </div>

                      <div className="bg-slate-950 p-3.5 rounded-xl border border-white/5 space-y-1.5">
                        <p className="text-xs font-bold text-slate-300">Complaint: {dis.reason}</p>
                        <p className="text-xs text-slate-400 leading-normal italic">
                          "{dis.details}"
                        </p>
                      </div>

                      <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 pt-1">
                        <span>Mediation ID: {dis.id}</span>
                        {userProfile.role === "Admin" && (
                          <button
                            onClick={() => {
                              alert("Resolution action taken! Booking deposit released, refunding 25 Care coins to owner's wallet.");
                              setDisputes(prev => prev.map(d => d.id === dis.id ? { ...d, status: 'Resolved' } : d));
                              earnCoinsLocal(25, "Mediation compensation payout to wallet");
                            }}
                            className="bg-emerald-500 text-slate-950 font-bold px-2 py-1 rounded"
                          >
                            Resolve Complaint
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
