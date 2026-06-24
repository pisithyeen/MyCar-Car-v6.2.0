import React, { useState } from "react";
import { 
  CheckCircle, 
  XCircle, 
  HelpCircle, 
  AlertTriangle, 
  Clock, 
  DollarSign, 
  Wrench, 
  FileText, 
  MessageSquare,
  Sparkles,
  Camera,
  ChevronDown,
  User,
  ShieldCheck,
  Check
} from "lucide-react";

interface PendingRequestsTabProps {
  vehicleId: string;
  pendingRequests: any[];
  onApprove: (id: string) => Promise<void>;
  onRequestCorrection: (id: string, notes: string) => Promise<void>;
  onDispute: (id: string, notes: string) => Promise<void>;
  refreshData: () => void;
}

export default function PendingRequestsTab({
  vehicleId,
  pendingRequests,
  onApprove,
  onRequestCorrection,
  onDispute,
  refreshData
}: PendingRequestsTabProps) {
  // Filters list of requests for this vehicle which are NOT in fully approved state yet
  const vehiclePendings = pendingRequests.filter(
    (r) => r.vehicleId === vehicleId && r.approvalStatus !== "approved"
  );

  const [activeDialog, setActiveDialog] = useState<'correction' | 'dispute' | null>(null);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleOpenDialog = (type: 'correction' | 'dispute', id: string) => {
    setSelectedRecordId(id);
    setActiveDialog(type);
    setInputText("");
    setSuccessMsg("");
  };

  const handleActionSubmit = async () => {
    if (!selectedRecordId) return;
    if (!inputText.trim()) {
      alert(`Please write some feedback notes before submitting.`);
      return;
    }

    setIsSubmitting(true);
    try {
      if (activeDialog === 'correction') {
        await onRequestCorrection(selectedRecordId, inputText);
        setSuccessMsg("Correction request successfully dispatched to garage!");
      } else {
        await onDispute(selectedRecordId, inputText);
        setSuccessMsg("Dispute filed! App administrators will review discrepancies shortly.");
      }
      setTimeout(() => {
        setActiveDialog(null);
        setSelectedRecordId(null);
        setInputText("");
        setSuccessMsg("");
        refreshData();
      }, 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDirectApprove = async (id: string) => {
    if (!window.confirm("Approve this garage record into the official immutable service log of your car?")) {
      return;
    }
    try {
      await onApprove(id);
      refreshData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
            Pending Garage Approval Requests
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Awaiting owner verification. Records are only committed to official history upon owner approval.
          </p>
        </div>
        <span className="p-1 px-3 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl text-xs font-bold font-mono">
          {vehiclePendings.length} Tasks Pending
        </span>
      </div>

      {vehiclePendings.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center space-y-4">
          <div className="w-12 h-12 bg-emerald-500/15 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-200">No Pending Requests</h4>
            <p className="text-slate-400 text-xs mt-1">
              Your garages have no pending logs. All historical maintenance are verified and approved.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {vehiclePendings.map((r) => {
            // Label status colors cleanly
            const getStatusBadge = (status: string) => {
              if (status === "correction_requested") {
                return { label: "Correction Requested", style: "border-orange-500/20 text-orange-400 bg-orange-500/10" };
              }
              if (status === "disputed") {
                return { label: "Disputed Claim", style: "border-red-500/20 text-red-400 bg-red-500/10" };
              }
              return { label: "Pending Owner Approval", style: "border-amber-500/20 text-amber-400 bg-amber-500/10" };
            };
            const badge = getStatusBadge(r.approvalStatus);

            return (
              <div 
                key={r.id} 
                className="glass rounded-3xl border border-white/5 hover:border-white/10 transition p-6 space-y-5"
              >
                {/* Header Information Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="p-1 px-2.5 bg-white/5 text-slate-300 rounded-lg text-[10px] font-bold font-mono">
                        TICKET ID: {r.id}
                      </span>
                      <span className={`p-1 px-2.5 border rounded-lg text-[10px] font-bold uppercase tracking-wider ${badge.style}`}>
                        {badge.label}
                      </span>
                    </div>
                    <h4 className="text-slate-200 font-extrabold text-[15px] mt-1.5 flex items-center gap-1.5">
                      <Wrench className="w-4 h-4 text-sky-400 shrink-0" />
                      <span>{r.serviceCategory}</span>
                    </h4>
                    <p className="text-xs text-slate-400">
                      Submitted by <span className="text-sky-300 font-semibold">{r.providerName}</span> • <span className="font-mono text-slate-400">{r.serviceDate}</span>
                    </p>
                  </div>

                  {/* Pricing detail card */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-3 px-5 text-right self-stretch sm:self-auto flex sm:flex-col justify-between items-center sm:items-end gap-2">
                    <span className="text-[10px] text-slate-500 uppercase font-black">Contract Cost</span>
                    <span className="text-emerald-400 text-lg font-black font-mono">
                      ${r.cost}
                    </span>
                  </div>
                </div>

                {/* Technical Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/40 p-4 rounded-2xl border border-white/5 text-xs">
                  <div className="space-y-2">
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-slate-500 font-semibold">Odometer On Entry</span>
                      <span className="text-slate-300 font-mono font-bold">{r.mileage?.toLocaleString()} km</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-slate-500 font-semibold">Products Used</span>
                      <span className="text-slate-300 truncate max-w-xs">{r.productUsed || "None specified"}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500 font-semibold">Parts Exchanged</span>
                      <span className="text-slate-300 text-right">{r.partsChanged || "None"}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-slate-500 font-semibold">Assigned Specialist</span>
                      <span className="text-slate-300 font-bold">{r.submittedBy || "Service Advisor"}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5">
                      <span className="text-slate-500 font-semibold">Warranty Terms</span>
                      <span className="text-amber-400 font-semibold">{r.warranty || "No active warrant"}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500 font-semibold">Payment Completed</span>
                      <span className="text-slate-300 font-mono font-bold">{r.paymentStatus || "Paid"}</span>
                    </div>
                  </div>
                </div>

                {/* Sub-item specific lists inside service */}
                {r.serviceItems && r.serviceItems.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Inspected Item Checklist:</span>
                    <div className="flex flex-wrap gap-2">
                      {r.serviceItems.map((it: string, sIdx: number) => (
                        <span key={sIdx} className="p-1 px-3 bg-white/5 border border-white/5 text-slate-400 rounded-xl text-[10px] font-semibold flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-sky-400" />
                          <span>{it}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tech notes comment bubble */}
                {r.note && (
                  <div className="p-3 bg-white/5 border-l-2 border-sky-500 rounded-r-2xl text-xs space-y-1">
                    <span className="text-[9px] font-bold text-sky-400 uppercase tracking-wider block">Garage Diagnostics & Notes</span>
                    <p className="text-slate-300 leading-relaxed italic">
                      "{r.note}"
                    </p>
                  </div>
                )}

                {/* Correction note indicator if state matches */}
                {r.correctionNote && (
                  <div className="p-3 bg-orange-500/10 border-l-2 border-orange-500 rounded-r-2xl text-xs space-y-1">
                    <span className="text-[9px] font-bold text-orange-400 uppercase tracking-wider block">Active Correction Request Remarks</span>
                    <p className="text-slate-300 leading-relaxed font-semibold">
                      "{r.correctionNote}"
                    </p>
                  </div>
                )}

                {/* Dispute reason if state matches */}
                {r.disputeReason && (
                  <div className="p-3 bg-red-500/10 border-l-2 border-red-500 rounded-r-2xl text-xs space-y-1">
                    <span className="text-[9px] font-bold text-red-400 uppercase tracking-wider block">Filed Dispute Reason:</span>
                    <p className="text-slate-300 leading-relaxed font-semibold">
                      "{r.disputeReason}"
                    </p>
                  </div>
                )}

                {/* Diagnostic Snapshots / Photos section if available */}
                {r.photos && r.photos.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Diagnostic Snapshots & Attachments</span>
                    <div className="flex flex-wrap gap-3">
                      {r.photos.map((ph: string, pIdx: number) => (
                        <div key={pIdx} className="relative w-28 h-20 bg-slate-900 border border-white/10 rounded-xl overflow-hidden shadow-md">
                          <img src={ph} alt="diagnostic" className="w-full h-full object-cover" />
                        </div>
                      ))}
                      {r.invoiceAttachment && (
                        <div className="p-3 border border-white/10 bg-white/5 rounded-xl flex items-center gap-2 text-[10px] text-sky-300 font-mono font-bold hover:bg-white/10 hover:text-sky-200 transition cursor-pointer self-center">
                          <FileText className="w-4 h-4 text-sky-400" />
                          <span>{r.invoiceAttachment}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Core Workflow Buttons Panel */}
                <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-white/5">
                  <button
                    onClick={() => handleDirectApprove(r.id)}
                    className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md"
                  >
                    <CheckCircle className="w-4 h-4 text-slate-950" />
                    <span>Approve Service Record</span>
                  </button>

                  <div className="flex flex-1 gap-2">
                    <button
                      onClick={() => handleOpenDialog('correction', r.id)}
                      className="flex-1 py-3 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Request Correction</span>
                    </button>
                    <button
                      onClick={() => handleOpenDialog('dispute', r.id)}
                      className="flex-1 py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-450 border border-rose-500/20 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      <span>Dispute Ticket</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Dialog for Correction Notes / Dispute filings */}
      {activeDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md glass rounded-3xl p-6 border border-white/10 shadow-2xl relative space-y-4">
            <button
              onClick={() => { setActiveDialog(null); setSelectedRecordId(null); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white font-bold cursor-pointer"
            >
              Close Exception
            </button>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                {activeDialog === 'correction' ? (
                  <MessageSquare className="w-4 h-4 text-orange-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                )}
                <span>{activeDialog === 'correction' ? "Submit Revision Notes" : "File Service Ticket Dispute"}</span>
              </h4>
              <p className="text-xs text-slate-400">
                {activeDialog === 'correction' 
                  ? "Describe modifications required (e.g. correct mileage, invoice totals, parts descriptions)."
                  : "State your dispute clearly. Our MyCar Care service management desk will hold funds/records and audit this transaction."
                }
              </p>
            </div>

            {successMsg ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs text-center font-bold rounded-2xl animate-pulse">
                {successMsg}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1 text-xs">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Feedback & Description Notes</label>
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={activeDialog === 'correction' ? "e.g., Please correct the entry mileage to 186,200 km instead of 186,500..." : "e.g., I did not authorize replacing injector seals at Sokha Auto Garage..."}
                    className="w-full h-32 bg-slate-900 border border-white/10 p-3 text-xs text-slate-100 rounded-xl focus:outline-none focus:border-sky-500 resize-none"
                  ></textarea>
                </div>

                <button
                  onClick={handleActionSubmit}
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-sky-500 text-slate-950 hover:bg-sky-600 transition font-extrabold text-xs rounded-xl"
                >
                  {isSubmitting ? "Dispatched state change..." : "Authenticate Request"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
