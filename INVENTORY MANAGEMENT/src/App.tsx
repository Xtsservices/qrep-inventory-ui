import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './components/LoginPage';
import { Dashboard } from './components/Dashboard';
import { Toaster } from './components/ui/sonner';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (userData) => {
    setCurrentUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('currentUser', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('currentUser');
  };

  const handleUpdateUser = (updatedUser) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
  };

  return (
    <Router>
      <Routes>
        {/* Login */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard/overview" replace /> : <LoginPage onLogin={handleLogin} />}
        />

        {/* Dashboard */}
<Route
  path="/dashboard/*"
  element={
    isAuthenticated ? (
      <Dashboard currentUser={currentUser} onLogout={handleLogout} onUpdateUser={handleUpdateUser} />
    ) : (
      <Navigate to="/login" replace />
    )
  }
/>



        {/* Default redirect */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard/overview" : "/login"} replace />} />
      </Routes>

      <Toaster />
    </Router>
  );
}
