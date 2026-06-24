import React, { useState } from 'react';
import { 
  Sparkles, 
  Search, 
  Wrench, 
  HelpCircle, 
  ArrowRight, 
  AlertTriangle, 
  TrendingUp, 
  BookOpen, 
  Activity,
  Bot
} from 'lucide-react';
import { PartProduct } from './PartsData';

interface PartsAiAssistantProps {
  products: PartProduct[];
  onAddFromCatalogSearch?: (prod: PartProduct) => void;
}

export default function PartsAiAssistant({ products, onAddFromCatalogSearch }: PartsAiAssistantProps) {
  // Spare Parts diagnosis states
  const [vehicleModel, setVehicleModel] = useState('Toyota Prius 2011');
  const [problemDescription, setProblemDescription] = useState('Loud high-pitched squeaking noise when decelerating, especially in rainy wet weather');
  const [matchingLoading, setMatchingLoading] = useState(false);
  const [isDoneDiagnosing, setIsDoneDiagnosing] = useState(false);
  const [matchingResults, setMatchingResults] = useState<any>(null);

  // Sourcing planning states
  const [recoLoading, setRecoLoading] = useState(false);
  const [recoResults, setRecoResults] = useState<any>(null);

  const triggerDiagnosis = async () => {
    if (!problemDescription) {
      alert("Please describe the mechanical symptoms first.");
      return;
    }

    setMatchingLoading(true);
    try {
      const res = await fetch("/api/parts/ai-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskType: 'part-matching',
          payload: { vehicleModel, problem: problemDescription, currentInventory: products }
        })
      });
      const data = await res.json();
      setMatchingResults(data);
      setIsDoneDiagnosing(true);
    } catch (err) {
      console.error(err);
      alert("Failed to communicate with AI Advisor.");
    } finally {
      setMatchingLoading(false);
    }
  };

  const triggerStockRecommendation = async () => {
    setRecoLoading(true);
    try {
      const res = await fetch("/api/parts/ai-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskType: 'stock-recommend',
          payload: { currentInventory: products }
        })
      });
      const data = await res.json();
      setRecoResults(data);
    } catch (err) {
      console.error(err);
      alert("Failed to compile stocking guide.");
    } finally {
      setRecoLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-sans text-xs" id="parts_ai_agent_intelligence_room">
      
      {/* 1. SYMPTOM MATCHER BOARD */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Bot className="h-5 w-5 text-indigo-400" />
            AI Spare Part Matcher & Troubleshooter
          </h2>
          <p className="text-slate-400 mt-0.5">Input car models & customer complaints. Our Gemini diagnostics system cross-checks fits, lists price index bounds, and links catalog spares.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-slate-450 mb-1">Target Car Model (Brand Model Year)</label>
            <input 
              type="text" 
              placeholder="e.g. Lexus RX330 2005"
              value={vehicleModel}
              onChange={(e) => setVehicleModel(e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-white placeholder-slate-650 font-mono"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-slate-450 mb-1">Reported Mechanical Complaint / Symptoms</label>
            <div className="relative">
              <input 
                type="text" 
                placeholder="e.g. rough rumbling engine idle or battery warning lamp is red"
                value={problemDescription}
                onChange={(e) => setProblemDescription(e.target.value)}
                className="w-full bg-slate-955 border border-slate-850 rounded-lg px-3 py-2 pr-28 text-white placeholder-slate-600"
              />
              <button
                onClick={triggerDiagnosis}
                disabled={matchingLoading}
                className="absolute right-1 top-1.5 py-1 px-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded font-semibold flex items-center gap-1 text-[11px]"
              >
                {matchingLoading ? "Matching..." : "Diagnor Parts"}
              </button>
            </div>
          </div>
        </div>

        {/* Matches output rendering */}
        {isDoneDiagnosing && matchingResults && (
          <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 space-y-3 animate-fadeIn">
            <div className="flex justify-between items-center bg-indigo-950/40 p-2.5 rounded-lg border border-indigo-900/50">
              <span className="font-semibold text-indigo-400 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-amber-300 fill-amber-300/10" /> Gemini Diagnostic Blueprint Loaded
              </span>
              <span className="font-mono text-slate-400">USD Index Range: <b>{matchingResults.averagePriceRange || "N/A"}</b></span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <h4 className="font-bold text-slate-350 uppercase tracking-widest font-mono">Suggested Repair Spares</h4>
                <ul className="space-y-1.5">
                  {(matchingResults.suggestedParts || []).map((part: string) => (
                    <li key={part} className="flex items-center gap-2 text-slate-200">
                      <Wrench className="h-4 w-4 text-slate-500" />
                      <span>{part}</span>
                    </li>
                  ))}
                </ul>

                <h4 className="font-bold text-slate-350 uppercase tracking-widest font-mono pt-2">Phnom Penh Installation Centers</h4>
                <ul className="space-y-1.5">
                  {(matchingResults.suggestedGarageServices || []).map((svc: string) => (
                    <li key={svc} className="flex items-center gap-2 text-slate-300 font-sans italic">
                      <ArrowRight className="h-3 w-3 text-indigo-400" />
                      <span>{svc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-900/60 p-3 rounded-lg space-y-2.5 border border-slate-850 text-slate-300">
                <h4 className="font-bold text-slate-400 uppercase tracking-widest font-mono">Mechanical Explanation</h4>
                <p className="leading-relaxed whitespace-pre-line text-[11px] text-slate-300">
                  {matchingResults.compatibilityReason}
                </p>

                {/* DIRECT IN-VENTORY MATCH LINKAGE */}
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest font-mono block mb-1.5">Direct matches in our stock catalog</span>
                  {(matchingResults.matchingInCatalog || []).length === 0 ? (
                    <span className="text-slate-500 italic block">None of these specific items currently match our catalog reserves.</span>
                  ) : (
                    (matchingResults.matchingInCatalog || []).map((match: any) => (
                      <div key={match.id} className="flex justify-between items-center bg-slate-950 p-2 rounded border border-slate-800">
                        <div>
                          <b className="text-slate-100 block">{match.name}</b>
                          <span className="text-[10px] text-slate-500">In Stock: <b>{match.stockQuantity}</b> • Price: <b>${match.price.toFixed(2)}</b></span>
                        </div>
                        {onAddFromCatalogSearch && (
                          <button
                            onClick={() => onAddFromCatalogSearch(match)}
                            className="text-[10px] bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-2 py-1 rounded"
                          >
                            Add to Invoice
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. SOURCING STOCK RECOMMEND SYSTEM */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-400" />
            AI Stock Sourcing Recommendation Engine
          </h2>
          <p className="text-slate-400 mt-0.5">Launches an in-depth inventory stock density scan, forecasts seasonal demands, and structures replenishment proposals.</p>
        </div>

        <button
          onClick={triggerStockRecommendation}
          disabled={recoLoading}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs font-sans transition"
        >
          {recoLoading ? "Scanning Stock Matrix..." : "Compile Restock Recommendations 📊"}
        </button>

        {recoResults && (
          <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 space-y-4 animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between bg-emerald-950/40 p-2.5 rounded border border-emerald-900/50 gap-2">
              <span className="font-semibold text-emerald-400 flex items-center justify-start gap-1">
                <Activity className="h-4 w-4" /> Real-time Warehouse Sourcing Proposal Compile successfully
              </span>
              <span className="font-sans text-slate-400 text-[10.5px]">Recommendations active for June Monsoon season</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Proposals list */}
              <div className="md:col-span-2 space-y-2.5">
                <h4 className="font-bold text-slate-350 uppercase tracking-widest font-mono">Suggested Restock Orders</h4>
                {(recoResults.restockRecommendations || []).length === 0 ? (
                  <p className="text-slate-500 italic">No critical restock triggers required. All levels stable.</p>
                ) : (
                  (recoResults.restockRecommendations || []).map((rec: any, idx: number) => (
                    <div key={idx} className="bg-slate-900 p-3 rounded-lg border border-slate-850 space-y-1">
                      <div className="flex justify-between font-sans">
                        <span className="font-semibold text-white text-xs">{rec.productName}</span>
                        <span className="font-mono text-emerald-400 text-[10px] bg-slate-950 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">SKU: {rec.sku}</span>
                      </div>
                      <p className="text-slate-400 text-xs italic leading-relaxed mt-1">
                        {rec.reason}
                      </p>
                      <div className="flex gap-4 text-[10px] text-slate-500 font-mono mt-1 pt-1.5 border-t border-slate-850/60">
                        <span>Current Stock: <b className="text-slate-300">{rec.currentStock}</b></span>
                        <span>Safety Reserve: <b className="text-slate-300">{rec.minStock}</b></span>
                        <span>Confidence Index: <b className="text-indigo-400">{rec.confidence}</b></span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Campaign plans and hot alerts */}
              <div className="space-y-4">
                <div className="bg-slate-900/60 p-3.5 rounded-lg border border-slate-850 space-y-2">
                  <h4 className="text-[10px] font-bold text-slate-450 uppercase tracking-widest font-mono flex items-center gap-1.5 border-b border-slate-800 pb-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-400" /> Velocity Alerts
                  </h4>
                  <div className="space-y-1">
                    <span className="text-slate-500 block uppercase text-[8.5px] font-mono">Fast-Moving forecast:</span>
                    {(recoResults.fastMovingAlerts || []).map((a: string, idx: number) => (
                      <span key={idx} className="block text-emerald-350 font-bold bg-emerald-950/30 px-1.5 py-0.5 rounded">{a}</span>
                    ))}
                    
                    <span className="text-slate-500 block uppercase text-[8.5px] font-mono pt-1.5">Slow-Moving forecast:</span>
                    {(recoResults.slowMovingAlerts || []).map((a: string, idx: number) => (
                      <span key={idx} className="block text-amber-300 bg-amber-950/20 px-1.5 py-0.5 rounded">{a}</span>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900/60 p-3.5 rounded-lg border border-slate-850 space-y-2">
                  <h4 className="text-[10px] font-bold text-slate-450 uppercase tracking-widest font-mono flex items-center gap-1.5 border-b border-slate-800 pb-1.5">
                    <HelpCircle className="h-3.5 w-3.5 text-indigo-400" /> Recommended local Campaign
                  </h4>
                  {(recoResults.promotionSuggestions || []).map((p: any, idx: number) => (
                    <div key={idx} className="space-y-1 text-slate-200">
                      <b className="text-indigo-400">{p.name} ({p.discountPercent}% OFF)</b>
                      <p className="text-[11px] text-slate-420 italic leading-snug">{p.reason}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

    </div>
  );
}
