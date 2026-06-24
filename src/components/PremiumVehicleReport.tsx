import React, { useState, useEffect } from "react";
import { 
  Check, 
  Trash2, 
  Clock, 
  Sliders, 
  TrendingUp, 
  Activity, 
  Award, 
  AlertTriangle, 
  HelpCircle, 
  X, 
  FileText,
  ShieldCheck,
  Zap,
  Gauge
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";
import { VehicleProfile, MaintenanceRecord } from "../types";

interface PremiumVehicleReportProps {
  vehicles: VehicleProfile[];
  records: MaintenanceRecord[];
  onClose: () => void;
}

export default function PremiumVehicleReport({
  vehicles = [],
  records = [],
  onClose
}: PremiumVehicleReportProps) {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(vehicles[0]?.id || "");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any | null>(null);

  const vehicle = vehicles.find(v => v.id === selectedVehicleId) || vehicles[0];

  useEffect(() => {
    if (!vehicle) return;
    
    setLoading(true);
    const timer = setTimeout(() => {
      // Calculate dynamic values based on registered vehicle profile
      const isEV = vehicle.fuelType === "EV";
      const isHybrid = vehicle.fuelType === "Hybrid";
      
      const grade = isEV ? "A" : isHybrid ? "A-" : "B+";
      const carbonSaved = isEV ? 3.4 : isHybrid ? 1.8 : 0.4; // Tons per year
      const healthCoefficient = vehicle.year >= 2022 ? 95 : vehicle.year >= 2018 ? 85 : 72;
      
      // Calculate total actual expenses from records if any, otherwise randomize high-fidelity values
      const matchingRecords = records.filter(r => r.vehicleId === vehicle.id);
      const partsExpense = matchingRecords.reduce((acc, curr) => acc + (curr.cost || 0), 0) || (vehicle.year >= 2021 ? 120 : 450);
      
      const componentLifespans = [
        { subject: "High Volts battery", wear: isEV ? 91 : isHybrid ? 86 : 40, fullMark: 100 },
        { subject: "Brake Pads", wear: isEV || isHybrid ? 88 : 65, fullMark: 100 },
        { subject: "Transmission", wear: isEV ? 98 : 78, fullMark: 100 },
        { subject: "Engine Coolant", wear: isEV ? 100 : 80, fullMark: 100 },
        { subject: "Suspension Coils", wear: 74, fullMark: 100 },
        { subject: "Chassis & Wiring", wear: 92, fullMark: 100 }
      ];

      const expenseForecast = [
        { month: "Jan", parts: 15, labor: 10 },
        { month: "Mar", parts: isEV ? 5 : 45, labor: 20 },
        { month: "May", parts: 10, labor: 15 },
        { month: "Jul", parts: isEV ? 0 : 80, labor: 30 },
        { month: "Sep", parts: 20, labor: 15 },
        { month: "Nov", parts: isEV ? 10 : 120, labor: 40 }
      ];

      setReport({
        grade,
        carbonSaved,
        healthScore: healthCoefficient,
        partsExpense,
        componentLifespans,
        expenseForecast,
        criticalWarnings: vehicle.year <= 2015 ? ["Worn inverter seal check recommended", "Tire outer alignment offset"] : ["Routine scanner diagnostics recommended"],
        partsRecycleValue: isEV ? "$280 USD" : isHybrid ? "$190 USD" : "$95 USD"
      });
      setLoading(false);
    }, 850); // fast loading feedback

    return () => clearTimeout(timer);
  }, [selectedVehicleId, vehicle, records]);

  return (
    <div className="bg-slate-950 p-6 rounded-4xl border border-white/10 space-y-5 shadow-2xl relative overflow-hidden">
      
      {/* Background radial splash */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] bg-emerald-500/15 text-emerald-300 font-bold px-2 py-0.5 rounded uppercase tracking-wider block w-max select-none">
              Premium Tool Active
            </span>
            <h3 className="text-base font-black text-white leading-normal">
              Advanced Vehicle Maintenance Analyst
            </h3>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="p-1 px-2.5 text-xs bg-white/5 hover:bg-white/10 border border-white/5 text-slate-350 hover:text-white rounded-xl transition font-sans cursor-pointer flex items-center gap-1"
        >
          <X className="w-4 h-4" /> Exit Report
        </button>
      </div>

      {vehicles.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/20 rounded-3xl border border-white/5 border-dashed">
          <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-slate-300">No Vehicles Registered</h4>
          <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
            Please register at least one vehicle in your profile tab before generating advanced telemetry reports.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Select vehicle dropdown */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-3xl border border-white/5">
            <div className="text-left font-sans">
              <label className="text-[10px] text-slate-500 font-bold uppercase block tracking-wider font-mono">Select Vehicle Target</label>
              <select
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                className="bg-slate-950 text-xs text-slate-200 mt-1 p-2 px-3 rounded-xl border border-white/10 focus:outline-none focus:border-emerald-500/50 cursor-pointer min-w-[200px]"
              >
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>
                    🚙 {v.brand} {v.model} ({v.year}) - {v.fuelType}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-left md:text-right">
              <span className="text-[9.5px] text-slate-500 block uppercase font-bold font-mono">Telemetry Standard</span>
              <span className="text-xs bg-emerald-500/10 text-emerald-300 font-mono font-bold px-2 py-0.5 rounded border border-emerald-500/15 inline-block mt-1">
                Connected OBD-II Simulation Active
              </span>
            </div>
          </div>

          {loading || !report ? (
            <div className="py-24 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-400 font-mono">Simulating diagnostic scanner sweeps...</p>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in text-left">
              
              {/* BENTO HEALTH STATUS SUMMARIES */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                
                <div className="bg-slate-900/50 p-4 rounded-3xl border border-white/5 flex flex-col justify-between">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block font-mono">Maintenance Grade</span>
                  <div className="py-2">
                    <span className="text-3xl font-mono font-black text-emerald-400">{report.grade}</span>
                  </div>
                  <span className="text-[9.5px] text-emerald-550/80 text-emerald-500 font-sans">Top 15% in platform</span>
                </div>

                <div className="bg-slate-900/50 p-4 rounded-3xl border border-white/5 flex flex-col justify-between">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block font-mono">Annual Carbon Mitigation</span>
                  <div className="py-2 flex items-baseline gap-1">
                    <span className="text-3xl font-mono font-black text-emerald-400">{report.carbonSaved}</span>
                    <span className="text-xs text-slate-350">Tons CO₂</span>
                  </div>
                  <span className="text-[9.5px] text-slate-400">Equivalent to 40 planted trees</span>
                </div>

                <div className="bg-slate-900/50 p-4 rounded-3xl border border-white/5 flex flex-col justify-between">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block font-mono">Estimated Health Metric</span>
                  <div className="py-2 flex items-baseline gap-1">
                    <span className="text-3xl font-mono font-black text-amber-400">{report.healthScore}</span>
                    <span className="text-xs text-slate-350">/100</span>
                  </div>
                  <span className="text-[9.5px] text-slate-400">System sensors check safe</span>
                </div>

                <div className="bg-slate-900/50 p-4 rounded-3xl border border-white/5 flex flex-col justify-between">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block font-mono">Obsolete Part Recycle Worth</span>
                  <div className="py-2">
                    <span className="text-2xl font-mono font-black text-white">{report.partsRecycleValue}</span>
                  </div>
                  <span className="text-[9.5px] text-slate-400">Scrap metal/battery reclaim</span>
                </div>

              </div>

              {/* CORE VISUAL CHARTS ROW (RADAR DIAGRAM + EXPENSE FORECAST) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                
                {/* Component wear radar */}
                <div className="lg:col-span-5 bg-slate-900/40 p-5 rounded-4xl border border-white/5 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-wider mb-1">Component Lifespan Degradation</h4>
                    <span className="text-[10px] text-slate-500">OBD-II feedback wear index (100 = Brand New condition)</span>
                  </div>

                  <div className="h-64 flex items-center justify-center pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={report.componentLifespans}>
                        <PolarGrid stroke="rgba(255,255,255,0.08)" />
                        <PolarAngleAxis dataKey="subject" stroke="#aaa" fontSize={9.5} />
                        <PolarRadiusAxis stroke="#666" fontSize={8.5} />
                        <Radar name="Component Integrity" dataKey="wear" stroke="#10b981" fill="#10b981" fillOpacity={0.25} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Yearly forecast bar chart */}
                <div className="lg:col-span-7 bg-slate-900/40 p-5 rounded-4xl border border-white/5 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-wider mb-1">Parts & Labor 12-Month Projection</h4>
                    <span className="text-[10px] text-slate-500 font-sans">Predicted intervals of essential spare replacements (USD equivalencies)</span>
                  </div>

                  <div className="h-64 pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={report.expenseForecast}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="month" stroke="#888" fontSize={11} />
                        <YAxis stroke="#888" fontSize={11} width={25} />
                        <Tooltip contentStyle={{ background: "#0c0d12", border: "1px solid rgba(255,255,255,0.1)", fontSize: "11px" }} />
                        <Legend wrapperStyle={{ fontSize: "10.5px" }} />
                        <Bar dataKey="parts" name="Parts Cost (Calculated matches)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="labor" name="Estimated Workshop Labor" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>

              {/* CRITICAL PARTS WARNINGS & AI RECOMMENDATIONS LIST */}
              <div className="bg-slate-900/30 p-4 rounded-3xl border border-white/5 space-y-3">
                <span className="text-[10px] font-black text-amber-400 block uppercase tracking-wider font-mono">Diagnostic Warnings & Suggested Care Sourcing</span>
                
                <div className="divide-y divide-white/5">
                  {report.criticalWarnings.map((warn: string, idx: number) => (
                    <div key={idx} className="py-2.5 flex items-start gap-3 text-xs leading-relaxed text-slate-300">
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-white block">Detected Issue {idx + 1}</span>
                        <p className="text-slate-400">{warn}. Look up recycled alternatives in the Care Coin board or request a Partner checklist scan.</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <span className="text-[10.5px] text-slate-400">
                    💡 <span className="font-bold text-emerald-400">Recycled parts benefit:</span> Sourcing recycled parts on the board could save you over $400 USD annually on maintenance.
                  </span>
                  <button 
                    onClick={() => alert("Printing Report Simulation initiated. PDF file downloaded as 'MyCarCare_OBDIIReport.pdf'")} 
                    className="py-1.5 px-3 bg-emerald-500 text-slate-950 font-black text-xs rounded-xl cursor-pointer hover:bg-emerald-600 transition"
                  >
                    Download Printed Copy
                  </button>
                </div>

              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
}
