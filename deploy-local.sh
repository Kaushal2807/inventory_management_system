#!/bin/bash

# Inventory Management System - Local Server Deployment Guide
echo "🚀 Inventory Management System - Local Deployment"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "Don't run this script as root! Run as regular user."
   exit 1
fi

print_info "Starting local deployment process..."

# Step 1: Check Prerequisites
echo -e "\n${BLUE}Step 1: Checking Prerequisites${NC}"
echo "================================"

# Check Python
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    print_status "Python found: $PYTHON_VERSION"
else
    print_error "Python 3 not found! Please install Python 3.8+"
    exit 1
fi

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_status "Node.js found: $NODE_VERSION"
else
    print_error "Node.js not found! Please install Node.js 16+"
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    print_status "NPM found: $NPM_VERSION"
else
    print_error "NPM not found! Please install NPM"
    exit 1
fi

# Step 2: Setup Backend
echo -e "\n${BLUE}Step 2: Setting up Backend${NC}"
echo "============================"

cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "../env" ]; then
    print_info "Creating Python virtual environment..."
    python3 -m venv ../env
    print_status "Virtual environment created"
else
    print_status "Virtual environment already exists"
fi

# Activate virtual environment
print_info "Activating virtual environment..."
source ../env/bin/activate

# Install Python dependencies
print_info "Installing Python dependencies..."
pip install -r requirements.txt
print_status "Python dependencies installed"

# Run database migrations
print_info "Setting up database..."
python3 -c "from database import init_database; init_database()"
print_status "Database initialized"

cd ..

# Step 3: Setup Frontend
echo -e "\n${BLUE}Step 3: Setting up Frontend${NC}"
echo "============================="

cd frontend

# Install Node.js dependencies
print_info "Installing Node.js dependencies..."
npm install
print_status "Node.js dependencies installed"

cd ..

# Step 4: Create Systemd Services
echo -e "\n${BLUE}Step 4: Creating System Services${NC}"
echo "=================================="

# Create backend service
print_info "Creating backend systemd service..."
sudo tee /etc/systemd/system/inventory-backend.service > /dev/null <<EOF
[Unit]
Description=Inventory Management Backend
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$(pwd)/backend
Environment=PATH=$(pwd)/env/bin
ExecStart=$(pwd)/env/bin/python main.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Create frontend build and service
print_info "Building frontend for production..."
cd frontend
npm run build
cd ..

# Install nginx if not present
if ! command -v nginx &> /dev/null; then
    print_info "Installing Nginx..."
    sudo apt update
    sudo apt install -y nginx
    print_status "Nginx installed"
else
    print_status "Nginx already installed"
fi

# Create nginx configuration
print_info "Creating Nginx configuration..."
sudo tee /etc/nginx/sites-available/inventory-app > /dev/null <<EOF
server {
    listen 80;
    server_name localhost $(hostname -I | awk '{print $1}');

    # Frontend (React build)
    location / {
        root $(pwd)/frontend/dist;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }

    # Backend API
    location /api {
        rewrite ^/api/(.*) /\$1 break;
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Direct backend access (optional)
    location /backend {
        rewrite ^/backend/(.*) /\$1 break;
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/inventory-app /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
sudo nginx -t

if [ $? -eq 0 ]; then
    print_status "Nginx configuration is valid"
else
    print_error "Nginx configuration has errors"
    exit 1
fi

# Step 5: Start Services
echo -e "\n${BLUE}Step 5: Starting Services${NC}"
echo "=========================="

# Reload systemd and start backend
sudo systemctl daemon-reload
sudo systemctl enable inventory-backend
sudo systemctl start inventory-backend

# Check backend status
if sudo systemctl is-active --quiet inventory-backend; then
    print_status "Backend service started successfully"
else
    print_error "Backend service failed to start"
    sudo systemctl status inventory-backend
    exit 1
fi

# Start nginx
sudo systemctl enable nginx
sudo systemctl restart nginx

# Check nginx status
if sudo systemctl is-active --quiet nginx; then
    print_status "Nginx started successfully"
else
    print_error "Nginx failed to start"
    sudo systemctl status nginx
    exit 1
fi

# Step 6: Configure Firewall
echo -e "\n${BLUE}Step 6: Configuring Firewall${NC}"
echo "============================="

if command -v ufw &> /dev/null; then
    print_info "Configuring UFW firewall..."
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    sudo ufw allow ssh
    print_status "Firewall configured"
else
    print_warning "UFW not found. Please configure firewall manually"
fi

# Step 7: Final Information
echo -e "\n${GREEN}🎉 Deployment Complete!${NC}"
echo "========================"
echo ""
echo "📱 Application URLs:"
echo "   Local access:    http://localhost"
echo "   Network access:  http://$(hostname -I | awk '{print $1}')"
echo ""
echo "🔧 Service Management:"
echo "   Backend status:  sudo systemctl status inventory-backend"
echo "   Backend logs:    sudo journalctl -u inventory-backend -f"
echo "   Nginx status:    sudo systemctl status nginx"
echo "   Nginx logs:      sudo tail -f /var/log/nginx/access.log"
echo ""
echo "🔄 Restart Services:"
echo "   Backend:         sudo systemctl restart inventory-backend"
echo "   Nginx:           sudo systemctl restart nginx"
echo ""
echo "📁 Important Paths:"
echo "   Database:        $(pwd)/backend/inventory.db"
echo "   Backend logs:    Use journalctl command above"
echo "   Nginx config:    /etc/nginx/sites-available/inventory-app"
echo ""
echo "🛠️  Maintenance:"
echo "   Update frontend: cd frontend && npm run build && sudo systemctl restart nginx"
echo "   Update backend:  sudo systemctl restart inventory-backend"
echo ""

print_status "Your Inventory Management System is now running!"
print_info "Access it at: http://$(hostname -I | awk '{print $1}')"