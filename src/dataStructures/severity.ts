import type { Severity } from '@/types';

export const SEVERITY_PRIORITY: Record<Severity, number> = {
  Critical: 4,
  Emergency: 3,
  Urgent: 2,
  Routine: 1,
};

export const SEVERITY_COLORS: Record<
  Severity,
  { bg: string; text: string; border: string; badge: string; dot: string }
> = {
  Routine: {
    bg: 'bg-sky-50 dark:bg-sky-950/40',
    text: 'text-sky-700 dark:text-sky-300',
    border: 'border-sky-200 dark:border-sky-800',
    badge: 'bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300',
    dot: 'bg-sky-500',
  },
  Urgent: {
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
    dot: 'bg-amber-500',
  },
  Emergency: {
    bg: 'bg-orange-50 dark:bg-orange-950/40',
    text: 'text-orange-700 dark:text-orange-300',
    border: 'border-orange-200 dark:border-orange-800',
    badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    dot: 'bg-orange-500',
  },
  Critical: {
    bg: 'bg-red-50 dark:bg-red-950/40',
    text: 'text-red-700 dark:text-red-300',
    border: 'border-red-200 dark:border-red-800',
    badge: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    dot: 'bg-red-500',
  },
};

export const SEVERITY_ORDER: Severity[] = [
  'Critical',
  'Emergency',
  'Urgent',
  'Routine',
];
