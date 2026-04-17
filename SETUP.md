# Quick Start Guide - Network IDS

## 🚀 Get Running in 5 Minutes

### Step 1: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 2: Run the IDS

**Linux/macOS:**
```bash
sudo python3 src/main.py
```

**Windows (Admin):**
```bash
python src/main.py
```

### Step 3: Stop Monitoring
Press `Ctrl+C` to stop. Alerts are saved automatically.

---

## 💻 Platform-Specific Instructions

### Ubuntu/Debian Linux

```bash
# Install Scapy requirements
sudo apt-get update
sudo apt-get install -y python3 python3-pip python3-dev libpcap-dev

# Install Python dependencies
pip3 install -r requirements.txt

# Run with sudo
sudo python3 src/main.py -i <interface>

# Find your interface
ip link show
# or
python3 -c "from scapy.all import get_if_list; print(get_if_list())"
```

### macOS

```bash
# Using Homebrew
brew install python3

# Install dependencies
pip3 install -r requirements.txt

# Run with sudo (macOS requires sudo for packet capture)
sudo python3 src/main.py -i <interface>

# Find interface
ifconfig
# or
python3 -c "from scapy.all import get_if_list; print(get_if_list())"
```

### Windows 10/11

1. **Open PowerShell as Administrator**
   - Right-click PowerShell → "Run as Administrator"

2. **Install Python (if needed)**
   - Download from python.org or use: `winget install Python.Python.3.11`

3. **Install dependencies**
   ```powershell
   pip install -r requirements.txt
   ```

4. **Get your network adapter name**
   ```powershell
   python -c "from scapy.all import get_if_list; print(get_if_list())"
   ```
   Typical names: `Ethernet`, `WiFi`, `Local Area Connection`

5. **Run the IDS**
   ```powershell
   python src/main.py -i Ethernet
   ```

---

## 🎯 Common Use Cases

### Monitor Local Network (Default Interface)
```bash
sudo python3 src/main.py
```

### Monitor Specific Interface with Custom Thresholds
```bash
sudo python3 src/main.py -i eth0 -t 100 -p 20
```
- `-i eth0`: Monitor eth0
- `-t 100`: SYN flood threshold (aggressive detection)
- `-p 20`: Port scan threshold

### Save Alerts to Custom File
```bash
sudo python3 src/main.py -l my_security_alerts.csv
```

### Detect Aggressive Port Scans
```bash
sudo python3 src/main.py -p 5  # Trigger at 5 different ports
```

### High Sensitivity (Catch Everything)
```bash
sudo python3 src/main.py -t 30 -p 10 --traffic-threshold 50
```

---

## 📊 Reading Alert Logs

After running the IDS and creating alerts, check the CSV file:

```bash
cat logs/intrusion_alerts.csv
```

**CSV Format:**
```
timestamp,alert_type,source_ip,source_port,destination_ip,destination_port,description
2024-01-15 10:34:21,SYN Flood,192.168.1.50,,192.168.1.1,80,Excessive SYN packets (65) in 10s window
2024-01-15 10:34:45,Port Scan,192.168.1.50,12345,192.168.1.1,22,Connection attempts to 18 ports: 22, 23, 25...
```

---

## 🐛 Troubleshooting

### Error: "No module named 'scapy'"
```bash
pip install scapy>=2.5.0
```

### Error: "Permission denied" (Linux/Mac)
```bash
# Use sudo
sudo python3 src/main.py

# OR allow python to capture packets without sudo (one-time setup)
sudo setcap cap_net_raw=ep /usr/bin/python3
```

### Error: "Adapter not found"
```bash
# List available adapters
python3 -c "from scapy.all import get_if_list; print('\n'.join(get_if_list()))"

# Use the adapter name
sudo python3 src/main.py -i <adapter_name>
```

### No packets captured
- Remote network: Use your gateway IP
- Virtual machine: Use correct vNIC name
- Firewall blocking: Temporarily disable or run as admin

### High CPU/Memory Usage
- Reduce thresholds: `-t 100 -p 30`
- Specify interface instead of sniffing all: `-i eth0`
- Filter specific traffic in code (modify `detector.py`)

---

## 🧪 Testing the IDS

### Simulate SYN Flood (Requires hping3 or similar)
```bash
# On another machine or interface
hping3 -S --flood -p 80 <target_ip>
```

### Create Port Scan Traffic
```bash
# Using nmap (on another machine)
nmap -p 1-1000 <target_ip>
```

### Monitor Local Machine Traffic
```bash
# Generate traffic (on same machine in another terminal)
curl http://example.com
```

---

## 📝 Output Explanation

### OK Traffic
```
[INFO] SRC: 192.168.1.100:54321 → DST: 8.8.8.8:443 | TCP
```

### ALERT: SYN Flood
```
[ALERT] SYN Flood
  SRC: 192.168.1.50 → DST: 192.168.1.1:80
  Description: Excessive SYN packets (102) in 10s window
```

### ALERT: Port Scan
```
[ALERT] Port Scan
  SRC: 192.168.1.50 → DST: 192.168.1.1:22
  Description: Connection attempts to 25 ports: 22, 23, 25, 53, 80...
```

---

## 💡 Tips for Recruiters

When demonstrating this project:

1. **Show the modular code structure** - Five clean modules with single responsibilities
2. **Point to error handling** - Try/except blocks throughout
3. **Explain detection logic** - Rules are simple but effective
4. **Demo live capture** - Run with `-i <interface>` to show real packets
5. **Show alert logs** - CSV output with structured data
6. **Mention scalability** - Could add ML or integrate with SIEM

---

**Need help?** Check main.py or individual module docstrings for detailed explanations.
