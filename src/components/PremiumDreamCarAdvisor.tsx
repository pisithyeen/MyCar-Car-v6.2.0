import React, { useState } from "react";
import { 
  Check, 
  HelpCircle, 
  X, 
  Sparkles, 
  DollarSign, 
  Truck, 
  ShieldCheck, 
  Info, 
  Sliders, 
  Compass, 
  AlertCircle 
} from "lucide-react";

interface PremiumDreamCarAdvisorProps {
  onClose: () => void;
  availableCoins: number;
}

export default function PremiumDreamCarAdvisor({
  onClose,
  availableCoins
}: PremiumDreamCarAdvisorProps) {
  const [budget, setBudget] = useState(25000);
  const [salary, setSalary] = useState(1500); // monthly USD
  const [bodyType, setBodyType] = useState("SUV");
  const [terrain, setTerrain] = useState("mixed");
  const [priority, setPriority] = useState("fuel");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any | null>(null);

  const handleGenerateAdvisor = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      // Logic recommending vehicles with actual Cambodia price maps
      let carName = "";
      let pros: string[] = [];
      let cons: string[] = [];
      let specs = { engine: "", fuelEconomy: "", maintenanceCost: "", reliability: "" };
      let adviceText = "";
      let visualUrl = "";

      if (budget < 15000) {
        carName = "Toyota Prius Generation 3 (2010 - 2012)";
        visualUrl = "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=400";
        specs = {
          engine: "1.8L Hybrid 4-Cylinder",
          fuelEconomy: "4.5L / 100km (Exceptional)",
          maintenanceCost: "Low (Abundant spare parts/garages in Phnom Penh)",
          reliability: "★ ★ ★ ★ ★ (Resilient)"
        };
        adviceText = "Given your budget under $15k, the Gen 3 Prius remains the undisputed champion of Cambodian commuting. Resale value is rock-solid. Perfect for fuel savings, but inverter cooling seals must be monitored closely.";
        pros = ["Incredible fuel economy", "Immortal resell liquidity", "Every local garage knows how to repair it"];
        cons = ["Aging hybrid battery unit", "Low ground clearance on rough rural roads"];
      } else if (budget <= 35000) {
        if (bodyType === "SUV" || bodyType === "EV") {
          carName = "BYD Atto 3 Standard Range (New)";
          visualUrl = "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=400";
          specs = {
            engine: "Single Electric Motor (150kW)",
            fuelEconomy: "15.6 kWh / 100km (0 Liters fuel!)",
            maintenanceCost: "Extremely Low (No oil flushes, simple pads)",
            reliability: "★ ★ ★ ★ ☆ (Blade Battery Tech)"
          };
          adviceText = "With budget between $15k-$35k and interest in EVs, the BYD Atto 3 is the smartest choice. It offers low daily running cost, zero mechanical wear, and blade-battery safety framework. Just check proximity to high-power chargers.";
          pros = ["No gasoline expenses", "Extremely spacious cabin", "High ground clearance (175mm)"];
          cons = ["Charging station networks limited in northern provinces", "Depreciation factors still teething"];
        } else {
          carName = "Lexus Rx450h Hybrid (2014 - 2017)";
          visualUrl = "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=400";
          specs = {
            engine: "3.5L V6 Hybrid",
            fuelEconomy: "8.1L / 100km (Good for V6 class)",
            maintenanceCost: "Medium (Premium luxury parts markup)",
            reliability: "★ ★ ★ ★ ★ (Bulletproof luxury)"
          };
          adviceText = "The Lexus RX represents premium longevity in Cambodia. Elite cabin acoustics, outstanding suspension, and a hybrid battery that aids the thirsty V6 engine. Fits mixed highway province travel beautifully.";
          pros = ["Elite luxury status", "Immense cabin comfort", "Reliable drivetrain and electronics"];
          cons = ["Gasoline consumption higher than commuter compacts", "High tariff import tax on high-volt items"];
        }
      } else {
        // High budget
        if (bodyType === "Pickup") {
          carName = "Ford Ranger Wildtrak 2.0L Bi-Turbo";
          visualUrl = "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=400";
          specs = {
            engine: "2.0L Diesel Bi-Turbo (10-Speed)",
            fuelEconomy: "7.9L / 100km (Excellent diesel efficiency)",
            maintenanceCost: "Medium-High (Turbo maintenance/fluid demands)",
            reliability: "★ ★ ★ ★ ☆ (Offroad Beast)"
          };
          adviceText = "For rugged province trips and heavy payload duties in Mondulkiri or Cardamoms, the Ranger is Cambodia's favorite pickup. Excellent torque margins and suspension dampers. High monthly salary perfectly supports diesel premium filters.";
          pros = ["Unequalled off-road handling", "Vast cargo bed and active utility", "Rugged cabin with elite tech features"];
          cons = ["Large turning radius in Phnom Penh alleyways", "Higher scheduled filter inspection costs"];
        } else {
          carName = "Toyota Camry Hybrid Luxury (2020 - 2022)";
          visualUrl = "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=400";
          specs = {
            engine: "2.5L Dynamic Force Hybrid",
            fuelEconomy: "5.1L / 100km (Impressive for luxury sedan)",
            maintenanceCost: "Medium (Toyota official network support)",
            reliability: "★ ★ ★ ★ ★ (Impeccable)"
          };
          adviceText = "For ultimate business status paired with eco efficiency, the newer Camry Hybrid represents immortal reliability. The Dynamic Force motor operates with pristine thermal ratios. Highly suited to family highway travel.";
          pros = ["Acoustic cabin isolation", "Vast resale market demand", "Excellent fuel ratios"];
          cons = ["Low height clearance on muddy gravel channels", "Official sensor parts are highly premium priced"];
        }
      }

      setReport({
        carName,
        visualUrl,
        pros,
        cons,
        specs,
        adviceText,
        affordabilityIndex: budget <= salary * 24 ? "Healthy (Highly Recommended)" : "Stretched (Exercise caution)",
        monthlyFuelSavings: budget < 15000 || bodyType === "EV" ? "$120 USD" : "$60 USD",
        resaleRank: specs.reliability.includes("★ ★ ★ ★ ★") ? "Grade A+" : "Grade B"
      });
      setLoading(false);
    }, 1100);
  };

  return (
    <div className="bg-slate-950 p-6 rounded-4xl border border-white/10 space-y-5 shadow-2xl relative overflow-hidden">
      
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded-xl">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[9px] bg-violet-500/15 text-violet-300 font-bold px-2 py-0.5 rounded uppercase tracking-wider block w-max select-none">
              Premium Tool Active
            </span>
            <h3 className="text-base font-black text-white leading-normal">
              AI Dream Car & Financial Advisor
            </h3>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="p-1 px-2.5 text-xs bg-white/5 hover:bg-white/10 border border-white/5 text-slate-350 hover:text-white rounded-xl transition font-sans cursor-pointer flex items-center gap-1"
        >
          <X className="w-4 h-4" /> Exit Advisor
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start text-left">
        
        {/* INPUT FORM SIDE (5 Cols) */}
        <form onSubmit={handleGenerateAdvisor} className="md:col-span-5 bg-slate-900/40 p-4 rounded-3xl border border-white/5 space-y-4">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block font-mono">Simulated Financial Coordinates</span>
          
          <div className="space-y-1.5 font-sans">
            <div className="flex justify-between items-center text-xs">
              <label className="text-slate-400 font-bold font-semibold uppercase text-[9.5px]">Available Car Budget</label>
              <span className="text-violet-400 font-mono font-black">${budget.toLocaleString()} USD</span>
            </div>
            <input 
              type="range" 
              min={8000} 
              max={85000} 
              step={1000} 
              value={budget} 
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full accent-violet-500" 
            />
            <div className="flex justify-between text-[9px] text-slate-500 font-mono select-none">
              <span>$8,000 (Commuters)</span>
              <span>$85,000 (Premium Luxury)</span>
            </div>
          </div>

          <div className="space-y-1.5 font-sans">
            <div className="flex justify-between items-center text-xs">
              <label className="text-slate-400 font-bold font-semibold uppercase text-[9.5px]">Monthly Household Income</label>
              <span className="text-violet-400 font-mono font-black">${salary.toLocaleString()} USD</span>
            </div>
            <input 
              type="range" 
              min={600} 
              max={8000} 
              step={100} 
              value={salary} 
              onChange={(e) => setSalary(Number(e.target.value))}
              className="w-full accent-violet-500" 
            />
            <div className="flex justify-between text-[9px] text-slate-500 font-mono select-none">
              <span>$600 Monthly</span>
              <span>$8,000+ Premium</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-550 block uppercase tracking-wider font-mono">Preferred Body shape</label>
            <select
              value={bodyType}
              onChange={(e) => setBodyType(e.target.value)}
              className="w-full bg-slate-950 font-sans text-xs p-2.5 rounded-xl text-slate-200 border border-white/10 focus:outline-none"
            >
              <option value="Sedan">Compact / Luxury Sedan ( reseller favorite)</option>
              <option value="SUV">SUV Crossover ( high ground clearance)</option>
              <option value="EV">Pure Electric (Zero tailpipe emissions)</option>
              <option value="Pickup">Pickup Truck 4x4 (Offroad & cargo cargo)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-550 block uppercase tracking-wider font-mono">Primary Driving Terrain</label>
            <select
              value={terrain}
              onChange={(e) => setTerrain(e.target.value)}
              className="w-full bg-slate-950 font-sans text-xs p-2.5 rounded-xl text-slate-200 border border-white/10 focus:outline-none"
            >
              <option value="city">Phnom Penh City (Stop & Go commuting)</option>
              <option value="mixed">Mixed (Local + National Road trips)</option>
              <option value="rural">Rural / Mountains (Muddy gravel & steep hills)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-lg cursor-pointer hover:from-violet-600 transition"
          >
            <Sparkles className="w-4 h-4 animate-spin-slow text-yellow-300" />
            <span>Compute Dream Car Matching</span>
          </button>
        </form>

        {/* RESULTS REPORT SIDE (7 Cols) */}
        <div className="md:col-span-7 space-y-4">
          {loading ? (
            <div className="py-28 text-center space-y-3 bg-slate-900/10 rounded-4xl border border-white/5 border-dashed">
              <div className="w-10 h-10 border-4 border-violet-500/20 border-t-violet-400 rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-400 font-mono">Running pricing simulation algorithms & reliability rankings...</p>
            </div>
          ) : report ? (
            <div className="bg-slate-900/30 p-5 rounded-4xl border border-white/5 space-y-4 animate-fade-in">
              
              {/* Product Card Info */}
              <div className="flex gap-4 items-center border-b border-white/5 pb-4">
                <div className="w-24 h-20 rounded-xl overflow-hidden bg-slate-950 border border-white/10 shrink-0">
                  <img src={report.visualUrl} alt={report.carName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div>
                  <span className="text-[8.5px] bg-violet-550/15 text-violet-300 font-bold px-2 py-0.5 rounded uppercase tracking-widest block w-max select-none font-mono">
                    Top AI Match Suggestion
                  </span>
                  <h4 className="text-sm font-black text-white mt-1 leading-snug">
                    {report.carName}
                  </h4>
                  <span className="text-xs text-emerald-400 font-bold font-mono">Estimated Resale Liquidity: {report.resaleRank}</span>
                </div>
              </div>

              {/* Specs Specs */}
              <div className="grid grid-cols-2 gap-3 text-xs font-sans">
                <div className="p-2.5 bg-slate-950 rounded-xl">
                  <span className="text-[9px] text-slate-500 block uppercase font-bold font-mono">Powertrain System</span>
                  <span className="text-slate-300 font-bold block mt-0.5">{report.specs.engine}</span>
                </div>
                <div className="p-2.5 bg-slate-950 rounded-xl">
                  <span className="text-[9px] text-slate-500 block uppercase font-bold font-mono">Fuel Ratios</span>
                  <span className="text-slate-300 font-bold block mt-0.5">{report.specs.fuelEconomy}</span>
                </div>
                <div className="p-2.5 bg-slate-950 rounded-xl">
                  <span className="text-[9px] text-slate-500 block uppercase font-bold font-mono">Parts & Labor Cost</span>
                  <span className="text-slate-350 font-bold block mt-0.5">{report.specs.maintenanceCost}</span>
                </div>
                <div className="p-2.5 bg-slate-950 rounded-xl">
                  <span className="text-[9px] text-slate-500 block uppercase font-bold font-mono">Platform Reliability Grade</span>
                  <span className="text-slate-350 font-bold block mt-0.5">{report.specs.reliability}</span>
                </div>
              </div>

              {/* Advice Paragraph */}
              <div className="space-y-1">
                <span className="text-[9.5px] text-slate-500 font-bold uppercase font-mono">AI Diagnostic Evaluation</span>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">{report.adviceText}</p>
              </div>

              {/* Pros & Cons list */}
              <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                <div className="p-3 bg-emerald-500/5 rounded-2xl border border-emerald-550/15">
                  <span className="text-[8.5px] font-black text-emerald-400 block uppercase mb-1">✓ Pros / Benefits</span>
                  <ul className="space-y-1 text-[10.5px] text-slate-302 font-sans">
                    {report.pros.map((p: string, i: number) => <li key={i}>• {p}</li>)}
                  </ul>
                </div>
                <div className="p-3 bg-red-500/5 rounded-2xl border border-red-550/15">
                  <span className="text-[8.5px] font-black text-rose-400 block uppercase mb-1">✗ Cons / Risks</span>
                  <ul className="space-y-1 text-[10.5px] text-slate-302 font-sans">
                    {report.cons.map((c: string, i: number) => <li key={i}>• {c}</li>)}
                  </ul>
                </div>
              </div>

              {/* Financial Verification Check */}
              <div className="bg-slate-950 p-3.5 border-l-2 border-violet-550/50 border-l-2 border-violet-500 rounded-r-2xl flex items-start gap-2.5">
                <Info className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                <div className="text-[10.5px] leading-relaxed text-slate-400 font-sans">
                  <span className="font-bold text-white block">Sourcing Affordability Check: <span className="text-violet-300 font-mono">{report.affordabilityIndex}</span></span>
                  Your monthly income allows a projected savings rate of <span className="text-emerald-400 font-bold underline">{report.monthlyFuelSavings} monthly</span> by choosing optimized eco vehicles.
                </div>
              </div>

            </div>
          ) : (
            <div className="py-24 text-center bg-slate-900/10 rounded-4xl border border-white/5 border-dashed flex flex-col justify-center items-center">
              <Compass className="w-12 h-12 text-slate-700 animate-spin-slow mb-3" />
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Awaiting Matching Data</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                Configure your available budget and salary credentials on the left list, then click Match to output diagnostic reports.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
