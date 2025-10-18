# 🐳 Docker Deployment Guide - Inventory Management Backend

## 📋 Prerequisites
- Docker installed
- Docker Hub account (for deployment)

## 🚀 Quick Start

### Local Development
```bash
# Build and run with Docker Compose
docker-compose up --build

# Or build and run manually
docker build -t inventory-backend .
docker run -p 8000:8000 inventory-backend
```

### 🌐 Production Deployment

#### Option 1: Docker Hub + Render
```bash
# 1. Build and push to Docker Hub
./build-docker.sh

# 2. Deploy on Render:
#    - Create new Web Service
#    - Connect Docker Hub
#    - Use image: yourusername/inventory-management-backend:latest
#    - Set PORT=8000
```

#### Option 2: GitHub + Render Auto-Deploy
```bash
# 1. Push to GitHub repository
git add .
git commit -m "Add Docker configuration"
git push origin main

# 2. Deploy on Render:
#    - Connect GitHub repository  
#    - Select Docker environment
#    - Auto-deploy from Dockerfile
```

## 🔧 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `HOST` | `0.0.0.0` | Server host |
| `PORT` | `8000` | Server port |
| `DATABASE_URL` | `sqlite:///./data/inventory.db` | Database path |
| `DOCKER_ENVIRONMENT` | `false` | Docker mode |

## 📊 Health Check
- Endpoint: `GET /health`
- Response: `{"status": "healthy"}`

## 🗂️ Docker Image Structure
```
/app/
├── main.py              # FastAPI application
├── database.py          # Database configuration  
├── models.py            # SQLAlchemy models
├── schemas.py           # Pydantic schemas
├── routes/              # API route handlers
├── crud/                # Database operations
└── data/                # SQLite database storage
```

## 🔍 Troubleshooting

### Build Issues
```bash
# Clear Docker cache
docker system prune -a

# Rebuild without cache
docker build --no-cache -t inventory-backend .
```

### Database Issues
```bash
# Check database path
docker exec -it <container_id> ls -la /app/data/

# Reset database (removes all data!)
docker volume rm backend_inventory_data
```

### Port Issues  
```bash
# Check if port is available
sudo netstat -tulpn | grep :8000

# Use different port
docker run -p 8080:8000 inventory-backend
```

## 📝 API Documentation
Once running, access:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc