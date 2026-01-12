/**
 * Translation service for converting text between languages
 * Currently supports English to Hindi translation
 */

import axios from 'axios';

// API endpoint base
const API_BASE_URL = '/api/translate';

/**
 * Translates a document summary to Hindi using the backend service
 * Ensures complete word-by-word translation for registered users
 * 
 * @param {string} documentId - The ID of the document to translate its summary
 * @param {boolean} useAI - Whether to use AI for more accurate translation (default: true)
 * @param {boolean} completeTranslation - Whether to ensure every word is translated (default: true)
 * @returns {Promise<Object>} - The translated summary
 */
export const translateDocumentSummary = async (documentId, useAI = true, completeTranslation = true) => {
  try {
    // Always set completeTranslation to true for registered users
    completeTranslation = true;
    
    console.log(`Requesting translation for document ${documentId} with completeTranslation=${completeTranslation}`);
    
    // Add extra parameters to indicate we want complete word-by-word translation
    const response = await axios.get(`${API_BASE_URL}/documents/${documentId}/translate`, {
      params: { 
        useAI,
        completeTranslation,
        forceComplete: true,  // Additional flag to ensure backend understands the importance
        timestamp: new Date().getTime() // Prevent caching issues
      },
      headers: {
        'Content-Type': 'application/json',
        'X-Translation-Mode': 'complete' // Custom header for additional clarity
      }
    });
    
    // Check if the response has any English words left in key sections
    const containsEnglish = (text) => {
      if (!text || typeof text !== 'string') return false;
      return /[a-zA-Z]{3,}/.test(text);
    };
    
    if (response.data.translatedSummary) {
      // Check multiple fields for English content
      const fieldsToCheck = [
        response.data.translatedSummary.documentOverview,
        ...(response.data.translatedSummary.keyParties || []),
        ...(response.data.translatedSummary.importantClauses || []),
        ...(response.data.translatedSummary.criticalDates || []),
        ...(response.data.translatedSummary.potentialConcerns || []),
        response.data.translatedSummary.plainLanguageSummary
      ];
      
      // Check if any field contains English
      const fieldsWithEnglish = fieldsToCheck.filter(field => containsEnglish(field));
      
      if (fieldsWithEnglish.length > 0) {
        console.warn(`Translation contains ${fieldsWithEnglish.length} field(s) with English words`);
        
        // Log the fields with English for debugging purposes
        fieldsWithEnglish.forEach((field, index) => {
          console.warn(`Field ${index+1} with English words: "${field.substring(0, 100)}..."`);
        });
      }
    }
    
    return response.data;
  } catch (error) {
    console.error('Error translating document summary:', error);
    throw new Error(error.response?.data?.message || 'Failed to translate summary');
  }
};

/**
 * Translates specific text from a document to Hindi
 * 
 * @param {string} documentId - The ID of the document 
 * @param {string|null} text - Specific text to translate (optional)
 * @param {string|null} section - Specific document section to translate (optional)
 * @returns {Promise<Object>} - The translated text
 */
export const translateDocumentText = async (documentId, text = null, section = null) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/documents/${documentId}/translate-text`, {
      text,
      section
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error translating document text:', error);
    throw new Error(error.response?.data?.message || 'Failed to translate text');
  }
};

/**
 * Translates a specific legal term to Hindi
 * 
 * @param {string} term - The legal term to translate
 * @returns {Promise<Object>} - The translated term
 */
export const translateLegalTerm = async (term) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/term`, {
      term
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error translating legal term:', error);
    throw new Error(error.response?.data?.message || 'Failed to translate term');
  }
};

/**
 * Checks if text is in Hindi
 * 
 * @param {string} text - The text to check
 * @returns {boolean} - True if the text contains Hindi characters
 */
export const isHindi = (text) => {
  // Check if the text contains Hindi Unicode characters
  const hindiPattern = /[\u0900-\u097F]/;
  return hindiPattern.test(text);
};

/**
 * Legacy function for basic Hindi translation
 * Maintained for backwards compatibility with existing components
 * 
 * @param {string} text - The English text to translate
 * @returns {Promise<string>} - The Hindi translation (using basic dictionary approach)
 */
export const translateToHindi = async (text) => {
  if (!text) return "";
  
  try {
    // Try to use the API first for better translations
    const response = await axios.post(`/api/translate/term`, {
      term: text
    });
    
    if (response.data && response.data.success) {
      return response.data.translatedTerm;
    }
  } catch (error) {
    console.warn('API translation failed, falling back to basic dictionary', error);
    // Fallback to a basic translation approach if API fails
  }
  
  // Basic Hindi translation dictionary for fallback
  const basicDictionary = {
    "document": "दस्तावेज़",
    "summary": "सारांश",
    "key points": "मुख्य बिंदु",
    "agreement": "समझौता",
    "contract": "अनुबंध",
    "legal": "कानूनी",
    "important": "महत्वपूर्ण",
    "date": "तारीख",
    "party": "पक्ष",
    "parties": "पक्षों",
    "clause": "खंड",
    "section": "धारा",
    "article": "अनुच्छेद",
    "rights": "अधिकार",
    "obligations": "दायित्व",
    "is": "है",
    "are": "हैं",
    "for": "के लिए",
    "with": "के साथ",
    "and": "और",
    "or": "या",
    "the": "यह"
  };
  
  // Simple word replacement (not grammatically accurate but functional)
  let translatedText = text;
  Object.entries(basicDictionary).forEach(([english, hindi]) => {
    const regex = new RegExp(`\\b${english}\\b`, 'gi');
    translatedText = translatedText.replace(regex, hindi);
  });
  
  // Force a short delay to ensure users see the loading state
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(translatedText);
    }, 300);
  });
};

/**
 * Upload a document for free trial with optional Hindi translation
 * 
 * @param {FormData} formData - The form data with the document file
 * @param {string} language - The language to use for the summary ('hindi' or 'english')
 * @returns {Promise<Object>} - The document summary response
 */
export const uploadFreeTrialWithTranslation = async (formData, language = 'english') => {
  try {
    const response = await axios.post(`/api/free-trial/upload?language=${language}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error uploading document with translation:', error);
    throw new Error(error.response?.data?.message || 'Failed to upload and translate document');
  }
};