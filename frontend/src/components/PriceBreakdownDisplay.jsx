import React from 'react';
import { Sprout, ShieldCheck, Truck } from 'lucide-react';
import './PriceBreakdownDisplay.css';

/**
 * Reusable Price Breakdown Component (Task 9 & Frontend Spec)
 * Renders transparent 3-part cost breakdown: Farmer Share %, Platform Fee %, Delivery Cost %
 */
const PriceBreakdownDisplay = ({
  farmerEarning = 0,
  platformFee = 0,
  deliveryCost = 0,
  pricePerUnit = 0,
  quantity = 1,
  unit = 'kg',
  showDetails = true,
}) => {
  const qty = Number(quantity) || 1;
  const totalPrice = (Number(pricePerUnit) || farmerEarning + platformFee + deliveryCost) * qty;
  const farmerTotal = (Number(farmerEarning) || totalPrice * 0.75) * qty;
  const platformTotal = (Number(platformFee) || totalPrice * 0.1) * qty;
  const deliveryTotal = (Number(deliveryCost) || totalPrice * 0.15) * qty;

  const farmerPct = totalPrice > 0 ? Math.round((farmerTotal / totalPrice) * 100) : 75;
  const platformPct = totalPrice > 0 ? Math.round((platformTotal / totalPrice) * 100) : 10;
  const deliveryPct = totalPrice > 0 ? Math.round((deliveryTotal / totalPrice) * 100) : 15;

  return (
    <div className="price-breakdown-card glass-card">
      <div className="price-breakdown-header">
        <span className="price-breakdown-title">100% Price Transparency</span>
        <span className="price-breakdown-total">₹{totalPrice.toFixed(2)}</span>
      </div>

      {/* Visual 3-Part Stacked Bar */}
      <div className="breakdown-bar-container">
        <div
          className="bar-segment bar-farmer"
          style={{ width: `${farmerPct}%` }}
          title={`Farmer Share: ${farmerPct}%`}
        />
        <div
          className="bar-segment bar-platform"
          style={{ width: `${platformPct}%` }}
          title={`Platform Fee: ${platformPct}%`}
        />
        <div
          className="bar-segment bar-delivery"
          style={{ width: `${deliveryPct}%` }}
          title={`Hub Logistics: ${deliveryPct}%`}
        />
      </div>

      {showDetails && (
        <div className="breakdown-items-list">
          <div className="breakdown-row">
            <span className="breakdown-label text-farmer">
              <Sprout size={14} /> Direct to Farmer ({farmerPct}%)
            </span>
            <span className="breakdown-value">₹{farmerTotal.toFixed(2)}</span>
          </div>

          <div className="breakdown-row">
            <span className="breakdown-label text-platform">
              <ShieldCheck size={14} /> Platform Fee ({platformPct}%)
            </span>
            <span className="breakdown-value">₹{platformTotal.toFixed(2)}</span>
          </div>

          <div className="breakdown-row">
            <span className="breakdown-label text-delivery">
              <Truck size={14} /> Hub Logistics ({deliveryPct}%)
            </span>
            <span className="breakdown-value">₹{deliveryTotal.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceBreakdownDisplay;
