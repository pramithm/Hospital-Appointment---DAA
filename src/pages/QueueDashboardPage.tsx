import { useStore } from '@/store/StoreContext';
import { HospitalGraphView } from '@/components/HospitalGraphView';
import { DijkstraAlgorithmVisualizer } from '@/components/DijkstraAlgorithmVisualizer';
import { SeverityBadge, PatientStatusBadge } from '@/components/Badges';
import type { Severity } from '@/types';
import {
  Compass,
  AlertTriangle,
  RotateCcw,
  Zap,
  ArrowRight,
  TrendingDown,
  Clock,
  Activity,
  Users,
} from 'lucide-react';

export function QueueDashboardPage() {
  const {
    nodes,
    selectedStartNode,
    selectedEndNode,
    selectedSeverity,
    setSelectedStartNode,
    setSelectedEndNode,
    setSelectedSeverity,
    activePathResult,
    patients,
    advancePatient,
    reroutePatient,
    simulateRushHour,
    resetCongestion,
    simulationMetrics,
  } = useStore();

  const severities: Severity[] = ['Routine', 'Urgent', 'Emergency', 'Critical'];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Title & Quick Simulation Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
            <Compass className="text-teal-600 dark:text-teal-400" size={28} />
            Patient Flow & Route Optimizer
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Live department transit tracking, occupancy monitoring, and automated low-wait route guidance.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={simulateRushHour}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 hover:bg-amber-500/20 transition-all shadow-xs"
          >
            <AlertTriangle size={15} />
            Simulate Rush Hour Surge
          </button>
          <button
            onClick={resetCongestion}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
          >
            <RotateCcw size={14} />
            Reset Baseline
          </button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
            <span>Average Patient Transit</span>
            <Clock size={16} className="text-teal-500" />
          </div>
          <div className="text-2xl font-black text-slate-800 dark:text-slate-100">
            {simulationMetrics.dijkstraAvgTimeMinutes}m
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 mt-1">
            <TrendingDown size={14} />
            {simulationMetrics.timeSavedPercent}% faster than fixed routes
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
            <span>Time Saved / Patient</span>
            <Zap size={16} className="text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
            -{simulationMetrics.timeSavedMinutes}m
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Standard route avg: {simulationMetrics.staticRoutingAvgTimeMinutes}m
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
            <span>Active Patients</span>
            <Users size={16} className="text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-slate-800 dark:text-slate-100">
            {patients.filter((p) => p.status !== 'Completed').length} pts
          </div>
          <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-1">
            Tracking in hospital network
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
            <span>Routing Response</span>
            <Activity size={16} className="text-rose-500" />
          </div>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
            {activePathResult.computationTimeMs}ms
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Instant automated pathing
          </div>
        </div>
      </div>

      {/* Route Selector Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Route Query:
          </span>

          {/* Start Node */}
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <select
              value={selectedStartNode}
              onChange={(e) => setSelectedStartNode(e.target.value)}
              aria-label="Starting Department"
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {nodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name} ({n.shortCode})
                </option>
              ))}
            </select>
          </div>

          <ArrowRight size={14} className="text-slate-400" />

          {/* End Node */}
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <select
              value={selectedEndNode}
              onChange={(e) => setSelectedEndNode(e.target.value)}
              aria-label="Destination Department"
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {nodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name} ({n.shortCode})
                </option>
              ))}
            </select>
          </div>

          {/* Severity Modifier */}
          <div className="flex items-center gap-1 ml-2">
            <span className="text-xs text-slate-400 mr-1">Severity:</span>
            {severities.map((sev) => (
              <button
                key={sev}
                onClick={() => setSelectedSeverity(sev)}
                className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  selectedSeverity === sev
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs font-mono text-slate-500">
          Optimal: <strong className="text-teal-600 dark:text-teal-400">{activePathResult.totalTimeMinutes}m</strong> ({activePathResult.totalDistanceMeters}m walk)
        </div>
      </div>

      {/* Main Graph Visualization */}
      <HospitalGraphView />

      {/* Algorithm Step-by-Step Inspector */}
      <DijkstraAlgorithmVisualizer />

      {/* Active Patients Roster with Station Advancement */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-700">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
              Live Patient Transit Roster & Journey Tracker
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Patients currently in transit or receiving care across hospital departments.
            </p>
          </div>
          <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 px-2.5 py-1 rounded-full">
            {patients.length} Registered Records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="pb-3 pl-2">Patient</th>
                <th className="pb-3">Severity & Complaint</th>
                <th className="pb-3">Current Station</th>
                <th className="pb-3">Next Required Step</th>
                <th className="pb-3">Planned Route</th>
                <th className="pb-3">Est. Latency</th>
                <th className="pb-3 text-right pr-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {patients.map((p) => {
                const isFinished = p.status === 'Completed';
                const nextStation = p.requiredStops[p.currentStopIndex + 1];

                return (
                  <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="py-3 pl-2 font-semibold">
                      <div className="text-slate-900 dark:text-slate-100">{p.name}</div>
                      <div className="text-[11px] text-slate-400">
                        {p.age}y · {p.gender} · {p.id}
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="mb-1">
                        <SeverityBadge severity={p.severity} />
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-xs">
                        {p.chiefComplaint}
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {p.currentStationId}
                      </span>
                      <div className="mt-1">
                        <PatientStatusBadge status={p.status} />
                      </div>
                    </td>
                    <td className="py-3">
                      {isFinished ? (
                        <span className="text-emerald-600 font-semibold">Discharged</span>
                      ) : (
                        <span className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                          {nextStation || 'Final Care'}
                        </span>
                      )}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-1 font-mono text-[11px] flex-wrap max-w-xs">
                        {p.optimizedRoute.map((step, idx) => (
                          <span
                            key={idx}
                            className={`px-1.5 py-0.5 rounded ${
                              step === p.currentStationId
                                ? 'bg-teal-500 text-white font-bold'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            {step}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {p.estimatedTotalTimeMinutes}m
                      </span>
                    </td>
                    <td className="py-3 text-right pr-2 space-x-1.5">
                      {!isFinished && (
                        <>
                          <button
                            onClick={() => advancePatient(p.id)}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white transition-colors"
                          >
                            Advance Station →
                          </button>
                          <button
                            onClick={() => reroutePatient(p.id)}
                            title="Recalculate shortest path avoiding congested bottlenecks"
                            className="px-2 py-1 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                          >
                            Reroute
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
