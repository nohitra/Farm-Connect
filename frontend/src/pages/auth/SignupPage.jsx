import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import API from '../../services/api';
import { validateEmail } from '../../utils/emailValidator';
import { validatePhone, getPasswordStrength } from '../../utils/formValidators';
import { UserPlus, Sprout, ShoppingBag, AlertCircle, Eye, EyeOff, Lock } from 'lucide-react';
import './AuthPages.css';

const SignupPage = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') || 'consumer';

  const [role, setRole] = useState(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [regionId, setRegionId] = useState('');
  const [regions, setRegions] = useState([]);
  const [fetchingRegions, setFetchingRegions] = useState(true);

  // Consumer specific
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');

  // Farmer specific
  const [farmName, setFarmName] = useState('');
  const [farmLocation, setFarmLocation] = useState('');
  const [farmingPractice, setFarmingPractice] = useState('organic');
  const [bio, setBio] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();

  const passStrength = getPasswordStrength(password);

  useEffect(() => {
    API.get('/regions')
      .then((res) => {
        if (res.data.success && Array.isArray(res.data.regions) && res.data.regions.length > 0) {
          setRegions(res.data.regions);
          setRegionId(res.data.regions[0]._id);
        } else {
          fetchFallbackRegions();
        }
      })
      .catch((err) => {
        console.error('Error fetching regions:', err);
        fetchFallbackRegions();
      })
      .finally(() => setFetchingRegions(false));
  }, []);

  const fetchFallbackRegions = async () => {
    try {
      const res = await API.get('/admin/regions');
      if (res.data.success && res.data.regions.length > 0) {
        setRegions(res.data.regions);
        setRegionId(res.data.regions[0]._id);
      }
    } catch (err) {
      console.error('Fallback region fetch error:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setError(emailValidation.message);
      return;
    }

    const phoneValidation = validatePhone(phone);
    if (!phoneValidation.isValid) {
      setError(phoneValidation.message);
      return;
    }

    if (passStrength.score < 2) {
      setError('Please choose a stronger password (at least 8 characters).');
      return;
    }

    if (!regionId) {
      setError('Please select a region to register.');
      return;
    }

    setLoading(true);

    const payload = {
      name,
      email,
      phone: phoneValidation.cleanPhone,
      password,
      role,
      regionId,
      ...(role === 'consumer' ? { address, pincode } : { farmName, farmLocation, farmingPractice, bio }),
    };

    try {
      const res = await register(payload);
      if (res.success) {
        if (role === 'farmer') navigate('/farmer/onboarding');
        else navigate('/consumer/home');
      } else {
        setError(res.message || 'Registration failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    if (credentialResponse.credential) {
      setLoading(true);
      setError('');
      try {
        const res = await googleLogin({ idToken: credentialResponse.credential, role });
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

  return (
    <div className="auth-page-container page-wrapper animate-fade-in">
      <div className="auth-card glass-card">
        <div className="auth-header">
          <UserPlus size={32} className="auth-icon" />
          <h2>Create Your FarmConnect Account</h2>
          <p>Join our transparent direct-from-farm community</p>
        </div>

        {/* Role Toggle Tabs */}
        <div className="role-selector-tabs">
          <button
            type="button"
            className={`role-tab ${role === 'consumer' ? 'active' : ''}`}
            onClick={() => setRole('consumer')}
          >
            <ShoppingBag size={18} /> Consumer (Buy Produce)
          </button>
          <button
            type="button"
            className={`role-tab ${role === 'farmer' ? 'active' : ''}`}
            onClick={() => setRole('farmer')}
          >
            <Sprout size={18} /> Farmer (Sell Produce)
          </button>
        </div>

        {error && (
          <div className="auth-error-alert">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {/* Real Google Official Sign-In Button */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Google Sign-In failed or cancelled.')}
            theme="outline"
            size="large"
            width="320"
            text="signup_with"
            shape="rectangular"
          />
        </div>

        <div className="divider-text" style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
          <span>or fill registration details</span>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Ananya Roy"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                className="form-control"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                required
              />
            </div>
            <div className="form-group">
              <label>Phone Number (10 digits)</label>
              <input
                type="tel"
                className="form-control"
                placeholder="9876543210"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Password</label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control has-toggle"
                  placeholder="••••••••"
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

              {/* Password Strength Indicator */}
              {password && (
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

            <div className="form-group">
              <label>Select Region</label>
              <select
                className="form-control"
                value={regionId}
                onChange={(e) => setRegionId(e.target.value)}
                required
              >
                {fetchingRegions ? (
                  <option value="">Loading regions...</option>
                ) : regions.length === 0 ? (
                  <option value="">No regions available</option>
                ) : (
                  regions.map((reg) => (
                    <option key={reg._id} value={reg._id}>
                      {reg.name} Region
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* CONSUMER SPECIFIC FIELDS */}
          {role === 'consumer' && (
            <>
              <div className="form-group">
                <label>Delivery Address</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Flat 101, Green Apts, MG Road"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Pincode (Auto-assigns your Hub)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. 520002 for Vijayawada or 500032 for Hyderabad"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          {/* FARMER SPECIFIC FIELDS */}
          {role === 'farmer' && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label>Farm Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Green Meadows Organic Farm"
                    value={farmName}
                    onChange={(e) => setFarmName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Farming Practice</label>
                  <select
                    className="form-control"
                    value={farmingPractice}
                    onChange={(e) => setFarmingPractice(e.target.value)}
                  >
                    <option value="organic">Organic</option>
                    <option value="natural">Natural (Zero Chemical)</option>
                    <option value="conventional">Conventional</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Farm Location / Village</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Gannavaram, Vijayawada Rural"
                  value={farmLocation}
                  onChange={(e) => setFarmLocation(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading} style={{ fontWeight: 700 }}>
            {loading ? 'Creating Account...' : `Register as ${role === 'consumer' ? 'Consumer' : 'Farmer'}`}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login" className="auth-link">Log in here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
