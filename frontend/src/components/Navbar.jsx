import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useChat } from '../context/ChatContext';
import { ShoppingBag, MessageSquare, LogOut, User as UserIcon, Shield, Sprout, Store, Home } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { user, role, logout, isAuthenticated } = useAuth();
  const { cartCount } = useCart();
  const { unreadCount } = useChat();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getProfilePath = () => {
    if (role === 'farmer') return '/farmer/profile';
    if (role === 'consumer') return '/consumer/profile';
    return '#';
  };

  return (
    <header className="navbar-container glass-card">
      <div className="navbar-content">
        <Link to="/" className="navbar-brand">
          <Sprout className="brand-icon" size={28} />
          <span className="brand-title">FarmConnect</span>
        </Link>

        <nav className="navbar-links">
          {!isAuthenticated ? (
            <>
              <Link to="/" className="nav-link"><Home size={18} /> Home</Link>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/signup" className="btn btn-primary">Join FarmConnect</Link>
            </>
          ) : (
            <>
              {/* CONSUMER LINKS */}
              {role === 'consumer' && (
                <>
                  <Link to="/consumer/home" className="nav-link"><Store size={18} /> Browse Produce</Link>
                  <Link to="/consumer/my-orders" className="nav-link">My Orders & Impact</Link>
                  <Link to="/consumer/cart" className="nav-link cart-link">
                    <ShoppingBag size={18} /> Cart
                    {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                  </Link>
                  <Link to="/consumer/chat" className="nav-link chat-link">
                    <MessageSquare size={18} /> Chat
                    {unreadCount > 0 && <span className="chat-badge">{unreadCount}</span>}
                  </Link>
                </>
              )}

              {/* FARMER LINKS */}
              {role === 'farmer' && (
                <>
                  <Link to="/farmer/dashboard" className="nav-link"><Home size={18} /> Dashboard</Link>
                  <Link to="/farmer/produce" className="nav-link"><Sprout size={18} /> Manage Produce</Link>
                  <Link to="/farmer/orders" className="nav-link"><ShoppingBag size={18} /> Incoming Orders</Link>
                  <Link to="/farmer/chat" className="nav-link chat-link">
                    <MessageSquare size={18} /> Chat
                    {unreadCount > 0 && <span className="chat-badge">{unreadCount}</span>}
                  </Link>
                </>
              )}

              {/* ADMIN LINKS */}
              {role === 'admin' && (
                <>
                  <Link to="/admin/dashboard" className="nav-link"><Shield size={18} /> Dashboard</Link>
                  <Link to="/admin/farmers" className="nav-link">Farmer Verification</Link>
                  <Link to="/admin/hubs" className="nav-link">Hubs & Regions</Link>
                  <Link to="/admin/cycles" className="nav-link">Order Cycles</Link>
                </>
              )}

              {/* USER PROFILE & LOGOUT */}
              <div className="user-profile-menu">
                {role !== 'admin' ? (
                  <Link to={getProfilePath()} className="profile-link" title="Click to view & edit farm profile">
                    <span className={`role-pill role-${role}`}>{role}</span>
                    <span className="user-name">{user?.name}</span>
                  </Link>
                ) : (
                  <div className="profile-link-disabled">
                    <span className={`role-pill role-${role}`}>{role}</span>
                    <span className="user-name">{user?.name}</span>
                  </div>
                )}
                <button onClick={handleLogout} className="btn-icon-logout" title="Logout">
                  <LogOut size={18} />
                </button>
              </div>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
