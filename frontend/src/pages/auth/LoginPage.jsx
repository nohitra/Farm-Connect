import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import API from '../../services/api';
import { LogIn, Lock, User, AlertCircle, Eye, EyeOff, CheckCircle2, Info } from 'lucide-react';
import './AuthPages.css';

const LoginPage = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [emailCheckedStatus, setEmailCheckedStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [roleNotice, setRoleNotice] = useState('');
  const [showOriginHelp, setShowOriginHelp] = useState(false);

  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleBlurIdentifier = async () => {
    if (!usernameOrEmail) return;

    try {
      const res = await API.get(`/auth/check-email?username=${encodeURIComponent(usernameOrEmail)}`);
      if (res.data.success) {
        setEmailCheckedStatus(res.data);
        if (!res.data.exists) {
          setError(`No registered account found matching "${usernameOrEmail}". Please check spelling or register below.`);
        } else {
          setError('');
        }
      }
    } catch (err) {
      console.error('Error checking user identifier:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setRoleNotice('');

    if (!usernameOrEmail.trim()) {
      setError('Please enter your username or email address.');
      return;
    }

    setLoading(true);

    try {
      const res = await login(usernameOrEmail, password);
      if (res.success) {
        if (res.user.role === 'farmer') {
          setRoleNotice(`Welcome back, ${res.user.name}! Redirecting to your Farmer Dashboard...`);
          setTimeout(() => navigate('/farmer/dashboard'), 1000);
        } else if (res.user.role === 'consumer') {
          navigate('/consumer/home');
        } else if (res.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      } else {
        setError(res.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Incorrect username/email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    if (credentialResponse.credential) {
      setLoading(true);
      setError('');
      try {
        const res = await googleLogin({ idToken: credentialResponse.credential, role: 'consumer' });
        if (res.success) {
          if (res.isNewUser) {
            navigate('/complete-profile');
          } else if (res.user.role === 'farmer') {
            navigate('/farmer/dashboard');
          } else {
            navigate('/consumer/home');
          }
        } else {
          setError(res.message || 'Google OAuth Sign-In failed.');
        }
      } catch (err) {
        setError('Google OAuth verification failed. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleGoogleError = () => {
    setError('Google Sign-In failed (Origin Mismatch or popup closed). Make sure http://localhost:5173 is added in Google Console.');
    setShowOriginHelp(true);
  };

  return (
    <div className="auth-page-container page-wrapper animate-fade-in">
      <div className="auth-card glass-card">
        <div className="auth-header">
          <LogIn size={32} className="auth-icon" />
          <h2>Welcome Back to FarmConnect</h2>
          <p>Sign in with your Username or Email to access orders & produce</p>
        </div>

        {roleNotice && (
          <div style={{ padding: '0.85rem 1rem', background: '#d1fae5', color: '#065f46', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={18} /> {roleNotice}
          </div>
        )}

        {error && (
          <div className="auth-error-alert">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {showOriginHelp && (
          <div style={{ padding: '0.85rem 1rem', background: '#e0f2fe', color: '#0369a1', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', fontSize: '0.85rem', lineHeight: 1.5 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, marginBottom: '0.3rem' }}>
              <Info size={16} /> Google Cloud Setup Notice:
            </div>
            In Google Cloud Console, under <strong>Authorized JavaScript origins</strong> for Client ID <code>272282753126...</code>, add:
            <code style={{ display: 'block', margin: '0.3rem 0', background: '#ffffff', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid #bae6fd' }}>http://localhost:5173</code>
            And publish your <strong>OAuth Consent Screen</strong> to allow any user to sign in!
          </div>
        )}

        {/* Real Google Official Sign-In Button */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            theme="outline"
            size="large"
            width="320"
            text="continue_with"
            shape="rectangular"
          />
        </div>

        <div className="divider-text" style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
          <span>or sign in with username / email</span>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="usernameOrEmail">Username or Email</label>
            <div className="input-with-icon">
              <User size={18} className="input-icon" />
              <input
                type="text"
                id="usernameOrEmail"
                className="form-control"
                placeholder="Enter your username or email address"
                value={usernameOrEmail}
                onBlur={handleBlurIdentifier}
                onChange={(e) => {
                  setUsernameOrEmail(e.target.value);
                  setEmailCheckedStatus(null);
                  if (error) setError('');
                }}
                required
              />
            </div>
            {emailCheckedStatus?.exists && (
              <small style={{ color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.3rem' }}>
                <CheckCircle2 size={14} /> Registered {emailCheckedStatus.role} account found
              </small>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                className="form-control has-toggle"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
                tabIndex="-1"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.4rem' }}>
              <Link to="/forgot-password" className="auth-link" style={{ fontSize: '0.85rem' }}>
                Forgot Password?
              </Link>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading} style={{ fontWeight: 700 }}>
            {loading ? 'Verifying Credentials...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account? <Link to="/signup" className="auth-link">Sign up here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
