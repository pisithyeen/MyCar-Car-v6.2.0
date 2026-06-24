import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Wrench, 
  Clock, 
  Coins, 
  Database, 
  ShoppingBag, 
  Tag, 
  Plus, 
  Search, 
  CheckCircle, 
  AlertTriangle, 
  Sparkles, 
  FileText, 
  Check, 
  X, 
  Bell, 
  Trash2, 
  Users, 
  Briefcase, 
  TrendingUp, 
  Printer, 
  ArrowRightLeft, 
  Truck, 
  Percent, 
  ShieldCheck, 
  Layers, 
  Settings, 
  LogOut, 
  MapPin, 
  RotateCcw, 
  FileCheck, 
  Smartphone,
  Bot
} from 'lucide-react';

// Specialized modular component imports
import { 
  getPlatformState, 
  savePlatformState, 
  PartProduct, 
  StockMovement, 
  SalesInvoice, 
  OnlineOrder, 
  PartMarketplacePost, 
  CustomerProfile, 
  GarageBuyerProfile, 
  SupplierProfile, 
  PurchaseOrder, 
  ReturnWarrantyRecord, 
  PartPromotion, 
  ROLE_PERMISSIONS_MATRIX, 
  StaffRole 
} from './PartsData';

// Modular views imports
import PartsPOS from './PartsPOS';
import PartsInventory from './PartsInventory';
import PartsStockControl from './PartsStockControl';
import PartsMarketplace from './PartsMarketplace';
import PartsAiAssistant from './PartsAiAssistant';
import PartsReports from './PartsReports';

interface PartsDashboardProps {
  vehicles?: any[];
  userProfile?: any;
  records?: any[];
  onLogRecordExternal?: (record: any) => void;
  onRefreshData?: () => void;
}

export default function PartsDashboard({ 
  vehicles = [], 
  userProfile, 
  records = [], 
  onLogRecordExternal, 
  onRefreshData 
}: PartsDashboardProps) {
  // Global React reactive database loaded from browser local storage
  const [dbState, setDbState] = useState(() => getPlatformState());

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pos' | 'products' | 'stock' | 'marketplace_posts' | 'ai_advisor' | 'customers' | 'suppliers' | 'returns' | 'promotions' | 'reports' | 'staff' | 'service_tickets' | 'settings'>('dashboard');

  // Interactive Staff Role switching setup
  const [actingRole, setActingRole] = useState<StaffRole>('Shop Owner');
  const [activeStaffName, setActiveStaffName] = useState('David Chan');

  // Multi-service activation states
  const [isMultiService, setIsMultiService] = useState(() => {
    if (userProfile?.isMultiService !== undefined) return userProfile.isMultiService;
    return true; // default true for demonstration
  });

  const [activatedModules, setActivatedModules] = useState<string[]>(() => {
    if (userProfile?.activatedModules) return userProfile.activatedModules;
    return [
      "Spare Parts Shop Module",
      "Garage / Repair Shop Module",
      "Mini POS Module",
      "Inventory / Stock Control Module",
      "Service Ticket Module",
      "Vehicle Maintenance Log Module",
      "Marketplace Seller Module",
      "Supplier / Purchase Order Module",
      "Warranty Module",
      "Reports Module"
    ];
  });

  const isModuleActive = (moduleName: string) => {
    if (!isMultiService) return true; // if not multi-service mode, activate everything
    return activatedModules.includes(moduleName);
  };

  // Dashboard active view mode mode switcher
  const [currentMode, setCurrentMode] = useState<'unified' | 'spare_parts_shop' | 'garage_repair'>('unified');

  // Service Tickets local persistence matching standard
  const [serviceTickets, setServiceTickets] = useState<any[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("mycar_spareparts_serviceTickets");
      if (saved) return JSON.parse(saved);
    }
    return [
      {
        id: "TKT-8840",
        customerName: "Sok Chamroeun",
        vehiclePlate: "2AP-4921",
        vehicleModel: "Toyota Prius 2010",
        problemDescription: "A/C cooling weak, minor brake noise on front left hub",
        status: "In Progress",
        date: "2026-06-02",
        assignedStaffName: "Chan Kiri",
        estimatedCost: 120,
        partsUsed: [
          { productId: "p-4", name: "Iridium Spark Plugs Set - Denso Japan", qty: 1, prc: 45, source: "In-house Parts" },
          { name: "Cabin A/C Filter Element", qty: 1, prc: 15, source: "Customer Bringing" }
        ],
        laborFee: 35,
        notes: "Freon refilled, spark plugs replaced."
      },
      {
        id: "TKT-3129",
        customerName: "Kosal Vandy",
        vehiclePlate: "2B-8833",
        vehicleModel: "Lexus RX350 2015",
        problemDescription: "Engine oil change + oil filter replace + brake fluid top-up",
        status: "Review",
        date: "2026-06-01",
        assignedStaffName: "David Chan",
        estimatedCost: 110,
        partsUsed: [
          { productId: "p-2", name: "Premium Synthetic Engine Oil 5W-30 (4L) - Liqui Moly", qty: 1, prc: 55, source: "In-house Parts" },
          { productId: "p-3", name: "OEM Toyota Oil Filter Element", qty: 1, prc: 12, source: "In-house Parts" }
        ],
        laborFee: 15,
        notes: "Slight engine ticking noise checked. Spark plug inspection recommended next month."
      }
    ];
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("mycar_spareparts_serviceTickets", JSON.stringify(serviceTickets));
    }
  }, [serviceTickets]);

  const handleSettleTicket = (ticketId: string) => {
    setServiceTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        if (onLogRecordExternal) {
          onLogRecordExternal({
            id: `rec-${Date.now()}`,
            vehiclePlate: t.vehiclePlate,
            customerName: t.customerName,
            problemDescription: t.problemDescription,
            totalCost: t.estimatedCost,
            date: new Date().toISOString().split('T')[0],
            mechanicReport: t.notes || "Repairs successfully processed, parts verified fitting.",
            serviceItems: [
              ...t.partsUsed.map((p: any) => `${p.name} [Source: ${p.source}]`),
              `Labor service fee: $${t.laborFee}`
            ]
          });
        }
        return { ...t, status: "Completed" };
      }
      return t;
    }));
  };

  // Create Service Ticket state hooks
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [newTktCustomerName, setNewTktCustomerName] = useState('');
  const [newTktVehicleModel, setNewTktVehicleModel] = useState('');
  const [newTktVehiclePlate, setNewTktVehiclePlate] = useState('');
  const [newTktProblem, setNewTktProblem] = useState('');
  const [newTktLabor, setNewTktLabor] = useState(35);
  const [newTktParts, setNewTktParts] = useState<any[]>([]);

  const handleCreateTicketClose = () => {
    const subPartsTotal = newTktParts.reduce((sum, p) => sum + (Number(p.prc) * Number(p.qty || 1)), 0);
    const combinedTotal = subPartsTotal + Number(newTktLabor || 0);

    const builtTicket = {
      id: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: newTktCustomerName || "Walk-in Guest",
      vehiclePlate: newTktVehiclePlate || "2A-8840",
      vehicleModel: newTktVehicleModel || "Toyota Camry 2008",
      problemDescription: newTktProblem || "General Diagnosis",
      status: "In Progress",
      date: new Date().toISOString().split('T')[0],
      assignedStaffName: activeStaffName || "Service Advisor",
      estimatedCost: combinedTotal,
      partsUsed: newTktParts,
      laborFee: Number(newTktLabor || 0),
      notes: "Newly listed vehicle on active rack."
    };

    // Deduct stock for "In-house Parts"!
    let nextProducts = [...dbState.products];
    const nextMovements = [...dbState.movements];

    newTktParts.forEach((part: any) => {
      if (part.source === 'In-house Parts' && part.productId) {
        nextProducts = nextProducts.map(p => {
          if (p.id === part.productId) {
            const nextQty = Math.max(0, p.stockQuantity - Number(part.qty || 1));
            
            // Push dynamic Stock movement tracking
            nextMovements.unshift({
              id: `stock-move-tkt-${Date.now()}-${Math.floor(Math.random() * 100)}`,
              productId: p.id,
              productName: p.name,
              sku: p.sku || "N/A",
              date: new Date().toISOString(),
              staffName: activeStaffName || "System Auto",
              qtyBefore: p.stockQuantity,
              qtyChanged: -Number(part.qty || 1),
              qtyAfter: nextQty,
              sourceChannel: "Used in Service Diagnostic",
              notes: `Consumed inside virtual garage service ticket for client ${builtTicket.customerName}`
            });

            return {
              ...p,
              stockQuantity: nextQty,
              status: nextQty === 0 ? 'Out of Stock' : nextQty <= p.minStockAlert ? 'Low Stock' : p.status
            };
          }
          return p;
        });
      }
    });

    setDbState(prev => ({
      ...prev,
      products: nextProducts,
      movements: nextMovements
    }));

    setServiceTickets(prev => [builtTicket, ...prev]);
    
    // Clear states
    setNewTktCustomerName('');
    setNewTktVehicleModel('');
    setNewTktVehiclePlate('');
    setNewTktProblem('');
    setNewTktLabor(35);
    setNewTktParts([]);
    setShowNewTicketModal(false);
  };

  // Save changes automatically on change
  useEffect(() => {
    savePlatformState(dbState);
  }, [dbState]);

  const activePermissions = ROLE_PERMISSIONS_MATRIX[actingRole];

  // Callback utilities
  const handleCompleteSale = (invoice: SalesInvoice) => {
    // 1. Substract product quantities in catalog
    const updatedProducts = dbState.products.map(p => {
      const soldItem = invoice.items.find(i => i.productId === p.id);
      if (soldItem) {
        const nextQty = Math.max(0, p.stockQuantity - soldItem.quantity);
        return {
          ...p,
          stockQuantity: nextQty,
          status: nextQty === 0 ? 'Out of Stock' : nextQty <= p.minStockAlert ? 'Low Stock' : p.status
        };
      }
      return p;
    });

    // 2. Generate stock movement entries
    const newMovements: StockMovement[] = invoice.items.map(item => ({
      id: `m-pos-${Date.now()}-${Math.floor(Math.random() * 100)}`,
      productId: item.productId,
      productName: item.name,
      sku: item.sku,
      date: new Date().toISOString(),
      staffName: activeStaffName,
      qtyBefore: dbState.products.find(p => p.id === item.productId)?.stockQuantity || 0,
      qtyChanged: -item.quantity,
      qtyAfter: Math.max(0, (dbState.products.find(p => p.id === item.productId)?.stockQuantity || 0) - item.quantity),
      type: 'POS Sale',
      reason: `Automated inventory deduction on Completed Invoice: ${invoice.invoiceNumber}`,
      referenceNo: invoice.invoiceNumber
    }));

    // 3. Update customer total spending if assigned
    const updatedCustomers = dbState.customers.map(c => {
      if (invoice.customerId && c.id === invoice.customerId) {
        return {
          ...c,
          purchaseHistoryCount: c.purchaseHistoryCount + 1,
          totalSpending: c.totalSpending + invoice.totalAmount
        };
      }
      return c;
    });

    setDbState(prev => ({
      ...prev,
      products: updatedProducts,
      invoices: [invoice, ...prev.invoices],
      movements: [...newMovements, ...prev.movements],
      customers: updatedCustomers
    }));
  };

  const handleAddProduct = (prod: PartProduct) => {
    setDbState(prev => {
      const nextMovements: StockMovement[] = [{
        id: `m-add-${Date.now()}`,
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku,
        date: new Date().toISOString(),
        staffName: activeStaffName,
        qtyBefore: 0,
        qtyChanged: prod.stockQuantity,
        qtyAfter: prod.stockQuantity,
        type: 'Stock In',
        reason: "Initial catalog entry stocking of new warehouse SKU elements",
        referenceNo: prod.partNumber
      }];

      return {
        ...prev,
        products: [prod, ...prev.products],
        movements: [...nextMovements, ...prev.movements]
      };
    });
  };

  const handleAdjustStock = (productId: string, quantityChanged: number, type: StockMovement['type'], reason: string, staffName: string) => {
    const prod = dbState.products.find(p => p.id === productId);
    if (!prod) return;

    const qtyBefore = prod.stockQuantity;
    const qtyAfter = Math.max(0, qtyBefore + quantityChanged);

    const updatedProducts = dbState.products.map(p => {
      if (p.id === productId) {
        const nextStatus = qtyAfter === 0 ? 'Out of Stock' : qtyAfter <= p.minStockAlert ? 'Low Stock' : 'Active';
        return {
          ...p,
          stockQuantity: qtyAfter,
          status: nextStatus
        };
      }
      return p;
    });

    const newMovementLog: StockMovement = {
      id: `m-adj-${Date.now()}`,
      productId,
      productName: prod.name,
      sku: prod.sku,
      date: new Date().toISOString(),
      staffName,
      qtyBefore,
      qtyChanged: quantityChanged,
      qtyAfter,
      type,
      reason,
      referenceNo: `ADJ-${Math.floor(100+Math.random()*900)}`
    };

    setDbState(prev => ({
      ...prev,
      products: updatedProducts,
      movements: [newMovementLog, ...prev.movements]
    }));
  };

  const handleAddMarketplacePost = (post: PartMarketplacePost) => {
    setDbState(prev => ({
      ...prev,
      marketplacePosts: [post, ...prev.marketplacePosts]
    }));
  };

  const handleModifyPostStatus = (postId: string, status: PartMarketplacePost['status']) => {
    const updated = dbState.marketplacePosts.map(p => 
      p.id === postId ? { ...p, status } : p
    );
    setDbState(prev => ({ ...prev, marketplacePosts: updated }));
  };

  const handleBoostPost = (postId: string, duration: '3 days' | '7 days' | '15 days' | '30 days') => {
    const updated = dbState.marketplacePosts.map(p => {
      if (p.id === postId) {
        const expDate = new Date();
        const days = duration === '3 days' ? 3 : duration === '7 days' ? 7 : duration === '15 days' ? 15 : 30;
        expDate.setDate(expDate.getDate() + days);
        return {
          ...p,
          isBoosted: true,
          boostDuration: duration,
          boostExpiry: expDate.toISOString(),
          views: p.views + 84, // Immediate visual impressions boost simulation
          clicks: p.clicks + 14
        };
      }
      return p;
    });
    setDbState(prev => ({ ...prev, marketplacePosts: updated }));
  };

  const handleAddCustomer = (cust: CustomerProfile) => {
    setDbState(prev => ({
      ...prev,
      customers: [cust, ...prev.customers]
    }));
  };

  const handleAddGarage = (gar: GarageBuyerProfile) => {
    setDbState(prev => ({
      ...prev,
      garages: [gar, ...prev.garages]
    }));
  };

  const handleCreatePurchaseOrder = (po: PurchaseOrder) => {
    setDbState(prev => ({
      ...prev,
      purchaseOrders: [po, ...prev.purchaseOrders]
    }));
    alert(`Purchase Order ${po.poNumber} saved & sent successfully.`);
  };

  const handleAddWarrantyClaim = (claim: ReturnWarrantyRecord) => {
    setDbState(prev => ({
      ...prev,
      warranties: [claim, ...prev.warranties]
    }));
  };

  // State builders for forms inside sub-categories of orchestrator
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custVehicles, setCustVehicles] = useState('');
  const [showCustModal, setShowCustModal] = useState(false);

  const [garageName, setGarageName] = useState('');
  const [garageContact, setGarageContact] = useState('');
  const [garagePhone, setGaragePhone] = useState('');
  const [garageLocation, setGarageLocation] = useState('');
  const [garageTier, setGarageTier] = useState<GarageBuyerProfile['wholesalePricingTier']>('Tier B (Standard -10%)');
  const [showGarageModal, setShowGarageModal] = useState(false);

  const [poSupplierId, setPoSupplierId] = useState('');
  const [poSelectedProdId, setPoSelectedProdId] = useState('');
  const [poQty, setPoQty] = useState('50');
  const [showPoModal, setShowPoModal] = useState(false);

  const [claimInvNum, setClaimInvNum] = useState('');
  const [claimPhone, setClaimPhone] = useState('');
  const [claimProdName, setClaimProdName] = useState('');
  const [claimReason, setClaimReason] = useState('');
  const [showClaimModal, setShowClaimModal] = useState(false);

  // Checks permission rendering
  const renderAccessDenied = (requiredField: string) => {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center max-w-lg mx-auto my-12 text-white font-sans space-y-4">
        <ShieldAlert className="h-14 w-14 text-red-500 mx-auto fill-red-500/10" />
        <h3 className="text-base font-bold text-slate-100 font-mono">Unauthorised User Permission Restriction</h3>
        <p className="text-slate-400 text-xs">
          Your current acting staff profile role (<b>{actingRole}</b>) does not possess the permissions necessary to modify or view this module (Requires: <b>{requiredField}</b>).
        </p>
        
        <div className="bg-slate-950 p-4 border border-slate-850 rounded-lg text-left text-[11px] space-y-1.5 text-slate-350">
          <span className="font-bold text-slate-200 block uppercase font-mono mb-2">Simulated Staff Access Levels:</span>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <div>Sales POS Access: <b>{activePermissions.salesPOS ? "✅ YES" : "❌ NO"}</b></div>
            <div>Inventory Edit: <b>{activePermissions.inventoryEdit ? "✅ YES" : "❌ NO"}</b></div>
            <div>Stock Adjustment: <b>{activePermissions.stockAdjust ? "✅ YES" : "❌ NO"}</b></div>
            <div>Marketplace Post: <b>{activePermissions.marketplacePost ? "✅ YES" : "❌ NO"}</b></div>
            <div>Financial reports: <b>{activePermissions.reportsView ? "✅ YES" : "❌ NO"}</b></div>
            <div>Staff configurations: <b>{activePermissions.staffManagement ? "✅ YES" : "❌ NO"}</b></div>
          </div>
        </div>

        <p className="text-[11px] text-indigo-400 italic font-medium font-sans">
          💡 Tip: You can switch your mock staff role instantly in the <b>"Staff & Permissions"</b> tab!
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans flex flex-col" id="master_shop_dashboard_container">
      
      {/* 1. TOP HEADER BRAND RIBBON */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-3.5 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-emerald-500 rounded-lg flex items-center justify-center text-slate-950 font-bold text-lg font-mono tracking-wider shadow-inner">
            MC
          </div>
          <div>
            <h1 className="text-white text-base font-bold tracking-tight">MyCar Care KH – Spare Parts Admin</h1>
            <p className="text-[10px] text-slate-450 uppercase tracking-widest font-mono">Professional Business Operating Management System</p>
          </div>
        </div>

        {/* Action switchers summaries */}
        <div className="flex items-center gap-4">
          {isMultiService && (
            <div className="flex bg-slate-950 p-1 border border-slate-800 rounded-lg text-xs font-mono">
              <button
                type="button"
                onClick={() => setCurrentMode('unified')}
                className={`px-2.5 py-1 rounded transition text-[10px] uppercase font-black ${currentMode === 'unified' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
              >
                Unified View
              </button>
              <button
                type="button"
                onClick={() => setCurrentMode('spare_parts_shop')}
                className={`px-2.5 py-1 rounded transition text-[10px] uppercase font-black ${currentMode === 'spare_parts_shop' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
              >
                Parts Shop
              </button>
              <button
                type="button"
                onClick={() => setCurrentMode('garage_repair')}
                className={`px-2.5 py-1 rounded transition text-[10px] uppercase font-black ${currentMode === 'garage_repair' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
              >
                Garage Bay
              </button>
            </div>
          )}

          <div className="hidden md:flex flex-col items-end text-xs">
            <span className="text-slate-400">Acting Staff: <b className="text-white">{activeStaffName}</b></span>
            <span className="text-[10px] text-emerald-400 font-mono tracking-wide px-1.5 py-0.5 rounded bg-emerald-950/60 uppercase font-semibold mt-0.5">
              👑 {actingRole}
            </span>
          </div>

          <div className="bg-slate-950 rounded-lg px-2.5 py-1 border border-slate-850 text-xs flex items-center gap-2">
            <span className="text-emerald-500 animate-pulse text-base">●</span>
            <span className="text-[10px] font-mono text-slate-400 tracking-wider">STORE: PHNOM PENH SEN SOK (LIVE)</span>
          </div>
        </div>
      </header>

      {/* 2. MAIN CORE LAYOUT SYSTEM */}
      <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
        
        {/* SIDE NAV MENU (SCARY DETAILED) */}
        <aside className="w-full md:w-60 bg-slate-900 border-r border-slate-800 p-4 space-y-6 flex-shrink-0">
          <div className="space-y-1.5">
            <span className="text-[10px] text-slate-450 uppercase tracking-widest font-mono font-bold block px-2.5">Store Directory</span>
            
            <nav className="space-y-1 text-xs">
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition ${activeTab === 'dashboard' ? 'bg-indigo-600 font-bold text-white shadow-md' : 'text-slate-400 hover:bg-slate-850 hover:text-white'}`}
              >
                <Layers className="h-4 w-4" /> Overview Dashboard
              </button>

              {isModuleActive("Service Ticket Module") && (
                <button 
                  onClick={() => setActiveTab('service_tickets')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition ${activeTab === 'service_tickets' ? 'bg-indigo-600 font-bold text-white shadow-md' : 'text-slate-400 hover:bg-slate-850 hover:text-white'}`}
                >
                  <div className="flex items-center gap-2.5 text-sky-400 font-bold font-sans">
                    <Wrench className="h-4 w-4 text-sky-400" /> Service Bay Tickets
                  </div>
                  <span className="bg-sky-950 text-sky-450 border border-sky-850 text-[8px] font-mono font-black uppercase tracking-wider px-1.5 py-0.5 rounded">Bay</span>
                </button>
              )}

              {isModuleActive("Mini POS Module") && (
                <button 
                  onClick={() => setActiveTab('pos')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition ${activeTab === 'pos' ? 'bg-indigo-600 font-bold text-white shadow-md' : 'text-slate-400 hover:bg-slate-850 hover:text-white'}`}
                >
                  <div className="flex items-center gap-2.5">
                    <Coins className="h-4 w-4 text-emerald-400" /> Mini POS Billing
                  </div>
                  <span className="bg-emerald-950 text-emerald-400 text-[9px] font-mono px-1.5 py-0.5 rounded">FAST</span>
                </button>
              )}

              {isModuleActive("Inventory / Stock Control Module") && (
                <>
                  <button 
                    onClick={() => setActiveTab('products')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition ${activeTab === 'products' ? 'bg-indigo-600 font-bold text-white shadow-md' : 'text-slate-400 hover:bg-slate-850 hover:text-white'}`}
                  >
                    <Wrench className="h-4 w-4" /> Products & Inventory
                  </button>

                  <button 
                    onClick={() => setActiveTab('stock')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition ${activeTab === 'stock' ? 'bg-indigo-600 font-bold text-white shadow-md' : 'text-slate-400 hover:bg-slate-850 hover:text-white'}`}
                  >
                    <ArrowRightLeft className="h-4 w-4" /> Stock movement Logs
                  </button>
                </>
              )}

              {isModuleActive("Marketplace Seller Module") && (
                <button 
                  onClick={() => setActiveTab('marketplace_posts')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition ${activeTab === 'marketplace_posts' ? 'bg-indigo-600 font-bold text-white shadow-md' : 'text-slate-400 hover:bg-slate-850 hover:text-white'}`}
                >
                  <ShoppingBag className="h-4 w-4 text-indigo-300" /> Marketplace Posting
                </button>
              )}

              <button 
                onClick={() => setActiveTab('ai_advisor')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition ${activeTab === 'ai_advisor' ? 'bg-indigo-600 font-bold text-white shadow-md' : 'text-slate-400 hover:bg-slate-850 hover:text-white'}`}
              >
                <div className="flex items-center gap-2.5 text-amber-300 font-sans">
                  <Bot className="h-4 w-4 text-amber-300" /> Gemini AI Spares Room
                </div>
                <span className="bg-indigo-950 text-indigo-400 text-[8px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded animate-pulse font-sans">Core</span>
              </button>
            </nav>
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] text-slate-450 uppercase tracking-widest font-mono font-bold block px-2.5">Stakeholder modules</span>
            
            <nav className="space-y-1 text-xs">
              <button 
                onClick={() => setActiveTab('customers')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition ${activeTab === 'customers' ? 'bg-indigo-600 font-bold text-white' : 'text-slate-400 hover:bg-slate-850 hover:text-white'}`}
              >
                <Users className="h-4 w-4" /> Customer & Garages
              </button>

              <button 
                onClick={() => setActiveTab('suppliers')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition ${activeTab === 'suppliers' ? 'bg-indigo-600 font-bold text-white' : 'text-slate-400 hover:bg-slate-850 hover:text-white'}`}
              >
                <Truck className="h-4 w-4" /> Supplier Sourcing POs
              </button>

              <button 
                onClick={() => setActiveTab('returns')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition ${activeTab === 'returns' ? 'bg-indigo-600 font-bold text-white' : 'text-slate-400 hover:bg-slate-850 hover:text-white'}`}
              >
                <RotateCcw className="h-4 w-4" /> Returns & Warranty
              </button>

              <button 
                onClick={() => setActiveTab('promotions')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition ${activeTab === 'promotions' ? 'bg-indigo-600 font-bold text-white' : 'text-slate-400 hover:bg-slate-850 hover:text-white'}`}
              >
                <Percent className="h-4 w-4 text-amber-400" /> Dynamic Campaigns
              </button>
            </nav>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-850">
            <span className="text-[10px] text-slate-450 uppercase tracking-widest font-mono font-bold block px-2.5">Corporate Control</span>
            
            <nav className="space-y-1 text-xs">
              <button 
                onClick={() => setActiveTab('reports')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition ${activeTab === 'reports' ? 'bg-indigo-600 font-bold text-white' : 'text-slate-400 hover:bg-slate-850 hover:text-white'}`}
              >
                <TrendingUp className="h-4 w-4" /> Financials & Reports
              </button>

              <button 
                onClick={() => setActiveTab('staff')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition ${activeTab === 'staff' ? 'bg-indigo-600 font-bold text-white' : 'text-slate-400 hover:bg-slate-850 hover:text-white'}`}
              >
                <ShieldCheck className="h-4 w-4" /> Role Permissions Sim
              </button>

              <button 
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition ${activeTab === 'settings' ? 'bg-indigo-600 font-bold text-white' : 'text-slate-400 hover:bg-slate-850 hover:text-white'}`}
              >
                <Settings className="h-4 w-4" /> Store Settings
              </button>
            </nav>
          </div>
        </aside>

        {/* 3. CENTER CONTENT WORKSPACE */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-950 space-y-4">
          
          {/* TAB 1: OVERVIEW DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-5 animate-fadeIn">
              
              {/* Dynamic Notification stock alert systems */}
              {dbState.products.some(p => p.stockQuantity <= p.minStockAlert) && (
                <div className="bg-red-950/80 border border-red-900/50 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                    <div>
                      <span className="text-white font-semibold text-xs font-sans">Automatic Sourcing Danger Alert</span>
                      <p className="text-[11px] text-slate-400 leading-snug">Multiple catalogs have fallen past their designated minimum stock thresholds!</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveTab('products')}
                    className="text-[11px] bg-red-900 text-white font-medium py-1 px-3 rounded-lg hover:bg-red-800 transition"
                  >
                    Manage Reserves
                  </button>
                </div>
              )}

              {/* Banner intro */}
              <div className="p-4 bg-indigo-950/40 border border-indigo-900/50 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-white">Welcome back to MyCar Care KH dashboard portal</h3>
                  <p className="text-[11.5px] text-slate-400 leading-snug">Operating with instant ABA, KHQR billing links and robust physical stock logs.</p>
                </div>
                
                <button
                  onClick={() => setActiveTab('pos')}
                  className="px-4.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-xs font-semibold shrink-0"
                >
                  ➕ Open POS Screen
                </button>
              </div>

              {/* Stats metric grids */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-1">
                  <span className="text-[10px] uppercase font-mono text-slate-450 font-bold block">Current Day Transactions</span>
                  <p className="text-xl font-bold font-mono text-white">{dbState.invoices.length} Bills Issued</p>
                  <span className="text-[9.5px] text-slate-500 block">Revenue volume: ${dbState.invoices.reduce((a,b)=>a+b.totalAmount,0).toFixed(2)}</span>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-1">
                  <span className="text-[10px] uppercase font-mono text-slate-450 font-bold block">Low Stock Alerts</span>
                  <p className="text-xl font-bold font-mono text-amber-400">
                    {dbState.products.filter(p => p.stockQuantity <= p.minStockAlert && p.stockQuantity > 0).length} SKUs Alert
                  </p>
                  <span className="text-[9.5px] text-slate-500 block">Out of stock: {dbState.products.filter(p=>p.stockQuantity ===0).length} items</span>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-1">
                  <span className="text-[10px] uppercase font-mono text-slate-450 font-bold block">Active Classified Ads</span>
                  <p className="text-xl font-bold font-mono text-indigo-400">
                    {dbState.marketplacePosts.filter(m => m.status === 'Active').length} Live
                  </p>
                  <span className="text-[9.5px] text-slate-500 block">Boosted posts: {dbState.marketplacePosts.filter(m=>m.isBoosted).length} promoted</span>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-1">
                  <span className="text-[10px] uppercase font-mono text-slate-450 font-bold block">Customer Spend ledger</span>
                  <p className="text-xl font-bold font-mono text-emerald-400">${dbState.customers.reduce((a,b)=>a+b.totalSpending, 0).toFixed(2)}</p>
                  <span className="text-[9.5px] text-slate-500 block">Assigned garages: {dbState.garages.length} workshops</span>
                </div>
              </div>

              {/* Main divided screens */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 1. Low stock catalog alert list */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4 text-amber-500" /> Sourcing reserve alerts (Requires attention)
                    </h3>
                    <span className="text-[10px] text-slate-500">Threshold filter</span>
                  </div>

                  <div className="space-y-2 h-64 overflow-y-auto pr-1">
                    {dbState.products.filter(p => p.stockQuantity <= p.minStockAlert).map((prod) => (
                      <div key={prod.id} className="flex justify-between items-center bg-slate-950 p-2.5 rounded-lg border border-slate-850">
                        <div>
                          <b className="text-slate-200 block text-xs">{prod.name}</b>
                          <span className="text-[10px] text-slate-500 font-mono">SKU: {prod.sku} • Supplier Code: {prod.supplierId}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono text-red-400 font-bold block">Qty: {prod.stockQuantity}</span>
                          <span className="text-[9px] text-slate-500">Min safety: {prod.minStockAlert}</span>
                        </div>
                      </div>
                    ))}
                    {dbState.products.filter(p => p.stockQuantity <= p.minStockAlert).length === 0 && (
                      <span className="text-slate-500 italic block py-4 text-center">No catalog products are below their safety reserve constraints.</span>
                    )}
                  </div>
                </div>

                {/* 2. Recent sales list */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono flex items-center gap-1">
                      <Coins className="h-4 w-4 text-emerald-400" /> Recent completed invoices
                    </h3>
                    <button onClick={() => setActiveTab('reports')} className="text-indigo-400 hover:text-indigo-300 text-[10px]">See all accounts</button>
                  </div>

                  <div className="space-y-1.5 h-64 overflow-y-auto pr-1">
                    {dbState.invoices.map((inv) => (
                      <div key={inv.id} className="p-2.5 bg-slate-950 rounded-lg border border-slate-850 flex justify-between items-start text-xs font-sans">
                        <div>
                          <span className="font-bold text-emerald-400 font-mono text-[11px] block">{inv.invoiceNumber}</span>
                          <span className="text-slate-400 text-[10.5px] mt-0.5 block">{inv.customerName} ({inv.customerPhone})</span>
                          <span className="text-[9.5px] text-slate-500 font-mono">{new Date(inv.date).toLocaleString()}</span>
                        </div>
                        <div className="text-right">
                          <b className="text-white font-mono text-sm block">${inv.totalAmount.toFixed(2)}</b>
                          <span className="text-[9.5px] text-slate-500 font-mono">{inv.paymentMethod} • Ref: {inv.items.reduce((a,b)=>a+b.quantity,0)} prts</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: MINI POS BILLING */}
          {activeTab === 'pos' && (
            activePermissions.salesPOS ? (
              <PartsPOS 
                products={dbState.products}
                customers={dbState.customers}
                onCompleteSale={handleCompleteSale}
                staffName={activeStaffName}
                serviceTickets={serviceTickets}
                onSettleTicket={handleSettleTicket}
              />
            ) : renderAccessDenied("salesPOS")
          )}

          {/* TAB 3: PRODUCTS & CATALOG */}
          {activeTab === 'products' && (
            <PartsInventory 
              products={dbState.products}
              suppliers={dbState.suppliers}
              onAddProduct={handleAddProduct}
              canEdit={activePermissions.inventoryEdit}
            />
          )}

          {/* TAB 4: STOCK MOVEMENTS LEDGER */}
          {activeTab === 'stock' && (
            <PartsStockControl 
              products={dbState.products}
              movements={dbState.movements}
              onAdjustStock={handleAdjustStock}
              staffName={activeStaffName}
              canAdjust={activePermissions.stockAdjust}
            />
          )}

          {/* TAB 5: MARKETPLACE ADVERTISEMENT GENERATOR */}
          {activeTab === 'marketplace_posts' && (
            activePermissions.marketplacePost ? (
              <PartsMarketplace 
                marketplacePosts={dbState.marketplacePosts}
                products={dbState.products}
                onAddPost={handleAddMarketplacePost}
                onModifyPostStatus={handleModifyPostStatus}
                onBoostPost={handleBoostPost}
                canManage={activePermissions.marketplacePost}
              />
            ) : renderAccessDenied("marketplacePost")
          )}

          {/* TAB 6: GEMINI AI ADVISORY OFFICE */}
          {activeTab === 'ai_advisor' && (
            <PartsAiAssistant 
              products={dbState.products}
              onAddFromCatalogSearch={(m) => {
                // Allows direct adding to POS cart via AI suggestions
                alert(`Direct Match: "${m.name}" copied! Head to the "Mini POS" tab to finalize.`);
                setActiveTab('pos');
              }}
            />
          )}

          {/* TAB 7: CUSTOMER REGISTRY & GARAGE BUYERS */}
          {activeTab === 'customers' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex justify-between items-center p-4 bg-slate-900 border border-slate-800 rounded-xl">
                <div>
                  <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                    <Users className="h-4.5 w-4.5 text-indigo-400" />
                    Customer Database Directory
                  </h3>
                  <p className="text-[11px] text-slate-400">Track and manage vehicle repair garage buying patterns and consumer spending.</p>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => setShowCustModal(true)}
                    className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 rounded text-xs font-semibold text-white"
                  >
                    Register Customer
                  </button>
                  <button 
                    onClick={() => setShowGarageModal(true)}
                    className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 rounded text-xs font-semibold text-white"
                  >
                    Register Garage Workshop
                  </button>
                </div>
              </div>

              {/* Divided grid column */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Regular Customers List */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-indigo-400 border-b border-indigo-950 pb-1.5">
                    Consumer retail accounts ({dbState.customers.length})
                  </h4>
                  <div className="space-y-2 h-96 overflow-y-auto pr-1">
                    {dbState.customers.map(c => (
                      <div key={c.id} className="p-3 bg-slate-950 rounded-lg border border-slate-850 space-y-1 text-xs">
                        <div className="flex justify-between font-medium">
                          <span className="text-white font-bold">{c.name}</span>
                          <span className="font-mono text-emerald-400">${c.totalSpending.toFixed(2)} Spent</span>
                        </div>
                        <span className="text-slate-400 block font-mono">Phone: {c.phone}</span>
                        {c.telegram && <span className="text-indigo-400 block font-mono text-[10px]">Telegram contact: {c.telegram}</span>}
                        {c.vehiclesOwned && c.vehiclesOwned.length > 0 && (
                          <div className="pt-1.5 space-y-0.5">
                            <span className="text-[10px] text-slate-500 uppercase font-mono block">Linked Vehicles:</span>
                            {c.vehiclesOwned.map(veh => (
                              <span key={veh} className="block text-[10.5px] text-slate-300 italic font-sans">{veh}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Garage Buyer List */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-amber-500 border-b border-amber-950 pb-1.5">
                    Affiliated Wholesale Repair Garages ({dbState.garages.length})
                  </h4>
                  <div className="space-y-2 h-96 overflow-y-auto pr-1">
                    {dbState.garages.map(g => (
                      <div key={g.id} className="p-3 bg-slate-950 rounded-lg border border-slate-850 space-y-1.5 text-xs">
                        <div className="flex justify-between items-start font-medium gap-2">
                          <div>
                            <span className="text-white font-bold text-sm block">{g.garageName}</span>
                            <span className="text-[10px] text-indigo-400 block uppercase font-mono font-bold">{g.wholesalePricingTier}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-amber-500 block font-mono">Credit Balance: ${g.creditBalance.toFixed(2)}</span>
                            <span className="text-[10px] text-slate-500 block">Orders count: {g.purchaseCount}</span>
                          </div>
                        </div>
                        <div className="text-slate-400 text-[10.5px] space-y-0.5">
                          <p>Contact Face: <b>{g.contactPerson}</b> ({g.phone})</p>
                          <p className="truncate">Sect loc: {g.location}</p>
                        </div>
                        {g.frequentPartsOrdered && (
                          <div className="flex flex-wrap gap-1 pt-1.5 border-t border-slate-900">
                            {g.frequentPartsOrdered.map(p => (
                              <span key={p} className="text-[10px] bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded font-sans">{p}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* CUSTOMER FORM DIALOG */}
              {showCustModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto">
                  <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-sm w-full p-6 text-white font-sans text-xs">
                    <h3 className="text-base font-semibold border-b border-slate-800 pb-3 font-mono text-indigo-400">
                      Register Customer Profile
                    </h3>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      if (!custName || !custPhone) return;
                      const newCust: CustomerProfile = {
                        id: `c-${Date.now()}`,
                        name: custName,
                        phone: custPhone,
                        vehiclesOwned: custVehicles ? [custVehicles] : [],
                        purchaseHistoryCount: 0,
                        totalSpending: 0
                      };
                      handleAddCustomer(newCust);
                      setShowCustModal(false);
                      setCustName('');
                      setCustPhone('');
                      setCustVehicles('');
                    }} className="space-y-4 pt-4">
                      <div>
                        <label className="block mb-1 text-slate-400">FullName *</label>
                        <input type="text" value={custName} onChange={e=>setCustName(e.target.value)} required className="w-full bg-slate-950 border border-slate-850 rounded p-2 text-white" />
                      </div>
                      <div>
                        <label className="block mb-1 text-slate-400">Phone *</label>
                        <input type="text" value={custPhone} onChange={e=>setCustPhone(e.target.value)} required className="w-full bg-slate-950 border border-slate-850 rounded p-2 text-white" />
                      </div>
                      <div>
                        <label className="block mb-1 text-slate-400">Owned Vehicle Note</label>
                        <input type="text" placeholder="e.g. Toyota Prius 2010" value={custVehicles} onChange={e=>setCustVehicles(e.target.value)} className="w-full bg-slate-950 border border-slate-850 rounded p-2 text-slate-200" />
                      </div>
                      <div className="flex gap-2 justify-end pt-2 border-t border-slate-850">
                        <button type="button" onClick={()=>setShowCustModal(false)} className="px-3 py-1.5 bg-slate-850 text-slate-400 rounded">Cancel</button>
                        <button type="submit" className="px-4 py-1.5 bg-indigo-500 hover:bg-indigo-400 text-white rounded">Save Profile</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* GARAGE FORM DIALOG */}
              {showGarageModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto">
                  <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-sm w-full p-6 text-white font-sans text-xs">
                    <h3 className="text-base font-semibold border-b border-slate-800 pb-3 font-mono text-amber-500">
                      Register Wholesale Garage Partner
                    </h3>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      if(!garageName || !garagePhone) return;
                      const newGar: GarageBuyerProfile = {
                        id: `g-${Date.now()}`,
                        garageName,
                        contactPerson: garageContact,
                        phone: garagePhone,
                        location: garageLocation,
                        purchaseCount: 0,
                        creditBalance: 0,
                        wholesalePricingTier: garageTier,
                        frequentPartsOrdered: ["Oil Filters", "Brake Rotor Discs"],
                        monthlyPurchaseVolume: 0
                      };
                      handleAddGarage(newGar);
                      setShowGarageModal(false);
                      setGarageName('');
                      setGaragePhone('');
                      setGarageContact('');
                      setGarageLocation('');
                    }} className="space-y-4 pt-4">
                      <div>
                        <label className="block mb-1 text-slate-400">Garage Center Name *</label>
                        <input type="text" value={garageName} onChange={e=>setGarageName(e.target.value)} required className="w-full bg-slate-950 border border-slate-850 rounded p-2 text-white" />
                      </div>
                      <div>
                        <label className="block mb-1 text-slate-400">Contact person *</label>
                        <input type="text" value={garageContact} onChange={e=>setGarageContact(e.target.value)} required className="w-full bg-slate-950 border border-slate-850 rounded p-2 text-white" />
                      </div>
                      <div>
                        <label className="block mb-1 text-slate-400">Phone *</label>
                        <input type="text" value={garagePhone} onChange={e=>setGaragePhone(e.target.value)} required className="w-full bg-slate-950 border border-slate-850 rounded p-2 text-white" />
                      </div>
                      <div>
                        <label className="block mb-1 text-slate-400">Location Area</label>
                        <input type="text" value={garageLocation} onChange={e=>setGarageLocation(e.target.value)} className="w-full bg-slate-950 border border-slate-850 rounded p-2 text-slate-200" />
                      </div>
                      <div>
                        <label className="block mb-1 text-slate-400">Contracting wholesale tier</label>
                        <select value={garageTier} onChange={e=>setGarageTier(e.target.value as any)} className="w-full bg-slate-950 border border-slate-850 rounded p-2 text-white">
                          <option value="Tier A (VIP -20%)">Tier A (VIP -20%)</option>
                          <option value="Tier B (Standard -10%)">Tier B (Standard -10%)</option>
                          <option value="Tier C (Retail)">Tier C (Retail)</option>
                        </select>
                      </div>
                      <div className="flex gap-2 justify-end pt-2 border-t border-slate-850">
                        <button type="button" onClick={()=>setShowGarageModal(false)} className="px-3 py-1.5 bg-slate-850 text-slate-400 rounded">Cancel</button>
                        <button type="submit" className="px-4 py-1.5 bg-indigo-500 hover:bg-indigo-400 text-white rounded">Save Garage</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 8: SUPPLIERS AND PURCHASE ORDERS SOURCING */}
          {activeTab === 'suppliers' && (
            <div className="space-y-4 animate-fadeIn text-xs">
              <div className="flex justify-between items-center p-4 bg-slate-900 border border-slate-800 rounded-xl">
                <div>
                  <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                    <Truck className="h-4.5 w-4.5 text-emerald-400" />
                    Supplier Procurement Sourcing Office
                  </h3>
                  <p className="text-[11px] text-slate-400">Manage overseas OEM contracts and log Purchase Orders sent to replenish stocks.</p>
                </div>
                
                {activePermissions.purchaseOrders && (
                  <button 
                    onClick={() => setShowPoModal(true)}
                    className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 rounded text-xs font-semibold text-white"
                  >
                    Draft Purchase Order (PO)
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                
                {/* Outbound PO History logs */}
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-indigo-400 border-b border-indigo-950 pb-1.5">
                    Purchase Orders (PO) sent status ({dbState.purchaseOrders.length})
                  </h4>
                  <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                    {dbState.purchaseOrders.map((po) => (
                      <div key={po.id} className="p-3 bg-slate-950 rounded-lg border border-slate-850 space-y-2 text-xs">
                        <div className="flex justify-between items-center bg-slate-900 p-2 rounded">
                          <b className="text-emerald-400 font-mono text-[11px]">{po.poNumber}</b>
                          <span className={`px-2 py-0.5 rounded text-[9.5px] font-bold uppercase font-mono tracking-wider ${
                            po.status === 'Fully Received' ? 'bg-emerald-950 text-emerald-400' :
                            po.status === 'Sent to Supplier' ? 'bg-indigo-950 text-indigo-404' : 'bg-slate-900 text-slate-400'
                          }`}>
                            {po.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 py-0.5 text-slate-350 font-sans">
                          <div>Supplier: <b>{po.supplierName}</b></div>
                          <div>PO Total: <b className="text-white">${po.totalCost.toFixed(2)}</b></div>
                          <div>Expected: <b>{new Date(po.expectedDeliveryDate).toLocaleDateString()}</b></div>
                        </div>
                        <div className="space-y-1 bg-slate-900/40 p-1.5 rounded">
                          {po.items.map((it, iIdx) => (
                            <div key={iIdx} className="flex justify-between font-mono text-[10.5px]">
                              <span className="text-slate-400">{it.productName} ({it.sku})</span>
                              <span>{it.quantity} units @ ${it.costPrice.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                        {activePermissions.stockAdjust && po.status !== 'Fully Received' && (
                          <div className="flex gap-2 pt-2 border-t border-slate-900">
                            <button
                              onClick={() => {
                                // Simulate receiving PO stock elements
                                const updatedPOs = dbState.purchaseOrders.map(p => {
                                  if (p.id === po.id) return { ...p, status: 'Fully Received' as const };
                                  return p;
                                });
                                // Add actual quantities to catalog products
                                const updatedProducts = dbState.products.map(p => {
                                  const poItem = po.items.find(it => it.productId === p.id);
                                  if (poItem) {
                                    const nextQ = p.stockQuantity + poItem.quantity;
                                    return { ...p, stockQuantity: nextQ, status: 'Active' as const };
                                  }
                                  return p;
                                });
                                setDbState(prev => ({ ...prev, purchaseOrders: updatedPOs, products: updatedProducts }));
                                alert(`Succesful Inflow: Received po elements into inventory records!`);
                              }}
                              className="py-1 px-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded text-[10px] font-bold flex items-center gap-1"
                            >
                              Confirm delivery stock received
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Suppliers directory */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-amber-500 border-b border-amber-950 pb-1.5">
                    OEM Sourcing suppliers ({dbState.suppliers.length})
                  </h4>
                  <div className="space-y-2 h-[420px] overflow-y-auto pr-1">
                    {dbState.suppliers.map((s) => (
                      <div key={s.id} className="p-3 bg-slate-950 rounded-lg border border-slate-850 space-y-1">
                        <b className="text-white block text-sm">{s.name}</b>
                        <b className="text-slate-400 text-[10.5px] block font-sans">Contact Face: {s.contactPerson}</b>
                        <b className="text-slate-500 block font-mono">Tel: {s.phone}</b>
                        <p className="text-slate-400 italic text-[10px] truncate">Categories: {s.productCategories.join(', ')}</p>
                        <div className="flex justify-between text-[11px] font-mono pt-1 pb-0.5 text-slate-500">
                          <span>Lead time: {s.deliveryLeadTimeDays} d</span>
                          <span className={`text-[9.5px] font-bold uppercase ${s.paymentStatus === 'Cleared' ? 'text-emerald-400' : 'text-red-400'}`}>{s.paymentStatus}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* PO FORM DIALOG */}
              {showPoModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto">
                  <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-sm w-full p-6 text-white font-sans text-xs">
                    <h3 className="text-base font-semibold border-b border-slate-800 pb-3 font-mono text-indigo-400">
                      Draft Sourcing Purchase Order
                    </h3>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      if(!poSupplierId || !poSelectedProdId) return;
                      const supp = dbState.suppliers.find(s=>s.id === poSupplierId);
                      const prod = dbState.products.find(p=>p.id === poSelectedProdId);
                      if(!supp || !prod) return;

                      const nextQty = parseInt(poQty) || 50;
                      const nextPoNumber = `PO-MC-${Math.floor(100+Math.random()*900)}`;

                      const newPO: PurchaseOrder = {
                        id: `po-${Date.now()}`,
                        poNumber: nextPoNumber,
                        supplierId: poSupplierId,
                        supplierName: supp.name,
                        date: new Date().toISOString(),
                        expectedDeliveryDate: new Date(Date.now() + 5*24*60*60*1000).toISOString(),
                        items: [{
                          productId: prod.id,
                          productName: prod.name,
                          sku: prod.sku,
                          quantity: nextQty,
                          costPrice: prod.costPrice
                        }],
                        totalCost: prod.costPrice * nextQty,
                        paymentTerm: "Net 30",
                        status: "Sent to Supplier"
                      };
                      handleCreatePurchaseOrder(newPO);
                      setShowPoModal(false);
                    }} className="space-y-4 pt-4">
                      <div>
                        <label className="block mb-1 text-slate-400 font-sans">Target Supplier *</label>
                        <select value={poSupplierId} onChange={e=>setPoSupplierId(e.target.value)} required className="w-full bg-slate-950 border border-slate-850 rounded p-2 text-white">
                          <option value="">-- Choose Supplier --</option>
                          {dbState.suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block mb-1 text-slate-400">Part Catalog to order *</label>
                        <select value={poSelectedProdId} onChange={e=>setPoSelectedProdId(e.target.value)} required className="w-full bg-slate-950 border border-slate-850 rounded p-2 text-white">
                          <option value="">-- Choose Spare --</option>
                          {dbState.products.map(p => <option key={p.id} value={p.id}>{p.sku} | {p.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block mb-1 text-slate-400">Order Quantity volume *</label>
                        <input type="number" value={poQty} onChange={e=>setPoQty(e.target.value)} required className="w-full bg-slate-950 border border-slate-850 rounded p-2 text-white font-mono" />
                      </div>
                      <div className="flex gap-2 justify-end pt-2 border-t border-slate-850">
                        <button type="button" onClick={()=>setShowPoModal(false)} className="px-3 py-1.5 bg-slate-850 text-slate-400 rounded">Cancel</button>
                        <button type="submit" className="px-4 py-1.5 bg-indigo-505 hover:bg-indigo-400 text-white rounded">Submit Outbound PO</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 9: RETURNS AND WARRANTY CLAIMS */}
          {activeTab === 'returns' && (
            <div className="space-y-4 animate-fadeIn text-xs">
              <div className="flex justify-between items-center p-4 bg-slate-900 border border-slate-800 rounded-xl">
                <div>
                  <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                    <RotateCcw className="h-4.5 w-4.5 text-amber-500" />
                    Return Claims & Warranty verification Center
                  </h3>
                  <p className="text-[11px] text-slate-400">Look up parts serial listings on completed bills, and log active refund approvals.</p>
                </div>
                
                {activePermissions.refundsApproval && (
                  <button 
                    onClick={() => setShowClaimModal(true)}
                    className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 rounded text-xs font-semibold text-white"
                  >
                    Post Warranty/Return Claim
                  </button>
                )}
              </div>

              {/* Warranty claim histories list */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-indigo-400 border-b border-indigo-950 pb-1.5 mb-2.5">
                  Archived Warranty Claim and Return files ({dbState.warranties.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {dbState.warranties.map((w) => (
                    <div key={w.id} className="p-3 bg-slate-950 border border-slate-850 rounded-lg space-y-1.5">
                      <div className="flex justify-between items-center bg-slate-900 p-2 rounded">
                        <span className="font-bold text-slate-200 block">{w.productName}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[8.5px] uppercase font-bold tracking-wider ${
                          w.status === 'Approved' ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'
                        }`}>
                          {w.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-slate-400 font-mono">
                        <div>Billed Invoice: <b>{w.invoiceNumber}</b></div>
                        <div>Client phone: <b>{w.customerPhone}</b></div>
                        <div>SKU: <b>{w.sku}</b></div>
                        <div>Warranty: <b>{w.warrantyStatus}</b></div>
                      </div>
                      {w.reason && <p className="text-slate-400 italic text-[11px] leading-snug pt-1 border-t border-slate-900">Return Reason: "{w.reason}" (Refund: ${w.refundAmount || 0})</p>}
                    </div>
                  ))}
                </div>
              </div>

              {/* CLAIM MODAL DIALOG */}
              {showClaimModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto">
                  <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-sm w-full p-6 text-white font-sans text-xs">
                    <h3 className="text-base font-semibold border-b border-slate-800 pb-3 font-mono text-indigo-400">
                      Submit Return Claim
                    </h3>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      if(!claimInvNum || !claimPhone) return;
                      const newClaim: ReturnWarrantyRecord = {
                        id: `w-${Date.now()}`,
                        invoiceNumber: claimInvNum,
                        customerPhone: claimPhone,
                        productName: claimProdName || "Premium Brake Pads",
                        sku: "BRK-PR-2010",
                        warrantyStatus: "Active",
                        reason: claimReason,
                        staffName: activeStaffName,
                        status: "Approved"
                      };
                      handleAddWarrantyClaim(newClaim);
                      setShowClaimModal(false);
                    }} className="space-y-4 pt-4">
                      <div>
                        <label className="block mb-1 text-slate-450">Invoice Number *</label>
                        <input type="text" placeholder="e.g. INV-MC-001" value={claimInvNum} onChange={e=>setClaimInvNum(e.target.value)} required className="w-full bg-slate-950 border border-slate-850 rounded p-2 text-white" />
                      </div>
                      <div>
                        <label className="block mb-1 text-slate-450">Customer Phone *</label>
                        <input type="text" placeholder="012 345 678" value={claimPhone} onChange={e=>setClaimPhone(e.target.value)} required className="w-full bg-slate-950 border border-slate-850 rounded p-2 text-white" />
                      </div>
                      <div>
                        <label className="block mb-1 text-slate-450">Returned Product Name</label>
                        <input type="text" placeholder="e.g. Brake pads" value={claimProdName} onChange={e=>setClaimProdName(e.target.value)} className="w-full bg-slate-950 border border-slate-850 rounded p-2 text-slate-200" />
                      </div>
                      <div>
                        <label className="block mb-1 text-slate-450">Specific claim / Defection reasons *</label>
                        <textarea rows={2} value={claimReason} onChange={e=>setClaimReason(e.target.value)} required className="w-full bg-slate-950 border border-slate-850 rounded p-2 text-slate-200" />
                      </div>
                      <div className="flex gap-2 justify-end pt-2 border-t border-slate-850">
                        <button type="button" onClick={()=>setShowClaimModal(false)} className="px-3 py-1.5 bg-slate-850 text-slate-400 rounded">Cancel</button>
                        <button type="submit" className="px-4 py-1.5 bg-indigo-500 hover:bg-indigo-400 text-white rounded">Submit Approval Return</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 10: DYNAMIC CAMPAIGN CAMPAIGNS */}
          {activeTab === 'promotions' && (
            <div className="space-y-4 animate-fadeIn text-xs">
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5">
                <h3 className="text-sm font-semibold text-white flex items-center gap-1">
                  <Percent className="text-amber-400 h-4 w-4" /> Manage Active Promo Campaigns
                </h3>
                <p className="text-slate-405">Configure discount percentages linked to specific catalog categories to flush dead stock before seasonal shifts.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dbState.promotions.map((p) => (
                  <div key={p.id} className="p-4 bg-slate-900 border border-slate-850 rounded-xl space-y-3 relative overflow-hidden">
                    <span className="absolute -top-3 -right-3 h-10 w-24 bg-amber-500/10 text-amber-500 text-[10px] font-mono font-bold flex items-center justify-center rotate-12 uppercase border border-amber-500/20">
                      Promotion active
                    </span>
                    <div>
                      <span className="text-[10px] bg-slate-950 px-2 py-0.5 rounded text-slate-400 uppercase tracking-wide font-mono font-bold">{p.startDate} to {p.endDate}</span>
                      <h4 className="text-sm font-bold text-white mt-1.5">{p.title}</h4>
                      <p className="text-slate-400 leading-relaxed italic mt-1">{p.description}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-850 flex justify-between items-center text-xs font-mono font-bold text-emerald-400">
                      <span>APPLIED CATEGORIES: {p.applicableCategories.join(', ')}</span>
                      <span className="text-lg text-emerald-400">-{p.discountPercent}% OFF</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 11: REPORTS AND STATS FINANCIAL MODULE */}
          {activeTab === 'reports' && (
            activePermissions.reportsView ? (
              <PartsReports 
                invoices={dbState.invoices}
                products={dbState.products}
                marketplacePosts={dbState.marketplacePosts}
              />
            ) : renderAccessDenied("reportsView")
          )}

          {/* TAB 12: STAFF ROLE PERMISSIONS SIMULATOR */}
          {activeTab === 'staff' && (
            <div className="space-y-4 animate-fadeIn text-xs" id="role_permission_control_panel">
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="h-5 w-5 text-indigo-400" /> Custom Role-Based Access Control (Simulator Center)
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  Test and audit staff constraints directly! Select a simulated "Acting shop role" profile from the matrix dropdown below to simulate exact tab restrictions, POS barriers, or accountant query protections.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Active Simulated switcher drawer */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-indigo-400 border-b border-slate-850 pb-2">
                    Simulator controls
                  </h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold uppercase font-mono tracking-wide text-[10px]">Select Acting Role</label>
                      <select
                        value={actingRole}
                        onChange={(e) => {
                          const role = e.target.value as StaffRole;
                          setActingRole(role);
                          // Suggest staff name
                          if (role === 'Shop Owner') setActiveStaffName('David Chan');
                          else if (role === 'Manager') setActiveStaffName('Vibol Chann');
                          else if (role === 'Cashier') setActiveStaffName('Sokha Srun');
                          else if (role === 'Stock Controller') setActiveStaffName('Tola Hem');
                          else if (role === 'Online Sales') setActiveStaffName('Kunthea Sok');
                          else setActiveStaffName('Sophea Kem');
                        }}
                        className="w-full bg-slate-950 font-bold border border-slate-800 rounded-lg p-2.5 text-emerald-400 text-xs focus:outline-none focus:border-indigo-500"
                      >
                        <option value="Shop Owner">👑 Shop Owner (Super Admin)</option>
                        <option value="Manager">👔 Shop Manager</option>
                        <option value="Cashier">💵 Store Cashier</option>
                        <option value="Stock Controller">📦 Stock Controller</option>
                        <option value="Online Sales">📱 Online Marketplace Sales</option>
                        <option value="Accountant">🧾 Shop Accountant</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1 font-semibold uppercase font-mono tracking-wide text-[10px]">Staff Name Placeholder</label>
                      <input 
                        type="text" 
                        value={activeStaffName}
                        onChange={(e) => setActiveStaffName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-xs text-sans focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="bg-slate-950 border border-slate-850 rounded p-3 text-[11px] text-slate-400 space-y-1.5 font-sans leading-relaxed">
                    <span className="font-bold text-slate-200 block uppercase font-mono mb-1.5">Role simulation Guide:</span>
                    <p>1. Switch role to <b>"Store Cashier"</b>.</p>
                    <p>2. Try navigating to <b>"Overview Dashboard"</b> or <b>"Financials & Reports"</b>.</p>
                    <p>3. You will receive an immediate mock authorization block, demonstrating our robust full-stack validation constraints!</p>
                  </div>
                </div>

                {/* Permissions tick-box list */}
                <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-amber-500 border-b border-slate-850 pb-2 flex justify-between">
                    <span>Privilege blueprint matrix for role: {actingRole}</span>
                    <span className="text-slate-450 uppercase text-[9.5px]">Simulation stats</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                    <div className="flex items-center gap-3 bg-slate-950 p-2.5 rounded border border-slate-850">
                      <span className={`text-[10px] w-6 text-center rounded font-mono ${activePermissions.salesPOS ? 'bg-emerald-950/80 text-emerald-400' : 'bg-red-950/80 text-red-500'}`}>
                        {activePermissions.salesPOS ? "YES" : "NO"}
                      </span>
                      <div>
                        <b className="text-slate-250 block">Retail Invoice POS Engine</b>
                        <span className="text-[10px] text-slate-500">Conduct client sales point checkouts</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 bg-slate-950 p-2.5 rounded border border-slate-850">
                      <span className={`text-[10px] w-6 text-center rounded font-mono ${activePermissions.inventoryEdit ? 'bg-emerald-950/80 text-emerald-400' : 'bg-red-950/80 text-red-500'}`}>
                        {activePermissions.inventoryEdit ? "YES" : "NO"}
                      </span>
                      <div>
                        <b className="text-slate-250 block">Modify Product Catalog</b>
                        <span className="text-[10px] text-slate-500">Insert codes and modify wholesale rates</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 bg-slate-950 p-2.5 rounded border border-slate-850">
                      <span className={`text-[10px] w-6 text-center rounded font-mono ${activePermissions.stockAdjust ? 'bg-emerald-950/80 text-emerald-400' : 'bg-red-950/80 text-red-500'}`}>
                        {activePermissions.stockAdjust ? "YES" : "NO"}
                      </span>
                      <div>
                        <b className="text-slate-250 block">Physical Stock Adjustments</b>
                        <span className="text-[10px] text-slate-500">Post damages, manual gains/losses, audits</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 bg-slate-950 p-2.5 rounded border border-slate-850">
                      <span className={`text-[10px] w-6 text-center rounded font-mono ${activePermissions.marketplacePost ? 'bg-emerald-950/80 text-emerald-400' : 'bg-red-950/80 text-red-500'}`}>
                        {activePermissions.marketplacePost ? "YES" : "NO"}
                      </span>
                      <div>
                        <b className="text-slate-250 block">Ad marketplace Creation</b>
                        <span className="text-[10px] text-slate-500">Write classified blocks and request promo boosts</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 bg-slate-950 p-2.5 rounded border border-slate-850">
                      <span className={`text-[10px] w-6 text-center rounded font-mono ${activePermissions.reportsView ? 'bg-emerald-950/80 text-emerald-400' : 'bg-red-950/80 text-red-500'}`}>
                        {activePermissions.reportsView ? "YES" : "NO"}
                      </span>
                      <div>
                        <b className="text-slate-255 block">Financial overview Ledger queries</b>
                        <span className="text-[10px] text-slate-500">Extract revenue stats, profit evaluations, and views</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 bg-slate-950 p-2.5 rounded border border-slate-850">
                      <span className={`text-[10px] w-6 text-center rounded font-mono ${activePermissions.refundsApproval ? 'bg-emerald-950/80 text-emerald-400' : 'bg-red-950/80 text-red-500'}`}>
                        {activePermissions.refundsApproval ? "YES" : "NO"}
                      </span>
                      <div>
                        <b className="text-slate-250 block">Returns & Refund approvals</b>
                        <span className="text-[10px] text-slate-500">Authorize active cash warranty refunds claims</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 12.5: SERVICE REPAIR BAY WORKSPACE LOGS */}
          {activeTab === 'service_tickets' && (
            <div className="space-y-4 animate-fadeIn text-xs" id="service_tickets_workspace">
              {/* Header stats section */}
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                    <Wrench className="h-4 w-4 text-sky-400" /> Multi-Service Repair & Diagnostic Bay
                  </h3>
                  <p className="text-slate-400 text-[11px] leading-snug">Track service tickets, consume parts from store inventory, and trigger real-time maintenance logs.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setNewTktCustomerName('');
                    setNewTktVehicleModel('');
                    setNewTktVehiclePlate('');
                    setNewTktProblem('');
                    setNewTktLabor(35);
                    setNewTktParts([]);
                    setShowNewTicketModal(true);
                  }}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg transition text-xs shadow-md"
                >
                  ➕ Create Service Ticket
                </button>
              </div>

              {/* Stats highlights */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                  <span className="text-[10px] uppercase font-mono text-slate-550 font-bold block">Total Bay Jobs</span>
                  <p className="text-lg font-bold font-mono text-white mt-0.5">{serviceTickets.length} Tickets</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                  <span className="text-[10px] uppercase font-mono text-sky-400 font-bold block">🛠️ Repairing</span>
                  <p className="text-lg font-bold font-mono text-sky-400 mt-0.5">
                    {serviceTickets.filter(t => t.status === "In Progress").length} Bays Active
                  </p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                  <span className="text-[10px] uppercase font-mono text-amber-500 font-bold block">Ready for Cashier</span>
                  <p className="text-lg font-bold font-mono text-amber-500 mt-0.5">
                    {serviceTickets.filter(t => t.status === "Review").length} In Review
                  </p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                  <span className="text-[10px] uppercase font-mono text-emerald-500 font-bold block">Completed Settle</span>
                  <p className="text-lg font-bold font-mono text-emerald-500 mt-0.5">
                    {serviceTickets.filter(t => t.status === "Completed").length} Closed Paid
                  </p>
                </div>
              </div>

              {/* Ticket Cards */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-200 border-b border-slate-800 pb-2 flex justify-between">
                  <span>Current Physical Diagnostic Bays Workload</span>
                  <span className="text-[9.5px] uppercase font-mono text-slate-500">Live Status Feed</span>
                </h4>

                <div className="space-y-3">
                  {serviceTickets.length === 0 ? (
                    <p className="text-center text-slate-500 py-6">No diagnostic service records found. Create one above!</p>
                  ) : (
                    serviceTickets.map((t: any) => {
                      return (
                        <div key={t.id} className="bg-slate-950 p-4 border border-slate-850 rounded-lg flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-black text-sky-400">{t.id}</span>
                              <span className={`text-[9px] font-mono font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${
                                t.status === 'Completed' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900' :
                                t.status === 'Review' ? 'bg-amber-950 text-amber-400 border border-amber-900' : 'bg-slate-800 text-slate-300'
                              }`}>
                                {t.status}
                              </span>
                              <span className="text-[10.5px] text-slate-500">{t.date}</span>
                              <span className="text-slate-500">•</span>
                              <span className="text-[10px] text-slate-400 font-sans">Advisor: <b>{t.assignedStaffName}</b></span>
                            </div>

                            <div className="space-y-1">
                              <h4 className="text-xs font-bold text-slate-200">{t.customerName} (Plate: <span className="font-mono text-sky-400 uppercase">{t.vehiclePlate}</span>)</h4>
                              <p className="text-slate-450 text-[11px] font-sans">Vehicle Description: <b>{t.vehicleModel}</b></p>
                              <p className="text-emerald-400 italic text-[11px]">Diagnostics: "{t.problemDescription}"</p>
                            </div>

                            {/* Parts Breakdown */}
                            <div className="bg-slate-900/60 p-2.5 rounded border border-slate-850 space-y-1.5 max-w-xl">
                              <span className="text-[9.5px] font-mono font-black text-slate-400 block uppercase tracking-wide">Reserved Spares & Sourcing Breakdown</span>
                              {t.partsUsed && t.partsUsed.length > 0 ? (
                                t.partsUsed.map((p: any, idx: number) => {
                                  return (
                                    <div key={idx} className="flex justify-between items-center text-[10.5px]">
                                      <div className="flex items-center gap-2">
                                        <span className="text-slate-350">🛠️ {p.name}</span>
                                        <span className={`text-[8px] font-mono px-1 rounded uppercase font-black ${
                                          p.source === 'In-house Parts' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900' :
                                          p.source === 'Customer Bringing' ? 'bg-blue-955 text-blue-400 border border-blue-900' : 'bg-amber-950 text-amber-400 border border-amber-900'
                                        }`}>{p.source}</span>
                                      </div>
                                      <span className="font-mono text-slate-400">{p.qty} x ${p.prc}</span>
                                    </div>
                                  );
                                })
                              ) : (
                                <p className="text-[10px] text-slate-500 italic">No replacement parts booked for this repair card.</p>
                              )}
                              
                              <div className="border-t border-slate-850/60 pt-1.5 mt-1.5 flex flex-wrap justify-between items-center text-[11px] font-mono text-slate-300">
                                <div>Mechanic Labor: <b>${t.laborFee}</b></div>
                                <div className="text-emerald-400">Estimate Combined Total: <b>${t.estimatedCost}</b></div>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-row lg:flex-col gap-1.5 w-full lg:w-44 shrink-0 justify-end">
                            {t.status !== 'Completed' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    // Settle via checkout!
                                    setActiveTab('pos');
                                  }}
                                  className="flex-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded text-[10.5px] font-black font-sans uppercase flex items-center justify-center gap-1 shadow-md cursor-pointer transition"
                                >
                                  💵 Settle POS
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    // toggle
                                    setServiceTickets(prev => prev.map(m => m.id === t.id ? { ...m, status: m.status === 'In Progress' ? 'Review' : 'In Progress' } : m));
                                  }}
                                  className="flex-1 py-1 px-3 bg-slate-800 hover:bg-slate-755 text-slate-300 rounded text-[10.5px] font-semibold border border-slate-750 transition"
                                >
                                  {t.status === 'In Progress' ? '↳ Set Ready' : '↲ Set In-Progress'}
                                </button>
                              </>
                            )}

                            {t.status === 'Completed' && (
                              <div className="bg-emerald-950/40 p-2 border border-emerald-900/50 rounded text-center text-emerald-400 font-mono text-[9.5px]">
                                ✓ Settled via cash register register log
                              </div>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                if (confirm("Wipe this service bay repair ticket from database?")) {
                                  setServiceTickets(prev => prev.filter(m => m.id !== t.id));
                                }
                              }}
                              className="py-1 px-2 text-red-400 hover:text-red-300 text-center font-mono hover:bg-red-950/20 rounded text-[9.5px] tracking-tight"
                            >
                              Wipe Record
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Service Ticket Creation overlay modal */}
              {showNewTicketModal && (
                <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50 overflow-y-auto">
                  <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-xl w-full p-6 text-white font-sans shadow-2xl space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                      <div>
                        <h3 className="text-base font-bold text-sky-400 flex items-center gap-1.5">
                          <Wrench className="w-5 h-5 text-emerald-400" /> Diagnose & Create Repair Ticket
                        </h3>
                        <p className="text-[10px] text-slate-400">Register vehicle service details, assign labor fees, and allocate stock parts.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowNewTicketModal(false)}
                        className="text-slate-400 hover:text-white font-black text-sm px-2 cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="space-y-3.5 mr-1">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] text-slate-450 uppercase font-mono font-bold mb-1">Customer name</label>
                          <input
                            type="text"
                            placeholder="Sera Vathanak"
                            value={newTktCustomerName}
                            onChange={(e) => setNewTktCustomerName(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-1.5 text-white placeholder-slate-650 text-xs focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-450 uppercase font-mono font-bold mb-1">Vehicle description</label>
                          <input
                            type="text"
                            placeholder="Hyundai Tucson 2021"
                            value={newTktVehicleModel}
                            onChange={(e) => setNewTktVehicleModel(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-855 rounded px-3 py-1.5 text-white placeholder-slate-650 text-xs focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] text-slate-450 uppercase font-mono font-bold mb-1">Vehicle Plate / License No.</label>
                          <input
                            type="text"
                            placeholder="PP-2A-9482"
                            value={newTktVehiclePlate}
                            onChange={(e) => setNewTktVehiclePlate(e.target.value)}
                            className="w-full bg-slate-950 text-xs text-sans border border-slate-850 rounded px-3 py-1.5 text-white placeholder-slate-600 focus:outline-none uppercase font-mono font-black"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-450 uppercase font-mono font-bold mb-1">Mechanic Diagnostic Labor rate ($)</label>
                          <input
                            type="number"
                            value={newTktLabor}
                            onChange={(e) => setNewTktLabor(Math.max(0, Number(e.target.value)))}
                            className="w-full bg-slate-950 font-mono text-xs border border-slate-850 rounded px-3 py-1.5 text-white focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-455 uppercase font-mono font-bold mb-1">Repairs Problem Description / Symptoms</label>
                        <input
                          type="text"
                          placeholder="High temperature dashboard indicator checking, cooling fan malfunction diagnosis"
                          value={newTktProblem}
                          onChange={(e) => setNewTktProblem(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-1.5 text-white placeholder-slate-600 text-xs focus:outline-none"
                        />
                      </div>

                      {/* Associated Parts Allocation Grid */}
                      <div className="bg-slate-950 border border-slate-850 rounded-lg p-3 space-y-2">
                        <div className="flex justify-between items-center border-b border-slate-850 pb-1.5">
                          <span className="text-[10px] uppercase font-mono font-black text-indigo-400">Allocated Parts & Sourcing channels ({newTktParts.length})</span>
                          <button
                            type="button"
                            onClick={() => {
                              setNewTktParts([...newTktParts, {
                                productId: '',
                                name: 'New Spare Part Item',
                                qty: 1,
                                prc: 15,
                                source: 'In-house Parts'
                              }]);
                            }}
                            className="px-2 py-0.5 bg-indigo-950 border border-indigo-850 text-indigo-400 rounded hover:bg-indigo-900 text-[10px] font-mono uppercase tracking-wide transition cursor-pointer"
                          >
                            Add Line Slot
                          </button>
                        </div>

                        <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                          {newTktParts.length === 0 ? (
                            <p className="text-[10px] text-slate-550 py-3 text-center">No parts selected. Add parts if diagnosing requires replacements.</p>
                          ) : (
                            newTktParts.map((part, index) => {
                              return (
                                <div key={index} className="grid grid-cols-12 gap-2 bg-slate-900 p-2 rounded border border-slate-850">
                                  {/* Sourcing Channel SELECT OR SELECT PRODUCT */}
                                  <div className="col-span-3">
                                    <label className="block text-[9px] text-slate-500 font-mono mb-0.5">Sourcing Channel</label>
                                    <select
                                      value={part.source}
                                      onChange={(e) => {
                                        const src = e.target.value;
                                        setNewTktParts(newTktParts.map((p, idx) => {
                                          if (idx === index) {
                                            return {
                                              ...p,
                                              source: src,
                                              // reset values if client bringing
                                              prc: src === 'Customer Bringing' ? 0 : p.prc,
                                              name: src === 'Customer Bringing' ? 'Customer Bringing Frame Filter' : p.name
                                            };
                                          }
                                          return p;
                                        }));
                                      }}
                                      className="w-full text-[10px] bg-slate-950 border border-slate-800 rounded py-1 text-slate-200 focus:outline-none"
                                    >
                                      <option value="In-house Parts">🏪 In-house Parts</option>
                                      <option value="Customer Bringing">🙋 Client Bring</option>
                                      <option value="Supplier Dispatch">🚛 Supplier PO</option>
                                    </select>
                                  </div>

                                  {part.source === 'In-house Parts' ? (
                                    <div className="col-span-5">
                                      <label className="block text-[9px] text-slate-500 font-mono mb-0.5">Shop Reserve Product</label>
                                      <select
                                        value={part.productId || ''}
                                        onChange={(e) => {
                                          const prodId = e.target.value;
                                          const match = dbState.products.find(p => p.id === prodId);
                                          setNewTktParts(newTktParts.map((p, idx) => {
                                            if (idx === index && match) {
                                              return {
                                                ...p,
                                                productId: prodId,
                                                name: match.name,
                                                prc: match.sellingPrice
                                              };
                                            }
                                            return p;
                                          }));
                                        }}
                                        className="w-full text-[10px] bg-slate-950 border border-slate-800 rounded py-1 text-slate-300 focus:outline-none italic"
                                        required
                                      >
                                        <option value="">-- Choose Reserve --</option>
                                        {dbState.products.map(p => (
                                          <option key={p.id} value={p.id} disabled={p.stockQuantity === 0}>
                                            {p.name} (${p.sellingPrice.toFixed(2)} - {p.stockQuantity} Left)
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                  ) : (
                                    <div className="col-span-5">
                                      <label className="block text-[9px] text-slate-500 font-mono mb-0.5">Part Description Label</label>
                                      <input
                                        type="text"
                                        value={part.name}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          setNewTktParts(newTktParts.map((p, idx) => idx === index ? { ...p, name: val } : p));
                                        }}
                                        className="w-full text-[10px] bg-slate-950 border border-slate-800 rounded py-1.5 px-2 text-white"
                                        required
                                      />
                                    </div>
                                  )}

                                  <div className="col-span-2">
                                    <label className="block text-[9px] text-slate-500 font-mono mb-0.5">Quantity</label>
                                    <input
                                      type="number"
                                      value={part.qty}
                                      onChange={(e) => {
                                        const val = Math.max(1, Number(e.target.value));
                                        setNewTktParts(newTktParts.map((p, idx) => idx === index ? { ...p, qty: val } : p));
                                      }}
                                      className="w-full text-[10px] bg-slate-950 font-mono border border-slate-800 rounded py-1 px-1.5 text-center text-white"
                                    />
                                  </div>

                                  <div className="col-span-1.5">
                                    <label className="block text-[9px] text-slate-500 font-mono mb-0.5">Charge</label>
                                    <input
                                      type="number"
                                      value={part.prc}
                                      disabled={part.source === 'Customer Bringing'}
                                      onChange={(e) => {
                                        const val = Math.max(0, Number(e.target.value));
                                        setNewTktParts(newTktParts.map((p, idx) => idx === index ? { ...p, prc: val } : p));
                                      }}
                                      className="w-full text-[10px] bg-slate-950 font-mono border border-slate-800 rounded py-1 text-center text-white disabled:text-slate-550"
                                    />
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setNewTktParts(newTktParts.filter((_, idx) => idx !== index));
                                    }}
                                    className="col-span-0.5 text-red-500 hover:text-red-400 mt-5 font-black text-xs cursor-pointer"
                                  >
                                    ✕
                                  </button>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center bg-slate-950 p-2 rounded">
                      <span className="text-[10px] font-mono text-slate-400">Total parts value: <b>${newTktParts.reduce((a, b) => a + (b.prc * b.qty), 0)}</b></span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setShowNewTicketModal(false)}
                          className="px-4 py-1.5 bg-slate-800 text-slate-350 hover:bg-slate-750 transition text-xs font-semibold rounded"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            // Run built-in save diagnostics
                            handleCreateTicketClose();
                          }}
                          className="px-5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white transition text-xs font-bold rounded shadow-md"
                        >
                          Submit Bay Ticket
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 13: SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="space-y-4 animate-fadeIn text-xs" id="shop_settings_room">
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5">
                <h3 className="text-sm font-semibold text-white flex items-center gap-1">
                  <Settings className="h-4 w-4" /> Global Cambodia shop settings
                </h3>
                <p className="text-slate-400">Configure layout printers, tax bounds, and localized Phnom Penh maps connection setups.</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 max-w-xl space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1 text-slate-400">Business Registry Label</label>
                    <input type="text" defaultValue="MyCar Care KH Official Co." className="w-full bg-slate-950 border border-slate-850 rounded p-2 text-white font-semibold" />
                  </div>
                  <div>
                    <label className="block mb-1 text-slate-400">National Tax Identification Number (TIN)</label>
                    <input type="text" defaultValue="K009-8472910" className="w-full bg-slate-950 font-mono border border-slate-850 rounded p-2 text-slate-400" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1 text-slate-400">National VAT Percent</label>
                    <input type="text" defaultValue="10%" disabled className="w-full bg-slate-950 border border-slate-850 rounded p-2 text-slate-500 font-mono" />
                  </div>
                  <div>
                    <label className="block mb-1 text-slate-400">Currency Default Unit</label>
                    <input type="text" defaultValue="USD ($)" disabled className="w-full bg-slate-950 border border-slate-850 rounded p-2 text-slate-500" />
                  </div>
                </div>

                <div>
                  <label className="block mb-1 text-slate-400">Warehouse physical Address note</label>
                  <textarea rows={2} defaultValue="Building 12-B, Russian Boulevard, Sen Sok Khum, Phnom Penh, Kingdom of Cambodia" className="w-full bg-slate-950 border border-slate-850 rounded p-2 text-slate-300" />
                </div>

                <div className="bg-slate-950 p-2.5 rounded border border-slate-850 inline-flex items-center gap-2">
                  <CheckCircle className="h-4.5 w-4.5 text-emerald-400" />
                  <span className="text-slate-350">ABA Instant KHQR Payment Gateway integrations connected successfully.</span>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

    </div>
  );
}
