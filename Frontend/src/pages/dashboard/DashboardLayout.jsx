import React, { useState } from 'react';
import { Outlet } from 'react-router-dom'; // Import Outlet
import Header from './Header';
import Sidebar from './Sidebar';

const DashboardLayout = () => { // Removed children prop
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isOpen={isSidebarOpen} />
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <Outlet /> {/* Render Outlet for nested routes */}
          {/* Removed "Dashboard Layout is rendering" */}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;