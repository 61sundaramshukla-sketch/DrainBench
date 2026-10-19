import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Sidebar } from './components/Sidebar.jsx';
import { Topbar }  from './components/Topbar.jsx';
import { Dashboard }           from './pages/Dashboard.jsx';
import { LiveMonitoring }      from './pages/LiveMonitoring.jsx';
import { Experiments }         from './pages/Experiments.jsx';
import { MethodComparisonPage } from './pages/MethodComparisonPage.jsx';
import { Analytics }           from './pages/Analytics.jsx';
import { Alerts }              from './pages/Alerts.jsx';
import { SystemStatusPage }    from './pages/SystemStatusPage.jsx';
import { DataLogs }            from './pages/DataLogs.jsx';
import { Settings }            from './pages/Settings.jsx';

const PAGE_TITLES = {
  '/':           'Dashboard',
  '/live':       'Live Monitoring',
  '/experiments':'Experiments',
  '/compare':    'Method Comparison',
  '/analytics':  'Analytics',
  '/alerts':     'Alerts',
  '/status':     'System Status',
  '/logs':       'Data Logs',
  '/settings':   'Settings',
};

function Shell() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] ?? 'DrainBench';

  // Close drawer on route change
  useEffect(() => { setOpen(false); }, [location.pathname]);

  return (
    <div className="app-layout">
      <Sidebar isOpen={open} onClose={() => setOpen(false)} />
      <div className="main-content" id="main-content">
        <Topbar pageTitle={title} onMenuClick={() => setOpen(o => !o)} />
        <main className="page-content" id="page-content" role="main" aria-label={title}>
          <Routes>
            <Route path="/"            element={<Dashboard />} />
            <Route path="/live"        element={<LiveMonitoring />} />
            <Route path="/experiments" element={<Experiments />} />
            <Route path="/compare"     element={<MethodComparisonPage />} />
            <Route path="/analytics"   element={<Analytics />} />
            <Route path="/alerts"      element={<Alerts />} />
            <Route path="/status"      element={<SystemStatusPage />} />
            <Route path="/logs"        element={<DataLogs />} />
            <Route path="/settings"    element={<Settings />} />
            <Route path="*" element={
              <div style={{textAlign:'center',padding:'80px 20px'}}>
                <h2 style={{marginBottom:12}}>Page not found</h2>
                <p>Use the sidebar to navigate.</p>
              </div>
            }/>
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return <BrowserRouter><Shell /></BrowserRouter>;
}
