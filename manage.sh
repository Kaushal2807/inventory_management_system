#!/bin/bash

# Inventory Management System - Service Control Script
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

show_help() {
    echo "Inventory Management System - Service Controller"
    echo "Usage: ./manage.sh [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start     - Start all services"
    echo "  stop      - Stop all services"
    echo "  restart   - Restart all services"
    echo "  status    - Show service status"
    echo "  logs      - Show backend logs"
    echo "  update    - Update and restart services"
    echo "  info      - Show application information"
    echo "  public    - Create public URL (works from any network)"
    echo ""
}

start_services() {
    print_info "Starting services..."
    sudo systemctl start inventory-backend
    sudo systemctl start nginx
    
    if sudo systemctl is-active --quiet inventory-backend && sudo systemctl is-active --quiet nginx; then
        print_status "All services started successfully"
        show_info
    else
        print_error "Failed to start some services"
    fi
}

stop_services() {
    print_info "Stopping services..."
    sudo systemctl stop inventory-backend
    sudo systemctl stop nginx
    print_status "Services stopped"
}

restart_services() {
    print_info "Restarting services..."
    sudo systemctl restart inventory-backend
    sudo systemctl restart nginx
    
    if sudo systemctl is-active --quiet inventory-backend && sudo systemctl is-active --quiet nginx; then
        print_status "Services restarted successfully"
    else
        print_error "Failed to restart some services"
    fi
}

show_status() {
    echo "Service Status:"
    echo "==============="
    echo -n "Backend: "
    if sudo systemctl is-active --quiet inventory-backend; then
        echo -e "${GREEN}Running${NC}"
    else
        echo -e "${RED}Stopped${NC}"
    fi
    
    echo -n "Nginx:   "
    if sudo systemctl is-active --quiet nginx; then
        echo -e "${GREEN}Running${NC}"
    else
        echo -e "${RED}Stopped${NC}"
    fi
    
    echo ""
    echo "Detailed Status:"
    sudo systemctl status inventory-backend --no-pager -l
    echo ""
    sudo systemctl status nginx --no-pager -l
}

show_logs() {
    print_info "Showing backend logs (Press Ctrl+C to exit)..."
    sudo journalctl -u inventory-backend -f
}

update_app() {
    print_info "Updating application..."
    
    # Stop services
    sudo systemctl stop inventory-backend
    
    # Update frontend
    cd frontend
    npm run build
    cd ..
    
    # Restart services
    sudo systemctl start inventory-backend
    sudo systemctl restart nginx
    
    print_status "Application updated and restarted"
}

show_info() {
    echo ""
    echo "📱 Application Information:"
    echo "=========================="
    echo "Local URL:    http://localhost"
    echo "Network URL:  http://$(hostname -I | awk '{print $1}')"
    echo "Backend API:  http://$(hostname -I | awk '{print $1}')/api"
    echo ""
    echo "🌐 For Public Access (Any Network):"
    echo "==================================="
    echo "Run: ./manage.sh public"
    echo "  or ./create-public-url.sh"
    echo ""
    echo "Database:     $(pwd)/backend/inventory.db"
    echo ""
}

create_public_url() {
    print_info "Creating public URL accessible from any network..."
    ./create-public-url.sh
}

case "$1" in
    start)
        start_services
        ;;
    stop)
        stop_services
        ;;
    restart)
        restart_services
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs
        ;;
    update)
        update_app
        ;;
    info)
        show_info
        ;;
    public)
        create_public_url
        ;;
    *)
        show_help
        ;;
esac