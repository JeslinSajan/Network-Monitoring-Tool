"""
Logger module for the Network Intrusion Detection System.

Handles logging of alerts and system events to both console and file.
"""

import logging
import csv
from pathlib import Path
from datetime import datetime
from colorama import Fore, Style


class AlertLogger:
    """Handles logging of security alerts to file and console."""

    def __init__(self, log_dir='logs', alert_file='intrusion_alerts.csv'):
        """
        Initialize the alert logger.

        Args:
            log_dir (str): Directory for log files
            alert_file (str): CSV file for alerts
        """
        self.log_dir = Path(log_dir)
        self.alert_file = self.log_dir / alert_file
        self.log_file = self.log_dir / 'ids.log'

        # Create log directory if needed
        self.log_dir.mkdir(exist_ok=True)

        # Initialize file logger
        self._setup_file_logger()

        # Alert statistics
        self.alert_count = 0

    def _setup_file_logger(self):
        """Configure file-based logging."""
        try:
            logging.basicConfig(
                level=logging.INFO,
                format='%(asctime)s - %(levelname)s - %(message)s',
                handlers=[
                    logging.FileHandler(self.log_file, encoding='utf-8'),
                ],
                force=True
            )
            self.logger = logging.getLogger('NetworkIDS')
        except Exception as e:
            print(f"{Fore.RED}[ERROR] Failed to setup file logger: {e}{Style.RESET_ALL}")
            self.logger = logging.getLogger('NetworkIDS')

    def log_alert(self, alert_type, src_ip, dst_ip, src_port=None, dst_port=None, description=""):
        """
        Log a security alert to both console and file.

        Args:
            alert_type (str): Type of alert (e.g., 'Port Scan', 'SYN Flood')
            src_ip (str): Source IP address
            dst_ip (str): Destination IP address
            src_port (int, optional): Source port
            dst_port (int, optional): Destination port
            description (str, optional): Detailed description
        """
        self.alert_count += 1
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        # Console output with colors
        print(f"\n{Fore.RED}[ALERT] {alert_type}{Style.RESET_ALL}")
        print(f"  {Fore.YELLOW}SRC:{Style.RESET_ALL} {src_ip}", end="")
        if src_port:
            print(f":{src_port}", end="")
        print(f" {Fore.YELLOW}→{Style.RESET_ALL} {dst_ip}", end="")
        if dst_port:
            print(f":{dst_port}", end="")
        print()

        if description:
            print(f"  {Fore.CYAN}Description:{Style.RESET_ALL} {description}")
        print()

        # Log to file
        try:
            with open(self.alert_file, 'a', newline='', encoding='utf-8') as f:
                # Write header if file is empty
                if f.tell() == 0:
                    writer = csv.DictWriter(
                        f,
                        fieldnames=['timestamp', 'alert_type', 'source_ip', 'source_port',
                                    'destination_ip', 'destination_port', 'description']
                    )
                    writer.writeheader()

                # Write alert
                writer = csv.DictWriter(
                    f,
                    fieldnames=['timestamp', 'alert_type', 'source_ip', 'source_port',
                                'destination_ip', 'destination_port', 'description']
                )
                writer.writerow({
                    'timestamp': timestamp,
                    'alert_type': alert_type,
                    'source_ip': src_ip,
                    'source_port': src_port or '',
                    'destination_ip': dst_ip,
                    'destination_port': dst_port or '',
                    'description': description
                })
        except Exception as e:
            self.logger.error(f"Failed to write alert to file: {e}")

        # Also log to system logger
        self.logger.info(f"{alert_type} - {src_ip} → {dst_ip} - {description}")

    def log_info(self, message):
        """Log informational message."""
        self.logger.info(message)

    def log_error(self, message):
        """Log error message."""
        self.logger.error(message)

    def log_warning(self, message):
        """Log warning message."""
        self.logger.warning(message)

    def print_info(self, message):
        """Print info message to console."""
        print(f"{Fore.GREEN}[INFO]{Style.RESET_ALL} {message}")

    def print_error(self, message):
        """Print error message to console."""
        print(f"{Fore.RED}[ERROR]{Style.RESET_ALL} {message}")

    def get_alert_count(self):
        """Return total alert count."""
        return self.alert_count
