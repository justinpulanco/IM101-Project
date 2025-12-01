import React, { useState } from 'react';

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

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setTabAnim(true);
    setTimeout(() => setTabAnim(false), 360);
  };

  return (
    <div className="modal-overlay visible">
      <div className="modal-content auth-modal">
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-tabs">
          <button 
            className={`modal-tab ${activeTab === 'login' ? 'active' : ''}`} 
            onClick={() => handleTabChange('login')}
          >
            Login
          </button>
          <button 
            className={`modal-tab ${activeTab === 'register' ? 'active' : ''}`} 
            onClick={() => handleTabChange('register')}
          >
            Register
          </button>
        </div>

        {activeTab === 'login' && (
          <div className={`modal-form login-form ${tabAnim ? 'animating' : ''}`}>
            <h2>Login</h2>
            <form onSubmit={onLogin}>
              <input 
                type="email" 
                placeholder="Email" 
                value={loginEmail} 
                onChange={(e) => setLoginEmail(e.target.value)} 
                required 
              />
              <input 
                type="password" 
                placeholder="Password" 
                value={loginPassword} 
                onChange={(e) => setLoginPassword(e.target.value)} 
                required 
              />
              <button type="submit">Login</button>
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
          <div className={`modal-form register-form ${tabAnim ? 'animating' : ''}`}>
            <h2>Register</h2>
            <form onSubmit={onRegister}>
              <input 
                type="text" 
                placeholder="Name" 
                value={regName} 
                onChange={(e) => setRegName(e.target.value)} 
                required 
              />
              <input 
                type="email" 
                placeholder="Email" 
                value={regEmail} 
                onChange={(e) => setRegEmail(e.target.value)} 
                required 
              />
              <input 
                type="password" 
                placeholder="Password" 
                value={regPassword} 
                onChange={(e) => setRegPassword(e.target.value)} 
                required 
              />
              <button type="submit" className="secondary">Register</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default AuthPage;
