import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sprout, MapPin, CheckCircle, MessageSquare, ShieldCheck } from 'lucide-react';
import './FarmerCard.css';

const FarmerCard = ({ farmer, onChatClick }) => {
  const navigate = useNavigate();
  const farmUser = farmer.user;
  const farmName = farmer.farmName || farmUser?.name || 'Organic Farm';
  const location = farmer.farmLocation || 'Vijayawada Region';
  const practice = farmer.farmingPractice || 'Organic';
  const photo = farmer.farmPhotos?.[0] || 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=400&q=80';

  const handleChat = (e) => {
    e.preventDefault();
    const farmerUserObj = farmUser ? farmUser : { _id: farmer._id, name: farmName };
    if (onChatClick) {
      onChatClick(farmerUserObj);
    } else {
      navigate('/consumer/chat', { state: { farmerUser: farmerUserObj } });
    }
  };

  return (
    <div className="farmer-card glass-card animate-fade-in">
      <div className="farmer-avatar-wrapper">
        <img
          src={photo}
          alt={farmName}
          className="farmer-image"
        />
        <span className="verified-badge" title="Admin Verified Farmer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
          <ShieldCheck size={13} /> Verified
        </span>
      </div>

      <div className="farmer-card-body">
        <h3 className="farmer-card-name">{farmName}</h3>
        <p className="farmer-card-location">
          <MapPin size={14} /> {location}
        </p>

        <div className="farmer-tags">
          <span className="badge badge-organic">
            <Sprout size={12} /> {practice}
          </span>
        </div>

        {farmer.bio && <p className="farmer-card-bio">{farmer.bio}</p>}

        <div className="farmer-card-actions">
          <Link to={`/consumer/farmers/${farmer._id}`} className="btn btn-secondary btn-sm">
            View Farm & Crops
          </Link>
          <button onClick={handleChat} className="btn btn-primary btn-sm">
            <MessageSquare size={14} /> Chat
          </button>
        </div>
      </div>
    </div>
  );
};

export default FarmerCard;
