import React from 'react';

interface FeatureCardProps {
  icon: JSX.Element;
  title: string;
  description: string;
  // Allow any other props to be passed down to the div if necessary
  [key: string]: any;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, ...rest }) => {
  return (
    <div
      className="feature-card"
      {...rest}
    >
      <div className="h-14 w-14 rounded-full bg-gradient-primary flex items-center justify-center mb-6 shadow-lg flex-shrink-0">
        {icon}
      </div>
      <div className="flex flex-col flex-grow">
        <h3 className="text-xl font-playfair font-semibold title-gradient mb-3">
          {title}
        </h3>
        <p className="text-wedding-gold/80 text-sm flex-grow">{description}</p>
      </div>
    </div>
  );
};

export default FeatureCard;
