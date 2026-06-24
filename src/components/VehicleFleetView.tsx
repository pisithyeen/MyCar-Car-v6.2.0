import React from "react";
import { 
  Car, 
  MapPin, 
  Wrench, 
  Clock, 
  QrCode, 
  Calendar, 
  Sparkles, 
  AlertTriangle, 
  Maximize2, 
  FileText,
  Activity,
  Heart,
  Settings,
  ShieldAlert,
  ChevronRight,
  Plus
} from "lucide-react";
import { VehicleProfile, Appointment } from "../types";

interface VehicleFleetProps {
  vehicles: VehicleProfile[];
  records: any[];
  pendingRequests: any[];
  appointments: Appointment[];
  onSelectVehicle: (v: VehicleProfile) => void;
  onOpenQr: (v: VehicleProfile) => void;
  onAddVehicle: () => void;
  onBookGarage: (v: VehicleProfile) => void;
}

// Map beautiful curated photos for default models of Cambodia MyCar Care
const getVehiclePhoto = (id: string, brand: string, model: string): string => {
  const brandLower = brand.toLowerCase();
  if (brandLower.includes("tacoma")) {
    return "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600";
  }
  if (brandLower.includes("byd") || brandLower.includes("shark")) {
    return "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=600"; // Sleek crossover/PHEV
  }
  if (brandLower.includes("porter") || brandLower.includes("hyundai")) {
    return "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=600"; // Carrier flatbed
  }
  if (brandLower.includes("ranger") || brandLower.includes("ford")) {
    return "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600";
  }
  if (brandLower.includes("lexus") || brandLower.includes("rx")) {
    return "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=600";
  }
  return "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=600";
};

export default function VehicleFleetView({
  vehicles,
  records,
  pendingRequests,
  appointments,
  onSelectVehicle,
  onOpenQr,
  onAddVehicle,
  onBookGarage
}: VehicleFleetProps) {
  const [fleetFilter, setFleetFilter] = React.useState<'active_fleet' | 'sold' | 'archived'>('active_fleet');

  const filteredVehicles = vehicles.filter(v => {
    const status = v.status || 'Active';
    if (fleetFilter === 'active_fleet') {
      return status === 'Active' || status === 'Inactive' || status === 'Under Repair';
    }
    if (fleetFilter === 'sold') {
      return status === 'Sold/Transferred';
    }
    if (fleetFilter === 'archived') {
      return status === 'Archived';
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Upper Registry Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
            <Car className="w-5 h-5 text-sky-400" />
            <span>My Registered Vehicles Fleet</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage official maintenance histories, scan barcodes, and authorize digital service updates for {vehicles.length} cars.
          </p>
        </div>
        <button
          onClick={onAddVehicle}
          className="p-2.5 px-4 bg-sky-500 hover:bg-sky-600 text-slate-950 rounded-xl flex items-center justify-center gap-1.5 font-bold text-xs transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-slate-950" />
          <span>Register New Car</span>
        </button>
      </div>

      {vehicles.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 p-1 bg-slate-900/60 rounded-xl border border-white/5 w-fit">
          <button
            onClick={() => setFleetFilter('active_fleet')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${fleetFilter === 'active_fleet' ? 'bg-sky-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Active Fleet ({vehicles.filter(v => !(v.status === 'Sold/Transferred' || v.status === 'Archived')).length})
          </button>
          <button
            onClick={() => setFleetFilter('sold')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${fleetFilter === 'sold' ? 'bg-sky-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Sold & Transferred ({vehicles.filter(v => v.status === 'Sold/Transferred').length})
          </button>
          <button
            onClick={() => setFleetFilter('archived')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${fleetFilter === 'archived' ? 'bg-sky-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Archived Fleet ({vehicles.filter(v => v.status === 'Archived').length})
          </button>
        </div>
      )}

      {vehicles.length === 0 ? (
        <div className="glass rounded-3xl p-12 text-center max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 bg-white/5 text-slate-400 rounded-2xl flex items-center justify-center mx-auto border border-white/10">
            <Car className="w-8 h-8 text-sky-400" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-100">No Vehicles Active</h3>
            <p className="text-slate-400 text-sm">
              Add your vehicle information to configure recurring monthly checklist indexes, smart reminders, and issue scanning.
            </p>
          </div>
          <button
            onClick={onAddVehicle}
            className="px-5 py-2.5 bg-sky-500 text-slate-900 rounded-xl font-semibold text-sm hover:bg-sky-600 transition cursor-pointer"
          >
            Create First Profile
          </button>
        </div>
      ) : filteredVehicles.length === 0 ? (
        <div className="glass rounded-2xl p-8 py-12 text-center max-w-lg mx-auto space-y-3">
          <p className="text-slate-400 text-sm">No vehicles found in this section.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredVehicles.map((v) => {
            // Find active pending approvals
            const activePendings = pendingRequests.filter(
              (r) => r.vehicleId === v.id && r.approvalStatus === "pending_owner_approval"
            );

            // Find next upcoming appointment
            const nextApp = appointments
              .filter((a) => a.vehicleId === v.id && a.status === "Confirmed")
              .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime())[0];

            // Resolve health status badge color
            const getHealthDetails = (status?: string, id?: string) => {
              const s = status || (id === "v3" ? "Needs Attention" : id === "v2" ? "Excellent" : "Good");
              if (s === "Excellent") return { label: s, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };
              if (s === "Good") return { label: s, color: "text-sky-400 bg-sky-500/10 border-sky-500/20" };
              return { label: s, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" };
            };
            const health = getHealthDetails((v as any).status, v.id);

            // Fetch dynamic photo
            const vehicleImage = v.photoUrl || getVehiclePhoto(v.id, v.brand, v.model);

            // Guess Engine details
            const engineType = v.engineType || (v.id === "v2" ? "Plug-in Hybrid" : v.id === "v3" ? "Diesel" : "Petrol");

            // Calculate last service
            const lastServiceDate = v.lastServiceDate || "N/A";
            const lastServiceType = v.id === "v1" ? "Engine Oil Change" : v.id === "v2" ? "General Inspection" : "Brake Pad Replacement";

            // Next Service details
            const nextServiceDate = v.id === "v1" ? "15 August 2026" : v.id === "v2" ? "20 August 2026" : "25 June 2026";
            const nextServiceMileage = v.id === "v1" ? "190,000 km" : v.id === "v2" ? "15,000 km" : "250,500 km";

            return (
              <div 
                key={v.id} 
                className="glass rounded-3xl overflow-hidden border border-white/5 hover:border-white/10 transition shadow-lg flex flex-col justify-between group"
              >
                {/* Visual Banner Header */}
                <div className="relative h-44 overflow-hidden bg-slate-950">
                  <img 
                    src={vehicleImage} 
                    alt={v.brand} 
                    className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent"></div>
                  
                  {/* License and status badge on absolute positions */}
                  <div className="absolute top-4 left-4 flex flex-wrap gap-1.5 items-center">
                    <span className="p-1 px-2.5 bg-slate-900/90 text-sky-400 font-bold border border-sky-500/30 text-[10px] uppercase font-mono rounded-lg tracking-wider">
                      {v.plateNumber || "PP-2X-4505"}
                    </span>
                    <span className={`p-1 px-2.5 border rounded-lg text-[10px] font-bold ${health.color}`}>
                      Health: {health.label}
                    </span>
                    <span className={`p-1 px-2.5 border rounded-lg text-[10px] font-bold ${
                      (v.status || "Active") === 'Active' ? 'text-emerald-400 bg-emerald-500/15 border-emerald-500/35' :
                      (v.status || "Active") === 'Inactive' ? 'text-slate-450 text-slate-400 bg-slate-550 bg-slate-500/15 border-slate-500/35' :
                      (v.status || "Active") === 'Under Repair' ? 'text-amber-400 bg-amber-400/15 border-amber-500/35 animate-pulse' :
                      (v.status || "Active") === 'Sold/Transferred' ? 'text-rose-400 bg-rose-500/15 border-rose-500/35' :
                      'text-indigo-400 bg-indigo-500/15 border-indigo-500/35'
                    }`}>
                      {v.status || "Active"}
                    </span>
                  </div>

                  {activePendings.length > 0 && (
                    <div className="absolute top-4 right-4 flex items-center gap-1 bg-rose-500 text-white text-[10px] font-black p-1 px-2.5 rounded-lg border border-rose-600 animate-pulse">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{activePendings.length} PENDING APPROVAL</span>
                    </div>
                  )}

                  {/* Brand title layer */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest block font-mono">
                      {engineType} • {v.year}
                    </span>
                    <h3 className="text-lg font-extrabold text-slate-100 tracking-tight leading-snug">
                      {v.brand} {v.model}
                    </h3>
                  </div>
                </div>

                {/* Card Parameters Deck */}
                <div className="p-5 space-y-4 flex-1">
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Odometer Log</span>
                      <div className="font-mono text-slate-200 font-extrabold text-[13px]">
                        {v.mileage.toLocaleString()} km
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Last Service Date</span>
                      <div className="text-slate-200 font-semibold text-[11px] truncate" title={lastServiceType}>
                        {lastServiceDate} • {lastServiceType}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs border-t border-white/5 pt-3">
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Next Service Target</span>
                      <div className="text-amber-400 font-extrabold text-[11px]">
                        {nextServiceMileage}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Next Service Due</span>
                      <div className="text-amber-400 font-semibold text-[11px]">
                        {nextServiceDate}
                      </div>
                    </div>
                  </div>

                  {/* Appointment indicator */}
                  <div className="bg-white/5 border border-white/5 p-3 rounded-2xl flex items-start gap-2.5 text-xs">
                    <Calendar className="w-4 h-4 text-sky-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Next Booking Detail</span>
                      {nextApp ? (
                        <div className="text-slate-200 font-semibold mt-0.5">
                          {nextApp.garageName} on <span className="text-sky-300 font-mono">{nextApp.appointmentDate} @ {nextApp.appointmentTime}</span>
                        </div>
                      ) : (
                        <div className="text-slate-500 font-medium mt-0.5 italic">
                          No confirmed upcoming bookings
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Action Deck */}
                <div className="p-4 bg-slate-900/40 border-t border-white/5 grid grid-cols-2 gap-2 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onOpenQr(v)}
                      className="p-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl font-bold flex items-center justify-center gap-1 transition cursor-pointer"
                      title="Show vehicle Scan QR Code certificate"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Scan QR</span>
                    </button>
                    <button
                      onClick={() => onBookGarage(v)}
                      className="p-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl font-bold flex items-center justify-center gap-1 transition cursor-pointer"
                      title="Book an appointment"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Book</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        onSelectVehicle(v);
                        // Redirect to historic logs tab
                        setTimeout(() => {
                          const triggerEvent = new CustomEvent("changeDetailTab", { detail: "service_history" });
                          window.dispatchEvent(triggerEvent);
                        }, 50);
                      }}
                      className="p-2.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 rounded-xl font-bold flex items-center justify-center gap-1 transition cursor-pointer"
                    >
                      <span>History</span>
                    </button>
                    <button
                      onClick={() => {
                        onSelectVehicle(v);
                        // Redirect to pending requests tab
                        setTimeout(() => {
                          const triggerEvent = new CustomEvent("changeDetailTab", { detail: "pending_requests" });
                          window.dispatchEvent(triggerEvent);
                        }, 50);
                      }}
                      className="p-2.5 bg-sky-500 hover:bg-sky-600 text-slate-950 rounded-xl font-bold flex items-center justify-center gap-1 transition cursor-pointer relative"
                    >
                      <span>Manage</span>
                      <ChevronRight className="w-3 h-3 text-slate-950" />
                      {activePendings.length > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
