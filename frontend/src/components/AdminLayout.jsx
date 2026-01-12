import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { FaTachometerAlt, FaUsers, FaFileAlt, FaFlask } from 'react-icons/fa';
import '../styles/adminLayout.css';

const AdminLayout = () => {
  return (
    <div className="app-layout">
      <Navbar />
      <div className="admin-container">
        <aside className="admin-sidebar">
          <div className="sidebar-header">
            <h2>Admin Panel</h2>
          </div>
          <nav className="sidebar-nav">
            <Link to="/admin" className="sidebar-link">
              <FaTachometerAlt /> Dashboard
            </Link>
            <Link to="/admin/users" className="sidebar-link">
              <FaUsers /> Users
            </Link>
            <Link to="/admin/documents" className="sidebar-link">
              <FaFileAlt /> Documents
            </Link>
            <Link to="/admin/free-trials" className="sidebar-link">
              <FaFlask /> Free Trials
            </Link>
          </nav>
        </aside>
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default AdminLayout;