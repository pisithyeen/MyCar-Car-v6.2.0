/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  MapPin, 
  Search, 
  Plus, 
  ShieldCheck, 
  Compass, 
  Map as MapIcon, 
  Phone, 
  Star, 
  ExternalLink, 
  Zap, 
  Fuel, 
  Wrench, 
  Tag, 
  Droplets, 
  UserCheck, 
  AlertTriangle, 
  Coins, 
  ShieldAlert, 
  Check, 
  X, 
  Camera, 
  Send, 
  MessageSquare, 
  History, 
  Heart, 
  Share2, 
  ChevronRight, 
  Navigation, 
  Sliders, 
  Battery, 
  Clock,
  Disc
} from "lucide-react";
import { VehicleProfile, MaintenanceRecord } from "../types";

// Extends types for MyCarCareMap
export interface MapLocationPin {
  id: string;
  name: string;
  category: 'Petrol Station' | 'EV Charging' | 'Garage' | 'Spare Parts Shop' | 'Tire Shop' | 'Battery Shop' | 'Car Wash' | 'Freelancer Mechanic' | 'Emergency Service';
  province: 'Phnom Penh' | 'Siem Reap' | 'Battambang' | 'Sihanoukville' | 'Kampot';
  rating: number;
  reviewsCount: number;
  reviews: { author: string; text: string; rating: number; date: string }[];
  address: string;
  phone: string;
  telegram?: string;
  lat: number;
  lng: number;
  services: string[];
  imageUrl: string;
  description: string;
  isPartner: boolean;
  status: 'Community Added' | 'Community Confirmed' | 'Owner Claimed' | 'Admin Verified' | 'Premium Partner' | 'Suspended';
  trustScore: number; // calculated 0 - 100
  claimedByGroupId?: number; // mapped owner id
  supportedBrands: string[];
  supportsEngineTypes: ('Petrol' | 'Diesel' | 'Hybrid' | 'EV')[];
  openingHours: string;
  completesCount: number;
  complaintsCount: number;
}

interface MyCarCareMapProps {
  vehicles: VehicleProfile[];
  records: MaintenanceRecord[];
  activeUser: any;
  onRefreshData?: () => void;
  onLogRecordExternal?: (logData: any) => Promise<boolean>;
  onNavigateTab?: (tab: string) => void;
}

export default function MyCarCareMap({
  vehicles = [],
  records = [],
  activeUser,
  onRefreshData,
  onLogRecordExternal,
  onNavigateTab
}: MyCarCareMapProps) {
  // --- LOCAL PERSISTED DATABASES ---
  const [pins, setPins] = useState<MapLocationPin[]>([]);
  const [userCoins, setUserCoins] = useState<number>(30);
  const [coinHistory, setCoinHistory] = useState<{ action: string; change: number; date: string }[]>([
    { action: "Account activation bonus", change: 10, date: "2026-06-01" },
    { action: "Community verified Prius check", change: 20, date: "2026-06-02" }
  ]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [reportModalPin, setReportModalPin] = useState<MapLocationPin | null>(null);
  
  // Navigation tabs of map module
  const [activeSubTab, setActiveSubTab] = useState<'map' | 'mechanics' | 'rewards' | 'owner_dashboard' | 'admin_queue'>('map');
  const [activeProvince, setActiveProvince] = useState<'Phnom Penh' | 'Siem Reap' | 'Battambang' | 'Sihanoukville' | 'Kampot'>('Phnom Penh');
  
  // Search and filter parameters
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [engineTypeFilter, setEngineTypeFilter] = useState("All");
  const [brandFilter, setBrandFilter] = useState("All");
  const [filterNearMe, setFilterNearMe] = useState(false);
  const [filterOpenNow, setFilterOpenNow] = useState(false);
  const [filterVerifiedOnly, setFilterVerifiedOnly] = useState(false);
  const [filterHighestRated, setFilterHighestRated] = useState(false);
  
  // Selected location details panel
  const [selectedPin, setSelectedPin] = useState<MapLocationPin | null>(null);
  
  // Modals state
  const [showAddPinModal, setShowAddPinModal] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState<MapLocationPin | null>(null);
  const [showRecommendModal, setShowRecommendModal] = useState(false);
  const [showQrScanSimulator, setShowQrScanSimulator] = useState(false);
  const [selectedScannerVehicle, setSelectedScannerVehicle] = useState<VehicleProfile | null>(null);
  const [proposedTicket, setProposedTicket] = useState<any>(null);
  
  // Pending approvals list for Admin
  const [claimRequests, setClaimRequests] = useState<any[]>([]);
  const [contributionRequests, setContributionRequests] = useState<any[]>([]);

  // Form states: New Pin Submission
  const [newPinName, setNewPinName] = useState("");
  const [newPinCategory, setNewPinCategory] = useState<MapLocationPin['category']>("Garage");
  const [newPinPhone, setNewPinPhone] = useState("");
  const [newPinUrl, setNewPinUrl] = useState("");
  const [newPinDesc, setNewPinDesc] = useState("");
  const [newPinServices, setNewPinServices] = useState("");
  const [newPinHours, setNewPinHours] = useState("8:00 AM - 6:00 PM");
  const [newPinBrands, setNewPinBrands] = useState("Toyota, Lexus, Honda, Ford, BYD");
  const [newPinLocX, setNewPinLocX] = useState(50); // SVG coordinates 0-100
  const [newPinLocY, setNewPinLocY] = useState(50);
  
  // Form states: Recommend Freelancer Mechanic
  const [recMechName, setRecMechName] = useState("");
  const [recMechPhone, setRecMechPhone] = useState("");
  const [recMechTelegram, setRecMechTelegram] = useState("");
  const [recMechSkills, setRecMechSkills] = useState("");
  const [recMechBrands, setRecMechBrands] = useState("Toyota, Prius, EV");
  const [recMechHourlyPrice, setRecMechHourlyPrice] = useState("10");
  const [recMechArea, setRecMechArea] = useState("Sense Sok, Phnom Penh");
  const [recMechNote, setRecMechNote] = useState("");
  const [recMechHours, setRecMechHours] = useState("7:00 AM - 10:00 PM");

  // Form states: Owner claim verification data
  const [claimTelegram, setClaimTelegram] = useState("");
  const [claimPhone, setClaimPhone] = useState("");
  const [claimProofPhoto, setClaimProofPhoto] = useState("");
  const [claimLicense, setClaimLicense] = useState("");

  // Review submission state
  const [newRating, setNewRating] = useState(5);
  const [newCommentText, setNewCommentText] = useState("");
  
  // Reporting form state
  const [reportReason, setReportReason] = useState("");

  // Core Seed Initializer
  useEffect(() => {
    const cachedPins = localStorage.getItem("mycar_map_pins");
    if (cachedPins) {
      setPins(JSON.parse(cachedPins));
    } else {
      const initialPins: MapLocationPin[] = [
        {
          id: "pin-g1",
          name: "Sokha Auto Garage & Paint Center",
          category: "Garage",
          province: "Phnom Penh",
          rating: 4.8,
          reviewsCount: 142,
          reviews: [
            { author: "Rithy Seng", text: "Fixed my Prius engine misfire extremely quickly. Highly recommended!", rating: 5, date: "2026-05-20" },
            { author: "Sophea Mok", text: "Great suspension alignment work and neat pricing.", rating: 4, date: "2026-05-25" }
          ],
          address: "#12, St 271, Sangkat Teuk Thla, Phnom Penh",
          phone: "+855 12 777 888",
          telegram: "@sokha_auto",
          lat: 52, // Mock relative positions inside SVG Coordinate plane
          lng: 48,
          services: ["Engine Tuning", "Brake Pad Change", "Computer Diagnostic Scan", "Suspension Rebuild", "Oil Flush"],
          imageUrl: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=400",
          description: "Top certified multi-brand garage focusing on engine overhaul, transmission maintenance, and body paint coatings.",
          isPartner: true,
          status: "Admin Verified",
          trustScore: 92,
          supportedBrands: ["Toyota", "Lexus", "Honda", "Hyundai", "BYD"],
          supportsEngineTypes: ["Petrol", "Diesel", "Hybrid"],
          openingHours: "7:30 AM - 6:30 PM",
          completesCount: 412,
          complaintsCount: 1
        },
        {
          id: "pin-ev1",
          name: "BYD Super DC Fast Charger Hub",
          category: "EV Charging",
          province: "Phnom Penh",
          rating: 4.9,
          reviewsCount: 38,
          reviews: [
            { author: "Chan Prasidh", text: "150kW ultra-fast loader works flawlessly. Topped-up my BYD Atto 3 in 25 mins.", rating: 5, date: "2026-05-18" }
          ],
          address: "AEON Mall 3 Ground Level Parking Area, Phnom Penh",
          phone: "+855 23 444 555",
          lat: 62,
          lng: 68,
          services: ["150kW DC Fast Charge", "7kW AC Slow Charge", "Battery Prehousing check", "Tesla Adapter Provided"],
          imageUrl: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=400",
          description: "Cambodia's public ultra chargers. Connect via QR checkin and pay instantly with ABA Pay.",
          isPartner: true,
          status: "Premium Partner",
          trustScore: 98,
          supportedBrands: ["BYD", "Tesla", "BMW", "Porsche", "Toyota"],
          supportsEngineTypes: ["EV"],
          openingHours: "24 Hours Open",
          completesCount: 1105,
          complaintsCount: 0
        },
        {
          id: "pin-p4",
          name: "TotalEnergies - Smart Express & Fuel",
          category: "Petrol Station",
          province: "Phnom Penh",
          rating: 4.5,
          reviewsCount: 89,
          reviews: [],
          address: "Preah Norodom Boulevard Corner Street 302, Phnom Penh",
          phone: "+855 23 111 222",
          lat: 44,
          lng: 58,
          services: ["Excellent Petrol 95", "Quick Lube Service", "Bonjour Convenience Store", "Tire pressure gauge"],
          imageUrl: "https://images.unsplash.com/photo-1527018601619-a508a2be00cd?auto=format&fit=crop&q=80&w=400",
          description: "Premium petrol station offering CleanShield 95 fuels, clean restrooms, coffee bar, and express grease changes.",
          isPartner: true,
          status: "Admin Verified",
          trustScore: 89,
          supportedBrands: ["Toyota", "Lexus", "Ford", "Mazda"],
          supportsEngineTypes: ["Petrol", "Diesel"],
          openingHours: "24 Hours Open",
          completesCount: 5210,
          complaintsCount: 2
        },
        {
          id: "pin-unclaimed1",
          name: "Angkor Tyres & Battery Shop",
          category: "Tire Shop",
          province: "Siem Reap",
          rating: 4.2,
          reviewsCount: 15,
          reviews: [
            { author: "John Doe", text: "Simple shop on St 6, but did a quick puncture fix for just $3.", rating: 4, date: "2026-04-10" }
          ],
          address: "National Road 6, Near Angkor High School, Siem Reap",
          phone: "+855 92 111 333",
          lat: 38,
          lng: 42,
          services: ["Tire balancing", "Nitrogen tire top-up", "Battery jumpstart support", "New tire replacement"],
          imageUrl: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=400",
          description: "A local tire alignment and battery shop reported by community drivers. Owners have not claimed this business pin yet.",
          isPartner: false,
          status: "Community Added",
          trustScore: 45,
          supportedBrands: ["Toyota", "Lexus", "Honda", "Lada"],
          supportsEngineTypes: ["Petrol", "Diesel", "Hybrid"],
          openingHours: "7:00 AM - 7:00 PM",
          completesCount: 0,
          complaintsCount: 0
        },
        {
          id: "pin-unclaimed2",
          name: "Angkor Speed Parts Hub",
          category: "Spare Parts Shop",
          province: "Siem Reap",
          rating: 4.6,
          reviewsCount: 8,
          reviews: [],
          address: "Street 60, Siem Reap Town",
          phone: "+855 88 555 125",
          lat: 52,
          lng: 60,
          services: ["Lexus RX Parts", "Prius cooling fan parts", "OEM filters", "Genuine brake disc pads"],
          imageUrl: "https://images.unsplash.com/photo-1507136566006-cfc505b114fc?auto=format&fit=crop&q=80&w=400",
          description: "Sells Prius second-hand and brand new Japanese spare parts. Community added pin.",
          isPartner: false,
          status: "Community Added",
          trustScore: 50,
          supportedBrands: ["Toyota", "Lexus"],
          supportsEngineTypes: ["Petrol", "Hybrid"],
          openingHours: "8:00 AM - 5:00 PM",
          completesCount: 0,
          complaintsCount: 0
        },
        {
          id: "pin-wash1",
          name: "Siem Reap Premium Car Wash & Detailing",
          category: "Car Wash",
          province: "Siem Reap",
          rating: 4.7,
          reviewsCount: 22,
          reviews: [],
          address: "Sivatha Road, Next to Smart Store, Siem Reap",
          phone: "+855 15 888 999",
          lat: 48,
          lng: 35,
          services: ["Foam washing", "Underbody clay wash", "Upholstery treatment", "Waxing"],
          imageUrl: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&q=80&w=400",
          description: "Delightful wash and ceramic coating center with comfortable, air-conditioned waiting café lounge.",
          isPartner: false,
          status: "Community Confirmed",
          trustScore: 78,
          supportedBrands: ["Toyota", "BYD", "Tesla", "Ford", "Porsche"],
          supportsEngineTypes: ["Petrol", "Diesel", "Hybrid", "EV"],
          openingHours: "8:00 AM - 8:00 PM",
          completesCount: 50,
          complaintsCount: 0
        },
        {
          id: "pin-freelance1",
          name: "Bro Visal: Reliable Freelance Roadside Helper",
          category: "Freelancer Mechanic",
          province: "Battambang",
          rating: 4.9,
          reviewsCount: 71,
          reviews: [
            { author: "Kosal Chhim", text: "Visal came with his auto-bicycle in 12 minutes to recharge my hybrid battery. Top savior!", rating: 5, date: "2026-03-12" }
          ],
          address: "Battambang City limits and National Road 5 (20km radius mobile support)",
          phone: "+855 12 333 444",
          telegram: "@mechanic_visal",
          lat: 52,
          lng: 52,
          services: ["Roadside Tire Change", "LPG Basic leak test", "12V Battery jumpstart", "Quick Fuse replacement", "Mobile Diagnostics"],
          imageUrl: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=400",
          description: "A highly preeminent specialized freelance tech. Highly recommended by Battambang highway drivers.",
          isPartner: false,
          status: "Admin Verified",
          trustScore: 96,
          supportedBrands: ["Toyota", "Lexus", "Honda", "Ford", "Hyundai"],
          supportsEngineTypes: ["Petrol", "Diesel", "Hybrid"],
          openingHours: "7:00 AM - 11:00 PM",
          completesCount: 182,
          complaintsCount: 0
        }
      ];
      setPins(initialPins);
      localStorage.setItem("mycar_map_pins", JSON.stringify(initialPins));
    }

    // Load claim verification logs
    const savedClaims = localStorage.getItem("mycar_claim_requests");
    if (savedClaims) {
      setClaimRequests(JSON.parse(savedClaims));
    } else {
      setClaimRequests([
        {
          id: "claim-1",
          pinId: "pin-unclaimed1",
          pinName: "Angkor Tyres & Battery Shop",
          ownerName: "Sum Bora",
          ownerPhone: "+855 92 111 333",
          ownerTelegram: "@bora_angkor_tyre",
          proofPhoto: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=400",
          businessLicense: "MOC-LIC-2025-SRT",
          status: "Pending"
        }
      ]);
    }

    // Cache Coin State
    const savedCoins = localStorage.getItem("mycar_user_coins");
    if (savedCoins) setUserCoins(Number(savedCoins));
    const savedCoinHistory = localStorage.getItem("mycar_user_coin_history");
    if (savedCoinHistory) setCoinHistory(JSON.parse(savedCoinHistory));
    
    // Cache Favorite states
    const savedFavs = localStorage.getItem("mycar_favorite_pins");
    if (savedFavs) setFavorites(JSON.parse(savedFavs));
  }, []);

  const savePinsToStorage = (updatedList: MapLocationPin[]) => {
    setPins(updatedList);
    localStorage.setItem("mycar_map_pins", JSON.stringify(updatedList));
  };

  // Helper calculation for trust scores based on rating, complaints etc.
  const calculateTrustScore = (pin: MapLocationPin) => {
    let score = 50; // base score
    if (pin.status === "Admin Verified") score += 30;
    if (pin.status === "Premium Partner") score += 40;
    if (pin.status === "Community Confirmed") score += 15;
    if (pin.status === "Suspended") return 0;
    
    score += pin.rating * 5;
    score -= pin.complaintsCount * 12;
    score += Math.min(pin.completesCount * 0.1, 10);
    return Math.max(0, Math.min(100, Math.round(score)));
  };

  // Add real coin to account with confirmation logging
  const handleAwardCoins = (amount: number, reason: string) => {
    setUserCoins(prev => {
      const next = prev + amount;
      localStorage.setItem("mycar_user_coins", String(next));
      return next;
    });
    setCoinHistory(prev => {
      const updated = [{ action: reason, change: amount, date: new Date().toISOString().split('T')[0] }, ...prev];
      localStorage.setItem("mycar_user_coin_history", JSON.stringify(updated));
      return updated;
    });
  };

  // Favoriting engine
  const toggleFavorite = (id: string) => {
    let updated: string[] = [];
    if (favorites.includes(id)) {
      updated = favorites.filter(fav => fav !== id);
    } else {
      updated = [...favorites, id];
    }
    setFavorites(updated);
    localStorage.setItem("mycar_favorite_pins", JSON.stringify(updated));
  };

  // Report Wrong Information Flow
  const handleReportPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportModalPin || !reportReason.trim()) return;

    const updated = pins.map(p => {
      if (p.id === reportModalPin.id) {
        return {
          ...p,
          complaintsCount: p.complaintsCount + 1,
          trustScore: Math.max(0, p.trustScore - 15)
        };
      }
      return p;
    });
    
    savePinsToStorage(updated);
    alert(`Report submitted for ${reportModalPin.name}. Admin staff will audit this pin location within 24 hours. Coin reward +2 applied for helping keep data clean!`);
    handleAwardCoins(2, `Reporting incorrect information for ${reportModalPin.name}`);
    setReportModalPin(null);
    setReportReason("");
  };

  // Leaflet / Google Maps Coordinate Mapper Simulation
  // Max ranges adjusted to Cambodian provinces
  const provinceCoords: Record<string, { minLat: number; maxLat: number; minLng: number; maxLng: number }> = {
    "Phnom Penh": { minLat: 11.5000, maxLat: 11.6000, minLng: 104.8500, maxLng: 104.9500 },
    "Siem Reap": { minLat: 13.3300, maxLat: 13.4300, minLng: 103.8000, maxLng: 103.9000 },
    "Battambang": { minLat: 13.0500, maxLat: 13.1500, minLng: 103.1500, maxLng: 103.2500 },
    "Sihanoukville": { minLat: 10.6000, maxLat: 10.7050, minLng: 103.4800, maxLng: 103.5800 },
    "Kampot": { minLat: 10.5500, maxLat: 10.6500, minLng: 104.1500, maxLng: 104.2500 }
  };

  const currentCoords = provinceCoords[activeProvince];

  const getPercentageCoords = (lat: number, lng: number) => {
    // Falls back gracefully if coordinates are relative percentages directly
    if (lat >= 0 && lat <= 100) return { x: `${lat}%`, y: `${lng}%` };
    const bounds = currentCoords;
    const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100;
    const y = (1.0 - ((lat - bounds.minLat) / (bounds.maxLat - bounds.minLat))) * 100;
    return { x: `${Math.max(2, Math.min(98, x))}%`, y: `${Math.max(2, Math.min(98, y))}%` };
  };

  // Dynamic filter lists matching requirements
  const filteredPinsList = pins.filter(p => {
    const provinceMatches = p.province === activeProvince;
    if (!provinceMatches) return false;

    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.services.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = categoryFilter === "All" || p.category === categoryFilter;
    
    const matchesEngine = engineTypeFilter === "All" || p.supportsEngineTypes.includes(engineTypeFilter as any);
    
    // Find active user brand check
    let matchesBrand = true;
    if (brandFilter !== "All") {
      matchesBrand = p.supportedBrands.some(b => b.toLowerCase() === brandFilter.toLowerCase());
    }

    const matchesVerifiedOnly = !filterVerifiedOnly || 
      ["Admin Verified", "Premium Partner", "Owner Claimed"].includes(p.status);

    const matchesHighestRated = !filterHighestRated || p.rating >= 4.7;

    return matchesSearch && matchesCategory && matchesEngine && matchesBrand && matchesVerifiedOnly && matchesHighestRated;
  });

  // User Action 1: Add a brand new unclaimed pin location (Community contribution)
  const handleAddNewPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPinName.trim() || !newPinPhone.trim()) return;

    // Award logic mapping based on category
    let coinVal = 3;
    if (newPinCategory === "Petrol Station") {
      coinVal = 3;
    } else if (newPinCategory === "EV Charging") {
      coinVal = 5;
    } else if (newPinCategory === "Garage") {
      coinVal = 5;
    } else if (newPinCategory === "Spare Parts Shop") {
      coinVal = 5;
    }

    const brandArray = newPinBrands.split(",").map(b => b.trim());
    const serviceArray = newPinServices.split(",").map(s => s.trim());

    const newPin: MapLocationPin = {
      id: `pin-user-${Date.now()}`,
      name: newPinName,
      category: newPinCategory,
      province: activeProvince,
      rating: 4.0, // Base default rating for new user submissions
      reviewsCount: 1,
      reviews: [{ author: activeUser?.name || "Driver", text: "Location submitted on community board.", rating: 4, date: new Date().toISOString().split('T')[0] }],
      address: `Road side pin, ${activeProvince}, Cambodia`,
      phone: newPinPhone,
      lat: newPinLocX || 45 + Math.random() * 10,
      lng: newPinLocY || 45 + Math.random() * 10,
      services: serviceArray.length > 0 && serviceArray[0] !== "" ? serviceArray : ["General Services", "Tire Topup", "Consultation"],
      imageUrl: newPinUrl.trim() || "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=400",
      description: newPinDesc.trim() || "Quick newly added diagnostic help stop. Unclaimed.",
      isPartner: false,
      status: "Community Added",
      trustScore: 35,
      supportedBrands: brandArray.length > 0 && brandArray[0] !== "" ? brandArray : ["Toyota", "Prius", "Lexus"],
      supportsEngineTypes: newPinCategory === "EV Charging" ? ["EV"] : ["Petrol", "Diesel", "Hybrid"],
      openingHours: newPinHours,
      completesCount: 0,
      complaintsCount: 0
    };

    // Contribution queue persistent push
    const contributionObj = {
      id: `contribution-${Date.now()}`,
      newPin,
      coinReward: coinVal,
      submitterName: activeUser?.name || "Community Pilot",
      date: new Date().toISOString().split('T')[0]
    };

    const updatedConts = [contributionObj, ...contributionRequests];
    setContributionRequests(updatedConts);
    localStorage.setItem("mycar_contributions", JSON.stringify(updatedConts));

    setShowAddPinModal(false);
    
    // Quick notification alerts
    alert(`💡 Submission Successful! Your location pin has been submitted to the Super Admin review queue. You will receive +${coinVal} Reward Coins instantly on admin verification!`);

    // Reset Form entries
    setNewPinName("");
    setNewPinPhone("");
    setNewPinUrl("");
    setNewPinDesc("");
    setNewPinServices("");
  };

  // User Action 2: Write a review to existing location
  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPin || !newCommentText.trim()) return;

    const newRevObj = {
      author: activeUser?.name || "Verified Customer",
      text: newCommentText,
      rating: newRating,
      date: new Date().toISOString().split('T')[0]
    };

    const updatedPins = pins.map(p => {
      if (p.id === selectedPin.id) {
        const nextReviews = [newRevObj, ...p.reviews];
        const nextRating = parseFloat(((p.rating * p.reviewsCount + newRating) / (p.reviewsCount + 1)).toFixed(1));
        return {
          ...p,
          reviewsCount: p.reviewsCount + 1,
          reviews: nextReviews,
          rating: nextRating,
          trustScore: Math.min(100, p.trustScore + 3)
        };
      }
      return p;
    });

    savePinsToStorage(updatedPins);
    const updatedActive = updatedPins.find(p => p.id === selectedPin.id);
    if (updatedActive) setSelectedPin(updatedActive);

    // Reset review input & reward coins
    setNewCommentText("");
    alert(`Success! Review written. You have achieved +2 Coins for a genuine Cambodian Service review!`);
    handleAwardCoins(2, `Wrote a review for ${selectedPin.name}`);
  };

  // User Action 3: Recommend Freelance Mechanic
  const handleRecommendMechanic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recMechName.trim() || !recMechPhone.trim()) return;

    // Build the freelancer pin layout
    const cleanBrands = recMechBrands.split(",").map(b => b.trim());
    const cleanSkills = recMechSkills.split(",").map(s => s.trim());

    const helperPin: MapLocationPin = {
      id: `pin-mech-${Date.now()}`,
      name: `Mechanic ${recMechName} (Independent Tech)`,
      category: "Freelancer Mechanic",
      province: activeProvince,
      rating: 4.8,
      reviewsCount: 1,
      reviews: [{ author: activeUser?.name || "Driver", text: recMechNote || "Excellent support highly recommended.", rating: 5, date: new Date().toISOString().split('T')[0] }],
      address: `Sangkat area: ${recMechArea}, Cambodia`,
      phone: recMechPhone,
      telegram: recMechTelegram.trim() || undefined,
      lat: 40 + Math.random() * 20,
      lng: 40 + Math.random() * 20,
      services: cleanSkills.length > 0 && cleanSkills[0] !== "" ? cleanSkills : ["Hybrid battery cells swap", "Oil leakage repair"],
      imageUrl: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=400",
      description: `Freelancer Bio: ${recMechNote || 'High level mechanical training with 5+ years experience on key Cambodian makes.'}`,
      isPartner: false,
      status: "Community Confirmed",
      trustScore: 65,
      supportedBrands: cleanBrands,
      supportsEngineTypes: ["Petrol", "Hybrid", "Diesel"],
      openingHours: recMechHours,
      completesCount: 1,
      complaintsCount: 0
    };

    const contributionObj = {
      id: `contribution-${Date.now()}`,
      newPin: helperPin,
      coinReward: 4, // 4 coins for mechanic recommendation!
      submitterName: activeUser?.name || "Community Contributer",
      date: new Date().toISOString().split('T')[0]
    };

    const updatedConts = [contributionObj, ...contributionRequests];
    setContributionRequests(updatedConts);
    localStorage.setItem("mycar_contributions", JSON.stringify(updatedConts));

    setShowRecommendModal(false);
    alert(`Mechanic recommendation submitted! Real coin reward +4 listed on Super Admin authorization.`);

    // Reset Form entries
    setRecMechName("");
    setRecMechPhone("");
    setRecMechTelegram("");
    setRecMechSkills("");
    setRecMechNote("");
  };

  // User Action 4: Submit Business Claim
  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showClaimModal) return;

    const newClaim = {
      id: `claim-${Date.now()}`,
      pinId: showClaimModal.id,
      pinName: showClaimModal.name,
      ownerName: activeUser?.name || "Business Owner",
      ownerPhone: claimPhone,
      ownerTelegram: claimTelegram,
      proofPhoto: claimProofPhoto || "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=400",
      businessLicense: claimLicense,
      status: "Pending"
    };

    const updatedClaims = [newClaim, ...claimRequests];
    setClaimRequests(updatedClaims);
    localStorage.setItem("mycar_claim_requests", JSON.stringify(updatedClaims));
    
    // Update original pin state to "Owner Claimed"
    const updatedPins = pins.map(p => {
      if (p.id === showClaimModal.id) {
        return { ...p, status: "Owner Claimed" as const };
      }
      return p;
    });
    savePinsToStorage(updatedPins);
    
    setShowClaimModal(null);
    setClaimPhone("");
    setClaimTelegram("");
    setClaimLicense("");
    setClaimProofPhoto("");
    
    alert("Claims request dispatched to administrative center. Validation is done manually with phone/telegram OTP tests within 48h.");
  };

  // Super Admin Action 1: Approve Contribution Listing & Coin Grant
  const handleApproveContribution = (contObj: any) => {
    const updatedPins = [contObj.newPin, ...pins];
    savePinsToStorage(updatedPins);

    const remainingConts = contributionRequests.filter(c => c.id !== contObj.id);
    setContributionRequests(remainingConts);
    localStorage.setItem("mycar_contributions", JSON.stringify(remainingConts));

    // Award coins to submitter
    handleAwardCoins(contObj.coinReward, `Submission reward for ${contObj.newPin.name}`);
    alert(`Listing "${contObj.newPin.name}" is now live! submittor rewarded +${contObj.coinReward} coins.`);
    if (onRefreshData) onRefreshData();
  };

  // Super Admin Action 2: Approve Owner Claims Request
  const handleApproveClaim = (claimObj: any) => {
    const updatedPins = pins.map(p => {
      if (p.id === claimObj.pinId) {
        return { 
          ...p, 
          status: "Admin Verified" as const, 
          claimedByGroupId: activeUser?.id || 1, // claims token mapped to active user sequence
          isPartner: true,
          trustScore: 85
        };
      }
      return p;
    });
    savePinsToStorage(updatedPins);

    const updatedClaims = claimRequests.map(c => {
      if (c.id === claimObj.id) return { ...c, status: "Approved" };
      return c;
    });
    setClaimRequests(updatedClaims);
    localStorage.setItem("mycar_claim_requests", JSON.stringify(updatedClaims));

    alert(`Business "${claimObj.pinName}" claims request is approved! Real owner is now verified managed.`);
    if (onRefreshData) onRefreshData();
  };

  // Super Admin Action 3: Reject Claim
  const handleRejectClaim = (claimObj: any) => {
    const updatedClaims = claimRequests.map(c => {
      if (c.id === claimObj.id) return { ...c, status: "Rejected" };
      return c;
    });
    setClaimRequests(updatedClaims);
    localStorage.setItem("mycar_claim_requests", JSON.stringify(updatedClaims));

    const updatedPins = pins.map(p => {
      if (p.id === claimObj.pinId) {
        return { ...p, status: "Community Added" as const };
      }
      return p;
    });
    savePinsToStorage(updatedPins);
    alert(`Claims request rejected for ${claimObj.pinName}. Pin falls back to Community Added.`);
  };

  // Business Owner Action: Scan QR & Queue Service records (Simulator)
  const handleGenerateServiceTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedScannerVehicle) return;

    const ticket = {
      vehicleId: selectedScannerVehicle.id,
      vehicleDetails: `${selectedScannerVehicle.brand} ${selectedScannerVehicle.model} (${selectedScannerVehicle.year})`,
      serviceCategory: "Engine Oil Service",
      cost: 45,
      mileage: selectedScannerVehicle.mileage + 500,
      description: "Fast synthetic oil swap with filter wash provided.",
      provider: "Owner Managed Sokha Auto",
      date: new Date().toISOString().split("T")[0]
    };

    setProposedTicket(ticket);
    setShowQrScanSimulator(false);
  };

  const handleConfirmTicketSubmit = async () => {
    if (!proposedTicket || !onLogRecordExternal) return;

    const success = await onLogRecordExternal(proposedTicket);
    if (success) {
      alert(`Service log has been dispatched successfully for owner approval! User must click Approve inside Odometer alerts.`);
      setProposedTicket(null);
    } else {
      alert("Error sending record ticket.");
    }
  };

  // Find if current user profile has claimed managed garages
  const userClaimedPins = pins.filter(p => p.claimedByGroupId === activeUser?.id);

  // SVG Render coordinate pointers helper
  const renderCategoryIcon = (cat: string) => {
    switch (cat) {
      case "Petrol Station": return <Fuel className="w-3.5 h-3.5 text-amber-400" />;
      case "EV Charging": return <Zap className="w-3.5 h-3.5 text-cyan-400" />;
      case "Garage": return <Wrench className="w-3.5 h-3.5 text-emerald-400" />;
      case "Spare Parts Shop": return <Tag className="w-3.5 h-3.5 text-indigo-400" />;
      case "Tire Shop": return <Disc className="w-3.5 h-3.5 text-blue-400 animate-spin-slow" />;
      case "Battery Shop": return <Battery className="w-3.5 h-3.5 text-rose-400" />;
      case "Car Wash": return <Droplets className="w-3.5 h-3.5 text-sky-400" />;
      case "Freelancer Mechanic": return <UserCheck className="w-3.5 h-3.5 text-emerald-350" />;
      default: return <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* MODULE HEADER AND QUICK STATS ROW */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-black tracking-widest uppercase mb-1">
            <Compass className="w-4 h-4 animate-spin-slow" />
            <span>Cambodia’s Digital Auto Map Discovery</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            MyCar Care Map
          </h1>
          <p className="text-xs text-slate-400 font-sans max-w-xl">
             Explore nearby vehicle helps, charging sockets, and verified roadside mechanics in Cambodia. Add listings, claim profiles, and earn real Reward Coins!
          </p>
        </div>

        {/* CONTRIBUTION STATUS BLOCK */}
        <div className="flex items-center gap-3 bg-slate-900/60 p-3 rounded-2xl border border-white/5 select-none shrink-0">
          <div 
            onClick={() => setActiveSubTab('rewards')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-105 transition">
              <Coins className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Earned Rewards</span>
              <span className="text-sm font-black font-mono text-amber-400 block group-hover:underline">
                {userCoins} Coins
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CORE NAVIGATION BAR */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-950/60 rounded-xl border border-white/5 select-none">
        <button
          onClick={() => setActiveSubTab('map')}
          className={`flex-1 min-w-[120px] py-2 px-3 rounded-lg text-xs font-extrabold transition text-center flex items-center justify-center gap-1.5 cursor-pointer ${
            activeSubTab === 'map' ? "bg-white/10 text-white border border-white/10 shadow-sm" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <MapIcon className="w-4 h-4 text-emerald-400" />
          <span>Location Discovery</span>
        </button>

        <button
          onClick={() => setActiveSubTab('mechanics')}
          className={`flex-1 min-w-[120px] py-2 px-3 rounded-lg text-xs font-extrabold transition text-center flex items-center justify-center gap-1.5 cursor-pointer ${
            activeSubTab === 'mechanics' ? "bg-white/10 text-white border border-white/10 shadow-sm" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <UserCheck className="w-4 h-4 text-purple-400" />
          <span>Freelancers Mechanics</span>
        </button>

        <button
          onClick={() => setActiveSubTab('rewards')}
          className={`flex-1 min-w-[120px] py-2 px-3 rounded-lg text-xs font-extrabold transition text-center flex items-center justify-center gap-1.5 cursor-pointer ${
            activeSubTab === 'rewards' ? "bg-white/10 text-white border border-white/10 shadow-sm" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Coins className="w-4 h-4 text-amber-400" />
          <span>Contributions Reward</span>
        </button>

        {userClaimedPins.length > 0 && (
          <button
            onClick={() => setActiveSubTab('owner_dashboard')}
            className={`flex-1 min-w-[120px] py-2 px-3 rounded-lg text-xs font-extrabold transition text-center flex items-center justify-center gap-1.5 cursor-pointer ${
              activeSubTab === 'owner_dashboard' ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sliders className="w-4 h-4 text-emerald-400" />
            <span>My Claimed Shop ({userClaimedPins.length})</span>
          </button>
        )}

        {/* Super admin control board link */}
        {activeUser?.role === "Admin" && (
          <button
            onClick={() => setActiveSubTab('admin_queue')}
            className={`flex-1 min-w-[120px] py-2 px-3 rounded-lg text-xs font-extrabold transition text-center style-admin flex items-center justify-center gap-1.5 cursor-pointer ${
              activeSubTab === 'admin_queue' ? "bg-rose-500/20 text-rose-300 border border-rose-500/30 font-black" : "text-rose-450 hover:text-rose-300 text-rose-400"
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Super Admin Gate ({claimRequests.filter(c => c.status === 'Pending').length + contributionRequests.length})</span>
          </button>
        )}

        {onNavigateTab && (
          <button
            onClick={() => onNavigateTab("fix_my_car_bidding")}
            className="flex-1 min-w-[120px] py-2 px-3 rounded-lg text-xs font-extrabold transition text-center flex items-center justify-center gap-1.5 cursor-pointer bg-emerald-500/10 text-emerald-350 hover:bg-emerald-500/20 hover:text-emerald-300 border border-emerald-500/20 font-black"
          >
            <Wrench className="w-4 h-4 text-emerald-400" />
            <span>Problem Bidding Request</span>
          </button>
        )}
      </div>

      {/* SUB TAB LAYOUTS */}

      {/* 1. MAP DISCOVERY TAB */}
      {activeSubTab === 'map' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* SEARCH FILTERS AND SHOP INDEX PANEL (7 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Quick Keyword Query search bar */}
            <div className="glass rounded-3xl p-4 space-y-3 shadow-md border border-white/5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search stations, alignment, AC..."
                  className="w-full bg-slate-950/60 font-sans text-xs p-3 pl-9 rounded-xl text-slate-200 border border-white/10 focus:outline-none focus:border-emerald-550"
                />
              </div>

              {/* Selector Province filter tab row */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase font-sans">Active Province</label>
                <div className="grid grid-cols-5 gap-1 select-none">
                  {(['Phnom Penh', 'Siem Reap', 'Battambang', 'Sihanoukville', 'Kampot'] as const).map((prov) => (
                    <button
                      key={prov}
                      onClick={() => {
                        setActiveProvince(prov);
                        setSelectedPin(null);
                        setCategoryFilter("All");
                      }}
                      className={`py-1.5 text-[8.5px] font-black rounded-lg transition-transform hover:scale-102 cursor-pointer ${
                        activeProvince === prov
                          ? "bg-emerald-500 text-slate-950 font-black shadow-md"
                          : "bg-slate-950 text-slate-400 hover:text-white border border-white/5"
                      }`}
                    >
                      {prov.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Advanced multi categories dropdown */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[8.5px] font-bold text-slate-500 block mb-1 uppercase font-mono">Category</label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full bg-slate-950 text-[10.5px] text-slate-350 p-2.5 rounded-xl border border-white/10 focus:outline-none text-slate-200"
                  >
                    <option value="All">All Categories</option>
                    <option value="Petrol Station">Petrol Station</option>
                    <option value="EV Charging">EV Charging</option>
                    <option value="Garage">Garage</option>
                    <option value="Spare Parts Shop">Spare Parts Shop</option>
                    <option value="Tire Shop">Tire Shop</option>
                    <option value="Battery Shop">Battery Shop</option>
                    <option value="Car Wash">Car Wash</option>
                    <option value="Freelancer Mechanic">Mechanics</option>
                    <option value="Emergency Service">Emergency Helpers</option>
                  </select>
                </div>

                <div>
                  <label className="text-[8.5px] font-bold text-slate-500 block mb-1 uppercase font-mono">Engine compatibility</label>
                  <select
                    value={engineTypeFilter}
                    onChange={(e) => setEngineTypeFilter(e.target.value)}
                    className="w-full bg-slate-950 text-[10.5px] text-slate-350 p-2.5 rounded-xl border border-white/10 focus:outline-none text-slate-200"
                  >
                    <option value="All">All Powertrains</option>
                    <option value="Petrol">Petrol / Gasoline</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="EV">EV / Electric</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[8.5px] font-bold text-slate-500 block mb-1 uppercase font-mono">My Car Brand</label>
                  <select
                    value={brandFilter}
                    onChange={(e) => setBrandFilter(e.target.value)}
                    className="w-full bg-slate-950 text-[10.5px] text-slate-350 p-2.5 rounded-xl border border-white/10 focus:outline-none text-slate-200"
                  >
                    <option value="All">All Brands</option>
                    <option value="Toyota">Toyota</option>
                    <option value="Lexus">Lexus</option>
                    <option value="Ford">Ford</option>
                    <option value="BYD">BYD</option>
                    <option value="Tesla">Tesla</option>
                    <option value="Honda">Honda</option>
                  </select>
                </div>

                {/* Submit New Unclaimed Pin directly */}
                <div className="flex items-end">
                  <button
                    onClick={() => setShowAddPinModal(true)}
                    className="w-full py-2.5 bg-emerald-500 text-slate-950 font-black text-[10.5px] rounded-xl flex items-center justify-center gap-1 cursor-pointer hover:bg-emerald-600 transition shadow-lg shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Contribute Pin</span>
                  </button>
                </div>
              </div>

              {/* Small Switch toggles */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5 justify-between">
                <button
                  onClick={() => setFilterVerifiedOnly(!filterVerifiedOnly)}
                  className={`px-2.5 py-1.5 rounded-lg text-[9px] font-black transition cursor-pointer ${
                    filterVerifiedOnly ? "bg-emerald-500/25 text-emerald-400 border border-emerald-500/20" : "bg-white/5 text-slate-400"
                  }`}
                >
                  Verified Only
                </button>
                
                <button
                  onClick={() => setFilterHighestRated(!filterHighestRated)}
                  className={`px-2.5 py-1.5 rounded-lg text-[9px] font-black transition cursor-pointer ${
                    filterHighestRated ? "bg-amber-500/25 text-amber-400 border border-amber-500/20" : "bg-white/5 text-slate-400"
                  }`}
                >
                  ★★★★★ Rating
                </button>

                <button
                  onClick={() => setFilterNearMe(!filterNearMe)}
                  className={`px-2.5 py-1.5 rounded-lg text-[9px] font-black transition cursor-pointer ${
                    filterNearMe ? "bg-cyan-500/25 text-cyan-400 border border-cyan-500/20" : "bg-white/5 text-slate-400"
                  }`}
                >
                  GPS Near Me
                </button>
              </div>
            </div>

            {/* DIRECTORY LISTING FEED */}
            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block pl-1">
                Pin Listings ({filteredPinsList.length})
              </span>

              {filteredPinsList.map((p) => {
                const isSelected = selectedPin?.id === p.id;
                const isFav = favorites.includes(p.id);
                const trustDesc = p.status;

                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPin(p)}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition relative group ${
                      isSelected
                        ? "bg-white/10 border-emerald-500 shadow-md shadow-emerald-500/5 translate-x-1"
                        : "bg-white/2 border-white/5 hover:bg-white/5 hover:border-white/10"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/5 bg-slate-900 bg-black/40 text-slate-500">
                        <img 
                          src={p.imageUrl} 
                          alt={p.name} 
                          className="w-full h-full object-cover group-hover:scale-102 transition" 
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.currentTarget.src = "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=400";
                          }}
                        />
                      </div>

                      <div className="space-y-0.5 flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-xs font-black text-slate-200 group-hover:text-white truncate">
                            {p.name}
                          </h4>
                          <span className={`px-1 rounded text-[7.5px] uppercase font-bold tracking-wider ${
                            p.status === 'Premium Partner' ? 'bg-amber-400 text-slate-950 font-black' :
                            p.status === 'Admin Verified' ? 'bg-emerald-500/20 text-emerald-400' :
                            'bg-zinc-800 text-zinc-400'
                          }`}>
                            {trustDesc}
                          </span>
                        </div>

                        <p className="text-[10px] text-slate-400 truncate leading-relaxed">
                          {p.address}
                        </p>

                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                          <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            <span>{p.rating}</span>
                          </span>
                          <span>({p.reviewsCount} reviews)</span>
                          <span>•</span>
                          <span className="text-zinc-400">{p.category}</span>
                        </div>
                      </div>

                      {/* Favorite Button on Pin */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(p.id);
                        }}
                        className={`p-1.5 rounded-lg border text-xs shrink-0 transition hover:bg-white/10 ${
                          isFav ? "text-rose-500 border-rose-500/20 bg-rose-500/5 animate-pulse" : "text-slate-500 border-transparent bg-transparent"
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-500' : ''}`} />
                      </button>
                    </div>
                  </div>
                );
              })}

              {filteredPinsList.length === 0 && (
                <div className="p-12 text-center text-slate-500 text-xs font-sans glass border border-white/5 rounded-3xl">
                   No vehicle pins mapped in {activeProvince} matching criteria. Be the first to add one!
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDE: VECTOR COORDINATES BOARD & SELECTED DETAILS (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* INTERACTIVE COORDINATE CANVAS SHIELD / MAP CONTAINER */}
            <div className="glass rounded-3xl p-4 space-y-3 shadow-md border border-white/5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-350 uppercase tracking-widest flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-emerald-400 animate-spin-slow" />
                  <span>{activeProvince} Coordinated grid projection</span>
                </h3>
                <span className="text-[9.5px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Cambodia GPS Active
                </span>
              </div>

              {/* SIMULATED SPATIAL GPS INTERACTIVE SVG CANVAS */}
              <div className="relative aspect-[16/10] w-full bg-slate-950/80 rounded-2xl border border-white/10 overflow-hidden select-none hover:shadow-inner">
                
                {/* Visual Province Waterways lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-25" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path d="M 10 30 C 35 48, 55 60, 90 90" fill="none" stroke="#22d3ee" strokeWidth="2.5" />
                  <path d="M 85 10 C 65 35, 45 65, 20 85" fill="none" stroke="#0ea5e9" strokeWidth="2.0" />
                  <circle cx="50" cy="50" r="1.5" fill="#10b981" />
                </svg>

                {/* Map Grid markers overlay */}
                <div className="absolute top-2 left-2 text-[8px] font-mono text-zinc-500 font-extrabold flex gap-2">
                  <span>SCALE 1:200,000m</span>
                  <span>100m Precision Grid</span>
                </div>

                {/* Quick province indicators */}
                <div className="absolute bottom-2 right-2 text-[8px] font-bold text-zinc-500 font-mono">
                  Coordinates: Cambodia Grid Projection Zone 48N
                </div>

                {/* Pins placement Loop */}
                {filteredPinsList.map((p) => {
                  const isSelected = selectedPin?.id === p.id;
                  const { x, y } = getPercentageCoords(p.lat, p.lng);

                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPin(p)}
                      className="absolute z-20 -translate-x-1/2 -translate-y-1/2 focus:outline-none transition group cursor-pointer"
                      style={{ left: x, top: y }}
                    >
                      <div className="relative flex flex-col items-center">
                        
                        {/* Hover Quick Label */}
                        <span className={`absolute bottom-6 bg-slate-950/90 border text-[8.5px] px-1.5 py-0.5 rounded-lg font-black tracking-wide whitespace-nowrap pointer-events-none group-hover:opacity-100 transition shadow-xl ${
                          isSelected ? "opacity-100 border-emerald-500 text-white" : "opacity-0 scale-95 text-slate-200"
                        }`}>
                          {p.name.split(' ')[0]} ({p.rating}★)
                        </span>

                        {/* Pulsing Beacon if Partner */}
                        {p.isPartner && (
                          <span className={`absolute w-7 h-7 bg-emerald-500/10 rounded-full border border-emerald-500/20 scale-140 pointer-events-none ${
                            isSelected ? "animate-ping" : ""
                          }`} />
                        )}

                        {/* Map Pin Anchor */}
                        <div className={`p-1.5 rounded-full border shadow-lg transition duration-200 ${
                          isSelected 
                            ? "bg-emerald-500 border-white text-slate-900 scale-120 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]" 
                            : "bg-slate-900 border-white/10 text-slate-300 hover:scale-110"
                        }`}>
                          {renderCategoryIcon(p.category)}
                        </div>
                      </div>
                    </button>
                  );
                })}

                {/* Submitting Pointer coordinate help text */}
                {filterNearMe && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center gap-1">
                    <div className="relative flex items-center justify-center">
                      <span className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/20 animate-ping absolute block"></span>
                      <span className="w-3.5 h-3.5 bg-cyan-500 border-2 border-white rounded-full block"></span>
                    </div>
                    <span className="bg-slate-950/90 text-cyan-400 border border-cyan-550 px-1 py-0.5 rounded-lg text-[8px] tracking-wide font-black uppercase shadow-md">
                      Current GPS Center
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* DETAILED BUSINESS PROFILE PAGE COMPONENT (BELOW MAP CAROUSEL) */}
            {selectedPin ? (
              <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-5 space-y-4 shadow-xl animate-fade-in relative">
                
                {/* Pin Action Banner info */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-black text-white font-sans">{selectedPin.name}</h3>
                      <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-mono font-bold border ${
                        selectedPin.status === "Premium Partner" ? "bg-amber-400/20 text-amber-400 border-amber-500/20" :
                        selectedPin.status === "Admin Verified" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/20" :
                        selectedPin.status === "Community Added" ? "bg-blue-500/20 text-blue-400 border-blue-500/20" :
                        "bg-zinc-800 text-zinc-400 border-transparent"
                      }`}>
                        {selectedPin.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 font-sans">{selectedPin.address}</p>
                    
                    {/* Trust Score block */}
                    <div className="flex items-center gap-3 text-xs pt-1.5 flex-wrap">
                      <span className="flex items-center gap-1 font-bold text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{selectedPin.rating}</span>
                        <span className="text-slate-505 text-zinc-500 font-normal">({selectedPin.reviewsCount} reviews)</span>
                      </span>
                      <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-0.5 rounded-md border border-white/5 font-mono text-[10px]">
                        <span className="text-[9px] text-slate-500 font-bold uppercase">Trust score:</span>
                        <span className={`font-bold ${selectedPin.trustScore >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {selectedPin.trustScore}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Immediate Dial and Claim CTA button */}
                  <div className="flex sm:flex-col gap-2 w-full sm:w-auto self-stretch sm:grid-cols-1">
                    {/* Action buttons list */}
                    <a
                      href={`tel:${selectedPin.phone}`}
                      className="flex-1 px-4 py-2.5 bg-emerald-500 text-slate-950 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer leading-none hover:bg-emerald-600 transition"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call {selectedPin.phone.split(' ')[0]}</span>
                    </a>

                    {selectedPin.telegram && (
                      <a
                        href={`https://t.me/${selectedPin.telegram.replace('@', '')}`}
                        target="_blank"
                        rel="referrer"
                        className="flex-1 px-4 py-2.5 bg-sky-900 border border-sky-800 text-slate-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer leading-none hover:bg-sky-800 transition"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
                        <span>Telegram Chat</span>
                      </a>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-3 border-t border-white/5 items-start">
                  
                  {/* Info descriptions list (8 Cols) */}
                  <div className="md:col-span-8 space-y-4">
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block font-mono">Business Bio</span>
                      <p className="text-xs text-slate-350 leading-relaxed font-serif">
                        {selectedPin.description}
                      </p>
                    </div>

                    {/* Services and details lists */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block font-mono mb-1">Services provided</span>
                        <div className="flex flex-wrap gap-1">
                          {selectedPin.services.map((s, idx) => (
                            <span key={idx} className="text-[10px] bg-white/5 border border-white/5 text-slate-350 px-2 py-0.5 rounded font-mono">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block font-mono mb-1">Brands supported</span>
                        <div className="flex flex-wrap gap-1">
                          {selectedPin.supportedBrands.map((b, idx) => (
                            <span key={idx} className="text-[10px] bg-slate-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/10 font-bold font-mono">
                              {b}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1 border-t border-transparent">
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-500 font-bold uppercase block font-mono">Opening hours</span>
                        <span className="text-xs text-slate-300 font-mono flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-indigo-400" />
                          <span>{selectedPin.openingHours}</span>
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-500 font-bold uppercase block font-mono">Supported engines</span>
                        <div className="flex gap-1.5 flex-wrap">
                          {selectedPin.supportsEngineTypes.map((eng, idx) => (
                            <span key={idx} className="text-[9px] bg-zinc-800 text-slate-300 px-1 py-0.5 rounded font-black tracking-wide uppercase">
                              {eng}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Trust details and Wrong Information / Claims CTA (4 Cols) */}
                  <div className="md:col-span-4 bg-slate-950/60 border border-white/5 p-4 rounded-2xl space-y-4 text-center">
                    <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest block font-mono">Trust metrics</span>
                    
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="bg-slate-900 border border-white/5 p-2 rounded-xl">
                        <span className="text-[8.5px] text-slate-500 uppercase block font-bold leading-tight">Logs Added</span>
                        <span className="text-sm font-black font-mono text-slate-200">{selectedPin.completesCount}</span>
                      </div>
                      <div className="bg-slate-900 border border-white/5 p-2 rounded-xl">
                        <span className="text-[8.5px] text-slate-500 uppercase block font-bold leading-tight">Complaints</span>
                        <span className="text-sm font-black font-mono text-red-400">{selectedPin.complaintsCount}</span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-white/5 text-xs text-left">
                      {selectedPin.status === "Community Added" && (
                        <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[10.5px] rounded-xl flex flex-col gap-2">
                          <p className="leading-relaxed font-semibold">
                             This business pin is unclaimed. Are you the business owner of {selectedPin.name}? Claim it!
                          </p>
                          <button
                            onClick={() => setShowClaimModal(selectedPin)}
                            className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-lg transition text-center cursor-pointer"
                          >
                            Claim This Business
                          </button>
                        </div>
                      )}

                      <div className="flex gap-2">
                        {/* Favorite button toggle */}
                        <button
                          onClick={() => toggleFavorite(selectedPin.id)}
                          className="flex-1 py-2 bg-slate-900 overflow-hidden font-bold border border-white/10 hover:border-white/15 text-xs text-slate-300 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Heart className={`w-3.5 h-3.5 text-rose-500 ${favorites.includes(selectedPin.id) ? 'fill-rose-500' : ''}`} />
                          <span>{favorites.includes(selectedPin.id) ? 'Favorited' : 'Save Favorite'}</span>
                        </button>

                        <button
                          onClick={() => setReportModalPin(selectedPin)}
                          className="px-2.5 py-2 bg-slate-900 border border-white/10 hover:border-red-500/20 hover:text-red-400 rounded-xl transition cursor-pointer"
                          title="Report Wrong Location / Contact information"
                        >
                          <AlertTriangle className="w-4 h-4 text-slate-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* USER REVIEWS SECTION */}
                <div className="space-y-3 pt-4 border-t border-white/15">
                  <span className="text-[11px] text-slate-400 font-extrabold uppercase tracking-widest block font-mono">Reviews & Comments ledger</span>
                  
                  {/* Reviews lists */}
                  <div className="space-y-2">
                    {selectedPin.reviews.map((r, rIdx) => (
                      <div key={rIdx} className="bg-slate-950/40 p-3 rounded-2xl border border-white/5 space-y-1">
                        <div className="flex justify-between items-center flex-wrap gap-2 text-[11px]">
                          <span className="font-bold text-slate-200">{r.author}</span>
                          <div className="flex items-center gap-1.5 text-slate-505 text-zinc-550 font-mono text-[10px]">
                            <span className="text-amber-500 font-bold">{r.rating}★</span>
                            <span>|</span>
                            <span>{r.date}</span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-350 leading-relaxed font-serif italic">
                          "{r.text}"
                        </p>
                      </div>
                    ))}

                    {/* Quick review submission form */}
                    <form onSubmit={handleAddReview} className="bg-slate-950/60 p-4 rounded-2xl border border-white/10 space-y-3">
                      <span className="text-[10px] text-slate-400 font-extrabold block uppercase tracking-wider">Leave a Verified Review</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400 font-mono">Rating choice:</span>
                        <div className="flex gap-1.5">
                          {[1, 2, 3, 4, 5].map((starVal) => (
                            <button
                              key={starVal}
                              type="button"
                              onClick={() => setNewRating(starVal)}
                              className={`text-base leading-none transition duration-150 cursor-pointer ${
                                starVal <= newRating ? "text-amber-400 animate-pulse" : "text-slate-655 text-zinc-650"
                              }`}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <textarea
                          rows={2}
                          value={newCommentText}
                          onChange={(e) => setNewCommentText(e.target.value)}
                          required
                          placeholder="Share your experience (was pricing correct? did mechanic solve problem?)... Receive +2 Coins on submit!"
                          className="flex-1 bg-slate-900 border border-white/10 p-2.5 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
                        />
                        <button
                          type="submit"
                          className="px-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 text-slate-950 rounded-xl font-bold text-xs flex items-center justify-center gap-1 select-none cursor-pointer self-stretch shrink-0"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Submit</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-16 text-center text-slate-500 font-sans border border-white/5 bg-slate-900/10 border-dashed rounded-3xl h-64 flex flex-col justify-center items-center gap-2 shadow-inner">
                <Compass className="w-10 h-10 text-emerald-550 opacity-40 animate-spin-slow" />
                <p className="text-xs font-semibold">Select any service pin on coordinates map above or search list for business telemetry reportcard.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. FREELANCE MECHANICS LEDGER */}
      {activeSubTab === 'mechanics' && (
        <div className="space-y-4">
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs font-bold leading-relaxed">
              💡 Highway Distress Alerts: Drivers can locate certified independent mobile helpers to troubleshoot roadside problems on demand under Siem Reap/PP highway limits.
            </p>
            <button
              onClick={() => setShowRecommendModal(true)}
              className="px-4 py-2 bg-emerald-500 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 hover:bg-emerald-600 transition shrink-0 cursor-pointer shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>Recommend Mechanic</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pins.filter(p => p.category === "Freelancer Mechanic").map((mech) => (
              <div key={mech.id} className="bg-slate-900/60 border border-white/10 p-4 rounded-3xl space-y-4 shadow-xl">
                <div className="flex items-start gap-3 justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 border border-white/5 bg-slate-950">
                      <img src={mech.imageUrl} alt={mech.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-100">{mech.name}</h3>
                      <span className="text-[10px] text-zinc-400 font-mono">{mech.address}</span>
                      <div className="flex items-center gap-2 pt-1">
                        <span className="flex items-center gap-0.5 text-xs text-amber-500 font-bold">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          <span>{mech.rating}</span>
                        </span>
                        <span className="text-[10px] text-slate-500">({mech.reviewsCount} reviews)</span>
                        <span className="px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] font-black rounded uppercase">
                          {mech.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <a
                    href={`tel:${mech.phone}`}
                    className="p-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl transition duration-150 text-xs shadow"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                </div>

                <div className="p-3 bg-slate-950/60 border border-white/5 rounded-2xl text-xs space-y-2">
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-slate-500 font-bold uppercase block">Specialization skills</span>
                    <div className="flex flex-wrap gap-1">
                      {mech.services.map((skill, sIdx) => (
                        <span key={sIdx} className="bg-white/5 text-slate-350 px-1.5 py-0.5 rounded text-[10px] font-mono">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 pt-1.5 border-t border-white/5">
                    <span>Working Hours: <strong className="text-slate-205 text-zinc-200">{mech.openingHours}</strong></span>
                    <span>Brands: <strong className="text-slate-205 text-zinc-200">{mech.supportedBrands.join(', ')}</strong></span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed italic border-l-2 border-purple-500 pl-3">
                  "{mech.description.replace('Freelancer Bio: ', '')}"
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. CONTRIBUTIONS REWARD COINS LOGS */}
      {activeSubTab === 'rewards' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Visual Rules of contributions (4 Cols) */}
          <div className="md:col-span-5 bg-slate-900/60 border border-white/10 p-5 rounded-3xl space-y-4 shadow-xl">
            <h3 className="text-sm font-black text-slate-100 flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>Reward rules ledger</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Driver community contributions are verified manually bySuper Admin to maintain absolute safety and zero duplicate information. Get rewarded instantly!
            </p>

            <div className="space-y-2 text-xs">
              <div className="bg-slate-950/60 border border-white/5 p-3 rounded-2xl flex justify-between items-center font-semibold">
                <span>Add valid Premium Petrol station</span>
                <span className="text-amber-400 font-mono font-bold">+3 Coins</span>
              </div>
              <div className="bg-slate-950/60 border border-white/5 p-3 rounded-2xl flex justify-between items-center font-semibold">
                <span>Add DC public EV charging socket</span>
                <span className="text-amber-400 font-mono font-bold">+5 Coins</span>
              </div>
              <div className="bg-slate-950/60 border border-white/5 p-3 rounded-2xl flex justify-between items-center font-semibold">
                <span>Add verified local auto repair garage</span>
                <span className="text-amber-400 font-mono font-bold">+5 Coins</span>
              </div>
              <div className="bg-slate-950/60 border border-white/5 p-3 rounded-2xl flex justify-between items-center font-semibold">
                <span>Spare part shop detail mapped</span>
                <span className="text-amber-400 font-mono font-bold">+5 Coins</span>
              </div>
              <div className="bg-slate-950/60 border border-white/5 p-3 rounded-2xl flex justify-between items-center font-semibold">
                <span>Recommend highway mobile mechanic</span>
                <span className="text-amber-400 font-mono font-bold">+4 Coins</span>
              </div>
              <div className="bg-slate-950/60 border border-white/5 p-3 rounded-2xl flex justify-between items-center font-semibold">
                <span>Report correction / incorrect data</span>
                <span className="text-amber-400 font-mono font-bold">+2 Coins</span>
              </div>
              <div className="bg-slate-950/60 border border-white/5 p-3 rounded-2xl flex justify-between items-center font-semibold">
                <span>Detail service reviews text written</span>
                <span className="text-amber-400 font-mono font-bold">+2 Coins</span>
              </div>
            </div>
          </div>

          {/* User coin transaction logs (7 Cols) */}
          <div className="md:col-span-7 bg-slate-900/60 border border-white/10 p-5 rounded-3xl space-y-4 shadow-xl">
            <h3 className="text-sm font-black text-slate-100 flex items-center gap-1.5 font-sans">
              <History className="w-4 h-4 text-indigo-400" />
              <span>Wallet ledger & coin transactions history</span>
            </h3>

            <div className="p-4 bg-slate-950 rounded-2xl border border-white/5 flex justify-between items-center">
              <div>
                <span className="text-[10px] text-slate-500 font-bold block uppercase font-mono">Current Balance</span>
                <span className="text-2xl font-black font-mono text-amber-400">{userCoins} MCC Coins</span>
              </div>
              <span className="px-3 py-1 bg-white/5 text-[10px] text-slate-400 rounded-full font-mono border border-white/5 select-none">
                 Approved Driver Account
              </span>
            </div>

            <div className="space-y-2 max-h-[290px] overflow-y-auto pr-1">
              {coinHistory.map((item, index) => (
                <div key={index} className="p-3 bg-white/2 border border-white/5 hover:border-white/10 rounded-2xl flex justify-between items-center text-xs">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-200">{item.action}</span>
                    <span className="text-[9.5px] text-slate-500 block font-mono">{item.date}</span>
                  </div>
                  <span className={`font-mono font-black ${item.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {item.change >= 0 ? `+${item.change}` : item.change} Coins
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. CLAIMED BUSINESS OWNER DASHBOARD */}
      {activeSubTab === 'owner_dashboard' && (
        <div className="space-y-6">
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider">Business Owner Workstation Console</h3>
              <p className="text-[11px] leading-relaxed text-slate-400 font-sans mt-0.5">
                Manage your claimed location parameters, scan driver QR secure tokens, submit digital checkup signatures directly for log approval.
              </p>
            </div>

            {/* Quick button to open QR scanner camera simulated popup */}
            <button
              onClick={() => {
                setSelectedScannerVehicle(vehicles.length > 0 ? vehicles[0] : null);
                setShowQrScanSimulator(true);
              }}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1 transition shadow cursor-pointer uppercase tracking-wider shrink-0"
            >
              <Camera className="w-4 h-4 text-slate-950" />
              <span>Scan Customer QR code</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            
            {/* Show owners claimed lists */}
            <div className="md:col-span-1 space-y-4">
              <span className="text-[10px] font-black text-slate-500 tracking-widest block uppercase pl-1">My claim locations</span>
              
              {userClaimedPins.map((p) => (
                <div key={p.id} className="p-4 bg-slate-900 border border-emerald-500/30 rounded-3xl relative overflow-hidden space-y-3">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
                  <h4 className="text-sm font-black text-slate-200">{p.name}</h4>
                  <p className="text-[11px] text-slate-400 leading-normal">{p.address}</p>
                  
                  <div className="space-y-1.5 pt-2 border-t border-white/5 text-[11px] text-zinc-400 font-mono">
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className="text-emerald-400 font-bold lowercase">active claimed</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Trust Rating:</span>
                      <span className="text-amber-505 text-amber-500 font-bold">{p.rating} ★</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Completed logs:</span>
                      <span className="text-white font-bold">{p.completesCount} records</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Show QR scan pending/proposed ticket payload */}
            <div className="md:col-span-2 space-y-4">
              <span className="text-[10px] font-black text-slate-500 tracking-widest block uppercase pl-1">Pending maintenance checks proposal tickets</span>
              
              {proposedTicket ? (
                <div className="bg-slate-900 border border-white/10 p-5 rounded-3xl space-y-4 shadow-xl">
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200 font-mono">
                      <Zap className="w-4 h-4 text-cyan-400" />
                      <span>Ready Ticket payload MCC-{propsId}</span>
                    </div>

                    <button
                      onClick={() => setProposedTicket(null)}
                      className="text-zinc-500 hover:text-zinc-300"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs leading-relaxed">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Target Customer vehicle</span>
                      <strong className="text-slate-202 text-slate-200 font-sans">{proposedTicket.vehicleDetails}</strong>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 block">Service Log Category</span>
                      <strong className="text-slate-202 text-slate-200 font-mono">{proposedTicket.serviceCategory}</strong>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 block font-mono">Completed service mileage</span>
                      <strong className="text-slate-202 text-white font-mono">{proposedTicket.mileage} km</strong>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 block">Service fee billed</span>
                      <strong className="text-emerald-400 font-mono">$ {proposedTicket.cost} USD</strong>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950/60 rounded-xl text-xs text-slate-400 font-serif leading-relaxed">
                    <strong>Service description:</strong> {proposedTicket.description}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setProposedTicket(null)}
                      className="flex-1 py-3 bg-red-500/20 text-red-400 border border-red-500/20 hover:bg-red-500/25 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      Cancel ticket
                    </button>

                    <button
                      onClick={handleConfirmTicketSubmit}
                      className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md"
                    >
                      <Check className="w-4 h-4 text-slate-950" />
                      <span>Submit for User approval</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center text-slate-505 text-zinc-500 font-sans border border-white/5 border-dashed rounded-3xl h-44 flex flex-col justify-center items-center">
                  <Camera className="w-8 h-8 opacity-40 mb-2 text-slate-500 animate-pulse" />
                  <p className="text-xs">No active scan check results. Scan a customer vehicle QR secure code to create digital service tickets.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. SUPER ADMIN CONTROL BOARD (Plausible Queue review) */}
      {activeSubTab === 'admin_queue' && (
        <div className="space-y-6">
          {/* Contribution submissions queue */}
          <div className="space-y-3">
            <span className="text-xs font-black text-rose-400 uppercase tracking-widest pl-1 block">Community contributions map pins queue ({contributionRequests.length})</span>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contributionRequests.map((cont) => (
                <div key={cont.id} className="bg-slate-900 border border-white/10 p-4 rounded-3xl space-y-4 shadow-xl text-left relative">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] text-indigo-400 font-bold uppercase font-mono">Submitter: {cont.submitterName}</span>
                      <h4 className="text-sm font-black text-white">{cont.newPin.name}</h4>
                      <p className="text-[11px] text-zinc-400 mt-0.5">{cont.newPin.address}</p>
                    </div>
                    <span className="text-xs font-mono font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                      +{cont.coinReward} Coins
                    </span>
                  </div>

                  <div className="p-3 bg-slate-950/60 rounded-xl text-xs space-y-2">
                    <div className="grid grid-cols-2 gap-1 text-[11px] text-zinc-400 font-mono">
                      <span>Category: <strong className="text-white">{cont.newPin.category}</strong></span>
                      <span>Province: <strong className="text-white">{cont.newPin.province}</strong></span>
                    </div>
                    <p className="text-[11.5px] leading-relaxed text-slate-400 font-serif">
                      "{cont.newPin.description}"
                    </p>
                  </div>

                  <button
                    onClick={() => handleApproveContribution(cont)}
                    className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer transition shadow"
                  >
                    <Check className="w-4 h-4 text-slate-950" />
                    <span>Approve submission & award coins</span>
                  </button>
                </div>
              ))}

              {contributionRequests.length === 0 && (
                <div className="col-span-2 p-10 text-center text-zinc-500 text-xs border border-white/5 border-dashed rounded-3xl font-sans h-32 flex items-center justify-center">
                  No community map submissions pending administrative audit.
                </div>
              )}
            </div>
          </div>

          {/* Business claims requests queue */}
          <div className="space-y-3">
            <span className="text-xs font-black text-rose-400 uppercase tracking-widest pl-1 block">Owner claim requests review ({claimRequests.filter(c => c.status === 'Pending').length})</span>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {claimRequests.filter(c => c.status === 'Pending').map((claim) => (
                <div key={claim.id} className="bg-slate-900 border border-white/10 p-4 rounded-3xl space-y-4 shadow-xl text-left relative">
                  <div className="space-y-1">
                    <span className="text-[9px] text-zinc-500 font-mono block">REQUEST ID: {claim.id}</span>
                    <h4 className="text-sm font-black text-white">Claim target: {claim.pinName}</h4>
                    <p className="text-[11px] text-slate-400 leading-normal">Submitter: {claim.ownerName} ({claim.ownerPhone})</p>
                  </div>

                  <div className="p-3 bg-slate-950/60 rounded-xl space-y-2 text-xs leading-relaxed text-zinc-400">
                    <div>
                      <span>Telegram handle:</span>
                      <strong className="text-white block font-mono">{claim.ownerTelegram}</strong>
                    </div>

                    <div>
                      <span>Business License proof ID:</span>
                      <strong className="text-white block font-mono">{claim.businessLicense}</strong>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRejectClaim(claim)}
                      className="flex-1 py-2.5 bg-rose-500/20 text-rose-400 border border-rose-500/20 hover:bg-rose-500/25 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      Reject Claim
                    </button>

                    <button
                      onClick={() => handleApproveClaim(claim)}
                      className="flex-1 py-2.5 bg-emerald-505 bg-emerald-550 bg-emerald-500 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer transition shadow"
                    >
                      <Check className="w-4 h-4 text-slate-900" />
                      <span>Verify managed</span>
                    </button>
                  </div>
                </div>
              ))}

              {claimRequests.filter(c => c.status === 'Pending').length === 0 && (
                <div className="col-span-2 p-10 text-center text-zinc-505 text-zinc-500 text-xs border border-white/5 border-dashed rounded-3xl font-sans h-32 flex items-center justify-center">
                  No pending owners claim authorization logs found.
                </div>
              )}
            </div>
          </div>
        </div>
      )}


      {/* --- POPUP ACTIVE MODALS FLOW --- */}

      {/* Modal 1: Contribute Unclaimed Map coordinates Pin form */}
      {showAddPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddPinModal(false)}></div>
          <div className="glass rounded-3xl p-5 max-w-md w-full relative z-10 space-y-4 shadow-2xl overflow-y-auto max-h-[90vh]">
            
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <div className="flex items-center gap-1.5">
                <Compass className="w-4.5 h-4.5 text-emerald-400 animate-spin-slow" />
                <h3 className="text-base font-black text-white">Contribute Location Pin</h3>
              </div>
              <button onClick={() => setShowAddPinModal(false)} className="text-slate-400 hover:text-white cursor-pointer mb-1.5">
                <X className="w-5 h-5 cursor-pointer" />
              </button>
            </div>

            <form onSubmit={handleAddNewPin} className="space-y-3.5 text-left">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Business Name</label>
                <input
                  type="text"
                  required
                  value={newPinName}
                  onChange={(e) => setNewPinName(e.target.value)}
                  placeholder="e.g., Total Store Teuk Thla, Khmer EV Garage"
                  className="w-full bg-slate-950 border border-white/10 p-2.5 text-xs rounded-xl focus:outline-none focus:border-emerald-500 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Category type</label>
                  <select
                    value={newPinCategory}
                    onChange={(e) => setNewPinCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-white/10 p-2.5 text-xs rounded-xl focus:outline-none text-slate-100"
                  >
                    <option value="Garage">Garage / Repair</option>
                    <option value="Petrol Station">Petrol Station</option>
                    <option value="EV Charging">EV Charging Station</option>
                    <option value="Spare Parts Shop">Spare Parts Shop</option>
                    <option value="Tire Shop">Tire Shop</option>
                    <option value="Battery Shop">Battery Shop</option>
                    <option value="Car Wash">Car Wash Center</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={newPinPhone}
                    onChange={(e) => setNewPinPhone(e.target.value)}
                    placeholder="e.g., +855 12 455 788"
                    className="w-full bg-slate-950 border border-white/10 p-2.5 text-xs rounded-xl focus:outline-none focus:border-emerald-500 text-slate-100 font-mono"
                  />
                </div>
              </div>

              {/* Grid relative coordinates simulator */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Coordinate X (0-100)</label>
                  <input
                    type="number"
                    min="5"
                    max="95"
                    value={newPinLocX}
                    onChange={(e) => setNewPinLocX(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-white/10 p-2.5 text-xs rounded-xl focus:outline-none text-slate-100 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Coordinate Y (0-100)</label>
                  <input
                    type="number"
                    min="5"
                    max="95"
                    value={newPinLocY}
                    onChange={(e) => setNewPinLocY(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-white/10 p-2.5 text-xs rounded-xl focus:outline-none text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Primary service / Brands (Comma lists)</label>
                <input
                  type="text"
                  value={newPinServices}
                  onChange={(e) => setNewPinServices(e.target.value)}
                  placeholder="e.g., Oil changes, alignment checkup, BYD cell swap"
                  className="w-full bg-slate-950 border border-white/10 p-2.5 text-xs rounded-xl focus:outline-none focus:border-emerald-500 text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Photo Cover Presets (or URL)</label>
                <select
                  value={newPinUrl}
                  onChange={(e) => setNewPinUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 p-2.5 text-xs rounded-xl focus:outline-none text-slate-100"
                >
                  <option value="">Choose cover photo style...</option>
                  <option value="https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=400">Classic Garage Shop</option>
                  <option value="https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=400">Public Tech EV sockets</option>
                  <option value="https://images.unsplash.com/photo-1527018601619-a508a2be00cd?auto=format&fit=crop&q=80&w=400">Standard fuel bay center</option>
                  <option value="https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&q=80&w=400">Detail foam washing station</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Short Description notes</label>
                <textarea
                  rows={2}
                  required
                  value={newPinDesc}
                  onChange={(e) => setNewPinDesc(e.target.value)}
                  placeholder="Mention key access hints or diagnostic pricing values..."
                  className="w-full bg-slate-950 border border-white/10 p-2.5 text-xs rounded-xl focus:outline-none text-slate-100"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-xl transition cursor-pointer"
              >
                Submit Contribution listing
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Claim Unclaimed Business profile */}
      {showClaimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowClaimModal(null)}></div>
          <div className="glass rounded-3xl p-5 max-w-md w-full relative z-10 space-y-4 shadow-2xl">
            
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-5 h-5 text-emerald-450 animate-pulse" />
                <h3 className="text-base font-black text-white">Claim This Business Profile</h3>
              </div>
              <button onClick={() => setShowClaimModal(null)} className="text-slate-400 hover:text-white cursor-pointer leading-tight mb-2">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed text-left font-sans">
              Provide authorization proofs to assert your physical governance over <strong>{showClaimModal.name}</strong> coordinate. Super admin approves manually to check duplicates.
            </p>

            <form onSubmit={handleClaimSubmit} className="space-y-3.5 text-left">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 block font-mono">Telegram Username</label>
                <input
                  type="text"
                  required
                  value={claimTelegram}
                  onChange={(e) => setClaimTelegram(e.target.value)}
                  placeholder="e.g., @sokha_garage"
                  className="w-full bg-slate-950 border border-white/10 p-2.5 text-xs rounded-xl focus:outline-none text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 block font-mono">Claim ID Owner Contact phone</label>
                <input
                  type="text"
                  required
                  value={claimPhone}
                  onChange={(e) => setClaimPhone(e.target.value)}
                  placeholder="e.g., +855 12 888 999"
                  className="w-full bg-slate-950 border border-white/10 p-2.5 text-xs rounded-xl focus:outline-none text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 block font-mono">Registered business license ID</label>
                <input
                  type="text"
                  required
                  value={claimLicense}
                  onChange={(e) => setClaimLicense(e.target.value)}
                  placeholder="e.g., MOC-L-7772"
                  className="w-full bg-slate-950 border border-white/10 p-2.5 text-xs rounded-xl focus:outline-none text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 block font-mono">Front shop / Billboard photo link</label>
                <input
                  type="text"
                  value={claimProofPhoto}
                  onChange={(e) => setClaimProofPhoto(e.target.value)}
                  placeholder="Paste high-res billboard image url..."
                  className="w-full bg-slate-950 border border-white/10 p-2.5 text-xs rounded-xl focus:outline-none text-slate-100"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-xl transition cursor-pointer"
              >
                Submit Claims request
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Recommend good freelance mechanic roadside */}
      {showRecommendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowRecommendModal(false)}></div>
          <div className="glass rounded-3xl p-5 max-w-md w-full relative z-10 space-y-4 shadow-2xl overflow-y-auto max-h-[90vh]">
            
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <div className="flex items-center gap-1.5">
                <UserCheck className="w-5 h-5 text-purple-400 animate-pulse" />
                <h3 className="text-base font-black text-white">Recommend Roadside Helper</h3>
              </div>
              <button onClick={() => setShowRecommendModal(false)} className="text-slate-400 hover:text-white cursor-pointerleading-tight mb-2">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecommendMechanic} className="space-y-3 text-left">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 block font-mono uppercase">Mechanic full Name</label>
                <input
                  type="text"
                  required
                  value={recMechName}
                  onChange={(e) => setRecMechName(e.target.value)}
                  placeholder="e.g., Dara Visal, Sokheng Long"
                  className="w-full bg-slate-950 border border-white/10 p-2.5 text-xs rounded-xl focus:outline-none text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 block font-mono uppercase">Phone number</label>
                  <input
                    type="text"
                    required
                    value={recMechPhone}
                    onChange={(e) => setRecMechPhone(e.target.value)}
                    placeholder="+855 12 ..."
                    className="w-full bg-slate-950 border border-white/10 p-2.5 text-xs rounded-xl focus:outline-none text-slate-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 block font-mono uppercase">Telegram handle</label>
                  <input
                    type="text"
                    value={recMechTelegram}
                    onChange={(e) => setRecMechTelegram(e.target.value)}
                    placeholder="@dara_visal"
                    className="w-full bg-slate-950 border border-white/10 p-2.5 text-xs rounded-xl focus:outline-none text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 block font-mono uppercase">Service Area / City</label>
                  <input
                    type="text"
                    required
                    value={recMechArea}
                    onChange={(e) => setRecMechArea(e.target.value)}
                    placeholder="e.g., Toul Kork, PP"
                    className="w-full bg-slate-950 border border-white/10 p-2.5 text-xs rounded-xl focus:outline-none text-slate-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 block font-mono uppercase">Typical Billed range ($)</label>
                  <input
                    type="text"
                    required
                    value={recMechHourlyPrice}
                    onChange={(e) => setRecMechHourlyPrice(e.target.value)}
                    placeholder="e.g., $10 - $25"
                    className="w-full bg-slate-950 border border-white/10 p-2.5 text-xs rounded-xl focus:outline-none text-slate-100"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 block font-mono uppercase">Specialized training skills</label>
                <input
                  type="text"
                  required
                  value={recMechSkills}
                  onChange={(e) => setRecMechSkills(e.target.value)}
                  placeholder="e.g., Hybrid cell jumpstart, tire changing roadside"
                  className="w-full bg-slate-950 border border-white/10 p-2.5 text-xs rounded-xl focus:outline-none text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 block font-mono uppercase">Recommendation / Note review</label>
                <textarea
                  rows={2}
                  required
                  value={recMechNote}
                  onChange={(e) => setRecMechNote(e.target.value)}
                  placeholder="Share details of the problem Visal solved, are they pricing fair?"
                  className="w-full bg-slate-950 border border-white/10 p-2.5 text-xs rounded-xl focus:outline-none text-slate-100"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-500 font-black text-slate-950 text-xs rounded-xl transition duration-150 cursor-pointer"
              >
                Submit Recommendation (+4 Coins)
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Claimed Garage User QR scan Simulator */}
      {showQrScanSimulator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowQrScanSimulator(false)}></div>
          <div className="glass rounded-3xl p-5 max-w-md w-full relative z-10 space-y-4 shadow-2xl text-left">
            
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <div className="flex items-center gap-1.5 text-emerald-400 font-black text-sm">
                <Camera className="w-5 h-5" />
                <span>Simulated Secure Odometer QR Scanner</span>
              </div>
              <button onClick={() => setShowQrScanSimulator(false)} className="text-slate-400 hover:text-white cursor-pointer leading-tight mb-2">
                <X className="w-5 h-5 animate-pulse" />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Normally, you would use a mobile tablet camera to physically scan driver secure stickers. During this demonstrative sandbox preview, select any active vehicle profile in the system to verify.
            </p>

            <form onSubmit={handleGenerateServiceTicket} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Select target vehicle</label>
                <select
                  value={selectedScannerVehicle?.id || ""}
                  onChange={(e) => {
                    const matched = vehicles.find(v => v.id === e.target.value);
                    if (matched) setSelectedScannerVehicle(matched);
                  }}
                  className="w-full bg-slate-950 border border-white/10 p-2.5 text-xs rounded-xl focus:outline-none text-slate-100"
                >
                  <option value="">Choose scanner vehicle...</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>{v.brand} {v.model} - {v.year} (Odo: {v.mileage} km)</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={!selectedScannerVehicle}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 font-black text-slate-950 text-xs rounded-xl transition cursor-pointer"
              >
                Scan and confirm vehicle matching
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal 5: Report Wrong information coordinate */}
      {reportModalPin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setReportModalPin(null)}></div>
          <div className="glass rounded-3xl p-5 max-w-sm w-full relative z-10 space-y-4 shadow-2xl text-left">
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <div className="flex items-center gap-1.5 text-red-400 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 animate-bounce" />
                <span>Report Wrong Information</span>
              </div>
              <button onClick={() => setReportModalPin(null)} className="text-slate-400 hover:text-white cursor-pointerleading-tight">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Help keep drivers safe. Select what is incorrect about <strong>{reportModalPin.name}</strong> coordinate. Correct report awards +2 coins.
            </p>

            <form onSubmit={handleReportPin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] text-slate-500 block">Report Reason / Issue details</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-white/10 p-2 text-xs rounded-xl focus:outline-none text-slate-100"
                >
                  <option value="">Choose reason...</option>
                  <option value="Permanent closed shop">This shop is permanent closed</option>
                  <option value="Incorrect phone sequence">Phone number is incorrect/dead</option>
                  <option value="Coordinate placement mismatch">Wrong GPS location on the cambodia map</option>
                  <option value="Scam pricing lists">Overcharged or fake promotional posts</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-red-650 hover:bg-red-700 bg-red-500 text-slate-950 font-black text-xs rounded-xl transition cursor-pointer"
              >
                Confirm report
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Quick unique counter ID helper
const propsId = Math.floor(Math.random() * 888 + 100);
