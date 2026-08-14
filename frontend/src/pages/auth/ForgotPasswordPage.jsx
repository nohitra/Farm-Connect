import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { validateEmail } from '../../utils/emailValidator';
import { getPasswordStrength } from '../../utils/formValidators';
import { KeyRound, Mail, Lock, ShieldCheck, AlertCircle, CheckCircle2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import './AuthPages.css';

const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [demoOtpNotice, setDemoOtpNotice] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const passStrength = getPasswordStrength(newPassword);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const emailCheck = validateEmail(email);
    if (!emailCheck.isValid) {
      setError(emailCheck.message);
      return;
    }

    setLoading(true);

    try {
      const res = await API.post('/auth/forgot-password', { email });
      if (res.data.success) {
        setMessage(`Verification code generated for ${email}`);
        if (res.data.demoOtp) {
          setDemoOtpNotice(res.data.demoOtp);
          setOtp(res.data.demoOtp);
        }
        setStep(2);
      } else {
        setError(res.data.message || 'Failed to request reset code.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'No account found with this email address.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit verification code.');
      return;
    }

    if (passStrength.score < 2) {
      setError('Please choose a stronger password (at least 8 characters).');
      return;
    }

    setLoading(true);

    try {
      const res = await API.post('/auth/reset-password', { email, otp, newPassword });
      if (res.data.success) {
        setMessage('🎉 Password reset successfully! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(res.data.message || 'Failed to reset password.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired verification code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container page-wrapper animate-fade-in">
      <div className="auth-card glass-card">
        <div className="auth-header">
          <KeyRound size={32} className="auth-icon" />
          <h2>Reset Your Password</h2>
          <p>Recover access to your FarmConnect account</p>
        </div>

        {message && (
          <div style={{ padding: '0.85rem 1rem', background: '#d1fae5', color: '#065f46', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={18} /> {message}
          </div>
        )}

        {error && (
          <div className="auth-error-alert">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestOtp} className="auth-form">
            <div className="form-group">
              <label>Enter Registered Email</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  className="form-control"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading} style={{ fontWeight: 700 }}>
              {loading ? 'Sending Code...' : 'Send Verification Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="auth-form">
            {demoOtpNotice && (
              <div style={{ padding: '0.75rem 1rem', background: '#e0f2fe', color: '#0369a1', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                💡 <strong>Demo Code:</strong> Verification code is <code>{demoOtpNotice}</code>
              </div>
            )}

            <div className="form-group">
              <label>6-Digit Verification Code</label>
              <div className="input-with-icon">
                <ShieldCheck size={18} className="input-icon" />
                <input
                  type="text"
                  className="form-control"
                  placeholder="123456"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>New Password</label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control has-toggle"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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

              {/* Password Strength Meter */}
              {newPassword && (
                <div style={{ marginTop: '0.4rem' }}>
                  <div style={{ display: 'flex', gap: '4px', height: '6px', marginBottom: '0.25rem' }}>
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        style={{
                          flex: 1,
                          borderRadius: '3px',
                          background: level <= passStrength.score ? passStrength.color : '#e2e8f0',
                          transition: 'all 0.3s ease',
                        }}
                      />
                    ))}
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: passStrength.color }}>
                    Strength: {passStrength.label}
                  </span>
                </div>
              )}
            </div>

            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading} style={{ fontWeight: 700 }}>
              {loading ? 'Updating Password...' : 'Reset Password'}
            </button>
          </form>
        )}

        <div className="auth-footer">
          <Link to="/login" className="auth-link" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
            <ArrowLeft size={16} /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
