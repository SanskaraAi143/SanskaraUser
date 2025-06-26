@echo off
echo Building for development...
npm run build
if %errorlevel% equ 0 (
    echo ✅ Build complete! Refresh your browser at http://localhost:4173
) else (
    echo ❌ Build failed!
)
