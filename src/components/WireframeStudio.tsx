import React, { useState } from "react";
import { 
  Layers, Layout, Clipboard, Check, RefreshCw, Upload, Image as ImageIcon, 
  MapPin, UserCheck, Plus, Car, DollarSign, Calendar, AlertTriangle, 
  Sparkles, FileText, Smartphone, ArrowRight, Zap, Info, ChevronRight, Copy, TrendingUp
} from "lucide-react";
import { VehicleProfile, MaintenanceRecord } from "../types";
import { FleetTrip, FleetExpense } from "./FleetManager";

interface WireframeStudioProps {
  vehicles: VehicleProfile[];
  setVehicles: React.Dispatch<React.SetStateAction<VehicleProfile[]>> | undefined;
  drivers: any[];
  setDrivers: React.Dispatch<React.SetStateAction<any[]>> | undefined;
  trips: FleetTrip[];
  setTrips: React.Dispatch<React.SetStateAction<FleetTrip[]>> | undefined;
  expenses: FleetExpense[];
  setExpenses: React.Dispatch<React.SetStateAction<FleetExpense[]>> | undefined;
  triggerNotification: (title: string, msg: string) => void;
}

export default function WireframeStudio({
  vehicles: initialVehicles,
  setVehicles,
  drivers: initialDrivers,
  setDrivers,
  trips,
  setTrips,
  expenses,
  setExpenses,
  triggerNotification
}: WireframeStudioProps) {
  // Local sandboxed states to prevent breaking actual database state during wireframe tinkering
  const [wireframeVehicles, setWireframeVehicles] = useState<VehicleProfile[]>([
    { id: "v-wf-1", name: "VIP Executive Alphard", plateNumber: "PP-2AA-8888", brand: "Toyota", model: "Alphard", year: 2023, engineType: "Hybrid", status: "In Use", currentDriver: "Sok Cheat", odometer: 24500, mileage: 24500, nextServiceOdo: 25000, insuranceExpiry: "2026-12-15", roadTaxExpiry: "2026-10-10", image: "https://images.unsplash.com/photo-1619551480517-57ef9845353d?auto=format&fit=crop&q=80&w=600" },
    { id: "v-wf-2", name: "Angkor Offroad Hilux", plateNumber: "SR-3B-9999", brand: "Toyota", model: "Hilux", year: 2022, engineType: "Diesel", status: "Available", currentDriver: "Unassigned", odometer: 42100, mileage: 42100, nextServiceOdo: 45000, insuranceExpiry: "2026-08-20", roadTaxExpiry: "2026-09-01" },
    { id: "v-wf-3", name: "Phnom Penh Green EV", plateNumber: "PP-2XX-1111", brand: "BYD", model: "Atto 3", year: 2023, engineType: "Electric", status: "At Garage", currentDriver: "Unassigned", odometer: 15300, mileage: 15300, nextServiceOdo: 20000, insuranceExpiry: "2027-01-10", roadTaxExpiry: "2026-11-12" },
    { id: "v-wf-4", name: "Logistics Super Carry", plateNumber: "PP-2C-3344", brand: "Suzuki", model: "Super Carry", year: 2021, engineType: "Petrol", status: "In Use", currentDriver: "Chhoun Borey", odometer: 89600, mileage: 89600, nextServiceOdo: 90000, insuranceExpiry: "2026-07-05", roadTaxExpiry: "2026-06-30" },
  ]);

  const [wireframeDrivers, setWireframeDrivers] = useState<any[]>([
    { id: "dr-wf-1", name: "Sok Cheat", status: "Active", telegramHandle: "@sok_cheat_driver", assignedVehicleId: "v-wf-1" },
    { id: "dr-wf-2", name: "Chhoun Borey", status: "Active", telegramHandle: "@borey_trans", assignedVehicleId: "v-wf-4" },
    { id: "dr-wf-3", name: "Ly Hour", status: "Available", telegramHandle: "@lyhour_private", assignedVehicleId: null },
    { id: "dr-wf-4", name: "Vannak Nimol", status: "On Leave", telegramHandle: "@vannak_dispatch", assignedVehicleId: null },
  ]);

  // Combined expenses sandbox values
  const [expenseData, setExpenseData] = useState([
    { vehicleId: "v-wf-1", name: "VIP Executive Alphard", fuel: 820, maintenance: 450 },
    { vehicleId: "v-wf-2", name: "Angkor Offroad Hilux", fuel: 950, maintenance: 620 },
    { vehicleId: "v-wf-3", name: "Phnom Penh Green EV", fuel: 180, maintenance: 90 },
    { vehicleId: "v-wf-4", name: "Logistics Super Carry", fuel: 1100, maintenance: 1250 },
  ]);

  // Active view parameters
  const [blueprintMode, setBlueprintMode] = useState<boolean>(true); // true = blueprint styling with specs, false = clean functional UI
  const [deviceLayout, setDeviceLayout] = useState<'desktop' | 'mobile'>('desktop');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Driver Assignment modal inside wireframe
  const [selectedAssignVehicle, setSelectedAssignVehicle] = useState<string | null>(null);

  // Trip Log Form sandbox state
  const [startOdoInput, setStartOdoInput] = useState<number>(24500);
  const [endOdoInput, setEndOdoInput] = useState<number>(24820);
  const [tripPurposeInput, setTripPurposeInput] = useState<string>("VIP Client Pick");
  const [tripNotesInput, setTripNotesInput] = useState<string>("Executive transfer from Phnom Penh Int Airport to Rosewood Hotel.");
  const [tripCoords, setTripCoords] = useState<string>("11.5621° N, 104.9151° E (Phnom Penh HQ)");
  const [attachedReceiptFile, setAttachedReceiptFile] = useState<{name: string; size: string; preview: string} | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState<boolean>(false);

  // Action feedback states
  const [isSubmittingTrip, setIsSubmittingTrip] = useState<boolean>(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(true);
  };

  const handleDragLeave = () => {
    setIsDraggingFile(false);
  };

  const handleDropFile = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setAttachedReceiptFile({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + " KB",
        preview: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&q=80&w=150"
      });
      triggerNotification("Receipt Dragged", `Receipt file "${file.name}" detected. Ready for OCR processing.`);
    }
  };

  const handleSelectMockReceipt = () => {
    setAttachedReceiptFile({
      name: `receipt_gas_total_${Math.floor(Date.now() / 100000)}.png`,
      size: "245.8 KB",
      preview: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&q=80&w=150"
    });
    triggerNotification("Mock Receipt Attached", "Simulated gasoline receipt attached. OCR auto-extracted $45.00 USD total.");
  };

  const handleAssignDriverToVehicle = (vehicleId: string, driverId: string | "Unassigned") => {
    // Update vehicles
    setWireframeVehicles(prev => prev.map(v => {
      if (v.id === vehicleId) {
        const selectedDriverName = driverId === "Unassigned" ? "Unassigned" : (wireframeDrivers.find(d => d.id === driverId)?.name || "Unassigned");
        return {
          ...v,
          currentDriver: selectedDriverName,
          status: driverId === "Unassigned" ? "Available" : "In Use"
        };
      }
      return v;
    }));

    // Update drivers
    setWireframeDrivers(prev => prev.map(d => {
      if (d.id === driverId) {
        return { ...d, assignedVehicleId: vehicleId, status: "Active" };
      }
      if (d.assignedVehicleId === vehicleId) {
        return { ...d, assignedVehicleId: null, status: "Available" };
      }
      return d;
    }));

    const vName = wireframeVehicles.find(v => v.id === vehicleId)?.name || "Vehicle";
    const dName = driverId === "Unassigned" ? "Unassigned" : (wireframeDrivers.find(d => d.id === driverId)?.name || "");
    triggerNotification("Driver Assigned", `${dName} is now successfully assigned to ${vName}.`);
    setSelectedAssignVehicle(null);
  };

  const handleSubmitWireframeTripLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (endOdoInput <= startOdoInput) {
      alert("Odometer mismatch error: End value must exceed starting odometer.");
      return;
    }

    setIsSubmittingTrip(true);
    setTimeout(() => {
      setIsSubmittingTrip(false);
      triggerNotification(
        "Trip Log Submitted",
        `Odometer updated from ${startOdoInput} to ${endOdoInput} km (${endOdoInput - startOdoInput} km traveled). Log synced successfully.`
      );

      // Clean form
      setStartOdoInput(endOdoInput);
      setTripNotesInput("");
      setAttachedReceiptFile(null);
    }, 1500);
  };

  // Single copy utility
  const handleCopyText = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 3000);
    triggerNotification("Copied to Clipboard", "System instruction copied. Paste directly into Claude Design chat.");
  };

  // AI Design instructions for Claude Design
  const claudeDesignInstructions = [
    {
      title: "1. Complete Fleet Dashboard Wireframe Prompt",
      prompt: `Act as an expert UI/UX and visual designer. Generate a high-fidelity dark-themed, mobile-first wireframe of a "Fleet & Family Manager Dashboard". 
Include the following section layout constraints:
- Sleek top header navigation with a custom logo, quick status indicator, and a vertical "quick navigation sidebar" trigger.
- 6 Key Performance Metric cards with high-contrast slate borders:
  1. Total Fleet Size: "4 Vehicles registered"
  2. Available Units: "2 Units ready" with green status pulse
  3. In Garage: "1 Unit At Garage" with orange alert
  4. Pending Approvals: "3 Drivers claims awaiting manager signature"
  5. Monthly Expenses: "$3,120 USD combined petrol & repairs"
  6. Maintenance/Insurance Alert: "Hilux insurance expiring in 25 days"
- Design with a modern, technical aesthetic (using JetBrains Mono for numbers, soft borders, off-whites, and deep emerald accent colors).`
    },
    {
      title: "2. 'High-Cost Vehicle' Analytics Card Prompt",
      prompt: `Create a polished dark-themed visual component for a "High-Cost Vehicle Spending Tracker". 
Layout details:
- Display a ranked list of vehicles by combined fuel and maintenance expenses.
- Present each vehicle in a clean row with: vehicle nickname (e.g., Toyota Hilux), a progress-bar representing the total spending proportion, and the concrete USD value (e.g. "$2,350").
- Use highly distinct bar color intensities or dual bars (e.g., emerald for Fuel, indigo for Maintenance) to instantly highlight top-spending units.
- Include a small header with sorting toggles (Highest Spending, Lowest Spending) and a total fleet cost accumulator.`
    },
    {
      title: "3. 'Driver Assignment' List Wireframe Prompt",
      prompt: `Generate a gorgeous dark-mode web component for "Fleet Driver Assignment Ledger".
Constraints:
- List active fleet vehicles as cards or rows.
- Each vehicle row must explicitly show: vehicle name, plate number, current assigned driver avatar and name.
- An interactive, highly visible visual status indicator badge matching these states:
  * "Available" (Soft Emerald background with pulse dot)
  * "In Use" (Soft Blue background with navigation icon)
  * "At Garage" (Soft Amber background with repair wrench icon)
- A prominent "Invite/Assign Driver" button on each row that displays a dropdown/modal of active drivers when tapped.`
    },
    {
      title: "4. 'Driver Trip Log' Submission Form Prompt",
      prompt: `Design a high-fidelity, user-friendly mobile wireframe for a "Driver Trip Log & Odometer Form".
Inputs needed:
- Start Odometer (numeric, default filled)
- End Odometer (numeric input)
- Trip Purpose (Dropdown list: Delivery dispatch, Office logistics, Personal transfer)
- GPS Coordinates placeholder displaying current lat/long and a subtle map thumbnail mockup
- Notes Text Area
- Section at the bottom: "Receipt & Log Proof" with a visual file dropzone, a preview of an uploaded receipt/ticket, and a "Submit to Fleet Manager" high-contrast action button.`
    }
  ];

  return (
    <div className="space-y-8 animate-fadeIn text-left font-sans text-slate-200">
      
      {/* -------------------- MAIN WIREFRAME STUDIO CONTROL HEADER -------------------- */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 text-[10px] font-mono rounded-full font-bold uppercase tracking-wider">
                Blueprint Studio
              </span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-100 tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              <span>Interactive Fleet Wireframe Sandbox</span>
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Design, test, and preview the new Fleet features. Toggle **Blueprint Annotations** to view exact specifications, dimensions, and padding details, or switch to **Claude Code Builder** to instantly copy high-fidelity prompts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* View/Design Toggle */}
            <div className="bg-slate-950 p-1 border border-slate-800 rounded-xl flex items-center gap-1">
              <button 
                onClick={() => setBlueprintMode(true)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  blueprintMode ? 'bg-indigo-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Blueprint Specs</span>
              </button>
              <button 
                onClick={() => setBlueprintMode(false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  !blueprintMode ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Live Sandbox</span>
              </button>
            </div>

            {/* Device Layout Toggles */}
            <div className="bg-slate-950 p-1 border border-slate-800 rounded-xl flex items-center gap-1">
              <button 
                onClick={() => setDeviceLayout('desktop')}
                className={`p-1.5 rounded-lg transition ${
                  deviceLayout === 'desktop' ? 'bg-slate-800 text-indigo-400' : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Widescreen W/ Sidebar Layout"
              >
                <Layout className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setDeviceLayout('mobile')}
                className={`p-1.5 rounded-lg transition ${
                  deviceLayout === 'mobile' ? 'bg-slate-800 text-indigo-400' : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Mobile First Viewport"
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* -------------------- CLAUDE COPY-PASTE DESIGN BLUEPRINTS (TOP DRAWER) -------------------- */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
        <h3 className="text-xs font-black text-indigo-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Info className="w-4 h-4" />
          <span>Claude Design Prompt Builder (One-Click Copy)</span>
        </h3>
        <p className="text-xs text-slate-400 mb-6 max-w-3xl leading-relaxed">
          Copy these production-grade prompts containing structural layouts, pixel specifications, and style constraints. Paste them into Claude to instantaneously build stunning visual UI pages.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {claudeDesignInstructions.map((item, idx) => (
            <div key={idx} className="bg-slate-950 border border-slate-850 hover:border-slate-800 p-4 rounded-2xl flex flex-col justify-between gap-4 transition group">
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-200 group-hover:text-indigo-300 transition flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-[10px] font-mono">
                    {idx + 1}
                  </span>
                  <span>{item.title}</span>
                </h4>
                <p className="text-[11px] text-slate-400 line-clamp-3 font-mono leading-relaxed bg-slate-900/40 p-2.5 rounded-lg border border-slate-850">
                  {item.prompt}
                </p>
              </div>
              <button
                onClick={() => handleCopyText(item.prompt, idx)}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-[11px] font-bold text-indigo-400 hover:text-indigo-300 rounded-xl transition flex items-center justify-center gap-2 border border-slate-850"
              >
                {copiedIndex === idx ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">Copied Successfully!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Claude Design Instruction</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* -------------------- THE WIREFRAME PLAYGROUND STAGE -------------------- */}
      <div className={`mx-auto transition-all duration-300 ${deviceLayout === 'mobile' ? 'max-w-md border-x border-slate-800 bg-slate-950/40 p-2 rounded-[3rem]' : 'w-full'}`}>
        
        {/* Device Frame decoration (If Mobile View) */}
        {deviceLayout === 'mobile' && (
          <div className="w-full bg-slate-900 py-3 px-6 rounded-t-[2.5rem] border-t border-x border-slate-800 flex justify-between items-center text-[10px] font-mono text-slate-500">
            <span>09:41 🔋</span>
            <div className="w-20 h-4 bg-slate-950 rounded-full border border-slate-850"></div>
            <span>LTE 📶</span>
          </div>
        )}

        <div className={`bg-slate-950 border border-slate-850 p-6 rounded-3xl ${deviceLayout === 'mobile' ? 'rounded-t-none border-t-0' : ''} space-y-8 relative`}>
          
          {/* Grid Blueprint overlay patterns */}
          {blueprintMode && (
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(#4f46e5_0.6px,transparent_0.6px)] [background-size:16px_16px] opacity-10 rounded-3xl"></div>
          )}

          {/* SIDEBAR NAVIGATION WIREFRAME & BODY (Desktop Sidebar Emulation) */}
          <div className={`flex gap-6 ${deviceLayout === 'mobile' ? 'flex-col' : ''}`}>
            
            {/* 1. QUICK NAVIGATION SIDEBAR WIREFRAME */}
            <div className={`w-full ${deviceLayout === 'mobile' ? 'flex flex-row overflow-x-auto pb-2 gap-2' : 'md:w-60 border-r border-slate-850/80 pr-6 space-y-2'} shrink-0 relative text-left`}>
              {blueprintMode && (
                <div className="absolute -top-4 -left-2 px-1.5 py-0.5 bg-indigo-500 text-slate-950 font-mono text-[8px] font-black uppercase rounded tracking-widest z-20">
                  W-Sidebar (240px)
                </div>
              )}
              
              <div className={`${deviceLayout === 'desktop' ? 'mb-4 border-b border-slate-850 pb-4' : 'hidden'}`}>
                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 font-mono">MyCar Care KH</span>
                <h4 className="text-xs font-extrabold text-slate-300 mt-0.5">Fleet Studio v1.2</h4>
              </div>

              {[
                { name: "Fleet Overview", icon: Car, active: true },
                { name: "Analytics Ledger", icon: DollarSign, active: false },
                { name: "Driver Assignments", icon: UserCheck, active: false },
                { name: "Trip Submission", icon: Clipboard, active: false },
              ].map((nav, nIdx) => (
                <button
                  key={nIdx}
                  className={`w-full p-2.5 rounded-xl text-left text-xs font-bold transition flex items-center justify-between group ${
                    nav.active 
                      ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                      : 'hover:bg-slate-900 text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <nav.icon className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition" />
                    <span className="truncate">{nav.name}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition text-indigo-400" />
                </button>
              ))}

              <div className={`pt-4 ${deviceLayout === 'desktop' ? 'border-t border-slate-850/60 mt-6' : 'hidden'}`}>
                <div className="p-3 bg-slate-900/60 border border-slate-850 rounded-2xl space-y-1">
                  <span className="text-[9px] font-mono text-slate-500 uppercase font-black">Active Device:</span>
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Sandbox Connected</span>
                  </div>
                </div>
              </div>
            </div>

            {/* MAIN CONTENTS LAYOUT AREA */}
            <div className="flex-1 space-y-8 min-w-0">

              {/* SECTION WIREFRAME #1: FLEET & FAMILY MANAGER DASHBOARD OVERVIEW CARDS */}
              <div className="space-y-4 relative">
                {blueprintMode && (
                  <>
                    <div className="absolute -top-3 left-0 px-1.5 py-0.5 bg-indigo-500 text-slate-950 font-mono text-[8px] font-black uppercase rounded tracking-widest z-10">
                      Module 1: Fleet Manager Dashboard Grid
                    </div>
                    <div className="absolute -bottom-3 right-0 text-[9.5px] font-mono text-indigo-400">
                      Layout: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4
                    </div>
                  </>
                )}

                <div className="flex justify-between items-center pb-2 border-b border-slate-850">
                  <div className="space-y-0.5">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-100 flex items-center gap-1.5">
                      <Layout className="w-4 h-4 text-emerald-400" />
                      <span>Fleet & Family Manager Dashboard</span>
                    </h3>
                    <p className="text-[10px] text-slate-500">Global indicators & operational system metrics</p>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Interactive Simulation</span>
                </div>

                {/* Dashboard Metric cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
                  
                  {/* Metric 1: Total Fleet */}
                  <div className="p-4 bg-slate-900 border border-slate-850 rounded-2xl hover:border-slate-800 transition relative overflow-hidden group">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span className="text-[9.5px] font-mono text-slate-500 uppercase tracking-wider font-bold">Total Fleet Size</span>
                        <h4 className="text-xl font-black text-slate-100 font-mono tracking-tight">04 Units</h4>
                      </div>
                      <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                        <Car className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-1 text-[10px] text-slate-400">
                      <span className="text-emerald-400 font-bold font-mono">100%</span>
                      <span>compliance audited</span>
                    </div>
                  </div>

                  {/* Metric 2: Available Vehicles */}
                  <div className="p-4 bg-slate-900 border border-slate-850 rounded-2xl hover:border-slate-800 transition relative overflow-hidden group">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span className="text-[9.5px] font-mono text-slate-500 uppercase tracking-wider font-bold">Available Vehicles</span>
                        <h4 className="text-xl font-black text-slate-100 font-mono tracking-tight flex items-center gap-1.5">
                          <span>02 Units</span>
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        </h4>
                      </div>
                      <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                        <Check className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-1 text-[10px] text-slate-400">
                      <span>Ready for dispatch</span>
                    </div>
                  </div>

                  {/* Metric 3: Vehicles in Garage */}
                  <div className="p-4 bg-slate-900 border border-slate-850 rounded-2xl hover:border-slate-800 transition relative overflow-hidden group">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span className="text-[9.5px] font-mono text-slate-500 uppercase tracking-wider font-bold">Vehicles in Garage</span>
                        <h4 className="text-xl font-black text-slate-100 font-mono tracking-tight">01 Unit</h4>
                      </div>
                      <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-1 text-[10px] text-slate-400">
                      <span className="text-amber-400 font-bold">BYD Atto 3</span>
                      <span>at bay 2</span>
                    </div>
                  </div>

                  {/* Metric 4: Pending Approvals */}
                  <div className="p-4 bg-slate-900 border border-slate-850 rounded-2xl hover:border-slate-800 transition relative overflow-hidden group">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span className="text-[9.5px] font-mono text-slate-500 uppercase tracking-wider font-bold">Pending Approvals</span>
                        <h4 className="text-xl font-black text-rose-400 font-mono tracking-tight">03 Claims</h4>
                      </div>
                      <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
                        <FileText className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-1 text-[10px] text-slate-400">
                      <span className="text-rose-400 font-bold">Fuel logs</span>
                      <span>awaiting boss check</span>
                    </div>
                  </div>

                  {/* Metric 5: Monthly Expenses */}
                  <div className="p-4 bg-slate-900 border border-slate-850 rounded-2xl hover:border-slate-800 transition relative overflow-hidden group">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span className="text-[9.5px] font-mono text-slate-500 uppercase tracking-wider font-bold">Monthly Expenses</span>
                        <h4 className="text-xl font-black text-slate-100 font-mono tracking-tight">$3,120 USD</h4>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-800 text-slate-300">
                        <DollarSign className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-1 text-[10px] text-slate-400">
                      <span className="text-emerald-400 font-bold font-mono">+$420</span>
                      <span>vs previous month</span>
                    </div>
                  </div>

                  {/* Metric 6: Alerts & Alerts */}
                  <div className="p-4 bg-slate-900 border border-slate-850 rounded-2xl hover:border-slate-800 transition relative overflow-hidden group">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span className="text-[9.5px] font-mono text-slate-500 uppercase tracking-wider font-bold">Compliance Status</span>
                        <h4 className="text-sm font-bold text-rose-400 mt-1 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Hilux Tax Due</span>
                        </h4>
                      </div>
                      <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 animate-pulse">
                        <Calendar className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-1 text-[10px] text-slate-400">
                      <span>Expiry: SR-3B-9999 in 25 days</span>
                    </div>
                  </div>

                </div>
              </div>


              {/* SECTION WIREFRAME #2: "HIGH-COST VEHICLE" ANALYTICS CARD */}
              <div className="space-y-4 relative">
                {blueprintMode && (
                  <>
                    <div className="absolute -top-3 left-0 px-1.5 py-0.5 bg-indigo-500 text-slate-950 font-mono text-[8px] font-black uppercase rounded tracking-widest z-10">
                      Module 2: High-Cost Vehicle Analytics Card
                    </div>
                    <div className="absolute -bottom-3 right-0 text-[9.5px] font-mono text-indigo-400">
                      Components: Dual Segment Stacked Progress Bars
                    </div>
                  </>
                )}

                <div className="bg-slate-900 border border-slate-850 rounded-3xl p-5 text-left space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-850 pb-3">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-100 flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-rose-400" />
                        <span>High-Cost Vehicle Spending Ledger</span>
                      </h4>
                      <p className="text-[10px] text-slate-500">Combined petrol refuels and shop maintenance records</p>
                    </div>

                    <div className="flex gap-1.5 bg-slate-950 p-1 border border-slate-850 rounded-xl text-[10px]">
                      <button className="px-2 py-1 bg-slate-900 text-indigo-400 font-bold rounded-lg">All Costs</button>
                      <button className="px-2 py-1 text-slate-400 hover:text-slate-200 rounded-lg">Fuel Only</button>
                    </div>
                  </div>

                  {/* Ranked List of Vehicles with Combined Expenses */}
                  <div className="space-y-4 pt-1">
                    {(() => {
                      const maxCost = Math.max(...expenseData.map(e => e.fuel + e.maintenance));
                      return expenseData
                        .sort((a, b) => (b.fuel + b.maintenance) - (a.fuel + a.maintenance))
                        .map((exp, rankIdx) => {
                          const total = exp.fuel + exp.maintenance;
                          const fuelPct = (exp.fuel / maxCost) * 100;
                          const maintPct = (exp.maintenance / maxCost) * 100;
                          const totalPct = ((exp.fuel + exp.maintenance) / maxCost) * 100;

                          return (
                            <div key={exp.vehicleId} className="space-y-1.5">
                              <div className="flex justify-between items-center text-xs">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-850">
                                    #0{rankIdx + 1}
                                  </span>
                                  <span className="font-bold text-slate-200">{exp.name}</span>
                                </div>
                                <div className="font-mono text-xs font-black text-slate-100">
                                  ${total.toLocaleString()} USD
                                </div>
                              </div>

                              {/* Progress bar indicator */}
                              <div className="h-3 w-full bg-slate-950 border border-slate-850 rounded-full overflow-hidden flex relative group">
                                <div 
                                  className="h-full bg-emerald-500 hover:bg-emerald-400 transition-all duration-500 cursor-pointer"
                                  style={{ width: `${fuelPct * 0.6}%` }}
                                  title={`Fuel: $${exp.fuel}`}
                                ></div>
                                <div 
                                  className="h-full bg-indigo-500 hover:bg-indigo-400 transition-all duration-500 cursor-pointer border-l border-slate-950"
                                  style={{ width: `${maintPct * 0.6}%` }}
                                  title={`Maintenance: $${exp.maintenance}`}
                                ></div>
                              </div>

                              {/* Small details line */}
                              <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono">
                                <div className="flex gap-2">
                                  <span className="flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block"></span>
                                    <span>Fuel: ${exp.fuel}</span>
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full inline-block"></span>
                                    <span>Repair: ${exp.maintenance}</span>
                                  </span>
                                </div>
                                <span>Total spent relative to max peak</span>
                              </div>
                            </div>
                          );
                        });
                    })()}
                  </div>

                  {/* Wireframe interactive slider */}
                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-850 space-y-2 mt-4 text-[10px]">
                    <span className="text-slate-400 uppercase font-bold font-mono tracking-wider">Tinker Box: Edit Alphard Costs</span>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-slate-500">Fuel Expenditure: ${expenseData[0].fuel}</label>
                        <input 
                          type="range" 
                          min="100" 
                          max="2000" 
                          step="50"
                          value={expenseData[0].fuel} 
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setExpenseData(prev => prev.map(item => item.vehicleId === "v-wf-1" ? { ...item, fuel: val } : item));
                          }}
                          className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-500">Repair Cost: ${expenseData[0].maintenance}</label>
                        <input 
                          type="range" 
                          min="100" 
                          max="2000" 
                          step="50"
                          value={expenseData[0].maintenance} 
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setExpenseData(prev => prev.map(item => item.vehicleId === "v-wf-1" ? { ...item, maintenance: val } : item));
                          }}
                          className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" 
                        />
                      </div>
                    </div>
                  </div>

                </div>
              </div>


              {/* SECTION WIREFRAME #3: 'DRIVER ASSIGNMENT' LEDGER SECTION */}
              <div className="space-y-4 relative">
                {blueprintMode && (
                  <>
                    <div className="absolute -top-3 left-0 px-1.5 py-0.5 bg-indigo-500 text-slate-950 font-mono text-[8px] font-black uppercase rounded tracking-widest z-10">
                      Module 3: Driver Assignment Dashboard Grid Rows
                    </div>
                    <div className="absolute -bottom-3 right-0 text-[9.5px] font-mono text-indigo-400">
                      Trigger Interface: Inline Popover Assign Picker
                    </div>
                  </>
                )}

                <div className="bg-slate-900 border border-slate-850 rounded-3xl p-5 text-left space-y-4">
                  <div className="border-b border-slate-850 pb-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-100 flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-indigo-400" />
                      <span>Driver Assignment Ledger (Interactive Wireframe)</span>
                    </h4>
                    <p className="text-[10px] text-slate-500">Real-time device links & key asset assignments for active couriers</p>
                  </div>

                  <div className="space-y-3">
                    {wireframeVehicles.map((veh) => {
                      // Status color helper
                      let statusBg = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
                      let pulseColor = "bg-emerald-500";
                      if (veh.status === "In Use") {
                        statusBg = "bg-sky-500/10 text-sky-400 border-sky-500/20";
                        pulseColor = "bg-sky-400";
                      } else if (veh.status === "At Garage") {
                        statusBg = "bg-amber-500/10 text-amber-400 border-amber-500/20";
                        pulseColor = "bg-amber-400";
                      }

                      return (
                        <div key={veh.id} className="p-3 bg-slate-950 border border-slate-850 hover:border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-850 text-slate-400 group-hover:text-indigo-400 transition shrink-0">
                              <Car className="w-4.5 h-4.5" />
                            </div>
                            <div className="space-y-0.5">
                              <h5 className="text-xs font-black text-slate-100 leading-tight">{veh.name}</h5>
                              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                                <span>{veh.plateNumber}</span>
                                <span>•</span>
                                <span>Odo: {veh.odometer.toLocaleString()} km</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-3">
                            {/* Driver Assignment Badge */}
                            <div className="text-right">
                              <span className="text-[9px] uppercase text-slate-500 block font-bold">Assigned Driver</span>
                              <span className="text-xs font-bold text-slate-200 block">
                                {veh.currentDriver === "Unassigned" ? "❌ Unassigned" : `👤 ${veh.currentDriver}`}
                              </span>
                            </div>

                            {/* Status Indicator */}
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold flex items-center gap-1 border uppercase ${statusBg}`}>
                              <span className={`w-1 h-1 rounded-full ${pulseColor} animate-pulse`}></span>
                              <span>{veh.status}</span>
                            </span>

                            {/* Assign Driver Trigger */}
                            <button
                              onClick={() => setSelectedAssignVehicle(selectedAssignVehicle === veh.id ? null : veh.id)}
                              className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-850 hover:text-indigo-300 text-slate-300 text-[10px] font-bold rounded-xl transition border border-slate-850 cursor-pointer"
                            >
                              Assign / Swap
                            </button>
                          </div>

                          {/* Popover Selection Box */}
                          {selectedAssignVehicle === veh.id && (
                            <div className="w-full bg-slate-900 border border-slate-800 p-3 rounded-2xl mt-2 animate-fadeIn space-y-2 col-span-3">
                              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                                <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400">Choose Active Driver</span>
                                <button onClick={() => setSelectedAssignVehicle(null)} className="text-[10px] text-slate-500 hover:text-slate-300 font-bold">Close</button>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-[10px]">
                                {wireframeDrivers.map((drv) => (
                                  <button
                                    key={drv.id}
                                    onClick={() => handleAssignDriverToVehicle(veh.id, drv.id)}
                                    className="p-2 bg-slate-950 hover:bg-slate-850 hover:border-indigo-500/40 rounded-xl text-left text-slate-300 border border-slate-850 font-sans flex justify-between items-center"
                                  >
                                    <span>👤 {drv.name}</span>
                                    <span className="text-[8px] font-mono text-slate-500">{drv.status}</span>
                                  </button>
                                ))}
                                <button
                                  onClick={() => handleAssignDriverToVehicle(veh.id, "Unassigned")}
                                  className="p-2 bg-rose-950/10 hover:bg-rose-950/20 hover:border-rose-500/40 rounded-xl text-left text-rose-400 border border-rose-950/30 font-sans font-bold flex justify-between items-center"
                                >
                                  <span>❌ Clear Assignment</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>


              {/* SECTION WIREFRAME #4: 'DRIVER TRIP LOG' SUBMISSION FORM */}
              <div className="space-y-4 relative">
                {blueprintMode && (
                  <>
                    <div className="absolute -top-3 left-0 px-1.5 py-0.5 bg-indigo-500 text-slate-950 font-mono text-[8px] font-black uppercase rounded tracking-widest z-10">
                      Module 4: Driver Trip Log Submission Form Layout
                    </div>
                    <div className="absolute -bottom-3 right-0 text-[9.5px] font-mono text-indigo-400">
                      Upload State: Interactive Drag & Drop Receipt Simulator
                    </div>
                  </>
                )}

                <div className="bg-slate-900 border border-slate-850 rounded-3xl p-5 text-left space-y-4">
                  <div className="border-b border-slate-850 pb-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-100 flex items-center gap-1.5">
                      <Clipboard className="w-4 h-4 text-emerald-400" />
                      <span>Driver Trip Log Submission (Interactive Wireframe)</span>
                    </h4>
                    <p className="text-[10px] text-slate-500">Submitted directly by drivers via smartphone dashboard links</p>
                  </div>

                  <form onSubmit={handleSubmitWireframeTripLog} className="space-y-4">
                    
                    {/* Odometer readings */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1 text-xs">
                        <label className="text-[10px] uppercase text-slate-500 font-bold block">Start Odometer (km)</label>
                        <input 
                          type="number" 
                          required
                          value={startOdoInput} 
                          onChange={(e) => setStartOdoInput(Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-850 p-2 text-slate-200 rounded-xl font-mono text-xs focus:border-indigo-500/50" 
                        />
                        <span className="text-[9px] text-slate-500 leading-tight">Verified by vehicle telemetry</span>
                      </div>
                      <div className="space-y-1 text-xs">
                        <label className="text-[10px] uppercase text-slate-500 font-bold block">End Odometer (km)</label>
                        <input 
                          type="number" 
                          required
                          value={endOdoInput} 
                          onChange={(e) => setEndOdoInput(Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-850 p-2 text-slate-200 rounded-xl font-mono text-xs focus:border-indigo-500/50" 
                        />
                        <span className="text-[9px] text-slate-500 leading-tight">Distance traveled: <strong className="text-slate-300 font-mono">{endOdoInput - startOdoInput} km</strong></span>
                      </div>
                    </div>

                    {/* Trip purpose & coordinates placeholder */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1 text-xs">
                        <label className="text-[10px] uppercase text-slate-500 font-bold block">Trip Purpose Dropdown</label>
                        <select 
                          value={tripPurposeInput} 
                          onChange={(e) => setTripPurposeInput(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 p-2 text-slate-200 rounded-xl text-xs"
                        >
                          <option value="VIP Client Pick">VIP Client Transfer</option>
                          <option value="Delivery Dispatch">Courier Goods Delivery</option>
                          <option value="Office Cargo Logistics">Internal Office Cargo</option>
                          <option value="Personal Errand">Boss Personal Request</option>
                          <option value="Scheduled Maintenance Swap">Garage Swap Drive</option>
                        </select>
                      </div>

                      <div className="space-y-1 text-xs">
                        <label className="text-[10px] uppercase text-slate-500 font-bold block flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-indigo-400" />
                          <span>GPS Coordinates (Telematics Match)</span>
                        </label>
                        <div className="w-full bg-slate-950/60 border border-slate-850 p-2 text-slate-400 rounded-xl font-mono text-[10px] flex items-center justify-between">
                          <span className="truncate">{tripCoords}</span>
                          <span className="bg-indigo-500/10 text-indigo-400 text-[8px] px-1.5 py-0.5 rounded-full font-sans uppercase font-bold tracking-wider">Matched</span>
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-1 text-xs">
                      <label className="text-[10px] uppercase text-slate-500 font-bold block">Trip Log Notes</label>
                      <textarea 
                        rows={2}
                        value={tripNotesInput}
                        onChange={(e) => setTripNotesInput(e.target.value)}
                        placeholder="Specify traffic delays, toll highway passes, or cargo issues."
                        className="w-full bg-slate-950 border border-slate-850 p-2 text-slate-200 rounded-xl text-xs font-sans focus:border-indigo-500/50"
                      />
                    </div>

                    {/* Receipt drag & drop block with OCR preview */}
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase text-slate-500 font-bold block flex items-center gap-1">
                        <ImageIcon className="w-3 h-3 text-emerald-400" />
                        <span>Log Proof & Fuel Ticket Receipts</span>
                      </label>

                      <div 
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDropFile}
                        className={`border-2 border-dashed rounded-2xl p-5 text-center transition relative ${
                          isDraggingFile 
                            ? 'border-indigo-500 bg-indigo-500/5' 
                            : 'border-slate-800 hover:border-slate-750 bg-slate-950/40'
                        }`}
                      >
                        {attachedReceiptFile ? (
                          <div className="flex items-center gap-4 text-left">
                            <div className="p-1 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shrink-0">
                              <img 
                                src={attachedReceiptFile.preview} 
                                alt="Receipt Thumbnail" 
                                className="w-14 h-14 object-cover rounded-lg"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <div className="space-y-0.5 flex-1 min-w-0">
                              <div className="flex justify-between items-start gap-1">
                                <h5 className="text-xs font-bold text-slate-200 truncate">{attachedReceiptFile.name}</h5>
                                <button 
                                  type="button" 
                                  onClick={() => setAttachedReceiptFile(null)}
                                  className="text-[10px] text-rose-400 hover:text-rose-300 font-bold font-mono"
                                >
                                  REMOVE
                                </button>
                              </div>
                              <p className="text-[10px] text-slate-500 font-mono">{attachedReceiptFile.size}</p>
                              <div className="text-[9.5px] text-emerald-400 font-bold flex items-center gap-1">
                                <Sparkles className="w-3 h-3 animate-spin" />
                                <span>OCR parsed: $45.00 USD • TotalGas PP</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2 cursor-pointer" onClick={handleSelectMockReceipt}>
                            <Upload className="w-6 h-6 text-slate-500 mx-auto" />
                            <div className="text-xs text-slate-400">
                              <span className="font-bold text-indigo-400">Drag & drop receipt photo</span> or click to upload
                            </div>
                            <p className="text-[9px] text-slate-500">Supports PNG, JPG, WebP up to 5MB (Automated OCR Parsing)</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        disabled={isSubmittingTrip}
                        className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/40 text-slate-950 font-black rounded-xl transition flex items-center gap-2 text-xs"
                      >
                        {isSubmittingTrip ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Verifying Odometer Records...</span>
                          </>
                        ) : (
                          <>
                            <Clipboard className="w-3.5 h-3.5" />
                            <span>Submit to Fleet Manager</span>
                          </>
                        )}
                      </button>
                    </div>

                  </form>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* Device Frame bottom (If Mobile View) */}
        {deviceLayout === 'mobile' && (
          <div className="w-full bg-slate-900 py-3.5 rounded-b-[2.5rem] border-b border-x border-slate-800 flex justify-center items-center">
            <div className="w-32 h-1 bg-slate-600 rounded-full"></div>
          </div>
        )}

      </div>

    </div>
  );
}
