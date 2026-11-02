// ==================== src/components/FloatingFeedbackWidget.jsx ====================
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Bug, 
  X, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  Cpu, 
  Sparkles, 
  Eye, 
  ChevronDown, 
  ChevronUp,
  Terminal,
  Activity
} from 'lucide-react';
import qaFeedbackService from '../services/qaFeedbackService';
import { getRecentErrors, initErrorLogger } from '../utils/errorLogger';

// Helper to deduce Screen Name from route
const getScreenNameFromPath = (pathname) => {
  if (pathname === '/') return 'HomeScreen';
  if (pathname.startsWith('/search')) return 'SearchScreen';
  if (pathname.startsWith('/results')) return 'JourneyResultsScreen';
  if (pathname.startsWith('/seat-selection')) return 'SeatSelectionScreen';
  if (pathname.startsWith('/passengers')) return 'PassengerDetailsScreen';
  if (pathname.startsWith('/checkout')) return 'BookingConfirmationScreen';
  if (pathname.startsWith('/my-bookings')) return 'MyBookingsScreen';
  if (pathname.startsWith('/booking/')) return 'BookingDetailsScreen';
  if (pathname.startsWith('/live-tracking')) return 'LiveTrackingScreen';
  if (pathname.startsWith('/yatra/')) return 'YatraDetailsScreen';
  if (pathname.startsWith('/yatra')) return 'YatraListScreen';
  if (pathname.startsWith('/rentals')) return 'RentalRequestScreen';
  if (pathname.startsWith('/food')) return 'FoodHomeScreen';
  if (pathname.startsWith('/wallet')) return 'WalletScreen';
  if (pathname.startsWith('/profile')) return 'ProfileScreen';
  if (pathname.startsWith('/login')) return 'LoginScreen';
  if (pathname.startsWith('/test-login')) return 'TestLoginScreen';
  if (pathname.startsWith('/owner/dashboard')) return 'OwnerDashboardScreen';
  if (pathname.startsWith('/owner/buses')) return 'BusManagementScreen';
  if (pathname.startsWith('/owner/routes/builder')) return 'SmartRouteBuilderScreen';
  if (pathname.startsWith('/owner/yatra')) return 'OwnerYatraScreen';
  if (pathname.startsWith('/staff/dashboard')) return 'StaffDashboardScreen';
  if (pathname.startsWith('/staff/scanner')) return 'QRScannerScreen';
  if (pathname.startsWith('/staff/manifest')) return 'PassengerManifestScreen';
  if (pathname.startsWith('/staff/verify')) return 'ManualVerificationScreen';
  if (pathname.startsWith('/staff/location')) return 'ManualLocationScreen';
  if (pathname.startsWith('/developer')) return 'DeveloperDashboardScreen';
  return 'AppScreen (' + pathname + ')';
};

const FloatingFeedbackWidget = ({ viewMode = 'phone' }) => {
  const location = useLocation();
  const { user, activeRole } = useSelector((state) => state.auth || {});

  const [isOpen, setIsOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [issueType, setIssueType] = useState('bug');
  const [severity, setSeverity] = useState('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [recentLogs, setRecentLogs] = useState([]);

  // Initialize global error listener once on mount
  useEffect(() => {
    initErrorLogger();
  }, []);

  // Refresh recent logs when modal opens
  useEffect(() => {
    if (isOpen) {
      setRecentLogs(getRecentErrors());
      setSubmissionSuccess(null);
      setErrorMessage('');
    }
  }, [isOpen]);

  const currentRoute = location.pathname + location.search;
  const currentScreen = getScreenNameFromPath(location.pathname);
  const currentRole = activeRole || user?.role || 'customer';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      setErrorMessage('Please describe the issue or desired change.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const payload = {
        title: description.slice(0, 60) + (description.length > 60 ? '...' : ''),
        description: description.trim(),
        type: issueType,
        severity,
        route: currentRoute,
        screenName: currentScreen,
        userRole: currentRole,
        userId: user?._id || user?.id || null,
        viewport: {
          mode: viewMode,
          width: window.innerWidth,
          height: window.innerHeight
        },
        consoleLogs: getRecentErrors(),
        metadata: {
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          userName: user?.name || 'Tester'
        }
      };

      const res = await qaFeedbackService.submitFeedback(payload);
      setSubmissionSuccess(res?.data || res);
      setDescription('');

      // Auto close modal after 2.5 seconds
      setTimeout(() => {
        setIsOpen(false);
        setSubmissionSuccess(null);
      }, 2500);
    } catch (err) {
      console.error('Failed to submit feedback:', err);
      setErrorMessage(err.message || 'Failed to submit report. Please check server connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* ── Floating Action Trigger ───────────────────────────── */}
      <div 
        className="qa-floating-fab-container"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '8px'
        }}
      >
        <button
          id="qa-feedback-fab-btn"
          onClick={() => setIsOpen(prev => !prev)}
          style={{
            background: isOpen 
              ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' 
              : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '9999px',
            padding: '10px 16px',
            boxShadow: '0 10px 25px -3px rgba(99, 102, 241, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            backdropFilter: 'blur(10px)',
            outline: 'none'
          }}
          title="Open QA & Autonomous AI Issue Reporter"
        >
          {isOpen ? (
            <>
              <X size={17} strokeWidth={2.5} />
              <span>Close</span>
            </>
          ) : (
            <>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Bug size={17} strokeWidth={2.5} />
                <span 
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    background: '#10b981',
                    boxShadow: '0 0 6px #10b981'
                  }} 
                />
              </div>
              <span>Report Issue for AI</span>
            </>
          )}
        </button>
      </div>

      {/* ── QA Feedback Modal Overlay ───────────────────────── */}
      {isOpen && (
        <div 
          className="qa-feedback-backdrop"
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(6px)',
            zIndex: 99998,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
        >
          <div 
            className="qa-feedback-modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '520px',
              backgroundColor: '#0f172a',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '20px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 40px rgba(99, 102, 241, 0.15)',
              color: '#f8fafc',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              animation: 'qaModalPop 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            {/* Modal Header */}
            <div style={{
              padding: '18px 20px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.35)'
                }}>
                  <Cpu size={19} color="#ffffff" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.2px' }}>
                    Tester Feedback & AI Pipeline
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#94a3b8',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Auto-Captured Telemetry Banner (Zero Manual Effort) */}
            <div style={{
              padding: '10px 20px',
              background: 'rgba(99, 102, 241, 0.08)',
              borderBottom: '1px solid rgba(99, 102, 241, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '6px',
              fontSize: '11px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#818cf8', fontWeight: 600 }}>📍 Detected Page:</span>
                <span style={{ 
                  color: '#e2e8f0', 
                  fontFamily: 'monospace', 
                  background: 'rgba(0,0,0,0.3)', 
                  padding: '2px 6px', 
                  borderRadius: '4px' 
                }}>
                  {currentRoute}
                </span>
                <span style={{ color: '#94a3b8', fontSize: '10px' }}>({currentScreen})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ 
                  background: 'rgba(16, 185, 129, 0.15)', 
                  color: '#34d399', 
                  padding: '2px 8px', 
                  borderRadius: '10px', 
                  fontWeight: 600,
                  fontSize: '10px',
                  textTransform: 'uppercase'
                }}>
                  {currentRole}
                </span>
                <span style={{ color: '#64748b' }}>|</span>
                <span style={{ color: '#94a3b8', fontSize: '10px' }}>{viewMode} mode</span>
              </div>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Submission Success Notice */}
              {submissionSuccess && (
                <div style={{
                  padding: '14px',
                  borderRadius: '12px',
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: '#34d399'
                }}>
                  <CheckCircle2 size={20} />
                  <div style={{ fontSize: '12px' }}>
                    <strong>Issue Logged Successfully!</strong>
                    <div style={{ color: '#a7f3d0', fontSize: '11px', marginTop: '2px' }}>
                      Ticket #{submissionSuccess._id?.slice(-6) || 'SAVED'} is in DB. Ready for AI direct resolution.
                    </div>
                  </div>
                </div>
              )}

              {/* Error Notice */}
              {errorMessage && (
                <div style={{
                  padding: '12px',
                  borderRadius: '10px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#f87171',
                  fontSize: '12px'
                }}>
                  <AlertTriangle size={16} />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Issue Type Selector */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Feedback Type
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                  {[
                    { id: 'bug', label: 'Bug', icon: Bug, color: '#ef4444' },
                    { id: 'improvement', label: 'Improve', icon: Sparkles, color: '#f59e0b' },
                    { id: 'feature', label: 'Feature', icon: Cpu, color: '#3b82f6' },
                    { id: 'ui_ux', label: 'UI/UX', icon: Activity, color: '#ec4899' },
                  ].map(tab => {
                    const Icon = tab.icon;
                    const isSelected = issueType === tab.id;
                    return (
                      <button
                        type="button"
                        key={tab.id}
                        onClick={() => setIssueType(tab.id)}
                        style={{
                          background: isSelected ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                          border: isSelected ? '1px solid #6366f1' : '1px solid rgba(255, 255, 255, 0.08)',
                          color: isSelected ? '#ffffff' : '#94a3b8',
                          borderRadius: '8px',
                          padding: '7px 4px',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '5px',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <Icon size={12} color={isSelected ? tab.color : '#94a3b8'} />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Severity Level */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Severity / Urgency
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[
                    { id: 'low', label: 'Low', color: '#10b981' },
                    { id: 'medium', label: 'Medium', color: '#f59e0b' },
                    { id: 'high', label: 'High', color: '#f97316' },
                    { id: 'critical', label: 'Blocker', color: '#ef4444' }
                  ].map(lvl => {
                    const isSelected = severity === lvl.id;
                    return (
                      <button
                        type="button"
                        key={lvl.id}
                        onClick={() => setSeverity(lvl.id)}
                        style={{
                          flex: 1,
                          padding: '5px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          background: isSelected ? `${lvl.color}25` : 'rgba(255, 255, 255, 0.03)',
                          border: isSelected ? `1px solid ${lvl.color}` : '1px solid rgba(255, 255, 255, 0.08)',
                          color: isSelected ? lvl.color : '#94a3b8',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {lvl.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description Input */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Issue Description & Desired Result
                </label>
                <textarea
                  id="qa-feedback-textarea"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is happening? What should happen instead? (e.g., 'Clicking the confirm button freezes on seat 12' or 'Change this button text to View Ticket')"
                  rows={4}
                  autoFocus
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    backgroundColor: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '10px',
                    padding: '12px',
                    color: '#f8fafc',
                    fontSize: '13px',
                    lineHeight: '1.5',
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              {/* Expandable Auto-Diagnostics preview */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '8px',
                overflow: 'hidden'
              }}>
                <button
                  type="button"
                  onClick={() => setShowDiagnostics(prev => !prev)}
                  style={{
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    padding: '8px 12px',
                    color: '#94a3b8',
                    fontSize: '11px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Terminal size={12} />
                    <span>Auto-Captured Context & Errors ({recentLogs.length} logged)</span>
                  </div>
                  {showDiagnostics ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {showDiagnostics && (
                  <div style={{
                    padding: '10px 12px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                    background: '#090d16',
                    fontFamily: 'monospace',
                    fontSize: '10px',
                    color: '#cbd5e1',
                    maxHeight: '130px',
                    overflowY: 'auto'
                  }}>
                    <div style={{ color: '#38bdf8' }}>Route: {currentRoute}</div>
                    <div style={{ color: '#38bdf8' }}>Screen: {currentScreen}</div>
                    <div style={{ color: '#38bdf8' }}>Role: {currentRole} | User: {user?.name || 'Unauthenticated'}</div>
                    <div style={{ color: '#38bdf8' }}>Window: {window.innerWidth}x{window.innerHeight} ({viewMode})</div>
                    {recentLogs.length > 0 ? (
                      <div style={{ marginTop: '6px' }}>
                        <div style={{ color: '#ef4444', fontWeight: 700 }}>Console & Runtime Errors:</div>
                        {recentLogs.map((log, i) => (
                          <div key={i} style={{ color: '#fca5a5', marginTop: '2px', wordBreak: 'break-all' }}>
                            {log}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ color: '#10b981', marginTop: '4px' }}>✓ No recent console errors detected</div>
                    )}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  background: isSubmitting
                    ? 'rgba(99, 102, 241, 0.4)'
                    : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
                  transition: 'all 0.2s ease'
                }}
              >
                {isSubmitting ? (
                  <span>Saving to Database...</span>
                ) : (
                  <>
                    <Send size={15} />
                    <span>Submit to AI Resolution Queue</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingFeedbackWidget;
