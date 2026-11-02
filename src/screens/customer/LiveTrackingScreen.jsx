// ==================== src/screens/customer/LiveTrackingScreen.jsx ====================
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  ArrowLeft, 
  Radio, 
  Navigation, 
  UtensilsCrossed, 
  AlertTriangle,
  CheckCircle2,
  Share2,
  Wifi,
  Thermometer,
  Fuel,
  RotateCcw,
  Maximize2,
  Minimize2,
  Phone,
  Check
} from 'lucide-react';

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

// Corridor Routes with real coordinates
const ROUTE_PROFILES = {
  'Katni-Jabalpur': {
    from: 'Katni',
    to: 'Jabalpur',
    busName: 'Night Bus Royal Star',
    busNumber: 'MP-04-NB-1122',
    currentSpeed: 64,
    eta: '1h 10m',
    etaTime: '23:55',
    distanceLeftKm: 42,
    driver: { name: 'Captain Mahesh Yadav', phone: '+919826144521', rating: '4.9' },
    conductor: { name: 'Santosh Tiwari', phone: '+919755211983' },
    stops: [
      { name: 'Katni ISBT Platform 2', time: '21:30', status: 'completed', desc: 'Departed on scheduled time', coords: [23.8343, 80.3990] },
      { name: 'Sleemanabad Bypass Toll', time: '22:15', status: 'completed', desc: 'Passed toll checkpoint smoothly', coords: [23.6397, 80.2520] },
      { name: 'Sihora Highway Food Plaza', time: '22:45', status: 'current', desc: 'Cruising at 64 km/h • 15m to dinner break', coords: [23.4862, 80.1147] },
      { name: 'Goshalpur Crossing', time: '23:20', status: 'upcoming', desc: 'Scheduled drop checkpoint', coords: [23.3421, 80.0520] },
      { name: 'Jabalpur ISBT Bus Port', time: '23:55', status: 'upcoming', desc: 'Final Destination Platform 4', coords: [23.1815, 79.9864] },
    ],
    // Coordinates polyline along NH30
    polyline: [
      [23.8343, 80.3990],
      [23.7521, 80.3402],
      [23.6397, 80.2520],
      [23.5412, 80.1789],
      [23.4862, 80.1147],
      [23.4120, 80.0820],
      [23.3421, 80.0520],
      [23.2510, 80.0150],
      [23.1815, 79.9864]
    ],
    initialBusPos: [23.4610, 80.1010],
  },
  'Bhopal-Indore': {
    from: 'Bhopal',
    to: 'Indore',
    busName: 'Night Bus Gold Line',
    busNumber: 'MP-09-NB-5544',
    currentSpeed: 68,
    eta: '2h 15m',
    etaTime: '01:30',
    distanceLeftKm: 98,
    driver: { name: 'Captain Arvind Singh', phone: '+919425188210', rating: '4.8' },
    conductor: { name: 'Dinesh Patel', phone: '+919827011452' },
    stops: [
      { name: 'Bhopal ISBT Platform 3', time: '22:00', status: 'completed', desc: 'Departed on scheduled time', coords: [23.2599, 77.4126] },
      { name: 'Sehore Bypass Crescent', time: '22:50', status: 'completed', desc: 'Passed toll checkpoint', coords: [23.2030, 77.0844] },
      { name: 'Ashta Highway Food Mall', time: '23:45', status: 'current', desc: 'Cruising at 68 km/h • Approaching midway break', coords: [22.9598, 76.5414] },
      { name: 'Dewas Bypass Junction', time: '00:50', status: 'upcoming', desc: 'Passenger deboarding', coords: [22.9676, 76.0534] },
      { name: 'Indore Vijay Nagar Bus Port', time: '01:30', status: 'upcoming', desc: 'Final Destination', coords: [22.7533, 75.8937] },
    ],
    polyline: [
      [23.2599, 77.4126],
      [23.2030, 77.0844],
      [22.9598, 76.5414],
      [22.9676, 76.0534],
      [22.7533, 75.8937]
    ],
    initialBusPos: [22.9598, 76.5414],
  }
};

const LiveTrackingScreen = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [booking, setBooking] = useState(null);
  const [profile, setProfile] = useState(ROUTE_PROFILES['Katni-Jabalpur']);
  const [tripState, setTripState] = useState('on-route'); // 'scheduled' | 'boarding' | 'on-route' | 'delayed' | 'completed' | 'cancelled'
  const [currentSpeed, setCurrentSpeed] = useState(64);
  const [busCoords, setBusCoords] = useState(ROUTE_PROFILES['Katni-Jabalpur'].initialBusPos);
  const [isCopied, setIsCopied] = useState(false);
  const [showSosModal, setShowSosModal] = useState(false);
  const [mapExpanded, setMapExpanded] = useState(false);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const busMarkerRef = useRef(null);

  // 1. Resolve Booking & Profile
  useEffect(() => {
    let resolvedBooking = location.state?.booking;

    if (!resolvedBooking) {
      // Look up in Seeded Bookings
      const seeded = SEEDED_DEFAULT_BOOKINGS.find(b => b.pnr === tripId || b._id === tripId);
      if (seeded) {
        resolvedBooking = seeded;
      } else {
        // Fallback or read from localStorage
        try {
          const stored = localStorage.getItem('user_bookings');
          if (stored) {
            const list = JSON.parse(stored);
            const found = list.find(b => b.pnr === tripId || b._id === tripId);
            if (found) resolvedBooking = found;
          }
        } catch {
          // ignore
        }
      }
    }

    if (!resolvedBooking) {
      // Default to the user's Katni -> Jabalpur booking from screenshot
      resolvedBooking = SEEDED_DEFAULT_BOOKINGS[0];
    }

    setBooking(resolvedBooking);

    // Pick corridor profile
    const routeKey = `${resolvedBooking.from}-${resolvedBooking.to}`;
    if (ROUTE_PROFILES[routeKey]) {
      setProfile(ROUTE_PROFILES[routeKey]);
      setBusCoords(ROUTE_PROFILES[routeKey].initialBusPos);
      setCurrentSpeed(ROUTE_PROFILES[routeKey].currentSpeed);
    } else if (resolvedBooking.from?.toLowerCase().includes('bhopal')) {
      setProfile(ROUTE_PROFILES['Bhopal-Indore']);
      setBusCoords(ROUTE_PROFILES['Bhopal-Indore'].initialBusPos);
      setCurrentSpeed(ROUTE_PROFILES['Bhopal-Indore'].currentSpeed);
    } else {
      setProfile(ROUTE_PROFILES['Katni-Jabalpur']);
      setBusCoords(ROUTE_PROFILES['Katni-Jabalpur'].initialBusPos);
    }
  }, [tripId, location.state]);

  // Trip State Simulator Presets
  const TRIP_STATE_PRESETS = [
    { id: 'scheduled', label: 'Scheduled (Depot)', speed: 0, tag: '0 km/h • Parked', color: '#6366f1' },
    { id: 'boarding', label: 'Boarding Active', speed: 0, tag: '0 km/h • Platform 2', color: '#059669' },
    { id: 'on-route', label: 'Cruising (Live)', speed: 64, tag: '64 km/h • Highway', color: '#10b981' },
    { id: 'delayed', label: 'Delayed (+25m)', speed: 18, tag: '18 km/h • Fog/Traffic', color: '#f59e0b' },
    { id: 'completed', label: 'Completed', speed: 0, tag: 'Arrived at ISBT', color: '#059669' },
    { id: 'cancelled', label: 'Cancelled', speed: 0, tag: '100% Refunded', color: '#ef4444' },
  ];

  const handleSelectTripState = (stateId) => {
    setTripState(stateId);
    if (!profile) return;

    if (stateId === 'scheduled' || stateId === 'boarding') {
      setCurrentSpeed(0);
      const originCoords = profile.stops[0].coords;
      setBusCoords(originCoords);
      if (busMarkerRef.current) busMarkerRef.current.setLatLng(originCoords);
      if (mapInstanceRef.current) mapInstanceRef.current.setView(originCoords, 13, { animate: true });
    } else if (stateId === 'completed') {
      setCurrentSpeed(0);
      const destCoords = profile.stops[profile.stops.length - 1].coords;
      setBusCoords(destCoords);
      if (busMarkerRef.current) busMarkerRef.current.setLatLng(destCoords);
      if (mapInstanceRef.current) mapInstanceRef.current.setView(destCoords, 13, { animate: true });
    } else if (stateId === 'delayed') {
      setCurrentSpeed(18);
      const delayedPos = [23.5412, 80.1789];
      setBusCoords(delayedPos);
      if (busMarkerRef.current) busMarkerRef.current.setLatLng(delayedPos);
      if (mapInstanceRef.current) mapInstanceRef.current.setView(delayedPos, 12, { animate: true });
    } else if (stateId === 'cancelled') {
      setCurrentSpeed(0);
    } else if (stateId === 'on-route') {
      setCurrentSpeed(64);
      const cruisePos = profile.initialBusPos;
      setBusCoords(cruisePos);
      if (busMarkerRef.current) busMarkerRef.current.setLatLng(cruisePos);
      if (mapInstanceRef.current) mapInstanceRef.current.setView(cruisePos, 11, { animate: true });
    }
  };

  // 2. Initialize Real Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Destroy any existing instance to avoid duplicate map in React 18/19
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: busCoords,
      zoom: 11,
      zoomControl: false,
      attributionControl: false,
    });

    // Official OpenStreetMap Tiles (100% Free, Zero Watermark, No API Key Required)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    // Route Polyline (Glowing Night Bus Indigo Track)
    const routeLine = L.polyline(profile.polyline, {
      color: '#4f46e5',
      weight: 6,
      opacity: 0.85,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);

    // Fit map bounds to polyline
    map.fitBounds(routeLine.getBounds(), { padding: [40, 40] });

    // Custom Stop Markers
    profile.stops.forEach((stop, index) => {
      const isStart = index === 0;
      const isEnd = index === profile.stops.length - 1;

      const stopIcon = L.divIcon({
        className: 'custom-stop-marker',
        html: `
          <div style="
            width: ${isStart || isEnd ? '24px' : '14px'};
            height: ${isStart || isEnd ? '24px' : '14px'};
            border-radius: 50%;
            background: ${isStart ? '#10b981' : isEnd ? '#ef4444' : '#6366f1'};
            border: 3px solid #ffffff;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      L.marker(stop.coords, { icon: stopIcon })
        .addTo(map)
        .bindPopup(`<strong>${stop.name}</strong><br/>Scheduled: ${stop.time}<br/>${stop.desc}`);
    });

    // Custom Pulsing Bus Marker
    const busIcon = L.divIcon({
      className: 'custom-bus-marker',
      html: `
        <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
          <div style="
            position: absolute;
            width: 44px;
            height: 44px;
            border-radius: 50%;
            background: rgba(99, 102, 241, 0.4);
            animation: bus-beacon-pulse 2s infinite ease-out;
          "></div>
          <div style="
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: #4f46e5;
            color: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 14px rgba(79, 70, 229, 0.6);
            border: 2px solid #ffffff;
            z-index: 10;
          ">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M8 6v6"/>
              <path d="M15 6v6"/>
              <path d="M2 12h19.6"/>
              <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4c-1.1 0-2.1.8-2.4 1.8l-1.4 5c-.1.4-.2.8-.2 1.2 0 .4.1.8.2 1.2.3 1.1.8 2.8.8 2.8h3"/>
              <circle cx="7" cy="18" r="2"/>
              <path d="M9 18h5"/>
              <circle cx="16" cy="18" r="2"/>
            </svg>
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });

    const busMarker = L.marker(busCoords, { icon: busIcon, zIndexOffset: 1000 }).addTo(map);
    busMarker.bindPopup(`<strong>${profile.busName}</strong><br/>Reg: ${profile.busNumber}<br/>Status: ${tripState.toUpperCase()}`);
    busMarkerRef.current = busMarker;
    mapInstanceRef.current = map;

    const timer = setTimeout(() => {
      if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [profile]);

  // 3. Live GPS Telemetry Jitter & Bus Micro-movement (Only active if on-route)
  useEffect(() => {
    if (tripState !== 'on-route') return;

    const interval = setInterval(() => {
      const newSpeed = 61 + Math.floor(Math.random() * 8);
      setCurrentSpeed(newSpeed);

      setBusCoords(prev => {
        const nextLat = prev[0] - 0.00015;
        const nextLng = prev[1] - 0.00012;
        const nextPos = [nextLat, nextLng];

        if (busMarkerRef.current) {
          busMarkerRef.current.setLatLng(nextPos);
        }
        return nextPos;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [tripState]);

  const handleRecenterBus = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(busCoords, 14, { animate: true });
    }
  };

  const handleFitRoute = () => {
    if (mapInstanceRef.current && profile.polyline) {
      const bounds = L.latLngBounds(profile.polyline);
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], animate: true });
    }
  };

  const handleShareTracking = () => {
    const shareUrl = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  // Dynamic Stop Progress calculation
  const computedStops = profile.stops.map((stop, index) => {
    if (tripState === 'scheduled') {
      return {
        ...stop,
        status: index === 0 ? 'current' : 'upcoming',
        desc: index === 0 ? 'Bus parked at depot • Boarding starts in 30m' : 'Upcoming corridor stop'
      };
    }
    if (tripState === 'boarding') {
      return {
        ...stop,
        status: index === 0 ? 'current' : 'upcoming',
        desc: index === 0 ? 'Boarding in progress • Conductor verifying tickets' : 'Upcoming corridor stop'
      };
    }
    if (tripState === 'completed') {
      return {
        ...stop,
        status: 'completed',
        desc: index === profile.stops.length - 1 ? 'Final destination reached safely ✓' : 'Stop completed on time'
      };
    }
    if (tripState === 'cancelled') {
      return {
        ...stop,
        status: 'cancelled',
        desc: 'Trip cancelled due to highway closure advisory'
      };
    }
    if (tripState === 'delayed') {
      return {
        ...stop,
        status: index <= 1 ? 'completed' : index === 2 ? 'current' : 'upcoming',
        desc: index === 2 ? 'Delay +25m • Slow cruise due to bypass traffic' : stop.desc
      };
    }
    // on-route default
    return stop;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc', minHeight: '100%', paddingBottom: '30px' }}>
      {/* Dynamic Keyframes for pulsing markers */}
      <style>{`
        @keyframes bus-beacon-pulse {
          0% { transform: scale(0.7); opacity: 1; }
          100% { transform: scale(1.8); opacity: 0; }
        }
      `}</style>

      {/* ── Top Header Navigation Bar ────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
        color: '#ffffff',
        padding: '16px 16px 16px',
        boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <button 
            onClick={() => navigate('/my-bookings')} 
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '12px',
              color: '#ffffff',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={20} />
          </button>

          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: tripState === 'cancelled' ? '#ef4444' : tripState === 'delayed' ? '#f59e0b' : '#10b981',
                boxShadow: `0 0 8px ${tripState === 'cancelled' ? '#ef4444' : '#10b981'}`,
              }} />
              <span style={{ fontSize: '15px', fontWeight: 800, letterSpacing: '0.3px' }}>
                Live Bus Tracking
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#c7d2fe', fontWeight: 600, marginTop: '2px' }}>
              PNR: {booking?.pnr || tripId || 'NB88492019'} • {booking?.busNumber || profile.busNumber}
            </div>
          </div>

          <button
            onClick={handleShareTracking}
            title="Share Tracking Link"
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '12px',
              color: '#ffffff',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            {isCopied ? <Check size={18} color="#10b981" /> : <Share2 size={18} />}
          </button>
        </div>

        {/* Route Banner */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.12)',
          borderRadius: '12px',
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backdropFilter: 'blur(8px)',
        }}>
          <div>
            <div style={{ fontSize: '10px', color: '#c7d2fe', fontWeight: 700, textTransform: 'uppercase' }}>ROUTE</div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#ffffff' }}>
              {booking?.from || profile.from} → {booking?.to || profile.to}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '10px', color: '#c7d2fe', fontWeight: 700, textTransform: 'uppercase' }}>BERTH / SEAT</div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#a7f3d0' }}>
              {booking?.seats ? booking.seats.join(', ') : 'L6'}
            </div>
          </div>
        </div>

        {/* ── REAL-TIME TRIP STATE SIMULATOR BAR (Interactive QA & Real-Time Test) ── */}
        <div style={{ marginTop: '12px' }}>
          <div style={{ fontSize: '10px', fontWeight: 800, color: '#c7d2fe', textTransform: 'uppercase', marginBottom: '6px' }}>
            Trip Real-Time Status Simulator:
          </div>
          <div style={{
            display: 'flex',
            gap: '6px',
            overflowX: 'auto',
            paddingBottom: '4px',
            scrollbarWidth: 'none',
          }}>
            {TRIP_STATE_PRESETS.map((state) => {
              const isActive = tripState === state.id;
              return (
                <button
                  key={state.id}
                  onClick={() => handleSelectTripState(state.id)}
                  style={{
                    whiteSpace: 'nowrap',
                    padding: '5px 10px',
                    borderRadius: '16px',
                    fontSize: '11px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    border: isActive ? '2px solid #ffffff' : '1px solid rgba(255, 255, 255, 0.25)',
                    backgroundColor: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.12)',
                    color: isActive ? '#4f46e5' : '#ffffff',
                    boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: isActive ? state.color : 'rgba(255,255,255,0.7)',
                  }} />
                  {state.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

        {/* ── TRIP STATE ALERT & NOTICE BANNERS ─────────────────────────────── */}
        {tripState === 'scheduled' && (
          <div style={{
            backgroundColor: '#eef2ff',
            border: '1px solid #c7d2fe',
            borderRadius: '14px',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <div style={{ backgroundColor: '#6366f1', color: '#fff', borderRadius: '8px', padding: '6px', flexShrink: 0 }}>
              <Clock size={18} />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#3730a3' }}>
                Trip Scheduled • Bus Parked at Origin Terminal
              </div>
              <div style={{ fontSize: '11px', color: '#4338ca', marginTop: '2px' }}>
                Bus {profile.busNumber} is parked at Katni ISBT Platform 2. Pre-trip safety and AC cooling in progress. Boarding opens at 21:15 (Departs 21:30).
              </div>
            </div>
          </div>
        )}

        {tripState === 'boarding' && (
          <div style={{
            backgroundColor: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: '14px',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <div style={{ backgroundColor: '#059669', color: '#fff', borderRadius: '8px', padding: '6px', flexShrink: 0 }}>
              <CheckCircle2 size={18} />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#065f46' }}>
                Boarding In Progress at Platform 2
              </div>
              <div style={{ fontSize: '11px', color: '#047857', marginTop: '2px' }}>
                Conductor Santosh Tiwari is verifying tickets. Please show your digital ticket for Berth L6 upon entering.
              </div>
            </div>
          </div>
        )}

        {tripState === 'delayed' && (
          <div style={{
            backgroundColor: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: '14px',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <div style={{ backgroundColor: '#f59e0b', color: '#fff', borderRadius: '8px', padding: '6px', flexShrink: 0 }}>
              <AlertTriangle size={18} />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#92400e' }}>
                Highway Congestion & Fog Advisory (+25m Delay)
              </div>
              <div style={{ fontSize: '11px', color: '#b45309', marginTop: '2px' }}>
                Dense fog and traffic slowdown near Sleemanabad Bypass. Bus speed reduced to 18 km/h for passenger safety. Revised arrival: 00:20.
              </div>
            </div>
          </div>
        )}

        {tripState === 'completed' && (
          <div style={{
            backgroundColor: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: '14px',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <div style={{ backgroundColor: '#059669', color: '#fff', borderRadius: '8px', padding: '6px', flexShrink: 0 }}>
              <CheckCircle2 size={18} />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#065f46' }}>
                Journey Completed • Safely Arrived
              </div>
              <div style={{ fontSize: '11px', color: '#047857', marginTop: '2px' }}>
                Bus has docked at Jabalpur ISBT Platform 4. We hope you had a restful night in sleeper Berth L6!
              </div>
            </div>
          </div>
        )}

        {tripState === 'cancelled' && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '14px',
            padding: '14px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
          }}>
            <div style={{ backgroundColor: '#ef4444', color: '#fff', borderRadius: '8px', padding: '6px', flexShrink: 0 }}>
              <AlertTriangle size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 900, color: '#991b1b' }}>
                TRIP CANCELLED • 100% REFUND PROCESSED
              </div>
              <div style={{ fontSize: '12px', color: '#b91c1c', marginTop: '4px', lineHeight: 1.4 }}>
                This trip was officially cancelled due to severe route safety advisory. Full refund of <strong>₹944</strong> has been initiated back to your payment source. Reference: <strong>RFND-88219</strong>.
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <a
                  href="tel:18002008899"
                  style={{
                    backgroundColor: '#dc2626',
                    color: '#fff',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: 800,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Phone size={12} /> Call Support Hotline
                </a>
                <button
                  onClick={() => navigate('/results')}
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#991b1b',
                    border: '1px solid #fca5a5',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  Book Alternate Bus
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── REAL INTERACTIVE LEAFLET MAP ────────────────────────────────────── */}
        <div style={{
          position: 'relative',
          borderRadius: '18px',
          overflow: 'hidden',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          border: '1px solid #e2e8f0',
          backgroundColor: '#e2e8f0',
          height: mapExpanded ? '380px' : '230px',
          transition: 'height 0.3s ease',
        }}>
          {/* Leaflet Map DOM Root */}
          <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

          {/* Floating Map Controls */}
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            zIndex: 400,
          }}>
            <button
              onClick={handleRecenterBus}
              title="Recenter on Bus"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#4f46e5',
              }}
            >
              <Navigation size={18} />
            </button>

            <button
              onClick={handleFitRoute}
              title="Fit Full Route"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#475569',
              }}
            >
              <RotateCcw size={16} />
            </button>

            <button
              onClick={() => {
                setMapExpanded(!mapExpanded);
                setTimeout(() => {
                  if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
                }, 310);
              }}
              title="Toggle Size"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#475569',
              }}
            >
              {mapExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          </div>

          {/* Floating Live Indicator Badge */}
          <div style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            color: '#ffffff',
            padding: '5px 10px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backdropFilter: 'blur(4px)',
            zIndex: 400,
          }}>
            <span style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: tripState === 'cancelled' ? '#ef4444' : tripState === 'delayed' ? '#f59e0b' : '#10b981',
              boxShadow: `0 0 6px ${tripState === 'cancelled' ? '#ef4444' : '#10b981'}`,
            }} />
            <span>
              {tripState === 'scheduled' && 'Depot Standby • GPS Active'}
              {tripState === 'boarding' && 'Terminal Boarding • Platform 2'}
              {tripState === 'on-route' && '4G Telemetry • Live 3s ago'}
              {tripState === 'delayed' && 'Highway Advisory • Slow Traffic'}
              {tripState === 'completed' && 'Destination Reached • Parked'}
              {tripState === 'cancelled' && 'Trip Cancelled • Offline'}
            </span>
          </div>
        </div>

        {/* ── TELEMETRY HUD TILES (Clean High-Contrast Dynamic Cards) ─────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '10px',
        }}>
          {/* Card 1: Speed */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '12px',
            textAlign: 'center',
            boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
            border: '1px solid #f1f5f9',
          }}>
            <div style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
              CURRENT SPEED
            </div>
            <div style={{ fontSize: '20px', fontWeight: 900, color: tripState === 'delayed' ? '#d97706' : tripState === 'cancelled' ? '#dc2626' : currentSpeed === 0 ? '#64748b' : '#059669', margin: '4px 0 2px' }}>
              {currentSpeed} <span style={{ fontSize: '11px', fontWeight: 600 }}>km/h</span>
            </div>
            <div style={{ fontSize: '10px', color: tripState === 'delayed' ? '#d97706' : tripState === 'cancelled' ? '#dc2626' : currentSpeed === 0 ? '#64748b' : '#059669', fontWeight: 700 }}>
              {tripState === 'scheduled' && 'Parked at Depot'}
              {tripState === 'boarding' && 'Platform 2 Bay'}
              {tripState === 'on-route' && 'Highway Cruising'}
              {tripState === 'delayed' && 'Traffic Slowdown'}
              {tripState === 'completed' && 'Trip Completed'}
              {tripState === 'cancelled' && 'Trip Cancelled'}
            </div>
          </div>

          {/* Card 2: ETA Time */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '12px',
            textAlign: 'center',
            boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
            border: '1px solid #f1f5f9',
          }}>
            <div style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
              EST. ARRIVAL
            </div>
            <div style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', margin: '4px 0 2px' }}>
              {tripState === 'delayed' ? '00:20' : tripState === 'completed' ? 'Arrived' : tripState === 'cancelled' ? 'Voided' : profile.etaTime}
            </div>
            <div style={{ fontSize: '10px', color: tripState === 'delayed' ? '#d97706' : '#6366f1', fontWeight: 700 }}>
              {tripState === 'scheduled' && 'Departs at 21:30'}
              {tripState === 'boarding' && 'Boarding Now'}
              {tripState === 'on-route' && `~${profile.eta} left`}
              {tripState === 'delayed' && '+25m Fog Delay'}
              {tripState === 'completed' && 'Docked at Port'}
              {tripState === 'cancelled' && 'Refund Active'}
            </div>
          </div>

          {/* Card 3: Distance Left */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '12px',
            textAlign: 'center',
            boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
            border: '1px solid #f1f5f9',
          }}>
            <div style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
              DISTANCE LEFT
            </div>
            <div style={{ fontSize: '20px', fontWeight: 900, color: '#4f46e5', margin: '4px 0 2px' }}>
              {tripState === 'scheduled' || tripState === 'boarding' ? '85' : tripState === 'completed' || tripState === 'cancelled' ? '0' : tripState === 'delayed' ? '48' : profile.distanceLeftKm} <span style={{ fontSize: '11px', fontWeight: 600 }}>km</span>
            </div>
            <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700 }}>
              To {booking?.to || profile.to}
            </div>
          </div>
        </div>

        {/* ── FOOD / DINNER REST STOP CALLOUT (Linked to Booked Route) ────────── */}
        {tripState !== 'cancelled' && tripState !== 'completed' && (
          <div style={{
            backgroundColor: '#fffbeb',
            border: '1px solid #fef3c7',
            borderRadius: '16px',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: '#fef3c7',
                color: '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <UtensilsCrossed size={18} />
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#92400e' }}>
                  Next Stop: Sihora Highway Food Plaza (Halt 22:45)
                </div>
                <div style={{ fontSize: '11px', color: '#b45309' }}>
                  Delivered right to your sleeper berth L6 during the 25 min halt.
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/food', {
                state: {
                  booking,
                  routeKey: `${profile.from}-${profile.to}`,
                  haltPoint: {
                    name: 'Sihora Highway Food Plaza',
                    highway: 'NH-30 Katni - Jabalpur Corridor',
                    time: '22:45',
                    duration: '25 min halt',
                    status: 'Halt in ~15 mins',
                    rating: '4.9',
                    fssai: 'FSSAI Lic: 104230008912',
                  }
                }
              })}
              style={{
                backgroundColor: '#f59e0b',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '8px 12px',
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 6px rgba(245, 158, 11, 0.3)',
              }}
            >
              Order Food
            </button>
          </div>
        )}

        {/* ── ONBOARD VEHICLE HEALTH & AMENITIES ───────────────────────────────── */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '14px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
          border: '1px solid #f1f5f9',
        }}>
          <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>
            Onboard Bus Telemetry & Comfort
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            <div style={{
              backgroundColor: '#f8fafc',
              borderRadius: '10px',
              padding: '8px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <Fuel size={16} color="#10b981" />
              <div>
                <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700 }}>FUEL</div>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a' }}>
                  {tripState === 'scheduled' ? '95% Full' : '78% Tank'}
                </div>
              </div>
            </div>

            <div style={{
              backgroundColor: '#f8fafc',
              borderRadius: '10px',
              padding: '8px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <Thermometer size={16} color="#0284c7" />
              <div>
                <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700 }}>CABIN AC</div>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a' }}>
                  {tripState === 'scheduled' ? 'Pre-cooling' : '22°C Cool'}
                </div>
              </div>
            </div>

            <div style={{
              backgroundColor: '#f8fafc',
              borderRadius: '10px',
              padding: '8px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <Wifi size={16} color="#6366f1" />
              <div>
                <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700 }}>WI-FI</div>
                <div style={{ fontSize: '12px', fontWeight: 800, color: tripState === 'cancelled' ? '#ef4444' : '#10b981' }}>
                  {tripState === 'cancelled' ? 'Offline' : 'Connected'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── STOP-BY-STOP CORRIDOR TIMELINE ──────────────────────────────────── */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '18px',
          padding: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          border: '1px solid #f1f5f9',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>Corridor Stops & Route Progress</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Scheduled timing vs live GPS check-ins</div>
            </div>
            <span style={{
              backgroundColor: tripState === 'delayed' ? '#fef3c7' : tripState === 'cancelled' ? '#fee2e2' : '#ecfdf5',
              color: tripState === 'delayed' ? '#b45309' : tripState === 'cancelled' ? '#dc2626' : '#059669',
              padding: '3px 8px',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: 800,
            }}>
              {tripState === 'scheduled' && 'SCHEDULED'}
              {tripState === 'boarding' && 'BOARDING'}
              {tripState === 'on-route' && 'ON TIME'}
              {tripState === 'delayed' && '+25M DELAY'}
              {tripState === 'completed' && 'COMPLETED'}
              {tripState === 'cancelled' && 'CANCELLED'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {computedStops.map((stop, idx) => {
              const isCompleted = stop.status === 'completed';
              const isCurrent = stop.status === 'current';
              const isCancelled = stop.status === 'cancelled';

              return (
                <div key={idx} style={{ display: 'flex', gap: '14px', position: 'relative' }}>
                  {/* Vertical bar line */}
                  {idx < computedStops.length - 1 && (
                    <div style={{
                      position: 'absolute',
                      left: '13px',
                      top: '26px',
                      bottom: '-18px',
                      width: '2px',
                      backgroundColor: isCompleted ? '#10b981' : isCancelled ? '#fca5a5' : '#e2e8f0',
                    }} />
                  )}

                  {/* Dot Indicator */}
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: isCurrent ? '#4f46e5' : isCompleted ? '#ecfdf5' : isCancelled ? '#fef2f2' : '#f1f5f9',
                    border: isCurrent ? '3px solid #c7d2fe' : isCompleted ? '2px solid #10b981' : isCancelled ? '2px solid #ef4444' : '2px solid #cbd5e1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    zIndex: 2,
                    boxShadow: isCurrent ? '0 0 10px rgba(79, 70, 229, 0.4)' : 'none',
                  }}>
                    {isCompleted && <CheckCircle2 size={15} color="#059669" />}
                    {isCurrent && <Radio size={14} color="#ffffff" />}
                    {isCancelled && <span style={{ fontSize: '11px', fontWeight: 900, color: '#ef4444' }}>✕</span>}
                    {!isCompleted && !isCurrent && !isCancelled && (
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#94a3b8' }} />
                    )}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{
                        fontWeight: isCurrent ? 800 : 700,
                        fontSize: '13px',
                        color: isCurrent ? '#4f46e5' : isCompleted ? '#0f172a' : isCancelled ? '#ef4444' : '#64748b',
                      }}>
                        {stop.name}
                      </span>
                      <span className="mono" style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: isCurrent ? '#4f46e5' : isCancelled ? '#ef4444' : '#64748b',
                      }}>
                        {stop.time}
                      </span>
                    </div>

                    <p style={{
                      fontSize: '11px',
                      color: isCurrent ? '#4f46e5' : isCancelled ? '#b91c1c' : '#94a3b8',
                      marginTop: '2px',
                      fontWeight: isCurrent ? 600 : 400,
                    }}>
                      {stop.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── BUS CREW & EMERGENCY CONTACTS ──────────────────────────────────── */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '14px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
          border: '1px solid #f1f5f9',
        }}>
          <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>
            Assigned Bus Crew & Captain
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#eef2ff',
                color: '#4f46e5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '14px',
              }}>
                MY
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                  {profile.driver.name}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  Primary Bus Captain • Rating: {profile.driver.rating} ★
                </div>
              </div>
            </div>

            <a
              href={`tel:${profile.driver.phone}`}
              style={{
                backgroundColor: '#eef2ff',
                color: '#4f46e5',
                padding: '8px 12px',
                borderRadius: '10px',
                fontSize: '11px',
                fontWeight: 800,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Phone size={13} />
              <span>Call</span>
            </a>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#f1f5f9',
                color: '#475569',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '14px',
              }}>
                ST
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                  {profile.conductor.name}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  Onboard Attendant & Conductor
                </div>
              </div>
            </div>

            <a
              href={`tel:${profile.conductor.phone}`}
              style={{
                backgroundColor: '#f1f5f9',
                color: '#334155',
                padding: '8px 12px',
                borderRadius: '10px',
                fontSize: '11px',
                fontWeight: 800,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Phone size={13} />
              <span>Call</span>
            </a>
          </div>

          {/* Emergency SOS Button */}
          <button
            onClick={() => setShowSosModal(true)}
            style={{
              width: '100%',
              backgroundColor: '#fef2f2',
              color: '#dc2626',
              border: '1px solid #fecaca',
              borderRadius: '12px',
              padding: '10px',
              fontSize: '12px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              marginTop: '12px',
              cursor: 'pointer',
            }}
          >
            <AlertTriangle size={15} />
            <span>Emergency SOS & 24x7 Support</span>
          </button>
        </div>

      </div>

      {/* ── SOS EMERGENCY MODAL ──────────────────────────────────────────────── */}
      {showSosModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          backdropFilter: 'blur(4px)',
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            maxWidth: '360px',
            width: '100%',
            padding: '24px',
            textAlign: 'center',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#fee2e2',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <AlertTriangle size={28} />
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', marginBottom: '8px' }}>
              Night Bus SOS Dispatch
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px', lineHeight: 1.5 }}>
              In need of instant medical or route emergency assistance? Immediate response channels:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <a
                href="tel:112"
                style={{
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  padding: '12px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: 800,
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <Phone size={16} />
                <span>Call National Helpline (112)</span>
              </a>

              <a
                href="tel:18002008899"
                style={{
                  backgroundColor: '#f1f5f9',
                  color: '#0f172a',
                  padding: '12px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: 700,
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <span>Night Bus 24x7 Control Room</span>
              </a>

              <button
                onClick={() => setShowSosModal(false)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#64748b',
                  padding: '10px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginTop: '4px',
                }}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveTrackingScreen;
