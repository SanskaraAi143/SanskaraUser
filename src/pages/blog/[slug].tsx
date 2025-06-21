import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PostData, getPostBySlug } from '@/lib/blog-posts';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const BlogDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<PostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      const fetchPost = async () => {
        setLoading(true);
        try {
          const fetchedPost = await getPostBySlug(slug);
          if (fetchedPost) {
            setPost(fetchedPost);
          } else {
            setError('Post not found.');
          }
        } catch (e) {
          console.error("Error fetching post by slug:", e);
          setError('Failed to load the post.');
        } finally {
          setLoading(false);
        }
      };
      fetchPost();
    } else {
      setError('No slug provided.');
      setLoading(false);
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8 pt-24 flex justify-center items-center">
          <p>Loading post...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8 pt-24 text-center">
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
          <p className="text-gray-700 mt-2">{error}</p>
          <Button asChild variant="link" className="mt-4 text-wedding-red hover:text-wedding-deepred">
            <Link to="/blog">
              <ArrowLeft size={18} className="mr-2" />
              Back to Blog
            </Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  if (!post) {
    // This case should ideally be handled by the error state, but as a fallback:
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8 pt-24 text-center">
          <h1 className="text-2xl font-bold text-wedding-maroon">Post Not Found</h1>
          <p className="text-gray-700 mt-2">The blog post you are looking for does not exist.</p>
          <Button asChild variant="link" className="mt-4 text-wedding-red hover:text-wedding-deepred">
            <Link to="/blog">
              <ArrowLeft size={18} className="mr-2" />
              Back to Blog
            </Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>{post ? post.title : 'Blog Post'} - Sanskara AI</title>
        {post?.excerpt && <meta name="description" content={post.excerpt} />}
        {/* Add other meta tags like open graph, twitter cards etc. if needed */}
      </Helmet>
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8 pt-24">
        <article className="max-w-3xl mx-auto">
          <header className="mb-8">
            {post.image && (
              <div className="aspect-[16/9] mb-6 rounded-lg overflow-hidden shadow-lg">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <h1 className="text-3xl md:text-4xl font-playfair font-bold text-wedding-maroon mb-3">
              {post.title}
            </h1>
            <p className="text-sm text-gray-500 mb-4">
              Published on {new Date(post.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
              {post.author && ` by ${post.author}`}
            </p>
            <Button asChild variant="outline" size="sm" className="border-wedding-red text-wedding-red hover:bg-wedding-red/10">
              <Link to="/blog">
                <ArrowLeft size={16} className="mr-2" />
                Back to Blog
              </Link>
            </Button>
          </header>

          {/* Rendered Markdown Content */}
          <div
            className="prose lg:prose-xl max-w-none" // Tailwind Typography for styling
            dangerouslySetInnerHTML={{ __html: post.contentHtml || '' }}
          />

        </article>
      </main>
      <Footer />
    </div>
  );
};

export default BlogDetailPage;
