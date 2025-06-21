import matter from 'gray-matter';
import { marked } from 'marked';
// Node.js 'fs' and 'path' modules cannot be used in client-side Vite code directly.
// We will use Vite's import.meta.glob for static analysis at build time.

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
// Updated to new syntax: query: '?raw', import: 'default'
const markdownModules = import.meta.glob('/content/blog/*.md', { query: '?raw', import: 'default', eager: true });

export async function getAllPosts(): Promise<PostData[]> {
  const allPostsData = await Promise.all(
    Object.entries(markdownModules).map(async ([filePath, rawContentModule]) => {
      // Assuming rawContentModule is the string content due to `import: 'default'` and `?raw`
      const rawContent = rawContentModule as string;
      const slug = filePath.split('/').pop()?.replace(/\.md$/, '') || '';
      const matterResult = matter(rawContent);

      return {
        slug,
        ...(matterResult.data as {
          title: string;
          date: string;
          author?: string;
          excerpt?: string;
          image?: string;
        }),
      };
    })
  );

  return allPostsData.sort((a, b) => {
    if (new Date(a.date) < new Date(b.date)) {
      return 1;
    } else {
      return -1;
    }
  });
}

export async function getPostBySlug(slug: string): Promise<PostData | null> {
  const filePath = `/content/blog/${slug}.md`;

  if (markdownModules[filePath]) {
    // Assuming markdownModules[filePath] is the string content due to `import: 'default'` and `?raw`
    const rawContent = markdownModules[filePath] as string;
    const matterResult = matter(rawContent);
    const contentHtml = await marked(matterResult.content);

    return {
      slug,
      contentHtml,
      ...(matterResult.data as {
        title: string;
        date: string;
        author?: string;
        excerpt?: string;
        image?: string;
      }),
    };
  } else {
    console.error(`Post with slug "${slug}" not found. Path: ${filePath}`);
    return null;
  }
}

export function getAllPostSlugs(): { params: { slug: string } }[] {
  return Object.keys(markdownModules).map(filePath => {
    const slug = filePath.split('/').pop()?.replace(/\.md$/, '') || '';
    return {
      params: {
        slug,
      },
    };
  });
}
