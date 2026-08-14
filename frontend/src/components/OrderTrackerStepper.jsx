import React from 'react';
import { ShoppingBag, CheckCircle, Truck, PackageCheck, Clock } from 'lucide-react';
import './OrderTrackerStepper.css';

const STEPS = [
  { key: 'ordered', label: 'Order Placed', icon: ShoppingBag },
  { key: 'confirmed', label: 'Farmer Confirmed', icon: CheckCircle },
  { key: 'ready', label: 'Ready at Hub', icon: Truck },
  { key: 'picked-up', label: 'Picked Up', icon: PackageCheck },
];

const OrderTrackerStepper = ({ status = 'ordered' }) => {
  const normalizedStatus = (status || 'ordered').toLowerCase();
  
  const getStepIndex = (s) => {
    switch (s) {
      case 'ordered': return 0;
      case 'confirmed': return 1;
      case 'ready': return 2;
      case 'picked-up': return 3;
      default: return 0;
    }
  };

  const currentIndex = getStepIndex(normalizedStatus);

  return (
    <div className="stepper-container">
      <div className="stepper-track">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isCompleted = idx <= currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={step.key} className={`stepper-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
              <div className="step-icon-circle">
                <Icon size={16} />
              </div>
              <span className="step-label">{step.label}</span>
              {idx < STEPS.length - 1 && <div className={`step-line ${idx < currentIndex ? 'completed' : ''}`} />}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderTrackerStepper;
