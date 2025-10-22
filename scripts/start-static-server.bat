@echo off
echo 📱 Emergency Supply Manager - Static Server for Mobile App
echo.

echo 🏗️ Building static version...
call npm run build

echo.
echo 📁 Creating static server...
if not exist "static-server" mkdir static-server
xcopy /E /I "out" "static-server"

echo.
echo 🚀 Starting static server...
cd static-server
echo Starting server on http://192.168.1.4:8080
echo.
echo 📱 Now you can use TWA Builder:
echo 1. Go to: https://www.twa-builder.com/
echo 2. Enter URL: http://192.168.1.4:8080
echo 3. Configure your app
echo 4. Generate APK
echo.
echo Press Ctrl+C to stop the server
echo.

python -m http.server 8080
