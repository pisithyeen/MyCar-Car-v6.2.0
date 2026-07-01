/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Fuel, 
  Zap, 
  Sparkles, 
  CheckCircle, 
  AlertTriangle, 
  Activity, 
  Search, 
  RefreshCw, 
  TrendingUp, 
  Database, 
  Coins, 
  Award,
  Bell,
  Code
} from "lucide-react";

interface StationDashboardProps {
  onRefreshData: () => void;
  userProfile: any;
}

export default function StationDashboard({ onRefreshData, userProfile }: StationDashboardProps) {
  // Mode selection: "petrol" or "ev"
  const [stationMode, setStationMode] = useState<"petrol" | "ev">("petrol");

  // Gas tanks simulation
  const [gasTanks, setGasTanks] = useState([
    { id: "t1", name: "Premium Ron 95 Gasoline", level: 92, capacity: "15,000 L", temperature: "25.2°C" },
    { id: "t2", name: "Diesel Euro 5 Superior", level: 74, capacity: "20,000 L", temperature: "24.8°C" },
    { id: "t3", name: "Super Ron 98 Racing Unleaded", level: 41, capacity: "8,000 L", temperature: "26.0°C" }
  ]);

  // EV charging terminals
  const [chargingBays, setChargingBays] = useState([
    { id: "ev1", type: "CCS2 120kW Supercharger", activeDraw: "112 kW", user: "BYD Atto 3", stateOfCharge: 71, deliveredKwh: "42.5", cost: "15.30", status: "Active Charging" },
    { id: "ev2", type: "CCS2 120kW Supercharger", activeDraw: "0 kW", user: "-", stateOfCharge: 0, deliveredKwh: "-", cost: "-", status: "Available" },
    { id: "ev3", type: "GB/T EV Fast Charger 60kW", activeDraw: "58 kW", user: "GWM Ora Good Cat", stateOfCharge: 88, deliveredKwh: "28.1", cost: "8.40", status: "Active Charging" }
  ]);

  // Reward Code inputs
  const [rewardCode, setRewardCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponResult, setCouponResult] = useState<any>(null);

  // Quick ev/fuel logging transaction form
  const [evUser, setEvUser] = useState("BYD Sealion 6");
  const [evKwh, setEvKwh] = useState("35");
  const [evCost, setEvCost] = useState("11.50");
  const [evSuccess, setEvSuccess] = useState(false);

  // Petrol logging state
  const [petrolUser, setPetrolUser] = useState("Toyota Prius 2010");
  const [petrolLiters, setPetrolLiters] = useState("25");
  const [petrolCost, setPetrolCost] = useState("31.25");
  const [petrolSuccess, setPetrolSuccess] = useState(false);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rewardCode.trim()) return;

    setCouponLoading(true);
    setCouponResult(null);

    setTimeout(() => {
      setCouponLoading(false);
      const codeClean = rewardCode.trim().toUpperCase();
      if (codeClean.includes("MONSOON") || codeClean.includes("MYCAR")) {
        setCouponResult({
          valid: true,
          discount: "15% OFF Fuel Dispensation or Free EV Diagnostic Scan",
          expires: "June 15, 2026",
          description: "Cambodia Safety promo active."
        });
      } else {
        setCouponResult({
          valid: false,
          error: "Invalid or expired rewards code tag. Please scan active Car Owner pass."
        });
      }
    }, 1000);
  };

  const handleEvLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEvSuccess(true);
    setTimeout(() => {
      setEvSuccess(false);
      setEvUser("");
      setEvKwh("30");
      setEvCost("9.90");
    }, 4000);
  };

  const handlePetrolLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPetrolSuccess(true);
    setTimeout(() => {
      setPetrolSuccess(false);
      setPetrolUser("");
      setPetrolLiters("20");
      setPetrolCost("25.00");
    }, 4000);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. TOP STATS ROW & SEGMENTED TABS */}
      <div className="bg-gradient-to-r from-amber-500/10 to-indigo-500/5 p-6 rounded-3xl border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20 uppercase tracking-wider animate-pulse">
                Energy Partner Sector
              </span>
              <span className="text-slate-500 text-xs">•</span>
              <span className="text-slate-350 text-xs flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Active Grid Status: Connected
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-100 tracking-tight mt-1.5">
              {stationMode === "petrol" ? "Petrol Dispensation Station" : "EV Fast-Charging Grid Terminal"}
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              {stationMode === "petrol" 
                ? "Track fuel dispenser bulk levels, coordinate fuel grades (Ron 95/Diesel/Ron 98), record pump sessions, and inspect reward coupons."
                : "Monitor high-voltage charging bays (CCS2 / GB/T), track live BMS grid draws, record delivered KWh sessions, and log fast charging metrics."
              }
            </p>
          </div>

          {/* Mode Switcher Toggle */}
          <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-white/5 shrink-0 select-none">
            <button
              onClick={() => setStationMode("petrol")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                stationMode === "petrol" 
                  ? "bg-amber-500 text-slate-950 shadow-md" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Fuel className="w-3.5 h-3.5" />
              <span>Petrol Station Mode</span>
            </button>
            <button
              onClick={() => setStationMode("ev")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                stationMode === "ev" 
                  ? "bg-indigo-500 text-slate-100 shadow-md" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>EV Charging Mode</span>
            </button>
          </div>
        </div>

        {/* Dynamic Diagnostic KPIs depending on station mode */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {stationMode === "petrol" ? (
            <>
              <div className="glass p-3 rounded-xl border border-white/5 bg-white/2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Bulk Petrol Stock</span>
                <div className="flex justify-between items-baseline mt-1 font-mono">
                  <span className="text-lg font-black text-white">23,000 L</span>
                  <span className="text-[9px] text-emerald-400 font-bold">Optimal</span>
                </div>
              </div>
              <div className="glass p-3 rounded-xl border border-white/5 bg-white/2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Euro 5 Diesel Stock</span>
                <div className="flex justify-between items-baseline mt-1 font-mono">
                  <span className="text-lg font-black text-white">14,800 L</span>
                  <span className="text-[9px] text-emerald-400 font-bold">Good</span>
                </div>
              </div>
              <div className="glass p-3 rounded-xl border border-white/5 bg-white/2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Scanned Coupons</span>
                <div className="flex justify-between items-baseline mt-1 font-mono">
                  <span className="text-lg font-black text-white">18 Codes</span>
                  <span className="text-[9px] text-amber-400 font-bold">+5% Today</span>
                </div>
              </div>
              <div className="glass p-3 rounded-xl border border-white/5 bg-white/2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Sales (June 2026)</span>
                <div className="flex justify-between items-baseline mt-1 font-mono">
                  <span className="text-lg font-black text-amber-400">$8,450.00</span>
                  <span className="text-[9px] text-slate-400">USD</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="glass p-3 rounded-xl border border-white/5 bg-white/2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Charging Draw</span>
                <div className="flex justify-between items-baseline mt-1 font-mono">
                  <span className="text-lg font-black text-white">170 kW</span>
                  <span className="text-[9px] text-amber-400 font-bold">85% Draw</span>
                </div>
              </div>
              <div className="glass p-3 rounded-xl border border-white/5 bg-white/2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Active Charging Bays</span>
                <div className="flex justify-between items-baseline mt-1 font-mono">
                  <span className="text-lg font-black text-white">2 Bays</span>
                  <span className="text-[9px] text-emerald-400 font-bold">Busy</span>
                </div>
              </div>
              <div className="glass p-3 rounded-xl border border-white/5 bg-white/2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Energy Dispatched</span>
                <div className="flex justify-between items-baseline mt-1 font-mono">
                  <span className="text-lg font-black text-sky-400 font-bold">14,230 KWh</span>
                  <span className="text-[9px] text-slate-400 font-bold">Cambodia Co</span>
                </div>
              </div>
              <div className="glass p-3 rounded-xl border border-white/5 bg-white/2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Grid Efficiency</span>
                <div className="flex justify-between items-baseline mt-1 font-mono">
                  <span className="text-lg font-black text-emerald-400">98.4%</span>
                  <span className="text-[9px] text-emerald-400 font-bold">Excellent</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 2. MAIN SPECIFIC CONTENT BASED ON SELECTED STATION MODE */}
      {stationMode === "petrol" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn">
          {/* LEFT PANEL: Dispenser Stock levels */}
          <div className="lg:col-span-5 glass rounded-2xl p-5 border border-white/10 space-y-4 bg-white/2">
            <div className="border-b border-white/10 pb-2.5 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Fuel className="w-5 h-5 text-amber-400" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-200">Fuel Dispensers Storage</h3>
              </div>
            </div>

            <div className="space-y-4 pt-1">
              {gasTanks.map((tank) => (
                <div key={tank.id} className="space-y-1.5 bg-slate-950/40 p-3 rounded-xl border border-white/5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-200">{tank.name}</span>
                    <span className="font-mono text-amber-400">{tank.level}%</span>
                  </div>
                  
                  <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className={`h-full rounded-full bg-gradient-to-r ${
                        tank.level > 80 ? "from-emerald-500 to-emerald-400" :
                        tank.level > 40 ? "from-amber-500 to-amber-400" : "from-rose-500 to-rose-450 animate-pulse"
                      }`}
                      style={{ width: `${tank.level}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>Capacity: {tank.capacity}</span>
                    <span>Temp: {tank.temperature}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Petrol Station Location and Profile details */}
            <div className="pt-4 border-t border-white/5 space-y-3">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">Dispensation Profile Details</span>
              <div className="bg-slate-950/40 border border-white/5 rounded-xl p-3 text-xs space-y-2">
                <div className="flex justify-between text-slate-400">
                  <span>Outlet Name:</span>
                  <span className="text-slate-200 font-bold">{userProfile?.businessName || "Sokha Energy Station"}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Cambodia Region:</span>
                  <span className="text-slate-200 font-bold">Phnom Penh, C-District</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Coordinate Location:</span>
                  <span className="text-slate-200 font-mono">11.5564° N, 104.9282° E</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Operating Mode:</span>
                  <span className="text-emerald-400 font-bold">24 Hours (Active)</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: Rewards Validation & Petrol Dispenser Logging */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Coupon Rewards validation */}
            <div className="glass rounded-2xl p-5 border border-white/10 space-y-4 bg-white/2">
              <div className="border-b border-white/10 pb-2.5">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-200 flex items-center gap-1.5">
                  <Award className="w-4.5 h-4.5 text-amber-400" />
                  <span>Rewards Coupon Validation</span>
                </h3>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Enter code or barcode text provided from a Customer Owner's profile page (e.g. <strong>MONSOON-SAFETY-2026</strong> or <strong>MYCAR-OIL-SAVE</strong>) to validate point benefits live.
              </p>

              <form onSubmit={handleApplyCoupon} className="space-y-3.5">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={rewardCode}
                    onChange={(e) => setRewardCode(e.target.value)}
                    required
                    placeholder="e.g. MONSOON-SAFETY-2026"
                    className="flex-1 bg-slate-950 border border-white/10 p-2.5 text-xs rounded-xl focus:outline-none focus:border-amber-500/40 font-mono text-slate-100 uppercase"
                  />
                  <button
                    type="submit"
                    disabled={couponLoading}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl transition shrink-0 cursor-pointer"
                  >
                    {couponLoading ? "Checking..." : "Verify Code"}
                  </button>
                </div>

                {couponResult && (
                  <div className={`p-3.5 rounded-xl border text-xs leading-normal animate-fadeIn ${
                    couponResult.valid 
                      ? "bg-emerald-500/10 border-emerald-500/15 text-emerald-400" 
                      : "bg-rose-500/10 border-rose-500/15 text-rose-450 animate-pulse"
                  }`}>
                    {couponResult.valid ? (
                      <div className="space-y-1">
                        <div className="font-extrabold flex items-center gap-1 uppercase text-slate-200">
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                          <span>Coupon active & Verified!</span>
                        </div>
                        <p className="font-bold text-slate-350">{couponResult.discount}</p>
                        <span className="text-[10px] block text-slate-500">Validity until: {couponResult.expires}</span>
                      </div>
                    ) : (
                      <div className="flex items-start gap-1.5 text-rose-400">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>{couponResult.error}</span>
                      </div>
                    )}
                  </div>
                )}
              </form>
            </div>

            {/* Log Petrol Receipt form */}
            <div className="glass rounded-2xl p-5 border border-white/10 space-y-4 bg-white/2">
              <div className="border-b border-white/10 pb-2.5">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-200 flex items-center gap-1.5">
                  <Activity className="w-4.5 h-4.5 text-amber-400" />
                  <span>Log Fuel Dispensation Session</span>
                </h3>
              </div>

              <form onSubmit={handlePetrolLogSubmit} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Customer Vehicle Model</label>
                    <input
                      type="text"
                      required
                      value={petrolUser}
                      onChange={(e) => setPetrolUser(e.target.value)}
                      placeholder="e.g. Toyota Prius 2010"
                      className="w-full bg-slate-950 border border-white/10 p-2 rounded-lg text-slate-100 font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Liters</label>
                      <input
                        type="number"
                        required
                        value={petrolLiters}
                        onChange={(e) => setPetrolLiters(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 p-2 rounded-lg font-mono text-slate-100 font-medium"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Total ($)</label>
                      <input
                        type="text"
                        required
                        value={petrolCost}
                        onChange={(e) => setPetrolCost(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 p-2 rounded-lg font-mono text-slate-100 font-medium"
                      />
                    </div>
                  </div>
                </div>

                {petrolSuccess && (
                  <div className="bg-emerald-500/15 border border-emerald-500/25 p-2.5 rounded-xl text-[10.5px] text-emerald-400 flex items-center gap-1.5 animate-bounce">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>Fuel dispensation session transaction uploaded to customer's cloud database.</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-[11px] font-extrabold rounded-xl transition cursor-pointer uppercase tracking-wider"
                >
                  Log Dispensation Ticket
                </button>
              </form>
            </div>

          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn">
          {/* LEFT PANEL: CCS2 Charger bays */}
          <div className="lg:col-span-7 glass rounded-2xl p-5 border border-white/10 space-y-4 bg-white/2">
            <div className="border-b border-white/10 pb-2.5 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Zap className="w-5 h-5 text-indigo-400" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-200">EV Charger Station Monitor (Live)</h3>
              </div>
              <span className="text-[10px] bg-indigo-400/10 text-indigo-300 font-bold px-2 py-0.5 rounded border border-indigo-400/20">
                High-voltage Network v2
              </span>
            </div>

            <div className="space-y-3">
              {chargingBays.map((bay) => (
                <div key={bay.id} className="p-3 bg-slate-950/40 border border-white/5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-200">{bay.type}</span>
                      <span className={`text-[8px] px-1.5 py-0.2 rounded font-black uppercase ${
                        bay.status === 'Active Charging' ? "bg-indigo-500/15 text-indigo-400 animate-pulse" : "bg-emerald-500/10 text-emerald-400"
                      }`}>
                        {bay.status}
                      </span>
                    </div>
                    <p className="text-[10.5px] text-slate-400">
                      Active Draw: <strong className="text-slate-200 font-mono">{bay.activeDraw}</strong> • Current Vehicle: <strong className="text-amber-400">{bay.user}</strong>
                    </p>
                  </div>

                  {bay.status === 'Active Charging' ? (
                    <div className="flex items-center gap-4 shrink-0 font-mono text-[11px]">
                      <div className="space-y-1 select-none">
                        <span className="text-[9px] text-slate-500 block uppercase font-bold">Charge SOC</span>
                        <div className="flex items-center gap-1">
                          <div className="w-8 h-3.5 bg-white/5 border border-white/10 rounded overflow-hidden flex">
                            <div className="bg-indigo-400 h-full" style={{ width: `${bay.stateOfCharge}%` }} />
                          </div>
                          <span className="text-slate-350">{bay.stateOfCharge}%</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[9px] text-slate-500 block uppercase font-bold">Delivered energy</span>
                        <span className="text-slate-200">{bay.deliveredKwh} KWh (${bay.cost})</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-slate-500 text-[10px] font-mono shrink-0">READY FOR DISPATCH</div>
                  )}
                </div>
              ))}
            </div>

            {/* Grid Telemetry & Specs */}
            <div className="pt-4 border-t border-white/5 space-y-3">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">Charger Station Specifications</span>
              <div className="bg-slate-950/40 border border-white/5 rounded-xl p-3 text-xs space-y-2">
                <div className="flex justify-between text-slate-400">
                  <span>Grid Capacity Limit:</span>
                  <span className="text-indigo-400 font-mono font-bold">300 kW Max load</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Plug Standards:</span>
                  <span className="text-slate-200 font-bold">CCS Type 2 / GB/T DC Fast Charging</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Location District:</span>
                  <span className="text-slate-200 font-bold">Boeng Keng Kang, Phnom Penh</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Partner ID:</span>
                  <span className="text-slate-400 font-mono">EV-GRID-KH-0895</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: EV Coupon Verification & EV Session Draw Logger */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* EV Coupon validation */}
            <div className="glass rounded-2xl p-5 border border-white/10 space-y-4 bg-white/2">
              <div className="border-b border-white/10 pb-2.5">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-200 flex items-center gap-1.5">
                  <Award className="w-4.5 h-4.5 text-indigo-400" />
                  <span>EV Charge Voucher Validation</span>
                </h3>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Scan or enter promotional codes provided from an EV owner's pass for diagnostic and charging voucher credits.
              </p>

              <form onSubmit={handleApplyCoupon} className="space-y-3.5">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={rewardCode}
                    onChange={(e) => setRewardCode(e.target.value)}
                    required
                    placeholder="e.g. MONSOON-EV-FAST"
                    className="flex-1 bg-slate-950 border border-white/10 p-2.5 text-xs rounded-xl focus:outline-none focus:border-indigo-500/40 font-mono text-slate-100 uppercase"
                  />
                  <button
                    type="submit"
                    disabled={couponLoading}
                    className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-slate-100 text-xs font-bold rounded-xl transition shrink-0 cursor-pointer"
                  >
                    {couponLoading ? "Checking..." : "Verify Code"}
                  </button>
                </div>

                {couponResult && (
                  <div className={`p-3.5 rounded-xl border text-xs leading-normal animate-fadeIn ${
                    couponResult.valid 
                      ? "bg-emerald-500/10 border-emerald-500/15 text-emerald-400" 
                      : "bg-rose-500/10 border-rose-500/15 text-rose-450 animate-pulse"
                  }`}>
                    {couponResult.valid ? (
                      <div className="space-y-1">
                        <div className="font-extrabold flex items-center gap-1 uppercase text-slate-200">
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                          <span>Voucher Verified!</span>
                        </div>
                        <p className="font-bold text-slate-350">{couponResult.discount}</p>
                        <span className="text-[10px] block text-slate-500">Validity until: {couponResult.expires}</span>
                      </div>
                    ) : (
                      <div className="flex items-start gap-1.5 text-rose-400">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>{couponResult.error}</span>
                      </div>
                    )}
                  </div>
                )}
              </form>
            </div>

            {/* EV session logger */}
            <div className="glass rounded-2xl p-5 border border-white/10 space-y-4 bg-white/2">
              <div className="border-b border-white/10 pb-2.5">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-200 flex items-center gap-1.5">
                  <Activity className="w-4.5 h-4.5 text-indigo-400" />
                  <span>Log Non-Grid Energy Draw</span>
                </h3>
              </div>

              <form onSubmit={handleEvLogSubmit} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Charged Vehicle Model</label>
                    <input
                      type="text"
                      required
                      value={evUser}
                      onChange={(e) => setEvUser(e.target.value)}
                      placeholder="e.g. BYD Sealion 6"
                      className="w-full bg-slate-950 border border-white/10 p-2 rounded-lg text-slate-100 font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">KWh</label>
                      <input
                        type="number"
                        required
                        value={evKwh}
                        onChange={(e) => setEvKwh(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 p-2 rounded-lg font-mono text-slate-100 font-medium"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Cost ($)</label>
                      <input
                        type="text"
                        required
                        value={evCost}
                        onChange={(e) => setEvCost(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 p-2 rounded-lg font-mono text-slate-100 font-medium"
                      />
                    </div>
                  </div>
                </div>

                {evSuccess && (
                  <div className="bg-emerald-500/15 border border-emerald-500/25 p-2.5 rounded-xl text-[10.5px] text-emerald-400 flex items-center gap-1.5 animate-bounce">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>Station energy Draw transaction recorded successfully.</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-slate-100 text-[11px] font-extrabold rounded-xl transition cursor-pointer uppercase tracking-wider"
                >
                  Post Energy Dispensation Receipt
                </button>
              </form>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
