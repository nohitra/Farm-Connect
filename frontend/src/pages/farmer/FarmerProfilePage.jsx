import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import { Sprout, CheckCircle2, Camera, Award, LogOut, Trash2, Save } from 'lucide-react';

const FarmerProfilePage = () => {
  const { user, profile, logout, refreshProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [farmName, setFarmName] = useState(profile?.farmName || '');
  const [farmLocation, setFarmLocation] = useState(profile?.farmLocation || '');
  const [farmingPractice, setFarmingPractice] = useState(profile?.farmingPractice || 'Organic');
  const [bio, setBio] = useState(profile?.bio || '');
  const [farmPhotoUrl, setFarmPhotoUrl] = useState(
    profile?.farmPhotos?.[0] || 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=600&q=80'
  );
  const [certifications, setCertifications] = useState(
    Array.isArray(profile?.certifications) ? profile.certifications.join(', ') : profile?.certifications || 'Organic Certified, Natural Farming'
  );
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const certArray = certifications.split(',').map((c) => c.trim()).filter(Boolean);
      await API.put('/farmer/profile', {
        name,
        phone,
        farmName,
        farmLocation,
        farmingPractice,
        bio,
        farmPhotos: [farmPhotoUrl],
        certifications: certArray,
      });
      await refreshProfile();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Error updating farmer profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const res = await API.delete('/farmer/profile');
      if (res.data.success) {
        logout();
      }
    } catch (err) {
      console.error('Error deleting farmer profile:', err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="page-wrapper animate-fade-in" style={{ maxWidth: '680px', margin: '2rem auto' }}>
      <div className="glass-card" style={{ padding: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Sprout size={36} style={{ color: 'var(--primary)' }} />
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Farmer Profile & Settings</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                Build trust with local consumers by showcasing your farm photos & practices.
              </p>
            </div>
          </div>
          <span className="role-pill role-farmer">Farmer Account</span>
        </div>

        {saved && (
          <div style={{ padding: '0.85rem 1.25rem', background: '#dcfce7', color: '#15803d', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={18} /> Farm profile updated successfully!
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-row" style={{ marginBottom: '1.25rem' }}>
            <div className="form-group">
              <label style={{ fontWeight: 600 }}>Farmer Full Name</label>
              <input
                type="text"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label style={{ fontWeight: 600 }}>Phone Number</label>
              <input
                type="tel"
                className="form-control"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontWeight: 600 }}>Farm Name</label>
            <input
              type="text"
              className="form-control"
              value={farmName}
              onChange={(e) => setFarmName(e.target.value)}
              placeholder="e.g. Sri Lakshmi Organic Farm"
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontWeight: 600 }}>Farm Location / Village & Region</label>
            <input
              type="text"
              className="form-control"
              value={farmLocation}
              onChange={(e) => setFarmLocation(e.target.value)}
              placeholder="e.g. Kankipadu Village, Vijayawada Region"
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontWeight: 600 }}><Camera size={16} /> Farm Cover Photo URL</label>
            <input
              type="url"
              className="form-control"
              value={farmPhotoUrl}
              onChange={(e) => setFarmPhotoUrl(e.target.value)}
              placeholder="https://images.unsplash.com/photo-1595974482597..."
            />
            {farmPhotoUrl && (
              <div style={{ marginTop: '0.75rem', borderRadius: 'var(--radius-sm)', overflow: 'hidden', height: '140px', background: 'var(--bg-main)' }}>
                <img src={farmPhotoUrl} alt="Farm Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
          </div>

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontWeight: 600 }}>Farming Practice Method</label>
            <select
              className="form-control"
              value={farmingPractice}
              onChange={(e) => setFarmingPractice(e.target.value)}
            >
              <option value="Organic">100% Organic Farming</option>
              <option value="Natural">ZBNF / Natural Farming</option>
              <option value="Hydroponic">Hydroponic / Protected Farming</option>
              <option value="Conventional">Transitional / Conventional</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontWeight: 600 }}><Award size={16} /> Certifications & Badges (Comma-separated)</label>
            <input
              type="text"
              className="form-control"
              value={certifications}
              onChange={(e) => setCertifications(e.target.value)}
              placeholder="e.g. Certified Organic, PGS-India, Zero Chemical"
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontWeight: 600 }}>Farmer Story & Bio</label>
            <textarea
              className="form-control"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell consumers about your farming history, family heritage, and commitment to fresh food..."
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading} style={{ fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <Save size={18} /> {loading ? 'Saving Changes...' : 'Save & Update Profile'}
          </button>
        </form>

        {/* Bottom Actions: Log Out & Delete Account */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
          <button onClick={logout} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <LogOut size={18} /> Log Out
          </button>
          <button onClick={() => setShowDeleteModal(true)} className="btn btn-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Trash2 size={18} /> Delete Account
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="glass-card animate-fade-in" style={{ maxWidth: '440px', width: '100%', padding: '2rem', background: '#ffffff' }}>
            <h3 style={{ color: '#dc2626', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 0 }}>
              <Trash2 size={22} /> Delete Farmer Account?
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Are you sure you want to permanently delete your FarmConnect farmer account? Your active produce listings and profile will be deactivated. This action cannot be undone.
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

export default FarmerProfilePage;
