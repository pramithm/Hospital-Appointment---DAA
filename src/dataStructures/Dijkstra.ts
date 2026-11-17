import { MinHeap } from './MinHeap';
import { HospitalGraph } from './Graph';
import type {
  ShortestPathResult,
  MultiStopRouteResult,
  DijkstraStep,
  HospitalNode,
  HospitalEdge,
  Severity,
} from '@/types';

/**
 * Dijkstra's Single-Source Shortest Path Algorithm
 * Optimized with Min-Heap Priority Queue: O((V + E) log V)
 *
 * Designed for real-time dynamic patient flow optimization across hospital departments.
 */
export function dijkstra(
  graph: HospitalGraph,
  startId: string,
  targetId: string,
  severity: Severity = 'Routine'
): ShortestPathResult {
  const startTime = performance.now();

  const allNodes = graph.getAllNodes();
  const dist: Record<string, number> = {};
  const prev: Record<string, string | null> = {};
  const edgeUsed: Record<string, HospitalEdge | null> = {};
  const visited = new Set<string>();
  const steps: DijkstraStep[] = [];

  // 1. Initialize Single Source: O(V)
  for (const node of allNodes) {
    dist[node.id] = Infinity;
    prev[node.id] = null;
    edgeUsed[node.id] = null;
  }
  dist[startId] = 0;

  // 2. Priority Queue (Min-Heap): Elements are { nodeId, cumulativeDistance }
  const minHeap = new MinHeap<string>();
  minHeap.insert(startId, 0);

  let stepCounter = 1;

  // 3. Relaxation Loop: O((V + E) log V)
  while (!minHeap.isEmpty) {
    const minItem = minHeap.extractMin();
    if (!minItem) break;

    const u = minItem.element;
    const currentDist = minItem.priority;

    // Skip stale heap entries
    if (currentDist > dist[u]) continue;

    visited.add(u);

    // Track step for DAA algorithm visualizer
    const step: DijkstraStep = {
      stepNumber: stepCounter++,
      currentNodeId: u,
      currentDistance: Math.round(currentDist * 10) / 10,
      heapSnapshot: minHeap
        .toArray()
        .slice(0, 8)
        .map((item) => ({
          nodeId: item.element,
          distance: Math.round(item.priority * 10) / 10,
        })),
      relaxedEdges: [],
      visitedNodeIds: Array.from(visited),
    };

    // If destination reached, we could stop or finish recording step
    const outgoingEdges = graph.getOutgoingEdges(u);

    for (const edge of outgoingEdges) {
      const v = edge.to;
      const targetNode = graph.getNode(v);
      if (!targetNode || !targetNode.isOperational) continue;

      // Calculate dynamic edge weight W(u, v)
      const weight = graph.calculateDynamicWeight(edge, targetNode, severity);
      const tentativeDist = dist[u] + weight;
      const oldDist = dist[v];

      const relaxed = tentativeDist < oldDist;

      step.relaxedEdges.push({
        neighborId: v,
        edgeWeight: Math.round(weight * 10) / 10,
        oldDistance: oldDist === Infinity ? -1 : Math.round(oldDist * 10) / 10,
        newDistance: Math.round(tentativeDist * 10) / 10,
        relaxed,
      });

      // Edge Relaxation Step
      if (relaxed) {
        dist[v] = tentativeDist;
        prev[v] = u;
        edgeUsed[v] = edge;
        minHeap.insert(v, tentativeDist);
      }
    }

    steps.push(step);

    if (u === targetId && targetId !== '') {
      // Shortest path to target found!
      break;
    }
  }

  // 4. Path Reconstruction
  const path: string[] = [];
  const nodesInPath: HospitalNode[] = [];
  const edgesInPath: HospitalEdge[] = [];

  let curr: string | null = targetId;

  if (dist[targetId] !== Infinity || startId === targetId) {
    while (curr) {
      path.unshift(curr);
      const nodeObj = graph.getNode(curr);
      if (nodeObj) nodesInPath.unshift(nodeObj);

      const incomingEdge = edgeUsed[curr];
      if (incomingEdge) edgesInPath.unshift(incomingEdge);

      curr = prev[curr];
      if (curr === startId) {
        path.unshift(curr);
        const startNode = graph.getNode(curr);
        if (startNode) nodesInPath.unshift(startNode);
        break;
      }
    }
  }

  // Deduplicate consecutive nodes
  const cleanPath = path.filter((val, idx) => idx === 0 || val !== path[idx - 1]);
  const cleanNodes = nodesInPath.filter(
    (val, idx) => idx === 0 || val.id !== nodesInPath[idx - 1]?.id
  );

  // Calculate totals
  let totalTransitMinutes = 0;
  let totalDistanceMeters = 0;
  let totalWaitMinutes = 0;

  for (const edge of edgesInPath) {
    totalTransitMinutes += edge.baseTransitMinutes;
    totalDistanceMeters += edge.distanceMeters;
  }

  for (const node of cleanNodes) {
    totalWaitMinutes += node.baseWaitMinutes;
  }

  const endTime = performance.now();
  const computationTimeMs = Math.round((endTime - startTime) * 100) / 100;

  return {
    path: cleanPath.length > 0 ? cleanPath : [startId],
    nodes: cleanNodes,
    edges: edgesInPath,
    totalTransitMinutes: Math.round(totalTransitMinutes * 10) / 10,
    totalWaitMinutes: Math.round(totalWaitMinutes * 10) / 10,
    totalTimeMinutes:
      dist[targetId] !== Infinity ? Math.round(dist[targetId] * 10) / 10 : 0,
    totalDistanceMeters: Math.round(totalDistanceMeters),
    steps,
    distanceTable: dist,
    previousTable: prev,
    computationTimeMs,
  };
}

/**
 * Multi-Stop Patient Journey Planner
 * Chains Dijkstra shortest paths across an entire clinical care sequence.
 * (e.g. Entrance -> Triage -> Specialist Clinic -> Lab -> Pharmacy -> Billing)
 */
export function dijkstraMultiStop(
  graph: HospitalGraph,
  stops: string[],
  severity: Severity = 'Routine'
): MultiStopRouteResult {
  const startTime = performance.now();

  if (stops.length <= 1) {
    return {
      segments: [],
      fullPath: stops,
      totalTimeMinutes: 0,
      totalDistanceMeters: 0,
      totalTransitMinutes: 0,
      totalWaitMinutes: 0,
      computationTimeMs: 0,
    };
  }

  const segments: ShortestPathResult[] = [];
  const fullPath: string[] = [];
  let totalTime = 0;
  let totalDistance = 0;
  let totalTransit = 0;
  let totalWait = 0;

  for (let i = 0; i < stops.length - 1; i++) {
    const from = stops[i];
    const to = stops[i + 1];
    const segment = dijkstra(graph, from, to, severity);
    segments.push(segment);

    totalTime += segment.totalTimeMinutes;
    totalDistance += segment.totalDistanceMeters;
    totalTransit += segment.totalTransitMinutes;
    totalWait += segment.totalWaitMinutes;

    segment.path.forEach((nodeId, idx) => {
      if (fullPath.length === 0 || nodeId !== fullPath[fullPath.length - 1] || idx > 0) {
        fullPath.push(nodeId);
      }
    });
  }

  // Clean duplicate consecutive nodes in fullPath
  const cleanFullPath = fullPath.filter(
    (nodeId, idx) => idx === 0 || nodeId !== fullPath[idx - 1]
  );

  const endTime = performance.now();
  const computationTimeMs = Math.round((endTime - startTime) * 100) / 100;

  return {
    segments,
    fullPath: cleanFullPath,
    totalTimeMinutes: Math.round(totalTime * 10) / 10,
    totalDistanceMeters: Math.round(totalDistance),
    totalTransitMinutes: Math.round(totalTransit * 10) / 10,
    totalWaitMinutes: Math.round(totalWait * 10) / 10,
    computationTimeMs,
  };
}
