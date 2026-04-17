import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import { Alert } from '../services/api';

interface ThreatMapProps {
  alerts: Alert[];
}

const ThreatMap: React.FC<ThreatMapProps> = React.memo(({ alerts }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  // Memoize expensive calculations
  const threatLocations = useMemo(() => {
    return alerts.slice(0, 20).map((alert, index) => {
      // Generate random coordinates based on source IP hash
      const hash = alert.source_ip.split('.').reduce((acc, val) => acc + parseInt(val), 0);
      const x = (hash * 7) % 800; // Use fixed canvas size
      const y = (hash * 13) % 400;
      
      const severity = alert.severity?.toLowerCase();
      let color = '#00ff88'; // default emerald
      if (severity === 'high') color = '#ff0040'; // crimson
      else if (severity === 'medium') color = '#ffb700'; // amber
      
      return { x, y, color, alert, index };
    });
  }, [alerts]);

  const drawMap = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Clear canvas
    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, width, height);

    // Draw world map outline (simplified)
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1;
    
    // Draw continents (simplified rectangles)
    const continents = [
      { name: 'North America', x: width * 0.15, y: height * 0.3, w: width * 0.2, h: height * 0.25 },
      { name: 'South America', x: width * 0.25, y: height * 0.6, w: width * 0.1, h: height * 0.3 },
      { name: 'Europe', x: width * 0.45, y: height * 0.25, w: width * 0.1, h: height * 0.15 },
      { name: 'Africa', x: width * 0.45, y: height * 0.45, w: width * 0.12, h: height * 0.35 },
      { name: 'Asia', x: width * 0.6, y: height * 0.25, w: width * 0.25, h: height * 0.4 },
      { name: 'Australia', x: width * 0.75, y: height * 0.7, w: width * 0.1, h: height * 0.1 },
    ];

    continents.forEach(continent => {
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(continent.x, continent.y, continent.w, continent.h);
      ctx.strokeRect(continent.x, continent.y, continent.w, continent.h);
    });

    // Draw grid lines
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 0.5;
    
    for (let i = 0; i <= width; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }
    
    for (let i = 0; i <= height; i += 50) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();
    }
  }, []);

  const drawThreats = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
    // Draw threat points with pulsing effect
    threatLocations.forEach((threat, index) => {
      const pulse = Math.sin(time * 2 + index) * 0.3 + 0.7;
      
      // Draw glow
      const gradient = ctx.createRadialGradient(threat.x, threat.y, 0, threat.x, threat.y, 20 * pulse);
      gradient.addColorStop(0, threat.color + '88');
      gradient.addColorStop(1, threat.color + '00');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(threat.x, threat.y, 20 * pulse, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw point
      ctx.fillStyle = threat.color;
      ctx.beginPath();
      ctx.arc(threat.x, threat.y, 3, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw connection lines to nearby threats
      threatLocations.forEach((other, otherIndex) => {
        if (index !== otherIndex) {
          const distance = Math.sqrt(Math.pow(threat.x - other.x, 2) + Math.pow(threat.y - other.y, 2));
          if (distance < 100) {
            ctx.strokeStyle = threat.color + '33';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(threat.x, threat.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        }
      });
    });
  }, [threatLocations]);

  const drawLegend = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Draw legend
    const legendY = 20;
    ctx.font = '10px JetBrains Mono';
    
    ctx.fillStyle = '#ff0040';
    ctx.fillRect(width - 150, legendY, 10, 10);
    ctx.fillStyle = '#9ca3af';
    ctx.fillText('CRITICAL', width - 135, legendY + 8);
    
    ctx.fillStyle = '#ffb700';
    ctx.fillRect(width - 150, legendY + 20, 10, 10);
    ctx.fillText('HIGH', width - 135, legendY + 28);
    
    ctx.fillStyle = '#00ff88';
    ctx.fillRect(width - 150, legendY + 40, 10, 10);
    ctx.fillText('LOW', width - 135, legendY + 48);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set fixed canvas size to avoid layout thrashing
    const width = 800;
    const height = 400;
    canvas.width = width;
    canvas.height = height;

    // Initial draw
    drawMap(ctx, width, height);
    drawLegend(ctx, width, height);

    // Animation loop
    const animate = () => {
      drawThreats(ctx, width, height, Date.now() / 1000);
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [drawMap, drawThreats, drawLegend]);

  return (
    <div className="glass-panel rounded-lg p-4 border-t border-white/10 h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">THREAT GEOGRAPHY</h2>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-neon-crimson rounded-full animate-pulse"></div>
          <span className="text-neutral-400 text-xs font-mono">LIVE</span>
        </div>
      </div>
      
      <div className="relative h-80 bg-black/50 rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ imageRendering: 'crisp-edges' }}
        />
        
        {/* Overlay stats */}
        <div className="absolute top-4 left-4 bg-black/70 rounded p-2 text-xs font-mono">
          <div className="text-neon-crimson">ACTIVE THREATS: {alerts.filter(a => a.severity === 'high').length}</div>
          <div className="text-neon-amber">WARNINGS: {alerts.filter(a => a.severity === 'medium').length}</div>
          <div className="text-neon-emerald">MONITORED: {alerts.length}</div>
        </div>
        
        {/* Scan line effect */}
        <div className="scan-line"></div>
      </div>
      
      <div className="mt-4 grid grid-cols-3 gap-2 text-xs font-mono">
        <div className="text-center">
          <div className="text-neutral-500">ORIGIN VECTORS</div>
          <div className="text-neon-crimson">{new Set(alerts.map(a => a.source_ip)).size}</div>
        </div>
        <div className="text-center">
          <div className="text-neutral-500">TARGETS</div>
          <div className="text-neon-amber">{new Set(alerts.map(a => a.destination_ip)).size}</div>
        </div>
        <div className="text-center">
          <div className="text-neutral-500">ATTACK TYPES</div>
          <div className="text-neon-emerald">{new Set(alerts.map(a => a.alert_type)).size}</div>
        </div>
      </div>
    </div>
  );
});

export default ThreatMap;
