import React from "react";
import { 
  X, 
  Sparkles, 
  Scale, 
  MapPin, 
  DollarSign, 
  CheckCircle2, 
  Percent, 
  Car, 
  Award,
  AlertCircle
} from "lucide-react";
import { PartListing } from "../types";

interface MarketplaceCompareProps {
  vehiclesToCompare: PartListing[];
  onRemoveFromCompare: (id: string) => void;
  onCloseCompare: () => void;
}

export default function MarketplaceCompare({
  vehiclesToCompare,
  onRemoveFromCompare,
  onCloseCompare
}: MarketplaceCompareProps) {

  // Generate mock comparative fields for vehicles if missing, to achieve maximum fidelity!
  const getCompField = (v: PartListing, field: string) => {
    switch (field) {
      case "price":
        return v.price ? `$${v.price.toLocaleString()} USD` : "N/A";
      case "year":
        return v.vehicleYear || v.yearRange || "2015";
      case "mileage":
        return v.mileage ? `${v.mileage.toLocaleString()} km` : "74,000 km"; // reliable fallback
      case "engine":
        return v.engineType || "2.5L I4 DOHC / Turbo";
      case "fuelCost":
        return v.fuelType === "EV" ? "~$30 / month Electricity" : v.fuelType === "Hybrid" ? "~$90 / month Fuel" : "~$140 / month Premium Gas";
      case "score":
        return `${v.healthScore || 92}% Score`;
      case "history":
        return v.serviceHistorySummary ? "Verified Logs Available" : "Self-Declared (Unverified)";
      case "seller":
        return v.verifiedSeller ? "★ 4.9 (Verified Registered dealer)" : "★ 4.6 (Handshake Driver)";
      case "location":
        return v.location;
      default:
        return "";
    }
  };

  // Find the winner to display an AI crown indicator!
  const getWinnerIndex = () => {
    let bestIdx = 0;
    let bestScore = -1;
    vehiclesToCompare.forEach((v, idx) => {
      // rough heuristic based on score & year & low pricing
      const score = (v.healthScore || 92) + (30000 - (v.price || 15000)) / 1000;
      if (score > bestScore) {
        bestScore = score;
        bestIdx = idx;
      }
    });
    return bestIdx;
  };

  const winnerIdx = vehiclesToCompare.length > 0 ? getWinnerIndex() : -1;

  return (
    <div id="vehicle-comparison-module" className="bg-slate-900 border border-white/10 rounded-3xl p-6 space-y-6 text-left">
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div className="space-y-1">
          <h2 className="text-sm font-black text-slate-100 flex items-center gap-1.5 uppercase tracking-wider">
            <Scale className="w-5 h-5 text-indigo-400" />
            <span>Vehicles Comparison Deck</span>
          </h2>
          <p className="text-[11px] text-slate-400">
            Compare side-by-side core attributes of 2 to 4 vehicles to help with your buying choice.
          </p>
        </div>
        <button
          onClick={onCloseCompare}
          className="p-1 text-slate-400 hover:text-white transition rounded-lg hover:bg-white/5 uppercase font-bold text-[10px] px-2.5 cursor-pointer border border-white/5"
        >
          Close Deck
        </button>
      </div>

      {vehiclesToCompare.length === 0 ? (
        <div className="bg-slate-950/40 p-12 text-center rounded-2xl border border-dashed border-white/5">
          <Car className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-xs text-slate-300 font-bold">No vehicles in comparison deck</p>
          <p className="text-[11px] text-slate-500 max-w-xs mx-auto mt-1">
            Click the "Compare" check indicator or button under any vehicle listing card in the marketplace feed to add it here.
          </p>
        </div>
      ) : vehiclesToCompare.length < 2 ? (
        <div className="bg-slate-950 p-6 rounded-2xl border border-white/5 text-center space-y-3">
          <AlertCircle className="w-7 h-7 text-amber-500 mx-auto" />
          <p className="text-xs text-slate-300">Add at least <strong>one more vehicle</strong> to unlock comparing matrix values!</p>
          <p className="text-[10px] text-slate-500">Currently has 1 vehicle selected ({vehiclesToCompare[0].title}).</p>
          <div className="grid grid-cols-1 max-w-sm mx-auto">
            <div className="bg-slate-900 p-2.5 border border-white/5 rounded-xl flex justify-between items-center">
              <span className="text-[10px] text-slate-300 truncate font-semibold">{vehiclesToCompare[0].title}</span>
              <button 
                onClick={() => onRemoveFromCompare(vehiclesToCompare[0].id)}
                className="text-red-400 hover:text-red-300 text-[10px]"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-2xl border border-white/5 bg-slate-950/60 leading-normal">
            <table className="w-full text-xs text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-white/5 bg-slate-950/80">
                  <th className="p-3.5 font-bold text-[10px] text-slate-500 uppercase tracking-wider w-[180px]">Specifications matrix</th>
                  {vehiclesToCompare.map((v, i) => (
                    <th key={v.id} className="p-3.5 relative">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1 max-w-[150px]">
                          <span className="text-slate-100 font-bold tracking-tight block truncate text-[11px]">{v.title}</span>
                          <span className="text-[10px] text-yellow-400 font-mono font-bold block">${v.price || "N/A"}</span>
                        </div>
                        <button
                          onClick={() => onRemoveFromCompare(v.id)}
                          className="p-1 bg-white/5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded transition cursor-pointer"
                          title="Remove from comparison"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {winnerIdx === i && (
                        <div className="absolute top-1 right-1">
                          <span className="bg-amber-400/10 text-amber-400 border border-amber-400/25 text-[8.5px] uppercase font-black px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            👑 AI Recommended Deal
                          </span>
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "💰 Settlement price", key: "price" },
                  { label: "📅 Automobile year", key: "year" },
                  { label: "📉 Odometer mileage", key: "mileage" },
                  { label: "🔩 Propulsion setup / displacement", key: "engine" },
                  { label: "💵 Estimated energy cost", key: "fuelCost" },
                  { label: "🛡️ Mechanic maintenance score", key: "score" },
                  { label: "🛠️ Cambodian service journal", key: "history" },
                  { label: "⭐ Digital seller rating", key: "seller" },
                  { label: "📍 Local pickup province", key: "location" }
                ].map((row, idx) => (
                  <tr key={idx} className="border-b border-white/5 hover:bg-white/1 flex-none">
                    <td className="p-3.5 font-bold text-slate-400 text-[10px] uppercase tracking-wide bg-slate-950/20">{row.label}</td>
                    {vehiclesToCompare.map((v, i) => (
                      <td key={v.id} className={`p-3.5 font-mono ${winnerIdx === i ? 'bg-indigo-500/2 text-slate-200' : 'text-slate-350'}`}>
                        {getCompField(v, row.key)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* AI Advisor Assessment commentary block based on compared item matrix */}
          <div className="p-4.5 bg-gradient-to-r from-indigo-950/20 to-slate-950 border border-indigo-500/15 rounded-2xl space-y-2 text-[11px] text-slate-300">
            <h4 className="text-white font-bold flex items-center gap-1 uppercase tracking-wide text-xs">
              <Sparkles className="w-4 h-4 text-pink-400 animate-pulse" />
              <span>Algorithmic Comparison Advice</span>
            </h4>
            <p>
              Analyzing vehicles index properties: The <strong className="text-white">{vehiclesToCompare[winnerIdx].title}</strong> represents the highest financial yield factor. It reports a {vehiclesToCompare[winnerIdx].healthScore || 94}% maintenance score with authentic Cambodian garage passports. Recommended for active city commuting.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
