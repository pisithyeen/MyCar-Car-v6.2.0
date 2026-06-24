import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Plus, 
  Sparkles, 
  Flame, 
  Eye, 
  MousePointerClick, 
  MessageSquare, 
  Share2, 
  TrendingUp, 
  ShieldCheck,
  Globe,
  Loader2,
  Check
} from 'lucide-react';
import { PartMarketplacePost, PartProduct } from './PartsData';

interface PartsMarketplaceProps {
  marketplacePosts: PartMarketplacePost[];
  products: PartProduct[];
  onAddPost: (post: PartMarketplacePost) => void;
  onModifyPostStatus: (postId: string, status: PartMarketplacePost['status']) => void;
  onBoostPost: (postId: string, duration: '3 days' | '7 days' | '15 days' | '30 days') => void;
  canManage: boolean;
}

export default function PartsMarketplace({ 
  marketplacePosts, 
  products, 
  onAddPost, 
  onModifyPostStatus, 
  onBoostPost,
  canManage 
}: PartsMarketplaceProps) {
  
  const [showAddPost, setShowAddPost] = useState(false);
  const [showBoostPostId, setShowBoostPostId] = useState<string | null>(null);
  
  // New posting form
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Braking System');
  const [brand, setBrand] = useState('Akebono');
  const [vehicleBrand, setVehicleBrand] = useState('Toyota');
  const [vehicleModel, setVehicleModel] = useState('Prius');
  const [yearRange, setYearRange] = useState('2010-2015');
  const [condition, setCondition] = useState<'New' | 'Used' | 'Refurbished'>('New');
  const [price, setPrice] = useState('32.00');
  const [stock, setStock] = useState('10');
  const [description, setDescription] = useState('');
  const [warranty, setWarranty] = useState('1 year replacement warranty');
  const [delivery, setDelivery] = useState('GrabExpress Phnom Penh / J&T Nationwide');
  const [pickup, setPickup] = useState('Sen Sok Store Branch, Phnom Penh');
  const [postType, setPostType] = useState<PartMarketplacePost['postType']>('Sell Part');
  
  // AI assistant loading states
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);

  // Boost form selection
  const [selectedBoost, setSelectedBoost] = useState<'3 days' | '7 days' | '15 days' | '30 days'>('7 days');
  const [showBoostQR, setShowBoostQR] = useState(false);

  const priceByBoost = {
    '3 days': 1.50,
    '7 days': 3.00,
    '15 days': 5.00,
    '30 days': 9.00
  };

  const handleAiCopywriter = async () => {
    if (!title) {
      alert("Please enter a basic part title first to feed the AI generator.");
      return;
    }

    setAiLoading(true);
    try {
      const res = await fetch("/api/parts/ai-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskType: 'generate-listing',
          payload: { name: title, brand, category, condition, details: description }
        })
      });
      const data = await res.json();
      if (data && !data.error) {
        setAiSuggestions(data);
        setTitle(data.aiTitle || title);
        setDescription(`${data.aiDescription || ''}\n\n[ភាសាខ្មែរ / Khmer]:\n${data.aiDescriptionKhmer || ''}\n\n🔥 Highlight Selling Points:\n${(data.sellingPoints || []).map((pt: string) => `• ${pt}`).join('\n')}`);
        setWarranty(data.suggestedPriceRange ? `Suggested range: ${data.suggestedPriceRange}. 1 Year full wear coverage.` : warranty);
        if (data.suggestedCategory) setCategory(data.suggestedCategory);
      }
    } catch (err) {
      console.error(err);
      alert("Could not reach AI copywriter assistance server. Loaded local templates.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmitPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price || !description) {
      alert("Missing description, price or title.");
      return;
    }

    const newPost: PartMarketplacePost = {
      id: `post-${Date.now()}`,
      title,
      category,
      brand,
      vehicleBrand,
      vehicleModel,
      yearRange,
      condition,
      price: parseFloat(price) || 0,
      stockAvailable: parseInt(stock) || 1,
      description,
      warranty,
      deliveryOption: delivery,
      pickupLocation: pickup,
      images: ["https://images.unsplash.com/photo-1548345680-f5475ea5df84?w=400&auto=format&fit=crop&q=60"],
      sellerProfile: "MyCar Care KH Official Admin",
      postType,
      status: 'Active', // Instantly active for demo/owner
      isBoosted: false,
      views: 12,
      clicks: 2,
      messages: 0,
      createdAt: new Date().toISOString()
    };

    onAddPost(newPost);
    setShowAddPost(false);

    // reset states
    setTitle('');
    setDescription('');
    setAiSuggestions(null);
  };

  const handleApplyBoost = () => {
    if (!showBoostPostId) return;
    onBoostPost(showBoostPostId, selectedBoost);
    setShowBoostQR(false);
    setShowBoostPostId(null);
    alert(`Success! Ad listed as Boosted 🔥 for next ${selectedBoost}!`);
  };

  return (
    <div className="space-y-4 font-sans" id="parts_marketplace_section">
      {/* Banner introduction */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div>
          <h2 className="text-lg font-medium text-white flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-indigo-400" />
            Marketplace Listing Generator
          </h2>
          <p className="text-xs text-slate-400">Post spare parts directly onto the community catalog and track click feedback stats.</p>
        </div>

        {canManage && (
          <button 
            onClick={() => setShowAddPost(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg text-xs font-semibold"
          >
            <Plus className="h-4 w-4" /> Create Marketplace Ad
          </button>
        )}
      </div>

      {/* Ads listed catalog */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {marketplacePosts.length === 0 ? (
          <div className="col-span-2 text-center py-12 text-slate-500 bg-slate-900 border border-slate-800 rounded-xl">
            No marketplace entries currently cataloged.
          </div>
        ) : (
          marketplacePosts.map((post) => {
            const isApproved = post.status === 'Active' || post.status === 'Approved';
            return (
              <div 
                key={post.id} 
                className={`relative bg-slate-900 border ${
                  post.isBoosted ? 'border-amber-500 shadow-lg shadow-amber-500/5' : 'border-slate-800'
                } rounded-xl p-4 flex flex-col justify-between`}
              >
                {/* Boosted badge */}
                {post.isBoosted && (
                  <span className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-mono text-[9px] font-bold uppercase tracking-widest animate-pulse">
                    <Flame className="h-3 w-3 fill-slate-950" /> Boosted Active
                  </span>
                )}

                <div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mb-1">
                    <span className="bg-slate-950 text-slate-350 px-1.5 py-0.5 rounded uppercase font-mono">{post.postType}</span>
                    <span>•</span>
                    <span>{post.category}</span>
                  </div>

                  <h3 className="text-sm font-semibold text-slate-100 mt-1 leading-snug pr-24">
                    {post.title}
                  </h3>

                  <div className="mt-2 flex gap-3 text-xs text-slate-450">
                    <div className="flex items-center gap-1 bg-slate-950 p-1.5 rounded">
                      <span className="text-[10px] text-slate-500 block uppercase font-mono">Condition</span>
                      <span className="text-white font-medium">{post.condition}</span>
                    </div>
                    <div className="flex items-center gap-1 bg-slate-950 p-1.5 rounded">
                      <span className="text-[10px] text-slate-500 block uppercase font-mono">Sect</span>
                      <span className="text-white font-medium">{post.brand}</span>
                    </div>
                    <div className="flex items-center gap-1 bg-slate-900 border border-slate-850 p-1.5 rounded">
                      <span className="text-[10px] text-slate-500 block uppercase font-mono">Compatibility</span>
                      <span className="text-slate-300 font-medium font-mono">{post.vehicleBrand} {post.vehicleModel} ({post.yearRange})</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 mt-3 line-clamp-3 whitespace-pre-line leading-relaxed">
                    {post.description}
                  </p>
                </div>

                <div className="mt-4 pt-3.5 border-t border-slate-850 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex items-end gap-2.5">
                    <span className="text-lg font-bold text-emerald-400 font-mono">${post.price.toFixed(2)}</span>
                    <span className="text-[10.5px] text-slate-500 mb-0.5 font-sans">Stock: {post.stockAvailable} units</span>
                  </div>

                  {/* Feedback telemetry logs */}
                  <div className="flex items-center gap-3.5 text-xs text-slate-500">
                    <span className="flex items-center gap-1" title="Ad Views">
                      <Eye className="h-3.5 w-3.5" /> {post.views}
                    </span>
                    <span className="flex items-center gap-1" title="Link clicks">
                      <MousePointerClick className="h-3.5 w-3.5" /> {post.clicks}
                    </span>
                    <span className="flex items-center gap-1" title="In-app chats">
                      <MessageSquare className="h-3.5 w-3.5" /> {post.messages}
                    </span>
                  </div>
                </div>

                {/* Operations active controls */}
                {canManage && (
                  <div className="mt-4 flex gap-2 pt-2 border-t border-slate-900">
                    {!post.isBoosted && (
                      <button 
                        onClick={() => setShowBoostPostId(post.id)}
                        className="flex-1 py-1 px-3 bg-amber-500 text-slate-950 rounded text-xs font-semibold flex items-center justify-center gap-1 hover:bg-amber-400 transition"
                      >
                        <Flame className="h-3.5 w-3.5 fill-slate-950" /> Boost This Post
                      </button>
                    )}
                    
                    <button 
                      onClick={() => onModifyPostStatus(post.id, post.status === 'Active' ? 'Hidden' : 'Active')}
                      className={`py-1 px-3 rounded text-xs ${
                        post.status === 'Active' ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-emerald-900 text-white hover:bg-emerald-800'
                      }`}
                    >
                      {post.status === 'Active' ? 'Hide Post' : 'Activate Ad'}
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* CREATE AD DIALOG */}
      {showAddPost && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 text-white font-sans max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-850 pb-3 mb-4">
              <h3 className="text-base font-semibold font-mono text-emerald-400 flex items-center gap-1.5">
                <Globe className="h-4 w-4" /> Create Marketplace Classified Ad
              </h3>
              
              {/* AI Auto generator button */}
              <button
                type="button"
                onClick={handleAiCopywriter}
                disabled={aiLoading}
                className="flex items-center gap-1 py-1 px-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 rounded text-xs font-semibold text-white transition font-sans"
              >
                {aiLoading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Cooking...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5 text-amber-300" /> AI Copywriter Assistant
                  </>
                )}
              </button>
            </div>

            <form onSubmit={handleSubmitPost} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-slate-400 mb-1">Classified Ad Title *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Original Ceramic Front Brake Pads Toyota Prius 2010"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">Specify your keyword and brand so the AI copywriter knows how to formulate description summaries.</span>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Sourcing Brand</label>
                  <input 
                    type="text" 
                    placeholder="Akebono, Denso, etc."
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Category Group</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="Braking System">Braking System</option>
                    <option value="Electrical & Ignition">Electrical & Ignition</option>
                    <option value="Filters & Maintenance">Filters & Maintenance</option>
                    <option value="High Voltage / Energy">High Voltage / Energy</option>
                    <option value="Suspension Components">Suspension Components</option>
                  </select>
                </div>
              </div>

              {/* Compatibility specifications */}
              <div className="p-3 bg-slate-950 border border-slate-850 rounded-lg space-y-2">
                <span className="text-[10px] uppercase font-mono text-indigo-400 font-bold block">Vehicle Compatibility Blueprint</span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-550">Brand</label>
                    <input 
                      type="text" 
                      value={vehicleBrand}
                      onChange={(e) => setVehicleBrand(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-550">Model name</label>
                    <input 
                      type="text" 
                      value={vehicleModel}
                      onChange={(e) => setVehicleModel(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-550">Compatible Years</label>
                    <input 
                      type="text" 
                      value={yearRange}
                      onChange={(e) => setYearRange(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Unit Price ($) *</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    className="w-full bg-slate-950 font-mono border border-slate-850 rounded-lg px-3 py-2 text-emerald-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">In-Stock Available</label>
                  <input 
                    type="number" 
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full bg-slate-950 font-mono border border-slate-850 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Ad Post Type</label>
                  <select
                    value={postType}
                    onChange={(e) => setPostType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="Sell Part">Sell Spare Part</option>
                    <option value="Used Part">Used Spare Part</option>
                    <option value="Refurbished Part">Refurbished Part</option>
                    <option value="Wholesale Offer">Wholesale Offer Package</option>
                    <option value="Clearance Stock">Clearance Stock Sale</option>
                    <option value="Pre-Order">Pre-Order Booking</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Ad Description Text *</label>
                <textarea 
                  rows={4}
                  placeholder="Tell clients about original fittings, reliable tested status, shipping timelines... Or tap the AI Copywriter button at the top to draft this instantly!"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-slate-300 leading-relaxed focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Warranty Term</label>
                  <input 
                    type="text" 
                    value={warranty}
                    onChange={(e) => setWarranty(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Delivery Protocol</label>
                  <input 
                    type="text" 
                    value={delivery}
                    onChange={(e) => setDelivery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="flex gap-2.5 justify-end pt-3 border-t border-slate-850">
                <button 
                  type="button" 
                  onClick={() => setShowAddPost(false)}
                  className="px-4 py-2 bg-slate-850 hover:bg-slate-800 text-slate-400 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-lg"
                >
                  Post to Live Marketplace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AD BOOST PAYMENT GATEWAY DIALOG */}
      {showBoostPostId && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-sm w-full p-6 text-white font-sans text-center">
            <TrendingUp className="h-10 w-10 text-amber-500 mx-auto fill-amber-500/20 mb-2 animate-bounce" />
            <h3 className="text-base font-semibold font-mono text-amber-500">
              Boost Ad Visibility Campaign
            </h3>
            <p className="text-slate-400 text-xs mt-1">
              Promote your spare parts list in the top results grid of our Cambodian user app for immediate eyeballs.
            </p>

            <div className="space-y-2 mt-4 text-left">
              <label className="block text-[10.5px] text-slate-500 uppercase tracking-widest font-mono">Select Promotion Duration</label>
              <div className="space-y-2 text-xs">
                {Object.entries(priceByBoost).map(([dur, pVal]) => (
                  <label 
                    key={dur}
                    className={`flex items-center justify-between p-2.5 rounded-lg border bg-slate-950 cursor-pointer transition ${
                      selectedBoost === dur ? 'border-amber-500 bg-amber-500/5' : 'border-slate-850 hover:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input 
                        type="radio" 
                        name="boost_dur"
                        checked={selectedBoost === dur}
                        onChange={() => setSelectedBoost(dur as any)}
                        className="accent-amber-500"
                      />
                      <span className="font-semibold text-slate-200">{dur} Exposure</span>
                    </div>
                    <span className="font-bold text-amber-500 text-sm font-mono">${pVal.toFixed(2)}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* QR Payment Code logic */}
            {showBoostQR ? (
              <div className="mt-5 p-4 bg-white rounded-lg inline-block shadow-inner space-y-1 z-10 relative">
                <span className="text-[10px] font-mono text-slate-900 font-bold block bg-red-100 rounded text-red-500 py-0.5 px-1 uppercase tracking-wider">MyCar Care KH QR</span>
                {/* Visual mock QR frame */}
                <div className="h-32 w-32 bg-slate-100 mx-auto border-2 border-slate-350 flex items-center justify-center rounded">
                  <span className="text-[10px] text-slate-400 font-mono">[KHQR • ${priceByBoost[selectedBoost].toFixed(2)}]</span>
                </div>
                <p className="text-[10px] text-slate-700 font-sans mt-2">Scan with Bakong or ABA Bank Pay</p>
                
                <button
                  onClick={handleApplyBoost}
                  className="w-full mt-3 py-1.5 bg-emerald-500 text-slate-950 rounded text-xs font-bold"
                >
                  Confirm App Transfer Complete ✅
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowBoostQR(true)}
                className="w-full mt-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-semibold"
              >
                Generate KHQR Payment Link (${priceByBoost[selectedBoost].toFixed(2)})
              </button>
            )}

            <button
              onClick={() => {
                setShowBoostQR(false);
                setShowBoostPostId(null);
              }}
              className="mt-3 block w-full py-1.5 bg-slate-850 hover:bg-slate-800 rounded-lg text-xs text-slate-400 font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
