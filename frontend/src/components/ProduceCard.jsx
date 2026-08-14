import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Eye, Sprout } from 'lucide-react';
import PriceBreakdownDisplay from './PriceBreakdownDisplay';
import { getAutoCropImage } from '../utils/cropImageGenerator';
import './ProduceCard.css';

const ProduceCard = ({ produce, onAddToCart, onSelect, isFarmerView = false, onEdit, onDelete }) => {
  const [showBreakdownModal, setShowBreakdownModal] = useState(false);

  const farmerName = produce.farmer?.farmName || produce.farmer?.user?.name || 'Local Farmer';
  const practiceTag = produce.practiceTag || produce.farmer?.farmingPractice || 'Organic';
  const displayImage = produce.images && produce.images[0] ? produce.images[0] : getAutoCropImage(produce.name);

  return (
    <div className="produce-card glass-card animate-fade-in">
      <div className="produce-image-wrapper" onClick={() => onSelect && onSelect(produce)} style={{ cursor: onSelect ? 'pointer' : 'default' }}>
        <img
          src={displayImage}
          alt={produce.name}
          className="produce-image"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = getAutoCropImage(produce.name);
          }}
        />
        <span className={`badge badge-${practiceTag.toLowerCase()}`}>
          <Sprout size={12} /> {practiceTag}
        </span>
      </div>

      <div className="produce-body">
        <div className="produce-header" onClick={() => onSelect && onSelect(produce)} style={{ cursor: onSelect ? 'pointer' : 'default' }}>
          <h3 className="produce-title">{produce.name}</h3>
          <span className="produce-price">₹{produce.pricePerUnit} / {produce.unit}</span>
        </div>

        {produce.farmer && (
          <p className="farmer-byline">
            By <Link to={`/consumer/farmers/${produce.farmer._id || produce.farmer}`} className="farmer-link">{farmerName}</Link>
          </p>
        )}

        {/* Transparent Cost Summary Preview */}
        <div className="price-preview-row" onClick={() => setShowBreakdownModal(!showBreakdownModal)}>
          <span className="direct-farmer-pct">
            🌾 ₹{produce.farmerEarning || (produce.pricePerUnit * 0.75).toFixed(0)} to Farmer
          </span>
          <button type="button" className="btn-toggle-breakdown">
            <Eye size={14} /> {showBreakdownModal ? 'Hide' : 'Breakdown'}
          </button>
        </div>

        {showBreakdownModal && (
          <PriceBreakdownDisplay
            farmerEarning={produce.farmerEarning}
            platformFee={produce.platformFee}
            deliveryCost={produce.deliveryCost}
            pricePerUnit={produce.pricePerUnit}
            unit={produce.unit}
          />
        )}

        <div className="produce-actions">
          {!isFarmerView ? (
            <button onClick={() => onAddToCart && onAddToCart(produce)} className="btn btn-primary btn-add-cart">
              <ShoppingBag size={16} /> Add to Cart
            </button>
          ) : (
            <div className="farmer-action-buttons">
              <button onClick={() => onEdit && onEdit(produce)} className="btn btn-secondary btn-sm">Edit</button>
              <button onClick={() => onDelete && onDelete(produce._id)} className="btn btn-danger btn-sm">Delete</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProduceCard;
