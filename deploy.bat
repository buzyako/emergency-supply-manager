@echo off
echo 🚀 Emergency Supply Manager - Quick Deploy
echo.

REM Stop any running development server
echo 📴 Stopping development server...
taskkill /F /IM node.exe >nul 2>&1

REM Build the application
echo 🔨 Building for production...
call npm run build

REM Start production server
echo 🚀 Starting production server...
echo.
echo ✅ Emergency Supply Manager is now running in production mode!
echo 🌐 Access your app at: http://localhost:3000
echo.
echo 📊 Features Available:
echo   🙏 Daily Inspirational Quotes
echo   📊 Progress Tracking  
echo   ✅ Emergency Kit Check
echo   🇵🇭 Philippines Hazard Awareness
echo   📱 PWA Mobile Installation
echo.
echo Press Ctrl+C to stop the server
echo.

call npm run start
