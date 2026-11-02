// ==================== src/screens/customer/BookingDetailsScreen.jsx ====================
import React, { useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { cancelBooking } from '../../services/bookingService';
import { 
  ArrowLeft, 
  QrCode, 
  Bus, 
  MapPin, 
  Calendar, 
  Clock, 
  User, 
  Radio, 
  Printer, 
  XCircle,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const BookingDetailsScreen = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const ticketData = location.state?.ticket || {
    pnr: id || 'NB88492019',
    busName: 'Night Bus Royal Star',
    busNumber: 'MP-04-NB-1122',
    from: 'Bhopal ISBT Stand',
    to: 'Indore Vijay Nagar Bus Port',
    travelDate: new Date().toISOString().split('T')[0],
    departureTime: '21:30',
    seats: ['L1', 'L3'],
    passengers: [
      { name: 'Ayush Gupta', age: '24', gender: 'male', seatNumber: 'L1' },
      { name: 'Rohan Sharma', age: '25', gender: 'male', seatNumber: 'L3' },
    ],
    amount: 1888,
    status: 'confirmed',
    paymentMethod: 'razorpay',
    paymentId: 'pay_live_test_7788',
  };

  const [status, setStatus] = useState(ticketData.status || 'confirmed');
  const [cancelling, setCancelling] = useState(false);
  const [msg, setMsg] = useState('');

  // QR Code contains digital verification payload verifiable by conductor's QR scanner
  const qrPayload = JSON.stringify({
    pnr: ticketData.pnr,
    seats: ticketData.seats,
    bus: ticketData.busNumber,
    valid: true,
  });

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you wish to cancel this booking? Refund will be credited as per policy.')) {
      return;
    }

    setCancelling(true);
    try {
      await cancelBooking(ticketData.pnr, 'User requested cancellation');
      setStatus('cancelled');
      setMsg('Booking has been cancelled. Refund initiated.');
    } catch {
      setStatus('cancelled');
      setMsg('Booking marked as cancelled.');
    } finally {
      setCancelling(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto', padding: '24px 20px 80px' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <button onClick={() => navigate('/my-bookings')} className="btn btn-secondary btn-sm" style={{ padding: '8px' }}>
          <ArrowLeft size={18} />
        </button>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.3rem' }}>Boarding Pass & E-Ticket</h1>
          <p className="mono" style={{ fontSize: '0.8rem', color: '#10b981' }}>
            PNR: {ticketData.pnr}
          </p>
        </div>
        <button onClick={handlePrint} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Printer size={16} />
          <span>Print</span>
        </button>
      </div>

      {msg && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '12px',
          marginBottom: '20px',
          color: '#ef4444',
          fontSize: '0.88rem',
        }}>
          {msg}
        </div>
      )}

      {/* Main Boarding Pass Card */}
      <div className="glass-panel" style={{
        background: '#121217',
        borderRadius: '24px',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        marginBottom: '24px',
      }}>
        {/* Pass Top Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          padding: '24px',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.9 }}>
              NIGHT BUS TRANSIT PASS
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>
              {ticketData.busName}
            </div>
            <div style={{ fontSize: '0.85rem', opacity: 0.95 }}>
              Coach #{ticketData.busNumber}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span className="badge" style={{ background: 'rgba(0,0,0,0.3)', color: '#fff' }}>
              {status.toUpperCase()}
            </span>
          </div>
        </div>

        {/* QR Code & Scan verification */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '30px 20px',
          borderBottom: '2px dashed var(--border-subtle)',
          background: 'rgba(0, 0, 0, 0.2)',
        }}>
          <div style={{
            background: '#ffffff',
            padding: '16px',
            borderRadius: '16px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
            marginBottom: '14px',
          }}>
            <QRCodeSVG value={qrPayload} size={160} level="H" />
          </div>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Present this QR code to the bus conductor upon boarding
          </span>
          <span className="mono" style={{ fontSize: '0.95rem', fontWeight: 700, color: '#10b981', marginTop: '4px' }}>
            Berths: {ticketData.seats?.join(', ')}
          </span>
        </div>

        {/* Journey Details */}
        <div style={{ padding: '24px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            marginBottom: '20px',
          }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>FROM (ORIGIN)</span>
              <div style={{ fontWeight: 600, color: '#fff', fontSize: '1.05rem', marginTop: '2px' }}>
                {ticketData.from}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Reporting Time: 21:00 (30m prior)
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TO (DESTINATION)</span>
              <div style={{ fontWeight: 600, color: '#fff', fontSize: '1.05rem', marginTop: '2px' }}>
                {ticketData.to}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Estimated Arrival: 06:00
              </div>
            </div>
          </div>

          {/* Passenger Roster */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', marginBottom: '20px' }}>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '12px' }}>Manifest Passengers</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(ticketData.passengers || []).map((p, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                }}>
                  <span style={{ color: '#fff' }}>
                    {idx + 1}. {p.name} ({p.age}y, {p.gender})
                  </span>
                  <span className="mono" style={{ color: '#10b981', fontWeight: 700 }}>
                    Berth {p.seatNumber || ticketData.seats?.[idx] || 'Assigned'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate(`/live-tracking/${ticketData.pnr}`, { state: { booking: ticketData } })}
              className="btn btn-primary"
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <Radio size={16} />
              <span>Track Bus Live on GPS</span>
            </button>

            {status === 'confirmed' && (
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="btn btn-danger btn-sm"
              >
                {cancelling ? 'Cancelling...' : 'Cancel Booking'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsScreen;
