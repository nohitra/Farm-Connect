import React from 'react';
import './ProduceSkeletonLoader.css';

const ProduceSkeletonLoader = ({ count = 6 }) => {
  return (
    <div className="produce-grid">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="produce-skeleton-card glass-card">
          <div className="skeleton-image shimmer" />
          <div className="skeleton-body">
            <div className="skeleton-line title shimmer" />
            <div className="skeleton-line subtitle shimmer" />
            <div className="skeleton-line price shimmer" />
            <div className="skeleton-button shimmer" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProduceSkeletonLoader;
