import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import { Sprout, ShoppingBag, CheckCircle2, ArrowRight, User, Phone, MapPin, Building2, AlertCircle } from 'lucide-react';
import './AuthPages.css';

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" style={{ marginRight: '8px', flexShrink: 0 }}>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
  </svg>
);

const CompleteProfilePage = () => {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState(user?.role || 'consumer');
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  
  // Consumer
  const [address, setAddress] = useState(profile?.address || '');
  const [pincode, setPincode] = useState(profile?.pincode || '520002');

  // Farmer
  const [farmName, setFarmName] = useState(profile?.farmName || '');
  const [farmLocation, setFarmLocation] = useState(profile?.farmLocation || '');
  const [farmingPractice, setFarmingPractice] = useState('organic');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setRole(user.role || 'consumer');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (role === 'consumer') {
        const res = await API.put('/consumer/profile', { name, phone, address, pincode });
        if (res.data.success) {
          if (refreshProfile) await refreshProfile();
          navigate('/consumer/home');
        }
      } else {
        const res = await API.put('/farmer/profile', { name, phone, farmName, farmLocation, farmingPractice });
        if (res.data.success) {
          if (refreshProfile) await refreshProfile();
          navigate('/farmer/dashboard');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete profile setup.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container page-wrapper animate-fade-in">
      <div className="auth-card glass-card" style={{ maxWidth: '580px' }}>
        <div className="auth-header">
          <div style={{ display: 'inline-flex', alignItems: 'center', background: '#f8fafc', padding: '0.5rem 1rem', borderRadius: '20px', border: '1px solid var(--border-color)', marginBottom: '1rem' }}>
            <GoogleIcon /> <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Signed in with Google</span>
          </div>
          <h2>Set Up Your FarmConnect Profile</h2>
          <p>Welcome <strong>{user?.email}</strong>! Customize your profile details below to get started.</p>
        </div>

        {error && (
          <div className="auth-error-alert">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {/* Role Toggle Tabs */}
        <div className="role-selector-tabs" style={{ marginBottom: '1.5rem' }}>
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

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Full Name</label>
            <div className="input-with-icon">
              <User size={18} className="input-icon" />
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Ananya Roy or Ramesh Naidu"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <div className="input-with-icon">
              <Phone size={18} className="input-icon" />
              <input
                type="tel"
                className="form-control"
                placeholder="9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
          </div>

          {role === 'consumer' ? (
            <>
              <div className="form-group">
                <label>Delivery Address</label>
                <div className="input-with-icon">
                  <MapPin size={18} className="input-icon" />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Flat 202, Sunshine Apartments, MG Road"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Pincode (For Hub Assignment)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="520002"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  required
                />
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label>Farm Name</label>
                <div className="input-with-icon">
                  <Building2 size={18} className="input-icon" />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Sri Lakshmi Organic Farm"
                    value={farmName}
                    onChange={(e) => setFarmName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Farm Location / Village</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Kankipadu Village, Vijayawada"
                  value={farmLocation}
                  onChange={(e) => setFarmLocation(e.target.value)}
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
                  <option value="organic">100% Organic Farming</option>
                  <option value="natural">Natural (Zero Chemical)</option>
                  <option value="conventional">Conventional</option>
                </select>
              </div>
            </>
          )}

          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading} style={{ fontWeight: 700, marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            {loading ? 'Saving Profile...' : 'Complete Profile & Continue'} <ArrowRight size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfilePage;
