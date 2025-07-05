const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Y Combinator Grade Business Intelligence & Growth Metrics
const BUSINESS_METRICS = {
  userExperience: [
    'Conversion Funnel Optimization',
    'User Onboarding Flow',
    'Feature Discovery Rate',
    'User Retention Indicators'
  ],
  growth: [
    'Viral Coefficient Potential',
    'Product-Market Fit Signals',
    'User Acquisition Readiness',
    'Monetization Clarity'
  ],
  technical: [
    'Scalability Architecture',
    'Data Collection Strategy',
    'A/B Testing Readiness',
    'Analytics Implementation'
  ]
};

async function runBusinessMetricsAudit() {
  console.log('📈 SANSKARA AI - Y COMBINATOR BUSINESS READINESS AUDIT');
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
    businessScore: 0,
    growthScore: 0,
    marketFitScore: 0,
    grade: 'F',
    strengths: [],
    opportunities: [],
    ycReadiness: {}
  };

  try {
    console.log(`📊 Analyzing business metrics for: ${url}`);
    
    // Navigate to the page
    await page.goto(url, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });

    // 1. User Experience & Conversion Analysis
    console.log('\n👥 User Experience Analysis...');
    const uxAnalysis = await page.evaluate(() => {
      const analysis = {
        ctaButtons: 0,
        signupForms: 0,
        navigationClarity: 0,
        valueProposition: false,
        testimonials: 0,
        pricing: false,
        faq: false,
        blog: false,
        dashboard: false
      };
      
      // Count CTA buttons
      analysis.ctaButtons = document.querySelectorAll('button, a').length;
      
      // Check for signup/login forms
      analysis.signupForms = document.querySelectorAll('form').length;
      
      // Check navigation clarity
      const nav = document.querySelector('nav');
      if (nav) {
        analysis.navigationClarity = nav.querySelectorAll('a').length;
      }
      
      // Check for value proposition indicators
      const headings = Array.from(document.querySelectorAll('h1, h2, h3'));
      analysis.valueProposition = headings.some(h => 
        h.textContent.toLowerCase().includes('plan') ||
        h.textContent.toLowerCase().includes('wedding') ||
        h.textContent.toLowerCase().includes('ai') ||
        h.textContent.toLowerCase().includes('smart')
      );
      
      // Check for social proof
      analysis.testimonials = document.querySelectorAll('[class*="testimonial"], [class*="review"]').length;
      
      // Check for key pages
      analysis.pricing = !!document.querySelector('a[href*="pricing"], [class*="pricing"]');
      analysis.faq = !!document.querySelector('a[href*="faq"], [class*="faq"]');
      analysis.blog = !!document.querySelector('a[href*="blog"], [class*="blog"]');
      analysis.dashboard = !!document.querySelector('a[href*="dashboard"], [class*="dashboard"]');
      
      return analysis;
    });

    let businessScore = 0;
    
    // Score UX elements
    if (uxAnalysis.valueProposition) {
      businessScore += 20;
      results.strengths.push('Clear value proposition identified');
    } else {
      results.opportunities.push('CRITICAL: Strengthen value proposition messaging');
    }
    
    if (uxAnalysis.signupForms > 0) {
      businessScore += 15;
      results.strengths.push('User acquisition funnel present');
    } else {
      results.opportunities.push('HIGH: Add user signup/registration flow');
    }
    
    if (uxAnalysis.dashboard) {
      businessScore += 15;
      results.strengths.push('Product dashboard/app interface exists');
    } else {
      results.opportunities.push('CRITICAL: No user dashboard found - core product missing');
    }
    
    if (uxAnalysis.pricing) {
      businessScore += 10;
      results.strengths.push('Monetization strategy visible');
    } else {
      results.opportunities.push('HIGH: Add pricing strategy display');
    }

    // 2. Product-Market Fit Indicators
    console.log('🎯 Product-Market Fit Analysis...');
    const marketFitAnalysis = await page.evaluate(() => {
      const analysis = {
        problemStatement: false,
        solutionClarity: false,
        targetAudience: false,
        competitiveDifferentiation: false,
        userBenefits: [],
        industryFocus: false
      };
      
      const textContent = document.body.textContent.toLowerCase();
      
      // Check for problem statement
      analysis.problemStatement = textContent.includes('problem') || 
                                 textContent.includes('challenge') ||
                                 textContent.includes('difficulty');
      
      // Check for solution clarity
      analysis.solutionClarity = textContent.includes('solution') ||
                                textContent.includes('solve') ||
                                textContent.includes('simplify');
      
      // Check for target audience identification
      analysis.targetAudience = textContent.includes('couples') ||
                               textContent.includes('bride') ||
                               textContent.includes('groom') ||
                               textContent.includes('wedding');
      
      // Check for competitive differentiation
      analysis.competitiveDifferentiation = textContent.includes('ai') ||
                                           textContent.includes('artificial intelligence') ||
                                           textContent.includes('smart') ||
                                           textContent.includes('personalized');
      
      // Extract user benefits
      const benefitKeywords = ['save time', 'reduce stress', 'personalized', 'efficient', 'easy', 'simple'];
      analysis.userBenefits = benefitKeywords.filter(keyword => textContent.includes(keyword));
      
      // Industry focus
      analysis.industryFocus = textContent.includes('hindu') ||
                              textContent.includes('traditional') ||
                              textContent.includes('cultural') ||
                              textContent.includes('ritual');
      
      return analysis;
    });

    let marketFitScore = 0;
    
    if (marketFitAnalysis.problemStatement) {
      marketFitScore += 20;
      results.strengths.push('Clear problem identification');
    } else {
      results.opportunities.push('CRITICAL: Articulate the problem you solve');
    }
    
    if (marketFitAnalysis.solutionClarity) {
      marketFitScore += 20;
      results.strengths.push('Solution clearly communicated');
    } else {
      results.opportunities.push('HIGH: Make solution more explicit');
    }
    
    if (marketFitAnalysis.targetAudience) {
      marketFitScore += 15;
      results.strengths.push('Target audience clearly defined');
    } else {
      results.opportunities.push('HIGH: Better define target customer');
    }
    
    if (marketFitAnalysis.competitiveDifferentiation) {
      marketFitScore += 25;
      results.strengths.push('AI differentiation clearly positioned');
    } else {
      results.opportunities.push('CRITICAL: Strengthen competitive differentiation');
    }
    
    if (marketFitAnalysis.industryFocus) {
      marketFitScore += 20;
      results.strengths.push('Niche market focus (Hindu weddings) - excellent for YC');
    } else {
      results.opportunities.push('Consider emphasizing niche market advantage');
    }

    // 3. Growth & Scalability Analysis
    console.log('🚀 Growth & Scalability Analysis...');
    const growthAnalysis = await page.evaluate(() => {
      const analysis = {
        socialSharing: 0,
        referralProgram: false,
        networkEffects: false,
        contentMarketing: false,
        apiReadiness: false,
        internationalReadiness: false,
        mobileOptimized: false
      };
      
      // Check for social sharing capabilities
      analysis.socialSharing = document.querySelectorAll('[class*="share"], [class*="social"]').length;
      
      // Check for referral program
      const textContent = document.body.textContent.toLowerCase();
      analysis.referralProgram = textContent.includes('refer') || textContent.includes('invite');
      
      // Network effects potential
      analysis.networkEffects = textContent.includes('community') ||
                               textContent.includes('connect') ||
                               textContent.includes('share');
      
      // Content marketing
      analysis.contentMarketing = !!document.querySelector('a[href*="blog"]') ||
                                 document.querySelectorAll('article, [class*="blog"]').length > 0;
      
      // API readiness (indirect indicators)
      analysis.apiReadiness = textContent.includes('integration') ||
                             textContent.includes('api') ||
                             textContent.includes('connect');
      
      // International readiness
      analysis.internationalReadiness = textContent.includes('global') ||
                                       textContent.includes('international') ||
                                       document.querySelectorAll('[lang], [class*="lang"]').length > 0;
      
      // Mobile optimization
      analysis.mobileOptimized = window.innerWidth < 768 || 
                                document.querySelector('meta[name="viewport"]') !== null;
      
      return analysis;
    });

    let growthScore = 0;
    
    if (growthAnalysis.contentMarketing) {
      growthScore += 20;
      results.strengths.push('Content marketing strategy (blog) in place');
    } else {
      results.opportunities.push('HIGH: Add content marketing strategy');
    }
    
    if (growthAnalysis.networkEffects) {
      growthScore += 25;
      results.strengths.push('Network effects potential identified');
    } else {
      results.opportunities.push('MEDIUM: Consider network effects opportunities');
    }
    
    if (growthAnalysis.mobileOptimized) {
      growthScore += 20;
      results.strengths.push('Mobile-optimized for broader reach');
    } else {
      results.opportunities.push('CRITICAL: Mobile optimization essential for growth');
    }
    
    if (growthAnalysis.socialSharing > 0) {
      growthScore += 15;
      results.strengths.push('Social sharing capabilities present');
    } else {
      results.opportunities.push('MEDIUM: Add social sharing for viral growth');
    }

    // 4. Y Combinator Specific Readiness
    console.log('🏆 Y Combinator Readiness Assessment...');
    
    const ycReadiness = {
      clearProblem: marketFitAnalysis.problemStatement && marketFitAnalysis.targetAudience,
      uniqueSolution: marketFitAnalysis.competitiveDifferentiation && marketFitAnalysis.solutionClarity,
      largeTAM: marketFitAnalysis.industryFocus, // Wedding industry is huge
      earlyTraction: uxAnalysis.dashboard && uxAnalysis.signupForms,
      growthPotential: growthAnalysis.networkEffects || growthAnalysis.contentMarketing,
      techAdvantage: marketFitAnalysis.competitiveDifferentiation, // AI advantage
      scalableModel: growthAnalysis.mobileOptimized && (uxAnalysis.pricing || uxAnalysis.dashboard)
    };

    // Calculate scores
    results.businessScore = Math.max(0, businessScore);
    results.marketFitScore = Math.max(0, marketFitScore);
    results.growthScore = Math.max(0, growthScore);
    
    const overallScore = (results.businessScore + results.marketFitScore + results.growthScore) / 3;
    
    if (overallScore >= 95) results.grade = 'A+';
    else if (overallScore >= 90) results.grade = 'A';
    else if (overallScore >= 85) results.grade = 'A-';
    else if (overallScore >= 80) results.grade = 'B+';
    else if (overallScore >= 75) results.grade = 'B';
    else if (overallScore >= 70) results.grade = 'B-';
    else if (overallScore >= 65) results.grade = 'C+';
    else if (overallScore >= 60) results.grade = 'C';
    else results.grade = 'F';

    results.ycReadiness = ycReadiness;

    // Output results
    console.log('\n🏆 BUSINESS READINESS RESULTS');
    console.log('======================================================================');
    console.log(`📊 Business Score: ${results.businessScore}/100`);
    console.log(`🎯 Market Fit Score: ${results.marketFitScore}/100`);
    console.log(`🚀 Growth Score: ${results.growthScore}/100`);
    console.log(`📈 Overall Grade: ${results.grade} (${overallScore.toFixed(1)}/100)`);
    
    console.log(`\n🚀 Y COMBINATOR READINESS CHECKLIST:`);
    console.log(`   Clear Problem Statement: ${ycReadiness.clearProblem ? '✅' : '❌'}`);
    console.log(`   Unique Solution: ${ycReadiness.uniqueSolution ? '✅' : '❌'}`);
    console.log(`   Large TAM (Wedding Market): ${ycReadiness.largeTAM ? '✅' : '❌'}`);
    console.log(`   Early Traction: ${ycReadiness.earlyTraction ? '✅' : '❌'}`);
    console.log(`   Growth Potential: ${ycReadiness.growthPotential ? '✅' : '❌'}`);
    console.log(`   Tech Advantage (AI): ${ycReadiness.techAdvantage ? '✅' : '❌'}`);
    console.log(`   Scalable Model: ${ycReadiness.scalableModel ? '✅' : '❌'}`);
    
    const ycScore = Object.values(ycReadiness).filter(Boolean).length;
    console.log(`\n🎯 YC Readiness: ${ycScore}/7 criteria met`);
    
    if (results.strengths.length > 0) {
      console.log(`\n💪 Key Strengths:`);
      results.strengths.forEach(strength => console.log(`   ✅ ${strength}`));
    }
    
    if (results.opportunities.length > 0) {
      console.log(`\n🎯 Growth Opportunities:`);
      results.opportunities.forEach(opp => console.log(`   📈 ${opp}`));
    }

    // Save detailed report
    const reportPath = path.join(process.cwd(), 'verifications', 'business-readiness-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    console.log(`\n📄 Detailed report saved: ${reportPath}`);

  } catch (error) {
    console.error('❌ Business analysis failed:', error.message);
    results.error = error.message;
    results.businessScore = 0;
    results.marketFitScore = 0;
    results.growthScore = 0;
    results.grade = 'F';
  } finally {
    await browser.close();
  }

  return results;
}

// Run if called directly
if (require.main === module) {
  runBusinessMetricsAudit()
    .then(results => {
      console.log('\n🚀 Y COMBINATOR APPLICATION READINESS');
      console.log('======================================================================');
      
      const overallScore = (results.businessScore + results.marketFitScore + results.growthScore) / 3;
      const ycScore = Object.values(results.ycReadiness).filter(Boolean).length;
      
      if (ycScore >= 6 && overallScore >= 85) {
        console.log('🎉 EXCEPTIONAL! Your startup is Y Combinator ready!');
        console.log('   🚀 Strong product-market fit indicators');
        console.log('   📈 Clear growth trajectory');
        console.log('   💰 Investor-ready business model');
        console.log('   🎯 Meets 6+ YC criteria');
        console.log('\n💡 Apply with confidence! Focus on traction metrics in your application.');
      } else if (ycScore >= 5 && overallScore >= 75) {
        console.log('✅ STRONG CANDIDATE! Address remaining items before YC application.');
        console.log('   Focus on the missing criteria above.');
      } else {
        console.log('⚠️  NOT YET READY for Y Combinator application.');
        console.log('   Address critical gaps in business fundamentals first.');
        console.log('   Consider building more traction before applying.');
      }
      
      process.exit(ycScore >= 5 && overallScore >= 75 ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Business analysis failed:', error);
      process.exit(1);
    });
}

module.exports = { runBusinessMetricsAudit };
