// ==================== src/screens/customer/HomeScreen.jsx (WORLD-CLASS REACT NATIVE MOBILE REPLICA) ====================
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setSearchCriteria } from '../../store/slices/journeySlice';
import { getHomeContent } from '../../services/journeyService';
import api from '../../services/api';
import { BASE_URL } from '../../config';
import { 
  Bus, 
  MapPin, 
  Search, 
  Bell, 
  Wallet, 
  Sparkles, 
  ArrowRight, 
  ArrowUpDown, 
  Clock, 
  X, 
  Navigation, 
  Radio, 
  QrCode, 
  MessageSquare, 
  HelpCircle, 
  Calendar,
  ChevronRight,
  CheckCircle2,
  ShieldCheck,
  Award,
  Zap,
  Coffee,
  Ticket
} from 'lucide-react';

const FALLBACK_DESTINATIONS = [
  {
    id: 'ujjain',
    name: 'Ujjain Mahakal',
    fare: '₹450',
    image: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=600&auto=format&fit=crop&q=80',
    tag: 'Jyotirlinga',
  },
  {
    id: 'omkareshwar',
    name: 'Omkareshwar',
    fare: '₹399',
    image: 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?w=600&auto=format&fit=crop&q=80',
    tag: 'Island Shrine',
  },
  {
    id: 'pachmarhi',
    name: 'Pachmarhi',
    fare: '₹699',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
    tag: 'Hill Station',
  },
  {
    id: 'rupnath',
    name: 'Rupnath Dham',
    fare: '₹350',
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80',
    tag: 'Pilgrimage',
  },
  {
    id: 'amarkantak',
    name: 'Amarkantak',
    fare: '₹799',
    image: 'https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?w=600&auto=format&fit=crop&q=80',
    tag: 'Narmada Origin',
  },
];

const DEFAULT_BANNERS = [
  {
    _id: 'b1',
    title: 'Char Dham Special Yatra',
    subtitle: 'Flat 20% OFF on all Sleeper Coach Bookings',
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1000&auto=format&fit=crop&q=80',
    link: '/yatra',
  },
  {
    _id: 'b2',
    title: 'Ujjain & Omkareshwar Circuit',
    subtitle: 'Weekend Luxury Sleeper Tour with Guided Darshan',
    image: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=1000&auto=format&fit=crop&q=80',
    link: '/yatra',
  },
];

const getImageUrl = (path) => {
  if (!path) return null;
  if (path.includes('/uploads/')) {
    const idx = path.indexOf('/uploads/');
    return path.slice(idx);
  }
  if (path.startsWith('uploads/')) {
    return '/' + path;
  }
  if (path.startsWith('http')) return path;
  return path.startsWith('/') ? path : '/' + path;
};

const HomeScreen = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const searchCriteria = useSelector((state) => state.journey.searchCriteria) || {};

  // Search states for hero bus search card
  const [fromCity, setFromCity] = useState(searchCriteria.from || 'Katni');
  const [toCity, setToCity] = useState(searchCriteria.to || 'Rupnath');
  const [travelDate, setTravelDate] = useState(
    searchCriteria.date || new Date().toISOString().split('T')[0]
  );

  // Suggestions state
  const [sourceSuggestions, setSourceSuggestions] = useState([]);
  const [destSuggestions, setDestSuggestions] = useState([]);
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const searchDebounceRef = useRef(null);

  // Dashboard state
  const [walletBalance, setWalletBalance] = useState(1000);
  const [activeBookings, setActiveBookings] = useState([]);
  const [locationName, setLocationName] = useState('Indore, MP');

  // Home Content from live Hostinger backend
  const [banners, setBanners] = useState(DEFAULT_BANNERS);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  // Toast notification
  const [toastMessage, setToastMessage] = useState('');

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  useEffect(() => {
    loadHomeData();
    loadWalletBalance();
    loadActiveBookings();
  }, []);

  // Auto-slide banners
  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [banners.length]);

  const loadHomeData = async () => {
    try {
      const res = await getHomeContent();
      if (res && res.success && res.data && res.data.banners && res.data.banners.length > 0) {
        setBanners(res.data.banners);
      }
    } catch (e) {
      console.warn('Home content fetch fallback:', e);
    }
  };

  const loadWalletBalance = async () => {
    try {
      const res = await api.get('/wallet');
      const bal = res?.data?.wallet?.balance ?? res?.wallet?.balance ?? res?.balance ?? 1000;
      setWalletBalance(bal);
    } catch {
      setWalletBalance(1000);
    }
  };

  const loadActiveBookings = async () => {
    try {
      const userId = user?._id || user?.id;
      if (userId) {
        const res = await api.get(`/bookings/user/${userId}`, {
          params: { status: 'confirmed,boarded' },
        });
        const list = res?.data?.bookings || res?.bookings || [];
        setActiveBookings(list.slice(0, 1));
      }
    } catch {
      setActiveBookings([]);
    }
  };

  // Live Location Suggestions API
  const fetchLocationSuggestions = (query, type) => {
    if (!query || query.trim().length < 1) {
      if (type === 'source') {
        setSourceSuggestions([]);
        setShowSourceDropdown(false);
      } else {
        setDestSuggestions([]);
        setShowDestDropdown(false);
      }
      return;
    }

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    searchDebounceRef.current = setTimeout(async () => {
      setLoadingSuggestions(true);
      try {
        const response = await api.get('/locations/search', {
          params: { query: query.trim() },
        });
        if (response && response.success && response.locations) {
          if (type === 'source') {
            setSourceSuggestions(response.locations);
            setShowSourceDropdown(true);
          } else {
            setDestSuggestions(response.locations);
            setShowDestDropdown(true);
          }
        }
      } catch (err) {
        console.warn('Location suggestion lookup error:', err);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 250);
  };

  const handleSourceChange = (val) => {
    setFromCity(val);
    fetchLocationSuggestions(val, 'source');
  };

  const handleDestChange = (val) => {
    setToCity(val);
    fetchLocationSuggestions(val, 'destination');
  };

  const handleSelectSource = (loc) => {
    setFromCity(loc.name);
    setShowSourceDropdown(false);
  };

  const handleSelectDest = (loc) => {
    setToCity(loc.name);
    setShowDestDropdown(false);
  };

  const handleSwapCities = () => {
    const temp = fromCity;
    setFromCity(toCity);
    setToCity(temp);
  };

  const handleQuickDate = (daysFromToday) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromToday);
    setTravelDate(d.toISOString().split('T')[0]);
  };

  const handleSearchBuses = () => {
    if (!fromCity.trim() || !toCity.trim()) {
      showToast('Please enter both origin and destination cities');
      return;
    }

    dispatch(
      setSearchCriteria({
        from: fromCity.trim(),
        to: toCity.trim(),
        date: travelDate,
        passengers: 1,
      })
    );

    navigate(`/results?from=${encodeURIComponent(fromCity.trim())}&to=${encodeURIComponent(toCity.trim())}&date=${travelDate}`);
  };

  const firstName = user?.name ? user.name.split(' ')[0] : 'Traveler';

  const quickServices = [
    {
      id: 'yatra',
      icon: Sparkles,
      label: 'Yatra Pilgrimages',
      sub: 'Temple & shrine packages',
      color: '#8b5cf6',
      bg: '#f5f3ff',
      onClick: () => navigate('/yatra'),
    },
    {
      id: 'rentals',
      icon: Bus,
      label: 'Bus Charter',
      sub: 'Weddings & group tours',
      color: '#6366f1',
      bg: '#eef2ff',
      onClick: () => navigate('/rentals'),
    },
    {
      id: 'tracking',
      icon: Radio,
      label: 'Live Tracking',
      sub: 'Real-time satellite GPS',
      color: '#0ea5e9',
      bg: '#f0f9ff',
      onClick: () => navigate('/my-bookings'),
    },
    {
      id: 'tickets',
      icon: Ticket,
      label: 'My Bookings',
      sub: 'E-tickets & manifests',
      color: '#10b981',
      bg: '#ecfdf5',
      onClick: () => navigate('/my-bookings'),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc', minHeight: '100%' }}>
      {/* ── Toast Notification ────────────────────────────────────────────── */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '56px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#0f172a',
          color: '#ffffff',
          padding: '10px 18px',
          borderRadius: '24px',
          fontSize: '13px',
          fontWeight: 600,
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <CheckCircle2 size={16} color="#10b981" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ─── Hero Gradient Header ────────────────────────────────────────── */}
      <div style={{
        position: 'relative',
        background: 'linear-gradient(135deg, #3730a3 0%, #4f46e5 50%, #6366f1 100%)',
        padding: '16px 16px 36px',
        borderBottomLeftRadius: '28px',
        borderBottomRightRadius: '28px',
        boxShadow: '0 10px 25px rgba(79, 70, 229, 0.25)',
      }}>
        {/* Brand Row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
            }}>
              <Bus size={18} />
            </div>
            <span style={{ fontSize: '17px', fontWeight: 900, color: '#ffffff', letterSpacing: '0.8px' }}>
              NIGHT BUS
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Location Chip */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: 'rgba(255, 255, 255, 0.18)',
              padding: '4px 10px',
              borderRadius: '20px',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: 700,
            }}>
              <MapPin size={12} color="#ffffff" />
              <span>{locationName}</span>
            </div>

            {/* Notification Bell */}
            <button
              onClick={() => navigate('/profile')}
              style={{
                position: 'relative',
                background: 'rgba(255, 255, 255, 0.15)',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                cursor: 'pointer',
              }}
            >
              <Bell size={16} />
              <div style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                backgroundColor: '#ef4444',
                color: '#ffffff',
                fontSize: '9px',
                fontWeight: 800,
                borderRadius: '8px',
                minWidth: '15px',
                height: '15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                2
              </div>
            </button>
          </div>
        </div>

        {/* Greeting & Wallet Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#c7d2fe', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {getGreeting()} 👋
            </div>
            <div style={{ fontSize: '20px', fontWeight: 900, color: '#ffffff', lineHeight: 1.2 }}>
              {firstName}
            </div>
            <div style={{ fontSize: '12px', color: '#e0e7ff', marginTop: '2px' }}>
              Where are you traveling tonight?
            </div>
          </div>

          {/* Wallet Balance Pill */}
          <button
            onClick={() => navigate('/wallet')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              padding: '6px 12px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
            }}
          >
            <Wallet size={14} color="#4f46e5" />
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#4f46e5' }}>
              ₹{walletBalance.toLocaleString()}
            </span>
          </button>
        </div>

        {/* ─── HERO BUS SEARCH CARD (Front and Center) ────────────────────── */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 12px 28px rgba(0, 0, 0, 0.15)',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          position: 'relative',
        }}>
          {/* Card Header Title */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Bus size={16} color="#6366f1" />
              <span>Book Intercity Sleeper Bus</span>
            </span>
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '2px 7px', borderRadius: '6px' }}>
              Instant Confirm
            </span>
          </div>

          {/* FROM Input */}
          <div style={{ position: 'relative', zIndex: showSourceDropdown ? 90 : 2 }}>
            <div style={{
              background: '#f8fafc',
              border: showSourceDropdown ? '1.5px solid #6366f1' : '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}>
              <MapPin size={18} color="#6366f1" />
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '10px', color: '#6366f1', fontWeight: 800, display: 'block', textTransform: 'uppercase' }}>
                  FROM
                </span>
                <input
                  type="text"
                  value={fromCity}
                  onChange={(e) => handleSourceChange(e.target.value)}
                  onFocus={() => {
                    if (fromCity.trim().length >= 1) fetchLocationSuggestions(fromCity, 'source');
                  }}
                  placeholder="Departure city (e.g. Katni)..."
                  style={{
                    background: 'none',
                    border: 'none',
                    outline: 'none',
                    fontSize: '15px',
                    fontWeight: 700,
                    color: '#0f172a',
                    width: '100%',
                  }}
                />
              </div>
              {fromCity && (
                <button
                  type="button"
                  onClick={() => { setFromCity(''); setSourceSuggestions([]); setShowSourceDropdown(false); }}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Source Suggestions Dropdown */}
            {showSourceDropdown && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: '4px',
                background: '#ffffff',
                borderRadius: '12px',
                boxShadow: '0 12px 28px rgba(0,0,0,0.18)',
                border: '1.5px solid #6366f1',
                maxHeight: '200px',
                overflowY: 'auto',
                zIndex: 999,
              }}>
                {loadingSuggestions ? (
                  <div style={{ padding: '12px', textAlign: 'center', color: '#6366f1', fontSize: '12px' }}>
                    Searching cities...
                  </div>
                ) : sourceSuggestions.length > 0 ? (
                  sourceSuggestions.map((loc) => (
                    <div
                      key={loc.id || loc.name}
                      onClick={() => handleSelectSource(loc)}
                      style={{ padding: '10px 12px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#0f172a' }}
                    >
                      {loc.name} {loc.state ? `(${loc.state})` : ''}
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '12px', textAlign: 'center', color: '#94a3b8', fontSize: '12px' }}>
                    No matching cities
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Swap Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '-14px 16px -14px auto', zIndex: 5 }}>
            <button
              type="button"
              onClick={handleSwapCities}
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: '#6366f1',
                border: '2px solid #ffffff',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(99, 102, 241, 0.4)',
              }}
              title="Swap From and To"
            >
              <ArrowUpDown size={14} />
            </button>
          </div>

          {/* TO Input */}
          <div style={{ position: 'relative', zIndex: showDestDropdown ? 90 : 1 }}>
            <div style={{
              background: '#f8fafc',
              border: showDestDropdown ? '1.5px solid #ef4444' : '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}>
              <MapPin size={18} color="#ef4444" />
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '10px', color: '#ef4444', fontWeight: 800, display: 'block', textTransform: 'uppercase' }}>
                  TO
                </span>
                <input
                  type="text"
                  value={toCity}
                  onChange={(e) => handleDestChange(e.target.value)}
                  onFocus={() => {
                    if (toCity.trim().length >= 1) fetchLocationSuggestions(toCity, 'destination');
                  }}
                  placeholder="Destination city (e.g. Rupnath)..."
                  style={{
                    background: 'none',
                    border: 'none',
                    outline: 'none',
                    fontSize: '15px',
                    fontWeight: 700,
                    color: '#0f172a',
                    width: '100%',
                  }}
                />
              </div>
              {toCity && (
                <button
                  type="button"
                  onClick={() => { setToCity(''); setDestSuggestions([]); setShowDestDropdown(false); }}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Destination Suggestions Dropdown */}
            {showDestDropdown && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: '4px',
                background: '#ffffff',
                borderRadius: '12px',
                boxShadow: '0 12px 28px rgba(0,0,0,0.18)',
                border: '1.5px solid #ef4444',
                maxHeight: '200px',
                overflowY: 'auto',
                zIndex: 999,
              }}>
                {loadingSuggestions ? (
                  <div style={{ padding: '12px', textAlign: 'center', color: '#ef4444', fontSize: '12px' }}>
                    Searching cities...
                  </div>
                ) : destSuggestions.length > 0 ? (
                  destSuggestions.map((loc) => (
                    <div
                      key={loc.id || loc.name}
                      onClick={() => handleSelectDest(loc)}
                      style={{ padding: '10px 12px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#0f172a' }}
                    >
                      {loc.name} {loc.state ? `(${loc.state})` : ''}
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '12px', textAlign: 'center', color: '#94a3b8', fontSize: '12px' }}>
                    No matching cities
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Date Selector Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              flex: 1,
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '6px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <Calendar size={15} color="#6366f1" />
              <input
                type="date"
                value={travelDate}
                onChange={(e) => setTravelDate(e.target.value)}
                style={{
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#0f172a',
                  width: '100%',
                }}
              />
            </div>

            <button
              type="button"
              onClick={() => handleQuickDate(0)}
              style={{
                background: '#f1f5f9',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '8px 10px',
                fontSize: '11px',
                fontWeight: 700,
                color: '#334155',
                cursor: 'pointer',
              }}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => handleQuickDate(1)}
              style={{
                background: '#f1f5f9',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '8px 10px',
                fontSize: '11px',
                fontWeight: 700,
                color: '#334155',
                cursor: 'pointer',
              }}
            >
              Tomorrow
            </button>
          </div>

          {/* SEARCH BUSES CTA BUTTON */}
          <button
            type="button"
            onClick={handleSearchBuses}
            style={{
              background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '14px',
              fontSize: '15px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
              transition: 'transform 0.15s ease',
            }}
          >
            <span>SEARCH BUSES</span>
            <ArrowRight size={18} />
          </button>

          {/* Popular Fast Corridors */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', paddingTop: '2px' }}>
            <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Popular:</span>
            {[
              { from: 'Katni', to: 'Rupnath' },
              { from: 'Bhopal', to: 'Indore' },
              { from: 'Indore', to: 'Jabalpur' },
            ].map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setFromCity(p.from);
                  setToCity(p.to);
                }}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '14px',
                  padding: '3px 8px',
                  fontSize: '11px',
                  color: '#475569',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                }}
              >
                {p.from} ➔ {p.to}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Scrollable Body Content ──────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '16px 16px 80px' }}>

        {/* Active Booking Banner */}
        {activeBookings.length > 0 && (
          <div style={{
            background: '#ecfdf5',
            borderRadius: '14px',
            padding: '12px 14px',
            border: '1px solid #a7f3d0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
              <div>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#065f46', display: 'block' }}>
                  Upcoming Trip: {activeBookings[0].from} → {activeBookings[0].to}
                </span>
                <span style={{ fontSize: '10px', color: '#047857' }}>
                  PNR: {activeBookings[0].pnr || 'NB88492019'}
                </span>
              </div>
            </div>
            <button
              onClick={() => navigate('/my-bookings')}
              style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
            >
              View Ticket
            </button>
          </div>
        )}

        {/* ── Quick Services Grid ─────────────────────────────────────────── */}
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 10px' }}>
            Quick Services
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px' }}>
            {quickServices.map((srv) => {
              const IconComp = srv.icon;
              return (
                <div
                  key={srv.id}
                  onClick={srv.onClick}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    padding: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    border: '1px solid #f1f5f9',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                    cursor: 'pointer',
                    minWidth: 0,
                    overflow: 'hidden'
                  }}
                >
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    backgroundColor: srv.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <IconComp size={20} color={srv.color} />
                  </div>
                  <div style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
                    <div style={{ 
                      fontSize: '12px', 
                      fontWeight: 800, 
                      color: '#0f172a', 
                      whiteSpace: 'nowrap', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis' 
                    }}>
                      {srv.label}
                    </div>
                    <div style={{ 
                      fontSize: '10px', 
                      color: '#64748b', 
                      marginTop: '1px', 
                      whiteSpace: 'nowrap', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis' 
                    }}>
                      {srv.sub}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Yatra Pilgrimage Slider ─────────────────────────────────────── */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Special Yatra Tours
            </h2>
            <button
              onClick={() => navigate('/yatra')}
              style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
            >
              See All →
            </button>
          </div>

          <div style={{
            position: 'relative',
            borderRadius: '18px',
            overflow: 'hidden',
            height: '170px',
            boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
          }}>
            <img
              src={banners[currentBannerIndex]?.image || DEFAULT_BANNERS[0].image}
              alt="Yatra Tour"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => { e.currentTarget.src = DEFAULT_BANNERS[0].image; }}
            />
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.85) 100%)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              padding: '16px',
            }}>
              <span style={{ fontSize: '16px', fontWeight: 900, color: '#ffffff' }}>
                {banners[currentBannerIndex]?.title || 'Char Dham Pilgrimage'}
              </span>
              <span style={{ fontSize: '12px', color: '#e2e8f0', marginTop: '2px' }}>
                {banners[currentBannerIndex]?.subtitle || 'Sleeper coach tour with VIP temple darshan'}
              </span>
              <button
                onClick={() => navigate('/yatra')}
                style={{
                  alignSelf: 'flex-start',
                  marginTop: '10px',
                  background: '#6366f1',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '20px',
                  padding: '6px 14px',
                  fontSize: '11px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Book Package
              </button>
            </div>
          </div>
        </div>

        {/* ── Popular Destinations ────────────────────────────────────────── */}
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 10px' }}>
            Top Destinations
          </h2>
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            overflowX: 'auto', 
            paddingBottom: '8px',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}>
            {FALLBACK_DESTINATIONS.map((dest) => (
              <div
                key={dest.id}
                onClick={() => {
                  setToCity(dest.name.split(' ')[0]);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  showToast(`Selected destination: ${dest.name}`);
                }}
                style={{
                  flexShrink: 0,
                  width: '130px',
                  background: '#ffffff',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  border: '1px solid #f1f5f9',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  cursor: 'pointer',
                }}
              >
                <div style={{ height: '80px', width: '100%', overflow: 'hidden' }}>
                  <img
                    src={dest.image}
                    alt={dest.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ padding: '8px 10px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {dest.name}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                    <span style={{ fontSize: '10px', color: '#64748b' }}>From</span>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#10b981' }}>{dest.fare}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Passenger Trust & Safety Badges ─────────────────────────────── */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '14px',
          border: '1px solid #e2e8f0',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          marginBottom: '24px', /* Ensure safe distance from bottom navigation bar */
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={20} color="#10b981" />
            <div>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a' }}>Verified Fleets</div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>RTO & KYC Certified</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={20} color="#6366f1" />
            <div>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a' }}>98% On-Time</div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>GPS Monitored</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HomeScreen;
