import React, { useState, useEffect } from 'react';
import { getAllDocuments } from '../../services/adminService';
import { deleteDocument, generateSummary } from '../../services/documentService';
import { toast } from 'react-toastify';
import { FaSpinner, FaTrash, FaSearch, FaEye, FaRedo } from 'react-icons/fa';
import { formatDate, formatFileSize, getFileExtension } from '../../utils/helpers';
import '../../styles/admin.css';

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [processingDocId, setProcessingDocId] = useState(null);

  useEffect(() => {
    fetchDocuments();
  }, [page]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await getAllDocuments(page, 10);
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

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDeleteClick = (doc) => {
    setDocumentToDelete(doc);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await deleteDocument(documentToDelete._id);
      if (response.success) {
        toast.success('Document deleted successfully');
        // Refresh documents list
        fetchDocuments();
      } else {
        toast.error(response.error || 'Failed to delete document');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('An error occurred while deleting document');
    } finally {
      setIsDeleteModalOpen(false);
      setDocumentToDelete(null);
    }
  };

  const handleGenerateSummary = async (documentId) => {
    setProcessingDocId(documentId);
    try {
      const response = await generateSummary(documentId);
      if (response.success) {
        toast.success('Summary generated successfully');
        // Refresh documents list to update the status
        fetchDocuments();
      } else {
        toast.error(response.error || 'Failed to generate summary');
      }
    } catch (error) {
      console.error('Error generating summary:', error);
      toast.error('An error occurred while generating summary');
    } finally {
      setProcessingDocId(null);
    }
  };

  const filteredDocuments = searchTerm
    ? documents.filter(
        (doc) =>
          doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (doc.user?.name && doc.user.name.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : documents;

  return (
    <div className="admin-documents">
      <div className="admin-page-header">
        <h1>Document Management</h1>
      </div>

      <div className="admin-controls">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search documents by name or user"
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <FaSpinner className="spinner" />
          <p>Loading documents...</p>
        </div>
      ) : (
        <div className="table-container">
          {filteredDocuments.length > 0 ? (
            <>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Document Name</th>
                    <th>User</th>
                    <th>Type</th>
                    <th>Size</th>
                    <th>Uploaded</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocuments.map((doc) => (
                    <tr key={doc._id}>
                      <td className="document-name">{doc.fileName}</td>
                      <td>{doc.user?.name || 'Unknown'}</td>
                      <td>{getFileExtension(doc.fileName).toUpperCase()}</td>
                      <td>{formatFileSize(doc.fileSize)}</td>
                      <td>{formatDate(doc.createdAt)}</td>
                      <td>
                        <span
                          className={`status-pill ${
                            doc.summary ? 'status-success' : 'status-pending'
                          }`}
                        >
                          {doc.summary ? 'Summarized' : 'Pending Summary'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <a
                            href={`/document/${doc._id}`}
                            className="btn btn-primary btn-sm"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <FaEye />
                          </a>
                          
                          {!doc.summary && (
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleGenerateSummary(doc._id)}
                              disabled={processingDocId === doc._id}
                            >
                              {processingDocId === doc._id ? (
                                <FaSpinner className="spinner-sm" />
                              ) : (
                                <FaRedo />
                              )}
                            </button>
                          )}
                          
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteClick(doc)}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

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
          ) : (
            <div className="no-data">
              {searchTerm
                ? 'No documents match your search criteria'
                : 'No documents found in the system'}
            </div>
          )}
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Confirm Deletion</h2>
            </div>
            <div className="modal-content">
              <p>
                Are you sure you want to delete document{' '}
                <strong>{documentToDelete?.fileName}</strong>?
              </p>
              <p className="warning-text">
                This action cannot be undone and will also delete any associated summary.
              </p>
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

export default Documents;