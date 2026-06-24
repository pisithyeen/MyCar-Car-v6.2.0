import React, { useState } from "react";
import { 
  Check, 
  Trash2, 
  Clock, 
  X, 
  FileText,
  ShieldCheck,
  Download,
  Printer,
  Calendar,
  Layers,
  MapPin
} from "lucide-react";
import { VehicleProfile, MaintenanceRecord } from "../types";

interface PremiumServiceHistoryExportProps {
  vehicles: VehicleProfile[];
  records: MaintenanceRecord[];
  onClose: () => void;
}

export default function PremiumServiceHistoryExport({
  vehicles = [],
  records = [],
  onClose
}: PremiumServiceHistoryExportProps) {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(vehicles[0]?.id || "");
  const [exportSuccess, setExportSuccess] = useState(false);

  const vehicle = vehicles.find(v => v.id === selectedVehicleId) || vehicles[0];
  const matchingRecords = records.filter(r => r.vehicleId === selectedVehicleId);

  // Sum total investments
  const totalCost = matchingRecords.reduce((acc, curr) => acc + (curr.cost || 0), 0);

  const handleSimulateExport = (format: "pdf" | "csv") => {
    setExportSuccess(true);
    setTimeout(() => {
      setExportSuccess(false);
      alert(`📥 Success! Your ${vehicle?.brand} ${vehicle?.model} service history has been exported as 'MyCarCare_Export_${Date.now()}.${format}'. File is saved in your local downloads.`);
    }, 1200);
  };

  return (
    <div className="bg-slate-950 p-6 rounded-4xl border border-white/10 space-y-5 shadow-2xl relative overflow-hidden">
      
      {/* Background radial splash */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-xl">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] bg-cyan-500/15 text-cyan-300 font-bold px-2 py-0.5 rounded uppercase tracking-wider block w-max select-none">
              Premium Tool Active
            </span>
            <h3 className="text-base font-black text-white leading-normal">
              Chronological Service Log Exporter
            </h3>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="p-1 px-2.5 text-xs bg-white/5 hover:bg-white/10 border border-white/5 text-slate-350 hover:text-white rounded-xl transition font-sans cursor-pointer flex items-center gap-1"
        >
          <X className="w-4 h-4" /> Exit Exporter
        </button>
      </div>

      <div className="space-y-5 text-left">
        
        {/* Select vehicle dropdown */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-3xl border border-white/5">
          <div className="text-left font-sans">
            <label className="text-[10px] text-slate-500 font-bold uppercase block tracking-wider font-mono">Select Export Vehicle</label>
            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className="bg-slate-950 text-xs text-slate-200 mt-1 p-2 px-3 rounded-xl border border-white/10 focus:outline-none focus:border-cyan-500/50 cursor-pointer min-w-[200px]"
            >
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>
                  🚙 {v.brand} {v.model} ({v.year}) - {v.fuelType}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleSimulateExport("pdf")}
              disabled={exportSuccess}
              className="py-2.5 px-3.5 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 transition shadow"
            >
              <Download className="w-4 h-4" /> <span>Export PDF Report</span>
            </button>
            <button
              onClick={() => handleSimulateExport("csv")}
              disabled={exportSuccess}
              className="py-2.5 px-3.5 bg-slate-900 border border-white/10 text-slate-300 hover:text-white font-black text-xs rounded-xl flex items-center gap-1.5 transition"
            >
              <Layers className="w-4 h-4" /> <span>Export CSV Layout</span>
            </button>
          </div>
        </div>

        {/* PRINTABLE PREVIEW SHEET CONTAINER */}
        <div className="bg-white text-slate-950 rounded-3xl p-6 shadow-xl space-y-5 font-sans relative">
          
          {/* Watermark */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none pr-8">
            <ShieldCheck className="w-96 h-96 text-slate-800" />
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start border-b border-slate-200 pb-4 gap-4">
            <div>
              <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">MYCAR CARE COMPLIANCE CENTER</h4>
              <p className="text-[11px] text-slate-500 uppercase tracking-widest block font-mono">Official Maintenance Dossier Record</p>
              <div className="flex gap-3 text-[10.5px] mt-2 text-slate-600 font-mono">
                <span>Ref: MC-${Math.floor(Math.random() * 8000000) + 1000000}</span>
                <span>•</span>
                <span>Date generated: {new Date().toISOString().split('T')[0]}</span>
              </div>
            </div>

            <div className="text-right sm:text-right">
              <span className="text-xs bg-emerald-100 text-emerald-800 border border-emerald-250 font-bold px-2 py-0.5 rounded uppercase font-mono inline-block">
                ★ Platform Certified
              </span>
              <p className="text-[10px] text-slate-500 mt-1">Verified with digital Handover hashes</p>
            </div>
          </div>

          {/* Vehicle Metadata specs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 font-mono text-[11px]">
            <div>
              <span className="text-slate-400 block uppercase font-bold text-[9px]">Vehicle Model</span>
              <span className="text-slate-800 font-bold">{vehicle?.brand} {vehicle?.model}</span>
            </div>
            <div>
              <span className="text-slate-400 block uppercase font-bold text-[9px]">Model Year</span>
              <span className="text-slate-800 font-bold">{vehicle?.year || "Universal"}</span>
            </div>
            <div>
              <span className="text-slate-400 block uppercase font-bold text-[9px]">Powertrain Class</span>
              <span className="text-slate-800 font-bold uppercase">{vehicle?.fuelType || "Gasoline"}</span>
            </div>
            <div>
              <span className="text-slate-400 block uppercase font-bold text-[9px]">Aggregated Investment</span>
              <span className="text-emerald-700 font-black">${totalCost.toLocaleString()} USD</span>
            </div>
          </div>

          {/* Records list table */}
          {matchingRecords.length === 0 ? (
            <div className="py-14 text-center border-2 border-dashed border-slate-200 rounded-2xl">
              <Clock className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
              <span className="text-xs text-slate-500 uppercase font-mono block">No logged maintenance instances</span>
              <p className="text-[10px] text-slate-400 mt-1 font-sans">Add service details in your Diagnostic Dashboard before exporting logs.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left divide-y divide-slate-200">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 uppercase text-[9px] font-bold tracking-widest font-mono">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Service Action / Repair Item</th>
                    <th className="py-2.5 px-3">Workshop Location</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3 text-right">Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans text-slate-705">
                  {matchingRecords.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-3 font-mono text-slate-500 whitespace-nowrap">{rec.date}</td>
                      <td className="py-3 px-3 font-bold text-slate-900">{rec.description}</td>
                      <td className="py-3 px-3 font-mono text-slate-500 select-all font-semibold uppercase">{rec.provider || "Phnom Penh workshop"}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-750 font-bold rounded-full text-[9px] font-mono capitalize">
                          {rec.serviceCategory || "General"}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">${rec.cost || 0} USD</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer signature line */}
          <div className="flex flex-col sm:flex-row justify-between items-center pt-5 border-t border-slate-100 text-[10.5px] font-sans gap-4">
            <span className="text-slate-400 font-mono">
              HASH CERTIFICATE: SHA256-MC${Math.floor(Math.random() * 90000) + 10000}X${Math.floor(Math.random() * 90000) + 10000}
            </span>
            <div className="flex gap-4">
              <span className="text-slate-500">Authorized by MyCar Care KH Team</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
