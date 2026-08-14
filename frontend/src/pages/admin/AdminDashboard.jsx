import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import StatCard from '../../components/StatCard';
import { MapPin, Store, Users, Calendar, ArrowRight, ShieldCheck } from 'lucide-react';

const AdminDashboard = () => {
  const [regions, setRegions] = useState([]);
  const [hubs, setHubs] = useState([]);
  const [pendingFarmers, setPendingFarmers] = useState([]);
  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      API.get('/admin/regions'),
      API.get('/admin/hubs'),
      API.get('/admin/farmers?status=pending'),
      API.get('/admin/all-cycles'),
    ])
      .then(([regRes, hubRes, farmerRes, cycleRes]) => {
        if (regRes.data.success) setRegions(regRes.data.regions);
        if (hubRes.data.success) setHubs(hubRes.data.hubs);
        if (farmerRes.data.success) setPendingFarmers(farmerRes.data.farmers);
        if (cycleRes.data.success) setCycles(cycleRes.data.cycles);
      })
      .catch((err) => console.error('Error fetching admin dashboard:', err))
      .finally(() => setLoading(false));
  }, []);

  const activeCycles = cycles.filter((c) => c.status === 'open');

  return (
    <div className="page-wrapper animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2>Admin Control Center</h2>
          <p style={{ color: 'var(--text-muted)' }}>Regional Operations & Verification Oversight</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link to="/admin/farmers" className="btn btn-accent"><Users size={16} /> Verification Queue ({pendingFarmers.length})</Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="stat-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <StatCard
          title="Active Regions"
          value={regions.length}
          subtitle="Regional Clusters"
          icon={MapPin}
          color="emerald"
        />
        <StatCard
          title="Community Hubs"
          value={hubs.length}
          subtitle="Max 5 Per Region Enforced"
          icon={Store}
          color="blue"
        />
        <StatCard
          title="Pending Farmers"
          value={pendingFarmers.length}
          subtitle="Awaiting Profile Verification"
          icon={Users}
          color="amber"
        />
        <StatCard
          title="Active Order Cycles"
          value={activeCycles.length}
          subtitle="Open Hub Cycles"
          icon={Calendar}
          color="purple"
        />
      </div>

      {/* Operations Quick Action Cards */}
      <h3 style={{ marginBottom: '1rem' }}>Platform Operations & Controls</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        <Link to="/admin/regions" className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', textDecoration: 'none', color: 'inherit' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <MapPin size={24} className="icon-emerald" />
            <ArrowRight size={18} style={{ color: 'var(--text-muted)' }} />
          </div>
          <h4 style={{ fontSize: '1.1rem' }}>Region Management</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Configure regional clusters (Vijayawada, Hyderabad).</p>
        </Link>

        <Link to="/admin/hubs" className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', textDecoration: 'none', color: 'inherit' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Store size={24} style={{ color: '#3b82f6' }} />
            <ArrowRight size={18} style={{ color: 'var(--text-muted)' }} />
          </div>
          <h4 style={{ fontSize: '1.1rem' }}>Hub Management</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Add/Edit community distribution hubs with 5-hub limit UI check.</p>
        </Link>

        <Link to="/admin/farmers" className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', textDecoration: 'none', color: 'inherit' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <ShieldCheck size={24} style={{ color: '#f59e0b' }} />
            <ArrowRight size={18} style={{ color: 'var(--text-muted)' }} />
          </div>
          <h4 style={{ fontSize: '1.1rem' }}>Farmer Verification Queue</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Approve or reject pending farmer onboarding applications.</p>
        </Link>

        <Link to="/admin/hub-requests" className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', textDecoration: 'none', color: 'inherit' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Users size={24} style={{ color: '#8b5cf6' }} />
            <ArrowRight size={18} style={{ color: 'var(--text-muted)' }} />
          </div>
          <h4 style={{ fontSize: '1.1rem' }}>Hub Commitment Approvals</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Review farmer hub commitment requests.</p>
        </Link>

        <Link to="/admin/cycles" className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', textDecoration: 'none', color: 'inherit' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Calendar size={24} style={{ color: '#ec4899' }} />
            <ArrowRight size={18} style={{ color: 'var(--text-muted)' }} />
          </div>
          <h4 style={{ fontSize: '1.1rem' }}>Weekly Order Cycles</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Launch and monitor order open/close windows per hub.</p>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
