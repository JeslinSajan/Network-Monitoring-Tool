import React, { useEffect, useRef } from 'react';
import { Alert } from '../services/api';

interface AlertFeedProps {
  alerts: Alert[];
}

const AlertFeed: React.FC<AlertFeedProps> = React.memo(({ alerts }) => {
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new alerts arrive
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [alerts]);

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'high':
        return 'text-neon-crimson text-glow-crimson';
      case 'medium':
        return 'text-neon-amber text-glow-amber';
      case 'low':
        return 'text-neon-emerald text-glow-emerald';
      default:
        return 'text-neutral-400';
    }
  };

  const getBorderColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'high':
        return 'neon-border-critical';
      case 'medium':
        return 'neon-border-high';
      case 'low':
        return 'neon-border-safe';
      default:
        return 'border-l-neutral-600';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  return (
    <div className="glass-panel rounded-lg p-4 border-t border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">LIVE ALERT FEED</h2>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-neutral-400 text-xs font-mono">TERMINAL</span>
        </div>
      </div>
      
      <div 
        ref={feedRef}
        className="bg-black/50 rounded-lg p-4 h-96 overflow-y-auto font-mono text-xs terminal-text"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#374151 #1f2937' }}
      >
        {alerts.length === 0 ? (
          <div className="text-neutral-500 text-center py-8">
            <div className="animate-pulse">AWAITING TRAFFIC ANALYSIS...</div>
          </div>
        ) : (
          <div className="space-y-2">
            {alerts.map((alert, index) => (
              <div
                key={`${alert.timestamp}-${index}`}
                className={`glass-panel rounded p-3 ${getBorderColor(alert.severity)} transition-all duration-300 hover:bg-neutral-800/30`}
              >
                <div className="flex items-start space-x-3">
                  {/* Timestamp */}
                  <div className="text-neutral-500 font-mono text-xs flex-shrink-0">
                    [{formatTimestamp(alert.timestamp)}]
                  </div>
                  
                  {/* Alert Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`font-semibold ${getSeverityColor(alert.severity)}`}>
                        {alert.alert_type || 'UNKNOWN'}
                      </span>
                      <span className="text-neutral-600">|</span>
                      <span className="text-neutral-400">
                        SRC: {alert.source_ip || 'N/A'}
                      </span>
                      <span className="text-neutral-600">|</span>
                      <span className="text-neutral-400">
                        DST: {alert.destination_ip || 'N/A'}
                      </span>
                    </div>
                    
                    <div className="text-neutral-500 text-xs leading-tight">
                      {alert.description || 'No description available'}
                    </div>
                  </div>
                  
                  {/* Severity Indicator */}
                  <div className={`flex-shrink-0 ${getSeverityColor(alert.severity)}`}>
                    {alert.severity?.toUpperCase() || 'UNKNOWN'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Terminal Cursor Effect */}
        <div className="mt-2 text-neon-emerald animate-terminal-cursor">
          _
        </div>
      </div>
      
      {/* Feed Status Bar */}
      <div className="mt-4 flex items-center justify-between text-xs font-mono text-neutral-500">
        <div>
          TOTAL ENTRIES: {alerts.length}
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-neon-crimson rounded-full"></div>
            <span>CRITICAL</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-neon-amber rounded-full"></div>
            <span>HIGH</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-neon-emerald rounded-full"></div>
            <span>LOW</span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default AlertFeed;
