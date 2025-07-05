@echo off
echo Testing dev and preview servers...

echo.
echo === TESTING DEV SERVER ===
echo Starting dev server on port 5173...
start /B cmd /c "npm run dev > nul 2>&1"
timeout /t 5 /nobreak > nul
curl -s http://localhost:5173 > nul
if %errorlevel% == 0 (
    echo ✅ Dev server is working!
) else (
    echo ❌ Dev server failed to start
)

echo.
echo === TESTING PREVIEW SERVER ===
echo Starting preview server on port 4173...
start /B cmd /c "npm run preview > nul 2>&1"
timeout /t 5 /nobreak > nul
curl -s http://localhost:4173 > nul
if %errorlevel% == 0 (
    echo ✅ Preview server is working!
) else (
    echo ❌ Preview server failed to start
)

echo.
echo Servers tested (logs suppressed for clean workspace)
pause
