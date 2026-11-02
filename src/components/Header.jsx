// ==================== src/components/Header.jsx (FLOATING TESTING COMPANION) ====================
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/slices/authSlice';
import { 
  SlidersHorizontal,
  Zap,
  LogOut,
  Smartphone,
  Monitor
} from 'lucide-react';

const Header = ({ onOpenRoleModal, viewMode = 'phone', onToggleViewMode }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token, activeRole } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <>
      {/* Desktop Hub (> 900px) */}
      <aside className="desktop-testing-floating-hub" aria-label="Testing Tools">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#34d399', letterSpacing: '0.5px' }}>
              HOSTINGER LIVE
            </span>
          </div>
          <span style={{ fontSize: '10px', color: '#94a3b8', fontFamily: 'monospace' }}>
            server.nightbusjourney.com
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {onToggleViewMode && (
            <button
              onClick={onToggleViewMode}
              style={{
                background: viewMode === 'web' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                border: viewMode === 'web' ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid rgba(255, 255, 255, 0.15)',
                color: viewMode === 'web' ? '#38bdf8' : '#ffffff',
                borderRadius: '8px',
                padding: '6px 10px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
              title="Toggle view width"
            >
              {viewMode === 'web' ? <Smartphone size={13} /> : <Monitor size={13} />}
              <span>{viewMode === 'web' ? 'Mobile View' : 'Tablet View'}</span>
            </button>
          )}

          <button
            onClick={onOpenRoleModal}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              borderRadius: '8px',
              padding: '6px 10px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <SlidersHorizontal size={13} color="#6366f1" />
            <span>Role: <strong style={{ color: '#a5b4fc', textTransform: 'capitalize' }}>{activeRole || 'Customer'}</strong></span>
          </button>

          <button
            onClick={() => navigate('/test-login')}
            style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#34d399',
              borderRadius: '8px',
              padding: '6px 10px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Zap size={13} />
            <span>Quick Login</span>
          </button>

          {token && (
            <button
              onClick={handleLogout}
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                borderRadius: '8px',
                padding: '6px 8px',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Log out"
            >
              <LogOut size={13} />
            </button>
          )}
        </div>
      </aside>

      {/* Mobile & Tablet Floating Role Pill (<= 900px) */}
      <div className="mobile-role-floating-pill">
        <button
          onClick={onOpenRoleModal}
          style={{
            background: 'rgba(15, 23, 42, 0.88)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#ffffff',
            borderRadius: '24px',
            padding: '7px 12px',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
          }}
          title="Switch User Role Persona"
        >
          <SlidersHorizontal size={13} color="#818cf8" />
          <span>Role: <strong style={{ color: '#a5b4fc', textTransform: 'capitalize' }}>{activeRole || 'Customer'}</strong></span>
        </button>
      </div>
    </>
  );
};

export default Header;
