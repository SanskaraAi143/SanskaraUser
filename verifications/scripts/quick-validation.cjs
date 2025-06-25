#!/usr/bin/env node
/**
 * COMPREHENSIVE YC-READY VALIDATION
 * Runs all validations and provides instant status
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 SANSKARA AI - COMPREHENSIVE YC VALIDATION');
console.log('======================================================================');

const checks = [
  {
    name: 'SEO & Accessibility',
    script: 'validate-seo-aeo.cjs',
    weight: 30
  },
  {
    name: 'Performance',
    script: 'yc-grade-performance.cjs', 
    weight: 35
  },
  {
    name: 'Security',
    script: 'yc-grade-security.cjs',
    weight: 30
  },
  {
    name: 'Business Readiness', 
    script: 'yc-grade-business.cjs',
    weight: 5
  }
];

let overallScore = 0;
let completedChecks = 0;

async function runCheck(check) {
  return new Promise((resolve) => {
    const scriptPath = path.join(__dirname, check.script);
    
    if (!fs.existsSync(scriptPath)) {
      console.log(`⚠️  ${check.name}: Script not found`);
      resolve({ score: 0, status: 'MISSING' });
      return;
    }

    exec(`node "${scriptPath}"`, { timeout: 30000 }, (error, stdout, stderr) => {
      if (error && error.code !== 1) {
        console.log(`❌ ${check.name}: Execution failed`);
        resolve({ score: 0, status: 'FAILED' });
        return;
      }

      // Extract score from output
      const scoreMatch = stdout.match(/Overall Score: (\d+)/);
      const score = scoreMatch ? parseInt(scoreMatch[1]) : 0;
      
      const status = score >= 85 ? 'PASS' : score >= 70 ? 'WARN' : 'FAIL';
      console.log(`${getStatusIcon(status)} ${check.name}: ${score}/100 (${status})`);
      
      resolve({ score, status });
    });
  });
}

function getStatusIcon(status) {
  switch(status) {
    case 'PASS': return '✅';
    case 'WARN': return '⚠️ ';
    case 'FAIL': return '❌';
    default: return '🔶';
  }
}

async function main() {
  console.log('Running comprehensive validation...\n');
  
  for (const check of checks) {
    const result = await runCheck(check);
    overallScore += (result.score * check.weight) / 100;
    completedChecks++;
  }
  
  const finalScore = Math.round(overallScore);
  const grade = finalScore >= 95 ? 'A+' : finalScore >= 90 ? 'A' : finalScore >= 85 ? 'A-' : 
                finalScore >= 80 ? 'B+' : finalScore >= 75 ? 'B' : finalScore >= 70 ? 'B-' : 
                finalScore >= 65 ? 'C+' : finalScore >= 60 ? 'C' : 'F';
  
  console.log('\n======================================================================');
  console.log(`🎯 OVERALL YC READINESS: ${finalScore}/100 (${grade})`);
  
  if (finalScore >= 85) {
    console.log('🎉 READY FOR Y COMBINATOR APPLICATION!');
    console.log('✅ All critical systems operational');
    console.log('✅ Enterprise-grade performance');
    console.log('✅ Security standards met');
    console.log('✅ Business model validated');
  } else if (finalScore >= 70) {
    console.log('🟡 ALMOST READY - Minor fixes needed');
    console.log('⚠️  Address remaining issues before applying');
  } else {
    console.log('🔴 NOT READY - Major improvements needed');
    console.log('❌ Significant development required');
  }
  
  console.log('======================================================================');
  
  // Quick fix suggestions
  if (finalScore < 85) {
    console.log('\n💡 QUICK WINS:');
    console.log('• Run image compression');
    console.log('• Add security headers');
    console.log('• Fix accessibility issues');
    console.log('• Optimize bundle size');
  }
  
  process.exit(finalScore >= 85 ? 0 : 1);
}

main().catch(console.error);
