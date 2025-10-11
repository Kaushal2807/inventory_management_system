#!/bin/bash
echo "🚇 Ngrok Quick Setup - Easy External Access"
echo "==========================================="

# Check if ngrok is already installed
if command -v ngrok &> /dev/null; then
    echo "✅ Ngrok is already installed"
else
    echo "📥 Installing Ngrok..."
    cd /tmp
    wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz
    tar xvzf ngrok-v3-stable-linux-amd64.tgz
    sudo mv ngrok /usr/local/bin
    echo "✅ Ngrok installed successfully"
fi

echo ""
echo "🔑 Setup Instructions:"
echo "======================"
echo "1. Go to: https://ngrok.com/signup (free account)"
echo "2. Get your auth token from dashboard"
echo "3. Run: ngrok config add-authtoken YOUR_AUTH_TOKEN"
echo "4. Run this script again to start tunnel"
echo ""

# Check if ngrok is configured
if [ -f ~/.config/ngrok/ngrok.yml ]; then
    echo "✅ Ngrok is configured"
    echo ""
    echo "🚀 Starting Ngrok tunnel..."
    echo "=========================="
    echo "Your inventory app will be accessible via HTTPS URL"
    echo "Press Ctrl+C to stop the tunnel"
    echo ""
    
    # Start ngrok tunnel
    ngrok http 80
else
    echo "⚠️  Ngrok not configured yet"
    echo "Please get your auth token from ngrok.com and run:"
    echo "ngrok config add-authtoken YOUR_AUTH_TOKEN"
    echo ""
    echo "Then run this script again: ./setup-ngrok.sh"
fi