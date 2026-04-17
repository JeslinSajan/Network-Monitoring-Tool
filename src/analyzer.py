"""
Packet analyzer module for the Network Intrusion Detection System.

Extracts relevant fields from packets for analysis.
"""

from scapy.all import IP, TCP, UDP, ICMP
from colorama import Fore, Style


class PacketAnalyzer:
    """Analyzes captured packets and extracts relevant information."""

    def __init__(self, logger):
        """
        Initialize packet analyzer.

        Args:
            logger: AlertLogger instance for logging
        """
        self.logger = logger

    def extract_packet_info(self, packet):
        """
        Extract relevant information from a packet.

        Args:
            packet: Scapy packet object

        Returns:
            dict: Extracted packet information
        """
        packet_info = {
            'src_ip': None,
            'dst_ip': None,
            'src_port': None,
            'dst_port': None,
            'protocol': None,
            'flags': None,
            'is_tcp': False,
            'is_udp': False,
            'is_icmp': False,
        }

        try:
            # Extract IP layer information
            if IP in packet:
                packet_info['src_ip'] = packet[IP].src
                packet_info['dst_ip'] = packet[IP].dst

                # Extract protocol-specific information
                if TCP in packet:
                    packet_info['is_tcp'] = True
                    packet_info['protocol'] = 'TCP'
                    packet_info['src_port'] = packet[TCP].sport
                    packet_info['dst_port'] = packet[TCP].dport
                    packet_info['flags'] = packet[TCP].flags

                elif UDP in packet:
                    packet_info['is_udp'] = True
                    packet_info['protocol'] = 'UDP'
                    packet_info['src_port'] = packet[UDP].sport
                    packet_info['dst_port'] = packet[UDP].dport

                elif ICMP in packet:
                    packet_info['is_icmp'] = True
                    packet_info['protocol'] = 'ICMP'

        except Exception as e:
            self.logger.log_error(f"Error extracting packet info: {e}")

        return packet_info

    def display_packet_info(self, packet_info):
        """
        Display packet information in a formatted manner.

        Args:
            packet_info (dict): Extracted packet information
        """
        if not packet_info['src_ip']:
            return

        # Build protocol string
        protocol = packet_info.get('protocol', 'Unknown')

        # Build port string
        port_str = ""
        if packet_info['src_port'] and packet_info['dst_port']:
            port_str = f"| {protocol} {packet_info['dst_port']}"

        # Format and print
        src = f"{packet_info['src_ip']}"
        if packet_info['src_port']:
            src += f":{packet_info['src_port']}"

        dst = f"{packet_info['dst_ip']}"
        if packet_info['dst_port']:
            dst += f":{packet_info['dst_port']}"

        print(f"[INFO] SRC: {src} {Fore.CYAN}→{Style.RESET_ALL} DST: {dst} | {protocol} {port_str}")

    def get_syn_flag(self, packet_info):
        """
        Check if SYN flag is set.

        Args:
            packet_info (dict): Extracted packet information

        Returns:
            bool: True if SYN flag is set
        """
        if packet_info.get('flags') is None:
            return False
        # SYN flag is bit 1 (0x02)
        return bool(packet_info['flags'] & 0x02)

    def get_ack_flag(self, packet_info):
        """
        Check if ACK flag is set.

        Args:
            packet_info (dict): Extracted packet information

        Returns:
            bool: True if ACK flag is set
        """
        if packet_info.get('flags') is None:
            return False
        # ACK flag is bit 4 (0x10)
        return bool(packet_info['flags'] & 0x10)

    def get_fin_flag(self, packet_info):
        """
        Check if FIN flag is set.

        Args:
            packet_info (dict): Extracted packet information

        Returns:
            bool: True if FIN flag is set
        """
        if packet_info.get('flags') is None:
            return False
        # FIN flag is bit 0 (0x01)
        return bool(packet_info['flags'] & 0x01)

    def get_rst_flag(self, packet_info):
        """
        Check if RST flag is set.

        Args:
            packet_info (dict): Extracted packet information

        Returns:
            bool: True if RST flag is set
        """
        if packet_info.get('flags') is None:
            return False
        # RST flag is bit 2 (0x04)
        return bool(packet_info['flags'] & 0x04)
