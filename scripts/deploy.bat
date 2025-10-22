@echo off
REM Emergency Supply Manager - Windows Production Deployment Script
REM This script builds and deploys the application for production

echo 🛡️ Emergency Supply Manager - Production Deployment
echo ==================================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

echo ✅ Node.js detected: 
node --version

REM Check if package manager is available
set PACKAGE_MANAGER=npm
pnpm --version >nul 2>&1
if %errorlevel% equ 0 (
    set PACKAGE_MANAGER=pnpm
) else (
    yarn --version >nul 2>&1
    if %errorlevel% equ 0 (
        set PACKAGE_MANAGER=yarn
    )
)

echo ✅ Using package manager: %PACKAGE_MANAGER%

REM Install dependencies
echo 📦 Installing dependencies...
%PACKAGE_MANAGER% install --legacy-peer-deps

if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully

REM Run type checking
echo 🔍 Running type checking...
%PACKAGE_MANAGER% run type-check

if %errorlevel% neq 0 (
    echo ❌ Type checking failed. Please fix errors before deploying.
    pause
    exit /b 1
)

echo ✅ Type checking passed

REM Run linting
echo 🧹 Running linting...
%PACKAGE_MANAGER% run lint

if %errorlevel% neq 0 (
    echo ⚠️  Linting found issues, but continuing with deployment...
) else (
    echo ✅ Linting passed
)

REM Build the application
echo 🏗️ Building application for production...
%PACKAGE_MANAGER% run build

if %errorlevel% neq 0 (
    echo ❌ Build failed. Please fix errors before deploying.
    pause
    exit /b 1
)

echo ✅ Production build completed successfully

REM Create production environment file
echo 📝 Creating production environment...
(
    echo # Emergency Supply Manager - Production Environment
    echo NEXT_PUBLIC_APP_NAME="Emergency Supply Manager"
    echo NEXT_PUBLIC_APP_VERSION="1.0.0"
    echo NEXT_PUBLIC_APP_DESCRIPTION="Emergency preparedness and supply management system"
    echo NODE_ENV=production
    echo NEXT_PUBLIC_DEV_MODE=false
    echo NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
    echo NEXT_PUBLIC_DEFAULT_EXPIRY_ALERT_DAYS=7
    echo NEXT_PUBLIC_DEFAULT_KIT_CHECK_DAYS=90
) > .env.production

echo ✅ Production environment configured

echo.
echo 🎉 Deployment completed successfully!
echo.
echo Production build is ready in the .next/ directory
echo.
echo To start the production server:
echo   %PACKAGE_MANAGER% start
echo.
echo To preview the production build:
echo   %PACKAGE_MANAGER% run preview
echo.
echo The application is now ready for deployment to your hosting platform.
echo.
pause
