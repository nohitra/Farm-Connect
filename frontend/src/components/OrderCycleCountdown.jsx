import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import './OrderCycleCountdown.css';

const OrderCycleCountdown = ({ targetDate, cycleTitle = 'Current Order Window' }) => {
  // Store a fixed target timestamp so countdown decreases smoothly every second
  const [endTime] = useState(() => {
    if (targetDate) {
      return new Date(targetDate).getTime();
    }
    // Fixed target time (2 days, 4 hours, 35 minutes, 45 seconds from component initialization)
    return Date.now() + (2 * 24 * 3600 * 1000 + 4 * 3600 * 1000 + 35 * 60 * 1000 + 45 * 1000);
  });

  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(endTime));

  function calculateTimeLeft(targetTimestamp) {
    const difference = targetTimestamp - Date.now();

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / (1000 * 60)) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      isExpired: false,
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(endTime));
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  if (timeLeft.isExpired) {
    return (
      <div className="countdown-container expired glass-card">
        <AlertTriangle size={18} className="countdown-icon text-amber" />
        <span>Order window for this cycle has closed. Next cycle opens tomorrow!</span>
      </div>
    );
  }

  return (
    <div className="countdown-container glass-card">
      <div className="countdown-header">
        <Clock size={18} className="countdown-icon icon-emerald animate-pulse" />
        <span className="countdown-title">{cycleTitle} Closes In:</span>
      </div>
      <div className="countdown-digits">
        <div className="digit-box">
          <span className="digit-val">{String(timeLeft.days).padStart(2, '0')}</span>
          <span className="digit-lbl">Days</span>
        </div>
        <span className="digit-sep">:</span>
        <div className="digit-box">
          <span className="digit-val">{String(timeLeft.hours).padStart(2, '0')}</span>
          <span className="digit-lbl">Hrs</span>
        </div>
        <span className="digit-sep">:</span>
        <div className="digit-box">
          <span className="digit-val">{String(timeLeft.minutes).padStart(2, '0')}</span>
          <span className="digit-lbl">Mins</span>
        </div>
        <span className="digit-sep">:</span>
        <div className="digit-box">
          <span className="digit-val">{String(timeLeft.seconds).padStart(2, '0')}</span>
          <span className="digit-lbl">Secs</span>
        </div>
      </div>
    </div>
  );
};

export default OrderCycleCountdown;
