/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Car, 
  Wrench, 
  User, 
  Tag, 
  Terminal, 
  ShieldAlert, 
  MapPin, 
  Phone, 
  Mail, 
  Check, 
  Fuel, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Lock
} from "lucide-react";
import { UserProfile } from "../types";

interface LoginScreenProps {
  onLoginSuccess: (profile: UserProfile) => void;
  guestProfile?: UserProfile | null;
}

export default function LoginScreen({ onLoginSuccess, guestProfile }: LoginScreenProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form fields
  const [name, setName] = useState(guestProfile?.name || "Yeon Pisith");
  const [email, setEmail] = useState(guestProfile?.email || "pisith.yeen@gmail.com");
  const [phone, setPhone] = useState(guestProfile?.phone || "+855 12 345 678");
  const [role, setRole] = useState<UserProfile['role']>("Vehicle Owner");
  const [location, setLocation] = useState(guestProfile?.location || "Phnom Penh");
  const [businessName, setBusinessName] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [licenseNumber, setLicenseNumber] = useState("");
  const [isMultiService, setIsMultiService] = useState(true);
  const [activatedModules, setActivatedModules] = useState<string[]>([
    "Spare Parts Shop Module",
    "Garage / Repair Shop Module",
    "Mini POS Module",
    "Inventory / Stock Control Module",
    "Service Ticket Module",
    "Vehicle Maintenance Log Module",
    "Marketplace Seller Module",
    "Supplier / Purchase Order Module",
    "Warranty Module",
    "Reports Module"
  ]);

  const allAvailableModules = [
    "Spare Parts Shop Module",
    "Garage / Repair Shop Module",
    "Mini POS Module",
    "Inventory / Stock Control Module",
    "Service Ticket Module",
    "Vehicle Maintenance Log Module",
    "Marketplace Seller Module",
    "Supplier / Purchase Order Module",
    "Warranty Module",
    "Reports Module"
  ];

  const rolesList: {
    role: UserProfile['role'];
    title: string;
    description: string;
    icon: React.ComponentType<any>;
    color: string;
    borderColor: string;
    features: string[];
    badge?: string;
  }[] = [
    {
      role: "Vehicle Owner",
      title: "Car / Vehicle Owner",
      description: "Manage personal vehicles, track odometer triggers, view AI weakness audits, find local certified garages.",
      icon: Car,
      color: "from-sky-500/20 to-sky-600/5 text-sky-400",
      borderColor: "border-sky-500/20 hover:border-sky-500/40",
      features: ["12-point alarm logs", "AI Symptom Diagnostic Checker", "Phnom Penh Map Locator", "Buy and trade spare parts"],
    },
    {
      role: "Garage Owner",
      title: "Garage & Repair Shop",
      description: "Scan customer vehicle QR codes, analyze specific model alerts, create and upload verified digital logs.",
      icon: Wrench,
      color: "from-emerald-500/20 to-emerald-600/5 text-emerald-400",
      borderColor: "border-emerald-500/20 hover:border-emerald-500/40",
      features: ["QR scanner for client cars", "AI-vetted repair notes", "Active booking queue tracker", "Phnom Penh business profile page"],
      badge: "Partner"
    },
    {
      role: "Petrol Station Partner",
      title: "Petrol & EV Station",
      description: "Administer fast charging stations, log quick oil checks, track CCS2 energy usage, distribute reward coupons.",
      icon: Fuel,
      color: "from-amber-500/20 to-amber-600/5 text-amber-400",
      borderColor: "border-amber-500/20 hover:border-amber-500/40",
      features: ["Fast charging KWh tracking", "High-voltage charger monitoring", "Rewards QR coupon scanner", "Fuel dispenser level checks"],
      badge: "Partner"
    },
    {
      role: "Spare Part Shop",
      title: "Parts Dealer & Shop",
      description: "Publish auto spares directory, verify part fitness for specific model years, accept local direct purchase offers.",
      icon: Tag,
      color: "from-indigo-500/20 to-indigo-600/5 text-indigo-400",
      borderColor: "border-indigo-500/20 hover:border-indigo-500/40",
      features: ["Add parts listings with photos", "AI model-compatibility solver", "Customer bid list management", "Authorized Importer Status"],
      badge: "Merchant"
    },
    {
      role: "Admin",
      title: "Operations Admin",
      description: "System control panel with global metrics, fraud logs, model warning rules config, partner account approvals.",
      icon: Terminal,
      color: "from-purple-500/20 to-purple-600/5 text-purple-400",
      borderColor: "border-purple-500/20 hover:border-purple-500/40",
      features: ["Analytical signals monitor", "Monsoon alert broadcasting", "Business credentials approvals", "Global fraud log system"],
      badge: "Staff"
    },
    {
      role: "Freelance Mechanic",
      title: "Roadside Freelancer",
      description: "Receive real-time roadside assistance pager requests. Provide jumpstarts, tire assistance, emergency tuning.",
      icon: Zap,
      color: "from-rose-500/20 to-rose-600/5 text-rose-400",
      borderColor: "border-rose-500/20 hover:border-rose-500/40",
      features: ["On-call GPS dispatch pager", "Flat tire & hybrid overheating fixes", "Direct roadside dispatch ledger", "Verified local certification badge"],
      badge: "Future App"
    },
  ];

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Determine business context
      const isBusiness = role !== "Vehicle Owner" && role !== "Admin";
      
      // Execute standard real API call to update server profile
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: name,
          email: email,
          phone: phone,
          role: role,
          location: location,
          businessName: isBusiness ? (businessName || "Angkor Spares Co") : undefined,
          licenseNumber: isBusiness ? (licenseNumber || "Co-7483/2026-KH") : undefined,
          isMultiService: isBusiness ? isMultiService : undefined,
          activatedModules: isBusiness ? activatedModules : undefined
        })
      });

      if (response.ok) {
        const updatedProfile: UserProfile = await response.json();
        onLoginSuccess(updatedProfile);
      } else {
        const errData = await response.json();
        alert(errData.error || "Failed to update profile session");
      }
    } catch (err) {
      console.error("Authentication session error:", err);
      // Fallback
      const isBusiness = role !== "Vehicle Owner" && role !== "Admin";
      onLoginSuccess({
        id: Date.now(),
        name,
        email,
        phone,
        role,
        location,
        status: (role === "Vehicle Owner" || role === "Admin") ? "Approved" : "Pending",
        businessName: isBusiness ? (businessName || "Angkor Spares Co") : undefined,
        licenseNumber: isBusiness ? (licenseNumber || "Co-7483/2026-KH") : undefined,
        isMultiService: isBusiness ? isMultiService : undefined,
        activatedModules: isBusiness ? activatedModules : undefined
      });
    } finally {
      setLoading(false);
    }
  };

  const demoPersonas = [
    { name: "Yeon Pisith", email: "pisith.yeen@gmail.com", role: "Vehicle Owner" as const, badge: "Live Car Owner", status: "Approved" as const, icon: "🚗" },
    { name: "Chan Kiri", email: "kiri@angkor-repair.kh", role: "Garage Owner" as const, badge: "Angkor Workshop", status: "Pending" as const, icon: "🔧" },
    { name: "Sothy Leakhena", email: "leakhena@total-sothearos.kh", role: "Petrol Partner" as const, badge: "Petrol Station", status: "Pending" as const, icon: "⛽" },
    { name: "Preap Norith", email: "norith@toyota-parts.kh", role: "Spare Part Shop" as const, badge: "Spares Dealer", status: "Approved" as const, icon: "🏷️" },
    { name: "Sokna Helper", email: "highway@roadside.kh", role: "Freelance Mechanic" as const, badge: "Roadside Helper", status: "Pending" as const, icon: "⚡" },
    { name: "Fraudulent Mech", email: "cheater@scam-repair.kh", role: "Freelance Mechanic" as const, badge: "Scammer Shop", status: "Suspended" as const, icon: "🚨" },
    { name: "System Admin", email: "admin@mycar.com.kh", role: "Admin" as const, badge: "Platform Admin", status: "Approved" as const, icon: "⚙️" }
  ];

  const handleQuickLogin = async (p: typeof demoPersonas[0]) => {
    setLoading(true);
    try {
      const isBusiness = p.role !== "Vehicle Owner" && p.role !== "Admin";
      let busName = undefined;
      let licNum = undefined;
      
      const roleMapped = p.role === "Petrol Partner" ? "Petrol Station Partner" as const : p.role;

      if (p.role === "Garage Owner") { busName = "Angkor Speed Auto Repair"; licNum = "Co-8271/2026-KH"; }
      else if (p.role === "Petrol Partner") { busName = "TotalEnergies Sothearos Blvd"; licNum = "Co-6211/2026-KH"; }
      else if (p.role === "Spare Part Shop") { busName = "Sihanoukville Toyota Parts"; licNum = "Co-1934/2026-KH"; }
      else if (p.role === "Freelance Mechanic") { busName = "Phnom Penh Mobile Repair"; licNum = "Co-4819/2026-KH"; }

      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: p.name,
          email: p.email,
          phone: p.email === "pisith.yeen@gmail.com" ? "+855 12 345 678" : "+855 12 999 888",
          role: roleMapped,
          location: "Phnom Penh",
          businessName: busName,
          licenseNumber: licNum,
          status: p.status,
          isMultiService: isBusiness ? true : undefined,
          activatedModules: isBusiness ? [
            "Spare Parts Shop Module",
            "Garage / Repair Shop Module",
            "Mini POS Module",
            "Inventory / Stock Control Module",
            "Service Ticket Module",
            "Vehicle Maintenance Log Module",
            "Marketplace Seller Module",
            "Supplier / Purchase Order Module",
            "Warranty Module",
            "Reports Module"
          ] : undefined
        })
      });

      if (response.ok) {
        const profile = await response.json();
        onLoginSuccess(profile);
      } else {
        // Fallback
        onLoginSuccess({
          id: Date.now(),
          name: p.name,
          email: p.email,
          phone: p.email === "pisith.yeen@gmail.com" ? "+855 12 345 678" : "+855 12 999 888",
          role: roleMapped,
          location: "Phnom Penh",
          status: p.status,
          businessName: busName,
          licenseNumber: licNum,
          isMultiService: isBusiness ? true : undefined,
          activatedModules: isBusiness ? [
            "Spare Parts Shop Module",
            "Garage / Repair Shop Module",
            "Mini POS Module",
            "Inventory / Stock Control Module",
            "Service Ticket Module",
            "Vehicle Maintenance Log Module",
            "Marketplace Seller Module",
            "Supplier / Purchase Order Module",
            "Warranty Module",
            "Reports Module"
          ] : undefined
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const currentRoleDetails = rolesList.find(r => r.role === role);

  return (
    <div className="min-h-screen flex flex-col justify-center bg-[#090d16] p-6 text-slate-100 relative overflow-hidden">
      {/* Decorative localized grid backgrounds under constraints */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.1),transparent_45%)]" />
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />

      <div className="max-w-5xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10 py-12">
        
        {/* Left Side: Brand presentation and Role overview */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center text-slate-950 font-bold shadow-xl shadow-sky-500/10">
              <Car className="w-6.5 h-6.5 text-slate-900" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-100 tracking-tight">MyCar Care KH</h1>
                <span className="text-[9px] bg-sky-400/10 text-sky-300 font-extrabold px-2 py-0.5 rounded-full border border-sky-400/20 uppercase">
                  v2.0 Active
                </span>
              </div>
              <p className="text-xs text-sky-400/80 uppercase tracking-widest font-bold">Cambodian Vehicle Supervisor</p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-white leading-tight">
              One Unified Core. <br />
              <span className="bg-gradient-to-r from-sky-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
                6 Unique Experience Roles.
              </span>
            </h2>
            <p className="text-sm text-slate-450 text-slate-450 leading-relaxed text-slate-450">
              Select or switch roles to experience specialized dashboards, custom action flows, and strict permission models tailored for Cambodian motorists, repair workshops, and service partners.
            </p>
          </div>

          {/* Active specifications card representation under constraints */}
          <div className="glass rounded-2xl p-4.5 border border-white/5 space-y-3 bg-white/3">
            <h3 className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Dynamic Onboarding Checkpoints</span>
            </h3>
            <ul className="space-y-2 text-xs text-slate-440 text-slate-400">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span><strong>Car Owners</strong>: Log 12 maintenance points & check local monsoon alerts.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Garages</strong>: Scan QR codes, load specifications, write AI logs.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span><strong>Petrol/EV Stations</strong>: Manage CCS2 120kW chargers & oil promotions.</span>
              </li>
            </ul>
          </div>

          <div className="text-[11px] text-slate-500 leading-relaxed flex items-center gap-1.5 pt-2">
            <Lock className="w-3.5 h-3.5" />
            <span>Encrypted local session profiles matched with Phnom Penh municipal transit protocols.</span>
          </div>
        </div>

        {/* Right Side: Bento grid of role selection & session configuration */}
        <div className="lg:col-span-7 bg-white/3 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 lg:p-8 space-y-6 shadow-2xl shadow-black/40">
          
          <div className="space-y-1 border-b border-white/10 pb-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-100">
                {isRegistering ? "Create Official Account" : "Platform Entrance Portal"}
              </h2>
              <button 
                type="button" 
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-xs text-sky-400 hover:text-sky-300 font-semibold underline cursor-pointer"
              >
                {isRegistering ? "Sign in as default owner" : "Register new business role"}
              </button>
            </div>
            <p className="text-xs text-slate-400">
              {isRegistering 
                ? "Configure custom credentials to register with Cambodian regulatory networks" 
                : "Select your active persona below. You can swap roles instantly from the top header anytime."
              }
            </p>
          </div>

          {/* Quick Demo Persona Switcher */}
          <div className="space-y-2 bg-[#0d1527]/90 p-4 rounded-2xl border border-white/5">
            <span className="text-[10px] font-extrabold text-sky-400 uppercase tracking-widest block mb-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>⚡ Sandbox Mode: Quick-Switch Personas (All Roles & States)</span>
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-2">
              {demoPersonas.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuickLogin(p)}
                  className="p-2 border border-slate-700/50 hover:border-sky-500/40 rounded-xl hover:bg-white/5 active:scale-95 text-left transition flex flex-col justify-between h-[82px] cursor-pointer"
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="text-xs">{p.icon}</span>
                    <span className={`text-[8px] font-mono uppercase font-extrabold px-1 py-0.2 rounded shrink-0 ${
                      p.status === "Approved" ? "bg-emerald-500/10 text-emerald-400" :
                      p.status === "Pending" ? "bg-amber-500/15 text-amber-400 text-[8.5px]" : "bg-red-500/15 text-red-400"
                    }`}>
                      {p.status}
                    </span>
                  </div>
                  <div className="mt-1">
                    <p className="text-[11.5px] font-bold text-slate-100 line-clamp-1 leading-tight">{p.name}</p>
                    <p className="text-[9.5px] text-slate-400 font-medium leading-none mt-0.5 line-clamp-1">{p.badge}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-6">
            
            {/* 1. ROLE BENTO SELECTION GRID */}
            <div className="space-y-2">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
                Choose Access Authority
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1 dark-scrollbar">
                {rolesList.map((r) => {
                  const Icon = r.icon;
                  const isSelected = role === r.role;
                  return (
                    <div
                      key={r.role}
                      onClick={() => {
                        setRole(r.role);
                        // default values if switching on the fly
                        if (r.role === "Garage Owner" && !businessName) {
                          setBusinessName("Angkor Speed Auto Repair");
                        } else if (r.role === "Petrol Station Partner" && !businessName) {
                          setBusinessName("TotalEnergies Sothearos Blvd");
                        } else if (r.role === "Spare Part Shop" && !businessName) {
                          setBusinessName("Phnom Penh Toyota Spares Depot");
                        }
                      }}
                      className={`glass p-3 rounded-xl border text-left cursor-pointer transition relative overflow-hidden group select-none ${r.borderColor} ${
                        isSelected 
                          ? "bg-white/10 border-sky-500/60 shadow-lg shadow-sky-500/5 ring-1 ring-sky-500/30" 
                          : "bg-white/1 hover:bg-white/4 border-white/5"
                      }`}
                    >
                      {/* Gradient Accent */}
                      {isSelected && (
                        <div className="absolute top-0 right-0 w-8 h-8 bg-sky-500/20 rounded-bl-full flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 text-sky-400" />
                        </div>
                      )}

                      <div className="flex gap-2.5 items-start">
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${r.color} shrink-0`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-slate-100 group-hover:text-white leading-tight">
                              {r.title}
                            </span>
                            {r.badge && (
                              <span className="text-[8px] bg-white/10 text-slate-300 px-1 py-0.2 rounded font-bold uppercase tracking-wide">
                                {r.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 line-clamp-2 leading-tight">
                            {r.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. PROFILE CONFIG DETAILS */}
            <div className="space-y-4 pt-2 border-t border-white/10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Your Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Yeon Pisith"
                      className="w-full bg-slate-950/60 border border-white/10 pl-9 pr-4 py-2.5 text-xs rounded-xl focus:outline-none focus:border-white/20 text-slate-100"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Contact Link / Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. pisith.yeen@gmail.com"
                      className="w-full bg-slate-950/60 border border-white/10 pl-9 pr-4 py-2.5 text-xs rounded-xl focus:outline-none focus:border-white/20 text-slate-100"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Phone contact (+855)</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +855 12 345 678"
                      className="w-full bg-slate-950/60 border border-white/10 pl-9 pr-4 py-2.5 text-xs rounded-xl focus:outline-none focus:border-white/20 text-slate-100 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Administrative Province</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                    <select
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full bg-slate-950/60 border border-white/10 pl-9 pr-4 py-2.5 text-xs rounded-xl focus:outline-none text-slate-100"
                    >
                      <option value="Phnom Penh" className="bg-slate-900 text-slate-100">Phnom Penh</option>
                      <option value="Siem Reap" className="bg-slate-900 text-slate-100">Siem Reap</option>
                      <option value="Battambang" className="bg-slate-900 text-slate-100">Battambang</option>
                      <option value="Sihanoukville" className="bg-slate-900 text-slate-100">Sihanoukville</option>
                      <option value="Kampot" className="bg-slate-900 text-slate-100">Kampot</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Conditional business verification for Partner/Merchant accounts */}
              {role !== "Vehicle Owner" && role !== "Admin" && (
                <div className="bg-sky-500/10 border border-sky-450/20 p-4 rounded-xl space-y-4">
                  <div className="flex gap-2 text-xs">
                    <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-200 block">Cambodian Regulatory Onboarding Check</span>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        As a professional business partner role, you must specify your municipal license registration code and establish high-voltage or fluid credentials.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Commercial Entity Name</label>
                      <input
                        type="text"
                        required
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="e.g. Angkor Auto Spares KH"
                        className="w-full bg-slate-950 border border-sky-500/10 p-2 text-xs rounded-lg text-slate-100 focus:outline-none focus:border-sky-500/25"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Business License NO. (MPT)</label>
                      <input
                        type="text"
                        required
                        value={licenseNumber || "Co-7483/2026-KH"}
                        onChange={(e) => setLicenseNumber(e.target.value)}
                        placeholder="e.g. Co-7483/2026-KH"
                        className="w-full bg-slate-950 border border-sky-500/10 p-2 text-xs rounded-lg text-slate-100 focus:outline-none focus:border-sky-500/25 font-mono"
                      />
                    </div>
                  </div>

                  {/*  Cambodian Multi-Service Configuration Option */}
                  <div className="border-t border-white/10 pt-3 mt-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-sky-400">Multi-Service Business Mode</span>
                        <span className="text-[9px] text-slate-400">Enable combined Spare Parts Shop + Garage Repair activities</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={isMultiService}
                        onChange={(e) => setIsMultiService(e.target.checked)}
                        className="rounded border-white/10 text-sky-500 bg-slate-950 h-4 w-4 cursor-pointer"
                      />
                    </div>

                    {isMultiService && (
                      <div className="space-y-2 bg-slate-950/40 p-2.5 rounded-lg border border-white/5">
                        <span className="text-[9px] font-bold text-slate-450 uppercase tracking-wider block mb-1">Select Active Service Modules:</span>
                        <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[10px]">
                          {allAvailableModules.map((m) => {
                            const isChecked = activatedModules.includes(m);
                            return (
                              <label key={m} className="flex items-center gap-1.5 select-none cursor-pointer hover:text-slate-200">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {
                                    if (isChecked) {
                                      setActivatedModules(activatedModules.filter(x => x !== m));
                                    } else {
                                      setActivatedModules([...activatedModules, m]);
                                    }
                                  }}
                                  className="rounded border-white/10 text-sky-500 bg-slate-950 h-3.5 w-3.5 cursor-pointer"
                                />
                                <span className={isChecked ? "text-sky-300 font-medium" : "text-slate-400"}>{m.replace(" Module", "")}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Legal Check checkbox */}
              <label className="flex items-start gap-2.5 select-none cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 rounded border-white/10 text-sky-500 bg-slate-950 focus:ring-0 cursor-pointer"
                />
                <span className="text-[10.5px] text-slate-400 leading-tight">
                  I agree that registering as a partner or owner accepts standard road-handling diagnostics advice protocols and provides permission for digital QR transmission under Cambodian Transit Rules.
                </span>
              </label>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-sky-400 to-indigo-500 hover:from-sky-500 hover:to-indigo-600 active:from-sky-600 active:to-indigo-700 text-slate-950 text-xs font-black rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-sky-500/10 uppercase tracking-wider"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                  <span>Syncing Session Details...</span>
                </>
              ) : (
                <>
                  <span>Enter platform as {currentRoleDetails?.title || role}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            
          </form>

          {/* Quick Sandbox Warning Banner */}
          <div className="bg-amber-400/5 border border-amber-400/10 p-3 rounded-xl flex gap-2 text-[10px] text-amber-300">
            <span className="font-extrabold shrink-0 uppercase tracking-widest bg-amber-400/10 px-1 py-0.2 rounded border border-amber-400/20 text-[8px] h-fit mt-0.5">Note</span>
            <p className="leading-normal text-slate-400">
              This simulation replicates a multitenant deployment. Swapping roles updates your client-side route listings, available dashboards, and background actions instantly.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
