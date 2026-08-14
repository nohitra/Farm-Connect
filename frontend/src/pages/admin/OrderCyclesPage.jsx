import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { Calendar, Plus, Clock } from 'lucide-react';

const OrderCyclesPage = () => {
  const [cycles, setCycles] = useState([]);
  const [hubs, setHubs] = useState([]);
  const [regions, setRegions] = useState([]);
  const [showAdd, setShowAdd] = useState(false);

  // Form
  const [regionId, setRegionId] = useState('');
  const [hubId, setHubId] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    Promise.all([API.get('/admin/all-cycles'), API.get('/admin/hubs'), API.get('/admin/regions')])
      .then(([cycleRes, hubRes, regRes]) => {
        if (cycleRes.data.success) setCycles(cycleRes.data.cycles);
        if (hubRes.data.success) {
          setHubs(hubRes.data.hubs);
          if (hubRes.data.hubs.length > 0) setHubId(hubRes.data.hubs[0]._id);
        }
        if (regRes.data.success) {
          setRegions(regRes.data.regions);
          if (regRes.data.regions.length > 0) setRegionId(regRes.data.regions[0]._id);
        }
      })
      .catch((err) => console.error('Error fetching cycles:', err));
  };

  const handleCreateCycle = async (e) => {
    e.preventDefault();
    const now = new Date();
    const openDate = now;
    const closeDate = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000); // 4 days window
    const deliveryDate = new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000); // Friday delivery

    try {
      await API.post('/cycles', {
        regionId,
        hubId,
        orderWindowOpen: openDate,
        orderWindowClose: closeDate,
        deliveryDate,
      });
      setShowAdd(false);
      fetchData();
    } catch (err) {
      console.error('Error creating cycle:', err);
    }
  };

  return (
    <div className="page-wrapper animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>Weekly Order Cycles Overview</h2>
        <button onClick={() => setShowAdd(!showAdd)} className="btn btn-primary">
          <Plus size={18} /> {showAdd ? 'Cancel' : 'Create Weekly Cycle'}
        </button>
      </div>

      {showAdd && (
        <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem', maxWidth: '540px' }}>
          <h3 style={{ marginBottom: '1rem' }}>Create Weekly Order Cycle</h3>
          <form onSubmit={handleCreateCycle}>
            <div className="form-group">
              <label>Select Hub</label>
              <select className="form-control" value={hubId} onChange={(e) => setHubId(e.target.value)}>
                {hubs.map((h) => (
                  <option key={h._id} value={h._id}>{h.name}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn btn-primary btn-block btn-lg">
              Launch Order Cycle
            </button>
          </form>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {cycles.map((cyc) => (
          <div key={cyc._id} className="glass-card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ fontSize: '1.05rem' }}>Hub: {cyc.hub?.name || 'Community Hub'}</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Window Close: {new Date(cyc.orderWindowClose).toLocaleDateString()} • Delivery: {new Date(cyc.deliveryDate).toLocaleDateString()}
              </p>
            </div>
            <span className={`badge badge-${cyc.status === 'open' ? 'organic' : 'conventional'}`}>
              Status: {cyc.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderCyclesPage;
