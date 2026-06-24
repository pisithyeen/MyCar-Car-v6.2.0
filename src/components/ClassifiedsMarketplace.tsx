/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Tag,
  Gift,
  RefreshCw,
  Search,
  Plus,
  Compass,
  User,
  Shield,
  MessageCircle,
  ExternalLink,
  MapPin,
  AlertTriangle,
  ChevronRight,
  Info,
  DollarSign,
  Briefcase,
  Layers,
  Sparkles,
  CheckCircle,
  FileText,
  Clock,
  Navigation,
  ThumbsUp,
  SlidersHorizontal,
  X,
  Lock,
  Flame,
  ArrowRight
} from "lucide-react";
import { PartListing, PartOffer, PartReport, VehicleProfile, MaintenanceRecord } from "../types";
import MarketplaceDashboard from "./MarketplaceDashboard";
import MarketplaceCompare from "./MarketplaceCompare";
import MarketplaceDetail from "./MarketplaceDetail";

interface ClassifiedsMarketplaceProps {
  vehicles: VehicleProfile[];
  selectedVehicle: VehicleProfile | null;
  onRefreshData: () => void;
}

// Cambodia Marketplace adaptation lists
const CAMBODIA_PROVINCES = [
  "Phnom Penh",
  "Siem Reap",
  "Battambang",
  "Sihanoukville",
  "Kampot",
  "Kandal",
  "Kampong Cham",
  "Takeo",
  "Banteay Meanchey"
];

const SPARE_PART_CATEGORIES = [
  "Sell Car / Vehicle",
  "Sell Spare Parts",
  "Sell Vehicle Accessories",
  "Automotive Services",
  "Donate / Exchange Parts",
  "Looking to Buy",
  "Request Inspection",
  "Engine parts",
  "Transmission / gearbox",
  "Brake system",
  "Suspension",
  "Tire and wheel",
  "Battery",
  "EV battery / EV parts",
  "Body parts",
  "Lights",
  "Interior parts",
  "Electrical parts",
  "Air conditioning",
  "Audio / screen / camera",
  "Accessories",
  "Motorcycle parts",
  "Truck parts",
  "Classic / rare car parts",
  "Damaged parts for repair",
  "Free donation parts",
  "Looking for parts"
];

const BRANDS_LIST = [
  "Toyota",
  "Lexus",
  "Mazda",
  "Ford",
  "Jeep",
  "Hyundai",
  "Kia",
  "Mitsubishi",
  "Honda",
  "Other"
];

export default function ClassifiedsMarketplace({ vehicles, selectedVehicle, onRefreshData }: ClassifiedsMarketplaceProps) {
  // Navigation active components
  const [subTab, setSubTab] = useState<'feed' | 'my-listings' | 'admin-reports' | 'seller-dashboard' | 'compare'>('feed');

  // Unified Extra states
  const [isVehicleSelling, setIsVehicleSelling] = useState(false);
  const [selectedVehicleObj, setSelectedVehicleObj] = useState<VehicleProfile | null>(null);
  const [vehiclesToCompare, setVehiclesToCompare] = useState<PartListing[]>([]);
  const [savedListingsIds, setSavedListingsIds] = useState<string[]>([]);
  const [careCoinsBalance, setCareCoinsBalance] = useState<number>(180);

  // New specific form state variables for Selling Vehicle
  const [reasonForSelling, setReasonForSelling] = useState("");
  const [accidentHistory, setAccidentHistory] = useState("No major accident declared");
  const [floodHistory, setFloodHistory] = useState("No flood history declared");
  const [ownershipDocStatus, setOwnershipDocStatus] = useState("Tax Paper Ready");
  const [loanStatus, setLoanStatus] = useState("No active loan / Paid off");
  const [warrantyStatus, setWarrantyStatus] = useState("No warranty");
  const [inspectionAvailability, setInspectionAvailability] = useState(true);
  const [healthScore, setHealthScore] = useState(94);

  // Prefill vehicle event listener hook
  useEffect(() => {
    const handlePrefill = (e: Event) => {
      const vehicle = (e as CustomEvent).detail;
      if (vehicle) {
        setPostTitle(`Selling ${vehicle.year} ${vehicle.brand} ${vehicle.model} - Clean Setup`);
        setPostDescription(`Registered ${vehicle.brand} ${vehicle.model} with ${vehicle.mileage?.toLocaleString() || "82,000"} km logged. Includes verified maintenance logbooks directly inside the Cambodia MyCar platform.`);
        setPostPrice(vehicle.purchasePrice ? String(Math.round(vehicle.purchasePrice * 0.75)) : "17500");
        setPostBrand(vehicle.brand);
        setPostModel(vehicle.model);
        setPostYearRange(String(vehicle.year));
        setPostEngineType(vehicle.engineType || "2.5L Gas");
        setPostCondition("Used");
        setPostCategory("Sell Car / Vehicle");
        setPostTypeSelected("Sell");
        setIsVehicleSelling(true);
        setSelectedVehicleObj(vehicle);
        setReasonForSelling("Upgrading to secondary electric utility.");
        setAccidentHistory("No major chassis damage declared.");
        setFloodHistory("No flood/monsoon history recorded.");
        setOwnershipDocStatus("Tax Paper & Plate Card Available");
        setLoanStatus("Paid off entirely");
        setWarrantyStatus("12-month Engine Guarantee");
        setInspectionAvailability(true);
        setHealthScore(vehicle.weaknessReport?.score || 94);
        setSubTab('feed');
        setShowPostModal(true);
      }
    };

    window.addEventListener("sellVehiclePreFill", handlePrefill);

    if ((window as any).__sellVehiclePreFill) {
      const v = (window as any).__sellVehiclePreFill;
      delete (window as any).__sellVehiclePreFill;
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("sellVehiclePreFill", { detail: v }));
      }, 150);
    }

    return () => {
      window.removeEventListener("sellVehiclePreFill", handlePrefill);
    };
  }, []);

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterPostType, setFilterPostType] = useState("");
  const [filterCondition, setFilterCondition] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterSellerType, setFilterSellerType] = useState("");
  const [filterBrand, setFilterBrand] = useState("");
  const [maxPriceRange, setMaxPriceRange] = useState<number>(500);

  // Backend state
  const [listings, setListings] = useState<PartListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Selected detail drawers
  const [activeListing, setActiveListing] = useState<PartListing | null>(null);
  const [activeListingOffers, setActiveListingOffers] = useState<PartOffer[]>([]);
  
  // Add Offer Form state
  const [offerType, setOfferType] = useState<'Buy For Cash' | 'Propose Exchange' | 'Request Donation'>('Buy For Cash');
  const [offerValue, setOfferValue] = useState<string>("");
  const [offerExchangeDetails, setOfferExchangeDetails] = useState("");
  const [offerNotes, setOfferNotes] = useState("");
  const [offerContactName, setOfferContactName] = useState("");
  const [offerContactPhone, setOfferContactPhone] = useState("");
  const [offerContactTelegram, setOfferContactTelegram] = useState("");
  const [submittedOfferSuccess, setSubmittedOfferSuccess] = useState(false);

  // Post Listing Uploaded Media State
  const [postPhotos, setPostPhotos] = useState<string[]>([]);
  const [postVideos, setPostVideos] = useState<string[]>([]);

  // Discussion & Comments State
  const [commentAuthor, setCommentAuthor] = useState("Yeon Pisith");
  const [commentContent, setCommentContent] = useState("");
  const [commentPhoto, setCommentPhoto] = useState<string>("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Post Listing Forms State
  const [showPostModal, setShowPostModal] = useState(false);
  const [postTitle, setPostTitle] = useState("");
  const [postDescription, setPostDescription] = useState("");
  const [postTypeSelected, setPostTypeSelected] = useState<'Sell' | 'Donate' | 'Exchange' | 'Cash Exchange' | 'Looking for' | 'Garage Stock'>('Sell');
  const [postCategory, setPostCategory] = useState("Engine parts");
  const [postBrand, setPostBrand] = useState("Toyota");
  const [postModel, setPostModel] = useState("");
  const [postYearRange, setPostYearRange] = useState("");
  const [postEngineType, setPostEngineType] = useState("");
  const [postCondition, setPostCondition] = useState<'New' | 'Used' | 'Refurbished' | 'Damaged'>('Used');
  const [postPrice, setPostPrice] = useState("");
  const [postNegotiable, setPostNegotiable] = useState(true);
  const [postExchangeDetails, setPostExchangeDetails] = useState("");
  const [postLocation, setPostLocation] = useState("Phnom Penh");
  const [postContactTelegram, setPostContactTelegram] = useState("");
  const [postContactPhone, setPostContactPhone] = useState("");
  const [postSellerType, setPostSellerType] = useState<'Owner' | 'Garage' | 'Spare Part Shop' | 'Mechanic' | 'Supplier'>('Owner');
  const [requiredProofPhoto, setRequiredProofPhoto] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiAdMessage, setAiAdMessage] = useState("");

  // Report Modal state
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState<'Fake Part / Counterfeit' | 'Stolen Part Suspected' | 'Scam / Inaccurate Price' | 'Wrong Category or Spam'>('Fake Part / Counterfeit');
  const [reportComments, setReportComments] = useState("");
  const [reportedListingId, setReportedListingId] = useState("");
  const [reportSuccess, setReportSuccess] = useState(false);

  // Maintenance log generation upon offer acceptance
  const [saveToHistory, setSaveToHistory] = useState(true);
  const [selectedGarageFitment, setSelectedGarageFitment] = useState("Apsara Auto Repair & Diagnostic Center");
  const [garageCostFitment, setGarageCostFitment] = useState("15");

  // Admin section reports
  const [adminReports, setAdminReports] = useState<PartReport[]>([]);

  // Monetization visual helpers
  const [boosterSuccessId, setBoosterSuccessId] = useState("");

  // Load listings from server
  useEffect(() => {
    fetchListings();
    if (subTab === 'admin-reports') {
      fetchAdminReports();
    }
  }, [subTab, filterCategory, filterPostType, filterCondition, filterLocation, filterSellerType, filterBrand, searchQuery, maxPriceRange]);

  const fetchListings = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (searchQuery) queryParams.append("search", searchQuery);
      if (filterCategory) queryParams.append("category", filterCategory);
      if (filterPostType) queryParams.append("postType", filterPostType);
      if (filterCondition) queryParams.append("condition", filterCondition);
      if (filterLocation) queryParams.append("location", filterLocation);
      if (filterSellerType) queryParams.append("sellerType", filterSellerType);
      if (filterBrand) queryParams.append("brand", filterBrand);
      if (maxPriceRange < 1000) queryParams.append("maxPrice", String(maxPriceRange));

      const res = await fetch(`/api/classifieds/listings?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setListings(data);
      }
    } catch (e) {
      console.error("Listings load failure:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAdminReports = async () => {
    try {
      const res = await fetch("/api/classifieds/reports");
      if (res.ok) {
        const data = await res.json();
        setAdminReports(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Dashboard operations
  const handleBoostListingByCoins = (id: string, packageType: string) => {
    setListings(prev => prev.map(l => l.id === id ? { ...l, isBoosted: true } : l));
    setCareCoinsBalance(prev => Math.max(0, prev - (packageType.includes("Featured") ? 50 : packageType.includes("Premium") ? 30 : 15)));
  };

  const handleUpdateListingStatus = (id: string, newStatus: 'Active' | 'Sold' | 'Draft' | 'Suspended') => {
    setListings(prev => prev.map(l => l.id === id ? { ...l, status: newStatus as any } : l));
  };

  const handshakedOwnershipTransfer = (id: string, recipient: string) => {
    // Owner is transferring vehicle
    setListings(prev => prev.filter(l => l.id !== id));
    alert(`Handshake ownership keys generated! Complete Transfer record recorded in operations database. The next owner (${recipient}) now gains editing keys.`);
  };

  const handleToggleCompare = (item: PartListing | string) => {
    const id = typeof item === "string" ? item : item.id;
    if (vehiclesToCompare.some(v => v.id === id)) {
      setVehiclesToCompare(prev => prev.filter(v => v.id !== id));
    } else {
      if (typeof item === "string") return;
      if (vehiclesToCompare.length >= 4) {
        alert("Maximum comparison model threshold reached. You can compare up to 4 vehicles.");
        return;
      }
      setVehiclesToCompare(prev => [...prev, item]);
    }
  };

  const handleToggleSaveListing = (id: string) => {
    if (savedListingsIds.includes(id)) {
      setSavedListingsIds(prev => prev.filter(savedId => savedId !== id));
    } else {
      setSavedListingsIds(prev => [...prev, id]);
    }
  };

  // Auto trigger dynamic filter matching user profile vehicle if available
  const applyMyVehicleFilter = () => {
    if (selectedVehicle) {
      setFilterBrand(selectedVehicle.brand);
      setSearchQuery(selectedVehicle.model);
    }
  };

  // Handles displaying individual listing details + fetching its offers
  const handleViewListingDetails = async (listing: PartListing) => {
    setActiveListing(listing);
    setSubmittedOfferSuccess(false);
    // Reset Form values
    setOfferValue(listing.price ? String(listing.price) : "");
    setOfferNotes("");
    setOfferExchangeDetails("");
    setOfferType(listing.postType === 'Donate' ? 'Request Donation' : listing.postType === 'Exchange' ? 'Propose Exchange' : 'Buy For Cash');

    try {
      // Record visit / view count
      const viewRes = await fetch(`/api/classifieds/listings/${listing.id}`);
      if (viewRes.ok) {
        const updated = await viewRes.json();
        setActiveListing(updated);
      }
      
      // Fetch current offers
      const res = await fetch(`/api/classifieds/listings/${listing.id}/offers`);
      if (res.ok) {
        const data = await res.json();
        setActiveListingOffers(data);
      }
    } catch (e) {
      console.error("Offer fetch fail:", e);
    }
  };

  // Submit classified listing to backend
  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title: postTitle,
        description: postDescription,
        postType: postTypeSelected,
        category: postCategory,
        vehicleBrand: postBrand,
        vehicleModel: postModel || "General",
        yearRange: postYearRange || "Any",
        engineType: postEngineType,
        condition: postCondition,
        price: postTypeSelected === 'Donate' ? 0 : Number(postPrice) || 0,
        negotiable: postNegotiable,
        donationOption: postTypeSelected === 'Donate',
        exchangeOption: postTypeSelected === 'Exchange' || postTypeSelected === 'Cash Exchange',
        exchangeDetails: postExchangeDetails,
        location: postLocation,
        photos: postPhotos.length > 0 ? postPhotos : ["https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=600"],
        videos: postVideos,
        contactName: "Yeon Pisith", // Mapped user logged-in
        contactPhone: postContactPhone || "+855 12 345 678",
        contactTelegram: postContactTelegram || "@pi_sith_kh",
        sellerType: postSellerType,
        requiredProofPhotoUpload: requiredProofPhoto,

        // New vehicle metadata attributes!
        isVehicleSellingPost: isVehicleSelling,
        vehicleYear: selectedVehicleObj ? selectedVehicleObj.year : (Number(postYearRange) || 2015),
        fuelType: selectedVehicleObj ? selectedVehicleObj.fuelType : "Gasoline",
        transmission: selectedVehicleObj ? selectedVehicleObj.transmission : "Automatic",
        mileage: selectedVehicleObj ? selectedVehicleObj.mileage : 82000,
        color: selectedVehicleObj ? "Platinum Slate" : "Slate",
        reasonForSelling: reasonForSelling || "Upgrading to secondary electric utility.",
        accidentHistory: accidentHistory || "No major chassis damage declared.",
        floodHistory: floodHistory || "No flood/monsoon history recorded.",
        ownershipDocStatus: ownershipDocStatus || "Tax Paper & Plate Card Available",
        loanStatus: loanStatus || "Paid off entirely",
        warrantyStatus: warrantyStatus || "12-month Engine Guarantee",
        inspectionAvailability,
        healthScore
      };

      const res = await fetch("/api/classifieds/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setShowPostModal(false);
        // Clear forms
        setPostTitle("");
        setPostDescription("");
        setPostModel("");
        setPostYearRange("");
        setPostEngineType("");
        setPostPrice("");
        setPostExchangeDetails("");
        setPostContactTelegram("");
        setPostContactPhone("");
        setPostPhotos([]);
        setPostVideos([]);
        onRefreshData();
        fetchListings();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // AI Generation Advice (Gemini Client Proxy)
  const handleTriggerAiAdvice = async () => {
    if (!postTitle) {
      alert("Please key in a part keyword (e.g. 'Tacoma Starter', 'Prius Radiator') first!");
      return;
    }
    setIsGeneratingAi(true);
    setAiAdMessage("");
    try {
      const res = await fetch("/api/classifieds/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seedTitle: postTitle,
          brand: postBrand,
          model: postModel || "General",
          condition: postCondition
        })
      });

      if (res.ok) {
        const data = await res.json();
        setPostTitle(data.aiTitle);
        setPostDescription(data.aiDescription);
        setAiAdMessage("✨ AI generated search-optimized title and description. Tailored for Cambodia!");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Submit negotiation offer (Cash bid or Swap)
  const handleSubmitOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeListing) return;

    try {
      const payload = {
        offerType,
        amount: offerType === 'Buy For Cash' ? Number(offerValue) : undefined,
        exchangeDetails: offerType === 'Propose Exchange' ? offerExchangeDetails : undefined,
        contactName: offerContactName || "Yeon Pisith",
        contactPhone: offerContactPhone || "+855 12 345 678",
        contactTelegram: offerContactTelegram,
        notes: offerNotes
      };

      const res = await fetch(`/api/classifieds/listings/${activeListing.id}/offers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSubmittedOfferSuccess(true);
        // Re-get list of offers
        const offersRes = await fetch(`/api/classifieds/listings/${activeListing.id}/offers`);
        if (offersRes.ok) {
          const list = await offersRes.json();
          setActiveListingOffers(list);
        }
        onRefreshData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Accept a Specific offer & Close the deal Cascade
  const handleAcceptOffer = async (offer: PartOffer) => {
    if (!activeListing) return;
    const confirmAccept = window.confirm(`Accept this offer from ${offer.contactName}? This will mark your item "${activeListing.title}" as Sold/Exchanged/Donated.`);
    if (!confirmAccept) return;

    try {
      const res = await fetch(`/api/classifieds/listings/${activeListing.id}/offers/${offer.id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: 'Accepted',
          saveToHistory,
          serviceGarage: selectedGarageFitment,
          serviceCost: Number(garageCostFitment)
        })
      });

      if (res.ok) {
        // Refresh detail view
        const detailRes = await fetch(`/api/classifieds/listings/${activeListing.id}`);
        if (detailRes.ok) {
          const updated = await detailRes.json();
          setActiveListing(updated);
        }
        
        // Refresh offers
        const offersRes = await fetch(`/api/classifieds/listings/${activeListing.id}/offers`);
        if (offersRes.ok) {
          const updatedOffers = await offersRes.json();
          setActiveListingOffers(updatedOffers);
        }

        alert("Deal officially completed and archived! Auto logged to MyCar Active Maintenance records.");
        onRefreshData();
        fetchListings();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Declin offer
  const handleDeclineOffer = async (offer: PartOffer) => {
    if (!activeListing) return;
    try {
      const res = await fetch(`/api/classifieds/listings/${activeListing.id}/offers/${offer.id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: 'Declined' })
      });

      if (res.ok) {
        // Refresh offers
        const offersRes = await fetch(`/api/classifieds/listings/${activeListing.id}/offers`);
        if (offersRes.ok) {
          const updatedOffers = await offersRes.json();
          setActiveListingOffers(updatedOffers);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Flags listing as FAKE/STOLEN for Moderator Panel Integration
  const handleReportListingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportedListingId) return;

    try {
      const res = await fetch(`/api/classifieds/listings/${reportedListingId}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: reportReason,
          comments: reportComments,
          reporterName: "Community Monitor (Yeon Pisith)",
          reporterPhone: "+855 12 345 678"
        })
      });

      if (res.ok) {
        setReportSuccess(true);
        setTimeout(() => {
          setShowReportModal(false);
          setReportSuccess(false);
          setReportComments("");
        }, 2000);
        fetchListings();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Admin Panel Actions (SUSPEND/DISMISS)
  const handleAdminActOnReport = async (reportId: string, action: 'SUSPEND' | 'DISMISS') => {
    try {
      const res = await fetch(`/api/classifieds/reports/${reportId}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      });

      if (res.ok) {
        alert(`Admin action: listing status changed proportionally.`);
        fetchAdminReports();
        fetchListings();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Listing Boost Trigger
  const handleQuickBoost = async (listingId: string) => {
    try {
      const res = await fetch(`/api/classifieds/listings/${listingId}/boost`, {
        method: "POST"
      });
      if (res.ok) {
        setBoosterSuccessId(listingId);
        setTimeout(() => setBoosterSuccessId(""), 3000);
        fetchListings();
        if (activeListing && activeListing.id === listingId) {
          const update = await res.json();
          setActiveListing(update.listing);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div id="parts-marketplace-root" className="bg-slate-900 border border-white/5 rounded-3xl p-6 text-slate-100 shadow-2xl overflow-hidden">
      
      {/* Visual Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-5 mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/15 uppercase tracking-wider">
              MyCar Marketplace Cambodia
            </span>
            <span className="bg-amber-500/10 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/15 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 animate-pulse" /> Verified Postings
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Compass className="w-6 h-6 text-emerald-400 shrink-0" /> Automobile Marketplace & Service Deck
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Rent or sell vehicles with verified service history, discover spare parts, find accessories, trade auto services, or schedule pre-purchase mechanic inspections.
          </p>
        </div>

        {/* Action Toggles */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setSubTab('feed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
              subTab === 'feed'
                ? "bg-emerald-500 text-slate-950 border-emerald-400"
                : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
            }`}
          >
            Market Feed
          </button>

          <button
            onClick={() => setSubTab('seller-dashboard')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center gap-1 cursor-pointer ${
              subTab === 'seller-dashboard'
                ? "bg-amber-400 text-slate-950 border-amber-300"
                : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> Seller Terminal
          </button>

          <button
            onClick={() => setSubTab('compare')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center gap-1 cursor-pointer ${
              subTab === 'compare'
                ? "bg-sky-500 text-white border-sky-450"
                : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
            }`}
          >
            ⚖ Compare List ({vehiclesToCompare.length})
          </button>
          
          <button
            onClick={() => setSubTab('admin-reports')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center gap-1 cursor-pointer ${
              subTab === 'admin-reports'
                ? "bg-red-500/10 text-red-300 border-red-500/20"
                : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
            }`}
          >
            <Shield className="w-3.5 h-3.5" /> Moderation
          </button>

          <button
            onClick={() => {
              setIsVehicleSelling(false);
              setPostCategory("Sell Spare Parts");
              setShowPostModal(true);
            }}
            className="bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-bold px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1 transition shadow-lg shadow-emerald-500/10 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Post Item
          </button>
        </div>
      </div>

      {/* Monetization / Boost Pitch banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 bg-gradient-to-r from-slate-950 to-slate-900 border border-white/5 rounded-2xl p-4 mb-6 shadow-sm gap-4 items-center">
        <div className="lg:col-span-2 flex items-start gap-3">
          <div className="bg-amber-400/10 p-2.5 rounded-xl border border-amber-400/20 text-amber-400 shrink-0">
            <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              🚀 Pro Bundle: Boost Your Parts Listing (Khmer24 Equivalent Ads)
            </h4>
            <p className="text-[11px] text-slate-400 mt-1">
              Get 8x views by boosting your items. Prominently featured on Cambodia's home search screen and sent matching recommendations to nearby garages! Only $2 per boost.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2 text-[10px]">
          <span className="text-slate-400 self-center">Free level: 2 lists/month</span>
          <button id="trial-pro-boost" className="bg-slate-800 text-slate-200 border border-slate-700 hover:border-slate-500 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer">
            Explore Pro Packages
          </button>
        </div>
      </div>

      {subTab === 'admin-reports' ? (
        /* =================== MODERATION & SAFETY PANEL =================== */
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-1 text-red-400">
              <Shield className="w-4 h-4" /> Safety Monitor & Fraud Dashboard
            </h3>
            <button
              onClick={() => setSubTab('feed')}
              className="text-slate-400 hover:text-white text-xs flex items-center gap-1 cursor-pointer"
            >
              Back to Marketplace Feed <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-950 p-3.5 rounded-xl border border-white/5">
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Flagged Listings</span>
              <span className="text-xl font-bold text-white block mt-0.5">{adminReports.length}</span>
            </div>
            <div className="bg-slate-950 p-3.5 rounded-xl border border-white/5">
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Counterfeit Warnings</span>
              <span className="text-xl font-bold text-white block mt-0.5">
                {adminReports.filter(r => r.reason === 'Fake Part / Counterfeit').length}
              </span>
            </div>
            <div className="bg-slate-950 p-3.5 rounded-xl border border-white/5">
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Stolen Parts Flagged</span>
              <span className="text-xl font-bold text-yellow-400 block mt-0.5">
                {adminReports.filter(r => r.reason === 'Stolen Part Suspected').length}
              </span>
            </div>
            <div className="bg-slate-950 p-3.5 rounded-xl border border-white/5">
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Moderation Policy</span>
              <span className="text-[10px] text-emerald-400 block mt-1.5 font-medium">Automatic OCR Audit Active</span>
            </div>
          </div>

          {adminReports.length === 0 ? (
            <div className="bg-slate-950 border border-slate-800/60 rounded-xl p-8 text-center">
              <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-xs text-slate-300 font-medium">Trust Core Clear</p>
              <p className="text-[11px] text-slate-500 mt-0.5">No suspicious listing reports submitted yet by Cambodia drivers.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {adminReports.map(report => (
                <div key={report.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="bg-red-500/10 text-red-300 text-[10px] uppercase font-bold px-2 py-0.5 rounded border border-red-500/25">
                        {report.reason}
                      </span>
                      <span className="text-xs text-slate-400">Report #{report.id}</span>
                    </div>
                    <h5 className="text-sm font-bold text-white mt-1">Listing: "{report.listingTitle}"</h5>
                    <p className="text-xs text-slate-300 font-mono">Reporter: {report.reporterName} ({report.reporterPhone})</p>
                    <p className="text-xs text-slate-400 italic">" {report.comments} "</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleAdminActOnReport(report.id, 'DISMISS')}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg border border-slate-700 transition cursor-pointer"
                    >
                      Dismiss Report
                    </button>
                    <button
                      onClick={() => handleAdminActOnReport(report.id, 'SUSPEND')}
                      className="bg-red-600 hover:bg-red-500 text-white text-xs px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" /> Suspend Listing
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : subTab === 'seller-dashboard' ? (
        <MarketplaceDashboard
          listings={listings}
          careCoinsBalance={careCoinsBalance}
          onBoostListing={handleBoostListingByCoins}
          onUpdateStatus={handleUpdateListingStatus}
          onTransferOwnership={handshakedOwnershipTransfer}
        />
      ) : subTab === 'compare' ? (
        <MarketplaceCompare
          vehiclesToCompare={vehiclesToCompare}
          onRemoveFromCompare={handleToggleCompare}
          onCloseCompare={() => setSubTab('feed')}
        />
      ) : (
        /* =================== MARKETPLACE FEED =================== */
        <div>
          {/* Diagnostic Auto Matching Quick Trigger (if user has vehicle) */}
          {selectedVehicle && (
            <div className="bg-slate-950/80 border border-emerald-500/20 rounded-2xl p-3.5 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-start gap-2.5">
                <span className="bg-emerald-500/10 p-2 rounded-xl text-emerald-400 border border-emerald-500/15 text-xs">
                  🚗 Mapped Profile
                </span>
                <div>
                  <h4 className="text-xs font-bold text-white">
                    Show parts that match my active {selectedVehicle.brand} {selectedVehicle.model}?
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    Our AI filter matches specifications based on the compatibility catalogs.
                  </p>
                </div>
              </div>
              <button
                onClick={applyMyVehicleFilter}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-3 py-1.5 rounded-lg transition shrink-0 cursor-pointer"
              >
                Match {selectedVehicle.brand} {selectedVehicle.model}
              </button>
            </div>
          )}

          {/* Search Inputs and Multi Selection Controls */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
              {/* Keyword Search */}
              <div className="md:col-span-2 relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search item, vehicle model, OEM serial number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-slate-700 text-white placeholder-slate-500"
                />
              </div>

              {/* Category Filter */}
              <div>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-slate-700 text-slate-300"
                >
                  <option value="">Category (All)</option>
                  {SPARE_PART_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Location/Province */}
              <div>
                <select
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-slate-700 text-slate-300"
                >
                  <option value="">Province / City (All)</option>
                  {CAMBODIA_PROVINCES.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Minor Filters Rollout */}
            <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-900 text-xs">
              
              {/* Post Type Selector */}
              <div className="flex items-center gap-1 bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800">
                <span className="text-slate-500">Form:</span>
                <select
                  value={filterPostType}
                  onChange={(e) => setFilterPostType(e.target.value)}
                  className="bg-transparent text-slate-300 focus:outline-none"
                >
                  <option value="">All Posts</option>
                  <option value="Sell">Sell</option>
                  <option value="Donate">Donation</option>
                  <option value="Exchange">Barter Swap</option>
                  <option value="Looking for">Requests</option>
                  <option value="Garage Stock">Garage Stock</option>
                </select>
              </div>

              {/* Condition */}
              <div className="flex items-center gap-1 bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800">
                <span className="text-slate-500">Condition:</span>
                <select
                  value={filterCondition}
                  onChange={(e) => setFilterCondition(e.target.value)}
                  className="bg-transparent text-slate-300 focus:outline-none"
                >
                  <option value="">Any</option>
                  <option value="New">Brand New</option>
                  <option value="Used">Used</option>
                  <option value="Refurbished">Refurbished</option>
                  <option value="Damaged">As-Is / Defective</option>
                </select>
              </div>

              {/* Vehicle Brand */}
              <div className="flex items-center gap-1 bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800">
                <span className="text-slate-500">Brand:</span>
                <select
                  value={filterBrand}
                  onChange={(e) => setFilterBrand(e.target.value)}
                  className="bg-transparent text-slate-300 focus:outline-none"
                >
                  <option value="">Any Brand</option>
                  {BRANDS_LIST.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              {/* Price filter */}
              <div className="flex items-center gap-2.5 scale-95 origin-left">
                <span className="text-slate-500 whitespace-nowrap">Max budget:</span>
                <input
                  type="range"
                  min="10"
                  max="1000"
                  step="20"
                  value={maxPriceRange}
                  onChange={(e) => setMaxPriceRange(Number(e.target.value))}
                  className="w-24 accent-emerald-500"
                />
                <span className="text-emerald-400 font-bold font-mono text-[11px]">
                  {maxPriceRange === 1000 ? "Any Price" : `$${maxPriceRange}`}
                </span>
              </div>

              {/* Reset button */}
              {(searchQuery || filterCategory || filterPostType || filterCondition || filterLocation || filterSellerType || filterBrand || maxPriceRange < 1000) && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setFilterCategory("");
                    setFilterPostType("");
                    setFilterCondition("");
                    setFilterLocation("");
                    setFilterSellerType("");
                    setFilterBrand("");
                    setMaxPriceRange(1000);
                  }}
                  className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer"
                >
                  Reset Settings
                </button>
              )}
            </div>
          </div>

          {/* Listings List */}
          {isLoading ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Loading active Classified marketplace listings...
            </div>
          ) : listings.length === 0 ? (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl py-14 px-4 text-center">
              <Layers className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-xs font-bold text-white mb-1">No matching spare parts listing ads</p>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                No spare parts currently perfectly match the filter options. Try adjusting provinces, looking up Tacoma or Prius components, or reset conditions.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {listings.map((listing) => {
                const badgeColor =
                  listing.postType === 'Donate'
                    ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                    : listing.postType === 'Exchange' || listing.postType === 'Cash Exchange'
                    ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                    : listing.postType === 'Looking for'
                    ? "bg-amber-400/10 text-amber-400 border-amber-400/20"
                    : listing.postType === 'Garage Stock'
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-teal-500/10 text-teal-300 border-teal-500/20";

                return (
                  <div
                    key={listing.id}
                    className={`relative rounded-2xl p-4.5 bg-slate-950 border transition flex flex-col justify-between ${
                      listing.isBoosted
                        ? "border-amber-400/40 shadow-[0_0_12px_rgba(245,158,11,0.08)] bg-gradient-to-br from-slate-950 to-amber-950/20"
                        : "border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    {/* Header line on card and content flex columns */}
                    <div className="flex flex-col sm:flex-row gap-4 items-start w-full">
                      {/* Left thumbnail column */}
                      <div className="w-full sm:w-28 h-28 shrink-0 rounded-xl overflow-hidden border border-slate-800 bg-slate-900 relative">
                        <img
                          src={(listing.photos && listing.photos.length > 0) ? listing.photos[0] : "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=400"}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        {listing.videos && listing.videos.length > 0 && (
                          <span className="absolute bottom-1 right-1 bg-slate-950/90 border border-white/10 text-white text-[8px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            🎥 Video
                          </span>
                        )}
                      </div>

                      {/* Right info column */}
                      <div className="flex-1 min-w-0 w-full">
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className={`text-[9px] uppercase font-bold px-2 py-0.5 border rounded-md tracking-wider ${badgeColor}`}>
                              {listing.postType}
                            </span>
                            <span className="text-[9px] font-semibold px-2 py-0.5 bg-slate-900 border border-slate-800 text-slate-400 rounded-md">
                              {listing.condition}
                            </span>
                            {listing.isBoosted && (
                              <span className="bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-900 text-[9px] uppercase font-black px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                <Flame className="w-2.5 h-2.5 fill-slate-900" /> Boosted
                              </span>
                            )}
                            {listing.verifiedSeller && (
                              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 text-[9px] font-semibold px-1 rounded">
                                ✓ Verified
                              </span>
                            )}
                          </div>

                          {/* Price badge segment */}
                          <div className="text-right shrink-0">
                            {listing.postType === 'Donate' ? (
                              <span className="text-[11px] text-purple-400 font-extrabold block">FREE GIVEAWAY</span>
                            ) : (
                              <span className="text-sm text-yellow-400 font-black font-mono block">
                                ${listing.price} <span className="text-[9px] text-slate-500 font-normal">USD</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Main ad info block */}
                        <h3 className="text-xs font-bold text-slate-100 hover:text-white line-clamp-2 mt-1 min-h-[32px]">
                          {listing.title}
                        </h3>

                        {/* Description segment snippet */}
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 italic">
                          "{listing.description}"
                        </p>

                        {/* Details specs badge roll */}
                        <div className="flex flex-wrap items-center mt-3 gap-y-1 gap-x-2 text-[10px] text-slate-400">
                          {listing.isVehicleSellingPost && (
                            <span className="flex items-center gap-1 bg-amber-500/15 text-amber-300 px-2 py-0.5 border border-amber-500/20 rounded-md text-[9px] font-black uppercase">
                              🚗 Registered Vehicle
                            </span>
                          )}
                          <span className="flex items-center gap-1 bg-slate-900 px-1.5 py-0.5 border border-slate-800 rounded text-slate-300">
                            <Compass className="w-3 h-3 text-emerald-500" /> {listing.vehicleBrand} {listing.vehicleModel}
                          </span>
                          <span className="text-[9px] text-slate-500">( {listing.yearRange === "Any" && listing.vehicleYear ? listing.vehicleYear : listing.yearRange} )</span>
                          <span className="text-slate-500">|</span>
                          <span className="flex items-center gap-0.5">
                            <MapPin className="w-3 h-3 text-red-400" /> {listing.location}
                          </span>
                          {listing.mileage && (
                            <>
                              <span className="text-slate-500">•</span>
                              <span className="font-semibold text-slate-350">{listing.mileage.toLocaleString()} km</span>
                            </>
                          )}
                          {listing.healthScore && (
                            <>
                              <span className="text-slate-500">•</span>
                              <span className="bg-emerald-500/10 text-emerald-400 px-1.5 py-0.2 rounded text-[9px] font-mono border border-emerald-500/20">
                                Health: {listing.healthScore}%
                              </span>
                            </>
                          )}
                          <span className="text-slate-500">•</span>
                          <span>Views: {listing.views}</span>
                        </div>

                        {/* AI Advisor Assistant Insight Preview */}
                        <div className="mt-3.5 bg-slate-900/60 p-2.5 rounded-xl border border-white/5 text-[10.5px]">
                          <p className="text-slate-300 flex items-start gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-yellow-400 shrink-0 mt-0.5" />
                            <span>
                              <strong className="text-white">AI compatibility:</strong> {listing.aiCompatibilityComment || "Check with seller for precise chassis match."}
                            </span>
                          </p>
                          {listing.aiSuggestedPriceRange && (
                            <p className="text-[10px] text-slate-400 font-mono mt-1 pl-4.5">
                              Estimated Market Value: <span className="text-emerald-400 font-bold">{listing.aiSuggestedPriceRange}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bottom actionable footer */}
                    <div className="mt-4 pt-3.5 border-t border-slate-900 flex justify-between items-center gap-2">
                      <div className="flex items-center gap-2">
                        {listing.contactTelegram && (
                          <a
                            href={`https://t.me/${listing.contactTelegram.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="bg-sky-500/10 text-sky-400 border border-sky-500/20 p-1.5 rounded-lg hover:bg-sky-500/20 transition cursor-pointer"
                            title="Open Telegram Chat"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <span className="text-[10px] text-slate-500 font-mono block">
                          Seller: {listing.contactName}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleCompare(listing);
                          }}
                          className={`text-[10px] sm:px-2 py-1 px-1 rounded border transition font-semibold cursor-pointer ${
                            vehiclesToCompare.some(v => v.id === listing.id)
                              ? "bg-amber-400 text-slate-950 font-black border-amber-400 hover:bg-amber-500"
                              : "bg-slate-900 text-slate-350 hover:text-white border-slate-800 hover:bg-slate-850"
                          }`}
                        >
                          ⚖ {vehiclesToCompare.some(v => v.id === listing.id) ? "Remove Match" : "Compare"}
                        </button>

                        <button
                          onClick={() => {
                            setReportedListingId(listing.id);
                            setShowReportModal(true);
                          }}
                          className="text-[10px] hover:text-red-400 text-slate-500 transition px-2 py-1 bg-slate-900 hover:bg-red-500/5 rounded border border-slate-800 cursor-pointer"
                        >
                          Report Fake
                        </button>

                        <button
                          onClick={() => handleViewListingDetails(listing)}
                          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-1 rounded text-[10px] flex items-center gap-0.5 transition cursor-pointer"
                        >
                          View Details & Trade <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =================== OVERLAY: CHOOSE DETAIL CLASS DRAWER =================== */}
      <AnimatePresence>
        {activeListing && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <MarketplaceDetail
              listing={activeListing}
              onClose={() => setActiveListing(null)}
              onAddToCompare={handleToggleCompare}
              isSaved={savedListingsIds.includes(activeListing.id)}
              onToggleSave={() => handleToggleSaveListing(activeListing.id)}
            />
          </div>
        )}
        {false && activeListing && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto text-slate-200 shadow-2xl relative"
            >
              <button
                onClick={() => setActiveListing(null)}
                className="absolute right-4 top-4 text-slate-400 hover:text-white bg-slate-950 p-1.5 rounded-full border border-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-4">
                {/* Visual Category Label */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-slate-950 text-slate-300 border border-slate-800 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
                    {activeListing.category}
                  </span>
                  <span className="bg-teal-500/10 text-teal-400 border border-teal-500/15 px-2 py-0.5 rounded text-[10px] font-bold">
                    Seller: {activeListing.sellerType}
                  </span>
                  {activeListing.isBoosted && (
                    <span className="bg-amber-400/20 text-amber-400 border border-amber-400/30 px-2 py-0.5 rounded text-[10px] font-bold">
                      🔥 Top Sponsored Class
                    </span>
                  )}
                  {activeListing.requiredProofPhotoUpload && (
                    <span className="bg-red-500/10 text-red-400 border border-red-500/15 px-2 py-0 text-[9px] font-semibold">
                      Proof Upload Provided
                    </span>
                  )}
                </div>

                {/* Listing Title */}
                <div>
                  <h2 className="text-lg font-extrabold text-white leading-snug">
                    {activeListing.title}
                  </h2>
                  <div className="flex items-center gap-5 mt-1 text-xs text-slate-400">
                    <span className="flex items-center gap-1 font-semibold text-emerald-400">
                      <Tag className="w-3.5 h-3.5" /> Type: {activeListing.postType}
                    </span>
                    <span>|</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {activeListing.location}
                    </span>
                    <span>|</span>
                    <span>Views: {activeListing.views}</span>
                  </div>
                </div>

                {/* Media Showcase (Photos & Video) */}
                {((activeListing.photos && activeListing.photos.length > 0) || (activeListing.videos && activeListing.videos.length > 0)) && (
                  <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-white/5">
                    <h4 className="text-[10px] uppercase text-slate-450 font-bold tracking-wider text-slate-400">Listing Media Attachments</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Photos List */}
                      {activeListing.photos && activeListing.photos.length > 0 ? (
                        <div className="space-y-1.5 animate-fade-in">
                          <span className="text-[9px] text-slate-500 block uppercase font-mono font-bold">Photos ({activeListing.photos.length})</span>
                          <div className="grid grid-cols-2 gap-2 max-h-[160px] overflow-y-auto pr-1">
                            {activeListing.photos.map((item, idx) => (
                              <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-slate-800 bg-slate-950 group">
                                <img
                                  src={item}
                                  alt={`Listing Thumbnail ${idx + 1}`}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
                                />
                                <a
                                  href={item}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[9px] font-bold"
                                >
                                  Open Full Screen ↗
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-[10px] text-slate-500 italic flex items-center justify-center h-full">No photo uploaded</div>
                      )}

                      {/* Video Player Box */}
                      {activeListing.videos && activeListing.videos.length > 0 ? (
                        <div className="space-y-1.5">
                          <span className="text-[9px] text-slate-500 block uppercase font-mono font-bold">Video Demonstration ({activeListing.videos.length})</span>
                          <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
                            <video
                              src={activeListing.videos[0]}
                              className="w-full h-full object-cover"
                              controls
                              playsInline
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="text-[10px] text-slate-500 italic flex items-center justify-center border border-dashed border-slate-800 rounded-lg py-5">
                          No video demo attached
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Highlights Board Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-3.5 rounded-xl border border-white/5 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Brand compatibility</span>
                    <strong className="text-white font-semibold">{activeListing.vehicleBrand}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Target Model</span>
                    <strong className="text-white font-semibold">{activeListing.vehicleModel}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Year range</span>
                    <strong className="text-white font-semibold">{activeListing.yearRange}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Condition</span>
                    <strong className="text-white font-semibold text-yellow-400">{activeListing.condition}</strong>
                  </div>
                </div>

                {/* Price Display / Exchange Deal Criteria */}
                <div className="bg-slate-950/80 p-4 rounded-xl border border-emerald-500/15 flex justify-between items-center gap-4">
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 block">Offer details / Pricing Criteria</span>
                    {activeListing.postType === 'Donate' ? (
                      <span className="text-lg font-black text-purple-400">FREE GIVEAWAY</span>
                    ) : (
                      <span className="text-xl font-bold font-mono text-yellow-400">
                        ${activeListing.price} USD <span className="text-[10px] text-slate-500 font-normal">({activeListing.negotiable ? "Negotiable" : "Firm Price"})</span>
                      </span>
                    )}
                  </div>
                  
                  {/* Exchange detail parameters */}
                  {(activeListing.postType === 'Exchange' || activeListing.postType === 'Cash Exchange') && activeListing.exchangeDetails && (
                    <div className="text-right max-w-xs">
                      <span className="text-[10px] uppercase text-slate-400 block">Sought Swap Item</span>
                      <p className="text-[11px] text-blue-300 font-medium italic">"{activeListing.exchangeDetails}"</p>
                    </div>
                  )}
                </div>

                {/* Sub Description */}
                <div className="space-y-1">
                  <h4 className="text-xs uppercase text-slate-400 font-semibold">Listing Description</h4>
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-4.5 rounded-xl border border-slate-900 italic">
                    "{activeListing.description}"
                  </p>
                </div>

                {/* AI Safety Warnings and fitment advise */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-yellow-500/20 text-xs">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                    <h5 className="font-bold text-white">AI Technical Advisor Assessment</h5>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    <strong>Compatibility report:</strong> {activeListing.aiCompatibilityComment}
                  </p>
                  <p className="text-slate-400 text-[10px] mt-2 font-mono flex justify-between">
                    <span>Expected Cambodia Fair Market Pricing: <strong>{activeListing.aiSuggestedPriceRange}</strong></span>
                    <span className="text-emerald-400 text-[9px]">✓ Checked for counterfeit warning signals</span>
                  </p>
                </div>

                {/* Contact information adapter */}
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Contact & Telegram deep-links</h4>
                  <div className="flex flex-col sm:flex-row gap-3 text-xs justify-between">
                    <div>
                      <p className="text-white font-semibold flex items-center gap-1">
                        Seller: {activeListing.contactName}
                      </p>
                      <p className="text-slate-400 mt-1">Phone (Cambodia): <a href={`tel:${activeListing.contactPhone}`} className="text-emerald-400 font-bold hover:underline">{activeListing.contactPhone}</a></p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {activeListing.contactTelegram && (
                        <a
                          href={`https://t.me/${activeListing.contactTelegram.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-sky-500 hover:bg-sky-400 active:bg-sky-600 text-slate-950 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <MessageCircle className="w-3.5 h-3.5" /> Telegram chat
                        </a>
                      )}
                      
                      {/* Boost button for owner to boost inside detailing */}
                      <button
                        onClick={() => handleQuickBoost(activeListing.id)}
                        className={`px-3 py-1.5 rounded-lg font-extrabold flex items-center gap-1 text-[11px] transition cursor-pointer ${
                          activeListing.isBoosted
                            ? "bg-amber-400/10 text-amber-400 border border-amber-400/20 cursor-not-allowed"
                            : "bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 hover:border-slate-600"
                        }`}
                        disabled={activeListing.isBoosted}
                      >
                        <Flame className="w-3.5 h-3.5" /> {activeListing.isBoosted ? "Boosted" : "Boost Ad Now"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* =================== OFFERS / TRANSACTION FLOW PROPOSALS =================== */}
                <div className="border-t border-slate-800 pt-4 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-emerald-400" /> Marketplace Offers & Trade Requests ({activeListingOffers.length})
                  </h3>

                  {/* List existing offers */}
                  {activeListingOffers.length > 0 && (
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {activeListingOffers.map((offer) => (
                        <div key={offer.id} className="bg-slate-950 p-3 rounded-lg border border-slate-900 flex justify-between items-center text-xs">
                          <div>
                            <p className="text-white font-bold">
                              {offer.contactName} &mdash; <span className="text-slate-400">{offer.offerType}</span>
                            </p>
                            <p className="text-[11px] text-slate-300 mt-1">
                              Offer: {offer.offerType === 'Buy For Cash' ? (
                                <strong className="text-emerald-400 font-mono">${offer.amount} USD</strong>
                              ) : (
                                <span className="text-blue-300 italic">" {offer.exchangeDetails} "</span>
                              )}
                            </p>
                            {offer.notes && <p className="text-[10px] text-slate-500 mt-0.5">Notes: "{offer.notes}"</p>}
                            <p className="text-[9px] text-slate-500 mt-0.5 font-mono">Date: {new Date(offer.createdAt).toLocaleString()}</p>
                          </div>

                          <div className="space-y-1 text-right">
                            {offer.status === 'Pending' ? (
                              activeListing.status === 'Active' ? (
                                <div className="space-y-1">
                                  {/* Install configuration toggle option */}
                                  <div className="text-[10px] text-left mb-1.5 p-1 bg-slate-900 border border-slate-800 rounded">
                                    <label className="flex items-center gap-1 text-slate-400">
                                      <input
                                        type="checkbox"
                                        checked={saveToHistory}
                                        onChange={(e) => setSaveToHistory(e.target.checked)}
                                        className="accent-emerald-500 scale-90"
                                      />
                                      <span>Auto record installment logs?</span>
                                    </label>
                                  </div>
                                  <div className="flex gap-1 justify-end">
                                    <button
                                      onClick={() => handleAcceptOffer(offer)}
                                      className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer"
                                    >
                                      Accept
                                    </button>
                                    <button
                                      onClick={() => handleDeclineOffer(offer)}
                                      className="bg-slate-800 hover:bg-slate-700 text-slate-400 px-2.5 py-1 rounded text-[10px] cursor-pointer"
                                    >
                                      Decline
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-[10px] text-slate-500 bg-slate-900 px-2 py-0.5 rounded">Listing closed</span>
                              )
                            ) : (
                              <span className={`text-[10px] px-2.5 py-1 rounded uppercase font-bold text-[9px] ${
                                offer.status === 'Accepted' ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                              }`}>
                                {offer.status}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Create offer if active */}
                  {activeListing.status === 'Active' ? (
                    submittedOfferSuccess ? (
                      <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-center text-xs text-emerald-400">
                        🤝 Proposal submitted successfully! The seller sokh_kheng has been notified on Telegram chat.
                      </div>
                    ) : (
                      <form onSubmit={handleSubmitOffer} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3.5">
                        <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                          <h4 className="text-[11px] uppercase font-bold text-white">Negotiate / Propose transaction</h4>
                          <span className="text-[10px] text-slate-400 font-mono">Quick P2P escrow</span>
                        </div>

                        {/* Offer Type Selector */}
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-1">Proposal Method</label>
                          <div className="grid grid-cols-3 gap-2">
                            <button
                              type="button"
                              onClick={() => setOfferType('Buy For Cash')}
                              className={`py-1.5 rounded-lg text-xs font-semibold border transition ${
                                offerType === 'Buy For Cash'
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                  : "bg-slate-900 text-slate-400 border-slate-800"
                              }`}
                            >
                              💸 Cash buy
                            </button>
                            <button
                              type="button"
                              onClick={() => setOfferType('Propose Exchange')}
                              className={`py-1.5 rounded-lg text-xs font-semibold border transition ${
                                offerType === 'Propose Exchange'
                                  ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                  : "bg-slate-900 text-slate-400 border-slate-800"
                              }`}
                            >
                              🔄 Swap Item
                            </button>
                            <button
                              type="button"
                              onClick={() => setOfferType('Request Donation')}
                              className={`py-1.5 rounded-lg text-xs font-semibold border transition ${
                                offerType === 'Request Donation'
                                  ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                                  : "bg-slate-900 text-slate-400 border-slate-800"
                              }`}
                              disabled={activeListing.postType !== 'Donate'}
                            >
                              🎁 Ask free
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Value Input */}
                          {offerType === 'Buy For Cash' ? (
                            <div>
                              <label className="text-[10px] text-slate-400 block mb-1">Proposed cash offer ($ USD)</label>
                              <input
                                type="number"
                                value={offerValue}
                                onChange={(e) => setOfferValue(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                                required
                              />
                            </div>
                          ) : offerType === 'Propose Exchange' ? (
                            <div className="sm:col-span-2">
                              <label className="text-[10px] text-slate-400 block mb-1">What item/service are you trading in exchange?</label>
                              <input
                                type="text"
                                placeholder="I can swap it with my Tacoma back-cab glass, or prius filter package..."
                                value={offerExchangeDetails}
                                onChange={(e) => setOfferExchangeDetails(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                                required
                              />
                            </div>
                          ) : null}

                          {offerType !== 'Propose Exchange' && (
                            <div>
                              <label className="text-[10px] text-slate-400 block mb-1">Your Name / Contact Nickname</label>
                              <input
                                type="text"
                                placeholder="Yeon Pisith"
                                value={offerContactName}
                                onChange={(e) => setOfferContactName(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                              />
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] text-slate-400 block mb-1">Your Cambodian phone number</label>
                            <input
                              type="text"
                              placeholder="+855 12 345 678"
                              value={offerContactPhone}
                              onChange={(e) => setOfferContactPhone(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                              required
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-400 block mb-1">Your Telegram handle</label>
                            <input
                              type="text"
                              placeholder="@handle"
                              value={offerContactTelegram}
                              onChange={(e) => setOfferContactTelegram(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-400 block mb-1">Special instructions or meeting place</label>
                          <textarea
                            placeholder="I live close by. Can meet at Toul Kork or BKK near gas station."
                            value={offerNotes}
                            onChange={(e) => setOfferNotes(e.target.value)}
                            rows={2}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white resize-none"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2 rounded-xl text-xs transition cursor-pointer"
                        >
                          Submit Exchange Proposal & Alert Seller
                        </button>
                      </form>
                    )
                  ) : (
                    <div className="bg-slate-950/60 p-4 border border-slate-800 rounded-xl text-center text-xs text-slate-400">
                      🔒 This listing closed safely. Current Status: <strong className="text-yellow-400 font-bold uppercase">{activeListing.status}</strong>
                    </div>
                  )}
                </div>

                {/* =================== QUESTIONS & COMMUNITY COMMENTS =================== */}
                <div className="border-t border-slate-800 pt-4 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-emerald-400" /> Public Q&A & Discussion ({activeListing.comments?.length || 0})
                  </h3>

                  {/* Comments lists display */}
                  {activeListing.comments && activeListing.comments.length > 0 ? (
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                      {activeListing.comments.map((comment) => (
                        <div key={comment.id} className="bg-slate-950 p-3.5 rounded-xl border border-slate-900/60 text-xs text-slate-100 flex gap-3">
                          {/* Avatar Circle */}
                          <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-[11px] uppercase shrink-0 border border-slate-700">
                            {comment.authorName ? comment.authorName.charAt(0) : "U"}
                          </div>
                          
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex justify-between items-center text-[10px]">
                              <span className="font-bold text-white truncate max-w-[120px]">{comment.authorName}</span>
                              <span className="text-slate-500 font-mono text-[9px] shrink-0">{new Date(comment.createdAt).toLocaleString()}</span>
                            </div>
                            
                            <p className="text-slate-300 leading-relaxed pr-1 break-words">{comment.content}</p>

                            {/* Comment photo attachments */}
                            {comment.photoUrl && (
                              <div className="mt-2.5 relative max-w-sm rounded-lg overflow-hidden border border-slate-900 bg-slate-900 leading-none">
                                <img
                                  src={comment.photoUrl}
                                  alt="Attached Comment Visual"
                                  referrerPolicy="no-referrer"
                                  className="max-h-[140px] w-auto max-w-full rounded-md object-contain"
                                />
                                <a
                                  href={comment.photoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="absolute bottom-1 right-1 bg-slate-950/80 text-white font-mono text-[9px] px-1.5 py-0.5 rounded hover:bg-slate-900 hover:text-white transition"
                                >
                                  Open Original ↗
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-slate-950/50 p-4 border border-slate-900 rounded-xl text-center text-xs text-slate-500">
                      💬 No questions posted yet. Be the first to ask!
                    </div>
                  )}

                  {/* Add user Comment form */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3.5">
                    <h4 className="text-[11px] uppercase font-bold text-white">Ask Seller / Poser a Question</h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Your Name</label>
                        <input
                          type="text"
                          value={commentAuthor}
                          onChange={(e) => setCommentAuthor(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1 font-semibold">Attach Photo with Question (Optional)</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="file"
                            accept="image/*"
                            id="comment-photo-file-picker"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setCommentPhoto(reader.result as string);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                          <label
                            htmlFor="comment-photo-file-picker"
                            className="bg-slate-900 hover:bg-slate-850 text-slate-300 font-bold px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 text-[10px] cursor-pointer transition flex items-center gap-1 shrink-0"
                          >
                            📷 Choose Photo
                          </label>
                          {commentPhoto ? (
                            <div className="relative w-8 h-8 rounded border border-slate-700 overflow-hidden shrink-0">
                              <img
                                src={commentPhoto}
                                alt="Comment Preview"
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => setCommentPhoto("")}
                                className="absolute inset-0 bg-red-650 hover:bg-red-550 text-white flex items-center justify-center text-[8px] font-black"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-500 truncate italic">No photo</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Your Comment / Question</label>
                      <textarea
                        placeholder="Ask about part compatibility serial numbers, fitment state, location, or suggest a transaction time."
                        value={commentContent}
                        onChange={(e) => setCommentContent(e.target.value)}
                        rows={2}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white resize-none"
                        required
                      />
                    </div>

                    <button
                      type="button"
                      disabled={isSubmittingComment || !commentContent.trim()}
                      onClick={async () => {
                        if (!commentContent.trim()) return;
                        setIsSubmittingComment(true);
                        try {
                          const response = await fetch(`/api/classifieds/listings/${activeListing.id}/comments`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              authorName: commentAuthor,
                              content: commentContent,
                              photoUrl: commentPhoto || undefined
                            })
                          });

                          if (response.ok) {
                            const newComm = await response.json();
                            // Update activeListing state with the new comment
                            setActiveListing(prev => {
                              if (!prev) return null;
                              return {
                                ...prev,
                                comments: [...(prev.comments || []), newComm]
                              };
                            });
                            // Reset inputs
                            setCommentContent("");
                            setCommentPhoto("");
                          }
                        } catch (err) {
                          console.error("Failed to post comment:", err);
                        } finally {
                          setIsSubmittingComment(false);
                        }
                      }}
                      className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold py-2 rounded-xl text-xs transition cursor-pointer"
                    >
                      {isSubmittingComment ? "Posting Comment..." : "Submit Comment with Photo option"}
                    </button>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =================== OVERLAY: WRITE POST MODAL =================== */}
      <AnimatePresence>
        {showPostModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto text-slate-200 shadow-2xl relative"
            >
              <button
                onClick={() => setShowPostModal(false)}
                className="absolute right-4 top-4 text-slate-400 hover:text-white bg-slate-950 p-1.5 rounded-full border border-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <h2 className="text-base font-extrabold text-white mb-3 flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" /> Post Spare Part Classified Ad
              </h2>

              <p className="text-[11px] text-slate-400 mb-4 bg-slate-950 p-3 rounded-lg border border-slate-900">
                You can post used parts you have at home or garage overstock. Mapped on Cambodia's vehicle network search. AI helper automatically translates titles and checks pricing compatibility.
              </p>

              <form onSubmit={handleCreateListing} className="space-y-4 text-xs">
                {/* Form fields: Post Title */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-slate-300 font-medium block">Listing Ad Title*</label>
                    <button
                      type="button"
                      onClick={handleTriggerAiAdvice}
                      className="text-[10px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
                      title="Generates high quality search friendly titles with Gemini AI"
                    >
                      {isGeneratingAi ? (
                        "Generative AI composing..."
                      ) : (
                        <span className="flex items-center gap-0.5"><Sparkles className="w-3 h-3 text-yellow-400" /> Ask AI to optimize details</span>
                      )}
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Front Disc Rotors for Toyota Tacoma 2WD 2012"
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                  {aiAdMessage && <p className="text-[10px] text-emerald-400 mt-1 font-mono">{aiAdMessage}</p>}
                </div>

                {/* Grid info: Post Type, Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-medium block mb-1">Transaction Category*</label>
                    <select
                      value={postTypeSelected}
                      onChange={(e) => setPostTypeSelected(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300"
                    >
                      <option value="Sell">For Sale ($ USD)</option>
                      <option value="Donate">Free Donation / Giveaway</option>
                      <option value="Exchange">Swap barter with items/service</option>
                      <option value="Cash Exchange">Cash + exchange / negotiable</option>
                      <option value="Looking for">Wanted / Request</option>
                      <option value="Garage Stock">Garage Overstock Clearance</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-300 font-medium block mb-1">Part Category Group*</label>
                    <select
                      value={postCategory}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPostCategory(val);
                        setIsVehicleSelling(val === "Sell Car / Vehicle");
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300"
                    >
                      {SPARE_PART_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Vehicle specifications compatibility */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950 p-3 rounded-xl border border-white/5">
                  <div className="sm:col-span-3 pb-1 border-b border-slate-900 text-[10px] uppercase font-bold text-slate-500">
                    Vehicle Compatibility Specifications
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Brand*</label>
                    <select
                      value={postBrand}
                      onChange={(e) => setPostBrand(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-850 rounded-lg px-2 py-1 text-slate-300"
                    >
                      {BRANDS_LIST.map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Model*</label>
                    <input
                      type="text"
                      required
                      placeholder="Tacoma, Prius, etc."
                      value={postModel}
                      onChange={(e) => setPostModel(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-850 rounded-lg px-2 py-1 text-white font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Year range</label>
                    <input
                      type="text"
                      placeholder="e.g. 2005-2015"
                      value={postYearRange}
                      onChange={(e) => setPostYearRange(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-850 rounded-lg px-2 py-1 text-white"
                    />
                  </div>
                </div>

                {/* Grid info: Price, location, condition */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-slate-300 font-medium block mb-1">Condition*</label>
                    <select
                      value={postCondition}
                      onChange={(e) => setPostCondition(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300"
                    >
                      <option value="New">Brand New</option>
                      <option value="Used">Used (OEM or aftermarket)</option>
                      <option value="Refurbished">Refurbished</option>
                      <option value="Damaged">Damaged (Good for core parts)</option>
                    </select>
                  </div>

                  {postTypeSelected !== 'Donate' ? (
                    <div>
                      <label className="text-slate-300 font-medium block mb-1">Price ($ USD)*</label>
                      <input
                        type="number"
                        placeholder="e.g. 85"
                        value={postPrice}
                        onChange={(e) => setPostPrice(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                        required={postTypeSelected !== 'Donate'}
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="text-slate-300 font-medium block mb-1">Pricing Option</label>
                      <div className="bg-slate-950 border border-slate-850 py-2 text-center text-purple-400 font-bold rounded-xl">
                        FREE GIVEAWAY
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-slate-300 font-medium block mb-1">Province/Location*</label>
                    <select
                      value={postLocation}
                      onChange={(e) => setPostLocation(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300"
                    >
                      {CAMBODIA_PROVINCES.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* If selected swap barter - details */}
                {(postTypeSelected === 'Exchange' || postTypeSelected === 'Cash Exchange') && (
                  <div>
                    <label className="text-slate-300 font-medium block mb-1">Swap Requirement (What are you trading for?)</label>
                    <input
                      type="text"
                      placeholder="e.g. Any 12V Prius Battery or socket toolset"
                      value={postExchangeDetails}
                      onChange={(e) => setPostExchangeDetails(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                )}

                {/* Sell Vehicle Extra Form fields block */}
                {isVehicleSelling && (
                  <div className="bg-amber-400/5 p-4 rounded-2xl border border-amber-400/20 space-y-3.5 text-left">
                    <div className="flex items-center gap-1.5 pb-1 border-b border-amber-400/10">
                      <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                      <span className="text-[11px] font-black text-amber-400 uppercase tracking-widest">
                        Cambodia Vehicle Selling Dossier Properties
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="text-slate-350 font-bold block mb-1 uppercase text-[9.5px]">Reason for Selling*</label>
                        <input
                          type="text"
                          required={isVehicleSelling}
                          placeholder="e.g. Upgrading setup / No longer needed"
                          value={reasonForSelling}
                          onChange={(e) => setReasonForSelling(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-slate-350 font-bold block mb-1 uppercase text-[9.5px]">Cambodia Plate Certificate Docs*</label>
                        <select
                          value={ownershipDocStatus}
                          onChange={(e) => setOwnershipDocStatus(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 font-bold"
                        >
                          <option value="Tax Paper Ready">Tax Paper Ready</option>
                          <option value="Plate Card Ready">Plate Card Ready</option>
                          <option value="Import Tax Docs Only">Import Tax Docs Only</option>
                          <option value="Dealer Invoice Only">Dealer Invoice Only</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-slate-350 font-bold block mb-1 uppercase text-[9.5px]">Accident History Declaration*</label>
                        <input
                          type="text"
                          required={isVehicleSelling}
                          value={accidentHistory}
                          onChange={(e) => setAccidentHistory(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                        />
                      </div>

                      <div>
                        <label className="text-slate-350 font-bold block mb-1 uppercase text-[9.5px]">Monsoon Flood History*</label>
                        <input
                          type="text"
                          required={isVehicleSelling}
                          value={floodHistory}
                          onChange={(e) => setFloodHistory(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                        />
                      </div>

                      <div>
                        <label className="text-slate-350 font-bold block mb-1 uppercase text-[9.5px]">Loan Status / Debt*</label>
                        <select
                          value={loanStatus}
                          onChange={(e) => setLoanStatus(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300"
                        >
                          <option value="No active loan / Paid off">No active loan / Paid off</option>
                          <option value="Under Loan - Transferable">Under Loan - Transferable</option>
                          <option value="Financing outstanding">Financing outstanding</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-slate-350 font-bold block mb-1 uppercase text-[9.5px]">Warranty status*</label>
                        <input
                          type="text"
                          required={isVehicleSelling}
                          value={warrantyStatus}
                          onChange={(e) => setWarrantyStatus(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                        />
                      </div>

                      <div>
                        <label className="text-slate-350 font-bold block mb-1 uppercase text-[9.5px]">Garage Inspection Availability</label>
                        <select
                          value={inspectionAvailability ? "true" : "false"}
                          onChange={(e) => setInspectionAvailability(e.target.value === "true")}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300"
                        >
                          <option value="true">Enable Pre-purchase Inspector Booking</option>
                          <option value="false">Disable Inspection booking</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-slate-350 font-bold block mb-1 uppercase text-[9.5px]">Mechanic Health Score (0-100)*</label>
                        <input
                          type="number"
                          value={healthScore}
                          onChange={(e) => setHealthScore(Math.min(100, Math.max(0, Number(e.target.value) || 94)))}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Seller Type, Telegram links, Proof toggle */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-medium block mb-1">Seller Identity*</label>
                    <select
                      value={postSellerType}
                      onChange={(e) => setPostSellerType(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300"
                    >
                      <option value="Owner">Normal Vehicle Owner</option>
                      <option value="Mechanic">Freelance Mechanic</option>
                      <option value="Garage">Garage Shop Stock</option>
                      <option value="Spare Part Shop">Retail Spare Part shop</option>
                      <option value="Supplier">Bulk Supplier / Importer</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-300 font-medium block mb-1">Telegram username</label>
                    <input
                      type="text"
                      placeholder="e.g. @sokkhheng"
                      value={postContactTelegram}
                      onChange={(e) => setPostContactTelegram(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>
                </div>

                {/* Seller Phone link */}
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Cambodian Phone Contact*</label>
                  <input
                    type="text"
                    required
                    placeholder="+855 12 345 678"
                    value={postContactPhone}
                    onChange={(e) => setPostContactPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                {/* Detailed Description */}
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Detailed Ad description</label>
                  <textarea
                    placeholder="Provide details about fitment, parts serial numbers, any corrosion traces or history..."
                    value={postDescription}
                    onChange={(e) => setPostDescription(e.target.value)}
                    rows={3}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white resize-none"
                  />
                </div>

                {/* Upload Photos & Videos Section */}
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-850/60 space-y-3.5">
                  <div className="pb-1 border-b border-slate-900 text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider">
                    Spare Part Media Files (Photos & Videos)
                  </div>
                  
                  {/* Photo Multi Selection picker */}
                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-medium block">Ad Gallery Photos (Upload max 5)</label>
                    <div className="flex flex-wrap gap-2 items-center">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        id="post-photos-picker"
                        className="hidden"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []) as File[];
                          files.forEach((file: File) => {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setPostPhotos(prev => [...prev, reader.result as string].slice(0, 5));
                            };
                            reader.readAsDataURL(file);
                          });
                        }}
                      />
                      <label
                        htmlFor="post-photos-picker"
                        className="bg-slate-900 hover:bg-slate-850 text-emerald-400 font-bold px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-750 text-[11px] cursor-pointer transition flex items-center gap-1.5"
                      >
                        📷 Select Photos ({postPhotos.length}/5)
                      </label>
                      
                      <button
                        type="button"
                        onClick={() => {
                          const presets = [
                            "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=400",
                            "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=400",
                            "https://images.unsplash.com/photo-1517524008436-bbdb53c57b28?auto=format&fit=crop&q=80&w=400",
                            "https://images.unsplash.com/photo-1507136566006-cfc505b114fc?auto=format&fit=crop&q=80&w=400",
                            "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=400"
                          ];
                          // Select a random sample that doesn't already exist or just add
                          const randomPreset = presets[Math.floor(Math.random() * presets.length)];
                          setPostPhotos(prev => [...prev, randomPreset].slice(0, 5));
                        }}
                        className="text-[10px] text-zinc-400 hover:text-emerald-400 transition underline pl-1"
                        title="Quick preheat mock high-res photo for fast web demonstration"
                      >
                        + Select Demo Photo
                      </button>
                    </div>

                    {/* Previews Thumbnails Grid */}
                    {postPhotos.length > 0 && (
                      <div className="grid grid-cols-5 gap-2 pt-1 animate-fade-in">
                        {postPhotos.map((url, idx) => (
                          <div key={idx} className="relative aspect-square rounded border border-slate-800 overflow-hidden group bg-slate-900">
                            <img src={url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setPostPhotos(prev => prev.filter((_, i) => i !== idx))}
                              className="absolute inset-0 bg-red-650/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[9px] font-black"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Video single picker */}
                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-medium block">Video Demonstration (Optional)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept="video/*"
                        id="post-video-picker"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setPostVideos([reader.result as string]);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <label
                        htmlFor="post-video-picker"
                        className="bg-slate-900 hover:bg-slate-850 text-indigo-450 font-bold px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-750 text-[11px] cursor-pointer transition flex items-center gap-1.5"
                      >
                        🎥 Select Video File
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setPostVideos(["https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-mechanic-repairing-a-clutch-disc-40092-large.mp4"]);
                        }}
                        className="text-[10px] text-zinc-400 hover:text-indigo-405 transition underline pl-1"
                        title="Use a beautiful preloaded high-quality automotive repair clip"
                      >
                        + Select Demo Video
                      </button>
                    </div>

                    {postVideos.length > 0 && (
                      <div className="relative aspect-video max-w-xs rounded-lg border border-slate-800 overflow-hidden group bg-slate-900 mt-1 animate-fade-in">
                        <video src={postVideos[0]} className="w-full h-full object-cover pointer-events-none" />
                        <div className="absolute inset-x-0 bottom-0 bg-black/75 p-1 text-[9px] text-zinc-300 flex justify-between items-center px-2">
                          <span>Video Attached</span>
                          <button
                            type="button"
                            onClick={() => setPostVideos([])}
                            className="bg-red-650 hover:bg-red-550 text-white font-bold px-1.5 py-0.5 rounded text-[8px] cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Safety Proof Photo Toggle */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-850">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={requiredProofPhoto}
                      onChange={(e) => setRequiredProofPhoto(e.target.checked)}
                      className="accent-emerald-500 mt-0.5 scale-110"
                    />
                    <div>
                      <span className="text-white block font-semibold text-[11px]">Upload receipts / verified serial stamp?</span>
                      <span className="text-[10px] text-slate-500 block">Marks listing as verified to reduce scam alerts and flag risk profiles.</span>
                    </div>
                  </label>
                </div>

                {/* Save list Button actions */}
                <div className="flex gap-2.5 pt-3 border-t border-slate-850 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowPostModal(false)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl border border-slate-700 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-2 rounded-xl transition shadow-lg cursor-pointer"
                  >
                    Publish Verified Classified Ad
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =================== OVERLAY: REPORT FAKE LISTING MODAL =================== */}
      <AnimatePresence>
        {showReportModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full text-slate-200 shadow-2xl relative"
            >
              <button
                onClick={() => setShowReportModal(false)}
                className="absolute right-4 top-4 text-slate-400 hover:text-white bg-slate-950 p-1 rounded-full cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <h2 className="text-sm font-bold text-white mb-2 flex items-center gap-1.5 text-red-400">
                <AlertTriangle className="w-4 h-4" /> Report Trust Violation
              </h2>

              {reportSuccess ? (
                <div className="bg-emerald-500/10 border border-emerald-500/10 p-5 rounded-xl text-center text-xs text-emerald-300 my-4">
                  ✓ Report successfully recorded! Admin review team is notified.
                </div>
              ) : (
                <form onSubmit={handleReportListingSubmit} className="space-y-4 text-xs">
                  <p className="text-[11px] text-slate-400">
                    To maintain safety, you can flag parts that appear stolen, fake copies/scams, or listings with wrong specifications.
                  </p>

                  <div>
                    <label className="text-slate-400 block mb-1 font-semibold">Flag Category</label>
                    <select
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-lg px-2.5 py-1.5 text-xs text-slate-300"
                    >
                      <option value="Fake Part / Counterfeit">Fake Part / Counterfeit</option>
                      <option value="Stolen Part Suspected">Stolen Part Suspected</option>
                      <option value="Scam / Inaccurate Price">Scam / Inaccurate Price</option>
                      <option value="Wrong Category or Spam">Wrong Category or Spam</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1 font-semibold">Comments / Explanation</label>
                    <textarea
                      required
                      placeholder="Describe what is wrong or why this listing appears anomalous..."
                      value={reportComments}
                      onChange={(e) => setReportComments(e.target.value)}
                      rows={3}
                      className="w-full bg-slate-950 border border-slate-850 rounded-lg px-2.5 py-1.5 text-xs text-white resize-none"
                    />
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setShowReportModal(false)}
                      className="bg-slate-800 text-slate-300 hover:bg-slate-705 px-3 py-1.5 rounded-lg border border-slate-700 cursor-pointer"
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      className="bg-red-600 hover:bg-red-500 text-white font-bold px-4 py-1.5 rounded-lg transition cursor-pointer"
                    >
                      Submit Violation Report
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
