import { useState } from 'react';
import { useStore } from '@/store/StoreContext';
import {
  Binary,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Code2,
} from 'lucide-react';

export function DijkstraAlgorithmVisualizer() {
  const {
    activePathResult,
    nodes,
  } = useStore();

  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [showPseudocode, setShowPseudocode] = useState<boolean>(false);

  const steps = activePathResult.steps || [];
  const currentStep = steps[currentStepIdx] || steps[0];

  const nodeMap = nodes.reduce<Record<string, string>>((acc, n) => {
    acc[n.id] = n.shortCode;
    return acc;
  }, {});

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100 dark:border-slate-700">
        <div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Binary className="text-indigo-600 dark:text-indigo-400" size={20} />
            Route Calculation Inspector
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Step-by-step inspection of department checks, corridor travel times, and route selections.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPseudocode(!showPseudocode)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            <Code2 size={14} />
            {showPseudocode ? 'Hide Routing Logic' : 'View Routing Logic'}
          </button>
        </div>
      </div>

      {showPseudocode && (
        <div className="mb-4 p-4 rounded-xl bg-slate-900 text-slate-200 text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800 shadow-inner">
          <div className="text-emerald-400 font-bold mb-2">
            // Optimal Patient Routing Logic
          </div>
          <div>1. Initialize starting department travel time to 0 mins; all others set to unvisited.</div>
          <div>2. Select the reachable department with the shortest current travel time.</div>
          <div>3. Check all connecting corridors and add live department wait times.</div>
          <div>4. If an alternate corridor arrives sooner, update the recommended route.</div>
          <div>5. Repeat until the target department is reached.</div>
        </div>
      )}

      {steps.length === 0 ? (
        <div className="text-center py-8 text-sm text-slate-400">
          Select two distinct hospital departments above to generate execution trace.
        </div>
      ) : (
        <div className="space-y-4">
          {/* Step Stepper Header */}
          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                Step {currentStep?.stepNumber} of {steps.length}
              </span>
              <span className="text-xs text-slate-600 dark:text-slate-300">
                Checking Station: <strong className="text-indigo-600 dark:text-indigo-400">{currentStep?.currentNodeId}</strong> ({nodeMap[currentStep?.currentNodeId] || ''}) &bull; Current Latency: <strong>{currentStep?.currentDistance}m</strong>
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                disabled={currentStepIdx === 0}
                onClick={() => setCurrentStepIdx((prev) => Math.max(0, prev - 1))}
                className="px-2.5 py-1 text-xs font-medium rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={currentStepIdx >= steps.length - 1}
                onClick={() => setCurrentStepIdx((prev) => Math.min(steps.length - 1, prev + 1))}
                className="px-2.5 py-1 text-xs font-medium rounded bg-teal-600 text-white disabled:opacity-40"
              >
                Next Step
              </button>
              <button
                onClick={() => setCurrentStepIdx(0)}
                title="Reset to Step 1"
                className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <RotateCcw size={14} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Min-Heap Priority Queue Snapshot */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between mb-2">
                <span>Priority Station Queue</span>
                <span className="text-[10px] text-slate-400">Lowest estimated travel time first</span>
              </div>
              <div className="flex flex-wrap gap-1.5 min-h-[44px] items-center">
                {currentStep?.heapSnapshot.length === 0 ? (
                  <span className="text-xs text-slate-400 italic">No more pending stations</span>
                ) : (
                  currentStep?.heapSnapshot.map((item, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-medium border ${
                        idx === 0
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 text-emerald-800 dark:text-emerald-300 shadow-xs'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="font-bold">{item.nodeId}</span>
                      <span className="text-slate-400 text-[10px]">({item.distance}m)</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Edge Relaxation Operations at this Step */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between mb-2">
                <span>Connecting Corridor Checks</span>
                <span className="text-[10px] text-slate-400">Evaluating transit + wait time</span>
              </div>
              <div className="space-y-1.5 max-h-[140px] overflow-y-auto">
                {currentStep?.relaxedEdges.length === 0 ? (
                  <span className="text-xs text-slate-400 italic">No outgoing unvisited corridors</span>
                ) : (
                  currentStep?.relaxedEdges.map((rel, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-between p-1.5 rounded-lg text-xs border ${
                        rel.relaxed
                          ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300'
                          : 'bg-slate-100/70 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-1 font-mono">
                        {rel.relaxed ? (
                          <CheckCircle2 size={13} className="text-emerald-600" />
                        ) : (
                          <XCircle size={13} className="text-slate-400" />
                        )}
                        <span>→ {rel.neighborId}</span>
                        <span className="text-[10px] text-slate-400">(+{rel.edgeWeight}m)</span>
                      </div>
                      <div className="text-[11px] font-mono">
                        {rel.relaxed ? (
                          <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                            Faster: {rel.newDistance}m
                          </span>
                        ) : (
                          <span>Current faster ({rel.oldDistance}m)</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
