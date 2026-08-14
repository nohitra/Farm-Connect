import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { Users, CheckCircle, XCircle, Edit3, Save, X, Building, MapPin, Phone, User, Sprout, Check } from 'lucide-react';

const FarmerVerificationPage = () => {
  const [farmers, setFarmers] = useState([]);
  const [hubs, setHubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingFarmer, setEditingFarmer] = useState(null);

  // Edit Modal Form State
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    farmName: '',
    farmLocation: '',
    farmingPractice: 'organic',
    verificationStatus: 'approved',
    assignedHubs: [],
  });
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    fetchFarmersAndHubs();
  }, []);

  const fetchFarmersAndHubs = async () => {
    try {
      const [farmerRes, hubRes] = await Promise.all([
        API.get('/admin/farmers'),
        API.get('/admin/hubs'),
      ]);
      if (farmerRes.data.success) setFarmers(farmerRes.data.farmers);
      if (hubRes.data.success) setHubs(hubRes.data.hubs);
    } catch (err) {
      console.error('Error fetching admin farmer verification data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (farmerProfileId, status) => {
    try {
      await API.patch(`/admin/farmers/${farmerProfileId}/verify`, { status });
      fetchFarmersAndHubs();
    } catch (err) {
      console.error('Error verifying farmer:', err);
    }
  };

  const handleOpenEditModal = (farmer) => {
    setEditingFarmer(farmer);
    setEditForm({
      name: farmer.user?.name || '',
      phone: farmer.user?.phone || '',
      farmName: farmer.farmName || '',
      farmLocation: farmer.farmLocation || '',
      farmingPractice: farmer.farmingPractice || 'organic',
      verificationStatus: farmer.verificationStatus || 'approved',
      assignedHubs: Array.isArray(farmer.assignedHubs) ? farmer.assignedHubs.map(h => typeof h === 'object' ? h._id : h) : [],
    });
    setSaveMessage('');
  };

  const handleToggleHubAssignment = (hubId) => {
    const current = editForm.assignedHubs;
    if (current.includes(hubId)) {
      setEditForm({ ...editForm, assignedHubs: current.filter(id => id !== hubId) });
    } else {
      setEditForm({ ...editForm, assignedHubs: [...current, hubId] });
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingFarmer) return;
    setSaving(true);
    setSaveMessage('');

    try {
      const res = await API.put(`/admin/farmers/${editingFarmer._id}`, editForm);
      if (res.data.success) {
        setSaveMessage('🎉 Farmer details updated successfully!');
        fetchFarmersAndHubs();
        setTimeout(() => {
          setEditingFarmer(null);
        }, 1200);
      }
    } catch (err) {
      console.error('Error updating farmer:', err);
      setSaveMessage('❌ Error saving changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-wrapper animate-fade-in">
      <div style={{ marginBottom: '1.5rem' }}>
        <h2>Farmer Verification Queue & Management</h2>
        <p style={{ color: 'var(--text-muted)' }}>Approve onboarding applications & manage assigned delivery hubs.</p>
      </div>

      {loading ? (
        <div className="text-center" style={{ padding: '3rem' }}><h3>Loading queue...</h3></div>
      ) : farmers.length === 0 ? (
        <div className="glass-card text-center" style={{ padding: '3rem', borderRadius: 'var(--radius-lg)' }}>
          <Users size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <h3>No Farmer Applications Found</h3>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {farmers.map((farm) => {
            const isPending = farm.verificationStatus === 'pending';
            const isApproved = farm.verificationStatus === 'approved';
            const isRejected = farm.verificationStatus === 'rejected';

            return (
              <div
                key={farm._id}
                className="glass-card"
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  borderRadius: 'var(--radius-lg)',
                }}
              >
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                    {farm.farmName || farm.user?.name}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    Farmer: <strong>{farm.user?.name}</strong> • Email: {farm.user?.email} • Phone: {farm.user?.phone}
                    <br />
                    Location: {farm.farmLocation || 'N/A'} • Practice: <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{farm.farmingPractice}</span>
                  </p>
                  
                  {/* Assigned Hubs Badges */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Hubs:</span>
                    {Array.isArray(farm.assignedHubs) && farm.assignedHubs.length > 0 ? (
                      farm.assignedHubs.map((h) => (
                        <span key={typeof h === 'object' ? h._id : h} className="badge badge-info" style={{ fontSize: '0.75rem' }}>
                          <Building size={12} style={{ marginRight: '3px' }} />
                          {typeof h === 'object' ? h.name : 'Hub'}
                        </span>
                      ))
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', italic: 'true' }}>No Hubs Assigned</span>
                    )}
                  </div>

                  <div style={{ marginTop: '0.6rem' }}>
                    <span className={`badge badge-${(farm.verificationStatus || 'pending').toLowerCase()}`}>
                      Status: {farm.verificationStatus.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* ACTION BUTTONS: Show Approve/Reject when Pending; Show Edit button once Approved or Rejected */}
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  {isPending ? (
                    <>
                      <button onClick={() => handleVerify(farm._id, 'approved')} className="btn btn-primary btn-sm" style={{ fontWeight: 600 }}>
                        <CheckCircle size={16} /> Approve
                      </button>
                      <button onClick={() => handleVerify(farm._id, 'rejected')} className="btn btn-danger btn-sm" style={{ fontWeight: 600 }}>
                        <XCircle size={16} /> Reject
                      </button>
                    </>
                  ) : (
                    /* Show Edit Button After Decision (Approved or Rejected) */
                    <button
                      onClick={() => handleOpenEditModal(farm)}
                      className="btn btn-secondary btn-sm"
                      style={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem' }}
                    >
                      <Edit3 size={16} /> Edit Farmer
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* EDIT FARMER MODAL */}
      {editingFarmer && (
        <div className="modal-backdrop animate-fade-in" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="glass-card" style={{ background: '#ffffff', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Edit3 size={20} className="icon-emerald" /> Edit Farmer Details
              </h3>
              <button onClick={() => setEditingFarmer(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            {saveMessage && (
              <div style={{ padding: '0.75rem 1rem', background: saveMessage.includes('🎉') ? '#d1fae5' : '#fee2e2', color: saveMessage.includes('🎉') ? '#065f46' : '#991b1b', borderRadius: '8px', marginBottom: '1rem', fontWeight: 600, fontSize: '0.85rem' }}>
                {saveMessage}
              </div>
            )}

            <form onSubmit={handleSaveEdit}>
              <div className="form-row">
                <div className="form-group">
                  <label><User size={14} /> Farmer Person Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label><Phone size={14} /> Contact Phone</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label><Sprout size={14} /> Farm Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editForm.farmName}
                    onChange={(e) => setEditForm({ ...editForm, farmName: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Farming Practice</label>
                  <select
                    className="form-control"
                    value={editForm.farmingPractice}
                    onChange={(e) => setEditForm({ ...editForm, farmingPractice: e.target.value })}
                  >
                    <option value="organic">Organic Certified</option>
                    <option value="natural">Natural (Zero Chemical)</option>
                    <option value="conventional">Conventional</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label><MapPin size={14} /> Farm Village / Location</label>
                <input
                  type="text"
                  className="form-control"
                  value={editForm.farmLocation}
                  onChange={(e) => setEditForm({ ...editForm, farmLocation: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Verification Status</label>
                <select
                  className="form-control"
                  value={editForm.verificationStatus}
                  onChange={(e) => setEditForm({ ...editForm, verificationStatus: e.target.value })}
                >
                  <option value="approved">Approved (Active Farmer)</option>
                  <option value="pending">Pending Admin Verification</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {/* Assigned Hubs Selection Checkboxes */}
              <div className="form-group" style={{ marginTop: '1.25rem' }}>
                <label style={{ fontWeight: 700, marginBottom: '0.5rem', display: 'block' }}>
                  <Building size={14} /> Manage Assigned Distribution Hubs
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '160px', overflowY: 'auto', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc' }}>
                  {hubs.map((h) => {
                    const isSelected = editForm.assignedHubs.includes(h._id);
                    return (
                      <label key={h._id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleHubAssignment(h._id)}
                          style={{ accentColor: '#10b981' }}
                        />
                        <span style={{ fontWeight: isSelected ? 700 : 400 }}>{h.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                <button type="button" onClick={() => setEditingFarmer(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving} style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Save size={16} /> {saving ? 'Saving Changes...' : 'Save Profile Edits'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerVerificationPage;
