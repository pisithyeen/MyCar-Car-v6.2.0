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
  UserPlus, 
  ChevronRight, 
  CheckCircle, 
  AlertCircle, 
  Coins, 
  FileText,
  BadgeAlert,
  Sliders,
  Bell,
  Layers,
  Star
} from "lucide-react";
import { UserProfile, VehicleProfile } from "../types";

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
  const [activeSubTab, setActiveSubTab] = useState<"plans" | "stickers" | "orders">("plans");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sticker Order state
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [selectedStickerType, setSelectedStickerType] = useState("Reflective Vinyl QR (Front + Rear Sticker Pack)");
  const [quantity, setQuantity] = useState(1);
  const [phone, setPhone] = useState(userProfile.phone || "");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [orders, setOrders] = useState<QrStickerOrder[]>([]);

  // Calculate sticker prices (USD or simulated care coins)
  const stickerTypes = [
    { name: "Reflective Vinyl QR (Front + Rear Sticker Pack)", price: 8, description: "Highly durable, rain-proof, and reflective for night scanning" },
    { name: "Metal License Plate QR (Standard Aluminum Backing)", price: 18, description: "Ultra-premium rust-proof metal frame with embossed secure QR code" },
    { name: "Premium Acrylic QR Key Tag (Pack of 2)", price: 6, description: "Secure scratch-resistant acrylic tags to attach to car keys" }
  ];

  const currentStickerPrice = stickerTypes.find(s => s.name === selectedStickerType)?.price || 8;
  const deliveryFee = 2.5; // Flat rate for all Cambodia delivery branches (Phnom Penh, Siem Reap, etc.)
  const totalCost = (currentStickerPrice * quantity) + deliveryFee;

  useEffect(() => {
    fetchOrders();
    if (vehicles.length > 0 && !selectedVehicleId) {
      setSelectedVehicleId(vehicles[0].id);
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

  const handleUpgradePlan = async (tier: 'Free' | 'Home' | 'Pro' | 'Enterprise') => {
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/subscription/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          tier,
          resetUsage: true, // Reset AI counter on upgrade/downgrade for clean sandbox testing
          verifiedBadge: tier === "Pro" || tier === "Enterprise"
        })
      });
      if (res.ok) {
        const data = await res.json();
        setSuccessMsg(`Congratulations! Your account was upgraded to the ${tier} Plan successfully.`);
        onRefreshData();
      } else {
        const errData = await res.json();
        setErrorMsg(errData.error || "Failed to upgrade your subscription plan.");
      }
    } catch (err) {
      setErrorMsg("Network error. Failed to execute subscription upgrade.");
    } finally {
      setLoading(false);
    }
  };

  const handleOrderSticker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicleId) {
      setErrorMsg("Please select a vehicle profile first.");
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

    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/qr-stickers/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId: selectedVehicleId,
          stickerType: selectedStickerType,
          quantity,
          phone,
          deliveryAddress,
          deliveryFee,
          totalCost
        })
      });

      if (res.ok) {
        setSuccessMsg(`Your order for ${quantity}x ${selectedStickerType} has been placed successfully! Standard delivery dispatched.`);
        setDeliveryAddress("");
        fetchOrders();
        onRefreshData();
        setActiveSubTab("orders");
      } else {
        const errData = await res.json();
        setErrorMsg(errData.error || "Failed to submit sticker order.");
      }
    } catch (err) {
      setErrorMsg("Network error occurred during checkout processing.");
    } finally {
      setLoading(false);
    }
  };

  const currentTier = userProfile.subscriptionTier || "Free";

  // Compute actual limits & usage
  const maxVehicles = currentTier === "Free" ? 2 : currentTier === "Home" ? 5 : currentTier === "Pro" ? 30 : 99999;
  const currentVehiclesCount = vehicles.length;
  
  const aiLimit = userProfile.aiUsageLimit || (currentTier === 'Free' ? 3 : currentTier === 'Home' ? 15 : currentTier === 'Pro' ? 50 : 99999);
  const aiCount = userProfile.aiUsageCount || 0;

  const pricingTiers = [
    {
      id: "Free" as const,
      name: "Free Package",
      price: "$0",
      period: "forever",
      description: "Ideal for basic diagnostic lookups and single car owners",
      features: [
        "Up to 2 active vehicles registered",
        "Secure Digital QR code lookup",
        "Basic maintenance logs",
        "Limited AI diagnostics (3 queries limit)",
        "1 active vehicle selling post",
        "1 active spare part classified post"
      ],
      color: "border-slate-800 bg-slate-900/40 text-slate-300",
      badge: "Basic Profile"
    },
    {
      id: "Home" as const,
      name: "Home Care Plan",
      price: "$2.99",
      period: "per month",
      description: "Best for households, multi-vehicle owners, and family driver sharing",
      features: [
        "Up to 5 active vehicles registered",
        "Interactive digital dashboard",
        "Family & driver instant sharing options",
        "Custom maintenance reminder notifications",
        "Telegram reminder bot dispatch prepared",
        "Extended AI diagnostics (15 queries limit)",
        "Up to 5 active marketplace listings"
      ],
      color: "border-sky-500 bg-sky-950/20 text-slate-100",
      badge: "Popular Selection",
      highlight: true
    },
    {
      id: "Pro" as const,
      name: "Pro Fleet Plan",
      price: "$9.99",
      period: "per month",
      description: "Complete workstation for professional vehicle fleets & managers",
      features: [
        "Up to 30 active vehicles registered",
        "Fleet & staff driver assignments",
        "Real-time authorization ticketing hub",
        "Detailed fuel & service expense analysis",
        "Verified seller marketplace badge",
        "Premium AI diagnosis advisor (50 queries)",
        "5 free listing boost credits monthly"
      ],
      color: "border-indigo-500 bg-indigo-950/20 text-slate-100",
      badge: "Fleet Elite"
    },
    {
      id: "Enterprise" as const,
      name: "Enterprise Custom",
      price: "$29.99",
      period: "per month",
      description: "Robust analytics console for high-scale enterprise fleets",
      features: [
        "Unlimited vehicle registrations",
        "Multi-branch & company operations dashboard",
        "Bulk physical secure QR sticker generation",
        "Granular team permission levels & staff roles",
        "Dedicated VIP customer success manager",
        "Unlimited AI diagnostics lookup logs",
        "Custom analytical reports export tool"
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
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Billing & Subscriptions</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            Monitor plan limitations, physical QR sticker orders, and unlock professional multi-vehicle tools seamlessly.
          </p>
        </div>

        {/* Current Status pill */}
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl self-start sm:self-center">
          <div className="space-y-0.5">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Plan Tier</div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black text-white">{currentTier} Plan</span>
              {userProfile.verifiedBadge && (
                <span className="bg-sky-500/10 text-sky-400 text-[9px] px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5 border border-sky-500/25">
                  <ShieldCheck className="w-2.5 h-2.5" /> Verified
                </span>
              )}
            </div>
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
          <div>
            <h4 className="text-sm font-bold text-emerald-300">Success!</h4>
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
          <div>
            <h4 className="text-sm font-bold text-rose-300">Error</h4>
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
              <div className="text-xs font-bold text-slate-400">Vehicles Limit</div>
              <div className="text-lg font-black text-white">{currentVehiclesCount} <span className="text-xs font-medium text-slate-500">/ {maxVehicles === 99999 ? "Unlimited" : `${maxVehicles} Vehicles`}</span></div>
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
              <div className="text-lg font-black text-white">{aiCount} <span className="text-xs font-medium text-slate-500">/ {aiLimit === 999999 ? "Unlimited" : `${aiLimit} lookups`}</span></div>
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
            {currentTier === "Free" ? "Upgrade plan to receive free monthly listing boosts." : "Apply credits directly to classified post details to unlock front-page ranking."}
          </div>
          <div className="text-[10px] text-slate-400">
            Seller Badge: {userProfile.verifiedBadge ? "★ Verified Partner" : "Standard Owner"}
          </div>
        </div>
      </div>

      {/* MODULE TAB CHANGER */}
      <div className="flex border-b border-white/10 gap-2">
        <button
          onClick={() => setActiveSubTab("plans")}
          className={`px-4 py-2 font-bold text-xs transition border-b-2 cursor-pointer ${
            activeSubTab === "plans" ? "border-sky-500 text-sky-400" : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          Subscription Packages
        </button>
        <button
          onClick={() => setActiveSubTab("stickers")}
          className={`px-4 py-2 font-bold text-xs transition border-b-2 cursor-pointer ${
            activeSubTab === "stickers" ? "border-sky-500 text-sky-400" : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          Order Secure QR Plates (Physical)
        </button>
        <button
          onClick={() => { setActiveSubTab("orders"); fetchOrders(); }}
          className={`px-4 py-2 font-bold text-xs transition border-b-2 cursor-pointer relative ${
            activeSubTab === "orders" ? "border-sky-500 text-sky-400" : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          Delivery Tracker
          {orders.length > 0 && (
            <span className="ml-1 bg-sky-500 text-slate-950 font-extrabold text-[9px] px-1 rounded-full">
              {orders.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB CONTENTS */}
      {activeSubTab === "plans" && (
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h3 className="text-lg font-bold text-white">Compare Our Normal Packages</h3>
            <p className="text-xs text-slate-400">
              Upgrade your personal subscription seamlessly with a single click. Basic vehicle history viewing and logs remain always free and unblocked!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricingTiers.map((plan) => {
              const isCurrent = currentTier === plan.id;
              return (
                <div 
                  key={plan.id}
                  className={`border rounded-2xl p-5 flex flex-col justify-between transition relative ${plan.color} ${
                    plan.highlight ? "ring-2 ring-sky-500/50 shadow-sky-500/5" : "shadow-sm hover:border-slate-700"
                  }`}
                >
                  {plan.highlight && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-sky-500 text-slate-950 font-black text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
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
                      <span className="text-3xl font-extrabold text-white">{plan.price}</span>
                      <span className="text-xs text-slate-400">/ {plan.period}</span>
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
                            ? "bg-sky-500 hover:bg-sky-400 text-slate-950" 
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

          {/* Business Subscription Note */}
          <div className="bg-slate-950/60 border border-slate-800/80 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mt-6">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold text-sm">
                <Star className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>Professional Business Subscription Packages (Prepared for Garages & Parts Shops)</span>
              </div>
              <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                Run an auto repair garage or spare part warehouse in Cambodia? Register with license numbers to unlock:
                staff role permissions, unlimited real-time digital authorization ticket links, advanced analytical business dashboards, and custom QR bulk dispatch.
              </p>
            </div>
            
            <div className="flex flex-col gap-2 shrink-0">
              <button 
                onClick={() => handleUpgradePlan("Pro")}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition cursor-pointer"
              >
                Onboard Garage Pro Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === "stickers" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Order form */}
          <div className="lg:col-span-7 bg-slate-900/30 border border-white/5 p-6 rounded-2xl space-y-6">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-sky-400" />
                <span>Physical QR Sticker Plate Customizer</span>
              </h3>
              <p className="text-xs text-slate-400">
                Generate high-quality physical products linked to your secure digital car profiles. Let service mechanics scan instantly without registration.
              </p>
            </div>

            <form onSubmit={handleOrderSticker} className="space-y-4">
              {/* Select vehicle */}
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
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-slate-200 outline-none focus:border-sky-500"
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
                          ? "border-sky-500 bg-sky-950/20" 
                          : "border-white/5 bg-slate-950 hover:bg-white/5"
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold text-white">{type.name}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{type.description}</div>
                      </div>
                      <span className="text-sm font-extrabold text-sky-400">${type.price}</span>
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
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-slate-200 outline-none focus:border-sky-500"
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
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-slate-200 outline-none focus:border-sky-500 resize-none"
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading || vehicles.length === 0}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/10 cursor-pointer flex items-center justify-center gap-1.5"
              >
                {loading ? "Ordering..." : "Complete Secure Order (Simulated Cash/Card Payment)"}
              </button>
            </form>
          </div>

          {/* Pricing summary widget */}
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
                className="mt-3 text-xs font-bold text-sky-400 hover:underline cursor-pointer"
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
    </div>
  );
}
