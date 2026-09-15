import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import OrderCycleCountdown from '../../components/OrderCycleCountdown';
import { Calendar, Plus, Clock, Sparkles, CheckCircle2 } from 'lucide-react';

const OrderCyclesPage = () => {
  const [cycles, setCycles] = useState([]);
  const [hubs, setHubs] = useState([]);
  const [regions, setRegions] = useState([]);
  const [schedule, setSchedule] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  // Form
  const [regionId, setRegionId] = useState('');
  const [hubId, setHubId] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    Promise.all([
      API.get('/admin/all-cycles'),
      API.get('/admin/hubs'),
      API.get('/admin/regions'),
      API.get('/cycles/active'),
    ])
      .then(([cycleRes, hubRes, regRes, activeRes]) => {
        if (cycleRes.data.success) setCycles(cycleRes.data.cycles);
        if (hubRes.data.success) {
          setHubs(hubRes.data.hubs);
          if (hubRes.data.hubs.length > 0) setHubId(hubRes.data.hubs[0]._id);
        }
        if (regRes.data.success) {
          setRegions(regRes.data.regions);
          if (regRes.data.regions.length > 0) setRegionId(regRes.data.regions[0]._id);
        }
        if (activeRes.data.success && activeRes.data.schedule) {
          setSchedule(activeRes.data.schedule);
        }
      })
      .catch((err) => console.error('Error fetching cycles:', err));
  };

  const handleCreateCycle = async (e) => {
    e.preventDefault();
    try {
      await API.post('/cycles', {
        regionId,
        hubId,
      });
      setShowAdd(false);
      fetchData();
    } catch (err) {
      console.error('Error creating cycle:', err);
    }
  };

  return (
    <div className="page-wrapper animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>Weekly Order Cycles Overview</h2>
          <p style={{ color: 'var(--text-muted)' }}>Automated Weekly Schedule: Monday 9:00 AM – Thursday 9:00 PM</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span className="badge badge-organic" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.45rem 0.85rem' }}>
            <Sparkles size={14} /> Auto-Pilot Active
          </span>
          <button onClick={() => setShowAdd(!showAdd)} className="btn btn-secondary">
            <Plus size={16} /> {showAdd ? 'Cancel' : 'Manual Cycle'}
          </button>
        </div>
      </div>

      {/* Live Weekly Cycle Countdown */}
      <div style={{ marginBottom: '2rem' }}>
        <OrderCycleCountdown
          targetDate={schedule?.orderWindowClose}
          isWindowOpen={schedule?.isWindowOpen}
          cycleTitle="System-Wide Active Cycle Window"
        />
      </div>

      {showAdd && (
        <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem', maxWidth: '540px' }}>
          <h3 style={{ marginBottom: '1rem' }}>Manual Cycle Override</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            The background auto-scheduler already creates cycles automatically every Monday at 9:00 AM. Use this only if you need a manual override.
          </p>
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
              Provision Hub Cycle
            </button>
          </form>
        </div>
      )}

      <h3 style={{ marginBottom: '1rem' }}>All Provisioned Hub Order Cycles ({cycles.length})</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {cycles.map((cyc) => (
          <div key={cyc._id} className="glass-card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h4 style={{ fontSize: '1.05rem', marginBottom: '0.25rem' }}>
                Hub: {cyc.hub?.name || 'Community Hub'} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 400 }}>({cyc.region?.name || 'Regional Cluster'})</span>
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <strong>Window:</strong> {new Date(cyc.orderWindowOpen).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} → {new Date(cyc.orderWindowClose).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--primary)', marginTop: '0.2rem' }}>
                <strong>Farmer Drop-off & Pickup:</strong> {new Date(cyc.deliveryDate).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })} (6:00 – 9:00 PM)
              </p>
            </div>
            <span className={`badge badge-${cyc.status === 'open' ? 'organic' : 'conventional'}`}>
              Status: {cyc.status.toUpperCase()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderCyclesPage;
