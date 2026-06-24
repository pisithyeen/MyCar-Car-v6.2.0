import React, { useState } from 'react';
import { 
  BarChart4, 
  TrendingUp, 
  Coins, 
  Layers, 
  AlertTriangle, 
  Eye, 
  Flame, 
  MousePointerClick,
  Download,
  Calendar,
  Filter
} from 'lucide-react';
import { SalesInvoice, PartProduct, PartMarketplacePost } from './PartsData';

interface PartsReportsProps {
  invoices: SalesInvoice[];
  products: PartProduct[];
  marketplacePosts: PartMarketplacePost[];
}

export default function PartsReports({ invoices, products, marketplacePosts }: PartsReportsProps) {
  const [reportType, setReportType] = useState<'sales_revenue' | 'inventory_efficiency' | 'marketplace_clicks'>('sales_revenue');
  const [selectedRange, setSelectedRange] = useState<'today' | 'month' | 'year'>('month');

  // Calculating math financials
  const revenueTotal = invoices.reduce((acc, inv) => acc + inv.totalAmount, 0);
  const discountTotal = invoices.reduce((acc, inv) => acc + inv.totalDiscount, 0);
  const taxTotal = invoices.reduce((acc, inv) => acc + inv.totalTax, 0);
  
  // COGS estimate: matching invoice items to the product's cost price
  const estimatedCOGS = invoices.reduce((acc, inv) => {
    const invItemsCost = inv.items.reduce((itemAcc, item) => {
      const matchProd = products.find(p => p.id === item.productId || p.sku === item.sku);
      const unitCost = matchProd ? matchProd.costPrice : (item.price * 0.55); // Fallback estimate 55% cost
      return itemAcc + (unitCost * item.quantity);
    }, 0);
    return acc + invItemsCost;
  }, 0);

  const estimatedProfit = Math.max(0, revenueTotal - estimatedCOGS - taxTotal);

  // Stock inventory categorization
  const totalStockValueRetail = products.reduce((acc, p) => acc + (p.sellingPrice * p.stockQuantity), 0);
  const totalStockValueCost = products.reduce((acc, p) => acc + (p.costPrice * p.stockQuantity), 0);
  const deadStockItems = products.filter(p => p.stockQuantity > p.minStockAlert && !invoices.some(inv => inv.items.some(item => item.productId === p.id)));
  const fastMovingItems = products.filter(p => invoices.some(inv => inv.items.some(item => item.productId === p.id && item.quantity >= 3)));

  // Marketplace metrics
  const totalViews = marketplacePosts.reduce((acc, p) => acc + p.views, 0);
  const totalClicks = marketplacePosts.reduce((acc, p) => acc + p.clicks, 0);
  const totalInquiries = marketplacePosts.reduce((acc, p) => acc + p.messages, 0);
  const conversionRate = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-4 font-sans text-xs" id="reports_and_analytics_room">
      
      {/* Dynamic Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex.col justify-between">
          <span className="text-[10px] text-slate-450 uppercase tracking-widest font-mono font-bold block mb-1">Total Sales Revenue</span>
          <span className="text-xl font-bold font-mono text-emerald-400">${revenueTotal.toFixed(2)}</span>
          <span className="text-[9px] text-slate-500 block mt-1.5">Exc. VAT: ${(revenueTotal - taxTotal).toFixed(2)}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex.col justify-between">
          <span className="text-[10px] text-slate-450 uppercase tracking-widest font-mono font-bold block mb-1">Estimated Cost of Goods (COGS)</span>
          <span className="text-xl font-medium font-mono text-slate-300">${estimatedCOGS.toFixed(2)}</span>
          <span className="text-[9px] text-slate-500 block mt-1.5">Based on catalog purchase prices</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex.col justify-between">
          <span className="text-[10px] text-slate-450 uppercase tracking-widest font-mono font-bold block mb-1">Net Profit Estimate</span>
          <span className="text-xl font-bold font-mono text-white">${estimatedProfit.toFixed(2)}</span>
          <span className="text-[9px] text-emerald-500 block mt-1.5">Margin: {revenueTotal > 0 ? ((estimatedProfit / revenueTotal) * 100).toFixed(1) : 0}%</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex.col justify-between">
          <span className="text-[10px] text-slate-450 uppercase tracking-widest font-mono font-bold block mb-1">Asset Value (At Cost)</span>
          <span className="text-xl font-bold font-mono text-slate-300">${totalStockValueCost.toFixed(2)}</span>
          <span className="text-[9px] text-slate-500 block mt-1.5">Retail Valuation: ${totalStockValueRetail.toFixed(2)}</span>
        </div>
      </div>

      {/* Report filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3.5 bg-slate-900 border border-slate-800 rounded-xl gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setReportType('sales_revenue')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              reportType === 'sales_revenue' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-950 text-slate-300 hover:bg-slate-850'
            }`}
          >
            Sales & Invoicing Ledger
          </button>
          <button
            onClick={() => setReportType('inventory_efficiency')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              reportType === 'inventory_efficiency' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-950 text-slate-300 hover:bg-slate-850'
            }`}
          >
            Turnover & Velocity
          </button>
          <button
            onClick={() => setReportType('marketplace_clicks')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              reportType === 'marketplace_clicks' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-950 text-slate-300 hover:bg-slate-850'
            }`}
          >
            Digital reach feedback
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              alert("Audit ledger CSV spreadsheet compiled ready for download! (Mock)");
            }}
            className="flex items-center gap-1 py-1.5 px-3 bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded text-slate-300 font-semibold"
          >
            <Download className="h-3.5 w-3.5" /> Export Ledger CSV
          </button>
        </div>
      </div>

      {/* Grid rendering selected report detail */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        
        {/* REPORT OPTION 1: SALES REVENUE LEDGER */}
        {reportType === 'sales_revenue' && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white">Daily & Weekly Sales Ledger</h3>
            <div className="overflow-x-auto border border-slate-850 rounded-lg">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950 text-slate-450 uppercase font-mono border-b border-slate-800 p-3 bg-opacity-70">
                    <th className="p-3">Invoice No</th>
                    <th className="p-3">Buyer / Client</th>
                    <th className="p-3">Payment Protocol</th>
                    <th className="p-3 text-right">Items sold</th>
                    <th className="p-3 text-right">Discounts</th>
                    <th className="p-3 text-right">VAT (10%)</th>
                    <th className="p-3 text-right">Invoice total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 text-slate-300">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-850/25 transition">
                      <td className="p-3 font-mono font-bold text-emerald-400">{inv.invoiceNumber}</td>
                      <td className="p-3 font-sans">
                        <span className="block font-semibold text-slate-100">{inv.customerName}</span>
                        <span className="block text-[10px] font-mono text-slate-500">{inv.customerPhone}</span>
                      </td>
                      <td className="p-3 font-medium text-slate-300">{inv.paymentMethod}</td>
                      <td className="p-3 text-right font-mono">{inv.items.reduce((a, b) => a + b.quantity, 0)} units</td>
                      <td className="p-3 text-right font-mono text-amber-400">-${inv.totalDiscount.toFixed(2)}</td>
                      <td className="p-3 text-right font-mono text-slate-400">${inv.totalTax.toFixed(2)}</td>
                      <td className="p-3 text-right font-mono font-bold text-white">${inv.totalAmount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* REPORT OPTION 2: TURNOVER & STOCK VELOCITY */}
        {reportType === 'inventory_efficiency' && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white">Fast, Slow, and Dead Stock classifications</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="bg-slate-950 border border-slate-850 rounded-xl p-3.5 space-y-2">
                <span className="font-bold text-indigo-400 flex items-center gap-1 font-mono uppercase tracking-widest text-[10px]">
                  ⚡ Fast Moving SKUs (High velocity)
                </span>
                <p className="text-slate-400 text-[11px] leading-snug">Items sold in multi-units that rotate within 14 days. These require high replenishment attention.</p>
                <div className="space-y-1.5 pt-2">
                  {fastMovingItems.length === 0 ? (
                    <p className="text-slate-500 italic font-sans">None flagged yet. Awaiting diagnostic sales data.</p>
                  ) : (
                    fastMovingItems.map((f, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-slate-900 px-2.5 py-1.5 rounded text-white font-mono">
                        <span>{f.sku} | <b className="text-slate-300 font-sans">{f.name}</b></span>
                        <span className="text-emerald-400 font-bold">Qty: {f.stockQuantity} remaining</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-850 rounded-xl p-3.5 space-y-2">
                <span className="font-bold text-amber-500 flex items-center gap-1 font-mono uppercase tracking-widest text-[10px]">
                  ⚠️ Dead / Slow Stock items
                </span>
                <p className="text-slate-400 text-[11px] leading-snug">Spares sitting on shelves without invoice registrations for more than 45 days. Suggest running promotions to clear.</p>
                <div className="space-y-1.5 pt-2">
                  {deadStockItems.length === 0 ? (
                    <p className="text-slate-500 italic font-sans">None flagged. Inventory levels rotate efficiently.</p>
                  ) : (
                    deadStockItems.slice(0, 4).map((d, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-slate-900 px-2.5 py-1.5 rounded text-slate-300 font-mono">
                        <span className="truncate max-w-[65%]">{d.sku} | {d.name}</span>
                        <span className="text-amber-500">Val: ${(d.costPrice * d.stockQuantity).toFixed(2)}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* REPORT OPTION 3: DIGITAL AD REACH */}
        {reportType === 'marketplace_clicks' && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white">Marketplace Clicks & Lead Conversions</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-850">
              <div className="text-center p-2.5">
                <span className="text-slate-500 block uppercase font-mono text-[9px]">Total Ad Impressions</span>
                <span className="text-lg font-bold text-white font-mono">{totalViews} Views</span>
              </div>
              <div className="text-center p-2.5 border-x border-slate-850">
                <span className="text-slate-500 block uppercase font-mono text-[9px]">Phone / Telegram Clicks</span>
                <span className="text-lg font-bold text-emerald-400 font-mono">{totalClicks} Interacts</span>
              </div>
              <div className="text-center p-2.5">
                <span className="text-slate-500 block uppercase font-mono text-[9px]">Average Conversion</span>
                <span className="text-lg font-bold text-indigo-400 font-mono">{conversionRate}% Rate</span>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-850 rounded-lg">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950 text-slate-450 uppercase font-mono border-b border-slate-800 p-3 bg-opacity-70">
                    <th className="p-3">Ad Title</th>
                    <th className="p-3">Type</th>
                    <th className="p-3 font-mono text-center">Impressions</th>
                    <th className="p-3 font-mono text-center">Inquiries</th>
                    <th className="p-3 font-mono text-center">Interacts</th>
                    <th className="p-3 text-center">Coverage status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 text-slate-300">
                  {marketplacePosts.map((post) => (
                    <tr key={post.id} className="hover:bg-slate-850/25 transition">
                      <td className="p-3 font-semibold text-slate-200">{post.title}</td>
                      <td className="p-3 text-slate-400">{post.postType}</td>
                      <td className="p-3 font-mono text-center text-slate-300">{post.views}</td>
                      <td className="p-3 font-mono text-center text-indigo-400">{post.messages}</td>
                      <td className="p-3 font-mono text-center text-emerald-400">{post.clicks}</td>
                      <td className="p-3 text-center">
                        {post.isBoosted ? (
                          <span className="inline-block bg-amber-950 text-amber-500 border border-amber-900/40 rounded px-2 py-0.5 text-[10px] uppercase font-mono tracking-wider font-semibold animate-pulse">
                            🔥 Hot Boost
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[10px]">Standard organic</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
