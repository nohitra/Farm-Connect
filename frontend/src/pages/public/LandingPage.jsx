import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sprout, ShoppingBag, ArrowRight, LayoutDashboard, LogOut } from 'lucide-react';
import './LandingPage.css';

const LandingPage = () => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div className="landing-container page-wrapper animate-fade-in">
      {/* Hero Section */}
      <section className="hero-section glass-card">
        <div className="hero-content">
          <span className="badge badge-organic">Direct From Farm • Zero Middlemen</span>
          <h1 className="hero-title">
            Fresh Local Produce with <span className="highlight-text">100% Price Transparency</span>
          </h1>
          <p className="hero-subtitle">
            FarmConnect aggregates harvests from verified local organic farmers and delivers directly to neighborhood community hubs. You see exactly where every rupee goes.
          </p>

          <div className="hero-actions">
            {isAuthenticated ? (
              user?.role === 'farmer' ? (
                <>
                  <Link to="/farmer/dashboard" className="btn btn-primary btn-lg">
                    <LayoutDashboard size={20} /> Go to Farmer Dashboard
                  </Link>
                  <button onClick={logout} className="btn btn-secondary btn-lg">
                    <LogOut size={20} /> Switch Account
                  </button>
                </>
              ) : user?.role === 'admin' ? (
                <Link to="/admin/dashboard" className="btn btn-primary btn-lg">
                  <LayoutDashboard size={20} /> Go to Admin Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/consumer/home" className="btn btn-primary btn-lg">
                    <ShoppingBag size={20} /> Browse Fresh Produce
                  </Link>
                  <Link to="/consumer/my-orders" className="btn btn-secondary btn-lg">
                    <ArrowRight size={20} /> My Orders
                  </Link>
                </>
              )
            ) : (
              <>
                <Link to="/signup?role=consumer" className="btn btn-primary btn-lg">
                  <ShoppingBag size={20} /> I Want Fresh Produce
                </Link>
                <Link to="/signup?role=farmer" className="btn btn-secondary btn-lg">
                  <Sprout size={20} /> I'm a Farmer
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <h2 className="section-title text-center">How FarmConnect Works</h2>
        <p className="section-subtitle text-center">Aggregated batch ordering per neighborhood hub saves logistics costs and pays farmers more.</p>

        <div className="steps-grid">
          <div className="step-card glass-card">
            <div className="step-number">1</div>
            <h3>Farmers List Harvest</h3>
            <p>Verified local farmers set their base earning price for fresh crops & dairy items.</p>
          </div>

          <div className="step-card glass-card">
            <div className="step-number">2</div>
            <h3>Neighbors Order Together</h3>
            <p>Consumers order during open delivery windows for their assigned local hub.</p>
          </div>

          <div className="step-card glass-card">
            <div className="step-number">3</div>
            <h3>Community Hub Pickup</h3>
            <p>Farmers drop off bulk harvests at the hub. Pick up fresh at your convenience!</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
