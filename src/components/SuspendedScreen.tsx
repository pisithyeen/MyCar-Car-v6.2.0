/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ShieldAlert, RefreshCw, AlertCircle, FileText, Lock, Mail, Users, AlertTriangle } from "lucide-react";
import { UserProfile } from "../types";

interface SuspendedScreenProps {
  userProfile: UserProfile;
  onRefreshData: () => void;
}

export default function SuspendedScreen({
  userProfile,
  onRefreshData
}: SuspendedScreenProps) {
  const [checking, setChecking] = useState(false);
  const [checkedMessage, setCheckedMessage] = useState<string | null>(null);

  const handleStatusCheck = () => {
    setChecking(true);
    setCheckedMessage(null);
    setTimeout(() => {
      onRefreshData();
      setCheckedMessage("Administrative block is still active. Please settle any pending customer disputes to restore operations.");
      setChecking(false);
    }, 700);
  };

  return (
    <div className="bg-slate-900 border border-red-500/30 rounded-3xl p-6 lg:p-8 space-y-8 max-w-3xl mx-auto shadow-2xl shadow-red-950/15">
      {/* Alert Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-red-550/10 bg-red-950/30 border border-red-500/20 p-5 rounded-2xl">
        <div className="p-3 bg-red-500/10 text-red-400 rounded-xl border border-red-500/20 shrink-0">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-red-400">Account Access Suspended</h2>
          <p className="text-xs text-slate-300">
            {userProfile.role} profile for <strong className="text-white">{userProfile.businessName || "Registered Partner"}</strong> has been locked by the Cambodia Operations Bureau.
          </p>
        </div>
      </div>

      {/* Incident details block */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-red-400 tracking-wider uppercase flex items-center gap-1.5 font-mono">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
          <span>Sanction File Ref: #KH-SUSP-7281</span>
        </h3>

        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4 text-xs font-mono">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 uppercase block">Flagged Entity</span>
              <span className="text-slate-100 font-bold">{userProfile.businessName || "Registered Partner"}</span>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 uppercase block">License Code</span>
              <span className="text-red-400 font-bold">{userProfile.licenseNumber || "N/A"}</span>
            </div>
          </div>

          <div className="border-t border-slate-900 pt-3 space-y-2">
            <span className="text-[10px] text-slate-500 uppercase block">Breach Cause Classification</span>
            <div className="p-3 bg-red-500/5 text-slate-300 rounded-xl leading-normal border border-red-500/10 font-sans">
              <strong>Dynamic Price Gouging Complaint:</strong> Inbound audit logs showed multiple pricing overcharges for starter-motor installations. Customer registered at Russian Boulevard reported a 150% markup surpassing standard municipal caps.
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800 text-xs text-slate-400 leading-relaxed space-y-2">
        <h4 className="font-bold text-slate-200">System Reinstatement Path:</h4>
        <p>1. Provide customer settlement documentation regarding premium markups.</p>
        <p>2. Complete the mandatory **Cambodian Fair Automotive Pricing Refresher course** (4 hours virtual).</p>
        <p>3. Submit request to Platform Operations Admin via your registered email: <strong>{userProfile.email}</strong>.</p>
        <p className="text-sky-400 mt-2">
          💡 For testing, log in with our <strong>"System Admin"</strong> persona and use the Management Controls board to immediately toggle this user’s status to <strong>Approved</strong>.
        </p>
      </div>

      {/* Action panel */}
      <div className="pt-4 border-t border-slate-850 border-slate-800 flex justify-between items-center text-xs">
        <span className="text-slate-500 flex items-center gap-1">
          <Mail className="w-3.5 h-3.5 text-slate-400" />
          <span>compliance@mycar.com.kh</span>
        </span>

        <div className="flex gap-2">
          <button
            onClick={handleStatusCheck}
            disabled={checking}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-750 active:scale-95 disabled:bg-slate-950 text-slate-300 font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer border border-slate-700 hover:text-white"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checking ? "animate-spin text-sky-400" : ""}`} />
            <span>Re-verify Sanction</span>
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
