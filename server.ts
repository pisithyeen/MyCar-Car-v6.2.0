/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import {
  UserProfile,
  VehicleProfile,
  MaintenanceRecord,
  GaragePartner,
  SmartReminder,
  AIDiagnosisResult,
  VehicleWeaknessReport,
  NotificationLog,
  ForumPost,
  ForumComment,
  PartListing,
  PartOffer,
  PartReport,
  PartComment,
  VehicleExpense,
  AttachedDocument
} from "./src/types";
import { 
  seedInitialDataOnlyIfDry, 
  getUserByEmail, 
  upsertUserProfile, 
  getVehiclesByOwner, 
  getAllVehicles,
  insertVehicle, 
  getMaintenanceByVehicle, 
  getMaintenanceAll,
  insertMaintenance, 
  getAllGarages,
  getRemindersByVehicle,
  getExpensesByVehicle,
  insertExpense,
  getDocumentsByVehicle,
  insertDocument,
  getNotificationsByVehicle,
  markNotificationsRead,
  insertNotification,
  getForumPostsWithComments,
  insertForumPost,
  insertForumComment,
  getPartListings,
  insertPartListing,
  insertPartOffer,
  insertPartReport
} from "./src/db/helper.ts";

dotenv.config();

// Initialize Express App
const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory Database state
let simulatedUsersDatabase: UserProfile[] = [
  {
    id: 1,
    name: "Yeon Pisith",
    email: "pisith.yeen@gmail.com",
    phone: "+855 12 345 678",
    role: "Vehicle Owner",
    location: "Phnom Penh",
    status: "Approved"
  },
  {
    id: 2,
    name: "Chan Kiri",
    email: "kiri@angkor-repair.kh",
    phone: "+855 15 999 888",
    role: "Garage Owner",
    location: "Siem Reap",
    status: "Pending",
    businessName: "Angkor Speed Auto Repair",
    licenseNumber: "Co-8271/2026-KH"
  },
  {
    id: 3,
    name: "Sothy Leakhena",
    email: "leakhena@total-sothearos.kh",
    phone: "+855 11 112 233",
    role: "Petrol Station Partner",
    location: "Phnom Penh",
    status: "Pending",
    businessName: "TotalEnergies Sothearos Blvd",
    licenseNumber: "Co-6211/2026-KH"
  },
  {
    id: 4,
    name: "Preap Norith",
    email: "norith@toyota-parts.kh",
    phone: "+855 12 777 666",
    role: "Spare Part Shop",
    location: "Sihanoukville",
    status: "Approved",
    businessName: "Sihanoukville Toyota Parts",
    licenseNumber: "Co-1934/2026-KH"
  },
  {
    id: 5,
    name: "Sokna Highway Helper",
    email: "highway@roadside.kh",
    phone: "+855 93 456 789",
    role: "Freelance Mechanic",
    location: "Battambang",
    status: "Pending",
    businessName: "Sokna Express Towing",
    licenseNumber: "Co-4188/2026-KH"
  },
  {
    id: 6,
    name: "Fraudulent Mechanic",
    email: "cheater@scam-repair.kh",
    phone: "+855 10 999 999",
    role: "Freelance Mechanic",
    location: "Phnom Penh",
    status: "Suspended",
    businessName: "Phnom Penh Mobile Repair",
    licenseNumber: "Co-4819/2026-KH"
  },
  {
    id: 7,
    name: "Platform Administrator",
    email: "admin@mycar.com.kh",
    phone: "+855 23 888 888",
    role: "Admin",
    location: "Phnom Penh",
    status: "Approved"
  }
];

let activeProfile: any = simulatedUsersDatabase[0];

const defaultWeaknessReport: VehicleWeaknessReport = {
  commonIssues: [
    { issue: "Lower Ball Joint Failure", advice: "The ball joints on 2005-2006 models wear prematurely. This can cause front suspension noise or extreme handling danger. Inspect them every 10,000 km.", risk: "high" },
    { issue: "Frame Rust on Underbody", advice: "Known severe issue in high humidity or muddy areas. Inspect the structural frame rails for safety. Apply anti-rust spray coating.", risk: "high" },
    { issue: "Automatic Transmission Hard Shifting", advice: "Shifting delays or harsh shifts between 1st and 2nd gear. Change automatic transmission fluid every 45,000 km.", risk: "medium" },
    { issue: "Squeaking Leaf Springs", advice: "Rear leaf spring suspension rub generates squeaks. Lubricate spring pads and check shock absorber eyelets.", risk: "low" }
  ],
  maintenancePriority: [
    "Verify front suspension ball joint recalls or checks",
    "Inspect the physical state of the structural frame undercarriage",
    "Drain and fill transmission fluid"
  ],
  strongPoints: [
    "Legendary 4.0L V6 reliability",
    "High re-sale value in Cambodia's secondary market",
    "Excellent off-road durability for provincial road trips",
    "Easily sourceable spare parts in Phnom Penh (St. 271, Russian Blvd)"
  ],
  weakPoints: [
    "Severe structural frame corrosion vulnerability",
    "High urban gasoline premium fuel consumption",
    "Basic interior technology packages",
    "Stiff rear suspension ride comfort when unladen"
  ],
  monthlyChecklist: [
    "Check tire pressure including spare tyre",
    "Check engine oil level and coolant level",
    "Verify all headlights, brake indicator lights, and turn signals work"
  ],
  longTripChecklist: [
    "Inspect lower ball joints play",
    "Check brake pad thickness and rotor smoothness",
    "Verify radiator hoses are secure with no fluid leaks under pressure",
    "Carry proper tyre jack and Cambodia emergency assistance numbers"
  ],
  recommendedSchedule: [
    { task: "Engine Oil & Filter Change", interval: "Every 5,000 km or 3 months" },
    { task: "Tire Rotation and Balance Check", interval: "Every 10,000 km" },
    { task: "Front Suspension & Ball Joint Check", interval: "Every 10,000 km" },
    { task: "Automatic Transmission Fluid Flush", interval: "Every 40,000 km" },
    { task: "Undercarriage Anti Rust Guard", interval: "Every 12 months" }
  ],
  warningSigns: [
    "Vibration in steering wheel while braking (warped rotors)",
    "Clunking noise from front wheel when driving over cambodian speed bumps (worn ball joints)",
    "Engine temp gauge rising above middle line during phnom penh rush hour gridlock"
  ]
};

let vehicles: VehicleProfile[] = [
  {
    id: "v1",
    brand: "Toyota",
    model: "Tacoma 2006",
    year: 2006,
    mileage: 186500,
    fuelType: "Gasoline",
    lastOilChangeMileage: 186500,
    lastServiceDate: "2026-05-15",
    engineType: "Petrol / Gasoline",
    transmission: "Automatic",
    vehicleType: "Pickup",
    owner: "Yeon Pisith",
    plateNumber: "2AB-4589",
    chassisNumber: "JT2BF1FK6FC112233",
    weaknessReport: defaultWeaknessReport,
    notes: "A reliable daily pickup. Serves as the primary transport vehicle for high clearance province trips."
  },
  {
    id: "v2",
    brand: "BYD",
    model: "Shark 2025",
    year: 2025,
    mileage: 12800,
    fuelType: "Hybrid",
    lastOilChangeMileage: 10000,
    lastServiceDate: "2026-05-20",
    engineType: "Plug-in Hybrid / PHEV",
    transmission: "Automatic",
    vehicleType: "Pickup",
    owner: "Yeon Pisith",
    plateNumber: "2CD-8899",
    chassisNumber: "BYDSHARK2025PHEV99",
    weaknessReport: {
      commonIssues: [
        { issue: "Battery Thermal Warning in High Ambient Temp", advice: "Ensure active battery cooling liquid replacement is completed on time.", risk: "high" },
        { issue: "Software Infotainment Lag", advice: "Install OTA software packages systematically at EV Care Centers.", risk: "low" }
      ],
      maintenancePriority: ["Software diagnostic scan", "Liquid coolant check-up"],
      strongPoints: ["Massive electric driving range", "Powerful acceleration"],
      weakPoints: ["Heavy overall curb weight", "Requires expert EV diagnostics"],
      monthlyChecklist: ["Clean charging port contacts", "Measure tire tread wear"],
      longTripChecklist: ["Verify active battery thermal system", "Ensure portable home charger operates"],
      recommendedSchedule: [{ task: "Hybrid Control Software Update", interval: "Every 15,000 km" }],
      warningSigns: ["EV warning sign lights up on high voltage pack"]
    },
    notes: "Cutting-edge plug-in hybrid pickup truck. Excellent fuel economy and high comfort."
  },
  {
    id: "v3",
    brand: "Hyundai",
    model: "Porter 2018",
    year: 2018,
    mileage: 245000,
    fuelType: "Diesel",
    lastOilChangeMileage: 240000,
    lastServiceDate: "2026-05-25",
    engineType: "Diesel",
    transmission: "Manual",
    vehicleType: "Truck",
    owner: "Yeon Pisith",
    plateNumber: "3A-7742",
    chassisNumber: "KMYPORTR18HD774211",
    weaknessReport: {
      commonIssues: [
        { issue: "Fuel Injector System Congestion", advice: "Cambodian high-sulfur diesel can block lines. Use premium fuel cleaning additives.", risk: "high" },
        { issue: "Suspension Spring Squeaks under Heavy Loads", advice: "Check leaf spring grease layers regularly.", risk: "medium" }
      ],
      maintenancePriority: ["Diesel fuel filter flushing", "Rear suspension lubrication"],
      strongPoints: ["Tough load-carrier back", "Excellent manual gearbox durability"],
      weakPoints: ["Noisy cabin at high cruising speeds", "High emissions without clean diesel additive"],
      monthlyChecklist: ["Examine hydraulic brake fluids", "Drain fuel water separator trap"],
      longTripChecklist: ["Verify tire load rating inflation", "Confirm dual auxiliary cooling fans engagement"],
      recommendedSchedule: [{ task: "Diesel Fuel Injector Flushing", interval: "Every 10,000 km" }],
      warningSigns: ["Excessive dark exhaust smoke on heavy throttle acceleration"]
    },
    notes: "Tough diesel light carrier truck. Essential helper for local logistics and delivery operations."
  },
  {
    id: "v4",
    brand: "Lexus",
    model: "RX330 AWD Luxury",
    year: 2005,
    mileage: 210050,
    fuelType: "Gasoline",
    lastOilChangeMileage: 206500,
    lastServiceDate: "2026-03-25",
    engineType: "Petrol / Gasoline",
    transmission: "Automatic",
    vehicleType: "SUV",
    owner: "Oung Saman",
    plateNumber: "PP-2X-4505",
    chassisNumber: "JTJBW1BC6G2112233",
    weaknessReport: {
      commonIssues: [
        { issue: "Dashboard Crack Disease", advice: "Common across 2004-2007 Lexus. Heavy UV heat breaks the composite material. Use solar window shields.", risk: "low" },
        { issue: "Radiator Plastic Tank Separation", advice: "Original plastic tanks split at the top seam over heat load cycles. Highly query upgrading to hybrid aluminum.", risk: "high" },
        { issue: "Steering Rack Oil Seepage", advice: "Rubber boot seals dry up. Causes steering groans during low-speed parking turns in Phnom Penh.", risk: "medium" }
      ],
      maintenancePriority: [
        "Replace worn timing belt component immediately if overdue",
        "Examine cooling system integrity to avoid highway heat collapse",
        "Lubricate steering rack and check tierod connections daily"
      ],
      strongPoints: [
        "Luxurious ride comfort on rough surfaces and broken urban tarmac",
        "Timeless elegant design remains highly respected in local communities",
        "Extremely reliable V6 block can endure high stress with basic service"
      ],
      weakPoints: [
        "Slightly heavy gasoline fuel consumption in urban areas",
        "Soft rear air suspension is subject to eventual leakage replacement bills",
        "Prone to steering rack reservoir leak failures"
      ],
      monthlyChecklist: [
        "Check steering power assist pump container fluid levels",
        "Inspect timing belt access cover for grease traces",
        "Examine slide sunroof rubber channels for blockage drain leaves"
      ],
      longTripChecklist: [
        "Scan radiator header tank for hairline cracking marks",
        "Confirm air-suspension system level maintains continuous high trim",
        "Pack additional engine oil bottle for high temperature lubrication security"
      ],
      recommendedSchedule: [
        { task: "V6 Engine Oil Replacement Service", interval: "Every 5,000 km or 3 months" },
        { task: "Timing Belt & Water Pump Overhaul Refit", interval: "Every 90,000 km" }
      ],
      warningSigns: [
        "White steam traces emitting from radiator upper grill grille zone",
        "Heavy groaning noise when completing lock-to-lock steering turns",
        "Rear right outer wheel sitting lower than the other three"
      ]
    },
    notes: "A timeless executive luxury SUV still highly sought after in modern Phnom Penh."
  },
  {
    id: "v5",
    brand: "Mitsubishi",
    model: "Outlander PHEV Sport",
    year: 2018,
    mileage: 72000,
    fuelType: "Hybrid",
    lastOilChangeMileage: 68000,
    lastServiceDate: "2026-04-12",
    engineType: "Plug-in Hybrid / PHEV",
    transmission: "CVT",
    vehicleType: "SUV",
    owner: "Sun Chansophy",
    plateNumber: "PP-2M-8899",
    chassisNumber: "JA4AZ3A34JZ112233",
    weaknessReport: {
      commonIssues: [
        { issue: "HV Battery Capacity Degradation", advice: "Monitor state of health (SOH) on dashboard weekly. Limit rapid DC charging under peak daytime heat.", risk: "high" },
        { issue: "Rear Electric Motor Mount Wear", advice: "Inspect rubber bushings for tearing to avoid driveline thud noises during heavy regenerative braking.", risk: "medium" },
        { issue: "PHEV Mode Selector Glitch", advice: "Software logic issues causing hybrid error warnings. Run factory ECU updates at Mitsu center.", risk: "low" }
      ],
      maintenancePriority: [
        "Test high voltage battery SOH parameters",
        "Verify dual-motor cooling coolant lines clarity",
        "Clean rear battery compartment ventilation dust channels"
      ],
      strongPoints: [
        "Dual electric and gasoline system allows 45km pure pure EV noiseless driving",
        "Full symmetrical S-AWC 4WD active traction for rainy provincial conditions",
        "Generous spacious loading bay layout with household AC power outputs"
      ],
      weakPoints: [
        "Heavy curb mass accelerates standard tire rubber shoulder shaving",
        "Drying of electric motor wiring insulation connectors over dusty seasons",
        "Gasoline mileage is high once battery storage is fully depleted"
      ],
      monthlyChecklist: [
        "Inspect high-voltage battery cooling fan duct under rear seats",
        "Check battery pack outer structural shell for monsoonal scratch impressions",
        "Test charge cable connector lock mechanism for dirt deposits"
      ],
      longTripChecklist: [
        "Top up double cooling loops (one for inverter, one for gas block)",
        "Check 10A home charger adapter pack for secure grounding",
        "Ensure tires are highly inflated to maximize electric range glide specs"
      ],
      recommendedSchedule: [
        { task: "Internal Combustion Engine Oil & CVT Maintenance", interval: "Every 7,500 km" },
        { task: "EV Inverter & Front Motor Coolant Swap", interval: "Every 45,000 km" },
        { task: "Hybrid Battery Fan & Duct Lint Deep Clean", interval: "Every 15,000 km" }
      ],
      warningSigns: [
        "EV System Warning indicator light staying lit on startup",
        "Heavy engine hum vibration when stationary in Phnom Penh gridlock",
        "Regenerative braking feels delayed or inconsistent during downhill slides"
      ]
    },
    notes: "Elegant family crossover featuring dual-motor AWD and robust electric mode fuel-saving parameters."
  },
  {
    id: "v6",
    brand: "BYD",
    model: "Atto 3 Extended",
    year: 2023,
    mileage: 18400,
    fuelType: "EV",
    lastServiceDate: "2026-05-10",
    engineType: "EV / Fully Electric Vehicle",
    transmission: "Single-Speed",
    vehicleType: "SUV",
    owner: "Keo Piseth",
    plateNumber: "PP-4A-3388",
    chassisNumber: "LC0C2CBDXPP112233",
    weaknessReport: {
      commonIssues: [
        { issue: "Charging Port Pin Oxidation", advice: "Airborne salts and monsoonal humidity corrode copper contacts. Use contact cleaner sprays.", risk: "medium" },
        { issue: "Underbody Protective Armor Denting", advice: "Potholes and high speed dirt blocks can scratch battery bottom plate. Inspect bolts structurally.", risk: "high" },
        { issue: "ADAS Camera Calibration Drift", advice: "Dust layers on front windshield sensors cause lane keeping dropouts. Keep target glass zone custom cleaned.", risk: "low" }
      ],
      maintenancePriority: [
        "Measure LFP Blade Battery cell balancing values under DC fast charging",
        "Clean charging port pins and lubricate dust protection latch",
        "Inspect suspension sway-bars and rigid shock mounts for heavy load specs"
      ],
      strongPoints: [
        "Ultra durable LFP Blade battery pack with exceptional thermal runway safety",
        "Remarkable real electric driving range (420 km) for full capital commuting",
        "High quality cabin styling and responsive infotainment updates"
      ],
      weakPoints: [
        "No spare wheel provided default - relying on repair kits under gravel roads",
        "Heavy duty traction weight causes faster front tire wear",
        "Proprietary electric modules cannot be repaired by typical mechanics"
      ],
      monthlyChecklist: [
        "Clean high density HEPA cabin filtration array",
        "Confirm charging locking PIN latch works with zero obstruction",
        "Check battery heat dissipation liquid cooling tanks for levels"
      ],
      longTripChecklist: [
        "Pre-route journeys via fast DC chargers map in Cambodia routes",
        "Test emergency direct vehicle-to-load V2L backup cable system",
        "Examine tire sidewalls for dynamic bubbling after harsh pothole bumps"
      ],
      recommendedSchedule: [
        { task: "Charging Ports & High Voltage Connector Inspection", interval: "Every 15,000 km" },
        { task: "High Capacity Cabin Dust Filtering Module Refit", interval: "Every 10,000 km" },
        { task: "Battery Armor Plate Shell Fastener Torque Check", interval: "Every 20,000 km" }
      ],
      warningSigns: [
        "BMS battery health warning text appearing on instrument cluster",
        "Slow charging rates even when plugged to ultra high power DC systems",
        "Mild clicking sound coming from electronic transmission output bearings"
      ]
    },
    notes: "State-of-the-art electric SUV powered by BYD's safest Blade Battery layout. Highly robust."
  },
  {
    id: "v7",
    brand: "Toyota",
    model: "Alphard LPG Executive",
    year: 2015,
    mileage: 138000,
    fuelType: "Gasoline",
    lastOilChangeMileage: 135000,
    lastServiceDate: "2026-05-15",
    engineType: "LPG / CNG Gas Vehicle",
    transmission: "CVT",
    vehicleType: "Van",
    owner: "Oung Saman",
    plateNumber: "PP-2J-1155",
    chassisNumber: "AGH30-112233XXXX",
    weaknessReport: {
      commonIssues: [
        { issue: "LPG Regulator Membrane Dry-Out", advice: "Highly monsoonal extreme heat hardens rubber seals. Test for gas odor leaks weekly around regulator gaskets.", risk: "high" },
        { issue: "LPG Injector Deposit Clogging", advice: "Heavy oily paraffin structures clog precise nozzles. Fit high grade filter line and swap every 10,000 km.", risk: "medium" },
        { issue: "Engine Cylinder Head Valve Shaving", advice: "LPG burns dry and hot. Check for cooling parameters and engine block valve clearance tuning.", risk: "high" }
      ],
      maintenancePriority: [
        "Conduct bubble leak testing on gas pipeline connection flanges",
        "Replace LPG fuel filters (high and low pressure cartridge filters)",
        "Review spark plug heat rating calibration specs"
      ],
      strongPoints: [
        "Spectacular spacious luxury seating layout with unparalleled passenger comfort",
        "Dramatically reduced fuel costs (half the cost of gasoline VIP operations)",
        "Exceptionally quiet running condition while secondary system runs"
      ],
      weakPoints: [
        "LPG pressure bottle takes significant cargo trunk room",
        "LPG filling stations are near non-existent outside main capitals and arterial routes",
        "Requires certified gas integration certificates for standard Cambodia inspections"
      ],
      monthlyChecklist: [
        "Run simple soapy water leak diagnostic on gas regulator joints",
        "Confirm secondary pressure gauge on trunk tank is in safe green area",
        "Cycle primary petrol system for 5km to keep original gasoline injector lines lubricated"
      ],
      longTripChecklist: [
        "Check that original gasoline tank has at least 30% storage to serve as emergency backup",
        "Locate specific LPG commercial stations along provincial corridors",
        "Inspect heat shield underneath where gas lines traverse near exhaust piping"
      ],
      recommendedSchedule: [
        { task: "LPG Filters Replacement & Gas Sniffer Inspection", interval: "Every 10,000 km" },
        { task: "LPG Vaporizer / Pressure Regulator Maintenance", interval: "Every 30,000 km" },
        { task: "Gas Cylinder Safety Pressure Static Testing", interval: "Every 5 years" }
      ],
      warningSigns: [
        "Pungent rotten-egg propane smell inside executive cabin space",
        "Engine hesitates or stalls during automatic transition from petrol to gas",
        "Rough engine running behaviors with check engine yellow indicator lit"
      ]
    },
    notes: "Converted high-end business van. Provides incredible eco-saving profiles for VIP tours."
  },
  {
    id: "v8",
    brand: "Honda",
    model: "Dream 125cc",
    year: 2022,
    mileage: 15200,
    fuelType: "Gasoline",
    lastOilChangeMileage: 14000,
    lastServiceDate: "2026-05-20",
    engineType: "Petrol Motorcycle",
    transmission: "Manual",
    vehicleType: "Moto",
    owner: "Sun Chansophy",
    plateNumber: "PP-1IK-2921",
    chassisNumber: "ND125-112233XXXX",
    weaknessReport: {
      commonIssues: [
        { issue: "Drive Chain Tension Loosening", advice: "High dust in Cambodia acts as grinding paste. Tension chain and spray heavy link lube every 1,500 km.", risk: "high" },
        { issue: "Fork Oil Seals Leakage", advice: "Extreme heat and dirt split front fork rubber seals, dripping oil on brake hub components. Inspect daily.", risk: "medium" },
        { issue: "EFI Fuel Injector Block", advice: "Low grade pump fuels choke the fine nozzle. Use fuel additives or clean engine injection throttle body.", risk: "medium" }
      ],
      maintenancePriority: [
        "Clean, adjust tension index, and lubricate drive chain",
        "Replace engine oil with dedicated 4T JASO MA lubricant",
        "Examine front and rear drum/disc brake pads thickness"
      ],
      strongPoints: [
        "The absolute gold standard of durable, fuel-sipping transit in Cambodia",
        "Interchangeable parts can be bought and fitted in basically any village workshop",
        "Remarkably simple mechanical components boast supreme long term abuse tolerance"
      ],
      weakPoints: [
        "Lacks advanced anti-lock braking technologies for wet monsoon city streets",
        "Extremely attractive target for street property thefts (needs solid wheel chain lock)",
        "Very basic suspension limits ride comfort over broken highway bypass routes"
      ],
      monthlyChecklist: [
        "Check drive chain slack index (ideal: 20-30 mm vertical play)",
        "Inspect front fork tubes for shiny oily film lines",
        "Confirm all turn signals and brake tail safety lamps glow brightly"
      ],
      longTripChecklist: [
        "Check tire inflation pressure values (rear tire needs robust support)",
        "Verify oil level window is strictly between maximum and lower notches",
        "Lube throttle cable sliding mechanics to prevent sticky acceleration sliders"
      ],
      recommendedSchedule: [
        { task: "Moto Engine Lube Lube & Spark Plug Check", interval: "Every 2,500 km" },
        { task: "Drive Chain Tension Alignment, Wash & Lubrication", interval: "Every 1,000 km" },
        { task: "Valve Lash Adjustment Tuning & Valve Cover Seal Check", interval: "Every 10,000 km" }
      ],
      warningSigns: [
        "Loud metal rattling noises coming from lower chain cover guard",
        "Exhaust tail producing blue-grey smoke on high throttle acceleration (oil burning)",
        "Vague, sluggish feeling from shift pedal during manual gear index transitions"
      ]
    },
    notes: "The legendary, unbeatable Cambodian workhorse. Exceptionally economical to operate."
  },
  {
    id: "v9",
    brand: "Yadea",
    model: "S-Like Electric",
    year: 2023,
    mileage: 4500,
    fuelType: "EV",
    lastServiceDate: "2026-05-18",
    engineType: "Electric Motorcycle / E-Bike",
    transmission: "Single-Speed",
    vehicleType: "Moto",
    owner: "Nguon Monika",
    plateNumber: "PP-1BC-4567",
    chassisNumber: "YADEA-778899XXXX",
    weaknessReport: {
      commonIssues: [
        { issue: "Rear Wheel Hub Motor Water Intrusion", advice: "Avoid pressure washing of rear axle motor hub. High high water wading standard is strictly limited.", risk: "high" },
        { issue: "Battery Pack Under-Voltage Locking", advice: "Leaving battery flat for extended weeks bricks the cells. Charge to 100% at least once a month.", risk: "high" },
        { issue: "Drum Brake Squeaking", advice: "Rainwater washing mud inside rear drum brake assembly causes heavy squeaks. Clean with dedicated brake wash.", risk: "low" }
      ],
      maintenancePriority: [
        "Verify integrity of heavy-duty battery power cable connectors",
        "Measure tire wear indicators (rear tire holds heavy motor mass)",
        "Test controller microprocessor moisture protection sealing joints"
      ],
      strongPoints: [
        "Virtually silent commute; absolute zero fuel utility expense outlay",
        "Extremely lightweight structure makes filtering through Phnon Penh traffic effortless",
        "No complex clutches, oil pumps, or valves to fail"
      ],
      weakPoints: [
        "Strictly limited top speed (around 45-50 km/h) unsafe for highway tours",
        "Charging range drops to 45km under maximum speed dual rider freighting",
        "Extremely slow standard portable battery AC charger (takes 5-6 hours)"
      ],
      monthlyChecklist: [
        "Check battery pack state of charge on display dashboard console",
        "Inspect rear hub motor axle wiring boot for splits or moisture gaps",
        "Check tires for imbedded sharp glass fragments"
      ],
      longTripChecklist: [
        "Avoid long-distance regional tours; strictly keep for city commute scopes",
        "Confirm battery charging brick fan is clear of dust before wall connection",
        "Carry secondary backup heavy copper cable locking chain"
      ],
      recommendedSchedule: [
        { task: "Direct Hub Motor Axle Seals & Bearings Inspection", interval: "Every 5,000 km" },
        { task: "Electronic Controller Diagnostic Code Read & Connector Spray", interval: "Every 10,000 km" },
        { task: "Brake Linkages Freeplay Adjust & Pivot Greasing", interval: "Every 3,000 km" }
      ],
      warningSigns: [
        "Sudden cutting power under heavy throttle demand",
        "Highly reduced dynamic acceleration response with charger heat indications",
        "Heavy humming or clicking vibration coming directly from rear wheel core hubs"
      ]
    },
    notes: "Elegant, zero-pollution urban scooter. Perfectly fits eco-friendly capital commuting."
  },
  {
    id: "v10",
    brand: "Honda",
    model: "Clarity Fuel Cell",
    year: 2019,
    mileage: 34000,
    fuelType: "EV",
    lastServiceDate: "2026-05-12",
    engineType: "Other",
    transmission: "Single-Speed",
    vehicleType: "Sedan",
    owner: "Sok Dara",
    plateNumber: "PP-2AF-0099",
    chassisNumber: "ZC4-FC8899XXXXXX",
    weaknessReport: {
      commonIssues: [
        { issue: "Fuel Refilling Unavailable", advice: "No commercial hydrogen filling stations exist inside Cambodia's borders. Retain as research/exhibit asset.", risk: "high" },
        { issue: "Proton Exchange Membrane Dry-Pack", advice: "Requires strict humidity control. Run the auxiliary water loop regularly to safeguard fragile stacks.", risk: "high" },
        { issue: "BMS Battery Buffer Cells Collapse", advice: "Small lithium-ion high voltage buffer pack degrades due to extreme ambient humidity.", risk: "medium" }
      ],
      maintenancePriority: [
        "Keep PEM hydrogen membrane hydrated via specialized system test programs",
        "Test hydrogen leak safety diagnostic sensors functionality",
        "Check high-pressure carbon-fiber hydrogen tanks mounting straps integrity"
      ],
      strongPoints: [
        "Pioneering clean tech engineering; exhausts only pure water steam",
        "Virtually instantaneous refill (within 3-5 minutes) under proper stations",
        "Exemplary silent electric motor glide ride matching premium limousines"
      ],
      weakPoints: [
        "Cannot be serviced, diagnosed, or repaired by local mechanical centers",
        "Total absence of hydrogen supply infrastructure across Cambodia",
        "Highly specialized high-voltage and high-pressure system risks"
      ],
      monthlyChecklist: [
        "Run the self-hydration maintenance cycles using diagnostic monitors",
        "Verify emergency hydrogen automatic shut-off safety valves click tests",
        "Examine under-chassis water outlet pipe for dust/insect nesting blocks"
      ],
      longTripChecklist: [
        "Long trips are completely impossible without fully-towed supply stations",
        "Inspect high-voltage insulation shields under engine bay block",
        "Check high-pressure tank pressure gauge levels on standard dashboard"
      ],
      recommendedSchedule: [
        { task: "Hydrogen Leakage Safe Detectors Diagnostics Check", interval: "Every 10,000 km" },
        { task: "Proton Exchange Stack Cooling Loop Flush", interval: "Every 30,000 km" },
        { task: "High Pressure Carbon Fuel Tank Safety Inspect Renewal", interval: "Every 5 years" }
      ],
      warningSigns: [
        "Hydrogen Leak Detected warning alert sounding inside cabin area",
        "Refusal to start with system software diagnostic communication errors",
        "Water emission drainage pipe flowing continuously even when vehicle is locked"
      ]
    },
    notes: "A futuristic hydrogen vehicle serving as a platform technology showcase for alternative fuels."
  }
];

let maintenanceRecords: MaintenanceRecord[] = [
  {
    id: "m1",
    vehicleId: "v1",
    serviceCategory: "Engine Oil Service",
    description: "Replaced oil with Mobil Super 5000 Premium, replaced oil filtration unit.",
    cost: 45,
    mileage: 175000,
    date: "2026-03-01",
    provider: "Apsara Auto Repair"
  },
  {
    id: "m2",
    vehicleId: "v1",
    serviceCategory: "Brake Service",
    description: "Vibration inspection. Cleaned calipers and machined front rotors flat.",
    cost: 85,
    mileage: 178500,
    date: "2026-04-15",
    provider: "Angkor Tyres & Alignment"
  },
  {
    id: "m3",
    vehicleId: "v2",
    serviceCategory: "Hybrid System Check",
    description: "Deep cleaned the backup hybrid fan duct filters and ran an inverter voltage diagnostics log.",
    cost: 25,
    mileage: 144050,
    date: "2026-04-10",
    provider: "Angkor Speed Auto Repair"
  },
  {
    id: "m4",
    vehicleId: "v2",
    serviceCategory: "Engine Oil Service",
    description: "Standard oil change, engine air filter swap, and high-performance spark plug replacements.",
    cost: 75,
    mileage: 142000,
    date: "2026-01-15",
    provider: "Apsara Diagnostics"
  },
  {
    id: "m5",
    vehicleId: "v3",
    serviceCategory: "Engine Oil Service",
    description: "Premium synthetic diesel oil refresh, secondary water separator drain, and high grade fuel filtration element install.",
    cost: 95,
    mileage: 89000,
    date: "2026-05-01",
    provider: "Mekong Lube Express"
  },
  {
    id: "m6",
    vehicleId: "v3",
    serviceCategory: "General Maintenance",
    description: "EGR clean and de-sooting service. Readjusted turbo manifold clamp joints to resolve slight whistling noise.",
    cost: 110,
    mileage: 85200,
    date: "2026-02-18",
    provider: "Angkor Speed Auto Repair"
  },
  {
    id: "m7",
    vehicleId: "v4",
    serviceCategory: "Radiator Repair",
    description: "Upgraded leaking plastic radiator header to solid all-aluminum heat-shielded radiator unit.",
    cost: 185,
    mileage: 206500,
    date: "2026-03-25",
    provider: "Apsara Auto Repair"
  },
  {
    id: "m8",
    vehicleId: "v4",
    serviceCategory: "Timing Belt Overhaul",
    description: "Removed front block, fit brand new OEM timing belt tensioner, idlers, and water pump assembly.",
    cost: 210,
    mileage: 180200,
    date: "2024-11-10",
    provider: "Angkor Speed Auto Repair"
  }
];

let remindersDatabase: SmartReminder[] = [
  {
    id: "rem-1",
    vehicleId: "v1",
    service: "Engine Oil Service",
    title: "Engine Oil Service",
    category: "Engine Oil Change",
    reminderType: "mileage_based",
    status: "Overdue",
    reason: "Your vehicle has driven 5,000 km since last engine oil change (Limit: 5,000 km for Cambodia conditions).",
    action: "Schedule an urgent engine oil and filter replacement at Angkor Tyres or Mekong Lube.",
    priority: "High",
    dueMileage: 180000,
    isAiSuggested: false,
    createdAt: "2026-03-01T08:00:00Z"
  },
  {
    id: "rem-2",
    vehicleId: "v1",
    service: "Brake Service",
    title: "Front Brake Pads Inspection",
    category: "Brake Check",
    reminderType: "date_and_mileage",
    status: "Due soon",
    reason: "Last brake service logged at 178,500 km. Heavy monsoon humidity can degrade pad friction materials.",
    action: "Request physical caliper inspection during your next garage visit.",
    priority: "Medium",
    dueDate: "2026-07-15",
    dueMileage: 185000,
    isAiSuggested: true,
    createdAt: "2026-04-15T10:00:00Z"
  },
  {
    id: "rem-3",
    vehicleId: "v1",
    service: "Insurance Renewal",
    title: "Auto Insurance Renewal (Forte)",
    category: "Insurance Renewal",
    reminderType: "date_based",
    status: "Good",
    reason: "Standard third-party comprehensive insurance policy coverage verification.",
    action: "Prepare renewal documents and payment with Forte Insurance before expiry.",
    priority: "High",
    dueDate: "2026-12-31",
    isAiSuggested: false,
    createdAt: "2026-03-01T08:00:00Z"
  },
  {
    id: "rem-4",
    vehicleId: "v2",
    service: "Hybrid Cooling Duct Service",
    title: "Clean Hybrid Fans & Air Ducts",
    category: "Hybrid Service",
    reminderType: "date_based",
    status: "Due soon",
    reason: "High city temperatures and heavy road dust can clog hybrid battery fans, leading to safe-mode lockouts.",
    action: "Instruct mechanics to pop rear door seats and vacuum fan ducts thoroughly.",
    priority: "Medium",
    dueDate: "2026-06-25",
    isAiSuggested: true,
    createdAt: "2026-04-10T08:00:00Z"
  },
  {
    id: "rem-5",
    vehicleId: "v2",
    service: "Engine Oil Service",
    title: "Engine Oil Service",
    category: "Engine Oil Change",
    reminderType: "mileage_based",
    status: "Good",
    reason: "Hybrid vehicle driving engine hours are minimal, keeping active oil dilution levels totally balanced.",
    action: "Monitor digital odometer. No direct actions needed until 147,000 km.",
    priority: "Low",
    dueMileage: 147000,
    isAiSuggested: false,
    createdAt: "2026-04-10T08:00:00Z"
  },
  {
    id: "rem-6",
    vehicleId: "v3",
    service: "Fuel Filter Service",
    title: "Secondary Fuel Filter Replace",
    category: "Filter Service",
    reminderType: "date_and_mileage",
    status: "Due soon",
    reason: "Water separators build humidity before the main monsoon cycle starts. Extremely critical to avoid injector water rust.",
    action: "Settle replacement element booking at Mekong Lube or Angkor speed repair.",
    priority: "High",
    dueDate: "2026-06-15",
    dueMileage: 96500,
    isAiSuggested: true,
    createdAt: "2026-05-01T10:00:00Z"
  },
  {
    id: "rem-7",
    vehicleId: "v4",
    service: "Timing Belt Replacement Check",
    title: "V6 Timing Belt Integrity Inspection",
    category: "Engine Overhaul Check",
    reminderType: "mileage_based",
    status: "Overdue",
    reason: "Lexus V6 engines use non-interference timing components, but break risk shuts down vehicle completely in mid-drive and damages valves.",
    action: "Urgent physical rubber teeth visual check required by an expert garage technician.",
    priority: "High",
    dueMileage: 210000,
    isAiSuggested: false,
    createdAt: "2026-03-25T08:00:00Z"
  }
];

let vehicleExpenses: VehicleExpense[] = [
  {
    id: "exp-1",
    vehicleId: "v1",
    category: "Fuel",
    amount: 45,
    date: "2026-05-15",
    mileage: 179200,
    provider: "Tela Gas Station",
    paymentMethod: "Cash",
    notes: "Filled up full tank of regular gasoline."
  },
  {
    id: "exp-2",
    vehicleId: "v1",
    category: "Oil change",
    amount: 45,
    date: "2026-03-01",
    mileage: 175000,
    provider: "Apsara Auto Repair",
    paymentMethod: "ABA Pay",
    notes: "Regular Mobil Super 5000 oil replacement."
  },
  {
    id: "exp-3",
    vehicleId: "v1",
    category: "Tire",
    amount: 180,
    date: "2026-04-20",
    mileage: 178900,
    provider: "Angkor Tyres",
    paymentMethod: "Credit Card",
    notes: "Replaced 2 rear tires with high duration models."
  },
  {
    id: "exp-4",
    vehicleId: "v2",
    category: "Fuel",
    amount: 35,
    date: "2026-05-18",
    mileage: 144500,
    provider: "PTT Station Russian Blvd",
    paymentMethod: "ABA Pay",
    notes: "Regular refueling session."
  },
  {
    id: "exp-5",
    vehicleId: "v2",
    category: "Car wash",
    amount: 10,
    date: "2026-05-22",
    mileage: 144800,
    provider: "Premium Clean Koh Pich",
    paymentMethod: "Cash",
    notes: "Full body foam wash and vacuum cleaner session."
  }
];

let attachedDocuments: AttachedDocument[] = [
  {
    id: "doc-1",
    vehicleId: "v1",
    category: "Registration Card",
    title: "Tacoma Registration Card (Yellow card)",
    fileName: "v1_yellow_card_scan.pdf",
    fileSize: "1.4 MB",
    uploadDate: "2026-03-01",
    fileUrl: "#https://ais-dev-bmcn3sf45iuw4zs35drc7k-58491837947.asia-southeast1.run.app/files/yellow_card.pdf"
  },
  {
    id: "doc-2",
    vehicleId: "v1",
    category: "Insurance Document",
    title: "Forte Third-Party Comprehensive Cover",
    fileName: "forte_insurance_v1_policy.pdf",
    fileSize: "2.8 MB",
    uploadDate: "2026-03-01",
    fileUrl: "#https://ais-dev-bmcn3sf45iuw4zs35drc7k-58491837947.asia-southeast1.run.app/files/forte_policy.pdf"
  },
  {
    id: "doc-3",
    vehicleId: "v2",
    category: "Registration Card",
    title: "Prius Registration Document",
    fileName: "prius_reg_2026.pdf",
    fileSize: "1.1 MB",
    uploadDate: "2026-04-10",
    fileUrl: "#https://ais-dev-bmcn3sf45iuw4zs35drc7k-58491837947.asia-southeast1.run.app/files/prius_reg.pdf"
  }
];

let notificationLogsDatabase: NotificationLog[] = [
  {
    id: "notif-1",
    vehicleId: "v1",
    reminderId: "rem-1",
    title: "⚠️ Maintenance Overdue: Engine Oil Service",
    message: "Your Toyota Tacoma (2006) has driven 180,000 km, exceeding the 5,000 km oil change limit. Change oil immediately to prevent heat damage.",
    channel: "Push",
    status: "unread",
    sentAt: new Date(Date.now() - 3 * 3600000).toISOString() // 3 hours ago
  },
  {
    id: "notif-2",
    vehicleId: "v1",
    reminderId: "rem-2",
    title: "🔔 Upcoming Service: Front Brake Pads Inspection",
    message: "Brake fluid and pads inspection due on 2026-07-15 or at 185,000 km. Periodic diagnostics ensure safety during the heavy Cambodia monsoon season.",
    channel: "In-App",
    status: "unread",
    sentAt: new Date(Date.now() - 1 * 3600000).toISOString() // 1 hour ago
  }
];

let forumPostsDatabase: ForumPost[] = [
  {
    id: "fp-1",
    title: "Jeep 1990 cannot start - Need old mechanical specialist & parts",
    description: "My Jeep 1990 cannot start. I already went to 2 garages, but they cannot fix it. I need someone who knows old Jeep vehicles in Phnom Penh. I also need help finding spare parts (starter motor or fuel pump might be failing). Any advice?",
    vehicleBrand: "Jeep",
    vehicleModel: "Cherokee",
    vehicleYear: 1990,
    engineType: "4.0L Old AMC Engine",
    mileage: 320000,
    category: "Battery / Starting Problem",
    location: "Phnom Penh",
    urgency: "Emergency",
    photoUrl: "https://images.unsplash.com/photo-1517524008436-bbdb53c57b28?auto=format&fit=crop&q=80&w=400",
    needMechanic: true,
    needRecommendation: true,
    needSparePart: true,
    budget: "$300 - $500",
    preferredDate: "2026-06-01",
    visibility: "Public",
    status: "Open",
    authorId: "user-owner-1",
    authorName: "Yeon Pisith",
    authorRole: "Vehicle Owner",
    createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    upvotes: 14,
    comments: [
      {
        id: "fc-1-1",
        postId: "fp-1",
        authorId: "user-mech-1",
        authorName: "Sokha Mechanic",
        authorRole: "Verified Mechanic",
        authorBadge: "Old Car Specialist",
        content: "I have worked on several 1990 AMC Jeep engines. Usually, the issue with starting after sitting is either the fuel pump relay in the fuse box or the crankshaft position sensor (CPS). The CPS sensor is located on the bellhousing and often gets dirt/transmission fluid on it. I can come inspect it if you are in Phnom Penh. Let me know if you want me to bring my tools.",
        timestamp: new Date(Date.now() - 4 * 3600000).toISOString(),
        upvotes: 8,
        commentType: "Technical Solution",
        isHelpful: true
      },
      {
        id: "fc-1-2",
        postId: "fp-1",
        authorId: "user-supplier-1",
        authorName: "Kirirom Auto Parts",
        authorRole: "Spare-Part Supplier",
        authorBadge: "Verified Spare-Part Supplier",
        content: "Hello Pisith! We have a refurbished starter motor and heavy-duty fuel pump assembly compatible with Jeep Cherokee 1940-1995. Imported from USA. Price for starter motor: $110, fuel pump: $85. Both have 3 months warranty. We can deliver in Phnom Penh in 1 hour via local delivery app.",
        timestamp: new Date(Date.now() - 3.5 * 3600000).toISOString(),
        upvotes: 5,
        commentType: "Spare-part Offer",
        partName: "Refurbished Standard Jeep Starter Motor",
        partCondition: "Used",
        partCompatibility: "Cherokee 1987-1994",
        price: 110,
        deliveryTime: "1 Hour Delivery",
        warranty: "3 Months Warranty",
        supplierContact: "+855 11 999 001"
      }
    ],
    aiSuggestion: {
      suggestedTitle: "Jeep 1990 Cannot Start After Multiple Garage Diagnostic Failures",
      suggestedCategories: ["Battery / Starting Problem", "Electrical System", "Old Car Restoration"],
      possibleCauses: [
        "Ignition switch contact corrosion (AMC Jeep models common issue)",
        "Failed Crankshaft Position Sensor (CPS)",
        "Fuel pressure regulator leakage",
        "Worn starter solenoid contacts"
      ],
      suggestedChecks: [
        "Check if engine cranks when turning the key, or does it only make a hollow click?",
        "Check for spark at the spark plugs while cranking using a test bulb",
        "Verify if the fuel pump hums for 2 seconds when ignition is switched ON"
      ],
      safetyWarning: "Ensure the transmission is securely in Park/Neutral. AMC Jeep gear shifts can slip over age.",
      similarCasesFound: [
        "Settle Jeep cold-start issues by sanding diagnostic ground cables",
        "AMC Cherokee fuel pump block bypass tutorial"
      ]
    }
  },
  {
    id: "fp-2",
    title: "Prius 2010 Hybrid Battery Red Triangle Warning - Toul Kork",
    description: "My Prius 2010 Red Triangle of Death popped up on the way home to Toul Kork last night. The hybrid fan in the backseat was blowing extremely loud. Need hybrid battery cell replacement or cleaning advice.",
    vehicleBrand: "Toyota",
    vehicleModel: "Prius",
    vehicleYear: 2010,
    engineType: "1.8L Hybrid",
    mileage: 210000,
    category: "EV / Hybrid Vehicle",
    location: "Phnom Penh",
    urgency: "High",
    photoUrl: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=400",
    needMechanic: true,
    needRecommendation: true,
    needSparePart: false,
    visibility: "Public",
    status: "Solved",
    authorId: "user-owner-2",
    authorName: "Chan Rotha",
    authorRole: "Normal User",
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    upvotes: 21,
    comments: [
      {
        id: "fc-2-1",
        postId: "fp-2",
        authorId: "user-garage-1",
        authorName: "Apsara Auto Repair & Diagnostic Center",
        authorRole: "Verified Garage",
        authorBadge: "EV/Hybrid Specialist",
        content: "Hi Rotha! The loud back fan means your hybrid battery cells are overheating. This is common when dust blocks the cooling fan intake beside the backseat. We have Prius-certified scanners to isolate the faulty module cell. We charge $45 per cell replacement (OEM Grade) including hybrid copper busbar cleaning. Full pack cleaning costs $60. Bring your Prius to Boeung Keng Kang 3 for a free scan!",
        timestamp: new Date(Date.now() - 20 * 3600000).toISOString(),
        upvotes: 15,
        commentType: "Garage Recommendation",
        isHelpful: true
      }
    ],
    acceptedCommentId: "fc-2-1",
    resolvedNote: "Cleaned backseat battery cooling fan filter and replaced 2 copper cell blocks.",
    resolvedCost: 150,
    resolvedGarage: "Apsara Auto Repair & Diagnostic Center"
  }
];

let classifiedListingsDatabase: PartListing[] = [
  {
    id: "part-1",
    title: "Genuine Toyota Tacoma (2005-2015) Front Brake Rotors - Set of 2",
    description: "I sold my Tacoma 2012 last year but still have these brand new, OEM front disc brake rotors sitting in my garage. Still in original Toyota box packaging. Perfect replacement to solve brake pedal shaking or vibration during downhill braking.",
    postType: "Sell",
    category: "Brake system",
    vehicleBrand: "Toyota",
    vehicleModel: "Tacoma",
    yearRange: "2005-2015",
    engineType: "2.7L / 4.0L V6",
    partNumber: "43512-04020",
    condition: "New",
    price: 90,
    negotiable: true,
    location: "Phnom Penh",
    photos: ["https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=400"],
    videos: ["https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-mechanic-repairing-a-clutch-disc-40092-large.mp4"],
    comments: [
      {
        id: "p-comm-1",
        listingId: "part-1",
        authorName: "Chan Dara",
        content: "Will this fit the Tacoma 2015 4WD Double Cab?",
        createdAt: new Date(Date.now() - 2 * 86440000).toISOString()
      },
      {
        id: "p-comm-2",
        listingId: "part-1",
        authorName: "Sok Kheng",
        content: "Yes, verified! Here is a photo of the back side showing the exact OEM model matches on the double cab.",
        photoUrl: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=400",
        createdAt: new Date(Date.now() - 1.5 * 86440000).toISOString()
      }
    ],
    contactName: "Sok Kheng",
    contactPhone: "+855 12 555 901",
    contactTelegram: "@sokkheng_kh",
    sellerType: "Owner",
    verifiedSeller: true,
    availabilityStatus: "In Stock",
    status: "Active",
    views: 42,
    offerCount: 1,
    createdAt: new Date(Date.now() - 3.5 * 86440000).toISOString(),
    isBoosted: true,
    aiCompatibilityComment: "Fits all 4WD and PreRunner 6-Lug Toyota Tacoma models from 2005 to 2015. Guaranteed OEM spec fitment.",
    aiSuggestedPriceRange: "$80 - $110 (Highly competitive pricing)"
  },
  {
    id: "part-2",
    title: "Auxiliary High Voltage Battery Module cell for Prius 2010 - Free Donation",
    description: "Giving away this functioning Prius hybrid module cell. Replaced with a larger premium lithium stack, but this nickel-metal hydride cell still measures 7.6V on the multi-tester. Free to donate to any needy owner or student hobbyist! Toul Kork area lookup.",
    postType: "Donate",
    category: "EV battery / EV parts",
    vehicleBrand: "Toyota",
    vehicleModel: "Prius",
    yearRange: "2010-2015",
    engineType: "1.8L Hybrid",
    partNumber: "NP2-Modules",
    condition: "Used",
    price: 0,
    negotiable: false,
    donationOption: true,
    exchangeOption: true,
    exchangeDetails: "Exchange with simple gear oil bottle or socket wrench socket",
    location: "Phnom Penh",
    photos: [],
    contactName: "Nara Chhay",
    contactPhone: "+855 99 222 333",
    contactTelegram: "@nara_prius",
    sellerType: "Owner",
    verifiedSeller: false,
    availabilityStatus: "In Stock",
    status: "Active",
    views: 128,
    offerCount: 0,
    createdAt: new Date(Date.now() - 1 * 86440000).toISOString(),
    isBoosted: false,
    aiCompatibilityComment: "Matches standard cylindrical/prismatic Gen 3 module setups. Be extremely careful of high-voltage wiring during exchange.",
    aiSuggestedPriceRange: "Free Donation"
  },
  {
    id: "part-3",
    title: "Genuine Denso AC Scroll Compressor - Overstock Sale",
    description: "Apsara Garage has an overstock of sealed, high-voltage electric compressors. Crucial upgrade if your Prius air conditioner blows hot air at stoplights. High reliability, imported directly from Japan.",
    postType: "Garage Stock",
    category: "Air conditioning",
    vehicleBrand: "Toyota",
    vehicleModel: "Prius",
    yearRange: "2010-2015",
    engineType: "1.8L Hybrid",
    partNumber: "DEN-42200",
    condition: "New",
    price: 245,
    negotiable: false,
    location: "Phnom Penh (Boeung Keng Kang)",
    photos: [],
    contactName: "Apsara Parts Manager",
    contactPhone: "+855 23 888 123",
    sellerType: "Garage",
    verifiedSeller: true,
    availabilityStatus: "Low Stock",
    status: "Active",
    views: 89,
    offerCount: 0,
    createdAt: new Date(Date.now() - 5 * 86440000).toISOString(),
    isBoosted: false,
    aiCompatibilityComment: "Recommended for 1.8L gasoline/hybrid models (Toyota Prius/Lexus CT200h). Essential for warm tropical operations.",
    aiSuggestedPriceRange: "$230 - $260"
  },
  {
    id: "part-4",
    title: "Looking For: Classic 1990 Jeep Cherokee Fuel Pump Assembly",
    description: "Looking to buy or trade for a functional fuel pump for my Jeep 1990 old AMC project car. New or used, as long as pressure is solid at 39 PSI. Happy to pay up to $100 cash or exchange with other old jeep body accessories.",
    postType: "Looking for",
    category: "Classic / rare car parts",
    vehicleBrand: "Jeep",
    vehicleModel: "Cherokee",
    yearRange: "1987-1995",
    engineType: "4.0L Old AMC Engine",
    condition: "Refurbished",
    price: 100,
    negotiable: true,
    location: "Battambang",
    photos: [],
    contactName: "Yeon Pisith",
    contactPhone: "+855 12 345 678",
    sellerType: "Owner",
    verifiedSeller: false,
    availabilityStatus: "In Stock",
    status: "Active",
    views: 19,
    offerCount: 1,
    createdAt: new Date(Date.now() - 7 * 86440000).toISOString(),
    isBoosted: false,
    aiCompatibilityComment: "Make sure to request pictures of the connector block, as Jeep changed wiring configurations between the 1990 and 1991 model years.",
    aiSuggestedPriceRange: "$70 - $125"
  }
];

let partOffersDatabase: PartOffer[] = [
  {
    id: "p-offer-1",
    listingId: "part-1",
    listingTitle: "Genuine Toyota Tacoma (2005-2015) Front Brake Rotors - Set of 2",
    offerType: "Buy For Cash",
    amount: 80,
    contactName: "Heng Leak",
    contactPhone: "+855 11 999 002",
    contactTelegram: "@hengleak",
    notes: "I can meet you directly at the PTT Petrol Station Monivong Blvd for pickup this afternoon.",
    status: "Pending",
    createdAt: new Date(Date.now() - 2.5 * 3600000).toISOString()
  }
];

let partReportsDatabase: PartReport[] = [];

const garagesDatabase: GaragePartner[] = [
  {
    id: "g1",
    name: "Sokha Auto Garage",
    type: "Garage / Repair Shop",
    rating: 4.8,
    reviewsCount: 124,
    address: "#45, St 143, Boeung Keng Kang 3, Phnom Penh",
    phone: "+855 23 888 123",
    lat: 11.5512,
    lng: 104.9189,
    services: ["Engine oil change", "Brake check", "AC repair", "Diagnostic scan", "Full Inspection", "Brake Inspection"],
    imageUrl: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=400",
    description: "Premium full-service garage specializing in diagnostics, suspension repair, and fluid changes for premium trucks and family SUVs.",
    isPartner: true
  },
  {
    id: "g2",
    name: "EV & Hybrid Care Center",
    type: "Garage / Repair Shop",
    rating: 4.9,
    reviewsCount: 42,
    address: "#22, Preah Sihanouk Blvd, Tonle Bassac, Phnom Penh",
    phone: "+855 23 999 456",
    lat: 11.5592,
    lng: 104.9254,
    services: ["EV battery health scan", "AC service", "Hybrid battery scan", "Cooling system check", "Software diagnostic scan", "Brake regeneration test", "Hybrid System Inspection"],
    imageUrl: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=400",
    description: "The capital's central EV & Hybrid service center featuring state-of-the-art fast diagnostic feeds and battery diagnostics.",
    isPartner: true
  },
  {
    id: "g3",
    name: "Phnom Penh Diesel Garage",
    type: "Garage / Repair Shop",
    rating: 4.7,
    reviewsCount: 98,
    address: "#89, Cambodian Federation Blvd, Tuol Kork, Phnom Penh",
    phone: "+855 12 555 789",
    lat: 11.5678,
    lng: 104.8992,
    services: ["Diesel Engine Repair", "Tire rotation", "Wheel alignment", "Brake service", "Suspension upgrade", "Fuel injector cleaning", "Diesel filter check", "Engine noise inspection", "Exhaust smoke check"],
    imageUrl: "https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&q=80&w=400",
    description: "Specialized diesel engines maintenance clinic focusing on injectors calibration and high mileage commercial trucks.",
    isPartner: true
  },
  {
    id: "g4",
    name: "VIP Car Detail & Ceramic Coating",
    type: "Car Wash",
    rating: 4.6,
    reviewsCount: 150,
    address: "St 217 (Veng Sreng Blvd), Sen Sok, Phnom Penh",
    phone: "+855 88 777 665",
    lat: 11.5421,
    lng: 104.8698,
    services: ["Detailing wash", "Foam treatment", "Ceramic coat protection", "Interior sanitation"],
    imageUrl: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&q=80&w=400",
    description: "Full service active foam body washes, mud guard cleaning, paint corrections, and dust barrier ceramic coating.",
    isPartner: false
  },
  {
    id: "g5",
    name: "Mekong Lube, Express Oil & Petrol",
    type: "Petrol Station / Partner",
    rating: 4.5,
    reviewsCount: 80,
    address: "#102, National Road 1, Chbar Ampov, Phnom Penh",
    phone: "+855 92 444 111",
    lat: 11.5305,
    lng: 104.9525,
    services: ["Engine oil change", "Brake inspection", "Coolant top-off", "Battery change"],
    imageUrl: "https://images.unsplash.com/photo-1527018601619-a508a2be00cd?auto=format&fit=crop&q=80&w=400",
    description: "Rapid express drive-thru bay providing lubricant filter changes, battery tests and fresh air filters on the go.",
    isPartner: true
  }
];

// Lazy initialization of Gemini Client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === "MY_GEMINI_API_KEY" || key.trim() === "") {
      console.warn("GEMINI_API_KEY is not defined. Falling back to structured mock generation.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return aiClient;
}

// Helper to perform generateContent with exponential backoff retry and model failover
async function generateContentWithRetry(
  client: GoogleGenAI,
  params: any,
  maxRetries = 2
): Promise<any> {
  const requestedModel = params.model || "gemini-3.5-flash";
  const modelsToTry: string[] = [];
  
  // Set preferred priority order for the model trial list
  if (requestedModel !== "gemini-3.5-flash" && requestedModel !== "gemini-3.1-flash-lite" && requestedModel !== "gemini-flash-latest" && requestedModel !== "gemini-3.1-pro-preview") {
    modelsToTry.push(requestedModel);
  }
  
  // Always try the primary advanced models first
  modelsToTry.push("gemini-3.5-flash");
  modelsToTry.push("gemini-3.1-flash-lite");
  modelsToTry.push("gemini-flash-latest");
  modelsToTry.push("gemini-3.1-pro-preview");
  
  let lastError: any = null;
  
  for (const model of modelsToTry) {
    const currentParams = { ...params, model };
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[MyCar Care KH AI] Querying Gemini with ${model} (Attempt ${attempt + 1}/${maxRetries + 1})...`);
        const response = await client.models.generateContent(currentParams);
        if (response && response.text) {
          return response;
        }
        throw new Error("Empty response received from GenAI client");
      } catch (err: any) {
        lastError = err;
        const errMsg = err.message || (typeof err === "object" ? JSON.stringify(err) : String(err));
        const isQuotaOrLimitError = errMsg.includes("RESOURCE_EXHAUSTED") || 
                                     errMsg.includes("Quota exceeded") || 
                                     errMsg.includes("429") || 
                                     errMsg.includes("quota") ||
                                     errMsg.includes("UNAVAILABLE") ||
                                     errMsg.includes("503");
        
        if (isQuotaOrLimitError) {
          console.warn(`[MyCar Care KH AI] Quota limit or server unavailability hit on ${model}. Trying next available fallback model...`);
          break; // Break current attempt loop to try the next model
        }

        console.warn(`[MyCar Care KH AI] Attempt failed with model ${model}:`, errMsg);
        
        // If it's the last attempt of the last model, stop retrying
        if (model === modelsToTry[modelsToTry.length - 1] && attempt === maxRetries) {
          break;
        }
        
        // Backoff with jitter
        const delay = Math.min(1000 * Math.pow(2, attempt) + Math.random() * 500, 4000);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  
  if (lastError) {
    const errMsg = lastError.message || (typeof lastError === "object" ? JSON.stringify(lastError) : String(lastError));
    if (errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("429") || errMsg.includes("quota")) {
      throw new Error("Gemini API Quota/Rate Limit Exceeded (429). Successfully falling back to high-quality local simulated generators.");
    }
    if (errMsg.includes("UNAVAILABLE") || errMsg.includes("503") || errMsg.includes("demand")) {
      throw new Error("Gemini API Service Temporarily Unavailable (503). Successfully falling back to high-quality local simulated generators.");
    }
    throw new Error(`Gemini API connection error: ${errMsg}`);
  }
  throw new Error("Failed to query Gemini after model retry list exhaustion.");
}

// Function to calculate smart reminders on-the-fly for any vehicle
function calculateReminders(vehicle: VehicleProfile, records: MaintenanceRecord[]): SmartReminder[] {
  const list: SmartReminder[] = [];
  const kmNow = vehicle.mileage;
  const today = new Date();
  const fuel = (vehicle.fuelType || 'Gasoline').toLowerCase();

  // Helper to safely calculate days elapsed since a date string
  const getDaysSince = (dateStr: string | undefined): number => {
    if (!dateStr) return 999; // Default representing no service logged yet (High elapsed time)
    const past = new Date(dateStr);
    if (isNaN(past.getTime())) return 999;
    const diffMs = today.getTime() - past.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 3600 * 24));
    return diffDays >= 0 ? diffDays : 0;
  };

  // Helper to find the latest record for a service category
  const getLatestRecord = (categoryKey: string): MaintenanceRecord | undefined => {
    return records
      .filter(r => r.vehicleId === vehicle.id && r.serviceCategory.toLowerCase().includes(categoryKey.toLowerCase()))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  };

  // Rule 1: Engine Oil Service (Every 5,000 km or 3 months (90 days), whichever comes first)
  // Highly customized: Not applicable to EV/Electric vehicles.
  if (fuel !== 'ev' && fuel !== 'electric') {
    const oilRecord = getLatestRecord('oil');
    let diffOilKm = 0;
    let diffOilDays = 0;
    
    if (oilRecord) {
      diffOilKm = kmNow - oilRecord.mileage;
      diffOilDays = getDaysSince(oilRecord.date);
    } else {
      // Fallback to vehicle profile fields
      const fallbackOilKm = vehicle.lastOilChangeMileage || 0;
      diffOilKm = kmNow - fallbackOilKm;
      diffOilDays = vehicle.lastServiceDate ? getDaysSince(vehicle.lastServiceDate) : 120; // default represents overdue
    }

    if (diffOilKm >= 5000 || diffOilDays >= 90) {
      list.push({
        id: `r-oil-${vehicle.id}`,
        vehicleId: vehicle.id,
        service: "Engine Oil Service",
        status: 'Overdue',
        reason: `Your vehicle is overdue for an engine oil refresh. Hybrid interval limit triggered (${diffOilKm.toLocaleString()} km and ${diffOilDays} days elapsed vs limit of 5,000 km / 90 days, whichever comes first).`,
        action: "Schedule an urgent engine oil and filtration change at any authorized workshop in Phnom Penh.",
        priority: 'High'
      });
    } else if (diffOilKm >= 4000 || diffOilDays >= 75) {
      list.push({
        id: `r-oil-${vehicle.id}`,
        vehicleId: vehicle.id,
        service: "Engine Oil Service",
        status: 'Due soon',
        reason: `Engine oil check is due soon under the hybrid interval (${diffOilKm.toLocaleString()} km or ${diffOilDays} days elapsed of 5,000 km / 90 days limits).`,
        action: "Plan to schedule an oil service during your next weekly commute check.",
        priority: 'Medium'
      });
    } else {
      list.push({
        id: `r-oil-${vehicle.id}`,
        vehicleId: vehicle.id,
        service: "Engine Oil Service",
        status: 'Good',
        reason: `Engine lubrication remains healthy with ${diffOilKm.toLocaleString()} km and ${diffOilDays} days of service lifecycle remaining.`,
        action: "No immediate action required.",
        priority: 'Low'
      });
    }
  }

  // Rule 2: Brake Service (Every 20,000 km or 6 months (180 days), whichever comes first)
  const brakeRecord = getLatestRecord('brake');
  let diffBrakeKm = 0;
  let diffBrakeDays = 0;

  if (brakeRecord) {
    diffBrakeKm = kmNow - brakeRecord.mileage;
    diffBrakeDays = getDaysSince(brakeRecord.date);
  } else {
    diffBrakeKm = Math.min(kmNow, 22000);
    diffBrakeDays = 210;
  }

  if (diffBrakeKm >= 20000 || diffBrakeDays >= 180) {
    list.push({
      id: `r-brake-${vehicle.id}`,
      vehicleId: vehicle.id,
      service: "Brake Service",
      status: 'Overdue',
      reason: `Brake system inspection is Overdue under hybrid tracking (${diffBrakeKm.toLocaleString()} km or ${diffBrakeDays} days elapsed vs threshold of 20,000 km / 6 months, whichever comes first).`,
      action: "Arrange immediate brake pad thickness and high-hydraulic lines inspection at Angkor Tyres.",
      priority: 'High'
    });
  } else if (diffBrakeKm >= 15000 || diffBrakeDays >= 150) {
    list.push({
      id: `r-brake-${vehicle.id}`,
      vehicleId: vehicle.id,
      service: "Brake Service",
      status: 'Due soon',
      reason: `Brake rotors check is due soon under hybrid rules (${diffBrakeKm.toLocaleString()} km or ${diffBrakeDays} days elapsed).`,
      action: "Request your local mechanic to visually check caliper pads and lines during your next stop.",
      priority: 'Medium'
    });
  } else {
    list.push({
      id: `r-brake-${vehicle.id}`,
      vehicleId: vehicle.id,
      service: "Brake Service",
      status: 'Good',
      reason: `Brakes are in excellent health. Driven only ${diffBrakeKm.toLocaleString()} km / ${diffBrakeDays} days since last servicing.`,
      action: "No action required.",
      priority: 'Low'
    });
  }

  // Rule 3: Tire rotation & alignment (Every 10,000 km or 6 months (180 days), whichever comes first)
  const tireRecord = getLatestRecord('tire');
  let diffTireKm = 0;
  let diffTireDays = 0;

  if (tireRecord) {
    diffTireKm = kmNow - tireRecord.mileage;
    diffTireDays = getDaysSince(tireRecord.date);
  } else {
    diffTireKm = Math.min(kmNow, 12000);
    diffTireDays = 190;
  }

  if (diffTireKm >= 10000 || diffTireDays >= 180) {
    list.push({
      id: `r-tire-${vehicle.id}`,
      vehicleId: vehicle.id,
      service: "Tire Service",
      status: 'Overdue',
      reason: `Tyre service / wheel rotation is Overdue (${diffTireKm.toLocaleString()} km or ${diffTireDays} days elapsed vs threshold of 10,000 km / 6 months, whichever comes first).`,
      action: "Book a comprehensive tire rotation, balance, and alignment check immediately.",
      priority: 'Medium'
    });
  } else if (diffTireKm >= 8000 || diffTireDays >= 150) {
    list.push({
      id: `r-tire-${vehicle.id}`,
      vehicleId: vehicle.id,
      service: "Tire Service",
      status: 'Due soon',
      reason: `Tire inspection is due soon under hybrid metrics (${diffTireKm.toLocaleString()} km or ${diffTireDays} days elapsed).`,
      action: "Schedule a visual tire treading assessment during your next regular garage stop.",
      priority: 'Medium'
    });
  } else {
    list.push({
      id: `r-tire-${vehicle.id}`,
      vehicleId: vehicle.id,
      service: "Tire Service",
      status: 'Good',
      reason: `Tyres display standard wear patterns with ${diffTireKm.toLocaleString()} km / ${diffTireDays} days since last inspection.`,
      action: "No action required.",
      priority: 'Low'
    });
  }

  // Rule 4: EV Battery & Cooling diagnostics (EV only)
  if (fuel === 'ev' || fuel === 'electric') {
    const evRecord = getLatestRecord('ev') || getLatestRecord('battery');
    let diffEvKm = 0;
    let diffEvDays = 0;

    if (evRecord) {
      diffEvKm = kmNow - evRecord.mileage;
      diffEvDays = getDaysSince(evRecord.date);
    } else {
      diffEvKm = Math.min(kmNow, 22000);
      diffEvDays = 370;
    }

    if (diffEvKm >= 20000 || diffEvDays >= 365) {
      list.push({
        id: `r-ev-${vehicle.id}`,
        vehicleId: vehicle.id,
        service: "EV Battery Inspection",
        status: 'Overdue',
        reason: `EV battery diagnostics is Overdue under hybrid lifecycle tracking (${diffEvKm.toLocaleString()} km or ${diffEvDays} days elapsed vs limit of 20,000 km / 12 months, whichever comes first).`,
        action: "Arrange an official EV battery capacity balancing and state-of-health test log.",
        priority: 'High'
      });
    } else {
      list.push({
        id: `r-ev-${vehicle.id}`,
        vehicleId: vehicle.id,
        service: "EV Battery Inspection",
        status: 'Good',
        reason: `EV high-voltage lithium cells are operating nominally at ${diffEvKm.toLocaleString()} km / ${diffEvDays} days.`,
        action: "No immediate action required.",
        priority: 'Low'
      });
    }

    // EV Drive Unit Dielectric Coolant Flush Check
    const evCoolantRecord = getLatestRecord('coolant');
    let diffEvCoolantKm = evCoolantRecord ? (kmNow - evCoolantRecord.mileage) : kmNow;
    let diffEvCoolantDays = evCoolantRecord ? getDaysSince(evCoolantRecord.date) : 500;

    if (diffEvCoolantKm >= 80000 || diffEvCoolantDays >= 730) {
      list.push({
        id: `r-ev-coolant-${vehicle.id}`,
        vehicleId: vehicle.id,
        service: "EV Coolant Flush",
        status: 'Overdue',
        reason: `EV high-voltage power electronics dielectric coolant flush is Overdue. Highly crucial to prevent battery short-circuiting at ${diffEvCoolantKm.toLocaleString()} km or ${diffEvCoolantDays} days.`,
        action: "Book a special non-conductive battery coolant flushing appointment with certified EV mechanics.",
        priority: 'High'
      });
    } else if (diffEvCoolantKm >= 65000 || diffEvCoolantDays >= 600) {
      list.push({
        id: `r-ev-coolant-${vehicle.id}`,
        vehicleId: vehicle.id,
        service: "EV Coolant Flush",
        status: 'Due soon',
        reason: `EV drive unit cooling fluid degradation due soon (${diffEvCoolantKm.toLocaleString()} km elapsed).`,
        action: "Schedule non-conductive coolant fluid testing.",
        priority: 'Medium'
      });
    }
  }

  // Rule 5: Hybrid battery fan & cooling check (hybrid/PHEV only)
  if (fuel === 'hybrid') {
    const hybridRecord = getLatestRecord('hybrid') || getLatestRecord('battery') || getLatestRecord('fan');
    let diffHyKm = 0;
    let diffHyDays = 0;

    if (hybridRecord) {
      diffHyKm = kmNow - hybridRecord.mileage;
      diffHyDays = getDaysSince(hybridRecord.date);
    } else {
      diffHyKm = Math.min(kmNow, 16000);
      diffHyDays = 195;
    }

    if (diffHyKm >= 15000 || diffHyDays >= 180) {
      list.push({
        id: `r-hybrid-${vehicle.id}`,
        vehicleId: vehicle.id,
        service: "Hybrid System Check",
        status: 'Overdue',
        reason: `Hybrid auxiliary battery cooling fan filter maintenance is Overdue (${diffHyKm.toLocaleString()} km or ${diffHyDays} days elapsed vs limit of 15,000 km / 6 months, whichever comes first).`,
        action: "Vacuum and clean backseat hybrid battery dust filters immediately to protect cells from Cambodian heat.",
        priority: 'High'
      });
    } else if (diffHyKm >= 12000 || diffHyDays >= 150) {
      list.push({
        id: `r-hybrid-${vehicle.id}`,
        vehicleId: vehicle.id,
        service: "Hybrid System Check",
        status: 'Due soon',
        reason: `Hybrid system duct and vent servicing is due soon under cooling checks (${diffHyKm.toLocaleString()} km or ${diffHyDays} days elapsed).`,
        action: "Prepare to clear ventilation ducts during next scheduled check.",
        priority: 'Medium'
      });
    } else {
      list.push({
        id: `r-hybrid-${vehicle.id}`,
        vehicleId: vehicle.id,
        service: "Hybrid System Check",
        status: 'Good',
        reason: `Hybrid inverter loop and battery temperatures are normal. Clutter checks at ${diffHyKm.toLocaleString()} km is safe.`,
        action: "No immediate action required.",
        priority: 'Low'
      });
    }

    // Hybrid Inverter Liquid Cooling loop check
    const inverterRecord = getLatestRecord('inverter') || getLatestRecord('coolant');
    let diffInvKm = inverterRecord ? (kmNow - inverterRecord.mileage) : kmNow;
    if (diffInvKm >= 60000) {
      list.push({
        id: `r-hybrid-inverter-${vehicle.id}`,
        vehicleId: vehicle.id,
        service: "Hybrid Inverter Coolant Service",
        status: 'Overdue',
        reason: `Hybrid electric inverter cooling loop flush threshold passed (${diffInvKm.toLocaleString()} km vs limit 60,000 km).`,
        action: "Flush the isolated glycol electrical inverter system loop to protect high-voltage components.",
        priority: 'Medium'
      });
    }
  }

  // Rule 6: Spark Plugs Combustion Check (Gasoline / Petrol only)
  if (fuel === 'gasoline' || fuel === 'petrol') {
    const sparkRecord = getLatestRecord('spark') || getLatestRecord('plug');
    let diffSparkKm = sparkRecord ? (kmNow - sparkRecord.mileage) : kmNow;
    let diffSparkDays = sparkRecord ? getDaysSince(sparkRecord.date) : 400;

    if (diffSparkKm >= 40000 || diffSparkDays >= 720) {
      list.push({
        id: `r-spark-${vehicle.id}`,
        vehicleId: vehicle.id,
        service: "Spark Plugs Check",
        status: 'Overdue',
        reason: `Spark plugs & ignition system check is Overdue (${diffSparkKm.toLocaleString()} km / ${diffSparkDays} days elapsed vs limit 40,000 km). Carbon coating degrades ignition accuracy.`,
        action: "Inspect and replace standard/iridium core spark threads to prevent rough idle vibrations.",
        priority: 'Medium'
      });
    } else if (diffSparkKm >= 32000) {
      list.push({
        id: `r-spark-${vehicle.id}`,
        vehicleId: vehicle.id,
        service: "Spark Plugs Check",
        status: 'Due soon',
        reason: `Spark combustive deterioration threshold approaches soon (${diffSparkKm.toLocaleString()} km).`,
        action: "Examine spark ignition coil terminals during your next mechanic visit.",
        priority: 'Low'
      });
    }
  }

  // Rule 7: Fuel Separator & Exhaust DPF checks (Diesel only)
  if (fuel === 'diesel') {
    const dFilterRecord = getLatestRecord('fuel filter') || getLatestRecord('separator');
    let diffDFilterKm = dFilterRecord ? (kmNow - dFilterRecord.mileage) : kmNow;
    let diffDFilterDays = dFilterRecord ? getDaysSince(dFilterRecord.date) : 120;

    if (diffDFilterKm >= 15000 || diffDFilterDays >= 180) {
      list.push({
        id: `r-diesel-filter-${vehicle.id}`,
        vehicleId: vehicle.id,
        service: "Diesel Fuel Separator Check",
        status: 'Overdue',
        reason: `Primary Diesel fuel filter and moisture separation service is Overdue (${diffDFilterKm.toLocaleString()} km). Regional water content can destroy injection pumps.`,
        action: "Replace original diesel moisture separation dual-stage filter cart.",
        priority: 'High'
      });
    }

    const dpfRecord = getLatestRecord('dpf') || getLatestRecord('adblue');
    let diffDpfKm = dpfRecord ? (kmNow - dpfRecord.mileage) : kmNow;
    if (diffDpfKm >= 10000) {
      list.push({
        id: `r-diesel-dpf-${vehicle.id}`,
        vehicleId: vehicle.id,
        service: "Diesel Exhaust DPF Check",
        status: 'Overdue',
        reason: `Particulate exhaust DPF check-up limit reached (${diffDpfKm.toLocaleString()} km). Slow Phnom Phnom stop-&-go cycles trigger sludge build-up.`,
        action: "Perform a diagnostics DPF backpressure verification or long high-speed regenerative run on the highway.",
        priority: 'Medium'
      });
    }
  }

  // Rule 8: Historical Mileage Milestones: Timing Belt (>= 100,000 km)
  if (kmNow >= 100000 && fuel !== 'ev' && fuel !== 'electric') {
    const timingRecord = getLatestRecord('timing') || getLatestRecord('belt');
    let diffTimingKm = timingRecord ? (kmNow - timingRecord.mileage) : kmNow;
    
    if (diffTimingKm >= 50000) {
      list.push({
        id: `r-timing-${vehicle.id}`,
        vehicleId: vehicle.id,
        service: "High Mileage Timing Check",
        status: 'Overdue',
        reason: `High mileage timing belt/chain safety check-up triggered (${diffTimingKm.toLocaleString()} km since last timing check on high mileage threshold). Belt snapping ruins engine pistons.`,
        action: "Get of the engine timings inspection at authorized workshop.",
        priority: 'High'
      });
    } else if (diffTimingKm >= 40000) {
      list.push({
        id: `r-timing-${vehicle.id}`,
        vehicleId: vehicle.id,
        service: "High Mileage Timing Check",
        status: 'Due soon',
        reason: `Timing valve system inspection cycle approaches soon under high-wear limits.`,
        action: "Check teeth alignment during next scheduled comprehensive service.",
        priority: 'Medium'
      });
    }
  }

  // Rule 9: Transmission Fluid Flush Check (historical mileage / age check)
  if (kmNow >= 60000) {
    const transRecord = getLatestRecord('transmission') || getLatestRecord('gearbox') || getLatestRecord('fluid');
    let diffTransKm = transRecord ? (kmNow - transRecord.mileage) : kmNow;
    let diffTransDays = transRecord ? getDaysSince(transRecord.date) : 1000;

    if (diffTransKm >= 60000 || diffTransDays >= 1000) {
      list.push({
        id: `r-transmission-${vehicle.id}`,
        vehicleId: vehicle.id,
        service: "Transmission fluid check",
        status: 'Overdue',
        reason: `CVT / auto transmission gear lubricant flush is Overdue (${diffTransKm.toLocaleString()} km elapsed vs limit of 60,000 km). Extreme metal particles wear out Solenoids.`,
        action: "Schedule a high-precision automatic gearbox pressure flush & replacement oil filter gasket.",
        priority: 'Medium'
      });
    }
  }

  // Rule 10: Break-in settlement checks (Low mileage under 25k)
  if (kmNow <= 25000) {
    const breakinRecord = getLatestRecord('break-in') || getLatestRecord('settle');
    if (!breakinRecord) {
      list.push({
        id: `r-breakin-${vehicle.id}`,
        vehicleId: vehicle.id,
        service: "Break-in inspection",
        status: 'Due soon',
        reason: `Young chassis settlement checks suggested for new vehicle breaks-in ranges (${kmNow.toLocaleString()} km). Prevents loose joints.`,
        action: "Arrange a standard layout fastener tightening sweep & minor alignments check.",
        priority: 'Low'
      });
    }
  }

  return list;
}

// ----------------------------------------------------
// QR CODE & ROLE-BASED CUSTOM SHIELD DATABASES
// ----------------------------------------------------

interface GarageServiceRecord {
  id: string;
  vehicleId: string;
  vehicleLabel: string;
  ownerName: string;
  ownerPhoneRef?: string;
  serviceCategory: string;
  serviceDate: string;
  mileage: number;
  productUsed?: string;
  partsChanged?: string;
  cost: number;
  warranty?: string;
  note?: string;
  invoicePhoto?: string;
  approvalStatus: 'draft' | 'pending_owner_approval' | 'approved' | 'rejected' | 'disputed' | 'cancelled' | 'admin_locked';
  disputeReason?: string;
  source: 'owner_created' | 'garage_created' | 'admin_created' | 'partner_created' | 'ai_suggested';
  providerId: string;
  providerName: string;
  nextServiceDate?: string;
  nextServiceMileage?: number;
  suggestedNextReminderId?: string;
}

let ownerPrivacySettings = {
  showFullName: true,
  showPhone: false,
  showPlateNumber: false,
  showPreviousHistory: false,
  allowFollowUps: true,
};

let qrTokens = [
  { id: "token-user-1", token: "MCC-USER-8F92KLA", type: "user", targetId: "yeonpisith" },
  { id: "token-vehicle-1", token: "MCC-CAR-4471XDA", type: "vehicle", targetId: "v1" }
];

interface PartnerAccessRequest {
  id: string;
  vehicleId: string;
  vehicleLabel: string;
  ownerName: string;
  garageId: string;
  garageName: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface VehiclePartnerPermission {
  id: string;
  vehicleId: string;
  garageId: string;
  garageName: string;
  grantedAt: string;
  status: 'trusted' | 'one_time' | 'revoked';
}

let partnerAccessRequestsDatabase: PartnerAccessRequest[] = [
  {
    id: "req-1",
    vehicleId: "v2",
    vehicleLabel: "Toyota Prius Hybrid STech 2010",
    ownerName: "Chea Sreyneath",
    garageId: "g1",
    garageName: "Apsara Auto Repair & Diagnostic Center",
    requestedAt: new Date(Date.now() - 3600 * 1000).toISOString(),
    status: 'pending'
  }
];

let vehiclePartnerPermissionsDatabase: VehiclePartnerPermission[] = [
  {
    id: "perm-1",
    vehicleId: "v1",
    garageId: "g1",
    garageName: "Apsara Auto Repair & Diagnostic Center",
    grantedAt: new Date(Date.now() - 86400 * 1000).toISOString(),
    status: 'trusted'
  }
];

// Pre-fill public IDs and secure tokens on load for all preloaded vehicles
vehicles.forEach((car, index) => {
  if (!car.publicVehicleId) {
    const paddedIndex = String(index + 1).padStart(6, '0');
    car.publicVehicleId = `MCKH-CAR-${paddedIndex}`;
  }
  if (!car.qrSecureToken) {
    if (car.id === "v1") {
      car.qrSecureToken = "MCC-CAR-4471XDA";
    } else {
      car.qrSecureToken = `MCC-CAR-${car.id.toUpperCase()}-ST`;
    }
  }
  car.qrSecureLink = `https://ais-pre-32suu2pht5ohpxlspzepua-58491837947.asia-southeast1.run.app/vehicle-scan?token=${car.qrSecureToken}&publicId=${car.publicVehicleId}`;
  
  if (!qrTokens.some(q => q.token === car.qrSecureToken)) {
    qrTokens.push({
      id: `token-auto-${car.id}`,
      token: car.qrSecureToken,
      type: "vehicle",
      targetId: car.id
    });
  }
});

let garageServiceRecords: any[] = [
  {
    id: "gs-pending-1",
    vehicleId: "v1",
    vehicleLabel: "Toyota Tacoma 2006",
    ownerName: "Yeon Pisith",
    ownerPhoneRef: "+855 12 345 678",
    serviceCategory: "Engine Oil Service",
    serviceDate: "2026-06-01",
    mileage: 186500,
    productUsed: "Engine oil 5W-30",
    partsChanged: "Oil filter",
    cost: 48,
    warranty: "30 days parts & labor",
    note: "Customer changed engine oil, oil filter, and checked coolant level.",
    approvalStatus: "pending_owner_approval",
    source: "partner_created",
    providerId: "g1",
    providerName: "Sokha Auto Garage",
    nextServiceDate: "2026-08-15",
    nextServiceMileage: 190000,
    submittedBy: "Cashier / Service Advisor",
    paymentStatus: "Paid",
    serviceItems: ["Engine oil 5W-30", "Oil filter", "Coolant check", "General inspection"],
    photos: ["https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=400"],
    invoiceAttachment: "invoice_gs_pending_1.pdf"
  },
  {
    id: "gs-pending-2",
    vehicleId: "v1",
    vehicleLabel: "Toyota Tacoma 2006",
    ownerName: "Yeon Pisith",
    ownerPhoneRef: "+855 12 345 678",
    serviceCategory: "Brake Inspection",
    serviceDate: "2026-06-01",
    mileage: 186500,
    productUsed: "",
    partsChanged: "",
    cost: 0,
    warranty: "",
    note: "Front brake pad still usable, rear brake pad should be checked again after 3,000 km.",
    approvalStatus: "pending_owner_approval",
    source: "partner_created",
    providerId: "g1",
    providerName: "Sokha Auto Garage",
    nextServiceDate: "",
    nextServiceMileage: 0,
    submittedBy: "Mechanic",
    paymentStatus: "Included in inspection",
    serviceItems: ["Front brake inspection", "Rear brake inspection", "Brake fluid check", "Safety recommendation"],
    photos: [],
    invoiceAttachment: ""
  },
  {
    id: "gs-pending-3",
    vehicleId: "v2",
    vehicleLabel: "BYD Shark 2025",
    ownerName: "Yeon Pisith",
    ownerPhoneRef: "+855 12 345 678",
    serviceCategory: "Hybrid System Inspection",
    serviceDate: "2026-05-31",
    mileage: 12800,
    productUsed: "Cooling system check fluid",
    partsChanged: "",
    cost: 35,
    warranty: "6 months active system coverage",
    note: "Hybrid battery cooling system checked. No error code found.",
    approvalStatus: "pending_owner_approval",
    source: "partner_created",
    providerId: "g2",
    providerName: "EV & Hybrid Care Center",
    nextServiceDate: "2026-08-20",
    nextServiceMileage: 15000,
    submittedBy: "EV Technician",
    paymentStatus: "Paid",
    serviceItems: ["Hybrid battery scan", "Cooling system check", "Software diagnostic scan", "Brake regeneration test"],
    photos: ["https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=400"],
    invoiceAttachment: "diagnostic_report_byd_1.pdf"
  },
  {
    id: "gs-pending-4",
    vehicleId: "v3",
    vehicleLabel: "Hyundai Porter 2018",
    ownerName: "Yeon Pisith",
    ownerPhoneRef: "+855 12 345 678",
    serviceCategory: "Diesel Engine Repair",
    serviceDate: "2026-05-30",
    mileage: 245000,
    productUsed: "Cleaner additive",
    partsChanged: "Injector seals",
    cost: 120,
    warranty: "90 days parts & labor warranty",
    note: "Fuel injector cleaning completed. Recommend engine oil change within 1,000 km.",
    approvalStatus: "pending_owner_approval",
    source: "partner_created",
    providerId: "g3",
    providerName: "Phnom Penh Diesel Garage",
    nextServiceDate: "2026-06-25",
    nextServiceMileage: 0,
    submittedBy: "Mechanic",
    paymentStatus: "Unpaid",
    serviceItems: ["Fuel injector cleaning", "Diesel filter check", "Engine noise inspection", "Exhaust smoke check"],
    photos: ["https://images.unsplash.com/photo-1507136566006-cfc505b114fc?auto=format&fit=crop&q=80&w=400"],
    invoiceAttachment: "porter_invoice_diesel_4.pdf"
  },
  {
    id: "gs-approved-1",
    vehicleId: "v1",
    vehicleLabel: "Toyota Tacoma 2006",
    ownerName: "Yeon Pisith",
    ownerPhoneRef: "+855 12 345 678",
    serviceCategory: "AC Service",
    serviceDate: "2026-05-10",
    mileage: 182100,
    productUsed: "R134a Refrigerant Gas recharge",
    partsChanged: "Cabin Air Microfilter",
    cost: 25,
    warranty: "30 days lines leak guarantee",
    note: "A/C pressure tested healthy, cabin microfilter replaced.",
    approvalStatus: "approved",
    source: "partner_created",
    providerId: "g1",
    providerName: "Sokha Auto Garage",
    nextServiceDate: "",
    nextServiceMileage: 0,
    submittedBy: "Mechanic",
    paymentStatus: "Paid",
    serviceItems: ["A/C pressure test", "Refrigerant fluid recharge", "Cabin microfilter replace"],
    photos: [],
    invoiceAttachment: ""
  }
];

let scanLogs: any[] = [
  {
    id: "scan-1",
    token: "MCC-USER-8F92KLA",
    scannedByGarageId: "g1",
    scannedByGarageName: "Sokha Auto Garage",
    targetType: "user",
    targetId: "yeonpisith",
    scannedAt: "2026-05-28T10:14:00Z"
  }
];

let appointmentsDatabase: any[] = [
  {
    id: "app-1",
    vehicleId: "v1",
    ownerId: "yeonpisith",
    garageId: "g1",
    garageName: "Sokha Auto Garage",
    serviceType: "Engine Oil Change",
    appointmentDate: "2026-06-10",
    appointmentTime: "09:00",
    assignedMechanic: "Lead Mechanic Dara",
    estimatedCost: "$48",
    status: "Confirmed",
    note: "Primary periodic maintenance checklist inspection.",
    createdAt: new Date().toISOString()
  },
  {
    id: "app-2",
    vehicleId: "v2",
    ownerId: "yeonpisith",
    garageId: "g2",
    garageName: "EV & Hybrid Care Center",
    serviceType: "Hybrid System Inspection",
    appointmentDate: "2026-06-12",
    appointmentTime: "14:30",
    assignedMechanic: "EV Tech Norith",
    estimatedCost: "$35",
    status: "Confirmed",
    note: "Diagnostic thermal check on high voltage controller.",
    createdAt: new Date().toISOString()
  },
  {
    id: "app-3",
    vehicleId: "v3",
    ownerId: "yeonpisith",
    garageId: "g3",
    garageName: "Phnom Penh Diesel Garage",
    serviceType: "Diesel Engine Check",
    appointmentDate: "2026-06-08",
    appointmentTime: "10:30",
    assignedMechanic: "Engine Specialist Sopheap",
    estimatedCost: "$120",
    status: "Confirmed",
    note: "Fuel injection pressure line monitoring check.",
    createdAt: new Date().toISOString()
  }
];

let monthlyMaintenanceDatabase: any[] = [
  {
    id: "m-month-v1",
    vehicleId: "v1",
    ownerId: "yeonpisith",
    month: "June 2026",
    year: 2026,
    checklistItems: [
      { id: "item-1", name: "Check engine oil level", status: "Completed", checkedBy: "Owner" },
      { id: "item-2", name: "Inspect tire pressure", status: "Pending", checkedBy: "None" },
      { id: "item-3", name: "Check radiator coolant", status: "In Progress", checkedBy: "Owner" },
      { id: "item-4", name: "Inspect brake pads", status: "Pending", checkedBy: "None" }
    ],
    notes: "Performing bi-weekly level checks under heavy sun load conditions.",
    attachments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "m-month-v2",
    vehicleId: "v2",
    ownerId: "yeonpisith",
    month: "June 2026",
    year: 2026,
    checklistItems: [
      { id: "v2-item-1", name: "Verify battery charging level", status: "Completed", checkedBy: "Owner" },
      { id: "v2-item-2", name: "Clean electric ports", status: "Pending", checkedBy: "None" },
      { id: "v2-item-3", name: "Check active tires tread", status: "Pending", checkedBy: "None" }
    ],
    notes: "EV battery holds perfect state of health (98%).",
    attachments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "m-month-v3",
    vehicleId: "v3",
    ownerId: "yeonpisith",
    month: "June 2026",
    year: 2026,
    checklistItems: [
      { id: "v3-item-1", name: "Drain water separator trap", status: "Pending", checkedBy: "None" },
      { id: "v3-item-2", name: "Examine suspension leaf spring", status: "Completed", checkedBy: "Owner" },
      { id: "v3-item-3", name: "Verify auxiliary high beams", status: "Skipped", checkedBy: "Owner" }
    ],
    notes: "Leaf springs greased and tightened.",
    attachments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

let connectionsDatabase: any[] = [
  {
    id: "conn-1",
    vehicleId: "v1",
    ownerId: "yeonpisith",
    garageId: "g1",
    garageName: "Sokha Auto Garage",
    permissionLevel: "full_history",
    allowCreateLogs: true,
    allowSendAppointments: true,
    allowTelegramReminders: true,
    allowInvoiceUpload: true,
    status: "connected",
    connectedAt: "2026-05-01T08:00:00Z"
  },
  {
    id: "conn-2",
    vehicleId: "v2",
    ownerId: "yeonpisith",
    garageId: "g2",
    garageName: "EV & Hybrid Care Center",
    permissionLevel: "basic_profile",
    allowCreateLogs: true,
    allowSendAppointments: false,
    allowTelegramReminders: false,
    allowInvoiceUpload: true,
    status: "connected",
    connectedAt: "2026-05-15T10:30:00Z"
  },
  {
    id: "conn-3",
    vehicleId: "v3",
    ownerId: "yeonpisith",
    garageId: "g3",
    garageName: "Phnom Penh Diesel Garage",
    permissionLevel: "view_history",
    allowCreateLogs: true,
    allowSendAppointments: true,
    allowTelegramReminders: false,
    allowInvoiceUpload: false,
    status: "connected",
    connectedAt: "2026-05-20T14:15:00Z"
  }
];

let adminAuditLogs: any[] = [
  {
    id: "audit-1",
    adminName: "Super Admin (Sok Dara)",
    action: "Approved Partner Registration",
    details: "Approved Angkor Speed Auto Repair as a verified Garage Partner",
    target: "Chan Kiri",
    timestamp: "2026-05-29T10:00:00Z",
    ipAddress: "125.26.115.82",
    device: "MacBook Pro (Phnom Penh)"
  },
  {
    id: "audit-2",
    adminName: "Super Admin (Sok Dara)",
    action: "Configured AC Service category limit",
    details: "Updated maintenance check threshold for Aircon services to 12 months",
    target: "System Rules Engine",
    timestamp: "2026-05-30T14:22:00Z",
    ipAddress: "125.26.115.82",
    device: "MacBook Pro (Phnom Penh)"
  },
  {
    id: "audit-3",
    adminName: "Super Admin (Sok Dara)",
    action: "Reset User Password",
    details: "Issued password reset security ticket for Yeon Pisith",
    target: "Yeon Pisith",
    timestamp: "2026-05-31T09:12:00Z",
    ipAddress: "125.26.115.82",
    device: "MacBook Pro (Phnom Penh)"
  }
];

// Helper to mask sensitive dynamic values
function maskValue(val: string, mask: boolean): string {
  if (!mask || !val) return val;
  if (val.length <= 6) return "***";
  return val.slice(0, 7) + " *** *** " + val.slice(-2);
}

// ----------------------------------------------------
// REST API ENDPOINTS
// ----------------------------------------------------

// Get Privacy Settings
app.get("/api/privacy-settings", (req: Request, res: Response) => {
  res.json(ownerPrivacySettings);
});

// Update Privacy Settings
app.put("/api/privacy-settings", (req: Request, res: Response) => {
  const { showFullName, showPhone, showPlateNumber, showPreviousHistory, allowFollowUps } = req.body;
  if (showFullName !== undefined) ownerPrivacySettings.showFullName = showFullName;
  if (showPhone !== undefined) ownerPrivacySettings.showPhone = showPhone;
  if (showPlateNumber !== undefined) ownerPrivacySettings.showPlateNumber = showPlateNumber;
  if (showPreviousHistory !== undefined) ownerPrivacySettings.showPreviousHistory = showPreviousHistory;
  if (allowFollowUps !== undefined) ownerPrivacySettings.allowFollowUps = allowFollowUps;
  res.json(ownerPrivacySettings);
});

// Get owner active QR tokens
app.get("/api/qr-tokens", (req: Request, res: Response) => {
  res.json({
    privacy: ownerPrivacySettings,
    userQr: {
      token: "MCC-USER-8F92KLA",
      displayName: ownerPrivacySettings.showFullName ? "Yeon Pisith" : "Yeon P.",
      displayPhone: ownerPrivacySettings.showPhone ? "+855 12 345 678" : "+855 12 *** *78",
      displayEmail: "pisi***@gmail.com"
    },
    vehicleQr: {
      token: "MCC-CAR-4471XDA",
      vehicleId: "v1",
      vehicleLabel: "Toyota Tacoma 2006",
      plateNumber: ownerPrivacySettings.showPlateNumber ? "PP-2A-8854" : "PP-***-****"
    }
  });
});

// Scan QR Token with Zero-Trust ABAC permissions check
app.post("/api/qr/scan", (req: Request, res: Response) => {
  const { token, scannedByGarageId, scannedByGarageName } = req.body;
  if (!token) return res.status(400).json({ error: "Missing scan token" });

  const found = qrTokens.find(q => q.token === token || q.token.toLowerCase() === token.trim().toLowerCase());
  if (!found) {
    return res.status(404).json({ error: "Invalid QR scan reference. Token has expired or is unauthorized." });
  }

  // Add scan log
  const newScan = {
    id: `scan-${Date.now()}`,
    token,
    scannedByGarageId: scannedByGarageId || "guest-garage",
    scannedByGarageName: scannedByGarageName || "Unverified Service Bay",
    targetType: found.type,
    targetId: found.targetId,
    scannedAt: new Date().toISOString()
  };
  scanLogs.unshift(newScan);

  // Return masked owner profiles fitting privacy settings
  if (found.type === "user") {
    res.json({
      success: true,
      scannedType: "user",
      ownerName: ownerPrivacySettings.showFullName ? "Yeon Pisith" : "Yeon P.",
      ownerPhone: ownerPrivacySettings.showPhone ? "+855 12 345 678" : "+855 12 *** *78",
      ownerLocation: activeProfile.location,
      vehicles: vehicles.map(v => {
        const isPermitted = vehiclePartnerPermissionsDatabase.some(
          p => p.vehicleId === v.id && p.garageId === scannedByGarageId && p.status !== 'revoked'
        );
        return {
          id: v.id,
          publicVehicleId: v.publicVehicleId,
          label: `${v.brand} ${v.model} ${v.year}`,
          mileage: v.mileage,
          fuelType: v.fuelType,
          plateNumber: isPermitted && ownerPrivacySettings.showPlateNumber ? v.plateNumber : "PP-***-****",
          permissionRequired: !isPermitted,
          previousServiceHistory: isPermitted && ownerPrivacySettings.showPreviousHistory 
            ? maintenanceRecords.filter(m => m.vehicleId === v.id)
            : maintenanceRecords.filter(m => m.vehicleId === v.id && m.provider === scannedByGarageName)
        };
      })
    });
  } else {
    // vehicle scan
    const car = vehicles.find(v => v.id === found.targetId);
    if (!car) return res.status(404).json({ error: "Linked vehicle profile has been deleted." });

    // Check permission for this vehicle
    const isPermitted = vehiclePartnerPermissionsDatabase.some(
      p => p.vehicleId === car.id && p.garageId === scannedByGarageId && p.status !== 'revoked'
    );

    res.json({
      success: true,
      scannedType: "vehicle",
      vehicleId: car.id,
      publicVehicleId: car.publicVehicleId,
      brand: car.brand,
      model: car.model,
      year: car.year,
      mileage: car.mileage,
      fuelType: car.fuelType,
      engineType: car.engineType,
      plateNumber: isPermitted && ownerPrivacySettings.showPlateNumber ? car.plateNumber : "PP-***-****",
      ownerName: isPermitted && ownerPrivacySettings.showFullName ? (car.owner || "Yeon Pisith") : "Yeon P. (Shield Active)",
      ownerPhone: isPermitted && ownerPrivacySettings.showPhone ? "+855 12 345 678" : "+855 12 *** *78 (Permission Shield active)",
      permissionRequired: !isPermitted,
      previousServiceHistory: isPermitted && ownerPrivacySettings.showPreviousHistory 
        ? maintenanceRecords.filter(m => m.vehicleId === car.id)
        : maintenanceRecords.filter(m => m.vehicleId === car.id && m.provider === scannedByGarageName)
    });
  }
});

// Manual record ID / Vehicle ID lookups (Option fallback for scanners)
app.post("/api/qr/manual-lookup", (req: Request, res: Response) => {
  const { recordId, scannedByGarageId, scannedByGarageName } = req.body;
  if (!recordId) return res.status(400).json({ error: "Please insert a Record ID to query." });

  const normalized = recordId.trim().toUpperCase();
  let foundToken = "";

  // First check if it matches any vehicle public ID or database ID
  const matchedCar = vehicles.find(v => 
    v.id.toUpperCase() === normalized || 
    v.publicVehicleId?.toUpperCase() === normalized ||
    (v.publicVehicleId && v.publicVehicleId.replace(/-/g, '').toUpperCase() === normalized.replace(/-/g, ''))
  );

  if (matchedCar) {
    foundToken = matchedCar.qrSecureToken || "";
  } else if (normalized.includes("USER") || normalized === "MCC-USER-8F92KLA" || normalized === "8F92KLA") {
    foundToken = "MCC-USER-8F92KLA";
  } else if (normalized.includes("CAR") || normalized === "MCC-CAR-4471XDA" || normalized === "4471XDA") {
    foundToken = "MCC-CAR-4471XDA";
  } else {
    // Check if it matches any other token directly
    const directToken = qrTokens.find(q => q.token.toUpperCase() === normalized);
    if (directToken) {
      foundToken = directToken.token;
    } else {
      return res.status(404).json({ error: "No client data holds the queried ID in Cambodia's databases." });
    }
  }

  // Proxy to scan logic
  req.body.token = foundToken;
  const found = qrTokens.find(q => q.token === foundToken);
  if (!found) return res.status(404).json({ error: "Invalid reference." });

  const newScan = {
    id: `scan-${Date.now()}`,
    token: foundToken,
    scannedByGarageId: scannedByGarageId || "manual-entry",
    scannedByGarageName: scannedByGarageName || "Manual Input Desk",
    targetType: found.type,
    targetId: found.targetId,
    scannedAt: new Date().toISOString()
  };
  scanLogs.unshift(newScan);

  if (found.type === "user") {
    res.json({
      success: true,
      scannedType: "user",
      ownerName: ownerPrivacySettings.showFullName ? "Yeon Pisith" : "Yeon P.",
      ownerPhone: ownerPrivacySettings.showPhone ? "+855 12 345 678" : "+855 12 *** *78",
      ownerLocation: activeProfile.location,
      vehicles: vehicles.map(v => {
        const isPermitted = vehiclePartnerPermissionsDatabase.some(
          p => p.vehicleId === v.id && p.garageId === scannedByGarageId && p.status !== 'revoked'
        );
        return {
          id: v.id,
          publicVehicleId: v.publicVehicleId,
          label: `${v.brand} ${v.model} ${v.year}`,
          mileage: v.mileage,
          fuelType: v.fuelType,
          plateNumber: isPermitted && ownerPrivacySettings.showPlateNumber ? v.plateNumber : "PP-***-****",
          permissionRequired: !isPermitted,
          previousServiceHistory: isPermitted && ownerPrivacySettings.showPreviousHistory 
            ? maintenanceRecords.filter(m => m.vehicleId === v.id)
            : maintenanceRecords.filter(m => m.vehicleId === v.id && m.provider === scannedByGarageName)
        };
      })
    });
  } else {
    const car = vehicles.find(v => v.id === found.targetId);
    if (!car) return res.status(404).json({ error: "Linked vehicle profile has been deleted." });

    // Check permission for this vehicle
    const isPermitted = vehiclePartnerPermissionsDatabase.some(
      p => p.vehicleId === car.id && p.garageId === scannedByGarageId && p.status !== 'revoked'
    );

    res.json({
      success: true,
      scannedType: "vehicle",
      vehicleId: car.id,
      publicVehicleId: car.publicVehicleId,
      brand: car.brand,
      model: car.model,
      year: car.year,
      mileage: car.mileage,
      fuelType: car.fuelType,
      engineType: car.engineType,
      plateNumber: isPermitted && ownerPrivacySettings.showPlateNumber ? car.plateNumber : "PP-***-****",
      ownerName: isPermitted && ownerPrivacySettings.showFullName ? (car.owner || "Yeon Pisith") : "Yeon P. (Shield Active)",
      ownerPhone: isPermitted && ownerPrivacySettings.showPhone ? "+855 12 345 678" : "+855 12 *** *78 (Permission Shield active)",
      permissionRequired: !isPermitted,
      previousServiceHistory: isPermitted && ownerPrivacySettings.showPreviousHistory 
        ? maintenanceRecords.filter(m => m.vehicleId === car.id)
        : maintenanceRecords.filter(m => m.vehicleId === car.id && m.provider === scannedByGarageName)
    });
  }
});

// GET owner partner requests
app.get("/api/owner/partner-requests", (req: Request, res: Response) => {
  res.json(partnerAccessRequestsDatabase);
});

// Approve partner access request
app.post("/api/owner/partner-requests/:id/approve", (req: Request, res: Response) => {
  const { id } = req.params;
  const { statusType } = req.body; // 'trusted' or 'one_time'
  const foundReq = partnerAccessRequestsDatabase.find(r => r.id === id);
  if (!foundReq) return res.status(404).json({ error: "Access request not found." });

  foundReq.status = 'approved';

  // Add permission
  const permId = `perm-${Date.now()}`;
  vehiclePartnerPermissionsDatabase.push({
    id: permId,
    vehicleId: foundReq.vehicleId,
    garageId: foundReq.garageId,
    garageName: foundReq.garageName,
    grantedAt: new Date().toISOString(),
    status: statusType === 'one_time' ? 'one_time' : 'trusted'
  });

  // Log notification log
  notificationLogsDatabase.unshift({
    id: `notif-appr-${Date.now()}`,
    vehicleId: foundReq.vehicleId,
    title: `✅ Partner Portal Approved`,
    message: `You granted active access permissions to ${foundReq.garageName} to view diagnostic telemetry & submit logs.`,
    channel: 'In-App',
    status: 'unread',
    sentAt: new Date().toISOString()
  });

  res.json({ success: true, request: foundReq });
});

// Reject partner access request
app.post("/api/owner/partner-requests/:id/reject", (req: Request, res: Response) => {
  const { id } = req.params;
  const foundReq = partnerAccessRequestsDatabase.find(r => r.id === id);
  if (!foundReq) return res.status(404).json({ error: "Access request not found." });

  foundReq.status = 'rejected';
  res.json({ success: true, request: foundReq });
});

// GET owner active authorized partners
app.get("/api/owner/partner-permissions", (req: Request, res: Response) => {
  res.json(vehiclePartnerPermissionsDatabase.filter(p => p.status !== 'revoked'));
});

// Revoke partner access
app.post("/api/owner/partner-permissions/:id/revoke", (req: Request, res: Response) => {
  const { id } = req.params;
  const foundPerm = vehiclePartnerPermissionsDatabase.find(p => p.id === id);
  if (!foundPerm) return res.status(404).json({ error: "Authorized partner profile not found." });

  foundPerm.status = 'revoked';

  // Log notification
  notificationLogsDatabase.unshift({
    id: `notif-revk-${Date.now()}`,
    vehicleId: foundPerm.vehicleId,
    title: `🔒 Partner Access Revoked`,
    message: `You successfully revoked access privileges for ${foundPerm.garageName}. They can no longer inspect vehicle service maps.`,
    channel: 'In-App',
    status: 'unread',
    sentAt: new Date().toISOString()
  });

  res.json({ success: true, permission: foundPerm });
});

// Garage requests portal access to a vehicle
app.post("/api/garage/request-access", (req: Request, res: Response) => {
  const { vehicleId, garageId, garageName } = req.body;
  if (!vehicleId || !garageId) {
    return res.status(400).json({ error: "Missing scanner data parameters." });
  }

  const car = vehicles.find(v => v.id === vehicleId);
  if (!car) return res.status(404).json({ error: "Vehicle not found." });

  // Check if already pending or has permission
  const existingReq = partnerAccessRequestsDatabase.find(
    r => r.vehicleId === vehicleId && r.garageId === garageId && r.status === 'pending'
  );
  if (existingReq) {
    return res.json({ success: true, message: "Request is already pending owner verification.", request: existingReq });
  }

  const reqId = `req-${Date.now()}`;
  const newReq: PartnerAccessRequest = {
    id: reqId,
    vehicleId,
    vehicleLabel: `${car.brand} ${car.model} ${car.year}`,
    ownerName: car.owner || "Yeon Pisith",
    garageId,
    garageName: garageName || "Technician Station",
    requestedAt: new Date().toISOString(),
    status: 'pending'
  };

  partnerAccessRequestsDatabase.unshift(newReq);

  // Send owner in-app notification
  notificationLogsDatabase.unshift({
    id: `notif-req-${Date.now()}`,
    vehicleId,
    title: `🔑 Portal Access Request`,
    message: `${newReq.garageName} has scanned your QR Code and requested secure permission to attach service logs for your ${newReq.vehicleLabel}.`,
    channel: 'In-App',
    status: 'unread',
    sentAt: new Date().toISOString()
  });

  res.json({ success: true, message: "Access request successfully submitted to the customer's mobile device.", request: newReq });
});

// Owner regenerates vehicle QR Token (Refreshable & Revocable security)
app.post("/api/vehicles/regenerate-qr/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const car = vehicles.find(v => v.id === id);
  if (!car) return res.status(404).json({ error: "Vehicle not found." });

  const oldToken = car.qrSecureToken;
  const newToken = `MCC-CAR-${car.id.toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-ST`;

  car.qrSecureToken = newToken;
  car.qrSecureLink = `https://ais-pre-32suu2pht5ohpxlspzepua-58491837947.asia-southeast1.run.app/vehicle-scan?token=${newToken}&publicId=${car.publicVehicleId}`;

  // Revoke old in qrTokens and add new
  qrTokens = qrTokens.filter(q => q.token !== oldToken);
  qrTokens.push({
    id: `token-auto-${car.id}`,
    token: newToken,
    type: "vehicle",
    targetId: car.id
  });

  res.json({ success: true, newToken, newLink: car.qrSecureLink });
});

// Fetch QR scan history logs for a specific vehicle
app.get("/api/vehicles/:id/scan-logs", (req: Request, res: Response) => {
  const { id } = req.params;
  const car = vehicles.find(v => v.id === id);
  if (!car) return res.status(404).json({ error: "Vehicle not found." });

  const records = scanLogs.filter(log => {
    return (log.targetType === "vehicle" && log.targetId === car.id) ||
           (log.token && (log.token === car.qrSecureToken || log.token === `MCC-CAR-${car.id.toUpperCase()}`));
  });

  res.json(records);
});

// Garage creates a service record in draft or pending mode
app.post("/api/garage/service-records", (req: Request, res: Response) => {
  const { 
    vehicleId, 
    vehicleLabel, 
    serviceCategory, 
    serviceDate, 
    mileage, 
    cost, 
    productUsed, 
    partsChanged, 
    warranty, 
    note, 
    providerId, 
    providerName,
    nextServiceDate,
    nextServiceMileage,
    partsCost,
    laborCost,
    discount,
    paymentStatus,
    technicianName,
    internalNotes,
    customerNotes,
    photos,
    invoiceAttachment
  } = req.body;

  if (!vehicleId || !serviceCategory || !mileage || !cost || !providerId) {
    return res.status(400).json({ error: "Required service inputs or partner credentials missed." });
  }

  const recordId = `gs-${Date.now()}`;
  const newRecord: GarageServiceRecord & {
    partsCost?: number;
    laborCost?: number;
    discount?: number;
    paymentStatus?: string;
    technicianName?: string;
    internalNotes?: string;
    customerNotes?: string;
    photos?: string[];
    invoiceAttachment?: string;
  } = {
    id: recordId,
    vehicleId,
    vehicleLabel: vehicleLabel || "Toyota Tacoma 2006",
    ownerName: "Yeon Pisith",
    ownerPhoneRef: ownerPrivacySettings.showPhone ? "+855 12 345 678" : "+855 12 *** *78",
    serviceCategory,
    serviceDate: serviceDate || new Date().toISOString().split('T')[0],
    mileage: Number(mileage),
    cost: Number(cost),
    productUsed: productUsed || "",
    partsChanged: partsChanged || "",
    warranty: warranty || "",
    note: note || "",
    approvalStatus: 'pending_owner_approval',
    source: providerId === 'g5' ? 'partner_created' : 'garage_created',
    providerId,
    providerName,
    nextServiceDate: nextServiceDate || "",
    nextServiceMileage: nextServiceMileage ? Number(nextServiceMileage) : 0,
    // Expanded Maintenance Log Ticket fields (Requirement 6)
    partsCost: partsCost ? Number(partsCost) : Number(cost),
    laborCost: laborCost ? Number(laborCost) : 0,
    discount: discount ? Number(discount) : 0,
    paymentStatus: paymentStatus || 'Paid',
    technicianName: technicianName || 'Lead Mechanic',
    internalNotes: internalNotes || "",
    customerNotes: customerNotes || "",
    photos: photos || [],
    invoiceAttachment: invoiceAttachment || ""
  };

  garageServiceRecords.unshift(newRecord);

  // Trigger floating push log
  notificationLogsDatabase.unshift({
    id: `notif-gs-${Date.now()}`,
    vehicleId,
    title: `🔧 Service Approval Requested`,
    message: `${providerName} uploaded an official service record for your ${newRecord.vehicleLabel}. Review and accept to log it in history.`,
    channel: 'In-App',
    status: 'unread',
    sentAt: new Date().toISOString()
  });

  res.json({ success: true, record: newRecord });
});

// Get owner service approval queue
app.get("/api/owner/pending-records", (req: Request, res: Response) => {
  res.json(garageServiceRecords);
});

// App owner accepts record
app.post("/api/owner/service-records/:id/approve", (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = garageServiceRecords.findIndex(r => r.id === id);
  if (idx === -1) return res.status(404).json({ error: "Record references can no longer be loaded." });

  const record = garageServiceRecords[idx];
  record.approvalStatus = 'approved';

  // Core integration: Convert this record to an official MaintenanceRecord
  const officialRecord: MaintenanceRecord = {
    id: `m-gs-${Date.now()}`,
    vehicleId: record.vehicleId,
    serviceCategory: record.serviceCategory,
    description: `${record.productUsed ? 'Product: ' + record.productUsed + '; ' : ''}${record.partsChanged ? 'Parts: ' + record.partsChanged + '; ' : ''}${record.note || 'Garage uploaded logs approved by owner.'}`,
    cost: record.cost,
    mileage: record.mileage,
    date: record.serviceDate,
    provider: record.providerName
  };
  maintenanceRecords.push(officialRecord);

  // Update vehicle health status parameters
  const carIdx = vehicles.findIndex(v => v.id === record.vehicleId);
  if (carIdx > -1) {
    if (record.mileage > vehicles[carIdx].mileage) {
      vehicles[carIdx].mileage = record.mileage;
    }
    if (record.serviceCategory === "Engine Oil Service") {
      vehicles[carIdx].lastOilChangeMileage = record.mileage;
    }
    vehicles[carIdx].lastServiceDate = record.serviceDate;
  }

  // Create proposed follow-up smart reminder if defined
  if (record.nextServiceDate || record.nextServiceMileage) {
    const remId = `rem-gs-${Date.now()}`;
    const newRem: SmartReminder = {
      id: remId,
      vehicleId: record.vehicleId,
      service: record.serviceCategory,
      title: `${record.serviceCategory} Overdue Reminder`,
      category: record.serviceCategory,
      reminderType: (record.nextServiceDate && record.nextServiceMileage) ? 'date_and_mileage' : record.nextServiceMileage ? 'mileage_based' : 'date_based',
      status: 'Good',
      reason: `Suggested by ${record.providerName} following the check-up on ${record.serviceDate}.`,
      action: `Visit ${record.providerName} or any trusted service partner.`,
      priority: 'Medium',
      dueDate: record.nextServiceDate || undefined,
      dueMileage: record.nextServiceMileage || undefined,
      isAiSuggested: false,
      createdAt: new Date().toISOString()
    };
    remindersDatabase.push(newRem);
    record.suggestedNextReminderId = remId;
  }

  // Add confirmation log
  notificationLogsDatabase.unshift({
    id: `notif-approved-${Date.now()}`,
    vehicleId: record.vehicleId,
    title: `✅ Service Record Saved`,
    message: `${record.serviceCategory} at ${record.providerName} has been officially approved and added to your Tacoma's historical logs.`,
    channel: 'In-App',
    status: 'unread',
    sentAt: new Date().toISOString()
  });

  res.json({ success: true, record });
});

// App owner rejects incorrect record
app.post("/api/owner/service-records/:id/reject", (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = garageServiceRecords.findIndex(r => r.id === id);
  if (idx === -1) return res.status(404).json({ error: "Record not found." });

  garageServiceRecords[idx].approvalStatus = 'rejected';
  res.json({ success: true, record: garageServiceRecords[idx] });
});

// App owner disputes a claim (e.g. wrong parts listed or discrepancy in values)
app.post("/api/owner/service-records/:id/dispute", (req: Request, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body;
  const idx = garageServiceRecords.findIndex(r => r.id === id);
  if (idx === -1) return res.status(404).json({ error: "Record not found." });

  garageServiceRecords[idx].approvalStatus = 'disputed';
  garageServiceRecords[idx].disputeReason = reason || "Unspecified issue with invoice or parts description.";
  res.json({ success: true, record: garageServiceRecords[idx] });
});

// App owner requests correction on a pending service record
app.post("/api/owner/service-records/:id/request-correction", (req: Request, res: Response) => {
  const { id } = req.params;
  const { notes } = req.body;
  const idx = garageServiceRecords.findIndex(r => r.id === id);
  if (idx === -1) return res.status(404).json({ error: "Record not found." });

  garageServiceRecords[idx].approvalStatus = 'correction_requested';
  garageServiceRecords[idx].correctionNote = notes || "Correction requested by owner.";
  
  // Trigger notification
  notificationLogsDatabase.unshift({
    id: `notif-correction-${Date.now()}`,
    vehicleId: garageServiceRecords[idx].vehicleId,
    title: `⚠️ Correction Requested`,
    message: `You requested corrections for the service at ${garageServiceRecords[idx].providerName}: "${notes}"`,
    channel: 'In-App',
    status: 'unread',
    sentAt: new Date().toISOString()
  });

  res.json({ success: true, record: garageServiceRecords[idx] });
});

// GET all appointments
app.get("/api/owner/appointments", (req: Request, res: Response) => {
  res.json(appointmentsDatabase);
});

// POST new appointment (by owner or garage)
app.post("/api/owner/appointments", (req: Request, res: Response) => {
  const { vehicleId, garageId, garageName, serviceType, appointmentDate, appointmentTime, note } = req.body;
  if (!vehicleId || !garageName || !appointmentDate || !appointmentTime) {
    return res.status(400).json({ error: "Missing required appointment fields" });
  }

  const newApp = {
    id: `app-${Date.now()}`,
    vehicleId,
    ownerId: "yeonpisith",
    garageId: garageId || "g1",
    garageName,
    serviceType,
    appointmentDate,
    appointmentTime,
    status: "Requested",
    note: note || "",
    createdAt: new Date().toISOString()
  };

  appointmentsDatabase.unshift(newApp);

  // Trigger floating notifications
  notificationLogsDatabase.unshift({
    id: `notif-app-${Date.now()}`,
    vehicleId,
    title: `📅 Appointment Booked`,
    message: `Your appointment for ${serviceType} at ${garageName} is requested for ${appointmentDate} at ${appointmentTime}.`,
    channel: 'In-App',
    status: 'unread',
    sentAt: new Date().toISOString()
  });

  res.json(newApp);
});

// PUT update appointment
app.put("/api/owner/appointments/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = appointmentsDatabase.findIndex(a => a.id === id);
  if (idx === -1) return res.status(404).json({ error: "Appointment not found." });

  const updated = { ...appointmentsDatabase[idx], ...req.body };
  appointmentsDatabase[idx] = updated;
  res.json(updated);
});

// DELETE/Cancel appointment
app.delete("/api/owner/appointments/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  appointmentsDatabase = appointmentsDatabase.filter(a => a.id !== id);
  res.json({ success: true });
});

// GET monthly checklists
app.get("/api/owner/monthly-maintenance", (req: Request, res: Response) => {
  res.json(monthlyMaintenanceDatabase);
});

// POST new monthly checklist
app.post("/api/owner/monthly-maintenance", (req: Request, res: Response) => {
  const { vehicleId, month, year, checklistItems, notes } = req.body;
  const newChecklist = {
    id: `m-month-${Date.now()}`,
    vehicleId,
    ownerId: "yeonpisith",
    month: month || "June 2026",
    year: Number(year) || 2026,
    checklistItems: checklistItems || [],
    notes: notes || "",
    attachments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  monthlyMaintenanceDatabase.unshift(newChecklist);
  res.json(newChecklist);
});

// PUT update monthly checklist
app.put("/api/owner/monthly-maintenance/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = monthlyMaintenanceDatabase.findIndex(m => m.id === id);
  if (idx === -1) return res.status(404).json({ error: "Monthly checklist not found." });

  monthlyMaintenanceDatabase[idx] = {
    ...monthlyMaintenanceDatabase[idx],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  res.json(monthlyMaintenanceDatabase[idx]);
});

// Toggle a specific item inside monthly checklist
app.post("/api/owner/monthly-maintenance/:id/toggle-item", (req: Request, res: Response) => {
  const { id } = req.params;
  const { itemId, status, checkedBy } = req.body;
  const idx = monthlyMaintenanceDatabase.findIndex(m => m.id === id);
  if (idx === -1) return res.status(404).json({ error: "Monthly checklist not found." });

  const checklist = monthlyMaintenanceDatabase[idx];
  const itemIdx = checklist.checklistItems.findIndex((it: any) => it.id === itemId);
  if (itemIdx > -1) {
    checklist.checklistItems[itemIdx].status = status;
    checklist.checklistItems[itemIdx].checkedBy = checkedBy;
    checklist.updatedAt = new Date().toISOString();
  }
  res.json(checklist);
});

// GET all connections
app.get("/api/owner/garage-connections", (req: Request, res: Response) => {
  res.json(connectionsDatabase);
});

// POST create connection
app.post("/api/owner/garage-connections", (req: Request, res: Response) => {
  const { vehicleId, garageId, garageName, permissionLevel, allowCreateLogs, allowSendAppointments, allowTelegramReminders, allowInvoiceUpload } = req.body;
  const newConn = {
    id: `conn-${Date.now()}`,
    vehicleId,
    ownerId: "yeonpisith",
    garageId,
    garageName,
    permissionLevel: permissionLevel || "basic_profile",
    allowCreateLogs: allowCreateLogs !== undefined ? allowCreateLogs : true,
    allowSendAppointments: allowSendAppointments !== undefined ? allowSendAppointments : true,
    allowTelegramReminders: allowTelegramReminders !== undefined ? allowTelegramReminders : false,
    allowInvoiceUpload: allowInvoiceUpload !== undefined ? allowInvoiceUpload : true,
    status: "connected",
    connectedAt: new Date().toISOString()
  };
  connectionsDatabase.unshift(newConn);
  res.json(newConn);
});

// PUT update connection permission setting
app.put("/api/owner/garage-connections/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = connectionsDatabase.findIndex(c => c.id === id);
  if (idx === -1) return res.status(404).json({ error: "Connection references can no longer be loaded." });

  connectionsDatabase[idx] = {
    ...connectionsDatabase[idx],
    ...req.body
  };
  res.json(connectionsDatabase[idx]);
});

// DELETE remove garage connection
app.delete("/api/owner/garage-connections/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  connectionsDatabase = connectionsDatabase.filter(c => c.id !== id);
  res.json({ success: true });
});

// Admin listings of audit parameters
app.get("/api/admin/scan-logs", (req: Request, res: Response) => {
  res.json(scanLogs);
});

app.get("/api/admin/all-service-records", (req: Request, res: Response) => {
  res.json(garageServiceRecords);
});

app.post("/api/admin/service-records/:id/lock", (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = garageServiceRecords.findIndex(r => r.id === id);
  if (idx === -1) return res.status(404).json({ error: "Record not found." });

  garageServiceRecords[idx].approvalStatus = 'admin_locked';
  res.json({ success: true, record: garageServiceRecords[idx] });
});

// Garage triggers dynamic follow up warning
app.post("/api/garage/follow-up", (req: Request, res: Response) => {
  const { vehicleId, customerName, serviceCategory, garageName } = req.body;
  if (!vehicleId) return res.status(400).json({ error: "Missing Target vehicle identity." });

  notificationLogsDatabase.unshift({
    id: `notif-followup-${Date.now()}`,
    vehicleId,
    title: `🔔 Follow-Up Alert from ${garageName || 'Apsara Auto'}`,
    message: `Hello ${customerName || 'Yeon'}, your ${serviceCategory || 'Engine Oil Change'} service timeline is approaching its end. Protect your vehicle by requesting an active booking today!`,
    channel: 'In-App',
    status: 'unread',
    sentAt: new Date().toISOString()
  });

  res.json({ success: true });
});

// Get User Profile
app.get("/api/profile", async (req: Request, res: Response) => {
  try {
    const email = activeProfile?.email || "pisith.yeen@gmail.com";
    const dbUser = await getUserByEmail(email);
    if (dbUser) {
      activeProfile = {
        ...activeProfile,
        id: dbUser.id,
        uid: dbUser.uid,
        name: dbUser.name,
        email: dbUser.email,
        phone: dbUser.phone || '',
        role: dbUser.role as any,
        location: dbUser.location || 'Phnom Penh',
        status: dbUser.status as any,
        businessName: dbUser.businessName || undefined,
        licenseNumber: dbUser.licenseNumber || undefined,
      };
    }
  } catch (err) {
    console.error("Fallback lookup for profile:", err);
  }
  res.json(activeProfile);
});

// Update User Profile / Onboard / Switch Login
app.put("/api/profile", async (req: Request, res: Response) => {
  const { name, email, phone, role, location, businessName, licenseNumber, status, activatedModules, isMultiService } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required" });
  }

  try {
    const defaultStatus = (role === "Vehicle Owner" || role === "Admin") ? "Approved" : "Pending";
    const dbUser = await upsertUserProfile({
      name,
      email,
      phone,
      role,
      location,
      businessName,
      licenseNumber,
      status: status || defaultStatus
    });

    if (dbUser) {
      activeProfile = {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        phone: dbUser.phone || '',
        role: dbUser.role as any,
        location: dbUser.location || 'Phnom Penh',
        status: dbUser.status as any,
        businessName: dbUser.businessName || undefined,
        licenseNumber: dbUser.licenseNumber || undefined,
        activatedModules: activatedModules || undefined,
        isMultiService: isMultiService || undefined
      };
    }
    res.json(activeProfile);
  } catch (err) {
    console.error("Error updates profile in Cloud SQL:", err);
    res.status(500).json({ error: "Cloud SQL sync fail" });
  }
});

// Admin: retrieve list of all registered sandbox users
app.get("/api/admin/users", (req: Request, res: Response) => {
  res.json(simulatedUsersDatabase);
});

// Admin: adjust status of business partners
app.post("/api/admin/users/:id/status", (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !['Pending', 'Approved', 'Suspended'].includes(status)) {
    return res.status(400).json({ error: "Status must be Pending, Approved, or Suspended" });
  }

  const userIdx = simulatedUsersDatabase.findIndex(u => u.id === Number(id));
  if (userIdx === -1) {
    return res.status(404).json({ error: "Simulated partner user not found" });
  }

  const oldStatus = simulatedUsersDatabase[userIdx].status || "Pending";
  simulatedUsersDatabase[userIdx].status = status;

  // Sync if current active persona
  if (activeProfile.id === Number(id)) {
    activeProfile.status = status;
  }

  // Create an automatic audit log
  adminAuditLogs.unshift({
    id: `audit-${Date.now()}`,
    adminName: "Super Admin (Sok Dara)",
    action: "Updated Account Status",
    details: `Changed account status for ${simulatedUsersDatabase[userIdx].name} (${simulatedUsersDatabase[userIdx].role}) from "${oldStatus}" to "${status}"`,
    target: simulatedUsersDatabase[userIdx].name,
    timestamp: new Date().toISOString(),
    ipAddress: "125.26.115.82",
    device: "MacBook Pro (Phnom Penh)"
  });

  res.json({ success: true, user: simulatedUsersDatabase[userIdx] });
});

// Admin: full user profile updates
app.put("/api/admin/users/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, phone, role, location, status, businessName, licenseNumber } = req.body;

  const idx = simulatedUsersDatabase.findIndex(u => u.id === Number(id));
  if (idx === -1) {
    return res.status(404).json({ error: "User accounts profile not found" });
  }

  const oldUser = { ...simulatedUsersDatabase[idx] };
  simulatedUsersDatabase[idx] = {
    ...simulatedUsersDatabase[idx],
    name: name || oldUser.name,
    email: email || oldUser.email,
    phone: phone || oldUser.phone,
    role: role || oldUser.role,
    location: location || oldUser.location,
    status: status || oldUser.status,
    businessName: businessName !== undefined ? businessName : oldUser.businessName,
    licenseNumber: licenseNumber !== undefined ? licenseNumber : oldUser.licenseNumber
  };

  // Sync active persona
  if (activeProfile.id === Number(id)) {
    activeProfile = simulatedUsersDatabase[idx];
  }

  adminAuditLogs.unshift({
    id: `audit-${Date.now()}`,
    adminName: "Super Admin (Sok Dara)",
    action: "Updated User Profile Metadata",
    details: `Modified profile details for account ${simulatedUsersDatabase[idx].name}. Fields adjusted on Super Admin command.`,
    target: simulatedUsersDatabase[idx].name,
    timestamp: new Date().toISOString(),
    ipAddress: "125.26.115.82",
    device: "MacBook Pro (Phnom Penh)"
  });

  res.json({ success: true, user: simulatedUsersDatabase[idx] });
});

// Admin: delete user accounts from standard database
app.delete("/api/admin/users/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = simulatedUsersDatabase.findIndex(u => u.id === Number(id));
  if (idx === -1) {
    return res.status(404).json({ error: "User not found" });
  }

  const deletedUser = simulatedUsersDatabase[idx];
  simulatedUsersDatabase.splice(idx, 1);

  adminAuditLogs.unshift({
    id: `audit-${Date.now()}`,
    adminName: "Super Admin (Sok Dara)",
    action: "Terminated Account",
    details: `Revoked and deleted platform credentials of ${deletedUser.name} (${deletedUser.role})`,
    target: deletedUser.name,
    timestamp: new Date().toISOString(),
    ipAddress: "125.26.115.82",
    device: "MacBook Pro (Phnom Penh)"
  });

  res.json({ success: true });
});

// Admin: reset credentials simulated ticket
app.post("/api/admin/users/:id/reset-password", (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = simulatedUsersDatabase.findIndex(u => u.id === Number(id));
  if (idx === -1) {
    return res.status(404).json({ error: "User not found" });
  }

  const targetUser = simulatedUsersDatabase[idx];
  adminAuditLogs.unshift({
    id: `audit-${Date.now()}`,
    adminName: "Super Admin (Sok Dara)",
    action: "Credential Reset Ticket",
    details: `Initiated security master key override and reset password token for user ${targetUser.name}`,
    target: targetUser.name,
    timestamp: new Date().toISOString(),
    ipAddress: "125.26.115.82",
    device: "MacBook Pro (Phnom Penh)"
  });

  res.json({ success: true, resetToken: `reset-${Math.floor(100000 + Math.random() * 900000)}` });
});

// Admin: send direct message notification log input
app.post("/api/admin/users/:id/send-notif", (req: Request, res: Response) => {
  const { id } = req.params;
  const { message, channel } = req.body;
  const user = simulatedUsersDatabase.find(u => u.id === Number(id));
  if (!user) {
    return res.status(404).json({ error: "Target user not found" });
  }

  // Inject in-app notification logs
  notificationLogsDatabase.unshift({
    id: `mcc-notif-${Date.now()}`,
    title: "📢 Official Channel Communication from Head Office",
    message: message || "General administrative update regarding your MyCar Care account parameters.",
    channel: channel || "In-App",
    status: "unread",
    sentAt: new Date().toISOString()
  });

  adminAuditLogs.unshift({
    id: `audit-${Date.now()}`,
    adminName: "Super Admin (Sok Dara)",
    action: "Issued Direct Dispatch",
    details: `Sent custom administrator alert message to user ${user.name} via target channel: ${channel || 'In-App'}.`,
    target: user.name,
    timestamp: new Date().toISOString(),
    ipAddress: "125.26.115.82",
    device: "MacBook Pro (Phnom Penh)"
  });

  res.json({ success: true });
});

// Admin: fetch administrative activity logs
app.get("/api/admin/audit-logs", (req: Request, res: Response) => {
  res.json(adminAuditLogs);
});

// Admin: write a specific administrative audit event
app.post("/api/admin/audit-logs", (req: Request, res: Response) => {
  const { action, details, target } = req.body;
  const log = {
    id: `audit-${Date.now()}`,
    adminName: "Super Admin (Sok Dara)",
    action: action || "Custom Command",
    details: details || "Admin executed specialized diagnostic on sandbox console",
    target: target || "System Core",
    timestamp: new Date().toISOString(),
    ipAddress: "125.26.115.82",
    device: "MacBook Pro (Phnom Penh)"
  };
  adminAuditLogs.unshift(log);
  res.json(log);
});

// Admin: transfer vehicle ownership across platform users
app.post("/api/admin/transfer-vehicle", (req: Request, res: Response) => {
  const { vehicleId, fromUserId, toUserId, reason } = req.body;
  
  const fromUser = simulatedUsersDatabase.find(u => u.id === Number(fromUserId));
  const toUser = simulatedUsersDatabase.find(u => u.id === Number(toUserId));
  const targetVehicle = vehicles.find(v => v.id === vehicleId);

  if (!toUser) {
    return res.status(442).json({ error: "Destination recipient user does not exist on platform." });
  }
  if (!targetVehicle) {
    return res.status(404).json({ error: "Vehicle registry card not found on database." });
  }

  const prevOwnerName = fromUser ? fromUser.name : "System (Unassigned)";
  const vehicleLabelName = `${targetVehicle.brand} ${targetVehicle.model} [${targetVehicle.plateNumber || targetVehicle.year}]`;

  // We change details in service records which mention vehicle owner dynamically
  garageServiceRecords.forEach(rec => {
    if (rec.vehicleLabel === vehicleLabelName || rec.vehicleLabel.includes(targetVehicle.brand)) {
      rec.ownerName = toUser.name;
    }
  });

  adminAuditLogs.unshift({
    id: `audit-${Date.now()}`,
    adminName: "Super Admin (Sok Dara)",
    action: "Ownership Transfer",
    details: `Transferred asset registration of ${vehicleLabelName} from current holder (${prevOwnerName}) to destination assignee (${toUser.name}). Reason: ${reason || "Normal sale transaction transfer"}`,
    target: vehicleLabelName,
    timestamp: new Date().toISOString(),
    ipAddress: "125.26.115.82",
    device: "MacBook Pro (Phnom Penh)"
  });

  res.json({ success: true, from: prevOwnerName, to: toUser.name });
});

// Get all vehicles
app.get("/api/vehicles", async (req: Request, res: Response) => {
  try {
    const list = await getAllVehicles();
    if (list && list.length > 0) {
      const formattedList = list.map(v => {
        const matchingMem = vehicles.find(m => m.id === v.id);
        return {
          ...matchingMem,
          id: v.id,
          brand: v.brand,
          model: v.model,
          year: v.year,
          mileage: v.mileage,
          fuelType: v.fuelType as any,
          plateNumber: v.plateNumber || '',
          chassisNumber: v.chassisNumber || '',
          notes: v.notes || '',
          engineType: v.engineType || '',
          owner: matchingMem?.owner || activeProfile?.name || 'Yeon Pisith',
          transmission: v.transmission || '',
          vehicleType: v.vehicleType || 'Pickup',
          weaknessReport: matchingMem?.weaknessReport || generateSimulatedReport(v.brand, v.model, v.year)
        } as VehicleProfile;
      });
      return res.json(formattedList);
    }
  } catch (err) {
    console.error("Failed to query vehicles in SQL backend, falling back:", err);
  }
  res.json(vehicles);
});

// Add a new vehicle and generate its AI weakness report
app.post("/api/vehicles", async (req: Request, res: Response) => {
  const { brand, model, year, mileage, fuelType, lastOilChangeMileage, lastServiceDate, nickname, plateNumber, vehicleType, purchaseDate, purchasePrice, photoUrl, notes } = req.body;
  if (!brand || !model || !year || !mileage || !fuelType) {
    return res.status(400).json({ error: "Missing required fields for vehicle profile" });
  }

  const newVehicleId = `v-${Date.now()}`;
  const newVehicle: VehicleProfile = {
    ...req.body,
    id: newVehicleId,
    brand,
    model,
    year: Number(year),
    mileage: Number(mileage),
    fuelType,
    lastOilChangeMileage: lastOilChangeMileage ? Number(lastOilChangeMileage) : Number(mileage),
    lastServiceDate: lastServiceDate || new Date().toISOString().split('T')[0],
    nickname: nickname || "",
    plateNumber: plateNumber || "",
    vehicleType: vehicleType || "Other",
    purchaseDate: purchaseDate || "",
    purchasePrice: purchasePrice ? Number(purchasePrice) : undefined,
    photoUrl: photoUrl || "",
    notes: notes || ""
  };

  const client = getGeminiClient();

  if (client) {
    try {
      console.log(`Generating AI weakness report for vehicle: ${brand} ${model} ${year}`);
      const prompt = `Generate a detailed vehicle weakness report for a:
Brand: ${brand}
Model: ${model}
Year: ${year}
Mileage: ${mileage} km
Fuel type: ${fuelType}
Cambodia Driving Conditions: high dust, potholes, high heat.

Respond in strict JSON with schema fitting:
{
  "commonIssues": [{"issue": "string", "advice": "string", "risk": "low|medium|high"}],
  "maintenancePriority": ["string"],
  "strongPoints": ["string"],
  "weakPoints": ["string"],
  "monthlyChecklist": ["string"],
  "longTripChecklist": ["string"],
  "recommendedSchedule": [{"task": "string", "interval": "string"}],
  "warningSigns": ["string"]
}
Keep issues highly relevant to brand/model/year. Make sure strings of Cambodia details exist. Check for local parts sourcing.`;

      const response = await generateContentWithRetry(client, {
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              commonIssues: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    issue: { type: Type.STRING },
                    advice: { type: Type.STRING },
                    risk: { type: Type.STRING, enum: ["low", "medium", "high"] }
                  },
                  required: ["issue", "advice", "risk"]
                }
              },
              maintenancePriority: { type: Type.ARRAY, items: { type: Type.STRING } },
              strongPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
              weakPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
              monthlyChecklist: { type: Type.ARRAY, items: { type: Type.STRING } },
              longTripChecklist: { type: Type.ARRAY, items: { type: Type.STRING } },
              recommendedSchedule: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    task: { type: Type.STRING },
                    interval: { type: Type.STRING }
                  },
                  required: ["task", "interval"]
                }
              },
              warningSigns: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: [
              "commonIssues",
              "maintenancePriority",
              "strongPoints",
              "weakPoints",
              "monthlyChecklist",
              "longTripChecklist",
              "recommendedSchedule",
              "warningSigns"
            ]
          }
        }
      });

      const resultText = response.text;
      if (resultText) {
        newVehicle.weaknessReport = JSON.parse(resultText.trim());
      } else {
        throw new Error("No text returned for report");
      }
    } catch (e: any) {
      console.warn("Gemini soft fallback: Supplying high quality simulated report:", e.message || e);
      // Construct customized quality simulated report for Cambodia
      newVehicle.weaknessReport = generateSimulatedReport(brand, model, year);
    }
  } else {
    newVehicle.weaknessReport = generateSimulatedReport(brand, model, year);
  }

  // Assign Unique Vehicle public ID and QR secure parameters
  const paddedIndex = String(vehicles.length + 1).padStart(6, '0');
  newVehicle.publicVehicleId = `MCKH-CAR-${paddedIndex}`;
  newVehicle.qrSecureToken = `MCC-CAR-${newVehicle.id.replace('v-', '').toUpperCase()}-ST`;
  newVehicle.qrSecureLink = `https://ais-pre-32suu2pht5ohpxlspzepua-58491837947.asia-southeast1.run.app/vehicle-scan?token=${newVehicle.qrSecureToken}&publicId=${newVehicle.publicVehicleId}`;

  // Register in qrTokens
  qrTokens.push({
    id: `token-auto-${newVehicle.id}`,
    token: newVehicle.qrSecureToken,
    type: "vehicle",
    targetId: newVehicle.id
  });

  try {
    const activeUid = activeProfile?.uid || "user-owner-1";
    await insertVehicle({
      id: newVehicle.id,
      ownerUid: activeUid,
      brand: newVehicle.brand,
      model: newVehicle.model,
      year: newVehicle.year,
      mileage: newVehicle.mileage,
      fuelType: newVehicle.fuelType,
      plateNumber: newVehicle.plateNumber || '',
      chassisNumber: newVehicle.chassisNumber || '',
      notes: newVehicle.notes || '',
      engineType: newVehicle.engineType || '',
      transmission: newVehicle.transmission || '',
      vehicleType: newVehicle.vehicleType || '',
    });
  } catch (err) {
    console.error("Failed to insert vehicle to Cloud SQL:", err);
  }

  vehicles.push(newVehicle);
  res.json(newVehicle);
});

// Delete a vehicle
app.delete("/api/vehicles/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  vehicles = vehicles.filter(v => v.id !== id);
  maintenanceRecords = maintenanceRecords.filter(m => m.vehicleId !== id);
  vehicleExpenses = vehicleExpenses.filter(e => e.vehicleId !== id);
  attachedDocuments = attachedDocuments.filter(d => d.vehicleId !== id);
  res.json({ success: true });
});

// Update an existing vehicle
app.put("/api/vehicles/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const vehicle = vehicles.find(v => v.id === id);
  if (!vehicle) {
    return res.status(404).json({ error: "Vehicle not found" });
  }

  const { nickname, brand, model, year, mileage, fuelType, plateNumber, vehicleType, purchaseDate, purchasePrice, photoUrl, notes, lastOilChangeMileage, lastServiceDate } = req.body;

  Object.assign(vehicle, req.body);

  if (brand) vehicle.brand = brand;
  if (model) vehicle.model = model;
  if (year) vehicle.year = Number(year);
  if (mileage) vehicle.mileage = Number(mileage);
  if (fuelType) vehicle.fuelType = fuelType;
  if (nickname !== undefined) vehicle.nickname = nickname;
  if (plateNumber !== undefined) vehicle.plateNumber = plateNumber;
  if (vehicleType !== undefined) vehicle.vehicleType = vehicleType;
  if (purchaseDate !== undefined) vehicle.purchaseDate = purchaseDate;
  if (purchasePrice !== undefined) vehicle.purchasePrice = purchasePrice ? Number(purchasePrice) : undefined;
  if (photoUrl !== undefined) vehicle.photoUrl = photoUrl;
  if (notes !== undefined) vehicle.notes = notes;
  if (lastOilChangeMileage !== undefined) vehicle.lastOilChangeMileage = lastOilChangeMileage ? Number(lastOilChangeMileage) : undefined;
  if (lastServiceDate !== undefined) vehicle.lastServiceDate = lastServiceDate;

  res.json(vehicle);
});

// --- SERVICE TEMPLATES FOR SUPER ADMIN CONFIG & QUICK SERVICE LOG ---
interface CustomServiceTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  diagnosticFee: number;
  laborCost: number;
  parts: { name: string; brand: string; qty: number; price: number }[];
  targetEngineTypes: string[];
}

let serviceTemplates: CustomServiceTemplate[] = [
  {
    id: "tmpl-oil",
    name: "Standard Oil Change",
    category: "Engine Oil & Fluids",
    description: "Routine engine oil replacement interval service including fluid diagnostic safety checks.",
    diagnosticFee: 10,
    laborCost: 15,
    parts: [
      { name: "Synthetic Motor Oil (5W-30)", brand: "Mobil 1", qty: 4, price: 12 },
      { name: "Original Filter Assembly", brand: "Toyota Genuine", qty: 1, price: 8 }
    ],
    targetEngineTypes: ["Petrol / Gasoline", "LPG / CNG Gas Vehicle"]
  },
  {
    id: "tmpl-ev",
    name: "EV Battery Audit & Cell Check",
    category: "EV / Hybrid Battery System",
    description: "High-voltage traction grid evaluation, cell voltage balancing verification and BMS update.",
    diagnosticFee: 40,
    laborCost: 50,
    parts: [
      { name: "Cooling Fan Filter Element", brand: "OEM Genuine", qty: 1, price: 25 },
      { name: "Inverter Coolant Flush Kit", brand: "Toyota Super Long Life", qty: 1, price: 40 }
    ],
    targetEngineTypes: ["EV / Fully Electric Vehicle", "Electric Motorcycle / E-Bike"]
  },
  {
    id: "tmpl-dpf",
    name: "Diesel DPF Emission Decarb",
    category: "Diesel Emission System",
    description: "High particulate backpressure cleaning process, soot purging verification and Common-Rail injector calibration.",
    diagnosticFee: 30,
    laborCost: 65,
    parts: [
      { name: "Diesel Fuel Filter Element", brand: "Denso Quality", qty: 1, price: 30 },
      { name: "DPF Chemical Decarb Compound", brand: "Liqui Moly", qty: 2, price: 18 }
    ],
    targetEngineTypes: ["Diesel"]
  },
  {
    id: "tmpl-hybrid",
    name: "Hybrid Air fan & HVAC Service",
    category: "EV / Hybrid Battery System",
    description: "Hybrid battery air cooling duct fan cleaning, dust block removal and regenerative brakes inspection.",
    diagnosticFee: 20,
    laborCost: 35,
    parts: [
      { name: "Channel Sealing Foam", brand: "OEM Pack", qty: 1, price: 12 }
    ],
    targetEngineTypes: ["Hybrid", "Plug-in Hybrid / PHEV"]
  }
];

// Get templates
app.get("/api/service-templates", (req: Request, res: Response) => {
  res.json(serviceTemplates);
});

// Add a template
app.post("/api/service-templates", (req: Request, res: Response) => {
  const { name, category, description, diagnosticFee, laborCost, parts, targetEngineTypes } = req.body;
  if (!name || !category) {
    return res.status(400).json({ error: "Missing required name or category fields for service template" });
  }

  const newTemplate: CustomServiceTemplate = {
    id: `tmpl-${Date.now()}`,
    name,
    category,
    description: description || "",
    diagnosticFee: Number(diagnosticFee) || 0,
    laborCost: Number(laborCost) || 0,
    parts: Array.isArray(parts) ? parts : [],
    targetEngineTypes: Array.isArray(targetEngineTypes) ? targetEngineTypes : []
  };

  serviceTemplates.push(newTemplate);
  res.status(201).json(newTemplate);
});

// Delete a template
app.delete("/api/service-templates/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  serviceTemplates = serviceTemplates.filter(t => t.id !== id);
  res.json({ success: true, message: `Template ${id} removed successfully` });
});

// Get expenses
app.get("/api/expenses", (req: Request, res: Response) => {
  res.json(vehicleExpenses);
});

// Add an expense
app.post("/api/expenses", (req: Request, res: Response) => {
  const { vehicleId, category, amount, date, mileage, provider, paymentMethod, receiptImage, notes } = req.body;
  if (!vehicleId || !category || !amount || !date || !paymentMethod) {
    return res.status(400).json({ error: "Missing required expense parameters" });
  }

  const newExpense: VehicleExpense = {
    id: `exp-${Date.now()}`,
    vehicleId,
    category,
    amount: Number(amount),
    date,
    mileage: mileage ? Number(mileage) : 0,
    provider: provider || "Unknown",
    paymentMethod,
    receiptImage: receiptImage || undefined,
    notes: notes || ""
  };

  vehicleExpenses.push(newExpense);

  // Optional: trigger status checks for related mileage reminders if it's an odometer checkpoint
  if (mileage) {
    const v = vehicles.find(item => item.id === vehicleId);
    if (v && Number(mileage) > v.mileage) {
      v.mileage = Number(mileage);
    }
  }

  res.json(newExpense);
});

// Delete an expense
app.delete("/api/expenses/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  vehicleExpenses = vehicleExpenses.filter(e => e.id !== id);
  res.json({ success: true });
});

// Get attached documents
app.get("/api/documents", (req: Request, res: Response) => {
  res.json(attachedDocuments);
});

// Create/Upload simulated vehicle document
app.post("/api/documents", (req: Request, res: Response) => {
  const { vehicleId, category, title, fileName, fileSize, fileUrl } = req.body;
  if (!vehicleId || !category || !title || !fileName) {
    return res.status(400).json({ error: "Missing required document criteria" });
  }

  const newDoc: AttachedDocument = {
    id: `doc-${Date.now()}`,
    vehicleId,
    category,
    title,
    fileName,
    fileSize: fileSize || "1.2 MB",
    uploadDate: new Date().toISOString().split("T")[0],
    fileUrl: fileUrl || "#"
  };

  attachedDocuments.push(newDoc);
  res.json(newDoc);
});

// Delete a document
app.delete("/api/documents/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  attachedDocuments = attachedDocuments.filter(d => d.id !== id);
  res.json({ success: true });
});

// Retrieve dynamic driver AI insights using Gemini
app.post("/api/ai/driver-insights", async (req: Request, res: Response) => {
  const { vehicleId } = req.body;
  if (!vehicleId) {
    return res.status(400).json({ error: "Missing vehicleId for insights assessment" });
  }

  const vehicle = vehicles.find(v => v.id === vehicleId);
  if (!vehicle) {
    return res.status(404).json({ error: "Vehicle profile not set up" });
  }

  const activeRecords = maintenanceRecords.filter(r => r.vehicleId === vehicleId);
  const activeExpenses = vehicleExpenses.filter(e => e.vehicleId === vehicleId);

  const client = getGeminiClient();
  if (client) {
    try {
      const prompt = `You are a helpful automotive assistant specializing in vehicle ownership in Cambodia.
Analyze this vehicle profile and its recorded maintenance history and tracked expenses:
- Nickname: ${vehicle.nickname || "N/A"}
- Brand/Model/Year: ${vehicle.brand} ${vehicle.model} ${vehicle.year}
- Current Mileage: ${vehicle.mileage} km
- Fuel Type: ${vehicle.fuelType}
- Plate number: ${vehicle.plateNumber || "N/A"}
- Service History: ${JSON.stringify(activeRecords)}
- Tracked Expenses: ${JSON.stringify(activeExpenses)}

Provide:
1. "maintenanceInsights": Personalized maintenance suggestions based on the vehicle model, year, mileage, and service records in the context of Cambodian dusty, hot driving conditions.
2. "spendingInsights": Financial insights on the monthly spending.
3. "warningMessages": Cost warnings or caution notes if spending has spiked or if category analysis calls for it.
4. "ownershipAdvice": General vehicle ownership advice for this model in Cambodia (e.g. parts availability, specialized mechanics).
5. "costPrediction": Maintenance cost prediction for the next 6-12 months in USD.

Respond in strict JSON with matching lower camel-case keys. Pure JSON only:
{
  "maintenanceInsights": "string",
  "spendingInsights": "string",
  "warningMessages": "string",
  "ownershipAdvice": "string",
  "costPrediction": "string"
}`;

      const response = await generateContentWithRetry(client, {
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              maintenanceInsights: { type: Type.STRING },
              spendingInsights: { type: Type.STRING },
              warningMessages: { type: Type.STRING },
              ownershipAdvice: { type: Type.STRING },
              costPrediction: { type: Type.STRING }
            },
            required: ["maintenanceInsights", "spendingInsights", "warningMessages", "ownershipAdvice", "costPrediction"]
          }
        }
      });

      const text = response.text;
      if (text) {
        return res.json(JSON.parse(text.trim()));
      }
    } catch (err: any) {
      console.warn("Gemini soft fallback: Insights generation fallback used:", err.message || err);
    }
  }

  // Schema-compliant high-quality simulated fallbacks calculated dynamically
  const isToyota = vehicle.brand.toLowerCase().includes("toyota");
  const isPrius = vehicle.model.toLowerCase().includes("prius");
  const isDiesel = vehicle.fuelType === "Diesel";
  
  let maintenanceInsights = `Given your ${vehicle.brand} ${vehicle.model} ${vehicle.year} with ${vehicle.mileage.toLocaleString()} km, we advise replacing fluids regularly. Cambodia's potholed roads and dusty, hot urban gridlock require premium filters and active brake pad monitoring.`;
  let spendingInsights = `For this period, your total recorded expenses reach $${activeExpenses.reduce((a, b) => a + b.amount, 0)} USD. Keeping fuel receipts logs enables accurate mpg estimation.`;
  let warningMessages = "No severe warnings flagged. Ensure tire pressure indices remain high ahead of the monsoon rainy seasons.";
  let ownershipAdvice = `Parts availability for ${vehicle.brand} brand is outstanding in Phnom Penh markets (Soviet Blvd & Russian Markets). Many garages can quickly service these components.`;
  let costPrediction = "6-Month Prediction: Around $150 to $250 USD, covering typical engine fine-tunes, synthetic fuel line cleaners, and standard alignment checks.";

  if (isPrius) {
    maintenanceInsights = `Your ${vehicle.brand} Prius uses complex inverter electronics. Under heavy Phnom Penh ambient heat, vacuum clean the rear auxiliary battery fan filter duct monthly to prevent battery overheat codes.`;
    ownershipAdvice = `While Prius parts are easily sourceable, be selective. Consult dedicated hybrid specialists on Russian Blvd rather than standard mechanics when diagnostic lights trip.`;
    costPrediction = "6-Month Prediction: $100 - $180 USD, specializing in hybrid cooling loops, coolant checks, and normal auxiliary fluid changes.";
  } else if (isDiesel) {
    maintenanceInsights = `Diesel common-rail systems in Cambodia struggle with high-sulfur levels. We strongly advise applying quality diesel fuel treatment additives every 5,000 km to prevent turbo-lag.`;
  }

  res.json({
    maintenanceInsights,
    spendingInsights,
    warningMessages,
    ownershipAdvice,
    costPrediction
  });
});

// Get maintenance logs
app.get("/api/maintenance", async (req: Request, res: Response) => {
  try {
    const list = await getMaintenanceAll();
    if (list && list.length > 0) {
      const formattedList = list.map(m => {
        return {
          id: m.id,
          vehicleId: m.vehicleId,
          serviceCategory: m.serviceCategory,
          description: m.description || '',
          cost: m.cost || 0,
          mileage: m.mileage || 0,
          date: m.date,
          provider: m.provider
        } as MaintenanceRecord;
      });
      return res.json(formattedList);
    }
  } catch (err) {
    console.error("Failed to query maintenance from SQL:", err);
  }
  res.json(maintenanceRecords);
});

// Get individual vehicle reminders (Calculated Rules + Stored Reminders evaluated dynamically)
app.get("/api/reminders/:vehicleId", (req: Request, res: Response) => {
  const { vehicleId } = req.params;
  const vehicle = vehicles.find(v => v.id === vehicleId);
  if (!vehicle) {
    return res.status(404).json({ error: "Vehicle not found" });
  }
  const relativeRecords = maintenanceRecords.filter(r => r.vehicleId === vehicleId);
  
  // 1. Get initial standard calculated rule-based reminders
  const calculated = calculateReminders(vehicle, relativeRecords);
  
  // Convert calculated format to full SmartReminder with properties
  const calculatedReminders: SmartReminder[] = calculated.map(c => {
    let cat: any = "Custom Reminder";
    if (c.service === "Engine Oil Service") cat = "Engine Oil Change";
    else if (c.service === "Brake Service") cat = "Brake Check";
    else if (c.service === "Tire Service") cat = "Tire Check";
    else if (c.service === "EV Battery Inspection") cat = "EV Battery Health Check";
    else if (c.service === "EV Coolant Flush") cat = "EV Charging System Check";
    else if (c.service === "Hybrid System Check") cat = "EV Charging System Check";
    else if (c.service === "Hybrid Inverter Coolant Service") cat = "Coolant Check";
    else if (c.service === "Spark Plugs Check") cat = "Battery Check";
    else if (c.service === "Diesel Fuel Separator Check") cat = "Oil Filter";
    else if (c.service === "Diesel Exhaust DPF Check") cat = "Air Filter";
    else if (c.service === "High Mileage Timing Check") cat = "Full Inspection";
    else if (c.service === "Transmission fluid check") cat = "Transmission Oil";
    else if (c.service === "Break-in inspection") cat = "Full Inspection";

    let remType: 'date_based' | 'mileage_based' | 'date_and_mileage' = "date_and_mileage";
    if (c.id.includes("oil") || c.id.includes("timing") || c.id.includes("transmission")) {
      remType = "mileage_based";
    }

    return {
      ...c,
      title: c.service,
      category: cat,
      reminderType: remType,
      isAiSuggested: false,
      createdAt: new Date().toISOString()
    };
  });

  // 2. Load stored reminders, dynamically evaluate status based on current vehicle parameters
  const storedReminders = remindersDatabase.filter(r => r.vehicleId === vehicleId);
  
  const evaluatedStored: SmartReminder[] = storedReminders.map(r => {
    // If completed or cancelled, do not alter status
    if (r.status === 'Completed') return r;
    
    let worstStatus: 'Good' | 'Due soon' | 'Due today' | 'Overdue' = 'Good';
    
    // Evaluate Date-based constraints
    if ((r.reminderType === 'date_based' || r.reminderType === 'date_and_mileage') && r.dueDate) {
      const today = new Date();
      const due = new Date(r.dueDate);
      const diffMs = due.getTime() - today.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 3600 * 24));
      
      if (diffDays < 0) {
        worstStatus = 'Overdue';
      } else if (diffDays === 0) {
        worstStatus = 'Due today';
      } else if (diffDays <= 7) {
        worstStatus = 'Due soon';
      }
    }
    
    // Evaluate Mileage-based constraints
    if ((r.reminderType === 'mileage_based' || r.reminderType === 'date_and_mileage') && r.dueMileage) {
      const diffKm = r.dueMileage - vehicle.mileage;
      
      if (diffKm <= 0) {
        worstStatus = 'Overdue';
      } else if (diffKm <= 1000) {
        // If it wasn't already marked Overdue by Date, elevate to Due soon
        if (worstStatus !== 'Overdue') {
          worstStatus = 'Due soon';
        }
      }
    }
    
    return {
      ...r,
      status: r.status === 'Snoozed' ? 'Snoozed' : worstStatus
    };
  });
  
  // Combine both arrays, filtering out duplicate titles/categories from calculated if a manual custom one exists
  const combined: SmartReminder[] = [];
  
  // Add evaluated stored first (they have higher specificity)
  combined.push(...evaluatedStored);
  
  // Add calculated ones only if they don't block/overlap with custom stored ones
  calculatedReminders.forEach(c => {
    const hasOverride = combined.some(stored => stored.category === c.category && stored.status !== 'Completed');
    if (!hasOverride) {
      combined.push(c);
    }
  });

  // Dynamically trigger auto maintenance notifications for Overdue or Due soon statuses
  combined.forEach(rem => {
    if (rem.status === 'Overdue' || rem.status === 'Due soon' || rem.status === 'Due today') {
      const slugKey = `auto-rem-${vehicleId}-${rem.service.replace(/\s+/g, '-').toLowerCase()}`;
      const alreadyLogged = notificationLogsDatabase.some(n => n.relatedRecordId === slugKey);
      if (!alreadyLogged) {
        notificationLogsDatabase.unshift({
          id: `notif-auto-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          vehicleId: vehicleId as string,
          reminderId: rem.id,
          title: rem.status === 'Overdue' ? `🚨 CRITICAL: ${rem.service} is Overdue` : `⚠️ NOTICE: ${rem.service} is Due soon`,
          message: rem.reason,
          channel: 'In-App',
          status: 'unread',
          sentAt: new Date().toISOString(),
          category: 'maintenance',
          priority: rem.status === 'Overdue' ? 'High' : 'Medium',
          sourceType: 'system',
          actionUrl: '/dashboard',
          actionLabel: 'Check Health',
          relatedRecordId: slugKey
        });
      }
    }
  });

  res.json(combined);
});

// Create a new reminder
app.post("/api/reminders", (req: Request, res: Response) => {
  const { 
    vehicleId, 
    title, 
    category, 
    reminderType, 
    dueDate, 
    dueMileage, 
    repeatType, 
    notificationTime, 
    description, 
    priority, 
    isAiSuggested 
  } = req.body;

  if (!vehicleId || !title || !category || !reminderType) {
    return res.status(400).json({ error: "Missing required reminder parameters" });
  }

  const id = `rem-${Date.now()}`;
  const newReminder: SmartReminder = {
    id,
    vehicleId,
    service: title,
    title,
    category,
    reminderType,
    status: "Good",
    reason: description || `Scheduled checkpoint task for ${category}.`,
    action: `Perform complete check or visit garage for professional assessment.`,
    priority: priority || "Medium",
    dueDate: dueDate || undefined,
    dueMileage: dueMileage ? Number(dueMileage) : undefined,
    repeatType: repeatType || "none",
    notificationTime: notificationTime || undefined,
    description: description || undefined,
    isAiSuggested: !!isAiSuggested,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  remindersDatabase.push(newReminder);

  // Generate an automated In-App trigger notification
  const notifId = `notif-${Date.now()}`;
  const matchedVehicle = vehicles.find(v => v.id === vehicleId);
  const vLabel = matchedVehicle ? `${matchedVehicle.brand} ${matchedVehicle.model}` : "Vehicle";
  
  notificationLogsDatabase.unshift({
    id: notifId,
    vehicleId,
    reminderId: id,
    title: `🔔 Scheduled Reminder: ${title}`,
    message: `New reminder set successfully for ${vLabel}. Trigger criteria: ${
      reminderType === 'date_based' ? `Date (${dueDate})` : 
      reminderType === 'mileage_based' ? `Odometer (${dueMileage} km)` : `Criteria reached.`
    }`,
    channel: "In-App",
    status: "unread",
    sentAt: new Date().toISOString()
  });

  res.json(newReminder);
});

// Update a custom reminder
app.put("/api/reminders/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const index = remindersDatabase.findIndex(r => r.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Reminder not found" });
  }

  const { title, category, reminderType, dueDate, dueMileage, repeatType, notificationTime, description, priority, status } = req.body;
  
  remindersDatabase[index] = {
    ...remindersDatabase[index],
    title: title || remindersDatabase[index].title,
    service: title || remindersDatabase[index].service,
    category: category || remindersDatabase[index].category,
    reminderType: reminderType || remindersDatabase[index].reminderType,
    dueDate: dueDate || remindersDatabase[index].dueDate,
    dueMileage: dueMileage ? Number(dueMileage) : remindersDatabase[index].dueMileage,
    repeatType: repeatType || remindersDatabase[index].repeatType,
    notificationTime: notificationTime || remindersDatabase[index].notificationTime,
    description: description || remindersDatabase[index].description,
    reason: description || remindersDatabase[index].reason,
    priority: priority || remindersDatabase[index].priority,
    status: status || remindersDatabase[index].status,
    updatedAt: new Date().toISOString()
  };

  res.json(remindersDatabase[index]);
});

// Delete a custom reminder
app.delete("/api/reminders/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  remindersDatabase = remindersDatabase.filter(r => r.id !== id);
  res.json({ success: true });
});

// Complete a reminder
app.post("/api/reminders/:id/complete", (req: Request, res: Response) => {
  const { id } = req.params;
  const index = remindersDatabase.findIndex(r => r.id === id);
  
  if (index !== -1) {
    const original = remindersDatabase[index];
    original.status = 'Completed';
    original.updatedAt = new Date().toISOString();

    // If it's repeating, auto-calculate and generate the next scheduled event occurrence
    if (original.repeatType && original.repeatType !== 'none') {
      const nextId = `rem-${Date.now()}-next`;
      let nextDate = original.dueDate;
      let nextMileage = original.dueMileage;

      if (original.dueDate) {
        const d = new Date(original.dueDate);
        if (original.repeatType === 'daily') d.setDate(d.getDate() + 1);
        else if (original.repeatType === 'weekly') d.setDate(d.getDate() + 7);
        else if (original.repeatType === 'monthly') d.setMonth(d.getMonth() + 1);
        else if (original.repeatType === 'every_3_months') d.setMonth(d.getMonth() + 3);
        else if (original.repeatType === 'every_6_months') d.setMonth(d.getMonth() + 6);
        else if (original.repeatType === 'yearly') d.setFullYear(d.getFullYear() + 1);
        nextDate = d.toISOString().split('T')[0];
      }

      if (original.dueMileage) {
        // Increment typical service mileage intervals
        nextMileage = original.dueMileage + 5000;
      }

      const nextReminder: SmartReminder = {
        ...original,
        id: nextId,
        status: 'Good',
        dueDate: nextDate,
        dueMileage: nextMileage,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      remindersDatabase.push(nextReminder);
    }

    // Log the completion notification
    notificationLogsDatabase.unshift({
      id: `notif-comp-${Date.now()}`,
      reminderId: original.id,
      title: `✅ Checklist Task Completed`,
      message: `You marked "${original.title}" as completed. Great job keeping your vehicle in peak diagnostic status!`,
      channel: "In-App",
      status: "unread",
      sentAt: new Date().toISOString()
    });

    return res.json({ success: true, original: original });
  }

  // Also handle completion of rule-evaluated reminder by adding a mock service log or logging success
  res.json({ success: true });
});

// Snooze a reminder
app.post("/api/reminders/:id/snooze", (req: Request, res: Response) => {
  const { id } = req.params;
  const { snoozeDays, snoozeMileage } = req.body;
  const index = remindersDatabase.findIndex(r => r.id === id);

  if (index !== -1) {
    const reminder = remindersDatabase[index];
    reminder.status = 'Snoozed';
    
    if (reminder.dueDate && snoozeDays) {
      const d = new Date(reminder.dueDate);
      d.setDate(d.getDate() + Number(snoozeDays));
      reminder.dueDate = d.toISOString().split('T')[0];
    }
    
    if (reminder.dueMileage && snoozeMileage) {
      reminder.dueMileage = reminder.dueMileage + Number(snoozeMileage);
    }
    
    reminder.updatedAt = new Date().toISOString();

    // Create snooze notification
    notificationLogsDatabase.unshift({
      id: `notif-snooze-${Date.now()}`,
      reminderId: reminder.id,
      title: `⏳ Reminder Snoozed`,
      message: `"${reminder.title}" will alarm again on ${reminder.dueDate || 'next criteria offset'}.`,
      channel: "In-App",
      status: "unread",
      sentAt: new Date().toISOString()
    });

    return res.json(reminder);
  }

  res.status(404).json({ error: "Reminder not found" });
});

// Request AI custom reminder suggestions using Gemini
app.post("/api/ai/reminder-suggestion", async (req: Request, res: Response) => {
  const { vehicleId } = req.body;
  const vehicle = vehicles.find(v => v.id === vehicleId);
  if (!vehicle) {
    return res.status(404).json({ error: "Active vehicle profile not found" });
  }

  const relativeRecords = maintenanceRecords.filter(r => r.vehicleId === vehicleId);

  const fuel = (vehicle.fuelType || "Gasoline").toLowerCase();
  const engineType = vehicle.engineTypeNew || "";
  const fuelEnergyType = vehicle.fuelEnergyType || "";
  const isEv = engineType === "electric" || fuelEnergyType === "electric" || fuel === "ev";
  const isHybrid = engineType === "hybrid" || engineType === "plug-in hybrid" || fuel === "hybrid";
  const isDiesel = engineType === "diesel" || fuel === "diesel";

  const prompt = `
Generate exactly 3 vehicle-specific service reminder suggestions tailored for MyCar Care KH.
Vehicle specifications:
- Brand: ${vehicle.brand}
- Model: ${vehicle.model}
- Manufacturing Year: ${vehicle.year}
- Current Odometer Reading: ${vehicle.mileage} km
- Fuel System type: ${vehicle.fuelType}
- Engine Type: ${engineType}
- Fuel Energy Type: ${fuelEnergyType}
Historical repairs completed: ${JSON.stringify(relativeRecords)}

Note: Driving in Cambodia is defined by severe thermal degradation, extremely dusty road conditions during dry seasons, and localized flooding in urban Phnom Penh districts during monsoons (May to October). This leads to premature wear on engines, suspension components, steering rod ball joints, and electrical connectors.

COMPATIBILITY RESTRICTIONS:
- IS_EV = ${isEv}. If IS_EV is true, you MUST NOT generate "Engine Oil Change", "Oil Filter", "Transmission Oil", or any other combustion-only engine categories. Instead, suggest "EV Battery Health Check", "EV Charging System Check", "Brake Check", "Tire Check", or "Full Inspection".
- IS_DIESEL = ${isDiesel}. If IS_DIESEL is true, recommend diesel engine filters/checks (like Fuel Filter or DPF check).
- Avoid recommending EV-specific reminders for combustion-only cars (e.g. do not suggest EV Battery Health Check or EV Charging System Check for a Toyota Tacoma 2006).

Return a valid, strict JSON array containing exactly 3 elements, with no surrounding quotes or markdown. Each object has these attributes:
- category: matches one of these pre-registered categories: "Engine Oil Change", "Oil Filter", "Air Filter", "Brake Check", "Tire Check", "Tire Rotation", "Battery Check", "Coolant Check", "Transmission Oil", "Car Wash", "Full Inspection", "Insurance Renewal", "Road Tax Renewal", "EV Battery Health Check", "EV Charging System Check", "Road Trip Inspection", "Custom Reminder"
- title: concise, human-friendly title
- description: deep, professional explanation pointing to vehicle limits & Cambodia monsoon hazards
- reminderType: one of "date_based", "mileage_based", "date_and_mileage"
- priority: one of "Low", "Medium", "High", "Emergency"
- dueDate: suggested due date in YYYY-MM-DD (approx 30 to 90 days out)
- dueMileage: suggested mileage (current odometer ${vehicle.mileage} km + 4500 to 7500 km)
- action: diagnostic check instructions for service garage
`;

  const client = getGeminiClient();
  if (!client) {
    throw new Error("Gemini AI Client is offline or key setup is missing");
  }

  try {
    const response = await generateContentWithRetry(client, { 
      contents: prompt,
      model: "gemini-3.5-flash",
      config: {
        responseMimeType: "application/json"
      }
    });

    const aiText = response?.text;
    if (aiText) {
      const parsed = JSON.parse(aiText.trim());
      if (Array.isArray(parsed)) {
        return res.json(parsed);
      }
    }
    throw new Error("Invalid AI raw json payload representation layout.");
  } catch (err: any) {
    console.warn("Gemini soft fallback: Supplying mock diagnostic report:", err.message);
    
    // Safety fallback tailored specifically to vehicle specifications!
    const isEV = vehicle.fuelType === 'EV';
    const sampleFallbacks = [
      {
        category: isEV ? "EV Battery Health Check" : "Engine Oil Change",
        title: isEV ? "HV Battery Leakage Check" : "Cambodia Dusty Conditions Lube Service",
        description: isEV 
          ? `Verify high voltage EV battery hermetic sealing before Phnom Penh high monsoon street accumulation.`
          : `Monsoon humidity degrades lubricating indices. Standard ${vehicle.brand} ${vehicle.model} models driving in Cambodia benefit from engine oil swaps every 5,000 km.`,
        reminderType: "date_and_mileage",
        priority: "High",
        dueDate: new Date(Date.now() + 45 * 24 * 3600 * 1000).toISOString().split('T')[0],
        dueMileage: vehicle.mileage + 5000,
        action: "Schedule a synthetic oil upgrade and clean physical block linkages."
      },
      {
        category: "Brake Check",
        title: "Monsoon Brake Disc Caliper Deglow",
        description: `Inspect sliding pins and pad friction depths. Cambodia rainy weather frequently deposits dirt and aggressive silt inside ${vehicle.year} wheels.`,
        reminderType: "mileage_based",
        priority: "Medium",
        dueDate: new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString().split('T')[0],
        dueMileage: vehicle.mileage + 7500,
        action: "Flush caliper pins and test hydraulic fluid water moisture percentages."
      },
      {
        category: "Full Inspection",
        title: "Undercarriage Guard & Joint Review",
        description: `Worn ball joints on suspension blocks present major handling safety risks across Phnom Penh potholes. Visual inspect boot seals.`,
        reminderType: "date_based",
        priority: "High",
        dueDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
        dueMileage: vehicle.mileage + 4000,
        action: "Arrange front suspension lower ball joints wiggle test with Angkor Tyres wheel alignment clinic."
      }
    ];

    res.json(sampleFallbacks);
  }
});

// AI Translation / Bilingual Formatting for Repair Shop Tickets (Requirement 9)
app.post("/api/ai/partners/bilingual-ticket", async (req: Request, res: Response) => {
  const { category, productUsed, partsChanged, note, technicianName } = req.body;
  
  const prompt = `
  Translate and format the following technical service notes into a highly professional, polite customer-facing bilingual (English and Khmer) notification card.
  Service Category: ${category || "General Repair"}
  Products Installed: ${productUsed || "None specified"}
  Parts Upgraded: ${partsChanged || "None specified"}
  Mechanic's Notes: ${note || "None specified"}
  Technician: ${technicianName || "Lead mechanic"}

  Focus on:
  - High-glowing professional tone.
  - Adding safety suggestions for drivers in Phnom Penh/Cambodia (extreme heat, mud, monsoon driving advice).
  - Polite Khmer (using formal suffixes) paired with clean English translations.
  
  Provide a JSON response in this strict structure:
  {
    "khmerNote": "polite explanation in Khmer",
    "englishNote": "professional description in English",
    "bilingualCombined": "Khmer followed by English",
    "recommendedCheckLimit": "e.g. 5,000 km or 3 Months due to Cambodia heavy traffic conditions"
  }
  `;

  const client = getGeminiClient();
  if (!client) {
    return res.json({
      khmerNote: "សេវាកម្មប្រេងម៉ាស៊ីនត្រូវបានបញ្ចប់ដោយជោគជ័យ។ ភ្នំពេញ លក្ខខណ្ឌផ្លូវហាប់ណែន និងធូលីច្រើន។",
      englishNote: "Engine oil change completed successfully by lead technician. Safe travels across Phnom Penh's dusty tracks.",
      bilingualCombined: "សេវាកម្មប្រេងម៉ាស៊ីនត្រូវបានបញ្ចប់ដោយជោគជ័យ។ Engine oil change completed successfully.",
      recommendedCheckLimit: "5,000 km or 3 Months"
    });
  }

  try {
    const response = await generateContentWithRetry(client, {
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            khmerNote: { type: Type.STRING },
            englishNote: { type: Type.STRING },
            bilingualCombined: { type: Type.STRING },
            recommendedCheckLimit: { type: Type.STRING }
          },
          required: ["khmerNote", "englishNote", "bilingualCombined", "recommendedCheckLimit"]
        }
      }
    });

    if (response.text) {
      res.json(JSON.parse(response.text.trim()));
    } else {
      throw new Error("Empty text returned.");
    }
  } catch (e) {
    res.json({
      khmerNote: "សេវាកម្មប្រេងម៉ាស៊ីនត្រូវបានបញ្ចប់ដោយជោគជ័យ។ ភ្នំពេញ លក្ខខណ្ឌផ្លូវហាប់ណែន និងធូលីច្រើន។",
      englishNote: `${category} maintenance task finalized securely.`,
      bilingualCombined: `សេវាកម្មប្រេងម៉ាស៊ីនត្រូវបានបញ្ចប់ដោយជោគជ័យ។ Engine oil change completed successfully by lead technician.`,
      recommendedCheckLimit: "5,000 km"
    });
  }
});

let notificationTemplatesDatabase = [
  {
    id: "templ-1",
    title: "Oil Change Overdue Reminder",
    message: "Your vehicle is due for an oil change in 500 km or within 7 days. Book service now.",
    category: "maintenance",
    priority: "High",
    roleTarget: "owner",
    createdAt: new Date().toISOString()
  },
  {
    id: "templ-2",
    title: "Critical Airbag Safety Recall",
    message: "Safety Alert: Your vehicle model may be affected by an airbag recall. Please verify by VIN.",
    category: "safety",
    priority: "Critical",
    roleTarget: "owner",
    createdAt: new Date().toISOString()
  },
  {
    id: "templ-3",
    title: "Phnom Penh Flash Flood Warning",
    message: "Phnom Penh road flood warning: Please check brake and electrical system after driving through flood water.",
    category: "admin",
    priority: "Critical",
    roleTarget: "all",
    createdAt: new Date().toISOString()
  },
  {
    id: "templ-4",
    title: "Rainy Season Traction Advisory",
    message: "Rainy season reminder: Please check tires, brakes, wipers, and lights before long-distance driving.",
    category: "admin",
    priority: "Medium",
    roleTarget: "all",
    createdAt: new Date().toISOString()
  },
  {
    id: "templ-5",
    title: "Hot Weather Coolant Advisory",
    message: "Cambodia hot weather coolant reminder: High ambient temperatures put extra load on the cooling loop. Check levels.",
    category: "admin",
    priority: "Medium",
    roleTarget: "owner",
    createdAt: new Date().toISOString()
  }
];

let userNotificationSettingsDatabase = {
  pushEnabled: true,
  emailEnabled: true,
  smsEnabled: false,
  telegramEnabled: true,
  maintenanceEnabled: true,
  garageEnabled: true,
  bookingEnabled: true,
  marketplaceEnabled: true,
  forumEnabled: true,
  safetyAlertEnabled: true,
  adminAnnouncementEnabled: true,
  customAlarmEnabled: true,
  quietHoursStart: "22:00",
  quietHoursEnd: "07:00",
  
  telegramConnected: false,
  telegramChatId: null as string | null,
  telegramUsername: null as string | null,
  telegramConnectedAt: null as string | null,
  verificationToken: "KH-9901" as string | null,
  
  allowMaintenanceReminders: true,
  allowGarageServiceUpdates: true,
  allowInvoiceNotifications: true,
  allowQuotationRequests: true,
  allowWarrantyReminders: true,
  allowGaragePromotions: true,
  allowEmergencyAlerts: true
};

// Notifications logger endpoint
app.get("/api/notifications", (req: Request, res: Response) => {
  const { vehicleId } = req.query;
  if (vehicleId) {
    const filtered = notificationLogsDatabase.filter(n => n.vehicleId === vehicleId);
    return res.json(filtered);
  }
  res.json(notificationLogsDatabase);
});

// Mark notification as read
app.post("/api/notifications/:id/read", (req: Request, res: Response) => {
  const { id } = req.params;
  const index = notificationLogsDatabase.findIndex(n => n.id === id);
  if (index !== -1) {
    notificationLogsDatabase[index].status = 'read';
  }
  res.json({ success: true });
});

// Clear all notifications
app.post("/api/notifications/clear", (req: Request, res: Response) => {
  notificationLogsDatabase = [];
  res.json({ success: true });
});

// Get user notification settings
app.get("/api/notifications/settings", (req: Request, res: Response) => {
  res.json(userNotificationSettingsDatabase);
});

// Update user notification settings
app.post("/api/notifications/settings", (req: Request, res: Response) => {
  userNotificationSettingsDatabase = {
    ...userNotificationSettingsDatabase,
    ...req.body
  };
  res.json(userNotificationSettingsDatabase);
});

// --- TELEGRAM INTEGRATION MODULE EXTENSION ---

let suspendedGaragesDatabase: Record<string, boolean> = {
  "cheater": true // Seeded scam garage suspended immediately
};

let garageMessageTemplatesDatabase = [
  {
    id: "g_tmpl_1",
    garageId: "g1",
    templateName: "Service ticket created",
    templateType: "service_update",
    messageBody: "Hello {customer}, your service ticket {ticketId} for your {vehicle} has been opened at {garage}. Current status: Checked In. Thank you!",
    isActive: true,
    createdByStaffId: "g1_owner",
    createdAt: "2026-01-10T08:00:00Z",
    updatedAt: "2026-05-29T16:40:07Z"
  },
  {
    id: "g_tmpl_2",
    garageId: "g1",
    templateName: "Service status update",
    templateType: "service_update",
    messageBody: "Hello {customer}, the status of your vehicle {vehicle} has changed to: {status} at {garage}.",
    isActive: true,
    createdByStaffId: "g1_owner",
    createdAt: "2026-01-12T08:00:00Z",
    updatedAt: "2026-05-29T16:40:07Z"
  },
  {
    id: "g_tmpl_3",
    garageId: "g1",
    templateName: "Waiting for Customer Approval",
    templateType: "service_update",
    messageBody: "Hello {customer}, your {vehicle} is waiting for your approval at {garage} before work can start.",
    isActive: true,
    createdByStaffId: "g1_owner",
    createdAt: "2026-01-12T09:00:00Z",
    updatedAt: "2026-05-29T16:40:07Z"
  },
  {
    id: "g_tmpl_4",
    garageId: "g1",
    templateName: "Quotation Approval Request",
    templateType: "quotation",
    messageBody: "Hello {customer}, a new service estimate of ${cost} USD for your {vehicle} has been generated. Please review and sign off inside the MyCar App before we initiate repairs.",
    isActive: true,
    createdByStaffId: "g1_owner",
    createdAt: "2026-01-14T08:00:00Z",
    updatedAt: "2026-05-29T16:40:07Z"
  },
  {
    id: "g_tmpl_5",
    garageId: "g1",
    templateName: "Vehicle ready for pickup",
    templateType: "pickup",
    messageBody: "🏁 Good news {customer}! Your {vehicle} has completed servicing and passed all safety checks. It is ready for pickup at {garage}. Total Invoice: ${cost} USD. See you soon!",
    isActive: true,
    createdByStaffId: "g1_owner",
    createdAt: "2026-01-15T08:00:00Z",
    updatedAt: "2026-05-29T16:40:07Z"
  },
  {
    id: "g_tmpl_6",
    garageId: "g1",
    templateName: "Invoice created",
    templateType: "invoice",
    messageBody: "🧾 Tax Invoice {invoiceId} for ${cost} USD has been finalized for your {vehicle} at {garage}. Payment is due within 48h. Thank you!",
    isActive: true,
    createdByStaffId: "g1_owner",
    createdAt: "2026-01-16T08:00:00Z",
    updatedAt: "2026-05-29T16:40:07Z"
  },
  {
    id: "g_tmpl_7",
    garageId: "g1",
    templateName: "Payment reminder",
    templateType: "payment",
    messageBody: "⏰ Friendly Payment Reminder: Invoice {invoiceId} for ${cost} USD is pending clearance at {garage}. Please settle in-app or at our counter. Thank you!",
    isActive: true,
    createdByStaffId: "g1_owner",
    createdAt: "2026-01-18T08:00:00Z",
    updatedAt: "2026-05-29T16:40:07Z"
  },
  {
    id: "g_tmpl_8",
    garageId: "g1",
    templateName: "Maintenance deadline reminder",
    templateType: "reminder",
    messageBody: "📅 Next Scheduled Check-up: Your {vehicle} is due for a regular check-up (tires/brakes). Securing your bay early at {garage} ensures zero wait time!",
    isActive: true,
    createdByStaffId: "g1_owner",
    createdAt: "2026-01-20T08:00:00Z",
    updatedAt: "2026-05-29T16:40:07Z"
  },
  {
    id: "g_tmpl_9",
    garageId: "g1",
    templateName: "Spare part ordered",
    templateType: "reminder",
    messageBody: "📦 Spare Parts Ordered: The parts package for your {vehicle} ({partName}) has been requested by {garage}. Transiting from seaport hub.",
    isActive: true,
    createdByStaffId: "g1_owner",
    createdAt: "2026-01-21T08:00:00Z",
    updatedAt: "2026-05-29T16:40:07Z"
  },
  {
    id: "g_tmpl_10",
    garageId: "g1",
    templateName: "Spare part arrived",
    templateType: "reminder",
    messageBody: "📦 Spare Parts Arrived: The parts ordered for your {vehicle} ({partName}) have arrived at {garage}. Ready for installation!",
    isActive: true,
    createdByStaffId: "g1_owner",
    createdAt: "2026-01-22T08:00:00Z",
    updatedAt: "2026-05-29T16:40:07Z"
  },
  {
    id: "g_tmpl_11",
    garageId: "g1",
    templateName: "Part installed",
    templateType: "reminder",
    messageBody: "⚙️ Spare Part Installed: The new {partName} has been successfully installed in your {vehicle} at {garage}.",
    isActive: true,
    createdByStaffId: "g1_owner",
    createdAt: "2026-01-23T08:00:00Z",
    updatedAt: "2026-05-29T16:40:07Z"
  },
  {
    id: "g_tmpl_12",
    garageId: "g1",
    templateName: "Warranty created",
    templateType: "reminder",
    messageBody: "🛡️ Warranty Registered: Your recent repair {partName} completed at {garage} is covered under a parts warranty for 6 months.",
    isActive: true,
    createdByStaffId: "g1_owner",
    createdAt: "2026-01-24T08:00:00Z",
    updatedAt: "2026-05-29T16:40:07Z"
  },
  {
    id: "g_tmpl_13",
    garageId: "g1",
    templateName: "Warranty ending soon",
    templateType: "reminder",
    messageBody: "🛡️ Warranty Alert: The warranty on your {partName} from {garage} is ending soon (within 30 days). Let us know if you need any inspection!",
    isActive: true,
    createdByStaffId: "g1_owner",
    createdAt: "2026-01-24T09:00:00Z",
    updatedAt: "2026-05-29T16:40:07Z"
  },
  {
    id: "g_tmpl_14",
    garageId: "g1",
    templateName: "Service completed",
    templateType: "reminder",
    messageBody: "✅ Service Completed: All repairs on your {vehicle} are completed at {garage}. Thank you for trusting Cambodia's premier automotive network!",
    isActive: true,
    createdByStaffId: "g1_owner",
    createdAt: "2026-01-25T08:00:00Z",
    updatedAt: "2026-05-29T16:40:07Z"
  },
  {
    id: "g_tmpl_15",
    garageId: "g1",
    templateName: "Feedback request",
    templateType: "reminder",
    messageBody: "⭐ Service Feedback, we value your opinion! How was your experience at {garage}? Please rate us on the MyCar App!",
    isActive: true,
    createdByStaffId: "g1_owner",
    createdAt: "2026-01-26T08:00:00Z",
    updatedAt: "2026-05-29T16:40:07Z"
  },
  {
    id: "g_tmpl_16",
    garageId: "g1",
    templateName: "Garage promotion",
    templateType: "promotion",
    messageBody: "✨ Special Offer from {garage}: Save 15% on all hybrid battery inspections and AC cooling checks this week. Reply or open app to book!",
    isActive: true,
    createdByStaffId: "g1_owner",
    createdAt: "2026-01-29T08:00:00Z",
    updatedAt: "2026-05-29T16:40:07Z"
  }
];

let telegramConnectionsDatabase = [
  {
    id: "tg_conn_1",
    userId: "1",
    telegramChatId: "88219034",
    telegramUsername: "@kiri_kh9",
    connectionStatus: "Connected",
    verificationToken: "KH-9901",
    connectedAt: "2026-05-29T16:40:07Z",
    disconnectedAt: null,
    lastMessageAt: "2026-05-29T16:42:15Z"
  }
];

let garageCustomerNotificationPermissionsDatabase = [
  {
    id: "gcnp_1",
    garageId: "g1",
    garageName: "Apsara Auto Repair & Diagnostic Center",
    userId: "1",
    allowServiceUpdates: true,
    allowInvoiceMessages: true,
    allowReminders: true,
    allowPromotions: true,
    blockedByUser: false,
    reportedSpam: false,
    dailyMessagesCount: 0,
    createdAt: "2026-01-15T09:00:00Z",
    updatedAt: "2026-05-29T16:40:00Z"
  },
  {
    id: "gcnp_2",
    garageId: "g2",
    garageName: "Angkor Tyres & Wheel Alignment Clinic",
    userId: "1",
    allowServiceUpdates: true,
    allowInvoiceMessages: true,
    allowReminders: true,
    allowPromotions: false,
    blockedByUser: false,
    reportedSpam: false,
    dailyMessagesCount: 0,
    createdAt: "2026-01-18T10:00:00Z",
    updatedAt: "2026-05-29T16:40:00Z"
  }
];

let customTelegramMessagesSentCount: Record<string, number> = {};

// Status check API
app.get("/api/telegram/status", (req: Request, res: Response) => {
  res.json({
    settings: userNotificationSettingsDatabase,
    connections: telegramConnectionsDatabase,
    permissions: garageCustomerNotificationPermissionsDatabase
  });
});

// Generate verification token API
app.post("/api/telegram/generate-token", (req: Request, res: Response) => {
  const token = `KH-${Math.floor(1000 + Math.random() * 9000)}`;
  userNotificationSettingsDatabase.verificationToken = token;
  res.json({ token });
});

// Toggle block garage
app.post("/api/telegram/toggle-block-garage", (req: Request, res: Response) => {
  const { garageId } = req.body;
  const perm = garageCustomerNotificationPermissionsDatabase.find(p => p.garageId === garageId);
  if (perm) {
    perm.blockedByUser = !perm.blockedByUser;
    perm.updatedAt = new Date().toISOString();
    res.json({ success: true, permission: perm });
  } else {
    // create a new profile relationship
    const garageObj = garagesDatabase.find(g => g.id === garageId);
    const newPerm = {
      id: `gcnp-${Date.now()}`,
      garageId,
      garageName: garageObj ? garageObj.name : `Garage ${garageId}`,
      userId: "1",
      allowServiceUpdates: true,
      allowInvoiceMessages: true,
      allowReminders: true,
      allowPromotions: true,
      blockedByUser: true,
      reportedSpam: false,
      dailyMessagesCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    garageCustomerNotificationPermissionsDatabase.push(newPerm);
    res.json({ success: true, permission: newPerm });
  }
});

// Report garage spam
app.post("/api/telegram/report-spam", (req: Request, res: Response) => {
  const { garageId } = req.body;
  const perm = garageCustomerNotificationPermissionsDatabase.find(p => p.garageId === garageId);
  if (perm) {
    perm.reportedSpam = true;
    perm.blockedByUser = true;
    perm.updatedAt = new Date().toISOString();
    res.json({ success: true, permission: perm });
  } else {
    const garageObj = garagesDatabase.find(g => g.id === garageId);
    const newPerm = {
      id: `gcnp-${Date.now()}`,
      garageId,
      garageName: garageObj ? garageObj.name : `Garage ${garageId}`,
      userId: "1",
      allowServiceUpdates: true,
      allowInvoiceMessages: true,
      allowReminders: true,
      allowPromotions: false,
      blockedByUser: true,
      reportedSpam: true,
      dailyMessagesCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    garageCustomerNotificationPermissionsDatabase.push(newPerm);
    res.json({ success: true, permission: newPerm });
  }
});

// Update garage permissions
app.post("/api/telegram/update-garage-permissions", (req: Request, res: Response) => {
  const { garageId, allowServiceUpdates, allowInvoiceMessages, allowReminders, allowPromotions } = req.body;
  let perm = garageCustomerNotificationPermissionsDatabase.find(p => p.garageId === garageId);
  if (perm) {
    perm.allowServiceUpdates = allowServiceUpdates;
    perm.allowInvoiceMessages = allowInvoiceMessages;
    perm.allowReminders = allowReminders;
    perm.allowPromotions = allowPromotions;
    perm.updatedAt = new Date().toISOString();
  } else {
    const garageObj = garagesDatabase.find(g => g.id === garageId);
    perm = {
      id: `gcnp-${Date.now()}`,
      garageId,
      garageName: garageObj ? garageObj.name : `Garage ${garageId}`,
      userId: "1",
      allowServiceUpdates,
      allowInvoiceMessages,
      allowReminders,
      allowPromotions,
      blockedByUser: false,
      reportedSpam: false,
      dailyMessagesCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    garageCustomerNotificationPermissionsDatabase.push(perm);
  }
  res.json({ success: true, permission: perm });
});

// Simulate Telegram Bot Commands API
app.post("/api/telegram/simulate-bot-command", (req: Request, res: Response) => {
  const { text } = req.body;
  const rawMsg = (text || "").trim();
  const args = rawMsg.split(/\s+/);
  
  const formattedCommand = args[0]?.toLowerCase();
  const tokenArg = args[1];

  let replyText = "";
  
  if (formattedCommand === "/start") {
    if (tokenArg) {
      if (tokenArg === userNotificationSettingsDatabase.verificationToken || tokenArg === "KH-9901") {
        userNotificationSettingsDatabase.telegramConnected = true;
        userNotificationSettingsDatabase.telegramChatId = "88219034";
        userNotificationSettingsDatabase.telegramUsername = "@YeonPisith_Telegram";
        userNotificationSettingsDatabase.telegramConnectedAt = new Date().toISOString();
        
        telegramConnectionsDatabase.push({
          id: `tg_conn_${Date.now()}`,
          userId: "1",
          telegramChatId: "88219034",
          telegramUsername: "@YeonPisith_Telegram",
          connectionStatus: "Connected",
          verificationToken: tokenArg,
          connectedAt: new Date().toISOString(),
          disconnectedAt: null,
          lastMessageAt: new Date().toISOString()
        });

        replyText = `🎉 MyCar Care KH Bot connected successfully!\n\nYour user profile (Yeon Pisith) is now safely linked with Telegram Chat ID: 88219034.\n\nYou will receive diagnostics alerts, mileage logs, and garage service updates according to your preference cockpit! Type /status to view setup.`;
      } else {
        replyText = `❌ Linkage Token Invalid or Expired.\n\nPlease generate a fresh verification token inside App Settings > Connect Telegram and retry with /start [token].`;
      }
    } else {
      replyText = `🇰🇭 MyCar Care KH Bot\n\nWelcome!', Ready to monitor your vehicle's health.\n\nTo link your client profile, generate a token in the app's settings screen and reply with:\n/start [token]`;
    }
  } else if (formattedCommand === "/status") {
    if (userNotificationSettingsDatabase.telegramConnected) {
      replyText = `ℹ️ MyCar Care KH Configuration Status:\n\n• User Account: Yeon Pisith\n• Telegram Chat ID: 88219034\n• Status: Active & Connected🟢\n• Channel Alerts: ${userNotificationSettingsDatabase.telegramEnabled ? "Enabled ON" : "Disabled OFF"}\n• Maintenance Alerts: ${userNotificationSettingsDatabase.allowMaintenanceReminders ? "Allowed" : "Muted"}\n• Garage Updates: ${userNotificationSettingsDatabase.allowGarageServiceUpdates ? "Allowed" : "Muted"}\n• Promotions: ${userNotificationSettingsDatabase.allowGaragePromotions ? "Allowed" : "Muted"}\n\nType /off to temporarily pause Telegram logs.`;
    } else {
      replyText = `⚠ Bot Connection Status: Disconnected🔴\n\nPlease connect your profile via Settings first.`;
    }
  } else if (formattedCommand === "/on") {
    userNotificationSettingsDatabase.telegramEnabled = true;
    replyText = `🔔 MyCar Care KH Notifications: Enabled.\n\nYou will receive vehicle alarms, invoices, and service records in this chat.`;
  } else if (formattedCommand === "/off") {
    userNotificationSettingsDatabase.telegramEnabled = false;
    replyText = `🔕 MyCar Care KH Notifications: Disabled (Silent mode active).\n\nPreferences saved. Reactivate anytime by typing /on.`;
  } else if (formattedCommand === "/disconnect") {
    userNotificationSettingsDatabase.telegramConnected = false;
    userNotificationSettingsDatabase.telegramChatId = null;
    userNotificationSettingsDatabase.telegramUsername = null;
    userNotificationSettingsDatabase.telegramConnectedAt = null;
    
    replyText = `🗑 Pairing Removed successfully. Your Telegram Chat ID has been wiped from our system records. Connection status is now offline.`;
  } else if (formattedCommand === "/help") {
    replyText = `💡 Available Commands List:\n\n/start - Initiate linking\n/status - Check profile link & alert preferences\n/on - Enable Telegram notifications\n/off - Silence Telegram notifications\n/disconnect - Wipe chat ID pairing\n/help - Showing this help manual`;
  } else {
    replyText = `❓ Command unrecognized.\n\nType /help to review command configurations.`;
  }

  res.json({ reply: replyText, settings: userNotificationSettingsDatabase });
});

// Send custom or templated Garage Telegram message with comprehensive verification policies!
app.post("/api/telegram/garage-send", (req: Request, res: Response) => {
  const { garageId, templateType, customText } = req.body;
  
  // 0. Check if garage is suspended on the platform
  if (suspendedGaragesDatabase[garageId || "g1"]) {
    return res.status(403).json({ success: false, error: "ACCESS SUSPENDED: Your garage's outgoing messaging capability has been suspended by the platform Super Admin due to high report or spam complain rates." });
  }

  // 1. Is Telegram connected and enabled overall on user profile?
  if (!userNotificationSettingsDatabase.telegramConnected) {
    return res.status(400).json({ success: false, error: "Pre-condition fail: User has not connected a Telegram profile." });
  }
  if (!userNotificationSettingsDatabase.telegramEnabled) {
    return res.status(400).json({ success: false, error: "Pre-condition fail: User has disabled Telegram channels globally." });
  }

  // 2. Load relationship permissions
  const perm = garageCustomerNotificationPermissionsDatabase.find(p => p.garageId === garageId);
  const garageObj: any = garagesDatabase.find(g => g.id === garageId) || { name: "Connected Garage", phone: "+855 23 888 123" };

  // Anti-Spam Check: Blocked by user?
  if (perm && perm.blockedByUser) {
    return res.status(403).json({ success: false, error: `Access Denied: The customer has blocked messages from ${garageObj.name}.` });
  }

  // 3. Category capability checks
  let isAllowed = true;
  let categoryName = "Service Update";
  
  if (templateType === 'promotion') {
    isAllowed = userNotificationSettingsDatabase.allowGaragePromotions && (!perm || perm.allowPromotions);
    categoryName = "Promotion";
  } else if (templateType === 'service_update' || templateType === 'pickup') {
    isAllowed = userNotificationSettingsDatabase.allowGarageServiceUpdates && (!perm || perm.allowServiceUpdates);
    categoryName = "Service Updates";
  } else if (templateType === 'invoice' || templateType === 'payment') {
    isAllowed = userNotificationSettingsDatabase.allowInvoiceNotifications && (!perm || perm.allowInvoiceMessages);
    categoryName = "Invoice & Payments";
  } else if (templateType === 'quotation') {
    isAllowed = userNotificationSettingsDatabase.allowQuotationRequests;
    categoryName = "Quotations";
  } else if (templateType === 'reminder') {
    isAllowed = userNotificationSettingsDatabase.allowMaintenanceReminders && (!perm || perm.allowReminders);
    categoryName = "Reminders";
  }

  if (!isAllowed) {
    return res.status(403).json({ success: false, error: `Message Blocked: User preference settings prohibit receiving ${categoryName} categories.` });
  }

  // 4. Rate limiting logic: daily constraint of 5 messages
  const dateKey = new Date().toISOString().split('T')[0];
  const rateLimitKey = `${garageId}_${dateKey}`;
  const currCount = customTelegramMessagesSentCount[rateLimitKey] || 0;
  if (currCount >= 5) {
    return res.status(429).json({ success: false, error: "Rate limit reached: Maximum 5 custom message dispatches allowed per day per partner." });
  }

  // Compose message payload
  let msgContent = customText || "";
  if (!msgContent) {
    // Attempt to lookup templates
    const matchTemplate = garageMessageTemplatesDatabase.find(t => t.garageId === (garageId || "g1") && t.templateType === templateType && t.isActive);
    if (matchTemplate) {
      let tempBody = matchTemplate.messageBody;
      tempBody = tempBody.replace(/{customer}/g, "Yeon Pisith");
      tempBody = tempBody.replace(/{vehicle}/g, "Toyota Prius (2010)");
      tempBody = tempBody.replace(/{garage}/g, garageObj.name);
      tempBody = tempBody.replace(/{ticketId}/g, "TK-9281a");
      tempBody = tempBody.replace(/{status}/g, "Checked In & Diagnosed");
      tempBody = tempBody.replace(/{cost}/g, "45.00");
      tempBody = tempBody.replace(/{invoiceId}/g, "INV-2026-9042");
      tempBody = tempBody.replace(/{partName}/g, "Standard Synthetics Engine Oil");
      msgContent = tempBody;
    } else {
      if (templateType === 'pickup') {
        msgContent = `🏁 Vehicle Ready for Pickup!\n\nYour Toyota Tacoma Dual-Cab is fully serviced and passed all quality tests. Ready for dispatch at ${garageObj.name}.\n\nInvoice balance: $45.00. Thank you!`;
      } else if (templateType === 'service_update') {
        msgContent = `🔧 Service Status Update:\n\nToyota Tacoma has been placed on the diagnostics bay. Valve adjustments in progress. Expected completion: Today 5:30 PM.`;
      } else if (templateType === 'invoice') {
        msgContent = `🧾 Tax Invoice Created:\n\nInvoice #INV-2026-112 for $125.00 USD has been finalized at ${garageObj.name}.\nClick inside the MyCar App to complete payment.`;
      } else if (templateType === 'payment') {
        msgContent = `⏰ Payment Reminder:\n\nFriendly warning that Invoice #INV-2026-112 is still pending clearance. Please settle within 48h to avoid service holds.`;
      } else if (templateType === 'quotation') {
        msgContent = `📋 Quotation Approval Request:\n\nNew service estimate created for your brake overhaul ($75.05). Please click 'Approve' inside the MyCar App before we initiate repairs.`;
      } else if (templateType === 'reminder') {
        msgContent = `📅 Next Service Scheduled:\n\nYour next Synthetics Engine Oil filter change is suggested on 2026-08-15. Book early to secure your bay!`;
      } else if (templateType === 'promotion') {
        msgContent = `✨ Exclusive Promotion Alert!\n\nHeavy Monsoon rainy season checkup! Save 20% on all anti-rust structural coatings this month at ${garageObj.name}. (Optional unsubscribe in settings)`;
      } else {
        msgContent = `ℹ️ Alert Update from ${garageObj.name}. Contact details: ${garageObj.phone}.`;
      }
    }
  }

  // Log message dispatch to database
  customTelegramMessagesSentCount[rateLimitKey] = currCount + 1;
  if (perm) {
    perm.dailyMessagesCount = customTelegramMessagesSentCount[rateLimitKey];
  }

  const freshLog: NotificationLog = {
    id: `tg_log_${Date.now()}`,
    vehicleId: "v1",
    title: `Telegram Outbound: [${templateType.toUpperCase()}]`,
    message: msgContent,
    channel: "Telegram",
    status: "unread",
    sentAt: new Date().toISOString(),
    category: templateType === 'promotion' ? 'marketplace' : 'maintenance',
    priority: templateType === 'promotion' ? 'Low' : 'High',
    sourceType: "garage",
    garageId,
    garageName: garageObj.name
  };

  notificationLogsDatabase.unshift(freshLog);

  res.json({ success: true, message: "Telegram message dispatched!", log: freshLog });
});

// --- CUSTOM TEMPLATE & ADMIN MSG SUSPENSION APIS ---

// Get custom garage Telegram message templates
app.get("/api/telegram/garage-templates", (req: Request, res: Response) => {
  const { garageId } = req.query;
  if (garageId) {
    const filtered = garageMessageTemplatesDatabase.filter(t => t.garageId === garageId);
    return res.json(filtered);
  }
  res.json(garageMessageTemplatesDatabase);
});

// Create or Update custom garage Telegram template
app.post("/api/telegram/garage-templates", (req: Request, res: Response) => {
  const { id, garageId, templateName, templateType, messageBody } = req.body;
  if (id) {
    const index = garageMessageTemplatesDatabase.findIndex(t => t.id === id);
    if (index !== -1) {
      garageMessageTemplatesDatabase[index] = {
        ...garageMessageTemplatesDatabase[index],
        templateName: templateName || garageMessageTemplatesDatabase[index].templateName,
        templateType: templateType || garageMessageTemplatesDatabase[index].templateType,
        messageBody: messageBody || garageMessageTemplatesDatabase[index].messageBody,
        updatedAt: new Date().toISOString()
      };
      return res.json({ success: true, template: garageMessageTemplatesDatabase[index] });
    }
  }
  
  const newTmpl = {
    id: `g_tmpl_${Date.now()}`,
    garageId: garageId || "g1",
    templateName: templateName || "Custom Template",
    templateType: templateType || "service_update",
    messageBody: messageBody || "",
    isActive: true,
    createdByStaffId: "g1_owner",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  garageMessageTemplatesDatabase.push(newTmpl);
  res.json({ success: true, template: newTmpl });
});

// Admin endpoint: retrieve overall suspension & spam report list
app.get("/api/telegram/admin/suspension-status", (req: Request, res: Response) => {
  const reports = garageCustomerNotificationPermissionsDatabase.filter(p => p.reportedSpam || p.blockedByUser);
  const statusList = garagesDatabase.map(g => ({
    id: g.id,
    name: g.name,
    suspended: !!suspendedGaragesDatabase[g.id],
    spamReportCount: reports.filter(r => r.garageId === g.id && r.reportedSpam).length,
    blockCount: reports.filter(r => r.garageId === g.id && r.blockedByUser).length,
  }));
  res.json({ statusList, reports });
});

// Admin endpoint: toggle suspension status for a garage
app.post("/api/telegram/admin/toggle-suspension", (req: Request, res: Response) => {
  const { garageId, reason } = req.body;
  if (!garageId) {
    return res.status(400).json({ success: false, error: "garageId is required" });
  }
  const isSuspended = !!suspendedGaragesDatabase[garageId];
  suspendedGaragesDatabase[garageId] = !isSuspended;
  
  // Register auditing log
  const targetGarage = garagesDatabase.find(g => g.id === garageId) || { name: `Garage ${garageId}` };
  const freshAudit = {
    id: `audit_${Date.now()}`,
    action: suspendedGaragesDatabase[garageId] ? "GARAGE_SUSPENDED_MESSAGING" : "GARAGE_UNSUSPENDED_MESSAGING",
    details: `${suspendedGaragesDatabase[garageId] ? "Platform Block on OUTBOUND SMS/TG" : "Restored Platform outreach permissions"} for ${targetGarage.name}. Reason: ${reason || "Abuse Complaint Review"}`,
    target: targetGarage.name,
    adminName: "Super Admin",
    ipAddress: "192.168.1.100",
    timestamp: new Date().toISOString()
  };
  adminAuditLogs.unshift(freshAudit);

  res.json({ success: true, suspended: suspendedGaragesDatabase[garageId], audit: freshAudit });
});

// Get templates
app.get("/api/notifications/templates", (req: Request, res: Response) => {
  res.json(notificationTemplatesDatabase);
});

// Create a template
app.post("/api/notifications/templates", (req: Request, res: Response) => {
  const { title, message, category, priority, roleTarget } = req.body;
  const newTempl = {
    id: `templ-${Date.now()}`,
    title,
    message,
    category,
    priority: priority || 'Medium',
    roleTarget: roleTarget || 'all',
    createdAt: new Date().toISOString()
  };
  notificationTemplatesDatabase.push(newTempl);
  res.json(newTempl);
});

// Snooze notification
app.post("/api/notifications/:id/snooze", (req: Request, res: Response) => {
  const { id } = req.params;
  const { snoozeDays, snoozeMileage } = req.body;
  const index = notificationLogsDatabase.findIndex(n => n.id === id);
  if (index !== -1) {
    notificationLogsDatabase[index].status = 'snoozed';
    let snoozeMsg = `Snoozed for ${snoozeDays} days`;
    if (snoozeMileage) snoozeMsg += ` / ${snoozeMileage} km`;
    notificationLogsDatabase[index].message += ` (${snoozeMsg})`;
  }
  res.json({ success: true, notification: index !== -1 ? notificationLogsDatabase[index] : null });
});

// Approve notification proposal (QR Service or Suggestion)
app.post("/api/notifications/:id/approve", (req: Request, res: Response) => {
  const { id } = req.params;
  const index = notificationLogsDatabase.findIndex(n => n.id === id);
  if (index !== -1) {
    const notif = notificationLogsDatabase[index];
    notif.status = 'read';

    if (notif.relatedRecordData && notif.relatedRecordId?.startsWith('req-qr-')) {
      const { serviceCategory, description, cost, mileage, provider } = notif.relatedRecordData;
      const record = {
        id: `m-${Date.now()}`,
        vehicleId: notif.vehicleId || "v1",
        serviceCategory,
        description,
        cost: Number(cost),
        mileage: Number(mileage),
        date: new Date().toISOString().split('T')[0],
        provider
      };
      
      maintenanceRecords.push(record);
      
      // Update vehicle state
      const vehicleIdx = vehicles.findIndex(v => v.id === notif.vehicleId);
      if (vehicleIdx > -1) {
        if (Number(mileage) > vehicles[vehicleIdx].mileage) {
          vehicles[vehicleIdx].mileage = Number(mileage);
        }
        if (serviceCategory === "Engine Oil Service") {
          vehicles[vehicleIdx].lastOilChangeMileage = Number(mileage);
        }
        vehicles[vehicleIdx].lastServiceDate = new Date().toISOString().split('T')[0];
      }
    } else if (notif.relatedRecordData && notif.relatedRecordId?.startsWith('rem-sug-')) {
      const { title, category, dueDate, dueMileage, priority, description } = notif.relatedRecordData;
      const newRem = {
        id: `rem-${Date.now()}`,
        vehicleId: notif.vehicleId || "v1",
        service: title,
        title,
        category,
        reminderType: dueMileage ? 'date_and_mileage' : 'date_based',
        status: 'Good',
        reason: description,
        priority: priority || 'Medium',
        dueDate: dueDate || undefined,
        dueMileage: dueMileage ? Number(dueMileage) : undefined,
        isAiSuggested: false,
        createdAt: new Date().toISOString()
      };
      remindersDatabase.push(newRem as any);
    }
  }
  res.json({ success: true });
});

// Reject notification proposal
app.post("/api/notifications/:id/reject", (req: Request, res: Response) => {
  const { id } = req.params;
  const index = notificationLogsDatabase.findIndex(n => n.id === id);
  if (index !== -1) {
    notificationLogsDatabase[index].status = 'read';
    notificationLogsDatabase[index].message += " (Rejected by Owner)";
  }
  res.json({ success: true });
});

// Trigger dynamic scenario notifications
app.post("/api/notifications/trigger-event", (req: Request, res: Response) => {
  const { eventType, vehicleId, text, customTitle, customMessage } = req.body;
  
  const vehicle = vehicles.find(v => v.id === vehicleId) || vehicles[0] || { id: "v1", brand: "Toyota", model: "Tacoma", year: 2006, mileage: 180000 };
  const id = `notif-${Date.now()}`;
  let title = customTitle || "";
  let message = customMessage || text || "";
  let category = "maintenance";
  let priority: 'Low' | 'Medium' | 'High' | 'Critical' = "Medium";
  let sourceType: 'system' | 'garage' | 'admin' | 'user' | 'marketplace' | 'forum' = "system";
  let actionLabel = "";
  let actionUrl = "";
  let relatedRecordId = "";
  let relatedRecordData: any = null;

  switch (eventType) {
    case 'maintenance_due': // 1
      title = `🔧 Maintenance Due Soon: ${vehicle.brand} ${vehicle.model}`;
      message = message || `Your ${vehicle.brand} ${vehicle.model} is due for a scheduled 60-point inspection or vital fluid renewal within 500 km. Heavy dust in Phnom Penh can saturate filters faster.`;
      category = "maintenance";
      priority = "High";
      sourceType = "system";
      actionLabel = "Schedule Service";
      break;

    case 'custom_alarm': // 2
      title = title || `⏰ Manual Custom Alarm: Check Tires`;
      message = message || `Remind me to check tire treads and inflation pressure every weekend at 8:00 AM before driving.`;
      category = "custom";
      priority = "Medium";
      sourceType = "user";
      break;

    case 'garage_suggested': // 3
      title = `🛠️ Jet Garage: Post-Service Recommendation`;
      message = message || `Jet Garage suggests scheduled oil and filters check at 185,000 km or in 3 months for optimal valve protection.`;
      category = "garage";
      priority = "Medium";
      sourceType = "garage";
      actionLabel = "Approve Suggestion";
      relatedRecordId = `rem-sug-${Date.now()}`;
      relatedRecordData = {
        title: "Oil Change (Jet Garage Suggestion)",
        category: "Engine Oil Change",
        dueDate: new Date(Date.now() + 90 * 24 * 3600 * 1000).toISOString().split('T')[0],
        dueMileage: (vehicle.mileage || 180000) + 5000,
        priority: "Medium",
        description: "Post-service engine health protection suggested by verified technician."
      };
      break;

    case 'qr_code_scanned': // 4
      title = `📱 QR Service Record Proposal: Jet Garage`;
      message = message || `Jet Garage scanned your vehicle QR code and proposed logging an Engine Oil Service & brake pads check.`;
      category = "garage";
      priority = "High";
      sourceType = "garage";
      actionLabel = "Approve Record";
      relatedRecordId = `req-qr-${Date.now()}`;
      relatedRecordData = {
        serviceCategory: "Engine Oil Service",
        description: "Premium synthetic oil swap, oil filter renewal, and front caliper wash.",
        cost: 45,
        mileage: (vehicle.mileage || 180000),
        provider: "Jet Garage Phnom Penh"
      };
      break;

    case 'global_risk': // 5
      title = `⚠️ Vehicle Model DNA Risk Advisory`;
      message = message || `This is a risk awareness alert based on vehicle model/year data. Your 2006 Tacoma year range has historical high wear risk on front lower ball joints and severe underbody dust rust in coastal/flooded regions. Please confirm any squeaking sound with a qualified mechanic.`;
      category = "safety";
      priority = "High";
      sourceType = "system";
      actionLabel = "Check DNA Report";
      break;

    case 'recall_alert': // 6
      title = `🛑 CRITICAL: Takata Airbag Safety Recall Alert`;
      message = message || `Safety Alert: Your vehicle model/year is affected by an airbag recall. This recall may not apply to your specific physical unit. Please verify using your VIN search tool.`;
      category = "safety";
      priority = "Critical";
      sourceType = "system";
      actionLabel = "Check Recalls";
      break;

    case 'booking_update': // 7
      title = `📅 Appointment Confirmed: Premier Angkor Garage`;
      message = message || `Your booking for a full brake rotor replacement on tomorrow at 9:00 AM matches slot booking #A7091. See you soon!`;
      category = "booking";
      priority = "High";
      sourceType = "garage";
      actionLabel = "View Booking";
      break;

    case 'service_status': // 8
      title = `🚗 Service Status Update: Waiting for Approval`;
      message = message || `ABC Garage detected worn front brake pads (current 2mm remaining thickness) during inspection. Estimate: $45. Please review and approve estimated expense before work starts.`;
      category = "garage";
      priority = "High";
      sourceType = "garage";
      actionLabel = "Review Proposal";
      relatedRecordId = `prop-${Date.now()}`;
      break;

    case 'marketplace_offer': // 9
      title = `🏷️ Parts Marketplace: New Offer Received!`;
      message = message || `You received a matching barter offer for the 'Toyota Hilux Starter Motor' listing. Respondent offers a swap for a compatible air filter.`;
      category = "marketplace";
      priority = "Medium";
      sourceType = "marketplace";
      actionLabel = "View Offer";
      break;

    case 'forum_reply': // 10
      title = `💬 Community Forum: Reply on Jeep 1990 Help Post`;
      message = message || `A verified local Jeep mechanic left a reply: 'I have a spare refurbished AMC carburetor in my garage in Tuol Kouk.' Check details.`;
      category = "forum";
      priority = "Medium";
      sourceType = "forum";
      actionLabel = "View Discussion";
      break;

    case 'admin_broadcast': // 11
      title = title || `📢 City Road Flooding Flash Warning`;
      message = message || `Heavy downpour in Phnom Penh has caused high water pooling around Russian Blvd. Avoid driving if possible or inspect electrical brakes soon after.`;
      category = "admin";
      priority = "Critical";
      sourceType = "admin";
      break;

    case 'weather_alert': // 12
      title = `🌧️ Monsoon Safety Alert: Rainy Season Check`;
      message = message || `Cambodia Rainy Season Advisory: Please inspect tire tread depth (~1.6mm minimum), wiper blades, and auxiliary lights to maximize visibility on slippery tarmac roads.`;
      category = "admin";
      priority = "High";
      sourceType = "admin";
      actionLabel = "View Safety Guide";
      break;

    default:
      title = customTitle || "💡 Alert Center Bulletin";
      category = "maintenance";
      priority = "Low";
      sourceType = "system";
  }

  const newLog: NotificationLog = {
    id,
    vehicleId: vehicle.id,
    title,
    message,
    channel: 'In-App',
    status: 'unread',
    sentAt: new Date().toISOString(),
    category,
    priority,
    sourceType,
    actionLabel: actionLabel || undefined,
    actionUrl: actionUrl || undefined,
    relatedRecordId: relatedRecordId || undefined,
    relatedRecordData: relatedRecordData || undefined
  };

  notificationLogsDatabase.unshift(newLog);
  res.json({ success: true, notification: newLog });
});

// Post a new maintenance record
app.post("/api/maintenance", async (req: Request, res: Response) => {
  const { vehicleId, serviceCategory, description, cost, mileage, date, provider } = req.body;
  if (!vehicleId || !serviceCategory || cost === undefined || mileage === undefined) {
    return res.status(400).json({ error: "Missing required fields for record" });
  }

  const record: MaintenanceRecord = {
    id: `m-${Date.now()}`,
    vehicleId,
    serviceCategory,
    description: description || `Standard ${serviceCategory} service logged.`,
    cost: Number(cost),
    mileage: Number(mileage),
    date: date || new Date().toISOString().split('T')[0],
    provider: provider || "Unspecified Service Station"
  };

  try {
    await insertMaintenance({
      id: record.id,
      vehicleId: record.vehicleId,
      serviceCategory: record.serviceCategory,
      description: record.description,
      cost: record.cost,
      mileage: record.mileage,
      date: record.date,
      provider: record.provider
    });
  } catch (err) {
    console.error("Failed to insert maintenance log to Cloud SQL:", err);
  }

  maintenanceRecords.push(record);

  // Update original vehicle mileage & last service data
  const vehicleIdx = vehicles.findIndex(v => v.id === vehicleId);
  if (vehicleIdx > -1) {
    // If logged mileage is higher, update active mileage
    if (Number(mileage) > vehicles[vehicleIdx].mileage) {
      vehicles[vehicleIdx].mileage = Number(mileage);
    }
    if (serviceCategory === "Engine Oil Service") {
      vehicles[vehicleIdx].lastOilChangeMileage = Number(mileage);
    }
    vehicles[vehicleIdx].lastServiceDate = date || new Date().toISOString().split('T')[0];
  }

  res.json(record);
});

// Delete a record
app.delete("/api/maintenance/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  maintenanceRecords = maintenanceRecords.filter(m => m.id !== id);
  res.json({ success: true });
});

// Get Phnom Penh garages list
app.get("/api/garages", (req: Request, res: Response) => {
  res.json(garagesDatabase);
});

// ----------------------------------------------------
// MYCAR HELP FORUM REST API ENDPOINTS
// ----------------------------------------------------

// 1. Get all forum posts with search & filtering
app.get("/api/forum/posts", (req: Request, res: Response) => {
  const { search, category, status, brand, model, urgency } = req.query;
  let results = [...forumPostsDatabase];

  if (search) {
    const s = String(search).toLowerCase();
    results = results.filter(
      p =>
        p.title.toLowerCase().includes(s) ||
        p.description.toLowerCase().includes(s) ||
        p.vehicleModel.toLowerCase().includes(s) ||
        p.vehicleBrand.toLowerCase().includes(s)
    );
  }

  if (category) {
    results = results.filter(p => p.category === category);
  }

  if (status) {
    results = results.filter(p => p.status === status);
  }

  if (brand) {
    results = results.filter(p => p.vehicleBrand.toLowerCase() === String(brand).toLowerCase());
  }

  if (urgency) {
    results = results.filter(p => p.urgency === urgency);
  }

  res.json(results);
});

// 2. Get a single post
app.get("/api/forum/posts/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const post = forumPostsDatabase.find(p => p.id === id);
  if (!post) {
    return res.status(404).json({ error: "Forum post not found" });
  }
  res.json(post);
});

// 3. Create a new forum post with dynamic AI helper suggestions
app.post("/api/forum/posts", async (req: Request, res: Response) => {
  const {
    title,
    description,
    vehicleBrand,
    vehicleModel,
    vehicleYear,
    engineType,
    mileage,
    category,
    location,
    urgency,
    needMechanic,
    needRecommendation,
    needSparePart,
    budget,
    preferredDate,
    visibility,
    authorName,
    authorRole
  } = req.body;

  if (!title || !description || !vehicleBrand || !vehicleModel) {
    return res.status(400).json({ error: "Missing required post parameters." });
  }

  const postId = `fp-${Date.now()}`;
  const newPost: ForumPost = {
    id: postId,
    title,
    description,
    vehicleBrand,
    vehicleModel,
    vehicleYear: Number(vehicleYear) || 2010,
    engineType: engineType || "Unspecified",
    mileage: mileage ? Number(mileage) : undefined,
    category: category || "Other Engine Problem",
    location: location || "Phnom Penh",
    urgency: urgency || "Low",
    needMechanic: !!needMechanic,
    needRecommendation: !!needRecommendation,
    needSparePart: !!needSparePart,
    budget: budget || "",
    preferredDate: preferredDate || "",
    visibility: visibility || "Public",
    status: needMechanic ? "Mechanic Needed" : needSparePart ? "Spare Part Needed" : "Open",
    authorId: activeProfile.id === 1 ? "user-owner-1" : `author-${Date.now()}`,
    authorName: authorName || activeProfile.name,
    authorRole: authorRole || activeProfile.role,
    createdAt: new Date().toISOString(),
    upvotes: 0,
    comments: []
  };

  // Generate automated AI Suggestions using Gemini!
  const client = getGeminiClient();
  const brandFull = `${newPost.vehicleBrand} ${newPost.vehicleModel} ${newPost.vehicleYear}`;
  
  if (client) {
    try {
      console.log(`[Help Forum] Querying Gemini for automated AI analysis of new post: "${title}"`);
      const aiPrompt = `You are the MyCar Help Forum Advisor. Provide automated auxiliary guidance for a newly submitted vehicle problem post.
      Post Title: "${title}"
      Description: "${description}"
      Vehicle Specifications: ${brandFull} (Engine: ${newPost.engineType}, Mileage: ${newPost.mileage || "unspecified"} km)
      Category Selected: ${newPost.category}
      Urgency Level: ${newPost.urgency}
      
      Suggest:
      1. A slightly rewritten, polished post title for clarity.
      2. 2-3 potential diagnostic categories.
      3. 3-4 possible causes considering Cambodia's hot/humid/dusty conditions.
      4. 2-3 safe checking steps for a non-technical car owner.
      5. A clear safety warning.
      
      Respond in strict JSON with schema matching:
      {
        "suggestedTitle": "Polished title string",
        "suggestedCategories": ["Category A", "Category B"],
        "possibleCauses": ["Cause A", "Cause B", ...],
        "suggestedChecks": ["Visual check step A", ...],
        "safetyWarning": "Warning string text"
      }`;

      const aiRes = await generateContentWithRetry(client, {
        model: "gemini-3.5-flash",
        contents: aiPrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              suggestedTitle: { type: Type.STRING },
              suggestedCategories: { type: Type.ARRAY, items: { type: Type.STRING } },
              possibleCauses: { type: Type.ARRAY, items: { type: Type.STRING } },
              suggestedChecks: { type: Type.ARRAY, items: { type: Type.STRING } },
              safetyWarning: { type: Type.STRING }
            },
            required: ["suggestedTitle", "suggestedCategories", "possibleCauses", "suggestedChecks", "safetyWarning"]
          }
        }
      });

      if (aiRes && aiRes.text) {
        const parsed = JSON.parse(aiRes.text.trim());
        newPost.aiSuggestion = {
          suggestedTitle: parsed.suggestedTitle,
          suggestedCategories: parsed.suggestedCategories,
          possibleCauses: parsed.possibleCauses,
          suggestedChecks: parsed.suggestedChecks,
          safetyWarning: parsed.safetyWarning,
          similarCasesFound: [
            `Similar ${newPost.vehicleBrand} starting system checkouts`,
            `How to safely clean sensor contacts on ${newPost.vehicleYear} build`
          ]
        };
      }
    } catch (e) {
      console.error("[Help Forum] Gemini automatic recommendation failed:", e);
    }
  }

  // Fallback AI suggestions if Gemini offline
  if (!newPost.aiSuggestion) {
    newPost.aiSuggestion = {
      suggestedTitle: `${newPost.vehicleBrand} ${newPost.vehicleModel} (${newPost.vehicleYear}) starting error validation`,
      suggestedCategories: [newPost.category, "Electrical System"],
      possibleCauses: [
        "Weak car battery or degraded alternator connection",
        "Moisture inside starter connectors due to monsoon rain puddles",
        "Spark plug combustion chamber ignition decay"
      ],
      suggestedChecks: [
        "Check battery dashboard indicator light and test battery charge with a multimeter if possible",
        "Visually inspect engine underhood wire linkages for structural breaks"
      ],
      safetyWarning: "Ensure vehicle handbrake is fully pulled up before performing physical structural checks.",
      similarCasesFound: [
        `Common starter motor repair guide for ${newPost.vehicleBrand}`,
        "Troubleshooting electrical wiring failure in Cambodia tropical humidity"
      ]
    };
  }

  forumPostsDatabase.unshift(newPost);

  // Trigger global mock notification to the owner group or following list
  notificationLogsDatabase.unshift({
    id: `notif-forum-${Date.now()}`,
    title: `📝 Help Forum Post Published`,
    message: `Your car problem "${newPost.title}" has been shared with the MyCar Care community. Verified mechanics and AI advisor are reviewing it now.`,
    channel: "In-App",
    status: "unread",
    sentAt: new Date().toISOString()
  });

  res.status(201).json(newPost);
});

// 4. Post a comment / reply to a problem post
app.post("/api/forum/posts/:id/comments", (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    content,
    authorName,
    authorRole,
    authorBadge,
    commentType,
    partName,
    partCondition,
    partCompatibility,
    price,
    deliveryTime,
    warranty,
    supplierContact
  } = req.body;

  if (!content) {
    return res.status(400).json({ error: "Comment content cannot be empty." });
  }

  const postIndex = forumPostsDatabase.findIndex(p => p.id === id);
  if (postIndex === -1) {
    return res.status(404).json({ error: "Post not found" });
  }

  const commentId = `fc-${Date.now()}`;
  const newComment: ForumComment = {
    id: commentId,
    postId: id,
    authorId: `auth-cmt-${Date.now()}`,
    authorName: authorName || activeProfile.name,
    authorRole: authorRole || "Normal User",
    authorBadge: authorBadge || (authorRole === "Verified Mechanic" ? "Community Expert" : undefined),
    content,
    timestamp: new Date().toISOString(),
    upvotes: 0,
    commentType: commentType || "General",
    partName,
    partCondition,
    partCompatibility,
    price: price ? Number(price) : undefined,
    deliveryTime,
    warranty,
    supplierContact
  };

  forumPostsDatabase[postIndex].comments.push(newComment);

  // Shift status
  const post = forumPostsDatabase[postIndex];
  if (post.status === "Open") {
    post.status = "Waiting for Answer";
  }

  if (commentType === "Mechanic Offer" || commentType === "Technical Solution") {
    if (post.status === "Mechanic Needed" || post.status === "Waiting for Answer") {
      post.status = "Quotation Received";
    }
  }

  if (commentType === "Spare-part Offer" && post.needSparePart) {
    post.status = "Quotation Received";
  }

  // Trigger push/in-app alert
  notificationLogsDatabase.unshift({
    id: `notif-reply-${Date.now()}`,
    title: `💬 New Forum Reply on "${post.title.substring(0, 30)}..."`,
    message: `${newComment.authorName} (${newComment.authorRole}) replied: "${content.substring(0, 60)}..."`,
    channel: "In-App",
    status: "unread",
    sentAt: new Date().toISOString()
  });

  res.status(201).json(post);
});

// 5. Upvote a forum post
app.post("/api/forum/posts/:id/upvote", (req: Request, res: Response) => {
  const { id } = req.params;
  const postIndex = forumPostsDatabase.findIndex(p => p.id === id);
  if (postIndex === -1) {
    return res.status(404).json({ error: "Post not found" });
  }
  forumPostsDatabase[postIndex].upvotes += 1;
  res.json({ success: true, upvotes: forumPostsDatabase[postIndex].upvotes });
});

// 6. Upvote a comment
app.post("/api/forum/posts/:postId/comments/:commentId/upvote", (req: Request, res: Response) => {
  const { postId, commentId } = req.params;
  const postIndex = forumPostsDatabase.findIndex(p => p.id === postId);
  if (postIndex === -1) {
    return res.status(404).json({ error: "Post not found" });
  }
  const commentIndex = forumPostsDatabase[postIndex].comments.findIndex(c => c.id === commentId);
  if (commentIndex === -1) {
    return res.status(404).json({ error: "Comment not found" });
  }
  forumPostsDatabase[postIndex].comments[commentIndex].upvotes += 1;
  res.json({ success: true, upvotes: forumPostsDatabase[postIndex].comments[commentIndex].upvotes });
});

// 7. Settle & Mark Forum Post as Solved (Saves to maintenance history)
app.post("/api/forum/posts/:id/accept-solution", (req: Request, res: Response) => {
  const { id } = req.params;
  const { commentId, resolvedNote, resolvedCost, resolvedGarage, resolvedPartUsed, saveToHistory } = req.body;

  const postIndex = forumPostsDatabase.findIndex(p => p.id === id);
  if (postIndex === -1) {
    return res.status(404).json({ error: "Post not found" });
  }

  const post = forumPostsDatabase[postIndex];
  post.status = "Solved";
  post.acceptedCommentId = commentId;
  post.resolvedNote = resolvedNote || "Resolved through community advice.";
  post.resolvedCost = resolvedCost ? Number(resolvedCost) : 0;
  post.resolvedGarage = resolvedGarage || "Angkor Diagnostics Center";
  post.resolvedPartUsed = resolvedPartUsed || "None";

  // If commentId supplied, mark it helpful/accepted
  if (commentId) {
    const commentIndex = post.comments.findIndex(c => c.id === commentId);
    if (commentIndex !== -1) {
      post.comments[commentIndex].isHelpful = true;
    }
  }

  // Save to user vehicle history if requested
  if (saveToHistory) {
    const record: MaintenanceRecord = {
      id: `m-forum-${Date.now()}`,
      vehicleId: "v1", // Link to default user vehicle Tacoma
      serviceCategory: post.category || "Full Inspection",
      description: `Forum Solved: "${post.title}". Owner Note: ${post.resolvedNote}. spare part: ${post.resolvedPartUsed}`,
      cost: Number(post.resolvedCost),
      mileage: post.mileage ? Number(post.mileage) : 180000,
      date: new Date().toISOString().split('T')[0],
      provider: post.resolvedGarage
    };

    maintenanceRecords.push(record);

    // Update vehicle last service date and mileage
    const vehicleIdx = vehicles.findIndex(v => v.id === record.vehicleId);
    if (vehicleIdx > -1) {
      if (record.mileage > vehicles[vehicleIdx].mileage) {
        vehicles[vehicleIdx].mileage = record.mileage;
      }
      vehicles[vehicleIdx].lastServiceDate = record.date;
    }
  }

  // Notification of successful solution
  notificationLogsDatabase.unshift({
    id: `notif-resolved-${Date.now()}`,
    title: `🎉 Thread Marked Solved: "${post.title.substring(0, 30)}..."`,
    message: `Issue solved and cached. Cost associated: $${post.resolvedCost} USD saved securely.`,
    channel: "In-App",
    status: "unread",
    sentAt: new Date().toISOString()
  });

  res.json({ success: true, post });
});

// 8. Dynamic AI Diagnosis request for any post
app.post("/api/forum/posts/:id/ai-re-diagnose", async (req: Request, res: Response) => {
  const { id } = req.params;
  const post = forumPostsDatabase.find(p => p.id === id);
  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }

  const client = getGeminiClient();
  if (client) {
    try {
      const complexPrompt = `Perform a deeper diagnostic analysis of this vehicle problem post and community answers.
      Issue: "${post.title}"
      Description: "${post.description}"
      Vehicle: ${post.vehicleBrand} ${post.vehicleModel} ${post.vehicleYear}
      Category: ${post.category}
      Urgency: ${post.urgency}
      
      Replies from experts to consider:
      ${JSON.stringify(post.comments.map(c => ({ author: c.authorName, role: c.authorRole, content: c.content })))}
      
      Generate detailed advice:
      1. Suggested modified title for clarity.
      2. Comprehensive possible causes (Monsoon moisture, high wear, battery decay).
      3. Precise diagnostic questions or visual reviews.
      4. Crucial tropical safety warnings for Cambodia drivers.
      
      Respond in strict JSON with schema matching:
      {
        "suggestedTitle": "Title string",
        "suggestedCategories": ["Category A", "Category B"],
        "possibleCauses": ["Detailed cause 1", "Detailed cause 2", ...],
        "suggestedChecks": ["Visual check step 1", "Visual check step 2", ...],
        "safetyWarning": "Precise safety warning string text"
      }`;

      const aiRes = await generateContentWithRetry(client, {
        model: "gemini-3.5-flash",
        contents: complexPrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              suggestedTitle: { type: Type.STRING },
              suggestedCategories: { type: Type.ARRAY, items: { type: Type.STRING } },
              possibleCauses: { type: Type.ARRAY, items: { type: Type.STRING } },
              suggestedChecks: { type: Type.ARRAY, items: { type: Type.STRING } },
              safetyWarning: { type: Type.STRING }
            },
            required: ["suggestedTitle", "suggestedCategories", "possibleCauses", "suggestedChecks", "safetyWarning"]
          }
        }
      });

      if (aiRes && aiRes.text) {
        const parsed = JSON.parse(aiRes.text.trim());
        post.aiSuggestion = {
          suggestedTitle: parsed.suggestedTitle,
          suggestedCategories: parsed.suggestedCategories,
          possibleCauses: parsed.possibleCauses,
          suggestedChecks: parsed.suggestedChecks,
          safetyWarning: parsed.safetyWarning,
          similarCasesFound: [
            `How to solve ${post.vehicleBrand} starter systems breakdown`,
            `Diagnosing thermal air flow valve failures in Cambodian heat`
          ]
        };
        return res.json({ success: true, aiSuggestion: post.aiSuggestion });
      }
    } catch (e: any) {
      console.error("[Help Forum] Custom AI recheck failed:", e.message);
    }
  }

  // Fallback if AI fail
  res.json({ success: true, aiSuggestion: post.aiSuggestion });
});

// ----------------------------------------------------
// MYCAR SPARE PARTS CLASSIFIEDS & MARKETPLACE API ENDPOINTS
// ----------------------------------------------------

// 1. Get all parts listings with search & filters
app.get("/api/classifieds/listings", (req: Request, res: Response) => {
  const { search, category, postType, condition, location, sellerType, maxPrice, status, brand } = req.query;
  let results = [...classifiedListingsDatabase];

  // Exclude suspended/expired by default unless admin or filtered by status
  if (!status) {
    results = results.filter(p => p.status === "Active" || p.status === "Pending Approval");
  } else {
    results = results.filter(p => p.status === status);
  }

  if (search) {
    const s = String(search).toLowerCase();
    results = results.filter(
      p =>
        p.title.toLowerCase().includes(s) ||
        p.description.toLowerCase().includes(s) ||
        (p.partNumber && p.partNumber.toLowerCase().includes(s)) ||
        p.vehicleModel.toLowerCase().includes(s) ||
        p.vehicleBrand.toLowerCase().includes(s)
    );
  }

  if (category) {
    results = results.filter(p => p.category === String(category));
  }

  if (postType) {
    results = results.filter(p => p.postType === String(postType));
  }

  if (condition) {
    results = results.filter(p => p.condition === String(condition));
  }

  if (location) {
    results = results.filter(p => p.location.toLowerCase() === String(location).toLowerCase());
  }

  if (sellerType) {
    results = results.filter(p => p.sellerType === String(sellerType));
  }

  if (brand) {
    results = results.filter(p => p.vehicleBrand.toLowerCase() === String(brand).toLowerCase());
  }

  if (maxPrice) {
    const pricing = Number(maxPrice);
    if (!isNaN(pricing)) {
      results = results.filter(p => (p.price || 0) <= pricing);
    }
  }

  // Put boosted listings at the very top!
  results.sort((a, b) => {
    if (a.isBoosted && !b.isBoosted) return -1;
    if (!a.isBoosted && b.isBoosted) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  res.json(results);
});

// 2. Get single listing & increment view views
app.get("/api/classifieds/listings/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const index = classifiedListingsDatabase.findIndex(l => l.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Listing not found" });
  }
  
  // Increment view count
  classifiedListingsDatabase[index].views += 1;
  res.json(classifiedListingsDatabase[index]);
});

// 3. Create a new classified part listing
app.post("/api/classifieds/listings", async (req: Request, res: Response) => {
  const {
    title,
    description,
    postType,
    category,
    vehicleBrand,
    vehicleModel,
    yearRange,
    engineType,
    partNumber,
    condition,
    price,
    negotiable,
    donationOption,
    exchangeOption,
    exchangeDetails,
    location,
    photos,
    videos,
    contactName,
    contactPhone,
    contactTelegram,
    sellerType,
    requiredProofPhotoUpload
  } = req.body;

  if (!title || !postType || !category || !vehicleBrand || !vehicleModel || !condition || !location) {
    return res.status(400).json({ error: "Missing required listing payload fields." });
  }

  const listId = `part-${Date.now()}`;
  const newListing: PartListing = {
    id: listId,
    title,
    description: description || "No Description provided.",
    postType,
    category,
    vehicleBrand,
    vehicleModel,
    yearRange: yearRange || "Any",
    engineType,
    partNumber,
    condition,
    price: price ? Number(price) : 0,
    negotiable: !!negotiable,
    donationOption: !!donationOption,
    exchangeOption: !!exchangeOption,
    exchangeDetails: exchangeDetails || "",
    location,
    photos: photos && photos.length > 0 ? photos : [],
    videos: videos && videos.length > 0 ? videos : [],
    comments: [],
    contactName: contactName || activeProfile.name,
    contactPhone: contactPhone || activeProfile.phone,
    contactTelegram: contactTelegram || "",
    sellerType: sellerType || (activeProfile.role === "Garage Owner" ? "Garage" : "Owner"),
    verifiedSeller: activeProfile.id === 1 ? true : false,
    availabilityStatus: "In Stock",
    status: "Active", // Live classified immediately, or pending if flagged
    views: 0,
    offerCount: 0,
    createdAt: new Date().toISOString(),
    isBoosted: false,
    requiredProofPhotoUpload: !!requiredProofPhotoUpload
  };

  // Run Gemini AI Analysis for Compatibility comments, pricing ranges, and fraud check
  const client = getGeminiClient();
  if (client) {
    try {
      console.log(`[Classifieds AI] Running automatic evaluation for: "${title}"`);
      const aiPrompt = `You are the MyCar Parts Marketplace Safety & Compatibility Advisor. Run calculations on a newly submitted spare parts listing.
      Listing Title: "${title}"
      Category: ${category}
      Description: "${description}"
      Target Vehicle: ${vehicleBrand} ${vehicleModel} (Year Range: ${yearRange}, Engine: ${engineType || "Any"}, PartNumber: ${partNumber || "N/A"})
      Condition: ${condition}
      Price Quoted: $${price || 0} USD
      Post Type: ${postType}
      
      Determine:
      1. Compatibility Verification Comment: Provide a 1-sentence technical instruction on what vehicles this fits or any key installation pitfall (heat, seals, monsoon corrosion).
      2. Suggested Market Range value: Price estimate range in USD or state "Free Donation" if postType starts with Donate.
      3. Fraud/Suspicion Meter: Return a boolean "isSuspicious" if price is absurd, or if description points to stolen catalogs, wire transfer scam signals, or duplicate listings.

      Respond in strict JSON:
      {
        "aiCompatibilityComment": "Write comment here",
        "aiSuggestedPriceRange": "$X - $Y USD",
        "isSuspicious": false
      }`;

      const aiRes = await generateContentWithRetry(client, {
        model: "gemini-3.5-flash",
        contents: aiPrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              aiCompatibilityComment: { type: Type.STRING },
              aiSuggestedPriceRange: { type: Type.STRING },
              isSuspicious: { type: Type.BOOLEAN }
            },
            required: ["aiCompatibilityComment", "aiSuggestedPriceRange", "isSuspicious"]
          }
        }
      });

      if (aiRes && aiRes.text) {
        const parsed = JSON.parse(aiRes.text.trim());
        newListing.aiCompatibilityComment = parsed.aiCompatibilityComment;
        newListing.aiSuggestedPriceRange = parsed.aiSuggestedPriceRange;
        if (parsed.isSuspicious) {
          newListing.status = "Pending Approval"; // Flag suspicious listings immediately!
        }
      }
    } catch (err: any) {
      console.error("[Classifieds AI] Gemini inspection error:", err.message);
    }
  }

  // Fallbacks if AI offline or failed
  if (!newListing.aiCompatibilityComment) {
    newListing.aiCompatibilityComment = `Compatible with general ${vehicleBrand} ${vehicleModel} (${yearRange}) setups. Always match the serial part number before exchange.`;
  }
  if (!newListing.aiSuggestedPriceRange) {
    newListing.aiSuggestedPriceRange = price ? `$${Math.round(price * 0.8)} - $${Math.round(price * 1.2)} USD` : "Varies";
  }

  classifiedListingsDatabase.unshift(newListing);

  // Send system alert notifications on success
  notificationLogsDatabase.unshift({
    id: `notif-classified-${Date.now()}`,
    title: `📦 Part Marketplace Listing Live`,
    message: `Your spare part classified "${title}" is now active in ${location}. AI advisor value: ${newListing.aiSuggestedPriceRange}. Status: ${newListing.status}`,
    channel: "In-App",
    status: "unread",
    sentAt: new Date().toISOString()
  });

  res.status(201).json(newListing);
});

// 4. Boost a listing (monetization feature)
app.post("/api/classifieds/listings/:id/boost", (req: Request, res: Response) => {
  const { id } = req.params;
  const index = classifiedListingsDatabase.findIndex(l => l.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Listing not found" });
  }

  classifiedListingsDatabase[index].isBoosted = true;

  notificationLogsDatabase.unshift({
    id: `notif-boosted-${Date.now()}`,
    title: `⚡ Listing Boosted successfully!`,
    message: `Your classified "${classifiedListingsDatabase[index].title}" has been promoted to the top of Cambodia's parts feed.`,
    channel: "In-App",
    status: "unread",
    sentAt: new Date().toISOString()
  });

  res.json({ success: true, listing: classifiedListingsDatabase[index] });
});

// 5. Submit offer on a listing
app.post("/api/classifieds/listings/:id/offers", (req: Request, res: Response) => {
  const { id } = req.params;
  const { offerType, amount, exchangeDetails, contactName, contactPhone, contactTelegram, notes } = req.body;

  const listingIndex = classifiedListingsDatabase.findIndex(l => l.id === id);
  if (listingIndex === -1) {
    return res.status(404).json({ error: "Listing not found" });
  }

  const listing = classifiedListingsDatabase[listingIndex];
  const offerId = `p-off-${Date.now()}`;
  const newOffer: PartOffer = {
    id: offerId,
    listingId: id,
    listingTitle: listing.title,
    offerType: offerType || "Buy For Cash",
    amount: amount ? Number(amount) : undefined,
    exchangeDetails,
    contactName: contactName || activeProfile.name,
    contactPhone: contactPhone || activeProfile.phone,
    contactTelegram,
    notes,
    status: "Pending",
    createdAt: new Date().toISOString()
  };

  partOffersDatabase.unshift(newOffer);
  listing.offerCount += 1;

  // Notification matching transaction flow
  notificationLogsDatabase.unshift({
    id: `notif-offer-${Date.now()}`,
    title: `🤝 New Proposal on "${listing.title.substring(0, 30)}..."`,
    message: `${newOffer.contactName} submitted a ${newOffer.offerType}: ${amount ? "$" + amount + " USD" : exchangeDetails || "Donation Request"}.`,
    channel: "In-App",
    status: "unread",
    sentAt: new Date().toISOString()
  });

  res.status(201).json(newOffer);
});

// 6. Get all offers for a specific listing
app.get("/api/classifieds/listings/:id/offers", (req: Request, res: Response) => {
  const { id } = req.params;
  const offers = partOffersDatabase.filter(o => o.listingId === id);
  res.json(offers);
});

// 6b. Post comment on a listing with optional photo attachment
app.post("/api/classifieds/listings/:id/comments", (req: Request, res: Response) => {
  const { id } = req.params;
  const { authorName, content, photoUrl } = req.body;

  if (!authorName || !content) {
    return res.status(400).json({ error: "Author name and content are required." });
  }

  const listingIndex = classifiedListingsDatabase.findIndex(l => l.id === id);
  if (listingIndex === -1) {
    return res.status(404).json({ error: "Listing not found" });
  }

  const listing = classifiedListingsDatabase[listingIndex];
  if (!listing.comments) {
    listing.comments = [];
  }

  const newComment: PartComment = {
    id: `p-comm-${Date.now()}`,
    listingId: id,
    authorName,
    content,
    photoUrl: photoUrl || undefined,
    createdAt: new Date().toISOString()
  };

  listing.comments.push(newComment);
  res.status(201).json(newComment);
});

// 7. Update offer status (Accept/Decline) & auto close listing if accepted
app.post("/api/classifieds/listings/:id/offers/:offerId/status", (req: Request, res: Response) => {
  const { id, offerId } = req.params;
  const { status, saveToHistory, serviceGarage, serviceCost } = req.body;

  const listingIndex = classifiedListingsDatabase.findIndex(l => l.id === id);
  if (listingIndex === -1) {
    return res.status(404).json({ error: "Listing not found" });
  }

  const offerIndex = partOffersDatabase.findIndex(o => o.id === offerId);
  if (offerIndex === -1) {
    return res.status(404).json({ error: "Offer not found" });
  }

  const listing = classifiedListingsDatabase[listingIndex];
  const offer = partOffersDatabase[offerIndex];
  offer.status = status; // 'Accepted' | 'Declined'

  if (status === "Accepted") {
    // Cascade update listing status based on listing type
    if (listing.postType === "Donate") {
      listing.status = "Donated";
    } else if (listing.postType === "Exchange" || listing.postType === "Cash Exchange") {
      listing.status = "Exchanged";
    } else {
      listing.status = "Sold";
    }
    listing.availabilityStatus = "Sold Out";

    // Optional user vehicle history record linkage!
    if (saveToHistory) {
      const record: MaintenanceRecord = {
        id: `m-part-${Date.now()}`,
        vehicleId: "v1", // Default Tacoma
        serviceCategory: listing.category || "General Parts Installation",
        description: `Install ${listing.condition} spare part: "${listing.title}". Sourced from marketplace exchange seller ${listing.contactName}.`,
        cost: serviceCost ? Number(serviceCost) : 15, // Simple fitment labor cost
        mileage: 181000,
        date: new Date().toISOString().split("T")[0],
        provider: serviceGarage || "Home Garage Self-Fit"
      };
      
      maintenanceRecords.push(record);
    }

    notificationLogsDatabase.unshift({
      id: `notif-deal-closed-${Date.now()}`,
      title: `🎉 Deal Secured on Parts Exchange!`,
      message: `Your classified "${listing.title.substring(0, 30)}..." deal is closed. Solved via ${offer.contactName}'s offer.`,
      channel: "In-App",
      status: "unread",
      sentAt: new Date().toISOString()
    });
  }

  res.json({ success: true, listing, offer });
});

// 8. Submit report on fake/suspicious listing (Safety and trust)
app.post("/api/classifieds/listings/:id/report", (req: Request, res: Response) => {
  const { id } = req.params;
  const { reason, comments, reporterName, reporterPhone } = req.body;

  const listing = classifiedListingsDatabase.find(l => l.id === id);
  if (!listing) {
    return res.status(404).json({ error: "Listing not found" });
  }

  const reportId = `report-${Date.now()}`;
  const newReport: PartReport = {
    id: reportId,
    listingId: id,
    listingTitle: listing.title,
    reason,
    comments: comments || "None",
    reporterName: reporterName || activeProfile.name,
    reporterPhone: reporterPhone || activeProfile.phone,
    status: "Pending",
    createdAt: new Date().toISOString()
  };

  partReportsDatabase.unshift(newReport);

  // Push notification alert
  notificationLogsDatabase.unshift({
    id: `notif-flagged-${Date.now()}`,
    title: `⚠️ Classified Part Flagged`,
    message: `Thank you. "${listing.title.substring(0, 25)}..." was reported for: "${reason}". Review moderators are checking it.`,
    channel: "In-App",
    status: "unread",
    sentAt: new Date().toISOString()
  });

  res.status(201).json({ success: true, report: newReport });
});

// 9. Admin panel: Get all reports
app.get("/api/classifieds/reports", (req: Request, res: Response) => {
  res.json(partReportsDatabase);
});

// 10. Admin panel: Act on report (Accept suspend / Ignore dismiss)
app.post("/api/classifieds/reports/:reportId/action", (req: Request, res: Response) => {
  const { reportId } = req.params;
  const { action } = req.body; // 'SUSPEND' | 'DISMISS'

  const repIndex = partReportsDatabase.findIndex(r => r.id === reportId);
  if (repIndex === -1) {
    return res.status(404).json({ error: "Report not found" });
  }

  const report = partReportsDatabase[repIndex];
  report.status = action === "SUSPEND" ? "Reviewed" : "Dismissed";

  if (action === "SUSPEND") {
    const listingIndex = classifiedListingsDatabase.findIndex(l => l.id === report.listingId);
    if (listingIndex !== -1) {
      classifiedListingsDatabase[listingIndex].status = "Suspended";
    }
  }

  res.json({ success: true, report });
});

// 11. Custom AI Title/Desc advice generator helper
app.post("/api/classifieds/ai-generate", async (req: Request, res: Response) => {
  const { seedTitle, brand, model, condition } = req.body;
  const client = getGeminiClient();
  
  if (client) {
    try {
      const templatePrompt = `Generate a high quality Cambodia parts marketplace advertisement listing details for:
      Part keyword: "${seedTitle}"
      Vehicle specs: ${brand} ${model}
      Condition: ${condition}
      
      Respond in strict JSON with:
      {
        "aiTitle": "Optimized, search-friendly classified title",
        "aiDescription": "Persuasive ads description block highlighting original fits, reliable state, and suitability to Cambodian hot climate or monsoon seasons."
      }`;

      const aiRes = await generateContentWithRetry(client, {
        model: "gemini-3.5-flash",
        contents: templatePrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              aiTitle: { type: Type.STRING },
              aiDescription: { type: Type.STRING }
            },
            required: ["aiTitle", "aiDescription"]
          }
        }
      });

      if (aiRes && aiRes.text) {
        const parsed = JSON.parse(aiRes.text.trim());
        return res.json(parsed);
      }
    } catch (err: any) {
      console.error("[Classifieds AI Helper] Generation failure:", err.message);
    }
  }

  // Fallbacks if offline
  res.json({
    aiTitle: `Original OEM ${brand} ${model} ${seedTitle} (${condition})`,
    aiDescription: `High grade replacement ${seedTitle} suitable for ${brand} ${model}. Thoroughly cleaned and measured, and perfect for addressing common defects in Cambodia seasons. Recommended local collection.`
  });
});

// Powerful Spare Parts Shop AI Endpoint (MyCar Care KH)
app.post("/api/parts/ai-assist", async (req: Request, res: Response) => {
  const { taskType, payload } = req.body;
  const client = getGeminiClient();
  
  if (!taskType) {
    return res.status(400).json({ error: "taskType is required" });
  }

  if (client) {
    try {
      if (taskType === 'generate-listing') {
        const { name, brand, category, condition, details } = payload;
        const prompt = `You are an expert Spare Parts Copywriter for MyCar Care KH.
        Generate marketplace advertisement and listing details for this spare part:
        - Part Name: "${name}"
        - Brand: "${brand}"
        - Category: "${category}"
        - Condition: "${condition}"
        - User details/notes: "${details || ''}"

        Respond in STRIFT JSON with the following schema:
        {
          "aiTitle": "Optimized SEO listing title in English",
          "aiDescription": "Persuasive and detailed description in English highlighting advantages, fit, durability, and compatibility",
          "aiDescriptionKhmer": "Persuasive and matching description translated into natural Khmer language",
          "sellingPoints": ["Point 1 (e.g. OEM Certified)", "Point 2", "Point 3"],
          "compatibleModels": ["Toyota Prius (2010-2015)", "Lexus CT200h (2011-2016)", "Toyota Camry (2007-2011)"],
          "suggestedCategory": "e.g. Braking System",
          "suggestedPriceRange": "e.g. $25 - $45",
          "seoKeywords": ["keyword1", "keyword2", "keyword3"]
        }
        Return ONLY valid JSON. Keep descriptions concise and informative.`;

        const aiRes = await generateContentWithRetry(client, {
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                aiTitle: { type: Type.STRING },
                aiDescription: { type: Type.STRING },
                aiDescriptionKhmer: { type: Type.STRING },
                sellingPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
                compatibleModels: { type: Type.ARRAY, items: { type: Type.STRING } },
                suggestedCategory: { type: Type.STRING },
                suggestedPriceRange: { type: Type.STRING },
                seoKeywords: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["aiTitle", "aiDescription", "aiDescriptionKhmer", "sellingPoints", "compatibleModels", "suggestedCategory", "suggestedPriceRange", "seoKeywords"]
            }
          }
        });

        if (aiRes && aiRes.text) {
          const parsed = JSON.parse(aiRes.text.trim());
          return res.json(parsed);
        }
      } 
      
      else if (taskType === 'stock-recommend') {
        const { currentInventory } = payload; // Array of product objects { name, sku, stockQuantity, minStockAlert, category, brand, costPrice, sellingPrice }
        const prompt = `You are an AI Sourcing Manager for MyCar Care KH.
        Analyze our current spare parts inventory stock levels below:
        ${JSON.stringify(currentInventory || [])}

        Identify low stock items, predict fast-movers/slow-movers, recommend discount campaigns, and popular vehicle models parts demand.
        Respond in STRICT JSON matching this schema:
        {
          "restockRecommendations": [
            {
              "sku": "SKU code",
              "productName": "Name of part",
              "currentStock": 5,
              "minStock": 10,
              "confidence": "High" or "Medium" or "Low",
              "reason": "Clear explanation of why this is urgent or needed based on climate (rainy season etc.) or common wear."
            }
          ],
          "fastMovingAlerts": ["Fast moving item description/prediction"],
          "slowMovingAlerts": ["Slow moving item description/prediction"],
          "promotionSuggestions": [
            {
              "name": "Promo Name",
              "discountPercent": 15,
              "reason": "Strategy reason e.g. clear dead stock of old highlander parts"
            }
          ],
          "popularCarModelsDemands": ["Toyota Prius", "Lexus RX330", "Toyota Camry", "Ford Ranger"]
        }`;

        const aiRes = await generateContentWithRetry(client, {
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                restockRecommendations: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      sku: { type: Type.STRING },
                      productName: { type: Type.STRING },
                      currentStock: { type: Type.INTEGER },
                      minStock: { type: Type.INTEGER },
                      confidence: { type: Type.STRING },
                      reason: { type: Type.STRING }
                    },
                    required: ["sku", "productName", "currentStock", "minStock", "confidence", "reason"]
                  }
                },
                fastMovingAlerts: { type: Type.ARRAY, items: { type: Type.STRING } },
                slowMovingAlerts: { type: Type.ARRAY, items: { type: Type.STRING } },
                promotionSuggestions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      discountPercent: { type: Type.NUMBER },
                      reason: { type: Type.STRING }
                    },
                    required: ["name", "discountPercent", "reason"]
                  }
                },
                popularCarModelsDemands: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["restockRecommendations", "fastMovingAlerts", "slowMovingAlerts", "promotionSuggestions", "popularCarModelsDemands"]
            }
          }
        });

        if (aiRes && aiRes.text) {
          const parsed = JSON.parse(aiRes.text.trim());
          return res.json(parsed);
        }
      } 
      
      else if (taskType === 'part-matching') {
        const { vehicleModel, problem, currentInventory } = payload;
        const prompt = `You are a Senior Automotive Advisor for MyCar Care KH.
        The user has a vehicle: "${vehicleModel}"
        And reports this problem: "${problem}"

        Here is our current spare parts inventory selection:
        ${JSON.stringify(currentInventory || [])}

        Identify if we have a direct match in stock. If yes, refer to it. If not, suggest alternative parts, expected prices, compatibility explanation, and recommended installation services in Phnom Penh.
        Respond in STRICT JSON matching this schema:
        {
          "suggestedParts": ["Part Name 1", "Part Name 2"],
          "compatibilityReason": "Explain matches and why these are suited for this model & symptom",
          "suggestedGarageServices": ["Service 1 (e.g., Brake rotor resurfacing)", "Service 2"],
          "averagePriceRange": "e.g. $40 - $180",
          "matchingInCatalog": [
            {
              "id": "match product absolute id",
              "name": "Product Name in catalog",
              "price": 32.00,
              "stockQuantity": 12
            }
          ]
        }`;

        const aiRes = await generateContentWithRetry(client, {
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                suggestedParts: { type: Type.ARRAY, items: { type: Type.STRING } },
                compatibilityReason: { type: Type.STRING },
                suggestedGarageServices: { type: Type.ARRAY, items: { type: Type.STRING } },
                averagePriceRange: { type: Type.STRING },
                matchingInCatalog: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      name: { type: Type.STRING },
                      price: { type: Type.NUMBER },
                      stockQuantity: { type: Type.INTEGER }
                    },
                    required: ["id", "name", "price", "stockQuantity"]
                  }
                }
              },
              required: ["suggestedParts", "compatibilityReason", "suggestedGarageServices", "averagePriceRange", "matchingInCatalog"]
            }
          }
        });

        if (aiRes && aiRes.text) {
          const parsed = JSON.parse(aiRes.text.trim());
          return res.json(parsed);
        }
      }
    } catch (err: any) {
      console.error("[Spare Parts AI Assist Tool] Error:", err.message);
    }
  }

  // --- LOCAL FALLBACK ENGINE (If Gemini API is key-less, offline, or returns error) ---
  if (taskType === 'generate-listing') {
    const { name, brand, category, condition } = payload;
    return res.json({
      aiTitle: `Original OEM ${brand} ${name} - Excellent (${condition})`,
      aiDescription: `High performance replacement ${name} ideal for Cambodian urban driving conditions. Certified reliable under standard heavy brake load test profiles. Fits perfectly.`,
      aiDescriptionKhmer: `គ្រឿងបន្លាស់ ${name} ម៉ាក ${brand} គុណភាពខ្ពស់ល្អបំផុតសម្រាប់លក្ខខណ្ឌបើកបរក្នុងរាជធានីភ្នំពេញ។ ផលិតផលល្អ ប្រើប្រាស់បានយូរអង្វែង។`,
      sellingPoints: ["OEM Certified Materials", "100% Heat Resistant Dual Coating", "Verified Cross-Model Matching"],
      compatibleModels: [`Toyota Prius (2004-2015)`, `Lexus CT200h (2011-2018)`, `Toyota Camry`],
      suggestedCategory: category || "Maintenance Spares",
      suggestedPriceRange: "$15 - $120",
      seoKeywords: [name.toLowerCase().replace(/ /g, "-"), brand.toLowerCase(), "cambodia-parts"]
    });
  } 
  
  else if (taskType === 'stock-recommend') {
    const { currentInventory } = payload;
    const items = currentInventory || [];
    const lowStock = items.filter((i: any) => i.stockQuantity <= i.minStockAlert);
    
    const restockRecommendations = lowStock.map((i: any) => ({
      sku: i.sku,
      productName: i.name,
      currentStock: i.stockQuantity,
      minStock: i.minStockAlert,
      confidence: "High",
      reason: `Stock is currently below safety reserves. Highly requested brand (${i.brand}) in Phnom Penh suburbs. Prevent stockouts.`
    }));

    if (restockRecommendations.length === 0 && items.length > 0) {
      restockRecommendations.push({
        sku: items[0].sku,
        productName: items[0].name,
        currentStock: items[0].stockQuantity,
        minStock: items[0].minStockAlert,
        confidence: "Medium",
        reason: "Regular maintenance rotation check due. Best seller tracking forecasts incoming spike next weekend."
      });
    }

    return res.json({
      restockRecommendations,
      fastMovingAlerts: ["Brake Pads (Toyota)", "Oil Filters (High Activity)"],
      slowMovingAlerts: ["Refurbished Hybrid Cells (Medium Activity)"],
      promotionSuggestions: [
        { name: "Monsoon Brake Safety Sweep", discountPercent: 15, reason: "Incentivize local taxi-prius owners to replace worn pads ahead of rainy weeks." }
      ],
      popularCarModelsDemands: ["Toyota Prius (2010)", "Lexus RX330", "Toyota Camry (2008)"]
    });
  } 
  
  else {
    // part-matching fallback
    const { vehicleModel, problem, currentInventory } = payload;
    const inventoryList = currentInventory || [];
    
    // Find basic name overrides
    let match = inventoryList.find((i: any) => {
      const nameL = i.name.toLowerCase();
      const probL = problem.toLowerCase();
      return (probL.includes("brake") && nameL.includes("brake")) ||
             (probL.includes("battery") && nameL.includes("battery")) ||
             (probL.includes("spark") && nameL.includes("spark")) ||
             (probL.includes("plug") && nameL.includes("plug")) ||
             (probL.includes("filter") && nameL.includes("filter"));
    });

    const matchingInCatalog = match ? [{
      id: match.id,
      name: match.name,
      price: match.sellingPrice,
      stockQuantity: match.stockQuantity
    }] : [];

    const probLabel = problem.toLowerCase();
    let suggestedParts = ["Ceramic Heavy Brake Pads Set", "High Conductive Copper Spark Plugs"];
    let compatibilityReason = `Based on complaint: "${problem}" for model "${vehicleModel}", we suggest verifying suspension elements, pads treading or fuel filter status.`;
    
    if (probLabel.includes("squeak") || probLabel.includes("brake")) {
      suggestedParts = ["Akebono Front Brake Pads Set", "Brake Rotor Disc Sweep"];
      compatibilityReason = `Squeaking noises during deceleration on ${vehicleModel} usually indicate friction wear past the caliper wear sensors (approx 2mm remaining). Perfect matching Akebono Ceramic brake pads are available.`;
    } else if (probLabel.includes("battery") || probLabel.includes("charge") || probLabel.includes("hybrid")) {
      suggestedParts = ["Hybrid Battery Modules (Grade A)", "HV Battery fan cleaning service"];
      compatibilityReason = `Hybrid system warnings or high-voltage ventilation codes on a ${vehicleModel} typically stem from clogged cooling blower blades or imbalanced terminal voltage levels. We suggest cell diagnostic replacement.`;
    }

    return res.json({
      suggestedParts,
      compatibilityReason,
      suggestedGarageServices: ["Full Caliper Torque Fastening Inspection", "Electrical Sensor Reset & Error Flush"],
      averagePriceRange: "$30 - $180",
      matchingInCatalog
    });
  }
});

// ----------------------------------------------------
// AI AGENT DEEP FEATURE ENDPOINTS
// ----------------------------------------------------

// General AI Prompt Endpoint for Fleet Assistant and dynamic modules
app.post("/api/gemini/generate", async (req: Request, res: Response) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Please specify a prompt to generate." });
  }

  const client = getGeminiClient();

  if (client) {
    try {
      console.log("[MyVehicle Care] Generating content using Gemini API...");
      const response = await generateContentWithRetry(client, {
        model: "gemini-3.5-flash",
        contents: prompt
      });
      res.json({ text: response.text });
    } catch (e: any) {
      console.error("[MyVehicle Care] Gemini generation failed, falling back to static/simulated engine:", e.message);
      res.status(500).json({ error: e.message || "Gemini generation failed" });
    }
  } else {
    res.status(503).json({ error: "Gemini AI client is not configured on this workspace" });
  }
});

// Feature 1: AI Vehicle Care Symptom Checker
app.post("/api/ai/diagnosis", async (req: Request, res: Response) => {
  const { vehicleId, symptom, language } = req.body;
  if (!symptom) {
    return res.status(400).json({ error: "Please enter your symptoms to diagnose." });
  }

  const vehicle = vehicles.find(v => v.id === vehicleId);
  const brandStr = vehicle ? `${vehicle.brand} ${vehicle.model} ${vehicle.year}` : "Generic Vehicle";
  const fuel = vehicle ? vehicle.fuelType : "Gasoline";
  const mileageKm = vehicle ? vehicle.mileage : 120000;

  const engineType = vehicle ? (vehicle.engineTypeNew || "") : "";
  const fuelEnergyType = vehicle ? (vehicle.fuelEnergyType || "") : "";
  const isEv = vehicle ? (vehicle.engineTypeNew === "electric" || vehicle.fuelEnergyType === "electric" || fuel.toLowerCase() === "ev") : false;
  const isHybrid = vehicle ? (vehicle.engineTypeNew === "hybrid" || vehicle.engineTypeNew === "plug-in hybrid" || fuel.toLowerCase() === "hybrid") : false;
  const isDiesel = vehicle ? (vehicle.engineTypeNew === "diesel" || fuel.toLowerCase() === "diesel") : false;

  const client = getGeminiClient();

  if (client) {
    try {
      console.log(`Diagnosing symptoms with Gemini: "${symptom}" for ${brandStr}`);
      const prompt = `You are MyCar Care KH AI Assistant, a vehicle maintenance supervisor and diagnostics counselor for Cambodia.

Analyze following symptoms:
Vehicle: ${brandStr}
Fuel Type: ${fuel}
Engine Type: ${engineType}
Fuel Energy Type: ${fuelEnergyType}
Mileage: ${mileageKm} km
Symptom: "${symptom}"
Cambodian Driving Conditions: Extreme heat, traffic gridlock, dust, rainy season water wading/floods.

Determine safe driving suggestions and possible issues.

COMPATIBILITY RULES:
- The vehicle has specific attributes: IS_EV = ${isEv}, IS_HYBRID = ${isHybrid}, IS_DIESEL = ${isDiesel}.
- Since IS_EV is ${isEv}, you MUST NOT recommend any combustion features like engine oil, spark plugs, oil filters, transmission belts, or fuel system repairs if it is a pure EV (IS_EV = true).
- Since IS_DIESEL is ${isDiesel}, recommend diesel-specific filters, oil, and DPF checks if relevant.
- Avoid any irrelevant platform recommendations (e.g. do not give EV battery diagnostics advice to a pure petrol/diesel car; do not suggest engine spark plugs or exhaust emissions diagnostics to a pure EV).

Safety guidelines:
- If issue involves brake failure, steering failure, fire smell, fuel leak, battery smoke, tyre burst, heavy engine overheating, EV high voltage, classify risk as high or emergency.
- Do not provide dangerous manual mechanical repair instructions. Encourage professional inspection.

Respond strictly in JSON matching this schema:
{
  "summary": "Short 1-2 sentence overview of potential issue.",
  "possible_causes": ["Cause A", "Cause B"],
  "risk_level": "low" | "medium" | "high" | "emergency",
  "safe_user_checks": ["A safe check user can perform visually"],
  "garage_inspection_needed": ["What mechanics should check"],
  "recommended_service_category": "Name of service category",
  "urgency": "Urgency description",
  "continue_driving_advice": "safe_to_continue_short_term" | "drive_carefully_to_garage" | "do_not_drive" | "call_emergency_support",
  "safety_warning": "Warning text",
  "confidence_level": "low" | "medium" | "high"
}`;

      const response = await generateContentWithRetry(client, {
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              possible_causes: { type: Type.ARRAY, items: { type: Type.STRING } },
              risk_level: { type: Type.STRING, enum: ["low", "medium", "high", "emergency"] },
              safe_user_checks: { type: Type.ARRAY, items: { type: Type.STRING } },
              garage_inspection_needed: { type: Type.ARRAY, items: { type: Type.STRING } },
              recommended_service_category: { type: Type.STRING },
              urgency: { type: Type.STRING },
              continue_driving_advice: { type: Type.STRING, enum: ["safe_to_continue_short_term", "drive_carefully_to_garage", "do_not_drive", "call_emergency_support"] },
              safety_warning: { type: Type.STRING },
              confidence_level: { type: Type.STRING, enum: ["low", "medium", "high"] }
            },
            required: [
              "summary",
              "possible_causes",
              "risk_level",
              "recommended_service_category",
              "urgency",
              "continue_driving_advice",
              "safety_warning",
              "confidence_level"
            ]
          }
        }
      });

      const responseText = response.text;
      if (responseText) {
        const result: AIDiagnosisResult = JSON.parse(responseText.trim());
        return res.json(result);
      } else {
        throw new Error("No response output text");
      }
    } catch (e) {
      console.error("Gemini diagnosis failed, supplying mock diagnostic report", e);
      return res.json(generateSimulatedDiagnosis(symptom, brandStr));
    }
  } else {
    // Return high quality simulated diagnosis
    return res.json(generateSimulatedDiagnosis(symptom, brandStr));
  }
});

// Feature 4: AI Dream Car Advisor for Cambodia
app.post("/api/ai/car-advisor", async (req: Request, res: Response) => {
  const { profile, usage, preference } = req.body;
  if (!profile || !usage || !preference) {
    return res.status(400).json({ error: "Please configure user profile, car usage, and preference parameters." });
  }

  const client = getGeminiClient();

  if (client) {
    try {
      console.log("Analyzing car advisor request with Gemini");
      const prompt = `You are the AI Dream Car Advisor for MyCar Care KH.
Your role is to help users choose a suitable car based on their personal profile, income, lifestyle, car usage, and long-term ownership goals.
You must provide realistic, safe, and practical car-buying guidance for users in Cambodia.

Safety and Practical Rules:
- Do not give formal financial advice.
- Do not guarantee loan approval.
- Do not guarantee vehicle condition.
- Always explain risks clearly.
- Recommend practical options before luxury options.
- Prioritize long-term affordability, maintenance cost, spare part availability, fuel cost, resale value, and user lifestyle fit in Cambodia (floods, rough roads, traffic gridlocks).

User Profile:
- Age: ${profile.age || "N/A"}
- Job title: ${profile.job_title || "N/A"}
- Employment type: ${profile.employment_type || "N/A"}
- Monthly salary: $${profile.monthly_salary || "0"}
- Extra income: $${profile.extra_income || "0"}
- Income stability: ${profile.income_stability || "N/A"}
- Monthly expense: $${profile.monthly_expense || "0"}
- Current savings: $${profile.current_savings || "0"}
- Existing debt/loan: $${profile.existing_debt || "0"}
- Property status: ${profile.property_status || "N/A"}
- Down payment available: $${profile.down_payment || "0"}
- Buying method: ${profile.buying_method || "N/A"}

Car Usage:
- Main driving city/province: ${usage.main_location || "Phnom Penh"}
- Main usage type: ${usage.usage_type || "Personal"}
- Average weekly driving distance: ${usage.weekly_distance || "150"} km
- Passenger need: ${usage.passenger_need || "4"} people
- Cargo need: ${usage.cargo_need || "Medium"}
- Adventure/off-road need: ${usage.adventure_need || "Medium"}
- Daily city driving need: ${usage.city_driving_need || "Medium"}
- Long-distance travel need: ${usage.long_distance_need || "Medium"}

Preference:
- Dream car: ${preference.dream_car || "N/A"}
- Preferred brand: ${preference.preferred_brand || "Any"}
- Preferred body type: ${preference.body_type || "Any"}
- Preferred fuel type: ${preference.fuel_type || "Any"}
- New or used preference: ${preference.new_or_used || "Used"}
- Ownership period: ${preference.ownership_period || "5 Years"}
- New car owner: ${preference.new_car_owner || "N/A"}

Please generate:
1. Short summary of the user's car-buying profile (summary)
2. Car affordability score from 0 to 100 (affordabilityScore) - calculate dynamically based on salary, debt, and downpayment. Higher debt/low salary reduces it.
3. Recommended car budget range min (recommendedBudgetMin) and max (recommendedBudgetMax). If buying method is cash, budget must align with down_payment/savings.
4. Safe monthly car spending limit (safeMonthlySpendingLimit) - reasonable percentage of income minus expenses.
5. Estimated monthly ownership cost (estimatedMonthlyOwnershipCost) - gas, maintenance, tax, insurance.
6. Recommended car type (recommendedCarType) - e.g. "Compact SUV", "Hybrid Sedan", "Midsize Pickup truck".
7. Top 3 suitable car options (options), containing exactly:
   - One safe choice (highly practical, low risk, high resale in Cambodia)
   - One balanced dream choice (moderately meets the user's dream/preferred brand but remains safe)
   - One risky choice to avoid or be careful with (highly unsuited for their budget, difficult parts in Cambodia, or weak in floods)
   For each option, provide:
   - label: "One safe choice" | "One balanced dream choice" | "One risky choice to avoid or be careful with"
   - brand: Brand name (e.g. "Toyota")
   - model: Model name (e.g. "Prius Hybrid")
   - yearRange: Suggested year range (e.g. "2008 - 2012")
   - estimatedPrice: Estimated price in Cambodian market (e.g. "$12,000 - $15,000")
   - fuelEfficiency: Fuel rating (e.g. "5L/100km Gasoline Hybrid")
   - fitExplanation: Thorough, specific explanation of why this car fits or does not fit their context (and risks, Cambodian conditions like floods).
   - riskRating: "Low" | "Medium" | "High"
   - maintenanceCostRating: "Low" | "Medium" | "High"
   - sparePartAvailability: "Excellent" | "Good" | "Fair" | "Poor"
8. New vs used recommendation (newVsUsedRecommendation)
9. Fuel type recommendation (fuelTypeRecommendation)
10. Long-term ownership advice (longTermOwnershipAdvice)
11. Maintenance cost warning (maintenanceCostWarning)
12. Buying timing suggestion (buyingTimingSuggestion)
13. Pre-purchase inspection checklist (prePurchaseInspectionChecklist) - Array of 3-5 specific mechanical items to check.
14. Final recommendation (finalRecommendation)
15. Disclaimer (disclaimer)

Respond STRICTLY in valid JSON matching the schema below. Do not output any markdown wrapped code ticks except the clean JSON string.

Schema:
{
  "summary": "string",
  "affordabilityScore": number,
  "recommendedBudgetMin": number,
  "recommendedBudgetMax": number,
  "safeMonthlySpendingLimit": number,
  "estimatedMonthlyOwnershipCost": number,
  "recommendedCarType": "string",
  "options": [
    {
      "label": "string",
      "brand": "string",
      "model": "string",
      "yearRange": "string",
      "estimatedPrice": "string",
      "fuelEfficiency": "string",
      "fitExplanation": "string",
      "riskRating": "string",
      "maintenanceCostRating": "string",
      "sparePartAvailability": "string"
    }
  ],
  "newVsUsedRecommendation": "string",
  "fuelTypeRecommendation": "string",
  "longTermOwnershipAdvice": "string",
  "maintenanceCostWarning": "string",
  "buyingTimingSuggestion": "string",
  "prePurchaseInspectionChecklist": ["string"],
  "finalRecommendation": "string",
  "disclaimer": "string"
}`;

      const response = await generateContentWithRetry(client, {
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              affordabilityScore: { type: Type.INTEGER },
              recommendedBudgetMin: { type: Type.INTEGER },
              recommendedBudgetMax: { type: Type.INTEGER },
              safeMonthlySpendingLimit: { type: Type.INTEGER },
              estimatedMonthlyOwnershipCost: { type: Type.INTEGER },
              recommendedCarType: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    label: { type: Type.STRING },
                    brand: { type: Type.STRING },
                    model: { type: Type.STRING },
                    yearRange: { type: Type.STRING },
                    estimatedPrice: { type: Type.STRING },
                    fuelEfficiency: { type: Type.STRING },
                    fitExplanation: { type: Type.STRING },
                    riskRating: { type: Type.STRING },
                    maintenanceCostRating: { type: Type.STRING },
                    sparePartAvailability: { type: Type.STRING }
                  },
                  required: ["label", "brand", "model", "yearRange", "estimatedPrice", "fuelEfficiency", "fitExplanation", "riskRating", "maintenanceCostRating", "sparePartAvailability"]
                }
              },
              newVsUsedRecommendation: { type: Type.STRING },
              fuelTypeRecommendation: { type: Type.STRING },
              longTermOwnershipAdvice: { type: Type.STRING },
              maintenanceCostWarning: { type: Type.STRING },
              buyingTimingSuggestion: { type: Type.STRING },
              prePurchaseInspectionChecklist: { type: Type.ARRAY, items: { type: Type.STRING } },
              finalRecommendation: { type: Type.STRING },
              disclaimer: { type: Type.STRING }
            },
            required: [
              "summary", "affordabilityScore", "recommendedBudgetMin", "recommendedBudgetMax",
              "safeMonthlySpendingLimit", "estimatedMonthlyOwnershipCost", "recommendedCarType",
              "options", "newVsUsedRecommendation", "fuelTypeRecommendation", "longTermOwnershipAdvice",
              "maintenanceCostWarning", "buyingTimingSuggestion", "prePurchaseInspectionChecklist",
              "finalRecommendation", "disclaimer"
            ]
          }
        }
      });

      const responseText = response.text;
      if (responseText) {
        const result = JSON.parse(responseText.trim());
        return res.json(result);
      } else {
        throw new Error("No response output text");
      }
    } catch (e) {
      console.error("Gemini advisor failed, supplying mock advisor report", e);
      return res.json(generateSimulatedAdvisorReport(profile, usage, preference));
    }
  } else {
    return res.json(generateSimulatedAdvisorReport(profile, usage, preference));
  }
});

// Feature 4: Admin analytics queries via AI
app.post("/api/ai/admin-query", async (req: Request, res: Response) => {
  const { question } = req.body;
  if (!question) {
    return res.status(400).json({ error: "Please enter your query." });
  }

  // Calculate status of entire database to pass as context
  const totalVehiclesCount = vehicles.length;
  const overdueRemindersList: string[] = [];
  const brandList: string[] = [];
  const provinces: string[] = [];

  vehicles.forEach(v => {
    brandList.push(v.brand);
    provinces.push(activeProfile.location);
    const relatedLogs = maintenanceRecords.filter(m => m.vehicleId === v.id);
    const rems = calculateReminders(v, relatedLogs);
    const overdue = rems.filter(r => r.status === 'Overdue');
    if (overdue.length > 0) {
      overdueRemindersList.push(`${v.brand} ${v.model} (${overdue.map(o => o.service).join(', ')})`);
    }
  });

  const client = getGeminiClient();

  if (client) {
    try {
      console.log(`Processing Admin AI query: "${question}"`);
      const context = `System State context:
Total registered vehicles in database: ${totalVehiclesCount}.
Overdue lists: ${overdueRemindersList.join("; ")}.
Brand breakdown in Cambodia: ${JSON.stringify(brandList)}.
Target areas: Phnom Penh.
Active Partners: Apsara Diagnostics, Angkor Tyres Alignment clinic, EV Fast Charging.`;

      const prompt = `${context}

You are MyCar Care KH AI Admin Assistant. An admin has asked: "${question}".
Analyze this request. Suggest:
1. Short analysis response answering their query.
2. Target vehicle count statistics.
3. Recommended promotion or push campaign.
4. Partner collaborations to drive traffic.

Respond in strict JSON with schema matching:
{
  "summary": "Main answers to administrative query under 3 sentences.",
  "targetCount": 12,
  "campaignName": "Name of notification campaign suggestion",
  "suggestedMessage": "Push notification standard text suggestion for Cambodian owners",
  "partnerOffer": "E.g. 10% off at Angkor Tyres during rainy season",
  "actionableSteps": ["Step A", "Step B"]
}`;

      const response = await generateContentWithRetry(client, {
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              targetCount: { type: Type.INTEGER },
              campaignName: { type: Type.STRING },
              suggestedMessage: { type: Type.STRING },
              partnerOffer: { type: Type.STRING },
              actionableSteps: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["summary", "targetCount", "campaignName", "suggestedMessage", "partnerOffer", "actionableSteps"]
          }
        }
      });

      const responseText = response.text;
      if (responseText) {
        return res.json(JSON.parse(responseText.trim()));
      } else {
        throw new Error("No response output");
      }

    } catch (e) {
      console.error("Gemini Admin Query failed, fallback to simulated analysis", e);
      return res.json(generateSimulatedAdminQuery(question, overdueRemindersList.length, totalVehiclesCount));
    }
  } else {
    return res.json(generateSimulatedAdminQuery(question, overdueRemindersList.length, totalVehiclesCount));
  }
});

// Helper: fallback/simulated weakness report generator matching brand/model/year beautifully
function generateSimulatedReport(brand: string, model: string, year: number): VehicleWeaknessReport {
  const brandLower = brand.toLowerCase();
  const yearNum = Number(year);

  let commonIssues: VehicleWeaknessReport['commonIssues'] = [
    { issue: "Suspension bushing decay", advice: "Phnom Penh's heat and dusty alleys crack rubber components quickly. Inspect lower arm dampers.", risk: "low" },
    { issue: "Engine cooling heat-stress", advice: "Heavy city bumper-to-bumper congestion demands radiator checks. Flush coolant system.", risk: "medium" }
  ];
  let strongPoints = ["Extremely high spare part availability in Angkor market circles", "Excellent suspension resilience over local high-pothole conditions"];
  let weakPoints = ["High fuel consumption in stagnant traffic", "Prone to rust if left unprotected in Cambodian monsoon flooding"];
  let recommendedSchedule = [
    { task: "Engine oil change", interval: "Every 5,000 km or 3 months" },
    { task: "Radiator fluid assessment", interval: "Every 20,000 km" }
  ];

  if (brandLower.includes('toyota')) {
    commonIssues = [
      { issue: "Warped Front Brake Rotors", advice: "Common on older Toyota SUVs and Pickups. Machining or replacement is advised at 150,000+ km.", risk: "medium" },
      { issue: "Lower Ball Joint Recalls/Wear", advice: "Extremely serious on Tacoma or Hilux. Check physical connection play before any provinces road trip.", risk: "high" },
      { issue: "AC Compressor Clutch Lockout", advice: "Cambodian summer humidity and traffic strain AC compressors. Service refrigerant levels regularly.", risk: "medium" }
    ];
    strongPoints = [
      "Unmatched secondary resale value across Cambodian provinces",
      "Sourced parts instantly at St. 271, Russian Boulevard, or Boeng Keng Kang markets",
      "Bulletproof mechanical build resists extreme local heat"
    ];
  } else if (brandLower.includes('ford')) {
    commonIssues = [
      { issue: "EGR valve blockage", advice: "Soot accumulates in Diesel Ford trucks over slow commuter speeds. Clean/flush EGR valve.", risk: "medium" },
      { issue: "Turbocharger actuator seal leak", advice: "Common loss of pressure on Ranger/Everest. Replace vacuum seal rubber rings.", risk: "high" }
    ];
    strongPoints = [
      "Outstanding chassis stability on Cambodian National Highways (NH1, NH4)",
      "High tech interior navigation aids and water wading capability",
      "Sturdier towing capability package"
    ];
  }

  return {
    commonIssues,
    maintenancePriority: [
      "Verify structural safety components (ball joints, brake pads)",
      "Maintain active radiator fluid volume due to excessive local warmth"
    ],
    strongPoints,
    weakPoints,
    monthlyChecklist: [
      "Inspect radiator fan function",
      "Check auxiliary coolant expansion container fluid levels",
      "Scan dashboard instrument array for engine alerts"
    ],
    longTripChecklist: [
      "Test emergency double signals and spare tyre air level",
      "Pack additional coolant bottle and portable tyre pump",
      "Validate front brake stopping responsiveness"
    ],
    recommendedSchedule,
    warningSigns: [
      "AC air blowing flat or mildly warm during sunny Phnom Penh afternoons",
      "Screeching metallic noise on low speed deceleration",
      "Slight coolant trace drops below radiator grill area"
    ]
  };
}

// Helper: fallback/simulated dream car advisor
function generateSimulatedAdvisorReport(profile: any, usage: any, preference: any): any {
  const salary = parseFloat(profile.monthly_salary) || 1200;
  const expense = parseFloat(profile.monthly_expense) || 600;
  const extra = parseFloat(profile.extra_income) || 0;
  const savings = parseFloat(profile.current_savings) || 3000;
  const downPayment = parseFloat(profile.down_payment) || 2000;
  const isCash = (profile.buying_method || "").toLowerCase().includes("cash");

  const monthlyNet = (salary + extra) - expense;
  
  // Calculate basic affordability metric
  let score = 70;
  if (savings < 3000) score -= 15;
  if (monthlyNet < 300) score -= 20;
  if (monthlyNet > 1000) score += 15;
  if (downPayment >= 5000) score += 10;
  if (parseFloat(profile.existing_debt) > 0) score -= 15;
  score = Math.max(10, Math.min(97, score));

  // Recommended car budget min and max
  let budgetMin = 8000;
  let budgetMax = 18000;
  if (isCash) {
    budgetMin = Math.max(3000, downPayment * 0.8);
    budgetMax = Math.max(5000, downPayment + (savings * 0.5));
  } else {
    budgetMin = Math.max(5000, downPayment + (monthlyNet * 15));
    budgetMax = Math.max(10000, downPayment + (monthlyNet * 36));
  }

  // Adjust budgets based on realistic Cambodian categories
  budgetMin = Math.round(budgetMin / 500) * 500;
  budgetMax = Math.round(budgetMax / 500) * 500;

  const safeSpendingLimit = Math.max(150, Math.round((salary + extra) * 0.22));
  const estOwnership = Math.max(120, Math.round(150 + (parseFloat(usage.weekly_distance || "150") * 0.8)));

  const mainLocation = (usage.main_location || "Phnom Penh");
  const isProvincial = !mainLocation.toLowerCase().includes("phnom penh");
  const needPayloadOffroad = usage.adventure_need === "High" || usage.cargo_need === "High" || usage.usage_type === "Business/Cargo";
  
  let recommendedCarType = "Reliable Compact Crossover / Hybrid Hatchback";
  if (needPayloadOffroad || isProvincial) {
    recommendedCarType = "Rugged Mid-size Pickup (Tough Chassis)";
  } else if (parseFloat(usage.passenger_need) > 5) {
    recommendedCarType = "Family Mid-size SUV / MPV (7-Seater)";
  }

  // Define Top 3 suitable cars: safe, dream, risky
  let safeChoice = {
    label: "One safe choice",
    brand: "Toyota",
    model: "Prius Hybrid (Gen 2)",
    yearRange: "2006 - 2009",
    estimatedPrice: "$9,500 - $12,500",
    fuelEfficiency: "4.8L/100km Hybrid Gas",
    fitExplanation: "Unbeatable local parts availability, extremely low gasoline costs for heavy city commutes in Phnom Penh, and easy resale in any Cambodian market square.",
    riskRating: "Low",
    maintenanceCostRating: "Low",
    sparePartAvailability: "Excellent"
  };

  let dreamChoice = {
    label: "One balanced dream choice",
    brand: "Toyota",
    model: "Highlander V6 Limited",
    yearRange: "2003 - 2005",
    estimatedPrice: "$12,500 - $15,500",
    fuelEfficiency: "11.5L/100km Gasoline V6",
    fitExplanation: "Spacious luxury layout, soft smooth suspension is excellent for handling potholes, and high prestige in Cambodia, though gas consumption can be quite high.",
    riskRating: "Medium",
    maintenanceCostRating: "Medium",
    sparePartAvailability: "Excellent"
  };

  let riskyChoice = {
    label: "One risky choice to avoid or be careful with",
    brand: "Range Rover",
    model: "Sport HSE Supercharged",
    yearRange: "2010 - 2012",
    estimatedPrice: "$18,000 - $22,000",
    fuelEfficiency: "16.5L/100km Gasoline Supercharged",
    fitExplanation: "Extreme air suspension failure rates under Cambodia's intense seasonal mud/water logging, severely restricted diagnostic module workshops outside Phnom Penh, and sky-high rebuild costs.",
    riskRating: "High",
    maintenanceCostRating: "High",
    sparePartAvailability: "Poor"
  };

  if (needPayloadOffroad || isProvincial) {
    safeChoice = {
      label: "One safe choice",
      brand: "Toyota",
      model: "Tacoma Regular Cab 4WD",
      yearRange: "2005 - 2008",
      estimatedPrice: "$11,500 - $14,500",
      fuelEfficiency: "10.5L/100km Gasoline L4",
      fitExplanation: "High-grade mechanical durability with high ground clearance for navigating unpaved flooded roads in Battambang or Kampong Cham. Bulletproof resale.",
      riskRating: "Low",
      maintenanceCostRating: "Medium",
      sparePartAvailability: "Excellent"
    };

    dreamChoice = {
      label: "One balanced dream choice",
      brand: "Ford",
      model: "Ranger Wildtrak 3.2L",
      yearRange: "2015 - 2017",
      estimatedPrice: "$22,000 - $26,500",
      fuelEfficiency: "9.2L/100km Diesel Turbo",
      fitExplanation: "Modern visual styling, massive cargo loading bay, exceptional safety tech, and powerful traction for long distance highway travel.",
      riskRating: "Medium",
      maintenanceCostRating: "High",
      sparePartAvailability: "Good"
    };

    riskyChoice = {
      label: "One risky choice to avoid or be careful with",
      brand: "BMW",
      model: "X5 xDrive35i Turbo",
      yearRange: "2011 - 2013",
      estimatedPrice: "$19,000 - $24,000",
      fuelEfficiency: "13.5L/100km Premium Gasoline",
      fitExplanation: "Delicate underhood turbo sensors and electric water pumps that often overheat or crack during intense Cambodian dry seasons, leading to major roadside rescue fees.",
      riskRating: "High",
      maintenanceCostRating: "High",
      sparePartAvailability: "Fair"
    };
  }

  return {
    summary: `Buyer profile indicates steady employment as ${profile.job_title || "Professional"} with a monthly net surplus of about $${monthlyNet.toLocaleString()}. Main driving will occur in ${mainLocation} under ${usage.usage_type || "personal"} needs. Preferred brand is ${preference.preferred_brand || "any model"}.`,
    affordabilityScore: score,
    recommendedBudgetMin: budgetMin,
    recommendedBudgetMax: budgetMax,
    safeMonthlySpendingLimit: safeSpendingLimit,
    estimatedMonthlyOwnershipCost: estOwnership,
    recommendedCarType: recommendedCarType,
    options: [safeChoice, dreamChoice, riskyChoice],
    newVsUsedRecommendation: preference.new_or_used === "New" ? "Although you prefer a new car, we recommend a reliable 5-10 year old high-resale Used Toyota/Lexus in Cambodia to avoid steep immediate depreciation and initial high luxury taxes." : "Used car represents outstanding value. Stick to well-documented imports to avoid odometer rollback risks.",
    fuelTypeRecommendation: preference.fuel_type === "Gasoline" ? "Stick to regular Gasoline (87-92 Octane) as hybrid cooling systems require additional skilled maintenance in rural zones." : "Since you commute extensively, a fuel-efficient Hybrid line or clean Diesel pickup is highly recommended.",
    longTermOwnershipAdvice: "Maintain standard visual checks on radiator hoses and underbody mud buildup. High temperatures in Cambodia expand coolant pressure, so check water levels weekly.",
    maintenanceCostWarning: "Avoid European luxury marques if repair budgets are constrained. Parts can take 4-6 weeks to fly into Phnom Penh hubs.",
    buyingTimingSuggestion: "Consider completing purchases in April/May just before the peak monsoon rains so you have a sturdier, safer cabin prepared for city flood wading cycles.",
    prePurchaseInspectionChecklist: [
      "Hire an independent mobile inspector to run a comprehensive OBD OBD-2 software scan for cleared permanent diagnostic codes.",
      "Visually examine the frame chassis rails on a garage elevator hoist for rusted weld repairs indicating previous flood immersion or collision rebuild status.",
      "Unscrew oil filler cap and check for thick black sludge buildup indicating neglected engine lubrication services.",
      "Check transmission shifting smoothness under full operational warmth, testing low gear manual locking."
    ],
    finalRecommendation: `Prioritizing the Safe Choice (${safeChoice.brand} ${safeChoice.model}) keeps your financial reserves liquid while securing comfortable, dependable daily transport inside Cambodia.`,
    disclaimer: "This report generated by MyCar Care KH AI Advisor serves purely as an operational evaluation framework. Always secure physical mechanical verification and financial safety checks before completing purchases."
  };
}

// Helper: fallback/simulated symptom diagnostics
function generateSimulatedDiagnosis(symptom: string, brandStr: string): AIDiagnosisResult {
  const s = symptom.toLowerCase();

  if (s.includes('shake') || s.includes('vibrat') || s.includes('brak')) {
    return {
      summary: `Your ${brandStr} is experiencing severe braking rotor fatigue or suspension ball joint play.`,
      possible_causes: [
        "Warped Front Disc Rotors due to heat cycles",
        "Severely Worn Brake Pads close to caliper backing",
        "Unbalanced Front Wheels or uneven tire wear",
        "Loose Steering Rack Bushings"
      ],
      risk_level: "high",
      safe_user_checks: [
        "Park on static level ground, look inside the wheel rim using smartphone light to see brake pad indicator thickness (should be >3mm)",
        "Inspect tires visually for dynamic uneven wear bubbles or flat spots"
      ],
      garage_inspection_needed: [
        "Dismount tyres and inspect brake rotor thickness flatness with micrometer",
        "Check lower ball-joints play and steering linkage tie rod ends",
        "Analyze wheel balances on a dynamic rotation machine"
      ],
      recommended_service_category: "Brake Service",
      urgency: "Inspect within your next 24-48 hours",
      continue_driving_advice: "drive_carefully_to_garage",
      safety_warning: "Braking distance is elongated. Avoid sudden high-speed driving or highway overtaking.",
      confidence_level: "high"
    };
  }

  if (s.includes('smell') || s.includes('burn') || s.includes('smoke')) {
    return {
      summary: `Our diagnostic signals dynamic safety issues: a burning smell underhood indicating engine lubricant leak or wire friction on ${brandStr}.`,
      possible_causes: [
        "Valve Cover Gasket oil leakage dripping onto hot exhaust manifold",
        "Stuck Brake Caliper remaining locked against rotor causing extreme frictional heat",
        "Damaged electrical grounding wiring starting insulation smolder"
      ],
      risk_level: "emergency",
      safe_user_checks: [
        "Turn off the ignition key instantly. Wait for engine to cool before physical underhood inspection",
        "Check engine oil dipstick to verify standard volume status"
      ],
      garage_inspection_needed: [
        "Perform pressurized engine engine steam wash to track exact origin points of oil leaks",
        "Check caliper friction slide pins and brake fluid levels",
        "Check underhood main fuse array links for voltage short marks"
      ],
      recommended_service_category: "Full Inspection",
      urgency: "Immediate check mandatory",
      continue_driving_advice: "do_not_drive",
      safety_warning: "Risk of structural engine room combustion if fluid directly sparks. Do not force operation.",
      confidence_level: "medium"
    };
  }

  // General default fallback
  return {
    summary: `Your ${brandStr} symptom "${symptom}" categorized as periodic maintenance assessment issue.`,
    possible_causes: [
      "Normal degradation of filters or secondary fluid levels",
      "Stretched serpentine fan belts or dirty spark tips",
      "Cambodian fuel impurities or dust clogging sensor lines"
    ],
    risk_level: "medium",
    safe_user_checks: [
      "Check engine dashboard gauges to ensure no active yellow alert sign is on",
      "Observe fluid droplets underneath the parking area"
    ],
    garage_inspection_needed: [
      "Diagnostic OBD-2 scanner link to clear sensor faults",
      "Bespoke engine room physical clean and service air filter replacement"
    ],
    recommended_service_category: "Full Inspection",
    urgency: "Schedule visit in next 5-7 days",
    continue_driving_advice: "drive_carefully_to_garage",
    safety_warning: "Keep constant monitor on engine coolant dials and drive conservatively.",
    confidence_level: "medium"
  };
}

// Helper: fallback simulated admin analytics assistant
function generateSimulatedAdminQuery(question: string, overdueCount: number, totalCount: number) {
  const q = question.toLowerCase();
  let summary = `Currently analyzing database filters. Cambodia client records show standard activity across ${totalCount} vehicles.`;
  let campaignName = "Rainy Season Safety Campaign";
  let message = "Dear MyCar Care KH Owner, Monsoon rains are arriving in Cambodia. Protect your family with a FREE brake efficiency check at Apsara Diagnostics this week!";
  let partner = "Apsara Diagnostics - Free Diagnostic Scan + 15% off dynamic brake rotor flat machining services.";

  if (q.includes('oil') || q.includes('overdue')) {
    summary = `Alert: We tracked ${overdueCount} vehicles overdue for Engine Lubrication Swap. This represents an engine safety hazard.`;
    campaignName = "Lubricant Engine Protection Campaign";
    message = "Alert: Your vehicle indicates a dynamic oil replacement timeline has been crossed. Replenish your engine immediately at Mekong Lubricant and receive a Free Air Filter!";
    partner = "Mekong Lube Express - Free engine air filter worth $15 with any Mobil synthetic oil change pack.";
  }

  return {
    summary,
    targetCount: overdueCount || totalCount,
    campaignName,
    suggestedMessage: message,
    partnerOffer: partner,
    actionableSteps: [
      "Trigger the customized Firebase Push Notification campaign to the highlighted user numbers",
      "Pin the co-branded promotion banner directly onto the MyCar Care KH main directory layout",
      "Settle real-time partner dashboard conversion tracks during check-ins"
    ]
  };
}

// Vite Server middleware or Static Files Serving for Production
async function startServer() {
  // Check and run Cloud SQL table seeds
  await seedInitialDataOnlyIfDry();

  if (process.env.NODE_ENV !== "production") {
    // Development mode
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    // Production mode
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MyCar Care KH Integration Server spinning on http://0.0.0.0:${PORT}`);
  });
}

startServer();
