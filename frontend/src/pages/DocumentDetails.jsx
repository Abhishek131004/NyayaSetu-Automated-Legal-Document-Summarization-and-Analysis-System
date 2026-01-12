import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getDocumentDetails, generateSummary, deleteDocument } from '../services/documentService';
import { formatDate, getFileExtension } from '../utils/helpers';
import { toast } from 'react-toastify';
import { FaSpinner, FaFileAlt, FaArrowLeft, FaTrash, FaRedo, FaLanguage, FaRobot, FaBook } from 'react-icons/fa';
import { translateDocumentSummary, isHindi } from '../services/translationService';
import '../styles/documentDetails.css';
import '../styles/translation.css';
import '../styles/summaryStyles.css';

const DocumentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [originalDocument, setOriginalDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [summarizing, setSummarizing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [showHindi, setShowHindi] = useState(false);
  const [translationLoading, setTranslationLoading] = useState(false);
  const [translatedDocument, setTranslatedDocument] = useState(null);
  const [useAI, setUseAI] = useState(true);
  
  useEffect(() => {
    fetchDocumentDetails();
  }, [id]);
  
  const fetchDocumentDetails = async () => {
    setLoading(true);
    try {
      const response = await getDocumentDetails(id);
      if (response.success) {
        setDocument(response.data.document);
        setOriginalDocument(response.data.document);
      } else {
        toast.error('Failed to load document details');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error fetching document details:', error);
      toast.error('An error occurred while loading document');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };
  
  const handleGenerateSummary = async () => {
    setSummarizing(true);
    try {
      const response = await generateSummary(id);
      if (response.success) {
        toast.success('Summary generated successfully!');
        // Refresh document details to show the summary
        fetchDocumentDetails();
      } else {
        toast.error(response.error || 'Failed to generate summary');
      }
    } catch (error) {
      console.error('Error generating summary:', error);
      toast.error('An error occurred while generating summary');
    } finally {
      setSummarizing(false);
    }
  };
  
  const toggleLanguage = async () => {
    try {
      setTranslationLoading(true);
      
      if (showHindi) {
        // Switch back to English
        setDocument(originalDocument);
        setShowHindi(false);
        toast.info('Showing summary in English');
      } else {
        // Translate to Hindi
        if (!originalDocument || !originalDocument.summary) {
          toast.error('No summary available to translate');
          return;
        }
        
        // If we already have a translation, use it
        if (translatedDocument) {
          setDocument({...originalDocument, summary: translatedDocument});
          setShowHindi(true);
          toast.success('Summary displayed in Hindi');
          return;
        }
        
        // Always use AI for complete word-by-word translation (regardless of toggle)
        const forceAI = true;
        
        // Always enforce complete translation for registered users
        const completeTranslation = true;
        
        // Show an informative message while waiting
        toast.info('Translating every word to Hindi, please wait...', { autoClose: 3000 });
        
        // Fetch a new translation from the API with complete translation flag
        const response = await translateDocumentSummary(id, forceAI, completeTranslation);
        
        if (response.success) {
          const translatedDoc = JSON.parse(JSON.stringify(originalDocument)); // Deep clone
          translatedDoc.summary = response.translatedSummary;
          
          setTranslatedDocument(response.translatedSummary);
          setDocument(translatedDoc);
          setShowHindi(true);
          
          // More comprehensive check for any remaining English words
          const containsEnglish = (text) => {
            if (!text) return false;
            // Look for words with 3+ Latin characters
            return /[a-zA-Z]{3,}/.test(text);
          };
          
          // Enhanced validation for all summary fields
          const fieldsToCheck = [
            { name: 'Document Overview', content: response.translatedSummary.documentOverview },
            ...(response.translatedSummary.keyParties || []).map((item, i) => ({ 
              name: `Key Party ${i+1}`, content: item 
            })),
            ...(response.translatedSummary.importantClauses || []).map((item, i) => ({ 
              name: `Important Clause ${i+1}`, content: item 
            })),
            ...(response.translatedSummary.criticalDates || []).map((item, i) => ({ 
              name: `Critical Date ${i+1}`, content: item 
            })),
            ...(response.translatedSummary.potentialConcerns || []).map((item, i) => ({ 
              name: `Potential Concern ${i+1}`, content: item 
            })),
            { name: 'Plain Language Summary', content: response.translatedSummary.plainLanguageSummary }
          ];
          
          // Find problematic fields
          const englishFields = fieldsToCheck
            .filter(field => field.content && containsEnglish(field.content))
            .map(field => field.name);
          
          if (englishFields.length > 0) {
            console.warn('Fields with English words:', englishFields);
            toast.warning(`हिंदी अनुवाद पूरा हुआ, लेकिन कुछ अंग्रेजी शब्द अभी भी बाकी हैं। हम अपनी प्रणाली को निरंतर सुधार रहे हैं।`, { autoClose: 5000 });
          } else {
            toast.success('सारांश का 100% हिंदी शब्दों में सफलतापूर्वक अनुवाद किया गया!');
          }
        } else {
          throw new Error(response.message || 'Translation failed');
        }
      }
    } catch (error) {
      console.error('Translation error:', error);
      toast.error('Failed to translate summary: ' + error.message);
    } finally {
      setTranslationLoading(false);
    }
  };
  
  // Toggle between AI and dictionary-based translation
  const toggleTranslationMode = () => {
    setUseAI(!useAI);
    // Clear any existing translation when changing modes
    if (translatedDocument) {
      setTranslatedDocument(null);
      if (showHindi) {
        setDocument(originalDocument);
        setShowHindi(false);
      }
      toast.info(`Translation mode set to ${!useAI ? 'AI' : 'Dictionary'}`);
    }
  };
  
  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    try {
      const response = await deleteDocument(id);
      if (response.success) {
        toast.success('Document deleted successfully');
        navigate('/dashboard');
      } else {
        toast.error(response.error || 'Failed to delete document');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('An error occurred while deleting document');
    } finally {
      setIsDeleteModalOpen(false);
    }
  };
  
  if (loading) {
    return (
      <div className="loading-container">
        <FaSpinner className="spinner" />
        <p>Loading document details...</p>
      </div>
    );
  }
  
  return (
    <div className="document-details-container">
      <div className="document-details-header">
        <Link to="/dashboard" className="btn btn-outline btn-sm">
          <FaArrowLeft /> Back to Dashboard
        </Link>
        <div className="document-actions">
          {!document.summary && (
            <button
              className="btn btn-primary btn-sm"
              onClick={handleGenerateSummary}
              disabled={summarizing}
            >
              {summarizing ? (
                <>
                  <FaSpinner className="spinner" /> Generating...
                </>
              ) : (
                <>
                  <FaRedo /> Generate Summary
                </>
              )}
            </button>
          )}
          <button
            className="btn btn-outline btn-danger btn-sm"
            onClick={handleDeleteClick}
          >
            <FaTrash /> Delete
          </button>
        </div>
      </div>
      
      <div className="document-details-content">
        <div className="document-info-card">
          <div className="document-icon-large">
            <FaFileAlt />
          </div>
          <h1 className="document-title">{document.fileName}</h1>
          <div className="document-meta-details">
            <div className="meta-item">
              <span className="meta-label">File Type:</span>
              <span className="meta-value">{getFileExtension(document.fileName).toUpperCase()}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Uploaded:</span>
              <span className="meta-value">{formatDate(document.createdAt)}</span>
            </div>
            {document.summary && (
              <div className="meta-item">
                <span className="meta-label">Summarized:</span>
                <span className="meta-value">{formatDate(document.summary.createdAt)}</span>
              </div>
            )}
          </div>
        </div>
        
        {document.summary ? (
          <div className="summary-container">
            <div className="new-feature-banner">
              <FaLanguage className="feature-icon" />
              <div className="feature-text">
                <strong>New Feature!</strong> Translate your summary to Hindi with a single click.
              </div>
            </div>
            
            <div className="summary-header bg-white p-5 rounded-lg mb-5 shadow-sm">
              <div className="summary-header-content">
                <h2 className="text-2xl font-bold text-blue-800 mb-4">{showHindi ? 'दस्तावेज़ सारांश' : 'Document Summary'}</h2>
                <div className="translation-controls flex flex-col sm:flex-row justify-between items-center gap-4 mt-3 p-3 bg-blue-50 rounded-md">
                  <div className="translation-mode">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Translation Method:</label>
                    <button
                      onClick={toggleTranslationMode}
                      disabled={translationLoading}
                      className={`translation-mode-button flex items-center gap-2 py-2 px-3 rounded text-sm font-medium border-2 ${
                        useAI 
                          ? 'border-purple-500 bg-purple-100 text-purple-700' 
                          : 'border-blue-500 bg-blue-100 text-blue-700'
                      }`}
                      title={useAI ? 'Using AI for more accurate translations' : 'Using dictionary-based translation'}
                    >
                      {useAI ? (
                        <><FaRobot className="text-lg" /> AI Translation</>
                      ) : (
                        <><FaBook className="text-lg" /> Dictionary Translation</>
                      )}
                    </button>
                  </div>
                  <div className="translation-control">
                    <label className="block text-sm font-medium text-gray-600 mb-1">{showHindi ? 'भाषा:' : 'Language:'}</label>
                    <button
                      onClick={toggleLanguage}
                      disabled={translationLoading}
                      className={`translation-button flex items-center gap-2 py-2 px-4 rounded text-sm font-medium border-2 ${
                        showHindi 
                          ? 'border-blue-500 bg-blue-50 text-blue-700' 
                          : 'border-blue-500 bg-blue-600 text-white'
                      }`}
                    >
                      {translationLoading ? (
                        <><FaSpinner className="spin-animation text-lg" /> {showHindi ? 'Translating...' : 'अनुवाद कर रहा है...'}</>
                      ) : (
                        <><FaLanguage className="text-lg" /> {showHindi ? 'Show in English' : 'हिंदी में अनुवाद करें'}</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="summary-section bg-white p-5 rounded-lg mb-5 shadow-sm">
              <h3 className="text-xl font-semibold text-blue-700 mb-3 pb-2 border-b border-gray-200">{showHindi ? 'दस्तावेज़ अवलोकन' : 'Document Overview'}</h3>
              <div className="summary-content">
                <p className={`${showHindi ? 'font-hindi' : ''} text-gray-800 leading-relaxed`}>{document.summary.documentOverview}</p>
              </div>
            </div>
            
            <div className="summary-section bg-white p-5 rounded-lg mb-5 shadow-sm">
              <h3 className="text-xl font-semibold text-blue-700 mb-3 pb-2 border-b border-gray-200">{showHindi ? 'मुख्य पक्ष' : 'Key Parties'}</h3>
              <div className="summary-content">
                <ul className="parties-list list-disc pl-6 space-y-2">
                  {document.summary.keyParties && document.summary.keyParties.map((party, index) => (
                    <li key={index} className={`${showHindi ? 'font-hindi' : ''} text-gray-800 leading-relaxed`}>{party}</li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="summary-section bg-white p-5 rounded-lg mb-5 shadow-sm">
              <h3 className="text-xl font-semibold text-blue-700 mb-3 pb-2 border-b border-gray-200">{showHindi ? 'महत्वपूर्ण खंड' : 'Important Clauses'}</h3>
              <div className="summary-content">
                <ul className="clauses-list list-disc pl-6 space-y-2">
                  {document.summary.importantClauses && document.summary.importantClauses.map((clause, index) => (
                    <li key={index} className={`${showHindi ? 'font-hindi' : ''} text-gray-800 leading-relaxed`}>{clause}</li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Obligations section has been removed */}
            
            <div className="summary-section">
              <h3>{showHindi ? 'महत्वपूर्ण तिथियां' : 'Critical Dates'}</h3>
              <div className="summary-content">
                <ul className="dates-list">
                  {document.summary.criticalDates && document.summary.criticalDates.map((date, index) => (
                    <li key={index} className={showHindi ? 'font-hindi' : ''}>{date}</li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="summary-section">
              <h3>{showHindi ? 'संभावित चिंताएं' : 'Potential Concerns'}</h3>
              <div className="summary-content">
                <ul className="concerns-list">
                  {document.summary.potentialConcerns && document.summary.potentialConcerns.map((concern, index) => (
                    <li key={index} className={showHindi ? 'font-hindi' : ''}>{concern}</li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="summary-section">
              <h3>{showHindi ? 'सरल भाषा सारांश' : 'Plain Language Summary'}</h3>
              <div className="summary-content">
                <p className={showHindi ? 'font-hindi' : ''}>{document.summary.plainLanguageSummary}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="no-summary-container">
            <h2>No Summary Available</h2>
            <p>
              This document hasn't been summarized yet. Generate a summary to get AI-powered
              insights into the legal content.
            </p>
            <button
              className="btn btn-primary"
              onClick={handleGenerateSummary}
              disabled={summarizing}
            >
              {summarizing ? (
                <>
                  <FaSpinner className="spinner" /> Generating Summary...
                </>
              ) : (
                <>
                  <FaRedo /> Generate Summary
                </>
              )}
            </button>
          </div>
        )}
      </div>
      
      {isDeleteModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Confirm Deletion</h2>
            </div>
            <div className="modal-content">
              <p>Are you sure you want to delete <strong>{document.fileName}</strong>?</p>
              <p className="warning-text">This action cannot be undone and will delete the document and its summary.</p>
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

export default DocumentDetails;