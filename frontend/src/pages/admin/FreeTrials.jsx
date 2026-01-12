import React, { useState, useEffect } from 'react';
import { getFreeTrialStats } from '../../services/adminService';
import { toast } from 'react-toastify';
import { FaSpinner, FaClock, FaFileAlt, FaChartPie } from 'react-icons/fa';
import '../../styles/admin.css';

const FreeTrials = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  useEffect(() => {
    fetchStats();
  }, [page]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await getFreeTrialStats(page, limit);
      if (response.success) {
        setStats(response.data);
      } else {
        toast.error('Failed to load free trial statistics');
      }
    } catch (error) {
      console.error('Error fetching free trial stats:', error);
      toast.error('An error occurred while loading free trial statistics');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= (stats?.pages || 1)) {
      setPage(newPage);
    }
  };

  if (loading && !stats) {
    return (
      <div className="loading-container">
        <FaSpinner className="spinner" />
        <p>Loading free trial statistics...</p>
      </div>
    );
  }

  return (
    <div className="admin-free-trials">
      <div className="admin-page-header">
        <h1>Free Trial Usage</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <FaClock />
          </div>
          <div className="stat-info">
            <h3>Trials Today</h3>
            <div className="stat-value">{stats?.trialsToday || 0}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FaFileAlt />
          </div>
          <div className="stat-info">
            <h3>Trials This Week</h3>
            <div className="stat-value">{stats?.trialsThisWeek || 0}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FaChartPie />
          </div>
          <div className="stat-info">
            <h3>Total Trials</h3>
            <div className="stat-value">{stats?.total || 0}</div>
          </div>
        </div>
      </div>

      <div className="admin-section">
        <h2>File Type Distribution</h2>
        <div className="file-type-stats">
          {stats?.fileTypeStats?.map((item) => (
            <div key={item._id} className="file-type-item">
              <div className="file-type-name">{item._id.toUpperCase()}</div>
              <div className="file-type-bar">
                <div 
                  className="file-type-progress" 
                  style={{ 
                    width: `${(item.count / stats.total) * 100}%`,
                    backgroundColor: getFileTypeColor(item._id)
                  }}
                />
              </div>
              <div className="file-type-count">{item.count}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="admin-section">
        <h2>Recent Trial Usage</h2>
        {stats?.trialLogs?.length > 0 ? (
          <div className="recent-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Document Name</th>
                  <th>Type</th>
                  <th>Size</th>
                  <th>IP Address</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {stats.trialLogs.map((log) => (
                  <tr key={log._id}>
                    <td>{log.documentName}</td>
                    <td>{log.documentType.toUpperCase()}</td>
                    <td>{formatFileSize(log.documentSize)}</td>
                    <td>{log.ipAddress}</td>
                    <td>{new Date(log.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {stats.pages > 1 && (
              <div className="pagination">
                <button 
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="pagination-button"
                >
                  Previous
                </button>
                <span className="pagination-info">Page {page} of {stats.pages}</span>
                <button 
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === stats.pages}
                  className="pagination-button"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        ) : (
          <p className="no-data">No free trial usage logs found</p>
        )}
      </div>
    </div>
  );
};

// Helper function to get color based on file type
const getFileTypeColor = (type) => {
  const colors = {
    'pdf': '#FF5252',
    'docx': '#4285F4',
    'doc': '#4285F4',
    'txt': '#0F9D58',
    'rtf': '#F4B400'
  };
  
  return colors[type.toLowerCase()] || '#888888';
};

// Helper function to format file size
const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  else return (bytes / 1048576).toFixed(1) + ' MB';
};

export default FreeTrials;