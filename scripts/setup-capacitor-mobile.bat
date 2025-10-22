@echo off
echo 📱 Emergency Supply Manager - Capacitor Mobile App Setup
echo.

echo 🔧 Installing Capacitor for native mobile app...
echo.

REM Install Capacitor
echo 📦 Installing Capacitor...
call npm install @capacitor/core @capacitor/cli @capacitor/android

echo.
echo 🏗️ Building web application...
call npm run build

echo.
echo 📱 Setting up Capacitor...
call npx cap init "Emergency Supply Manager" "com.emergency.supply.manager"
call npx cap add android

echo.
echo 🔄 Syncing to Android platform...
call npx cap sync

echo.
echo 🎉 Capacitor setup complete!
echo.
echo 📱 Next Steps:
echo 1. Install Android Studio from: https://developer.android.com/studio
echo 2. Open Android Studio
echo 3. Open the project: android folder
echo 4. Connect your Android device or use emulator
echo 5. Click "Run" to build and install on device
echo.
echo 🔧 Alternative: Use TWA Builder
echo 1. Go to: https://www.twa-builder.com/
echo 2. Enter URL: http://192.168.1.4:3000
echo 3. Configure app details
echo 4. Generate APK
echo.
echo 📱 Your app will work completely offline!
echo Features included:
echo - 🙏 Daily Inspirational Quotes
echo - 📊 Progress Tracking
echo - ✅ Emergency Kit Check
echo - 🇵🇭 Philippines Hazard Awareness
echo - 📱 Native mobile experience
echo.
pause
