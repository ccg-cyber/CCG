#!/bin/bash
# CCG Server Health Check Script

echo "================================="
echo "   CCG SERVER STATUS REPORT      "
echo "================================="

# Check Uptime
echo "[UPTIME]"
uptime
echo "---------------------------------"

# Check Disk Usage
echo "[DISK USAGE]"
df -h | grep '^/dev/'
echo "---------------------------------"

# Check Memory Usage
echo "[MEMORY]"
free -h
echo "---------------------------------"

# Check for Failed System Services
echo "[FAILED SERVICES]"
systemctl list-units --state=failed
echo "================================="
echo "Report Generated: $(date)"
