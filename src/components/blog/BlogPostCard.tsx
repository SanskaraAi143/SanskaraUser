import React from 'react';
import { Link } from 'react-router-dom';
import { PostData } from '@/lib/blog-posts'; // Assuming PostData is exported from blog-posts.ts
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface BlogPostCardProps {
  post: PostData;
}

const BlogPostCard: React.FC<BlogPostCardProps> = ({ post }) => {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        {post.image && (
          <div className="aspect-[16/9] mb-4 rounded-md overflow-hidden">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <CardTitle className="text-xl font-semibold hover:text-wedding-red transition-colors">
          <Link to={`/blog/${post.slug}`}>{post.title}</Link>
        </CardTitle>
        <p className="text-sm text-gray-500">
          {new Date(post.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
          {post.author && ` by ${post.author}`}
        </p>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-gray-700">{post.excerpt}</p>
      </CardContent>
      <CardFooter>
        <Button asChild variant="link" className="p-0 text-wedding-red hover:text-wedding-deepred">
          <Link to={`/blog/${post.slug}`}>
            Read More &rarr;
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BlogPostCard;
