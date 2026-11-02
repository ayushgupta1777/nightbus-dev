// ==================== src/screens/customer/YatraListScreen.jsx (100% AUTHENTIC MOBILE APP REPLICA) ====================
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getYatraPackages } from '../../services/yatraService';
import { 
  Compass, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Star, 
  ArrowRight, 
  Search, 
  Filter, 
  Sparkles, 
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

const FILTERS = [
  { label: 'All', value: '' },
  { label: '🕌 Religious', value: 'religious' },
  { label: '⛰️ Adventure', value: 'adventure' },
  { label: '🏛️ Heritage', value: 'heritage' },
  { label: '🌴 Leisure', value: 'leisure' },
];

const DEFAULT_YATRAS = [
  {
    _id: 'yatra_01',
    title: 'Char Dham Deluxe Pilgrimage',
    category: 'religious',
    destinationCity: 'Badrinath & Kedarnath',
    departurePoint: { city: 'Haridwar', time: '06:00 AM' },
    startDate: '2026-11-10',
    endDate: '2026-11-20',
    pricePerPerson: 18999,
    totalSeats: 30,
    bookedSeats: 22,
    images: ['https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=600&auto=format&fit=crop&q=80'],
    highlights: ['VIP Darshan Assist', 'AC Sleeper Coach', 'Helicopter Option', 'Pure Veg Meals'],
    rating: 4.9,
    status: 'active',
  },
  {
    _id: 'yatra_02',
    title: 'Jyotirlinga Darshan Corridor',
    category: 'religious',
    destinationCity: 'Ujjain & Omkareshwar',
    departurePoint: { city: 'Indore', time: '07:30 AM' },
    startDate: '2026-11-15',
    endDate: '2026-11-19',
    pricePerPerson: 8999,
    totalSeats: 36,
    bookedSeats: 28,
    images: ['https://images.unsplash.com/photo-1609766857041-ed402ea8069a?w=600&auto=format&fit=crop&q=80'],
    highlights: ['Bhasma Aarti Access', 'Night Sleeper Berths', 'Temple Transfers', 'Jain Food Available'],
    rating: 4.8,
    status: 'active',
  },
  {
    _id: 'yatra_03',
    title: 'Pachmari Highland Nature Retreat',
    category: 'adventure',
    destinationCity: 'Pachmari Hill Station',
    departurePoint: { city: 'Bhopal', time: '05:30 AM' },
    startDate: '2026-11-22',
    endDate: '2026-11-25',
    pricePerPerson: 6499,
    totalSeats: 24,
    bookedSeats: 16,
    images: ['https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80'],
    highlights: ['Waterfall Trekking', 'Luxury Tent Stay', 'Bonfire & Stargazing', 'All Meals Included'],
    rating: 4.7,
    status: 'active',
  },
  {
    _id: 'yatra_04',
    title: 'Kashi Vishwanath & Ayodhya Ram Mandir Darshan',
    category: 'heritage',
    destinationCity: 'Varanasi & Ayodhya',
    departurePoint: { city: 'Jabalpur', time: '08:00 PM' },
    startDate: '2026-11-28',
    endDate: '2026-12-02',
    pricePerPerson: 11499,
    totalSeats: 40,
    bookedSeats: 35,
    images: ['https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=600&auto=format&fit=crop&q=80'],
    highlights: ['Ganga Aarti Boat Cruise', 'Ram Mandir VIP Pass', 'AC Volvo Sleeper', 'Guide Assist'],
    rating: 4.9,
    status: 'active',
  },
];

const YatraListScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [packages, setPackages] = useState(DEFAULT_YATRAS);
  const [filtered, setFiltered] = useState(DEFAULT_YATRAS);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadPackages();
  }, []);

  useEffect(() => {
    let list = [...packages];
    if (activeFilter) {
      list = list.filter((p) => p.category === activeFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.destinationCity?.toLowerCase().includes(q) ||
          p.departurePoint?.city?.toLowerCase().includes(q)
      );
    }
    setFiltered(list);
  }, [packages, activeFilter, search]);

  const loadPackages = async () => {
    setLoading(true);
    try {
      const res = await getYatraPackages();
      if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
        setPackages(res.data);
      }
    } catch (e) {
      console.warn('Using seeded yatra tours:', e);
    } finally {
      setLoading(false);
    }
  };

  const getDuration = (start, end) => {
    if (!start || !end) return 'Multi-Day';
    const diff = Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24)) + 1;
    return `${diff} Days / ${diff - 1} Nights`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#f9fafb', minHeight: '100%' }}>
      {/* ── Native Purple Header ────────────────────────────────────────── */}
      <div style={{
        backgroundColor: '#4f46e5',
        padding: '22px 18px 24px',
        color: '#ffffff',
        borderBottomLeftRadius: '26px',
        borderBottomRightRadius: '26px',
        boxShadow: '0 4px 15px rgba(79, 70, 229, 0.25)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => navigate('/')}
              style={{
                width: '36px',
                height: '36px',
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
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: 900, margin: 0 }}>
                Yatra & Pilgrimage Tours 🛕
              </h1>
              <p style={{ fontSize: '12px', color: '#c7d2fe', margin: '2px 0 0' }}>
                Curated spiritual journeys with overnight berths & VIP darshan
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar Input */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          padding: '8px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        }}>
          <Search size={16} color="#6366f1" />
          <input
            type="text"
            placeholder="Search shrine, destination or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              width: '100%',
              fontSize: '13px',
              fontWeight: 600,
              color: '#0f172a',
              background: 'transparent',
            }}
          />
        </div>
      </div>

      {/* ── Category Filters Row ────────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        gap: '8px',
        padding: '14px 16px 8px',
        overflowX: 'auto',
        scrollbarWidth: 'none',
      }}>
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setActiveFilter(f.value)}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 800,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeFilter === f.value ? '#4f46e5' : '#ffffff',
              color: activeFilter === f.value ? '#ffffff' : '#64748b',
              boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ── Yatra Packages List ─────────────────────────────────────────── */}
      <div style={{ padding: '10px 16px 100px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filtered.length === 0 ? (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            padding: '30px 20px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}>
            <Compass size={40} color="#cbd5e1" style={{ margin: '0 auto 10px' }} />
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>No Tours Found</div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              Try searching with another destination keyword.
            </div>
          </div>
        ) : (
          filtered.map((item) => {
            const seatsLeft = item.totalSeats - (item.bookedSeats || 0);
            const isFull = seatsLeft <= 0;
            const heroImage = item.images?.[0] || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80';

            return (
              <div
                key={item._id}
                onClick={() => navigate(`/yatra/${item._id}`)}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
                  cursor: 'pointer',
                  border: '1px solid #f1f5f9',
                  transition: 'transform 0.15s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                {/* Image Banner */}
                <div style={{ position: 'relative', height: '150px', width: '100%', overflow: 'hidden' }}>
                  <img
                    src={heroImage}
                    alt={item.title}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80';
                    }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.7) 100%)',
                  }} />

                  {/* Badges on Hero */}
                  <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '6px' }}>
                    <span style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      color: '#4f46e5',
                      padding: '3px 8px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: 800,
                      textTransform: 'capitalize',
                    }}>
                      {item.category === 'religious' ? '🕌 Religious' : item.category === 'adventure' ? '⛰️ Adventure' : '✨ Tour'}
                    </span>
                  </div>

                  <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                    <span style={{
                      backgroundColor: isFull ? '#ef4444' : '#10b981',
                      color: '#ffffff',
                      padding: '3px 8px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: 800,
                    }}>
                      {isFull ? 'Full' : `${seatsLeft} Berths Left`}
                    </span>
                  </div>

                  {/* Title overlay */}
                  <div style={{ position: 'absolute', bottom: '12px', left: '14px', right: '14px' }}>
                    <div style={{ color: '#ffffff', fontSize: '16px', fontWeight: 900, lineHeight: 1.2 }}>
                      {item.title}
                    </div>
                    <div style={{ color: '#c7d2fe', fontSize: '12px', fontWeight: 600, marginTop: '2px' }}>
                      {item.destinationCity} • {getDuration(item.startDate, item.endDate)}
                    </div>
                  </div>
                </div>

                {/* Card Content Body */}
                <div style={{ padding: '14px 16px' }}>
                  {/* Schedule Details */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingBottom: '10px',
                    borderBottom: '1px solid #f1f5f9',
                    fontSize: '12px',
                    color: '#64748b',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={14} color="#6366f1" />
                      <span style={{ fontWeight: 700, color: '#334155' }}>
                        {item.startDate} → {item.endDate}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={13} color="#f59e0b" />
                      <span style={{ fontWeight: 600 }}>From {item.departurePoint?.city}</span>
                    </div>
                  </div>

                  {/* Highlights Chips */}
                  {item.highlights && item.highlights.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '10px 0 12px' }}>
                      {item.highlights.slice(0, 3).map((h, i) => (
                        <span
                          key={i}
                          style={{
                            backgroundColor: '#f1f5f9',
                            color: '#475569',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 700,
                          }}
                        >
                          ✓ {h}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Pricing and Action Button */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4px' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>
                        All-Inclusive Per Pilgrim
                      </span>
                      <div style={{ fontSize: '18px', fontWeight: 900, color: '#059669' }}>
                        ₹{item.pricePerPerson?.toLocaleString()}
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/yatra/${item._id}`);
                      }}
                      style={{
                        backgroundColor: '#4f46e5',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '10px 18px',
                        fontSize: '13px',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(79, 70, 229, 0.3)',
                      }}
                    >
                      <span>View & Book</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default YatraListScreen;
