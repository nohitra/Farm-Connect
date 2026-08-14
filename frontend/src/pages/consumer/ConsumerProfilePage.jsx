import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import { User, MapPin, Mail, Phone, Edit3, Save, X, Trash2, LogOut, CheckCircle2, AlertCircle } from 'lucide-react';

const ConsumerProfilePage = () => {
  const { user, profile, logout, refreshProfile } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
    }
    if (profile) {
      setAddress(profile.address || '');
      setPincode(profile.pincode || '');
    }
  }, [user, profile]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    setError('');

    try {
      const res = await API.put('/consumer/profile', { name, phone, address, pincode });
      if (res.data.success) {
        setMsg('Profile updated successfully!');
        setIsEditing(false);
        if (refreshProfile) await refreshProfile();
      } else {
        setError(res.data.message || 'Failed to update profile.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving profile changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    setError('');

    try {
      const res = await API.delete('/consumer/profile');
      if (res.data.success) {
        logout();
      } else {
        setError(res.data.message || 'Failed to delete account.');
        setShowDeleteModal(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting account.');
      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="page-wrapper animate-fade-in" style={{ maxWidth: '640px', margin: '2rem auto' }}>
      <div className="glass-card" style={{ padding: '2rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-dark)' }}>
              <User size={32} />
            </div>
            <div>
              <h2 style={{ margin: 0 }}>{user?.name}</h2>
              <span className="role-pill role-consumer">Consumer Account</span>
            </div>
          </div>

          {!isEditing && (
            <button onClick={() => setIsEditing(true)} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Edit3 size={16} /> Edit Profile
            </button>
          )}
        </div>

        {msg && (
          <div style={{ padding: '0.75rem 1rem', background: '#d1fae5', color: '#065f46', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
            <CheckCircle2 size={18} /> {msg}
          </div>
        )}

        {error && (
          <div className="auth-error-alert" style={{ marginBottom: '1rem' }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {/* Editing Form */}
        {isEditing ? (
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                className="form-control"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Delivery Address</label>
              <input
                type="text"
                className="form-control"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Pincode (Updates your Hub assignment)</label>
              <input
                type="text"
                className="form-control"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                <Save size={18} /> {saving ? 'Saving...' : 'Save Profile'}
              </button>
              <button type="button" onClick={() => setIsEditing(false)} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <X size={18} /> Cancel
              </button>
            </div>
          </form>
        ) : (
          /* View Mode */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Mail size={18} className="icon-emerald" /> <span>{user?.email}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Phone size={18} className="icon-emerald" /> <span>{user?.phone}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <MapPin size={18} className="icon-emerald" /> <span>Delivery Address: <strong>{profile?.address || 'Not set'}</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <MapPin size={18} className="icon-emerald" /> <span>Assigned Hub: <strong>{profile?.assignedHub?.name || 'Governorpet Hub'}</strong> ({profile?.pincode})</span>
            </div>

            {/* Action Buttons: Logout & Delete Account */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
              <button onClick={logout} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <LogOut size={18} /> Log Out
              </button>
              <button onClick={() => setShowDeleteModal(true)} className="btn btn-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Trash2 size={18} /> Delete Account
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="glass-card animate-fade-in" style={{ maxWidth: '440px', width: '100%', padding: '2rem', background: '#ffffff' }}>
            <h3 style={{ color: '#dc2626', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 0 }}>
              <Trash2 size={22} /> Delete Account?
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Are you sure you want to permanently delete your FarmConnect consumer account? All your order history and account details will be removed. This action cannot be undone.
            </p>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button onClick={handleDeleteAccount} className="btn btn-danger" disabled={deleting} style={{ flex: 1 }}>
                {deleting ? 'Deleting...' : 'Yes, Delete Account'}
              </button>
              <button onClick={() => setShowDeleteModal(false)} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsumerProfilePage;
