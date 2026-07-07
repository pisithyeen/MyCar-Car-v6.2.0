import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  CreditCard, 
  Check, 
  QrCode, 
  Sparkles, 
  ShieldCheck, 
  Car, 
  ShoppingBag, 
  Truck, 
  ChevronRight, 
  CheckCircle, 
  AlertCircle, 
  Coins, 
  FileText, 
  Sliders, 
  Bell, 
  Layers, 
  Star,
  Trash2,
  Plus,
  Minus,
  Receipt,
  Send,
  Printer,
  TrendingUp,
  X,
  MapPin,
  Clock,
  ShieldAlert,
  Zap,
  Gauge
} from "lucide-react";
import { UserProfile, VehicleProfile } from "../types";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";

interface BillingAndSubscriptionSystemProps {
  userProfile: UserProfile;
  vehicles: VehicleProfile[];
  onRefreshData: () => void;
}

interface QrStickerOrder {
  id: string;
  vehicleId: string;
  stickerType: string;
  quantity: number;
  phone: string;
  deliveryAddress: string;
  deliveryFee: number;
  totalCost: number;
  paymentStatus: string;
  status: string;
  createdAt: string;
}

export default function BillingAndSubscriptionSystem({
  userProfile,
  vehicles,
  onRefreshData
}: BillingAndSubscriptionSystemProps) {
  const [activeSubTab, setActiveSubTab] = useState<"plans" | "business" | "marketplace" | "ai_reports" | "stickers" | "orders">("plans");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Billing Cycle Toggle
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  // Payment Modal/Popup Simulator
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentTarget, setPaymentTarget] = useState<{
    type: "plan" | "business" | "addon" | "sticker" | "report";
    name: string;
    cost: number;
    payload?: any;
  } | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"bakong" | "aba" | "card">("bakong");
  const [paymentSimulatedStatus, setPaymentSimulatedStatus] = useState<"idle" | "scanning" | "success">("idle");

  // Sticker Order state
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [selectedStickerType, setSelectedStickerType] = useState("Reflective Vinyl QR (Front + Rear Sticker Pack)");
  const [quantity, setQuantity] = useState(1);
  const [phone, setPhone] = useState(userProfile.phone || "");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [orders, setOrders] = useState<QrStickerOrder[]>([]);

  // Mini POS state
  const [posCart, setPosCart] = useState<{ id: string; name: string; price: number; qty: number }[]>([
    { id: "p1", name: "Iridium Spark Plug (Denso Japan)", price: 12.50, qty: 4 },
    { id: "p2", name: "Fully Synthetic Engine Oil 5W-30 (4L)", price: 45.00, qty: 1 }
  ]);
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [issuedReceipt, setIssuedReceipt] = useState<any | null>(null);

  // QR Scan Service Record Simulator state
  const [scanVehicleId, setScanVehicleId] = useState("");
  const [scanServiceType, setScanServiceType] = useState("Oil & Filter Replacement");
  const [scanMechanicNotes, setScanMechanicNotes] = useState("Diagnostic check clear. High-pressure battery cell voltage normal.");
  const [scanCost, setScanCost] = useState("55");

  // Customer Reminder state
  const [reminderTargetPhone, setReminderTargetPhone] = useState("+855 12 999 888");
  const [reminderTemplate, setReminderTemplate] = useState("Hello! This is MyVehicle Care. Your Toyota Prius is scheduled for its scheduled 10,000km fluid flush at our Siem Reap branch tomorrow at 9:00 AM.");

  // Marketplace extra post buy state
  const [buyPostQty, setBuyPostQty] = useState(1);
  const [buyBoostQty, setBuyBoostQty] = useState(1);

  // AI Report custom select state
  const [aiReportType, setAiReportType] = useState<"weakness" | "resale" | "dream" | "loan">("weakness");
  const [aiReportVehicleId, setAiReportVehicleId] = useState("");
  const [generatedReport, setGeneratedReport] = useState<any | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const stickerTypes = [
    { name: "Reflective Vinyl QR (Front + Rear Sticker Pack)", price: 8, description: "Highly durable, rain-proof, and reflective for night scanning" },
    { name: "Metal License Plate QR (Standard Aluminum Backing)", price: 18, description: "Ultra-premium rust-proof metal frame with embossed secure QR code" },
    { name: "Premium Acrylic QR Key Tag (Pack of 2)", price: 6, description: "Secure scratch-resistant acrylic tags to attach to car keys" }
  ];

  const currentStickerPrice = stickerTypes.find(s => s.name === selectedStickerType)?.price || 8;
  const deliveryFee = 2.5; // Flat rate Cambodia wide
  const totalCost = (currentStickerPrice * quantity) + deliveryFee;

  useEffect(() => {
    fetchOrders();
    if (vehicles.length > 0) {
      if (!selectedVehicleId) setSelectedVehicleId(vehicles[0].id);
      if (!scanVehicleId) setScanVehicleId(vehicles[0].id);
      if (!aiReportVehicleId) setAiReportVehicleId(vehicles[0].id);
    }
  }, [vehicles]);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/qr-stickers/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error("Error fetching sticker orders:", err);
    }
  };

  // Open Payment Simulator with checkout cost
  const triggerPaymentFlow = (
    type: "plan" | "business" | "addon" | "sticker" | "report",
    name: string,
    cost: number,
    payload?: any
  ) => {
    setPaymentTarget({ type, name, cost, payload });
    setShowPaymentModal(true);
    setPaymentSimulatedStatus("idle");
  };

  const handleSimulatedPaymentComplete = async () => {
    if (!paymentTarget) return;
    setPaymentSimulatedStatus("scanning");
    
    // Simulate mobile KHQR scan duration
    setTimeout(async () => {
      setPaymentSimulatedStatus("success");
      
      setTimeout(async () => {
        setShowPaymentModal(false);
        setLoading(true);
        try {
          if (paymentTarget.type === "plan") {
            const res = await fetch("/api/subscription/upgrade", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ 
                tier: paymentTarget.payload.tier,
                resetUsage: true,
                verifiedBadge: paymentTarget.payload.tier === "Pro" || paymentTarget.payload.tier === "Enterprise"
              })
            });
            if (res.ok) {
              setSuccessMsg(`Congratulations! Your personal account has been successfully upgraded to the ${paymentTarget.payload.tier} Plan.`);
              onRefreshData();
            } else {
              setErrorMsg("Server rejected plan upgrade checkout.");
            }
          } 
          else if (paymentTarget.type === "business") {
            const res = await fetch("/api/subscription/upgrade", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ 
                businessTier: paymentTarget.payload.businessTier,
                verifiedBadge: true
              })
            });
            if (res.ok) {
              setSuccessMsg(`Congratulations! Your Business Workshop has activated the ${paymentTarget.name} subscription successfully.`);
              onRefreshData();
            } else {
              setErrorMsg("Failed to active business tier.");
            }
          }
          else if (paymentTarget.type === "sticker") {
            const res = await fetch("/api/qr-stickers/order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(paymentTarget.payload)
            });
            if (res.ok) {
              setSuccessMsg(`Your order for ${paymentTarget.payload.quantity}x ${paymentTarget.payload.stickerType} has been completed and marked PAID!`);
              setDeliveryAddress("");
              fetchOrders();
              onRefreshData();
              setActiveSubTab("orders");
            } else {
              setErrorMsg("Failed to register physical sticker order.");
            }
          }
          else if (paymentTarget.type === "addon") {
            // Purchase listing posts or boosts
            const res = await fetch("/api/subscription/upgrade", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                boostCredits: (userProfile.boostCredits || 0) + (paymentTarget.payload.boostCredits || 0)
              })
            });
            if (res.ok) {
              setSuccessMsg(`Successfully purchased: ${paymentTarget.name}. Added to your active balance!`);
              onRefreshData();
            } else {
              setErrorMsg("Failed to add addon properties.");
            }
          }
          else if (paymentTarget.type === "report") {
            // Instant mock creation
            setSuccessMsg(`Payment Confirmed. ${paymentTarget.name} has been compiled with live data!`);
            generateMockAIReport(paymentTarget.payload.reportType, paymentTarget.payload.vehicleId);
          }
        } catch (e) {
          setErrorMsg("Checkout endpoint error.");
        } finally {
          setLoading(false);
          setPaymentTarget(null);
        }
      }, 1000);
    }, 2000);
  };

  const handleUpgradePlan = (tier: 'Free' | 'Home' | 'Pro' | 'Enterprise') => {
    let cost = 0;
    if (tier === 'Home') cost = billingCycle === "monthly" ? 2.99 : 29.00;
    else if (tier === 'Pro') cost = billingCycle === "monthly" ? 9.99 : 99.00;
    else if (tier === 'Enterprise') cost = billingCycle === "monthly" ? 29.99 : 299.00;

    if (cost === 0) {
      // Free plan directly
      setLoading(true);
      fetch("/api/subscription/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: 'Free', resetUsage: true, verifiedBadge: false })
      }).then(() => {
        setSuccessMsg("Plan changed to Free Package.");
        onRefreshData();
        setLoading(false);
      });
      return;
    }

    triggerPaymentFlow("plan", `${tier} Plan (${billingCycle === "monthly" ? "Monthly" : "Yearly"})`, cost, { tier });
  };

  const handleOrderStickerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicleId) {
      setErrorMsg("Please select a target vehicle profile first.");
      return;
    }
    if (!deliveryAddress.trim()) {
      setErrorMsg("Please provide a valid Cambodia delivery address.");
      return;
    }
    if (!phone.trim()) {
      setErrorMsg("Contact phone number is required.");
      return;
    }

    triggerPaymentFlow("sticker", `Physical secure QR plate (${selectedStickerType})`, totalCost, {
      vehicleId: selectedVehicleId,
      stickerType: selectedStickerType,
      quantity,
      phone,
      deliveryAddress,
      deliveryFee,
      totalCost
    });
  };

  // Mini POS Methods
  const addPosItem = () => {
    if (!newItemName || !newItemPrice) return;
    const priceNum = parseFloat(newItemPrice);
    if (isNaN(priceNum)) return;
    setPosCart([
      ...posCart,
      { id: `pos-${Date.now()}`, name: newItemName, price: priceNum, qty: 1 }
    ]);
    setNewItemName("");
    setNewItemPrice("");
  };

  const removePosItem = (id: string) => {
    setPosCart(posCart.filter(item => item.id !== id));
  };

  const calculatePosTotal = () => {
    return posCart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  };

  const handleIssueReceipt = () => {
    const total = calculatePosTotal();
    setIssuedReceipt({
      receiptNo: `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toLocaleString(),
      items: [...posCart],
      total,
      vat: total * 0.1, // 10% VAT Cambodia
      grandTotal: total * 1.1,
      shopName: userProfile.businessName || "MyVehicle Care Workshop",
      shopLicense: userProfile.licenseNumber || "Co. 8849/2025"
    });
    setSuccessMsg("Mini-POS Invoice compiled with official KHQR / Bakong link successfully!");
  };

  // QR Scan Service creation simulator
  const handleSimulateServiceRecordCreate = async () => {
    if (!scanVehicleId) {
      setErrorMsg("Please register a vehicle to simulate the service log workflow.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/garage/service-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId: scanVehicleId,
          serviceType: scanServiceType,
          cost: parseFloat(scanCost) || 45.00,
          notes: scanMechanicNotes,
          serviceDate: new Date().toISOString().split('T')[0]
        })
      });
      if (res.ok) {
        setSuccessMsg("Workshop Instant QR-Scan service log created! Real-time notification dispatched to car owner.");
        onRefreshData();
      } else {
        setErrorMsg("Failed to generate scan-driven record log.");
      }
    } catch (e) {
      setErrorMsg("Network error during scan record creation.");
    } finally {
      setLoading(false);
    }
  };

  // Automated SMS / Telegram reminder trigger
  const handleSendReminderAlert = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccessMsg(`Automated Telegram/SMS broadcast alert sent successfully to ${reminderTargetPhone}!`);
    }, 800);
  };

  // AI premium report mock generator
  const generateMockAIReport = (type: string, vehicleId: string) => {
    setAiLoading(true);
    setTimeout(() => {
      const v = vehicles.find(item => item.id === vehicleId) || vehicles[0] || {
        brand: "Toyota",
        model: "Prius",
        year: 2012,
        mileage: 185000
      };

      let title = "";
      let insights: string[] = [];
      let radarData: any[] = [];
      let recommendation = "";

      if (type === "weakness") {
        title = `AI Model Technical Weakness Report: ${v.brand} ${v.model} (${v.year})`;
        insights = [
          "Inverter coolant pump failures are common for Prius models of this age. Check current seals.",
          "Hybrid traction battery pack capacity state of health is estimated at 74%. Recommended cell balance within 15,000km.",
          "O2 sensor response is slow; might trigger warning code P0138 if fuel quality is substandard."
        ];
        radarData = [
          { subject: "Inverter", A: 60, B: 90, fullMark: 100 },
          { subject: "Battery Pack", A: 74, B: 85, fullMark: 100 },
          { subject: "E-CVT Gearbox", A: 88, B: 95, fullMark: 100 },
          { subject: "Suspension Coils", A: 65, B: 80, fullMark: 100 },
          { subject: "Brake Regen", A: 90, B: 95, fullMark: 100 }
        ];
        recommendation = "Target check the hybrid coolant system loop during your next service appointment.";
      } else if (type === "resale") {
        title = `AI Resale Value Readiness & Liquid Market Grade: ${v.brand} ${v.model}`;
        insights = [
          "Liquidity Index in Phnom Penh: HIGH (Fast resale turnover, average 9 days on marketplace).",
          "Odometer reading is moderate; having verified digital QR service logs boosts valuation by up to +$1,200 USD.",
          "Paint wear on roof panel is normal; estimated minor detail restorer will yield 3x ROI on sales price."
        ];
        radarData = [
          { subject: "Market Demand", A: 95, B: 90, fullMark: 100 },
          { subject: "Odometer Trust", A: 78, B: 85, fullMark: 100 },
          { subject: "Interior Quality", A: 82, B: 90, fullMark: 100 },
          { subject: "Service History", A: 90, B: 95, fullMark: 100 },
          { subject: "Mechanical Health", A: 80, B: 85, fullMark: 100 }
        ];
        recommendation = "Complete paint detailing and export your full verified QR chronological history log before listing.";
      } else if (type === "dream") {
        title = `AI Dream Car Advisor Match & Cambodian Road Clearance Rating`;
        insights = [
          "Ground clearance matches standard Cambodia flooded season requirements (180mm+ recommended).",
          "Spare parts availability in Phnom Penh: EXCELLENT (Parts depots widely stocked across Boeung Salang).",
          "Estimated annual registration/maintenance tax overhead is low ($45 USD/year)."
        ];
        radarData = [
          { subject: "Clearance & Flooding", A: 90, B: 90, fullMark: 100 },
          { subject: "Parts Access", A: 95, B: 95, fullMark: 100 },
          { subject: "Fuel Economy", A: 85, B: 90, fullMark: 100 },
          { subject: "Local Mechanic Skill", A: 95, B: 90, fullMark: 100 },
          { subject: "Comfort & Cabin Noise", A: 75, B: 80, fullMark: 100 }
        ];
        recommendation = "This model is highly robust for both city roads and provincial highways in Cambodia.";
      } else {
        title = `AI Car Loan Affordability & Total Ownership Cost Forecast`;
        insights = [
          "Monthly debt service ratio of standard auto loans in Cambodia: 25% of median monthly family income.",
          "Depreciation forecast: Year 1-2 sees 15% drop, stabilizes beautifully at 6%/year thereafter.",
          "Projected fuel + routine parts replacement overhead: $145 USD monthly."
        ];
        radarData = [
          { subject: "Debt Service Ratio", A: 85, B: 90, fullMark: 100 },
          { subject: "Depreciation Curve", A: 90, B: 85, fullMark: 100 },
          { subject: "Fuel Affordability", A: 80, B: 90, fullMark: 100 },
          { subject: "Insurance Rates", A: 75, B: 80, fullMark: 100 },
          { subject: "Taxes & Duties", A: 95, B: 95, fullMark: 100 }
        ];
        recommendation = "Consider a 36-month loan term at standard 8% local commercial bank APR with 30% down payment.";
      }

      setGeneratedReport({
        title,
        insights,
        radarData,
        recommendation,
        date: new Date().toLocaleDateString(),
        score: Math.floor(75 + Math.random() * 20)
      });
      setAiLoading(false);
    }, 1200);
  };

  const currentTier = userProfile.subscriptionTier || "Free";
  const businessTier = userProfile.businessSubscriptionTier || "None";

  // Compute personal limits & usage
  const maxVehicles = currentTier === "Free" ? 2 : currentTier === "Home" ? 5 : currentTier === "Pro" ? 30 : 99999;
  const currentVehiclesCount = vehicles.length;
  
  const aiLimit = userProfile.aiUsageLimit || (currentTier === 'Free' ? 3 : currentTier === 'Home' ? 15 : currentTier === 'Pro' ? 50 : 999999);
  const aiCount = userProfile.aiUsageCount || 0;

  const pricingTiers = [
    {
      id: "Free" as const,
      name: "Free Package",
      monthlyPrice: "$0",
      yearlyPrice: "$0",
      description: "Ideal for basic diagnostic lookups and single car owners",
      features: [
        "Up to 2 active vehicles registered",
        "Secure Digital QR code lookup",
        "Basic maintenance logs",
        "Limited AI diagnostics (3 queries limit)",
        "1 active vehicle selling post",
        "1 active spare part classified post",
        "No advanced fleet tools",
        "No premium PDF exports"
      ],
      color: "border-slate-800 bg-slate-900/40 text-slate-300",
      badge: "Basic Profile"
    },
    {
      id: "Home" as const,
      name: "Home Care Plan",
      monthlyPrice: "$2.99",
      yearlyPrice: "$29.00",
      description: "Best for households, multi-vehicle owners, and family driver sharing",
      features: [
        "Up to 5 active vehicles registered",
        "Interactive digital dashboard",
        "Family & driver instant sharing options",
        "Custom maintenance reminder notifications",
        "Telegram reminder bot dispatch prepared",
        "Extended AI diagnostics (15 queries limit)",
        "Up to 5 active marketplace listings",
        "Unblocked PDF history exports"
      ],
      color: "border-sky-500 bg-sky-950/20 text-slate-100",
      badge: "Popular Selection",
      highlight: true
    },
    {
      id: "Pro" as const,
      name: "Pro Fleet Plan",
      monthlyPrice: "$9.99",
      yearlyPrice: "$99.00",
      description: "Complete workstation for professional vehicle fleets & managers",
      features: [
        "Up to 30 active vehicles registered",
        "Fleet & staff driver assignments",
        "Real-time authorization ticketing hub",
        "Detailed fuel & service expense analysis",
        "Verified seller marketplace badge",
        "Premium AI diagnosis advisor (50 queries)",
        "5 free listing boost credits monthly",
        "Advanced fleet management tools"
      ],
      color: "border-indigo-500 bg-indigo-950/20 text-slate-100",
      badge: "Fleet Elite"
    },
    {
      id: "Enterprise" as const,
      name: "Enterprise Custom",
      monthlyPrice: "$29.99",
      yearlyPrice: "$299.00",
      description: "Robust analytics console for high-scale enterprise fleets",
      features: [
        "Unlimited vehicle registrations",
        "Multi-branch & company operations dashboard",
        "Bulk physical secure QR sticker generation",
        "Granular team permission levels & staff roles",
        "Dedicated VIP customer success manager",
        "Unlimited AI diagnostics lookup logs",
        "Custom analytical reports export tool",
        "Custom domain + API integrations"
      ],
      color: "border-emerald-500 bg-emerald-950/20 text-slate-100",
      badge: "Unlimited scale"
    }
  ];

  return (
    <div id="billing_subscription_module" className="space-y-8 p-1 sm:p-4">
      
      {/* HEADER STATEMENT */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-white/5 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <CreditCard className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Revenue Stream & Monetization Hub</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            Upgrade your SaaS tier, manage business POS subscriptions, purchase marketplace advertising boosts, or order secure physical QR sticker plates.
          </p>
        </div>

        {/* Current Status Pill */}
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl self-start sm:self-center">
          <div className="space-y-0.5">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Plan Tier</div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black text-white">{currentTier} Plan</span>
              {userProfile.verifiedBadge && (
                <span className="bg-sky-500/10 text-sky-400 text-[9px] px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5 border border-sky-500/25">
                  <ShieldCheck className="w-2.5 h-2.5" /> Verified Partner
                </span>
              )}
            </div>
            {businessTier !== "None" && (
              <div className="text-[9px] font-mono text-emerald-400">Business: {businessTier}</div>
            )}
          </div>
        </div>
      </div>

      {/* FEEDBACK PROMPTS */}
      {successMsg && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-500/10 border border-emerald-500/25 p-4 rounded-xl flex items-start gap-3"
        >
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="w-full">
            <div className="flex justify-between items-start">
              <h4 className="text-sm font-bold text-emerald-300">Success!</h4>
              <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-xs text-emerald-400/90 mt-1">{successMsg}</p>
          </div>
        </motion.div>
      )}

      {errorMsg && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-rose-500/10 border border-rose-500/25 p-4 rounded-xl flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="w-full">
            <div className="flex justify-between items-start">
              <h4 className="text-sm font-bold text-rose-300">Error</h4>
              <button onClick={() => setErrorMsg(null)} className="text-rose-400 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-xs text-rose-400/90 mt-1">{errorMsg}</p>
          </div>
        </motion.div>
      )}

      {/* LIMITS AND REAL-TIME TRACKER CONSOLE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Tracker 1: Vehicles limit */}
        <div className="bg-slate-900/40 border border-white/5 rounded-xl p-5 space-y-3.5 shadow-sm">
          <div className="flex justify-between items-start">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-slate-400">Vehicles Registration</div>
              <div className="text-lg font-black text-white">{currentVehiclesCount} <span className="text-xs font-medium text-slate-500">/ {maxVehicles === 99999 ? "Unlimited" : `${maxVehicles} Allowed`}</span></div>
            </div>
            <span className="p-2 bg-sky-500/10 text-sky-400 rounded-lg">
              <Car className="w-4 h-4" />
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${currentVehiclesCount >= maxVehicles ? "bg-amber-500" : "bg-sky-500"}`}
              style={{ width: `${Math.min(100, (currentVehiclesCount / maxVehicles) * 100)}%` }}
            ></div>
          </div>
          <div className="text-[10px] text-slate-400 flex items-center justify-between">
            <span>Used: {Math.round((currentVehiclesCount / maxVehicles) * 100 || 0)}%</span>
            {currentVehiclesCount >= maxVehicles && <span className="text-amber-400 font-bold">Upgrade needed!</span>}
          </div>
        </div>

        {/* Tracker 2: AI Diagnosis lookup quota */}
        <div className="bg-slate-900/40 border border-white/5 rounded-xl p-5 space-y-3.5 shadow-sm">
          <div className="flex justify-between items-start">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-slate-400">AI Diagnostics Quota</div>
              <div className="text-lg font-black text-white">{aiCount} <span className="text-xs font-medium text-slate-500">/ {aiLimit === 999999 ? "Unlimited" : `${aiLimit} queries`}</span></div>
            </div>
            <span className="p-2 bg-pink-500/10 text-pink-400 rounded-lg">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${aiCount >= aiLimit ? "bg-rose-500" : "bg-pink-500"}`}
              style={{ width: `${Math.min(100, (aiCount / aiLimit) * 100)}%` }}
            ></div>
          </div>
          <div className="text-[10px] text-slate-400 flex items-center justify-between">
            <span>Used: {Math.round((aiCount / aiLimit) * 100 || 0)}%</span>
            {aiCount >= aiLimit && <span className="text-rose-400 font-bold">Limit Reached!</span>}
          </div>
        </div>

        {/* Tracker 3: Marketplace posts and credits */}
        <div className="bg-slate-900/40 border border-white/5 rounded-xl p-5 space-y-3.5 shadow-sm">
          <div className="flex justify-between items-start">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-slate-400">Boost Post Credits</div>
              <div className="text-lg font-black text-white">{userProfile.boostCredits || 0} <span className="text-xs font-medium text-slate-500">Credits</span></div>
            </div>
            <span className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
              <Coins className="w-4 h-4" />
            </span>
          </div>
          <div className="text-[11px] text-slate-300">
            {currentTier === "Free" ? "Upgrade plan to receive monthly free classified listing boosts." : "Apply credits to premium listings to claim top front-page ranking."}
          </div>
          <div className="text-[10px] text-slate-400">
            Seller Badge: {userProfile.verifiedBadge ? "★ Verified Automotive Partner" : "Standard Private Seller"}
          </div>
        </div>
      </div>

      {/* MODULE TAB CHANGER */}
      <div className="flex border-b border-white/10 gap-2 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveSubTab("plans")}
          className={`px-4 py-2 font-bold text-xs transition border-b-2 whitespace-nowrap cursor-pointer ${
            activeSubTab === "plans" ? "border-emerald-500 text-emerald-400 animate-pulse" : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          1. Owner Plans
        </button>
        <button
          onClick={() => setActiveSubTab("business")}
          className={`px-4 py-2 font-bold text-xs transition border-b-2 whitespace-nowrap cursor-pointer ${
            activeSubTab === "business" ? "border-emerald-500 text-emerald-400" : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          2. Business Subscriptions & POS
        </button>
        <button
          onClick={() => setActiveSubTab("marketplace")}
          className={`px-4 py-2 font-bold text-xs transition border-b-2 whitespace-nowrap cursor-pointer ${
            activeSubTab === "marketplace" ? "border-emerald-500 text-emerald-400" : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          3. Marketplace Ads Shop
        </button>
        <button
          onClick={() => setActiveSubTab("ai_reports")}
          className={`px-4 py-2 font-bold text-xs transition border-b-2 whitespace-nowrap cursor-pointer ${
            activeSubTab === "ai_reports" ? "border-emerald-500 text-emerald-400" : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          4. AI Premium Reports
        </button>
        <button
          onClick={() => setActiveSubTab("stickers")}
          className={`px-4 py-2 font-bold text-xs transition border-b-2 whitespace-nowrap cursor-pointer ${
            activeSubTab === "stickers" ? "border-emerald-500 text-emerald-400" : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          5. Secure QR Plates
        </button>
        <button
          onClick={() => { setActiveSubTab("orders"); fetchOrders(); }}
          className={`px-4 py-2 font-bold text-xs transition border-b-2 whitespace-nowrap cursor-pointer relative ${
            activeSubTab === "orders" ? "border-emerald-500 text-emerald-400" : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          6. Delivery Tracker
          {orders.length > 0 && (
            <span className="ml-1 bg-emerald-500 text-slate-950 font-extrabold text-[9px] px-1 rounded-full">
              {orders.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: OWNER PLANS */}
      {activeSubTab === "plans" && (
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h3 className="text-lg font-bold text-white">Compare Our Personal Packages</h3>
            <p className="text-xs text-slate-400">
              Upgrade your personal subscription seamlessly with a single click. Basic vehicle history viewing and logs remain always free and unblocked!
            </p>
            
            {/* Billing Cycle Toggle */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <span className={`text-xs font-bold ${billingCycle === "monthly" ? "text-emerald-400" : "text-slate-400"}`}>Monthly billing</span>
              <button 
                onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
                className="w-12 h-6 bg-slate-800 rounded-full p-1 transition relative cursor-pointer border border-white/5"
              >
                <div className={`w-4 h-4 bg-emerald-400 rounded-full transition-transform ${billingCycle === "yearly" ? "translate-x-6" : ""}`} />
              </button>
              <span className={`text-xs font-bold flex items-center gap-1 ${billingCycle === "yearly" ? "text-emerald-400" : "text-slate-400"}`}>
                Yearly billing <span className="bg-emerald-500/20 text-emerald-400 font-extrabold text-[9px] px-1.5 py-0.5 rounded">SAVE ~20%</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricingTiers.map((plan) => {
              const isCurrent = currentTier === plan.id;
              const priceLabel = billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
              const periodLabel = billingCycle === "monthly" ? "mo" : "yr";

              return (
                <div 
                  key={plan.id}
                  className={`border rounded-2xl p-5 flex flex-col justify-between transition relative ${plan.color} ${
                    plan.highlight ? "ring-2 ring-emerald-500/50 shadow-emerald-500/5" : "shadow-sm hover:border-slate-700"
                  }`}
                >
                  {plan.highlight && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-slate-950 font-black text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Best Value
                    </span>
                  )}

                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-base font-black text-white">{plan.name}</h4>
                        <span className="text-[10px] text-slate-400 font-semibold">{plan.badge}</span>
                      </div>
                      {isCurrent && (
                        <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold px-2 py-0.5 rounded border border-emerald-500/20">
                          Active Now
                        </span>
                      )}
                    </div>

                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-white">{priceLabel}</span>
                      <span className="text-xs text-slate-400">/ {periodLabel}</span>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed">{plan.description}</p>

                    <div className="h-px bg-white/10 my-2" />

                    <ul className="space-y-2 text-[11px] text-slate-300">
                      {plan.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6 pt-2">
                    {isCurrent ? (
                      <button
                        disabled
                        className="w-full py-2 bg-white/5 text-slate-400 border border-white/10 rounded-xl text-xs font-bold cursor-not-allowed"
                      >
                        Active Plan
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpgradePlan(plan.id)}
                        disabled={loading}
                        className={`w-full py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 ${
                          plan.highlight 
                            ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950" 
                            : "bg-white/10 hover:bg-white/15 text-white"
                        }`}
                      >
                        {loading ? "Activating..." : `Upgrade to ${plan.id}`}
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Secure Guarantee Banner */}
          <div className="bg-slate-950/60 border border-slate-800/80 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-sm">
                <ShieldCheck className="w-4 h-4" />
                <span>Transparent Billing Guarantee</span>
              </div>
              <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                We believe in straightforward pricing. No hidden fees, no auto-billing loops. Change or downgrade back to the Free plan at any time. All prices are denominated in USD.
              </p>
            </div>
            <div className="text-[10px] font-mono text-slate-400">
              Billing ID: ACC-a8cf348c
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BUSINESS SUBSCRIPTIONS & POS */}
      {activeSubTab === "business" && (
        <div className="space-y-8">
          
          {/* Intro Section */}
          <div className="bg-slate-950/60 border border-white/5 p-6 rounded-2xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded">
                <Layers className="w-4 h-4" />
              </span>
              <h3 className="text-base font-bold text-white">Business Workshop Subscription Tiers</h3>
            </div>
            <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
              Equip your local garage, spare parts warehouse, petrol branch, or freelance mechanic operation with enterprise-grade workflows. Select from specialized tiers to unlock point-of-sale receipt issuance, staff access rights, and real-time customer reminders.
            </p>
          </div>

          {/* Specialized Business Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Garage Tiers */}
            <div className="bg-slate-900/20 border border-white/5 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] uppercase font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">GARAGE MECHANICS</span>
                  <span className="text-xs text-slate-400">For repair centers</span>
                </div>
                <h4 className="text-base font-bold text-white">Garage Pro subscription</h4>
                <div className="text-xl font-black text-white">$49.00 <span className="text-xs font-normal text-slate-400">/ mo</span></div>
                <p className="text-xs text-slate-400">Complete repair bay automation. Includes up to 30 staff seats and equipment validation badges.</p>
                <div className="h-px bg-white/5" />
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Up to 30 Staff Accounts</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> 5 Active Diagnostic Bays</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Verified Equipment Check</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Mini POS & Digital Receipt Hub</li>
                </ul>
              </div>
              <button 
                onClick={() => triggerPaymentFlow("business", "Garage Pro Tier", 49.00, { businessTier: "Garage_Pro" })}
                className="w-full py-2 bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-black text-xs rounded-xl transition mt-4"
              >
                Onboard Garage Pro
              </button>
            </div>

            {/* Spare Parts Warehouse */}
            <div className="bg-slate-900/20 border border-white/5 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] uppercase font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">PARTS DISTRIBUTORS</span>
                  <span className="text-xs text-slate-400">For retail shops</span>
                </div>
                <h4 className="text-base font-bold text-white">Parts Shop Pro subscription</h4>
                <div className="text-xl font-black text-white">$39.00 <span className="text-xs font-normal text-slate-400">/ mo</span></div>
                <p className="text-xs text-slate-400">Expand local sales with integrated eCommerce dispatching and spare parts inventory scanning.</p>
                <div className="h-px bg-white/5" />
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> 500 Parts Catalog Limit</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> eCommerce Dispatch Integration</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> 15 Staff Accounts</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Bulk Catalog Posting Tool</li>
                </ul>
              </div>
              <button 
                onClick={() => triggerPaymentFlow("business", "Parts Shop Pro Tier", 39.00, { businessTier: "Shop_Pro" })}
                className="w-full py-2 bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-black text-xs rounded-xl transition mt-4"
              >
                Onboard Parts Pro
              </button>
            </div>

            {/* Freelance / Station Partner */}
            <div className="bg-slate-900/20 border border-white/5 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] uppercase font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">FREELANCERS & EV</span>
                  <span className="text-xs text-slate-400">For independent contractors</span>
                </div>
                <h4 className="text-base font-bold text-white">Freelancer Mechanic Pro</h4>
                <div className="text-xl font-black text-white">$9.99 <span className="text-xs font-normal text-slate-400">/ mo</span></div>
                <p className="text-xs text-slate-400">Unlocks standard bid submissions for car repair requests around Cambodia with a verified mechanic tag.</p>
                <div className="h-px bg-white/5" />
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Submit Unlimited Repair Proposals</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Verified Mobile Mechanic Badge</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Direct Customer Phone Calling</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Job matching push alerts</li>
                </ul>
              </div>
              <button 
                onClick={() => triggerPaymentFlow("business", "Freelancer Mechanic Pro", 9.99, { businessTier: "Freelancer_Pro" })}
                className="w-full py-2 bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-black text-xs rounded-xl transition mt-4"
              >
                Onboard Freelancer
              </button>
            </div>

          </div>

          {/* TWO COLUMN WORKSPACE DEMO TOOLS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6 border-t border-white/10">
            
            {/* COLUMN 1: INTERACTIVE MINI POS DEMO */}
            <div className="lg:col-span-7 bg-slate-950 border border-white/10 p-5 rounded-2xl space-y-4">
              <div className="space-y-1">
                <h4 className="text-xs font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1">
                  <Receipt className="w-4 h-4" />
                  <span>Workshop Point-Of-Sale (POS) Invoice Hub</span>
                </h4>
                <p className="text-[11px] text-slate-400">Simulate catalog management and print customer bills linked to Bakong KHQR scan targets.</p>
              </div>

              {/* Item inputs */}
              <div className="flex gap-2.5">
                <input 
                  type="text" 
                  placeholder="Part / service name (e.g., Oil filter)"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="bg-slate-900 border border-white/5 rounded-xl p-2.5 text-xs text-white grow"
                />
                <input 
                  type="number" 
                  placeholder="Price ($)"
                  value={newItemPrice}
                  onChange={(e) => setNewItemPrice(e.target.value)}
                  className="bg-slate-900 border border-white/5 rounded-xl p-2.5 text-xs text-white w-24"
                />
                <button 
                  onClick={addPosItem}
                  className="p-2.5 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Items list */}
              <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                {posCart.map(item => (
                  <div key={item.id} className="flex justify-between items-center bg-slate-900 p-2 rounded-xl border border-white/5">
                    <div className="text-xs text-slate-200">
                      <span className="font-bold text-white">{item.name}</span>
                      <span className="text-[10px] text-slate-400 block">${item.price.toFixed(2)} each</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-white/10 rounded-lg overflow-hidden bg-slate-950">
                        <button 
                          onClick={() => {
                            setPosCart(posCart.map(i => i.id === item.id ? { ...i, qty: Math.max(1, i.qty - 1) } : i));
                          }}
                          className="px-2 py-0.5 text-slate-400 hover:bg-white/5 text-[10px]"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-mono font-bold text-white">{item.qty}</span>
                        <button 
                          onClick={() => {
                            setPosCart(posCart.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i));
                          }}
                          className="px-2 py-0.5 text-slate-400 hover:bg-white/5 text-[10px]"
                        >
                          +
                        </button>
                      </div>
                      <button 
                        onClick={() => removePosItem(item.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center text-xs pt-2 border-t border-white/5">
                <span className="text-slate-400">Total Items: {posCart.reduce((acc, i) => acc + i.qty, 0)}</span>
                <span className="font-extrabold text-white">Subtotal: ${calculatePosTotal().toFixed(2)}</span>
              </div>

              <button 
                onClick={handleIssueReceipt}
                className="w-full py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow"
              >
                <Printer className="w-4 h-4" />
                <span>Compile POS Invoice & Generate KHQR Link</span>
              </button>

              {/* Render receipt */}
              {issuedReceipt && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white text-slate-900 p-4 rounded-xl space-y-3 font-mono text-[10px] border border-slate-300 shadow-xl"
                >
                  <div className="text-center border-b border-dashed border-slate-400 pb-2">
                    <h5 className="font-bold uppercase text-[11px]">{issuedReceipt.shopName}</h5>
                    <p className="text-[9px] text-slate-500">Official Registered License: {issuedReceipt.shopLicense}</p>
                    <p className="text-[9px] text-slate-500">{issuedReceipt.date}</p>
                    <p className="font-bold mt-1">INVOICE: {issuedReceipt.receiptNo}</p>
                  </div>
                  
                  <div className="space-y-1.5 border-b border-dashed border-slate-400 pb-2">
                    {issuedReceipt.items.map((i: any) => (
                      <div key={i.id} className="flex justify-between">
                        <span>{i.qty}x {i.name.substring(0, 24)}</span>
                        <span>${(i.price * i.qty).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-1 text-right">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>${issuedReceipt.total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>VAT (10%):</span>
                      <span>${issuedReceipt.vat.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-extrabold text-[11px]">
                      <span>GRAND TOTAL:</span>
                      <span>${issuedReceipt.grandTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-2 border-t border-dashed border-slate-400 pt-3">
                    <div className="w-24 h-24 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-300 relative overflow-hidden">
                      {/* KHQR Visual placeholder */}
                      <div className="absolute inset-0 bg-[radial-gradient(#005A9C_20%,transparent_20%)] bg-[size:6px_6px] opacity-30" />
                      <div className="bg-slate-900 text-white font-extrabold text-[7px] px-1.5 py-0.5 rounded shadow z-10">
                        BAKONG KHQR
                      </div>
                    </div>
                    <p className="text-[8px] text-slate-500 text-center uppercase tracking-wider">Scan with ABA Pay or Bakong App to pay invoice directly</p>
                  </div>
                </motion.div>
              )}
            </div>

            {/* COLUMN 2: WORKSHOP ASSISTANT REMINDERS & SCAN SERVICE */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Scan service log */}
              <div className="bg-slate-950 border border-white/10 p-5 rounded-2xl space-y-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1">
                    <QrCode className="w-4 h-4" />
                    <span>Instant QR Service Dispatcher</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">Simulate a customer vehicle arriving, scanning their windshield QR plate, and logging repairs instantly.</p>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Target Scanned Vehicle</label>
                    {vehicles.length === 0 ? (
                      <div className="text-[10px] text-amber-400 bg-white/5 p-2 rounded">No registered cars available.</div>
                    ) : (
                      <select 
                        value={scanVehicleId}
                        onChange={(e) => setScanVehicleId(e.target.value)}
                        className="w-full bg-slate-900 border border-white/5 rounded-xl p-2 text-xs text-white"
                      >
                        {vehicles.map(v => (
                          <option key={v.id} value={v.id}>{v.brand} {v.model} ({v.plateNumber || "No Plate"})</option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Service Procedure</label>
                    <input 
                      type="text" 
                      value={scanServiceType}
                      onChange={(e) => setScanServiceType(e.target.value)}
                      className="w-full bg-slate-900 border border-white/5 rounded-xl p-2 text-xs text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Technical Notes</label>
                    <textarea 
                      rows={2}
                      value={scanMechanicNotes}
                      onChange={(e) => setScanMechanicNotes(e.target.value)}
                      className="w-full bg-slate-900 border border-white/5 rounded-xl p-2 text-xs text-white resize-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Labor Cost (USD)</label>
                    <input 
                      type="number" 
                      value={scanCost}
                      onChange={(e) => setScanCost(e.target.value)}
                      className="w-full bg-slate-900 border border-white/5 rounded-xl p-2 text-xs text-white"
                    />
                  </div>

                  <button 
                    onClick={handleSimulateServiceRecordCreate}
                    className="w-full py-2 bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-bold text-xs rounded-xl transition"
                  >
                    Commit Scan-Driven Service Record
                  </button>
                </div>
              </div>

              {/* Scheduled reminders automation */}
              <div className="bg-slate-950 border border-white/10 p-5 rounded-2xl space-y-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1">
                    <Bell className="w-4 h-4" />
                    <span>Customer Reminder Dispatcher</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">Send an automated WhatsApp, Telegram, or SMS alert directly to car owners prior to service intervals.</p>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Owner Phone / Token</label>
                    <input 
                      type="text" 
                      value={reminderTargetPhone}
                      onChange={(e) => setReminderTargetPhone(e.target.value)}
                      className="w-full bg-slate-900 border border-white/5 rounded-xl p-2 text-xs text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Reminder Notification Body</label>
                    <textarea 
                      rows={3}
                      value={reminderTemplate}
                      onChange={(e) => setReminderTemplate(e.target.value)}
                      className="w-full bg-slate-900 border border-white/5 rounded-xl p-2 text-xs text-white resize-none"
                    />
                  </div>

                  <button 
                    onClick={handleSendReminderAlert}
                    className="w-full py-2 bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Dispatch Client Notification</span>
                  </button>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* TAB 3: MARKETPLACE ADS SHOP */}
      {activeSubTab === "marketplace" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main store selection */}
          <div className="lg:col-span-7 bg-slate-900/30 border border-white/5 p-6 rounded-2xl space-y-6">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                <Coins className="w-5 h-5 text-amber-400" />
                <span>Marketplace Advertising & Upgrades</span>
              </h3>
              <p className="text-xs text-slate-400">
                Purchase micro-transactions to boost listings, add extra classified slots, secure featured search positions, or buy Verified Vehicle History Reports.
              </p>
            </div>

            {/* Catalog list */}
            <div className="space-y-4">
              
              {/* Option 1: Extra listing */}
              <div className="bg-slate-950 p-4 rounded-xl border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-white">Extra Classified Listing Slot</h4>
                  <p className="text-[10px] text-slate-400">Exceed your subscription limits by adding 1 additional spare part or car listing permanently.</p>
                  <div className="text-xs text-amber-400 font-black mt-1">$1.00 USD / listing</div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center border border-white/10 rounded-lg overflow-hidden bg-slate-900">
                    <button onClick={() => setBuyPostQty(Math.max(1, buyPostQty - 1))} className="px-2 py-1 text-slate-400 hover:bg-white/5 text-xs">-</button>
                    <span className="px-3 text-xs font-mono font-bold text-white">{buyPostQty}</span>
                    <button onClick={() => setBuyPostQty(buyPostQty + 1)} className="px-2 py-1 text-slate-400 hover:bg-white/5 text-xs">+</button>
                  </div>
                  <button 
                    onClick={() => triggerPaymentFlow("addon", `${buyPostQty}x Extra Listing Slot`, buyPostQty * 1.0, { boostCredits: buyPostQty })}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition"
                  >
                    Buy ${buyPostQty * 1.0}
                  </button>
                </div>
              </div>

              {/* Option 2: Boost Pack */}
              <div className="bg-slate-950 p-4 rounded-xl border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-white">Ad Boost Credit Pack</h4>
                  <p className="text-[10px] text-slate-400">Rank your marketplace listing to the very top section for 3 days to capture high caller volumes.</p>
                  <div className="text-xs text-amber-400 font-black mt-1">$5.00 USD / 5 Credits</div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center border border-white/10 rounded-lg overflow-hidden bg-slate-900">
                    <button onClick={() => setBuyBoostQty(Math.max(1, buyBoostQty - 1))} className="px-2 py-1 text-slate-400 hover:bg-white/5 text-xs">-</button>
                    <span className="px-3 text-xs font-mono font-bold text-white">{buyBoostQty}</span>
                    <button onClick={() => setBuyBoostQty(buyBoostQty + 1)} className="px-2 py-1 text-slate-400 hover:bg-white/5 text-xs">+</button>
                  </div>
                  <button 
                    onClick={() => triggerPaymentFlow("addon", `${buyBoostQty * 5} Boost Credits Pack`, buyBoostQty * 5.0, { boostCredits: buyBoostQty * 5 })}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition"
                  >
                    Buy ${buyBoostQty * 5.0}
                  </button>
                </div>
              </div>

              {/* Option 3: Featured Placement */}
              <div className="bg-slate-950 p-4 rounded-xl border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-white">Homepage Featured Banner Spot (7 Days)</h4>
                  <p className="text-[10px] text-slate-400">Position your vehicle or garage at the homepage header carousel with responsive slideshow tags.</p>
                  <div className="text-xs text-amber-400 font-black mt-1">$10.00 USD / placement</div>
                </div>
                <button 
                  onClick={() => triggerPaymentFlow("addon", "Featured Homepage Banner Spot (7 Days)", 10.00, { boostCredits: 10 })}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition"
                >
                  Buy $10.00
                </button>
              </div>

              {/* Option 4: Featured Map Pin */}
              <div className="bg-slate-950 p-4 rounded-xl border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-white">Featured Map Location Pin (7 Days)</h4>
                  <p className="text-[10px] text-slate-400">Highlighted star visual icons showing your repair shop or item location directly on the maps portal.</p>
                  <div className="text-xs text-amber-400 font-black mt-1">$7.50 USD / location</div>
                </div>
                <button 
                  onClick={() => triggerPaymentFlow("addon", "Featured Map Pin (7 Days)", 7.50, { boostCredits: 7 })}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition"
                >
                  Buy $7.50
                </button>
              </div>

              {/* Option 5: Verified Vehicle History Report */}
              <div className="bg-slate-950 p-4 rounded-xl border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-white">Verified Vehicle History Report (Single Purchase)</h4>
                  <p className="text-[10px] text-slate-400">Generates a cryptographically secured history report validating past odometer logs, accidents, and services.</p>
                  <div className="text-xs text-amber-400 font-black mt-1">$2.99 USD / report</div>
                </div>
                <button 
                  onClick={() => triggerPaymentFlow("addon", "Verified Vehicle History Report", 2.99, { boostCredits: 3 })}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition"
                >
                  Buy $2.99
                </button>
              </div>

            </div>
          </div>

          {/* Cart Breakdown */}
          <div className="lg:col-span-5 bg-slate-950 border border-white/10 p-6 rounded-2xl h-fit space-y-5">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Classifieds Monetization Rules</h3>
            <div className="space-y-3.5 text-xs text-slate-300">
              <div className="flex gap-2.5 items-start">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>No Hidden Transaction Fees:</strong> Commission on private sales of vehicles is 0% to keep MyVehicle care affordable.</span>
              </div>
              <div className="flex gap-2.5 items-start">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Partnerships:</strong> Automotive garages and official distributors get special posting rates automatically through business subscriptions.</span>
              </div>
              <div className="flex gap-2.5 items-start">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Odometer Anti-Tampering:</strong> Service records compiled with certified workshop scan events lock history logs preventing false postings.</span>
              </div>
            </div>
            
            <div className="bg-white/5 p-4 rounded-xl text-[11px] text-slate-400 leading-relaxed border border-white/5">
              💡 <strong>Want to unlock free boosting credits?</strong> Pro and Enterprise packages receive 5 to 20 complimentary post boosts per billing cycle.
            </div>
          </div>

        </div>
      )}

      {/* TAB 4: AI PREMIUM REPORTS */}
      {activeSubTab === "ai_reports" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left panel: Customizer */}
          <div className="lg:col-span-6 bg-slate-900/30 border border-white/5 p-6 rounded-2xl space-y-6">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-5 h-5 text-pink-400" />
                <span>AI Advisory Reports customizer</span>
              </h3>
              <p className="text-xs text-slate-400">
                Unlock high-fidelity smart analytical reports using professional Gemini-powered estimators. Free limited assistant is available, paid advisory models require checkout.
              </p>
            </div>

            <div className="space-y-4">
              
              {/* Select Report type */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">1. Select AI Advisory Report Model</label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: "weakness", name: "AI Model Technical Weakness Report", price: 1.99, desc: "Analyzes typical recall thresholds, common failure points, and wear warnings for specific models." },
                    { id: "resale", name: "Resale Readiness & Liquidity Grade Report", price: 2.49, desc: "Predicts local market velocity index in Phnom Penh and recommends minor repairs yielding high ROI." },
                    { id: "dream", name: "AI Dream Car Financial & Road Suitability Match", price: 1.49, desc: "Matches your budget against flooded-season clearance requirements and parts availability." },
                    { id: "loan", name: "AI Car Loan Affordability & Budget Estimator", price: 1.99, desc: "Forecasts standard commercial bank financing, monthly payment limits and total ownership overhead." }
                  ].map((rep) => (
                    <div 
                      key={rep.id}
                      onClick={() => setAiReportType(rep.id as any)}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer flex justify-between items-center ${
                        aiReportType === rep.id ? "border-emerald-500 bg-emerald-950/10" : "border-white/5 bg-slate-950 hover:bg-white/5"
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-white">{rep.name}</div>
                        <div className="text-[10px] text-slate-400 leading-snug">{rep.desc}</div>
                      </div>
                      <span className="text-xs font-mono font-black text-emerald-400 shrink-0 ml-3">${rep.price}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Target vehicle */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">2. Select Target Vehicle Target Profile</label>
                {vehicles.length === 0 ? (
                  <div className="text-xs text-amber-400 bg-white/5 p-3 rounded">No registered vehicles available. Please register a car profile first.</div>
                ) : (
                  <select 
                    value={aiReportVehicleId}
                    onChange={(e) => setAiReportVehicleId(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-slate-200 outline-none focus:border-sky-500"
                  >
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>{v.brand} {v.model} ({v.year})</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Run/Buy Button */}
              {currentTier === "Pro" || currentTier === "Enterprise" ? (
                <button 
                  onClick={() => generateMockAIReport(aiReportType, aiReportVehicleId)}
                  disabled={aiLoading}
                  className="w-full py-3 bg-pink-500 hover:bg-pink-400 text-slate-950 font-black text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow"
                >
                  {aiLoading ? "Consulting AI..." : "Compile Premium AI Report (Included in Plan!)"}
                </button>
              ) : (
                <button 
                  onClick={() => {
                    const price = aiReportType === "weakness" ? 1.99 : aiReportType === "resale" ? 2.49 : aiReportType === "dream" ? 1.49 : 1.99;
                    triggerPaymentFlow("report", `AI ${aiReportType} Report`, price, { reportType: aiReportType, vehicleId: aiReportVehicleId });
                  }}
                  disabled={aiLoading}
                  className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-slate-950 font-black text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow"
                >
                  <span>Purchase AI Report Checkout</span>
                </button>
              )}

            </div>
          </div>

          {/* Right panel: Active Preview */}
          <div className="lg:col-span-6 bg-slate-950 border border-white/10 p-6 rounded-2xl space-y-6 h-fit min-h-[400px] flex flex-col justify-center">
            {aiLoading ? (
              <div className="text-center py-12 space-y-3">
                <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-400 font-mono">GEMINI MODEL SYNTHESIZING DENSE VEHICLE DATA REMOTELY...</p>
              </div>
            ) : generatedReport ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-5"
              >
                <div className="flex justify-between items-start border-b border-white/10 pb-3">
                  <div>
                    <span className="bg-pink-500/10 text-pink-400 text-[9px] px-1.5 py-0.5 rounded font-black tracking-widest uppercase">PREMIUM REPORT INSTANCE</span>
                    <h4 className="text-sm font-black text-white mt-1 leading-tight">{generatedReport.title}</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5 font-mono">Date Generated: {generatedReport.date}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs text-slate-400">Trust Factor</div>
                    <div className="text-lg font-black text-pink-400 font-mono">{generatedReport.score}%</div>
                  </div>
                </div>

                {/* Radar Chart analysis */}
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={generatedReport.radarData}>
                      <PolarGrid stroke="#334155" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#475569', fontSize: 8 }} />
                      <Radar name="Scoring" dataKey="A" stroke="#ec4899" fill="#ec4899" fillOpacity={0.3} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-2">
                  <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Synthesized Insights</h5>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {generatedReport.insights.map((ins: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-pink-400 mt-0.5 shrink-0" />
                        <span>{ins}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white/5 p-3.5 rounded-xl border border-pink-500/10 text-xs">
                  <span className="font-bold text-white block mb-0.5 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-pink-400" /> AI Recommendation Summary
                  </span>
                  <p className="text-slate-300 leading-relaxed">{generatedReport.recommendation}</p>
                </div>

                <div className="flex justify-end gap-2 text-[10px] font-mono text-slate-500 pt-2 border-t border-white/5">
                  <span>Engine: Gemini-2.5-Flash</span>
                  <span>|</span>
                  <span>Model ID: MHC-AI-993</span>
                </div>
              </motion.div>
            ) : (
              <div className="text-center py-12 text-slate-500">
                <Sparkles className="w-8 h-8 text-slate-700 mx-auto mb-2.5" />
                <p className="text-xs">No active report generated.</p>
                <p className="text-[10px] text-slate-500 max-w-xs mx-auto mt-1">Select a customized model on the left, check out to confirm payment, and review live insights dynamically generated on this dashboard panel.</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 5: SECURE QR PLATES */}
      {activeSubTab === "stickers" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Order Form */}
          <div className="lg:col-span-7 bg-slate-900/30 border border-white/5 p-6 rounded-2xl space-y-6">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-emerald-400" />
                <span>Physical QR Sticker Plate Customizer</span>
              </h3>
              <p className="text-xs text-slate-400">
                Generate high-quality physical products linked to your secure digital car profiles. Let service mechanics scan instantly without registration.
              </p>
            </div>

            <form onSubmit={handleOrderStickerSubmit} className="space-y-4">
              
              {/* Target vehicle selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">1. Select Target Vehicle Profile</label>
                {vehicles.length === 0 ? (
                  <div className="p-3 bg-white/5 border border-dashed border-white/10 rounded-xl text-xs text-amber-400">
                    You have no vehicles registered yet. Please register a vehicle profile first to customize physical stickers.
                  </div>
                ) : (
                  <select
                    value={selectedVehicleId}
                    onChange={(e) => setSelectedVehicleId(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-slate-200 outline-none focus:border-emerald-500"
                  >
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.brand} {v.model} ({v.plateNumber || "No Plate Number"})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Select sticker type */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">2. Select Physical Product Type</label>
                <div className="grid grid-cols-1 gap-2.5">
                  {stickerTypes.map((type) => (
                    <div
                      key={type.name}
                      onClick={() => setSelectedStickerType(type.name)}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer flex justify-between items-center ${
                        selectedStickerType === type.name 
                          ? "border-emerald-500 bg-emerald-950/20" 
                          : "border-white/5 bg-slate-950 hover:bg-white/5"
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold text-white">{type.name}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{type.description}</div>
                      </div>
                      <span className="text-sm font-extrabold text-emerald-400">${type.price}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">3. Quantity</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white font-bold text-xs cursor-pointer flex items-center justify-center border border-white/10"
                  >
                    -
                  </button>
                  <span className="text-sm font-extrabold text-white w-6 text-center">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white font-bold text-xs cursor-pointer flex items-center justify-center border border-white/10"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Contact phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">4. Contact Phone Number</label>
                <input
                  type="text"
                  placeholder="e.g. +855 12 345 678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-slate-200 outline-none focus:border-emerald-500"
                />
              </div>

              {/* Delivery address */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">5. Cambodia Delivery Address</label>
                <textarea
                  placeholder="Street No, House No, Sangkat, Khan, Province / Phnom Penh City"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-slate-200 outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading || vehicles.length === 0}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-lg cursor-pointer flex items-center justify-center gap-1.5 animate-pulse"
              >
                <span>Proceed to Bakong KHQR checkout</span>
              </button>
            </form>
          </div>

          {/* Pricing Summary */}
          <div className="lg:col-span-5 bg-slate-950 border border-white/10 p-6 rounded-2xl h-fit space-y-6">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Checkout Cart Breakdown</h3>

            <div className="space-y-3">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Product subtotal:</span>
                <span className="font-bold text-white">${currentStickerPrice * quantity}.00</span>
              </div>
              <div className="flex justify-between text-xs text-slate-300">
                <span>Flat Delivery Fee (Cambodia Dispatch):</span>
                <span className="font-bold text-white">${deliveryFee}.00</span>
              </div>
              <div className="flex justify-between text-xs text-slate-300">
                <span>Coordinator Fee:</span>
                <span className="font-bold text-emerald-400">FREE</span>
              </div>

              <div className="h-px bg-white/10 my-3" />

              <div className="flex justify-between items-baseline">
                <span className="text-sm font-bold text-white">Grand Total (USD):</span>
                <span className="text-xl font-black text-emerald-400">${totalCost.toFixed(2)}</span>
              </div>
            </div>

            <div className="bg-white/5 p-4 rounded-xl space-y-3 border border-white/5">
              <div className="flex gap-2 items-start text-[11px] text-slate-300">
                <Truck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">Fast Delivery Nationwide</span>
                  Expected dispatch within 2-3 business days across Phnom Penh city, Siem Reap, Battambang, and Sihanoukville.
                </div>
              </div>
              <div className="flex gap-2 items-start text-[11px] text-slate-300">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">Encrypted QR Link Secure Token</span>
                  Each physical plate contains an exclusive scan token generated to prevent spoofing and protect owner private data details.
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 6: DELIVERY TRACKER */}
      {activeSubTab === "orders" && (
        <div className="bg-slate-900/30 border border-white/5 p-6 rounded-2xl space-y-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Your Sticker Dispatch orders</h3>
            <p className="text-xs text-slate-400">
              Track active deliveries and coordinate physical plate installations with MyVehicle Care logistics.
            </p>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-10 text-slate-400 border border-dashed border-white/10 rounded-2xl">
              <ShoppingBag className="w-8 h-8 text-slate-600 mx-auto mb-2 animate-bounce" />
              <p className="text-xs">No active physical QR sticker orders found on your profile.</p>
              <button 
                onClick={() => setActiveSubTab("stickers")}
                className="mt-3 text-xs font-bold text-emerald-450 hover:underline cursor-pointer"
              >
                Order your first physical QR plate now
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400">
                    <th className="py-2.5 font-bold">Order ID</th>
                    <th className="py-2.5 font-bold">Product Model</th>
                    <th className="py-2.5 font-bold">Qty</th>
                    <th className="py-2.5 font-bold">Price Paid</th>
                    <th className="py-2.5 font-bold">Address</th>
                    <th className="py-2.5 font-bold">Status</th>
                    <th className="py-2.5 font-bold text-right">Order Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-white/5 transition">
                      <td className="py-3 font-mono text-slate-400">{ord.id}</td>
                      <td className="py-3 font-bold text-slate-200">{ord.stickerType}</td>
                      <td className="py-3">{ord.quantity}</td>
                      <td className="py-3 font-black text-emerald-400">${ord.totalCost.toFixed(2)}</td>
                      <td className="py-3 max-w-xs truncate" title={ord.deliveryAddress}>{ord.deliveryAddress}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded font-bold text-[9px] ${
                          ord.status === "Ordered" ? "bg-sky-500/10 text-sky-400 border border-sky-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        }`}>
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-3 text-right text-slate-500">
                        {new Date(ord.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* BAKONG KHQR PAYMENT POPUP PORTAL */}
      {showPaymentModal && paymentTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-white/10 rounded-3xl p-6 w-full max-w-md space-y-6 text-slate-100 shadow-2xl relative"
          >
            <button 
              onClick={() => { setShowPaymentModal(false); setPaymentTarget(null); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                Cambodia-First Payment Gateway
              </span>
              <h4 className="text-base font-extrabold text-white">MyVehicle Care Secure Checkout</h4>
              <p className="text-xs text-slate-400">Scan using Bakong or any local banking app to complete order</p>
            </div>

            <div className="bg-slate-950 border border-white/5 p-4 rounded-2xl space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Checkout Item:</span>
                <span className="font-bold text-white text-right">{paymentTarget.name}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">VAT (10% standard):</span>
                <span className="text-slate-400">INCLUDED</span>
              </div>
              <div className="h-px bg-white/5" />
              <div className="flex justify-between items-baseline">
                <span className="text-sm font-bold text-white">Amount due (USD):</span>
                <span className="text-xl font-black text-emerald-400">${paymentTarget.cost.toFixed(2)}</span>
              </div>
            </div>

            {/* Selector */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "bakong", label: "Bakong KHQR", desc: "Local Banks" },
                { id: "aba", label: "ABA Pay", desc: "Instant Push" },
                { id: "card", label: "Visa / Card", desc: "International" }
              ].map(method => (
                <button
                  key={method.id}
                  onClick={() => setSelectedPaymentMethod(method.id as any)}
                  className={`p-2.5 rounded-xl border text-center cursor-pointer transition ${
                    selectedPaymentMethod === method.id 
                      ? "border-emerald-500 bg-emerald-950/20 text-white" 
                      : "border-white/5 bg-slate-950 text-slate-400 hover:text-white"
                  }`}
                >
                  <div className="text-xs font-bold">{method.label}</div>
                  <div className="text-[8px] opacity-70 mt-0.5">{method.desc}</div>
                </button>
              ))}
            </div>

            {/* Simulation Canvas */}
            <div className="bg-slate-950 p-6 rounded-2xl flex flex-col items-center justify-center min-h-[160px] border border-white/5 relative overflow-hidden">
              {paymentSimulatedStatus === "scanning" ? (
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-emerald-400 font-mono">SIMULATING TRANSACTION CONFIRMATION AT BAKONG SWITCH...</p>
                </div>
              ) : paymentSimulatedStatus === "success" ? (
                <div className="text-center space-y-1 text-emerald-400">
                  <CheckCircle className="w-10 h-10 mx-auto animate-bounce text-emerald-400" />
                  <h5 className="font-extrabold text-sm">TRANSACTION SUCCESSFUL</h5>
                  <p className="text-[10px] text-slate-400">Account updated dynamically</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  {/* Mock QR generator */}
                  <div className="w-28 h-28 bg-white p-2 rounded-xl border border-slate-300 relative flex items-center justify-center">
                    <div className="absolute inset-0 bg-[radial-gradient(#005A9C_20%,transparent_20%)] bg-[size:6px_6px] opacity-40 m-2" />
                    <div className="absolute inset-1 border-2 border-emerald-500 rounded flex items-center justify-center pointer-events-none">
                      <div className="w-3 h-3 bg-red-600 rounded-sm" />
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 text-center leading-snug">
                    Scan this KHQR with your simulated phone app. Click below to mock successful payment execution.
                  </p>
                </div>
              )}
            </div>

            {paymentSimulatedStatus === "idle" && (
              <button 
                onClick={handleSimulatedPaymentComplete}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition"
              >
                Mock Scan & Pay successfully
              </button>
            )}
          </motion.div>
        </div>
      )}

    </div>
  );
}
