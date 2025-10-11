# Inventory Management System - Deployment Guide

## Overview
This guide covers deployment options for the FastAPI + React inventory management system with the following components:
- **Backend**: FastAPI with SQLAlchemy (SQLite database)
- **Frontend**: React with Vite
- **Database**: SQLite (for development) or PostgreSQL (for production)

---

## 🌐 Deployment Options

### 1. **Railway (Recommended - Easy)**
Railway provides simple deployment for both frontend and backend.

#### Backend Deployment on Railway:
1. **Prepare Backend for Railway**:
   ```bash
   # Create railway.json in backend folder (already exists)
   cat backend/railway.json
   ```

2. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   railway login
   ```

3. **Deploy Backend**:
   ```bash
   cd backend
   railway init
   railway deploy
   ```

4. **Set Environment Variables** in Railway dashboard:
   ```
   PORT=8000
   HOST=0.0.0.0
   RAILWAY_ENVIRONMENT=production
   DATABASE_URL=postgresql://... (if using PostgreSQL)
   ```

#### Frontend Deployment on Railway:
1. **Prepare Frontend**:
   ```bash
   cd frontend
   # Add build script to package.json
   npm run build
   ```

2. **Deploy Frontend**:
   ```bash
   railway init
   railway deploy
   ```

3. **Update API URL** in frontend:
   - Set `VITE_API_URL` to your Railway backend URL

---

### 2. **Heroku Deployment**

#### Backend on Heroku:
1. **Create Heroku App**:
   ```bash
   heroku create your-inventory-backend
   ```

2. **Add Heroku Postgres** (optional):
   ```bash
   heroku addons:create heroku-postgresql:mini
   ```

3. **Create Procfile** (already exists):
   ```
   web: uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

4. **Deploy**:
   ```bash
   cd backend
   git init
   git add .
   git commit -m "Initial commit"
   heroku git:remote -a your-inventory-backend
   git push heroku main
   ```

#### Frontend on Netlify/Vercel:
1. **Build Frontend**:
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to Netlify**:
   - Connect GitHub repo
   - Set build command: `npm run build`
   - Set publish directory: `dist`
   - Add environment variable: `VITE_API_URL=https://your-heroku-backend.herokuapp.com`

---

### 3. **VPS/Cloud Server Deployment**

#### Prerequisites:
- Ubuntu 20.04+ server
- Domain name (optional)
- SSL certificate (Let's Encrypt)

#### Server Setup:
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Python
sudo apt install python3 python3-pip python3-venv -y

# Install Nginx
sudo apt install nginx -y

# Install certbot for SSL
sudo apt install certbot python3-certbot-nginx -y
```

#### Backend Deployment:
```bash
# Clone your repository
git clone https://github.com/yourusername/inventory_web.git
cd inventory_web/backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create systemd service
sudo nano /etc/systemd/system/inventory-backend.service
```

**Service file content**:
```ini
[Unit]
Description=Inventory Management API
After=network.target

[Service]
User=ubuntu
Group=ubuntu
WorkingDirectory=/home/ubuntu/inventory_web/backend
Environment=PATH=/home/ubuntu/inventory_web/backend/venv/bin
ExecStart=/home/ubuntu/inventory_web/backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
# Start service
sudo systemctl daemon-reload
sudo systemctl enable inventory-backend
sudo systemctl start inventory-backend
```

#### Frontend Deployment:
```bash
cd ../frontend

# Install dependencies and build
npm install
npm run build

# Copy build files to nginx
sudo cp -r dist/* /var/www/html/
```

#### Nginx Configuration:
```bash
sudo nano /etc/nginx/sites-available/inventory
```

**Nginx config**:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /var/www/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/inventory /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com
```

---

### 4. **Docker Deployment**

#### Create Dockerfile for Backend:
```dockerfile
# backend/Dockerfile
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### Create Dockerfile for Frontend:
```dockerfile
# frontend/Dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
```

#### Docker Compose:
```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/inventory
    depends_on:
      - db

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    environment:
      - VITE_API_URL=http://backend:8000

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=inventory
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

```bash
# Deploy with Docker
docker-compose up -d
```

---

## 🔧 Production Configuration

### Environment Variables:
```bash
# Backend (.env)
DATABASE_URL=postgresql://user:password@host:port/database
SECRET_KEY=your-secret-key-here
CORS_ORIGINS=https://your-frontend-domain.com
DEBUG=False

# Frontend (.env.production)
VITE_API_URL=https://your-backend-domain.com
```

### Database Migration for Production:
```bash
# For PostgreSQL, update database.py:
# DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/inventory")

# Run migration script
python migrate_times.py
```

### Security Checklist:
- [ ] Use HTTPS (SSL certificates)
- [ ] Set strong SECRET_KEY
- [ ] Configure CORS properly
- [ ] Use environment variables for secrets
- [ ] Enable firewall (UFW on Ubuntu)
- [ ] Regular backups
- [ ] Update dependencies regularly

---

## 🚀 Quick Start Commands

### Development:
```bash
# Backend
cd backend
source venv/bin/activate  # or `env/bin/activate`
python main.py

# Frontend
cd frontend
npm install
npm run dev
```

### Production Build:
```bash
# Frontend build
cd frontend
npm run build

# Backend with production settings
cd backend
export RAILWAY_ENVIRONMENT=production
uvicorn main:app --host 0.0.0.0 --port 8000
```

---

## 📱 Mobile/PWA Deployment

To make your app mobile-friendly, add to `frontend/public/manifest.json`:
```json
{
  "name": "Inventory Management System",
  "short_name": "Inventory",
  "theme_color": "#2c3e50",
  "background_color": "#ffffff",
  "display": "standalone",
  "start_url": "/",
  "icons": [
    {
      "src": "icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

---

## 🔍 Monitoring & Logs

### View Logs:
```bash
# Railway
railway logs

# Heroku
heroku logs --tail

# VPS with systemd
sudo journalctl -u inventory-backend -f

# Docker
docker-compose logs -f
```

### Health Check Endpoint:
Your app already has `/health` endpoint for monitoring.

---

## 💾 Backup Strategy

### Database Backup:
```bash
# SQLite backup
cp inventory.db inventory_backup_$(date +%Y%m%d).db

# PostgreSQL backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

### Automated Backup Script:
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > /backups/inventory_$DATE.sql
# Keep only last 7 days
find /backups -name "inventory_*.sql" -mtime +7 -delete
```

---

## 🎯 Recommended Deployment

For your inventory system, I recommend:

1. **Small Business**: Railway (easiest, automatic scaling)
2. **Medium Business**: VPS with Docker (more control, cost-effective)
3. **Enterprise**: AWS/GCP with Kubernetes (maximum scalability)

Choose Railway for the quickest deployment - it's perfect for your current setup!