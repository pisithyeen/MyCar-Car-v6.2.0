import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Wrench, 
  Tag, 
  MapPin, 
  AlertTriangle,
  Badge,
  CheckCircle,
  FileSpreadsheet
} from 'lucide-react';
import { PartProduct, SupplierProfile } from './PartsData';

interface PartsInventoryProps {
  products: PartProduct[];
  suppliers: SupplierProfile[];
  onAddProduct: (prod: PartProduct) => void;
  canEdit: boolean;
}

export default function PartsInventory({ products, suppliers, onAddProduct, canEdit }: PartsInventoryProps) {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);

  // New product form states
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [partNumber, setPartNumber] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('Braking System');
  const [costPrice, setCostPrice] = useState('0.00');
  const [sellingPrice, setSellingPrice] = useState('0.00');
  const [wholesalePrice, setWholesalePrice] = useState('0.00');
  const [stockQuantity, setStockQuantity] = useState('10');
  const [minStockAlert, setMinStockAlert] = useState('5');
  const [supplierId, setSupplierId] = useState('');
  const [shelfLocation, setShelfLocation] = useState('');
  const [warrantyMonths, setWarrantyMonths] = useState('12');
  const [condition, setCondition] = useState<'New' | 'Used' | 'Refurbished'>('New');
  
  // compatibility states
  const [compBrand, setCompBrand] = useState('Toyota');
  const [compModel, setCompModel] = useState('');
  const [compYear, setCompYear] = useState('');

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const filtered = products.filter(p => {
    const s = search.toLowerCase();
    const matchesSearch = 
      p.name.toLowerCase().includes(s) ||
      p.sku.toLowerCase().includes(s) ||
      p.partNumber.toLowerCase().includes(s);
      
    const matchesCategory = catFilter === 'All' || p.category === catFilter;
    
    let matchesStatus = true;
    if (statusFilter === 'low_stock') {
      matchesStatus = p.stockQuantity <= p.minStockAlert && p.stockQuantity > 0;
    } else if (statusFilter === 'out_of_stock') {
      matchesStatus = p.stockQuantity <= 0;
    } else if (statusFilter === 'normal') {
      matchesStatus = p.stockQuantity > p.minStockAlert;
    }

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleSubmitProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sku || !brand) {
      alert("Please provide name, SKU and brand.");
      return;
    }

    const valCost = parseFloat(costPrice) || 0;
    const valSell = parseFloat(sellingPrice) || 0;
    const valWholesale = parseFloat(wholesalePrice) || 0;
    const valStock = parseInt(stockQuantity) || 0;
    const valAlert = parseInt(minStockAlert) || 0;

    if (valSell < valCost) {
      if(!confirm("Warning: Selling price is lower than cost. Proceed anyway?")) {
        return;
      }
    }

    const statusVal: PartProduct['status'] = valStock === 0 ? 'Out of Stock' :
                      valStock <= valAlert ? 'Low Stock' : 'Active';

    const newProduct: PartProduct = {
      id: `p-${Date.now()}`,
      name,
      sku,
      barcode: `BAR-${Math.floor(100000 + Math.random() * 900000)}`,
      qrCode: `QR-${Math.floor(100000 + Math.random() * 900000)}`,
      partNumber: partNumber || 'OEM-REF',
      brand,
      category,
      costPrice: valCost,
      sellingPrice: valSell,
      wholesalePrice: valWholesale,
      retailPrice: valSell,
      stockQuantity: valStock,
      minStockAlert: valAlert,
      supplierId: supplierId || suppliers[0]?.id || "s1",
      shelfLocation: shelfLocation || "Unassigned Row",
      warrantyMonths: parseInt(warrantyMonths) || 12,
      images: ["https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=400&auto=format&fit=crop&q=60"],
      condition,
      status: statusVal,
      compatibility: compModel ? [{
        brand: compBrand,
        model: compModel,
        year: compYear || "2010-2020",
        compatibleCategory: category
      }] : []
    };

    onAddProduct(newProduct);
    setShowAddModal(false);

    // clear states
    setName('');
    setSku('');
    setPartNumber('');
    setBrand('');
    setCostPrice('0.00');
    setSellingPrice('0.00');
    setWholesalePrice('0.00');
    setStockQuantity('15');
    setShelfLocation('');
    setCompModel('');
    setCompYear('');
  };

  return (
    <div className="space-y-4 font-sans" id="inventory_control_panel">
      {/* Overview stats and controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div>
          <h2 className="text-lg font-medium text-white flex items-center gap-2">
            <Wrench className="h-5 w-5 text-emerald-400" />
            Product Catalog & Inventory
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Manage spare part SKUs, values, and compatible vehicle catalogs</p>
        </div>
        
        {canEdit && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-xs font-semibold self-start sm:self-center transition"
          >
            <Plus className="h-4 w-4" /> Add Part catalog
          </button>
        )}
      </div>

      {/* Sorting bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-900 border border-slate-800 rounded-xl p-3">
        <div className="relative col-span-2">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search catalog by name, manual SKU, or part number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-850 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
          className="px-3 py-1.5 bg-slate-950 border border-slate-850 rounded-lg text-sm text-slate-300 focus:outline-none"
        >
          {categories.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 bg-slate-950 border border-slate-850 rounded-lg text-sm text-slate-300 focus:outline-none"
        >
          <option value="All">All Stock Levels</option>
          <option value="normal">Normal Stock</option>
          <option value="low_stock">⚠️ Low Stock Alerts</option>
          <option value="out_of_stock">❌ Out of Stock items</option>
        </select>
      </div>

      {/* Inventory table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950 text-slate-400 uppercase font-mono font-semibold border-b border-slate-800 bg-opacity-70">
                <th className="p-3.5">Code/SKU</th>
                <th className="p-3.5">Part Details</th>
                <th className="p-3.5">Pricing</th>
                <th className="p-3.5">Stock</th>
                <th className="p-3.5">Compatibility</th>
                <th className="p-3.5">Storage shelf</th>
                <th className="p-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 text-slate-300">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500 font-sans">
                    No active product elements found matching filters.
                  </td>
                </tr>
              ) : (
                filtered.map(p => {
                  const isLow = p.stockQuantity <= p.minStockAlert;
                  return (
                    <tr key={p.id} className="hover:bg-slate-850/40 transition">
                      <td className="p-3.5">
                        <span className="font-mono text-emerald-400 font-semibold">{p.sku}</span>
                        {p.partNumber && (
                          <p className="text-[10px] text-slate-500 font-mono mt-0.5">{p.partNumber}</p>
                        )}
                      </td>
                      <td className="p-3.5 space-y-0.5">
                        <span className="font-medium text-slate-200 block">{p.name}</span>
                        <div className="flex items-center gap-2 text-[10px]">
                          <span className="text-slate-400">{p.brand}</span>
                          <span className="text-slate-600">•</span>
                          <span className="text-slate-400">{p.category}</span>
                          <span className="text-slate-600">•</span>
                          <span className="text-indigo-400 font-sans">{p.condition}</span>
                        </div>
                      </td>
                      <td className="p-3.5 font-mono space-y-0.5">
                        <div className="flex justify-between w-24">
                          <span className="text-slate-500 text-[10px]">Cost:</span>
                          <span className="text-slate-300">${p.costPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between w-24">
                          <span className="text-slate-500 text-[10px]">Whlsale:</span>
                          <span className="text-amber-400">${p.wholesalePrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between w-24">
                          <span className="text-slate-500 text-[10px]">Retail:</span>
                          <span className="text-emerald-400 font-bold">${p.sellingPrice.toFixed(2)}</span>
                        </div>
                      </td>
                      <td className="p-3.5 font-mono">
                        <span className={`text-sm font-semibold  ${
                          p.stockQuantity === 0 ? 'text-red-400' :
                          isLow ? 'text-amber-400' : 'text-slate-200'
                        }`}>
                          {p.stockQuantity}
                        </span>
                        <span className="text-[10.5px] text-slate-500 block">Min req: {p.minStockAlert}</span>
                      </td>
                      <td className="p-3.5 max-w-[140px] truncate">
                        {p.compatibility && p.compatibility.length > 0 ? (
                          p.compatibility.map((c, idx) => (
                            <span key={idx} className="block text-[10px] bg-slate-950 text-slate-400 px-1.5 py-0.5 mb-1 last:mb-0 rounded truncate">
                              {c.brand} {c.model} {c.year}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-slate-650 font-sans">Universal fitment</span>
                        )}
                      </td>
                      <td className="p-3.5 font-sans">
                        <div className="flex items-center gap-1 text-slate-300">
                          <MapPin className="h-3.5 w-3.5 text-slate-500" />
                          <span>{p.shelfLocation}</span>
                        </div>
                        <span className="text-[10px] text-slate-500">Warranty: {p.warrantyMonths} m</span>
                      </td>
                      <td className="p-3.5 text-center">
                        <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-sans uppercase font-medium tracking-wide ${
                          p.stockQuantity === 0 ? 'bg-red-950 text-red-400 border border-red-900/50' :
                          isLow ? 'bg-amber-950 text-amber-400 border border-amber-900/50' :
                          'bg-emerald-950 text-emerald-400 border border-emerald-900/50'
                        }`}>
                          {p.stockQuantity === 0 ? 'Out / Stock' : isLow ? 'Low Reserve' : 'Available'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD CATALOG ITEM DIALOG */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 text-white font-sans max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-semibold border-b border-slate-800 pb-3 font-mono text-emerald-400">
              Create New Catalog Spare Part SKU
            </h3>

            <form onSubmit={handleSubmitProduct} className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-slate-400 mb-1">Product Title / Name *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Dual-core Cooling Water Pump VVT"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Catalog SKU Code *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. COOL-PUM-PRIUS"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    required
                    className="w-full bg-slate-950 font-mono border border-slate-850 rounded-lg px-3 py-2 text-slate-200 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">OEM Part Number</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 16100-39425"
                    value={partNumber}
                    onChange={(e) => setPartNumber(e.target.value)}
                    className="w-full bg-slate-950 font-mono border border-slate-850 rounded-lg px-3 py-2 text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Brand Name *</label>
                  <input 
                    type="text" 
                    placeholder="Denso, AISIN, etc."
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-slate-200 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Category Group</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-slate-200 focus:outline-none"
                  >
                    <option value="Braking System">Braking System</option>
                    <option value="Electrical & Ignition">Electrical & Ignition</option>
                    <option value="Filters & Maintenance">Filters & Maintenance</option>
                    <option value="High Voltage / Energy">High Voltage / Energy</option>
                    <option value="Engine Cooling">Engine Cooling</option>
                    <option value="Suspension Components">Suspension Components</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Condition</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-slate-200"
                  >
                    <option value="New">Brand New</option>
                    <option value="Used">Used / Second-hand</option>
                    <option value="Refurbished">Refurbished</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-850">
                <div>
                  <label className="block text-slate-400 mb-1">Cost Price ($ USD) *</label>
                  <input 
                    type="number" 
                    step="0.01"
                    placeholder="12.00"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    required
                    className="w-full bg-slate-950 font-mono border border-slate-850 rounded-lg px-3 py-2 text-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Selling Price ($) *</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    required
                    className="w-full bg-slate-950 font-mono border border-slate-850 rounded-lg px-3 py-2 text-emerald-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Wholesale Price ($) </label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={wholesalePrice}
                    onChange={(e) => setWholesalePrice(e.target.value)}
                    className="w-full bg-slate-950 font-mono border border-slate-850 rounded-lg px-3 py-2 text-indigo-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Initial Stock Qty</label>
                  <input 
                    type="number" 
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    className="w-full bg-slate-950 font-mono border border-slate-850 rounded-lg px-3 py-2 text-slate-200 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Minimum Alert Qty</label>
                  <input 
                    type="number" 
                    value={minStockAlert}
                    onChange={(e) => setMinStockAlert(e.target.value)}
                    className="w-full bg-slate-950 font-mono border border-slate-850 rounded-lg px-3 py-2 text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Shelf Storage Location</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Shelf A-03"
                    value={shelfLocation}
                    onChange={(e) => setShelfLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-slate-200 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Warranty Period (Months)</label>
                  <input 
                    type="number" 
                    value={warrantyMonths}
                    onChange={(e) => setWarrantyMonths(e.target.value)}
                    className="w-full bg-slate-950 font-mono border border-slate-850 rounded-lg px-3 py-2 text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              {/* Vehicle compatibility schema builder */}
              <div className="bg-slate-950 border border-slate-850 rounded-lg p-3 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-mono block">Vehicle Compatibility Record</span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-500">Brand</label>
                    <select
                      value={compBrand}
                      onChange={(e) => setCompBrand(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-300"
                    >
                      <option value="Toyota">Toyota</option>
                      <option value="Lexus">Lexus</option>
                      <option value="Ford">Ford</option>
                      <option value="Kia">Kia</option>
                      <option value="Honda">Honda</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500">Model Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Prius"
                      value={compModel}
                      onChange={(e) => setCompModel(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-300 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500">Year Range</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 2010-2015"
                      value={compYear}
                      onChange={(e) => setCompYear(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-300 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Action operations buttons */}
              <div className="flex gap-2.5 justify-end pt-3 border-t border-slate-850">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-850 hover:bg-slate-800 text-slate-400 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg"
                >
                  Save to Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
