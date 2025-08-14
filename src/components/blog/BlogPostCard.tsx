import React from 'react';
import { Link } from 'react-router-dom';
import { PostData } from '@/lib/blog-posts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock } from 'lucide-react';

interface BlogPostCardProps {
  post: PostData & { category?: string; tags?: string[]; readTime?: string };
}

const BlogPostCard: React.FC<BlogPostCardProps> = ({ post }) => {
  const tagsToDisplay = post.tags && post.tags.length > 0 ? post.tags : [];
  const categoryToDisplay = post.category || "General";

  return (
    <Card className="flex flex-col h-full">
      {post.image && (
        <div className="aspect-[16/9] rounded-t-lg overflow-hidden">
          <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
        </div>
      )}
      <CardHeader>
        <Badge variant="secondary" className="w-fit mb-2">{categoryToDisplay}</Badge>
        <CardTitle className="text-2xl hover:text-primary transition-colors">
          <Link to={`/blog/${post.slug}`}>{post.title}</Link>
        </CardTitle>
        <CardDescription className="flex items-center text-sm text-muted-foreground pt-2">
          <span className="flex items-center mr-4">
            <Calendar className="mr-1.5 h-4 w-4" />
            {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
          {post.readTime && (
            <span className="flex items-center">
              <Clock className="mr-1.5 h-4 w-4" />
              {post.readTime}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="leading-relaxed text-muted-foreground">
          {post.excerpt || "No excerpt available."}
        </p>
      </CardContent>
      <CardFooter className="flex-col items-start gap-4">
        <div className="flex flex-wrap gap-2">
          {tagsToDisplay.map((tag) => (
            <Badge key={tag} variant="outline">{tag}</Badge>
          ))}
        </div>
        <Link to={`/blog/${post.slug}`} className="w-full">
          <Button className="w-full">Read More</Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default BlogPostCard;
