import { useState, useMemo } from 'react';
import { useStore } from '@/store/StoreContext';
import type { Severity } from '@/types';
import {
  Route,
  ArrowRight,
  ShieldCheck,
  XCircle,
} from 'lucide-react';

export function SlotAllocationPage() {
  const { nodes, graph, findRoute } = useStore();

  const [origin, setOrigin] = useState<string>('ENTRANCE');
  const [destination, setDestination] = useState<string>('SURGERY_OT');
  const severity: Severity = 'Emergency';
  const [congestedNodeId, setCongestedNodeId] = useState<string>('EMERGENCY');
  const [addedCongestion, setAddedCongestion] = useState<number>(14);

  // Compute Dijkstra Shortest Path under current parameters
  const dijkstraResult = useMemo(() => {
    // Temporarily apply additional congestion to congestedNodeId
    const originalNode = graph.getNode(congestedNodeId);
    const originalCount = originalNode?.currentPatients ?? 0;

    graph.updateNodeCongestion(congestedNodeId, originalCount + addedCongestion);
    const result = findRoute(origin, destination, severity);
    // Restore
    graph.updateNodeCongestion(congestedNodeId, originalCount);

    return result;
  }, [graph, origin, destination, severity, congestedNodeId, addedCongestion, findRoute]);

  // Compute Static Default Direct Path
  const staticResult = useMemo(() => {
    // A fixed direct corridor (e.g. ENTRANCE -> EMERGENCY -> SURGERY_OT)
    // Calculate static time using the congested node
    const staticHops = [origin, congestedNodeId, destination];
    let totalStaticTime = 0;
    let totalStaticDist = 0;

    for (let i = 0; i < staticHops.length - 1; i++) {
      const u = staticHops[i];
      const v = staticHops[i + 1];
      const outEdges = graph.getOutgoingEdges(u);
      const edge = outEdges.find((e) => e.to === v) || {
        baseTransitMinutes: 3.0,
        distanceMeters: 90,
      };

      const target = graph.getNode(v);
      const wait =
        v === congestedNodeId
          ? (target?.baseWaitMinutes ?? 10) + (addedCongestion * 2.2)
          : (target?.baseWaitMinutes ?? 5);

      totalStaticTime += edge.baseTransitMinutes + wait;
      totalStaticDist += edge.distanceMeters;
    }

    return {
      path: staticHops,
      totalTimeMinutes: Math.round(totalStaticTime * 10) / 10,
      totalDistanceMeters: totalStaticDist,
    };
  }, [graph, origin, destination, congestedNodeId, addedCongestion]);

  const timeSaved = Math.max(
    0,
    Math.round((staticResult.totalTimeMinutes - dijkstraResult.totalTimeMinutes) * 10) / 10
  );

  const percentFaster =
    staticResult.totalTimeMinutes > 0
      ? Math.round((timeSaved / staticResult.totalTimeMinutes) * 1000) / 10
      : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Route className="text-teal-600 dark:text-teal-400" size={28} />
          Dynamic Route Optimization & Bottleneck Bypass
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          DAA Demonstration: How Dijkstra’s algorithm dynamically detects congested departments and routes patients through faster alternative corridors.
        </p>
      </div>

      {/* Scenario Sandbox Controls */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4 pb-2 border-b border-slate-100 dark:border-slate-700">
          Simulation Parameters
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Start Department (Source)
            </label>
            <select
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
            >
              {nodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name} ({n.shortCode})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Target Department (Sink)
            </label>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
            >
              {nodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name} ({n.shortCode})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Simulate Bottleneck Department
            </label>
            <select
              value={congestedNodeId}
              onChange={(e) => setCongestedNodeId(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
            >
              {nodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name} ({n.shortCode})
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              <span>Artificial Surge Delay</span>
              <span className="font-bold text-amber-600">+{addedCongestion} pts</span>
            </div>
            <input
              type="range"
              min="0"
              max="25"
              value={addedCongestion}
              onChange={(e) => setAddedCongestion(parseInt(e.target.value, 10))}
              className="w-full accent-amber-600 cursor-pointer mt-1"
            />
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparison Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scenario A: Naive Static Routing */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-rose-200 dark:border-rose-900/60 p-6 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
              <XCircle size={14} />
              Conventional Static / Fixed Routing
            </span>
            <span className="text-xs text-slate-400">Fixed Corridor Route</span>
          </div>

          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">
            Suffers From Bottleneck Delays
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
            Static routing always sends patients down the predetermined path without checking if the department ahead is overcrowded.
          </p>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 mb-5 space-y-2">
            <div className="text-xs font-bold text-slate-500 uppercase">Traversed Pathway:</div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono font-bold">
              {staticResult.path.map((nodeId, idx) => (
                <span key={idx} className="flex items-center gap-1">
                  <span
                    className={`px-2 py-1 rounded ${
                      nodeId === congestedNodeId
                        ? 'bg-rose-500 text-white animate-pulse'
                        : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {nodeId} {nodeId === congestedNodeId ? '(CONGESTED)' : ''}
                  </span>
                  {idx < staticResult.path.length - 1 && (
                    <ArrowRight size={12} className="text-slate-400" />
                  )}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">
                Total Time
              </span>
              <span className="text-2xl font-black text-rose-600 dark:text-rose-400">
                {staticResult.totalTimeMinutes}m
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">
                Distance
              </span>
              <span className="text-2xl font-black text-slate-700 dark:text-slate-200">
                {staticResult.totalDistanceMeters}m
              </span>
            </div>
          </div>
        </div>

        {/* Scenario B: Dijkstra Dynamic Shortest Path */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-teal-300 dark:border-teal-700 p-6 shadow-sm relative overflow-hidden ring-1 ring-teal-500/20">
          <div className="flex items-center justify-between mb-4">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center gap-1.5">
              <ShieldCheck size={14} />
              Dijkstra Dynamic Shortest Path
            </span>
            <span className="text-xs font-mono font-bold text-teal-600">
              {percentFaster}% Time Saved
            </span>
          </div>

          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">
            Intelligent Dynamic Bypass
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
            Dijkstra's edge relaxation checks real-time congestion weights $w(u, v)$ and automatically diverts the patient around the bottleneck!
          </p>

          <div className="p-4 rounded-xl bg-teal-50/50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900 mb-5 space-y-2">
            <div className="text-xs font-bold text-teal-700 dark:text-teal-300 uppercase">
              Optimized Dynamic Pathway:
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono font-bold">
              {dijkstraResult.path.map((nodeId, idx) => (
                <span key={idx} className="flex items-center gap-1">
                  <span className="px-2 py-1 rounded bg-teal-600 text-white shadow-xs">
                    {nodeId}
                  </span>
                  {idx < dijkstraResult.path.length - 1 && (
                    <ArrowRight size={12} className="text-teal-500" />
                  )}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">
                Optimized Time
              </span>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {dijkstraResult.totalTimeMinutes}m
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">
                Time Saved
              </span>
              <span className="text-2xl font-black text-teal-600 dark:text-teal-400">
                -{timeSaved}m
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
