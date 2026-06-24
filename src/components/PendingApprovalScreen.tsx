/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Clock, ShieldAlert, CheckCircle2, ChevronRight, FileText, MapPin, RefreshCw, AlertCircle, Phone } from "lucide-react";
import { UserProfile } from "../types";

interface PendingApprovalScreenProps {
  userProfile: UserProfile;
  onRefreshData: () => void;
}

export default function PendingApprovalScreen({
  userProfile,
  onRefreshData
}: PendingApprovalScreenProps) {
  const [checking, setChecking] = useState(false);
  const [checkedMessage, setCheckedMessage] = useState<string | null>(null);

  const handleStatusCheck = async () => {
    setChecking(true);
    setCheckedMessage(null);
    try {
      // Small simulated delay to feel authentic
      await new Promise((resolve) => setTimeout(resolve, 800));
      onRefreshData();
      setCheckedMessage("Verification credentials requested from National Commercial Registry. Your account is currently in the queue.");
    } catch (err) {
      setCheckedMessage("Unable to synchronize with approval nodes. Please try again.");
    } finally {
      setChecking(false);
    }
  };

  // Steps indicator for Cambodian regulatory review
  const auditSteps = [
    { name: "Establish Representative Profile", desc: "Digital signature mapping", status: "complete" },
    { name: "Verification of Business License", desc: `Audit code ${userProfile.licenseNumber || "N/A"}`, status: "complete" },
    { name: "Ministry of Commerce Integrity Scan", desc: "Anti-fraud and compliant pricing review", status: "current" },
    { name: "Administrative Final Release", desc: "Operations console keys activation", status: "pending" }
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 lg:p-8 space-y-8 max-w-3xl mx-auto shadow-2xl">
      {/* Alert Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-amber-500/10 border border-amber-500/20 p-5 rounded-2xl">
        <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20 animate-pulse shrink-0">
          <Clock className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-100">Verification Pending Approval</h2>
          <p className="text-xs text-slate-300">
            {userProfile.role} profile for <strong className="text-amber-400">{userProfile.businessName || "Registered Partner"}</strong> is undergoing regulatory evaluation.
          </p>
        </div>
      </div>

      {/* Audit Pipeline Tree */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cambodia Verification Registry Pipeline</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {auditSteps.map((step, idx) => (
            <div 
              key={idx} 
              className={`p-4 rounded-xl border transition ${
                step.status === "complete" ? "bg-slate-950/40 border-emerald-500/20 text-emerald-400" :
                step.status === "current" ? "bg-[#181d2c]/65 border-amber-500/20 text-amber-300" :
                "bg-slate-950/20 border-slate-850/50 text-slate-500 border-slate-800"
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-mono font-bold">STEP 0{idx + 1}</span>
                {step.status === "complete" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : step.status === "current" ? (
                  <Clock className="w-4 h-4 text-amber-400 animate-spin" />
                ) : (
                  <div className="w-2.5 h-2.5 bg-slate-800 rounded-full"></div>
                )}
              </div>
              <h4 className="text-xs font-bold text-slate-200 mb-1">{step.name}</h4>
              <p className="text-[10px] leading-tight text-slate-400">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Profile Details Block */}
      <div className="bg-slate-950/50 rounded-2xl border border-slate-800 p-5 space-y-4">
        <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-widest flex items-center gap-1.5 pb-2 border-b border-slate-950">
          <FileText className="w-4 h-4 text-sky-400" />
          <span>Submitted Credentials & Licenses</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 block uppercase">Official Business Entity Name</span>
            <span className="text-slate-100 font-bold">{userProfile.businessName || "Apsara Repair Workshop"}</span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 block uppercase">Cambodian Business Reg License Code</span>
            <span className="text-amber-400 font-bold">{userProfile.licenseNumber || "Co-2947/2026-KH"}</span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 block uppercase">Registrant Representative</span>
            <span className="text-slate-200">{userProfile.name} ({userProfile.email})</span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 block uppercase">Primary Municipal Location</span>
            <span className="text-slate-200 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0" />
              <span>{userProfile.location || "Phnom Penh"}</span>
            </span>
          </div>
        </div>

        <div className="p-3 bg-blue-500/5 text-blue-400 border border-blue-500/10 rounded-xl text-[11px] leading-normal flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            <strong>Note to Partner:</strong> Admin reviews are processed dynamically for our sandbox partners. You can use the **Admin Dashboard** (switch to "System Admin" persona in the entrance selector above) to immediately authorize or suspend accounts for live testing.
          </p>
        </div>
      </div>

      {/* Interactive Controls */}
      <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <Phone className="w-3.5 h-3.5 text-emerald-400" />
          <span>Cambodia Registry Hotline: <strong>+855 23 888 123</strong></span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleStatusCheck}
            disabled={checking}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-98 disabled:bg-slate-800 text-slate-900 rounded-xl font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checking ? "animate-spin text-slate-900" : ""}`} />
            <span>Check Approval Status</span>
          </button>
        </div>
      </div>

      {checkedMessage && (
        <div className="p-3 bg-slate-950 rounded-xl text-center border border-slate-805 text-xs text-slate-300 font-mono animate-fadeIn">
          {checkedMessage}
        </div>
      )}
    </div>
  );
}
