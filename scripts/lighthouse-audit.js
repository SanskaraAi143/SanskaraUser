#!/usr/bin/env node

/**
 * Lighthouse Performance Audit Script
 * Runs Lighthouse audit on the production build and validates performance score
 */

import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import fs from 'fs';
import path from 'path';

const TARGET_URL = 'http://localhost:4173';
const MIN_PERFORMANCE_SCORE = 97;

async function runLighthouseAudit() {
  console.log('🔍 Launching Lighthouse Performance Audit');
  console.log('=====================================');
  
  let chrome;
  
  try {
    // Launch Chrome
    console.log('🚀 Launching Chrome...');
    chrome = await chromeLauncher.launch({
      chromeFlags: ['--headless', '--disable-gpu', '--no-sandbox']
    });
    
    // Run Lighthouse
    console.log(`📊 Auditing: ${TARGET_URL}`);
    const options = {
      logLevel: 'info',
      output: 'json',
      onlyCategories: ['performance'],
      port: chrome.port,
    };
    
    const runnerResult = await lighthouse(TARGET_URL, options);
    
    // Extract performance score
    const performanceScore = Math.round(runnerResult.lhr.categories.performance.score * 100);
    
    console.log('\n📈 Performance Results');
    console.log('────────────────────────────────────────');
    console.log(`Performance Score: ${performanceScore}/100`);
    
    // Key metrics
    const metrics = runnerResult.lhr.audits;
    console.log('\n⚡ Core Web Vitals');
    console.log('────────────────────────────────────────');
    
    if (metrics['first-contentful-paint']) {
      console.log(`First Contentful Paint: ${metrics['first-contentful-paint'].displayValue}`);
    }
    
    if (metrics['largest-contentful-paint']) {
      console.log(`Largest Contentful Paint: ${metrics['largest-contentful-paint'].displayValue}`);
    }
    
    if (metrics['cumulative-layout-shift']) {
      console.log(`Cumulative Layout Shift: ${metrics['cumulative-layout-shift'].displayValue}`);
    }
    
    if (metrics['total-blocking-time']) {
      console.log(`Total Blocking Time: ${metrics['total-blocking-time'].displayValue}`);
    }
    
    if (metrics['speed-index']) {
      console.log(`Speed Index: ${metrics['speed-index'].displayValue}`);
    }
    
    // Save detailed report
    const reportPath = path.join(process.cwd(), 'lighthouse-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(runnerResult.lhr, null, 2));
    console.log(`\n📄 Detailed report saved: ${reportPath}`);
    
    // Validation
    console.log('\n🎯 Validation');
    console.log('────────────────────────────────────────');
    
    if (performanceScore >= MIN_PERFORMANCE_SCORE) {
      console.log(`✅ Performance Score: ${performanceScore}/100 (Target: ${MIN_PERFORMANCE_SCORE}+)`);
      console.log('🎉 PASSED: Production-ready performance!');
      return true;
    } else {
      console.log(`❌ Performance Score: ${performanceScore}/100 (Target: ${MIN_PERFORMANCE_SCORE}+)`);
      console.log('⚠️  FAILED: Performance needs improvement');
      
      // Show suggestions
      console.log('\n💡 Suggestions:');
      Object.values(metrics).forEach(audit => {
        if (audit.score !== null && audit.score < 0.9 && audit.details?.type === 'opportunity') {
          console.log(`• ${audit.title}: ${audit.description}`);
        }
      });
      
      return false;
    }
    
  } catch (error) {
    console.error('❌ Lighthouse audit failed:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Troubleshooting:');
      console.log('• Make sure the preview server is running: npm run preview');
      console.log('• Check if the app is accessible at: http://localhost:4173');
    }
    
    return false;
  } finally {
    if (chrome) {
      await chrome.kill();
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const success = await runLighthouseAudit();
  process.exit(success ? 0 : 1);
}

export { runLighthouseAudit };
