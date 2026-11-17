import { useState, useEffect } from 'react';
import { StoreProvider, useStore } from '@/store/StoreContext';
import { Sidebar, type Page } from '@/components/Sidebar';
import { ToastContainer } from '@/components/ToastContainer';
import { ChatAssistant } from '@/components/ChatAssistant';
import { LoginPage } from '@/pages/LoginPage';
import { PatientEntryPage } from '@/pages/PatientEntryPage';
import { QueueDashboardPage } from '@/pages/QueueDashboardPage';
import { DoctorPortalPage } from '@/pages/DoctorPortalPage';
import { SlotAllocationPage } from '@/pages/SlotAllocationPage';
import { AnalyticsPage } from '@/pages/AnalyticsPage';
import { SimulationPage } from '@/pages/SimulationPage';
import { DocumentationPage } from '@/pages/DocumentationPage';

function AppContent() {
  const { user } = useStore();
  const [page, setPage] = useState<Page>('queue-dashboard');

  // Set default page based on role after login
  useEffect(() => {
    if (user) {
      if (user.role === 'admin' || user.role === 'triage_nurse') setPage('queue-dashboard');
      else setPage('doctor-portal');
    }
  }, [user]);

  if (!user) {
    return (
      <>
        <LoginPage />
        <ToastContainer />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar currentPage={page} onNavigate={setPage} />
      <main className="lg:ml-64 p-4 sm:p-6 lg:p-8 min-h-screen">
        {page === 'patient-entry' && <PatientEntryPage />}
        {page === 'queue-dashboard' && <QueueDashboardPage />}
        {page === 'doctor-portal' && <DoctorPortalPage />}
        {page === 'slot-allocation' && <SlotAllocationPage />}
        {page === 'analytics' && <AnalyticsPage />}
        {page === 'simulation' && <SimulationPage />}
        {page === 'documentation' && <DocumentationPage />}
      </main>
      <ToastContainer />
      <ChatAssistant />
    </div>
  );
}

function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}

export default App;
