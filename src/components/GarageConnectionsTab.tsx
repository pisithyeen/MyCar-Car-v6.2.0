import React, { useState } from "react";
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  Trash2, 
  Plus, 
  X, 
  CheckCircle, 
  Network, 
  Link2, 
  Lock, 
  Unlock,
  AlertOctagon
} from "lucide-react";

interface Connection {
  id: string;
  vehicleId: string;
  ownerId: string;
  garageId: string;
  garageName: string;
  permissionLevel: 'private' | 'basic_profile' | 'view_history' | 'full_history';
  allowCreateLogs: boolean;
  allowSendAppointments: boolean;
  allowTelegramReminders: boolean;
  allowInvoiceUpload: boolean;
  status: string;
  connectedAt: string;
}

interface GarageConnectionsTabProps {
  vehicleId: string;
  connections: Connection[];
  onUpdateConnection: (id: string, updatedFields: Partial<Connection>) => Promise<void>;
  onAddConnection: (fields: any) => Promise<void>;
  onDisconnectGarage: (id: string) => Promise<void>;
  refreshData: () => void;
}

const garagesTemplate = [
  { id: "g1", name: "Sokha Auto Garage" },
  { id: "g2", name: "EV & Hybrid Care Center" },
  { id: "g3", name: "Phnom Penh Diesel Garage" }
];

export default function GarageConnectionsTab({
  vehicleId,
  connections,
  onUpdateConnection,
  onAddConnection,
  onDisconnectGarage,
  refreshData
}: GarageConnectionsTabProps) {
  // Filter connections for active vehicle
  const vehicleConns = connections.filter(c => c.vehicleId === vehicleId);

  // Modal State
  const [isAdding, setIsAdding] = useState(false);
  const [newGarageId, setNewGarageId] = useState("g1");
  const [permissionLevel, setPermissionLevel] = useState<'private' | 'basic_profile' | 'view_history' | 'full_history'>('full_history');
  const [allowLogs, setAllowLogs] = useState(true);
  const [allowApps, setAllowApps] = useState(true);
  const [allowTg, setAllowTg] = useState(true);
  const [allowInvoices, setAllowInvoices] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const handleUpdateToggle = async (connId: string, field: string, currentValue: boolean) => {
    try {
      await onUpdateConnection(connId, { [field]: !currentValue });
      refreshData();
    } catch (e) {
      console.error(e);
    }
  };

  const handlePermissionLevelChange = async (connId: string, level: any) => {
    try {
      await onUpdateConnection(connId, { permissionLevel: level });
      refreshData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddConnection = async () => {
    const matched = garagesTemplate.find(g => g.id === newGarageId);
    if (!matched) return;

    setSubmitting(true);
    try {
      await onAddConnection({
        vehicleId,
        garageId: newGarageId,
        garageName: matched.name,
        permissionLevel,
        allowCreateLogs: allowLogs,
        allowSendAppointments: allowApps,
        allowTelegramReminders: allowTg,
        allowInvoiceUpload: allowInvoices
      });
      setIsAdding(false);
      refreshData();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDisconnect = async (id: string, name: string) => {
    if (!window.confirm(`Revoke all digital key authorisations and sever connection with ${name}? They will no longer be able to log service logs.`)) {
      return;
    }
    try {
      await onDisconnectGarage(id);
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
            Garage Connections & Permission Controls
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            The vehicle history belongs to you. Define which garages can scan your vehicle credentials, log tickets, or view prior maintenance files.
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="p-2 px-3.5 bg-sky-500 hover:bg-sky-600 text-slate-950 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5 text-slate-950" />
          <span>Authorize Garage Partner</span>
        </button>
      </div>

      {vehicleConns.length === 0 && !isAdding ? (
        <div className="glass rounded-2xl p-10 text-center space-y-4">
          <div className="w-12 h-12 bg-white/5 text-slate-400 rounded-xl flex items-center justify-center mx-auto border border-white/10">
            <ShieldAlert className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-200">No Connected Garages Authorized</h4>
            <p className="text-slate-400 text-xs mt-1">
              Currently, no workshops or garages have digital reading privileges for this car profile.
            </p>
          </div>
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-sky-500/10 hover:bg-sky-505/25 text-sky-400 border border-sky-500/25 font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Authorize First Partner
          </button>
        </div>
      ) : vehicleConns.length > 0 && !isAdding ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {vehicleConns.map((c) => (
            <div 
              key={c.id} 
              className="glass rounded-3xl p-5 border border-white/5 hover:border-white/10 transition flex flex-col justify-between space-y-5"
            >
              {/* Header Title segment */}
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h4 className="font-extrabold text-slate-200 text-sm flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>{c.garageName}</span>
                  </h4>
                  <p className="text-[10px] text-slate-500 font-medium">
                    Authorized since {new Date(c.connectedAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDisconnect(c.id, c.garageName)}
                  className="p-1.5 text-rose-400 bg-rose-500/5 hover:bg-rose-500/15 rounded-lg border border-rose-500/10 transition cursor-pointer"
                  title="Disconnect and revoke access"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Permission drop down select selector */}
              <div className="space-y-1 text-xs py-1 border-t border-b border-white/5 my-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Privacy Isolation Level</label>
                <select
                  value={c.permissionLevel}
                  onChange={(e) => handlePermissionLevelChange(c.id, e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 p-2 text-xs rounded-xl text-slate-100 mt-1 focus:outline-none"
                >
                  <option value="private">Private (Invisible Profile)</option>
                  <option value="basic_profile">Basic Profile Only (Specs & Nickname)</option>
                  <option value="view_history">Read-Only History (View Past Approved Logs)</option>
                  <option value="full_history">Full History Access (Read History & Inject Tickets)</option>
                </select>
                <span className="text-[9px] text-slate-500 italic text-right block mt-1">
                  {c.permissionLevel === 'private' && "🚫 Garage can not view specs or log records."}
                  {c.permissionLevel === 'basic_profile' && "🔍 Can only see Plate numbers & brand specs."}
                  {c.permissionLevel === 'view_history' && "📖 Can view prior service log logs."}
                  {c.permissionLevel === 'full_history' && "🛠️ Can read logs and pre-populate draft approval slips."}
                </span>
              </div>

              {/* Toggle Switches indicators */}
              <div className="space-y-2 text-xs">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Detailed Capability Rules:</span>
                
                {/* Rule: Create logs */}
                <div 
                  onClick={() => handleUpdateToggle(c.id, "allowCreateLogs", c.allowCreateLogs)}
                  className="flex justify-between items-center bg-slate-950/30 p-2 border border-white/5 rounded-xl cursor-pointer hover:border-white/10"
                >
                  <span className="text-slate-350">Allow service logs drafts submission</span>
                  <span className={`p-1 px-2.5 rounded-lg font-mono font-bold text-[9px] ${c.allowCreateLogs ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20" : "text-slate-500 bg-white/5 border border-white/5"}`}>
                    {c.allowCreateLogs ? "ON (ACTIVE)" : "OFF"}
                  </span>
                </div>

                {/* Rule: Allow appointments */}
                <div 
                  onClick={() => handleUpdateToggle(c.id, "allowSendAppointments", c.allowSendAppointments)}
                  className="flex justify-between items-center bg-slate-950/30 p-2 border border-white/5 rounded-xl cursor-pointer hover:border-white/10"
                >
                  <span className="text-slate-350">Allow direct booking proposals</span>
                  <span className={`p-1 px-2.5 rounded-lg font-mono font-bold text-[9px] ${c.allowSendAppointments ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20" : "text-slate-500 bg-white/5 border border-white/5"}`}>
                    {c.allowSendAppointments ? "ON (ACTIVE)" : "OFF"}
                  </span>
                </div>

                {/* Rule: Allow Telegram reminders */}
                <div 
                  onClick={() => handleUpdateToggle(c.id, "allowTelegramReminders", c.allowTelegramReminders)}
                  className="flex justify-between items-center bg-slate-950/30 p-2 border border-white/5 rounded-xl cursor-pointer hover:border-white/10"
                >
                  <span className="text-slate-350">Allow Telegram notifications push</span>
                  <span className={`p-1 px-2.5 rounded-lg font-mono font-bold text-[9px] ${c.allowTelegramReminders ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20" : "text-slate-500 bg-white/5 border border-white/5"}`}>
                    {c.allowTelegramReminders ? "ON (ACTIVE)" : "OFF"}
                  </span>
                </div>

                {/* Rule: Allow invoice uploads */}
                <div 
                  onClick={() => handleUpdateToggle(c.id, "allowInvoiceUpload", c.allowInvoiceUpload)}
                  className="flex justify-between items-center bg-slate-950/30 p-2 border border-white/5 rounded-xl cursor-pointer hover:border-white/10"
                >
                  <span className="text-slate-350">Allow PDF invoice downloads attachment</span>
                  <span className={`p-1 px-2.5 rounded-lg font-mono font-bold text-[9px] ${c.allowInvoiceUpload ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20" : "text-slate-500 bg-white/5 border border-white/5"}`}>
                    {c.allowInvoiceUpload ? "ON (ACTIVE)" : "OFF"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {/* Add Authorise garage dialog */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md glass rounded-3xl p-6 border border-white/10 shadow-2xl relative space-y-5">
            <button
              onClick={() => setIsAdding(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-4 h-4 text-sky-400" />
                <span>Authorize Workshop Partner</span>
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Generate a secure digital connection key.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1 text-xs">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Partner Workshop</label>
                <select
                  value={newGarageId}
                  onChange={(e) => setNewGarageId(e.target.value)}
                  className="w-full bg-slate-900 border border-white/15 p-2.5 rounded-xl text-slate-100 focus:outline-none"
                >
                  {garagesTemplate.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1 text-xs">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Initial Permission Scope</label>
                <select
                  value={permissionLevel}
                  onChange={(e) => setPermissionLevel(e.target.value as any)}
                  className="w-full bg-slate-900 border border-white/15 p-2.5 rounded-xl text-slate-100 focus:outline-none"
                >
                  <option value="private">Private (Invisible Profile)</option>
                  <option value="basic_profile">Basic Profile Only (Specs & Nickname)</option>
                  <option value="view_history">Read-Only History (View Past Approved Logs)</option>
                  <option value="full_history">Full History Access (Read & Write Service proposals)</option>
                </select>
              </div>

              {/* Switches configurations panel */}
              <div className="space-y-2 border-t border-white/5 pt-3">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">Configure Capability Slits</span>
                
                <div className="flex items-center justify-between text-xs py-1">
                  <span className="text-slate-350">Allow record submission</span>
                  <input
                    type="checkbox"
                    checked={allowLogs}
                    onChange={(e) => setAllowLogs(e.target.checked)}
                    className="w-4 h-4 text-sky-500 bg-slate-900 border-white/10"
                  />
                </div>

                <div className="flex items-center justify-between text-xs py-1">
                  <span className="text-slate-350">Allow appointment proposing</span>
                  <input
                    type="checkbox"
                    checked={allowApps}
                    onChange={(e) => setAllowApps(e.target.checked)}
                    className="w-4 h-4 text-sky-500 bg-slate-900 border-white/10"
                  />
                </div>

                <div className="flex items-center justify-between text-xs py-1">
                  <span className="text-slate-350">Allow Telegram alarms alerts</span>
                  <input
                    type="checkbox"
                    checked={allowTg}
                    onChange={(e) => setAllowTg(e.target.checked)}
                    className="w-4 h-4 text-sky-500 bg-slate-900 border-white/10"
                  />
                </div>

                <div className="flex items-center justify-between text-xs py-1">
                  <span className="text-slate-350">Allow PDF receipt uploads</span>
                  <input
                    type="checkbox"
                    checked={allowInvoices}
                    onChange={(e) => setAllowInvoices(e.target.checked)}
                    className="w-4 h-4 text-sky-500 bg-slate-900 border-white/10"
                  />
                </div>
              </div>

              <button
                onClick={handleAddConnection}
                disabled={submitting}
                className="w-full py-2.5 bg-sky-500 hover:bg-sky-600 text-slate-950 font-black text-xs rounded-xl transition cursor-pointer"
              >
                {submitting ? "Publishing keys..." : "Authorize Workshop Credentials"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
