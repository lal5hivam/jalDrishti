# 🚀 JalDrishti - Deployment Guide

Complete guide for deploying JalDrishti to production environments.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Deployment Options](#deployment-options)
3. [Docker Deployment](#docker-deployment-recommended)
4. [Manual Deployment](#manual-deployment)
5. [Cloud Platforms](#cloud-platforms)
6. [Environment Configuration](#environment-configuration)
7. [SSL/HTTPS Setup](#sslhttps-setup)
8. [Monitoring & Logging](#monitoring--logging)
9. [Troubleshooting](#troubleshooting)

---

## 📦 Prerequisites

### For Docker Deployment
- Docker 20.10+
- Docker Compose 2.0+
- 2GB RAM minimum
- 5GB disk space

### For Manual Deployment
- Python 3.9+
- Node.js 18+
- npm 9+
- 2GB RAM minimum

---

## 🎯 Deployment Options

| Option | Best For | Complexity |
|--------|----------|------------|
| **Docker Compose** | Quick deployment, VPS | ⭐ Easy |
| **Docker + Nginx** | Production with SSL | ⭐⭐ Medium |
| **Kubernetes** | Enterprise, scaling | ⭐⭐⭐ Advanced |
| **Manual** | Development, testing | ⭐⭐ Medium |
| **Cloud PaaS** | Managed infrastructure | ⭐ Easy |

---

## 🐳 Docker Deployment (Recommended)

### Quick Start

```bash
# Clone the repository
git clone <repo-url>
cd tabula

# Deploy with one command
./deploy.sh prod       # Linux/macOS
deploy.bat prod        # Windows
```

### Development Mode

```bash
./deploy.sh dev        # Linux/macOS
deploy.bat dev         # Windows
```

### Step-by-Step Docker Setup

#### 1. Build Images

```bash
# Build backend
docker build -t jaldrishti-api:latest .

# Build frontend
docker build -t jaldrishti-frontend:latest ./frontend
```

#### 2. Run with Docker Compose

```bash
# Development (without nginx)
docker compose -f docker-compose.dev.yml up -d

# Production (with nginx)
docker compose -f docker-compose.yml --profile production up -d

# View logs
docker compose logs -f

# Stop services
docker compose down
```

#### 3. Access Points

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |
| Nginx (prod) | http://localhost:80 |

### Docker Compose Files

| File | Purpose |
|------|---------|
| `docker-compose.yml` | Production deployment |
| `docker-compose.dev.yml` | Development deployment |
| `Dockerfile` | Backend image |
| `frontend/Dockerfile` | Frontend image |

---

## 🔧 Manual Deployment

### Backend API

```bash
cd tabula

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/macOS
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Production server with Gunicorn
pip install gunicorn
gunicorn app.main:app \
    --workers 4 \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 0.0.0.0:8000 \
    --access-logfile - \
    --error-logfile -
```

### Frontend Dashboard

```bash
cd frontend

# Install dependencies
npm ci

# Build for production
npm run build

# Start production server
npm start
```

### Systemd Service (Linux)

Create `/etc/systemd/system/jaldrishti-api.service`:

```ini
[Unit]
Description=JalDrishti API
After=network.target

[Service]
Type=notify
User=www-data
Group=www-data
WorkingDirectory=/opt/jaldrishti
Environment="PATH=/opt/jaldrishti/venv/bin"
ExecStart=/opt/jaldrishti/venv/bin/gunicorn app.main:app \
    --workers 4 \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 0.0.0.0:8000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable jaldrishti-api
sudo systemctl start jaldrishti-api
sudo systemctl status jaldrishti-api
```

---

## ☁️ Cloud Platforms

### AWS (EC2 + Docker)

```bash
# Connect to EC2
ssh -i key.pem ubuntu@your-ec2-ip

# Install Docker
sudo apt update
sudo apt install docker.io docker-compose-plugin -y
sudo usermod -aG docker $USER

# Clone and deploy
git clone <repo-url>
cd tabula
./deploy.sh prod
```

### AWS (ECS/Fargate)

1. Push images to ECR:
```bash
aws ecr get-login-password | docker login --username AWS --password-stdin <account>.dkr.ecr.<region>.amazonaws.com

docker tag jaldrishti-api:latest <account>.dkr.ecr.<region>.amazonaws.com/jaldrishti-api:latest
docker push <account>.dkr.ecr.<region>.amazonaws.com/jaldrishti-api:latest
```

2. Create ECS task definition with the pushed images
3. Configure Application Load Balancer

### Google Cloud (Cloud Run)

```bash
# Backend
gcloud run deploy jaldrishti-api \
    --source . \
    --region us-central1 \
    --allow-unauthenticated

# Frontend
cd frontend
gcloud run deploy jaldrishti-frontend \
    --source . \
    --region us-central1 \
    --set-env-vars NEXT_PUBLIC_API_URL=https://jaldrishti-api-xxx.run.app \
    --allow-unauthenticated
```

### Azure (Container Instances)

```bash
# Create resource group
az group create --name jaldrishti-rg --location eastus

# Deploy API
az container create \
    --resource-group jaldrishti-rg \
    --name jaldrishti-api \
    --image <acr>.azurecr.io/jaldrishti-api:latest \
    --ports 8000 \
    --dns-name-label jaldrishti-api
```

### DigitalOcean (App Platform)

1. Connect GitHub repository
2. Configure build settings:
   - Backend: Dockerfile at root
   - Frontend: Dockerfile at `/frontend`
3. Set environment variables
4. Deploy

### Heroku

```bash
# Login
heroku login

# Create apps
heroku create jaldrishti-api
heroku create jaldrishti-frontend

# Deploy backend
heroku container:push web -a jaldrishti-api
heroku container:release web -a jaldrishti-api

# Deploy frontend
cd frontend
heroku container:push web -a jaldrishti-frontend
heroku container:release web -a jaldrishti-frontend
```

---

## ⚙️ Environment Configuration

### Backend Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 8000 | API server port |
| `HOST` | 0.0.0.0 | Bind address |
| `WORKERS` | 4 | Gunicorn workers |
| `CORS_ORIGINS` | * | Allowed CORS origins |

### Frontend Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | http://localhost:8000 | Backend API URL |
| `PORT` | 3000 | Frontend server port |

### Configuration Files

```bash
# Copy example configs
cp .env.example .env
cp frontend/.env.example frontend/.env.local

# Edit for your environment
nano .env
```

---

## 🔐 SSL/HTTPS Setup

### Option 1: Let's Encrypt (Certbot)

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d jaldrishti.example.com -d api.jaldrishti.example.com

# Auto-renewal
sudo certbot renew --dry-run
```

### Option 2: Self-Signed (Development)

```bash
mkdir -p nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout nginx/ssl/key.pem \
    -out nginx/ssl/cert.pem \
    -subj "/CN=localhost"
```

### Nginx HTTPS Configuration

Update `nginx/nginx.conf`:

```nginx
server {
    listen 443 ssl http2;
    server_name jaldrishti.example.com;
    
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    
    # ... rest of configuration
}
```

---

## 📊 Monitoring & Logging

### Health Checks

```bash
# API health
curl http://localhost:8000/health

# Expected response:
{
  "status": "healthy",
  "version": "1.0.0",
  "data_loaded": true,
  "latest_year": 2024,
  "total_stations": 9547
}
```

### Docker Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f api
docker compose logs -f frontend

# Last 100 lines
docker compose logs --tail 100
```

### Log Aggregation (Optional)

For production, consider:
- **ELK Stack** (Elasticsearch, Logstash, Kibana)
- **Grafana + Loki**
- **CloudWatch** (AWS)
- **Stackdriver** (GCP)

---

## 🔍 Troubleshooting

### Common Issues

#### Port Already in Use

```bash
# Find process using port
lsof -i :8000   # Linux/macOS
netstat -ano | findstr :8000   # Windows

# Kill process
kill -9 <PID>   # Linux/macOS
taskkill /PID <PID> /F   # Windows
```

#### Docker Build Fails

```bash
# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker compose build --no-cache
```

#### Frontend Can't Connect to API

1. Check API is running: `curl http://localhost:8000/health`
2. Verify `NEXT_PUBLIC_API_URL` is correct
3. Check CORS settings in backend
4. Ensure network connectivity between containers

#### Out of Memory

```bash
# Increase Docker memory limit
# Docker Desktop → Settings → Resources → Memory

# Reduce workers
WORKERS=2 docker compose up
```

### Debug Mode

```bash
# Backend with debug logs
LOG_LEVEL=DEBUG uvicorn app.main:app --reload

# Frontend with verbose output
npm run dev -- --verbose
```

### Container Shell Access

```bash
# API container
docker exec -it jaldrishti-api /bin/sh

# Frontend container
docker exec -it jaldrishti-frontend /bin/sh
```

---

## 📈 Performance Tuning

### Backend Optimization

```bash
# Increase workers based on CPU
WORKERS=$((2 * $(nproc) + 1))

# Enable keep-alive
gunicorn --keep-alive 120 ...
```

### Frontend Optimization

- Enable caching in nginx
- Use CDN for static assets
- Enable gzip compression

### Resource Allocation

| Environment | API Workers | RAM | CPU |
|-------------|-------------|-----|-----|
| Development | 1-2 | 1GB | 1 core |
| Staging | 2-4 | 2GB | 2 cores |
| Production | 4-8 | 4GB+ | 4+ cores |

---

## ✅ Deployment Checklist

- [ ] Environment variables configured
- [ ] SSL certificates in place
- [ ] Health checks passing
- [ ] CORS origins configured
- [ ] Logging enabled
- [ ] Backup strategy defined
- [ ] Monitoring configured
- [ ] DNS records set up
- [ ] Firewall rules configured
- [ ] Load testing completed

---

## 📞 Support

For deployment issues:
1. Check logs: `docker compose logs -f`
2. Review this guide
3. Open a GitHub issue

---

<div align="center">

**Happy Deploying! 🚀**

</div>
