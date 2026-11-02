// ==================== src/screens/auth/TestLoginScreen.jsx ====================
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setCredentials, setActiveRole } from '../../store/slices/authSlice';
import * as authService from '../../services/authService';
import { 
  Zap, 
  User, 
  Bus, 
  Users, 
  UtensilsCrossed, 
  Wrench, 
  ShieldCheck, 
  Terminal, 
  ArrowRight, 
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Smartphone,
  Layers,
  ChevronRight,
  Shield,
  Activity
} from 'lucide-react';

const TestLoginScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [loadingRole, setLoadingRole] = useState(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All Roles (7)' },
    { id: 'passengers', label: 'Passenger & Fleet' },
    { id: 'operations', label: 'Crew & Operations' },
    { id: 'system', label: 'Admin & Dev' },
  ];

  const roles = [
    { 
      id: 'customer', 
      category: 'passengers',
      label: 'Passenger / Customer', 
      badge: 'Core Experience',
      desc: 'Search intercity buses, pick sleeper seats, view amenities, book tickets, track live bus GPS & order food.',
      tags: ['Bus Booking', '2D Seat Deck', 'Live GPS Tracking', 'Food Orders'],
      phone: '9876543210', 
      icon: User, 
      color: '#6366f1', 
      colorDark: '#4338ca',
      colorLight: '#eef2ff',
      target: '/' 
    },
    { 
      id: 'owner', 
      category: 'passengers',
      label: 'Bus Fleet Operator', 
      badge: 'Fleet Management',
      desc: 'Manage bus fleet, interactive seat layout builder, multi-stop route planner, fare pricing & revenue dashboards.',
      tags: ['Fleet Overview', 'Seat Layout Builder', 'Smart Routes', 'Revenue'],
      phone: '8765432109', 
      icon: Bus, 
      color: '#d97706', 
      colorDark: '#b45309',
      colorLight: '#fef3c7',
      target: '/owner/dashboard' 
    },
    { 
      id: 'staff', 
      category: 'operations',
      label: 'Conductor & Crew', 
      badge: 'Trip Operations',
      desc: 'Live webcam QR boarding pass scanner, passenger manifest, instant manual OTP check-in & bus location update.',
      tags: ['Webcam QR Scanner', 'Passenger Manifest', 'Boarding OTP', 'GPS Broadcast'],
      phone: '7654321098', 
      icon: Users, 
      color: '#0284c7', 
      colorDark: '#0369a1',
      colorLight: '#e0f2fe',
      target: '/staff/dashboard' 
    },
    { 
      id: 'vendor', 
      category: 'operations',
      label: 'Highway Food Vendor', 
      badge: 'Kitchen Partner',
      desc: 'Receive passenger meal orders at highway rest stops, update live menu items, prices & order fulfillment ETA.',
      tags: ['Live Orders Queue', 'Menu Items', 'Rest-Stop ETA', 'Food Revenue'],
      phone: '6543210987', 
      icon: UtensilsCrossed, 
      color: '#ea580c', 
      colorDark: '#c2410c',
      colorLight: '#ffedd5',
      target: '/food' 
    },
    { 
      id: 'provider', 
      category: 'operations',
      label: 'Charter & Rentals Partner', 
      badge: 'Services & Fleet',
      desc: 'Charter bus rentals, wedding group tours, roadside emergency assistance dispatch & custom route charters.',
      tags: ['Charter Bus Rentals', 'Tour Packages', 'Roadside Assist', 'Quotations'],
      phone: '4321098765', 
      icon: Wrench, 
      color: '#0d9488', 
      colorDark: '#0f766e',
      colorLight: '#ccfbf1',
      target: '/rentals' 
    },
    { 
      id: 'admin', 
      category: 'system',
      label: 'Platform Super Admin', 
      badge: 'Administration',
      desc: 'Full administrative controls, promotional banners, platform-wide metrics, coupon discounts & dispute resolution.',
      tags: ['Platform Telemetry', 'Promo Banners', 'Discounts & Coupons', 'Audits'],
      phone: '5432109876', 
      icon: ShieldCheck, 
      color: '#e11d48', 
      colorDark: '#be123c',
      colorLight: '#ffe4e6',
      target: '/owner/dashboard' 
    },
    { 
      id: 'developer', 
      category: 'system',
      label: 'Developer Cockpit', 
      badge: 'Engineering',
      desc: 'Raw database collections viewer, API telemetry logs, latency inspector & direct system debug triggers.',
      tags: ['Database Collections', 'API Telemetry', 'Health Checks', 'Traces'],
      phone: '9999999999', 
      icon: Terminal, 
      color: '#7c3aed', 
      colorDark: '#6d28d9',
      colorLight: '#ede9fe',
      target: '/developer' 
    },
  ];

  const filteredRoles = activeCategory === 'all' 
    ? roles 
    : roles.filter(r => r.category === activeCategory);

  const handleQuickLogin = async (roleObj) => {
    setError('');
    setSuccessMsg('');
    setLoadingRole(roleObj.id);

    try {
      const response = await authService.testLogin(roleObj.phone, roleObj.id);

      if (response && response.success && response.token && response.user) {
        dispatch(setCredentials({
          user: response.user,
          token: response.token,
          activeRole: roleObj.id,
        }));
        setSuccessMsg(`Authenticated as ${roleObj.label}! Entering app...`);
        setTimeout(() => {
          navigate(roleObj.target);
        }, 500);
      } else {
        throw new Error(response?.message || 'Login failed');
      }
    } catch (err) {
      console.warn('Test login online fallback:', err.message);
      // Instant local fallback so testers are never blocked
      const mockUser = {
        _id: 'test_' + roleObj.id,
        name: `Test ${roleObj.label}`,
        phone: roleObj.phone,
        email: `${roleObj.id}@nightbus.test`,
        role: roleObj.id,
      };
      const mockToken = 'mock_jwt_token_for_' + roleObj.id;
      authService.storeAuthData(mockToken, mockUser);
      dispatch(setCredentials({
        user: mockUser,
        token: mockToken,
        activeRole: roleObj.id,
      }));
      setSuccessMsg(`Logged in as ${roleObj.label}! Redirecting...`);
      setTimeout(() => {
        navigate(roleObj.target);
      }, 400);
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#f8fafc',
      minHeight: '100%',
      paddingBottom: '40px',
    }}>
      {/* ─── Hero Header ────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #312e81 100%)',
        padding: '18px 16px 24px',
        borderBottomLeftRadius: '24px',
        borderBottomRightRadius: '24px',
        color: '#ffffff',
        boxShadow: '0 10px 30px rgba(15, 23, 42, 0.25)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Ambient Top Glow */}
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '180px',
          height: '180px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.35) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Top Navbar Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <button
            onClick={() => navigate(-1)}
            aria-label="Go back"
            style={{
              background: 'rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              width: '38px',
              height: '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer',
              transition: 'transform 0.15s ease',
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <ArrowLeft size={18} />
          </button>

          {/* Staging Status Chip */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(16, 185, 129, 0.16)',
            border: '1px solid rgba(52, 211, 153, 0.35)',
            padding: '5px 12px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: 700,
            color: '#a7f3d0',
          }}>
            <div style={{ 
              width: '7px', 
              height: '7px', 
              borderRadius: '50%', 
              background: '#34d399',
              boxShadow: '0 0 8px #34d399'
            }} />
            <span>DEV STAGING COCKPIT</span>
          </div>
        </div>

        {/* Header Title Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 6px 18px rgba(245, 158, 11, 0.4)',
          }}>
            <Zap size={26} color="#78350f" fill="#78350f" />
          </div>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 800, margin: 0, letterSpacing: '-0.3px', color: '#ffffff' }}>
              Quick Persona Login
            </h1>
            <p style={{ fontSize: '12px', color: '#cbd5e1', margin: '3px 0 0', lineHeight: 1.35 }}>
              1-Tap instant access • Zero passwords or OTP required
            </p>
          </div>
        </div>
      </div>

      {/* ─── Main Content Container ─────────────────────────────────── */}
      <div style={{ padding: '16px 16px 0' }}>

        {/* Category Horizontal Filter Bar */}
        <div style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '12px',
          scrollbarWidth: 'none',
        }}>
          {categories.map((cat) => {
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  background: isSelected 
                    ? 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)' 
                    : '#ffffff',
                  color: isSelected ? '#ffffff' : '#475569',
                  border: isSelected ? '1px solid #4f46e5' : '1px solid #cbd5e1',
                  borderRadius: '24px',
                  padding: '7px 14px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: isSelected ? '0 3px 10px rgba(79, 70, 229, 0.3)' : '0 1px 3px rgba(0,0,0,0.03)',
                  transition: 'all 0.15s ease',
                  flexShrink: 0,
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: '#fef2f2',
            border: '1.5px solid #fecaca',
            borderRadius: '12px',
            padding: '12px 14px',
            marginBottom: '14px',
            color: '#dc2626',
            fontSize: '13px',
            fontWeight: 600,
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: '#ecfdf5',
            border: '1.5px solid #a7f3d0',
            borderRadius: '12px',
            padding: '12px 14px',
            marginBottom: '14px',
            color: '#059669',
            fontSize: '13px',
            fontWeight: 700,
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)',
          }}>
            <CheckCircle2 size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Section Caption */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px',
          padding: '0 2px',
        }}>
          <span style={{ fontSize: '13px', fontWeight: 800, color: '#1e293b' }}>
            Select Persona to Test ({filteredRoles.length}):
          </span>
          <span style={{ 
            fontSize: '11px', 
            fontWeight: 700, 
            color: '#059669', 
            background: '#ecfdf5',
            padding: '2px 8px',
            borderRadius: '12px',
            border: '1px solid #a7f3d0'
          }}>
            ⚡ 1-Tap Auth Ready
          </span>
        </div>

        {/* ─── Persona Cards Grid ───────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredRoles.map((r) => {
            const Icon = r.icon;
            const isLoading = loadingRole === r.id;

            return (
              <div
                key={r.id}
                onClick={() => !loadingRole && handleQuickLogin(r)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: '#ffffff',
                  border: `1.5px solid ${r.color}35`,
                  borderLeft: `5px solid ${r.color}`,
                  borderRadius: '16px',
                  padding: '14px 16px',
                  cursor: loadingRole !== null ? 'wait' : 'pointer',
                  boxShadow: '0 3px 10px rgba(0, 0, 0, 0.04)',
                  transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  background: `linear-gradient(135deg, #ffffff 70%, ${r.colorLight} 100%)`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = r.color;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = `0 8px 20px ${r.color}25`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = `${r.color}35`;
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 3px 10px rgba(0, 0, 0, 0.04)';
                }}
              >
                {/* Top Row: Icon + Title/Badge + 1-Tap Button */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {/* Role Icon Container */}
                  <div style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '14px',
                    backgroundColor: `${r.color}18`,
                    border: `1px solid ${r.color}30`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Icon size={24} color={r.color} />
                  </div>

                  {/* Role Title & Badge */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '3px' }}>
                      <span style={{ fontWeight: 800, fontSize: '15px', color: '#0f172a' }}>
                        {r.label}
                      </span>
                      <span style={{
                        backgroundColor: `${r.color}15`,
                        color: r.color,
                        border: `1px solid ${r.color}30`,
                        fontSize: '10px',
                        fontWeight: 800,
                        padding: '2px 7px',
                        borderRadius: '6px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.4px',
                      }}>
                        {r.badge}
                      </span>
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11px',
                      color: '#64748b',
                      fontWeight: 600,
                    }}>
                      <span>📱 Test Phone: <strong style={{ color: '#334155' }}>{r.phone}</strong></span>
                    </div>
                  </div>

                  {/* 1-Tap Action Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!loadingRole) handleQuickLogin(r);
                    }}
                    disabled={loadingRole !== null}
                    style={{
                      background: `linear-gradient(135deg, ${r.color} 0%, ${r.colorDark} 100%)`,
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '20px',
                      padding: '7px 14px',
                      fontSize: '12px',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      cursor: 'pointer',
                      boxShadow: `0 3px 10px ${r.color}45`,
                      flexShrink: 0,
                      transition: 'transform 0.12s ease',
                    }}
                    onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.94)'}
                    onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    {isLoading ? (
                      <div style={{
                        width: '14px',
                        height: '14px',
                        border: '2px solid #ffffff',
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        animation: 'spin 0.6s linear infinite',
                      }} />
                    ) : (
                      <>
                        <Zap size={13} fill="#ffffff" />
                        <span>Login</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Middle Row: Full Readable Description */}
                <div style={{
                  fontSize: '12px',
                  color: '#475569',
                  lineHeight: '1.45',
                  marginTop: '10px',
                  paddingTop: '8px',
                  borderTop: '1px dashed #e2e8f0',
                }}>
                  {r.desc}
                </div>

                {/* Bottom Row: Feature Capabilities Tags */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  flexWrap: 'wrap',
                  marginTop: '8px',
                }}>
                  {r.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      style={{
                        background: '#f1f5f9',
                        color: '#475569',
                        fontSize: '10px',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: '6px',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* ─── Footer Action Links ───────────────────────────────────── */}
        <div style={{
          marginTop: '22px',
          paddingTop: '16px',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}>
          <button
            onClick={() => navigate('/login')}
            style={{
              width: '100%',
              padding: '13px',
              backgroundColor: '#ffffff',
              border: '1.5px solid #cbd5e1',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: 700,
              color: '#1e293b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)',
            }}
          >
            <span>Standard Phone & OTP Login Screen</span>
          </button>

          <button
            onClick={() => navigate('/')}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: '13px',
              fontWeight: 700,
              color: '#4f46e5',
              cursor: 'pointer',
              textAlign: 'center',
            }}
          >
            Continue as Guest Passenger →
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestLoginScreen;

