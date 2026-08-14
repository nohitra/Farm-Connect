import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import StatCard from '../../components/StatCard';
import { Sprout, ShoppingBag, AlertCircle, Milk, Wheat } from 'lucide-react';

const FarmerDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [demandTab, setDemandTab] = useState('all'); // 'all' | 'farm' | 'dairy'

  useEffect(() => {
    API.get('/farmer/dashboard')
      .then((res) => {
        if (res.data.success) {
          setDashboardData(res.data);
        }
      })
      .catch((err) => console.error('Error fetching farmer dashboard:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-wrapper text-center"><h3>Loading Farmer Dashboard...</h3></div>;

  const isPending = dashboardData?.verificationStatus === 'pending';
  const farmProduceCount = dashboardData?.farmProduceCount ?? dashboardData?.stats?.farmProduceCount ?? 0;
  const dairyProduceCount = dashboardData?.dairyProduceCount ?? dashboardData?.stats?.dairyProduceCount ?? 0;
  const assignedHubsCount = dashboardData?.assignedHubsCount ?? dashboardData?.stats?.assignedHubsCount ?? 1;

  const aggregatedDemand = dashboardData?.aggregatedDemand || [];
  const farmDemand = aggregatedDemand.filter((item) => !item.isDairy);
  const dairyDemand = aggregatedDemand.filter((item) => item.isDairy);

  const displayedDemand =
    demandTab === 'farm' ? farmDemand : demandTab === 'dairy' ? dairyDemand : aggregatedDemand;

  return (
    <div className="page-wrapper animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2>Farmer Dashboard</h2>
          <p style={{ color: 'var(--text-muted)' }}>{dashboardData?.farmName || dashboardData?.farmerProfile?.farmName || 'My Farm'}</p>
        </div>
        <Link to="/farmer/produce" className="btn btn-primary"><Sprout size={18} /> Manage Produce & Dairy</Link>
      </div>

      {isPending && (
        <div className="glass-card" style={{ padding: '1.25rem', background: '#fef3c7', color: '#92400e', borderLeft: '4px solid #f59e0b', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
            <AlertCircle size={20} /> Application Pending Admin Approval
          </div>
          <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Your farm profile is currently undergoing verification. You will be able to list produce as soon as an admin approves your profile.
          </p>
        </div>
      )}

      {/* Metrics Row: Farm Products vs Dairy Products vs Hubs */}
      <div className="stat-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <StatCard
          title="Farm Products"
          value={farmProduceCount}
          subtitle="Active Crop Listings"
          icon={Wheat}
          color="emerald"
        />
        <StatCard
          title="Dairy Products"
          value={dairyProduceCount}
          subtitle="Milk & Dairy Items"
          icon={Milk}
          color="purple"
        />
        <StatCard
          title="Assigned Hubs"
          value={assignedHubsCount}
          subtitle="Community Distribution Hubs"
          icon={ShoppingBag}
          color="blue"
        />
      </div>

      {/* Aggregated Demand Summary with Tabs */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0 }}>Aggregated Demand For Upcoming Delivery Cycle</h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setDemandTab('all')}
              className={`btn btn-sm ${demandTab === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            >
              All Products ({aggregatedDemand.length})
            </button>
            <button
              onClick={() => setDemandTab('farm')}
              className={`btn btn-sm ${demandTab === 'farm' ? 'btn-primary' : 'btn-secondary'}`}
            >
              <Wheat size={14} /> Farm Crops ({farmDemand.length})
            </button>
            <button
              onClick={() => setDemandTab('dairy')}
              className={`btn btn-sm ${demandTab === 'dairy' ? 'btn-primary' : 'btn-secondary'}`}
            >
              <Milk size={14} /> Dairy ({dairyDemand.length})
            </button>
          </div>
        </div>

        {displayedDemand.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No aggregated demand orders yet for this category in active cycle windows.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {displayedDemand.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.85rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-sm)', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {item.isDairy ? <Milk size={16} className="icon-emerald" /> : <Wheat size={16} className="icon-emerald" />}
                  <div>
                    <span style={{ fontWeight: 700 }}>{item.produceName || 'Product Item'}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>({item.hubName || 'Local Hub'})</span>
                  </div>
                </div>
                <div style={{ fontWeight: 800, color: 'var(--primary)' }}>
                  {item.totalQuantity} {item.unit || 'units'} needed
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmerDashboard;
