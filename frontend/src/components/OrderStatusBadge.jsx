import React from 'react';
import { Clock, CheckCircle2, Package, CheckCheck, XCircle } from 'lucide-react';
import './OrderStatusBadge.css';

const OrderStatusBadge = ({ status }) => {
  const normalizedStatus = (status || 'ordered').toLowerCase();

  const statusConfig = {
    ordered: { label: 'Ordered', icon: Clock, className: 'status-ordered' },
    confirmed: { label: 'Confirmed', icon: CheckCircle2, className: 'status-confirmed' },
    ready: { label: 'Ready at Hub', icon: Package, className: 'status-ready' },
    'picked-up': { label: 'Picked Up', icon: CheckCheck, className: 'status-pickedup' },
    cancelled: { label: 'Cancelled', icon: XCircle, className: 'status-cancelled' },
  };

  const config = statusConfig[normalizedStatus] || statusConfig.ordered;
  const Icon = config.icon;

  return (
    <span className={`order-status-badge ${config.className}`}>
      <Icon size={14} />
      {config.label}
    </span>
  );
};

export default OrderStatusBadge;
