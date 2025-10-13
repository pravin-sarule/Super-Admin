import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  ChevronDown,
  ChevronRight,
  Shield,
  File,
  Newspaper,
  Globe,
  Mail,
  Calendar,
  MessageCircle,
  BarChart3,
  Edit,
  Table,
  Map,
  Layers,
  LifeBuoy
} from 'lucide-react';

const Sidebar = ({ isOpen }) => {
  const [openMenu, setOpenMenu] = useState(null);

  const handleMenuToggle = (menuName) => {
    setOpenMenu(openMenu === menuName ? null : menuName);
  };

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard
    },
    
    
   
   
    {
      name: 'Prompt Management',
      path: '/dashboard/prompts',
      icon: Edit
    },
   
  ];

  return (
    // <div
    //   className={`bg-white text-gray-700 h-screen transition-all duration-300 ${
    //     isOpen ? 'w-64' : 'w-16'
    //   } flex flex-col shadow-lg border-r border-gray-200 fixed md:relative z-40`}
    // >
    <div
  className={`bg-white text-gray-700 h-screen transition-all duration-300 ${
    isOpen ? 'w-80' : 'w-20'
  } flex flex-col shadow-lg border-r border-gray-200 fixed md:relative z-40`}
>
      {/* Sidebar Header */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          {isOpen && (
            <span className="text-gray-800 font-semibold text-lg whitespace-nowrap overflow-hidden">
              Super Admin
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-grow py-4 overflow-y-auto">
        {menuItems.map((item, index) => (
          <div key={index} className="px-2">
            {item.path ? (
              // Direct link item
              <Link
                to={item.path}
                className="w-full flex items-center px-4 py-2.5 mb-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200 group"
                title={!isOpen ? item.name : ''}
              >
                <item.icon className="w-5 h-5 mr-3 text-gray-500 group-hover:text-gray-700 flex-shrink-0" />
                {isOpen && (
                  <span className="font-medium whitespace-nowrap overflow-hidden">
                    {item.name}
                  </span>
                )}
              </Link>
            ) : (
              // Dropdown menu item
              <>
                <button
                  className="w-full flex items-center px-4 py-2.5 mb-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200 group"
                  onClick={() => isOpen && handleMenuToggle(item.key)}
                  title={!isOpen ? item.name : ''}
                >
                  <item.icon className="w-5 h-5 mr-3 text-gray-500 group-hover:text-gray-700 flex-shrink-0" />
                  {isOpen && (
                    <>
                      <span className="font-medium flex-grow text-left whitespace-nowrap overflow-hidden">
                        {item.name}
                      </span>
                      <div className="transition-transform duration-200 flex-shrink-0">
                        {openMenu === item.key ? (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </>
                  )}
                </button>
                
                {/* Submenu */}
                {isOpen && openMenu === item.key && item.subItems && (
                  <div className="ml-6 mb-2 border-l border-gray-200 pl-4 space-y-1">
                    {item.subItems.map((subItem, subIndex) => (
                      <Link
                        key={subIndex}
                        to={subItem.path}
                        className="flex items-center w-full px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-all duration-200"
                      >
                        <subItem.icon className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                        <span className="whitespace-nowrap overflow-hidden">
                          {subItem.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      {isOpen && (
        <div className="p-4 border-t border-gray-100">
          <div className="text-center">
            <div className="text-xs text-gray-400">
              © 2025 Legal Admin
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;