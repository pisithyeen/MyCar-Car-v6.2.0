import React, { useState } from "react";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Wrench, 
  HelpCircle, 
  CheckCircle, 
  ChevronRight, 
  Trash2, 
  Sparkles,
  AlertCircle,
  Plus,
  User,
  Activity,
  X
} from "lucide-react";
import { Appointment } from "../types";

interface AppointmentsTabProps {
  vehicleId: string;
  appointments: Appointment[];
  onBookAppointment: (fields: any) => Promise<void>;
  onCancelAppointment: (id: string) => Promise<void>;
  refreshData: () => void;
}

const garagesInfo = [
  { id: "g1", name: "Sokha Auto Garage", spec: "Brakes, Tyres, Suspension & Engine diagnostics" },
  { id: "g2", name: "EV & Hybrid Care Center", spec: "Electric diagnostics, High voltage systems, cooling, software" },
  { id: "g3", name: "Phnom Penh Diesel Garage", spec: "Diesel common rail fuel injector calibrations, heavy mechanics" }
];

export default function AppointmentsTab({
  vehicleId,
  appointments,
  onBookAppointment,
  onCancelAppointment,
  refreshData
}: AppointmentsTabProps) {
  // Filter appointments for active vehicle
  const vehicleApps = appointments.filter(a => a.vehicleId === vehicleId);

  // Form states
  const [isBooking, setIsBooking] = useState(false);
  const [selectedGarageId, setSelectedGarageId] = useState("g1");
  const [serviceType, setServiceType] = useState("Engine Oil Service");
  const [appDate, setAppDate] = useState(new Date().toISOString().split('T')[0]);
  const [appTime, setAppTime] = useState("09:00");
  const [appNote, setAppNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateBooking = async () => {
    // Resolve garage name
    const resolvedGarage = garagesInfo.find(g => g.id === selectedGarageId);
    const garageName = resolvedGarage ? resolvedGarage.name : "Sokha Auto Garage";

    if (!serviceType.trim()) {
      alert("Please state the desired service category.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onBookAppointment({
        vehicleId,
        garageId: selectedGarageId,
        garageName,
        serviceType: serviceType.trim(),
        appointmentDate: appDate,
        appointmentTime: appTime,
        note: appNote.trim()
      });
      setIsBooking(false);
      setServiceType("Engine Oil Service");
      setAppNote("");
      refreshData();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!window.confirm("Are you sure you want to cancel this scheduled appointment?")) {
      return;
    }
    try {
      await onCancelAppointment(id);
      refreshData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
            Scheduled Maintenance & Garage Appointments
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Book diagnostics, review calendar entries, or manage active bookings with Cambodia's elite certified garage partners.
          </p>
        </div>
        <button
          onClick={() => setIsBooking(true)}
          className="p-2 px-3.5 bg-sky-500 hover:bg-sky-600 text-slate-950 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5 text-slate-950" />
          <span>Book New Appointment</span>
        </button>
      </div>

      {vehicleApps.length === 0 && !isBooking ? (
        <div className="glass rounded-2xl p-10 text-center space-y-4">
          <div className="w-12 h-12 bg-white/5 text-slate-400 rounded-xl flex items-center justify-center mx-auto border border-white/10">
            <Calendar className="w-6 h-6 text-sky-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-200">No Scheduled Bookings Found</h4>
            <p className="text-slate-400 text-xs mt-1">
              Need inspections, tire balances, or engine diagnostic sweeps? Set up a time slot immediately with our partners.
            </p>
          </div>
          <button
            onClick={() => setIsBooking(true)}
            className="px-4 py-2 bg-sky-500/10 hover:bg-sky-500/25 text-sky-400 border border-sky-500/25 font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Create Booking Slip
          </button>
        </div>
      ) : vehicleApps.length > 0 && !isBooking ? (
        <div className="space-y-4">
          {vehicleApps.map((a) => {
            // Resolve appointment state looks
            const getStatusBadge = (st: string) => {
              if (st === "Confirmed") return "text-emerald-400 bg-emerald-500/15 border-emerald-500/20";
              if (st === "Requested") return "text-amber-400 bg-amber-500/15 border-amber-500/20";
              return "text-slate-400 bg-white/5 border-white/5";
            };

            return (
              <div 
                key={a.id} 
                className="glass rounded-3xl p-5 border border-white/5 hover:border-white/10 transition flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 bg-sky-500/10 text-sky-400 rounded-xl flex items-center justify-center border border-sky-500/20 shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-slate-100 text-sm">
                        {a.serviceType}
                      </span>
                      <span className={`p-0.5 px-2 border rounded-md text-[9px] font-extrabold uppercase font-mono ${getStatusBadge(a.status)}`}>
                        {a.status}
                      </span>
                    </div>
                    <p className="text-xs text-sky-300 font-semibold">
                      {a.garageName}
                    </p>
                    {a.note && (
                      <p className="text-xs text-slate-400 leading-relaxed italic block mt-1">
                        "{a.note}"
                      </p>
                    )}
                    {a.assignedMechanic && (
                      <span className="text-[10px] text-slate-400 font-medium block">
                        Assigned tech: <strong className="text-slate-305">{a.assignedMechanic}</strong>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 self-stretch md:self-auto border-t md:border-t-0 border-white/5 pt-3 md:pt-0">
                  <div className="text-left md:text-right space-y-1">
                    <div className="text-slate-200 font-extrabold font-mono text-[13px] flex items-center gap-1 sm:justify-end">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>{a.appointmentDate}</span>
                    </div>
                    <div className="text-slate-400 text-xs font-mono flex items-center gap-1 sm:justify-end">
                      <Clock className="w-3.5 h-3.5 text-slate-505" />
                      <span>{a.appointmentTime} UTC+7</span>
                    </div>
                    {a.estimatedCost && (
                      <span className="text-[10px] text-slate-500 block">
                        Est. invoice: <strong className="text-emerald-400 font-mono">{a.estimatedCost}</strong>
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleCancel(a.id)}
                    className="p-2 text-rose-450 bg-rose-500/5 hover:bg-rose-500/15 border border-rose-500/15 rounded-lg transition cursor-pointer shrink-0"
                    title="Cancel Booking"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {/* Full bookings dialog slide */}
      {isBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md glass rounded-3xl p-6 border border-white/10 shadow-2xl relative space-y-5">
            <button
              onClick={() => setIsBooking(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4 text-sky-400" />
                <span>Submit Appointment Reservation</span>
              </h4>
              <p className="text-xs text-slate-400">
                Book diagnostics or minor repairs with authorized partners.
              </p>
            </div>

            <div className="space-y-4">
              {/* Select Garage */}
              <div className="space-y-1 text-xs">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Choose Certified Garage Partner</label>
                <select
                  value={selectedGarageId}
                  onChange={(e) => setSelectedGarageId(e.target.value)}
                  className="w-full bg-slate-900 border border-white/15 p-2.5 rounded-xl text-slate-100 focus:outline-none focus:border-sky-505"
                >
                  {garagesInfo.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
                <span className="text-[10px] text-slate-500 block italic leading-snug mt-1 text-right">
                  {garagesInfo.find(g => g.id === selectedGarageId)?.spec}
                </span>
              </div>

              {/* Service Type */}
              <div className="space-y-1 text-xs">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Requested Service Details</label>
                <input
                  type="text"
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  placeholder="e.g. Engine Oil Service, AC pressure flush, brake lines inspection"
                  className="w-full bg-slate-900 border border-white/15 p-2.5 rounded-xl text-slate-100 focus:outline-none focus:border-sky-505"
                />
              </div>

              {/* Date & Time parameters */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 text-xs">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Desired Date</label>
                  <input
                    type="date"
                    value={appDate}
                    onChange={(e) => setAppDate(e.target.value)}
                    className="w-full bg-slate-900 border border-white/15 p-2 rounded-xl text-slate-100 focus:outline-none"
                  />
                </div>
                <div className="space-y-1 text-xs">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Desired Time Slot</label>
                  <select
                    value={appTime}
                    onChange={(e) => setAppTime(e.target.value)}
                    className="w-full bg-slate-900 border border-white/15 p-2 rounded-xl text-slate-100 focus:outline-none"
                  >
                    <option value="08:00">08:00 AM</option>
                    <option value="09:00">09:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="13:00">01:00 PM</option>
                    <option value="14:00">02:00 PM</option>
                    <option value="15:00">03:00 PM</option>
                    <option value="16:00">04:00 PM</option>
                  </select>
                </div>
              </div>

              {/* Owner Note */}
              <div className="space-y-1 text-xs">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Additional vehicle symptoms / notes</label>
                <textarea
                  value={appNote}
                  onChange={(e) => setAppNote(e.target.value)}
                  placeholder="e.g. Front suspension squealing during bump transitions, steering pulling slightly right..."
                  className="w-full h-16 bg-slate-900 border border-white/15 p-2 rounded-xl text-slate-100 focus:outline-none resize-none"
                ></textarea>
              </div>

              <button
                onClick={handleCreateBooking}
                disabled={isSubmitting}
                className="w-full py-2.5 bg-sky-500 hover:bg-sky-600 text-slate-950 font-black text-xs rounded-xl"
              >
                {isSubmitting ? "Routing reservation..." : "Submit Reservation Spot"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
