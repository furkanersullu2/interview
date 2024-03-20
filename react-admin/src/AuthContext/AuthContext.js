// AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import useToken from "../hooks/useToken"

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { first_name, last_name, employee_role, id } = useToken();
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  useEffect(() => {
    if (employee_role === "Basic") {
      setIsAuthenticated(false);
    }
    else{
      setIsAuthenticated(true);
    }
  }, [employee_role]);

  const login = () => {
    setIsAuthenticated(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};