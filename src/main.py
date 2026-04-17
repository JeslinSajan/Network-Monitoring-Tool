#!/usr/bin/env python3
"""
Network Intrusion Detection System (IDS) - Main Entry Point

A simple but effective network intrusion detection system that monitors
network traffic for suspicious patterns and potential attacks.

Features:
    - Real-time packet capture and analysis
    - SYN flood detection
    - Port scan detection
    - Traffic spike detection
    - CSV-based alert logging
    - Colored console output

Usage:
    python main.py                          # Auto-detect interface
    python main.py -i eth0                  # Specify interface
    python main.py -i eth0 -l custom.csv    # Custom log file
    python main.py -t 100                   # Custom SYN flood threshold

Requirements:
    - Run with sudo/administrator privileges
    - Linux/Windows/macOS with network access
"""

import argparse
import signal
import sys
import os
from pathlib import Path

from colorama import init, Fore, Style

# Add src to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from logger import AlertLogger
from capture import PacketCapture
from analyzer import PacketAnalyzer
from detector import IntrusionDetector

# Initialize colors
init()


class NetworkIDS:
    """Main Network Intrusion Detection System class."""

    def __init__(self, interface=None, alert_file='intrusion_alerts.csv',
                 syn_threshold=50, port_threshold=15, traffic_threshold=100):
        """
        Initialize the Network IDS.

        Args:
            interface (str, optional): Network interface to monitor
            alert_file (str, optional): CSV file for alerts
            syn_threshold (int): SYN flood threshold
            port_threshold (int): Port scan threshold
            traffic_threshold (int): Traffic spike threshold
        """
        self.logger = AlertLogger(log_dir='logs', alert_file=alert_file)
        self.analyzer = PacketAnalyzer(self.logger)

        # Configuration for detector
        config = {
            'syn_flood_threshold': syn_threshold,
            'port_scan_threshold': port_threshold,
            'traffic_spike_threshold': traffic_threshold,
            'time_window': 10,
        }
        self.detector = IntrusionDetector(self.logger, config)

        # Packet capture
        self.capture = PacketCapture(interface=interface)
        self.capture.set_callback(self.process_packet)

        self.running = False
        self.packet_count = 0

    def process_packet(self, packet):
        """
        Process a captured packet.

        Args:
            packet: Scapy packet object
        """
        try:
            self.packet_count += 1

            # Extract packet information
            packet_info = self.analyzer.extract_packet_info(packet)

            # Display packet info (only IP packets)
            if packet_info['src_ip']:
                # Limit console output to reduce noise
                if self.packet_count % 100 == 0:  # Show 1 out of every 100 packets
                    self.analyzer.display_packet_info(packet_info)

            # Perform intrusion detection analysis
            self.detector.analyze_packet(packet_info)

        except Exception as e:
            self.logger.log_error(f"Error processing packet: {e}")

    def start(self):
        """Start the IDS and begin monitoring."""
        self.running = True

        try:
            self.logger.print_info(f"Starting Network IDS on interface: {self.capture.interface}")
            self.logger.print_info("Press Ctrl+C to stop monitoring\n")
            self.logger.log_info(f"IDS started on interface: {self.capture.interface}")

            self.capture.start_sniffing()

        except PermissionError:
            self.logger.print_error("Permission denied! Run with sudo (Linux) or as Administrator (Windows)")
            self.logger.log_error("Permission denied - requires elevated privileges")
            sys.exit(1)

        except KeyboardInterrupt:
            self.stop()

        except Exception as e:
            self.logger.print_error(f"Error during packet capture: {e}")
            self.logger.log_error(f"Error during packet capture: {e}")
            self.stop()

    def stop(self):
        """Stop the IDS and clean up."""
        self.running = False
        self.capture.stop_sniffing()

        # Print statistics
        print(f"\n{Fore.CYAN}{'='*60}{Style.RESET_ALL}")
        print(f"{Fore.GREEN}[*] IDS Monitoring Stopped{Style.RESET_ALL}")
        print(f"{Fore.CYAN}{'='*60}{Style.RESET_ALL}")
        print(f"{Fore.YELLOW}Statistics:{Style.RESET_ALL}")
        print(f"  Total packets analyzed: {self.packet_count}")
        print(f"  Total alerts generated: {self.logger.get_alert_count()}")

        # Show detector statistics
        stats = self.detector.get_statistics()
        print(f"  Tracked suspicious IPs (SYN): {stats['tracked_ips_syn']}")
        print(f"  Tracked suspicious IPs (Traffic): {stats['tracked_ips_traffic']}")
        print(f"  Active port scan attempts: {stats['tracked_port_scans']}")

        print(f"{Fore.GREEN}Alert log saved to: logs/intrusion_alerts.csv{Style.RESET_ALL}")
        print(f"{Fore.GREEN}System log saved to: logs/ids.log{Style.RESET_ALL}\n")

        self.logger.log_info(f"IDS stopped - Packets: {self.packet_count}, Alerts: {self.logger.get_alert_count()}")

        sys.exit(0)

    def setup_signal_handlers(self):
        """Setup handlers for graceful shutdown."""
        def signal_handler(sig, frame):
            self.stop()

        signal.signal(signal.SIGINT, signal_handler)
        signal.signal(signal.SIGTERM, signal_handler)


def parse_arguments():
    """Parse command-line arguments."""
    parser = argparse.ArgumentParser(
        description='Network Intrusion Detection System (IDS)',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python main.py                      # Auto-detect interface
  python main.py -i eth0              # Monitor eth0
  python main.py -i eth0 -t 100       # Custom SYN threshold
        """
    )

    parser.add_argument(
        '-i', '--interface',
        help='Network interface to monitor (auto-detected if not specified)',
        default=None
    )

    parser.add_argument(
        '-l', '--log',
        help='CSV file for storing alerts (default: intrusion_alerts.csv)',
        default='intrusion_alerts.csv'
    )

    parser.add_argument(
        '-t', '--syn-threshold',
        type=int,
        help='SYN flood threshold (default: 50)',
        default=50
    )

    parser.add_argument(
        '-p', '--port-threshold',
        type=int,
        help='Port scan threshold (default: 15)',
        default=15
    )

    parser.add_argument(
        '--traffic-threshold',
        type=int,
        help='Traffic spike threshold (default: 100)',
        default=100
    )

    return parser.parse_args()


def main():
    """Main entry point."""
    args = parse_arguments()

    print(f"\n{Fore.GREEN}{'='*60}{Style.RESET_ALL}")
    print(f"{Fore.CYAN}Network Intrusion Detection System (IDS){Style.RESET_ALL}")
    print(f"{Fore.GREEN}{'='*60}{Style.RESET_ALL}\n")

    try:
        # Create IDS instance
        ids = NetworkIDS(
            interface=args.interface,
            alert_file=args.log,
            syn_threshold=args.syn_threshold,
            port_threshold=args.port_threshold,
            traffic_threshold=args.traffic_threshold
        )

        # Setup signal handlers for graceful shutdown
        ids.setup_signal_handlers()

        # Start monitoring
        ids.start()

    except KeyboardInterrupt:
        print(f"\n{Fore.YELLOW}[*] Shutting down...{Style.RESET_ALL}")
        sys.exit(0)

    except PermissionError:
        print(f"{Fore.RED}[!] Permission denied!{Style.RESET_ALL}")
        print(f"    {Fore.YELLOW}Linux:{Style.RESET_ALL} Run with 'sudo python main.py'")
        print(f"    {Fore.YELLOW}Windows:{Style.RESET_ALL} Run as Administrator\n")
        sys.exit(1)

    except Exception as e:
        print(f"{Fore.RED}[!] Error: {e}{Style.RESET_ALL}\n")
        sys.exit(1)


if __name__ == '__main__':
    main()
