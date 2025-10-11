#!/bin/bash
echo "🌐 Public URL Generator - Access from Any Network"
echo "================================================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check if services are running
print_info "Checking if your inventory system is running..."
if ! curl -s http://localhost:80 > /dev/null; then
    print_error "Your inventory system is not running!"
    echo "Please start it first:"
    echo "  ./manage.sh start"
    exit 1
fi
print_status "Inventory system is running locally"

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    print_info "Installing ngrok..."
    cd /tmp
    wget -q https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz
    tar xzf ngrok-v3-stable-linux-amd64.tgz
    sudo mv ngrok /usr/local/bin
    rm ngrok-v3-stable-linux-amd64.tgz
    print_status "Ngrok installed successfully"
else
    print_status "Ngrok is already installed"
fi

# Check if ngrok is configured
if [ ! -f ~/.config/ngrok/ngrok.yml ]; then
    print_warning "Ngrok is not configured yet!"
    echo ""
    echo "📋 Quick Setup Steps:"
    echo "===================="
    echo "1. Go to: https://ngrok.com/signup (FREE account)"
    echo "2. Copy your auth token from the dashboard"
    echo "3. Run: ngrok config add-authtoken YOUR_AUTH_TOKEN"
    echo "4. Run this script again: ./create-public-url.sh"
    echo ""
    print_info "Example: ngrok config add-authtoken 2abcd1234_56789efghijk..."
    exit 1
fi

print_status "Ngrok is configured and ready"
echo ""

print_info "Creating your public URL..."
print_info "This will work from ANY network, anywhere in the world!"
echo ""

# Start ngrok tunnel
print_status "🚀 Starting public tunnel..."
echo ""
echo "╔══════════════════════════════════════════════════════════════════════════════════════════╗"
echo "║                                  🌐 PUBLIC ACCESS ACTIVE                                 ║"
echo "╚══════════════════════════════════════════════════════════════════════════════════════════╝"
echo ""
echo "Your inventory system is now accessible from ANY network!"
echo "The URLs will appear below..."
echo ""
echo "📱 Share these URLs with anyone, anywhere:"
echo "=========================================="

# Run ngrok
ngrok http 80