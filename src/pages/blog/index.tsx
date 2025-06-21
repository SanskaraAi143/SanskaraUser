import React, { useState, useEffect } from 'react';
import { PostData, getAllPosts } from '@/lib/blog-posts';
import BlogPostCard from '@/components/blog/BlogPostCard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Helmet } from 'react-helmet-async';

const POSTS_PER_PAGE = 5;

const BlogListPage: React.FC = () => {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchPosts = async () => {
      const fetchedPosts = await getAllPosts();
      setPosts(fetchedPosts);
    };
    fetchPosts();
  }, []);

  const indexOfLastPost = currentPage * POSTS_PER_PAGE;
  const indexOfFirstPost = indexOfLastPost - POSTS_PER_PAGE;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);

  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Blog - Sanskara AI</title>
        <meta name="description" content="Read the latest articles and insights from the Sanskara AI blog. Wedding planning tips, traditions, and more." />
      </Helmet>
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8 pt-24"> {/* Added pt-24 for navbar offset */}
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-playfair font-bold text-wedding-maroon">Our Blog</h1>
          <p className="text-lg text-gray-700 mt-2">
            Insights, tips, and stories about wedding planning and traditions.
          </p>
        </header>

        {currentPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentPosts.map(post => (
              <BlogPostCard key={post.slug} post={post} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-600">No blog posts found.</p>
        )}

        {totalPages > 1 && (
          <div className="mt-12 flex justify-center items-center space-x-2">
            <Button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              variant="outline"
            >
              Previous
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber => (
              <Button
                key={pageNumber}
                onClick={() => paginate(pageNumber)}
                variant={currentPage === pageNumber ? 'default' : 'outline'}
                className={currentPage === pageNumber ? 'bg-wedding-red hover:bg-wedding-deepred' : ''}
              >
                {pageNumber}
              </Button>
            ))}
            <Button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              variant="outline"
            >
              Next
            </Button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default BlogListPage;
