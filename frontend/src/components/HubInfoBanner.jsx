import React from 'react';
import { MapPin, Clock, Info } from 'lucide-react';
import './HubInfoBanner.css';

const HubInfoBanner = ({ hubName, pickupWindow, isWindowOpen = true, closeWindowText }) => {
  return (
    <div className={`hub-info-banner glass-card ${!isWindowOpen ? 'banner-closed' : ''}`}>
      <div className="banner-content">
        <div className="hub-location">
          <MapPin size={18} className="icon-emerald" />
          <span>Showing produce for: <strong>{hubName || 'Governorpet / MG Road Hub'}</strong></span>
        </div>

        <div className="cycle-window-alert">
          <Clock size={16} />
          {isWindowOpen ? (
            <span>Order window OPEN {closeWindowText ? `• ${closeWindowText}` : '• Pickup Friday 6-9 PM'}</span>
          ) : (
            <span className="text-warning">Order window CLOSED • Next pickup opens Monday</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default HubInfoBanner;
