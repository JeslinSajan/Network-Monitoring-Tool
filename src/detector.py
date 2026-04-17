"""
Intrusion detector module for the Network Intrusion Detection System.

Implements detection rules for suspicious network patterns.
"""

from collections import defaultdict
from datetime import datetime, timedelta


class IntrusionDetector:
    """Detects suspicious network patterns using rule-based detection."""

    def __init__(self, logger, config=None):
        """
        Initialize intrusion detector with configurable thresholds.

        Args:
            logger: AlertLogger instance for logging
            config (dict, optional): Configuration dict with thresholds
        """
        self.logger = logger

        # Default thresholds
        self.config = config or {}
        self.syn_flood_threshold = self.config.get('syn_flood_threshold', 50)
        self.port_scan_threshold = self.config.get('port_scan_threshold', 15)
        self.traffic_spike_threshold = self.config.get('traffic_spike_threshold', 100)
        self.time_window = self.config.get('time_window', 10)  # seconds

        # Tracking dictionaries
        self.syn_count = defaultdict(int)
        self.syn_timestamp = defaultdict(list)
        self.port_attempts = defaultdict(set)
        self.traffic_rate = defaultdict(list)
        self.last_cleanup = datetime.now()

    def cleanup_old_entries(self):
        """Remove old entries to prevent memory bloat."""
        now = datetime.now()

        # Only cleanup every 100 packets
        if (now - self.last_cleanup).total_seconds() < 5:
            return

        threshold_time = now - timedelta(seconds=self.time_window * 2)

        # Cleanup SYN timestamps
        for ip in list(self.syn_timestamp.keys()):
            self.syn_timestamp[ip] = [ts for ts in self.syn_timestamp[ip] if ts > threshold_time]
            if not self.syn_timestamp[ip]:
                del self.syn_timestamp[ip]
                self.syn_count[ip] = 0

        # Cleanup traffic rate timestamps
        for key in list(self.traffic_rate.keys()):
            self.traffic_rate[key] = [ts for ts in self.traffic_rate[key] if ts > threshold_time]
            if not self.traffic_rate[key]:
                del self.traffic_rate[key]

        self.last_cleanup = now

    def detect_syn_flood(self, packet_info):
        """
        Detect potential SYN flood attacks.

        Args:
            packet_info (dict): Extracted packet information

        Returns:
            bool: True if SYN flood detected
        """
        if not packet_info.get('is_tcp'):
            return False

        # Check if this packet has SYN flag
        from analyzer import PacketAnalyzer
        # Create a temporary analyzer to check flags
        syn_flag = False
        if packet_info.get('flags') is not None:
            syn_flag = bool(packet_info['flags'] & 0x02)

        if not syn_flag:
            return False

        src_ip = packet_info['src_ip']
        now = datetime.now()

        # Track SYN packets with timestamps
        self.syn_timestamp[src_ip].append(now)
        self.syn_count[src_ip] = len([ts for ts in self.syn_timestamp[src_ip]
                                       if (now - ts).total_seconds() < self.time_window])

        if self.syn_count[src_ip] > self.syn_flood_threshold:
            self.logger.log_alert(
                'SYN Flood',
                src_ip,
                packet_info['dst_ip'],
                packet_info['src_port'],
                packet_info['dst_port'],
                f"Excessive SYN packets ({self.syn_count[src_ip]}) in {self.time_window}s window"
            )
            return True

        return False

    def detect_port_scan(self, packet_info):
        """
        Detect potential port scanning activity.

        Args:
            packet_info (dict): Extracted packet information

        Returns:
            bool: True if port scan detected
        """
        if not packet_info.get('is_tcp'):
            return False

        src_ip = packet_info['src_ip']
        dst_ip = packet_info['dst_ip']
        dst_port = packet_info['dst_port']

        if not dst_port:
            return False

        # Check if SYN flag is present (attempt to establish connection)
        syn_flag = False
        if packet_info.get('flags') is not None:
            syn_flag = bool(packet_info['flags'] & 0x02)

        if not syn_flag:
            return False

        # Track unique ports from this source to destination
        key = (src_ip, dst_ip)
        self.port_attempts[key].add(dst_port)

        if len(self.port_attempts[key]) > self.port_scan_threshold:
            ports_list = sorted(list(self.port_attempts[key]))[:5]  # Show first 5
            port_str = ', '.join(map(str, ports_list))
            self.logger.log_alert(
                'Port Scan',
                src_ip,
                dst_ip,
                packet_info['src_port'],
                dst_port,
                f"Connection attempts to {len(self.port_attempts[key])} ports: {port_str}..."
            )
            # Clear after reporting
            self.port_attempts[key].clear()
            return True

        return False

    def detect_traffic_spike(self, packet_info):
        """
        Detect unusual traffic spikes from a single source.

        Args:
            packet_info (dict): Extracted packet information

        Returns:
            bool: True if traffic spike detected
        """
        if not packet_info['src_ip']:
            return False

        src_ip = packet_info['src_ip']
        now = datetime.now()

        # Track packets per source IP
        self.traffic_rate[src_ip].append(now)

        # Count packets in the time window
        recent_packets = [ts for ts in self.traffic_rate[src_ip]
                         if (now - ts).total_seconds() < self.time_window]

        if len(recent_packets) > self.traffic_spike_threshold:
            self.logger.log_alert(
                'Traffic Spike',
                src_ip,
                packet_info.get('dst_ip', 'Unknown'),
                None,
                None,
                f"Abnormal traffic rate: {len(recent_packets)} packets in {self.time_window}s"
            )
            # Clear after reporting
            self.traffic_rate[src_ip].clear()
            return True

        return False

    def analyze_packet(self, packet_info):
        """
        Perform all detection checks on a packet.

        Args:
            packet_info (dict): Extracted packet information
        """
        # Cleanup old entries periodically
        self.cleanup_old_entries()

        # Run detection checks
        self.detect_syn_flood(packet_info)
        self.detect_port_scan(packet_info)
        self.detect_traffic_spike(packet_info)

    def get_statistics(self):
        """
        Get current detection statistics.

        Returns:
            dict: Statistics including tracked IPs and attempts
        """
        return {
            'tracked_ips_syn': len(self.syn_count),
            'tracked_ips_traffic': len(self.traffic_rate),
            'tracked_port_scans': len(self.port_attempts),
        }
