import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { MapPin, Plus, CheckCircle2 } from 'lucide-react';

const RegionManagementPage = () => {
  const [regions, setRegions] = useState([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRegions();
  }, []);

  const fetchRegions = () => {
    API.get('/admin/regions')
      .then((res) => {
        if (res.data.success) setRegions(res.data.regions);
      })
      .catch((err) => console.error('Error fetching regions:', err))
      .finally(() => setLoading(false));
  };

  const handleCreateRegion = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await API.post('/admin/regions', { name });
      setName('');
      fetchRegions();
    } catch (err) {
      console.error('Error creating region:', err);
    }
  };

  return (
    <div className="page-wrapper animate-fade-in">
      <h2>Region Management</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Configure launched geographic clusters.</p>

      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem', maxWidth: '540px' }}>
        <h3 style={{ marginBottom: '1rem' }}>Add New Region</h3>
        <form onSubmit={handleCreateRegion} style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            className="form-control"
            placeholder="e.g. Visakhapatnam Cluster"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-primary"><Plus size={18} /> Add</button>
        </form>
      </div>

      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Launched Regions</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {regions.map((reg) => (
            <div key={reg._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MapPin size={16} className="icon-emerald" /> {reg.name}
              </span>
              <span className="badge badge-organic">Active</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RegionManagementPage;
