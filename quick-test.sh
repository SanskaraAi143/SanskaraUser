#!/bin/bash
echo "=== QUICK SERVER TEST ==="
echo ""

# Kill any existing node processes
pkill -f "vite\|node" 2>/dev/null || true

echo "1. Testing npm run dev..."
npm run dev &
DEV_PID=$!
sleep 3

# Check if dev server is running
if curl -s http://localhost:5173 >/dev/null 2>&1; then
    echo "✅ Dev server working at http://localhost:5173"
else
    echo "❌ Dev server failed"
fi

kill $DEV_PID 2>/dev/null || true
sleep 1

echo ""
echo "2. Testing npm run preview..."
npm run preview &
PREVIEW_PID=$!
sleep 3

# Check if preview server is running
if curl -s http://localhost:4173 >/dev/null 2>&1; then
    echo "✅ Preview server working at http://localhost:4173"
else
    echo "❌ Preview server failed"
fi

kill $PREVIEW_PID 2>/dev/null || true

echo ""
echo "Test completed!"
