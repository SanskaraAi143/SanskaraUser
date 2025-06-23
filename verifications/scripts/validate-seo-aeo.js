const puppeteer = require('puppeteer');
const https = require('https');
const http = require('http');
const { parseString } = require('xml2js');

// Configuration
const DEFAULT_BASE_URL = 'http://localhost:3000'; // Default if no URL is provided via CLI
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
    // Optional: Log other headings for manual review
    // const h2s = await page.$$eval('h2', els => els.map(el => el.textContent?.trim()));
    // log('INFO', `Found ${h2s.length} H2 tags.`);


    // 5. JSON-LD Schemas
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
    }

    // 6. Internal Links
    if (pageConfig.checkInternalLinks) {
        const internalLinks = await page.$$eval('a[href^="/"], a[href^="' + BASE_URL + '"]', els =>
            els.map(el => el.href).filter(href => !href.startsWith('mailto:') && !href.startsWith('tel:'))
        );
        if (internalLinks.length > 0) {
            log('PASS', `Found ${internalLinks.length} internal links.`);
            // log('INFO', `Sample internal links: ${internalLinks.slice(0, 5).join(', ')}`);
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
