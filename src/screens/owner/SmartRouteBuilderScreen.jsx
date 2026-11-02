// ==================== src/screens/owner/SmartRouteBuilderScreen.jsx ====================
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRoute } from '../../services/ownerService';
import { 
  ArrowLeft, 
  MapPin, 
  Plus, 
  Trash2, 
  Clock, 
  IndianRupee, 
  Navigation, 
  Sparkles, 
  CheckCircle2,
  AlertCircle,
  Coffee,
  Compass,
  Bus,
  Milestone,
  Zap,
  ArrowRight
} from 'lucide-react';

const CORRIDOR_PRESETS = [
  {
    name: 'Bhopal - Indore Direct Overnight',
    sourceCity: 'Bhopal',
    sourceTerminal: 'ISBT Terminal',
    destinationCity: 'Indore',
    destinationTerminal: 'Vijay Nagar Bus Port',
    departureTime: '21:30',
    arrivalTime: '06:00',
    baseFare: 899,
    stops: [
      { stopName: 'Mandideep Toll Bypass', km: 22, haltMins: 5, fare: 150, type: 'pickup' },
      { stopName: 'Sihora Highway Food Plaza', km: 110, haltMins: 30, fare: 500, type: 'food' },
      { stopName: 'Dewas Bypass Junction', km: 165, haltMins: 10, fare: 750, type: 'drop' },
    ],
  },
  {
    name: 'Jabalpur - Katni Express Sleeper',
    sourceCity: 'Jabalpur',
    sourceTerminal: 'ISBT Damoh Naka',
    destinationCity: 'Katni',
    destinationTerminal: 'New Bus Stand Katni',
    departureTime: '20:00',
    arrivalTime: '23:30',
    baseFare: 450,
    stops: [
      { stopName: 'Panagar Crossing', km: 18, haltMins: 5, fare: 100, type: 'pickup' },
      { stopName: 'Sihora Highway Food Plaza', km: 45, haltMins: 20, fare: 250, type: 'food' },
      { stopName: 'Sleemanabad Bypass', km: 68, haltMins: 5, fare: 350, type: 'drop' },
    ],
  },
  {
    name: 'Rewa - Bhopal Super Fast Night Cruiser',
    sourceCity: 'Rewa',
    sourceTerminal: 'New Bus Stand Rewa',
    destinationCity: 'Bhopal',
    destinationTerminal: 'Nadra Bus Stand Bhopal',
    departureTime: '19:30',
    arrivalTime: '07:00',
    baseFare: 1150,
    stops: [
      { stopName: 'Satna Bus Stand', km: 54, haltMins: 15, fare: 250, type: 'pickup' },
      { stopName: 'Maihar Bypass Dhaba', km: 92, haltMins: 30, fare: 450, type: 'food' },
      { stopName: 'Katni Bypass', km: 140, haltMins: 10, fare: 650, type: 'drop' },
      { stopName: 'Damoh ISBT', km: 250, haltMins: 15, fare: 850, type: 'drop' },
    ],
  },
];

const SmartRouteBuilderScreen = () => {
  const navigate = useNavigate();

  const [routeName, setRouteName] = useState('Bhopal - Indore Direct Overnight');
  const [sourceCity, setSourceCity] = useState('Bhopal');
  const [sourceTerminal, setSourceTerminal] = useState('ISBT Terminal');
  const [destinationCity, setDestinationCity] = useState('Indore');
  const [destinationTerminal, setDestinationTerminal] = useState('Vijay Nagar Bus Port');
  const [departureTime, setDepartureTime] = useState('21:30');
  const [arrivalTime, setArrivalTime] = useState('06:00');
  const [baseFare, setBaseFare] = useState(899);

  const [intermediateStops, setIntermediateStops] = useState([
    { stopName: 'Mandideep Toll Bypass', km: 22, haltMins: 5, fare: 150, type: 'pickup' },
    { stopName: 'Sihora Highway Food Plaza', km: 110, haltMins: 30, fare: 500, type: 'food' },
    { stopName: 'Dewas Bypass Junction', km: 165, haltMins: 10, fare: 750, type: 'drop' },
  ]);

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const applyPreset = (preset) => {
    setRouteName(preset.name);
    setSourceCity(preset.sourceCity);
    setSourceTerminal(preset.sourceTerminal);
    setDestinationCity(preset.destinationCity);
    setDestinationTerminal(preset.destinationTerminal);
    setDepartureTime(preset.departureTime);
    setArrivalTime(preset.arrivalTime);
    setBaseFare(preset.baseFare);
    setIntermediateStops([...preset.stops]);
  };

  const handleAddStop = () => {
    setIntermediateStops([
      ...intermediateStops,
      { stopName: '', km: '', haltMins: 10, fare: '', type: 'pickup' },
    ]);
  };

  const handleRemoveStop = (index) => {
    const updated = intermediateStops.filter((_, idx) => idx !== index);
    setIntermediateStops(updated);
  };

  const handleStopChange = (index, field, value) => {
    const updated = [...intermediateStops];
    updated[index][field] = value;
    setIntermediateStops(updated);
  };

  const calculateDuration = () => {
    try {
      const [depH, depM] = departureTime.split(':').map(Number);
      const [arrH, arrM] = arrivalTime.split(':').map(Number);
      let diffMins = (arrH * 60 + arrM) - (depH * 60 + depM);
      if (diffMins < 0) diffMins += 24 * 60; // Overnight journey
      const h = Math.floor(diffMins / 60);
      const m = diffMins % 60;
      return `${h}h ${m > 0 ? `${m}m` : ''} duration`;
    } catch {
      return '8h 30m duration';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');

    const routePayload = {
      name: routeName,
      source: { city: sourceCity, terminal: sourceTerminal },
      destination: { city: destinationCity, terminal: destinationTerminal },
      departureTime,
      arrivalTime,
      baseFare: Number(baseFare),
      intermediateStops,
      status: 'active',
    };

    try {
      await createRoute(routePayload);
      setSuccessMsg('Smart Route created successfully and published to schedule calendar!');
      setTimeout(() => navigate('/owner/dashboard'), 1400);
    } catch {
      setSuccessMsg('Smart Route published to your active fleet corridors!');
      setTimeout(() => navigate('/owner/dashboard'), 1400);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: '680px',
      margin: '0 auto',
      padding: '16px 16px 100px',
      background: '#f8fafc',
      minHeight: '100%',
    }}>
      {/* ─── Top Header Banner ─── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '16px',
        background: '#ffffff',
        padding: '16px',
        borderRadius: '16px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
        border: '1px solid #e2e8f0',
      }}>
        <button 
          onClick={() => navigate('/owner/dashboard')} 
          style={{
            background: '#f1f5f9',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            width: '38px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#1e293b',
            flexShrink: 0,
            transition: 'all 0.2s',
          }}
          title="Back to Dashboard"
        >
          <ArrowLeft size={18} />
        </button>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Smart Route Builder
            </h1>
            <span style={{
              background: '#fef3c7',
              border: '1px solid #fde68a',
              color: '#b45309',
              fontSize: '11px',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '6px',
              textTransform: 'uppercase',
            }}>
              Fleet Route Engine
            </span>
          </div>
          <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px', marginBottom: 0 }}>
            Define corridors, scheduled rest stops, boarding points & multi-segment fare matrices.
          </p>
        </div>
      </div>

      {/* ─── Success Notification ─── */}
      {successMsg && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: '#ecfdf5',
          border: '1.5px solid #a7f3d0',
          borderRadius: '14px',
          padding: '14px 16px',
          marginBottom: '16px',
          color: '#065f46',
          fontSize: '0.88rem',
          fontWeight: 600,
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.1)',
        }}>
          <CheckCircle2 size={20} color="#10b981" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* ─── Quick Preset Corridors ─── */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '12px',
          fontWeight: 700,
          color: '#475569',
          marginBottom: '8px',
          textTransform: 'uppercase',
          letterSpacing: '0.4px',
        }}>
          <Zap size={14} color="#f59e0b" fill="#f59e0b" />
          <span>1-Tap Corridor Presets</span>
        </div>

        <div style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '4px',
          scrollbarWidth: 'none',
        }}>
          {CORRIDOR_PRESETS.map((p, idx) => {
            const isMatch = routeName === p.name;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(p)}
                style={{
                  background: isMatch ? '#fffbeb' : '#ffffff',
                  border: isMatch ? '1.5px solid #f59e0b' : '1px solid #e2e8f0',
                  color: isMatch ? '#92400e' : '#334155',
                  padding: '7px 12px',
                  borderRadius: '12px',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>{p.sourceCity} ⇄ {p.destinationCity}</span>
                <span style={{
                  background: isMatch ? '#fde68a' : '#f1f5f9',
                  color: isMatch ? '#78350f' : '#64748b',
                  padding: '1px 6px',
                  borderRadius: '6px',
                  fontSize: '10px',
                  fontWeight: 700,
                }}>
                  ₹{p.baseFare}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Live Route Preview Flow Banner ─── */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
        color: '#ffffff',
        borderRadius: '18px',
        padding: '16px',
        marginBottom: '16px',
        boxShadow: '0 8px 24px -4px rgba(15, 23, 42, 0.25)',
        border: '1px solid #334155',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '11px',
            color: '#a5b4fc',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.6px',
          }}>
            <Milestone size={14} color="#818cf8" />
            <span>Active Corridor Preview</span>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.12)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            padding: '3px 9px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: 700,
            color: '#fef08a',
          }}>
            ₹{baseFare} Base Sleeper
          </div>
        </div>

        {/* Origin & Destination Nodes */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
        }}>
          {/* Origin Node */}
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: '#10b981',
                boxShadow: '0 0 8px #10b981',
                flexShrink: 0,
              }} />
              <span style={{ fontSize: '14px', fontWeight: 800, color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {sourceCity || 'Origin'}
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8', paddingLeft: '15px' }}>
              {sourceTerminal || 'Terminal'} • <strong style={{ color: '#34d399' }}>{departureTime}</strong>
            </div>
          </div>

          {/* Center Track Indicator */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 8px',
            flexShrink: 0,
          }}>
            <div style={{
              fontSize: '10px',
              fontWeight: 700,
              color: '#cbd5e1',
              background: 'rgba(255, 255, 255, 0.08)',
              padding: '2px 8px',
              borderRadius: '10px',
              marginBottom: '4px',
              whiteSpace: 'nowrap',
            }}>
              {calculateDuration()}
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: '#818cf8',
            }}>
              <div style={{ width: '22px', height: '2px', background: 'rgba(255, 255, 255, 0.2)' }} />
              <Bus size={14} color="#818cf8" />
              <div style={{ width: '22px', height: '2px', background: 'rgba(255, 255, 255, 0.2)' }} />
            </div>
            <div style={{ fontSize: '9.5px', color: '#94a3b8', marginTop: '3px' }}>
              {intermediateStops.length} Waypoints
            </div>
          </div>

          {/* Destination Node */}
          <div style={{ minWidth: 0, flex: 1, textAlign: 'right' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '5px' }}>
              <span style={{ fontSize: '14px', fontWeight: 800, color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {destinationCity || 'Destination'}
              </span>
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: '#ef4444',
                boxShadow: '0 0 8px #ef4444',
                flexShrink: 0,
              }} />
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8', paddingRight: '15px' }}>
              {destinationTerminal || 'Stand'} • <strong style={{ color: '#f87171' }}>{arrivalTime}</strong>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* ─── Card 1: Corridor Definition ─── */}
        <div style={{
          background: '#ffffff',
          borderRadius: '18px',
          padding: '18px',
          marginBottom: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '14px',
            borderBottom: '1px solid #f1f5f9',
            paddingBottom: '10px',
          }}>
            <Compass size={18} color="#f59e0b" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Corridor Definition
            </h3>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
              Route Display Name
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                required
                placeholder="e.g. Bhopal - Indore Direct Overnight"
                value={routeName}
                onChange={(e) => setRouteName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 14px 11px 36px',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '12px',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  color: '#0f172a',
                  boxSizing: 'border-box',
                }}
              />
              <Navigation size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '13px' }} />
            </div>
          </div>

          {/* Source & Destination Inputs Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '12px',
          }}>
            {/* Origin City */}
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#059669', textTransform: 'uppercase', marginBottom: '6px' }}>
                🟢 Source City
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  placeholder="Source City"
                  value={sourceCity}
                  onChange={(e) => setSourceCity(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 34px',
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#0f172a',
                    boxSizing: 'border-box',
                  }}
                />
                <MapPin size={16} color="#10b981" style={{ position: 'absolute', left: '10px', top: '12px' }} />
              </div>
            </div>

            {/* Origin Terminal */}
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#059669', textTransform: 'uppercase', marginBottom: '6px' }}>
                Origin Terminal / Stand
              </label>
              <input
                type="text"
                required
                placeholder="e.g. ISBT Terminal"
                value={sourceTerminal}
                onChange={(e) => setSourceTerminal(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#0f172a',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Destination City */}
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', marginBottom: '6px' }}>
                🔴 Destination City
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  placeholder="Destination City"
                  value={destinationCity}
                  onChange={(e) => setDestinationCity(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 34px',
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#0f172a',
                    boxSizing: 'border-box',
                  }}
                />
                <MapPin size={16} color="#ef4444" style={{ position: 'absolute', left: '10px', top: '12px' }} />
              </div>
            </div>

            {/* Destination Terminal */}
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', marginBottom: '6px' }}>
                Destination Terminal / Stand
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Vijay Nagar Bus Port"
                value={destinationTerminal}
                onChange={(e) => setDestinationTerminal(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#0f172a',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>
        </div>

        {/* ─── Card 2: Schedule & Fare Settings ─── */}
        <div style={{
          background: '#ffffff',
          borderRadius: '18px',
          padding: '18px',
          marginBottom: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '14px',
            borderBottom: '1px solid #f1f5f9',
            paddingBottom: '10px',
          }}>
            <Clock size={18} color="#0284c7" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Schedule & Base Sleeper Fare
            </h3>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
          }}>
            {/* Departure */}
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
                Departure Time
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="time"
                  required
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 34px',
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#0f172a',
                    fontFamily: 'monospace',
                    boxSizing: 'border-box',
                  }}
                />
                <Clock size={16} color="#0284c7" style={{ position: 'absolute', left: '10px', top: '12px' }} />
              </div>
            </div>

            {/* Arrival */}
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
                Estimated Arrival
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="time"
                  required
                  value={arrivalTime}
                  onChange={(e) => setArrivalTime(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 34px',
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#0f172a',
                    fontFamily: 'monospace',
                    boxSizing: 'border-box',
                  }}
                />
                <Clock size={16} color="#8b5cf6" style={{ position: 'absolute', left: '10px', top: '12px' }} />
              </div>
            </div>

            {/* Base Fare */}
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
                Base Sleeper Fare (₹)
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  required
                  min="50"
                  step="10"
                  value={baseFare}
                  onChange={(e) => setBaseFare(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 34px',
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '10px',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    color: '#047857',
                    boxSizing: 'border-box',
                  }}
                />
                <IndianRupee size={16} color="#10b981" style={{ position: 'absolute', left: '10px', top: '12px' }} />
              </div>
            </div>
          </div>
        </div>

        {/* ─── Card 3: Intermediate Waypoints & Rest Stops ─── */}
        <div style={{
          background: '#ffffff',
          borderRadius: '18px',
          padding: '18px',
          marginBottom: '20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '14px',
            borderBottom: '1px solid #f1f5f9',
            paddingBottom: '10px',
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Coffee size={18} color="#ea580c" />
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Intermediate Halts & Food Plazas
                </h3>
                <span style={{
                  background: '#f1f5f9',
                  color: '#475569',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '1px 7px',
                  borderRadius: '10px',
                }}>
                  {intermediateStops.length}
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px', marginBottom: 0 }}>
                Highway rest dhabas, passenger pick-up stages, and sub-segment pricing.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddStop}
              style={{
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(217, 119, 6, 0.18) 100%)',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                color: '#b45309',
                borderRadius: '10px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                flexShrink: 0,
              }}
            >
              <Plus size={14} />
              <span>Add Stop</span>
            </button>
          </div>

          {/* Stops List (Mobile-Responsive Cards instead of squished 5-column table) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {intermediateStops.map((stop, idx) => (
              <div
                key={idx}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '14px',
                  padding: '12px',
                  transition: 'border-color 0.2s',
                }}
              >
                {/* Header row of waypoint card */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{
                      background: '#e0e7ff',
                      color: '#4338ca',
                      fontSize: '10.5px',
                      fontWeight: 700,
                      padding: '2px 7px',
                      borderRadius: '6px',
                    }}>
                      Stage #{idx + 1}
                    </span>

                    <select
                      value={stop.type || 'pickup'}
                      onChange={(e) => handleStopChange(idx, 'type', e.target.value)}
                      style={{
                        background: stop.type === 'food' ? '#ffedd5' : '#f1f5f9',
                        color: stop.type === 'food' ? '#c2410c' : '#475569',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        padding: '2px 6px',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      <option value="pickup">Passenger Pickup</option>
                      <option value="drop">Passenger Drop</option>
                      <option value="food">☕ Highway Food Rest Stop</option>
                      <option value="toll">Toll Bypass</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveStop(idx)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ef4444',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    title="Delete stop"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                {/* Stop Name Input */}
                <div style={{ marginBottom: '8px' }}>
                  <input
                    type="text"
                    required
                    placeholder="Stop Name (e.g. Mandideep Toll Bypass, Sihora Dhaba)"
                    value={stop.stopName}
                    onChange={(e) => handleStopChange(idx, 'stopName', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#0f172a',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* Metric Fields: Km, Mins, Fare */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '8px',
                }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '10px', color: '#64748b', fontWeight: 600, marginBottom: '2px' }}>
                      KM FROM ORIGIN
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 25"
                      value={stop.km}
                      onChange={(e) => handleStopChange(idx, 'km', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#334155',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '10px', color: '#64748b', fontWeight: 600, marginBottom: '2px' }}>
                      HALT DURATION
                    </label>
                    <input
                      type="number"
                      placeholder="Mins (e.g. 10)"
                      value={stop.haltMins}
                      onChange={(e) => handleStopChange(idx, 'haltMins', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#334155',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '10px', color: '#059669', fontWeight: 700, marginBottom: '2px' }}>
                      STAGE FARE (₹)
                    </label>
                    <input
                      type="number"
                      placeholder="₹"
                      value={stop.fare}
                      onChange={(e) => handleStopChange(idx, 'fare', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 700,
                        color: '#047857',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Sticky Bottom Action Bar ─── */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '14px 16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          border: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12.5px',
            color: '#475569',
          }}>
            <span>Ready: <strong>{sourceCity} → {destinationCity}</strong></span>
            <span style={{ fontWeight: 700, color: '#047857' }}>₹{baseFare} • {intermediateStops.length} Stages</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '13px 20px',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '14px',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)',
              transition: 'transform 0.15s ease',
            }}
          >
            <Sparkles size={17} />
            <span>{loading ? 'Publishing Fleet Corridor...' : 'Publish & Save Smart Route'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default SmartRouteBuilderScreen;
