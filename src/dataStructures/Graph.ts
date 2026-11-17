import type { HospitalNode, HospitalEdge, Severity } from '@/types';

export interface DirectedEdgeWithTarget {
  edge: HospitalEdge;
  targetNode: HospitalNode;
  weight: number;
}

/**
 * Adjacency List Representation of the Hospital Department Graph G = (V, E)
 *
 * Design:
 * - Vertices: Hospital Departments & Transit Checkpoints
 * - Edges: Corridors, Walkways, Express Patient Transit Lanes
 * - Edge Weights: Dynamic composite cost = Transit Time (mins) + Congestion Delay (mins)
 */
export class HospitalGraph {
  private nodes: Map<string, HospitalNode> = new Map();
  private adjacencyList: Map<string, HospitalEdge[]> = new Map();
  private edgeRegistry: Map<string, HospitalEdge> = new Map();

  constructor() {
    this.nodes = new Map();
    this.adjacencyList = new Map();
    this.edgeRegistry = new Map();
  }

  addNode(node: HospitalNode): void {
    this.nodes.set(node.id, { ...node });
    if (!this.adjacencyList.has(node.id)) {
      this.adjacencyList.set(node.id, []);
    }
  }

  addEdge(edge: HospitalEdge): void {
    this.edgeRegistry.set(edge.id, edge);

    if (!this.adjacencyList.has(edge.from)) {
      this.adjacencyList.set(edge.from, []);
    }
    this.adjacencyList.get(edge.from)!.push(edge);

    // If edge is bidirectional, also add reverse edge if not already present
    if (edge.isBiDirectional) {
      const reverseEdgeId = `${edge.to}->${edge.from}`;
      if (!this.edgeRegistry.has(reverseEdgeId)) {
        const reverseEdge: HospitalEdge = {
          id: reverseEdgeId,
          from: edge.to,
          to: edge.from,
          distanceMeters: edge.distanceMeters,
          baseTransitMinutes: edge.baseTransitMinutes,
          isExpressCorridor: edge.isExpressCorridor,
          isBiDirectional: true,
        };
        this.edgeRegistry.set(reverseEdgeId, reverseEdge);
        if (!this.adjacencyList.has(edge.to)) {
          this.adjacencyList.set(edge.to, []);
        }
        this.adjacencyList.get(edge.to)!.push(reverseEdge);
      }
    }
  }

  getNode(id: string): HospitalNode | undefined {
    return this.nodes.get(id);
  }

  getAllNodes(): HospitalNode[] {
    return Array.from(this.nodes.values());
  }

  getAllEdges(): HospitalEdge[] {
    return Array.from(this.edgeRegistry.values());
  }

  getOutgoingEdges(nodeId: string): HospitalEdge[] {
    return this.adjacencyList.get(nodeId) || [];
  }

  /**
   * Calculates the dynamic operational weight between node u and node v.
   *
   * Formula:
   * Weight(u, v) = TransitTime(u, v) + WaitTime(v)
   *
   * Where WaitTime(v) accounts for:
   * - Base department service turnaround
   * - Current patient backlog vs staff capacity
   * - Patient triage severity factor (Critical/Emergency cases bypass routine lines)
   */
  calculateDynamicWeight(
    edge: HospitalEdge,
    targetNode: HospitalNode,
    severity: Severity = 'Routine'
  ): number {
    // 1. Transit Component
    let transitTime = edge.baseTransitMinutes;
    if (severity === 'Critical' || severity === 'Emergency') {
      if (edge.isExpressCorridor) {
        transitTime *= 0.5; // Express priority lanes for critical transport
      }
    }

    // 2. Department Congestion / Waiting Component
    if (!targetNode.isOperational) {
      return 9999; // Impassable / Closed department
    }

    // Effective wait time calculation
    const staff = Math.max(1, targetNode.staffCount);
    const queueRatio = targetNode.currentPatients / staff;
    const congestionDelay = queueRatio * (targetNode.avgServiceMinutes * 0.4);

    let effectiveWait = targetNode.baseWaitMinutes + congestionDelay;

    // Severity Priority factor (Emergency bypass)
    if (severity === 'Critical') {
      effectiveWait *= 0.15; // Immediate triage bypass
    } else if (severity === 'Emergency') {
      effectiveWait *= 0.35;
    } else if (severity === 'Urgent') {
      effectiveWait *= 0.70;
    }

    // If department is over capacity, add non-linear penalty
    if (targetNode.currentPatients >= targetNode.maxCapacity) {
      effectiveWait += 15; // Bottleneck penalty
    }

    return Math.max(0.5, Math.round((transitTime + effectiveWait) * 10) / 10);
  }

  updateNodeCongestion(nodeId: string, currentPatients: number): void {
    const node = this.nodes.get(nodeId);
    if (node) {
      node.currentPatients = Math.max(0, currentPatients);
    }
  }

  updateNodeWaitTime(nodeId: string, baseWaitMinutes: number): void {
    const node = this.nodes.get(nodeId);
    if (node) {
      node.baseWaitMinutes = Math.max(0, baseWaitMinutes);
    }
  }

  setNodeOperational(nodeId: string, isOperational: boolean): void {
    const node = this.nodes.get(nodeId);
    if (node) {
      node.isOperational = isOperational;
    }
  }
}
