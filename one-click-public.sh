#!/bin/bash
echo "🌟 One-Click Public Access Setup"
echo "================================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_info "Setting up your inventory system for public access..."
echo ""

# Step 1: Start services
print_info "Step 1: Starting inventory services..."
./manage.sh start
print_status "Services started"

# Step 2: Check if ngrok is setup
if [ -f ~/.config/ngrok/ngrok.yml ]; then
    print_status "Ngrok already configured"
    echo ""
    print_info "Step 2: Creating your public URL..."
    print_status "Your inventory system will be accessible from ANY network!"
    echo ""
    ./create-public-url.sh
else
    echo ""
    print_info "Step 2: First-time setup needed..."
    echo "┌─────────────────────────────────────────────────────────────┐"
    echo "│                    🔑 QUICK SETUP                           │"
    echo "├─────────────────────────────────────────────────────────────┤"
    echo "│ 1. Go to: https://ngrok.com/signup (FREE account)          │"
    echo "│ 2. Copy your auth token from dashboard                     │"
    echo "│ 3. Run: ngrok config add-authtoken YOUR_TOKEN              │"
    echo "│ 4. Run this script again: ./one-click-public.sh            │"
    echo "└─────────────────────────────────────────────────────────────┘"
    echo ""
    print_info "Example token setup:"
    echo "ngrok config add-authtoken 2abc123_4def567890..."
    echo ""
    print_info "After setup, you'll get URLs like: https://abc123.ngrok.io"
    print_info "Share these URLs with anyone, anywhere in the world!"
fi