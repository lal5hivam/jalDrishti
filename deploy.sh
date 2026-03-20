#!/bin/bash
# Deployment script for JalDrishti on AWS EC2

set -e

echo "=========================================="
echo "JalDrishti Deployment Script"
echo "=========================================="

# Configuration
APP_NAME="jaldrishti"
REMOTE_USER="ec2-user"
REMOTE_HOST="${1:-}"
KEY_FILE="${2:-jaldrishti-key.pem}"

if [ -z "$REMOTE_HOST" ]; then
    echo "Error: Remote host not specified"
    echo "Usage: ./deploy.sh <EC2_PUBLIC_IP> [KEY_FILE]"
    exit 1
fi

echo "Deploying to: $REMOTE_HOST"
echo "Using key: $KEY_FILE"

# Create deployment package
echo ""
echo "Step 1: Creating deployment package..."
mkdir -p deploy-package
cp app.py deploy-package/
cp requirements-prod.txt deploy-package/requirements.txt
cp Dockerfile deploy-package/
cp docker-compose.yml deploy-package/
cp -r .streamlit deploy-package/
cp -r output deploy-package/

# Create tarball
cd deploy-package
tar -czf ../jaldrishti-deploy.tar.gz .
cd ..
rm -rf deploy-package

echo "✓ Deployment package created"

# Upload to EC2
echo ""
echo "Step 2: Uploading to EC2..."
scp -i "$KEY_FILE" jaldrishti-deploy.tar.gz ${REMOTE_USER}@${REMOTE_HOST}:~/

echo "✓ Files uploaded"

# Deploy on EC2
echo ""
echo "Step 3: Deploying on EC2..."
ssh -i "$KEY_FILE" ${REMOTE_USER}@${REMOTE_HOST} << 'ENDSSH'
    # Extract files
    mkdir -p ~/jaldrishti
    cd ~/jaldrishti
    tar -xzf ~/jaldrishti-deploy.tar.gz
    rm ~/jaldrishti-deploy.tar.gz
    
    # Stop existing container
    docker-compose down 2>/dev/null || true
    
    # Build and start
    docker-compose build
    docker-compose up -d
    
    echo "✓ Application deployed and running"
    echo ""
    echo "Container status:"
    docker-compose ps
ENDSSH

# Cleanup
rm jaldrishti-deploy.tar.gz

echo ""
echo "=========================================="
echo "Deployment Complete!"
echo "=========================================="
echo "Access your application at: http://${REMOTE_HOST}:8501"
echo ""
echo "Useful commands:"
echo "  View logs: ssh -i $KEY_FILE ${REMOTE_USER}@${REMOTE_HOST} 'cd ~/jaldrishti && docker-compose logs -f'"
echo "  Stop app:  ssh -i $KEY_FILE ${REMOTE_USER}@${REMOTE_HOST} 'cd ~/jaldrishti && docker-compose down'"
echo "  Restart:   ssh -i $KEY_FILE ${REMOTE_USER}@${REMOTE_HOST} 'cd ~/jaldrishti && docker-compose restart'"
