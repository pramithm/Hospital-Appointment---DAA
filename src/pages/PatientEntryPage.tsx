import { useState, useMemo } from 'react';
import { useStore } from '@/store/StoreContext';
import { SeverityBadge } from '@/components/Badges';
import type { Severity } from '@/types';
import {
  UserPlus,
  Sparkles,
  CheckCircle2,
  BookmarkCheck,
} from 'lucide-react';

const COMMON_PRESETS = [
  {
    name: 'Acute Cardiac Emergency',
    severity: 'Critical' as Severity,
    complaint: 'Crushing chest pain radiating to left arm, acute diaphoresis',
    stops: ['ENTRANCE', 'EMERGENCY', 'CARDIO', 'IMAGING_ADV', 'SURGERY_OT'],
  },
  {
    name: 'Orthopedic Fracture',
    severity: 'Emergency' as Severity,
    complaint: 'Suspected femur fracture following vehicle collision',
    stops: ['ENTRANCE', 'TRIAGE', 'EMERGENCY', 'IMAGING_XRAY', 'SURGERY_OT'],
  },
  {
    name: 'Abdominal Diagnostic Workup',
    severity: 'Urgent' as Severity,
    complaint: 'Acute lower quadrant pain, high fever, elevated WBC count',
    stops: ['ENTRANCE', 'TRIAGE', 'OPD_GEN', 'LAB_PATH', 'IMAGING_XRAY', 'PHARMACY'],
  },
  {
    name: 'General Consultation & Labs',
    severity: 'Routine' as Severity,
    complaint: 'Persistent dry cough, fatigue, routine lipid screening',
    stops: ['ENTRANCE', 'TRIAGE', 'OPD_GEN', 'LAB_PATH', 'PHARMACY', 'BILLING_DISCHARGE'],
  },
];

export function PatientEntryPage() {
  const { nodes, addPatient, planMultiStop } = useStore();

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'M' | 'F' | 'Other'>('M');
  const [severity, setSeverity] = useState<Severity>('Routine');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [selectedStops, setSelectedStops] = useState<string[]>([
    'ENTRANCE',
    'TRIAGE',
    'OPD_GEN',
    'PHARMACY',
    'BILLING_DISCHARGE',
  ]);
  const [registeredSuccess, setRegisteredSuccess] = useState<boolean>(false);

  // Real-time Dijkstra calculation of the chosen route
  const previewRoute = useMemo(() => {
    return planMultiStop(selectedStops, severity);
  }, [planMultiStop, selectedStops, severity]);

  const toggleStop = (id: string) => {
    if (id === 'ENTRANCE') return; // Always mandatory start
    setSelectedStops((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const applyPreset = (preset: typeof COMMON_PRESETS[0]) => {
    setSeverity(preset.severity);
    setChiefComplaint(preset.complaint);
    setSelectedStops(preset.stops);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const parsedAge = parseInt(age, 10) || 30;

    addPatient(
      name.trim(),
      parsedAge,
      gender,
      severity,
      chiefComplaint.trim() || 'General intake evaluation',
      selectedStops
    );

    setRegisteredSuccess(true);
    setTimeout(() => setRegisteredSuccess(false), 4000);

    // Reset fields
    setName('');
    setAge('');
    setChiefComplaint('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <UserPlus className="text-teal-600 dark:text-teal-400" size={28} />
          Patient Intake & Clinical Route Planning
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Register incoming patients and automatically calculate the fastest clinical pathway across required departments.
        </p>
      </div>

      {/* Preset Care Pathways */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
          <BookmarkCheck size={16} className="text-teal-600" />
          Quick Clinical Templates:
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {COMMON_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => applyPreset(preset)}
              className="text-left p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-teal-500 hover:bg-teal-50/40 dark:hover:bg-slate-700/50 transition-all text-xs"
            >
              <div className="font-semibold text-slate-800 dark:text-slate-200 mb-1">
                {preset.name}
              </div>
              <div className="mb-1">
                <SeverityBadge severity={preset.severity} />
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                {preset.stops.length} stations
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Registration Form */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4 pb-2 border-b border-slate-100 dark:border-slate-700">
            Patient Information
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Patient Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gabriel Morales"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Age
                </label>
                <input
                  type="number"
                  placeholder="e.g. 42"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Biological Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as 'M' | 'F' | 'Other')}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Triage Severity
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as Severity)}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Routine">Routine (P4)</option>
                  <option value="Urgent">Urgent (P3)</option>
                  <option value="Emergency">Emergency (P2)</option>
                  <option value="Critical">Critical (P1)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Chief Medical Complaint
              </label>
              <textarea
                rows={2}
                placeholder="Describe presenting symptoms, pain scale, and clinical notes..."
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Department Checkpoints */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
                Required Department Stops in Care Journey
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {nodes.map((n) => {
                  const isSelected = selectedStops.includes(n.id);
                  const isEntrance = n.id === 'ENTRANCE';

                  return (
                    <button
                      key={n.id}
                      type="button"
                      disabled={isEntrance}
                      onClick={() => toggleStop(n.id)}
                      className={`text-left p-2 rounded-lg border text-xs font-medium transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-teal-500 bg-teal-50/80 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200 font-semibold'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                      }`}
                    >
                      <span>{n.shortCode}</span>
                      <span className="text-[10px] text-slate-400">
                        {isSelected ? '✓ Selected' : '+ Add'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <UserPlus size={16} />
              Register Patient & Generate Care Route
            </button>

            {registeredSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <span>Patient successfully registered into the hospital system!</span>
              </div>
            )}
          </form>
        </div>

        {/* Live Route Preview Card */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-3 pb-2 border-b border-slate-100 dark:border-slate-700">
              <Sparkles className="text-teal-500" size={18} />
              Estimated Route & Travel Time
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Total Estimated Time
                  </span>
                  <span className="text-xl font-black text-teal-600 dark:text-teal-400">
                    {previewRoute.totalTimeMinutes}m
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Transit + wait time
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Walking Distance
                  </span>
                  <span className="text-xl font-black text-slate-800 dark:text-slate-100">
                    {previewRoute.totalDistanceMeters}m
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Floor walkway distance
                  </span>
                </div>
              </div>

              {/* Waypoints sequence */}
              <div>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-2">
                  Optimized Transit Step Sequence:
                </span>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {previewRoute.fullPath.map((nodeId, idx) => {
                    const node = nodes.find((n) => n.id === nodeId);
                    if (!node) return null;

                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-700 text-xs"
                      >
                        <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 text-[10px] font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-slate-800 dark:text-slate-100 truncate">
                            {node.name}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {node.floor} · Queue: {node.currentPatients} pts
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500">
                          {node.shortCode}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900 text-[11px] text-indigo-800 dark:text-indigo-300 font-mono">
                Route Generated in {previewRoute.computationTimeMs}ms
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
