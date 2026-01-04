#!/bin/bash
# ============================================
# JalDrishti - Docker Deployment Script
# ============================================
# Usage: ./deploy.sh [dev|prod|stop|logs|status]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Functions
print_header() {
    echo -e "${BLUE}"
    echo "============================================"
    echo "  JalDrishti - Deployment Manager"
    echo "============================================"
    echo -e "${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    print_success "Docker is available"
}

deploy_dev() {
    print_header
    echo "Deploying in DEVELOPMENT mode..."
    echo ""
    
    check_docker
    
    echo "Building and starting containers..."
    docker compose -f docker-compose.dev.yml up --build -d
    
    echo ""
    print_success "Development deployment complete!"
    echo ""
    echo "Access points:"
    echo "  📊 Frontend:  http://localhost:3000"
    echo "  📡 API:       http://localhost:8000"
    echo "  📖 API Docs:  http://localhost:8000/docs"
    echo ""
}

deploy_prod() {
    print_header
    echo "Deploying in PRODUCTION mode..."
    echo ""
    
    check_docker
    
    # Check for .env file
    if [ ! -f ".env" ]; then
        print_warning ".env file not found. Copying from .env.example..."
        cp .env.example .env
    fi
    
    echo "Building and starting containers..."
    docker compose -f docker-compose.yml up --build -d
    
    echo ""
    print_success "Production deployment complete!"
    echo ""
    echo "Access points:"
    echo "  📊 Frontend:  http://localhost:3000"
    echo "  📡 API:       http://localhost:8000"
    echo "  📖 API Docs:  http://localhost:8000/docs"
    echo ""
}

deploy_prod_with_nginx() {
    print_header
    echo "Deploying in PRODUCTION mode with Nginx..."
    echo ""
    
    check_docker
    
    # Check for .env file
    if [ ! -f ".env" ]; then
        print_warning ".env file not found. Copying from .env.example..."
        cp .env.example .env
    fi
    
    echo "Building and starting containers..."
    docker compose -f docker-compose.yml --profile production up --build -d
    
    echo ""
    print_success "Production deployment with Nginx complete!"
    echo ""
    echo "Access points:"
    echo "  🌐 Main Site: http://localhost"
    echo "  📡 API:       http://localhost/api"
    echo "  📖 API Docs:  http://localhost/docs"
    echo ""
}

stop_containers() {
    print_header
    echo "Stopping all JalDrishti containers..."
    
    docker compose -f docker-compose.yml down 2>/dev/null || true
    docker compose -f docker-compose.dev.yml down 2>/dev/null || true
    
    print_success "All containers stopped"
}

show_logs() {
    print_header
    echo "Showing logs (Ctrl+C to exit)..."
    echo ""
    
    if docker compose -f docker-compose.yml ps -q 2>/dev/null | grep -q .; then
        docker compose -f docker-compose.yml logs -f
    elif docker compose -f docker-compose.dev.yml ps -q 2>/dev/null | grep -q .; then
        docker compose -f docker-compose.dev.yml logs -f
    else
        print_error "No running containers found"
    fi
}

show_status() {
    print_header
    echo "Container Status:"
    echo ""
    
    docker ps --filter "name=jaldrishti" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    
    echo ""
    echo "Health Check:"
    
    # Check API
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        print_success "API is healthy"
    else
        print_warning "API is not responding"
    fi
    
    # Check Frontend
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        print_success "Frontend is healthy"
    else
        print_warning "Frontend is not responding"
    fi
}

clean_all() {
    print_header
    echo "Cleaning all JalDrishti Docker resources..."
    
    # Stop containers
    docker compose -f docker-compose.yml down -v 2>/dev/null || true
    docker compose -f docker-compose.dev.yml down -v 2>/dev/null || true
    
    # Remove images
    docker images --filter "reference=*jaldrishti*" -q | xargs -r docker rmi -f
    
    # Remove volumes
    docker volume ls --filter "name=jaldrishti" -q | xargs -r docker volume rm
    
    print_success "Cleanup complete"
}

show_help() {
    print_header
    echo "Usage: ./deploy.sh [command]"
    echo ""
    echo "Commands:"
    echo "  dev         Deploy in development mode"
    echo "  prod        Deploy in production mode"
    echo "  prod-nginx  Deploy in production with Nginx"
    echo "  stop        Stop all containers"
    echo "  logs        Show container logs"
    echo "  status      Show container status"
    echo "  clean       Remove all Docker resources"
    echo "  help        Show this help message"
    echo ""
}

# Main
case "${1:-help}" in
    dev)
        deploy_dev
        ;;
    prod)
        deploy_prod
        ;;
    prod-nginx)
        deploy_prod_with_nginx
        ;;
    stop)
        stop_containers
        ;;
    logs)
        show_logs
        ;;
    status)
        show_status
        ;;
    clean)
        clean_all
        ;;
    help|*)
        show_help
        ;;
esac
