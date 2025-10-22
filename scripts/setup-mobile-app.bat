@echo off
echo 📱 Emergency Supply Manager - Mobile App Setup
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js is installed
echo.

REM Install Capacitor
echo 🔧 Installing Capacitor...
call npm install -g @capacitor/cli
call npm install @capacitor/core @capacitor/cli
call npm install @capacitor/android

echo.
echo 🏗️ Building web application...
call npm run build

echo.
echo 📱 Setting up mobile app...
call npx cap init "Emergency Supply Manager" "com.emergency.supply.manager"
call npx cap add android

echo.
echo 🔄 Syncing to mobile platform...
call npx cap sync

echo.
echo 🎉 Mobile app setup complete!
echo.
echo 📱 Next Steps:
echo 1. Install Android Studio from: https://developer.android.com/studio
echo 2. Open Android Studio
echo 3. Open the project: android folder
echo 4. Build and run on your device
echo.
echo 🔧 Alternative: Use PWA Builder
echo 1. Go to: https://www.pwabuilder.com/
echo 2. Enter: http://192.168.1.4:3000
echo 3. Click "Start" and select "Android"
echo 4. Download APK and install on your phone
echo.
pause
