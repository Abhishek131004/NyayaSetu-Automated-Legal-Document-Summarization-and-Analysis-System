import React, { useState, useEffect } from 'react';
import { getDashboardStats } from '../../services/adminService';
import { toast } from 'react-toastify';
import { FaUsers, FaFileAlt, FaChartLine, FaSpinner } from 'react-icons/fa';
import '../../styles/admin.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await getDashboardStats();
      if (response.success) {
        setStats(response.data);
      } else {
        toast.error('Failed to load dashboard statistics');
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('An error occurred while loading dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <FaSpinner className="spinner" />
        <p>Loading dashboard statistics...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-page-header">
        <h1>Admin Dashboard</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon users">
            <FaUsers />
          </div>
          <div className="stat-info">
            <h3>Total Users</h3>
            <div className="stat-value">{stats?.totalUsers || 0}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon documents">
            <FaFileAlt />
          </div>
          <div className="stat-info">
            <h3>Total Documents</h3>
            <div className="stat-value">{stats?.totalDocuments || 0}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon summaries">
            <FaChartLine />
          </div>
          <div className="stat-info">
            <h3>Total Summaries</h3>
            <div className="stat-value">{stats?.totalSummaries || 0}</div>
          </div>
        </div>
      </div>

      <div className="admin-section">
        <h2>Recent Activity</h2>
        {stats?.recentDocuments?.length > 0 ? (
          <div className="recent-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Document Name</th>
                  <th>User</th>
                  <th>Type</th>
                  <th>Uploaded</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentDocuments.map((doc) => (
                  <tr key={doc._id}>
                    <td>{doc.fileName}</td>
                    <td>{doc.user?.name || 'Unknown'}</td>
                    <td>{doc.fileType}</td>
                    <td>{new Date(doc.createdAt).toLocaleString()}</td>
                    <td>
                      <span className={`status-pill ${doc.summary ? 'status-success' : 'status-pending'}`}>
                        {doc.summary ? 'Summarized' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="no-data">No recent documents found</p>
        )}
      </div>

      <div className="stats-row">
        <div className="stats-col">
          <div className="admin-section">
            <h2>New Users (Last 7 Days)</h2>
            <div className="chart-container">
              {/* In a real app, you would integrate a charting library here */}
              <div className="placeholder-chart">
                <div className="chart-value">{stats?.newUsers || 0}</div>
                <div className="chart-label">New Users</div>
              </div>
            </div>
          </div>
        </div>

        <div className="stats-col">
          <div className="admin-section">
            <h2>New Documents (Last 7 Days)</h2>
            <div className="chart-container">
              {/* In a real app, you would integrate a charting library here */}
              <div className="placeholder-chart">
                <div className="chart-value">{stats?.newDocuments || 0}</div>
                <div className="chart-label">New Documents</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;