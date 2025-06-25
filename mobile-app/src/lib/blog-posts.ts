import { marked } from 'marked';
import blogData from './blogData.json'; // Import the generated JSON data

export interface PostData {
  slug: string;
  title: string;
  date: string;
  author?: string;
  excerpt?: string;
  image?: string;
  contentMarkdown?: string; // Raw markdown content
  contentHtml?: string;     // HTML content, to be generated
  [key: string]: any;       // Allow other front matter fields
}

// The blogData.json is already an array of PostData (minus contentHtml)
// and is sorted by date by the generation script.

export async function getAllPosts(): Promise<PostData[]> {
  // Simply return the imported data. contentHtml is not needed for list view.
  return blogData as PostData[];
}

export async function getPostBySlug(slug: string): Promise<PostData | null> {
  const post = blogData.find(p => p.slug === slug) as PostData | undefined;

  if (post && post.contentMarkdown) {
    const contentHtml = await marked(post.contentMarkdown);
    return {
      ...post,
      contentHtml,
    };
  }
  console.error(`Post with slug "${slug}" not found or has no markdown content.`);
  return null;
}

export function getAllPostSlugs(): { params: { slug:string } }[] {
  return blogData.map(post => ({
    params: {
      slug: post.slug,
    },
  }));
}
