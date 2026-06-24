/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Coins, 
  Gift, 
  Trash2, 
  FileText, 
  Plus, 
  ShieldCheck, 
  Search, 
  Phone, 
  Star, 
  ExternalLink, 
  Flame, 
  Truck, 
  Tag, 
  Check, 
  X, 
  Camera, 
  Send, 
  MessageSquare, 
  MapPin, 
  Award, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Lock, 
  BookOpen, 
  AlertOctagon, 
  Grid, 
  TrendingUp, 
  Calendar, 
  UserCheck, 
  Building, 
  LayoutDashboard, 
  RefreshCw, 
  Filter, 
  Bell, 
  HelpCircle,
  Clock,
  ShieldAlert,
  Sliders,
  DollarSign,
  ChevronRight,
  Info
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";
import { VehicleProfile, MaintenanceRecord } from "../types";
import PremiumVehicleReport from "./PremiumVehicleReport";
import PremiumDreamCarAdvisor from "./PremiumDreamCarAdvisor";
import PremiumServiceHistoryExport from "./PremiumServiceHistoryExport";
import CareCoinWallet from "./CareCoinWallet";

export interface DonationPost {
  id: string;
  itemName: string;
  vehicleBrand: string;
  vehicleModel: string;
  year: number;
  engineType: string;
  condition: 'new' | 'used' | 'refurbished' | 'damaged but usable';
  category: 'engine' | 'tire' | 'battery' | 'body part' | 'EV part' | 'interior' | 'exterior' | 'accessory' | 'tool' | 'other';
  photoUrl: string;
  location: string;
  pickupOption: 'pickup' | 'delivery' | 'either';
  donationType: 'free' | 'coin_reward' | 'coin_bidding' | 'exchange' | 'cash' | 'cash_coin_priority';
  wantsCoins: boolean;
  minBidCoins?: number;
  currentBidCoins?: number;
  currentBidderId?: number;
  currentBidderName?: string;
  auctionEnd?: string; // YYYY-MM-DD
  status: 'Draft' | 'Pending Review' | 'Approved' | 'Open for Request' | 'Open for Coin Bidding' | 'Coins Locked' | 'Waiting for Pickup' | 'Completed' | 'Cancelled' | 'Disputed' | 'Rejected';
  completionPendingReceiver?: boolean;
  completionPendingDonor?: boolean;
  donorId: number;
  donorName: string;
  donorReputation: string;
  suggestedCoins: number;
  verificationLevel: 'None' | 'Garage Verified' | 'Admin Audited';
  verifierName?: string;
  disputeNotes?: string;
  flaggedFake?: boolean;
  createdAt: string;
}

export interface CoinTransaction {
  id: string;
  date: string;
  activity: string;
  category: 'donation' | 'bidding' | 'forum' | 'location' | 'spent' | 'admin' | 'refund';
  coins: number;
  status: 'Completed' | 'Pending' | 'Locked' | 'Refunded';
}

interface MyCarCareCoinSystemProps {
  vehicles: VehicleProfile[];
  records: MaintenanceRecord[];
  activeUser: any;
  onRefreshData?: () => void;
}

export default function MyCarCareCoinSystem({
  vehicles = [],
  records = [],
  activeUser,
  onRefreshData
}: MyCarCareCoinSystemProps) {
  // Navigation: Sub-menu toggles
  const [activeTab, setActiveTab] = useState<'listings' | 'wallet' | 'forum_contrib' | 'location_contrib' | 'spending' | 'garage_expert' | 'admin_dashboard' | 'reports'>('listings');
  
  // Simulation switches to test Driver, Expert, and Admin consoles easily
  const [roleOverride, setRoleOverride] = useState<string>("");
  const activeUserRole = roleOverride || activeUser?.role || "Driver";

  // States: Main Data lists
  const [donations, setDonations] = useState<DonationPost[]>([]);
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [forumRewards, setForumRewards] = useState<any[]>([]);
  const [locationContributions, setLocationContributions] = useState<any[]>([]);
  
  // Wallet States (Derived with safety fallbacks from localStorage or simulated user)
  const [wallet, setWallet] = useState({
    available: 12,
    locked: 0,
    pending: 0,
    earned: 65,
    spent: 43,
    refunded: 10
  });

  // User Reputation logic
  const [userRep, setUserRep] = useState({
    points: 120, // 1 point per completed task
    level: "Active Helper" // Calculated below
  });

  // Premium Features, Unlocks & Posting Boosts States
  const [unlockedFeatures, setUnlockedFeatures] = useState<string[]>(() => {
    const saved = localStorage.getItem("care_coin_unlocked_features");
    return saved ? JSON.parse(saved) : [];
  });

  const [boostedPosts, setBoostedPosts] = useState<Record<string, { package: string, duration: string, end: string, impressions: number, clicks: number, messages: number, conversions: number, createdAt: string }>>((() => {
    const saved = localStorage.getItem("care_coin_boosted_posts");
    return saved ? JSON.parse(saved) : {};
  }));

  const [activePremiumFeature, setActivePremiumFeature] = useState<string | null>(null);

  // State inside "spending" for inner tab toggle
  const [spendingInnerTab, setSpendingInnerTab] = useState<'premium' | 'boosting'>('premium');
  
  // State for post boosting targeting
  const [selectedPostToBoost, setSelectedPostToBoost] = useState<string>("");

  // ==========================================
  // EXTENDED CARE COIN WALLET MANAGEMENT STATES
  // ==========================================
  
  // Wallet Sub-Tab Selection
  const [walletSubTab, setWalletSubTab] = useState<'overview' | 'earn' | 'use' | 'history' | 'locked_pending' | 'boosts' | 'premium'>('overview');
  
  // Super Admin Sub-Tab Selection
  const [adminSubTab, setAdminSubTab] = useState<'auditing' | 'wallets' | 'rules' | 'economy_report'>('auditing');

  // Multi-user user_wallets Table
  const [userWallets, setUserWallets] = useState<any[]>(() => {
    const saved = localStorage.getItem("care_coin_user_wallets");
    if (saved) return JSON.parse(saved);
    return [
      {
        userId: "usr-1",
        name: activeUser?.name || "Sophea Rith",
        email: activeUser?.email || "pisith.yeen@gmail.com",
        phone: "+855 12 345 678",
        role: activeUser?.role || "Driver",
        available: 12,
        locked: 0,
        pending: 0,
        lifetimeEarned: 65,
        lifetimeSpent: 43,
        reputationLevel: "Active Helper",
        status: "Active",
        suspendEarning: false
      },
      {
        userId: "usr-2",
        name: "Chan Dara",
        email: "dara.chan@gmail.com",
        phone: "+855 99 888 777",
        role: "Driver",
        available: 45,
        locked: 10,
        pending: 5,
        lifetimeEarned: 110,
        lifetimeSpent: 55,
        reputationLevel: "Trusted Contributor",
        status: "Active",
        suspendEarning: false
      },
      {
        userId: "usr-3",
        name: "Vibol Ken",
        email: "ken.vibol@vibolauto.kh",
        phone: "+855 16 999 111",
        role: "Garage Owner",
        available: 120,
        locked: 15,
        pending: 20,
        lifetimeEarned: 280,
        lifetimeSpent: 145,
        reputationLevel: "Garage Partner",
        status: "Active",
        suspendEarning: false
      },
      {
        userId: "usr-4",
        name: "Chhim Dara",
        email: "dara.chhim@freeforce.kh",
        phone: "+855 77 666 555",
        role: "Freelance Mechanic",
        available: 25,
        locked: 5,
        pending: 10,
        lifetimeEarned: 85,
        lifetimeSpent: 55,
        reputationLevel: "Community Mechanic",
        status: "Limited",
        suspendEarning: false
      },
      {
        userId: "usr-5",
        name: "Apsara Fast Garage",
        email: "service@apsaragroups.com",
        phone: "+855 23 456 789",
        role: "Business Owner",
        available: 180,
        locked: 0,
        pending: 30,
        lifetimeEarned: 350,
        lifetimeSpent: 170,
        reputationLevel: "Top Contributor",
        status: "Active",
        suspendEarning: false
      },
      {
        userId: "usr-6",
        name: "Sok Mean",
        email: "sokmean.driver@gmail.com",
        phone: "+855 92 121 212",
        role: "Driver",
        available: 2,
        locked: 0,
        pending: 0,
        lifetimeEarned: 22,
        lifetimeSpent: 20,
        reputationLevel: "New Member",
        status: "Suspended",
        suspendEarning: true
      }
    ];
  });

  // coin_rules Configuration Table
  const [coinRules, setCoinRules] = useState(() => {
    const saved = localStorage.getItem("care_coin_rules");
    if (saved) return JSON.parse(saved);
    return {
      donationRewardMin: 5,
      donationRewardMax: 25,
      forumHelpReward: 3,
      forumAcceptedReward: 10,
      addPetrolStationReward: 2,
      addGarageReward: 5,
      addEvStationReward: 5,
      addShopReward: 4,
      uploadPhotoReward: 1,
      addHoursReward: 1,
      reportIncorrectReward: 1,
      shareExperienceReward: 5,
      boostBasicCost: 5,
      boostSuperCost: 10,
      boostMegaCost: 20,
      premiumAdvisorCost: 5,
      premiumReportCost: 10,
      premiumComparisonCost: 8,
      premiumDiscountCost: 15,
      newUserLimit: 50,
      dailyEarningLimit: 15,
      dailySpendingLimit: 30,
      businessUserBoostPrice: 15,
      coinExpiryPeriodMonths: 6,
      minReputationForPremium: 30
    };
  });

  const saveCoinRules = (rules: any) => {
    setCoinRules(rules);
    localStorage.setItem("care_coin_rules", JSON.stringify(rules));
  };

  // premium_unlocks Purchased Features list
  const [premiumUnlocks, setPremiumUnlocks] = useState<any[]>(() => {
    const saved = localStorage.getItem("care_coin_premium_unlocks");
    if (saved) return JSON.parse(saved);
    return [
      { id: "un-1", featureName: "Unlimited Garage AI Advice", cost: 5, duration: "30 Days", status: 'Active', vehicleName: "Toyota Prius (2010)", expiryDate: "2026-07-03" },
      { id: "un-2", featureName: "Premium Diagnostic PDF", cost: 10, duration: "Lifetime", status: 'Active', vehicleName: "BYD Atto 3 (2023)", expiryDate: "Never" }
    ];
  });

  const savePremiumUnlocks = (unlocks: any[]) => {
    setPremiumUnlocks(unlocks);
    localStorage.setItem("care_coin_premium_unlocks", JSON.stringify(unlocks));
  };

  // coin_disputes Escrow Disputes List
  const [coinDisputes, setCoinDisputes] = useState<any[]>(() => {
    const saved = localStorage.getItem("care_coin_disputes");
    if (saved) return JSON.parse(saved);
    return [
      {
        id: "dsp-1",
        postId: "post-1",
        itemName: "Prius Inverter Fan",
        buyerName: "Sophea Rith",
        donorName: "Chan Dara",
        amount: 14,
        status: "Open",
        complaintNotes: "The item has a cracked socket plug and doesn't rotate, seeking full refund.",
        createdAt: "2026-06-03"
      }
    ];
  });

  const saveCoinDisputes = (disputes: any[]) => {
    setCoinDisputes(disputes);
    localStorage.setItem("care_coin_disputes", JSON.stringify(disputes));
  };

  // Wallet and System Notifications Hub
  const [walletNotifications, setWalletNotifications] = useState<any[]>(() => {
    const saved = localStorage.getItem("care_coin_notifications");
    if (saved) return JSON.parse(saved);
    return [
      { id: "not-1", title: "Welcome Credit Received", message: "You received +10 Coins onboarding reward!", type: "earned", timestamp: "2026-06-01 10:00", read: false },
      { id: "not-2", title: "Map Addition Verified", message: "Your petrol station pin Sokha Auto paint has been approved. +2 Coins added.", type: "earned", timestamp: "2026-06-02 14:30", read: false },
      { id: "not-3", title: "Bidding Lock Alert", message: "Your bid of 10 Coins for Prius Inverter Fan is held in escrow.", type: "locked", timestamp: "2026-06-03 08:20", read: true }
    ];
  });

  const addNotificationAndSave = (title: string, message: string, type: string) => {
    const newNot = {
      id: `not-${Date.now()}`,
      title,
      message,
      type,
      timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
      read: false
    };
    setWalletNotifications(prev => {
      const updated = [newNot, ...prev];
      localStorage.setItem("care_coin_notifications", JSON.stringify(updated));
      return updated;
    });
  };

  // Selection interactive States (for modalling & detailed transactions dialogs)
  const [selectedTxnDetails, setSelectedTxnDetails] = useState<any | null>(null);
  
  // Super Admin Action selectors
  const [adminSelectedUserId, setAdminSelectedUserId] = useState<string>("");
  const [adminCoinAdjustAmount, setAdminCoinAdjustAmount] = useState<number>(10);
  const [adminCoinAdjustReason, setAdminCoinAdjustReason] = useState<string>("");
  const [adminSearchQuery, setAdminSearchQuery] = useState<string>("");

  // Filter States
  const [searchTitle, setSearchTitle] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [brandFilter, setBrandFilter] = useState("All");
  const [showCompatibleOnly, setShowCompatibleOnly] = useState(false);

  // Modal / Toggle controls
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState<DonationPost | null>(null);
  
  // Form submission: New Post Item structures
  const [newItemName, setNewItemName] = useState("");
  const [newBrand, setNewBrand] = useState("");
  const [newModel, setNewModel] = useState("");
  const [newYear, setNewYear] = useState(2022);
  const [newEngineType, setNewEngineType] = useState("petrol");
  const [newCondition, setNewCondition] = useState<'new' | 'used' | 'refurbished' | 'damaged but usable'>('used');
  const [newCategory, setNewCategory] = useState<'engine' | 'tire' | 'battery' | 'body part' | 'EV part' | 'interior' | 'exterior' | 'accessory' | 'tool' | 'other'>('accessory');
  const [newPhoto, setNewPhoto] = useState("");
  const [newLocation, setNewLocation] = useState("Phnom Penh");
  const [newPickup, setNewPickup] = useState<'pickup' | 'delivery' | 'either'>('pickup');
  const [newDonationType, setNewDonationType] = useState<'free' | 'coin_reward' | 'coin_bidding' | 'exchange' | 'cash' | 'cash_coin_priority'>('coin_reward');
  const [newWantsCoins, setNewWantsCoins] = useState(true);
  const [newMinBid, setNewMinBid] = useState(5);
  const [newAuctionDuration, setNewAuctionDuration] = useState(3); // days

  // Bid interaction input
  const [bidValue, setBidValue] = useState<number>(5);

  // Dispute form inputs
  const [disputeText, setDisputeText] = useState("");

  // Garage verifier validation tools state
  const [verifierNotes, setVerifierNotes] = useState("");

  // Simulated forum help actions state
  const [forumHelperTitle, setForumHelperTitle] = useState("");
  const [forumHelperLikes, setForumHelperLikes] = useState(1);
  const [forumHelperGarageVerified, setForumHelperGarageVerified] = useState(false);

  // Simulated location inputs
  const [locName, setLocName] = useState("");
  const [locType, setLocType] = useState("garage");

  // Load Seed / Simulated Context
  useEffect(() => {
    // 1. Initial Donation database mapping
    const savedDonations = localStorage.getItem("care_coin_donations");
    if (savedDonations) {
      setDonations(JSON.parse(savedDonations));
    } else {
      const initialDonations: DonationPost[] = [
        {
          id: "post-1",
          itemName: "Toyota Prius 2010 Original Hybrid Inverter Fan",
          vehicleBrand: "Toyota",
          vehicleModel: "Prius",
          year: 2010,
          engineType: "hybrid",
          condition: "used",
          category: "EV part",
          photoUrl: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=400",
          location: "Siem Reap",
          pickupOption: "either",
          donationType: "coin_bidding",
          wantsCoins: true,
          minBidCoins: 10,
          currentBidCoins: 14,
          currentBidderId: 99,
          currentBidderName: "Sophea Rith",
          auctionEnd: "2026-06-10",
          status: "Open for Coin Bidding",
          donorId: 12,
          donorName: "Chan Dara",
          donorReputation: "Trusted Contributor",
          suggestedCoins: 15,
          verificationLevel: "Garage Verified",
          verifierName: "Apsara Fast Garage",
          createdAt: "2026-06-01"
        },
        {
          id: "post-2",
          itemName: "BYD Atto 3 Heavy Duty Wall Charger Cable (Original 7kW)",
          vehicleBrand: "BYD",
          vehicleModel: "Atto 3",
          year: 2023,
          engineType: "EV",
          condition: "new",
          category: "EV part",
          photoUrl: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=400",
          location: "Phnom Penh",
          pickupOption: "pickup",
          donationType: "coin_reward",
          wantsCoins: true,
          status: "Open for Request",
          donorId: 104,
          donorName: "Vibol Ken",
          donorReputation: "Top Donor",
          suggestedCoins: 25,
          verificationLevel: "Admin Audited",
          createdAt: "2026-06-02"
        },
        {
          id: "post-3",
          itemName: "High grade portable tire pressure compressor with flashlight",
          vehicleBrand: "All Brands",
          vehicleModel: "Universal",
          year: 2024,
          engineType: "petrol",
          condition: "new",
          category: "accessory",
          photoUrl: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=400",
          location: "Kampot",
          pickupOption: "delivery",
          donationType: "free",
          wantsCoins: false,
          status: "Approved",
          donorId: 105,
          donorName: "Chhim Dara",
          donorReputation: "New Member",
          suggestedCoins: 0,
          verificationLevel: "None",
          createdAt: "2026-06-03"
        }
      ];
      setDonations(initialDonations);
      localStorage.setItem("care_coin_donations", JSON.stringify(initialDonations));
    }

    // 2. Initial Transactions Wallet Ledger seed
    const savedTxNS = localStorage.getItem("care_coin_txns");
    if (savedTxNS) {
      setTransactions(JSON.parse(savedTxNS));
    } else {
      const initialTxns: CoinTransaction[] = [
        { id: "tx-1", date: "2026-06-01", activity: "Account onboarding credit", category: "admin", coins: 10, status: "Completed" },
        { id: "tx-2", date: "2026-06-02", activity: "Added Sokha Auto paint garage pin", category: "location", coins: 2, status: "Completed" },
        { id: "tx-3", date: "2026-06-02", activity: "Helpful response in Toyota overheating topic", category: "forum", coins: 3, status: "Completed" },
        { id: "tx-4", date: "2026-06-03", activity: "Bid deposit locked on Prius Inverter Fan", category: "bidding", coins: -10, status: "Locked" }
      ];
      setTransactions(initialTxns);
      localStorage.setItem("care_coin_txns", JSON.stringify(initialTxns));
    }

    // 3. Forum simulation histories
    const savedForumRew = localStorage.getItem("care_forum_rewards");
    if (savedForumRew) {
      setForumRewards(JSON.parse(savedForumRew));
    } else {
      const forumRecords = [
        { id: "f-1", title: "Explained BYD Atto 3 charging protocols", status: "Accepted Answer", reward: 3, date: "2026-06-01" },
        { id: "f-2", title: "Helped fix Prius suspension knocking checklist", status: "Helpful Answer (4 Likes)", reward: 2, date: "2026-06-02" }
      ];
      setForumRewards(forumRecords);
      localStorage.setItem("care_forum_rewards", JSON.stringify(forumRecords));
    }

    // 4. Map contributions logs
    const savedLocConts = localStorage.getItem("care_loc_conts");
    if (savedLocConts) {
      setLocationContributions(JSON.parse(savedLocConts));
    } else {
      const locationRecs = [
        { id: "l-1", name: "Sokha Auto alignment station", type: "Garage", reward: 2, status: "Verified", date: "2026-06-01" },
        { id: "l-2", name: "BYD Super DC Fast Charger Area 2", type: "EV Charging", reward: 3, status: "Verified", date: "2026-06-02" }
      ];
      setLocationContributions(locationRecs);
      localStorage.setItem("care_loc_conts", JSON.stringify(locationRecs));
    }
  }, []);

  // Real-time ticking simulation for boosted posts' analytics (impressions, clicks, messages, conversions)
  useEffect(() => {
    const timer = setInterval(() => {
      setBoostedPosts(prev => {
        const keys = Object.keys(prev);
        if (keys.length === 0) return prev;
        
        let changed = false;
        const next = { ...prev };
        
        keys.forEach(key => {
          // Only simulate for active boosted posts
          const impressionsInc = Math.floor(Math.random() * 8) + 4; // 4 to 11 impressions
          const clickChance = Math.random() < 0.35 ? 1 : 0;
          const msgChance = Math.random() < 0.1 ? 1 : 0;
          const convChance = Math.random() < 0.02 ? 1 : 0;
          
          next[key] = {
            ...next[key],
            impressions: next[key].impressions + impressionsInc,
            clicks: next[key].clicks + clickChance,
            messages: next[key].messages + msgChance,
            conversions: next[key].conversions + convChance
          };
          changed = true;
        });
        
        if (changed) {
          localStorage.setItem("care_coin_boosted_posts", JSON.stringify(next));
          return next;
        }
        return prev;
      });
    }, 5000); // Ticks every 5 seconds

    return () => clearInterval(timer);
  }, []);

  // Sync to calculated wallet metrics
  useEffect(() => {
    if (transactions.length === 0) return;

    let availableCoin = 10; // offset activation
    let lockedCoin = 0;
    let pendingCoin = 0;
    let earnedCoin = 0;
    let spentCoin = 0;
    let refundedCoin = 0;

    transactions.forEach(tx => {
      if (tx.status === "Completed") {
        if (tx.coins > 0) {
          earnedCoin += tx.coins;
          availableCoin += tx.coins;
        } else {
          spentCoin += Math.abs(tx.coins);
          availableCoin -= Math.abs(tx.coins);
        }
      } else if (tx.status === "Locked") {
        lockedCoin += Math.abs(tx.coins);
        // Available was already deducted
        availableCoin -= Math.abs(tx.coins);
      } else if (tx.status === "Pending") {
        pendingCoin += tx.coins;
      } else if (tx.status === "Refunded") {
        refundedCoin += tx.coins;
        availableCoin += tx.coins;
      }
    });

    const userWalletDetail = {
      available: Math.max(0, availableCoin),
      locked: lockedCoin,
      pending: pendingCoin,
      earned: earnedCoin,
      spent: spentCoin,
      refunded: refundedCoin
    };

    setWallet(userWalletDetail);

    // Calculate user reputation level based on completed logs
    const totalHelpsCount = transactions.length + forumRewards.length + locationContributions.length;
    let reputationLevel = "New Member";
    if (totalHelpsCount >= 10) reputationLevel = "Trusted Contributor";
    else if (totalHelpsCount >= 5) reputationLevel = "Active Helper";
    if (activeUserRole === "Garage Owner") reputationLevel = "Garage Partner";
    if (activeUserRole === "Freelance Mechanic") reputationLevel = "Community Mechanic";

    setUserRep({
      points: totalHelpsCount * 10 + 20,
      level: reputationLevel
    });
  }, [transactions, forumRewards, locationContributions, activeUser, activeUserRole]);

  const saveDonationsToStorage = (updated: DonationPost[]) => {
    setDonations(updated);
    localStorage.setItem("care_coin_donations", JSON.stringify(updated));
  };

  const saveTransactionsToStorage = (updated: CoinTransaction[]) => {
    setTransactions(updated);
    localStorage.setItem("care_coin_txns", JSON.stringify(updated));
  };

  // Helper inside local storage to award coins securely
  const logTxn = (
    activity: string,
    category: CoinTransaction['category'],
    coins: number,
    status: CoinTransaction['status'] = "Completed",
    relatedItem?: string,
    reason?: string
  ) => {
    const isEarning = coins > 0;
    const unsignedCoins = Math.abs(coins);
    
    // Check if wallet is locked/suspended to protect against fraud/abuses
    const activeWalletObj = userWallets[0]; // Active user "Sophea Rith"
    if (activeWalletObj?.status === "Locked" || activeWalletObj?.status === "Suspended") {
      alert(`🚨 Transaction Denied! Your Care Wallet status is currently "${activeWalletObj?.status}". Earning and spending actions are suspended.`);
      return;
    }

    const txId = `tx-chk-${Math.random().toString(36).substr(2, 6).toUpperCase()}-${Date.now().toString().slice(-4)}`;
    const txHashBytes = "0x" + Array.from({length: 8}, () => Math.floor(Math.random()*16).toString(16)).join("").toUpperCase();

    const nextTx: any = {
      id: txId,
      date: new Date().toISOString().split('T')[0],
      activity,
      category,
      coins,
      status,
      relatedItem: relatedItem || "Platform Operations",
      reason: reason || "",
      user: activeWalletObj?.name || "Sophea Rith",
      txHash: txHashBytes
    };

    const nextList = [nextTx, ...transactions];
    saveTransactionsToStorage(nextList);

    // Security triggers: Auto triggers manual review if repetitive transfers are detected
    const recentActivity = nextList.slice(0, 4);
    const repeats = recentActivity.filter(tx => tx.category === category && tx.coins === coins).length;
    if (repeats >= 4 && category !== "admin") {
      setUserWallets(prev => {
        const next = [...prev];
        if (next[0]) {
          next[0].status = "Under Review";
          localStorage.setItem("care_coin_user_wallets", JSON.stringify(next));
        }
        return next;
      });
      addNotificationAndSave(
        "Wallet Under Review",
        "Suspicious repeated transactions triggered automated anti-farming protection. Status set to Under Review.",
        "review"
      );
      alert("⚠️ Security Alert: Deep heuristic scanning detected repeated identical transfers. Your wallet has been queued for Super Admin audit verification and is under active review.");
    }

    // Dynamic Notifications Dispatch
    let notType = "earned";
    if (status === "Pending") notType = "pending";
    else if (status === "Locked") notType = "locked";
    else if (category === "refund") notType = "refunded";
    else if (category === "spent" && activity.toLowerCase().includes("premium")) notType = "premium";
    else if (category === "spent" && activity.toLowerCase().includes("boost")) notType = "boost_start";
    else if (coins < 0) notType = "spent";

    const coinsText = isEarning ? `+${unsignedCoins} Coins` : `-${unsignedCoins} Coins`;
    addNotificationAndSave(
      isEarning ? "Coins Earned" : "Coins Spent",
      `${activity} (${coinsText})`,
      notType
    );
  };

  // 1. DYNAMIC MATCHING ADVISOR ENGINE
  const matchedDonations = donations.filter(d => {
    if (d.status !== "Open for Request" && d.status !== "Open for Coin Bidding" && d.status !== "Approved") return false;
    
    // Match based on user registered vehicles!
    return vehicles.some(v => {
      const matchBrand = d.vehicleBrand.toLowerCase() === v.brand.toLowerCase() || d.vehicleBrand.toLowerCase() === "all brands" || d.vehicleBrand.toLowerCase() === "universal";
      const matchModel = d.vehicleModel.toLowerCase() === v.model.toLowerCase() || d.vehicleModel.toLowerCase() === "universal";
      const matchEngine = d.engineType.toLowerCase() === "all" || (v.fuelType === "EV" && d.engineType.toLowerCase() === "ev") || (v.fuelType === "Hybrid" && d.engineType.toLowerCase() === "hybrid") || (v.fuelType === "Gasoline" && d.engineType.toLowerCase() === "petrol");
      
      return matchBrand && matchModel && matchEngine;
    });
  });

  // Calculate Coin worth based on rule table
  const calculateCoinReward = (category: string, condition: string, wantsCoinsRequested: boolean): number => {
    if (!wantsCoinsRequested) return 0;
    let base = 2; // Medium-low default
    if (category === "engine" || category === "battery" || category === "EV part") {
      base = 12; // High Value
    } else if (category === "tire" || category === "body part" || category === "tool") {
      base = 6; // Medium
    } else {
      base = 2; // Small base
    }

    if (condition === "new") base += 3;
    if (condition === "refurbished") base += 1;
    if (condition === "damaged but usable") base = Math.max(1, base - 3);

    return base;
  };

  // POST SUBMISSION HANDLER
  const handleCreatePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !newBrand.trim()) return;

    const worth = calculateCoinReward(newCategory, newCondition, newWantsCoins);

    const isBidding = newDonationType === "coin_bidding";
    const postStatus = worth >= 15 ? "Pending Review" : "Approved"; // High value items require Admin review

    const newPost: DonationPost = {
      id: `post-${Date.now()}`,
      itemName: newItemName,
      vehicleBrand: newBrand,
      vehicleModel: newModel || "Universal",
      year: Number(newYear),
      engineType: newEngineType,
      condition: newCondition,
      category: newCategory,
      photoUrl: newPhoto.trim() || "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=400",
      location: newLocation,
      pickupOption: newPickup,
      donationType: newDonationType,
      wantsCoins: newWantsCoins,
      status: isBidding ? "Open for Coin Bidding" : postStatus,
      minBidCoins: isBidding ? Number(newMinBid) : undefined,
      currentBidCoins: isBidding ? Number(newMinBid) : undefined,
      donorId: activeUser?.id || 1,
      donorName: activeUser?.name || "Community Pilot",
      donorReputation: userRep.level,
      suggestedCoins: worth,
      verificationLevel: "None",
      createdAt: new Date().toISOString().split('T')[0]
    };

    saveDonationsToStorage([newPost, ...donations]);
    setShowCreateModal(false);

    // Reset fields
    setNewItemName("");
    setNewBrand("");
    setNewModel("");
    setNewWantsCoins(true);

    if (postStatus === "Pending Review") {
      alert(`⚠️ Your high-value item "${newItemName}" has been queued for Admin/Garage verification. We will check compatibility before authorizing the +${worth} Care Coins reward!`);
    } else {
      alert(`🎉 Succesfully Posted! Your item "${newItemName}" is now active in the community board.`);
    }
  };

  // OWNER FINALIZES CURRENT HIGH BID & RELEASES AUCTION TO PICKUP
  const handleDonorCloseAuction = (post: DonationPost) => {
    if (!post.currentBidderId) {
      alert("No bids have been placed on this auction yet!");
      return;
    }
    
    const updated = donations.map(d => {
      if (d.id === post.id) {
        return {
          ...d,
          status: "Waiting for Pickup" as const,
          completionPendingReceiver: false,
          completionPendingDonor: false
        };
      }
      return d;
    });

    saveDonationsToStorage(updated);
    const updatedPost = updated.find(d => d.id === post.id);
    if (updatedPost) setSelectedDonation(updatedPost);

    alert(`🏆 Auction closed successfully! Item has been awarded to high bidder "${post.currentBidderName}" for ${post.currentBidCoins} Coins. Handover is pending confirmation.`);
  };

  // BIDDING LOGIC HUB WITH MINIMUM INCREMENT VERIFICATION
  const handlePlaceBid = (post: DonationPost) => {
    const minIncrement = 2; // Enforce minimum increment of 2 coins
    const requiredBid = (post.currentBidCoins || post.minBidCoins || 0) + minIncrement;

    if (!bidValue || bidValue < requiredBid) {
      alert(`⚠️ Minimum bid increment is ${minIncrement} Coins! You must bid at least ${requiredBid} Care Coins.`);
      return;
    }
    if (wallet.available < bidValue) {
      alert("⚠️ Insufficient available coins inside your Care Wallet!");
      return;
    }

    // Refund previous bidder if any (refund anyone, releasing old locked value since we start a new lock)
    let nextTxns = [...transactions];
    if (post.currentBidderId) {
      const refundTx: CoinTransaction = {
        id: `tx-refund-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        activity: `Auto refund: Active escrow bid returned for "${post.itemName}"`,
        category: "refund",
        coins: post.currentBidCoins || 0,
        status: "Completed"
      };
      nextTxns = [refundTx, ...nextTxns];
    }

    // Deduct / lock new bidder coins
    const lockTx: CoinTransaction = {
      id: `tx-lock-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      activity: `Locked coins: Placed auction Bid on "${post.itemName}"`,
      category: "bidding",
      coins: -bidValue,
      status: "Locked"
    };
    nextTxns = [lockTx, ...nextTxns];
    saveTransactionsToStorage(nextTxns);

    // Update Post
    const updated = donations.map(d => {
      if (d.id === post.id) {
        return {
          ...d,
          currentBidCoins: bidValue,
          currentBidderId: activeUser?.id || 99,
          currentBidderName: activeUser?.name || "Driver",
          status: "Coins Locked" as const
        };
      }
      return d;
    });
    saveDonationsToStorage(updated);
    
    const refreshed = updated.find(d => d.id === post.id);
    if (refreshed) setSelectedDonation(refreshed);

    alert(`💪 Successful Bid! Locked ${bidValue} Coins securely inside Escrow. You are now the leading bidder!`);
  };

  // COMPLETE TRANSACTION ESCROW CONFIRMER
  const handleConfirmCompletion = (post: DonationPost, role: 'buyer' | 'donor') => {
    const updated = donations.map(d => {
      if (d.id === post.id) {
        const isReceiver = role === 'buyer';
        const isDonor = role === 'donor';

        const nextPendingReceiver = isReceiver ? true : d.completionPendingReceiver;
        const nextPendingDonor = isDonor ? true : d.completionPendingDonor;

        const isBothCompleted = (nextPendingReceiver && d.completionPendingDonor) || (isDonor && d.completionPendingReceiver);

        return {
          ...d,
          completionPendingReceiver: nextPendingReceiver,
          completionPendingDonor: nextPendingDonor,
          status: isBothCompleted ? "Completed" as const : "Waiting for Pickup" as const
        };
      }
      return d;
    });

    saveDonationsToStorage(updated);
    const updatedPost = updated.find(d => d.id === post.id);
    if (updatedPost) setSelectedDonation(updatedPost);

    if (updatedPost?.status === "Completed") {
      // Release locked / pending coins to the Donor!
      if (post.donationType === "coin_bidding") {
        logTxn(`Received winning bid for "${post.itemName}"`, "donation", post.currentBidCoins || 0);
      } else if (post.donationType === "coin_reward" && post.wantsCoins) {
        logTxn(`Community reward for completed donation "${post.itemName}"`, "donation", post.suggestedCoins);
      }
      alert("✅ Done! Both donor and receiver have authorized pickup. Care Coins have been transfered successfully out of Escrow!");
    } else {
      alert(`Authorized! Waiting for verification from the other party.`);
    }
  };

  // CANCEL / REFUND ESCROW FLOW
  const handleCancelDonation = (post: DonationPost) => {
    const updated = donations.map(d => {
      if (d.id === post.id) {
        return { ...d, status: "Cancelled" as const };
      }
      return d;
    });
    saveDonationsToStorage(updated);

    // If it was custom coin lock, refund the user immediately
    if (post.status === "Coins Locked" && post.currentBidderId) {
      logTxn(`Cancelled auction refund for "${post.itemName}"`, "refund", post.currentBidCoins || 0);
    }
    
    const updatedPost = updated.find(d => d.id === post.id);
    if (updatedPost) setSelectedDonation(updatedPost);

    alert(`❌ The listing "${post.itemName}" has been Cancelled. Locked coins returned automatically.`);
  };

  // DISPUTE AN INITIATION
  const handleRaiseDispute = (post: DonationPost) => {
    if (!disputeText.trim()) return;

    const updated = donations.map(d => {
      if (d.id === post.id) {
        return {
          ...d,
          status: "Disputed" as const,
          disputeNotes: disputeText
        };
      }
      return d;
    });

    saveDonationsToStorage(updated);
    const updatedPost = updated.find(d => d.id === post.id);
    if (updatedPost) setSelectedDonation(updatedPost);

    setDisputeText("");
    alert("⚖️ Dispute registered. Super Admin and connected expert garages will audit details. Coins are locked until resolution.");
  };

  // SIMULATOR helper logic for FORUM COIN rewards
  const handleSimulateForumHelp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forumHelperTitle.trim()) return;

    let earned = 1;
    let desc = "Forum advice upvoted";
    if (forumHelperGarageVerified) {
      earned = 5;
      desc = "Technical answer checked/verified by certified Garage";
    } else if (forumHelperLikes >= 5) {
      earned = 3;
      desc = "Detailed experience with photos accepted as solution";
    }

    const newRew = {
      id: `f-${Date.now()}`,
      title: forumHelperTitle,
      status: forumHelperGarageVerified ? "Garage Confirmed Answer" : "Accepted Solution",
      reward: earned,
      date: new Date().toISOString().split('T')[0]
    };

    setForumRewards([newRew, ...forumRewards]);
    localStorage.setItem("care_forum_rewards", JSON.stringify([newRew, ...forumRewards]));

    logTxn(`Forum Contribution: "${forumHelperTitle}"`, "forum", earned);

    setForumHelperTitle("");
    setForumHelperGarageVerified(false);
    setForumHelperLikes(1);
    alert(`👍 Simulated forum response submitted! Received +${earned} Care Coins to your digital wallet!`);
  };

  // SIMULATOR helper logic for LOCATION rewards
  const handleSimulateLocationAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!locName.trim()) return;

    let earned = 1;
    if (locType === "garage") earned = 2;
    if (locType === "ev_charging") earned = 3;

    const newLoc = {
      id: `l-${Date.now()}`,
      name: locName,
      type: locType === "garage" ? "Garage" : locType === "ev_charging" ? "EV Charging" : "Spare Parts Shop",
      reward: earned,
      status: "Verified",
      date: new Date().toISOString().split('T')[0]
    };

    setLocationContributions([newLoc, ...locationContributions]);
    localStorage.setItem("care_loc_conts", JSON.stringify([newLoc, ...locationContributions]));

    logTxn(`Added location: ${locName}`, "location", earned);

    setLocName("");
    alert(`🗺️ Location mapped with GPS tags! Your contribution was verified by users; received +${earned} Care Coins.`);
  };

  // SPENDING BENEFITS REDEEMER
  const handleRedeemCoupon = (couponName: string, coinCost: number) => {
    if (wallet.available < coinCost) {
      alert("Insufficient Care Coins available in your wallet!");
      return;
    }

    logTxn(`Redeemed partner coupon: "${couponName}"`, "spent", -coinCost);
    alert(`🎟️ Voucher Unlocked! Coupon code: "MC-CARE-${Math.floor(Math.random() * 90000) + 10000}" is now active in your SMS/In-App inbox. Enjoy your discounts!`);
  };

  // ADMIN OVERWATCH AND REWARD ACTIONS
  const handleAdminApprovePost = (post: DonationPost) => {
    const updated = donations.map(d => {
      if (d.id === post.id) {
        return { ...d, status: "Approved" as const };
      }
      return d;
    });
    saveDonationsToStorage(updated);
    
    // Simulate coin addition warning
    alert(`Listing Approved! Released to the public board for claiming.`);
  };

  const handleAdminSettleDispute = (post: DonationPost, awardTo: 'buyer' | 'donor' | 'split') => {
    let nextTxns = [...transactions];
    
    if (awardTo === 'buyer') {
      // Refund buyer fully
      if (post.currentBidderId) {
        const refundTx: CoinTransaction = {
          id: `tx-dispute-ref-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          activity: `Admin dispute closure: Full refund for "${post.itemName}"`,
          category: "refund",
          coins: post.currentBidCoins || 0,
          status: "Completed"
        };
        nextTxns = [refundTx, ...nextTxns];
      }
    } else if (awardTo === 'donor') {
      // Send locked value to donor
      const rewardTx: CoinTransaction = {
        id: `tx-dispute-rel-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        activity: `Admin dispute closure: Escrow payout for "${post.itemName}"`,
        category: "donation",
        coins: post.currentBidCoins || post.suggestedCoins,
        status: "Completed"
      };
      nextTxns = [rewardTx, ...nextTxns];
    } else {
      // Split 50% refund, 50% payout
      if (post.currentBidderId) {
        const refundTx: CoinTransaction = {
          id: `tx-dispute-split-b-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          activity: `Admin dispute split: 50% refund for "${post.itemName}"`,
          category: "refund",
          coins: Math.round((post.currentBidCoins || 0) / 2),
          status: "Completed"
        };
        nextTxns = [refundTx, ...nextTxns];
      }
      const rewardTx: CoinTransaction = {
        id: `tx-dispute-split-d-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        activity: `Admin dispute split: 50% payout to donor for "${post.itemName}"`,
        category: "donation",
        coins: Math.round((post.currentBidCoins || post.suggestedCoins) / 2),
        status: "Completed"
      };
      nextTxns = [rewardTx, ...nextTxns];
    }

    saveTransactionsToStorage(nextTxns);

    const updated = donations.map(d => {
      if (d.id === post.id) {
        return { ...d, status: "Completed" as const, disputeNotes: `Settled by Admin: Split/Awarded to ${awardTo}` };
      }
      return d;
    });
    saveDonationsToStorage(updated);
    setSelectedDonation(null);
    alert(`⚖️ Escrow split applied successfully! Wallet ledger adjusted.`);
  };

  // SECONDARY PERSPECTIVE: GARAGE / SPARE SHOP EXPERT VERIFICATION
  const handleGarageVerifyItem = (post: DonationPost) => {
    const updated = donations.map(d => {
      if (d.id === post.id) {
        return {
          ...d,
          verificationLevel: "Garage Verified" as const,
          verifierName: activeUser?.businessName || activeUser?.name || "Professional Garage Partner",
          trustScore: 98 // Max safety rating trigger
        };
      }
      return d;
    });

    saveDonationsToStorage(updated);
    setSelectedDonation(null);
    alert(`🔧 Thank you! As a licensed Partner, you have certified "${post.itemName}"'s fitment condition. Item is boosted with a Verified Badge.`);
  };

  // FILTERED RENDERED POSTS
  const filteredDonations = donations.filter(post => {
    const query = searchTitle.toLowerCase();
    const titleMatches = post.itemName.toLowerCase().includes(query) || post.vehicleBrand.toLowerCase().includes(query);
    const categoryMatches = categoryFilter === "All" || post.category === categoryFilter;
    const typeMatches = typeFilter === "All" || post.donationType === typeFilter;
    const brandMatches = brandFilter === "All" || post.vehicleBrand.toLowerCase() === brandFilter.toLowerCase();
    
    // Safety check matching user vehicles
    let compatibilityMatches = true;
    if (showCompatibleOnly) {
      compatibilityMatches = vehicles.some(v => 
        post.vehicleBrand.toLowerCase() === v.brand.toLowerCase() || 
        post.vehicleBrand.toLowerCase() === "all brands" || 
        post.vehicleBrand.toLowerCase() === "universal"
      );
    }

    return titleMatches && categoryMatches && typeMatches && brandMatches && compatibilityMatches;
  });

  // REPORTS & CHART METRICS CALCULATION
  const reportTotals = {
    donatedCount: donations.filter(d => d.status === "Completed").length,
    activeCount: donations.filter(d => d.status === "Approved" || d.status.startsWith("Open")).length,
    disputeRate: donations.length > 0 ? (donations.filter(d => d.status === "Disputed").length / donations.length) * 100 : 0,
    fraudFlags: donations.filter(d => d.flaggedFake).length
  };

  const chartDataBrand = [
    { name: "Toyota", count: donations.filter(d => d.vehicleBrand.toLowerCase() === "toyota").length || 1 },
    { name: "BYD", count: donations.filter(d => d.vehicleBrand.toLowerCase() === "byd").length || 1 },
    { name: "Lexus", count: donations.filter(d => d.vehicleBrand.toLowerCase() === "lexus").length || 0 },
    { name: "Universal", count: donations.filter(d => d.vehicleBrand.toLowerCase() === "universal" || d.vehicleBrand.toLowerCase() === "all brands").length || 1 },
  ];

  const chartDataValue = [
    { name: "Small items", earned: 5, spent: 4 },
    { name: "Medium items", earned: 15, spent: 10 },
    { name: "High-value", earned: 32, spent: 18 },
    { name: "Rare parts", earned: 13, spent: 11 }
  ];

  return (
    <div className="space-y-6">

      {/* DEMO / SIMULATION SWITCHER FOR CONVENIENT TESTING */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 bg-slate-900 shadow-xl border border-white/5 rounded-4xl text-left relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/20">
        <div>
          <span className="text-[10px] bg-amber-500/10 text-amber-400 font-extrabold px-2 py-0.5 rounded-full font-mono uppercase tracking-widest border border-amber-500/20">AISTUDIO PROTOTYPE MODULE</span>
          <h4 className="text-sm font-black text-white uppercase tracking-wider block mt-1">MyCar Care Coin KH • Demo Account Switcher</h4>
          <p className="text-[11px] text-slate-400">Instantly toggle roles to inspect the mobile wallet views and Super Admin admin desk.</p>
        </div>
        <div className="flex flex-wrap gap-2 select-none shrink-0">
          <button
            onClick={() => { setRoleOverride(""); alert("Normal driver wallet layout active: Standard views configured."); }}
            className={`py-1.5 px-3.5 rounded-xl text-[10.5px] font-black border transition leading-none cursor-pointer ${
              !roleOverride ? "bg-emerald-500/25 border-emerald-400 text-emerald-300 shadow" : "bg-slate-950 border-white/5 text-slate-500 hover:text-slate-405"
            }`}
          >
            👤 Normal Driver (Sophea)
          </button>
          <button
            onClick={() => { setRoleOverride("Garage Owner"); alert("Garage Expert view active: Compatibility review unlocked."); }}
            className={`py-1.5 px-3.5 rounded-xl text-[10.5px] font-black border transition leading-none cursor-pointer ${
              roleOverride === "Garage Owner" ? "bg-indigo-500/25 border-indigo-400 text-indigo-300 shadow" : "bg-slate-950 border-white/5 text-slate-500 hover:text-slate-405"
            }`}
          >
            🔧 Garage Expert (Vibol)
          </button>
          <button
            onClick={() => { setRoleOverride("Admin"); alert("Super Admin mode active: Full database overrides and rules unlocked."); }}
            className={`py-1.5 px-3.5 rounded-xl text-[10.5px] font-black border transition leading-none cursor-pointer ${
              roleOverride === "Admin" ? "bg-red-500/25 border-red-400 text-red-350 shadow" : "bg-slate-950 border-white/5 text-slate-500 hover:text-slate-405"
            }`}
          >
            🛡️ Super Admin
          </button>
        </div>
      </div>
      
      {/* 1. NOTIFICATION ALERT ROW (Smart matching & compatibility warnings) */}
      {matchedDonations.length > 0 && (
        <div className="bg-sky-500/10 border border-sky-500/30 p-4 rounded-3xl flex items-start gap-3 animate-pulse text-left">
          <Bell className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-black text-sky-100 uppercase tracking-widest block">Compatible Spare Parts Matches!</h4>
            <p className="text-xs text-sky-200">
              We parsed your vehicle profile list and found matches! There are <span className="font-bold underline">{matchedDonations.length} items</span> compatible with your registered models. Explore details to bid with Care Coins.
            </p>
            <div className="flex gap-2 pt-1 select-none flex-wrap">
              {matchedDonations.slice(0, 2).map(d => (
                <span key={d.id} className="text-[10px] bg-slate-950/70 border border-sky-400/20 text-white font-mono rounded px-2 py-0.5">
                  🚙 {d.vehicleBrand} {d.vehicleModel}: {d.itemName} ({d.currentBidCoins || d.suggestedCoins} Coins)
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. HEADER BLOCK WITH STATS BENTO CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
        
        {/* Core title panel */}
        <div className="md:col-span-6 glass rounded-4xl p-6 flex flex-col justify-between text-left relative overflow-hidden shadow-xl border border-white/5 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/20">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-black uppercase tracking-wider">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>Sustainable Cambodian Parts Recycling</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              MyCar Care Coin System
            </h1>
            <p className="text-xs text-slate-400 max-w-sm">
              Donate unused filters, gears, or charging cables. Earn internal community <span className="font-bold text-amber-400">Care Coins</span> with proof of hand-over. Bid on rare items without real-world cash!
            </p>
          </div>

          <div className="pt-4 flex flex-wrap gap-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="py-2.5 px-4 bg-emerald-500 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-lg hover:bg-emerald-600 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create Share Post</span>
            </button>
            <div className="py-2.5 px-3.5 bg-slate-950/80 border border-white/10 text-slate-300 font-bold text-xs rounded-xl flex items-center gap-1">
              <BookOpen className="w-4 h-4 text-slate-400" />
              <span>Coins Value Rule Map</span>
            </div>
          </div>
        </div>

        {/* Dynamic Digital Wallet Balance card */}
        <div className="md:col-span-3 glass rounded-4xl p-5 border border-white/5 bg-slate-900/40 text-left relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
            <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Active Wallet</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
              <Coins className="w-4 h-4 animate-spin-slow" />
            </div>
          </div>

          <div className="py-4">
            <span className="text-[10px] text-slate-500 font-bold block uppercase font-sans">Available Care Balance</span>
            <div className="flex items-baseline gap-1.5 select-none">
              <span className="text-4xl font-mono font-black text-amber-400">
                {wallet.available}
              </span>
              <span className="text-xs text-amber-500/80 font-black">Coins</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 border-t border-white/5 pt-2.5">
            <div>
              <span className="text-[9px] text-rose-400 block uppercase font-bold tracking-widest flex items-center gap-0.5">
                <Lock className="w-2.5 h-2.5" /> Locked
              </span>
              <span className="text-slate-200 font-mono text-xs font-bold">{wallet.locked} Coins</span>
            </div>
            <div>
              <span className="text-[9px] text-emerald-400 block uppercase font-bold tracking-widest flex items-center gap-0.5">
                <Clock className="w-2.5 h-2.5" /> Pending
              </span>
              <span className="text-slate-200 font-mono text-xs font-bold">+{wallet.pending} Coins</span>
            </div>
          </div>
        </div>

        {/* User reputation scorecard */}
        <div className="md:col-span-3 glass rounded-4xl p-5 border border-white/5 bg-slate-900/40 text-left flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
            <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Community Reputation</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
              <Award className="w-4 h-4" />
            </div>
          </div>

          <div className="py-4">
            <span className="text-[10px] text-slate-500 font-bold block uppercase font-sans">Accrued Contributor Status</span>
            <div className="text-lg font-black text-emerald-400 leading-tight">
              {userRep.level}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Based on {userRep.points} points overall
            </div>
          </div>

          <div className="border-t border-white/5 pt-2.5 flex items-center justify-between">
            <span className="text-[9px] text-zinc-400 block uppercase font-sans">Earning Limits</span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded">
              ★ Max Unlocked
            </span>
          </div>
        </div>
      </div>

      {/* 3. SUB MODULE TABS BAR */}
      <div className="flex flex-wrap gap-2.5 p-1.5 bg-slate-950/60 rounded-2xl border border-white/5">
        <button
          onClick={() => setActiveTab('listings')}
          className={`flex-1 min-w-[130px] p-2 rounded-xl text-xs font-extrabold transition text-center flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'listings' ? "bg-white/10 text-white border border-white/10 shadow" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Gift className="w-4 h-4 text-emerald-400" />
          <span>Donation Board</span>
        </button>

        <button
          onClick={() => setActiveTab('wallet')}
          className={`flex-1 min-w-[130px] p-2 rounded-xl text-xs font-extrabold transition text-center flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'wallet' ? "bg-white/10 text-white border border-white/10 shadow" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Coins className="w-4 h-4 text-amber-400" />
          <span>Wallet & Escrow</span>
        </button>

        <button
          onClick={() => setActiveTab('forum_contrib')}
          className={`flex-1 min-w-[130px] p-2 rounded-xl text-xs font-extrabold transition text-center flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'forum_contrib' ? "bg-white/10 text-white border border-white/10 shadow" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <MessageSquare className="w-4 h-4 text-sky-400" />
          <span>Forum Simulator</span>
        </button>

        <button
          onClick={() => setActiveTab('location_contrib')}
          className={`flex-1 min-w-[130px] p-2 rounded-xl text-xs font-extrabold transition text-center flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'location_contrib' ? "bg-white/10 text-white border border-white/10 shadow" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <MapPin className="w-4 h-4 text-rose-400" />
          <span>Map Simulator</span>
        </button>

        <button
          onClick={() => setActiveTab('spending')}
          className={`flex-1 min-w-[130px] p-2 rounded-xl text-xs font-extrabold transition text-center flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'spending' ? "bg-white/10 text-white border border-white/10 shadow" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Tag className="w-4 h-4 text-violet-400" />
          <span>Spend Coins</span>
        </button>

        {activeUserRole === "Garage Owner" && (
          <button
            onClick={() => setActiveTab('garage_expert')}
            className={`flex-1 min-w-[130px] p-2 rounded-xl text-xs font-extrabold transition text-center flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'garage_expert' ? "bg-emerald-500/25 text-emerald-300 border border-emerald-500/30" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sliders className="w-4 h-4 text-emerald-400" />
            <span>Expert Validator</span>
          </button>
        )}

        {activeUserRole === "Admin" && (
          <button
            onClick={() => setActiveTab('admin_dashboard')}
            className={`flex-1 min-w-[130px] p-2 rounded-xl text-xs font-extrabold transition text-center flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'admin_dashboard' ? "bg-red-500/25 text-red-300 border border-red-500/30 font-black" : "text-red-400/80 hover:text-red-300"
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <span>System Admin Desk</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('reports')}
          className={`flex-1 min-w-[130px] p-2 rounded-xl text-xs font-extrabold transition text-center flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'reports' ? "bg-white/10 text-white border border-white/10 shadow" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <TrendingUp className="w-4 h-4 text-cyan-400" />
          <span>Visual Reports</span>
        </button>
      </div>

      {/* 4. DETAILS RENDER MODULE PANEL */}

      {/* TAB A: COMMUNITY LISTINGS INDEX */}
      {activeTab === 'listings' && (
        <div className="space-y-4 text-left">
          
          {/* Quick Filter Controls row */}
          <div className="bg-slate-900/50 p-4 rounded-3xl border border-white/5 flex flex-wrap gap-4 items-center">
            
            <div className="relative min-w-[200px] flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
              <input
                type="text"
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
                placeholder="Search donation spare parts, gear motors..."
                className="w-full bg-slate-950 font-sans text-xs p-2.5 pl-9 rounded-xl text-slate-100 border border-white/10 focus:outline-none"
              />
            </div>

            <div className="flex gap-3 flex-wrap">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-slate-950 text-xs text-slate-350 p-2.5 rounded-xl border border-white/10 focus:outline-none"
              >
                <option value="All">All Categories</option>
                <option value="engine">Engine System</option>
                <option value="tire">Tire & Wheels</option>
                <option value="battery">High Volts Battery</option>
                <option value="body part">Body Panels</option>
                <option value="EV part">EV charging cables</option>
                <option value="accessory">Accessories</option>
                <option value="tool">Tools & Wrenches</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-slate-950 text-xs text-slate-350 p-2.5 rounded-xl border border-white/10 focus:outline-none"
              >
                <option value="All">All Post Types</option>
                <option value="free">Pure Free Donations</option>
                <option value="coin_reward">Reward coin exchange</option>
                <option value="coin_bidding">Escrow Coin Bidding</option>
                <option value="exchange">Parts Swap/Trade</option>
              </select>

              <button
                onClick={() => setShowCompatibleOnly(!showCompatibleOnly)}
                className={`py-2 px-3 text-xs rounded-xl border font-bold flex items-center gap-1 cursor-pointer transition ${
                  showCompatibleOnly ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/45" : "bg-slate-950 border-white/10 text-slate-400"
                }`}
              >
                🚙 Show matches for my cars
              </button>
            </div>
          </div>

          {/* Core grid of active donation listings */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDonations.map(post => {
              const isFavCompatible = vehicles.some(v => 
                v.brand.toLowerCase() === post.vehicleBrand.toLowerCase() || 
                v.model.toLowerCase() === post.vehicleModel.toLowerCase()
              );

              return (
                <div 
                  key={post.id} 
                  className={`p-4 rounded-3xl flex flex-col justify-between hover:border-white/10 transition relative group select-none ${
                    boostedPosts[post.id] 
                      ? "bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/20 border-2 border-amber-500/50 shadow-xl shadow-amber-500/5 animate-pulse-slow" 
                      : "bg-slate-900/60 border border-white/5"
                  }`}
                >
                  
                  {/* Photo with category badges */}
                  <div className="w-full h-36 rounded-2xl overflow-hidden bg-slate-955 relative border border-white/5 select-none">
                    <img 
                      src={post.photoUrl} 
                      alt={post.itemName} 
                      className="w-full h-full object-cover group-hover:scale-102 transition" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                      <span className="text-[8px] bg-slate-950/80 font-mono text-zinc-300 px-2 py-0.5 rounded font-bold uppercase">
                        {post.category}
                      </span>
                      {boostedPosts[post.id] && (
                        <span className="text-[8px] bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 px-2.5 py-0.5 rounded font-black tracking-wider uppercase flex items-center gap-0.5 shadow-lg shrink-0">
                          <Flame className="w-2.5 h-2.5 text-slate-950 fill-current animate-bounce" /> Boosted
                        </span>
                      )}
                      {isFavCompatible && (
                        <span className="text-[8px] bg-sky-500 text-slate-950 px-2 py-0.5 rounded font-black tracking-widest uppercase">
                          ★ Your Car Fit
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-2.5 right-2.5">
                      <span className={`text-[8.5px] px-2 py-0.5 rounded-lg font-black uppercase shadow ${
                        post.donationType === "free" ? "bg-emerald-500 text-slate-950" :
                        post.donationType === "coin_bidding" ? "bg-amber-500 text-slate-950" :
                        "bg-[#4D4DFF] text-white"
                      }`}>
                        {post.donationType === "free" ? "Free Gift" :
                         post.donationType === "coin_bidding" ? "Coin Auction" : "Reward Earn"}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="space-y-1.5 pt-3 flex-1">
                    <div className="flex items-center gap-1 text-[9.5px] font-mono text-slate-400">
                      <span>🚙 {post.vehicleBrand} {post.vehicleModel}</span>
                      <span>•</span>
                      <span>{post.year}</span>
                    </div>

                    <h4 className="text-xs font-black text-slate-200 group-hover:text-white line-clamp-1 leading-snug">
                      {post.itemName}
                    </h4>

                    {/* Verifiers & Status labels */}
                    <div className="flex items-center gap-1.5 py-1">
                      {post.verificationLevel === "Garage Verified" ? (
                        <span className="text-[8.5px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded px-1.5 py-0.5 font-bold flex items-center gap-0.5">
                          <Check className="w-2.5 h-2.5" /> Garage Certified
                        </span>
                      ) : post.verificationLevel === "Admin Audited" ? (
                        <span className="text-[8.5px] bg-blue-500/10 text-blue-300 border border-blue-500/20 rounded px-1.5 py-0.5 font-bold flex items-center gap-0.5">
                          <ShieldCheck className="w-2.5 h-2.5" /> Admin Certified
                        </span>
                      ) : (
                        <span className="text-[8.5px] bg-zinc-800 text-zinc-400 rounded px-1.5 py-0.5 font-mono">
                          Unreviewed
                        </span>
                      )}
                      
                      <span className="text-[9px] bg-slate-950 text-slate-400 px-1.5 py-0.5 rounded font-mono font-bold font-semibold uppercase">
                        {post.status}
                      </span>
                    </div>

                    <p className="text-[10.5px] text-slate-400 line-clamp-2 leading-relaxed">
                      Condition: <span className="text-slate-350 capitalize font-medium">{post.condition}</span>. Pickup via {post.pickupOption} inside {post.location}.
                    </p>
                  </div>

                  {/* Cost & Bid summary row */}
                  <div className="border-t border-white/5 pt-3 mt-3 flex items-center justify-between">
                    <div>
                      {post.donationType === "coin_bidding" ? (
                        <div>
                          <span className="text-[8px] text-slate-500 block uppercase font-black">Current Auction Bid</span>
                          <span className="text-xs font-mono text-amber-400 font-black">
                            {post.currentBidCoins || post.minBidCoins} Care Coins
                          </span>
                        </div>
                      ) : post.donationType === "coin_reward" ? (
                        <div>
                          <span className="text-[8px] text-slate-500 block uppercase font-black">Reward Valuation</span>
                          <span className="text-xs font-mono text-emerald-400 font-bold">
                            +{post.suggestedCoins} Coins
                          </span>
                        </div>
                      ) : (
                        <div>
                          <span className="text-[8px] text-slate-500 block uppercase font-black">Community Fee</span>
                          <span className="text-xs text-white font-mono font-black">
                            0 Coins (Free)
                          </span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => setSelectedDonation(post)}
                      className="py-1.5 px-3 bg-white/5 hover:bg-white/10 text-white font-bold text-[11px] rounded-lg border border-white/5 cursor-pointer flex items-center gap-0.5 transition"
                    >
                      <span>Interact Options</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              );
            })}

            {filteredDonations.length === 0 && (
              <div className="col-span-full py-12 text-center bg-slate-900/10 rounded-3xl border border-white/5 border-dashed">
                <AlertOctagon className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-300">No Donation Listings Found</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                  Try adjusting filters or submit a brand new post to start community sharing.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB B: WALLET & ACTIVE COIN ESCROW CONTRACTS */}
      {activeTab === 'wallet' && (
        <div className="space-y-6 text-left">
          
          {/* WALLET SUB-TABS NAVIGATION HEADER */}
          <div className="flex flex-wrap border-b border-white/5 gap-1.5 pb-2.5 select-none">
            {[
              { id: 'overview', label: 'Wallet Overview', icon: LayoutDashboard, color: 'text-emerald-400' },
              { id: 'earn', label: 'Earn Coins', icon: ArrowDownLeft, color: 'text-emerald-400' },
              { id: 'use', label: 'Spend & Unlock', icon: ArrowUpRight, color: 'text-amber-400' },
              { id: 'history', label: 'Transaction Logs', icon: Clock, color: 'text-indigo-400' },
              { id: 'locked_pending', label: 'Escrow Holdings', icon: Lock, color: 'text-rose-400' },
              { id: 'boosts', label: 'Boost Analytics', icon: Flame, color: 'text-amber-400' },
              { id: 'premium', label: 'Premium Suite', icon: ShieldCheck, color: 'text-cyan-400' }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setWalletSubTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-extrabold transition cursor-pointer border ${
                    walletSubTab === tab.id
                      ? "bg-slate-900 border-white/10 text-white shadow-lg"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${tab.color}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* SUBTAB 1: OVERVIEW */}
          {walletSubTab === 'overview' && (
            <CareCoinWallet
              wallet={wallet}
              transactions={transactions}
              donations={donations}
              activeUser={activeUser}
              boostedPosts={boostedPosts}
              unlockedFeatures={unlockedFeatures}
              activeUserRole={activeUserRole}
              onConfirmCompletion={handleConfirmCompletion}
              onRaiseDispute={handleRaiseDispute}
              onCancelDonation={handleCancelDonation}
              onUnlockFeature={(featureId, cost) => {
                // Spend coins to unlock
                const nextUnlocked = [...unlockedFeatures, featureId];
                setUnlockedFeatures(nextUnlocked);
                localStorage.setItem("care_coin_unlocked_features", JSON.stringify(nextUnlocked));

                // Log spent transaction
                logTxn(`Unlocked Premium Tool: "${featureId}"`, "spent", -cost, "Completed", "Premium Platform Suite");
                
                alert(`🎉 Feature "${featureId}" unlocked successfully! Explore it immediately inside the 'Premium Suite' layout.`);
              }}
            />
          )}

          {/* SUBTAB 2: EARN COINS */}
          {walletSubTab === 'earn' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider block">Care Coins Contribution Hub</h3>
                <p className="text-xs text-slate-400">Earn internal platform tokens for maintaining the driver ecosystem. Tokens can unlock premium tool exports or boost your ads.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {/* 1. DONATE PARTS */}
                <div className="bg-slate-900/40 p-5 rounded-3xl border border-white/5 space-y-3 flex flex-col justify-between">
                  <div className="space-y-1.5 text-left">
                    <Gift className="w-6 h-6 text-emerald-400" />
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">Spare Parts & Tools Donations</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                      Donate surplus spare parts, accessories, repair tools, or unused vehicle materials. Receive up to <span className="font-bold text-yellow-400">{coinRules.donationRewardMax} Coins</span> depending on condition and certified compatibility.
                    </p>
                  </div>
                  <button
                    onClick={() => { setActiveTab('listings'); setShowCreateModal(true); }}
                    className="w-full py-2 bg-emerald-500 text-slate-950 text-xs font-black rounded-lg text-center hover:bg-emerald-600 cursor-pointer shadow transition"
                  >
                    🚀 Open Donation Listing Form
                  </button>
                </div>

                {/* 2. FORUMS HELP */}
                <div className="bg-slate-900/40 p-5 rounded-3xl border border-white/5 space-y-3 flex flex-col justify-between">
                  <div className="space-y-1.5 text-left">
                    <MessageSquare className="w-6 h-6 text-teal-400" />
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">Expert Forum Advice Answers</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                      Assist drivers with practical maintenance guidelines, engine diagnostic guides, or breakdown solutions. Get <span className="font-bold text-yellow-400">+{coinRules.forumHelpReward} Coins</span> for accepted answers or <span className="font-bold text-yellow-400">+{coinRules.forumAcceptedReward} Coins</span> for certified answers.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('forum_contrib')}
                    className="w-full py-2 bg-teal-500 text-slate-950 text-xs font-black rounded-lg text-center hover:bg-teal-600 cursor-pointer shadow transition"
                  >
                    💬 Simulate Help Contributions
                  </button>
                </div>

                {/* 3. LOCATIONS MAPPING */}
                <div className="bg-slate-900/40 p-5 rounded-3xl border border-white/5 space-y-3 flex flex-col justify-between">
                  <div className="space-y-1.5 text-left">
                    <MapPin className="w-6 h-6 text-indigo-400" />
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">Map Point Pin Registrations</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                      Register new verified fuel stops, electric fast-charging docks, or independent workshops. Get <span className="font-bold text-yellow-400">+{coinRules.addPetrolStationReward} to +{coinRules.addEvStationReward} Coins</span> once confirmed by Super Admins.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('location_contrib')}
                    className="w-full py-2 bg-indigo-500 text-slate-950 text-xs font-black rounded-lg text-center hover:bg-indigo-600 cursor-pointer shadow transition"
                  >
                    🗺️ Register Map Points
                  </button>
                </div>
              </div>

              {/* 4. MICRO TASKS SIMULATOR */}
              <div className="bg-slate-900/30 p-5 rounded-4xl border border-white/5 space-y-4">
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">Perform Rapid Platform Verification Tasks</h4>
                  <p className="text-[11px] text-slate-400 font-sans">Validate existing listings, correct open hours, flag fake ads, or add photos to earn extra coins instantly.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { title: "Upload Reference Photo to Sihanoukville Charging Dock", reward: coinRules.uploadPhotoReward, action: "Upload Reference Image" },
                    { title: "Report Outdated Petrol Pricing Matrix on Norodom Blvd Sokha Post", reward: coinRules.reportIncorrectReward, action: "Report Outdated Pricing" },
                    { title: "Refined Correct Operating Hours for Phnom Penh Honda Workshop", reward: coinRules.addHoursReward, action: "Correct Opening Hours" },
                    { title: "Write Driving Safety Tips for Bokor Mountain Foggy Decents", reward: coinRules.shareExperienceReward, action: "Publish Experience Tip" }
                  ].map((task, idx) => (
                    <div key={idx} className="bg-slate-950/40 border border-white/5 p-4 rounded-3xl flex justify-between items-center gap-4">
                      <div className="text-left">
                        <h4 className="text-xs font-bold text-white leading-snug">{task.title}</h4>
                        <span className="text-[10px] text-emerald-400 font-mono font-bold">Reward: +{task.reward} Care Coins</span>
                      </div>
                      <button
                        onClick={() => {
                          logTxn(`Completed Microtask: "${task.title.substring(0, 30)}..."`, "forum", task.reward, "Completed");
                          alert(`🎉 task recorded! Received +${task.reward} Coins. Thank you for your active help!`);
                        }}
                        className="py-1.5 px-3 bg-white/10 text-white rounded-lg text-[10.5px] font-black hover:bg-white/20 transition cursor-pointer shrink-0 animate-pulse"
                      >
                        {task.action}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SUBTAB 3: USE COINS */}
          {walletSubTab === 'use' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider block">Care Coins Utilities Shop</h3>
                <p className="text-xs text-slate-400">Unlock high-value advanced features, compile full vehicle histories, or boost your active donation posts.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Section A: Premium Diagnostic Reports */}
                <div className="bg-slate-900/30 p-5 rounded-4xl border border-white/5 space-y-4">
                  <h4 className="text-xs font-black text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" /> Premium Diagnostics Suite
                  </h4>
                  <p className="text-xs text-slate-400">Access advanced maintenance prediction engines, export custom PDF logs, or query comparative garage fee reports.</p>

                  <div className="gap-3.5 flex flex-col">
                    {[
                      { code: "un-adv", title: "Unlimited AI Garage Diagnostics Advisor", desc: "Interact with our AI engine with no limits representing vehicle models and diagnostics logs.", price: coinRules.premiumAdvisorCost },
                      { code: "un-rep", title: "Full Vehicle Technical Maintenance PDF Export", desc: "Compile complete chronological lists of service activities for future resale validation.", price: coinRules.premiumReportCost },
                      { code: "un-comp", title: "Cambodian Garage Services Fee Comparison Report", desc: "Interactive analytical visualizer highlighting garage labor rates around Phnom Penh.", price: coinRules.premiumComparisonCost },
                      { code: "un-disc", title: "Partner Garage Service Discount Voucher (15% Off)", desc: "A physical voucher valid for repairs under certified partner mechanics.", price: coinRules.premiumDiscountCost }
                    ].map(item => {
                      const isBought = unlockedFeatures.includes(item.code);
                      return (
                        <div key={item.code} className="bg-slate-900 border border-white/5 p-4 rounded-3xl flex flex-col justify-between gap-3 text-left">
                          <div>
                            <div className="flex justify-between items-start gap-2">
                              <h5 className="text-[11.5px] font-black text-slate-200 leading-snug">{item.title}</h5>
                              <span className="text-xs font-mono font-bold text-amber-400 shrink-0">{item.price} Coins</span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1 leading-snug">{item.desc}</p>
                          </div>
                          
                          {isBought ? (
                            <button
                              onClick={() => { setWalletSubTab('premium'); }}
                              className="w-full py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-extrabold text-[10px] rounded-lg tracking-wider uppercase select-none text-center"
                            >
                              ✓ Unlocked (Open inside Premium suite)
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                if (wallet.available < item.price) {
                                  alert(`⚠️ Insufficient funds! You need ${item.price} Coins. Your balance: ${wallet.available} Coins.`);
                                  return;
                                }
                                const proceed = window.confirm(`Spend ${item.price} Coins to unlock: "${item.title}"?`);
                                if (!proceed) return;

                                // Unlock item
                                const nextUnlocked = [...unlockedFeatures, item.code];
                                setUnlockedFeatures(nextUnlocked);
                                localStorage.setItem("care_coin_unlocked_features", JSON.stringify(nextUnlocked));

                                // log spent transaction
                                logTxn(`Unlocked Premium Tool: "${item.title}"`, "spent", -item.price, "Completed", "Premium Platform Suite");
                                
                                // register inside premium unlocks table
                                const rawUnlockItem = {
                                  id: `un-${Date.now()}`,
                                  featureName: item.title,
                                  cost: item.price,
                                  duration: item.code === "un-rep" ? "Lifetime" : "30 Days",
                                  status: "Active",
                                  vehicleName: "Registered Models",
                                  expiryDate: item.code === "un-rep" ? "Never" : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                                };
                                const nextUnlockList = [rawUnlockItem, ...premiumUnlocks];
                                savePremiumUnlocks(nextUnlockList);

                                alert(`🎉 Premium feature "${item.title}" unlocked successfully! Explore immediately inside the 'Premium Suite' sub-tab.`);
                              }}
                              className="w-full py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 text-white font-bold text-[10px] rounded-lg tracking-wider uppercase hover:opacity-90 cursor-pointer shadow-sm text-center"
                            >
                              Unlock with {item.price} Care Coins
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Section B: Classified Post Boosting */}
                <div className="bg-slate-900/30 p-5 rounded-4xl border border-white/5 space-y-4">
                  <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-amber-500" /> Dynamic Post Boosting
                  </h4>
                  <p className="text-xs text-slate-400">Increase views on your donation items or certified classified ads. Highlight your posts at the top of the timeline.</p>

                  <div className="bg-slate-950/60 p-4 rounded-3xl border border-white/5 space-y-3">
                    <span className="text-[10px] font-black uppercase text-slate-400 block font-mono">1. Select Listing to Boost</span>
                    <select
                      value={selectedPostToBoost}
                      onChange={(e) => setSelectedPostToBoost(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 p-2.5 text-xs text-white rounded-xl focus:outline-none"
                    >
                      <option value="">-- Choose target post --</option>
                      {donations.filter(d => d.donorId === (activeUser?.id || 1) && d.status !== "Cancelled" && d.status !== "Completed").map(d => (
                        <option key={d.id} value={d.id}>🚙 {d.itemName} ({d.vehicleBrand})</option>
                      ))}
                      <option value="all-simulated-1">🚙 Simulated Post: 2012 Prius Brake Actuator Plug</option>
                      <option value="all-simulated-2">🔧 Simulated Post: Michelin 215/45R17 Spare Wheel</option>
                    </select>
                  </div>

                  <div className="space-y-3.5">
                    <span className="text-[10px] font-black uppercase text-slate-400 block font-mono">2. Select Display Campaign Package</span>
                    
                    {[
                      { code: "basic", title: "Basic Highlight Campaign (24 Hour duration)", desc: "Keep post highlighted at the top. Est: +10 impressions/hr.", price: coinRules.boostBasicCost, days: "1 Day" },
                      { code: "super", title: "Super Spotlight Campaign (3 Day duration)", desc: "Adds custom neon labels, higher priority sorting key. Est: +25 impressions/hr.", price: coinRules.boostSuperCost, days: "3 Days" },
                      { code: "mega", title: "Mega Horizon Banner Campaign (7 Day duration)", desc: "Rotates banner placement, custom telemetry logs. Est: +60 impressions/hr.", price: coinRules.boostMegaCost, days: "7 Days" }
                    ].map(pkg => {
                      return (
                        <div key={pkg.code} className="bg-slate-900 border border-white/5 p-4 rounded-3xl flex justify-between items-center gap-4 text-left">
                          <div className="space-y-1">
                            <h5 className="text-[11px] font-black text-slate-200">{pkg.title}</h5>
                            <p className="text-[9.5px] text-slate-400 leading-snug">{pkg.desc}</p>
                            <span className="text-[10px] text-amber-400 font-mono font-bold block pt-1">Price: {pkg.price} Coins</span>
                          </div>

                          <button
                            onClick={() => {
                              if (!selectedPostToBoost) {
                                alert("⚠️ Select your listing to boost from the dropdown menu first!");
                                return;
                              }
                              if (wallet.available < pkg.price) {
                                alert(`⚠️ Insufficient balance! Boosting requires ${pkg.price} Coins. Your balance: ${wallet.available} Coins.`);
                                return;
                              }
                              const proceed = window.confirm(`Spend ${pkg.price} Coins to launch "${pkg.title}" campaign?`);
                              if (!proceed) return;

                              // Launch Boost
                              const targetId = selectedPostToBoost;
                              const endStr = new Date(Date.now() + (pkg.code === "basic" ? 1 : pkg.code === "super" ? 3 : 7) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                              
                              const newBoostedPosts = {
                                ...boostedPosts,
                                [targetId]: {
                                  package: pkg.title,
                                  duration: pkg.days,
                                  end: endStr,
                                  impressions: 42,
                                  clicks: 3,
                                  messages: 1,
                                  conversions: 0,
                                  createdAt: new Date().toISOString().split('T')[0]
                                }
                              };

                              setBoostedPosts(newBoostedPosts);
                              localStorage.setItem("care_coin_boosted_posts", JSON.stringify(newBoostedPosts));

                              logTxn(`Launched highlight boost: "${pkg.title}"`, "spent", -pkg.price, "Completed", targetId);

                              alert(`🔥 Boost enabled! Post ID "${targetId}" is now heavily boosted at the top until ${endStr}. Live analytic dashboard launched.`);
                              setWalletSubTab('boosts');
                            }}
                            className="py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-[10px] font-black tracking-wider uppercase transition cursor-pointer shrink-0"
                          >
                            Launch Boost
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SUBTAB 4: TRANSACTION HISTORY & DETAILS MODAL */}
          {walletSubTab === 'history' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider block">Care Coins Wallet Transaction Histories Ledger</h3>
                <p className="text-xs text-slate-400">Chronological logs of all token movements, pending locks, and administration adjustments.</p>
              </div>

              {/* Ledger Tabular Card */}
              <div className="bg-slate-900 border border-white/5 rounded-4xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between gap-3 items-center">
                  <span className="text-xs font-black text-white uppercase tracking-widest font-mono">System Cryptographic Records</span>
                  
                  <div className="flex gap-2 w-full sm:w-auto">
                    <input
                      type="text"
                      placeholder="Search items..."
                      value={adminSearchQuery}
                      onChange={(e) => setAdminSearchQuery(e.target.value)}
                      className="bg-slate-950 border border-white/10 p-2 text-xs text-white rounded-lg focus:outline-none w-full sm:w-48 placeholder-slate-600"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 text-[10px] text-slate-500 uppercase font-mono tracking-widest">
                        <th className="py-3 px-1">TX Hash</th>
                        <th className="py-3 px-1">Action</th>
                        <th className="py-3 px-1">Category</th>
                        <th className="py-3 px-1">Date</th>
                        <th className="py-3 px-1 text-right">Coins</th>
                        <th className="py-3 px-1 text-center">Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-sans">
                      {transactions.filter(tx => {
                        const mStr = (tx.activity || "").toLowerCase() + (tx.category || "").toLowerCase();
                        return mStr.includes(adminSearchQuery.toLowerCase());
                      }).map((tx: any) => (
                        <tr key={tx.id} className="text-xs hover:bg-white/5 transition">
                          <td className="py-3 px-1 font-mono text-[10.5px] text-indigo-400 font-bold">{tx.txHash || "0x2FB310"}</td>
                          <td className="py-3 px-1 font-bold text-slate-200">{tx.activity}</td>
                          <td className="py-3 px-1 font-mono text-[10.5px] text-slate-400 capitalize">{tx.category}</td>
                          <td className="py-3 px-1 text-slate-500 font-mono text-[11px]">{tx.date}</td>
                          <td className={`py-3 px-1 text-right font-mono font-black ${tx.coins > 0 ? "text-emerald-400" : "text-amber-400"}`}>
                            {tx.coins > 0 ? "+" : ""}{tx.coins}
                          </td>
                          <td className="py-3 px-1 text-center">
                            <button
                              onClick={() => setSelectedTxnDetails(tx)}
                              className="py-1 px-2.5 bg-slate-950 border border-white/10 hover:border-indigo-400/30 text-[10px] text-slate-355 rounded transition font-bold cursor-pointer"
                            >
                              Inspect Receipt
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SUBTAB 5: LOCKED COINS & ESCROW CONTRACTS */}
          {walletSubTab === 'locked_pending' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider block">Escrow Holdings & Technical Hand-over Contracts</h3>
                <p className="text-xs text-slate-400">Tokens on active auction bids or pending handover verification are held securely inside the escrow contracts database. Funds are released when both parties sign off.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {donations.filter(d => d.status === "Coins Locked" || d.status === "Waiting for Pickup" || d.status === "Disputed").map(post => {
                  const isReceiver = post.currentBidderId === (activeUser?.id || 1);
                  const isDonor = post.donorId === (activeUser?.id || 1);
                  return (
                    <div key={post.id} className="bg-slate-900 border border-slate-700/30 rounded-3xl p-5 space-y-4 text-left">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <span className="text-[10px] bg-rose-500/15 text-rose-350 font-mono rounded px-1.5 py-0.5 uppercase tracking-wide font-extrabold">{post.status}</span>
                          <h4 className="text-xs font-black text-white pt-1">{post.itemName}</h4>
                        </div>
                        <span className="text-xs font-black font-mono text-amber-500 bg-amber-500/10 px-2 py-1 rounded-lg shrink-0">
                          {post.currentBidCoins || post.suggestedCoins} Coins
                        </span>
                      </div>

                      <div className="text-[10.5px] text-slate-450 space-y-1.5 border-t border-b border-white/5 py-3">
                        <div className="flex justify-between">
                          <span>Listing ID:</span>
                          <span className="font-mono">{post.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Donor / Submitter:</span>
                          <span className="font-semibold text-slate-300">{post.donorName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Winner / Claimant:</span>
                          <span className="font-semibold text-slate-300">{post.currentBidderName || "Me"}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <button
                          onClick={() => {
                            const side = isDonor ? 'donor' : 'buyer';
                            handleConfirmCompletion(post, side);
                            alert(`Confirmed pickup authorization from the ${side} profile! Care escrow conditions updated.`);
                          }}
                          className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-black rounded-xl tracking-wider uppercase text-center cursor-pointer shadow-sm"
                        >
                          ✓ Confirm Handover Receipt
                        </button>

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => {
                              const reason = window.prompt("State details of Technical Handover Dispute:");
                              if (!reason) return;
                              setDisputeText(reason);
                              handleRaiseDispute(post);
                            }}
                            className="py-1.5 bg-slate-950 hover:bg-rose-950/45 text-[10px] font-black border border-white/10 text-rose-300 text-center rounded-lg cursor-pointer"
                          >
                            ⚠️ Technical Dispute
                          </button>
                          
                          <button
                            onClick={() => {
                              const proceed = window.confirm("Are you sure you want to cancel the listing? Refund will be processed immediately to bidder.");
                              if (!proceed) return;
                              handleCancelDonation(post);
                            }}
                            className="py-1.5 bg-slate-950 hover:bg-slate-900 border border-white/10 text-[10px] font-black text-slate-400 text-center rounded-lg cursor-pointer"
                          >
                            ✕ Cancel / Return
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {donations.filter(d => d.status === "Coins Locked" || d.status === "Waiting for Pickup" || d.status === "Disputed").length === 0 && (
                  <div className="col-span-full py-16 text-center bg-slate-950/20 rounded-3xl border border-dashed border-white/5 mx-auto w-full">
                    <Check className="w-10 h-10 text-emerald-400 mx-auto mb-2.5" />
                    <span className="text-xs text-slate-500 font-extrabold uppercase block tracking-widest font-mono">No Escrow Funds Currently Frozen</span>
                    <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">Place active bids on spare parts auctions or wait for donation acceptance to trigger contract escrow.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SUBTAB 6: BOOSTS ANALYTICS */}
          {walletSubTab === 'boosts' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider block">Classified Post Highlights Boosting Analytics</h3>
                <p className="text-xs text-slate-400">Review real-time conversion KPIs, impressions counters, and engagement metrics for featured list placements sponsored by Care Coins.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Active Campaigns List (7 Cols) */}
                <div className="lg:col-span-7 space-y-4">
                  <span className="text-xs font-black uppercase text-slate-400 tracking-wider block">List of Active Campaigns</span>
                  
                  <div className="space-y-3">
                    {Object.entries(boostedPosts).map(([postId, detail]: [string, any]) => (
                      <div key={postId} className="bg-slate-900 border border-white/5 rounded-3xl p-4.5 space-y-4">
                        <div className="flex justify-between items-start gap-2">
                          <div className="text-left">
                            <span className="px-2 py-0.5 text-[8.5px] font-black bg-amber-500/10 text-amber-450 border border-amber-500/20 rounded uppercase font-mono tracking-wider">{detail.package}</span>
                            <h4 className="text-xs font-black text-white pt-1.5 line-clamp-1">Post Target ID: {postId}</h4>
                            <span className="text-[10px] text-slate-500 font-mono block">Expiration: {detail.end}</span>
                          </div>
                          
                          <button
                            onClick={() => {
                              const proceed = window.confirm("Temporarily stop campaign highlight? Coins cannot be refunded.");
                              if (!proceed) return;
                              const updated = { ...boostedPosts };
                              delete updated[postId];
                              setBoostedPosts(updated);
                              localStorage.setItem("care_coin_boosted_posts", JSON.stringify(updated));
                              alert("Campaign closed successfully!");
                            }}
                            className="py-1 px-2.5 bg-slate-950 border border-red-500/10 hover:bg-red-955/20 text-red-400 text-[10px] font-bold rounded-lg transition"
                          >
                            Terminate Campaign
                          </button>
                        </div>

                        {/* Conversion stats grid */}
                        <div className="grid grid-cols-4 gap-2 bg-slate-950/60 p-3.5 rounded-2xl text-center">
                          <div>
                            <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider">Views</span>
                            <span className="text-sm font-black text-white font-mono mt-0.5 block">{detail.impressions + Math.floor(Math.random() * 5)}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider">Clicks</span>
                            <span className="text-sm font-black text-indigo-400 font-mono mt-0.5 block">{detail.clicks + Math.floor(Math.random() * 2)}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider">chats</span>
                            <span className="text-sm font-black text-teal-400 font-mono mt-0.5 block">{detail.messages}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider">converts</span>
                            <span className="text-sm font-black text-emerald-400 font-mono mt-0.5 block">100%</span>
                          </div>
                        </div>
                      </div>
                    ))}

                    {Object.keys(boostedPosts).length === 0 && (
                      <div className="text-center py-12 bg-slate-950/20 rounded-3xl border border-dashed border-white/5">
                        <Flame className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                        <span className="text-xs text-slate-500 uppercase font-black block tracking-wider font-mono">No Active Highlights Sponsored</span>
                        <p className="text-[10.5px] text-slate-450 mt-1 max-w-xs mx-auto">Unlock boost campaigns within the 'Spend & Buy' mall using available Care Coins.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Analytical side widget (5 Cols) */}
                <div className="lg:col-span-4 bg-slate-900/30 p-5 rounded-4xl border border-white/5 space-y-4">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">Boost Campaign Conversion Simulator</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans">Boosted postings rotate at a 300% higher frequency in local queries. On average, highlighting reduces handshake delays from 5 days to less than 18 hours.</p>
                  
                  <div className="space-y-2 text-[10.5px] text-slate-450 font-sans">
                    <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                      <span>Phnom Penh Search Boost Factor:</span>
                      <span className="text-amber-400 font-bold font-mono">3.4x</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                      <span>Typical CTR Improvement Rate:</span>
                      <span className="text-indigo-400 font-bold font-mono">+280%</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5">
                      <span>Average Lead Response Time:</span>
                      <span className="text-teal-400 font-bold font-mono">3.2 Hrs</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SUBTAB 7: PREMIUM REPORTS SUITE (Unlocks viewer) */}
          {walletSubTab === 'premium' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider block">Care Coins Premium Reports Suite</h3>
                <p className="text-xs text-slate-400">Instantly launch your unlocked deep analytical tools and AI diagnostic engines without re-spending.</p>
              </div>

              {/* PDF diagnostics lists viewer */}
              <div className="bg-slate-900 border border-white/5 rounded-4xl p-5 space-y-4 text-left">
                <span className="text-xs font-black text-white uppercase tracking-widest block font-mono">Ready to view reports collection</span>
                
                <div className="space-y-3">
                  {[
                    { id: "un-adv", label: "AI Garage Diagnostics Assistant Guide", desc: "A detailed AI analysis explaining technical diagnosis codes and predicted part failures." },
                    { id: "un-rep", label: "Full Vehicle Technical Maintenance Historian Export", desc: "A chronological export detailing all work logs and spare compatibility certificates." },
                    { id: "un-comp", label: "Cambodian Garage Services Fee Comparison Report", desc: "Garage rate comparative tables highlighting local workers' diagnostic fees." }
                  ].map(rep => {
                    const isUnlocked = unlockedFeatures.includes(rep.id) || rep.id === "un-rep" /* default unlock as safe sandbox */;
                    return (
                      <div key={rep.id} className="bg-slate-950/60 p-4 border border-white/5 rounded-3xl flex flex-col justify-between gap-4">
                        <div className="text-left space-y-1">
                          <div className="flex justify-between items-center gap-2">
                            <h4 className="text-xs font-black text-white">{rep.label}</h4>
                            <span className={`text-[8.5px] px-2 py-0.5 rounded font-mono font-black uppercase tracking-wider ${
                              isUnlocked ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-900 text-slate-500"
                            }`}>
                              {isUnlocked ? "Unlocked" : "Locked (Buy in store)"}
                            </span>
                          </div>
                          <p className="text-[10.5px] text-slate-400 leading-snug">{rep.desc}</p>
                        </div>

                        {isUnlocked ? (
                          <div className="p-4 bg-slate-900 border border-white/5 rounded-2xl select-none">
                            <div className="flex items-center gap-1.5 text-xs text-yellow-400 font-bold mb-3 font-mono">
                              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Interactive Unlocked Output Console
                            </div>
                            
                            {/* Render Unlocked Component Output */}
                            <div className="max-h-[300px] overflow-y-auto bg-slate-950/85 p-3.5 rounded-xl border border-white/5 text-xs text-slate-300">
                              {rep.id === "un-adv" ? (
                                <PremiumDreamCarAdvisor 
                                  availableCoins={wallet.available} 
                                  onClose={() => {}} 
                                />
                              ) : rep.id === "un-rep" ? (
                                <PremiumServiceHistoryExport 
                                  vehicles={vehicles} 
                                  records={records} 
                                  onClose={() => {}} 
                                />
                              ) : (
                                <PremiumVehicleReport 
                                  vehicles={vehicles} 
                                  records={records} 
                                  onClose={() => {}} 
                                />
                              )}
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setWalletSubTab('use'); }}
                            className="py-1.5 px-3 bg-white/10 text-white rounded-lg text-[10.5px] font-black hover:bg-white/15 cursor-pointer max-w-sm"
                          >
                            Spend Coins inside Store to Unlock
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* COIN TX RECEIPTS INSPECTION SHEET (MODIFIED DETAILED DIALOG) */}
          {selectedTxnDetails && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm select-none">
              <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-4xl p-6 space-y-4 text-left shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest font-mono">Audit Log Receipt</h4>
                  <button onClick={() => setSelectedTxnDetails(null)} className="p-1 text-slate-500 hover:text-white transition cursor-pointer">
                    <X className="w-4.5 h-4.5" />
                  </button>
                </div>

                <div className="space-y-4.5 font-sans">
                  <div className="text-center py-4 bg-slate-950/40 rounded-3xl border border-white/5 space-y-1">
                    <span className="text-[9.5px] text-slate-500 font-bold block uppercase tracking-wider">Transaction Amount</span>
                    <span className={`text-2xl font-mono font-black ${selectedTxnDetails.coins > 0 ? "text-emerald-400" : "text-amber-400"}`}>
                      {selectedTxnDetails.coins > 0 ? "+" : ""}{selectedTxnDetails.coins} Coins
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase font-mono block">Status: {selectedTxnDetails.status || "Completed"}</span>
                  </div>

                  <div className="space-y-2 text-xs text-slate-400 font-sans">
                    <div className="flex justify-between border-b border-white/5 pb-2.5">
                      <span className="text-slate-500">Unique Tx ID:</span>
                      <span className="font-mono text-white select-all">{selectedTxnDetails.id}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2.5">
                      <span className="text-slate-500">Cryptohash SHA-2Key:</span>
                      <span className="font-mono text-indigo-300 font-semibold select-all">{selectedTxnDetails.txHash || "0xBAF2E6"}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2.5">
                      <span className="text-slate-500">Target Activity Log:</span>
                      <span className="text-white text-right max-w-[200px] leading-relaxed font-bold">{selectedTxnDetails.activity}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2.5">
                      <span className="text-slate-500">Related Subsystem:</span>
                      <span className="text-slate-200 capitalize font-bold">{selectedTxnDetails.category}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2.5">
                      <span className="text-slate-500">System Trace Date:</span>
                      <span className="font-mono text-slate-200">{selectedTxnDetails.date}</span>
                    </div>
                    <div className="flex justify-between pb-1">
                      <span className="text-slate-500">Authority Operator:</span>
                      <span className="text-slate-200 font-bold">{selectedTxnDetails.user || "Active Driver Member"}</span>
                    </div>
                    {selectedTxnDetails.reason && (
                      <div className="mt-3 p-3 bg-slate-950/60 rounded-xl border border-red-500/10 text-[11px] text-slate-300 leading-snug">
                        <span className="font-bold text-red-400 uppercase font-mono block text-[9.5px]">Reason For Adjustment:</span>
                        {selectedTxnDetails.reason}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedTxnDetails(null)}
                  className="w-full py-2.5 bg-indigo-600 text-white font-black text-xs rounded-xl hover:bg-indigo-700 cursor-pointer text-center"
                >
                  Close Receipt View
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* TAB C: FORUM CONTRIBUTION REWARD SIMULATOR */}
      {activeTab === 'forum_contrib' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
          
          {/* SIMULATION CONTROLS */}
          <div className="lg:col-span-5 bg-slate-900/40 p-5 rounded-4xl border border-white/5 space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              Simulate Helpful Answer Rewards
            </h3>
            <p className="text-xs text-slate-400">
              Earn coins by helping other drivers solve Toyota, BYD or Ford issues in the forum threads. Fill in simulated details below to claim reward Coins.
            </p>

            <form onSubmit={handleSimulateForumHelp} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-405 block uppercase text-slate-405">Helper Thread Title</label>
                <input
                  type="text"
                  required
                  value={forumHelperTitle}
                  onChange={(e) => setForumHelperTitle(e.target.value)}
                  placeholder="e.g. Explained cooling system blockage diagnosis"
                  className="w-full bg-slate-950 font-sans text-xs p-3 rounded-xl text-slate-200 border border-white/10 focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-405 block uppercase">Thread Result Score</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => { setForumHelperLikes(5); setForumHelperGarageVerified(false); }}
                    className={`py-2 text-[10px] rounded-lg font-bold border transition ${
                      forumHelperLikes >= 5 && !forumHelperGarageVerified ? "bg-sky-500/25 border-sky-400 text-sky-200" : "bg-slate-950 border-white/10 text-slate-400"
                    }`}
                  >
                    ★ 5+ Likes (+1 Coin)
                  </button>

                  <button
                    type="button"
                    onClick={() => { setForumHelperLikes(8); setForumHelperGarageVerified(false); }}
                    className={`py-2 text-[10px] rounded-lg font-bold border transition ${
                      forumHelperLikes >= 8 ? "bg-amber-500/25 border-amber-400 text-amber-200" : "bg-slate-950 border-white/10 text-slate-400"
                    }`}
                  >
                    ★ Solved Thread (+3)
                  </button>

                  <button
                    type="button"
                    onClick={() => { setForumHelperGarageVerified(true); }}
                    className={`py-2 text-[10px] rounded-lg font-bold border transition ${
                      forumHelperGarageVerified ? "bg-emerald-500/25 border-emerald-400 text-emerald-200" : "bg-slate-950 border-white/10 text-slate-400"
                    }`}
                  >
                    ★ Garage Verified (+5)
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-sky-500 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer transition shadow hover:bg-sky-600"
              >
                <Send className="w-4 h-4" />
                <span>Simulate Answer Post & Earn</span>
              </button>
            </form>
          </div>

          {/* SIMULATED FEEDBACK / RULES */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-slate-900/30 p-5 rounded-4xl border border-white/5 space-y-4">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Approved Forum Help Rules
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                <div className="bg-slate-950/60 p-3 rounded-2xl border border-white/5">
                  <span className="text-emerald-400 font-bold block mb-1">✓ Solution Accepted</span>
                  <p className="text-[10px] text-slate-402">
                    When the original thread creator specifies your comment as the correct solution, system releases <span className="font-bold underline text-emerald-400 font-mono">+3 Coins</span>.
                  </p>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-2xl border border-white/5">
                  <span className="text-emerald-400 font-bold block mb-1">✓ Garage Endorsed</span>
                  <p className="text-[10px] text-slate-402">
                    If a registered partner garage checks and flags your advice as correct mechanics, system awards <span className="font-bold underline text-emerald-400 font-mono">+5 Coins</span>.
                  </p>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-2xl border border-white/5">
                  <span className="text-rose-400 font-bold block mb-1">✓ Fake Spotting</span>
                  <p className="text-[10px] text-slate-402">
                    If you identify dangerous or dangerous vehicle repair advice in a thread and report it, earn <span className="font-bold text-rose-300">+1 Coin</span> on verification.
                  </p>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-2xl border border-white/5">
                  <span className="text-[#4D4DFF] font-bold block mb-1">✓ Experience Logs</span>
                  <p className="text-[10px] text-slate-402">
                    Write detailed repair experiences with photo guides. Earn <span className="text-sky-300 font-bold">+2 to +5 Coins</span>.
                  </p>
                </div>
              </div>

              {/* Forum payout history */}
              <div className="pt-3 border-t border-white/5">
                <span className="text-[10px] font-bold uppercase block text-slate-500 mb-2 font-mono">My Forum Earning History</span>
                <div className="space-y-2">
                  {forumRewards.map(f => (
                    <div key={f.id} className="bg-slate-950/80 p-2.5 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <span className="text-slate-300 font-bold block">{f.title}</span>
                        <span className="text-[10px] text-slate-500">{f.status} • {f.date}</span>
                      </div>
                      <span className="text-emerald-400 font-mono font-bold font-semibold">+{f.reward} Coins</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* TAB D: LOCATION CONTRIBUTION REWARD SIMULATOR */}
      {activeTab === 'location_contrib' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
          
          {/* SIMULATE CONTROLLER PANEL */}
          <div className="lg:col-span-5 bg-slate-900/40 p-5 rounded-4xl border border-white/5 space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              Simulate GPS Location Additions
            </h3>
            <p className="text-xs text-slate-400">
              Users earn digital credits by adding petrol, repair garages, and electric charging spots to the live interactive Cambodia Finder.
            </p>

            <form onSubmit={handleSimulateLocationAdd} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold block uppercase text-slate-405 font-mono">Location business name</label>
                <input
                  type="text"
                  required
                  value={locName}
                  onChange={(e) => setLocName(e.target.value)}
                  placeholder="e.g. TotalEnergies Road Side St 43"
                  className="w-full bg-slate-950 font-sans text-xs p-3 rounded-xl text-slate-200 border border-white/10 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold block uppercase text-slate-405 font-mono">Classification category</label>
                <select
                  value={locType}
                  onChange={(e) => setLocType(e.target.value)}
                  className="w-full bg-slate-950 text-xs text-slate-300 p-3 rounded-xl border border-white/10 focus:outline-none"
                >
                  <option value="petrol">Petrol Fuel Station (+1 Coin)</option>
                  <option value="garage">Vehicle Overhaul Garage (+2 Coins)</option>
                  <option value="ev_charging">EV Sockets Station (+3 Coins)</option>
                  <option value="spare_part_shop">Spare Parts Shop (+2 Coins)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-rose-500 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer transition shadow hover:bg-rose-600"
              >
                <Plus className="w-4 h-4" />
                <span>Simulate GPS Location Placement</span>
              </button>
            </form>
          </div>

          {/* RULES / STATS SECTION */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-slate-900/30 p-5 rounded-4xl border border-white/5 space-y-4">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Location Reward Schedule
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-xs font-sans rounded-xl overflow-hidden">
                  <thead>
                    <tr className="bg-slate-950 text-slate-400 uppercase text-[9px] font-bold tracking-widest leading-normal">
                      <th className="py-2.5 px-3 text-left">Map Contribution Action</th>
                      <th className="py-2.5 px-3 text-right">Standard Reward</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    <tr>
                      <td className="py-2.5 px-3">🗺️ Map clean fuel petrol station</td>
                      <td className="py-2.5 px-3 text-right text-emerald-400 font-mono font-bold">+1 Care Coin</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3">🔧 Map brand new mechanical overhaul garage</td>
                      <td className="py-2.5 px-3 text-right text-emerald-400 font-mono font-bold">+2 Care Coins</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3">⚡ Charger socket mapping (EV)</td>
                      <td className="py-2.5 px-3 text-right text-emerald-400 font-mono font-bold">+3 Care Coins</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3">📷 Upload live shop facade/photo proof</td>
                      <td className="py-2.5 px-3 text-right text-emerald-400 font-mono font-bold">+1 Care Coin</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3">🚫 Report false, outfounded business details</td>
                      <td className="py-2.5 px-3 text-right text-emerald-400 font-mono font-bold">+1 Care Coin</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* History list */}
              <div className="pt-3 border-t border-white/5">
                <span className="text-[10px] font-bold uppercase block text-slate-500 mb-2 font-mono">My Location Mapping Contributions</span>
                <div className="space-y-2">
                  {locationContributions.map(l => (
                    <div key={l.id} className="bg-slate-950/85 p-2.5 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <span className="text-slate-300 font-bold block">{l.name}</span>
                        <span className="text-[10px] text-zinc-500">{l.type} Location • {l.status} ({l.date})</span>
                      </div>
                      <span className="text-emerald-400 font-mono font-bold">+{l.reward} Coins</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* TAB E: COIN SPENDING INTERACTIVE SHOP, PREMIUM UNLOCKS & HIGHLIGHT POST BOOSTING */}
      {activeTab === 'spending' && (
        <div className="space-y-5 text-left font-sans">
          
          {/* Header Block with tab level available check */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-3">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider block">Spend Coins Options</h3>
              <p className="text-xs text-slate-400">Unlock premium diagnostics, advisory evaluations and boost post exposure.</p>
            </div>
            <div className="text-[11px] bg-slate-950 p-2.5 rounded-xl text-amber-400 font-bold uppercase tracking-wider block shrink-0 mt-2 md:mt-0 border border-amber-500/10">
              🪙 My Care Wallet: <span className="font-mono font-black text-sm">{wallet.available}</span> Available Coins
            </div>
          </div>

          {/* INNER TOGGLE NAVIGATION */}
          <div className="flex bg-slate-950/60 p-1 rounded-2xl border border-white/5 max-w-sm select-none">
            <button
              onClick={() => { setSpendingInnerTab('premium'); setActivePremiumFeature(null); }}
              className={`flex-1 py-2 text-xs font-black rounded-xl text-center transition cursor-pointer ${
                spendingInnerTab === 'premium' ? "bg-white/10 text-white border border-white/10" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              🏆 Premium Unlocks
            </button>
            <button
              onClick={() => { setSpendingInnerTab('boosting'); setActivePremiumFeature(null); }}
              className={`flex-1 py-2 text-xs font-black rounded-xl text-center transition cursor-pointer ${
                spendingInnerTab === 'boosting' ? "bg-white/10 text-white border border-white/10" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              🔥 Highlight Boosting
            </button>
          </div>

          {/* INNER TAB DISPLAY BLOCK */}
          {spendingInnerTab === 'premium' ? (
            <div className="space-y-6">
              
              {/* If an unlocked premium experience is active, proxy it immediately in this container */}
              {activePremiumFeature === "maintenance" && (
                <PremiumVehicleReport 
                  vehicles={vehicles} 
                  records={records} 
                  onClose={() => setActivePremiumFeature(null)} 
                />
              )}

              {activePremiumFeature === "dreamcar" && (
                <PremiumDreamCarAdvisor 
                  availableCoins={wallet.available} 
                  onClose={() => setActivePremiumFeature(null)} 
                />
              )}

              {activePremiumFeature === "export" && (
                <PremiumServiceHistoryExport 
                  vehicles={vehicles} 
                  records={records} 
                  onClose={() => setActivePremiumFeature(null)} 
                />
              )}

              {/* If general custom interactive summaries are active */}
              {activePremiumFeature && !["maintenance", "dreamcar", "export"].includes(activePremiumFeature) && (
                <div className="bg-slate-950 p-6 rounded-4xl border border-white/10 space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <h4 className="text-sm font-black text-white uppercase tracking-wider block">
                      🔮 Smart Advisory Output
                    </h4>
                    <button 
                      onClick={() => setActivePremiumFeature(null)} 
                      className="p-1 px-3 bg-white/5 hover:bg-white/10 text-xs text-white rounded-lg cursor-pointer"
                    >
                      Close Tool
                    </button>
                  </div>
                  
                  {activePremiumFeature === "advice" && (
                    <div className="space-y-3">
                      <p className="text-xs text-slate-300 leading-relaxed">
                        <span className="font-black text-amber-400 block mb-1">AI Diagnostic Checklist:</span>
                        Based on your reported models, we recommend checking the high-voltage cells (hybrid/EV) every 6 months using thermal imaging. For gasoline engines, keep carbon flushes scheduled under 60,000 km to preserve valves.
                      </p>
                      <button onClick={() => alert("Advice exported as SMS checklist!")} className="py-1.5 px-3 bg-emerald-500 text-slate-950 text-xs font-bold rounded-lg cursor-pointer">
                        Sync Checklist via Mobile SMS
                      </button>
                    </div>
                  )}

                  {activePremiumFeature === "garage" && (
                    <div className="space-y-3">
                      <span className="font-black text-amber-500 block text-xs">Quality Workshop Price Matrix Comparison:</span>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs divide-y divide-white/5 font-mono">
                          <thead>
                            <tr className="text-slate-500 uppercase text-[9px] font-bold">
                              <th className="py-1">Workshop</th>
                              <th className="py-1">Price Quotient</th>
                              <th className="py-1">Rating</th>
                              <th className="py-1">Parts Verified</th>
                            </tr>
                          </thead>
                          <tbody className="text-slate-300">
                            <tr>
                              <td className="py-2 font-sans font-bold">Apsara Fast Garage</td>
                              <td className="py-2 text-emerald-400">$$ (Standard)</td>
                              <td className="py-2">★ 4.9 (240 reviews)</td>
                              <td className="py-2">Yes (Original)</td>
                            </tr>
                            <tr>
                              <td className="py-2 font-sans font-bold">Angkor Overhaul Hub</td>
                              <td className="py-2 text-emerald-400">$$$ (Premium)</td>
                              <td className="py-2">★ 4.7 (120 reviews)</td>
                              <td className="py-2">Yes (OEM/Custom)</td>
                            </tr>
                            <tr>
                              <td className="py-2 font-sans font-bold">Local Garage Street 51</td>
                              <td className="py-2 text-emerald-400">$ (Low Cost)</td>
                              <td className="py-2">★ 4.2 (35 reviews)</td>
                              <td className="py-2">No (Scrap/Used)</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {activePremiumFeature === "matcher" && (
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-white block">Regional Prices Mapping:</span>
                      <p className="text-xs text-slate-400">
                        Average Prius Gen 2 Battery: Phnom Penh ($850 USD) | Siem Reap ($920 USD) | Battambang ($1,040 USD). Sourcing directly on the peer-to-peer Care Coin board reduces shipping and overhead fees by default.
                      </p>
                    </div>
                  )}

                  {activePremiumFeature === "support" && (
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs rounded-2xl">
                      🚀 Priority Support token is now active in your profile. Your help threads will be prioritized and marked as urgent on community experts' desks.
                    </div>
                  )}

                  {activePremiumFeature === "voucher" && (
                    <div className="p-4 bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs rounded-2xl">
                      🎟️ Your Partner Discount voucher MC-DISC-9002 is active. Claim a free vehicle inspection at any certified garage.
                    </div>
                  )}

                  {activePremiumFeature === "selling" && (
                    <div className="space-y-2">
                      <span className="text-xs text-indigo-400 font-bold block">Classified Post Performance:</span>
                      <p className="text-xs text-slate-350 leading-relaxed">
                        Premium Analytics unlock gives you full SEO tracking. Sourcing requests have 3.2x higher conversion ratios when boosted with Location packages inside Siem Reap provincial corridors today.
                      </p>
                    </div>
                  )}

                  {activePremiumFeature === "garage_dir" && (
                    <div className="space-y-1">
                      <span className="text-xs font-bold block text-white font-mono">Expert Sourcing Map</span>
                      <p className="text-xs text-slate-400">Active directory contains 42 verified mechanical workshops across Cambodia authorized to diagnose high-voltage battery kits.</p>
                    </div>
                  )}

                </div>
              )}

              {/* General Grid of Locks/Premium Options */}
              {!activePremiumFeature && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {[
                    { id: "maintenance", title: "Advanced Vehicle Maintenance Analyst", cost: 8, notes: "OBD-II dynamic component-wear diagrams based on current registered fleet", cat: "For owners" },
                    { id: "export", title: "Chrono History Print & Export Dossier", cost: 12, notes: "Generate official printable service invoice receipts for workshops & resale", cat: "Documents" },
                    { id: "dreamcar", title: "AI Dream Car Financial Matching Advisor", cost: 15, notes: "Personalized matching relative to Cambodian road clearance and local income", cat: "Advisory" },
                    { id: "advice", title: "AI Car Maintenance Repair Help Advice", cost: 5, notes: "Diagnostic guides fitted to standard hybrid seal or battery wear issues", cat: "AI Diagnostic" },
                    { id: "garage", title: "Garage Comparer & Quality Analyst", cost: 6, notes: "Cross-examine reviews, labor rates and certified mechanics diagnostics", cat: "Workshop" },
                    { id: "matcher", title: "Spatial Spare Parts Price Matcher", cost: 7, notes: "Districts price averages mapping for batteries, fans or cables", cat: "Sourcing" },
                    { id: "support", title: "Priority Community Help Ticketing", cost: 10, notes: "Enforce faster workshop scanning or expert attention in forum panels", cat: "Priority Support" },
                    { id: "voucher", title: "Offical Workshops Discount Voucher", cost: 20, notes: "Redeem free professional inspects at connected certified clinics", cat: "Voucher Codes" },
                    { id: "selling", title: "Classified Listing Dynamic Analytics", cost: 15, notes: "Track search counts, conversions and message analytics on active sales", cat: "Business Analytics" },
                    { id: "garage_dir", title: "Certified Garages Active Directory", cost: 12, notes: "List of licensed EV and hybrid mechanics in Cambodia provinces", cat: "Business Users" }
                  ].map(feature => {
                    const isUnlocked = unlockedFeatures.includes(feature.id);
                    
                    return (
                      <div 
                        key={feature.id} 
                        className={`p-4.5 rounded-3xl border flex flex-col justify-between transition ${
                          isUnlocked 
                            ? "bg-slate-900/60 border-emerald-500/20 shadow-lg" 
                            : "bg-slate-900 border-white/5 hover:border-white/10"
                        }`}
                      >
                        <div className="space-y-1.5 text-left">
                          <span className={`text-[8.5px] px-2 py-0.5 rounded font-black uppercase tracking-wider block w-max select-none ${
                            isUnlocked ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-slate-400"
                          }`}>
                            {feature.cat}
                          </span>
                          
                          <h4 className="text-xs font-black text-white font-bold leading-snug">
                            {feature.title}
                          </h4>
                          
                          <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                            {feature.notes}
                          </p>
                        </div>

                        <div className="border-t border-white/5 pt-3.5 mt-3.5 flex items-center justify-between">
                          <div>
                            <span className="text-[8px] text-slate-500 block uppercase font-bold">Unlocking Premium Cost</span>
                            <span className="text-xs font-mono text-amber-400 font-extrabold uppercase">
                              {feature.cost} Care Coins
                            </span>
                          </div>

                          {isUnlocked ? (
                            <button
                              type="button"
                              onClick={() => setActivePremiumFeature(feature.id)}
                              className="py-1.5 px-3 bg-emerald-500 text-slate-950 font-black text-xs rounded-xl cursor-pointer hover:bg-emerald-600 transition tracking-wide shadow"
                            >
                              Launch Tool
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                if (wallet.available < feature.cost) {
                                  alert(`⚠️ Insufficient wallet balance! Unlocking requires ${feature.cost} Care Coins. Contribute to the Forum, map charging stations, or donate spare parts to earn coins.`);
                                  return;
                                }
                                logTxn(`Unlocked Feature: ${feature.title}`, "spent", -feature.cost);
                                const nextFeatures = [...unlockedFeatures, feature.id];
                                setUnlockedFeatures(nextFeatures);
                                localStorage.setItem("care_coin_unlocked_features", JSON.stringify(nextFeatures));
                                alert(`🎉 Premium feature unlocked successfully! "${feature.title}" is now active for use in your session.`);
                              }}
                              className="py-1.5 px-3 bg-white/5 border border-white/10 text-white font-bold text-xs rounded-xl cursor-pointer hover:bg-white/10 transition flex items-center gap-1 font-sans"
                            >
                              <Lock className="w-3.5 h-3.5 text-amber-500" />
                              <span>Unlock Tool</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          ) : (
            <div className="bg-slate-900/30 p-5 rounded-4xl border border-white/5 space-y-4 font-sans text-left">
              
              {/* Campaign Boosting Selection */}
              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-wider mb-1">Highlight Post Boosting Console</h4>
                <p className="text-[11px] text-slate-400">Select any active approved donation or classified listing on the platform to boost its impressions and engagement rates.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
                
                {/* SELECTOR & PACKAGE PANELS */}
                <div className="bg-slate-950/60 p-4 rounded-3xl border border-white/5 space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase block tracking-wider font-mono">1. Choose Active Post to Boost</label>
                    <select
                      value={selectedPostToBoost}
                      onChange={(e) => setSelectedPostToBoost(e.target.value)}
                      className="w-full bg-slate-900 text-xs p-2.5 rounded-xl text-slate-200 border border-white/10 focus:outline-none cursor-pointer"
                    >
                      <option value="">-- Choose Approved Post --</option>
                      {donations.filter(d => d.status === "Approved" || d.status.startsWith("Open")).map(d => (
                        <option key={d.id} value={d.id}>
                          🚙 {d.itemName} ({d.vehicleBrand})
                        </option>
                      ))}
                      {/* Simulated fallback option if they have no posts yet */}
                      {donations.filter(d => d.status === "Approved" || d.status.startsWith("Open")).length === 0 && (
                        <option value="temp-sim-1">Simulated Prius Inverter listing (No active posts registered)</option>
                      )}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] text-slate-500 font-bold uppercase block tracking-wider font-mono">2. Select Boost Duration Package</label>
                    
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                      {[
                        { pack: "Small Highlight", cost: 3, dur: "24 Hours", benefit: "Double local area listing priority" },
                        { pack: "Standard Highlight", cost: 8, dur: "3 Days", benefit: "Featured placement in relevant categories" },
                        { pack: "Strong Premium", cost: 15, dur: "7 Days", benefit: "Homepage persistent banner rotation" },
                        { pack: "Urgent Help Boost", cost: 10, dur: "24 Hours", benefit: "Glowing background + URGENT HELP badge" },
                        { pack: "Vehicle Matcher", cost: 12, dur: "3 Days", benefit: "Targeted feed push to Prius/BYD compatible accounts" },
                        { pack: "Location Highlight", cost: 10, dur: "3 Days", benefit: "Prioritized push to users within 25km radius" },
                        { pack: "Business Premium", cost: 25, dur: "7 Days", benefit: "Adds sponsored corporate tag and analytics logs" }
                      ].map(p => {
                        const isSelected = selectedPostToBoost !== "";
                        
                        return (
                          <div 
                            key={p.pack}
                            onClick={() => {
                              if (!selectedPostToBoost) {
                                alert("Please select a target post before launching a boost package!");
                                return;
                              }
                              if (wallet.available < p.cost) {
                                alert(`⚠️ Insufficient balance! Boosting requires ${p.cost} Coins. Your active available balance is ${wallet.available} Care Coins.`);
                                return;
                              }
                              
                              const targetPostId = selectedPostToBoost === "temp-sim-1" ? "post-1" : selectedPostToBoost;
                              
                              // Deduct coins
                              logTxn(`Boosted Post: "${p.pack}" packaging`, "spent", -p.cost);
                              
                              // Add to boosted lists
                              const endStr = new Date(Date.now() + (parseInt(p.dur) * 86400000)).toISOString().split('T')[0];
                              const nextBoosted = {
                                ...boostedPosts,
                                [targetPostId]: {
                                  package: p.pack,
                                  duration: p.dur,
                                  end: endStr,
                                  impressions: Math.floor(Math.random() * 50) + 120,
                                  clicks: Math.floor(Math.random() * 20) + 40,
                                  messages: Math.floor(Math.random() * 3) + 1,
                                  conversions: 0,
                                  createdAt: new Date().toISOString().split('T')[0]
                                }
                              };
                              setBoostedPosts(nextBoosted);
                              localStorage.setItem("care_coin_boosted_posts", JSON.stringify(nextBoosted));
                              
                              setSelectedPostToBoost("");
                              alert(`🔥 Sourcing Boost Activated! ${p.cost} Coins securely spent. Your post is now sponsored and glowing on the board.`);
                            }}
                            className={`p-3 bg-slate-900 border rounded-2xl flex justify-between items-center transition cursor-pointer text-xs ${
                              isSelected ? "border-amber-500/20 hover:border-amber-500" : "border-white/5 opacity-50"
                            }`}
                          >
                            <div className="space-y-0.5 max-w-[200px]">
                              <span className="font-bold block text-white">{p.pack} ({p.dur})</span>
                              <p className="text-[10px] text-slate-400 font-sans leading-normal">{p.benefit}</p>
                            </div>
                            <span className="text-xs font-mono font-black text-amber-400 shrink-0 select-none">
                              {p.cost} Coins
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* CURRENT ACTIVE CAMPAIGNS & LIVE METRICS TICKERS */}
                <div className="bg-slate-950/40 p-4 rounded-3xl border border-white/5 space-y-4">
                  <span className="text-[10px] font-black text-slate-400 uppercase block tracking-wider font-mono">
                    Active Campaigns Live Engagement Stats
                  </span>

                  <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                    {Object.keys(boostedPosts).map(postId => {
                      const campaign = boostedPosts[postId];
                      const matchedPost = donations.find(d => d.id === postId);
                      const title = matchedPost?.itemName || "Toyota Prius Inverter (Simulated Match)";
                      
                      return (
                        <div key={postId} className="bg-slate-900/60 p-3.5 rounded-2xl border border-amber-500/30 space-y-2 layout-left">
                          <div className="flex justify-between items-start gap-1">
                            <div>
                              <span className="text-[8.5px] bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-black px-1.5 py-0.5 rounded uppercase">
                                🔥 {campaign.package} Active
                              </span>
                              <h5 className="text-[11.5px] font-bold text-white leading-snug line-clamp-1 block mt-1">
                                {title}
                              </h5>
                            </div>
                            <button
                              onClick={() => {
                                const next = { ...boostedPosts };
                                delete next[postId];
                                setBoostedPosts(next);
                                localStorage.setItem("care_coin_boosted_posts", JSON.stringify(next));
                                alert("Campaign retired. Sponsoring removed.");
                              }}
                              className="text-slate-400 hover:text-white cursor-pointer hover:scale-105 shrink-0"
                              title="Delete Active Campaign"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Stat Bento metrics row */}
                          <div className="grid grid-cols-4 gap-1.5 pt-1.5 border-t border-white/5 select-none text-center font-mono text-[9px]">
                            <div className="bg-slate-950 p-1.5 rounded-lg">
                              <span className="text-[7.5px] text-slate-500 block uppercase">Imps</span>
                              <span className="text-white font-bold block">{campaign.impressions}</span>
                            </div>
                            <div className="bg-slate-950 p-1.5 rounded-lg">
                              <span className="text-[7.5px] text-slate-500 block uppercase">Clicks</span>
                              <span className="text-sky-400 font-bold block">{campaign.clicks}</span>
                            </div>
                            <div className="bg-slate-950 p-1.5 rounded-lg">
                              <span className="text-[7.5px] text-slate-500 block uppercase">Chat Msgs</span>
                              <span className="text-violet-400 font-bold block">{campaign.messages}</span>
                            </div>
                            <div className="bg-slate-950 p-1.5 rounded-lg">
                              <span className="text-[7.5px] text-slate-500 block uppercase">Convs</span>
                              <span className="text-emerald-400 font-bold block">{campaign.conversions}</span>
                            </div>
                          </div>

                          <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                            <span>Ends: {campaign.end}</span>
                            <span className="text-amber-500 font-black animate-pulse">● Stats updating realtime...</span>
                          </div>
                        </div>
                      );
                    })}

                    {Object.keys(boostedPosts).length === 0 && (
                      <div className="py-14 text-center border-2 border-dashed border-white/5 rounded-2xl flex flex-col justify-center items-center">
                        <Flame className="w-8 h-8 text-slate-700 animate-bounce mb-1.5" />
                        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black block">No Active Campaigns Running</span>
                        <p className="text-[10px] text-slate-500 max-w-xs mt-1">Select an active approved post and purchase a boost duration package. Sponsoring your post will multiply visibility ratings instantly.</p>
                      </div>
                    )}
                  </div>

                </div>

              </div>
              
            </div>
          )}

        </div>
      )}

      {/* TAB F: SECONDARY PERSPECTIVE: GARAGE EXPERT VERIFIERS */}
      {activeTab === 'garage_expert' && activeUserRole === "Garage Owner" && (
        <div className="space-y-4 text-left">
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider block">Garage Expert Sourcing & Verification Gate</h3>
            <p className="text-xs text-slate-400">
              Certified Garages can confirm spare compatibility, ensure electrical components are safe, and audit community-flagged items. Earn trust points!
            </p>
          </div>

          <div className="space-y-3">
            {donations.filter(d => d.verificationLevel === "None" && d.status === "Pending Review").map(post => (
              <div key={post.id} className="bg-slate-900 border border-emerald-500/10 p-4 rounded-3xl flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[8.5px] font-black bg-emerald-500/15 text-emerald-400 rounded uppercase">
                      Class: {post.category}
                    </span>
                    <span className="text-slate-400 font-mono text-xs font-semibold">
                      For {post.vehicleBrand} {post.vehicleModel} ({post.year})
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white leading-snug">{post.itemName}</h4>
                  <p className="text-[10.5px] text-slate-400">
                    Submitter reported as: <span className="text-indigo-400 italic">"{post.condition}" condition</span>. Wants to receive a community reward of <span className="font-bold font-mono text-yellow-400">{post.suggestedCoins} Care Coins</span>.
                  </p>
                </div>

                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleGarageVerifyItem(post)}
                    className="py-2 px-3 bg-emerald-500 text-slate-950 font-black text-xs rounded-xl cursor-pointer tracking-wider uppercase leading-none shadow hover:bg-emerald-600"
                  >
                    🔧 Certify Compatibility & Safe to Use
                  </button>
                </div>
              </div>
            ))}

            {donations.filter(d => d.verificationLevel === "None" && d.status === "Pending Review").length === 0 && (
              <div className="p-8 text-center bg-slate-950/20 rounded-2xl border border-white/5">
                <Check className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <span className="text-xs text-slate-500 uppercase tracking-widest block font-bold leading-relaxed">System Verification Queue Empty</span>
                <p className="text-[10.5px] text-slate-500 mt-1 max-w-xs mx-auto">There are no pending high-value items requiring professional review at the moment.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB G: SUPER ADMINISTRATION PANEL */}
      {activeTab === 'admin_dashboard' && activeUserRole === "Admin" && (
        <div className="space-y-4 text-left">
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider block">Super Admin Operations Center</h3>
            <p className="text-xs text-slate-400">Verify coin rewards, handle disputes, and view economy metrics.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* PENDING TASKS GATES (7 Cols) */}
            <div className="lg:col-span-7 space-y-4">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest font-mono">Disputes & Pending Rewards Auditing</span>
              
              <div className="space-y-3">
                {donations.filter(d => d.status === "Pending Review" || d.status === "Disputed").map(post => (
                  <div key={post.id} className="bg-slate-900 border border-slate-700/30 p-4 rounded-3xl space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[8px] font-bold bg-[#4D4DFF] text-white px-2 py-0.5 rounded uppercase font-mono">
                          {post.status}
                        </span>
                        <h4 className="text-xs font-bold text-white block mt-1 leading-snug">{post.itemName}</h4>
                      </div>
                      <span className="text-xs font-mono font-black text-amber-400">
                        Suggesting: {post.suggestedCoins} Coins
                      </span>
                    </div>

                    {post.status === "Disputed" && (
                      <div className="p-3 bg-red-500/10 border border-red-500/3 w-full rounded-2xl text-[11px] text-red-200 font-sans space-y-1">
                        <span className="font-bold block text-rose-300 uppercase select-none tracking-wider text-[9px]">Opened Dispute Complaint Notes:</span>
                        <p className="leading-relaxed">"{post.disputeNotes}"</p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 pt-1 justify-end">
                      {post.status === "Pending Review" ? (
                        <>
                          <button
                            onClick={() => handleAdminApprovePost(post)}
                            className="py-1.5 px-3 bg-emerald-500 text-slate-950 font-black text-xs rounded-xl cursor-pointer"
                          >
                            Approve Listing
                          </button>
                          <button
                            onClick={() => {
                              const updated = donations.map(d => d.id === post.id ? { ...d, status: "Rejected" as const } : d);
                              saveDonationsToStorage(updated);
                              alert("Post rejected and cancelled.");
                            }}
                            className="py-1.5 px-3 bg-red-500/20 text-red-300 font-bold text-xs rounded-xl cursor-pointer"
                          >
                            Reject Reward
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleAdminSettleDispute(post, "buyer")}
                            className="py-1.5 px-3 bg-blue-500 text-white font-bold text-xs rounded-xl cursor-pointer"
                          >
                            Close: Fully Refund Bidder
                          </button>
                          <button
                            onClick={() => handleAdminSettleDispute(post, "donor")}
                            className="py-1.5 px-3 bg-emerald-500 text-slate-950 font-black text-xs rounded-xl cursor-pointer"
                          >
                            Close: Award to Donor
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}

                {donations.filter(d => d.status === "Pending Review" || d.status === "Disputed").length === 0 && (
                  <div className="p-10 text-center bg-slate-950/20 rounded-2xl border border-dashed border-white/5">
                    <Check className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                    <span className="text-xs text-slate-500 uppercase tracking-widest block font-bold leading-relaxed">No pending actions</span>
                  </div>
                )}
              </div>
            </div>

            {/* QUICK STATS CONTROLS (5 Cols) */}
            <div className="lg:col-span-5 bg-slate-900/30 p-5 rounded-4xl border border-white/5 space-y-4 text-xs font-sans">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest block font-mono">Operations Quick Override Rules</span>
              
              <div className="space-y-3">
                <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-white/5 space-y-2">
                  <span className="text-slate-350 block font-bold">Adjust Global Reward Ratio</span>
                  <div className="flex gap-2">
                    <button onClick={() => alert("Value Adjusted: Standard")} className="flex-1 py-1 px-2.5 bg-white/10 text-slate-200 rounded font-bold font-mono">1.0x (Standard)</button>
                    <button onClick={() => alert("Value Adjusted: Campaign Boost")} className="flex-1 py-1 px-2.5 bg-amber-500 text-slate-950 rounded font-black font-mono">1.5x Campaign</button>
                  </div>
                </div>

                <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-white/5 space-y-1">
                  <span className="text-slate-355 font-bold block">Spotted Abuse flags</span>
                  <p className="text-[10.5px] text-slate-400 leading-normal">
                    We scanned forum profiles and found no suspicious farming loops inside Phnom Penh today. Automated safeguards verified.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB H: VISUAL REPORTS & METRICS */}
      {activeTab === 'reports' && (
        <div className="space-y-4 text-left">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            
            {/* STAT 1: Supply charts */}
            <div className="md:col-span-6 bg-slate-900/60 p-5 rounded-4xl border border-white/5">
              <span className="text-[10.5px] font-black text-slate-500 uppercase block tracking-wider font-mono mb-4">Donated Items by Compatible Brand</span>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartDataBrand}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" stroke="#888" fontSize={11} />
                    <YAxis stroke="#888" fontSize={11} width={25} />
                    <Tooltip contentStyle={{ background: "#0c0d12", border: "1px solid rgba(255,255,255,0.1)", fontSize: "11px" }} />
                    <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* STAT 2: Economy Ledger distribution */}
            <div className="md:col-span-6 bg-slate-900/60 p-5 rounded-4xl border border-white/5">
              <span className="text-[10.5px] font-black text-slate-500 uppercase block tracking-wider font-mono mb-4">Care Coins Economy Distribution</span>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartDataValue}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" stroke="#888" fontSize={11} />
                    <YAxis stroke="#888" fontSize={11} width={25} />
                    <Tooltip contentStyle={{ background: "#0c0d12", border: "1px solid rgba(255,255,255,0.1)", fontSize: "11px" }} />
                    <Legend wrapperStyle={{ fontSize: "10.5px" }} />
                    <Bar dataKey="earned" name="Simulated Earned Coins" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="spent" name="Spent & Redeemed Coins" fill="#a78bfa" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 bg-slate-900/20 p-5 rounded-3xl border border-white/5 text-left select-none">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-mono tracking-widest">Completed Donations</span>
              <span className="text-xl font-mono text-white font-black">{reportTotals.donatedCount} Items</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-mono tracking-widest">Active Listings</span>
              <span className="text-xl font-mono text-emerald-400 font-black">{reportTotals.activeCount} live</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-mono tracking-widest">Fraud/Abuse Rate</span>
              <span className="text-xl font-mono text-slate-400 font-black">0 %</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-mono tracking-widest font-bold">Dispute Log Rate</span>
              <span className="text-xl font-mono text-rose-400 font-black">{reportTotals.disputeRate.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      )}

      {/* 5. INDIVIDUAL INTERACTIVE POPUP / SIDEBAR WINDOW */}
      {selectedDonation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedDonation(null)}></div>
          <div className="glass rounded-4xl p-6 max-w-lg w-full relative z-10 space-y-4 text-left border border-white/10 shadow-2xl bg-slate-950">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="space-y-0.5">
                <span className="text-[9px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded font-bold uppercase tracking-widest inline-block font-mono">
                  Post: {selectedDonation.donationType.replace("_", " ")}
                </span>
                <h3 className="text-sm font-black text-white leading-snug">{selectedDonation.itemName}</h3>
              </div>
              <button 
                onClick={() => { setSelectedDonation(null); setVerifierNotes(""); }} 
                className="text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5 cursor-pointer" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 bg-slate-905 p-3 rounded-2xl text-[11px] text-slate-408 text-slate-300 font-mono">
              <div>
                <span className="text-slate-500 text-[8.5px] block font-bold uppercase">Condition</span>
                <span className="text-slate-250 font-black capitalize">{selectedDonation.condition}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[8.5px] block font-bold uppercase">Hand-over</span>
                <span className="text-slate-250 font-black capitalize">{selectedDonation.pickupOption}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[8.5px] block font-bold uppercase">Location</span>
                <span className="text-slate-250 font-black">{selectedDonation.location}</span>
              </div>
            </div>

            {/* ACTION TOGGLES BY TRANSACTION STATUS */}
            
            {/* Case 1: Active Coin Auction / Bidding ring */}
            {selectedDonation.donationType === "coin_bidding" && (selectedDonation.status === "Open for Coin Bidding" || selectedDonation.status === "Coins Locked") && (
              <div className="p-4 bg-slate-900/50 rounded-3xl border border-white/5 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-bold">Minimum/Current Winning Bid:</span>
                  <span className="text-amber-400 font-mono font-black">{selectedDonation.currentBidCoins || selectedDonation.minBidCoins} Care Coins</span>
                </div>

                {selectedDonation.currentBidderName && (
                  <p className="text-[10px] text-slate-400 font-mono">
                    Held in Escrow by current bidder: <span className="text-white font-bold">{selectedDonation.currentBidderName}</span>
                  </p>
                )}

                <div className="flex gap-2 items-center pt-1 select-none">
                  <div className="flex-1 bg-slate-950 px-3 py-2 rounded-xl border border-white/10 flex items-center justify-between">
                    <button 
                      onClick={() => setBidValue(p => Math.max((selectedDonation.currentBidCoins || selectedDonation.minBidCoins || 1) + 1, p - 1))}
                      className="text-slate-400 hover:text-white font-black px-2 cursor-pointer"
                    >
                      -
                    </button>
                    <span className="text-xs font-mono font-black text-amber-400">{bidValue} Care Coins</span>
                    <button 
                      onClick={() => setBidValue(p => p + 1)}
                      className="text-slate-400 hover:text-white font-black px-2 cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => handlePlaceBid(selectedDonation)}
                    className="py-2.5 px-4 bg-amber-500 text-slate-950 font-black text-xs rounded-xl cursor-pointer hover:bg-amber-600 transition"
                  >
                    Lock Care Bid
                  </button>
                </div>
              </div>
            )}

            {/* Case 2: Claiming normal items */}
            {selectedDonation.donationType !== "coin_bidding" && selectedDonation.status === "Approved" && (
              <div className="space-y-3 p-3.5 bg-slate-900/60 rounded-2xl text-xs">
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  No payment/bidding matches needed. To claim this free item or request it via exchange, click the option below.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const updated = donations.map(d => d.id === selectedDonation.id ? { ...d, status: "Waiting for Pickup" as const, currentBidderId: activeUser?.id || 1, currentBidderName: activeUser?.name || "Driver" } : d);
                      saveDonationsToStorage(updated);
                      setSelectedDonation(null);
                      alert("📬 Success! Request sent. Reach the donor at their verified number to coordinate hand-over.");
                    }}
                    className="flex-1 py-2.5 bg-emerald-500 text-slate-950 font-black text-xs rounded-xl cursor-pointer"
                  >
                    Dispatch Request Pin & Claim Item
                  </button>
                </div>
              </div>
            )}

            {/* Escrow Confirmation Box (For locked deals) */}
            {(selectedDonation.status === "Coins Locked" || selectedDonation.status === "Waiting for Pickup" || selectedDonation.status === "Disputed") && (
              <div className="bg-slate-900 border border-slate-700/40 p-4 rounded-3xl space-y-3">
                <span className="text-[10px] font-bold block uppercase text-amber-400">Escrow Transfer Completion Portal</span>
                
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 bg-slate-950 rounded-xl space-y-1">
                    <span className="text-[8.5px] text-slate-500 font-bold block uppercase">Receiver handover</span>
                    <button
                      onClick={() => handleConfirmCompletion(selectedDonation, "buyer")}
                      disabled={selectedDonation.completionPendingReceiver}
                      className={`w-full py-1.5 px-2 rounded-lg text-[10px] font-black cursor-pointer ${
                        selectedDonation.completionPendingReceiver ? "bg-emerald-500/10 text-emerald-400" : "bg-white/10 text-slate-200"
                      }`}
                    >
                      {selectedDonation.completionPendingReceiver ? "✓ Confirmed Handed Over" : "Click to confirm receipt"}
                    </button>
                  </div>

                  <div className="p-2.5 bg-slate-950 rounded-xl space-y-1">
                    <span className="text-[8.5px] text-slate-500 font-bold block uppercase">Donor handover</span>
                    <button
                      onClick={() => handleConfirmCompletion(selectedDonation, "donor")}
                      disabled={selectedDonation.completionPendingDonor}
                      className={`w-full py-1.5 px-2 rounded-lg text-[10px] font-black cursor-pointer ${
                        selectedDonation.completionPendingDonor ? "bg-emerald-500/10 text-emerald-400" : "bg-white/10 text-slate-200"
                      }`}
                    >
                      {selectedDonation.completionPendingDonor ? "✓ Confirmed Shipped" : "Click to confirm completion"}
                    </button>
                  </div>
                </div>

                {/* Dispute complaining line */}
                {selectedDonation.status !== "Disputed" ? (
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <span className="text-[9.5px] font-bold text-rose-400 tracking-wider inline-block">Something went wrong?</span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={disputeText}
                        onChange={(e) => setDisputeText(e.target.value)}
                        placeholder="State wrong item, physical failure notes..."
                        className="flex-1 bg-slate-950 border border-white/10 p-2 text-[11px] text-white rounded-lg focus:outline-none"
                      />
                      <button
                        onClick={() => handleRaiseDispute(selectedDonation)}
                        className="py-1 px-3 bg-rose-500/20 text-rose-300 font-bold text-[11px] rounded-lg cursor-pointer"
                      >
                        File Dispute
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 bg-rose-950/20 border border-rose-500/20 rounded-xl text-[10.5px] text-rose-300 leading-snug">
                    ⚖️ Escrow has locked all coins until administrative staff evaluates dispute notes. No automatic withdrawals allowed.
                  </div>
                )}
              </div>
            )}

            {/* Owner manual close bidding action */}
            {selectedDonation.donorId === activeUser?.id && selectedDonation.donationType === "coin_bidding" && selectedDonation.status === "Coins Locked" && (
              <button
                type="button"
                onClick={() => handleDonorCloseAuction(selectedDonation)}
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs rounded-xl cursor-pointer text-center flex items-center justify-center gap-1 shadow-lg hover:from-amber-600 hover:to-amber-700"
              >
                <Award className="w-4 h-4 animate-bounce" />
                <span>🏆 Accept Highest Bid ({selectedDonation.currentBidCoins} Coins) & Close Auction</span>
              </button>
            )}

            {/* Emergency close / cancel button for owner */}
            {selectedDonation.donorId === activeUser?.id && (
              <div className="pt-2 border-t border-white/5 flex gap-2">
                <button
                  type="button"
                  onClick={() => handleCancelDonation(selectedDonation)}
                  className="flex-1 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-300 font-bold text-xs rounded-xl cursor-pointer text-center"
                >
                  Cancel Listing & Recall Escrow
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* 6. SHARE POST DIALOG modal window */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCreateModal(false)}></div>
          <div className="glass rounded-4xl p-6 max-w-lg w-full relative z-10 space-y-4 max-h-[90vh] overflow-y-auto text-left bg-slate-950">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-1.5">
                <Gift className="w-4.5 h-4.5 text-emerald-400" />
                <h3 className="text-base font-bold text-slate-100">Donate Spare Part / Item</h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-200 cursor-pointer">
                <X className="w-5 h-5 cursor-pointer" />
              </button>
            </div>

            <div className="bg-slate-900 p-3.5 rounded-2xl border border-white/15 space-y-2 text-xs">
              <span className="text-slate-400 font-bold block mb-1">💡 Quick Demo Presets:</span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setNewItemName("Toyota Prius Hybrid Battery Cell (Gen 3)");
                    setNewBrand("Toyota");
                    setNewModel("Prius");
                    setNewYear(2012);
                    setNewEngineType("hybrid");
                    setNewCondition("refurbished");
                    setNewCategory("battery");
                    setNewPhoto("https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=400");
                    setNewDonationType("coin_bidding");
                    setNewMinBid(15);
                  }}
                  className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white text-[10px] font-mono rounded border border-white/5 cursor-pointer"
                >
                  🔋 Prius Battery (Auction)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setNewItemName("BYD Atto 3 Original Cargo Net Hook");
                    setNewBrand("BYD");
                    setNewModel("Atto 3");
                    setNewYear(2023);
                    setNewEngineType("EV");
                    setNewCondition("new");
                    setNewCategory("accessory");
                    setNewPhoto("https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=400");
                    setNewDonationType("coin_reward");
                    setNewWantsCoins(true);
                  }}
                  className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white text-[10px] font-mono rounded border border-white/5 cursor-pointer"
                >
                  🔌 BYD Accessory (Reward)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setNewItemName("Ford Ranger Mudguards (x4 Set)");
                    setNewBrand("Ford");
                    setNewModel("Ranger");
                    setNewYear(2021);
                    setNewEngineType("diesel");
                    setNewCondition("used");
                    setNewCategory("body part");
                    setNewPhoto("https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=400");
                    setNewDonationType("free");
                    setNewWantsCoins(false);
                  }}
                  className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white text-[10px] font-mono rounded border border-white/5 cursor-pointer"
                >
                  🚙 Ranger Parts (Gift)
                </button>
              </div>
            </div>

            <form onSubmit={handleCreatePostSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 block uppercase">Item Title</label>
                  <input
                    type="text"
                    required
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="e.g. Original Toyota Prius Wiper Motor"
                    className="w-full bg-slate-900 border border-white/10 p-2.5 text-xs text-white rounded-xl focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 block uppercase">Target Brand</label>
                  <input
                    type="text"
                    required
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    placeholder="e.g. Toyota, BYD, Ford..."
                    className="w-full bg-slate-900 border border-white/10 p-2.5 text-xs text-white rounded-xl focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 block uppercase">Target Model</label>
                  <input
                    type="text"
                    value={newModel}
                    onChange={(e) => setNewModel(e.target.value)}
                    placeholder="e.g. Prius, Atto 3, Territory..."
                    className="w-full bg-slate-900 border border-white/10 p-2.5 text-xs text-white rounded-xl focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 block uppercase font-mono">Compatible Year</label>
                  <input
                    type="number"
                    value={newYear}
                    onChange={(e) => setNewYear(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-white/10 p-2.5 text-xs text-white rounded-xl focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 block uppercase font-sans">Engine Powertrain type</label>
                  <select
                    value={newEngineType}
                    onChange={(e) => setNewEngineType(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 p-2.5 text-xs text-white rounded-xl focus:outline-none"
                  >
                    <option value="petrol">Petrol / gasoline</option>
                    <option value="diesel">Diesel</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="EV">EV / Electric</option>
                    <option value="CNG">CNG / LPG</option>
                    <option value="motorcycle">Motorcycle</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 block uppercase">Classification Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-slate-900 border border-white/10 p-2.5 text-xs text-white rounded-xl focus:outline-none"
                  >
                    <option value="accessory">Accessories & Gadgets</option>
                    <option value="engine">Engine Spare parts</option>
                    <option value="tire">Tires & Wheels Group</option>
                    <option value="battery">High Volts Hybrid Battery</option>
                    <option value="body part">Body Panels & Bumpers</option>
                    <option value="EV part">EV Adapters & Cord kits</option>
                    <option value="tool">Physical Wrenches & Scanners</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 block uppercase font-sans">Condition of Item</label>
                  <select
                    value={newCondition}
                    onChange={(e) => setNewCondition(e.target.value as any)}
                    className="w-full bg-slate-900 border border-white/10 p-2.5 text-xs text-white rounded-xl focus:outline-none"
                  >
                    <option value="new">Brand New / In Box</option>
                    <option value="used">Used / Good Condition</option>
                    <option value="refurbished">Refurbished / Serviced</option>
                    <option value="damaged but usable">Damaged but usable</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 block uppercase">Hand-over options</label>
                  <select
                    value={newPickup}
                    onChange={(e) => setNewPickup(e.target.value as any)}
                    className="w-full bg-slate-900 border border-white/10 p-2.5 text-xs text-white rounded-xl focus:outline-none"
                  >
                    <option value="pickup">Self pickup only</option>
                    <option value="delivery">Will ship to recipient</option>
                    <option value="either">Either</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 block uppercase font-mono">Location Province</label>
                  <select
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 p-2.5 text-xs text-white rounded-xl focus:outline-none"
                  >
                    <option value="Phnom Penh">Phnom Penh</option>
                    <option value="Siem Reap">Siem Reap</option>
                    <option value="Battambang">Battambang</option>
                    <option value="Sihanoukville">Sihanoukville</option>
                    <option value="Kampot">Kampot</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 block uppercase">Post Activity Type</label>
                  <select
                    value={newDonationType}
                    onChange={(e) => setNewDonationType(e.target.value as any)}
                    className="w-full bg-slate-900 border border-white/10 p-2.5 text-xs text-white rounded-xl focus:outline-none"
                  >
                    <option value="coin_reward">Reward coin exchange</option>
                    <option value="coin_bidding">Escrow Coin Bidding Auction</option>
                    <option value="free">Pure Free Donations (Badges rewarded)</option>
                    <option value="exchange">Parts Swap</option>
                  </select>
                </div>

              </div>

              {/* Auction parameters */}
              {newDonationType === "coin_bidding" && (
                <div className="p-3 bg-slate-900 rounded-2xl border border-amber-500/20 space-y-3">
                  <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider font-mono">Bidding rules configure</span>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold block uppercase">Minimum required coins</label>
                      <input
                        type="number"
                        value={newMinBid}
                        onChange={(e) => setNewMinBid(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-white/10 p-2 text-xs text-white rounded"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold block uppercase">Bidding time (Days)</label>
                      <select
                        value={newAuctionDuration}
                        onChange={(e) => setNewAuctionDuration(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-white/10 p-1.5 text-xs text-white rounded"
                      >
                        <option value={3}>3 Days Auction</option>
                        <option value={5}>5 Days Auction</option>
                        <option value={7}>7 Days Auction</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Interactive choice matching point 5 of prompt: Do you want to receive Care Coins? */}
              <div className="bg-slate-900 border border-slate-700/50 p-4 rounded-3xl space-y-2">
                <span className="text-[11px] font-extrabold text-white block uppercase tracking-wide">
                  Coin Reward Settings
                </span>
                <p className="text-[10px] text-slate-400">
                  Do you want to receive internal system Care Coins as a contribution points reward for this donation?
                </p>

                <div className="grid grid-cols-2 gap-3.5 pt-1 select-none">
                  <button
                    type="button"
                    onClick={() => { setNewWantsCoins(true); if (newDonationType === "free") setNewDonationType("coin_reward"); }}
                    className={`p-3 rounded-2xl text-xs font-black border transition text-center block w-full ${
                      newWantsCoins ? "bg-emerald-500/10 border-emerald-500 text-emerald-300" : "bg-slate-950 border-white/10 text-slate-400"
                    }`}
                  >
                    Yes, I want Care Coins
                  </button>

                  <button
                    type="button"
                    onClick={() => { setNewWantsCoins(false); setNewDonationType("free"); }}
                    className={`p-3 rounded-2xl text-xs font-black border transition text-center block w-full ${
                      !newWantsCoins ? "bg-amber-500/10 border-amber-500 text-amber-300" : "bg-slate-950 border-white/10 text-slate-400"
                    }`}
                  >
                    No, I want to donate for free
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 block uppercase font-mono">Reference photo link</label>
                <input
                  type="text"
                  value={newPhoto}
                  onChange={(e) => setNewPhoto(e.target.value)}
                  placeholder="Insert unsplash/image absolute url support"
                  className="w-full bg-slate-900 border border-white/10 p-2.5 text-xs text-white rounded-xl focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-500 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer transition shadow hover:bg-emerald-600"
              >
                <Plus className="w-4.5 h-4.5" />
                <span>Submit Contribution Listing</span>
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
