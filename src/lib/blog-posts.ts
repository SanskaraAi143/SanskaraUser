import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

const postsDirectory = path.join(process.cwd(), 'content/blog');

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

export function getAllPosts(): PostData[] {
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames
    .filter(fileName => fileName.endsWith('.md')) // Ensure we only process markdown files
    .map(fileName => {
      const slug = fileName.replace(/\.md$/, '');
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const matterResult = matter(fileContents);

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
    });

  return allPostsData.sort((a, b) => {
    if (new Date(a.date) < new Date(b.date)) {
      return 1;
    } else {
      return -1;
    }
  });
}

export async function getPostBySlug(slug: string): Promise<PostData | null> {
  const fullPath = path.join(postsDirectory, `${slug}.md`);

  try {
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const matterResult = matter(fileContents);
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
  } catch (err) {
    // If the file doesn't exist or there's an error reading it
    console.error(`Error reading post ${slug}:`, err);
    return null;
  }
}

export function getAllPostSlugs(): { params: { slug: string } }[] {
  const fileNames = fs.readdirSync(postsDirectory);
  return fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => {
      return {
        params: {
          slug: fileName.replace(/\.md$/, ''),
        },
      };
    });
}
