"""
Healthcare Appointment Scheduling — FastAPI Backend
====================================================

Reference backend implementing all REST endpoints with custom
data structures (linked-list FIFO queue, binary max-heap priority
queue, and circular queue for round-robin slot allocation).

Setup:
    cd backend
    python -m venv venv
    source venv/bin/activate   (Windows: venv\Scripts\activate)
    pip install fastapi uvicorn pydantic python-jose[cryptography] passlib[bcrypt]
    uvicorn main:app --reload --port 8000

API docs available at http://localhost:8000/docs
"""

import time
import math
import uuid
import random
from datetime import datetime
from typing import Optional

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from jose import jwt
from passlib.context import CryptContext

# ============================================================
# CONFIG
# ============================================================

SECRET_KEY = "demo-secret-key-change-in-production"
ALGORITHM = "HS256"
MAX_CAPACITY = 500

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

app = FastAPI(title="MediQueue API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# CUSTOM DATA STRUCTURES
# ============================================================

class LLNode:
    """Node for the linked-list FIFO queue."""
    def __init__(self, value):
        self.value = value
        self.next: Optional["LLNode"] = None


class LinkedListQueue:
    """
    Linked-list based FIFO queue.
    Enqueue: O(1), Dequeue: O(1), Peek: O(1)
    """
    def __init__(self):
        self.head: Optional[LLNode] = None
        self.tail: Optional[LLNode] = None
        self._size = 0

    def enqueue(self, value) -> None:
        node = LLNode(value)
        if self.tail:
            self.tail.next = node
        else:
            self.head = node
        self.tail = node
        self._size += 1

    def dequeue(self):
        if not self.head:
            return None
        node = self.head
        self.head = node.next
        if not self.head:
            self.tail = None
        self._size -= 1
        return node.value

    def peek(self):
        return self.head.value if self.head else None

    @property
    def size(self) -> int:
        return self._size

    def to_list(self) -> list:
        result = []
        cur = self.head
        while cur:
            result.append(cur.value)
            cur = cur.next
        return result

    def remove(self, predicate) -> object:
        prev = None
        cur = self.head
        while cur:
            if predicate(cur.value):
                if prev:
                    prev.next = cur.next
                else:
                    self.head = cur.next
                if cur == self.tail:
                    self.tail = prev
                self._size -= 1
                return cur.value
            prev = cur
            cur = cur.next
        return None


class MaxHeap:
    """
    Binary max-heap priority queue (array-based).
    Insert: O(log n), ExtractMax: O(log n), Peek: O(1)
    """
    def __init__(self):
        self._heap: list = []  # each element: (priority, value)

    @property
    def size(self) -> int:
        return len(self._heap)

    def insert(self, value, priority: int) -> None:
        self._heap.append((priority, value))
        self._sift_up(len(self._heap) - 1)

    def extract_max(self):
        if not self._heap:
            return None
        top = self._heap[0]
        last = self._heap.pop()
        if self._heap:
            self._heap[0] = last
            self._sift_down(0)
        return top[1]

    def peek_max(self):
        return self._heap[0][1] if self._heap else None

    def to_sorted_list(self) -> list:
        return [v for _, v in sorted(self._heap, key=lambda x: -x[0])]

    def _sift_up(self, idx: int) -> None:
        while idx > 0:
            parent = (idx - 1) // 2
            if self._heap[idx][0] <= self._heap[parent][0]:
                break
            self._heap[idx], self._heap[parent] = self._heap[parent], self._heap[idx]
            idx = parent

    def _sift_down(self, idx: int) -> None:
        n = len(self._heap)
        while True:
            left = 2 * idx + 1
            right = 2 * idx + 2
            largest = idx
            if left < n and self._heap[left][0] > self._heap[largest][0]:
                largest = left
            if right < n and self._heap[right][0] > self._heap[largest][0]:
                largest = right
            if largest == idx:
                break
            self._heap[idx], self._heap[largest] = self._heap[largest], self._heap[idx]
            idx = largest


class CircularQueue:
    """
    Circular queue (ring buffer) for round-robin doctor allocation.
    Enqueue: O(1), Dequeue: O(1), IsFull/IsEmpty: O(1)
    """
    def __init__(self, capacity: int):
        self.capacity = capacity
        self._items: list = [None] * capacity
        self.front = 0
        self.rear = -1
        self._size = 0

    @property
    def size(self) -> int:
        return self._size

    @property
    def is_full(self) -> bool:
        return self._size == self.capacity

    @property
    def is_empty(self) -> bool:
        return self._size == 0

    def enqueue(self, value) -> bool:
        if self.is_full:
            return False
        self.rear = (self.rear + 1) % self.capacity
        self._items[self.rear] = value
        self._size += 1
        return True

    def dequeue(self):
        if self.is_empty:
            return None
        value = self._items[self.front]
        self._items[self.front] = None
        self.front = (self.front + 1) % self.capacity
        self._size -= 1
        return value

    def peek(self):
        return self._items[self.front] if self._size > 0 else None

    def all_slots(self) -> list:
        return list(self._items)


# ============================================================
# MODELS
# ============================================================

SEVERITY_PRIORITY = {
    "Routine": 1,
    "Urgent": 2,
    "Emergency": 3,
    "Critical": 4,
}

class PatientCreate(BaseModel):
    name: str
    age: int = Field(ge=0, le=130)
    problem_type: str
    severity: str  # Routine / Urgent / Emergency / Critical
    preferred_time: str

class LoginRequest(BaseModel):
    email: str
    password: str

class CallNextRequest(BaseModel):
    doctor_id: str

class SimulateRequest(BaseModel):
    count: int = Field(default=500, ge=1, le=500)


# ============================================================
# GLOBAL STATE (in-memory; swap for SQLite in production)
# ============================================================

fifo_queue = LinkedListQueue()
priority_heap = MaxHeap()
doctor_ring = CircularQueue(3)

DOCTORS = [
    {"id": "doc-1", "name": "Dr. Sarah Chen", "specialty": "General Medicine", "slot_count": 8, "patients_served": 0},
    {"id": "doc-2", "name": "Dr. James Patel", "specialty": "Cardiology", "slot_count": 8, "patients_served": 0},
    {"id": "doc-3", "name": "Dr. Maria Gomez", "specialty": "Emergency Care", "slot_count": 8, "patients_served": 0},
]

DEMO_USERS = {
    "admin@health.com": {"id": "admin", "name": "Administrator", "role": "admin", "password": "demo123"},
    "doctor@health.com": {"id": "doc-1", "name": "Dr. Sarah Chen", "role": "doctor", "doctor_id": "doc-1", "password": "demo123"},
}

slot_assignments: dict = {}   # doctor_id -> patient
current_patients: dict = {}   # doctor_id -> patient
completed_patients: list = []

# Seed ring with doctor IDs
for d in DOCTORS:
    doctor_ring.enqueue(d["id"])

# Seed 20 patients
PROBLEM_TYPES = ["Fever", "Chest Pain", "Fracture", "Headache", "Abdominal Pain",
                 "Shortness of Breath", "Allergic Reaction", "Hypertension"]
NAMES = ["John Smith", "Emma Wilson", "Liam Brown", "Olivia Davis", "Noah Miller",
         "Ava Garcia", "William Rodriguez", "Sophia Martinez", "James Anderson",
         "Isabella Thomas", "Benjamin Taylor", "Mia Moore", "Elijah Jackson",
         "Charlotte Lee", "Lucas Harris", "Amelia Clark", "Mason Lewis",
         "Harper Walker", "Ethan Hall", "Evelyn Allen"]
SEVERITIES = ["Routine", "Urgent", "Emergency", "Critical"]
TIMES = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "14:00", "14:30", "15:00"]


def _seed():
    for i in range(20):
        p = {
            "id": f"seed-{i+1}",
            "name": NAMES[i % len(NAMES)],
            "age": random.randint(18, 90),
            "problem_type": random.choice(PROBLEM_TYPES),
            "severity": random.choice(SEVERITIES),
            "preferred_time": random.choice(TIMES),
            "registered_at": time.time() - (20 - i) * 60,
            "called_at": None,
            "completed_at": None,
            "assigned_doctor": None,
        }
        fifo_queue.enqueue(p)
        priority_heap.insert(p, SEVERITY_PRIORITY[p["severity"]])

_seed()


# ============================================================
# AUTH
# ============================================================

def create_token(user_data: dict) -> str:
    payload = {**user_data, "exp": int(time.time()) + 86400}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

def get_current_user(authorization: Optional[str] = None) -> dict:
    if not authorization:
        return {"role": "anon"}
    token = authorization.replace("Bearer ", "")
    return verify_token(token)


# ============================================================
# ENDPOINTS
# ============================================================

@app.post("/login")
def login(req: LoginRequest):
    user = DEMO_USERS.get(req.email.lower().strip())
    if not user or user["password"] != req.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_token({"id": user["id"], "name": user["name"], "role": user["role"]})
    return {"token": token, "user": {"id": user["id"], "name": user["name"], "role": user["role"]}}


@app.post("/patients")
def add_patient(req: PatientCreate):
    total = fifo_queue.size + len(completed_patients) + len(slot_assignments)
    if total >= MAX_CAPACITY:
        raise HTTPException(status_code=400, detail="Capacity limit (500) reached.")

    patient = {
        "id": f"p-{uuid.uuid4().hex[:8]}",
        "name": req.name,
        "age": req.age,
        "problem_type": req.problem_type,
        "severity": req.severity,
        "preferred_time": req.preferred_time,
        "registered_at": time.time(),
        "called_at": None,
        "completed_at": None,
        "assigned_doctor": None,
    }
    fifo_queue.enqueue(patient)
    priority_heap.insert(patient, SEVERITY_PRIORITY.get(req.severity, 1))
    return {"ok": True, "patient": patient}


@app.get("/queue")
def get_queue():
    return {"queue": fifo_queue.to_list(), "count": fifo_queue.size}


@app.get("/priority-queue")
def get_priority_queue():
    return {"queue": priority_heap.to_sorted_list(), "count": priority_heap.size}


@app.post("/next")
def call_next(req: CallNextRequest):
    patient = priority_heap.extract_max()
    if not patient:
        raise HTTPException(status_code=404, detail="No patients in queue")
    fifo_queue.remove(lambda p: p["id"] == patient["id"])
    patient["called_at"] = time.time()
    patient["assigned_doctor"] = req.doctor_id
    current_patients[req.doctor_id] = patient
    for d in DOCTORS:
        if d["id"] == req.doctor_id:
            d["patients_served"] += 1
    return {"patient": patient}


@app.post("/allocate-slot")
def allocate_slot():
    allocated = 0
    while priority_heap.size > 0 and allocated < 50:
        patient = priority_heap.extract_max()
        if not patient:
            break
        doctor_id = doctor_ring.dequeue()
        if doctor_id:
            doctor_ring.enqueue(doctor_id)
        else:
            break
        patient["assigned_doctor"] = doctor_id
        slot_assignments[doctor_id] = patient
        fifo_queue.remove(lambda p: p["id"] == patient["id"])
        allocated += 1
    return {"allocated": allocated, "slots": slot_assignments}


@app.get("/doctors")
def get_doctors():
    result = []
    for d in DOCTORS:
        slot = slot_assignments.get(d["id"])
        result.append({**d, "slot_status": "booked" if slot else "free", "current_patient": slot})
    return {"doctors": result}


@app.get("/analytics")
def get_analytics():
    served = len(completed_patients)
    total_wait = 0
    emergency_wait = 0
    emergency_count = 0
    for p in completed_patients:
        if p.get("called_at") and p.get("completed_at"):
            wait = p["completed_at"] - p["registered_at"]
            total_wait += wait
            if p["severity"] in ("Emergency", "Critical"):
                emergency_wait += p["called_at"] - p["registered_at"]
                emergency_count += 1

    avg_wait = round(total_wait / served, 2) if served > 0 else 0
    emergency_response = round(emergency_wait / emergency_count, 2) if emergency_count > 0 else 0

    return {
        "average_waiting_time": avg_wait,
        "patients_served": served,
        "emergency_response_time_ms": int(emergency_response * 1000),
        "per_doctor_workload": [{"doctor_id": d["id"], "doctor_name": d["name"], "patients": d["patients_served"]} for d in DOCTORS],
    }


@app.post("/simulate")
def simulate(req: SimulateRequest):
    start = time.perf_counter()

    names = ["John", "Emma", "Liam", "Olivia", "Noah", "Ava", "William", "Sophia"]
    for i in range(req.count):
        p = {
            "id": f"sim-{uuid.uuid4().hex[:6]}",
            "name": f"{random.choice(names)} {i+1}",
            "age": random.randint(18, 90),
            "problem_type": random.choice(PROBLEM_TYPES),
            "severity": random.choice(SEVERITIES),
            "preferred_time": random.choice(TIMES),
            "registered_at": time.time(),
            "called_at": None,
            "completed_at": None,
            "assigned_doctor": None,
        }
        fifo_queue.enqueue(p)
        priority_heap.insert(p, SEVERITY_PRIORITY[p["severity"]])

    fill_end = time.perf_counter()

    # Measure emergency response
    emerg_start = time.perf_counter()
    top = priority_heap.peek_max()
    emerg_end = time.perf_counter()
    emergency_ms = int((emerg_end - emerg_start) * 1000)

    # Measure allocation
    alloc_start = time.perf_counter()
    alloc_count = 0
    temp_heap = MaxHeap()
    for p in fifo_queue.to_list():
        temp_heap.insert(p, SEVERITY_PRIORITY[p["severity"]])
    while temp_heap.size > 0 and alloc_count < min(req.count, 50):
        temp_heap.extract_max()
        doctor_ring.dequeue()
        doctor_ring.enqueue(DOCTORS[alloc_count % 3]["id"])
        alloc_count += 1
    alloc_end = time.perf_counter()
    allocation_ms = int((alloc_end - alloc_start) * 1000)

    fill_ms = int((fill_end - start) * 1000)

    return {
        "total_patients": req.count,
        "fill_time_ms": fill_ms,
        "emergency_response_ms": emergency_ms,
        "allocation_ms": allocation_ms,
        "emergency_pass": emergency_ms < 1000,
        "allocation_pass": allocation_ms < 2000,
    }


@app.get("/")
def root():
    return {"app": "MediQueue API", "docs": "/docs", "status": "running"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
