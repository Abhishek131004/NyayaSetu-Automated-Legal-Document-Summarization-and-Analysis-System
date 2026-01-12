import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadDocument, generateSummary } from '../services/documentService';
import { toast } from 'react-toastify';
import { useDropzone } from 'react-dropzone';
import { isSupportedFileType, formatFileSize } from '../utils/helpers';
import { FaUpload, FaFileUpload, FaSpinner, FaTimes } from 'react-icons/fa';
import '../styles/upload.css';

const UploadDocument = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  
  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    
    if (!file) return;
    
    // Check file type
    if (!isSupportedFileType(file.type)) {
      toast.error('Unsupported file type. Please upload a PDF, DOCX, RTF, or TXT file.');
      return;
    }
    
    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File is too large. Maximum file size is 10MB.');
      return;
    }
    
    setSelectedFile(file);
  };
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'application/rtf': ['.rtf']
    },
    multiple: false
  });
  
  const handleRemoveFile = () => {
    setSelectedFile(null);
  };
  
  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to upload.');
      return;
    }
    
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      const response = await uploadDocument(formData);
      
      if (response.success) {
        toast.success('Document uploaded successfully!');
        
        // Option to generate summary immediately
        const shouldSummarize = window.confirm('Do you want to generate a summary now?');
        
        if (shouldSummarize) {
          await handleSummarize(response.data.document._id);
        } else {
          navigate('/dashboard');
        }
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('An error occurred during upload. Please try again.');
    } finally {
      setUploading(false);
    }
  };
  
  const handleSummarize = async (documentId) => {
    setSummarizing(true);
    
    try {
      const response = await generateSummary(documentId);
      
      if (response.success) {
        toast.success('Summary generated successfully!');
        navigate(`/document/${documentId}`);
      } else {
        toast.error(response.error);
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Summarize error:', error);
      toast.error('An error occurred while generating summary. You can try again later from your dashboard.');
      navigate('/dashboard');
    } finally {
      setSummarizing(false);
    }
  };
  
  return (
    <div className="upload-container">
      <div className="upload-header">
        <h1>Upload Document</h1>
        <p>Upload a legal document to generate an AI-powered summary</p>
      </div>
      
      <div className="upload-content">
        <div className="upload-instructions">
          <h2>Supported Document Types</h2>
          <ul className="file-types">
            <li>PDF Documents (.pdf)</li>
            <li>Word Documents (.doc, .docx)</li>
            <li>Text Files (.txt)</li>
            <li>Rich Text Format (.rtf)</li>
          </ul>
          <p className="file-limit">Maximum file size: 10MB</p>
        </div>
        
        {!selectedFile ? (
          <div {...getRootProps({ className: `dropzone ${isDragActive ? 'active' : ''}` })}>
            <input {...getInputProps()} />
            <FaFileUpload className="upload-icon" />
            <p className="dropzone-text">
              {isDragActive
                ? 'Drop the file here...'
                : 'Drag & drop a file here, or click to select'}
            </p>
          </div>
        ) : (
          <div className="selected-file">
            <div className="file-info">
              <span className="file-name">{selectedFile.name}</span>
              <span className="file-size">{formatFileSize(selectedFile.size)}</span>
            </div>
            <button className="btn-remove" onClick={handleRemoveFile}>
              <FaTimes />
            </button>
          </div>
        )}
        
        <div className="upload-actions">
          <button
            className="btn btn-primary btn-lg"
            onClick={handleUpload}
            disabled={!selectedFile || uploading || summarizing}
          >
            {uploading ? (
              <>
                <FaSpinner className="spinner" /> Uploading...
              </>
            ) : summarizing ? (
              <>
                <FaSpinner className="spinner" /> Generating Summary...
              </>
            ) : (
              <>
                <FaUpload /> Upload Document
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadDocument;