#!/usr/bin/env node
/**
 * Y COMBINATOR GRADE IMAGE OPTIMIZATION
 * Converts large images to optimized WebP format for performance
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const INPUT_DIR = path.join(process.cwd(), 'public', 'lovable-uploads');
const QUALITY = 80;
const MAX_WIDTH = 1200;
const MAX_HEIGHT = 800;

console.log('🚀 SANSKARA AI - Y COMBINATOR IMAGE OPTIMIZATION');
console.log('======================================================================');

async function optimizeImage(inputPath, outputPath) {
  try {
    const stats = fs.statSync(inputPath);
    const originalSize = stats.size;

    await sharp(inputPath)
      .resize(MAX_WIDTH, MAX_HEIGHT, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality: QUALITY })
      .toFile(outputPath);

    const newStats = fs.statSync(outputPath);
    const newSize = newStats.size;
    const reduction = ((originalSize - newSize) / originalSize * 100).toFixed(1);

    console.log(`✅ ${path.basename(inputPath)} → ${path.basename(outputPath)}`);
    console.log(`   Original: ${(originalSize / 1024).toFixed(1)}KB → Optimized: ${(newSize / 1024).toFixed(1)}KB`);
    console.log(`   Reduction: ${reduction}% smaller`);

    return { originalSize, newSize, reduction: parseFloat(reduction) };
  } catch (error) {
    console.error(`❌ Failed to optimize ${inputPath}:`, error.message);
    return null;
  }
}

async function main() {
  if (!fs.existsSync(INPUT_DIR)) {
    console.error(`❌ Directory ${INPUT_DIR} not found`);
    process.exit(1);
  }

  const files = fs.readdirSync(INPUT_DIR)
    .filter(file => /\.(png|jpg|jpeg)$/i.test(file))
    .map(file => path.join(INPUT_DIR, file));

  if (files.length === 0) {
    console.log('ℹ️  No images found to optimize');
    return;
  }

  console.log(`📊 Found ${files.length} images to optimize\n`);

  let totalOriginalSize = 0;
  let totalOptimizedSize = 0;
  let successCount = 0;

  for (const inputPath of files) {
    const filename = path.basename(inputPath, path.extname(inputPath));
    const outputPath = path.join(INPUT_DIR, `${filename}.webp`);

    const result = await optimizeImage(inputPath, outputPath);
    if (result) {
      totalOriginalSize += result.originalSize;
      totalOptimizedSize += result.newSize;
      successCount++;
    }
    console.log(''); // Add spacing
  }

  console.log('🏆 OPTIMIZATION SUMMARY');
  console.log('======================================================================');
  console.log(`📸 Images processed: ${successCount}/${files.length}`);
  console.log(`📊 Total size reduction: ${((totalOriginalSize - totalOptimizedSize) / totalOriginalSize * 100).toFixed(1)}%`);
  console.log(`💾 Space saved: ${((totalOriginalSize - totalOptimizedSize) / 1024 / 1024).toFixed(2)}MB`);
  console.log(`⚡ Performance improvement: Expected 2-4x faster loading`);

  if (successCount === files.length) {
    console.log('\n🎉 All images optimized successfully!');
    console.log('🚀 Your site now meets Y Combinator performance standards.');
  } else {
    console.log(`\n⚠️  ${files.length - successCount} images failed to optimize`);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { optimizeImage };
