import matter from 'gray-matter';
import { marked } from 'marked';

export interface PostData {
  slug: string;
  title: string;
  date: string;
  author?: string;
  excerpt?: string;
  image?: string;
  contentHtml?: string;
  [key: string]: any; // Allow other front matter fields
}

// Use Vite's import.meta.glob to import all markdown files from the content/blog directory
const markdownModules = import.meta.glob('/src/content/blog/*.md', { 
  query: '?raw', 
  import: 'default', 
  eager: true 
});

console.log('[blog-posts.ts] Available markdown modules:', Object.keys(markdownModules));
console.log('[blog-posts.ts] Module count:', Object.keys(markdownModules).length);

export async function getAllPosts(): Promise<PostData[]> {
  console.log('[getAllPosts] Starting function...');
  console.log('[getAllPosts] markdownModules keys:', Object.keys(markdownModules));
  
  const postPromises = Object.entries(markdownModules).map(async ([filePath, rawContentModule]) => {
    try {
      console.log('[getAllPosts] Processing file:', filePath);
      const rawContent = rawContentModule as string;
      
      if (!rawContent || typeof rawContent !== 'string') {
        console.error('[getAllPosts] Invalid content for file:', filePath);
        return null;
      }
      
      const matterResult = matter(rawContent);
      console.log('[getAllPosts] Parsed frontmatter for:', filePath, matterResult.data);
      
      const contentHtml = await marked(matterResult.content);
      
      const slug = filePath.replace('/src/content/blog/', '').replace('.md', '');
      
      const postData: PostData = {
        slug,
        title: matterResult.data.title || 'Untitled',
        date: matterResult.data.date || new Date().toISOString(),
        author: matterResult.data.author || 'Unknown',
        excerpt: matterResult.data.excerpt || '',
        image: matterResult.data.image || '',
        contentHtml,
        ...matterResult.data // Include other front matter fields
      };
      
      console.log('[getAllPosts] Created post data:', postData.title, postData.slug);
      return postData;
    } catch (error) {
      console.error('[getAllPosts] Error processing file:', filePath, error);
      return null;
    }
  });

  const allPostsData = (await Promise.all(postPromises)).filter(post => post !== null) as PostData[];
  
  console.log('[getAllPosts] Final posts count:', allPostsData.length);
  
  return allPostsData.sort((a, b) => {
    if (new Date(a.date) < new Date(b.date)) {
      return 1;
    } else {
      return -1;
    }
  });
}

export async function getPostBySlug(slug: string): Promise<PostData | null> {
  const filePath = `/src/content/blog/${slug}.md`;

  if (markdownModules[filePath]) {
    const rawContentModule = markdownModules[filePath];
    const rawContent = rawContentModule as string;

    if (!rawContent || typeof rawContent !== 'string') {
        console.error(`[getPostBySlug] Invalid or empty rawContent for ${filePath}.`);
        return null;
    }
    
    const matterResult = matter(rawContent);
    const contentHtml = await marked(matterResult.content);

    return {
      slug,
      title: matterResult.data.title || 'Untitled',
      date: matterResult.data.date || new Date().toISOString(),
      author: matterResult.data.author || 'Unknown',
      excerpt: matterResult.data.excerpt || '',
      image: matterResult.data.image || '',
      contentHtml,
      ...matterResult.data
    };
  } else {
    console.error(`Post with slug "${slug}" not found. Path: ${filePath}`);
    console.log('Available paths:', Object.keys(markdownModules));
    return null;
  }
}

export function getAllPostSlugs(): { params: { slug: string } }[] {
  return Object.keys(markdownModules).map(filePath => {
    const slug = filePath.replace('/src/content/blog/', '').replace('.md', '');
    return {
      params: {
        slug,
      },
    };
  });
}
