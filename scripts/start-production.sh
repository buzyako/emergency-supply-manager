#!/bin/bash

# Emergency Supply Manager - Production Startup Script
# This script sets up and starts the Emergency Supply Manager for self-hosting

set -e

echo "🚀 Starting Emergency Supply Manager Production Setup..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p data
mkdir -p ssl
mkdir -p logs

# Set proper permissions
echo "🔐 Setting permissions..."
chmod +x scripts/*.sh
chmod 755 data
chmod 755 ssl
chmod 755 logs

# Build the application
echo "🔨 Building Emergency Supply Manager..."
docker-compose build --no-cache

# Start the services
echo "🚀 Starting services..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Check if services are running
echo "🔍 Checking service status..."
docker-compose ps

# Test the application
echo "🧪 Testing application..."
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Emergency Supply Manager is running successfully!"
    echo "🌐 Access your app at: http://localhost:3000"
    echo "📱 PWA features are enabled for mobile installation"
    echo "🙏 Daily inspirational quotes are active"
    echo "🇵🇭 Philippines-specific features are configured"
else
    echo "❌ Application failed to start. Check logs with: docker-compose logs"
    exit 1
fi

echo ""
echo "🎉 Emergency Supply Manager is now running in production mode!"
echo ""
echo "📊 Features Available:"
echo "  🙏 Daily Inspirational Quotes"
echo "  📊 Progress Tracking"
echo "  ✅ Emergency Kit Check"
echo "  🇵🇭 Philippines Hazard Awareness"
echo "  📱 PWA Mobile Installation"
echo ""
echo "🔧 Management Commands:"
echo "  View logs: docker-compose logs -f"
echo "  Stop services: docker-compose down"
echo "  Restart: docker-compose restart"
echo "  Update: git pull && docker-compose up --build -d"
echo ""
echo "📖 For more information, see SELF_HOSTING_GUIDE.md"
