// ==================== src/screens/common/ProfileScreen.jsx (100% AUTHENTIC MOBILE APP REPLICA) ====================
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../store/slices/authSlice';
import { 
  User, 
  MessageSquare, 
  Bus, 
  Sparkles, 
  Wallet, 
  Briefcase, 
  UtensilsCrossed, 
  Globe, 
  Bell, 
  Lock, 
  Headphones, 
  FileText, 
  ShieldCheck, 
  LogOut, 
  ChevronRight,
  SlidersHorizontal,
  Pencil
} from 'lucide-react';

const ProfileScreen = ({ onOpenRoleModal }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, activeRole } = useSelector((state) => state.auth);
  const walletBalance = useSelector((state) => state.wallet.balance);

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [language, setLanguage] = useState('English');

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      dispatch(logout());
      navigate('/login');
    }
  };

  const MenuOption = ({ icon: IconComponent, label, subLabel, onPress, color = '#6366f1', badge = null, isDestructive = false }) => (
    <div
      onClick={onPress}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '14px 16px',
        cursor: 'pointer',
        gap: '14px',
        transition: 'background 0.15s ease',
      }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDestructive ? '#fef2f2' : '#f8fafc'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
    >
      <div style={{
        width: '38px',
        height: '38px',
        borderRadius: '12px',
        backgroundColor: isDestructive ? '#fee2e2' : `${color}15`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: isDestructive ? '#ef4444' : color,
      }}>
        <IconComponent size={20} />
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '14px', fontWeight: 700, color: isDestructive ? '#ef4444' : '#1e293b' }}>
          {label}
        </div>
        {subLabel && (
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
            {subLabel}
          </div>
        )}
      </div>

      {badge && (
        <span style={{
          backgroundColor: '#e0e7ff',
          color: '#4338ca',
          fontSize: '11px',
          fontWeight: 800,
          padding: '2px 8px',
          borderRadius: '10px',
        }}>
          {badge}
        </span>
      )}

      <ChevronRight size={18} color="#cbd5e1" />
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#f1f5f9', minHeight: '100%' }}>
      {/* ── Elite Header (Matching Mobile App) ─────────────────────────── */}
      <div style={{
        backgroundColor: '#4f46e5',
        backgroundImage: 'url(/header.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        padding: '24px 20px 28px',
        borderBottomLeftRadius: '28px',
        borderBottomRightRadius: '28px',
        overflow: 'hidden',
        color: '#ffffff',
        boxShadow: '0 4px 15px rgba(79, 70, 229, 0.25)',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(79, 70, 229, 0.92) 0%, rgba(67, 56, 202, 0.98) 100%)',
          zIndex: 1,
        }} />

        <div style={{ position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 900, letterSpacing: '-0.3px', margin: 0, color: '#ffffff', lineHeight: 1.2 }}>
              Account
            </h1>
            <button
              onClick={onOpenRoleModal}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                color: '#ffffff',
                padding: '7px 14px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                backdropFilter: 'blur(4px)',
              }}
            >
              <SlidersHorizontal size={14} />
              <span>Switch Role</span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '3px solid rgba(255, 255, 255, 0.4)',
              boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
            }}>
              <User size={34} color="#ffffff" />
            </div>

            <div>
              <div style={{ fontSize: '20px', fontWeight: 900, color: '#ffffff' }}>
                {user?.name || 'Amit Sharma'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                <span style={{
                  backgroundColor: '#fbbf24',
                  color: '#78350f',
                  fontSize: '10px',
                  fontWeight: 900,
                  padding: '2px 8px',
                  borderRadius: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  {activeRole || 'MEMBER'}
                </span>
                <span style={{ fontSize: '12px', color: '#c7d2fe' }}>
                  {user?.phone || '+91 98765 43210'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content Sections ────────────────────────────────────────────── */}
      <div style={{ padding: '16px 16px 40px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Activity & Orders Card */}
        <div>
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', paddingLeft: '4px' }}>
            Activity & Orders
          </div>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
            <MenuOption
              icon={Bus}
              label="My Bus Bookings"
              subLabel="Track upcoming & past tickets with QR"
              color="#6366f1"
              onPress={() => navigate('/my-bookings')}
            />
            <div style={{ height: '1px', backgroundColor: '#f1f5f9' }} />
            <MenuOption
              icon={Sparkles}
              label="My Yatra Trips"
              subLabel="View your booked spiritual tour packages"
              color="#8b5cf6"
              onPress={() => navigate('/yatra')}
            />
            <div style={{ height: '1px', backgroundColor: '#f1f5f9' }} />
            <MenuOption
              icon={Wallet}
              label="Wallet & Payments"
              subLabel={`₹${walletBalance.toLocaleString()} available credits`}
              color="#f59e0b"
              onPress={() => navigate('/wallet')}
            />
          </div>
        </div>

        {/* Earn with NightBus Card */}
        <div>
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', paddingLeft: '4px' }}>
            Partner & Portals
          </div>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
            <MenuOption
              icon={Briefcase}
              label="Bus Fleet Management"
              subLabel="Owner Portal for buses, schedules & smart route builder"
              color="#4f46e5"
              onPress={() => navigate('/owner/dashboard')}
            />
            <div style={{ height: '1px', backgroundColor: '#f1f5f9' }} />
            <MenuOption
              icon={UtensilsCrossed}
              label="Onboard Food Delivery"
              subLabel="Berth food delivery during scheduled bus halts"
              color="#ea580c"
              onPress={() => navigate('/food')}
            />
            <div style={{ height: '1px', backgroundColor: '#f1f5f9' }} />
            <MenuOption
              icon={Bus}
              label="Staff Boarding & QR Scanner"
              subLabel="Verify tickets and boarding passes at bus gates"
              color="#10b981"
              onPress={() => navigate('/staff/dashboard')}
            />
          </div>
        </div>

        {/* Settings & Support Card */}
        <div>
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', paddingLeft: '4px' }}>
            Settings & Support
          </div>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  backgroundColor: '#eef2ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6366f1',
                }}>
                  <Globe size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>Language</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Change app interface language</div>
                </div>
              </div>
              <button
                onClick={() => setLanguage(language === 'English' ? 'Hindi' : 'English')}
                style={{
                  backgroundColor: '#e0e7ff',
                  color: '#4338ca',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '5px 10px',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                {language}
              </button>
            </div>

            <div style={{ height: '1px', backgroundColor: '#f1f5f9' }} />

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  backgroundColor: '#eef2ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6366f1',
                }}>
                  <Bell size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>Push Notifications</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Trip status and promotional updates</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#4f46e5', cursor: 'pointer' }}
              />
            </div>

            <div style={{ height: '1px', backgroundColor: '#f1f5f9' }} />

            <MenuOption
              icon={Headphones}
              label="24x7 Customer Support"
              subLabel="Toll free assistance: 1800-NIGHT-BUS"
              color="#06b6d4"
              onPress={() => alert('Support helpline: 1800-NIGHT-BUS\nEmail: support@nightbusjourney.com')}
            />

            <div style={{ height: '1px', backgroundColor: '#f1f5f9' }} />

            <MenuOption
              icon={LogOut}
              label="Log Out"
              subLabel="Sign out of this device"
              isDestructive
              onPress={handleLogout}
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfileScreen;
