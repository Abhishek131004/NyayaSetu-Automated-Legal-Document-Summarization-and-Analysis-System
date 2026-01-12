import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaRocket, FaLock, FaFileAlt, FaListUl, 
  FaUpload, FaCogs, FaCheckCircle, FaUserTie, FaBalanceScale, FaBuilding 
} from 'react-icons/fa';
import '../styles/landingPage.css';
import '../styles/imageLoader.css';
import '../styles/responsive-fixes.css';
import { getRemainingTrials } from '../services/freeTrialService';
import FreeTrialUpload from '../components/FreeTrialUpload';

// Import local illustrations
import uploadIllustration from '../assets/images/landing/document-upload.svg';
import aiProcessingIllustration from '../assets/images/landing/ai-processing.svg';
import summaryIllustration from '../assets/images/landing/document-summary.svg';

const LandingPage = () => {
  const [attemptsLeft, setAttemptsLeft] = useState(15);
  const [imagesLoaded, setImagesLoaded] = useState({
    upload: false,
    processing: false,
    summary: false
  });

  useEffect(() => {
    // Get remaining free attempts
    const remainingTrials = getRemainingTrials();
    setAttemptsLeft(remainingTrials);
    
    // Add smooth scrolling behavior
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Ensure proper viewport height for mobile browsers
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    
    // Update on resize
    const handleResize = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="landing-page">
      <section className="hero-section">
        <div className="hero-content">
          <h1>NyayaSetu - Legal Document Summarizer</h1>
          <p className="hero-subtitle">
            Transform complex legal documents into clear, concise summaries in seconds
          </p>
          <div className="hero-buttons">
            <Link to="/register" className="btn btn-primary">
              Sign Up Free
            </Link>
            <Link to="/login" className="btn btn-outline">
              Log In
            </Link>
          </div>
        </div>
      </section>
      
      <section className="try-free-section top-section">
        <div className="try-free-container">
          <div className="try-free-content">
            <h2 className="text-3xl font-bold mb-3 text-blue-600 try-it-free-heading">Try It Free</h2>
            <p className="text-lg mb-4">
              Upload a legal document and get a free summary. No sign-up required.
              <br />
              <span className="attempts-left font-semibold text-blue-600">
                {attemptsLeft > 0 
                  ? `You have ${attemptsLeft} free ${attemptsLeft === 1 ? 'attempt' : 'attempts'} left` 
                  : 'You have used all your free attempts. Please sign up to continue.'}
              </span>
            </p>
            
            <FreeTrialUpload />
          </div>
        </div>
      </section>
      
      <section className="features-section">
  <h2>Why Choose NyayaSetu?</h2>
        <div className="features-container">
          <div className="feature-card">
            <div className="feature-icon">
              <FaRocket />
            </div>
            <h3>AI-Powered Analysis</h3>
            <p>
              Our advanced AI analyzes legal documents to extract key information, saving you hours of reading.
            </p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <FaFileAlt />
            </div>
            <h3>Comprehensive Summaries</h3>
            <p>
              Get detailed breakdowns of key parties, clauses, obligations, dates, and potential concerns.
            </p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <FaListUl />
            </div>
            <h3>Plain Language</h3>
            <p>
              Complex legal jargon translated into simple, understandable language.
            </p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <FaLock />
            </div>
            <h3>Secure & Confidential</h3>
            <p>
              Your documents are handled with enterprise-grade security and never shared with third parties.
            </p>
          </div>
        </div>
      </section>

      <section className="how-it-works-section">
  <h2>How NyayaSetu Works</h2>
        <div className="workflow-container">
          <div className="workflow-step">
            <div className="workflow-image" data-fallback-text="Upload any legal document - PDF, DOCX, DOC, RTF, and TXT formats supported">
              {!imagesLoaded.upload && <div className="loading-image-indicator"></div>}
              <img 
                src={uploadIllustration} 
                alt="Upload your legal document"
                style={{ maxWidth: '100%' }}
                onLoad={() => setImagesLoaded(prev => ({ ...prev, upload: true }))}
                onError={(e) => {
                  e.target.classList.add('error');
                  e.target.src = '';
                  setImagesLoaded(prev => ({ ...prev, upload: true }));
                }} 
              />
            </div>
            <div className="workflow-content">
              <div className="step-number">1</div>
              <h3>Upload Your Document</h3>
              <p>
                Simply upload any legal document - contract, agreement, legal brief, or court filing.
                We support PDF, DOCX, DOC, RTF, and TXT formats.
              </p>
            </div>
          </div>

          <div className="workflow-step reverse">
            <div className="workflow-content">
              <div className="step-number">2</div>
              <h3>AI-Powered Processing</h3>
              <p>
                Our sophisticated AI model, trained specifically on legal texts, analyzes the document structure,
                identifies key clauses, obligations, parties, and important dates.
              </p>
            </div>
            <div className="workflow-image" data-fallback-text="Our AI analyzes document structure, identifies key clauses, obligations, parties, and important dates">
              {!imagesLoaded.processing && <div className="loading-image-indicator"></div>}
              <img 
                src={aiProcessingIllustration} 
                alt="AI processing your document"
                style={{ maxWidth: '100%' }}
                onLoad={() => setImagesLoaded(prev => ({ ...prev, processing: true }))}
                onError={(e) => {
                  e.target.classList.add('error');
                  e.target.src = '';
                  setImagesLoaded(prev => ({ ...prev, processing: true }));
                }}
              />
            </div>
          </div>

          <div className="workflow-step">
            <div className="workflow-image" data-fallback-text="Receive a comprehensive summary highlighting key points and important information">
              {!imagesLoaded.summary && <div className="loading-image-indicator"></div>}
              <img 
                src={summaryIllustration} 
                alt="Review your summary"
                style={{ maxWidth: '100%' }}
                onLoad={() => setImagesLoaded(prev => ({ ...prev, summary: true }))}
                onError={(e) => {
                  e.target.classList.add('error');
                  e.target.src = '';
                  setImagesLoaded(prev => ({ ...prev, summary: true }));
                }}
              />
            </div>
            <div className="workflow-content">
              <div className="step-number">3</div>
              <h3>Get Your Summary</h3>
              <p>
                Within seconds, receive a comprehensive, plain-language summary highlighting key points,
                potential issues, obligations, and important dates - all organized for easy understanding.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="industry-section">
  <h2>Who Uses NyayaSetu?</h2>
        <div className="industry-container">
          <div className="industry-card">
            <div className="industry-icon">
              <FaUserTie />
            </div>
            <h3>Lawyers & Attorneys</h3>
            <p>
              Quickly review client contracts and legal documents to identify key points and potential issues.
              Save hours of initial review time.
            </p>
          </div>
          
          <div className="industry-card">
            <div className="industry-icon">
              <FaBalanceScale />
            </div>
            <h3>Legal Departments</h3>
            <p>
              Streamline contract review processes and handle higher document volumes with the same staff.
              Identify risks faster and with greater consistency.
            </p>
          </div>
          
          <div className="industry-card">
            <div className="industry-icon">
              <FaBuilding />
            </div>
            <h3>Businesses</h3>
            <p>
              Understand contracts and legal obligations without specialized legal knowledge.
              Make informed decisions faster with clear document summaries.
            </p>
          </div>
        </div>
      </section>
      
      <section className="pricing-section">
        <h2>Ready to Get Started?</h2>
        <div className="pricing-container">
          <div className="pricing-card">
            <h3>Free</h3>
            <div className="price">$0</div>
            <ul className="pricing-features">
              <li>15 free document summaries</li>
              <li>Basic document analysis</li>
              <li>Limited document length</li>
              <li>No document storage</li>
            </ul>
            <Link to="/register" className="btn btn-outline">
              Start Free
            </Link>
          </div>
          
          <div className="pricing-card featured">
            <div className="featured-badge">Popular</div>
            <h3>Professional</h3>
            <div className="price">$19<span>/month</span></div>
            <ul className="pricing-features">
              <li>Unlimited document summaries</li>
              <li>Advanced document analysis</li>
              <li>Unlimited document length</li>
              <li>Secure document storage</li>
              <li>Priority support</li>
            </ul>
            <Link to="/register" className="btn btn-primary">
              Sign Up Now
            </Link>
          </div>
          
          <div className="pricing-card">
            <h3>Enterprise</h3>
            <div className="price">Contact Us</div>
            <ul className="pricing-features">
              <li>All Professional features</li>
              <li>Custom API integration</li>
              <li>Team collaboration tools</li>
              <li>Dedicated account manager</li>
              <li>Custom training & onboarding</li>
            </ul>
            <a href="mailto:contact@nyayasetu.com" className="btn btn-outline">
              Contact Sales
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;