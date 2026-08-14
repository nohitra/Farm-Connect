import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import PriceBreakdownDisplay from '../../components/PriceBreakdownDisplay';
import OrderTrackerStepper from '../../components/OrderTrackerStepper';
import StatCard from '../../components/StatCard';
import FarmerCard from '../../components/FarmerCard';
import { ShoppingBag, Heart, Users, Flame, Sprout, MessageSquare, MapPin, PackageCheck, CheckCircle2 } from 'lucide-react';
import './MyOrdersPage.css';

const MyOrdersPage = () => {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'impact' | 'farmers'
  const [orders, setOrders] = useState([]);
  const [impactStats, setImpactStats] = useState(null);
  const [farmersSupported, setFarmersSupported] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pickupAlert, setPickupAlert] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch orders
      try {
        const ordersRes = await API.get('/consumer/orders');
        if (ordersRes.data?.success) {
          setOrders(ordersRes.data.orders || []);
        }
      } catch (err) {
        console.error('Error fetching consumer orders:', err);
      }

      // Fetch dashboard / impact stats
      try {
        const dashRes = await API.get('/consumer/dashboard');
        if (dashRes.data?.success) {
          setImpactStats(dashRes.data.impactStats || dashRes.data.impact);
          if (dashRes.data.myFarmers || dashRes.data.farmers) {
            setFarmersSupported(dashRes.data.myFarmers || dashRes.data.farmers || []);
          }
        }
      } catch (err) {
        console.error('Error fetching impact stats:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPickup = async (orderId) => {
    try {
      const res = await API.patch(`/consumer/orders/${orderId}/pickup`);
      if (res.data.success) {
        setPickupAlert('🎉 Order pickup confirmed! The tracking timeline is complete.');
        setTimeout(() => setPickupAlert(''), 5000);
        fetchData();
      }
    } catch (err) {
      console.error('Error confirming pickup:', err);
    }
  };

  const handleStartChatWithFarmer = (farmerUser) => {
    if (!farmerUser) return;
    navigate('/consumer/chat', { state: { farmerUser } });
  };

  return (
    <div className="page-wrapper animate-fade-in">
      <h2 style={{ marginBottom: '1.25rem' }}>My Activity, Order Tracking & Impact</h2>

      {/* Tabs Bar */}
      <div className="my-orders-tabs glass-card">
        <button
          className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          <ShoppingBag size={18} /> Track Orders ({orders.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'impact' ? 'active' : ''}`}
          onClick={() => setActiveTab('impact')}
        >
          <Heart size={18} style={{ color: '#ef4444' }} /> Consumer Impact
        </button>
        <button
          className={`tab-btn ${activeTab === 'farmers' ? 'active' : ''}`}
          onClick={() => setActiveTab('farmers')}
        >
          <Users size={18} /> My Farmers ({farmersSupported.length})
        </button>
      </div>

      {pickupAlert && (
        <div className="glass-card" style={{ padding: '0.85rem 1.25rem', marginBottom: '1.25rem', borderLeft: '4px solid #10b981', background: 'rgba(16, 185, 129, 0.1)', color: '#065f46' }}>
          <strong>✅ Pickup Complete:</strong> {pickupAlert}
        </div>
      )}

      {loading ? (
        <div className="text-center" style={{ padding: '3rem' }}><h3>Loading activity data...</h3></div>
      ) : (
        <>
          {/* TAB 1: ORDERS TRACKING */}
          {activeTab === 'orders' && (
            <div className="orders-list">
              {orders.length === 0 ? (
                <div className="glass-card text-center" style={{ padding: '3rem' }}>
                  <ShoppingBag size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
                  <h3>No Active Orders</h3>
                  <p style={{ color: 'var(--text-muted)' }}>Place your first order to support local farmers!</p>
                  <Link to="/consumer/home" className="btn btn-primary" style={{ marginTop: '1rem' }}>Browse Fresh Produce</Link>
                </div>
              ) : (
                orders.map((order) => {
                  const currentStatus = order.status || order.orderStatus || 'ordered';
                  const farmerUser = order.farmer?.user;
                  const farmerName = order.farmer?.farmName || farmerUser?.name || 'Local Farmer';

                  return (
                    <div key={order._id} className="order-card glass-card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
                      <div className="order-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div>
                          <h4 style={{ fontSize: '1.1rem' }}>Order #{order._id.substring(order._id.length - 8)}</h4>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            Placed on {new Date(order.createdAt).toLocaleDateString()} • Farmer: <strong>{farmerName}</strong>
                          </p>
                        </div>
                        <OrderStatusBadge status={currentStatus} />
                      </div>

                      {/* Step-by-Step Order Tracker Progress Bar */}
                      <OrderTrackerStepper status={currentStatus} />

                      {/* Hub Pickup Info & Actions */}
                      <div style={{ background: 'var(--bg-main)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem' }}>
                          <MapPin size={16} className="icon-emerald" />
                          <span>Pickup Hub: <strong>{order.hub?.name || 'Governorpet / MG Road Hub'}</strong></span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          {farmerUser && (
                            <button onClick={() => handleStartChatWithFarmer(farmerUser)} className="btn btn-secondary btn-sm">
                              <MessageSquare size={14} /> Chat with Farmer
                            </button>
                          )}
                          {currentStatus === 'ready' && (
                            <button onClick={() => handleConfirmPickup(order._id)} className="btn btn-primary btn-sm" style={{ fontWeight: 700 }}>
                              <PackageCheck size={14} /> Confirm I Picked Up
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="order-items-summary" style={{ marginBottom: '1rem' }}>
                        {order.items.map((item, idx) => (
                          <div key={idx} className="order-item-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px dashed var(--border-color)', fontSize: '0.9rem' }}>
                            <span>{item.name || 'Produce Item'} x {item.quantity} {item.unit || 'kg'}</span>
                            <span style={{ fontWeight: 700 }}>₹{(item.priceAtOrder * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      <PriceBreakdownDisplay
                        pricePerUnit={order.totalAmount}
                        farmerEarning={order.totalFarmerEarning}
                        platformFee={order.totalPlatformFee}
                        deliveryCost={order.totalDeliveryCost}
                        quantity={1}
                      />
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: IMPACT DASHBOARD */}
          {activeTab === 'impact' && (
            <div className="impact-container animate-fade-in">
              <div className="stat-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
                <StatCard
                  title="Lifetime Spend"
                  value={`₹${impactStats?.totalSpent || impactStats?.totalLifetimeSpent || 0}`}
                  subtitle="100% Price Transparent"
                  icon={ShoppingBag}
                  color="blue"
                />
                <StatCard
                  title="Direct to Farmers"
                  value={`₹${impactStats?.totalFarmerEarning || impactStats?.totalMoneyToFarmers || 0}`}
                  subtitle="75-80% Earnings Retained"
                  icon={Sprout}
                  color="emerald"
                />
                <StatCard
                  title="Farmers Supported"
                  value={impactStats?.distinctFarmersCount || impactStats?.distinctFarmersSupportedCount || 0}
                  subtitle="Local Community Farms"
                  icon={Users}
                  color="purple"
                />
                <StatCard
                  title="Weekly Order Streak"
                  value={`${impactStats?.weeklyOrderStreak || 0} Weeks 🔥`}
                  subtitle="Consecutive Hub Cycles"
                  icon={Flame}
                  color="amber"
                />
              </div>
            </div>
          )}

          {/* TAB 3: MY FARMERS */}
          {activeTab === 'farmers' && (
            <div className="farmers-grid animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {farmersSupported.length === 0 ? (
                <div className="glass-card text-center" style={{ padding: '3rem', gridColumn: '1 / -1' }}>
                  <Users size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
                  <h3>No Farmers Supported Yet</h3>
                  <p style={{ color: 'var(--text-muted)' }}>Place orders to connect directly with regional farmers.</p>
                </div>
              ) : (
                farmersSupported.map((fItem, idx) => (
                  <FarmerCard key={idx} farmer={fItem.farmerProfile || fItem} />
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyOrdersPage;
