import React, { useState } from 'react';
import { validateEmail, validatePassword, validateName } from '../utils/formValidation';

function AuthPage({ 
  onLogin,
  onRegister,
  loginEmail,
  setLoginEmail,
  loginPassword,
  setLoginPassword,
  regName,
  setRegName,
  regEmail,
  setRegEmail,
  regPassword,
  setRegPassword,
  onClose
}) {
  const [activeTab, setActiveTab] = useState('login');
  const [tabAnim, setTabAnim] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setTabAnim(true);
    setErrors({});
    setTouched({});
    setTimeout(() => setTabAnim(false), 360);
  };

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    validateField(field);
  };

  const validateField = (field) => {
    let error = null;
    
    switch(field) {
      case 'loginEmail':
        error = validateEmail(loginEmail);
        break;
      case 'loginPassword':
        error = validatePassword(loginPassword, false); // Relaxed validation
        break;
      case 'regName':
        error = validateName(regName);
        break;
      case 'regEmail':
        error = validateEmail(regEmail);
        break;
      case 'regPassword':
        error = validatePassword(regPassword, false); // Relaxed validation
        break;
      default:
        break;
    }
    
    setErrors({ ...errors, [field]: error });
    return error;
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    
    const emailError = validateEmail(loginEmail);
    const passwordError = validatePassword(loginPassword, false); // Relaxed validation
    
    if (emailError || passwordError) {
      setErrors({
        loginEmail: emailError,
        loginPassword: passwordError
      });
      setTouched({
        loginEmail: true,
        loginPassword: true
      });
      return;
    }
    
    onLogin(e);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    
    const nameError = validateName(regName);
    const emailError = validateEmail(regEmail);
    const passwordError = validatePassword(regPassword, false); // Use relaxed validation
    
    if (nameError || emailError || passwordError) {
      setErrors({
        regName: nameError,
        regEmail: emailError,
        regPassword: passwordError
      });
      setTouched({
        regName: true,
        regEmail: true,
        regPassword: true
      });
      return;
    }
    
    setIsSubmitting(true);
    setSuccessMessage('');
    
    try {
      const result = await onRegister(e);
      if (result) {
        setSuccessMessage('✅ Account created successfully!');
      }
    } catch (err) {
      console.error('Registration error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="modal-overlay visible" 
      role="dialog" 
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="modal-content auth-modal">
        <button 
          className="modal-close" 
          onClick={onClose}
          aria-label="Close authentication modal"
        >
          ✕
        </button>
        <div className="modal-tabs" role="tablist" aria-label="Authentication options">
          <button 
            className={`modal-tab ${activeTab === 'login' ? 'active' : ''}`} 
            onClick={() => handleTabChange('login')}
            role="tab"
            aria-selected={activeTab === 'login'}
            aria-controls="login-panel"
            id="login-tab"
          >
            Login
          </button>
          <button 
            className={`modal-tab ${activeTab === 'register' ? 'active' : ''}`} 
            onClick={() => handleTabChange('register')}
            role="tab"
            aria-selected={activeTab === 'register'}
            aria-controls="register-panel"
            id="register-tab"
          >
            Register
          </button>
        </div>

        {activeTab === 'login' && (
          <div 
            className={`modal-form login-form ${tabAnim ? 'animating' : ''}`}
            role="tabpanel"
            id="login-panel"
            aria-labelledby="login-tab"
          >
            <h2 id="auth-modal-title">Login</h2>
            <form onSubmit={handleLoginSubmit} aria-label="Login form">
              <div className="form-field">
                <label htmlFor="login-email" className="sr-only">Email address</label>
                <input 
                  id="login-email"
                  type="email" 
                  placeholder="Email" 
                  value={loginEmail} 
                  onChange={(e) => {
                    setLoginEmail(e.target.value);
                    if (touched.loginEmail) validateField('loginEmail');
                  }}
                  onBlur={() => handleBlur('loginEmail')}
                  className={touched.loginEmail && errors.loginEmail ? 'error' : ''}
                  aria-invalid={touched.loginEmail && errors.loginEmail ? 'true' : 'false'}
                  aria-describedby={touched.loginEmail && errors.loginEmail ? 'login-email-error' : undefined}
                  required 
                />
                {touched.loginEmail && errors.loginEmail && (
                  <span className="error-message" id="login-email-error" role="alert">
                    {errors.loginEmail}
                  </span>
                )}
              </div>
              <div className="form-field">
                <label htmlFor="login-password" className="sr-only">Password</label>
                <input 
                  id="login-password"
                  type="password" 
                  placeholder="Password" 
                  value={loginPassword} 
                  onChange={(e) => {
                    setLoginPassword(e.target.value);
                    if (touched.loginPassword) validateField('loginPassword');
                  }}
                  onBlur={() => handleBlur('loginPassword')}
                  className={touched.loginPassword && errors.loginPassword ? 'error' : ''}
                  aria-invalid={touched.loginPassword && errors.loginPassword ? 'true' : 'false'}
                  aria-describedby={touched.loginPassword && errors.loginPassword ? 'login-password-error' : undefined}
                  required 
                />
                {touched.loginPassword && errors.loginPassword && (
                  <span className="error-message" id="login-password-error" role="alert">
                    {errors.loginPassword}
                  </span>
                )}
              </div>
              <button type="submit" aria-label="Submit login form">Login</button>
            </form>
            <div className="no-account">
              <span className="no-account-text">No account?</span>
              <button
                type="button"
                className="create-account-btn"
                onClick={() => handleTabChange('register')}
              >
                Click Here
              </button>
            </div>
          </div>
        )}

        {activeTab === 'register' && (
          <div 
            className={`modal-form register-form ${tabAnim ? 'animating' : ''}`}
            role="tabpanel"
            id="register-panel"
            aria-labelledby="register-tab"
          >
            <h2 id="auth-modal-title">Register</h2>
            <form onSubmit={handleRegisterSubmit} aria-label="Registration form">
              <div className="form-field">
                <label htmlFor="register-name" className="sr-only">Full name</label>
                <input 
                  id="register-name"
                  type="text" 
                  placeholder="Name" 
                  value={regName} 
                  onChange={(e) => {
                    setRegName(e.target.value);
                    if (touched.regName) validateField('regName');
                  }}
                  onBlur={() => handleBlur('regName')}
                  className={touched.regName && errors.regName ? 'error' : ''}
                  aria-invalid={touched.regName && errors.regName ? 'true' : 'false'}
                  aria-describedby={touched.regName && errors.regName ? 'register-name-error' : undefined}
                  required 
                />
                {touched.regName && errors.regName && (
                  <span className="error-message" id="register-name-error" role="alert">
                    {errors.regName}
                  </span>
                )}
              </div>
              <div className="form-field">
                <label htmlFor="register-email" className="sr-only">Email address</label>
                <input 
                  id="register-email"
                  type="email" 
                  placeholder="Email" 
                  value={regEmail} 
                  onChange={(e) => {
                    setRegEmail(e.target.value);
                    if (touched.regEmail) validateField('regEmail');
                  }}
                  onBlur={() => handleBlur('regEmail')}
                  className={touched.regEmail && errors.regEmail ? 'error' : ''}
                  aria-invalid={touched.regEmail && errors.regEmail ? 'true' : 'false'}
                  aria-describedby={touched.regEmail && errors.regEmail ? 'register-email-error' : undefined}
                  required 
                />
                {touched.regEmail && errors.regEmail && (
                  <span className="error-message" id="register-email-error" role="alert">
                    {errors.regEmail}
                  </span>
                )}
              </div>
              <div className="form-field">
                <label htmlFor="register-password" className="sr-only">Password</label>
                <input 
                  id="register-password"
                  type="password" 
                  placeholder="Password (minimum 6 characters)" 
                  value={regPassword} 
                  onChange={(e) => {
                    setRegPassword(e.target.value);
                    if (touched.regPassword) validateField('regPassword');
                  }}
                  onBlur={() => handleBlur('regPassword')}
                  className={touched.regPassword && errors.regPassword ? 'error' : ''}
                  aria-invalid={touched.regPassword && errors.regPassword ? 'true' : 'false'}
                  aria-describedby={touched.regPassword && errors.regPassword ? 'register-password-error' : 'register-password-help'}
                  required 
                />
                <span id="register-password-help" className="sr-only">
                  Password must be at least 6 characters
                </span>
                {touched.regPassword && errors.regPassword && (
                  <span className="error-message" id="register-password-error" role="alert">
                    {errors.regPassword}
                  </span>
                )}
              </div>
              {successMessage && (
                <div className="success-message" role="alert">
                  {successMessage}
                </div>
              )}
              <button 
                type="submit" 
                className="secondary" 
                aria-label="Submit registration form"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating Account...' : 'Register'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default AuthPage;
