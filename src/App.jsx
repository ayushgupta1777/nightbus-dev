// ==================== src/App.jsx (100% AUTHENTIC MOBILE APP SHELL) ====================
import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import RoleSwitcherModal from './components/RoleSwitcherModal';
import FloatingFeedbackWidget from './components/FloatingFeedbackWidget';

// Auth Screens
import LoginScreen from './screens/auth/LoginScreen';
import TestLoginScreen from './screens/auth/TestLoginScreen';

// Customer Screens
import HomeScreen from './screens/customer/HomeScreen';
import SearchScreen from './screens/customer/SearchScreen';
import JourneyResultsScreen from './screens/customer/JourneyResultsScreen';
import SeatSelectionScreen from './screens/customer/SeatSelectionScreen';
import PassengerDetailsScreen from './screens/customer/PassengerDetailsScreen';
import BookingConfirmationScreen from './screens/customer/BookingConfirmationScreen';
import MyBookingsScreen from './screens/customer/MyBookingsScreen';
import BookingDetailsScreen from './screens/customer/BookingDetailsScreen';
import LiveTrackingScreen from './screens/customer/LiveTrackingScreen';
import YatraListScreen from './screens/customer/YatraListScreen';
import YatraDetailsScreen from './screens/customer/YatraDetailsScreen';
import RentalRequestScreen from './screens/customer/RentalRequestScreen';
import FoodHomeScreen from './screens/customer/FoodHomeScreen';
import WalletScreen from './screens/customer/WalletScreen';

// Owner Screens
import OwnerDashboardScreen from './screens/owner/OwnerDashboardScreen';
import BusManagementScreen from './screens/owner/BusManagementScreen';
import SmartRouteBuilderScreen from './screens/owner/SmartRouteBuilderScreen';
import OwnerYatraScreen from './screens/owner/OwnerYatraScreen';

// Staff Screens
import StaffDashboardScreen from './screens/staff/StaffDashboardScreen';
import QRScannerScreen from './screens/staff/QRScannerScreen';
import PassengerManifestScreen from './screens/staff/PassengerManifestScreen';
import ManualVerificationScreen from './screens/staff/ManualVerificationScreen';
import ManualLocationScreen from './screens/staff/ManualLocationScreen';

// Developer & Common
import DeveloperDashboardScreen from './screens/developer/DeveloperDashboardScreen';
import ProfileScreen from './screens/common/ProfileScreen';

function App() {
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('phone'); // 'phone' or 'web'
  const [currentTime, setCurrentTime] = useState('');
  const location = useLocation();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours % 12 || 12}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // Hide bottom nav on specific fullscreen views like scanner, auth screens
  const hideBottomNavOnRoutes = ['/staff/scanner', '/login', '/test-login'];
  const showBottomNav = !hideBottomNavOnRoutes.includes(location.pathname);

  // Status bar style (light text on purple/gradient header pages, dark text on white pages)
  const lightHeaderPages = ['/login', '/test-login', '/results'];
  const isDarkHeaderPage = !lightHeaderPages.includes(location.pathname) && !location.pathname.startsWith('/seat-selection');

  return (
    <>
      {/* Floating Testing Companion for Developers / Testers */}
      <Header 
        onOpenRoleModal={() => setIsRoleModalOpen(true)}
        viewMode={viewMode}
        onToggleViewMode={() => setViewMode(prev => prev === 'phone' ? 'web' : 'phone')}
      />

      {/* ─── Real Mobile Smartphone Chassis / Web Container ────────────── */}
      <div className={`phone-device-shell ${viewMode === 'web' ? 'web-mode' : ''}`}>
        {/* Dynamic Island / Notch */}
        {viewMode === 'phone' && (
          <div className="mobile-dynamic-island">
            <div className="island-camera" />
            <div className="island-sensor" />
          </div>
        )}

        {/* Mobile Status Bar (Time, Wifi, Signal, Battery) */}
        {viewMode === 'phone' && (
          <div className={`mobile-status-bar ${isDarkHeaderPage ? 'light-text' : 'dark-text'}`} style={{
            background: isDarkHeaderPage ? 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)' : '#ffffff'
          }}>
            <span>{currentTime || '9:41'}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            {/* Cellular */}
            <svg width="15" height="11" viewBox="0 0 17 11" fill="currentColor">
              <rect x="0" y="8" width="3" height="3" rx="0.5" />
              <rect x="4.5" y="5.5" width="3" height="5.5" rx="0.5" />
              <rect x="9" y="3" width="3" height="8" rx="0.5" />
              <rect x="13.5" y="0" width="3" height="11" rx="0.5" />
            </svg>
            {/* Wifi */}
            <svg width="14" height="11" viewBox="0 0 16 12" fill="currentColor">
              <path d="M8 10a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm-3.5-3.5c2-2 5-2 7 0l1.4-1.4c-2.7-2.7-7.1-2.7-9.8 0L4.5 6.5zm-3-3c3.6-3.6 9.4-3.6 13 0l1.4-1.4c-4.4-4.4-11.4-4.4-15.8 0L1.5 3.5z" />
            </svg>
            {/* Battery */}
            <svg width="22" height="11" viewBox="0 0 24 12" fill="currentColor">
              <rect x="1" y="1" width="19" height="10" rx="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <rect x="3" y="3" width="14" height="6" rx="1.5" />
              <path d="M21 4.5v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>
        )}

        {/* Scrollable Mobile Screen Content */}
        <div className="mobile-screen-scroll">
          <Routes>
            {/* Customer Experience Routes */}
            <Route path="/" element={<HomeScreen />} />
            <Route path="/search" element={<SearchScreen />} />
            <Route path="/results" element={<JourneyResultsScreen />} />
            <Route path="/seat-selection/:busId" element={<SeatSelectionScreen />} />
            <Route path="/passengers" element={<PassengerDetailsScreen />} />
            <Route path="/checkout" element={<BookingConfirmationScreen />} />
            <Route path="/my-bookings" element={<MyBookingsScreen />} />
            <Route path="/booking/:id" element={<BookingDetailsScreen />} />
            <Route path="/live-tracking/:tripId" element={<LiveTrackingScreen />} />
            <Route path="/yatra" element={<YatraListScreen />} />
            <Route path="/yatra/:packageId" element={<YatraDetailsScreen />} />
            <Route path="/rentals" element={<RentalRequestScreen />} />
            <Route path="/food" element={<FoodHomeScreen />} />
            <Route path="/wallet" element={<WalletScreen />} />
            <Route path="/profile" element={<ProfileScreen onOpenRoleModal={() => setIsRoleModalOpen(true)} />} />

            {/* Auth Routes */}
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/test-login" element={<TestLoginScreen />} />

            {/* Bus Owner Routes */}
            <Route path="/owner/dashboard" element={<OwnerDashboardScreen />} />
            <Route path="/owner/buses" element={<BusManagementScreen />} />
            <Route path="/owner/routes/builder" element={<SmartRouteBuilderScreen />} />
            <Route path="/owner/yatra" element={<OwnerYatraScreen />} />
            <Route path="/owner/revenue" element={<WalletScreen />} />

            {/* Staff Routes */}
            <Route path="/staff/dashboard" element={<StaffDashboardScreen />} />
            <Route path="/staff/scanner" element={<QRScannerScreen />} />
            <Route path="/staff/manifest" element={<PassengerManifestScreen />} />
            <Route path="/staff/verify" element={<ManualVerificationScreen />} />
            <Route path="/staff/location" element={<ManualLocationScreen />} />

            {/* Developer Cockpit */}
            <Route path="/developer" element={<DeveloperDashboardScreen />} />
          </Routes>
        </div>

        {/* Authentic React Native Bottom Tab Bar */}
        {showBottomNav && <BottomNav />}
      </div>

      {/* Role Testing Modal */}
      <RoleSwitcherModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
      />

      {/* Universal Floating QA Feedback & AI Auto-Fix Widget */}
      <FloatingFeedbackWidget viewMode={viewMode} />
    </>
  );
}

export default App;
