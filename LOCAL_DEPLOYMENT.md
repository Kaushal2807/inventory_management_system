# 🚀 Complete Local Server Deployment Guide

## 📋 Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Architecture](#architecture)
4. [Step-by-Step Deployment](#step-by-step-deployment)
5. [Service Management](#service-management)
6. [Network Access](#network-access)
7. [Troubleshooting](#troubleshooting)
8. [Security & Production](#security--production)
9. [Maintenance](#maintenance)
10. [Complete Technical Details](#complete-technical-details)

---

## 🎯 Overview

This guide provides complete instructions for deploying the Inventory Management System on a local server using:
- **FastAPI Backend** with SQLAlchemy ORM
- **React Frontend** with Vite build system
- **Nginx** as reverse proxy
- **SystemD** for service management
- **SQLite** database with IST timezone support

### What This Deployment Includes:
✅ **Production-Ready Setup** - SystemD services with auto-restart  
✅ **Network Access** - Available to all devices on your network  
✅ **Reverse Proxy** - Clean URLs with /api routing  
✅ **Database Management** - SQLite with proper IST timezone  
✅ **Service Monitoring** - Easy start/stop/status commands  
✅ **Security Ready** - Firewall configuration included  

---

## 📋 Prerequisites

### System Requirements:
- **OS**: Ubuntu 20.04+ / Debian 10+ (tested on Ubuntu)
- **RAM**: Minimum 2GB, Recommended 4GB
- **Storage**: Minimum 5GB free space
- **Network**: Static IP or DHCP reservation recommended

### Software Prerequisites:
```bash
# Check if you have these installed:
python3 --version    # Should be 3.8 or higher
node --version       # Should be 16 or higher  
npm --version        # Should be 8 or higher
```

### Install Prerequisites (if missing):
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python 3 and pip
sudo apt install -y python3 python3-pip python3-venv

# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install additional tools
sudo apt install -y nginx curl wget git
```

---

## 🏗️ Architecture

### System Architecture Diagram:
```
┌─────────────────────────────────────────────────────┐
│                 Network Devices                     │
│  📱 Mobile    💻 Laptop    🖥️ Desktop              │
└─────────────────────┬───────────────────────────────┘
                      │ HTTP Requests
                      ▼
┌─────────────────────────────────────────────────────┐
│               Linux Server (Your PC)                │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │            Nginx (Port 80)                  │   │
│  │        Reverse Proxy & Static Files         │   │
│  └─────────────┬───────────────┬───────────────┘   │
│                │               │                   │
│       Frontend │               │ API Proxy         │
│     (Static)   │               │ (/api/*)          │
│                ▼               ▼                   │
│  ┌─────────────────────┐ ┌─────────────────────┐   │
│  │   React Frontend    │ │  FastAPI Backend    │   │
│  │   (Built Files)     │ │   (Port 8000)       │   │
│  │   /frontend/dist    │ │   Python + SQLite   │   │
│  └─────────────────────┘ └─────────────────────┘   │
│                                        │           │
│                                        ▼           │
│                          ┌─────────────────────┐   │
│                          │   SQLite Database   │   │
│                          │   inventory.db      │   │
│                          └─────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### Service Flow:
1. **User accesses** `http://SERVER_IP` from any device
2. **Nginx receives** the request on port 80
3. **Frontend requests** are served from `/frontend/dist`
4. **API requests** (`/api/*`) are proxied to backend on port 8000
5. **Backend processes** requests and queries SQLite database
6. **Response flows back** through the same path

---

## 🚀 Step-by-Step Deployment

### Step 1: Project Preparation
```bash
# Navigate to your project directory
cd /home/user/Desktop/inventory_web

# Ensure all files are present
ls -la
# Should see: backend/, frontend/, deploy-local.sh, manage.sh
```

### Step 2: Quick Deployment (Recommended)
```bash
# Make deployment script executable
chmod +x deploy-local.sh

# Run automated deployment
./deploy-local.sh
```

**The script will automatically:**
1. ✅ Check all prerequisites
2. ✅ Create Python virtual environment
3. ✅ Install backend dependencies
4. ✅ Initialize SQLite database
5. ✅ Install frontend dependencies
6. ✅ Build frontend for production
7. ✅ Create SystemD service files
8. ✅ Configure Nginx reverse proxy
9. ✅ Start all services
10. ✅ Configure firewall rules

### Step 3: Manual Deployment (Alternative)

If you prefer manual control or troubleshooting:

#### Backend Setup:
```bash
cd backend

# Create virtual environment
python3 -m venv ../env

# Activate virtual environment
source ../env/bin/activate

# Install dependencies
pip install -r requirements.txt

# Initialize database
python3 -c "from database import init_database; init_database()"

# Test backend
python3 main.py
# Should show: "Uvicorn running on http://0.0.0.0:8000"
# Press Ctrl+C to stop
```

#### Frontend Setup:
```bash
cd ../frontend

# Install dependencies
npm install

# Build for production
npm run build

# Verify build
ls -la dist/
# Should see: index.html, assets/ folder
```

#### SystemD Service Creation:
```bash
# Create backend service
sudo tee /etc/systemd/system/inventory-backend.service > /dev/null <<EOF
[Unit]
Description=Inventory Management Backend
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$(pwd)/../backend
Environment=PATH=$(pwd)/../env/bin
ExecStart=$(pwd)/../env/bin/python main.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and enable service
sudo systemctl daemon-reload
sudo systemctl enable inventory-backend
sudo systemctl start inventory-backend
```

#### Nginx Configuration:
```bash
# Create nginx site configuration
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
}
EOF

# Enable site and restart nginx
sudo ln -sf /etc/nginx/sites-available/inventory-app /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🔧 Service Management

### Using the Management Script (Recommended):
```bash
# Make management script executable
chmod +x manage.sh

# Available commands:
./manage.sh start     # Start all services
./manage.sh stop      # Stop all services
./manage.sh restart   # Restart all services
./manage.sh status    # Show service status
./manage.sh logs      # Show backend logs
./manage.sh update    # Update and restart
./manage.sh info      # Show access URLs
```

### Manual Service Control:
```bash
# Backend service
sudo systemctl start inventory-backend
sudo systemctl stop inventory-backend
sudo systemctl restart inventory-backend
sudo systemctl status inventory-backend

# Nginx service
sudo systemctl start nginx
sudo systemctl stop nginx
sudo systemctl restart nginx
sudo systemctl status nginx

# Enable/disable auto-start
sudo systemctl enable inventory-backend nginx
sudo systemctl disable inventory-backend nginx
```

### Viewing Logs:
```bash
# Backend logs (real-time)
sudo journalctl -u inventory-backend -f

# Backend logs (last 100 lines)
sudo journalctl -u inventory-backend -n 100

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## 🌐 Network Access

### Finding Your Server IP:
```bash
# Get your local IP address
hostname -I | awk '{print $1}'
# Example output: 192.168.1.4
```

### Access URLs:
- **Frontend**: `http://YOUR_SERVER_IP`
- **Backend API**: `http://YOUR_SERVER_IP/api`
- **API Documentation**: `http://YOUR_SERVER_IP/api/docs`

### Network Access Test:
```bash
# Run network test script
chmod +x test-network.sh
./test-network.sh
```

### Accessing from Other Devices:

#### Mobile Devices (iOS/Android):
1. Connect to same WiFi network
2. Open browser (Safari/Chrome)
3. Go to: `http://YOUR_SERVER_IP`

#### Other Computers:
1. Connect to same network
2. Open any browser
3. Go to: `http://YOUR_SERVER_IP`

### API Configuration Details:
The frontend automatically detects the environment:
- **Development**: Uses `http://localhost:8000`
- **Production**: Uses relative URLs `/api` (proxied by Nginx)

---

## 🔍 Troubleshooting

### Common Issues and Solutions:

#### 1. Services Won't Start
```bash
# Check service status
./manage.sh status

# View detailed errors
sudo journalctl -u inventory-backend -n 50
sudo journalctl -u nginx -n 50

# Check port conflicts
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :8000
```

#### 2. Permission Errors
```bash
# Fix file permissions
sudo chown -R $USER:$USER /home/user/Desktop/inventory_web
chmod +x /home/user/Desktop/inventory_web/*.sh

# Fix nginx permissions
sudo chmod -R 755 /home/user/Desktop/inventory_web/frontend/dist
```

#### 3. Database Issues
```bash
# Check database file
ls -la backend/inventory.db

# Recreate database
cd backend
rm -f inventory.db
python3 -c "from database import init_database; init_database()"
```

#### 4. Frontend Not Loading
```bash
# Rebuild frontend
cd frontend
npm run build

# Check nginx configuration
sudo nginx -t

# Restart services
sudo systemctl restart nginx
```

#### 5. API Connection Issues
```bash
# Test backend directly
curl http://localhost:8000/

# Test through proxy
curl http://localhost/api/

# Check nginx proxy logs
sudo tail -f /var/log/nginx/error.log
```

### Port Conflicts:
If port 80 is already in use:
```bash
# Edit nginx configuration
sudo nano /etc/nginx/sites-available/inventory-app

# Change: listen 80; 
# To:     listen 8080;

# Restart nginx
sudo systemctl restart nginx

# Access via: http://YOUR_IP:8080
```

---

## 🔒 Security & Production

### Firewall Configuration:
```bash
# Enable UFW firewall
sudo ufw enable

# Allow necessary ports
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS (future)
sudo ufw allow ssh       # SSH access

# Check firewall status
sudo ufw status
```

### SSL/HTTPS Setup (Optional):
```bash
# Install certbot for Let's Encrypt
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate (if you have a domain)
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Production Hardening:
```bash
# Change database location for security
sudo mkdir -p /var/lib/inventory
sudo mv backend/inventory.db /var/lib/inventory/
sudo chown $USER:$USER /var/lib/inventory/inventory.db

# Update backend configuration to use new path
# Edit backend/database.py and change DATABASE_URL
```

### Backup Configuration:
```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/home/user/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
cp backend/inventory.db $BACKUP_DIR/inventory_$DATE.db
echo "Backup created: $BACKUP_DIR/inventory_$DATE.db"
EOF

chmod +x backup.sh

# Add to crontab for daily backups
crontab -e
# Add: 0 2 * * * /home/user/Desktop/inventory_web/backup.sh
```

---

## 🛠️ Maintenance

### Regular Updates:
```bash
# Update application
git pull  # If using git version control
./manage.sh update

# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Python packages
source env/bin/activate
pip list --outdated
pip install --upgrade package_name
```

### Database Maintenance:
```bash
# Database backup
cp backend/inventory.db backend/inventory.db.backup.$(date +%Y%m%d)

# Database optimization (SQLite)
cd backend
python3 -c "
import sqlite3
conn = sqlite3.connect('inventory.db')
conn.execute('VACUUM;')
conn.close()
print('Database optimized')
"
```

### Log Rotation:
```bash
# Configure log rotation for application logs
sudo tee /etc/logrotate.d/inventory-app > /dev/null <<EOF
/var/log/nginx/access.log /var/log/nginx/error.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 0644 www-data www-data
    postrotate
        systemctl reload nginx
    endscript
}
EOF
```

### Performance Monitoring:
```bash
# Check system resources
htop
df -h
free -h

# Check service performance
systemctl status inventory-backend nginx
./manage.sh status

# Monitor network connections
ss -tulpn | grep :80
ss -tulpn | grep :8000
```

---

## 🔧 Complete Technical Details

### File Structure After Deployment:
```
inventory_web/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── database.py          # Database configuration
│   ├── models.py            # SQLAlchemy models
│   ├── schemas.py           # Pydantic schemas
│   ├── inventory.db         # SQLite database
│   ├── requirements.txt     # Python dependencies
│   ├── crud/               # CRUD operations
│   │   ├── items.py
│   │   ├── categories.py
│   │   ├── dashboard.py
│   │   └── payments.py
│   └── routes/             # API routes
│       ├── items.py
│       ├── categories.py
│       ├── dashboard.py
│       └── payments.py
├── frontend/
│   ├── src/                # Source code
│   ├── dist/               # Production build
│   ├── package.json        # Node dependencies
│   └── vite.config.js      # Build configuration
├── env/                    # Python virtual environment
├── deploy-local.sh         # Deployment script
├── manage.sh              # Service management
├── test-network.sh        # Network testing
└── *.md                   # Documentation files
```

### SystemD Service Files:
```bash
# Backend service location
/etc/systemd/system/inventory-backend.service

# Service configuration
[Unit]
Description=Inventory Management Backend
After=network.target

[Service]
Type=simple
User=user
WorkingDirectory=/home/user/Desktop/inventory_web/backend
Environment=PATH=/home/user/Desktop/inventory_web/env/bin
ExecStart=/home/user/Desktop/inventory_web/env/bin/python main.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### Nginx Configuration:
```bash
# Configuration file location
/etc/nginx/sites-available/inventory-app

# Active site link
/etc/nginx/sites-enabled/inventory-app -> /etc/nginx/sites-available/inventory-app
```

### Network Configuration:
```nginx
server {
    listen 80;
    server_name localhost 192.168.1.4;

    # Serve React frontend
    location / {
        root /home/user/Desktop/inventory_web/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Proxy API requests to backend
    location /api {
        rewrite ^/api/(.*) /$1 break;
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Increase timeout for long requests
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }
}
```

### Database Schema:
```sql
-- Core tables created by models.py
CREATE TABLE categories (
    id INTEGER PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE items (
    id INTEGER PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category_id INTEGER,
    purchase_price DECIMAL(10,2),
    selling_price DECIMAL(10,2),
    quantity INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 10,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE payments (
    id INTEGER PRIMARY KEY,
    customer_name VARCHAR(200),
    total_amount DECIMAL(10,2),
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payment_items (
    id INTEGER PRIMARY KEY,
    payment_id INTEGER,
    item_id INTEGER,
    quantity INTEGER,
    unit_price DECIMAL(10,2),
    total_price DECIMAL(10,2),
    FOREIGN KEY (payment_id) REFERENCES payments(id),
    FOREIGN KEY (item_id) REFERENCES items(id)
);
```

### API Endpoints:
```
GET    /items/                 # List all items
POST   /items/add             # Create new item
GET    /items/{id}            # Get item by ID
PUT    /items/{id}            # Update item
DELETE /items/{id}            # Delete item

GET    /categories/           # List all categories
POST   /categories/add        # Create new category
GET    /categories/{id}       # Get category by ID
PUT    /categories/{id}       # Update category
DELETE /categories/{id}       # Delete category

GET    /payments/             # List all payments
POST   /payments/             # Create new payment
GET    /payments/{id}         # Get payment by ID
PUT    /payments/{id}         # Update payment
DELETE /payments/{id}         # Delete payment

GET    /dashboard/stats       # Dashboard statistics
GET    /docs                  # API documentation
GET    /redoc                 # Alternative API docs
```

### Environment Variables:
```bash
# Development (.env.local)
VITE_API_URL=http://localhost:8000

# Production (automatic detection)
# Uses relative URLs (/api) when built

# Backend environment
PORT=8000
HOST=0.0.0.0
DATABASE_URL=sqlite:///./inventory.db
```

---

## 🎉 Deployment Success Checklist

After running the deployment, verify these items:

### ✅ Services Running:
```bash
./manage.sh status
# Should show: Backend: Running, Nginx: Running
```

### ✅ Network Access:
```bash
./test-network.sh
# Should show all green checkmarks
```

### ✅ API Functionality:
```bash
curl http://YOUR_IP/api/
# Should return: {"message":"Inventory Management System API"...}
```

### ✅ Frontend Loading:
```bash
curl http://YOUR_IP/
# Should return HTML with "Inventory Management System"
```

### ✅ Database Working:
```bash
curl http://YOUR_IP/api/items/
# Should return JSON array (empty or with items)
```

### ✅ Mobile Access:
- Connect mobile to same WiFi
- Open browser
- Go to `http://YOUR_IP`
- Should load and function completely

---

## 📞 Support & Next Steps

### If Everything Works:
🎉 **Congratulations!** Your inventory management system is now:
- ✅ Running on your local server
- ✅ Accessible from all network devices  
- ✅ Production-ready with proper services
- ✅ Automatically starting on boot
- ✅ Easy to manage with simple commands

### Next Steps:
1. **Share the URL** with your team: `http://YOUR_SERVER_IP`
2. **Bookmark on mobile devices** for easy access
3. **Set up regular backups** using the backup script
4. **Monitor resource usage** and performance
5. **Consider SSL setup** for enhanced security

### Getting Help:
- **Check logs**: `./manage.sh logs`
- **Test network**: `./test-network.sh`
- **Check status**: `./manage.sh status`
- **View this guide**: `cat LOCAL_DEPLOYMENT.md`

**Your inventory management system is now fully deployed and ready for production use!** 🚀