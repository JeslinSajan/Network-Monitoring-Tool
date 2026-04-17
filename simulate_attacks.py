#!/usr/bin/env python3
"""
Network Attack Simulator for IDS Testing

This script simulates various types of network attacks to test the Network IDS.
It generates realistic network traffic patterns including:
- SYN flood attacks
- Port scanning
- Traffic spikes
- Various alert types

Usage:
    python simulate_attacks.py [--duration 60] [--intensity medium]
"""

import argparse
import csv
import random
import time
from datetime import datetime, timedelta
from pathlib import Path
import ipaddress
import threading

class NetworkAttackSimulator:
    def __init__(self, log_file='logs/intrusion_alerts.csv', duration=60, intensity='medium'):
        self.log_file = log_file
        self.duration = duration
        self.intensity = intensity
        self.running = False
        
        # Attack parameters based on intensity
        self.intensity_params = {
            'low': {'syn_rate': 5, 'port_scan_rate': 2, 'traffic_spike_rate': 1},
            'medium': {'syn_rate': 15, 'port_scan_rate': 5, 'traffic_spike_rate': 3},
            'high': {'syn_rate': 30, 'port_scan_rate': 10, 'traffic_spike_rate': 5}
        }
        
        # Sample IP addresses
        self.source_ips = [
            '192.168.1.100', '10.0.0.50', '172.16.0.25', '203.0.113.10',
            '198.51.100.20', '192.0.2.30', '10.1.1.100', '172.20.0.50'
        ]
        
        self.target_ips = [
            '192.168.1.1', '10.0.0.1', '172.16.0.1', '192.168.1.10',
            '10.0.0.100', '172.16.0.100', '192.168.1.50'
        ]
        
        self.common_ports = [22, 23, 25, 53, 80, 110, 143, 443, 993, 995, 3389, 5432, 3306]
        
        # Alert types
        self.alert_types = [
            'SYN_FLOOD', 'PORT_SCAN', 'TRAFFIC_SPIKE', 'SUSPICIOUS_PACKET',
            'BRUTE_FORCE', 'DDOS_ATTEMPT', 'MALWARE_TRAFFIC', 'DATA_EXFILTRATION'
        ]
        
        self.descriptions = {
            'SYN_FLOOD': [
                'Multiple SYN packets detected from single source',
                'Possible SYN flood attack detected',
                'High volume of SYN requests observed',
                'TCP connection flooding attempt detected'
            ],
            'PORT_SCAN': [
                'Sequential port scanning activity detected',
                'Port reconnaissance attempt identified',
                'Multiple port access attempts from single source',
                'Network enumeration activity detected'
            ],
            'TRAFFIC_SPIKE': [
                'Unusual traffic volume detected',
                'Traffic anomaly observed',
                'Network bandwidth spike detected',
                'Abnormal traffic patterns identified'
            ],
            'SUSPICIOUS_PACKET': [
                'Malformed packet detected',
                'Unusual packet characteristics observed',
                'Protocol violation detected',
                'Suspicious packet structure identified'
            ],
            'BRUTE_FORCE': [
                'Multiple authentication attempts detected',
                'Possible brute force attack in progress',
                'Repeated login failures observed',
                'Credential stuffing attempt detected'
            ],
            'DDOS_ATTEMPT': [
                'Distributed attack pattern detected',
                'Multiple sources targeting single host',
                'Coordinated attack activity observed',
                'DDoS attack signature identified'
            ],
            'MALWARE_TRAFFIC': [
                'Known malware communication detected',
                'Suspicious C2 traffic observed',
                'Malware beaconing activity identified',
                'Malicious network traffic pattern'
            ],
            'DATA_EXFILTRATION': [
                'Large data transfer to external IP',
                'Unusual outbound traffic detected',
                'Possible data exfiltration attempt',
                'Suspicious data transfer patterns'
            ]
        }

    def setup_log_file(self):
        """Create the log file with headers if it doesn't exist."""
        Path('logs').mkdir(exist_ok=True)
        
        if not Path(self.log_file).exists():
            with open(self.log_file, 'w', newline='', encoding='utf-8') as f:
                writer = csv.writer(f)
                writer.writerow(['timestamp', 'alert_type', 'source_ip', 'destination_ip', 'description', 'severity'])

    def log_alert(self, alert_type, source_ip, destination_ip, description, severity='medium'):
        """Log an alert to the CSV file."""
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        with open(self.log_file, 'a', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow([timestamp, alert_type, source_ip, destination_ip, description, severity])

    def simulate_syn_flood(self):
        """Simulate SYN flood attacks."""
        params = self.intensity_params[self.intensity]
        
        while self.running:
            # Generate multiple SYN packets from same source
            source_ip = random.choice(self.source_ips)
            target_ip = random.choice(self.target_ips)
            packet_count = random.randint(params['syn_rate'], params['syn_rate'] * 3)
            
            for i in range(packet_count):
                if not self.running:
                    break
                    
                description = random.choice(self.descriptions['SYN_FLOOD'])
                severity = 'high' if packet_count > 20 else 'medium'
                
                self.log_alert('SYN_FLOOD', source_ip, target_ip, description, severity)
                
                if i % 5 == 0:  # Small delay between packets
                    time.sleep(0.1)
            
            time.sleep(random.uniform(2, 5))

    def simulate_port_scan(self):
        """Simulate port scanning attacks."""
        params = self.intensity_params[self.intensity]
        
        while self.running:
            source_ip = random.choice(self.source_ips)
            target_ip = random.choice(self.target_ips)
            ports_to_scan = random.sample(self.common_ports, random.randint(5, len(self.common_ports)))
            
            for port in ports_to_scan:
                if not self.running:
                    break
                    
                description = random.choice(self.descriptions['PORT_SCAN'])
                severity = 'high' if len(ports_to_scan) > 10 else 'medium'
                
                self.log_alert('PORT_SCAN', source_ip, target_ip, f"{description} - Port {port}", severity)
                time.sleep(0.2)
            
            time.sleep(random.uniform(3, 7))

    def simulate_traffic_spike(self):
        """Simulate traffic spikes."""
        params = self.intensity_params[self.intensity]
        
        while self.running:
            # Generate burst of traffic
            burst_size = random.randint(params['traffic_spike_rate'] * 10, params['traffic_spike_rate'] * 50)
            source_ip = random.choice(self.source_ips)
            target_ip = random.choice(self.target_ips)
            
            for i in range(burst_size):
                if not self.running:
                    break
                    
                description = random.choice(self.descriptions['TRAFFIC_SPIKE'])
                severity = 'medium' if burst_size < 100 else 'high'
                
                self.log_alert('TRAFFIC_SPIKE', source_ip, target_ip, description, severity)
                
                if i % 10 == 0:
                    time.sleep(0.05)
            
            time.sleep(random.uniform(5, 10))

    def simulate_other_attacks(self):
        """Simulate other types of attacks."""
        other_attacks = ['SUSPICIOUS_PACKET', 'BRUTE_FORCE', 'DDOS_ATTEMPT', 'MALWARE_TRAFFIC', 'DATA_EXFILTRATION']
        
        while self.running:
            attack_type = random.choice(other_attacks)
            source_ip = random.choice(self.source_ips)
            target_ip = random.choice(self.target_ips)
            description = random.choice(self.descriptions[attack_type])
            
            # Vary severity based on attack type
            severity_map = {
                'SUSPICIOUS_PACKET': 'low',
                'BRUTE_FORCE': 'medium',
                'DDOS_ATTEMPT': 'high',
                'MALWARE_TRAFFIC': 'high',
                'DATA_EXFILTRATION': 'high'
            }
            
            severity = severity_map.get(attack_type, 'medium')
            
            self.log_alert(attack_type, source_ip, target_ip, description, severity)
            
            time.sleep(random.uniform(1, 4))

    def run_simulation(self):
        """Run the complete attack simulation."""
        print(f"[*] Starting Network Attack Simulation")
        print(f"    Duration: {self.duration} seconds")
        print(f"    Intensity: {self.intensity}")
        print(f"    Log file: {self.log_file}")
        print(f"    Press Ctrl+C to stop early\n")
        
        self.setup_log_file()
        self.running = True
        
        # Start attack threads
        threads = [
            threading.Thread(target=self.simulate_syn_flood, daemon=True),
            threading.Thread(target=self.simulate_port_scan, daemon=True),
            threading.Thread(target=self.simulate_traffic_spike, daemon=True),
            threading.Thread(target=self.simulate_other_attacks, daemon=True)
        ]
        
        for thread in threads:
            thread.start()
        
        # Run for specified duration
        start_time = time.time()
        try:
            while self.running and (time.time() - start_time) < self.duration:
                time.sleep(1)
                
                # Show progress
                elapsed = int(time.time() - start_time)
                remaining = max(0, self.duration - elapsed)
                print(f"\r[*] Simulation running... {elapsed}s elapsed, {remaining}s remaining", end='', flush=True)
                
        except KeyboardInterrupt:
            print(f"\n[*] Simulation stopped by user")
        
        self.running = False
        
        # Wait for threads to finish
        for thread in threads:
            thread.join(timeout=2)
        
        print(f"\n[*] Simulation completed!")
        print(f"[*] Check the web dashboard at http://localhost:5000 to see the results")

def main():
    parser = argparse.ArgumentParser(
        description='Network Attack Simulator for IDS Testing',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python simulate_attacks.py                    # 60 seconds, medium intensity
  python simulate_attacks.py --duration 120    # 2 minutes
  python simulate_attacks.py --intensity high  # High intensity attacks
  python simulate_attacks.py --duration 30 --intensity low  # Quick test
        """
    )
    
    parser.add_argument(
        '--duration',
        type=int,
        default=60,
        help='Simulation duration in seconds (default: 60)'
    )
    
    parser.add_argument(
        '--intensity',
        choices=['low', 'medium', 'high'],
        default='medium',
        help='Attack intensity level (default: medium)'
    )
    
    parser.add_argument(
        '--log-file',
        default='logs/intrusion_alerts.csv',
        help='Log file for alerts (default: logs/intrusion_alerts.csv)'
    )
    
    args = parser.parse_args()
    
    simulator = NetworkAttackSimulator(
        log_file=args.log_file,
        duration=args.duration,
        intensity=args.intensity
    )
    
    simulator.run_simulation()

if __name__ == '__main__':
    main()
