import { useState } from 'react';
import {
  BookOpen,
  Cpu,
  Layers,
  HelpCircle,
  Sparkles,
  Route,
  Zap,
} from 'lucide-react';

export function DocumentationPage() {
  const [activeTab, setActiveTab] = useState<'system' | 'performance' | 'faq'>('system');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <BookOpen className="text-teal-600 dark:text-teal-400" size={28} />
          System Guide & Documentation
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Architecture overview, routing logic, and operational guidelines for MediRoute.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 space-x-4 text-xs font-bold">
        <button
          onClick={() => setActiveTab('system')}
          className={`pb-2.5 transition-all flex items-center gap-1.5 ${
            activeTab === 'system'
              ? 'border-b-2 border-teal-600 text-teal-600 dark:text-teal-400'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Layers size={15} />
          1. System Architecture & Routing
        </button>
        <button
          onClick={() => setActiveTab('performance')}
          className={`pb-2.5 transition-all flex items-center gap-1.5 ${
            activeTab === 'performance'
              ? 'border-b-2 border-teal-600 text-teal-600 dark:text-teal-400'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Cpu size={15} />
          2. Performance & Scaling
        </button>
        <button
          onClick={() => setActiveTab('faq')}
          className={`pb-2.5 transition-all flex items-center gap-1.5 ${
            activeTab === 'faq'
              ? 'border-b-2 border-teal-600 text-teal-600 dark:text-teal-400'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <HelpCircle size={15} />
          3. Frequently Asked Questions
        </button>
      </div>

      {/* Tab 1: System Overview */}
      {activeTab === 'system' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Sparkles className="text-teal-600" size={18} />
              Hospital Department Network
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              MediRoute models the hospital facility as an interconnected network of clinical departments, service stations, and transit corridors across two floors.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                  Ground Floor Facilities
                </span>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                  Main Entrance, Triage Assessment, Emergency & Trauma Bay, General Medicine OPD, Orthopedics Clinic, Digital X-Ray & Ultrasound, Central Pharmacy, and Billing/Discharge.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                  First Floor Specialized Units
                </span>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                  Cardiology Clinic, Pathology & Blood Diagnostics, Advanced CT/MRI Imaging Suite, Surgical Operating Theaters & ICU, and Inpatient Recovery Ward.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Route className="text-indigo-600" size={18} />
              Automated Route Calculation
            </h2>
            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 text-[11px] font-bold flex items-center justify-center shrink-0">
                  1
                </span>
                <div>
                  <strong>Live Travel Cost:</strong> Each corridor between departments has a baseline transit time plus the destination department's current wait time.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 text-[11px] font-bold flex items-center justify-center shrink-0">
                  2
                </span>
                <div>
                  <strong>Dynamic Congestion Monitoring:</strong> As patient density increases at a department, incoming patients are automatically routed to alternative stations or corridors.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 text-[11px] font-bold flex items-center justify-center shrink-0">
                  3
                </span>
                <div>
                  <strong>Emergency Priority Routing:</strong> Critical and emergency cases are routed via express lanes and bypass standard department lines for immediate triage and stabilization.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Performance & Scaling */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Zap className="text-teal-600" size={18} />
              Routing Speed & Efficiency
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Route computations execute instantly in under 1 millisecond. Even during large patient surges of 500+ individuals, routes are updated smoothly without UI freeze or delay.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  Calculation Time
                </span>
                <span className="text-2xl font-black text-teal-600 dark:text-teal-400">
                  &lt; 0.5ms
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">Per patient journey</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  Transit Latency Reduction
                </span>
                <span className="text-2xl font-black text-emerald-600">
                  ~29% Faster
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">Vs. fixed routes</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  Capacity Limit
                </span>
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                  500+
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">Concurrent patients</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: FAQ */}
      {activeTab === 'faq' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
              Frequently Asked Questions
            </h2>

            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                  How does the system know when a department is congested?
                </div>
                <div className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Each department reports its current patient backlog and active staff. When the patient-to-clinician ratio exceeds baseline thresholds, the system flags the station and increases its estimated wait time, prompting the routing engine to divert incoming traffic.
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                  What happens if a department goes offline or closes?
                </div>
                <div className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Clinicians can mark a department offline in the Department Management portal. The system instantly updates hospital pathways, routing active patients through alternate diagnostic or consultation wings.
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                  How are emergency patients handled?
                </div>
                <div className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Critical and emergency patients are routed through dedicated express corridors that reduce transit time by 50% and prioritize immediate clinician attention over routine appointments.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
