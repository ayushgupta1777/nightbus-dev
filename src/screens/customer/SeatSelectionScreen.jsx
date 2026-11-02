// ==================== src/screens/customer/SeatSelectionScreen.jsx (EXACT MOBILE REPLICA) ====================
import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectSeats } from '../../store/slices/bookingSlice';
import { getBusDetails } from '../../services/journeyService';
import { 
  ArrowLeft, 
  Compass, 
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const SeatSelectionScreen = () => {
  const { busId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const from = searchParams.get('from') || 'Bhopal';
  const to = searchParams.get('to') || 'Indore';
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

  const selectedBus = useSelector((state) => state.journey.selectedBus) || {
    operatorName: 'Night Bus Royal Star',
    busType: 'AC Sleeper 2+1',
    fare: 899,
  };

  const [activeDeck, setActiveDeck] = useState('lower');
  const [selectedSeatList, setSelectedSeatList] = useState([]);
  const [bookedSeatNumbers, setBookedSeatNumbers] = useState(['L2', 'L5', 'U1', 'U7']);

  const lowerDeckSeats = [
    { number: 'L1', price: selectedBus.fare || 899, isLadies: false },
    { number: 'L2', price: selectedBus.fare || 899, isLadies: false },
    { number: 'L3', price: selectedBus.fare || 899, isLadies: true },
    { number: 'L4', price: selectedBus.fare || 899, isLadies: false },
    { number: 'L5', price: selectedBus.fare || 899, isLadies: false },
    { number: 'L6', price: selectedBus.fare || 899, isLadies: true },
    { number: 'L7', price: selectedBus.fare || 899, isLadies: false },
    { number: 'L8', price: selectedBus.fare || 899, isLadies: false },
    { number: 'L9', price: selectedBus.fare || 899, isLadies: false },
    { number: 'L10', price: selectedBus.fare || 899, isLadies: false },
    { number: 'L11', price: selectedBus.fare || 899, isLadies: false },
    { number: 'L12', price: selectedBus.fare || 899, isLadies: false },
  ];

  const upperDeckSeats = [
    { number: 'U1', price: (selectedBus.fare || 899) + 50, isLadies: false },
    { number: 'U2', price: (selectedBus.fare || 899) + 50, isLadies: false },
    { number: 'U3', price: (selectedBus.fare || 899) + 50, isLadies: true },
    { number: 'U4', price: (selectedBus.fare || 899) + 50, isLadies: false },
    { number: 'U5', price: (selectedBus.fare || 899) + 50, isLadies: false },
    { number: 'U6', price: (selectedBus.fare || 899) + 50, isLadies: true },
    { number: 'U7', price: (selectedBus.fare || 899) + 50, isLadies: false },
    { number: 'U8', price: (selectedBus.fare || 899) + 50, isLadies: false },
    { number: 'U9', price: (selectedBus.fare || 899) + 50, isLadies: false },
    { number: 'U10', price: (selectedBus.fare || 899) + 50, isLadies: false },
    { number: 'U11', price: (selectedBus.fare || 899) + 50, isLadies: false },
    { number: 'U12', price: (selectedBus.fare || 899) + 50, isLadies: false },
  ];

  const currentDeckSeats = activeDeck === 'lower' ? lowerDeckSeats : upperDeckSeats;

  const handleSeatClick = (seat) => {
    if (bookedSeatNumbers.includes(seat.number)) return;

    const isSelected = selectedSeatList.some((s) => s.number === seat.number);
    if (isSelected) {
      setSelectedSeatList(selectedSeatList.filter((s) => s.number !== seat.number));
    } else {
      if (selectedSeatList.length >= 6) {
        alert('Maximum 6 berths can be selected per booking.');
        return;
      }
      setSelectedSeatList([...selectedSeatList, seat]);
    }
  };

  const totalPrice = selectedSeatList.reduce((sum, s) => sum + s.price, 0);

  const handleProceed = () => {
    if (selectedSeatList.length === 0) {
      alert('Please select at least 1 berth to proceed.');
      return;
    }

    dispatch(selectSeats(selectedSeatList));
    navigate(`/passengers?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${date}&seats=${selectedSeatList.map((s) => s.number).join(',')}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', background: '#f8fafc' }}>
      {/* ─── Top Native Header ────────────────────────────────────────────── */}
      <div style={{
        background: '#ffffff',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #e2e8f0',
        position: 'sticky',
        top: 0,
        zIndex: 80,
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
        >
          <ArrowLeft size={22} color="#0f172a" />
        </button>
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', display: 'block' }}>
            Select Sleeper Berth
          </span>
          <span style={{ fontSize: '11px', color: '#64748b' }}>
            {selectedBus.operatorName || 'Night Bus'} • {from} ➔ {to}
          </span>
        </div>
        <div style={{ width: '22px' }} />
      </div>

      <div style={{ padding: '14px 16px 90px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Bus & Operator Transparency Card */}
        <div style={{
          background: '#ffffff',
          borderRadius: '14px',
          padding: '12px 14px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>{selectedBus.operatorName || 'Night Bus Royal Star'}</span>
              <span style={{ fontSize: '10px', background: '#ecfdf5', color: '#059669', padding: '1px 6px', borderRadius: '6px', fontWeight: 700 }}>
                ✓ Verified
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
              {selectedBus.busType || 'AC Sleeper (2+1)'} • Coach #{selectedBus.busNumber || 'MP-04-NB-1122'}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>Base Fare</span>
            <span style={{ fontSize: '16px', fontWeight: 800, color: '#10b981' }}>₹{selectedBus.fare || 899}</span>
          </div>
        </div>

        {/* Deck Switcher Pills */}
        <div style={{
          display: 'flex',
          background: '#e2e8f0',
          borderRadius: '12px',
          padding: '3px',
        }}>
          <button
            onClick={() => setActiveDeck('lower')}
            style={{
              flex: 1,
              background: activeDeck === 'lower' ? '#6366f1' : 'transparent',
              color: activeDeck === 'lower' ? '#ffffff' : '#475569',
              border: 'none',
              borderRadius: '9px',
              padding: '8px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Lower Deck
          </button>
          <button
            onClick={() => setActiveDeck('upper')}
            style={{
              flex: 1,
              background: activeDeck === 'upper' ? '#6366f1' : 'transparent',
              color: activeDeck === 'upper' ? '#ffffff' : '#475569',
              border: 'none',
              borderRadius: '9px',
              padding: '8px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Upper Deck
          </button>
        </div>

        {/* Legend */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-around',
          background: '#ffffff',
          borderRadius: '12px',
          padding: '10px 12px',
          border: '1px solid #f1f5f9',
          fontSize: '11px',
          fontWeight: 600,
          color: '#475569',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '16px', height: '22px', borderRadius: '4px', background: '#ffffff', border: '1.5px solid #cbd5e1' }} />
            <span>Available</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '16px', height: '22px', borderRadius: '4px', background: '#6366f1' }} />
            <span>Selected</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '16px', height: '22px', borderRadius: '4px', background: '#e2e8f0' }} />
            <span>Booked</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '16px', height: '22px', borderRadius: '4px', background: '#fdf2f8', border: '1.5px solid #f472b6' }} />
            <span>Ladies</span>
          </div>
        </div>

        {/* Bus Layout Cabin */}
        <div style={{
          background: '#ffffff',
          borderRadius: '24px',
          padding: '20px 16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}>
          {/* Driver Steering Row */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: '12px',
            borderBottom: '2px dashed #e2e8f0',
          }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Front Cabin
            </span>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#f1f5f9',
              border: '2px solid #cbd5e1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '9px',
              fontWeight: 800,
              color: '#475569',
            }}>
              STEER
            </div>
          </div>

          {/* Sleeper Layout Grid (2+1 format: Col 1, Col 2, Aisle, Col 3) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 20px 1fr',
            gap: '10px',
            alignItems: 'center',
          }}>
            {currentDeckSeats.map((seat, idx) => {
              const isBooked = bookedSeatNumbers.includes(seat.number);
              const isSelected = selectedSeatList.some((s) => s.number === seat.number);

              let bg = '#ffffff';
              let borderColor = '#cbd5e1';
              let color = '#0f172a';

              if (seat.isLadies) {
                bg = '#fdf2f8';
                borderColor = '#f472b6';
              }
              if (isBooked) {
                bg = '#f1f5f9';
                borderColor = '#e2e8f0';
                color = '#94a3b8';
              }
              if (isSelected) {
                bg = '#6366f1';
                borderColor = '#6366f1';
                color = '#ffffff';
              }

              return (
                <React.Fragment key={seat.number}>
                  {/* Insert empty aisle space before 3rd column */}
                  {idx % 3 === 2 && <div style={{ width: '20px' }} />}

                  <button
                    onClick={() => handleSeatClick(seat)}
                    disabled={isBooked}
                    style={{
                      height: '62px',
                      borderRadius: '8px',
                      background: bg,
                      border: `1.5px solid ${borderColor}`,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: isBooked ? 'not-allowed' : 'pointer',
                      boxShadow: isSelected ? '0 4px 10px rgba(99, 102, 241, 0.35)' : 'none',
                      transition: 'all 0.15s ease',
                      position: 'relative',
                    }}
                  >
                    {/* Pillow indicator */}
                    <div style={{
                      width: '60%',
                      height: '5px',
                      borderRadius: '3px',
                      background: isSelected ? 'rgba(255,255,255,0.4)' : '#e2e8f0',
                      marginBottom: '4px',
                    }} />
                    <span style={{ fontSize: '13px', fontWeight: 800, color }}>{seat.number}</span>
                    <span style={{ fontSize: '9px', fontWeight: 600, color: isSelected ? 'rgba(255,255,255,0.85)' : '#64748b' }}>
                      ₹{seat.price}
                    </span>
                  </button>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── Sticky Bottom Checkout Bar ──────────────────────────────────── */}
      {selectedSeatList.length > 0 && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: '#ffffff',
          borderTop: '1px solid #e2e8f0',
          padding: '12px 16px',
          boxShadow: '0 -4px 15px rgba(0, 0, 0, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 95,
        }}>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
              Berths: <strong style={{ color: '#6366f1' }}>{selectedSeatList.map((s) => s.number).join(', ')}</strong> ({selectedSeatList.length})
            </div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#10b981' }}>
              ₹{totalPrice}
            </div>
          </div>

          <button
            onClick={handleProceed}
            style={{
              background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 20px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
            }}
          >
            <span>Continue</span>
            <ArrowRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
};

export default SeatSelectionScreen;
