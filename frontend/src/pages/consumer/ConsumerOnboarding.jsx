import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import { MapPin, CheckCircle2 } from 'lucide-react';

const ConsumerOnboarding = () => {
  const { profile, refreshProfile } = useAuth();
  const [address, setAddress] = useState(profile?.address || '');
  const [pincode, setPincode] = useState(profile?.pincode || '');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.put('/consumer/profile', { address, pincode });
      await refreshProfile();
      navigate('/consumer/home');
    } catch (err) {
      console.error('Error updating address:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper animate-fade-in" style={{ maxWidth: '580px', margin: '2rem auto' }}>
      <div className="glass-card" style={{ padding: '2.5rem' }}>
        <MapPin size={36} style={{ color: 'var(--primary)', marginBottom: '0.5rem' }} />
        <h2>Confirm Your Delivery Location</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Your pincode automatically assigns your closest neighborhood community pickup hub.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Street Address</label>
            <input
              type="text"
              className="form-control"
              placeholder="House/Flat No., Street Name, Area"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Pincode</label>
            <input
              type="text"
              className="form-control"
              placeholder="6-digit pincode"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
            <CheckCircle2 size={18} /> Confirm Location & Continue
          </button>
        </form>
      </div>
    </div>
  );
};

export default ConsumerOnboarding;
