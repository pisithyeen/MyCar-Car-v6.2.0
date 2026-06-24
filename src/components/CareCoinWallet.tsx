/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { 
  Coins, 
  ShieldCheck, 
  Search, 
  Flame, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Lock, 
  LayoutDashboard, 
  Clock, 
  Filter, 
  Check, 
  X, 
  TrendingUp, 
  Sparkles, 
  AlertTriangle, 
  ArrowRight, 
  Info,
  Gift,
  HelpCircle,
  Eye,
  Activity,
  Award,
  Zap,
  Globe,
  Compass
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";

// Interfaces
export interface CoinTransaction {
  id: string;
  date: string;
  activity: string;
  category: 'donation' | 'bidding' | 'forum' | 'location' | 'spent' | 'admin' | 'refund';
  coins: number;
  status: 'Completed' | 'Pending' | 'Locked' | 'Refunded';
  txHash?: string;
  recipientName?: string;
  gasPriceGwei?: number;
}

export interface EscrowContract {
  id: string;
  itemName: string;
  suggestedCoins: number;
  currentBidCoins?: number;
  status: string;
  donorId: number;
  donorName: string;
  currentBidderId?: number;
  currentBidderName?: string;
  vehicleBrand?: string;
  vehicleModel?: string;
}

interface CareCoinWalletProps {
  wallet: {
    available: number;
    locked: number;
    pending: number;
    earned: number;
    spent: number;
    refunded: number;
  };
  transactions: CoinTransaction[];
  donations: EscrowContract[];
  activeUser: any;
  boostedPosts?: Record<string, {
    package: string;
    duration: string;
    end: string;
    impressions: number;
    clicks: number;
    conversions: number;
    messages?: number;
    createdAt: string;
  }>;
  unlockedFeatures?: string[];
  activeUserRole?: string;
  onConfirmCompletion?: (post: any, side: 'buyer' | 'donor') => void;
  onRaiseDispute?: (post: any, notes?: string) => void;
  onCancelDonation?: (post: any) => void;
  onUnlockFeature?: (featureId: string, cost: number) => void;
}

export default function CareCoinWallet({
  wallet = { available: 12, locked: 0, pending: 0, earned: 65, spent: 43, refunded: 10 },
  transactions = [],
  donations = [],
  activeUser,
  boostedPosts = {},
  unlockedFeatures = [],
  activeUserRole = "Vehicle Owner",
  onConfirmCompletion,
  onRaiseDispute,
  onCancelDonation,
  onUnlockFeature
}: CareCoinWalletProps) {
  
  // Tabs state
  const [activeTab, setActiveTab] = useState<'history' | 'pending' | 'boosts' | 'unlocks'>('history');
  
  // Search & Filter state for transaction history
  const [txSearch, setTxSearch] = useState('');
  const [txCategoryFilter, setTxCategoryFilter] = useState<string>('all');
  const [txStatusFilter, setTxStatusFilter] = useState<string>('all');
  
  // Selected transaction detail view
  const [selectedTx, setSelectedTx] = useState<CoinTransaction | null>(null);
  
  // Dispute Modal logic
  const [disputeContract, setDisputeContract] = useState<EscrowContract | null>(null);
  const [disputeReason, setDisputeReason] = useState('');

  // Local state to simulate newly resolved actions elegantly in the preview sandbox
  const [localDispatchedContracts, setLocalDispatchedContracts] = useState<Record<string, string>>({});

  // Calculations for graphs
  const balanceBreakdown = useMemo(() => [
    { name: "Available", value: wallet.available, color: "#10b981" }, // emerald-500
    { name: "Holding/Locked", value: wallet.locked, color: "#f59e0b" }, // amber-500
    { name: "Pending", value: wallet.pending, color: "#6366f1" }, // indigo-500
  ], [wallet]);

  const statsComparison = useMemo(() => [
    { name: "Total Earned", coins: wallet.earned, color: "#10b981" },
    { name: "Total Spent", coins: wallet.spent, color: "#f43f5e" },
    { name: "Total Refunded", coins: wallet.refunded, color: "#06b6d4" },
  ], [wallet]);

  // Handle active contracts filtering
  const escrowContracts = useMemo(() => {
    return donations.filter(d => 
      d.status === "Coins Locked" || 
      d.status === "Waiting for Pickup" || 
      d.status === "Disputed" ||
      d.status === "Bidding Active"
    );
  }, [donations]);

  // Handover confirmation logic
  const handleHandoverAction = (contract: any, side: 'donor' | 'buyer') => {
    if (onConfirmCompletion) {
      onConfirmCompletion(contract, side);
    } else {
      setLocalDispatchedContracts(prev => ({
        ...prev,
        [contract.id]: "Completed"
      }));
      alert(`Simulation Match: Handover signed by ${side}. Escrow released.`);
    }
  };

  // Raised dispute local simulator
  const handleRaiseDisputeAction = () => {
    if (!disputeContract) return;
    if (onRaiseDispute) {
      onRaiseDispute(disputeContract, disputeReason);
    } else {
      setLocalDispatchedContracts(prev => ({
        ...prev,
        [disputeContract.id]: "Disputed"
      }));
      alert(`Simulation Dispute Filed: "${disputeReason}" on Contract #${disputeContract.id}`);
    }
    setDisputeContract(null);
    setDisputeReason('');
  };

  // Cancel order logic
  const handleCancelAction = (contract: any) => {
    if (onCancelDonation) {
      onCancelDonation(contract);
    } else {
      setLocalDispatchedContracts(prev => ({
        ...prev,
        [contract.id]: "Cancelled"
      }));
      alert(`Simulation Cancelled: Bid reverted and funds returned to the bidder.`);
    }
  };

  // Filter transaction list
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const matchSearch = tx.activity.toLowerCase().includes(txSearch.toLowerCase()) || 
                          (tx.txHash || '').toLowerCase().includes(txSearch.toLowerCase());
      const matchCategory = txCategoryFilter === 'all' || tx.category === txCategoryFilter;
      const matchStatus = txStatusFilter === 'all' || tx.status === txStatusFilter;
      return matchSearch && matchCategory && matchStatus;
    });
  }, [transactions, txSearch, txCategoryFilter, txStatusFilter]);

  // All premium suite items mapped
  const premiumCatalog = [
    {
      id: "un-adv",
      name: "AI Advanced Garage Diagnostics Guide",
      description: "Generates step-by-step mechanical analysis of technical failure codes & part warnings.",
      cost: 5,
      icon: Sparkles,
      color: "from-sky-500/20 to-indigo-500/10",
      badgeColor: "text-sky-400 bg-sky-500/10 border-sky-500/20"
    },
    {
      id: "un-rep",
      name: "Vehicle Technical Maintenance Historian Export",
      description: "Produces deep-dive chronological summary reports of work logs & compliance files.",
      cost: 8,
      icon: Award,
      color: "from-emerald-500/20 to-teal-500/10",
      badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
    },
    {
      id: "un-comp",
      name: "Cambodian Service Fee Comparison Index",
      description: "Aggregates real local garage diagnostic charges, maintenance fees and labor comparisons.",
      cost: 10,
      icon: Globe,
      color: "from-amber-500/20 to-orange-500/10",
      badgeColor: "text-amber-400 bg-amber-500/10 border-amber-500/20"
    }
  ];

  return (
    <div className="space-y-6 text-left" id="care-coin-wallet-system">
      
      {/* ----------------- CORE DASHBOARD DECK ----------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Side: Ledger Balances Cards */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Main Balance Sheet Card */}
          <div className="sm:col-span-2 bg-gradient-to-br from-slate-900/90 to-indigo-950/40 border border-indigo-500/15 p-6 rounded-3xl relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full"></div>
            
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[10px] text-indigo-400 uppercase tracking-widest font-mono font-bold flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5" /> Care Coins Treasury Status
                </span>
                <span className="text-3xl font-black text-slate-100 font-mono tracking-wide block">
                  {wallet.available} <span className="text-sm font-medium text-slate-400 font-sans">COINS AVAILABLE</span>
                </span>
              </div>
              <div className="p-3 bg-indigo-500/10 border border-indigo-400/20 rounded-2xl">
                <Coins className="w-6 h-6 text-indigo-400 animate-pulse" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-6 border-t border-white/5 pt-4">
              <div>
                <span className="text-[9px] text-slate-400 uppercase tracking-wider font-mono">Held Escrow</span>
                <div className="text-sm font-bold text-amber-400 font-mono flex items-center gap-1 mt-0.5">
                  <Lock className="w-3 h-3 text-amber-500/80" /> {wallet.locked}
                </div>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 uppercase tracking-wider font-mono">Pending Released</span>
                <div className="text-sm font-bold text-indigo-400 font-mono flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3 text-indigo-400/80" /> {wallet.pending}
                </div>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 uppercase tracking-wider font-mono">Simulated Level</span>
                <span className="text-sm font-bold text-emerald-400 font-mono block mt-0.5">
                  Lvl 4 Active
                </span>
              </div>
            </div>
          </div>

          {/* Statistics Block: Earned */}
          <div className="bg-slate-900/55 border border-white/5 p-5 rounded-3xl flex items-center gap-4 hover:border-white/10 transition shadow-sm">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
              <ArrowDownLeft className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <span className="text-[9px] text-slate-400 uppercase tracking-widest font-mono block">Lifetime Earned</span>
              <span className="text-xl font-bold font-mono text-emerald-400">+{wallet.earned} <span className="text-xs font-sans text-slate-500 font-normal">Coins</span></span>
              <span className="text-[9.5px] text-slate-500 block">From helpful contributions</span>
            </div>
          </div>

          {/* Statistics Block: Spent */}
          <div className="bg-slate-900/55 border border-white/5 p-5 rounded-3xl flex items-center gap-4 hover:border-white/10 transition shadow-sm">
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
              <ArrowUpRight className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <span className="text-[9px] text-slate-400 uppercase tracking-widest font-mono block">Lifetime Spent</span>
              <span className="text-xl font-bold font-mono text-rose-400">-{wallet.spent} <span className="text-xs font-sans text-slate-500 font-normal">Coins</span></span>
              <span className="text-[9.5px] text-slate-400 text-slate-500 block">Used in shop & unlocks</span>
            </div>
          </div>

        </div>

        {/* Right Side: Charts Panel */}
        <div className="lg:col-span-5 bg-slate-900/55 border border-white/5 p-5 rounded-3xl flex flex-col justify-between shadow-xl">
          <div className="flex justify-between items-center mb-3">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono font-bold block">Statistics Graph Analytics</span>
              <span className="text-xs text-slate-500">Breakdown of credits & lock contracts.</span>
            </div>
            <span className="text-[10px] bg-slate-950 border border-white/10 text-indigo-400 font-mono rounded px-2 py-0.5">Live View</span>
          </div>

          <div className="h-28 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statsComparison} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2e3f" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 9 }} stroke="transparent" />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 9 }} stroke="transparent" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: 11 }}
                  itemStyle={{ color: '#f1f5f9' }}
                />
                <Bar dataKey="coins" radius={[8, 8, 0, 0]}>
                  {statsComparison.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-2 border-t border-white/5 pt-2">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
              <span>Available ({wallet.available})</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
              <span>Earned ({wallet.earned})</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
              <span>Spent ({wallet.spent})</span>
            </div>
          </div>
        </div>

      </div>

      {/* ----------------- TABBED INTERFACE MAIN CONTAINER ----------------- */}
      <div className="bg-slate-900/20 border border-white/5 rounded-4xl p-1.5 sm:p-5 shadow-xl space-y-5">
        
        {/* Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-3">
          <div className="flex flex-wrap gap-1">
            {[
              { id: 'history', label: 'Transaction Logs', icon: Clock, count: filteredTransactions.length },
              { id: 'pending', label: 'Escrow holdings', icon: Lock, count: escrowContracts.length },
              { id: 'boosts', label: 'Active Boosts', icon: Flame, count: Object.keys(boostedPosts).length },
              { id: 'unlocks', label: 'Premium Unlocks', icon: ShieldCheck, count: unlockedFeatures.length },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                    isActive 
                      ? "bg-slate-900 border-white/10 text-white shadow-md font-extrabold" 
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full ${isActive ? 'bg-indigo-505/20 text-indigo-300' : 'bg-slate-800 text-slate-500'}`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="text-[10.5px] text-slate-500 font-mono">
            Wallet System Block v2.9
          </div>
        </div>

        {/* -------------------- TAB CONTENT: TRANSACTION HISTORY -------------------- */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            
            {/* Filter Toolbar */}
            <div className="flex flex-wrap items-center gap-2 bg-slate-950/40 p-2.5 rounded-2xl border border-white/5">
              
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search ledger by transaction description or hash..."
                  value={txSearch}
                  onChange={(e) => setTxSearch(e.target.value)}
                  className="w-full bg-slate-950/90 border border-white/15 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-400/50 placeholder-slate-650"
                />
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-500 font-mono uppercase">Category:</span>
                <select 
                  value={txCategoryFilter}
                  onChange={(e) => setTxCategoryFilter(e.target.value)}
                  className="bg-slate-950 border border-white/15 text-xs text-slate-300 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-indigo-400/50"
                >
                  <option value="all">All Categories</option>
                  <option value="donation">Donations</option>
                  <option value="bidding">Escrow Bidding</option>
                  <option value="forum">Forum Answers</option>
                  <option value="location">Map Edits</option>
                  <option value="spent">Spent Unlocks</option>
                  <option value="admin">System Admin</option>
                  <option value="refund">Refunds</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-500 font-mono uppercase">Status:</span>
                <select 
                  value={txStatusFilter}
                  onChange={(e) => setTxStatusFilter(e.target.value)}
                  className="bg-slate-950 border border-white/15 text-xs text-slate-300 rounded-xl px-2.5 py-1.5 focus:outline-none"
                >
                  <option value="all">All States</option>
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                  <option value="Locked">Locked</option>
                  <option value="Refunded">Refunded</option>
                </select>
              </div>

              {/* Clear filters trigger */}
              {(txSearch !== '' || txCategoryFilter !== 'all' || txStatusFilter !== 'all') && (
                <button 
                  onClick={() => { setTxSearch(''); setTxCategoryFilter('all'); setTxStatusFilter('all'); }}
                  className="p-1 px-2.5 bg-slate-900 hover:bg-slate-850 hover:text-white rounded-lg text-[10px] text-slate-400 flex items-center gap-1 transition"
                >
                  <X className="w-3 h-3" /> Clear filters
                </button>
              )}

            </div>

            {/* List/Table */}
            <div className="overflow-x-auto border border-white/5 rounded-2xl bg-slate-900/10">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-[9.5px] text-slate-500 uppercase font-mono tracking-wider bg-slate-950/20">
                    <th className="py-3 px-3.5">Transaction ID</th>
                    <th className="py-3 px-3.5">Activity Detail</th>
                    <th className="py-3 px-3.5">Category</th>
                    <th className="py-3 px-3.5">Execution Date</th>
                    <th className="py-3 px-3.5">Status</th>
                    <th className="py-3 px-3.5 text-right">Value</th>
                    <th className="py-3 px-3.5 text-center">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-xs text-slate-500 font-mono">
                        No transactions registered matching current parameters.
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((tx) => {
                      const isCredit = tx.coins > 0;
                      return (
                        <tr key={tx.id} className="text-xs hover:bg-white/5 transition group">
                          <td className="py-3 px-3.5 font-mono text-[10px] text-indigo-300 font-bold">
                            {tx.txHash || `0x${tx.id.substring(0, 6)}1`}
                          </td>
                          <td className="py-3 px-3.5 font-bold text-slate-200">
                            {tx.activity}
                          </td>
                          <td className="py-3 px-3.5">
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-medium capitalize bg-slate-950 text-slate-400">
                              {tx.category}
                            </span>
                          </td>
                          <td className="py-3 px-3.5 text-slate-400 font-mono text-[10.5px]">
                            {tx.date}
                          </td>
                          <td className="py-3 px-3.5 font-mono">
                            <span className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold ${
                              tx.status === 'Completed' ? "bg-emerald-500/10 text-emerald-400" :
                              tx.status === 'Locked' ? "bg-amber-500/10 text-amber-400 animate-pulse" :
                              tx.status === 'Pending' ? "bg-indigo-500/10 text-indigo-400" :
                              "bg-rose-500/10 text-rose-400"
                            }`}>
                              {tx.status}
                            </span>
                          </td>
                          <td className={`py-3 px-3.5 text-right font-mono font-bold ${
                            isCredit ? "text-emerald-400 font-extrabold" : "text-amber-500"
                          }`}>
                            {isCredit ? "+" : ""}{tx.coins}
                          </td>
                          <td className="py-3 px-3.5 text-center">
                            <button
                              onClick={() => setSelectedTx(tx)}
                              className="py-1 px-2 bg-slate-950 border border-white/10 hover:border-indigo-400/30 text-[10px] text-slate-300 rounded-lg transition font-mono font-bold hover:text-white"
                            >
                              Inspect
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* -------------------- TAB CONTENT: PENDING/LOCKED ESCROW FUNDS -------------------- */}
        {activeTab === 'pending' && (
          <div className="space-y-4">
            <div className="bg-slate-950/40 p-3 rounded-2xl border border-white/5 text-xs text-slate-400 flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-405 shrink-0 mt-0.5" />
              <span>
                <strong>Escrow Handover Framework:</strong> When winning parts or transferring items via donations, Care Coins are held securely within the system database until both parties sign off on physical completion.
              </span>
            </div>

            {escrowContracts.length === 0 ? (
              <div className="text-center py-10 border border-white/5 rounded-2xl bg-slate-950/15">
                <Lock className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
                <span className="text-xs text-slate-500 block font-mono">No active escrow holdings locked currently.</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {escrowContracts.map(post => {
                  const stateOverride = localDispatchedContracts[post.id];
                  const currentStatus = stateOverride || post.status || "Coins Locked";
                  
                  const isReceiver = post.currentBidderId === (activeUser?.id || 1);
                  const isDonor = post.donorId === (activeUser?.id || 1);
                  const sideLabel = isDonor ? 'donor' : 'buyer';
                  
                  if (currentStatus === "Completed") {
                    return (
                      <div key={post.id} className="bg-emerald-950/10 border border-emerald-500/20 rounded-3xl p-5 text-center space-y-2">
                        <Check className="w-8 h-8 text-emerald-400 mx-auto" />
                        <h4 className="text-xs font-bold text-slate-200">{post.itemName}</h4>
                        <div className="text-[10px] text-slate-400 font-mono">Released Secure Escrow!</div>
                      </div>
                    );
                  }

                  return (
                    <div key={post.id} className="bg-slate-900 border border-white/5 rounded-3xl p-5 space-y-4">
                      
                      {/* Title Bar */}
                      <div className="flex justify-between items-start gap-2">
                        <div className="space-y-1">
                          <span className={`text-[9px] font-mono rounded px-1.5 py-0.5 uppercase tracking-wider font-extrabold ${
                            currentStatus === 'Disputed' ? 'bg-rose-500/15 text-rose-450 border border-rose-500/20' : 'bg-amber-500/15 text-amber-300 border border-amber-500/20'
                          }`}>
                            {currentStatus}
                          </span>
                          <h4 className="text-xs font-bold text-slate-200 pt-0.5">{post.itemName}</h4>
                        </div>
                        <div className="text-xs font-extrabold font-mono text-amber-400 bg-amber-500/10 border border-amber-500/25 px-2 py-1 rounded-lg shrink-0">
                          {post.currentBidCoins || post.suggestedCoins} Coins
                        </div>
                      </div>

                      {/* Info Box */}
                      <div className="text-[10.5px] text-slate-400 space-y-1.5 border-t border-b border-white/5 py-3.5 font-mono">
                        <div className="flex justify-between">
                          <span>Listing ID:</span>
                          <span className="text-indigo-300">#{post.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Donor / Submitter:</span>
                          <span className="text-slate-300 font-sans">{post.donorName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Winner / Claimant:</span>
                          <span className="text-slate-300 font-sans">{post.currentBidderName || "Me"}</span>
                        </div>
                        {post.vehicleBrand && (
                          <div className="flex justify-between">
                            <span>Compatible Car:</span>
                            <span className="text-slate-400 font-sans">{post.vehicleBrand} {post.vehicleModel}</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="space-y-2 pt-1">
                        <button
                          onClick={() => handleHandoverAction(post, sideLabel)}
                          className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 font-bold hover:font-extrabold text-slate-950 text-xs rounded-xl transition text-center cursor-pointer shadow-md"
                        >
                          ✓ Confirm Handover Receipt
                        </button>

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => {
                              setDisputeContract(post);
                              setDisputeReason('');
                            }}
                            className="py-1.5 bg-slate-950 hover:bg-rose-950/20 text-[10px] font-bold border border-white/10 text-rose-350 text-center rounded-xl cursor-pointer transition hover:border-rose-500/25"
                          >
                            ⚠️ Technical Dispute
                          </button>
                          
                          <button
                            onClick={() => {
                              if (window.confirm("Are you sure you want to cancel the contract? Tokens will be refunded immediately.")) {
                                handleCancelAction(post);
                              }
                            }}
                            className="py-1.5 bg-slate-950 hover:bg-slate-800 border border-white/10 text-[10px] font-bold text-slate-400 text-center rounded-xl cursor-pointer transition"
                          >
                            ✕ Cancel Contract
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

        {/* -------------------- TAB CONTENT: LIST OF ACTIVE BOOSTS -------------------- */}
        {activeTab === 'boosts' && (
          <div className="space-y-4">
            
            <div className="bg-slate-950/40 p-3 rounded-2xl border border-white/5 text-xs text-slate-450 flex items-start gap-2">
              <Flame className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>
                <strong>Marketplace & Classifieds Boosting:</strong> Check performance statistics for boosted listings on active search results pages. Boosts are managed by lock duration (7 days, 14 days, or 30 days modules).
              </span>
            </div>

            {Object.keys(boostedPosts).length === 0 ? (
              <div className="text-center py-12 border border-white/5 rounded-2xl bg-slate-950/15 p-5 space-y-3">
                <Flame className="w-8 h-8 text-slate-600 mx-auto" />
                <h4 className="text-xs font-mono text-slate-500">No active listing boosts found.</h4>
                <p className="text-[11px] text-slate-600 max-w-sm mx-auto">Boost any of your classified post listings under the Marketplace to see real-time performance indicators and impression graphs here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {Object.entries(boostedPosts).map(([postId, stats]) => (
                  <div key={postId} className="bg-slate-950/65 border border-white/5 p-5 rounded-3xl space-y-4 shadow-md">
                    
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] font-mono bg-amber-550/15 text-amber-450 px-1.5 py-0.5 rounded uppercase tracking-widest font-extrabold flex items-center gap-1">
                          <Zap className="w-3 h-3 text-amber-400" /> ACTIVE {stats.package}
                        </span>
                        <h4 className="text-xs font-black text-white pt-1">Listing Ref: #{postId.substring(0, 8)}</h4>
                      </div>
                      <div className="text-right text-[10px] text-slate-500 font-mono">
                        <div>Ends: {stats.end || "7 Days"}</div>
                        <div className="text-[9px] text-indigo-400">Locked Duration</div>
                      </div>
                    </div>

                    {/* Stats Panel */}
                    <div className="grid grid-cols-3 gap-2 bg-slate-900 border border-white/5 p-3 rounded-2xl text-center">
                      <div>
                        <span className="text-[8.5px] text-slate-500 font-mono block">Impressions</span>
                        <span className="text-sm font-black text-slate-200 mt-0.5 block">{stats.impressions || 140}</span>
                      </div>
                      <div>
                        <span className="text-[8.5px] text-slate-500 font-mono block">Clicks</span>
                        <span className="text-sm font-black text-indigo-400 mt-0.5 block">{stats.clicks || 22}</span>
                      </div>
                      <div>
                        <span className="text-[8.5px] text-slate-500 font-mono block">Inquiries</span>
                        <span className="text-sm font-black text-emerald-400 mt-0.5 block">{stats.conversions || 4}</span>
                      </div>
                    </div>

                    {/* Conversion conversion simulator */}
                    <div className="space-y-1.5 text-[10.5px]">
                      <div className="flex justify-between text-slate-500">
                        <span>Click-Through Rate (CTR):</span>
                        <span className="font-mono text-slate-300">
                          {stats.impressions ? ((stats.clicks / stats.impressions) * 100).toFixed(1) : "15.7"}%
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Inquiries Rate:</span>
                        <span className="font-mono text-slate-300">
                          {stats.clicks ? ((stats.conversions / stats.clicks) * 100).toFixed(1) : "18.2"}%
                        </span>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>
        )}

        {/* -------------------- TAB CONTENT: LIST OF PREMIUM UNLOCKS -------------------- */}
        {activeTab === 'unlocks' && (
          <div className="space-y-4">
            
            <div className="bg-slate-950/40 p-3 rounded-2xl border border-white/5 text-xs text-slate-450 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                <strong>Professional Diagnostic Tools & Exports:</strong> Unlock premium AI diagnostic report extensions or chronological, formatted PDF vehicle history sheets.
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {premiumCatalog.map(item => {
                const isItemUnlocked = unlockedFeatures.includes(item.id) || item.id === "un-rep" /* chronological historian export is unlocked by default in mockup */;
                const Icon = item.icon;
                
                return (
                  <div key={item.id} className="bg-slate-900 border border-white/5 rounded-3xl p-5 flex flex-col justify-between space-y-4 relative overflow-hidden group">
                    {/* Background Glow */}
                    <div className={`absolute -right-6 -bottom-6 w-20 h-20 bg-gradient-to-br ${item.color} blur-2xl rounded-full group-hover:scale-125 transition duration-500`}></div>
                    
                    <div className="space-y-3 relative z-10">
                      <div className="flex justify-between items-start">
                        <div className="p-2.5 bg-slate-950 border border-white/5 rounded-xl">
                          <Icon className="w-5 h-5 text-indigo-400" />
                        </div>
                        
                        <span className={`text-[9.5px] border font-bold font-mono rounded-lg px-2 py-0.5 ${
                          isItemUnlocked 
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        }`}>
                          {isItemUnlocked ? "ACTIVE / UNLOCKED" : "LOCKED"}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-xs font-black text-slate-100">{item.name}</h4>
                        <p className="text-[11px] text-slate-450 leading-relaxed font-normal">{item.description}</p>
                      </div>
                    </div>

                    <div className="relative z-10 border-t border-white/5 pt-3 flex justify-between items-center text-xs">
                      {isItemUnlocked ? (
                        <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[10px] font-bold">
                          <Check className="w-3.5 h-3.5" /> Complete Access
                        </div>
                      ) : (
                        <div className="text-[10px] text-slate-400 font-mono">
                          Unlocks for <span className="font-extrabold text-amber-400">{item.cost} Coins</span>
                        </div>
                      )}

                      {!isItemUnlocked ? (
                        <button
                          onClick={() => {
                            if (wallet.available >= item.cost) {
                              if (onUnlockFeature) {
                                onUnlockFeature(item.id, item.cost);
                              } else {
                                alert(`Simulating purchase: ${item.name} unlocked for ${item.cost} Coins.`);
                              }
                            } else {
                              alert(`Insufficient funds! Need ${item.cost} Coins but you only have ${wallet.available} Available.`);
                            }
                          }}
                          className="py-1 px-3 bg-indigo-500 hover:bg-indigo-600 text-[10px] text-slate-950 font-black rounded-lg transition"
                        >
                          Activate Suite
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-mono italic">Enabled</span>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        )}

      </div>

      {/* -------------------- SLIDE-OVER DETAIL MODAL: RECEIPTS INSPECTOR -------------------- */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedTx(null)}></div>
          
          <div className="bg-slate-950 border border-white/10 rounded-4xl p-6 max-w-sm w-full relative z-10 space-y-4 shadow-2xl">
            
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <div className="flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-widest font-mono">Cryptic Receipt</h3>
              </div>
              <button 
                onClick={() => setSelectedTx(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Receipt Body */}
            <div className="bg-slate-900/60 p-4 border border-white/5 rounded-2xl text-[11px] font-mono space-y-2.5 relative">
              <div className="absolute top-1 right-2 text-[8px] text-slate-705">BLOC#221</div>
              <div className="text-center pb-2 border-b border-white/5 border-dashed">
                <span className="text-[10px] text-slate-500 uppercase tracking-wide">Movement Code</span>
                <div className="text-xs font-bold text-slate-300 mt-0.5">{selectedTx.txHash || "0xFB923AA940B7E1"}</div>
              </div>

              <div className="flex justify-between">
                <span>Operation:</span>
                <span className="text-slate-300 font-bold font-sans">{selectedTx.activity}</span>
              </div>
              
              <div className="flex justify-between">
                <span>Asset Sector:</span>
                <span className="text-slate-400 capitalize">{selectedTx.category}</span>
              </div>

              <div className="flex justify-between">
                <span>Release Status:</span>
                <span className={`text-[9.5px] font-bold ${selectedTx.status === 'Completed' ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {selectedTx.status}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Timestamp (UTC):</span>
                <span className="text-slate-400">{selectedTx.date}</span>
              </div>

              <div className="flex justify-between">
                <span>Network Fee:</span>
                <span className="text-slate-500">0.000 Coins (Gasless)</span>
              </div>

              <div className="flex justify-between items-center border-t border-white/5 pt-2 border-dashed mt-3">
                <span className="font-sans font-medium text-slate-450">Transaction Net Value:</span>
                <span className={`text-base font-black ${selectedTx.coins > 0 ? "text-emerald-400" : "text-amber-400"}`}>
                  {selectedTx.coins > 0 ? "+" : ""}{selectedTx.coins} Coins
                </span>
              </div>
            </div>

            <div className="flex justify-center text-[10px] text-slate-505 font-mono">
              Care Coin Decentralized Ledger Signature System
            </div>

            <button
              onClick={() => setSelectedTx(null)}
              className="w-full py-2 bg-indigo-505/10 hover:bg-slate-900 border border-white/10 text-slate-300 rounded-xl transition text-xs font-bold text-center"
            >
              Close Receipt Analysis
            </button>

          </div>
        </div>
      )}

      {/* -------------------- DISPUTE SUBMISSION DIALOG MODAL -------------------- */}
      {disputeContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDisputeContract(null)}></div>
          
          <div className="bg-slate-950 border border-white/10 rounded-4xl p-6 max-w-md w-full relative z-10 space-y-4 shadow-2xl">
            
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-450" />
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-widest font-mono">File Secure Handover Dispute</h3>
              </div>
              <button 
                onClick={() => setDisputeContract(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                You are about to flag item contract <strong>#{disputeContract.id}</strong> ({disputeContract.itemName}) for manual administration review. Tokens in escrow will remain locked.
              </p>
              
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-mono uppercase">Provide detailed reason for the dispute:</label>
                <textarea
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  placeholder="E.g., parts do not match specifications, item was damaged, or partner did not show up..."
                  rows={4}
                  className="w-full bg-slate-900 border border-white/10 rounded-2xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-rose-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                onClick={() => setDisputeContract(null)}
                className="py-2 border border-white/10 hover:bg-slate-900 text-xs text-slate-450 rounded-xl transition font-bold"
              >
                Nevermind
              </button>
              <button
                onClick={handleRaiseDisputeAction}
                disabled={!disputeReason.trim()}
                className={`py-2 text-xs text-slate-950 rounded-xl transition font-black ${
                  disputeReason.trim() ? "bg-rose-500 hover:bg-rose-600 cursor-pointer text-white" : "bg-slate-800 text-slate-600 cursor-not-allowed"
                }`}
              >
                Submit Dispute Claim
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
