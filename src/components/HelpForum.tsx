import React, { useState, useEffect } from "react";
import { 
  MessageSquare, 
  Plus, 
  Search, 
  Filter, 
  ThumbsUp, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  DollarSign, 
  Wrench, 
  Truck, 
  Info, 
  Sparkles, 
  Clock, 
  ArrowRight, 
  MapPin, 
  UserCheck, 
  RefreshCw,
  X,
  PlusCircle,
  HelpCircle
} from "lucide-react";
import { ForumPost, ForumComment, VehicleProfile } from "../types";

interface HelpForumProps {
  vehicles: VehicleProfile[];
  selectedVehicle: VehicleProfile | null;
  onRefreshData?: () => void;
  initialCategory?: string;
  onNavigateTab?: (tab: string) => void;
}

export default function HelpForum({ vehicles, selectedVehicle, onRefreshData, initialCategory, onNavigateTab }: HelpForumProps) {
  // DB State
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  
  // Filtering & Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || "");
  const [selectedUrgency, setSelectedUrgency] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  // Sync initialCategory when it changes from props
  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [selectedCommentForResolve, setSelectedCommentForResolve] = useState<string | null>(null);

  // New Post Form state
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newBrand, setNewBrand] = useState("Toyota");
  const [newModel, setNewModel] = useState("Prius");
  const [newYear, setNewYear] = useState("2010");
  const [newEngine, setNewEngine] = useState("1.8L");
  const [newMileage, setNewMileage] = useState("210000");
  const [newCategory, setNewCategory] = useState("Engine Oil & Lubrication");
  const [newLocation, setNewLocation] = useState("Phnom Penh");
  const [newUrgency, setNewUrgency] = useState<'Low' | 'Medium' | 'High' | 'Emergency'>("Medium");
  const [newNeedMechanic, setNewNeedMechanic] = useState(false);
  const [newNeedRecommendation, setNewNeedRecommendation] = useState(false);
  const [newNeedSparePart, setNewNeedSparePart] = useState(false);
  const [newBudget, setNewBudget] = useState("");
  const [newPreferredDate, setNewPreferredDate] = useState("");
  const [newPostLoading, setNewPostLoading] = useState(false);

  // New Comment Form state
  const [newCommentContent, setNewCommentContent] = useState("");
  const [newCommentType, setNewCommentType] = useState<ForumComment['commentType']>("Technical Solution");
  const [commenterRole, setCommenterRole] = useState<ForumComment['authorRole']>("Verified Mechanic");
  const [commenterName, setCommenterName] = useState("Sokha Engine Shop");
  const [commenterBadge, setCommenterBadge] = useState("Toyota Hybrid Expert");
  
  // Spare-parts subform fields
  const [partName, setPartName] = useState("");
  const [partCondition, setPartCondition] = useState<'New' | 'Used'>("New");
  const [partCompatibility, setPartCompatibility] = useState("");
  const [partPrice, setPartPrice] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("2 Hours");
  const [partWarranty, setPartWarranty] = useState("3 Months Warranty");
  const [supplierContact, setSupplierContact] = useState("+855 12 777 888");

  // Resolution Form state
  const [resolvedNote, setResolvedNote] = useState("");
  const [resolvedCost, setResolvedCost] = useState("");
  const [resolvedGarage, setResolvedGarage] = useState("");
  const [resolvedPartUsed, setResolvedPartUsed] = useState("");
  const [saveToHistory, setSaveToHistory] = useState(true);

  // AI loading check
  const [aiAnalyzingId, setAiAnalyzingId] = useState<string | null>(null);

  // Categories list matching Cambodia specific roles
  const categories = [
    "Battery / Starting Problem",
    "EV / Hybrid Vehicle",
    "Engine Noise / Overheating",
    "Transmission / Gearbox shift",
    "Brake squealing / Wear",
    "Suspension shaking / Bushing damage",
    "Air Conditioning warm blow",
    "Spare Part Search / Import",
    "Electrical System",
    "Monsoon / Water Drainage damage"
  ];

  // Fetch posts from API
  const fetchPosts = async () => {
    setLoading(true);
    try {
      let url = "/api/forum/posts";
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (selectedCategory) params.append("category", selectedCategory);
      if (selectedUrgency) params.append("urgency", selectedUrgency);
      if (selectedStatus) params.append("status", selectedStatus);
      
      const res = await fetch(`${url}?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
        // Sync selected post if open
        if (selectedPost) {
          const updatedSelected = data.find((p: ForumPost) => p.id === selectedPost.id);
          if (updatedSelected) {
            setSelectedPost(updatedSelected);
          }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [searchQuery, selectedCategory, selectedUrgency, selectedStatus]);

  // Handle post submit
  const handleCreatePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDescription) return;

    setNewPostLoading(true);
    try {
      const res = await fetch("/api/forum/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          description: newDescription,
          vehicleBrand: newBrand,
          vehicleModel: newModel,
          vehicleYear: Number(newYear),
          engineType: newEngine,
          mileage: Number(newMileage),
          category: newCategory,
          location: newLocation,
          urgency: newUrgency,
          needMechanic: newNeedMechanic,
          needRecommendation: newNeedRecommendation,
          needSparePart: newNeedSparePart,
          budget: newBudget,
          preferredDate: newPreferredDate,
          visibility: "Public"
        })
      });

      if (res.ok) {
        setShowCreateModal(false);
        // Erase form
        setNewTitle("");
        setNewDescription("");
        setNewNeedMechanic(false);
        setNewNeedRecommendation(false);
        setNewNeedSparePart(false);
        setNewBudget("");
        setNewPreferredDate("");
        
        // Refresh local data
        fetchPosts();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setNewPostLoading(false);
    }
  };

  // Upvote post
  const handleUpvotePost = async (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/forum/posts/${postId}/upvote`, { method: "POST" });
      if (res.ok) {
        setPosts(prev => prev.map(p => {
          if (p.id === postId) {
            return { ...p, upvotes: p.upvotes + 1 };
          }
          return p;
        }));
        if (selectedPost && selectedPost.id === postId) {
          setSelectedPost(prev => prev ? { ...prev, upvotes: prev.upvotes + 1 } : null);
        }
      }
    } catch (err) {}
  };

  // Upvote comment
  const handleUpvoteComment = async (postId: string, commentId: string) => {
    try {
      const res = await fetch(`/api/forum/posts/${postId}/comments/${commentId}/upvote`, { method: "POST" });
      if (res.ok) {
        // Refetch or update locally
        setPosts(prev => prev.map(p => {
          if (p.id === postId) {
            const updatedComments = p.comments.map(c => {
              if (c.id === commentId) {
                return { ...c, upvotes: c.upvotes + 1 };
              }
              return c;
            });
            return { ...p, comments: updatedComments };
          }
          return p;
        }));
        if (selectedPost && selectedPost.id === postId) {
          setSelectedPost(prev => {
            if (!prev) return null;
            const updatedComments = prev.comments.map(c => {
              if (c.id === commentId) {
                return { ...c, upvotes: c.upvotes + 1 };
              }
              return c;
            });
            return { ...prev, comments: updatedComments };
          });
        }
      }
    } catch (err) {}
  };

  // Request deeper AI diagnosis
  const handleAIReDiagnose = async (postId: string) => {
    setAiAnalyzingId(postId);
    try {
      const res = await fetch(`/api/forum/posts/${postId}/ai-re-diagnose`, { method: "POST" });
      if (res.ok) {
        const payload = await res.json();
        if (payload.success) {
          // Update post state locally
          setPosts(prev => prev.map(p => {
            if (p.id === postId) {
              return { ...p, aiSuggestion: payload.aiSuggestion };
            }
            return p;
          }));
          if (selectedPost && selectedPost.id === postId) {
            setSelectedPost(prev => prev ? { ...prev, aiSuggestion: payload.aiSuggestion } : null);
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiAnalyzingId(null);
    }
  };

  // Submit comment / offer
  const handlePostCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPost || !newCommentContent) return;

    try {
      const payload: any = {
        content: newCommentContent,
        commentType: newCommentType,
        authorName: commenterName,
        authorRole: commenterRole,
        authorBadge: commenterBadge
      };

      if (newCommentType === "Spare-part Offer") {
        payload.partName = partName;
        payload.partCondition = partCondition;
        payload.partCompatibility = partCompatibility;
        payload.price = Number(partPrice) || undefined;
        payload.deliveryTime = deliveryTime;
        payload.warranty = partWarranty;
        payload.supplierContact = supplierContact;
      }

      const res = await fetch(`/api/forum/posts/${selectedPost.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const updatedPost = await res.json();
        setSelectedPost(updatedPost);
        // Clear comment box
        setNewCommentContent("");
        setPartName("");
        setPartPrice("");
        setPartCompatibility("");
        fetchPosts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Open resolve modal
  const handleOpenResolveFlow = (commentId: string) => {
    setSelectedCommentForResolve(commentId);
    
    // Find comment and prepopulate garage details if garage reply
    if (selectedPost) {
      const comment = selectedPost.comments.find(c => c.id === commentId);
      if (comment) {
        setResolvedGarage(comment.authorRole === "Verified Garage" || comment.authorRole === "Verified Mechanic" ? comment.authorName : "");
        setResolvedPartUsed(comment.partName || "");
        setResolvedCost(comment.price ? String(comment.price) : "");
        setResolvedNote(`Successfully solved issue with assistance from ${comment.authorName}.`);
      }
    }
    
    setShowResolveModal(true);
  };

  // Final Action: Accept Solution & Close Post / Sync History
  const handleResolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPost) return;

    try {
      const res = await fetch(`/api/forum/posts/${selectedPost.id}/accept-solution`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commentId: selectedCommentForResolve,
          resolvedNote,
          resolvedCost: Number(resolvedCost),
          resolvedGarage,
          resolvedPartUsed,
          saveToHistory
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setShowResolveModal(false);
          setSelectedPost(data.post);
          fetchPosts();
          
          // Trigger optional refresh of the main vehicle history database
          if (saveToHistory && onRefreshData) {
            onRefreshData();
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Pre-load current selected vehicle specs inside form helper
  const handlePreloadVehicleSpecs = () => {
    if (selectedVehicle) {
      setNewBrand(selectedVehicle.brand);
      setNewModel(selectedVehicle.model);
      setNewYear(String(selectedVehicle.year));
      setNewMileage(String(selectedVehicle.mileage));
      setNewEngine(selectedVehicle.fuelType === "Hybrid" ? "1.8L Hybrid" : selectedVehicle.fuelType === "EV" ? "Dynamic Electric" : "2.4L Engine");
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header & Summary Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-sky-400" />
            <h2 className="text-xl font-bold text-slate-100">MyCar Care Help Forum</h2>
          </div>
          <p className="text-xs text-slate-400">
            Post issues, request spare parts, and receive diagnostic suggestions from AI and Cambodia's experts.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-center">
          <button
            onClick={() => {
              handlePreloadVehicleSpecs();
              setShowCreateModal(true);
            }}
            className="px-4 py-2.5 bg-gradient-to-tr from-sky-450 to-indigo-500 bg-sky-500 hover:bg-sky-450 text-slate-950 font-extrabold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-lg"
          >
            <Plus className="w-4 h-4 text-slate-950" />
            <span>Ask Community / Post Issue</span>
          </button>

          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab("fix_my_car_bidding")}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-450 text-slate-950 font-black text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-lg"
            >
              <Wrench className="w-4 h-4 text-slate-950" />
              <span>Fix My Car Request & Bidding</span>
            </button>
          )}
        </div>
      </div>

      {/* Detail Post View Panel */}
      {selectedPost ? (
        <div className="space-y-6">
          {/* Back button */}
          <button 
            onClick={() => setSelectedPost(null)}
            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold rounded-lg transition border border-white/5 flex items-center gap-1 cursor-pointer"
          >
            <ArrowRight className="w-3.5 h-3.5 rotate-180" />
            <span>Back to Community Feed</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Post Core & AI Box */}
            <div className="lg:col-span-2 space-y-6">
              <div className="glass rounded-3xl p-6 border border-white/10 space-y-4">
                
                {/* Author row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-indigo-500/10 border border-indigo-400/20 flex items-center justify-center text-sm font-bold text-indigo-400">
                      {selectedPost.authorName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-200">{selectedPost.authorName}</span>
                        <span className="text-[9px] bg-white/10 text-slate-400 px-1.5 py-0.5 rounded-full">{selectedPost.authorRole}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {new Date(selectedPost.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Urgency Badge */}
                    <span className={`text-[10px] uppercase font-mono px-2.5 py-1 rounded-md border ${
                      selectedPost.urgency === 'Emergency' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                      selectedPost.urgency === 'High' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      'bg-slate-500/10 text-slate-400 border-slate-500/20'
                    }`}>
                      {selectedPost.urgency}
                    </span>

                    {/* Status Badge */}
                    <span className={`text-[10px] uppercase font-mono px-2.5 py-1 rounded-md border ${
                      selectedPost.status === 'Solved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      selectedPost.status === 'Open' ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' :
                      'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                    }`}>
                      {selectedPost.status}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <h3 className="text-base font-extrabold text-slate-100">{selectedPost.title}</h3>
                  <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-400">
                    <span className="bg-sky-500/5 text-sky-300 px-2 py-0.5 rounded border border-sky-500/10">
                      {selectedPost.category}
                    </span>
                    <span className="flex items-center gap-0.5 text-slate-500">
                      <MapPin className="w-3" /> {selectedPost.location}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-300 leading-relaxed bg-white/2 p-4 rounded-2xl border border-white/5 font-sans whitespace-pre-line">
                  {selectedPost.description}
                </p>

                {/* Attached Photo */}
                {selectedPost.photoUrl && (
                  <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-slate-950 max-h-72 flex justify-center items-center">
                    <img
                       src={selectedPost.photoUrl}
                       alt="Attached Forum Thread Illustration"
                       referrerPolicy="no-referrer"
                       className="max-h-72 w-auto object-contain"
                    />
                    <span className="absolute bottom-2.5 right-2.5 bg-black/85 border border-white/10 text-white font-mono text-[9px] px-2 py-0.5 rounded-md">
                      Attached Photo Attachment
                    </span>
                  </div>
                )}

                {/* Vehicle specifications specs card */}
                <div className="bg-white/3 border border-white/5 rounded-2xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-mono">Vehicle</span>
                    <span className="text-xs font-bold text-slate-200">{selectedPost.vehicleBrand} {selectedPost.vehicleModel}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-mono">Model Year</span>
                    <span className="text-xs font-bold text-slate-200">{selectedPost.vehicleYear}</span>
                  </div>
                  {selectedPost.engineType && (
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-mono">Engine / Fuel</span>
                      <span className="text-xs font-bold text-slate-200">{selectedPost.engineType}</span>
                    </div>
                  )}
                  {selectedPost.mileage && (
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-mono">Mileage</span>
                      <span className="text-xs font-bold text-slate-200">{selectedPost.mileage.toLocaleString()} km</span>
                    </div>
                  )}
                </div>

                {/* Support needs flags & metadata */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {selectedPost.needMechanic && (
                    <span className="bg-orange-500/10 text-orange-400 text-[10px] font-bold px-2.5 py-1 rounded-full border border-orange-500/20 flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5" />
                      <span>Mechanic Required</span>
                    </span>
                  )}
                  {selectedPost.needSparePart && (
                    <span className="bg-amber-500/10 text-amber-400 text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-500/20 flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5" />
                      <span>Spare Part Requested</span>
                    </span>
                  )}
                  {selectedPost.needRecommendation && (
                    <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-550/20 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5" />
                      <span>Seeking Recommendations</span>
                    </span>
                  )}
                  {selectedPost.budget && (
                    <span className="bg-sky-500/10 text-sky-400 text-[10px] font-mono px-2.5 py-1 rounded-full border border-sky-500/20 flex items-center gap-1">
                      <DollarSign className="w-3" /> Budget: {selectedPost.budget}
                    </span>
                  )}
                  {selectedPost.preferredDate && (
                    <span className="bg-purple-500/10 text-purple-400 text-[10px] font-mono px-2.5 py-1 rounded-full border border-purple-500/20 flex items-center gap-1">
                      <Calendar className="w-3" /> Target Date: {selectedPost.preferredDate}
                    </span>
                  )}
                </div>

                {/* Upvote support bar */}
                <div className="flex items-center gap-4 pt-3 border-t border-white/5">
                  <button 
                    onClick={(e) => handleUpvotePost(selectedPost.id, e)}
                    className="px-4 py-2 hover:bg-sky-500/10 text-sky-400 hover:text-sky-300 rounded-xl transition border border-white/10 flex items-center gap-2 text-xs font-bold cursor-pointer"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span>Upvote Issue ({selectedPost.upvotes})</span>
                  </button>
                  <span className="text-xs text-slate-500">
                    {selectedPost.comments.length} Expert recommendations and proposals received
                  </span>
                </div>
              </div>

              {/* Solved Banner Detail View if state is Solved */}
              {selectedPost.status === 'Solved' && (
                <div className="border border-emerald-500/30 bg-emerald-500/5 rounded-3xl p-5 space-y-3.5">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5.5 h-5.5 text-emerald-400 animate-pulse" />
                    <h4 className="text-sm font-extrabold text-slate-100 uppercase tracking-wide">
                      Problem Resolved & Solved Successfully
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase text-slate-500 block">Resolution Action Note</span>
                      <p className="text-slate-300 font-medium">{selectedPost.resolvedNote}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase text-slate-500 block">Garage Partner / Shop</span>
                      <p className="text-slate-200 font-bold flex items-center gap-1 text-emerald-400">
                        <MapPin className="w-3" /> {selectedPost.resolvedGarage}
                      </p>
                    </div>
                    {selectedPost.resolvedCost !== undefined && (
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase text-slate-500 block">Repair Cost Incurred</span>
                        <p className="text-slate-200 font-mono font-extrabold text-slate-100">
                          ${selectedPost.resolvedCost} USD
                        </p>
                      </div>
                    )}
                    {selectedPost.resolvedPartUsed && (
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase text-slate-500 block">Replacement Part Installed</span>
                        <p className="text-slate-300 font-sans">{selectedPost.resolvedPartUsed}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Comments Feed List */}
              <div className="space-y-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block px-1">
                  Community replies & Diagnostic Offers
                </span>

                {selectedPost.comments.length === 0 ? (
                  <div className="glass rounded-3xl p-8 text-center text-slate-500 text-xs">
                    No solutions suggested yet. Post a mechanic quotation or offer help below.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedPost.comments.map((comment) => {
                      const isAccepted = selectedPost.acceptedCommentId === comment.id;
                      return (
                        <div 
                          key={comment.id}
                          className={`rounded-2xl p-5 space-y-4 transition-all relative border ${
                            isAccepted 
                              ? "bg-emerald-500/5 border-emerald-555 border-emerald-500/40" 
                              : "glass border-white/5 hover:border-white/10"
                          }`}
                        >
                          {/* Banner if accepted */}
                          {isAccepted && (
                            <div className="absolute top-4 right-4 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[9px] font-mono tracking-widest uppercase font-extrabold">
                              ACCEPTED SOLUTION
                            </div>
                          )}

                          {/* Comment Header */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                comment.authorRole === 'Verified Garage' ? 'bg-orange-500/10 text-orange-400' :
                                comment.authorRole === 'Verified Mechanic' ? 'bg-sky-500/10 text-sky-400' :
                                comment.authorRole === 'Spare-Part Supplier' ? 'bg-amber-500/10 text-amber-400' :
                                'bg-slate-500/10 text-slate-400'
                              }`}>
                                {comment.authorName.charAt(0)}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-xs font-extrabold text-slate-200">{comment.authorName}</span>
                                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                                    comment.authorRole === 'Verified Garage' ? 'bg-orange-500/10 text-orange-400' :
                                    comment.authorRole === 'Verified Mechanic' ? 'bg-sky-500/10 text-sky-400' :
                                    comment.authorRole === 'Spare-Part Supplier' ? 'bg-amber-500/10 text-amber-400' :
                                    'bg-white/10 text-slate-400'
                                  }`}>
                                    {comment.authorRole}
                                  </span>
                                  {comment.authorBadge && (
                                    <span className="text-[9px] text-sky-300 font-semibold h-[14px]">
                                      • {comment.authorBadge}
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">
                                  {new Date(comment.timestamp).toLocaleDateString()} at {new Date(comment.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                              </div>
                            </div>

                            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/5 border border-white/5 text-slate-400">
                              {comment.commentType}
                            </span>
                          </div>

                          {/* Content */}
                          <p className="text-xs text-slate-305 text-slate-300 leading-relaxed font-sans font-light">
                            {comment.content}
                          </p>

                          {/* Part offer extra section if exists */}
                          {comment.commentType === 'Spare-part Offer' && comment.partName && (
                            <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3.5 space-y-2">
                              <h5 className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                                <Truck className="w-3.5 h-3.5" />
                                <span>Spare Part Specification Details</span>
                              </h5>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                                <div>
                                  <span className="text-[9px] text-slate-500 block">Part Name</span>
                                  <span className="text-slate-205 font-bold text-slate-200">{comment.partName}</span>
                                </div>
                                <div>
                                  <span className="text-[9px] text-slate-500 block">Condition</span>
                                  <span className={`text-[10px] font-extrabold uppercase ${comment.partCondition === 'New' ? 'text-emerald-400' : 'text-slate-405'}`}>
                                    {comment.partCondition}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-[9px] text-slate-500 block">Quoted Price</span>
                                  <span className="text-amber-400 font-mono font-extrabold">${comment.price} USD</span>
                                </div>
                                <div>
                                  <span className="text-[9px] text-slate-500 block">Delivery Time</span>
                                  <span className="text-slate-300">{comment.deliveryTime}</span>
                                </div>
                              </div>
                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-2 border-t border-amber-500/10 text-[11px] text-slate-400 gap-1">
                                <span>Compatibility: <strong className="text-slate-300">{comment.partCompatibility || "Not verified"}</strong></span>
                                {comment.supplierContact && (
                                  <span className="text-amber-400 font-mono">Contact: <strong>{comment.supplierContact}</strong></span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Comment Actions: Upvote, and Accept solution trigger only for Post owner */}
                          <div className="flex items-center gap-4 pt-2">
                            <button 
                              onClick={() => handleUpvoteComment(selectedPost.id, comment.id)}
                              className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                            >
                              <ThumbsUp className="w-3.5 h-3.5" />
                              <span>Helpful ({comment.upvotes})</span>
                            </button>

                            {/* Accept solution action: visible if current user is owner group, post is not 'Solved' already */}
                            {selectedPost.status !== 'Solved' && (
                              <button
                                onClick={() => handleOpenResolveFlow(comment.id)}
                                className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer "
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Accept Solution</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Submit Reply Form (Except if Solved) */}
              {selectedPost.status !== 'Solved' && (
                <form onSubmit={handlePostCommentSubmit} className="glass rounded-3xl p-5 border border-white/5 space-y-4">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest px-1">
                    Propose Diagnostics Recommendation or Spare-Part Offer
                  </h4>

                  {/* Commenter Profile Selection helper block for testing roles */}
                  <div className="bg-white/3 p-3.5 rounded-2xl border border-white/5 space-y-3">
                    <span className="text-[10px] text-slate-450 text-slate-400 tracking-wider block font-bold uppercase leading-tight">
                      🎭 Test Identity & Proposal Classification Mode
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <label className="text-[9px] text-slate-500 block uppercase font-mono">Role Selector</label>
                        <select 
                          value={commenterRole}
                          onChange={(e) => {
                            const val = e.target.value as ForumComment['authorRole'];
                            setCommenterRole(val);
                            if (val === 'Verified Garage') {
                              setCommenterName("Apsara Auto Diagnostic Repair");
                              setCommenterBadge("Toyota/Lexus Specialist BKK");
                            } else if (val === 'Verified Mechanic') {
                              setCommenterName("Sokha Engine Shop");
                              setCommenterBadge("Cambodia Master Mechanic");
                            } else if (val === 'Spare-Part Supplier') {
                              setCommenterName("Kirirom Auto Parts");
                              setCommenterBadge("Angkor Part Importer");
                              setNewCommentType("Spare-part Offer");
                            } else {
                              setCommenterName("Rithy Community User");
                              setCommenterBadge("");
                              setNewCommentType("General");
                            }
                          }}
                          className="bg-slate-900 border border-white/10 text-white rounded px-2 py-1 w-full text-xs font-mono"
                        >
                          <option value="Normal User">Normal User</option>
                          <option value="Verified Mechanic">Verified Mechanic</option>
                          <option value="Verified Garage">Verified Garage</option>
                          <option value="Spare-Part Supplier">Spare Part Seller</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[9px] text-slate-500 block uppercase font-mono">Display Name</label>
                        <input 
                          type="text" 
                          value={commenterName}
                          onChange={(e) => setCommenterName(e.target.value)}
                          className="bg-slate-900 border border-white/10 text-white rounded px-2 py-1 w-full text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-[9px] text-slate-500 block uppercase font-mono">Specialist Badge</label>
                        <input 
                          type="text" 
                          value={commenterBadge}
                          onChange={(e) => setCommenterBadge(e.target.value)}
                          className="bg-slate-900 border border-white/10 text-white rounded px-2 py-1 w-full text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-[9px] text-slate-500 block uppercase font-mono">Comment Type</label>
                        <select 
                          value={newCommentType}
                          onChange={(e) => setNewCommentType(e.target.value as ForumComment['commentType'])}
                          className="bg-slate-900 border border-white/10 text-white rounded px-2 py-1 w-full text-xs font-mono"
                        >
                          <option value="General">General Comment</option>
                          <option value="Technical Solution">Technical Solution</option>
                          <option value="Garage Recommendation">Garage Advisory</option>
                          <option value="Spare-part Offer">Spare Part Quotation</option>
                          <option value="Price Estimate">Price Assessment</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* If Spare-part Offer checked, expose part inputs */}
                  {newCommentType === "Spare-part Offer" && (
                    <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
                      <div className="sm:col-span-3 pb-1 border-b border-amber-500/10">
                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">Spare Part Sales Sheet details</span>
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 block font-bold">Spare Part Name</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Starter Motor Assy" 
                          value={partName}
                          onChange={(e) => setPartName(e.target.value)}
                          className="bg-slate-900 border border-white/10 text-white rounded-xl px-2.5 py-1.5 w-full text-xs"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 block font-bold">Condition Type</label>
                        <select 
                          value={partCondition}
                          onChange={(e) => setPartCondition(e.target.value as 'New' | 'Used')}
                          className="bg-slate-900 border border-white/10 text-white rounded-xl px-2.5 py-1.5 w-full text-xs font-mono"
                        >
                          <option value="New">Brand New / Imported OEM</option>
                          <option value="Used">Slightly Used / Refurbished</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 block font-bold">Quoted Price ($ USD)</label>
                        <input 
                          type="number" 
                          placeholder="85"
                          value={partPrice}
                          onChange={(e) => setPartPrice(e.target.value)}
                          className="bg-slate-900 border border-white/10 text-white rounded-xl px-2.5 py-1.5 w-full text-xs font-mono"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 block font-bold">Fit / Model Compatibility</label>
                        <input 
                          type="text" 
                          placeholder="Jeep Cherokee 1987-1992" 
                          value={partCompatibility}
                          onChange={(e) => setPartCompatibility(e.target.value)}
                          className="bg-slate-900 border border-white/10 text-white rounded-xl px-2.5 py-1.5 w-full text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 block font-bold">Delivery Time</label>
                        <select 
                          value={deliveryTime}
                          onChange={(e) => setDeliveryTime(e.target.value)}
                          className="bg-slate-900 border border-white/10 text-white rounded-xl px-2.5 py-1.5 w-full text-xs"
                        >
                          <option value="1 Hour Delivery">1 Hour Instant Delivery</option>
                          <option value="2 Hours">2 Hours Express</option>
                          <option value="Same Day Delivery">Same Day Delivery</option>
                          <option value="Import on Order (7 days)">Import on Order (7 days)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 block font-bold">Supplier Contact Phone</label>
                        <input 
                          type="text" 
                          placeholder="+855 12 777 888" 
                          value={supplierContact}
                          onChange={(e) => setSupplierContact(e.target.value)}
                          className="bg-slate-900 border border-white/10 text-white rounded-xl px-2.5 py-1.5 w-full text-xs font-mono"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* Main content typing block */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 block font-bold">Your Diagnostic Suggestion Message</label>
                    <textarea 
                      rows={4}
                      placeholder={newCommentType === 'Spare-part Offer' ? "Write part specifications, warranty scopes, and payment or pickup schedules..." : "Explain your diagnosis clearly. Give step-by-step troubleshooting suggestions..."}
                      value={newCommentContent}
                      onChange={(e) => setNewCommentContent(e.target.value)}
                      className="bg-slate-900 border border-white/10 text-white rounded-2xl p-3.5 w-full text-xs focus:border-sky-500/40 focus:outline-none"
                      required
                    />
                  </div>

                  {/* Submit buttons */}
                  <div className="flex justify-end pt-1">
                    <button 
                      type="submit"
                      className="px-5 py-2 hover:bg-sky-450 bg-sky-500 text-slate-950 text-xs font-extrabold rounded-xl transition cursor-pointer"
                    >
                      Publish Suggestion Offer
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Right Column: AI Co-Diagnostic Dashboard Insights */}
            <div className="space-y-6">
              
              {/* AI Core box */}
              <div className="glass rounded-3xl p-5 border border-sky-500/20 bg-gradient-to-br from-indigo-950/10 to-sky-950/10 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-5 h-5 text-sky-400 animate-pulse" />
                    <h4 className="text-xs font-extrabold text-slate-100 uppercase tracking-widest">
                      MyCar AI Co-Advisor
                    </h4>
                  </div>
                  
                  <button
                    onClick={() => handleAIReDiagnose(selectedPost.id)}
                    className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-slate-200 transition cursor-pointer flex items-center justify-center"
                    disabled={aiAnalyzingId !== null}
                    title="Re-run deep engine diagnostic analysis"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${aiAnalyzingId === selectedPost.id ? 'animate-spin text-sky-400' : ''}`} />
                  </button>
                </div>

                {selectedPost.aiSuggestion ? (
                  <div className="space-y-4 text-xs font-sans">
                    
                    {/* Possible Causes list */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] uppercase text-slate-450 text-slate-400 font-bold block tracking-wider leading-tight">
                        🔍 Likely Underlying Causes
                      </span>
                      <ul className="space-y-1.5">
                        {selectedPost.aiSuggestion.possibleCauses.map((cause, i) => (
                          <li key={i} className="flex items-start gap-1 p-1 bg-white/2 rounded-md">
                            <span className="text-[10px] text-sky-400 font-bold font-mono">#{i+1}</span>
                            <span className="text-slate-300 leading-normal">{cause}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Safe testing recommendation */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] uppercase text-slate-450 text-slate-400 font-bold block tracking-wider leading-tight">
                        🛠️ Suggested Owner Safe Inspections
                      </span>
                      <ul className="space-y-1.5">
                        {selectedPost.aiSuggestion.suggestedChecks.map((check, i) => (
                          <li key={i} className="flex items-start gap-1 p-1 bg-white/2 rounded-md">
                            <span className="text-emerald-400 text-[10px] font-bold">✓</span>
                            <span className="text-slate-350 leading-normal text-slate-300">{check}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Safety Warning note */}
                    {selectedPost.aiSuggestion.safetyWarning && (
                      <div className="bg-red-500/10 border border-red-550 border-red-500/20 p-3 rounded-2xl flex items-start gap-2.5">
                        <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] text-red-400 uppercase font-bold block tracking-wide">AI Safety Advisory Warning</span>
                          <p className="text-[10px] text-slate-355 text-slate-300 leading-relaxed mt-0.5">{selectedPost.aiSuggestion.safetyWarning}</p>
                        </div>
                      </div>
                    )}

                    {/* Highly relevant links */}
                    {selectedPost.aiSuggestion.similarCasesFound && selectedPost.aiSuggestion.similarCasesFound.length > 0 && (
                      <div className="space-y-1 pt-1">
                        <span className="text-[10px] text-slate-450 text-slate-450 uppercase font-semibold block">Similar Community Inquiries Found</span>
                        <div className="space-y-1">
                          {selectedPost.aiSuggestion.similarCasesFound.map((item, i) => (
                            <div key={i} className="text-[11px] text-sky-400 flex items-center gap-1 cursor-pointer hover:underline">
                              <span>• {item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-500 text-xs">
                    Advisor is sleeping. Tap the refresh icon at the top corner to summon AI diagnostics.
                  </div>
                )}
              </div>

              {/* Quick helper tip banner */}
              <div className="glass rounded-3xl p-5 border border-white/5 space-y-2.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block leading-none">
                  Cambodian Road Knowledge
                </span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Most battery diagnostic errors in Cambodia occur after heavy downpours due to corrosion at the starter motor ground cables. Always check electrical connections for battery residue buildup before calling tow.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* 2. Primary Feed List */
        <div className="space-y-5">
          {/* Filter block */}
          <div className="bg-white/3 border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Search query field */}
            <div className="flex-1 relative">
              <Search className="w-4.5 h-4.5 text-slate-500 absolute left-3 top-2.5" />
              <input 
                type="text" 
                placeholder="Search forum topics, Jeep starting issue, Prius battery..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-900/50 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-505 w-full focus:outline-none focus:border-sky-500/40"
              />
            </div>

            {/* Select tags */}
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center gap-1 bg-slate-900 border border-white/10 px-2 rounded-xl h-[34px]">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-transparent border-none text-white text-xs h-full"
                >
                  <option value="">All Problem Categories</option>
                  {categories.map((cat, i) => (
                    <option key={i} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center bg-slate-900 border border-white/10 px-2 rounded-xl h-[34px]">
                <select 
                  value={selectedUrgency}
                  onChange={(e) => setSelectedUrgency(e.target.value)}
                  className="bg-transparent border-none text-white text-xs h-full"
                >
                  <option value="">All Urgencies</option>
                  <option value="Low">Low Priority</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High Urgency</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>

              <div className="flex items-center bg-slate-900 border border-white/10 px-2 rounded-xl h-[34px]">
                <select 
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-transparent border-none text-white text-xs h-full"
                >
                  <option value="">All Statuses</option>
                  <option value="Open">Open / Unsolved</option>
                  <option value="Waiting for Answer">Waiting for Ans</option>
                  <option value="Quotation Received">Offers Received</option>
                  <option value="Solved">Solved History</option>
                </select>
              </div>
            </div>
          </div>

          {/* Posts list rendering */}
          {loading ? (
            <div className="py-24 text-center">
              <div className="w-8 h-8 rounded-full border-2 border-sky-500 border-t-transparent animate-spin mx-auto mb-2"></div>
              <p className="text-xs text-slate-400">Filtering forum database threads...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="glass rounded-3xl p-16 text-center text-slate-500 text-xs">
              No matching forum topics found. Post a general maintenance question above to ask the community!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {posts.map((post) => (
                <div 
                  key={post.id}
                  onClick={() => setSelectedPost(post)}
                  className="glass hover:border-white/15 rounded-3xl p-5 border border-white/10 transition flex flex-col justify-between cursor-pointer space-y-4 group shadow-sm w-full"
                >
                  <div className="flex flex-col sm:flex-row gap-4 items-start w-full">
                    {/* Thumbnail for Forum Post */}
                    <div className="w-full sm:w-28 h-28 shrink-0 rounded-2xl overflow-hidden border border-white/10 bg-slate-950/80 relative">
                      <img
                        src={post.photoUrl || "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=300"}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    
                    {/* Main text & specifications content */}
                    <div className="flex-1 min-w-0 space-y-3.5 w-full">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-500/10 border border-white/5 text-xs text-slate-400 flex items-center justify-center font-bold">
                            {post.authorName.charAt(0)}
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-300 font-bold block">{post.authorName}</span>
                            <span className="text-[9px] text-slate-500 block">{new Date(post.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {/* Urgency tag badge */}
                          <span className={`text-[9px] px-2 py-0.5 rounded ${
                            post.urgency === 'Emergency' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                            post.urgency === 'High' ? 'bg-amber-500/10 text-amber-400' :
                            'bg-slate-500/10 text-slate-400'
                          }`}>
                            {post.urgency}
                          </span>

                          {/* Status tag badge */}
                          <span className={`text-[9px] px-2 py-0.5 rounded font-mono ${
                            post.status === 'Solved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            post.status === 'Open' ? 'bg-sky-500/10 text-sky-400' :
                            'bg-indigo-500/10 text-indigo-400'
                          }`}>
                            {post.status}
                          </span>
                        </div>
                      </div>

                      {/* Title & Category info */}
                      <div className="space-y-1">
                        <h3 className="text-xs font-extrabold text-slate-200 group-hover:text-white transition leading-tight">
                          {post.title}
                        </h3>
                        <div className="flex items-center gap-2 text-[10px]">
                          <span className="text-sky-305 text-sky-300">{post.category}</span>
                          <span className="text-slate-500 flex items-center gap-0.5">
                            <MapPin className="w-2.5" /> {post.location}
                          </span>
                        </div>
                      </div>

                      {/* Description Truncated */}
                      <p className="text-[11px] text-slate-400 text-slate-400 leading-relaxed line-clamp-3">
                        {post.description}
                      </p>

                      {/* Vehicle info block */}
                      <div className="bg-white/2 border border-white/5 rounded-xl p-2.5 text-[11px] flex justify-between">
                        <span className="text-slate-400">{post.vehicleBrand} {post.vehicleModel} ({post.vehicleYear})</span>
                        {post.mileage && <span className="text-slate-500">{post.mileage.toLocaleString()} km</span>}
                      </div>

                      {/* Special requests indicator bar */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {post.needMechanic && <span className="bg-orange-500/10 text-orange-400 px-1.5 py-0.2 rounded text-[9px] font-bold">Wrench Required</span>}
                        {post.needSparePart && <span className="bg-amber-500/10 text-amber-400 px-1.5 py-0.2 rounded text-[9px] font-bold">Spare Part Sought</span>}
                      </div>
                    </div>
                  </div>

                  {/* Upvote & Comment counts bottom banner */}
                  <div className="flex items-center justify-between border-t border-white/5 pt-3.5 mt-1">
                    <button 
                      onClick={(e) => handleUpvotePost(post.id, e)}
                      className="text-[11px] text-slate-400 hover:text-sky-300 flex items-center gap-1.5 cursor-pointer"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{post.upvotes} Upvotes</span>
                    </button>

                    <span className="text-[11px] text-slate-400 flex items-center gap-1 font-bold">
                      <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
                      <span>{post.comments.length} replies</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* -------------------- CREATE DIAL POST MODAL -------------------- */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowCreateModal(false)}></div>
          <div className="glass rounded-3xl p-6 max-w-xl w-full relative z-10 space-y-4 shadow-2xl overflow-y-auto max-h-[90vh]">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-1.5">
                <PlusCircle className="w-4.5 h-4.5 text-sky-400" />
                <h3 className="text-base font-bold text-slate-100">Create Problem Topic Thread</h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-200 cursor-pointer">
                <X className="w-5 h-5 cursor-pointer" />
              </button>
            </div>

            <form onSubmit={handleCreatePostSubmit} className="space-y-4 text-xs font-sans">
              
              <div className="space-y-1">
                <label className="text-[10px] text-slate-4s0 text-slate-400 font-bold block uppercase tracking-wide">Problem Topic Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Jeep 1990 AMC engine won't turn over after heavy monsoon rain" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="bg-slate-900 border border-white/10 text-white rounded-xl px-3 py-2 w-full text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 block font-bold mb-0.5">Category</label>
                  <select 
                    value={newCategory} 
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="bg-slate-900 border border-white/10 text-white rounded-xl px-2 py-1.5 w-full text-xs"
                  >
                    {categories.map((cat, i) => (
                      <option key={i} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block font-bold mb-0.5 font-mono">Urgency Level</label>
                  <select 
                    value={newUrgency} 
                    onChange={(e) => setNewUrgency(e.target.value as any)}
                    className="bg-slate-900 border border-white/10 text-white rounded-xl px-2 py-1.5 w-full text-xs font-mono"
                  >
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High Urgency</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block font-bold mb-0.5">Location</label>
                  <select 
                    value={newLocation} 
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="bg-slate-900 border border-white/10 text-white rounded-xl px-2 py-1.5 w-full text-xs"
                  >
                    <option value="Phnom Penh">Phnom Penh</option>
                    <option value="Siem Reap">Siem Reap</option>
                    <option value="Battambang">Battambang</option>
                    <option value="Sihanoukville">Sihanoukville</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block font-bold mb-0.5">Brand / Make</label>
                  <input 
                    type="text" 
                    value={newBrand} 
                    onChange={(e) => setNewBrand(e.target.value)}
                    className="bg-slate-900 border border-white/10 text-white rounded-xl px-2 py-1.5 w-full text-xs font-mono"
                    placeholder="Toyota"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 block font-bold mb-0.5">Model</label>
                  <input 
                    type="text" 
                    value={newModel} 
                    onChange={(e) => setNewModel(e.target.value)}
                    className="bg-slate-900 border border-white/10 text-white rounded-xl px-2 py-1.5 w-full text-xs"
                    placeholder="Cherokee"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block font-bold mb-0.5">Manufacturing Year</label>
                  <input 
                    type="number" 
                    value={newYear} 
                    onChange={(e) => setNewYear(e.target.value)}
                    className="bg-slate-900 border border-white/10 text-white rounded-xl px-2 py-1.5 w-full text-xs font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block font-bold mb-0.5">Engine Specs / Size</label>
                  <input 
                    type="text" 
                    placeholder="1.8L Hybrid" 
                    value={newEngine} 
                    onChange={(e) => setNewEngine(e.target.value)}
                    className="bg-slate-900 border border-white/10 text-white rounded-xl px-2 py-1.5 w-full text-xs"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block font-bold mb-0.5">Odometer (km)</label>
                  <input 
                    type="number" 
                    value={newMileage} 
                    onChange={(e) => setNewMileage(e.target.value)}
                    className="bg-slate-900 border border-white/10 text-white rounded-xl px-2 py-1.5 w-full text-xs font-mono"
                  />
                </div>
              </div>

              {/* Special check tags support */}
              <div className="bg-white/3 border border-white/5 rounded-2xl p-4 space-y-2">
                <span className="text-[10px] text-slate-400 block font-mono">SPECIAL COMMUNITY REQUEST TICKETS</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className="flex items-center gap-2 text-slate-300 font-medium">
                    <input 
                      type="checkbox" 
                      checked={newNeedMechanic} 
                      onChange={(e) => setNewNeedMechanic(e.target.checked)}
                      className="rounded border-white/10 text-sky-500 w-3.5 h-3.5 bg-slate-900"
                    />
                    <span>Verified Mechanic Needed</span>
                  </label>
                  <label className="flex items-center gap-2 text-slate-300 font-medium">
                    <input 
                      type="checkbox" 
                      checked={newNeedSparePart} 
                      onChange={(e) => setNewNeedSparePart(e.target.checked)}
                      className="rounded border-white/10 text-sky-500 w-3.5 h-3.5 bg-slate-900"
                    />
                    <span>Spare Part Inquiry</span>
                  </label>
                  <label className="flex items-center gap-2 text-slate-300 font-medium">
                    <input 
                      type="checkbox" 
                      checked={newNeedRecommendation} 
                      onChange={(e) => setNewNeedRecommendation(e.target.checked)}
                      className="rounded border-white/10 text-sky-500 w-3.5 h-3.5 bg-slate-900"
                    />
                    <span>Need Garage Recs</span>
                  </label>
                </div>
              </div>

              {/* Budget and dates extra targets fields */}
              {(newNeedMechanic || newNeedSparePart) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-sky-500/5 p-4 rounded-2xl border border-sky-500/10">
                  <div className="space-y-1">
                    <label className="text-[10px] text-sky-305 block font-bold text-sky-300">Rough Repair Budget ($ USD)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. $100 - $300" 
                      value={newBudget}
                      onChange={(e) => setNewBudget(e.target.value)}
                      className="bg-slate-900 border border-white/10 text-white rounded-xl px-2.5 py-1.5 w-full text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-sky-305 block font-bold text-sky-300">Preferred Target Date</label>
                    <input 
                      type="date" 
                      value={newPreferredDate}
                      onChange={(e) => setNewPreferredDate(e.target.value)}
                      className="bg-slate-900 border border-white/10 text-white rounded-xl px-2.5 py-1.5 w-full text-xs font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Main Issue Description */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 block font-bold uppercase tracking-wide">Write Problem Description</label>
                <textarea 
                  rows={4}
                  placeholder="Explain your vehicle condition in detail. What works? What doesn't? Are there signs, sounds, or smells? Have any checks been made? AI advisor integrates diagnostics on submission."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="bg-slate-900 border border-white/10 text-white rounded-xl p-3 w-full text-xs focus:ring-1 focus:ring-sky-505 focus:outline-none"
                  required
                />
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 hover:bg-sky-450 bg-sky-500 text-slate-950 font-extrabold rounded-xl transition cursor-pointer flex items-center gap-1"
                  disabled={newPostLoading}
                >
                  {newPostLoading && <div className="w-3 h-3 rounded-full border-1 border-slate-950 border-t-transparent animate-spin"></div>}
                  <span>Publish & Request AI Diagnostics</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------- ACCEPT SOLUTION RESOLVE MODAL -------------------- */}
      {showResolveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowResolveModal(false)}></div>
          <div className="glass rounded-3xl p-6 max-w-md w-full relative z-10 space-y-4 shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-slate-100">Accept Proposal & Close Post</h3>
              </div>
              <button onClick={() => setShowResolveModal(false)} className="text-slate-400 hover:text-slate-200 cursor-pointer">
                <X className="w-5 h-5 cursor-pointer" />
              </button>
            </div>

            <form onSubmit={handleResolveSubmit} className="space-y-4 text-xs font-sans">
              
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 block font-bold">Write Solving Notes / Actions Taken</label>
                <textarea 
                  rows={3}
                  placeholder="Explain exactly what solved the vehicle's starting system issue (e.g., Exchanged crankshaft position sensor in Boeng Keng Kang district)" 
                  value={resolvedNote}
                  onChange={(e) => setResolvedNote(e.target.value)}
                  className="bg-slate-900 border border-white/10 text-white rounded-xl p-2.5 w-full text-xs focus:ring-1 focus:ring-emerald-500/20"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 block font-bold">Resolution Cost ($ USD)</label>
                  <input 
                    type="number" 
                    placeholder="120" 
                    value={resolvedCost}
                    onChange={(e) => setResolvedCost(e.target.value)}
                    className="bg-slate-900 border border-white/10 text-white rounded-xl px-2.5 py-1.5 w-full text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 block font-bold">Repair Shop / Mechanic</label>
                  <input 
                    type="text" 
                    placeholder="Sokha Engine Specialist" 
                    value={resolvedGarage}
                    onChange={(e) => setResolvedGarage(e.target.value)}
                    className="bg-slate-900 border border-white/10 text-white rounded-xl px-2.5 py-1.5 w-full text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 block font-bold">Replacement Part brand or name (if any)</label>
                <input 
                  type="text" 
                  placeholder="CPS Sensor OEM Brand" 
                  value={resolvedPartUsed}
                  onChange={(e) => setResolvedPartUsed(e.target.value)}
                  className="bg-slate-900 border border-white/10 text-white rounded-xl px-2.5 py-1.5 w-full text-xs"
                />
              </div>

              {/* Maintenance sync flag check */}
              <div className="bg-emerald-500/5 border border-emerald-555 border-emerald-500/20 rounded-2xl p-4 flex items-start gap-2.5">
                <input 
                  type="checkbox" 
                  id="syncHistory"
                  checked={saveToHistory}
                  onChange={(e) => setSaveToHistory(e.target.checked)}
                  className="mt-1 rounded border-white/10 text-emerald-555 bg-slate-900 w-3.5 h-3.5"
                />
                <label htmlFor="syncHistory" className="text-[11px] text-slate-300 leading-relaxed cursor-pointer select-none">
                  <strong className="text-emerald-400 block font-bold mb-0.5">Sync Directly to Maintenance History</strong>
                  Log this resolution automatically into Tacoma (v1) maintenance files inside the Odometer dashboard.
                </label>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowResolveModal(false)}
                  className="px-4 py-2 bg-white/5 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl transition cursor-pointer"
                >
                  Save & Solve Thread
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
