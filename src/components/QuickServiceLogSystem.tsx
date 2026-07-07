/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Wrench, 
  Car, 
  Sliders, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  User, 
  Plus, 
  Search, 
  QrCode, 
  Activity, 
  FileText, 
  ChevronRight, 
  Sparkles, 
  ThumbsUp, 
  ThumbsDown, 
  ShieldAlert, 
  Check, 
  RotateCcw, 
  Camera, 
  UserCheck, 
  Fuel, 
  Eye, 
  BookOpen, 
  X,
  CreditCard,
  ShoppingBag,
  Bell,
  CheckCircle2,
  Trash2,
  FileSpreadsheet,
  Mic,
  MicOff
} from "lucide-react";
import { VehicleProfile, MaintenanceRecord } from "../types";

// Dynamic Simulated Roles for the "My Daily Shortcuts" widget
export type SimulatedRole = 
  | 'Car Owner'
  | 'Garage Owner'
  | 'Garage Manager'
  | 'Cashier'
  | 'Mechanic/Technician'
  | 'Service Advisor'
  | 'Freelancer Technician'
  | 'Spare Parts Shop'
  | 'Petrol Station'
  | 'Super Admin';

interface QuickServiceLogProps {
  vehicles: VehicleProfile[];
  records: MaintenanceRecord[];
  activeVehicle: VehicleProfile | null;
  onSelectVehicle: (v: VehicleProfile) => void;
  onAddRecord: (record: {
    vehicleId: string;
    serviceCategory: string;
    cost: number;
    mileage: number;
    provider: string;
    description: string;
    date: string;
  }) => void;
  onNavigateTab?: (tabName: string) => void;
}

export const QuickServiceLogSystem: React.FC<QuickServiceLogProps> = ({
  vehicles,
  records,
  activeVehicle,
  onSelectVehicle,
  onAddRecord,
  onNavigateTab
}) => {
  // State for the Simulation Role
  const [activeSimRole, setActiveSimRole] = useState<SimulatedRole>('Garage Owner');
  
  // Dashboard & Modal UI control
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(1); // Step 1: Vehicle, Step 2: Templates & Info, Step 3: Diagnosis & Items, Step 4: Cost & Sign
  const [vList, setVList] = useState<VehicleProfile[]>(vehicles);

  // Form State
  const [selectedVId, setSelectedVId] = useState("");
  const [vType, setVType] = useState<'Gasoline' | 'Diesel' | 'EV' | 'Hybrid'>('Gasoline');
  const [currentMileage, setCurrentMileage] = useState("");
  const [plateNum, setPlateNum] = useState("");
  const [chassisNum, setChassisNum] = useState("");
  const [clientComplaint, setClientComplaint] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Engine Oil Change");

  // Hands-free Voice-to-Text Input States
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSpeechSupported(true);
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = false;
      rec.lang = "en-US";

      rec.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      rec.onresult = (event: any) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setClientComplaint((prev) => {
            const trimmed = prev.trim();
            return trimmed ? `${trimmed} ${finalTranscript.trim()}` : finalTranscript.trim();
          });
        }
      };

      rec.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        if (event.error === "not-allowed") {
          setSpeechError("Microphone permission denied.");
        } else if (event.error === "no-speech") {
          // Silent warning
        } else {
          setSpeechError(`Speech error: ${event.error}`);
        }
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }

    return () => {
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Stop listening when modal closes
  useEffect(() => {
    if (!isModalOpen && recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isModalOpen, isListening]);

  const toggleListening = () => {
    if (!isSpeechSupported || !recognitionRef.current) {
      setSpeechError("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        setSpeechError(null);
        recognitionRef.current.start();
      } catch (e) {
        console.error("Failed to start speech recognition:", e);
        setIsListening(false);
      }
    }
  };
  
  // Costs
  const [diagnosticFee, setDiagnosticFee] = useState("15");
  const [laborCost, setLaborCost] = useState("25");
  const [partsCost, setPartsCost] = useState("45");
  const [discount, setDiscount] = useState("5");
  const [paymentMethod, setPaymentMethod] = useState("ABA Pay");
  const [paymentStatus, setPaymentStatus] = useState("Unpaid");

  // Parts List
  const [addedParts, setAddedParts] = useState<{ name: string; brand: string; qty: number; price: number }[]>([
    { name: "Premium Synthetic Engine Oil", brand: "Castrol Edge", qty: 1, price: 35 },
    { name: "OEM Engine Oil Filter", brand: "Toyota Genuine Parts", qty: 1, price: 10 }
  ]);
  const [newPartName, setNewPartName] = useState("");
  const [newPartBrand, setNewPartBrand] = useState("");
  const [newPartQty, setNewPartQty] = useState(1);
  const [newPartPrice, setNewPartPrice] = useState(0);

  // QR Scanning Simulation
  const [isQrScanning, setIsQrScanning] = useState(false);
  const [scannedMessage, setScannedMessage] = useState("");

  // AI Assistant States
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<{
    causes: string[];
    risk: 'low' | 'medium' | 'high' | 'emergency';
    checklist: string[];
    suggestedSg: string;
    suggestedCode: string;
    warning: string;
    nextService: string;
  } | null>(null);

  // Digital Signature State
  const [isSigned, setIsSigned] = useState(false);
  const [showSignedNotice, setShowSignedNotice] = useState(false);

  // Active Offline Simulation
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // Custom Maintenance Templates State
  const [customTemplatesList, setCustomTemplatesList] = useState<any[]>([]);

  // Technician Workshop Job Queue State
  const [workshopJobsList, setWorkshopJobsList] = useState<any[]>([
    {
      id: "job-101",
      customerName: "Chan Sopheap",
      vehicle: "Toyota Prius (2018) [Hybrid]",
      plate: "PP-2N-1122",
      serviceCategory: "EV / Hybrid Battery System",
      complaint: "Hybrid battery indicator active, battery cooling fan filter choked.",
      progress: "In Progress", // In Progress, Completed, Waiting on Parts
      urgency: "High",
      assignedTime: "Today, 08:30 AM",
      partsNeeded: [
        { name: "Cooling Duct Fan Filter", brand: "OEM Standard", qty: 1, requested: true, status: "Delivered" }
      ]
    },
    {
      id: "job-102",
      customerName: "Ly Sophal",
      vehicle: "Ford Ranger Wildtrak (2021) [Diesel]",
      plate: "PP-2R-5491",
      serviceCategory: "Diesel Emission System",
      complaint: "Particulate filter warning active, diesel exhaust soot high.",
      progress: "Waiting on Parts",
      urgency: "Critical",
      assignedTime: "Today, 09:15 AM",
      partsNeeded: [
        { name: "DPF Decarb Chemical Solution", brand: "Liqui Moly", qty: 2, requested: true, status: "Dispatched from store" }
      ]
    },
    {
      id: "job-103",
      customerName: "Nguon Piseth",
      vehicle: "Tesla Model Y (2023) [EV]",
      plate: "PP-2X-8889",
      serviceCategory: "EV Battery Audit & Cell Check",
      complaint: "Routine traction safety check & BMS balance calibration.",
      progress: "Completed",
      urgency: "Medium",
      assignedTime: "Yesterday, 14:00 PM",
      partsNeeded: []
    }
  ]);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await fetch("/api/service-templates");
        if (res.ok) {
          setCustomTemplatesList(await res.json());
        }
      } catch (e) {
        console.error("Failed to load templates:", e);
      }
    };
    fetchTemplates();
  }, [isModalOpen]);

  const handleLoadCustomTemplateObject = (t: any) => {
    setSelectedCategory(t.category || "Engine Oil & Fluids");
    setClientComplaint(t.description || "");
    setDiagnosticFee(String(t.diagnosticFee || 0));
    setLaborCost(String(t.laborCost || 0));
    if (t.parts && t.parts.length > 0) {
      setAddedParts(t.parts.map((p: any) => ({
        name: p.name,
        brand: p.brand || "OEM",
        qty: p.qty || 1,
        price: p.price || 0
      })));
    } else {
      setAddedParts([]);
    }
  };

  // Auto initialize values when active vehicle shifts
  useEffect(() => {
    if (activeVehicle) {
      setSelectedVId(activeVehicle.id);
      setVType(activeVehicle.fuelType);
      setCurrentMileage(String(activeVehicle.mileage));
      setPlateNum(activeVehicle.plateNumber || "PP-2X-8889");
    } else if (vehicles.length > 0) {
      setSelectedVId(vehicles[0].id);
      setVType(vehicles[0].fuelType);
      setCurrentMileage(String(vehicles[0].mileage));
      setPlateNum(vehicles[0].plateNumber || "PP-2X-8889");
    }
  }, [activeVehicle, vehicles]);

  // Handle adding parts helper
  const handleAddPart = () => {
    if (!newPartName) return;
    setAddedParts(prev => [
      ...prev,
      { name: newPartName, brand: newPartBrand || "Generic", qty: newPartQty, price: newPartPrice }
    ]);
    setNewPartName("");
    setNewPartBrand("");
    setNewPartQty(1);
    setNewPartPrice(0);
  };

  // Simple automated local simulation for AI diagnosis recommendations
  const handleTriggerAiAssistant = () => {
    setIsAiAnalyzing(true);
    setTimeout(() => {
      let causes = ["General Wear & Tear", "Scheduled Maintenance Window Passed"];
      let risk: 'low' | 'medium' | 'high' | 'emergency' = 'low';
      let checklist = ["Inspect brake assemblies", "Inspect overall fluid levels", "Verify dashboard computer DTC logs"];
      let suggestedSg = "SG-001 General Inspection";
      let suggestedCode = "GEN-001";
      let warning = "Ensure secondary cooling fluids are capped tight prior to diagnostic run.";
      let nextService = "6 months or another 5,000 km";

      const complaintLower = clientComplaint.toLowerCase();
      const categoryLower = selectedCategory.toLowerCase();

      if (complaintLower.includes("brake") || categoryLower.includes("brake")) {
        causes = ["Brake pad wear down to sensors", "Rotor thickness below safe tolerance limits", "Moisture saturation in DOT4 brake hydraulic fluid"];
        risk = "high";
        checklist = ["Execute vernier caliper measurements on rotors", "Scan brake fluid moisture PPM count", "Examine vacuum booster performance"];
        suggestedSg = "SG-010 Brake System";
        suggestedCode = "BRK-002 Brake pad replacement";
        warning = "Stopping distance is significantly extended. Highly suggest avoiding highway runs prior to pad swaps.";
        nextService = "12 months / 10,000 km";
      } else if (complaintLower.includes("battery") || categoryLower.includes("battery") || vType === "EV") {
        causes = ["12V helper battery charge saturation failure", "High-voltage inverter cell temperature variance limit exceeded", "BMS cooling unit restriction"];
        risk = "medium";
        checklist = ["Query CAN-bus parameters via OBD diagnostic software", "Execute isolated state-of-health (SOH) high voltage grid diagnostics", "Test charger handshake signal"];
        suggestedSg = "SG-007 EV / Hybrid Battery System";
        suggestedCode = "EV-001 EV battery health check";
        warning = "High electrostatic warning! Always wear insulated protective gear while checking active inverters.";
        nextService = "12 months / 15,000 km";
      } else if (complaintLower.includes("ac") || categoryLower.includes("aircon") || complaintLower.includes("cold")) {
        causes = ["AC expansion valve restriction", "Refrigerant R134a weight under spec (leak suspected)", "Cabin secondary filter structural collapse"];
        risk = "low";
        checklist = ["Execute specialized pressure check with gauges", "Inspect AC condenser core fins for rock damages", "Examine compressor magnetic clutch action"];
        suggestedSg = "SG-014 Air Conditioning";
        suggestedCode = "AC-001 Weak AC";
        warning = "Low pressure line might hold residual leaks. Introduce environment-safe ultraviolet tracer dye.";
        nextService = "6 months / 5,000 km";
      } else if (vType === "Diesel") {
        causes = ["EGR soot accumulation", "Diesel fuel filter saturation", "Turbo vane sticking"];
        risk = "medium";
        checklist = ["Inspect exhaust backpressure logs", "Check diesel injector trim balance coefficients", "Verify intercooler hose structural sealing"];
        suggestedSg = "SG-006 Diesel Emission System";
        suggestedCode = "DSL-004 DPF clogged";
        warning = "Exceeded particulate threshold might prompt limp-home mode. Perform static backup DPF regeneration.";
        nextService = "6 months / 8,000 km";
      }

      setAiAnalysisResult({
        causes,
        risk,
        checklist,
        suggestedSg,
        suggestedCode,
        warning,
        nextService
      });
      setIsAiAnalyzing(false);
    }, 1200);
  };

  // Generate sum of costs
  const calculateTotal = () => {
    const diag = parseFloat(diagnosticFee) || 0;
    const labor = parseFloat(laborCost) || 0;
    const partsSum = addedParts.reduce((sum, item) => sum + (item.qty * item.price), 0);
    const disc = parseFloat(discount) || 0;
    const gTotal = diag + labor + partsSum - disc;
    return Math.max(0, gTotal);
  };

  // Quick preset loading helper based on powertrain type
  const handleLoadPowertrainQuickTemplate = (preset: string) => {
    if (preset === 'oil_change') {
      setSelectedCategory("Engine Oil & Fluids");
      setClientComplaint("Routine engine oil replacement interval reached.");
      setDiagnosticFee("10");
      setLaborCost("15");
      setAddedParts([
        { name: "Synthetic Motor Oil (5W-30)", brand: "Mobil 1", qty: 4, price: 12 },
        { name: "Original Filter Assembly", brand: "Toyota Genuine", qty: 1, price: 8 }
      ]);
    } else if (preset === 'ev_battery') {
      setSelectedCategory("EV / Hybrid Battery System");
      setClientComplaint("High-voltage traction grid evaluation and cell balance verification sweep.");
      setDiagnosticFee("40");
      setLaborCost("50");
      setAddedParts([
        { name: "Cooling Fan Filter Element", brand: "OEM Genuine", qty: 1, price: 25 },
        { name: "Inverter Coolant Flush Kit", brand: "Toyota Super Long Life", qty: 1, price: 40 }
      ]);
    } else if (preset === 'diesel_dpf') {
      setSelectedCategory("Diesel Emission System");
      setClientComplaint("High particulate backpressure alert. Diagnostic scan indicates soot warning.");
      setDiagnosticFee("30");
      setLaborCost("65");
      setAddedParts([
        { name: "Diesel Fuel Filter Element", brand: "Denso Quality", qty: 1, price: 30 },
        { name: "DPF Chemical Decarb Compound", brand: "Liqui Moly", qty: 2, price: 18 }
      ]);
    } else if (preset === 'hybrid_fan') {
      setSelectedCategory("EV / Hybrid Battery System");
      setClientComplaint("Hybrid battery air cooling channel inspection. Dirty fan intake check.");
      setDiagnosticFee("20");
      setLaborCost("35");
      setAddedParts([
        { name: "Channel Sealing Foam", brand: "OEM", qty: 1, price: 12 }
      ]);
    }
  };

  // Scan simulation helper
  const triggerSimulationScan = (v: VehicleProfile) => {
    setIsQrScanning(true);
    setScannedMessage("Searching secure vehicle registry database...");
    setTimeout(() => {
      setSelectedVId(v.id);
      setVType(v.fuelType);
      setCurrentMileage(String(v.mileage));
      setPlateNum(v.plateNumber || "PP-1A-9902");
      setScannedMessage(`Verified QR lookup match for vehicle ID: MCC-CAR-${v.id.substring(0, 8).toUpperCase()}`);
      setIsQrScanning(false);
    }, 1000);
  };

  // Save/Submit maintenance ticket form
  const handleFormSubmit = () => {
    const finalCost = calculateTotal();
    const activeV = vehicles.find(v => v.id === selectedVId) || activeVehicle || (vehicles.length > 0 ? vehicles[0] : null);
    
    if (!activeV) {
      alert("Please select a registered vehicle before finalizing.");
      return;
    }

    onAddRecord({
      vehicleId: activeV.id,
      serviceCategory: selectedCategory,
      cost: finalCost,
      mileage: parseFloat(currentMileage) || activeV.mileage,
      provider: activeSimRole === 'Freelancer Technician' ? "Independent Freelancer KH" : "Phnom Penh Precision Garage",
      description: `${vType} specific service. ${clientComplaint || "Routine general service checklist executed."} [Role: ${activeSimRole}]`,
      date: new Date().toISOString().split('T')[0]
    });

    setIsModalOpen(false);
    setActiveStep(1);
    setAiAnalysisResult(null);
    setIsSigned(false);
    
    // Smooth scroll top or notify success
    alert(`Success: Service registered. Monthly expense reports, upcoming reminders and service history for plate ${plateNum} have been generated under the vehicle profile!`);
  };

  // Delete part item from draft list
  const handleRemovePart = (index: number) => {
    setAddedParts(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* SECTION HEADER BLOCK */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2 font-sans">
            <Sliders className="w-5 h-5 text-indigo-400" />
            <span>Core Service Ticket & Shortcuts Workspace</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-2xl font-sans">
            Manage real-time service registrations, configure multi-role workspaces, and run instant QR checks. Switch roles below to test how the shortcuts widget adapts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-center">
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab("fix_my_car_bidding")}
              className="flex items-center gap-1.5 px-5 py-3.5 bg-emerald-500 hover:bg-emerald-450 text-slate-950 text-xs font-black rounded-xl transition hover:scale-[1.02] cursor-pointer shadow-lg"
            >
              <Wrench className="w-4 h-4" />
              <span>Fix My Car Bids</span>
            </button>
          )}

          {/* Master EASY Floating Trigger Button */}
          <button 
            onClick={() => {
              setIsModalOpen(true);
              setActiveStep(1);
            }}
            className="flex items-center gap-1.5 px-5 py-3.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg border border-indigo-450/30 transition hover:scale-[1.02] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Service Log</span>
          </button>
        </div>
      </div>

      {/* COMPREHENSIVE ROLE SELECTOR SIMULATOR COMPONENT */}
      <div className="glass rounded-3xl p-5 border border-white/10 relative overflow-hidden">
        <div className="absolute right-0 top-0 text-slate-500/5 translate-x-1/4 -translate-y-1/4 pointer-events-none">
          <Wrench className="w-48 h-48 stroke-[0.3]" />
        </div>

        <div className="flex items-center justify-between border-b border-white/15 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest font-mono">Role Simulation Environment</span>
          </div>
          <span className="text-[10px] text-slate-500">Allows instant workspace switching with live dashboard action binds</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-1.5 pt-4">
          {(['Car Owner', 'Garage Owner', 'Garage Manager', 'Cashier', 'Mechanic/Technician', 'Service Advisor', 'Freelancer Technician', 'Spare Parts Shop', 'Petrol Station', 'Super Admin'] as SimulatedRole[]).map((role) => (
            <button
              key={role}
              onClick={() => setActiveSimRole(role)}
              className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                activeSimRole === role
                  ? "bg-indigo-500/15 border-indigo-500/40 text-indigo-300 ring-1 ring-indigo-500/20"
                  : "bg-white/3 border-white/5 hover:border-white/12 text-slate-400 hover:text-slate-200"
              }`}
            >
              <User className={`w-3.5 h-3.5 ${activeSimRole === role ? 'text-indigo-400' : 'text-slate-500'}`} />
              <span className="text-[8.5px] font-bold tracking-tight truncate max-w-full">{role}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ADAPTIVE SHORTCUTS DASHBOARD MODULE - "My Daily Shortcuts" */}
      <div className="glass rounded-3xl p-6 border border-white/10 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1 px-2.5 bg-indigo-500/10 text-indigo-400 rounded-lg text-[10px] font-bold font-mono">
              ROLE: {activeSimRole.toUpperCase()}
            </div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5 font-sans">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>My Daily Shortcuts</span>
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-sans">
            Adaptively tailored toolkit for active Cambodian highway service workflows.
          </span>
        </div>

        {/* Dynamic Shortcut Cards Grid based on selected simulation role */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          
          {/* ========================================================
              ROLE 1: CAR OWNER SHORTCUTS
              ======================================================== */}
          {activeSimRole === 'Car Owner' && (
            <>
              <button onClick={() => { setIsModalOpen(true); setActiveStep(2); }} className="p-3.5 bg-white/5 border border-white/5 hover:border-white/12 rounded-xl text-left hover:bg-white/10 transition group text-xs cursor-pointer">
                <Wrench className="w-5 h-5 text-indigo-400 mb-2 group-hover:scale-110 transition" />
                <span className="font-bold text-slate-200 block">Add My Log</span>
                <span className="text-[10px] text-slate-500 mt-0.5 block">Record manual self-checks</span>
              </button>
              
              <button onClick={() => { setIsModalOpen(true); setActiveStep(1); }} className="p-3.5 bg-white/5 border border-white/5 hover:border-white/12 rounded-xl text-left hover:bg-white/10 transition group text-xs cursor-pointer">
                <QrCode className="w-5 h-5 text-rose-400 mb-2 group-hover:scale-110 transition" />
                <span className="font-bold text-slate-200 block">Scan Garage QR</span>
                <span className="text-[10px] text-slate-500 mt-0.5 block">Transmit profile info</span>
              </button>

              <button onClick={() => alert("Simulated roadside distress team alerted in area via Telegram API.")} className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-left hover:bg-rose-500/15 transition group text-xs cursor-pointer">
                <AlertTriangle className="w-5 h-5 text-rose-500 mb-2 group-hover:scale-110 transition animate-bounce" />
                <span className="font-bold text-rose-300 block">Report Car Problem</span>
                <span className="text-[10px] text-slate-500 mt-0.5 block">SOS road assistance</span>
              </button>

              <button onClick={() => { setIsModalOpen(true); handleLoadPowertrainQuickTemplate('oil_change'); setActiveStep(3); }} className="p-3.5 bg-white/5 border border-white/5 hover:border-white/12 rounded-xl text-left hover:bg-white/10 transition group text-xs cursor-pointer">
                <Fuel className="w-5 h-5 text-emerald-400 mb-2 group-hover:scale-110 transition" />
                <span className="font-bold text-slate-200 block">Add Fuel Record</span>
                <span className="text-[10px] text-slate-500 mt-0.5 block">Track ltr consumption</span>
              </button>

              <button onClick={() => alert("Routing you to verified local garages in Cambodia locator map...")} className="p-3.5 bg-white/5 border border-white/5 hover:border-white/12 rounded-xl text-left hover:bg-white/10 transition group text-xs cursor-pointer">
                <CheckCircle className="w-5 h-5 text-sky-400 mb-2 group-hover:scale-110 transition" />
                <span className="font-bold text-slate-200 block">Set Next Reminder</span>
                <span className="text-[10px] text-slate-500 mt-0.5 block">App push settings</span>
              </button>

              <button onClick={() => { setIsModalOpen(true); setActiveStep(4); }} className="p-3.5 bg-white/5 border border-white/5 hover:border-white/12 rounded-xl text-left hover:bg-white/10 transition group text-xs cursor-pointer">
                <UserCheck className="w-5 h-5 text-amber-400 mb-2 group-hover:scale-110 transition" />
                <span className="font-bold text-slate-200 block">Accept Garage Record</span>
                <span className="text-[10px] text-slate-400 font-semibold block">Pending logs toggle</span>
              </button>
            </>
          )}

          {/* ========================================================
              ROLE 2: GARAGE OWNER SHORTCUTS
              ======================================================== */}
          {activeSimRole === 'Garage Owner' && (
            <>
              <button onClick={() => { setIsModalOpen(true); setActiveStep(1); }} className="p-3.5 bg-white/5 border border-white/5 hover:border-white/12 rounded-xl text-left hover:bg-white/10 transition group text-xs cursor-pointer">
                <Plus className="w-5 h-5 text-violet-400 mb-2" />
                <span className="font-bold text-slate-200 block">New Service Ticket</span>
                <span className="text-[10px] text-slate-500 mt-0.5 block">Initiate bay register</span>
              </button>

              <button 
                onClick={() => {
                  if (vehicles.length > 0) {
                    triggerSimulationScan(vehicles[0]);
                    setIsModalOpen(true);
                  } else {
                    alert("No registered user profiles found to simulate scan.");
                  }
                }} 
                className="p-3.5 bg-white/5 border border-white/5 hover:border-white/12 rounded-xl text-left hover:bg-white/10 transition group text-xs cursor-pointer"
              >
                <QrCode className="w-5 h-5 text-rose-455 mb-2 group-hover:scale-110 transition" />
                <span className="font-bold text-slate-200 block">Scan Customer QR</span>
                <span className="text-[10px] text-slate-500 mt-0.5 block">Search vehicle profile</span>
              </button>

              <div className="p-3.5 bg-white/5 border border-white/5 rounded-xl text-left col-span-2 text-xs">
                <span className="text-[10px] text-slate-500 block">Find customer database:</span>
                <div className="flex gap-1.5 mt-1.5">
                  <input 
                    type="text" 
                    placeholder="Plate/Phone..."
                    className="flex-1 bg-black/40 border border-white/10 text-xs px-2.5 py-1 text-slate-200 rounded-lg focus:outline-none"
                  />
                  <button onClick={() => alert("Searching plate registers...")} className="p-1 px-2.5 bg-indigo-500 text-white text-[10px] font-bold rounded-lg hover:bg-indigo-600 transition cursor-pointer">
                    Search
                  </button>
                </div>
              </div>

              <button onClick={() => alert("Assigned mechanics notified on active diagnostic checklists")} className="p-3.5 bg-white/5 border border-white/5 hover:border-white/12 rounded-xl text-left hover:bg-white/10 transition group text-xs cursor-pointer">
                <UserCheck className="w-5 h-5 text-sky-400 mb-2" />
                <span className="font-bold text-slate-200 block">Assign Mechanic</span>
                <span className="text-[10px] text-slate-500 mt-0.5 block">Configure schedule</span>
              </button>

              <button onClick={() => alert("Platform revenue reports compiled. PDF and Excel spreadsheets exports available under diagnostic logs tab.")} className="p-3.5 bg-white/5 border border-white/5 hover:border-white/12 rounded-xl text-left hover:bg-white/10 transition group text-xs cursor-pointer">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400 mb-2" />
                <span className="font-bold text-slate-200 block">Garage Daily Report</span>
                <span className="text-[10px] text-slate-500 mt-0.5 block">Export stats & metrics</span>
              </button>
            </>
          )}

          {/* ========================================================
              ROLE 3: GARAGE MANAGER SHORTCUTS
              ======================================================== */}
          {activeSimRole === 'Garage Manager' && (
            <>
              <button onClick={() => { setIsModalOpen(true); setActiveStep(1); }} className="p-3.5 bg-white/5 border border-white/5 hover:border-white/12 rounded-xl text-left hover:bg-white/10 transition group text-xs cursor-pointer">
                <Wrench className="w-5 h-5 text-indigo-400 mb-2" />
                <span className="font-bold text-slate-200 block">New Service Ticket</span>
                <span className="text-[10px] text-slate-500 mt-0.5 block">Register problem</span>
              </button>

              <button onClick={() => alert("Notification sent to client requesting record validation.")} className="p-3.5 bg-white/5 border border-white/5 hover:border-white/12 rounded-xl text-left hover:bg-white/10 transition group text-xs cursor-pointer">
                <Bell className="w-5 h-5 text-amber-400 mb-2" />
                <span className="font-bold text-slate-200 block">Send Reminder</span>
                <span className="text-[10px] text-slate-500 mt-0.5 block">Notify customer pickup</span>
              </button>

              <button onClick={() => alert("Parts requisition submitted to partner spare parts shops.")} className="p-3.5 bg-white/5 border border-white/5 hover:border-white/12 rounded-xl text-left hover:bg-white/10 transition group text-xs cursor-pointer">
                <ShoppingBag className="w-5 h-5 text-sky-400 mb-2" />
                <span className="font-bold text-slate-200 block">Pending Parts</span>
                <span className="text-[10px] text-slate-500 mt-0.5 block">Request SKU approval</span>
              </button>

              <button onClick={() => alert("Active work quality checklist confirmed for Bay 2.")} className="p-3.5 bg-white/5 border border-white/5 hover:border-white/12 rounded-xl text-left hover:bg-white/10 transition group text-xs cursor-pointer">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mb-2" />
                <span className="font-bold text-slate-200 block">Quality Check</span>
                <span className="text-[10px] text-slate-500 mt-0.5 block">Audit diagnostic logs</span>
              </button>
            </>
          )}

          {/* ========================================================
              ROLE 4: CASHIER SHORTCUTS
              ======================================================== */}
          {activeSimRole === 'Cashier' && (
            <>
              <button onClick={() => { setIsModalOpen(true); setActiveStep(4); }} className="p-3.5 bg-white/5 border border-white/5 hover:border-white/12 rounded-xl text-left hover:bg-white/10 transition group text-xs cursor-pointer">
                <CreditCard className="w-5 h-5 text-emerald-400 mb-2" />
                <span className="font-bold text-slate-200 block">Generate Invoice</span>
                <span className="text-[10px] text-slate-500 mt-0.5 block">Tally overall costs</span>
              </button>

              <button onClick={() => alert("Mock receipt compiled and dispatched to user Telegram bot.")} className="p-3.5 bg-white/5 border border-white/5 hover:border-white/12 rounded-xl text-left hover:bg-white/10 transition group text-xs cursor-pointer">
                <FileText className="w-5 h-5 text-slate-300 mb-2" />
                <span className="font-bold text-slate-200 block">Print QR Receipt</span>
                <span className="text-[10px] text-slate-500 mt-0.5 block">Generates ABA direct QR</span>
              </button>

              <button onClick={() => alert("Sales log submitted to regional supervisor.")} className="p-3.5 bg-white/5 border border-white/5 hover:border-white/12 rounded-xl text-left hover:bg-white/10 transition group text-xs cursor-pointer">
                <ShoppingBag className="w-5 h-5 text-indigo-400 mb-2" />
                <span className="font-bold text-slate-200 block">Package Sale</span>
                <span className="text-[10px] text-slate-500 mt-0.5 block">Register active membership</span>
              </button>
            </>
          )}

          {/* ========================================================
              ROLE 5: MECHANIC SHORTCUTS
              ======================================================== */}
          {activeSimRole === 'Mechanic/Technician' && (
            <>
              <button onClick={() => { setIsModalOpen(true); setActiveStep(1); }} className="p-3.5 bg-white/5 border border-white/5 hover:border-white/12 rounded-xl text-left hover:bg-white/10 transition group text-xs cursor-pointer">
                <Wrench className="w-5 h-5 text-indigo-400 mb-2" />
                <span className="font-bold text-slate-200 block">My Assigned Jobs</span>
                <span className="text-[10px] text-slate-500 mt-0.5 block">Open dashboard queue</span>
              </button>

              <button onClick={() => { setIsModalOpen(true); setActiveStep(3); handleTriggerAiAssistant(); }} className="p-3.5 bg-white/5 border border-white/5 hover:border-white/12 rounded-xl text-left hover:bg-white/10 transition group text-xs cursor-pointer">
                <Camera className="w-5 h-5 text-sky-400 mb-2" />
                <span className="font-bold text-slate-200 block">Upload Evidence</span>
                <span className="text-[10px] text-slate-500 mt-0.5 block">Attach bay photos</span>
              </button>

              <button onClick={() => alert("Parts acquisition request dispatched to warehouse technician...")} className="p-3.5 bg-white/5 border border-white/5 hover:border-white/12 rounded-xl text-left hover:bg-white/10 transition group text-xs cursor-pointer">
                <Sliders className="w-5 h-5 text-amber-500 mb-2" />
                <span className="font-bold text-slate-200 block">Request Spare Parts</span>
                <span className="text-[10px] text-slate-500 mt-0.5 block">Select SKU catalog</span>
              </button>

              <button onClick={() => { setIsModalOpen(true); setActiveStep(4); }} className="p-3.5 bg-white/5 border border-white/5 hover:border-white/12 rounded-xl text-left hover:bg-white/10 transition group text-xs cursor-pointer">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mb-2" />
                <span className="font-bold text-slate-200 block">Mark Job Complete</span>
                <span className="text-[10px] text-slate-500 mt-0.5 block">Submit to supervisor</span>
              </button>
            </>
          )}

          {/* ========================================================
              ROLE 6: SERVICE ADVISOR SHORTCUTS
              ======================================================== */}
          {activeSimRole === 'Service Advisor' && (
            <>
              <button onClick={() => { setIsModalOpen(true); setActiveStep(1); }} className="p-3.5 bg-white/5 border border-white/5 hover:border-white/12 rounded-xl text-left hover:bg-white/10 transition group text-xs cursor-pointer">
                <Car className="w-5 h-5 text-sky-400 mb-2" />
                <span className="font-bold text-slate-200 block">Receive Vehicle</span>
                <span className="text-[10px] text-slate-500 mt-0.5 block">Begin intake check</span>
              </button>

              <button onClick={() => { setIsModalOpen(true); setActiveStep(2); }} className="p-3.5 bg-white/5 border border-white/5 hover:border-white/12 rounded-xl text-left hover:bg-white/10 transition group text-xs cursor-pointer">
                <FileText className="w-5 h-5 text-emerald-400 mb-2" />
                <span className="font-bold text-slate-200 block">Estimate Cost</span>
                <span className="text-[10px] text-slate-500 mt-0.5 block">Send quote recommendation</span>
              </button>
            </>
          )}

          {/* ========================================================
              ROLE 7: FREELANCER TECHNICIAN SHORTCUTS
              ======================================================== */}
          {activeSimRole === 'Freelancer Technician' && (
            <>
              <button onClick={() => { setIsModalOpen(true); setActiveStep(1); }} className="p-3.5 bg-white/5 border border-white/5 hover:border-white/12 rounded-xl text-left hover:bg-white/10 transition group text-xs cursor-pointer">
                <Wrench className="w-5 h-5 text-amber-400 mb-2" />
                <span className="font-bold text-slate-200 block">Create Job Log</span>
                <span className="text-[10px] text-slate-500 mt-0.5 block">Record onsite repair</span>
              </button>

              <button onClick={() => alert("Dispatching SMS & Telegram approval alert hook directly to vehicle owner.")} className="p-3.5 bg-white/5 border border-white/5 hover:border-white/12 rounded-xl text-left hover:bg-white/10 transition group text-xs cursor-pointer">
                <UserCheck className="w-5 h-5 text-indigo-400 mb-2" />
                <span className="font-bold text-slate-200 block">Ask Safe Approval</span>
                <span className="text-[10px] text-slate-500 mt-0.5 block">Prevent liability issues</span>
              </button>
            </>
          )}

          {/* ========================================================
              ROLE 8: SPARE PARTS SHOP SHORTCUTS
              ======================================================== */}
          {activeSimRole === 'Spare Parts Shop' && (
            <>
              <button onClick={() => { setIsModalOpen(true); handleLoadPowertrainQuickTemplate('oil_change'); setActiveStep(3); }} className="p-3.5 bg-white/5 border border-white/5 hover:border-white/12 rounded-xl text-left hover:bg-white/10 transition group text-xs cursor-pointer">
                <ShoppingBag className="w-5 h-5 text-sky-400 mb-2" />
                <span className="font-bold text-slate-200 block">Create Parts Sale</span>
                <span className="text-[10px] text-slate-500 mt-0.5 block">Log catalog parts sold</span>
              </button>

              <button onClick={() => alert("Added warranty registration card inside verified customer wallet")} className="p-3.5 bg-white/5 border border-white/5 hover:border-white/12 rounded-xl text-left hover:bg-white/10 transition group text-xs cursor-pointer">
                <ShieldAlert className="w-5 h-5 text-emerald-400 mb-2" />
                <span className="font-bold text-slate-200 block">Attach Warranty</span>
                <span className="text-[10px] text-slate-500 mt-0.5 block">Sync registration SKU</span>
              </button>
            </>
          )}

          {/* ========================================================
              ROLE 9: PETROL STATION SHORTCUTS
              ======================================================== */}
          {activeSimRole === 'Petrol Station' && (
            <>
              <button onClick={() => { setIsModalOpen(true); handleLoadPowertrainQuickTemplate('oil_change'); setActiveStep(2); }} className="p-3.5 bg-white/5 border border-white/5 hover:border-white/12 rounded-xl text-left hover:bg-white/10 transition group text-xs cursor-pointer">
                <Fuel className="w-5 h-5 text-amber-400 mb-2" />
                <span className="font-bold text-slate-200 block">Log Dispenser Fuel</span>
                <span className="text-[10px] text-slate-500 mt-0.5 block">Track quantity & mileage</span>
              </button>
            </>
          )}

          {/* ========================================================
              ROLE 10: SUPER ADMIN SHORTCUTS
              ======================================================== */}
          {activeSimRole === 'Super Admin' && (
            <>
              <button onClick={() => alert("Opening all database platform logs...")} className="p-3.5 bg-white/5 border border-white/5 hover:border-white/12 rounded-xl text-left hover:bg-white/10 transition group text-xs cursor-pointer">
                <Activity className="w-5 h-5 text-indigo-400 mb-2" />
                <span className="font-bold text-slate-200 block">Platform Tickets</span>
                <span className="text-[10px] text-slate-500 mt-0.5 block">Verify regional counts</span>
              </button>

              <button onClick={() => alert("Form template presets system refreshed")} className="p-3.5 bg-white/5 border border-white/5 hover:border-white/12 rounded-xl text-left hover:bg-white/10 transition group text-xs cursor-pointer">
                <Sliders className="w-5 h-5 text-emerald-400 mb-2" />
                <span className="font-bold text-slate-200 block">Manage Templates</span>
                <span className="text-[10px] text-slate-500 mt-0.5 block">Update category options</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* ----------------- TECHNICIAN WORKSHOP MODULE ----------------- */}
      {(activeSimRole === 'Mechanic/Technician' || activeSimRole === 'Freelancer Technician') && (
        <div className="glass rounded-3xl p-5 border border-white/10 space-y-4 bg-slate-950/40">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-white/10">
            <div className="space-y-0.5">
              <h3 className="text-xs font-bold text-slate-355 text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-emerald-400 animate-pulse animate-duration-2000" />
                <span>🔧 Live Technician Workshop Control Bay</span>
              </h3>
              <p className="text-[10px] text-slate-400">
                View assigned vehicle service cards, request spare parts from warehouse, and transition task statuses.
              </p>
            </div>
            
            <div className="flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-550/20 border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase">STATION #4 LIVE</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workshopJobsList.map((job) => {
              return (
                <div key={job.id} className="p-4 bg-slate-950/80 border border-white/5 rounded-2xl space-y-4 hover:border-white/10 transition relative">
                  
                  {/* Card Header */}
                  <div className="flex justify-between items-start gap-2">
                    <div className="space-y-0.5">
                      <span className="text-[9px] text-slate-500 font-mono font-semibold block">{job.assignedTime}</span>
                      <h4 className="text-xs font-extrabold text-white">{job.vehicle}</h4>
                      <p className="text-[10px] text-slate-350 text-slate-300 flex items-center gap-1 flex-wrap">
                        <span>Plate: <strong className="text-white font-mono">{job.plate}</strong></span>
                        <span>•</span>
                        <span>Owner: <strong className="text-slate-200">{job.customerName}</strong></span>
                      </p>
                    </div>

                    <span className={`text-[8px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded border leading-none ${
                      job.urgency === 'Critical' 
                        ? 'bg-red-500/10 text-red-400 border-red-500/20 animate-pulse'
                        : job.urgency === 'High'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-slate-800 text-slate-400 border-white/5'
                    }`}>
                      {job.urgency}
                    </span>
                  </div>

                  {/* Complaint detail */}
                  <div className="bg-white/3 p-2.5 rounded-xl border border-white/5">
                    <span className="text-[8.5px] uppercase font-bold text-emerald-450 text-emerald-400 block mb-0.5">Diagnosed Problem / Task:</span>
                    <p className="text-[10.5px] text-slate-300 italic leading-relaxed font-sans">
                      &quot;{job.complaint}&quot;
                    </p>
                  </div>

                  {/* Status update controller */}
                  <div className="space-y-1.5">
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">Bay Progress Status:</span>
                    <div className="flex gap-2">
                      <select
                        value={job.progress}
                        onChange={(e) => {
                          const newStatus = e.target.value;
                          setWorkshopJobsList(prev => prev.map(item => 
                            item.id === job.id ? { ...item, progress: newStatus } : item
                          ));
                          alert(`Job ${job.id} workflow status updated to: ${newStatus}`);
                        }}
                        className="w-full bg-slate-900 border border-white/10 text-[10.5px] p-2 rounded-xl text-slate-300 outline-none"
                      >
                        <option value="In Progress">⚡ In Progress / Active dismantling</option>
                        <option value="Waiting on Parts">⏳ Waiting on Spare Parts</option>
                        <option value="Completed">✅ Work Completed / Clean bay</option>
                      </select>
                    </div>
                  </div>

                  {/* Handled Spare Parts Request */}
                  <div className="p-2.5 bg-black/40 rounded-xl space-y-2 border border-white/5">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] uppercase font-bold text-slate-500 block">Assigned Parts Logs ({job.partsNeeded.length}):</span>
                    </div>

                    {job.partsNeeded.length > 0 ? (
                      <div className="space-y-1.5 max-h-[120px] overflow-y-auto">
                        {job.partsNeeded.map((p: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center text-[10px] bg-white/2 p-1.5 rounded border border-white/5">
                            <span className="text-slate-300">{p.name} <span className="text-slate-500">x{p.qty}</span></span>
                            <span className={`text-[8px] px-1.5 rounded font-bold uppercase leading-none ${
                              p.status.includes("Pending") 
                                ? "bg-amber-500/10 text-amber-500 border border-amber-500/15 animate-pulse"
                                : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15"
                            }`}>
                              {p.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[9px] text-slate-500 font-mono italic">No spare parts dispatched to this station.</p>
                    )}

                    {/* Quick request inline builder */}
                    <div className="pt-2 border-t border-white/5 flex gap-1">
                      <input 
                        type="text" 
                        placeholder="Request spare part name..."
                        id={`reqpart-${job.id}`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const inputEl = document.getElementById(`reqpart-${job.id}`) as HTMLInputElement;
                            if (inputEl && inputEl.value.trim() !== "") {
                              const pName = inputEl.value.trim();
                              
                              // Add to parts needed
                              setWorkshopJobsList(prev => prev.map(item => {
                                if (item.id === job.id) {
                                  return {
                                    ...item,
                                    partsNeeded: [
                                      ...item.partsNeeded,
                                      { name: pName, brand: "GENUINE-KH", qty: 1, requested: true, status: "Pending Warehouse Approval" }
                                    ]
                                  };
                                }
                                return item;
                              }));

                              alert(`Requested "${pName}" for customer bay job. Triggered notification to parts cashier warehouse!`);
                              inputEl.value = "";
                            }
                          }
                        }}
                        className="w-full bg-slate-900 border border-white/10 p-1.5 text-[10px] rounded-lg text-white"
                      />
                      <button 
                        onClick={() => {
                          const inputEl = document.getElementById(`reqpart-${job.id}`) as HTMLInputElement;
                          if (inputEl && inputEl.value.trim() !== "") {
                            const pName = inputEl.value.trim();
                            // Add to parts
                            setWorkshopJobsList(prev => prev.map(item => {
                              if (item.id === job.id) {
                                return {
                                  ...item,
                                  partsNeeded: [
                                    ...item.partsNeeded,
                                    { name: pName, brand: "GENUINE-KH", qty: 1, requested: true, status: "Pending Warehouse Approval" }
                                  ]
                                };
                              }
                              return item;
                            }));
                            alert(`Requested "${pName}" for customer bay job. Triggered notification to parts cashier warehouse!`);
                            inputEl.value = "";
                          }
                        }}
                        className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 font-extrabold text-white text-[9px] rounded-lg transition cursor-pointer"
                      >
                        Request
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DETAILED MOCK TRANSACTION LOGS UNDER PROGRESS REPORT BLOCK */}
      <div className="glass rounded-3xl p-5 border border-white/10 space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 pb-2 border-b border-white/10">
          <BookOpen className="w-4 h-4 text-emerald-400" />
          <span>Recent Digital Logs & Service Registry Archive</span>
        </h3>
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          {records.slice(-4).reverse().map((record) => (
            <div key={record.id} className="p-3.5 bg-white/3 border border-white/5 hover:border-white/10 rounded-xl flex items-center justify-between gap-3 flex-wrap">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-bold text-slate-200">{record.serviceCategory}</span>
                  <span className="text-[9px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.5 rounded font-mono font-semibold">
                    ${record.cost} USD
                  </span>
                  <span className="text-[9px] bg-slate-500/10 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                    {record.mileage.toLocaleString()} km
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-1">{record.description}</p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[10px] text-slate-500 font-mono">{record.date}</span>
                <span className="text-[9px] px-2 py-0.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 rounded font-bold uppercase tracking-wide">
                  Approved
                </span>
              </div>
            </div>
          ))}
          {records.length === 0 && (
            <p className="text-xs text-slate-500 text-center py-6">No service ticket records log compiled yet.</p>
          )}
        </div>
      </div>

      {/* ========================================================
          STEP-BY-STEP SERVICE LOG REGISTER WIZARD MODAL 
          ======================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl relative animate-fade-in flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-white/10 bg-black/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
                  <Wrench className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100 font-sans">
                    New Maintenance Ticket Register
                  </h3>
                  <p className="text-xs text-slate-450 text-slate-400 mt-0.5">
                    Step {activeStep} of 4 • Form context set for role: <strong className="text-indigo-400">{activeSimRole}</strong>
                  </p>
                </div>
              </div>
              
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 hover:text-slate-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper Progress Bar */}
            <div className="bg-black/40 px-6 py-2.5 flex items-center justify-between border-b border-white/5 text-center text-[10px] font-sans font-bold">
              {[
                { s: 1, label: "Identify Vehicle" },
                { s: 2, label: "Select Service" },
                { s: 3, label: "Add Diagnosis & Parts" },
                { s: 4, label: "Cost & Finalize" }
              ].map((step) => (
                <button
                  key={step.s}
                  onClick={() => setActiveStep(step.s)}
                  className={`flex items-center gap-1 transition ${
                    activeStep === step.s 
                      ? "text-indigo-400 font-extrabold" 
                      : activeStep > step.s 
                        ? "text-emerald-400 font-semibold" 
                        : "text-slate-500 shrink-0"
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[8.5px] ${
                    activeStep === step.s
                      ? "bg-indigo-500 text-slate-900" 
                      : activeStep > step.s 
                        ? "bg-emerald-500 text-slate-900" 
                        : "bg-white/5 border border-white/10"
                  }`}>
                    {step.s}
                  </span>
                  <span className="hidden sm:inline">{step.label}</span>
                </button>
              ))}
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">

              {/* ==========================================
                  STEP 1: VEHICLE INDENTIFICATION / PROFILE
                  ========================================== */}
              {activeStep === 1 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-bold text-slate-350 tracking-wider block">Find or select the vehicle card profile:</span>
                    
                    {/* Simulated Quick QR Scanner Integration Trigger */}
                    <button 
                      onClick={() => {
                        if (vehicles.length > 0) {
                          triggerSimulationScan(vehicles[0]);
                        } else {
                          alert("No vehicle profiles registered yet.");
                        }
                      }}
                      className="text-[10px] uppercase font-bold bg-rose-500/10 hover:bg-rose-500/15 text-rose-350 border border-rose-500/25 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>{isQrScanning ? "Scanning..." : "[Simulate Scan Vehicle QR]"}</span>
                    </button>
                  </div>

                  {isQrScanning && (
                    <div className="relative overflow-hidden w-full h-44 bg-slate-950 border border-rose-500/20 rounded-2xl flex flex-col items-center justify-center p-4">
                      {/* Viewfinder corners */}
                      <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-rose-500/80 rounded-tl-sm animate-pulse" />
                      <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-rose-500/80 rounded-tr-sm animate-pulse" />
                      <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-rose-500/80 rounded-bl-sm animate-pulse" />
                      <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-rose-500/80 rounded-br-sm animate-pulse" />

                      {/* Moving laser scanline overlay */}
                      <div 
                        className="absolute left-3 right-3 h-[2px] bg-rose-500 shadow-[0_0_10px_2px_rgba(244,63,94,0.85)]" 
                        style={{
                          animation: 'qrscan 1.8s infinite ease-in-out',
                          position: 'absolute'
                        }}
                      />

                      <QrCode className="w-10 h-10 text-rose-500/20 animate-pulse mb-1.5" />
                      <span className="text-[10px] font-mono font-bold tracking-widest text-rose-450 text-rose-400 uppercase animate-pulse">CAPTURING QR KEYWORDS...</span>
                      <span className="text-[9px] font-mono text-slate-500 mt-1">{scannedMessage}</span>
                    </div>
                  )}

                  {!isQrScanning && scannedMessage && (
                    <div className="bg-emerald-500/10 border border-emerald-500/25 p-3 rounded-xl text-xs text-emerald-300 font-semibold flex items-center gap-2 animate-fade-in font-mono">
                      <QrCode className="w-4 h-4 text-emerald-400" />
                      <span>{scannedMessage}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* User Vehicle Selector Dropdown */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] text-slate-400 font-bold block uppercase">Select Profile</label>
                      <select 
                        value={selectedVId}
                        onChange={(e) => {
                          const vObj = vehicles.find(v => v.id === e.target.value);
                          if (vObj) {
                            setSelectedVId(vObj.id);
                            setVType(vObj.fuelType);
                            setCurrentMileage(String(vObj.mileage));
                            setPlateNum(vObj.plateNumber || "");
                          }
                        }}
                        className="w-full bg-slate-950 border border-white/10 text-xs px-3 py-2.5 rounded-xl text-slate-250 focus:border-indigo-500 focus:outline-none"
                      >
                        {vehicles.map(v => (
                          <option key={v.id} value={v.id}>
                            {v.brand} {v.model} - Plate: {v.plateNumber || "PP-2X-8889"}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Powertrain Identifier indicator */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] text-slate-400 font-bold block uppercase font-mono">Powertrain Specific Category</label>
                      <div className="grid grid-cols-4 gap-1">
                        {(['Gasoline', 'Diesel', 'EV', 'Hybrid'] as ('Gasoline' | 'Diesel' | 'EV' | 'Hybrid')[]).map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setVType(t)}
                            className={`p-1.5 rounded-lg text-[10px] text-center border font-bold ${
                              vType === t 
                                ? "bg-indigo-500/20 border-indigo-500 text-indigo-300" 
                                : "bg-black/30 border-white/5 text-slate-450 hover:text-slate-300"
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] text-slate-400 font-bold block uppercase">Vehicle Plate Code</label>
                      <input 
                        type="text" 
                        value={plateNum}
                        onChange={(e) => setPlateNum(e.target.value)}
                        placeholder="e.g., Phnom Penh 2A-8888"
                        className="w-full bg-slate-950 border border-white/10 text-xs px-3 py-2.5 rounded-xl text-slate-200 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] text-slate-400 font-bold block uppercase">Current Odometer Mileage (km)</label>
                      <input 
                        type="number" 
                        value={currentMileage}
                        onChange={(e) => setCurrentMileage(e.target.value)}
                        placeholder="e.g., 185000"
                        className="w-full bg-slate-950 border border-white/10 text-xs px-3 py-2.5 rounded-xl text-slate-200 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-white/3 border border-white/5 rounded-2xl">
                    <span className="text-[10px] font-mono tracking-wider font-bold block text-slate-500">OPTIONAL EXTENDED DETAILS</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400">VIN / Chassis number</span>
                        <input 
                          type="text" 
                          placeholder="e.g., JTDKN3DU6F..."
                          className="w-full bg-black/40 border border-white/5 text-[11px] p-2 rounded-lg text-slate-300 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400">Usage type</span>
                        <select className="w-full bg-black/40 border border-white/5 text-[11px] p-2 rounded-lg text-slate-300 focus:outline-none">
                          <option>Daily Commuter</option>
                          <option>Ridesharing / PassApp</option>
                          <option>Heavy Towing / Cargo</option>
                          <option>Highway Courier</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ==========================================
                  STEP 2: SERVICE TEMPLATES & INTERACTIVE PRESETS
                  ========================================== */}
              {activeStep === 2 && (
                <div className="space-y-5 animate-fade-in">
                  <div>
                    <span className="text-xs font-bold text-slate-350 tracking-wider block">Powertrain Specific Optimization:</span>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Choose a template aligned to active motor diagnostics to populate checklists and costs immediately.
                    </p>
                  </div>

                  {/* Template preset list per vehicle type matches */}
                  {vType === 'EV' && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                      <button type="button" onClick={() => handleLoadPowertrainQuickTemplate('ev_battery')} className="p-3 bg-indigo-500/10 hover:bg-indigo-500/15 border border-indigo-500/20 text-indigo-300 rounded-xl text-xs text-left cursor-pointer transition">
                        <span className="font-bold block text-slate-200">EV High Voltage Diagnosis</span>
                        <span className="text-[9px] text-slate-500 block mt-1">SOH grid scan, diagnostic scan</span>
                      </button>
                      <button type="button" onClick={() => handleLoadPowertrainQuickTemplate('hybrid_fan')} className="p-3 bg-white/5 hover:bg-white/8 border border-white/5 rounded-xl text-xs text-left cursor-pointer transition">
                        <span className="font-bold block text-slate-200">Cabin AC Heat Pump</span>
                        <span className="text-[9px] text-slate-500 block mt-1">Leak test, R1234yf system gas</span>
                      </button>
                    </div>
                  )}

                  {vType === 'Hybrid' && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                      <button type="button" onClick={() => handleLoadPowertrainQuickTemplate('hybrid_fan')} className="p-3 bg-indigo-500/10 hover:bg-indigo-500/15 border border-indigo-500/20 text-indigo-300 rounded-xl text-xs text-left cursor-pointer transition">
                        <span className="font-bold block text-slate-200">Clean Hybrid Traction Fan</span>
                        <span className="text-[9px] text-slate-500 block mt-1">Dust intake check, temp regulation</span>
                      </button>
                      <button type="button" onClick={() => handleLoadPowertrainQuickTemplate('oil_change')} className="p-3 bg-white/5 hover:bg-white/8 border border-white/5 rounded-xl text-xs text-left cursor-pointer transition">
                        <span className="font-bold block text-slate-200">eCVT Oil change</span>
                        <span className="text-[9px] text-slate-500 block mt-1">Premium fluid swap</span>
                      </button>
                    </div>
                  )}

                  {vType === 'Diesel' && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                      <button type="button" onClick={() => handleLoadPowertrainQuickTemplate('diesel_dpf')} className="p-3 bg-indigo-500/10 hover:bg-indigo-500/15 border border-indigo-500/20 text-indigo-300 rounded-xl text-xs text-left cursor-pointer transition">
                        <span className="font-bold block text-slate-200">Diesel DPF Filter Decarb</span>
                        <span className="text-[9px] text-slate-500 block mt-1">Chemical purging sequence</span>
                      </button>
                      <button type="button" onClick={() => handleLoadPowertrainQuickTemplate('oil_change')} className="p-3 bg-white/5 hover:bg-white/8 border border-white/5 rounded-xl text-xs text-left cursor-pointer transition">
                        <span className="font-bold block text-slate-200">Diesel Fuel Injectors</span>
                        <span className="text-[9px] text-slate-500 block mt-1">Denso trim recalibration</span>
                      </button>
                    </div>
                  )}

                  {vType === 'Gasoline' && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                      <button type="button" onClick={() => handleLoadPowertrainQuickTemplate('oil_change')} className="p-3 bg-indigo-500/10 hover:bg-indigo-500/15 border border-indigo-500/20 text-indigo-300 rounded-xl text-xs text-left cursor-pointer transition">
                        <span className="font-bold block text-slate-200">Petrol Engine Oil (5k/10k)</span>
                        <span className="text-[9px] text-slate-500 block mt-1">Castrol/Shell synthetic oil</span>
                      </button>
                    </div>
                  )}

                  {/* Dynamic Custom Service Templates */}
                  {customTemplatesList.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[10.5px] text-emerald-400 font-extrabold uppercase tracking-widest block">👑 Super Admin Configured Templates</span>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                        {customTemplatesList
                          .filter(tmpl => {
                            const activeV = vehicles.find(v => v.id === selectedVId) || activeVehicle || (vehicles.length > 0 ? vehicles[0] : null);
                            if (!activeV) return true;
                            if (!tmpl.targetEngineTypes || tmpl.targetEngineTypes.length === 0) return true;
                            const engType = activeV.engineType || (activeV.fuelType === "EV" ? "EV / Fully Electric Vehicle" : activeV.fuelType === "Hybrid" ? "Hybrid" : activeV.fuelType === "Diesel" ? "Diesel" : "Petrol / Gasoline");
                            return tmpl.targetEngineTypes.some((eng: string) => 
                              eng.toLowerCase().trim().includes(engType.toLowerCase().trim()) || 
                              engType.toLowerCase().trim().includes(eng.toLowerCase().trim())
                            );
                          })
                          .map((tmpl) => (
                            <button
                              key={tmpl.id}
                              type="button"
                              onClick={() => handleLoadCustomTemplateObject(tmpl)}
                              className="p-3 bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20 text-emerald-300 rounded-xl text-xs text-left cursor-pointer transition relative group"
                            >
                              <span className="font-bold block text-slate-100 group-hover:text-emerald-300 transition truncate">{tmpl.name}</span>
                              <span className="text-[9px] text-slate-400 block mt-0.5 truncate">{tmpl.category}</span>
                              <span className="text-[9px] text-emerald-400 font-mono block mt-1">Est: ${tmpl.laborCost + tmpl.diagnosticFee}</span>
                            </button>
                          ))
                        }
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="space-y-1.5 animate-duration-500">
                      <label className="text-[11px] text-slate-400 font-bold block uppercase font-mono">Service Category</label>
                      <select 
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 text-xs px-3 py-2.5 rounded-xl text-slate-200 focus:outline-none"
                      >
                        <option>General Inspection</option>
                        <option>Engine Oil & Fluids</option>
                        <option>EV / Hybrid Battery System</option>
                        <option>Diesel Emission System</option>
                        <option>Brake System Repair</option>
                        <option>Air Conditioning Service</option>
                        <option>Electrical / 12V Battery</option>
                        <option>Spare Parts Sale</option>
                        <option>Fuel Record</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] text-slate-400 font-bold block uppercase">Technician Note / Customer Complaint</label>
                        {isSpeechSupported && (
                          <button
                            type="button"
                            onClick={toggleListening}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all duration-300 border cursor-pointer select-none ${
                              isListening
                                ? "bg-red-500/15 text-red-400 border-red-500/40 animate-pulse"
                                : "bg-slate-900 text-slate-300 border-slate-800 hover:text-white hover:border-slate-700"
                            }`}
                            title="Hands-free voice note dictation"
                          >
                            {isListening ? (
                              <>
                                <span className="relative flex h-1.5 w-1.5">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                                </span>
                                <span>Listening...</span>
                                <MicOff className="w-3 h-3 text-red-400" />
                              </>
                            ) : (
                              <>
                                <Mic className="w-3 h-3 text-emerald-400 animate-bounce" />
                                <span>Hands-free Dictate</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>

                      {speechError && (
                        <p className="text-[10px] text-rose-400 font-mono bg-rose-950/10 border border-rose-900/20 px-2 py-1 rounded-lg">
                          ⚠️ {speechError}
                        </p>
                      )}

                      <textarea
                        rows={3}
                        value={clientComplaint}
                        onChange={(e) => setClientComplaint(e.target.value)}
                        placeholder="e.g., Brake warning light on, car slips when gear transitions..."
                        className="w-full bg-slate-950 border border-white/10 text-xs px-3 py-2.5 rounded-xl text-slate-200 focus:outline-none"
                      ></textarea>
                    </div>
                  </div>
                </div>
              )}

              {/* ==========================================
                  STEP 3: DIAGNOSIS & AI EXPERT RECOMMENDATIONS
                  ========================================== */}
              {activeStep === 3 && (
                <div className="space-y-6 animate-fade-in text-xs">
                  {/* AI Copilot Advisor Section */}
                  <div className="p-4 bg-indigo-500/10 border border-indigo-500/25 rounded-2xl relative overflow-hidden">
                    <div className="absolute right-0 top-0 text-indigo-400/5 translate-x-1/8 -translate-y-1/8 pointer-events-none">
                      <Sparkles className="w-24 h-24 stroke-[0.3]" />
                    </div>
                    
                    <div className="flex items-center justify-between border-b border-indigo-500/25 pb-2">
                      <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 animate-spin text-indigo-400" />
                        <span>AI Tech Advisor Auto-Complete Companion</span>
                      </span>
                      <button 
                        type="button" 
                        onClick={handleTriggerAiAssistant}
                        className="text-[10px] font-bold bg-indigo-500 text-slate-950 px-2.5 py-1 rounded hover:bg-indigo-400 transition cursor-pointer"
                        disabled={isAiAnalyzing}
                      >
                        {isAiAnalyzing ? "Analyzing..." : "Trigger AI Diagnosis Analysis"}
                      </button>
                    </div>

                    {aiAnalysisResult ? (
                      <div className="mt-3.5 space-y-3.5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-wide block">Estimated Root Cause Causes:</span>
                            <ul className="list-disc pl-4 space-y-1 mt-1 text-slate-350">
                              {aiAnalysisResult.causes.map((c, i) => <li key={i}>{c}</li>)}
                            </ul>
                          </div>
                          <div>
                            <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-wide block">Mandatory Verification Checklist:</span>
                            <ol className="list-decimal pl-4 space-y-1 mt-1 text-slate-350">
                              {aiAnalysisResult.checklist.map((cl, i) => <li key={i}>{cl}</li>)}
                            </ol>
                          </div>
                        </div>

                        <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-350 rounded-xl flex items-start gap-2 leading-relaxed">
                          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-450" />
                          <div>
                            <strong className="block text-[10px] uppercase font-mono tracking-wider">High Risk Tech Alert:</strong>
                            <p>{aiAnalysisResult.warning}</p>
                          </div>
                        </div>

                        <div className="flex justify-between items-center bg-black/30 p-2 rounded-xl border border-white/5 flex-wrap gap-2">
                          <span className="text-slate-400">Suggested Code: <strong className="text-emerald-400 font-mono">{aiAnalysisResult.suggestedCode}</strong></span>
                          <span className="text-slate-400">Urgency Level: <strong className="text-rose-400 font-semibold">{aiAnalysisResult.risk.toUpperCase()}</strong></span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400 mt-2 block leading-relaxed">
                        Input symptoms or select a template in previous tabs, then click "Trigger AI Diagnosis Analysis" to let Gemini compile safety warnings and checklist procedures.
                      </p>
                    )}
                  </div>

                  {/* Add Spare Parts Section */}
                  <div className="p-4 bg-white/3 border border-white/5 rounded-2xl space-y-4">
                    <span className="text-xs font-bold text-slate-350 block uppercase tracking-wider">Logged Spare Parts & Labor Items</span>
                    
                    {/* Part list table */}
                    <div className="space-y-1.5">
                      {addedParts.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-2.5 bg-slate-950 border border-white/5 rounded-xl">
                          <div>
                            <span className="font-bold text-slate-200 block text-[11px]">{item.name} <span className="text-slate-500">({item.brand})</span></span>
                            <span className="text-[9.5px] text-emerald-400 font-mono">Qty: {item.qty} x ${item.price} USD</span>
                          </div>
                          <button 
                            type="button" 
                            onClick={() => handleRemovePart(index)} 
                            className="p-1 text-slate-500 hover:text-rose-400 transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Quick Adding Fields row */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 pt-2 border-t border-white/5">
                      <div className="md:col-span-2">
                        <input 
                          type="text" 
                          placeholder="Part Name (e.g., Brake Pad)..."
                          value={newPartName}
                          onChange={(e) => setNewPartName(e.target.value)}
                          className="w-full bg-slate-950 border border-white/10 p-2 text-[11px] rounded-lg text-slate-200 font-sans focus:outline-none"
                        />
                      </div>
                      <div>
                        <input 
                          type="text" 
                          placeholder="Brand..."
                          value={newPartBrand}
                          onChange={(e) => setNewPartBrand(e.target.value)}
                          className="w-full bg-slate-950 border border-white/10 p-2 text-[11px] rounded-lg text-slate-200 font-sans focus:outline-none"
                        />
                      </div>
                      <div className="flex gap-1.5">
                        <input 
                          type="number" 
                          placeholder="Price..."
                          value={newPartPrice || ""}
                          onChange={(e) => setNewPartPrice(parseFloat(e.target.value) || 0)}
                          className="flex-1 bg-slate-950 border border-white/10 p-2 text-[11px] rounded-lg text-slate-200 font-mono focus:outline-none"
                        />
                        <button 
                          type="button" 
                          onClick={handleAddPart}
                          className="p-2 px-3 bg-indigo-500 hover:bg-indigo-600 text-slate-900 text-xs font-bold rounded-lg cursor-pointer"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ==========================================
                  STEP 4: COST SUMMARY & ACCEPTANCE BIND
                  ========================================== */}
              {activeStep === 4 && (
                <div className="space-y-5 animate-fade-in text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block font-mono">Diag Fee ($)</span>
                      <input 
                        type="number" 
                        value={diagnosticFee}
                        onChange={(e) => setDiagnosticFee(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 p-2 rounded-xl text-slate-200 font-mono focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block font-mono">Labor Fee ($)</span>
                      <input 
                        type="number" 
                        value={laborCost}
                        onChange={(e) => setLaborCost(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 p-2 rounded-xl text-slate-200 font-mono focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block font-mono">Discount ($)</span>
                      <input 
                        type="number" 
                        value={discount}
                        onChange={(e) => setDiscount(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 p-2 rounded-xl text-indigo-400 font-mono focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Pricing Overview Table card */}
                  <div className="p-4 bg-white/3 border border-white/5 rounded-2xl flex flex-col justify-between">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2.5 text-xs text-slate-400">
                      <span>Service Diagnostics & Mechanics Fee Summary</span>
                      <span>USD Pricing</span>
                    </div>

                    <div className="space-y-2 mt-3.5">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Diagnostics Check Base</span>
                        <span className="text-slate-200 font-mono">${diagnosticFee}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Total Workshop Labor Code</span>
                        <span className="text-slate-200 font-mono">${laborCost}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Spare Parts Cost Aggregate</span>
                        <span className="text-slate-200 font-mono">
                          ${addedParts.reduce((sum, item) => sum + (item.qty * item.price), 0)}
                        </span>
                      </div>
                      <div className="flex justify-between text-indigo-300">
                        <span>Campaign Discount applied</span>
                        <span className="font-mono">-${discount}</span>
                      </div>
                    </div>

                    <div className="border-t border-white/10 pt-3 mt-4 flex justify-between items-center text-sm font-bold">
                      <span className="text-slate-100">GRAND TOTAL ESTIMATION AMOUNT</span>
                      <span className="text-emerald-400 font-mono text-base">${calculateTotal()} USD</span>
                    </div>
                  </div>

                  {/* Signature or client acceptance flow mock block */}
                  <div className="p-4 bg-slate-950/80 border border-indigo-500/20 rounded-2xl space-y-3 relative">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <span className="font-bold text-slate-300 flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-emerald-400 animate-pulse" />
                        <span>Interactive Customer Acceptance Stream</span>
                      </span>
                      <span className="text-[10px] text-slate-500">Requires review & digital seal</span>
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      By submitting, Cambodia road safety compliance registry triggers notifications directly to the customer. When verified, the telemetry records sync onto the global vehicle maintenance scorecard.
                    </p>

                    <div className="border-2 border-dashed border-white/10 aspect-[5/2] rounded-xl flex items-center justify-center p-3 relative cursor-pointer hover:border-indigo-500/20 transition group">
                      {isSigned ? (
                        <div className="text-center space-y-1">
                          <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
                          <span className="text-emerald-300 font-mono text-[10px] uppercase font-bold block">Digital Signature Affixed</span>
                          <span className="text-slate-500 text-[9px] block">Checksum ID: MCC-SIG-8F29A39D</span>
                        </div>
                      ) : (
                        <div onClick={() => setIsSigned(true)} className="text-center space-y-1">
                          <span className="text-slate-500 text-[10px] group-hover:text-slate-350 block">Click inside this field to affix customer signature stamp</span>
                          <span className="text-[9px] text-slate-600 block">Or bypass to submit as Draft</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer Controls */}
            <div className="p-5 border-t border-white/10 bg-black/20 flex items-center justify-between flex-wrap gap-2">
              <span className="text-[10.5px] text-slate-400">
                {activeStep === 4 ? "Please review costs before finalizing." : "All changes automatically cached locally."}
              </span>

              <div className="flex gap-2">
                {activeStep > 1 && (
                  <button 
                    onClick={() => setActiveStep(prev => prev - 1)}
                    className="p-2 px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Back
                  </button>
                )}

                {activeStep < 4 ? (
                  <button 
                    onClick={() => setActiveStep(prev => prev + 1)}
                    className="p-2 px-5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Next Tab
                  </button>
                ) : (
                  <button 
                    onClick={handleFormSubmit}
                    className="p-2.5 px-6 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Submit record log
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
