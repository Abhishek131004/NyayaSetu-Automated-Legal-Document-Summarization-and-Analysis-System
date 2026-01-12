import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Dropzone from 'react-dropzone';
import { FaFileUpload, FaSpinner, FaCheck, FaExclamationTriangle, FaLanguage } from 'react-icons/fa';
import { uploadFreeTrialDocument, getRemainingTrials, incrementTrialUsage } from '../services/freeTrialService';
import { translateToHindi } from '../services/translationService';
import '../styles/translation.css';
import '../styles/freeTrialUpload.css';
import '../styles/uploadIconStyles.css';
import '../styles/reset-animation.css';
import '../styles/summaryStyles.css';

const FreeTrialUpload = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  const [remainingTrials, setRemainingTrials] = useState(15);
  const [isHindi, setIsHindi] = useState(false);
  const [originalSummary, setOriginalSummary] = useState(null);
  const [translationLoading, setTranslationLoading] = useState(false);
  const navigate = useNavigate();
  const dropzoneRef = useRef(null);

  useEffect(() => {
    // Check remaining trials on component mount
    setRemainingTrials(getRemainingTrials());
  }, []);

  const handleDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a document to upload.');
      return;
    }

    if (remainingTrials <= 0) {
      setError('You have used all your free trials. Please register for full access.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('document', file);
      
      // Check if Hindi translation is requested directly (default to user's current language preference)
      const useHindi = isHindi;
      if (useHindi) {
        formData.append('language', 'hindi');
      }
      
      const response = await uploadFreeTrialDocument(formData, useHindi ? 'hindi' : 'english');
      
      if (response.success) {
        // Update trial count
        incrementTrialUsage();
        setRemainingTrials(getRemainingTrials());
        
        // Validate summary data
        if (response.data && response.data.summary) {
          const summaryData = response.data.summary;
          
          // Check if we got placeholder data or generic messages
          const isPlaceholder = 
            (summaryData.keyPoints && summaryData.keyPoints.some(point => 
              point.includes('sample key point') || 
              point.includes('This is a sample'))) ||
            (summaryData.summary && summaryData.summary.includes('This is a sample summary'));
            
          if (isPlaceholder) {
            toast.warning('Our AI is still learning about this type of document. The summary may be generic. For better results, please register.');
          } else {
            toast.success('Document successfully analyzed!');
          }
          
          // Check if the returned summary is already in Hindi
          const isReturnedHindi = response.data.language === 'hindi' || summaryData.language === 'hindi';
          setIsHindi(isReturnedHindi);
          
          // Set summary data
          setSummary(summaryData);
          setOriginalSummary(summaryData);
        } else {
          throw new Error('Invalid summary format received from the server');
        }
      } else {
        setError(response.error || 'Failed to analyze document');
        toast.error(response.error || 'Failed to analyze document');
      }
    } catch (err) {
      let errorMsg = err.response?.data?.message || err.message || 'Failed to process document';
      
      // Check if the error is related to API quota limits
      const isQuotaError = errorMsg.includes('quota') || 
                          errorMsg.includes('Too Many Requests') || 
                          errorMsg.includes('rate limit') ||
                          errorMsg.includes('Failed to generate summary');
      
      if (isQuotaError) {
        // Create a fallback experience with sample data
        const provideFallbackExperience = () => {
          const fallbackSummary = {
            keyPoints: [
              "This is a sample key point (AI service limit reached)",
              "Free tier usage is currently at capacity",
              "For full functionality, please register for full access",
              "Registration provides higher usage limits and priority processing"
            ],
            summary: "We're currently experiencing high demand on our AI service. This is a sample summary to demonstrate how the results would appear. To get actual summaries of your documents and avoid usage limits, please register for full access with higher processing limits and priority service."
          };
          
          // Set a sample summary so the user can see the interface
          setSummary(fallbackSummary);
          setOriginalSummary(fallbackSummary);
          
          // Show special message about using sample data
          toast.info('Showing sample summary data due to high demand. Register for full access.', { 
            autoClose: 8000,
            icon: "ℹ️"
          });
        };
        
        errorMsg = 'Our AI service is currently experiencing high demand. Please try again later or register for full access with higher limits.';
        
        // Show error toast
        toast.error(errorMsg, { 
          autoClose: 10000, // Longer display time for important message
          icon: "🚫"
        });
        
        // After showing the error, provide a fallback experience
        setTimeout(provideFallbackExperience, 1500);
      } else {
        toast.error(errorMsg);
      }
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    // Ask for confirmation to prevent accidental loss of current summary
    if (window.confirm("This will clear your current summary. Continue?")) {
      // First set summary to null to trigger the UI change
      setSummary(null);
      
      // Use a short timeout to ensure React re-renders before resetting other states
      setTimeout(() => {
        setFile(null);
        setOriginalSummary(null);
        setError(null);
        setIsHindi(false);
        
        // Show success message
        toast.info('Ready for a new document!', {
          icon: "📄",
          position: "bottom-center"
        });
        
        // Add a small delay before triggering file dialog
        setTimeout(() => {
          // Directly open the file dialog by triggering the dropzone's open method
          if (dropzoneRef.current) {
            dropzoneRef.current.open();
          }
        }, 100);
      }, 50);
    }
  };
  
  const toggleLanguage = async () => {
    try {
      setTranslationLoading(true);
      
      if (isHindi) {
        // Switch back to English - resubmit the document if we have it
        if (file && !summary) {
          // Resubmit with English request
          await handleSubmit({ preventDefault: () => {} });
        } else if (originalSummary && !originalSummary.language === 'hindi') {
          // We have the original English summary
          setSummary(originalSummary);
        } else {
          // No original English summary, need to reprocess
          toast.info('We need to reprocess your document in English. Please wait...');
          // This would ideally resubmit the document to the backend
        }
        setIsHindi(false);
      } else {
        // Translate to Hindi
        if (file && !summary) {
          // If we're just starting, submit with Hindi request
          setIsHindi(true); // Set this first so handleSubmit knows to request Hindi
          await handleSubmit({ preventDefault: () => {} });
        } else {
          // We already have a summary, translate it
          const translatedSummary = {...originalSummary};
          
          try {
            // Use the API for complete translation
            const response = await axios.post('/api/translate/term', {
              term: JSON.stringify({
                keyPoints: originalSummary.keyPoints,
                summary: originalSummary.summary
              })
            });
            
            if (response.data && response.data.success) {
              // Parse the translated JSON
              const parsed = JSON.parse(response.data.translatedTerm);
              translatedSummary.keyPoints = parsed.keyPoints;
              translatedSummary.summary = parsed.summary;
            } else {
              // Fallback to individual translations
              translatedSummary.keyPoints = await Promise.all(
                originalSummary.keyPoints.map(async point => translateToHindi(point))
              );
              translatedSummary.summary = await translateToHindi(originalSummary.summary);
            }
          } catch (error) {
            console.error('Error with API translation:', error);
            // Fallback to individual translations
            translatedSummary.keyPoints = await Promise.all(
              originalSummary.keyPoints.map(async point => translateToHindi(point))
            );
            translatedSummary.summary = await translateToHindi(originalSummary.summary);
          }
          
          setSummary(translatedSummary);
          setIsHindi(true);
        }
      }
    } catch (error) {
      console.error('Translation error:', error);
      toast.error('Translation failed. Please try again.');
    } finally {
      setTranslationLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
      <h2 className="text-2xl font-bold mb-4 text-blue-600">Try Our Document Summary For Free</h2>
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-md">Remaining free trials: <span className="font-bold">{remainingTrials}</span> of 15</p>
          {remainingTrials === 0 && (
            <button 
              onClick={() => navigate('/register')} 
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Register Now
            </button>
          )}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full" 
            style={{ width: `${(remainingTrials / 15) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Show error message if any */}
      {error && (
        <div className={`${error.includes('high demand') ? 'bg-yellow-50 border-yellow-300 text-yellow-800' : 'bg-red-50 border border-red-300 text-red-700'} px-4 py-3 rounded mb-4`}>
          <div className="flex items-center mb-2">
            <FaExclamationTriangle className="mr-2" />
            <span className="font-semibold">{error.includes('high demand') ? 'Service Temporarily Limited' : 'Error'}</span>
          </div>
          <p>{error}</p>
          
          {error.includes('high demand') && (
            <div className="mt-3 bg-blue-50 p-3 rounded border border-blue-200">
              <p className="text-blue-800 font-medium">
                Free tier usage limits have been reached. For uninterrupted access:
              </p>
              <button
                onClick={() => navigate('/register')}
                className="mt-2 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 w-full"
              >
                Register for Full Access
              </button>
            </div>
          )}
        </div>
      )}

      {!summary ? (
        <div className="reset-animation">
          {/* Upload Form - Key ensures Dropzone resets completely */}
          <Dropzone 
            key={file ? 'has-file' : 'no-file'} 
            onDrop={handleDrop} 
            ref={dropzoneRef}
            accept={{
              'application/pdf': ['.pdf'],
              'application/msword': ['.doc'],
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
              'text/plain': ['.txt'],
              'application/rtf': ['.rtf']
            }}
            disabled={loading || remainingTrials <= 0}
            noKeyboard={false}
          >
            {({getRootProps, getInputProps}) => (
              <div 
                {...getRootProps()} 
                className={`p-6 mb-2 text-center hover:bg-blue-50 transition-all duration-300 rounded-lg ${
                  remainingTrials <= 0 ? 'opacity-50' : 'hover:shadow-sm'
                }`}
                style={{ 
                  cursor: remainingTrials <= 0 ? 'not-allowed' : 'pointer', // Set cursor to pointer for the entire container
                  backgroundColor: '#f9fafb' // Very light gray background for visual distinction
                }}
              >
                <input {...getInputProps()} />
                  {/* Icon container without special click handler since the whole div is clickable now */}
                <div className="icon-container">
                  <FaFileUpload 
                    className="mx-auto text-blue-500 mb-4 upload-icon" 
                    style={{ 
                      fontSize: "5rem", 
                      height: "5rem", 
                      width: "5rem", 
                      cursor: remainingTrials <= 0 ? 'not-allowed' : 'pointer' 
                    }} 
                  />
                </div>
                
                <div className="upload-text-container py-1 px-2 mx-auto max-w-md">
                  <p className="text-gray-600 font-medium">
                    {remainingTrials <= 0 
                      ? 'No free trials remaining. Please register.' 
                      : 'No file chosen\nDrag & drop a document here, or click anywhere in this area to select one'}
                  </p>
                </div>
                <p className="text-sm text-gray-600 mt-3 font-medium">Supported formats: PDF, DOCX, DOC, TXT</p>
                {file && (
                  <div className="mt-4 p-3 bg-blue-100 rounded-lg border border-blue-300 flex items-center">
                    <FaCheck className="text-green-600 mr-2" />
                    <span className="text-sm font-medium">{file.name}</span>
                  </div>
                )}
              </div>
            )}
          </Dropzone>

          {file && remainingTrials > 0 && (
            <button
              className={`mt-5 w-full bg-blue-600 text-white py-3 px-4 rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg transition-all duration-300 ${
                loading ? 'opacity-75 cursor-not-allowed' : ''
              }`}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center text-lg">
                  <FaSpinner className="animate-spin mr-2" /> Processing...
                </span>
              ) : (
                'Generate Summary'
              )}
            </button>
          )}
        </div>
      ) : (
        <div className="mt-4">
          {/* Translation Feature Notice */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaLanguage className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>New Feature!</strong> You can now translate your summary to Hindi. Use the translation button below.
                </p>
              </div>
            </div>
          </div>
          
          {/* Summary Display */}
          <div className="summary-container free-trial-summary bg-blue-50 p-5 rounded-lg mb-4 shadow-sm">
            <div className="summary-header border-b border-blue-200 pb-4 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-center">
                <div>
                  <h3 className="font-bold text-2xl text-blue-700 mb-1 sm:mb-0">Summary Results</h3>
                  {summary && summary.keyPoints && summary.keyPoints[0] && summary.keyPoints[0].includes('AI service limit reached') && (
                    <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs inline-block mt-1">
                      Sample Data - API Limit Reached
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-sm mb-1 text-gray-600">Translate to:</p>
                  <button
                    onClick={toggleLanguage}
                    className="translation-button flex items-center gap-2 py-2 px-4 rounded text-sm font-medium border-2 border-blue-500 shadow-sm"
                    style={{
                      backgroundColor: isHindi ? '#dbeafe' : '#2563eb',
                      color: isHindi ? '#2563eb' : 'white',
                      fontSize: '14px'
                    }}
                    disabled={translationLoading}
                  >
                    <FaLanguage className="text-lg" />
                    {translationLoading ? (
                      <span className="flex items-center">
                        <FaSpinner className="animate-spin mr-1" /> 
                        Translating...
                      </span>
                    ) : (
                      <span>{isHindi ? 'Show in English' : 'हिंदी में अनुवाद करें'}</span>
                    )}
                  </button>
                  
                  <div className="mt-4">
                    <button
                      id="try-another-document-button"
                      onClick={handleReset}
                      className="bg-blue-100 text-blue-700 py-2 px-6 rounded-lg hover:bg-blue-200 shadow-sm transition-all duration-300 w-full flex items-center justify-center border border-blue-300"
                      title="Opens file selection dialog"
                    >
                      <FaFileUpload className="mr-2" /> Try Another Document
                    </button>
                    <p className="text-xs text-gray-500 mt-1 text-center">Opens file selector to upload a new document</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="summary-section mb-6 bg-white p-4 rounded-md shadow-sm">
              <h4 className="font-semibold text-lg text-blue-600 mb-3 border-b border-gray-200 pb-2">{isHindi ? 'मुख्य बिंदु:' : 'Key Points:'}</h4>
              <ul className="list-disc pl-6 space-y-2">
                {summary.keyPoints.map((point, index) => (
                  <li key={index} className={`${isHindi ? 'font-hindi' : ''} text-gray-800 leading-relaxed`}>{point}</li>
                ))}
              </ul>
            </div>
            
            <div className="summary-section bg-white p-4 rounded-md shadow-sm">
              <h4 className="font-semibold text-lg text-blue-600 mb-3 border-b border-gray-200 pb-2">{isHindi ? 'सारांश:' : 'Summary:'}</h4>
              <p className={`text-gray-800 leading-relaxed ${isHindi ? 'font-hindi' : ''}`}>{summary.summary}</p>
            </div>
          </div>
          
          <div className="flex justify-center mt-6">
            <button
              onClick={() => navigate('/register')}
              className="bg-blue-600 text-white py-2 px-8 rounded-lg hover:bg-blue-700 shadow-md transition-all duration-300 mx-auto"
              style={{ width: '60%', maxWidth: '300px' }}
            >
              Register for Full Access
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FreeTrialUpload;