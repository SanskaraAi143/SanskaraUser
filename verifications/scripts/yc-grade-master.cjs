#!/usr/bin/env node
/**
 * Y COMBINATOR GRADE MASTER VALIDATION SUITE
 * Enterprise-level validation for YC application readiness
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// YC Validation Criteria
const YC_PERFORMANCE_THRESHOLD = 85;
const YC_SECURITY_THRESHOLD = 90;
const YC_BUSINESS_THRESHOLD = 75;
const YC_OVERALL_THRESHOLD = 83;

console.log('🚀 SANSKARA AI - Y COMBINATOR MASTER VALIDATION SUITE');
console.log('======================================================================');
console.log('🎯 Running comprehensive YC-grade analysis...\n');

const results = {
  performance: { score: 0, grade: 'F', status: 'FAILED' },
  security: { score: 0, grade: 'F', status: 'FAILED' },
  business: { score: 0, grade: 'F', status: 'FAILED' },
  overall: { score: 0, grade: 'F', status: 'NOT READY' }
};

async function runScript(scriptName) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, scriptName);
    
    if (!fs.existsSync(scriptPath)) {
      console.log(`⚠️  Script ${scriptName} not found - creating placeholder result`);
      resolve({ score: 50, details: `${scriptName} validation pending` });
      return;
    }

    const child = spawn('node', [scriptPath], { stdio: 'pipe' });
    let output = '';
    
    child.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    child.stderr.on('data', (data) => {
      output += data.toString();
    });
    
    child.on('close', (code) => {
      try {
        // Extract score from output
        const scoreMatch = output.match(/Overall Score: (\d+)/);
        const score = scoreMatch ? parseInt(scoreMatch[1]) : 0;
        
        resolve({ 
          score, 
          output,
          details: output.split('\n').slice(0, 10).join('\n') 
        });
      } catch (error) {
        resolve({ score: 0, details: 'Parsing error', error: error.message });
      }
    });
    
    child.on('error', (error) => {
      resolve({ score: 0, details: 'Execution error', error: error.message });
    });
  });
}

function getGrade(score) {
  if (score >= 95) return 'A+';
  if (score >= 90) return 'A';
  if (score >= 85) return 'A-';
  if (score >= 80) return 'B+';
  if (score >= 75) return 'B';
  if (score >= 70) return 'B-';
  if (score >= 65) return 'C+';
  if (score >= 60) return 'C';
  if (score >= 55) return 'C-';
  if (score >= 50) return 'D';
  return 'F';
}

function getYCStatus(score) {
  if (score >= YC_OVERALL_THRESHOLD) return '🟢 YC READY';
  if (score >= 70) return '🟡 ALMOST READY';
  if (score >= 60) return '🟠 NEEDS WORK';
  return '🔴 NOT READY';
}

async function main() {
  try {
    console.log('🔍 1/3 Performance Analysis...');
    const performanceResult = await runScript('yc-grade-performance.cjs');
    results.performance.score = performanceResult.score;
    results.performance.grade = getGrade(performanceResult.score);
    results.performance.status = performanceResult.score >= YC_PERFORMANCE_THRESHOLD ? 'PASSED' : 'FAILED';
    
    console.log('🔒 2/3 Security & Compliance Analysis...');
    const securityResult = await runScript('yc-grade-security.cjs');
    results.security.score = securityResult.score;
    results.security.grade = getGrade(securityResult.score);
    results.security.status = securityResult.score >= YC_SECURITY_THRESHOLD ? 'PASSED' : 'FAILED';
    
    console.log('📈 3/3 Business Readiness Analysis...');
    const businessResult = await runScript('yc-grade-business.cjs');
    results.business.score = businessResult.score;
    results.business.grade = getGrade(businessResult.score);
    results.business.status = businessResult.score >= YC_BUSINESS_THRESHOLD ? 'PASSED' : 'FAILED';
    
    // Calculate overall score
    results.overall.score = Math.round(
      (results.performance.score * 0.35) + 
      (results.security.score * 0.30) + 
      (results.business.score * 0.35)
    );
    results.overall.grade = getGrade(results.overall.score);
    results.overall.status = getYCStatus(results.overall.score);
    
    // Display results
    console.log('\n🏆 Y COMBINATOR READINESS ASSESSMENT');
    console.log('======================================================================');
    console.log(`⚡ Performance:     ${results.performance.score}/100 (${results.performance.grade}) - ${results.performance.status}`);
    console.log(`🔒 Security:        ${results.security.score}/100 (${results.security.grade}) - ${results.security.status}`);
    console.log(`📈 Business:        ${results.business.score}/100 (${results.business.grade}) - ${results.business.status}`);
    console.log('----------------------------------------------------------------------');
    console.log(`🎯 OVERALL SCORE:   ${results.overall.score}/100 (${results.overall.grade})`);
    console.log(`🚀 YC READINESS:    ${results.overall.status}`);
    
    console.log('\n📊 DETAILED BREAKDOWN');
    console.log('======================================================================');
    
    if (results.overall.score >= YC_OVERALL_THRESHOLD) {
      console.log('🎉 CONGRATULATIONS! Your application meets Y Combinator standards.');
      console.log('✅ Ready for YC application submission');
      console.log('✅ Enterprise-grade technical foundation');
      console.log('✅ Investor-ready security posture');
      console.log('✅ Strong business fundamentals');
    } else {
      console.log('⚠️  NOT YET READY for Y Combinator application.');
      console.log('\n🔧 CRITICAL ACTIONS NEEDED:');
      
      if (results.performance.score < YC_PERFORMANCE_THRESHOLD) {
        console.log(`🔴 Performance: Score ${results.performance.score}/100 (Need ${YC_PERFORMANCE_THRESHOLD}+)`);
        console.log('   → Optimize bundle size, image compression, Core Web Vitals');
      }
      
      if (results.security.score < YC_SECURITY_THRESHOLD) {
        console.log(`🔴 Security: Score ${results.security.score}/100 (Need ${YC_SECURITY_THRESHOLD}+)`);
        console.log('   → Add security headers, GDPR compliance, vulnerability fixes');
      }
      
      if (results.business.score < YC_BUSINESS_THRESHOLD) {
        console.log(`🔴 Business: Score ${results.business.score}/100 (Need ${YC_BUSINESS_THRESHOLD}+)`);
        console.log('   → Clear problem statement, traction metrics, growth strategy');
      }
    }
    
    console.log('\n💡 YC APPLICATION TIMELINE');
    console.log('======================================================================');
    if (results.overall.score >= 95) {
      console.log('🚀 APPLY NOW - Top 1% YC candidate');
    } else if (results.overall.score >= YC_OVERALL_THRESHOLD) {
      console.log('✅ Ready to apply - Strong YC candidate');
    } else if (results.overall.score >= 70) {
      console.log('🟡 1-2 weeks of fixes needed before applying');
    } else {
      console.log('🔴 4-6 weeks of development needed before YC application');
    }
    
    // Save detailed report
    const reportPath = path.join(process.cwd(), 'verifications', 'yc-readiness-report.json');
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      results,
      recommendations: generateRecommendations(results),
      ycReadiness: results.overall.score >= YC_OVERALL_THRESHOLD
    }, null, 2));
    
    console.log(`\n📄 Detailed report saved: ${reportPath}`);
    console.log('\n======================================================================');
    
    // Exit with appropriate code
    process.exit(results.overall.score >= YC_OVERALL_THRESHOLD ? 0 : 1);
    
  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    process.exit(1);
  }
}

function generateRecommendations(results) {
  const recommendations = [];
  
  if (results.performance.score < YC_PERFORMANCE_THRESHOLD) {
    recommendations.push({
      category: 'Performance',
      priority: 'HIGH',
      actions: [
        'Implement image compression and WebP format',
        'Code splitting and lazy loading',
        'CDN implementation',
        'Bundle size optimization'
      ]
    });
  }
  
  if (results.security.score < YC_SECURITY_THRESHOLD) {
    recommendations.push({
      category: 'Security',
      priority: 'CRITICAL',
      actions: [
        'Add security headers (HSTS, CSP, X-Frame-Options)',
        'GDPR compliance implementation',
        'Vulnerability scanning and fixes',
        'Data encryption and secure storage'
      ]
    });
  }
  
  if (results.business.score < YC_BUSINESS_THRESHOLD) {
    recommendations.push({
      category: 'Business',
      priority: 'CRITICAL',
      actions: [
        'Clear problem/solution statement',
        'User traction and growth metrics',
        'Revenue model clarification',
        'Competitive advantage documentation'
      ]
    });
  }
  
  return recommendations;
}

if (require.main === module) {
  main();
}

module.exports = { runScript, getGrade, getYCStatus };
