@echo off
echo Building production version...
npm run build
if %errorlevel% neq 0 (
    echo Build failed!
    pause
    exit /b 1
)

echo Starting production server...
echo.
echo ^> Production site: http://localhost:8080
echo ^> Press Ctrl+C to stop
echo.
npx serve -s dist -l 8080
