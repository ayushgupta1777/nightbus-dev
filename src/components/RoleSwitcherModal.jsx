// ==================== src/components/RoleSwitcherModal.jsx ====================
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setActiveRole } from '../store/slices/authSlice';
import { 
  X, 
  User, 
  Bus, 
  Users, 
  UtensilsCrossed, 
  Wrench, 
  ShieldCheck, 
  Terminal, 
  CheckCircle,
  Zap
} from 'lucide-react';
import { testLogin } from '../services/authService';
import { setCredentials } from '../store/slices/authSlice';

const RoleSwitcherModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { activeRole, user } = useSelector((state) => state.auth);

  if (!isOpen) return null;

  const roles = [
    {
      id: 'customer',
      title: 'Customer Experience',
      badge: 'Passenger',
      phone: '9876543210',
      icon: User,
      color: '#10b981',
      desc: 'Search buses, 2D deck seat selection, Razorpay checkout, live bus tracking, Yatra tours & food ordering.',
      defaultRoute: '/',
    },
    {
      id: 'owner',
      title: 'Bus Owner Portal',
      badge: 'Fleet Operator',
      phone: '8765432109',
      icon: Bus,
      color: '#6366f1',
      desc: 'Fleet overview, add buses, interactive seat layout builder, smart multi-stop route maker & revenue analytics.',
      defaultRoute: '/owner/dashboard',
    },
    {
      id: 'staff',
      title: 'Conductor & Staff Cockpit',
      badge: 'Trip Crew',
      phone: '7654321098',
      icon: Users,
      color: '#f59e0b',
      desc: 'Live webcam QR boarding pass scanner, passenger manifest, manual PNR ticket check-in & trip status updates.',
      defaultRoute: '/staff/dashboard',
    },
    {
      id: 'vendor',
      title: 'Highway Food Vendor',
      badge: 'Kitchen Partner',
      phone: '6543210987',
      icon: UtensilsCrossed,
      color: '#f43f5e',
      desc: 'Live passenger meal orders queue, onboard menu item manager, pricing, stock availability.',
      defaultRoute: '/vendor/dashboard',
    },
    {
      id: 'provider',
      title: 'Bus Service Provider',
      badge: 'Maintenance',
      phone: '4321098765',
      icon: Wrench,
      color: '#8b5cf6',
      desc: 'Fleet repair requests, roadside assistance dispatch, coverage areas and lead quotations.',
      defaultRoute: '/provider/dashboard',
    },
    {
      id: 'admin',
      title: 'Platform Administrator',
      badge: 'Super Admin',
      phone: '5432109876',
      icon: ShieldCheck,
      color: '#10b981',
      desc: 'Platform-wide telemetry, promotional banners & home content manager, discount coupons creation.',
      defaultRoute: '/admin/dashboard',
    },
    {
      id: 'developer',
      title: 'Developer Control Room',
      badge: 'Dev Mode',
      phone: '9999999999',
      icon: Terminal,
      color: '#ec4899',
      desc: 'Direct MongoDB database collection viewer, telemetry debugger, test triggers and audit traces.',
      defaultRoute: '/developer',
    },
  ];

  const handleSelectRole = async (roleObj) => {
    dispatch(setActiveRole(roleObj.id));

    // Also attempt quick login if not already logged in with this role
    try {
      const res = await testLogin(roleObj.phone, roleObj.id);
      if (res.success && res.token && res.user) {
        dispatch(setCredentials({ user: res.user, token: res.token, activeRole: roleObj.id }));
      }
    } catch (e) {
      console.warn('Quick login note:', e);
    }

    onClose();
    navigate(roleObj.defaultRoute);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
    }}>
      <div className="glass-panel animate-fade-in" style={{
        width: '100%',
        maxWidth: '680px',
        maxHeight: '90vh',
        overflowY: 'auto',
        background: '#121217',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '16px',
          marginBottom: '20px',
        }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={22} color="#10b981" />
              Role Testing Cockpit
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Switch perspectives instantly to verify and improve any application feature.
            </p>
          </div>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: '6px' }}>
            <X size={20} color="#a1a1aa" />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {roles.map((r) => {
            const Icon = r.icon;
            const isCurrent = activeRole === r.id;

            return (
              <div
                key={r.id}
                onClick={() => handleSelectRole(r)}
                className="glass-card-interactive"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '14px 18px',
                  background: isCurrent ? 'rgba(16, 185, 129, 0.1)' : 'rgba(24, 24, 27, 0.7)',
                  border: isCurrent ? '1.5px solid #10b981' : '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: `${r.color}20`,
                  border: `1px solid ${r.color}40`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon size={22} color={r.color} />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.98rem', color: '#fff' }}>
                      {r.title}
                    </span>
                    <span className="badge" style={{
                      background: `${r.color}15`,
                      color: r.color,
                      fontSize: '0.68rem',
                      padding: '2px 8px',
                    }}>
                      {r.badge}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {r.desc}
                  </p>
                </div>

                {isCurrent ? (
                  <CheckCircle size={20} color="#10b981" />
                ) : (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Switch ➔
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RoleSwitcherModal;
