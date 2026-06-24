import React, { useState } from "react";
import { 
  BarChart3, 
  Tag, 
  Sparkles, 
  User, 
  MessageCircle, 
  Eye, 
  MousePointer, 
  Clock, 
  CheckCircle2, 
  Wrench, 
  FileText, 
  Calendar, 
  AlertTriangle, 
  Coins, 
  UserCheck, 
  Send,
  Zap,
  ShoppingBag
} from "lucide-react";
import { PartListing } from "../types";

interface MarketplaceDashboardProps {
  listings: PartListing[];
  onBoostListing: (id: string, packageType: string) => void;
  onUpdateStatus: (id: string, status: 'Active' | 'Sold' | 'Draft' | 'Suspended') => void;
  onTransferOwnership: (listingId: string, recipientEmailOrPhone: string) => void;
  careCoinsBalance: number;
}

export default function MarketplaceDashboard({
  listings,
  onBoostListing,
  onUpdateStatus,
  onTransferOwnership,
  careCoinsBalance
}: MarketplaceDashboardProps) {
  const [activeSubTab, setActiveSubTab] = useState<'listings' | 'inquiries' | 'performance'>('listings');
  const [filterType, setFilterType] = useState<'All' | 'Active' | 'Pending' | 'Sold' | 'Draft' | 'Boosted'>('All');
  const [boostingId, setBoostingId] = useState<string | null>(null);
  const [boostingSuccess, setBoostingSuccess] = useState<string | null>(null);
  const [selectedListingForTransfer, setSelectedListingForTransfer] = useState<PartListing | null>(null);
  const [transferTarget, setTransferTarget] = useState("");
  const [transferDone, setTransferDone] = useState(false);

  // Filter local listings
  const sellerListings = listings.filter(l => l.contactName === "Yeon Pisith" || l.id.startsWith("part-"));

  const filteredListings = sellerListings.filter(l => {
    if (filterType === 'All') return true;
    if (filterType === 'Active') return l.status === 'Active';
    if (filterType === 'Pending') return l.status === 'Pending Approval';
    if (filterType === 'Sold') return l.status === 'Sold';
    if (filterType === 'Draft') return l.status === 'Draft';
    if (filterType === 'Boosted') return l.isBoosted;
    return true;
  });

  // Calculate stats
  const totalViews = sellerListings.reduce((sum, l) => sum + (l.views || 0), 0);
  const totalClicks = sellerListings.reduce((sum, l) => sum + (l.clicks || Math.round((l.views || 0) * 0.3)), 0);
  const totalChats = sellerListings.reduce((sum, l) => sum + (l.chatRequests || Math.floor((l.views || 0) * 0.08)), 0);
  const totalOffers = sellerListings.reduce((sum, l) => sum + (l.offerCount || 0), 0) + 2; // high-fidelity pre-seed

  const mockOffers = [
    { id: "o-1", title: "2015 Ford Ranger Wildtrak", buyer: "Nguon Lim", amount: 16800, date: "2026-06-05", status: "Pending Decision", type: "Vehicle Offer" },
    { id: "o-2", title: "Tacoma Brake Rotors", buyer: "Heng Samnang", amount: 85, date: "2026-06-06", status: "Accepted", type: "Part Offer" },
    { id: "o-3", title: "Muffler Exhaust Upgrade", buyer: "Vireak Cheat", amount: 120, date: "2026-06-07", status: "Declined", type: "Accessory Offer" }
  ];

  const mockInquiries = [
    { id: "i-1", title: "2015 Ford Ranger Wildtrak", user: "Chea Sopheak", msg: "Hello, has the transmission been serviced recently? Plate blur makes it hard to check online logs.", type: "Inquiry" },
    { id: "i-2", title: "2015 Ford Ranger Wildtrak", user: "Kimsour", msg: "Can I book a pre-purchase garage inspection for tomorrow afternoon?", type: "Inspection Request" },
    { id: "i-3", title: " Genuine Toyota Tacoma Rotors", user: "Sokhom", msg: "Bro, is the price slightly negotiable if I meet you at Toul Kork?", type: "Inquiry" }
  ];

  const handleBoostActivate = (listingId: string, packageType: string) => {
    onBoostListing(listingId, packageType);
    setBoostingSuccess(`Successfully applied ${packageType} boost to your listing! 🚀`);
    setBoostingId(null);
    setTimeout(() => {
      setBoostingSuccess(null);
    }, 4000);
  };

  const executeTransfer = (listing: PartListing) => {
    if (!transferTarget) return;
    onTransferOwnership(listing.id, transferTarget);
    setTransferDone(true);
    setTimeout(() => {
      onUpdateStatus(listing.id, 'Sold');
      setSelectedListingForTransfer(null);
      setTransferTarget("");
      setTransferDone(false);
    }, 2500);
  };

  return (
    <div id="seller-dashboard-panel" className="bg-slate-900 border border-white/10 rounded-3xl p-6 space-y-6">
      {/* Upper header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Yeon Pisith's Merchant Hub
            </span>
          </div>
          <h2 className="text-lg font-black text-slate-100 flex items-center gap-2 mt-1 uppercase tracking-wide">
            <BarChart3 className="w-5 h-5 text-sky-400" />
            <span>Interactive Seller Workstation</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Promote listings, monitor buyer inquiries, accept payment handshakes, and manage digital ownership transfers.
          </p>
        </div>

        {/* Coins Wallet integration card */}
        <div className="bg-slate-950 p-3 rounded-2xl border border-white/5 flex items-center gap-3 self-start md:self-auto">
          <div className="p-2 bg-amber-400/10 rounded-xl border border-amber-400/20 text-amber-400">
            <Coins className="w-4.5 h-4.5 text-amber-400 animate-spin-slow" />
          </div>
          <div className="text-left">
            <span className="text-[9px] text-slate-500 block uppercase font-bold">Wallet Coins</span>
            <span className="text-sm font-black font-mono text-amber-400 block">{careCoinsBalance} KH-Coins</span>
          </div>
        </div>
      </div>

      {boostingSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl font-bold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{boostingSuccess}</span>
        </div>
      )}

      {/* Stats Board */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Aggregate Views", val: totalViews, desc: "Total listing eyes", icon: <Eye className="w-4 h-4 text-sky-400" /> },
          { label: "Organic Clicks", val: totalClicks, desc: "Conversion click-through", icon: <MousePointer className="w-4 h-4 text-emerald-400" /> },
          { label: "Active Chat Requests", val: totalChats, desc: "Instant Telegram pings", icon: <MessageCircle className="w-4 h-4 text-indigo-400" /> },
          { label: "Received Offers", val: totalOffers, desc: "Cash & Exchange bids", icon: <Tag className="w-4 h-4 text-amber-400" /> }
        ].map((stat, idx) => (
          <div key={idx} className="bg-slate-950/60 p-4 rounded-2xl border border-white/5 flex flex-col justify-between">
            <div className="flex justify-between items-center text-slate-500">
              <span className="text-[10px] font-extrabold uppercase tracking-wide">{stat.label}</span>
              {stat.icon}
            </div>
            <div className="mt-2 text-left">
              <span className="text-xl font-black text-slate-100 font-mono block">{stat.val}</span>
              <span className="text-[9px] text-slate-500 block">{stat.desc}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Mini Tabs */}
      <div className="flex border-b border-white/5 pb-0.5 gap-4">
        {[
          { id: 'listings', n: 'My Active Listings', b: sellerListings.length },
          { id: 'inquiries', n: 'Interactions & Inquiries', b: mockInquiries.length + mockOffers.length },
          { id: 'performance', n: 'Listing Performance Engine', b: 0 }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveSubTab(t.id as any)}
            className={`pb-2.5 text-xs font-bold relative transition cursor-pointer ${
              activeSubTab === t.id ? 'text-sky-400 border-b-2 border-sky-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <span>{t.n}</span>
              {t.b > 0 && <span className="text-[9px] font-bold px-1.5 bg-slate-950 border border-white/5 rounded-full text-slate-300">{t.b}</span>}
            </span>
          </button>
        ))}
      </div>

      {/* Subtab Content blocks */}
      {activeSubTab === 'listings' && (
        <div className="space-y-4 text-left">
          {/* Action filters */}
          <div className="flex flex-wrap items-center gap-2">
            {(['All', 'Active', 'Pending', 'Sold', 'Draft', 'Boosted'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setFilterType(filter)}
                className={`px-3 py-1 text-[10px] uppercase font-black rounded-lg border transition cursor-pointer ${
                  filterType === filter 
                    ? 'bg-sky-500/15 border-sky-500 text-sky-400' 
                    : 'bg-transparent border-white/5 text-slate-400 hover:text-white'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {filteredListings.length === 0 ? (
            <div className="bg-slate-950/40 p-10 text-center rounded-2xl border border-dashed border-white/5">
              <ShoppingBag className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-300 font-bold">No match listings under "{filterType}"</p>
              <p className="text-[10px] text-slate-500">Post a new classified ad or convert your vehicle profile into a marketplace selling post.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredListings.map((listing) => (
                <div key={listing.id} className="bg-slate-950 p-4 border border-white/5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition hover:border-white/10">
                  <div className="flex gap-3.5 items-start">
                    <img 
                      src={listing.photos[0] || "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=400"} 
                      className="w-16 h-16 rounded-xl border border-white/5 object-cover shrink-0" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[9px] uppercase font-bold px-1.5 bg-sky-500/10 border border-sky-500/10 rounded text-sky-400`}>
                          {listing.category}
                        </span>
                        <span className={`text-[9px] uppercase font-bold px-1.5 ${
                          listing.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' :
                          listing.status === 'Sold' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/10' :
                          listing.status === 'Pending Approval' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/10' :
                          'bg-slate-800 text-slate-400'
                        } border rounded`}>
                          {listing.status}
                        </span>
                        {listing.isBoosted && (
                          <span className="bg-amber-400/15 border border-amber-400/20 text-amber-400 text-[8.5px] uppercase font-black px-1.5 rounded flex items-center gap-0.5">
                            <Zap className="w-2.5 h-2.5 text-amber-400 fill-amber-400" /> BOOSTED
                          </span>
                        )}
                        {listing.isVehicleSellingPost && (
                          <span className="bg-pink-500/10 border border-pink-500/25 text-pink-400 text-[8.5px] uppercase font-black px-1.5 rounded">
                            CAR PROFILE POST
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-white leading-tight">{listing.title}</h4>
                      <p className="text-[10px] text-slate-500 font-mono">
                        Price: ${listing.price} | Views: {listing.views || 0} | Location: {listing.location}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 shrink-0 w-full md:w-auto justify-end">
                    {listing.status !== 'Sold' && (
                      <button
                        onClick={() => setBoostingId(listing.id)}
                        className="p-1.5 px-3 bg-amber-400 text-slate-950 text-[10px] font-black rounded-lg hover:bg-amber-500 transition cursor-pointer uppercase flex items-center gap-1"
                      >
                        <Zap className="w-3.5 h-3.5" /> Boost Ad
                      </button>
                    )}
                    
                    {listing.status === 'Active' && listing.isVehicleSellingPost && (
                      <button
                        onClick={() => {
                          setSelectedListingForTransfer(listing);
                          setTransferTarget("");
                        }}
                        className="p-1.5 px-3 bg-indigo-500 text-white text-[10px] font-black rounded-lg hover:bg-indigo-600 transition cursor-pointer uppercase flex items-center gap-1"
                      >
                        <Send className="w-3.5 h-3.5" /> Handshake Transfer
                      </button>
                    )}

                    {listing.status === 'Active' && (
                      <button
                        onClick={() => onUpdateStatus(listing.id, 'Sold')}
                        className="p-1.5 px-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-[10px] font-black rounded-lg transition cursor-pointer uppercase"
                      >
                        ✓ Mark Sold
                      </button>
                    )}

                    {listing.status === 'Draft' && (
                      <button
                        onClick={() => onUpdateStatus(listing.id, 'Active')}
                        className="p-1.5 px-3 bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold rounded-lg border border-white/10 transition cursor-pointer uppercase"
                      >
                        Publish Live
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'inquiries' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-left">
          {/* Sub block: Inquiries received */}
          <div className="space-y-3 bg-slate-950/40 p-4.5 rounded-2xl border border-white/5">
            <h3 className="text-xs font-bold text-white flex items-center gap-1 uppercase tracking-wide">
              <MessageCircle className="w-4 h-4 text-sky-400" />
              <span>Buyer Inquiries Raised</span>
            </h3>

            <div className="space-y-2.5">
              {mockInquiries.map(inq => (
                <div key={inq.id} className="bg-slate-950 p-3 rounded-xl border border-white/5 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-extrabold text-sky-400 uppercase flex items-center gap-1">
                      <User className="w-3 h-3 text-sky-400" /> {inq.user}
                    </span>
                    <span className="text-slate-500 font-mono bg-white/3 px-1.5 py-0.5 rounded uppercase font-bold text-[8.5px]">
                      {inq.title}
                    </span>
                  </div>
                  <p className="text-slate-300 italic text-[11px]">"{inq.msg}"</p>
                  <div className="flex gap-2">
                    <a 
                      href="https://t.me/pi_sith_kh" 
                      target="_blank" 
                      rel="referrer" 
                      className="p-1 px-2.5 bg-sky-500/10 text-sky-400 border border-sky-500/15 rounded text-[10px] font-bold hover:bg-sky-500/15 transition flex items-center gap-1"
                    >
                      <MessageCircle className="w-3 h-3" /> Reply on Telegram
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sub block: Offers received */}
          <div className="space-y-3 bg-slate-950/40 p-4.5 rounded-2xl border border-white/5">
            <h3 className="text-xs font-bold text-white flex items-center gap-1 uppercase tracking-wide">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>Offers & Booking Requests</span>
            </h3>

            <div className="space-y-2.5">
              {mockOffers.map(off => (
                <div key={off.id} className="bg-slate-950 p-3 rounded-xl border border-white/5 flex justify-between items-center text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-slate-200">{off.buyer}</span>
                      <span className="text-[9px] bg-amber-400/10 text-amber-400 px-1 rounded uppercase font-bold">{off.type}</span>
                    </div>
                    <p className="text-[10px] text-slate-500">Item: {off.title}</p>
                    <p className="text-[10px] text-slate-500">Date: {off.date}</p>
                  </div>

                  <div className="text-right space-y-1.5">
                    <span className="text-sm font-black text-amber-400 block font-mono">${off.amount}</span>
                    <div className="flex gap-1.5">
                      <button 
                        onClick={() => alert(`Offer from ${off.buyer} accepted! Document transfer process enabled.`)}
                        className="py-0.5 px-2 bg-emerald-500 text-slate-950 font-extrabold rounded text-[9.5px] transition hover:bg-emerald-450"
                      >
                        Accept
                      </button>
                      <button 
                        onClick={() => alert("Offer declined.")}
                        className="py-0.5 px-2 bg-white/5 text-slate-400 rounded text-[9.5px] transition hover:bg-white/10"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'performance' && (
        <div className="bg-slate-950/40 p-6 rounded-2xl border border-white/5 text-center space-y-3">
          <BarChart3 className="w-8 h-8 text-sky-400 mx-auto animate-pulse" />
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">AI Sells Optimizer Analytics</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Our search ranking engine confirms your Tacoma Rotors listing has matched 9 Toyota search terms today in Sihanoukville! Complete a garage verification badge to unlock a further 4x promotion multiplier.
          </p>

          <div className="pt-2">
            <span className="inline-block p-1 bg-sky-500/10 text-sky-400 text-[10px] uppercase font-black border border-sky-500/20 rounded px-3">
              Core SEO Match Integrity: 98% Ultra-Clean
            </span>
          </div>
        </div>
      )}

      {/* Boost Overlay Dialog */}
      {boostingId && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 p-6 rounded-3xl max-w-md w-full text-left space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
              <h3 className="text-sm font-black text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>Configure Marketplace Boost Packages</span>
              </h3>
              <button onClick={() => setBoostingId(null)} className="text-slate-400 hover:text-white transition">Close</button>
            </div>

            <p className="text-[11px] text-slate-400">
              Apply high-intensity visual branding and rank-multiplier indexing using Care Coins. Attract urgent buyers instantly.
            </p>

            <div className="space-y-2">
              {[
                { name: "Basic Gold Boost", coins: 15, duration: "3 Days", desc: "Doubles search listing rank weight.", color: "border-yellow-500/20 bg-yellow-500/5 hover:bg-yellow-500/10 text-yellow-350" },
                { name: "Premium Red-Urgent Boost", coins: 30, duration: "7 Days", desc: "Urgent red badge on card + highlighted gradient frame.", color: "border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-300" },
                { name: "Featured Hero Banner Banner", coins: 50, duration: "14 Days", desc: "Locked top carousel slideshow placement. Includes manual inspector endorsement status.", color: "border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-300" }
              ].map((pkg, i) => {
                const canAfford = careCoinsBalance >= pkg.coins;
                return (
                  <button
                    key={i}
                    onClick={() => canAfford && handleBoostActivate(boostingId, pkg.name)}
                    disabled={!canAfford}
                    className={`w-full text-left p-3 border rounded-xl flex justify-between items-center transition cursor-pointer text-xs ${pkg.color} ${!canAfford ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    <div className="space-y-0.5 max-w-[280px]">
                      <span className="font-extrabold block">{pkg.name} ({pkg.duration})</span>
                      <span className="text-[10px] text-slate-400 block leading-tight">{pkg.desc}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-black text-amber-400 block font-mono">{pkg.coins} Coins</span>
                      <span className="text-[9px] text-slate-400 block font-semibold">{canAfford ? 'Apply Now' : 'Insuff. Balance'}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Transfer Overlay Modal */}
      {selectedListingForTransfer && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 p-6 rounded-3xl max-w-md w-full text-left space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
              <h3 className="text-sm font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                <Send className="w-4 h-4" />
                <span>Electronic Ownership Handshake</span>
              </h3>
              <button 
                onClick={() => {
                  if (!transferDone) setSelectedListingForTransfer(null);
                }} 
                className="text-slate-400 hover:text-white transition"
              >
                Cancel
              </button>
            </div>

            {transferDone ? (
              <div className="py-6 text-center space-y-3">
                <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center justify-center mx-auto text-indigo-400 animate-pulse">
                  <UserCheck className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-black text-indigo-400">HANDSHAKE SIGNATURE RECORDED</h4>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                  Owner keys migrating. This car profile ("{selectedListingForTransfer.title}") and all service history reports will now transfer to the recipient account. You are losing edit access key capabilities.
                </p>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 text-[11px] text-indigo-300">
                  ⚠️ <strong>Rule Directive:</strong> In accordance with Requirement 13, transferring ownership will shift full management logs to the buyer. You will lose control after they accept.
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Recipient Account (Phone, Email or User ID)</label>
                  <input
                    type="text"
                    placeholder="e.g. +855 12 777 888 or buyer@care-kh.net"
                    value={transferTarget}
                    onChange={(e) => setTransferTarget(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 p-2.5 rounded-xl text-white focus:border-indigo-500 transition"
                  />
                </div>

                <p className="text-[10.5px] text-slate-500">
                  Target: <em>{selectedListingForTransfer.title}</em> (${selectedListingForTransfer.price} USD)
                </p>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedListingForTransfer(null)}
                    className="flex-1 py-2 bg-white/5 text-slate-350 hover:bg-white/10 rounded-xl font-bold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => executeTransfer(selectedListingForTransfer)}
                    disabled={!transferTarget}
                    className="flex-1 py-2 bg-indigo-500 text-slate-950 disabled:opacity-50 font-black rounded-xl hover:bg-slate-100 hover:text-slate-950 transition cursor-pointer uppercase tracking-widest text-[10.5px]"
                  >
                    Confirm Transfer
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
