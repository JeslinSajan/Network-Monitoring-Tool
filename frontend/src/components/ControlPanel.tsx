import React, { useState, useEffect } from 'react';
import { 
  startSimulation, 
  stopSimulation, 
  startIDS, 
  stopIDS, 
  getSystemStatus, 
  clearAlerts, 
  exportAlerts 
} from '../services/api';
import ConfirmDialog from './ConfirmDialog';

interface SystemStatus {
  simulation_running: boolean;
  ids_running: boolean;
  server_time: string;
  uptime: number;
}

const ControlPanel: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    simulation_running: false,
    ids_running: false,
    server_time: '',
    uptime: 0
  });
  const [simulationConfig, setSimulationConfig] = useState({
    duration: 30,
    intensity: 'medium'
  });
  const [networkInterface, setNetworkInterface] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const status = await getSystemStatus();
        setSystemStatus(status);
      } catch (error) {
        console.error('Failed to fetch status:', error);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleStartSimulation = async () => {
    setLoading(true);
    try {
      const result = await startSimulation(simulationConfig.duration, simulationConfig.intensity);
      showMessage(result.message);
      // Update status
      const status = await getSystemStatus();
      setSystemStatus(status);
    } catch (error) {
      showMessage('Failed to start simulation', 'error');
    }
    setLoading(false);
  };

  const handleStopSimulation = async () => {
    setLoading(true);
    try {
      const result = await stopSimulation();
      showMessage(result.message);
      // Update status
      const status = await getSystemStatus();
      setSystemStatus(status);
    } catch (error) {
      showMessage('Failed to stop simulation', 'error');
    }
    setLoading(false);
  };

  const handleStartIDS = async () => {
    setLoading(true);
    try {
      const result = await startIDS(networkInterface || undefined);
      showMessage(result.message);
      // Update status
      const status = await getSystemStatus();
      setSystemStatus(status);
    } catch (error) {
      showMessage('Failed to start IDS', 'error');
    }
    setLoading(false);
  };

  const handleStopIDS = async () => {
    setLoading(true);
    try {
      const result = await stopIDS();
      showMessage(result.message);
      // Update status
      const status = await getSystemStatus();
      setSystemStatus(status);
    } catch (error) {
      showMessage('Failed to stop IDS', 'error');
    }
    setLoading(false);
  };

  const handleClearAlerts = async () => {
    setShowConfirmDialog(true);
  };

  const confirmClearAlerts = async () => {
    setShowConfirmDialog(false);
    setLoading(true);
    try {
      const result = await clearAlerts();
      showMessage(result.message);
    } catch (error) {
      showMessage('Failed to clear alerts', 'error');
    }
    setLoading(false);
  };

  const cancelClearAlerts = () => {
    setShowConfirmDialog(false);
  };

  const handleExportAlerts = async () => {
    setLoading(true);
    try {
      await exportAlerts();
      showMessage('Alerts exported successfully');
    } catch (error) {
      showMessage('Failed to export alerts', 'error');
    }
    setLoading(false);
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <div className="glass-panel rounded-lg p-4 border-t border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">SYSTEM CONTROL</h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${systemStatus.simulation_running ? 'bg-neon-crimson animate-pulse' : 'bg-neutral-600'}`}></div>
              <span className="text-xs font-mono text-neutral-400">SIM</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${systemStatus.ids_running ? 'bg-neon-emerald animate-pulse' : 'bg-neutral-600'}`}></div>
              <span className="text-xs font-mono text-neutral-400">IDS</span>
            </div>
            <div className="text-xs font-mono text-neutral-400">
              UPTIME: {formatUptime(systemStatus.uptime)}
            </div>
          </div>
        </div>

        {/* Status Message */}
        {message && (
          <div className={`mb-4 p-2 rounded text-xs font-mono ${
            message.includes('Failed') ? 'bg-red-900/50 text-red-400' : 'bg-green-900/50 text-green-400'
          }`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Attack Simulation Controls */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-neon-crimson font-mono">ATTACK SIMULATION</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs text-neutral-400 font-mono">DURATION (seconds)</label>
                <input
                  type="number"
                  value={simulationConfig.duration}
                  onChange={(e) => setSimulationConfig({...simulationConfig, duration: parseInt(e.target.value) || 30})}
                  className="w-full bg-black/50 border border-neutral-700 rounded px-3 py-2 text-sm font-mono text-white focus:border-neon-crimson focus:outline-none"
                  min="10"
                  max="300"
                  disabled={systemStatus.simulation_running}
                />
              </div>
              
              <div>
                <label className="text-xs text-neutral-400 font-mono">INTENSITY</label>
                <select
                  value={simulationConfig.intensity}
                  onChange={(e) => setSimulationConfig({...simulationConfig, intensity: e.target.value})}
                  className="w-full bg-black/50 border border-neutral-700 rounded px-3 py-2 text-sm font-mono text-white focus:border-neon-crimson focus:outline-none"
                  disabled={systemStatus.simulation_running}
                >
                  <option value="low">LOW</option>
                  <option value="medium">MEDIUM</option>
                  <option value="high">HIGH</option>
                </select>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={handleStartSimulation}
                  disabled={systemStatus.simulation_running || loading}
                  className="flex-1 bg-neon-crimson/20 border border-neon-crimson text-neon-crimson px-3 py-2 rounded text-xs font-mono hover:bg-neon-crimson/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {systemStatus.simulation_running ? 'RUNNING...' : 'START SIMULATION'}
                </button>
                <button
                  onClick={handleStopSimulation}
                  disabled={!systemStatus.simulation_running || loading}
                  className="flex-1 bg-neutral-800/50 border border-neutral-600 text-neutral-400 px-3 py-2 rounded text-xs font-mono hover:bg-neutral-800/70 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  STOP
                </button>
              </div>
            </div>
          </div>

          {/* IDS Controls */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-neon-emerald font-mono">IDS MONITORING</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs text-neutral-400 font-mono">NETWORK INTERFACE (optional)</label>
                <input
                  type="text"
                  value={networkInterface}
                  onChange={(e) => setNetworkInterface(e.target.value)}
                  placeholder="e.g., eth0, wlan0 (leave empty for auto-detect)"
                  className="w-full bg-black/50 border border-neutral-700 rounded px-3 py-2 text-sm font-mono text-white focus:border-neon-emerald focus:outline-none"
                  disabled={systemStatus.ids_running}
                />
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={handleStartIDS}
                  disabled={systemStatus.ids_running || loading}
                  className="flex-1 bg-neon-emerald/20 border border-neon-emerald text-neon-emerald px-3 py-2 rounded text-xs font-mono hover:bg-neon-emerald/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {systemStatus.ids_running ? 'MONITORING...' : 'START IDS'}
                </button>
                <button
                  onClick={handleStopIDS}
                  disabled={!systemStatus.ids_running || loading}
                  className="flex-1 bg-neutral-800/50 border border-neutral-600 text-neutral-400 px-3 py-2 rounded text-xs font-mono hover:bg-neutral-800/70 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  STOP
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Alert Management */}
        <div className="mt-6 pt-4 border-t border-neutral-800">
          <h3 className="text-sm font-semibold text-neutral-300 font-mono mb-3">ALERT MANAGEMENT</h3>
          <div className="flex space-x-2">
            <button
              onClick={handleClearAlerts}
              disabled={loading}
              className="flex-1 bg-red-900/20 border border-red-700 text-red-400 px-3 py-2 rounded text-xs font-mono hover:bg-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              CLEAR ALERTS
            </button>
            <button
              onClick={handleExportAlerts}
              disabled={loading}
              className="flex-1 bg-blue-900/20 border border-blue-700 text-blue-400 px-3 py-2 rounded text-xs font-mono hover:bg-blue-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              EXPORT CSV
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="CLEAR ALERTS"
        message="Are you sure you want to clear all alerts? This action cannot be undone."
        onConfirm={confirmClearAlerts}
        onCancel={cancelClearAlerts}
        confirmText="CLEAR"
        cancelText="CANCEL"
      />
    </>
  );
};

export default ControlPanel;
