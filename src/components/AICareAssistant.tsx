/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Sparkles, 
  Send, 
  AlertOctagon, 
  Cpu, 
  HelpCircle, 
  CheckCircle2, 
  ShieldAlert, 
  Car, 
  Wrench, 
  Info,
  Clock,
  ThumbsUp,
  Activity,
  UserCheck
} from "lucide-react";
import { VehicleProfile, AIDiagnosisResult } from "../types";

interface AICareAssistantProps {
  vehicles: VehicleProfile[];
  selectedVehicle: VehicleProfile | null;
  onNavigateToGarages: (serviceType: string) => void;
}

const PRESET_SYMPTOMS = [
  { text: "My car shakes vibrating when braking", label: "Braking Shakes" },
  { text: "There is a burning plastic underhood smell after driving", label: "Burning Smell" },
  { text: "AC blows warm dry air during Phnom Penh afternoons", label: "Hot AC Air" },
  { text: "Clunking metallic noises when traveling over local bumps", label: "Chassis Clunking" },
  { text: "My engine has a ticking noise during early morning cold starts", label: "Ticking Sound" }
];

export default function AICareAssistant({
  vehicles,
  selectedVehicle,
  onNavigateToGarages
}: AICareAssistantProps) {
  const [symptomInput, setSymptomInput] = useState("");
  const [activeVehicleId, setActiveVehicleId] = useState(
    selectedVehicle?.id || (vehicles[0]?.id || "")
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [diagnosis, setDiagnosis] = useState<AIDiagnosisResult | null>(null);
  const [queryMatchedText, setQueryMatchedText] = useState("");

  const activeVehicle = vehicles.find((v) => v.id === activeVehicleId) || selectedVehicle;

  const handleDiagnose = async (text: string) => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setQueryMatchedText(text);

    try {
      const response = await fetch("/api/ai/diagnosis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          vehicleId: activeVehicleId,
          symptom: text,
          language: "en"
        })
      });

      if (!response.ok) {
        throw new Error("Diagnosis engine returned an error response");
      }

      const data: AIDiagnosisResult = await response.json();
      setDiagnosis(data);
    } catch (err: any) {
      console.error(err);
      setError("AI Network diagnostics failed to communicate. Operating offline guidelines.");
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level?: string) => {
    switch (level) {
      case "emergency":
        return "bg-rose-500/10 text-rose-400 border-rose-500/30";
      case "high":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      case "medium":
        return "bg-amber-400/10 text-amber-300 border-amber-400/20";
      case "low":
        return "bg-emerald-400/10 text-emerald-400 border-emerald-400/20";
      default:
        return "bg-slate-800 text-slate-400 border-slate-700";
    }
  };

  const getDriveAdviceColor = (advice?: string) => {
    switch (advice) {
      case "do_not_drive":
      case "call_emergency_support":
        return "bg-rose-500/20 text-rose-300 border border-rose-500/40";
      case "drive_carefully_to_garage":
        return "bg-amber-500/15 text-amber-200 border border-amber-400/30";
      case "safe_to_continue_short_term":
        return "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30";
      default:
        return "bg-slate-800 text-slate-300 border border-slate-700";
    }
  };

  const getDriveAdviceText = (advice?: string) => {
    switch (advice) {
      case "do_not_drive":
        return "CRITICAL: Stop driving immediately for mechanical safety!";
      case "call_emergency_support":
        return "EMERGENCY: Call towing services and stand in a safe zone!";
      case "drive_carefully_to_garage":
        return "CAUTION: Drive conservatively directly to nearest repair garage.";
      case "safe_to_continue_short_term":
        return "STABLE: Safe for short commuter driving, but check soon.";
      default:
        return "Consult a professional mechanic.";
    }
  };

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div>
        <div className="flex items-center gap-2 text-sky-400 text-xs font-semibold uppercase tracking-wider">
          <Cpu className="w-3.5 h-3.5" />
          <span>Gemini-Powered Intelligence</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
          AI Vehicle Care Assistant
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Perform a systematic symptom audit. Get educational diagnosis, risk parameters, and safe driver action points.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Input Console */}
        <div className="lg:col-span-5 glass rounded-3xl p-5 space-y-5 shadow-md">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">
              1. Select Odometer / Target Vehicle
            </label>
            {vehicles.length === 0 ? (
              <p className="text-xs text-rose-455">Please register a vehicle profile in the Dashboard first.</p>
            ) : (
              <select
                value={activeVehicleId}
                onChange={(e) => setActiveVehicleId(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 p-3 text-xs rounded-xl focus:outline-none focus:border-white/20 text-slate-100"
              >
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id} className="bg-slate-900">
                    {v.brand} {v.model} ({v.year}) — {v.mileage.toLocaleString()} km
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block">
              2. Describe Symptoms
            </label>
            <div className="relative">
              <textarea
                value={symptomInput}
                onChange={(e) => setSymptomInput(e.target.value)}
                placeholder="Examples: High steering vibration over 80km/h, brake pedal feels soft, AC blowing hot air, smelling hot motor oil..."
                rows={4}
                className="w-full bg-white/5 text-slate-100 placeholder-slate-500 text-sm p-3.5 rounded-xl border border-white/10 focus:outline-none focus:border-white/20 resize-none pr-12 text-xs"
              />
              <button
                onClick={() => handleDiagnose(symptomInput)}
                disabled={loading || !symptomInput.trim()}
                className="absolute right-3.5 bottom-3.5 p-2 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-800 disabled:text-slate-600 text-slate-900 rounded-lg transition cursor-pointer"
              >
                <Send className="w-4 h-4 cursor-pointer" />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase block">
              Or Tap Common Cambodian Symptoms
            </span>
            <div className="flex flex-wrap gap-2">
              {PRESET_SYMPTOMS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSymptomInput(preset.text);
                    handleDiagnose(preset.text);
                  }}
                  className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 text-[11px] text-slate-350 rounded-lg border border-white/10 hover:border-white/15 transition flex items-center gap-1 cursor-pointer"
                >
                  <Activity className="w-3 h-3 text-sky-450" />
                  <span>{preset.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* AI Safety Rules Banner */}
          <div className="bg-black/35 border border-white/5 rounded-xl p-4 space-y-1.5">
            <div className="flex items-center gap-1.5 text-amber-500 text-[11px] font-bold uppercase tracking-wider">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Smart Safety Mandates</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Diagnosis reports are educational and prioritize defensive safety guidelines under heavy Phnom Penh road conditions. Always seek professional inspections on high-voltage EV engines or braking setups.
            </p>
          </div>
        </div>

        {/* Right Output Diagnostic Report */}
        <div className="lg:col-span-7 space-y-6">
          {loading ? (
            <div className="glass rounded-3xl p-12 text-center space-y-4 shadow-md">
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 bg-sky-500/10 rounded-full border border-dashed border-sky-500 animate-spin"></div>
                <div className="absolute inset-2 bg-slate-950 rounded-full flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-sky-400 animate-pulse" />
                </div>
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-100 font-sans">Evaluating Combustion Parameters</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Gemini API is parsing structured diagnostic symptoms, factoring brand legacy and matching database risk indicators...
                </p>
              </div>
            </div>
          ) : diagnosis ? (
            <div className="glass rounded-3xl p-6 space-y-6 relative overflow-hidden shadow-md">
              <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>

              {/* Diagnosis Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div>
                  <span className="text-[10px] font-bold text-[emerald-400] tracking-wider uppercase block text-emerald-400">
                    Live Diagnostic Report Summary
                  </span>
                  <h3 className="text-base font-bold text-slate-100 mt-0.5">
                    For {activeVehicle?.brand || "Toyota"} {activeVehicle?.model || "Tacoma"}
                  </h3>
                  <p className="text-xs text-slate-400 italic mt-1 font-serif">
                     "{queryMatchedText}"
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-mono">Risk Profile:</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getRiskColor(diagnosis.risk_level)}`}>
                    {diagnosis.risk_level}
                  </span>
                </div>
              </div>

              {/* Advice Box */}
              <div className={`p-4 rounded-xl border ${getDriveAdviceColor(diagnosis.continue_driving_advice)}`}>
                <h4 className="text-xs font-bold text-slate-100 tracking-wider uppercase mb-1 flex items-center gap-1.5">
                  <AlertOctagon className="w-4 h-4" />
                  <span>Road Driving Status</span>
                </h4>
                <p className="text-sm font-semibold">{getDriveAdviceText(diagnosis.continue_driving_advice)}</p>
                {diagnosis.safety_warning && (
                  <p className="text-xs mt-1.5 text-slate-300 border-t border-white/10 pt-1.5">
                    <strong className="text-rose-400 uppercase text-[10px] block font-bold">Safety Alert Notice</strong>
                    {diagnosis.safety_warning}
                  </p>
                )}
              </div>

              {/* Central Breakdown */}
              <div className="space-y-4">
                {/* Summary */}
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Analysis & Assessment</h4>
                  <p className="text-sm text-slate-200 leading-relaxed font-serif">
                    {diagnosis.summary}
                  </p>
                </div>                {/* Grid Causes & Categories */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-black/25 rounded-2xl p-4 border border-white/5">
                    <h5 className="text-[11px] font-bold text-slate-405 uppercase tracking-wider mb-2 flex items-center gap-1.5 font-sans">
                      <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                      <span>Likely Root Causes</span>
                    </h5>
                    <ul className="space-y-1.5 font-sans">
                      {diagnosis.possible_causes?.map((cause, i) => (
                        <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5 leading-relaxed">
                          <span className="text-sky-400 font-bold shrink-0">•</span>
                          <span>{cause}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-black/25 rounded-2xl p-4 border border-white/5 flex flex-col justify-between">
                    <div>
                      <h5 className="text-[11px] font-bold text-slate-405 uppercase tracking-wider mb-2 flex items-center gap-1.5 font-sans">
                        <Wrench className="w-3.5 h-3.5 text-sky-400" />
                        <span>Recommended Service</span>
                      </h5>
                      <span className="text-base font-bold text-sky-400 block font-sans">
                        {diagnosis.recommended_service_category}
                      </span>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Urgency timescale: <span className="text-slate-200 font-semibold">{diagnosis.urgency}</span>
                      </p>
                    </div>

                    <button
                      onClick={() => onNavigateToGarages(diagnosis.recommended_service_category)}
                      className="mt-4 w-full py-2.5 bg-sky-500 hover:bg-sky-600 font-semibold text-slate-900 text-xs rounded-xl transition flex items-center justify-center gap-1 cursor-pointer shadow-md"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Locate Recommended Garages</span>
                    </button>
                  </div>
                </div>

                {/* Checklists */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <h5 className="text-[11px] font-bold text-slate-405 uppercase tracking-wider flex items-center gap-1 font-sans">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                      <span>What You Can Safely Check</span>
                    </h5>
                    <ul className="space-y-2">
                      {diagnosis.safe_user_checks?.map((chk, i) => (
                        <li key={i} className="p-2.5 bg-black/20 hover:bg-black/30 rounded-xl border border-white/5 text-xs text-slate-300 leading-relaxed font-mono">
                          {chk}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h5 className="text-[11px] font-bold text-slate-405 uppercase tracking-wider flex items-center gap-1 font-sans">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                      <span>Mechanic Inspection Guidelines</span>
                    </h5>
                    <ul className="space-y-2">
                      {diagnosis.garage_inspection_needed?.map((insp, i) => (
                        <li key={i} className="p-2.5 bg-black/20 hover:bg-black/30 rounded-xl border border-white/5 text-xs text-slate-300 leading-relaxed font-sans">
                          {insp}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Confidence Index Footer */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-500 font-sans">
                <span className="flex items-center gap-1">
                  <Activity className="w-3 h-3" />
                  <span>Confidence Index: <span className="font-bold text-slate-350">{diagnosis.confidence_level?.toUpperCase()}</span></span>
                </span>
                <span>MyCar Care Digital ID Certificate</span>
              </div>
            </div>
          ) : (
            <div className="glass rounded-3xl p-12 text-center text-slate-400 space-y-4 shadow-md">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 mx-auto border border-white/10">
                <Sparkles className="w-6 h-6 text-sky-455 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-300 font-sans">Awaiting Diagnostics Trigger</h4>
                <p className="text-xs text-slate-550 max-w-sm mx-auto leading-relaxed font-sans">
                  Type engine, brake, or electrical symptoms in the console, or click any quick diagnostic presets above to prompt the Care Assistant.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
