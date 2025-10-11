#!/bin/bash

echo "🚀 Inventory Management System - Deployment Script"
echo "=================================================="

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
else
    echo "✅ Railway CLI found"
fi

# Deploy Backend
echo ""
echo "📡 Deploying Backend..."
cd backend

# Check if railway project exists
if [ ! -f "railway.toml" ]; then
    echo "🔧 Initializing Railway project for backend..."
    railway init --name "inventory-backend"
fi

echo "🚀 Deploying backend to Railway..."
railway deploy

# Get backend URL
BACKEND_URL=$(railway domain)
echo "✅ Backend deployed at: $BACKEND_URL"

# Deploy Frontend
echo ""
echo "🎨 Deploying Frontend..."
cd ../frontend

# Update API URL in .env.production
echo "VITE_API_URL=$BACKEND_URL" > .env.production

# Build frontend
echo "🔨 Building frontend..."
npm install
npm run build

# Initialize Railway project for frontend
if [ ! -f "railway.toml" ]; then
    echo "🔧 Initializing Railway project for frontend..."
    railway init --name "inventory-frontend"
fi

echo "🚀 Deploying frontend to Railway..."
railway deploy

# Get frontend URL
FRONTEND_URL=$(railway domain)
echo "✅ Frontend deployed at: $FRONTEND_URL"

echo ""
echo "🎉 Deployment Complete!"
echo "================================"
echo "Backend URL: $BACKEND_URL"
echo "Frontend URL: $FRONTEND_URL"
echo ""
echo "🔗 Next Steps:"
echo "1. Update CORS settings in backend if needed"
echo "2. Test the application"
echo "3. Set up custom domain (optional)"
echo ""
echo "📚 For more deployment options, see DEPLOYMENT_GUIDE.md"