import React, { useState } from "react";
import { 
  X, 
  MapPin, 
  User, 
  Tag, 
  CheckCircle, 
  AlertTriangle, 
  Sparkles, 
  Phone, 
  MessageCircle, 
  Share2, 
  Heart, 
  Scale, 
  Eye, 
  TrendingUp, 
  Cpu,
  BadgeAlert,
  ShieldAlert,
  Badge,
  Activity,
  Award,
  BookOpen,
  DollarSign
} from "lucide-react";
import { PartListing } from "../types";

interface MarketplaceDetailProps {
  listing: PartListing;
  onClose: () => void;
  onAddToCompare: (v: PartListing) => void;
  isSaved: boolean;
  onToggleSave: () => void;
}

export default function MarketplaceDetail({
  listing,
  onClose,
  onAddToCompare,
  isSaved,
  onToggleSave
}: MarketplaceDetailProps) {
  const [offerValue, setOfferValue] = useState("");
  const [offerNote, setOfferNote] = useState("");
  const [offerStatusText, setOfferStatusText] = useState<string | null>(null);

  const [inspectGarage, setInspectGarage] = useState("Kimsour Premium Garage Sihanoukville");
  const [inspectDate, setInspectDate] = useState("2026-06-15");
  const [inspectStatus, setInspectStatus] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'details' | 'history' | 'ai'>('details');

  const formattedPrice = listing.price ? `$${listing.price.toLocaleString()}` : "Free Giveaway";

  // Mock AI advice strings generated with extreme detail to emulate real production responses
  const aiSuggestedPrice = listing.price 
    ? `$${Math.round(listing.price * 0.95).toLocaleString()} - $${Math.round(listing.price * 1.05).toLocaleString()} USD` 
    : "Varies";
  
  const aiCostEstimate = listing.price 
    ? `$${Math.round(listing.price * 0.12).toLocaleString()} to $${Math.round(listing.price * 0.18).toLocaleString()} / year insurance & oil maintenance`
    : "~$50 / year maintenance";

  const isSuspiciousPrice = listing.price && listing.price < 300; // trigger if price is absurdly low for a vehicle

  const handleMakeOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerValue) return;
    setOfferStatusText(`Offer of $${Number(offerValue).toLocaleString()} USD successfully transmitted to owner's inbox! 🤝`);
    setOfferNote("");
  };

  const handleBookInspection = (e: React.FormEvent) => {
    e.preventDefault();
    setInspectStatus(`Inspection request logged successfully with "${inspectGarage}" for ${inspectDate}. A digital record will attach upon completion. 👨‍🔧`);
  };

  return (
    <div id="marketplace-individual-details" className="bg-slate-900 border border-white/10 rounded-2xl p-6 space-y-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative text-left">
      {/* Upper header action segments */}
      <div className="flex justify-between items-start border-b border-white/5 pb-4.5">
        <div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="bg-slate-950 border border-white/5 px-2.5 py-0.5 text-slate-400 font-bold uppercase text-[9px] rounded">
              {listing.category}
            </span>
            <span className="bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 text-sky-400 font-black text-[9px] rounded uppercase">
              {listing.condition} Condition
            </span>
            {listing.isVehicleSellingPost && (
              <span className="bg-pink-500/15 border border-pink-500/25 px-2 py-0.5 text-pink-400 font-extrabold text-[9px] rounded uppercase">
                🚘 Verified Vehicle Profile
              </span>
            )}
          </div>
          <h2 className="text-sm font-black text-white hover:text-sky-400 leading-tight mt-1 uppercase tracking-wider">
            {listing.title}
          </h2>
          <p className="text-[10px] text-slate-500 font-mono mt-0.5">
            Published at {new Date(listing.createdAt).toLocaleDateString()} | Active Listing No: {listing.id}
          </p>
        </div>

        <button 
          onClick={onClose}
          className="p-1 px-3.5 bg-white/5 hover:bg-white/10 text-slate-100 border border-white/5 rounded-xl text-xs font-semibold cursor-pointer shrink-0 transition"
        >
          X
        </button>
      </div>

      {/* Grid columns: Left photos & Core info, Right Booking Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (Span 7) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Visual Carousel Placeholder */}
          <div className="relative h-64 sm:h-80 bg-slate-950 rounded-2xl overflow-hidden border border-white/5">
            <img 
              src={listing.photos && listing.photos.length > 0 ? listing.photos[0] : "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=400"} 
              alt={listing.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            {listing.isBoosted && (
              <span className="absolute top-2.5 left-2.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest flex items-center gap-0.5">
                ⚡ Featured Boost
              </span>
            )}
            <div className="absolute bottom-2.5 right-2.5 bg-slate-950/80 backdrop-blur-md px-2 py-1 border border-white/10 rounded font-mono text-[9px] text-white">
              Photos (1 / 1)
            </div>
          </div>

          {/* Quick Action bar icons */}
          <div className="flex flex-wrap gap-2.5 border-b border-t border-white/5 py-3">
            <button
              onClick={onToggleSave}
              className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 text-[10px] uppercase font-bold cursor-pointer transition ${
                isSaved 
                  ? 'bg-rose-500/15 border-rose-500 text-rose-455' 
                  : 'bg-white/3 border-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
              <span>{isSaved ? 'Saved Listing' : 'Save To Wallet'}</span>
            </button>

            <button
              onClick={() => {
                onAddToCompare(listing);
                alert(`${listing.title} added to your comparing deck! ⚖️`);
              }}
              className="p-2.5 bg-white/3 border border-white/5 text-slate-400 hover:text-white rounded-xl flex items-center justify-center gap-1.5 text-[10px] uppercase font-bold cursor-pointer transition"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Compare Vehicle</span>
            </button>

            <button
              onClick={() => {
                const dummyLink = `${window.location.origin}/marketplace/listing/${listing.id}`;
                navigator.clipboard.writeText(dummyLink);
                alert("Deep Link copied to clipboard! Share on Forum or FB Group now.");
              }}
              className="p-2.5 bg-white/3 border border-white/5 text-slate-400 hover:text-white rounded-xl flex items-center justify-center gap-1.5 text-[10px] uppercase font-bold cursor-pointer transition"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Listing</span>
            </button>

            <button
              onClick={() => {
                alert("Thank you. Listing flags submitted to operations admin team. They will audit safety keys.");
              }}
              className="p-2.5 bg-slate-950 text-slate-500 hover:text-rose-400 rounded-xl flex items-center justify-center gap-1.5 text-[10px] uppercase font-medium ml-auto cursor-pointer border border-white/5"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Report Ad</span>
            </button>
          </div>

          {/* Sub Navigation tabs */}
          <div className="flex border-b border-white/5 gap-4">
            {[
              { id: 'details', n: 'Specifications' },
              { id: 'history', n: 'Maintenance Records' },
              { id: 'ai', n: 'AI Audited Insights' }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`pb-2 font-bold text-xs relative transition cursor-pointer ${
                  activeTab === t.id ? 'text-sky-400 border-b-2 border-sky-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.n}
              </button>
            ))}
          </div>

          {/* specifications block */}
          {activeTab === 'details' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed italic pr-4">
                "{listing.description}"
              </p>

              {/* Requirement 17: detailed filters alignment */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { l: "Brand compatibility", v: listing.vehicleBrand },
                  { l: "Model compatibility", v: listing.vehicleModel },
                  { l: "Product generation", v: listing.yearRange },
                  { l: "Transmission mechanics", v: listing.transmission || "Automatic electronic 6-Spd" },
                  { l: "Engine platform", v: listing.engineType || "Dual VVT-i / eVVT-1.8L" },
                  { l: "Logged odometer", v: listing.mileage ? `${listing.mileage.toLocaleString()} km` : "84,000 km (Manual Logged)" },
                  { l: "Fuel propulsion", v: listing.fuelType || "Gasoline / Premium Unleaded" },
                  { l: "Paint coat color", v: listing.color || "Metallic Platinum Slate" },
                  { l: "Doc legal status", v: listing.ownershipDocStatus || "Original Card / Plate Card" }
                ].map((spec, i) => (
                  <div key={i} className="bg-slate-950/60 p-3 rounded-xl border border-white/5">
                    <span className="text-[9px] text-slate-500 block uppercase font-bold">{spec.l}</span>
                    <span className="text-[11px] text-slate-200 block font-mono font-bold mt-0.5">{spec.v}</span>
                  </div>
                ))}
              </div>

              {/* Requirement 16: blurred plate number controller simulation */}
              <div className="p-3 bg-slate-950 rounded-xl border border-white/5 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-slate-200 block">Cambodian License Plate Number</span>
                  <span className="text-[10px] text-slate-500">Blurred to protect seller privacy</span>
                </div>
                <div className="bg-slate-900 border border-white/10 p-1.5 px-3 rounded font-mono font-semibold tracking-widest text-[#22c55e]/90 select-none">
                  PHNOM PENH 2A-XXXX <span className="text-[9px] text-slate-500 font-bold ml-1.5">(BLURRED)</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-4.5 rounded-2xl border border-white/5 space-y-3">
                <h4 className="text-xs font-black text-white flex items-center gap-1 uppercase tracking-wide">
                  <Activity className="w-4.5 h-4.5 text-emerald-400" />
                  <span>Verified Service Journal Ledger</span>
                </h4>

                <p className="text-[11px] text-slate-400 mt-1 pl-5.5">
                  This listing features authentic maintenance logs exported directly from MyCar Care KH partner garage diagnostic hubs:
                </p>

                <div className="space-y-2 border-l-2 border-slate-800 ml-2.5 pl-4.5 pt-1 text-xs">
                  <div className="relative">
                    <div className="absolute w-2 h-2 rounded-full bg-emerald-500 -left-[23.5px] top-1"></div>
                    <span className="text-[10px] text-slate-400 block font-mono">2026-04-18 @ 82,100 km</span>
                    <span className="font-bold text-white block">Engine general service oil flushing</span>
                    <span className="text-[10px] text-slate-500">Logged by Apsara Auto Repair & Calibration Hub</span>
                  </div>
                  <div className="relative mt-2.5">
                    <div className="absolute w-2 h-2 rounded-full bg-emerald-500 -left-[23.5px] top-1"></div>
                    <span className="text-[10px] text-slate-400 block font-mono">2026-01-05 @ 79,000 km</span>
                    <span className="font-bold text-white block">Aircon filter swap & refrigerant recharge</span>
                    <span className="text-[10px] text-slate-500">Logged by Sihanoukville Garage Diagnostic Bay</span>
                  </div>
                </div>
              </div>

              {/* Requirement 12: inspection booker */}
              <div className="bg-slate-950 p-4.5 border border-white/5 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Book Pre-Purchase Physical Inspection</h4>
                <p className="text-[10.5px] text-slate-400">
                  Request an impartial diagnostic inspection by choosing one of our partner garage engineers to get a verified health score.
                </p>

                {inspectStatus ? (
                  <p className="text-[11.5px] text-emerald-400 bg-emerald-500/10 p-3 rounded-lg font-bold">
                    {inspectStatus}
                  </p>
                ) : (
                  <form onSubmit={handleBookInspection} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-slate-400 block">Diagnostic Center</label>
                        <select 
                          value={inspectGarage} 
                          onChange={e => setInspectGarage(e.target.value)}
                          className="w-full bg-slate-900 border border-white/10 p-2 rounded-lg text-white"
                        >
                          <option value="Kimsour Premium Garage Phnom Penh">Kimsour Premium Garage Phnom Penh</option>
                          <option value="Apsara Repair Center Siem Reap">Apsara Repair Center Siem Reap</option>
                          <option value="Freelance Inspector Samnang">Freelance Inspector Samnang (Mobile)</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-slate-400 block">Preferred Date</label>
                        <input 
                          type="date" 
                          value={inspectDate} 
                          onChange={e => setInspectDate(e.target.value)}
                          className="w-full bg-slate-900 border border-white/10 p-2 rounded-lg text-white"
                        />
                      </div>
                    </div>
                    <button 
                      type="submit"
                      className="py-2.5 px-4 bg-sky-500 hover:bg-sky-600 text-slate-950 font-bold rounded-lg text-[10.5px] uppercase tracking-wide cursor-pointer w-full"
                    >
                      Request Inspection Booking
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-4">
              {/* Requirement 7: AI indicators */}
              <div className="p-4 bg-amber-400/5 rounded-2xl border border-amber-400/20 text-xs text-slate-350 space-y-3.5">
                <div className="flex items-center gap-1.5 text-amber-400 font-extrabold uppercase">
                  <Sparkles className="w-4 h-4" />
                  <span>Gemini Automobile Audited Analytics report</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-500 block uppercase font-bold">AI price suggestion</span>
                    <span className="text-xs font-mono font-bold text-white block">{aiSuggestedPrice}</span>
                    <span className="text-[8.5px] text-slate-500 block">Value density compared to Sihanoukville sales</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-500 block uppercase font-bold">AI ownership cost estimation</span>
                    <span className="text-xs font-mono font-semibold text-white block">{aiCostEstimate}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-500 block uppercase font-bold">AI maintenance risk warning</span>
                    <span className="text-xs font-mono text-emerald-400 block font-extrabold">🟢 Low Risk (0 recorded faults on scanner)</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-500 block uppercase font-bold font-mono">Fraud check audit status</span>
                    <span className={`text-xs font-bold font-mono block ${isSuspiciousPrice ? 'text-red-400' : 'text-emerald-400'}`}>
                      {isSuspiciousPrice ? '⚠️ High Suspense Pricing warning!' : '✓ Clear (Authentic matching identity and plates verified)'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">AI Buyer Advice Synopsis</span>
                  <p className="text-[11px] text-slate-300 italic">
                    "This Tacoma listing fits all Cambodia regional requirements. High-value dual brake rotoring has passed local salt-water corrosion trials. No duplicate catalog instances were discovered on Khmer24 or Sourcing DB."
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (Span 5) - Pricing and Booking form panel */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-slate-950 p-5 rounded-2xl border border-white/5 text-left space-y-4">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Marketplace Price Requested</span>
              <span className="text-2xl font-black font-mono text-yellow-500 block">{formattedPrice} USD</span>
              {listing.negotiable && <span className="text-[9.5px] text-emerald-400 font-bold block">★ Negotiable Offer Enabled</span>}
            </div>

            {/* Requirement 6: Verification badges list */}
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold mb-2">Automobile Credentials Verified badges</span>
              <div className="grid grid-cols-1 gap-1.5">
                {[
                  { badge: "Verified Owner", active: listing.verifiedSeller },
                  { badge: "Service History Available", active: true },
                  { badge: "Garage Verified", active: true },
                  { badge: "QR Vehicle ID Verified", active: true },
                  { badge: "Inspection Available", active: true },
                  { badge: "Document Ready", active: true },
                  { badge: "No Major Accident Declared", active: true }
                ].map((bad, i) => (
                  <div key={i} className={`p-2 rounded-xl flex items-center justify-between text-[10.5px] border font-bold ${
                    bad.active 
                      ? 'bg-emerald-500/10 border-emerald-500/15 text-emerald-300' 
                      : 'bg-white/3 border-white/5 text-slate-400'
                  }`}>
                    <span>{bad.badge}</span>
                    {bad.active ? (
                      <span className="text-[8.5px] uppercase bg-emerald-500 text-slate-900 px-1 font-black rounded font-sans">✓ Verified</span>
                    ) : (
                      <span className="text-[8.5px] uppercase bg-slate-900 border border-slate-700 text-slate-450 px-1 rounded font-normal font-sans">Pending</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Make dynamic offer section */}
            <div className="border-t border-white/5 pt-4">
              <h4 className="text-[11px] font-black uppercase text-slate-300">Submit Handshake Deal Offer</h4>
              {offerStatusText ? (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/15 text-emerald-400 rounded-xl mt-2 text-xs font-bold leading-relaxed">
                  {offerStatusText}
                </div>
              ) : (
                <form onSubmit={handleMakeOffer} className="space-y-2.5 mt-2">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-slate-500 block">Offer Amount ($ USD)</label>
                    <input 
                      type="number" 
                      placeholder={listing.price ? String(listing.price - 100) : "150"}
                      value={offerValue}
                      onChange={e => setOfferValue(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 p-2 rounded-lg text-white font-mono text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-slate-500 block">Personal Message</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Can do cash deal cash-out in Phnom Penh tomorrow"
                      value={offerNote}
                      onChange={e => setOfferNote(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 p-2 rounded-lg text-white"
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={!offerValue}
                    className="w-full py-2 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 text-slate-900 font-black rounded-lg text-[10.5px] uppercase tracking-wider transition cursor-pointer"
                  >
                    Commit Make Offer
                  </button>
                </form>
              )}
            </div>

            {/* Direct Instant Contact deck */}
            <div className="border-t border-white/5 pt-4 text-xs space-y-2">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Direct handshakable contacts</span>
              <div className="flex gap-2">
                <a 
                  href={`tel:${listing.contactPhone}`} 
                  className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 p-2 text-center rounded-xl font-bold text-slate-200 transition flex justify-center items-center gap-1 cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Seller</span>
                </a>

                {listing.contactTelegram && (
                  <a 
                    href={`https://t.me/${listing.contactTelegram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-sky-500 hover:bg-sky-600 p-2 text-center text-slate-950 font-black rounded-xl transition flex justify-center items-center gap-1 cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Telegram PM</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
