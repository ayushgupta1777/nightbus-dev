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
    text: '#111827',
    subText: '#6b7280',
    title: 'Night Bus',
    subtitle: 'Welcome Back',
    icon: Bus,
    inputBg: '#f9fafb',
    borderColor: '#d1d5db',
  },
  owner: {
    primary: '#eab308',
    bg: '#fffbeb',
    text: '#78350f',
    subText: '#b45309',
    title: 'Bus Owner Portal',
    subtitle: 'Fleet and schedule management',
    icon: Briefcase,
    inputBg: '#ffffff',
    borderColor: '#fef08a',
  },
  staff: {
    primary: '#0ea5e9',
    bg: '#f0f9ff',
    text: '#0369a1',
    subText: '#0284c7',
    title: 'Crew Operations',
    subtitle: 'Driver & Conductor ticket verifier',
    icon: ShieldCheck,
    inputBg: '#ffffff',
    borderColor: '#bae6fd',
  },
  vendor: {
    primary: '#f97316',
    bg: '#fff7ed',
    text: '#c2410c',
    subText: '#ea580c',
    title: 'Food Vendor Hub',
    subtitle: 'Manage orders and menus',
    icon: UtensilsCrossed,
    inputBg: '#ffffff',
    borderColor: '#fed7aa',
  },
  provider: {
    primary: '#10b981',
    bg: '#f0fdf4',
    text: '#047857',
    subText: '#059669',
    title: 'Service Portal',
    subtitle: 'Provide Taxi, Hotel & other services',
    icon: Wrench,
    inputBg: '#ffffff',
    borderColor: '#a7f3d0',
  },
  admin: {
    primary: '#ef4444',
    bg: '#fef2f2',
    text: '#b91c1c',
    subText: '#dc2626',
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

  // Quick Testing Helper
  const handleQuickTestLogin = async (role) => {
    setLoading(true);
    try {
      const phoneMap = {
        customer: '9876543210',
        owner: '8765432109',
        staff: '7654321098',
        vendor: '6543210987',
        provider: '4321098765',
        admin: '5432109876',
      };
      const res = await authService.testLogin(phoneMap[role] || '9876543210', role);
      if (res.token && res.user) {
        dispatch(setCredentials({
          user: res.user,
          token: res.token,
          activeRole: role,
        }));
        navigate(role === 'owner' ? '/owner/dashboard' : role === 'staff' ? '/staff/dashboard' : '/');
      }
    } catch (e) {
      setError('Quick login failed: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100%',
      background: '#f8fafc',
      padding: '16px',
    }}>
      {/* ─── Role Switcher Tabs (Matching Mobile LoginScreen) ────────────────── */}
      <div style={{
        display: 'flex',
        overflowX: 'auto',
        gap: '6px',
        paddingBottom: '12px',
        borderBottom: '1px solid #e2e8f0',
        marginBottom: '16px',
      }}>
        {Object.keys(ROLE_THEMES).map((roleKey) => {
          const rTheme = ROLE_THEMES[roleKey];
          const isSelected = selectedRole === roleKey;
          return (
            <button
              key={roleKey}
              onClick={() => handleRoleChange(roleKey)}
              style={{
                background: isSelected ? rTheme.primary : '#ffffff',
                color: isSelected ? '#ffffff' : '#475569',
                border: `1px solid ${isSelected ? rTheme.primary : '#cbd5e1'}`,
                borderRadius: '20px',
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              {roleKey.charAt(0).toUpperCase() + roleKey.slice(1)}
            </button>
          );
        })}
      </div>

      {/* ─── Header Info ────────────────────────────────────────────────────── */}
      <div style={{ textAlign: 'center', margin: '10px 0 20px' }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          background: `${theme.primary}15`,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '10px',
        }}>
          <RoleIcon size={28} color={theme.primary} />
        </div>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>{theme.title}</h1>
        <p style={{ fontSize: '13px', color: '#64748b' }}>{theme.subtitle}</p>
      </div>

      {/* ─── Login Mode Toggle (Password / OTP) ──────────────────────────────── */}
      <div style={{
        display: 'flex',
        background: '#e2e8f0',
        borderRadius: '10px',
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
            borderRadius: '8px',
            padding: '8px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: loginMode === 'password' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
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
            borderRadius: '8px',
            padding: '8px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: loginMode === 'otp' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
          }}
        >
          Phone OTP
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '10px',
          padding: '10px 12px',
          color: '#b91c1c',
          fontSize: '12px',
          fontWeight: 500,
          marginBottom: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          <AlertCircle size={15} />
          <span>{error}</span>
        </div>
      )}

      {/* ─── Form Inputs ────────────────────────────────────────────────────── */}
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
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
              }}
            />
          </div>
        </div>

        {loginMode === 'password' ? (
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
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
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
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
                fontSize: '16px',
                letterSpacing: '4px',
                textAlign: 'center',
                outline: 'none',
              }}
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            background: theme.primary,
            color: '#ffffff',
            border: 'none',
            borderRadius: '12px',
            padding: '14px',
            fontSize: '15px',
            fontWeight: 700,
            cursor: loading ? 'wait' : 'pointer',
            marginTop: '4px',
            boxShadow: `0 4px 12px ${theme.primary}40`,
          }}
        >
          {loading ? 'Authenticating...' : 'Sign In'}
        </button>
      </form>

      {/* ─── 1-Click Fast Test Login ────────────────────────────────────────── */}
      <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
        <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Quick Testing Access
        </span>
        <button
          onClick={() => handleQuickTestLogin(selectedRole)}
          style={{
            marginTop: '8px',
            width: '100%',
            background: '#ffffff',
            border: `1.5px solid ${theme.primary}`,
            color: theme.primary,
            padding: '10px',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            cursor: 'pointer',
          }}
        >
          <Zap size={14} color={theme.primary} />
          <span>1-Click Test Login as {selectedRole.toUpperCase()}</span>
        </button>
      </div>
    </div>
  );
};

export default LoginScreen;
