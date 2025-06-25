const puppeteer = require('puppeteer');
const https = require('https');
const http = require('http');
const { parseString } = require('xml2js');
const axeCore = require('axe-core');

// Configuration
const DEFAULT_BASE_URL = 'http://localhost:4173'; // Default if no URL is provided via CLI
const USER_AGENT = 'SanskaraAI-VerificationBot/1.0';

const pagesToTest = [
  {
    path: '/',
    name: 'Homepage',
    schemas: ['Organization', 'WebSite'],
    checkInternalLinks: true,
  },
  {
    path: '/blog/ai-wedding-tools-indian-marriages/', // One of the new blog posts
    name: 'Sample Blog Post',
    schemas: ['BlogPosting'],
    checkInternalLinks: true,
  },
  {
    path: '/faq/',
    name: 'FAQ Page',
    schemas: ['FAQPage'],
    checkInternalLinks: true,
  },
];

const filesToTest = [
  { path: '/robots.txt', name: 'robots.txt', type: 'text' },
  { path: '/sitemap.xml', name: 'sitemap.xml', type: 'xml' },
  { path: '/llms.txt', name: 'llms.txt', type: 'text' },
];

let BASE_URL = process.argv[2] || DEFAULT_BASE_URL;
if (BASE_URL.endsWith('/')) {
  BASE_URL = BASE_URL.slice(0, -1);
}

let errorCount = 0;

const log = (status, message, details = '') => {
  const colorMap = {
    INFO: '\x1b[34m', // Blue
    PASS: '\x1b[32m', // Green
    FAIL: '\x1b[31m', // Red
    WARN: '\x1b[33m', // Yellow
    RESET: '\x1b[0m', // Reset color
  };
  console.log(`${colorMap[status] || ''}[${status}] ${message}${colorMap.RESET}${details ? `\n${details}` : ''}`);
  if (status === 'FAIL') {
    errorCount++;
  }
};

async function checkPage(browser, pageConfig) {
  log('INFO', `---- Checking Page: ${pageConfig.name} (${pageConfig.path}) ----`);
  const page = await browser.newPage();
  await page.setUserAgent(USER_AGENT);
  const url = `${BASE_URL}${pageConfig.path}`;

  try {
    await page.goto(url, { waitUntil: 'networkidle2' });

    // 1. Title
    const title = await page.title();
    if (title) {
      log('PASS', `Title: "${title}"`);
    } else {
      log('FAIL', 'Title: Missing');
    }

    // 2. Meta Description
    const description = await page.$eval('meta[name="description"]', el => el.content,).catch(() => null);
    if (description) {
      log('PASS', `Meta Description: "${description.substring(0, 100)}..."`);
    } else {
      log('FAIL', 'Meta Description: Missing');
    }

    // 3. Canonical URL
    const canonical = await page.$eval('link[rel="canonical"]', el => el.href,).catch(() => null);
    if (canonical) {
      log('PASS', `Canonical URL: "${canonical}"`);
    } else {
      log('FAIL', 'Canonical URL: Missing');
    }

    // 4. Heading Structure (H1)
    const h1s = await page.$$eval('h1', els => els.map(el => el.textContent?.trim()));
    if (h1s.length === 1) {
      log('PASS', `Found 1 H1 tag: "${h1s[0]}"`);
    } else {
      log('FAIL', `Found ${h1s.length} H1 tags. Expected 1.`, `H1s: ${JSON.stringify(h1s)}`);
    }

    // 4a. Advanced Heading Structure
    const headings = await page.$$eval('h1, h2, h3, h4, h5, h6', els => els.map(el => ({ tagName: el.tagName, text: el.textContent?.trim() })));
    let lastLevel = 1;
    for (const heading of headings) {
      const level = parseInt(heading.tagName.substring(1));
      if (level > lastLevel + 1) {
        log('WARN', `Heading level skipped: from H${lastLevel} to H${level}`, `Heading: "${heading.text}"`);
      }
      lastLevel = level;
    }    // 5. Image SEO
    const images = await page.$$eval('img', els => els.map(el => ({ src: el.src, alt: el.alt, width: el.width, height: el.height })));
    images.forEach(img => {
      if (!img.alt) {
        log('FAIL', 'Image missing alt attribute', `Image src: ${img.src}`);
      } else if (img.alt.length < 5) {
        log('WARN', 'Image alt attribute is very short', `Image src: ${img.src}, Alt: "${img.alt}"`);
      }
      if (!img.width || !img.height) {
        log('WARN', 'Image missing explicit dimensions (can cause layout shift)', `Image src: ${img.src}`);
      }
    });

    // 5a. Social Media Meta Tags
    const ogTitle = await page.$eval('meta[property="og:title"]', el => el.content).catch(() => null);
    const ogDescription = await page.$eval('meta[property="og:description"]', el => el.content).catch(() => null);
    const ogImage = await page.$eval('meta[property="og:image"]', el => el.content).catch(() => null);
    const twitterCard = await page.$eval('meta[name="twitter:card"]', el => el.content).catch(() => null);
    
    if (ogTitle) {
      log('PASS', `Open Graph title: "${ogTitle}"`);
    } else {
      log('FAIL', 'Open Graph title missing');
    }
    
    if (ogDescription) {
      log('PASS', `Open Graph description: "${ogDescription.substring(0, 80)}..."`);
    } else {
      log('FAIL', 'Open Graph description missing');
    }
    
    if (ogImage) {
      log('PASS', `Open Graph image: "${ogImage}"`);
    } else {
      log('FAIL', 'Open Graph image missing');
    }
    
    if (twitterCard) {
      log('PASS', `Twitter Card type: "${twitterCard}"`);
    } else {
      log('FAIL', 'Twitter Card meta tag missing');
    }

    // 5b. Performance Metrics
    const performanceMetrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const metrics = {};
          entries.forEach(entry => {
            if (entry.entryType === 'navigation') {
              metrics.loadTime = entry.loadEventEnd - entry.loadEventStart;
              metrics.domContentLoaded = entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart;
            }
            if (entry.entryType === 'largest-contentful-paint') {
              metrics.lcp = entry.startTime;
            }
          });
          resolve(metrics);
        }).observe({ entryTypes: ['navigation', 'largest-contentful-paint'] });
        
        // Fallback timeout
        setTimeout(() => resolve({}), 1000);
      });
    });

    if (performanceMetrics.lcp) {
      if (performanceMetrics.lcp < 2500) {
        log('PASS', `Largest Contentful Paint: ${Math.round(performanceMetrics.lcp)}ms (Good)`);
      } else if (performanceMetrics.lcp < 4000) {
        log('WARN', `Largest Contentful Paint: ${Math.round(performanceMetrics.lcp)}ms (Needs Improvement)`);
      } else {
        log('FAIL', `Largest Contentful Paint: ${Math.round(performanceMetrics.lcp)}ms (Poor)`);
      }
    }

    // 5c. Mobile Viewport
    const viewport = await page.$eval('meta[name="viewport"]', el => el.content).catch(() => null);
    if (viewport) {
      log('PASS', `Viewport meta tag: "${viewport}"`);
    } else {
      log('FAIL', 'Viewport meta tag missing');
    }    // 5d. External Links Security
    const externalLinks = await page.$$eval('a[href^="http"]:not([href*="sanskaraai.com"])', els => 
      els.map(el => ({ href: el.href, rel: el.rel, target: el.target }))
    );
    externalLinks.forEach(link => {
      if (link.target === '_blank' && !link.rel.includes('noopener')) {
        log('WARN', 'External link missing rel="noopener"', `Link: ${link.href}`);
      }
    });    // 5e. Accessibility Check with axe-core
    try {
      await page.addScriptTag({ content: axeCore.source });
      const accessibilityResults = await page.evaluate(async () => {
        return await axe.run();
      });
      
      const violations = accessibilityResults.violations;
      if (violations.length === 0) {
        log('PASS', 'No accessibility violations found');
      } else {
        violations.forEach(violation => {
          if (violation.impact === 'critical' || violation.impact === 'serious') {
            log('FAIL', `Accessibility violation: ${violation.description}`, `Impact: ${violation.impact}, Nodes: ${violation.nodes.length}`);
          } else {
            log('WARN', `Accessibility issue: ${violation.description}`, `Impact: ${violation.impact}, Nodes: ${violation.nodes.length}`);
          }
        });
      }
    } catch (error) {
      log('WARN', 'Could not run accessibility check', error.message);
    }

    // 6. JSON-LD Schemas
    const ldJsonScripts = await page.$$eval('script[type="application/ld+json"]', els => els.map(el => el.innerHTML));
    if (ldJsonScripts.length > 0) {
      log('PASS', `Found ${ldJsonScripts.length} JSON-LD script(s).`);
      pageConfig.schemas.forEach(expectedSchemaType => {
        let foundSchema = false;
        for (const scriptContent of ldJsonScripts) {
          try {
            const json = JSON.parse(scriptContent);
            const types = Array.isArray(json['@type']) ? json['@type'] : [json['@type']];
            if (types.includes(expectedSchemaType)) {
              log('PASS', `Found expected JSON-LD schema: ${expectedSchemaType}`);
              // Add more detailed checks here if needed, e.g., presence of key properties
              if (expectedSchemaType === 'FAQPage' && (!json.mainEntity || json.mainEntity.length === 0)) {
                log('FAIL', `FAQPage schema for ${pageConfig.name} is missing 'mainEntity' or it's empty.`);
              }
              if (expectedSchemaType === 'BlogPosting' && !json.headline) {
                log('FAIL', `BlogPosting schema for ${pageConfig.name} is missing 'headline'.`);
              }
              foundSchema = true;
              break;
            }
          } catch (e) {
            log('WARN', `Could not parse JSON-LD content: ${e.message}`);
          }
        }
        if (!foundSchema) {
          log('FAIL', `Expected JSON-LD schema ${expectedSchemaType} not found on ${pageConfig.name}`);
        }
      });
    } else if (pageConfig.schemas && pageConfig.schemas.length > 0) {
      log('FAIL', `No JSON-LD scripts found on ${pageConfig.name}, but expected: ${pageConfig.schemas.join(', ')}`);
    } else {
      log('INFO', 'No JSON-LD scripts expected or found.');
    }    // 6. Internal Links with validation
    if (pageConfig.checkInternalLinks) {
        const baseUrl = BASE_URL;        const internalLinks = await page.$$eval('a[href^="/"]', (elements, capturedBaseUrl) => {
            return elements.map(el => ({ 
                href: el.href, 
                text: el.textContent?.trim() 
            })).filter(link => 
                link.href && 
                typeof link.href === 'string' &&
                !link.href.startsWith('mailto:') && 
                !link.href.startsWith('tel:') &&
                link.href !== capturedBaseUrl + '/'
            );
        }, baseUrl);
        
        if (internalLinks.length > 0) {
            log('PASS', `Found ${internalLinks.length} internal links.`);
            
            // Check a sample of internal links for validity
            const linksToCheck = internalLinks.slice(0, 5); // Check first 5 to avoid too many requests
            for (const link of linksToCheck) {
              try {
                const linkPage = await browser.newPage();
                await linkPage.setUserAgent(USER_AGENT);
                const response = await linkPage.goto(link.href, { waitUntil: 'domcontentloaded', timeout: 5000 });
                if (response && response.status() === 200) {
                  log('PASS', `Internal link works: "${link.text}" -> ${link.href}`);
                } else {
                  log('FAIL', `Internal link broken (${response?.status()}): "${link.text}" -> ${link.href}`);
                }
                await linkPage.close();
              } catch (error) {
                log('FAIL', `Internal link error: "${link.text}" -> ${link.href}`, `Error: ${error.message}`);
              }
            }
        } else {
            log('WARN', `No internal links found on ${pageConfig.name}. This might be an issue.`);
        }
    }

  } catch (error) {
    log('FAIL', `Error checking page ${pageConfig.name} (${url}): ${error.message}`);
  } finally {
    await page.close();
  }
}

async function checkFile(fileConfig) {
  log('INFO', `---- Checking File: ${fileConfig.name} (${fileConfig.path}) ----`);
  const url = `${BASE_URL}${fileConfig.path}`;
  const protocol = url.startsWith('https') ? https : http;

  return new Promise((resolve) => {
    protocol.get(url, { headers: { 'User-Agent': USER_AGENT } }, (res) => {
      let data = '';
      if (res.statusCode !== 200) {
        log('FAIL', `${fileConfig.name}: Status code ${res.statusCode}`);
        return resolve();
      }
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (data.length > 0) {
          log('PASS', `${fileConfig.name}: Exists and is not empty.`);
          if (fileConfig.type === 'xml') {
            parseString(data, (err) => {
              if (err) {
                log('FAIL', `${fileConfig.name}: Invalid XML format. ${err.message}`);
              } else {
                log('PASS', `${fileConfig.name}: Valid XML format.`);
              }
              resolve();
            });
          } else {
            resolve();
          }
        } else {
          log('FAIL', `${fileConfig.name}: Exists but is empty.`);
          resolve();
        }
      });
    }).on('error', (err) => {
      log('FAIL', `${fileConfig.name}: Error fetching file: ${err.message}`);
      resolve();
    });
  });
}


(async () => {
  log('INFO', `Starting SEO & AEO Validation for base URL: ${BASE_URL}`);
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });

  for (const pageConfig of pagesToTest) {
    await checkPage(browser, pageConfig);
  }

  for (const fileConfig of filesToTest) {
    await checkFile(fileConfig);
  }

  await browser.close();

  log('INFO', '---- Validation Summary ----');
  if (errorCount === 0) {
    log('PASS', 'All checks passed successfully!');
  } else {
    log('FAIL', `${errorCount} check(s) failed. Please review the logs above.`);
    process.exitCode = 1; // Exit with error code for CI
  }
})();
