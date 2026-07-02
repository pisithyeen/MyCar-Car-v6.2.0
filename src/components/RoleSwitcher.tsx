import React, { useState, useEffect } from "react";
import { 
  Car, 
  Wrench, 
  User, 
  Shield, 
  Layers, 
  Zap, 
  Fuel, 
  Tag, 
  Briefcase, 
  Sliders, 
  Check, 
  Plus, 
  Building,
  ArrowRight,
  Sparkles,
  UserCheck,
  Award,
  Lock,
  X,
  Coins,
  QrCode,
  CheckCircle2
} from "lucide-react";
import { UserProfile, VehicleProfile } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface RoleSwitcherProps {
  userProfile: UserProfile;
  vehicles: VehicleProfile[];
  onRoleChanged: (newProfile: UserProfile) => void;
}

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({
  userProfile,
  vehicles,
  onRoleChanged,
}) => {
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // All 10 standard roles requested
  const availableRolesList = [
    { id: "Vehicle Owner", label: "Vehicle Owner", group: "Vehicle Users", desc: "Manage personal vehicles, service history, and fuel/charging logs.", icon: <Car className="w-4 h-4 text-sky-400" /> },
    { id: "Vehicle Manager", label: "Vehicle Manager", group: "Vehicle Users", desc: "Supervise fleets, family vehicles, and assign drivers.", icon: <Layers className="w-4 h-4 text-emerald-400" /> },
    { id: "Driver", label: "Driver", group: "Vehicle Users", desc: "Log fuel, report issues, and record trips for assigned vehicles.", icon: <User className="w-4 h-4 text-cyan-400" /> },
    { id: "Garage Owner", label: "Garage Owner", group: "Service Providers", desc: "Configure garage, accept jobs, view income, and manage staff.", icon: <Wrench className="w-4 h-4 text-indigo-400" /> },
    { id: "Garage Staff", label: "Garage Staff", group: "Service Providers", desc: "Assigned staff duties (Receptionist, Mechanic, Cashier, Manager).", icon: <Sliders className="w-4 h-4 text-purple-400" /> },
    { id: "Spare Part Shop", label: "Spare Part Shop", group: "Business Partners", desc: "Manage parts inventory, low stock warnings, and orders.", icon: <Tag className="w-4 h-4 text-amber-400" /> },
    { id: "Petrol Station Partner", label: "Petrol Station Partner", group: "Business Partners", desc: "Update fuel prices, list promotions, and track fuel sales.", icon: <Fuel className="w-4 h-4 text-yellow-450" /> },
    { id: "EV Charging Station Partner", label: "EV Charging Station Partner", group: "Business Partners", desc: "Monitor charging plugs availability, speeds, and power usage.", icon: <Zap className="w-4 h-4 text-emerald-450" /> },
    { id: "Freelance Mechanic", label: "Freelance Mechanic", group: "Service Providers", desc: "Provide mobile roadside repair. Receive service bids in Cambodia.", icon: <Briefcase className="w-4 h-4 text-orange-400" /> },
    { id: "Admin", label: "Admin Panel Staff", group: "Platform Admin", desc: "Manage users, verify businesses, moderate forums and marketplace.", icon: <Shield className="w-4 h-4 text-rose-450" /> },
  ] as const;

  // State trackers initialized with userProfile default values
  const [activeRole, setActiveRole] = useState(userProfile.active_role || userProfile.role);
  const [userRoles, setUserRoles] = useState<string[]>(
    userProfile.user_roles || [userProfile.role]
  );
  
  // Subscription & checkout simulated states
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'pro' | 'business'>('pro');
  const [paySimulating, setPaySimulating] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);
  const [activeVehicleId, setActiveVehicleId] = useState(
    userProfile.active_vehicle_id || (vehicles[0]?.id || "")
  );
  const [activeBusinessId, setActiveBusinessId] = useState(
    userProfile.active_business_id || "biz-123"
  );
  const [activeModule, setActiveModule] = useState(
    userProfile.active_module || "garage"
  );
  const [permissionGroup, setPermissionGroup] = useState(
    userProfile.permission_group || "Garage Manager"
  );
  const [businessName, setBusinessName] = useState(
    userProfile.businessName || "ABC Auto Center"
  );

  // Synchronize state with backend when preferences change
  useEffect(() => {
    // Only call the API when state actually differs from what is currently in the userProfile
    if (
      activeRole === userProfile.active_role &&
      activeVehicleId === userProfile.active_vehicle_id &&
      activeBusinessId === userProfile.active_business_id
    ) {
      return;
    }

    let isSubscribed = true;
    const savePreferences = async () => {
      setLoading(true);
      setSuccessMsg("");
      try {
        const response = await fetch("/api/profile/preferences", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            active_role: activeRole,
            active_vehicle_id: activeVehicleId,
            active_business_id: activeBusinessId,
          }),
        });

        if (response.ok) {
          const updatedProfile = await response.json();
          if (isSubscribed) {
            onRoleChanged(updatedProfile);
            setSuccessMsg(`Preferences saved: Switched active role to ${activeRole}.`);
            const timer = setTimeout(() => setSuccessMsg(""), 3500);
            return () => clearTimeout(timer);
          }
        } else {
          console.error("Failed to save active preferences on server");
        }
      } catch (err) {
        console.error("Error connecting to server for preference update:", err);
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    };

    savePreferences();

    return () => {
      isSubscribed = false;
    };
  }, [activeRole, activeVehicleId, activeBusinessId, userProfile, onRoleChanged]);

  // Toggle activation of a role persona under the unified single account
  const handleToggleRoleActivation = (roleName: any) => {
    if (roleName === "Vehicle Manager" && userProfile.subscription_status !== "Premium") {
      setSelectedPlan("pro");
      setShowPayModal(true);
      return;
    }
    let updated: string[];
    if (userRoles.includes(roleName)) {
      if (userRoles.length === 1) return; // Must have at least one active role
      updated = userRoles.filter(r => r !== roleName);
    } else {
      updated = [...userRoles, roleName];
    }
    setUserRoles(updated);
  };

  // Persist other profile details to the backend
  const handleUpdatePreferences = async (newRole?: any, directUpdates: Partial<UserProfile> = {}) => {
    setLoading(true);
    setSuccessMsg("");
    
    const roleToApply = newRole || activeRole;

    const payload = {
      name: userProfile.name,
      email: userProfile.email,
      phone: userProfile.phone,
      location: userProfile.location,
      status: userProfile.status || "Approved",
      role: roleToApply, // sync primary role
      businessName: businessName,
      licenseNumber: userProfile.licenseNumber || "Co-2938/2026-KH",
      isMultiService: userRoles.length > 1,
      
      // Sync detailed fields
      active_role: roleToApply,
      active_vehicle_id: activeVehicleId,
      active_business_id: activeBusinessId,
      active_module: activeModule,
      permission_group: permissionGroup,
      user_roles: userRoles,
      ...directUpdates
    };

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const updatedProfile: UserProfile = await response.json();
        onRoleChanged(updatedProfile);
        setSuccessMsg(`Switched to ${roleToApply} successfully! Dashboard data updated.`);
        setTimeout(() => setSuccessMsg(""), 4000);
      } else {
        console.error("Failed to update role preferences on server");
      }
    } catch (err) {
      console.error("Error connecting to server for role switch:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="role-switcher-card" className="glass rounded-3xl p-6 space-y-6 shadow-xl border border-white/10 relative overflow-hidden">
      <div className="absolute right-0 top-0 w-64 h-32 bg-sky-500/5 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="border-b border-white/5 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-sky-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sliders className="w-4 h-4 animate-spin-slow" />
            <span>Unified User Account Hub (Cambodia Model)</span>
          </div>
          <h2 className="text-lg font-bold text-slate-100">Activate Roles & Switch Persona</h2>
          <p className="text-xs text-slate-400">
            One account, multiple hats. In Cambodia, you can be a vehicle owner, manage a fleet, run a garage, or moderate local sales.
          </p>
        </div>
        
        {successMsg && (
          <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-3.5 py-1.5 rounded-xl text-xs font-bold animate-pulse">
            {successMsg}
          </div>
        )}
      </div>

      {/* -------------------- STEP 1: MANAGE COMPREHENSIVE ROLE PORTFOLIO -------------------- */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Your Role Portfolio (Toggle Active Roles)</span>
        </h3>
        <p className="text-[11px] text-slate-400">
          Check the roles you want enabled for this account. Unchecked roles will not show in your workspace, keeping menus clean.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {availableRolesList.map(roleItem => {
            const isActivated = userRoles.includes(roleItem.id);
            return (
              <div 
                key={roleItem.id}
                onClick={() => handleToggleRoleActivation(roleItem.id)}
                className={`p-3 rounded-2xl border text-left cursor-pointer transition flex items-start gap-2.5 ${
                  isActivated 
                    ? "bg-sky-500/10 border-sky-500/30 hover:bg-sky-500/15" 
                    : "bg-white/3 border-white/5 hover:border-white/10 hover:bg-white/5"
                }`}
              >
                <div className={`p-1.5 rounded-xl shrink-0 mt-0.5 ${
                  isActivated ? "bg-sky-500/20 text-sky-300" : "bg-white/5 text-slate-400"
                }`}>
                  {roleItem.icon}
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold text-slate-200">{roleItem.label}</span>
                    {isActivated && (
                      <span className="p-0.5 bg-sky-500 text-slate-950 rounded-full shrink-0">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                    {roleItem.id === "Vehicle Manager" && userProfile.subscription_status !== "Premium" && (
                      <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[8px] font-black rounded-full tracking-wider uppercase shrink-0">
                        <Lock className="w-2.5 h-2.5" />
                        <span>Premium</span>
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 leading-normal">{roleItem.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* -------------------- PREMIUM FLEET UPGRADE MODULE -------------------- */}
      {userProfile.subscription_status !== "Premium" ? (
        <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-slate-900 border border-emerald-500/30 rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Award className="w-32 h-32 text-emerald-400" />
          </div>
          <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
            <div className="space-y-2">
              <span className="bg-emerald-500 text-slate-950 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                Cambodia Fleet Special
              </span>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-1.5">
                <Award className="w-5 h-5 text-amber-400" />
                <span>Upgrade to Fleet & Family Vehicle Manager</span>
              </h3>
              <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                Supercharge your vehicle ownership. Perfect for rich families, private boss drivers, company admins, and delivery fleets in Phnom Penh. Lock roles, invite drivers, sync live trip logs, and get AI cost audits.
              </p>
            </div>
            <button 
              onClick={() => {
                setSelectedPlan("pro");
                setShowPayModal(true);
              }}
              className="px-6 py-3 bg-emerald-400 hover:bg-emerald-500 text-slate-950 text-xs font-black rounded-xl tracking-wider uppercase shrink-0 transition shadow-lg shadow-emerald-400/20 cursor-pointer flex items-center gap-2"
            >
              <span>Unlock Premium Roles</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-200">Premium Account Active</span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full uppercase tracking-widest font-bold">
                  {(userProfile.subscription_plan || 'pro').toUpperCase()} Plan
                </span>
              </div>
              <p className="text-[10px] text-slate-400">You have unlimited fleet manager status. Enjoy advanced driver assignment & AI cost audits.</p>
            </div>
          </div>
          <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
            <Check className="w-3.5 h-3.5" />
            <span>✓ Active</span>
          </span>
        </div>
      )}

      {/* -------------------- STEP 2: ACTIVE ROLE SELECTOR & DATA SCOPING -------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2 border-t border-white/5">
        
        {/* Switcher Dropdown & Main Persona Select */}
        <div className="md:col-span-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-sky-400" />
              <span>Select Active Role Persona</span>
            </label>
            <p className="text-[11px] text-slate-400">
              Only roles checked in your portfolio can be set as active.
            </p>
            <select
              value={activeRole}
              onChange={(e) => {
                const next = e.target.value as any;
                setActiveRole(next);
              }}
              className="w-full bg-slate-900 border border-white/10 p-3 rounded-xl text-xs text-slate-100 font-bold focus:border-sky-500 outline-none cursor-pointer"
            >
              {availableRolesList
                .filter(r => userRoles.includes(r.id))
                .map(r => (
                  <option key={r.id} value={r.id}>{r.label} ({r.group})</option>
                ))}
            </select>
          </div>

          <div className="p-4 bg-sky-950/20 border border-sky-500/10 rounded-2xl space-y-1 text-xs">
            <span className="text-[10px] text-sky-400 uppercase tracking-widest font-black">Active Scope State</span>
            <p className="text-slate-200 font-medium">
              Currently navigating as <strong className="text-sky-300 underline font-bold">{activeRole}</strong>.
            </p>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Your sidebar menus, available actions, reports, and simulated dataset updates automatically to only show elements permitted for this scope.
            </p>
          </div>
        </div>

        {/* Dynamic Context Parameters Based on Active Role Group */}
        <div className="md:col-span-7 p-4 bg-white/3 border border-white/5 rounded-2xl space-y-4 text-xs">
          <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">Context Parameter Details</span>
          
          {/* VEHICLE ROLE CONTEXT (Group 1) */}
          {(activeRole === "Vehicle Owner" || activeRole === "Vehicle Manager" || activeRole === "Driver") && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-sky-400 uppercase">Scoped Active Vehicle ID</label>
                <p className="text-[11px] text-slate-400 mb-1">
                  Specify the currently selected vehicle for expense ledger and service alerts.
                </p>
                <select
                  value={activeVehicleId}
                  onChange={(e) => {
                    setActiveVehicleId(e.target.value);
                  }}
                  className="w-full bg-slate-900 border border-white/10 p-2.5 rounded-xl font-mono text-slate-300"
                >
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.brand} {v.model} - {v.plateNumber || "No Plate"} ({v.fuelType})
                    </option>
                  ))}
                  {vehicles.length === 0 && <option value="">No registered vehicles found</option>}
                </select>
              </div>

              {activeRole === "Driver" && (
                <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-2.5 rounded-xl text-[11px] leading-relaxed">
                  <strong>Driver Safety Restriction:</strong> You have write-access to log fuel/EV chargers and update kilometers, but deletion and service modifications require owner authorization.
                </div>
              )}
            </div>
          )}

          {/* SERVICE PROVIDERS (Group 2) & BUSINESS PARTNERS (Group 3) */}
          {(activeRole === "Garage Owner" || activeRole === "Garage Staff" || activeRole === "Spare Part Shop" || activeRole === "Petrol Station Partner" || activeRole === "EV Charging Station Partner" || activeRole === "Freelance Mechanic") && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-emerald-400 uppercase">Active Business Name</label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. ABC Auto Center"
                    className="w-full bg-slate-900 border border-white/10 p-2 rounded-xl text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-emerald-400 uppercase">Active Business ID</label>
                  <select
                    value={activeBusinessId}
                    onChange={(e) => {
                      setActiveBusinessId(e.target.value);
                    }}
                    className="w-full bg-slate-900 border border-white/10 p-2 rounded-xl text-slate-400 font-mono"
                  >
                    <option value="biz-123">biz-123 (Main ABC Auto)</option>
                    <option value="biz-456">biz-456 (Angkor Branch)</option>
                    <option value="biz-789">biz-789 (Freelance Garage)</option>
                  </select>
                </div>
              </div>

              {/* Multiple Activated Modules for Service Provider Business */}
              {activeRole === "Garage Owner" && (
                <div className="space-y-2 pt-1">
                  <label className="text-[10px] font-bold text-purple-400 uppercase block">ABC Auto Active Business Modules</label>
                  <p className="text-[10px] text-slate-500">Enable multiple modules for a single physical workshop center.</p>
                  <div className="flex flex-wrap gap-2">
                    {["garage", "spare_part_shop", "ev_charging_station"].map(mod => {
                      const isActive = activeModule === mod;
                      return (
                        <button
                          key={mod}
                          onClick={() => {
                            setActiveModule(mod as any);
                            handleUpdatePreferences(activeRole, { active_module: mod as any });
                          }}
                          className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase transition ${
                            isActive 
                              ? "bg-purple-500/20 border-purple-500/40 text-purple-300" 
                              : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10"
                          }`}
                        >
                          {mod.replace(/_/g, " ")}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Garage Staff Sub-Roles selection */}
              {activeRole === "Garage Staff" && (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-purple-400 uppercase block">Staff Sub-Role Permission Group</label>
                  <select
                    value={permissionGroup}
                    onChange={(e) => {
                      const nextPg = e.target.value as any;
                      setPermissionGroup(nextPg);
                      handleUpdatePreferences(activeRole, { permission_group: nextPg });
                    }}
                    className="w-full bg-slate-900 border border-white/10 p-2 rounded-xl text-slate-300"
                  >
                    <option value="Receptionist">Receptionist (Scan QR, Check-in, Appointments)</option>
                    <option value="Mechanic">Mechanic (Inspection, Repairs, Status Notes)</option>
                    <option value="Cashier">Cashier (POS Invoices, Payments, Receipts)</option>
                    <option value="Garage Manager">Garage Manager (Manage Staff, Approve Jobs, Reports)</option>
                  </select>
                </div>
              )}
            </div>
          )}

          {/* ADMIN PERMISSION CONTEXT (Group 5) */}
          {activeRole === "Admin" && (
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-rose-450 uppercase block">Admin Permission Level</label>
              <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl space-y-1.5">
                <span className="font-bold text-rose-300">Super Admin / Operations Executive</span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Full clearance level. Grants moderation rights, user verification audits, Cambodia car brand databases management, and subscription rules configuration.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              onClick={() => handleUpdatePreferences()}
              disabled={loading}
              className="px-4 py-2 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-lg cursor-pointer"
            >
              {loading ? "Saving Preferences..." : "Apply Config & Re-sync Dashboard"}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

      {/* -------------------- DYNAMIC CAMBODIAN BAKONG / ABA PAY KHQR MODAL -------------------- */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl relative">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-600/25 to-blue-700/25 p-5 border-b border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="p-1 bg-white/10 text-white rounded-lg">
                  <Shield className="w-5 h-5 text-sky-400" />
                </span>
                <div>
                  <h4 className="text-sm font-black text-slate-100 uppercase tracking-widest">
                    Kingdom of Cambodia Digital Gateway
                  </h4>
                  <p className="text-[10px] text-slate-400">National Bank clearing system • Secure Bakong Protocol</p>
                </div>
              </div>
              <button 
                onClick={() => setShowPayModal(false)}
                className="p-1.5 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              
              {paySuccess ? (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 animate-scaleUp">
                  <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-100">Payment Approved Successfully!</h3>
                  <p className="text-xs text-slate-400 max-w-sm">
                    Thank you for upgrading. Your account status is now updated to **Premium SME Fleet Manager** with driver controls.
                  </p>
                  <p className="text-[11px] text-emerald-400 font-mono animate-pulse">Syncing permissions & reloading active dashboard...</p>
                </div>
              ) : paySimulating ? (
                <div className="py-16 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-12 h-12 border-4 border-t-emerald-400 border-emerald-400/20 rounded-full animate-spin"></div>
                  <h3 className="text-sm font-bold text-slate-200">Verifying Bakong Payment Protocol...</h3>
                  <p className="text-xs text-slate-500">Checking callback signature from Cambodian Clearing House.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Step 1: Select Plan */}
                  <div className="space-y-2">
                    <span className="text-[10px] text-sky-400 uppercase tracking-widest font-black">Step 1: Choose Your Vehicle Fleet Limits</span>
                    <div className="grid grid-cols-3 gap-3">
                      
                      {/* Basic / Bronze */}
                      <div 
                        onClick={() => setSelectedPlan('basic')}
                        className={`p-3 rounded-xl border cursor-pointer transition text-left space-y-1 ${
                          selectedPlan === 'basic' 
                            ? "bg-emerald-500/10 border-emerald-500/40" 
                            : "bg-white/3 border-white/5 hover:border-white/10"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black uppercase text-slate-300">Bronze Family</span>
                          {selectedPlan === 'basic' && <div className="w-2 h-2 rounded-full bg-emerald-400"></div>}
                        </div>
                        <div className="text-sm font-extrabold text-slate-100">$15<span className="text-[9px] font-normal text-slate-500">/mo</span></div>
                        <p className="text-[9px] text-slate-400 leading-snug">5 vehicles • 3 drivers • logs & charts</p>
                      </div>

                      {/* SME Pro */}
                      <div 
                        onClick={() => setSelectedPlan('pro')}
                        className={`p-3 rounded-xl border cursor-pointer transition text-left space-y-1 relative ${
                          selectedPlan === 'pro' 
                            ? "bg-emerald-500/10 border-emerald-500/50" 
                            : "bg-white/3 border-white/5 hover:border-white/10"
                        }`}
                      >
                        <span className="absolute -top-2 right-2 px-1 py-0.5 bg-emerald-500 text-slate-950 text-[7px] font-black uppercase rounded">BEST</span>
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black uppercase text-slate-300">SME Fleet Pro</span>
                          {selectedPlan === 'pro' && <div className="w-2 h-2 rounded-full bg-emerald-400"></div>}
                        </div>
                        <div className="text-sm font-extrabold text-slate-100">$49<span className="text-[9px] font-normal text-slate-500">/mo</span></div>
                        <p className="text-[9px] text-slate-400 leading-snug">15 vehicles • 10 drivers • AI audits • PDF</p>
                      </div>

                      {/* Enterprise */}
                      <div 
                        onClick={() => setSelectedPlan('business')}
                        className={`p-3 rounded-xl border cursor-pointer transition text-left space-y-1 ${
                          selectedPlan === 'business' 
                            ? "bg-emerald-500/10 border-emerald-500/40" 
                            : "bg-white/3 border-white/5 hover:border-white/10"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black uppercase text-slate-300">Enterprise</span>
                          {selectedPlan === 'business' && <div className="w-2 h-2 rounded-full bg-emerald-400"></div>}
                        </div>
                        <div className="text-sm font-extrabold text-slate-100">$149<span className="text-[9px] font-normal text-slate-500">/mo</span></div>
                        <p className="text-[9px] text-slate-400 leading-snug">100 vehicles • 50 drivers • API Access</p>
                      </div>

                    </div>
                  </div>

                  {/* Step 2: Payment Details with KHQR */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-800">
                    
                    {/* Invoice Left */}
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-sky-400 uppercase tracking-widest font-black block">Step 2: Invoice Summary</span>
                        <div className="bg-slate-950 p-4 rounded-2xl space-y-2 border border-slate-850">
                          <div className="flex justify-between text-slate-400 text-xs">
                            <span>Selected Plan</span>
                            <span className="font-bold text-slate-200 uppercase">{selectedPlan}</span>
                          </div>
                          <div className="flex justify-between text-slate-400 text-xs">
                            <span>Billed Account</span>
                            <span className="font-bold text-slate-200">{userProfile.email}</span>
                          </div>
                          <div className="border-t border-slate-850 my-2 pt-2 flex justify-between items-baseline">
                            <span className="text-slate-100 text-xs font-bold">Total USD</span>
                            <span className="text-slate-100 font-mono text-base font-black">
                              ${selectedPlan === 'basic' ? '15.00' : selectedPlan === 'pro' ? '49.00' : '149.00'}
                            </span>
                          </div>
                          <div className="flex justify-between items-baseline text-slate-400">
                            <span className="text-[10px]">Approx. Khmer Riel (KHR)</span>
                            <span className="text-emerald-400 font-mono text-xs font-bold">
                              {selectedPlan === 'basic' ? '61,500 ៛' : selectedPlan === 'pro' ? '200,900 ៛' : '610,900 ៛'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl text-[10px] leading-relaxed">
                        💡 <strong>Real-Time Integration:</strong> Once paid, you gain instantaneous authorization as a "Vehicle Manager" and "Driver" simultaneously on this single unified account.
                      </div>
                    </div>

                    {/* KHQR Right */}
                    <div className="flex flex-col items-center justify-center p-4 bg-white text-slate-900 rounded-2xl border border-slate-800 text-center relative overflow-hidden">
                      {/* KHQR Header Banner */}
                      <div className="bg-red-600 text-white text-[9px] font-black uppercase tracking-wider py-1 px-4 w-full absolute top-0 left-0 right-0 flex justify-center items-center gap-1.5 shadow-sm">
                        <span>KHQR Mobile Banking</span>
                        <span className="bg-white text-slate-950 px-1 py-0.5 rounded text-[7px] font-extrabold">Cambodia</span>
                      </div>

                      <div className="pt-4 pb-2 space-y-2 flex flex-col items-center">
                        <div className="w-32 h-32 bg-slate-100 border-2 border-slate-200 rounded-xl p-2 flex items-center justify-center relative shadow-inner">
                          {/* Simulated QR Code SVG vector pattern */}
                          <div className="grid grid-cols-4 gap-1 opacity-80">
                            {Array.from({ length: 16 }).map((_, i) => (
                              <div key={i} className={`w-6 h-6 rounded ${i % 3 === 0 || i % 4 === 1 ? "bg-slate-950" : "bg-transparent"}`}></div>
                            ))}
                          </div>
                          <div className="absolute inset-0 m-auto w-8 h-8 bg-white border border-slate-300 rounded-lg flex items-center justify-center shadow">
                            <span className="text-[7px] font-black text-red-600 uppercase">KHQR</span>
                          </div>
                        </div>
                        
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-black text-slate-800">Scan to Upgrade Plan</span>
                          <p className="text-[8px] text-slate-500 max-w-[180px]">
                            Accepts ABA Pay, ACLEDA ToanChet, Wing, Canadia, and all Bakong members in Cambodia.
                          </p>
                        </div>
                      </div>

                      {/* Simulated Callback Trigger */}
                      <button 
                        onClick={() => {
                          const p = selectedPlan;
                          const callbackUpgrade = async () => {
                            setPaySimulating(true);
                            setTimeout(async () => {
                              const updatedRoles = [...userRoles];
                              if (!updatedRoles.includes("Vehicle Manager")) {
                                updatedRoles.push("Vehicle Manager");
                              }
                              if (!updatedRoles.includes("Driver")) {
                                updatedRoles.push("Driver");
                              }

                              const payload = {
                                name: userProfile.name,
                                email: userProfile.email,
                                phone: userProfile.phone || "098 765 432",
                                location: userProfile.location || "Phnom Penh",
                                role: "Vehicle Manager" as const,
                                businessName: businessName || "Somaly Family Fleet",
                                licenseNumber: userProfile.licenseNumber || "Co-2938/2026-KH",
                                isMultiService: true,
                                active_role: "Vehicle Manager" as const,
                                active_vehicle_id: activeVehicleId || (vehicles[0]?.id || ""),
                                active_business_id: activeBusinessId || "biz-123",
                                active_module: activeModule,
                                permission_group: permissionGroup,
                                user_roles: updatedRoles,
                                subscription_status: "Premium" as const,
                                subscription_plan: p
                              };

                              try {
                                const response = await fetch("/api/profile", {
                                  method: "PUT",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify(payload),
                                });

                                if (response.ok) {
                                  const updatedProfile: UserProfile = await response.json();
                                  onRoleChanged(updatedProfile);
                                  setUserRoles(updatedRoles);
                                  setActiveRole("Vehicle Manager");
                                  setPaySuccess(true);
                                  setSuccessMsg(`Upgraded to Premium ${p.toUpperCase()} successfully!`);
                                  setTimeout(() => {
                                    setShowPayModal(false);
                                    setPaySuccess(false);
                                    setPaySimulating(false);
                                  }, 2000);
                                } else {
                                  console.error("Failed to upgrade subscription on server");
                                  setPaySimulating(false);
                                }
                              } catch (err) {
                                console.error("Error processing simulation payment:", err);
                                setPaySimulating(false);
                              }
                            }, 1500);
                          };
                          callbackUpgrade();
                        }}
                        className="mt-2 w-full py-2 bg-red-600 hover:bg-red-700 text-white text-[10px] font-black rounded-lg transition tracking-wide uppercase shadow cursor-pointer"
                      >
                        ⚡ Simulate Bakong Pay Success
                      </button>
                    </div>

                  </div>

                </div>
              )}

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
