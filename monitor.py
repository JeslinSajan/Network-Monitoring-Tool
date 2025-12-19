from scapy.all import sniff, IP, TCP
from collections import defaultdict
import time

packet_count = defaultdict(int)
start_time = time.time()

def detect(packet):
    global start_time
    if IP in packet:
        src = packet[IP].src
        packet_count[src] += 1

        if time.time() - start_time > 10:
            for ip, count in packet_count.items():
                if count > 100:
                    print(f"[ALERT] Possible DoS from {ip} ({count} packets)")
            packet_count.clear()
            start_time = time.time()

sniff(prn=detect, store=False)

