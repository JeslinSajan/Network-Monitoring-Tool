import React from 'react';

interface MetricsRowProps {
  metrics: {
    bandwidth: number;
    blockedIPs: number;
    packetDropRate: number;
  };
}

const MetricsRow: React.FC<MetricsRowProps> = React.memo(({ metrics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Bandwidth Throughput */}
      <div className="glass-panel rounded-lg p-4 border-t border-white/10 relative overflow-hidden">
        <div className="scan-line"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-neutral-400 text-xs font-mono uppercase tracking-wider">
              Bandwidth Throughput
            </span>
            <div className="w-2 h-2 bg-neon-emerald rounded-full animate-pulse"></div>
          </div>
          <div className="metric-value text-neon-emerald text-glow-emerald">
            {metrics.bandwidth.toFixed(2)}
            <span className="text-lg text-neutral-400 ml-1">Gbps</span>
          </div>
          <div className="mt-2 h-8">
            <div className="flex items-end space-x-1 h-full">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="flex-1 bg-neon-emerald/20 rounded-sm"
                  style={{
                    height: `${Math.random() * 100}%`,
                    opacity: 0.3 + Math.random() * 0.7,
                  }}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Blocked IPs */}
      <div className="glass-panel rounded-lg p-4 border-t border-white/10 relative overflow-hidden">
        <div className="scan-line"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-neutral-400 text-xs font-mono uppercase tracking-wider">
              Blocked IPs (24h)
            </span>
            <div className="w-2 h-2 bg-neon-amber rounded-full animate-pulse"></div>
          </div>
          <div className="metric-value text-neon-amber text-glow-amber">
            {metrics.blockedIPs}
            <span className="text-lg text-neutral-400 ml-1">hosts</span>
          </div>
          <div className="mt-2 text-xs font-mono text-neutral-500">
            +{Math.floor(metrics.blockedIPs * 0.1)} from yesterday
          </div>
        </div>
      </div>

      {/* Packet Drop Rate */}
      <div className="glass-panel rounded-lg p-4 border-t border-white/10 relative overflow-hidden">
        <div className="scan-line"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-neutral-400 text-xs font-mono uppercase tracking-wider">
              L3/L4 Packet Drop Rate
            </span>
            <div className="w-2 h-2 bg-neon-crimson rounded-full animate-pulse"></div>
          </div>
          <div className="metric-value text-neon-crimson text-glow-crimson">
            {metrics.packetDropRate.toFixed(2)}
            <span className="text-lg text-neutral-400 ml-1">%</span>
          </div>
          <div className="mt-2">
            <div className="w-full bg-neutral-800 rounded-full h-2">
              <div
                className="bg-neon-crimson h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(metrics.packetDropRate * 10, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default MetricsRow;
