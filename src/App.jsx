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
  const location = useLocation();

  // Hide bottom nav on specific fullscreen views like scanner, auth screens
  const hideBottomNavOnRoutes = ['/staff/scanner', '/login', '/test-login'];
  const showBottomNav = !hideBottomNavOnRoutes.includes(location.pathname);

  return (
    <>
      {/* Floating Testing Companion for Developers / Testers */}
      <Header 
        onOpenRoleModal={() => setIsRoleModalOpen(true)}
        viewMode={viewMode}
        onToggleViewMode={() => setViewMode(prev => prev === 'phone' ? 'web' : 'phone')}
      />

      {/* ─── Authentic Native Mobile Container ────────────── */}
      <div className={`phone-device-shell ${viewMode === 'web' ? 'web-mode' : ''}`}>
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
