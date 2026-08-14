import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { Store, Plus, AlertCircle, MapPin } from 'lucide-react';

const HubManagementPage = () => {
  const [hubs, setHubs] = useState([]);
  const [regions, setRegions] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [error, setError] = useState('');

  // Form
  const [name, setName] = useState('');
  const [regionId, setRegionId] = useState('');
  const [anchorAddress, setAnchorAddress] = useState('');
  const [pincodesInput, setPincodesInput] = useState('');

  useEffect(() => {
    fetchHubsAndRegions();
  }, []);

  const fetchHubsAndRegions = () => {
    Promise.all([API.get('/admin/hubs'), API.get('/admin/regions')])
      .then(([hubRes, regRes]) => {
        if (hubRes.data.success) setHubs(hubRes.data.hubs);
        if (regRes.data.success) {
          setRegions(regRes.data.regions);
          if (regRes.data.regions.length > 0) setRegionId(regRes.data.regions[0]._id);
        }
      })
      .catch((err) => console.error('Error fetching hubs:', err));
  };

  const handleCreateHub = async (e) => {
    e.preventDefault();
    setError('');

    const pincodesCovered = pincodesInput.split(',').map((p) => p.trim()).filter(Boolean);

    try {
      const res = await API.post('/admin/hubs', {
        name,
        regionId,
        anchorAddress,
        pincodesCovered,
      });

      if (res.data.success) {
        setShowAdd(false);
        setName('');
        setAnchorAddress('');
        setPincodesInput('');
        fetchHubsAndRegions();
      } else {
        setError(res.data.message || 'Failed to create hub');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating hub. Limit of 5 hubs per region may be reached.');
    }
  };

  return (
    <div className="page-wrapper animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2>Community Hub Management</h2>
          <p style={{ color: 'var(--text-muted)' }}>Max 5 Hubs Enforced Per Region (Launch V1)</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="btn btn-primary">
          <Plus size={18} /> {showAdd ? 'Cancel' : 'Add New Hub'}
        </button>
      </div>

      {showAdd && (
        <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Create Distribution Hub</h3>
          {error && (
            <div className="auth-error-alert" style={{ marginBottom: '1rem' }}>
              <AlertCircle size={18} /> {error}
            </div>
          )}

          <form onSubmit={handleCreateHub}>
            <div className="form-row">
              <div className="form-group">
                <label>Hub Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Governorpet / MG Road Hub"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Assign Region</label>
                <select className="form-control" value={regionId} onChange={(e) => setRegionId(e.target.value)}>
                  {regions.map((reg) => (
                    <option key={reg._id} value={reg._id}>{reg.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Anchor Location Address</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Community Hall, MG Road, Vijayawada"
                value={anchorAddress}
                onChange={(e) => setAnchorAddress(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Covered Pincodes (Comma separated)</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. 520002, 520003, 520010"
                value={pincodesInput}
                onChange={(e) => setPincodesInput(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block btn-lg" style={{ marginTop: '1rem' }}>
              Create Hub
            </button>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {hubs.map((hub) => (
          <div key={hub._id} className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Store size={20} className="icon-emerald" />
              <h3 style={{ fontSize: '1.1rem' }}>{hub.name}</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>{hub.anchorAddress}</p>
            <div style={{ fontSize: '0.8rem', background: 'var(--bg-main)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
              <strong>Covered Pincodes:</strong> {hub.pincodesCovered?.join(', ') || '520002'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HubManagementPage;
