/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Zap, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Activity, 
  Sliders, 
  Sparkles, 
  Check, 
  ArrowRight,
  TrendingUp,
  Map
} from "lucide-react";

interface FreelanceDashboardProps {
  onRefreshData: () => void;
  userProfile: any;
}

export default function FreelanceDashboard({ onRefreshData, userProfile }: FreelanceDashboardProps) {
  // Roadside pager alerts stream
  const [tickets, setTickets] = useState([
    { id: "t1", car: "Toyota Tacoma (2009)", issue: "Left Rear Flat Tire replacement", location: "National Road 4, km 22 near Kandal border", customer: "Chhun Ly", phone: "+855 77 444 333", urgency: "High", status: "Awaiting Help" },
    { id: "t2", car: "BYD Dolphin EV (2024)", issue: "12V Accessory Battery Dead cell - System Lockout", location: "Russian Blvd near Tuol Kork Flyover", customer: "Sombo Keo", phone: "+855 11 999 888", urgency: "Emergency", status: "Dispatched (You)" },
    { id: "t3", car: "Lexus RX300 (2002)", issue: "Radiator Hose Leak overheating", location: "Daun Penh Blvd 130", customer: "Sokha Morn", phone: "+855 92 111 222", urgency: "Medium", status: "Awaiting Help" }
  ]);

  // Previous assists completed
  const [completeAssists, setCompleteAssists] = useState([
    { id: "h1", car: "Toyota Prius (2010)", job: "Jumpstart 12V battery", pay: 25, region: "Boeung Keng Kang", status: "Paid" },
    { id: "h2", car: "Ford Ranger Wildtrak", job: "Tire plug socket replacement", pay: 35, region: "Chbar Ampov", status: "Paid" }
  ]);

  // Mechanic active skills checklist
  const [skills, setSkills] = useState([
    { name: "12V Auxiliary System Jumpstart Guru", checked: true },
    { name: "Monsoon Flat Tire Plugging & Repair", checked: true },
    { name: "EV High Voltage Safe Interlocks Check", checked: false },
    { name: "Cooling system bypass hose connector fixes", checked: true }
  ]);

  const handleToggleSkill = (idx: number) => {
    setSkills(prev => prev.map((s, i) => i === idx ? { ...s, checked: !s.checked } : s));
  };

  const handleAcceptTicket = (id: string) => {
    setTickets(prev => prev.map(t => {
      if (t.id === id) {
        return { ...t, status: t.status === 'Awaiting Help' ? 'Dispatched (You)' : 'Awaiting Help' };
      }
      return t;
    }));
  };

  const handleCompleteTicket = (id: string, pay: number) => {
    const jobMatch = tickets.find(t => t.id === id);
    if (!jobMatch) return;

    // Remove from active list
    setTickets(prev => prev.filter(t => t.id !== id));

    // Register inside completed assets list
    setCompleteAssists(prev => [
      {
        id: `h-${Date.now()}`,
        car: jobMatch.car,
        job: jobMatch.issue,
        pay: pay,
        region: jobMatch.location.split(',')[0],
        status: "Paid"
      },
      ...prev
    ]);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. TOP STATS ROW */}
      <div className="bg-gradient-to-r from-rose-500/10 to-red-500/5 p-6 rounded-3xl border border-rose-500/15 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20 uppercase tracking-wider animate-pulse animate-bounce">
                On-Call Highway Pager
              </span>
              <span className="text-slate-500 text-xs">•</span>
              <span className="text-slate-350 text-xs flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-rose-500" />
                Roadside Helper Grid Ready
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-100 tracking-tight mt-1.5">
              Freelance Roadside Dispatch Terminal
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xl font-sans">
              Help stranded motorists on critical Cambodian highways. Receive real-time dispatch alerts, contact drivers directly, and maintain local assistance safety ledgers.
            </p>
          </div>

          <div className="bg-slate-900/60 p-2.5 rounded-2xl border border-white/5 shrink-0 flex items-center gap-2">
            <span className="text-[10px] font-extrabold text-slate-405 text-slate-400 uppercase tracking-widest pl-1">Dispatcher Status</span>
            <span className="bg-rose-500/20 text-rose-350 text-rose-400 px-2.5 py-1 rounded-lg text-[10px] font-bold border border-rose-500/25 animate-pulse">
              ON-PAGER DUTY
            </span>
          </div>
        </div>

        {/* Dashboard statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/5">
          <div className="glass p-3 rounded-xl border border-white/5 bg-white/2">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Active roadside requests</span>
            <div className="flex justify-between items-baseline mt-1 font-mono">
              <span className="text-lg font-black text-white">
                {tickets.filter(t => t.status === 'Awaiting Help').length} pending
              </span>
              <span className="text-[9px] text-rose-400 font-bold">Priority feed</span>
            </div>
          </div>

          <div className="glass p-3 rounded-xl border border-white/5 bg-white/2">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">My dispatched tickets</span>
            <div className="flex justify-between items-baseline mt-1 font-mono">
              <span className="text-lg font-black text-white">
                {tickets.filter(t => t.status === 'Dispatched (You)').length} assigned
              </span>
              <span className="text-[9px] text-amber-400 font-bold animate-pulse">On-route</span>
            </div>
          </div>

          <div className="glass p-3 rounded-xl border border-white/5 bg-white/2">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total assists completed</span>
            <div className="flex justify-between items-baseline mt-1 font-mono">
              <span className="text-lg font-black text-white">{completeAssists.length} jobs</span>
              <span className="text-[9px] text-emerald-400 font-bold">+100% resolution</span>
            </div>
          </div>

          <div className="glass p-3 rounded-xl border border-white/5 bg-white/2">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Freelancer Earnings (2026)</span>
            <div className="flex justify-between items-baseline mt-1 font-mono">
              <span className="text-lg font-black text-emerald-450 text-emerald-400">${completeAssists.reduce((acc, curr) => acc + curr.pay, 0)} USD</span>
              <span className="text-[9px] text-slate-400 font-bold">Unregulated</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. THE CORE REAL-TIME TRAFFIC ROAD DISPATACH PAGER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Stranded Motorist Pager Alert Stream */}
        <div className="lg:col-span-8 glass rounded-2xl p-5 border border-white/10 space-y-4 bg-white/2">
          <div className="border-b border-white/10 pb-2.5 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-200 flex items-center gap-1.5">
              <Activity className="w-4.5 h-4.5 text-rose-450 text-rose-400 animate-pulse" />
              <span>Phnom Penh & Highway dispatch pager feed</span>
            </h3>
            <span className="text-[9px] bg-white/5 text-slate-400 px-2 py-0.5 rounded border border-white/5">
              Refreshed 5s
            </span>
          </div>

          <div className="space-y-4">
            {tickets.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs flex flex-col items-center justify-center space-y-2">
                <CheckCircle className="w-8 h-8 text-slate-650 opacity-40" />
                <span>Zero stranded highway distress signals currently active! Peace reigns on Cambodian highways.</span>
              </div>
            ) : (
              tickets.map((t) => (
                <div key={t.id} className="p-4 bg-slate-950/40 rounded-xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                  
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-slate-100 text-sm leading-tight">{t.car}</span>
                      <span className={`text-[8px] font-black uppercase px-2 py-0.2 rounded-full border ${
                        t.urgency === 'Emergency' 
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse" 
                          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}>
                        {t.urgency}
                      </span>
                      <span className="text-[9.5px] bg-white/5 text-slate-400 font-mono px-2 py-0.5 rounded border border-white/10">
                        {t.status}
                      </span>
                    </div>

                    <div className="space-y-1 text-slate-400 text-[11px] leading-relaxed">
                      <p>Distress: <strong className="text-slate-200">{t.issue}</strong></p>
                      <div className="flex items-center gap-1 text-slate-350">
                        <MapPin className="w-3.5 h-3.5 text-rose-400" />
                        <span>{t.location}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-350 font-bold">
                        <Phone className="w-3.5 h-3.5 text-sky-400" />
                        <span>Driver: {t.customer} ({t.phone})</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex md:flex-col gap-2 justify-end shrink-0">
                    {t.status === 'Awaiting Help' ? (
                      <button
                        onClick={() => handleAcceptTicket(t.id)}
                        className="px-3.5 py-2 bg-rose-500 hover:bg-rose-600 text-slate-950 font-extrabold rounded-lg text-[10.5px] transition cursor-pointer flex items-center gap-1 uppercase tracking-wider"
                      >
                        <span>Accept Dispatch</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => handleCompleteTicket(t.id, t.urgency === 'Emergency' ? 45 : 30)}
                          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold rounded-lg text-[10px] transition cursor-pointer"
                        >
                          Mark Completed
                        </button>
                        <button
                          onClick={() => handleAcceptTicket(t.id)}
                          className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-400 rounded-lg text-[10px] transition cursor-pointer"
                        >
                          Cancel assignment
                        </button>
                      </>
                    )}
                  </div>

                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Col: Helper ledgers & Certifications skills */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Dispatcher skills checklists */}
          <div className="glass rounded-2xl p-5 border border-white/10 space-y-3.5 bg-white/2">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-300 flex items-center gap-1.5 border-b border-white/10 pb-2">
              <Sliders className="w-4.5 h-4.5 text-rose-400" />
              <span>On-pager skills checklist</span>
            </h4>
            <span className="text-[10.5px] text-slate-400 block pb-1">Configure qualifications to pre-qualify for high-voltage and flat tire dispatch pager lines.</span>

            <div className="space-y-2">
              {skills.map((skill, index) => (
                <div 
                  key={index}
                  onClick={() => handleToggleSkill(index)}
                  className="flex items-center justify-between p-2.5 bg-slate-950/40 border border-white/5 rounded-xl cursor-pointer hover:bg-slate-950 transition select-none"
                >
                  <span className="text-[11px] text-slate-300 font-medium leading-snug">{skill.name}</span>
                  <div className={`w-4.5 h-4.5 rounded flex items-center justify-center border transition ${
                    skill.checked 
                      ? "bg-rose-500 border-rose-500 text-slate-950" 
                      : "bg-transparent border-white/20 text-transparent"
                  }`}>
                    <Check className="w-3.5 h-3.5 stroke-[3px]" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Roadside completed ledger assists feed */}
          <div className="glass rounded-2xl p-5 border border-white/10 space-y-4 bg-white/2">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-300 flex items-center gap-1.5 border-b border-white/10 pb-2">
              <Clock className="w-4.5 h-4.5 text-rose-450 text-rose-400" />
              <span>Dispatched Assist logs</span>
            </h4>

            <div className="space-y-3">
              {completeAssists.map((ca) => (
                <div key={ca.id} className="p-2.5 bg-white/1 border border-white/5 rounded-xl text-xs space-y-1">
                  <div className="flex justify-between items-start font-bold">
                    <span className="text-slate-250 text-slate-200">{ca.car}</span>
                    <span className="text-emerald-450 font-mono text-emerald-400">+${ca.pay}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-snug">{ca.job}</p>
                  <div className="flex justify-between items-center text-[9.5px] text-slate-500 font-mono pt-1">
                    <span>Region: {ca.region}</span>
                    <span className="text-emerald-500 flex items-center gap-0.5">
                      <CheckCircle className="w-3 h-3" />
                      <span>{ca.status}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-amber-500/5 rounded-xl text-[10.5px] text-slate-400 leading-normal flex gap-1.5 border border-amber-500/10">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span>
                Road Note: Emergency highway dispatch yields standard 1.5x pay multiples during active Mekong flood warning alerts.
              </span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
