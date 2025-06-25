#!/usr/bin/env node

/**
 * Content Quality & SEO Analysis Script
 * Analyzes content quality, keyword usage, and provides SEO recommendations
 */

const fs = require('fs');
const path = require('path');

console.log('📝 Starting Content Quality Analysis for Sanskara AI...\n');

// Primary keywords for the site
const PRIMARY_KEYWORDS = [
  'hindu wedding planning',
  'ai wedding planner',
  'indian wedding',
  'wedding rituals',
  'sanskara ai',
  'wedding traditions',
  'wedding vendors',
  'marriage planning'
];

// Analyze blog content
function analyzeBlogContent() {
  console.log('📚 Analyzing Blog Content Quality...');
  
  const blogPath = path.join(process.cwd(), 'content', 'blog');
  
  if (!fs.existsSync(blogPath)) {
    console.log('❌ Blog content directory not found.\n');
    return;
  }
  
  const blogFiles = fs.readdirSync(blogPath).filter(file => file.endsWith('.md'));
  
  console.log(`📄 Found ${blogFiles.length} blog posts\n`);
  
  blogFiles.forEach(file => {
    const filePath = path.join(blogPath, file);
    const content = fs.readFileSync(filePath, 'utf8');
      // Extract frontmatter and content
    const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
    if (!frontmatterMatch) {
      console.log(`⚠️  ${file}: No frontmatter found`);
      return;
    }
    
    const [, frontmatter, bodyContent] = frontmatterMatch;
    const wordCount = bodyContent.split(/\s+/).length;
    
    console.log(`📖 ${file}:`);
    console.log(`   Word count: ${wordCount}`);
    
    // Check word count
    if (wordCount < 800) {
      console.log(`   ⚠️  Content is short (${wordCount} words). Aim for 800+ words.`);
    } else if (wordCount > 2000) {
      console.log(`   ✅ Comprehensive content (${wordCount} words)`);
    } else {
      console.log(`   ✅ Good length (${wordCount} words)`);
    }
    
    // Check for primary keywords
    const lowerContent = content.toLowerCase();
    const foundKeywords = PRIMARY_KEYWORDS.filter(keyword => 
      lowerContent.includes(keyword.toLowerCase())
    );
    
    console.log(`   Keywords found: ${foundKeywords.length}/${PRIMARY_KEYWORDS.length}`);
    if (foundKeywords.length < 3) {
      console.log(`   🔧 Consider adding more relevant keywords`);
    }
    
    // Check for internal links
    const internalLinks = (content.match(/\[.*?\]\(\/.*?\)/g) || []).length;
    console.log(`   Internal links: ${internalLinks}`);
    if (internalLinks < 3) {
      console.log(`   🔧 Add more internal links to improve SEO`);
    }
    
    // Check for external links
    const externalLinks = (content.match(/\[.*?\]\(https?:\/\/.*?\)/g) || []).length;
    console.log(`   External links: ${externalLinks}`);
    
    // Check for images
    const images = (content.match(/!\[.*?\]\(.*?\)/g) || []).length;
    console.log(`   Images: ${images}`);
    if (images === 0) {
      console.log(`   🔧 Add relevant images to improve engagement`);
    }
    
    // Check frontmatter completeness
    const requiredFields = ['title', 'excerpt', 'date', 'author', 'image'];
    const missingFields = requiredFields.filter(field => 
      !frontmatter.includes(`${field}:`)
    );
    
    if (missingFields.length > 0) {
      console.log(`   ⚠️  Missing frontmatter: ${missingFields.join(', ')}`);
    }
    
    console.log('');
  });
}

// Analyze page titles and descriptions
function analyzePageMetadata() {
  console.log('🏷️  Analyzing Page Metadata...');
  
  // Check main pages
  const pagesToCheck = [
    { file: 'index.html', name: 'Homepage' },
    { file: 'src/pages/FAQPage.tsx', name: 'FAQ Page' }
  ];
  
  pagesToCheck.forEach(({ file, name }) => {
    const filePath = path.join(process.cwd(), file);
    
    if (!fs.existsSync(filePath)) {
      console.log(`❌ ${name}: File not found`);
      return;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    console.log(`📄 ${name}:`);
    
    // Check title
    const titleMatch = content.match(/<title>(.*?)<\/title>/i) || 
                      content.match(/title.*?content="(.*?)"/i);
    if (titleMatch) {
      const title = titleMatch[1];
      console.log(`   Title: "${title}" (${title.length} chars)`);
      
      if (title.length < 30) {
        console.log(`   ⚠️  Title is short. Aim for 30-60 characters.`);
      } else if (title.length > 60) {
        console.log(`   ⚠️  Title is long. Keep under 60 characters.`);
      } else {
        console.log(`   ✅ Title length is good`);
      }
    } else {
      console.log(`   ❌ No title found`);
    }
      // Check meta description
    const descMatch = content.match(/meta.*?name="description".*?content="(.*?)"/i) ||
                     content.match(/name="description"[\s\S]*?content="(.*?)"/i);
    if (descMatch) {
      const description = descMatch[1];
      console.log(`   Description: "${description.substring(0, 100)}..." (${description.length} chars)`);
      
      if (description.length < 120) {
        console.log(`   ⚠️  Description is short. Aim for 120-160 characters.`);
      } else if (description.length > 160) {
        console.log(`   ⚠️  Description is long. Keep under 160 characters.`);
      } else {
        console.log(`   ✅ Description length is good`);
      }
    } else {
      console.log(`   ❌ No meta description found`);
    }
    
    console.log('');
  });
}

// Check for schema markup coverage
function analyzeSchemaMarkup() {
  console.log('🏗️  Analyzing Schema Markup Coverage...');
  
  const files = [
    'index.html',
    'src/pages/FAQPage.tsx',
    'src/pages/blog/[slug].tsx'
  ];
  
  files.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    
    if (!fs.existsSync(filePath)) {
      console.log(`❌ ${file}: File not found`);
      return;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const schemaScripts = (content.match(/application\/ld\+json/g) || []).length;
    
    console.log(`📄 ${file}: ${schemaScripts} schema markup(s)`);
    
    if (schemaScripts === 0) {
      console.log(`   🔧 Consider adding structured data`);
    }
  });
  
  console.log('');
}

// Generate SEO recommendations
function generateRecommendations() {
  console.log('💡 SEO Recommendations:');
  console.log('');
  
  console.log('📈 Content Strategy:');
  console.log('   □ Create more comprehensive guides (2000+ words)');
  console.log('   □ Add FAQ sections to blog posts');
  console.log('   □ Create location-specific content (e.g., "Mumbai weddings")');
  console.log('   □ Add user testimonials and case studies');
  console.log('');
  
  console.log('🔗 Link Building:');
  console.log('   □ Create a resource hub for other wedding planners');
  console.log('   □ Partner with wedding vendors for content exchange');
  console.log('   □ Guest post on wedding and tech blogs');
  console.log('   □ Create shareable wedding planning tools');
  console.log('');
  
  console.log('🎯 Technical SEO:');
  console.log('   □ Implement breadcrumb navigation');
  console.log('   □ Add video schema for tutorial content');
  console.log('   □ Create XML sitemaps for different content types');
  console.log('   □ Implement hreflang for multi-language support');
  console.log('');
  
  console.log('🌟 AEO (AI Engine Optimization):');
  console.log('   □ Create clear question-answer format content');
  console.log('   □ Add "People also ask" sections');
  console.log('   □ Optimize for voice search queries');
  console.log('   □ Create step-by-step guides for common tasks');
}

// Main execution
async function main() {
  analyzeBlogContent();
  analyzePageMetadata();
  analyzeSchemaMarkup();
  generateRecommendations();
  
  console.log('\n✅ Content analysis complete!');
}

main().catch(console.error);
