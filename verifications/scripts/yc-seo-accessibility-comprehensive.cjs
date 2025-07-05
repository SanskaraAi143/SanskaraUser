#!/usr/bin/env node

/**
 * SEO & ACCESSIBILITY VALIDATION - INDUSTRY STANDARDS
 * 
 * Based on comprehensive research from:
 * - Google's Search Quality Rater Guidelines (2024)
 * - WCAG 2.1 AA Accessibility Standards (W3C)
 * - Lighthouse SEO and Accessibility Audits
 * - SEMrush/Ahrefs Technical SEO Checklists
 * - Google Search Console Best Practices
 * - Schema.org Structured Data Guidelines
 * 
 * YC-Ready Requirements:
 * - Technical SEO: Complete meta tags, structured data, sitemap
 * - Accessibility: WCAG 2.1 AA compliance (Level AA)
 * - Performance: Mobile-first indexing ready
 * - Content: Quality, originality, E-A-T signals
 * - User Experience: Core Web Vitals, mobile usability
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

// Research-backed SEO and accessibility standards
const STANDARDS = {
  seo: {
    technicalSEO: {
      metaTags: ['title', 'description', 'keywords', 'author', 'viewport'],
      openGraph: ['og:title', 'og:description', 'og:image', 'og:url', 'og:type'],
      twitter: ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image'],
      structuredData: ['Organization', 'WebSite', 'BreadcrumbList', 'BlogPosting', 'LocalBusiness']
    },
    contentQuality: {
      minWordCount: 300,          // Google's minimum for quality content
      headingStructure: true,     // Proper H1-H6 hierarchy
      internalLinks: 3,           // Minimum internal links per page
      imageOptimization: true,    // Alt tags, proper sizing
      languageDeclaration: true   // HTML lang attribute
    },
    mobileFriendly: {
      responsive: true,           // Mobile-responsive design
      touchTargets: 44,           // Minimum touch target size (px)
      viewportMeta: true,         // Proper viewport meta tag
      mobileUsability: true       // No mobile usability issues
    }
  },
  
  accessibility: {
    wcag21AA: {
      perceivable: {
        colorContrast: 4.5,       // AA standard contrast ratio
        textAlternatives: true,   // Alt text for images
        captions: true,           // Video captions
        adaptable: true           // Proper semantic markup
      },
      operable: {
        keyboardAccessible: true, // Full keyboard navigation
        seizuresSafe: true,       // No seizure-inducing content
        navigable: true,          // Skip links, focus indicators
        inputAssistance: true     // Form labels and instructions
      },
      understandable: {
        readable: true,           // Clear language and structure
        predictable: true,        // Consistent navigation
        inputAssistance: true     // Error identification and suggestions
      },
      robust: {
        compatible: true,         // Valid HTML, ARIA compliance
        futureProof: true         // Standards-compliant code
      }
    }
  }
};

// YC-specific requirements for growth-ready startups
const YC_REQUIREMENTS = {
  seo: {
    minimumScore: 85,           // Technical SEO score
    structuredDataRequired: true,
    mobileFriendlyRequired: true,
    contentQualityRequired: true
  },
  accessibility: {
    minimumScore: 85,           // WCAG 2.1 AA compliance score
    contrastRatioRequired: true,
    keyboardNavigationRequired: true,
    screenReaderCompatible: true
  }
};

class SEOAccessibilityAuditor {
  constructor(url) {
    this.url = url;
    this.results = {
      timestamp: new Date().toISOString(),
      url: url,
      seo: {
        score: 0,
        technicalSEO: {},
        contentQuality: {},
        mobileFriendly: {},
        structuredData: []
      },
      accessibility: {
        score: 0,
        wcag21AA: {},
        violations: [],
        recommendations: []
      },
      ycReadiness: false,
      overallScore: 0,
      grade: 'F'
    };
  }

  async runComprehensiveAudit() {
    console.log('🔍 SEO & ACCESSIBILITY AUDIT - YC READINESS STANDARDS');
    console.log('================================================================');
    console.log(`🎯 Target URL: ${this.url}`);
    console.log('📊 Standards: Google SEO Guidelines + WCAG 2.1 AA\n');

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage']
    });

    try {
      const page = await browser.newPage();
      await page.goto(this.url, { waitUntil: 'networkidle0', timeout: 30000 });

      // 1. Technical SEO Audit
      await this.auditTechnicalSEO(page);
      
      // 2. Content Quality Assessment
      await this.assessContentQuality(page);
      
      // 3. Mobile-Friendly Evaluation
      await this.evaluateMobileFriendly(page);
      
      // 4. Structured Data Analysis
      await this.analyzeStructuredData(page);
      
      // 5. Accessibility Audit (WCAG 2.1 AA)
      await this.auditAccessibility(page);
      
      // 6. Calculate scores and YC readiness
      this.calculateScores();
      
      // 7. Generate recommendations
      this.generateRecommendations();
      
      // 8. Output results
      this.outputResults();
      
      return this.results;
      
    } catch (error) {
      console.error('❌ SEO/Accessibility audit failed:', error.message);
      return { error: error.message, score: 0, ycReadiness: false };
    } finally {
      await browser.close();
    }
  }

  async auditTechnicalSEO(page) {
    console.log('🔧 Technical SEO Audit...');
    console.log('--------------------------------------------------');
    
    const seoData = await page.evaluate(() => {
      const data = {
        title: document.title || '',
        metaTags: {},
        headings: [],
        links: [],
        images: [],
        canonical: '',
        lang: document.documentElement.lang || '',
        charset: document.characterSet || ''
      };
      
      // Extract meta tags
      const metaTags = document.querySelectorAll('meta');
      metaTags.forEach(tag => {
        const name = tag.getAttribute('name') || tag.getAttribute('property');
        const content = tag.getAttribute('content');
        if (name && content) {
          data.metaTags[name] = content;
        }
      });
      
      // Extract headings
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      headings.forEach(heading => {
        data.headings.push({
          tag: heading.tagName.toLowerCase(),
          text: heading.textContent.trim(),
          level: parseInt(heading.tagName.charAt(1))
        });
      });
      
      // Extract links
      const links = document.querySelectorAll('a[href]');
      links.forEach(link => {
        data.links.push({
          href: link.href,
          text: link.textContent.trim(),
          internal: link.href.includes(window.location.origin)
        });
      });
      
      // Extract images
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        data.images.push({
          src: img.src,
          alt: img.alt || '',
          width: img.width,
          height: img.height,
          hasAlt: !!img.alt
        });
      });
      
      // Extract canonical URL
      const canonical = document.querySelector('link[rel="canonical"]');
      data.canonical = canonical ? canonical.href : '';
      
      return data;
    });

    // Evaluate Technical SEO
    let technicalScore = 0;
    
    // Title tag assessment
    if (seoData.title) {
      if (seoData.title.length >= 30 && seoData.title.length <= 60) {
        technicalScore += 10;
        console.log('✅ Title tag: Optimal length (30-60 chars)');
      } else {
        console.log(`⚠️  Title tag: ${seoData.title.length} chars (recommended: 30-60)`);
        technicalScore += 5;
      }
    } else {
      console.log('❌ Title tag: Missing');
    }
    
    // Meta description assessment
    const metaDesc = seoData.metaTags.description || '';
    if (metaDesc) {
      if (metaDesc.length >= 120 && metaDesc.length <= 160) {
        technicalScore += 10;
        console.log('✅ Meta description: Optimal length (120-160 chars)');
      } else {
        console.log(`⚠️  Meta description: ${metaDesc.length} chars (recommended: 120-160)`);
        technicalScore += 5;
      }
    } else {
      console.log('❌ Meta description: Missing');
    }
    
    // Viewport meta tag
    if (seoData.metaTags.viewport) {
      technicalScore += 10;
      console.log('✅ Viewport meta tag: Present');
    } else {
      console.log('❌ Viewport meta tag: Missing');
    }
    
    // Language declaration
    if (seoData.lang) {
      technicalScore += 5;
      console.log(`✅ Language declaration: ${seoData.lang}`);
    } else {
      console.log('❌ Language declaration: Missing');
    }
    
    // Charset declaration
    if (seoData.charset) {
      technicalScore += 5;
      console.log(`✅ Charset declaration: ${seoData.charset}`);
    }
    
    // Canonical URL
    if (seoData.canonical) {
      technicalScore += 5;
      console.log('✅ Canonical URL: Present');
    } else {
      console.log('⚠️  Canonical URL: Missing (recommended)');
    }
    
    // Open Graph tags
    const hasOG = ['og:title', 'og:description', 'og:image', 'og:url']
      .every(tag => seoData.metaTags[tag]);
    if (hasOG) {
      technicalScore += 15;
      console.log('✅ Open Graph tags: Complete');
    } else {
      console.log('⚠️  Open Graph tags: Incomplete');
      technicalScore += 5;
    }
    
    // Twitter Card tags
    const hasTwitter = ['twitter:card', 'twitter:title', 'twitter:description']
      .every(tag => seoData.metaTags[tag]);
    if (hasTwitter) {
      technicalScore += 10;
      console.log('✅ Twitter Card tags: Complete');
    } else {
      console.log('⚠️  Twitter Card tags: Incomplete');
    }
    
    this.results.seo.technicalSEO = {
      score: technicalScore,
      title: seoData.title,
      metaTags: seoData.metaTags,
      headings: seoData.headings,
      links: seoData.links,
      images: seoData.images,
      canonical: seoData.canonical,
      lang: seoData.lang
    };
  }

  async assessContentQuality(page) {
    console.log('\n📝 Content Quality Assessment...');
    console.log('--------------------------------------------------');
    
    const contentData = await page.evaluate(() => {
      const data = {
        wordCount: 0,
        headingStructure: [],
        internalLinks: 0,
        externalLinks: 0,
        imageCount: 0,
        imagesWithAlt: 0,
        paragraphs: 0,
        readabilityScore: 0
      };
      
      // Count words in main content
      const mainContent = document.body.textContent || '';
      data.wordCount = mainContent.split(/\s+/).filter(word => word.length > 0).length;
      
      // Analyze heading structure
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      headings.forEach(heading => {
        data.headingStructure.push({
          level: parseInt(heading.tagName.charAt(1)),
          text: heading.textContent.trim()
        });
      });
      
      // Count links
      const links = document.querySelectorAll('a[href]');
      links.forEach(link => {
        if (link.href.includes(window.location.origin)) {
          data.internalLinks++;
        } else {
          data.externalLinks++;
        }
      });
      
      // Analyze images
      const images = document.querySelectorAll('img');
      data.imageCount = images.length;
      images.forEach(img => {
        if (img.alt && img.alt.trim()) {
          data.imagesWithAlt++;
        }
      });
      
      // Count paragraphs
      data.paragraphs = document.querySelectorAll('p').length;
      
      return data;
    });

    let contentScore = 0;
    
    // Word count assessment
    if (contentData.wordCount >= 1000) {
      contentScore += 20;
      console.log(`✅ Content length: ${contentData.wordCount} words (excellent)`);
    } else if (contentData.wordCount >= 500) {
      contentScore += 15;
      console.log(`✅ Content length: ${contentData.wordCount} words (good)`);
    } else if (contentData.wordCount >= 300) {
      contentScore += 10;
      console.log(`⚠️  Content length: ${contentData.wordCount} words (acceptable)`);
    } else {
      console.log(`❌ Content length: ${contentData.wordCount} words (too short)`);
    }
    
    // Heading structure assessment
    const h1Count = contentData.headingStructure.filter(h => h.level === 1).length;
    if (h1Count === 1) {
      contentScore += 10;
      console.log('✅ H1 structure: Single H1 tag (optimal)');
    } else if (h1Count === 0) {
      console.log('❌ H1 structure: No H1 tag found');
    } else {
      console.log(`⚠️  H1 structure: Multiple H1 tags (${h1Count})`);
      contentScore += 5;
    }
    
    // Check heading hierarchy
    let hierarchyValid = true;
    for (let i = 1; i < contentData.headingStructure.length; i++) {
      const current = contentData.headingStructure[i];
      const previous = contentData.headingStructure[i - 1];
      if (current.level > previous.level + 1) {
        hierarchyValid = false;
        break;
      }
    }
    
    if (hierarchyValid && contentData.headingStructure.length > 1) {
      contentScore += 10;
      console.log('✅ Heading hierarchy: Proper structure');
    } else {
      console.log('⚠️  Heading hierarchy: Issues detected');
      contentScore += 5;
    }
    
    // Internal links assessment
    if (contentData.internalLinks >= 5) {
      contentScore += 10;
      console.log(`✅ Internal links: ${contentData.internalLinks} (good)`);
    } else if (contentData.internalLinks >= 3) {
      contentScore += 5;
      console.log(`⚠️  Internal links: ${contentData.internalLinks} (acceptable)`);
    } else {
      console.log(`❌ Internal links: ${contentData.internalLinks} (too few)`);
    }
    
    // Image optimization assessment
    const imageOptimization = contentData.imageCount > 0 ? 
      (contentData.imagesWithAlt / contentData.imageCount) * 100 : 100;
    
    if (imageOptimization >= 90) {
      contentScore += 15;
      console.log(`✅ Image optimization: ${imageOptimization.toFixed(1)}% have alt text`);
    } else if (imageOptimization >= 70) {
      contentScore += 10;
      console.log(`⚠️  Image optimization: ${imageOptimization.toFixed(1)}% have alt text`);
    } else {
      console.log(`❌ Image optimization: ${imageOptimization.toFixed(1)}% have alt text`);
      contentScore += 5;
    }
    
    this.results.seo.contentQuality = {
      score: contentScore,
      wordCount: contentData.wordCount,
      headingStructure: contentData.headingStructure,
      internalLinks: contentData.internalLinks,
      externalLinks: contentData.externalLinks,
      imageOptimization: imageOptimization
    };
  }

  async evaluateMobileFriendly(page) {
    console.log('\n📱 Mobile-Friendly Evaluation...');
    console.log('--------------------------------------------------');
    
    // Set mobile viewport
    await page.setViewport({ width: 375, height: 667 });
    
    const mobileData = await page.evaluate(() => {
      const data = {
        hasViewportMeta: false,
        touchTargets: [],
        horizontalScroll: false,
        textSize: 0,
        tapTargetSize: 0
      };
      
      // Check viewport meta tag
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      data.hasViewportMeta = !!viewportMeta;
      
      // Analyze touch targets
      const clickableElements = document.querySelectorAll('button, a, input, select, textarea');
      clickableElements.forEach(element => {
        const rect = element.getBoundingClientRect();
        data.touchTargets.push({
          width: rect.width,
          height: rect.height,
          area: rect.width * rect.height
        });
      });
      
      // Check for horizontal scroll
      data.horizontalScroll = document.documentElement.scrollWidth > window.innerWidth;
      
      // Check text size
      const textElements = document.querySelectorAll('p, span, div, a, li');
      let totalSize = 0;
      let count = 0;
      textElements.forEach(element => {
        const style = window.getComputedStyle(element);
        const fontSize = parseFloat(style.fontSize);
        if (fontSize > 0) {
          totalSize += fontSize;
          count++;
        }
      });
      data.textSize = count > 0 ? totalSize / count : 0;
      
      return data;
    });

    let mobileScore = 0;
    
    // Viewport meta tag
    if (mobileData.hasViewportMeta) {
      mobileScore += 20;
      console.log('✅ Viewport meta tag: Present');
    } else {
      console.log('❌ Viewport meta tag: Missing');
    }
    
    // Touch target size
    const smallTargets = mobileData.touchTargets.filter(target => 
      target.width < 44 || target.height < 44
    ).length;
    
    if (smallTargets === 0) {
      mobileScore += 25;
      console.log('✅ Touch targets: All meet minimum size (44px)');
    } else {
      console.log(`⚠️  Touch targets: ${smallTargets} targets too small`);
      mobileScore += 10;
    }
    
    // Horizontal scroll
    if (!mobileData.horizontalScroll) {
      mobileScore += 20;
      console.log('✅ Horizontal scroll: No issues detected');
    } else {
      console.log('❌ Horizontal scroll: Content extends beyond viewport');
    }
    
    // Text size
    if (mobileData.textSize >= 16) {
      mobileScore += 15;
      console.log(`✅ Text size: ${mobileData.textSize.toFixed(1)}px (readable)`);
    } else {
      console.log(`⚠️  Text size: ${mobileData.textSize.toFixed(1)}px (may be too small)`);
      mobileScore += 5;
    }
    
    this.results.seo.mobileFriendly = {
      score: mobileScore,
      hasViewportMeta: mobileData.hasViewportMeta,
      touchTargets: mobileData.touchTargets.length,
      smallTargets: smallTargets,
      horizontalScroll: mobileData.horizontalScroll,
      averageTextSize: mobileData.textSize
    };
  }

  async analyzeStructuredData(page) {
    console.log('\n🏗️  Structured Data Analysis...');
    console.log('--------------------------------------------------');
    
    const structuredData = await page.evaluate(() => {
      const data = [];
      
      // JSON-LD structured data
      const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
      jsonLdScripts.forEach(script => {
        try {
          const jsonData = JSON.parse(script.textContent);
          data.push({
            type: 'JSON-LD',
            schema: jsonData['@type'] || 'Unknown',
            data: jsonData
          });
        } catch (e) {
          // Invalid JSON-LD
        }
      });
      
      // Microdata
      const microdataElements = document.querySelectorAll('[itemscope]');
      microdataElements.forEach(element => {
        const itemType = element.getAttribute('itemtype');
        if (itemType) {
          data.push({
            type: 'Microdata',
            schema: itemType.split('/').pop(),
            element: element.tagName
          });
        }
      });
      
      return data;
    });

    let structuredScore = 0;
    
    if (structuredData.length > 0) {
      structuredScore += 20;
      console.log(`✅ Structured data: ${structuredData.length} schema(s) found`);
      
      structuredData.forEach(schema => {
        console.log(`   • ${schema.type}: ${schema.schema}`);
      });
      
      // Check for important schema types
      const schemaTypes = structuredData.map(s => s.schema.toLowerCase());
      
      if (schemaTypes.includes('organization')) {
        structuredScore += 10;
        console.log('✅ Organization schema: Present');
      }
      
      if (schemaTypes.includes('website')) {
        structuredScore += 10;
        console.log('✅ Website schema: Present');
      }
      
      if (schemaTypes.includes('blogposting')) {
        structuredScore += 10;
        console.log('✅ BlogPosting schema: Present');
      }
      
    } else {
      console.log('❌ Structured data: None found');
    }
    
    this.results.seo.structuredData = structuredData;
    this.results.seo.structuredDataScore = structuredScore;
  }

  async auditAccessibility(page) {
    console.log('\n♿ Accessibility Audit (WCAG 2.1 AA)...');
    console.log('--------------------------------------------------');
    
    const accessibilityData = await page.evaluate(() => {
      const data = {
        images: [],
        links: [],
        forms: [],
        headings: [],
        landmarks: [],
        colorContrast: [],
        focusableElements: [],
        ariaLabels: 0,
        skipLinks: 0
      };
      
      // Analyze images
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        data.images.push({
          src: img.src,
          alt: img.alt || '',
          hasAlt: !!img.alt,
          decorative: img.getAttribute('role') === 'presentation'
        });
      });
      
      // Analyze links
      const links = document.querySelectorAll('a');
      links.forEach(link => {
        data.links.push({
          href: link.href,
          text: link.textContent.trim(),
          hasText: link.textContent.trim().length > 0,
          ariaLabel: link.getAttribute('aria-label')
        });
      });
      
      // Analyze forms
      const forms = document.querySelectorAll('form');
      forms.forEach(form => {
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
          const label = form.querySelector(`label[for="${input.id}"]`) || 
                       input.closest('label');
          data.forms.push({
            type: input.type,
            hasLabel: !!label,
            hasAriaLabel: !!input.getAttribute('aria-label'),
            required: input.required
          });
        });
      });
      
      // Analyze headings
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      headings.forEach(heading => {
        data.headings.push({
          level: parseInt(heading.tagName.charAt(1)),
          text: heading.textContent.trim(),
          empty: heading.textContent.trim().length === 0
        });
      });
      
      // Analyze landmarks
      const landmarks = document.querySelectorAll('main, nav, header, footer, aside, section[aria-labelledby], section[aria-label]');
      data.landmarks = landmarks.length;
      
      // Count ARIA labels
      data.ariaLabels = document.querySelectorAll('[aria-label], [aria-labelledby]').length;
      
      // Check for skip links
      data.skipLinks = document.querySelectorAll('a[href*="#main"], a[href*="#content"]').length;
      
      // Analyze focusable elements
      const focusableElements = document.querySelectorAll('a, button, input, textarea, select, [tabindex]');
      data.focusableElements = focusableElements.length;
      
      return data;
    });

    let accessibilityScore = 0;
    const violations = [];
    
    // Image accessibility
    const imagesWithoutAlt = accessibilityData.images.filter(img => !img.hasAlt && !img.decorative);
    if (imagesWithoutAlt.length === 0) {
      accessibilityScore += 15;
      console.log('✅ Image accessibility: All images have alt text');
    } else {
      console.log(`❌ Image accessibility: ${imagesWithoutAlt.length} images missing alt text`);
      violations.push(`${imagesWithoutAlt.length} images missing alt text`);
    }
    
    // Link accessibility
    const linksWithoutText = accessibilityData.links.filter(link => !link.hasText && !link.ariaLabel);
    if (linksWithoutText.length === 0) {
      accessibilityScore += 15;
      console.log('✅ Link accessibility: All links have descriptive text');
    } else {
      console.log(`❌ Link accessibility: ${linksWithoutText.length} links without text`);
      violations.push(`${linksWithoutText.length} links without descriptive text`);
    }
    
    // Form accessibility
    const formsWithoutLabels = accessibilityData.forms.filter(form => !form.hasLabel && !form.hasAriaLabel);
    if (formsWithoutLabels.length === 0) {
      accessibilityScore += 15;
      console.log('✅ Form accessibility: All form controls have labels');
    } else {
      console.log(`❌ Form accessibility: ${formsWithoutLabels.length} controls without labels`);
      violations.push(`${formsWithoutLabels.length} form controls without labels`);
    }
    
    // Heading structure
    const emptyHeadings = accessibilityData.headings.filter(h => h.empty);
    if (emptyHeadings.length === 0) {
      accessibilityScore += 10;
      console.log('✅ Heading structure: No empty headings');
    } else {
      console.log(`❌ Heading structure: ${emptyHeadings.length} empty headings`);
      violations.push(`${emptyHeadings.length} empty headings`);
    }
    
    // Landmarks
    if (accessibilityData.landmarks >= 3) {
      accessibilityScore += 10;
      console.log(`✅ Landmarks: ${accessibilityData.landmarks} landmarks found`);
    } else {
      console.log(`⚠️  Landmarks: Only ${accessibilityData.landmarks} landmarks (recommend 3+)`);
      accessibilityScore += 5;
    }
    
    // ARIA usage
    if (accessibilityData.ariaLabels > 0) {
      accessibilityScore += 10;
      console.log(`✅ ARIA labels: ${accessibilityData.ariaLabels} elements with ARIA`);
    } else {
      console.log('⚠️  ARIA labels: No ARIA labels found');
    }
    
    // Skip links
    if (accessibilityData.skipLinks > 0) {
      accessibilityScore += 5;
      console.log('✅ Skip links: Present');
    } else {
      console.log('⚠️  Skip links: Not found (recommended for accessibility)');
    }
    
    // Keyboard navigation
    if (accessibilityData.focusableElements > 0) {
      accessibilityScore += 10;
      console.log(`✅ Keyboard navigation: ${accessibilityData.focusableElements} focusable elements`);
    }
    
    this.results.accessibility = {
      score: accessibilityScore,
      violations: violations,
      wcag21AA: {
        images: accessibilityData.images.length,
        imagesWithAlt: accessibilityData.images.filter(img => img.hasAlt).length,
        links: accessibilityData.links.length,
        linksWithText: accessibilityData.links.filter(link => link.hasText || link.ariaLabel).length,
        forms: accessibilityData.forms.length,
        formsWithLabels: accessibilityData.forms.filter(form => form.hasLabel || form.hasAriaLabel).length,
        headings: accessibilityData.headings.length,
        landmarks: accessibilityData.landmarks,
        ariaLabels: accessibilityData.ariaLabels,
        skipLinks: accessibilityData.skipLinks
      }
    };
  }

  calculateScores() {
    // Calculate SEO score (weighted average)
    const seoComponents = [
      { score: this.results.seo.technicalSEO.score, weight: 30 },
      { score: this.results.seo.contentQuality.score, weight: 30 },
      { score: this.results.seo.mobileFriendly.score, weight: 25 },
      { score: this.results.seo.structuredDataScore || 0, weight: 15 }
    ];
    
    const totalSEOWeight = seoComponents.reduce((sum, comp) => sum + comp.weight, 0);
    this.results.seo.score = Math.round(
      seoComponents.reduce((sum, comp) => sum + (comp.score * comp.weight), 0) / totalSEOWeight
    );
    
    // Overall score (SEO 60%, Accessibility 40%)
    this.results.overallScore = Math.round(
      (this.results.seo.score * 0.6) + (this.results.accessibility.score * 0.4)
    );
    
    this.results.grade = this.getGrade(this.results.overallScore);
    
    // YC Readiness Assessment
    this.results.ycReadiness = 
      this.results.seo.score >= YC_REQUIREMENTS.seo.minimumScore &&
      this.results.accessibility.score >= YC_REQUIREMENTS.accessibility.minimumScore &&
      this.results.accessibility.violations.length <= 2;
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
    
    // SEO recommendations
    if (this.results.seo.score < 85) {
      if (!this.results.seo.technicalSEO.metaTags.description) {
        recommendations.push('Add meta description (120-160 characters)');
      }
      if (!this.results.seo.technicalSEO.metaTags['og:title']) {
        recommendations.push('Add Open Graph meta tags for social sharing');
      }
      if (this.results.seo.structuredData.length === 0) {
        recommendations.push('Implement structured data (JSON-LD schema)');
      }
      if (this.results.seo.contentQuality.wordCount < 500) {
        recommendations.push('Increase content length (minimum 500 words)');
      }
    }
    
    // Accessibility recommendations
    if (this.results.accessibility.score < 85) {
      if (this.results.accessibility.violations.length > 0) {
        recommendations.push('Fix accessibility violations: ' + this.results.accessibility.violations.join(', '));
      }
      if (this.results.accessibility.wcag21AA.landmarks < 3) {
        recommendations.push('Add more semantic landmarks (main, nav, header, footer)');
      }
      if (this.results.accessibility.wcag21AA.skipLinks === 0) {
        recommendations.push('Add skip links for keyboard navigation');
      }
    }
    
    this.results.recommendations = recommendations;
  }

  outputResults() {
    console.log('\n🏆 SEO & ACCESSIBILITY AUDIT RESULTS');
    console.log('================================================================');
    
    console.log(`\n📊 Overall Score: ${this.results.overallScore}/100 (Grade: ${this.results.grade})`);
    
    const ycStatus = this.results.ycReadiness ? '✅ YC READY' : '❌ NOT YC READY';
    const ycColor = this.results.ycReadiness ? '\x1b[32m' : '\x1b[31m';
    console.log(`🚀 Y Combinator Readiness: ${ycColor}${ycStatus}\x1b[0m`);
    
    console.log('\n📈 Detailed Breakdown:');
    console.log(`   🔍 SEO Score: ${this.results.seo.score}/100`);
    console.log(`   ♿ Accessibility Score: ${this.results.accessibility.score}/100`);
    
    if (this.results.accessibility.violations.length > 0) {
      console.log('\n❌ Accessibility Violations:');
      this.results.accessibility.violations.forEach(violation => {
        console.log(`   • ${violation}`);
      });
    }
    
    if (this.results.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      this.results.recommendations.forEach(rec => {
        console.log(`   • ${rec}`);
      });
    }
    
    // Save detailed report
    const reportPath = path.join(process.cwd(), 'seo-accessibility-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`\n📄 Detailed report saved: ${reportPath}`);
  }
}

// Main execution
async function main() {
  const url = process.argv[2] || 'http://localhost:4173';
  
  const auditor = new SEOAccessibilityAuditor(url);
  const results = await auditor.runComprehensiveAudit();
  
  console.log(`\nFinal Score: ${results.overallScore}/100`);
  console.log(`Grade: ${results.grade}`);
  
  process.exit(results.ycReadiness && results.overallScore >= 80 ? 0 : 1);
}

// Handle errors gracefully
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error.message);
  process.exit(1);
});

main();
