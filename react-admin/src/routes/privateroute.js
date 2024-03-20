// PrivateRoute.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../AuthContext/AuthContext';

const PrivateRoute = ({ }) => {
  const { isAuthenticated } = useAuth();

  return (
    <div>{
        isAuthenticated ? (
          <Outlet/>
        ) : (
          <Navigate to="/dashboard" />
        )
      }
    </div>
  );
};

export default PrivateRoute;