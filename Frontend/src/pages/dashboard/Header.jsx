// import React from 'react';

// const Header = ({ toggleSidebar }) => {
//   return (
//     <header className="bg-white shadow p-4 flex justify-between items-center md:px-8">
//       <button onClick={toggleSidebar} className="text-gray-600 focus:outline-none focus:text-gray-900">
//         <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
//         </svg>
//       </button>
//       <h1 className="text-xl md:text-2xl font-bold text-gray-800">Admin Dashboard</h1>
//       <div className="flex items-center">
//         <span className="mr-2 text-gray-700">Welcome, Admin!</span>
//         <img
//           src="https://via.placeholder.com/40" // Placeholder for user profile image
//           alt="User Profile"
//           className="w-10 h-10 rounded-full border-2 border-blue-500"
//         />
//       </div>
//     </header>
//   );
// };

// export default Header;

import React from 'react';

const Header = ({ toggleSidebar }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 p-4 flex justify-between items-center md:px-8">
      <button
        onClick={toggleSidebar}
        className="text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700 transition-colors duration-200"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      
      <h1 className="text-xl md:text-2xl font-semibold text-gray-800"></h1>
      
      <div className="flex items-center">
        <span className="mr-3 text-gray-600 font-medium hidden sm:inline">Welcome,Admin!</span>
        <img
          src="https://via.placeholder.com/40/6B7280/FFFFFF?text=A" // Placeholder for user profile image
          alt="User Profile"
          className="w-10 h-10 rounded-full border-2 border-gray-300 hover:border-gray-400 transition-colors duration-200"
        />
      </div>
    </header>
  );
};

export default Header;