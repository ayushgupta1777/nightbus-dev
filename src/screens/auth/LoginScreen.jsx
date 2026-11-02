// ==================== src/screens/auth/LoginScreen.jsx (EXACT MOBILE REPLICA) ====================
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setCredentials, setActiveRole } from '../../store/slices/authSlice';
import * as authService from '../../services/authService';
import { 
  Bus, 
  Smartphone, 
  KeyRound, 
  Lock, 
  Mail, 
  User, 
  Briefcase, 
  ShieldCheck, 
  UtensilsCrossed, 
  Wrench, 
  Terminal,
  Zap,
  AlertCircle,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

// Custom role themes matching mobile LoginScreen.js
const ROLE_THEMES = {
  customer: {
    primary: '#6366f1',
    bg: '#ffffff',
    text: '#0f172a',
    subText: '#64748b',
    title: 'Night Bus',
    subtitle: 'Welcome Back • Passenger Portal',
    icon: Bus,
    inputBg: '#f9fafb',
    borderColor: '#d1d5db',
  },
  owner: {
    primary: '#d97706', // Rich amber with 100% contrast vs unreadable pale yellow
    bg: '#fffbeb',
    text: '#78350f',
    subText: '#92400e',
    title: 'Bus Owner Portal',
    subtitle: 'Fleet, routes and revenue management',
    icon: Briefcase,
    inputBg: '#ffffff',
    borderColor: '#fde68a',
  },
  staff: {
    primary: '#0284c7',
    bg: '#f0f9ff',
    text: '#075985',
    subText: '#0369a1',
    title: 'Crew Operations',
    subtitle: 'Driver & Conductor ticket verifier',
    icon: ShieldCheck,
    inputBg: '#ffffff',
    borderColor: '#bae6fd',
  },
  vendor: {
    primary: '#ea580c',
    bg: '#fff7ed',
    text: '#9a3412',
    subText: '#c2410c',
    title: 'Food Vendor Hub',
    subtitle: 'Manage highway orders and menus',
    icon: UtensilsCrossed,
    inputBg: '#ffffff',
    borderColor: '#fed7aa',
  },
  provider: {
    primary: '#0d9488',
    bg: '#f0fdf4',
    text: '#115e59',
    subText: '#0f766e',
    title: 'Service & Rentals Portal',
    subtitle: 'Bus charter, tours & maintenance',
    icon: Wrench,
    inputBg: '#ffffff',
    borderColor: '#a7f3d0',
  },
  admin: {
    primary: '#e11d48',
    bg: '#fef2f2',
    text: '#9f1239',
    subText: '#be123c',
    title: 'Admin Oversight',
    subtitle: 'System administrative panel',
    icon: ShieldCheck,
    inputBg: '#ffffff',
    borderColor: '#fecaca',
  },
};

const LoginScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState('customer');
  const [loginMode, setLoginMode] = useState('password'); // 'password' | 'otp'
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const theme = ROLE_THEMES[selectedRole] || ROLE_THEMES.customer;
  const RoleIcon = theme.icon;

  const handleRoleChange = (roleId) => {
    setSelectedRole(roleId);
    setError('');
  };

  const handleLogin = async (e) => {
    e?.preventDefault();
    setError('');

    if (!phoneOrEmail) {
      setError('Please enter your email or phone number');
      return;
    }
    if (loginMode === 'password' && !password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    try {
      let response;
      if (loginMode === 'password') {
        response = await authService.login(phoneOrEmail, password);
      } else {
        response = await authService.verifyOTP(phoneOrEmail, otp);
      }

      if (response && response.token && response.user) {
        dispatch(setCredentials({
          user: response.user,
          token: response.token,
          activeRole: selectedRole,
        }));
        navigate(selectedRole === 'owner' ? '/owner/dashboard' : selectedRole === 'staff' ? '/staff/dashboard' : '/');
      } else {
        throw new Error(response?.message || 'Login failed');
      }
    } catch (err) {
      setError(err.message || 'Invalid credentials. You can use 1-Click Quick Login below for testing.');
    } finally {
      setLoading(false);
    }
  };

  // Quick Testing Helper with instant offline fallback
  const handleQuickTestLogin = async (role) => {
    setLoading(true);
    setError('');
    try {
      const phoneMap = {
        customer: '9876543210',
        owner: '8765432109',
        staff: '7654321098',
        vendor: '6543210987',
        provider: '4321098765',
        admin: '5432109876',
        developer: '9999999999',
      };
      const targetMap = {
        customer: '/',
        owner: '/owner/dashboard',
        staff: '/staff/dashboard',
        vendor: '/food',
        provider: '/rentals',
        admin: '/owner/dashboard',
        developer: '/developer',
      };

      let res;
      try {
        res = await authService.testLogin(phoneMap[role] || '9876543210', role);
      } catch (err) {
        // Fallback mock profile so testers are never blocked
        res = {
          success: true,
          token: 'mock_jwt_token_for_' + role,
          user: {
            _id: 'test_' + role,
            name: `Test ${role.toUpperCase()}`,
            phone: phoneMap[role] || '9876543210',
            email: `${role}@nightbus.test`,
            role: role,
          }
        };
        authService.storeAuthData(res.token, res.user);
      }

      if (res && res.token && res.user) {
        dispatch(setCredentials({
          user: res.user,
          token: res.token,
          activeRole: role,
        }));
        navigate(targetMap[role] || '/');
      }
    } catch (e) {
      setError('Quick login failed: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const personaQuickList = [
    { id: 'customer', label: 'Passenger', color: '#6366f1' },
    { id: 'owner', label: 'Bus Owner', color: '#d97706' },
    { id: 'staff', label: 'Crew', color: '#0284c7' },
    { id: 'vendor', label: 'Vendor', color: '#ea580c' },
    { id: 'provider', label: 'Partner', color: '#0d9488' },
    { id: 'admin', label: 'Admin', color: '#e11d48' },
  ];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100%',
      background: '#f8fafc',
      padding: '16px',
      paddingBottom: '30px',
    }}>
      {/* ─── Role Switcher Tabs (Matching Mobile LoginScreen) ────────────────── */}
      <div style={{
        display: 'flex',
        overflowX: 'auto',
        gap: '6px',
        paddingBottom: '12px',
        borderBottom: '1px solid #e2e8f0',
        marginBottom: '16px',
        scrollbarWidth: 'none',
      }}>
        {Object.keys(ROLE_THEMES).map((roleKey) => {
          const rTheme = ROLE_THEMES[roleKey];
          const isSelected = selectedRole === roleKey;
          return (
            <button
              key={roleKey}
              onClick={() => handleRoleChange(roleKey)}
              style={{
                background: isSelected 
                  ? `linear-gradient(135deg, ${rTheme.primary} 0%, ${rTheme.primary}ee 100%)` 
                  : '#ffffff',
                color: isSelected ? '#ffffff' : '#475569',
                border: `1.5px solid ${isSelected ? rTheme.primary : '#cbd5e1'}`,
                borderRadius: '20px',
                padding: '7px 14px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
                boxShadow: isSelected ? `0 3px 10px ${rTheme.primary}40` : '0 1px 2px rgba(0,0,0,0.03)',
                flexShrink: 0,
              }}
            >
              {roleKey.charAt(0).toUpperCase() + roleKey.slice(1)}
            </button>
          );
        })}
      </div>

      {/* ─── Header Info ────────────────────────────────────────────────────── */}
      <div style={{ textAlign: 'center', margin: '8px 0 18px' }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          background: `${theme.primary}18`,
          border: `1px solid ${theme.primary}30`,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '10px',
        }}>
          <RoleIcon size={28} color={theme.primary} />
        </div>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>{theme.title}</h1>
        <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>{theme.subtitle}</p>
      </div>

      {/* ─── Login Mode Toggle (Password / OTP) ──────────────────────────────── */}
      <div style={{
        display: 'flex',
        background: '#e2e8f0',
        borderRadius: '12px',
        padding: '3px',
        marginBottom: '16px',
      }}>
        <button
          type="button"
          onClick={() => setLoginMode('password')}
          style={{
            flex: 1,
            background: loginMode === 'password' ? '#ffffff' : 'transparent',
            color: loginMode === 'password' ? '#0f172a' : '#64748b',
            border: 'none',
            borderRadius: '9px',
            padding: '8px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: loginMode === 'password' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            transition: 'all 0.15s ease',
          }}
        >
          Password
        </button>
        <button
          type="button"
          onClick={() => setLoginMode('otp')}
          style={{
            flex: 1,
            background: loginMode === 'otp' ? '#ffffff' : 'transparent',
            color: loginMode === 'otp' ? '#0f172a' : '#64748b',
            border: 'none',
            borderRadius: '9px',
            padding: '8px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: loginMode === 'otp' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            transition: 'all 0.15s ease',
          }}
        >
          Phone OTP
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div style={{
          background: '#fef2f2',
          border: '1.5px solid #fecaca',
          borderRadius: '12px',
          padding: '10px 12px',
          color: '#b91c1c',
          fontSize: '12px',
          fontWeight: 600,
          marginBottom: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* ─── Form Inputs ────────────────────────────────────────────────────── */}
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
            {loginMode === 'password' ? 'Email or Phone Number' : 'Phone Number'}
          </label>
          <div style={{
            background: '#ffffff',
            border: '1.5px solid #cbd5e1',
            borderRadius: '12px',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
          }}>
            <User size={18} color="#64748b" />
            <input
              type="text"
              placeholder={loginMode === 'password' ? 'user@example.com' : '10-digit mobile number'}
              value={phoneOrEmail}
              onChange={(e) => setPhoneOrEmail(e.target.value)}
              style={{
                width: '100%',
                background: 'none',
                border: 'none',
                outline: 'none',
                fontSize: '14px',
                color: '#0f172a',
                fontWeight: 500,
              }}
            />
          </div>
        </div>

        {loginMode === 'password' ? (
          <div>
            <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
              Password
            </label>
            <div style={{
              background: '#ffffff',
              border: '1.5px solid #cbd5e1',
              borderRadius: '12px',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            }}>
              <Lock size={18} color="#64748b" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  fontSize: '14px',
                  color: '#0f172a',
                }}
              />
            </div>
          </div>
        ) : (
          <div>
            <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
              Enter 6-digit OTP
            </label>
            <input
              type="text"
              placeholder="000000"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              style={{
                width: '100%',
                background: '#ffffff',
                border: '1.5px solid #cbd5e1',
                borderRadius: '12px',
                padding: '12px 14px',
                fontSize: '18px',
                fontWeight: 700,
                letterSpacing: '4px',
                textAlign: 'center',
                outline: 'none',
                color: '#0f172a',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
              }}
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.primary}dd 100%)`,
            color: '#ffffff',
            border: 'none',
            borderRadius: '12px',
            padding: '14px',
            fontSize: '15px',
            fontWeight: 800,
            cursor: loading ? 'wait' : 'pointer',
            marginTop: '4px',
            boxShadow: `0 4px 14px ${theme.primary}45`,
            transition: 'all 0.15s ease',
          }}
        >
          {loading ? 'Authenticating...' : 'Sign In'}
        </button>
      </form>

      {/* ─── 1-Click Fast Staging Test Login Section ────────────────────────── */}
      <div style={{
        marginTop: '24px',
        background: 'linear-gradient(145deg, #0f172a 0%, #1e1b4b 60%, #312e81 100%)',
        borderRadius: '18px',
        padding: '16px',
        color: '#ffffff',
        boxShadow: '0 8px 24px rgba(15, 23, 42, 0.25)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Glow accent */}
        <div style={{
          position: 'absolute',
          top: '-30px',
          right: '-30px',
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.25) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Section Top Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '10px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '6px',
              background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Zap size={14} color="#78350f" fill="#78350f" />
            </div>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#ffffff' }}>
              Instant Staging Login
            </span>
          </div>

          <button
            type="button"
            onClick={() => navigate('/test-login')}
            style={{
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#a5b4fc',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              padding: '4px 10px',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>All Personas →</span>
          </button>
        </div>

        <p style={{ fontSize: '11px', color: '#cbd5e1', margin: '0 0 12px', lineHeight: 1.35 }}>
          Bypass passwords & OTP. Instant session with 1 tap:
        </p>

        {/* Big 1-Tap Login as currently selected role */}
        <button
          type="button"
          onClick={() => handleQuickTestLogin(selectedRole)}
          disabled={loading}
          style={{
            width: '100%',
            background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.primary}cc 100%)`,
            border: '1px solid rgba(255, 255, 255, 0.25)',
            color: '#ffffff',
            padding: '12px 16px',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: loading ? 'wait' : 'pointer',
            boxShadow: `0 4px 14px ${theme.primary}60`,
            transition: 'transform 0.12s ease',
            marginBottom: '12px',
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <Zap size={16} fill="#ffffff" />
          <span>1-Tap Login as {selectedRole.toUpperCase()}</span>
          <ArrowRight size={15} />
        </button>

        {/* Quick Persona Pills Grid */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px',
          paddingTop: '8px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        }}>
          {personaQuickList.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handleQuickTestLogin(p.id)}
              disabled={loading}
              style={{
                background: selectedRole === p.id ? `${p.color}35` : 'rgba(255, 255, 255, 0.08)',
                border: `1px solid ${selectedRole === p.id ? p.color : 'rgba(255, 255, 255, 0.15)'}`,
                color: selectedRole === p.id ? '#ffffff' : '#e2e8f0',
                padding: '5px 10px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.12s ease',
              }}
            >
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: p.color }} />
              <span>{p.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;

