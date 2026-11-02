// ==================== src/components/RoleSwitcherModal.jsx ====================
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setActiveRole, setCredentials } from '../store/slices/authSlice';
import { 
  X, 
  User, 
  Bus, 
  Users, 
  UtensilsCrossed, 
  Wrench, 
  ShieldCheck, 
  Terminal, 
  CheckCircle2,
  Zap,
  ArrowRight,
  Sparkles,
  Layers,
  RotateCcw
} from 'lucide-react';
import { testLogin } from '../services/authService';

const RoleSwitcherModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { activeRole } = useSelector((state) => state.auth);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [switchingId, setSwitchingId] = useState(null);

  if (!isOpen) return null;

  const roles = [
    {
      id: 'customer',
      title: 'Customer Experience',
      badge: 'Passenger',
      category: 'passenger',
      phone: '9876543210',
      icon: User,
      color: '#6366f1',
      desc: 'Search buses, 2D deck seat selection, Razorpay checkout, live bus tracking, Yatra tours & food ordering.',
      defaultRoute: '/',
    },
    {
      id: 'owner',
      title: 'Bus Owner Portal',
      badge: 'Fleet Operator',
      category: 'fleet',
      phone: '8765432109',
      icon: Bus,
      color: '#f59e0b',
      desc: 'Fleet overview, add buses, interactive seat layout builder, smart multi-stop route maker & revenue analytics.',
      defaultRoute: '/owner/dashboard',
    },
    {
      id: 'staff',
      title: 'Conductor & Staff Cockpit',
      badge: 'Trip Crew',
      category: 'operations',
      phone: '7654321098',
      icon: Users,
      color: '#0284c7',
      desc: 'Live webcam QR boarding pass scanner, passenger manifest, manual PNR ticket check-in & trip status updates.',
      defaultRoute: '/staff/dashboard',
    },
    {
      id: 'vendor',
      title: 'Highway Food Vendor',
      badge: 'Kitchen Partner',
      category: 'operations',
      phone: '6543210987',
      icon: UtensilsCrossed,
      color: '#ea580c',
      desc: 'Live passenger meal orders queue, onboard menu item manager, pricing, stock availability.',
      defaultRoute: '/food',
    },
    {
      id: 'provider',
      title: 'Bus Service Provider',
      badge: 'Maintenance & Rentals',
      category: 'fleet',
      phone: '4321098765',
      icon: Wrench,
      color: '#0d9488',
      desc: 'Charter bus rentals, wedding group tours, roadside assistance dispatch & repair services.',
      defaultRoute: '/rentals',
    },
    {
      id: 'admin',
      title: 'Platform Administrator',
      badge: 'Super Admin',
      category: 'tech',
      phone: '5432109876',
      icon: ShieldCheck,
      color: '#e11d48',
      desc: 'Platform-wide telemetry, promotional banners & home content manager, discount coupons creation.',
      defaultRoute: '/owner/dashboard',
    },
    {
      id: 'developer',
      title: 'Developer Control Room',
      badge: 'Dev Cockpit',
      category: 'tech',
      phone: '9999999999',
      icon: Terminal,
      color: '#8b5cf6',
      desc: 'Direct MongoDB database collection viewer, telemetry debugger, test triggers and audit traces.',
      defaultRoute: '/developer',
    },
  ];

  const categories = [
    { id: 'all', label: 'All Roles', count: roles.length },
    { id: 'passenger', label: 'Passenger', count: roles.filter(r => r.category === 'passenger').length },
    { id: 'fleet', label: 'Fleet & Rentals', count: roles.filter(r => r.category === 'fleet').length },
    { id: 'operations', label: 'Crew & Food', count: roles.filter(r => r.category === 'operations').length },
    { id: 'tech', label: 'Admin & Tech', count: roles.filter(r => r.category === 'tech').length },
  ];

  const filteredRoles = selectedCategory === 'all'
    ? roles
    : roles.filter(r => r.category === selectedCategory);

  const handleSelectRole = async (roleObj) => {
    setSwitchingId(roleObj.id);
    dispatch(setActiveRole(roleObj.id));

    // Also attempt quick login if not already logged in with this role
    try {
      const res = await testLogin(roleObj.phone, roleObj.id);
      if (res && res.success && res.token && res.user) {
        dispatch(setCredentials({ user: res.user, token: res.token, activeRole: roleObj.id }));
      }
    } catch (e) {
      console.warn('Quick login online fallback:', e);
      const mockUser = {
        _id: 'test_' + roleObj.id,
        name: `Test ${roleObj.title}`,
        phone: roleObj.phone,
        email: `${roleObj.id}@nightbus.test`,
        role: roleObj.id,
      };
      const mockToken = 'mock_jwt_token_for_' + roleObj.id;
      dispatch(setCredentials({ user: mockUser, token: mockToken, activeRole: roleObj.id }));
    } finally {
      setSwitchingId(null);
      onClose();
      navigate(roleObj.defaultRoute);
    }
  };

  return (
    <div 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(5, 8, 18, 0.78)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px',
        animation: 'roleFadeIn 0.2s ease-out',
      }}
    >
      <style>{`
        @keyframes roleFadeIn {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }
        .role-custom-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .role-custom-scroll::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 8px;
        }
        .role-custom-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.18);
          border-radius: 8px;
        }
        .role-custom-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.32);
        }
        .role-card-item {
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .role-card-item:hover {
          transform: translateY(-2px);
          border-color: rgba(255, 255, 255, 0.22) !important;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5) !important;
        }
      `}</style>

      <div 
        onClick={(e) => e.stopPropagation()}
        className="role-custom-scroll"
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: 'linear-gradient(165deg, #171c2f 0%, #0f1322 55%, #0a0d18 100%)',
          border: '1px solid rgba(255, 255, 255, 0.13)',
          borderRadius: '24px',
          padding: '24px',
          boxShadow: '0 30px 70px -15px rgba(0, 0, 0, 0.85), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
          color: '#ffffff',
          position: 'relative',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          paddingBottom: '16px',
          marginBottom: '16px',
        }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(99, 102, 241, 0.16)',
              border: '1px solid rgba(99, 102, 241, 0.35)',
              color: '#a5b4fc',
              fontSize: '11px',
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: '20px',
              letterSpacing: '0.6px',
              textTransform: 'uppercase',
              marginBottom: '8px',
            }}>
              <Zap size={12} color="#a5b4fc" fill="#a5b4fc" />
              <span>Simulator Cockpit</span>
            </div>

            <h2 style={{ 
              fontSize: '1.45rem', 
              fontWeight: 800, 
              color: '#ffffff', 
              letterSpacing: '-0.3px', 
              margin: '0 0 6px 0',
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px' 
            }}>
              Role Testing Cockpit
            </h2>

            <p style={{ 
              fontSize: '0.85rem', 
              color: '#94a3b8', 
              lineHeight: 1.45,
              margin: 0,
              maxWidth: '520px',
            }}>
              Switch perspectives instantly to verify and test any feature as passenger, conductor, bus owner, or admin.
            </p>
          </div>

          <button 
            onClick={onClose} 
            style={{ 
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#cbd5e1',
              transition: 'background 0.2s',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'}
            title="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Category Filter Pills */}
        <div style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '14px',
          marginBottom: '10px',
          scrollbarWidth: 'none',
        }}>
          {categories.map((c) => {
            const isSelected = selectedCategory === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                style={{
                  background: isSelected 
                    ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' 
                    : 'rgba(255, 255, 255, 0.05)',
                  border: isSelected 
                    ? '1px solid #818cf8' 
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  color: isSelected ? '#ffffff' : '#94a3b8',
                  padding: '5px 12px',
                  borderRadius: '16px',
                  fontSize: '12px',
                  fontWeight: isSelected ? 700 : 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>{c.label}</span>
                <span style={{
                  fontSize: '10px',
                  background: isSelected ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  fontWeight: 700,
                }}>
                  {c.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Roles List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredRoles.map((r) => {
            const Icon = r.icon;
            const isCurrent = activeRole === r.id;
            const isSwitching = switchingId === r.id;

            return (
              <div
                key={r.id}
                onClick={() => handleSelectRole(r)}
                className="role-card-item"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '14px 16px',
                  background: isCurrent 
                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.14) 0%, rgba(16, 185, 129, 0.04) 100%)' 
                    : 'rgba(24, 29, 48, 0.65)',
                  border: isCurrent 
                    ? '1.5px solid #10b981' 
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  boxShadow: isCurrent 
                    ? '0 0 20px rgba(16, 185, 129, 0.18)' 
                    : '0 2px 6px rgba(0, 0, 0, 0.2)',
                  position: 'relative',
                }}
              >
                {/* Role Icon Squircle */}
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '14px',
                  background: `${r.color}22`,
                  border: `1.5px solid ${r.color}50`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: `0 4px 12px ${r.color}20`,
                }}>
                  <Icon size={24} color={r.color} />
                </div>

                {/* Role Details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <span style={{ 
                      fontWeight: 700, 
                      fontSize: '0.98rem', 
                      color: '#ffffff',
                      letterSpacing: '-0.2px',
                    }}>
                      {r.title}
                    </span>

                    <span style={{
                      background: `${r.color}22`,
                      color: r.color,
                      border: `1px solid ${r.color}44`,
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '8px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.4px',
                    }}>
                      {r.badge}
                    </span>

                    <span style={{
                      background: 'rgba(255, 255, 255, 0.06)',
                      color: '#94a3b8',
                      fontSize: '0.70rem',
                      fontFamily: 'monospace',
                      padding: '2px 7px',
                      borderRadius: '6px',
                    }}>
                      📞 {r.phone}
                    </span>
                  </div>

                  <p style={{ 
                    fontSize: '0.80rem', 
                    color: '#cbd5e1', 
                    marginTop: '4px',
                    marginBottom: '4px',
                    lineHeight: 1.4,
                  }}>
                    {r.desc}
                  </p>

                  <div style={{
                    fontSize: '0.72rem',
                    color: '#818cf8',
                    fontFamily: 'monospace',
                  }}>
                    Route: {r.defaultRoute}
                  </div>
                </div>

                {/* Switch Action State */}
                <div style={{ flexShrink: 0 }}>
                  {isCurrent ? (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      background: 'rgba(16, 185, 129, 0.18)',
                      border: '1px solid rgba(16, 185, 129, 0.4)',
                      color: '#34d399',
                      padding: '6px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 700,
                      boxShadow: '0 2px 8px rgba(16, 185, 129, 0.2)',
                    }}>
                      <CheckCircle2 size={16} color="#34d399" />
                      <span>Active</span>
                    </div>
                  ) : (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.14)',
                      color: '#f8fafc',
                      padding: '7px 13px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      transition: 'all 0.15s ease',
                    }}>
                      <span>{isSwitching ? 'Switching...' : 'Switch'}</span>
                      <ArrowRight size={14} color="#a5b4fc" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info & quick reset */}
        <div style={{
          marginTop: '18px',
          paddingTop: '14px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
        }}>
          <div style={{
            fontSize: '0.78rem',
            color: '#94a3b8',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            <Sparkles size={14} color="#f59e0b" />
            <span>Switching persona auto-authenticates and navigates to the dedicated role dashboard.</span>
          </div>

          {activeRole !== 'customer' && (
            <button
              onClick={() => handleSelectRole(roles[0])}
              style={{
                background: 'rgba(99, 102, 241, 0.15)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                color: '#a5b4fc',
                borderRadius: '8px',
                padding: '5px 10px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <RotateCcw size={12} />
              <span>Reset to Passenger</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoleSwitcherModal;
