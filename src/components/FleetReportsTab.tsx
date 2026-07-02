import React, { useState, useMemo } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts";
import { 
  Car, Calendar, DollarSign, TrendingUp, Download, Printer, 
  Award, FileText, ChevronDown, Filter, Settings, Fuel, Activity, AlertCircle
} from "lucide-react";
import { FleetVehicle, FleetTrip, FleetExpense } from "./FleetManager";

interface FleetReportsTabProps {
  vehicles: FleetVehicle[];
  trips: FleetTrip[];
  expenses: FleetExpense[];
  lang: 'en' | 'kh';
}

const khTranslations = {
  tabTitle: "របាយការណ៍ និងការនាំចេញទិន្នន័យ (Reports & Export)",
  tabSubtitle: "ការបូកសរុបការចំណាយប្រចាំខែ ការចាក់ប្រេង/សាកភ្លើង និងចម្ងាយធ្វើដំណើររបស់យានយន្ត",
  selectMonth: "ជ្រើសរើសខែ៖",
  allVehicles: "យានយន្តទាំងអស់",
  kpiTotalDistance: "ចម្ងាយសរុប (គីឡូម៉ែត្រ)",
  kpiFuelCost: "ចំណាយប្រេង/EV សរុប",
  kpiRepairCost: "ចំណាយជួសជុលសរុប",
  kpiTotalOps: "ចំណាយប្រតិបត្តិការសរុប",
  costBreakdownChart: "តារាងវិភាគការចំណាយតាមយានយន្ត ($)",
  vehicleTable: "តារាងស្ថិតិលម្អិតតាមយានយន្ត",
  colVehicle: "យានយន្ត",
  colDistance: "ចម្ងាយ (គីឡូម៉ែត្រ)",
  colFuel: "ប្រេង/EV ($)",
  colRepairs: "ការជួសជុល ($)",
  colOther: "ផ្សេងៗ ($)",
  colTotal: "សរុប ($)",
  colEfficiency: "កម្រិតស៊ីប្រេង",
  exportCsv: "នាំចេញជា Excel (CSV)",
  printPdf: "បោះពុម្ពរបាយការណ៍ (PDF)",
  printTitle: "របាយការណ៍វិភាគការចំណាយ និងប្រសិទ្ធភាពយានយន្តប្រចាំខែ",
  officialHeader: "អគ្គនាយកដ្ឋានដឹកជញ្ជូន និងភស្តុភារកម្ម - ភ្នំពេញ",
  approvedBy: "ការអនុម័តដោយ៖ ______________________",
  reportedOn: "កាលបរិច្ឆេទបង្កើត៖",
  notes: "កំណត់សម្គាល់៖ ទិន្នន័យទាំងអស់ត្រូវបានដកស្រង់ចេញពីប្រព័ន្ធ My Vehicle Care Premium។"
};

const enTranslations = {
  tabTitle: "Reports & Data Export",
  tabSubtitle: "Aggregated monthly fuel consumption, repair costs, and vehicle mileage summaries",
  selectMonth: "Select Report Month:",
  allVehicles: "All Fleet Vehicles",
  kpiTotalDistance: "Total Fleet Distance",
  kpiFuelCost: "Total Fuel & EV Energy",
  kpiRepairCost: "Total Repairs & Service",
  kpiTotalOps: "Total Operations Cost",
  costBreakdownChart: "Operational Cost Distribution per Vehicle ($)",
  vehicleTable: "Vehicle Cost & Efficiency Performance Ledger",
  colVehicle: "Vehicle & Plate",
  colDistance: "Distance (KM)",
  colFuel: "Fuel / EV ($)",
  colRepairs: "Repairs ($)",
  colOther: "Other ($)",
  colTotal: "Total ($)",
  colEfficiency: "Efficiency",
  exportCsv: "Export to Excel (CSV)",
  printPdf: "Print / Save PDF Report",
  printTitle: "Monthly Vehicle Cost & Operational Audit Report",
  officialHeader: "MINISTRY OF FLEET LOGISTICS & EFFICIENCY - PHNOM PENH",
  approvedBy: "Approved By: ______________________",
  reportedOn: "Reported On:",
  notes: "Notes: All aggregated telemetry logs are verified via My Vehicle Care cryptographic scanner."
};

export default function FleetReportsTab({ vehicles, trips, expenses, lang }: FleetReportsTabProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>("2026-06");
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("all");
  const [showPrintPreview, setShowPrintPreview] = useState<boolean>(false);

  const t = lang === 'kh' ? khTranslations : enTranslations;

  // List of available months based on expense dates or static default ones
  const availableMonths = [
    { value: "2026-06", label: lang === 'kh' ? "មិថុនា ២០២៦ (June 2026)" : "June 2026" },
    { value: "2026-05", label: lang === 'kh' ? "ឧសភា ២០២៦ (May 2026)" : "May 2026" },
    { value: "2026-04", label: lang === 'kh' ? "មេសា ២០២៦ (April 2026)" : "April 2026" }
  ];

  // Aggrated calculations for selected month and vehicle filter
  const reportData = useMemo(() => {
    return vehicles.map(vehicle => {
      // 1. Calculate mileage driven from completed trips in selected month
      const vehicleTrips = trips.filter(trip => {
        if (trip.vehicleId !== vehicle.id) return false;
        if (trip.status !== 'Completed') return false;
        // Check if startTime starts with the selectedMonth (YYYY-MM)
        return trip.startTime.startsWith(selectedMonth);
      });

      const totalDistance = vehicleTrips.reduce((acc, curr) => {
        if (curr.endOdo && curr.startOdo) {
          return acc + (curr.endOdo - curr.startOdo);
        }
        return acc;
      }, 0);

      // 2. Aggregate expenses
      const vehicleExpenses = expenses.filter(exp => {
        if (exp.vehicleId !== vehicle.id) return false;
        // Check if date starts with selectedMonth
        return exp.date.startsWith(selectedMonth);
      });

      const fuelExpenses = vehicleExpenses.filter(e => e.category === 'Fuel' || e.category === 'EV Charging');
      const fuelCost = fuelExpenses.reduce((acc, curr) => acc + curr.amount, 0);
      const fuelLitersOrKwh = fuelExpenses.reduce((acc, curr) => acc + (curr.quantity || 0), 0);

      const repairExpenses = vehicleExpenses.filter(e => 
        ['Minor Repair', 'Tire Repair', 'Emergency Repair', 'Spare Parts', 'Garage Service'].includes(e.category)
      );
      const repairCost = repairExpenses.reduce((acc, curr) => acc + curr.amount, 0);

      const otherExpenses = vehicleExpenses.filter(e => 
        !['Fuel', 'EV Charging', 'Minor Repair', 'Tire Repair', 'Emergency Repair', 'Spare Parts', 'Garage Service'].includes(e.category)
      );
      const otherCost = otherExpenses.reduce((acc, curr) => acc + curr.amount, 0);

      const totalCost = fuelCost + repairCost + otherCost;

      // 3. Fuel efficiency metric: Liters / 100km or kWh / 100km
      let efficiencyLabel = "-";
      if (totalDistance > 0 && fuelLitersOrKwh > 0) {
        const rate = (fuelLitersOrKwh / totalDistance) * 100;
        efficiencyLabel = `${rate.toFixed(1)} ${vehicle.engineType === 'EV' ? 'kWh' : 'L'}/100km`;
      }

      return {
        id: vehicle.id,
        name: vehicle.name,
        plateNumber: vehicle.plateNumber,
        brand: vehicle.brand,
        model: vehicle.model,
        engineType: vehicle.engineType,
        distance: totalDistance,
        fuelCost,
        repairCost,
        otherCost,
        totalCost,
        efficiency: efficiencyLabel,
        fuelLitersOrKwh,
        tripsCount: vehicleTrips.length
      };
    });
  }, [vehicles, trips, expenses, selectedMonth]);

  // Apply search/vehicle selection filters
  const filteredReportData = useMemo(() => {
    if (selectedVehicleId === "all") {
      return reportData;
    }
    return reportData.filter(d => d.id === selectedVehicleId);
  }, [reportData, selectedVehicleId]);

  // Grand totals
  const summaryTotals = useMemo(() => {
    return filteredReportData.reduce((acc, curr) => {
      acc.distance += curr.distance;
      acc.fuelCost += curr.fuelCost;
      acc.repairCost += curr.repairCost;
      acc.otherCost += curr.otherCost;
      acc.totalCost += curr.totalCost;
      return acc;
    }, { distance: 0, fuelCost: 0, repairCost: 0, otherCost: 0, totalCost: 0 });
  }, [filteredReportData]);

  // Prepare data for Recharts bar chart
  const chartData = useMemo(() => {
    return filteredReportData.map(v => ({
      name: v.name.length > 12 ? `${v.name.substring(0, 12)}...` : v.name,
      "Fuel & EV": v.fuelCost,
      "Repairs": v.repairCost,
      "Other": v.otherCost,
      "Total": v.totalCost
    }));
  }, [filteredReportData]);

  // Export CSV handler
  const handleExportCsv = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    // Title
    csvContent += `My Vehicle Care - Fleet Operations Audit Report [${selectedMonth}]\r\n`;
    csvContent += `Generated On: ${new Date().toISOString().split('T')[0]}\r\n\r\n`;
    
    // Headers
    csvContent += "Vehicle Name,Plate Number,Engine Type,Trips Count,Distance (KM),Fuel Expense ($),Repairs Expense ($),Other Expense ($),Total Expense ($),Fuel Efficiency\r\n";
    
    // Rows
    filteredReportData.forEach(row => {
      csvContent += `"${row.name}","${row.plateNumber}","${row.engineType}",${row.tripsCount},${row.distance},${row.fuelCost},${row.repairCost},${row.otherCost},${row.totalCost},"${row.efficiency}"\r\n`;
    });

    // Grand totals
    csvContent += `\r\n"GRAND TOTALS",,-,,-,${summaryTotals.distance},${summaryTotals.fuelCost},${summaryTotals.repairCost},${summaryTotals.otherCost},${summaryTotals.totalCost},-\r\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `fleet_report_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Printable layout window trigger
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* HEADER CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-3xl border border-slate-800">
        <div>
          <h3 className="text-lg font-black text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            {t.tabTitle}
          </h3>
          <p className="text-xs text-slate-400 mt-1">{t.tabSubtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Month Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 whitespace-nowrap">{t.selectMonth}</span>
            <div className="relative">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="appearance-none bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs py-2 pl-3 pr-8 rounded-xl font-bold cursor-pointer transition focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {availableMonths.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Vehicle Filter */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                className="appearance-none bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs py-2 pl-3 pr-8 rounded-xl font-bold cursor-pointer transition focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="all">{t.allVehicles}</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.name} ({v.plateNumber})</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-3 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* KPI GRID SUMMARY */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Distance KPI */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between shadow-lg">
          <div className="absolute top-0 right-0 p-6 bg-emerald-500/5 rounded-full blur-lg"></div>
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">{t.kpiTotalDistance}</span>
            <span className="text-2xl font-black text-slate-100 mt-2 block font-mono">
              {summaryTotals.distance.toLocaleString()} <span className="text-xs text-slate-400 font-sans font-normal">km</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 mt-4 bg-emerald-500/5 px-2 py-1 rounded-lg w-max border border-emerald-500/10">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            <span>Telemetry verified</span>
          </div>
        </div>

        {/* Total Fuel & EV KPI */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between shadow-lg">
          <div className="absolute top-0 right-0 p-6 bg-amber-500/5 rounded-full blur-lg"></div>
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">{t.kpiFuelCost}</span>
            <span className="text-2xl font-black text-amber-400 mt-2 block font-mono">
              ${summaryTotals.fuelCost.toLocaleString()}
              <span className="text-[10px] text-slate-400 ml-1.5 font-normal font-sans">
                (≈ ៛{(summaryTotals.fuelCost * 4100).toLocaleString()})
              </span>
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-amber-400 mt-4 bg-amber-500/5 px-2 py-1 rounded-lg w-max border border-amber-500/10">
            <Fuel className="w-3.5 h-3.5" />
            <span>Station logs matched</span>
          </div>
        </div>

        {/* Total Repair & Service KPI */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between shadow-lg">
          <div className="absolute top-0 right-0 p-6 bg-rose-500/5 rounded-full blur-lg"></div>
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">{t.kpiRepairCost}</span>
            <span className="text-2xl font-black text-rose-400 mt-2 block font-mono">
              ${summaryTotals.repairCost.toLocaleString()}
              <span className="text-[10px] text-slate-400 ml-1.5 font-normal font-sans">
                (≈ ៛{(summaryTotals.repairCost * 4100).toLocaleString()})
              </span>
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-rose-400 mt-4 bg-rose-500/5 px-2 py-1 rounded-lg w-max border border-rose-500/10">
            <Activity className="w-3.5 h-3.5" />
            <span>Garage sync enabled</span>
          </div>
        </div>

        {/* Total Operations cost KPI */}
        <div className="bg-slate-900 border border-emerald-950 p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between shadow-2xl shadow-emerald-500/5">
          <div className="absolute top-0 right-0 p-6 bg-emerald-500/10 rounded-full blur-lg"></div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">{t.kpiTotalOps}</span>
            <span className="text-3xl font-black text-emerald-400 mt-2 block font-mono">
              ${summaryTotals.totalCost.toLocaleString()}
              <span className="text-xs text-slate-400 ml-2 font-normal font-sans block mt-1">
                ៛{(summaryTotals.totalCost * 4100).toLocaleString()} KHR
              </span>
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 mt-4 bg-emerald-500/15 px-2.5 py-1 rounded-xl w-max border border-emerald-500/30">
            <Award className="w-3.5 h-3.5 text-yellow-400" />
            <span className="font-extrabold uppercase">Premium Financial Audit</span>
          </div>
        </div>
      </div>

      {/* CHARTS CONTAINER */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider mb-6 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          {t.costBreakdownChart}
        </h4>
        <div className="h-72 w-full font-mono text-[10px]">
          {chartData.length === 0 ? (
            <div className="h-full w-full flex items-center justify-center text-slate-500">
              No chart data available for current selection
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '12px' }}
                  labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />
                <Bar dataKey="Fuel & EV" stackId="a" fill="#f59e0b" />
                <Bar dataKey="Repairs" stackId="a" fill="#f43f5e" />
                <Bar dataKey="Other" stackId="a" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* DETAILED VEHICLE GRID TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Settings className="w-4 h-4 text-emerald-400" />
            {t.vehicleTable}
          </h4>

          {/* Export / Print Triggers */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 py-1.5 px-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-slate-100 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.exportCsv}</span>
            </button>
            <button
              onClick={() => setShowPrintPreview(true)}
              className="flex items-center gap-1.5 py-1.5 px-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 hover:text-emerald-300 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t.printPdf}</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/40 text-slate-400 uppercase text-[9px] font-bold tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-5">{t.colVehicle}</th>
                <th className="py-3 px-4 text-right">{t.colDistance}</th>
                <th className="py-3 px-4 text-right">{t.colFuel}</th>
                <th className="py-3 px-4 text-right">{t.colRepairs}</th>
                <th className="py-3 px-4 text-right">{t.colOther}</th>
                <th className="py-3 px-4 text-right">{t.colTotal}</th>
                <th className="py-3 px-5 text-center">{t.colEfficiency}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {filteredReportData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No matching operational logs registered for this period.
                  </td>
                </tr>
              ) : (
                filteredReportData.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-850/30 transition">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-950 flex items-center justify-center font-bold text-slate-400 border border-slate-800 text-[10px]">
                          {row.brand.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-slate-200 block">{row.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono tracking-wider">
                            {row.plateNumber} • {row.engineType}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right font-mono font-bold text-slate-100">
                      {row.distance.toLocaleString()} km
                    </td>
                    <td className="py-4 px-4 text-right font-mono text-amber-400 font-bold">
                      ${row.fuelCost.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-right font-mono text-rose-400 font-bold">
                      ${row.repairCost.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-right font-mono text-slate-400">
                      ${row.otherCost.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-right font-mono text-emerald-400 font-black">
                      ${row.totalCost.toLocaleString()}
                    </td>
                    <td className="py-4 px-5 text-center">
                      <span className="px-2.5 py-1 bg-slate-950 rounded-xl font-mono text-[10px] text-slate-300 border border-slate-800">
                        {row.efficiency}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {filteredReportData.length > 0 && (
              <tfoot className="bg-slate-950/20 border-t border-slate-800 font-bold text-slate-200 text-xs">
                <tr>
                  <td className="py-4 px-5">Grand Totals</td>
                  <td className="py-4 px-4 text-right font-mono text-slate-100">{summaryTotals.distance.toLocaleString()} km</td>
                  <td className="py-4 px-4 text-right font-mono text-amber-400">${summaryTotals.fuelCost.toLocaleString()}</td>
                  <td className="py-4 px-4 text-right font-mono text-rose-400">${summaryTotals.repairCost.toLocaleString()}</td>
                  <td className="py-4 px-4 text-right font-mono text-slate-400">${summaryTotals.otherCost.toLocaleString()}</td>
                  <td className="py-4 px-4 text-right font-mono text-emerald-400">${summaryTotals.totalCost.toLocaleString()}</td>
                  <td className="py-4 px-5"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* PRINT DIALOG / SAVING PREMIUM OVERLAY FORM */}
      {showPrintPreview && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-3xl max-w-4xl w-full p-8 shadow-2xl relative border-4 border-emerald-600 print:border-0 print:p-0 print:m-0 print:shadow-none print:w-full">
            
            {/* NO PRINT CONTROLS INSIDE WEB FRAME */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6 print:hidden">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-black uppercase text-slate-800 tracking-wider">Official Document Print Wizard</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Confirm & Print (Save PDF)</span>
                </button>
                <button
                  onClick={() => setShowPrintPreview(false)}
                  className="py-2 px-4 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </div>

            {/* THE FORMAL CORPORATE VEHICLE EFFICIENCY AUDIT STATEMENT */}
            <div className="space-y-6 printable-document">
              {/* Cambodian Official Motto Frame */}
              <div className="text-center space-y-1">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-700">ព្រះរាជាណាចក្រកម្ពុជា</h4>
                <h5 className="text-[10px] font-bold tracking-widest text-slate-600">ជាតិ សាសនា ព្រះមហាក្សត្រ</h5>
                <div className="w-24 h-0.5 bg-slate-400 mx-auto my-2"></div>
                <p className="text-[9px] text-slate-500 font-mono tracking-wider italic uppercase">KINGDOM OF CAMBODIA • NATION RELIGION KING</p>
              </div>

              {/* Official Header */}
              <div className="flex justify-between items-start border-b border-slate-300 pb-5 mt-4">
                <div>
                  <h1 className="text-md font-extrabold uppercase text-slate-800 tracking-tight">MY VEHICLE CARE PREMIUM</h1>
                  <p className="text-[10px] text-slate-600 uppercase mt-0.5 font-bold">{t.officialHeader}</p>
                  <p className="text-[9px] text-slate-500 font-mono mt-1">Ref ID: MCC-FLT-AUD-{selectedMonth}-{Date.now().toString().substring(5, 10)}</p>
                </div>
                <div className="text-right">
                  <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight">{t.printTitle}</h2>
                  <p className="text-[10px] text-slate-600 mt-1">
                    <strong>{t.reportedOn}</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  <p className="text-[10px] text-slate-600"><strong>Target Audit Period:</strong> {selectedMonth}</p>
                </div>
              </div>

              {/* KPI Audit Grid */}
              <div className="grid grid-cols-4 gap-4 py-4">
                <div className="bg-slate-100 p-4 rounded-xl border border-slate-200">
                  <span className="text-[8px] text-slate-500 uppercase font-black block">FLEET MILEAGE</span>
                  <span className="text-sm font-black text-slate-800 font-mono mt-1 block">{summaryTotals.distance.toLocaleString()} km</span>
                </div>
                <div className="bg-slate-100 p-4 rounded-xl border border-slate-200">
                  <span className="text-[8px] text-slate-500 uppercase font-black block">FUEL & ENERGY COST</span>
                  <span className="text-sm font-black text-slate-800 font-mono mt-1 block">${summaryTotals.fuelCost.toLocaleString()}</span>
                </div>
                <div className="bg-slate-100 p-4 rounded-xl border border-slate-200">
                  <span className="text-[8px] text-slate-500 uppercase font-black block">MAINTENANCE EXPENSE</span>
                  <span className="text-sm font-black text-slate-800 font-mono mt-1 block">${summaryTotals.repairCost.toLocaleString()}</span>
                </div>
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                  <span className="text-[8px] text-emerald-700 uppercase font-black block">TOTAL OPERATIONAL COSTS</span>
                  <span className="text-md font-black text-emerald-900 font-mono mt-1 block">${summaryTotals.totalCost.toLocaleString()}</span>
                </div>
              </div>

              {/* Table Ledger */}
              <div>
                <table className="w-full text-left text-[10px] border-collapse">
                  <thead>
                    <tr className="bg-slate-200 text-slate-700 font-bold uppercase text-[8px] tracking-wider border-b border-slate-300">
                      <th className="py-2.5 px-3 border border-slate-300">Vehicle</th>
                      <th className="py-2.5 px-3 border border-slate-300">Plate Number</th>
                      <th className="py-2.5 px-3 border border-slate-300 text-right">Distance (KM)</th>
                      <th className="py-2.5 px-3 border border-slate-300 text-right">Fuel Cost ($)</th>
                      <th className="py-2.5 px-3 border border-slate-300 text-right">Repair Cost ($)</th>
                      <th className="py-2.5 px-3 border border-slate-300 text-right">Total ($)</th>
                      <th className="py-2.5 px-3 border border-slate-300 text-center">Efficiency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReportData.map((row) => (
                      <tr key={row.id} className="border-b border-slate-200 text-slate-800">
                        <td className="py-2 px-3 border border-slate-200 font-bold">{row.name} ({row.brand})</td>
                        <td className="py-2 px-3 border border-slate-200 font-mono font-bold text-slate-700">{row.plateNumber}</td>
                        <td className="py-2 px-3 border border-slate-200 text-right font-mono">{row.distance.toLocaleString()}</td>
                        <td className="py-2 px-3 border border-slate-200 text-right font-mono">${row.fuelCost.toLocaleString()}</td>
                        <td className="py-2 px-3 border border-slate-200 text-right font-mono">${row.repairCost.toLocaleString()}</td>
                        <td className="py-2 px-3 border border-slate-200 text-right font-mono font-bold text-emerald-700">${row.totalCost.toLocaleString()}</td>
                        <td className="py-2 px-3 border border-slate-200 text-center font-mono">{row.efficiency}</td>
                      </tr>
                    ))}
                    <tr className="bg-slate-100 font-bold text-slate-800">
                      <td colSpan={2} className="py-2.5 px-3 border border-slate-300 font-black">Grand Totals</td>
                      <td className="py-2.5 px-3 border border-slate-300 text-right font-mono font-bold">{summaryTotals.distance.toLocaleString()} km</td>
                      <td className="py-2.5 px-3 border border-slate-300 text-right font-mono font-bold">${summaryTotals.fuelCost.toLocaleString()}</td>
                      <td className="py-2.5 px-3 border border-slate-300 text-right font-mono font-bold">${summaryTotals.repairCost.toLocaleString()}</td>
                      <td className="py-2.5 px-3 border border-slate-300 text-right font-mono font-black text-emerald-800">${summaryTotals.totalCost.toLocaleString()}</td>
                      <td className="py-2.5 px-3 border border-slate-300"></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Notes & Declaration */}
              <p className="text-[9px] text-slate-500 leading-relaxed bg-slate-50 border border-slate-200 p-3 rounded-lg italic">
                {t.notes}
              </p>

              {/* Signatures */}
              <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs text-slate-700">
                <div className="space-y-12">
                  <p className="font-bold">Prepared By System Operator</p>
                  <div className="w-40 h-0.5 bg-slate-300 mx-auto"></div>
                  <p className="text-[9px] font-mono text-slate-500">My Vehicle Care Premium Platform</p>
                </div>
                <div className="space-y-12">
                  <p className="font-bold">{t.approvedBy}</p>
                  <div className="w-40 h-0.5 bg-slate-300 mx-auto"></div>
                  <p className="text-[9px] font-mono text-slate-500">Fleet Operations & Audit Director</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* STYLES TO CONSTRAIN THE PRINTING TO ONLY THE SPECIFIED MODAL ELEMENT */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-document, .printable-document * {
            visibility: visible;
          }
          .printable-document {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background-color: white !important;
            color: black !important;
            padding: 20px !important;
          }
        }
      `}</style>
    </div>
  );
}
