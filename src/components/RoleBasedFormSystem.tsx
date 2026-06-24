import React, { useState, useEffect } from "react";
import { 
  User, 
  Car, 
  Wrench, 
  QrCode, 
  Check, 
  X, 
  MapPin, 
  FileText, 
  Sliders, 
  ShieldAlert, 
  AlertTriangle, 
  Clock, 
  Plus, 
  Trash2, 
  Eye, 
  Save, 
  Info, 
  RotateCcw, 
  Sparkles, 
  Globe, 
  Upload, 
  Shield, 
  Tag, 
  Compass, 
  Search,
  MessageSquare,
  ListFilter
} from "lucide-react";
import { UserProfile, VehicleProfile, MaintenanceRecord } from "../types";

// Inner interfaces for database structure requested by the user
export interface UserRoleRecord {
  id: number;
  userUid: string;
  role: string;
  createdAt: string;
}

export interface VehicleQrCodeRecord {
  id: string; // QR token
  vehicleId: string;
  secureToken: string;
  qrImageBase64: string;
  createdAt: string;
}

export interface ServiceTicketRecord {
  id: string;
  vehicleId: string;
  vehicleName: string;
  ownerName: string;
  garageId: string;
  garageName: string;
  serviceDate: string;
  serviceMileage: number;
  serviceType: string;
  description: string;
  partsChanged: string;
  laborCost: number;
  partsCost: number;
  totalCost: number;
  receiptPhotoUrl?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  rejectionReason?: string;
  createdBy: 'Owner' | 'Garage' | 'Mechanic' | 'Admin';
  createdAt: string;
}

export interface GarageProfileRecord {
  id: string;
  userUid: string;
  garageName: string;
  ownerName: string;
  phone: string;
  telegram?: string;
  address: string;
  lat: number;
  lng: number;
  openingHours: string;
  servicesOffered: string[];
  staffList: { name: string; permission: string }[];
  businessVerificationDocs?: string;
  status: 'Pending' | 'Approved' | 'Suspended';
}

export interface VerificationRequestRecord {
  id: string;
  userUid: string;
  businessType: 'Garage' | 'SparePart' | 'Petrol' | 'EVCharging' | 'Freelancer';
  businessId: string;
  businessName: string;
  submittedDocuments: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  reviewNotes?: string;
  createdAt: string;
}

interface RoleBasedFormProps {
  userProfile: UserProfile | null;
  vehicles: VehicleProfile[];
  records: MaintenanceRecord[];
  onRefreshData: () => Promise<void>;
  onAddVehicleExternal?: (vehicle: any) => Promise<void>;
  onAddRecordExternal?: (record: any) => Promise<void>;
}

export default function RoleBasedFormSystem({
  userProfile,
  vehicles,
  records,
  onRefreshData,
}: RoleBasedFormProps) {
  // Localization state
  const [lang, setLang] = useState<'EN' | 'KH'>('EN');

  // Multi-step Onboarding State
  const [activeStep, setActiveStep] = useState<number>(1);
  const [draftSaved, setDraftSaved] = useState<boolean>(false);

  // Translate utility helper
  const t = (en: string, kh: string) => (lang === 'EN' ? en : kh);

  // ------------------ Step States ------------------
  // Step 1: Basic Information
  const [basicName, setBasicName] = useState(userProfile?.name || "Yeon Pisith");
  const [basicEmail, setBasicEmail] = useState(userProfile?.email || "pisith.yeen@gmail.com");
  const [basicPhone, setBasicPhone] = useState(userProfile?.phone || "+855 12 345 678");
  const [basicTelegram, setBasicTelegram] = useState("@pisith_mcc");
  const [phoneError, setPhoneError] = useState("");

  // Step 2: Role Selection (Multiple allowed)
  const [selectedRoles, setSelectedRoles] = useState<string[]>(
    userProfile ? [userProfile.role] : ["Vehicle Owner"]
  );

  // Step 3: Vehicle Registration (Conditional on Vehicle Owner role checking)
  const [nickname, setNickname] = useState("My Black Cruiser");
  const [vType, setVType] = useState<'Sedan' | 'SUV' | 'Pickup' | 'Van' | 'Moto' | 'Truck' | 'Other'>("Pickup");
  const [brand, setBrand] = useState("Toyota");
  const [model, setModel] = useState("Tacoma");
  const [year, setYear] = useState("2010");
  const [plateNumber, setPlateNumber] = useState("PP-2AB-4589");
  const [engineType, setEngineType] = useState("Petrol / Gasoline");
  const [fuelType, setFuelType] = useState<'Gasoline' | 'Diesel' | 'EV' | 'Hybrid'>("Gasoline");
  const [transmission, setTransmission] = useState<'Automatic' | 'Manual' | 'CVT'>("Automatic");
  const [currentMileage, setCurrentMileage] = useState("186500");
  const [vehicleCondition, setVehicleCondition] = useState("Excellent");
  const [lastServiceDate, setLastServiceDate] = useState("2026-05-15");
  const [lastServiceMileage, setLastServiceMileage] = useState("180500");
  const [roadTaxExpiry, setRoadTaxExpiry] = useState("2026-09-30");
  const [insuranceExpiry, setInsuranceExpiry] = useState("2026-12-31");
  const [techInspectionExpiry, setTechInspectionExpiry] = useState("2027-04-15");
  const [ownershipStatus, setOwnershipStatus] = useState("Sole Owner");
  const [vehiclePhoto, setVehiclePhoto] = useState<string>("");

  // Step 3b: Business Registration (Conditional on Business Owner roles checked)
  const [bName, setBName] = useState("Angkor Elite Maintenance & Spares");
  const [bOwnerName, setBOwnerName] = useState("Yeon Pisith");
  const [bPhone, setBPhone] = useState("+855 12 345 678");
  const [bTelegram, setBTelegram] = useState("@angkor_elite");
  const [bAddress, setBAddress] = useState("St. 271, Sangkat Stueng Mean Chey, Phnom Penh");
  const [bOpeningHours, setBOpeningHours] = useState("08:00 AM - 06:00 PM");
  const [bServicesOffered, setBServicesOffered] = useState<string[]>([
    "Engine Diagnostics", "Oil Change Service", "Brake Overhaul", "A/C Gas Charging"
  ]);
  const [newServiceOffered, setNewServiceOffered] = useState("");
  
  // Staff list
  const [staffList, setStaffList] = useState<{name: string, permission: string}[]>([
    { name: "Sok Sophal", permission: "Senior Mechanic" },
    { name: "Keo Socheat", permission: "Assistant Staff" }
  ]);
  const [newStaffName, setNewStaffName] = useState("");
  const [newStaffPerm, setNewStaffPerm] = useState("Mechanic");

  // Step 5: Location Map coordinates Simulation
  const [lat, setLat] = useState(11.5564);
  const [lng, setLng] = useState(104.9282);
  const [isMapPicking, setIsMapPicking] = useState(false);

  // Step 6: Documents base64 / scan simulation
  const [docFile, setDocFile] = useState<string>("");
  const [docCategory, setDocCategory] = useState("Patent Tax Registration Cert");

  // Notification states
  const [notifPush, setNotifPush] = useState(true);
  const [notifTelegram, setNotifTelegram] = useState(true);
  const [notifEmail, setNotifEmail] = useState(false);

  // Saved / Database local simulated state inside standard arrays
  const [allEnrolledVehicles, setAllEnrolledVehicles] = useState<VehicleProfile[]>(vehicles);
  const [qrCodesDb, setQrCodesDb] = useState<VehicleQrCodeRecord[]>([]);
  const [serviceTicketsDb, setServiceTicketsDb] = useState<ServiceTicketRecord[]>(() => {
    // Populate some initial pending tickets for demonstration/user pitch
    return [
      {
        id: "tkt-1",
        vehicleId: vehicles[0]?.id || "v1",
        vehicleName: vehicles[0] ? `${vehicles[0].brand} ${vehicles[0].model}` : "Toyota Tacoma 2006",
        ownerName: "Yeon Pisith",
        garageId: "g1",
        garageName: "Sokha Auto Garage",
        serviceDate: "2026-06-15",
        serviceMileage: 187000,
        serviceType: "Engine Lubrication Refresh",
        description: "Exchanged engine oil with premium synthetic lube, replaced metal oil-filter container and validated spark spark plugs spark plug gap.",
        partsChanged: "Mobil 5W-30 Synthetic Lube, OEM Filter Element",
        laborCost: 15,
        partsCost: 35,
        totalCost: 50,
        status: "Pending",
        createdBy: "Garage",
        createdAt: new Date().toISOString()
      },
      {
        id: "tkt-2",
        vehicleId: vehicles[0]?.id || "v1",
        vehicleName: vehicles[0] ? `${vehicles[0].brand} ${vehicles[0].model}` : "Toyota Tacoma 2006",
        ownerName: "Yeon Pisith",
        garageId: "g2",
        garageName: "EV & Hybrid Care Center",
        serviceDate: "2026-06-10",
        serviceMileage: 186800,
        serviceType: "Suspension inspection",
        description: "Front lower ball joints check, greased ball joint boots, and snug tightened all carrier bolts.",
        partsChanged: "None",
        laborCost: 20,
        partsCost: 0,
        totalCost: 20,
        status: "Pending",
        createdBy: "Garage",
        createdAt: new Date().toISOString()
      }
    ];
  });

  const [garagesDb, setGaragesDb] = useState<GarageProfileRecord[]>([
    {
      id: "sh-1",
      userUid: "user-owner-1",
      garageName: "Sokha Auto Repair Center",
      ownerName: "Yeon Pisith",
      phone: "+855 12 345 678",
      telegram: "@pisith_mcc",
      address: "No 45, St 143, BKK, Phnom Penh",
      lat: 11.5512,
      lng: 104.9189,
      openingHours: "08:00 AM - 05:30 PM",
      servicesOffered: ["Full Engine overhaul", "A/C Diagnostics", "Lube refitting"],
      staffList: [
        { name: "Sophal", permission: "Senior Diagnostic Specialist" }
      ],
      status: "Approved"
    }
  ]);

  const [verificationRequestsDb, setVerificationRequestsDb] = useState<VerificationRequestRecord[]>([
    {
      id: "vr-1",
      userUid: "user-garage-2",
      businessType: "Garage",
      businessId: "sh-1",
      businessName: "Sokha Auto Repair Center",
      submittedDocuments: "Business Patent No. Co-77182/2026, Identity Card scan.",
      status: "Pending",
      createdAt: new Date().toISOString()
    }
  ]);

  // QR Scanning Simulation Tool State
  const [selectedVehicleToScan, setSelectedVehicleToScan] = useState<string>("");
  const [retrievedScannedVehicle, setRetrievedScannedVehicle] = useState<VehicleProfile | null>(null);
  const [createdTktType, setCreatedTktType] = useState("Engine Oil Service");
  const [createdTktDesc, setCreatedTktDesc] = useState("Standard service from scanned parameters.");
  const [createdTktParts, setCreatedTktParts] = useState("5W-30 Oil, Air Filter");
  const [createdTktLabor, setCreatedTktLabor] = useState("10");
  const [createdTktPartsCost, setCreatedTktPartsCost] = useState("30");
  const [scannerFeedback, setScannerFeedback] = useState("");

  // Input value validation helpers
  const validatePhone = (num: string) => {
    // Simple Cambodia phone check (usually starts with +855 or 0, followed by 8 to 10 digits)
    const regex = /^(?:\+855|0)\s?[1-9]\d{1,2}\s?\d{3}\s?\d{3,4}$/;
    if (!num) {
      setPhoneError("");
      return true;
    }
    if (!regex.test(num)) {
      setPhoneError(t("Invalid phone pattern (e.g., +855 12 345 678 or 012345678)", "លេខទូរស័ព្ទទម្រង់មិនត្រឹមត្រូវ (ឧទាហរណ៍៖ +855 12 345 678 ឬ 012345678)"));
      return false;
    }
    setPhoneError("");
    return true;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setBasicPhone(val);
    validatePhone(val);
  };

  const saveDraft = () => {
    const draft = {
      basicName, basicEmail, basicPhone, basicTelegram, selectedRoles,
      nickname, vType, brand, model, year, plateNumber, engineType, fuelType,
      transmission, currentMileage, vehicleCondition, lastServiceDate, lastServiceMileage,
      bName, bAddress, bOpeningHours, bServicesOffered, staffList
    };
    localStorage.setItem("mcc_form_registration_draft", JSON.stringify(draft));
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 2000);
  };

  const loadDraft = () => {
    const saved = localStorage.getItem("mcc_form_registration_draft");
    if (saved) {
      const d = JSON.parse(saved);
      setBasicName(d.basicName || "");
      setBasicEmail(d.basicEmail || "");
      setBasicPhone(d.basicPhone || "");
      setBasicTelegram(d.basicTelegram || "");
      setSelectedRoles(d.selectedRoles || ["Vehicle Owner"]);
      setNickname(d.nickname || "");
      setVType(d.vType || "Pickup");
      setBrand(d.brand || "");
      setModel(d.model || "");
      setYear(d.year || "");
      setPlateNumber(d.plateNumber || "");
      setEngineType(d.engineType || "Petrol / Gasoline");
      setFuelType(d.fuelType || "Gasoline");
      setTransmission(d.transmission || "Automatic");
      setCurrentMileage(d.currentMileage || "");
      setVehicleCondition(d.vehicleCondition || "");
      setLastServiceDate(d.lastServiceDate || "");
      setLastServiceMileage(d.lastServiceMileage || "");
      setBName(d.bName || "");
      setBAddress(d.bAddress || "");
      setBOpeningHours(d.bOpeningHours || "");
      setBServicesOffered(d.bServicesOffered || []);
      setStaffList(d.staffList || []);
      alert("Registration form draft restored!");
    } else {
      alert("No draft found in local storage.");
    }
  };

  const addServiceTag = () => {
    if (newServiceOffered && !bServicesOffered.includes(newServiceOffered)) {
      setBServicesOffered(prev => [...prev, newServiceOffered]);
      setNewServiceOffered("");
    }
  };

  const addStaffItem = () => {
    if (newStaffName) {
      setStaffList(prev => [...prev, { name: newStaffName, permission: newStaffPerm }]);
      setNewStaffName("");
    }
  };

  // Generate Unique Vehicle ID & secure link + QR on enrollment
  const enrollVehicleDirect = () => {
    const nextId = "vehicle-" + Math.floor(Math.random() * 900000 + 100000);
    const mockToken = "qrsec_" + Math.floor(Math.random() * 900000000 + 100000000);
    const mockLink = "#https://ais-pre-qhzntlc3vtjenmllyoeu7b-58491837947.run.app/qr/" + mockToken;

    const newV: VehicleProfile = {
      id: nextId,
      owner: basicName,
      brand,
      model,
      year: Number(year),
      mileage: Number(currentMileage),
      fuelType,
      engineType: engineType as any,
      transmission: transmission as any,
      nickname,
      plateNumber,
      lastOilChangeMileage: Number(lastServiceMileage),
      lastServiceDate,
      vehicleType: vType as any,
      notes: "Condition: " + vehicleCondition + ". Ownership: " + ownershipStatus,
      qrSecureToken: mockToken,
      qrSecureLink: mockLink
    };

    // Save to QR Base array
    const newQr: VehicleQrCodeRecord = {
      id: mockToken,
      vehicleId: nextId,
      secureToken: mockToken,
      qrImageBase64: `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(mockLink)}&color=0-191-255&bgcolor=0a-0f-1d`,
      createdAt: new Date().toISOString()
    };

    setAllEnrolledVehicles(prev => [...prev, newV]);
    setQrCodesDb(prev => [...prev, newQr]);
    return { newV, newQr };
  };

  // Step 7 Submit
  const handleFinalSubmitRegistration = () => {
    if (!validatePhone(basicPhone)) {
      setActiveStep(1);
      return;
    }

    // Process Vehicle Owner Enrollments
    let isOwner = selectedRoles.includes("Vehicle Owner");
    let hasRegisteredV = false;
    let enrolledId = "";
    if (isOwner) {
      const { newV } = enrollVehicleDirect();
      enrolledId = newV.id;
      hasRegisteredV = true;
    }

    // Process Businesses
    const ownsBusiness = selectedRoles.some(r => r !== "Vehicle Owner" && r !== "Super Admin" && r !== "Staff User");
    let businessId = "bus-" + Math.floor(Math.random() * 90000 + 10000);
    if (ownsBusiness) {
      const gProfile: GarageProfileRecord = {
        id: businessId,
        userUid: "user-" + Math.floor(Math.random() * 100000),
        garageName: bName,
        ownerName: bOwnerName,
        phone: bPhone,
        telegram: bTelegram,
        address: bAddress,
        lat,
        lng,
        openingHours: bOpeningHours,
        servicesOffered: bServicesOffered,
        staffList: staffList,
        status: "Pending" // Multi-role business requests are flagged "Pending" for Super Admin vetting
      };
      setGaragesDb(prev => [...prev, gProfile]);

      // Create Verification Request
      const vReq: VerificationRequestRecord = {
        id: "req-" + Math.floor(Math.random() * 90000 + 10000),
        userUid: "user-onboarded",
        businessType: "Garage",
        businessId: businessId,
        businessName: bName,
        submittedDocuments: docCategory + " - " + (docFile ? "Uploaded File Size simulated (~1.2MB)" : "Placeholders registered"),
        status: "Pending",
        createdAt: new Date().toISOString()
      };
      setVerificationRequestsDb(prev => [...prev, vReq]);
    }

    alert(t(
      "Registration Submitted Successfully! If registered as a business owner, your profiles are flagged as 'Pending Approval' for admin verification.",
      "ការចុះឈ្មោះត្រូវបានដាក់ស្នើដោយជោគជ័យ! ប្រសិនបើចុះឈ្មោះជាម្ចាស់អាជីវកម្ម ប្រវត្តិរូបរបស់អ្នកនឹងត្រូវដាក់ស្លាក 'រង់ចាំការអនុម័ត' សម្រាប់ការផ្ទៀងផ្ទាត់ដោយអ្នកគ្រប់គ្រង។"
    ));
    setActiveStep(1);
    // clear draft
    localStorage.removeItem("mcc_form_registration_draft");
  };

  // QR Simulation Scan Action
  const triggerSimulateScan = () => {
    if (!selectedVehicleToScan) return;
    const target = allEnrolledVehicles.find(v => v.id === selectedVehicleToScan);
    if (target) {
      setRetrievedScannedVehicle(target);
      setScannerFeedback(t("QR Code scanned successfully! Live parameters extracted.", "ការស្កេនកូដ QR បានជោគជ័យ! បានទាញយកប៉ារ៉ាម៉ែត្រផ្ទាល់។"));
      setTimeout(() => setScannerFeedback(""), 4000);
    }
  };

  const createServiceFromScannerCheckin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!retrievedScannedVehicle) return;

    const rawLabor = Number(createdTktLabor);
    const rawParts = Number(createdTktPartsCost);
    const total = rawLabor + rawParts;

    const newTkt: ServiceTicketRecord = {
      id: "tkt-" + Math.floor(Math.random() * 900000 + 100000),
      vehicleId: retrievedScannedVehicle.id,
      vehicleName: `${retrievedScannedVehicle.brand} ${retrievedScannedVehicle.model}`,
      ownerName: retrievedScannedVehicle.owner || "Yeon Pisith",
      garageId: "sh-1",
      garageName: "Sokha Auto Repair Center",
      serviceDate: new Date().toISOString().split('T')[0],
      serviceMileage: retrievedScannedVehicle.mileage + 150, // simulate drive-in mileage delta
      serviceType: createdTktType,
      description: createdTktDesc,
      partsChanged: createdTktParts,
      laborCost: rawLabor,
      partsCost: rawParts,
      totalCost: total,
      status: "Pending",
      createdBy: "Garage",
      createdAt: new Date().toISOString()
    };

    setServiceTicketsDb(prev => [newTkt, ...prev]);
    alert(t(
      "Service Ticket logged! It is now pending owner approval. Your service log will not be visible in vehicle history until approved.",
      "សំបុត្រសេវាកម្មត្រូវបានកត់ត្រាទុក! ឥឡូវនេះវាកំពុងរង់ចាំការអនុម័តពីម្ចាស់។ ប្រវត្តិសេវាកម្មរបស់អ្នកនឹងមិនបង្ហាញនៅក្នុងប្រវត្តិយានយន្តទេ លុះត្រាតែមានការអនុម័ត។"
    ));
    setRetrievedScannedVehicle(null);
  };

  // Approval actions
  const approveTicket = (ticketId: string) => {
    setServiceTicketsDb(prev => prev.map(tkt => {
      if (tkt.id === ticketId) {
        return { ...tkt, status: 'Approved' as const };
      }
      return tkt;
    }));
    alert(t("Ticket APPROVED. Service added to official vehicle history log.", "សំបុត្រត្រូវបានអនុម័ត។ សេវាកម្មត្រូវបានបន្ថែមទៅក្នុងកំណត់ត្រាប្រវត្តិយានយន្តជាផ្លូវការ។"));
  };

  const rejectTicket = (ticketId: string, reason: string) => {
    setServiceTicketsDb(prev => prev.map(tkt => {
      if (tkt.id === ticketId) {
        return { ...tkt, status: 'Rejected' as const, rejectionReason: reason };
      }
      return tkt;
    }));
    alert(t("Ticket REJECTED. Submitting garage has been notified.", "សំបុត្រត្រូវបានបដិសេធ។ យានដ្ឋានដែលបានដាក់ជូនត្រូវបានជូនដំណឹងរួចហើយ។"));
  };

  // Admin and Verification reviews
  const approveVerificationRequest = (reqId: string, businessId: string) => {
    setVerificationRequestsDb(prev => prev.map(req => {
      if (req.id === reqId) return { ...req, status: 'Approved' as const };
      return req;
    }));
    setGaragesDb(prev => prev.map(g => {
      if (g.id === businessId) return { ...g, status: 'Approved' as const };
      return g;
    }));
    alert(t("Partner verification APPROVED. Business is now premium certified on Phnom Penh locator maps.", "ការផ្ទៀងផ្ទាត់ដៃគូត្រូវបានអនុម័ត។ អាជីវកម្មឥឡូវនេះត្រូវបានបញ្ជាក់កម្រិតបុព្វលាភនៅលើផែនទីភ្នំពេញ។"));
  };

  const rejectVerificationRequest = (reqId: string, notes: string) => {
    setVerificationRequestsDb(prev => prev.map(req => {
      if (req.id === reqId) return { ...req, status: 'Rejected' as const, reviewNotes: notes };
      return req;
    }));
    alert(t("Request REJECTED with notes.", "សំណើត្រូវបានបដិសេធរាល់កំណត់សម្គាល់។"));
  };

  return (
    <div id="mcc-role-form-module" className="space-y-8 animate-fade-in text-slate-100">
      
      {/* Module Title Banner */}
      <div className="glass rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/60 border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl -z-10"></div>
        <div className="space-y-1.5z">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-sky-400" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-sky-400">
              {t("V6.2.0 Unified Care Standard", "ស្តង់ដារថែទាំរួមបញ្ចូលគ្នា V6.2.0")}
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-slate-100 tracking-tight">
            {t("Unified Form System", "ប្រព័ន្ធបែបបទរួមគ្នា")}
          </h2>
          <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
            {t(
              "Onboard and dynamic multi-step profiles with conditional workflows, QR code engines, and integrated approval queues for all Cambodia vehicle owners, workshops, and administrators.",
              "ប្រវត្តិរូបពហុជំហានបែបឌីណាមិកជាមួយលំហូរការងារ مشروط ម៉ាស៊ីនកូដ QR និងជួរអនុម័តរួមបញ្ចូលគ្នាសម្រាប់ម្ចាស់យានយន្ត សិក្ខាសាលា និងអ្នកគ្រប់គ្រងនៅកម្ពុជា។"
            )}
          </p>
        </div>

        {/* Language switcher & Draft restoration buttons */}
        <div className="flex flex-wrap gap-2.5 shrink-0">
          <button
            onClick={() => setLang(lang === 'EN' ? 'KH' : 'EN')}
            className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer text-sky-400"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{lang === 'EN' ? "ខ្មែរ (Khmer)" : "English"}</span>
          </button>
          
          <button
            onClick={loadDraft}
            className="px-3.5 py-1.5 bg-white/5 hover:bg-indigo-500/20 hover:border-indigo-500/20 border border-white/10 rounded-xl text-xs font-semibold text-slate-300 transition flex items-center gap-1.5 cursor-pointer"
            title="Load last saved draft from local cache"
          >
            <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
            <span>{t("Load Draft", "ទាញយករក្សាទុក")}</span>
          </button>

          <button
            onClick={saveDraft}
            className="px-3.5 py-1.5 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-slate-950 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-md"
            title="Saves non-submitted values safely as temporary cookie-equivalent cache"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{draftSaved ? t("Draft Saved!", "បានរក្សាទុក!") : t("Save Draft", "រក្សាទុក")}</span>
          </button>
        </div>
      </div>

      {/* Main Multi-Tab workspace splits */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: 7-Step Dynamic Onboarding Form */}
        <div className="lg:col-span-7 glass rounded-3xl p-6 bg-slate-900/40 border border-white/8 space-y-6">
          
          {/* Form Step Badges indicator */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono text-sky-400 uppercase tracking-widest font-extrabold block">
                {t(`Step ${activeStep} of 7`, `ជំហានទី ${activeStep} នៃ 7`)}
              </span>
              <h3 className="text-sm font-bold text-slate-100">
                {activeStep === 1 && t("Basic Information", "ព័ត៌មានមូលដ្ឋាន")}
                {activeStep === 2 && t("Role selection", "ការជ្រើសរើសតួនាទី")}
                {activeStep === 3 && t("Vehicle or Business Specs", "លក្ខណៈបច្ចេកទេសយានយន្ត ឬអាជីវកម្ម")}
                {activeStep === 4 && t("Service, skill, or product details", "ព័ត៌មានលម្អិតសេវាកម្ម ជំនាញ ឬផលិតផល")}
                {activeStep === 5 && t("Business Geo-Location Map Picker", "ស្រាវជ្រាវទីតាំងផែនទីភូមិសាស្ត្រអាជីវកម្ម")}
                {activeStep === 6 && t("Verify Documents", "ផ្ទៀងផ្ទាត់ឯកសារ")}
                {activeStep === 7 && t("Review & Submit", "ពិនិត្យឡើងវិញ និងដាក់ស្នើ")}
              </h3>
            </div>
            
            {/* Step bubbles status tracker */}
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5, 6, 7].map((s) => (
                <div
                  key={s}
                  onClick={() => setActiveStep(s)}
                  className={`w-6 h-6 rounded-full text-[10px] font-mono font-bold flex items-center justify-center cursor-pointer transition border ${
                    activeStep === s 
                      ? "bg-sky-400 text-slate-950 border-sky-400" 
                      : s < activeStep 
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" 
                        : "bg-slate-950/40 text-slate-400 border-white/10"
                  }`}
                >
                  {s}
                </div>
              ))}
            </div>
          </div>

          {/* Conditional Multi-Step Content Panels */}
          <div className="min-h-[300px] space-y-5">
            
            {/* Step 1: Basic Information */}
            {activeStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span>{t("Account Name", "ឈ្មោះគណនី")}</span>
                    <span className="text-red-400 text-xs font-black">*</span>
                  </label>
                  <input
                    type="text"
                    value={basicName}
                    onChange={(e) => setBasicName(e.target.value)}
                    className="w-full bg-slate-950/60 border border-white/10 focus:border-sky-400 p-2.5 px-3.5 text-xs rounded-xl focus:outline-none text-slate-100 font-medium"
                    placeholder={t("e.g., Yeon Pisith", "ឧទាហរណ៍៖ Yeon Pisith")}
                  />
                  <span className="text-[10px] text-slate-500 italic block mt-0.5">
                    {t("Matches your authorized passport or Cambodian ID card scan.", "ត្រូវគ្នានឹងការស្កេនលិខិតឆ្លងដែន ឬអត្តសញ្ញាណប័ណ្ណខ្មែររបស់អ្នក។")}
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span>{t("Email address", "អាសយដ្ឋានអ៊ីមែល")}</span>
                    <span className="text-red-400 text-xs font-black">*</span>
                  </label>
                  <input
                    type="email"
                    value={basicEmail}
                    onChange={(e) => setBasicEmail(e.target.value)}
                    className="w-full bg-slate-950/60 border border-white/10 focus:border-sky-400 p-2.5 px-3.5 text-xs rounded-xl focus:outline-none text-slate-100 font-medium"
                    placeholder="pisith.yeen@gmail.com"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span>{t("Active Phone Number (Cambodia formatting)", "លេខទូរស័ព្ទសកម្ម (ទម្រង់ប្រទេសកម្ពុជា)")}</span>
                    <span className="text-red-400 text-xs font-black">*</span>
                  </label>
                  <input
                    type="text"
                    value={basicPhone}
                    onChange={handlePhoneChange}
                    className={`w-full bg-slate-950/60 border focus:outline-none p-2.5 px-3.5 text-xs rounded-xl text-slate-100 font-mono ${
                      phoneError ? "border-red-400/50 focus:border-red-400" : "border-white/10 focus:border-sky-400"
                    }`}
                    placeholder="e.g., +855 12 345 678"
                  />
                  {phoneError ? (
                    <span className="text-[10px] text-red-400 block mt-1 font-semibold">{phoneError}</span>
                  ) : (
                    <span className="text-[10px] text-slate-500 italic block mt-0.5">
                      {t("Include national country code prefixes optionally like +855.", "រួមបញ្ចូលបុព្វបទកូដប្រទេសជាតិជាជម្រើសដូចជា +855។")}
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    {t("Telegram Username (Direct communication link)", "ឈ្មោះអ្នកប្រើប្រាស់ Telegram (តំណភ្ជាប់ទំនាក់ទំនងផ្ទាល់)")}
                  </label>
                  <input
                    type="text"
                    value={basicTelegram}
                    onChange={(e) => setBasicTelegram(e.target.value)}
                    className="w-full bg-slate-950/60 border border-white/10 focus:border-sky-400 p-2.5 px-3.5 text-xs rounded-xl focus:outline-none text-slate-100 font-mono"
                    placeholder="@pisith_mcc"
                  />
                  <span className="text-[10px] text-slate-500 italic block mt-0.5">
                    {t("Enables automated telegram reminders for scheduled vehicle inspections.", "អនុញ្ញាតឱ្យផ្ញើសេចក្តីរំលឹកតាមតេឡេក្រាមដោយស្វ័យប្រវត្តិនូវការត្រួតពិនិត្យយានយន្ត។")}
                  </span>
                </div>
              </div>
            )}

            {/* Step 2: Role Selection (Multiple allowed) */}
            {activeStep === 2 && (
              <div className="space-y-4">
                <div className="bg-sky-500/5 p-4 rounded-2xl border border-sky-500/10 flex items-start gap-3">
                  <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-200 block">
                      {t("Flexible One-Account, Multi-Role Capability", "គណនីតែមួយដែលអាចបត់បែនបាន និងសមត្ថភាពពហុតួនាទី")}
                    </span>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      {t(
                        "You can check multiple role presets below! For example: operating a Spare part shop and a registered Garage at the same time. The form system adapts steps dynamically based on your combinations.",
                        "អ្នកអាចជ្រើសរើសតួនាទីជាច្រើនគ្រាប់នៅខាងក្រោម! ឧទាហរណ៍៖ ការដំណើរការហាងលក់គ្រឿងបន្លាស់ និងយានដ្ឋានដែលបានចុះឈ្មោះក្នុងពេលតែមួយ។ ប្រព័ន្ធបែបបទសម្របជំហានទៅតាមបន្សំតួនាទី។"
                      )}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    {t("Select Roles to Register", "ជ្រើសរើសតួនាទីដើម្បីចុះឈ្មោះ")}
                  </span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {[
                      { id: "Vehicle Owner", label: t("Vehicle Owner", "ម្ចាស់យានយន្ត"), desc: t("Register vehicles, create diagnostic scans and view reports", "ចុះឈ្មោះយានយន្ត បង្កើតការស្កេន និងពិនិត្យរបាយការណ៍") },
                      { id: "Garage Owner", label: t("Garage Owner", "ម្ចាស់យានដ្ឋាន"), desc: t("Scan secure vehicle QR codes and log service records", "ស្កេនកូដ QR យានយន្ត និងកត់ត្រាប្រវត្តិសេវាកម្ម") },
                      { id: "Spare Parts Shop", label: t("Spare Parts Shop", "ហាងលក់គ្រឿងបន្លាស់"), desc: t("Post and barter replacement components on the marketplace", "លក់ ឬប្ដូរគ្រឿងបន្លាស់នៅលើទីផ្សារ") },
                      { id: "Petrol Station", label: t("Petrol Station Partner", "ដៃគូស្ថានីយប្រេងឥន្ធនៈ"), desc: t("Log outlet parameters and fuel price details", "កត់ត្រាព័ត៌មានលម្អិតអំពីតម្លៃប្រេងឥន្ធនៈ") },
                      { id: "EV Charging Station", label: t("EV Charging Provider", "អ្នកផ្តល់សេវាសាកអាគុយ EV"), desc: t("Manage charging port standards and active cord counts", "គ្រប់គ្រងច្រកសាក និងចំនួនឆ្នាំងសាកសកម្ម") },
                      { id: "Freelancer Mechanic", label: t("Freelancer Mechanic", "ជាងជួសជុលសេរី"), desc: t("Receive highway distress codes and roadside alerts", "ទទួលយកការជូនដំណឹងពីគ្រោះអាសន្នលើដងផ្លូវ") },
                      { id: "Staff User", label: t("Staff User", "អ្នកប្រើប្រាស់បុគ្គលិក"), desc: t("Permission control for operating workshops and counters", "ការគ្រប់គ្រងការអនុញ្ញាតសម្រាប់ការបើកសិក្ខាសាលា") },
                      { id: "Super Admin", label: t("Super Admin / Platform Admin", "អ្នកគ្រប់គ្រងជាន់ខ្ពស់"), desc: t("Oversee audit logs and vet business registrations", "តាមដានកំណត់ត្រា និងផ្ទៀងផ្ទាត់ការចុះឈ្មោះអាជីវកម្ម") }
                    ].map((rolePreset) => {
                      const checked = selectedRoles.includes(rolePreset.id);
                      return (
                        <div
                          key={rolePreset.id}
                          onClick={() => {
                            if (checked) {
                              setSelectedRoles(prev => prev.filter(r => r !== rolePreset.id));
                            } else {
                              setSelectedRoles(prev => [...prev, rolePreset.id]);
                            }
                          }}
                          className={`p-3.5 rounded-2xl border text-left cursor-pointer transition flex items-start gap-3 ${
                            checked 
                              ? "bg-sky-500/10 border-sky-400 text-white" 
                              : "bg-slate-950/40 border-white/5 text-slate-350 hover:bg-slate-950/60"
                          }`}
                        >
                          <div className={`w-4 h-4 rounded mt-0.5 border flex items-center justify-center shrink-0 ${
                            checked ? "bg-sky-400 border-sky-400 text-slate-950" : "border-slate-500"
                          }`}>
                            {checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-xs font-bold block">{rolePreset.label}</span>
                            <span className="text-[10px] text-slate-400 leading-tight block">{rolePreset.desc}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Vehicle / Business registration specifications */}
            {activeStep === 3 && (
              <div className="space-y-5">
                
                {/* Check 1: Vehicle Owner fields included */}
                {selectedRoles.includes("Vehicle Owner") ? (
                  <div className="bg-slate-950/40 p-5 rounded-2xl border border-white/5 space-y-4">
                    <div className="flex items-center gap-1.5 border-b border-white/10 pb-2">
                      <Car className="w-4.5 h-4.5 text-sky-400" />
                      <h4 className="text-xs font-bold text-slate-200">
                        {t("1. Register First Vehicle Profile", "១. ចុះឈ្មោះប្រវត្តិរូបយានយន្តដំបូង")}
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">{t("Vehicle Nickname", "ឈ្មោះក្រៅយានយន្ត")}</label>
                        <input
                          type="text"
                          value={nickname}
                          onChange={(e) => setNickname(e.target.value)}
                          className="w-full bg-slate-950 border border-white/10 p-2 text-xs rounded-xl focus:outline-none"
                          placeholder="My Black Cruiser"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">{t("Vehicle Type", "ប្រភេទយានយន្ត")}</label>
                        <select
                          value={vType}
                          onChange={(e: any) => setVType(e.target.value)}
                          className="w-full bg-slate-900 border border-white/10 p-2 text-xs rounded-xl focus:outline-none"
                        >
                          <option value="Pickup">Pickup Truck</option>
                          <option value="Sedan">Sedan</option>
                          <option value="SUV">SUV</option>
                          <option value="Van">Van</option>
                          <option value="Moto">Moto (Motorcycle)</option>
                          <option value="Truck">Heavy Truck</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">{t("Make / Brand", "ផលិតកម្ម/ម៉ាក")}</label>
                        <input
                          type="text"
                          value={brand}
                          onChange={(e) => setBrand(e.target.value)}
                          className="w-full bg-slate-950 border border-white/10 p-2 text-xs rounded-xl focus:outline-none font-mono"
                          placeholder="Toyota"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">{t("Model Name", "ឈ្មោះម៉ូដែល")}</label>
                        <input
                          type="text"
                          value={model}
                          onChange={(e) => setModel(e.target.value)}
                          className="w-full bg-slate-950 border border-white/10 p-2 text-xs rounded-xl focus:outline-none font-mono"
                          placeholder="Tacoma"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">{t("Mfg Year", "ឆ្នាំផលិត")}</label>
                        <input
                          type="number"
                          value={year}
                          onChange={(e) => setYear(e.target.value)}
                          className="w-full bg-slate-950 border border-white/10 p-2 text-xs rounded-xl focus:outline-none font-mono"
                          placeholder="2010"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">{t("Plate ID Number", "លេខស្លាកលេខយានយន្ត")}</label>
                        <input
                          type="text"
                          value={plateNumber}
                          onChange={(e) => setPlateNumber(e.target.value)}
                          className="w-full bg-slate-950 border border-white/10 p-2 text-xs rounded-xl focus:outline-none font-mono"
                          placeholder="PP-2AB-4589"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">{t("Engine Type", "ប្រភេទម៉ាស៊ីន")}</label>
                        <input
                          type="text"
                          value={engineType}
                          onChange={(e) => setEngineType(e.target.value)}
                          className="w-full bg-slate-950 border border-white/10 p-2 text-xs rounded-xl focus:outline-none"
                          placeholder="2.7L L4 Petrol"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">{t("Fuel Configuration", "ការកំណត់ប្រេងឥន្ធនៈ")}</label>
                        <select
                          value={fuelType}
                          onChange={(e: any) => setFuelType(e.target.value)}
                          className="w-full bg-slate-900 border border-white/10 p-2 text-xs rounded-xl focus:outline-none"
                        >
                          <option value="Gasoline">Gasoline (Petrol)</option>
                          <option value="Diesel">Diesel</option>
                          <option value="Hybrid">Hybrid</option>
                          <option value="EV">Fully Electric (EV)</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">{t("Transmission", "ប្រអប់លេខ")}</label>
                        <select
                          value={transmission}
                          onChange={(e: any) => setTransmission(e.target.value)}
                          className="w-full bg-slate-900 border border-white/10 p-2 text-xs rounded-xl focus:outline-none"
                        >
                          <option value="Automatic">Automatic (Auto)</option>
                          <option value="Manual">Manual (Stick-shift)</option>
                          <option value="CVT">CVT</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">{t("Current Odo (km)", "ម៉ាយល៍បច្ចុប្បន្ន (គិតជាគីឡូម៉ែត្រ)")}</label>
                        <input
                          type="number"
                          value={currentMileage}
                          onChange={(e) => setCurrentMileage(e.target.value)}
                          className="w-full bg-slate-950 border border-white/10 p-2 text-xs rounded-xl focus:outline-none font-mono"
                          placeholder="186500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">{t("Vehicle Physical Condition", "ស្ថានភាពរាងកាយយានយន្ត")}</label>
                        <input
                          type="text"
                          value={vehicleCondition}
                          onChange={(e) => setVehicleCondition(e.target.value)}
                          className="w-full bg-slate-950 border border-white/10 p-2 text-xs rounded-xl focus:outline-none"
                          placeholder="Excellent / Good / Needs repair"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">{t("Ownership Status", "ស្ថានភាពភាពជាម្ចាស់")}</label>
                        <select
                          value={ownershipStatus}
                          onChange={(e) => setOwnershipStatus(e.target.value)}
                          className="w-full bg-slate-900 border border-white/10 p-2 text-xs rounded-xl focus:outline-none"
                        >
                          <option value="Sole Owner">Sole Owner</option>
                          <option value="Company Car">Company Car</option>
                          <option value="Leased / Fine Bank">Financed / Leased</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* Check 2: Business Owners (Garage, Spare Parts, Petrol, EV, etc.) */}
                {selectedRoles.some(r => r !== "Vehicle Owner" && r !== "Super Admin" && r !== "Staff User") ? (
                  <div className="bg-slate-950/40 p-5 rounded-2xl border border-white/5 space-y-4">
                    <div className="flex items-center gap-1.5 border-b border-white/10 pb-2">
                      <Wrench className="w-4.5 h-4.5 text-emerald-400" />
                      <h4 className="text-xs font-bold text-slate-200">
                        {t("2. Register Workshop or Business Profile", "២. ចុះឈ្មោះសិក្ខាសាលា ឬប្រវត្តិរូបអាជីវកម្ម")}
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">{t("Business / Outlet Name", "ឈ្មោះអាជីវកម្ម")}</label>
                        <input
                          type="text"
                          value={bName}
                          onChange={(e) => setBName(e.target.value)}
                          className="w-full bg-slate-950 border border-white/10 p-2 text-xs rounded-xl focus:outline-none"
                          placeholder="e.g., Angkor Elite Maintenance & Spares"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">{t("Business Owner Name", "ឈ្មោះម្ចាស់អាជីវកម្ម")}</label>
                        <input
                          type="text"
                          value={bOwnerName}
                          onChange={(e) => setBOwnerName(e.target.value)}
                          className="w-full bg-slate-950 border border-white/10 p-2 text-xs rounded-xl focus:outline-none"
                          placeholder="Yeon Pisith"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">{t("Business Contact Phone", "លេខទូរស័ព្ទទំនាក់ទំនងអាជីវកម្ម")}</label>
                        <input
                          type="text"
                          value={bPhone}
                          onChange={(e) => setBPhone(e.target.value)}
                          className="w-full bg-slate-950 border border-white/10 p-2 text-xs rounded-xl focus:outline-none font-mono"
                          placeholder="+855 12 345 678"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">{t("Business Telegram", "Telegram អាជីវកម្ម")}</label>
                        <input
                          type="text"
                          value={bTelegram}
                          onChange={(e) => setBTelegram(e.target.value)}
                          className="w-full bg-slate-950 border border-white/10 p-2 text-xs rounded-xl focus:outline-none font-mono"
                          placeholder="@angkor_elite"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">{t("Business Address (Phnom Penh / Provinces)", "អាសយដ្ឋានអាជីវកម្ម (ភ្នំពេញ / ខេត្ត)")}</label>
                      <input
                        type="text"
                        value={bAddress}
                        onChange={(e) => setBAddress(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 p-2 text-xs rounded-xl focus:outline-none text-slate-300"
                        placeholder="No 89, Russian Blvd, Phnom Penh"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">{t("Opening Hours", "ម៉ោង​បើក​ដំណើរការ")}</label>
                      <input
                        type="text"
                        value={bOpeningHours}
                        onChange={(e) => setBOpeningHours(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 p-2 text-xs rounded-xl focus:outline-none"
                        placeholder="08:00 AM - 06:00 PM, Mon-Sat"
                      />
                    </div>
                  </div>
                ) : null}

                {/* Safe fallthrough check */}
                {!selectedRoles.includes("Vehicle Owner") && !selectedRoles.some(r => r !== "Vehicle Owner" && r !== "Super Admin" && r !== "Staff User") && (
                  <div className="py-8 text-center text-slate-400 space-y-2">
                    <Info className="w-8 h-8 text-slate-500 mx-auto" />
                    <p className="text-xs">{t("No vehicle or business profiles required for this role combination.", "មិនតម្រូវឱ្យមានយានយន្ត ឬអាជីវកម្មសម្រាប់តួនាទីទាំងនេះទេ។")}</p>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Service, skill, or product details */}
            {activeStep === 4 && (
              <div className="space-y-5">
                
                {/* General Service list setup */}
                <div className="bg-slate-950/40 p-5 rounded-2xl border border-white/5 space-y-4">
                  <div className="flex items-center gap-1.5 border-b border-white/10 pb-2">
                    <Plus className="w-4.5 h-4.5 text-indigo-400" />
                    <h4 className="text-xs font-bold text-slate-200">
                      {t("Configure Services Offered / Skills", "កំណត់រចនាសម្ព័ន្ធសេវាកម្មដែលផ្តល់ជូន / ជំនាញ")}
                    </h4>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-normal">
                    {t(
                      "Specify the exact vehicle support elements you can provide. These will map to the live search filters on client maps.",
                      "បញ្ជាក់ធាតុគាំទ្រយានយន្តឱ្យចំ។ ទាំងនេះនឹងកំណត់ទៅលើតម្រងស្វែងរកនៅលើផែនទីរបស់អតិថិជន។"
                    )}
                  </p>

                  <div className="space-y-3">
                    <div className="flex gap-2.5">
                      <input
                        type="text"
                        value={newServiceOffered}
                        onChange={(e) => setNewServiceOffered(e.target.value)}
                        placeholder={t("e.g., LFP Battery cell replacement", "ឧទាហរណ៍៖ ការជំនួសកោសិកាថ្ម LFP")}
                        className="flex-1 bg-slate-950 border border-white/10 p-2 text-xs rounded-xl focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={addServiceTag}
                        className="p-2 bg-indigo-500 hover:bg-indigo-600 rounded-xl text-slate-950 text-xs font-bold cursor-pointer transition px-3 shrink-0"
                      >
                        {t("Add Tag", "បញ្ចូលស្លាក")}
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {bServicesOffered.map((tag, idx) => (
                        <div key={idx} className="flex items-center gap-1 bg-white/5 text-slate-300 px-2.5 py-1 rounded-xl text-[10px] border border-white/8">
                          <span>{tag}</span>
                          <button
                            type="button"
                            onClick={() => setBServicesOffered(prev => prev.filter(t => t !== tag))}
                            className="text-slate-500 hover:text-red-400 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Staff permission setup */}
                <div className="bg-slate-950/40 p-5 rounded-2xl border border-white/5 space-y-4">
                  <div className="flex items-center gap-1.5 border-b border-white/10 pb-2">
                    <User className="w-4.5 h-4.5 text-indigo-400" />
                    <h4 className="text-xs font-bold text-slate-200">
                      {t("Manage Workshop Staff & Permissions", "គ្រប់គ្រងបុគ្គលិកសិក្ខាសាលា និងការអនុញ្ញាត")}
                    </h4>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={newStaffName}
                        onChange={(e) => setNewStaffName(e.target.value)}
                        placeholder="Staff Name"
                        className="bg-slate-950 border border-white/10 p-2 text-xs rounded-xl focus:outline-none text-slate-150"
                      />
                      <select
                        value={newStaffPerm}
                        onChange={(e) => setNewStaffPerm(e.target.value)}
                        className="bg-slate-900 border border-white/10 p-2 text-xs rounded-xl focus:outline-none text-slate-200"
                      >
                        <option value="Manager">Manager (Full edit logs)</option>
                        <option value="Mechanic">Mechanic (Create logs)</option>
                        <option value="Staff">Basic staff (Read only)</option>
                      </select>
                      <button
                        type="button"
                        onClick={addStaffItem}
                        className="p-2 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-slate-950 text-xs font-bold cursor-pointer transition shrink-0"
                      >
                        {t("Add Staff", "បញ្ចូលបុគ្គលិក")}
                      </button>
                    </div>

                    <div className="space-y-2 max-h-[150px] overflow-y-auto">
                      {staffList.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-black/20 border border-white/5 text-[11px]">
                          <div>
                            <span className="font-bold text-slate-200 block">{item.name}</span>
                            <span className="text-[10px] text-slate-500 font-mono italic">{item.permission}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setStaffList(prev => prev.filter((_, i) => i !== idx))}
                            className="text-slate-500 hover:text-red-400 p-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* Step 5: Geo-Location Map Picker */}
            {activeStep === 5 && (
              <div className="space-y-4">
                <div className="bg-slate-950/40 p-5 rounded-2xl border border-white/5 space-y-4">
                  <div className="flex items-center gap-1.5 border-b border-white/10 pb-2">
                    <MapPin className="w-4.5 h-4.5 text-orange-400" />
                    <h4 className="text-xs font-bold text-slate-200">
                      {t("Geopoint Coordinates Setup", "ការកំណត់កូអរដោនេចំនុចផែនទី")}
                    </h4>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-normal">
                    {t(
                      "Simulate setting your business geographic coordinates. Cambodia client apps use this location for driving routing and distance calculations.",
                      "កំណត់កូអរដោនេផែនទីអាជីវកម្មរបស់អ្នក។ កម្មវិធីអតិថិជនប្រើប្រាស់ទីតាំងនេះសម្រាប់ការគណនាចម្ងាយធ្វើដំណើរ។"
                    )}
                  </p>

                  <div className="space-y-3.5">
                    {/* Map Simulation Box */}
                    <div className="w-full h-44 rounded-2xl bg-slate-950 border border-white/10 relative overflow-hidden flex items-center justify-center">
                      {/* Grid background simulation */}
                      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
                      
                      {/* Active Pin locator */}
                      <div className="text-center space-y-1 relative z-10 animate-bounce">
                        <MapPin className="w-8 h-8 text-orange-500 mx-auto filter drop-shadow-[0_2px_4px_rgba(249,115,22,0.4)]" />
                        <span className="bg-slate-900 border border-white/10 text-[9px] font-mono px-2 py-0.5 rounded-lg text-orange-400 text-center block">
                          Lat: {lat.toFixed(5)}, Lng: {lng.toFixed(5)}
                        </span>
                      </div>

                      {/* Map selector slider simulation buttons */}
                      <div className="absolute bottom-2 left-2 right-2 flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => { setLat(11.5564); setLng(104.9282); }}
                          className="flex-1 py-1 text-[9px] bg-slate-900 hover:bg-slate-800 rounded-lg border border-white/5 cursor-pointer text-slate-300"
                        >
                          Phnom Penh Main
                        </button>
                        <button
                          type="button"
                          onClick={() => { setLat(13.3671); setLng(103.856); }}
                          className="flex-1 py-1 text-[9px] bg-slate-900 hover:bg-slate-800 rounded-lg border border-white/5 cursor-pointer text-slate-300"
                        >
                          Siem Reap Main
                        </button>
                        <button
                          type="button"
                          onClick={() => { setLat(10.6275); setLng(103.5221); }}
                          className="flex-1 py-1 text-[9px] bg-slate-900 hover:bg-slate-800 rounded-lg border border-white/5 cursor-pointer text-slate-300"
                        >
                          Sihanoukville
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3.5">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Latitude</label>
                        <input
                          type="number"
                          step="0.00001"
                          value={lat}
                          onChange={(e) => setLat(Number(e.target.value))}
                          className="w-full bg-slate-950 border border-white/10 p-2 text-xs rounded-xl focus:outline-none font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Longitude</label>
                        <input
                          type="number"
                          step="0.00001"
                          value={lng}
                          onChange={(e) => setLng(Number(e.target.value))}
                          className="w-full bg-slate-950 border border-white/10 p-2 text-xs rounded-xl focus:outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 6: Documents base64 / scan simulation */}
            {activeStep === 6 && (
              <div className="space-y-4">
                <div className="bg-slate-950/40 p-5 rounded-2xl border border-white/5 space-y-4">
                  <div className="flex items-center gap-1.5 border-b border-white/10 pb-2">
                    <FileText className="w-4.5 h-4.5 text-sky-400" />
                    <h4 className="text-xs font-bold text-slate-200">
                      {t("Verify Business License / Registration", "ផ្ទៀងផ្ទាត់អាជ្ញាប័ណ្ណអាជីវកម្ម / ការចុះឈ្មោះ")}
                    </h4>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-normal">
                    {t(
                      "Submit scans of your Patent taxation logs, Ministry of Commerce certificates, or identity proof card to earn the certified verification green check mark.",
                      "ដាក់ស្នើការស្កេនប៉ាតង់ពន្ធ វិញ្ញាបនបត្រក្រសួងពាណិជ្ជកម្ម ដើម្បីទទួលបានសញ្ញាធីកពណ៌បៃតងបញ្ជាក់គុណភាព។"
                    )}
                  </p>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">{t("Document Category", "ប្រភេទឯកសារ")}</label>
                      <select
                        value={docCategory}
                        onChange={(e) => setDocCategory(e.target.value)}
                        className="w-full bg-slate-900 border border-white/10 p-2 text-xs rounded-xl focus:outline-none"
                      >
                        <option value="Patent Tax Registration Cert">Patent Tax Registration Certificate</option>
                        <option value="Ministry of Commerce Cert">Ministry of Commerce Certificate</option>
                        <option value="ID Card / Passport Scan">ID Card / Passport Scan</option>
                        <option value="Vehicle Yellow Registration Card">Vehicle Yellow Registration Card</option>
                      </select>
                    </div>

                    {/* Drag and Drop box simulation */}
                    <div className="w-full py-8 border-2 border-dashed border-white/10 rounded-2xl bg-black/20 hover:bg-black/30 transition flex flex-col items-center justify-center p-4 gap-2 text-center relative cursor-pointer">
                      <Upload className="w-8 h-8 text-sky-400 animate-pulse" />
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-200 block">
                          {t("Drag and drop file here or click to select", "អូសនិងទម្លាក់ឯកសារនៅទីនេះ ឬចុចដើម្បីជ្រើសរើស")}
                        </span>
                        <span className="text-[10px] text-slate-500 block">Supports PDF, PNG, JPG (maximum 10MB)</span>
                      </div>

                      {/* Mock upload triggering toggles */}
                      <div className="flex gap-1.5 mt-2 z-10">
                        <button
                          type="button"
                          onClick={() => setDocFile("simulated_patent_ver.pdf")}
                          className="py-1 px-3 text-[9px] bg-slate-900 border border-white/10 rounded-lg cursor-pointer hover:text-sky-300"
                        >
                          Simulate Patent Patent Upload
                        </button>
                        <button
                          type="button"
                          onClick={() => setDocFile("simulated_reg_yellow.png")}
                          className="py-1 px-3 text-[9px] bg-slate-900 border border-white/10 rounded-lg cursor-pointer hover:text-sky-300"
                        >
                          Simulate Yellow Yellow Card Upload
                        </button>
                      </div>

                      {docFile && (
                        <div className="mt-3 p-1.5 px-3 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20 text-[10px] font-mono font-bold flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5" />
                          <span>Uploaded: {docFile}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 7: Review & Submit */}
            {activeStep === 7 && (
              <div className="space-y-4">
                <div className="bg-slate-950/40 p-5 rounded-2xl border border-white/5 space-y-4">
                  <div className="flex items-center gap-1.5 border-b border-white/10 pb-2">
                    <Eye className="w-4.5 h-4.5 text-sky-400" />
                    <h4 className="text-xs font-bold text-slate-200">
                      {t("Review Your Onboarding Forms", "ពិនិត្យមើលសន្លឹកបែបបទរបស់អ្នកឡើងវិញ")}
                    </h4>
                  </div>

                  <div className="space-y-3.5 text-xs text-slate-300">
                    <div className="grid grid-cols-2 gap-2.5 bg-black/25 p-3 rounded-xl">
                      <div>
                        <span className="text-[10px] uppercase text-slate-500 font-bold block">Account Owner</span>
                        <span className="font-bold text-slate-200">{basicName}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-slate-500 font-bold block">Active Phone</span>
                        <span className="font-mono text-slate-200">{basicPhone}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-slate-500 font-bold block">Email Registry</span>
                        <span>{basicEmail}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-slate-500 font-bold block">Active Roles</span>
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {selectedRoles.map(r => (
                            <span key={r} className="bg-sky-500/10 text-sky-400 px-1.5 py-0.5 rounded text-[9px] font-bold border border-sky-500/15">{r}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {selectedRoles.includes("Vehicle Owner") && (
                      <div className="p-3 bg-indigo-500/5 text-slate-350 rounded-xl border border-indigo-500/10 space-y-1.5">
                        <span className="text-[10px] uppercase text-indigo-400 font-bold block">Proposed Vehicle Enrollment</span>
                        <div className="flex items-center gap-2">
                          <Car className="w-4 h-4 text-indigo-400" />
                          <span className="font-bold text-slate-200">{brand} {model} ({year})</span>
                        </div>
                        <p className="text-[10px] font-mono text-slate-400">
                          Plate: {plateNumber} • Odo: {currentMileage} km • Condition: {vehicleCondition}
                        </p>
                      </div>
                    )}

                    {selectedRoles.some(r => r !== "Vehicle Owner" && r !== "Super Admin" && r !== "Staff User") && (
                      <div className="p-3 bg-emerald-500/5 text-slate-350 rounded-xl border border-emerald-500/10 space-y-1.5">
                        <span className="text-[10px] uppercase text-emerald-400 font-bold block">Proposed Business Registration</span>
                        <div className="flex items-center gap-2">
                          <Wrench className="w-4 h-4 text-emerald-400" />
                          <span className="font-bold text-slate-200">{bName}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-normal">
                          Address: {bAddress} <br />
                          Services: {bServicesOffered.join(", ")} <br />
                          Staff roster size: {staffList.length} mechanics active.
                        </p>
                      </div>
                    )}

                    {/* Notification Checklist Preference */}
                    <div className="p-3 bg-black/25 rounded-md space-y-2 border border-white/5">
                      <span className="text-[10px] uppercase text-slate-500 font-bold block">Notification Preferences</span>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-1.5 text-[10px] text-slate-300">
                          <input type="checkbox" checked={notifPush} onChange={(e) => setNotifPush(e.target.checked)} />
                          <span>Push</span>
                        </label>
                        <label className="flex items-center gap-1.5 text-[10px] text-slate-300">
                          <input type="checkbox" checked={notifTelegram} onChange={(e) => setNotifTelegram(e.target.checked)} />
                          <span>Telegram channel</span>
                        </label>
                        <label className="flex items-center gap-1.5 text-[10px] text-slate-300">
                          <input type="checkbox" checked={notifEmail} onChange={(e) => setNotifEmail(e.target.checked)} />
                          <span>Email updates</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Form Step Action triggers */}
          <div className="flex items-center justify-between border-t border-white/10 pt-4">
            <button
              type="button"
              disabled={activeStep === 1}
              onClick={() => setActiveStep(prev => prev - 1)}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold rounded-xl transition disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            >
              ← {t("Back", "ត្រឡប់ក្រោយ")}
            </button>

            {activeStep < 7 ? (
              <button
                type="button"
                onClick={() => {
                  if (activeStep === 1 && !validatePhone(basicPhone)) return;
                  setActiveStep(prev => prev + 1);
                }}
                className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-slate-950 text-xs font-bold rounded-xl transition cursor-pointer shadow-md"
              >
                {t("Continue", "បន្ត")} →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinalSubmitRegistration}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:scale-[1.01] text-slate-950 text-xs font-black rounded-xl transition cursor-pointer shadow-lg tracking-wider"
              >
                {t("Review & Submit Onboarding", "ពិនិត្យឡើងវិញ និងដាក់ស្នើការចុះឈ្មោះ")} ✓
              </button>
            )}
          </div>

        </div>

        {/* Right Column: Live Interactivity Boards & MVP Subsystems */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* MVP 1: QR scanning & automatic service ticket builder simulation */}
          <div className="glass rounded-3xl p-5 bg-slate-900/60 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-pink-400 animate-pulse" />
                <span>{t("Garage QR Scan Simulation", "ការស្កេនកូដ QR សាកល្បងដោយយានដ្ឋាន")}</span>
              </h4>
              <span className="text-[9px] font-mono text-pink-400 bg-pink-500/10 px-1 py-0.5 rounded font-bold">POS Bay</span>
            </div>

            <p className="text-[10px] text-slate-400 leading-normal">
              {t(
                "Simulates a Cambodia mechanic scanning a vehicle secure QR token on arrival, pulling specifications live, and submitting service records.",
                "សាកល្បងសេណារីយ៉ូដែលជាងស្កេនកូដ QR របស់យានយន្តដើម្បីទាញយកប៉ារ៉ាម៉ែត្រ ហើយដាក់ស្នើកំណត់ត្រាសេវាកម្ម។"
              )}
            </p>

            <div className="space-y-3 p-3 bg-black/20 rounded-2xl border border-white/5">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">{t("Select Vehicle to Scan Checkin", "លោតរើសយានយន្តស្កេន")}</label>
                <div className="flex gap-2">
                  <select
                    value={selectedVehicleToScan}
                    onChange={(e) => setSelectedVehicleToScan(e.target.value)}
                    className="flex-1 bg-slate-900 border border-white/15 p-2 text-xs rounded-xl focus:outline-none focus:border-white/20 text-slate-100"
                  >
                    <option value="">-- Choose Enrolled Vehicle --</option>
                    {allEnrolledVehicles.map(v => (
                      <option key={v.id} value={v.id}>{v.brand} {v.model} - [ID: {v.id}]</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={triggerSimulateScan}
                    className="p-2 bg-pink-500 hover:bg-pink-600 rounded-xl text-slate-950 font-bold text-xs cursor-pointer transition min-w-[70px]"
                  >
                    {t("Scan", "ស្កេន")}
                  </button>
                </div>
              </div>

              {scannerFeedback && (
                <div className="p-2 bg-emerald-500/10 text-emerald-400 text-[10px] rounded-lg border border-emerald-500/20 font-bold animate-bounce mt-1">
                  {scannerFeedback}
                </div>
              )}

              {/* Scanned Vehicle Data retrieved */}
              {retrievedScannedVehicle ? (
                <form onSubmit={createServiceFromScannerCheckin} className="space-y-3.5 border-t border-white/10 pt-3 animate-fade-in">
                  <div className="bg-slate-950 p-2.5 rounded-lg text-[10px] text-slate-300 space-y-1">
                    <span className="font-extrabold text-sky-400 block uppercase">SCANNED SECURE METADATA</span>
                    <div>Brand: <strong className="text-white">{retrievedScannedVehicle.brand} {retrievedScannedVehicle.model}</strong></div>
                    <div>Chassis: <strong className="text-white font-mono">{retrievedScannedVehicle.chassisNumber || "N/A - JT62BC"}</strong></div>
                    <div>Owner Name: <strong className="text-white">{retrievedScannedVehicle.owner || "Yeon Pisith"}</strong></div>
                    <div>Registered Odometer: <strong className="text-white">{retrievedScannedVehicle.mileage} km</strong></div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-0.5">
                      <label className="text-[9px] uppercase text-slate-400 font-bold">{t("Category", "ប្រភេទ")}</label>
                      <select
                        value={createdTktType}
                        onChange={(e) => setCreatedTktType(e.target.value)}
                        className="w-full bg-slate-900 border border-white/10 p-1.5 text-xs rounded-xl"
                      >
                        <option value="Engine Oil Service">Engine Oil Service</option>
                        <option value="Lower suspension check">Lower suspension check</option>
                        <option value="A/C Diagnostics Overhaul">A/C Diagnostics Overhaul</option>
                        <option value="Monsoon sealing checks">Monsoon sealing checks</option>
                      </select>
                    </div>

                    <div className="space-y-0.5">
                      <label className="text-[9px] uppercase text-slate-400 font-bold">{t("Description", "ការពិពណ៌នា")}</label>
                      <input
                        type="text"
                        value={createdTktDesc}
                        onChange={(e) => setCreatedTktDesc(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 p-1.5 text-xs rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 pb-1">
                    <div className="space-y-0.5">
                      <label className="text-[9px] uppercase text-slate-400 font-bold">{t("Parts replaced", "គ្រឿងបន្លាស់")}</label>
                      <input
                        type="text"
                        value={createdTktParts}
                        onChange={(e) => setCreatedTktParts(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 p-1.5 text-[10px] rounded-xl font-mono"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <label className="text-[9px] uppercase text-slate-400 font-bold">{t("Labor ($)", "ឈ្នួលពលកម្ម")}</label>
                      <input
                        type="number"
                        value={createdTktLabor}
                        onChange={(e) => setCreatedTktLabor(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 p-1.5 text-[10px] rounded-xl font-mono"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <label className="text-[9px] uppercase text-slate-400 font-bold">{t("Parts ($)", "សរុបគ្រឿងបន្លាស់")}</label>
                      <input
                        type="number"
                        value={createdTktPartsCost}
                        onChange={(e) => setCreatedTktPartsCost(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 p-1.5 text-[10px] rounded-xl font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-pink-500 hover:bg-pink-600 text-slate-950 text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Submit record for Owner approval
                  </button>
                </form>
              ) : (
                <div className="py-4 text-center text-slate-500 text-[10px]">
                  {t("Awaiting QR read checkin...", "កំពុងរង់ចាំការឆែកស្កេនយានយន្ត...")}
                </div>
              )}
            </div>

          </div>

          {/* MVP 2: Owners Pending Approval Screen */}
          <div className="glass rounded-3xl p-5 bg-slate-900/60 border border-white/10 space-y-4">
            
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>{t("Owner Approvals queue", "ជួរការអនុម័តរបស់ម្ចាស់")}</span>
              </h4>
              <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1 py-0.5 rounded font-bold">
                {serviceTicketsDb.filter(tkt => tkt.status === "Pending").length} Pending
              </span>
            </div>

            <p className="text-[10px] text-slate-400 leading-normal">
              {t(
                "Service records logged by workshops do not enter the official historic chain of your vehicle until you review and confirm line items or pricing.",
                "កំណត់ត្រាសេវាកម្មដែលសិក្ខាសាលាបានកត់ត្រានឹងមិនចូលទៅក្នុងខ្សែប្រវត្តិផ្លូវការរហូតដល់អ្នកពិនិត្យ និងយល់ព្រមពីតម្លៃ។"
              )}
            </p>

            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {serviceTicketsDb.length === 0 ? (
                <div className="p-3 text-center text-slate-500 text-xs">No pending approvals logged.</div>
              ) : (
                serviceTicketsDb.map(tkt => (
                  <div key={tkt.id} className="p-3 rounded-2xl bg-black/20 border border-white/5 space-y-2.5 text-xs">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-extrabold text-slate-200 block text-[11px]">{tkt.serviceType}</span>
                        <span className="text-[9px] text-slate-500 tracking-tight block">
                          Logged by: <strong className="text-slate-450 text-indigo-400">{tkt.garageName}</strong>
                        </span>
                        <span className="text-[9px] text-slate-500 font-mono block">Vehicle ID: {tkt.vehicleId}</span>
                      </div>
                      
                      {tkt.status === 'Pending' ? (
                        <span className="text-[8px] bg-amber-500/10 border border-amber-500/25 text-amber-400 px-1.5 py-0.5 rounded uppercase font-bold shrink-0">
                          Pending Approval
                        </span>
                      ) : tkt.status === 'Approved' ? (
                        <span className="text-[8px] bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 px-1.5 py-0.5 rounded uppercase font-bold shrink-0">
                          Approved
                        </span>
                      ) : (
                        <span className="text-[8px] bg-red-500/10 border border-red-500/25 text-red-100 px-1.5 py-0.5 rounded uppercase font-bold shrink-0">
                          Rejected
                        </span>
                      )}
                    </div>

                    <p className="text-[10px] text-slate-400 leading-snug bg-black/20 p-2 rounded-lg italic">
                      "{tkt.description}"
                    </p>

                    <div className="grid grid-cols-3 gap-2.5 text-center text-[10px] font-mono border-t border-b border-white/5 py-1.5">
                      <div>
                        <span className="text-[8px] text-slate-500 block uppercase">Labor Fee</span>
                        <span className="font-extrabold text-slate-350">${tkt.laborCost}</span>
                      </div>
                      <div>
                        <span className="text-[8px] text-slate-500 block uppercase">Parts replaced</span>
                        <span className="font-extrabold text-slate-350">${tkt.partsCost}</span>
                      </div>
                      <div>
                        <span className="text-[8px] text-slate-500 block uppercase">Grand Total</span>
                        <span className="font-black text-rose-400">${tkt.totalCost}</span>
                      </div>
                    </div>

                    {tkt.status === 'Pending' && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => approveTicket(tkt.id)}
                          className="flex-1 py-1 px-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-[10px] cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const reason = prompt("Enter rejection reason notes:") || "Price adjustment needed";
                            rejectTicket(tkt.id, reason);
                          }}
                          className="flex-1 py-1 px-2.5 bg-red-600/20 hover:bg-red-600/30 text-red-200 font-bold border border-red-600/30 rounded-xl text-[10px] cursor-pointer"
                        >
                          Reject / Revise
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

          </div>

          {/* MVP 3: Admin verification checking board */}
          <div className="glass rounded-3xl p-5 bg-slate-900/60 border border-white/10 space-y-4">
            
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-sky-400" />
                <span>{t("Super Admin verification workspace", "អ្នកគ្រប់គ្រងផ្ទៃផ្ទៀងផ្ទាត់អាជីវកម្ម")}</span>
              </h4>
              <span className="text-[9px] font-mono text-sky-400 bg-sky-500/10 px-1 py-0.5 rounded font-bold">Admin Portal</span>
            </div>

            <p className="text-[10px] text-slate-400 leading-normal">
              {t(
                "Vets incoming partner registration requests. Approve coordinates, opening parameters, and document proof before certifying them public.",
                "ពិនិត្យសំណើចុះឈ្មោះរបស់ដៃគូដែលចូលមក។ អនុម័តកូអរដោនេ ឯកសារយោង និងទិន្នន័យដើម្បីផ្ទៀងផ្ទាត់។"
              )}
            </p>

            <div className="space-y-3.5">
              {verificationRequestsDb.map(req => (
                <div key={req.id} className="p-3 rounded-2xl bg-black/30 border border-white/8 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                    <div>
                      <strong className="text-slate-100 block text-[11px]">{req.businessName}</strong>
                      <span className="text-[8px] text-slate-500 uppercase tracking-widest block font-mono">{req.businessType} Certification request</span>
                    </div>

                    {req.status === 'Pending' ? (
                      <span className="text-[8px] bg-sky-500/10 border border-sky-500/20 text-sky-400 px-1.5 py-0.5 rounded font-bold shrink-0 animate-pulse">
                        Vetting
                      </span>
                    ) : req.status === 'Approved' ? (
                      <span className="text-[8px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-bold shrink-0">
                        Certified ✓
                      </span>
                    ) : (
                      <span className="text-[8px] bg-red-500/10 border border-red-500/20 text-red-300 px-1.5 py-0.5 rounded font-bold shrink-0">
                        Denied
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 block leading-normal text-[10px] text-slate-450 text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-sky-400" />
                      <span>Docs submitted: <strong className="text-white">{req.submittedDocuments}</strong></span>
                    </div>
                  </div>

                  {req.status === 'Pending' && (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => approveVerificationRequest(req.id, req.businessId)}
                        className="flex-1 py-1 px-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold rounded-xl text-[10px] cursor-pointer"
                      >
                        Grant Certified Badge ✓
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const notes = prompt("Enter denial reasons/missing compliance documents:") || "Missing patent tax";
                          rejectVerificationRequest(req.id, notes);
                        }}
                        className="flex-1 py-1 px-2.5 bg-slate-900 border border-white/10 hover:bg-slate-800 text-slate-300 font-bold rounded-xl text-[10px] cursor-pointer"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
