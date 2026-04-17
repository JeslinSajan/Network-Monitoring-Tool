#!/usr/bin/env python3
"""
Network IDS Demo Script

This script demonstrates how the complete Network IDS system works:
1. Shows the web dashboard
2. Runs attack simulation
3. Displays real-time updates
"""

import time
import webbrowser
from pathlib import Path

def run_demo():
    print("=" * 60)
    print("NETWORK INTRUSION DETECTION SYSTEM - DEMO")
    print("=" * 60)
    
    print("\n1. WEB DASHBOARD")
    print("   - Access at: http://localhost:5000")
    print("   - Real-time alerts and statistics")
    print("   - Interactive charts and visualizations")
    
    print("\n2. ATTACK SIMULATION")
    print("   - Simulates various network attacks")
    print("   - Generates realistic alert data")
    print("   - Tests IDS detection capabilities")
    
    print("\n3. HOW IT WORKS:")
    print("   a) Web server (Flask) runs the dashboard")
    print("   b) Attack simulator generates traffic patterns")
    print("   c) Alerts are logged to CSV file")
    print("   d) Dashboard reads and displays alerts in real-time")
    
    print("\n" + "=" * 60)
    print("DEMO OPTIONS:")
    print("=" * 60)
    
    while True:
        print("\nChoose an option:")
        print("1. Start web dashboard (if not running)")
        print("2. Run attack simulation (30 seconds)")
        print("3. Run intense attack simulation (60 seconds)")
        print("4. Clear all alerts")
        print("5. View current alerts")
        print("6. Exit demo")
        
        choice = input("\nEnter your choice (1-6): ").strip()
        
        if choice == '1':
            print("\n[*] Make sure web dashboard is running:")
            print("    Open terminal and run: python app.py")
            print("    Then visit: http://localhost:5000")
            webbrowser.open('http://localhost:5000')
            
        elif choice == '2':
            print("\n[*] Running 30-second attack simulation...")
            import subprocess
            subprocess.run(['python', 'simulate_attacks.py', '--duration', '30', '--intensity', 'medium'])
            
        elif choice == '3':
            print("\n[*] Running 60-second intense attack simulation...")
            import subprocess
            subprocess.run(['python', 'simulate_attacks.py', '--duration', '60', '--intensity', 'high'])
            
        elif choice == '4':
            print("\n[*] Clearing alerts...")
            # Clear the log file
            log_file = Path('logs/intrusion_alerts.csv')
            if log_file.exists():
                with open(log_file, 'w') as f:
                    f.write('timestamp,alert_type,source_ip,destination_ip,description,severity\n')
                print("[+] Alerts cleared!")
            else:
                print("[!] No alerts to clear")
                
        elif choice == '5':
            print("\n[*] Current alerts:")
            log_file = Path('logs/intrusion_alerts.csv')
            if log_file.exists():
                with open(log_file, 'r') as f:
                    lines = f.readlines()
                    print(f"Total alerts: {len(lines) - 1}")
                    if len(lines) > 1:
                        print("\nLast 5 alerts:")
                        for line in lines[-6:-1]:  # Skip header, show last 5
                            parts = line.strip().split(',')
                            if len(parts) >= 6:
                                print(f"  {parts[0]} | {parts[1]} | {parts[2]} -> {parts[3]} | {parts[4]}")
                    else:
                        print("  No alerts found")
            else:
                print("  No alerts file found")
                
        elif choice == '6':
            print("\n[*] Demo completed!")
            print("[*] Keep the web dashboard running to see real-time updates")
            break
            
        else:
            print("\n[!] Invalid choice. Please try again.")

if __name__ == '__main__':
    run_demo()
