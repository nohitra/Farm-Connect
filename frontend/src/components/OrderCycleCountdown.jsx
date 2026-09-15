import React, { useState, useEffect } from 'react';
import { Clock, Calendar, CheckCircle, AlertTriangle, Sparkles } from 'lucide-react';
import './OrderCycleCountdown.css';

/**
 * Calculates current Monday 9:00 AM to Thursday 9:00 PM recurring cycle on frontend
 */
const getFrontendWeeklyCycleTimes = () => {
  const ref = new Date();
  const day = ref.getDay(); // 0 is Sun, 1 is Mon, ... 6 is Sat
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const currentMonday = new Date(ref);
  currentMonday.setDate(ref.getDate() + diffToMonday);
  currentMonday.setHours(0, 0, 0, 0);

  const orderWindowOpen = new Date(currentMonday);
  orderWindowOpen.setHours(9, 0, 0, 0);

  const orderWindowClose = new Date(currentMonday);
  orderWindowClose.setDate(currentMonday.getDate() + 3); // Thursday
  orderWindowClose.setHours(21, 0, 0, 0);

  const deliveryDate = new Date(currentMonday);
  deliveryDate.setDate(currentMonday.getDate() + 4); // Friday
  deliveryDate.setHours(18, 0, 0, 0);

  const nextCycleOpen = new Date(currentMonday);
  nextCycleOpen.setDate(currentMonday.getDate() + 7); // Next Monday
  nextCycleOpen.setHours(9, 0, 0, 0);

  const isWindowOpen = ref >= orderWindowOpen && ref < orderWindowClose;
  const targetTimestamp = isWindowOpen
    ? orderWindowClose.getTime()
    : (ref < orderWindowOpen ? orderWindowOpen.getTime() : nextCycleOpen.getTime());

  return {
    isWindowOpen,
    orderWindowOpen,
    orderWindowClose,
    deliveryDate,
    nextCycleOpen,
    targetTimestamp,
  };
};

const OrderCycleCountdown = ({
  targetDate,
  isWindowOpen: propIsWindowOpen,
  cycleTitle = 'Weekly Order Window',
  compact = false,
}) => {
  const [cycleInfo, setCycleInfo] = useState(getFrontendWeeklyCycleTimes);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
      setCycleInfo(getFrontendWeeklyCycleTimes());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const effectiveTarget = targetDate ? new Date(targetDate).getTime() : cycleInfo.targetTimestamp;
  const isCurrentlyOpen = propIsWindowOpen !== undefined ? propIsWindowOpen : cycleInfo.isWindowOpen;

  const diffMs = Math.max(0, effectiveTarget - now);
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
  const seconds = Math.floor((diffMs / 1000) % 60);

  if (!isCurrentlyOpen) {
    return (
      <div className={`countdown-container closed-cycle glass-card ${compact ? 'countdown-compact' : ''}`}>
        <div className="countdown-header" style={{ color: '#f59e0b' }}>
          <AlertTriangle size={18} className="countdown-icon text-amber" />
          <span className="countdown-title">
            This Week's Ordering Window is Closed (Thu 9:00 PM Deadline Passed)
          </span>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.25rem 0 0.5rem 0' }}>
          Farmers are harvesting and preparing Friday hub delivery.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
          <Sparkles size={16} className="icon-emerald" />
          <span>Next Cycle Opens in: {days}d {hours}h {minutes}m {seconds}s (Monday 9:00 AM)</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`countdown-container glass-card ${compact ? 'countdown-compact' : ''}`}>
      <div className="countdown-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={18} className="countdown-icon icon-emerald animate-pulse" />
          <span className="countdown-title">{cycleTitle} (Mon 9 AM – Thu 9 PM)</span>
        </div>
        <span className="badge badge-organic" style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}>
          Window OPEN
        </span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.5rem' }}>
        <div className="countdown-digits">
          <div className="digit-box">
            <span className="digit-val">{String(days).padStart(2, '0')}</span>
            <span className="digit-lbl">Days</span>
          </div>
          <span className="digit-sep">:</span>
          <div className="digit-box">
            <span className="digit-val">{String(hours).padStart(2, '0')}</span>
            <span className="digit-lbl">Hours</span>
          </div>
          <span className="digit-sep">:</span>
          <div className="digit-box">
            <span className="digit-val">{String(minutes).padStart(2, '0')}</span>
            <span className="digit-lbl">Mins</span>
          </div>
          <span className="digit-sep">:</span>
          <div className="digit-box">
            <span className="digit-val">{String(seconds).padStart(2, '0')}</span>
            <span className="digit-lbl">Secs</span>
          </div>
        </div>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Calendar size={14} className="icon-emerald" />
          <span>Hub Pickup: <strong>Friday 6:00 – 9:00 PM</strong></span>
        </div>
      </div>
    </div>
  );
};

export default OrderCycleCountdown;
