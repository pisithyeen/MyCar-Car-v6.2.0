/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  MapPin, 
  Phone, 
  Star, 
  Search, 
  Map as MapIcon, 
  Compass, 
  ExternalLink,
  Tag,
  CheckCircle,
  HelpCircle,
  Wrench,
  Navigation,
  Info
} from "lucide-react";
import { GaragePartner } from "../types";

interface GarageLocatorProps {
  garages: GaragePartner[];
  initialSearchCategory?: string;
}

export default function GarageLocator({
  garages,
  initialSearchCategory = ""
}: GarageLocatorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [selectedGarage, setSelectedGarage] = useState<GaragePartner | null>(null);
  const [partnerFilter, setPartnerFilter] = useState(false);

  // Geolocation states
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoStatus, setGeoStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // If redirected with a specific category search from diagnosis
  useEffect(() => {
    if (initialSearchCategory) {
      // Find standard category matching
      const catLower = initialSearchCategory.toLowerCase();
      if (catLower.includes("oil")) {
        setActiveCategory("Engine Oil Service");
      } else if (catLower.includes("brake")) {
        setActiveCategory("Brake Service");
      } else if (catLower.includes("tire") || catLower.includes("wheel")) {
        setActiveCategory("Tire Service");
      } else if (catLower.includes("charging") || catLower.includes("ev")) {
        setActiveCategory("EV Service");
      } else {
        setSearchQuery(initialSearchCategory);
      }
    }
  }, [initialSearchCategory]);

  const categories = [
    "All",
    "Garage / Repair Shop",
    "Petrol Station / Partner",
    "Spare Part Shop",
    "Car Wash",
    "EV Charging"
  ];

  // Geolocation trigger
  const requestLocation = () => {
    setGeoStatus('loading');
    if (!navigator.geolocation) {
      setGeoStatus('error');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // Mock PP centered if they are outside Cambodia, else take their coords
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserCoords({ lat, lng });
        setGeoStatus('success');
      },
      (err) => {
        console.error("Geo error:", err);
        setGeoStatus('error');
      }
    );
  };

  // Filter logic
  const filteredGarages = garages.filter((g) => {
    const matchesSearch = 
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.services.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = 
      activeCategory === "All" || g.type === activeCategory;

    const matchesPartner = !partnerFilter || g.isPartner;

    return matchesSearch && matchesCategory && matchesPartner;
  });

  // SVG Phnom Penh Map Plotting Constants (Bounded coordinates)
  // Min & max lat/lng ranges in Phnom Penh to normalize coordinate mapping
  const minLat = 11.5200;
  const maxLat = 11.5800;
  const minLng = 104.8600;
  const maxLng = 104.9600;

  // Function to convert coordinate pair to x, y percentage coordinates in a 500x300 canvas
  const getCoordinates = (lat: number, lng: number) => {
    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    // Map with y inverted since coordinates grow downwards in SVG
    const y = (1.0 - ((lat - minLat) / (maxLat - minLat))) * 100;
    return { x: `${Math.max(0, Math.min(100, x))}%`, y: `${Math.max(0, Math.min(100, y))}%` };
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex flex-col lg:flex-row flex-wrap items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1 text-sky-400 text-xs font-semibold tracking-wider uppercase mb-1">
            <Compass className="w-3.5 h-3.5 animate-spin-slow" />
            <span>Phnom Penh Service Locator</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Trusted Garages & Partners
          </h1>
          <p className="text-sm text-slate-400 font-sans">
            Locate pre-vetted Cambodian service providers near you. Access partner bookings & fast DC power chargers.
          </p>
        </div>

        {/* Filters Panel Inline */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Geolocation Button */}
          <button
            onClick={requestLocation}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              geoStatus === 'success'
                ? "bg-sky-500/10 text-sky-400 border border-sky-500/30"
                : geoStatus === 'loading'
                ? "bg-slate-800 text-slate-400 border border-slate-700 animate-pulse"
                : "bg-white/5 border border-white/10 hover:border-white/15 text-slate-300"
            }`}
          >
            <Navigation className={`w-3.5 h-3.5 ${geoStatus === 'loading' ? 'animate-bounce' : ''}`} />
            <span>
              {geoStatus === 'success' ? "Location Active" : geoStatus === 'error' ? "Geo Failed" : "Find My Location"}
            </span>
          </button>

          {/* Toggle Partner */}
          <button
            onClick={() => setPartnerFilter(!partnerFilter)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition border cursor-pointer ${
              partnerFilter
                ? "bg-sky-500 text-slate-900 border-sky-500 shadow-md"
                : "bg-white/5 border border-white/10 hover:border-white/15 text-slate-300"
            }`}
          >
            Verified Partners Only
          </button>
        </div>
      </div>

      {/* Primary Panels: Left list + Right interactive map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Directory and Filters */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass rounded-3xl p-4 flex flex-col md:flex-row gap-3 shadow-md">
            {/* Direct query search bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, address, alignment, AC lube..."
                className="w-full bg-slate-900 font-sans text-xs p-3 pl-10 rounded-xl text-slate-200 border border-white/10 focus:outline-none focus:border-white/20"
              />
            </div>

            {/* Quick tabs categories */}
            <div className="flex md:flex-row flex-wrap gap-1.5 overflow-x-auto shrink-0 select-none">
              <select
                value={activeCategory}
                onChange={(e) => setActiveCategory(e.target.value)}
                className="bg-slate-900 border border-white/10 text-xs text-slate-200 p-2 px-3 rounded-xl focus:outline-none focus:border-white/20"
              >
                {categories.map((cat, idx) => (
                  <option key={idx} value={cat} className="bg-slate-900">{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Catalog items */}
          <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
            {filteredGarages.map((gar) => (
              <div
                key={gar.id}
                onClick={() => setSelectedGarage(gar)}
                className={`p-4 rounded-2xl border text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition group cursor-pointer ${
                  selectedGarage?.id === gar.id
                    ? "bg-white/12 border-sky-500/60 shadow-lg shadow-sky-500/5"
                    : "bg-white/3 border border-white/5 hover:bg-white/8 hover:border-white/10 shadow-md"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-white/10 bg-black/20">
                    <img
                      src={gar.imageUrl}
                      alt={gar.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300 pointer-events-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-sm font-bold text-slate-100 group-hover:text-white font-sans">
                        {gar.name}
                      </h3>
                      {gar.isPartner && (
                        <span className="px-1.5 py-0.5 bg-sky-500/20 text-sky-400 text-[9px] uppercase font-bold tracking-wider rounded font-mono">
                          Partner
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1 font-sans">
                      {gar.address}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1 text-amber-500 font-semibold font-mono">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        <span>{gar.rating}</span>
                        <span className="text-slate-500 font-normal">({gar.reviewsCount})</span>
                      </span>
                      <span>•</span>
                      <span className="text-slate-400 font-mono text-[10px]">{gar.type}</span>
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col justify-between sm:items-end w-full sm:w-auto border-t sm:border-t-0 border-white/5 pt-2 sm:pt-0 gap-2 shrink-0">
                  <div className="text-left sm:text-right">
                    <span className="text-xs text-slate-400 font-medium font-mono flex items-center gap-1 justify-end">
                      <Phone className="w-3 h-3 text-sky-400" />
                      <span>{gar.phone}</span>
                    </span>
                  </div>
                  <span className="px-2 py-0.5 bg-black/20 border border-white/5 text-[10px] text-slate-400 rounded-md font-mono">
                     Details
                  </span>
                </div>
              </div>
            ))}

            {filteredGarages.length === 0 && (
              <div className="p-12 text-center text-slate-500 text-xs glass border border-white/5 rounded-3xl shadow-md">
                 No services corresponding to your search parameters in Phnom Penh.
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Map Canvas Visualization (SVG-based Interactive Vector Plot) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass rounded-3xl p-5 space-y-4 shadow-md">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-350 uppercase tracking-widest flex items-center gap-1 font-sans">
                <MapIcon className="w-4.5 h-4.5 text-sky-400" />
                <span>PHNOM PENH ACTIVE COORDINATES MAP</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-550 uppercase">Live Canvas</span>
            </div>

            {/* Simulated Interactive SVG Map Container */}
            <div className="relative bg-black/30 border border-white/5 rounded-2xl h-72 overflow-hidden select-none shadow-inner">
              
              {/* Rivers - Tonle Sap and Mekong rivers merge in Phnom Penh (Chaktomuk confluence!) */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Visual Rivers blue-cyan trails */}
                <path d="M 50 0 C 47 25, 60 40, 55 55 C 50 70, 75 80, 80 100" fill="none" stroke="#22d3ee" strokeWidth="4" />
                <path d="M 85 0 C 75 20, 68 35, 59 55 C 50 75, 45 85, 30 100" fill="none" stroke="#0891b2" strokeWidth="3" />
                {/* Confluence Hub Marker */}
                <circle cx="56" cy="55" r="5" fill="#0ea5e9" className="animate-pulse" />
              </svg>

              {/* Sub-areas text labels */}
              <div className="absolute top-8 left-10 text-[9px] font-bold text-slate-650 uppercase tracking-widest pointer-events-none font-sans">Sen Sok</div>
              <div className="absolute top-6 right-20 text-[9px] font-bold text-slate-650 uppercase tracking-widest pointer-events-none font-sans">Tuol Kork</div>
              <div className="absolute top-1/2 left-10 text-[9px] font-bold text-slate-650 uppercase tracking-widest pointer-events-none font-sans">Boeng Keng Kang</div>
              <div className="absolute top-2/3 right-12 text-[9px] font-bold text-slate-650 uppercase tracking-widest pointer-events-none font-sans">Chbar Ampov</div>
              <div className="absolute top-1/2 right-24 text-[9px] font-bold text-slate-650 uppercase tracking-widest pointer-events-none font-sans">Tonle Bassac</div>

              {/* Grid Scales */}
              <div className="absolute bottom-2 left-2 text-[9px] font-mono text-slate-500 bg-black/40 px-1.5 py-0.5 rounded border border-white/5">
                Scale: 1 : 15,000 m
              </div>

              {/* Dynamic User Geolocation glows if success */}
              {geoStatus === 'success' && (
                <div
                  className="absolute z-30 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ left: "45%", top: "52%" }} // Bounded coordinates simulation near center BKK
                >
                  <div className="relative flex items-center justify-center">
                    <div className="absolute animate-ping w-8 h-8 rounded-full bg-cyan-400 opacity-75"></div>
                    <div className="relative w-4.5 h-4.5 bg-cyan-500 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-bold text-white shadow-lg">
                       Y
                    </div>
                  </div>
                  <span className="absolute left-6 top-0 bg-cyan-950/90 text-cyan-400 border border-cyan-500/20 px-1 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider whitespace-nowrap label">
                     You are here
                  </span>
                </div>
              )}

              {/* Garage interactive pins loop */}
              {filteredGarages.map((gar) => {
                const { x, y } = getCoordinates(gar.lat, gar.lng);
                const isSelected = selectedGarage?.id === gar.id;
                return (
                  <button
                    key={gar.id}
                    onClick={() => setSelectedGarage(gar)}
                    className="absolute z-20 group -translate-x-1/2 -translate-y-1/2 focus:outline-none transition cursor-pointer"
                    style={{ left: x, top: y }}
                  >
                    <div className="relative flex flex-col items-center">
                       {/* Floating tag on hover or selection */}
                       <span className={`absolute bottom-6 bg-slate-950 border text-[9px] px-1.5 py-0.5 font-bold rounded-lg tracking-wide whitespace-nowrap pointer-events-none shadow-md transition ${
                        isSelected 
                          ? "opacity-100 border-sky-500 text-white translate-y-0 text-sky-400"
                          : "opacity-0 scale-95 group-hover:opacity-100 border-white/10 text-slate-300 translate-y-1"
                       }`}>
                        {gar.name}
                      </span>
                      
                      {/* Beacon Ring if partner */}
                      {gar.isPartner && (
                        <span className={`absolute w-7 h-7 bg-sky-500/10 rounded-full border border-dashed border-sky-500/20 transform scale-150 pointer-events-none ${
                          isSelected ? 'animate-ping' : ''
                        }`} />
                      )}

                      {/* Hard Point Pin */}
                      <MapPin className={`w-6.5 h-6.5 drop-shadow-md transition ${
                        isSelected 
                          ? "text-sky-455 scale-120 drop-shadow-[0_0_8px_rgba(14,165,229,0.3)]" 
                          : gar.isPartner ? "text-sky-500 hover:text-sky-400" : "text-slate-400 hover:text-slate-300"
                      }`} />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Garage Quick View Panel */}
            {selectedGarage && (
              <div className="bg-black/30 border border-white/10 p-4 rounded-2xl space-y-3 shadow-md">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-100 font-sans">{selectedGarage.name}</h4>
                    <p className="text-xs text-sky-400 font-mono mt-0.5">{selectedGarage.type}</p>
                  </div>
                  <a
                    href={`tel:${selectedGarage.phone}`}
                    className="p-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-450 rounded-lg text-xs font-semibold flex items-center gap-1 transition shrink-0 font-mono"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Call Station</span>
                  </a>
                </div>

                <p className="text-xs text-slate-350 leading-relaxed font-serif">
                  {selectedGarage.description}
                </p>

                {/* Services Pills */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-sans">Available Services</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedGarage.services.map((serv, idx) => (
                      <span key={idx} className="bg-white/5 border border-white/5 px-2 py-0.5 text-[10px] text-slate-300 rounded font-mono">
                         {serv}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 border-t border-white/10 pt-2 flex items-center justify-between font-mono">
                  <span>GPS LatLng: {selectedGarage.lat}, {selectedGarage.lng}</span>
                  <span className="flex items-center gap-0.5 text-sky-400 font-medium whitespace-nowrap">
                    <span>Google Maps Link</span>
                    <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
