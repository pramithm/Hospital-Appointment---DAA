import { useState } from 'react';
import { useStore } from '@/store/StoreContext';
import { SeverityBadge, PatientStatusBadge } from '@/components/Badges';
import {
  Stethoscope,
  Power,
  ChevronRight,
} from 'lucide-react';

export function DoctorPortalPage() {
  const {
    nodes,
    patients,
    advancePatient,
    updateDepartmentCongestion,
    updateDepartmentWaitTime,
    toggleDepartmentOperational,
  } = useStore();

  const [selectedDeptId, setSelectedDeptId] = useState<string>('CARDIO');

  const currentDept = nodes.find((n) => n.id === selectedDeptId) || nodes[0];

  // Patients currently queued or being served at this department
  const deptPatients = patients.filter(
    (p) => p.currentStationId === selectedDeptId && p.status !== 'Completed'
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Stethoscope className="text-teal-600 dark:text-teal-400" size={28} />
            Department Operations & Clinician Portal
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage station capacity, service arriving patients, and simulate dynamic weight adjustments.
          </p>
        </div>

        {/* Department Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Active Station:</span>
          <select
            value={selectedDeptId}
            onChange={(e) => setSelectedDeptId(e.target.value)}
            className="text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            {nodes.map((n) => (
              <option key={n.id} value={n.id}>
                {n.name} ({n.shortCode})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Station Control Header Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-700">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-slate-800 dark:text-slate-100">
                {currentDept.name}
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200">
                {currentDept.floor}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                  currentDept.isOperational
                    ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200'
                    : 'bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200'
                }`}
              >
                {currentDept.isOperational ? 'OPERATIONAL' : 'OFFLINE'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {currentDept.description}
            </p>
          </div>

          <button
            onClick={() => toggleDepartmentOperational(currentDept.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
              currentDept.isOperational
                ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            <Power size={14} />
            {currentDept.isOperational ? 'Take Offline (Reroute Traffic)' : 'Restore Online'}
          </button>
        </div>

        {/* Dynamic Weight Modifiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-5">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
              <span>Patient Queue Backlog</span>
              <span className="font-bold text-teal-600 dark:text-teal-400">
                {currentDept.currentPatients} / {currentDept.maxCapacity} pts
              </span>
            </div>
            <input
              type="range"
              min="0"
              max={currentDept.maxCapacity + 10}
              value={currentDept.currentPatients}
              onChange={(e) =>
                updateDepartmentCongestion(currentDept.id, parseInt(e.target.value, 10))
              }
              className="w-full accent-teal-600 cursor-pointer"
            />
            <span className="text-[10px] text-slate-400 block mt-1">
              Higher queue length increases estimated wait times for incoming patients.
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
              <span>Base Department Wait</span>
              <span className="font-bold text-teal-600 dark:text-teal-400">
                {currentDept.baseWaitMinutes} mins
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="45"
              value={currentDept.baseWaitMinutes}
              onChange={(e) =>
                updateDepartmentWaitTime(currentDept.id, parseInt(e.target.value, 10))
              }
              className="w-full accent-teal-600 cursor-pointer"
            />
            <span className="text-[10px] text-slate-400 block mt-1">
              Base procedural setup & turnaround latency.
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-bold">
                Clinical Staff
              </span>
              <span className="text-base font-bold text-slate-800 dark:text-slate-100">
                {currentDept.staffCount} Clinicians on Duty
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">
                Avg Service
              </span>
              <span className="text-base font-bold text-indigo-600 dark:text-indigo-400">
                {currentDept.avgServiceMinutes}m / pt
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Arriving & In-Service Patients at this Station */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-700">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
              Patients Currently at {currentDept.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Call next patient or advance them along their Dijkstra clinical care pathway.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
            {deptPatients.length} Active Here
          </span>
        </div>

        {deptPatients.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            No patients currently waiting at this department.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {deptPatients.map((p) => {
              const nextStationId = p.requiredStops[p.currentStopIndex + 1];

              return (
                <div
                  key={p.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/40 hover:shadow-sm transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                        {p.name}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {p.age}y · {p.gender} · {p.id}
                      </div>
                    </div>
                    <SeverityBadge severity={p.severity} />
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                    {p.chiefComplaint}
                  </p>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Next Destination</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">
                        {nextStationId || 'Discharge Desk'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Status</span>
                      <PatientStatusBadge status={p.status} />
                    </div>
                  </div>

                  <button
                    onClick={() => advancePatient(p.id)}
                    className="w-full py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <span>Complete at {currentDept.shortCode} & Dispatch</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Hospital-Wide Department Workload Bar Chart */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4">
          Hospital-Wide Department Load & Capacity Utilization
        </h3>
        <div className="space-y-3">
          {nodes.map((node) => {
            const pct = Math.min(100, Math.round((node.currentPatients / node.maxCapacity) * 100));
            const isHigh = pct >= 80;

            return (
              <div key={node.id} className="text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {node.name} ({node.shortCode})
                  </span>
                  <span className={`font-mono font-bold ${isHigh ? 'text-rose-600' : 'text-slate-500'}`}>
                    {node.currentPatients} / {node.maxCapacity} ({pct}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isHigh
                        ? 'bg-rose-500'
                        : pct > 50
                          ? 'bg-amber-500'
                          : 'bg-teal-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
