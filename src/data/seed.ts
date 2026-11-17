import type { Patient, Severity } from '@/types';

export const CLINICAL_COMPLAINTS = [
  'Severe Chest Pressure & Left Arm Tingling',
  'Suspected Compound Ankle Fracture',
  'Acute Appendicitis Symptoms',
  'Routine Executive Wellness Checkup',
  'Severe Migraine with Visual Aura',
  'Hypertensive Crisis with Tachycardia',
  'Abdominal Colic with Nausea',
  'Routine Blood Lipid Screening',
];

export const PATIENT_NAMES = [
  'John Smith', 'Emma Wilson', 'Liam Brown', 'Olivia Davis', 'Noah Miller',
  'Ava Garcia', 'William Rodriguez', 'Sophia Martinez', 'James Anderson',
  'Isabella Thomas', 'Benjamin Taylor', 'Mia Moore', 'Elijah Jackson',
];

export const SEVERITIES: Severity[] = ['Routine', 'Urgent', 'Emergency', 'Critical'];

export function generateSyntheticPatient(index: number): Patient {
  const name = PATIENT_NAMES[index % PATIENT_NAMES.length];
  const severity = SEVERITIES[index % SEVERITIES.length];
  const complaint = CLINICAL_COMPLAINTS[index % CLINICAL_COMPLAINTS.length];

  return {
    id: `SYN-${index + 1}`,
    name: `${name} ${index + 1}`,
    age: 20 + (index % 60),
    gender: index % 2 === 0 ? 'M' : 'F',
    severity,
    chiefComplaint: complaint,
    requiredStops: ['ENTRANCE', 'TRIAGE', 'OPD_GEN', 'PHARMACY', 'BILLING_DISCHARGE'],
    currentStopIndex: 0,
    currentStationId: 'ENTRANCE',
    optimizedRoute: ['ENTRANCE', 'TRIAGE', 'OPD_GEN', 'PHARMACY', 'BILLING_DISCHARGE'],
    estimatedTotalTimeMinutes: 38.0,
    actualTimeSpentMinutes: 0,
    status: 'Waiting',
    registeredAt: Date.now() - (index * 60000),
    completedAt: null,
  };
}
