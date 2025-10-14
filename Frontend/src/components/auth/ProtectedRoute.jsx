import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ isAuthenticated }) => {
  const userRole = localStorage.getItem('userRole'); // Retrieve user role
  console.log('ProtectedRoute - userRole from localStorage:', userRole);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet context={{ userRole }} />; // Pass userRole as context
};

export default ProtectedRoute;