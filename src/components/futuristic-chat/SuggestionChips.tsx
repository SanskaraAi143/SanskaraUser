import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SuggestionChipsProps {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
  className?: string;
}

const SuggestionChips: React.FC<SuggestionChipsProps> = ({ suggestions, onSuggestionClick, className }) => {
  return (
    <div className={cn("flex flex-wrap gap-2 py-2", className)}>
      {suggestions.map((suggestion, index) => (
        <Button
          key={index}
          variant="outline"
          size="sm"
          onClick={() => onSuggestionClick(suggestion)}
          className="bg-white"
        >
          {suggestion}
        </Button>
      ))}
    </div>
  );
};

export default SuggestionChips;