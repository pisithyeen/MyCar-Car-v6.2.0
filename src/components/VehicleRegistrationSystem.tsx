/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Wrench, 
  Car, 
  Sliders, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  User, 
  Plus, 
  Search, 
  QrCode, 
  Activity, 
  FileText, 
  ChevronRight, 
  Sparkles, 
  ThumbsUp, 
  ThumbsDown, 
  ShieldAlert, 
  Check, 
  RotateCcw, 
  Camera, 
  UserCheck, 
  Fuel, 
  Eye, 
  BookOpen, 
  X,
  CreditCard,
  Bell,
  Trash2,
  Cpu,
  Shield,
  Upload,
  Info,
  RefreshCw,
  AlertCircle,
  Fingerprint,
  ArrowRight
} from "lucide-react";
import { VehicleProfile, MaintenanceRecord, EngineType } from "../types";

// Dynamic Role structure matching the request
type AppRole = 'Car Owner' | 'Garage Owner' | 'Mechanic' | 'Admin';

interface Props {
  vehicles: VehicleProfile[];
  records: MaintenanceRecord[];
  onRefreshData: () => void;
}

export const VehicleRegistrationSystem: React.FC<Props> = ({
  vehicles: initialVehicles,
  records: initialRecords,
  onRefreshData
}) => {
  // Role & Session Simulation State
  const [activeRole, setActiveRole] = useState<AppRole>('Car Owner');
  
  // Local lists
  const [vehicles, setVehicles] = useState<VehicleProfile[]>(initialVehicles);
  const [records, setRecords] = useState<MaintenanceRecord[]>(initialRecords);
  
  // Selected Vehicle for detail view
  const [selectedV, setSelectedV] = useState<VehicleProfile | null>(null);

  // Sync state when props update
  useEffect(() => {
    setVehicles(initialVehicles);
    if (initialVehicles.length > 0 && !selectedV) {
      setSelectedV(initialVehicles[0]);
    }
  }, [initialVehicles]);

  useEffect(() => {
    setRecords(initialRecords);
  }, [initialRecords]);

  // Form states
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Validation issues
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  // Basic Vehicle Fields
  const [ownerName, setOwnerName] = useState("Yeon Pisith");
  const [vType, setVType] = useState<any>("Car");
  const [brand, setBrand] = useState("Toyota");
  const [model, setModel] = useState("Prius Plug-In");
  const [year, setYear] = useState("2012");
  const [plateNumber, setPlateNumber] = useState("PP-2AI-9988");
  const [chassisNumber, setChassisNumber] = useState("JTDKN3DPXCXXXXXXX");
  const [odometer, setOdometer] = useState("135000");
  const [transmission, setTransmission] = useState<any>("CVT");
  const [photoUrl, setPhotoUrl] = useState("https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=600");
  const [regCardPhotoUrl, setRegCardPhotoUrl] = useState("https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=600");
  const [notes, setNotes] = useState("");
  const [engineType, setEngineType] = useState<EngineType>("Plug-in Hybrid / PHEV");

  // Compatibility Engine States
  const [vehicleCategory, setVehicleCategory] = useState<'car' | 'motorbike' | 'truck' | 'van' | 'pickup' | 'tuk tuk' | 'bus' | 'EV' | 'hybrid' | 'heavy equipment'>("car");
  const [engineTypeNew, setEngineTypeNew] = useState<'petrol' | 'diesel' | 'electric' | 'hybrid' | 'plug-in hybrid' | 'LPG/CNG' | 'unknown'>("hybrid");
  const [fuelEnergyType, setFuelEnergyType] = useState<'petrol' | 'diesel' | 'electric' | 'petrol + electric' | 'diesel + electric' | 'gas'>("petrol + electric");
  const [transmissionType, setTransmissionType] = useState<'manual' | 'automatic' | 'CVT' | 'EV single-speed' | 'unknown'>("CVT");
  const [usageType, setUsageType] = useState<'personal' | 'family' | 'company' | 'delivery' | 'taxi' | 'ride-hailing' | 'fleet' | 'rental' | 'off-road'>("personal");

  // Enginespecific states
  const [gasolineFuelType, setGasolineFuelType] = useState<any>("Premium 95");
  const [gasolineEngineSize, setGasolineEngineSize] = useState("1.8L");
  const [gasolineOilInterval, setGasolineOilInterval] = useState("5000");
  const [gasolineConsumption, setGasolineConsumption] = useState("5.2L/100km");

  const [dieselEngineSize, setDieselEngineSize] = useState("3.2L");
  const [dieselHasTurbo, setDieselHasTurbo] = useState(true);
  const [dieselHasDpf, setDieselHasDpf] = useState(false);
  const [dieselFuelFilterInterval, setDieselFuelFilterInterval] = useState("15000");
  const [dieselOilInterval, setDieselOilInterval] = useState("7500");

  const [hybridType, setHybridType] = useState<any>("Plug-in Hybrid");
  const [hybridEngineSize, setHybridEngineSize] = useState("1.8L");
  const [hybridBatteryHealth, setHybridBatteryHealth] = useState("88");
  const [hybridEvRange, setHybridEvRange] = useState("45");
  const [hybridInspectionInterval, setHybridInspectionInterval] = useState("15000");

  const [evBatteryCapacity, setEvBatteryCapacity] = useState("71.8");
  const [evBatteryHealth, setEvBatteryHealth] = useState("94");
  const [evDrivingRange, setEvDrivingRange] = useState("450");
  const [evChargingType, setEvChargingType] = useState<any>("Both");
  const [evChargingPortType, setEvChargingPortType] = useState("GB/T & CCS2 Combo");
  const [evHasHomeCharger, setEvHasHomeCharger] = useState(true);
  const [evBatteryCooling, setEvBatteryCooling] = useState<any>("Liquid Cooled");

  const [lpgCngType, setLpgCngType] = useState<any>("LPG");
  const [lpgCngHasPetrolBackup, setLpgCngHasPetrolBackup] = useState(true);
  const [lpgCngInstallDate, setLpgCngInstallDate] = useState("2024-05-12");
  const [lpgCngExpiryDate, setLpgCngExpiryDate] = useState("2029-05-12");
  const [lpgCngInspectionInterval, setLpgCngInspectionInterval] = useState("10000");

  const [motoEngineSize, setMotoEngineSize] = useState("125cc");
  const [motoBatteryCapacity, setMotoBatteryCapacity] = useState("3.2");
  const [motoRange, setMotoRange] = useState("100");
  const [motoChargingTime, setMotoChargingTime] = useState("4");
  const [motoDriveType, setMotoDriveType] = useState<any>("Chain");

  // QR Simulation states
  const [scannedVehicleId, setScannedVehicleId] = useState("");
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [qrErrorMessage, setQrErrorMessage] = useState("");
  const [isScanningQr, setIsScanningQr] = useState(false);
  
  // Custom Service Logging by Garage
  const [garageServiceCategory, setGarageServiceCategory] = useState("Engine Oil Service");
  const [garageServiceDesc, setGarageServiceDesc] = useState("");
  const [garageServiceCost, setGarageServiceCost] = useState("45");
  const [garageServiceProvider, setGarageServiceProvider] = useState("Sok Leap Premium Auto Clinic");
  const [garageNextServiceMileage, setGarageNextServiceMileage] = useState("");
  const [pendingServices, setPendingServices] = useState<any[]>([
    {
      id: "pending-1",
      vehicleId: "v1",
      vehicleLabel: "Toyota Tacoma Dual-Cab",
      ownerName: "Yeon Pisith",
      serviceCategory: "Turbo Charger Alignment & Intake Degrease",
      serviceDate: new Date().toISOString().split('T')[0],
      mileage: 184500,
      cost: 120,
      providerName: "Angkor Speed Auto Repair",
      approvalStatus: "pending_owner_approval",
      note: "Customer complained about minor whistling noise under load. Cleaned and lubricated actuator guide."
    }
  ]);

  // Notifications History State for demo purposes
  const [notifHistory, setNotifHistory] = useState<any[]>([
    {
      id: "notif-1",
      title: "PHEV Battery Inspection Required",
      msg: "Your hybrid battery warranty is dependent on annual inspection schedules. Schedule yours in Phnom Penh.",
      date: "2026-05-24",
      type: "Hybrid",
      unread: true
    },
    {
      id: "notif-2",
      title: "Turbo Actuator Hose Warning",
      msg: "High heat in Cambodia makes diesel silicone hoses split early. Visual check advised.",
      date: "2026-05-18",
      type: "Diesel",
      unread: false
    }
  ]);

  // Handle active engine type changes to auto fill default properties
  const handleEngineTypeChange = (type: EngineType) => {
    setEngineType(type);
    
    // Auto-adjust default vehicle type and transmission for intuitive UX
    if (type.includes("Motorcycle") || type.includes("E-Bike")) {
      setVType("Motorcycle");
      setTransmission(type.includes("Electric") ? "Single-Speed" : "Manual");
    } else {
      if (vType === "Motorcycle") {
        setVType("Car");
      }
      setTransmission(type.includes("EV") ? "Single-Speed" : "Automatic");
    }
  };

  // Run dynamic input validations real-time
  const validateForm = () : boolean => {
    const errors: string[] = [];
    
    if (!brand.trim()) errors.push("Brand cannot be empty");
    if (!model.trim()) errors.push("Model name cannot be empty");
    
    // Mfg year checks (Cambodia supports very old imports like 1990s as well as brand new ones)
    const yearNum = Number(year);
    if (!year || isNaN(yearNum) || yearNum < 1980 || yearNum > 2027) {
      errors.push("Manufacturing Year must be between 1980 and 2027.");
    }
    
    // Odometer index validation
    const odoNum = Number(odometer);
    if (!odometer || isNaN(odoNum) || odoNum < 0) {
      errors.push("Odometer mileage must be a valid positive number.");
    }
    
    // Platename validation (Cambodia plate format example: PP-2X-1234, PP-2AA-8888, State, NGO, or blank)
    if (!plateNumber.trim()) {
      errors.push("Plate number is required for official Cambodia vehicle registration.");
    } else {
      const plateTrimmed = plateNumber.trim().toUpperCase();
      if (plateTrimmed.length < 4) {
        errors.push("Plate number seems too short.");
      }
    }
    
    // Chassis number checking
    if (chassisNumber.trim() && chassisNumber.trim().length !== 17) {
      errors.push("Standard VIN / Chassis Number should be exactly 17 characters (current: " + chassisNumber.trim().length + ").");
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  // Submit vehicle registration to simulated backend
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      brand,
      model,
      year: Number(year),
      mileage: Number(odometer),
      fuelType: (engineType.includes("EV") ? "EV" : engineType.includes("Hybrid") || engineType.includes("PHEV") ? "Hybrid" : engineType === "Diesel" ? "Diesel" : "Gasoline") as any,
      lastOilChangeMileage: Number(odometer),
      lastServiceDate: new Date().toISOString().split('T')[0],
      nickname: model + " (" + engineType + ")",
      plateNumber,
      vehicleType: vType,
      notes: notes || `Registered under ${engineType} powertrain engine class.`,
      photoUrl: photoUrl || "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=600",
      
      // Extended fields
      owner: ownerName,
      engineType,
      chassisNumber,
      transmission,
      regCardPhotoUrl,
      
      // Compatibility fields
      vehicleCategory,
      engineTypeNew,
      fuelEnergyType,
      transmissionType,
      usageType,
      
      gasolineFuelType,
      engineSize: engineType === "Diesel" ? dieselEngineSize : engineType.includes("Hybrid") ? hybridEngineSize : gasolineEngineSize,
      oilChangeInterval: Number(engineType === "Diesel" ? dieselOilInterval : gasolineOilInterval),
      fuelConsumptionEstimate: gasolineConsumption,
      
      dieselEngineSize,
      dieselHasTurbo,
      dieselHasDpf,
      dieselFuelFilterInterval: Number(dieselFuelFilterInterval),
      dieselOilChangeInterval: Number(dieselOilInterval),
      
      hybridType,
      hybridEngineSize,
      hybridBatteryHealth: Number(hybridBatteryHealth),
      hybridEvRange: Number(hybridEvRange),
      hybridBatteryInspectionInterval: Number(hybridInspectionInterval),
      
      evBatteryCapacity: Number(evBatteryCapacity),
      evBatteryHealth: Number(evBatteryHealth),
      evDrivingRange: Number(evDrivingRange),
      evChargingType,
      evChargingPortType,
      evHasHomeCharger,
      evBatteryCoolingType: evBatteryCooling,
      
      lpgCngType,
      lpgCngHasPetrolBackup,
      lpgCngTankInstallationDate: lpgCngInstallDate,
      lpgCngTankInspectionExpiryDate: lpgCngExpiryDate,
      lpgCngInspectionInterval: Number(lpgCngInspectionInterval),
      
      motorcycleEngineSizeCc: motoEngineSize,
      motorcycleBatteryCapacityKwh: Number(motoBatteryCapacity),
      motorcycleRangeKm: Number(motoRange),
      motorcycleChargingTimeHours: Number(motoChargingTime),
      motorcycleDriveType: motoDriveType
    };

    try {
      const res = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        // Sync vehicles
        const updatedList = [...vehicles, data];
        setVehicles(updatedList);
        setSelectedV(data);
        setIsAdding(false);
        onRefreshData();
        
        // Push a custom push notification
        const newNotif = {
          id: `notif-${Date.now()}`,
          title: `Smart Classification Configured!`,
          msg: `New ${brand} ${model} classified under ${engineType} with custom checklist profiles.`,
          date: new Date().toISOString().split('T')[0],
          type: engineType,
          unread: true
        };
        setNotifHistory([newNotif, ...notifHistory]);
      }
    } catch (err) {
      console.error("Failed to register vehicle:", err);
    }
  };

  // Edit action
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedV) return;

    const payload = {
      brand,
      model,
      year: Number(year),
      mileage: Number(odometer),
      plateNumber,
      vehicleType: vType,
      notes,
      photoUrl,
      // Enhanced properties
      engineType,
      chassisNumber,
      transmission,
      owner: ownerName,
      
      // Compatibility fields
      vehicleCategory,
      engineTypeNew,
      fuelEnergyType,
      transmissionType,
      usageType,
      
      gasolineFuelType,
      engineSize: gasolineEngineSize,
      oilChangeInterval: Number(gasolineOilInterval),
      fuelConsumptionEstimate: gasolineConsumption,

      dieselEngineSize,
      dieselHasTurbo,
      dieselHasDpf,
      dieselFuelFilterInterval: Number(dieselFuelFilterInterval),
      dieselOilChangeInterval: Number(dieselOilInterval),

      hybridType,
      hybridBatteryHealth: Number(hybridBatteryHealth),
      hybridEvRange: Number(hybridEvRange),
      hybridBatteryInspectionInterval: Number(hybridInspectionInterval),

      evBatteryCapacity: Number(evBatteryCapacity),
      evBatteryHealth: Number(evBatteryHealth),
      evDrivingRange: Number(evDrivingRange),
      evChargingType,
      evChargingPortType,
      evHasHomeCharger,
      evBatteryCoolingType: evBatteryCooling,

      lpgCngType,
      lpgCngHasPetrolBackup,
      lpgCngTankInstallationDate: lpgCngInstallDate,
      lpgCngTankInspectionExpiryDate: lpgCngExpiryDate,
      lpgCngInspectionInterval: Number(lpgCngInspectionInterval),

      motorcycleEngineSizeCc: motoEngineSize,
      motorcycleBatteryCapacityKwh: Number(motoBatteryCapacity),
      motorcycleRangeKm: Number(motoRange),
      motorcycleChargingTimeHours: Number(motoChargingTime),
      motorcycleDriveType: motoDriveType
    };

    try {
      const res = await fetch(`/api/vehicles/${selectedV.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        setVehicles(prev => prev.map(v => v.id === selectedV.id ? data : v));
        setSelectedV(data);
        setIsEditing(false);
        onRefreshData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Seed sample data for all engine types in Cambodia vehicle owner property records
  const handleSeedVehicles = async () => {
    const seedPayloads = [
      {
        id: "seed-petrol",
        brand: "Toyota",
        model: "Camry V6 Premium",
        year: 2015,
        mileage: 112000,
        fuelType: "Gasoline" as any,
        engineType: "Petrol / Gasoline" as EngineType,
        vehicleType: "Sedan" as any,
        plateNumber: "PP-2T-8520",
        chassisNumber: "JT2BF1FK6FC123456",
        transmission: "Automatic" as any,
        owner: "Heng Samnang",
        gasolineFuelType: "Regular 92" as any,
        engineSize: "3.5L",
        oilChangeInterval: 5000,
        fuelConsumptionEstimate: "9.2L/100km",
        photoUrl: "https://images.unsplash.com/photo-1621007947382-cc34aa864ee3?auto=format&fit=crop&q=80&w=600",
        regCardPhotoUrl: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=600",
        notes: "Legendary 2GR-FE V6 engine. Flawless smooth ride for Cambodian provincial tours.",
        vehicleCategory: "car" as any,
        engineTypeNew: "petrol" as any,
        fuelEnergyType: "petrol" as any,
        transmissionType: "automatic" as any,
        usageType: "personal" as any
      },
      {
        id: "seed-tacoma",
        brand: "Toyota",
        model: "Tacoma V6 4x4",
        year: 2006,
        mileage: 245000,
        fuelType: "Gasoline" as any,
        engineType: "Petrol / Gasoline" as EngineType,
        vehicleType: "Pickup" as any,
        plateNumber: "PP-2A-1906",
        chassisNumber: "5TETF26A86Z123456",
        transmission: "Automatic" as any,
        owner: "Prum Samath",
        gasolineFuelType: "Regular 92" as any,
        engineSize: "4.0L",
        oilChangeInterval: 5000,
        fuelConsumptionEstimate: "12.8L/100km",
        photoUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600",
        notes: "Robust V6 petrol-only pickup. Pure mechanical reliability with zero high-voltage components.",
        vehicleCategory: "pickup" as any,
        engineTypeNew: "petrol" as any,
        fuelEnergyType: "petrol" as any,
        transmissionType: "automatic" as any,
        usageType: "off-road" as any
      },
      {
        id: "seed-diesel",
        brand: "Ford",
        model: "Ranger Raptor Bi-Turbo",
        year: 2021,
        mileage: 64000,
        fuelType: "Diesel" as any,
        engineType: "Diesel" as EngineType,
        vehicleType: "Pickup" as any,
        plateNumber: "PP-2AB-7711",
        chassisNumber: "MNAUMF240MW887766",
        transmission: "Automatic" as any,
        owner: "Oung Sokhom",
        dieselEngineSize: "2.0L",
        dieselHasTurbo: true,
        dieselHasDpf: true,
        dieselFuelFilterInterval: 15000,
        dieselOilChangeInterval: 7500,
        photoUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600",
        notes: "Bi-turbo setup. Uses ultra-low sulfur diesel when available in Phnom Penh to prevent EGR clogging.",
        vehicleCategory: "pickup" as any,
        engineTypeNew: "diesel" as any,
        fuelEnergyType: "diesel" as any,
        transmissionType: "automatic" as any,
        usageType: "off-road" as any
      },
      {
        id: "seed-byd-shark",
        brand: "BYD",
        model: "Shark Plug-In Hybrid",
        year: 2024,
        mileage: 8200,
        fuelType: "Hybrid" as any,
        engineType: "Plug-in Hybrid / PHEV" as EngineType,
        vehicleType: "Pickup" as any,
        plateNumber: "PP-2BY-9898",
        chassisNumber: "LC0C2CBDXPP989898",
        transmission: "CVT" as any,
        owner: "Keo Socheat",
        photoUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600",
        notes: "BYD Shark dual-motor AWD plug-in hybrid pickup truck. Handles rugged off-road terrain while running on EV power or petrol range extender.",
        vehicleCategory: "pickup" as any,
        engineTypeNew: "plug-in hybrid" as any,
        fuelEnergyType: "petrol + electric" as any,
        transmissionType: "CVT" as any,
        usageType: "off-road" as any,
        hybridType: "Plug-in Hybrid" as any,
        hybridEngineSize: "1.5T",
        hybridBatteryHealth: 99,
        hybridEvRange: 100,
        hybridBatteryInspectionInterval: 15000
      },
      {
        id: "seed-hybrid",
        brand: "Lexus",
        model: "RX450h Executive",
        year: 2016,
        mileage: 95000,
        fuelType: "Hybrid" as any,
        engineType: "Hybrid" as EngineType,
        vehicleType: "SUV" as any,
        plateNumber: "PP-2X-4505",
        chassisNumber: "JTJBW1BC6G2112233",
        transmission: "CVT" as any,
        owner: "Chea Sreyneath",
        hybridType: "Full Hybrid" as any,
        hybridEngineSize: "3.5L V6",
        hybridBatteryHealth: 82,
        hybridBatteryInspectionInterval: 12000,
        photoUrl: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=600",
        notes: "All-wheel drive hybrid SUV. Battery cabin fan is checked for Cambodia dust blocks monthly.",
        vehicleCategory: "hybrid" as any,
        engineTypeNew: "hybrid" as any,
        fuelEnergyType: "petrol + electric" as any,
        transmissionType: "CVT" as any,
        usageType: "family" as any
      },
      {
        id: "seed-phev",
        brand: "Mitsubishi",
        model: "Outlander PHEV Sport",
        year: 2018,
        mileage: 72000,
        fuelType: "Hybrid" as any,
        engineType: "Plug-in Hybrid / PHEV" as EngineType,
        vehicleType: "SUV" as any,
        plateNumber: "PP-2M-8899",
        chassisNumber: "JA4AZ3A34JZ112233",
        transmission: "CVT" as any,
        owner: "Sun Chansophy",
        hybridType: "Plug-in Hybrid" as any,
        hybridEngineSize: "2.0L",
        hybridBatteryHealth: 88,
        hybridEvRange: 45,
        hybridBatteryInspectionInterval: 15000,
        photoUrl: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=600",
        regCardPhotoUrl: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=600",
        notes: "Elegant crossover with active 4WD S-AWC traction. Provides silent EV mode running.",
        vehicleCategory: "hybrid" as any,
        engineTypeNew: "plug-in hybrid" as any,
        fuelEnergyType: "petrol + electric" as any,
        transmissionType: "CVT" as any,
        usageType: "family" as any
      },
      {
        id: "seed-ev",
        brand: "BYD",
        model: "Atto 3 Extended",
        year: 2023,
        mileage: 18400,
        fuelType: "EV" as any,
        engineType: "EV / Fully Electric Vehicle" as EngineType,
        vehicleType: "SUV" as any,
        plateNumber: "PP-4A-3388",
        chassisNumber: "LC0C2CBDXPP112233",
        transmission: "Single-Speed" as any,
        owner: "Keo Piseth",
        evBatteryCapacity: 60.48,
        evBatteryHealth: 98,
        evDrivingRange: 420,
        evChargingType: "Both" as any,
        evChargingPortType: "CCS2 & Type 2",
        evHasHomeCharger: true,
        evBatteryCoolingType: "Liquid Cooled" as any,
        photoUrl: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&q=80&w=600",
        notes: "Uses durable LFP Blade Battery. Fully supported by BYD Cambodia flagship hub.",
        vehicleCategory: "EV" as any,
        engineTypeNew: "electric" as any,
        fuelEnergyType: "electric" as any,
        transmissionType: "EV single-speed" as any,
        usageType: "personal" as any
      },
      {
        id: "seed-lpg",
        brand: "Toyota",
        model: "Alphard LPG Executive",
        year: 2015,
        mileage: 138000,
        fuelType: "Gasoline" as any,
        engineType: "LPG / CNG Gas Vehicle" as EngineType,
        vehicleType: "Van" as any,
        plateNumber: "PP-2J-1155",
        chassisNumber: "AGH30-112233XXXX",
        transmission: "CVT" as any,
        owner: "Oung Saman",
        lpgCngType: "LPG" as any,
        lpgCngHasPetrolBackup: true,
        lpgCngTankInstallationDate: "2024-05-12",
        lpgCngTankInspectionExpiryDate: "2029-05-12",
        lpgCngInspectionInterval: 10000,
        photoUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600",
        notes: "Converted high-end business van. Provides outstanding family commuting cost savings.",
        vehicleCategory: "van" as any,
        engineTypeNew: "LPG/CNG" as any,
        fuelEnergyType: "gas" as any,
        transmissionType: "CVT" as any,
        usageType: "family" as any
      },
      {
        id: "seed-moto",
        brand: "Honda",
        model: "Wave 125i Premium",
        year: 2022,
        mileage: 15200,
        fuelType: "Gasoline" as any,
        engineType: "Petrol Motorcycle" as EngineType,
        vehicleType: "Motorcycle" as any,
        plateNumber: "PP-1IK-2921",
        chassisNumber: "ND125-112233XXXX",
        transmission: "Manual" as any,
        owner: "Sun Chansophy",
        motorcycleEngineSizeCc: "124.9cc",
        motorcycleDriveType: "Chain" as any,
        photoUrl: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=600",
        notes: "The daily standard workhorse in Phnom Penh streets. Extremely cheap to maintain.",
        vehicleCategory: "motorbike" as any,
        engineTypeNew: "petrol" as any,
        fuelEnergyType: "petrol" as any,
        transmissionType: "manual" as any,
        usageType: "personal" as any
      },
      {
        id: "seed-moto-ev",
        brand: "Yadea",
        model: "S-Like Electric",
        year: 2023,
        mileage: 4500,
        fuelType: "EV" as any,
        engineType: "Electric Motorcycle / E-Bike" as EngineType,
        vehicleType: "Motorcycle" as any,
        plateNumber: "PP-1BC-4567",
        chassisNumber: "YADEA-778899XXXX",
        transmission: "Single-Speed" as any,
        owner: "Nguon Monika",
        motorcycleEngineSizeCc: "1200W Hub Motor",
        motorcycleBatteryCapacityKwh: 1.44,
        motorcycleRangeKm: 60,
        motorcycleChargingTimeHours: 5,
        motorcycleDriveType: "Direct Hub Drive" as any,
        photoUrl: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=600",
        notes: "Sleek eco-friendly scooter designed for low speed neighborhood errands.",
        vehicleCategory: "motorbike" as any,
        engineTypeNew: "electric" as any,
        fuelEnergyType: "electric" as any,
        transmissionType: "EV single-speed" as any,
        usageType: "personal" as any
      },
      {
        id: "seed-other",
        brand: "Honda",
        model: "Clarity Fuel Cell",
        year: 2019,
        mileage: 34000,
        fuelType: "EV" as any,
        engineType: "Other" as EngineType,
        vehicleType: "Sedan" as any,
        plateNumber: "PP-2AF-0099",
        chassisNumber: "ZC4-FC8899XXXXXX",
        transmission: "Single-Speed" as any,
        owner: "Sok Dara",
        photoUrl: "https://images.unsplash.com/photo-1621007947382-cc34aa864ee3?auto=format&fit=crop&q=80&w=600",
        notes: "Hydrogen fuel cell tech concept vehicle. Serves as a fascinating technology platform showcase.",
        vehicleCategory: "car" as any,
        engineTypeNew: "unknown" as any,
        fuelEnergyType: "electric" as any,
        transmissionType: "EV single-speed" as any,
        usageType: "personal" as any
      }
    ];

    // Persist to simulated database in server via series of POST calls
    let registeredCount = 0;
    for (const item of seedPayloads) {
      const alreadyExists = vehicles.some(
        v => v.plateNumber === item.plateNumber || (v.brand === item.brand && v.model === item.model)
      );

      if (!alreadyExists) {
        try {
          const res = await fetch("/api/vehicles", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(item)
          });
          if (res.ok) {
            registeredCount++;
          }
        } catch (err) {
          console.error("Failed to register seed sample:", err);
        }
      }
    }

    // Refresh data in parent App state
    onRefreshData();

    // Focus the BYD Electric or Outlander PHEV to showcase options
    const targetToSelect = vehicles.find(v => v.brand === "BYD") || vehicles[0];
    if (targetToSelect) {
      setSelectedV(targetToSelect);
    }

    const alertNotif = {
      id: `seed-notif-${Date.now()}`,
      title: "Engine Samples Registered Successfully",
      msg: `Configured detailed profiles and checklists for standard Petrol, Diesel, Hybrid, PHEV, EV, LPG, and Motorcycle records.`,
      date: new Date().toISOString().split('T')[0],
      type: "Other",
      unread: true
    };
    setNotifHistory(prev => [alertNotif, ...prev]);

    alert(`Successfully verified and registered all engine types to properties records! ${registeredCount > 0 ? `Created ${registeredCount} new records.` : "Already fully instantiated."}`);
  };

  // Get service checklists dynamically mapping target vehicle classifications
  const getRecommendedChecklist = (v: VehicleProfile) => {
    const type = v.engineType || "Petrol / Gasoline";
    
    switch (type) {
      case "Petrol / Gasoline":
      case "Petrol Motorcycle":
        return [
          { category: "Engine Oil", desc: "Change standard lube", interval: "Every 5,000 km / 4 Months" },
          { category: "Oil Filter", desc: "Change with original bypass filter", interval: "Every 5,000 km / 4 Months" },
          { category: "Air Filter", desc: "Inspect and blow dust; replace if grid grey", interval: "Every 15,000 km / 1 Year" },
          { category: "Spark Plugs", desc: "Replace double iridium line", interval: "Every 40,000 km" },
          { category: "Engine Coolant", desc: "Inspect ethylene glycol level", interval: "Every 24,005 km" },
          { category: "Brake Pads", desc: "Front & Rear thickness inspect", interval: "Every 20,000 km" },
          { category: "Tires Rotation", desc: "Rotate and balance alignment", interval: "Every 10,000 km" },
          { category: "Transmission Fluid", desc: "Drain & fill ATF fluid", interval: "Every 45,000 km" },
          { category: "12V Battery", desc: "Sealed Lead Acid cold cranking test", interval: "Every 2 Years" }
        ];
      case "Diesel":
        return [
          { category: "Engine Oil", desc: "Heavy Duty 15W-40 or Synthetic 5W-30", interval: "Every 7,550 km / 6 Months" },
          { category: "Oil Filter", desc: "Replace canister filter", interval: "Every 7,550 km" },
          { category: "Fuel Filter", desc: "Critical in KH due to sulfur sediments", interval: "Every 15,050 km" },
          { category: "Air Filter", desc: "Engine draws high volume", interval: "Every 15,000 km" },
          { category: "Turbocharger Unit", desc: "Check vacuum guide levers & hose boots for tears", interval: "Every 15,000 km / 1 Year" },
          { category: "DPF Cleaning", desc: "Passive burn or manual chemical scaling reset", interval: "Every 20,000 km" },
          { category: "Fuel Injector Flush", desc: "Add professional common-rail cleaner container", interval: "Every 10,000 km" },
          { category: "Brakes check", desc: "Examine rotor warping", interval: "Every 20,000 km" },
          { category: "Transmission Fluid", desc: "Check fluid clarity", interval: "Every 45,000 km" }
        ];
      case "Hybrid":
      case "Plug-in Hybrid / PHEV":
        return [
          { category: "Engine Oil & Filter", desc: "Uses thin 0W-20 fluid", interval: "Every 10,000 km / 6 Months" },
          { category: "Hybrid Battery check", desc: "Diagnose overall SOH cells via OBD2 scanner", interval: "Every 12 Months / 15,000 km" },
          { category: "Inverter Coolant", desc: "Dual loop specialized separate reservoir", interval: "Every 40,000 km" },
          { category: "Regenerative Brakes", desc: "Verify magnetic braking friction transitions", interval: "Every 15,000 km" },
          { category: "Brake Pads Check", desc: "Usually wear slower due to regenerative capture", interval: "Every 30,000 km" },
          { category: "Tires & Alignment", desc: "Severe torque wears front treads early", interval: "Every 10,000 km" },
          { category: "12V AGM Battery", desc: "Located in trunk, checks for charge voltage", interval: "Every 2 Years" },
          { category: "HV cooling duct fan", desc: "Deep clean dust lint from rear seat air vent", interval: "Every 15,000 km" }
        ];
      case "EV / Fully Electric Vehicle":
      case "Electric Motorcycle / E-Bike":
        return [
          { category: "Battery Cell Balancing", desc: "Check state of health & voltage deviation", interval: "Every 20,000 km / 1 Year" },
          { category: "Charging port inspection", desc: "Examine pins for carbon residue or rain corrosion", interval: "Every 12 Months" },
          { category: "Special Brake Fluid", desc: "Replace DOT4 low viscosity fluid", interval: "Every 2 Years" },
          { category: "Tire Rotation", desc: "High EV weight demands rigid tire rotation", interval: "Every 10,000 km" },
          { category: "HV Software Firmware", desc: "Over the Air update checks for BMS upgrades", interval: "Every Year" },
          { category: "Cabin HEPA filter", desc: "Dual layer carbon for phnom penh PM2.5 dust", interval: "Every 15,000 km" },
          { category: "EV Cooling loop", desc: "Inspect coolant hoses & glycol clarity", interval: "Every 40,050 km" },
          { category: "Suspension Joints", desc: "Payload is high, inspect heavy duty ball joints", interval: "Every 20,000 km" },
          { category: "12V Lithium Aux Battery", desc: "Switches main contactors on start", interval: "Every 3 Years" }
        ];
      case "LPG / CNG Gas Vehicle":
        return [
          { category: "LPG Gas filter", desc: "Drain heavy oily deposits", interval: "Every 10,000 km" },
          { category: "Pressure Regulator", desc: "Perform gas leakage electronic test", interval: "Every 10,000 km / 1 Year" },
          { category: "Tank Integrity Test", desc: "Hydrostatic test check certification", interval: "Every 5 Years" },
          { category: "Petrol Backup pump", desc: "Cycle petrol fuel lines to keep fuel injectors operational", interval: "Daily cycle" },
          { category: "Spark Plugs", desc: "Gas burns hotter, use premium LPG-heat-rated spark plugs", interval: "Every 25,000 km" },
          { category: "Standard Engine Oil", desc: "Standard mineral or synthetic service", interval: "Every 5,000 km" }
        ];
      default:
        return [
          { category: "Multi-point check", desc: "Underbody inspect, chassis nut torque index", interval: "Every 6 Months / 7,500 km" },
          { category: "Brake Safety check", desc: "Pads and calipers hydraulic bleed Check", interval: "Every Year" },
          { category: "Electrical harness scan", desc: "Check for rodents or moisture inside engine bay", interval: "Every 6 Months" }
        ];
    }
  };

  // Generate warning/reminders based on registered date and odometer mileage
  const calculateEngineSpecificReminders = (v: VehicleProfile) => {
    const list: any[] = [];
    const mileage = v.mileage;
    
    if (v.engineType === "Diesel") {
      const fuelFilterRem = 15000 - (mileage % 15000);
      list.push({
        title: "Diesel Fuel Filter Change",
        left: fuelFilterRem,
        status: fuelFilterRem < 1000 ? "Overdue" : fuelFilterRem < 2500 ? "Due soon" : "Good",
        notes: `Sulfur residue gets trapped. Critical to replace to save direct injectors ($800/pair).`
      });

      if (v.dieselHasTurbo) {
        const turboRem = 15000 - (mileage % 15000);
        list.push({
          title: "Turbo Guideway Inspection",
          left: turboRem,
          status: turboRem < 1500 ? "Due soon" : "Good",
          notes: "Verify boost wastegate lever smooth movement under high exhaust gas heat."
        });
      }
    } else if (v.engineType?.includes("Hybrid") || v.engineType?.includes("PHEV")) {
      const fanRem = 15000 - (mileage % 15000);
      list.push({
        title: "Auxiliary Battery Duct Cleaning",
        left: fanRem,
        status: fanRem < 1200 ? "Due soon" : "Good",
        notes: "Cambodia humidity creates mud layer on rear fan lint. Clean to prevent early degradation."
      });
      list.push({
        title: "Inverter Cooling Fluid Check",
        left: 40000 - (mileage % 40000),
        status: (40000 - (mileage % 40000)) < 3000 ? "Due soon" : "Good",
        notes: "Keeps the high-voltage IGBT modules cooled down."
      });
    } else if (v.engineType?.includes("EV")) {
      list.push({
        title: "Charging Port Weather Stripping",
        left: "Annual Inspection",
        status: "Good",
        notes: "Examine waterproof gasket seals around port opening to prevent water leaks during rainy season flood events."
      });
      list.push({
        title: "LFP Battery cell balance",
        left: 20000 - (mileage % 20000),
        status: (20000 - (mileage % 20000)) < 2000 ? "Due soon" : "Good",
        notes: "Run a full slow AC overnight charge cycle to recalibrate cell voltage parity."
      });
    } else if (v.engineType === "LPG / CNG Gas Vehicle") {
      list.push({
        title: "Gas System Leakage Check",
        left: "Every 12 Months",
        status: "Due soon",
        notes: "Use electronic gas sniffers to screen manifold couplings."
      });
    } else if (v.engineType?.includes("Motorcycle")) {
      const drive = v.motorcycleDriveType || "Chain";
      if (drive === "Chain") {
        list.push({
          title: "Chain Inspection & Lubricate",
          left: 1000 - (mileage % 1000),
          status: (1000 - (mileage % 1000)) < 150 ? "Overdue" : "Good",
          notes: "Spray high viscosity grease. Tension loose chain links."
        });
      }
    }

    return list;
  };

  // QR simulation trigger
  const handleSimulateScan = () => {
    if (!scannedVehicleId) {
      setQrErrorMessage("Please select or type a valid registered vehicle code first.");
      return;
    }
    const match = vehicles.find(v => v.id === scannedVehicleId || v.plateNumber === scannedVehicleId);
    if (!match) {
      setQrErrorMessage("Vehicle profile node not found inside Cambodia Care registries database.");
      return;
    }

    setIsScanningQr(true);
    setQrErrorMessage("");

    setTimeout(() => {
      setSelectedV(match);
      setShowQrScanner(false);
      setIsScanningQr(false);
      
      // Auto switch to Garage View for seamless simulation!
      setActiveRole("Garage Owner");
      
      // Autofill defaults
      setGarageServiceDesc(`Conducted professional diagnostics and maintenance log for customer's classified ${match.brand} ${match.model}`);
    }, 2200);
  };

  // Garage Owner Action: Submit service logs to customer vehicle (creates a pending service waiting for approval)
  const handleGarageServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedV) return;

    const newPending = {
      id: `pending-${Date.now()}`,
      vehicleId: selectedV.id,
      vehicleLabel: `${selectedV.brand} ${selectedV.model}`,
      ownerName: selectedV.owner || "Yeon Pisith",
      serviceCategory: garageServiceCategory,
      serviceDate: new Date().toISOString().split('T')[0],
      mileage: Number(selectedV.mileage),
      cost: Number(garageServiceCost),
      providerName: garageServiceProvider,
      approvalStatus: "pending_owner_approval",
      note: garageServiceDesc,
      nextServiceMileage: garageNextServiceMileage ? Number(garageNextServiceMileage) : undefined
    };

    setPendingServices([newPending, ...pendingServices]);
    
    // Simulate notification pushed to vehicle owner
    const newNotif = {
      id: `notif-${Date.now()}`,
      title: "Action Required: Approve Garage Service",
      msg: `${garageServiceProvider} has compiled logs for your ${selectedV.brand}. Code check approval is pending.`,
      date: new Date().toISOString().split('T')[0],
      type: `${selectedV.engineType}`,
      unread: true
    };
    setNotifHistory([newNotif, ...notifHistory]);

    // Give visual confirmation
    alert(`Service record logged! Waiting for customer (${selectedV.owner || "Owner"})'s digital approval.`);
    setGarageServiceDesc("");
    
    // Direct back to owner role to see the approval checklist
    setActiveRole("Car Owner");
  };

  // Customer Approval Event
  const handleApproveService = async (item: any) => {
    // 1. Send callback API write to update our main maintenance records database
    try {
      const payload = {
        vehicleId: item.vehicleId,
        serviceCategory: item.serviceCategory,
        description: `${item.note || ""} (Garage verified)`,
        cost: Number(item.cost),
        mileage: Number(item.mileage),
        date: item.serviceDate,
        provider: item.providerName
      };

      const res = await fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        // Update local records
        const freshRecord = await res.json();
        setRecords([freshRecord, ...records]);

        // Remove from pending services
        setPendingServices(prev => prev.filter(p => p.id !== item.id));

        // Sync main App state by calling refreshment prop
        onRefreshData();

        // Push successful push status
        const acceptNotif = {
          id: `notif-${Date.now()}`,
          title: "Service Approved & Logged",
          msg: `You approved repair invoice at ${item.providerName} ($${item.cost}). Maintenance timeline history updated.`,
          date: new Date().toISOString().split('T')[0],
          type: "Other",
          unread: true
        };
        setNotifHistory(prev => [acceptNotif, ...prev]);
        
        alert("Success! Service has been authorized, stored inside persistent DB, and attached to vehicle lifecycle.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectService = (item: any) => {
    setPendingServices(prev => prev.filter(p => p.id !== item.id));
    alert("Service request was rejected and archived.");
  };

  return (
    <div className="space-y-6" id="vehicle-registration-module">
      
      {/* ----------------- INTUITIVE ROLE SWITCHER DASHBOARD ----------------- */}
      <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Fingerprint className="w-5 h-5 text-sky-400" />
            <h2 className="text-base font-bold text-white tracking-tight">Active Persona Configuration Simulator</h2>
          </div>
          <p className="text-xs text-slate-400">
            Current simulated role: <strong className="text-sky-300 font-bold">{activeRole}</strong>.
            Click below to shift role views and test the complete approval cycle flow.
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            {(['Car Owner', 'Garage Owner', 'Mechanic', 'Admin'] as AppRole[]).map((role) => (
              <button
                key={role}
                onClick={() => {
                  setActiveRole(role);
                  setIsAdding(false);
                  setIsEditing(false);
                }}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition ${
                  activeRole === role
                    ? 'bg-sky-500 text-slate-950 font-black shadow-lg shadow-sky-500/20'
                    : 'bg-white/5 text-slate-350 hover:bg-white/10'
                }`}
              >
                {role === 'Car Owner' && "🚘 Owner"}
                {role === 'Garage Owner' && "🛠️ Garage"}
                {role === 'Mechanic' && "🔧 Mechanic"}
                {role === 'Admin' && "👑 Admin"}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          {activeRole === 'Car Owner' && (
            <button
              onClick={() => {
                setBrand("");
                setModel("");
                setYear("2020");
                setOdometer("");
                setPlateNumber("");
                setChassisNumber("");
                setNotes("");
                setVehicleCategory("car");
                setEngineTypeNew("petrol");
                setFuelEnergyType("petrol");
                setTransmissionType("automatic");
                setUsageType("personal");
                setValidationErrors([]);
                setIsAdding(true);
              }}
              className="px-4 py-2 bg-sky-500 hover:bg-sky-600 font-bold text-slate-950 text-xs rounded-xl flex items-center gap-1.5 transition shadow-lg transition-all"
            >
              <Plus className="w-4 h-4 text-slate-950" />
              <span>Register Powertrain</span>
            </button>
          )}

          <button
            onClick={handleSeedVehicles}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 font-bold text-slate-200 text-xs rounded-xl flex items-center gap-1.5 border border-white/5"
            title="Load Petrol, Diesel, Hybrid, EV and Motorcycle seed data instantly."
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Load System Seed Array</span>
          </button>
        </div>
      </div>

      {/* -------------------- DYNAMIC MODALS & FORMS -------------------- */}
      {isAdding && (
        <div className="bg-slate-900 border border-sky-500/30 rounded-3xl p-6 relative shadow-2xl transition">
          <div className="absolute top-4 right-4">
            <button onClick={() => setIsAdding(false)} className="p-1 rounded-full bg-white/5 hover:bg-white/10 text-slate-400">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="pb-4 border-b border-white/10 flex items-center gap-2">
            <Car className="text-sky-400 w-5 h-5 animate-pulse" />
            <div>
              <h3 className="text-sm font-bold text-white">Dynamic Vehicle Registration Form</h3>
              <p className="text-[11px] text-slate-400">The form's fields custom adapt instantly on choosing different powertrains.</p>
            </div>
          </div>

          <form onSubmit={handleRegisterSubmit} className="mt-4 space-y-4">
            {validationErrors.length > 0 && (
              <div className="p-3 bg-red-950/40 border border-red-500/35 rounded-xl space-y-1">
                <div className="flex items-center gap-2 text-red-400 text-xs font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Validation Warnings Identified:</span>
                </div>
                <ul className="list-disc pl-5 text-[11px] text-slate-350 space-y-0.5">
                  {validationErrors.map((err, idx) => <li key={idx}>{err}</li>)}
                </ul>
              </div>
            )}

            {/* Powertrain Class Selector */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest font-extrabold text-sky-400">
                Powertrain Engine & Powertrain Class
              </label>
              <select
                value={engineType}
                onChange={(e) => handleEngineTypeChange(e.target.value as EngineType)}
                className="w-full bg-slate-950 border border-white/15 p-2.5 text-xs rounded-xl text-white focus:outline-none focus:border-sky-500 font-bold"
              >
                <option value="Petrol / Gasoline">1. Petrol / Gasoline</option>
                <option value="Diesel">2. Diesel</option>
                <option value="Hybrid">3. Hybrid (HEV)</option>
                <option value="Plug-in Hybrid / PHEV">4. Plug-in Hybrid / PHEV</option>
                <option value="EV / Fully Electric Vehicle">5. EV / Fully Electric Vehicle</option>
                <option value="LPG / CNG Gas Vehicle">6. LPG / CNG Gas Vehicle</option>
                <option value="Petrol Motorcycle">7. Petrol Motorcycle</option>
                <option value="Electric Motorcycle / E-Bike">8. Electric Motorcycle / E-Bike</option>
                <option value="Other">9. Other Special Powertrain</option>
              </select>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white/3 p-4 rounded-2xl border border-white/5">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Brand / Make</label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. Toyota, Ford, BYD"
                  className="w-full bg-slate-950 border border-white/10 p-2 text-xs rounded-xl focus:outline-none"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Model</label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g. Prius, Ranger, Atto 3"
                  className="w-full bg-slate-950 border border-white/10 p-2 text-xs rounded-xl focus:outline-none"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Mfg Year</label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="e.g. 2018"
                  className="w-full bg-slate-950 border border-white/10 p-2 text-xs rounded-xl focus:outline-none"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Vehicle Odometer (km)</label>
                <input
                  type="number"
                  value={odometer}
                  onChange={(e) => setOdometer(e.target.value)}
                  placeholder="Odometer in km"
                  className="w-full bg-slate-950 border border-white/10 p-2 text-xs rounded-xl focus:outline-none text-sky-300 font-mono"
                  required
                />
              </div>
            </div>

            {/* Compatibility Engine Custom Setup */}
            <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5 space-y-3">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" />
                <span>Vehicle Feature Compatibility Engine Setup</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Vehicle Category</label>
                  <select
                    value={vehicleCategory}
                    onChange={(e: any) => setVehicleCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 p-2 text-xs rounded-xl focus:outline-none text-white font-bold"
                  >
                    <option value="car">Car</option>
                    <option value="motorbike">Motorbike</option>
                    <option value="truck">Truck</option>
                    <option value="van">Van</option>
                    <option value="pickup">Pickup</option>
                    <option value="tuk tuk">Tuk Tuk</option>
                    <option value="bus">Bus</option>
                    <option value="EV">EV</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="heavy equipment">Heavy Equipment</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Engine Type</label>
                  <select
                    value={engineTypeNew}
                    onChange={(e: any) => setEngineTypeNew(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 p-2 text-xs rounded-xl focus:outline-none text-white font-bold"
                  >
                    <option value="petrol">Petrol</option>
                    <option value="diesel">Diesel</option>
                    <option value="electric">Electric</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="plug-in hybrid">Plug-in Hybrid</option>
                    <option value="LPG/CNG">LPG/CNG</option>
                    <option value="unknown">Unknown</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Fuel / Energy Type</label>
                  <select
                    value={fuelEnergyType}
                    onChange={(e: any) => setFuelEnergyType(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 p-2 text-xs rounded-xl focus:outline-none text-white font-bold"
                  >
                    <option value="petrol">Petrol</option>
                    <option value="diesel">Diesel</option>
                    <option value="electric">Electric</option>
                    <option value="petrol + electric">Petrol + Electric</option>
                    <option value="diesel + electric">Diesel + Electric</option>
                    <option value="gas">Gas</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Transmission Type</label>
                  <select
                    value={transmissionType}
                    onChange={(e: any) => setTransmissionType(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 p-2 text-xs rounded-xl focus:outline-none text-white font-bold"
                  >
                    <option value="manual">Manual</option>
                    <option value="automatic">Automatic</option>
                    <option value="CVT">CVT</option>
                    <option value="EV single-speed">EV Single-Speed</option>
                    <option value="unknown">Unknown</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Usage Type</label>
                  <select
                    value={usageType}
                    onChange={(e: any) => setUsageType(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 p-2 text-xs rounded-xl focus:outline-none text-white font-bold"
                  >
                    <option value="personal">Personal</option>
                    <option value="family">Family</option>
                    <option value="company">Company</option>
                    <option value="delivery">Delivery</option>
                    <option value="taxi">Taxi</option>
                    <option value="ride-hailing">Ride-Hailing</option>
                    <option value="fleet">Fleet</option>
                    <option value="rental">Rental</option>
                    <option value="off-road">Off-Road</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Structural Boundaries Checklist */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Vehicle Type Classification</label>
                <select
                  value={vType}
                  onChange={(e) => setVType(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 p-2 text-xs rounded-xl focus:outline-none"
                >
                  <option value="Car">Car</option>
                  <option value="SUV">SUV</option>
                  <option value="Pickup">Pickup</option>
                  <option value="Van">Van</option>
                  <option value="Truck">Truck</option>
                  <option value="Motorcycle">Motorcycle</option>
                  <option value="Bus">Bus</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Official Cambodia Plate ID</label>
                <input
                  type="text"
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value)}
                  placeholder="e.g. PP-2AI-9988"
                  className="w-full bg-slate-950 border border-white/10 p-2 text-xs rounded-xl focus:outline-none font-mono"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Transmission Style</label>
                <select
                  value={transmission}
                  onChange={(e) => setTransmission(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 p-2 text-xs rounded-xl focus:outline-none"
                >
                  <option value="Automatic">Automatic</option>
                  <option value="Manual">Manual</option>
                  <option value="CVT">CVT</option>
                  <option value="Dual-Clutch">Dual-Clutch</option>
                  <option value="Single-Speed">Single-Speed / EV Direct</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Document upload & Owner fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Registered Owner</label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 p-2 text-xs rounded-xl focus:outline-none text-slate-200"
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Chassis ID (VIN) [17 chars]</label>
                <input
                  type="text"
                  value={chassisNumber}
                  onChange={(e) => setChassisNumber(e.target.value)}
                  placeholder="17 Character String"
                  className="w-full bg-slate-950 border border-white/10 p-2 text-xs rounded-xl focus:outline-none font-mono text-[11px]"
                />
              </div>

              <div className="space-y-1 mr-2 mt-auto">
                <div className="flex gap-2">
                  <div className="flex-1 bg-white/5 border border-white/10 p-1.5 rounded-xl flex items-center justify-center gap-1 cursor-pointer hover:bg-white/10">
                    <Camera className="w-3.5 h-3.5 text-sky-400" />
                    <span className="text-[9px] uppercase font-bold text-slate-300">Vehicle Image</span>
                  </div>
                  <div className="flex-1 bg-white/5 border border-white/10 p-1.5 rounded-xl flex items-center justify-center gap-1 cursor-pointer hover:bg-white/10">
                    <Upload className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-[9px] uppercase font-bold text-slate-300">Reg Card Scan</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ----------------- ENGINE TYPE ADAPTIVE SEGMENT ----------------- */}
            <div className="bg-sky-950/20 border border-sky-400/20 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-1.5 border-b border-sky-400/10 pb-2">
                <Cpu className="w-4 h-4 text-sky-400" />
                <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">
                  Powertrain Parameters: <span className="text-sky-300">{engineType}</span>
                </h4>
              </div>

              {/* Petrol / Gasoline adaptive UI */}
              {(engineType === "Petrol / Gasoline" || engineType === "Petrol Motorcycle") && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold">Gasoline Grade</label>
                    <select value={gasolineFuelType} onChange={(e) => setGasolineFuelType(e.target.value as any)} className="w-full bg-slate-950 p-2 rounded-lg border border-white/5">
                      <option value="Regular 92">Regular 92 octane</option>
                      <option value="Premium 95">Premium 95 octane</option>
                      <option value="Super 98">Super 98 octane</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold font-mono">Engine Size (liters or cc)</label>
                    <input type="text" value={gasolineEngineSize} onChange={(e) => setGasolineEngineSize(e.target.value)} className="w-full bg-slate-950 p-2 rounded-lg border border-white/5 font-mono" placeholder="e.g. 2.5L, 125cc" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold">Oil Change Interval (km)</label>
                    <input type="number" value={gasolineOilInterval} onChange={(e) => setGasolineOilInterval(e.target.value)} className="w-full bg-slate-950 p-2 rounded-lg border border-white/5 font-mono" placeholder="5000" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold">Fuel Consumption Estimate</label>
                    <input type="text" value={gasolineConsumption} onChange={(e) => setGasolineConsumption(e.target.value)} className="w-full bg-slate-950 p-2 rounded-lg border border-white/5 font-mono" placeholder="e.g. 8.5L/100km" />
                  </div>
                </div>
              )}

              {/* Diesel adaptive UI */}
              {engineType === "Diesel" && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold">Engine displacement size</label>
                    <input type="text" value={dieselEngineSize} onChange={(e) => setDieselEngineSize(e.target.value)} className="w-full bg-slate-950 p-2 rounded-lg border border-white/5 font-mono" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold block">Turbocharger Installed?</label>
                    <div className="flex gap-2 pt-1">
                      <button type="button" onClick={() => setDieselHasTurbo(true)} className={`flex-1 py-1 px-2 rounded font-bold text-[10px] ${dieselHasTurbo ? 'bg-sky-500 text-slate-950' : 'bg-slate-900 border border-white/5 text-slate-400'}`}>YES</button>
                      <button type="button" onClick={() => setDieselHasTurbo(false)} className={`flex-1 py-1 px-2 rounded font-bold text-[10px] ${!dieselHasTurbo ? 'bg-sky-500 text-slate-950' : 'bg-slate-900 border border-white/5 text-slate-400'}`}>NO</button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold block">DPF Exhaust Filter?</label>
                    <div className="flex gap-2 pt-1">
                      <button type="button" onClick={() => setDieselHasDpf(true)} className={`flex-1 py-1 px-2 rounded font-bold text-[10px] ${dieselHasDpf ? 'bg-sky-500 text-slate-950' : 'bg-slate-900 border border-white/5 text-slate-400'}`}>YES</button>
                      <button type="button" onClick={() => setDieselHasDpf(false)} className={`flex-1 py-1 px-2 rounded font-bold text-[10px] ${!dieselHasDpf ? 'bg-sky-500 text-slate-950' : 'bg-slate-900 border border-white/5 text-slate-400'}`}>NO</button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold">Fuel Filter Swap (km)</label>
                    <input type="number" value={dieselFuelFilterInterval} onChange={(e) => setDieselFuelFilterInterval(e.target.value)} className="w-full bg-slate-950 p-2 rounded-lg border border-white/5 font-mono" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold font-mono">Oil Lube Interval (km)</label>
                    <input type="number" value={dieselOilInterval} onChange={(e) => setDieselOilInterval(e.target.value)} className="w-full bg-slate-950 p-2 rounded-lg border border-white/5 font-mono" />
                  </div>
                </div>
              )}

              {/* Hybrid and PHEV segment */}
              {(engineType === "Hybrid" || engineType === "Plug-in Hybrid / PHEV") && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold">Hybrid Configuration</label>
                    <select value={hybridType} onChange={(e) => setHybridType(e.target.value as any)} className="w-full bg-slate-950 p-2 rounded-lg border border-white/5 font-semibold">
                      <option value="Mild Hybrid">Mild Hybrid (MHEV)</option>
                      <option value="Full Hybrid">Full Hybrid (FHEV)</option>
                      <option value="Plug-in Hybrid">Plug-in Hybrid (PHEV)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold font-mono">Engine displacement</label>
                    <input type="text" value={hybridEngineSize} onChange={(e) => setHybridEngineSize(e.target.value)} className="w-full bg-slate-950 p-2 rounded-lg border border-white/5 font-mono" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold">Battery SOH State (%)</label>
                    <input type="number" value={hybridBatteryHealth} onChange={(e) => setHybridBatteryHealth(e.target.value)} className="w-full bg-slate-950 p-2 rounded-lg border border-white/5 font-mono text-emerald-400" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold font-mono">Charge Pure Range (km)</label>
                    <input type="number" value={hybridEvRange} onChange={(e) => setHybridEvRange(e.target.value)} className="w-full bg-slate-950 p-2 rounded-lg border border-white/5 font-mono" placeholder="0 if non-plug-in" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold">Cell Diagnostic Interval (km)</label>
                    <input type="number" value={hybridInspectionInterval} onChange={(e) => setHybridInspectionInterval(e.target.value)} className="w-full bg-slate-950 p-2 rounded-lg border border-white/5 font-mono" />
                  </div>
                </div>
              )}

              {/* Fully Electric segments */}
              {(engineType === "EV / Fully Electric Vehicle" || engineType === "Electric Motorcycle / E-Bike") && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold font-mono">Battery capacity in kWh</label>
                    <input type="number" value={evBatteryCapacity} onChange={(e) => setEvBatteryCapacity(e.target.value)} className="w-full bg-slate-950 p-2 rounded-lg border border-white/5 font-mono" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold">Battery Pack SOH (%)</label>
                    <input type="number" value={evBatteryHealth} onChange={(e) => setEvBatteryHealth(e.target.value)} className="w-full bg-slate-950 p-2 rounded-lg border border-white/5 font-mono text-emerald-400" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold font-mono">Full Charge Range (km)</label>
                    <input type="number" value={evDrivingRange} onChange={(e) => setEvDrivingRange(e.target.value)} className="w-full bg-slate-950 p-2 rounded-lg border border-white/5 font-mono" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold">Charging Speed Capabilities</label>
                    <select value={evChargingType} onChange={(e) => setEvChargingType(e.target.value as any)} className="w-full bg-slate-950 p-2 rounded-lg border border-white/5">
                      <option value="AC">AC Charging Only</option>
                      <option value="DC Fast Charge">DC Fast Charge Only</option>
                      <option value="Both">Both (AC & DC Combo)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold">Charging Port Type</label>
                    <input type="text" value={evChargingPortType} onChange={(e) => setEvChargingPortType(e.target.value)} className="w-full bg-slate-950 p-2 rounded-lg border border-white/5 font-mono" placeholder="Type 2, GB/T, CCS2" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold">Home Wallbox Charger?</label>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setEvHasHomeCharger(true)} className={`flex-1 py-1.5 rounded font-bold text-[10px] ${evHasHomeCharger ? 'bg-sky-500 text-slate-950' : 'bg-slate-900 border border-white/5 text-slate-400'}`}>YES</button>
                      <button type="button" onClick={() => setEvHasHomeCharger(false)} className={`flex-1 py-1.5 rounded font-bold text-[10px] ${!evHasHomeCharger ? 'bg-sky-500 text-slate-950' : 'bg-slate-900 border border-white/5 text-slate-400'}`}>NO</button>
                    </div>
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[10px] text-slate-400 font-bold">Battery Assembly Thermal Cooling System</label>
                    <select value={evBatteryCooling} onChange={(e) => setEvBatteryCooling(e.target.value as any)} className="w-full bg-slate-950 p-2 rounded-lg border border-white/5">
                      <option value="Liquid Cooled">Active Liquid Coolant Glycol System</option>
                      <option value="Air Cooled">Passive/Active Air Intake Fan Flow</option>
                      <option value="None">None (Uncooled Battery Shell)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* LPG / CNG Gas vehicle Segment */}
              {engineType === "LPG / CNG Gas Vehicle" && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold">LPG or CNG</label>
                    <select value={lpgCngType} onChange={(e) => setLpgCngType(e.target.value as any)} className="w-full bg-slate-950 p-2 rounded-lg border border-white/5 font-bold text-sky-400">
                      <option value="LPG">LPG (Liquefied Auto Gas)</option>
                      <option value="CNG">CNG (Compressed Natural Gas)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold block">Petrol Fuel Back-up Pump?</label>
                    <div className="flex gap-2 pt-1">
                      <button type="button" onClick={() => setLpgCngHasPetrolBackup(true)} className={`flex-1 py-1 px-2 rounded font-bold text-[10px] ${lpgCngHasPetrolBackup ? 'bg-sky-500 text-slate-950' : 'bg-slate-900 border border-white/5 text-slate-400'}`}>YES</button>
                      <button type="button" onClick={() => setLpgCngHasPetrolBackup(false)} className={`flex-1 py-1 px-2 rounded font-bold text-[10px] ${!lpgCngHasPetrolBackup ? 'bg-sky-500 text-slate-950' : 'bg-slate-900 border border-white/5 text-slate-400'}`}>NO</button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold">Tank Installation Date</label>
                    <input type="date" value={lpgCngInstallDate} onChange={(e) => setLpgCngInstallDate(e.target.value)} className="w-full bg-slate-950 p-2 rounded-lg border border-white/5" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold">Inspection Expiry Date</label>
                    <input type="date" value={lpgCngExpiryDate} onChange={(e) => setLpgCngExpiryDate(e.target.value)} className="w-full bg-slate-950 p-2 rounded-lg border border-white/5 text-rose-400 font-bold" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold">Gas Line Check (km)</label>
                    <input type="number" value={lpgCngInspectionInterval} onChange={(e) => setLpgCngInspectionInterval(e.target.value)} className="w-full bg-slate-950 p-2 rounded-lg border border-white/5 font-mono" />
                  </div>
                </div>
              )}

              {/* Motorcycle detailed elements */}
              {(engineType === "Petrol Motorcycle" || engineType === "Electric Motorcycle / E-Bike") && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold">Engine Size / Hub power</label>
                    <input type="text" value={motoEngineSize} onChange={(e) => setMotoEngineSize(e.target.value)} className="w-full bg-slate-950 p-2 rounded-lg border border-white/5 font-mono" placeholder="e.g. 125cc, 3kW" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold">Battery Sizing in kWh</label>
                    <input type="number" value={motoBatteryCapacity} onChange={(e) => setMotoBatteryCapacity(e.target.value)} className="w-full bg-slate-950 p-2 rounded-lg border border-white/5 font-mono" placeholder="0 if Petrol" disabled={engineType === "Petrol Motorcycle"} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold">Max Pure Range (km)</label>
                    <input type="number" value={motoRange} onChange={(e) => setMotoRange(e.target.value)} className="w-full bg-slate-950 p-2 rounded-lg border border-white/5 font-mono" placeholder="0 if Petrol" disabled={engineType === "Petrol Motorcycle"} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold">Full Charge Time (hrs)</label>
                    <input type="number" value={motoChargingTime} onChange={(e) => setMotoChargingTime(e.target.value)} className="w-full bg-slate-950 p-2 rounded-lg border border-white/5 font-mono" placeholder="0 if Petrol" disabled={engineType === "Petrol Motorcycle"} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold">Chain or Belt Drive</label>
                    <select value={motoDriveType} onChange={(e) => setMotoDriveType(e.target.value as any)} className="w-full bg-slate-950 p-2 rounded-lg border border-white/5">
                      <option value="Chain">Robust Metal Chain System</option>
                      <option value="Belt">Silent Rubber Kevlar Belt</option>
                      <option value="Shaft">Enclosed Driveshaft Gear</option>
                      <option value="Direct Hub Drive">Direct Electric Hub Motor</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-bold uppercase">Administrative / Custom Maintenance Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Declare any additional vehicle attributes here..."
                className="w-full h-16 bg-slate-950 border border-white/10 p-2.5 text-xs rounded-xl focus:outline-none focus:border-sky-500 text-slate-200"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-sky-500 hover:bg-sky-600 font-extrabold text-slate-950 text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-1.5 shadow-xl transition-all"
            >
              <Check className="w-4 h-4 text-slate-950" />
              <span>Confirm Official Classification & Generate Reports</span>
            </button>
          </form>
        </div>
      )}

      {/* ----------------- CAR OWNER: APPROVAL TASKS WORKSPACE ----------------- */}
      {activeRole === 'Car Owner' && pendingServices.length > 0 && (
        <div className="bg-amber-950/20 border border-amber-500/35 rounded-3xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center gap-1.5">
            <UserCheck className="w-4.5 h-4.5 text-amber-500 animate-pulse" />
            <h3 className="text-white font-extrabold text-xs tracking-wider uppercase">
              Pending Garage Approval Requests ({pendingServices.length})
            </h3>
          </div>
          <p className="text-[11px] text-slate-350">
            A registered Cambodian garage has performed work and requested official integration of their diagnostic log into your car's digital registry history log. Confirm to approve:
          </p>
          <div className="space-y-3">
            {pendingServices.map((item) => (
              <div key={item.id} className="bg-slate-905 bg-slate-900 border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-black text-slate-100">{item.vehicleLabel}</span>
                    <span className="text-[9px] bg-amber-500/10 text-amber-400 uppercase font-bold px-2 rounded-full border border-amber-500/20">Approval Pending</span>
                  </div>
                  <p className="text-[11px] text-slate-450 text-slate-350">
                    Category: <strong className="text-sky-300 font-semibold">{item.serviceCategory}</strong> at <strong className="text-white">{item.providerName}</strong>
                  </p>
                  <p className="text-[11px] text-slate-400 italic">
                    &quot;{item.note}&quot;
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    Service Mileage: {item.mileage.toLocaleString()} km • Cost Charged: ${item.cost} USD • Date: {item.serviceDate}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleApproveService(item)}
                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 font-bold text-slate-950 text-[10px] uppercase rounded-xl transition flex items-center gap-1 cursor-pointer"
                  >
                    <ThumbsUp className="w-3 h-3 text-slate-950" />
                    <span>Approve to DB</span>
                  </button>
                  <button
                    onClick={() => handleRejectService(item)}
                    className="px-3 py-1.5 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/20 text-rose-450 text-rose-450 text-rose-400 font-bold text-[10px] uppercase rounded-xl transition flex items-center gap-1 cursor-pointer"
                  >
                    <ThumbsDown className="w-3 h-3 cursor-pointer" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ----------------- GARAGE OWNER: QR SCAN SIMULATION WORKSPACE ----------------- */}
      {activeRole === 'Garage Owner' && (
        <div className="bg-slate-900 border border-white/10 rounded-3xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-1.5">
              <QrCode className="w-5 h-5 text-emerald-400 animate-pulse" />
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Garage Bay Station</h3>
                <p className="text-[10px] text-emerald-400">Scan customer QR codes to pull up dynamic engine spec recommendations</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Left Box: Customer Scanner */}
            <div className="p-4 bg-slate-950 border border-white/5 rounded-2xl flex flex-col justify-between min-h-[230px]">
              {isScanningQr ? (
                <div className="relative overflow-hidden w-full h-full min-h-[210px] bg-slate-900 border border-emerald-500/35 rounded-2xl flex flex-col items-center justify-center p-4">
                  <style dangerouslySetInnerHTML={{__html: `
                    @keyframes qrscan {
                      0% { top: 15%; }
                      50% { top: 85%; }
                      100% { top: 15%; }
                    }
                  `}} />
                  {/* Styled Box Viewfinder Corners */}
                  <div className="absolute top-4 left-4 w-5 h-5 border-t-2 border-l-2 border-emerald-400 rounded-tl-sm animate-pulse" />
                  <div className="absolute top-4 right-4 w-5 h-5 border-t-2 border-r-2 border-emerald-400 rounded-tr-sm animate-pulse" />
                  <div className="absolute bottom-4 left-4 w-5 h-5 border-b-2 border-l-2 border-emerald-400 rounded-bl-sm animate-pulse" />
                  <div className="absolute bottom-4 right-4 w-5 h-5 border-b-2 border-r-2 border-emerald-400 rounded-br-sm animate-pulse" />

                  {/* Active Scanning Laser Sweeper Line */}
                  <div className="absolute left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-rose-500 to-transparent shadow-[0_0_12px_2px_rgba(244,63,94,0.85)]" style={{ animation: 'qrscan 2s infinite ease-in-out', position: 'absolute' }} />
                  
                  <QrCode className="w-12 h-12 text-slate-700 animate-pulse mb-2" />
                  <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase animate-pulse">CAPTURING QR CODE MATRIX...</span>
                  <span className="text-[9px] font-mono text-slate-500 mt-2 text-center">LOCK ON VEHICLE LEDGER NODES</span>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-355 text-slate-300 uppercase">Customer QR Odometer Lock Scanner</h4>
                    <p className="text-[11px] text-slate-400">
                      Simulate QR scanner capture by selecting one of our classified vehicles on the registered platform:
                    </p>
                    
                    <select
                      value={scannedVehicleId}
                      onChange={(e) => setScannedVehicleId(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 p-2 text-xs rounded-xl text-white outline-none"
                    >
                      <option value="">-- Choose Registered Vehicle profile --</option>
                      {vehicles.map(v => (
                        <option key={v.id} value={v.id}>
                          {v.owner || "Owner"} - {v.brand} {v.model} ({v.plateNumber || "No Plate"}) [{v.engineType || "Petrol"}]
                        </option>
                      ))}
                    </select>

                    {qrErrorMessage && (
                      <p className="text-[10px] text-red-400 font-semibold">{qrErrorMessage}</p>
                    )}
                  </div>

                  <button
                    onClick={handleSimulateScan}
                    className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 font-extrabold text-slate-950 text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-lg transition cursor-pointer mt-2"
                  >
                    <QrCode className="w-4 h-4 text-slate-950" />
                    <span>Simulate Camera Scan QR Code</span>
                  </button>
                </>
              )}
            </div>

            {/* Right Box: Quick Category Logger */}
            <div className="p-4 bg-slate-950 border border-white/5 rounded-2xl">
              <form onSubmit={handleGarageServiceSubmit} className="space-y-3">
                <h4 className="text-xs font-bold text-slate-350 uppercase flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-sky-400" />
                  <span>Log Service Work for: {selectedV ? `${selectedV.brand} ${selectedV.model}` : "No Vehicle Scanned"}</span>
                </h4>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase font-semibold">Service Category</label>
                    <select
                      value={garageServiceCategory}
                      onChange={(e) => setGarageServiceCategory(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 p-1.5 text-xs rounded-lg text-white"
                      disabled={!selectedV}
                    >
                      <option value="Engine Oil Service">Engine Oil Service</option>
                      <option value="HV Battery diagnostic Check">HV Battery diagnostic Check</option>
                      <option value="LPG Regulation Recalibration">LPG Regulation Recalibration</option>
                      <option value="Diesel DPF Exhaust Clean">Diesel DPF Exhaust Clean</option>
                      <option value="EV Port rain seal swap">EV Port rain seal swap</option>
                      <option value="Brake Pad Friction service">Brake Pad Friction service</option>
                      <option value="Wheel tracking Alignment">Wheel tracking Alignment</option>
                      <option value="Custom Powertrain Tune">Custom Powertrain Tune</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase font-semibold font-mono">Invoice Cost (USD)</label>
                    <input
                      type="number"
                      value={garageServiceCost}
                      onChange={(e) => setGarageServiceCost(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 p-1.5 text-xs rounded-lg text-white font-mono"
                      disabled={!selectedV}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase font-semibold">Work details note</label>
                  <textarea
                    value={garageServiceDesc}
                    onChange={(e) => setGarageServiceDesc(e.target.value)}
                    placeholder="Describe parts replaced, oil viscosities used, etc."
                    className="w-full h-11 bg-slate-900 border border-white/10 p-1.5 text-xs rounded-lg text-white resize-none"
                    disabled={!selectedV}
                  />
                </div>

                <button
                  type="submit"
                  disabled={!selectedV}
                  className="w-full py-2 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-800 disabled:text-slate-500 font-extrabold text-slate-950 text-xs rounded-xl flex items-center justify-center gap-1.5 transition"
                >
                  <UserCheck className="w-3.5 h-3.5 text-slate-950" />
                  <span>Request Customer App-Approval</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- MECHANIC: VIEW ASSIGNED FLEET ----------------- */}
      {activeRole === 'Mechanic' && (
        <div className="bg-slate-900 border border-white/10 rounded-3xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center gap-1.5 pb-2 border-b border-white/10">
            <Wrench className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Assigned Mechanic Board</h3>
              <p className="text-[10px] text-slate-400">View diagnostic parameters registered by owners for precise engine component alignments</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vehicles.map(v => (
              <div key={v.id} className="bg-slate-950 border border-white/5 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-300">{v.brand} {v.model} ({v.year})</span>
                  <span className="text-[9px] bg-white/5 text-slate-350 px-2.5 py-0.5 rounded-full font-bold uppercase">{v.engineType || "Petrol"}</span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono space-y-0.5">
                  <p>Registered Plate: <strong className="text-white">{v.plateNumber}</strong></p>
                  <p>Odometer index: <strong className="text-white">{v.mileage.toLocaleString()} km</strong></p>
                  <p>VIN / Chassis: <strong className="text-slate-300">{v.chassisNumber || "N/A"}</strong></p>
                </div>
                <div className="pt-2 border-t border-white/5">
                  <span className="text-[9px] block text-slate-500 font-bold uppercase">Dynamic Powertrain specs for repair targeting:</span>
                  <ul className="text-[10px] text-slate-400 list-disc pl-4 space-y-0.5">
                    {v.engineType === "Diesel" && (
                      <>
                        <li>Diesel Engine Sizing: {v.dieselEngineSize || "Unknown"}</li>
                        <li>TwinScroll Turbo Installed: {v.dieselHasTurbo ? "YES" : "NO"}</li>
                        <li>DPF Catalyst: {v.dieselHasDpf ? "YES" : "NO"}</li>
                      </>
                    )}
                    {v.engineType?.includes("Hybrid") && (
                      <>
                        <li>Class: {v.hybridType || "Full"} ({v.hybridEngineSize || "1.8L"})</li>
                        <li>Hybrid Battery SOH index: {v.hybridBatteryHealth || "85"}%</li>
                        <li>Hybrid Ev Pure Range: {v.hybridEvRange ? `${v.hybridEvRange}km` : "0"}</li>
                      </>
                    )}
                    {v.engineType?.includes("EV") && (
                      <>
                        <li>Pack Sizing KWh: {v.evBatteryCapacity || "60"} kWh</li>
                        <li>Pack SOH Index: {v.evBatteryHealth || "95"}%</li>
                        <li>Cooling Assembly: {v.evBatteryCoolingType || "Liquid"}</li>
                      </>
                    )}
                    {!v.engineType?.includes("EV") && !v.engineType?.includes("Hybrid") && v.engineType !== "Diesel" && (
                      <>
                        <li>Gasoline Oil Interval: {v.oilChangeInterval || 5000} km</li>
                        <li>Engine displacement: {v.engineSize || "N/A"}</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ----------------- PRIMARY REGISTRATION GRID ----------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Registered Fleet Classifications */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-5 space-y-3 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center justify-between border-b border-white/10 pb-2.5">
              <span>Classified Fleet Registry</span>
              <span className="text-[11px] text-sky-400 font-bold font-mono">({vehicles.length} Units)</span>
            </h3>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {vehicles.map((v) => (
                <div
                  key={v.id}
                  onClick={() => setSelectedV(v)}
                  className={`p-3.5 rounded-2xl border transition cursor-pointer text-xs space-y-2 relative flex items-center gap-3 ${
                    selectedV?.id === v.id
                      ? 'bg-sky-505 bg-sky-500/10 border-sky-500/40 shadow-lg shadow-sky-500/5'
                      : 'bg-slate-950 border-white/5 hover:border-white/15'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-slate-800 border border-white/10">
                    <img referrerPolicy="no-referrer" src={v.photoUrl || "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=400"} alt="vehicle preview" className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-slate-100 truncate">{v.brand} {v.model}</h4>
                      <span className="text-[9px] font-mono text-zinc-500">{v.year}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-mono">{v.plateNumber || "NO-PLATE"}</span>
                      <span className="font-bold text-sky-400">{v.engineType || "Gasoline"}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>Owner: {v.owner || "Pisith"}</span>
                      <span className="font-mono">{v.mileage.toLocaleString()} km</span>
                    </div>
                  </div>

                  {activeRole === 'Admin' && (
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (confirm(`Remove vehicle ${v.brand} and delete historical log nodes?`)) {
                          try {
                            const res = await fetch(`/api/vehicles/${v.id}`, { method: "DELETE" });
                            if (res.ok) {
                              setVehicles(prev => prev.filter(item => item.id !== v.id));
                              if (selectedV?.id === v.id) {
                                setSelectedV(null);
                              }
                              onRefreshData();
                            }
                          } catch (err) {
                            console.error(err);
                          }
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-red-400 transition"
                      title="Admin Override: Archive Vehicle"
                    >
                      <Trash2 className="w-4 h-4 cursor-pointer" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Alert Notifications Feed based on engine types */}
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-5 space-y-3 shadow-xl">
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center justify-between pb-2 border-b border-white/10">
              <span className="flex items-center gap-1">
                <Bell className="w-4 h-4 text-sky-450 text-sky-400" />
                <span>Smart Powertrain Push-Log</span>
              </span>
              <span className="text-[10px] bg-red-450 bg-red-500 text-white font-black px-2 rounded-full">ACTIVE</span>
            </h3>
            
            <div className="space-y-2.5">
              {notifHistory.map((n) => (
                <div key={n.id} className="p-2.5 bg-slate-950 border border-white/5 rounded-xl space-y-0.5 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">{n.title}</span>
                    <span className="text-[9px] uppercase font-bold text-indigo-400">{n.type}</span>
                  </div>
                  <p className="text-slate-400 italic font-medium">{n.msg}</p>
                  <p className="text-[9px] text-slate-500 text-right">{n.date}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Powertrain Inspection Clinic & Recommender Engine */}
        <div className="lg:col-span-7 space-y-4">
          {selectedV ? (
            <div className="space-y-4">
              
              {/* Card 1: Active Specs sheet */}
              <div className="bg-slate-900 border border-white/10 rounded-3xl p-5 space-y-4 shadow-xl">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex gap-3 items-center">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-850 border border-white/10 shrink-0">
                      <img referrerPolicy="no-referrer" src={selectedV.photoUrl || "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=400"} alt="vehicle display" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm font-bold text-white">{selectedV.brand} {selectedV.model}</span>
                        <span className="text-[10px] bg-sky-500/10 text-sky-400 uppercase font-black px-2.5 py-0.5 rounded-full border border-sky-500/20">{selectedV.engineType || "Petrol"}</span>
                      </div>
                      <p className="text-[11px] text-slate-400">Classified Owner: <strong className="text-slate-200">{selectedV.owner || "Yeon Pisith"}</strong></p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setBrand(selectedV.brand);
                        setModel(selectedV.model);
                        setYear(String(selectedV.year));
                        setOdometer(String(selectedV.mileage));
                        setPlateNumber(selectedV.plateNumber || "");
                        setChassisNumber(selectedV.chassisNumber || "");
                        setNotes(selectedV.notes || "");
                        setEngineType(selectedV.engineType || "Petrol / Gasoline");
                        setTransmission(selectedV.transmission || "Automatic");
                        setVType(selectedV.vehicleType || "Car");
                        setVehicleCategory(selectedV.vehicleCategory || "car");
                        setEngineTypeNew(selectedV.engineTypeNew || "petrol");
                        setFuelEnergyType(selectedV.fuelEnergyType || "petrol");
                        setTransmissionType(selectedV.transmissionType || "automatic");
                        setUsageType(selectedV.usageType || "personal");
                        setValidationErrors([]);
                        setIsEditing(true);
                        setIsAdding(false);
                      }}
                      className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-slate-250 text-slate-100 font-bold text-[10px] uppercase rounded-xl border border-white/5 transition cursor-pointer"
                    >
                      Classified Edit
                    </button>
                    
                    <button
                      onClick={() => {
                        alert(`QR Code generated for physical asset scanning!\nUID: ${selectedV.id}\nOwner: ${selectedV.owner}\nPlate: ${selectedV.plateNumber}`);
                      }}
                      className="p-1 px-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] uppercase font-bold rounded-xl hover:bg-emerald-500/20 transition flex items-center gap-1 cursor-pointer"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Print Asset QR</span>
                    </button>
                  </div>
                </div>

                {isEditing && (
                  <div className="bg-slate-950 p-4 rounded-xl border border-white/5 space-y-3">
                    <h4 className="text-xs font-bold text-indigo-400 uppercase">Updating Powertrain Registry Settings</h4>
                    <form onSubmit={handleEditSubmit} className="space-y-3 text-xs">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400">Brand</label>
                          <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} className="w-full bg-slate-900 p-2 rounded-lg border border-white/5 text-white" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400">Model</label>
                          <input type="text" value={model} onChange={(e) => setModel(e.target.value)} className="w-full bg-slate-900 p-2 rounded-lg border border-white/5 text-white" />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400">Odometer mileage (km)</label>
                          <input type="number" value={odometer} onChange={(e) => setOdometer(e.target.value)} className="w-full bg-slate-900 p-2 rounded-lg border border-white/5 text-sky-400 font-mono" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400">Plate number</label>
                          <input type="text" value={plateNumber} onChange={(e) => setPlateNumber(e.target.value)} className="w-full bg-slate-900 p-2 rounded-lg border border-white/5 text-white font-mono" />
                        </div>
                      </div>

                      {/* Compatibility Engine Custom Setup */}
                      <div className="p-3 bg-slate-900 rounded-xl border border-white/5 space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">Feature Compatibility Setup</span>
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div className="space-y-1">
                            <label className="text-[9px] text-slate-400 uppercase">Category</label>
                            <select value={vehicleCategory} onChange={(e: any) => setVehicleCategory(e.target.value)} className="w-full bg-slate-950 border border-white/10 p-1.5 rounded-lg text-white font-semibold">
                              <option value="car">Car</option>
                              <option value="motorbike">Motorbike</option>
                              <option value="truck">Truck</option>
                              <option value="van">Van</option>
                              <option value="pickup">Pickup</option>
                              <option value="tuk tuk">Tuk Tuk</option>
                              <option value="bus">Bus</option>
                              <option value="EV">EV</option>
                              <option value="hybrid">Hybrid</option>
                              <option value="heavy equipment">Heavy Equipment</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] text-slate-400 uppercase">Engine Type</label>
                            <select value={engineTypeNew} onChange={(e: any) => setEngineTypeNew(e.target.value)} className="w-full bg-slate-950 border border-white/10 p-1.5 rounded-lg text-white font-semibold">
                              <option value="petrol">Petrol</option>
                              <option value="diesel">Diesel</option>
                              <option value="electric">Electric</option>
                              <option value="hybrid">Hybrid</option>
                              <option value="plug-in hybrid">Plug-in Hybrid</option>
                              <option value="LPG/CNG">LPG/CNG</option>
                              <option value="unknown">Unknown</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] text-slate-400 uppercase">Fuel/Energy</label>
                            <select value={fuelEnergyType} onChange={(e: any) => setFuelEnergyType(e.target.value)} className="w-full bg-slate-950 border border-white/10 p-1.5 rounded-lg text-white font-semibold">
                              <option value="petrol">Petrol</option>
                              <option value="diesel">Diesel</option>
                              <option value="electric">Electric</option>
                              <option value="petrol + electric">Petrol + Electric</option>
                              <option value="diesel + electric">Diesel + Electric</option>
                              <option value="gas">Gas</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] text-slate-400 uppercase">Transmission</label>
                            <select value={transmissionType} onChange={(e: any) => setTransmissionType(e.target.value)} className="w-full bg-slate-950 border border-white/10 p-1.5 rounded-lg text-white font-semibold">
                              <option value="manual">Manual</option>
                              <option value="automatic">Automatic</option>
                              <option value="CVT">CVT</option>
                              <option value="EV single-speed">EV Single-Speed</option>
                              <option value="unknown">Unknown</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1 text-[11px]">
                          <label className="text-[9px] text-slate-400 uppercase">Usage Type</label>
                          <select value={usageType} onChange={(e: any) => setUsageType(e.target.value)} className="w-full bg-slate-950 border border-white/10 p-1.5 rounded-lg text-white font-semibold">
                            <option value="personal">Personal</option>
                            <option value="family">Family</option>
                            <option value="company">Company</option>
                            <option value="delivery">Delivery</option>
                            <option value="taxi">Taxi</option>
                            <option value="ride-hailing">Ride-Hailing</option>
                            <option value="fleet">Fleet</option>
                            <option value="rental">Rental</option>
                            <option value="off-road">Off-Road</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button type="submit" className="flex-1 py-1.5 bg-sky-500 hover:bg-sky-600 font-bold text-slate-950 rounded-lg">Save Settings</button>
                        <button type="button" onClick={() => setIsEditing(false)} className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg">Dismiss</button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Grid layout showing custom powertrain registers */}
                <div className="space-y-1.5">
                  <span className="text-[9px] uppercase tracking-widest font-black text-slate-500 block">Cambodia Asset Classification Specifications</span>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    <div className="p-2 bg-slate-950 rounded-xl border border-white/5">
                      <span className="text-[10px] text-slate-500 block uppercase font-mono">VIN / Chassis</span>
                      <strong className="text-slate-200 font-mono text-[11px] truncate block">{selectedV.chassisNumber || "JTDKXXXXXXXXX"}</strong>
                    </div>
                    <div className="p-2 bg-slate-950 rounded-xl border border-white/5">
                      <span className="text-[10px] text-slate-500 block uppercase">Transmission</span>
                      <strong className="text-slate-200 font-mono block">{selectedV.transmission || "Automatic"}</strong>
                    </div>
                    <div className="p-2 bg-slate-950 rounded-xl border border-white/5">
                      <span className="text-[10px] text-slate-500 block uppercase">Plate number</span>
                      <strong className="text-slate-200 text-sky-300 font-mono block">{selectedV.plateNumber || "PP-2A-1823"}</strong>
                    </div>
                    <div className="p-2 bg-slate-950 rounded-xl border border-white/5">
                      <span className="text-[10px] text-slate-500 block uppercase">Year / Age</span>
                      <strong className="text-slate-200 font-mono block">{selectedV.year} ({new Date().getFullYear() - selectedV.year} Yrs)</strong>
                    </div>
                  </div>
                </div>

                {/* Adaptive SPEC list based on engine type */}
                <div className="p-4 bg-indigo-950/20 border border-indigo-400/25 rounded-2xl text-xs space-y-2">
                  <span className="font-extrabold text-white text-[11px] uppercase tracking-wider block">Powertrain Custom Registers</span>
                  
                  {selectedV.engineType === "Diesel" && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-slate-300">
                      <div>Engine displacement: <strong>{selectedV.dieselEngineSize || "2.2L"}</strong></div>
                      <div>Twin-charging system: <strong>{selectedV.dieselHasTurbo ? "Yes (Bi-turbo)" : "No"}</strong></div>
                      <div>DPF Active Filter: <strong>{selectedV.dieselHasDpf ? "Yes" : "No"}</strong></div>
                      <div>Oil interval: <strong>{selectedV.dieselOilChangeInterval || 7500} km</strong></div>
                    </div>
                  )}

                  {(selectedV.engineType?.includes("Hybrid") || selectedV.engineType?.includes("PHEV")) && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-slate-300">
                      <div>Hybrid level: <strong>{selectedV.hybridType || "Full Hybrid"}</strong></div>
                      <div>Combustion displacement: <strong>{selectedV.hybridEngineSize || "1.8L"}</strong></div>
                      <div>HV Battery State: <strong>{selectedV.hybridBatteryHealth || "85"}% SOH</strong></div>
                      <div>Inspection: <strong>Every {selectedV.hybridBatteryInspectionInterval || 12000} km</strong></div>
                    </div>
                  )}

                  {selectedV.engineType?.includes("EV") && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-slate-300">
                      <div>Pack capacity: <strong>{selectedV.evBatteryCapacity || "65"} kWh</strong></div>
                      <div>Diagnostic SOH: <strong>{selectedV.evBatteryHealth || "94"}% SOH</strong></div>
                      <div>Air-con cooling: <strong>{selectedV.evBatteryCoolingType || "Liquid"}</strong></div>
                      <div>Fast Charge compatible: <strong>{selectedV.evChargingType || "Both"}</strong></div>
                    </div>
                  )}

                  {selectedV.engineType === "LPG / CNG Gas Vehicle" && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-slate-300">
                      <div>Gas Type: <strong>{selectedV.lpgCngType || "LPG"}</strong></div>
                      <div>Petrol Backup pipeline: <strong>{selectedV.lpgCngHasPetrolBackup ? "Yes" : "No"}</strong></div>
                      <div>Inspection Expiration: <strong>{selectedV.lpgCngTankInspectionExpiryDate || "N/A"}</strong></div>
                    </div>
                  )}

                  {selectedV.engineType?.includes("Motorcycle") && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-slate-300">
                      <div>Engine / Power rating: <strong>{selectedV.motorcycleEngineSizeCc || "125cc"}</strong></div>
                      <div>Gearing drive mechanism: <strong>{selectedV.motorcycleDriveType || "Chain"}</strong></div>
                      <div>Battery Sizing: <strong>{selectedV.motorcycleBatteryCapacityKwh || "0"} kWh</strong></div>
                    </div>
                  )}

                  {(!selectedV.engineType || selectedV.engineType === "Petrol / Gasoline") && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-slate-300">
                      <div>Lube grade: <strong>{selectedV.gasolineFuelType || "Regular 92"}</strong></div>
                      <div>Cylinder size: <strong>{selectedV.engineSize || "2.0L"}</strong></div>
                      <div>Lube interval: <strong>{selectedV.oilChangeInterval || 5050} km</strong></div>
                      <div>Average consumption: <strong>{selectedV.fuelConsumptionEstimate || "7.8L/100km"}</strong></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Maintenance Recommended Mapping Engine */}
              <div className="bg-slate-900 border border-white/10 rounded-3xl p-5 space-y-4 shadow-xl">
                <div className="flex items-center gap-1.5 border-b border-white/10 pb-2.5">
                  <Sliders className="w-5 h-5 text-sky-400" />
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Dynamic Recommender Engine</h3>
                    <p className="text-[10px] text-slate-400">Classified recommended items for: <span className="text-white hover:underline">{selectedV.engineType || "Petrol"}</span></p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {getRecommendedChecklist(selectedV).slice(0, 6).map((item, idx) => (
                    <div key={idx} className="p-3 bg-slate-950 border border-white/5 rounded-2xl space-y-1">
                      <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block">{item.category}</span>
                      <p className="text-[11px] text-slate-350">{item.desc}</p>
                      <div className="flex items-center gap-1 pt-1.5 border-t border-white/5 mt-1.5 text-[9px] font-mono text-slate-500">
                        <Clock className="w-3 h-3 text-emerald-400" />
                        <span>{item.interval}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 3: Dynamic notifications and warnings */}
              <div className="bg-slate-900 border border-white/10 rounded-3xl p-5 space-y-4 shadow-xl">
                <div className="flex items-center gap-1.5 border-b border-white/10 pb-2.5">
                  <AlertTriangle className="w-5 h-5 text-rose-450 text-rose-400 animate-bounce" />
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Active Threshold Alerts</h3>
                    <p className="text-[10px] text-slate-400">Automatic computations calculated from Cambodia climate degradation maps</p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {calculateEngineSpecificReminders(selectedV).length === 0 ? (
                    <div className="text-center py-4 bg-slate-950/40 rounded-2xl border border-white/5 text-[11px] text-slate-400">
                      ✅ All dynamic maintenance thresholds have clear perfect records. No immediate alerts flagged.
                    </div>
                  ) : (
                    calculateEngineSpecificReminders(selectedV).map((rem, idx) => (
                      <div key={idx} className="p-3 bg-slate-950 border border-white/5 rounded-2xl flex items-center justify-between gap-3 text-xs">
                        <div className="space-y-0.5">
                          <span className="font-extrabold text-slate-200">{rem.title}</span>
                          <p className="text-slate-400 text-[11px] font-medium">{rem.notes}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <span className={`text-[9px] uppercase font-bold px-2.5 py-0.5 rounded-full ${
                            rem.status === "Overdue" 
                              ? "bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse" 
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          }`}>
                            {rem.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-10 flex flex-col items-center justify-center text-center space-y-3">
              <Car className="w-12 h-12 text-slate-600" />
              <p className="text-slate-400 text-xs">Please select a vehicle profile from the classified fleet registry on the left to verify target recommended classifications.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
