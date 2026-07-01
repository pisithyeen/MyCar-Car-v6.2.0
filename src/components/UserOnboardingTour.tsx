import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Car, 
  Sparkles, 
  Bell, 
  CheckCircle, 
  Award, 
  ArrowRight, 
  ArrowLeft, 
  Plus, 
  ShieldAlert, 
  Coins,
  MapPin,
  Compass,
  X
} from "lucide-react";
import { VehicleProfile, MaintenanceRecord } from "../types";

interface UserOnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  onAddVehicle: (veh: Partial<VehicleProfile>) => void;
  onAddReminder: (category: string, mileage: number, date: string, description: string) => void;
  onGrantCoins: (amount: number, reason: string) => void;
}

export default function UserOnboardingTour({
  isOpen,
  onClose,
  onAddVehicle,
  onAddReminder,
  onGrantCoins
}: UserOnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [lang, setLang] = useState<"en" | "kh">("en");

  // Form States for Vehicle Add
  const [brand, setBrand] = useState("Toyota");
  const [model, setModel] = useState("Prius 2010");
  const [year, setYear] = useState("2010");
  const [mileage, setMileage] = useState("125000");
  const [plateNumber, setPlateNumber] = useState("2X-9988");
  const [vehicleAddedSuccessfully, setVehicleAddedSuccessfully] = useState(false);

  // Form States for Reminder
  const [reminderCategory, setReminderCategory] = useState("Engine Oil Service");
  const [reminderMileage, setReminderMileage] = useState("130000");
  const [reminderDate, setReminderDate] = useState("2026-08-15");
  const [reminderAddedSuccessfully, setReminderAddedSuccessfully] = useState(false);

  if (!isOpen) return null;

  // Localized texts
  const t = {
    en: {
      welcomeTitle: "Welcome to MyCar Care KH",
      welcomeSubtitle: "Cambodia's advanced AI companion for vehicle safety, smart scheduling, & local repair logs.",
      step1Desc: "Let's set up your personal vehicle workshop in 3 simple steps to unlock smart reminders, AI vulnerability assessments, and claim +10 Care Coins!",
      next: "Get Started",
      back: "Back",
      stepOf: "Step {current} of 5",
      addVehTitle: "1. Register Your Vehicle",
      addVehDesc: "Provide your vehicle's basics. This syncs your logger dashboard and generates your custom Cambodian AI vulnerability report.",
      brand: "Brand / Maker",
      model: "Model Name",
      year: "Manufacturing Year",
      mileage: "Current Odometer (km)",
      plateNumber: "Plate Number (Optional)",
      addVehBtn: "Save Vehicle & Generate AI Report",
      vehSaved: "Vehicle added! Our AI has started scanning manufacturing data...",
      aiTitle: "2. Explore AI Vulnerability Scan",
      aiDesc: "Our Gemini model matches your car against Cambodia's heavy dust, high temperature, and urban traffic profiles to pinpoint risks.",
      aiRiskPrius: "BYD/Prius Thermal Core Alert",
      aiRiskDetail: "Severe battery and hybrid cooling strain in 38°C Phnom Penh traffic. Clean inverter fans every 15k km to avoid inverter blowouts.",
      aiCapability1: "Predictive suspension fatigue metrics.",
      aiCapability2: "Local parts price indexing & garage biddings.",
      setRemTitle: "3. Schedule First Reminder",
      setRemDesc: "Choose a preventative item. We'll automatically countdown kilometers and notify you before critical milestones.",
      category: "Service Action",
      targetKm: "Target Odometer (km)",
      targetDate: "Target Service Date",
      setRemBtn: "Activate Reminder Alerts",
      remSaved: "Reminder activated successfully!",
      doneTitle: "Onboarding Complete!",
      doneDesc: "You have successfully configured your workspace! We've rewarded you with premium credits to use on bids and AI Dream Advisor.",
      rewardGrant: "+10 Care Coins Awarded!",
      finishBtn: "Enter Workshop Dashboard",
    },
    kh: {
      welcomeTitle: "សូមស្វាគមន៍មកកាន់ MyCar Care KH",
      welcomeSubtitle: "ប្រព័ន្ធជំនួយការ AI កម្រិតខ្ពស់សម្រាប់សុវត្ថិភាពយានយន្ត ការរំលឹក និងការថែទាំនៅកម្ពុជា។",
      step1Desc: "ចូររៀបចំសិក្ខាសាលាយានយន្តផ្ទាល់ខ្លួនរបស់អ្នកក្នុង ៣ ជំហានសាមញ្ញ ដើម្បីបើកដំណើរការរំលឹកឆ្លាតវៃ ការវាយតម្លៃ AI និងទទួលបាន +10 Care Coins!",
      next: "ចាប់ផ្តើម",
      back: "ថយក្រោយ",
      stepOf: "ជំហានទី {current} នៃ ៥",
      addVehTitle: "១. ចុះឈ្មោះយានយន្តរបស់អ្នក",
      addVehDesc: "បញ្ចូលព័ត៌មានមូលដ្ឋានរថយន្តរបស់អ្នក ដើម្បីបង្កើតរបាយការណ៍ AI អំពីចំណុចខ្សោយបច្ចេកទេសក្នុងលក្ខខណ្ឌបើកបរនៅស្រុកខ្មែរ។",
      brand: "ម៉ាករថយន្ត",
      model: "ម៉ូដែល",
      year: "ឆ្នាំផលិត",
      mileage: "គីឡូម៉ែត្របច្ចុប្បន្ន (km)",
      plateNumber: "ផ្លាកលេខ (មិនតម្រូវ)",
      addVehBtn: "រក្សាទុក និងបង្កើតរបាយការណ៍ AI",
      vehSaved: "បានបន្ថែមរថយន្តរួចរាល់! AI កំពុងស្កេនទិន្នន័យផលិតកម្ម...",
      aiTitle: "២. ស្វែងយល់ពីការស្កេន AI",
      aiDesc: "ប្រព័ន្ធ AI (Gemini) វិភាគរថយន្តរបស់អ្នក ធៀបនឹងអាកាសធាតុក្តៅ ធូលីដី និងការកកស្ទះនៅភ្នំពេញ ដើម្បីស្វែងរកហានិភ័យ។",
      aiRiskPrius: "ការព្រមានអំពីប្រព័ន្ធកម្តៅអាគុយហាយប្រីដ (Hybrid)",
      aiRiskDetail: "ហានិភ័យឡើងកម្តៅអាគុយក្នុងសីតុណ្ហភាព ៣៨°C នៅភ្នំពេញ។ គួរលាងសំអាតកង្ហារ Inverter រៀងរាល់ ១៥,០០០ គីឡូម៉ែត្រ។",
      aiCapability1: "ទស្សន៍ទាយការពុកផុយនៃប្រព័ន្ធបូមរថយន្ត។",
      aiCapability2: "ប្រៀបធៀបតម្លៃគ្រឿងបន្លាស់ក្នុងស្រុក និងការដេញថ្លៃការ៉ាស់។",
      setRemTitle: "៣. កំណត់ការរំលឹកដំបូង",
      setRemDesc: "ជ្រើសរើសសេវាកម្មដែលត្រូវថែទាំ។ ប្រព័ន្ធនឹងរាប់ថយក្រោយ និងជូនដំណឹងមុនពេលដល់កំណត់។",
      category: "ប្រភេទថែទាំ",
      targetKm: "គីឡូម៉ែត្រកំណត់ (km)",
      targetDate: "កាលបរិច្ឆេទកំណត់សេវាកម្ម",
      setRemBtn: "បើកការរំលឹកថែទាំ",
      remSaved: "បានបើកការរំលឹកដោយជោគជ័យ!",
      doneTitle: "ការរៀបចំរួចរាល់ទាំងស្រុង!",
      doneDesc: "អ្នកបានរៀបចំផ្ទាំងគ្រប់គ្រងរួចរាល់ហើយ! យើងបានជូនកាក់រង្វាន់សម្រាប់ការប្រើប្រាស់ការដេញថ្លៃ និងប្រឹក្សា AI។",
      rewardGrant: "ទទួលបាន +១០ កាក់ Care Coins!",
      finishBtn: "ចូលទៅកាន់ផ្ទាំងគ្រប់គ្រងចម្បង",
    }
  };

  const currentT = t[lang];

  // Action: Add Vehicle
  const handleAddVehicleLocal = () => {
    if (!brand || !model || !mileage) return;
    const cleanMileage = parseInt(mileage) || 100000;
    const cleanYear = parseInt(year) || 2012;
    onAddVehicle({
      brand,
      model,
      year: cleanYear,
      mileage: cleanMileage,
      fuelType: "Gasoline",
      plateNumber: plateNumber || "2X-0000",
      notes: "Registered during account onboarding walkthrough."
    });
    setVehicleAddedSuccessfully(true);
    setTimeout(() => {
      setCurrentStep(3); // Auto proceed to AI review
    }, 1200);
  };

  // Action: Add Reminder
  const handleAddReminderLocal = () => {
    if (!reminderCategory || !reminderMileage) return;
    onAddReminder(
      reminderCategory,
      parseInt(reminderMileage) || 130000,
      reminderDate,
      `Onboarding initial reminder for ${reminderCategory}`
    );
    setReminderAddedSuccessfully(true);
    setTimeout(() => {
      setCurrentStep(5); // Proceed to Done screen
    }, 1200);
  };

  // Action: Complete Onboarding
  const handleFinishOnboarding = () => {
    onGrantCoins(10, "Onboarding welcome reward");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-100">
        
        {/* Header Ribbon */}
        <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-800 rounded-lg text-amber-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="font-sans font-semibold tracking-tight text-lg">MyCar Care KH Tour</h2>
              <p className="text-slate-400 text-xs font-mono">Unlocking Care Coins & AI scheduling</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <div className="flex rounded-md bg-slate-800 p-0.5 text-xs">
              <button 
                onClick={() => setLang("en")}
                className={`px-2 py-1 rounded ${lang === "en" ? "bg-amber-500 text-slate-950 font-semibold" : "text-slate-300"}`}
              >
                EN
              </button>
              <button 
                onClick={() => setLang("kh")}
                className={`px-2 py-1 rounded ${lang === "kh" ? "bg-amber-500 text-slate-950 font-semibold" : "text-slate-300"}`}
              >
                KH
              </button>
            </div>
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dynamic Progress Indicator */}
        <div className="w-full bg-slate-100 h-1.5 flex">
          {[1, 2, 3, 4, 5].map((step) => (
            <div 
              key={step} 
              className={`flex-1 transition-all duration-300 h-full ${
                step <= currentStep ? "bg-amber-500" : "bg-slate-200"
              }`}
            />
          ))}
        </div>

        {/* Step Contents */}
        <div className="p-8 max-h-[75vh] overflow-y-auto">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div className="text-center space-y-3">
                  <div className="mx-auto w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 border border-amber-100 shadow-sm">
                    <Compass className="w-8 h-8 animate-spin-slow" />
                  </div>
                  <h3 className="font-sans font-bold text-2xl text-slate-900 tracking-tight">{currentT.welcomeTitle}</h3>
                  <p className="text-slate-600 max-w-lg mx-auto leading-relaxed">{currentT.welcomeSubtitle}</p>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 text-slate-700 text-sm leading-relaxed space-y-4">
                  <p>{currentT.step1Desc}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                    <div className="p-3 bg-white border border-slate-100 rounded-lg flex items-center gap-2">
                      <Car className="w-4 h-4 text-amber-500 shrink-0" />
                      <span className="font-medium text-xs text-slate-800">1. Register Vehicle</span>
                    </div>
                    <div className="p-3 bg-white border border-slate-100 rounded-lg flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-500 shrink-0" />
                      <span className="font-medium text-xs text-slate-800">2. Unlock AI scans</span>
                    </div>
                    <div className="p-3 bg-white border border-slate-100 rounded-lg flex items-center gap-2">
                      <Bell className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="font-medium text-xs text-slate-800">3. Activate Reminder</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-100 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Coins className="w-6 h-6 text-amber-600 animate-bounce" />
                    <div>
                      <h4 className="font-sans font-semibold text-sm text-slate-800">Onboarding Incentive</h4>
                      <p className="text-slate-500 text-xs font-mono">Claim 10 Care Coins for complete profile setup</p>
                    </div>
                  </div>
                  <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full">+10 Coins</span>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-5"
              >
                <div>
                  <h3 className="font-sans font-bold text-xl text-slate-900 flex items-center gap-2">
                    <Car className="w-5 h-5 text-amber-500" />
                    {currentT.addVehTitle}
                  </h3>
                  <p className="text-slate-500 text-sm mt-1">{currentT.addVehDesc}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-100 p-5 rounded-xl">
                  <div className="space-y-1.5">
                    <label className="text-slate-700 text-xs font-medium block">{currentT.brand}</label>
                    <select 
                      value={brand} 
                      onChange={(e) => setBrand(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    >
                      <option value="Toyota">Toyota</option>
                      <option value="Lexus">Lexus</option>
                      <option value="BYD">BYD</option>
                      <option value="Mazda">Mazda</option>
                      <option value="Ford">Ford</option>
                      <option value="Hyundai">Hyundai</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-700 text-xs font-medium block">{currentT.model}</label>
                    <input 
                      type="text" 
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      placeholder="e.g. Prius 2010 / RX450h"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-700 text-xs font-medium block">{currentT.year}</label>
                    <input 
                      type="number" 
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      placeholder="e.g. 2010"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-700 text-xs font-medium block">{currentT.mileage}</label>
                    <input 
                      type="number" 
                      value={mileage}
                      onChange={(e) => setMileage(e.target.value)}
                      placeholder="Current km e.g. 125000"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div className="col-span-2 space-y-1.5">
                    <label className="text-slate-700 text-xs font-medium block">{currentT.plateNumber}</label>
                    <input 
                      type="text" 
                      value={plateNumber}
                      onChange={(e) => setPlateNumber(e.target.value)}
                      placeholder="e.g. PP 2X-9988"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>

                {vehicleAddedSuccessfully ? (
                  <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-lg flex items-center gap-2.5 text-xs font-semibold">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{currentT.vehSaved}</span>
                  </div>
                ) : (
                  <button 
                    onClick={handleAddVehicleLocal}
                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-sans font-medium text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                  >
                    <Plus className="w-4 h-4 text-amber-400" />
                    {currentT.addVehBtn}
                  </button>
                )}
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-5"
              >
                <div>
                  <h3 className="font-sans font-bold text-xl text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                    {currentT.aiTitle}
                  </h3>
                  <p className="text-slate-500 text-sm mt-1">{currentT.aiDesc}</p>
                </div>

                <div className="p-5 bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 rounded-xl space-y-3 shadow-inner">
                  <div className="flex items-center gap-2 text-purple-800">
                    <ShieldAlert className="w-5 h-5 text-purple-600 shrink-0" />
                    <h4 className="font-sans font-bold text-sm tracking-tight">{brand} {model} ({year}) - {currentT.aiRiskPrius}</h4>
                  </div>
                  <p className="text-slate-700 text-xs leading-relaxed">
                    {currentT.aiRiskDetail}
                  </p>
                </div>

                <div className="space-y-2.5">
                  <div className="p-3 bg-white border border-slate-100 shadow-sm rounded-lg flex items-start gap-2.5 text-xs text-slate-700">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{currentT.aiCapability1}</span>
                  </div>
                  <div className="p-3 bg-white border border-slate-100 shadow-sm rounded-lg flex items-start gap-2.5 text-xs text-slate-700">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{currentT.aiCapability2}</span>
                  </div>
                </div>

                <button 
                  onClick={() => setCurrentStep(4)}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-sans font-medium text-sm flex items-center justify-center gap-1 cursor-pointer transition-all shadow-md"
                >
                  <span>Set Up Reminders</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {currentStep === 4 && (
              <motion.div 
                key="step4"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-5"
              >
                <div>
                  <h3 className="font-sans font-bold text-xl text-slate-900 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-emerald-500" />
                    {currentT.setRemTitle}
                  </h3>
                  <p className="text-slate-500 text-sm mt-1">{currentT.setRemDesc}</p>
                </div>

                <div className="grid grid-cols-1 gap-4 bg-slate-50 border border-slate-100 p-5 rounded-xl">
                  <div className="space-y-1.5">
                    <label className="text-slate-700 text-xs font-medium block">{currentT.category}</label>
                    <select 
                      value={reminderCategory} 
                      onChange={(e) => setReminderCategory(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none"
                    >
                      <option value="Engine Oil Service">Engine Oil Service (5,000 km)</option>
                      <option value="Brake Pad Check">Brake Pad Check (15,000 km)</option>
                      <option value="Hybrid Fan Cleaning">Hybrid Cooling Fan Air Duct (15,000 km)</option>
                      <option value="Road Tax & Inspection">Road Tax & Tax Inspection (Annual)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-slate-700 text-xs font-medium block">{currentT.targetKm}</label>
                      <input 
                        type="number" 
                        value={reminderMileage}
                        onChange={(e) => setReminderMileage(e.target.value)}
                        placeholder="e.g. 130000"
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-slate-700 text-xs font-medium block">{currentT.targetDate}</label>
                      <input 
                        type="date" 
                        value={reminderDate}
                        onChange={(e) => setReminderDate(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {reminderAddedSuccessfully ? (
                  <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-lg flex items-center gap-2.5 text-xs font-semibold">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{currentT.remSaved}</span>
                  </div>
                ) : (
                  <button 
                    onClick={handleAddReminderLocal}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-sans font-medium text-sm flex items-center justify-center gap-1 cursor-pointer transition-all shadow-md"
                  >
                    <Bell className="w-4 h-4 text-emerald-200 shrink-0" />
                    <span>{currentT.setRemBtn}</span>
                  </button>
                )}
              </motion.div>
            )}

            {currentStep === 5 && (
              <motion.div 
                key="step5"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center space-y-6 py-4"
              >
                <div className="relative mx-auto w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center border border-amber-100 shadow-sm">
                  <Award className="w-10 h-10 text-amber-500 animate-pulse" />
                  <div className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 font-sans font-bold text-[10px] w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">
                    +10
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-sans font-bold text-2xl text-slate-900">{currentT.doneTitle}</h3>
                  <p className="text-slate-500 text-sm max-w-sm mx-auto">{currentT.doneDesc}</p>
                </div>

                <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl max-w-sm mx-auto flex items-center justify-center gap-3">
                  <Coins className="w-6 h-6 text-amber-500" />
                  <span className="font-sans font-extrabold text-amber-600 text-lg tracking-tight">
                    {currentT.rewardGrant}
                  </span>
                </div>

                <button 
                  onClick={handleFinishOnboarding}
                  className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-sans font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md"
                >
                  <span>{currentT.finishBtn}</span>
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Navigation */}
        <div className="bg-slate-50 border-t border-slate-100 p-4 flex justify-between items-center text-xs">
          <span className="text-slate-500 font-mono">
            {currentT.stepOf.replace("{current}", String(currentStep))}
          </span>

          <div className="flex gap-2">
            {currentStep > 1 && currentStep < 5 && (
              <button 
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg font-medium transition-all flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{currentT.back}</span>
              </button>
            )}

            {currentStep === 1 && (
              <button 
                onClick={() => setCurrentStep(2)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition-all flex items-center gap-1 cursor-pointer shadow-sm"
              >
                <span>{currentT.next}</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
