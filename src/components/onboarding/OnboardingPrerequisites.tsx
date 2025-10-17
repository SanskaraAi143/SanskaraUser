import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Info } from 'lucide-react';

interface OnboardingPrerequisitesProps {
  onContinue: () => void;
}

const OnboardingPrerequisites: React.FC<OnboardingPrerequisitesProps> = ({ onContinue }) => {
  return (
    <div className="onboarding-container p-4 md:p-8 max-w-2xl mx-auto bg-white shadow-lg rounded-xl my-8">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Before You Begin Your Wedding Plan...</h1>
      <p className="text-lg text-gray-600 text-center mb-8">
        To ensure a smooth and accurate planning experience, please have the following information ready:
      </p>

      <div className="space-y-4 mb-8">
        <div className="flex items-start bg-yellow-50 p-4 rounded-md shadow-sm border border-yellow-200">
          <CheckCircle2 className="text-yellow-600 mr-3 mt-1 flex-shrink-0" size={24} />
          <div>
            <h3 className="font-semibold text-gray-800">Your Partner's Details</h3>
            <p className="text-gray-700 text-sm">Full Name and Email Address. We'll invite them to join and complete their side of the plan.</p>
          </div>
        </div>

        <div className="flex items-start bg-blue-50 p-4 rounded-md shadow-sm border border-blue-200">
          <CheckCircle2 className="text-blue-600 mr-3 mt-1 flex-shrink-0" size={24} />
          <div>
            <h3 className="font-semibold text-gray-800">Wedding Date & Location</h3>
            <p className="text-gray-700 text-sm">Even if approximate, having these helps us tailor your plan.</p>
          </div>
        </div>

        <div className="flex items-start bg-green-50 p-4 rounded-md shadow-sm border border-green-200">
          <CheckCircle2 className="text-green-600 mr-3 mt-1 flex-shrink-0" size={24} />
          <div>
            <h3 className="font-semibold text-gray-800">Cultural & Style Preferences</h3>
            <p className="text-gray-700 text-sm">Think about your family's region/traditions, desired wedding style, and color themes.</p>
          </div>
        </div>

        <div className="flex items-start bg-purple-50 p-4 rounded-md shadow-sm border border-purple-200">
          <Info className="text-purple-600 mr-3 mt-1 flex-shrink-0" size={24} />
          <div>
            <h3 className="font-semibold text-gray-800">Estimated Budget (Your Side)</h3>
            <p className="text-gray-700 text-sm">An idea of the budget for the responsibilities you'll be managing helps us provide relevant recommendations.</p>
          </div>
        </div>
      </div>

      <p className="text-md text-gray-700 text-center mb-8">
        Don't worry if everything isn't perfect; you can always adjust details later in your dashboard.
      </p>

      <div className="text-center">
        <Button onClick={onContinue} className="px-8 py-3 text-lg bg-yellow-500 hover:bg-yellow-600 text-white rounded-full shadow-lg transition-all duration-300">
          I'm Ready! Let's Start Planning
        </Button>
      </div>
    </div>
  );
};

export default OnboardingPrerequisites;