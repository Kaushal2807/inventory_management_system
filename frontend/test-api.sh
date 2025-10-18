#!/bin/bash

# Test script to verify backend connection
echo "🧪 Testing Backend API Connection..."

BACKEND_URL="https://inventory-management-backend-xxs3.onrender.com"

echo "Testing health endpoint..."
curl -s "$BACKEND_URL/health" | jq '.' || echo "❌ Health check failed"

echo -e "\nTesting root endpoint..."
curl -s "$BACKEND_URL/" | jq '.' || echo "❌ Root endpoint failed"

echo -e "\nTesting CORS headers..."
curl -s -H "Origin: https://your-vercel-app.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS "$BACKEND_URL/health"

echo -e "\n✅ Backend API tests completed!"