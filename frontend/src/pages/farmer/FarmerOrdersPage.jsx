import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import { ShoppingBag, Truck, CheckCheck, PackageCheck, AlertCircle } from 'lucide-react';

const FarmerOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState('');

  useEffect(() => {
    fetchFarmerOrders();
  }, []);

  const fetchFarmerOrders = () => {
    API.get('/farmer/orders')
      .then((res) => {
        if (res.data.success) setOrders(res.data.orders);
      })
      .catch((err) => console.error('Error fetching farmer orders:', err))
      .finally(() => setLoading(false));
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    setActionSuccess('');
    try {
      const res = await API.patch(`/farmer/orders/${orderId}/status`, { status: newStatus });
      if (res.data.success) {
        setActionSuccess(`Order status successfully updated to ${newStatus.toUpperCase()}!`);
        setTimeout(() => setActionSuccess(''), 4000);
        fetchFarmerOrders();
      }
    } catch (err) {
      console.error('Error updating order status:', err);
    }
  };

  const handleBulkMarkDelivered = async () => {
    setActionSuccess('');
    const pendingOrders = orders.filter((o) => {
      const st = o.status || o.orderStatus || 'ordered';
      return st === 'ordered' || st === 'confirmed';
    });

    try {
      await Promise.all(
        pendingOrders.map((o) => API.patch(`/farmer/orders/${o._id}/status`, { status: 'ready' }))
      );
      setActionSuccess('All pending orders in cycle marked as DELIVERED TO HUB!');
      setTimeout(() => setActionSuccess(''), 4000);
      fetchFarmerOrders();
    } catch (err) {
      console.error('Bulk update error:', err);
    }
  };

  // Compute Aggregated Demand per produce item
  const aggregatedDemandMap = {};
  orders.forEach((o) => {
    const st = o.status || o.orderStatus || 'ordered';
    if (st !== 'cancelled') {
      o.items.forEach((item) => {
        const key = item.name || 'Crop';
        if (!aggregatedDemandMap[key]) {
          aggregatedDemandMap[key] = { name: key, totalQty: 0, unit: item.unit || 'kg' };
        }
        aggregatedDemandMap[key].totalQty += item.quantity;
      });
    }
  });

  const aggregatedDemandList = Object.values(aggregatedDemandMap);

  const hasPendingOrders = orders.some((o) => {
    const st = o.status || o.orderStatus || 'ordered';
    return st === 'ordered' || st === 'confirmed';
  });

  return (
    <div className="page-wrapper animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>Incoming Orders & Hub Harvest Drop-off</h2>
          <p style={{ color: 'var(--text-muted)' }}>Aggregated Demand & Order Lifecycle Management</p>
        </div>

        {hasPendingOrders && (
          <button onClick={handleBulkMarkDelivered} className="btn btn-primary btn-lg">
            <PackageCheck size={20} /> Mark Entire Cycle as Delivered to Hub
          </button>
        )}
      </div>

      {actionSuccess && (
        <div className="glass-card" style={{ padding: '0.85rem 1.25rem', marginBottom: '1.25rem', borderLeft: '4px solid #10b981', color: '#065f46', background: 'rgba(16, 185, 129, 0.1)' }}>
          <strong>✅ Success:</strong> {actionSuccess}
        </div>
      )}

      {/* Aggregated Harvest Demand Summary Card */}
      {aggregatedDemandList.length > 0 && (
        <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem', borderLeft: '4px solid var(--primary)' }}>
          <h3 style={{ marginBottom: '0.75rem', fontSize: '1.1rem' }}>📦 Aggregated Harvest Demand for Hub Drop-off</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
            {aggregatedDemandList.map((demand, idx) => (
              <div key={idx} style={{ background: 'var(--bg-main)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{demand.name}</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)' }}>
                  {demand.totalQty} {demand.unit}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center" style={{ padding: '3rem' }}><h3>Loading orders...</h3></div>
      ) : orders.length === 0 ? (
        <div className="glass-card text-center" style={{ padding: '3rem', marginTop: '1rem' }}>
          <ShoppingBag size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <h3>No Orders Yet</h3>
          <p style={{ color: 'var(--text-muted)' }}>Orders placed by consumers for your assigned hub will appear here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {orders.map((order) => {
            const currentStatus = order.status || order.orderStatus || 'ordered';
            const consumerName = order.consumer?.user?.name || order.consumer?.name || 'Local Neighbor';

            return (
              <div key={order._id} className="glass-card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <h4 style={{ fontSize: '1.05rem' }}>Order #{order._id.substring(order._id.length - 8)}</h4>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Consumer: <strong>{consumerName}</strong>
                    </span>
                  </div>
                  <OrderStatusBadge status={currentStatus} />
                </div>

                <div style={{ padding: '0.75rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }}>
                  {order.items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', padding: '0.2rem 0' }}>
                      <span>{item.name || 'Produce Item'}</span>
                      <span style={{ fontWeight: 700 }}>{item.quantity} {item.unit || 'kg'}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  {currentStatus === 'ordered' && (
                    <button onClick={() => handleUpdateStatus(order._id, 'confirmed')} className="btn btn-secondary btn-sm" style={{ padding: '0.4rem 0.85rem', fontWeight: 700 }}>
                      <CheckCheck size={16} /> Confirm Order
                    </button>
                  )}
                  {(currentStatus === 'ordered' || currentStatus === 'confirmed') && (
                    <button onClick={() => handleUpdateStatus(order._id, 'ready')} className="btn btn-primary btn-sm" style={{ padding: '0.4rem 0.85rem', fontWeight: 700 }}>
                      <Truck size={16} /> Bulk Dropped at Hub (Ready)
                    </button>
                  )}
                  {currentStatus === 'ready' && (
                    <button onClick={() => handleUpdateStatus(order._id, 'picked-up')} className="btn btn-primary btn-sm" style={{ padding: '0.4rem 0.85rem', fontWeight: 700 }}>
                      <PackageCheck size={16} /> Mark Consumer Picked Up
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FarmerOrdersPage;
