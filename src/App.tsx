/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Car, 
  Sparkles, 
  MapPin, 
  Terminal, 
  Wrench, 
  User, 
  FolderGit2, 
  Info, 
  X, 
  FileCheck,
  ChevronRight,
  Shield,
  Activity,
  LogOut,
  Sliders,
  Check,
  Bell,
  QrCode,
  MessageSquare,
  Tag,
  Compass,
  Fuel,
  Zap,
  Clock,
  ShieldAlert,
  AlertTriangle,
  Coins,
  Layers
} from "lucide-react";
import { UserProfile, VehicleProfile, MaintenanceRecord, GaragePartner } from "./types";
import Dashboard from "./components/Dashboard";
import AICareAssistant from "./components/AICareAssistant";
import VehicleReportCard from "./components/VehicleReportCard";
import MyCarCareMap from "./components/MyCarCareMap";
import MyCarCareCoinSystem from "./components/MyCarCareCoinSystem";
import AdminPanel from "./components/AdminPanel";
import RemindersPanel from "./components/RemindersPanel";
import PartnerPortal from "./components/PartnerPortal";
import HelpForum from "./components/HelpForum";
import ClassifiedsMarketplace from "./components/ClassifiedsMarketplace";
import AIDreamCarAdvisor from "./components/AIDreamCarAdvisor";
import { QuickServiceLogSystem } from "./components/QuickServiceLogSystem";
import { VehicleRegistrationSystem } from "./components/VehicleRegistrationSystem";
import RoleBasedFormSystem from "./components/RoleBasedFormSystem";

import LoginScreen from "./components/LoginScreen";
import GarageDashboard from "./components/GarageDashboard";
import StationDashboard from "./components/StationDashboard";
import PartsDashboard from "./components/PartsDashboard";
import FreelanceDashboard from "./components/FreelanceDashboard";
import PendingApprovalScreen from "./components/PendingApprovalScreen";
import SuspendedScreen from "./components/SuspendedScreen";
import FixMyCarBiddingModule from "./components/FixMyCarBiddingModule";
import FleetManager from "./components/FleetManager";
import { syncVehicleRecords } from "./utils/dataSync";

/**
 * Custom Hook that triggers whenever a driver submits a fuel or maintenance record,
 * automatically updating the primary vehicle object's mileage (odometer) and lastServiceDate
 * attributes across the application state.
 */
export function useFleetDataSync(
  records: MaintenanceRecord[],
  vehicles: VehicleProfile[],
  setVehicles: React.Dispatch<React.SetStateAction<VehicleProfile[]>>,
  selectedVehicle: VehicleProfile | null,
  setSelectedVehicle: React.Dispatch<React.SetStateAction<VehicleProfile | null>>
) {
  useEffect(() => {
    if (records.length === 0 || vehicles.length === 0) return;

    let updatedVehicles = [...vehicles];
    let changed = false;

    records.forEach((rec) => {
      const targetVehicle = updatedVehicles.find((v) => v.id === rec.vehicleId);
      if (targetVehicle) {
        let vehicleChanged = false;
        const newUpdates: Partial<VehicleProfile> = {};

        if (rec.mileage && rec.mileage > (targetVehicle.mileage || 0)) {
          newUpdates.mileage = rec.mileage;
          vehicleChanged = true;
        }

        if (rec.date && (!targetVehicle.lastServiceDate || rec.date > targetVehicle.lastServiceDate)) {
          newUpdates.lastServiceDate = rec.date;
          vehicleChanged = true;
        }

        if (vehicleChanged) {
          updatedVehicles = syncVehicleRecords(updatedVehicles, rec.vehicleId, newUpdates);
          changed = true;
        }
      }
    });

    if (changed) {
      setVehicles(updatedVehicles);

      // Keep active selected vehicle state in sync
      if (selectedVehicle) {
        const updatedSelected = updatedVehicles.find((v) => v.id === selectedVehicle.id);
        if (
          updatedSelected &&
          (updatedSelected.mileage !== selectedVehicle.mileage ||
            updatedSelected.lastServiceDate !== selectedVehicle.lastServiceDate)
        ) {
          setSelectedVehicle(updatedSelected);
        }
      }
    }
  }, [records, setVehicles]);
}

export default function App() {
  // Navigation tabs state
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  
  // Sidebar Tools group expansion state
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({ tools: true });
  
  // Database state
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Auto set corresponding active tab based on role and status on load/role-switch
  useEffect(() => {
    if (!userProfile) return;

    if (userProfile.status === "Pending") {
      setActiveTab("pending_status");
      return;
    }
    if (userProfile.status === "Suspended") {
      setActiveTab("suspended_status");
      return;
    }
    
    switch (userProfile.role) {
      case "Vehicle Owner":
        setActiveTab("dashboard");
        break;
      case "Vehicle Manager":
        setActiveTab("fleet_manager");
        break;
      case "Driver / Staff":
        setActiveTab("fleet_manager");
        break;
      case "Garage Owner":
        setActiveTab("garage_control");
        break;
      case "Petrol Station Partner":
        setActiveTab("station_control");
        break;
      case "Spare Part Shop":
        setActiveTab("parts_control");
        break;
      case "Admin":
        setActiveTab("admin");
        break;
      case "Freelance Mechanic":
        setActiveTab("freelance_control");
        break;
      default:
        setActiveTab("dashboard");
    }
  }, [userProfile?.role, userProfile?.status]);
  const [vehicles, setVehicles] = useState<VehicleProfile[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleProfile | null>(null);
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [garages, setGarages] = useState<GaragePartner[]>([]);

  // Call useFleetDataSync to keep vehicles and selectedVehicle synced with incoming driver records in real-time
  useFleetDataSync(records, vehicles, setVehicles, selectedVehicle, setSelectedVehicle);
  
  // Modals state
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [showLogServiceModal, setShowLogServiceModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  
  // From diagnosis category focus trigger for finder locator tab
  const [searchCategory, setSearchCategory] = useState("");
  const [forumPreFilledCategory, setForumPreFilledCategory] = useState("");

  // Loading states
  const [appLoading, setAppLoading] = useState(true);
  const [addVehicleLoading, setAddVehicleLoading] = useState(false);

  // Offline connectivity states
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isDisconnected, setIsDisconnected] = useState<boolean>(false);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(false);

  // Offline Pending Service Logs Queue
  const [offlineQueue, setOfflineQueue] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("mcc_offline_queue");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load local offline queue:", e);
      return [];
    }
  });
  const [showOfflineQueuePopover, setShowOfflineQueuePopover] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Persist offline queue
  useEffect(() => {
    try {
      localStorage.setItem("mcc_offline_queue", JSON.stringify(offlineQueue));
    } catch (e) {
      console.error("Failed to persist local offline queue:", e);
    }
  }, [offlineQueue]);

  // Form states: New Vehicle Group
  const [vBrand, setVBrand] = useState("Toyota");
  const [vModel, setVModel] = useState("Prius");
  const [vYear, setVYear] = useState("2010");
  const [vMileage, setVMileage] = useState("120000");
  const [vFuel, setVFuel] = useState<'Gasoline' | 'Diesel' | 'EV' | 'Hybrid'>("Hybrid");
  const [vLastOil, setVLastOil] = useState("");
  const [vLastDate, setVLastDate] = useState("");

  // Form states: New Service log Group
  const [sCategory, setSCategory] = useState("Engine Oil Service");
  const [sCost, setSCost] = useState("45");
  const [sMileage, setSMileage] = useState("180500");
  const [sDate, setSDate] = useState(new Date().toISOString().split('T')[0]);
  const [sProvider, setSProvider] = useState("Apsara Auto Repair & Diagnostics");
  const [sDesc, setSDesc] = useState("Exchanged 5W-30 synthetic lubricant and secondary engine filters.");

  // Fetch initial profile, vehicles, maintenance blocks and Phnom Penh garages
  const bootstrapData = async () => {
    // If simulated offline is active, fail immediately to demonstrate disconnected mode
    if (isSimulatedOffline) {
      setIsDisconnected(true);
      console.warn("App is in simulated disconnected state. API call did not run.");
      return;
    }

    try {
      const [profileRes, vehiclesRes, recordsRes, garagesRes] = await Promise.all([
        fetch("/api/profile"),
        fetch("/api/vehicles"),
        fetch("/api/maintenance"),
        fetch("/api/garages")
      ]);

      if (profileRes.ok && vehiclesRes.ok && recordsRes.ok && garagesRes.ok) {
        setIsDisconnected(false);
        
        const profileData: UserProfile = await profileRes.json();
        setUserProfile(profileData);

        const vehiclesData: VehicleProfile[] = await vehiclesRes.json();
        setVehicles(vehiclesData);
        if (vehiclesData.length > 0) {
          setSelectedVehicle(vehiclesData[0]);
        }

        const recordsData: MaintenanceRecord[] = await recordsRes.json();
        // Merge any pending offline queue items
        setRecords([...recordsData, ...offlineQueue]);

        const garagesData: GaragePartner[] = await garagesRes.json();
        setGarages(garagesData);
      } else {
        setIsDisconnected(true);
      }
    } catch (err) {
      console.error("Critical error bootstrapping application APIs:", err);
      setIsDisconnected(true);
    } finally {
      setAppLoading(false);
      setIsRetrying(false);
    }
  };

  useEffect(() => {
    bootstrapData();
  }, [isSimulatedOffline]);

  // Window network listener
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (!isSimulatedOffline) {
        setIsDisconnected(false);
      }
    };
    const handleOffline = () => {
      setIsOnline(false);
      setIsDisconnected(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [isSimulatedOffline]);

  const handleRetryLastAction = () => {
    setIsRetrying(true);
    // Automatically lift simulated offline so that the retry succeeds organically
    setIsSimulatedOffline(false);
    setIsDisconnected(false);
    setTimeout(() => {
      bootstrapData();
    }, 800);
  };

  // Notifications automatic unread count tracking
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!selectedVehicle) return;
    const updateUnread = async () => {
      try {
        const res = await fetch(`/api/notifications?vehicleId=${selectedVehicle.id}`);
        if (res.ok) {
          const list = await res.json();
          const unread = list.filter((n: any) => n.status === 'unread').length;
          setUnreadCount(unread);
        }
      } catch (err) {}
    };
    updateUnread();
    const timer = setInterval(updateUnread, 5000);
    return () => clearInterval(timer);
  }, [selectedVehicle]);

  // Handler: Refresh vehicles and maintenance records manually (e.g. after owner approves scan ticket)
  const handleRefreshAllDataFromServer = async () => {
    try {
      const [vehiclesRes, recordsRes] = await Promise.all([
        fetch("/api/vehicles"),
        fetch("/api/maintenance")
      ]);
      if (vehiclesRes.ok) {
        const vehiclesData = await vehiclesRes.json();
        setVehicles(vehiclesData);
        if (selectedVehicle) {
          const matched = vehiclesData.find((v: any) => v.id === selectedVehicle.id);
          if (matched) {
            setSelectedVehicle(matched);
          } else if (vehiclesData.length > 0) {
            setSelectedVehicle(vehiclesData[0]);
          }
        } else if (vehiclesData.length > 0) {
          setSelectedVehicle(vehiclesData[0]);
        }
      }
      if (recordsRes.ok) {
        const recordsData = await recordsRes.json();
        setRecords([...recordsData, ...offlineQueue]);
      }
    } catch (err) {
      console.error("Error refreshing global data streams:", err);
    }
  };

  // Handler: Add a brand new vehicle and fetch AI vulnerability audit
  const handleAddNewVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vBrand || !vModel || !vYear || !vMileage) return;

    setAddVehicleLoading(true);
    try {
      const response = await fetch("/api/vehicles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          brand: vBrand,
          model: vModel,
          year: Number(vYear),
          mileage: Number(vMileage),
          fuelType: vFuel,
          lastOilChangeMileage: vLastOil ? Number(vLastOil) : null,
          lastServiceDate: vLastDate || null
        })
      });

      if (response.ok) {
        const newVehicle: VehicleProfile = await response.json();
        setVehicles(prev => [...prev, newVehicle]);
        setSelectedVehicle(newVehicle);
        setShowAddVehicleModal(false);
        
        // Auto navigate to the newly generated AI Vulnerability Audit report tab!
        setActiveTab('reports');

        // Reset form details
        setVBrand("Toyota");
        setVModel("Prius");
        setVYear("2010");
        setVMileage("120000");
        setVFuel("Hybrid");
        setVLastOil("");
        setVLastDate("");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAddVehicleLoading(false);
    }
  };

  // Handler: Delete vehicle profile entirely
  const handleDeleteVehicle = async (id: string) => {
    if (!confirm("Are you sure you want to remove this vehicle profile? This deletes relevant maintenance logs.")) return;

    try {
      const response = await fetch(`/api/vehicles/${id}`, { method: "DELETE" });
      if (response.ok) {
        const remaining = vehicles.filter((v) => v.id !== id);
        setVehicles(remaining);
        if (remaining.length > 0) {
          setSelectedVehicle(remaining[0]);
        } else {
          setSelectedVehicle(null);
        }
        // Filter local state records
        setRecords(prev => prev.filter(rec => rec.vehicleId !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handler: Add a new service record entry
  const handleLogServiceRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle) return;

    const logData = {
      vehicleId: selectedVehicle.id,
      serviceCategory: sCategory,
      description: sDesc,
      cost: Number(sCost),
      mileage: Number(sMileage),
      date: sDate,
      provider: sProvider
    };

    if (isDisconnected) {
      const tempId = `pending-owner-${Date.now()}`;
      const offlineItem = {
        ...logData,
        id: tempId,
        isPending: true
      };

      setOfflineQueue(prev => [...prev, offlineItem]);
      setRecords(prev => [...prev, offlineItem]);

      // Correct mileage in active vehicle state directly (local state update for immediate feedback)
      setVehicles(prevVehicles => {
        return prevVehicles.map(veh => {
          if (veh.id === selectedVehicle.id) {
            const updated = { ...veh };
            if (Number(sMileage) > veh.mileage) {
              updated.mileage = Number(sMileage);
            }
            if (sCategory === "Engine Oil Service") {
              updated.lastOilChangeMileage = Number(sMileage);
            }
            updated.lastServiceDate = sDate;
            return updated;
          }
          return veh;
        });
      });

      // Sync local selected pointer
      setSelectedVehicle(prevSelected => {
        if (!prevSelected) return null;
        const updated = { ...prevSelected };
        if (Number(sMileage) > prevSelected.mileage) {
          updated.mileage = Number(sMileage);
        }
        if (sCategory === "Engine Oil Service") {
          updated.lastOilChangeMileage = Number(sMileage);
        }
        updated.lastServiceDate = sDate;
        return updated;
      });

      setShowLogServiceModal(false);
      alert(`Saved to Offline Queue: Connection to Cambodia Cloud server is offline. This service log is stored locally and will sync once connection is restored!`);
      return;
    }

    try {
      const response = await fetch("/api/maintenance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(logData)
      });

      if (response.ok) {
        const newRecord: MaintenanceRecord = await response.json();
        setRecords(prev => [...prev, newRecord]);
        
        // Correct mileage in active vehicle state directly
        setVehicles(prevVehicles => {
          return prevVehicles.map(veh => {
            if (veh.id === selectedVehicle.id) {
              const updated = { ...veh };
              if (Number(sMileage) > veh.mileage) {
                updated.mileage = Number(sMileage);
              }
              if (sCategory === "Engine Oil Service") {
                updated.lastOilChangeMileage = Number(sMileage);
              }
              updated.lastServiceDate = sDate;
              return updated;
            }
            return veh;
          });
        });

        // Sync local selected pointer
        setSelectedVehicle(prevSelected => {
          if (!prevSelected) return null;
          const updated = { ...prevSelected };
          if (Number(sMileage) > prevSelected.mileage) {
            updated.mileage = Number(sMileage);
          }
          if (sCategory === "Engine Oil Service") {
            updated.lastOilChangeMileage = Number(sMileage);
          }
          updated.lastServiceDate = sDate;
          return updated;
        });

        setShowLogServiceModal(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handler: Delete service audit log
  const handleDeleteServiceRecord = async (id: string) => {
    // If we're deleting a local pending record, just filter it out of our local arrays
    if (id.startsWith("pending-")) {
      setOfflineQueue(prev => prev.filter(r => r.id !== id));
      setRecords(prev => prev.filter(r => r.id !== id));
      return;
    }

    try {
      const response = await fetch(`/api/maintenance/${id}`, { method: "DELETE" });
      if (response.ok) {
        setRecords(prev => prev.filter((r) => r.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // External service log helper used by certified business partners (e.g. scanned customer cars)
  const handleLogRecordExternal = async (logData: {
    vehicleId: string;
    serviceCategory: string;
    cost: number;
    mileage: number;
    provider: string;
    description: string;
    date: string;
  }) => {
    if (isDisconnected) {
      const tempId = `pending-ext-${Date.now()}`;
      const offlineItem = {
        ...logData,
        id: tempId,
        isPending: true
      };

      setOfflineQueue(prev => [...prev, offlineItem]);
      setRecords(prev => [...prev, offlineItem]);

      // Sync vehicle mileage and details in local arrays
      setVehicles(prevVehicles => {
        return prevVehicles.map(veh => {
          if (veh.id === logData.vehicleId) {
            const updated = { ...veh };
            if (logData.mileage > veh.mileage) {
              updated.mileage = logData.mileage;
            }
            if (logData.serviceCategory === "Engine Oil Service") {
              updated.lastOilChangeMileage = logData.mileage;
            }
            updated.lastServiceDate = logData.date;
            return updated;
          }
          return veh;
        });
      });

      return true;
    }

    try {
      const response = await fetch("/api/maintenance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(logData)
      });

      if (response.ok) {
        const newRecord: MaintenanceRecord = await response.json();
        setRecords(prev => [...prev, newRecord]);
        
        // Sync vehicle mileage and details in local arrays
        setVehicles(prevVehicles => {
          return prevVehicles.map(veh => {
            if (veh.id === logData.vehicleId) {
              const updated = { ...veh };
              if (logData.mileage > veh.mileage) {
                updated.mileage = logData.mileage;
              }
              if (logData.serviceCategory === "Engine Oil Service") {
                updated.lastOilChangeMileage = logData.mileage;
              }
              updated.lastServiceDate = logData.date;
              return updated;
            }
            return veh;
          });
        });

        return true;
      }
    } catch (err) {
      console.error("External maintenance log write failed:", err);
    }
    return false;
  };

  // Synchronize cached offline queue items back to server DB
  const handleSyncOfflineQueue = async () => {
    if (offlineQueue.length === 0 || isDisconnected || isSyncing) return;
    setIsSyncing(true);
    
    const remainingQueue = [...offlineQueue];
    const successfullySynced: string[] = [];

    for (const item of remainingQueue) {
      const payload = {
        vehicleId: item.vehicleId,
        serviceCategory: item.serviceCategory,
        description: item.description,
        cost: item.cost,
        mileage: item.mileage,
        date: item.date,
        provider: item.provider
      };

      try {
        const res = await fetch("/api/maintenance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          successfullySynced.push(item.id);
        }
      } catch (err) {
        console.error("Failed to sync offline item:", item, err);
        break; // break early if reconnect status drops
      }
    }

    if (successfullySynced.length > 0) {
      const nextQueue = remainingQueue.filter(item => !successfullySynced.includes(item.id));
      setOfflineQueue(nextQueue);

      // Re-fetch all authentic database records
      try {
        const recordsRes = await fetch("/api/maintenance");
        if (recordsRes.ok) {
          const recordsData = await recordsRes.json();
          setRecords([...recordsData, ...nextQueue]);
        }
      } catch (err) {
        // Fallback: exclude synced items if fetch failed
        setRecords(prev => prev.filter(r => !successfullySynced.includes(r.id)));
      }
      alert(`Sync Complete: Successfully synced ${successfullySynced.length} locally-cached service logs to the Cambodia MyCar Cloud Server!`);
    }

    setIsSyncing(false);
  };

  // Re-trigger automatic queue synchronization whenever server connectivity is recovered
  useEffect(() => {
    if (!isDisconnected && offlineQueue.length > 0) {
      handleSyncOfflineQueue();
    }
  }, [isDisconnected]);

  // Switch to maps locator and highlight category search recommended from chat advisor
  const handleDiagnosisFocusTransition = (categoryName: string) => {
    setSearchCategory(categoryName);
    setActiveTab('garages');
  };

  if (!isLoggedIn || !userProfile) {
    return (
      <LoginScreen 
        guestProfile={userProfile}
        onLoginSuccess={(profile) => {
          setUserProfile(profile);
          setIsLoggedIn(true);
        }}
      />
    );
  }

  // Render navigation list based on permission roles
  const getNavItems = () => {
    if (userProfile?.status === "Pending") {
      return [
        { id: "pending_status", label: "Registration Bureau", icon: <Clock className="w-4 h-4 text-amber-500 animate-spin" /> }
      ];
    }
    if (userProfile?.status === "Suspended") {
      return [
        { id: "suspended_status", label: "Bureau Sanctions", icon: <ShieldAlert className="w-4 h-4 text-red-500" /> }
      ];
    }

    const baseItems = (() => {
      switch (userProfile?.role) {
        case "Vehicle Owner":
          return [
            { id: "dashboard", label: "My Vehicle & Logger", icon: <Car className="w-4 h-4 text-sky-400" /> },
            { id: "fleet_manager", label: "★ Fleet & Family Manager", icon: <Layers className="w-4 h-4 text-emerald-400 animate-pulse" /> },
            { id: "alarms", label: "Alarms & Reminders", icon: <Bell className="w-4 h-4 text-sky-400" /> },
            { 
              id: "tools", 
              label: "Tools", 
              icon: <Wrench className="w-4 h-4 text-indigo-400" />,
              isGroup: true,
              subItems: [
                { id: "dream-car-advisor", label: "Can I Afford This Car?", icon: <Sparkles className="w-4 h-4 text-pink-400 animate-pulse" /> },
                { id: "ai-chat", label: "AI System Checker", icon: <Sparkles className="w-4 h-4 text-sky-400" /> },
                { id: "reports", label: "AI Weak Report", icon: <FileCheck className="w-4 h-4 text-indigo-400" /> },
              ]
            },
            { id: "classifieds", label: "Marketplace", icon: <Tag className="w-4 h-4 text-amber-400" /> },
            { id: "forum", label: "Help Forum", icon: <MessageSquare className="w-4 h-4 text-emerald-400" /> },
            { id: "garages", label: "Phnom Penh Service Finder", icon: <MapPin className="w-4 h-4 text-orange-400" /> },
            { id: "partner_portal", label: "QR & Partner Portal", icon: <QrCode className="w-4 h-4 text-indigo-400" /> },
          ];
        case "Vehicle Manager":
          return [
            { id: "fleet_manager", label: "★ Fleet Dashboard", icon: <Layers className="w-4 h-4 text-emerald-400 animate-pulse" /> },
            { id: "dashboard", label: "My Vehicle & Logger", icon: <Car className="w-4 h-4 text-sky-400" /> },
            { id: "alarms", label: "Alarms & Reminders", icon: <Bell className="w-4 h-4 text-sky-400" /> },
            { id: "classifieds", label: "Marketplace", icon: <Tag className="w-4 h-4 text-amber-400" /> },
            { id: "forum", label: "Help Forum", icon: <MessageSquare className="w-4 h-4 text-emerald-400" /> },
            { id: "garages", label: "Phnom Penh Service Finder", icon: <MapPin className="w-4 h-4 text-orange-400" /> },
            { id: "partner_portal", label: "QR & Partner Portal", icon: <QrCode className="w-4 h-4 text-indigo-400" /> },
          ];
        case "Driver / Staff":
          return [
            { id: "fleet_manager", label: "★ Driver Console", icon: <Layers className="w-4 h-4 text-emerald-400 animate-pulse" /> },
            { id: "dashboard", label: "My Vehicle & Logger", icon: <Car className="w-4 h-4 text-sky-400" /> },
            { id: "garages", label: "Phnom Penh Service Finder", icon: <MapPin className="w-4 h-4 text-orange-400" /> },
          ];
        case "Garage Owner":
          return [
            { id: "parts_control", label: "Business Workstation", icon: <Wrench className="w-4 h-4 text-emerald-400 animate-pulse" /> },
            { id: "ai-chat", label: "Diagnostics Expert AI", icon: <Sparkles className="w-4 h-4 text-sky-400" /> },
            { id: "classifieds", label: "Marketplace", icon: <Tag className="w-4 h-4 text-amber-500" /> },
            { id: "garages", label: "My Public Locator", icon: <MapPin className="w-4 h-4 text-orange-400" /> },
            { id: "forum", label: "Customer Helpline Forum", icon: <MessageSquare className="w-4 h-4 text-emerald-350" /> },
          ];
        case "Petrol Station Partner":
          return [
            { id: "station_control", label: "Fuel Dispensation Desk", icon: <Fuel className="w-4 h-4 text-amber-400" /> },
            { id: "garages", label: "Locate Partner Outlets", icon: <MapPin className="w-4 h-4 text-orange-400" /> },
            { id: "forum", label: "Fuel Quality Q&A Forum", icon: <MessageSquare className="w-4 h-4 text-emerald-350" /> },
          ];
        case "Spare Part Shop":
          return [
            { id: "parts_control", label: "Business Workstation", icon: <Sliders className="w-4 h-4 text-indigo-400" /> },
            { id: "classifieds", label: "Marketplace", icon: <Tag className="w-4 h-4 text-amber-500" /> },
            { id: "ai-chat", label: "Fitment Solver AI", icon: <Sparkles className="w-4 h-4 text-sky-400" /> },
            { id: "forum", label: "Part Requests Forum", icon: <MessageSquare className="w-4 h-4 text-emerald-350" /> },
          ];
        case "Admin":
          return [
            { id: "admin", label: "Operations Admin Panel", icon: <Terminal className="w-4 h-4 text-sky-400" /> },
            { id: "dashboard", label: "All Vehicles Database", icon: <Car className="w-4 h-4 text-slate-400" /> },
            { id: "forum", label: "Forum Discussions Mod", icon: <MessageSquare className="w-4 h-4 text-emerald-350" /> },
          ];
        case "Freelance Mechanic":
          return [
            { id: "freelance_control", label: "Highway Distress Alerts", icon: <Zap className="w-4 h-4 text-rose-400 animate-pulse" /> },
            { id: "ai-chat", label: "Diagnostics Codes Database", icon: <Sparkles className="w-4 h-4 text-sky-400" /> },
            { id: "forum", label: "Assistance Tips Board", icon: <MessageSquare className="w-4 h-4 text-emerald-350" /> },
          ];
        default:
          return [
            { id: "dashboard", label: "Home Odometer", icon: <Car className="w-4 h-4 text-sky-400" /> }
          ];
      }
    })();

    return [
      { id: "role_forms", label: "Unified Form System", icon: <Sliders className="w-4 h-4 text-sky-400 animate-pulse" /> },
      ...baseItems,
      { id: "fix_my_car_bidding", label: "Fix My Car Requests", icon: <Wrench className="w-4 h-4 text-emerald-450 text-emerald-400 animate-pulse" /> },
      { id: "coins", label: "Care Coin Donation & Rewards", icon: <Coins className="w-4 h-4 text-amber-400 animate-pulse" /> },
      { id: "vehicle_powertrains", label: "My Vehicle", icon: <Sliders className="w-4 h-4 text-pink-450 text-pink-400 animate-pulse" /> },
      { id: "quick_service_workspace", label: "Quick Service Workspace", icon: <Sliders className="w-4 h-4 text-emerald-450 text-emerald-400 animate-pulse" /> }
    ];
  };

  return (
    <div className="min-h-screen text-slate-100 font-sans flex flex-col antialiased">
      {/* -------------------- MAIN NAVIGATION BAR -------------------- */}
      <header className="sticky top-0 z-40 bg-white/3 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center text-slate-950 font-bold shadow-lg">
            <Car className="w-5.5 h-5.5 text-slate-900" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold text-slate-100 tracking-tight">
                MyVehicle Care
              </span>
              <span className="text-[10px] bg-white/10 text-sky-300 font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border border-white/10">
                Cambodia MVP
              </span>
            </div>
            <p className="text-[11px] text-slate-400">AI vehicle maintenance supervisor</p>
          </div>
        </div>

        {/* User Identity Indicator */}
        {userProfile && (
          <div className="flex items-center gap-3">
            {/* Dynamic Offline / Online Connectivity Indicator */}
            {isDisconnected ? (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs select-none">
                <div className="flex items-center gap-1.5 text-rose-400 font-bold" title="Server Disconnected">
                  <span className="h-2 w-2 rounded-full bg-rose-500 block animate-ping"></span>
                  <span>Offline</span>
                </div>
                <span className="text-slate-700 font-bold">|</span>
                <button 
                  onClick={handleRetryLastAction}
                  disabled={isRetrying}
                  className="text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1 hover:underline disabled:opacity-50 cursor-pointer"
                  title="Click to retry bootstrap API call"
                >
                  <Clock className={`w-3 h-3 ${isRetrying ? 'animate-spin' : ''}`} />
                  <span>{isRetrying ? 'Retrying...' : 'Retry'}</span>
                </button>
              </div>
            ) : (
              <div 
                onClick={() => {
                  setIsSimulatedOffline(true);
                  setIsDisconnected(true);
                }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/15 text-emerald-400 rounded-xl text-xs font-semibold cursor-pointer transition select-none"
                title="Server Connected • Click to simulate offline mode"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 block animate-pulse"></span>
                <span>Online</span>
              </div>
            )}

            {/* Offline Queue Notification Badge & Popover */}
            {offlineQueue.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowOfflineQueuePopover(!showOfflineQueuePopover)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold transition hover:scale-[1.02] cursor-pointer shadow-md select-none animate-pulse"
                  title="Click to view offline queued service logs"
                >
                  <Wrench className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} />
                  <span>Queue: {offlineQueue.length} Pending</span>
                </button>

                {showOfflineQueuePopover && (
                  <div className="absolute right-0 mt-2 w-80 glass border border-white/15 rounded-2xl shadow-2xl p-4 space-y-3 z-50 bg-slate-950/95 backdrop-blur-xl text-xs">
                    <div className="flex justify-between items-center border-b border-white/10 pb-2">
                      <div className="flex items-center gap-1.5">
                        <Wrench className="w-4 h-4 text-amber-400" />
                        <span className="font-extrabold text-slate-100 uppercase tracking-widest text-[10px]">Offline Queue Logs</span>
                      </div>
                      <button onClick={() => setShowOfflineQueuePopover(false)} className="text-slate-400 hover:text-white cursor-pointer">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-[10px] text-slate-400 leading-normal">
                      These {offlineQueue.length} service logs are stored locally. They will automatically sync to the secure server database once connection is re-established.
                    </p>

                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 no-scrollbar">
                      {offlineQueue.map((item, index) => {
                        const vName = vehicles.find(v => v.id === item.vehicleId);
                        return (
                          <div key={item.id || index} className="p-2 border border-white/5 bg-white/3 rounded-xl flex flex-col gap-1 text-[11px]">
                            <div className="flex justify-between items-center font-bold">
                              <span className="text-sky-300">{item.serviceCategory}</span>
                              <span className="text-slate-500 font-mono text-[9px]">{item.date}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 flex justify-between items-center">
                              <span>Veh: {vName ? `${vName.brand} ${vName.model}` : "General Vehicle"}</span>
                              <span className="font-mono font-bold text-amber-400">${item.cost}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="border-t border-white/10 pt-2 flex flex-col gap-2">
                      {isDisconnected ? (
                        <div className="space-y-2">
                          <div className="text-[10px] text-slate-400 leading-normal flex items-start gap-1 bg-yellow-500/5 p-2 border border-yellow-500/10 rounded-lg">
                            <AlertTriangle className="w-3.5 h-3.5 text-yellow-500 shrink-0 mt-0.5" />
                            <span>Run restoration below to connect simulated server and trigger auto-sync.</span>
                          </div>
                          
                          {isSimulatedOffline && (
                            <button
                              onClick={() => {
                                setIsSimulatedOffline(false);
                                setIsDisconnected(false);
                              }}
                              className="w-full py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black tracking-wider uppercase rounded-xl transition hover:scale-[1.01] cursor-pointer shadow-md text-center text-[10px]"
                            >
                              Simulate Online Restoration
                            </button>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={handleSyncOfflineQueue}
                          disabled={isSyncing}
                          className="w-full py-2 bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600 text-white font-extrabold tracking-wider uppercase rounded-xl transition hover:scale-[1.01] cursor-pointer shadow-md text-center text-[10px] flex items-center justify-center gap-2"
                        >
                          {isSyncing ? (
                            <>
                              <Clock className="w-3.5 h-3.5 animate-spin" />
                              <span>Syncing Cache ({offlineQueue.length})...</span>
                            </>
                          ) : (
                            <>
                              <Wrench className="w-3.5 h-3.5" />
                              <span>Flush & Sync Queue Now</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {userProfile?.role === "Vehicle Owner" && (
              <button
                onClick={() => setActiveTab("fix_my_car_bidding")}
                className="px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-lg animate-pulse"
                title="Emergency SOS dispatch Help Request"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>🚨 Emergency SOS</span>
              </button>
            )}

            <button
              onClick={() => setIsLoggedIn(false)}
              className="px-3.5 py-2 hover:bg-white/5 border border-white/10 hover:border-slate-500/30 text-slate-350 hover:text-white transition rounded-xl text-xs font-bold leading-tight flex items-center gap-1.5 cursor-pointer"
              title="Click to change active role persona and re-trigger landing setup logs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Change Role (Demo)</span>
            </button>

            <div 
              onClick={() => setShowSettingsModal(true)}
              className="px-4 py-2 glass glass-hover rounded-xl flex items-center gap-2.5 transition text-left cursor-pointer group shadow-sm"
              title="Click to view detailed account parameters settings and locations flags"
            >
              <div className="w-6.5 h-6.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <User className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-200 block leading-tight group-hover:text-white">
                  {userProfile.name}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {userProfile.location} • {userProfile.role}
                </span>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* -------------------- CORE CONTENT GRID -------------------- */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigation Sidebar Panel */}
        <nav className="lg:col-span-3 glass rounded-3xl p-5 space-y-2 select-none">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block px-3 mb-2">My functions ({userProfile?.role})</span>
          
          {getNavItems().map((item: any) => {
            if (item.isGroup) {
              const isExpanded = expandedGroups[item.id] !== false;
              const isSubItemActive = item.subItems?.some((sub: any) => activeTab === sub.id);
              
              return (
                <div key={item.id} className="space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setExpandedGroups(prev => ({ ...prev, [item.id]: !isExpanded }));
                    }}
                    className={`w-full p-3.5 rounded-2xl text-left font-bold text-xs flex items-center justify-between transition border cursor-pointer ${
                      isSubItemActive
                        ? "bg-white/10 text-white border-white/15 shadow-sm"
                        : "bg-transparent text-slate-400 border-transparent hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`} />
                  </button>
                  
                  {isExpanded && (
                    <div className="pl-4 border-l border-white/10 space-y-1 ml-5 mt-1">
                      {item.subItems?.map((subItem: any) => {
                        const isActive = activeTab === subItem.id;
                        return (
                          <button
                            key={subItem.id}
                            type="button"
                            onClick={() => {
                              setActiveTab(subItem.id);
                              setSearchCategory("");
                              setForumPreFilledCategory("");
                            }}
                            className={`w-full p-2.5 rounded-xl text-left font-semibold text-xs flex items-center gap-2.5 transition border cursor-pointer ${
                              isActive
                                ? "bg-white/10 text-white border-white/10 shadow-sm"
                                : "bg-transparent text-slate-400 hover:text-slate-200 border-transparent hover:bg-white/5"
                            }`}
                          >
                            {subItem.icon}
                            <span>{subItem.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => { setActiveTab(item.id); setSearchCategory(""); setForumPreFilledCategory(""); }}
                className={`w-full p-3.5 rounded-2xl text-left font-semibold text-xs flex items-center justify-between transition border cursor-pointer ${
                  activeTab === item.id
                    ? "bg-white/10 text-white border-white/15 shadow-sm"
                    : "bg-transparent text-slate-400 border-transparent glass-hover"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              </button>
            );
          })}

          {/* QR Code Feature Guide (Matches .lg:col-span-3 .glass:first-of-type) */}
          <div className="pt-4">
            <div className="glass rounded-2xl p-4 space-y-2.5 border border-white/5 bg-white/5">
              <h4 className="text-[11px] font-bold text-slate-300 tracking-wide uppercase flex items-center gap-1.5">
                <QrCode className="w-3.5 h-3.5 text-pink-400" />
                <span>QR Scanner Guide</span>
              </h4>
              <p className="text-[10px] leading-relaxed text-slate-400">
                Authorized partners scan your vehicle's secure QR code to instantly pull and log live service records. Look up your scanner codes under the Partner Portal.
              </p>
              <div className="flex items-center justify-center p-2 rounded-xl bg-slate-950/60 border border-white/5 mt-1">
                <div className="flex flex-col items-center gap-1 py-1">
                  <div className="w-10 h-10 border-2 border-dashed border-pink-500/30 rounded-lg flex items-center justify-center text-pink-400 animate-pulse">
                    <QrCode className="w-5 h-5 opacity-60" />
                  </div>
                  <span className="text-[9px] text-slate-500 font-mono tracking-tighter">Scan Reader Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Phnom Penh Fuel Prices & Hazard Reporter (Matches .lg:col-span-3 .glass:last-of-type) */}
          <div className="pt-4">
            <div className="glass rounded-2xl p-4 space-y-3 border border-white/5 bg-white/5">
              <div className="flex items-center justify-between">
                <h4 className="text-[11px] font-bold text-slate-300 tracking-wide uppercase flex items-center gap-1.5">
                  <Fuel className="w-3.5 h-3.5 text-amber-500 font-bold animate-pulse" />
                  <span>Phnom Penh Fuel Prices</span>
                </h4>
                <span className="text-[9px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">Live Today</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-slate-950/50 border border-white/5 p-1.5 rounded-xl">
                  <span className="text-[9px] block text-slate-500 uppercase font-bold tracking-wider">Regular</span>
                  <span className="text-xs font-mono font-bold text-slate-200">$1.08<span className="text-[9px] text-slate-500 font-normal">/L</span></span>
                </div>
                <div className="bg-slate-950/50 border border-white/5 p-1.5 rounded-xl">
                  <span className="text-[9px] block text-slate-500 uppercase font-bold tracking-wider">Premium</span>
                  <span className="text-xs font-mono font-bold text-pink-400">$1.18<span className="text-[9px] text-slate-500 font-normal">/L</span></span>
                </div>
              </div>

              <div className="pt-2.5 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setForumPreFilledCategory("Monsoon / Water Drainage damage");
                    setActiveTab("forum");
                  }}
                  className="w-full text-left py-2 px-2.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/25 border border-orange-500/20 text-orange-450 text-orange-400 hover:text-orange-300 transition text-[10px] font-bold flex items-center justify-between cursor-pointer group"
                  title="Report unpaved street flooding or structural drainage issues directly to the Help Forum"
                >
                  <span className="flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 group-hover:animate-bounce" />
                    <span>Report a Road Hazard</span>
                  </span>
                  <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-amber-400" />
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Dynamic Center Workstation display */}
        <main className="lg:col-span-9">
          {appLoading ? (
            <div className="py-24 text-center space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin mx-auto"></div>
              <p className="text-sm text-slate-400">Bootstrapping localized data arrays...</p>
            </div>
          ) : (
            <div>
              {activeTab === 'pending_status' && userProfile && (
                <PendingApprovalScreen
                  userProfile={userProfile}
                  onRefreshData={handleRefreshAllDataFromServer}
                />
              )}

              {activeTab === 'suspended_status' && userProfile && (
                <SuspendedScreen
                  userProfile={userProfile}
                  onRefreshData={handleRefreshAllDataFromServer}
                />
              )}

              {activeTab === 'dashboard' && (
                <Dashboard
                  vehicles={vehicles}
                  onAddVehicle={() => setShowAddVehicleModal(true)}
                  onSelectVehicle={(v) => setSelectedVehicle(v)}
                  selectedVehicle={selectedVehicle}
                  records={records}
                  onDeleteVehicle={(id) => handleDeleteVehicle(id)}
                  onAddRecord={() => {
                    if (selectedVehicle) {
                      setSMileage(String(selectedVehicle.mileage));
                    }
                    setShowLogServiceModal(true);
                  }}
                  onDeleteRecord={(id) => handleDeleteServiceRecord(id)}
                  onNavigateTab={(tabName) => setActiveTab(tabName)}
                  setVehicles={setVehicles}
                  userProfile={userProfile}
                  garages={garages}
                />
              )}

              {activeTab === 'fleet_manager' && (
                <FleetManager 
                  userProfile={userProfile} 
                  appVehicles={vehicles}
                  setAppVehicles={setVehicles}
                  appRecords={records}
                  setAppRecords={setRecords}
                  onRefreshData={handleRefreshAllDataFromServer}
                />
              )}

              {/* Role specific: Bay workstation for garage owners */}
              {activeTab === 'garage_control' && (
                <GarageDashboard 
                  userProfile={userProfile}
                  vehicles={vehicles}
                  records={records}
                  onLogRecordExternal={handleLogRecordExternal}
                  onRefreshData={handleRefreshAllDataFromServer}
                />
              )}

              {/* Role specific: Station monitoring console */}
              {activeTab === 'station_control' && (
                <StationDashboard 
                  userProfile={userProfile}
                  onRefreshData={handleRefreshAllDataFromServer}
                />
              )}

              {/* Role specific: Combined Multi-Service Business Workstation */}
              {activeTab === 'parts_control' && (
                <PartsDashboard 
                  userProfile={userProfile}
                  vehicles={vehicles}
                  records={records}
                  onLogRecordExternal={handleLogRecordExternal}
                  onRefreshData={handleRefreshAllDataFromServer}
                />
              )}

              {/* Role specific: Roadside helper pageboard */}
              {activeTab === 'freelance_control' && (
                <FreelanceDashboard 
                  userProfile={userProfile}
                  onRefreshData={handleRefreshAllDataFromServer}
                />
              )}

              {activeTab === 'alarms' && (
                <RemindersPanel
                  vehicles={vehicles}
                  selectedVehicle={selectedVehicle}
                  onSelectVehicle={(v) => setSelectedVehicle(v)}
                  records={records}
                />
              )}

              {activeTab === 'dream-car-advisor' && (
                <AIDreamCarAdvisor />
              )}

              {activeTab === 'ai-chat' && (
                <AICareAssistant
                  vehicles={vehicles}
                  selectedVehicle={selectedVehicle}
                  onNavigateToGarages={(servCat) => handleDiagnosisFocusTransition(servCat)}
                />
              )}

              {activeTab === 'reports' && (
                <VehicleReportCard
                  vehicles={vehicles}
                  selectedVehicle={selectedVehicle}
                  onSelectVehicle={(v) => setSelectedVehicle(v)}
                />
              )}

              {activeTab === 'garages' && (
                <MyCarCareMap
                  vehicles={vehicles}
                  records={records}
                  activeUser={userProfile}
                  onRefreshData={handleRefreshAllDataFromServer}
                  onLogRecordExternal={handleLogRecordExternal}
                  onNavigateTab={(tabName) => setActiveTab(tabName)}
                />
              )}

              {activeTab === 'partner_portal' && (
                <PartnerPortal
                  vehicles={vehicles}
                  selectedVehicle={selectedVehicle}
                  onSelectVehicle={(v) => setSelectedVehicle(v)}
                  onRefreshData={handleRefreshAllDataFromServer}
                  garages={garages}
                />
              )}

              {activeTab === 'admin' && (
                <AdminPanel
                  vehicles={vehicles}
                  records={records}
                  garages={garages}
                />
              )}

              {activeTab === 'forum' && (
                <HelpForum
                  vehicles={vehicles}
                  selectedVehicle={selectedVehicle}
                  onRefreshData={handleRefreshAllDataFromServer}
                  initialCategory={forumPreFilledCategory}
                  onNavigateTab={(tabName) => setActiveTab(tabName)}
                />
              )}

              {activeTab === 'classifieds' && (
                <ClassifiedsMarketplace
                  vehicles={vehicles}
                  selectedVehicle={selectedVehicle}
                  onRefreshData={handleRefreshAllDataFromServer}
                />
              )}

              {activeTab === 'role_forms' && (
                <RoleBasedFormSystem
                  userProfile={userProfile}
                  vehicles={vehicles}
                  records={records}
                  onRefreshData={handleRefreshAllDataFromServer}
                />
              )}

              {activeTab === 'vehicle_powertrains' && (
                <VehicleRegistrationSystem
                  vehicles={vehicles}
                  records={records}
                  onRefreshData={handleRefreshAllDataFromServer}
                />
              )}

              {activeTab === 'quick_service_workspace' && (
                <QuickServiceLogSystem
                  vehicles={vehicles}
                  records={records}
                  activeVehicle={selectedVehicle}
                  onSelectVehicle={(v) => setSelectedVehicle(v)}
                  onAddRecord={handleLogRecordExternal}
                  onNavigateTab={(tabName) => setActiveTab(tabName)}
                />
              )}

              {activeTab === 'coins' && (
                <MyCarCareCoinSystem
                  vehicles={vehicles}
                  records={records}
                  activeUser={userProfile}
                  onRefreshData={handleRefreshAllDataFromServer}
                />
              )}

              {activeTab === 'fix_my_car_bidding' && userProfile && (
                <FixMyCarBiddingModule
                  userProfile={userProfile}
                  vehicles={vehicles}
                  records={records}
                  onAddRecordExternal={handleLogRecordExternal}
                  onRefreshData={handleRefreshAllDataFromServer}
                />
              )}
            </div>
          )}
        </main>
      </div>

      {/* -------------------- POPUP ACTIVE MODALS -------------------- */}

      {/* Modal 1: Register New Vehicle Profile */}
      {showAddVehicleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddVehicleModal(false)}></div>
          <div className="glass rounded-3xl p-6 max-w-md w-full relative z-10 space-y-4 shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-1.5">
                <Car className="w-4.5 h-4.5 text-sky-400" />
                <h3 className="text-base font-bold text-slate-100">Add Vehicle Profile</h3>
              </div>
              <button onClick={() => setShowAddVehicleModal(false)} className="text-slate-400 hover:text-slate-200 cursor-pointer">
                <X className="w-5 h-5 cursor-pointer" />
              </button>
            </div>

            <form onSubmit={handleAddNewVehicle} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Brand / Make</label>
                  <select
                    value={vBrand}
                    onChange={(e) => setVBrand(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 p-2 px-3 text-xs rounded-xl focus:outline-none focus:border-white/20 text-slate-100"
                  >
                    <option value="Toyota" className="bg-slate-900">Toyota</option>
                    <option value="Lexus" className="bg-slate-900">Lexus</option>
                    <option value="Ford" className="bg-slate-900">Ford</option>
                    <option value="Honda" className="bg-slate-900">Honda</option>
                    <option value="Hyundai" className="bg-slate-900">Hyundai</option>
                    <option value="BYD" className="bg-slate-900">BYD</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Model Name</label>
                  <input
                    type="text"
                    value={vModel}
                    onChange={(e) => setVModel(e.target.value)}
                    required
                    placeholder="e.g., Tacoma, Prius, Ranger"
                    className="w-full bg-white/5 border border-white/10 p-2.5 px-3 text-xs rounded-xl focus:outline-none focus:border-white/20 text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Mfg Year</label>
                  <input
                    type="number"
                    value={vYear}
                    onChange={(e) => setVYear(e.target.value)}
                    required
                    placeholder="e.g., 2006"
                    className="w-full bg-white/5 border border-white/10 p-2.5 px-3 text-xs rounded-xl focus:outline-none focus:border-white/20 text-slate-100 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Fuel Type</label>
                  <select
                    value={vFuel}
                    onChange={(e) => setVFuel(e.target.value as any)}
                    className="w-full bg-slate-900 border border-white/10 p-2 px-3 text-xs rounded-xl focus:outline-none focus:border-white/20 text-slate-100"
                  >
                    <option value="Gasoline" className="bg-slate-900">Gasoline</option>
                    <option value="Diesel" className="bg-slate-900">Diesel</option>
                    <option value="Hybrid" className="bg-slate-900">Hybrid</option>
                    <option value="EV" className="bg-slate-900">EV (Electric)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Current Mileage (Odometer in km)</label>
                <input
                  type="number"
                  value={vMileage}
                  onChange={(e) => setVMileage(e.target.value)}
                  required
                  placeholder="e.g., 180000"
                  className="w-full bg-white/5 border border-white/10 p-2.5 px-3 text-xs rounded-xl focus:outline-none focus:border-white/20 text-slate-100 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-white/10 pt-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block">Last Oil Change (km)</label>
                  <input
                    type="number"
                    value={vLastOil}
                    onChange={(e) => setVLastOil(e.target.value)}
                     placeholder="e.g., 175000"
                    className="w-full bg-white/5 border border-white/10 p-2.5 px-3 text-xs rounded-xl focus:outline-none focus:border-white/20 text-slate-100 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block">Last Service Date</label>
                  <input
                    type="date"
                    value={vLastDate}
                    onChange={(e) => setVLastDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 p-2.5 px-3 text-xs rounded-xl focus:outline-none focus:border-white/20 text-slate-100 font-mono"
                  />
                </div>
              </div>

              {/* Informational Prompt check */}
              <div className="bg-black/30 p-3 rounded-lg text-[11px] text-slate-400 flex gap-2 border border-white/5">
                <Sparkles className="w-4 h-4 text-sky-400 shrink-0" />
                <span>
                  Adding profile sends a metadata payload to Gemini to parse weaknesses, checklists & custom warning patterns instantly.
                </span>
              </div>

              <button
                type="submit"
                disabled={addVehicleLoading}
                className="w-full py-3 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-slate-900 text-sm font-semibold rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-sky-500/10"
              >
                {addVehicleLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                    <span>Generating AI Report...</span>
                  </>
                ) : (
                  <span>Register specifications</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Log Maintenance Record Entry */}
      {showLogServiceModal && selectedVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowLogServiceModal(false)}></div>
          <div className="glass rounded-3xl p-6 max-w-md w-full relative z-10 space-y-4 shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-1.5">
                <Wrench className="w-4.5 h-4.5 text-sky-400" />
                <h3 className="text-base font-bold text-slate-100">Log Service Record</h3>
              </div>
              <button onClick={() => setShowLogServiceModal(false)} className="text-slate-400 hover:text-slate-200 cursor-pointer">
                <X className="w-5 h-5 cursor-pointer" />
              </button>
            </div>

            <form onSubmit={handleLogServiceRecord} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Service Category</label>
                  <select
                    value={sCategory}
                    onChange={(e) => setSCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 p-2 px-3 text-xs rounded-xl focus:outline-none focus:border-white/20 text-slate-100"
                  >
                    <option value="Engine Oil Service" className="bg-slate-900">Engine Oil Service</option>
                    <option value="Brake Service" className="bg-slate-900">Brake Service</option>
                    <option value="Tire Service" className="bg-slate-900">Tire Service</option>
                    <option value="Battery Service" className="bg-slate-900">Battery Service</option>
                    <option value="AC Service" className="bg-slate-900">AC Service</option>
                    <option value="EV Service" className="bg-slate-900">EV Service</option>
                    <option value="Full Inspection" className="bg-slate-900">Full Inspection</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Logged Cost (USD)</label>
                  <input
                    type="number"
                    value={sCost}
                    onChange={(e) => setSCost(e.target.value)}
                    required
                    placeholder="e.g., 45"
                    className="w-full bg-white/5 border border-white/10 p-2.5 px-3 text-xs rounded-xl focus:outline-none focus:border-white/20 text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Odometer at log (km)</label>
                  <input
                    type="number"
                    value={sMileage}
                    onChange={(e) => setSMileage(e.target.value)}
                    required
                    placeholder="e.g., 180500"
                    className="w-full bg-white/5 border border-white/10 p-2.5 px-3 text-xs rounded-xl focus:outline-none focus:border-white/20 text-slate-100 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Service Date</label>
                  <input
                    type="date"
                    value={sDate}
                    onChange={(e) => setSDate(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 p-2.5 px-3 text-xs rounded-xl focus:outline-none focus:border-white/20 text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Service Provider (Station)</label>
                <input
                  type="text"
                  value={sProvider}
                  onChange={(e) => setSProvider(e.target.value)}
                  placeholder="e.g., Angkor Tyres Alignment, Apsara Garage"
                  className="w-full bg-white/5 border border-white/10 p-2.5 px-3 text-xs rounded-xl focus:outline-none focus:border-white/20 text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Description / Mechanic Feedback</label>
                <textarea
                  value={sDesc}
                  onChange={(e) => setSDesc(e.target.value)}
                  rows={2}
                  className="w-full bg-white/5 border border-white/10 p-2.5 px-3 text-xs rounded-xl focus:outline-none focus:border-white/20 text-slate-100 resize-none font-sans"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-slate-900 text-sm font-semibold rounded-2xl transition cursor-pointer shadow-lg shadow-sky-500/10"
              >
                Log to History Registry
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Account Settings / Swap active Owner details */}
      {showSettingsModal && userProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSettingsModal(false)}></div>
          <div className="glass rounded-3xl p-6 max-w-sm w-full relative z-10 space-y-4 shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-1.5">
                <Sliders className="w-4.5 h-4.5 text-sky-400" />
                <h3 className="text-base font-bold text-slate-100">User Profile Configuration</h3>
              </div>
              <button onClick={() => setShowSettingsModal(false)} className="text-slate-400 hover:text-slate-200 cursor-pointer">
                <X className="w-5 h-5 cursor-pointer" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase block">Active Username</label>
                <input
                  type="text"
                  value={userProfile.name}
                  onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 p-2 px-3 text-xs rounded-xl text-slate-100 focus:outline-none focus:border-white/20"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase block">Contact Email Address</label>
                <input
                  type="email"
                  value={userProfile.email}
                  disabled
                  className="w-full bg-white/5 border border-white/5 p-2 px-3 text-slate-500 text-xs rounded-xl focus:outline-none cursor-not-allowed"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase block">Phone contact</label>
                <input
                  type="text"
                  value={userProfile.phone}
                  onChange={(e) => setUserProfile({ ...userProfile, phone: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 p-2 px-3 text-xs rounded-xl text-slate-100 focus:outline-none focus:border-white/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block">Active Role</label>
                  <select
                    value={userProfile.role}
                    onChange={(e) => setUserProfile({ ...userProfile, role: e.target.value as any })}
                    className="w-full bg-slate-900 border border-white/10 p-2 px-3 text-xs rounded-xl focus:outline-none text-slate-100"
                  >
                    <option value="Vehicle Owner" className="bg-slate-900">Vehicle Owner</option>
                    <option value="Vehicle Manager" className="bg-slate-900">Vehicle Manager</option>
                    <option value="Driver / Staff" className="bg-slate-900">Driver / Staff</option>
                    <option value="Garage Owner" className="bg-slate-900">Garage Owner</option>
                    <option value="Petrol Station Partner" className="bg-slate-900">Petrol Station Partner</option>
                    <option value="Spare Part Shop" className="bg-slate-900">Spare Part Shop</option>
                    <option value="Admin" className="bg-slate-900">Admin</option>
                    <option value="Freelance Mechanic" className="bg-slate-900">Freelance Mechanic</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block">Target Province</label>
                  <select
                    value={userProfile.location}
                    onChange={(e) => setUserProfile({ ...userProfile, location: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 p-2 px-3 text-xs rounded-xl focus:outline-none text-slate-100"
                  >
                    <option value="Phnom Penh" className="bg-slate-900">Phnom Penh</option>
                    <option value="Siem Reap" className="bg-slate-900">Siem Reap</option>
                    <option value="Battambang" className="bg-slate-900">Battambang</option>
                  </select>
                </div>
              </div>

              {(userProfile.role === "Spare Part Shop" || userProfile.role === "Garage Owner") && (
                <div className="bg-white/5 border border-white/10 p-3 rounded-xl space-y-2 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-sky-400">Multi-Service Mode</span>
                    <input
                      type="checkbox"
                      checked={!!userProfile.isMultiService}
                      onChange={(e) => setUserProfile({ ...userProfile, isMultiService: e.target.checked })}
                      className="rounded border-white/15 text-sky-500 bg-slate-950 h-3.5 w-3.5 cursor-pointer"
                    />
                  </div>
                  {userProfile.isMultiService && (
                    <div className="text-[9px] text-slate-400 space-y-1">
                      <span className="font-bold text-slate-350 block">Activated Modules:</span>
                      <div className="grid grid-cols-2 gap-1 max-h-[85px] overflow-y-auto pr-1">
                        {[
                          "Spare Parts Shop Module",
                          "Garage / Repair Shop Module",
                          "Mini POS Module",
                          "Inventory / Stock Control Module",
                          "Service Ticket Module",
                          "Vehicle Maintenance Log Module",
                          "Marketplace Seller Module",
                          "Supplier / Purchase Order Module",
                          "Warranty Module",
                          "Reports Module"
                        ].map((m) => {
                          const modules = userProfile.activatedModules || [];
                          const isChecked = modules.includes(m);
                          return (
                            <label key={m} className="flex items-center gap-1 cursor-pointer hover:text-slate-200 select-none">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  const updated = isChecked
                                    ? modules.filter(x => x !== m)
                                    : [...modules, m];
                                  setUserProfile({ ...userProfile, activatedModules: updated });
                                }}
                                className="rounded border-white/15 text-sky-500 bg-slate-950 h-3 w-3 cursor-pointer"
                              />
                              <span className={isChecked ? "text-sky-300 font-medium" : "text-slate-400"}>{m.replace(" Module", "")}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <p className="text-[10px] text-slate-400 italic leading-relaxed text-center">
                Review permissions for Cambodia maintenance platform. Modifying role updates simulation filters live.
              </p>

              <button
                onClick={() => setShowSettingsModal(false)}
                className="w-full py-2.5 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-slate-900 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-lg"
              >
                <Check className="w-4 h-4" />
                <span>Save user metadata</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer credits and disclaimers */}
      <footer className="bg-black/10 border-t border-white/5 py-8 px-6 text-center text-slate-500 text-xs mt-12 space-y-2 rounded-t-3xl backdrop-blur-md">
        <p>© 2026 MyVehicle Care. Proudly tailored for Cambodia vehicle maintenance safety.</p>
        <p className="text-[10px] leading-relaxed max-w-2xl mx-auto">
          Disclaimer: AI diagnosis answers provide educational guidelines. High-voltage EV systems, complex brake machining, and suspension upgrades should only be executed by accredited professional mechanics.
        </p>
      </footer>
    </div>
  );
}
