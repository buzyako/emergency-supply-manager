@echo off
REM Emergency Supply Manager - Production Startup Script for Windows
REM This script sets up and starts the Emergency Supply Manager for self-hosting

echo 🚀 Starting Emergency Supply Manager Production Setup...

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed. Please install Docker Desktop first.
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose is not installed. Please install Docker Compose first.
    pause
    exit /b 1
)

REM Create necessary directories
echo 📁 Creating necessary directories...
if not exist "data" mkdir data
if not exist "ssl" mkdir ssl
if not exist "logs" mkdir logs

REM Build the application
echo 🔨 Building Emergency Supply Manager...
docker-compose build --no-cache

REM Start the services
echo 🚀 Starting services...
docker-compose up -d

REM Wait for services to be ready
echo ⏳ Waiting for services to start...
timeout /t 30 /nobreak >nul

REM Check if services are running
echo 🔍 Checking service status...
docker-compose ps

REM Test the application
echo 🧪 Testing application...
curl -f http://localhost:3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Emergency Supply Manager is running successfully!
    echo 🌐 Access your app at: http://localhost:3000
    echo 📱 PWA features are enabled for mobile installation
    echo 🙏 Daily inspirational quotes are active
    echo 🇵🇭 Philippines-specific features are configured
) else (
    echo ❌ Application failed to start. Check logs with: docker-compose logs
    pause
    exit /b 1
)

echo.
echo 🎉 Emergency Supply Manager is now running in production mode!
echo.
echo 📊 Features Available:
echo   🙏 Daily Inspirational Quotes
echo   📊 Progress Tracking
echo   ✅ Emergency Kit Check
echo   🇵🇭 Philippines Hazard Awareness
echo   📱 PWA Mobile Installation
echo.
echo 🔧 Management Commands:
echo   View logs: docker-compose logs -f
echo   Stop services: docker-compose down
echo   Restart: docker-compose restart
echo   Update: git pull && docker-compose up --build -d
echo.
echo 📖 For more information, see SELF_HOSTING_GUIDE.md
pause
