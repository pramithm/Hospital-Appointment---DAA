# MediRoute — Patient Flow Optimization Using Dijkstra's Shortest Path Algorithm

A comprehensive, responsive web application and algorithmic simulation platform for **Design and Analysis of Algorithms (DAA)**. The project models a multi-floor hospital as a weighted directed graph and utilizes a custom **Binary Min-Heap** implementation of **Dijkstra's Algorithm** to compute globally optimal, lowest-latency care pathways for incoming patients—dynamically avoiding congested department bottlenecks.

---

## DAA Algorithmic Foundation

### 1. Graph Formulation: $G = (V, E)$
- **Vertices ($V$):** 13 hospital departments, diagnostic units, triage bays, and floor corridors.
- **Edges ($E$):** 28 physical transit walkways and express emergency corridors.
- **Dynamic Composite Weight Function $W(u, v)$:**
  $$W(u, v) = t_{\text{transit}}(u, v) + t_{\text{effective\_wait}}(v)$$
  where:
  $$t_{\text{effective\_wait}}(v) = t_{\text{base\_wait}}(v) + \left(\frac{\text{Queue}(v)}{\text{Staff}(v)}\right) \times \text{ServiceRate}(v) \times \text{SeverityFactor}$$

### 2. Binary Min-Heap Priority Queue
Implemented from scratch in [`src/dataStructures/MinHeap.ts`](file:///c:/Users/HOME/Desktop/Capstone%20Projects/Design%20Analysis%20and%20Algorithm/src/dataStructures/MinHeap.ts):
- `insert(node, priority)`: $\mathcal{O}(\log V)$ via `siftUp`
- `extractMin()`: $\mathcal{O}(\log V)$ via `siftDown`
- `peekMin()`: $\mathcal{O}(1)$

### 3. Edge Relaxation & Convergence
$$\text{If } d[u] + W(u, v) < d[v] \implies d[v] \leftarrow d[u] + W(u, v), \quad \pi[v] \leftarrow u$$
Total Time Complexity: $\mathcal{O}((V + E) \log V)$  
Space Complexity: $\mathcal{O}(V + E)$ (Adjacency List + Distance Map + Predecessor Array)

---

## Features

- **Interactive 2D Hospital Topology Map**:
  - Live SVG visualization of 13 departments across Ground and First Floors.
  - Real-time pulse animation highlighting Dijkstra's shortest path from selected Source to Sink.
  - Interactive nodes displaying current patient backlog, base turnaround, and floor tags.
- **Step-by-Step DAA Algorithm Visualizer**:
  - Step through Dijkstra's execution: inspect current node extraction, Min-Heap priority state, and edge relaxation comparisons (`dist[u] + w(u, v) < dist[v]`).
- **Patient Intake & Route Planner**:
  - Multi-station clinical journey planning (e.g., Entrance $\to$ Triage $\to$ Cardiology $\to$ Blood Lab $\to$ Pharmacy $\to$ Discharge).
  - Real-time Dijkstra calculation of total physical distance and transit latency.
- **Dynamic Bottleneck Bypass**:
  - Side-by-side comparison of conventional Static Routing vs Dijkstra Dynamic Shortest Path.
  - Adjust artificial department surge to observe Dijkstra immediately deflecting incoming patients through faster alternate corridors.
- **Department Station Manager (Clinician Portal)**:
  - Department workload sliders to modify congestion and wait times on the fly.
  - Emergency offline toggle to simulate station closures and observe immediate hospital-wide traffic rerouting.
- **Algorithmic Analytics & Scalability Benchmarks**:
  - Quantitative comparison: $\sim 29\%$ average transit latency reduction over static routing.
  - Empirical verification of Min-Heap $\mathcal{O}((V+E)\log V)$ runtime ($< 0.5$ ms per patient).
- **Simulation Lab**:
  - Batch simulation of 50 to 500 patients traversing the hospital graph.
- **DAA Viva & Documentation Reference**:
  - Mathematical formulation, complexity derivations, and high-yield examiner Q&A.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS |
| Graph & Visuals | Interactive SVG Topology + Lucide Icons |
| Core Algorithms | Custom `MinHeap.ts`, `Graph.ts`, `Dijkstra.ts` (0 external queue/graph libraries) |

---

## Getting Started

```bash
npm install
npm run dev
```

App runs locally at: `http://localhost:5173`. All graph modeling, heap operations, and shortest-path routing execute client-side in TypeScript.

---

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Hospital Operations Director (Admin) | `admin@health.com` | `demo123` |
| Lead Triage & Intake Officer | `triage@health.com` | `demo123` |
| Cardiology Department Lead (Doctor) | `doctor@health.com` | `demo123` |

---

## Viva & Defense Notes

### Q1: Why Dijkstra instead of BFS?
BFS assumes unweighted graphs (all edges equal). Hospital corridors have varying physical distances and waiting times. Dijkstra finds the exact lowest-latency path.

### Q2: Why Dijkstra instead of Bellman-Ford?
Bellman-Ford handles negative edge weights in $\mathcal{O}(V \cdot E)$. Hospital transit and waiting times are strictly non-negative ($w(u, v) \ge 0$), making Min-Heap Dijkstra ($\mathcal{O}((V+E)\log V)$) mathematically optimal and substantially faster.

### Q3: How does Dijkstra achieve dynamic bottleneck bypass?
When a department's patient count increases, its effective weight $W(u, v)$ rises. During edge relaxation, alternative paths through express lanes or adjacent wings yield lower tentative distances, causing the Min-Heap to prioritize and route patients around the bottleneck.
