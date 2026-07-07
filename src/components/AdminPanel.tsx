/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Send, 
  TrendingUp, 
  Users, 
  ShieldAlert, 
  Building, 
  Settings2, 
  CheckCircle, 
  Megaphone, 
  Bell, 
  Terminal, 
  Activity,
  Plus,
  Lock,
  RefreshCw,
  Search,
  Trash2,
  Edit,
  UserMinus,
  ChevronRight,
  Download,
  Key,
  AlertTriangle,
  Check,
  FileText,
  LayoutDashboard,
  Briefcase,
  MapPin,
  X,
  CreditCard,
  Gauge
} from "lucide-react";
import { VehicleProfile, MaintenanceRecord, GaragePartner } from "../types";

interface AdminPanelProps {
  vehicles: VehicleProfile[];
  records: MaintenanceRecord[];
  garages: GaragePartner[];
}

interface AIAdminResult {
  summary: string;
  targetCount: number;
  campaignName: string;
  suggestedMessage: string;
  partnerOffer: string;
  actionableSteps: string[];
}

interface UserAccount {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  location: string;
  status: 'Pending' | 'Approved' | 'Suspended';
  businessName?: string;
  licenseNumber?: string;
  businessSubscription?: {
    planType: string;
    isVerified: boolean;
    featuredListing: boolean;
    staffLimit: number;
  };
}

interface AuditLogEntry {
  id: string;
  adminName: string;
  action: string;
  details: string;
  target: string;
  timestamp: string;
  ipAddress: string;
  device: string;
}

export default function AdminPanel({
  vehicles: initialVehicles,
  records,
  garages
}: AdminPanelProps) {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'vehicles' | 'rbac' | 'audits' | 'disputes' | 'config'>('dashboard');

  // Backend state synchronizer
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [vehicles, setVehicles] = useState<VehicleProfile[]>(initialVehicles);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [scanLogs, setScanLogs] = useState<any[]>([]);
  const [allServiceRecords, setAllServiceRecords] = useState<any[]>([]);
  
  // Loading & diagnostic states
  const [usersLoading, setUsersLoading] = useState(false);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);
  const [auditLoading, setAuditLoading] = useState(false);
  const [systemAlertMessage, setSystemAlertMessage] = useState<string | null>(null);

  // User Management filters & selections
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);

  // User details action fields
  const [isEditMode, setIsEditMode] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editStatus, setEditStatus] = useState<'Pending' | 'Approved' | 'Suspended'>('Approved');
  const [editBusinessName, setEditBusinessName] = useState("");
  const [editLicenseNumber, setEditLicenseNumber] = useState("");
  const [editIsVerified, setEditIsVerified] = useState(false);
  const [editFeaturedListing, setEditFeaturedListing] = useState(false);

  // Direct custom notification controls
  const [customNotifyMessage, setCustomNotifyMessage] = useState("");
  const [customNotifyChannel, setCustomNotifyChannel] = useState<'In-App' | 'Telegram' | 'Email'>('In-App');
  const [notifSuccessIndicator, setNotifSuccessIndicator] = useState(false);

  // Vehicle Ownership Transfer fields
  const [transferVehicleId, setTransferVehicleId] = useState("");
  const [transferToUserId, setTransferToUserId] = useState("");
  const [transferReason, setTransferReason] = useState("Platform registered sale and title exchange.");
  const [transferStatusMsg, setTransferStatusMsg] = useState<string | null>(null);

  // Credentials override details
  const [credentialTicket, setCredentialTicket] = useState<string | null>(null);

  // AI Assistant states
  const [adminQuery, setAdminQuery] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiReport, setAiReport] = useState<AIAdminResult | null>(null);

  // RBAC matrix checker
  const [rbacPermissions, setRbacPermissions] = useState<Record<string, string[]>>({
    'Super Admin': ['users_r', 'users_w', 'vehicles_r', 'vehicles_w', 'disputes_w', 'config_w', 'notifications_w'],
    'Platform Admin': ['users_r', 'users_w', 'vehicles_r', 'disputes_w'],
    'Finance Admin': ['revenue_r', 'config_w'],
    'Support Admin': ['users_r', 'disputes_w', 'notifications_w']
  });

  // System Configuration fields
  const [gasolineIntervalKm, setGasolineIntervalKm] = useState(5000);
  const [evIntervalMonths, setEvIntervalMonths] = useState(12);
  const [commissionRate, setCommissionRate] = useState(5.0);

  // Custom maintenance templates states
  const [serviceTemplatesList, setServiceTemplatesList] = useState<any[]>([]);
  const [templateName, setTemplateName] = useState("");
  const [templateCategory, setTemplateCategory] = useState("Engine Oil & Fluids");
  const [templateDescription, setTemplateDescription] = useState("");
  const [templateDiagFee, setTemplateDiagFee] = useState("15");
  const [templateLaborCost, setTemplateLaborCost] = useState("25");
  const [templateTargets, setTemplateTargets] = useState<string[]>(["Petrol / Gasoline"]);
  const [templateParts, setTemplateParts] = useState<{name: string, brand: string, qty: number, price: number}[]>([
    { name: "Synthetic Motor Air-filter Element", brand: "OEM Standard", qty: 1, price: 15 }
  ]);

  // Notification Abuse & Outreach suspension states
  const [suspensionData, setSuspensionData] = useState<any[]>([]);
  const [abuseReports, setAbuseReports] = useState<any[]>([]);
  const [suspensionLoading, setSuspensionLoading] = useState(false);

  // Load everything on mount
  useEffect(() => {
    fetchUsers();
    fetchVehicles();
    fetchAudits();
    fetchServiceTemplates();
    fetchSuspensionStatus();
  }, []);

  const fetchSuspensionStatus = async () => {
    setSuspensionLoading(true);
    try {
      const res = await fetch("/api/telegram/admin/suspension-status");
      if (res.ok) {
        const data = await res.json();
        setSuspensionData(data.statusList || []);
        setAbuseReports(data.reports || []);
      }
    } catch (e) {
      console.error("Failed to load suspension state:", e);
    } finally {
      setSuspensionLoading(false);
    }
  };

  const handleToggleSuspension = async (garageId: string, reason: string) => {
    try {
      const res = await fetch("/api/telegram/admin/toggle-suspension", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ garageId, reason })
      });
      if (res.ok) {
        triggerAlert("Garage transmission status updated successfully.");
        fetchSuspensionStatus();
        fetchAudits();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchServiceTemplates = async () => {
    try {
      const res = await fetch("/api/service-templates");
      if (res.ok) {
        setServiceTemplatesList(await res.json());
      }
    } catch (err) {
      console.error("Failed to load service templates:", err);
    }
  };

  const triggerAlert = (msg: string) => {
    setSystemAlertMessage(msg);
    setTimeout(() => setSystemAlertMessage(null), 4000);
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        setUsers(await res.json());
      }
    } catch (err) {
      console.error("Failed to load platform users:", err);
    }
    setUsersLoading(false);
  };

  const fetchVehicles = async () => {
    setVehiclesLoading(true);
    try {
      const res = await fetch("/api/vehicles");
      if (res.ok) {
        setVehicles(await res.json());
      }
    } catch (err) {
      console.error("Failed to load vehicle registry:", err);
    }
    setVehiclesLoading(false);
  };

  const fetchAudits = async () => {
    setAuditLoading(true);
    try {
      const [logsRes, recordsRes, auditsRes] = await Promise.all([
        fetch("/api/admin/scan-logs"),
        fetch("/api/admin/all-service-records"),
        fetch("/api/admin/audit-logs")
      ]);
      if (logsRes.ok) {
        setScanLogs(await logsRes.json());
      }
      if (recordsRes.ok) {
        setAllServiceRecords(await recordsRes.json());
      }
      if (auditsRes.ok) {
        setAuditLogs(await auditsRes.json());
      }
    } catch (err) {
      console.error("Failed to load platform audits:", err);
    }
    setAuditLoading(false);
  };

  // Status transitions
  const handleUpdateStatus = async (userId: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        triggerAlert(`Account status updated on server database: ${newStatus}`);
        fetchUsers();
        fetchAudits();
        if (selectedUser?.id === userId) {
          setSelectedUser(prev => prev ? { ...prev, status: newStatus as any } : null);
        }
      } else {
        triggerAlert("Error: Failed to change account state.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Edit complete user profile
  const handleSaveUserProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          email: editEmail,
          phone: editPhone,
          location: editLocation,
          role: editRole,
          status: editStatus,
          businessName: editBusinessName || null,
          licenseNumber: editLicenseNumber || null,
          isVerified: editIsVerified,
          featuredListing: editFeaturedListing
        })
      });

      if (res.ok) {
        triggerAlert("Master Profile properties successfully modified in database!");
        setIsEditMode(false);
        fetchUsers();
        fetchAudits();
        
        // Refresh selected user state
        const updatedUser: UserAccount = {
          id: selectedUser.id,
          name: editName,
          email: editEmail,
          phone: editPhone,
          location: editLocation,
          role: editRole,
          status: editStatus,
          businessName: editBusinessName || undefined,
          licenseNumber: editLicenseNumber || undefined,
          businessSubscription: {
            planType: selectedUser.businessSubscription?.planType || "Free",
            isVerified: editIsVerified,
            featuredListing: editFeaturedListing,
            staffLimit: selectedUser.businessSubscription?.staffLimit || 1
          }
        };
        setSelectedUser(updatedUser);
      } else {
        triggerAlert("Server rejected profile amendment request.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete User account
  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm("Are you absolutely sure you want to completely delete and terminate this user's account? This action is irreversible.")) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE"
      });

      if (res.ok) {
        triggerAlert("Account credentials permanently termined on platform.");
        setSelectedUser(null);
        fetchUsers();
        fetchAudits();
      } else {
        triggerAlert("Server failed to complete deletion protocol.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Password reset code block
  const handleResetPassword = async (userId: number) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: "POST"
      });
      if (res.ok) {
        const data = await res.json();
        setCredentialTicket(data.resetToken);
        triggerAlert("Credential security reset ticket generated!");
        fetchAudits();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Dispatch custom manual alert
  const handleSendCustomNotification = async (userId: number) => {
    if (!customNotifyMessage.trim()) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}/send-notif`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: customNotifyMessage,
          channel: customNotifyChannel
        })
      });

      if (res.ok) {
        setNotifSuccessIndicator(true);
        setCustomNotifyMessage("");
        setTimeout(() => setNotifSuccessIndicator(false), 3000);
        triggerAlert(`Notification dispatch logged via ${customNotifyChannel}!`);
        fetchAudits();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Arbitrate invoice disputing
  const handleLockRecord = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/service-records/${id}/lock`, {
        method: "POST"
      });
      if (res.ok) {
        triggerAlert("Fraud containment completed: Invoice locked.");
        fetchAudits();
      } else {
        triggerAlert("Failed to secure suspected record.");
      }
    } catch (err) {}
  };

  // Vehicle ownership transfer
  const handleExecuteTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferVehicleId || !transferToUserId) {
      triggerAlert("Please select both a target vehicle and destination recipient.");
      return;
    }

    const fromUser = users.find(u => u.name === selectedUser?.name);
    try {
      const res = await fetch("/api/admin/transfer-vehicle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId: transferVehicleId,
          fromUserId: fromUser?.id || null,
          toUserId: transferToUserId,
          reason: transferReason
        })
      });

      if (res.ok) {
        const data = await res.json();
        setTransferStatusMsg(`Ownership officially updated: Mapped to ${data.to}. History synced.`);
        setTransferVehicleId("");
        setTransferReason("Platform title dispatch verified.");
        fetchVehicles();
        fetchAudits();
      } else {
        const error = await res.json();
        triggerAlert(error.error || "Transfer request was rejected.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Trigger campaign parameters
  const handleAdminQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminQuery.trim()) return;

    setAiLoading(true);
    setAiError(null);

    try {
      const response = await fetch("/api/ai/admin-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: adminQuery })
      });

      if (!response.ok) throw new Error("Diagnostics compiler fault.");
      const data = await response.json();
      setAiReport(data);
    } catch (err: any) {
      setAiError("Failed to coordinate response with AI Core.");
    } finally {
      setAiLoading(false);
    }
  };

  const handlePresetQuery = (q: string) => {
    setAdminQuery(q);
    setAiLoading(true);
    setAiError(null);
    fetch("/api/ai/admin-query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: q })
    })
    .then(r => r.json())
    .then(data => setAiReport(data))
    .catch(err => setAiError("Network fault indexing diagnostics parameters."))
    .finally(() => setAiLoading(false));
  };

  // Set selected user details and variables
  const handleOpenUserDetails = (user: UserAccount) => {
    setSelectedUser(user);
    setIsEditMode(false);
    setCredentialTicket(null);
    setTransferStatusMsg(null);
    setTransferVehicleId("");

    // Populate form elements
    setEditName(user.name);
    setEditEmail(user.email);
    setEditPhone(user.phone || "");
    setEditLocation(user.location || "");
    setEditRole(user.role);
    setEditStatus(user.status || 'Approved');
    setEditBusinessName(user.businessName || "");
    setEditLicenseNumber(user.licenseNumber || "");
    setEditIsVerified(user.businessSubscription?.isVerified || false);
    setEditFeaturedListing(user.businessSubscription?.featuredListing || false);
  };

  // Toggle capabilities in custom RBAC grid
  const togglePermission = (role: string, perm: string) => {
    setRbacPermissions(prev => {
      const updated = { ...prev };
      const list = updated[role] || [];
      if (list.includes(perm)) {
        updated[role] = list.filter(p => p !== perm);
      } else {
        updated[role] = [...list, perm];
      }
      return updated;
    });
    triggerAlert(`RBAC Permission matrix updated for role: ${role}`);
  };

  // Local beautiful mock downloading
  const handleDownloadReport = (type: string) => {
    const header = "ID,NAME,ROLE,LOCATION,STATUS,EMAIL,CONTACT\n";
    const csvContent = "data:text/csv;charset=utf-8," 
      + header 
      + users.map(u => `${u.id},"${u.name}","${u.role}","${u.location}","${u.status || 'Approved'}",${u.email},${u.phone || 'N/A'}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `MyCarCare_${type}_Cambodia_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerAlert(`Comprehensive ${type} CSV report downloaded!`);
  };

  // Filter users database dynamically
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                          u.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                          (u.phone && u.phone.includes(userSearchQuery)) ||
                          (u.businessName && u.businessName.toLowerCase().includes(userSearchQuery.toLowerCase()));
    
    const matchesRole = selectedRoleFilter === "all" || u.role === selectedRoleFilter;
    const matchesStatus = selectedStatusFilter === "all" || (u.status || 'Approved') === selectedStatusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Calculate stats summary counters
  const totalUsersCount = users.length;
  const approvedUsers = users.filter(u => u.status === 'Approved').length;
  const pendingUsers = users.filter(u => u.status === 'Pending').length;
  const suspendedUsers = users.filter(u => u.status === 'Suspended').length;

  const totalRegisteredVehicles = vehicles.length;
  const evAndHybrids = vehicles.filter(v => v.fuelType === 'EV' || v.fuelType === 'Hybrid').length;
  const dieselTrucks = vehicles.filter(v => v.fuelType === 'Diesel').length;

  return (
    <div className="space-y-6">
      
      {/* Platform banner notification log alerts */}
      {systemAlertMessage && (
        <div id="system-alert" className="fixed top-4 right-4 z-50 bg-emerald-500 text-slate-900 px-4 py-3 rounded-xl border border-emerald-400 shadow-2xl flex items-center gap-2 animate-bounce">
          <Terminal className="w-4 h-4" />
          <span className="text-xs font-mono font-bold">{systemAlertMessage}</span>
        </div>
      )}

      {/* Header operations area */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold tracking-widest uppercase mb-1">
            <ShieldAlert className="w-4 h-4 animate-pulse" />
            <span>Highest Level Authority Dashboard</span>
          </div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight font-sans">
            MyCar Care KH Super Admin Console
          </h1>
          <p className="text-xs text-slate-400">
            Control platform parameters, audit user accounts, transfer vehicle titles, settle disputes, and manage RBAC matrices.
          </p>
        </div>

        <button
          onClick={() => {
            fetchUsers();
            fetchVehicles();
            fetchAudits();
            triggerAlert("Dynamic re-indexing completed across all municipal databases.");
          }}
          className="self-start md:self-center px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 rounded-xl text-xs font-mono font-bold text-slate-350 text-slate-305 text-emerald-400 hover:text-emerald-300 transition flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Force Registry Update</span>
        </button>
      </div>

      {/* Quick stats panels */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden">
          <div>
            <span className="text-[10px] font-extrabold text-slate-500 uppercase font-mono">Platform Accounts</span>
            <h3 className="text-3xl font-mono font-black text-slate-100 mt-1">{totalUsersCount}</h3>
          </div>
          <div className="flex gap-2 text-[10px] text-slate-400 mt-3 border-t border-slate-800/60 pt-2 font-mono">
            <span className="text-emerald-400">● {approvedUsers} Appr</span>
            <span className="text-amber-400">● {pendingUsers} Pend</span>
            <span className="text-red-400">● {suspendedUsers} Susp</span>
          </div>
          <div className="absolute right-3.5 top-4 text-slate-500">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden">
          <div>
            <span className="text-[10px] font-extrabold text-slate-500 uppercase font-mono">Registered Vehicles</span>
            <h3 className="text-3xl font-mono font-black text-slate-100 mt-1">{totalRegisteredVehicles}</h3>
          </div>
          <div className="flex gap-3 text-[10px] text-slate-400 mt-3 border-t border-slate-800/60 pt-2 font-mono">
            <span className="text-cyan-400">{evAndHybrids} Hybrid/EV</span>
            <span className="text-blue-400">{dieselTrucks} Diesel</span>
          </div>
          <div className="absolute right-3.5 top-4 text-slate-500">
            <Gauge className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden">
          <div>
            <span className="text-[10px] font-extrabold text-slate-500 uppercase font-mono">Affiliated Partners</span>
            <h3 className="text-3xl font-mono font-black text-slate-100 mt-1">
              {garages.filter(g => g.isPartner).length}
            </h3>
          </div>
          <div className="flex gap-2 text-[10px] text-emerald-400 mt-3 border-t border-slate-800/60 pt-2 font-mono">
            <span>Verified Repair Hubs Live in Cambodia</span>
          </div>
          <div className="absolute right-3.5 top-4 text-emerald-500/80">
            <Building className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden">
          <div>
            <span className="text-[10px] font-extrabold text-slate-500 uppercase font-mono">Municipal Revenue Stream</span>
            <h3 className="text-3xl font-mono font-black text-emerald-400 mt-1">$4,850.50</h3>
          </div>
          <div className="flex gap-2 text-[10px] text-slate-400 mt-3 border-t border-slate-800/60 pt-2 font-mono">
            <span>5% Commission Tier Enabled</span>
          </div>
          <div className="absolute right-3.5 top-4 text-emerald-500">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main navigation menu rail */}
      <div className="flex flex-wrap gap-1 border-b border-slate-800 pb-0 bg-slate-950 p-1.5 rounded-xl">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-3 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'dashboard' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Dashboard AI Control</span>
        </button>

        <button
          onClick={() => { setActiveTab('users'); setSelectedUser(null); }}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'users' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>User Accounts ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('vehicles')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'vehicles' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
          }`}
        >
          <Gauge className="w-3.5 h-3.5" />
          <span>Vehicle Fleet Registry</span>
        </button>

        <button
          onClick={() => setActiveTab('rbac')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'rbac' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>RBAC Matrix config</span>
        </button>

        <button
          onClick={() => setActiveTab('disputes')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'disputes' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Record Disputes & Logs</span>
        </button>

        <button
          onClick={() => setActiveTab('audits')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'audits' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>System Audit Terminal</span>
        </button>

        <button
          onClick={() => setActiveTab('config')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'config' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
          }`}
        >
          <Settings2 className="w-3.5 h-3.5" />
          <span>Global config</span>
        </button>
      </div>

      {/* RENDER ACTIVE TAB */}
      
      {/* 1. DASHBOARD AI CONTROL */}
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-12">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 shrink-0 animate-pulse" />
                <p className="text-xs font-bold">
                  Cambodia Fleet Analytical Core: AI system parameters are online. You can send promotional campaigns or track target users at any time!
                </p>
              </div>
              <span className="text-[10px] bg-emerald-500/20 font-bold px-2 py-0.5 rounded font-mono">SYSTEM: ACTIVE</span>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
                  <Sparkles className="w-4.5 h-4.5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">AI Admin Campaign orchestrator</h3>
                  <p className="text-xs text-slate-400">
                    Coordinate dynamic, co-branded campaign notifications matching localized climate or automobile patterns.
                  </p>
                </div>
              </div>

              {/* Preset search queries */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-mono">Quick Signals</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handlePresetQuery("Which users are overdue for oil change this month?")}
                    className="px-3 py-1.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-[11px] text-slate-300 rounded-lg transition cursor-pointer"
                  >
                    "Identify Overdue Oil Changes"
                  </button>
                  <button
                    onClick={() => handlePresetQuery("Suggest a promotion strategy for gasoline trucks during monsoon rain")}
                    className="px-3 py-1.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-[11px] text-slate-300 rounded-lg transition cursor-pointer"
                  >
                    "Monsoon Campaign Strategy"
                  </button>
                  <button
                    onClick={() => handlePresetQuery("Settle disputed invoices for Angkor Speed Garages")}
                    className="px-3 py-1.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-[11px] text-slate-300 rounded-lg transition cursor-pointer"
                  >
                    "Settle Garages Disputes"
                  </button>
                </div>
              </div>

              {/* Custom input */}
              <form onSubmit={handleAdminQuery} className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={adminQuery}
                  onChange={(e) => setAdminQuery(e.target.value)}
                  placeholder="Ask about overdue users, campaign promotions, or platform actions..."
                  className="flex-1 bg-slate-850 border border-slate-800 rounded-xl text-xs p-3 focus:outline-none focus:border-emerald-500 text-slate-100 placeholder:text-slate-500"
                />
                <button
                  type="submit"
                  disabled={aiLoading || !adminQuery.trim()}
                  className="px-5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 text-slate-900 rounded-xl font-bold text-xs transition flex items-center justify-center cursor-pointer gap-1 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Ask AI</span>
                </button>
              </form>

              {aiLoading ? (
                <div className="p-8 text-center bg-slate-950/40 rounded-xl border border-slate-800/60 space-y-3">
                  <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-xs text-slate-400 font-mono">AI compiler assembling platform dataset parameters...</p>
                </div>
              ) : aiError ? (
                <div className="p-4 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl text-xs">
                  {aiError}
                </div>
              ) : aiReport ? (
                <div className="bg-slate-950/60 rounded-xl border border-slate-800 p-5 space-y-4">
                  <div className="border-b border-slate-800/60 pb-3">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest font-mono">Analytical Report Summary</span>
                    <p className="text-xs text-slate-300 font-serif leading-relaxed mt-1">
                      {aiReport.summary}
                    </p>
                  </div>

                  <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-xl space-y-3">
                    <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                      <Megaphone className="w-4 h-4" />
                      <span>Recommended Title: {aiReport.campaignName}</span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          Generated Campaign Message
                        </span>
                        <p className="text-xs font-medium text-slate-200">
                          "{aiReport.suggestedMessage}"
                        </p>
                      </div>

                      <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1">
                        <span>Associated partner discount offer:</span>
                        <span className="text-slate-200 font-bold font-serif">{aiReport.partnerOffer}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Actionable items</span>
                    <div className="space-y-1.5">
                      {aiReport.actionableSteps?.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
                          <span className="text-emerald-400 font-mono font-bold shrink-0">{idx + 1}.</span>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-mono">Audience targets: {aiReport.targetCount} vehicles found</span>
                    <button 
                      onClick={() => {
                        triggerAlert("Push Notification dispatch initiated successfully for segment!");
                        // Add an audit log
                        fetch("/api/admin/audit-logs", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            action: "Launched Campaign",
                            details: `Activated co-branded campaign: "${aiReport.campaignName}" for ${aiReport.targetCount} target vehicles in Cambodia.`,
                            target: aiReport.campaignName
                          })
                        }).then(() => fetchAudits());
                      }}
                      className="px-3.5 py-1.5 bg-emerald-500 text-slate-900 border border-emerald-500 text-[10px] font-bold uppercase rounded-lg tracking-wider hover:bg-emerald-600 transition flex items-center gap-1 cursor-pointer"
                    >
                      <Bell className="w-3.5 h-3.5" />
                      <span>Send Dispatch Announcement</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-950/20 border border-slate-800 border-dashed rounded-xl text-slate-500 text-xs">
                  Choose a predefined quick signal analytical query or type variables in the search engine above to try the LLM diagnostics.
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-805 pb-3">
                <Settings2 className="w-4 h-4 text-emerald-400 animate-spin-slow" />
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-mono">
                  Diagnostics Engine Parameters
                </h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Platform-wide parameters that govern automatic dashboard push reminders, calculation models, and smart client timing algorithms.
              </p>

              <div className="space-y-3.5 pt-1">
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-200">Gasoline Engine Oil</span>
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">Gasoline</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Trigger Alert Threshold: <strong className="text-emerald-400">{gasolineIntervalKm} km</strong></p>
                </div>

                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-200">EV Battery Diagnostic</span>
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">EV / Hybrid</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Trigger Interval Timeline: <strong className="text-emerald-400">{evIntervalMonths} months</strong></p>
                </div>

                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-200">Agency Platform Commission</span>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded">Pricing Rules</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Current Deduction Rate: <strong className="text-emerald-400">{commissionRate}%</strong></p>
                </div>
              </div>

              <button 
                onClick={() => { setActiveTab('config'); }}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 font-bold border border-slate-750 text-xs text-slate-200 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>Amend Settings Configurations</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. USER ACCOUNTS MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-805 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-1.5">
                  <Users className="w-5 h-5 text-emerald-400" />
                  <span>National Registrants & Partners Bureau</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Audit profiles, suspend credentials, view vehicles, and dispatch custom announcements.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleDownloadReport("Users")}
                  className="px-3 py-1.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-[11px] font-bold text-slate-350 rounded-xl transition flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3 h-3" />
                  <span>Download CSV</span>
                </button>
              </div>
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 pointer-events-none">
                  <Search className="w-3.5 h-3.5" />
                </span>
                <input
                  type="text"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  placeholder="Search name, phone, email, license..."
                  className="w-full bg-slate-850 border border-slate-800 pl-9 pr-3 py-2 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-emerald-500 placeholder:text-slate-500"
                />
              </div>

              <div>
                <select
                  value={selectedRoleFilter}
                  onChange={(e) => setSelectedRoleFilter(e.target.value)}
                  className="w-full bg-slate-850 border border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="all">Filter Role (All)</option>
                  <option value="Vehicle Owner">Vehicle Owners</option>
                  <option value="Garage Owner">Garage Owners</option>
                  <option value="Petrol Station Partner">Petrol Partners</option>
                  <option value="Spare Part Shop">Spare Part Shops</option>
                  <option value="Freelance Mechanic">Freelance Mechanics</option>
                  <option value="Admin">Administrators</option>
                </select>
              </div>

              <div>
                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="w-full bg-slate-850 border border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="all">Filter Status (All)</option>
                  <option value="Approved">Approved / Verified</option>
                  <option value="Pending">Pending Validation</option>
                  <option value="Suspended">Suspended / Banned</option>
                </select>
              </div>

              <div className="flex items-center justify-end">
                <span className="text-[11px] font-mono text-slate-500">Filtered Result: <strong>{filteredUsers.length}</strong> accounts</span>
              </div>
            </div>

            {/* Active User list & Selection layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
              {/* Left Side: Table of Users */}
              <div className="lg:col-span-7 space-y-2">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">Registrar Logs Table</span>
                
                {usersLoading ? (
                  <div className="p-12 text-center border border-slate-800 rounded-2xl bg-slate-950/20">
                    <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-xs text-slate-400">Retrieving municipal state database...</p>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="p-8 text-center border border-slate-800 border-dashed rounded-2xl bg-slate-950/20 text-slate-500 text-xs italic">
                    No registered accounts matched the search criteria.
                  </div>
                ) : (
                  <div className="border border-slate-800/80 rounded-2xl overflow-hidden bg-slate-950/40 divide-y divide-slate-855 divide-slate-800">
                    {filteredUsers.map((u) => {
                      const isSelected = selectedUser?.id === u.id;
                      return (
                        <div 
                          key={u.id}
                          onClick={() => handleOpenUserDetails(u)}
                          className={`p-4 transition duration-150 cursor-pointer flex items-center justify-between text-xs hover:bg-slate-900/60 ${
                            isSelected ? 'bg-slate-900 border-l-2 border-emerald-500' : ''
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-slate-100 text-[13px]">{u.name}</span>
                              <span className="text-[9px] px-2 py-0.5 font-mono font-semibold bg-slate-800 text-slate-400 rounded">
                                {u.role}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-400 text-[11px] font-mono">
                              <span>{u.location}</span>
                              <span>•</span>
                              <span>{u.phone || u.email}</span>
                            </div>
                            {u.businessName && (
                              <p className="text-[10px] font-semibold text-emerald-400 leading-normal font-sans">
                                Business: {u.businessName}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`text-[9px] font-mono leading-none px-2 py-1 rounded font-bold uppercase ${
                              u.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' :
                              u.status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/15 animate-pulse' :
                              'bg-red-500/10 text-red-500 border border-red-500/10'
                            }`}>
                              {u.status || 'Approved'}
                            </span>
                            <ChevronRight className="w-4 h-4 text-slate-600 shrink-0" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right Side: Detailed Profile & Active Actions Workspace */}
              <div className="lg:col-span-5">
                {selectedUser ? (
                  <div className="border border-slate-800 bg-slate-950/90 rounded-2xl p-5 space-y-5">
                    {/* Detail block header */}
                    <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                      <div>
                        <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded-md">
                          Master Record ID: #{selectedUser.id}
                        </span>
                        <h4 className="text-base font-extrabold text-slate-100 mt-1">{selectedUser.name}</h4>
                        <p className="text-xs text-slate-400">{selectedUser.role} • {selectedUser.location}</p>
                      </div>

                      <button 
                        onClick={() => setSelectedUser(null)}
                        className="p-1 hover:bg-slate-900 rounded-lg text-slate-500 hover:text-slate-350 transition cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* EDIT MASTER PROFILE FORM vs DISPLAY TEXT INFO */}
                    {isEditMode ? (
                      <form onSubmit={handleSaveUserProfile} className="space-y-4">
                        <span className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider block">✍ Amend Profile Metadata</span>
                        
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="text-[10px] uppercase font-bold text-slate-500">Name</label>
                              <input 
                                type="text" 
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 p-2 text-xs rounded-lg text-white"
                                required
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] uppercase font-bold text-slate-500">Phone</label>
                              <input 
                                type="text" 
                                value={editPhone}
                                onChange={(e) => setEditPhone(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 p-2 text-xs rounded-lg text-white"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="text-[10px] uppercase font-bold text-slate-500">Email Address</label>
                              <input 
                                type="email" 
                                value={editEmail}
                                onChange={(e) => setEditEmail(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 p-2 text-xs rounded-lg text-white"
                                required
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] uppercase font-bold text-slate-500">Location</label>
                              <input 
                                type="text" 
                                value={editLocation}
                                onChange={(e) => setEditLocation(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 p-2 text-xs rounded-lg text-white"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="text-[10px] uppercase font-bold text-slate-500">Platform Role</label>
                              <select 
                                value={editRole}
                                onChange={(e) => setEditRole(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 p-2 text-xs rounded-lg text-white"
                              >
                                <option value="Vehicle Owner">Vehicle Owner</option>
                                <option value="Garage Owner">Garage Owner</option>
                                <option value="Petrol Station Partner">Petrol Partner</option>
                                <option value="Spare Part Shop">Spare Part Shop</option>
                                <option value="Freelance Mechanic">Freelance Mechanic</option>
                                <option value="Admin">Administrator</option>
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] uppercase font-bold text-slate-500">Status Verification</label>
                              <select 
                                value={editStatus}
                                onChange={(e) => setEditStatus(e.target.value as any)}
                                className="w-full bg-slate-900 border border-slate-800 p-2 text-xs rounded-lg text-white"
                              >
                                <option value="Approved">Approved</option>
                                <option value="Pending">Pending</option>
                                <option value="Suspended">Suspended</option>
                              </select>
                            </div>
                          </div>

                          {(editRole !== "Vehicle Owner" && editRole !== "Admin") && (
                            <>
                              <div className="grid grid-cols-2 gap-2 p-2 bg-slate-900 rounded-lg">
                                <div className="space-y-1">
                                  <label className="text-[10px] uppercase font-bold text-slate-400">Business Name</label>
                                  <input 
                                    type="text" 
                                    value={editBusinessName}
                                    onChange={(e) => setEditBusinessName(e.target.value)}
                                    placeholder="e.g. TotalEnergies PP"
                                    className="w-full bg-slate-950 border border-slate-800 p-2 text-xs rounded-lg text-white"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] uppercase font-bold text-slate-400">License ID</label>
                                  <input 
                                    type="text" 
                                    value={editLicenseNumber}
                                    onChange={(e) => setEditLicenseNumber(e.target.value)}
                                    placeholder="e.g. Co-9213/2026-KH"
                                    className="w-full bg-slate-950 border border-slate-800 p-2 text-xs rounded-lg text-white"
                                  />
                                </div>
                              </div>

                              <div className="p-2.5 bg-slate-900 border border-slate-850 rounded-lg space-y-2 mt-1">
                                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">🛡 Business Subscription Options</span>
                                <div className="flex gap-4">
                                  <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input 
                                      type="checkbox"
                                      checked={editIsVerified}
                                      onChange={(e) => setEditIsVerified(e.target.checked)}
                                      className="rounded border-slate-800 bg-slate-950 text-emerald-500 focus:ring-0 w-4 h-4 cursor-pointer"
                                    />
                                    <span className="text-xs text-slate-200">Is Verified</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input 
                                      type="checkbox"
                                      checked={editFeaturedListing}
                                      onChange={(e) => setEditFeaturedListing(e.target.checked)}
                                      className="rounded border-slate-800 bg-slate-950 text-indigo-500 focus:ring-0 w-4 h-4 cursor-pointer"
                                    />
                                    <span className="text-xs text-slate-200">Featured Listing</span>
                                  </label>
                                </div>
                              </div>
                            </>
                          )}
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                          <button 
                            type="button"
                            onClick={() => setIsEditMode(false)}
                            className="px-3 py-1.5 bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-lg hover:bg-slate-850 cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button 
                            type="submit"
                            className="px-4 py-1.5 bg-emerald-500 text-slate-950 font-bold text-xs rounded-lg hover:bg-emerald-600 cursor-pointer"
                          >
                            Save Details
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="space-y-4">
                        {/* Display profile parameters */}
                        <div className="space-y-2.5 text-xs">
                          <div className="flex justify-between border-b border-slate-900 pb-1.5">
                            <span className="text-slate-500 font-mono text-[10px] uppercase">Contact Phone:</span>
                            <span className="text-slate-200 font-mono font-semibold">{selectedUser.phone || "No phone linked"}</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-900 pb-1.5">
                            <span className="text-slate-500 font-mono text-[10px] uppercase">Email:</span>
                            <span className="text-slate-200 font-mono font-semibold">{selectedUser.email}</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-900 pb-1.5">
                            <span className="text-slate-500 font-mono text-[10px] uppercase">Telegram Alert Status:</span>
                            <span className="text-sky-400 font-mono font-semibold">
                              {selectedUser.phone ? "✓ Mapped & Connected (@mycar_bot)" : "⚠ Inactive / Pending User Consent"}
                            </span>
                          </div>
                          <div className="flex justify-between border-b border-slate-900 pb-1.5">
                            <span className="text-slate-500 font-mono text-[10px] uppercase">Role Rank:</span>
                            <span className="text-slate-200 font-bold">{selectedUser.role}</span>
                          </div>
                          {selectedUser.businessName && (
                            <div className="p-2 bg-slate-900 border border-slate-850/65 rounded-xl space-y-1.5 mt-1 text-[11px]">
                              <p className="font-bold text-emerald-400 font-sans">Registered Entity Metadata:</p>
                              <p className="text-slate-300">Name: <strong className="text-white">{selectedUser.businessName}</strong></p>
                              {selectedUser.licenseNumber && (
                                <p className="text-slate-300 font-mono">License Reg: <strong className="text-amber-400">{selectedUser.licenseNumber}</strong></p>
                              )}

                              {selectedUser.businessSubscription && (
                                <div className="mt-2 pt-2 border-t border-slate-800 space-y-1 text-[11px]">
                                  <p className="font-bold text-amber-400 font-mono text-[10px] uppercase tracking-wider">Business Subscription:</p>
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">Plan Tier:</span>
                                    <span className="text-slate-200 font-semibold">{selectedUser.businessSubscription.planType}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">Verification Status:</span>
                                    <span className={selectedUser.businessSubscription.isVerified ? "text-emerald-400 font-semibold" : "text-slate-500"}>
                                      {selectedUser.businessSubscription.isVerified ? "✓ Verified Badge" : "✗ Unverified"}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">Featured Listing:</span>
                                    <span className={selectedUser.businessSubscription.featuredListing ? "text-indigo-400 font-semibold" : "text-slate-500"}>
                                      {selectedUser.businessSubscription.featuredListing ? "✓ Enabled" : "✗ Disabled"}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">Staff Limit:</span>
                                    <span className="text-slate-200">{selectedUser.businessSubscription.staffLimit} member(s)</span>
                                  </div>

                                  {selectedUser.role === "Garage Owner" && (selectedUser.businessSubscription as any).diagnosticBays !== undefined && (
                                    <>
                                      <div className="flex justify-between">
                                        <span className="text-slate-400">Diagnostic Bays:</span>
                                        <span className="text-emerald-400 font-mono">{(selectedUser.businessSubscription as any).diagnosticBays} bays</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-slate-400">Equipment Verified:</span>
                                        <span className={(selectedUser.businessSubscription as any).hasEquipmentVerification ? "text-emerald-400 font-semibold" : "text-slate-500"}>
                                          {(selectedUser.businessSubscription as any).hasEquipmentVerification ? "✓ Certified Active" : "✗ Pending Check"}
                                        </span>
                                      </div>
                                    </>
                                  )}

                                  {selectedUser.role === "Spare Part Shop" && (selectedUser.businessSubscription as any).partsCountLimit !== undefined && (
                                    <>
                                      <div className="flex justify-between">
                                        <span className="text-slate-400">Parts Stock Limit:</span>
                                        <span className="text-indigo-400 font-mono">{(selectedUser.businessSubscription as any).partsCountLimit} items</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-slate-400">eCommerce Platform:</span>
                                        <span className={(selectedUser.businessSubscription as any).eCommerceEnabled ? "text-indigo-400 font-semibold" : "text-slate-500"}>
                                          {(selectedUser.businessSubscription as any).eCommerceEnabled ? "✓ Active Store" : "✗ Catalog Only"}
                                        </span>
                                      </div>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Associated Vehicles Module Accordion */}
                        <div className="pt-2 border-t border-slate-900 space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Vehicles Registered</span>
                            <span className="text-[10px] bg-slate-800 text-slate-350 px-2 py-0.5 rounded font-mono">
                              Count: {vehicles.length} (Sandbox database)
                            </span>
                          </div>

                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {vehicles.map((v) => (
                              <div key={v.id} className="p-2 bg-slate-900/60 rounded-xl border border-slate-850 text-xs flex justify-between items-center">
                                <div>
                                  <h5 className="font-bold text-slate-200">{v.brand} {v.model}</h5>
                                  <p className="text-[10px] text-slate-400 font-mono">Plate: {v.plateNumber || "N/A"} • Code: {v.id}</p>
                                </div>
                                <span className="text-[10px] text-emerald-400 font-mono">{v.mileage.toLocaleString()} km</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* DIRECT MESSAGING CHANNELS PANEL */}
                        <div className="pt-3 border-t border-slate-900 space-y-2">
                          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">📢 Direct Message Dispatch</span>
                          <div className="space-y-2">
                            <textarea
                              value={customNotifyMessage}
                              onChange={(e) => setCustomNotifyMessage(e.target.value)}
                              placeholder={`Send direct alert to ${selectedUser.name}...`}
                              className="w-full h-16 bg-slate-900 border border-slate-800 p-2 text-xs rounded-xl text-white focus:outline-none focus:border-emerald-500 placeholder:text-slate-600"
                            />
                            
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                                <span className="text-slate-500">Channel:</span>
                                <select 
                                  value={customNotifyChannel}
                                  onChange={(e: any) => setCustomNotifyChannel(e.target.value)}
                                  className="bg-slate-900 border border-slate-800 px-1 py-0.5 rounded text-slate-300 focus:outline-none"
                                >
                                  <option value="In-App">In-App Notification</option>
                                  <option value="Telegram">Telegram Channel Link</option>
                                  <option value="Email">Secure Mail Server</option>
                                </select>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleSendCustomNotification(selectedUser.id)}
                                disabled={!customNotifyMessage.trim()}
                                className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 text-slate-950 font-bold text-[10px] uppercase rounded-lg transition"
                              >
                                {notifSuccessIndicator ? "Alert Sent! ✓" : "Send Dispatch"}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* SECURITY & DELEGATIONS OPTIONS PANEL */}
                        <div className="pt-3 border-t border-slate-900 space-y-2">
                          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">🔐 Credentials & Security</span>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => handleResetPassword(selectedUser.id)}
                              className="py-1.5 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 text-[11px] font-bold rounded-lg transition flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Key className="w-3 h-3 text-emerald-400" />
                              <span>Reset Password Password</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                handleLockRecord("v1"); // Locks the standard service record of v1 as sample dispute action
                              }}
                              className="py-1.5 bg-red-950/15 border border-red-900/30 text-red-400 hover:bg-red-900 hover:text-white text-[11px] font-bold rounded-lg transition flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <ShieldAlert className="w-3 h-3 text-red-500" />
                              <span>Enforce Lockdown</span>
                            </button>
                          </div>

                          {credentialTicket && (
                            <div className="p-2.5 bg-emerald-950/30 border border-emerald-900/40 rounded-xl space-y-1">
                              <p className="text-[10px] font-mono font-bold text-emerald-400 uppercase">Master credential key created:</p>
                              <p className="text-xs font-mono font-bold text-slate-100 select-all">{credentialTicket}</p>
                              <p className="text-[9px] text-slate-400 leading-normal">Transmit ticket ID directly to subscriber to bypass ABA verification steps.</p>
                            </div>
                          )}
                        </div>

                        {/* MASTER ACTIONS FOOTER PANEL */}
                        <div className="pt-3 border-t border-slate-900 flex items-center justify-between">
                          <span className="text-[10.5px] font-mono text-slate-500">ADMIN CONTROL MATRIX:</span>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => setIsEditMode(true)}
                              className="px-3 py-1 bg-slate-900 border border-slate-800 text-slate-200 hover:text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                            >
                              <Edit className="w-3 h-3" />
                              <span>Edit Master Profile</span>
                            </button>

                            {selectedUser.role !== 'Admin' && (
                              <button
                                onClick={() => handleDeleteUser(selectedUser.id)}
                                className="px-3 py-1 bg-rose-950/50 border border-rose-900/30 text-rose-400 hover:bg-rose-600 hover:text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Ban User Account</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="border border-slate-800 border-dashed rounded-2xl bg-slate-950/20 p-8 text-center text-slate-500 text-xs italic space-y-2">
                    <Users className="w-8 h-8 text-slate-700 mx-auto" />
                    <p>Select any user profile row on the municipal database logs list to trigger deep control modifications and actions.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. VEHICLE FLEET REGISTRY */}
      {activeTab === 'vehicles' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-805 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-1.5 font-sans">
                  <Gauge className="w-5 h-5 text-emerald-400" />
                  <span>National Fleet Automotive Registry</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Track motor propulsion parameters, calculate AI Health scores, and manage registered ownership title adjustments.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleDownloadReport("Vehicles")}
                  className="px-3 py-1.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-[11px] font-bold text-slate-300 rounded-xl transition flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3 h-3" />
                  <span>Export Fleet PDF/CSV</span>
                </button>
              </div>
            </div>

            {/* ODOMETER DISPATCH AND TITLE MANAGEMENT BLOCK */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Registered Vehicles Feed */}
              <div className="lg:col-span-7 space-y-3">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">Automotive Registry Cards</span>
                
                {vehiclesLoading ? (
                  <div className="p-8 text-center border border-slate-800 rounded-2xl">
                    <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {vehicles.map((v) => {
                      // Generate dynamic visual health score based on km
                      const healthScore = Math.max(50, 100 - Math.floor(v.mileage / 4000));
                      return (
                        <div key={v.id} className="p-4 bg-slate-950/60 rounded-2xl border border-slate-850 flex flex-col justify-between space-y-3">
                          <div>
                            <div className="flex items-center justify-between">
                              <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded leading-none uppercase ${
                                v.fuelType === 'EV' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' :
                                v.fuelType === 'Hybrid' ? 'bg-teal-500/10 text-teal-400' :
                                'bg-slate-800 text-slate-450 text-slate-300'
                              }`}>
                                {v.fuelType}
                              </span>
                              
                              <div className="flex items-center gap-1 font-mono text-[10.5px]">
                                <span className="text-slate-500">Health Score:</span>
                                <span className={`font-bold ${healthScore > 85 ? 'text-emerald-400' : healthScore > 70 ? 'text-amber-400' : 'text-rose-400'}`}>
                                  {healthScore}/100
                                </span>
                              </div>
                            </div>

                            <h4 className="text-sm font-bold text-white mt-2 leading-tight">
                              {v.brand} {v.model}
                            </h4>
                            <p className="text-[11px] text-slate-400 mt-1 font-sans">
                              Odometer: <strong className="text-slate-200">{v.mileage.toLocaleString()} km</strong>
                            </p>
                            <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                              ID Ref: {v.id} • Plate: {v.plateNumber || "PP-2A.8821"}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-slate-900 flex justify-between items-center text-[11px] text-slate-400">
                            <span>Last Service:</span>
                            <span className="font-mono text-slate-300">{v.lastServiceDate || "2026-03-01"}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right Column: Ownership Transfer workspace */}
              <div className="lg:col-span-5">
                <div className="border border-slate-800 bg-slate-950/40 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-1.5 text-amber-400 border-b border-slate-900 pb-2.5">
                    <Activity className="w-4 h-4 text-amber-500" />
                    <h4 className="text-xs font-bold uppercase tracking-widest font-mono">
                      Ownership Assignment & Transfer Workspace
                    </h4>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    This administrative operation transfers legal asset registration credentials from one user's dashboard to another. Associated service logs are mapped dynamically on successful validation.
                  </p>

                  <form onSubmit={handleExecuteTransfer} className="space-y-4.5 pt-1">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-500">1. Select Target Vehicle Card</label>
                      <select
                        value={transferVehicleId}
                        onChange={(e) => setTransferVehicleId(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 p-2.5 text-xs rounded-xl text-white focus:outline-none"
                        required
                      >
                        <option value="">-- Choose Vehicle --</option>
                        {vehicles.map(v => (
                          <option key={v.id} value={v.id}>
                            {v.brand} {v.model} ({v.plateNumber || v.id})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-500">2. Determine Target Assignee User</label>
                      <select
                        value={transferToUserId}
                        onChange={(e) => setTransferToUserId(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 p-2.5 text-xs rounded-xl text-white focus:outline-none"
                        required
                      >
                        <option value="">-- Select Recipient User --</option>
                        {users.map(u => (
                          <option key={u.id} value={u.id}>
                            {u.name} ({u.role} - {u.location})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-500">3. Legal Transfer Reason / Ledger Note</label>
                      <input
                        type="text"
                        value={transferReason}
                        onChange={(e) => setTransferReason(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 p-2.5 text-xs rounded-xl text-white focus:outline-none placeholder:text-slate-600"
                        placeholder="Normal sale transaction transfer"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={!transferVehicleId || !transferToUserId}
                      className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 font-bold disabled:bg-slate-800 text-xs text-slate-950 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Authorize Legal Title Transfer</span>
                    </button>
                  </form>

                  {transferStatusMsg && (
                    <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <p className="leading-normal font-mono text-[10.5px]">{transferStatusMsg}</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* 4. RBAC MATRIX CONFIGURATION */}
      {activeTab === 'rbac' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
            <div className="border-b border-slate-850/65 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-1.5">
                <ShieldAlert className="w-5 h-5 text-emerald-400" />
                <span>Role-Based Access Control configuration (RBAC)</span>
              </h3>
              <p className="text-xs text-slate-400">
                Grant, restrict, and manage permissions assigned to different administrative groups on Cambodia servers.
              </p>
            </div>

            <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/40">
              <table className="w-full text-xs text-slate-300">
                <thead>
                  <tr className="bg-slate-900 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
                    <th className="p-4 text-left">Administrative Group</th>
                    <th className="p-4 text-center">Manage Users</th>
                    <th className="p-4 text-center">Moderate Vehicles</th>
                    <th className="p-4 text-center">Arbitrate Disputes</th>
                    <th className="p-4 text-center">Edit Config Settings</th>
                    <th className="p-4 text-center">Write Announcements</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 divide-slate-800">
                  {Object.keys(rbacPermissions).map((role) => {
                    const currentPerms = rbacPermissions[role];
                    return (
                      <tr key={role} className="hover:bg-slate-900/40">
                        <td className="p-4 font-bold text-white text-sm">{role}</td>
                        
                        <td className="p-4 text-center">
                          <input 
                            type="checkbox" 
                            checked={currentPerms.includes('users_w')} 
                            onChange={() => togglePermission(role, 'users_w')}
                            className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-800 focus:ring-offset-slate-950 accent-emerald-500"
                          />
                        </td>

                        <td className="p-4 text-center">
                          <input 
                            type="checkbox" 
                            checked={currentPerms.includes('vehicles_w')} 
                            onChange={() => togglePermission(role, 'vehicles_w')}
                            className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-800 focus:ring-offset-slate-950 accent-emerald-500"
                          />
                        </td>

                        <td className="p-4 text-center">
                          <input 
                            type="checkbox" 
                            checked={currentPerms.includes('disputes_w')} 
                            onChange={() => togglePermission(role, 'disputes_w')}
                            className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-800 focus:ring-offset-slate-950 accent-emerald-500"
                          />
                        </td>

                        <td className="p-4 text-center">
                          <input 
                            type="checkbox" 
                            checked={currentPerms.includes('config_w')} 
                            onChange={() => togglePermission(role, 'config_w')}
                            className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-800 focus:ring-offset-slate-950 accent-emerald-500"
                          />
                        </td>

                        <td className="p-4 text-center">
                          <input 
                            type="checkbox" 
                            checked={currentPerms.includes('notifications_w')} 
                            onChange={() => togglePermission(role, 'notifications_w')}
                            className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-800 focus:ring-offset-slate-950 accent-emerald-500"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <p className="text-[11px] text-slate-500 leading-normal bg-slate-950/60 p-3 rounded-xl border border-slate-805">
              ⚠ <strong>Platform Notice:</strong> Modifications performed to the matrices above take effect across all municipal container environments immediately. Ensure Support staff permissions match company audit directives.
            </p>
          </div>
        </div>
      )}

      {/* 5. DISPUTES & SCAN EVENT AUDITS */}
      {activeTab === 'disputes' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-red-500/10 text-red-500 rounded-lg border border-red-500/20">
                <ShieldAlert className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">QR Scan Streams & Service Record Disputes</h3>
                <p className="text-xs text-slate-400">
                  Audit participating shop scanning history and settle disputes raised by car owners.
                </p>
              </div>
            </div>

            <button
              onClick={fetchAudits}
              disabled={auditLoading}
              className="px-3.5 py-2 bg-slate-950 border border-slate-800 text-[11px] text-slate-300 font-bold hover:text-white rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${auditLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Audits</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Participating scan event streams */}
            <div className="lg:col-span-5 space-y-4">
              <span className="text-[10px] font-mono font-bold text-slate-505 text-slate-400 uppercase tracking-widest block">Scan Streams Log</span>
              
              {scanLogs.length === 0 ? (
                <p className="p-4 bg-slate-950/40 rounded-xl border border-slate-800 text-xs text-slate-550 italic text-slate-400">No scans logged.</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {scanLogs.map((log: any, idx) => (
                    <div key={idx} className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs space-y-1">
                      <div className="flex justify-between items-center text-slate-500">
                        <span className="font-mono text-sky-400 text-[9px] uppercase">{log.targetType || "Identity scan"}</span>
                        <span className="text-[10px] font-mono">{new Date(log.scannedAt).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-slate-200">Shop: <strong className="text-white">{log.scannedByGarageName}</strong></p>
                      <p className="text-slate-400 text-[11px]">Scanned Token: <strong className="text-amber-400 font-mono">{log.token}</strong></p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Service Record Lock & Dispute arbitrator */}
            <div className="lg:col-span-7 space-y-4">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Inbound Disputes Settlement</span>
              
              {allServiceRecords.length === 0 ? (
                <p className="p-4 bg-slate-950/40 rounded-xl border border-slate-800 text-xs text-slate-500 italic">No in-bound service invoices found in memory bank.</p>
              ) : (
                <div className="space-y-3 max-h-[460px] overflow-y-auto">
                  {allServiceRecords.map((rec: any) => (
                    <div key={rec.id} className="p-4 bg-slate-950 rounded-2xl border border-slate-850 space-y-3 text-xs">
                      <div className="flex justify-between items-start border-b border-slate-900 pb-2">
                        <div>
                          <h4 className="font-bold text-slate-200 text-sm">{rec.serviceCategory} (${rec.cost} USD)</h4>
                          <p className="text-[10.5px] text-slate-405 mt-0.5 text-slate-400">
                            Vehicle owner: {rec.ownerName || "Sok Dara"} @ Provider: {rec.providerName}
                          </p>
                        </div>

                        <div>
                          {rec.approvalStatus === 'pending_owner_approval' && (
                            <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded font-mono font-bold text-[9px] uppercase">Pending Owner</span>
                          )}
                          {rec.approvalStatus === 'approved' && (
                            <span className="px-2 py-0.5 bg-emerald-500/15 text-emerald-400 border border-emerald-505/20 rounded font-mono font-bold text-[9px] uppercase">Approved</span>
                          )}
                          {rec.approvalStatus === 'disputed' && (
                            <span className="px-2 py-0.5 bg-rose-500/15 text-rose-450 text-rose-400 border border-rose-500/30 rounded font-mono font-bold text-[9px] uppercase animate-pulse">Disputed</span>
                          )}
                          {rec.approvalStatus === 'admin_locked' && (
                            <span className="px-2 py-0.5 bg-slate-800 text-slate-400 rounded font-mono font-bold text-[9px] uppercase">LOCKED / FROZEN</span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1 text-slate-300">
                        <p><strong className="text-slate-500 font-mono text-[9px] uppercase">Products mapped:</strong> {rec.productUsed || "N/A"}</p>
                        <p><strong className="text-slate-500 font-mono text-[9px] uppercase">Notes:</strong> "{rec.note}"</p>
                        
                        {rec.disputeReason && (
                          <div className="p-2.5 bg-rose-950/20 border border-rose-900/30 text-rose-400 rounded-lg mt-1 italic font-mono text-[11px]">
                            Dispute Reason: "{rec.disputeReason}"
                          </div>
                        )}
                      </div>

                      {rec.approvalStatus !== 'admin_locked' && (
                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            onClick={() => handleLockRecord(rec.id)}
                            className="px-3 py-1.5 bg-red-650/10 border border-transparent hover:border-red-500/20 text-red-400 hover:bg-red-950 hover:text-white font-bold rounded-lg transition text-[10.5px] cursor-pointer flex items-center gap-1"
                          >
                            <Lock className="w-3 h-3" />
                            <span>Freeze & Settle Dispute</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* 6. SYSTEM AUDIT TERMINAL */}
      {activeTab === 'audits' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-805 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-1.5">
                <Terminal className="w-5 h-5 text-emerald-400" />
                <span>Super Admin Audits Stream</span>
              </h3>
              <p className="text-xs text-slate-400">Live operational events stream recorded by platform supervisors.</p>
            </div>

            <button
              onClick={fetchAudits}
              className="px-3.5 py-1.5 bg-slate-950 border border-slate-800 text-[11px] text-slate-350 text-slate-300 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reload Terminal Stream</span>
            </button>
          </div>

          <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 font-mono text-xs text-emerald-350 text-emerald-400 space-y-3.5 max-h-[500px] overflow-y-auto">
            {auditLogs.length === 0 ? (
              <p className="text-slate-500 italic p-2">Loading logs console stream...</p>
            ) : (
              auditLogs.map((log) => (
                <div key={log.id} className="p-3 bg-slate-900/40 rounded-xl border border-slate-900 space-y-2">
                  <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center text-[10.5px] text-slate-500 border-b border-slate-950 pb-1.5 gap-1 md:gap-0">
                    <span className="font-bold text-emerald-500 uppercase">⚡ {log.action}</span>
                    <span>IP: {log.ipAddress} | {new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                  
                  <p className="text-slate-200 mt-1 leading-relaxed text-[11px]">
                    {log.details}
                  </p>
                  
                  <div className="flex justify-between items-center text-[10px] text-slate-500">
                    <span>Target: <strong className="text-slate-350 text-emerald-300">{log.target}</strong></span>
                    <span>Operator: {log.adminName}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 7. GLOBAL SETTINGS CONFIGURATION */}
      {activeTab === 'config' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-5">
          <div className="border-b border-slate-850 pb-3">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-1.5">
              <Settings2 className="w-5 h-5 text-emerald-400" />
              <span>Platform Rules and Commission Parameters</span>
            </h3>
            <p className="text-xs text-slate-400">Configure default values dynamically governing Cambodia client dashboards.</p>
          </div>

          <form onSubmit={(e) => {
            e.preventDefault();
            triggerAlert("Global configuration parameters modified successfully!");
            // Audit it
            fetch("/api/admin/audit-logs", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "Config Parameters Updated",
                details: `Modified oil parameter bounds to ${gasolineIntervalKm}km, EV interval limit to ${evIntervalMonths}m, and revenue commission to ${commissionRate}%`,
                target: "Configuration Console Settings"
              })
            }).then(() => fetchAudits());
          }} className="space-y-6 max-w-2xl">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Default Gasoline Oil change reminder limit (km)</label>
                <input 
                  type="number" 
                  value={gasolineIntervalKm}
                  onChange={(e) => setGasolineIntervalKm(Number(e.target.value))}
                  className="w-full bg-slate-850 border border-slate-800 p-3 rounded-xl text-xs text-white"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Default EV Battery audit frequency (months)</label>
                <input 
                  type="number" 
                  value={evIntervalMonths}
                  onChange={(e) => setEvIntervalMonths(Number(e.target.value))}
                  className="w-full bg-slate-850 border border-slate-800 p-3 rounded-xl text-xs text-white"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Agency Platform Broker Commission (%)</label>
                <input 
                  type="number"
                  step="0.1" 
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(Number(e.target.value))}
                  className="w-full bg-slate-850 border border-slate-800 p-3 rounded-xl text-xs text-white"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Broker Support Service Phone Hub</label>
                <input 
                  type="text" 
                  value="+855 23 888 888" 
                  disabled
                  className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 font-bold text-slate-950 text-xs rounded-xl transition cursor-pointer"
            >
              Commit Global Parameters Settings
            </button>
          </form>

          {/* Service Templates Section */}
          <div className="pt-6 border-t border-slate-800 space-y-5">
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-emerald-450 text-emerald-450 text-emerald-400" />
                <span>Custom Maintenance Service Templates Workspace</span>
              </h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Create and manage custom standard maintenance procedures which auto-populate checklists, parts and diagnostic estimates inside the Quick Service Log dropdowns system-wide.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Side: Current Templates List */}
              <div className="lg:col-span-6 space-y-3">
                <h5 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-mono">
                  Active Templates ({serviceTemplatesList.length})
                </h5>
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {serviceTemplatesList.map((t) => (
                    <div key={t.id} className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 space-y-3 relative">
                      <button
                        onClick={async () => {
                          if (confirm(`Delete maintenance template "${t.name}"?`)) {
                            try {
                              const res = await fetch(`/api/service-templates/${t.id}`, { method: "DELETE" });
                              if (res.ok) {
                                triggerAlert(`Template "${t.name}" removed successfully!`);
                                setServiceTemplatesList(prev => prev.filter(item => item.id !== t.id));
                                // Log audit
                                fetch("/api/admin/audit-logs", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({
                                    action: "Maintenance Template Deleted",
                                    details: `Deleted template "${t.name}" (ID: ${t.id})`,
                                    target: "Service Template Configuration"
                                  })
                                }).then(() => fetchAudits());
                              }
                            } catch (err) {
                              console.error(err);
                            }
                          }
                        }}
                        className="absolute top-4 right-4 p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 hover:text-red-400 transition cursor-pointer"
                        title="Delete Template"
                      >
                        <Trash2 className="w-3.5 h-3.5 cursor-pointer" />
                      </button>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-black text-white">{t.name}</span>
                          <span className="text-[9px] bg-slate-800 text-slate-300 px-2 rounded-full border border-white/5 font-semibold">
                            {t.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed italic pr-8">
                          &quot;{t.description}&quot;
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px] bg-white/3 p-2 rounded-xl text-slate-450 text-slate-400">
                        <div>Diag Fee: <span className="text-emerald-400 font-mono font-bold">${t.diagnosticFee}</span></div>
                        <div>Labor Cost: <span className="text-emerald-400 font-mono font-bold">${t.laborCost}</span></div>
                      </div>

                      {t.parts && t.parts.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[9px] uppercase font-bold text-slate-500 block">Required Parts ({t.parts.length}):</span>
                          <div className="space-y-1">
                            {t.parts.map((p: any, idx: number) => (
                              <div key={idx} className="flex justify-between items-center text-[10px] bg-black/30 p-1.5 rounded-lg border border-white/5">
                                <span className="text-slate-350 font-medium">{p.name} <span className="text-slate-500">({p.brand})</span></span>
                                <span className="text-slate-400 font-mono">Qty: {p.qty} x ${p.price}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {t.targetEngineTypes && t.targetEngineTypes.length > 0 && (
                        <div className="flex flex-wrap gap-1 items-center pt-1">
                          <span className="text-[9px] uppercase font-bold text-slate-500 mr-2">Applies to:</span>
                          {t.targetEngineTypes.map((eng: string) => (
                            <span key={eng} className="text-[9px] bg-emerald-500/15 text-emerald-450 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/25 font-bold">
                              {eng}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Side: Create New Template Form */}
              <div className="lg:col-span-6 bg-slate-950 border border-slate-800 rounded-3xl p-5 space-y-4">
                <h5 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-mono">
                  🛠️ Design Custom Template
                </h5>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-405 text-slate-400 uppercase">Template Name</label>
                    <input
                      type="text"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      placeholder="e.g. EV Battery Audit, CVT Clutch Fluid..."
                      className="w-full bg-slate-900 border border-slate-850 p-2 text-xs rounded-xl text-white outline-none focus:border-emerald-500/40"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Service Category</label>
                      <select
                        value={templateCategory}
                        onChange={(e) => setTemplateCategory(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-850 p-2 text-xs rounded-xl text-slate-200 outline-none"
                      >
                        <option value="Engine Oil & Fluids">Engine Oil & Fluids</option>
                        <option value="EV / Hybrid Battery System">EV / Hybrid Battery System</option>
                        <option value="Diesel Emission System">Diesel Emission System</option>
                        <option value="LPG Regulation & Safety">LPG Regulation & Safety</option>
                        <option value="Brakes & Suspension">Brakes & Suspension</option>
                        <option value="Electrical System & Spark">Electrical System & Spark</option>
                        <option value="Other Powertrain Tuning">Other Powertrain Tuning</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Target Powertrains</label>
                      <select
                        multiple
                        value={templateTargets}
                        onChange={(e) => {
                          const options = Array.from(e.target.selectedOptions).map((opt: any) => opt.value);
                          setTemplateTargets(options);
                        }}
                        className="w-full h-14 bg-slate-900 border border-slate-850 p-1 text-[11px] rounded-xl text-white focus:outline-none"
                        title="Hold Ctrl (or Cmd) to select multiple target powertrains"
                      >
                        <option value="Petrol / Gasoline">1. Petrol / Gasoline</option>
                        <option value="Diesel">2. Diesel</option>
                        <option value="Hybrid">3. Hybrid (HEV)</option>
                        <option value="Plug-in Hybrid / PHEV">4. Plug-in Hybrid / PHEV</option>
                        <option value="EV / Fully Electric Vehicle">5. EV / Fully Electric Vehicle</option>
                        <option value="LPG / CNG Gas Vehicle">6. LPG / CNG Gas Vehicle</option>
                        <option value="Petrol Motorcycle">7. Petrol Motorcycle</option>
                        <option value="Electric Motorcycle / E-Bike">8. Electric Motorcycle / E-Bike</option>
                        <option value="Other">9. Other Special Powertrain</option>
                      </select>
                      <span className="text-[8.5px] text-slate-500 block mt-0.5">Hold Ctrl/Cmd to select multiple.</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Service Description / Complaint Text</label>
                    <textarea
                      value={templateDescription}
                      onChange={(e) => setTemplateDescription(e.target.value)}
                      placeholder="e.g. Conduct certified computer diagnostics, check insulation resistance, adjust safety valves..."
                      className="w-full h-14 bg-slate-900 border border-slate-850 p-2 text-xs rounded-xl text-white resize-none outline-none focus:border-emerald-500/40"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Diag Fee ($)</label>
                      <input
                        type="number"
                        value={templateDiagFee}
                        onChange={(e) => setTemplateDiagFee(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-850 p-2 text-xs rounded-xl text-white font-mono outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Labor Cost ($)</label>
                      <input
                        type="number"
                        value={templateLaborCost}
                        onChange={(e) => setTemplateLaborCost(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-850 p-2 text-xs rounded-xl text-white font-mono outline-none"
                      />
                    </div>
                  </div>

                  {/* Dynamic Parts Generator */}
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Parts Inventory Allocation ({templateParts.length})</span>
                      <button
                        type="button"
                        onClick={() => {
                          setTemplateParts([...templateParts, { name: "", brand: "", qty: 1, price: 10 }]);
                        }}
                        className="px-2 py-1 bg-white/5 hover:bg-white/10 text-slate-300 text-[9px] uppercase font-bold rounded-lg border border-white/5 flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3 text-emerald-400" />
                        <span>Add Part Row</span>
                      </button>
                    </div>

                    <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                      {templateParts.map((part, index) => (
                        <div key={index} className="grid grid-cols-12 gap-1.5 items-center bg-white/3 p-2 rounded-xl border border-white/5">
                          <div className="col-span-4">
                            <input
                              type="text"
                              value={part.name}
                              onChange={(e) => {
                                const copy = [...templateParts];
                                copy[index].name = e.target.value;
                                setTemplateParts(copy);
                              }}
                              placeholder="Part Name"
                              className="w-full bg-slate-900 border border-slate-850 p-1 rounded-lg text-[11px] text-white"
                            />
                          </div>
                          <div className="col-span-3">
                            <input
                              type="text"
                              value={part.brand}
                              onChange={(e) => {
                                const copy = [...templateParts];
                                copy[index].brand = e.target.value;
                                setTemplateParts(copy);
                              }}
                              placeholder="Brand"
                              className="w-full bg-slate-900 border border-slate-850 p-1 rounded-lg text-[11px] text-white"
                            />
                          </div>
                          <div className="col-span-2">
                            <input
                              type="number"
                              value={part.qty}
                              onChange={(e) => {
                                const copy = [...templateParts];
                                copy[index].qty = Number(e.target.value);
                                setTemplateParts(copy);
                              }}
                              placeholder="Qty"
                              className="w-full bg-slate-900 border border-slate-850 p-1 rounded-lg text-[11px] text-white font-mono"
                            />
                          </div>
                          <div className="col-span-2">
                            <input
                              type="number"
                              value={part.price}
                              onChange={(e) => {
                                const copy = [...templateParts];
                                copy[index].price = Number(e.target.value);
                                setTemplateParts(copy);
                              }}
                              placeholder="$Price"
                              className="w-full bg-slate-900 border border-slate-850 p-1 rounded-lg text-[11px] text-white font-mono"
                            />
                          </div>
                          <div className="col-span-1 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                setTemplateParts(templateParts.filter((_, idx) => idx !== index));
                              }}
                              className="p-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 transition cursor-pointer"
                              title="Delete Part Row"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={async () => {
                      if (!templateName) {
                        alert("Please specify a valid template name!");
                        return;
                      }
                      const payload = {
                        name: templateName,
                        category: templateCategory,
                        description: templateDescription,
                        diagnosticFee: Number(templateDiagFee) || 0,
                        laborCost: Number(templateLaborCost) || 0,
                        parts: templateParts.filter(p => p.name.trim() !== ""),
                        targetEngineTypes: templateTargets
                      };
                      try {
                        const res = await fetch("/api/service-templates", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify(payload)
                        });
                        if (res.ok) {
                          const freshTemplate = await res.json();
                          triggerAlert(`Custom Template "${templateName}" created and deployed successfully!`);
                          setServiceTemplatesList(prev => [...prev, freshTemplate]);
                          
                          // Audit
                          fetch("/api/admin/audit-logs", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              action: "Maintenance Template Created",
                              details: `Created new service template "${templateName}" (${templateCategory}) targeting powertrains [${templateTargets.join(', ')}]`,
                              target: "Service Template Configuration"
                            })
                          }).then(() => fetchAudits());

                          // Clear fields
                          setTemplateName("");
                          setTemplateDescription("");
                          setTemplateDiagFee("15");
                          setTemplateLaborCost("25");
                          setTemplateParts([{ name: "Synthetic Motor Air-filter Element", brand: "OEM Standard", qty: 1, price: 15 }]);
                        }
                      } catch (err) {
                        console.error("Failed to create template:", err);
                      }
                    }}
                    className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 font-extrabold text-slate-950 text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/10 transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-slate-950" />
                    <span>Create & Publish Custom Template</span>
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* SYSTEM OUTBOUND TELEGRAM ABUSE & SPAM CONSOLE */}
          <div className="pt-6 border-t border-slate-800 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-cyan-400 animate-pulse" />
                  <span>Notification Abuse Monitoring & Suspension Console</span>
                </h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  Enforce strict anti-spam mandates. Review customer complaint stats, blacklists, and suspend uncompliant garages dynamically.
                </p>
              </div>

              <button
                type="button"
                onClick={fetchSuspensionStatus}
                disabled={suspensionLoading}
                className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-[10px] uppercase font-bold text-slate-300 rounded-lg flex items-center gap-1 cursor-pointer transition disabled:opacity-40"
              >
                <RefreshCw className="w-3 h-3 hover:translate-y-px" />
                <span>Sync Abuse Stream</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-850 space-y-1 text-center">
                <span className="text-[9px] uppercase tracking-wider text-slate-500 block">Active Outbound Senders</span>
                <strong className="text-sm font-bold text-slate-100">{suspensionData.length || 2} Garages</strong>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-850 space-y-1 text-center">
                <span className="text-[9px] uppercase tracking-wider text-slate-500 block">Total Mute blocks</span>
                <strong className="text-sm font-bold text-amber-500">
                  {suspensionData.reduce((acc, s) => acc + s.blockCount, 0) || 1} Blocks
                </strong>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-850 space-y-1 text-center">
                <span className="text-[9px] uppercase tracking-wider text-slate-500 block">Spam Complain Rate</span>
                <strong className="text-sm font-bold text-rose-500">
                  {abuseReports.length || 1} Reports
                </strong>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-850 space-y-1 text-center">
                <span className="text-[9px] uppercase tracking-wider text-slate-500 block">Suspended Channels</span>
                <strong className="text-sm font-bold text-red-400 animate-pulse">
                  {suspensionData.filter(s => s.suspended).length || 1} Banned
                </strong>
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-widest font-mono">
                Operator Controls
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Outbound Sender Registry */}
                <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl space-y-3">
                  <h5 className="text-xs font-bold text-slate-200">Sender Partner Access Control</h5>
                  <div className="space-y-2.5 max-h-[300px] overflow-y-auto">
                    {suspensionData.length === 0 ? (
                      <div className="text-slate-500 italic text-[11px] p-2">Gathering active shops stream...</div>
                    ) : (
                      suspensionData.map((s) => (
                        <div key={s.id} className="p-3 bg-slate-900/40 rounded-xl border border-slate-900 flex justify-between items-center gap-2">
                          <div className="space-y-1">
                            <strong className="text-xs text-slate-100 block">{s.name}</strong>
                            <div className="flex gap-2 text-[9px] text-slate-450 text-slate-500">
                              <span>Mutes: <strong className="text-amber-500">{s.blockCount}</strong></span>
                              <span>Spam complaints: <strong className="text-rose-500">{s.spamReportCount}</strong></span>
                            </div>
                          </div>

                          <div className="text-right space-y-1 shrink-0">
                            {s.suspended ? (
                              <span className="text-[8px] bg-red-500/15 text-red-400 px-1.5 py-0.5 rounded font-mono font-bold uppercase block text-center border border-red-500/25">
                                Suspended 🚫
                              </span>
                            ) : (
                              <span className="text-[8px] bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded font-mono font-bold uppercase block text-center border border-emerald-500/25">
                                Active ❇️
                              </span>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                const reason = prompt(`Specify suspension/activation reason for ${s.name}:`);
                                if (reason !== null) {
                                  handleToggleSuspension(s.id, reason || "Super Admin policy audit update");
                                }
                              }}
                              className={`px-2 py-1 select-none cursor-pointer rounded text-[9px] uppercase font-bold text-slate-950 tracking-wider block transition ${
                                s.suspended 
                                  ? "bg-cyan-500 hover:bg-cyan-400" 
                                  : "bg-red-500 hover:bg-rose-500"
                              }`}
                            >
                              {s.suspended ? "Unsuspend Shop" : "Suspend Shop"}
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Abuse Reports ledger feed */}
                <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl space-y-3">
                  <h5 className="text-xs font-bold text-rose-450 text-rose-400">Customer Abuse Reporting Stream</h5>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {abuseReports.length === 0 ? (
                      <div className="text-slate-500 italic text-[11px] p-2">Zero spam claims reported. Clean network.</div>
                    ) : (
                      abuseReports.map((log: any) => (
                        <div key={log.id} className="p-2.5 bg-rose-500/5 rounded-xl border border-rose-500/15 space-y-1">
                          <div className="flex justify-between items-center text-[10px]">
                            <strong className="text-slate-200">{log.garageName}</strong>
                            <span className="text-[8px] text-rose-404 text-rose-400 font-bold uppercase">Spam Logged</span>
                          </div>
                          <p className="text-[9.5px] text-slate-400">
                            A vehicle owner reported this shop of spamming, triggering automated connection block.
                          </p>
                          <div className="text-[8.5px] text-slate-500 text-right">
                            Linked user ID: {log.userId || "1"} • {log.updatedAt ? new Date(log.updatedAt).toLocaleDateString() : "Just Now"}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
