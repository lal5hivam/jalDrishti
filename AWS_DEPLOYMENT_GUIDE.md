# JalDrishti AWS Deployment Guide

## AWS Free Tier Capability Assessment

### ✅ What's Included in AWS Free Tier

**EC2 (Compute):**
- 750 hours/month of t2.micro instance (1 vCPU, 1GB RAM)
- Valid for 12 months from signup
- Sufficient for: Low to moderate traffic (100-500 concurrent users)

**Storage:**
- 30 GB of EBS storage (General Purpose SSD)
- 5 GB of S3 storage
- Sufficient for: Application + CSV data (~500 MB)

**Data Transfer:**
- 15 GB outbound data transfer per month
- 100 GB inbound data transfer
- Sufficient for: ~5,000-10,000 page views/month

**Elastic IP:**
- 1 Elastic IP (free when attached to running instance)

### 📊 Application Resource Requirements

**Current Application Size:**
```
App Code:           ~50 KB
CSV Data:           ~200 MB (compressed: ~50 MB)
Docker Image:       ~800 MB
Total Disk:         ~1.5 GB
Memory Usage:       ~400-600 MB (runtime)
CPU Usage:          Low (5-15% average)
```

**Verdict:** ✅ **Perfectly suited for AWS Free Tier**

---

## Deployment Options

### Option 1: EC2 with Docker (Recommended)

**Pros:**
- Full control over environment
- Easy to scale later
- Docker ensures consistency
- Simple deployment process

**Cons:**
- Requires basic Linux knowledge
- Manual SSL setup needed

**Cost:** FREE (within free tier limits)

---

### Option 2: AWS Lightsail

**Pros:**
- Simpler than EC2
- Fixed pricing
- Includes static IP
- Easy firewall management

**Cons:**
- Not part of free tier
- Minimum $3.50/month

**Cost:** $3.50-$5/month

---

### Option 3: AWS App Runner

**Pros:**
- Fully managed
- Auto-scaling
- Built-in load balancing

**Cons:**
- Not free tier eligible
- More expensive

**Cost:** ~$25-50/month

---

## Step-by-Step Deployment (EC2 + Docker)

### Prerequisites

1. **AWS Account** (with free tier)
2. **AWS CLI** installed locally
3. **SSH key pair** created in AWS
4. **Git** (optional, for version control)

---

### Step 1: Launch EC2 Instance

#### Using AWS Console:

1. **Login to AWS Console** → EC2 Dashboard

2. **Launch Instance:**
   - Name: `JalDrishti-App`
   - AMI: Amazon Linux 2023 (free tier eligible)
   - Instance Type: `t2.micro` (1 vCPU, 1GB RAM)
   - Key pair: Create new or select existing
   - Network: Default VPC
   - Storage: 8 GB gp3 (free tier: 30 GB available)

3. **Configure Security Group:**
   ```
   Inbound Rules:
   - SSH (22)         → Your IP
   - Custom TCP (8501) → 0.0.0.0/0 (Streamlit)
   - HTTP (80)        → 0.0.0.0/0 (optional)
   ```

4. **Launch Instance**

5. **Allocate Elastic IP:**
   - EC2 → Elastic IPs → Allocate
   - Associate with your instance

#### Using CloudFormation (Automated):

```bash
aws cloudformation create-stack \
  --stack-name jaldrishti-stack \
  --template-body file://aws-deployment/cloudformation-template.yaml \
  --parameters ParameterKey=KeyName,ParameterValue=your-key-name
```

---

### Step 2: Connect to EC2 Instance

```bash
# Make key file secure
chmod 400 jaldrishti-key.pem

# Connect via SSH
ssh -i jaldrishti-key.pem ec2-user@<ELASTIC_IP>
```

---

### Step 3: Install Docker on EC2

```bash
# Update system
sudo yum update -y

# Install Docker
sudo yum install -y docker

# Start Docker service
sudo service docker start

# Add ec2-user to docker group
sudo usermod -a -G docker ec2-user

# Enable Docker on boot
sudo systemctl enable docker

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version

# Logout and login again for group changes
exit
```

---

### Step 4: Deploy Application

#### Method A: Using Deployment Script (Recommended)

**On your local machine:**

```bash
# Make script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh <EC2_ELASTIC_IP> jaldrishti-key.pem
```

#### Method B: Manual Deployment

**On your local machine:**

```bash
# Create deployment package
tar -czf jaldrishti-deploy.tar.gz \
  app.py \
  requirements-prod.txt \
  Dockerfile \
  docker-compose.yml \
  .streamlit \
  output

# Upload to EC2
scp -i jaldrishti-key.pem jaldrishti-deploy.tar.gz ec2-user@<ELASTIC_IP>:~/
```

**On EC2 instance:**

```bash
# Extract files
mkdir -p ~/jaldrishti
cd ~/jaldrishti
tar -xzf ~/jaldrishti-deploy.tar.gz

# Build Docker image
docker-compose build

# Start application
docker-compose up -d

# Check status
docker-compose ps
docker-compose logs -f
```

---

### Step 5: Verify Deployment

1. **Check container status:**
   ```bash
   docker-compose ps
   ```

2. **View logs:**
   ```bash
   docker-compose logs -f
   ```

3. **Access application:**
   ```
   http://<ELASTIC_IP>:8501
   ```

4. **Test health endpoint:**
   ```bash
   curl http://localhost:8501/_stcore/health
   ```

---

## Post-Deployment Configuration

### 1. Setup Domain Name (Optional)

**Using Route 53:**

1. Register domain or use existing
2. Create hosted zone
3. Add A record pointing to Elastic IP
4. Update security group if needed

**Cost:** $12/year for .com domain

---

### 2. Setup SSL/HTTPS (Recommended)

**Using Nginx + Let's Encrypt:**

```bash
# Install Nginx
sudo yum install -y nginx

# Install Certbot
sudo yum install -y certbot python3-certbot-nginx

# Configure Nginx as reverse proxy
sudo nano /etc/nginx/conf.d/jaldrishti.conf
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:8501;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com
```

**Cost:** FREE

---

### 3. Setup Monitoring

**CloudWatch (Free Tier):**
- 10 custom metrics
- 10 alarms
- 1 million API requests

**Setup:**
```bash
# Install CloudWatch agent
wget https://s3.amazonaws.com/amazoncloudwatch-agent/amazon_linux/amd64/latest/amazon-cloudwatch-agent.rpm
sudo rpm -U ./amazon-cloudwatch-agent.rpm
```

---

### 4. Automated Backups

**Backup Script:**
```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/home/ec2-user/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup application data
tar -czf $BACKUP_DIR/jaldrishti_$DATE.tar.gz \
  ~/jaldrishti/output

# Keep only last 7 backups
ls -t $BACKUP_DIR/jaldrishti_*.tar.gz | tail -n +8 | xargs rm -f

echo "Backup completed: jaldrishti_$DATE.tar.gz"
```

**Setup Cron Job:**
```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /home/ec2-user/backup.sh
```

---

## Maintenance Commands

### Application Management

```bash
# View logs
docker-compose logs -f

# Restart application
docker-compose restart

# Stop application
docker-compose down

# Update application
docker-compose pull
docker-compose up -d

# Check resource usage
docker stats
```

### System Management

```bash
# Check disk space
df -h

# Check memory usage
free -h

# Check running processes
top

# System updates
sudo yum update -y
```

---

## Cost Optimization Tips

### 1. **Use Reserved Instances** (After free tier)
- Save up to 75% vs on-demand
- 1-year commitment: ~$5/month for t2.micro

### 2. **Enable Auto-Shutdown**
```bash
# Stop instance at night (if not 24/7 requirement)
# Add to crontab
0 22 * * * sudo shutdown -h now
```

### 3. **Compress Data**
```bash
# Compress CSV files
gzip output/*.csv

# Update app to read .gz files
```

### 4. **Use S3 for Static Data**
- Store CSV files in S3
- Load on-demand
- Cost: ~$0.023/GB/month

---

## Scaling Strategy

### Current Setup (Free Tier)
- **Capacity:** 100-500 concurrent users
- **Response Time:** < 2 seconds
- **Uptime:** 99%+

### When to Scale

**Upgrade to t3.small ($15/month) when:**
- Concurrent users > 500
- Memory usage > 80%
- Response time > 3 seconds

**Add Load Balancer when:**
- Need 99.9% uptime
- Traffic > 1000 concurrent users
- Multiple regions required

---

## Troubleshooting

### Issue: Application not accessible

**Check:**
```bash
# Security group allows port 8501
# Container is running
docker-compose ps

# Check logs
docker-compose logs

# Test locally
curl http://localhost:8501
```

### Issue: Out of memory

**Solution:**
```bash
# Add swap space
sudo dd if=/dev/zero of=/swapfile bs=1M count=1024
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make permanent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### Issue: Slow performance

**Solutions:**
1. Enable data caching in app
2. Compress CSV files
3. Use CDN for static assets
4. Upgrade to t3.small

---

## Security Best Practices

### 1. **Restrict SSH Access**
```bash
# Update security group
# Allow SSH only from your IP
```

### 2. **Regular Updates**
```bash
# Weekly updates
sudo yum update -y
docker-compose pull
```

### 3. **Enable CloudTrail**
- Track all API calls
- Free tier: 1 trail

### 4. **Use IAM Roles**
- Don't store credentials on EC2
- Attach IAM role to instance

### 5. **Enable VPC Flow Logs**
- Monitor network traffic
- Detect anomalies

---

## Monitoring & Alerts

### Setup CloudWatch Alarms

```bash
# CPU > 80%
aws cloudwatch put-metric-alarm \
  --alarm-name jaldrishti-high-cpu \
  --alarm-description "Alert when CPU exceeds 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/EC2 \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2

# Disk > 80%
aws cloudwatch put-metric-alarm \
  --alarm-name jaldrishti-high-disk \
  --alarm-description "Alert when disk exceeds 80%" \
  --metric-name DiskSpaceUtilization \
  --namespace System/Linux \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2
```

---

## Cost Estimation

### Free Tier (First 12 Months)
```
EC2 t2.micro:        $0/month (750 hours free)
EBS 8GB:             $0/month (30 GB free)
Data Transfer:       $0/month (15 GB free)
Elastic IP:          $0/month (when attached)
-------------------------------------------
Total:               $0/month
```

### After Free Tier
```
EC2 t2.micro:        $8.50/month
EBS 8GB:             $0.80/month
Data Transfer:       $1-5/month (depends on traffic)
Elastic IP:          $0/month (when attached)
Domain (optional):   $1/month
-------------------------------------------
Total:               $10-15/month
```

### With SSL + Monitoring
```
Base cost:           $10-15/month
CloudWatch:          $0/month (free tier)
Route 53:            $0.50/month
SSL Certificate:     $0/month (Let's Encrypt)
-------------------------------------------
Total:               $10.50-15.50/month
```

---

## Performance Benchmarks

### Expected Performance (t2.micro)

| Metric | Value |
|--------|-------|
| Concurrent Users | 100-500 |
| Page Load Time | 1-2 seconds |
| Data Load Time | 2-3 seconds |
| Memory Usage | 400-600 MB |
| CPU Usage | 5-15% average |
| Uptime | 99%+ |

### Load Testing Results

```bash
# Install Apache Bench
sudo yum install -y httpd-tools

# Test with 100 concurrent users
ab -n 1000 -c 100 http://<ELASTIC_IP>:8501/
```

**Expected Results:**
- Requests/sec: 50-100
- Time per request: 10-20ms
- Failed requests: 0

---

## Backup & Disaster Recovery

### Automated Snapshots

```bash
# Create snapshot script
cat > ~/create-snapshot.sh << 'EOF'
#!/bin/bash
INSTANCE_ID=$(ec2-metadata --instance-id | cut -d " " -f 2)
VOLUME_ID=$(aws ec2 describe-instances --instance-ids $INSTANCE_ID --query 'Reservations[0].Instances[0].BlockDeviceMappings[0].Ebs.VolumeId' --output text)
aws ec2 create-snapshot --volume-id $VOLUME_ID --description "JalDrishti backup $(date +%Y%m%d)"
EOF

chmod +x ~/create-snapshot.sh

# Schedule weekly snapshots
crontab -e
# Add: 0 3 * * 0 ~/create-snapshot.sh
```

---

## Next Steps

1. ✅ Deploy application to EC2
2. ✅ Test functionality
3. ⬜ Setup domain name (optional)
4. ⬜ Configure SSL/HTTPS
5. ⬜ Setup monitoring & alerts
6. ⬜ Configure automated backups
7. ⬜ Load testing
8. ⬜ Documentation for users

---

## Support & Resources

- **AWS Free Tier:** https://aws.amazon.com/free/
- **EC2 Documentation:** https://docs.aws.amazon.com/ec2/
- **Streamlit Deployment:** https://docs.streamlit.io/deploy
- **Docker Documentation:** https://docs.docker.com/

---

## Quick Reference

### Essential Commands

```bash
# SSH to instance
ssh -i key.pem ec2-user@<IP>

# Deploy application
./deploy.sh <IP> key.pem

# View logs
docker-compose logs -f

# Restart app
docker-compose restart

# Check status
docker-compose ps

# System resources
htop
df -h
free -h
```

---

**Version:** 1.0.0  
**Last Updated:** 2024  
**Status:** Production Ready ✅
