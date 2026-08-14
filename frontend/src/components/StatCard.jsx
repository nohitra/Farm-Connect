import React from 'react';
import './StatCard.css';

const StatCard = ({ title, value, subtitle, icon: Icon, color = 'emerald' }) => {
  return (
    <div className={`stat-card glass-card stat-color-${color}`}>
      <div className="stat-card-header">
        <span className="stat-title">{title}</span>
        {Icon && <div className="stat-icon-wrapper"><Icon size={20} /></div>}
      </div>
      <div className="stat-value">{value}</div>
      {subtitle && <div className="stat-subtitle">{subtitle}</div>}
    </div>
  );
};

export default StatCard;
