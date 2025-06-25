#!/usr/bin/env node

/**
 * YC-READY PERFORMANCE CHECK - COMPREHENSIVE VALIDATION
 * 
 * This script has been upgraded to use research-backed industry standards.
 * For detailed performance analysis, use the comprehensive validator:
 * ./verifications/scripts/yc-performance-industry-standard.cjs
 * 
 * This version focuses on essential build and deployment readiness.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

function checkFileExists(filePath, description) {
  const exists = fs.existsSync(filePath);
  if (exists) {
    log(colors.green, `✓ ${description}: Found`);
  } else {
    log(colors.red, `✗ ${description}: Missing - ${filePath}`);
  }
  return exists;
}

function checkDistAssets() {
  const distDir = path.join(__dirname, '..', 'dist');
  
  if (!fs.existsSync(distDir)) {
    log(colors.red, '✗ dist/ directory not found. Run `npm run build` first.');
    return false;
  }

  const indexHtml = path.join(distDir, 'index.html');
  const assetsDir = path.join(distDir, 'assets');
  
  const checks = [
    checkFileExists(indexHtml, 'Production index.html'),
    checkFileExists(assetsDir, 'Assets directory'),
  ];

  if (fs.existsSync(assetsDir)) {
    const assets = fs.readdirSync(assetsDir);
    const hasJS = assets.some(file => file.endsWith('.js'));
    const hasCSS = assets.some(file => file.endsWith('.css'));
    
    if (hasJS) {
      log(colors.green, '✓ JavaScript bundles found');
    } else {
      log(colors.red, '✗ No JavaScript bundles found');
      checks.push(false);
    }
    
    if (hasCSS) {
      log(colors.green, '✓ CSS bundles found');
    } else {
      log(colors.red, '✗ No CSS bundles found');
      checks.push(false);
    }
  }

  return checks.every(Boolean);
}

function checkPackageJson() {
  const packagePath = path.join(__dirname, '..', 'package.json');
  
  if (!checkFileExists(packagePath, 'package.json')) {
    return false;
  }

  try {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const requiredScripts = ['dev', 'build', 'preview'];
    const requiredDeps = ['react', 'react-dom', 'vite'];

    let allGood = true;

    // Check scripts
    for (const script of requiredScripts) {
      if (packageJson.scripts && packageJson.scripts[script]) {
        log(colors.green, `✓ Script "${script}" defined`);
      } else {
        log(colors.red, `✗ Script "${script}" missing`);
        allGood = false;
      }
    }

    // Check dependencies
    const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    for (const dep of requiredDeps) {
      if (allDeps[dep]) {
        log(colors.green, `✓ Dependency "${dep}" found`);
      } else {
        log(colors.red, `✗ Dependency "${dep}" missing`);
        allGood = false;
      }
    }

    return allGood;
  } catch (error) {
    log(colors.red, `✗ Error reading package.json: ${error.message}`);
    return false;
  }
}

function checkViteConfig() {
  const viteConfigPaths = [
    path.join(__dirname, '..', 'vite.config.ts'),
    path.join(__dirname, '..', 'vite.config.js')
  ];

  for (const configPath of viteConfigPaths) {
    if (fs.existsSync(configPath)) {
      log(colors.green, `✓ Vite config found: ${path.basename(configPath)}`);
      return true;
    }
  }

  log(colors.red, '✗ No Vite config file found');
  return false;
}

function checkTSConfig() {
  const tsConfigPath = path.join(__dirname, '..', 'tsconfig.json');
  
  if (!checkFileExists(tsConfigPath, 'TypeScript config')) {
    return false;
  }

  try {
    const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'));
    
    if (tsConfig.compilerOptions) {
      log(colors.green, '✓ TypeScript compiler options configured');
      return true;
    } else {
      log(colors.red, '✗ TypeScript compiler options missing');
      return false;
    }
  } catch (error) {
    log(colors.red, `✗ Error reading tsconfig.json: ${error.message}`);
    return false;
  }
}

function checkSrcStructure() {
  const srcDir = path.join(__dirname, '..', 'src');
  const requiredFiles = [
    'main.tsx',
    'App.tsx',
    'index.css'
  ];

  if (!checkFileExists(srcDir, 'src/ directory')) {
    return false;
  }

  let allGood = true;
  for (const file of requiredFiles) {
    const filePath = path.join(srcDir, file);
    if (!checkFileExists(filePath, `src/${file}`)) {
      allGood = false;
    }
  }

  return allGood;
}

function checkPublicAssets() {
  const publicDir = path.join(__dirname, '..', 'public');
  const requiredFiles = [
    'favicon.ico',
    'robots.txt'
  ];

  if (!checkFileExists(publicDir, 'public/ directory')) {
    return false;
  }

  let allGood = true;
  for (const file of requiredFiles) {
    const filePath = path.join(publicDir, file);
    if (!checkFileExists(filePath, `public/${file}`)) {
      allGood = false;
    }
  }

  return allGood;
}

function checkForUnwantedFiles() {
  const rootDir = path.join(__dirname, '..');
  const unwantedPatterns = [
    '.DS_Store',
    'Thumbs.db',
    '*.log',
    '.env.local',
    '.env.development.local',
    '.env.test.local',
    '.env.production.local'
  ];

  let foundUnwanted = false;

  try {
    const files = fs.readdirSync(rootDir);
    
    for (const file of files) {
      if (unwantedPatterns.some(pattern => {
        if (pattern.includes('*')) {
          const regex = new RegExp(pattern.replace('*', '.*'));
          return regex.test(file);
        }
        return file === pattern;
      })) {
        log(colors.yellow, `⚠ Unwanted file found: ${file}`);
        foundUnwanted = true;
      }
    }

    if (!foundUnwanted) {
      log(colors.green, '✓ No unwanted files found in root');
    }
  } catch (error) {
    log(colors.yellow, `⚠ Could not check for unwanted files: ${error.message}`);
  }

  return !foundUnwanted;
}

function runPerformanceCheck() {
  log(colors.bold + colors.blue, '🚀 YC-Ready Performance Check (Build Validation)');
  log(colors.blue, '=========================================================');
  log(colors.cyan, 'For comprehensive performance analysis, run:');
  log(colors.cyan, 'node verifications/scripts/yc-performance-industry-standard.cjs\n');

  const checks = [
    { name: 'Package Configuration', fn: checkPackageJson },
    { name: 'Vite Configuration', fn: checkViteConfig },
    { name: 'TypeScript Configuration', fn: checkTSConfig },
    { name: 'Source Structure', fn: checkSrcStructure },
    { name: 'Public Assets', fn: checkPublicAssets },
    { name: 'Production Build', fn: checkDistAssets },
    { name: 'Clean Workspace', fn: checkForUnwantedFiles }
  ];

  let passed = 0;
  let total = checks.length;

  for (const check of checks) {
    log(colors.blue, `\n🔍 Checking: ${check.name}`);
    log(colors.blue, '─'.repeat(40));
    
    if (check.fn()) {
      passed++;
      log(colors.green, `✅ ${check.name}: PASSED`);
    } else {
      log(colors.red, `❌ ${check.name}: FAILED`);
    }
  }

  log(colors.blue, '\n📊 Build Readiness Results');
  log(colors.blue, '=====================================');
  
  const score = Math.round((passed / total) * 100);
  const scoreColor = score >= 97 ? colors.green : score >= 85 ? colors.yellow : colors.red;
  
  log(scoreColor + colors.bold, `Score: ${score}/100 (${passed}/${total} checks passed)`);

  if (score >= 97) {
    log(colors.green + colors.bold, '🎉 BUILD READY! Your app meets production standards.');
  } else if (score >= 85) {
    log(colors.yellow + colors.bold, '⚠️  GOOD but needs improvement for YC readiness.');
  } else {
    log(colors.red + colors.bold, '❌ NEEDS WORK before YC presentation.');
  }

  log(colors.blue, '\n💡 Next Steps:');
  if (score < 100) {
    log(colors.yellow, '• Fix the failed checks above');
    log(colors.yellow, '• Run `npm run build` if production build failed');
    log(colors.yellow, '• Run `npm run preview` to test production build');
  }
  log(colors.cyan, '• Run comprehensive YC validation:');
  log(colors.cyan, '  node verifications/scripts/yc-master-validation.cjs');
  log(colors.cyan, '• Run new comprehensive performance audit:');
  log(colors.cyan, '  node verifications/scripts/yc-performance-industry-standard.cjs');

  process.exit(score >= 97 ? 0 : 1);
}

// Run the performance check
runPerformanceCheck();
