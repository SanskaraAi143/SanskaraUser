#!/usr/bin/env node

/**
 * Y Combinator Grade Master Validation Suite
 * Comprehensive validation for startup readiness
 */

const { exec } = require('child_process');
const util = require('util');
const path = require('path');
const fs = require('fs');

const execAsync = util.promisify(exec);

console.log('🏆 SANSKARA AI - Y COMBINATOR MASTER VALIDATION SUITE');
console.log('======================================================================');
console.log('Running comprehensive Y Combinator-grade analysis...\n');

const BASE_URL = process.argv[2] || 'http://localhost:4173';
const scriptsDir = path.join(__dirname);

async function runScript(scriptName, description) {
  console.log(`🔍 ${description}...`);
  console.log('--------------------------------------------------');
  
  try {
    const { stdout, stderr } = await execAsync(`node "${path.join(scriptsDir, scriptName)}" ${BASE_URL}`);
    
    if (stderr && !stderr.includes('Warning:')) {
      console.log(`❌ Error running ${scriptName}: ${stderr}`);
      return { success: false, score: 0, grade: 'F', error: stderr };
    }
    
    console.log(stdout);
    
    // Extract score and grade from output
    const scoreMatch = stdout.match(/(\d+(?:\.\d+)?)\s*\/\s*\d+/);
    const gradeMatch = stdout.match(/Grade:\s*([A-F][+-]?)/i);
    
    const score = scoreMatch ? parseFloat(scoreMatch[1]) : 0;
    const grade = gradeMatch ? gradeMatch[1] : 'F';
    
    return { success: true, score, grade, output: stdout };
  } catch (error) {
    console.log(`❌ Error running ${scriptName}: ${error.message}`);
    return { success: false, score: 0, grade: 'F', error: error.message };
  }
}

async function runMasterValidation() {
  const results = {
    timestamp: new Date().toISOString(),
    url: BASE_URL,
    scores: {},
    grades: {},
    overallScore: 0,
    overallGrade: 'F',
    ycReadiness: false,
    summary: {}
  };
  // Run all audits with research-backed validators
  const audits = [
    { script: 'yc-seo-accessibility-comprehensive.cjs', name: 'SEO & Accessibility (WCAG 2.1 AA + Google Standards)', weight: 20 },
    { script: 'yc-performance-industry-standard.cjs', name: 'Performance & Core Web Vitals (Google 2024)', weight: 25 },
    { script: 'yc-grade-security.cjs', name: 'Security & Compliance (OWASP Standards)', weight: 20 },
    { script: 'yc-business-comprehensive.cjs', name: 'Business Readiness (Actual YC Criteria)', weight: 35 }
  ];

  let totalWeightedScore = 0;
  let totalWeight = 0;

  for (const audit of audits) {
    const result = await runScript(audit.script, audit.name);
    
    results.scores[audit.name] = result.score;
    results.grades[audit.name] = result.grade;
    
    if (result.success) {
      totalWeightedScore += result.score * audit.weight;
      totalWeight += audit.weight;
    }
    
    console.log(`✅ Completed: ${result.score.toFixed(1)}% (${result.grade})\n`);
  }

  // Calculate overall score
  results.overallScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
  
  // Determine overall grade
  if (results.overallScore >= 95) results.overallGrade = 'A+';
  else if (results.overallScore >= 90) results.overallGrade = 'A';
  else if (results.overallScore >= 85) results.overallGrade = 'A-';
  else if (results.overallScore >= 80) results.overallGrade = 'B+';
  else if (results.overallScore >= 75) results.overallGrade = 'B';
  else if (results.overallScore >= 70) results.overallGrade = 'B-';
  else if (results.overallScore >= 65) results.overallGrade = 'C+';
  else if (results.overallScore >= 60) results.overallGrade = 'C';
  else results.overallGrade = 'F';

  // Determine Y Combinator readiness
  const minScores = {
    business: 75, // Business metrics are most critical for YC
    performance: 80, // Performance shows technical competence
    security: 70, // Security shows professionalism
    seo: 70 // SEO shows growth potential
  };

  const businessScore = results.scores['Business Readiness & Market Fit'] || 0;
  const performanceScore = results.scores['Performance & Core Web Vitals'] || 0;
  const securityScore = results.scores['Security & Compliance'] || 0;
  const seoScore = results.scores['Technical SEO & Accessibility'] || 0;

  results.ycReadiness = businessScore >= minScores.business &&
                       performanceScore >= minScores.performance &&
                       securityScore >= minScores.security &&
                       seoScore >= minScores.seo &&
                       results.overallScore >= 80;

  // Generate summary
  results.summary = {
    strengths: [],
    criticalIssues: [],
    recommendations: []
  };

  if (businessScore >= 85) results.summary.strengths.push('Strong business fundamentals');
  if (performanceScore >= 85) results.summary.strengths.push('Excellent technical performance');
  if (securityScore >= 85) results.summary.strengths.push('Enterprise-grade security');
  if (seoScore >= 85) results.summary.strengths.push('SEO & accessibility optimized');

  if (businessScore < 75) results.summary.criticalIssues.push('Business model needs strengthening');
  if (performanceScore < 80) results.summary.criticalIssues.push('Performance optimization required');
  if (securityScore < 70) results.summary.criticalIssues.push('Security vulnerabilities must be addressed');
  if (seoScore < 70) results.summary.criticalIssues.push('SEO and accessibility improvements needed');

  // Output final results
  console.log('🏆 FINAL RESULTS - Y COMBINATOR READINESS ASSESSMENT');
  console.log('======================================================================');
  console.log(`📊 Overall Score: ${results.overallScore.toFixed(1)}/100 (Grade: ${results.overallGrade})`);
  console.log(`🚀 Y Combinator Ready: ${results.ycReadiness ? '✅ YES' : '❌ NOT YET'}`);
  
  console.log('\n📈 Individual Scores:');
  for (const [category, score] of Object.entries(results.scores)) {
    const grade = results.grades[category];
    const status = score >= 80 ? '✅' : score >= 70 ? '⚠️' : '❌';
    console.log(`   ${status} ${category}: ${score.toFixed(1)}% (${grade})`);
  }

  if (results.summary.strengths.length > 0) {
    console.log('\n💪 Key Strengths:');
    results.summary.strengths.forEach(strength => console.log(`   ✅ ${strength}`));
  }

  if (results.summary.criticalIssues.length > 0) {
    console.log('\n🚨 Critical Issues to Address:');
    results.summary.criticalIssues.forEach(issue => console.log(`   ❌ ${issue}`));
  }

  console.log('\n🎯 Y COMBINATOR APPLICATION ASSESSMENT');
  console.log('======================================================================');
  
  if (results.ycReadiness && results.overallScore >= 90) {
    console.log('🎉 EXCEPTIONAL! Your startup demonstrates Y Combinator excellence!');
    console.log('   🚀 Strong technical foundation');
    console.log('   📈 Clear business model and market fit');
    console.log('   🔒 Enterprise-grade security and compliance');
    console.log('   ⚡ Outstanding performance metrics');
    console.log('\n💡 APPLY NOW! Your startup shows all the qualities YC looks for.');
    console.log('   Focus on traction metrics and team story in your application.');
  } else if (results.ycReadiness && results.overallScore >= 85) {
    console.log('✅ YC READY! Your startup meets Y Combinator standards.');
    console.log('   Address any remaining minor issues and apply with confidence.');
  } else if (results.overallScore >= 75) {
    console.log('⚠️  ALMOST READY for Y Combinator.');
    console.log('   Address the critical issues above before applying.');
    console.log('   Consider building more traction and refining your product.');
  } else {
    console.log('❌ NOT READY for Y Combinator application yet.');
    console.log('   Focus on fundamental improvements in business and technical areas.');
    console.log('   Build a stronger foundation before considering YC application.');
  }

  console.log('\n📊 COMPETITIVE POSITIONING');
  console.log('======================================================================');
  if (results.overallScore >= 95) {
    console.log('🥇 TOP 1% - Your startup outperforms 99% of web applications');
  } else if (results.overallScore >= 90) {
    console.log('🥈 TOP 5% - Your startup is in the elite tier of web applications');
  } else if (results.overallScore >= 85) {
    console.log('🥉 TOP 10% - Your startup demonstrates strong competitive advantage');
  } else if (results.overallScore >= 80) {
    console.log('📈 TOP 25% - Your startup shows solid fundamentals');
  } else {
    console.log('📊 BELOW AVERAGE - Significant improvements needed for competitiveness');
  }

  // Save comprehensive report
  const reportPath = path.join(process.cwd(), 'verifications', 'yc-readiness-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\n📄 Comprehensive Y Combinator readiness report saved: ${reportPath}`);

  console.log('\n🚀 NEXT STEPS FOR Y COMBINATOR SUCCESS');
  console.log('======================================================================');
  if (results.ycReadiness) {
    console.log('1. 📊 Gather traction metrics (users, revenue, growth rate)');
    console.log('2. 👥 Prepare compelling team story and domain expertise');
    console.log('3. 🎯 Refine your 2-minute pitch and demo');
    console.log('4. 💰 Define clear funding needs and use of capital');
    console.log('5. 🚀 Submit your YC application with confidence!');
  } else {
    console.log('1. ❌ Address all critical issues identified above');
    console.log('2. 📈 Build more user traction and validation');
    console.log('3. 🔧 Improve technical and business fundamentals');
    console.log('4. 🔄 Re-run this assessment until you achieve YC readiness');
    console.log('5. 📚 Study successful YC applications in your space');
  }

  return results;
}

runMasterValidation()
  .then(results => {
    process.exit(results.ycReadiness && results.overallScore >= 85 ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Master validation failed:', error);
    process.exit(1);
  });
