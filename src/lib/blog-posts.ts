import matter from 'gray-matter';
import { marked } from 'marked';
import { Buffer } from 'buffer';

// Make Buffer available globally for gray-matter
if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
}

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

// Use Vite's import.meta.glob to import all markdown files from the src/content/blog directory
const markdownModules = import.meta.glob('/src/content/blog/*.md', { 
  query: '?raw', 
  import: 'default', 
  eager: true 
});

export async function getAllPosts(): Promise<PostData[]> {
  const postPromises = Object.entries(markdownModules).map(async ([filePath, rawContentModule]) => {
    try {
      const rawContent = rawContentModule as string;
      
      if (!rawContent || typeof rawContent !== 'string') {
        return null;
      }
      
      const matterResult = matter(rawContent);
      
      const contentHtml = await marked(matterResult.content);
      
      const slug = filePath.replace('/src/content/blog/', '').replace('.md', '');
      
      // Ensure tags are always a clean array of strings
      const rawTags = matterResult.data.tags;
      let sanitizedTags: string[] = [];
      if (Array.isArray(rawTags)) {
          sanitizedTags = rawTags
              .map(tag => String(tag || '').trim()) // Convert each item to a string, handle null/undefined
              .filter(tag => tag !== ''); // Filter out empty tags
      } else if (typeof rawTags === 'string') {
          sanitizedTags = rawTags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
      }

      const postData: PostData = {
        slug,
        title: matterResult.data.title || 'Untitled',
        date: matterResult.data.date || new Date().toISOString(),
        author: matterResult.data.author || 'Unknown',
        excerpt: matterResult.data.excerpt || '',
        image: matterResult.data.image || '',
        contentHtml,
        ...matterResult.data, // Include other front matter fields
        tags: sanitizedTags, // Override with sanitized tags
      };
      
      return postData;
    } catch (error) {
      return null;
    }
  });

  const allPostsData = (await Promise.all(postPromises)).filter(post => post !== null) as PostData[];
  
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
        return null;
    }
    
    const matterResult = matter(rawContent);
    const contentHtml = await marked(matterResult.content);

    // Ensure tags are always a clean array of strings
    const rawTags = matterResult.data.tags;
    let sanitizedTags: string[] = [];
    if (Array.isArray(rawTags)) {
        sanitizedTags = rawTags
            .map(tag => String(tag || '').trim())
            .filter(tag => tag !== '');
    } else if (typeof rawTags === 'string') {
        sanitizedTags = rawTags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
    }

    return {
      slug,
      title: matterResult.data.title || 'Untitled',
      date: matterResult.data.date || new Date().toISOString(),
      author: matterResult.data.author || 'Unknown',
      excerpt: matterResult.data.excerpt || '',
      image: matterResult.data.image || '',
      contentHtml,
      ...matterResult.data,
      tags: sanitizedTags, // Override with sanitized tags
    };
  } else {
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
