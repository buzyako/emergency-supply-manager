@echo off
echo 📱 Emergency Supply Manager - APK Creation
echo.

echo 🏗️ Building web application...
call npm run build

echo.
echo 📦 Creating APK using PWA Builder method...
echo.
echo 📋 Manual Steps:
echo 1. Go to: https://www.pwabuilder.com/
echo 2. Enter your URL: http://192.168.1.4:3000
echo 3. Click "Start"
echo 4. Select "Android" platform
echo 5. Click "Download" to get APK
echo 6. Transfer APK to your phone
echo 7. Enable "Install from Unknown Sources"
echo 8. Install the APK
echo.

echo 🔧 Alternative: Use TWA Builder
echo 1. Go to: https://www.twa-builder.com/
echo 2. Enter your URL: http://192.168.1.4:3000
echo 3. Configure app details
echo 4. Generate and download APK
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
