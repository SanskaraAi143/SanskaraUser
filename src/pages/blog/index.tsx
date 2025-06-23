import React, { useState, useEffect } from 'react';
import { PostData, getAllPosts } from '@/lib/blog-posts';
import BlogPostCard from '@/components/blog/BlogPostCard';
import Navbar from '@/components/Navbar'; // Using existing Navbar
import Footer from '@/components/Footer';   // Using existing Footer
import { Button } from '@/components/ui/button';
import { Helmet } from 'react-helmet-async';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faChartLine, faHeart } from '@fortawesome/free-solid-svg-icons'; // faOm removed as it's not used in this file directly
import ProgressBar from '@/components/ProgressBar';

const POSTS_PER_PAGE = 6; // Updated to 6 for better grid layout (2 rows of 3, or 3 rows of 2)

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
    const paginatedPosts = postsToDisplay.slice(indexOfFirstPost, indexOfLastPost);
    setDisplayedPosts(paginatedPosts);

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

  // Find the featured blog post (hardcoded or by a property)
  const featuredPost = allPosts.find(p => p.slug === 'the-sanskaraai-advantage') || allPosts[0];

  return (
    <div className="min-h-screen flex flex-col blog-body font-inter relative">
      <Helmet>
        <title>Sanskara Blog - Hindu Wedding Insights & Traditions</title>
        <meta name="description" content="Discover the latest insights about Hindu wedding traditions, cultural ceremonies, and the future of AI-powered wedding planning with Sanskara." />
        <link rel="canonical" href="https://sanskaraai.com/blog/" />
        {/* Open Graph Tags */}
        <meta property="og:title" content="Sanskara Blog - Hindu Wedding Insights & Traditions" />
        <meta property="og:description" content="Discover the latest insights about Hindu wedding traditions, cultural ceremonies, and the future of AI-powered wedding planning with Sanskara." />
        <meta property="og:url" content="https://sanskaraai.com/blog/" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://sanskaraai.com/logo.jpeg" /> {/* Replace with a specific blog banner if available */}
        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Sanskara Blog - Hindu Wedding Insights & Traditions" />
        <meta name="twitter:description" content="Discover the latest insights about Hindu wedding traditions, cultural ceremonies, and the future of AI-powered wedding planning with Sanskara." />
        <meta name="twitter:image" content="https://sanskaraai.com/logo.jpeg" /> {/* Replace with a specific blog banner if available */}
      </Helmet>
      <ProgressBar />
      <div className="gradient-bg" aria-hidden="true"></div>
      <Navbar />
      {/* Hero Section - now relative, not fixed bg */}
      <section className="py-20 pt-32 md:pt-36 lg:pt-40 relative z-10">
        <div className="max-w-4xl mx-auto text-center px-4 animate-fade-in">
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
      {/* Featured Blog Card below hero section */}
      {featuredPost && (
        <div className="max-w-3xl mx-auto">
          <BlogPostCard post={{ ...featuredPost, category: 'Featured' }} />
        </div>
      )}

      <main className="flex-grow container mx-auto px-4 pt-0 pb-8 sm:px-6 lg:px-8 relative z-10">
        {displayedPosts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"> {/* Updated grid classes */}
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

      {/* CTA Section - also relative, not fixed bg */}
      <section className="py-20 relative z-10">
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

      <Footer />
    </div>
  );
};

export default BlogListPage;
