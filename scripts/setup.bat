@echo off
REM Emergency Supply Manager - Windows Setup Script
REM This script sets up the development environment on Windows

echo 🛡️ Emergency Supply Manager - Setup Script
echo ==========================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    echo    Download from: https://nodejs.org/
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
%PACKAGE_MANAGER% install

if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully

REM Create environment file if it doesn't exist
if not exist ".env.local" (
    echo 📝 Creating environment configuration...
    (
        echo # Emergency Supply Manager - Local Development Environment
        echo NEXT_PUBLIC_APP_NAME="Emergency Supply Manager"
        echo NEXT_PUBLIC_APP_VERSION="1.0.0"
        echo NEXT_PUBLIC_APP_DESCRIPTION="Emergency preparedness and supply management system"
        echo NODE_ENV=development
        echo NEXT_PUBLIC_DEV_MODE=true
        echo NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
        echo NEXT_PUBLIC_DEFAULT_EXPIRY_ALERT_DAYS=7
        echo NEXT_PUBLIC_DEFAULT_KIT_CHECK_DAYS=90
    ) > .env.local
    echo ✅ Environment file created
) else (
    echo ✅ Environment file already exists
)

REM Run type checking
echo 🔍 Running type checking...
%PACKAGE_MANAGER% run type-check

if %errorlevel% neq 0 (
    echo ⚠️  Type checking found issues, but continuing...
) else (
    echo ✅ Type checking passed
)

REM Run linting
echo 🧹 Running linting...
%PACKAGE_MANAGER% run lint

if %errorlevel% neq 0 (
    echo ⚠️  Linting found issues, but continuing...
) else (
    echo ✅ Linting passed
)

echo.
echo 🎉 Setup completed successfully!
echo.
echo Next steps:
echo 1. Run '%PACKAGE_MANAGER% run dev' to start the development server
echo 2. Open http://localhost:3000 in your browser
echo 3. Start managing your emergency supplies!
echo.
echo Available commands:
echo   %PACKAGE_MANAGER% run dev     - Start development server
echo   %PACKAGE_MANAGER% run build   - Build for production
echo   %PACKAGE_MANAGER% run start   - Start production server
echo   %PACKAGE_MANAGER% run preview - Build and preview production
echo.
pause
