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
  UserCheck
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
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-200">{roleItem.label}</span>
                    {isActivated && (
                      <span className="p-0.5 bg-sky-500 text-slate-950 rounded-full">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
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

    </div>
  );
};
