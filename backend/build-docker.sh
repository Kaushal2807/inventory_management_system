#!/bin/bash

# Docker Build and Deploy Script for Inventory Management System
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Configuration
IMAGE_NAME="inventory-management-backend"
TAG=${1:-"latest"}
DOCKER_USERNAME=${DOCKER_USERNAME:-"yourusername"}  # Replace with your Docker Hub username

print_info "🐳 Building Docker image for Inventory Management Backend..."

# Build Docker image
print_info "Building image: ${IMAGE_NAME}:${TAG}"
docker build -t ${IMAGE_NAME}:${TAG} .

if [ $? -eq 0 ]; then
    print_status "Docker image built successfully!"
else
    print_error "Failed to build Docker image"
    exit 1
fi

# Tag for Docker Hub
print_info "Tagging image for Docker Hub..."
docker tag ${IMAGE_NAME}:${TAG} ${DOCKER_USERNAME}/${IMAGE_NAME}:${TAG}

print_status "Image tagged as: ${DOCKER_USERNAME}/${IMAGE_NAME}:${TAG}"

# Option to push to Docker Hub
echo
read -p "Do you want to push to Docker Hub? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Pushing to Docker Hub..."
    docker push ${DOCKER_USERNAME}/${IMAGE_NAME}:${TAG}
    
    if [ $? -eq 0 ]; then
        print_status "Successfully pushed to Docker Hub!"
        print_info "Image available at: docker.io/${DOCKER_USERNAME}/${IMAGE_NAME}:${TAG}"
    else
        print_error "Failed to push to Docker Hub"
        print_warning "Make sure you're logged in: docker login"
    fi
fi

# Show usage instructions
echo
print_info "🚀 Usage Instructions:"
echo "Local run:"
echo "  docker run -p 8000:8000 ${IMAGE_NAME}:${TAG}"
echo
echo "Docker Compose:"
echo "  docker-compose up"
echo
echo "For Render deployment:"
echo "  1. Push image to Docker Hub"
echo "  2. Create new Web Service on Render"
echo "  3. Connect Docker Hub repository"
echo "  4. Use image: ${DOCKER_USERNAME}/${IMAGE_NAME}:${TAG}"
echo "  5. Set PORT environment variable to 8000"

print_status "Build process completed!"