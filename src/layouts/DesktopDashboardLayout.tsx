import React from 'react';
import { Outlet } from 'react-router-dom';

const DesktopDashboardLayout: React.FC = () => {
  return (
    <div>
      {/* Placeholder for desktop-specific navigation or layout elements */}
      {/* For example, a persistent sidebar could go here for desktop view */}
      {/* <header className="bg-gray-800 text-white p-4">Desktop Header</header> */}
      <main>
        <Outlet />
      </main>
    </div>
  );
};
export default DesktopDashboardLayout;
