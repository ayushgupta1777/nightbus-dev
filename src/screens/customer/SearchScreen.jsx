// ==================== src/screens/customer/SearchScreen.jsx (100% AUTHENTIC MOBILE APP REPLICA) ====================
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setSearchCriteria } from '../../store/slices/journeySlice';
import api from '../../services/api';
import { 
  ArrowLeft, 
  MapPin, 
  ArrowUpDown, 
  Calendar, 
  Search, 
  Clock, 
  X, 
  Bus, 
  Navigation, 
  Users, 
  Mic, 
  Check, 
  Plus, 
  Minus,
  Sparkles
} from 'lucide-react';

const POPULAR_ROUTES = [
  { from: 'Bhopal', to: 'Indore' },
  { from: 'Indore', to: 'Jabalpur' },
  { from: 'Rewa', to: 'Bhopal' },
  { from: 'Jabalpur', to: 'Indore' },
  { from: 'Indore', to: 'Ujjain' },
];

const SearchScreen = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Form State
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [sourceStop, setSourceStop] = useState(null);
  const [destStop, setDestStop] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [passengers, setPassengers] = useState(1);

  // Suggestions State
  const [sourceSuggestions, setSourceSuggestions] = useState([]);
  const [destSuggestions, setDestSuggestions] = useState([]);
  const [showSourceSuggestions, setShowSourceSuggestions] = useState(false);
  const [showDestSuggestions, setShowDestSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Modals
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPassengerPicker, setShowPassengerPicker] = useState(false);

  // Recent Searches
  const [recentSearches, setRecentSearches] = useState([]);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    loadRecentSearches();
  }, []);

  const loadRecentSearches = () => {
    try {
      const searches = localStorage.getItem('recentSearches');
      if (searches) {
        setRecentSearches(JSON.parse(searches).slice(0, 5));
      }
    } catch (e) {
      console.warn('Error loading recent searches:', e);
    }
  };

  const saveToRecent = (searchData) => {
    try {
      let searches = [...recentSearches];
      searches = searches.filter(
        (s) => !(s.from === searchData.from && s.to === searchData.to)
      );
      searches.unshift({
        from: searchData.from,
        to: searchData.to,
        date: searchData.date,
        passengers: searchData.passengers,
        timestamp: Date.now(),
      });
      searches = searches.slice(0, 8);
      localStorage.setItem('recentSearches', JSON.stringify(searches));
      setRecentSearches(searches.slice(0, 5));
    } catch (e) {
      console.warn('Error saving recent search:', e);
    }
  };

  const clearRecentSearches = () => {
    localStorage.removeItem('recentSearches');
    setRecentSearches([]);
  };

  // Live Location Suggestions Fetching (Debounced)
  const fetchLocationSuggestions = (query, type) => {
    if (!query || query.trim().length < 1) {
      if (type === 'source') {
        setSourceSuggestions([]);
        setShowSourceSuggestions(false);
      } else {
        setDestSuggestions([]);
        setShowDestSuggestions(false);
      }
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setLoadingSuggestions(true);
      try {
        const response = await api.get('/locations/search', {
          params: { query: query.trim(), limit: 10 },
        });

        let locations = [];
        if (response && response.success && Array.isArray(response.locations)) {
          locations = response.locations;
        } else if (response && Array.isArray(response.locations)) {
          locations = response.locations;
        } else if (Array.isArray(response)) {
          locations = response;
        }

        if (type === 'source') {
          setSourceSuggestions(locations);
          setShowSourceSuggestions(locations.length > 0);
        } else {
          setDestSuggestions(locations);
          setShowDestSuggestions(locations.length > 0);
        }
      } catch (error) {
        console.warn('Location search error:', error);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 150);
  };

  const handleSourceChange = (text) => {
    setSource(text);
    fetchLocationSuggestions(text, 'source');
  };

  const handleDestinationChange = (text) => {
    setDestination(text);
    fetchLocationSuggestions(text, 'destination');
  };

  const handleSourceSelect = (location) => {
    setSource(location.name);
    const actualStopId = location.isBusStop ? location.id : (location.nearestStop?.id || location.id);
    setSourceStop(actualStopId);
    setSourceSuggestions([]);
    setShowSourceSuggestions(false);
  };

  const handleDestSelect = (location) => {
    setDestination(location.name);
    const actualStopId = location.isBusStop ? location.id : (location.nearestStop?.id || location.id);
    setDestStop(actualStopId);
    setDestSuggestions([]);
    setShowDestSuggestions(false);
  };

  const handleSwap = () => {
    const tempSrc = source;
    const tempSrcStop = sourceStop;
    setSource(destination);
    setSourceStop(destStop);
    setDestination(tempSrc);
    setDestStop(tempSrcStop);

    const tempSuggestions = sourceSuggestions;
    setSourceSuggestions(destSuggestions);
    setDestSuggestions(tempSuggestions);
  };

  // Generate 30 date options matching mobile date picker
  const generateDateOptions = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
      const monthName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()];

      let label = '';
      if (i === 0) label = 'Today';
      else if (i === 1) label = 'Tomorrow';
      else label = `${dayName}, ${d.getDate()} ${monthName}`;

      dates.push({ date: dateStr, label, day: d.getDate(), month: monthName, weekday: dayName });
    }
    return dates;
  };

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return 'Select Date';
    const today = new Date().toISOString().split('T')[0];
    const tm = new Date();
    tm.setDate(tm.getDate() + 1);
    const tomorrow = tm.toISOString().split('T')[0];

    if (dateStr === today) return 'Today';
    if (dateStr === tomorrow) return 'Tomorrow';

    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
    } catch {
      return dateStr;
    }
  };

  const handleSearch = () => {
    if (!source.trim()) {
      alert('Please enter departure location');
      return;
    }
    if (!destination.trim()) {
      alert('Please enter destination location');
      return;
    }
    if (source.trim().toLowerCase() === destination.trim().toLowerCase()) {
      alert('Departure and destination cannot be the same');
      return;
    }

    const searchData = {
      from: source.trim(),
      to: destination.trim(),
      stopIdFrom: sourceStop,
      stopIdTo: destStop,
      date: selectedDate,
      passengers,
    };

    dispatch(setSearchCriteria(searchData));
    saveToRecent(searchData);
    navigate(`/results?from=${encodeURIComponent(source.trim())}&to=${encodeURIComponent(destination.trim())}&date=${selectedDate}`);
  };

  const handleRecentClick = (search) => {
    setSource(search.from);
    setDestination(search.to);
    setSelectedDate(search.date || selectedDate);
    setPassengers(search.passengers || 1);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#f1f5f9', minHeight: '100%' }}>
      {/* ── Native Purple Header (Exact match with mobile SearchScreen.js) ── */}
      <div style={{
        backgroundColor: '#4f46e5',
        padding: '12px 18px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        color: '#ffffff',
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            width: '40px',
            height: '40px',
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
          <ArrowLeft size={22} />
        </button>

        <span style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.3px' }}>
          Find Buses
        </span>

        <div style={{ width: '40px' }} />
      </div>

      {/* ── Elevated Search Card ─────────────────────────────────────────── */}
      <div style={{
        backgroundColor: '#ffffff',
        margin: '-12px 16px 16px',
        padding: '20px',
        borderRadius: '24px',
        boxShadow: '0 8px 24px rgba(79, 70, 229, 0.14)',
        position: 'relative',
        zIndex: (showSourceSuggestions || showDestSuggestions) ? 9999 : 1,
      }}>

        {/* FROM Input */}
        <div style={{ position: 'relative', zIndex: showSourceSuggestions ? 99999 : 1 }}>
          <label style={{
            fontSize: '11px',
            fontWeight: 800,
            color: '#6366f1',
            marginBottom: '8px',
            display: 'block',
            letterSpacing: '1px',
            textTransform: 'uppercase',
          }}>
            FROM
          </label>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            border: showSourceSuggestions ? '1.5px solid #6366f1' : '1.5px solid #e0e7ff',
            borderRadius: '14px',
            padding: '12px 14px',
            backgroundColor: '#fafafa',
            gap: '10px',
            transition: 'border-color 0.2s',
          }}>
            <MapPin size={20} color="#6366f1" />
            <input
              type="text"
              placeholder="Enter city or stop"
              value={source}
              onChange={(e) => handleSourceChange(e.target.value)}
              onFocus={() => {
                if (source.trim().length >= 1) fetchLocationSuggestions(source, 'source');
              }}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                background: 'none',
                fontSize: '16px',
                fontWeight: 600,
                color: '#111827',
              }}
            />
            {source && (
              <button
                type="button"
                onClick={() => { setSource(''); setSourceSuggestions([]); setShowSourceSuggestions(false); }}
                style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '2px' }}
              >
                <X size={18} />
              </button>
            )}
            <div style={{ color: '#9ca3af', padding: '2px' }}>
              <Mic size={18} />
            </div>
          </div>

          {/* Source Suggestions Dropdown */}
          {showSourceSuggestions && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              backgroundColor: '#ffffff',
              border: '1.5px solid #6366f1',
              borderTop: 'none',
              borderBottomLeftRadius: '16px',
              borderBottomRightRadius: '16px',
              marginTop: '-2px',
              maxHeight: '260px',
              overflowY: 'auto',
              boxShadow: '0 10px 24px rgba(79, 70, 229, 0.25)',
              zIndex: 999999,
            }}>
              {loadingSuggestions ? (
                <div style={{ padding: '16px', textAlign: 'center', color: '#6366f1', fontSize: '13px', fontWeight: 600 }}>
                  Searching stops & cities...
                </div>
              ) : sourceSuggestions.length > 0 ? (
                sourceSuggestions.map((item, idx) => (
                  <div
                    key={`source-${item.id || idx}`}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSourceSelect(item);
                    }}
                    onClick={() => handleSourceSelect(item)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px 14px',
                      borderBottom: '1px solid #f3f4f6',
                      cursor: 'pointer',
                      gap: '12px',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                  >
                    {item.isBusStop ? <Bus size={18} color="#6366f1" /> : <Navigation size={18} color="#6366f1" />}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>{item.name}</span>
                        <span style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: '8px',
                          backgroundColor: item.isBusStop ? '#eef2ff' : '#e5e7eb',
                          color: item.isBusStop ? '#6366f1' : '#4b5563',
                          textTransform: 'uppercase',
                        }}>
                          {item.isBusStop ? 'Bus Stop' : 'City'}
                        </span>
                      </div>
                      {item.state && (
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>{item.state}</div>
                      )}
                      {!item.isBusStop && item.nearestStop && (
                        <div style={{ fontSize: '11px', color: '#6366f1', marginTop: '2px', fontWeight: 600 }}>
                          Nearest stop: {item.nearestStop.name}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '16px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
                  No matching locations found
                </div>
              )}
            </div>
          )}
        </div>

        {/* Central Swap Button */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          margin: '10px 0',
          position: 'relative',
          zIndex: showSourceSuggestions ? 0 : 1,
        }}>
          <button
            type="button"
            onClick={handleSwap}
            style={{
              backgroundColor: '#eef2ff',
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6366f1',
              boxShadow: '0 3px 8px rgba(99, 102, 241, 0.15)',
              cursor: 'pointer',
              transition: 'transform 0.2s',
            }}
          >
            <ArrowUpDown size={20} />
          </button>
        </div>

        {/* TO Input */}
        <div style={{ position: 'relative', zIndex: showDestSuggestions ? 99999 : 1 }}>
          <label style={{
            fontSize: '11px',
            fontWeight: 800,
            color: '#6366f1',
            marginBottom: '8px',
            display: 'block',
            letterSpacing: '1px',
            textTransform: 'uppercase',
          }}>
            TO
          </label>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            border: showDestSuggestions ? '1.5px solid #ef4444' : '1.5px solid #e0e7ff',
            borderRadius: '14px',
            padding: '12px 14px',
            backgroundColor: '#fafafa',
            gap: '10px',
            transition: 'border-color 0.2s',
          }}>
            <MapPin size={20} color="#ef4444" />
            <input
              type="text"
              placeholder="Enter destination city or stop"
              value={destination}
              onChange={(e) => handleDestinationChange(e.target.value)}
              onFocus={() => {
                if (destination.trim().length >= 1) fetchLocationSuggestions(destination, 'destination');
              }}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                background: 'none',
                fontSize: '16px',
                fontWeight: 600,
                color: '#111827',
              }}
            />
            {destination && (
              <button
                type="button"
                onClick={() => { setDestination(''); setDestSuggestions([]); setShowDestSuggestions(false); }}
                style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '2px' }}
              >
                <X size={18} />
              </button>
            )}
            <div style={{ color: '#9ca3af', padding: '2px' }}>
              <Mic size={18} />
            </div>
          </div>

          {/* Destination Suggestions Dropdown */}
          {showDestSuggestions && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              backgroundColor: '#ffffff',
              border: '1.5px solid #ef4444',
              borderTop: 'none',
              borderBottomLeftRadius: '16px',
              borderBottomRightRadius: '16px',
              marginTop: '-2px',
              maxHeight: '260px',
              overflowY: 'auto',
              boxShadow: '0 10px 24px rgba(239, 68, 68, 0.25)',
              zIndex: 999999,
            }}>
              {loadingSuggestions ? (
                <div style={{ padding: '16px', textAlign: 'center', color: '#ef4444', fontSize: '13px', fontWeight: 600 }}>
                  Searching destination stops & cities...
                </div>
              ) : destSuggestions.length > 0 ? (
                destSuggestions.map((item, idx) => (
                  <div
                    key={`dest-${item.id || idx}`}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleDestSelect(item);
                    }}
                    onClick={() => handleDestSelect(item)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px 14px',
                      borderBottom: '1px solid #f3f4f6',
                      cursor: 'pointer',
                      gap: '12px',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                  >
                    {item.isBusStop ? <Bus size={18} color="#ef4444" /> : <Navigation size={18} color="#ef4444" />}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>{item.name}</span>
                        <span style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: '8px',
                          backgroundColor: item.isBusStop ? '#fee2e2' : '#e5e7eb',
                          color: item.isBusStop ? '#ef4444' : '#4b5563',
                          textTransform: 'uppercase',
                        }}>
                          {item.isBusStop ? 'Bus Stop' : 'City'}
                        </span>
                      </div>
                      {item.state && (
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>{item.state}</div>
                      )}
                      {!item.isBusStop && item.nearestStop && (
                        <div style={{ fontSize: '11px', color: '#ef4444', marginTop: '2px', fontWeight: 600 }}>
                          Nearest stop: {item.nearestStop.name}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '16px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                  No matching locations found
                </div>
              )}
            </div>
          )}
        </div>

        {/* Date & Passengers Row */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '16px', marginBottom: '20px' }}>
          {/* Date Picker Button */}
          <button
            type="button"
            onClick={() => setShowDatePicker(true)}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              border: '1.5px solid #e0e7ff',
              borderRadius: '14px',
              padding: '12px',
              backgroundColor: '#fafafa',
              cursor: 'pointer',
              textAlign: 'left',
              gap: '8px',
            }}
          >
            <Calendar size={18} color="#6366f1" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '10px', fontWeight: 800, color: '#6366f1', textTransform: 'uppercase' }}>
                TRAVEL DATE
              </div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827', marginTop: '2px' }}>
                {formatDisplayDate(selectedDate)}
              </div>
            </div>
          </button>

          {/* Passengers Picker Button */}
          <button
            type="button"
            onClick={() => setShowPassengerPicker(true)}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              border: '1.5px solid #e0e7ff',
              borderRadius: '14px',
              padding: '12px',
              backgroundColor: '#fafafa',
              cursor: 'pointer',
              textAlign: 'left',
              gap: '8px',
            }}
          >
            <Users size={18} color="#6366f1" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '10px', fontWeight: 800, color: '#6366f1', textTransform: 'uppercase' }}>
                PASSENGERS
              </div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827', marginTop: '2px' }}>
                {passengers} {passengers === 1 ? 'Person' : 'People'}
              </div>
            </div>
          </button>
        </div>

        {/* Big Search Buses Button */}
        <button
          type="button"
          onClick={handleSearch}
          style={{
            width: '100%',
            backgroundColor: '#4f46e5',
            color: '#ffffff',
            padding: '16px',
            borderRadius: '16px',
            border: 'none',
            fontSize: '17px',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.35)',
          }}
        >
          <Search size={20} />
          <span>Search Buses</span>
        </button>
      </div>

      {/* ── Recent Searches ─────────────────────────────────────────────── */}
      {recentSearches.length > 0 && (
        <div style={{ padding: '0 16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6b7280', fontSize: '14px', fontWeight: 700 }}>
              <Clock size={16} />
              <span>Recent Searches</span>
            </div>
            <button
              onClick={clearRecentSearches}
              style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
            >
              Clear All
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recentSearches.map((search, idx) => (
              <div
                key={`recent-${idx}`}
                onClick={() => handleRecentClick(search)}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '14px',
                  padding: '12px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '4px', backgroundColor: '#6366f1' }} />
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>{search.from}</span>
                  <span style={{ color: '#9ca3af', fontSize: '12px' }}>→</span>
                  <div style={{ width: '8px', height: '8px', borderRadius: '4px', backgroundColor: '#ef4444' }} />
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>{search.to}</span>
                </div>
                <span style={{ fontSize: '11px', color: '#6b7280', fontWeight: 600 }}>
                  {formatDisplayDate(search.date)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Popular Routes ─────────────────────────────────────────────── */}
      <div style={{ padding: '0 16px 30px' }}>
        <div style={{ fontSize: '14px', fontWeight: 800, color: '#374151', marginBottom: '10px' }}>
          Popular Routes in MP
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {POPULAR_ROUTES.map((route, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSource(route.from);
                setDestination(route.to);
                setShowSourceSuggestions(false);
                setShowDestSuggestions(false);
              }}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '20px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 700,
                color: '#4f46e5',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>{route.from}</span>
              <span style={{ color: '#94a3af' }}>→</span>
              <span>{route.to}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Date Picker Modal ──────────────────────────────────────────── */}
      {showDatePicker && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 999999,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            width: '100%',
            maxWidth: '430px',
            borderTopLeftRadius: '24px',
            borderTopRightRadius: '24px',
            padding: '20px',
            maxHeight: '75vh',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '17px', fontWeight: 800, color: '#111827' }}>Select Travel Date</span>
              <button
                onClick={() => setShowDatePicker(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} color="#111827" />
              </button>
            </div>

            <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingBottom: '16px' }}>
              {generateDateOptions().map((opt, idx) => {
                const isSelected = selectedDate === opt.date;
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedDate(opt.date);
                      setShowDatePicker(false);
                    }}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      backgroundColor: isSelected ? '#eef2ff' : '#f8fafc',
                      border: isSelected ? '1.5px solid #6366f1' : '1px solid #f1f5f9',
                      cursor: 'pointer',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: isSelected ? '#4f46e5' : '#111827' }}>
                        {opt.label}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        {opt.date}
                      </div>
                    </div>
                    {isSelected && <Check size={18} color="#6366f1" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Passenger Picker Modal ─────────────────────────────────────── */}
      {showPassengerPicker && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 999999,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            width: '100%',
            maxWidth: '430px',
            borderTopLeftRadius: '24px',
            borderTopRightRadius: '24px',
            padding: '20px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <span style={{ fontSize: '17px', fontWeight: 800, color: '#111827' }}>Select Passengers</span>
              <button
                onClick={() => setShowPassengerPicker(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} color="#111827" />
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '16px' }}>
              <button
                disabled={passengers <= 1}
                onClick={() => setPassengers(Math.max(1, passengers - 1))}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: passengers <= 1 ? '#e2e8f0' : '#ffffff',
                  border: '1px solid #cbd5e1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: passengers <= 1 ? 'not-allowed' : 'pointer',
                  color: passengers <= 1 ? '#94a3b8' : '#1e293b',
                }}
              >
                <Minus size={20} />
              </button>

              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 900, color: '#111827' }}>{passengers}</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>{passengers === 1 ? 'Passenger' : 'Passengers'}</div>
              </div>

              <button
                disabled={passengers >= 6}
                onClick={() => setPassengers(Math.min(6, passengers + 1))}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: passengers >= 6 ? '#e2e8f0' : '#ffffff',
                  border: '1px solid #cbd5e1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: passengers >= 6 ? 'not-allowed' : 'pointer',
                  color: passengers >= 6 ? '#94a3b8' : '#1e293b',
                }}
              >
                <Plus size={20} />
              </button>
            </div>

            <div style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'center', margin: '14px 0 20px' }}>
              Maximum 6 passengers allowed per booking
            </div>

            <button
              onClick={() => setShowPassengerPicker(false)}
              style={{
                width: '100%',
                backgroundColor: '#4f46e5',
                color: '#ffffff',
                padding: '14px',
                borderRadius: '14px',
                border: 'none',
                fontSize: '16px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchScreen;
