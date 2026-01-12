import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { FaUser, FaEnvelope, FaLock, FaUserPlus } from 'react-icons/fa';
import '../styles/auth.css';

const RegisterSchema = Yup.object().shape({
  name: Yup.string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    
    try {
      const result = await register({
        name: values.name,
        email: values.email,
        password: values.password,
      });
      
      if (result.success) {
        toast.success('Registration successful! You can now log in.');
        navigate('/login');
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('An error occurred during registration. Please try again.');
      console.error('Registration error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Create Account</h1>
          <p>Register to start using the legal document summarizer</p>
        </div>
        
        <Formik
          initialValues={{ name: '', email: '', password: '', confirmPassword: '' }}
          validationSchema={RegisterSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched }) => (
            <Form className="auth-form">
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  <FaUser /> Full Name
                </label>
                <Field
                  type="text"
                  name="name"
                  id="name"
                  className={`form-input ${errors.name && touched.name ? 'is-invalid' : ''}`}
                  placeholder="Enter your full name"
                />
                <ErrorMessage name="name" component="div" className="error-message" />
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  <FaEnvelope /> Email Address
                </label>
                <Field
                  type="email"
                  name="email"
                  id="email"
                  className={`form-input ${errors.email && touched.email ? 'is-invalid' : ''}`}
                  placeholder="Enter your email"
                />
                <ErrorMessage name="email" component="div" className="error-message" />
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  <FaLock /> Password
                </label>
                <Field
                  type="password"
                  name="password"
                  id="password"
                  className={`form-input ${errors.password && touched.password ? 'is-invalid' : ''}`}
                  placeholder="Create a password"
                />
                <ErrorMessage name="password" component="div" className="error-message" />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  <FaLock /> Confirm Password
                </label>
                <Field
                  type="password"
                  name="confirmPassword"
                  id="confirmPassword"
                  className={`form-input ${
                    errors.confirmPassword && touched.confirmPassword ? 'is-invalid' : ''
                  }`}
                  placeholder="Confirm your password"
                />
                <ErrorMessage name="confirmPassword" component="div" className="error-message" />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating Account...' : (
                  <>
                    <FaUserPlus /> Create Account
                  </>
                )}
              </button>
            </Form>
          )}
        </Formik>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;