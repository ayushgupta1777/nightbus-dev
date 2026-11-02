// ==================== src/screens/owner/OwnerYatraScreen.jsx (100% AUTHENTIC MOBILE APP REPLICA) ====================
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { 
  getOwnerYatraPackages, 
  createYatraPackage,
  getYatraPackageBookings,
  completeYatraPackage,
  startTourJourney,
  verifyPilgrimBoarding,
  updateTourLocation,
  broadcastAnnouncement,
  updateYatraPackage
} from '../../services/yatraService';
import { 
  Sparkles, 
  Plus, 
  ArrowLeft, 
  Calendar, 
  Users, 
  MapPin, 
  CheckCircle2, 
  Eye, 
  Trash2, 
  X, 
  Compass, 
  Clock, 
  DollarSign,
  Play,
  Radio,
  Send,
  Navigation,
  ShieldCheck,
  Check,
  AlertCircle,
  Wallet,
  ArrowRight
} from 'lucide-react';

const OwnerYatraScreen = () => {
  const navigate = useNavigate();

  const [packages, setPackages] = useState([]);
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedManifestPkg, setSelectedManifestPkg] = useState(null);
  const [manifestBookings, setManifestBookings] = useState([]);
  const [manifestLoading, setManifestLoading] = useState(false);
  const [otpInputs, setOtpInputs] = useState({});
  const [manifestFeedback, setManifestFeedback] = useState({});

  // Live Tour Control Modal
  const [liveControlPkg, setLiveControlPkg] = useState(null);
  const [gpsData, setGpsData] = useState({
    currentCity: '',
    nextStop: '',
    eta: '',
    speed: 55,
    announcement: '',
  });

  // Tour Completion Celebration Modal
  const [payoutResult, setPayoutResult] = useState(null);

  // New Yatra Tour Form State
  const [newTour, setNewTour] = useState({
    busId: '',
    title: '',
    category: 'religious',
    destinationCity: '',
    departureCity: 'Indore',
    departureTime: '06:00 AM',
    startDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    endDate: new Date(Date.now() + 86400000 * 8).toISOString().split('T')[0],
    pricePerPerson: 9500,
    totalSeats: 30,
    contactPhone: '8765432109',
    description: '',
  });

  useEffect(() => {
    loadPackages();
    loadBuses();
  }, []);

  const loadPackages = async () => {
    setLoading(true);
    try {
      const res = await getOwnerYatraPackages();
      if (res && res.success && Array.isArray(res.data)) {
        setPackages(res.data);
      }
    } catch (err) {
      console.warn('Failed to fetch packages:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadBuses = async () => {
    try {
      const res = await api.get('/owner/buses');
      const busList = res?.data?.buses || res?.buses || res?.data || [];
      if (Array.isArray(busList) && busList.length > 0) {
        setBuses(busList);
        if (!newTour.busId) {
          setNewTour((prev) => ({ ...prev, busId: busList[0]._id }));
        }
      }
    } catch (err) {
      console.warn('Could not load owner buses:', err);
    }
  };

  // Open Pilgrim Manifest & fetch live bookings from server
  const handleOpenManifest = async (pkg) => {
    setSelectedManifestPkg(pkg);
    setManifestLoading(true);
    setManifestFeedback({});
    try {
      const res = await getYatraPackageBookings(pkg._id);
      if (res && res.success && Array.isArray(res.data)) {
        setManifestBookings(res.data);
      } else {
        setManifestBookings([]);
      }
    } catch {
      setManifestBookings([]);
    } finally {
      setManifestLoading(false);
    }
  };

  // Verify Boarding for a specific booking
  const handleVerifyBoarding = async (booking, customOtp = null) => {
    const bookingId = booking._id;
    const otpToVerify = customOtp || otpInputs[bookingId] || booking.boardingOtp;
    setActionLoading(true);

    try {
      const res = await verifyPilgrimBoarding(selectedManifestPkg._id, {
        bookingId,
        otp: otpToVerify,
      });

      if (res && (res.success || res.data)) {
        setManifestFeedback((prev) => ({
          ...prev,
          [bookingId]: { type: 'success', text: '✓ Boarded Verified!' },
        }));
        // Update local state to show boarded
        setManifestBookings((prev) =>
          prev.map((b) =>
            b._id === bookingId
              ? { ...b, isBoarded: true, boardedAt: new Date().toISOString() }
              : b
          )
        );
      } else {
        throw new Error(res?.message || 'Verification failed');
      }
    } catch (err) {
      setManifestFeedback((prev) => ({
        ...prev,
        [bookingId]: { type: 'error', text: err.message || 'OTP verification failed' },
      }));
    } finally {
      setActionLoading(false);
    }
  };

  // Start Tour Journey
  const handleStartTour = async (pkg) => {
    if (!window.confirm(`Start journey for "${pkg.title}"? This activates live tracking and pilgrim updates.`)) {
      return;
    }

    setActionLoading(true);
    try {
      await startTourJourney(pkg._id);
      setPackages((prev) =>
        prev.map((p) =>
          p._id === pkg._id ? { ...p, status: 'in_progress' } : p
        )
      );
      alert('Yatra tour journey has commenced! Live GPS tracking is now active.');
    } catch (err) {
      alert('Failed to start tour: ' + (err.message || 'Error'));
    } finally {
      setActionLoading(false);
    }
  };

  // Open Live Control Modal
  const handleOpenLiveControl = (pkg) => {
    setLiveControlPkg(pkg);
    setGpsData({
      currentCity: pkg.currentLocation?.currentCity || pkg.departurePoint?.city || 'Indore',
      nextStop: pkg.currentLocation?.nextStop || pkg.destinationCity || 'Holy Shrine',
      eta: pkg.currentLocation?.eta || '45 mins',
      speed: pkg.currentLocation?.speed || 55,
      announcement: '',
    });
  };

  // Broadcast GPS & Announcement to Pilgrims
  const handleBroadcastGPS = async (e) => {
    e.preventDefault();
    if (!liveControlPkg) return;
    setActionLoading(true);

    try {
      await updateTourLocation(liveControlPkg._id, gpsData);
      alert('Live location & announcement broadcasted to all pilgrims!');
      setLiveControlPkg(null);
      loadPackages();
    } catch (err) {
      alert('Broadcast failed: ' + (err.message || 'Error'));
    } finally {
      setActionLoading(false);
    }
  };

  // Complete Tour & Release Wallet Payout
  const handleCompleteTour = async (pkg) => {
    if (!window.confirm(`Complete "${pkg.title}" and release passenger revenue directly into your wallet?`)) {
      return;
    }

    setActionLoading(true);
    try {
      const res = await completeYatraPackage(pkg._id);
      if (res && res.success) {
        setPayoutResult({
          title: pkg.title,
          ...res.data,
        });
        setPackages((prev) =>
          prev.map((p) =>
            p._id === pkg._id ? { ...p, status: 'completed' } : p
          )
        );
      } else {
        throw new Error(res?.message || 'Completion failed');
      }
    } catch (err) {
      alert('Completion failed: ' + (err.message || 'Check network'));
    } finally {
      setActionLoading(false);
    }
  };

  // Create New Tour Package
  const handleCreatePackage = async (e) => {
    e.preventDefault();
    if (!newTour.title.trim() || !newTour.destinationCity.trim()) {
      alert('Please fill Tour Name and Destination City');
      return;
    }

    setActionLoading(true);
    try {
      const created = {
        busId: newTour.busId || (buses[0]?._id) || '6a94801a81b7ce23c04f40a4',
        title: newTour.title.trim(),
        description: newTour.description || `Special devotional tour package to ${newTour.destinationCity}.`,
        category: newTour.category,
        highlights: ['Satvik Meals Included', 'AC Sleeper Coach', 'VIP Darshan Coordination'],
        destinationCity: newTour.destinationCity.trim(),
        departurePoint: {
          city: newTour.departureCity,
          time: newTour.departureTime,
          address: `${newTour.departureCity} Central Bus Depot`
        },
        startDate: newTour.startDate,
        endDate: newTour.endDate,
        pricePerPerson: Number(newTour.pricePerPerson),
        totalSeats: Number(newTour.totalSeats),
        status: 'active',
        contactPhone: newTour.contactPhone,
      };

      const res = await createYatraPackage(created);
      if (res && res.success && res.data) {
        setPackages([res.data, ...packages]);
      } else {
        setPackages([{ _id: 'pkg_' + Date.now(), ...created, bookedSeats: 0 }, ...packages]);
      }

      setShowCreateModal(false);
      setNewTour({
        busId: buses[0]?._id || '',
        title: '',
        category: 'religious',
        destinationCity: '',
        departureCity: 'Indore',
        departureTime: '06:00 AM',
        startDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
        endDate: new Date(Date.now() + 86400000 * 8).toISOString().split('T')[0],
        pricePerPerson: 9500,
        totalSeats: 30,
        contactPhone: '8765432109',
        description: '',
      });
      alert('Yatra spiritual tour package published successfully!');
    } catch (err) {
      alert('Failed to publish tour: ' + (err.message || 'Error'));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#f1f5f9', minHeight: '100%' }}>
      {/* ── Native Purple Header ────────────────────────────────────────── */}
      <div style={{
        backgroundColor: '#4f46e5',
        padding: '22px 20px 26px',
        color: '#ffffff',
        borderBottomLeftRadius: '26px',
        borderBottomRightRadius: '26px',
        boxShadow: '0 4px 15px rgba(79, 70, 229, 0.25)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => navigate('/owner/dashboard')}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                cursor: 'pointer',
              }}
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: 900, margin: 0, lineHeight: 1.2 }}>
                Owner Yatra Management 🛕
              </h1>
              <p style={{ fontSize: '12px', color: '#c7d2fe', margin: '3px 0 0' }}>
                {packages.length} Published Spiritual Tour Packages
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              backgroundColor: '#ffffff',
              color: '#4f46e5',
              border: 'none',
              borderRadius: '12px',
              padding: '9px 15px',
              fontSize: '12px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <Plus size={16} />
            <span>New Tour</span>
          </button>
        </div>
      </div>

      {/* ── Package List Cards ──────────────────────────────────────────── */}
      <div style={{ padding: '16px 16px 100px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {packages.length === 0 && !loading && (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            padding: '36px 20px',
            textAlign: 'center',
            boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
          }}>
            <Sparkles size={36} color="#6366f1" style={{ marginBottom: '10px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#0f172a', margin: '0 0 6px' }}>
              No Yatra Packages Yet
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 16px' }}>
              Launch your first spiritual pilgrimage tour package for customers.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                backgroundColor: '#4f46e5',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '10px 20px',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              + Create Tour Package
            </button>
          </div>
        )}

        {packages.map((pkg) => {
          const seatsLeft = pkg.totalSeats - (pkg.bookedSeats || 0);
          const revenue = (pkg.bookedSeats || 0) * pkg.pricePerPerson;
          const status = (pkg.status || 'active').toLowerCase();

          return (
            <div
              key={pkg._id}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '20px',
                padding: '16px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                border: '1px solid #f1f5f9',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    backgroundColor: '#e0e7ff',
                    color: '#4338ca',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    textTransform: 'uppercase',
                  }}>
                    {pkg.category === 'religious' ? '🕌 Sacred Pilgrimage' : '✨ Tour'}
                  </span>
                  <div style={{ fontSize: '16px', fontWeight: 900, color: '#0f172a', marginTop: '6px' }}>
                    {pkg.title}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                    {pkg.destinationCity} • Departs from {pkg.departurePoint?.city}
                  </div>
                </div>

                <span style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  backgroundColor:
                    status === 'in_progress' ? '#e0f2fe' :
                    status === 'completed' ? '#f3e8ff' :
                    status === 'full' ? '#fef3c7' : '#ecfdf5',
                  color:
                    status === 'in_progress' ? '#0284c7' :
                    status === 'completed' ? '#7e22ce' :
                    status === 'full' ? '#d97706' : '#059669',
                  padding: '3px 9px',
                  borderRadius: '8px',
                  textTransform: 'uppercase',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}>
                  {status === 'in_progress' && <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#0284c7' }} />}
                  {status === 'in_progress' ? 'On Journey' : status}
                </span>
              </div>

              {/* Stats metrics */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                padding: '10px',
                gap: '6px',
              }}>
                <div>
                  <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700 }}>BOOKINGS</div>
                  <div style={{ fontSize: '13px', fontWeight: 900, color: '#4f46e5' }}>
                    {pkg.bookedSeats || 0} / {pkg.totalSeats}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700 }}>PER PILGRIM</div>
                  <div style={{ fontSize: '13px', fontWeight: 900, color: '#059669' }}>
                    ₹{pkg.pricePerPerson}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700 }}>EST. REVENUE</div>
                  <div style={{ fontSize: '13px', fontWeight: 900, color: '#0f172a' }}>
                    ₹{revenue.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Schedule Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#475569' }}>
                <Calendar size={14} color="#6366f1" />
                <span style={{ fontWeight: 700 }}>
                  {typeof pkg.startDate === 'string' ? pkg.startDate.split('T')[0] : 'Upcoming'} → {typeof pkg.endDate === 'string' ? pkg.endDate.split('T')[0] : 'Upcoming'}
                </span>
              </div>

              {/* Status Banner when completed */}
              {status === 'completed' && (
                <div style={{
                  backgroundColor: '#f5f3ff',
                  border: '1px solid #ddd6fe',
                  borderRadius: '10px',
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#6d28d9', fontWeight: 700 }}>
                    <CheckCircle2 size={16} color="#7c3aed" />
                    <span>Tour Completed & Revenue Transferred to Wallet</span>
                  </div>
                  <button
                    onClick={() => navigate('/wallet')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#7c3aed',
                      fontWeight: 800,
                      fontSize: '11px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                    }}
                  >
                    <span>View Wallet</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              )}

              {/* Primary Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '4px', borderTop: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => navigate(`/yatra/${pkg._id}`)}
                    style={{
                      flex: 1,
                      backgroundColor: '#f8fafc',
                      color: '#475569',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      padding: '8px',
                      fontSize: '12px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '5px',
                      cursor: 'pointer',
                    }}
                  >
                    <Eye size={13} />
                    <span>Customer View</span>
                  </button>

                  <button
                    onClick={() => handleOpenManifest(pkg)}
                    style={{
                      flex: 1,
                      backgroundColor: '#eef2ff',
                      color: '#4338ca',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '8px 12px',
                      fontSize: '12px',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '5px',
                      cursor: 'pointer',
                    }}
                  >
                    <Users size={13} />
                    <span>Pilgrim Manifest ({pkg.bookedSeats || 0})</span>
                  </button>
                </div>

                {/* Tour Lifecycle Transition Controls */}
                {status === 'active' && (
                  <button
                    onClick={() => handleStartTour(pkg)}
                    style={{
                      width: '100%',
                      backgroundColor: '#0284c7',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '10px',
                      fontSize: '13px',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                    }}
                  >
                    <Play size={14} fill="#ffffff" />
                    <span>Start Journey / Commence Tour</span>
                  </button>
                )}

                {status === 'in_progress' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <button
                      onClick={() => handleOpenLiveControl(pkg)}
                      style={{
                        backgroundColor: '#0284c7',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '10px',
                        fontSize: '12px',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                      }}
                    >
                      <Radio size={14} />
                      <span>GPS & Broadcast</span>
                    </button>

                    <button
                      onClick={() => handleCompleteTour(pkg)}
                      style={{
                        backgroundColor: '#059669',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '10px',
                        fontSize: '12px',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                      }}
                    >
                      <CheckCircle2 size={14} />
                      <span>Complete & Payout</span>
                    </button>
                  </div>
                )}

                {status === 'active' && (
                  <button
                    onClick={() => handleCompleteTour(pkg)}
                    style={{
                      width: '100%',
                      backgroundColor: '#ecfdf5',
                      color: '#047857',
                      border: '1px solid #a7f3d0',
                      borderRadius: '10px',
                      padding: '8px',
                      fontSize: '12px',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                    }}
                  >
                    <DollarSign size={14} />
                    <span>Mark Completed & Credit Wallet</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Create New Yatra Package Modal ──────────────────────────────── */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.65)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            width: '100%',
            maxWidth: '430px',
            borderTopLeftRadius: '28px',
            borderTopRightRadius: '28px',
            maxHeight: '88vh',
            overflowY: 'auto',
            padding: '22px 20px 30px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                  Publish New Yatra Tour 🛕
                </h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  Create and launch pilgrimage tour package
                </span>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} color="#64748b" />
              </button>
            </div>

            <form onSubmit={handleCreatePackage} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                  Assigned Bus / Coach
                </label>
                <select
                  value={newTour.busId}
                  onChange={(e) => setNewTour({ ...newTour, busId: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '11px',
                    borderRadius: '10px',
                    border: '1.5px solid #e2e8f0',
                    fontSize: '13px',
                    marginTop: '4px',
                    backgroundColor: '#ffffff',
                    fontWeight: 600,
                  }}
                  required
                >
                  {buses.length > 0 ? (
                    buses.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.busNumber || b.registrationNumber} • {b.busName || 'AC Sleeper'} ({b.totalSeats} seats)
                      </option>
                    ))
                  ) : (
                    <option value="6a94801a81b7ce23c04f40a4">MP02TY7477 • ETR BUS AC Sleeper</option>
                  )}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                  Tour Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Somnath & Dwarka Holy Corridor"
                  value={newTour.title}
                  onChange={(e) => setNewTour({ ...newTour, title: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '11px',
                    borderRadius: '10px',
                    border: '1.5px solid #e2e8f0',
                    fontSize: '13px',
                    marginTop: '4px',
                    boxSizing: 'border-box',
                  }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                    Destination City
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dwarka"
                    value={newTour.destinationCity}
                    onChange={(e) => setNewTour({ ...newTour, destinationCity: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '11px',
                      borderRadius: '10px',
                      border: '1.5px solid #e2e8f0',
                      fontSize: '13px',
                      marginTop: '4px',
                      boxSizing: 'border-box',
                    }}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                    Departure City
                  </label>
                  <input
                    type="text"
                    value={newTour.departureCity}
                    onChange={(e) => setNewTour({ ...newTour, departureCity: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '11px',
                      borderRadius: '10px',
                      border: '1.5px solid #e2e8f0',
                      fontSize: '13px',
                      marginTop: '4px',
                      boxSizing: 'border-box',
                    }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={newTour.startDate}
                    onChange={(e) => setNewTour({ ...newTour, startDate: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '11px',
                      borderRadius: '10px',
                      border: '1.5px solid #e2e8f0',
                      fontSize: '13px',
                      marginTop: '4px',
                      boxSizing: 'border-box',
                    }}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                    End Date
                  </label>
                  <input
                    type="date"
                    value={newTour.endDate}
                    onChange={(e) => setNewTour({ ...newTour, endDate: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '11px',
                      borderRadius: '10px',
                      border: '1.5px solid #e2e8f0',
                      fontSize: '13px',
                      marginTop: '4px',
                      boxSizing: 'border-box',
                    }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                    Price / Pilgrim (₹)
                  </label>
                  <input
                    type="number"
                    value={newTour.pricePerPerson}
                    onChange={(e) => setNewTour({ ...newTour, pricePerPerson: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '11px',
                      borderRadius: '10px',
                      border: '1.5px solid #e2e8f0',
                      fontSize: '13px',
                      marginTop: '4px',
                      boxSizing: 'border-box',
                    }}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                    Total Seats
                  </label>
                  <input
                    type="number"
                    value={newTour.totalSeats}
                    onChange={(e) => setNewTour({ ...newTour, totalSeats: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '11px',
                      borderRadius: '10px',
                      border: '1.5px solid #e2e8f0',
                      fontSize: '13px',
                      marginTop: '4px',
                      boxSizing: 'border-box',
                    }}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                style={{
                  marginTop: '10px',
                  backgroundColor: '#4f46e5',
                  color: '#ffffff',
                  padding: '14px',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: 800,
                  cursor: actionLoading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(79, 70, 229, 0.35)',
                }}
              >
                {actionLoading ? 'Publishing Tour...' : 'Publish Yatra Tour Package'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Pilgrim Manifest & Boarding Check-in Modal ───────────────────── */}
      {selectedManifestPkg && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.65)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            padding: '20px',
            width: '100%',
            maxWidth: '410px',
            maxHeight: '84vh',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                  Pilgrim Manifest & Boarding
                </h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  {selectedManifestPkg.title}
                </span>
              </div>
              <button
                onClick={() => setSelectedManifestPkg(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} color="#64748b" />
              </button>
            </div>

            {manifestLoading ? (
              <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
                Fetching confirmed pilgrim bookings...
              </div>
            ) : manifestBookings.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: '#64748b', backgroundColor: '#f8fafc', borderRadius: '14px' }}>
                <Users size={32} color="#cbd5e1" style={{ marginBottom: '8px' }} />
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b' }}>No Bookings Yet</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                  Seats will appear here as soon as pilgrims book online.
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {manifestBookings.map((b) => {
                  const feedback = manifestFeedback[b._id];
                  const isBoarded = b.isBoarded;

                  return (
                    <div
                      key={b._id}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '14px',
                        backgroundColor: '#f8fafc',
                        border: '1.5px solid #e2e8f0',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                            {b.customerId?.name || b.passengers?.[0]?.name || 'Pilgrim Family'}
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>
                            Phone: {b.customerId?.phone || '9876543210'} • {b.seatsBooked || b.passengers?.length || 1} Seat(s)
                          </div>
                        </div>

                        <span style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          backgroundColor: isBoarded ? '#ecfdf5' : '#fef3c7',
                          color: isBoarded ? '#059669' : '#d97706',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          textTransform: 'uppercase',
                        }}>
                          {isBoarded ? '✓ Boarded' : 'Pending Boarding'}
                        </span>
                      </div>

                      {/* Passengers details */}
                      <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', padding: '8px', fontSize: '11px', color: '#475569' }}>
                        {b.passengers?.map((p, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                            <span style={{ fontWeight: 700 }}>{p.name} ({p.gender}, {p.age}y)</span>
                            <span style={{ color: '#059669', fontWeight: 600 }}>{b.mealPreference || 'Pure Veg'}</span>
                          </div>
                        ))}
                      </div>

                      {/* OTP Verification Row */}
                      {!isBoarded ? (
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '4px' }}>
                          <input
                            type="text"
                            placeholder="6-digit OTP"
                            value={otpInputs[b._id] !== undefined ? otpInputs[b._id] : (b.boardingOtp || '')}
                            onChange={(e) => setOtpInputs({ ...otpInputs, [b._id]: e.target.value })}
                            style={{
                              width: '100px',
                              padding: '7px 8px',
                              borderRadius: '8px',
                              border: '1px solid #cbd5e1',
                              fontSize: '13px',
                              fontWeight: 800,
                              letterSpacing: '1px',
                              textAlign: 'center',
                            }}
                          />
                          <button
                            onClick={() => handleVerifyBoarding(b)}
                            disabled={actionLoading}
                            style={{
                              flex: 1,
                              backgroundColor: '#059669',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '8px 12px',
                              fontSize: '12px',
                              fontWeight: 800,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px',
                            }}
                          >
                            <ShieldCheck size={14} />
                            <span>Verify & Check-In</span>
                          </button>
                        </div>
                      ) : (
                        <div style={{ fontSize: '11px', color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Check size={14} />
                          <span>Boarded on {new Date(b.boardedAt || Date.now()).toLocaleTimeString()}</span>
                        </div>
                      )}

                      {feedback && (
                        <div style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color: feedback.type === 'success' ? '#059669' : '#dc2626',
                        }}>
                          {feedback.text}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <button
              onClick={() => setSelectedManifestPkg(null)}
              style={{
                marginTop: '6px',
                width: '100%',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '12px',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Close Manifest
            </button>
          </div>
        </div>
      )}

      {/* ── Live Tour GPS Control & Pilgrim Broadcast Modal ──────────────── */}
      {liveControlPkg && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.65)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            padding: '22px 20px',
            width: '100%',
            maxWidth: '410px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                  Live GPS & Pilgrim Broadcast 🛰️
                </h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  {liveControlPkg.title}
                </span>
              </div>
              <button
                onClick={() => setLiveControlPkg(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} color="#64748b" />
              </button>
            </div>

            <form onSubmit={handleBroadcastGPS} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                  Current Landmark / Milestone
                </label>
                <input
                  type="text"
                  placeholder="e.g. Crossing Dewas Bypass"
                  value={gpsData.currentCity}
                  onChange={(e) => setGpsData({ ...gpsData, currentCity: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '10px',
                    border: '1.5px solid #e2e8f0',
                    fontSize: '13px',
                    marginTop: '4px',
                    boxSizing: 'border-box',
                  }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                    Next Darshan / Halt
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mahakal Temple"
                    value={gpsData.nextStop}
                    onChange={(e) => setGpsData({ ...gpsData, nextStop: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '10px',
                      border: '1.5px solid #e2e8f0',
                      fontSize: '13px',
                      marginTop: '4px',
                      boxSizing: 'border-box',
                    }}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                    ETA / Time
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 35 mins"
                    value={gpsData.eta}
                    onChange={(e) => setGpsData({ ...gpsData, eta: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '10px',
                      border: '1.5px solid #e2e8f0',
                      fontSize: '13px',
                      marginTop: '4px',
                      boxSizing: 'border-box',
                    }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                  Tour Announcement to Pilgrims
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Pilgrims note: We halt at Highway Grand Dhaba for 30 mins Satvik breakfast."
                  value={gpsData.announcement}
                  onChange={(e) => setGpsData({ ...gpsData, announcement: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '10px',
                    border: '1.5px solid #e2e8f0',
                    fontSize: '13px',
                    marginTop: '4px',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                style={{
                  marginTop: '6px',
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  padding: '13px',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: 800,
                  cursor: actionLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <Send size={15} />
                <span>{actionLoading ? 'Broadcasting...' : 'Broadcast GPS & Announcement'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Tour Completed & Wallet Payout Modal ──────────────────────────── */}
      {payoutResult && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.65)',
          zIndex: 999999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            padding: '24px 20px',
            width: '100%',
            maxWidth: '380px',
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#ecfdf5',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '14px',
            }}>
              <CheckCircle2 size={36} color="#059669" />
            </div>

            <h3 style={{ fontSize: '19px', fontWeight: 900, color: '#0f172a', margin: '0 0 4px' }}>
              Tour Completed! 🎉
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 16px' }}>
              Revenue has been credited into your Bus Owner Wallet.
            </p>

            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '14px',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              marginBottom: '18px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: '#64748b' }}>Gross Pilgrim Revenue:</span>
                <span style={{ fontWeight: 800, color: '#0f172a' }}>₹{payoutResult.totalRevenue?.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: '#64748b' }}>Platform Fee (10%):</span>
                <span style={{ fontWeight: 800, color: '#dc2626' }}>- ₹{payoutResult.platformFee?.toLocaleString()}</span>
              </div>
              <div style={{ height: '1px', backgroundColor: '#e2e8f0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px' }}>
                <span style={{ fontWeight: 800, color: '#059669' }}>Net Owner Payout:</span>
                <span style={{ fontWeight: 900, color: '#059669' }}>₹{payoutResult.ownerPayout?.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setPayoutResult(null);
                navigate('/wallet');
              }}
              style={{
                width: '100%',
                backgroundColor: '#4f46e5',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '13px',
                fontSize: '14px',
                fontWeight: 800,
                cursor: 'pointer',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <Wallet size={16} />
              <span>Go to Wallet & Withdraw</span>
            </button>

            <button
              onClick={() => setPayoutResult(null)}
              style={{
                width: '100%',
                backgroundColor: '#f1f5f9',
                color: '#475569',
                border: 'none',
                borderRadius: '12px',
                padding: '10px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default OwnerYatraScreen;
