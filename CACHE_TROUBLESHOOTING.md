# 🛠️ BROWSER CACHE TROUBLESHOOTING GUIDE

## **Common Preview Server Issues & Solutions**

### **Symptoms:**
- Blank page on `npm run preview`
- MIME type errors: "Expected JavaScript but got text/html"
- 404 errors for CSS/JS files that exist
- Old cached versions loading

### **Quick Fixes:**

#### **Chrome/Edge:**
1. **Hard Refresh:** `Ctrl + Shift + R`
2. **Clear Site Data:** F12 → Application → Storage → Clear Storage
3. **Disable Cache:** F12 → Network → ✅ Disable cache

#### **Firefox:**
1. **Hard Refresh:** `Ctrl + Shift + R`
2. **Clear Cache:** `Ctrl + Shift + Delete`

#### **All Browsers:**
1. **Incognito/Private Mode** - Always test here first
2. **Clear Service Workers:** F12 → Application → Service Workers → Unregister

### **Alternative Preview Methods:**
```bash
# Method 1: Using serve (recommended)
npm install -g serve
serve dist -p 4173

# Method 2: Using Python
python -m http.server 4173 --directory dist

# Method 3: Using Node.js
npx http-server dist -p 4173
```

### **Performance Testing:**
```bash
npm run build
npm run preview
# Test at http://localhost:4173
```
