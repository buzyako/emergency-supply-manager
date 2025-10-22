@echo off
echo 📱 Emergency Supply Manager - Mobile Package Creation
echo.

echo 🎯 Creating a mobile-ready package that works without network issues...
echo.

REM Create mobile package directory
if not exist "mobile-package" mkdir mobile-package
if not exist "mobile-package\www" mkdir mobile-package\www

echo 📁 Copying static files...
xcopy /E /I "out" "mobile-package\www"

echo.
echo 📱 Creating mobile app package...
echo.

echo 🎉 Mobile package created successfully!
echo.
echo 📋 What you can do now:
echo.
echo 📱 Method 1: Transfer to Mobile
echo 1. Copy the "mobile-package" folder to your phone
echo 2. Open any file manager on your phone
echo 3. Navigate to the mobile-package folder
echo 4. Open index.html in your browser
echo 5. Add to home screen
echo.

echo 📱 Method 2: Use TWA Builder
echo 1. Upload the mobile-package folder to any web hosting
echo 2. Get the public URL
echo 3. Use that URL in TWA Builder
echo.

echo 📱 Method 3: Create APK with Android Studio
echo 1. Download Android Studio
echo 2. Create new project with WebView
echo 3. Copy mobile-package contents to assets
echo 4. Build APK
echo.

echo 📁 Your mobile package is in: mobile-package folder
echo 📱 All files are ready for mobile installation!
echo.

pause
