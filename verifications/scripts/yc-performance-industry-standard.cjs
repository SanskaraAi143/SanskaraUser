#!/usr/bin/env node

/**
 * PERFORMANCE VALIDATION - INDUSTRY STANDARDS
 * 
 * Based on Google's Core Web Vitals (2024), Lighthouse scoring methodology,
 * and industry performance benchmarks from real-world studies.
 * 
 * Research Sources:
 * - Google's Core Web Vitals (web.dev/vitals)
 * - Lighthouse Performance Scoring (developers.google.com/web/tools/lighthouse)
 * - HTTP Archive Performance Reports
 * - WebPageTest Performance Studies
 * - Google PageSpeed Insights Recommendations
 * 
 * Performance Criteria for YC-Ready Applications:
 * - Lighthouse Performance Score: 90+ (Industry Leader)
 * - LCP: < 2.5s (Good), < 4s (Needs Improvement)
 * - FID: < 100ms (Good), < 300ms (Needs Improvement)
 * - CLS: < 0.1 (Good), < 0.25 (Needs Improvement)
 * - TTFB: < 600ms (Excellent), < 1.8s (Acceptable)
 */

const puppeteer = require('puppeteer');
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const path = require('path');

// Research-backed performance thresholds (Google 2024 standards)
const PERFORMANCE_THRESHOLDS = {
  lighthouse: {
    excellent: 90,    // Top 25% of websites
    good: 75,         // Above average
    needsWork: 50,    // Below average
    poor: 0           // Bottom quartile
  },
  
  coreWebVitals: {
    LCP: {              // Largest Contentful Paint
      good: 2.5,        // 75th percentile of page loads
      needsImprovement: 4.0,
      poor: Infinity
    },
    FID: {              // First Input Delay
      good: 100,        // milliseconds
      needsImprovement: 300,
      poor: Infinity
    },
    CLS: {              // Cumulative Layout Shift
      good: 0.1,
      needsImprovement: 0.25,
      poor: Infinity
    },
    TTFB: {             // Time to First Byte
      excellent: 600,   // milliseconds
      good: 1200,
      acceptable: 1800,
      poor: Infinity
    }
  },
  
  resourceMetrics: {
    totalSize: {
      excellent: 1000,  // KB - Industry leaders
      good: 2000,       // KB - Above average
      acceptable: 3000, // KB - Average
      poor: Infinity
    },
    requests: {
      excellent: 50,    // Total HTTP requests
      good: 75,
      acceptable: 100,
      poor: Infinity
    },
    javascript: {
      excellent: 300,   // KB - JS bundle size
      good: 500,
      acceptable: 800,
      poor: Infinity
    }
  }
};

// YC-specific performance requirements
const YC_REQUIREMENTS = {
  minimumLighthouseScore: 75,
  maximumLCP: 3.0,
  maximumFID: 200,
  maximumCLS: 0.2,
  maximumTTFB: 1500
};

class PerformanceAuditor {
  constructor(url) {
    this.url = url;
    this.results = {
      timestamp: new Date().toISOString(),
      url: url,
      lighthouse: {},
      coreWebVitals: {},
      resourceMetrics: {},
      ycReadiness: false,
      grade: 'F',
      score: 0,
      recommendations: []
    };
  }

  async runComprehensiveAudit() {
    console.log('⚡ PERFORMANCE AUDIT - YC READINESS STANDARDS');
    console.log('================================================================');
    console.log(`🎯 Target URL: ${this.url}`);
    console.log('📊 Industry benchmarks: Google Core Web Vitals 2024\n');

    try {
      // 1. Lighthouse Performance Audit
      await this.runLighthouseAudit();
      
      // 2. Core Web Vitals Measurement
      await this.measureCoreWebVitals();
      
      // 3. Resource Analysis
      await this.analyzeResources();
      
      // 4. Calculate overall score and YC readiness
      this.calculateOverallScore();
      
      // 5. Generate recommendations
      this.generateRecommendations();
      
      // 6. Output results
      this.outputResults();
      
      return this.results;
      
    } catch (error) {
      console.error('❌ Performance audit failed:', error.message);
      return { error: error.message, score: 0, ycReadiness: false };
    }
  }

  async runLighthouseAudit() {
    console.log('🔍 Running Lighthouse Performance Audit...');
    console.log('--------------------------------------------------');
    
    const chrome = await chromeLauncher.launch({
      chromeFlags: ['--headless', '--no-sandbox', '--disable-dev-shm-usage']
    });

    try {
      const options = {
        logLevel: 'error',
        output: 'json',
        onlyCategories: ['performance'],
        port: chrome.port,
        throttling: {
          rttMs: 150,
          throughputKbps: 1638.4,
          cpuSlowdownMultiplier: 4
        }
      };

      const runnerResult = await lighthouse(this.url, options);
      const performanceScore = Math.round(runnerResult.lhr.categories.performance.score * 100);
      
      this.results.lighthouse = {
        score: performanceScore,
        metrics: {
          firstContentfulPaint: runnerResult.lhr.audits['first-contentful-paint'].numericValue,
          largestContentfulPaint: runnerResult.lhr.audits['largest-contentful-paint'].numericValue,
          firstInputDelay: runnerResult.lhr.audits['max-potential-fid']?.numericValue || 0,
          cumulativeLayoutShift: runnerResult.lhr.audits['cumulative-layout-shift'].numericValue,
          timeToFirstByte: runnerResult.lhr.audits['server-response-time']?.numericValue || 0,
          speedIndex: runnerResult.lhr.audits['speed-index'].numericValue,
          totalBlockingTime: runnerResult.lhr.audits['total-blocking-time'].numericValue
        }
      };

      console.log(`📊 Lighthouse Performance Score: ${performanceScore}/100`);
      
      if (performanceScore >= PERFORMANCE_THRESHOLDS.lighthouse.excellent) {
        console.log('🎉 EXCELLENT - Industry leader performance!');
      } else if (performanceScore >= PERFORMANCE_THRESHOLDS.lighthouse.good) {
        console.log('✅ GOOD - Above average performance');
      } else if (performanceScore >= PERFORMANCE_THRESHOLDS.lighthouse.needsWork) {
        console.log('⚠️  NEEDS WORK - Below industry standards');
      } else {
        console.log('❌ POOR - Significant performance issues');
      }

    } finally {
      await chrome.kill();
    }
  }

  async measureCoreWebVitals() {
    console.log('\n🎯 Measuring Core Web Vitals...');
    console.log('--------------------------------------------------');
    
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage']
    });

    try {
      const page = await browser.newPage();
      
      // Enable Performance API
      await page.evaluateOnNewDocument(() => {
        window.performanceMetrics = {};
      });

      const start = Date.now();
      await page.goto(this.url, { waitUntil: 'networkidle0', timeout: 30000 });
      const ttfb = Date.now() - start;

      // Measure Core Web Vitals using Performance Observer API
      const metrics = await page.evaluate(() => {
        return new Promise((resolve) => {
          const metrics = {};
          
          // LCP (Largest Contentful Paint)
          new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            metrics.lcp = lastEntry.startTime;
          }).observe({ entryTypes: ['largest-contentful-paint'] });

          // FID (First Input Delay) - simulated
          new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            entries.forEach((entry) => {
              if (entry.name === 'first-input') {
                metrics.fid = entry.processingStart - entry.startTime;
              }
            });
          }).observe({ entryTypes: ['first-input'] });

          // CLS (Cumulative Layout Shift)
          let clsValue = 0;
          new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
              }
            }
            metrics.cls = clsValue;
          }).observe({ entryTypes: ['layout-shift'] });

          // Give time for metrics to be collected
          const observerCompletion = { lcp: false, fid: false, cls: false };
          
          const checkCompletion = () => {
            if (observerCompletion.lcp && observerCompletion.fid && observerCompletion.cls) {
              resolve(metrics);
            }
          };
          
          // LCP (Largest Contentful Paint)
          new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            metrics.lcp = lastEntry.startTime;
            observerCompletion.lcp = true;
            checkCompletion();
          }).observe({ entryTypes: ['largest-contentful-paint'] });

          // FID (First Input Delay) - simulated
          new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            entries.forEach((entry) => {
              if (entry.name === 'first-input') {
                metrics.fid = entry.processingStart - entry.startTime;
              }
            });
            observerCompletion.fid = true;
            checkCompletion();
          }).observe({ entryTypes: ['first-input'] });

          // CLS (Cumulative Layout Shift)
          let clsValue = 0;
          new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
              }
            }
            metrics.cls = clsValue;
            observerCompletion.cls = true;
            checkCompletion();
          }).observe({ entryTypes: ['layout-shift'] });
        });
      });

      this.results.coreWebVitals = {
        lcp: metrics.lcp || this.results.lighthouse.metrics.largestContentfulPaint,
        fid: metrics.fid || this.results.lighthouse.metrics.firstInputDelay,
        cls: metrics.cls || this.results.lighthouse.metrics.cumulativeLayoutShift,
        ttfb: ttfb
      };

      // Evaluate Core Web Vitals
      this.evaluateCoreWebVitals();

    } finally {
      await browser.close();
    }
  }

  evaluateCoreWebVitals() {
    const { lcp, fid, cls, ttfb } = this.results.coreWebVitals;
    
    console.log('\n📊 Core Web Vitals Assessment:');
    
    // LCP Assessment
    const lcpSeconds = lcp / 1000;
    let lcpStatus, lcpColor;
    if (lcpSeconds <= PERFORMANCE_THRESHOLDS.coreWebVitals.LCP.good) {
      lcpStatus = 'GOOD'; lcpColor = '🟢';
    } else if (lcpSeconds <= PERFORMANCE_THRESHOLDS.coreWebVitals.LCP.needsImprovement) {
      lcpStatus = 'NEEDS IMPROVEMENT'; lcpColor = '🟡';
    } else {
      lcpStatus = 'POOR'; lcpColor = '🔴';
    }
    console.log(`   ${lcpColor} LCP: ${lcpSeconds.toFixed(2)}s (${lcpStatus})`);
    
    // FID Assessment
    let fidStatus, fidColor;
    if (fid <= PERFORMANCE_THRESHOLDS.coreWebVitals.FID.good) {
      fidStatus = 'GOOD'; fidColor = '🟢';
    } else if (fid <= PERFORMANCE_THRESHOLDS.coreWebVitals.FID.needsImprovement) {
      fidStatus = 'NEEDS IMPROVEMENT'; fidColor = '🟡';
    } else {
      fidStatus = 'POOR'; fidColor = '🔴';
    }
    console.log(`   ${fidColor} FID: ${fid}ms (${fidStatus})`);
    
    // CLS Assessment
    let clsStatus, clsColor;
    if (cls <= PERFORMANCE_THRESHOLDS.coreWebVitals.CLS.good) {
      clsStatus = 'GOOD'; clsColor = '🟢';
    } else if (cls <= PERFORMANCE_THRESHOLDS.coreWebVitals.CLS.needsImprovement) {
      clsStatus = 'NEEDS IMPROVEMENT'; clsColor = '🟡';
    } else {
      clsStatus = 'POOR'; clsColor = '🔴';
    }
    console.log(`   ${clsColor} CLS: ${cls.toFixed(3)} (${clsStatus})`);
    
    // TTFB Assessment
    let ttfbStatus, ttfbColor;
    if (ttfb <= PERFORMANCE_THRESHOLDS.coreWebVitals.TTFB.excellent) {
      ttfbStatus = 'EXCELLENT'; ttfbColor = '🟢';
    } else if (ttfb <= PERFORMANCE_THRESHOLDS.coreWebVitals.TTFB.good) {
      ttfbStatus = 'GOOD'; ttfbColor = '🟢';
    } else if (ttfb <= PERFORMANCE_THRESHOLDS.coreWebVitals.TTFB.acceptable) {
      ttfbStatus = 'ACCEPTABLE'; ttfbColor = '🟡';
    } else {
      ttfbStatus = 'POOR'; ttfbColor = '🔴';
    }
    console.log(`   ${ttfbColor} TTFB: ${ttfb}ms (${ttfbStatus})`);
  }

  async analyzeResources() {
    console.log('\n📦 Resource Analysis...');
    console.log('--------------------------------------------------');
    
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage']
    });

    try {
      const page = await browser.newPage();
      
      const resources = [];
      page.on('response', (response) => {
        resources.push({
          url: response.url(),
          size: parseInt(response.headers()['content-length'] || 0),
          type: response.headers()['content-type'] || 'unknown'
        });
      });

      await page.goto(this.url, { waitUntil: 'networkidle0', timeout: 30000 });

      // Analyze resource metrics
      const totalSize = resources.reduce((sum, r) => sum + r.size, 0) / 1024; // KB
      const totalRequests = resources.length;
      const jsSize = resources
        .filter(r => r.type.includes('javascript'))
        .reduce((sum, r) => sum + r.size, 0) / 1024; // KB

      this.results.resourceMetrics = {
        totalSize: Math.round(totalSize),
        totalRequests,
        javascriptSize: Math.round(jsSize),
        resources: resources.length > 50 ? resources.slice(0, 50) : resources
      };

      console.log(`📊 Total Resources: ${totalRequests} requests`);
      console.log(`📊 Total Size: ${Math.round(totalSize)} KB`);
      console.log(`📊 JavaScript Size: ${Math.round(jsSize)} KB`);

      // Evaluate resource efficiency
      this.evaluateResourceEfficiency(totalSize, totalRequests, jsSize);

    } finally {
      await browser.close();
    }
  }

  evaluateResourceEfficiency(totalSize, totalRequests, jsSize) {
    console.log('\n📈 Resource Efficiency Assessment:');
    
    // Total Size Assessment
    let sizeStatus;
    if (totalSize <= PERFORMANCE_THRESHOLDS.resourceMetrics.totalSize.excellent) {
      sizeStatus = '🟢 EXCELLENT - Optimized bundle size';
    } else if (totalSize <= PERFORMANCE_THRESHOLDS.resourceMetrics.totalSize.good) {
      sizeStatus = '🟢 GOOD - Reasonable bundle size';
    } else if (totalSize <= PERFORMANCE_THRESHOLDS.resourceMetrics.totalSize.acceptable) {
      sizeStatus = '🟡 ACCEPTABLE - Could be optimized';
    } else {
      sizeStatus = '🔴 POOR - Bundle too large';
    }
    console.log(`   Total Size: ${sizeStatus}`);
    
    // Request Count Assessment
    let requestStatus;
    if (totalRequests <= PERFORMANCE_THRESHOLDS.resourceMetrics.requests.excellent) {
      requestStatus = '🟢 EXCELLENT - Minimal HTTP requests';
    } else if (totalRequests <= PERFORMANCE_THRESHOLDS.resourceMetrics.requests.good) {
      requestStatus = '🟢 GOOD - Reasonable request count';
    } else if (totalRequests <= PERFORMANCE_THRESHOLDS.resourceMetrics.requests.acceptable) {
      requestStatus = '🟡 ACCEPTABLE - Consider bundling';
    } else {
      requestStatus = '🔴 POOR - Too many requests';
    }
    console.log(`   Request Count: ${requestStatus}`);
    
    // JavaScript Size Assessment
    let jsStatus;
    if (jsSize <= PERFORMANCE_THRESHOLDS.resourceMetrics.javascript.excellent) {
      jsStatus = '🟢 EXCELLENT - Optimized JS bundle';
    } else if (jsSize <= PERFORMANCE_THRESHOLDS.resourceMetrics.javascript.good) {
      jsStatus = '🟢 GOOD - Reasonable JS size';
    } else if (jsSize <= PERFORMANCE_THRESHOLDS.resourceMetrics.javascript.acceptable) {
      jsStatus = '🟡 ACCEPTABLE - Consider code splitting';
    } else {
      jsStatus = '🔴 POOR - JS bundle too large';
    }
    console.log(`   JavaScript Bundle: ${jsStatus}`);
  }

  calculateOverallScore() {
    let score = 0;
    
    // Lighthouse Score (40% weight)
    score += (this.results.lighthouse.score || 0) * 0.4;
    
    // Core Web Vitals (40% weight)
    const cwvScore = this.calculateCWVScore();
    score += cwvScore * 0.4;
    
    // Resource Efficiency (20% weight)
    const resourceScore = this.calculateResourceScore();
    score += resourceScore * 0.2;
    
    this.results.score = Math.round(score);
    this.results.grade = this.getGrade(this.results.score);
    
    // YC Readiness Assessment
    this.results.ycReadiness = this.assessYCReadiness();
  }

  calculateCWVScore() {
    const { lcp, fid, cls, ttfb } = this.results.coreWebVitals;
    let score = 0;
    
    // LCP Score (25%)
    const lcpSeconds = lcp / 1000;
    if (lcpSeconds <= PERFORMANCE_THRESHOLDS.coreWebVitals.LCP.good) score += 25;
    else if (lcpSeconds <= PERFORMANCE_THRESHOLDS.coreWebVitals.LCP.needsImprovement) score += 15;
    else score += 5;
    
    // FID Score (25%)
    if (fid <= PERFORMANCE_THRESHOLDS.coreWebVitals.FID.good) score += 25;
    else if (fid <= PERFORMANCE_THRESHOLDS.coreWebVitals.FID.needsImprovement) score += 15;
    else score += 5;
    
    // CLS Score (25%)
    if (cls <= PERFORMANCE_THRESHOLDS.coreWebVitals.CLS.good) score += 25;
    else if (cls <= PERFORMANCE_THRESHOLDS.coreWebVitals.CLS.needsImprovement) score += 15;
    else score += 5;
    
    // TTFB Score (25%)
    if (ttfb <= PERFORMANCE_THRESHOLDS.coreWebVitals.TTFB.excellent) score += 25;
    else if (ttfb <= PERFORMANCE_THRESHOLDS.coreWebVitals.TTFB.good) score += 20;
    else if (ttfb <= PERFORMANCE_THRESHOLDS.coreWebVitals.TTFB.acceptable) score += 15;
    else score += 5;
    
    return score;
  }

  calculateResourceScore() {
    const { totalSize, totalRequests, javascriptSize } = this.results.resourceMetrics;
    let score = 0;
    
    // Total Size Score (40%)
    if (totalSize <= PERFORMANCE_THRESHOLDS.resourceMetrics.totalSize.excellent) score += 40;
    else if (totalSize <= PERFORMANCE_THRESHOLDS.resourceMetrics.totalSize.good) score += 30;
    else if (totalSize <= PERFORMANCE_THRESHOLDS.resourceMetrics.totalSize.acceptable) score += 20;
    else score += 10;
    
    // Request Count Score (30%)
    if (totalRequests <= PERFORMANCE_THRESHOLDS.resourceMetrics.requests.excellent) score += 30;
    else if (totalRequests <= PERFORMANCE_THRESHOLDS.resourceMetrics.requests.good) score += 25;
    else if (totalRequests <= PERFORMANCE_THRESHOLDS.resourceMetrics.requests.acceptable) score += 15;
    else score += 5;
    
    // JavaScript Size Score (30%)
    if (javascriptSize <= PERFORMANCE_THRESHOLDS.resourceMetrics.javascript.excellent) score += 30;
    else if (javascriptSize <= PERFORMANCE_THRESHOLDS.resourceMetrics.javascript.good) score += 25;
    else if (javascriptSize <= PERFORMANCE_THRESHOLDS.resourceMetrics.javascript.acceptable) score += 15;
    else score += 5;
    
    return score;
  }

  assessYCReadiness() {
    const lighthouseReady = (this.results.lighthouse.score || 0) >= YC_REQUIREMENTS.minimumLighthouseScore;
    const lcpReady = (this.results.coreWebVitals.lcp / 1000) <= YC_REQUIREMENTS.maximumLCP;
    const fidReady = this.results.coreWebVitals.fid <= YC_REQUIREMENTS.maximumFID;
    const clsReady = this.results.coreWebVitals.cls <= YC_REQUIREMENTS.maximumCLS;
    const ttfbReady = this.results.coreWebVitals.ttfb <= YC_REQUIREMENTS.maximumTTFB;
    
    return lighthouseReady && lcpReady && fidReady && clsReady && ttfbReady;
  }

  getGrade(score) {
    if (score >= 97) return 'A+';
    if (score >= 93) return 'A';
    if (score >= 90) return 'A-';
    if (score >= 87) return 'B+';
    if (score >= 83) return 'B';
    if (score >= 80) return 'B-';
    if (score >= 77) return 'C+';
    if (score >= 73) return 'C';
    if (score >= 70) return 'C-';
    if (score >= 67) return 'D+';
    if (score >= 65) return 'D';
    return 'F';
  }

  generateRecommendations() {
    const recommendations = [];
    
    // Lighthouse-based recommendations
    if ((this.results.lighthouse.score || 0) < 85) {
      recommendations.push('Optimize images with WebP format and proper compression');
      recommendations.push('Implement code splitting to reduce initial bundle size');
      recommendations.push('Enable browser caching and compression (gzip/brotli)');
    }
    
    // Core Web Vitals recommendations
    const { lcp, fid, cls, ttfb } = this.results.coreWebVitals;
    
    if (lcp / 1000 > PERFORMANCE_THRESHOLDS.coreWebVitals.LCP.good) {
      recommendations.push('Optimize LCP: Preload critical resources, optimize images, reduce server response times');
    }
    
    if (fid > PERFORMANCE_THRESHOLDS.coreWebVitals.FID.good) {
      recommendations.push('Improve FID: Reduce JavaScript execution time, use web workers for heavy tasks');
    }
    
    if (cls > PERFORMANCE_THRESHOLDS.coreWebVitals.CLS.good) {
      recommendations.push('Fix CLS: Set size attributes on images/videos, reserve space for ads');
    }
    
    if (ttfb > PERFORMANCE_THRESHOLDS.coreWebVitals.TTFB.good) {
      recommendations.push('Improve TTFB: Optimize server response, use CDN, implement caching');
    }
    
    // Resource-based recommendations
    const { totalSize, totalRequests, javascriptSize } = this.results.resourceMetrics;
    
    if (totalSize > PERFORMANCE_THRESHOLDS.resourceMetrics.totalSize.good) {
      recommendations.push('Reduce bundle size: Remove unused dependencies, implement tree shaking');
    }
    
    if (totalRequests > PERFORMANCE_THRESHOLDS.resourceMetrics.requests.good) {
      recommendations.push('Reduce HTTP requests: Bundle resources, use CSS sprites, inline critical CSS');
    }
    
    if (javascriptSize > PERFORMANCE_THRESHOLDS.resourceMetrics.javascript.good) {
      recommendations.push('Optimize JavaScript: Use dynamic imports, implement lazy loading, minify code');
    }
    
    this.results.recommendations = recommendations;
  }

  outputResults() {
    console.log('\n🏆 PERFORMANCE AUDIT RESULTS');
    console.log('================================================================');
    
    console.log(`\n📊 Overall Performance Score: ${this.results.score}/100 (Grade: ${this.results.grade})`);
    
    const ycStatus = this.results.ycReadiness ? '✅ YC READY' : '❌ NOT YC READY';
    const ycColor = this.results.ycReadiness ? '\x1b[32m' : '\x1b[31m';
    console.log(`🚀 Y Combinator Readiness: ${ycColor}${ycStatus}\x1b[0m`);
    
    console.log('\n📈 Detailed Breakdown:');
    console.log(`   🔍 Lighthouse Performance: ${this.results.lighthouse.score || 0}/100`);
    console.log(`   ⚡ Core Web Vitals Score: ${this.calculateCWVScore()}/100`);
    console.log(`   📦 Resource Efficiency: ${this.calculateResourceScore()}/100`);
    
    if (this.results.recommendations.length > 0) {
      console.log('\n💡 Performance Recommendations:');
      this.results.recommendations.forEach(rec => {
        console.log(`   • ${rec}`);
      });
    }
    
    // Industry comparison
    console.log('\n🏭 Industry Comparison:');
    if (this.results.score >= 90) {
      console.log('   🥇 TOP 10% - Industry leader performance');
    } else if (this.results.score >= 75) {
      console.log('   🥈 TOP 25% - Above average performance');
    } else if (this.results.score >= 60) {
      console.log('   🥉 AVERAGE - Standard industry performance');
    } else {
      console.log('   📉 BELOW AVERAGE - Performance improvements needed');
    }
    
    // Save detailed report
    const reportPath = path.join(process.cwd(), 'performance-audit-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`\n📄 Detailed report saved: ${reportPath}`);
  }
}

// Main execution
async function main() {
  const url = process.argv[2] || 'http://localhost:4173';
  
  const auditor = new PerformanceAuditor(url);
  const results = await auditor.runComprehensiveAudit();
  
  process.exit(results.ycReadiness && results.score >= 75 ? 0 : 1);
}

// Handle errors gracefully
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error.message);
  process.exit(1);
});

main();
