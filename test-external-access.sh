#!/bin/bash
echo "🌐 Network Access Test & Setup Options"
echo "======================================="

PUBLIC_IP=$(curl -4 -s ifconfig.me)
LOCAL_IP=$(hostname -I | awk '{print $1}')

echo "📊 Network Information:"
echo "======================"
echo "Public IP: $PUBLIC_IP"
echo "Local IP: $LOCAL_IP"
echo "Gateway: 192.168.1.1"
echo ""

echo "🧪 Testing Local Access:"
echo "========================"
if curl -s http://$LOCAL_IP/ > /dev/null; then
    echo "✅ Local access working: http://$LOCAL_IP"
else
    echo "❌ Local access failed - check if services are running"
    echo "Run: ./manage.sh status"
fi

echo ""
echo "🌐 External Access Options:"
echo "==========================="
echo ""
echo "Option 1: Port Forwarding (Permanent)"
echo "-------------------------------------"
echo "1. Configure router port forwarding:"
echo "   External Port: 8080 → Internal: $LOCAL_IP:80"
echo "2. Access via: http://$PUBLIC_IP:8080"
echo "3. Run: ./setup-port-forwarding.sh for detailed steps"
echo ""

echo "Option 2: Ngrok (Quick Sharing)"
echo "------------------------------"
echo "1. Run: ./setup-ngrok.sh"
echo "2. Get instant HTTPS URL"
echo "3. No router configuration needed"
echo "4. Perfect for testing and sharing"
echo ""

echo "📋 Quick Commands:"
echo "=================="
echo "Check services: ./manage.sh status"
echo "View logs: ./manage.sh logs"
echo "Setup port forwarding: ./setup-port-forwarding.sh"
echo "Setup ngrok: ./setup-ngrok.sh"
echo "Test network: ./test-network.sh"
echo ""

echo "🔒 Security Recommendations:"
echo "============================"
echo "- Enable firewall: sudo ufw enable"
echo "- Use HTTPS/SSL for production"
echo "- Monitor access logs regularly"
echo ""

echo "💡 Need Help?"
echo "============="
echo "- Check router manual for port forwarding"
echo "- Contact ISP if port forwarding doesn't work"
echo "- Use ngrok for immediate access"