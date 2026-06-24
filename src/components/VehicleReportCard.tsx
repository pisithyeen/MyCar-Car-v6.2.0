/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShieldAlert, 
  ThumbsUp, 
  ThumbsDown, 
  Calendar, 
  ListTodo, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  Activity, 
  ChevronDown, 
  ChevronUp, 
  FileCheck,
  Sparkles,
  Search,
  Wrench
} from "lucide-react";
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer, 
  Tooltip 
} from "recharts";
import { VehicleProfile } from "../types";

interface VehicleReportCardProps {
  vehicles: VehicleProfile[];
  selectedVehicle: VehicleProfile | null;
  onSelectVehicle: (v: VehicleProfile) => void;
}

export default function VehicleReportCard({
  vehicles,
  selectedVehicle,
  onSelectVehicle
}: VehicleReportCardProps) {
  const [activeTab, setActiveTab] = useState<'issues' | 'schedules' | 'checklists'>('issues');
  const activeVehicle = selectedVehicle || vehicles[0];

  if (!activeVehicle) {
    return (
      <div className="glass rounded-3xl p-12 text-center max-w-lg mx-auto space-y-4 shadow-md">
        <div className="w-16 h-16 bg-white/5 text-slate-400 rounded-xl flex items-center justify-center mx-auto border border-white/10">
          <FileCheck className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-100">No Vehicle Profiles Available</h3>
          <p className="text-slate-400 text-sm mt-1">
            Generate an AI Weakness Report by clicking "Add Vehicle" on the main Dashboard tab and entering your model details.
          </p>
        </div>
      </div>
    );
  }

  const report = activeVehicle.weaknessReport;

  // Helper to dynamically calculate health categories from report vulnerabilities
  const getRadarData = () => {
    let engine = 95;
    let electrical = 95;
    let structural = 95;
    let suspension = 95;
    let climate = 95;

    // Parse commonIssues
    report?.commonIssues?.forEach(issue => {
      const text = (issue.issue + " " + issue.advice).toLowerCase();
      const severity = issue.risk === "high" ? 15 : issue.risk === "medium" ? 10 : 5;
      
      if (text.includes("engine") || text.includes("cylinder") || text.includes("spark") || text.includes("oil") || text.includes("leak") || text.includes("gasket") || text.includes("belt") || text.includes("piston") || text.includes("fuel")) {
        engine -= severity;
      }
      if (text.includes("wiring") || text.includes("battery") || text.includes("alternator") || text.includes("fuse") || text.includes("sensor") || text.includes("light") || text.includes("electronic") || text.includes("starter") || text.includes("spark") || text.includes("plug")) {
        electrical -= severity;
      }
      if (text.includes("frame") || text.includes("rust") || text.includes("mount") || text.includes("chassis") || text.includes("door") || text.includes("rusting") || text.includes("structural") || text.includes("body") || text.includes("cabin")) {
        structural -= severity;
      }
      if (text.includes("suspension") || text.includes("shock") || text.includes("brake") || text.includes("rotor") || text.includes("pad") || text.includes("strut") || text.includes("steering") || text.includes("alignment") || text.includes("axle")) {
        suspension -= severity;
      }
      if (text.includes("ac") || text.includes("aircon") || text.includes("cooling") || text.includes("radiator") || text.includes("heat") || text.includes("fan") || text.includes("hose") || text.includes("condenser") || text.includes("temperature")) {
        climate -= severity;
      }
    });

    // Parse weakPoints
    report?.weakPoints?.forEach(weak => {
      const text = weak.toLowerCase();
      if (text.includes("engine") || text.includes("gasket") || text.includes("oil") || text.includes("leak") || text.includes("cylinder") || text.includes("pump")) engine -= 8;
      if (text.includes("wiring") || text.includes("battery") || text.includes("alternator") || text.includes("elec") || text.includes("sensor") || text.includes("harness")) electrical -= 8;
      if (text.includes("rust") || text.includes("frame") || text.includes("chassis") || text.includes("body") || text.includes("mount")) structural -= 8;
      if (text.includes("shock") || text.includes("suspension") || text.includes("brake") || text.includes("steering") || text.includes("bush")) suspension -= 8;
      if (text.includes("ac") || text.includes("aircon") || text.includes("cooling") || text.includes("heat") || text.includes("radiator")) climate -= 8;
    });

    // Enforce safety boundaries
    return [
      { subject: "Engine", value: Math.max(30, Math.min(100, engine)), fullMark: 100 },
      { subject: "Electrical", value: Math.max(30, Math.min(100, electrical)), fullMark: 100 },
      { subject: "Structural", value: Math.max(30, Math.min(100, structural)), fullMark: 100 },
      { subject: "Suspension", value: Math.max(30, Math.min(100, suspension)), fullMark: 100 },
      { subject: "Climate", value: Math.max(30, Math.min(100, climate)), fullMark: 100 },
    ];
  };

  const getRiskBadge = (risk?: string) => {
    switch (risk) {
      case "high":
        return "bg-rose-500/15 text-rose-400 border border-rose-500/20";
      case "medium":
        return "bg-amber-400/10 text-amber-300 border border-amber-400/10";
      case "low":
        return "bg-sky-400/10 text-sky-300 border border-sky-400/10";
      default:
        return "bg-slate-800 text-slate-400";
    }
  };

  return (
    <div className="space-y-6">
      {/* Title section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-sky-400 text-xs font-semibold tracking-wider uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Vulnerability Audit</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Vehicle Health & Weakness Report
          </h1>
          <p className="text-sm text-slate-400">
            Specialized engineering review by brand, build decade, and Cambodian climate factors.
          </p>
        </div>

        {/* Dropdown to switch report context */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono shrink-0">Report for:</span>
          <select
            value={activeVehicle.id}
            onChange={(e) => {
              const matched = vehicles.find(v => v.id === e.target.value);
              if (matched) onSelectVehicle(matched);
            }}
            className="bg-slate-900 border border-white/10 text-slate-200 text-xs font-semibold p-2.5 rounded-xl focus:outline-none focus:border-white/20 max-w-[200px] select-none cursor-pointer transition-all hover:border-sky-500/30"
          >
            {vehicles.map(v => (
              <option key={v.id} value={v.id} className="bg-slate-900">{v.brand} {v.model}</option>
            ))}
          </select>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {report ? (
          <motion.div
            key={activeVehicle.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            {/* Quick Stats Grid / Radar Chart & Strengths & Weaknesses */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Visual Radar Card */}
              <motion.div 
                whileHover={{ y: -5, boxShadow: "0 12px 30px -10px rgba(56, 189, 248, 0.15)" }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="lg:col-span-5 glass rounded-3xl p-5 flex flex-col justify-between relative overflow-hidden shadow-md min-h-[360px]"
              >
                <div className="absolute right-0 top-0 text-sky-500/5 translate-x-1/4 -translate-y-1/4 pointer-events-none">
                  <Activity className="w-48 h-48 stroke-[0.3]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-sky-400 tracking-wider uppercase flex items-center gap-1.5 border-b border-white/10 pb-3 font-sans">
                    <Activity className="w-4 h-4" />
                    <span>Vulnerability Balance Vector</span>
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-1.5 leading-normal font-sans">
                    Dynamic health metrics derived from Cambodian climate exposure, humidity, build quality, and verified model recalls.
                  </p>
                </div>

                {/* Recharts Radar Chart Render */}
                <div className="w-full h-64 mt-2 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="105%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={getRadarData()}>
                      <PolarGrid stroke="#ffffff15" />
                      <PolarAngleAxis 
                        dataKey="subject" 
                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 500 }} 
                      />
                      <PolarRadiusAxis 
                        angle={30} 
                        domain={[0, 100]} 
                        tick={{ fill: '#475569', fontSize: 8 }} 
                      />
                      <Radar
                        name={activeVehicle.brand}
                        dataKey="value"
                        stroke="#38bdf8"
                        fill="#38bdf8"
                        fillOpacity={0.2}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0b0f19',
                          borderColor: '#1e293b',
                          borderRadius: '12px',
                          fontSize: '11px',
                          color: '#f8fafc'
                        }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Strengths & Weaknesses Panel */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                {/* Strength points card */}
                <motion.div 
                  whileHover={{ y: -5, boxShadow: "0 12px 30px -10px rgba(56, 189, 248, 0.1)" }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="glass rounded-3xl p-5 space-y-3 relative overflow-hidden shadow-md flex-1"
                >
                  <div className="absolute right-0 top-0 text-sky-500/5 translate-x-1/4 -translate-y-1/4 pointer-events-none">
                    <ThumbsUp className="w-48 h-48 stroke-[0.3]" />
                  </div>
                  <h3 className="text-sm font-bold text-sky-400 tracking-wider uppercase flex items-center gap-1.5 border-b border-white/10 pb-3 font-sans">
                    <ThumbsUp className="w-4 h-4" />
                    <span>Structural Strengths</span>
                  </h3>
                  <ul className="space-y-2.5 pt-1">
                    {report.strongPoints?.map((str, i) => (
                      <motion.li 
                        key={i} 
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04, duration: 0.25 }}
                        className="text-xs text-slate-200 flex items-start gap-2 leading-relaxed font-sans"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                        <span>{str}</span>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>

                {/* Weakness points card */}
                <motion.div 
                  whileHover={{ y: -5, boxShadow: "0 12px 30px -10px rgba(244, 63, 94, 0.1)" }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="glass rounded-3xl p-5 space-y-3 relative overflow-hidden shadow-md flex-1"
                >
                  <div className="absolute right-0 top-0 text-rose-500/5 translate-x-1/4 -translate-y-1/4 pointer-events-none">
                    <ThumbsDown className="w-48 h-48 stroke-[0.3]" />
                  </div>
                  <h3 className="text-sm font-bold text-rose-400 tracking-wider uppercase flex items-center gap-1.5 border-b border-white/10 pb-3 font-sans">
                    <ThumbsDown className="w-4 h-4" />
                    <span>Known Vulnerabilities</span>
                  </h3>
                  <ul className="space-y-2.5 pt-1">
                    {report.weakPoints?.map((weak, i) => (
                      <motion.li 
                        key={i} 
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04, duration: 0.25 }}
                        className="text-xs text-slate-200 flex items-start gap-2 leading-relaxed font-sans"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-455 shrink-0 mt-0.5" />
                        <span>{weak}</span>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              </div>
            </div>

            {/* Tab Selector */}
            <div className="flex border-b border-white/10">
              {['issues', 'schedules', 'checklists'].map((tab) => {
                const isActive = activeTab === tab;
                const labels = {
                  issues: `Vulnerability Index (${report.commonIssues?.length || 0})`,
                  schedules: `Recommended Schedule (${report.recommendedSchedule?.length || 0})`,
                  checklists: "Road checklists",
                };
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-5 py-3 text-xs font-bold uppercase tracking-wider relative transition cursor-pointer ${
                      isActive ? "text-white" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <span className="relative z-10">{labels[tab as 'issues'|'schedules'|'checklists']}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeTabUnderline"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-500"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Tab Content Panels */}
            <div className="min-h-[250px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                >
                  {activeTab === 'issues' && (
                    <div className="space-y-4">
                      {/* Maintenance Priority Sticky */}
                      {report.maintenancePriority && report.maintenancePriority.length > 0 && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-black/25 border border-amber-500/20 rounded-2xl p-4 space-y-2 shadow-sm"
                        >
                          <h4 className="text-xs font-bold text-amber-350 uppercase tracking-wide flex items-center gap-1.5 font-sans">
                            <ShieldAlert className="w-4 h-4" />
                            <span>Immediate Engineering Checklist Priorities</span>
                          </h4>
                          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-1 font-sans">
                            {report.maintenancePriority.map((item, idx) => (
                              <li key={idx} className="text-xs text-slate-300 flex items-start gap-1.5">
                                <span className="text-amber-400 font-bold shrink-0">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      )}

                      {/* Common Issues Loop */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {report.commonIssues?.map((issue, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.97, y: 8 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ delay: idx * 0.03, duration: 0.25 }}
                            whileHover={{ y: -4, borderColor: "rgba(255, 255, 255, 0.15)", boxShadow: "0 8px 20px -8px rgba(0,0,0,0.3)" }}
                            className="bg-white/3 border border-white/5 rounded-2xl p-4 space-y-2 flex flex-col justify-between transition-colors duration-250 shadow-md"
                          >
                            <div>
                              <div className="flex items-start justify-between gap-4">
                                <h4 className="text-sm font-bold text-slate-100 font-sans">{issue.issue}</h4>
                                <span className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold shrink-0 ${getRiskBadge(issue.risk)}`}>
                                  {issue.risk}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 leading-relaxed mt-1.5">
                                {issue.advice}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'schedules' && (
                    <div className="glass rounded-3xl p-5 space-y-4 shadow-md">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase">
                        <Calendar className="w-4 h-4 text-sky-400" />
                        <span>Custom Service Intervals</span>
                      </div>
                      <div className="divide-y divide-white/5 font-mono">
                        {report.recommendedSchedule?.map((sched, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.03, duration: 0.25 }}
                            whileHover={{ x: 4, backgroundColor: "rgba(255, 255, 255, 0.03)" }}
                            className="flex items-center justify-between py-3.5 px-2 rounded-lg transition-colors cursor-default"
                          >
                            <span className="text-xs font-semibold text-slate-200">{sched.task}</span>
                            <span className="text-xs text-sky-400 font-bold">{sched.interval}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'checklists' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Monthly Checks in Cambodia */}
                      <motion.div 
                        whileHover={{ y: -3 }}
                        className="glass rounded-3xl p-5 space-y-3 shadow-md"
                      >
                        <h4 className="text-xs font-bold text-slate-350 uppercase tracking-wider flex items-center gap-1.5 border-b border-white/10 pb-2">
                          <ListTodo className="w-4 h-4 text-slate-450" />
                          <span>Monthly Checklists</span>
                        </h4>
                        <ul className="space-y-2.5">
                          {report.monthlyChecklist?.map((chk, i) => (
                            <motion.li 
                              key={i}
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.04 }}
                              className="text-xs text-slate-200 flex items-start gap-2 leading-relaxed"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                              <span>{chk}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </motion.div>

                      {/* Long trip roadtrip guidelines */}
                      <motion.div 
                        whileHover={{ y: -3 }}
                        className="glass rounded-3xl p-5 space-y-3 shadow-md"
                      >
                        <h4 className="text-xs font-bold text-slate-355 uppercase tracking-wider flex items-center gap-1.5 border-b border-white/10 pb-2">
                          <MapPin className="w-4 h-4 text-sky-400" />
                          <span>Provincial Road-Trip Checklists</span>
                        </h4>
                        <ul className="space-y-2.5">
                          {report.longTripChecklist?.map((chk, i) => (
                            <motion.li 
                              key={i}
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.04 }}
                              className="text-xs text-slate-200 flex items-start gap-2 leading-relaxed"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                              <span>{chk}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </motion.div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Warning Signs */}
            {report.warningSigns && report.warningSigns.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-black/30 border border-rose-500/15 rounded-3xl p-5 space-y-3 shadow-md"
              >
                <h4 className="text-xs font-bold text-rose-455 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 animate-pulse text-rose-400" />
                  <span>Critical Warning Signs (Stop driving immediately if observed)</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {report.warningSigns.map((sign, idx) => (
                    <motion.div 
                      key={idx} 
                      whileHover={{ scale: 1.02, backgroundColor: "rgba(244, 63, 94, 0.04)", borderColor: "rgba(244, 63, 94, 0.15)" }}
                      className="p-3 bg-white/5 rounded-xl border border-white/5 text-xs text-slate-200 leading-relaxed font-mono cursor-default transition-all duration-200"
                    >
                      {sign}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass rounded-3xl p-8 text-center text-slate-400 shadow-md"
          >
             Could not load report parameters. Register another vehicle on the Dashboard.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
