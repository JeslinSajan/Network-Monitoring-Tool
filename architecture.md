# Network Intrusion Detection System (NIDS) - Architecture & Technical Specification

## 1. Complete File & Directory Structure

```text
Network-Intrusion-Monitoring-Tool/
|-- api-server.js                # Serves REST API endpoints, manages Python daemons, and hosts the production React frontend.
|-- simulate_attacks.py          # Generates synthetic attack traffic schemas directly into the CSV log for stress testing.
|-- package.json                 # Defines Node.js backend dependencies and server initialization scripts.
|-- README.md                    # High-level project overview and fundamental setup instructions.
|-- src/                         # Core Python IDS backend module directory.
|   |-- main.py                  # Primary executable orchestrating packet capture, analysis loops, and graceful degradation.
|   |-- capture.py               # Interfaces with network sockets to sniff local raw packets at Layer 2/3.
|   |-- analyzer.py              # Parses raw network bytes into readable TCP/IP/UDP payloads and extracts metadata.
|   |-- detector.py              # Analyzes parsed packet metadata against threat signatures like SYN floods and port scans.
|   |-- logger.py                # Persists identified threats and system throughput events to local flat files.
|-- logs/                        # Persistent storage directory for all runtime analytics.
|   |-- ids.log                  # Rolling system log recording backend daemon operations and application exceptions.
|   |-- intrusion_alerts.csv     # Comma-separated flat database storing normalized threat detection anomalies.
|-- frontend/                    # Directory containing the standalone React-based client dashboard.
    |-- package.json             # Defines frontend dependencies (React, craco, Tailwind) and compilation setups.
    |-- tailwind.config.js       # Configuration file dictating TailwindCSS utility class generation.
    |-- public/                  # Uncompiled static assets including the main HTML shell and locally hosted WOFF2 web fonts.
    |-- src/                     # React application functional source code.
        |-- App.tsx              # Main layout coordinating API polling intervals, state lifting, and Suspense boundaries.
        |-- index.css            # Global stylesheet invoking custom local fonts and foundational CSS variables.
        |-- services/api.ts      # Axios/Fetch utility wrappers querying the Express backend endpoints.
        |-- components/          # Independently reusable internal UI modules.
            |-- AlertFeed.tsx    # Renders the real-time chronological stream of parsed CSV alert data.
            |-- ControlPanel.tsx # Dispatches asynchronous start/stop/clear commands to the Python daemons via the API.
            |-- MetricsRow.tsx   # Displays high-level statistical numeric overlays (e.g., bandwidth, dropped packets).
            |-- ProtocolBreakdown.tsx # Extrapolates canvas/charts lazily to display parsed network protocol distribution.
            |-- ThreatMap.tsx    # Visually plots simulated geolocation heatmaps derived from parsed IP address hashes.
```

## 2. Technical Specification & Stack

### Frontend Client
* **Language:** TypeScript ([.tsx](file:///c:/Users/jesli/Network-Intrusion-Monitoring-Tool-/frontend/src/App.tsx)) / HTML5
* **Framework:** React 18 (Hooks-based architecture)
* **Styling:** TailwindCSS alongside Vanilla CSS injections.
* **Build System:** Create React App (`react-scripts`) and Webpack.

### Backend Orchestrator (API Wrapper)
* **Language:** JavaScript (Node.js)
* **Framework:** Express.js 5.0 
* **CSV Parsing:** `csv-parse` (Streaming parser handling real-time file system reads).
* **Process Management:** Native Node `child_process.spawn` (Responsible for launching, piping `stdio`, and terminating Python execution trees).

### Intrusion Detection Core (Analysis Engine)
* **Language:** Python 3.x
* **Core Network Library:** **Scapy** (Provides advanced packet sniffing, header decoding, and traffic injection).
* **Logging/CLI:** Native [csv](file:///c:/Users/jesli/Network-Intrusion-Monitoring-Tool-/test_export.csv), `pathlib`, and `colorama`.
* **Underlying Requirements:** To natively capture packets at Layer 2 on Windows, Scapy delegates capture parameters to the underlying **Npcap / WinPcap** NDIS drivers.

## 3. System Architecture & Data Flow

The lifecycle of a captured anomalous packet operates on an asynchronous producer-consumer paradigm completely decoupled via disk storage:

1. **Capture (Producer):** 
   The Python daemon ([src/main.py](file:///C:/Users/jesli/Network-Intrusion-Monitoring-Tool-/src/main.py)) executes and delegates socket binding to [src/capture.py](file:///C:/Users/jesli/Network-Intrusion-Monitoring-Tool-/src/capture.py). Relying on Scapy's [sniff()](file:///C:/Users/jesli/Network-Intrusion-Monitoring-Tool-/src/capture.py#103-106), it opens a raw Layer 2 socket bound to the designated NIC.
2. **Analysis:** 
   Captured frames enter the process loop and are piped synchronously into [analyzer.py](file:///C:/Users/jesli/Network-Intrusion-Monitoring-Tool-/src/analyzer.py), which strips and validates the frame headers sequentially (`Ethernet -> IPv4/6 -> TCP/UDP/ICMP`).
3. **Detection:** 
   The [detector.py](file:///C:/Users/jesli/Network-Intrusion-Monitoring-Tool-/src/detector.py) module evaluates the extracted tuple arrays (Source IPs, Destination Ports, and TCP Flags) evaluated over a sliding relative time-window (e.g. 10s intervals). It flags sudden deviations representing SYN floods (rapid sequence of SYN flags lacking ACKs) or continuous port scans.
4. **Serialization:** 
   Validated abnormalities are dispatched to [logger.py](file:///C:/Users/jesli/Network-Intrusion-Monitoring-Tool-/src/logger.py), which synchronously flushes the schema into the central flat-file database ([logs/intrusion_alerts.csv](file:///C:/Users/jesli/Network-Intrusion-Monitoring-Tool-/logs/intrusion_alerts.csv)).
5. **Consumption (Consumer):** 
   Totally asynchronously, the Node.js Express server ([api-server.js](file:///C:/Users/jesli/Network-Intrusion-Monitoring-Tool-/api-server.js)) absorbs HTTP requests on `/api/alerts`. When queried, it establishes an `fs.createReadStream()` stream on the CSV file, parsing the raw textual columns into formatted JSON dictionaries via `csv-parse({ columns: true })`.
6. **Presentation:** 
   The React Client ([App.tsx](file:///c:/Users/jesli/Network-Intrusion-Monitoring-Tool-/frontend/src/App.tsx)) infinitely polls the REST API (2000ms intervals), absorbs the JSON block, updates its local Virtual DOM state tree, and pushes the modified object down to memoized UI widgets (like [ThreatMap](file:///c:/Users/jesli/Network-Intrusion-Monitoring-Tool-/frontend/src/components/ThreatMap.tsx#4-7) and [AlertFeed](file:///c:/Users/jesli/Network-Intrusion-Monitoring-Tool-/frontend/src/components/AlertFeed.tsx#4-7)) causing discrete screen renders.

## 4. Execution Procedures

Copy and paste the following commands to initialize, build, and execute the full system deployment. 

### A. Environment Intialization (Optional)
```bash
# Create a .env file in your root folder with basic variables
cat << 'EOF' > .env
NODE_ENV=production
PORT=5001
EOF
```

### B. Dependency Installation
```bash
# 1. Install primary API dependencies
npm install

# 2. Install React frontend dependencies
cd frontend
npm install
cd ..

# 3. Install Python packet sniffing dependencies
pip install scapy colorama
```

### C. Execution Commands
```bash
# 1. Compile the production frontend code chunks
cd frontend
npm run build
cd ..

# 2. Launch the Application Platform
# Note: This command starts the Web Backend on PORT 5001. 
# Because NODE_ENV=production is declared, it will automatically serve the React frontend at http://localhost:5001.
$env:NODE_ENV="production"; node api-server.js
```

### D. Elevated Privileges Caution
While the web server executes without specific privileges, the underlying Packet capture tool (`Scapy`) **fundamentally requires Administrative control** to access raw network bounds. 

Therefore, to legitimately trigger Python network capture via the UI click without permission-denied crashes, the terminal launching the Node daemon must be granted system escalations.

**Windows PowerShell:**  
*Right-click PowerShell -> Run as Administrator -> Launch `node api-server.js`.*

**Linux / macOS:**  
*Launch using `sudo node api-server.js`.*
