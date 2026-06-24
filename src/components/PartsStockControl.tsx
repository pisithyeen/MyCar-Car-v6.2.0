import React, { useState } from 'react';
import { 
  History, 
  ArrowUpRight, 
  ArrowDownLeft, 
  AlertTriangle, 
  Plus, 
  Layers, 
  FileCheck,
  Search,
  Filter
} from 'lucide-react';
import { PartProduct, StockMovement } from './PartsData';

interface PartsStockControlProps {
  products: PartProduct[];
  movements: StockMovement[];
  onAdjustStock: (productId: string, quantityChanged: number, type: StockMovement['type'], reason: string, staffName: string) => void;
  staffName: string;
  canAdjust: boolean;
}

export default function PartsStockControl({ products, movements, onAdjustStock, staffName, canAdjust }: PartsStockControlProps) {
  const [showAdjustDrawer, setShowAdjustDrawer] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [qtyChanged, setQtyChanged] = useState('');
  const [adjustType, setAdjustType] = useState<StockMovement['type']>('Manual Adjustment');
  const [reason, setReason] = useState('');
  
  // Search query on logs
  const [logSearch, setLogSearch] = useState('');
  const [logTypeFilter, setLogTypeFilter] = useState('All');

  // filter logical calculations
  const filteredLogs = movements.filter(m => {
    const s = logSearch.toLowerCase();
    const matchesSearch = 
      m.productName.toLowerCase().includes(s) || 
      m.sku.toLowerCase().includes(s) || 
      m.referenceNo.toLowerCase().includes(s) ||
      m.staffName.toLowerCase().includes(s);
      
    const matchesType = logTypeFilter === 'All' || m.type === logTypeFilter;
    return matchesSearch && matchesType;
  });

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) {
      alert("Please select a target spare part product.");
      return;
    }

    const valueChanged = parseInt(qtyChanged) || 0;
    if (valueChanged === 0) {
      alert("Adjustment volume cannot be zero.");
      return;
    }

    if (!reason) {
      alert("Please provide an adjustment reason explanation.");
      return;
    }

    const prod = products.find(p => p.id === selectedProductId);
    if (!prod) return;

    // Check if drawing below zero
    const forecastedResult = prod.stockQuantity + valueChanged;
    if (forecastedResult < 0) {
      alert(`Invalid adjustment: Stock cannot drop below zero. Current stock level is ${prod.stockQuantity}.`);
      return;
    }

    onAdjustStock(selectedProductId, valueChanged, adjustType, reason, staffName);
    setShowAdjustDrawer(false);
    
    // reset states
    setSelectedProductId('');
    setQtyChanged('');
    setReason('');
  };

  const typesOfAdjustments: StockMovement['type'][] = [
    'Stock In', 'Stock Out', 'Damage', 'Lost Item', 'Manual Adjustment', 'Branch Transfer', 'Supplier Delivery'
  ];

  return (
    <div className="space-y-4 font-sans" id="stock_movement_manager">
      {/* Overview and Add buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div>
          <h2 className="text-lg font-medium text-white flex items-center gap-2">
            <History className="h-5 w-5 text-indigo-400" />
            Stock Movement & Log Control
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Track real-time stock inflows, sales audits, damages, and manual adjustments.</p>
        </div>

        {canAdjust && (
          <button
            onClick={() => setShowAdjustDrawer(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg text-xs font-semibold font-sans transition"
          >
            <Plus className="h-4 w-4" /> Physical Adjustment Form
          </button>
        )}
      </div>

      {/* Grid summarizing alerts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex gap-3.5 items-center">
          <div className="p-2.5 rounded-lg bg-emerald-950/80 text-emerald-400">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-mono block uppercase">Total Catalog SKUs</span>
            <span className="text-xl font-bold font-mono text-white">{products.length} Items</span>
            <span className="text-[9px] text-emerald-500 block">All categories loaded</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex gap-3.5 items-center">
          <div className="p-2.5 rounded-lg bg-red-950/80 text-red-400">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-mono block uppercase">Alerts Requiring Sourcing</span>
            <span className="text-xl font-bold font-mono text-white">
              {products.filter(p => p.stockQuantity <= p.minStockAlert).length} SKUs
            </span>
            <span className="text-[9px] text-red-500 block">Critical low reserve threshold</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex gap-3.5 items-center">
          <div className="p-2.5 rounded-lg bg-indigo-950/80 text-indigo-400">
            <FileCheck className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-mono block uppercase">Physical Movements logged</span>
            <span className="text-xl font-bold font-mono text-white">{movements.length} logs</span>
            <span className="text-[9px] text-indigo-400 block">Audit trail verified and secure</span>
          </div>
        </div>
      </div>

      {/* Logs Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-900 border border-slate-800 rounded-xl p-3">
        <div className="relative sm:col-span-2">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search logs by keyword, part SKU, reference number, or loader staff name..."
            value={logSearch}
            onChange={(e) => setLogSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-850 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none"
          />
        </div>

        <select
          value={logTypeFilter}
          onChange={(e) => setLogTypeFilter(e.target.value)}
          className="px-3 py-1.5 bg-slate-950 border border-slate-850 rounded-lg text-xs text-slate-300 focus:outline-none"
        >
          <option value="All">All Movement Types</option>
          <option value="POS Sale">POS Transactions</option>
          <option value="Supplier Delivery">Supplier Inbound Delivery</option>
          <option value="Manual Adjustment">Manual Adjustments</option>
          <option value="Damage">Damage Reports</option>
          <option value="Lost Item">Lost / Stolen Reports</option>
          <option value="Branch Transfer">Branch Transfers</option>
        </select>
      </div>

      {/* Logs tables */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950 text-slate-400 uppercase font-mono border-b border-slate-800 p-3 bg-opacity-70">
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Product SKU</th>
                <th className="p-3.5">Movement Action</th>
                <th className="p-3.5 font-right text-right">Qty changed</th>
                <th className="p-3.5 font-right text-right">Audit Stack (Before → After)</th>
                <th className="p-3.5">Signed Staff</th>
                <th className="p-3.5">Log explanation / Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 text-slate-300">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-550 font-sans">
                    No matching stock movement logs found in ledger archives.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => {
                  const isAdd = log.qtyChanged > 0;
                  return (
                    <tr key={log.id} className="hover:bg-slate-850/30 transition">
                      <td className="p-3.5 font-mono text-slate-400">
                        {new Date(log.date).toLocaleString([], { hour12: false, month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="p-3.5 font-sans">
                        <span className="font-semibold text-white block">{log.productName}</span>
                        <span className="font-mono text-[10px] text-emerald-400">{log.sku}</span>
                      </td>
                      <td className="p-3.5 font-sans">
                        <span className={`inline-flex items-center gap-1 font-semibold ${
                          log.type === 'POS Sale' || log.type === 'Stock Out' || log.type === 'Damage' || log.type === 'Lost Item'
                            ? 'text-red-400' : 'text-emerald-400'
                        }`}>
                          {isAdd ? (
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          ) : (
                            <ArrowDownLeft className="h-3.5 w-3.5" />
                          )}
                          {log.type}
                        </span>
                      </td>
                      <td className={`p-3.5 text-right font-mono text-sm font-bold ${
                        isAdd ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {isAdd ? `+${log.qtyChanged}` : log.qtyChanged}
                      </td>
                      <td className="p-3.5 text-right font-mono text-slate-400">
                        {log.qtyBefore} <span className="text-slate-550">→</span> <b className="text-slate-200">{log.qtyAfter}</b>
                      </td>
                      <td className="p-3.5 font-sans text-slate-300">
                        {log.staffName}
                      </td>
                      <td className="p-3.5 font-sans space-y-0.5 max-w-sm">
                        <p className="text-slate-200 uppercase tracking-wide text-[9.5px] font-mono">Ref: {log.referenceNo}</p>
                        <p className="text-slate-400 italic text-[11px] leading-snug">{log.reason}</p>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* STOCK ADJUSTMENT FORM DRAWER */}
      {showAdjustDrawer && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 text-white font-sans">
            <h3 className="text-base font-semibold border-b border-slate-800 pb-3 font-mono text-indigo-400">
              Audit Form: Physical Stock Adjustment
            </h3>

            <form onSubmit={handleAdjustSubmit} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block text-slate-450 mb-1">Select Spare Part Product *</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="">-- Choose Stock SKU --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.sku} | {p.name} (Stock: {p.stockQuantity})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-450 mb-1 font-sans">Adjustment Qty *</label>
                  <input 
                    type="number" 
                    placeholder="e.g. -5 or 12"
                    value={qtyChanged}
                    onChange={(e) => setQtyChanged(e.target.value)}
                    required
                    className="w-full bg-slate-950 font-mono border border-slate-850 rounded-lg px-3 py-2 text-slate-100 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">Negative decreases, positive increases</span>
                </div>

                <div>
                  <label className="block text-slate-455 mb-1">Reason Group *</label>
                  <select
                    value={adjustType}
                    onChange={(e) => setAdjustType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-slate-200"
                  >
                    {typesOfAdjustments.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-450 mb-1">Audit Log Explanation / Notes *</label>
                <textarea 
                  rows={3}
                  placeholder="Provide details for this manual change (e.g. Water damage found on bottom box shelf A-12)"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-850 space-y-1">
                <span className="text-[10px] block font-mono text-indigo-400 font-bold uppercase">Log Verification Stamp</span>
                <p className="text-[11px] text-slate-450">Acting Ledger Editor: <b>{staffName}</b></p>
                <p className="text-[10px] text-slate-500 italic">This transaction cannot be undone and is committed to the digital system immutable logs.</p>
              </div>

              <div className="flex gap-2.5 justify-end pt-3 border-t border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setShowAdjustDrawer(false)}
                  className="px-4 py-2 bg-slate-850 hover:bg-slate-800 text-slate-400 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-lg font-sans"
                >
                  Post Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
