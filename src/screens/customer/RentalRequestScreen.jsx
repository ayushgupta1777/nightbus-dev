// ==================== src/screens/customer/RentalRequestScreen.jsx ====================
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  Bus, 
  MapPin, 
  Calendar, 
  Users, 
  CheckCircle2, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

const RentalRequestScreen = () => {
  const navigate = useNavigate();

  const [purpose, setPurpose] = useState('Wedding / Family Function');
  const [tripType, setTripType] = useState('round_trip'); // one_way, round_trip, multi_day
  const [source, setSource] = useState('Bhopal');
  const [destination, setDestination] = useState('Pachmarhi Hill Station');
  const [departureDate, setDepartureDate] = useState(
    new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
  );
  const [returnDate, setReturnDate] = useState(
    new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0]
  );
  const [requiredSeats, setRequiredSeats] = useState(40);
  const [busType, setBusType] = useState('AC Sleeper / Semi-Sleeper');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px 20px 80px' }}>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h1 style={{ fontSize: '1.45rem' }}>Full Bus Charter & Rental</h1>
          <span className="badge badge-indigo">Direct Bidding</span>
        </div>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          Rent entire buses directly from verified fleet owners for weddings, family tours, and corporate events.
        </p>
      </div>

      {submitted ? (
        <div className="glass-panel animate-fade-in" style={{ padding: '36px', textAlign: 'center' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.2)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
          }}>
            <CheckCircle2 size={32} color="#10b981" />
          </div>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Charter Request Broadcasted!</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
            Verified bus owners operating in the {source} - {destination} corridor have received your request and will submit their lowest quotes shortly.
          </p>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            Back to Home
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '28px' }}>
          {/* Trip Purpose */}
          <div className="form-group">
            <label className="form-label">Rental Event / Purpose</label>
            <select
              className="form-input"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
            >
              <option value="Wedding / Family Function">Wedding / Family Function</option>
              <option value="Pilgrimage & Religious Tour">Pilgrimage & Religious Tour</option>
              <option value="Corporate Retreat / Event">Corporate Retreat / Event</option>
              <option value="College / School Educational Tour">College / School Educational Tour</option>
              <option value="Private Group Holiday">Private Group Holiday</option>
            </select>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '16px',
          }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Pickup City</label>
              <input
                type="text"
                required
                className="form-input"
                value={source}
                onChange={(e) => setSource(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Destination City</label>
              <input
                type="text"
                required
                className="form-input"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
            marginBottom: '16px',
          }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Departure Date</label>
              <input
                type="date"
                required
                className="form-input"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Return Date</label>
              <input
                type="date"
                required
                className="form-input"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Passenger Capacity</label>
              <select
                className="form-input"
                value={requiredSeats}
                onChange={(e) => setRequiredSeats(Number(e.target.value))}
              >
                <option value={30}>30 Seater Mini Luxury</option>
                <option value={36}>36 Berth Sleeper (2+1)</option>
                <option value={40}>40 Berth Multi-Axle</option>
                <option value={50}>50 Seater Push-Back Coach</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <Sparkles size={18} />
            <span>Request Owner Quotations</span>
          </button>
        </form>
      )}
    </div>
  );
};

export default RentalRequestScreen;
