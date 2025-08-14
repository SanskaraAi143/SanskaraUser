import React from 'react';
import { Link } from 'react-router-dom';
import { PostData } from '@/lib/blog-posts';
import { Button } from '@/components/ui/button'; // Keep for potential future use, but new design uses custom button
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faClock } from '@fortawesome/free-regular-svg-icons';

interface BlogPostCardProps {
  post: PostData & { category?: string; tags?: string[]; readTime?: string }; // Extended PostData
}

const BlogPostCard: React.FC<BlogPostCardProps> = ({ post }) => {
  // Fallback for tags if not provided in post data
  const tagsToDisplay = post.tags && post.tags.length > 0 ? post.tags : ["General"];
  const categoryToDisplay = post.category || "Featured";

  return (
    <article className="card-hover bg-white/70 rounded-2xl p-8 shadow-lg floating-animation font-inter">
      {post.image && (
        <div className="aspect-[16/9] mb-6 rounded-lg overflow-hidden shadow-md">
          <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="mb-4">
        <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-semibold">
          {categoryToDisplay}
        </span>
      </div>      <h2 className="text-2xl font-bold mb-4 leading-tight hover:text-orange-600 transition-colors" style={{color: '#1a202c'}}>
        <Link to={`/blog/${post.slug}`}>{post.title}</Link>
      </h2>
      <p className="mb-6 leading-relaxed" style={{color: '#374151'}}>
        {post.excerpt || "No excerpt available."}
      </p>
      <div className="flex items-center text-sm mb-6 space-x-4" style={{color: '#374151'}}>
        <span>
          <FontAwesomeIcon icon={faCalendarAlt} className="mr-1" />
          {new Date(post.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </span>
        {post.readTime && (
          <span>
            <FontAwesomeIcon icon={faClock} className="mr-1" />
            {post.readTime}
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-2 mb-6">
        {tagsToDisplay.map((tag, index) => (
          <span key={index} className="bg-orange-50 text-orange-500 px-2 py-1 rounded text-xs">
            {tag}
          </span>
        ))}
      </div>
      <Link to={`/blog/${post.slug}`} className="block w-full">
        <button className="btn-gradient text-white px-6 py-3 rounded-full font-medium w-full">
          Read Full Article
        </button>
      </Link>
    </article>
  );
};

export default BlogPostCard;
