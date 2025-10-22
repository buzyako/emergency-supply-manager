#!/bin/bash

# Emergency Supply Manager - Production Deployment Script
# This script builds and deploys the application for production

echo "🛡️ Emergency Supply Manager - Production Deployment"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
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
$PACKAGE_MANAGER install --legacy-peer-deps

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Run type checking
echo "🔍 Running type checking..."
$PACKAGE_MANAGER run type-check

if [ $? -ne 0 ]; then
    echo "❌ Type checking failed. Please fix errors before deploying."
    exit 1
fi

echo "✅ Type checking passed"

# Run linting
echo "🧹 Running linting..."
$PACKAGE_MANAGER run lint

if [ $? -ne 0 ]; then
    echo "⚠️  Linting found issues, but continuing with deployment..."
else
    echo "✅ Linting passed"
fi

# Build the application
echo "🏗️ Building application for production..."
$PACKAGE_MANAGER run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix errors before deploying."
    exit 1
fi

echo "✅ Production build completed successfully"

# Create production environment file
echo "📝 Creating production environment..."
cat > .env.production << EOF
# Emergency Supply Manager - Production Environment
NEXT_PUBLIC_APP_NAME="Emergency Supply Manager"
NEXT_PUBLIC_APP_VERSION="1.0.0"
NEXT_PUBLIC_APP_DESCRIPTION="Emergency preparedness and supply management system"
NODE_ENV=production
NEXT_PUBLIC_DEV_MODE=false
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
NEXT_PUBLIC_DEFAULT_EXPIRY_ALERT_DAYS=7
NEXT_PUBLIC_DEFAULT_KIT_CHECK_DAYS=90
EOF

echo "✅ Production environment configured"

echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "Production build is ready in the .next/ directory"
echo ""
echo "To start the production server:"
echo "  $PACKAGE_MANAGER start"
echo ""
echo "To preview the production build:"
echo "  $PACKAGE_MANAGER run preview"
echo ""
echo "The application is now ready for deployment to your hosting platform."
echo ""
