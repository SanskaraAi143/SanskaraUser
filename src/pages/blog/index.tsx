import React, { useState, useEffect } from 'react';
import { PostData, getAllPosts } from '@/lib/blog-posts';
import BlogPostCard from '@/components/blog/BlogPostCard';
import Navbar from '@/components/Navbar'; // Using existing Navbar
import Footer from '@/components/Footer';   // Using existing Footer
import { Button } from '@/components/ui/button';
import { Helmet } from 'react-helmet-async';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faChartLine, faHeart } from '@fortawesome/free-solid-svg-icons'; // faOm removed as it's not used in this file directly

const POSTS_PER_PAGE = 4; // Show up to 4 cards

const BlogListPage: React.FC = () => {
  const [allPosts, setAllPosts] = useState<PostData[]>([]); // Store all fetched posts
  const [displayedPosts, setDisplayedPosts] = useState<PostData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState<string>("Wedding Traditions");

  useEffect(() => {
    const fetchAndProcessPosts = async () => {
      const fetchedRawPosts = await getAllPosts();
      // Add dummy/default category, tags, readTime for styling if not present in actual data
      // These should ideally come from frontmatter
      const processedPosts = fetchedRawPosts.map(p => ({
        ...p,
        category: p.category || "AI & Tradition",
        tags: p.tags || (p.slug === "my-first-post" ? ["AI Planning", "Cultural Wisdom"] : ["General", "Tips"]),
        readTime: p.readTime || `${Math.floor(Math.random() * 5) + 5} min read` // Random read time
      }));
      setAllPosts(processedPosts);
    };
    fetchAndProcessPosts();
  }, []);

  useEffect(() => {
    // Apply filtering (currently placeholder) and pagination
    let postsToDisplay = allPosts;
    if (activeFilter === "Wedding Traditions") {
      // postsToDisplay = allPosts.filter(p => p.category === "Wedding Traditions" || p.tags?.includes("Wedding Traditions"));
    } else if (activeFilter === "Planning Insights") {
      // postsToDisplay = allPosts.filter(p => p.category === "Planning Insights" || p.tags?.includes("Planning Insights"));
    }
    // else keep all posts if filter is different or not strict

    const indexOfLastPost = currentPage * POSTS_PER_PAGE;
    const indexOfFirstPost = indexOfLastPost - POSTS_PER_PAGE;
    setDisplayedPosts(postsToDisplay.slice(indexOfFirstPost, indexOfLastPost));

  }, [allPosts, currentPage, activeFilter]);


  const totalPages = Math.ceil(allPosts.length / POSTS_PER_PAGE);

  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleFilterClick = (filterName: string) => {
    setActiveFilter(filterName);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  return (
    // Applied .font-inter and .blog-body for overall page styling from new CSS.
    // The actual body tag styling from blog.html (`background: #faf7f2; color: #3a3a3a;`)
    // is encapsulated by .blog-body in index.css
    <div className="min-h-screen flex flex-col blog-body font-inter">
      <Helmet>
        <title>Sanskara Blog - Hindu Wedding Insights & Traditions</title>
        <meta name="description" content="Discover the latest insights about Hindu wedding traditions, cultural ceremonies, and the future of AI-powered wedding planning with Sanskara." />
      </Helmet>

      <Navbar /> {/* Using existing Navbar. */}

      {/* Hero Section - Add top padding to content below fixed navbar */}
      <section className="gradient-bg py-20 pt-32 md:pt-36 lg:pt-40"> {/* Increased top padding */}
        <div className="max-w-4xl mx-auto text-center px-4 animate-fade-in"> {/* Using existing animate-fade-in from index.css */}
            <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6 font-inter">
                Hindu Wedding <span className="gradient-text">Insights</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed font-inter">
                Discover the latest insights about Hindu wedding traditions, cultural ceremonies,
                and the future of AI-powered wedding planning with Sanskara.
            </p>

            <div className="flex flex-wrap justify-center gap-3 mt-12">
                <button
                  type="button"
                  className={`tag-gradient px-6 py-2 rounded-full text-sm font-medium transition-all ${activeFilter === "Wedding Traditions" ? "active-tag" : "text-orange-600 hover:bg-orange-500 hover:text-white"}`}
                  onClick={() => handleFilterClick("Wedding Traditions")}
                >
                    <FontAwesomeIcon icon={faStar} className="mr-2" />
                    Wedding Traditions
                </button>
                <button
                  type="button"
                  className={`tag-gradient px-6 py-2 rounded-full text-sm font-medium transition-all ${activeFilter === "Planning Insights" ? "active-tag" : "text-orange-600 hover:bg-orange-500 hover:text-white"}`}
                  onClick={() => handleFilterClick("Planning Insights")}
                >
                    <FontAwesomeIcon icon={faChartLine} className="mr-2" />
                    Planning Insights
                </button>
            </div>
        </div>
      </section>

      <main className="flex-grow container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {displayedPosts.length > 0 ? (
          <div className="grid md:grid-cols-1 gap-8 max-w-3xl mx-auto"> {/* Single column for cards */}
            {displayedPosts.map(post => (
              <BlogPostCard key={post.slug} post={post} />
            ))}
          </div>
        ) : (
           <div className="text-center py-10">
            <p className="text-xl text-gray-500">No blog posts found.</p>
            {/* TODO: Add a loading state */}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-12 flex justify-center items-center space-x-2">
            <Button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              variant="outline"
              className="text-orange-600 border-orange-400 hover:bg-orange-100 disabled:opacity-50"
            >
              Previous
            </Button>
            {/* Simple pagination display logic */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(pageNumber => { // Logic to show limited page numbers
                if (totalPages <= 5) return true;
                if (pageNumber === 1 || pageNumber === totalPages) return true;
                if (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1) return true;
                if ((currentPage === 1 && pageNumber <=3) || (currentPage === totalPages && pageNumber >= totalPages - 2)) return true;
                return false;
              })
              .map((pageNumber, index, arr) => (
                <React.Fragment key={pageNumber}>
                  {index > 0 && arr[index-1] + 1 !== pageNumber && <span className="text-orange-600">...</span>}
                  <Button
                    onClick={() => paginate(pageNumber)}
                    variant={currentPage === pageNumber ? 'default' : 'outline'}
                    className={
                      currentPage === pageNumber
                      ? 'btn-gradient text-white'
                      : 'text-orange-600 border-orange-400 hover:bg-orange-100'
                    }
                  >
                    {pageNumber}
                  </Button>
                </React.Fragment>
            ))}
            <Button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              variant="outline"
              className="text-orange-600 border-orange-400 hover:bg-orange-100 disabled:opacity-50"
            >
              Next
            </Button>
          </div>
        )}
      </main>

      {/* CTA Section */}
      <section className="gradient-bg py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6 font-inter">
                Ready to Plan Your Dream Hindu Wedding?
            </h2>
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto font-inter">
                Join thousands of couples who have created their perfect Hindu wedding celebration with personalized AI guidance, cultural insights, and traditional wisdom.
            </p>
            <Button className="btn-gradient text-white px-8 py-4 rounded-full text-lg font-semibold inline-flex items-center space-x-2 hover:scale-105 transition-transform">
                <FontAwesomeIcon icon={faHeart} className="mr-2" />
                <span>Start Planning for Free</span>
            </Button>
        </div>
      </section>

      <Footer /> {/* Using existing Footer */}
    </div>
  );
};

export default BlogListPage;
