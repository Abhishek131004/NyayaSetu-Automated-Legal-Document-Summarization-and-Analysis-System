import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserDocuments, deleteDocument } from '../services/documentService';
import { formatDate, formatFileSize, getFileExtension } from '../utils/helpers';
import { FaPlus, FaEye, FaTrash, FaSpinner, FaFileAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import '../styles/dashboard.css';

const Dashboard = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  
  useEffect(() => {
    fetchDocuments();
  }, [page]);
  
  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await getUserDocuments(page, 10);
      if (response.success) {
        setDocuments(response.data.documents);
        setTotalPages(Math.ceil(response.data.total / 10));
      } else {
        toast.error('Failed to load documents');
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('An error occurred while loading documents');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteClick = (doc) => {
    setDocumentToDelete(doc);
    setIsDeleteModalOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    try {
      // Call the API to delete the document
      const response = await deleteDocument(documentToDelete._id);
      
      if (response.success) {
        setIsDeleteModalOpen(false);
        setDocumentToDelete(null);
        // Refresh documents
        fetchDocuments();
        toast.success('Document deleted successfully');
      } else {
        toast.error(response.error || 'Failed to delete document');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    }
  };
  
  const getDocumentIcon = (fileType) => {
    // This is a simplified version, you might want to add more file type icons
    return <FaFileAlt />;
  };
  
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>My Documents</h1>
        <Link to="/upload" className="btn btn-primary">
          <FaPlus /> Upload New Document
        </Link>
      </div>
      
      {loading ? (
        <div className="loading-container">
          <FaSpinner className="spinner" />
          <p>Loading your documents...</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="empty-state">
          <FaFileAlt className="empty-icon" />
          <h2>No Documents Found</h2>
          <p>You haven't uploaded any documents yet. Get started by uploading your first document.</p>
          <Link to="/upload" className="btn btn-primary">
            Upload Your First Document
          </Link>
        </div>
      ) : (
        <>
          <div className="documents-grid">
            {documents.map((doc) => (
              <div className="document-card" key={doc._id}>
                <div className="document-icon">
                  {getDocumentIcon(doc.fileType)}
                </div>
                <div className="document-info">
                  <h3 className="document-title">{doc.fileName}</h3>
                  <p className="document-meta">
                    {formatFileSize(doc.fileSize)} • {getFileExtension(doc.fileName).toUpperCase()} • 
                    Uploaded {formatDate(doc.createdAt)}
                  </p>
                  <div className="document-status">
                    <span className={`status-badge ${doc.summary ? 'status-success' : 'status-pending'}`}>
                      {doc.summary ? 'Summarized' : 'Pending Summary'}
                    </span>
                  </div>
                </div>
                <div className="document-actions">
                  <Link to={`/document/${doc._id}`} className="btn btn-primary btn-sm">
                    <FaEye /> View
                  </Link>
                  <button
                    className="btn btn-outline btn-sm btn-danger"
                    onClick={() => handleDeleteClick(doc)}
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-outline"
                disabled={page === 1}
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              >
                Previous
              </button>
              <span className="pagination-info">
                Page {page} of {totalPages}
              </span>
              <button
                className="btn btn-outline"
                disabled={page === totalPages}
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
      
      {isDeleteModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Confirm Deletion</h2>
            </div>
            <div className="modal-content">
              <p>Are you sure you want to delete <strong>{documentToDelete?.fileName}</strong>?</p>
              <p className="warning-text">This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-outline"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDeleteConfirm}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;