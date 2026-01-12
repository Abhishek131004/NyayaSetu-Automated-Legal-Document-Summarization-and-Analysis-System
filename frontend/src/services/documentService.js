import axios from 'axios';

const API_URL = '/api/documents';

/**
 * Upload a document for summarization
 * @param {FormData} formData - Form data with file
 * @returns {Promise} - API response
 */
export const uploadDocument = async (formData) => {
  try {
    const response = await axios.post(`${API_URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Document upload error:', error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to upload document. Please try again.' 
    };
  }
};

/**
 * Get user's documents
 * @param {number} page - Page number for pagination
 * @param {number} limit - Number of items per page
 * @returns {Promise} - API response
 */
export const getUserDocuments = async (page = 1, limit = 10) => {
  try {
    const response = await axios.get(`${API_URL}/user?page=${page}&limit=${limit}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Get documents error:', error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to fetch documents.' 
    };
  }
};

/**
 * Get single document details including summary
 * @param {string} id - Document ID
 * @returns {Promise} - API response
 */
export const getDocumentDetails = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Get document details error:', error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to fetch document details.' 
    };
  }
};

/**
 * Generate summary for a document
 * @param {string} id - Document ID
 * @returns {Promise} - API response
 */
export const generateSummary = async (id) => {
  try {
    const response = await axios.post(`${API_URL}/${id}/summarize`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Summary generation error:', error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to generate summary. Please try again.' 
    };
  }
};

/**
 * Delete a document
 * @param {string} id - Document ID
 * @returns {Promise} - API response
 */
export const deleteDocument = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Delete document error:', error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to delete document.' 
    };
  }
};