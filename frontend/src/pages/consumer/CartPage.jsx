import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import PriceBreakdownDisplay from '../../components/PriceBreakdownDisplay';
import OrderCycleCountdown from '../../components/OrderCycleCountdown';
import API from '../../services/api';
import { ShoppingBag, Trash2, Plus, Minus, CheckCircle2, MapPin } from 'lucide-react';

const CartPage = () => {
  const { cartItems, updateQuantity, removeFromCart, clearCart, cartTotals } = useCart();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    setLoading(true);
    setError('');

    try {
      const itemsPayload = cartItems.map((item) => ({
        produceId: item.produceId,
        quantity: item.quantity,
      }));

      const res = await API.post('/consumer/orders', { items: itemsPayload });
      if (res.data.success) {
        clearCart();
        const primaryOrder = (res.data.orders && res.data.orders[0]) || res.data.order;
        navigate('/consumer/order-confirmation', { state: { order: primaryOrder, orders: res.data.orders } });
      } else {
        setError(res.data.message || 'Order placement failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order. Window may be closed.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="page-wrapper animate-fade-in text-center" style={{ padding: '3rem 1rem' }}>
        <div className="glass-card" style={{ padding: '3rem', maxWidth: '540px', margin: '0 auto' }}>
          <ShoppingBag size={54} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <h2>Your Cart is Empty</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Explore local organic produce from your assigned community hub.</p>
          <button onClick={() => navigate('/consumer/home')} className="btn btn-primary btn-lg">Browse Produce</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper animate-fade-in">
      <h2 style={{ marginBottom: '1rem' }}>Shopping Cart & Hub Pickup Confirmation</h2>

      <div style={{ marginBottom: '1.5rem' }}>
        <OrderCycleCountdown compact={true} cycleTitle="Weekly Checkout Window" />
      </div>

      {error && (
        <div className="auth-error-alert" style={{ marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Items List */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Selected Produce</h3>
          {cartItems.map((item) => (
            <div key={item.produceId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid var(--border-color)' }}>
              <div>
                <h4 style={{ fontSize: '1.05rem' }}>{item.name}</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>₹{item.pricePerUnit} / {item.unit}</p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button onClick={() => updateQuantity(item.produceId, item.quantity - 1)} className="btn btn-secondary" style={{ padding: '0.2rem 0.5rem' }}><Minus size={14} /></button>
                <span style={{ fontWeight: 700 }}>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.produceId, item.quantity + 1)} className="btn btn-secondary" style={{ padding: '0.2rem 0.5rem' }}><Plus size={14} /></button>
              </div>

              <div style={{ textAlign: 'right' }}>
                <p style={{ fontWeight: 800, color: 'var(--primary)' }}>₹{(item.pricePerUnit * item.quantity).toFixed(2)}</p>
                <button onClick={() => removeFromCart(item.produceId)} style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem' }}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>

        {/* Price Transparency & Checkout Panel */}
        <div>
          <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
            <h3 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <MapPin size={18} className="icon-emerald" /> Pickup Hub
            </h3>
            <p style={{ fontWeight: 700 }}>{profile?.assignedHub?.name || 'Governorpet / MG Road Hub'}</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{profile?.assignedHub?.anchorAddress || 'Community Center, Vijayawada'}</p>
          </div>

          <PriceBreakdownDisplay
            pricePerUnit={cartTotals.subtotal}
            farmerEarning={cartTotals.farmerEarningTotal}
            platformFee={cartTotals.platformFeeTotal}
            deliveryCost={cartTotals.deliveryCostTotal}
            quantity={1}
          />

          <button onClick={handleCheckout} className="btn btn-primary btn-block btn-lg" style={{ marginTop: '1rem' }} disabled={loading}>
            <CheckCircle2 size={18} /> {loading ? 'Placing Order...' : 'Place Cash-on-Delivery Order'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
