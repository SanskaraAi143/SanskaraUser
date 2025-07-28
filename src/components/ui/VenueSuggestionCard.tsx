import React from 'react';

export interface VenueData { // Exporting interface for potential reuse
  name: string;
  location: string;
  rating: string;
  ratingAria: string;
  reviews: string;
}

interface VenueSuggestionCardProps {
  venue: VenueData;
  // Allow any other props to be passed down to the div if necessary
  [key: string]: React.HTMLAttributes<HTMLDivElement>;
}

const VenueSuggestionCard: React.FC<VenueSuggestionCardProps> = ({ venue, ...rest }) => {
  return (
    <div
      className="glass-card p-3 hover:shadow-lg cursor-pointer transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col" // Added h-full
      {...rest}
    >
      <h4 className="font-semibold title-gradient text-base flex-grow">{venue.name}</h4> {/* Adjusted text size, flex-grow */}
      <p className="text-wedding-brown/70 mt-0.5 text-xs">{venue.location}</p>
      <div className="flex items-center mt-1.5">
        <span className="text-wedding-gold text-sm" aria-label={venue.ratingAria}>
          {venue.rating}
        </span>
        <span className="text-wedding-brown/60 ml-1.5 text-xs">{venue.reviews}</span>
      </div>
    </div>
  );
};

export default VenueSuggestionCard;
