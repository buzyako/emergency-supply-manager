#!/bin/bash

# Emergency Supply Manager - Setup Script
# This script sets up the development environment

echo "🛡️ Emergency Supply Manager - Setup Script"
echo "=========================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if package manager is available
if command -v pnpm &> /dev/null; then
    PACKAGE_MANAGER="pnpm"
elif command -v yarn &> /dev/null; then
    PACKAGE_MANAGER="yarn"
elif command -v npm &> /dev/null; then
    PACKAGE_MANAGER="npm"
else
    echo "❌ No package manager found. Please install npm, yarn, or pnpm."
    exit 1
fi

echo "✅ Using package manager: $PACKAGE_MANAGER"

# Install dependencies
echo "📦 Installing dependencies..."
$PACKAGE_MANAGER install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Create environment file if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "📝 Creating environment configuration..."
    cat > .env.local << EOF
# Emergency Supply Manager - Local Development Environment
NEXT_PUBLIC_APP_NAME="Emergency Supply Manager"
NEXT_PUBLIC_APP_VERSION="1.0.0"
NEXT_PUBLIC_APP_DESCRIPTION="Emergency preparedness and supply management system"
NODE_ENV=development
NEXT_PUBLIC_DEV_MODE=true
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
NEXT_PUBLIC_DEFAULT_EXPIRY_ALERT_DAYS=7
NEXT_PUBLIC_DEFAULT_KIT_CHECK_DAYS=90
EOF
    echo "✅ Environment file created"
else
    echo "✅ Environment file already exists"
fi

# Run type checking
echo "🔍 Running type checking..."
$PACKAGE_MANAGER run type-check

if [ $? -ne 0 ]; then
    echo "⚠️  Type checking found issues, but continuing..."
else
    echo "✅ Type checking passed"
fi

# Run linting
echo "🧹 Running linting..."
$PACKAGE_MANAGER run lint

if [ $? -ne 0 ]; then
    echo "⚠️  Linting found issues, but continuing..."
else
    echo "✅ Linting passed"
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Run '$PACKAGE_MANAGER run dev' to start the development server"
echo "2. Open http://localhost:3000 in your browser"
echo "3. Start managing your emergency supplies!"
echo ""
echo "Available commands:"
echo "  $PACKAGE_MANAGER run dev     - Start development server"
echo "  $PACKAGE_MANAGER run build   - Build for production"
echo "  $PACKAGE_MANAGER run start   - Start production server"
echo "  $PACKAGE_MANAGER run preview - Build and preview production"
echo ""
