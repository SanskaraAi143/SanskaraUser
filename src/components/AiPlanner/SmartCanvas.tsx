import React from 'react';

const SmartCanvas: React.FC = () => {
  return (
    <div className="p-6 h-full">
      <div className="bg-white rounded-lg shadow p-4 h-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Wedding of [Bride] & [Groom]</h2>
          <span className="text-sm text-gray-500">📅 120 days to go</span>
        </div>
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm">🎯 Progress: 45% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: '45%' }}></div>
          </div>
        </div>
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm">💰 Budget: ₹8.2L / ₹12L</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '68%' }}></div>
          </div>
        </div>
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">✅ Next Actions:</h3>
          <ul className="list-disc list-inside">
            <li>Finalize Sangeet venue (3 days)</li>
            <li>Respond to caterer quote</li>
            <li>Review Mehendi design options</li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">🔔 Recent Updates:</h3>
          <ul className="list-disc list-inside">
            <li>Rohan contacted DJ Sunny (2h ago)</li>
            <li>Photographer confirmed booking</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SmartCanvas;
