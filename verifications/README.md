# Website Verification Suite

This document outlines the manual and automated checks that can be run to verify SEO, AEO, and performance aspects of the Sanskara AI website. These scripts and commands are intended for use by developers in local, staging, or CI/CD environments.

## Table of Contents

1.  [Prerequisites](#prerequisites)
2.  [Automated SEO & AEO Validation Script](#automated-seo--aeo-validation-script)
    *   [Running the Script](#running-the-script)
    *   [What it Validates](#what-it-validates)
    *   [Expected Output & Pass Criteria](#expected-output--pass-criteria)
3.  [Performance Validation with Lighthouse](#performance-validation-with-lighthouse)
    *   [Running Lighthouse CLI](#running-lighthouse-cli)
    *   [Key Metrics to Monitor](#key-metrics-to-monitor)
    *   [Interpreting Results](#interpreting-results)

---

## 1. Prerequisites

*   **Node.js:** Version 16.x or higher is recommended.
*   **npm or yarn:** For installing dependencies.
*   **Google Chrome or Chromium:** Puppeteer requires a Chrome/Chromium browser instance.
*   **Lighthouse CLI:** Install globally: `npm install -g lighthouse`

---

## 2. Automated SEO & AEO Validation Script

A Node.js script using Puppeteer is provided to crawl key pages and validate critical SEO and AEO elements.

*   **Script Location:** `verifications/scripts/validate-seo-aeo.js` (to be created)

### Running the Script

1.  Navigate to the `verifications/scripts/` directory:
    ```bash
    cd verifications/scripts
    ```
2.  Install dependencies (if a `package.json` is created for this script, or install puppeteer globally/locally as needed):
    ```bash
    npm install puppeteer # Or yarn add puppeteer
    ```
3.  Ensure the target website (e.g., local dev server, staging site) is running and accessible.
4.  Run the script, passing the base URL of the site you want to test:
    ```bash
    node validate-seo-aeo.js https://your-target-website.com
    ```
    If no URL is provided, it might default to a predefined one (e.g., `http://localhost:3000`).

### What it Validates

The script will check the following for a predefined list of key pages (e.g., Homepage, a sample Blog Post, FAQ page):

*   **Meta Tags:**
    *   Presence and content of `<title>`.
    *   Presence and content of `<meta name="description">`.
    *   Presence and content of `<link rel="canonical">`.
*   **JSON-LD Schemas:**
    *   Presence of `<script type="application/ld+json">` tags.
    *   Basic validation of schema types (e.g., `Organization`, `WebSite`, `BlogPosting`, `FAQPage`).
    *   Presence of key properties within these schemas.
*   **Heading Structure:**
    *   Ensures exactly one `<h1>` per page.
    *   Lists other headings (`<h2>` to `<h6>`) for manual review of hierarchy.
*   **Internal Links:** (Basic check)
    *   Counts the number of internal links on a page.
    *   Logs a sample of internal links for manual review. (Full link validation is complex and might require more sophisticated tools).
*   **Key File Existence & Basic Format:**
    *   `/robots.txt`: Checks for existence and if it's not empty.
    *   `/sitemap.xml`: Checks for existence and if it's valid XML (basic check).
    *   `/llms.txt`: Checks for existence and if it's not empty.

### Expected Output & Pass Criteria

*   The script will output logs to the console indicating which checks are being performed and their results (PASS/FAIL or data extracted).
*   **Pass Criteria:**
    *   All critical meta tags are present and non-empty.
    *   Expected JSON-LD schema types are found on relevant pages.
    *   Each page has exactly one `<h1>`.
    *   `/robots.txt`, `/sitemap.xml`, `/llms.txt` are accessible and non-empty.
*   **Failure:** The script will log errors or specific failures if elements are missing or structured incorrectly. A summary of failures might be provided at the end.

---

## 3. Performance Validation with Lighthouse

Lighthouse is a tool for auditing website quality, including performance, accessibility, and SEO.

### Running Lighthouse CLI

Run Lighthouse from the command line on key pages. Replace `https://your-target-website.com/page` with the actual URL.

```bash
# Run on Homepage (defaults to mobile)
lighthouse https://your-target-website.com/ --output html --output-path ./lighthouse-report-home-mobile.html --view

# Run on Homepage (desktop)
lighthouse https://your-target-website.com/ --preset=desktop --output html --output-path ./lighthouse-report-home-desktop.html --view

# Run on a sample Blog Post (e.g., /blog/ai-wedding-tools-indian-marriages/)
lighthouse https://your-target-website.com/blog/ai-wedding-tools-indian-marriages/ --output html --output-path ./lighthouse-report-blog-sample-mobile.html --view

# Run on FAQ Page
lighthouse https://your-target-website.com/faq/ --output html --output-path ./lighthouse-report-faq-mobile.html --view

# --- Add other key URLs as they are developed, for example: ---
# lighthouse https://your-target-website.com/services/ --output html --output-path ./lighthouse-report-services-mobile.html --view
# lighthouse https://your-target-website.com/venues/bangalore/ --output html --output-path ./lighthouse-report-venues-bgl-mobile.html --view
```

*   `--output html --output-path ./report-name.html`: Saves the report as an HTML file.
*   `--view`: Opens the HTML report in your browser automatically.
*   `--preset=desktop`: Runs the audit with a desktop device emulation. The default is mobile. It's recommended to test both.
*   For CI environments, you might prefer JSON output: `--output json --output-path ./report-name.json`.
*   To see all options: `lighthouse --help`.

### Key Metrics to Monitor (from the Performance section of the Lighthouse report)

*   **Largest Contentful Paint (LCP):** Good: ≤ 2.5s
*   **First Input Delay (FID) / Total Blocking Time (TBT):** (FID is field, TBT is lab) Good TBT: ≤ 200-300ms
*   **Cumulative Layout Shift (CLS):** Good: ≤ 0.1
*   **Time to Interactive (TTI):** Good: ≤ 3.8s
*   **Total JavaScript Bundle Sizes:** Monitor main thread blocking JS and overall JS size.
*   **Image Optimization:** Check for properly sized and compressed images.

### Interpreting Results

*   Lighthouse provides scores from 0 to 100 for Performance, Accessibility, Best Practices, and SEO. Aim for scores of 90+ in all categories, especially Performance.
*   The report will list specific opportunities for improvement and diagnostics.
*   **Performance Budgets:** While Lighthouse CLI itself doesn't enforce budgets, you can use its output (e.g., JS size, image sizes) to compare against predefined performance budgets. If values exceed the budget, it should be considered a regression. CI tools can be configured to fail builds based on these metrics.

---

This verification suite should help maintain a high standard of quality for the Sanskara AI website.
