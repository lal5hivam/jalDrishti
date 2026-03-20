#!/bin/bash
# Health Check Script for JalDrishti Application

# Configuration
APP_URL="http://localhost:8501"
HEALTH_ENDPOINT="${APP_URL}/_stcore/health"
LOG_FILE="/var/log/jaldrishti-health.log"
ALERT_EMAIL="admin@example.com"  # Update with your email

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Timestamp
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# Function to log messages
log_message() {
    echo "[$TIMESTAMP] $1" | tee -a "$LOG_FILE"
}

# Function to send alert (placeholder - implement email/SMS)
send_alert() {
    local message="$1"
    log_message "ALERT: $message"
    # Implement email/SMS notification here
    # echo "$message" | mail -s "JalDrishti Alert" "$ALERT_EMAIL"
}

echo "=========================================="
echo "JalDrishti Health Check"
echo "=========================================="

# Check 1: Container Status
echo -n "Checking container status... "
if docker-compose ps | grep -q "Up"; then
    echo -e "${GREEN}✓ Running${NC}"
    log_message "Container status: Running"
else
    echo -e "${RED}✗ Not running${NC}"
    log_message "ERROR: Container not running"
    send_alert "Container is not running"
    exit 1
fi

# Check 2: HTTP Response
echo -n "Checking HTTP response... "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$APP_URL" --max-time 10)
if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✓ OK (200)${NC}"
    log_message "HTTP response: 200 OK"
else
    echo -e "${RED}✗ Failed ($HTTP_CODE)${NC}"
    log_message "ERROR: HTTP response: $HTTP_CODE"
    send_alert "HTTP check failed with code: $HTTP_CODE"
fi

# Check 3: Health Endpoint
echo -n "Checking health endpoint... "
HEALTH_STATUS=$(curl -s "$HEALTH_ENDPOINT" --max-time 5)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Healthy${NC}"
    log_message "Health endpoint: OK"
else
    echo -e "${RED}✗ Unhealthy${NC}"
    log_message "ERROR: Health endpoint failed"
    send_alert "Health endpoint check failed"
fi

# Check 4: Response Time
echo -n "Checking response time... "
RESPONSE_TIME=$(curl -s -o /dev/null -w "%{time_total}" "$APP_URL" --max-time 10)
RESPONSE_MS=$(echo "$RESPONSE_TIME * 1000" | bc)
if (( $(echo "$RESPONSE_TIME < 5" | bc -l) )); then
    echo -e "${GREEN}✓ ${RESPONSE_MS}ms${NC}"
    log_message "Response time: ${RESPONSE_MS}ms"
else
    echo -e "${YELLOW}⚠ Slow (${RESPONSE_MS}ms)${NC}"
    log_message "WARNING: Slow response time: ${RESPONSE_MS}ms"
fi

# Check 5: Memory Usage
echo -n "Checking memory usage... "
MEMORY_USAGE=$(docker stats --no-stream --format "{{.MemPerc}}" jaldrishti-app 2>/dev/null | sed 's/%//')
if [ -n "$MEMORY_USAGE" ]; then
    if (( $(echo "$MEMORY_USAGE < 85" | bc -l) )); then
        echo -e "${GREEN}✓ ${MEMORY_USAGE}%${NC}"
        log_message "Memory usage: ${MEMORY_USAGE}%"
    else
        echo -e "${RED}✗ High (${MEMORY_USAGE}%)${NC}"
        log_message "ERROR: High memory usage: ${MEMORY_USAGE}%"
        send_alert "High memory usage: ${MEMORY_USAGE}%"
    fi
else
    echo -e "${YELLOW}⚠ Unable to check${NC}"
fi

# Check 6: CPU Usage
echo -n "Checking CPU usage... "
CPU_USAGE=$(docker stats --no-stream --format "{{.CPUPerc}}" jaldrishti-app 2>/dev/null | sed 's/%//')
if [ -n "$CPU_USAGE" ]; then
    if (( $(echo "$CPU_USAGE < 80" | bc -l) )); then
        echo -e "${GREEN}✓ ${CPU_USAGE}%${NC}"
        log_message "CPU usage: ${CPU_USAGE}%"
    else
        echo -e "${YELLOW}⚠ High (${CPU_USAGE}%)${NC}"
        log_message "WARNING: High CPU usage: ${CPU_USAGE}%"
    fi
else
    echo -e "${YELLOW}⚠ Unable to check${NC}"
fi

# Check 7: Disk Space
echo -n "Checking disk space... "
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -lt 80 ]; then
    echo -e "${GREEN}✓ ${DISK_USAGE}%${NC}"
    log_message "Disk usage: ${DISK_USAGE}%"
else
    echo -e "${RED}✗ High (${DISK_USAGE}%)${NC}"
    log_message "ERROR: High disk usage: ${DISK_USAGE}%"
    send_alert "High disk usage: ${DISK_USAGE}%"
fi

# Check 8: Docker Logs for Errors
echo -n "Checking for errors in logs... "
ERROR_COUNT=$(docker-compose logs --tail=100 2>&1 | grep -i "error\|exception\|failed" | wc -l)
if [ "$ERROR_COUNT" -eq 0 ]; then
    echo -e "${GREEN}✓ No errors${NC}"
    log_message "Log errors: 0"
else
    echo -e "${YELLOW}⚠ ${ERROR_COUNT} errors found${NC}"
    log_message "WARNING: ${ERROR_COUNT} errors in logs"
fi

echo "=========================================="
echo "Health check completed"
echo "=========================================="

# Exit with appropriate code
if [ "$HTTP_CODE" -eq 200 ]; then
    exit 0
else
    exit 1
fi
