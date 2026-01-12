import axios from 'axios';

const API_URL = '/api/admin';

/**
 * Get all users (admin only)
 * @param {number} page - Page number for pagination
 * @param {number} limit - Number of items per page
 * @returns {Promise} - API response
 */
export const getAllUsers = async (page = 1, limit = 10) => {
  try {
    const response = await axios.get(`${API_URL}/users?page=${page}&limit=${limit}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Get users error:', error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to fetch users.' 
    };
  }
};

/**
 * Get all documents (admin only)
 * @param {number} page - Page number for pagination
 * @param {number} limit - Number of items per page
 * @returns {Promise} - API response
 */
export const getAllDocuments = async (page = 1, limit = 10) => {
  try {
    const response = await axios.get(`${API_URL}/documents?page=${page}&limit=${limit}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Get all documents error:', error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to fetch documents.' 
    };
  }
};

/**
 * Get dashboard stats (admin only)
 * @returns {Promise} - API response
 */
export const getDashboardStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/stats`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Get stats error:', error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to fetch dashboard statistics.' 
    };
  }
};

/**
 * Delete a user (admin only)
 * @param {string} id - User ID
 * @returns {Promise} - API response
 */
export const deleteUser = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/users/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Delete user error:', error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to delete user.' 
    };
  }
};

/**
 * Get free trial usage statistics (admin only)
 * @param {number} page - Page number for pagination
 * @param {number} limit - Number of items per page
 * @returns {Promise} - API response
 */
export const getFreeTrialStats = async (page = 1, limit = 20) => {
  try {
    const response = await axios.get(`${API_URL}/free-trials?page=${page}&limit=${limit}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Get free trial stats error:', error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to fetch free trial statistics.' 
    };
  }
};