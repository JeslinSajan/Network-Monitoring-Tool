# Network Intrusion Detection System

## Overview
This project implements a Network Intrusion Detection System (NIDS) that monitors network traffic for suspicious patterns and potential attacks.

## Features
- **SYN Flood Detection**: Monitors for excessive SYN packets from a single IP.
- **ICMP Flood Detection**: Alerts on high rates of ICMP packets.
- **ARP Spoofing Detection**: Detects ARP spoofing attempts.
- **Port Scanning Detection**: Identifies multiple connection attempts to different ports.
- **Configurable Thresholds**: Load thresholds from a configuration file.
- **Logging**: Logs alerts to a CSV file and console.
- **Unit Tests**: Includes unit tests for critical functionalities.

## Installation
1. Clone the repository.
2. Install the required dependencies listed in `requirements.txt`.
3. Configure the `config.ini` file as needed.

## Usage
Run the IDS using the command:
```bash
python ids.py -i <interface>
```

## Testing
Run unit tests using:
```bash
python -m unittest test_ids.py
```

## Future Work
- Implement additional detection methods (e.g., UDP flood detection).
- Enhance visualizations for alerts and traffic patterns. (IDS)

A lightweight, modular Python-based network intrusion detection system that monitors live network traffic, analyzes packet patterns, and detects suspicious activities in real-time.

## 🎯 Features

- **Real-time Packet Capture**: Sniffs packets from a specified network interface using Scapy
- **SYN Flood Detection**: Identifies excessive SYN packets from a single source
- **Port Scan Detection**: Detects connection attempts to multiple ports
- **Traffic Spike Detection**: Identifies abnormal traffic patterns
- **CSV Alert Logging**: Stores all detected anomalies with timestamps
- **Colored Console Output**: Clean, professional formatted alerts
- **Modular Architecture**: Clean separation of concerns (capture, analysis, detection, logging)
- **Configurable Thresholds**: Adjust detection sensitivity via command-line arguments

## 📋 Project Structure

```
Network-Intrusion-Monitoring-Tool/
├── src/
│   ├── main.py              # Entry point and main IDS orchestrator
│   ├── capture.py           # Packet capture module using Scapy
│   ├── analyzer.py          # Packet parsing and field extraction
│   ├── detector.py          # Intrusion detection logic and rules
│   └── logger.py            # Logging system for alerts and events
├── logs/                    # Generated at runtime (alerts and logs)
├── requirements.txt         # Python dependencies
├── config.ini              # Configuration file (optional)
└── README.md               # This file
```

## 🔧 Setup Instructions

### Prerequisites

- **Python 3.7+**
- **Administrator/sudo privileges** (required for packet capture)
- Linux, Windows, or macOS with network access

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd Network-Intrusion-Monitoring-Tool
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Verify installation:**
   ```bash
   python -c "import scapy; print('Scapy version:', scapy.__version__)"
   ```

### Running the IDS

#### Basic Usage (Auto-detect network interface)

**Linux/macOS:**
```bash
sudo python3 src/main.py
```

**Windows (Run as Administrator):**
```bash
python src/main.py
```

#### Specify Network Interface

**Linux/macOS:**
```bash
sudo python3 src/main.py -i eth0
```

**Windows:**
```bash
python src/main.py -i Ethernet
```

To list available interfaces:

**Linux:**
```bash
ip link show
# or
sudo python3 -c "from scapy.all import get_if_list; print(get_if_list())"
```

**Windows:**
```bash
python -c "from scapy.all import get_if_list; print(get_if_list())"
```

#### Advanced Options

```bash
# Custom SYN flood threshold (default: 50)
sudo python3 src/main.py -i eth0 -t 100

# Custom port scan threshold (default: 15)
sudo python3 src/main.py -i eth0 -p 20

# Custom traffic spike threshold (default: 100)
sudo python3 src/main.py --traffic-threshold 200

# Custom alert log file
sudo python3 src/main.py -l my_alerts.csv
```

**Complete help:**
```bash
python src/main.py -h
```

## 📊 Output Examples

### Normal Packet Logging
```
[INFO] SRC: 192.168.1.100 → DST: 8.8.8.8 | TCP 443
[INFO] SRC: 192.168.1.100 → DST: 8.8.8.8 | TCP 80
```

### Alert Format
```
[ALERT] SYN Flood
  SRC: 192.168.1.50 → DST: 192.168.1.1:80
  Description: Excessive SYN packets (65) in 10s window

[ALERT] Port Scan
  SRC: 192.168.1.50 → DST: 192.168.1.1:22
  Description: Connection attempts to 18 ports: 22, 23, 25, 53, 80...
```

### Session Statistics
```
============================================================
[*] IDS Monitoring Stopped
============================================================
Statistics:
  Total packets analyzed: 25847
  Total alerts generated: 3
  Tracked suspicious IPs (SYN): 2
  Tracked suspicious IPs (Traffic): 1
  Active port scan attempts: 0
Alert log saved to: logs/intrusion_alerts.csv
System log saved to: logs/ids.log
```

## 📁 Log Files

Logs are automatically created in the `logs/` directory:

- **`intrusion_alerts.csv`**: All detected intrusions with:
  - Timestamp
  - Alert type (SYN Flood, Port Scan, Traffic Spike)
  - Source IP and port
  - Destination IP and port
  - Description

- **`ids.log`**: System events and debug information

## 🔍 Detection Rules

### 1. SYN Flood Detection
- **Trigger**: > 50 SYN packets from same IP within 10 seconds (default)
- **Use Case**: Identifies DoS attacks targeting open ports
- **Example**: `syn -t 100` for stricter detection

### 2. Port Scan Detection
- **Trigger**: Connection attempts to > 15 different ports from same IP (default)
- **Use Case**: Identifies reconnaissance activity
- **Customizable**: `-p` flag

### 3. Traffic Spike Detection
- **Trigger**: > 100 packets from same IP within 10 seconds (default)
- **Use Case**: Identifies unusual traffic patterns
- **Customizable**: `--traffic-threshold` flag

## 🛠️ Troubleshooting

### "Permission denied" Error

**Linux/macOS:**
```bash
# Use sudo
sudo python3 src/main.py
```

**Windows:**
1. Right-click Command Prompt/PowerShell
2. Select "Run as Administrator"
3. Then run: `python src/main.py`

### No packets captured

- Verify network interface is up: `ip link show` or `ipconfig`
- Try specifying the interface: `sudo python3 src/main.py -i eth0`
- Ensure not all traffic is filtered; check local traffic first

### High memory usage

- The system cleans up old entries automatically
- To reset: Stop (Ctrl+C) and restart the IDS
- Reduce time window if needed (modify `detector.py`)

## 🔐 Security Notes

- This is a **prototype-level** IDS for learning/testing
- For production use, consider:
  - Suricata or Zeek (enterprise-grade IDS)
  - Machine learning-based detection
  - Integration with SIEM systems
  - Alerting via Slack/email

## 📷 ScreenShots
<img width="1080" height="1166" alt="Screenshot_20260417_185506" src="https://github.com/user-attachments/assets/e005e2b7-7153-4f02-b69c-8362442acaba" />

<img width="1080" height="1242" alt="Screenshot_20260417_1855068" src="https://github.com/user-attachments/assets/374c8029-78f1-4fb2-b212-7eec6cc11419" />


## 📦 Code Quality

- **Modular Design**: Separation of concerns (capture, analysis, detection, logging)
- **Error Handling**: Try/except blocks throughout with proper logging
- **Type Hints**: Clear parameter and return types
- **Documentation**: Docstrings for all functions
- **Clean Output**: Formatted console messages with colors

## 🚀 Future Enhancements

- [ ] Machine learning-based anomaly detection
- [ ] PCAP file export for detected events
- [ ] Email/Slack alerting
- [ ] Web dashboard for visualization
- [ ] Integration with external threat feeds
- [ ] Database storage (SQLite/PostgreSQL)
- [ ] IPv6 support
- [ ] GeoIP IP blocking

## 📝 License

This project is provided as-is for educational and research purposes.

## 👨‍💻 Author

Developed as a Aspiring Networking Engineer tool prototype for network security analysis.

---

**Questions or Issues?** Check the code comments or modify thresholds in `main.py` command-line arguments.

