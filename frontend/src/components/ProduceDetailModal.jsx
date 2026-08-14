import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PriceBreakdownDisplay from './PriceBreakdownDisplay';
import { getAutoCropImage } from '../utils/cropImageGenerator';
import { X, Sprout, ShoppingBag, Plus, Minus, Calendar, User } from 'lucide-react';
import './ProduceDetailModal.css';

const ProduceDetailModal = ({ produce, onClose, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);

  if (!produce) return null;

  const handleAdd = () => {
    onAddToCart(produce, quantity);
    onClose();
  };

  const farmerName = produce.farmer?.farmName || produce.farmer?.user?.name || 'Local Farm';
  const displayImage = produce.images && produce.images[0] ? produce.images[0] : getAutoCropImage(produce.name);

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="modal-body">
          <div className="modal-image-wrapper">
            <img
              src={displayImage}
              alt={produce.name}
              className="modal-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = getAutoCropImage(produce.name);
              }}
            />
            <span className="badge badge-organic modal-badge">
              <Sprout size={12} /> {produce.practiceTag || 'Organic'}
            </span>
          </div>

          <div className="modal-info">
            <h2>{produce.name}</h2>

            <div className="farmer-link-row">
              <User size={16} className="icon-emerald" />
              <span>Harvested by: </span>
              <Link to={`/consumer/farmers/${produce.farmer?._id || produce.farmer}`} className="farmer-link" onClick={onClose}>
                <strong>{farmerName}</strong>
              </Link>
            </div>

            {produce.harvestDate && (
              <div className="harvest-date-row">
                <Calendar size={15} /> Harvested on {new Date(produce.harvestDate).toLocaleDateString()}
              </div>
            )}

            <div className="modal-price-row">
              <span className="unit-price">₹{produce.pricePerUnit}</span>
              <span className="price-unit">/ {produce.unit}</span>
            </div>

            {/* 100% Price Breakdown Component */}
            <div className="modal-breakdown-wrapper">
              <PriceBreakdownDisplay
                farmerEarning={produce.farmerEarning}
                platformFee={produce.platformFee}
                deliveryCost={produce.deliveryCost}
                pricePerUnit={produce.pricePerUnit}
                unit={produce.unit}
                quantity={quantity}
              />
            </div>

            {/* Quantity Selector & Action */}
            <div className="modal-action-row">
              <div className="quantity-controls">
                <button
                  type="button"
                  className="qty-btn"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus size={16} />
                </button>
                <span className="qty-value">{quantity}</span>
                <button
                  type="button"
                  className="qty-btn"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus size={16} />
                </button>
              </div>

              <button type="button" className="btn btn-primary btn-lg add-cart-btn" onClick={handleAdd}>
                <ShoppingBag size={18} /> Add to Cart (₹{(produce.pricePerUnit * quantity).toFixed(2)})
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProduceDetailModal;
