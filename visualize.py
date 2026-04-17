#!/usr/bin/env python3
"""
Optional visualization module for Network IDS.

This module provides matplotlib-based visualization of:
- Alert frequency over time
- Top source IPs by alert count
- Alert type distribution

Usage:
    python visualize.py [-l <log_file>] [-o <output_file>]

Requires: matplotlib pandas

Install: pip install matplotlib pandas
"""

import argparse
import csv
from pathlib import Path
from datetime import datetime
from collections import Counter, defaultdict
import sys

try:
    import matplotlib.pyplot as plt
    import pandas as pd
    HAS_MATPLOTLIB = True
except ImportError:
    HAS_MATPLOTLIB = False
    print("[!] This utility requires matplotlib and pandas")
    print("    Install with: pip install matplotlib pandas")
    sys.exit(1)


def read_alerts(log_file):
    """
    Read alerts from CSV file.

    Args:
        log_file (str): Path to alerts CSV

    Returns:
        list: List of alert dictionaries
    """
    alerts = []
    try:
        with open(log_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            alerts = list(reader)
    except FileNotFoundError:
        print(f"[!] Alert log not found: {log_file}")
        return []
    except Exception as e:
        print(f"[!] Error reading log file: {e}")
        return []

    return alerts


def plot_alert_timeline(alerts, output_file=None):
    """Plot alert frequency over time."""
    if not alerts:
        print("[!] No alerts to visualize")
        return

    # Parse timestamps and group by hour
    alert_times = defaultdict(int)

    for alert in alerts:
        try:
            ts = datetime.strptime(alert['timestamp'], "%Y-%m-%d %H:%M:%S")
            hour_key = ts.strftime("%Y-%m-%d %H:00")
            alert_times[hour_key] += 1
        except (ValueError, KeyError):
            continue

    if not alert_times:
        print("[!] No valid timestamps found")
        return

    # Create plot
    fig, ax = plt.subplots(figsize=(12, 6))
    hours = sorted(alert_times.keys())
    counts = [alert_times[h] for h in hours]

    ax.plot(hours, counts, marker='o', linewidth=2, markersize=8, color='#FF6B6B')
    ax.fill_between(range(len(hours)), counts, alpha=0.3, color='#FF6B6B')

    ax.set_xlabel('Time', fontsize=12, fontweight='bold')
    ax.set_ylabel('Alert Count', fontsize=12, fontweight='bold')
    ax.set_title('IDS Alerts Over Time', fontsize=14, fontweight='bold')
    ax.grid(True, alpha=0.3)
    plt.xticks(rotation=45, ha='right')
    plt.tight_layout()

    if output_file:
        plt.savefig(output_file, dpi=150, bbox_inches='tight')
        print(f"[*] Alert timeline saved to: {output_file}")
    else:
        plt.show()


def plot_alert_types(alerts, output_file=None):
    """Plot distribution of alert types."""
    if not alerts:
        return

    alert_types = Counter(alert.get('alert_type', 'Unknown') for alert in alerts)

    fig, ax = plt.subplots(figsize=(10, 6))
    types = list(alert_types.keys())
    counts = list(alert_types.values())

    colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA502']
    bars = ax.bar(types, counts, color=colors[:len(types)], edgecolor='black', linewidth=1.5)

    # Add value labels on bars
    for bar in bars:
        height = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2., height,
                f'{int(height)}',
                ha='center', va='bottom', fontweight='bold')

    ax.set_ylabel('Count', fontsize=12, fontweight='bold')
    ax.set_title('Alert Type Distribution', fontsize=14, fontweight='bold')
    plt.xticks(rotation=45, ha='right')
    plt.tight_layout()

    if output_file:
        plt.savefig(output_file, dpi=150, bbox_inches='tight')
        print(f"[*] Alert types chart saved to: {output_file}")
    else:
        plt.show()


def plot_top_sources(alerts, top_n=10, output_file=None):
    """Plot top source IPs by alert count."""
    if not alerts:
        return

    source_ips = Counter(alert.get('source_ip', 'Unknown') for alert in alerts)
    top_sources = source_ips.most_common(top_n)

    if not top_sources:
        return

    fig, ax = plt.subplots(figsize=(12, 6))
    ips = [ip[0] for ip in top_sources]
    counts = [ip[1] for ip in top_sources]

    bars = ax.barh(ips, counts, color='#45B7D1', edgecolor='black', linewidth=1.5)

    # Add value labels
    for i, (bar, count) in enumerate(zip(bars, counts)):
        ax.text(count, i, f' {int(count)}', va='center', fontweight='bold')

    ax.set_xlabel('Alert Count', fontsize=12, fontweight='bold')
    ax.set_title(f'Top {top_n} Source IPs by Alert Count', fontsize=14, fontweight='bold')
    plt.tight_layout()

    if output_file:
        plt.savefig(output_file, dpi=150, bbox_inches='tight')
        print(f"[*] Top sources chart saved to: {output_file}")
    else:
        plt.show()


def print_summary(alerts):
    """Print summary statistics."""
    if not alerts:
        print("[!] No alerts to summarize")
        return

    print(f"\n[*] Alert Summary")
    print(f"    Total alerts: {len(alerts)}")

    # Count by type
    types = Counter(alert.get('alert_type', 'Unknown') for alert in alerts)
    print(f"    By type:")
    for alert_type, count in types.most_common():
        print(f"      - {alert_type}: {count}")

    # Top sources
    sources = Counter(alert.get('source_ip', 'Unknown') for alert in alerts)
    print(f"\n    Top 5 source IPs:")
    for ip, count in sources.most_common(5):
        print(f"      - {ip}: {count} alerts")

    print()


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description='Visualize Network IDS alerts',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python visualize.py                  # Show all plots (interactive)
  python visualize.py -l my_alerts.csv # Use custom log file
  python visualize.py -o ./graphs/     # Save plots to folder
        """
    )

    parser.add_argument(
        '-l', '--log',
        help='Alert log file (default: logs/intrusion_alerts.csv)',
        default='logs/intrusion_alerts.csv'
    )

    parser.add_argument(
        '-o', '--output',
        help='Output directory for saving plots (default: show plots)',
        default=None
    )

    args = parser.parse_args()

    # Read alerts
    print(f"[*] Reading alerts from: {args.log}")
    alerts = read_alerts(args.log)

    if not alerts:
        print("[!] No alerts found")
        sys.exit(1)

    # Create output directory if needed
    if args.output:
        Path(args.output).mkdir(parents=True, exist_ok=True)

    # Print summary
    print_summary(alerts)

    # Generate plots
    print("[*] Generating visualizations...")

    if args.output:
        plot_alert_timeline(alerts, f"{args.output}/timeline.png")
        plot_alert_types(alerts, f"{args.output}/types.png")
        plot_top_sources(alerts, top_n=10, output_file=f"{args.output}/top_sources.png")
        print(f"[+] Plots saved to: {args.output}")
    else:
        print("[*] Showing interactive plots...")
        plot_alert_timeline(alerts)
        plot_alert_types(alerts)
        plot_top_sources(alerts, top_n=10)


if __name__ == '__main__':
    main()
