# JalDrishti - Production Deployment Package

## 📦 Package Contents

```
jaldrishti/
├── app.py                              # Main Streamlit application
├── requirements.txt                    # Development dependencies
├── requirements-prod.txt               # Production dependencies (optimized)
├── Dockerfile                          # Docker image configuration
├── docker-compose.yml                  # Docker Compose orchestration
├── .dockerignore                       # Docker build exclusions
├── .gitignore                          # Git exclusions
├── .streamlit/
│   └── config.toml                     # Streamlit configuration
├── output/                             # CSV data files (~200 MB)
│   ├── groundwater_gavi_alerts_2015_2024.csv
│   ├── district_stress_summary.csv
│   ├── state_alert_summary.csv
│   └── groundwater_forecast_gavi_alerts.csv
├── aws-deployment/
│   ├── cloudformation-template.yaml    # AWS CloudFormation template
│   └── ec2-user-data.sh               # EC2 initialization script
├── monitoring/
│   ├── health-check.sh                 # Health check script
│   └── setup-monitoring.sh             # Monitoring setup script
├── deploy.sh                           # Automated deployment script
├── run_app.bat                         # Windows launcher
├── README.md                           # Main project documentation
├── AWS_DEPLOYMENT_GUIDE.md             # Detailed AWS deployment guide
├── CAPABILITY_ASSESSMENT.md            # AWS Free Tier capability analysis
├── QUICK_START.md                      # 5-minute deployment guide
├── PRODUCTION_CHECKLIST.md             # Pre/post deployment checklist
└── DEPLOYMENT_README.md                # This file
```

---

## 🎯 Deployment Options

### 1. AWS EC2 (Recommended for Production)
- **Cost:** FREE (12 months), then $10-15/month
- **Setup Time:** 10-15 minutes
- **Scalability:** Excellent
- **Control:** Full

**Quick Start:**
```bash
./deploy.sh <EC2_IP> your-key.pem
```

See: [QUICK_START.md](QUICK_START.md)

---

### 2. Local Docker (Development/Testing)
- **Cost:** FREE
- **Setup Time:** 5 minutes
- **Use Case:** Testing before production

**Quick Start:**
```bash
docker-compose up -d
```

Access: http://localhost:8501

---

### 3. Streamlit Cloud (Easiest)
- **Cost:** FREE (1 app)
- **Setup Time:** 5 minutes
- **Limitations:** 1GB RAM, limited resources

**Quick Start:**
1. Push code to GitHub
2. Go to share.streamlit.io
3. Connect repository
4. Deploy!

---

## 📊 System Requirements

### Minimum (Development)
- CPU: 1 core
- RAM: 512 MB
- Disk: 2 GB
- OS: Any (Windows/Linux/Mac)

### Recommended (Production)
- CPU: 1 vCPU (t2.micro)
- RAM: 1 GB
- Disk: 8 GB
- OS: Amazon Linux 2023 / Ubuntu 22.04

### Optimal (High Traffic)
- CPU: 2 vCPUs (t3.small)
- RAM: 2 GB
- Disk: 20 GB
- OS: Amazon Linux 2023

---

## 🚀 Quick Deployment

### Option A: Automated (AWS)
```bash
# 1. Configure AWS CLI
aws configure

# 2. Deploy with CloudFormation
aws cloudformation create-stack \
  --stack-name jaldrishti \
  --template-body file://aws-deployment/cloudformation-template.yaml \
  --parameters ParameterKey=KeyName,ParameterValue=your-key

# 3. Get IP address
aws cloudformation describe-stacks \
  --stack-name jaldrishti \
  --query 'Stacks[0].Outputs[?OutputKey==`ElasticIP`].OutputValue' \
  --output text

# 4. Deploy application
./deploy.sh <ELASTIC_IP> your-key.pem
```

### Option B: Manual (AWS)
```bash
# 1. Launch EC2 t2.micro instance
# 2. SSH to instance
ssh -i key.pem ec2-user@<IP>

# 3. Install Docker
sudo yum update -y
sudo yum install -y docker
sudo service docker start
sudo usermod -a -G docker ec2-user

# 4. Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 5. Upload and deploy
# (On local machine)
tar -czf jaldrishti.tar.gz app.py requirements-prod.txt Dockerfile docker-compose.yml .streamlit output
scp -i key.pem jaldrishti.tar.gz ec2-user@<IP>:~/

# (On EC2)
mkdir jaldrishti && cd jaldrishti
tar -xzf ~/jaldrishti.tar.gz
docker-compose build
docker-compose up -d
```

### Option C: Local Testing
```bash
# Using Docker
docker-compose up -d

# Without Docker
pip install -r requirements-prod.txt
streamlit run app.py
```

---

## 📋 Pre-Deployment Checklist

### AWS Account Setup
- [ ] AWS account created (free tier eligible)
- [ ] AWS CLI installed and configured
- [ ] EC2 key pair created
- [ ] Billing alerts configured

### Application Preparation
- [x] Code tested locally
- [x] Docker image builds successfully
- [x] All dependencies listed
- [x] Configuration files ready
- [ ] CSV data files prepared

### Security
- [ ] Security group rules defined
- [ ] SSH key secured (chmod 400)
- [ ] Secrets not in code
- [ ] .gitignore configured

---

## 🔧 Configuration

### Environment Variables (Optional)
```bash
# Create .env file
cat > .env << EOF
STREAMLIT_SERVER_PORT=8501
STREAMLIT_SERVER_ADDRESS=0.0.0.0
STREAMLIT_SERVER_HEADLESS=true
STREAMLIT_BROWSER_GATHER_USAGE_STATS=false
EOF
```

### Streamlit Configuration
Edit `.streamlit/config.toml`:
```toml
[server]
port = 8501
address = "0.0.0.0"
headless = true

[browser]
gatherUsageStats = false
```

### Docker Configuration
Edit `docker-compose.yml` for custom settings:
```yaml
services:
  jaldrishti:
    ports:
      - "8080:8501"  # Change external port
    environment:
      - CUSTOM_VAR=value
```

---

## 📈 Monitoring & Maintenance

### Setup Monitoring
```bash
# On EC2 instance
cd ~/jaldrishti
chmod +x monitoring/setup-monitoring.sh
./monitoring/setup-monitoring.sh
```

### Health Checks
```bash
# Manual health check
./monitoring/health-check.sh

# View logs
docker-compose logs -f

# Check container status
docker-compose ps
```

### Regular Maintenance
```bash
# Update application
git pull
docker-compose build
docker-compose up -d

# View resource usage
docker stats

# Clean up old images
docker system prune -a
```

---

## 🔒 Security Best Practices

### 1. Secure SSH Access
```bash
# Restrict SSH to your IP
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxx \
  --protocol tcp \
  --port 22 \
  --cidr YOUR_IP/32
```

### 2. Enable HTTPS
```bash
# Install Nginx
sudo yum install -y nginx

# Install Certbot
sudo yum install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com
```

### 3. Regular Updates
```bash
# System updates
sudo yum update -y

# Docker updates
docker-compose pull
docker-compose up -d
```

### 4. Firewall Rules
```bash
# Allow only necessary ports
# 22 (SSH), 8501 (Streamlit), 80 (HTTP), 443 (HTTPS)
```

---

## 💰 Cost Management

### Free Tier (First 12 Months)
```
EC2 t2.micro:     750 hours/month (FREE)
EBS 8GB:          30 GB free
Data Transfer:    15 GB outbound free
Elastic IP:       FREE (when attached)
──────────────────────────────────────
Total:            $0/month
```

### Post Free Tier
```
EC2 t2.micro:     $8.50/month
EBS 8GB:          $0.80/month
Data Transfer:    $1-5/month
──────────────────────────────────────
Total:            $10-15/month
```

### Cost Optimization Tips
1. Stop instance when not needed
2. Use Reserved Instances (save 75%)
3. Enable CloudWatch billing alarms
4. Compress data files
5. Use S3 for large static files

---

## 🐛 Troubleshooting

### Application Won't Start
```bash
# Check logs
docker-compose logs -f

# Rebuild container
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Check disk space
df -h

# Check memory
free -h
```

### Can't Connect to Application
```bash
# Check security group allows port 8501
# Verify container is running
docker-compose ps

# Test locally
curl http://localhost:8501

# Check firewall
sudo iptables -L
```

### Out of Memory
```bash
# Add swap space
sudo dd if=/dev/zero of=/swapfile bs=1M count=1024
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make permanent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### Slow Performance
```bash
# Check resource usage
docker stats

# Optimize data loading
# Compress CSV files
gzip output/*.csv

# Upgrade instance type
# t2.micro → t3.small
```

---

## 📚 Documentation

### Essential Guides
1. **[QUICK_START.md](QUICK_START.md)** - 5-minute deployment
2. **[AWS_DEPLOYMENT_GUIDE.md](AWS_DEPLOYMENT_GUIDE.md)** - Detailed AWS guide
3. **[CAPABILITY_ASSESSMENT.md](CAPABILITY_ASSESSMENT.md)** - Resource analysis
4. **[PRODUCTION_CHECKLIST.md](PRODUCTION_CHECKLIST.md)** - Deployment checklist

### Additional Resources
- AWS Free Tier: https://aws.amazon.com/free/
- Streamlit Docs: https://docs.streamlit.io/
- Docker Docs: https://docs.docker.com/

---

## 🆘 Support

### Common Issues
- **Port 8501 blocked:** Check security group
- **Out of memory:** Add swap space
- **Slow loading:** Enable caching, compress data
- **Container crashes:** Check logs, increase memory

### Getting Help
1. Check troubleshooting section above
2. Review logs: `docker-compose logs -f`
3. Check AWS CloudWatch metrics
4. Review documentation

---

## 📝 Version History

### v1.0.0 (Current)
- Initial production release
- AWS Free Tier optimized
- Docker containerization
- Automated deployment scripts
- Comprehensive monitoring
- Full documentation

---

## 🎯 Next Steps

After successful deployment:

1. ✅ Verify application is accessible
2. ⬜ Setup domain name (optional)
3. ⬜ Configure SSL/HTTPS
4. ⬜ Setup monitoring and alerts
5. ⬜ Configure automated backups
6. ⬜ Load testing
7. ⬜ User acceptance testing

---

## 📞 Quick Reference

### Essential Commands
```bash
# Deploy
./deploy.sh <IP> key.pem

# SSH
ssh -i key.pem ec2-user@<IP>

# Logs
docker-compose logs -f

# Restart
docker-compose restart

# Stop
docker-compose down

# Status
docker-compose ps

# Health check
./monitoring/health-check.sh
```

### Essential URLs
```
Application:    http://<IP>:8501
Health Check:   http://<IP>:8501/_stcore/health
AWS Console:    https://console.aws.amazon.com
```

---

**Ready to deploy? Start with [QUICK_START.md](QUICK_START.md)!** 🚀

---

**Package Version:** 1.0.0  
**Last Updated:** 2024  
**Status:** Production Ready ✅
