import axios from 'axios';

const API_URL = '/api/free-trial';

/**
 * Upload a document for free trial summarization
 * @param {FormData} formData - Form data with file
 * @param {string} language - The language to generate the summary in ('hindi' or 'english')
 * @returns {Promise} - API response
 */
export const uploadFreeTrialDocument = async (formData, language = 'english') => {
  try {
    const response = await axios.post(`${API_URL}/upload?language=${language}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Free trial upload error:', error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to upload document. Please try again.' 
    };
  }
};

/**
 * Get the remaining trial attempts from localStorage
 * @returns {number} - Number of remaining attempts (0-15)
 */
export const getRemainingTrials = () => {
  const usedTrials = parseInt(localStorage.getItem('freeTrialsUsed') || '0');
  return Math.max(0, 15 - usedTrials);
};

/**
 * Update the count of used trials in localStorage
 */
export const incrementTrialUsage = () => {
  const usedTrials = parseInt(localStorage.getItem('freeTrialsUsed') || '0');
  localStorage.setItem('freeTrialsUsed', Math.min(15, usedTrials + 1).toString());
};