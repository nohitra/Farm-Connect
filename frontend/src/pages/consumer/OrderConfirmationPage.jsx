import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import PriceBreakdownDisplay from '../../components/PriceBreakdownDisplay';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import { CheckCircle, MapPin, ShoppingBag, MessageSquare } from 'lucide-react';

const OrderConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState(location.state?.order || (location.state?.orders && location.state.orders[0]) || null);
  const [loading, setLoading] = useState(!order);

  useEffect(() => {
    if (!order) {
      // Fetch latest order placed by consumer if state is missing
      API.get('/consumer/orders')
        .then((res) => {
          if (res.data.success && res.data.orders.length > 0) {
            setOrder(res.data.orders[0]);
          }
        })
        .catch((err) => console.error('Error fetching order confirmation:', err))
        .finally(() => setLoading(false));
    }
  }, [order]);

  if (loading) {
    return (
      <div className="page-wrapper text-center" style={{ padding: '3rem' }}>
        <h3>Confirming order details...</h3>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="page-wrapper text-center animate-fade-in" style={{ padding: '3rem 1rem' }}>
        <div className="glass-card" style={{ padding: '3rem', maxWidth: '500px', margin: '0 auto' }}>
          <ShoppingBag size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <h2>No Order Found</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>You haven't placed an order yet in this session.</p>
          <Link to="/consumer/my-orders" className="btn btn-primary">View My Orders</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper animate-fade-in" style={{ maxWidth: '640px', margin: '1.5rem auto' }}>
      <div className="glass-card text-center" style={{ padding: '2.5rem' }}>
        <CheckCircle size={56} style={{ color: '#10b981', marginBottom: '0.75rem' }} />
        <h2>Order Placed Successfully!</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Order ID: #{order._id}</p>

        <div style={{ display: 'inline-block', marginBottom: '1.5rem' }}>
          <OrderStatusBadge status={order.orderStatus || order.status || 'ordered'} />
        </div>

        <div style={{ textAlign: 'left', background: 'var(--bg-main)', padding: '1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
            <MapPin size={18} className="icon-emerald" /> Pickup Hub Details
          </h4>
          <p style={{ fontWeight: 700 }}>{order.hub?.name || 'Governorpet / MG Road Hub'}</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Payment: Cash on Delivery (COD) at Hub Pickup</p>
        </div>

        <PriceBreakdownDisplay
          pricePerUnit={order.totalAmount}
          farmerEarning={order.totalFarmerEarning}
          platformFee={order.totalPlatformFee}
          deliveryCost={order.totalDeliveryCost}
          quantity={1}
        />

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          <Link to="/consumer/my-orders" className="btn btn-primary" style={{ flex: 1 }}>Track My Order</Link>
          <Link to="/consumer/home" className="btn btn-secondary" style={{ flex: 1 }}>Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
