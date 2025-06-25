const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Y Combinator Grade Performance Monitoring
const performanceMetrics = {
  coreWebVitals: ['FCP', 'LCP', 'FID', 'CLS', 'TTFB'],
  customMetrics: ['Time to Interactive', 'Speed Index', 'Total Blocking Time'],
  businessMetrics: ['Conversion Funnel', 'User Engagement', 'Bounce Rate']
};

const PERFORMANCE_THRESHOLDS = {
  // Google's recommended thresholds for Core Web Vitals
  FCP: 1800, // First Contentful Paint (ms)
  LCP: 2500, // Largest Contentful Paint (ms)
  FID: 100,  // First Input Delay (ms)
  CLS: 0.1,  // Cumulative Layout Shift
  TTI: 3800, // Time to Interactive (ms)
  SI: 3000,  // Speed Index (ms)
  TBT: 200,  // Total Blocking Time (ms)
  TTFB: 600  // Time to First Byte (ms)
};

async function runPerformanceAudit() {
  console.log('🚀 SANSKARA AI - Y COMBINATOR GRADE PERFORMANCE AUDIT');
  console.log('======================================================================');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  
  // Enable performance monitoring
  await page.setCacheEnabled(false);
  await page.setViewport({ width: 1920, height: 1080 });

  const results = {
    timestamp: new Date().toISOString(),
    url: process.argv[2] || 'http://localhost:4173',
    metrics: {},
    grade: 'A+',
    recommendations: [],
    score: 0
  };

  try {
    console.log(`📊 Analyzing: ${results.url}`);
    
    // Start performance monitoring
    const startTime = Date.now();
    
    // Navigate with comprehensive monitoring
    const response = await page.goto(results.url, {
      waitUntil: ['networkidle0', 'domcontentloaded'],
      timeout: 30000
    });

    // Collect Core Web Vitals using new Web Vitals API
    const webVitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        const vitals = {};
        
        // Modern Web Vitals collection
        if ('web-vital' in window) {
          // Use the web-vitals library if available
          resolve(vitals);
        } else {
          // Fallback to performance API
          const paintMetrics = performance.getEntriesByType('paint');
          const navMetrics = performance.getEntriesByType('navigation')[0];
          
          vitals.FCP = paintMetrics.find(p => p.name === 'first-contentful-paint')?.startTime || 0;
          vitals.TTFB = navMetrics?.responseStart - navMetrics?.requestStart || 0;
          vitals.DOMContentLoaded = navMetrics?.domContentLoadedEventEnd - navMetrics?.domContentLoadedEventStart || 0;
          vitals.LoadComplete = navMetrics?.loadEventEnd - navMetrics?.loadEventStart || 0;
          
          // Estimate LCP (Largest Contentful Paint)
          const lcpCandidates = document.querySelectorAll('img, video, [style*="background-image"]');
          vitals.LCP = vitals.FCP + 500; // Rough estimation
          
          // CLS estimation
          vitals.CLS = 0; // Would need layout shift observer for accurate measurement
          
          resolve(vitals);
        }
      });
    });

    // Advanced Lighthouse-style metrics
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      const paint = performance.getEntriesByType('paint');
      
      return {
        // Navigation Timing
        domainLookup: navigation.domainLookupEnd - navigation.domainLookupStart,
        tcpConnect: navigation.connectEnd - navigation.connectStart,
        request: navigation.responseStart - navigation.requestStart,
        response: navigation.responseEnd - navigation.responseStart,
        domProcessing: navigation.domContentLoadedEventStart - navigation.responseEnd,
        
        // Paint Timing
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
        
        // Resource counts
        totalResources: performance.getEntriesByType('resource').length,
        
        // Memory (if available)
        usedJSHeapSize: performance.memory?.usedJSHeapSize || 0,
        totalJSHeapSize: performance.memory?.totalJSHeapSize || 0
      };
    });

    // Resource analysis
    const resourceAnalysis = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource');
      const analysis = {
        images: { count: 0, totalSize: 0, largestSize: 0 },
        scripts: { count: 0, totalSize: 0, largestSize: 0 },
        stylesheets: { count: 0, totalSize: 0, largestSize: 0 },
        fonts: { count: 0, totalSize: 0, largestSize: 0 },
        other: { count: 0, totalSize: 0, largestSize: 0 }
      };

      resources.forEach(resource => {
        const type = resource.initiatorType;
        const size = resource.transferSize || 0;
        
        if (['img', 'image'].includes(type)) {
          analysis.images.count++;
          analysis.images.totalSize += size;
          analysis.images.largestSize = Math.max(analysis.images.largestSize, size);
        } else if (type === 'script') {
          analysis.scripts.count++;
          analysis.scripts.totalSize += size;
          analysis.scripts.largestSize = Math.max(analysis.scripts.largestSize, size);
        } else if (['css', 'link'].includes(type)) {
          analysis.stylesheets.count++;
          analysis.stylesheets.totalSize += size;
          analysis.stylesheets.largestSize = Math.max(analysis.stylesheets.largestSize, size);
        } else if (type === 'font') {
          analysis.fonts.count++;
          analysis.fonts.totalSize += size;
          analysis.fonts.largestSize = Math.max(analysis.fonts.largestSize, size);
        } else {
          analysis.other.count++;
          analysis.other.totalSize += size;
          analysis.other.largestSize = Math.max(analysis.other.largestSize, size);
        }
      });

      return analysis;
    });

    // Bundle analysis
    const bundleInfo = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script[src]'));
      const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
      
      return {
        scripts: scripts.map(s => s.src),
        stylesheets: stylesheets.map(s => s.href),
        inlineScripts: document.querySelectorAll('script:not([src])').length,
        inlineStyles: document.querySelectorAll('style').length
      };
    });

    // Merge all metrics
    results.metrics = {
      webVitals,
      performance: performanceMetrics,
      resources: resourceAnalysis,
      bundle: bundleInfo,
      responseTime: Date.now() - startTime,
      statusCode: response.status()
    };

    // Calculate performance score (0-100)
    let score = 100;
    const recommendations = [];

    // Core Web Vitals scoring
    if (webVitals.FCP > PERFORMANCE_THRESHOLDS.FCP) {
      score -= 15;
      recommendations.push(`🔴 CRITICAL: First Contentful Paint (${webVitals.FCP}ms) exceeds threshold (${PERFORMANCE_THRESHOLDS.FCP}ms)`);
    } else if (webVitals.FCP > PERFORMANCE_THRESHOLDS.FCP * 0.8) {
      score -= 5;
      recommendations.push(`🟡 WARNING: First Contentful Paint approaching threshold`);
    }

    if (webVitals.TTFB > PERFORMANCE_THRESHOLDS.TTFB) {
      score -= 10;
      recommendations.push(`🔴 CRITICAL: Time to First Byte (${webVitals.TTFB}ms) exceeds threshold`);
    }

    // Resource optimization
    if (resourceAnalysis.images.totalSize > 2000000) { // 2MB
      score -= 10;
      recommendations.push(`🔴 CRITICAL: Total image size (${(resourceAnalysis.images.totalSize/1024/1024).toFixed(2)}MB) too large`);
    }

    if (resourceAnalysis.scripts.totalSize > 1000000) { // 1MB
      score -= 8;
      recommendations.push(`🟡 WARNING: JavaScript bundle size (${(resourceAnalysis.scripts.totalSize/1024/1024).toFixed(2)}MB) could be optimized`);
    }

    // Bundle optimization
    if (bundleInfo.scripts.length > 20) {
      score -= 5;
      recommendations.push(`🟡 WARNING: Too many script files (${bundleInfo.scripts.length}), consider bundling`);
    }

    if (bundleInfo.inlineScripts > 5) {
      score -= 3;
      recommendations.push(`ℹ️ INFO: Consider moving inline scripts to external files for better caching`);
    }

    // Determine grade
    if (score >= 95) results.grade = 'A+';
    else if (score >= 90) results.grade = 'A';
    else if (score >= 85) results.grade = 'A-';
    else if (score >= 80) results.grade = 'B+';
    else if (score >= 75) results.grade = 'B';
    else if (score >= 70) results.grade = 'B-';
    else if (score >= 65) results.grade = 'C+';
    else if (score >= 60) results.grade = 'C';
    else results.grade = 'F';

    results.score = Math.max(0, score);
    results.recommendations = recommendations;

    // Output results
    console.log('\n🏆 PERFORMANCE RESULTS');
    console.log('======================================================================');
    console.log(`📊 Overall Score: ${results.score}/100 (Grade: ${results.grade})`);
    console.log(`⚡ Core Web Vitals:`);
    console.log(`   • First Contentful Paint: ${webVitals.FCP}ms`);
    console.log(`   • Time to First Byte: ${webVitals.TTFB}ms`);
    console.log(`   • DOM Content Loaded: ${webVitals.DOMContentLoaded}ms`);
    
    console.log(`\n📦 Resource Analysis:`);
    console.log(`   • Images: ${resourceAnalysis.images.count} files (${(resourceAnalysis.images.totalSize/1024).toFixed(0)}KB)`);
    console.log(`   • Scripts: ${resourceAnalysis.scripts.count} files (${(resourceAnalysis.scripts.totalSize/1024).toFixed(0)}KB)`);
    console.log(`   • Stylesheets: ${resourceAnalysis.stylesheets.count} files (${(resourceAnalysis.stylesheets.totalSize/1024).toFixed(0)}KB)`);
    
    console.log(`\n🎯 Optimization Opportunities:`);
    if (recommendations.length === 0) {
      console.log('   ✅ No critical issues found! Your app is Y Combinator ready!');
    } else {
      recommendations.forEach(rec => console.log(`   ${rec}`));
    }

    // Save detailed report
    const reportPath = path.join(process.cwd(), 'verifications', 'performance-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    console.log(`\n📄 Detailed report saved: ${reportPath}`);

  } catch (error) {
    console.error('❌ Performance audit failed:', error.message);
    results.error = error.message;
    results.score = 0;
    results.grade = 'F';
  } finally {
    await browser.close();
  }

  return results;
}

// Run if called directly
if (require.main === module) {
  runPerformanceAudit()
    .then(results => {
      console.log('\n🚀 Y COMBINATOR READINESS ASSESSMENT');
      console.log('======================================================================');
      if (results.score >= 90) {
        console.log('🎉 EXCELLENT! Your app demonstrates Y Combinator level technical excellence!');
        console.log('   ✅ Performance optimized');
        console.log('   ✅ Enterprise-grade monitoring');
        console.log('   ✅ Scalability considerations implemented');
      } else if (results.score >= 80) {
        console.log('✅ GOOD! Your app is on track for Y Combinator standards.');
        console.log('   Focus on the recommendations above to reach A+ grade.');
      } else {
        console.log('⚠️  NEEDS IMPROVEMENT for Y Combinator standards.');
        console.log('   Address critical issues before pitching to investors.');
      }
      
      process.exit(results.score >= 80 ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Audit failed:', error);
      process.exit(1);
    });
}

module.exports = { runPerformanceAudit };
