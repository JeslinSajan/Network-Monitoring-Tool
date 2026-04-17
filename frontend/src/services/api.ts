export interface Alert {
  timestamp: string;
  alert_type: string;
  source_ip: string;
  destination_ip: string;
  description: string;
  severity: string;
}

export interface Statistics {
  total_alerts: number;
  alert_types: Record<string, number>;
  top_sources: Record<string, number>;
  top_destinations: Record<string, number>;
  timeline: Record<string, number>;
  last_update: string;
}

export interface AlertsResponse {
  alerts: Alert[];
  stats: {
    total_packets: number;
    total_alerts: number;
    active_threats: number;
    last_update: string;
  };
}

const API_BASE_URL = 'http://localhost:5001/api';

export const fetchAlerts = async (): Promise<AlertsResponse> => {
  const response = await fetch(`${API_BASE_URL}/alerts`);
  if (!response.ok) {
    throw new Error('Failed to fetch alerts');
  }
  return response.json();
};

export const fetchStatistics = async (): Promise<Statistics> => {
  const response = await fetch(`${API_BASE_URL}/statistics`);
  if (!response.ok) {
    throw new Error('Failed to fetch statistics');
  }
  return response.json();
};

export const clearAlerts = async (): Promise<{ success: boolean; message: string }> => {
  const response = await fetch(`${API_BASE_URL}/clear-alerts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Failed to clear alerts');
  }
  return response.json();
};

export const startSimulation = async (duration: number = 30, intensity: string = 'medium'): Promise<{ success: boolean; message: string }> => {
  const response = await fetch(`${API_BASE_URL}/simulate-attack`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ duration, intensity }),
  });
  if (!response.ok) {
    throw new Error('Failed to start simulation');
  }
  return response.json();
};

export const stopSimulation = async (): Promise<{ success: boolean; message: string }> => {
  const response = await fetch(`${API_BASE_URL}/stop-simulation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Failed to stop simulation');
  }
  return response.json();
};

export const startIDS = async (networkInterface?: string): Promise<{ success: boolean; message: string }> => {
  const response = await fetch(`${API_BASE_URL}/start-ids`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ interface: networkInterface }),
  });
  if (!response.ok) {
    throw new Error('Failed to start IDS');
  }
  return response.json();
};

export const stopIDS = async (): Promise<{ success: boolean; message: string }> => {
  const response = await fetch(`${API_BASE_URL}/stop-ids`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Failed to stop IDS');
  }
  return response.json();
};

export const getSystemStatus = async (): Promise<{
  simulation_running: boolean;
  ids_running: boolean;
  server_time: string;
  uptime: number;
}> => {
  const response = await fetch(`${API_BASE_URL}/status`);
  if (!response.ok) {
    throw new Error('Failed to get system status');
  }
  return response.json();
};

export const exportAlerts = async (): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/export-alerts`);
  if (!response.ok) {
    throw new Error('Failed to export alerts');
  }
  
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ids_alerts_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};
