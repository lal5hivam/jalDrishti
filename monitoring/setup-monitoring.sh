#!/bin/bash
# Setup monitoring for JalDrishti on EC2

set -e

echo "=========================================="
echo "Setting up monitoring for JalDrishti"
echo "=========================================="

# Create log directory
sudo mkdir -p /var/log/jaldrishti
sudo chown ec2-user:ec2-user /var/log/jaldrishti

# Make health check script executable
chmod +x ~/jaldrishti/monitoring/health-check.sh

# Setup cron job for health checks (every 5 minutes)
echo "Setting up cron job for health checks..."
(crontab -l 2>/dev/null; echo "*/5 * * * * ~/jaldrishti/monitoring/health-check.sh >> /var/log/jaldrishti/health-check.log 2>&1") | crontab -

# Setup log rotation
echo "Configuring log rotation..."
sudo tee /etc/logrotate.d/jaldrishti > /dev/null <<EOF
/var/log/jaldrishti/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 0644 ec2-user ec2-user
}
EOF

# Install CloudWatch agent (optional)
echo "Installing CloudWatch agent..."
wget https://s3.amazonaws.com/amazoncloudwatch-agent/amazon_linux/amd64/latest/amazon-cloudwatch-agent.rpm
sudo rpm -U ./amazon-cloudwatch-agent.rpm
rm amazon-cloudwatch-agent.rpm

# Create CloudWatch config
sudo tee /opt/aws/amazon-cloudwatch-agent/etc/config.json > /dev/null <<EOF
{
  "metrics": {
    "namespace": "JalDrishti",
    "metrics_collected": {
      "mem": {
        "measurement": [
          {
            "name": "mem_used_percent",
            "rename": "MemoryUsage",
            "unit": "Percent"
          }
        ],
        "metrics_collection_interval": 60
      },
      "disk": {
        "measurement": [
          {
            "name": "used_percent",
            "rename": "DiskUsage",
            "unit": "Percent"
          }
        ],
        "metrics_collection_interval": 60,
        "resources": [
          "/"
        ]
      }
    }
  },
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/var/log/jaldrishti/health-check.log",
            "log_group_name": "/jaldrishti/health-check",
            "log_stream_name": "{instance_id}"
          }
        ]
      }
    }
  }
}
EOF

# Start CloudWatch agent
echo "Starting CloudWatch agent..."
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
    -a fetch-config \
    -m ec2 \
    -s \
    -c file:/opt/aws/amazon-cloudwatch-agent/etc/config.json

echo ""
echo "=========================================="
echo "Monitoring setup complete!"
echo "=========================================="
echo ""
echo "Health checks will run every 5 minutes"
echo "Logs: /var/log/jaldrishti/health-check.log"
echo ""
echo "To run health check manually:"
echo "  ~/jaldrishti/monitoring/health-check.sh"
echo ""
echo "To view cron jobs:"
echo "  crontab -l"
