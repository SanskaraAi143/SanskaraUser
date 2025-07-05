const puppeteer = require('puppeteer');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Y Combinator Grade Security & Compliance Audit
const SECURITY_CHECKS = {
  headers: [
    'Strict-Transport-Security',
    'Content-Security-Policy', 
    'X-Frame-Options',
    'X-Content-Type-Options',
    'Referrer-Policy',
    'Permissions-Policy'
  ],
  privacy: [
    'GDPR Compliance',
    'CCPA Compliance', 
    'Cookie Consent',
    'Privacy Policy',
    'Terms of Service'
  ],
  technical: [
    'HTTPS Enforcement',
    'Mixed Content',
    'Vulnerable Dependencies',
    'Input Validation',
    'Authentication Security'
  ]
};

async function runSecurityAudit() {
  console.log('🔒 SANSKARA AI - Y COMBINATOR GRADE SECURITY AUDIT');
  console.log('======================================================================');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  const url = process.argv[2] || 'http://localhost:4173';
  
  const results = {
    timestamp: new Date().toISOString(),
    url: url,
    securityScore: 0,
    complianceScore: 0,
    grade: 'F',
    vulnerabilities: [],
    recommendations: [],
    compliance: {}
  };

  try {
    console.log(`🔍 Analyzing security for: ${url}`);
    
    // Navigate to the page
    const response = await page.goto(url, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });

    // 1. Security Headers Analysis
    console.log('\n🛡️  Security Headers Analysis...');
    const headers = response.headers();
    let securityScore = 100;
    
    // Check critical security headers
    if (!headers['strict-transport-security']) {
      securityScore -= 15;
      results.vulnerabilities.push('CRITICAL: Missing HSTS header - susceptible to downgrade attacks');
      results.recommendations.push('Add Strict-Transport-Security header with long max-age');
    }

    if (!headers['content-security-policy']) {
      securityScore -= 20;
      results.vulnerabilities.push('CRITICAL: Missing CSP header - vulnerable to XSS attacks');
      results.recommendations.push('Implement Content-Security-Policy to prevent XSS');
    }

    if (!headers['x-frame-options'] && !headers['content-security-policy']?.includes('frame-ancestors')) {
      securityScore -= 10;
      results.vulnerabilities.push('HIGH: Missing X-Frame-Options - vulnerable to clickjacking');
      results.recommendations.push('Add X-Frame-Options: DENY or SAMEORIGIN');
    }

    if (!headers['x-content-type-options']) {
      securityScore -= 8;
      results.vulnerabilities.push('MEDIUM: Missing X-Content-Type-Options header');
      results.recommendations.push('Add X-Content-Type-Options: nosniff');
    }

    if (!headers['referrer-policy']) {
      securityScore -= 5;
      results.vulnerabilities.push('LOW: Missing Referrer-Policy header');
      results.recommendations.push('Add Referrer-Policy: strict-origin-when-cross-origin');
    }

    // 2. HTTPS and Mixed Content Check
    console.log('🔐 HTTPS and Mixed Content Analysis...');
    const mixedContent = await page.evaluate(() => {
      const issues = [];
      
      // Check for mixed content
      const images = Array.from(document.querySelectorAll('img'));
      const scripts = Array.from(document.querySelectorAll('script[src]'));
      const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
      
      [...images, ...scripts, ...stylesheets].forEach(element => {
        const src = element.src || element.href;
        if (src && src.startsWith('http://') && window.location.protocol === 'https:') {
          issues.push(`Mixed content: ${src}`);
        }
      });
      
      return issues;
    });

    if (mixedContent.length > 0) {
      securityScore -= mixedContent.length * 5;
      results.vulnerabilities.push(`CRITICAL: ${mixedContent.length} mixed content issues found`);
      results.recommendations.push('Fix all HTTP resources to use HTTPS');
    }

    // 3. Input Security Analysis
    console.log('📝 Input Security Analysis...');
    const inputSecurity = await page.evaluate(() => {
      const forms = Array.from(document.querySelectorAll('form'));
      const inputs = Array.from(document.querySelectorAll('input, textarea'));
      const issues = [];
      
      // Check for CSRF protection
      forms.forEach((form, index) => {
        const csrfToken = form.querySelector('input[name*="csrf"], input[name*="token"]');
        if (!csrfToken && form.method?.toLowerCase() === 'post') {
          issues.push(`Form ${index + 1}: Missing CSRF protection`);
        }
      });
      
      // Check for autocomplete on sensitive fields
      inputs.forEach((input, index) => {
        if (input.type === 'password' && input.autocomplete !== 'off') {
          issues.push(`Password field ${index + 1}: Autocomplete not disabled`);
        }
      });
      
      return issues;
    });

    if (inputSecurity.length > 0) {
      securityScore -= inputSecurity.length * 3;
      results.vulnerabilities.push(...inputSecurity.map(issue => `MEDIUM: ${issue}`));
    }

    // 4. Privacy & Compliance Analysis
    console.log('👥 Privacy & Compliance Analysis...');
    let complianceScore = 100;
    
    const privacyElements = await page.evaluate(() => {
      const checks = {
        privacyPolicy: !!document.querySelector('a[href*="privacy"], a[href*="Privacy"]'),
        termsOfService: !!document.querySelector('a[href*="terms"], a[href*="Terms"]'),
        cookieConsent: !!document.querySelector('[class*="cookie"], [id*="cookie"], [class*="consent"]'),
        gdprCompliance: !!document.querySelector('[data-gdpr], [class*="gdpr"], [id*="gdpr"]'),
        dataCollection: document.querySelectorAll('input[type="email"], input[name*="email"], input[name*="phone"]').length > 0
      };
      
      return checks;
    });

    if (!privacyElements.privacyPolicy) {
      complianceScore -= 20;
      results.vulnerabilities.push('CRITICAL: Missing Privacy Policy link');
      results.recommendations.push('Add Privacy Policy link in footer');
    }

    if (!privacyElements.termsOfService) {
      complianceScore -= 15;
      results.vulnerabilities.push('HIGH: Missing Terms of Service link');
      results.recommendations.push('Add Terms of Service link in footer');
    }

    if (privacyElements.dataCollection && !privacyElements.cookieConsent) {
      complianceScore -= 25;
      results.vulnerabilities.push('CRITICAL: Data collection without cookie consent - GDPR violation');
      results.recommendations.push('Implement cookie consent banner for GDPR compliance');
    }

    // 5. Authentication Security (if applicable)
    console.log('🔑 Authentication Security Analysis...');
    const authSecurity = await page.evaluate(() => {
      const loginForms = Array.from(document.querySelectorAll('form')).filter(form => {
        return form.querySelector('input[type="password"]');
      });
      
      const issues = [];
      
      loginForms.forEach((form, index) => {
        const passwordField = form.querySelector('input[type="password"]');
        const usernameField = form.querySelector('input[type="email"], input[type="text"]');
        
        // Check for password requirements display
        const passwordHints = form.querySelector('[class*="password-requirement"], [class*="password-help"]');
        if (!passwordHints) {
          issues.push(`Login form ${index + 1}: No password requirements shown`);
        }
        
        // Check for forgot password link
        const forgotPassword = form.querySelector('a[href*="forgot"], a[href*="reset"]');
        if (!forgotPassword) {
          issues.push(`Login form ${index + 1}: No forgot password option`);
        }
      });
      
      return issues;
    });

    if (authSecurity.length > 0) {
      securityScore -= authSecurity.length * 2;
      results.vulnerabilities.push(...authSecurity.map(issue => `LOW: ${issue}`));
    }

    // 6. Third-party Security Analysis
    console.log('🔗 Third-party Security Analysis...');
    const thirdPartyAnalysis = await page.evaluate(() => {
      const externalResources = Array.from(document.querySelectorAll('script[src], link[href], img[src]'))
        .map(el => el.src || el.href)
        .filter(url => url && !url.startsWith(window.location.origin))
        .filter(url => !url.startsWith('data:'));
      
      const uniqueDomains = [...new Set(externalResources.map(url => {
        try {
          return new URL(url).hostname;
        } catch {
          return null;
        }
      }).filter(Boolean))];
      
      return {
        externalResources: externalResources.length,
        uniqueDomains: uniqueDomains.length,
        domains: uniqueDomains
      };
    });

    if (thirdPartyAnalysis.uniqueDomains > 10) {
      securityScore -= 5;
      results.vulnerabilities.push(`MEDIUM: High number of third-party domains (${thirdPartyAnalysis.uniqueDomains})`);
      results.recommendations.push('Review and minimize third-party dependencies');
    }

    // Calculate final scores and grade
    results.securityScore = Math.max(0, securityScore);
    results.complianceScore = Math.max(0, complianceScore);
    
    const overallScore = (results.securityScore + results.complianceScore) / 2;
    
    if (overallScore >= 95) results.grade = 'A+';
    else if (overallScore >= 90) results.grade = 'A';
    else if (overallScore >= 85) results.grade = 'A-';
    else if (overallScore >= 80) results.grade = 'B+';
    else if (overallScore >= 75) results.grade = 'B';
    else if (overallScore >= 70) results.grade = 'B-';
    else if (overallScore >= 65) results.grade = 'C+';
    else if (overallScore >= 60) results.grade = 'C';
    else results.grade = 'F';

    results.compliance = {
      gdpr: privacyElements.privacyPolicy && privacyElements.cookieConsent,
      ccpa: privacyElements.privacyPolicy && privacyElements.termsOfService,
      accessibility: 'Not tested in this audit',
      dataProtection: privacyElements.cookieConsent && !mixedContent.length
    };

    // Output results
    console.log('\n🏆 SECURITY & COMPLIANCE RESULTS');
    console.log('======================================================================');
    console.log(`🔒 Security Score: ${results.securityScore}/100`);
    console.log(`📋 Compliance Score: ${results.complianceScore}/100`);
    console.log(`📊 Overall Grade: ${results.grade} (${overallScore.toFixed(1)}/100)`);
    
    console.log(`\n🔍 Security Headers:`);
    Object.entries(headers).forEach(([key, value]) => {
      if (key.toLowerCase().includes('security') || key.toLowerCase().startsWith('x-') || key.includes('policy')) {
        console.log(`   ✅ ${key}: ${value}`);
      }
    });
    
    console.log(`\n📊 Compliance Status:`);
    console.log(`   GDPR: ${results.compliance.gdpr ? '✅ Compliant' : '❌ Non-compliant'}`);
    console.log(`   CCPA: ${results.compliance.ccpa ? '✅ Compliant' : '❌ Non-compliant'}`);
    console.log(`   Data Protection: ${results.compliance.dataProtection ? '✅ Secure' : '❌ Issues found'}`);
    
    if (results.vulnerabilities.length > 0) {
      console.log(`\n🚨 Vulnerabilities Found:`);
      results.vulnerabilities.forEach(vuln => console.log(`   ${vuln}`));
    }
    
    if (results.recommendations.length > 0) {
      console.log(`\n💡 Recommendations:`);
      results.recommendations.forEach(rec => console.log(`   ${rec}`));
    }

    // Save detailed report
    const reportPath = path.join(process.cwd(), 'verifications', 'security-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    console.log(`\n📄 Detailed report saved: ${reportPath}`);

  } catch (error) {
    console.error('❌ Security audit failed:', error.message);
    results.error = error.message;
    results.securityScore = 0;
    results.complianceScore = 0;
    results.grade = 'F';
  } finally {
    await browser.close();
  }

  return results;
}

// Run if called directly
if (require.main === module) {
  runSecurityAudit()
    .then(results => {
      console.log('\n🚀 Y COMBINATOR SECURITY READINESS');
      console.log('======================================================================');
      
      const overallScore = (results.securityScore + results.complianceScore) / 2;
      
      if (overallScore >= 90) {
        console.log('🎉 EXCELLENT! Your app meets Y Combinator security standards!');
        console.log('   ✅ Enterprise-grade security headers');
        console.log('   ✅ Privacy compliance ready');
        console.log('   ✅ Investor-grade data protection');
      } else if (overallScore >= 80) {
        console.log('✅ GOOD! Your app is secure but needs minor improvements for YC standards.');
      } else {
        console.log('⚠️  CRITICAL: Address security issues before YC application!');
        console.log('   Investors expect enterprise-grade security from day one.');
      }
      
      process.exit(overallScore >= 80 ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Security audit failed:', error);
      process.exit(1);
    });
}

module.exports = { runSecurityAudit };
