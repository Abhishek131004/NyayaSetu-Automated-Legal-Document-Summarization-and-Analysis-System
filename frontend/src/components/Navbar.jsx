import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaSignOutAlt, FaFileAlt, FaUpload, FaTachometerAlt } from 'react-icons/fa';
import '../styles/navbar.css';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link to="/" className="navbar-logo">
            <span className="logo-text">NyayaSetu</span>
          </Link>
          
          {isAuthenticated && (
            <div className="navbar-links">
              <Link to="/dashboard" className="nav-link">
                <FaTachometerAlt /> Dashboard
              </Link>
              <Link to="/upload" className="nav-link">
                <FaUpload /> Upload
              </Link>
              
              {user?.role === 'admin' && (
                <Link to="/admin" className="nav-link">
                  Admin Panel
                </Link>
              )}
            </div>
          )}
          
          <div className="navbar-right">
            {isAuthenticated ? (
              <div className="user-menu">
                <div className="user-info">
                  <FaUser />
                  <span className="username">{user?.name || 'User'}</span>
                </div>
                <button className="btn-logout" onClick={handleLogout}>
                  <FaSignOutAlt />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="btn btn-outline">Login</Link>
                <Link to="/register" className="btn btn-primary">Register</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;