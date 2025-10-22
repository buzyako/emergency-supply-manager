@echo off
echo 📱 Emergency Supply Manager - Mobile App Creation
echo.

echo 🎯 Goal: Create APK that works completely offline
echo.

echo 📋 Method 1: TWA Builder (Easiest)
echo 1. Make sure your server is running: http://192.168.1.4:3000
echo 2. Go to: https://www.twa-builder.com/
echo 3. Enter URL: http://192.168.1.4:3000
echo 4. Configure app details:
echo    - App Name: Emergency Supply Manager
echo    - Package: com.emergency.supply.manager
echo    - Icon: Upload your icon
echo 5. Generate APK
echo 6. Download and install on phone
echo.

echo 📋 Method 2: Manual WebView APK
echo 1. Download Android Studio
echo 2. Create new project with WebView
echo 3. Load URL: http://192.168.1.4:3000
echo 4. Build APK
echo.

echo 📋 Method 3: Use ngrok for public URL
echo 1. Install ngrok: https://ngrok.com/
echo 2. Run: ngrok http 3000
echo 3. Use the public URL in PWA Builder
echo.

echo 🚀 Let's try Method 1 (TWA Builder) first...
echo.
echo 📱 Steps:
echo 1. Make sure your server is running: http://192.168.1.4:3000
echo 2. Go to: https://www.twa-builder.com/
echo 3. Enter URL: http://192.168.1.4:3000
echo 4. Configure your app
echo 5. Generate APK
echo.

echo 🔧 If TWA Builder doesn't work, try ngrok:
echo 1. Download ngrok from: https://ngrok.com/
echo 2. Extract and run: ngrok.exe http 3000
echo 3. Copy the public URL (like https://abc123.ngrok.io)
echo 4. Use that URL in PWA Builder
echo.

pause
