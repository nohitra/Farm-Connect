import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ChatProvider } from './context/ChatContext';

// Route Guard
import ProtectedRoute from './routes/ProtectedRoute';

// Shared Layout Components
import Navbar from './components/Navbar';
import NotificationToast from './components/NotificationToast';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import OutOfCoveragePage from './pages/public/OutOfCoveragePage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import CompleteProfilePage from './pages/auth/CompleteProfilePage';

// Consumer Pages
import ConsumerHome from './pages/consumer/ConsumerHome';
import ConsumerOnboarding from './pages/consumer/ConsumerOnboarding';
import FarmerProfileView from './pages/consumer/FarmerProfileView';
import CartPage from './pages/consumer/CartPage';
import OrderConfirmationPage from './pages/consumer/OrderConfirmationPage';
import MyOrdersPage from './pages/consumer/MyOrdersPage';
import ConsumerChatPage from './pages/consumer/ConsumerChatPage';
import ConsumerProfilePage from './pages/consumer/ConsumerProfilePage';

// Farmer Pages
import FarmerDashboard from './pages/farmer/FarmerDashboard';
import FarmerOnboarding from './pages/farmer/FarmerOnboarding';
import ManageProducePage from './pages/farmer/ManageProducePage';
import FarmerOrdersPage from './pages/farmer/FarmerOrdersPage';
import FarmerChatPage from './pages/farmer/FarmerChatPage';
import FarmerProfilePage from './pages/farmer/FarmerProfilePage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import RegionManagementPage from './pages/admin/RegionManagementPage';
import HubManagementPage from './pages/admin/HubManagementPage';
import FarmerVerificationPage from './pages/admin/FarmerVerificationPage';
import HubRequestsPage from './pages/admin/HubRequestsPage';
import OrderCyclesPage from './pages/admin/OrderCyclesPage';

import './styles/global.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <ChatProvider>
            <div className="app-container">
              <Navbar />
              <NotificationToast />
              <Routes>
                {/* PUBLIC ROUTES */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/complete-profile" element={<CompleteProfilePage />} />
                <Route path="/out-of-coverage" element={<OutOfCoveragePage />} />

                {/* CONSUMER PROTECTED ROUTES */}
                <Route element={<ProtectedRoute allowedRoles={['consumer']} />}>
                  <Route path="/consumer/home" element={<ConsumerHome />} />
                  <Route path="/consumer/onboarding" element={<ConsumerOnboarding />} />
                  <Route path="/consumer/farmers/:id" element={<FarmerProfileView />} />
                  <Route path="/consumer/cart" element={<CartPage />} />
                  <Route path="/consumer/order-confirmation" element={<OrderConfirmationPage />} />
                  <Route path="/consumer/my-orders" element={<MyOrdersPage />} />
                  <Route path="/consumer/orders" element={<MyOrdersPage />} />
                  <Route path="/consumer/chat" element={<ConsumerChatPage />} />
                  <Route path="/consumer/profile" element={<ConsumerProfilePage />} />
                </Route>

                {/* FARMER PROTECTED ROUTES */}
                <Route element={<ProtectedRoute allowedRoles={['farmer']} />}>
                  <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
                  <Route path="/farmer/onboarding" element={<FarmerOnboarding />} />
                  <Route path="/farmer/produce" element={<ManageProducePage />} />
                  <Route path="/farmer/orders" element={<FarmerOrdersPage />} />
                  <Route path="/farmer/chat" element={<FarmerChatPage />} />
                  <Route path="/farmer/profile" element={<FarmerProfilePage />} />
                </Route>

                {/* ADMIN PROTECTED ROUTES */}
                <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/regions" element={<RegionManagementPage />} />
                  <Route path="/admin/hubs" element={<HubManagementPage />} />
                  <Route path="/admin/farmers" element={<FarmerVerificationPage />} />
                  <Route path="/admin/hub-requests" element={<HubRequestsPage />} />
                  <Route path="/admin/cycles" element={<OrderCyclesPage />} />
                </Route>

                {/* FALLBACK REDIRECT */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </ChatProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
