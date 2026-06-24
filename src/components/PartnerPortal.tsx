/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  QrCode, 
  User, 
  Wrench, 
  Lock, 
  FileText, 
  History, 
  AlertCircle, 
  Check, 
  X, 
  ShieldAlert, 
  Database, 
  Maximize2, 
  Share2, 
  Compass, 
  FileCheck, 
  HelpCircle,
  Clock,
  Briefcase,
  Bell,
  Search,
  CheckCircle2,
  AlertTriangle,
  Ban,
  FileSpreadsheet,
  Coins,
  Send,
  Zap,
  Sparkles,
  RefreshCw,
  Copy
} from "lucide-react";
import { VehicleProfile, MaintenanceRecord, GaragePartner } from "../types";

interface PartnerPortalProps {
  vehicles: VehicleProfile[];
  selectedVehicle: VehicleProfile | null;
  onSelectVehicle: (vehicle: VehicleProfile) => void;
  onRefreshData: () => void;
  garages: GaragePartner[];
}

export default function PartnerPortal({
  vehicles,
  selectedVehicle,
  onSelectVehicle,
  onRefreshData,
  garages
}: PartnerPortalProps) {
  // Roles Switcher
  // 'owner' | 'garage' | 'petrol' | 'parts'
  const [activeRole, setActiveRole] = useState<'owner' | 'garage' | 'petrol' | 'parts'>('owner');

  // Owner Tab States: 'qr' | 'approvals' | 'privacy' | 'partners'
  const [ownerTab, setOwnerTab] = useState<'qr' | 'approvals' | 'privacy' | 'partners'>('qr');

  // QR presentation type
  const [qrType, setQrType] = useState<'user' | 'vehicle'>('user');

  // New partner states
  const [partnerRequests, setPartnerRequests] = useState<any[]>([]);
  const [partnerPermissions, setPartnerPermissions] = useState<any[]>([]);
  const [printTemplate, setPrintTemplate] = useState<'label' | 'sticker' | 'book' | 'mini'>('label');
  const [selectedPrintVehicleId, setSelectedPrintVehicleId] = useState<string>("");
  const [isRequestingAccess, setIsRequestingAccess] = useState(false);
  const [lastRequestSentStatus, setLastRequestSentStatus] = useState<string | null>(null);

  // Expanded Maintenance Log Form states (Requirement 6)
  const [partsCost, setPartsCost] = useState("25");
  const [laborCost, setLaborCost] = useState("15");
  const [discount, setDiscount] = useState("0");
  const [paymentStatus, setPaymentStatus] = useState("Paid");
  const [technicianName, setTechnicianName] = useState("Sok Nimol - Senior Tech");
  const [internalNotes, setInternalNotes] = useState("Brake pads at 60% depth. Suspension links secured.");
  const [customerNotes, setCustomerNotes] = useState("");
  const [scannedFilesList, setScannedFilesList] = useState<string[]>([]);
  const [aiCompanionResponse, setAiCompanionResponse] = useState<any>(null);
  const [aiRecommendationLoading, setAiRecommendationLoading] = useState(false);

  // Backend states
  const [privacySettings, setPrivacySettings] = useState({
    showFullName: true,
    showPhone: false,
    showPlateNumber: false,
    showPreviousHistory: false,
    allowFollowUps: true
  });

  const [qrDetails, setQrDetails] = useState<any>(null);
  const [pendingRecords, setPendingRecords] = useState<any[]>([]);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  // Garage scanner / creator simulator states
  const [selectedProvider, setSelectedProvider] = useState<any>({
    id: "g1",
    name: "Apsara Auto Repair & Diagnostic Center"
  });

  const [manualRecordId, setManualRecordId] = useState("");
  const [scanResult, setScanResult] = useState<any>(null);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  // Log Creation Form states
  const [logCategory, setLogCategory] = useState("Engine Oil Service");
  const [logCost, setLogCost] = useState("40");
  const [logMileage, setLogMileage] = useState("");
  const [logProductUsed, setLogProductUsed] = useState("Mobil Special 10W-40 Premium");
  const [logPartsChanged, setLogPartsChanged] = useState("Engine Oil Filter, Gasket seal");
  const [logWarranty, setLogWarranty] = useState("30 Days");
  const [logNote, setLogNote] = useState("Checked brake pads depth; remaining at 60%. Next service recommended on schedule.");
  const [suggestNextService, setSuggestNextService] = useState(true);
  const [nextServiceDate, setNextServiceDate] = useState("");
  const [nextServiceMileage, setNextServiceMileage] = useState("");
  
  // AI assistant loading
  const [aiGenerating, setAiGenerating] = useState(false);

  // Dispute state
  const [disputeRecordId, setDisputeRecordId] = useState<string | null>(null);
  const [disputeReasonText, setDisputeReasonText] = useState("");

  // Init fetcher
  useEffect(() => {
    fetchPrivacyAndPending();
  }, [selectedVehicle]);

  // Set default printing vehicle on vehicles change
  useEffect(() => {
    if (vehicles && vehicles.length > 0 && !selectedPrintVehicleId) {
      setSelectedPrintVehicleId(vehicles[0].id);
    }
  }, [vehicles]);

  const fetchPrivacyAndPending = async () => {
    try {
      const [privacyRes, qrRes, pendingRes, requestsRes, permissionsRes] = await Promise.all([
        fetch("/api/privacy-settings"),
        fetch("/api/qr-tokens"),
        fetch("/api/owner/pending-records"),
        fetch("/api/owner/partner-requests"),
        fetch("/api/owner/partner-permissions")
      ]);

      if (privacyRes.ok) {
        const priv = await privacyRes.json();
        setPrivacySettings(priv);
      }
      if (qrRes.ok) {
        const qrd = await qrRes.json();
        setQrDetails(qrd);
      }
      if (pendingRes.ok) {
        const pend = await pendingRes.json();
        setPendingRecords(pend);
      }
      if (requestsRes.ok) {
        const reqs = await requestsRes.json();
        setPartnerRequests(reqs);
      }
      if (permissionsRes.ok) {
        const perms = await permissionsRes.json();
        setPartnerPermissions(perms);
      }
    } catch (err) {}
  };

  // Toggle privacy switch helper
  const handleTogglePrivacy = async (key: string, currentVal: boolean) => {
    try {
      const updated = { ...privacySettings, [key]: !currentVal };
      const res = await fetch("/api/privacy-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated)
      });
      if (res.ok) {
        const result = await res.json();
        setPrivacySettings(result);
        // Refresh QR labels
        const qrRes = await fetch("/api/qr-tokens");
        if (qrRes.ok) {
          setQrDetails(await qrRes.json());
        }
      }
    } catch (err) {}
  };

  // Approve a partner access request
  const handleApprovePartnerRequest = async (id: string, statusType: 'trusted' | 'one_time') => {
    try {
      const res = await fetch(`/api/owner/partner-requests/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statusType })
      });
      if (res.ok) {
        alert(`Success! Granted access as a ${statusType === 'trusted' ? 'Trusted Partner (Auto-Approved)' : 'One-Time Visitor'}.`);
        fetchPrivacyAndPending();
      }
    } catch (e) {}
  };

  // Reject a partner access request
  const handleRejectPartnerRequest = async (id: string) => {
    try {
      const res = await fetch(`/api/owner/partner-requests/${id}/reject`, {
        method: "POST"
      });
      if (res.ok) {
        alert("Access request was declined to protect your vehicle identifiers.");
        fetchPrivacyAndPending();
      }
    } catch (e) {}
  };

  // Revoke permission for a partner
  const handleRevokePartnerPermission = async (id: string) => {
    try {
      const res = await fetch(`/api/owner/partner-permissions/${id}/revoke`, {
        method: "POST"
      });
      if (res.ok) {
        alert("The partner's active diagnostic permissions have been securely revoked.");
        fetchPrivacyAndPending();
      }
    } catch (e) {}
  };

  // Regenerate a vehicle's secure QR Token
  const handleRegenerateVehicleQr = async (vehicleId: string) => {
    try {
      const res = await fetch(`/api/vehicles/regenerate-qr/${vehicleId}`, {
        method: "POST"
      });
      if (res.ok) {
        const body = await res.json();
        alert("Success! Re-rolled secure QR code. All previous printed stickers/tokens for this car are immediately revoked.");
        fetchPrivacyAndPending();
      }
    } catch (e) {}
  };

  // Garage requests access for a scanned vehicle
  const handleGarageRequestAccess = async (vehicleId: string) => {
    setIsRequestingAccess(true);
    setLastRequestSentStatus(null);
    try {
      const res = await fetch(`/api/garage/request-access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId,
          garageId: selectedProvider.id,
          garageName: selectedProvider.name
        })
      });
      if (res.ok) {
        const data = await res.json();
        setLastRequestSentStatus(data.message);
        alert(data.message);
        fetchPrivacyAndPending();
      }
    } catch (err: any) {
      alert("Error sending access request ticket: " + err.message);
    } finally {
      setIsRequestingAccess(false);
    }
  };

  // AI Translation/Polish helper (Requirement 9)
  const handleAIFormatDetailedRecord = async () => {
    setAiRecommendationLoading(true);
    try {
      const res = await fetch("/api/ai/partners/bilingual-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: logCategory,
          productUsed: logProductUsed,
          partsChanged: logPartsChanged,
          note: logNote,
          technicianName
        })
      });
      if (res.ok) {
        const data = await res.json();
        setAiCompanionResponse(data);
        setLogNote(data.bilingualCombined);
        if (data.recommendedCheckLimit) {
          setLogWarranty(`Bilingual Ver: ${data.recommendedCheckLimit}`);
        }
      }
    } catch (err) {} finally {
      setAiRecommendationLoading(false);
    }
  };

  // Trigger copy to clipboard simulator
  const triggerCopy = (text: string, label: string) => {
    navigator.clipboard?.writeText?.(text);
    setCopyFeedback(label);
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  // Simulate scanning QR
  const handleSimulateScan = async (token: string) => {
    setScanLoading(true);
    setScanError(null);
    setScanResult(null);
    try {
      const res = await fetch("/api/qr/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          scannedByGarageId: selectedProvider.id,
          scannedByGarageName: selectedProvider.name
        })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to parse scanned token.");
      }
      const data = await res.json();
      setScanResult(data);
      // Auto fill mileage from vehicle data if possible
      if (data.scannedType === 'vehicle') {
        setLogMileage((data.mileage + 5).toString());
        setNextServiceMileage((data.mileage + 5000).toString());
      } else if (data.vehicles && data.vehicles.length > 0) {
        setLogMileage((data.vehicles[0].mileage + 5).toString());
        setNextServiceMileage((data.vehicles[0].mileage + 5000).toString());
      }
      // Populate next date suggestion: 3 months out
      const threeMonthsOut = new Date();
      threeMonthsOut.setMonth(threeMonthsOut.getMonth() + 3);
      setNextServiceDate(threeMonthsOut.toISOString().split('T')[0]);
    } catch (err: any) {
      setScanError(err.message);
    } finally {
      setScanLoading(false);
    }
  };

  // Simulate entering Record ID manually
  const handleManualLookup = async () => {
    if (!manualRecordId.trim()) return;
    setScanLoading(true);
    setScanError(null);
    setScanResult(null);
    try {
      const res = await fetch("/api/qr/manual-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recordId: manualRecordId,
          scannedByGarageId: selectedProvider.id,
          scannedByGarageName: selectedProvider.name
        })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Lookup matching record was denied.");
      }
      const data = await res.json();
      setScanResult(data);
      if (data.scannedType === 'vehicle') {
        setLogMileage((data.mileage + 2).toString());
        setNextServiceMileage((data.mileage + 5000).toString());
      } else if (data.vehicles && data.vehicles.length > 0) {
        setLogMileage((data.vehicles[0].mileage + 2).toString());
        setNextServiceMileage((data.vehicles[0].mileage + 5000).toString());
      }
      const threeMonthsOut = new Date();
      threeMonthsOut.setMonth(threeMonthsOut.getMonth() + 3);
      setNextServiceDate(threeMonthsOut.toISOString().split('T')[0]);
    } catch (err: any) {
      setScanError(err.message);
    } finally {
      setScanLoading(false);
    }
  };

  // AI Clean & Format technical words
  const handleAIFormatRecord = async () => {
    setAiGenerating(true);
    try {
      const res = await fetch("/api/ai/suggestion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId: scanResult.vehicleId || scanResult.vehicles?.[0]?.id || "v1",
          customPrompt: `The mechanic at ${selectedProvider.name} completed high-quality service of type: "${logCategory}".
Details: used products: "${logProductUsed}", changed parts: "${logPartsChanged}". Additional comments: "${logNote}".
Write a friendly, high-quality, professional customer-facing explanation in beautiful English and Khmer warning them of next checks.`
        })
      });
      if (res.ok) {
        // We get a smart reminder suggestion. Let's use its description to fill notes!
        const list = await res.json();
        if (list && list.length > 0) {
          setLogNote(list[0].description || list[0].reason);
        }
      } else {
        setLogNote(`[AI polished]: Standard ${logCategory} executed successfully by ${selectedProvider.name} using ${logProductUsed}. All indicators calibrated. Recommended schedule logged for Cambodia weather guidelines.`);
      }
    } catch (err) {
      setLogNote(`[AI failure fallback]: Standard ${logCategory} executed successfully by ${selectedProvider.name} using ${logProductUsed}.`);
    } finally {
      setAiGenerating(false);
    }
  };

  // Submit record for owner approval
  const handleSubmitServiceRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanResult) return;

    const targetVehicleId = scanResult.scannedType === 'vehicle' 
      ? scanResult.vehicleId 
      : scanResult.vehicles?.[0]?.id;

    const targetVehicleLabel = scanResult.scannedType === 'vehicle' 
      ? `${scanResult.brand} ${scanResult.model} ${scanResult.year}`
      : scanResult.vehicles?.[0]?.label;

    try {
      const res = await fetch("/api/garage/service-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId: targetVehicleId,
          vehicleLabel: targetVehicleLabel,
          serviceCategory: logCategory,
          serviceDate: new Date().toISOString().split('T')[0],
          mileage: Number(logMileage),
          cost: Number(logCost),
          productUsed: logProductUsed,
          partsChanged: logPartsChanged,
          warranty: logWarranty,
          note: logNote,
          providerId: selectedProvider.id,
          providerName: selectedProvider.name,
          nextServiceDate: suggestNextService ? nextServiceDate : "",
          nextServiceMileage: suggestNextService ? Number(nextServiceMileage) : 0,
          
          // Advanced digital ticketing logs (Requirement 6 & 8)
          partsCost: Number(partsCost),
          laborCost: Number(laborCost),
          discount: Number(discount),
          paymentStatus: paymentStatus,
          technicianName: technicianName,
          customerNotes: customerNotes || logNote,
          scannedFilesList: scannedFilesList
        })
      });

      if (res.ok) {
        alert("Service record has been successfully uploaded to the customer's portal for verification!");
        setScanResult(null);
        setManualRecordId("");
        fetchPrivacyAndPending();
        onRefreshData();
      } else {
        const err = await res.json();
        alert(`Error: ${err.error || "Failed to submit record."}`);
      }
    } catch (err) {
      alert("Network exception communicating with MyCar Care portal backend.");
    }
  };

  // Approve garage's record
  const handleApproveRecord = async (id: string) => {
    try {
      const res = await fetch(`/api/owner/service-records/${id}/approve`, {
        method: "POST"
      });
      if (res.ok) {
        alert("Success! Record approved and saved to your vehicle's history.");
        fetchPrivacyAndPending();
        onRefreshData();
      } else {
        alert("Could not process approval check.");
      }
    } catch(e) {}
  };

  // Reject garage's record
  const handleRejectRecord = async (id: string) => {
    if (!window.confirm("Are you sure you want to reject this record?")) return;
    try {
      const res = await fetch(`/api/owner/service-records/${id}/reject`, {
        method: "POST"
      });
      if (res.ok) {
        alert("Record rejected successfully.");
        fetchPrivacyAndPending();
        onRefreshData();
      }
    } catch (e) {}
  };

  // Submit dispute (owner writes why they disagree)
  const handleSubmitDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeRecordId || !disputeReasonText.trim()) return;

    try {
      const res = await fetch(`/api/owner/service-records/${disputeRecordId}/dispute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: disputeReasonText })
      });
      if (res.ok) {
        alert("Dispute report filed. Admin control center will analyze this record.");
        setDisputeRecordId(null);
        setDisputeReasonText("");
        fetchPrivacyAndPending();
        onRefreshData();
      }
    } catch (e) {}
  };

  // Send Follow-Up reminder mock trigger
  const handleSendFollowUp = async (vId: string, clientName: string, category: string) => {
    try {
      const res = await fetch("/api/garage/follow-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId: vId,
          customerName: clientName,
          serviceCategory: category,
          garageName: selectedProvider.name
        })
      });
      if (res.ok) {
        alert(`In-App urgent follow-up reminder sent to ${clientName} successfully!`);
        onRefreshData();
      }
    } catch (err) {}
  };

  // Count unread pending approvals
  const pendingApprovalsCount = pendingRecords.filter(r => r.approvalStatus === 'pending_owner_approval').length;

  return (
    <div className="space-y-6">
      {/* 1. Header and Quick Role-Based Presets Switcher */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div>
          <div className="flex items-center gap-1.5 text-sky-400 text-xs font-bold tracking-wider uppercase mb-1">
            <Zap className="w-3.5 h-3.5" />
            <span>Interactive User Roles Simulator</span>
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">
            Role-Based Verification Portal
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Test the entire customer-to-garage loop instantly. Generate owner QR codes, look up clients, scan vehicle tags, submit diagnostic logs, and approve records dynamically.
          </p>
        </div>

        {/* Horizontal Role Selector tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 pt-1">
          <button
            onClick={() => setActiveRole('owner')}
            className={`p-3 rounded-xl font-bold text-xs flex flex-col items-center gap-1.5 transition border cursor-pointer ${
              activeRole === 'owner'
                ? "bg-sky-500 text-slate-950 border-sky-400 shadow-lg shadow-sky-500/20"
                : "bg-slate-950 text-slate-400 border-slate-800/80 hover:bg-slate-800 hover:text-slate-100"
            }`}
          >
            <User className="w-4 h-4" />
            <span>Car Owner View</span>
          </button>

          <button
            onClick={() => {
              setActiveRole('garage');
              setSelectedProvider({ id: "g1", name: "Apsara Auto Repair & Diagnostic Center" });
            }}
            className={`p-3 rounded-xl font-bold text-xs flex flex-col items-center gap-1.5 transition border cursor-pointer ${
              activeRole === 'garage'
                ? "bg-sky-500 text-slate-950 border-sky-400 shadow-lg shadow-sky-500/20"
                : "bg-slate-950 text-slate-400 border-slate-800/80 hover:bg-slate-800 hover:text-slate-100"
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Garage Shop view</span>
          </button>

          <button
            onClick={() => {
              setActiveRole('petrol');
              setSelectedProvider({ id: "g5", name: "Mekong Lube, Express Oil & Petrol" });
            }}
            className={`p-3 rounded-xl font-bold text-xs flex flex-col items-center gap-1.5 transition border cursor-pointer ${
              activeRole === 'petrol'
                ? "bg-sky-500 text-slate-950 border-sky-400 shadow-lg shadow-sky-500/20"
                : "bg-slate-950 text-slate-400 border-slate-800/80 hover:bg-slate-800 hover:text-slate-100"
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Petrol Station view</span>
          </button>

          <button
            onClick={() => {
              setActiveRole('parts');
              setSelectedProvider({ id: "g2", name: "Angkor Tyres & Wheel Alignment Clinic" });
            }}
            className={`p-3 rounded-xl font-bold text-xs flex flex-col items-center gap-1.5 transition border cursor-pointer ${
              activeRole === 'parts'
                ? "bg-sky-500 text-slate-950 border-sky-400 shadow-lg shadow-sky-500/20"
                : "bg-slate-950 text-slate-400 border-slate-800/80 hover:bg-slate-800 hover:text-slate-100"
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Spare Part Shop view</span>
          </button>
        </div>
      </div>

      {/* 2. TAB DETAILS - CAR OWNER ROLE SECTION */}
      {activeRole === 'owner' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Sub Navigation */}
          <div className="lg:col-span-3 flex lg:flex-col gap-2.5 overflow-x-auto pb-2 lg:pb-0">
            <button
              onClick={() => setOwnerTab('qr')}
              className={`whitespace-nowrap px-4 py-3.5 rounded-2xl text-xs font-bold flex items-center gap-2.5 cursor-pointer border flex-1 lg:flex-initial transition ${
                ownerTab === 'qr'
                  ? "bg-sky-900/30 text-sky-400 border-sky-500/15"
                  : "bg-slate-950 text-slate-400 border-transparent hover:bg-slate-900"
              }`}
            >
              <QrCode className="w-4 h-4 text-sky-400" />
              <span>Show My QR Codes</span>
            </button>

            <button
              onClick={() => setOwnerTab('approvals')}
              className={`whitespace-nowrap px-4 py-3.5 rounded-2xl text-xs font-bold flex items-center gap-2.5 cursor-pointer border flex-1 lg:flex-initial transition ${
                ownerTab === 'approvals'
                  ? "bg-sky-900/30 text-sky-400 border-sky-500/15"
                  : "bg-slate-950 text-slate-400 border-transparent hover:bg-slate-900"
              }`}
            >
              <FileCheck className="w-4 h-4 text-sky-400" />
              <span>Pending Approvals</span>
              {pendingApprovalsCount > 0 && (
                <span className="bg-rose-500 text-white font-sans text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-auto animate-pulse">
                  {pendingApprovalsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setOwnerTab('privacy')}
              className={`whitespace-nowrap px-4 py-3.5 rounded-2xl text-xs font-bold flex items-center gap-2.5 cursor-pointer border flex-1 lg:flex-initial transition ${
                ownerTab === 'privacy'
                  ? "bg-sky-900/30 text-sky-400 border-sky-500/15"
                  : "bg-slate-950 text-slate-400 border-transparent hover:bg-slate-900"
              }`}
            >
              <Lock className="w-4 h-4 text-sky-400" />
              <span>Privacy Shield</span>
            </button>

            <button
              onClick={() => setOwnerTab('partners')}
              className={`whitespace-nowrap px-4 py-3.5 rounded-2xl text-xs font-bold flex items-center gap-2.5 cursor-pointer border flex-1 lg:flex-initial transition ${
                ownerTab === 'partners'
                  ? "bg-sky-900/30 text-sky-400 border-sky-500/15"
                  : "bg-slate-950 text-slate-400 border-transparent hover:bg-slate-900"
              }`}
            >
              <Wrench className="w-4 h-4 text-sky-400" />
              <span>Authorized Partners</span>
              {partnerRequests.filter(req => req.status === 'pending').length > 0 && (
                <span className="bg-rose-500 text-white font-sans text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-auto animate-pulse">
                  {partnerRequests.filter(req => req.status === 'pending').length}
                </span>
              )}
            </button>
          </div>

          {/* Tab Pages content */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* SUB-TAB A: QR CODES */}
            {ownerTab === 'qr' && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                  <div>
                    <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-sky-400" />
                      <span>My Personal Access QR Identifiers</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Present these codes in Phnom Penh shops to check-in or auto-generate accurate service slips.
                    </p>
                  </div>
                  
                  {/* Select user code vs vehicle code */}
                  <div className="bg-slate-955 p-1 rounded-xl border border-slate-800 flex gap-1 self-start">
                    <button
                      onClick={() => setQrType('user')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        qrType === 'user' ? "bg-sky-500 text-slate-950" : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      User Profile QR
                    </button>
                    <button
                      onClick={() => setQrType('vehicle')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        qrType === 'vehicle' ? "bg-sky-500 text-slate-950" : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Vehicle QR Code
                    </button>
                  </div>
                </div>

                {/* Dropdown to switch active target vehicle profile */}
                {qrType === 'vehicle' && vehicles && vehicles.length > 0 && (
                  <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex flex-col gap-1 w-full max-w-sm">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                        Active Vehicle QR Target
                      </span>
                      <select
                        value={selectedVehicle?.id || (vehicles[0]?.id || "")}
                        onChange={(e) => {
                          const found = vehicles.find(v => v.id === e.target.value);
                          if (found) onSelectVehicle(found);
                        }}
                        className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-sky-500 cursor-pointer w-full font-bold"
                      >
                        {vehicles.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.brand} {v.model} - Public ID: {v.publicVehicleId || "CAR-000001"} ({v.plateNumber})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <button
                        onClick={() => handleRegenerateVehicleQr(selectedVehicle?.id || vehicles[0].id)}
                        className="px-3.5 py-2 bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 border border-rose-500/20 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Re-roll Secure QR</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Main QR Display frame */}
                <div className="flex flex-col items-center py-4 space-y-4">
                  {/* Outer glow simulated QR */}
                  <div className="relative p-5 bg-white rounded-3xl shadow-xl shadow-sky-500/5 group border-4 border-slate-800/20 max-w-[280px]">
                    {/* Animated scanning laser line */}
                    <div className="absolute left-2 right-2 h-1 bg-sky-400/80 shadow-[0_0_8px_rgba(56,189,248,1)] top-0 animate-bounce transition-all duration-[3000ms] pointer-events-none rounded-full"></div>
                    
                    {/* Visual QR Code Art (Clean modular style, fully responsive SVG, no mock image urls to avoid breaks!) */}
                    <svg viewBox="0 0 100 100" className="w-48 h-48 text-slate-950 fill-current">
                      {/* Corners markers */}
                      <rect x="0" y="0" width="24" height="24" rx="4" fill="currentColor" />
                      <rect x="4" y="4" width="16" height="16" rx="2" fill="white" />
                      <rect x="8" y="8" width="8" height="8" rx="1" fill="currentColor" />

                      <rect x="76" y="0" width="24" height="24" rx="4" fill="currentColor" />
                      <rect x="80" y="4" width="16" height="16" rx="2" fill="white" />
                      <rect x="84" y="8" width="8" height="8" rx="1" fill="currentColor" />

                      <rect x="0" y="76" width="24" height="24" rx="4" fill="currentColor" />
                      <rect x="4" y="80" width="16" height="16" rx="2" fill="white" />
                      <rect x="8" y="84" width="8" height="8" rx="1" fill="currentColor" />

                      {/* Small sync indicators */}
                      <rect x="10" y="32" width="6" height="6" fill="currentColor" />
                      <rect x="32" y="10" width="6" height="6" fill="currentColor" />

                      {/* Pixel chaos representing active JWT token reference */}
                      {qrType === 'user' ? (
                        <>
                          <rect x="32" y="32" width="8" height="8" fill="currentColor" />
                          <rect x="48" y="32" width="12" height="6" fill="currentColor" />
                          <rect x="68" y="32" width="6" height="8" fill="currentColor" />
                          <rect x="32" y="48" width="10" height="10" fill="currentColor" />
                          <rect x="52" y="48" width="8" height="8" fill="currentColor" />
                          <rect x="68" y="48" width="8" height="12" fill="currentColor" />
                          <rect x="32" y="68" width="16" height="8" fill="currentColor" />
                          <rect x="56" y="68" width="12" height="8" fill="currentColor" />
                          <rect x="76" y="68" width="12" height="6" fill="currentColor" />
                        </>
                      ) : (
                        <>
                          {/* Different token layout */}
                          <rect x="32" y="32" width="12" height="12" fill="currentColor" />
                          <rect x="52" y="32" width="6" height="6" fill="currentColor" />
                          <rect x="68" y="32" width="8" height="6" fill="currentColor" />
                          <rect x="32" y="52" width="6" height="10" fill="currentColor" />
                          <rect x="44" y="52" width="16" height="8" fill="currentColor" />
                          <rect x="68" y="52" width="10" height="8" fill="currentColor" />
                          <rect x="32" y="68" width="10" height="6" fill="currentColor" />
                          <rect x="48" y="68" width="18" height="8" fill="currentColor" />
                          <rect x="76" y="68" width="8" height="8" fill="currentColor" />
                        </>
                      )}
                    </svg>
                  </div>

                  <div className="text-center space-y-1 bg-slate-950 p-4 rounded-2xl max-w-sm w-full border border-slate-800">
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block">
                      {qrType === 'user' ? "User Account QR Token" : "Vehicle Secure QR Token"}
                    </span>
                    <div className="flex items-center justify-center gap-2">
                      <span className="font-mono text-sm text-sky-400 font-extrabold">
                        {qrType === 'user' 
                          ? (qrDetails?.userQr?.token || "MCC-USER-8F92KLA") 
                          : (selectedVehicle?.qrSecureToken || qrDetails?.vehicleQr?.token || "MCC-CAR-4471XDA")}
                      </span>
                      <button
                        onClick={() => triggerCopy(
                          qrType === 'user' 
                            ? (qrDetails?.userQr?.token || "MCC-USER-8F92KLA") 
                            : (selectedVehicle?.qrSecureToken || qrDetails?.vehicleQr?.token || "MCC-CAR-4471XDA"), 
                          qrType === 'user' ? 'u-qr' : 'v-qr'
                        )}
                        className="text-slate-500 hover:text-sky-400 transition cursor-pointer"
                        title="Copy client code"
                      >
                        {copyFeedback === (qrType === 'user' ? 'u-qr' : 'v-qr') ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400 animate-scale" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                    
                    {/* Scanned previews */}
                    <div className="text-[11px] text-slate-400 pt-1.5 border-t border-slate-900 mt-2">
                      {qrType === 'user' ? (
                        <p>Identifies: <strong className="text-slate-250">{qrDetails?.userQr?.displayName}</strong> ({qrDetails?.userQr?.displayPhone})</p>
                      ) : (
                        <div className="space-y-1">
                          <p>
                            Vehicle ID: <strong className="text-slate-200 font-mono">{selectedVehicle?.publicVehicleId || "MCKH-CAR-000001"}</strong>
                          </p>
                          <p>
                            {selectedVehicle?.brand} {selectedVehicle?.model} ({selectedVehicle?.plateNumber || qrDetails?.vehicleQr?.plateNumber})
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Printable Sticker Widget (Requirement 10) */}
                <div className="bg-slate-950 rounded-2xl p-5 border border-slate-850 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-sky-400 animate-pulse" />
                      <span className="text-xs font-bold text-slate-200">Cambodian Printable Badge Designer</span>
                    </div>
                    {/* Size selectors */}
                    <div className="flex items-center gap-1.5 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                      <button
                        onClick={() => setPrintTemplate('label')}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                          printTemplate === 'label' ? 'bg-sky-50 text-slate-950 border-sky-400 shadow' : 'bg-transparent text-slate-400 border-transparent hover:text-slate-200'
                        }`}
                      >
                        A6 Card
                      </button>
                      <button
                        onClick={() => setPrintTemplate('sticker')}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                          printTemplate === 'sticker' ? 'bg-sky-50 text-slate-950 border-sky-400 shadow' : 'bg-transparent text-slate-400 border-transparent hover:text-slate-200'
                        }`}
                      >
                        Sticker (3x2")
                      </button>
                      <button
                        onClick={() => setPrintTemplate('book')}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                          printTemplate === 'book' ? 'bg-sky-50 text-slate-950 border-sky-400 shadow' : 'bg-transparent text-slate-400 border-transparent hover:text-slate-200'
                        }`}
                      >
                        Header Log
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    Stick this inside your vehicle glass windshield or glove compartment for quick Cambodian garage checkout checklists.
                  </p>

                  {/* Dynamic Sticker Layout Card (STYLING FOR MAXIMUM PHYSICAL PRINT FIDELITY) */}
                  <div className="bg-white text-slate-950 p-5 rounded-3xl shadow-inner border border-slate-300 max-w-sm mx-auto space-y-4 font-sans relative overflow-hidden">
                    <div className="flex items-center justify-between border-b-2 border-dashed border-slate-200 pb-3">
                      <div>
                        <span className="text-[8px] font-black uppercase text-sky-600 tracking-wider">MEMBER STICKER</span>
                        <h4 className="text-xs font-extrabold text-slate-900 leading-none">MYCAR CARE KH</h4>
                      </div>
                      <span className="text-[9px] font-mono font-bold uppercase bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                        {printTemplate === 'label' ? 'Windshield (A6)' : printTemplate === 'sticker' ? 'Dashboard Sticker' : 'Logbook Header'}
                      </span>
                    </div>

                    <div className="grid grid-cols-12 gap-3 items-center">
                      <div className="col-span-8 text-left space-y-2">
                        <div>
                          <span className="text-[8px] font-bold uppercase text-slate-500 block">VEHICLE MAKE / ម៉ាកឡាន</span>
                          <span className="text-xs font-black text-slate-900 uppercase">
                            {selectedVehicle ? `${selectedVehicle.brand} ${selectedVehicle.model} ${selectedVehicle.year}` : "Toyota Tacoma 2006"}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5">
                          <div>
                            <span className="text-[8px] font-bold uppercase text-slate-500 block">LICENSE plate / ស្លាកលេខ</span>
                            <span className="text-[11px] font-mono font-bold text-slate-800">
                              {selectedVehicle?.plateNumber || "Phnom Penh 2A-8854"}
                            </span>
                          </div>
                          <div>
                            <span className="text-[8px] font-bold uppercase text-slate-500 block">VEHICLE ID</span>
                            <span className="text-[11px] font-mono font-bold text-slate-800">
                              {selectedVehicle?.publicVehicleId || "MCKH-CAR-000001"}
                            </span>
                          </div>
                        </div>

                        <div className="bg-sky-50 py-1 px-2 rounded text-[8px] text-slate-700 leading-normal border border-sky-100">
                          <strong>Cambodia Wet-Season checks:</strong> Scan for fast lubrication charts & suspension logs.
                        </div>
                      </div>

                      <div className="col-span-4 flex flex-col items-center justify-center border-l border-slate-200 pl-2">
                        <svg viewBox="0 0 100 100" className="w-14 h-14 text-slate-900 fill-current">
                          <rect x="0" y="0" width="24" height="24" rx="3" fill="currentColor" />
                          <rect x="4" y="4" width="16" height="16" rx="2" fill="white" />
                          <rect x="8" y="8" width="8" height="8" rx="1" fill="currentColor" />
                          <rect x="76" y="0" width="24" height="24" rx="3" fill="currentColor" />
                          <rect x="80" y="4" width="16" height="16" rx="2" fill="white" />
                          <rect x="84" y="8" width="8" height="8" rx="1" fill="currentColor" />
                          <rect x="0" y="76" width="24" height="24" rx="3" fill="currentColor" />
                          <rect x="4" y="80" width="16" height="16" rx="2" fill="white" />
                          <rect x="8" y="84" width="8" height="8" rx="1" fill="currentColor" />
                          <rect x="32" y="32" width="12" height="12" fill="currentColor" />
                          <rect x="52" y="32" width="8" height="8" fill="currentColor" />
                          <rect x="68" y="32" width="8" height="8" fill="currentColor" />
                          <rect x="32" y="52" width="8" height="10" fill="currentColor" />
                          <rect x="48" y="52" width="14" height="8" fill="currentColor" />
                        </svg>
                        <span className="text-[7px] font-mono mt-0.5 text-slate-500 font-extrabold leading-none">
                          {selectedVehicle?.publicVehicleId || "MCKH-000001"}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-2 text-[8px] text-slate-400 text-center flex justify-between items-center">
                      <span>ស្កេនដើម្បីរក្សាទុកប្រវត្តិថែទាំយានយន្ត / Scan for logs</span>
                      <span className="font-bold text-slate-800">MCKH Partner Portal</span>
                    </div>
                  </div>

                  {/* Actions to print or download */}
                  <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
                    <button
                      onClick={() => alert(`Successfully downloaded your MyCar Care printable ${printTemplate} template in ultra-high resolution vector PDF!`)}
                      className="px-3.5 py-2 bg-sky-500 hover:bg-sky-600 text-slate-950 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Simulate Badge Download</span>
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="px-3.5 py-2 bg-slate-900 hover:bg-slate-850 text-slate-350 text-xs font-medium rounded-xl border border-slate-800 transition cursor-pointer flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Print sticker Layout</span>
                    </button>
                  </div>
                </div>

                {/* Fallback code segment */}
                <div className="bg-slate-950 rounded-2xl p-4 flex items-start gap-3 border border-slate-800">
                  <HelpCircle className="w-4.5 h-4.5 text-sky-400 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-300">How do I use this?</span>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Simply show this screen to any participating technician in Cambodia. If their scanner fails, provide the <strong className="text-slate-300 font-mono">Vehicle ID</strong> directly so they can inspect and push official receipts straight to your timeline.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB B: PENDING APPROVALS QUEUE */}
            {ownerTab === 'approvals' && (
              <div className="space-y-4">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5">
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-sky-400" />
                    <span>Inbound Records Needing Approval ({pendingApprovalsCount})</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    These logs were compiled by garage scanners. Please inspect pricing, products used, and mileage before accepting them into your car's official logs.
                  </p>
                </div>

                {pendingRecords.filter(r => r.approvalStatus === 'pending_owner_approval').length === 0 ? (
                  <div className="bg-slate-905 border border-dashed border-slate-800 rounded-3xl p-12 text-center space-y-3">
                    <div className="mx-auto w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-slate-600">
                      <CheckCircle2 className="w-5 h-5 text-slate-500" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-slate-400 uppercase">Approval Queue is Clear</h4>
                      <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                        There are no incoming service records waiting at this time. Go to the "Garage View" to simulate scanner record creation!
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingRecords.filter(r => r.approvalStatus === 'pending_owner_approval').map((record) => (
                      <div key={record.id} className="bg-slate-905 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-lg">
                        {/* Record Head Info */}
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/60 pb-3">
                          <div className="space-y-0.5">
                            <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-bold uppercase inline-block">
                              Pending Owner Sign Off
                            </span>
                            <h4 className="text-sm font-bold text-slate-100">
                              {record.serviceCategory} 
                            </h4>
                            <p className="text-[11px] text-slate-400">
                              Submitted by <strong className="text-sky-400">{record.providerName}</strong>
                            </p>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] text-slate-500 block">Estimated Cost</span>
                            <span className="text-lg font-mono font-black text-emerald-400">
                              ${record.cost} <span className="text-xs font-sans text-slate-400">USD</span>
                            </span>
                          </div>
                        </div>

                        {/* Record Content Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                          <div className="p-3 bg-slate-900 rounded-2xl space-y-1">
                            <span className="text-[10px] text-slate-500 font-bold block">SERVICE PARAMETERS</span>
                            <p className="font-semibold text-slate-300">Date: {record.serviceDate}</p>
                            <p className="font-semibold text-slate-300">Odometer: {record.mileage.toLocaleString()} km</p>
                            <p className="font-semibold text-slate-300">Warranty: {record.warranty || "No warranty"}</p>
                          </div>

                          <div className="p-3 bg-slate-900 rounded-2xl space-y-1 md:col-span-2">
                            <span className="text-[10px] text-slate-500 font-bold block">COMPONENTS & PRODUCTS</span>
                            <p className="text-slate-300 font-medium"><strong className="text-slate-400">Lubricants/Chemicals:</strong> {record.productUsed || "N/A"}</p>
                            <p className="text-slate-300 font-medium"><strong className="text-slate-400">Parts replaced:</strong> {record.partsChanged || "N/A"}</p>
                          </div>
                        </div>

                        <div className="p-3.5 bg-slate-900/50 rounded-2xl border border-slate-800 space-y-1">
                          <span className="text-[10px] text-sky-400 font-bold uppercase tracking-wider block">Diagnostics / Notes</span>
                          <p className="text-[11px] text-slate-300 leading-relaxed italic">
                            "{record.note}"
                          </p>
                        </div>

                        {/* Sugested Future Reminders info */}
                        {(record.nextServiceDate || record.nextServiceMileage) && (
                          <div className="p-3 bg-sky-950/20 border border-sky-900/40 rounded-2xl flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <Bell className="w-4 h-4 text-sky-400" />
                              <span className="text-slate-300">
                                Sugested Followup Alert: <strong className="text-slate-100">{record.nextServiceDate ? new Date(record.nextServiceDate).toLocaleDateString() : ""}</strong> {record.nextServiceMileage ? `or at ${record.nextServiceMileage.toLocaleString()} km` : ""}
                              </span>
                            </div>
                            <span className="text-[9px] uppercase font-bold text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded-lg">
                              Auto Remind
                            </span>
                          </div>
                        )}

                        {/* Interactive Buttons */}
                        <div className="flex flex-wrap items-center justify-end gap-3.5 pt-3 border-t border-slate-800">
                          <button
                            onClick={() => {
                              setDisputeRecordId(record.id);
                              setDisputeReasonText("");
                            }}
                            className="px-3.5 py-1.5 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Dispute Info</span>
                          </button>

                          <button
                            onClick={() => handleRejectRecord(record.id)}
                            className="px-3.5 py-1.5 rounded-xl border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject Record</span>
                          </button>

                          <button
                            onClick={() => handleApproveRecord(record.id)}
                            className="px-5 py-2.5 rounded-xl bg-sky-500 text-slate-950 font-black text-xs transition shadow-lg hover:bg-sky-400 flex items-center gap-2 cursor-pointer"
                          >
                            <Check className="w-4 h-4 text-slate-950 stroke-[3]" />
                            <span>Accept & Save to History</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Dispute Form Popup Modal (Inside tab) */}
                {disputeRecordId && (
                  <div className="bg-slate-950 border border-rose-900 p-5 rounded-3xl space-y-4 animate-scale">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Filing Maintenance Record Dispute</span>
                      </div>
                      <button 
                        onClick={() => setDisputeRecordId(null)}
                        className="p-1 bg-slate-900 rounded-lg text-slate-500 hover:text-slate-200 transition cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form onSubmit={handleSubmitDispute} className="space-y-4">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">
                          Specify Dispute Reason
                        </label>
                        <textarea
                          required
                          rows={3}
                          value={disputeReasonText}
                          onChange={(e) => setDisputeReasonText(e.target.value)}
                          placeholder="e.g., The cost was recorded incorrect. The mechanic changed parts different from what we discussed."
                          className="w-full text-xs text-white bg-slate-900 border border-rose-900/30 Fokus-ring rounded-xl p-3 placeholder-slate-600 focus:outline-none"
                        ></textarea>
                      </div>

                      <div className="flex justify-end gap-2.5">
                        <button
                          type="button"
                          onClick={() => setDisputeRecordId(null)}
                          className="px-3.5 py-1.5 text-xs font-bold text-slate-400 hover:text-slate-200 transition cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-red-600/10 cursor-pointer"
                        >
                          Submit Dispute to Admin
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* HISTORICAL CODES FOR ARCHIVED RESULTS */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4.5">
                  <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-sky-400" />
                    <span>Scanned Records Audit Trail</span>
                  </h4>

                  {pendingRecords.filter(r => r.approvalStatus !== 'pending_owner_approval').length === 0 ? (
                    <p className="text-[11px] text-slate-500 italic">No non-pending scanned history in Cambodia database cache.</p>
                  ) : (
                    <div className="divide-y divide-slate-800">
                      {pendingRecords.filter(r => r.approvalStatus !== 'pending_owner_approval').map(record => (
                        <div key={record.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                          <div>
                            <div className="font-semibold text-slate-200 flex items-center gap-2">
                              <span>{record.serviceCategory}</span>
                              <span className="text-[10px] text-slate-500">at {record.providerName}</span>
                            </div>
                            <span className="text-[10px] text-slate-400">{record.serviceDate} • {record.mileage.toLocaleString()} km • ${record.cost}</span>
                            {record.disputeReason && (
                              <p className="text-[10px] text-red-400/85 mt-1 italic">Dispute comment: "{record.disputeReason}"</p>
                            )}
                          </div>

                          <div>
                            {record.approvalStatus === 'approved' && (
                              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md font-bold text-[9px] uppercase">
                                Approved
                              </span>
                            )}
                            {record.approvalStatus === 'rejected' && (
                              <span className="px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-md font-bold text-[9px] uppercase">
                                Rejected
                              </span>
                            )}
                            {record.approvalStatus === 'disputed' && (
                              <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-md font-bold text-[9px] uppercase">
                                Disputed
                              </span>
                            )}
                            {record.approvalStatus === 'admin_locked' && (
                              <span className="px-2 py-0.5 bg-slate-500/15 text-slate-400 border border-slate-500/30 rounded-md font-bold text-[9px] uppercase">
                                LOCKED BY ADMIN
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SUB-TAB C: OWNER PRIVACY SETTINGS */}
            {ownerTab === 'privacy' && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-sky-400" />
                    <span>My Privacy Shield Control Parameters</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Control what metadata Cambodian repair shops and petrol partners inspect immediately when scanning your QR Token.
                  </p>
                </div>

                <div className="space-y-4 divide-y divide-slate-800">
                  {/* Toggle 1: Show full name */}
                  <div className="flex items-center justify-between gap-4 pt-1.5">
                    <div className="space-y-0.5 pr-4">
                      <span className="text-xs font-bold text-slate-200">Expose Full Identity</span>
                      <p className="text-[11px] text-slate-400 leading-normal">
                        If disabled, only masking abbreviations (e.g. "Yeon P.") display inside scanned profiles.
                      </p>
                    </div>
                    {/* Visual Switch Button */}
                    <button
                      onClick={() => handleTogglePrivacy('showFullName', privacySettings.showFullName)}
                      className={`w-11 h-6 rounded-full p-1 transition-colors outline-none cursor-pointer ${
                        privacySettings.showFullName ? "bg-sky-500" : "bg-slate-950"
                      }`}
                    >
                      <div className={`w-4 h-4 bg-slate-950 rounded-full transition-transform ${
                        privacySettings.showFullName ? "translate-x-5 bg-white" : "translate-x-0 bg-slate-600"
                      }`} />
                    </button>
                  </div>

                  {/* Toggle 2: Show Phone */}
                  <div className="flex items-center justify-between gap-4 pt-4">
                    <div className="space-y-0.5 pr-4">
                      <span className="text-xs font-bold text-slate-200">Share Phone Number</span>
                      <p className="text-[11px] text-slate-400 leading-normal">
                        Allows mechanists to call or verify your phone directly when checking the car under mud guards.
                      </p>
                    </div>
                    <button
                      onClick={() => handleTogglePrivacy('showPhone', privacySettings.showPhone)}
                      className={`w-11 h-6 rounded-full p-1 transition-colors outline-none cursor-pointer ${
                        privacySettings.showPhone ? "bg-sky-500" : "bg-slate-950"
                      }`}
                    >
                      <div className={`w-4 h-4 bg-slate-950 rounded-full transition-transform ${
                        privacySettings.showPhone ? "translate-x-5 bg-white" : "translate-x-0 bg-slate-600"
                      }`} />
                    </button>
                  </div>

                  {/* Toggle 3: Show Plate Number */}
                  <div className="flex items-center justify-between gap-4 pt-4">
                    <div className="space-y-0.5 pr-4">
                      <span className="text-xs font-bold text-slate-200">Transmit Official Plates</span>
                      <p className="text-[11px] text-slate-400 leading-normal">
                        If disabled, plate credentials like Phnom Penh 2A-8854 are hidden entirely in service drafts.
                      </p>
                    </div>
                    <button
                      onClick={() => handleTogglePrivacy('showPlateNumber', privacySettings.showPlateNumber)}
                      className={`w-11 h-6 rounded-full p-1 transition-colors outline-none cursor-pointer ${
                        privacySettings.showPlateNumber ? "bg-sky-500" : "bg-slate-950"
                      }`}
                    >
                      <div className={`w-4 h-4 bg-slate-950 rounded-full transition-transform ${
                        privacySettings.showPlateNumber ? "translate-x-5 bg-white" : "translate-x-0 bg-slate-600"
                      }`} />
                    </button>
                  </div>

                  {/* Toggle 4: Previous Service History visibility */}
                  <div className="flex items-center justify-between gap-4 pt-4">
                    <div className="space-y-0.5 pr-4">
                      <span className="text-xs font-bold text-slate-200">Share Global Service Records</span>
                      <p className="text-[11px] text-slate-400 leading-normal">
                        Allows garages to inspect historical records created by OTHER repair stations to help with deep diagnoses.
                      </p>
                    </div>
                    <button
                      onClick={() => handleTogglePrivacy('showPreviousHistory', privacySettings.showPreviousHistory)}
                      className={`w-11 h-6 rounded-full p-1 transition-colors outline-none cursor-pointer ${
                        privacySettings.showPreviousHistory ? "bg-sky-500" : "bg-slate-950"
                      }`}
                    >
                      <div className={`w-4 h-4 bg-slate-950 rounded-full transition-transform ${
                        privacySettings.showPreviousHistory ? "translate-x-5 bg-white" : "translate-x-0 bg-slate-600"
                      }`} />
                    </button>
                  </div>

                  {/* Toggle 5: Allow follow ups */}
                  <div className="flex items-center justify-between gap-4 pt-4">
                    <div className="space-y-0.5 pr-4">
                      <span className="text-xs font-bold text-slate-200">Allow Shop Follow-Up Alerts</span>
                      <p className="text-[11px] text-slate-400 leading-normal">
                        Permit shops you previously checked into to push scheduling recommendation reminders when oil is depleted.
                      </p>
                    </div>
                    <button
                      onClick={() => handleTogglePrivacy('allowFollowUps', privacySettings.allowFollowUps)}
                      className={`w-11 h-6 rounded-full p-1 transition-colors outline-none cursor-pointer ${
                        privacySettings.allowFollowUps ? "bg-sky-500" : "bg-slate-950"
                      }`}
                    >
                      <div className={`w-4 h-4 bg-slate-950 rounded-full transition-transform ${
                        privacySettings.allowFollowUps ? "translate-x-5 bg-white" : "translate-x-0 bg-slate-600"
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB D: AUTHORIZED PARTNERS & REQUESTS */}
            {ownerTab === 'partners' && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <ShieldAlert className="w-4.5 h-4.5 text-sky-400" />
                    <span>Authorized Partners & Access Management</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Review which Cambodian repair centers, petrol stations, and parts shops can dynamically identify your vehicle, view maintenance histories, or submit service tickets for your approval.
                  </p>
                </div>

                {/* 1. Pending Access Requests List */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                    <History className="w-4 h-4 text-amber-500" />
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      Pending Access Tickets ({partnerRequests.filter(req => req.status === 'pending').length})
                    </h4>
                  </div>

                  {partnerRequests.filter(req => req.status === 'pending').length === 0 ? (
                    <div className="bg-slate-950 rounded-2xl p-4 text-center border border-slate-800/40">
                      <p className="text-xs text-slate-500">
                        No pending access authorization tickets. In-app security parameters are intact.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {partnerRequests.filter(req => req.status === 'pending').map((req) => {
                        const targetVehicle = vehicles.find(v => v.id === req.vehicleId);
                        return (
                          <div key={req.id} className="bg-slate-950 p-4 rounded-2xl border border-amber-500/15 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="bg-amber-500/10 text-amber-400 text-[10px] uppercase font-bold px-2 py-0.5 rounded border border-amber-500/25 animate-pulse">
                                  Access Requested
                                </span>
                                <span className="text-xs font-mono text-slate-400">
                                  ID: {req.id}
                                </span>
                              </div>
                              <h5 className="text-sm font-bold text-white">
                                {req.garageName}
                              </h5>
                              <p className="text-xs text-slate-400 leading-normal">
                                Requests history access & ticket generation for: <strong className="text-sky-400">{targetVehicle ? `${targetVehicle.brand} ${targetVehicle.model}` : "My Car"}</strong> ({req.publicVehicleId})
                              </p>
                              <p className="text-[10px] text-slate-500">
                                Ticket Sent: {new Date(req.createdAt).toLocaleString()}
                              </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                onClick={() => handleApprovePartnerRequest(req.id, 'trusted')}
                                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Trust Partner</span>
                              </button>
                              <button
                                onClick={() => handleApprovePartnerRequest(req.id, 'one_time')}
                                className="px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-slate-950 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
                              >
                                <Lock className="w-3.5 h-3.5" />
                                <span>One-Time Pass</span>
                              </button>
                              <button
                                onClick={() => handleRejectPartnerRequest(req.id)}
                                className="px-3 py-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-850 text-rose-500 text-xs font-medium rounded-xl transition cursor-pointer flex items-center gap-1.5"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Deny</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 2. Active Authorized Partners List */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      Active Authorizations ({partnerPermissions.filter(p => p.status !== 'revoked').length})
                    </h4>
                  </div>

                  {partnerPermissions.filter(p => p.status !== 'revoked').length === 0 ? (
                    <div className="bg-slate-950 rounded-2xl p-6 text-center border border-slate-850">
                      <p className="text-xs text-slate-400">
                        You have not granted persistent access privileges to any digital partner yet.
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Show your vehicle QR code to any partner at the shop checkout to let them request instant authorization.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {partnerPermissions.filter(p => p.status !== 'revoked').map((perm) => {
                        const targetV = vehicles.find(v => v.id === perm.vehicleId);
                        const isOneTime = perm.status === 'one_time';
                        return (
                          <div key={perm.id} className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded border ${
                                  isOneTime 
                                    ? "bg-amber-500/10 text-amber-400 border-amber-500/20" 
                                    : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                }`}>
                                  {isOneTime ? "One-Time Access" : "Persistent Trusted Partner"}
                                </span>
                                <span className="text-xs font-mono text-slate-500">
                                  Perm Ref: {perm.id}
                                </span>
                              </div>
                              <h5 className="text-sm font-bold text-slate-200">
                                {perm.garageName}
                              </h5>
                              <p className="text-xs text-slate-400">
                                Authorized for: <span className="text-sky-400 font-semibold">{targetV ? `${targetV.brand} ${targetV.model}` : "My Car"}</span>
                              </p>
                              <p className="text-[10px] text-slate-500">
                                Approved on: {new Date(perm.grantedAt).toLocaleString()}
                              </p>
                            </div>

                            <div>
                              <button
                                onClick={() => handleRevokePartnerPermission(perm.id)}
                                className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 hover:text-rose-400 border border-rose-500/20 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1"
                              >
                                <Ban className="w-3.5 h-3.5" />
                                <span>Revoke Access Rights</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Privacy Warning Footer Note */}
                <div className="p-3 bg-blue-500/5 rounded-2xl border border-sky-500/15 text-xs text-slate-405 leading-normal flex gap-2.5 items-start">
                  <Lock className="w-4.5 h-4.5 text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-100">Zero-Trust Attribute-Based Security (ABAC):</strong> Revoking a partner forces our security engine to hide any sensitive mechanical telemetry, license plates, and phone indicators immediately on their scanning terminals.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. TAB DETAILS - SHOP PARTNER ADVANCED VIEWS (GARAGE / PETROL / SPARE PART) */}
      {activeRole !== 'owner' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-400/20">
                  <Wrench className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">
                    Cambodia Shop Terminal Console
                  </h3>
                  <p className="text-xs text-sky-400">
                    Authorized Operating Node: <strong className="text-slate-200">{selectedProvider.name}</strong>
                  </p>
                </div>
              </div>

              {/* Status pill */}
              <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-sans font-extrabold tracking-wider uppercase animate-pulse">
                ● Live Connector Active
              </span>
            </div>

            {/* Simulated QR scan action triggers */}
            <div className="space-y-4 bg-slate-950 p-4.5 rounded-2xl border border-slate-805">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                Simulator Control: Scanners & Manual Search
              </span>
              
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => handleSimulateScan("MCC-USER-8F92KLA")}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5 text-sky-400" />
                  <span>Scan Customer Profile QR ("MCC-USER-8F92KLA")</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSimulateScan("MCC-CAR-4471XDA")}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5 text-orange-400" />
                  <span>Scan Seeded Tacoma QR ("MCC-CAR-4471XDA")</span>
                </button>

                {vehicles && vehicles.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => handleSimulateScan(v.qrSecureToken || v.id)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5 text-emerald-450 animate-pulse" />
                    <span>Scan {v.brand} {v.model} QR ("{v.publicVehicleId || "CAR-000001"}")</span>
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-900 flex items-center gap-3">
                <span className="text-[11px] text-slate-400 whitespace-nowrap">Or Search Odometer ID / User ID:</span>
                <div className="relative flex-1 max-w-sm">
                  <input
                    type="text"
                    value={manualRecordId}
                    onChange={(e) => setManualRecordId(e.target.value)}
                    placeholder="e.g., MCC-USER-000239 or 8F92KLA"
                    className="w-full text-xs text-white bg-slate-900 border border-slate-800 rounded-xl py-2 pl-3 pr-24 focus:outline-none focus:border-sky-500 transition"
                  />
                  <button
                    onClick={handleManualLookup}
                    className="absolute right-1 top-1 bottom-1 px-3 bg-sky-500 hover:bg-sky-400 text-slate-950 text-[10px] font-bold rounded-lg transition cursor-pointer"
                  >
                    Lookup
                  </button>
                </div>
              </div>
            </div>

            {/* Error notifications */}
            {scanError && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-2xl flex items-center gap-2">
                <AlertCircle className="w-4.5 h-4.5" />
                <span>{scanError}</span>
              </div>
            )}
          </div>

          {/* Form and Customer Profile Resolving results */}
          {scanLoading ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center">
              <RefreshCw className="w-6 h-6 text-sky-400 animate-spin mx-auto mb-3" />
              <p className="text-xs text-slate-400">Interrogating client-privacy configurations with Cambodia server cache...</p>
            </div>
          ) : scanResult ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Profile Resolution */}
              <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
                <div>
                  <span className="text-[9px] uppercase font-medium bg-sky-500/10 text-sky-400 border border-sky-450/25 px-2.5 py-0.5 rounded-lg font-bold">
                    Scanned Entity Resolved
                  </span>
                  <h4 className="text-sm font-black text-slate-100 mt-2">
                    {scanResult.scannedType === 'user' ? "Owner Account Identity" : "Vehicle Metadata Block"}
                  </h4>
                </div>

                {/* Zero-Trust ABAC permissions shield banner */}
                {scanResult.permissionRequired ? (
                  <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl space-y-2 text-left">
                    <div className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-rose-450 animate-pulse" />
                      <span className="text-[10px] font-extrabold uppercase text-rose-400 tracking-wider">🔒 ZERO TRUST SECURITY ACTIVE</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal">
                      The car owner's configurations have masked specific contact reference markers. Send an access request ticket to unlock logging profiles.
                    </p>
                  </div>
                ) : (
                  <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl space-y-1.5 text-left">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-450 animate-pulse" />
                      <span className="text-[10px] font-extrabold uppercase text-emerald-400 tracking-wider">✅ AUTHORIZED PARTNER ACCESS</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal">
                      Credential validated. This operator node is certified to submit logs, tire specs, and oil pressure notes.
                    </p>
                  </div>
                )}

                <div className="space-y-3 pt-1 text-xs text-slate-300">
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-500">Owner Name:</span>
                    <span className="font-semibold text-slate-200">{scanResult.ownerName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-500">Phone ref:</span>
                    <span className="font-mono text-slate-200">{scanResult.ownerPhone}</span>
                  </div>
                  
                  {scanResult.scannedType === 'vehicle' ? (
                    <>
                      <div className="flex justify-between py-1 border-b border-slate-800/60">
                        <span className="text-slate-500">Vehicle Make:</span>
                        <span className="font-semibold text-sky-400">{scanResult.brand} {scanResult.model} ({scanResult.year})</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-800/60">
                        <span className="text-slate-500">Active Odometer:</span>
                        <span className="font-mono text-slate-200">{scanResult.mileage.toLocaleString()} km</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-800/60">
                        <span className="text-slate-500">Plate No:</span>
                        <span className="font-mono text-slate-200">{scanResult.plateNumber}</span>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-slate-500 block">LINKED VEHICLES</span>
                      {scanResult.vehicles?.map((v: any) => (
                        <div key={v.id} className="p-2.5 bg-slate-950 rounded-xl border border-slate-850 text-slate-300 space-y-1">
                          <p className="font-bold text-sky-400">{v.label}</p>
                          <p className="text-[10px] text-slate-400">Odometer: {v.mileage.toLocaleString()} km | Plate: {v.plateNumber}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Previous checkins */}
                  <div className="pt-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider mb-2">Previous Shop Check-ins</span>
                    {scanResult.previousServiceHistory && scanResult.previousServiceHistory.length > 0 ? (
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {scanResult.previousServiceHistory.map((h: any) => (
                          <div key={h.id} className="p-2 bg-slate-950 rounded-lg text-[10px] space-y-0.5">
                            <div className="flex justify-between text-slate-300 font-bold">
                              <span>{h.serviceCategory}</span>
                              <span className="text-emerald-400">${h.cost}</span>
                            </div>
                            <p className="text-slate-500">{h.date} • {h.mileage.toLocaleString()} km</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-500 italic leading-relaxed">
                        No previous historical records shared. {privacySettings.showPreviousHistory ? "(Database empty)" : "(Owner privacy rules hide other garages' data from this terminal)"}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Service Creator Form */}
              <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 relative">
                {scanResult.permissionRequired && (
                  <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm rounded-3xl z-30 flex flex-col items-center justify-center p-8 text-center space-y-4">
                    <div className="p-4 bg-amber-500/10 text-amber-500 rounded-full border border-amber-500/20">
                      <Lock className="w-8 h-8 text-amber-500" />
                    </div>
                    <div className="space-y-1.5 max-w-md">
                      <h4 className="text-base font-extrabold text-amber-500 uppercase tracking-tight">Access Token Not Authorized</h4>
                      <p className="text-xs text-slate-350 leading-relaxed">
                        This vehicle ({scanResult.publicVehicleId}) has dynamic security parameters turned on. You must obtain an access token approval from the car owner's dashboard before submitting digital log receipts.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleGarageRequestAccess(scanResult.vehicleId || scanResult.vehicles?.[0]?.id)}
                      disabled={isRequestingAccess}
                      className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 font-extrabold text-slate-950 rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isRequestingAccess ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <ShieldAlert className="w-4 h-4" />
                      )}
                      <span>Request Access Approval Ticket</span>
                    </button>
                    
                    {lastRequestSentStatus && (
                      <p className="text-xs text-emerald-400 font-bold bg-emerald-500/5 px-4 py-2 rounded-xl border border-emerald-500/10 animate-pulse">
                        {lastRequestSentStatus}
                      </p>
                    )}
                  </div>
                )}

                <form onSubmit={handleSubmitServiceRecord} className="space-y-5">
                  <div className="border-b border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-100">
                        Submit Customer Invoice & Service Receipt
                      </h4>
                      <p className="text-xs text-slate-400">
                        Enter professional diagnostics details to update the client's official logs.
                      </p>
                    </div>
                    
                    <span className="text-[9px] font-mono px-2 py-0.5 bg-slate-950 text-slate-400 border border-slate-800 rounded">
                      OPERATOR ID: {selectedProvider.id}
                    </span>
                  </div>

                  {/* Form Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                        Service Category
                      </label>
                      <select
                        value={logCategory}
                        onChange={(e) => setLogCategory(e.target.value)}
                        className="w-full text-xs text-white bg-slate-950 border border-slate-800 rounded-xl p-3 focus:outline-none focus:border-sky-500"
                      >
                        <option value="Engine Oil Service">Engine Oil Service</option>
                        <option value="Brake Service">Brake Service</option>
                        <option value="Tire Service">Tire Service</option>
                        <option value="A/C Diagnostics">A/C Diagnostics</option>
                        <option value="Electrical Diagnosis">Electrical Diagnosis</option>
                        <option value="General Checkup">General Checkup</option>
                        <option value="Suspension Repair">Suspension Repair</option>
                        <option value="Car Wash & Detailing">Car Wash & Detailing</option>
                        <option value="Spare Parts Replacements">Spare Parts Replacements</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                        Current Odometer Reading (km)
                      </label>
                      <input
                        type="number"
                        required
                        value={logMileage}
                        onChange={(e) => setLogMileage(e.target.value)}
                        className="w-full text-xs text-white bg-slate-950 border border-slate-800 rounded-xl p-3 focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    {/* Breakdown Cost Grid */}
                    <div className="md:col-span-2 p-4 bg-slate-950 rounded-2xl border border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">
                          Parts Cost ($)
                        </label>
                        <input
                          type="number"
                          value={partsCost}
                          onChange={(e) => {
                            setPartsCost(e.target.value);
                            const sum = Number(e.target.value || 0) + Number(laborCost || 0) - Number(discount || 0);
                            setLogCost(Math.max(0, sum).toString());
                          }}
                          className="w-full text-xs text-white bg-slate-900 border border-slate-800 rounded-xl p-2.5 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">
                          Labor Cost ($)
                        </label>
                        <input
                          type="number"
                          value={laborCost}
                          onChange={(e) => {
                            setLaborCost(e.target.value);
                            const sum = Number(partsCost || 0) + Number(e.target.value || 0) - Number(discount || 0);
                            setLogCost(Math.max(0, sum).toString());
                          }}
                          className="w-full text-xs text-white bg-slate-900 border border-slate-800 rounded-xl p-2.5 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">
                          Discount rate ($)
                        </label>
                        <input
                          type="number"
                          value={discount}
                          onChange={(e) => {
                            setDiscount(e.target.value);
                            const sum = Number(partsCost || 0) + Number(laborCost || 0) - Number(e.target.value || 0);
                            setLogCost(Math.max(0, sum).toString());
                          }}
                          className="w-full text-xs text-white bg-slate-900 border border-slate-800 rounded-xl p-2.5 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1">
                          Total Invoice ($)
                        </label>
                        <div className="w-full bg-slate-900 text-emerald-400 font-mono font-bold text-[13px] rounded-xl p-2.5 border border-slate-800 flex items-center justify-between">
                          <span>$</span>
                          <span>{logCost}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                        Technician Assigned
                      </label>
                      <input
                        type="text"
                        value={technicianName}
                        onChange={(e) => setTechnicianName(e.target.value)}
                        placeholder="e.g., Sok Nimol - Senior Tech"
                        className="w-full text-xs text-white bg-slate-950 border border-slate-800 rounded-xl p-3 focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                        Payment Settlement Status
                      </label>
                      <select
                        value={paymentStatus}
                        onChange={(e) => setPaymentStatus(e.target.value)}
                        className="w-full text-xs text-white bg-slate-950 border border-slate-800 rounded-xl p-3 focus:outline-none focus:border-sky-500"
                      >
                        <option value="Paid via Wing QR">Paid via Wing QR</option>
                        <option value="Paid via ABA Mobile">Paid via ABA Mobile</option>
                        <option value="Cash Settlement (Paid)">Cash Settlement (Paid)</option>
                        <option value="Invoice Generated (Pending)">Invoice Generated (Pending)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                        Lubricants, Parts & Consumables Brand
                      </label>
                      <input
                        type="text"
                        required
                        value={logProductUsed}
                        onChange={(e) => setLogProductUsed(e.target.value)}
                        placeholder="e.g., Synthetic Mobil-1 5W-40"
                        className="w-full text-xs text-white bg-slate-950 border border-slate-800 rounded-xl p-3 focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                        Spare Parts Replaced & Installed
                      </label>
                      <input
                        type="text"
                        required
                        value={logPartsChanged}
                        onChange={(e) => setLogPartsChanged(e.target.value)}
                        placeholder="e.g., Oil filtration chamber, seal cap"
                        className="w-full text-xs text-white bg-slate-950 border border-slate-800 rounded-xl p-3 focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                        Warranty Terms (If any)
                      </label>
                      <input
                        type="text"
                        value={logWarranty}
                        onChange={(e) => setLogWarranty(e.target.value)}
                        placeholder="e.g., 30 Days parts and service"
                        className="w-full text-xs text-white bg-slate-950 border border-slate-800 rounded-xl p-3 focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    {/* Receipt document upload attachments */}
                    <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col justify-between">
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                        Files Scan & Receipt attachments
                      </label>
                      
                      <div className="flex flex-wrap items-center gap-1.5">
                        {scannedFilesList.length === 0 ? (
                          <span className="text-[10.5px] text-slate-500 italic block mb-1">No scanned bills attached</span>
                        ) : (
                          scannedFilesList.map((f, i) => (
                            <span key={i} className="px-2.5 py-0.5 bg-sky-950 text-sky-400 text-[10px] font-bold rounded-lg border border-sky-900 flex items-center gap-1">
                              <span>{f}</span>
                              <button
                                type="button"
                                onClick={() => setScannedFilesList(prev => prev.filter((_, idx) => idx !== i))}
                                className="text-slate-500 hover:text-red-400 font-bold ml-1 cursor-pointer"
                              >
                                ×
                              </button>
                            </span>
                          ))
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const files = ["invoice_receipt_no483.pdf", "engine_valves_photo.jpg", "spark_plugs_comparison.png"];
                          const nextFile = files[scannedFilesList.length % files.length];
                          if (!scannedFilesList.includes(nextFile)) {
                            setScannedFilesList([...scannedFilesList, nextFile]);
                          }
                        }}
                        className="mt-1.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-805 text-[10.5px] font-semibold text-slate-300 rounded-lg text-center transition cursor-pointer"
                      >
                        + Attach Diagnostic Photos & Scans
                      </button>
                    </div>
                  </div>

                  {/* Notes & AI Companion helpers */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="block text-[10px] uppercase font-bold text-slate-400">
                        Technical Diagnostics & Mechanic Notes
                      </label>
                      <div className="flex items-center gap-2">
                        {/* Old formatting trigger */}
                        <button
                          type="button"
                          onClick={handleAIFormatRecord}
                          disabled={aiGenerating}
                          className="text-[10px] font-bold text-slate-400 hover:text-slate-350 flex items-center gap-1 bg-slate-950/80 hover:bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-850 cursor-pointer disabled:opacity-50"
                        >
                          <Sparkles className="w-3 h-3 text-slate-400" />
                          <span>AI Polish</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleAIFormatDetailedRecord}
                          disabled={aiRecommendationLoading}
                          className="text-[10px] font-black text-sky-400 hover:text-sky-300 flex items-center gap-1 bg-sky-500/10 hover:bg-sky-500/20 px-2.5 py-1 rounded-lg border border-sky-500/25 cursor-pointer disabled:opacity-50"
                        >
                          <Sparkles className="w-3 h-3 text-sky-400 animate-pulse" />
                          <span>✨ Translate Bilingual English/Khmer</span>
                        </button>
                      </div>
                    </div>
                    
                    <textarea
                      rows={3}
                      value={logNote}
                      onChange={(e) => setLogNote(e.target.value)}
                      placeholder="Indicate parts condition, brake pad depth, driveability notes..."
                      className="w-full text-xs text-white bg-slate-950 border border-slate-800 rounded-xl p-3 focus:outline-none focus:border-sky-500"
                    ></textarea>

                    {aiRecommendationLoading && (
                      <p className="text-[10px] text-sky-450 animate-pulse bg-sky-950/50 p-2 rounded-xl border border-sky-900 text-sky-400">
                        🤖 AI Companion is running neural translations and optimizing Khmer advisory tags for heavy rain duty wear...
                      </p>
                    )}
                  </div>

                  {/* Suggested Next reminders toggle */}
                  <div className="bg-slate-955 p-4 rounded-2xl border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-200">Suggest Scheduling Followup Alert</span>
                        <p className="text-[10px] text-slate-400">Owner will receive alerts matching these limits automatically.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSuggestNextService(!suggestNextService)}
                        className={`w-11 h-6 rounded-full p-1 transition-colors outline-none cursor-pointer ${
                          suggestNextService ? "bg-sky-500" : "bg-slate-900"
                        }`}
                      >
                        <div className={`w-4 h-4 bg-slate-950 rounded-full transition-transform ${
                          suggestNextService ? "translate-x-5 bg-white" : "translate-x-0 bg-slate-600"
                        }`} />
                      </button>
                    </div>

                    {suggestNextService && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 animate-fade-in text-xs">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                            Recommended Service Date
                          </label>
                          <input
                            type="date"
                            value={nextServiceDate}
                            onChange={(e) => setNextServiceDate(e.target.value)}
                            className="w-full text-xs text-white bg-slate-900 border border-slate-800 rounded-xl p-3 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                            Odometer Threshold Limit (km)
                          </label>
                          <input
                            type="number"
                            value={nextServiceMileage}
                            onChange={(e) => setNextServiceMileage(e.target.value)}
                            className="w-full text-xs text-white bg-slate-900 border border-slate-800 rounded-xl p-3 focus:outline-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Submission buttons */}
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setScanResult(null)}
                      className="px-4 py-2 border border-slate-800 hover:border-slate-705 text-slate-400 text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      Reset Draft
                    </button>
                    
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-sky-500/10 flex items-center gap-2 transition cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5 text-slate-950" />
                      <span>Submit for Customer Sign Off</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-slate-950 flex items-center justify-center text-slate-500">
                <QrCode className="w-6 h-6 text-sky-400" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-300">Scanner Camera Standby</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-normal">
                  No active customer QR or manual search has been query resolved yet. Click one of the simulated scan triggers at the top of the shop panel to proceed.
                </p>
              </div>
            </div>
          )}

          {/* Previous Customer list & Action to follow up */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div>
              <h4 className="text-sm font-bold text-slate-100">
                Active Client Database List & Follow-Up Panel
              </h4>
              <p className="text-xs text-slate-400">
                View previous Cambodia car owner profiles who checked into your repair bay. Issue schedule warnings to boost visits.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-850 text-slate-400 font-bold">
                    <th className="pb-3 pl-1">CLIENT</th>
                    <th className="pb-3">VEHICLE CLASS</th>
                    <th className="pb-3">LAST TICKET CATEGORY</th>
                    <th className="pb-3">LAST SERVICE</th>
                    <th className="pb-3 text-right">FOLLOW-UP ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  <tr className="text-slate-300">
                    <td className="py-3.5 pl-1 font-semibold text-slate-200">Yeon Pisith (owner)</td>
                    <td>Toyota Tacoma 2006</td>
                    <td>Engine Oil Service</td>
                    <td>2026-05-28</td>
                    <td className="py-3.5 text-right">
                      {privacySettings.allowFollowUps ? (
                        <button
                          onClick={() => handleSendFollowUp("v1", "Yeon Pisith", "Engine Oil Lube")}
                          className="px-3 py-1.5 bg-sky-500/10 text-sky-400 hover:bg-sky-500 hover:text-slate-950 rounded-lg text-[10px] font-black transition cursor-pointer"
                        >
                          Send Oil Due Notice
                        </button>
                      ) : (
                        <button
                          disabled
                          className="px-3 py-1.5 bg-slate-950 text-slate-600 rounded-lg text-[10px] font-semibold flex items-center gap-1 ml-auto"
                          title="Car owner blocked promotional follow ups"
                        >
                          <Ban className="w-3 h-3 text-slate-600" />
                          <span>Muted by user settings</span>
                        </button>
                      )}
                    </td>
                  </tr>

                  <tr className="text-slate-300">
                    <td className="py-3.5 pl-1 font-semibold text-slate-200">Chan Sophy</td>
                    <td>Lexus RX300 (EV Hybrid)</td>
                    <td>A/C Air filter replace</td>
                    <td>2026-04-12</td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => handleSendFollowUp("v1", "Chan Sophy", "AC Microfilter")}
                        className="px-3 py-1.5 bg-sky-500/10 text-sky-400 hover:bg-sky-500 hover:text-slate-950 rounded-lg text-[10px] font-black transition cursor-pointer"
                      >
                        Send AC check notice
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
