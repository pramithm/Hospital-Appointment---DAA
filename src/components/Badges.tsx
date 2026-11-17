import type { Severity, PatientStatus, DepartmentCategory } from '@/types';
import { SEVERITY_COLORS } from '@/dataStructures/severity';

export function SeverityBadge({ severity }: { severity: Severity }) {
  const colors = SEVERITY_COLORS[severity];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${colors.badge}`}
    >
      <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
      {severity}
    </span>
  );
}

export function PatientStatusBadge({ status }: { status: PatientStatus }) {
  const configs: Record<PatientStatus, { bg: string; dot: string; label: string }> = {
    Waiting: {
      bg: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
      dot: 'bg-amber-500',
      label: 'Waiting in Queue',
    },
    'In-Transit': {
      bg: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300',
      dot: 'bg-indigo-500 animate-pulse',
      label: 'In Transit',
    },
    'In-Service': {
      bg: 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300',
      dot: 'bg-sky-500',
      label: 'With Clinician',
    },
    Completed: {
      bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
      dot: 'bg-emerald-500',
      label: 'Discharged',
    },
  };

  const c = configs[status] || configs.Waiting;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${c.bg}`}
    >
      <span className={`w-2 h-2 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

export function DepartmentCategoryBadge({ category }: { category: DepartmentCategory }) {
  const styleMap: Record<DepartmentCategory, { bg: string; text: string; label: string }> = {
    reception: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-300', label: 'Reception' },
    triage: { bg: 'bg-teal-100 dark:bg-teal-950/60', text: 'text-teal-700 dark:text-teal-300', label: 'Triage' },
    emergency: { bg: 'bg-red-100 dark:bg-red-950/60', text: 'text-red-700 dark:text-red-300', label: 'Emergency' },
    consultation: { bg: 'bg-blue-100 dark:bg-blue-950/60', text: 'text-blue-700 dark:text-blue-300', label: 'Consultation' },
    diagnostic: { bg: 'bg-purple-100 dark:bg-purple-950/60', text: 'text-purple-700 dark:text-purple-300', label: 'Diagnostic' },
    surgical: { bg: 'bg-rose-100 dark:bg-rose-950/60', text: 'text-rose-700 dark:text-rose-300', label: 'Surgical/ICU' },
    inpatient: { bg: 'bg-amber-100 dark:bg-amber-950/60', text: 'text-amber-700 dark:text-amber-300', label: 'Inpatient' },
    pharmacy: { bg: 'bg-emerald-100 dark:bg-emerald-950/60', text: 'text-emerald-700 dark:text-emerald-300', label: 'Pharmacy' },
    discharge: { bg: 'bg-cyan-100 dark:bg-cyan-950/60', text: 'text-cyan-700 dark:text-cyan-300', label: 'Discharge' },
  };

  const item = styleMap[category] || styleMap.reception;
  return (
    <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium ${item.bg} ${item.text}`}>
      {item.label}
    </span>
  );
}
