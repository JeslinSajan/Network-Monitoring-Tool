# Unit tests for Network IDS
import unittest
from ids import NetworkIDS

class TestNetworkIDS(unittest.TestCase):
    def setUp(self):
        self.ids = NetworkIDS(interface='eth0')

    def test_syn_flood_detection(self):
        # Simulate SYN packets
        for _ in range(110):
            self.ids.track_syn('192.168.1.50')
        self.assertTrue(self.ids.is_syn_flood('192.168.1.50'))

    def test_icmp_flood_detection(self):
        # Simulate ICMP packets
        for _ in range(110):
            self.ids.track_icmp('192.168.1.50')
        self.assertTrue(self.ids.is_icmp_flood('192.168.1.50'))

    def test_arp_spoofing_detection(self):
        # Simulate ARP packets
        for _ in range(6):
            self.ids.track_arp('192.168.1.50')
        self.assertTrue(self.ids.is_arp_spoofing('192.168.1.50'))

if __name__ == '__main__':
    unittest.main()
