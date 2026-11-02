// ==================== src/screens/auth/TestLoginScreen.jsx ====================
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setCredentials, setActiveRole } from '../../store/slices/authSlice';
import * as authService from '../../services/authService';
import { Zap, User, Bus, Users, UtensilsCrossed, Wrench, ShieldCheck, Terminal, ArrowRight, AlertCircle } from 'lucide-react';

const TestLoginScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [phone, setPhone] = useState('9876543210');
  const [selectedRole, setSelectedRole] = useState('customer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const roles = [
    { id: 'customer', label: 'Customer', phone: '9876543210', icon: User, color: '#10b981', target: '/' },
    { id: 'owner', label: 'Bus Owner', phone: '8765432109', icon: Bus, color: '#6366f1', target: '/owner/dashboard' },
    { id: 'staff', label: 'Crew / Staff', phone: '7654321098', icon: Users, color: '#f59e0b', target: '/staff/dashboard' },
    { id: 'vendor', label: 'Food Vendor', phone: '6543210987', icon: UtensilsCrossed, color: '#f43f5e', target: '/vendor/dashboard' },
    { id: 'provider', label: 'Service Provider', phone: '4321098765', icon: Wrench, color: '#8b5cf6', target: '/provider/dashboard' },
    { id: 'admin', label: 'Administrator', phone: '5432109876', icon: ShieldCheck, color: '#10b981', target: '/admin/dashboard' },
    { id: 'developer', label: 'Developer', phone: '9999999999', icon: Terminal, color: '#ec4899', target: '/developer' },
  ];

  const handleQuickLogin = async (roleObj) => {
    setError('');
    setSuccessMsg('');
    setSelectedRole(roleObj.id);
    setPhone(roleObj.phone);
    setLoading(true);

    try {
      const response = await authService.testLogin(roleObj.phone, roleObj.id);

      if (response.success && response.token && response.user) {
        dispatch(setCredentials({
          user: response.user,
          token: response.token,
          activeRole: roleObj.id,
        }));
        setSuccessMsg(`Logged in successfully as ${roleObj.label}! Redirecting...`);
        setTimeout(() => {
          navigate(roleObj.target);
        }, 600);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (err) {
      console.error('Test login error:', err);
      // Fallback local mock login for uninterrupted testing if server returns network error
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
      setSuccessMsg(`Logged in with test profile (${roleObj.label})`);
      setTimeout(() => {
        navigate(roleObj.target);
      }, 500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: '680px',
      margin: '40px auto',
      padding: '0 20px',
    }}>
      <div className="glass-panel" style={{ padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            boxShadow: '0 8px 20px rgba(16, 185, 129, 0.35)',
          }}>
            <Zap size={28} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>1-Click Testing Cockpit</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            Instant role-based authorization to test, verify, and improve all Night Bus features.
          </p>
        </div>

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            marginBottom: '20px',
            color: '#ef4444',
            fontSize: '0.9rem',
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
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            marginBottom: '20px',
            color: '#10b981',
            fontSize: '0.9rem',
          }}>
            <Zap size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px', marginBottom: '28px' }}>
          {roles.map((r) => {
            const Icon = r.icon;
            const isSelected = selectedRole === r.id;

            return (
              <button
                key={r.id}
                onClick={() => handleQuickLogin(r)}
                disabled={loading}
                className="glass-card-interactive"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '16px',
                  background: isSelected ? 'rgba(16, 185, 129, 0.12)' : 'rgba(24, 24, 27, 0.8)',
                  border: isSelected ? `1.5px solid ${r.color}` : '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'left',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  width: '100%',
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: `${r.color}20`,
                  border: `1px solid ${r.color}40`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon size={20} color={r.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#fff' }}>
                    {r.label}
                  </div>
                  <div className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Phone: {r.phone}
                  </div>
                </div>
                <ArrowRight size={16} color="var(--text-muted)" />
              </button>
            );
          })}
        </div>

        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={() => navigate('/login')}
            className="btn btn-ghost btn-sm"
          >
            ← Standard Phone / OTP Login
          </button>
          <button
            onClick={() => navigate('/')}
            className="btn btn-secondary btn-sm"
          >
            Continue as Guest Passenger →
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestLoginScreen;
