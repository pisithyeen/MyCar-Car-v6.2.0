/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from "react";
import { 
  Sparkles, 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle, 
  Car, 
  DollarSign, 
  MapPin, 
  Compass, 
  Briefcase, 
  TrendingUp, 
  Calendar, 
  ShieldAlert, 
  AlertCircle,
  FileText,
  Clock,
  User,
  Fuel,
  Printer,
  ChevronRight,
  RefreshCw,
  Search,
  Cpu,
  Percent,
  Activity,
  ArrowRight,
  TrendingDown,
  Wrench,
  Info,
  ChevronDown,
  ChevronUp,
  Sliders
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from "recharts";

interface CarOption {
  label: string;
  brand: string;
  model: string;
  yearRange: string;
  estimatedPrice: string;
  fuelEfficiency: string;
  fitExplanation: string;
  riskRating: "Low" | "Medium" | "High";
  maintenanceCostRating: "Low" | "Medium" | "High";
  sparePartAvailability: "Excellent" | "Good" | "Fair" | "Poor";
}

interface AdvisorResult {
  summary: string;
  affordabilityScore: number;
  recommendedBudgetMin: number;
  recommendedBudgetMax: number;
  safeMonthlySpendingLimit: number;
  estimatedMonthlyOwnershipCost: number;
  recommendedCarType: string;
  options: CarOption[];
  newVsUsedRecommendation: string;
  fuelTypeRecommendation: string;
  longTermOwnershipAdvice: string;
  maintenanceCostWarning: string;
  buyingTimingSuggestion: string;
  prePurchaseInspectionChecklist: string[];
  finalRecommendation: string;
  disclaimer: string;
}

export default function AIDreamCarAdvisor() {
  // --- STATE DECLARATIONS ---
  
  // 1. Core Vehicle & Loan Inputs
  const [carPrice, setCarPrice] = useState<number>(19600);
  const [downPayment, setDownPayment] = useState<number>(3920);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [loanTermYears, setLoanTermYears] = useState<number>(10);
  const [interestRate, setInterestRate] = useState<number>(8);

  // 2. Income & Household Inputs
  const [monthlySalary, setMonthlySalary] = useState<number>(1500);
  const [otherIncome, setOtherIncome] = useState<number>(300);
  const [monthlyExpense, setMonthlyExpense] = useState<number>(700);
  const [currentSavings, setCurrentSavings] = useState<number>(5000);
  const [currentDebt, setCurrentDebt] = useState<number>(200);

  // 3. Estimated Running Outlays
  const [fuelCost, setFuelCost] = useState<number>(120);
  const [insuranceCost, setInsuranceCost] = useState<number>(30);
  const [maintenanceCost, setMaintenanceCost] = useState<number>(50);

  // 4. Cambodia-Specific Parameters
  const [roadCondition, setRoadCondition] = useState<string>("floods"); // paved | rural | floods
  const [partsAvailability, setPartsAvailability] = useState<string>("toyota"); // toyota (high) | hybrid (med) | exotic (low)
  const [evChargingStatus, setEvChargingStatus] = useState<string>("limited"); // good | limited | none
  const [provinceTrips, setProvinceTrips] = useState<string>("monthly"); // weekly | monthly | rarely
  const [familySize, setFamilySize] = useState<number>(4);
  const [brandSelection, setBrandSelection] = useState<string>("Toyota Prius");

  // 5. Interface UI States
  const [isAmortizationOpen, setIsAmortizationOpen] = useState<boolean>(false);
  const [activePreset, setActivePreset] = useState<string>("commuter");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AdvisorResult | null>(null);

  // --- PRESET LOADER ---
  const loadPreset = (presetType: "commuter" | "cargo" | "family") => {
    setActivePreset(presetType);
    if (presetType === "commuter") {
      setCarPrice(19600);
      setDownPayment(3920);
      setDownPaymentPercent(20);
      setLoanTermYears(10);
      setInterestRate(8);
      setMonthlySalary(1500);
      setOtherIncome(300);
      setMonthlyExpense(700);
      setCurrentSavings(5000);
      setCurrentDebt(200);
      setFuelCost(120);
      setInsuranceCost(30);
      setMaintenanceCost(50);
      setRoadCondition("floods");
      setPartsAvailability("toyota");
      setEvChargingStatus("limited");
      setProvinceTrips("monthly");
      setFamilySize(4);
      setBrandSelection("Toyota Prius Gen 3");
    } else if (presetType === "cargo") {
      setCarPrice(34000);
      setDownPayment(10200);
      setDownPaymentPercent(30);
      setLoanTermYears(5);
      setInterestRate(7.5);
      setMonthlySalary(2500);
      setOtherIncome(800);
      setMonthlyExpense(1200);
      setCurrentSavings(15000);
      setCurrentDebt(400);
      setFuelCost(250);
      setInsuranceCost(60);
      setMaintenanceCost(80);
      setRoadCondition("rural");
      setPartsAvailability("toyota");
      setEvChargingStatus("none");
      setProvinceTrips("weekly");
      setFamilySize(5);
      setBrandSelection("Ford Ranger Wildtrak");
    } else if (presetType === "family") {
      setCarPrice(28000);
      setDownPayment(5600);
      setDownPaymentPercent(20);
      setLoanTermYears(7);
      setInterestRate(8.5);
      setMonthlySalary(1800);
      setOtherIncome(200);
      setMonthlyExpense(900);
      setCurrentSavings(8000);
      setCurrentDebt(100);
      setFuelCost(160);
      setInsuranceCost(45);
      setMaintenanceCost(65);
      setRoadCondition("paved");
      setPartsAvailability("hybrid");
      setEvChargingStatus("limited");
      setProvinceTrips("monthly");
      setFamilySize(6);
      setBrandSelection("Lexus RX350 / Highlander");
    }
    // Reset AI report when switching presets to maintain consistency
    setResult(null);
    setError(null);
  };

  // Safe initialize default preset once
  useEffect(() => {
    loadPreset("commuter");
  }, []);

  // --- LOADER LINKING PARAMETERS ---
  // If price or percent changes, sync amount
  const handlePriceChange = (val: number) => {
    setCarPrice(val);
    const amt = Math.round(val * (downPaymentPercent / 100));
    setDownPayment(amt);
  };

  const handlePercentChange = (val: number) => {
    setDownPaymentPercent(val);
    const amt = Math.round(carPrice * (val / 100));
    setDownPayment(amt);
  };

  const handleDownPaymentChange = (val: number) => {
    setDownPayment(val);
    if (carPrice > 0) {
      const pct = Math.min(100, Math.round((val / carPrice) * 100));
      setDownPaymentPercent(pct);
    }
  };

  // --- PHYSICAL FINANCIAL CALCULATIONS ---
  const loanAmount = useMemo(() => {
    return Math.max(0, carPrice - downPayment);
  }, [carPrice, downPayment]);

  const monthlyRepayment = useMemo(() => {
    const P = loanAmount;
    const r = interestRate / 12 / 100;
    const n = loanTermYears * 12;
    if (P <= 0) return 0;
    if (r === 0) return P / n;
    return (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  }, [loanAmount, interestRate, loanTermYears]);

  const totalRepayment = useMemo(() => {
    return monthlyRepayment * (loanTermYears * 12);
  }, [monthlyRepayment, loanTermYears]);

  const totalInterest = useMemo(() => {
    return Math.max(0, totalRepayment - loanAmount);
  }, [totalRepayment, loanAmount]);

  const totalMonthlyOwnershipCost = useMemo(() => {
    return monthlyRepayment + fuelCost + insuranceCost + maintenanceCost;
  }, [monthlyRepayment, fuelCost, insuranceCost, maintenanceCost]);

  const totalCombinedIncome = useMemo(() => {
    return monthlySalary + otherIncome;
  }, [monthlySalary, otherIncome]);

  const incomePercentageUsed = useMemo(() => {
    if (totalCombinedIncome <= 0) return 0;
    return (totalMonthlyOwnershipCost / totalCombinedIncome) * 100;
  }, [totalMonthlyOwnershipCost, totalCombinedIncome]);

  // --- DYNAMIC AFFORDABILITY SCORE (0 to 100) & RISK LEVEL ---
  const dynamicAnalyses = useMemo(() => {
    let score = 100;
    const reasons: string[] = [];

    // 1. Debt to Income Ratio with car (Standard 36% rule for low risk, 45% medium risk)
    const totalBills = monthlyExpense + currentDebt + totalMonthlyOwnershipCost;
    const outgoingPercentage = totalCombinedIncome > 0 ? (totalBills / totalCombinedIncome) * 100 : 100;
    const ownershipToSalaryRatio = totalCombinedIncome > 0 ? (totalMonthlyOwnershipCost / totalCombinedIncome) * 100 : 100;

    if (ownershipToSalaryRatio > 40) {
      score -= 35;
      reasons.push("Monthly car running cost is extremely high relative to salary (over 40%).");
    } else if (ownershipToSalaryRatio > 25) {
      score -= 20;
      reasons.push("Moderate strain on finances. Car cost absorbs more than 25% of absolute income.");
    } else {
      score += 5; // positive incentive
    }

    if (outgoingPercentage > 75) {
      score -= 25;
      reasons.push("High total living expenses. Very thin monthly buffer remains.");
    } else if (outgoingPercentage > 55) {
      score -= 12;
      reasons.push("Decent cash flow but total expenses exceed 55% of your combined salary.");
    }

    // 2. Down Payment Cushion
    if (downPaymentPercent < 15) {
      score -= 15;
      reasons.push("Small down payment triggers a larger bank principal and heavy compounding interest.");
    } else if (downPaymentPercent >= 30) {
      score += 10;
    }

    // 3. Emergency cushion check (savings relative to ownership)
    const normalSurvivalCushion = livingExpenseSurvivalMonths(currentSavings, monthlyExpense);
    if (normalSurvivalCushion < 3) {
      score -= 15;
      reasons.push("Savings pool offers less than 3 months of emergency cover.");
    } else if (normalSurvivalCushion >= 6) {
      score += 10;
    }

    // Bind score limit
    const finalScore = Math.max(0, Math.min(100, score));

    // Map to risk profile
    let riskLevel: "Safe" | "Moderate" | "Risky" | "Not Recommended" = "Safe";
    let riskColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    if (finalScore >= 80) {
      riskLevel = "Safe";
      riskColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    } else if (finalScore >= 60) {
      riskLevel = "Moderate";
      riskColor = "text-amber-400 bg-amber-500/10 border-amber-500/20";
    } else if (finalScore >= 40) {
      riskLevel = "Risky";
      riskColor = "text-orange-400 bg-orange-500/10 border-orange-500/20";
    } else {
      riskLevel = "Not Recommended";
      riskColor = "text-rose-400 bg-rose-500/10 border-rose-500/20";
    }

    return {
      score: finalScore,
      riskLevel,
      riskColor,
      reasons,
      totalBills,
      outgoingPercentage
    };
  }, [
    totalMonthlyOwnershipCost,
    totalCombinedIncome,
    monthlyExpense,
    currentDebt,
    downPaymentPercent,
    currentSavings
  ]);

  function livingExpenseSurvivalMonths(savings: number, expense: number) {
    if (expense <= 0) return 99;
    return savings / expense;
  }

  // --- AMORTIZATION TABLE COMPILER ---
  const amortizationSchedule = useMemo(() => {
    const list = [];
    let balance = loanAmount;
    const monthlyRate = interestRate / 12 / 100;
    const totalMonths = loanTermYears * 12;

    for (let m = 1; m <= totalMonths; m++) {
      const interestPaid = balance * monthlyRate;
      const principalPaid = monthlyRepayment - interestPaid;
      const oldBalance = balance;
      balance = Math.max(0, balance - principalPaid);

      // Only push first 12 months individually, then key milestones to keep state footprint efficient
      if (m <= 12 || m % 12 === 0 || m === totalMonths) {
        list.push({
          month: m,
          beginningBalance: Math.round(oldBalance),
          principal: Math.round(principalPaid),
          interest: Math.round(interestPaid),
          endingBalance: Math.round(balance)
        });
      }
    }
    return list;
  }, [loanAmount, interestRate, loanTermYears, monthlyRepayment]);

  // --- COMPARE DOCK LOAN SCENARIOS ---
  const compareScenarios = useMemo(() => {
    // Scenario 1: Standard 30% Down option (recalculated)
    const dp30_amount = Math.round(carPrice * 0.3);
    const loan30_amount = Math.max(0, carPrice - dp30_amount);
    const r = interestRate / 12 / 100;
    const n = loanTermYears * 12;
    const rep30 = r > 0 ? (loan30_amount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : loan30_amount / n;

    // Scenario 2: Shorter Term option (e.g. 5 Years or half current)
    const altTerm = loanTermYears > 5 ? 5 : 3;
    const n_alt = altTerm * 12;
    const repAltTerm = r > 0 ? (loanAmount * r * Math.pow(1 + r, n_alt)) / (Math.pow(1 + r, n_alt) - 1) : loanAmount / n_alt;

    // Scenario 3: Cheaper Car Alternative (35% cheaper)
    const cheapPrice = Math.round(carPrice * 0.65);
    const cheapDP = Math.round(cheapPrice * (downPaymentPercent / 100));
    const cheapLoan = Math.max(0, cheapPrice - cheapDP);
    const repCheap = r > 0 ? (cheapLoan * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : cheapLoan / n;

    return [
      {
        id: "high_dp",
        title: "Boost to 30% Down",
        desc: "Increases down payment, lowering bank debt premium.",
        price: carPrice,
        downPayment: dp30_amount,
        downPaymentPct: 30,
        termYears: loanTermYears,
        interest: interestRate,
        monthlyRepayment: Math.round(rep30),
        totalInterest: Math.round((rep30 * n) - loan30_amount),
        status: "Increases SafetyScore by ~12 pts"
      },
      {
        id: "short_term",
        title: `Hurry with ${altTerm}-Yr Term`,
        desc: "Saves massive interest overhead rapidly, but spikes immediate monthly demands.",
        price: carPrice,
        downPayment: downPayment,
        downPaymentPct: downPaymentPercent,
        termYears: altTerm,
        interest: interestRate,
        monthlyRepayment: Math.round(repAltTerm),
        totalInterest: Math.round((repAltTerm * n_alt) - loanAmount),
        status: "Reduces lifetime debt bleed"
      },
      {
        id: "cheaper_car",
        title: "Used Alternative (-35% Price)",
        desc: "A prudent, economical Cambodian choice like moving a tier down.",
        price: cheapPrice,
        downPayment: cheapDP,
        downPaymentPct: downPaymentPercent,
        termYears: loanTermYears,
        interest: interestRate,
        monthlyRepayment: Math.round(repCheap),
        totalInterest: Math.round((repCheap * n) - cheapLoan),
        status: "Absolute highest safety level"
      }
    ];
  }, [carPrice, downPayment, downPaymentPercent, loanTermYears, interestRate, loanAmount]);

  const applyScenario = (sc: any) => {
    // Smooth transition updates
    setCarPrice(sc.price);
    setDownPayment(sc.downPayment);
    setDownPaymentPercent(sc.downPaymentPct);
    setLoanTermYears(sc.termYears);
    setInterestRate(sc.interest);
    // Reset AI outputs to trigger review
    setResult(null);
  };

  // --- RECHARTS PIE CHART PARSING ---
  const pieChartData = useMemo(() => {
    return [
      { name: "Monthly Bank Principal & Interest", value: Math.round(monthlyRepayment), color: "#6366f1" },
      { name: "Estimated Fuels & Charging", value: fuelCost, color: "#eab308" },
      { name: "Preventative Maintenance Set-aside", value: maintenanceCost, color: "#10b981" },
      { name: "Insurance & Licensing Duties", value: insuranceCost, color: "#38bdf8" }
    ];
  }, [monthlyRepayment, fuelCost, maintenanceCost, insuranceCost]);

  // --- DYNAMIC EXPERT ADVICE BY LOCAL RULE ENGINE ---
  const simulatedReportAdvice = useMemo(() => {
    const { score } = dynamicAnalyses;
    let recommendation = "";
    let actionSuggestion = "";
    let sparePartsDetails = "";
    let floodMonsoonRisk = "";
    let evChargingFeasibility = "";

    // 1. Core affordability limits
    if (score >= 80) {
      recommendation = "This vehicle aligns beautifully with your household cash reserves. Your monthly commitments represent a safe percentage of net earnings, giving you a safe buffer to address maintenance or unexpected repairs.";
      actionSuggestion = "Buy confidently. We recommend keeping at least a $1,000 cash reserve specifically for seasonal parts replacement.";
    } else if (score >= 60) {
      recommendation = "Car ownership is affordable but triggers minor monthly limits. The base bank payment is fine, but combined with fuels, fluid changeouts, and registration, it leaves tight spacing for extra savings.";
      actionSuggestion = "Wait to build up 30-35% down payment first, or swap to a slightly older model year (saving $3,000 upfront) to clear an absolute comfort buffer.";
    } else if (score >= 40) {
      recommendation = "Elevated danger. Taking this bank loan will allocate over 30% of your total household income strictly to the car. Any emergency home bill, business dip, or part failure will instantly put you in financial distress.";
      actionSuggestion = "Do not purchase at these terms. Choose a vehicle priced 35% lower (like a Gen 2 Prius or RX300) or secure a larger downpayment pool first.";
    } else {
      recommendation = "Severe financial danger. Your outgoings structurally exceed healthy standards. Proceeding with this microfinance bank loan poses a high danger of prompt repossession or extreme luxury debt locks.";
      actionSuggestion = "Do not purchase. Re-budget for a simpler transport alternative or pool savings for 12 months to avoid loan compounding.";
    }

    // 2. Cambodia parts advisor
    if (partsAvailability === "toyota") {
      sparePartsDetails = "Outstanding choice. Toyota, Lexus, and Ford Ranger parts are highly accessible across every neighborhood garage in Phnom Penh and along National Highway 1-6. Repair turnarounds will be fast and cheap.";
    } else if (partsAvailability === "hybrid") {
      sparePartsDetails = "Good parts availability, but hybrid system elements (Inverters, high-voltage traction batteries) require specialized micro-technicians. Prius battery cooling fan cleaning is essential during dry, dusty seasons.";
    } else {
      sparePartsDetails = "Fairly high parts risk. Rare imported vehicles, EVs, or niche Chinese models suffer from lack of provincial salvage inventory. You may wait weeks for parts to ship from China/Thailand, spiking costs.";
    }

    // 3. Monsoon & road terrain advice
    if (roadCondition === "floods") {
      floodMonsoonRisk = "Monsoon Heavy Warning: Phnom Penh's seasonal water logging poses severe threats to hybrid battery systems mounted in vehicle floors. Ensure your choice has high ground clearance or avoid driving through standing water exceeding tire midpoint.";
    } else if (roadCondition === "rural") {
      floodMonsoonRisk = "Provincial Highway Warning: Unpaved rural routes with severe deep potholes can accelerate bushing wear and suspension damage. Compact sedans will suffer. A sturdy SUV or Pickup with high-ground clearance is heavily suggested.";
    } else {
      floodMonsoonRisk = "Urban Paved Roads: Your commuting patterns look safe from complex path stresses. Maintain clean tires and check transmission fluids to prevent stop-and-go gridlock overheating.";
    }

    // 4. EV Charging availability in Cambodia
    if (evChargingStatus === "limited" && brandSelection.toLowerCase().includes("ev") || brandSelection.toLowerCase().includes("electric")) {
      evChargingFeasibility = "Electric Vehicle Note: Cambodia's country EV charging corridor is growing (Phnom Penh, Siem Reap, Kompong Cham, Sihanoukville) but highway segments still face wide gaps. Home charger installation is a mandatory prerequisite.";
    } else {
      evChargingFeasibility = "Standard internal combustion engines and hybrids offer comfortable range freedom without grid charger issues across provinces.";
    }

    return {
      recommendation,
      actionSuggestion,
      sparePartsDetails,
      floodMonsoonRisk,
      evChargingFeasibility
    };
  }, [dynamicAnalyses, partsAvailability, roadCondition, evChargingStatus, brandSelection]);

  // --- TRIGGER CALL TO SERVER-SIDE GEMINI API ROUTE ---
  const handleConsultGeminiAI = async () => {
    setLoading(true);
    setError(null);

    // Structure compliant payload mapping parameters perfectly
    const payload = {
      profile: {
        age: "30",
        job_title: "MyCar Care KH User Account",
        employment_type: "Full-time",
        monthly_salary: String(monthlySalary),
        extra_income: String(otherIncome),
        income_stability: "Stable",
        monthly_expense: String(monthlyExpense),
        current_savings: String(currentSavings),
        existing_debt: String(currentDebt),
        property_status: "Renting Apartment",
        down_payment: String(downPayment),
        buying_method: "Bank Loan / Instalment"
      },
      usage: {
        main_location: roadCondition === "rural" ? "Battambang & Rural Highway" : "Phnom Penh City",
        usage_type: provinceTrips === "weekly" ? "Weekend Adventure" : "Daily Commuting",
        weekly_distance: provinceTrips === "weekly" ? "250" : "120",
        passenger_need: String(familySize),
        cargo_need: "Medium",
        adventure_need: roadCondition === "floods" ? "High" : "Medium",
        city_driving_need: "High",
        long_distance_need: provinceTrips === "weekly" ? "High" : "Medium"
      },
      preference: {
        dream_car: brandSelection,
        preferred_brand: brandSelection.split(" ")[0] || "Any",
        body_type: familySize > 5 ? "SUV / Crossover" : "Hatchback / Sedan",
        fuel_type: brandSelection.toLowerCase().includes("hybrid") ? "Hybrid" : "Gasoline",
        new_or_used: "Used",
        ownership_period: "5 Years",
        new_car_owner: "Yes"
      }
    };

    try {
      const response = await fetch("/api/ai/car-advisor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Failed to consult Gemini Automotive Server");
      }

      const data: AdvisorResult = await response.json();
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError("Unable to synthesize customized AI report right now. Displaying high-fidelity local expert analysis report.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-6" id="can-i-afford-car-wrapper">
      {/* HEADER SECTION */}
      <div className="mb-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 mb-1.5 bg-indigo-500/10 px-3 py-1 rounded-full w-fit">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-semibold tracking-wide uppercase">AI Financial Intelligence</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">
            “Can I Afford This Car?”
          </h1>
          <p className="text-slate-400 mt-1 max-w-3xl text-sm">
            Make car ownership easier, safer, and 100% transparent. Calculate bank interest rates, monthly maintenance buffers, and monsoon fuel outlays before signing a commitment in Cambodia.
          </p>
        </div>

        {/* Dynamic Demos */}
        <div className="flex flex-wrap gap-2 text-xs">
          <button
            onClick={() => loadPreset("commuter")}
            className={`px-3 py-2 rounded-xl border transition flex items-center gap-1.5 cursor-pointer font-bold ${
              activePreset === "commuter" 
                ? "bg-sky-500 text-slate-950 border-sky-400" 
                : "bg-white/5 border-white/10 text-slate-350 hover:bg-white/10"
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> Commuter (Prius Hybrid)
          </button>
          <button
            onClick={() => loadPreset("cargo")}
            className={`px-3 py-2 rounded-xl border transition flex items-center gap-1.5 cursor-pointer font-bold ${
              activePreset === "cargo" 
                ? "bg-amber-500 text-slate-950 border-amber-400" 
                : "bg-white/5 border-white/10 text-slate-350 hover:bg-white/10"
            }`}
          >
            <Compass className="w-3.5 h-3.5" /> Provincial (Ford Ranger)
          </button>
          <button
            onClick={() => loadPreset("family")}
            className={`px-3 py-2 rounded-xl border transition flex items-center gap-1.5 cursor-pointer font-bold ${
              activePreset === "family" 
                ? "bg-emerald-500 text-slate-950 border-emerald-400" 
                : "bg-white/5 border-white/10 text-slate-350 hover:bg-white/10"
            }`}
          >
            <Car className="w-3.5 h-3.5" /> Large Family SUV (Lexus RX)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: ACTIVE INTERACTIVE INPUTS PANEL */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-white/5 p-5 shadow-xl space-y-6">
            
            {/* INPUT BLOCK 1: CAR & BANK PLAN */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-white/5 pb-2">
                <Car className="w-4 h-4 text-indigo-400" />
                <span>1. Dream Vehicle & Interest Rates</span>
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-450 mb-1">Brand & Model Name</label>
                  <input
                    type="text"
                    value={brandSelection}
                    onChange={(e) => setBrandSelection(e.target.value)}
                    className="w-full bg-slate-950 text-slate-200 text-xs border border-white/10 rounded-xl py-2 px-3 focus:outline-none focus:border-indigo-500 transition"
                    placeholder="e.g. Toyota Prius 2012"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-450 mb-1">Car Cash Price ($)</label>
                    <input
                      type="number"
                      value={carPrice}
                      onChange={(e) => handlePriceChange(Number(e.target.value))}
                      className="w-full bg-slate-950 text-slate-200 text-xs font-mono font-bold border border-white/10 rounded-xl py-2 px-3 focus:outline-none focus:border-indigo-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-450 mb-1">Interest Rate / Yr (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={interestRate}
                      onChange={(e) => setInterestRate(Number(e.target.value))}
                      className="w-full bg-slate-950 text-slate-200 text-xs font-mono font-bold border border-white/10 rounded-xl py-2 px-3 focus:outline-none focus:border-indigo-500 transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-450 mb-1">Down Payment Amt ($)</label>
                    <input
                      type="number"
                      value={downPayment}
                      onChange={(e) => handleDownPaymentChange(Number(e.target.value))}
                      className="w-full bg-slate-950 text-slate-350 text-xs font-mono border border-white/10 rounded-xl py-2 px-3 focus:outline-none focus:border-indigo-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-450 mb-1">Down Payment (%)</label>
                    <select
                      value={downPaymentPercent}
                      onChange={(e) => handlePercentChange(Number(e.target.value))}
                      className="w-full bg-slate-950 text-slate-350 text-xs border border-white/10 rounded-xl py-2 px-3 focus:outline-none focus:border-indigo-500 transition h-[34px]"
                    >
                      <option value={10}>10% (High Debt)</option>
                      <option value={20}>20% (Standard)</option>
                      <option value={30}>30% (Recommended)</option>
                      <option value={40}>40% (Prudent)</option>
                      <option value={50}>50% (Strong Cushion)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-450 mb-1">
                    <span>Loan Duration:</span>
                    <span className="font-extrabold text-indigo-400 font-mono">{loanTermYears} Years ({loanTermYears * 12} Months)</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={loanTermYears}
                    onChange={(e) => setLoanTermYears(Number(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* INPUT BLOCK 2: INCOME & RUNNING RESERVES */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-white/5 pb-2">
                <Briefcase className="w-4 h-4 text-emerald-400" />
                <span>2. My Monthly Wallet Dynamics</span>
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-450 mb-1">Monthly Salary ($)</label>
                  <input
                    type="number"
                    value={monthlySalary}
                    onChange={(e) => setMonthlySalary(Number(e.target.value))}
                    className="w-full bg-slate-950 text-slate-200 text-xs font-mono border border-white/10 rounded-xl py-2 px-3 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-450 mb-1">Other Income ($)</label>
                  <input
                    type="number"
                    value={otherIncome}
                    onChange={(e) => setOtherIncome(Number(e.target.value))}
                    className="w-full bg-slate-950 text-slate-200 text-xs font-mono border border-white/10 rounded-xl py-2 px-3 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <label className="block text-xs text-slate-450 mb-1">Family Expenses</label>
                  <input
                    type="number"
                    value={monthlyExpense}
                    onChange={(e) => setMonthlyExpense(Number(e.target.value))}
                    className="w-full bg-slate-950 text-slate-200 text-xs font-mono border border-white/10 rounded-xl py-2 px-2 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs text-slate-450 mb-1">Current Debts</label>
                  <input
                    type="number"
                    value={currentDebt}
                    onChange={(e) => setCurrentDebt(Number(e.target.value))}
                    className="w-full bg-slate-950 text-slate-200 text-xs font-mono border border-white/10 rounded-xl py-2 px-2 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs text-slate-450 mb-1">Reserve Savings</label>
                  <input
                    type="number"
                    value={currentSavings}
                    onChange={(e) => setCurrentSavings(Number(e.target.value))}
                    className="w-full bg-slate-950 text-slate-200 text-xs font-mono border border-white/10 rounded-xl py-2 px-2 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              {/* ESTIMATED CAR RUNNING OUTLAYS */}
              <div className="p-3 bg-slate-950/40 rounded-xl border border-white/3 space-y-3">
                <span className="text-[10px] text-slate-450 uppercase font-black block tracking-wider">Estimated Running Costs</span>
                
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">Est. Fuel ($)</label>
                    <input
                      type="number"
                      value={fuelCost}
                      onChange={(e) => setFuelCost(Number(e.target.value))}
                      className="w-full bg-slate-950 text-yellow-400 font-mono text-[11px] border border-white/10 rounded-lg py-1 px-1.5 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">Insurance/Tax ($)</label>
                    <input
                      type="number"
                      value={insuranceCost}
                      onChange={(e) => setInsuranceCost(Number(e.target.value))}
                      className="w-full bg-slate-950 text-sky-400 font-mono text-[11px] border border-white/10 rounded-lg py-1 px-1.5 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">Maintenance ($)</label>
                    <input
                      type="number"
                      value={maintenanceCost}
                      onChange={(e) => setMaintenanceCost(Number(e.target.value))}
                      className="w-full bg-slate-950 text-emerald-400 font-mono text-[11px] border border-white/10 rounded-lg py-1 px-1.5 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* INPUT BLOCK 3: CAMBODIAN CORRIDOR FACTORS */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-white/5 pb-2">
                <Compass className="w-4 h-4 text-emerald-400" />
                <span>3. Cambodia Terrain & Usage Filters</span>
              </h3>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-xs text-slate-450 mb-1">Road Condition Check</label>
                    <select
                      value={roadCondition}
                      onChange={(e) => setRoadCondition(e.target.value)}
                      className="w-full bg-slate-950 text-slate-350 border border-white/10 rounded-xl py-2 px-3 focus:outline-none"
                    >
                      <option value="floods">Phnom Penh Wet Floods</option>
                      <option value="rural">Unpaved Rural Highways</option>
                      <option value="paved">Suburban Clean Paved</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs text-slate-450 mb-1">Spare Parts Supply</label>
                    <select
                      value={partsAvailability}
                      onChange={(e) => setPartsAvailability(e.target.value)}
                      className="w-full bg-slate-950 text-slate-350 border border-white/10 rounded-xl py-2 px-3 focus:outline-none"
                    >
                      <option value="toyota">High (Toyota / Lexus)</option>
                      <option value="hybrid">Medium (Common Hybrid)</option>
                      <option value="exotic">Low (Niche EVs / Exotic)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-xs text-slate-450 mb-1">EV Chargers Nearby</label>
                    <select
                      value={evChargingStatus}
                      onChange={(e) => setEvChargingStatus(e.target.value)}
                      className="w-full bg-slate-950 text-slate-350 border border-white/10 rounded-xl py-2 px-3 focus:outline-none"
                    >
                      <option value="none">None / Rare Wall plugs</option>
                      <option value="limited">Limited (Phnom Penh only)</option>
                      <option value="good">Good Network Range</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-450 mb-1">Family Car Seats</label>
                    <input
                      type="number"
                      value={familySize}
                      onChange={(e) => setFamilySize(Number(e.target.value))}
                      className="w-full bg-slate-950 text-slate-200 border border-white/10 rounded-xl py-2 px-3 focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* CALL GEMINI ACTION FOR AI ASSESSMENT */}
            <div className="space-y-2">
              <button
                onClick={handleConsultGeminiAI}
                disabled={loading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-pink-500 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg hover:shadow-indigo-500/20 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Analyzing with Gemini AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-slate-950" />
                    <span>Get Deep AI Affordability Report</span>
                  </>
                )}
              </button>
              
              <span className="text-[10px] text-slate-500 text-center block leading-relaxed uppercase tracking-wider">
                Utilizes Gemini 3.5-flash for diagnostic intelligence models.
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: AFFORDABILITY SCORE & DUAL ADVICE DOCK */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* LOAN SUMMARY CARDS & CIRCULAR PIE DISPLAY */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* COMPACT BENTO STATS GAUGE */}
            <div className="bg-slate-900/60 backdrop-blur-md border border-white/5 p-5 rounded-2xl shadow-xl flex flex-col justify-between">
              
              <div className="space-y-1.5">
                <span className="text-xs uppercase tracking-widest text-slate-400 font-extrabold block">Readiness Score</span>
                <div className="flex items-end gap-2.5">
                  <span className="text-5xl font-black font-mono tracking-tighter text-slate-100">
                    {dynamicAnalyses.score}
                  </span>
                  <span className="text-sm font-semibold text-slate-500 uppercase tracking-widest pb-1.5">/ 100</span>
                </div>
                <div className="pt-2">
                  <span className={`text-[10px] px-2.5 py-1 rounded-full border uppercase font-bold tracking-wider ${dynamicAnalyses.riskColor}`}>
                    {dynamicAnalyses.riskLevel} Risk Profile
                  </span>
                </div>
              </div>

              {/* PROGRESS BAR & CONSTRAINTS */}
              <div className="space-y-2 mt-5">
                <div className="h-2 w-full bg-slate-950 border border-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all duration-300" 
                    style={{ width: `${dynamicAnalyses.score}%` }}
                  />
                </div>
                
                {dynamicAnalyses.reasons.length > 0 ? (
                  <div className="space-y-1 text-[11px] leading-relaxed text-rose-350 text-rose-400">
                    <span className="font-bold uppercase tracking-wide block text-[10px] text-slate-400">Restraining factors DETECTED:</span>
                    {dynamicAnalyses.reasons.slice(0, 2).map((r, i) => (
                      <p key={i} className="flex items-start gap-1">
                        <span>•</span> <span>{r}</span>
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-emerald-400">
                    ★ Outstanding matching metrics. Safe and sustainable.
                  </p>
                )}
              </div>
            </div>

            {/* CIRCULAR MONTHLY CHARTS (RECHARTS) */}
            <div className="bg-slate-900/60 backdrop-blur-md border border-white/5 p-5 rounded-2xl shadow-xl space-y-2 flex flex-col items-center justify-center min-h-[220px]">
              <span className="text-xs uppercase font-extrabold text-slate-400 block tracking-wider self-start">Monthly Commitment Outlays</span>
              
              <div className="w-full h-36 relative flex items-center justify-center">
                <ResponsiveContainer width="95%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={41}
                      outerRadius={52}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(v) => `$${v}`} 
                      contentStyle={{ backgroundColor: "rgba(15, 23, 42, 0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", fontSize: "11px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Embedded dynamic text indicator */}
                <div className="absolute inset-x-0 inset-y-0 flex flex-col items-center justify-center pointer-events-none mt-1">
                  <span className="text-xl font-bold font-mono text-slate-100">${Math.round(totalMonthlyOwnershipCost)}/mo</span>
                  <span className="text-[9px] text-slate-500 uppercase tracking-widest leading-none">Total Ownership</span>
                </div>
              </div>

              {/* Mini Legend labels */}
              <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[9px] font-bold w-full pt-1">
                {pieChartData.map((lbl, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 truncate">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0 animate-pulse" style={{ backgroundColor: lbl.color }}></span>
                    <span className="text-slate-400 truncate text-[10px]">{lbl.name.split(" ").slice(1).join(" ")}:</span>
                    <span className="text-slate-200 font-mono text-[10px]">${lbl.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* TWO DUAL SUM CARDS BLOCK */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3.5 bg-slate-900/60 border border-white/5 rounded-xl leading-snug">
              <span className="text-[10px] text-slate-500 font-bold uppercase block tracking-wider">Loan Principal</span>
              <span className="text-xl font-mono font-bold text-slate-200">${loanAmount.toLocaleString()} USD</span>
              <span className="text-[9px] block text-slate-500 mt-1">Bank Liability Portfolio</span>
            </div>

            <div className="p-3.5 bg-slate-900/60 border border-white/5 rounded-xl leading-snug">
              <span className="text-[10px] text-slate-500 font-bold uppercase block tracking-wider">Compounded Interest</span>
              <span className="text-xl font-mono font-bold text-rose-400">${Math.round(totalInterest).toLocaleString()} USD</span>
              <span className="text-[9px] block text-slate-500 mt-1">Sunk Debt Premium Cost</span>
            </div>

            <div className="p-3.5 bg-slate-900/60 border border-white/5 rounded-xl leading-snug">
              <span className="text-[10px] text-slate-500 font-bold uppercase block tracking-wider">Monthly Repayment</span>
              <span className="text-xl font-mono font-bold text-sky-400">${Math.round(monthlyRepayment).toLocaleString()} USD</span>
              <span className="text-[9px] block text-slate-500 mt-1">Monthly Bank Installment</span>
            </div>

            <div className="p-3.5 bg-slate-900/60 border border-white/5 rounded-xl leading-snug">
              <span className="text-[10px] text-slate-500 font-bold uppercase block tracking-wider">% Of Combined Wallet</span>
              <span className="text-xl font-mono font-bold text-yellow-405 text-yellow-400">{Math.round(incomePercentageUsed)}%</span>
              <span className="text-[9px] block text-slate-500 mt-1">Total Ownership Ratio</span>
            </div>
          </div>

          {/* BRAND NEW SCENARIO COMPARISON MATRIX */}
          <div className="bg-slate-900/60 backdrop-blur-md border border-white/5 p-5 rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5 uppercase">
                <Sliders className="w-4 h-4 text-sky-400" />
                <span>Alternate Scenario comparisons Matrix</span>
              </h3>
              <span className="text-[10px] text-indigo-400 font-bold uppercase">Click any to Apply</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {compareScenarios.map((sc) => (
                <div
                  key={sc.id}
                  onClick={() => applyScenario(sc)}
                  className="bg-slate-950 hover:bg-white/5 border border-white/10 hover:border-sky-500/40 rounded-xl p-3.5 transition duration-250 cursor-pointer group flex flex-col justify-between"
                  title="Click to apply these terms directly to your main interactive outputs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-slate-100 group-hover:text-sky-400 transition">{sc.title}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-1 transition" />
                    </div>
                    <p className="text-[10px] text-slate-500 leading-normal">{sc.desc}</p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-white/5 space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-450">Monthly:</span>
                      <span className="font-mono font-bold text-sky-400">${sc.monthlyRepayment}/mo</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-450">Est. Interest:</span>
                      <span className="font-mono text-rose-450 text-rose-400">${sc.totalInterest.toLocaleString()}</span>
                    </div>
                    <div className="pt-1.5">
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 font-bold uppercase block text-center truncate">
                        {sc.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* DETAILED ADVICE VIEWPORTS: HYBRID RULE ENGINE AND OPTIONAL DEEP GEMINI REPORTS */}
          <div className="space-y-5">
            <div className="bg-slate-900/60 backdrop-blur-md border border-white/5 p-5 rounded-2xl shadow-xl space-y-4">
              
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-sky-400" />
                  <span>Interactive AI Advisor Report</span>
                </h3>

                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-pink-500 rounded-full animate-ping"></span>
                  <span className="text-[10px] text-slate-450 uppercase font-black">Live Advisor</span>
                </div>
              </div>

              {/* RENDER DYNAMIC RESULTS (Simulated rules with optional deep integrations) */}
              <div className="space-y-4 text-xs leading-relaxed text-slate-300">
                {result ? (
                  // FULL DEEP AI PORTAL REPORT RETURNED FROM THE LIVE SERVER DEPLOYED ENDPOINT
                  <div className="space-y-5">
                    <div className="p-3.5 bg-gradient-to-r from-sky-950/20 to-indigo-950/20 border border-indigo-500/20 rounded-xl">
                      <h4 className="text-xs font-bold text-sky-400 uppercase tracking-widest mb-1">Summary Overview</h4>
                      <p className="italic text-slate-100 pr-2">{result.summary}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {result.options.slice(0, 3).map((opt, idx) => (
                        <div key={idx} className="p-3 bg-slate-950 border border-white/5 rounded-xl space-y-2">
                          <span className="text-[10px] text-sky-400 font-extrabold uppercase bg-white/5 px-2 py-0.5 rounded block text-center">{opt.label}</span>
                          <span className="text-xs font-semibold text-slate-200 block">{opt.brand} {opt.model} ({opt.yearRange})</span>
                          <span className="text-[10px] text-slate-400 font-mono block">Mkt range: {opt.estimatedPrice}</span>
                          <p className="text-[10px] text-slate-400 leading-normal">{opt.fitExplanation}</p>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2 pt-2 border-t border-white/5">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-indigo-400">Custom Cambodia Maintenance Directives:</h4>
                      <p className="text-[11px] text-slate-400 font-medium leading-relaxed">{result.maintenanceCostWarning}</p>
                      
                      <h4 className="text-xs font-bold uppercase tracking-widest text-indigo-400 pt-2">Fuel Efficiency Breakdown:</h4>
                      <p className="text-[11px] text-slate-400 font-medium leading-relaxed">{result.fuelTypeRecommendation}</p>

                      <h4 className="text-xs font-bold uppercase tracking-widest text-indigo-400 pt-2 font-black">Pre-Purchase Check-box Checklist:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px] pt-1.5">
                        {result.prePurchaseInspectionChecklist.map((ch, idx) => (
                          <div key={idx} className="flex items-start gap-2 bg-slate-950 border border-white/3 p-2 rounded-lg">
                            <span className="text-emerald-400 font-bold">✓</span>
                            <span>{ch}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  // EXTREMELY POLISHED LIVE LOCAL ADVOCACY ENGINE (Renders instantly for flawless user speed)
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 bg-slate-950/60 p-4 rounded-xl border border-white/5">
                      <AlertCircle className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-slate-100 uppercase tracking-widest">Ownership Feasibility Score: {dynamicAnalyses.score}/100</h4>
                        <p className="text-[11.5px] text-slate-300 leading-relaxed font-sans">{simulatedReportAdvice.recommendation}</p>
                        <p className="text-[11px] font-extrabold text-emerald-400 pt-1">Action: {simulatedReportAdvice.actionSuggestion}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px]">
                      <div className="p-3 bg-slate-950/40 rounded-xl space-y-1.5 border border-white/3">
                        <span className="text-[10px] text-yellow-450 text-indigo-400 font-black uppercase tracking-wider block">Spare Parts Coverage</span>
                        <p className="text-slate-400 leading-normal">{simulatedReportAdvice.sparePartsDetails}</p>
                      </div>

                      <div className="p-3 bg-slate-950/40 rounded-xl space-y-1.5 border border-white/3">
                        <span className="text-[10px] text-rose-450 text-sky-400 font-black uppercase tracking-wider block">Flood & Monsoon Survival</span>
                        <p className="text-slate-400 leading-normal">{simulatedReportAdvice.floodMonsoonRisk}</p>
                      </div>
                    </div>

                    <div className="bg-slate-950/50 p-3 rounded-xl flex items-center justify-between text-[10px] border border-white/5 pr-4">
                      <span className="text-slate-400">Want custom recommendations for {brandSelection}? Trigger our deep AI report.</span>
                      <button 
                        onClick={handleConsultGeminiAI}
                        className="py-1 px-3 bg-indigo-500 hover:bg-indigo-600 text-slate-950 font-bold rounded transition ml-2 shrink-0 cursor-pointer"
                      >
                        Run AI Audit
                      </button>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] rounded-lg">
                    {error}
                  </div>
                )}
              </div>
            </div>

            {/* EXPANDABLE COLLAPSED MONTHLY AMORTIZATION LEDGER */}
            <div className="bg-slate-900/60 backdrop-blur-md border border-white/5 p-4 rounded-xl shadow-xl">
              <button 
                onClick={() => setIsAmortizationOpen(!isAmortizationOpen)}
                className="w-full flex items-center justify-between font-bold text-xs uppercase tracking-wider text-slate-300 focus:outline-none cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span>Amortization Ledger Schedule ({loanTermYears * 12} Months)</span>
                </div>
                {isAmortizationOpen ? <ChevronUp className="w-4.5 h-4.5" /> : <ChevronDown className="w-4.5 h-4.5" />}
              </button>

              <AnimatePresence>
                {isAmortizationOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mt-3"
                  >
                    <div className="max-h-72 overflow-y-auto pr-1 text-[11px] border-t border-white/5 pt-2 space-y-1 scrollbar-thin">
                      <table className="w-full text-left font-mono">
                        <thead>
                          <tr className="text-[10px] text-slate-500 border-b border-white/5 pb-1 uppercase tracking-wider">
                            <th className="py-1">Mo / Yr</th>
                            <th className="text-right">Beginning</th>
                            <th className="text-right">Principal</th>
                            <th className="text-right">Interest</th>
                            <th className="text-right">Ending Bal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {amortizationSchedule.map((row) => (
                            <tr key={row.month} className="border-b border-white/3 hover:bg-white/3 text-slate-350 py-1 font-medium select-none">
                              <td className="py-1">
                                {row.month % 12 === 0 ? `Yr ${row.month / 12} Milestone` : `Month ${row.month}`}
                              </td>
                              <td className="text-right">${row.beginningBalance.toLocaleString()}</td>
                              <td className="text-right text-emerald-400">${row.principal}</td>
                              <td className="text-right text-rose-400">${row.interest}</td>
                              <td className="text-right text-slate-200">${row.endingBalance.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* COMPREHENSIVE SECTOR DISCLAIMER AND EXPORT PRINTER */}
            <div className="flex items-center justify-between text-[11px] p-2 bg-slate-950/40 border border-white/5 rounded-xl">
              <span className="text-slate-500 italic">Pre-vetted diagnostics compiled by MyCar Care KH Financial Division.</span>
              <button 
                onClick={handlePrint}
                className="px-2.5 py-1 bg-white/5 border border-white/10 rounded text-[10px] font-bold text-slate-350 hover:text-white transition flex items-center gap-1 cursor-pointer"
              >
                <Printer className="w-3 h-3" /> PRINT CARD
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
