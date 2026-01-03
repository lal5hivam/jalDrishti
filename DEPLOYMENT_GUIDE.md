# 🚀 JalDrishti API - Deployment Guide

Complete guide for deploying the JalDrishti Groundwater Intelligence API to production.

---

## 📋 Pre-Deployment Checklist

- [ ] All CSV files present in `output/` directory
- [ ] Virtual environment created and tested locally
- [ ] API tested via `/docs` interface
- [ ] Example endpoints return valid responses
- [ ] Requirements.txt is up to date
- [ ] Documentation reviewed and accurate

---

## 🖥️ Local Development Setup

### Windows

```bash
# 1. Navigate to project
cd C:\Users\lsing\Desktop\tabula

# 2. Run quick start script
start_api.bat

# 3. Test API
# Open browser: http://localhost:8000/docs
```

### Linux/macOS

```bash
# 1. Navigate to project
cd ~/tabula

# 2. Make script executable
chmod +x start_api.sh

# 3. Run quick start script
./start_api.sh

# 4. Test API
# Open browser: http://localhost:8000/docs
```

---

## 🌐 Production Deployment Options

### Option 1: Traditional Server (Linux)

#### Requirements
- Ubuntu 20.04+ or similar
- Python 3.9+
- Systemd for service management
- Nginx for reverse proxy (optional)

#### Steps

**1. Server Setup**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python and dependencies
sudo apt install python3.9 python3.9-venv python3-pip nginx -y

# Create deployment user (optional)
sudo useradd -m -s /bin/bash jaldrishti
sudo su - jaldrishti
```

**2. Deploy Application**
```bash
# Clone/copy project files
cd /home/jaldrishti
# (Upload your project files here)

# Create virtual environment
python3.9 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Install gunicorn for production
pip install gunicorn
```

**3. Create Systemd Service**
```bash
sudo nano /etc/systemd/system/jaldrishti-api.service
```

Add this content:
```ini
[Unit]
Description=JalDrishti Groundwater API
After=network.target

[Service]
Type=notify
User=jaldrishti
Group=jaldrishti
WorkingDirectory=/home/jaldrishti/tabula
Environment="PATH=/home/jaldrishti/tabula/venv/bin"
ExecStart=/home/jaldrishti/tabula/venv/bin/gunicorn \
    app.main:app \
    --workers 4 \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 0.0.0.0:8000 \
    --access-logfile /var/log/jaldrishti/access.log \
    --error-logfile /var/log/jaldrishti/error.log
Restart=always

[Install]
WantedBy=multi-user.target
```

**4. Create Log Directory**
```bash
sudo mkdir -p /var/log/jaldrishti
sudo chown jaldrishti:jaldrishti /var/log/jaldrishti
```

**5. Start Service**
```bash
sudo systemctl daemon-reload
sudo systemctl enable jaldrishti-api
sudo systemctl start jaldrishti-api
sudo systemctl status jaldrishti-api
```

**6. Configure Nginx (Optional)**
```bash
sudo nano /etc/nginx/sites-available/jaldrishti
```

Add:
```nginx
server {
    listen 80;
    server_name api.jaldrishti.in;  # Your domain

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/jaldrishti /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

**7. SSL Certificate (Let's Encrypt)**
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d api.jaldrishti.in
```

---

### Option 2: Docker Deployment

#### Create Dockerfile
```dockerfile
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first (for caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir gunicorn

# Copy application code
COPY app/ ./app/
COPY output/ ./output/

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/health')"

# Run with gunicorn
CMD ["gunicorn", "app.main:app", \
     "--workers", "4", \
     "--worker-class", "uvicorn.workers.UvicornWorker", \
     "--bind", "0.0.0.0:8000", \
     "--access-logfile", "-", \
     "--error-logfile", "-"]
```

#### Create docker-compose.yml
```yaml
version: '3.8'

services:
  api:
    build: .
    image: jaldrishti-api:latest
    container_name: jaldrishti-api
    ports:
      - "8000:8000"
    environment:
      - LATEST_YEAR=2024
    volumes:
      - ./output:/app/output:ro  # Read-only data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

#### Build and Run
```bash
# Build image
docker build -t jaldrishti-api:latest .

# Run container
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop
docker-compose down
```

---

### Option 3: Cloud Platforms

#### 🔹 **Heroku**

**1. Create Procfile**
```
web: gunicorn app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT
```

**2. Create runtime.txt**
```
python-3.11.0
```

**3. Deploy**
```bash
# Install Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login
heroku login

# Create app
heroku create jaldrishti-api

# Deploy
git add .
git commit -m "Deploy to Heroku"
git push heroku master

# Open
heroku open
```

---

#### 🔹 **AWS Lambda + API Gateway**

**1. Install Mangum**
```bash
pip install mangum
```

**2. Modify app/main.py**
```python
from mangum import Mangum

# ... existing code ...

# Add at the end
handler = Mangum(app)
```

**3. Create deployment package**
```bash
pip install -t ./package -r requirements.txt
cd package
zip -r ../deployment.zip .
cd ..
zip -g deployment.zip app/ output/
```

**4. Deploy to Lambda**
- Create Lambda function (Python 3.9+)
- Upload deployment.zip
- Set handler: `app.main.handler`
- Set timeout: 30 seconds
- Set memory: 1024 MB
- Create API Gateway trigger

---

#### 🔹 **Google Cloud Run**

**1. Install gcloud CLI**
```bash
# https://cloud.google.com/sdk/docs/install
```

**2. Build and deploy**
```bash
# Authenticate
gcloud auth login

# Set project
gcloud config set project YOUR_PROJECT_ID

# Deploy
gcloud run deploy jaldrishti-api \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 2
```

---

#### 🔹 **Azure App Service**

**1. Install Azure CLI**
```bash
# https://docs.microsoft.com/en-us/cli/azure/install-azure-cli
```

**2. Deploy**
```bash
# Login
az login

# Create resource group
az group create --name jaldrishti-rg --location eastus

# Create app service plan
az appservice plan create \
  --name jaldrishti-plan \
  --resource-group jaldrishti-rg \
  --sku B1 \
  --is-linux

# Create web app
az webapp create \
  --resource-group jaldrishti-rg \
  --plan jaldrishti-plan \
  --name jaldrishti-api \
  --runtime "PYTHON|3.11"

# Deploy code
az webapp up \
  --resource-group jaldrishti-rg \
  --name jaldrishti-api
```

---

## 🔧 Environment Configuration

### Production Settings

Create `.env` file (optional):
```bash
# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
API_ENV=production

# Data Configuration
DATA_DIR=/app/output
LATEST_YEAR=2024

# CORS
ALLOWED_ORIGINS=https://dashboard.jaldrishti.in,https://app.jaldrishti.in

# Logging
LOG_LEVEL=INFO
```

### Load Environment Variables

Modify `app/config.py`:
```python
from os import getenv

class Settings:
    API_ENV = getenv("API_ENV", "development")
    DATA_DIR = Path(getenv("DATA_DIR", BASE_DIR / "output"))
    LATEST_YEAR = int(getenv("LATEST_YEAR", 2024))
    ALLOWED_ORIGINS = getenv("ALLOWED_ORIGINS", "*").split(",")
```

---

## 📊 Monitoring & Logging

### Application Logs

**View logs (systemd)**
```bash
journalctl -u jaldrishti-api -f
```

**View logs (Docker)**
```bash
docker logs -f jaldrishti-api
```

### Health Monitoring

**Endpoint:** `GET /health`

**Monitoring Script**
```bash
#!/bin/bash
while true; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health)
    if [ $STATUS -ne 200 ]; then
        echo "API DOWN! Status: $STATUS"
        # Send alert (email, Slack, etc.)
    fi
    sleep 60
done
```

### Performance Monitoring

Use tools like:
- **New Relic**: APM monitoring
- **DataDog**: Infrastructure monitoring
- **Prometheus + Grafana**: Custom metrics

---

## 🔐 Security Best Practices

### 1. Firewall Configuration
```bash
# Allow only HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 2. Rate Limiting (Nginx)
```nginx
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

server {
    location / {
        limit_req zone=api_limit burst=20 nodelay;
        proxy_pass http://127.0.0.1:8000;
    }
}
```

### 3. API Key Authentication (Future)
```python
# Add to app/main.py
from fastapi.security import APIKeyHeader

api_key_header = APIKeyHeader(name="X-API-Key")

@app.get("/api/protected")
async def protected(api_key: str = Depends(api_key_header)):
    if api_key != settings.API_KEY:
        raise HTTPException(403, "Invalid API key")
    return {"data": "protected"}
```

---

## 🧪 Post-Deployment Testing

### 1. Health Check
```bash
curl https://api.jaldrishti.in/health
```

### 2. Load Testing
```bash
# Install Apache Bench
sudo apt install apache2-utils

# Test with 1000 requests, 10 concurrent
ab -n 1000 -c 10 https://api.jaldrishti.in/api/summary/national
```

### 3. Integration Testing
```python
import requests

BASE_URL = "https://api.jaldrishti.in"

def test_endpoints():
    endpoints = [
        "/api/summary/national",
        "/api/summary/districts",
        "/api/summary/states",
        "/api/alerts/critical"
    ]
    
    for endpoint in endpoints:
        response = requests.get(f"{BASE_URL}{endpoint}")
        assert response.status_code == 200, f"Failed: {endpoint}"
        print(f"✓ {endpoint}")

test_endpoints()
```

---

## 🔄 Updates & Maintenance

### Update Data
```bash
# 1. Generate new CSVs from Jupyter notebooks
# 2. Copy to server
scp output/*.csv user@server:/home/jaldrishti/tabula/output/

# 3. Restart service
sudo systemctl restart jaldrishti-api
```

### Update Code
```bash
# 1. Pull latest code
git pull origin main

# 2. Install dependencies
source venv/bin/activate
pip install -r requirements.txt

# 3. Restart service
sudo systemctl restart jaldrishti-api
```

---

## 📈 Performance Optimization

### 1. Increase Workers
```bash
# Edit systemd service
--workers 8  # Match CPU cores
```

### 2. Enable Caching Headers
```python
from fastapi.responses import JSONResponse

@app.middleware("http")
async def add_cache_headers(request, call_next):
    response = await call_next(request)
    response.headers["Cache-Control"] = "public, max-age=300"
    return response
```

### 3. Use CDN
- CloudFlare
- AWS CloudFront
- Azure CDN

---

## 🆘 Troubleshooting

### Issue: Service won't start
```bash
# Check logs
sudo journalctl -u jaldrishti-api -n 50

# Check permissions
ls -la /home/jaldrishti/tabula

# Test manually
source venv/bin/activate
python -m app.main
```

### Issue: High memory usage
- Reduce workers
- Optimize data loading
- Consider database for large datasets

### Issue: Slow responses
- Check data file sizes
- Enable response compression
- Use caching layer (Redis)

---

## 📞 Support Resources

- **FastAPI Docs**: https://fastapi.tiangolo.com/deployment/
- **Gunicorn Docs**: https://docs.gunicorn.org/
- **Nginx Docs**: https://nginx.org/en/docs/
- **Docker Docs**: https://docs.docker.com/

---

**Remember:** Always test in staging environment before production deployment!

**Monitoring is critical:** Set up alerts for API downtime and errors.

🎯 **Goal:** 99.9% uptime, <100ms response time, secure and scalable!
