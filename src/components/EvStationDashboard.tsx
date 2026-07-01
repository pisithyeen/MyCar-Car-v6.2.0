/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * EV Charging Station Partner Dashboard
 * Implements a dedicated dashboard, data scope, and interactive widgets
 * for managing EV charging station profiles, chargers, live sessions, reviews, 
 * promotions, staff, and financial reports.
 */

import React, { useState, useEffect } from "react";
import { 
  Zap, 
  MapPin, 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  Star, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Activity, 
  FileText, 
  Clock, 
  Battery, 
  ShieldAlert, 
  CheckCircle, 
  Cpu, 
  Sparkles,
  RefreshCw,
  Eye
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";

interface EvStationDashboardProps {
  onRefreshData: () => void;
  userProfile: any;
}

export default function EvStationDashboard({ onRefreshData, userProfile }: EvStationDashboardProps) {
  // --- STATE FOR PROFILE ---
  const [profile, setProfile] = useState({
    stationName: userProfile.businessName || "Voltaic PP - Toul Kork EV Station",
    phone: userProfile.phone || "+855 12 888 777",
    address: "St 289, Toul Kork, Phnom Penh, Cambodia",
    operatingHours: "24/7 Open",
    latitude: 11.5721,
    longitude: 104.8942,
    status: "Approved",
    paymentMethods: "ABA Pay, Wing, CareCoin"
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // --- STATE FOR CHARGERS ---
  const [chargers, setChargers] = useState([
    { chargerId: "CH-01", chargerName: "Supercharger AC-01", chargerType: "AC", plugType: "Type 2", chargingSpeedKw: 22, pricePerKwh: 0.28, availabilityStatus: "Available", maintenanceStatus: "Operational" },
    { chargerId: "CH-02", chargerName: "Hypercharge DC-02", chargerType: "DC", plugType: "CCS2", chargingSpeedKw: 120, pricePerKwh: 0.35, availabilityStatus: "Occupied", maintenanceStatus: "Operational" },
    { chargerId: "CH-03", chargerName: "Giga DC Fast-03", chargerType: "DC", plugType: "GB/T", chargingSpeedKw: 60, pricePerKwh: 0.32, availabilityStatus: "Available", maintenanceStatus: "Operational" },
    { chargerId: "CH-04", chargerName: "Compact AC-04", chargerType: "AC", plugType: "Type 2", chargingSpeedKw: 11, pricePerKwh: 0.25, availabilityStatus: "Offline", maintenanceStatus: "Under Maintenance" }
  ]);
  const [showAddCharger, setShowAddCharger] = useState(false);
  const [newCharger, setNewCharger] = useState({
    chargerName: "",
    chargerType: "DC",
    plugType: "CCS2",
    chargingSpeedKw: 120,
    pricePerKwh: 0.35
  });

  // --- STATE FOR SESSIONS ---
  const [sessions, setSessions] = useState([
    { sessionId: "S-1092", chargerId: "CH-02", chargerName: "Hypercharge DC-02", user: "Chea Rotha", vehicle: "BYD Seal Premium", startTime: "10:30 AM", endTime: "11:15 AM", energyUsedKwh: 45.2, totalCost: 15.82, paymentStatus: "Paid", sessionStatus: "Completed" },
    { sessionId: "S-1091", chargerId: "CH-03", chargerName: "Giga DC Fast-03", user: "Meas Sokna", vehicle: "Tesla Model Y", startTime: "09:15 AM", endTime: "10:00 AM", energyUsedKwh: 38.0, totalCost: 12.16, paymentStatus: "Paid", sessionStatus: "Completed" },
    { sessionId: "S-1090", chargerId: "CH-01", chargerName: "Supercharger AC-01", user: "Phnom Penh Taxi", vehicle: "GWM Ora Good Cat", startTime: "08:00 AM", endTime: "09:30 AM", energyUsedKwh: 21.5, totalCost: 6.02, paymentStatus: "Paid", sessionStatus: "Completed" }
  ]);

  // --- STATE FOR LIVE SIMULATED CHARGING ---
  const [liveSession, setLiveSession] = useState<any>(null);
  const [liveProgress, setLiveProgress] = useState(0);
  const [liveKwh, setLiveKwh] = useState(0);
  const [liveCost, setLiveCost] = useState(0);

  // --- STATE FOR STAFF ---
  const [staffList, setStaffList] = useState([
    { staffId: "ST-01", name: "Khorn Socheata", phone: "+855 10 223 344", roleType: "Station Manager", permissionGroup: "Admin", status: "Active" },
    { staffId: "ST-02", name: "Odom Dara", phone: "+855 89 445 566", roleType: "Senior Technician", permissionGroup: "Staff", status: "Active" },
    { staffId: "ST-03", name: "Seng Phanny", phone: "+855 93 112 233", roleType: "Night Operator", permissionGroup: "Staff", status: "Active" }
  ]);
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [newStaff, setNewStaff] = useState({
    name: "",
    phone: "",
    roleType: "Operator",
    permissionGroup: "Staff"
  });

  // --- STATE FOR REVIEWS ---
  const [reviews, setReviews] = useState([
    { reviewId: "R-01", user: "Keo Visal", vehicle: "BYD Atto 3", rating: 5, comment: "Super fast CCS2 charging! Clean restroom and nice coffee shop right next to the charger.", date: "Today" },
    { reviewId: "R-02", user: "Chan Srey", vehicle: "Ora 07", rating: 4, comment: "Good AC charger speed. The price is reasonable compared to other stations in Toul Kork.", date: "Yesterday" },
    { reviewId: "R-03", user: "Lay Heng", vehicle: "Tesla Model 3", rating: 3, comment: "The DC fast charger was occupied for 15 minutes, but the staff was friendly and helped queue me.", date: "3 days ago" }
  ]);

  // --- STATE FOR PROMOTIONS ---
  const [promotions, setPromotions] = useState([
    { promoId: "P-01", title: "Midnight Supercharge Discount", description: "Get 20% off all DC fast charging between 10:00 PM and 6:00 AM daily.", status: "Active", views: 242 },
    { promoId: "P-02", title: "CareCoin Reward Match", description: "Earn double CareCoins when paying for EV charging with ABA Pay on MyCar Care.", status: "Active", views: 189 }
  ]);
  const [showAddPromo, setShowAddPromo] = useState(false);
  const [newPromo, setNewPromo] = useState({
    title: "",
    description: ""
  });

  // --- SIMULATION LOGIC ---
  useEffect(() => {
    let interval: any;
    if (liveSession) {
      interval = setInterval(() => {
        setLiveProgress(prev => {
          if (prev >= 100) {
            // End session and add to history
            const finalKwh = parseFloat((liveSession.speed * 0.5).toFixed(1));
            const finalCost = parseFloat((finalKwh * liveSession.price).toFixed(2));
            
            const completedSession = {
              sessionId: `S-${Math.floor(1000 + Math.random() * 9000)}`,
              chargerId: liveSession.chargerId,
              chargerName: liveSession.chargerName,
              user: liveSession.user,
              vehicle: liveSession.vehicle,
              startTime: "Just Now",
              endTime: "Just Now",
              energyUsedKwh: finalKwh,
              totalCost: finalCost,
              paymentStatus: "Paid",
              sessionStatus: "Completed"
            };

            setSessions(prevSessions => [completedSession, ...prevSessions]);
            
            // Toggle charger status back to Available
            setChargers(prevChargers => prevChargers.map(c => 
              c.chargerId === liveSession.chargerId ? { ...c, availabilityStatus: "Available" } : c
            ));

            setLiveSession(null);
            return 0;
          }
          
          const currentKwh = parseFloat(((prev + 1) * (liveSession.speed * 0.005)).toFixed(1));
          setLiveKwh(currentKwh);
          setLiveCost(parseFloat((currentKwh * liveSession.price).toFixed(2)));
          return prev + 5; // 5% increase every second
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [liveSession]);

  const handleStartSimulatedCharge = (chargerId: string) => {
    if (liveSession) {
      alert("A live session is already running. Please wait until it completes or stop it.");
      return;
    }

    const charger = chargers.find(c => c.chargerId === chargerId);
    if (!charger) return;

    if (charger.availabilityStatus === "Offline" || charger.maintenanceStatus === "Under Maintenance") {
      alert("This charger is offline for maintenance.");
      return;
    }

    // Set charger as occupied
    setChargers(prev => prev.map(c => 
      c.chargerId === chargerId ? { ...c, availabilityStatus: "Occupied" } : c
    ));

    const simulatedVehicles = [
      { user: "Sok Chamroeun", vehicle: "Tesla Model Y" },
      { user: "Vannak Kiri", vehicle: "BYD Atto 3" },
      { user: "Nary Heng", vehicle: "GWM Ora 07" },
      { user: "Sopheap Roth", vehicle: "MG 4 EV" }
    ];
    const target = simulatedVehicles[Math.floor(Math.random() * simulatedVehicles.length)];

    setLiveProgress(0);
    setLiveKwh(0);
    setLiveCost(0);
    setLiveSession({
      chargerId: charger.chargerId,
      chargerName: charger.chargerName,
      speed: charger.chargingSpeedKw,
      price: charger.pricePerKwh,
      user: target.user,
      vehicle: target.vehicle
    });
  };

  const handleStopSimulatedCharge = () => {
    if (!liveSession) return;
    
    // Toggle charger back to available
    setChargers(prev => prev.map(c => 
      c.chargerId === liveSession.chargerId ? { ...c, availabilityStatus: "Available" } : c
    ));
    setLiveSession(null);
  };

  // --- ACTIONS FOR PROFILE ---
  const handleSaveProfile = () => {
    setIsEditingProfile(false);
    onRefreshData();
  };

  // --- ACTIONS FOR CHARGERS ---
  const handleAddChargerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCharger.chargerName.trim()) return;

    const added = {
      chargerId: `CH-0${chargers.length + 1}`,
      chargerName: newCharger.chargerName,
      chargerType: newCharger.chargerType,
      plugType: newCharger.plugType,
      chargingSpeedKw: Number(newCharger.chargingSpeedKw),
      pricePerKwh: Number(newCharger.pricePerKwh),
      availabilityStatus: "Available",
      maintenanceStatus: "Operational"
    };

    setChargers([...chargers, added]);
    setNewCharger({
      chargerName: "",
      chargerType: "DC",
      plugType: "CCS2",
      chargingSpeedKw: 120,
      pricePerKwh: 0.35
    });
    setShowAddCharger(false);
  };

  const handleDeleteCharger = (chargerId: string) => {
    if (confirm("Are you sure you want to remove this charger terminal?")) {
      setChargers(chargers.filter(c => c.chargerId !== chargerId));
    }
  };

  const toggleChargerAvailability = (chargerId: string) => {
    setChargers(prev => prev.map(c => {
      if (c.chargerId === chargerId) {
        const nextStatus = c.availabilityStatus === "Available" ? "Occupied" : c.availabilityStatus === "Occupied" ? "Offline" : "Available";
        return { ...c, availabilityStatus: nextStatus };
      }
      return c;
    }));
  };

  const toggleChargerMaintenance = (chargerId: string) => {
    setChargers(prev => prev.map(c => {
      if (c.chargerId === chargerId) {
        const nextMaint = c.maintenanceStatus === "Operational" ? "Under Maintenance" : "Operational";
        const nextAvail = nextMaint === "Under Maintenance" ? "Offline" : "Available";
        return { ...c, maintenanceStatus: nextMaint, availabilityStatus: nextAvail };
      }
      return c;
    }));
  };

  // --- ACTIONS FOR STAFF ---
  const handleAddStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaff.name.trim() || !newStaff.phone.trim()) return;

    const added = {
      staffId: `ST-0${staffList.length + 1}`,
      name: newStaff.name,
      phone: newStaff.phone,
      roleType: newStaff.roleType,
      permissionGroup: newStaff.permissionGroup,
      status: "Active"
    };

    setStaffList([...staffList, added]);
    setNewStaff({
      name: "",
      phone: "",
      roleType: "Operator",
      permissionGroup: "Staff"
    });
    setShowAddStaff(false);
  };

  const handleFireStaff = (staffId: string) => {
    if (confirm("Are you sure you want to remove this staff member from the station?")) {
      setStaffList(staffList.filter(s => s.staffId !== staffId));
    }
  };

  // --- ACTIONS FOR PROMOTIONS ---
  const handleAddPromoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromo.title.trim() || !newPromo.description.trim()) return;

    const added = {
      promoId: `P-0${promotions.length + 1}`,
      title: newPromo.title,
      description: newPromo.description,
      status: "Active",
      views: 0
    };

    setPromotions([...promotions, added]);
    setNewPromo({ title: "", description: "" });
    setShowAddPromo(false);
  };

  const handleDeletePromo = (promoId: string) => {
    if (confirm("Are you sure you want to withdraw this promotion post?")) {
      setPromotions(promotions.filter(p => p.promoId !== promoId));
    }
  };

  // --- REPORT STATISTICS CALCULATIONS ---
  const activeChargersCount = chargers.filter(c => c.availabilityStatus !== "Offline").length;
  const overallOccupancyRate = Math.round((chargers.filter(c => c.availabilityStatus === "Occupied").length / chargers.length) * 100) || 0;
  
  const totalPowerDeliveredKwh = sessions.reduce((acc, curr) => acc + curr.energyUsedKwh, 0) + (liveSession ? liveKwh : 0);
  const totalRevenueUsd = sessions.reduce((acc, curr) => acc + curr.totalCost, 0) + (liveSession ? liveCost : 0);

  // Recharts fake data
  const revenueChartData = [
    { name: "Mon", revenue: 145 },
    { name: "Tue", revenue: 189 },
    { name: "Wed", revenue: 168 },
    { name: "Thu", revenue: 210 },
    { name: "Fri", revenue: 245 },
    { name: "Sat", revenue: 310 },
    { name: "Sun", revenue: totalRevenueUsd > 350 ? Math.round(totalRevenueUsd) : 380 }
  ];

  const hourlyChartData = [
    { hour: "08:00", sessions: 4 },
    { hour: "10:00", sessions: 8 },
    { hour: "12:00", sessions: 15 },
    { hour: "14:00", sessions: 11 },
    { hour: "16:00", sessions: 9 },
    { hour: "18:00", sessions: 18 },
    { hour: "20:00", sessions: 14 },
    { hour: "22:00", sessions: 7 }
  ];

  const plugTypeData = [
    { name: "CCS2 (DC)", value: chargers.filter(c => c.plugType === "CCS2").length },
    { name: "GB/T (DC)", value: chargers.filter(c => c.plugType === "GB/T").length },
    { name: "Type 2 (AC)", value: chargers.filter(c => c.plugType === "Type 2").length }
  ].filter(d => d.value > 0);

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"];

  return (
    <div className="space-y-6">
      {/* --- DASHBOARD HERO HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-emerald-500/20 p-6 rounded-2xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl animate-pulse">
            <Zap className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">{profile.stationName}</h1>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              {profile.address} • <Clock className="w-3.5 h-3.5 text-emerald-400" /> {profile.operatingHours}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full">
            <CheckCircle className="w-3.5 h-3.5" />
            Station: {profile.status}
          </span>
          <button 
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            className="px-4 py-2 text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-slate-200 hover:text-slate-100 rounded-xl flex items-center gap-1.5 transition-all"
          >
            {isEditingProfile ? <Eye className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
            {isEditingProfile ? "View Dashboard" : "Update Profile"}
          </button>
        </div>
      </div>

      {/* --- EDIT PROFILE FORM PANEL --- */}
      {isEditingProfile && (
        <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl space-y-4">
          <h2 className="text-sm font-bold text-slate-200 border-b border-white/5 pb-2">Edit EV Station Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase block">Station Name</label>
              <input
                type="text"
                value={profile.stationName}
                onChange={e => setProfile({ ...profile, stationName: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 p-2.5 px-3.5 text-xs rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase block">Phone Hotline</label>
              <input
                type="text"
                value={profile.phone}
                onChange={e => setProfile({ ...profile, phone: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 p-2.5 px-3.5 text-xs rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase block">Full Street Address</label>
              <input
                type="text"
                value={profile.address}
                onChange={e => setProfile({ ...profile, address: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 p-2.5 px-3.5 text-xs rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase block">Operating Hours</label>
              <input
                type="text"
                value={profile.operatingHours}
                onChange={e => setProfile({ ...profile, operatingHours: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 p-2.5 px-3.5 text-xs rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase block">Payment Methods Supported</label>
              <input
                type="text"
                value={profile.paymentMethods}
                onChange={e => setProfile({ ...profile, paymentMethods: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 p-2.5 px-3.5 text-xs rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase block">Latitude</label>
              <input
                type="number"
                step="0.0001"
                value={profile.latitude}
                onChange={e => setProfile({ ...profile, latitude: parseFloat(e.target.value) })}
                className="w-full bg-slate-950 border border-white/10 p-2.5 px-3.5 text-xs rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase block">Longitude</label>
              <input
                type="number"
                step="0.0001"
                value={profile.longitude}
                onChange={e => setProfile({ ...profile, longitude: parseFloat(e.target.value) })}
                className="w-full bg-slate-950 border border-white/10 p-2.5 px-3.5 text-xs rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* SIMULATED MAP LOCATION PANEL */}
          <div className="mt-4 bg-slate-950 border border-white/5 p-4 rounded-xl flex items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-200">Phnom Penh Map Locator Mockup</p>
              <p className="text-[10px] text-slate-400">Positioning marker at Lat: {profile.latitude}, Lng: {profile.longitude} near Toul Kork Tower.</p>
            </div>
            <div className="w-24 h-12 bg-slate-900 border border-white/10 rounded-lg flex items-center justify-center text-[10px] text-emerald-400 font-mono">
              [📍 MARKER]
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setIsEditingProfile(false)}
              className="px-4 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveProfile}
              className="px-4 py-2 text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" /> Save Profile Details
            </button>
          </div>
        </div>
      )}

      {/* --- LIVE SIMULATED CHARGER MONITORING SYSTEM --- */}
      {liveSession && (
        <div className="bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500 p-6 rounded-2xl shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-extrabold bg-emerald-500 text-slate-950 uppercase rounded-md animate-pulse">
                  Live Active Charging
                </span>
                <span className="text-xs text-slate-400">Session ID: S-SIMULATED</span>
              </div>
              <h3 className="text-base font-extrabold text-slate-100 flex items-center gap-1.5">
                <Cpu className="w-5 h-5 text-emerald-400 animate-spin" />
                {liveSession.chargerName} • {liveSession.vehicle}
              </h3>
              <p className="text-xs text-slate-400">
                Driver: <span className="text-slate-200 font-medium">{liveSession.user}</span> • 
                Power Rate: <span className="text-emerald-400 font-bold">{liveSession.speed} kW</span>
              </p>
            </div>
            
            <div className="flex items-end md:items-center gap-8">
              <div className="text-right">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Energy Delivered</p>
                <p className="text-2xl font-black text-slate-100">{liveKwh} <span className="text-xs font-normal text-slate-400">kWh</span></p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Current Cost</p>
                <p className="text-2xl font-black text-emerald-400">${liveCost.toFixed(2)}</p>
              </div>
              <button
                onClick={handleStopSimulatedCharge}
                className="px-4 py-2.5 text-xs font-bold bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 hover:text-rose-300 rounded-xl transition-all"
              >
                Terminate Charge
              </button>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Charging Progress (State of Charge Simulation)</span>
              <span className="font-bold text-emerald-400">{liveProgress}%</span>
            </div>
            <div className="w-full bg-slate-950 h-3.5 rounded-full p-0.5 border border-white/5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2.5 rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${liveProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* --- BUSINESS REPORT STATISTICS PANEL --- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-white/5 p-4 rounded-xl flex items-center justify-between shadow-md">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Revenue</p>
            <p className="text-2xl font-black text-slate-100">${totalRevenueUsd.toFixed(2)}</p>
            <p className="text-[9px] text-emerald-400 font-medium">↑ 12% vs last week</p>
          </div>
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-white/5 p-4 rounded-xl flex items-center justify-between shadow-md">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Power Delivered</p>
            <p className="text-2xl font-black text-slate-100">{totalPowerDeliveredKwh.toFixed(1)} <span className="text-xs">kWh</span></p>
            <p className="text-[9px] text-emerald-400 font-medium">↑ 16.5% green offset</p>
          </div>
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl">
            <Zap className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-white/5 p-4 rounded-xl flex items-center justify-between shadow-md">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Chargers</p>
            <p className="text-2xl font-black text-slate-100">{activeChargersCount} <span className="text-xs font-normal text-slate-500">/ {chargers.length}</span></p>
            <p className="text-[9px] text-slate-400">{chargers.filter(c => c.availabilityStatus === "Offline").length} offline for maint</p>
          </div>
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
            <Battery className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-white/5 p-4 rounded-xl flex items-center justify-between shadow-md">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Occupancy Rate</p>
            <p className="text-2xl font-black text-slate-100">{overallOccupancyRate}%</p>
            <p className="text-[9px] text-slate-400">Peak hours: 12 PM & 6 PM</p>
          </div>
          <div className="p-3 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl">
            <Activity className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* --- CHARGERS LIST & MAINTENANCE TERMINALS --- */}
      <div className="bg-slate-900 border border-white/5 p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Charger Terminal Grid</h2>
          </div>
          <button 
            onClick={() => setShowAddCharger(!showAddCharger)}
            className="p-1.5 px-3 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-400 font-semibold text-xs rounded-xl flex items-center gap-1 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Install New Charger
          </button>
        </div>

        {/* ADD CHARGER FORM */}
        {showAddCharger && (
          <form onSubmit={handleAddChargerSubmit} className="p-4 bg-slate-950 border border-white/10 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase block">Terminal Name</label>
              <input
                type="text"
                placeholder="e.g. Rapid Charger DC-05"
                required
                value={newCharger.chargerName}
                onChange={e => setNewCharger({ ...newCharger, chargerName: e.target.value })}
                className="w-full bg-slate-900 border border-white/10 p-2 text-xs rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase block">Charger Mode</label>
              <select
                value={newCharger.chargerType}
                onChange={e => setNewCharger({ ...newCharger, chargerType: e.target.value, plugType: e.target.value === "DC" ? "CCS2" : "Type 2", pricePerKwh: e.target.value === "DC" ? 0.35 : 0.28, chargingSpeedKw: e.target.value === "DC" ? 120 : 22 })}
                className="w-full bg-slate-900 border border-white/10 p-2 text-xs rounded-lg text-slate-100 focus:outline-none"
              >
                <option value="AC">AC (Slow / Medium Charge)</option>
                <option value="DC">DC (Fast / Super Charge)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase block">Plug Interface Type</label>
              <select
                value={newCharger.plugType}
                onChange={e => setNewCharger({ ...newCharger, plugType: e.target.value })}
                className="w-full bg-slate-900 border border-white/10 p-2 text-xs rounded-lg text-slate-100 focus:outline-none"
              >
                {newCharger.chargerType === "DC" ? (
                  <>
                    <option value="CCS2">CCS2 (European Standard)</option>
                    <option value="GB/T">GB/T (Chinese Standard)</option>
                    <option value="CHAdEMO">CHAdEMO</option>
                  </>
                ) : (
                  <>
                    <option value="Type 2">Type 2 (AC Regular)</option>
                    <option value="Type 1">Type 1</option>
                  </>
                )}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase block">Max Speed Rate (kW)</label>
              <input
                type="number"
                value={newCharger.chargingSpeedKw}
                onChange={e => setNewCharger({ ...newCharger, chargingSpeedKw: parseInt(e.target.value) })}
                className="w-full bg-slate-900 border border-white/10 p-2 text-xs rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase block">Price rate ($ per kWh)</label>
              <input
                type="number"
                step="0.01"
                value={newCharger.pricePerKwh}
                onChange={e => setNewCharger({ ...newCharger, pricePerKwh: parseFloat(e.target.value) })}
                className="w-full bg-slate-900 border border-white/10 p-2 text-xs rounded-lg text-slate-100 focus:outline-none"
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddCharger(false)}
                className="w-1/2 p-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-1/2 p-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-lg"
              >
                Install
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {chargers.map(charger => {
            const isOffline = charger.availabilityStatus === "Offline";
            const isOccupied = charger.availabilityStatus === "Occupied";
            const isUnderMaint = charger.maintenanceStatus === "Under Maintenance";

            return (
              <div 
                key={charger.chargerId}
                className={`p-4 rounded-xl border relative flex flex-col justify-between h-48 transition-all shadow-md ${
                  isUnderMaint 
                    ? "bg-slate-950 border-rose-500/30" 
                    : isOccupied
                    ? "bg-slate-900/50 border-blue-500/20"
                    : "bg-slate-900 border-white/5"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className={`inline-flex items-center px-2 py-0.5 text-[9px] font-bold rounded ${
                      charger.chargerType === "DC" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                    }`}>
                      ⚡ {charger.chargerType} {charger.chargingSpeedKw} kW
                    </span>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${
                      isOffline ? "text-slate-500" : isOccupied ? "text-blue-400 animate-pulse" : "text-emerald-400"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        isOffline ? "bg-slate-500" : isOccupied ? "bg-blue-400" : "bg-emerald-400"
                      }`} />
                      {charger.availabilityStatus}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-200 mt-2 tracking-tight">{charger.chargerName}</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Plug: {charger.plugType} • Price: ${charger.pricePerKwh}/kWh</p>
                  
                  {isUnderMaint && (
                    <p className="text-[9px] text-rose-400 mt-2 bg-rose-500/10 p-1 px-1.5 rounded border border-rose-500/10 flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3 flex-shrink-0" />
                      Under Maintenance
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                  <div className="flex gap-1.5">
                    <button 
                      onClick={() => toggleChargerAvailability(charger.chargerId)}
                      disabled={isUnderMaint}
                      title="Toggle availability status"
                      className="p-1 px-2 bg-slate-800 hover:bg-slate-700 text-[10px] font-semibold text-slate-300 rounded-lg disabled:opacity-50 transition-all"
                    >
                      Status
                    </button>
                    <button 
                      onClick={() => toggleChargerMaintenance(charger.chargerId)}
                      title="Toggle maintenance flag"
                      className={`p-1 px-2 text-[10px] font-semibold rounded-lg transition-all ${
                        isUnderMaint ? "bg-rose-500/20 hover:bg-rose-500/30 text-rose-400" : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                      }`}
                    >
                      Maint
                    </button>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleStartSimulatedCharge(charger.chargerId)}
                      disabled={isUnderMaint || isOccupied}
                      className="p-1 px-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 text-slate-950 disabled:text-slate-600 font-bold text-[10px] rounded-lg transition-all"
                    >
                      Simulate Charge
                    </button>
                    <button 
                      onClick={() => handleDeleteCharger(charger.chargerId)}
                      className="p-1 text-slate-500 hover:text-rose-400 transition-all"
                      title="Remove terminal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- REVENUES & TRAFFIC ANALYSIS REPORTS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* REVENUE GRAPH */}
        <div className="bg-slate-900 border border-white/5 p-6 rounded-2xl lg:col-span-2 space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Weekly Revenue Stream ($)</h3>
            <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-1 px-2.5 rounded-full font-bold">
              ABA Direct Settlement
            </span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f1f5f9' }} />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PIE CHART FOR PLUG TYPES */}
        <div className="bg-slate-900 border border-white/5 p-6 rounded-2xl space-y-3 shadow-lg flex flex-col justify-between">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Terminal Type Share</h3>
          <div className="h-44 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={plugTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {plugTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-center">
              <span className="text-xl font-black text-slate-100">{chargers.length}</span>
              <p className="text-[10px] text-slate-500 uppercase font-bold">Terminals</p>
            </div>
          </div>
          <div className="space-y-1.5">
            {plugTypeData.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  {d.name}
                </div>
                <span className="font-bold text-slate-200">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- PEAK HOUR TRAFFIC ANALYTICS BAR CHART --- */}
      <div className="bg-slate-900 border border-white/5 p-6 rounded-2xl space-y-4 shadow-lg">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Peak Operating Traffic (Daily Sessions By Hour)</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourlyChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" />
              <XAxis dataKey="hour" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f1f5f9' }} />
              <Bar dataKey="sessions" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* --- CHARGING SESSIONS LOGS & HISTORY --- */}
      <div className="bg-slate-900 border border-white/5 p-6 rounded-2xl space-y-4 shadow-lg">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Charging Session Logs</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-[10px] text-slate-400 uppercase tracking-wider font-extrabold">
                <th className="py-2.5">Session ID</th>
                <th>Charger</th>
                <th>Vehicle Model</th>
                <th>Driver</th>
                <th>Delivered</th>
                <th>Total Bill</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs text-slate-300">
              {sessions.map(session => (
                <tr key={session.sessionId} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 font-mono font-bold text-emerald-400">{session.sessionId}</td>
                  <td>{session.chargerName}</td>
                  <td className="font-semibold text-slate-200">{session.vehicle}</td>
                  <td>{session.user}</td>
                  <td>{session.energyUsedKwh} kWh</td>
                  <td className="font-bold text-emerald-400">${session.totalCost.toFixed(2)}</td>
                  <td>
                    <span className="inline-flex px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                      {session.sessionStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- STAFF & PROMOTIONS SIDE-BY-SIDE PANELS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* STAFF MANAGEMENT */}
        <div className="bg-slate-900 border border-white/5 p-6 rounded-2xl space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" /> Staff List
            </h3>
            <button 
              onClick={() => setShowAddStaff(!showAddStaff)}
              className="p-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-[10px] rounded-lg"
            >
              + Hire Staff
            </button>
          </div>

          {showAddStaff && (
            <form onSubmit={handleAddStaffSubmit} className="p-3 bg-slate-950 border border-white/10 rounded-xl space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 block">Name</label>
                  <input
                    type="text"
                    required
                    value={newStaff.name}
                    onChange={e => setNewStaff({ ...newStaff, name: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 p-1.5 text-xs rounded-md text-slate-100"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 block">Phone</label>
                  <input
                    type="text"
                    required
                    value={newStaff.phone}
                    onChange={e => setNewStaff({ ...newStaff, phone: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 p-1.5 text-xs rounded-md text-slate-100"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 block">Role</label>
                  <select
                    value={newStaff.roleType}
                    onChange={e => setNewStaff({ ...newStaff, roleType: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 p-1.5 text-xs rounded-md text-slate-100"
                  >
                    <option value="Station Manager">Station Manager</option>
                    <option value="Technician">Technician</option>
                    <option value="Operator">Operator</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 block">Permission Group</label>
                  <select
                    value={newStaff.permissionGroup}
                    onChange={e => setNewStaff({ ...newStaff, permissionGroup: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 p-1.5 text-xs rounded-md text-slate-100"
                  >
                    <option value="Staff">Staff</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowAddStaff(false)}
                  className="w-1/2 p-1 bg-slate-800 text-[10px] text-slate-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 p-1 bg-emerald-500 text-slate-950 font-bold text-[10px] rounded"
                >
                  Confirm Hire
                </button>
              </div>
            </form>
          )}

          <div className="divide-y divide-white/5">
            {staffList.map(staff => (
              <div key={staff.staffId} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-slate-200">{staff.name}</h4>
                  <p className="text-[10px] text-slate-400">{staff.roleType} • {staff.phone}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-1.5 py-0.5 text-[9px] font-semibold rounded ${
                    staff.permissionGroup === "Admin" ? "bg-purple-500/10 text-purple-400" : "bg-slate-800 text-slate-400"
                  }`}>
                    {staff.permissionGroup}
                  </span>
                  <button 
                    onClick={() => handleFireStaff(staff.staffId)}
                    className="text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PROMOTIONS BOARD */}
        <div className="bg-slate-900 border border-white/5 p-6 rounded-2xl space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" /> Promotional Posts
            </h3>
            <button 
              onClick={() => setShowAddPromo(!showAddPromo)}
              className="p-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-[10px] rounded-lg"
            >
              + Create Promo
            </button>
          </div>

          {showAddPromo && (
            <form onSubmit={handleAddPromoSubmit} className="p-3 bg-slate-950 border border-white/10 rounded-xl space-y-3">
              <div className="space-y-2">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 block">Promo Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Free Coffee while charging!"
                    value={newPromo.title}
                    onChange={e => setNewPromo({ ...newPromo, title: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 p-1.5 text-xs rounded-md text-slate-100"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 block">Promo Description</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Provide details about the discount or gift..."
                    value={newPromo.description}
                    onChange={e => setNewPromo({ ...newPromo, description: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 p-1.5 text-xs rounded-md text-slate-100"
                  />
                </div>
              </div>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowAddPromo(false)}
                  className="w-1/2 p-1 bg-slate-800 text-[10px] text-slate-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 p-1 bg-emerald-500 text-slate-950 font-bold text-[10px] rounded"
                >
                  Publish Promo
                </button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {promotions.map(promo => (
              <div key={promo.promoId} className="p-3 bg-slate-950 rounded-xl border border-white/5 flex items-start justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-200 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    {promo.title}
                  </h4>
                  <p className="text-slate-400 text-[11px] leading-relaxed">{promo.description}</p>
                  <p className="text-[9px] text-slate-500">Seen by {promo.views} local drivers</p>
                </div>
                <button 
                  onClick={() => handleDeletePromo(promo.promoId)}
                  className="text-slate-500 hover:text-rose-400 transition-colors pt-0.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- STATION CUSTOMER REVIEWS BOARD --- */}
      <div className="bg-slate-900 border border-white/5 p-6 rounded-2xl space-y-4 shadow-lg">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Star className="w-4 h-4 text-emerald-400" /> Driver Reviews & Check-Ins
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {reviews.map(review => (
            <div key={review.reviewId} className="p-4 bg-slate-950 border border-white/5 rounded-xl space-y-2 flex flex-col justify-between shadow-sm">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 text-xs">{review.user}</span>
                  <span className="text-[9px] text-slate-500">{review.date}</span>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-3.5 h-3.5 ${
                        i < review.rating ? "text-amber-400 fill-amber-400" : "text-slate-600"
                      }`} 
                    />
                  ))}
                </div>
                <p className="text-xs text-slate-400 pt-1 leading-relaxed italic">"{review.comment}"</p>
              </div>
              <p className="text-[10px] text-slate-500 font-bold uppercase pt-2 border-t border-white/5">
                EV Driver: {review.vehicle}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
