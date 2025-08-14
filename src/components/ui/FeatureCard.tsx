import React from 'react';

interface FeatureCardProps {
  icon: JSX.Element;
  title: string;
  description: string;
  // Allow any other props to be passed down to the div if necessary
  [key: string]: React.HTMLAttributes<HTMLDivElement>;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, ...rest }) => {
  return (
    <div
      className=" p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col"
      {...rest}
    >
      <div className="h-14 w-14 rounded-full bg-gradient-primary flex items-center justify-center mb-6 shadow-lg flex-shrink-0">
        {icon}
      </div>
      <div className="flex flex-col flex-grow">
        <h3 className="text-xl  font-semibold  mb-3">
          {title}
        </h3>
        <p className="text-wedding-gold/80 text-sm flex-grow">{description}</p>
      </div>
    </div>
  );
};

export default FeatureCard;
