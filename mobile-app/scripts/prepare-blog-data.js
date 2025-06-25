const fs = require('fs');
const path = require('path');
const matter = require('gray-matter'); // Ensure gray-matter is in mobile-app's devDependencies or dependencies
const { marked } = require('marked'); // Ensure marked is in mobile-app's devDependencies or dependencies

const postsDirectory = path.join(__dirname, '../assets/blog');
const outputFilePath = path.join(__dirname, '../src/lib/blogData.json');

async function generateBlogData() {
  const filenames = fs.readdirSync(postsDirectory);
  const allPostsData = [];

  for (const filename of filenames) {
    if (path.extname(filename) !== '.md') {
      continue; // Skip non-markdown files
    }
    const slug = filename.replace(/\.md$/, '');
    const filePath = path.join(postsDirectory, filename);
    const fileContents = fs.readFileSync(filePath, 'utf8');

    const matterResult = matter(fileContents);

    // Keep content as markdown for now, will be converted by 'marked' on demand in the app
    // or convert to HTML here if preferred (adds to JSON size)
    // const contentHtml = await marked(matterResult.content);

    const postData = {
      slug,
      title: matterResult.data.title,
      date: matterResult.data.date,
      author: matterResult.data.author || null,
      excerpt: matterResult.data.excerpt || null,
      image: matterResult.data.image || null,
      contentMarkdown: matterResult.content, // Store raw markdown
      ...(matterResult.data), // Include all frontmatter data
    };
    allPostsData.push(postData);
  }

  // Sort posts by date in descending order
  allPostsData.sort((a, b) => new Date(b.date) - new Date(a.date));

  try {
    fs.writeFileSync(outputFilePath, JSON.stringify(allPostsData, null, 2));
    console.log(`Successfully generated blog data at ${outputFilePath}`);
  } catch (error) {
    console.error('Failed to write blog data:', error);
  }
}

generateBlogData();
