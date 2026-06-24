import React, { useState } from "react";
import { 
  QrCode, 
  RefreshCw, 
  Printer, 
  Share2, 
  Lock, 
  CheckCircle, 
  FileText, 
  ShieldCheck, 
  Camera,
  Info,
  BookOpen
} from "lucide-react";
import { VehicleProfile } from "../types";

interface QrCodeTabProps {
  vehicle: VehicleProfile;
  onRegenerateToken: (id: string) => Promise<{ success: boolean; newToken: string; newLink: string }>;
  refreshData: () => void;
}

export default function QrCodeTab({
  vehicle,
  onRegenerateToken,
  refreshData
}: QrCodeTabProps) {
  const [regenerating, setRegenerating] = useState(false);
  const [successText, setSuccessText] = useState("");
  const [showA5Booklet, setShowA5Booklet] = useState(true);

  const handleRegenerate = async () => {
    if (!window.confirm("WARNING: Regenerating the secure QR Code will immediately revoke the old QR Code. Any printed stickers containing the previous code will fail to authenticate with scanned garages. Proceed?")) {
      return;
    }

    setRegenerating(true);
    try {
      const res = await onRegenerateToken(vehicle.id);
      if (res.success) {
        setSuccessText("Secure token successfully rotated! Old link is permanently blacklisted.");
        setTimeout(() => {
          setSuccessText("");
        }, 4000);
        refreshData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRegenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* Dynamic style block injecting print-media overrides to guarantee absolute A5 dimension prints */}
      <style>{`
        @media print {
          /* Hide standard screen container elements completely during spooling */
          body, html, #root, header, nav, footer, .fixed, .glass, button {
            visibility: hidden !important;
            background: none !important;
          }
          /* Target printable A5 container exclusively and force A5 layout metrics */
          .print-a5-container, .print-a5-container * {
            visibility: visible !important;
          }
          .print-a5-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 148mm !important;
            height: 210mm !important;
            margin: 0 !important;
            padding: 10mm !important;
            box-sizing: border-box !important;
            background: #ffffff !important;
            color: #0c111d !important;
            border: 1px solid #101828 !important;
            border-radius: 0px !important;
            box-shadow: none !important;
            page-break-after: avoid !important;
            page-break-before: avoid !important;
          }
          /* High contrast text elements for physical output */
          .print-black-text {
            color: #0c111d !important;
          }
          .print-border-black {
            border-color: #344054 !important;
          }
          .print-bg-light {
            background-color: #f8f9fc !important;
          }
        }
      `}</style>

      <div>
        <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
          Secure Vehicle QR Passport Certifications
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Each car has a unique cryptographic QR sticker. Present this barcode to any certified workshop to instantly load specs and file maintenance logs for your review.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
        {/* Left Side: Staged Pass Card layout representing Cambodia Car Pass */}
        <div className="md:col-span-5 flex justify-center">
          <div className="w-full max-w-xs bg-gradient-to-br from-slate-900 to-indigo-950 p-6 rounded-[2.5rem] border border-sky-500/30 shadow-2xl relative overflow-hidden flex flex-col justify-between text-center print:m-0 print:border-slate-800">
            {/* Gloss Reflection circles */}
            <div className="absolute -top-16 -left-16 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl"></div>

            <div className="space-y-3.5 z-10">
              <div className="flex justify-between items-center text-[10px] text-slate-400 border-b border-white/10 pb-2.5">
                <span className="font-extrabold tracking-widest text-sky-400">MYCAR CARE KH</span>
                <span className="font-mono text-[9px] px-2 py-0.5 bg-sky-500/10 border border-sky-500/20 rounded-md text-sky-300">
                  OFFICIAL STICKER
                </span>
              </div>

              <div className="space-y-0.5">
                <h4 className="text-slate-100 font-extrabold text-[15px] truncate">
                  {vehicle.brand} {vehicle.model}
                </h4>
                <div className="text-[10px] text-sky-300 font-mono font-bold tracking-wider uppercase">
                  REG: {vehicle.plateNumber || "PP-2X-4505"}
                </div>
              </div>

              {/* QR Image Frame */}
              <div className="p-4 bg-white rounded-3xl w-44 h-44 mx-auto flex items-center justify-center shadow-lg border border-white/5 relative">
                {/* Simulated high value QR representation */}
                <div className="relative">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(vehicle.qrSecureLink || `https://mycar.kh/car/${vehicle.id}`)}`} 
                    alt="Vehicle QR Seal"
                    className="w-36 h-36 relative z-10"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[8px] text-slate-500 font-bold tracking-wider uppercase block">Unique Vehicle Access-Key Token</span>
                <span className="font-mono text-slate-300 text-[10px] tracking-widest select-all">
                  MCC-{vehicle.id.toUpperCase()}-ST-{vehicle.year}
                </span>
              </div>
            </div>

            <div className="text-[9px] text-slate-400 font-medium pt-3.5 border-t border-white/10 mt-5 z-10 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span>Owner Authenticated Cryptographic Cert</span>
            </div>
          </div>
        </div>

        {/* Right Side: Operations manual & rotate button */}
        <div className="md:col-span-7 flex flex-col justify-between space-y-6">
          <div className="glass rounded-3xl p-6 border border-white/5 space-y-4">
            <h4 className="text-slate-200 font-extrabold text-[13px] uppercase tracking-wider flex items-center gap-2">
              <Info className="w-4 h-4 text-sky-400" />
              <span>Access Certificate Guidelines</span>
            </h4>

            <div className="space-y-3.5 text-xs text-slate-350 leading-relaxed">
              <p>
                1. <strong>Print Badge:</strong> Hang this badge inside your dashboard tray or windshield sticker block to expedite garage entry sequences.
              </p>
              <p>
                2. <strong>Secure Logging:</strong> Un-authorized garages who scan this QR can check public model specs, but <em>can not</em> add files into your logs unless connected via Connections tab rules.
              </p>
              <p>
                3. <strong>Instant Rotational Security:</strong> If you suspect security vulnerability, rotate the QR key instantly. This will generate a fresh public URL and blacklist the previous sticker.
              </p>
            </div>

            {successText && (
              <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-2xl animate-pulse">
                {successText}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handlePrint}
              className="p-3 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 rounded-2xl font-bold text-xs flex items-center gap-2 transition flex-1 justify-center cursor-pointer font-mono uppercase text-sky-400 hover:text-sky-305"
            >
              <Printer className="w-4 h-4" />
              <span>Print Core Badge</span>
            </button>
            <button
              onClick={handleRegenerate}
              disabled={regenerating}
              className="p-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-2xl font-bold text-xs flex items-center gap-2 transition flex-1 justify-center cursor-pointer uppercase"
            >
              <RefreshCw className={`w-4 h-4 ${regenerating ? 'animate-spin' : ''}`} />
              <span>{regenerating ? "Rotating..." : "Rotate Seal"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Printable A5 Physical Service Book Section */}
      <div className="border-t border-white/5 pt-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h4 className="text-xs font-black text-slate-200 uppercase tracking-widest flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-sky-400" />
              <span>Printable A5 Physical Service Book</span>
            </h4>
            <p className="text-[11px] text-slate-400">
              Generate a high-contrast physical page to keep inside your dashboard glove box. Features manual stamp slots for mechanics.
            </p>
          </div>
          <button
            onClick={() => setShowA5Booklet(!showA5Booklet)}
            className="p-2 px-3.5 bg-slate-800 text-slate-200 font-bold border border-white/10 rounded-xl text-xs transition hover:bg-slate-700 cursor-pointer text-left"
          >
            {showA5Booklet ? "Hide Booklet Preview" : "View Booklet Preview"}
          </button>
        </div>

        {showA5Booklet && (
          <div className="space-y-5">
            {/* Control & Printing Instructions Alert */}
            <div className="p-4 bg-sky-500/5 rounded-3xl border border-sky-500/10 flex lg:items-center gap-3.5">
              <div className="p-2.5 bg-sky-500/10 text-sky-400 rounded-2xl shrink-0">
                <Printer className="w-5 h-5" />
              </div>
              <div className="space-y-0.5 text-xs text-slate-300">
                <p className="font-extrabold text-slate-200">How to print on standard A5 Paper:</p>
                <p className="leading-relaxed text-slate-400">
                  Click the <strong>"Print A5 Insert Booklet"</strong> button below. In your system print dialog box, select <strong className="text-slate-200 font-mono">Paper Size: A5</strong> (or select default paper and check 'Fit to printable area'). Our custom print styles automatically isolate the template and scale the diagnostic QR seal correctly.
                </p>
              </div>
            </div>

            {/* A5 Printable Area Container Layout (Designed with Portrait Aspect ratio 1:1.414) */}
            <div className="flex justify-center py-4 bg-slate-950/20 p-4 rounded-[2rem] border border-white/5">
              <div className="print-a5-container w-full max-w-[148mm] aspect-[1/1.414] bg-white text-slate-900 p-6 shadow-2xl relative flex flex-col justify-between text-left print-border-black font-sans leading-snug">
                
                {/* Book Header block */}
                <div className="space-y-2 text-center border-b-2 border-slate-900 pb-3 h-auto">
                  <div className="flex justify-center items-center gap-1.5">
                    <span className="p-1.5 bg-slate-900 text-white rounded-lg">
                      <QrCode className="w-4 h-4 text-white" />
                    </span>
                    <span className="font-extrabold tracking-widest text-[11px] text-slate-900 uppercase">MyCar Care Cambodia</span>
                  </div>
                  <h4 className="text-[13px] font-black text-slate-900 tracking-wider uppercase">
                    Official Certified Mechanical Service Book
                  </h4>
                  <p className="text-[9px] text-slate-500 font-semibold tracking-wider italic uppercase">
                    Windshield ID: MCC-{vehicle.id.toUpperCase()}-ST-{vehicle.year}
                  </p>
                </div>

                {/* Sub-Layout columns: Left specs, Right QR */}
                <div className="grid grid-cols-12 gap-4 my-3 items-center">
                  {/* Left Column: Vehicle technical passport passport parameters */}
                  <div className="col-span-7 space-y-2">
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 print-bg-light print-border-black">
                      <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest block leading-none">Vehicle Dossier</span>
                      <div className="space-y-1 text-[10px]">
                        <div className="flex justify-between border-b border-slate-100 pb-0.5 print-border-black">
                          <span className="text-slate-500 font-medium">Model:</span>
                          <strong className="text-slate-900 font-extrabold">{vehicle.brand} {vehicle.model}</strong>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 pb-0.5 print-border-black">
                          <span className="text-slate-500 font-medium">Year:</span>
                          <span className="text-slate-800 font-mono font-bold">{vehicle.year}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 pb-0.5 print-border-black">
                          <span className="text-slate-500 font-medium">Plate Reg No:</span>
                          <span className="text-slate-900 font-mono font-black uppercase">{vehicle.plateNumber || "PP-2X-4505"}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 pb-0.5 print-border-black">
                          <span className="text-slate-500 font-medium">Energy Class:</span>
                          <span className="text-slate-800 font-bold uppercase text-[9px] text-sky-700">{vehicle.fuelType || "Petrol"}</span>
                        </div>
                        {vehicle.chassisNumber && (
                          <div className="flex justify-between">
                            <span className="text-slate-500 font-medium">Chassis Serial:</span>
                            <span className="text-slate-700 font-mono text-[8px] tracking-tight">{vehicle.chassisNumber}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Pre-scaled QR Access code */}
                  <div className="col-span-5 text-center space-y-1.5">
                    <div className="p-2 bg-slate-100 border border-slate-200 rounded-2xl inline-block print-bg-light print-border-black">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(vehicle.qrSecureLink || `https://mycar.kh/car/${vehicle.id}`)}`} 
                        alt="A5 Service barcode sticker"
                        className="w-20 h-20"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <span className="text-[7.5px] text-slate-500 block leading-tight font-black uppercase tracking-wider">Official Diagnostic Seal</span>
                      <span className="text-[6.5px] text-slate-400 font-mono block">Scan with any mobile browser</span>
                    </div>
                  </div>
                </div>

                {/* Mechanic Scanner Instruction Text Block */}
                <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg text-center print-bg-light print-border-black text-[8px] text-slate-600 leading-normal border-l-2 border-l-sky-500 print-border-black">
                  <strong>Mechanic Notice:</strong> Scan QR code to view live telemetry statistics, filter weaknesses of this car and submit digital checkup signatures directly to the owner's online dashboard records.
                </div>

                {/* Printable physical ink stamp and signature logs grid table */}
                <div className="grow mt-3 space-y-1.5 flex flex-col justify-between">
                  <div className="flex items-center gap-1">
                    <span className="p-0.5 bg-slate-900 rounded text-stone-200 text-[8px] font-mono font-bold leading-none">GRID LOG</span>
                    <span className="text-[8.5px] font-black uppercase tracking-wider text-slate-800 font-mono">Ink-Stamp & Physical Work Logs</span>
                  </div>

                  <div className="border border-slate-300 rounded-xl overflow-hidden print-border-black grow flex flex-col justify-stretch">
                    {/* Header Row */}
                    <div className="grid grid-cols-12 bg-slate-100 border-b border-slate-200 text-[8px] font-black text-slate-600 uppercase tracking-wider print-bg-light print-border-black">
                      <div className="col-span-3 p-1.5 border-r border-slate-200 print-border-black">Date/Odo</div>
                      <div className="col-span-6 p-1.5 border-r border-slate-200 print-border-black">Work Completed & Replaced Parts</div>
                      <div className="col-span-3 p-1.5 text-center">Stamp/Sign</div>
                    </div>

                    {/* Blank Row 1 */}
                    <div className="grid grid-cols-12 border-b border-slate-150 text-[8.5px] print-border-black grow min-h-[22px]">
                      <div className="col-span-3 p-1.5 border-r border-slate-200 print-border-black text-slate-400 font-mono italic">/ &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; km</div>
                      <div className="col-span-6 p-1.5 border-r border-slate-200 print-border-black"></div>
                      <div className="col-span-3 p-1.5 text-center"></div>
                    </div>

                    {/* Blank Row 2 */}
                    <div className="grid grid-cols-12 border-b border-slate-150 text-[8.5px] print-border-black grow min-h-[22px]">
                      <div className="col-span-3 p-1.5 border-r border-slate-200 print-border-black text-slate-400 font-mono italic">/ &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; km</div>
                      <div className="col-span-6 p-1.5 border-r border-slate-200 print-border-black"></div>
                      <div className="col-span-3 p-1.5 text-center"></div>
                    </div>

                    {/* Blank Row 3 */}
                    <div className="grid grid-cols-12 border-b border-slate-150 text-[8.5px] print-border-black grow min-h-[22px]">
                      <div className="col-span-3 p-1.5 border-r border-slate-200 print-border-black text-slate-400 font-mono italic">/ &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; km</div>
                      <div className="col-span-6 p-1.5 border-r border-slate-200 print-border-black"></div>
                      <div className="col-span-3 p-1.5 text-center"></div>
                    </div>

                    {/* Blank Row 4 */}
                    <div className="grid grid-cols-12 text-[8.5px] print-border-black grow min-h-[22px]">
                      <div className="col-span-3 p-1.5 border-r border-slate-200 print-border-black text-slate-400 font-mono italic">/ &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; km</div>
                      <div className="col-span-6 p-1.5 border-r border-slate-200 print-border-black"></div>
                      <div className="col-span-3 p-1.5 text-center"></div>
                    </div>
                  </div>
                </div>

                {/* Footer validation stamp */}
                <div className="flex justify-between items-center text-[7.5px] text-slate-400 border-t border-slate-150 pt-2 mt-2 h-auto print-border-black">
                  <span>Secured by MyCar Care KH Cryptography Ledger</span>
                  <span className="font-mono font-bold text-slate-600">ID: {vehicle.id.toUpperCase()}</span>
                </div>
              </div>
            </div>

            {/* Direct printable action trigger */}
            <div className="text-center">
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-6 py-3 bg-sky-400 hover:bg-sky-500 text-slate-950 font-extrabold text-xs uppercase tracking-wider rounded-xl transition shadow-lg cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print A5 Insert Booklet</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

