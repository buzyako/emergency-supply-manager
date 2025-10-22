@echo off
echo 📱 Emergency Supply Manager - Offline Mobile App Setup
echo.

echo 🎯 Goal: Create native mobile apps that work WITHOUT internet
echo.

echo 📋 Choose your method:
echo.
echo 1. PWA Builder (Easiest - No coding required)
echo 2. Capacitor (Advanced - Full native app)
echo 3. Cordova (Alternative)
echo.

set /p choice="Enter your choice (1-3): "

if "%choice%"=="1" goto pwa_builder
if "%choice%"=="2" goto capacitor
if "%choice%"=="3" goto cordova

:pwa_builder
echo.
echo 🚀 PWA Builder Method (Recommended for beginners)
echo.
echo 📋 Steps:
echo 1. Build your web app first
call npm run build
echo.
echo 2. Start your server
echo    Run: npm run start
echo    Your app will be at: http://localhost:3000
echo.
echo 3. Go to PWA Builder
echo    Visit: https://www.pwabuilder.com/
echo    Enter URL: http://localhost:3000
echo    Click "Start"
echo.
echo 4. Download APK
echo    Select "Android"
echo    Click "Download"
echo    Install APK on your phone
echo.
echo ✅ Your app will work completely offline!
goto end

:capacitor
echo.
echo 🔧 Capacitor Method (Advanced)
echo.
echo Installing Capacitor...
call npm install -g @capacitor/cli
call npm install @capacitor/core @capacitor/cli
call npm install @capacitor/android

echo.
echo Building web app...
call npm run build

echo.
echo Setting up mobile app...
call npx cap init "Emergency Supply Manager" "com.emergency.supply.manager"
call npx cap add android
call npx cap sync

echo.
echo 📱 Next Steps:
echo 1. Install Android Studio
echo 2. Open project: android folder
echo 3. Build and run on device
echo.
goto end

:cordova
echo.
echo 🛠️ Cordova Method
echo.
echo Installing Cordova...
call npm install -g cordova

echo.
echo Creating Cordova project...
call cordova create emergency-supply-mobile com.emergency.supply.manager "Emergency Supply Manager"
cd emergency-supply-mobile
call cordova platform add android

echo.
echo 📱 Next Steps:
echo 1. Copy your built web app to www folder
echo 2. Build: cordova build android
echo 3. Install APK on device
echo.
goto end

:end
echo.
echo 🎉 Setup complete!
echo.
echo 📱 Your Emergency Supply Manager will have:
echo - 🙏 Daily Inspirational Quotes
echo - 📊 Progress Tracking
echo - ✅ Emergency Kit Check
echo - 🇵🇭 Philippines Hazard Awareness
echo - 📱 Native mobile experience
echo - 🔌 Works completely offline!
echo.
pause
