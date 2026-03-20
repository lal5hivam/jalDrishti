#!/bin/bash
# EC2 User Data Script for JalDrishti Deployment
# This script runs on instance launch

# Update system
sudo yum update -y

# Install Docker
sudo yum install -y docker
sudo service docker start
sudo usermod -a -G docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Git
sudo yum install -y git

# Clone repository (replace with your repo URL)
cd /home/ec2-user
# git clone https://github.com/yourusername/jaldrishti.git
# cd jaldrishti

# For now, we'll assume files are uploaded via SCP or S3
# Create app directory
mkdir -p /home/ec2-user/jaldrishti
cd /home/ec2-user/jaldrishti

# Build and run Docker container
# docker-compose up -d

# Enable Docker to start on boot
sudo chkconfig docker on

echo "JalDrishti deployment script completed!"
