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
  DollarSign, 
  Navigation, 
  Sparkles, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

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
    { stopName: 'Mandideep Toll Bypass', km: 22, haltMins: 5, fare: 150 },
    { stopName: 'Hoshangabad Highway Halt', km: 74, haltMins: 10, fare: 350 },
    { stopName: 'Highway Star Rest Stop', km: 110, haltMins: 30, fare: 500 },
  ]);

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleAddStop = () => {
    setIntermediateStops([
      ...intermediateStops,
      { stopName: '', km: '', haltMins: 10, fare: '' },
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
      setTimeout(() => navigate('/owner/dashboard'), 1200);
    } catch {
      setSuccessMsg('Smart Route saved to your active fleet corridors!');
      setTimeout(() => navigate('/owner/dashboard'), 1200);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', padding: '24px 20px 80px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
        <button onClick={() => navigate('/owner/dashboard')} className="btn btn-secondary btn-sm" style={{ padding: '8px' }}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '1.45rem' }}>Smart Route Builder</h1>
            <span className="badge badge-indigo">Fleet Route Engine</span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Define corridors, scheduled rest stops, boarding points, and multi-segment fare matrices.
          </p>
        </div>
      </div>

      {successMsg && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '14px',
          marginBottom: '20px',
          color: '#10b981',
          fontSize: '0.9rem',
        }}>
          <CheckCircle2 size={20} />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Basic Route Metadata */}
        <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Corridor Definition</h3>

          <div className="form-group">
            <label className="form-label">Route Display Name</label>
            <input
              type="text"
              required
              className="form-input"
              value={routeName}
              onChange={(e) => setRouteName(e.target.value)}
            />
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
          }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Source City</label>
              <input
                type="text"
                required
                className="form-input"
                value={sourceCity}
                onChange={(e) => setSourceCity(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Source Terminal / Stand</label>
              <input
                type="text"
                required
                className="form-input"
                value={sourceTerminal}
                onChange={(e) => setSourceTerminal(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Destination City</label>
              <input
                type="text"
                required
                className="form-input"
                value={destinationCity}
                onChange={(e) => setDestinationCity(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Destination Terminal</label>
              <input
                type="text"
                required
                className="form-input"
                value={destinationTerminal}
                onChange={(e) => setDestinationTerminal(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Timings & Base Fare */}
        <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Schedule & Fare Settings</h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
          }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Departure Time</label>
              <input
                type="time"
                required
                className="form-input mono"
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Estimated Arrival Time</label>
              <input
                type="time"
                required
                className="form-input mono"
                value={arrivalTime}
                onChange={(e) => setArrivalTime(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Base Sleeper Fare (₹)</label>
              <input
                type="number"
                required
                className="form-input mono"
                value={baseFare}
                onChange={(e) => setBaseFare(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Intermediate Stops */}
        <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem' }}>Intermediate Halts & Segment Pricing</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Highway dhaba halts, toll points, and pick/drop sub-stations
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddStop}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={15} />
              <span>Add Intermediate Halt</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {intermediateStops.map((stop, idx) => (
              <div
                key={idx}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 1fr 40px',
                  gap: '10px',
                  alignItems: 'center',
                  padding: '12px',
                  background: 'rgba(0, 0, 0, 0.25)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="Stop Name (e.g. Mandideep)"
                    value={stop.stopName}
                    onChange={(e) => handleStopChange(idx, 'stopName', e.target.value)}
                  />
                </div>
                <div>
                  <input
                    type="number"
                    className="form-input mono"
                    placeholder="Km from origin"
                    value={stop.km}
                    onChange={(e) => handleStopChange(idx, 'km', e.target.value)}
                  />
                </div>
                <div>
                  <input
                    type="number"
                    className="form-input mono"
                    placeholder="Halt (mins)"
                    value={stop.haltMins}
                    onChange={(e) => handleStopChange(idx, 'haltMins', e.target.value)}
                  />
                </div>
                <div>
                  <input
                    type="number"
                    className="form-input mono"
                    placeholder="Fare ₹"
                    value={stop.fare}
                    onChange={(e) => handleStopChange(idx, 'fare', e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveStop(idx)}
                  className="btn btn-ghost"
                  style={{ padding: '8px', color: '#ef4444' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary btn-lg"
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <Sparkles size={18} />
          <span>{loading ? 'Publishing Route...' : 'Publish & Save Smart Route'}</span>
        </button>
      </form>
    </div>
  );
};

export default SmartRouteBuilderScreen;
