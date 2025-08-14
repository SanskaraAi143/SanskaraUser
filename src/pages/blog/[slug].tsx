import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PostData, getPostBySlug } from '@/lib/blog-posts';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Helmet } from 'react-helmet-async';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const BlogDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<PostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      const fetchPostDetails = async () => {
        setLoading(true);
        try {
          const fetchedPost = await getPostBySlug(slug);
          if (fetchedPost) {
            setPost(fetchedPost);
          } else {
            setError('Post not found.');
          }
        } catch (e) {
          setError('Failed to load the post.');
        } finally {
          setLoading(false);
        }
      };
      fetchPostDetails();
    }
  }, [slug]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><p>Loading post...</p></div>;
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
        <h1 className="text-3xl font-bold text-destructive mb-4">Error</h1>
        <p className="text-muted-foreground mb-6">{error || 'Post not found.'}</p>
        <Button asChild>
          <Link to="/blog"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground">
      <Helmet>
        <title>{`${post.title} - Sanskara AI Blog`}</title>
        {post.excerpt && <meta name="description" content={post.excerpt} />}
        <link rel="canonical" href={`https://sanskaraai.com/blog/${slug}`} />
      </Helmet>

      <Navbar />

      <main className="container mx-auto px-4 py-12">
        <article className="max-w-3xl mx-auto">
          <header className="mb-8 text-center">
            {post.category && <Badge variant="secondary" className="mb-4">{post.category}</Badge>}
            <h1 className="text-4xl md:text-5xl font-lora font-bold mb-4">{post.title}</h1>
            <div className="flex items-center justify-center text-sm text-muted-foreground space-x-4">
              <span className="flex items-center"><User className="mr-1.5 h-4 w-4" /> {post.author || 'SanskaraAI Team'}</span>
              <span className="flex items-center"><Calendar className="mr-1.5 h-4 w-4" /> {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              {post.readTime && <span className="flex items-center"><Clock className="mr-1.5 h-4 w-4" /> {post.readTime}</span>}
            </div>
          </header>

          {post.image && (
            <div className="my-8 rounded-lg overflow-hidden shadow-lg">
              <img src={post.image} alt={post.title} className="w-full h-auto object-cover" />
            </div>
          )}

          <div
            className="prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: post.contentHtml || '' }}
          />

          {post.tags && post.tags.length > 0 && (
            <footer className="mt-12 pt-8 border-t">
              <h3 className="text-lg font-semibold mb-4">Tags:</h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map(tag => <Badge key={tag} variant="outline">{tag}</Badge>)}
              </div>
            </footer>
          )}
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default BlogDetailPage;
