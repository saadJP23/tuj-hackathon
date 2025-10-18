import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Home from './Components/Home/Home';
import Register from './Components/Register/Register';
import Login from './Components/Login/Login';
import Buildings from './Components/Buildings/Buildings';
import Rooms from './Components/Rooms/Rooms';
import RoomDetail from './Components/RoomDetail/RoomDetail';
import RegularClasses from './Components/RegularClasses/RegularClasses';
import UpdateOccupancy from './Components/UpdateOccupancy/UpdateOccupancy';
import RefreshStatus from './Components/RefreshStatus/RefreshStatus';
import './App.css';

// Protected Route Component
function ProtectedRoute({ children, user }) {
  return user ? children : <Navigate to="/login" replace />;
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing authentication on app load
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="nav-brand">
            <Link to="/">Room Management App</Link>
          </div>
          <div className="nav-links">
            {!user ? (
              <>
                <Link to="/register">Register</Link>
                <Link to="/login">Login</Link>
              </>
            ) : (
              <>
                <span style={{ color: '#fff', marginRight: '1rem' }}>
                  Welcome, {user.name}!
                </span>
                <Link to="/">Home</Link>
                <Link to="/buildings">Buildings</Link>
                <Link to="/rooms">Rooms</Link>
                <Link to="/regular-classes">Regular Classes</Link>
                <Link to="/update-occupancy">Update Occupancy</Link>
                <Link to="/refresh-status">Refresh Status</Link>
                <button onClick={handleLogout} className="logout-btn">Logout</button>
              </>
            )}
          </div>
        </nav>
        
        <main className="main-content">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected routes - redirect to login if not authenticated */}
            <Route path="/" element={
              <ProtectedRoute user={user}>
                <Home />
              </ProtectedRoute>
            } />
            <Route path="/buildings" element={
              <ProtectedRoute user={user}>
                <Buildings />
              </ProtectedRoute>
            } />
            <Route path="/rooms" element={
              <ProtectedRoute user={user}>
                <Rooms />
              </ProtectedRoute>
            } />
            <Route path="/rooms/:id" element={
              <ProtectedRoute user={user}>
                <RoomDetail />
              </ProtectedRoute>
            } />
            <Route path="/regular-classes" element={
              <ProtectedRoute user={user}>
                <RegularClasses />
              </ProtectedRoute>
            } />
            <Route path="/update-occupancy" element={
              <ProtectedRoute user={user}>
                <UpdateOccupancy />
              </ProtectedRoute>
            } />
            <Route path="/refresh-status" element={
              <ProtectedRoute user={user}>
                <RefreshStatus />
              </ProtectedRoute>
            } />
            
            {/* Redirect any unknown routes to login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;