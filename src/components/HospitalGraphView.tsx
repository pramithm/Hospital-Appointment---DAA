import { useState } from 'react';
import { useStore } from '@/store/StoreContext';
import type { HospitalNode } from '@/types';
import {
  Layers,
  Sparkles,
} from 'lucide-react';

export function HospitalGraphView() {
  const {
    nodes,
    edges,
    activePathResult,
    selectedStartNode,
    selectedEndNode,
    setSelectedStartNode,
    setSelectedEndNode,
    patients,
  } = useStore();

  const [activeFloor, setActiveFloor] = useState<'all' | 'Ground Floor' | 'First Floor'>('all');
  const [hoveredNode, setHoveredNode] = useState<HospitalNode | null>(null);

  // Set of node IDs in active shortest path
  const pathNodeSet = new Set(activePathResult.path);

  // Set of edge IDs in active shortest path
  const pathEdgeSet = new Set<string>();
  for (let i = 0; i < activePathResult.path.length - 1; i++) {
    const from = activePathResult.path[i];
    const to = activePathResult.path[i + 1];
    pathEdgeSet.add(`${from}->${to}`);
    pathEdgeSet.add(`${to}->${from}`);
  }

  // Count active patients currently at each node
  const patientCountByStation = patients.reduce<Record<string, number>>((acc, p) => {
    if (p.status !== 'Completed') {
      acc[p.currentStationId] = (acc[p.currentStationId] || 0) + 1;
    }
    return acc;
  }, {});

  const filteredNodes = nodes.filter(
    (n) => activeFloor === 'all' || n.floor === activeFloor
  );

  const filteredNodeIds = new Set(filteredNodes.map((n) => n.id));

  const filteredEdges = edges.filter(
    (e) => filteredNodeIds.has(e.from) && filteredNodeIds.has(e.to)
  );

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm overflow-hidden">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100 dark:border-slate-700">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Layers className="text-teal-600 dark:text-teal-400" size={20} />
            Interactive Hospital Topology Map G = (V, E)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time weighted graph network with live patient density & Dijkstra shortest path routing.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Floor View:</span>
          {(['all', 'Ground Floor', 'First Floor'] as const).map((floor) => (
            <button
              key={floor}
              onClick={() => setActiveFloor(floor)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeFloor === floor
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {floor === 'all' ? 'All Wings (3D Multi-Floor)' : floor}
            </button>
          ))}
        </div>
      </div>

      {/* Topology Legend */}
      <div className="flex flex-wrap items-center gap-4 text-[11px] mb-3 px-2 text-slate-600 dark:text-slate-300">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-emerald-300 dark:ring-emerald-800" />
          <span>Source (Start)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-rose-500 ring-2 ring-rose-300 dark:ring-rose-800" />
          <span>Target (Destination)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-5 h-1 bg-teal-500 rounded-full shadow-sm shadow-teal-500/50" />
          <span className="font-semibold text-teal-600 dark:text-teal-400">Dijkstra Shortest Path</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-1 border-b-2 border-dashed border-indigo-400" />
          <span>Emergency Express Transit Corridor</span>
        </div>
        <div className="flex items-center gap-1.5 ml-auto text-slate-400">
          <span>Click any node to set Start / End</span>
        </div>
      </div>

      {/* SVG Canvas Map */}
      <div className="relative w-full aspect-[16/9] min-h-[460px] bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex items-center justify-center">
        <svg
          viewBox="0 0 920 540"
          className="w-full h-full select-none"
          style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.02))' }}
        >
          <defs>
            {/* Glowing marker for shortest path */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0d9488" />
              <stop offset="50%" stopColor="#14b8a6" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>

          {/* Render Graph Edges */}
          {filteredEdges.map((edge) => {
            const fromNode = nodes.find((n) => n.id === edge.from);
            const toNode = nodes.find((n) => n.id === edge.to);
            if (!fromNode || !toNode) return null;

            const isPathEdge =
              pathEdgeSet.has(`${edge.from}->${edge.to}`) ||
              pathEdgeSet.has(`${edge.to}->${edge.from}`);

            const midX = (fromNode.x + toNode.x) / 2;
            const midY = (fromNode.y + toNode.y) / 2;

            return (
              <g key={edge.id} className="transition-all duration-300">
                {/* Edge line */}
                <line
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke={
                    isPathEdge
                      ? 'url(#pathGradient)'
                      : edge.isExpressCorridor
                        ? '#818cf8'
                        : '#cbd5e1'
                  }
                  strokeWidth={isPathEdge ? 4 : edge.isExpressCorridor ? 2.5 : 1.5}
                  strokeDasharray={
                    isPathEdge ? 'none' : edge.isExpressCorridor ? '4,4' : 'none'
                  }
                  strokeLinecap="round"
                  filter={isPathEdge ? 'url(#glow)' : undefined}
                  className={isPathEdge ? 'animate-pulse' : 'dark:stroke-slate-700'}
                />

                {/* Edge Weight Pill Badge */}
                <g transform={`translate(${midX}, ${midY})`}>
                  <rect
                    x={-18}
                    y={-10}
                    width={36}
                    height={20}
                    rx={6}
                    fill={isPathEdge ? '#0d9488' : '#ffffff'}
                    stroke={isPathEdge ? '#14b8a6' : '#e2e8f0'}
                    strokeWidth={1}
                    className="dark:fill-slate-800 dark:stroke-slate-600 shadow-sm"
                  />
                  <text
                    x={0}
                    y={3.5}
                    textAnchor="middle"
                    fontSize={9}
                    fontWeight={isPathEdge ? '700' : '500'}
                    fill={isPathEdge ? '#ffffff' : '#64748b'}
                    className="dark:fill-slate-300"
                  >
                    {edge.baseTransitMinutes}m
                  </text>
                </g>
              </g>
            );
          })}

          {/* Render Graph Nodes (Departments) */}
          {filteredNodes.map((node) => {
            const isStart = node.id === selectedStartNode;
            const isEnd = node.id === selectedEndNode;
            const isInPath = pathNodeSet.has(node.id);
            const activePatientsAtNode = patientCountByStation[node.id] || 0;
            const isBottleneck = node.currentPatients >= node.maxCapacity * 0.8;

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onClick={() => {
                  if (node.id === selectedStartNode) {
                    // Do nothing
                  } else if (!selectedStartNode) {
                    setSelectedStartNode(node.id);
                  } else {
                    setSelectedEndNode(node.id);
                  }
                }}
                onMouseEnter={() => setHoveredNode(node)}
                onMouseLeave={() => setHoveredNode(null)}
                className="cursor-pointer group"
              >
                {/* Node Ring Halo */}
                {(isStart || isEnd || isInPath) && (
                  <circle
                    r={32}
                    fill="none"
                    stroke={
                      isStart
                        ? '#10b981'
                        : isEnd
                          ? '#f43f5e'
                          : '#14b8a6'
                    }
                    strokeWidth={isStart || isEnd ? 3 : 2}
                    strokeDasharray={isStart || isEnd ? 'none' : '4,3'}
                    className={isStart || isEnd ? 'animate-ping opacity-30' : ''}
                  />
                )}

                {/* Main Node Circle */}
                <circle
                  r={26}
                  fill={
                    isStart
                      ? '#10b981'
                      : isEnd
                        ? '#f43f5e'
                        : isInPath
                          ? '#0d9488'
                          : isBottleneck
                            ? '#f97316'
                            : '#ffffff'
                  }
                  stroke={
                    isStart
                      ? '#059669'
                      : isEnd
                        ? '#e11d48'
                        : isInPath
                          ? '#14b8a6'
                          : isBottleneck
                            ? '#ea580c'
                            : '#94a3b8'
                  }
                  strokeWidth={isInPath || isStart || isEnd ? 3 : 2}
                  className="transition-all duration-200 dark:fill-slate-800 group-hover:scale-110"
                />

                {/* Node Label (ShortCode) */}
                <text
                  textAnchor="middle"
                  y={4}
                  fontSize={11}
                  fontWeight="bold"
                  fill={
                    isStart || isEnd || isInPath
                      ? '#ffffff'
                      : '#1e293b'
                  }
                  className={!isStart && !isEnd && !isInPath ? 'dark:fill-slate-100' : ''}
                >
                  {node.shortCode}
                </text>

                {/* Department Name Beneath Node */}
                <text
                  textAnchor="middle"
                  y={38}
                  fontSize={10}
                  fontWeight={isInPath ? '700' : '500'}
                  fill={isInPath ? '#0d9488' : '#475569'}
                  className={!isInPath ? 'dark:fill-slate-400' : 'dark:fill-teal-400'}
                >
                  {node.name.length > 18 ? node.name.slice(0, 16) + '..' : node.name}
                </text>

                {/* Patient Density Count Badge */}
                {activePatientsAtNode > 0 && (
                  <g transform="translate(18, -18)">
                    <circle r={10} fill="#6366f1" />
                    <text
                      textAnchor="middle"
                      y={3.5}
                      fontSize={10}
                      fontWeight="bold"
                      fill="#ffffff"
                    >
                      {activePatientsAtNode}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Hovered Node Tooltip Overlay */}
        {hoveredNode && (
          <div className="absolute bottom-3 left-3 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-xl p-3 shadow-lg max-w-sm pointer-events-none text-xs">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                {hoveredNode.name}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 text-[10px] font-semibold">
                {hoveredNode.floor}
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 mb-2">{hoveredNode.description}</p>
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
              <div>
                <span className="text-slate-400 text-[10px] block">Current Load</span>
                <span className="font-bold text-slate-700 dark:text-slate-200">
                  {hoveredNode.currentPatients} / {hoveredNode.maxCapacity} pts
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Base Wait</span>
                <span className="font-bold text-slate-700 dark:text-slate-200">
                  {hoveredNode.baseWaitMinutes} mins
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Staff on Duty</span>
                <span className="font-bold text-slate-700 dark:text-slate-200">
                  {hoveredNode.staffCount} clinicians
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Path Summary Strip */}
      <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-teal-500/10 via-sky-500/10 to-indigo-500/10 border border-teal-200 dark:border-teal-900/50 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-md">
            <Sparkles size={20} />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-300">
              Optimal Care Pathway (Dijkstra Min-Heap)
            </div>
            <div className="text-sm font-bold text-slate-800 dark:text-slate-100 flex flex-wrap items-center gap-1.5 mt-0.5">
              {activePathResult.nodes.map((n, idx) => (
                <span key={n.id} className="inline-flex items-center">
                  <span className="px-2 py-0.5 bg-white dark:bg-slate-700 rounded shadow-xs text-xs">
                    {n.shortCode} ({n.name})
                  </span>
                  {idx < activePathResult.nodes.length - 1 && (
                    <span className="text-teal-500 mx-1 font-bold">→</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-5 text-right">
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">Total Latency</span>
            <span className="text-lg font-black text-teal-600 dark:text-teal-400">
              {activePathResult.totalTimeMinutes} mins
            </span>
          </div>
          <div className="border-l border-slate-200 dark:border-slate-700 pl-4">
            <span className="text-[11px] text-slate-400 block font-medium">Physical Distance</span>
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
              {activePathResult.totalDistanceMeters}m
            </span>
          </div>
          <div className="border-l border-slate-200 dark:border-slate-700 pl-4">
            <span className="text-[11px] text-slate-400 block font-medium">Complexity</span>
            <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
              O((V+E)log V)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
