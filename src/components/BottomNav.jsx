// ==================== src/components/BottomNav.jsx (EXACT REACT NATIVE TAB BAR) ====================
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Home, 
  Ticket, 
  Briefcase, 
  UtensilsCrossed, 
  User, 
  BarChart3, 
  Bus, 
  QrCode, 
  Users, 
  Settings,
  Wrench,
  ShieldCheck,
  Terminal,
  KeyRound
} from 'lucide-react';

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { activeRole } = useSelector((state) => state.auth);

  // Exact 5 Tabs from CustomerStack.js: HomeTab, BookingsTab, ServicesTab, FoodTab, ProfileTab
  const customerTabs = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/my-bookings', label: 'My Trips', icon: Ticket },
    { path: '/rentals', label: 'Services', icon: Briefcase },
    { path: '/food', label: 'Food', icon: UtensilsCrossed },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  // OwnerStack.js Tabs
  const ownerTabs = [
    { path: '/owner/dashboard', label: 'Dashboard', icon: BarChart3 },
    { path: '/owner/buses', label: 'Buses', icon: Bus },
    { path: '/owner/routes/builder', label: 'Routes', icon: Settings },
    { path: '/wallet', label: 'Revenue', icon: Ticket },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  // StaffStack.js Tabs
  const staffTabs = [
    { path: '/staff/dashboard', label: 'Dashboard', icon: Bus },
    { path: '/staff/scanner', label: 'Scan QR', icon: QrCode },
    { path: '/staff/manifest', label: 'Manifest', icon: Users },
    { path: '/staff/verify', label: 'Verify OTP', icon: KeyRound },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  // VendorStack.js Tabs
  const vendorTabs = [
    { path: '/food', label: 'Orders', icon: UtensilsCrossed },
    { path: '/wallet', label: 'Earnings', icon: Ticket },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  // ProviderStack.js Tabs
  const providerTabs = [
    { path: '/rentals', label: 'Requests', icon: Wrench },
    { path: '/wallet', label: 'Wallet', icon: Ticket },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  // AdminStack.js Tabs
  const adminTabs = [
    { path: '/owner/dashboard', label: 'Oversight', icon: ShieldCheck },
    { path: '/staff/manifest', label: 'Manifest', icon: Users },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  let currentTabs = customerTabs;
  if (activeRole === 'owner') currentTabs = ownerTabs;
  else if (activeRole === 'staff') currentTabs = staffTabs;
  else if (activeRole === 'vendor') currentTabs = vendorTabs;
  else if (activeRole === 'provider') currentTabs = providerTabs;
  else if (activeRole === 'admin') currentTabs = adminTabs;

  return (
    <nav style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 'calc(60px + env(safe-area-inset-bottom, 0px))',
      backgroundColor: '#ffffff',
      borderTop: '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      zIndex: 90,
      padding: '4px 6px calc(6px + env(safe-area-inset-bottom, 0px))',
      boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.04)',
    }}>
      {currentTabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = location.pathname === tab.path || 
          (tab.path !== '/' && location.pathname.startsWith(tab.path));

        const activeColor = activeRole === 'owner' ? '#eab308' 
          : activeRole === 'staff' ? '#0ea5e9'
          : activeRole === 'vendor' ? '#f97316'
          : activeRole === 'provider' ? '#10b981'
          : '#6366f1';

        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              flex: 1,
              height: '100%',
              color: isActive ? activeColor : '#9ca3af',
              transition: 'all 0.15s ease',
              padding: '4px 0',
            }}
          >
            <Icon size={22} strokeWidth={isActive ? 2.4 : 1.8} color={isActive ? activeColor : '#9ca3af'} />
            <span style={{
              fontSize: '11px',
              fontWeight: isActive ? 600 : 500,
            }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
