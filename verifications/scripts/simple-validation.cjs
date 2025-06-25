#!/usr/bin/env node
/**
 * Simple YC-Grade Validation Check
 */

const puppeteer = require('puppeteer');

async function simpleValidation() {
  console.log('🚀 SIMPLE YC VALIDATION CHECK');
  console.log('======================================');
  
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    // Set a shorter timeout
    page.setDefaultTimeout(5000);
    
    await page.goto('http://localhost:4173', { waitUntil: 'networkidle0', timeout: 10000 });
    
    // Check basic metrics
    const metrics = await page.metrics();
    const title = await page.title();
    
    // Check images
    const images = await page.$$eval('img', imgs => 
      imgs.map(img => ({ src: img.src, alt: img.alt, loading: img.loading }))
    );
    
    // Check security headers (simulated)
    const hasCSP = await page.$('meta[http-equiv="Content-Security-Policy"]');
    const hasXFrameOptions = await page.$('meta[http-equiv="X-Frame-Options"]');
    
    console.log(`📄 Title: ${title}`);
    console.log(`🖼️  Images: ${images.length} found`);
    console.log(`📊 JS Heap: ${Math.round(metrics.JSHeapUsedSize / 1024 / 1024)}MB`);
    console.log(`🔒 Security Headers: CSP=${!!hasCSP}, X-Frame=${!!hasXFrameOptions}`);
    
    // Check for WebP usage
    const webpImages = images.filter(img => img.src.includes('.webp'));
    console.log(`⚡ WebP Images: ${webpImages.length}/${images.length}`);
    
    // Simple scoring
    let score = 0;
    if (title.includes('Sanskara')) score += 20;
    if (webpImages.length > 0) score += 30;
    if (hasCSP && hasXFrameOptions) score += 30;
    if (metrics.JSHeapUsedSize < 50 * 1024 * 1024) score += 20; // Under 50MB
    
    console.log(`\n🎯 Quick Score: ${score}/100`);
    
    if (score >= 80) {
      console.log('✅ GOOD - YC Ready!');
    } else if (score >= 60) {
      console.log('🟡 FAIR - Almost there!');
    } else {
      console.log('🔴 NEEDS WORK - Keep improving!');
    }
    
    await browser.close();
    
  } catch (error) {
    console.error('❌ Validation failed:', error.message);
  }
}

simpleValidation();
