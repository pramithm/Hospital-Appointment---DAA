import { useState } from 'react';
import {
  BookOpen,
  Code2,
  Cpu,
  Layers,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

export function DocumentationPage() {
  const [activeTab, setActiveTab] = useState<'theory' | 'complexity' | 'viva'>('theory');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <BookOpen className="text-teal-600 dark:text-teal-400" size={28} />
          DAA Documentation & Viva Reference
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Design and Analysis of Algorithms (DAA) Capstone Project: Patient Flow Optimization Using Dijkstra's Shortest Path Algorithm.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 space-x-4 text-xs font-bold">
        <button
          onClick={() => setActiveTab('theory')}
          className={`pb-2.5 transition-all flex items-center gap-1.5 ${
            activeTab === 'theory'
              ? 'border-b-2 border-teal-600 text-teal-600 dark:text-teal-400'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Layers size={15} />
          1. Algorithmic Formulation & Proof
        </button>
        <button
          onClick={() => setActiveTab('complexity')}
          className={`pb-2.5 transition-all flex items-center gap-1.5 ${
            activeTab === 'complexity'
              ? 'border-b-2 border-teal-600 text-teal-600 dark:text-teal-400'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Cpu size={15} />
          2. Complexity Analysis & Big-O
        </button>
        <button
          onClick={() => setActiveTab('viva')}
          className={`pb-2.5 transition-all flex items-center gap-1.5 ${
            activeTab === 'viva'
              ? 'border-b-2 border-teal-600 text-teal-600 dark:text-teal-400'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <HelpCircle size={15} />
          3. DAA Viva Examination Q&A
        </button>
      </div>

      {/* Tab 1: Theory & Algorithmic Formulation */}
      {activeTab === 'theory' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Sparkles className="text-teal-600" size={18} />
              1. Mathematical Problem Formulation
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              In conventional hospitals, patients follow static or uncoordinated routes, creating acute bottlenecks at departments such as General Medicine OPD, Blood Pathology, or CT Imaging. We formulate this healthcare challenge as a <strong>Single-Source Shortest Path (SSSP)</strong> optimization problem on a directed, weighted graph:
            </p>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 font-mono text-xs space-y-2">
              <div>
                <strong className="text-teal-600">Graph Definition:</strong> G = (V, E)
              </div>
              <div>
                • <strong>V (Vertices):</strong> Hospital departments, triage stations, and corridor junctions (|V| = 13).
              </div>
              <div>
                • <strong>E (Edges):</strong> Physical hallways, express trauma transit lanes, and inter-floor connections.
              </div>
              <div>
                • <strong>w(u, v) (Dynamic Weight):</strong> Total latency = Physical Transit Time + Destination Congestion Delay:
              </div>
              <div className="pl-4 text-emerald-600 dark:text-emerald-400 font-bold">
                w(u, v) = t_transit(u, v) + [t_base_wait(v) + (Queue(v) / Staff(v)) × ServiceRate(v)]
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Because transit and waiting delays are strictly non-negative (<code>w(u, v) &ge; 0</code>), Dijkstra's algorithm is mathematically proven to discover the globally optimal path without risk of negative weight anomalies.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Code2 className="text-indigo-600" size={18} />
              2. Dijkstra Pseudocode with Min-Heap
            </h2>
            <div className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs leading-relaxed overflow-x-auto border border-slate-800">
              <div className="text-emerald-400 font-bold mb-2">// Dijkstra's Algorithm using Binary Min-Heap Priority Queue</div>
              <div>ALGORITHM DijkstraShortestPath(Graph G, Source s, Target t):</div>
              <div>&nbsp;&nbsp;FOR each vertex v ∈ G.V:</div>
              <div>&nbsp;&nbsp;&nbsp;&nbsp;dist[v] ← ∞</div>
              <div>&nbsp;&nbsp;&nbsp;&nbsp;prev[v] ← null</div>
              <div>&nbsp;&nbsp;dist[s] ← 0</div>
              <div>&nbsp;&nbsp;MinHeap Q ← new MinHeap()</div>
              <div>&nbsp;&nbsp;Q.insert(s, 0)</div>
              <div>&nbsp;&nbsp;Visited ← empty set</div>
              <div>&nbsp;&nbsp;WHILE NOT Q.isEmpty():</div>
              <div>&nbsp;&nbsp;&nbsp;&nbsp;u ← Q.extractMin()  <span className="text-slate-400">// O(log V)</span></div>
              <div>&nbsp;&nbsp;&nbsp;&nbsp;IF u ∈ Visited THEN CONTINUE</div>
              <div>&nbsp;&nbsp;&nbsp;&nbsp;Visited.add(u)</div>
              <div>&nbsp;&nbsp;&nbsp;&nbsp;IF u == t THEN BREAK</div>
              <div>&nbsp;&nbsp;&nbsp;&nbsp;FOR each neighbor v of u:</div>
              <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;w ← CalculateDynamicWeight(u, v)</div>
              <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;IF dist[u] + w &lt; dist[v] THEN:  <span className="text-emerald-400">// Edge Relaxation</span></div>
              <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;dist[v] ← dist[u] + w</div>
              <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;prev[v] ← u</div>
              <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Q.insert(v, dist[v])  <span className="text-slate-400">// O(log V)</span></div>
              <div>&nbsp;&nbsp;RETURN ReconstructPath(prev, t), dist[t]</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Complexity Analysis */}
      {activeTab === 'complexity' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Cpu className="text-teal-600" size={18} />
              Time & Space Complexity Formal Proof
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400 uppercase font-semibold">
                    <th className="pb-3">Implementation</th>
                    <th className="pb-3">Extract-Min Cost</th>
                    <th className="pb-3">Relaxation Cost</th>
                    <th className="pb-3">Total Time Complexity</th>
                    <th className="pb-3">Space Complexity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  <tr className="bg-teal-50/50 dark:bg-teal-950/30">
                    <td className="py-3 font-bold text-teal-600 dark:text-teal-400">
                      Binary Min-Heap (This Project)
                    </td>
                    <td className="py-3 font-mono">O(log V)</td>
                    <td className="py-3 font-mono">O(log V)</td>
                    <td className="py-3 font-mono font-bold text-teal-600 dark:text-teal-400">
                      O((V + E) log V)
                    </td>
                    <td className="py-3 font-mono font-semibold">O(V + E)</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-medium">Unordered Array Scan</td>
                    <td className="py-3 font-mono">O(V)</td>
                    <td className="py-3 font-mono">O(1)</td>
                    <td className="py-3 font-mono">O(V²)</td>
                    <td className="py-3 font-mono">O(V + E)</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-medium">Fibonacci Heap</td>
                    <td className="py-3 font-mono">O(log V) amortized</td>
                    <td className="py-3 font-mono">O(1) amortized</td>
                    <td className="py-3 font-mono">O(E + V log V)</td>
                    <td className="py-3 font-mono">O(V + E)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 pt-3">
              <p>
                <strong>Derivation of O((V + E) log V):</strong>
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Each vertex <code>v ∈ V</code> is inserted into and extracted from the Min-Heap at most once: <code>|V| × O(log V) = O(V log V)</code>.
                </li>
                <li>
                  Across all vertices, outgoing edges are evaluated at most <code>|E|</code> times. Each successful edge relaxation inserts into or updates the Min-Heap: <code>|E| × O(log V) = O(E log V)</code>.
                </li>
                <li>
                  Summing both operations yields the total asymptotic upper bound: <strong>O((V + E) log V)</strong>.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Viva Q&A */}
      {activeTab === 'viva' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-5">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
              Frequently Asked DAA Viva Questions
            </h2>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <div className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                  Q1: Why choose Dijkstra's algorithm over Breadth-First Search (BFS)?
                </div>
                <div className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  <strong>Answer:</strong> BFS assumes all edges have uniform weight (e.g. weight = 1). In a hospital, hallway physical distances and department queue wait times vary drastically (e.g., General OPD wait = 15m vs Corridor transit = 1m). BFS cannot optimize non-uniform weighted graphs, whereas Dijkstra finds the exact lowest-latency path.
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <div className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                  Q2: Why not use the Bellman-Ford algorithm?
                </div>
                <div className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  <strong>Answer:</strong> Bellman-Ford is designed to handle graphs with negative edge weights and runs in <code>O(V × E)</code> time. In healthcare logistics, physical distance and waiting time can never be negative (<code>w(u, v) &ge; 0</code>). Therefore, Dijkstra with a Min-Heap (<code>O((V+E)log V)</code>) is dramatically faster and optimal.
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <div className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                  Q3: What algorithmic paradigm does Dijkstra belong to?
                </div>
                <div className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  <strong>Answer:</strong> Dijkstra belongs to the <strong>Greedy algorithmic paradigm</strong>. At each iteration, it extracts the globally unvisited vertex with the minimum cumulative distance from the source (local optimal choice) which guarantees global optimality due to the Optimal Substructure property and non-negative edge weights.
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <div className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                  Q4: How does dynamic patient congestion change edge relaxation?
                </div>
                <div className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  <strong>Answer:</strong> When a department's patient count increases, its effective weight <code>w(u, v)</code> increases. During relaxation, if an alternate path through an express lane or alternate diagnostic suite yields <code>dist[u] + w &lt; dist[v]</code>, the Min-Heap automatically updates, deflecting incoming patient flow away from the bottleneck.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
