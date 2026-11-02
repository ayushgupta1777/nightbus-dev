// ==================== src/screens/customer/MyBookingsScreen.jsx (100% AUTHENTIC MOBILE APP REPLICA) ====================
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setBookings } from '../../store/slices/bookingSlice';
import { getUserBookings, cancelBooking } from '../../services/bookingService';
import { getMyYatraBookings } from '../../services/yatraService';
import { 
  Bus, 
  MapPin, 
  Calendar, 
  Clock, 
  QrCode, 
  Radio, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  X,
  ChevronRight,
  Ticket,
  Users,
  Compass,
  FileText,
  Navigation,
  Bell,
  KeyRound,
  Utensils,
  Gauge,
  RefreshCw
} from 'lucide-react';

/**
 * Robust trip datetime parser for intercity sleeper schedules
 */
const parseTripDateTime = (dateVal, timeVal = '21:30') => {
  if (!dateVal) return null;
  if (dateVal instanceof Date && !isNaN(dateVal.getTime())) return dateVal;
  
  if (typeof dateVal === 'string' && dateVal.includes('T')) {
    const d = new Date(dateVal);
    if (!isNaN(d.getTime())) return d;
  }

  const cleanDate = String(dateVal).replace(/ at /i, ' ').trim();
  
  let d = new Date(`${cleanDate} ${timeVal}`);
  if (!isNaN(d.getTime())) return d;
  
  d = new Date(cleanDate);
  if (!isNaN(d.getTime())) return d;

  const norm = cleanDate.replace(/Sept/i, 'Sep');
  d = new Date(`${norm} ${timeVal}`);
  if (!isNaN(d.getTime())) return d;
  d = new Date(norm);
  if (!isNaN(d.getTime())) return d;

  const parts = cleanDate.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (parts) {
    const [_, day, month, year] = parts;
    const [hh, mm] = (timeVal || '21:30').split(':');
    return new Date(Number(year), Number(month) - 1, Number(day), Number(hh) || 0, Number(mm) || 0);
  }

  return null;
};

/**
 * Universal Normalizer to handle both Backend MongoDB Journey Documents
 * (with populated segments) and Local Redux / Client Bookings.
 * Automatically resolves past trips to 'completed' if journey date/time has passed.
 */
const normalizeBusBooking = (b) => {
  if (!b) return null;

  // 1. PNR / Pass ID
  let pnr = b.pnr || b.bookingRef || b.ticketNumber;
  if (!pnr && b._id) {
    pnr = `NB${b._id.toString().slice(-8).toUpperCase()}`;
  }
  if (!pnr) {
    pnr = 'NB' + Math.floor(10000000 + Math.random() * 90000000);
  }

  // 2. Segments handling (MongoDB Journey model stores stops & seats in segments)
  const segments = Array.isArray(b.segments) && b.segments.length > 0 ? b.segments : null;
  const firstSeg = segments ? segments[0] : null;
  const lastSeg = segments ? segments[segments.length - 1] : null;

  // 3. Origin & Destination
  const from = b.from || firstSeg?.fromStop?.name || 'Bhopal';
  const to = b.to || lastSeg?.toStop?.name || 'Indore';

  // 4. Bus Operator Name & Registration Number
  const busName = b.busName || firstSeg?.busId?.operatorName || firstSeg?.busId?.busName || b.bus?.operatorName || 'Night Bus Royal Star';
  const busNumber = b.busNumber || firstSeg?.busId?.registrationNumber || firstSeg?.busId?.chassisNumber || b.bus?.busNumber || 'MP-04-NB-1122';

  // 5. Travel Date & Time
  let rawDate = b.travelDate || firstSeg?.travelDate || b.bookingDate || b.createdAt;
  const departureTime = b.departureTime || firstSeg?.departureTime || b.bus?.departureTime || '21:30';
  let travelDate = '26 Oct 2026';
  
  const tripDateTime = parseTripDateTime(rawDate, departureTime);
  if (tripDateTime && !isNaN(tripDateTime.getTime())) {
    travelDate = tripDateTime.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } else if (typeof rawDate === 'string' && rawDate.trim()) {
    travelDate = rawDate;
  }

  // 6. Seats / Berths
  let seats = [];
  if (Array.isArray(b.seats) && b.seats.length > 0) {
    seats = b.seats.map((s) => (typeof s === 'object' ? s.number || s.label || 'Berth' : String(s)));
  } else if (segments) {
    seats = segments.map((s) => s.seatNumber || (typeof s === 'string' ? s : null)).filter(Boolean);
  }
  if (seats.length === 0) {
    seats = ['L6'];
  }

  // 7. Passengers
  let passengers = [];
  if (Array.isArray(b.passengers) && b.passengers.length > 0) {
    passengers = b.passengers;
  } else if (segments) {
    passengers = segments.map((s) => s.passengerDetails).filter(Boolean);
  }
  if (passengers.length === 0) {
    passengers = [{ name: 'Passenger', age: '28', gender: 'male' }];
  }

  // 8. Amount & Lifecycle Status
  const amount = b.amount || b.totalAmount || 944;
  const rawStatus = (b.status || 'confirmed').toLowerCase();

  // Automatic Lifecycle Resolution:
  // An intercity overnight sleeper journey completes within ~6 to 10 hours after departure.
  // If departure time + 6-hour buffer has passed, automatically mark as completed!
  const now = new Date();
  const journeyBufferMs = 6 * 60 * 60 * 1000;
  const isPastTrip = tripDateTime && (tripDateTime.getTime() + journeyBufferMs < now.getTime());

  let status = rawStatus;
  if (rawStatus !== 'cancelled') {
    if (rawStatus === 'completed' || isPastTrip) {
      status = 'completed';
    } else {
      status = 'confirmed';
    }
  }

  return {
    _id: b._id || pnr,
    pnr,
    from,
    to,
    busName,
    busNumber,
    travelDate,
    departureTime,
    seats,
    passengers,
    amount,
    status,
    isPastTrip,
    raw: b,
  };
};

const SEEDED_DEFAULT_BOOKINGS = [
  {
    _id: 'bk_demo_01',
    pnr: 'NB88492019',
    busName: 'Night Bus Royal Star',
    busNumber: 'MP-04-NB-1122',
    from: 'Katni',
    to: 'Jabalpur',
    travelDate: '26 Oct 2026',
    departureTime: '21:30',
    seats: ['L6'],
    passengers: [{ name: 'Rajesh Verma', age: '28', gender: 'male', seatNumber: 'L6' }],
    amount: 944,
    status: 'confirmed',
  },
  {
    _id: 'bk_demo_02',
    pnr: 'NB55129031',
    busName: 'Night Bus Gold Line',
    busNumber: 'MP-09-NB-5544',
    from: 'Bhopal',
    to: 'Indore',
    travelDate: '22 Oct 2026',
    departureTime: '22:00',
    seats: ['L1', 'L3'],
    passengers: [{ name: 'Rajesh Verma', age: '28', gender: 'male', seatNumber: 'L1' }],
    amount: 1888,
    status: 'completed',
  },
];

const SEEDED_DEFAULT_YATRA = [
  {
    _id: 'yt_demo_01',
    pnr: 'YT99214481',
    title: 'Char Dham Deluxe Pilgrimage',
    destinationCity: 'Badrinath & Kedarnath',
    startDate: '2026-11-10',
    endDate: '2026-11-20',
    pilgrimsCount: 2,
    amount: 37998,
    status: 'confirmed',
    departureCity: 'Haridwar',
  },
  {
    _id: 'yt_demo_02',
    pnr: 'YT44120938',
    title: 'Jyotirlinga Darshan Corridor',
    destinationCity: 'Ujjain & Omkareshwar',
    startDate: '2026-11-15',
    endDate: '2026-11-19',
    pilgrimsCount: 1,
    amount: 8999,
    status: 'completed',
    departureCity: 'Indore',
  },
];

const MyBookingsScreen = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const user = useSelector((state) => state.auth.user);
  const reduxBookings = useSelector((state) => state.booking.bookings) || [];

  const [activeTab, setActiveTab] = useState('bus'); // 'bus' or 'yatra'
  const [filter, setFilter] = useState('all'); // 'all', 'confirmed', 'completed', 'cancelled'
  const [rawBookings, setRawBookings] = useState([]);
  const [yatraBookings, setYatraBookings] = useState(SEEDED_DEFAULT_YATRA);
  const [loading, setLoading] = useState(false);
  const [selectedQRBooking, setSelectedQRBooking] = useState(null);
  const [liveTrackingTour, setLiveTrackingTour] = useState(null);

  useEffect(() => {
    loadAllBookings();
  }, [user]);

  const loadAllBookings = async () => {
    setLoading(true);
    const userId = user?._id || user?.id;

    // 1. Fetch Bus Bookings from backend
    if (userId) {
      try {
        const res = await getUserBookings(userId);
        if (res && res.bookings && Array.isArray(res.bookings) && res.bookings.length > 0) {
          setRawBookings(res.bookings);
          dispatch(setBookings(res.bookings));
        }
      } catch (e) {
        console.warn('Backend booking sync note:', e);
      }

      // 2. Fetch Yatra Bookings from backend
      try {
        const yRes = await getMyYatraBookings();
        if (yRes && yRes.success && Array.isArray(yRes.data) && yRes.data.length > 0) {
          setYatraBookings(yRes.data);
        }
      } catch (e) {}
    }

    setLoading(false);
  };

  // Combine and normalize bookings
  const combinedList = rawBookings.length > 0 
    ? rawBookings 
    : reduxBookings.length > 0 
    ? reduxBookings 
    : SEEDED_DEFAULT_BOOKINGS;

  const normalizedBusBookings = combinedList
    .map(normalizeBusBooking)
    .filter(Boolean);

  const filteredBus = normalizedBusBookings.filter((b) => {
    if (filter === 'all') return true;
    return b.status === filter;
  });

  const normalizedYatraBookings = yatraBookings.map((y) => {
    const rawStatus = (y.status || 'confirmed').toLowerCase();
    const end = parseTripDateTime(y.endDate || y.startDate);
    const isPast = end && end.getTime() < new Date().getTime();
    const status = rawStatus === 'cancelled' ? 'cancelled' : isPast ? 'completed' : rawStatus;
    return { ...y, status };
  });

  const filteredYatra = normalizedYatraBookings.filter((y) => {
    if (filter === 'all') return true;
    return y.status === filter;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#f1f5f9', minHeight: '100%' }}>
      {/* ── Native Purple Header (Matching Mobile Screen) ──────────────── */}
      <div style={{
        backgroundColor: '#4f46e5',
        padding: '22px 20px 26px',
        borderBottomLeftRadius: '26px',
        borderBottomRightRadius: '26px',
        color: '#ffffff',
        boxShadow: '0 4px 15px rgba(79, 70, 229, 0.25)',
      }}>
        <div style={{ fontSize: '20px', fontWeight: 900, letterSpacing: '-0.3px', marginBottom: '14px', lineHeight: 1.2 }}>
          My Bookings & Tickets
        </div>

        {/* Primary Type Toggle: Bus Bookings vs Yatra Tours */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          backgroundColor: 'rgba(255, 255, 255, 0.18)',
          borderRadius: '14px',
          padding: '4px',
          gap: '4px',
        }}>
          <button
            onClick={() => setActiveTab('bus')}
            style={{
              backgroundColor: activeTab === 'bus' ? '#ffffff' : 'transparent',
              color: activeTab === 'bus' ? '#4f46e5' : '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '8px 12px',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
          >
            <Bus size={15} />
            <span>Bus Bookings</span>
          </button>

          <button
            onClick={() => setActiveTab('yatra')}
            style={{
              backgroundColor: activeTab === 'yatra' ? '#ffffff' : 'transparent',
              color: activeTab === 'yatra' ? '#4f46e5' : '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '8px 12px',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
          >
            <Sparkles size={15} />
            <span>Yatra Tours</span>
          </button>
        </div>
      </div>

      {/* ── Filter Chips Row (Resilient Un-squashable Native Row) ───────── */}
      <div style={{
        display: 'flex',
        gap: '8px',
        padding: '14px 16px 6px',
        overflowX: 'auto',
        scrollbarWidth: 'none',
        flexShrink: 0,
        WebkitOverflowScrolling: 'touch',
      }}>
        {[
          { 
            id: 'all', 
            label: 'All', 
            icon: Ticket, 
            count: activeTab === 'bus' ? normalizedBusBookings.length : normalizedYatraBookings.length 
          },
          { 
            id: 'confirmed', 
            label: 'Confirmed', 
            icon: CheckCircle2, 
            count: activeTab === 'bus' 
              ? normalizedBusBookings.filter(b => b.status === 'confirmed').length 
              : normalizedYatraBookings.filter(y => y.status === 'confirmed').length 
          },
          { 
            id: 'completed', 
            label: 'Completed', 
            icon: Clock, 
            count: activeTab === 'bus' 
              ? normalizedBusBookings.filter(b => b.status === 'completed').length 
              : normalizedYatraBookings.filter(y => y.status === 'completed').length 
          },
          { 
            id: 'cancelled', 
            label: 'Cancelled', 
            icon: X, 
            count: activeTab === 'bus' 
              ? normalizedBusBookings.filter(b => b.status === 'cancelled').length 
              : normalizedYatraBookings.filter(y => y.status === 'cancelled').length 
          },
        ].map((tab) => {
          const isActive = filter === tab.id;
          const IconComponent = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                minHeight: '36px',
                height: '36px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 800,
                border: isActive ? '1.5px solid #4f46e5' : '1.5px solid #e2e8f0',
                cursor: 'pointer',
                backgroundColor: isActive ? '#4f46e5' : '#ffffff',
                color: isActive ? '#ffffff' : '#334155',
                boxShadow: isActive ? '0 3px 10px rgba(79, 70, 229, 0.25)' : '0 1px 3px rgba(0, 0, 0, 0.05)',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                transition: 'all 0.15s ease',
              }}
            >
              <IconComponent size={13} color={isActive ? '#ffffff' : '#64748b'} />
              <span>{tab.label}</span>
              <span style={{
                backgroundColor: isActive ? 'rgba(255, 255, 255, 0.25)' : '#f1f5f9',
                color: isActive ? '#ffffff' : '#64748b',
                padding: '1px 6px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: 800,
                marginLeft: '2px',
              }}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Bookings List ──────────────────────────────────────────────── */}
      <div style={{ padding: '10px 16px 100px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        
        {/* BUS BOOKINGS TAB */}
        {activeTab === 'bus' && (
          filteredBus.length === 0 ? (
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              padding: '36px 20px',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}>
              <Ticket size={42} color="#cbd5e1" style={{ margin: '0 auto 10px' }} />
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>No Bus Bookings Found</div>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 16px' }}>
                You have no {filter !== 'all' ? filter : ''} bus reservations.
              </p>
              <button
                onClick={() => navigate('/')}
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
                Search Overnight Buses
              </button>
            </div>
          ) : (
            filteredBus.map((booking) => (
              <div
                key={booking._id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '20px',
                  padding: '16px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  border: '1px solid #f1f5f9',
                }}
              >
                {/* Header: PNR + Status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>
                      PNR NUMBER
                    </span>
                    <div style={{ fontSize: '15px', fontWeight: 900, color: '#4f46e5' }}>
                      {booking.pnr}
                    </div>
                  </div>

                  <span style={{
                    backgroundColor: booking.status === 'confirmed' ? '#ecfdf5' : booking.status === 'completed' ? '#f1f5f9' : '#fef2f2',
                    color: booking.status === 'confirmed' ? '#059669' : booking.status === 'completed' ? '#475569' : '#dc2626',
                    border: booking.status === 'confirmed' ? '1px solid #a7f3d0' : booking.status === 'completed' ? '1px solid #cbd5e1' : '1px solid #fecaca',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}>
                    {booking.status === 'confirmed' && (
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                    )}
                    {booking.status === 'completed' && <CheckCircle2 size={12} color="#475569" />}
                    {booking.status === 'cancelled' && <span>✕</span>}
                    {booking.status}
                  </span>
                </div>

                {/* Route */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 0',
                  borderTop: '1px solid #f1f5f9',
                  borderBottom: '1px solid #f1f5f9',
                }}>
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
                    <Bus size={20} />
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '15px', fontWeight: 900, color: '#0f172a' }}>{booking.from}</span>
                      <span style={{ color: '#94a3b8', fontSize: '13px' }}>→</span>
                      <span style={{ fontSize: '15px', fontWeight: 900, color: '#0f172a' }}>{booking.to}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                      {booking.busName} • {booking.busNumber}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700 }}>FARE</div>
                    <div style={{ fontSize: '14px', fontWeight: 900, color: '#059669' }}>₹{booking.amount}</div>
                  </div>
                </div>

                {/* Schedule & Berths */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#475569', fontWeight: 600 }}>
                    <Calendar size={14} color="#6366f1" />
                    <span>{booking.travelDate} at {booking.departureTime}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>Berths:</span>
                    {booking.seats.map((s) => (
                      <span
                        key={s}
                        style={{
                          backgroundColor: '#e0e7ff',
                          color: '#4338ca',
                          padding: '2px 7px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 800,
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  {booking.status === 'confirmed' ? (
                    <>
                      <button
                        onClick={() => setSelectedQRBooking(booking)}
                        style={{
                          flex: 1,
                          backgroundColor: '#4f46e5',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '12px',
                          padding: '10px',
                          fontSize: '12px',
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)',
                        }}
                      >
                        <QrCode size={15} />
                        <span>QR Boarding Pass</span>
                      </button>

                      <button
                        onClick={() => navigate(`/live-tracking/${booking.pnr}`, { state: { booking } })}
                        style={{
                          backgroundColor: '#eef2ff',
                          color: '#4338ca',
                          border: 'none',
                          borderRadius: '12px',
                          padding: '10px 14px',
                          fontSize: '12px',
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '5px',
                          cursor: 'pointer',
                        }}
                      >
                        <Radio size={14} />
                        <span>Live Track</span>
                      </button>
                    </>
                  ) : booking.status === 'completed' ? (
                    <>
                      <button
                        onClick={() => setSelectedQRBooking(booking)}
                        style={{
                          flex: 1,
                          backgroundColor: '#f8fafc',
                          color: '#334155',
                          border: '1px solid #cbd5e1',
                          borderRadius: '12px',
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
                        <FileText size={15} color="#475569" />
                        <span>E-Ticket & Receipt</span>
                      </button>

                      <button
                        onClick={() => navigate(`/results?from=${booking.from}&to=${booking.to}`)}
                        style={{
                          backgroundColor: '#eef2ff',
                          color: '#4338ca',
                          border: 'none',
                          borderRadius: '12px',
                          padding: '10px 14px',
                          fontSize: '12px',
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '5px',
                          cursor: 'pointer',
                        }}
                      >
                        <RefreshCw size={14} />
                        <span>Book Again</span>
                      </button>
                    </>
                  ) : (
                    <div style={{
                      width: '100%',
                      backgroundColor: '#fef2f2',
                      border: '1px solid #fecaca',
                      borderRadius: '10px',
                      padding: '8px 12px',
                      fontSize: '11px',
                      color: '#991b1b',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}>
                      <span>Cancelled by Passenger • Refund Initiated</span>
                      <span style={{ fontWeight: 800 }}>₹{booking.amount}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )
        )}

        {/* YATRA TOURS TAB */}
        {activeTab === 'yatra' && (
          filteredYatra.length === 0 ? (
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              padding: '36px 20px',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}>
              <Sparkles size={42} color="#cbd5e1" style={{ margin: '0 auto 10px' }} />
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>No Pilgrimage Tours Booked</div>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 16px' }}>
                Explore spiritual corridor tours with VIP darshan and sleeper berths.
              </p>
              <button
                onClick={() => navigate('/yatra')}
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
                Explore Yatra Packages 🛕
              </button>
            </div>
          ) : (
            filteredYatra.map((yatra) => {
              const pnr = yatra.pnr || yatra.bookingRef || (yatra._id ? `YTR${yatra._id.toString().slice(-6).toUpperCase()}` : 'YT-PASS');
              const title = yatra.title || yatra.packageId?.title || 'Char Dham Pilgrimage';
              const city = yatra.destinationCity || yatra.packageId?.destinationCity || 'Holy Shrines';
              const fromCity = yatra.departureCity || yatra.packageId?.departurePoint?.city || 'Origin';
              const count = yatra.seatsBooked || yatra.pilgrimsCount || yatra.passengers?.length || 1;
              const amount = yatra.totalAmount || yatra.amount || 8999;
              const status = (yatra.status || 'confirmed').toLowerCase();
              const isBoarded = yatra.isBoarded || false;
              const boardingOtp = yatra.boardingOtp || (yatra._id ? yatra._id.toString().slice(-6) : '847291');
              const pkg = yatra.packageId || {};
              const tourStatus = (pkg.status || 'active').toLowerCase();
              const currentLocation = pkg.currentLocation || yatra.currentLocation || {
                currentCity: fromCity,
                nextStop: city,
                speed: 0,
                eta: 'Scheduled',
                lastUpdated: new Date()
              };
              const announcements = pkg.announcements || yatra.announcements || [];

              return (
                <div
                  key={yatra._id || pnr}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '20px',
                    padding: '16px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    border: '1px solid #f1f5f9',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>
                        YATRA PNR
                      </span>
                      <div style={{ fontSize: '15px', fontWeight: 900, color: '#4f46e5' }}>
                        {pnr}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {isBoarded ? (
                        <span style={{
                          backgroundColor: '#ecfdf5',
                          color: '#059669',
                          padding: '3px 8px',
                          borderRadius: '10px',
                          fontSize: '11px',
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <CheckCircle2 size={12} />
                          Boarded
                        </span>
                      ) : (
                        <span style={{
                          backgroundColor: '#fef3c7',
                          color: '#d97706',
                          padding: '3px 8px',
                          borderRadius: '10px',
                          fontSize: '11px',
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <KeyRound size={11} />
                          OTP: {boardingOtp}
                        </span>
                      )}

                      <span style={{
                        backgroundColor: tourStatus === 'in_progress' ? '#ecfdf5' : '#f1f5f9',
                        color: tourStatus === 'in_progress' ? '#059669' : '#475569',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                      }}>
                        {tourStatus === 'in_progress' ? '● In Progress' : status}
                      </span>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 0',
                    borderTop: '1px solid #f1f5f9',
                    borderBottom: '1px solid #f1f5f9',
                  }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '12px',
                      backgroundColor: '#fef3c7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#d97706',
                    }}>
                      <Sparkles size={20} />
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '15px', fontWeight: 900, color: '#0f172a' }}>
                        {title}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                        {city} • {count} Pilgrim{count > 1 ? 's' : ''} ({yatra.mealPreference ? yatra.mealPreference.toUpperCase() : 'SATVIK VEG'})
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700 }}>TOTAL</div>
                      <div style={{ fontSize: '14px', fontWeight: 900, color: '#059669' }}>₹{amount.toLocaleString()}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#475569', fontWeight: 600 }}>
                      <Calendar size={14} color="#6366f1" />
                      <span>{yatra.startDate || '10 Nov 2026'} → {yatra.endDate || '20 Nov 2026'}</span>
                    </div>

                    <span style={{ fontSize: '11px', color: '#4f46e5', fontWeight: 800 }}>
                      ✓ Satvik Meals Included
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    <button
                      onClick={() => setSelectedQRBooking({
                        pnr,
                        busName: title,
                        busNumber: pkg.busId?.busNumber || 'YATRA-COACH',
                        from: fromCity,
                        to: city,
                        seats: [`${count} Pilgrims (${yatra.mealPreference || 'Satvik Veg'})`],
                        amount,
                        boardingOtp,
                        isBoarded,
                        isYatra: true,
                      })}
                      style={{
                        flex: 1,
                        backgroundColor: '#4f46e5',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '12px',
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
                      <QrCode size={15} />
                      <span>Pass & OTP</span>
                    </button>

                    <button
                      onClick={() => setLiveTrackingTour({
                        pnr,
                        title,
                        fromCity,
                        city,
                        tourStatus,
                        currentLocation,
                        announcements,
                        boardingOtp,
                        isBoarded,
                        count,
                        mealPreference: yatra.mealPreference || 'Satvik Veg',
                        busNumber: pkg.busId?.busNumber || 'YATRA-COACH',
                        packageId: pkg._id || yatra.packageId,
                      })}
                      style={{
                        flex: 1,
                        backgroundColor: '#0f172a',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '12px',
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
                      <Radio size={14} color="#10b981" />
                      <span>Live GPS & Chat</span>
                    </button>

                    <button
                      onClick={() => navigate('/yatra')}
                      style={{
                        backgroundColor: '#f1f5f9',
                        color: '#475569',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '10px 12px',
                        fontSize: '12px',
                        fontWeight: 800,
                        cursor: 'pointer',
                      }}
                    >
                      Details
                    </button>
                  </div>
                </div>
              );
            })
          )
        )}

      </div>

      {/* ── QR Code Boarding Pass Modal ──────────────────────────────────── */}
      {selectedQRBooking && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.65)',
          zIndex: 999999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            padding: '24px',
            width: '100%',
            maxWidth: '360px',
            textAlign: 'center',
            position: 'relative',
          }}>
            <button
              onClick={() => setSelectedQRBooking(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
              }}
            >
              <X size={20} color="#0f172a" />
            </button>

            <div style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', marginBottom: '4px' }}>
              Digital Boarding Pass
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '18px' }}>
              Show this QR code to bus conductor upon boarding
            </div>

            {/* High Quality Rendered QR */}
            <div style={{
              padding: '16px',
              backgroundColor: '#f8fafc',
              borderRadius: '20px',
              display: 'inline-block',
              border: '2px dashed #cbd5e1',
              marginBottom: '16px',
            }}>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(selectedQRBooking.isYatra ? `YATRA:${selectedQRBooking.pnr}|OTP:${selectedQRBooking.boardingOtp || ''}|SEATS:${selectedQRBooking.seats?.join(',')}` : `TICKET:${selectedQRBooking.pnr}|ROUTE:${selectedQRBooking.from}-${selectedQRBooking.to}|SEATS:${selectedQRBooking.seats?.join(',')}`)}`}
                alt="Boarding QR"
                style={{ width: '180px', height: '180px', display: 'block' }}
              />
            </div>

            {selectedQRBooking.boardingOtp && (
              <div style={{
                margin: '8px 0 16px',
                padding: '12px',
                backgroundColor: '#f8fafc',
                borderRadius: '16px',
                border: '1.5px dashed #cbd5e1',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Boarding Check-in OTP
                </div>
                <div style={{ fontSize: '26px', fontWeight: 900, color: '#4f46e5', letterSpacing: '4px', margin: '4px 0' }}>
                  {selectedQRBooking.boardingOtp}
                </div>
                <div style={{
                  display: 'inline-block',
                  padding: '3px 10px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 800,
                  backgroundColor: selectedQRBooking.isBoarded ? '#ecfdf5' : '#fef3c7',
                  color: selectedQRBooking.isBoarded ? '#059669' : '#d97706',
                  marginTop: '2px'
                }}>
                  {selectedQRBooking.isBoarded ? '✓ Boarded & Verified' : '⏳ Show OTP at Boarding Point'}
                </div>
              </div>
            )}

            <div style={{ fontSize: '15px', fontWeight: 900, color: '#4f46e5' }}>
              PNR: {selectedQRBooking.pnr}
            </div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
              {selectedQRBooking.from} → {selectedQRBooking.to}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
              Berths: {selectedQRBooking.seats?.join(', ')} • {selectedQRBooking.busName}
            </div>

            <button
              onClick={() => setSelectedQRBooking(null)}
              style={{
                marginTop: '20px',
                width: '100%',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                padding: '12px',
                borderRadius: '12px',
                border: 'none',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Close Pass
            </button>
          </div>
        </div>
      )}

      {/* ── Live Yatra Tour Tracking & Announcements Modal ─────────────────── */}
      {liveTrackingTour && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(8px)',
          zIndex: 999999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '480px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
            position: 'relative',
          }}>
            {/* Header */}
            <div style={{
              padding: '20px',
              backgroundColor: '#0f172a',
              color: '#ffffff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '3px 8px',
                    borderRadius: '12px',
                    fontSize: '10px',
                    fontWeight: 800,
                    backgroundColor: liveTrackingTour.tourStatus === 'in_progress' ? '#10b981' : '#f59e0b',
                    color: '#ffffff',
                    letterSpacing: '0.5px',
                  }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ffffff', display: 'inline-block' }} />
                    {liveTrackingTour.tourStatus === 'in_progress' ? 'LIVE ON ROUTE' : liveTrackingTour.tourStatus.toUpperCase()}
                  </span>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>PNR: {liveTrackingTour.pnr}</span>
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: 900, color: '#ffffff', margin: 0 }}>
                  {liveTrackingTour.title}
                </h3>
                <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '2px' }}>
                  {liveTrackingTour.fromCity} ➔ {liveTrackingTour.city} • Coach: {liveTrackingTour.busNumber}
                </div>
              </div>

              <button
                onClick={() => setLiveTrackingTour(null)}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#ffffff',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Body */}
            <div style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* GPS Telemetry Grid */}
              <div style={{
                background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)',
                borderRadius: '18px',
                padding: '16px',
                border: '1px solid #e2e8f0',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 800, color: '#4f46e5' }}>
                    <Navigation size={15} />
                    <span>Live GPS Telemetry</span>
                  </div>
                  <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>
                    Updated {liveTrackingTour.currentLocation?.lastUpdated ? new Date(liveTrackingTour.currentLocation.lastUpdated).toLocaleTimeString() : 'Just now'}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ backgroundColor: '#ffffff', padding: '10px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700 }}>CURRENT CITY / HALT</div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                      {liveTrackingTour.currentLocation?.currentCity || liveTrackingTour.fromCity}
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#ffffff', padding: '10px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700 }}>NEXT MILESTONE / TEMPLE</div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#4f46e5', marginTop: '2px' }}>
                      {liveTrackingTour.currentLocation?.nextStop || liveTrackingTour.city}
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#ffffff', padding: '10px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700 }}>SPEED</div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#10b981', marginTop: '2px' }}>
                      {liveTrackingTour.currentLocation?.speed || 0} km/h
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#ffffff', padding: '10px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700 }}>ESTIMATED ARRIVAL (ETA)</div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#d97706', marginTop: '2px' }}>
                      {liveTrackingTour.currentLocation?.eta || 'On Schedule'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Boarding OTP Quick Banner */}
              <div style={{
                backgroundColor: liveTrackingTour.isBoarded ? '#ecfdf5' : '#fffbeb',
                border: `1.5px solid ${liveTrackingTour.isBoarded ? '#a7f3d0' : '#fde68a'}`,
                borderRadius: '16px',
                padding: '14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: liveTrackingTour.isBoarded ? '#065f46' : '#92400e' }}>
                    {liveTrackingTour.isBoarded ? '✓ You Are Boarded & Verified' : 'Boarding Check-in OTP'}
                  </div>
                  <div style={{ fontSize: '12px', color: liveTrackingTour.isBoarded ? '#047857' : '#b45309', marginTop: '2px' }}>
                    {liveTrackingTour.count} Pilgrims • {liveTrackingTour.mealPreference}
                  </div>
                </div>

                {!liveTrackingTour.isBoarded && (
                  <div style={{
                    backgroundColor: '#ffffff',
                    padding: '6px 14px',
                    borderRadius: '10px',
                    border: '1px solid #f59e0b',
                    fontSize: '18px',
                    fontWeight: 900,
                    letterSpacing: '2px',
                    color: '#d97706',
                  }}>
                    {liveTrackingTour.boardingOtp}
                  </div>
                )}
              </div>

              {/* Tour Captain Announcements & Chat Feed */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                  <Bell size={16} color="#4f46e5" />
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                    Tour Captain Broadcasts & Announcements
                  </span>
                </div>

                {liveTrackingTour.announcements && liveTrackingTour.announcements.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '200px', overflowY: 'auto' }}>
                    {liveTrackingTour.announcements.map((ann, idx) => (
                      <div key={idx} style={{
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '14px',
                        padding: '12px',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 800, color: '#4f46e5' }}>
                            📢 {ann.senderName || 'Tour Captain'}
                          </span>
                          <span style={{ fontSize: '10px', color: '#94a3b8' }}>
                            {ann.createdAt ? new Date(ann.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today'}
                          </span>
                        </div>
                        <div style={{ fontSize: '13px', color: '#334155', lineHeight: '1.4' }}>
                          {ann.message}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{
                    textAlign: 'center',
                    padding: '24px 16px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '14px',
                    border: '1px dashed #cbd5e1',
                  }}>
                    <Radio size={22} color="#94a3b8" style={{ marginBottom: '6px' }} />
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>
                      No announcements posted yet
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                      Your Tour Captain will post meal breaks, temple timings, and darshan queue alerts here in real-time.
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Footer Actions */}
            <div style={{
              padding: '16px 20px',
              borderTop: '1px solid #f1f5f9',
              display: 'flex',
              gap: '10px',
              backgroundColor: '#ffffff',
            }}>
              <button
                onClick={() => {
                  setSelectedQRBooking({
                    pnr: liveTrackingTour.pnr,
                    busName: liveTrackingTour.title,
                    busNumber: liveTrackingTour.busNumber,
                    from: liveTrackingTour.fromCity,
                    to: liveTrackingTour.city,
                    seats: [`${liveTrackingTour.count} Pilgrims (${liveTrackingTour.mealPreference})`],
                    amount: 0,
                    boardingOtp: liveTrackingTour.boardingOtp,
                    isBoarded: liveTrackingTour.isBoarded,
                    isYatra: true,
                  });
                  setLiveTrackingTour(null);
                }}
                style={{
                  flex: 1,
                  backgroundColor: '#4f46e5',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px',
                  fontSize: '13px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                }}
              >
                <QrCode size={16} />
                <span>Show QR Pass & OTP</span>
              </button>

              <button
                onClick={loadAllBookings}
                style={{
                  backgroundColor: '#f1f5f9',
                  color: '#0f172a',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  fontSize: '13px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                }}
              >
                <RefreshCw size={15} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookingsScreen;
