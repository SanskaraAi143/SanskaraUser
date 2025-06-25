#!/usr/bin/env node

/**
 * Performance Analysis Script for Sanskara AI
 * This script analyzes bundle size, performance metrics, and suggests optimizations
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Performance Analysis for Sanskara AI...\n');

// Check bundle sizes
function analyzeBundleSize() {
  console.log('📦 Analyzing Bundle Sizes...');
  
  const distPath = path.join(process.cwd(), 'dist');
  if (!fs.existsSync(distPath)) {
    console.log('❌ Build not found. Please run `npm run build` first.\n');
    return;
  }
  
  try {
    const files = fs.readdirSync(distPath, { recursive: true });
    const jsFiles = files.filter(file => file.endsWith('.js'));
    const cssFiles = files.filter(file => file.endsWith('.css'));
    
    console.log(`✅ Found ${jsFiles.length} JavaScript files and ${cssFiles.length} CSS files`);
    
    let totalJSSize = 0;
    let totalCSSSize = 0;
    
    jsFiles.forEach(file => {
      const filePath = path.join(distPath, file);
      const stats = fs.statSync(filePath);
      totalJSSize += stats.size;
      
      if (stats.size > 100 * 1024) { // Files larger than 100KB
        console.log(`⚠️  Large JS file: ${file} (${(stats.size / 1024).toFixed(1)}KB)`);
      }
    });
    
    cssFiles.forEach(file => {
      const filePath = path.join(distPath, file);
      const stats = fs.statSync(filePath);
      totalCSSSize += stats.size;
      
      if (stats.size > 50 * 1024) { // Files larger than 50KB
        console.log(`⚠️  Large CSS file: ${file} (${(stats.size / 1024).toFixed(1)}KB)`);
      }
    });
    
    console.log(`📊 Total JS Bundle Size: ${(totalJSSize / 1024).toFixed(1)}KB`);
    console.log(`📊 Total CSS Bundle Size: ${(totalCSSSize / 1024).toFixed(1)}KB`);
    
    // Performance recommendations
    if (totalJSSize > 500 * 1024) {
      console.log('🔧 Recommendation: Consider code splitting and lazy loading');
    }
    if (totalCSSSize > 100 * 1024) {
      console.log('🔧 Recommendation: Consider CSS purging and critical CSS extraction');
    }
    
  } catch (error) {
    console.log('❌ Error analyzing bundle:', error.message);
  }
  
  console.log('');
}

// Check image optimization
function checkImageOptimization() {
  console.log('🖼️  Checking Image Optimization...');
  
  const publicPath = path.join(process.cwd(), 'public');
  const srcPath = path.join(process.cwd(), 'src');
  
  function checkImagesInDir(dirPath, dirName) {
    if (!fs.existsSync(dirPath)) return;
    
    const files = fs.readdirSync(dirPath, { recursive: true });
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png|gif|svg|webp|avif)$/i.test(file)
    );
    
    console.log(`📁 ${dirName}: Found ${imageFiles.length} images`);
    
    imageFiles.forEach(file => {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      
      if (stats.size > 500 * 1024) { // Images larger than 500KB
        console.log(`⚠️  Large image: ${file} (${(stats.size / 1024).toFixed(1)}KB)`);
      }
      
      if (/\.(jpg|jpeg|png)$/i.test(file) && !file.includes('.webp')) {
        console.log(`🔧 Consider converting to WebP: ${file}`);
      }
    });
  }
  
  checkImagesInDir(publicPath, 'public');
  checkImagesInDir(srcPath, 'src');
  
  console.log('');
}

// Check for unused dependencies
function checkUnusedDependencies() {
  console.log('📦 Checking for Optimization Opportunities...');
  
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  const heavyPackages = [
    'lodash', 'moment', 'axios', 'three', '@react-three/fiber', '@react-three/drei'
  ];
  
  const foundHeavyPackages = heavyPackages.filter(pkg => dependencies[pkg]);
  
  if (foundHeavyPackages.length > 0) {
    console.log('⚠️  Heavy packages detected:');
    foundHeavyPackages.forEach(pkg => {
      console.log(`   - ${pkg}: Consider tree-shaking or alternatives`);
    });
    
    if (dependencies['lodash']) {
      console.log('🔧 Recommendation: Use lodash-es for better tree-shaking');
    }
    if (dependencies['moment']) {
      console.log('🔧 Recommendation: Consider date-fns or dayjs as lighter alternatives');
    }
  }
  
  console.log('');
}

// Main execution
async function main() {
  analyzeBundleSize();
  checkImageOptimization();
  checkUnusedDependencies();
  
  console.log('✅ Performance analysis complete!');
  console.log('\n📋 Quick Optimization Checklist:');
  console.log('   □ Enable gzip/brotli compression');
  console.log('   □ Implement service worker for caching');
  console.log('   □ Use CDN for static assets');
  console.log('   □ Optimize images with WebP/AVIF');
  console.log('   □ Implement lazy loading for components');
  console.log('   □ Tree-shake unused code');
  console.log('   □ Enable code splitting');
}

main().catch(console.error);
