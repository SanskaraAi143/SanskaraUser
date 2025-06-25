const puppeteer = require('puppeteer');

// Configuration
const DEFAULT_BASE_URL = 'http://localhost:4173';
const USER_AGENT = 'SanskaraAI-ContentBot/1.0';

const contentPagesToTest = [
  {
    path: '/',
    name: 'Homepage',
    minWordCount: 300,
    expectedKeywords: ['AI', 'wedding', 'Hindu', 'planning', 'Indian'],
    checkCallToAction: true
  },
  {
    path: '/blog/ai-wedding-tools-indian-marriages/',
    name: 'Sample Blog Post',
    minWordCount: 1500,
    expectedKeywords: ['AI', 'wedding', 'tools', 'Indian', 'planning', 'marriage'],
    checkCallToAction: true
  },
  {
    path: '/faq/',
    name: 'FAQ Page',
    minWordCount: 500,
    expectedKeywords: ['Sanskara', 'AI', 'wedding', 'Hindu', 'FAQ'],
    checkCallToAction: false
  }
];

let BASE_URL = process.argv[2] || DEFAULT_BASE_URL;
if (BASE_URL.endsWith('/')) {
  BASE_URL = BASE_URL.slice(0, -1);
}

let errorCount = 0;

const log = (status, message, details = '') => {
  const colorMap = {
    INFO: '\x1b[34m',
    PASS: '\x1b[32m',
    FAIL: '\x1b[31m',
    WARN: '\x1b[33m',
    RESET: '\x1b[0m',
  };
  console.log(`${colorMap[status] || ''}[${status}] ${message}${colorMap.RESET}${details ? `\n${details}` : ''}`);
  if (status === 'FAIL') {
    errorCount++;
  }
};

async function analyzeContentQuality(browser, pageConfig) {
  log('INFO', `---- Content Quality Analysis: ${pageConfig.name} (${pageConfig.path}) ----`);
  const page = await browser.newPage();
  await page.setUserAgent(USER_AGENT);
  const url = `${BASE_URL}${pageConfig.path}`;

  try {
    await page.goto(url, { waitUntil: 'networkidle2' });

    // 1. Word Count Analysis
    const textContent = await page.evaluate(() => {
      // Get main content, excluding nav, footer, etc.
      const main = document.querySelector('main') || document.body;
      return main.innerText || '';
    });

    const wordCount = textContent.split(/\s+/).filter(word => word.length > 0).length;
    
    if (wordCount >= pageConfig.minWordCount) {
      log('PASS', `Word count: ${wordCount} words (minimum: ${pageConfig.minWordCount})`);
    } else {
      log('FAIL', `Word count: ${wordCount} words (minimum: ${pageConfig.minWordCount})`);
    }

    // 2. Keyword Density Analysis
    const lowerText = textContent.toLowerCase();
    pageConfig.expectedKeywords.forEach(keyword => {
      const keywordRegex = new RegExp(`\\b${keyword.toLowerCase()}\\b`, 'g');
      const matches = lowerText.match(keywordRegex) || [];
      const density = (matches.length / wordCount) * 100;
      
      if (density > 0.5 && density < 3) {
        log('PASS', `Keyword "${keyword}": ${matches.length} occurrences (${density.toFixed(2)}% density)`);
      } else if (density === 0) {
        log('FAIL', `Keyword "${keyword}": Not found in content`);
      } else if (density >= 3) {
        log('WARN', `Keyword "${keyword}": ${matches.length} occurrences (${density.toFixed(2)}% density - may be over-optimized)`);
      } else {
        log('WARN', `Keyword "${keyword}": ${matches.length} occurrences (${density.toFixed(2)}% density - low usage)`);
      }
    });

    // 3. Call-to-Action Analysis
    if (pageConfig.checkCallToAction) {
      const ctaElements = await page.$$eval('a, button', els => 
        els.filter(el => {
          const text = el.textContent?.toLowerCase() || '';
          return text.includes('start') || 
                 text.includes('get started') || 
                 text.includes('sign up') || 
                 text.includes('try') || 
                 text.includes('learn more') ||
                 text.includes('contact') ||
                 text.includes('book') ||
                 text.includes('plan');
        }).map(el => el.textContent?.trim())
      );

      if (ctaElements.length > 0) {
        log('PASS', `Found ${ctaElements.length} call-to-action elements`);
        log('INFO', `CTAs: ${ctaElements.slice(0, 3).join(', ')}${ctaElements.length > 3 ? '...' : ''}`);
      } else {
        log('FAIL', 'No clear call-to-action elements found');
      }
    }

    // 4. Readability Score (Simple approximation)
    const sentences = textContent.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgWordsPerSentence = wordCount / sentences.length;
    const complexWords = textContent.split(/\s+/).filter(word => word.length > 6).length;
    const complexWordRatio = (complexWords / wordCount) * 100;

    // Simple readability scoring
    let readabilityScore = 'Good';
    if (avgWordsPerSentence > 25 || complexWordRatio > 20) {
      readabilityScore = 'Difficult';
      log('WARN', `Readability may be difficult (avg ${avgWordsPerSentence.toFixed(1)} words/sentence, ${complexWordRatio.toFixed(1)}% complex words)`);
    } else if (avgWordsPerSentence > 20 || complexWordRatio > 15) {
      readabilityScore = 'Moderate';
      log('PASS', `Readability is moderate (avg ${avgWordsPerSentence.toFixed(1)} words/sentence, ${complexWordRatio.toFixed(1)}% complex words)`);
    } else {
      log('PASS', `Readability is good (avg ${avgWordsPerSentence.toFixed(1)} words/sentence, ${complexWordRatio.toFixed(1)}% complex words)`);
    }

    // 5. Internal Linking Analysis
    const internalLinks = await page.$$eval('a[href^="/"], a[href^="' + BASE_URL + '"]', els =>
      els.map(el => ({ href: el.href, text: el.textContent?.trim() }))
        .filter(link => link.text && link.text.length > 0)
    );

    const uniqueInternalLinks = [...new Set(internalLinks.map(link => link.href))];
    
    if (uniqueInternalLinks.length >= 3) {
      log('PASS', `Good internal linking: ${uniqueInternalLinks.length} unique internal links`);
    } else if (uniqueInternalLinks.length > 0) {
      log('WARN', `Limited internal linking: ${uniqueInternalLinks.length} unique internal links`);
    } else {
      log('FAIL', 'No internal links found - poor for SEO');
    }

  } catch (error) {
    log('FAIL', `Error analyzing content quality for ${pageConfig.name}: ${error.message}`);
  } finally {
    await page.close();
  }
}

(async () => {
  log('INFO', `Starting Content Quality Analysis for base URL: ${BASE_URL}`);
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });

  for (const pageConfig of contentPagesToTest) {
    await analyzeContentQuality(browser, pageConfig);
  }

  await browser.close();

  log('INFO', '---- Content Quality Summary ----');
  if (errorCount === 0) {
    log('PASS', 'All content quality checks passed!');
  } else {
    log('FAIL', `${errorCount} content quality issue(s) found. Please review the logs above.`);
    process.exitCode = 1;
  }
})();
