@echo off
title Sanskara AI - Development Workflow
echo ================================
echo   Sanskara AI Development Server
echo ================================
echo.

:loop
echo [%time%] Building project...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Build failed! Check the errors above.
    pause
    goto loop
)

echo [%time%] Build successful! Starting preview server...
echo.
echo ^> Website: http://localhost:4173
echo ^> Press Ctrl+C to rebuild after making changes
echo.
call npm run preview
goto loop
