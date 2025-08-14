import React, { useState, useEffect } from 'react';
import { PostData, getAllPosts } from '@/lib/blog-posts';
import BlogPostCard from '@/components/blog/BlogPostCard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Helmet } from 'react-helmet-async';
import { Star, LineChart } from 'lucide-react';

const POSTS_PER_PAGE = 6;

const BlogListPage: React.FC = () => {
  const [allPosts, setAllPosts] = useState<PostData[]>([]);
  const [displayedPosts, setDisplayedPosts] = useState<PostData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState<string>("All");

  useEffect(() => {
    const fetchPosts = async () => {
      const posts = await getAllPosts();
      setAllPosts(posts);
    };
    fetchPosts();
  }, []);

  useEffect(() => {
    const filtered = allPosts.filter(p => activeFilter === "All" || p.tags?.includes(activeFilter));
    const paginated = filtered.slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE);
    setDisplayedPosts(paginated);
  }, [allPosts, currentPage, activeFilter]);

  const totalPages = Math.ceil(allPosts.filter(p => activeFilter === "All" || p.tags?.includes(activeFilter)).length / POSTS_PER_PAGE);
  const allTags = [...new Set(allPosts.flatMap(p => p.tags || []))];

  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col">
      <Helmet>
        <title>Sanskara Blog - Hindu Wedding Insights & Traditions</title>
        <meta name="description" content="Discover insights on Hindu wedding traditions, cultural ceremonies, and AI-powered wedding planning." />
        <link rel="canonical" href="https://sanskaraai.com/blog/" />
      </Helmet>
      
      <Navbar />

      <main role="main" className="flex-grow">
        <section className="py-20 text-center container mx-auto px-4">
          <h1 className="text-5xl md:text-6xl font-lora font-bold mb-4">
            Sanskara AI Blog
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover insights on Hindu wedding traditions, cultural ceremonies, and the future of AI-powered wedding planning.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <Button variant={activeFilter === 'All' ? 'default' : 'outline'} onClick={() => setActiveFilter('All')}>All Posts</Button>
            {allTags.map(tag => (
              <Button key={tag} variant={activeFilter === tag ? 'default' : 'outline'} onClick={() => setActiveFilter(tag)}>
                {tag}
              </Button>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-4 pb-16">
          {displayedPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayedPosts.map(post => (
                <BlogPostCard key={post.slug} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-xl text-muted-foreground">No posts found for this category.</p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-12 flex justify-center items-center space-x-2">
              <Button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} variant="outline">Previous</Button>
              <span className="text-muted-foreground">Page {currentPage} of {totalPages}</span>
              <Button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} variant="outline">Next</Button>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default BlogListPage;
