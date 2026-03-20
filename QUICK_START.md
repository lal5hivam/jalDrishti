# JalDrishti - Quick Start Guide

## 🚀 5-Minute Deployment to AWS

### Prerequisites
- AWS Account (free tier eligible)
- SSH key pair created in AWS
- Basic terminal knowledge

---

## Option 1: Automated Deployment (Recommended)

### Step 1: Prepare Your Machine
```bash
# Install AWS CLI (if not installed)
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configure AWS credentials
aws configure
```

### Step 2: Launch EC2 Instance
```bash
# Using CloudFormation (automated)
aws cloudformation create-stack \
  --stack-name jaldrishti \
  --template-body file://aws-deployment/cloudformation-template.yaml \
  --parameters ParameterKey=KeyName,ParameterValue=YOUR_KEY_NAME

# Wait for stack creation (5-10 minutes)
aws cloudformation wait stack-create-complete --stack-name jaldrishti

# Get instance IP
aws cloudformation describe-stacks \
  --stack-name jaldrishti \
  --query 'Stacks[0].Outputs[?OutputKey==`ElasticIP`].OutputValue' \
  --output text
```

### Step 3: Deploy Application
```bash
# Make deploy script executable
chmod +x deploy.sh

# Deploy (replace with your IP and key file)
./deploy.sh <ELASTIC_IP> your-key.pem
```

### Step 4: Access Application
```
Open browser: http://<ELASTIC_IP>:8501
```

**Done! ✅ Your app is live in ~10 minutes**

---

## Option 2: Manual Deployment

### Step 1: Launch EC2 Instance

1. **AWS Console** → EC2 → Launch Instance
2. **Settings:**
   - Name: `JalDrishti`
   - AMI: Amazon Linux 2023
   - Instance Type: `t2.micro`
   - Key pair: Select or create
   - Security Group: Allow ports 22, 8501

3. **Launch** and note the Public IP

### Step 2: Connect to Instance
```bash
chmod 400 your-key.pem
ssh -i your-key.pem ec2-user@<PUBLIC_IP>
```

### Step 3: Install Docker
```bash
# Update system
sudo yum update -y

# Install Docker
sudo yum install -y docker
sudo service docker start
sudo usermod -a -G docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login again
exit
```

### Step 4: Upload Application
```bash
# On your local machine
tar -czf jaldrishti.tar.gz app.py requirements-prod.txt Dockerfile docker-compose.yml .streamlit output

scp -i your-key.pem jaldrishti.tar.gz ec2-user@<PUBLIC_IP>:~/
```

### Step 5: Deploy
```bash
# SSH back to instance
ssh -i your-key.pem ec2-user@<PUBLIC_IP>

# Extract and deploy
mkdir jaldrishti && cd jaldrishti
tar -xzf ~/jaldrishti.tar.gz
docker-compose build
docker-compose up -d

# Check status
docker-compose ps
```

### Step 6: Access
```
http://<PUBLIC_IP>:8501
```

---

## Option 3: Local Testing (Before AWS)

### Using Docker
```bash
# Build image
docker-compose build

# Run container
docker-compose up -d

# Access
http://localhost:8501

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Without Docker
```bash
# Install dependencies
pip install -r requirements-prod.txt

# Run application
streamlit run app.py

# Access
http://localhost:8501
```

---

## Verification Checklist

After deployment, verify:

- [ ] Application loads at http://<IP>:8501
- [ ] All 6 pages accessible (Overview, GAVI, Alerts, Geographic, Forecasting, Station)
- [ ] Charts render correctly
- [ ] Filters work (state selection, year range)
- [ ] No errors in logs: `docker-compose logs`
- [ ] Health check passes: `curl http://localhost:8501/_stcore/health`

---

## Common Issues & Solutions

### Issue: Can't connect to instance
```bash
# Check security group allows port 8501
# Verify instance is running
aws ec2 describe-instances --instance-ids <INSTANCE_ID>
```

### Issue: Application not starting
```bash
# Check logs
docker-compose logs -f

# Restart container
docker-compose restart

# Rebuild if needed
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Issue: Out of memory
```bash
# Add swap space
sudo dd if=/dev/zero of=/swapfile bs=1M count=1024
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

---

## Essential Commands

### Application Management
```bash
# View logs
docker-compose logs -f

# Restart
docker-compose restart

# Stop
docker-compose down

# Update
git pull
docker-compose build
docker-compose up -d
```

### System Monitoring
```bash
# Resource usage
docker stats

# Disk space
df -h

# Memory
free -h

# Processes
top
```

---

## Next Steps

1. ✅ Application deployed
2. ⬜ Setup domain name (optional)
3. ⬜ Configure SSL/HTTPS
4. ⬜ Setup monitoring
5. ⬜ Configure backups

See [AWS_DEPLOYMENT_GUIDE.md](AWS_DEPLOYMENT_GUIDE.md) for detailed instructions.

---

## Cost Tracking

### Monitor Your Usage
```bash
# Setup billing alarm
aws cloudwatch put-metric-alarm \
  --alarm-name billing-alarm \
  --alarm-description "Alert when charges exceed $1" \
  --metric-name EstimatedCharges \
  --namespace AWS/Billing \
  --statistic Maximum \
  --period 21600 \
  --threshold 1 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 1
```

### Expected Costs
- **Year 1:** $0/month (free tier)
- **Year 2+:** $10-15/month

---

## Support

- **Documentation:** See [AWS_DEPLOYMENT_GUIDE.md](AWS_DEPLOYMENT_GUIDE.md)
- **Capability Assessment:** See [CAPABILITY_ASSESSMENT.md](CAPABILITY_ASSESSMENT.md)
- **AWS Free Tier:** https://aws.amazon.com/free/

---

**Ready to deploy? Start with Option 1 above! 🚀**
