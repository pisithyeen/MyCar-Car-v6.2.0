import React, { useState } from 'react';
import { 
  Search, 
  ShoppingCart, 
  User, 
  Coins, 
  Trash2, 
  Plus, 
  Minus, 
  Printer, 
  QrCode, 
  Check, 
  CreditCard,
  FileCheck
} from 'lucide-react';
import { PartProduct, POSCartItem, SalesInvoice, CustomerProfile } from './PartsData';

interface PartsPOSProps {
  products: PartProduct[];
  customers: CustomerProfile[];
  onCompleteSale: (invoice: SalesInvoice) => void;
  staffName: string;
  serviceTickets?: any[];
  onSettleTicket?: (ticketId: string) => void;
}

export default function PartsPOS({ 
  products, 
  customers, 
  onCompleteSale, 
  staffName,
  serviceTickets = [],
  onSettleTicket
}: PartsPOSProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [compatibilityQuery, setCompatibilityQuery] = useState('');
  
  // Cart state
  const [cart, setCart] = useState<POSCartItem[]>([]);
  
  // Invoice state
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [anonName, setAnonName] = useState('');
  const [anonPhone, setAnonPhone] = useState('');
  const [vehicleInfo, setVehicleInfo] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'ABA Pay' | 'KHQR' | 'Bank Transfer' | 'Mixed Payment' | 'Credit Sale'>('Cash');
  const [paymentDetails, setPaymentDetails] = useState('');
  
  // Checkout summary modal
  const [showReceipt, setShowReceipt] = useState<SalesInvoice | null>(null);

  // Multi-service ticket settling states
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [settlingTicketId, setSettlingTicketId] = useState<string | null>(null);
  const [invoiceType, setInvoiceType] = useState<'combined' | 'product_only' | 'labor_only'>('combined');

  // Sub calculations
  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];
  const brands = ['All', ...Array.from(new Set(products.map(p => p.brand)))];

  // Filters catalog
  const filteredProducts = products.filter(p => {
    const s = searchQuery.toLowerCase();
    const matchesSearch = 
      p.name.toLowerCase().includes(s) ||
      p.sku.toLowerCase().includes(s) ||
      p.partNumber.toLowerCase().includes(s) ||
      p.barcode.toLowerCase().includes(s);
      
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesBrand = selectedBrand === 'All' || p.brand === selectedBrand;
    
    const c = compatibilityQuery.toLowerCase();
    const matchesCompatibility = !c || p.compatibility.some(item => 
      item.brand.toLowerCase().includes(c) || 
      item.model.toLowerCase().includes(c) ||
      item.year.includes(c)
    );
    
    return matchesSearch && matchesCategory && matchesBrand && matchesCompatibility && p.status !== 'Inactive';
  });

  const addToCart = (product: PartProduct) => {
    if (product.stockQuantity <= 0) {
      alert("Product is out of stock!");
      return;
    }
    
    const existing = cart.find(c => c.product.id === product.id);
    if (existing) {
      if (existing.quantity >= product.stockQuantity) {
        alert(`Cannot add more. Static stock limit is ${product.stockQuantity}.`);
        return;
      }
      setCart(cart.map(c => 
        c.product.id === product.id 
          ? { ...c, quantity: c.quantity + 1 } 
          : c
      ));
    } else {
      setCart([...cart, {
        product,
        quantity: 1,
        price: product.sellingPrice,
        discount: 0,
        warrantyMonths: product.warrantyMonths,
        taxPercent: 10 // Standard Cambodia 10% VAT
      }]);
    }
  };

  const updateQuantity = (productId: string, delta: number) => {
    const item = cart.find(c => c.product.id === productId);
    if (!item) return;
    
    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      setCart(cart.filter(c => c.product.id !== productId));
      return;
    }
    
    if (newQty > item.product.stockQuantity) {
      alert(`Limited stock available (${item.product.stockQuantity})`);
      return;
    }
    
    setCart(cart.map(c => 
      c.product.id === productId ? { ...c, quantity: newQty } : c
    ));
  };

  const updateItemDiscount = (productId: string, discValue: number) => {
    setCart(cart.map(c => 
      c.product.id === productId ? { ...c, discount: Math.max(0, discValue) } : c
    ));
  };

  const updateItemWarranty = (productId: string, months: number) => {
    setCart(cart.map(c => 
      c.product.id === productId ? { ...c, warrantyMonths: Math.max(0, months) } : c
    ));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(c => c.product.id !== productId));
  };

  // totals
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const totalDiscount = cart.reduce((acc, item) => acc + (item.discount * item.quantity), 0);
  const totalTax = cart.reduce((acc, item) => {
    const itemPriceAfterDiscount = (item.price * item.quantity) - (item.discount * item.quantity);
    return acc + (itemPriceAfterDiscount * (item.taxPercent / 100));
  }, 0);
  const totalAmount = subtotal - totalDiscount + totalTax;

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    const customerName = isAnonymous ? (anonName || "Anonymous Walk-In") : (selectedCustomer?.name || "");
    const customerPhone = isAnonymous ? (anonPhone || "000-000-000") : (selectedCustomer?.phone || "");
    
    const invoiceNum = `INV-MC-${Math.floor(1000 + Math.random() * 9000)}`;
    const newInvoice: SalesInvoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: invoiceNum,
      date: new Date().toISOString(),
      customerId: isAnonymous ? undefined : selectedCustomer?.id,
      customerName,
      customerPhone,
      vehicleInfo: vehicleInfo || selectedCustomer?.vehiclesOwned?.[0] || 'Uncoded Vehicle',
      items: cart.map(c => {
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + c.warrantyMonths);
        return {
          productId: c.product.id,
          name: c.product.name,
          sku: c.product.sku,
          price: c.price,
          quantity: c.quantity,
          discount: c.discount,
          taxAmount: ((c.price - c.discount) * c.quantity) * (c.taxPercent / 100),
          warrantyExpiry: expiryDate.toISOString().split('T')[0]
        };
      }),
      subtotal,
      totalDiscount,
      totalTax,
      totalAmount,
      paymentMethod,
      paymentDetails: paymentDetails || (settlingTicketId ? `Settled service ticket ${settlingTicketId}` : `POS transaction processed via ${paymentMethod}`),
      staffName,
      status: paymentMethod === 'Credit Sale' ? 'Credit Outstanding' : 'Paid'
    };

    if (settlingTicketId && onSettleTicket) {
      onSettleTicket(settlingTicketId);
    }

    onCompleteSale(newInvoice);
    setShowReceipt(newInvoice);
    
    // Reset states
    setCart([]);
    setSelectedCustomer(null);
    setIsAnonymous(true);
    setAnonName('');
    setAnonPhone('');
    setVehicleInfo('');
    setPaymentDetails('');
    setSettlingTicketId(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)] overflow-hidden font-sans" id="pos_container_grid">
      {/* Search & Products Grid */}
      <div className="lg:col-span-7 flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden p-4">
        <h2 className="text-lg font-medium text-white mb-3">POS Parts Finder</h2>
        
        {/* Lookup Bars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search SKU, name, code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Car compatibility (e.g. Prius)..."
              value={compatibilityQuery}
              onChange={(e) => setCompatibilityQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
        </div>

        {/* Catalog Items Grid */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              No matching active spare parts found matching filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-4">
              {filteredProducts.map(prod => {
                const isLow = prod.stockQuantity <= prod.minStockAlert;
                return (
                  <div 
                    key={prod.id} 
                    onClick={() => addToCart(prod)}
                    className="flex flex-col justify-between p-3 bg-slate-950 hover:bg-slate-800/60 border border-slate-800 hover:border-slate-700 rounded-lg cursor-pointer transition-all duration-200 group"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-1">
                        <span className="text-xs font-mono text-emerald-400 font-medium">{prod.sku}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                          prod.stockQuantity === 0 ? 'bg-red-950/80 text-red-400' :
                          isLow ? 'bg-amber-950/80 text-amber-400' : 'bg-emerald-950/50 text-emerald-400'
                        }`}>
                          Qty: {prod.stockQuantity}
                        </span>
                      </div>
                      <h4 className="text-sm font-medium text-slate-200 mt-1 line-clamp-2 leading-snug group-hover:text-white">
                        {prod.name}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5 font-sans">
                        PartNo: <span className="font-mono text-slate-300">{prod.partNumber || 'N/A'}</span>
                      </p>
                      
                      {/* Compatibility badging */}
                      {prod.compatibility && prod.compatibility.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {prod.compatibility.slice(0, 2).map((comp, idx) => (
                            <span key={idx} className="text-[10px] bg-slate-850 px-1.5 py-0.5 rounded text-slate-400 font-sans">
                              {comp.brand} {comp.model} ({comp.year})
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-end mt-3 pt-2 border-t border-slate-900">
                      <span className="text-xs text-slate-400">Loc: {prod.shelfLocation}</span>
                      <span className="text-sm font-semibold text-white font-mono">${prod.sellingPrice.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* POS Checkout & Cart Operations */}
      <div className="lg:col-span-5 flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden p-4">
        <div className="flex justify-between items-center mb-3">
          <div className="flex flex-col">
            <h2 className="text-lg font-medium text-white flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-emerald-400" />
              Shopping Cart ({cart.reduce((a, b) => a + b.quantity, 0)})
            </h2>
            {settlingTicketId && (
              <span className="text-[10px] text-amber-400 font-mono">🔗 Settle Ticket: <b>{settlingTicketId}</b></span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowTicketModal(true)}
              className="px-2.5 py-1 bg-sky-950 border border-sky-800 text-sky-400 rounded hover:bg-sky-900 transition text-[10px] uppercase font-bold tracking-tight"
            >
              🧾 Settle Ticket
            </button>
            {cart.length > 0 && (
              <button 
                onClick={() => { if(confirm("Clear cart?")) setCart([]); setSettlingTicketId(null); }}
                className="text-xs text-red-500 hover:text-red-400 flex items-center gap-1 font-sans cursor-pointer"
              >
                <Trash2 className="h-3 w-3" /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Selected Items List */}
        <div className="flex-1 overflow-y-auto mb-4 border border-slate-850 rounded-lg p-2 bg-slate-950">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 py-12">
              <ShoppingCart className="h-8 w-8 text-slate-700 mb-2 stroke-[1.5]" />
              <p className="text-xs">No parts listed in invoice cart.</p>
              <p className="text-[10px] text-slate-650 mt-1">Tap a product model on the left to add.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {cart.map((item) => (
                <div key={item.product.id} className="p-2 border border-slate-800 rounded-lg bg-slate-900/50 space-y-1.5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="text-xs font-semibold text-slate-200 line-clamp-1">{item.product.name}</h5>
                      <span className="text-[10px] font-mono text-slate-400">{item.product.sku} | Loc: {item.product.shelfLocation}</span>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-slate-500 hover:text-red-400 transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-900/40">
                    {/* Qty controller */}
                    <div className="flex items-center gap-1 bg-slate-950 px-1 rounded border border-slate-850">
                      <button 
                        onClick={() => updateQuantity(item.product.id, -1)} 
                        className="p-1 text-slate-400 hover:text-white"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-xs text-white px-1.5 font-mono min-w-[20px] text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.product.id, 1)} 
                        className="p-1 text-slate-400 hover:text-white"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Single Disc Modifier */}
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-slate-400 font-sans">Disc ($):</span>
                      <input 
                        type="number" 
                        value={item.discount || ''}
                        placeholder="0"
                        onChange={(e) => updateItemDiscount(item.product.id, parseFloat(e.target.value) || 0)}
                        className="w-12 px-1 py-0.5 bg-slate-950 border border-slate-850 rounded text-center text-xs font-mono text-amber-400 focus:outline-none"
                      />
                    </div>

                    {/* Warranty Months Modifier */}
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-slate-400 font-sans">Warranty:</span>
                      <input 
                        type="number" 
                        value={item.warrantyMonths}
                        onChange={(e) => updateItemWarranty(item.product.id, parseInt(e.target.value) || 0)}
                        className="w-10 px-1 py-0.5 bg-slate-950 border border-slate-850 rounded text-center text-xs font-mono text-slate-200 focus:outline-none"
                      />
                      <span className="text-[9px] text-slate-400 font-sans">m</span>
                    </div>

                    {/* Math values */}
                    <div className="text-right">
                      <p className="text-xs font-semibold text-white font-mono">
                        ${((item.price - item.discount) * item.quantity).toFixed(2)}
                      </p>
                      {item.discount > 0 && (
                        <p className="text-[9px] text-amber-400 font-mono">-${(item.discount * item.quantity).toFixed(2)}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Customer & Billing Form Details */}
        <form onSubmit={handleCheckout} className="space-y-3 pt-2 border-t border-slate-850">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-sans text-slate-400 mb-1">Invoice Billing Type</label>
              <select
                value={invoiceType}
                onChange={(e) => setInvoiceType(e.target.value as any)}
                className="w-full text-xs bg-slate-950 border border-slate-850 rounded-lg py-1.5 text-white focus:outline-none"
              >
                <option value="combined">Combined Product + Labor</option>
                <option value="product_only">Product Only</option>
                <option value="labor_only">Labor Only</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-sans text-slate-400 mb-1">Buyer Type</label>
              <select
                value={isAnonymous ? 'anon' : 'assigned'}
                onChange={(e) => setIsAnonymous(e.target.value === 'anon')}
                className="w-full text-xs bg-slate-950 border border-slate-850 rounded-lg py-1.5 text-white focus:outline-none"
              >
                <option value="anon">Walk-In Customer</option>
                <option value="assigned">Registered Profile</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {isAnonymous ? (
              <div>
                <label className="block text-[11px] font-sans text-slate-400 mb-1">Customer Name</label>
                <input 
                  type="text" 
                  placeholder="Anonymous/Walk-In Name"
                  value={anonName}
                  onChange={(e) => setAnonName(e.target.value)}
                  className="w-full text-xs bg-slate-950 border border-slate-850 rounded-lg px-2.5 py-1.5 text-white placeholder-slate-650 focus:outline-none font-sans"
                />
              </div>
            ) : (
              <div>
                <label className="block text-[11px] font-sans text-slate-400 mb-1">Select Customer</label>
                <select
                  value={selectedCustomer?.id || ''}
                  onChange={(e) => {
                    const c = customers.find(cust => cust.id === e.target.value);
                    setSelectedCustomer(c || null);
                  }}
                  required
                  className="w-full text-xs bg-slate-950 border border-slate-850 rounded-lg py-1.5 text-white focus:outline-none"
                >
                  <option value="">-- Select --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-sans text-slate-400 mb-1">Customer Phone</label>
              <input 
                type="text" 
                placeholder="012-777-888"
                value={anonPhone}
                onChange={(e) => setAnonPhone(e.target.value)}
                className="w-full text-xs font-mono bg-slate-950 border border-slate-850 rounded-lg px-2.5 py-1.5 text-white placeholder-slate-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-sans text-slate-400 mb-1">
                {isAnonymous ? "Customer Name" : "Linked Vehicle"}
              </label>
              {isAnonymous ? (
                <input 
                  type="text" 
                  placeholder="Walk-In Name"
                  value={anonName}
                  onChange={(e) => setAnonName(e.target.value)}
                  className="w-full text-xs bg-slate-950 border border-slate-850 rounded-lg px-2.5 py-1.5 text-white placeholder-slate-600 focus:outline-none"
                />
              ) : (
                <select
                  value={vehicleInfo}
                  onChange={(e) => setVehicleInfo(e.target.value)}
                  className="w-full text-xs bg-slate-950 border border-slate-850 rounded-lg py-1.5 text-white focus:outline-none"
                >
                  <option value="">-- Direct Match --</option>
                  {selectedCustomer?.vehiclesOwned.map(veh => (
                    <option key={veh} value={veh}>{veh}</option>
                  ))}
                  <option value="New custom vehicle">Custom vehicle note...</option>
                </select>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-sans text-slate-400 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full text-xs bg-slate-950 border border-slate-850 rounded-lg py-1.5 text-white focus:outline-none font-medium text-emerald-400"
              >
                <option value="Cash">💵 Cash USD</option>
                <option value="ABA Pay">📲 ABA Pay (Instant)</option>
                <option value="KHQR">🇰🇭 KHQR (National)</option>
                <option value="Bank Transfer">🏦 Bank Transfer</option>
                <option value="Mixed Payment">🔀 Mixed Cash+App</option>
                <option value="Credit Sale">⏳ Credit / Post-Paid</option>
              </select>
            </div>
          </div>

          {/* Conditional payment details info */}
          {paymentMethod !== 'Cash' && (
            <input 
              type="text" 
              placeholder="Enter transfer reference info or notes..."
              value={paymentDetails}
              onChange={(e) => setPaymentDetails(e.target.value)}
              className="w-full text-xs bg-slate-950 border border-slate-850 rounded-lg px-2.5 py-1 text-slate-350 focus:outline-none"
            />
          )}

          {/* Pricing Calculation Summary */}
          <div className="bg-slate-950 rounded-lg p-3 space-y-1 text-xs border border-slate-850">
            <div className="flex justify-between text-slate-400">
              <span>Retail Subtotal:</span>
              <span className="font-mono font-medium">${subtotal.toFixed(2)}</span>
            </div>
            {totalDiscount > 0 && (
              <div className="flex justify-between text-amber-400">
                <span>Active Deductions:</span>
                <span className="font-mono font-medium">-${totalDiscount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-400">
              <span>National VAT (10%):</span>
              <span className="font-mono font-medium">${totalTax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-white text-sm font-semibold pt-1 border-t border-slate-900">
              <span className="text-emerald-400">GRAND TOTAL:</span>
              <span className="font-mono text-emerald-400 text-base">${totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Submit Trigger */}
          <button
            type="submit"
            disabled={cart.length === 0}
            className="w-full font-sans font-medium text-sm text-center py-2.5 bg-emerald-500 disabled:bg-slate-800 text-slate-950 disabled:text-slate-500 hover:bg-emerald-400 rounded-lg transition"
            id="checkout_complete_btn"
          >
            Process Invoice Receipt 💰
          </button>
        </form>
      </div>

      {/* RETAIL RECEIPT MODAL */}
      {showReceipt && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 text-white font-sans shadow-xl">
            {/* Stamp Logo header */}
            <div className="text-center pb-4 border-b border-slate-850 space-y-1">
              <span className="text-xl font-bold text-emerald-400 tracking-wider font-mono">MyCar Care KH</span>
              <h3 className="text-xs text-slate-300">Professional Parts & Accessories Center</h3>
              <p className="text-[10px] text-slate-400">Russian Boulevard, Sen Sok, Phnom Penh</p>
              <p className="text-[10px] text-slate-400">Tel: 015 993 847 | 023-MC-CARE</p>
              <div className="inline-block mt-2 bg-emerald-950/85 px-3 py-1 rounded text-xs text-emerald-400 font-semibold uppercase">
                Official Retail Invoice
              </div>
            </div>

            {/* Info details */}
            <div className="py-3 text-xs space-y-1.5 border-b border-slate-850">
              <div className="flex justify-between">
                <span className="text-slate-400">Invoice:</span>
                <span className="font-mono font-bold text-slate-200">{showReceipt.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Date/Time:</span>
                <span className="font-mono text-slate-200">{new Date(showReceipt.date).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Billed Customer:</span>
                <span className="font-sans text-slate-200">{showReceipt.customerName} ({showReceipt.customerPhone})</span>
              </div>
              {showReceipt.vehicleInfo && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Vehicle Info:</span>
                  <span className="font-sans text-slate-300 italic">{showReceipt.vehicleInfo}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-400">Cashier Staff:</span>
                <span className="text-slate-300 font-sans">{showReceipt.staffName}</span>
              </div>
            </div>

            {/* Items row */}
            <div className="py-3 text-xs space-y-2 border-b border-slate-850">
              {showReceipt.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start">
                  <div className="max-w-[70%]">
                    <p className="font-medium text-slate-200">{item.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {item.sku} • {item.quantity} x ${item.price.toFixed(2)}
                      {item.discount > 0 && ` (-$${item.discount.toFixed(2)})`}
                    </p>
                    <p className="text-[9px] text-emerald-500 font-sans">
                      Warranty to: {item.warrantyExpiry}
                    </p>
                  </div>
                  <span className="font-mono text-slate-200 font-semibold mt-1">
                    ${((item.price - item.discount) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Tax calculation logic */}
            <div className="py-3 text-xs space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal:</span>
                <span className="font-mono">${showReceipt.subtotal.toFixed(2)}</span>
              </div>
              {showReceipt.totalDiscount > 0 && (
                <div className="flex justify-between text-amber-400">
                  <span>Rebates Discount:</span>
                  <span className="font-mono">-${showReceipt.totalDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-400">
                <span>Cambodian VAT (10%):</span>
                <span className="font-mono">${showReceipt.totalTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-emerald-400 text-sm font-bold pt-2 border-t border-slate-850">
                <span>TOTAL RECHARGE:</span>
                <span className="font-mono text-base">${showReceipt.totalAmount.toFixed(2)}</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-2 flex justify-between bg-slate-950 p-2 rounded">
                <span>Method: <b>{showReceipt.paymentMethod}</b></span>
                <span className="line-clamp-1 truncate max-w-[60%]">Ref: {showReceipt.paymentDetails}</span>
              </div>
            </div>

            {/* Print/Download and Close Actions */}
            <div className="flex gap-2.5 pt-4">
              <button 
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 text-xs flex items-center justify-center gap-1 font-semibold"
              >
                <Printer className="h-4 w-4" /> Print A4/A5
              </button>
              
              <button 
                onClick={() => {
                  alert("Digital Invoice file generated ready for download! (Mock)");
                }}
                className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 text-xs flex items-center justify-center gap-1 font-semibold"
              >
                <FileCheck className="h-4 w-4" /> Export PDF
              </button>

              <button 
                onClick={() => setShowReceipt(null)}
                className="py-1.5 px-4 bg-emerald-500 hover:bg-emerald-400 rounded-lg text-slate-950 text-xs font-bold"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
     {/* Active Repairs Settle Lookup Modal */}
      {showTicketModal && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-6 text-white font-sans shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-sky-400 flex items-center gap-1.5">
                  <FileCheck className="w-5 h-5 text-emerald-400" /> Settle Service Repair Tickets
                </h3>
                <p className="text-[10px] text-slate-400">Load parts used, custom labor ratios, and customer metadata directly into the POS checkout matrix</p>
              </div>
              <button 
                type="button" 
                onClick={() => setShowTicketModal(false)}
                className="text-slate-400 hover:text-white font-black text-sm px-2 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {serviceTickets.filter(t => t.status === "In Progress" || t.status === "Review").length === 0 ? (
                <p className="text-center text-xs text-slate-500 py-8">No active, unsettled "In Progress" or "Review" service tickets found for billing.</p>
              ) : (
                serviceTickets
                  .filter(t => t.status === "In Progress" || t.status === "Review")
                  .map((t: any) => {
                    return (
                      <div key={t.id} className="bg-slate-950/60 p-3.5 border border-slate-850 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-sky-300 font-mono">{t.id}</span>
                            <span className="text-[9px] bg-slate-800 text-amber-400 px-1.5 py-0.5 rounded font-mono font-black uppercase tracking-wider">{t.status}</span>
                            <span className="text-[10px] text-slate-450 font-mono">{t.date}</span>
                          </div>
                          <p className="text-xs font-bold text-slate-200">{t.customerName} - <span className="text-slate-400 font-normal">{t.vehicleModel} ({t.vehiclePlate})</span></p>
                          <p className="text-[10.5px] text-emerald-400 italic">"{t.problemDescription}"</p>
                          <div className="flex items-center gap-3 text-[9px] text-slate-500 font-mono mt-1 pt-1 border-t border-slate-850/60">
                            <span>Labor: <b>${t.laborFee}</b></span>
                            <span>Est Total: <b>${t.estimatedCost}</b></span>
                            <span>Parts: <b>{t.partsUsed?.length || 0} catalog slots</b></span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1 w-full md:w-auto shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              // Force checkout form values set and load
                              setIsAnonymous(true);
                              setAnonName(t.customerName);
                              setAnonPhone(t.vehiclePlate);
                              setVehicleInfo(`${t.vehicleModel} [Plate: ${t.vehiclePlate}]`);
                              setSettlingTicketId(t.id);
                              
                              // Translate parts
                              let loadedItems: POSCartItem[] = [];
                              if (invoiceType !== 'labor_only' && t.partsUsed) {
                                t.partsUsed.forEach((part: any) => {
                                  // look for products
                                  const match = products.find(p => p.id === part.productId || p.name.toLowerCase() === part.name.toLowerCase());
                                  if (match) {
                                    loadedItems.push({
                                      product: match,
                                      quantity: part.qty || 1,
                                      price: part.prc || match.sellingPrice,
                                      discount: 0,
                                      warrantyMonths: match.warrantyMonths,
                                      taxPercent: 10
                                    });
                                  } else {
                                    const virt: any = {
                                      id: part.productId || `v-${Date.now()}-${Math.floor(Math.random()*100)}`,
                                      name: part.name,
                                      sku: "SP-VIRTUAL",
                                      partNumber: "VIRT",
                                      barcode: "VIRT",
                                      brand: "Repairs Dispatch",
                                      category: "General Spares",
                                      sellingPrice: part.prc || 10,
                                      stockQuantity: 999,
                                      minStockAlert: 1,
                                      compatibility: [],
                                      location: "Sensok Store",
                                      status: "Active",
                                      warrantyMonths: 6,
                                      imageUrl: "",
                                      description: "Ad-hoc parts list"
                                    };
                                    loadedItems.push({
                                      product: virt,
                                      quantity: part.qty || 1,
                                      price: part.prc || 10,
                                      discount: 0,
                                      warrantyMonths: 6,
                                      taxPercent: 10
                                    });
                                  }
                                });
                              }

                              if (invoiceType !== 'product_only' && (t.laborFee || 0) > 0) {
                                const laborProd: any = {
                                  id: `labor-${t.id}`,
                                  name: `Technician Labor Service Charge [Ticket: ${t.id}]`,
                                  sku: "LABOR-SVC",
                                  partNumber: "LABOR",
                                  barcode: "LABOR",
                                  brand: "In-Garage",
                                  category: "Labor Fee",
                                  sellingPrice: t.laborFee,
                                  stockQuantity: 1000,
                                  minStockAlert: 0,
                                  compatibility: [],
                                  location: "Service Bay",
                                  status: "Active",
                                  warrantyMonths: 3,
                                  imageUrl: "",
                                  description: "Diagnostic, tuning, and replacement fee"
                                };
                                loadedItems.push({
                                  product: laborProd,
                                  quantity: 1,
                                  price: t.laborFee,
                                  discount: 0,
                                  warrantyMonths: 3,
                                  taxPercent: 10
                                });
                              }

                              setCart(loadedItems);
                              setShowTicketModal(false);
                            }}
                            className="bg-indigo-600 hover:bg-indigo-500 font-bold px-3 py-1.5 rounded text-[10px] uppercase font-mono tracking-wider transition"
                          >
                            Load to POS Cart
                          </button>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>

            <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-lg text-[10.5px] text-slate-400">
              <span>Billing mode selection matches active invoice parameters: <b>{invoiceType.toUpperCase()}</b></span>
              <button 
                type="button" 
                onClick={() => setShowTicketModal(false)}
                className="bg-slate-800 text-slate-300 font-sans px-3.5 py-1 rounded hover:bg-slate-750 transition"
              >
                Close Listing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
