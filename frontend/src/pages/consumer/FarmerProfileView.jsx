import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import ProduceCard from '../../components/ProduceCard';
import { useCart } from '../../context/CartContext';
import { Sprout, MapPin, MessageSquare, ShieldCheck, Award, CheckCircle2, Phone, Mail } from 'lucide-react';

const FarmerProfileView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [farmer, setFarmer] = useState(null);
  const [produce, setProduce] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleAddToCart = (produceItem, quantity = 1) => {
    addToCart(produceItem, quantity);
    navigate('/consumer/cart');
  };

  useEffect(() => {
    API.get(`/consumer/farmers/${id}`)
      .then((res) => {
        if (res.data.success) {
          setFarmer(res.data.farmer);
          setProduce(res.data.produce || []);
        }
      })
      .catch((err) => console.error('Error loading farmer profile:', err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="page-wrapper text-center" style={{ padding: '4rem' }}><h3>Loading farmer trust profile...</h3></div>;
  if (!farmer) return <div className="page-wrapper text-center" style={{ padding: '4rem' }}><h3>Farmer Profile Not Found</h3></div>;

  const farmUser = farmer.user;
  const farmPhoto = farmer.farmPhotos?.[0] || 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=800&q=80';
  const farmName = farmer.farmName || farmUser?.name || 'Local Farm';
  const location = farmer.farmLocation || 'Vijayawada Region';
  const practice = farmer.farmingPractice || 'Organic';
  const certificationsList = Array.isArray(farmer.certifications)
    ? farmer.certifications
    : typeof farmer.certifications === 'string' && farmer.certifications.length > 0
    ? farmer.certifications.split(',')
    : ['Verified Local Producer', 'Chemical Free'];

  const handleStartChat = () => {
    const farmerUserObj = farmUser ? farmUser : { _id: farmer._id, name: farmName };
    navigate('/consumer/chat', { state: { farmerUser: farmerUserObj } });
  };

  return (
    <div className="page-wrapper animate-fade-in">
      {/* Header Banner & Trust Hero Card */}
      <div className="glass-card" style={{ padding: '0', overflow: 'hidden', marginBottom: '2rem' }}>
        {/* Cover Photo */}
        <div style={{ width: '100%', height: '220px', position: 'relative', background: 'var(--bg-main)' }}>
          <img
            src={farmPhoto}
            alt={farmName}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(16, 185, 129, 0.95)', color: '#ffffff', padding: '0.4rem 0.85rem', borderRadius: 'var(--radius-sm)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
            <ShieldCheck size={16} /> Admin Verified Farmer
          </div>
        </div>

        {/* Farmer Information Block */}
        <div style={{ padding: '1.75rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ flex: 1, minWidth: '280px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{farmName}</h2>
              <span className="badge badge-organic" style={{ fontSize: '0.85rem', padding: '0.3rem 0.75rem' }}>
                <Sprout size={14} /> {practice}
              </span>
            </div>

            <p style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.95rem', marginBottom: '0.75rem' }}>
              <MapPin size={16} className="icon-emerald" /> {location}
            </p>

            <p style={{ fontSize: '1rem', lineHeight: '1.5', color: 'var(--text-main)', marginBottom: '1.25rem' }}>
              {farmer.bio || 'Dedicated to bringing fresh, chemical-free produce directly from our fields to your community distribution hub.'}
            </p>

            {/* Certifications & Trust Badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
              <strong style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Award size={14} /> Badges:
              </strong>
              {certificationsList.map((cert, idx) => (
                <span key={idx} style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)', padding: '0.25rem 0.65rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: 'var(--text-main)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                  <CheckCircle2 size={12} style={{ color: '#10b981' }} /> {cert.trim()}
                </span>
              ))}
            </div>
          </div>

          {/* Action Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: '200px' }}>
            <button onClick={handleStartChat} className="btn btn-primary btn-lg" style={{ fontWeight: 700, width: '100%' }}>
              <MessageSquare size={18} /> Chat with Farmer
            </button>

            {farmUser?.phone && (
              <a href={`tel:${farmUser.phone}`} className="btn btn-secondary" style={{ width: '100%', fontSize: '0.85rem' }}>
                <Phone size={14} /> {farmUser.phone}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Harvested Crops Grid */}
      <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Sprout size={20} className="icon-emerald" /> Fresh Produce Harvested by {farmName} ({produce.length})
      </h3>

      {produce.length === 0 ? (
        <div className="glass-card text-center" style={{ padding: '3rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>No produce currently listed for this harvest cycle.</p>
        </div>
      ) : (
        <div className="produce-grid">
          {produce.map((item) => (
            <ProduceCard key={item._id} produce={{ ...item, farmer }} onAddToCart={handleAddToCart} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FarmerProfileView;
