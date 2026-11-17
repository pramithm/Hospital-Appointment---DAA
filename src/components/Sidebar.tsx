import { useState } from 'react';
import {
  Compass,
  UserPlus,
  Stethoscope,
  Route,
  BarChart3,
  FlaskConical,
  BookOpen,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
} from 'lucide-react';
import { useStore } from '@/store/StoreContext';
import type { Role } from '@/types';

export type Page =
  | 'login'
  | 'patient-entry'
  | 'queue-dashboard'
  | 'doctor-portal'
  | 'slot-allocation'
  | 'analytics'
  | 'simulation'
  | 'documentation';

interface NavItem {
  id: Page;
  label: string;
  icon: typeof Compass;
  roles: Role[];
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'queue-dashboard',
    label: 'Topology Map & Flow',
    icon: Compass,
    roles: ['admin', 'doctor', 'triage_nurse'],
  },
  {
    id: 'patient-entry',
    label: 'Patient Intake & Routing',
    icon: UserPlus,
    roles: ['admin', 'triage_nurse'],
  },
  {
    id: 'doctor-portal',
    label: 'Department Stations',
    icon: Stethoscope,
    roles: ['admin', 'doctor', 'triage_nurse'],
  },
  {
    id: 'slot-allocation',
    label: 'Bottleneck Bypass',
    icon: Route,
    roles: ['admin', 'doctor', 'triage_nurse'],
  },
  {
    id: 'analytics',
    label: 'Algorithmic Analytics',
    icon: BarChart3,
    roles: ['admin', 'doctor', 'triage_nurse'],
  },
  {
    id: 'simulation',
    label: 'Dijkstra Simulation Lab',
    icon: FlaskConical,
    roles: ['admin', 'doctor', 'triage_nurse'],
  },
  {
    id: 'documentation',
    label: 'DAA Viva Reference',
    icon: BookOpen,
    roles: ['admin', 'doctor', 'triage_nurse'],
  },
];

interface Props {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export function Sidebar({ currentPage, onNavigate }: Props) {
  const { user, logout, darkMode, toggleDarkMode } = useStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return null;

  const items = NAV_ITEMS.filter((item) => item.roles.includes(user.role));

  const handleNav = (page: Page) => {
    onNavigate(page);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile hamburger header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-teal-600 p-1.5 rounded-lg text-white">
            <Compass size={18} />
          </div>
          <span className="font-bold text-sm text-slate-800 dark:text-slate-100">
            MediRoute DAA
          </span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-xs"
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-200 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="bg-teal-600 p-2 rounded-xl text-white shadow-md shadow-teal-600/30">
              <Compass size={22} />
            </div>
            <div>
              <div className="font-black text-sm text-slate-900 dark:text-slate-100 tracking-tight">
                MediRoute
              </div>
              <div className="text-[10px] font-semibold text-teal-600 dark:text-teal-400">
                Dijkstra Patient Flow Optimization
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {items.map((item) => {
            const Icon = item.icon;
            const active = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  active
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <Icon size={18} className={active ? 'text-white' : 'text-slate-400'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Card & Settings */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs">
            <div className="font-bold text-slate-800 dark:text-slate-100 truncate">
              {user.name}
            </div>
            <div className="text-[10px] text-teal-600 dark:text-teal-400 uppercase font-bold tracking-wider mt-0.5">
              Role: {user.role.replace('_', ' ')}
            </div>
          </div>

          <div className="flex items-center gap-1.5 pt-1">
            <button
              onClick={toggleDarkMode}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {darkMode ? <Sun size={15} /> : <Moon size={15} />}
              <span>{darkMode ? 'Light' : 'Dark'}</span>
            </button>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
