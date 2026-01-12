import React from 'react';
import '../styles/footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <h2>NyayaSetu</h2>
            <p>Advanced legal document analysis and summarization powered by AI.</p>
          </div>
          
          <div className="footer-links">
            <div className="footer-section">
              <h3>Resources</h3>
              <ul>
                <li><a href="#">Help Center</a></li>
                <li><a href="#">Documentation</a></li>
                <li><a href="#">API</a></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h3>Company</h3>
              <ul>
                <li><a href="#">About</a></li>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Service</a></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h3>Contact</h3>
              <ul>
                <li><a href="mailto:support@nyayasetu.com">support@nyayasetu.com</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {currentYear} NyayaSetu. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;