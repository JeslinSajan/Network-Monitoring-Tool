import React from 'react';
import { Statistics } from '../services/api';

interface ProtocolBreakdownProps {
  statistics: Statistics | null;
}

const ProtocolBreakdown: React.FC<ProtocolBreakdownProps> = React.memo(({ statistics }) => {
  // Simulate protocol data based on alert types
  const getProtocolData = () => {
    if (!statistics?.alert_types) return { TCP: 45, UDP: 35, ICMP: 20 };
    
    const total = Object.values(statistics.alert_types).reduce((sum, count) => sum + count, 0);
    if (total === 0) return { TCP: 45, UDP: 35, ICMP: 20 };
    
    // Map alert types to protocols (simplified)
    let tcpCount = 0, udpCount = 0, icmpCount = 0;
    
    Object.entries(statistics.alert_types).forEach(([alertType, count]) => {
      if (alertType.includes('SYN') || alertType.includes('PORT_SCAN')) {
        tcpCount += count;
      } else if (alertType.includes('TRAFFIC') || alertType.includes('DDOS')) {
        udpCount += count;
      } else {
        icmpCount += count;
      }
    });
    
    const totalProtocol = tcpCount + udpCount + icmpCount || 1;
    
    return {
      TCP: Math.round((tcpCount / totalProtocol) * 100),
      UDP: Math.round((udpCount / totalProtocol) * 100),
      ICMP: Math.round((icmpCount / totalProtocol) * 100)
    };
  };

  const protocolData = getProtocolData();
  const total = Object.values(protocolData).reduce((sum, val) => sum + val, 0);

  const getProtocolColor = (protocol: string) => {
    switch (protocol) {
      case 'TCP': return '#00ff88'; // emerald
      case 'UDP': return '#ffb700'; // amber  
      case 'ICMP': return '#ff0040'; // crimson
      default: return '#6b7280';
    }
  };

  const getProtocolGlow = (protocol: string) => {
    switch (protocol) {
      case 'TCP': return 'text-glow-emerald';
      case 'UDP': return 'text-glow-amber';
      case 'ICMP': return 'text-glow-crimson';
      default: return '';
    }
  };

  // Create donut chart segments
  const createDonutPath = (startAngle: number, endAngle: number, innerRadius: number, outerRadius: number) => {
    const startAngleRad = (startAngle - 90) * Math.PI / 180;
    const endAngleRad = (endAngle - 90) * Math.PI / 180;
    
    const x1 = 50 + innerRadius * Math.cos(startAngleRad);
    const y1 = 50 + innerRadius * Math.sin(startAngleRad);
    const x2 = 50 + outerRadius * Math.cos(startAngleRad);
    const y2 = 50 + outerRadius * Math.sin(startAngleRad);
    const x3 = 50 + outerRadius * Math.cos(endAngleRad);
    const y3 = 50 + outerRadius * Math.sin(endAngleRad);
    const x4 = 50 + innerRadius * Math.cos(endAngleRad);
    const y4 = 50 + innerRadius * Math.sin(endAngleRad);
    
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
    
    return `
      M ${x1} ${y1}
      L ${x2} ${y2}
      A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x3} ${y3}
      L ${x4} ${y4}
      A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x1} ${y1}
    `;
  };

  let currentAngle = 0;
  const segments = Object.entries(protocolData).map(([protocol, percentage]) => {
    const startAngle = currentAngle;
    const endAngle = currentAngle + (percentage / total) * 360;
    currentAngle = endAngle;
    
    return {
      protocol,
      percentage,
      startAngle,
      endAngle,
      color: getProtocolColor(protocol),
      glow: getProtocolGlow(protocol)
    };
  });

  return (
    <div className="glass-panel rounded-lg p-4 border-t border-white/10 h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">PROTOCOL ANALYSIS</h2>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-neon-emerald rounded-full animate-pulse"></div>
          <span className="text-neutral-400 text-xs font-mono">L3/L4</span>
        </div>
      </div>
      
      {/* Donut Chart */}
      <div className="relative h-48 flex items-center justify-center mb-6">
        <svg viewBox="0 0 100 100" className="w-32 h-32">
          {segments.map((segment, index) => (
            <path
              key={segment.protocol}
              d={createDonutPath(segment.startAngle, segment.endAngle, 30, 45)}
              fill={segment.color}
              fillOpacity="0.8"
              stroke={segment.color}
              strokeWidth="0.5"
              className="transition-all duration-500 hover:fill-opacity-100"
            />
          ))}
          
          {/* Center text */}
          <text
            x="50"
            y="45"
            textAnchor="middle"
            className="text-2xl font-bold font-mono fill-white"
          >
            {total}
          </text>
          <text
            x="50"
            y="55"
            textAnchor="middle"
            className="text-xs font-mono fill-neutral-400"
          >
            TOTAL
          </text>
        </svg>
      </div>
      
      {/* Protocol Legend */}
      <div className="space-y-3">
        {segments.map((segment) => (
          <div key={segment.protocol} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: segment.color }}
              ></div>
              <span className="text-sm font-mono text-neutral-300">
                {segment.protocol}
              </span>
            </div>
            <div className="text-right">
              <span className={`text-lg font-bold font-mono ${segment.glow}`} style={{ color: segment.color }}>
                {segment.percentage}%
              </span>
              <div className="text-xs text-neutral-500 font-mono">
                {Math.round((segment.percentage / 100) * (statistics?.total_alerts || 0))} alerts
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Additional Stats */}
      <div className="mt-6 pt-4 border-t border-neutral-800">
        <div className="grid grid-cols-2 gap-4 text-xs font-mono">
          <div>
            <div className="text-neutral-500 mb-1">PACKET RATE</div>
            <div className="text-neon-emerald text-glow-emerald">
              {(Math.random() * 10000).toFixed(0)} pps
            </div>
          </div>
          <div>
            <div className="text-neutral-500 mb-1">THROUGHPUT</div>
            <div className="text-neon-amber text-glow-amber">
              {(Math.random() * 5).toFixed(2)} Gbps
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ProtocolBreakdown;
