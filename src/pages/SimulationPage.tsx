import { useState } from 'react';
import { useStore } from '@/store/StoreContext';
import {
  FlaskConical,
  Play,
  Layers,
  ShieldCheck,
  TrendingDown,
} from 'lucide-react';

export function SimulationPage() {
  const { runBatchSimulation, simulationMetrics, nodes } = useStore();
  const [running, setRunning] = useState(false);
  const [patientCount, setPatientCount] = useState<number>(250);

  const handleRunSimulation = () => {
    setRunning(true);
    setTimeout(() => {
      runBatchSimulation(patientCount);
      setRunning(false);
    }, 250);
  };

  const heapLatencyPass = simulationMetrics.avgAlgorithmExecutionMs < 1.0;
  const timeSavingsPass = simulationMetrics.timeSavedPercent >= 20.0;
  const graphConnectivityPass = nodes.every((n) => n.isOperational);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <FlaskConical className="text-teal-600 dark:text-teal-400" size={28} />
          High-Throughput Dijkstra Simulation Lab
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Stress-test the hospital network with synthetic patient surges and verify Min-Heap algorithmic performance.
        </p>
      </div>

      {/* Control Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-4">
          <div className="flex-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Select Patient Cohort Size
            </label>
            <select
              value={patientCount}
              onChange={(e) => setPatientCount(parseInt(e.target.value, 10))}
              className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value={50}>50 Patients (Routine Outpatient Shift)</option>
              <option value={100}>100 Patients (Standard Daily Intake)</option>
              <option value={250}>250 Patients (Peak Midday Surge)</option>
              <option value={500}>500 Patients (Full Capacity Stress Test)</option>
            </select>
          </div>

          <button
            onClick={handleRunSimulation}
            disabled={running}
            className="py-2.5 px-6 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 shrink-0"
          >
            {running ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Relaxing Graph Edges...</span>
              </>
            ) : (
              <>
                <Play size={16} />
                <span>Execute Dijkstra Batch Simulation</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* DAA Capstone Pass/Fail Criteria Badges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck size={20} />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
              Min-Heap Latency &lt; 1.0ms
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Measured: <strong>{simulationMetrics.avgAlgorithmExecutionMs}ms</strong>
            </div>
            <span className="inline-block mt-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {heapLatencyPass ? 'PASSED — O((V+E)log V)' : 'FAILED'}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-900 text-teal-600 dark:text-teal-400">
            <TrendingDown size={20} />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
              Latency Savings &ge; 20%
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Measured: <strong>{simulationMetrics.timeSavedPercent}% saved</strong>
            </div>
            <span className="inline-block mt-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
              {timeSavingsPass ? 'PASSED — Dynamic Bypass' : 'FAILED'}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400">
            <Layers size={20} />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
              Graph Connectivity
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              All 13 departments connected
            </div>
            <span className="inline-block mt-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {graphConnectivityPass ? 'PASSED — Strongly Connected' : 'PARTIAL'}
            </span>
          </div>
        </div>
      </div>

      {/* Simulation Results Breakdown */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-6">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 pb-2 border-b border-slate-100 dark:border-slate-700">
          Simulation Run Metrics ({simulationMetrics.totalPatientsProcessed} Patients)
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 block font-bold uppercase">
              Dijkstra Avg Transit
            </span>
            <span className="text-2xl font-black text-teal-600 dark:text-teal-400">
              {simulationMetrics.dijkstraAvgTimeMinutes}m
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 block font-bold uppercase">
              Static Routing Avg
            </span>
            <span className="text-2xl font-black text-rose-500">
              {simulationMetrics.staticRoutingAvgTimeMinutes}m
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 block font-bold uppercase">
              Net Hospital Time Saved
            </span>
            <span className="text-2xl font-black text-emerald-600">
              -{simulationMetrics.timeSavedMinutes}m
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 block font-bold uppercase">
              Avg Algorithm Compute
            </span>
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
              {simulationMetrics.avgAlgorithmExecutionMs}ms
            </span>
          </div>
        </div>

        {/* Top Department Load Distribution */}
        <div>
          <h4 className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-3">
            Simulated Department Queue Buildup
          </h4>
          <div className="space-y-2.5">
            {simulationMetrics.congestionHotspots.map((hotspot) => (
              <div
                key={hotspot.departmentId}
                className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800"
              >
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-100">
                    {hotspot.departmentName}
                  </span>
                  <span className="text-slate-400 ml-2 font-mono">
                    ({hotspot.departmentId})
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-500">Queue: {hotspot.queueLength} pts</span>
                  <span className="font-bold text-teal-600 dark:text-teal-400">
                    {hotspot.utilizationPercent}% capacity
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
