# Quick Reference Card

## 📋 File Structure
```
Network-Intrusion-Monitoring-Tool/
├── src/main.py              ← Run this: python src/main.py
├── src/capture.py           ← Packet sniffing
├── src/analyzer.py          ← Packet parsing  
├── src/detector.py          ← Detection logic
├── src/logger.py            ← Alert logging
├── requirements.txt         ← Dependencies
├── README.md                ← Full documentation
├── SETUP.md                 ← Platform-specific setup
├── FEATURES_DEMO.md         ← Interview demo guide
├── IMPROVEMENTS.md          ← What was fixed
└── visualize.py             ← Optional charts
```

---

## 🚀 Quick Start

### Linux/macOS
```bash
pip install -r requirements.txt
sudo python3 src/main.py
```

### Windows (Admin)
```bash
pip install -r requirements.txt
python src/main.py
```

---

## 🎯 Command Examples

```bash
# Default settings
sudo python3 src/main.py

# Specify interface
sudo python3 src/main.py -i eth0

# Custom thresholds
sudo python3 src/main.py -t 100 -p 20

# Custom log file
sudo python3 src/main.py -l my_alerts.csv

# Show help
python3 src/main.py --help
```

---

## 📊 Output Format

### Normal Traffic
```
[INFO] SRC: 192.168.1.100:54321 → DST: 8.8.8.8:443 | TCP
```

### Alerts
```
[ALERT] Port Scan
  SRC: 192.168.1.50 → DST: 192.168.1.1:22
  Description: Connection attempts to 18 ports
```

---

## 🔍 Monitoring

### Three Detection Types
1. **SYN Flood** - Rapid SYN packets from one IP (threshold: 50)
2. **Port Scan** - Many ports from one source (threshold: 15)
3. **Traffic Spike** - Burst of packets (threshold: 100)

All configurable via `-t`, `-p`, `--traffic-threshold`

---

## 📁 Log Files

```
logs/
├── intrusion_alerts.csv   ← All alerts (CSV format)
└── ids.log                ← System events
```

---

## 🛠️ Module Breakdown

| Module | Purpose |
|--------|---------|
| `main.py` | Entry point, CLI args, orchestration |
| `capture.py` | Packet sniffing wrapper |
| `analyzer.py` | Extract IP, port, protocol |
| `detector.py` | Detection rules and thresholds |
| `logger.py` | Alert logging to CSV and console |

---

## 📈 Visualization (Optional)

```bash
pip install matplotlib pandas
python visualize.py -o ./graphs/
```

Creates: `timeline.png`, `types.png`, `top_sources.png`

---

## ⚙️ Key Configuration

| Parameter | Default | Use Case |
|-----------|---------|----------|
| `-t` (SYN) | 50 | Lower = more sensitive |
| `-p` (Port) | 15 | Lower = catch lighter scans |
| `--traffic` | 100 | Lower = more alerts |
| `-i` (Interface) | Auto | Manual interface selection |
| `-l` (Log) | intrusion_alerts.csv | Custom output file |

---

## 🐛 Troubleshooting

| Issue | Fix |
|-------|-----|
| Permission denied | Use `sudo` (Linux) or Admin (Windows) |
| No packets | Specify interface: `-i eth0` |
| High memory | Restart IDS (auto-cleans) |
| Import error | `pip install -r requirements.txt` |

---

## 💡 For Recruiters

**Key Points to Mention:**
- ✅ Modular architecture (5 clean modules)
- ✅ Professional error handling
- ✅ Configurable detection thresholds
- ✅ CSV-based alert logging
- ✅ Real-time packet analysis
- ✅ Cross-platform (Linux/macOS/Windows)
- ✅ Clean CLI with help menu
- ✅ Optional visualization tool

**This demonstrates:**
- Systems thinking
- Code organization
- Cybersecurity knowledge
- Python proficiency
- Professional practices

---

## 📞 Common Commands

```bash
# See available interfaces
python3 -c "from scapy.all import get_if_list; print(get_if_list())"

# Generate test traffic (other terminal)
ping google.com
curl https://example.com

# Check alerts
cat logs/intrusion_alerts.csv

# Read system log
tail -f logs/ids.log

# Stop monitoring
Ctrl + C

# Show help
python3 src/main.py -h
```

---

**Version:** 1.0.0 | **Python:** 3.7+ | **Platform:** Linux, macOS, Windows
