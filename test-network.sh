#!/bin/bash

# Network Access Test Script
echo "🌐 Inventory Management System - Network Access Test"
echo "=================================================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Get server IP
SERVER_IP=$(hostname -I | awk '{print $1}')
echo -e "${BLUE}Server IP:${NC} $SERVER_IP"

# Test local access
echo -e "\n${BLUE}Testing Local Access:${NC}"
if curl -s http://localhost/ > /dev/null; then
    echo -e "${GREEN}✓${NC} Frontend (localhost): http://localhost"
else
    echo -e "${RED}✗${NC} Frontend (localhost): Failed"
fi

if curl -s http://localhost/api/ > /dev/null; then
    echo -e "${GREEN}✓${NC} Backend API (localhost): http://localhost/api"
else
    echo -e "${RED}✗${NC} Backend API (localhost): Failed"
fi

# Test network access
echo -e "\n${BLUE}Testing Network Access:${NC}"
if curl -s http://$SERVER_IP/ > /dev/null; then
    echo -e "${GREEN}✓${NC} Frontend (network): http://$SERVER_IP"
else
    echo -e "${RED}✗${NC} Frontend (network): Failed"
fi

if curl -s http://$SERVER_IP/api/ > /dev/null; then
    echo -e "${GREEN}✓${NC} Backend API (network): http://$SERVER_IP/api"
else
    echo -e "${RED}✗${NC} Backend API (network): Failed"
fi

# Show network information
echo -e "\n${BLUE}Network Information:${NC}"
echo "Local IP: $SERVER_IP"
echo "Network Range: $(ip route | grep 'wlp\|eth' | grep '192.168' | head -1 | awk '{print $1}' | head -1)"
echo "Gateway: $(ip route | grep default | awk '{print $3}')"

# Show access URLs for other devices
echo -e "\n${YELLOW}📱 Access URLs for Other Devices:${NC}"
echo "================================="
echo "Frontend:     http://$SERVER_IP"
echo "API:          http://$SERVER_IP/api"
echo "API Docs:     http://$SERVER_IP/api/docs"
echo ""
echo "🔧 To access from other devices:"
echo "1. Connect device to same WiFi network"
echo "2. Open browser on device"
echo "3. Go to: http://$SERVER_IP"

# Test ports
echo -e "\n${BLUE}Port Status:${NC}"
if ss -tuln | grep ':80 ' > /dev/null; then
    echo -e "${GREEN}✓${NC} Port 80 (HTTP): Open"
else
    echo -e "${RED}✗${NC} Port 80 (HTTP): Closed"
fi

if ss -tuln | grep ':8000 ' > /dev/null; then
    echo -e "${GREEN}✓${NC} Port 8000 (Backend): Open"
else
    echo -e "${RED}✗${NC} Port 8000 (Backend): Closed"
fi

# Generate QR code URL (if qrencode is available)
if command -v qrencode &> /dev/null; then
    echo -e "\n${BLUE}QR Code for Mobile Access:${NC}"
    echo "http://$SERVER_IP" | qrencode -t ansiutf8
else
    echo -e "\n${YELLOW}💡 Tip:${NC} Install qrencode to generate QR codes:"
    echo "sudo apt install qrencode"
fi

echo -e "\n${GREEN}🎉 Network access is ready!${NC}"