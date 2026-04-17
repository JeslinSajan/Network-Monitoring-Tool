#!/usr/bin/env node
/**
 * Enhanced API Server for Network IDS
 * Integrates all functionality into the React dashboard
 */

const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const { parse } = require('csv');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Global variables for real-time data
let latestAlerts = [];
let stats = {
    total_packets: 0,
    total_alerts: 0,
    active_threats: 0,
    last_update: new Date().toISOString()
};
let simulationRunning = false;
let idsRunning = false;

// Alert log file
const ALERT_FILE = path.join(__dirname, 'logs', 'intrusion_alerts.csv');

// Ensure logs directory exists
async function ensureLogsDir() {
    try {
        await fs.mkdir('logs', { recursive: true });
    } catch (error) {
        console.error('Error creating logs directory:', error);
    }
}

// Read alerts from CSV
async function readAlertsFromCSV() {
    const alerts = [];
    
    try {
        const exists = await fs.access(ALERT_FILE).then(() => true).catch(() => false);
        if (!exists) return alerts;

        return new Promise((resolve, reject) => {
            const results = [];
            fsSync.createReadStream(ALERT_FILE)
                .pipe(parse({ columns: true, skip_empty_lines: true }))
                .on('data', (data) => results.push(data))
                .on('end', () => resolve(results))
                .on('error', reject);
        });
    } catch (error) {
        console.error('Error reading alerts:', error);
        return [];
    }
}

// Update statistics
async function updateStats() {
    const alerts = await readAlertsFromCSV();
    latestAlerts = alerts.slice(-50); // Keep last 50 alerts
    
    if (alerts.length > 0) {
        const alertTypes = {};
        alerts.forEach(alert => {
            const type = alert.alert_type || 'Unknown';
            alertTypes[type] = (alertTypes[type] || 0) + 1;
        });

        // Calculate recent threats (last 5 minutes)
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const recentAlerts = alerts.filter(alert => {
            const alertTime = new Date(alert.timestamp);
            return alertTime > fiveMinutesAgo;
        });

        stats = {
            total_packets: Math.floor(Math.random() * 100000) + alerts.length * 100,
            total_alerts: alerts.length,
            active_threats: recentAlerts.length,
            last_update: new Date().toISOString(),
            alert_types: alertTypes
        };
    }
}

// Background update loop
setInterval(updateStats, 2000);

// API Routes

// Get alerts and stats
app.get('/api/alerts', async (req, res) => {
    try {
        await updateStats();
        res.json({
            alerts: latestAlerts,
            stats: stats
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch alerts' });
    }
});

// Get detailed statistics
app.get('/api/statistics', async (req, res) => {
    try {
        const alerts = await readAlertsFromCSV();
        
        if (alerts.length === 0) {
            return res.json({
                total_alerts: 0,
                alert_types: {},
                top_sources: {},
                top_destinations: {},
                timeline: {},
                last_update: new Date().toISOString()
            });
        }

        // Calculate detailed statistics
        const alertTypes = {};
        const sourceIPs = {};
        const destinationIPs = {};
        const timeline = {};

        alerts.forEach(alert => {
            // Alert types
            const type = alert.alert_type || 'Unknown';
            alertTypes[type] = (alertTypes[type] || 0) + 1;

            // Source IPs
            const src = alert.source_ip || 'Unknown';
            sourceIPs[src] = (sourceIPs[src] || 0) + 1;

            // Destination IPs
            const dst = alert.destination_ip || 'Unknown';
            destinationIPs[dst] = (destinationIPs[dst] || 0) + 1;

            // Timeline (last hour)
            try {
                const alertTime = new Date(alert.timestamp);
                const now = new Date();
                if (now - alertTime < 60 * 60 * 1000) { // Last hour
                    const minuteKey = alertTime.toLocaleTimeString('en-US', { 
                        hour12: false, 
                        hour: '2-digit', 
                        minute: '2-digit' 
                    });
                    timeline[minuteKey] = (timeline[minuteKey] || 0) + 1;
                }
            } catch (error) {
                // Skip invalid timestamps
            }
        });

        // Sort and limit results
        const sortedSources = Object.entries(sourceIPs)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});

        const sortedDestinations = Object.entries(destinationIPs)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});

        res.json({
            total_alerts: alerts.length,
            alert_types: alertTypes,
            top_sources: sortedSources,
            top_destinations: sortedDestinations,
            timeline: timeline,
            last_update: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

// Start attack simulation
app.post('/api/simulate-attack', async (req, res) => {
    try {
        if (simulationRunning) {
            return res.status(400).json({ error: 'Simulation already running' });
        }

        const { duration = 30, intensity = 'medium' } = req.body;
        
        simulationRunning = true;
        
        // Start simulation in background
        const simulator = spawn('python', ['simulate_attacks.py', '--duration', duration.toString(), '--intensity', intensity]);
        
        simulator.on('close', (code) => {
            simulationRunning = false;
            console.log(`Simulation finished with code ${code}`);
        });

        simulator.on('error', (error) => {
            simulationRunning = false;
            console.error('Simulation error:', error);
        });

        res.json({ 
            success: true, 
            message: `Attack simulation started for ${duration} seconds at ${intensity} intensity`,
            duration,
            intensity
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to start simulation' });
    }
});

// Stop attack simulation
app.post('/api/stop-simulation', async (req, res) => {
    try {
        // Kill all Python processes (simulation)
        spawn('taskkill', ['/F', '/IM', 'python.exe']);
        simulationRunning = false;
        
        res.json({ success: true, message: 'Simulation stopped' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to stop simulation' });
    }
});

// Start IDS monitoring
app.post('/api/start-ids', async (req, res) => {
    try {
        if (idsRunning) {
            return res.status(400).json({ error: 'IDS already running' });
        }

        const { interface: networkInterface } = req.body;
        
        idsRunning = true;
        
        // Start IDS in background
        const idsProcess = spawn('python', ['src/main.py'], {
            stdio: 'pipe'
        });
        
        idsProcess.on('close', (code) => {
            idsRunning = false;
            console.log(`IDS finished with code ${code}`);
        });

        idsProcess.on('error', (error) => {
            idsRunning = false;
            console.error('IDS error:', error);
        });

        res.json({ 
            success: true, 
            message: `IDS monitoring started on interface ${networkInterface || 'auto-detect'}` 
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to start IDS' });
    }
});

// Stop IDS monitoring
app.post('/api/stop-ids', async (req, res) => {
    try {
        // Kill all Python processes (IDS)
        spawn('taskkill', ['/F', '/IM', 'python.exe']);
        idsRunning = false;
        
        res.json({ success: true, message: 'IDS monitoring stopped' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to stop IDS' });
    }
});

// Clear alerts
app.post('/api/clear-alerts', async (req, res) => {
    try {
        // Backup current alerts
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFile = path.join('logs', `intrusion_alerts_backup_${timestamp}.csv`);
        
        try {
            const existingData = await fs.readFile(ALERT_FILE);
            await fs.writeFile(backupFile, existingData);
        } catch (error) {
            // File might not exist, that's okay
        }

        // Create new empty CSV with headers
        await ensureLogsDir();
        await fs.writeFile(ALERT_FILE, 'timestamp,alert_type,source_ip,destination_ip,description,severity\n');
        
        // Reset local data
        latestAlerts = [];
        stats.total_alerts = 0;
        stats.active_threats = 0;
        
        res.json({ success: true, message: 'Alerts cleared successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to clear alerts' });
    }
});

// Get system status
app.get('/api/status', (req, res) => {
    res.json({
        simulation_running: simulationRunning,
        ids_running: idsRunning,
        server_time: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Export alerts
app.get('/api/export-alerts', async (req, res) => {
    try {
        const alerts = await readAlertsFromCSV();
        
        // Convert to CSV format
        const csvHeader = 'timestamp,alert_type,source_ip,destination_ip,description,severity\n';
        const csvData = alerts.map(alert => 
            `${alert.timestamp},${alert.alert_type},${alert.source_ip},${alert.destination_ip},"${alert.description}",${alert.severity}`
        ).join('\n');
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="ids_alerts_${new Date().toISOString().split('T')[0]}.csv"`);
        res.send(csvHeader + csvData);
    } catch (error) {
        res.status(500).json({ error: 'Failed to export alerts' });
    }
});

// Serve React static files in production
if (process.env.NODE_ENV === 'production') {
    const oneYear = 31536000000;
    app.use(express.static(path.join(__dirname, 'frontend/build'), {
        maxAge: oneYear,
        immutable: true
    }));
    
    let indexCache = null;
    app.use(async (req, res) => {
        try {
            if (indexCache) {
                 return res.send(indexCache);
            }
            let htmlData = await fs.readFile(path.join(__dirname, 'frontend/build', 'index.html'), 'utf8');
            const cssMatch = htmlData.match(/<link href="(\/static\/css\/main\.[^"]+\.css)" rel="stylesheet">/);
            if (cssMatch) {
                const cssPath = path.join(__dirname, 'frontend/build', cssMatch[1]);
                const cssContent = await fs.readFile(cssPath, 'utf8');
                htmlData = htmlData.replace(cssMatch[0], `<style>${cssContent}</style>`);
            }
            indexCache = htmlData;
            res.send(htmlData);
        } catch (e) {
            console.error('Error generating cached HTML:', e);
            res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
        }
    });
}

// Start server
async function startServer() {
    await ensureLogsDir();
    
    app.listen(PORT, () => {
        console.log(`\n=== Network IDS API Server ===`);
        console.log(`Server running on: http://localhost:${PORT}`);
        console.log(`React Dashboard: http://localhost:3000`);
        console.log(`API Documentation: http://localhost:${PORT}/api/status`);
        console.log(`\n=== Features ===`);
        console.log(`Real-time alerts and statistics`);
        console.log(`Attack simulation controls`);
        console.log(`IDS monitoring management`);
        console.log(`Alert export functionality`);
        console.log(`\n=== Ready ===`);
    });
}

startServer().catch(console.error);
