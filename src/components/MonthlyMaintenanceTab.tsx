import React, { useState } from "react";
import { 
  CheckCircle, 
  Circle, 
  Wrench, 
  Plus, 
  Trash2, 
  PlayCircle,
  FileText,
  Calendar,
  AlertCircle,
  TrendingUp,
  X,
  UserCheck
} from "lucide-react";

interface MonthlyChecklistItem {
  id: string;
  name: string;
  status: 'Pending' | 'Completed' | 'In Progress' | 'Skipped';
  checkedBy: string;
}

interface MonthlyChecklist {
  id: string;
  vehicleId: string;
  ownerId: string;
  month: string;
  year: number;
  checklistItems: MonthlyChecklistItem[];
  notes: string;
  attachments: string[];
}

interface MonthlyMaintenanceTabProps {
  vehicleId: string;
  checklists: MonthlyChecklist[];
  onToggleItem: (checklistId: string, itemId: string, status: 'Pending' | 'Completed' | 'In Progress' | 'Skipped', checkedBy: string) => Promise<void>;
  onCreateChecklist: (vehicleId: string, month: string, year: number, items: any[], notes: string) => Promise<void>;
  refreshData: () => void;
}

const defaultTasks = [
  "Check engine oil level",
  "Inspect tire inflation & pressures",
  "Top-up windshield wiper fluids",
  "Verify radiator coolant reserve level",
  "Inspect brake fluid transparency",
  "Check headlamp & high beam alignments",
  "Inspect EV battery / accessory links"
];

export default function MonthlyMaintenanceTab({
  vehicleId,
  checklists,
  onToggleItem,
  onCreateChecklist,
  refreshData
}: MonthlyMaintenanceTabProps) {
  const activeChecklists = checklists.filter(c => c.vehicleId === vehicleId);

  // Selector for currently displayed checklist
  const [selectedIdx, setSelectedIdx] = useState(0);
  const activeList = activeChecklists[selectedIdx] || null;

  // New list Creation variables
  const [isCreating, setIsCreating] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("June 2026");
  const [selectedYear, setSelectedYear] = useState(2026);
  const [customTasks, setCustomTasks] = useState<string[]>(defaultTasks);
  const [inputTask, setInputTask] = useState("");
  const [createNotes, setCreateNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Toggle item statuses
  const handleItemStatusToggle = async (checklistId: string, itemId: string, currentStatus: string) => {
    let nextStatus: 'Pending' | 'Completed' | 'In Progress' | 'Skipped' = 'Pending';
    if (currentStatus === 'Pending') nextStatus = 'In Progress';
    else if (currentStatus === 'In Progress') nextStatus = 'Completed';
    else if (currentStatus === 'Completed') nextStatus = 'Skipped';
    else nextStatus = 'Pending';

    try {
      await onToggleItem(checklistId, itemId, nextStatus, "Owner/User");
      refreshData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddNewTaskInput = () => {
    if (!inputTask.trim()) return;
    setCustomTasks([...customTasks, inputTask.trim()]);
    setInputTask("");
  };

  const handleRemoveTaskLiteral = (index: number) => {
    setCustomTasks(customTasks.filter((_, idx) => idx !== index));
  };

  const handleCreateNewChecklist = async () => {
    if (customTasks.length === 0) {
      alert("Please configure at least one checklist item.");
      return;
    }

    setSubmitting(true);
    try {
      const itemsList = customTasks.map((t, idx) => ({
        id: `item-gen-${idx}-${Date.now()}`,
        name: t,
        status: "Pending",
        checkedBy: "None"
      }));

      await onCreateChecklist(vehicleId, selectedMonth, selectedYear, itemsList, createNotes);
      setIsCreating(false);
      setCustomTasks(defaultTasks);
      setCreateNotes("");
      setSelectedIdx(0);
      refreshData();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  // Compile calculations for progress meters
  const computeProgress = (list: MonthlyChecklist) => {
    if (!list.checklistItems || list.checklistItems.length === 0) return 0;
    const completed = list.checklistItems.filter(i => i.status === "Completed").length;
    return Math.round((completed / list.checklistItems.length) * 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
            Monthly Recurring Maintenance Services
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Track user audits and recurring inspection checklists to secure long-term engine and electrical longevity.
          </p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="p-2 px-3.5 bg-sky-500 hover:bg-sky-600 text-slate-950 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5 text-slate-950" />
          <span>Setup Next Checklist</span>
        </button>
      </div>

      {activeChecklists.length === 0 && !isCreating ? (
        <div className="glass rounded-2xl p-10 text-center space-y-4">
          <div className="w-12 h-12 bg-white/5 text-slate-400 rounded-xl flex items-center justify-center mx-auto border border-white/10">
            <Calendar className="w-6 h-6 text-sky-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-200">No Monthly Checklist Outlined</h4>
            <p className="text-slate-400 text-xs mt-1">
              Construct a recurring checklist to trace self-audits and items not usually reported by automated OBD.
            </p>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 bg-sky-500/10 hover:bg-sky-500/25 text-sky-400 border border-sky-500/25 font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Create June 2026 Template
          </button>
        </div>
      ) : activeChecklists.length > 0 && !isCreating ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left panel: list selector & stats progress dials */}
          <div className="lg:col-span-4 space-y-4">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Checklist Periods</span>
            <div className="space-y-2">
              {activeChecklists.map((c, i) => {
                const completion = computeProgress(c);
                const isSelected = i === selectedIdx;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedIdx(i)}
                    className={`w-full p-4 rounded-2xl text-left border transition cursor-pointer flex justify-between items-center ${
                      isSelected 
                        ? 'bg-sky-500/10 border-sky-500/30 text-slate-100 shadow-md' 
                        : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                    }`}
                  >
                    <div>
                      <h4 className="font-bold text-xs uppercase">{c.month}</h4>
                      <p className="text-[9px] mt-0.5">{c.checklistItems?.length || 0} Inspected parameters</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-black font-mono ${completion === 100 ? "text-emerald-400" : "text-sky-400"}`}>
                        {completion}%
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Gauge summary */}
            {activeList && (
              <div className="glass rounded-2xl p-4 space-y-3.5 border border-white/5">
                <span className="text-[9px] text-slate-400 font-bold uppercase block tracking-wider">Health Audit Index</span>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-400">Inspected</span>
                    <span className="font-bold text-slate-200">
                      {activeList.checklistItems.filter(itm => itm.status === "Completed").length} / {activeList.checklistItems.length} Saved
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-emerald-400 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${computeProgress(activeList)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel: Checklist items interactive grid */}
          <div className="lg:col-span-8 space-y-5">
            {activeList && (
              <div className="glass rounded-3xl p-6 border border-white/5 space-y-5">
                <div className="border-b border-white/5 pb-4">
                  <span className="text-[10px] text-sky-400 font-bold uppercase tracking-widest font-mono">Month Period: {activeList.month} {activeList.year}</span>
                  <h4 className="text-slate-100 font-extrabold text-base mt-1">Inspection Checklist Log</h4>
                  {activeList.notes && (
                    <p className="text-xs text-slate-400 mt-2 italic">
                      "{activeList.notes}"
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  {activeList.checklistItems && activeList.checklistItems.map((item) => {
                    // Resolve status styling
                    const getTaskStyle = (s: string) => {
                      if (s === "Completed") return { color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", tag: "Completed" };
                      if (s === "In Progress") return { color: "text-sky-400", bg: "bg-sky-500/10 border-sky-500/20", tag: "In Progress" };
                      if (s === "Skipped") return { color: "text-slate-500", bg: "bg-white/5 border-white/5", tag: "Skipped" };
                      return { color: "text-slate-400", bg: "bg-white/5 border-white/5", tag: "Pending" };
                    };
                    const style = getTaskStyle(item.status);

                    return (
                      <div 
                        key={item.id}
                        onClick={() => handleItemStatusToggle(activeList.id, item.id, item.status)}
                        className="p-3.5 bg-slate-950/40 border border-white/5 hover:border-white/10 rounded-2xl transition flex items-center justify-between cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`${style.color}`}>
                            {item.status === 'Completed' ? (
                              <CheckCircle className="w-5 h-5 shrink-0" />
                            ) : item.status === 'In Progress' ? (
                              <PlayCircle className="w-5 h-5 shrink-0" />
                            ) : (
                              <Circle className="w-5 h-5 shrink-0" />
                            )}
                          </span>
                          <div>
                            <span className={`text-[12.5px] font-semibold tracking-tight transition ${item.status === 'Completed' ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                              {item.name}
                            </span>
                            {item.checkedBy !== "None" && (
                              <span className="text-[9px] text-slate-500 font-bold tracking-wider block mt-0.5 uppercase">
                                Verified: {item.checkedBy}
                              </span>
                            )}
                          </div>
                        </div>

                        <span className={`p-1 px-2 border rounded-lg text-[9px] font-extrabold uppercase font-mono ${style.bg} ${style.color}`}>
                          {style.tag}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="p-3 bg-white/5 rounded-2xl flex items-start gap-2.5 text-[10px] text-slate-400">
                  <AlertCircle className="w-4 h-4 text-sky-400 mt-0.5 shrink-0" />
                  <p className="leading-relaxed">
                    <strong>Developer tip:</strong> Tap any task row once to cycle its status: <strong className="text-slate-350">Pending</strong> ➜ <strong className="text-sky-400">In Progress</strong> ➜ <strong className="text-emerald-400">Completed</strong> ➜ <strong className="text-slate-500">Skipped</strong>. Status changes are stored in real-time.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Checklist design setup mode */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="w-full max-w-xl glass rounded-3xl p-6 border border-white/10 shadow-2xl relative space-y-6 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsCreating(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <Wrench className="w-4 h-4 text-sky-400" />
                <span>Outline New Period Checklist</span>
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Register a technical checklist form for recurring garage inspections.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 text-xs">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Month Period</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full bg-slate-900 border border-white/15 p-2 rounded-xl text-slate-100 focus:outline-none"
                >
                  <option value="June 2026">June 2026</option>
                  <option value="July 2026">July 2026</option>
                  <option value="August 2026">August 2026</option>
                  <option value="September 2026">September 2026</option>
                  <option value="October 2026">October 2026</option>
                </select>
              </div>
              <div className="space-y-1 text-xs">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Calendar Year</label>
                <input
                  type="number"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-white/15 p-2 rounded-xl text-slate-100 focus:outline-none"
                />
              </div>
            </div>

            {/* Task adder tool */}
            <div className="space-y-3">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Configure Tasks Parameters</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputTask}
                  onChange={(e) => setInputTask(e.target.value)}
                  placeholder="e.g., Clean electric battery cooling ports..."
                  className="flex-1 bg-slate-900 border border-white/15 p-2 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                />
                <button
                  type="button"
                  onClick={handleAddNewTaskInput}
                  className="px-4 bg-sky-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-sky-600 transition cursor-pointer flex items-center center justify-center"
                >
                  <span>Add Task</span>
                </button>
              </div>

              {/* Listed tags */}
              <div className="max-h-52 overflow-y-auto space-y-1.5 bg-slate-950/50 p-3 rounded-2xl border border-white/5">
                {customTasks.length === 0 ? (
                  <p className="text-[11px] text-slate-500 italic py-2 text-center">No tasks specified. Add using form above.</p>
                ) : (
                  customTasks.map((t, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs p-2 bg-white/5 rounded-lg">
                      <span className="text-slate-300 font-semibold">{t}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTaskLiteral(idx)}
                        className="text-rose-400 p-0.5 hover:text-rose-350 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <label className="text-[10px] text-slate-400 font-bold uppercase">Audit Scope notes / description</label>
              <textarea
                value={createNotes}
                onChange={(e) => setCreateNotes(e.target.value)}
                placeholder="Diagnostic scope details to communicate during check..."
                className="w-full h-16 bg-slate-900 border border-white/15 p-2.5 rounded-xl text-slate-100 focus:outline-none focus:border-sky-500 resize-none"
              ></textarea>
            </div>

            <button
              onClick={handleCreateNewChecklist}
              disabled={submitting}
              className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-slate-950 font-black text-xs rounded-xl"
            >
              {submitting ? "Publishing form parameters..." : "Confirm & Setup Checklist Template"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
