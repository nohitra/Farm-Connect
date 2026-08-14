import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { Sprout, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

const FarmerOnboarding = () => {
  const [hubs, setHubs] = useState([]);
  const [selectedHubs, setSelectedHubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/hubs')
      .then((res) => {
        if (res.data.success && Array.isArray(res.data.hubs)) {
          setHubs(res.data.hubs);
          if (res.data.hubs.length > 0) {
            setSelectedHubs(res.data.hubs.slice(0, 2).map((h) => h._id));
          }
        }
      })
      .catch((err) => console.error('Error fetching hubs:', err));
  }, []);

  const handleToggleHub = (hubId) => {
    if (selectedHubs.includes(hubId)) {
      setSelectedHubs(selectedHubs.filter((id) => id !== hubId));
    } else {
      setSelectedHubs([...selectedHubs, hubId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (selectedHubs.length === 0) {
      setError('Please select at least 1 regional distribution hub you can deliver harvest to.');
      return;
    }

    setLoading(true);

    try {
      const res = await API.post('/farmer/hub-requests', { hubIds: selectedHubs });
      if (res.data.success) {
        setSubmitted(true);
      } else {
        setError(res.data.message || 'Failed to submit hub commitment.');
      }
    } catch (err) {
      console.error('Error submitting hub selection:', err);
      if (err.response?.status === 401) {
        setError('Your login session expired. Redirecting to login page...');
        setTimeout(() => navigate('/login'), 1800);
      } else {
        setError(err.response?.data?.message || 'Error submitting hub commitment. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="page-wrapper text-center animate-fade-in" style={{ maxWidth: '580px', margin: '3rem auto' }}>
        <div className="glass-card" style={{ padding: '3rem', borderRadius: 'var(--radius-lg)' }}>
          <Clock size={56} style={{ color: '#f59e0b', marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.5rem' }}>Pending Admin Verification</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            Your farm profile and hub commitment requests have been submitted. An admin will review and approve your application shortly.
          </p>
          <button
            onClick={() => navigate('/farmer/dashboard')}
            className="btn btn-primary btn-lg"
            style={{ fontWeight: 700 }}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper animate-fade-in" style={{ maxWidth: '640px', margin: '2rem auto' }}>
      <div className="glass-card" style={{ padding: '2.5rem', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <Sprout size={42} style={{ color: 'var(--primary-color)', marginBottom: '0.5rem' }} />
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700 }}>Farmer Hub Commitment</h2>
          <p style={{ color: 'var(--text-muted)' }}>
            Select the neighborhood distribution hubs you can commit to delivering bulk harvest to.
          </p>
        </div>

        {error && (
          <div className="auth-error-alert" style={{ marginBottom: '1.25rem' }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label style={{ marginBottom: '0.75rem', display: 'block', fontWeight: 700 }}>Eligible Regional Hubs</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {hubs.length === 0 ? (
                <div style={{ padding: '1rem', color: 'var(--text-muted)', textAlign: 'center' }}>Loading eligible hubs...</div>
              ) : (
                hubs.map((hub) => {
                  const isChecked = selectedHubs.includes(hub._id);
                  return (
                    <label
                      key={hub._id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.85rem',
                        padding: '1rem 1.25rem',
                        background: isChecked ? 'rgba(16, 185, 129, 0.06)' : 'var(--bg-main, #f8fafc)',
                        borderRadius: 'var(--radius-md, 12px)',
                        border: isChecked ? '2px solid var(--primary-color, #10b981)' : '1px solid var(--border-color, #e2e8f0)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleHub(hub._id)}
                        style={{ width: '18px', height: '18px', accentColor: 'var(--primary-color, #10b981)', cursor: 'pointer' }}
                      />
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-color, #1e293b)' }}>{hub.name}</div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted, #64748b)', marginTop: '0.15rem' }}>
                          {hub.anchorAddress} • Pickup: {hub.pickupWindowStart || '18:00'} - {hub.pickupWindowEnd || '21:00'}
                        </div>
                      </div>
                    </label>
                  );
                })
              )}
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            style={{ marginTop: '1.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            disabled={loading}
          >
            <CheckCircle2 size={20} />
            {loading ? 'Submitting Commitment...' : 'Submit Commitment for Admin Approval'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FarmerOnboarding;
