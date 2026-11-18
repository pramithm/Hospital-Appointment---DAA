import { useState } from 'react';
import { Compass, Lock, Mail, Stethoscope, UserCog, ShieldAlert } from 'lucide-react';
import { useStore } from '@/store/StoreContext';

export function LoginPage() {
  const { login } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) {
      setError('Please enter an authorized email address.');
      return;
    }
    const ok = login(email, password);
    if (!ok) {
      setError('Invalid credentials. Select one of the demo portal accounts below.');
    }
  };

  const quickLogin = (em: string) => {
    setEmail(em);
    setPassword('demo123');
    setError('');
    login(em, 'demo123');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-sky-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-teal-600 p-3.5 rounded-2xl mb-3 shadow-lg shadow-teal-600/20">
            <Compass className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            MediRoute
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Intelligent Healthcare Patient Flow & Routing System
          </p>
        </div>

        {/* Login card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-6">
            Healthcare Operations Sign In
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Staff Email
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={16}
                />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 dark:text-slate-100"
                  placeholder="admin@health.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={16}
                />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 dark:text-slate-100"
                  placeholder="demo123"
                  autoComplete="current-password"
                />
              </div>
            </div>

            {error && (
              <div className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-lg border border-rose-200 dark:border-rose-900">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 rounded-xl transition-colors shadow-md text-xs"
            >
              Sign In to Hospital Graph
            </button>
          </form>

          {/* Quick Demo Logins */}
          <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-700">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5 text-center">
              One-Click Demo Roles
            </p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => quickLogin('admin@health.com')}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-200 text-left"
              >
                <UserCog size={16} className="text-teal-600 shrink-0" />
                <div>
                  <div className="font-bold">Hospital Operations Director</div>
                  <div className="text-[10px] text-slate-400">admin@health.com</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => quickLogin('triage@health.com')}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-200 text-left"
              >
                <ShieldAlert size={16} className="text-amber-500 shrink-0" />
                <div>
                  <div className="font-bold">Lead Triage & Intake Officer</div>
                  <div className="text-[10px] text-slate-400">triage@health.com</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => quickLogin('doctor@health.com')}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-200 text-left"
              >
                <Stethoscope size={16} className="text-indigo-500 shrink-0" />
                <div>
                  <div className="font-bold">Department Clinical Lead</div>
                  <div className="text-[10px] text-slate-400">doctor@health.com</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
