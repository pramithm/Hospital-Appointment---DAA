export type Severity = 'Routine' | 'Urgent' | 'Emergency' | 'Critical';
export type Role = 'admin' | 'doctor' | 'triage_nurse';
export type DepartmentCategory =
  | 'reception'
  | 'triage'
  | 'emergency'
  | 'consultation'
  | 'diagnostic'
  | 'surgical'
  | 'inpatient'
  | 'pharmacy'
  | 'discharge';

export interface HospitalNode {
  id: string;
  name: string;
  shortCode: string;
  category: DepartmentCategory;
  floor: 'Ground Floor' | 'First Floor';
  x: number;
  y: number;
  baseWaitMinutes: number;
  currentPatients: number;
  maxCapacity: number;
  avgServiceMinutes: number;
  isOperational: boolean;
  staffCount: number;
  description: string;
}

export interface HospitalEdge {
  id: string;
  from: string;
  to: string;
  distanceMeters: number;
  baseTransitMinutes: number;
  isExpressCorridor?: boolean;
  isBiDirectional?: boolean;
}

export interface DijkstraStep {
  stepNumber: number;
  currentNodeId: string;
  currentDistance: number;
  heapSnapshot: { nodeId: string; distance: number }[];
  relaxedEdges: {
    neighborId: string;
    edgeWeight: number;
    oldDistance: number;
    newDistance: number;
    relaxed: boolean;
  }[];
  visitedNodeIds: string[];
}

export interface ShortestPathResult {
  path: string[];
  nodes: HospitalNode[];
  edges: HospitalEdge[];
  totalTransitMinutes: number;
  totalWaitMinutes: number;
  totalTimeMinutes: number;
  totalDistanceMeters: number;
  steps: DijkstraStep[];
  distanceTable: Record<string, number>;
  previousTable: Record<string, string | null>;
  computationTimeMs: number;
}

export interface MultiStopRouteResult {
  segments: ShortestPathResult[];
  fullPath: string[];
  totalTimeMinutes: number;
  totalDistanceMeters: number;
  totalTransitMinutes: number;
  totalWaitMinutes: number;
  computationTimeMs: number;
}

export type PatientStatus = 'Waiting' | 'In-Transit' | 'In-Service' | 'Completed';

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'M' | 'F' | 'Other';
  severity: Severity;
  chiefComplaint: string;
  requiredStops: string[];
  currentStopIndex: number;
  currentStationId: string;
  optimizedRoute: string[];
  estimatedTotalTimeMinutes: number;
  actualTimeSpentMinutes: number;
  status: PatientStatus;
  registeredAt: number;
  completedAt: number | null;
}

export interface SimulationMetrics {
  totalPatientsProcessed: number;
  dijkstraAvgTimeMinutes: number;
  staticRoutingAvgTimeMinutes: number;
  timeSavedMinutes: number;
  timeSavedPercent: number;
  avgAlgorithmExecutionMs: number;
  congestionHotspots: {
    departmentId: string;
    departmentName: string;
    queueLength: number;
    utilizationPercent: number;
  }[];
  comparativeBenchmarks: {
    batchSize: number;
    dijkstraMs: number;
    naiveMs: number;
    dijkstraTotalMinutes: number;
    staticTotalMinutes: number;
  }[];
}

export interface User {
  id: string;
  name: string;
  role: Role;
  departmentId?: string;
}
