"""
Packet capture module for the Network Intrusion Detection System.

Handles sniffing network packets using Scapy.
"""

from scapy.all import sniff, IP, TCP, UDP, ICMP


class PacketCapture:
    """Handles packet capture from network interfaces."""

    def __init__(self, interface=None, packet_filter=None):
        """
        Initialize packet capture.

        Args:
            interface (str, optional): Network interface to sniff on
            packet_filter (str, optional): BPF filter string
        """
        self.interface = interface
        self.packet_filter = packet_filter or "tcp or udp or icmp"
        self.packet_count = 0
        self.callback = None
        self.running = False

    def set_callback(self, callback):
        """
        Set the callback function for packet processing.

        Args:
            callback (callable): Function to call for each packet
        """
        self.callback = callback

    def packet_handler(self, packet):
        """
        Internal handler for captured packets.

        Args:
            packet: Scapy packet object
        """
        if not self.running or not self.callback:
            return

        self.packet_count += 1

        try:
            self.callback(packet)
        except Exception as e:
            # Errors are handled by caller
            raise

    def start_sniffing(self):
        """Start capturing packets."""
        self.running = True

        try:
            sniff(
                iface=self.interface,
                prn=self.packet_handler,
                filter=self.packet_filter,
                store=0,
                stop_filter=lambda x: not self.running
            )
        except Exception as e:
            if "libpcap" in str(e) or "pcap" in str(e):
                print("[!] Npcap/libpcap not found. Entering Mock Capture Mode for demonstration.")
                self._mock_sniffing()
            else:
                self.running = False
                raise

    def _mock_sniffing(self):
        """Simulate packet capture if Npcap/libpcap is missing."""
        import time
        import random
        import threading
        from scapy.all import IP, TCP
        
        def mock_loop():
            ips = ['192.168.1.100', '10.0.0.50', '192.168.1.1', '8.8.8.8']
            while self.running:
                # Generate realistic looking mock packets
                packet = IP(src=random.choice(ips), dst=random.choice(ips)) / TCP(
                    sport=random.randint(1024, 65535), 
                    dport=random.choice([80, 443, 22, 53, 3306])
                )
                self.packet_handler(packet)
                time.sleep(random.uniform(0.1, 0.5))
                
        t = threading.Thread(target=mock_loop, daemon=True)
        t.start()
        
        # Keep main thread alive as sniff() normally blocks
        while self.running:
            try:
                time.sleep(1)
            except KeyboardInterrupt:
                self.running = False
                break

    def stop_sniffing(self):
        """Stop capturing packets."""
        self.running = False

    def get_packet_count(self):
        """Return total packets captured."""
        return self.packet_count
