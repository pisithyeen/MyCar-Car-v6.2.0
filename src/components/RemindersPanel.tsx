import React, { useState, useEffect } from "react";
import { 
  Bell, 
  Plus, 
  Trash2, 
  Clock, 
  Check, 
  RotateCcw, 
  Sparkles, 
  AlertTriangle, 
  Calendar, 
  Gauge, 
  Settings, 
  MessageSquare, 
  Volume2, 
  ShieldAlert, 
  Loader2, 
  Eye, 
  Sliders, 
  CheckCircle2, 
  History, 
  ChevronRight,
  RefreshCw,
  Info,
  QrCode,
  Tag,
  Compass,
  AlertCircle,
  Megaphone,
  User,
  Wrench,
  X,
  Smartphone,
  Mail,
  MessageCircle,
  Database,
  UserCheck,
  Send,
  Building,
  Activity,
  Award,
  BookOpen,
  XCircle,
  HelpCircle,
  MapPin,
  Flame,
  CheckCircle,
  EyeOff,
  UserX
} from "lucide-react";
import { VehicleProfile, SmartReminder, NotificationLog, MaintenanceRecord } from "../types";
import {
  hasEvBatteryAndCharging,
  hasElectricChargingPlug,
  hasPetrolSystem,
  isPureEV,
  hasDieselSystem,
  hasLpgCngSystem
} from "../utils/compatibility";

const REMINDER_CATEGORIES = [
  "Engine Oil Change",
  "Oil Filter",
  "Air Filter",
  "Brake Check",
  "Tire Check",
  "Tire Rotation",
  "Battery Check",
  "Coolant Check",
  "Transmission Oil",
  "Car Wash",
  "Full Inspection",
  "Insurance Renewal",
  "Road Tax Renewal",
  "EV Battery Health Check",
  "EV Charging System Check",
  "Road Trip Inspection",
  "Custom Reminder"
];

// Interactive trigger scenarios matching the 13 required trigger points in the specification
const TRIGGER_SCENARIOS = [
  { value: 'maintenance_due', label: '1. Scheduled Maintenance Due Alert', desc: 'Notify that service is due in 500 km or 7 days' },
  { value: 'custom_alarm', label: '2. User Custom Manual Alarm', desc: 'Trigger manual user-created check schedule warning' },
  { value: 'garage_suggested', label: '3. Garage Post-Service Recommendation', desc: 'Suggestion for next service (requires Owner approval)' },
  { value: 'qr_code_scanned', label: '4. QR Code scanned: Live Service record proposal', desc: 'Proposed log by garage (requires review & approval)' },
  { value: 'global_risk', label: '5. Global Car Health Alert (Car DNA)', desc: 'Risk awareness notice based on year/model data' },
  { value: 'recall_alert', label: '6. Manufacturer Recall Safety Alert', desc: 'Recall alert warning matching safety critical (VIN verification)' },
  { value: 'booking_update', label: '7. Booking & Appointment update', desc: 'Confirmed booking scheduled details' },
  { value: 'service_status', label: '8. Service progress status update', desc: 'Estimate review required before commencing repairs' },
  { value: 'marketplace_offer', label: '9. Parts Marketplace Activity Log', desc: 'New barter proposal or offer received' },
  { value: 'forum_reply', label: '10. help forum responder comment alert', desc: 'Community answer or mechanic offer' },
  { value: 'admin_broadcast', label: '11. Admin broadcast system alert', desc: 'Advisory alert pushed to target model owners' },
  { value: 'weather_alert', label: '12. Cambodia Monsoon Driving Condition alert', desc: 'Rainy season checks, float/flooding warnings' }
];

interface RemindersPanelProps {
  vehicles: VehicleProfile[];
  selectedVehicle: VehicleProfile | null;
  onSelectVehicle: (v: VehicleProfile) => void;
  records: MaintenanceRecord[];
}

export default function RemindersPanel({ 
  vehicles, 
  selectedVehicle, 
  onSelectVehicle,
  records 
}: RemindersPanelProps) {
  // Navigation & Role Play Settings inside Notification Module
  const [activeRole, setActiveRole] = useState<'owner' | 'garage' | 'admin' | 'fleet'>('owner');
  const [filterSegment, setFilterSegment] = useState<'all' | 'maintenance' | 'safety' | 'garage' | 'booking' | 'marketplace' | 'forum' | 'admin' | 'custom'>('all');

  // Master State Hooks
  const [reminders, setReminders] = useState<SmartReminder[]>([]);
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);

  // Sound and monsoon flags
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [monsoonSafeguards, setMonsoonSafeguards] = useState(true);

  // Settings State matching user_notification_settings fields
  const [settings, setSettings] = useState({
    pushEnabled: true,
    emailEnabled: true,
    smsEnabled: false,
    telegramEnabled: true,
    maintenanceEnabled: true,
    garageEnabled: true,
    bookingEnabled: true,
    marketplaceEnabled: true,
    forumEnabled: true,
    safetyAlertEnabled: true,
    adminAnnouncementEnabled: true,
    customAlarmEnabled: true,
    quietHoursStart: "22:00",
    quietHoursEnd: "07:00",

    // Telegram connection states
    telegramConnected: false,
    telegramChatId: null as string | null,
    telegramUsername: null as string | null,
    telegramConnectedAt: null as string | null,
    verificationToken: "KH-9901" as string | null,

    allowMaintenanceReminders: true,
    allowGarageServiceUpdates: true,
    allowInvoiceNotifications: true,
    allowQuotationRequests: true,
    allowWarrantyReminders: true,
    allowGaragePromotions: true,
    allowEmergencyAlerts: true
  });

  const [telegramStatus, setTelegramStatus] = useState<any>({
    settings: {},
    connections: [],
    permissions: []
  });

  const [settingsViewTab, setSettingsViewTab] = useState<'channels' | 'telegram_setup' | 'garages'>('channels');
  const [telegramBotInput, setTelegramBotInput] = useState('');
  const [telegramBotReplies, setTelegramBotReplies] = useState<{ sender: 'bot' | 'user', text: string, timestamp: string }[]>([
    { sender: 'bot', text: '🇰🇭 MyCar Care KH Telegram Bot\n\nWelcome! Type /help to view commands. To link your client account, key in:\n/start [your-app-token]', timestamp: "16:40:03" }
  ]);
  const [generatingToken, setGeneratingToken] = useState(false);

  // Modal Controllers
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showSafetyWarning, setShowSafetyWarning] = useState(false);
  const [snoozingNotif, setSnoozingNotif] = useState<NotificationLog | null>(null);
  const [snoozeDays, setSnoozeDays] = useState("7");
  const [snoozeMileage, setSnoozeMileage] = useState("1000");
  const [snoozeDate, setSnoozeDate] = useState("");
  const [snoozeType, setSnoozeType] = useState<'days' | 'mileage' | 'date'>('days');

  // Custom Alarm Form states (Original structural fields + extra specifications)
  const [formCategory, setFormCategory] = useState<string>("Engine Oil Change");
  const [formTitle, setFormTitle] = useState<string>("");
  const [formType, setFormType] = useState<'date_based' | 'mileage_based' | 'date_and_mileage' | 'repeating' | 'custom'>("date_based");
  const [formDueDate, setFormDueDate] = useState<string>("");
  const [formDueMileage, setFormDueMileage] = useState<string>("");
  const [formRepeat, setFormRepeat] = useState<'none' | 'daily' | 'weekly' | 'monthly' | 'every_3_months' | 'every_6_months' | 'yearly' | 'custom'>("none");
  const [formTime, setFormTime] = useState<string>("09:00");
  const [formPriority, setFormPriority] = useState<'Low' | 'Medium' | 'High' | 'Emergency'>("Medium");
  const [formNotes, setFormNotes] = useState<string>("");
  const [formChannel, setFormChannel] = useState<'In-App' | 'Push' | 'Telegram' | 'Email'>("In-App");

  // Trigger scenario custom logs
  const [selectedScenario, setSelectedScenario] = useState('maintenance_due');
  const [scenarioCustomText, setScenarioCustomText] = useState('');
  const [triggeringLoading, setTriggeringLoading] = useState(false);

  // Garage Dashboard forms
  const [garageCustomerPhone, setGarageCustomerPhone] = useState('');
  const [garageServiceType, setGarageServiceType] = useState('Engine Oil Change');
  const [garageRecommendMileage, setGarageRecommendMileage] = useState('5000');
  const [garageRecommendMonths, setGarageRecommendMonths] = useState('3');
  const [garageMarketingCheck, setGarageMarketingCheck] = useState(false);
  const [garageSuccessMsg, setGarageSuccessMsg] = useState('');

  // Admin Dashboard templates & broadcasts
  const [adminBroadcastCategory, setAdminBroadcastCategory] = useState('admin');
  const [adminBroadcastTitle, setAdminBroadcastTitle] = useState('');
  const [adminBroadcastMessage, setAdminBroadcastMessage] = useState('');
  const [adminCohortTarget, setAdminCohortTarget] = useState('all'); // all, brand, city, ev, petrol
  const [adminSuccessMsg, setAdminSuccessMsg] = useState('');

  // Milestone Odometer Interval states
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditMessage, setAuditMessage] = useState<string | null>(null);
  const [notifyingMilestoneKey, setNotifyingMilestoneKey] = useState<string | null>(null);

  // Browser Push Notification Center & Simulator States
  const [activePushFilter, setActivePushFilter] = useState<'all' | 'urgent' | 'routine'>('all');
  const [livePushToast, setLivePushToast] = useState<{ title: string; message: string; priority: 'Low' | 'Medium' | 'High' | 'Critical'; id: string } | null>(null);
  const [simulatedPushCategory, setSimulatedPushCategory] = useState<string>("Engine Oil Change");
  const [simulatedPushTitle, setSimulatedPushTitle] = useState<string>("");
  const [simulatedPushMessage, setSimulatedPushMessage] = useState<string>("");
  const [simulatedPushPriority, setSimulatedPushPriority] = useState<'Low' | 'Medium' | 'High' | 'Critical'>("High");
  const [simulatedPushLoading, setSimulatedPushLoading] = useState(false);

  // Loaded reminders & notifications synchronizer
  useEffect(() => {
    fetchRemindersAndNotifications();
    fetchNotificationSettings();
    fetchTelegramStatus();
  }, [selectedVehicle, records]);

  // Live browser push toast auto-dismiss timer (8 seconds)
  useEffect(() => {
    if (livePushToast) {
      const timer = setTimeout(() => {
        setLivePushToast(null);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [livePushToast]);

  const fetchRemindersAndNotifications = async () => {
    if (!selectedVehicle) return;
    setLoading(true);
    try {
      const [remRes, notRes] = await Promise.all([
        fetch(`/api/reminders/${selectedVehicle.id}`),
        fetch(`/api/notifications?vehicleId=${selectedVehicle.id}`)
      ]);

      if (remRes.ok) {
        const remData = await remRes.json();
        setReminders(remData);
      }
      if (notRes.ok) {
        const notData = await notRes.json();
        setNotifications(notData);
      }
    } catch (err) {
      console.error("Failed to load reminders or logs:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotificationSettings = async () => {
    try {
      const res = await fetch("/api/notifications/settings");
      if (res.ok) {
        const settingsData = await res.json();
        setSettings(prev => ({ ...prev, ...settingsData }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTelegramStatus = async () => {
    try {
      const res = await fetch("/api/telegram/status");
      if (res.ok) {
        const data = await res.json();
        setTelegramStatus(data);
        setSettings(prev => ({ ...prev, ...data.settings }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateSettingsAPI = async (newSettings: typeof settings) => {
    try {
      const res = await fetch("/api/notifications/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSettings)
      });
      if (res.ok) {
        const saved = await res.json();
        setSettings(prev => ({ ...prev, ...saved }));
        // keep the telegramStatus sync
        fetchTelegramStatus();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerateTelegramToken = async () => {
    setGeneratingToken(true);
    try {
      const res = await fetch("/api/telegram/generate-token", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setSettings(prev => ({ ...prev, verificationToken: data.token }));
        playChime('success');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingToken(false);
    }
  };

  const handleSendSimulatedBotCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    const commandText = telegramBotInput.trim();
    if (!commandText) return;

    // Append user's command to chat
    setTelegramBotReplies(prev => [...prev, {
      sender: 'user',
      text: commandText,
      timestamp: new Date().toLocaleTimeString()
    }]);
    setTelegramBotInput('');

    try {
      const res = await fetch("/api/telegram/simulate-bot-command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: commandText })
      });
      if (res.ok) {
        const data = await res.json();
        
        // play sound based on outcome
        playChime('success');
        
        // append bot reply
        setTelegramBotReplies(prev => [...prev, {
          sender: 'bot',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString()
        }]);

        // Refresh statuses
        fetchTelegramStatus();
        fetchRemindersAndNotifications();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleBlockGarage = async (garageId: string) => {
    try {
      const res = await fetch("/api/telegram/toggle-block-garage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ garageId })
      });
      if (res.ok) {
        playChime('alert');
        fetchTelegramStatus();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReportSpam = async (garageId: string) => {
    try {
      const res = await fetch("/api/telegram/report-spam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ garageId })
      });
      if (res.ok) {
        playChime('error');
        fetchTelegramStatus();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Synthesize acoustic diagnostic chime sounds
  const playChime = (type: 'success' | 'alert' | 'error') => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'success') {
        osc.type = "sine";
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2); // G5
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
      } else if (type === 'alert') {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(392, audioCtx.currentTime); // G4
        osc.frequency.setValueAtTime(293.66, audioCtx.currentTime + 0.15); // D4
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      } else {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(150, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
      }
    } catch (ae) {
      console.warn("AudioContext block by sandbox constraints", ae);
    }
  };

  // Handle setting updates
  const handleSettingToggle = (field: keyof typeof settings, value: boolean) => {
    if (field === 'safetyAlertEnabled' && value === false) {
      // Intercept with safety warning dialog!
      setShowSafetyWarning(true);
      return;
    }

    const updated = { ...settings, [field]: value };
    setSettings(updated);
    updateSettingsAPI(updated);
    playChime('success');
  };

  const confirmSafetyDisable = () => {
    const updated = { ...settings, safetyAlertEnabled: false };
    setSettings(updated);
    updateSettingsAPI(updated);
    setShowSafetyWarning(false);
    playChime('alert');
  };

  // Create manual user-created custom alarm
  const handleCreateReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle) return;

    const payload = {
      vehicleId: selectedVehicle.id,
      title: formTitle || `${formCategory} Alarm`,
      category: formCategory,
      reminderType: formType,
      dueDate: (formType === 'date_based' || formType === 'date_and_mileage' || formType === 'repeating') ? formDueDate : undefined,
      dueMileage: (formType === 'mileage_based' || formType === 'date_and_mileage') ? Number(formDueMileage) : undefined,
      repeatType: formType === 'repeating' ? formRepeat : undefined,
      notificationTime: formTime,
      description: formNotes || `User custom reminder logged. Channel: ${formChannel}`,
      priority: formPriority,
      isAiSuggested: false
    };

    try {
      const res = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        // Automatically trigger in-app custom reminder preview to mimic push integration
        await fetch("/api/notifications/trigger-event", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventType: 'custom_alarm',
            vehicleId: selectedVehicle.id,
            customTitle: `⏰ Custom Alarm Trigger: ${payload.title}`,
            customMessage: `Time: ${payload.notificationTime} | Repeat: ${payload.repeatType}. Notes: ${payload.description}`
          })
        });

        setShowCreateForm(false);
        resetForm();
        fetchRemindersAndNotifications();
        playChime('success');
      }
    } catch (err) {
      console.error("Failed to save reminder:", err);
    }
  };

  const resetForm = () => {
    setFormCategory("Engine Oil Change");
    setFormTitle("");
    setFormType("date_based");
    setFormDueDate("");
    setFormDueMileage("");
    setFormRepeat("none");
    setFormTime("09:00");
    setFormPriority("Medium");
    setFormNotes("");
    setFormChannel("In-App");
  };

  // AI suggestion generator
  const handleRequestAiSuggestions = async () => {
    if (!selectedVehicle) return;
    setAiLoading(true);
    setAiSuggestions([]);
    try {
      const response = await fetch("/api/ai/reminder-suggestion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicleId: selectedVehicle.id })
      });
      if (response.ok) {
        const data = await response.json();
        setAiSuggestions(data);
        playChime('success');
      }
    } catch (err) {
      console.error("AI Suggestions request failed:", err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleActivateAiReminder = async (sug: any) => {
    if (!selectedVehicle) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId: selectedVehicle.id,
          title: sug.title,
          category: sug.category,
          reminderType: sug.reminderType,
          dueDate: sug.dueDate,
          dueMileage: sug.dueMileage,
          priority: sug.priority,
          description: sug.description,
          isAiSuggested: true
        })
      });

      if (res.ok) {
        setAiSuggestions(prev => prev.filter(s => s.title !== sug.title));
        fetchRemindersAndNotifications();
        playChime('success');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  // Action methods on notification logs
  const handleMarkNotifRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "POST" });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: 'read' } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearNotifications = async () => {
    try {
      await fetch("/api/notifications/clear", { method: "POST" });
      setNotifications([]);
      playChime('alert');
    } catch (err) {
      console.error(err);
    }
  };

  const handleSnoozeInitiate = (notif: NotificationLog) => {
    setSnoozingNotif(notif);
    setSnoozeDays("7");
    setSnoozeMileage("1000");
    setSnoozeDate("");
    setSnoozeType('days');
  };

  const handleSnoozeConfirm = async () => {
    if (!snoozingNotif) return;
    try {
      const bodyPayload = {
        snoozeDays: snoozeType === 'days' ? snoozeDays : undefined,
        snoozeMileage: snoozeType === 'mileage' ? snoozeMileage : undefined,
        snoozeUntil: snoozeType === 'date' ? snoozeDate : undefined,
      };

      const res = await fetch(`/api/notifications/${snoozingNotif.id}/snooze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload)
      });

      if (res.ok) {
        setSnoozingNotif(null);
        fetchRemindersAndNotifications();
        playChime('success');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveProposal = async (notif: NotificationLog) => {
    try {
      const res = await fetch(`/api/notifications/${notif.id}/approve`, {
        method: "POST"
      });
      if (res.ok) {
        playChime('success');
        fetchRemindersAndNotifications();
        alert(`Success! Pushed record approved and synced directly inside permanent vehicle database.`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRejectProposal = async (notif: NotificationLog) => {
    try {
      const res = await fetch(`/api/notifications/${notif.id}/reject`, {
        method: "POST"
      });
      if (res.ok) {
        playChime('alert');
        fetchRemindersAndNotifications();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteNotificationLocal = (id: string) => {
    // Standard delete simulator
    setNotifications(prev => prev.filter(n => n.id !== id));
    playChime('alert');
  };

  // Trigger Event Simulator tool action
  const handleTriggerSimulatedAlert = async () => {
    if (!selectedVehicle) return;
    setTriggeringLoading(true);
    try {
      const response = await fetch("/api/notifications/trigger-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: selectedScenario,
          vehicleId: selectedVehicle.id,
          text: scenarioCustomText || undefined
        })
      });

      if (response.ok) {
        setScenarioCustomText('');
        playChime('alert');
        fetchRemindersAndNotifications();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTriggeringLoading(false);
    }
  };

  // Garage Dashboard push action
  const handleGaragePushReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle) return;
    
    // Simulate finding customer vehicle and sending high-fidelity suggestion
    setGarageSuccessMsg('');
    const monthsNum = Number(garageRecommendMonths);
    const mileageNum = Number(garageRecommendMileage);
    
    try {
      const targetDate = new Date();
      targetDate.setMonth(targetDate.getMonth() + monthsNum);
      const formattedDate = targetDate.toISOString().split('T')[0];

      await fetch("/api/notifications/trigger-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: 'garage_suggested',
          vehicleId: selectedVehicle.id,
          text: `Jet Garage recommend scheduling next ${garageServiceType} limit at ${((selectedVehicle.mileage || 180000) + mileageNum).toLocaleString()} km (~${formattedDate} target). Heavy Phnom Penh stop-start traffic reduces performance by 15%. Direct validation recommended.${garageMarketingCheck ? ' (Promo applied: Free synthetic engine washer included!)' : ''}`
        })
      });

      setGarageSuccessMsg(`Successfully queued recommendation to user's phone for review! Customers must approve suggesting record before scheduled alarm creation.`);
      playChime('success');
      fetchRemindersAndNotifications();
      
      // clear status after timeout
      setTimeout(() => setGarageSuccessMsg(''), 5000);
    } catch (e) {
      console.error(e);
    }
  };

  // Admin announcement broadcast proposal
  const handleAdminBroadcastAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle) return;
    setAdminSuccessMsg('');

    try {
      let customTitleStr = adminBroadcastTitle || `📢 Admin Broadcast Advisory`;
      if (adminCohortTarget === 'ev') {
        customTitleStr = `⚡ EV Health Advisory: Charging Protocol Updates`;
      } else if (adminCohortTarget === 'brand') {
        customTitleStr = `🔧 Toyota Owners System Check: Dust Filters Advisory`;
      }

      await fetch("/api/notifications/trigger-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: 'admin_broadcast',
          vehicleId: selectedVehicle.id,
          customTitle: customTitleStr,
          customMessage: adminBroadcastMessage || `Flood advisory from system admin: High moisture and road salt can cause brake pad decay and chassis frame contamination. Plan a clean high-pressure spray bath immediately.`
        })
      });

      setAdminSuccessMsg(`Successfully broadcasted alert! Target cohort [${adminCohortTarget.toUpperCase()}] queued. Delivery report successfully cached in logging logs.`);
      playChime('success');
      fetchRemindersAndNotifications();
      
      // clear status
      setTimeout(() => setAdminSuccessMsg(''), 5500);
      setAdminBroadcastTitle('');
      setAdminBroadcastMessage('');
    } catch (e) {
      console.error(e);
    }
  };

  // Dispatch simulated web browser push notification
  const handleDispatchPushNotification = async (titleOverride?: string, messageOverride?: string, priorityOverride?: 'Low' | 'Medium' | 'High' | 'Critical') => {
    if (!selectedVehicle) return;
    setSimulatedPushLoading(true);

    const title = titleOverride || simulatedPushTitle || `🔧 Maintenance Check Recommended`;
    const message = messageOverride || simulatedPushMessage || `A standard scheduled maintenance assessment is due for your vehicle. Monitor fluids and filters carefully under hot dusty Cambodia roads.`;
    const priority = priorityOverride || simulatedPushPriority;

    try {
      const res = await fetch("/api/notifications/trigger-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: 'custom_push',
          vehicleId: selectedVehicle.id,
          customTitle: title,
          customMessage: message,
          channel: 'Push',
          priority: priority,
          category: 'maintenance'
        })
      });

      if (res.ok) {
        const data = await res.json();
        const notification = data.notification || { id: `push-${Date.now()}`, title, message, priority };
        
        // Trigger live browser toast mock popup
        setLivePushToast({
          id: notification.id,
          title: notification.title,
          message: notification.message,
          priority: notification.priority || priority
        });

        // Play alert sound
        playChime(priority === 'High' || priority === 'Critical' ? 'alert' : 'success');

        // Clear custom inputs
        if (!titleOverride) {
          setSimulatedPushTitle("");
          setSimulatedPushMessage("");
        }

        // Reload lists
        fetchRemindersAndNotifications();
      }
    } catch (err) {
      console.error("Failed to trigger simulated push alert", err);
    } finally {
      setSimulatedPushLoading(false);
    }
  };

  // Seed standard browser push alerts
  const handleAutoSeedPushNotifications = async () => {
    if (!selectedVehicle) return;
    const presets = [
      {
        title: "🚨 Critical: Engine Oil Pressure Low",
        message: "Cambodia high-heat driving limits reached. Motor oil viscosity under minimum thresholds. Immediate replacement recommended to avoid high DNA engine scoring.",
        priority: "Critical" as const
      },
      {
        title: "🚨 Urgent: Front Brake Pads Inspection Required",
        message: "Odometer warning limits triggered. Heavy mud and fine road grit in rainy season has eroded pad materials to critical 2.5mm depth.",
        priority: "High" as const
      },
      {
        title: "📅 Routine: 10,000 km Tire Rotation Check",
        message: "Even tyre tread degradation check is due to sustain safe Cambodia highway traction. Schedule rapid tire rotation and wheel geometry alignment check.",
        priority: "Medium" as const
      },
      {
        title: "📅 Routine: Windshield Wiper Blade Swap",
        message: "Pre-Monsoon safety check: Rubber wipers drying out due to harsh Phnom Penh solar exposure. Swap blades to secure wet-weather driving clarity.",
        priority: "Low" as const
      },
      {
        title: "🚨 Critical: EV Hybrid Fan Filter Saturation",
        message: "High temperature alarm. Dust and fine Cambodia silt clogging rear ventilation grills of your high voltage battery compartment. Clean instantly to avoid overheating.",
        priority: "Critical" as const
      }
    ];

    try {
      for (const item of presets) {
        await fetch("/api/notifications/trigger-event", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventType: 'custom_push',
            vehicleId: selectedVehicle.id,
            customTitle: item.title,
            customMessage: item.message,
            channel: 'Push',
            priority: item.priority,
            category: 'maintenance'
          })
        });
      }
      playChime('success');
      fetchRemindersAndNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  // Filter alarms checklist
  const filteredAlarms = reminders.filter(r => {
    // Alarms must be visible custom settings or alerts
    return r.status !== 'Completed';
  });

  // Filter Notifications list segment matching category tab
  const segmentNotifications = notifications.filter(n => {
    if (filterSegment === 'all') return true;
    return n.category === filterSegment;
  });

  const getPriorityColorBadge = (priority?: string) => {
    switch (priority) {
      case 'Low':
        return 'bg-slate-400/10 text-slate-400 border-slate-400/20';
      case 'Medium':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
      case 'High':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Critical':
      case 'Emergency':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse font-extrabold';
      default:
        return 'bg-slate-500/10 text-slate-300 border-slate-500/20';
    }
  };

  const getCategoryIcon = (cat?: string) => {
    switch (cat) {
      case 'maintenance':
        return <Wrench className="w-4 h-4 text-emerald-400" />;
      case 'safety':
        return <ShieldAlert className="w-4 h-4 text-rose-400" />;
      case 'garage':
        return <Building className="w-4 h-4 text-sky-400" />;
      case 'booking':
        return <Calendar className="w-4 h-4 text-violet-400" />;
      case 'marketplace':
        return <Tag className="w-4 h-4 text-amber-400" />;
      case 'forum':
        return <MessageSquare className="w-4 h-4 text-cyan-400" />;
      case 'admin':
        return <Megaphone className="w-4 h-4 text-pink-400" />;
      case 'custom':
        return <Clock className="w-4 h-4 text-purple-400" />;
      default:
        return <Bell className="w-4 h-4 text-slate-300" />;
    }
  };

  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  return (
    <div className="space-y-6 text-slate-200">
      
      {/* HEADER SECTION WITH HERO CARD */}
      <div className="glass rounded-3xl p-6 relative overflow-hidden border border-white/5 shadow-2xl">
        <div className="absolute right-0 top-0 w-80 h-80 bg-sky-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute left-1/4 bottom-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sky-400 text-xs font-semibold tracking-wider uppercase bg-sky-500/5 px-3 py-1 rounded-full w-max border border-sky-500/10">
              <ShieldAlert className="w-3.5 h-3.5 animate-pulse" />
              <span>Smart Notification & Vehicle Alert System</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Care Alert Center
            </h1>
            <p className="text-slate-300 text-xs md:text-sm max-w-3xl leading-relaxed mt-1">
              MyCar Care Alert Center integrates safety-critical warnings, owner customizable millisecond alarms, manufacturer recall registries, and Cambodia-adapted flash water warnings. Check logs or test scenarios instantly.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                resetForm();
                setShowCreateForm(!showCreateForm);
              }}
              className="px-4 py-2.5 bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 font-bold text-xs text-slate-950 rounded-xl flex items-center gap-2 transition duration-200 shadow-md transform hover:scale-[1.01] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{showCreateForm ? "Cancel Form" : "Create Custom Alarm"}</span>
            </button>
            
            <button
              onClick={handleRequestAiSuggestions}
              disabled={aiLoading}
              className="px-4 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-sky-400 font-bold text-xs rounded-xl flex items-center gap-2 transition active:scale-95 disabled:opacity-55 cursor-pointer"
            >
              {aiLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 text-sky-400" />
              )}
              <span>AI Suggestions</span>
            </button>
          </div>
        </div>

        {/* Selected vehicle fast picker line */}
        {vehicles.length > 0 && selectedVehicle && (
          <div className="mt-6 p-3 bg-white/3 border border-white/5 rounded-2xl flex items-center justify-between gap-4 flex-wrap text-xs">
            <div className="flex items-center gap-3">
              <span className="text-slate-400 font-medium">Monitoring Vehicle:</span>
              <select
                value={selectedVehicle.id}
                onChange={(e) => {
                  const found = vehicles.find(v => v.id === e.target.value);
                  if (found) onSelectVehicle(found);
                }}
                className="bg-slate-900 border border-white/10 p-1.5 px-3 rounded-lg text-xs font-semibold text-sky-300 focus:outline-none cursor-pointer focus:border-sky-500/40"
              >
                {vehicles.map(v => (
                  <option key={v.id} value={v.id} className="bg-slate-950 text-slate-200">
                    {v.brand} {v.model} ({v.year})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-5 text-slate-300 font-mono">
              <div className="flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-slate-500" />
                <span>Odometer: <strong className="text-white">{(selectedVehicle.mileage || 0).toLocaleString()} km</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-500" />
                <span>Last Service: <strong className="text-white">{selectedVehicle.lastServiceDate || 'Not Logged'}</strong></span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* PERSISTENT SYSTEM PROFILE SWAPPER PORTAL */}
      <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span>Interactive Simulator Role-Play</span>
          </div>
          <span className="text-[10px] text-slate-400 block">Switch profile roles below to test distinct dashboards and approvals</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => { setActiveRole('owner'); playChime('success'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 border cursor-pointer ${
              activeRole === 'owner' 
                ? 'bg-sky-500/10 border-sky-500/30 text-sky-400' 
                : 'bg-white/3 border-transparent hover:bg-white/5 text-slate-400'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Car Owner</span>
          </button>

          <button
            onClick={() => { setActiveRole('garage'); playChime('success'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 border cursor-pointer ${
              activeRole === 'garage' 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : 'bg-white/3 border-transparent hover:bg-white/5 text-slate-400'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Garage Shop</span>
          </button>

          <button
            onClick={() => { setActiveRole('admin'); playChime('success'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 border cursor-pointer ${
              activeRole === 'admin' 
                ? 'bg-pink-500/10 border-pink-500/30 text-pink-400' 
                : 'bg-white/3 border-transparent hover:bg-white/5 text-slate-400'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>System Admin</span>
          </button>

          <button
            onClick={() => { setActiveRole('fleet'); playChime('success'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 border cursor-pointer ${
              activeRole === 'fleet' 
                ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' 
                : 'bg-white/3 border-transparent hover:bg-white/5 text-slate-400'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Company Fleet</span>
          </button>
        </div>
      </div>

      {/* AUDIO AND TRIGGER CONTROLLER STRIP */}
      <div className="bg-slate-900/40 p-3.5 border border-white/5 rounded-2xl flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-slate-400 cursor-pointer">
            <input 
              type="checkbox" 
              checked={soundEnabled}
              onChange={(e) => setSoundEnabled(e.target.checked)}
              className="rounded bg-slate-900 border-white/10 text-sky-500 cursor-pointer focus:ring-0" 
            />
            <Volume2 className="w-4 h-4 text-sky-400 shrink-0" />
            <span>Sound Effects active</span>
          </label>
          <span className="text-slate-600">|</span>
          <label className="flex items-center gap-1.5 text-slate-400 cursor-pointer">
            <input 
              type="checkbox" 
              checked={monsoonSafeguards}
              onChange={(e) => setMonsoonSafeguards(e.target.checked)}
              className="rounded bg-slate-900 border-white/10 text-sky-500 cursor-pointer focus:ring-0" 
            />
            <Compass className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Monsoon safety adaptive offset (-15%)</span>
          </label>
        </div>

        <div className="text-[11px] text-slate-400 font-mono py-0.5 px-2 bg-white/5 rounded-lg border border-white/5">
          <span>Simulation Mode Time: <strong className="text-emerald-400 font-bold">2026-05-29 UTC</strong></span>
        </div>
      </div>

      {/* TWO COLUMN GRID MAIN VIEW LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COMPACT COLUMN: ALARMS LIST & SPECIALIZED VIEWS */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* CUSTOM ALARM CREATION FORM BLOCK */}
          {showCreateForm && (
            <div className="glass rounded-3xl p-6 border border-sky-500/20 shadow-xl relative">
              <div className="absolute right-3 top-3">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
                <Clock className="text-sky-400 w-5 h-5" />
                <h3 className="text-sm font-extrabold text-white tracking-wide uppercase">New Custom Vehicle Alarm</h3>
              </div>

              <form onSubmit={handleCreateReminder} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold">Alarm Title</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Check Tire Air Pressure"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full bg-slate-950 p-2.5 rounded-xl border border-white/10 text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold">Service Type / Category</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full bg-slate-950 p-2.5 rounded-xl border border-white/10 text-slate-300 focus:outline-none focus:border-sky-500"
                    >
                      {REMINDER_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1 col-span-1 md:col-span-1">
                    <label className="text-slate-400 font-semibold">Alarm Type</label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value as any)}
                      className="w-full bg-slate-950 p-2.5 rounded-xl border border-white/10 text-slate-300 focus:outline-none"
                    >
                      <option value="date_based">Date Only</option>
                      <option value="mileage_based">Odometer Limit</option>
                      <option value="date_and_mileage">Date & Mileage (Whichever first)</option>
                      <option value="repeating">Repeating Interval</option>
                    </select>
                  </div>

                  {formType !== 'mileage_based' && (
                    <div className="space-y-1">
                      <label className="text-slate-400 font-semibold">Due Target Date</label>
                      <input 
                        type="date"
                        required={formType !== 'mileage_based'}
                        value={formDueDate}
                        onChange={(e) => setFormDueDate(e.target.value)}
                        className="w-full bg-slate-950 p-2.5 rounded-xl border border-white/10 text-white focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  )}

                  {formType !== 'date_based' && (
                    <div className="space-y-1">
                      <label className="text-slate-400 font-semibold">Due Target Mileage (km)</label>
                      <input 
                        type="number"
                        required={formType !== 'date_based'}
                        placeholder="e.g. 185000"
                        value={formDueMileage}
                        onChange={(e) => setFormDueMileage(e.target.value)}
                        className="w-full bg-slate-950 p-2.5 rounded-xl border border-white/10 text-white focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  )}
                </div>

                {formType === 'repeating' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/3 p-3.5 rounded-2xl border border-white/5">
                    <div className="space-y-1">
                      <label className="text-slate-400 font-semibold">How often should this repeat?</label>
                      <select
                        value={formRepeat}
                        onChange={(e) => setFormRepeat(e.target.value as any)}
                        className="w-full bg-slate-950 p-2 rounded-lg border border-white/10 text-slate-300"
                      >
                        <option value="none">One time (No Repeat)</option>
                        <option value="daily">Every Day</option>
                        <option value="weekly">Every Week</option>
                        <option value="monthly">Every Month</option>
                        <option value="every_3_months">Every 3 Months</option>
                        <option value="every_6_months">Every 6 Months</option>
                        <option value="yearly">Every Year</option>
                        <option value="custom">Custom schedule mileage (every X km)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-400 font-semibold">Daily Notification Time</label>
                      <input 
                        type="time"
                        value={formTime}
                        onChange={(e) => setFormTime(e.target.value)}
                        className="w-full bg-slate-950 p-2 rounded-lg border border-white/10 text-white"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold">Alert Priority Level</label>
                    <select
                      value={formPriority}
                      onChange={(e) => setFormPriority(e.target.value as any)}
                      className="w-full bg-slate-950 p-2.5 rounded-xl border border-white/10 text-slate-300"
                    >
                      <option value="Low">Low - Advisory</option>
                      <option value="Medium">Medium - Regular Reminder</option>
                      <option value="High">High - Crucial Maintenance</option>
                      <option value="Emergency">Critical - Safety Warning</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold">Notification Channel</label>
                    <select
                      value={formChannel}
                      onChange={(e) => setFormChannel(e.target.value as any)}
                      className="w-full bg-slate-950 p-2.5 rounded-xl border border-white/10 text-slate-300"
                    >
                      <option value="In-App">In-App Center</option>
                      <option value="Push">Push Notification</option>
                      <option value="Telegram">Telegram Bot Sync</option>
                      <option value="Email">Email Digest</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold">Alarm Notes / Advice</label>
                    <input 
                      type="text"
                      placeholder="e.g. Check when cold in morning."
                      value={formNotes}
                      onChange={(e) => setFormNotes(e.target.value)}
                      className="w-full bg-slate-950 p-2.5 rounded-xl border border-white/10 text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => { resetForm(); setShowCreateForm(false); }}
                    className="px-4 py-2 bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 font-bold rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-sky-500 text-slate-950 hover:bg-sky-400 font-extrabold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-lg shadow-sky-500/10"
                  >
                    <Plus className="w-4 h-4 text-slate-950" />
                    <span>Save Custom Alarm</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* DYNAMIC ROLE DASHBOARD PANELS (GARAGE / ADMIN) */}
          {activeRole === 'garage' && (
            <div className="glass rounded-3xl p-5 border border-emerald-500/10 space-y-4">
              <div className="flex items-center gap-2 border-b border-white/5 pb-2.5">
                <Building className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-extrabold tracking-wide uppercase text-slate-200">
                  Garage Notification Dashboard <span className="text-[10px] bg-emerald-500/10 text-emerald-300 font-normal px-2 py-0.5 rounded-full uppercase ml-1.5 font-sans border border-emerald-500/20">Active Shop</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Send Suggestions Form */}
                <div className="p-4 bg-white/2 rounded-2xl border border-white/5 space-y-3">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Pushed Scheduled Service Reminder</span>
                  </h4>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Pushes a suggested next service reminder directly to the owner's app log. The owner must click 'Approve Suggestion' to save it permanently.
                  </p>

                  <form onSubmit={handleGaragePushReminder} className="space-y-3.5 text-xs">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400">Target Service Category</label>
                      <select
                        value={garageServiceType}
                        onChange={(e) => setGarageServiceType(e.target.value)}
                        className="w-full bg-slate-950 p-1.5 rounded-lg border border-white/10 text-slate-300"
                      >
                        <option value="Engine Oil Change">Engine Oil Change</option>
                        <option value="Brake Check">Brake Pads Inspection</option>
                        <option value="Full Inspection">60-Point Inspection</option>
                        <option value="Tire Check">Wheel Alignment & Tires</option>
                        <option value="EV Battery Health Check">EV Accumulator Scan</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400">Recommend Interval (km)</label>
                        <input 
                          type="number" 
                          value={garageRecommendMileage}
                          onChange={(e) => setGarageRecommendMileage(e.target.value)}
                          className="w-full bg-slate-950 p-1.5 rounded-lg border border-white/10 text-white font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400">Recommend Expiry (Months)</label>
                        <input 
                          type="number" 
                          value={garageRecommendMonths}
                          onChange={(e) => setGarageRecommendMonths(e.target.value)}
                          className="w-full bg-slate-950 p-1.5 rounded-lg border border-white/10 text-white font-mono"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-1.5 text-[10px] text-slate-400 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={garageMarketingCheck}
                          onChange={(e) => setGarageMarketingCheck(e.target.checked)}
                          className="rounded bg-slate-950 border-white/10 text-emerald-500 focus:ring-0 cursor-pointer" 
                        />
                        <span>Confirm promotional consent check</span>
                      </label>
                      
                      <button
                        type="submit"
                        className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-[11px] rounded-lg cursor-pointer flex items-center gap-1 transition"
                      >
                        <Send className="w-3 h-3 text-slate-950" />
                        <span>Send Promo Alert</span>
                      </button>
                    </div>

                    {garageSuccessMsg && (
                      <div className="p-2 bg-emerald-950/20 border border-emerald-500/20 text-emerald-300 rounded text-[10px] font-sans">
                        {garageSuccessMsg}
                      </div>
                    )}
                  </form>
                </div>

                {/* Garage Queue Stats */}
                <div className="space-y-2 lg:space-y-3.5">
                  <div className="bg-slate-950/40 p-3.5 rounded-2xl border border-white/5 space-y-2">
                    <h5 className="text-[11px] uppercase tracking-wider text-slate-400 font-extrabold">Live Garage Alerts Queue</h5>
                    
                    <div className="space-y-2 text-[10px]">
                      <div className="flex justify-between items-center bg-white/3 p-2 rounded-lg border border-white/5">
                        <span className="text-slate-300">Pending Customer Approvals:</span>
                        <span className="font-bold text-sky-400 bg-sky-400/10 px-2 py-0.5 rounded border border-sky-400/20">3 Queue</span>
                      </div>
                      <div className="flex justify-between items-center bg-white/3 p-2 rounded-lg border border-white/5">
                        <span className="text-slate-300">Monsoon Oil Due Follow-ups:</span>
                        <span className="font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-500/20">8 Defined</span>
                      </div>
                      <div className="flex justify-between items-center bg-white/3 p-2 rounded-lg border border-white/5">
                        <span className="text-slate-300">FCM Push Delivery Success Rate:</span>
                        <span className="font-bold text-white font-mono">99.2% ok</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-950/10 border border-amber-500/10 rounded-xl flex gap-2">
                    <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span className="text-[10px] text-slate-300 leading-normal">
                      <strong>Note:</strong> Owners can reject or request modifications to any garage-pushed reminder logs. Direct validation prevents garage spam.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeRole === 'admin' && (
            <div className="glass rounded-3xl p-5 border border-pink-500/15 space-y-4">
              <div className="flex items-center gap-2 border-b border-white/5 pb-2.5">
                <Megaphone className="w-5 h-5 text-pink-400" />
                <h3 className="text-sm font-extrabold tracking-wide uppercase text-slate-200">
                  Admin Broadcast Control Panel <span className="text-[10px] bg-pink-500/10 text-pink-300 font-normal px-2 py-0.5 rounded-full uppercase ml-1.5 border border-pink-500/15 font-sans">Superuser</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Broadcast Broadcaster */}
                <form onSubmit={handleAdminBroadcastAnnouncement} className="p-4 bg-white/2 rounded-2xl border border-white/5 space-y-3.5 text-xs">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Megaphone className="w-3.5 h-3.5 text-pink-400" />
                    <span>Create Global Announcement Pushes</span>
                  </h4>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400">Bulletin Cohort Target</label>
                      <select
                        value={adminCohortTarget}
                        onChange={(e) => setAdminCohortTarget(e.target.value)}
                        className="w-full bg-slate-950 p-1.5 rounded-lg border border-white/10 text-slate-300"
                      >
                        <option value="all">All App Users</option>
                        <option value="brand">Toyota Owners</option>
                        <option value="city">Phnom Penh Residents</option>
                        <option value="ev">EV Model Owners</option>
                        <option value="petrol">Diesel & Petrol Owners</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400">Bulletin Type</label>
                      <select
                        value={adminBroadcastCategory}
                        onChange={(e) => setAdminBroadcastCategory(e.target.value)}
                        className="w-full bg-slate-950 p-1.5 rounded-lg border border-white/10 text-slate-300"
                      >
                        <option value="admin">System Administration</option>
                        <option value="safety">Critical Recall / Alert</option>
                        <option value="maintenance">Condition Advisory</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400">Broadcast Title Headline</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Phnom Penh Flooding advisory"
                      value={adminBroadcastTitle}
                      onChange={(e) => setAdminBroadcastTitle(e.target.value)}
                      className="w-full bg-slate-950 p-2 rounded-lg border border-white/10 text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400">Broadcaster Message (Cambodian localized text suggested)</label>
                    <textarea 
                      required
                      rows={2}
                      placeholder="Write advisory text..."
                      value={adminBroadcastMessage}
                      onChange={(e) => setAdminBroadcastMessage(e.target.value)}
                      className="w-full bg-slate-950 p-2 rounded-lg border border-white/10 text-white focus:outline-none focus:border-pink-500"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-slate-950 font-bold rounded-lg cursor-pointer flex items-center gap-1.5"
                    >
                      <Megaphone className="w-3.5 h-3.5 text-slate-950" />
                      <span>Shoot Broadcast</span>
                    </button>
                  </div>

                  {adminSuccessMsg && (
                    <div className="p-2 bg-pink-950/20 border border-pink-500/20 text-pink-300 rounded text-[10px]">
                      {adminSuccessMsg}
                    </div>
                  )}
                </form>

                {/* Broadcast stats output */}
                <div className="space-y-3.5">
                  <div className="bg-slate-950/40 p-4 rounded-2xl border border-white/5 space-y-3">
                    <h5 className="text-[11px] uppercase tracking-wider text-slate-400 font-extrabold flex items-center justify-between">
                      <span>Broadcast Delivery Report API</span>
                      <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400"></span>
                    </h5>
                    
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-slate-900 p-2.5 rounded-lg border border-white/5">
                        <span className="text-[18px] font-extrabold font-mono text-pink-400 block">84.2%</span>
                        <span className="text-[8px] uppercase font-bold text-slate-400">Open Rate</span>
                      </div>
                      <div className="bg-slate-900 p-2.5 rounded-lg border border-white/5">
                        <span className="text-[18px] font-extrabold font-mono text-sky-400 block">32.9%</span>
                        <span className="text-[8px] uppercase font-bold text-slate-400">Click Rate</span>
                      </div>
                      <div className="bg-slate-900 p-2.5 rounded-lg border border-white/5">
                        <span className="text-[18px] font-extrabold font-mono text-emerald-400 block">99.8%</span>
                        <span className="text-[8px] uppercase font-bold text-slate-400">Delivered</span>
                      </div>
                    </div>

                    <div className="pt-1.5 space-y-1.5 text-[10px]">
                      <div className="flex justify-between text-slate-400">
                        <span>Total Registered Devices (Cambodia):</span>
                        <strong className="text-white font-mono">1,480 FCM devices</strong>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Telegram Bot Subscribers:</span>
                        <strong className="text-white font-mono">820 users</strong>
                      </div>
                      <div className="flex justify-between text-slate-400 text-slate-300">
                        <span>Active Campaign Category logs:</span>
                        <strong className="text-white font-bold bg-white/5 px-2 rounded">Monsoon Floods</strong>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-pink-950/20 border border-pink-500/10 rounded-xl text-[10px] text-slate-200">
                    <strong>Spam Interlocks Active:</strong> Administrators must limit broadcast triggers to &lt; 3 times daily to protect subscriber health and maintain trust channels.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DYNAMIC ODOMETER MILESTONE & INTERVAL ANALYZER (HISTORICAL INTEGRATION) */}
          {selectedVehicle && (
            (() => {
              const kmNow = selectedVehicle.mileage || 0;
              const fuel = (selectedVehicle.fuelType || 'Gasoline').toLowerCase();
              const currentRecords = records || [];

              // Define candidate milestones
              const candidates = [
                {
                  key: 'oil',
                  name: "Engine Oil Service",
                  interval: 5000,
                  icon: <Flame className="w-4 h-4 text-rose-400" />,
                  searchKeys: ['oil', 'lubrication', 'engine oil'],
                  description: "Lubricating fluid swap, fresh filter seal and high heat sludge prevention check.",
                  actionAdvice: "Schedule a synthetic oil swap immediately to protect internal engine valves.",
                  supported: ['gasoline', 'petrol', 'hybrid', 'diesel']
                },
                {
                  key: 'timing',
                  name: "High Mileage Timing Belt / Chain",
                  interval: 100000,
                  icon: <Activity className="w-4 h-4 text-purple-400" />,
                  searchKeys: ['timing', 'belt', 'chain', 'valve'],
                  description: "Replacement of timing belt/chain to prevent severe safety critical valve snapping.",
                  actionAdvice: "Perform high-mileage belt teeth wear check and swap tensioners.",
                  supported: ['gasoline', 'petrol', 'hybrid', 'diesel']
                },
                {
                  key: 'tire',
                  name: "Tire Balance, Check & Rotation",
                  interval: 10000,
                  icon: <Compass className="w-4 h-4 text-emerald-400" />,
                  searchKeys: ['tire', 'tyre', 'wheel', 'alignment', 'rotation'],
                  description: "Symmetric tire swap and balance adjustment for uniform tread wear and brake alignment.",
                  actionAdvice: "Visually check rubber tread patterns or schedule 4-wheel alignment check.",
                  supported: 'all'
                },
                {
                  key: 'filter',
                  name: "Cabin Air & Combustion Intake Filters",
                  interval: 15000,
                  icon: <RefreshCw className="w-4 h-4 text-indigo-400" />,
                  searchKeys: ['filter', 'air filter', 'cabin filter', 'intake'],
                  description: "Replacing dust filters for pure cabin ventilation air and optimal combustion airflow.",
                  actionAdvice: "Unscrew intake lid to shake off dust residues or replace clogged filter elements.",
                  supported: 'all'
                },
                {
                  key: 'brake',
                  name: "Brake Caliper Pad & Fluid Flush",
                  interval: 20000,
                  icon: <ShieldAlert className="w-4 h-4 text-amber-400" />,
                  searchKeys: ['brake', 'pad', 'caliper', 'rotor', 'fluid'],
                  description: "Detailed check of brake pad wear level (thickness) and high pressure hydraulic fluid boiling point.",
                  actionAdvice: "Verify pad friction linings at an authorized Phnom Penh service station.",
                  supported: 'all'
                },
                {
                  key: 'transmission',
                  name: "CVT / Auto Transmission Fluid",
                  interval: 60000,
                  icon: <Settings className="w-4 h-4 text-sky-400" />,
                  searchKeys: ['transmission', 'gearbox', 'cvt', 'fluid', 'clutch'],
                  description: "High viscosity protective automatic / manual gearbox gear lubricant flush.",
                  actionAdvice: "Service solenoid seals or do gearbox hydraulic line inspection.",
                  supported: 'all'
                },
                {
                  key: 'spark',
                  name: "Combustion Spark Plugs Check",
                  interval: 40000,
                  icon: <Wrench className="w-4 h-4 text-yellow-400" />,
                  searchKeys: ['spark', 'plug', 'ignition', 'coil'],
                  description: "Friction core terminal replace to maintain fuel-economy and prevent rough engine idle.",
                  actionAdvice: "Swap standard or robust iridium core spark terminals.",
                  supported: ['gasoline', 'petrol', 'hybrid']
                },
                {
                  key: 'ev-battery',
                  name: "EV High Voltage Battery health Scan",
                  interval: 20000,
                  icon: <Database className="w-4 h-4 text-cyan-400" />,
                  searchKeys: ['ev', 'battery', 'coolant', 'charging', 'traction'],
                  description: "State of health capacity scan and cooling pump performance audit.",
                  actionAdvice: "Perform official battery capacity balancing and cooling loop check at specialized EV partner.",
                  supported: ['ev']
                }
              ];

              const activeMilestones = candidates.filter(c => {
                if (c.key === 'oil' || c.key === 'timing') {
                  return !isPureEV(selectedVehicle);
                }
                if (c.key === 'transmission') {
                  return !isPureEV(selectedVehicle);
                }
                if (c.key === 'spark') {
                  return hasPetrolSystem(selectedVehicle) && !isPureEV(selectedVehicle);
                }
                if (c.key === 'ev-battery') {
                  return hasEvBatteryAndCharging(selectedVehicle);
                }
                return true;
              });

              // Helper to find latest matching record from props
              const findLatestMatchingRecord = (keys: string[]) => {
                const matches = currentRecords.filter(rec => {
                  const sCat = (rec.serviceCategory || '').toLowerCase();
                  const desc = (rec.description || '').toLowerCase();
                  return keys.some(key => sCat.includes(key) || desc.includes(key));
                });
                if (matches.length === 0) return null;
                return matches.sort((a, b) => {
                  const diff = new Date(b.date).getTime() - new Date(a.date).getTime();
                  if (diff !== 0) return diff;
                  return b.mileage - a.mileage;
                })[0];
              };

              // Map each active milestone to its computed properties
              const computedMilestones = activeMilestones.map(m => {
                const latestRec = findLatestMatchingRecord(m.searchKeys);
                const lastCompletedMileage = latestRec ? latestRec.mileage : 0;
                const lastCompletedDate = latestRec ? latestRec.date : null;
                const mileageSinceLast = Math.max(0, kmNow - lastCompletedMileage);
                
                // Let's calculate next due mileage properly:
                // next due = last completed + interval, or if current is past that, the next appropriate multiple
                let nextDueMileage = lastCompletedMileage > 0 ? (lastCompletedMileage + m.interval) : m.interval;
                if (kmNow > nextDueMileage && lastCompletedMileage === 0) {
                  // If no records, find nearest upcoming interval
                  nextDueMileage = (Math.floor(kmNow / m.interval) + 1) * m.interval;
                }
                
                const kmsRemaining = nextDueMileage - kmNow;
                const progressRatio = Math.min(100, Math.max(0, (mileageSinceLast / m.interval) * 105)); // stretch slightly for visual progress gauge or clip to 100

                let status: 'Overdue' | 'Due Soon' | 'Good' = 'Good';
                if (kmsRemaining <= 0) {
                  status = 'Overdue';
                } else if (kmsRemaining <= 1000) {
                  status = 'Due Soon';
                }

                return {
                  ...m,
                  latestRec,
                  lastCompletedMileage,
                  lastCompletedDate,
                  mileageSinceLast,
                  nextDueMileage,
                  kmsRemaining,
                  progressRatio: Math.min(100, progressRatio),
                  status
                };
              });

              // Dispatch single notification helper
              const handleNotifyMilestone = async (m: typeof computedMilestones[0]) => {
                setNotifyingMilestoneKey(m.key);
                try {
                  const statusLabel = m.status === 'Overdue' ? 'Overdue ⚠️' : 'Due Soon 🕒';
                  const title = `⚙️ Milestone Warning: ${m.name}`;
                  const remainingText = m.kmsRemaining <= 0
                    ? `is OVERDUE by ${Math.abs(m.kmsRemaining).toLocaleString()} km`
                    : `is due in ${m.kmsRemaining.toLocaleString()} km (Target: ${m.nextDueMileage.toLocaleString()} km)`;

                  const message = `Your ${selectedVehicle.brand} ${selectedVehicle.model} (Odometer: ${kmNow.toLocaleString()} km) upcoming milestone for [${m.name}] is analyzed as ${statusLabel}! Lifecycle ${remainingText}. Last performed: ${m.lastCompletedDate ? `${m.lastCompletedDate} at ${m.lastCompletedMileage.toLocaleString()} km` : 'No history found'}. Action required: ${m.actionAdvice}`;

                  const response = await fetch("/api/notifications/trigger-event", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      eventType: 'maintenance_due',
                      vehicleId: selectedVehicle.id,
                      customTitle: title,
                      customMessage: message
                    })
                  });
                  if (response.ok) {
                    playChime('success');
                    fetchRemindersAndNotifications();
                  } else {
                    playChime('error');
                  }
                } catch (e) {
                  console.error(e);
                  playChime('error');
                } finally {
                  setNotifyingMilestoneKey(null);
                }
              };

              // Batch scan and trigger alerts helper
              const handleBatchAudit = async () => {
                setAuditLoading(true);
                setAuditMessage(null);
                try {
                  const criticalMilestones = computedMilestones.filter(m => m.status === 'Overdue' || m.status === 'Due Soon');
                  if (criticalMilestones.length === 0) {
                    setAuditMessage("✅ Dynamic Mileage Checkup Complete: All maintenance milestones are in prime health based on historical record logs!");
                    playChime('success');
                    return;
                  }

                  let sentCount = 0;
                  for (const m of criticalMilestones) {
                    const statusLabel = m.status === 'Overdue' ? 'Overdue ⚠️' : 'Due Soon 🕒';
                    const title = `⚙️ Milestone System Alert: ${m.name}`;
                    const remainingText = m.kmsRemaining <= 0
                      ? `is OVERDUE by ${Math.abs(m.kmsRemaining).toLocaleString()} km (Trigger: every ${m.interval.toLocaleString()} km)`
                      : `is approaching in ${m.kmsRemaining.toLocaleString()} km (Next Target: ${m.nextDueMileage.toLocaleString()} km)`;

                    const message = `Continuous mileage audit for ${selectedVehicle.brand} ${selectedVehicle.model} (Current Odometer: ${kmNow.toLocaleString()} km) flagged [${m.name}] as ${statusLabel}. This system milestone is ${remainingText}. Last verified logs: ${m.lastCompletedDate ? `${m.lastCompletedDate} at ${m.lastCompletedMileage.toLocaleString()} km` : 'No history'}. Recommended action: ${m.actionAdvice}`;

                    const res = await fetch("/api/notifications/trigger-event", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        eventType: 'maintenance_due',
                        vehicleId: selectedVehicle.id,
                        customTitle: title,
                        customMessage: message
                      })
                    });
                    if (res.ok) sentCount++;
                  }

                  playChime('alert');
                  fetchRemindersAndNotifications();
                  setAuditMessage(`🛠[] Dynamic Audit complete! Successfully scanned ${computedMilestones.length} active manufacturer intervals and logged ${sentCount} critical alert feed messages based on current records comparison.`);
                } catch (e) {
                  console.error(e);
                  setAuditMessage("❌ Failed to finish dynamic mileage audit.");
                  playChime('error');
                } finally {
                  setAuditLoading(false);
                  setTimeout(() => setAuditMessage(null), 8500);
                }
              };

              return (
                <div id="dynamic-milestones-card" className="glass rounded-3xl p-5 border border-sky-500/10 space-y-5 shadow-xl">
                  {/* Title Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                    <div className="space-y-1 text-left">
                      <div className="flex items-center gap-2">
                        <Gauge className="w-5 h-5 text-sky-400 animate-pulse" />
                        <h3 className="text-sm font-extrabold text-white tracking-wide uppercase">
                          Odometer Milestone & Cycle Analyzer
                        </h3>
                        <span className="text-[9px] bg-sky-500/10 text-sky-400 font-extrabold uppercase px-2 py-0.5 rounded-full border border-sky-500/15">
                          Adaptive Engine Matrix
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-sans">
                        Dynamic comparison scanner checks vehicle mileage matches against historical <strong className="text-slate-300">({currentRecords.length} service logs)</strong> to calculate mechanical remaining thresholds.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleBatchAudit}
                      disabled={auditLoading}
                      className="px-4 py-2 bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 disabled:opacity-50 text-slate-950 font-extrabold text-[11px] rounded-xl flex items-center justify-center gap-1.5 transition transform hover:scale-[1.01] active:scale-95 cursor-pointer shadow-md shadow-sky-500/5 select-none"
                    >
                      {auditLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Activity className="w-3.5 h-3.5" />
                      )}
                      <span>Scan & Dispatch Alerts</span>
                    </button>
                  </div>

                  {/* Audit message response banner */}
                  {auditMessage && (
                    <div className="p-3 bg-slate-950/60 border border-sky-500/20 text-[10px] text-sky-200 rounded-xl flex items-start gap-2 animate-fade-in font-sans leading-relaxed text-left">
                      <Info className="w-4 h-4 text-sky-400 shrink-0" />
                      <span>{auditMessage}</span>
                    </div>
                  )}

                  {/* Quick vehicle details display */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-950/40 p-3 rounded-2xl border border-white/5 text-[10px]">
                    <div className="text-left space-y-0.5">
                      <span className="text-slate-500 block uppercase font-extrabold">Active Vehicle</span>
                      <strong className="text-white text-[11px] font-sans font-bold">{selectedVehicle.brand} {selectedVehicle.model}</strong>
                    </div>
                    <div className="text-left space-y-0.5">
                      <span className="text-slate-500 block uppercase font-extrabold">Odometer Level</span>
                      <strong className="text-sky-300 text-[11px] font-mono font-bold">{kmNow.toLocaleString()} km</strong>
                    </div>
                    <div className="text-left space-y-0.5">
                      <span className="text-slate-500 block uppercase font-extrabold">Drive Format</span>
                      <strong className="text-emerald-400 text-[11px] font-sans font-extrabold uppercase">{selectedVehicle.fuelType} Engine</strong>
                    </div>
                    <div className="text-left space-y-0.5">
                      <span className="text-slate-500 block uppercase font-extrabold">Audited Intervals</span>
                      <strong className="text-white text-[11px] font-mono font-bold">{computedMilestones.length} active lines</strong>
                    </div>
                  </div>

                  {/* Milestones dynamic list */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {computedMilestones.map(m => {
                      const isOverdue = m.status === 'Overdue';
                      const isSoon = m.status === 'Due Soon';
                      
                      return (
                        <div
                          key={m.key}
                          id={`milestone-card-${m.key}`}
                          className={`p-3.5 rounded-2xl bg-white/[0.01] border transition text-left space-y-3 relative hover:bg-white/[0.03] ${
                            isOverdue
                              ? 'border-rose-500/25 bg-rose-500/[0.01]'
                              : isSoon
                              ? 'border-amber-500/20 bg-amber-500/[0.01]'
                              : 'border-white/5 hover:border-white/10'
                          }`}
                        >
                          {/* Card top bar */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <div className={`p-1.5 rounded-xl border ${
                                isOverdue
                                  ? 'bg-rose-500/10 border-rose-500/20'
                                  : isSoon
                                  ? 'bg-amber-500/10 border-amber-500/20'
                                  : 'bg-white/5 border-white/5'
                              }`}>
                                {m.icon}
                              </div>
                              <div className="space-y-0.5">
                                <h4 className="font-extrabold text-white text-[11px] tracking-tight">{m.name}</h4>
                                <span className="text-[9px] text-slate-400 font-mono">Interval: flat {m.interval.toLocaleString()} km</span>
                              </div>
                            </div>

                            {/* Status Pills */}
                            <div>
                              {isOverdue ? (
                                <span className="bg-rose-500/15 text-rose-400 border border-rose-500/20 text-[8px] font-extrabold tracking-wide uppercase px-2 py-0.5 rounded">OVERDUE</span>
                              ) : isSoon ? (
                                <span className="bg-amber-500/15 text-amber-400 border border-amber-500/20 text-[8px] font-extrabold tracking-wide uppercase px-2 py-0.5 rounded">DUE SOON</span>
                              ) : (
                                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 text-[8px] font-extrabold tracking-wide uppercase px-2 py-0.5 rounded">GREAT HEALTH</span>
                              )}
                            </div>
                          </div>

                          {/* Description */}
                          <p className="text-[10px] text-slate-400 leading-relaxed font-sans">{m.description}</p>

                          {/* Comparison Stats Meter */}
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center text-[9px] font-mono">
                              <span className="text-slate-500">Interval Cycle Progress</span>
                              <span className={isOverdue ? 'text-rose-400 font-bold' : isSoon ? 'text-amber-400 font-bold' : 'text-slate-300 font-bold'}>
                                {m.mileageSinceLast.toLocaleString()} / {m.interval.toLocaleString()} km ({Math.round(m.progressRatio)}%)
                              </span>
                            </div>

                            {/* Outer Progress track */}
                            <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  isOverdue
                                    ? 'bg-gradient-to-r from-rose-500 to-pink-500'
                                    : isSoon
                                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500'
                                    : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                                }`}
                                style={{ width: `${m.progressRatio}%` }}
                              />
                            </div>
                          </div>

                          {/* Historical records tracking details */}
                          <div className="p-2 bg-black/30 rounded-xl border border-white/5 space-y-1 text-[9px]">
                            {m.latestRec ? (
                              <div className="flex items-center gap-1 text-slate-300">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                <span>
                                  Last done: <strong className="text-white">{m.lastCompletedDate}</strong> at <strong className="text-sky-300 font-mono">{m.lastCompletedMileage.toLocaleString()} km</strong>
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-start gap-1 text-slate-400 leading-normal">
                                <Info className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                                <span>No service records found. Active offset check computed from 0 km.</span>
                              </div>
                            )}

                            <div className="flex items-center justify-between pt-1 border-t border-white/5">
                              <span className="text-slate-500">Upcoming cycle target:</span>
                              <strong className="text-white font-mono">{m.nextDueMileage.toLocaleString()} km</strong>
                            </div>

                            <div className="flex items-center justify-between text-slate-300">
                              <span>Lifecycle remaining limit:</span>
                              {m.kmsRemaining <= 0 ? (
                                <strong className="text-rose-400 font-bold font-mono">Overdue by {Math.abs(m.kmsRemaining).toLocaleString()} km</strong>
                              ) : (
                                <strong className="text-slate-200 font-bold font-mono">{m.kmsRemaining.toLocaleString()} km left</strong>
                              )}
                            </div>
                          </div>

                          {/* Micro Notification & Advice dispatch row */}
                          <div className="flex items-center justify-between gap-3 pt-1">
                            <span className="text-[8px] text-slate-500 font-mono block max-w-[65%] leading-normal">
                              {isOverdue || isSoon ? `Action advised: ${m.actionAdvice}` : 'Status pristine. Telemetry healthy.'}
                            </span>

                            {(isOverdue || isSoon) && (
                              <button
                                type="button"
                                onClick={() => handleNotifyMilestone(m)}
                                disabled={notifyingMilestoneKey !== null}
                                className="px-2.5 py-1 bg-white/5 hover:bg-sky-500 hover:text-slate-950 border border-white/10 hover:border-sky-500/25 transition text-sky-400 font-bold text-[9px] rounded-lg flex items-center gap-1 cursor-pointer select-none"
                              >
                                {notifyingMilestoneKey === m.key ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Bell className="w-3 h-3" />
                                )}
                                <span>Notify</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()
          )}

          {/* DYNAMIC MAINTENANCE COMPILATION ALERTS (DUE NOW & DUE SOON) */}
          {(() => {
            const dueNowItems = reminders.filter(r => r.status === 'Overdue' || r.status === 'Due today' || r.status === 'Due Now');
            const dueSoonItems = reminders.filter(r => r.status === 'Due soon' || r.status === 'Due Soon');
            
            if (dueNowItems.length === 0 && dueSoonItems.length === 0) return null;
            
            return (
              <div id="maintenance-milestone-warnings" className="glass rounded-3xl p-5 border border-white/5 space-y-4 shadow-xl">
                <div className="flex items-center gap-2.5 border-b border-white/5 pb-2.5">
                  <div className="p-2 bg-rose-500/15 rounded-xl border border-rose-500/20">
                    <ShieldAlert className="w-5 h-5 text-rose-400 animate-pulse" />
                  </div>
                  <div className="space-y-0.5 text-left">
                    <h3 className="text-sm font-extrabold text-white tracking-wide uppercase">Urgent Engine & Maintenance Warnings</h3>
                    <span className="text-[10px] text-sky-305 block font-sans text-slate-450">
                      Active diagnostic analysis on <strong className="text-white">{selectedVehicle?.brand} {selectedVehicle?.model} ({selectedVehicle?.fuelType})</strong> odometer: <strong className="text-white">{(selectedVehicle?.mileage || 0).toLocaleString()} km</strong>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Due Now Box */}
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-1.5 text-left text-rose-400 font-bold uppercase text-[10px] tracking-wider bg-rose-500/5 px-2 py-1 rounded w-max border border-rose-500/10">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0" />
                      <span>⚠️ Due Now ({dueNowItems.length})</span>
                    </div>

                    {dueNowItems.length > 0 ? (
                      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                        {dueNowItems.map(item => (
                          <div key={item.id} className="p-3.5 rounded-2xl bg-rose-950/20 border border-rose-500/30 text-left text-xs space-y-2 hover:border-rose-500/50 transition duration-150">
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-white">{item.title}</span>
                              <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[8px] font-mono tracking-widest uppercase px-1.5 py-0.2 rounded">CRITICAL</span>
                            </div>
                            <p className="text-slate-300 text-[11px] leading-relaxed">{item.reason}</p>
                            <div className="p-2 bg-black/40 border border-rose-500/20 rounded-xl flex items-start gap-1.5 text-[10px] text-rose-300">
                              <Wrench className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                              <div>
                                <strong className="font-bold uppercase tracking-wider block text-[8px] text-rose-400">Recommended Action</strong>
                                <span>{item.action || "Consult your Phnom Penh service station immediately."}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl bg-white/2 border border-white/5 text-[11px] text-slate-500 text-center py-6">
                        No critical maintenance milestones currently overdue.
                      </div>
                    )}
                  </div>

                  {/* Due Soon Box */}
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-1.5 text-left text-amber-400 font-bold uppercase text-[10px] tracking-wider bg-amber-500/5 px-2 py-1 rounded w-max border border-amber-500/10">
                      <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                      <span>🕒 Due Soon ({dueSoonItems.length})</span>
                    </div>

                    {dueSoonItems.length > 0 ? (
                      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                        {dueSoonItems.map(item => (
                          <div key={item.id} className="p-3.5 rounded-2xl bg-amber-950/15 border border-amber-500/20 text-left text-xs space-y-2 hover:border-amber-500/40 transition duration-150">
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-white">{item.title}</span>
                              <span className="bg-amber-500/10 text-amber-403 border border-amber-500/20 text-[8px] font-mono tracking-widest uppercase px-1.5 py-0.2 rounded text-[8px]">UPCOMING</span>
                            </div>
                            <p className="text-slate-300 text-[11px] leading-relaxed">{item.reason}</p>
                            <div className="p-2 bg-black/40 border border-amber-500/10 rounded-xl flex items-start gap-1.5 text-[10px] text-amber-300">
                              <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                              <div>
                                <strong className="font-bold uppercase tracking-wider block text-[8px] text-amber-400">Action Plan</strong>
                                <span>{item.action || "Inspect status or schedule check on your next routine test."}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl bg-white/2 border border-white/5 text-[11px] text-slate-500 text-center py-6">
                        No service limit thresholds approaching system warnings limits.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* SIMULATED WEB BROWSER PUSH NOTIFICATION CENTER */}
          <div id="push-notification-center" className="glass rounded-3xl p-6 border border-white/10 space-y-6 shadow-2xl relative overflow-hidden">
            {/* Ambient glows inside the card */}
            <div className="absolute right-0 top-0 w-48 h-48 bg-rose-500/5 rounded-full blur-2xl pointer-events-none"></div>
            <div className="absolute left-0 bottom-0 w-48 h-48 bg-sky-500/5 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4 relative z-10 text-left">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-tr from-sky-500/10 to-teal-500/10 border border-sky-400/20 text-sky-400 shrink-0">
                  <Smartphone className="w-6 h-6 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-extrabold text-white tracking-wide uppercase flex flex-wrap items-center gap-2">
                    <span>Web Push Notification Center</span>
                    <span className="text-[9px] bg-sky-500/10 text-sky-300 font-normal border border-sky-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider font-sans">
                      Simulated Push Logs
                    </span>
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Live browser notification pipeline for upcoming maintenance tasks, separating safety-critical events from routine upkeep.
                  </p>
                </div>
              </div>

              {notifications.filter(n => n.channel === 'Push').length > 0 && (
                <button 
                  onClick={async () => {
                    if (confirm("Are you sure you want to clear simulated web push logs history?")) {
                      await handleClearNotifications();
                    }
                  }}
                  className="text-[11px] text-slate-400 hover:text-rose-400 font-bold flex items-center gap-1 bg-white/3 hover:bg-white/5 border border-white/5 px-3 py-1.5 rounded-xl cursor-pointer transition shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Push History</span>
                </button>
              )}
            </div>

            {/* SECTION A: WEB PUSH SIMULATION PANEL */}
            <div className="bg-slate-950/55 p-4 rounded-2xl border border-white/5 space-y-4 relative z-10 text-xs text-left">
              <div className="flex items-center gap-2 text-sky-300 font-bold uppercase text-[10px] tracking-wider pb-1.5 border-b border-white/5">
                <Sliders className="w-4 h-4 text-sky-400" />
                <span>Simulate & Dispatch Upcoming Maintenance Push Notification</span>
              </div>

              {/* Presets Grid */}
              <div className="space-y-2">
                <span className="text-[9px] text-slate-400 uppercase font-bold tracking-widest block">Quick Simulation Presets:</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  <div className="space-y-1.5">
                    <span className="text-[8px] text-rose-400 font-extrabold uppercase tracking-wider block">🚨 Urgent Maintenance Alerts</span>
                    <div className="flex flex-col gap-1.5">
                      <button
                        onClick={() => handleDispatchPushNotification(
                          "🚨 Critical: Engine Oil Pressure Overdue",
                          "High friction alert: Odometer is 500 km beyond safe limits. Urgent oil replacement required to maintain critical warranty & engine safety indexes.",
                          "Critical"
                        )}
                        className="py-1.5 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-[10px] text-left rounded-xl font-medium transition cursor-pointer flex items-center justify-between"
                      >
                        <span>Low Engine Oil Pressure Warning</span>
                        <span className="bg-rose-500/20 text-rose-300 text-[7px] px-1.5 py-0.2 rounded font-extrabold animate-pulse">URGENT</span>
                      </button>

                      <button
                        onClick={() => handleDispatchPushNotification(
                          "🚨 Urgent: Brake Rotor Wear Limit Reached",
                          "Braking safety hazard: Rear brake pads & rotor calipers are at 2.5mm thickness limit. Silt and Phnom Penh street grit are accelerating friction rot.",
                          "High"
                        )}
                        className="py-1.5 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-[10px] text-left rounded-xl font-medium transition cursor-pointer flex items-center justify-between"
                      >
                        <span>Rear Brake Caliper Pad Overhaul</span>
                        <span className="bg-rose-500/20 text-rose-300 text-[7px] px-1.5 py-0.2 rounded font-extrabold animate-pulse">URGENT</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[8px] text-sky-400 font-extrabold uppercase tracking-wider block">📅 Routine Upkeep Advisories</span>
                    <div className="flex flex-col gap-1.5">
                      <button
                        onClick={() => handleDispatchPushNotification(
                          "📅 Routine: 10,000 km Tire Rotation Check",
                          "Tire alignment advisory: Ensure uniform tread wear by checking tire geometry and performing tire rotation to sustain Phnom Penh highway safety.",
                          "Medium"
                        )}
                        className="py-1.5 px-3 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/15 text-[10px] text-left rounded-xl font-medium transition cursor-pointer flex items-center justify-between"
                      >
                        <span>10k Odometer Tire Rotation</span>
                        <span className="bg-slate-850 text-sky-400 text-[7px] px-1.5 py-0.2 border border-sky-550/20 rounded font-bold">ROUTINE</span>
                      </button>

                      <button
                        onClick={() => handleDispatchPushNotification(
                          "📅 Standard: Cambodia Monsoon Wiper Swap",
                          "Pre-Rain checks: Standard wiper blade deterioration. UV degradation reduces wet monsoon driving visibility. Recommend rapid silicone replacement.",
                          "Low"
                        )}
                        className="py-1.5 px-3 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/15 text-[10px] text-left rounded-xl font-medium transition cursor-pointer flex items-center justify-between"
                      >
                        <span>Monsoon Wiper Blade Check</span>
                        <span className="bg-slate-850 text-sky-400 text-[7px] px-1.5 py-0.2 border border-sky-550/20 rounded font-bold">ROUTINE</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Custom push manual creator */}
              <div className="bg-black/30 p-3.5 rounded-xl border border-white/5 space-y-3">
                <span className="text-[9px] text-slate-400 uppercase font-extrabold tracking-widest block">Or Dispatch Custom Maintenance Alert:</span>
                
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  <div className="md:col-span-5 space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase tracking-wider">Custom Alert Title</label>
                    <input
                      type="text"
                      placeholder="e.g. 🛠️ Urgent: Saturated Fuel Filter"
                      value={simulatedPushTitle}
                      onChange={(e) => setSimulatedPushTitle(e.target.value)}
                      className="w-full bg-slate-950 p-2 text-xs rounded-lg border border-white/10 text-slate-200 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div className="md:col-span-4 space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase tracking-wider">Alert Level / Urgency</label>
                    <select
                      value={simulatedPushPriority}
                      onChange={(e) => setSimulatedPushPriority(e.target.value as any)}
                      className="w-full bg-slate-950 p-2 text-xs rounded-lg border border-white/10 text-slate-300 focus:outline-none"
                    >
                      <option value="Critical">🔴 Urgent (Critical Level Alert)</option>
                      <option value="High">🔴 Urgent (High Level Alert)</option>
                      <option value="Medium">🔵 Routine (Medium Level Advice)</option>
                      <option value="Low">🔵 Routine (Low Level Advisory)</option>
                    </select>
                  </div>

                  <div className="md:col-span-3 flex items-end">
                    <button
                      onClick={() => handleDispatchPushNotification()}
                      disabled={simulatedPushLoading}
                      className="w-full py-2 bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 font-extrabold text-[11px] text-slate-950 rounded-lg flex items-center justify-center gap-1.5 transition uppercase tracking-wider cursor-pointer"
                    >
                      {simulatedPushLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5 text-slate-950" />
                      )}
                      <span>Push Web Alert</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider">Push Body Message Description</label>
                  <input
                    type="text"
                    placeholder="e.g. Saturated engine dust filters identified in high DNA vehicle telemetry log diagnostics. Clean filter or schedule quick workshop appointment."
                    value={simulatedPushMessage}
                    onChange={(e) => setSimulatedPushMessage(e.target.value)}
                    className="w-full bg-slate-950 p-2 text-xs rounded-lg border border-white/10 text-slate-200 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* SECTION B: BROWSER PUSH LOGS HISTORY LIST */}
            <div className="space-y-3.5 relative z-10 text-left">
              {(() => {
                const pushHistory = notifications.filter(n => n.channel === 'Push');
                const urgentCount = pushHistory.filter(n => n.priority === 'High' || n.priority === 'Critical' || n.priority === 'Emergency').length;
                const routineCount = pushHistory.filter(n => n.priority === 'Low' || n.priority === 'Medium').length;

                const filteredPushes = pushHistory.filter(n => {
                  if (activePushFilter === 'all') return true;
                  if (activePushFilter === 'urgent') return n.priority === 'High' || n.priority === 'Critical' || n.priority === 'Emergency';
                  if (activePushFilter === 'routine') return n.priority === 'Low' || n.priority === 'Medium';
                  return true;
                });

                return (
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                      <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                        <span className="flex items-center gap-1.5">
                          <History className="w-4 h-4 text-emerald-400" />
                          <span>Push Logs: <strong className="text-white font-mono">{pushHistory.length} Total</strong></span>
                        </span>
                        <span className="hidden sm:inline text-slate-600">|</span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                          <span>Urgent: <strong className="text-rose-400 font-mono">{urgentCount}</strong></span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                          <span>Routine: <strong className="text-sky-400 font-mono">{routineCount}</strong></span>
                        </span>
                      </div>

                      {/* Push filters switches */}
                      <div className="flex items-center bg-slate-950 p-1 rounded-xl text-[9px] font-bold uppercase border border-white/5">
                        <button
                          onClick={() => { setActivePushFilter('all'); playChime('success'); }}
                          className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${activePushFilter === 'all' ? 'bg-sky-500 text-slate-950 font-extrabold' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                          All ({pushHistory.length})
                        </button>
                        <button
                          onClick={() => { setActivePushFilter('urgent'); playChime('success'); }}
                          className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${activePushFilter === 'urgent' ? 'bg-rose-500/25 text-rose-300 border border-rose-500/30' : 'text-slate-400 hover:text-rose-400'}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-550 animate-pulse" />
                          <span>Urgent ({urgentCount})</span>
                        </button>
                        <button
                          onClick={() => { setActivePushFilter('routine'); playChime('success'); }}
                          className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${activePushFilter === 'routine' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' : 'text-slate-400 hover:text-sky-300'}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                          <span>Routine ({routineCount})</span>
                        </button>
                      </div>
                    </div>

                    {/* Scroller stack for push log feed items */}
                    <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                      {filteredPushes.map((not) => {
                        const isUrgent = not.priority === 'High' || not.priority === 'Critical' || not.priority === 'Emergency';
                        
                        return (
                          <div 
                            key={not.id}
                            className={`p-4 rounded-2xl border transition duration-200 text-xs relative overflow-hidden ${
                              isUrgent 
                                ? 'bg-rose-950/15 border-rose-500/35 shadow-lg shadow-rose-950/20' 
                                : 'bg-slate-900/40 border-slate-700/20'
                            } ${not.status === 'read' ? 'opacity-60' : ''}`}
                          >
                            {/* Accent indicators on cards */}
                            <div className={`absolute top-0 left-0 bottom-0 w-1 ${isUrgent ? 'bg-rose-500' : 'bg-sky-400'}`}></div>

                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pl-2">
                              <div className="flex gap-3 text-left">
                                <div className={`p-2 border rounded-xl h-max shrink-0 bg-slate-950 ${isUrgent ? 'border-rose-500/20 text-rose-400' : 'border-sky-500/10 text-sky-400'}`}>
                                  {isUrgent ? <ShieldAlert className="w-4 h-4 animate-bounce" /> : <Wrench className="w-4 h-4" />}
                                </div>

                                <div className="space-y-1">
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <span className="font-extrabold text-white text-[13px] tracking-tight">{not.title}</span>
                                    
                                    <span className={`text-[8px] font-extrabold uppercase border px-2 py-0.2 rounded-full font-sans tracking-wide ${
                                      isUrgent 
                                        ? 'bg-rose-500/25 text-rose-300 border-rose-500/40 animate-pulse font-black' 
                                        : 'bg-sky-500/10 text-sky-400 border-sky-550/20 font-bold'
                                    }`}>
                                      {isUrgent ? "🚨 URGENT" : "📅 ROUTINE"}
                                    </span>

                                    {not.status === 'unread' && (
                                      <span className="bg-emerald-500 text-slate-950 text-[8px] px-1.5 py-0.2 rounded font-sans uppercase font-extrabold tracking-widest">NEW</span>
                                    )}
                                  </div>

                                  <p className="text-slate-200 text-xs leading-relaxed max-w-xl">
                                    {not.message}
                                  </p>

                                  <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400 pt-1.5 font-mono">
                                    <span className="bg-white/5 border border-white/5 text-slate-300 px-2 py-0.2 rounded font-sans text-[8px] uppercase tracking-wide">
                                      Browser Push Channel
                                    </span>
                                    <span>•</span>
                                    <span>Urgency: <strong className={isUrgent ? "text-rose-400" : "text-sky-450"}>{not.priority || 'Medium'}</strong></span>
                                    <span>•</span>
                                    <span>{new Date(not.sentAt).toLocaleString()}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Actions strip */}
                              <div className="flex flex-row sm:flex-col items-center sm:items-end gap-1.5 shrink-0 self-end sm:self-start pt-2 sm:pt-0">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    playChime(isUrgent ? 'alert' : 'success');
                                  }}
                                  className="p-1.5 hover:bg-white/5 border border-white/5 rounded-xl text-slate-400 hover:text-sky-300 cursor-pointer text-[10px] flex items-center gap-1 transition"
                                  title="Replay simulated browser ring tone"
                                >
                                  <Volume2 className="w-3.5 h-3.5" />
                                  <span className="sm:hidden text-[9px]">Test Sound</span>
                                </button>

                                <button
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    await handleMarkNotifRead(not.id);
                                    playChime('success');
                                  }}
                                  disabled={not.status === 'read'}
                                  className={`px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider transition ${
                                    not.status === 'read'
                                      ? 'bg-white/5 text-slate-500 cursor-not-allowed'
                                      : 'bg-white/10 text-white hover:bg-white/15 cursor-pointer'
                                  }`}
                                >
                                  Read
                                </button>

                                <button
                                  onClick={(e) => { e.stopPropagation(); handleDeleteNotificationLocal(not.id); }}
                                  className="p-1.5 text-slate-500 hover:text-rose-400 rounded-xl bg-white/3 hover:bg-rose-500/10 cursor-pointer"
                                  title="Delete log permanently"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {filteredPushes.length === 0 && (
                        <div className="py-12 text-center text-slate-500 text-xs bg-slate-950/30 rounded-2xl border border-dashed border-white/5">
                          <div className="p-3 bg-white/2 rounded-full border border-dashed border-white/5 w-max mx-auto mb-3">
                            <Smartphone className="w-6 h-6 text-slate-600 animate-bounce" />
                          </div>
                          <p className="font-semibold text-slate-400 mb-1">No Simulated Browser Push History Loaded</p>
                          <p className="text-[10px] text-slate-500 max-w-sm mx-auto mb-4 px-4 leading-relaxed">
                            Start testing now! Use the simulator presets above or trigger automatic seeding to populate logs instantly.
                          </p>
                          <button
                            onClick={handleAutoSeedPushNotifications}
                            className="px-4 py-2 bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-slate-950 text-[10px] font-extrabold rounded-xl uppercase tracking-wider cursor-pointer shadow-md"
                          >
                            🚀 Auto-Seed 5 Demo Push Alerts
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          {/* PLAYGROUND ALERT CENTER NOTIFICATION CENTER */}
          <div className="glass rounded-3xl p-5 border border-white/5 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-sky-400 animate-bounce" />
                <div className="space-y-0.5">
                  <h3 className="text-sm font-extrabold text-white tracking-wide uppercase">MyCar Care Alert Feed</h3>
                  <span className="text-[10px] text-sky-300 block">
                    {unreadCount > 0 ? `⚠️ You have ${unreadCount} unread diagnostic alert logs` : "✅ All diagnostic systems pristine"}
                  </span>
                </div>
              </div>

              {notifications.length > 0 && (
                <button 
                  onClick={handleClearNotifications}
                  className="text-xs text-rose-450 hover:text-rose-400 underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Historical Logs</span>
                </button>
              )}
            </div>

            {/* SEGMENT CATEGORIES TABS ROW */}
            <div className="flex flex-wrap items-center gap-1 bg-slate-950 p-1.5 rounded-2xl border border-white/5 text-[10px] font-bold uppercase tracking-wider overflow-x-auto">
              <button
                onClick={() => setFilterSegment('all')}
                className={`px-3 py-1.5 rounded-xl cursor-pointer ${filterSegment === 'all' ? 'bg-sky-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
              >
                All Feed
              </button>
              <button
                onClick={() => setFilterSegment('maintenance')}
                className={`px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer ${filterSegment === 'maintenance' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
              >
                <Wrench className="w-3 h-3 shrink-0" />
                <span>Maintenance</span>
              </button>
              <button
                onClick={() => setFilterSegment('safety')}
                className={`px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer ${filterSegment === 'safety' ? 'bg-rose-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
              >
                <ShieldAlert className="w-3 h-3 shrink-0" />
                <span>Safety Alerts</span>
              </button>
              <button
                onClick={() => setFilterSegment('garage')}
                className={`px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer ${filterSegment === 'garage' ? 'bg-sky-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
              >
                <Building className="w-3 h-3 shrink-0" />
                <span>Garages</span>
              </button>
              <button
                onClick={() => setFilterSegment('booking')}
                className={`px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer ${filterSegment === 'booking' ? 'bg-violet-500 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <Calendar className="w-3 h-3 shrink-0" />
                <span>Bookings</span>
              </button>
              <button
                onClick={() => setFilterSegment('marketplace')}
                className={`px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer ${filterSegment === 'marketplace' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
              >
                <Tag className="w-3 h-3 shrink-0" />
                <span>Marketplace</span>
              </button>
              <button
                onClick={() => setFilterSegment('forum')}
                className={`px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer ${filterSegment === 'forum' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
              >
                <MessageSquare className="w-3 h-3 shrink-0" />
                <span>Forum</span>
              </button>
              <button
                onClick={() => setFilterSegment('admin')}
                className={`px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer ${filterSegment === 'admin' ? 'bg-pink-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
              >
                <Megaphone className="w-3 h-3 shrink-0" />
                <span>Admin</span>
              </button>
              <button
                onClick={() => setFilterSegment('custom')}
                className={`px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer ${filterSegment === 'custom' ? 'bg-purple-500 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <Clock className="w-3 h-3 shrink-0" />
                <span>User Alarms</span>
              </button>
            </div>

            {/* NOTIFICATION LOGS SCROLLER STACK */}
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {segmentNotifications.map((not) => (
                <div 
                  key={not.id}
                  onClick={() => handleMarkNotifRead(not.id)}
                  className={`p-4 rounded-2xl border transition duration-150 hover:bg-white/5 ${
                    not.status === 'unread' 
                      ? 'bg-slate-900/60 border-sky-500/20 shadow-md' 
                      : not.status === 'snoozed'
                      ? 'bg-purple-950/5 border-purple-900/10 opacity-70'
                      : 'bg-white/2 border-white/5 opacity-70'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs">
                    
                    {/* Log Icon + Content block */}
                    <div className="flex gap-3">
                      <div className="p-2 border border-white/10 rounded-xl bg-slate-950 h-max shrink-0">
                        {getCategoryIcon(not.category)}
                      </div>

                      <div className="space-y-1 text-left">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-bold text-white text-[13px] tracking-tight">{not.title}</span>
                          <span className={`text-[8px] font-extrabold uppercase border px-1.5 py-0.2 rounded ${getPriorityColorBadge(not.priority)}`}>
                            {not.priority || 'Medium'}
                          </span>
                          {not.status === 'unread' && (
                            <span className="bg-sky-400 text-slate-950 text-[8px] px-1 py-0.2 rounded font-sans uppercase font-extrabold animate-pulse">NEW</span>
                          )}
                          {not.status === 'snoozed' && (
                            <span className="bg-purple-400 text-black text-[8px] px-1 py-0.2 rounded font-mono uppercase font-bold">SNOOZED</span>
                          )}
                        </div>

                        <p className="text-slate-200 text-xs leading-relaxed max-w-xl">
                          {not.message}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400 pt-1 font-mono">
                          <span className="bg-white/5 border border-white/5 text-slate-300 px-2 py-0.2 rounded-lg font-sans text-[9px] uppercase tracking-wide">
                            Source: {not.sourceType || 'system'}
                          </span>
                          <span>•</span>
                          <span>Channel: <strong className="text-slate-300">{not.channel || 'In-App'}</strong></span>
                          <span>•</span>
                          <span>{new Date(not.sentAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons panel aligned tightly */}
                    <div className="flex flex-row sm:flex-col items-stretch gap-1.5 self-end sm:self-start w-full sm:w-max shrink-0 pt-2 sm:pt-0">
                      
                      {/* Contextual Record Proposals Actions */}
                      {not.relatedRecordId?.startsWith('req-qr-') && (
                        <>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleApproveProposal(not); }}
                            className="flex-1 sm:w-32 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 font-extrabold text-[10px] text-slate-950 rounded-lg uppercase tracking-wider flex items-center justify-center gap-1 hover:brightness-110 scroll-m-0 hover:scale-[1.01] cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5 text-slate-950" />
                            <span>Approve Record</span>
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleRejectProposal(not); }}
                            className="flex-1 sm:w-32 py-1.5 bg-rose-500/15 border border-rose-500/20 text-rose-300 font-extrabold text-[10px] rounded-lg uppercase tracking-wider flex items-center justify-center hover:bg-rose-500/30 cursor-pointer"
                          >
                            <span>Reject Record</span>
                          </button>
                        </>
                      )}

                      {/* Garage suggestions action approvals */}
                      {not.relatedRecordId?.startsWith('rem-sug-') && (
                        <>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleApproveProposal(not); }}
                            className="flex-1 sm:w-32 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-[10px] rounded-lg uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-slate-950 animate-bounce" />
                            <span>Approve Suggestion</span>
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleRejectProposal(not); }}
                            className="flex-1 sm:w-32 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] rounded-lg tracking-wider font-semibold cursor-pointer"
                          >
                            <span>Dismiss</span>
                          </button>
                        </>
                      )}

                      {/* General buttons */}
                      {!not.relatedRecordId && (
                        <div className="flex sm:flex-col gap-1.5 w-full">
                          {not.category === 'maintenance' && (
                            <button
                              onClick={(e) => { e.stopPropagation(); alert('Deep linking to Booking Portal and routing to closest Phnom Penh clinic map overlay.'); }}
                              className="flex-1 sm:w-32 py-1 px-2.5 bg-sky-500/10 border border-sky-400/20 text-sky-400 font-extrabold text-[10px] rounded-lg uppercase tracking-wider hover:bg-sky-500/20 cursor-pointer"
                            >
                              Book in PP Shop
                            </button>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); handleSnoozeInitiate(not); }}
                            className="flex-1 sm:w-28 py-1 px-2.5 bg-white/5 border border-white/10 text-slate-300 font-bold text-[10px] rounded-lg uppercase flex items-center justify-center gap-1 hover:bg-white/10 cursor-pointer"
                          >
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>Snooze</span>
                          </button>
                        </div>
                      )}

                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteNotificationLocal(not.id); }}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded bg-white/2 hover:bg-rose-500/5 cursor-pointer ml-auto sm:ml-0"
                        title="Delete log permanently"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                </div>
              ))}

              {segmentNotifications.length === 0 && (
                <div className="py-16 text-center text-slate-500 text-xs">
                  <div className="p-3 bg-white/2 rounded-full border border-dashed border-white/5 w-max mx-auto mb-3">
                    <Bell className="w-6 h-6 text-slate-600" />
                  </div>
                  No notifications matching standard segment criteria logged. Trigger alarms below to populate lists instantly.
                </div>
              )}
            </div>
          </div>

          {/* ACTIVE ALARMS AND REMINDERS COMPACT CHECKLIST */}
          <div className="glass rounded-3xl p-5 border border-white/5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4.5 h-4.5 text-emerald-400 animate-spin-slow" />
                <h4 className="text-xs font-bold text-white tracking-wider uppercase">Active Custom Monitoring Monitors</h4>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 px-2 py-0.5 rounded">
                {filteredAlarms.length} Active System Listeners
              </span>
            </div>

            <div className="space-y-3.5 text-xs">
              {filteredAlarms.map((alm) => (
                <div 
                  key={alm.id}
                  className="p-3.5 rounded-2xl bg-white/2 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[13px] text-white py-0.5">{alm.title}</span>
                      <span className="bg-sky-500/10 text-sky-400 text-[9px] px-2 py-0.2 rounded-full font-semibold border border-sky-500/15 uppercase font-sans">
                        {alm.category}
                      </span>
                    </div>

                    <p className="text-slate-300 text-[11px]">
                      {alm.reason || alm.description || 'Continuous telemetry validation active.'}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-[10px] text-slate-400 pt-1 font-mono">
                      {alm.dueDate && (
                        <div className="flex items-center gap-1 text-slate-300 font-sans">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>Expires: <strong className="text-white">{alm.dueDate}</strong></span>
                        </div>
                      )}
                      {alm.dueMileage && (
                        <div className="flex items-center gap-1 text-slate-300 font-sans">
                          <Gauge className="w-3.5 h-3.5 text-slate-500" />
                          <span>Limit: <strong className="text-sky-300 font-mono">{alm.dueMileage.toLocaleString()} km</strong></span>
                        </div>
                      )}
                      {alm.repeatType && alm.repeatType !== 'none' && (
                        <div className="bg-purple-950/20 text-purple-300 border border-purple-500/10 px-2 py-0.2 rounded-full font-mono text-[9px]">
                          🔁 Repeat: {alm.repeatType}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-1.5 self-end sm:self-center shrink-0 w-full sm:w-max">
                    <button
                      onClick={async () => {
                        if (!confirm("Are you sure you want to trigger manual diagnostic safety verification and log standard completed flag?")) return;
                        try {
                          await fetch(`/api/reminders/${alm.id}/complete`, { method: 'POST' });
                          playChime('success');
                          fetchRemindersAndNotifications();
                        } catch (ae) {}
                      }}
                      className="flex-1 py-1 px-3 bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-extrabold text-[10px] rounded-lg tracking-wide uppercase flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Complete Log</span>
                    </button>

                    <button
                      onClick={async () => {
                        if (!confirm("Delete this monitoring alarm immediately?")) return;
                        try {
                          await fetch(`/api/reminders/${alm.id}`, { method: 'DELETE' });
                          playChime('alert');
                          fetchRemindersAndNotifications();
                        } catch (ae) {}
                      }}
                      className="px-2 py-1.5 text-slate-400 hover:text-rose-400 rounded bg-white/2 hover:bg-white/5 border border-transparent cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {filteredAlarms.length === 0 && (
                <div className="py-8 text-center text-slate-500 text-xs">
                  No active custom alarms mapped. Create reminders to deploy continuous telemetry limits.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: TRIGGER PLAYGROUND SIMULATOR + COCKPIT SETTINGS */}
        <div className="lg:col-span-4 space-y-6 text-left">
          
          {/* THE ULTIMATE NOTIFICATION TRIGGER SIMULATOR (13 SCENARIOS) */}
          <div className="glass rounded-3xl p-5 border border-sky-500/15 space-y-4">
            <div className="flex items-center gap-2 border-b border-white/5 pb-2.5">
              <Sliders className="w-4.5 h-4.5 text-sky-400 animate-spin-slow" />
              <h3 className="text-xs font-extrabold text-slate-100 uppercase tracking-widest">
                Notification Trigger Simulator
              </h3>
            </div>

            <p className="text-[10px] text-slate-400 leading-relaxed">
              Force trigger high-fidelity notification scenarios. Select a registered use case to dispatch automated logs instantly into the device notifications log feed.
            </p>

            <div className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Select Scenario Use Case</label>
                <select
                  value={selectedScenario}
                  onChange={(e) => setSelectedScenario(e.target.value)}
                  className="w-full bg-slate-950 p-2.5 rounded-xl border border-white/10 text-slate-200 text-xs font-semibold focus:outline-none focus:border-sky-500 cursor-pointer"
                >
                  {TRIGGER_SCENARIOS.map(sc => (
                    <option key={sc.value} value={sc.value}>{sc.label}</option>
                  ))}
                </select>
                <span className="text-[9px] text-slate-400 italic block pt-1 px-1">
                  {TRIGGER_SCENARIOS.find(s => s.value === selectedScenario)?.desc}
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Custom Message Override (Optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g. Phnom Penh street flood has reached 40cm..."
                  value={scenarioCustomText}
                  onChange={(e) => setScenarioCustomText(e.target.value)}
                  className="w-full bg-slate-950 p-2 text-xs rounded-lg border border-white/10 text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <button
                onClick={handleTriggerSimulatedAlert}
                disabled={triggeringLoading}
                className="w-full py-2.5 bg-sky-500/10 border border-sky-400/30 hover:bg-sky-500/25 text-sky-400 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {triggeringLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                )}
                <span>Trigger Live Simulation Alert</span>
              </button>
            </div>
          </div>

          {/* USER NOTIFICATION SETTINGS CONTROLS (CATEGORY-SPECIFIC TOGGLES) */}
          <div className="glass rounded-3xl p-5 space-y-4 border border-white/5 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
              <div className="flex items-center gap-2">
                <Settings className="w-4.5 h-4.5 text-cyan-400 animate-spin-slow" />
                <h3 className="text-xs font-extrabold text-slate-100 uppercase tracking-widest font-sans">
                  Notification Center
                </h3>
              </div>
            </div>

            {/* SUBLAYOUT TAB SELECTORS */}
            <div className="flex gap-1 bg-slate-950 p-1 rounded-xl text-[10px] font-bold uppercase">
              <button
                type="button"
                onClick={() => setSettingsViewTab('channels')}
                className={`flex-1 py-1 px-2 rounded-lg transition-all ${settingsViewTab === 'channels' ? 'bg-cyan-500 text-slate-950' : 'text-slate-450 hover:text-slate-200'}`}
              >
                Preferences
              </button>
              <button
                type="button"
                onClick={() => setSettingsViewTab('telegram_setup')}
                className={`flex-1 py-1 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${settingsViewTab === 'telegram_setup' ? 'bg-cyan-500 text-slate-950' : 'text-slate-450 hover:text-slate-200'}`}
              >
                <MessageCircle className="w-3 h-3 shrink-0" />
                <span>Telegram {settings.telegramConnected && "🟢"}</span>
              </button>
              <button
                type="button"
                onClick={() => setSettingsViewTab('garages')}
                className={`flex-1 py-1 px-2 rounded-lg transition-all ${settingsViewTab === 'garages' ? 'bg-cyan-500 text-slate-950' : 'text-slate-450 hover:text-slate-200'}`}
              >
                Garages Block
              </button>
            </div>

            {/* TAB CONTENT A: CHANNELS & PREFERENCES */}
            {settingsViewTab === 'channels' && (
              <div className="space-y-4">
                {/* CHANNEL TOGGLES */}
                <div className="space-y-2 pb-3.5 border-b border-white/5 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Smartphone className="w-4 h-4 text-sky-400" />
                      <span>App Notification Push (FCM)</span>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={settings.pushEnabled}
                      onChange={(e) => {
                        const updated = { ...settings, pushEnabled: e.target.checked };
                        setSettings(updated);
                        updateSettingsAPI(updated);
                      }}
                      className="rounded bg-slate-950 border-white/10 text-cyan-500 focus:ring-0 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Mail className="w-4 h-4 text-emerald-400" />
                      <span>Email Alerts Digest</span>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={settings.emailEnabled}
                      onChange={(e) => {
                        const updated = { ...settings, emailEnabled: e.target.checked };
                        setSettings(updated);
                        updateSettingsAPI(updated);
                      }}
                      className="rounded bg-slate-950 border-white/10 text-cyan-500 focus:ring-0 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-300">
                      <MessageCircle className="w-4 h-4 text-cyan-400" />
                      <span>Telegram Notifications Channel</span>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={settings.telegramEnabled}
                      onChange={(e) => {
                        const updated = { ...settings, telegramEnabled: e.target.checked };
                        setSettings(updated);
                        updateSettingsAPI(updated);
                      }}
                      className="rounded bg-slate-950 border-white/10 text-cyan-500 focus:ring-0 cursor-pointer"
                    />
                  </div>
                </div>

                {/* CATEGORY BLOCK-BY-BLOCK TOGGLES */}
                <div className="space-y-3 text-xs">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-widest">Active Capability Preferences</span>
                  
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">🔧 Maintenance Reminders</span>
                      <input 
                        type="checkbox" 
                        checked={settings.allowMaintenanceReminders}
                        onChange={(e) => {
                          const updated = { ...settings, allowMaintenanceReminders: e.target.checked };
                          setSettings(updated);
                          updateSettingsAPI(updated);
                        }}
                        className="rounded bg-slate-955 text-cyan-500 cursor-pointer focus:ring-0"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">🛠️ Garage Service Updates</span>
                      <input 
                        type="checkbox" 
                        checked={settings.allowGarageServiceUpdates}
                        onChange={(e) => {
                          const updated = { ...settings, allowGarageServiceUpdates: e.target.checked };
                          setSettings(updated);
                          updateSettingsAPI(updated);
                        }}
                        className="rounded bg-slate-955 text-cyan-500 cursor-pointer focus:ring-0"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">🧾 Invoice Billing Notifications</span>
                      <input 
                        type="checkbox" 
                        checked={settings.allowInvoiceNotifications}
                        onChange={(e) => {
                          const updated = { ...settings, allowInvoiceNotifications: e.target.checked };
                          setSettings(updated);
                          updateSettingsAPI(updated);
                        }}
                        className="rounded bg-slate-955 text-cyan-500 cursor-pointer focus:ring-0"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">📈 Quotation Approval Requests</span>
                      <input 
                        type="checkbox" 
                        checked={settings.allowQuotationRequests}
                        onChange={(e) => {
                          const updated = { ...settings, allowQuotationRequests: e.target.checked };
                          setSettings(updated);
                          updateSettingsAPI(updated);
                        }}
                        className="rounded bg-slate-955 text-cyan-500 cursor-pointer focus:ring-0"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">🛡️ Warranty Reminders</span>
                      <input 
                        type="checkbox" 
                        checked={settings.allowWarrantyReminders}
                        onChange={(e) => {
                          const updated = { ...settings, allowWarrantyReminders: e.target.checked };
                          setSettings(updated);
                          updateSettingsAPI(updated);
                        }}
                        className="rounded bg-slate-955 text-cyan-500 cursor-pointer focus:ring-0"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">🎁 Garage Promotion Offers</span>
                      <input 
                        type="checkbox" 
                        checked={settings.allowGaragePromotions}
                        onChange={(e) => {
                          const updated = { ...settings, allowGaragePromotions: e.target.checked };
                          setSettings(updated);
                          updateSettingsAPI(updated);
                        }}
                        className="rounded bg-slate-955 text-cyan-500 cursor-pointer focus:ring-0"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-300 flex items-center gap-1 font-semibold text-rose-450">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>🚨 Emergency Safety Alerts</span>
                      </span>
                      <input 
                        type="checkbox" 
                        checked={settings.allowEmergencyAlerts}
                        onChange={(e) => {
                          const updated = { ...settings, allowEmergencyAlerts: e.target.checked };
                          setSettings(updated);
                          updateSettingsAPI(updated);
                        }}
                        className="rounded bg-slate-955 text-cyan-500 cursor-pointer focus:ring-0"
                      />
                    </div>
                  </div>

                  {/* QUIET HOURS COCKPIT INPUTS */}
                  <div className="bg-slate-950 p-3 rounded-2xl border border-white/5 space-y-2 mt-3 text-xs">
                    <span className="text-[10px] text-slate-400 block font-bold font-mono">🌙 Silent Quiet Hours</span>
                    <div className="flex items-center gap-2">
                      <input 
                        type="time" 
                        value={settings.quietHoursStart} 
                        onChange={(e) => {
                          const updated = { ...settings, quietHoursStart: e.target.value };
                          setSettings(updated);
                          updateSettingsAPI(updated);
                        }}
                        className="bg-slate-900 border border-white/10 p-1 rounded font-mono text-center text-[11px] text-slate-300 w-full"
                      />
                      <span className="text-slate-500 text-[10px]">to</span>
                      <input 
                        type="time" 
                        value={settings.quietHoursEnd} 
                        onChange={(e) => {
                          const updated = { ...settings, quietHoursEnd: e.target.value };
                          setSettings(updated);
                          updateSettingsAPI(updated);
                        }}
                        className="bg-slate-900 border border-white/10 p-1 rounded font-mono text-center text-[11px] text-slate-300 w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT B: TELEGRAM BOT SETUP & SIMULATOR */}
            {settingsViewTab === 'telegram_setup' && (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 bg-slate-950 border border-white/5 rounded-2xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-300 block uppercase text-[10px] tracking-wider">Connection Status</span>
                    {settings.telegramConnected ? (
                      <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 px-2.5 py-0.5 rounded-full font-bold uppercase">Connected🟢</span>
                    ) : (
                      <span className="text-[9px] bg-amber-500/15 border border-amber-500/25 text-amber-400 px-2.5 py-0.5 rounded-full font-bold uppercase">Offline🔴</span>
                    )}
                  </div>

                  {settings.telegramConnected ? (
                    <div className="space-y-1.5 pt-1 border-t border-white/5 text-[10px]">
                      <div className="flex justify-between text-slate-400">
                        <span>Username:</span>
                        <strong className="text-cyan-400 font-mono font-bold">{settings.telegramUsername || "@YeonPisith_Telegram"}</strong>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Chat ID:</span>
                        <strong className="text-slate-350 font-mono font-medium">{settings.telegramChatId || "88219034"}</strong>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Paired At:</span>
                        <strong className="text-slate-450">{settings.telegramConnectedAt ? new Date(settings.telegramConnectedAt).toLocaleDateString() : "Just Now"}</strong>
                      </div>
                      
                      <button
                        type="button"
                        onClick={async () => {
                          const res = await fetch("/api/telegram/simulate-bot-command", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ text: "/disconnect" })
                          });
                          if (res.ok) {
                            playChime('error');
                            fetchTelegramStatus();
                            setTelegramBotReplies(prev => [...prev, {
                              sender: 'bot',
                              text: '🗑 Pairing Removed successfully. Your Telegram Chat ID has been wiped.',
                              timestamp: new Date().toLocaleTimeString()
                            }]);
                          }
                        }}
                        className="w-full mt-2.5 py-1.5 bg-rose-500/10 border border-rose-500/15 hover:bg-rose-500/20 text-rose-450 hover:text-rose-400 font-bold uppercase text-[9px] rounded-lg transition"
                      >
                        Disconnect Telegram Account
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5 text-slate-300">
                      <p className="text-[10.5px] text-slate-400 leading-normal">
                        Verify and sync diagnostics updates securely via the official <strong>@MyCarCareKH_Bot</strong>.
                      </p>

                      <div className="p-2.5 bg-slate-900 border border-white/5 rounded-xl flex items-center justify-between gap-1">
                        <div className="space-y-0.5">
                          <span className="text-[8px] uppercase tracking-wider text-slate-400 block font-mono">Verification Token</span>
                          <strong className="text-sm font-mono text-yellow-400 tracking-wider font-extrabold">{settings.verificationToken || "KH-9901"}</strong>
                        </div>

                        <button
                          type="button"
                          onClick={handleGenerateTelegramToken}
                          disabled={generatingToken}
                          className="px-3 py-1.5 bg-cyan-500 text-slate-950 hover:bg-cyan-400 disabled:opacity-45 text-[9px] font-extrabold uppercase rounded-lg shadow-lg shadow-cyan-500/10"
                        >
                          {generatingToken ? "..." : "New Token"}
                        </button>
                      </div>

                      <div className="text-[9px] text-purple-300 leading-relaxed max-w-sm">
                        💡 Copy verification code, search <strong>@MyCarCareKH_Bot</strong> on Telegram, click Start, and submit the pairing token.
                      </div>
                    </div>
                  )}
                </div>

                {/* TELEGRAM BOT INTERACTIVE EMBEDDED SIMULATOR */}
                <div className="p-3.5 bg-slate-950 border border-cyan-500/10 rounded-2xl space-y-3">
                  <div className="flex items-center gap-1.5 text-cyan-400">
                    <MessageCircle className="w-4 h-4 shrink-0 animate-pulse" />
                    <span className="font-extrabold text-[10px] uppercase tracking-widest block">Bot Live Sandbox Simulator</span>
                  </div>

                  <p className="text-[9px] text-slate-400 leading-normal">
                    You don't need a real Telegram account! Test bot commands of <strong>MyCar Care KH Telegram Bot</strong> locally below:
                  </p>

                  {/* Chat logs feed */}
                  <div className="bg-slate-900 border border-white/5 rounded-xl p-2.5 h-36 overflow-y-auto space-y-2 font-sans text-[10.5px]">
                    {telegramBotReplies.map((reply, index) => (
                      <div key={index} className={`flex flex-col ${reply.sender === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`p-2 rounded-xl max-w-[85%] whitespace-pre-wrap leading-normal ${reply.sender === 'user' ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-950 border border-white/5 text-slate-200'}`}>
                          {reply.text}
                        </div>
                        <span className="text-[7.5px] text-slate-500 block px-1 mt-0.5">{reply.timestamp}</span>
                      </div>
                    ))}
                  </div>

                  {/* Chat quick input buttons */}
                  <div className="grid grid-cols-3 gap-1 text-[8.5px] font-bold tracking-tight uppercase">
                    <button
                      type="button"
                      onClick={() => {
                        const token = settings.verificationToken || "KH-9901";
                        setTelegramBotInput(`/start ${token}`);
                      }}
                      className="py-1 bg-slate-900 hover:bg-slate-800 text-slate-350 rounded border border-white/5"
                    >
                      /start [token]
                    </button>
                    <button
                      type="button"
                      onClick={() => setTelegramBotInput('/status')}
                      className="py-1 bg-slate-900 hover:bg-slate-800 text-slate-350 rounded border border-white/5"
                    >
                      /status
                    </button>
                    <button
                      type="button"
                      onClick={() => setTelegramBotInput('/help')}
                      className="py-1 bg-slate-900 hover:bg-slate-800 text-slate-350 rounded border border-white/5"
                    >
                      /help
                    </button>
                  </div>

                  {/* Manual input form */}
                  <form onSubmit={handleSendSimulatedBotCommand} className="flex gap-1.5 pt-1.5 border-t border-white/5">
                    <input
                      type="text"
                      placeholder="e.g. /start KH-XXXX"
                      value={telegramBotInput}
                      onChange={(e) => setTelegramBotInput(e.target.value)}
                      className="flex-1 bg-slate-900 border border-white/10 px-2 py-1.5 rounded-lg text-white font-mono text-[10.5px] focus:outline-none focus:border-cyan-500"
                    />
                    <button
                      type="submit"
                      className="px-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold rounded-lg uppercase text-[9px]"
                    >
                      Send
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* TAB CONTENT C: GARAGE BLOCKS & Direct permissions CRM */}
            {settingsViewTab === 'garages' && (
              <div className="space-y-4 text-xs">
                <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-widest">Active Partner Privileges</span>
                
                <p className="text-[9.5px] text-slate-400 leading-normal">
                  Control which repair shops of MyCar Care platform can push direct custom alerts, invoices, or coupons over Telegram.
                </p>

                <div className="space-y-2.5">
                  {(telegramStatus.permissions || []).map((perm: any) => (
                    <div key={perm.id} className="p-3 bg-slate-950 border border-white/5 rounded-2xl space-y-2.5">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-200 block text-[10.5px]">{perm.garageName}</strong>
                        {perm.blockedByUser ? (
                          <span className="text-[8px] bg-rose-500/10 text-rose-400 border border-rose-500/25 px-1.5 py-0.2 rounded font-mono font-bold uppercase">BLOCKED</span>
                        ) : (
                          <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-1.5 py-0.2 rounded font-mono font-bold uppercase">ALLOWED</span>
                        )}
                      </div>

                      {/* Toggles */}
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[9.5px] text-slate-400 pt-1.5 border-t border-dashed border-white/5">
                        <div className="flex justify-between items-center">
                          <span>Status updates:</span>
                          <input 
                            type="checkbox" 
                            disabled={perm.blockedByUser}
                            checked={perm.allowServiceUpdates}
                            onChange={async (e) => {
                              await fetch("/api/telegram/update-garage-permissions", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  ...perm,
                                  allowServiceUpdates: e.target.checked
                                })
                              });
                              fetchTelegramStatus();
                            }}
                            className="rounded bg-slate-900 border-white/10 text-cyan-500 scale-75 cursor-pointer disabled:opacity-30"
                          />
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Invoices:</span>
                          <input 
                            type="checkbox" 
                            disabled={perm.blockedByUser}
                            checked={perm.allowInvoiceMessages}
                            onChange={async (e) => {
                              await fetch("/api/telegram/update-garage-permissions", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  ...perm,
                                  allowInvoiceMessages: e.target.checked
                                })
                              });
                              fetchTelegramStatus();
                            }}
                            className="rounded bg-slate-900 border-white/10 text-cyan-500 scale-75 cursor-pointer disabled:opacity-30"
                          />
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Reminders:</span>
                          <input 
                            type="checkbox" 
                            disabled={perm.blockedByUser}
                            checked={perm.allowReminders}
                            onChange={async (e) => {
                              await fetch("/api/telegram/update-garage-permissions", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  ...perm,
                                  allowReminders: e.target.checked
                                })
                              });
                              fetchTelegramStatus();
                            }}
                            className="rounded bg-slate-900 border-white/10 text-cyan-500 scale-75 cursor-pointer disabled:opacity-30"
                          />
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Promotions:</span>
                          <input 
                            type="checkbox" 
                            disabled={perm.blockedByUser}
                            checked={perm.allowPromotions}
                            onChange={async (e) => {
                              await fetch("/api/telegram/update-garage-permissions", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  ...perm,
                                  allowPromotions: e.target.checked
                                })
                              });
                              fetchTelegramStatus();
                            }}
                            className="rounded bg-slate-900 border-white/10 text-cyan-500 scale-75 cursor-pointer disabled:opacity-30"
                          />
                        </div>
                      </div>

                      {/* Block / Spam Buttons */}
                      <div className="flex gap-1.5 pt-2">
                        <button
                          type="button"
                          onClick={() => handleToggleBlockGarage(perm.garageId)}
                          className="flex-1 py-1 text-[9px] font-bold uppercase rounded bg-slate-900 hover:bg-slate-800 text-slate-350 border border-white/10"
                        >
                          {perm.blockedByUser ? "Unblock Garage" : "Block Garage"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReportSpam(perm.garageId)}
                          disabled={perm.reportedSpam}
                          className="flex-1 py-1 text-[9px] font-bold uppercase rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-450 border border-rose-500/15 disabled:opacity-40"
                        >
                          {perm.reportedSpam ? "Reported Spam 🛡️" : "Report Spam"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* RETHINK SAFETY RECALL SYSTEM TOGGLE DEEP PROTECTION SYSTEM MODAL */}
      {showSafetyWarning && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/20 max-w-md w-full rounded-2xl p-6 space-y-4 shadow-2xl relative text-left">
            <div className="flex gap-3 text-rose-450">
              <AlertTriangle className="w-10 h-10 text-rose-400 shrink-0" />
              <div className="space-y-1.5">
                <h4 className="text-base font-extrabold text-white">Disable Safety Warning Advisories?</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Safety alerts are highly recommended. Disabling them might prevent you from receiving urgent manufacture recall bulletins (e.g., airbag hazards, structural suspension rust logs), and dangerous coolant/brake status diagnostics.
                </p>
                <div className="bg-rose-950/20 border border-rose-500/15 p-2 rounded text-[10px] text-rose-300">
                  🚨 Warning: Vehicle owner assumes critical regulatory and road security liability for overriding warnings.
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2 text-xs">
              <button
                onClick={() => { setShowSafetyWarning(false); playChime('success'); }}
                className="px-4 py-2 bg-gradient-to-r from-sky-500 to-teal-500 text-slate-950 font-extrabold rounded-xl hover:brightness-110 cursor-pointer"
              >
                Keep Enabled (Recommended)
              </button>
              
              <button
                type="button"
                onClick={confirmSafetyDisable}
                className="px-4 py-2 bg-white/5 hover:bg-rose-500/10 hover:text-rose-400 text-slate-400 font-bold rounded-xl cursor-pointer"
              >
                Disable Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMPREHENSIVE SNOOZE POPUP DIALOG */}
      {snoozingNotif && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 max-w-md w-full rounded-3xl p-6 space-y-4 shadow-2xl relative text-left">
            <div className="flex items-center gap-2 border-b border-white/5 pb-2.5">
              <Clock className="w-5 h-5 text-sky-400" />
              <h4 className="text-sm font-extrabold text-white uppercase tracking-wide">
                Snooze Alarm Notification
              </h4>
            </div>

            <p className="text-xs text-slate-300 leading-normal">
              Choose snooze parameters for: <strong>{snoozingNotif.title}</strong>
            </p>

            <div className="space-y-3.5 text-xs">
              {/* Snooze Switch Type */}
              <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl">
                <button
                  onClick={() => setSnoozeType('days')}
                  className={`flex-1 py-1 px-2.5 rounded-lg text-[10px] font-bold uppercase transition cursor-pointer ${
                    snoozeType === 'days' ? 'bg-sky-500 text-slate-950' : 'text-slate-400'
                  }`}
                >
                  By Days
                </button>
                <button
                  onClick={() => setSnoozeType('mileage')}
                  className={`flex-1 py-1 px-2.5 rounded-lg text-[10px] font-bold uppercase transition cursor-pointer ${
                    snoozeType === 'mileage' ? 'bg-sky-500 text-slate-950' : 'text-slate-400'
                  }`}
                >
                  By Mileage
                </button>
                <button
                  onClick={() => setSnoozeType('date')}
                  className={`flex-1 py-1 px-2.5 rounded-lg text-[10px] font-bold uppercase transition cursor-pointer ${
                    snoozeType === 'date' ? 'bg-sky-500 text-slate-950' : 'text-slate-400'
                  }`}
                >
                  Custom Date
                </button>
              </div>

              {/* Snooze values input block */}
              {snoozeType === 'days' && (
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">How many days would you like to snooze?</label>
                  <select
                    value={snoozeDays}
                    onChange={(e) => setSnoozeDays(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 p-2.5 rounded-xl text-slate-200"
                  >
                    <option value="1">Remind me tomorrow (1 day)</option>
                    <option value="3">Remind me in 3 days</option>
                    <option value="7">Remind me next week (7 days)</option>
                    <option value="30">Remind me next month (30 days)</option>
                  </select>
                </div>
              )}

              {snoozeType === 'mileage' && (
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">How much mileage offset (km)?</label>
                  <select
                    value={snoozeMileage}
                    onChange={(e) => setSnoozeMileage(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 p-2.5 rounded-xl text-slate-200 font-mono"
                  >
                    <option value="500">Snooze after 500 km</option>
                    <option value="1000">Snooze after 1,000 km</option>
                    <option value="2500">Snooze after 2,500 km</option>
                  </select>
                </div>
              )}

              {snoozeType === 'date' && (
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Select Target Reminder Expiry Date</label>
                  <input
                    type="date"
                    required
                    value={snoozeDate}
                    onChange={(e) => setSnoozeDate(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 p-2.5 rounded-xl text-white"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2.5 pt-2 text-xs">
              <button
                onClick={() => setSnoozingNotif(null)}
                className="px-4 py-2 border border-white/10 text-slate-300 hover:bg-white/10 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              
              <button
                onClick={handleSnoozeConfirm}
                className="px-5 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold rounded-xl shadow-lg shadow-sky-500/10 cursor-pointer"
              >
                Snooze Alarm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING LIVE BROWSER WEB PUSH TOAST POPUP */}
      {livePushToast && (
        <div className="fixed top-4 right-4 z-50 max-w-sm bg-slate-950/95 border border-white/15 shadow-2xl rounded-2xl p-4 animate-slide-in backdrop-blur-md">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-xl shrink-0 ${livePushToast.priority === 'High' || livePushToast.priority === 'Critical' ? 'bg-rose-500/20 border border-rose-500/40 text-rose-400 animate-pulse' : 'bg-sky-500/10 border border-sky-500/25 text-sky-400'}`}>
              <Smartphone className="w-5 h-5" />
            </div>
            <div className="flex-1 space-y-1 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-slate-400 font-mono tracking-widest uppercase font-extrabold">Chrome Web Push Alert</span>
                <button 
                  onClick={() => setLivePushToast(null)}
                  className="p-1 hover:bg-white/5 rounded-full text-slate-450 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <h4 className="font-extrabold text-white text-xs">{livePushToast.title}</h4>
              <p className="text-slate-300 text-[11px] leading-relaxed">{livePushToast.message}</p>
              <div className="flex items-center gap-2 pt-2 text-[9px] uppercase tracking-wider font-extrabold">
                <button 
                  onClick={() => {
                    setLivePushToast(null);
                    const el = document.getElementById("push-notification-center");
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="px-2.5 py-1 bg-white/10 text-white hover:bg-white/15 rounded cursor-pointer"
                >
                  Open Alert Feed
                </button>
                <button 
                  onClick={() => setLivePushToast(null)}
                  className="px-2.5 py-1 text-slate-400 hover:text-slate-200 rounded cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
