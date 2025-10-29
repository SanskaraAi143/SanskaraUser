import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface VenueCardProps {
  imageUrl: string;
  name: string;
  tags: string[];
  onViewDetails: () => void;
  className?: string;
}

const VenueCard: React.FC<VenueCardProps> = ({ imageUrl, name, tags, onViewDetails, className }) => {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="p-0">
        <img src={imageUrl} alt={name} className="w-full h-40 object-cover" />
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="text-base font-bold mb-2">{name}</CardTitle>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <Badge key={index} variant="secondary">{tag}</Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button onClick={onViewDetails} size="sm" className="w-full">View Details</Button>
      </CardFooter>
    </Card>
  );
};

export default VenueCard;