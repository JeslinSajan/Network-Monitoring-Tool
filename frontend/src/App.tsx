import React, { useState, useEffect, Suspense, lazy } from 'react';
import MetricsRow from './components/MetricsRow';
import AlertFeed from './components/AlertFeed';
import { fetchAlerts, fetchStatistics } from './services/api';

const ControlPanel = lazy(() => import('./components/ControlPanel'));
const ThreatMap = lazy(() => import('./components/ThreatMap'));
const ProtocolBreakdown = lazy(() => import('./components/ProtocolBreakdown'));

interface Alert {
  timestamp: string;
  alert_type: string;
  source_ip: string;
  destination_ip: string;
  description: string;
  severity: string;
}

interface Statistics {
  total_alerts: number;
  alert_types: Record<string, number>;
  top_sources: Record<string, number>;
  top_destinations: Record<string, number>;
  timeline: Record<string, number>;
  last_update: string;
}

const App: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [metrics, setMetrics] = useState({
    bandwidth: 0,
    blockedIPs: 0,
    packetDropRate: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const alertsData = await fetchAlerts();
        const statsData = await fetchStatistics();
        
        setAlerts(alertsData.alerts);
        setStatistics(statsData);
        
        // Calculate metrics
        setMetrics({
          bandwidth: Math.random() * 10, // Simulated Gbps
          blockedIPs: Object.keys(statsData.top_sources || {}).length,
          packetDropRate: Math.random() * 5, // Simulated %
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 bg-grid p-4">
      <div className="max-w-[1920px] mx-auto space-y-4">
        {/* Header */}
        <header className="glass-panel rounded-lg p-6 border-t border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
                NETWORK IDS
              </h1>
              <p className="text-neutral-400 font-mono text-sm">
                INTRUSION DETECTION SYSTEM // REAL-TIME MONITORING
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-neon-emerald rounded-full animate-pulse-glow"></div>
                <span className="text-neon-emerald font-mono text-sm">ACTIVE</span>
              </div>
              <div className="text-neutral-400 font-mono text-sm">
                {statistics?.last_update || '--'}
              </div>
            </div>
          </div>
        </header>

        {/* Metrics Row */}
        <MetricsRow metrics={metrics} />

        {/* Control Panel */}
        <Suspense fallback={<div className="text-neutral-400 font-mono text-sm p-4 text-center border-dashed border-2 border-neutral-800 rounded-lg">Loading Control Panel...</div>}>
          <ControlPanel />
        </Suspense>

        {/* Main Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Threat Map - Takes 2 columns on XL */}
          <div className="xl:col-span-2">
            <Suspense fallback={<div className="glass-panel p-4 text-center h-80 flex items-center justify-center text-neutral-400 border-dashed border-2 border-neutral-800 rounded-lg">Loading Threat Map...</div>}>
              <ThreatMap alerts={alerts} />
            </Suspense>
          </div>

          {/* Protocol Breakdown */}
          <div className="xl:col-span-1">
            <Suspense fallback={<div className="glass-panel p-4 text-center h-full flex items-center justify-center text-neutral-400 border-dashed border-2 border-neutral-800 rounded-lg">Loading Protocol Analysis...</div>}>
              <ProtocolBreakdown statistics={statistics} />
            </Suspense>
          </div>
        </div>

        {/* Alert Feed */}
        <AlertFeed alerts={alerts} />
      </div>
    </div>
  );
};

export default App;
