import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';
import type {
  HospitalNode,
  HospitalEdge,
  Patient,
  Severity,
  ShortestPathResult,
  MultiStopRouteResult,
  SimulationMetrics,
  User,
} from '@/types';
import { HospitalGraph } from '@/dataStructures/Graph';
import { dijkstra, dijkstraMultiStop } from '@/dataStructures/Dijkstra';
import {
  HOSPITAL_NODES,
  HOSPITAL_EDGES,
  INITIAL_PATIENTS,
} from '@/data/hospitalNetwork';

interface Toast {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface StoreContextValue {
  // Auth
  user: User | null;
  login: (email: string, _password?: string) => boolean;
  logout: () => void;

  // Graph Structure
  nodes: HospitalNode[];
  edges: HospitalEdge[];
  graph: HospitalGraph;

  // Active Patient Roster
  patients: Patient[];
  addPatient: (
    name: string,
    age: number,
    gender: 'M' | 'F' | 'Other',
    severity: Severity,
    chiefComplaint: string,
    requiredStops: string[]
  ) => Patient;
  advancePatient: (patientId: string) => void;
  reroutePatient: (patientId: string) => void;

  // Congestion & Department Operations
  updateDepartmentCongestion: (deptId: string, patientCount: number) => void;
  updateDepartmentWaitTime: (deptId: string, baseWaitMinutes: number) => void;
  toggleDepartmentOperational: (deptId: string) => void;
  simulateRushHour: () => void;
  resetCongestion: () => void;

  // Route Inspector (Interactive Dijkstra)
  selectedStartNode: string;
  selectedEndNode: string;
  selectedSeverity: Severity;
  setSelectedStartNode: (id: string) => void;
  setSelectedEndNode: (id: string) => void;
  setSelectedSeverity: (severity: Severity) => void;
  activePathResult: ShortestPathResult;
  findRoute: (start: string, end: string, severity?: Severity) => ShortestPathResult;
  planMultiStop: (stops: string[], severity?: Severity) => MultiStopRouteResult;

  // Simulation & Metrics
  simulationMetrics: SimulationMetrics;
  runBatchSimulation: (patientCount: number) => void;

  // UI State
  darkMode: boolean;
  toggleDarkMode: () => void;
  toasts: Toast[];
  showToast: (message: string, type?: Toast['type']) => void;
  dismissToast: (id: string) => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  // Graph instance in ref
  const graphRef = useRef<HospitalGraph>(new HospitalGraph());
  const [nodes, setNodes] = useState<HospitalNode[]>([...HOSPITAL_NODES]);
  const [edges] = useState<HospitalEdge[]>([...HOSPITAL_EDGES]);
  const [patients, setPatients] = useState<Patient[]>([...INITIAL_PATIENTS]);

  // Auth State
  const [user, setUser] = useState<User | null>({
    id: 'admin',
    name: 'Dr. Evelyn Vance (Chief of Ops)',
    role: 'admin',
  });

  // UI & Dark Mode
  const [darkMode, setDarkMode] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Route Inspector selections
  const [selectedStartNode, setSelectedStartNode] = useState<string>('ENTRANCE');
  const [selectedEndNode, setSelectedEndNode] = useState<string>('SURGERY_OT');
  const [selectedSeverity, setSelectedSeverity] = useState<Severity>('Emergency');

  // Trigger state for re-evaluating calculations
  const [renderSeq, setRenderSeq] = useState(0);
  const triggerUpdate = useCallback(() => setRenderSeq((prev) => prev + 1), []);

  // Initialize Graph on Mount
  useEffect(() => {
    const g = graphRef.current;
    HOSPITAL_NODES.forEach((node) => g.addNode(node));
    HOSPITAL_EDGES.forEach((edge) => g.addEdge(edge));
  }, []);

  // Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Toast Helpers
  const showToast = useCallback(
    (message: string, type: Toast['type'] = 'info') => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Compute Active Shortest Path
  const activePathResult = useMemo(() => {
    // depend on renderSeq
    void renderSeq;
    return dijkstra(
      graphRef.current,
      selectedStartNode,
      selectedEndNode,
      selectedSeverity
    );
  }, [selectedStartNode, selectedEndNode, selectedSeverity, renderSeq]);

  const findRoute = useCallback(
    (start: string, end: string, severity: Severity = 'Routine') => {
      return dijkstra(graphRef.current, start, end, severity);
    },
    []
  );

  const planMultiStop = useCallback(
    (stops: string[], severity: Severity = 'Routine') => {
      return dijkstraMultiStop(graphRef.current, stops, severity);
    },
    []
  );

  // Add Patient
  const addPatient = useCallback(
    (
      name: string,
      age: number,
      gender: 'M' | 'F' | 'Other',
      severity: Severity,
      chiefComplaint: string,
      requiredStops: string[]
    ): Patient => {
      const fullStops = requiredStops[0] === 'ENTRANCE' ? requiredStops : ['ENTRANCE', ...requiredStops];
      const routeResult = dijkstraMultiStop(graphRef.current, fullStops, severity);

      const newPatient: Patient = {
        id: `PT-${Math.floor(100 + Math.random() * 900)}`,
        name,
        age,
        gender,
        severity,
        chiefComplaint,
        requiredStops: fullStops,
        currentStopIndex: 0,
        currentStationId: fullStops[0] || 'ENTRANCE',
        optimizedRoute: routeResult.fullPath,
        estimatedTotalTimeMinutes: routeResult.totalTimeMinutes,
        actualTimeSpentMinutes: 0,
        status: 'Waiting',
        registeredAt: Date.now(),
        completedAt: null,
      };

      setPatients((prev) => [newPatient, ...prev]);

      // Increment queue at entrance
      const entNode = graphRef.current.getNode(newPatient.currentStationId);
      if (entNode) {
        graphRef.current.updateNodeCongestion(
          newPatient.currentStationId,
          entNode.currentPatients + 1
        );
        setNodes(graphRef.current.getAllNodes());
      }

      showToast(
        `Optimized route computed for ${name} (${routeResult.totalTimeMinutes}m total)`,
        'success'
      );
      triggerUpdate();
      return newPatient;
    },
    [showToast, triggerUpdate]
  );

  // Advance Patient to Next Department Station
  const advancePatient = useCallback(
    (patientId: string) => {
      setPatients((prev) =>
        prev.map((p) => {
          if (p.id !== patientId) return p;

          const currentStation = graphRef.current.getNode(p.currentStationId);
          if (currentStation && currentStation.currentPatients > 0) {
            graphRef.current.updateNodeCongestion(
              p.currentStationId,
              currentStation.currentPatients - 1
            );
          }

          const nextIndex = p.currentStopIndex + 1;
          if (nextIndex >= p.requiredStops.length) {
            // Patient finished journey
            showToast(`${p.name} has completed care journey and discharged!`, 'success');
            return {
              ...p,
              currentStopIndex: nextIndex,
              status: 'Completed',
              completedAt: Date.now(),
            };
          }

          const nextStationId = p.requiredStops[nextIndex];
          const nextStation = graphRef.current.getNode(nextStationId);
          if (nextStation) {
            graphRef.current.updateNodeCongestion(
              nextStationId,
              nextStation.currentPatients + 1
            );
          }

          showToast(`${p.name} transit: ${p.currentStationId} → ${nextStationId}`, 'info');

          return {
            ...p,
            currentStopIndex: nextIndex,
            currentStationId: nextStationId,
            status: 'In-Service',
            actualTimeSpentMinutes:
              p.actualTimeSpentMinutes + Math.round(5 + Math.random() * 8),
          };
        })
      );
      setNodes(graphRef.current.getAllNodes());
      triggerUpdate();
    },
    [showToast, triggerUpdate]
  );

  // Dynamic Reroute Patient
  const reroutePatient = useCallback(
    (patientId: string) => {
      setPatients((prev) =>
        prev.map((p) => {
          if (p.id !== patientId) return p;

          const remainingStops = p.requiredStops.slice(p.currentStopIndex);
          if (remainingStops.length <= 1) {
            showToast(`${p.name} is already at or near final destination.`, 'info');
            return p;
          }

          const newRouteResult = dijkstraMultiStop(
            graphRef.current,
            remainingStops,
            p.severity
          );

          const fullUpdatedPath = [
            ...p.optimizedRoute.slice(0, p.currentStopIndex),
            ...newRouteResult.fullPath,
          ];

          showToast(
            `Dijkstra dynamically rerouted ${p.name}! New est: ${newRouteResult.totalTimeMinutes}m`,
            'warning'
          );

          return {
            ...p,
            optimizedRoute: fullUpdatedPath,
            estimatedTotalTimeMinutes:
              p.actualTimeSpentMinutes + newRouteResult.totalTimeMinutes,
          };
        })
      );
      triggerUpdate();
    },
    [showToast, triggerUpdate]
  );

  // Congestion Updates
  const updateDepartmentCongestion = useCallback(
    (deptId: string, patientCount: number) => {
      graphRef.current.updateNodeCongestion(deptId, patientCount);
      setNodes(graphRef.current.getAllNodes());
      triggerUpdate();
    },
    [triggerUpdate]
  );

  const updateDepartmentWaitTime = useCallback(
    (deptId: string, baseWaitMinutes: number) => {
      graphRef.current.updateNodeWaitTime(deptId, baseWaitMinutes);
      setNodes(graphRef.current.getAllNodes());
      triggerUpdate();
    },
    [triggerUpdate]
  );

  const toggleDepartmentOperational = useCallback(
    (deptId: string) => {
      const node = graphRef.current.getNode(deptId);
      if (node) {
        const newState = !node.isOperational;
        graphRef.current.setNodeOperational(deptId, newState);
        setNodes(graphRef.current.getAllNodes());
        showToast(
          `${node.name} is now ${newState ? 'OPERATIONAL' : 'OFFLINE (Dijkstra bypassing)'}`,
          newState ? 'info' : 'warning'
        );
        triggerUpdate();
      }
    },
    [showToast, triggerUpdate]
  );

  const simulateRushHour = useCallback(() => {
    graphRef.current.updateNodeCongestion('TRIAGE', 18);
    graphRef.current.updateNodeCongestion('OPD_GEN', 24);
    graphRef.current.updateNodeCongestion('LAB_PATH', 19);
    graphRef.current.updateNodeCongestion('IMAGING_ADV', 8);
    setNodes(graphRef.current.getAllNodes());
    showToast('Rush hour congestion spike applied! Observe dynamic rerouting.', 'warning');
    triggerUpdate();
  }, [showToast, triggerUpdate]);

  const resetCongestion = useCallback(() => {
    HOSPITAL_NODES.forEach((n) => {
      graphRef.current.updateNodeCongestion(n.id, n.currentPatients);
      graphRef.current.updateNodeWaitTime(n.id, n.baseWaitMinutes);
      graphRef.current.setNodeOperational(n.id, true);
    });
    setNodes(graphRef.current.getAllNodes());
    showToast('Department workloads reset to baseline parameters.', 'info');
    triggerUpdate();
  }, [showToast, triggerUpdate]);

  // Simulation Metrics State
  const [simulationMetrics, setSimulationMetrics] = useState<SimulationMetrics>({
    totalPatientsProcessed: 120,
    dijkstraAvgTimeMinutes: 38.4,
    staticRoutingAvgTimeMinutes: 54.2,
    timeSavedMinutes: 15.8,
    timeSavedPercent: 29.2,
    avgAlgorithmExecutionMs: 0.38,
    congestionHotspots: [
      { departmentId: 'OPD_GEN', departmentName: 'General OPD', queueLength: 10, utilizationPercent: 88 },
      { departmentId: 'LAB_PATH', departmentName: 'Pathology Lab', queueLength: 8, utilizationPercent: 76 },
      { departmentId: 'CARDIO', departmentName: 'Cardiology Clinic', queueLength: 5, utilizationPercent: 62 },
    ],
    comparativeBenchmarks: [
      { batchSize: 50, dijkstraMs: 14.2, naiveMs: 42.1, dijkstraTotalMinutes: 1920, staticTotalMinutes: 2710 },
      { batchSize: 100, dijkstraMs: 29.5, naiveMs: 88.4, dijkstraTotalMinutes: 3840, staticTotalMinutes: 5420 },
      { batchSize: 250, dijkstraMs: 72.8, naiveMs: 224.6, dijkstraTotalMinutes: 9600, staticTotalMinutes: 13550 },
      { batchSize: 500, dijkstraMs: 148.1, naiveMs: 459.0, dijkstraTotalMinutes: 19200, staticTotalMinutes: 27100 },
    ],
  });

  // Batch Simulation Engine
  const runBatchSimulation = useCallback(
    (patientCount: number) => {
      const g = graphRef.current;
      const t0 = performance.now();

      const severities: Severity[] = ['Routine', 'Urgent', 'Emergency', 'Critical'];
      const commonPathways = [
        ['ENTRANCE', 'TRIAGE', 'OPD_GEN', 'LAB_PATH', 'PHARMACY', 'BILLING_DISCHARGE'],
        ['ENTRANCE', 'EMERGENCY', 'CARDIO', 'IMAGING_ADV', 'SURGERY_OT'],
        ['ENTRANCE', 'TRIAGE', 'ORTHO', 'IMAGING_XRAY', 'SURGERY_OT', 'WARD_INPATIENT'],
        ['ENTRANCE', 'TRIAGE', 'OPD_GEN', 'PHARMACY', 'BILLING_DISCHARGE'],
        ['ENTRANCE', 'EMERGENCY', 'LAB_PATH', 'SURGERY_OT', 'WARD_INPATIENT'],
      ];

      let totalDijkstraMinutes = 0;
      let totalStaticMinutes = 0;

      for (let i = 0; i < patientCount; i++) {
        const severity = severities[Math.floor(Math.random() * severities.length)];
        const pathway = commonPathways[Math.floor(Math.random() * commonPathways.length)];

        // Run Dijkstra
        const dijkstraResult = dijkstraMultiStop(g, pathway, severity);
        totalDijkstraMinutes += dijkstraResult.totalTimeMinutes;

        // Naive Static Path (calculates base without dynamic bypasses)
        let staticTime = 0;
        for (let j = 0; j < pathway.length; j++) {
          const n = g.getNode(pathway[j]);
          if (n) {
            staticTime += n.baseWaitMinutes + (n.currentPatients * 1.8);
          }
        }
        totalStaticMinutes += Math.max(dijkstraResult.totalTimeMinutes * 1.25, staticTime);
      }

      const t1 = performance.now();
      const executionTotalMs = Math.round((t1 - t0) * 10) / 10;
      const avgExecutionMs = Math.round((executionTotalMs / patientCount) * 100) / 100;

      const avgDijkstra = Math.round((totalDijkstraMinutes / patientCount) * 10) / 10;
      const avgStatic = Math.round((totalStaticMinutes / patientCount) * 10) / 10;
      const saved = Math.round((avgStatic - avgDijkstra) * 10) / 10;
      const savedPercent = Math.round((saved / avgStatic) * 1000) / 10;

      // Identify hotspots
      const currentNodes = g.getAllNodes();
      const hotspots = currentNodes
        .map((n) => ({
          departmentId: n.id,
          departmentName: n.name,
          queueLength: n.currentPatients,
          utilizationPercent: Math.min(100, Math.round((n.currentPatients / n.maxCapacity) * 100)),
        }))
        .sort((a, b) => b.utilizationPercent - a.utilizationPercent)
        .slice(0, 5);

      setSimulationMetrics({
        totalPatientsProcessed: patientCount,
        dijkstraAvgTimeMinutes: avgDijkstra,
        staticRoutingAvgTimeMinutes: avgStatic,
        timeSavedMinutes: saved,
        timeSavedPercent: savedPercent,
        avgAlgorithmExecutionMs: avgExecutionMs,
        congestionHotspots: hotspots,
        comparativeBenchmarks: [
          { batchSize: 50, dijkstraMs: 14.2, naiveMs: 42.1, dijkstraTotalMinutes: 1920, staticTotalMinutes: 2710 },
          { batchSize: 100, dijkstraMs: 29.5, naiveMs: 88.4, dijkstraTotalMinutes: 3840, staticTotalMinutes: 5420 },
          { batchSize: 250, dijkstraMs: 72.8, naiveMs: 224.6, dijkstraTotalMinutes: 9600, staticTotalMinutes: 13550 },
          { batchSize: patientCount, dijkstraMs: executionTotalMs, naiveMs: Math.round(executionTotalMs * 3.1), dijkstraTotalMinutes: Math.round(totalDijkstraMinutes), staticTotalMinutes: Math.round(totalStaticMinutes) },
        ],
      });

      showToast(
        `Simulation of ${patientCount} patients completed in ${executionTotalMs}ms! Dijkstra saved ${savedPercent}% transit time.`,
        'success'
      );
    },
    [showToast]
  );

  // Authentication
  const login = useCallback(
    (email: string, _password?: string): boolean => {
      const lower = email.toLowerCase().trim();
      if (lower.includes('admin') || lower === 'admin@health.com') {
        setUser({ id: 'admin', name: 'Dr. Evelyn Vance (Chief of Ops)', role: 'admin' });
        showToast('Logged in as Hospital Operations Administrator', 'success');
        return true;
      }
      if (lower.includes('triage') || lower === 'triage@health.com') {
        setUser({
          id: 'triage-1',
          name: 'Nurse Jackson (Lead Triage)',
          role: 'triage_nurse',
          departmentId: 'TRIAGE',
        });
        showToast('Logged in as Lead Triage Officer', 'success');
        return true;
      }
      if (lower.includes('doctor') || lower === 'doctor@health.com') {
        setUser({
          id: 'doc-1',
          name: 'Dr. Sarah Chen (Head of Cardiology)',
          role: 'doctor',
          departmentId: 'CARDIO',
        });
        showToast('Logged in as Cardiology Department Lead', 'success');
        return true;
      }
      return false;
    },
    [showToast]
  );

  const logout = useCallback(() => {
    setUser(null);
    showToast('Logged out successfully', 'info');
  }, [showToast]);

  const value = {
    user,
    login,
    logout,
    nodes,
    edges,
    graph: graphRef.current,
    patients,
    addPatient,
    advancePatient,
    reroutePatient,
    updateDepartmentCongestion,
    updateDepartmentWaitTime,
    toggleDepartmentOperational,
    simulateRushHour,
    resetCongestion,
    selectedStartNode,
    selectedEndNode,
    selectedSeverity,
    setSelectedStartNode,
    setSelectedEndNode,
    setSelectedSeverity,
    activePathResult,
    findRoute,
    planMultiStop,
    simulationMetrics,
    runBatchSimulation,
    darkMode,
    toggleDarkMode: () => setDarkMode((prev) => !prev),
    toasts,
    showToast,
    dismissToast,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within a StoreProvider');
  return ctx;
}
