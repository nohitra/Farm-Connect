import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Send, CheckCircle2 } from 'lucide-react';

const OutOfCoveragePage = () => {
  const [pincode, setPincode] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="page-wrapper animate-fade-in" style={{ maxWidth: '640px', margin: '3rem auto' }}>
      <div className="glass-card" style={{ padding: '2.5rem', textAlign: 'center' }}>
        <MapPin size={48} style={{ color: 'var(--accent)', marginBottom: '1rem' }} />
        <h2>We're Not in Your Area Yet!</h2>
        <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 1.5rem 0' }}>
          FarmConnect is currently launched in Vijayawada, Hyderabad, and Visakhapatnam regions. Join the waitlist to bring transparent local produce to your pincode!
        </p>

        {submitted ? (
          <div style={{ padding: '1.25rem', background: '#dcfce7', color: '#15803d', borderRadius: 'var(--radius-sm)', fontWeight: 700 }}>
            <CheckCircle2 size={24} style={{ marginBottom: '0.25rem' }} />
            <p>You're on the waitlist! We'll notify you as soon as a hub opens in your area.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
            <div className="form-group">
              <label>Your Pincode</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. 500081"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                className="form-control"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-accent btn-lg btn-block">
              <Send size={18} /> Join Area Waitlist
            </button>
          </form>
        )}

        <div style={{ marginTop: '1.5rem' }}>
          <Link to="/" className="btn btn-secondary">Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default OutOfCoveragePage;
