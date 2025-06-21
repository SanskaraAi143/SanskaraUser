import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PostData, getPostBySlug } from '@/lib/blog-posts';
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PostData, getPostBySlug } from '@/lib/blog-posts';
// import Navbar from '@/components/Navbar'; // Using simplified Navbar for article page
// import Footer from '@/components/Footer'; // Using simplified Footer for article page
import { Button } from '@/components/ui/button'; // Keep for potential future use
import { Helmet } from 'react-helmet-async';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faCalendarAlt as faRegularCalendarAlt, faClock as faRegularClock } from '@fortawesome/free-regular-svg-icons';
import { faOm, faHeart } from '@fortawesome/free-solid-svg-icons';


// Extended PostData for article page specifics
interface ArticlePostData extends PostData {
  category?: string;
  tags?: string[];
  readTime?: string;
  // Fields for callout box - these would ideally come from frontmatter
  calloutTitle?: string;
  calloutText?: string;
  calloutButtonText?: string;
  calloutButtonLink?: string;
}


const BlogDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<ArticlePostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const articleContentRef = useRef<HTMLDivElement>(null);

  // Scroll progress logic
  const handleScroll = () => {
    const element = articleContentRef.current;
    if (element) {
      const totalHeight = element.scrollHeight - element.clientHeight;
      const progress = (element.scrollTop / totalHeight) * 100;
      setScrollProgress(progress);
    } else { // Fallback to window scroll if ref not ready or not applicable
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrolled = (scrollTop / docHeight) * 100;
        setScrollProgress(scrolled);
    }
  };

  useEffect(() => {
    // Attach scroll listener to article content or window
    const contentElement = articleContentRef.current;
    let scrollableElement: HTMLElement | Window = window;

    if (contentElement && contentElement.scrollHeight > contentElement.clientHeight) {
        // If article content itself is scrollable (e.g., due to max-height and overflow-y: auto)
        // This is not the case with current full page scroll, but good for robustness
        // scrollableElement = contentElement;
        // For now, we assume full page scroll, so window is the scrollable element.
    }

    scrollableElement.addEventListener('scroll', handleScroll);
    return () => scrollableElement.removeEventListener('scroll', handleScroll);
  }, [post]); // Re-attach if post causes layout change affecting scroll heights

  // Fade-in-up animation on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target); // Optional: stop observing once visible
          }
        });
      },
      { threshold: 0.1 } // Adjust threshold as needed
    );

    const elements = document.querySelectorAll('.fade-in-up');
    elements.forEach((el) => observer.observe(el));

    return () => elements.forEach((el) => observer.unobserve(el));
  }, [post]); // Rerun if post content changes, to catch new elements

  useEffect(() => {
    if (slug) {
      const fetchPostDetails = async () => {
        setLoading(true);
        try {
          const fetchedPost = await getPostBySlug(slug);
          if (fetchedPost) {
            // Add dummy/default data for new fields if not in markdown
            const augmentedPost: ArticlePostData = {
              ...fetchedPost,
              category: fetchedPost.category || "AI & Tradition",
              tags: fetchedPost.tags || (slug === "my-first-post" ? ["AI Planning", "Cultural Wisdom"] : ["Tech", "Innovation"]),
              readTime: fetchedPost.readTime || `${Math.floor(Math.random() * 5) + 5} min read`,
              author: fetchedPost.author || "SanskaraAI Team", // Default author
              // Example callout data - ideally from frontmatter
              calloutTitle: fetchedPost.calloutTitle || "Transform Your Event Planning!",
              calloutText: fetchedPost.calloutText || "Join the AI-powered wedding revolution and unlock your full potential with SanskaraAI. Start your personalized, tradition-rich planning journey now.",
              calloutButtonText: fetchedPost.calloutButtonText || "Start Your AI Wedding Journey",
              calloutButtonLink: fetchedPost.calloutButtonLink || "https://sanskaraai.com/get-started/"
            };
            setPost(augmentedPost);
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
      fetchPostDetails();
    } else {
      setError('No slug provided.');
      setLoading(false);
    }
  }, [slug]);


  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center blog-body font-nunito">
        <p className="text-xl text-orange-500">Loading post...</p>
        {/* Add a spinner icon here later */}
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col blog-body font-nunito">
        {/* Simplified Nav for error page */}
        <nav className="bg-white/90 shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link to="/" className="flex items-center space-x-3 logo-pulse">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                  <FontAwesomeIcon icon={faOm} className="text-white text-lg" />
                </div>
                <span className="text-2xl font-bold gradient-text">SanskaraAI</span>
              </Link>
              <Link to="/blog" className="text-orange-500 font-semibold">Blog Home</Link>
            </div>
          </div>
        </nav>
        <main className="flex-grow container mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-700 text-lg mb-6">{error || 'Post not found.'}</p>
          <Button asChild className="btn-gradient text-white">
            <Link to="/blog">
              Back to Blog Home
            </Link>
          </Button>
        </main>
        {/* Simplified Footer for error page */}
        <footer className="bg-white/60 backdrop-blur-md py-12 mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} SanskaraAI. All rights reserved.</p>
            </div>
        </footer>
      </div>
    );
  }

  // Render actual post
  return (
    <div className="blog-body font-nunito"> {/* Applies base styles for article page */}
      <Helmet>
        <title>{post.title} - Sanskara AI Blog</title>
        {post.excerpt && <meta name="description" content={post.excerpt} />}
      </Helmet>

      <div className="progress-bar" style={{ width: `${scrollProgress}%` }}></div>

      {/* Simplified Navbar for Article Page */}
      <nav className="bg-white/90 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
                <Link to="/" className="flex items-center space-x-3 logo-pulse">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                        <FontAwesomeIcon icon={faOm} className="text-white text-lg" />
                    </div>
                    <span className="text-2xl font-bold gradient-text">SanskaraAI</span>
                </Link>
                <div className="flex items-center space-x-4">
                    <Link to="/blog" className="text-orange-500 font-semibold hover:text-red-500 transition-colors">Blog Home</Link>
                </div>
            </div>
        </div>
      </nav>

      {/* Main Article Content - applied max-w-3xl and mx-auto for centering */}
      <main ref={articleContentRef} className="max-w-3xl mx-auto px-4 py-12 overflow-y-auto" style={{maxHeight: 'calc(100vh - 4rem)'}} /* Temp for testing scroll on content div */>
        <div className="mb-6 fade-in-up">
          {post.category && <span className="tag-pill">{post.category}</span>}
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 fade-in-up">{post.title}</h1>
        <div className="flex items-center text-sm text-gray-500 mb-6 space-x-4 fade-in-up">
          <span><FontAwesomeIcon icon={faUser} className="mr-1" /> {post.author}</span>
          <span><FontAwesomeIcon icon={faRegularCalendarAlt} className="mr-1" />
            {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
          {post.readTime && <span><FontAwesomeIcon icon={faRegularClock} className="mr-1" /> {post.readTime}</span>}
        </div>
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8 fade-in-up">
            {post.tags.map(tag => <span key={tag} className="tag-pill">{tag}</span>)}
          </div>
        )}

        {/* Main Post Image - if available in frontmatter */}
        {post.image && (
            <div className="my-8 rounded-lg overflow-hidden shadow-xl fade-in-up">
                <img src={post.image} alt={post.title} className="w-full h-auto object-cover" />
            </div>
        )}

        {/* Rendered Markdown Content with specific prose styling */}
        <article
            className="prose-sanskara fade-in-up" // Custom prose styles from index.css
            dangerouslySetInnerHTML={{ __html: post.contentHtml || '' }}
        />

        {/* Callout Box - Content can be dynamic from frontmatter */}
        {post.calloutTitle && (
          <div className="callout-box fade-in-up">
              <div style={{fontSize: '2.2rem', color: '#e07a3f', marginBottom: '0.5rem'}}>🌟</div>
              <h4>{post.calloutTitle}</h4>
              {post.calloutText && <div style={{fontSize: '1.18rem', color: '#7a5a2f', marginBottom: '1.2rem'}} dangerouslySetInnerHTML={{ __html: post.calloutText }} />}
              {post.calloutButtonText && post.calloutButtonLink && (
                <a href={post.calloutButtonLink} target="_blank" rel="noopener noreferrer">
                    <button className="callout-btn">{post.calloutButtonText}</button>
                </a>
              )}
          </div>
        )}

        {/* Example of how further static content or links could be added as per article.html */}
        <div className="prose-sanskara fade-in-up">
            <h3>Take the First Step: Explore SanskaraAI Today! ✨</h3>
            <p>
                <a href="https://sanskaraai.com/features/" target="_blank" rel="noopener noreferrer">Visit our Features Page</a><br />
                <a href="https://sanskaraai.com/get-started/" target="_blank" rel="noopener noreferrer">Get Your Personalized Plan</a><br />
                {/* Add social media links here */}
            </p>
        </div>

      </main>

      {/* Simplified Footer for Article Page */}
      <footer className="bg-white/60 backdrop-blur-md py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
                <Link to="/" className="flex items-center space-x-3 mb-4 md:mb-0 logo-pulse">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                        <FontAwesomeIcon icon={faOm} className="text-white text-sm" />
                    </div>
                    <span className="text-xl font-bold gradient-text">SanskaraAI</span>
                </Link>
                <div className="text-sm text-gray-500 text-center md:text-left">
                    © {new Date().getFullYear()} SanskaraAI. All rights reserved. •
                    <a href="#" className="hover:text-orange-500 transition-colors"> Privacy & Terms</a> •
                    Built with <FontAwesomeIcon icon={faHeart} className="text-red-500" /> by SanskaraAI Team
                </div>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default BlogDetailPage;
