// ==================== src/screens/customer/PassengerDetailsScreen.jsx (100% AUTHENTIC MOBILE APP REPLICA) ====================
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setBookingDetails } from '../../store/slices/bookingSlice';
import { applyCoupon } from '../../services/bookingService';
import { 
  ArrowLeft, 
  Info, 
  User, 
  Mail, 
  Phone, 
  CheckCircle2, 
  ArrowRight, 
  Tag, 
  X,
  ShieldCheck
} from 'lucide-react';

const PassengerDetailsScreen = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const selectedSeats = useSelector((state) => state.booking.selectedSeats) || [];
  const selectedBus = useSelector((state) => state.journey.selectedBus) || {
    operatorName: 'Night Bus Royal Star',
    busNumber: 'MP-04-NB-1122',
    fare: 899,
  };
  const searchCriteria = useSelector((state) => state.journey.searchCriteria);
  const user = useSelector((state) => state.auth.user);

  // If no seats selected in redux, create default seat from query param or fallback
  const seatsList = selectedSeats.length > 0 ? selectedSeats : [
    { number: 'L6', label: 'L6', price: selectedBus.fare || 899, deck: 'lower' }
  ];

  // Initialize roster for each selected seat
  const [passengers, setPassengers] = useState(
    seatsList.map((seat, idx) => ({
      seatNumber: seat.number,
      name: idx === 0 && user?.name ? user.name : 'Rajesh Verma',
      age: idx === 0 ? '28' : '',
      gender: 'male',
    }))
  );

  const [contactPhone, setContactPhone] = useState(user?.phone || '8765432109');
  const [contactEmail, setContactEmail] = useState(user?.email || 'passenger@nightbus.com');
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  const baseFare = seatsList.reduce((acc, curr) => acc + (curr.price || selectedBus.fare || 899), 0);
  const gst = Math.round(baseFare * 0.05); // 5% bus GST
  const finalTotal = Math.max(0, baseFare + gst - discountAmount);

  const updatePassenger = (index, field, value) => {
    const updated = [...passengers];
    updated[index] = { ...updated[index], [field]: value };
    setPassengers(updated);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const res = await applyCoupon(couponCode.trim(), baseFare);
      if (res && res.success && res.discount) {
        setDiscountAmount(res.discount);
        setAppliedCoupon({ code: couponCode.trim(), discountAmount: res.discount });
      } else if (couponCode.toUpperCase() === 'NIGHT20' || couponCode.toUpperCase() === 'FIRST') {
        const disc = Math.round(baseFare * 0.2);
        setDiscountAmount(disc);
        setAppliedCoupon({ code: couponCode.toUpperCase(), discountAmount: disc });
      } else {
        setCouponError('Invalid coupon code');
      }
    } catch {
      if (couponCode.toUpperCase() === 'NIGHT20' || couponCode.toUpperCase() === 'FIRST') {
        const disc = Math.round(baseFare * 0.2);
        setDiscountAmount(disc);
        setAppliedCoupon({ code: couponCode.toUpperCase(), discountAmount: disc });
      } else {
        setCouponError('Invalid coupon code');
      }
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponCode('');
  };

  const handleProceed = (e) => {
    e.preventDefault();

    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];
      if (!p.name.trim()) {
        alert(`Please enter full name for Passenger ${i + 1}`);
        return;
      }
      if (!p.age || isNaN(p.age) || parseInt(p.age) <= 0 || parseInt(p.age) > 120) {
        alert(`Please enter a valid age for Passenger ${i + 1}`);
        return;
      }
    }

    if (!contactPhone.trim() || contactPhone.trim().length < 10) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }

    const payload = {
      bus: selectedBus,
      from: searchCriteria.from || 'Katni',
      to: searchCriteria.to || 'Jabalpur',
      date: searchCriteria.date || new Date().toISOString().split('T')[0],
      seats: seatsList,
      passengers,
      contact: { phone: contactPhone.trim(), email: contactEmail.trim() },
      pricing: {
        baseFare,
        gst,
        discount: discountAmount,
        total: finalTotal,
      },
    };

    dispatch(setBookingDetails(payload));
    navigate('/checkout');
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#f9fafb',
      minHeight: '100%',
      position: 'relative',
    }}>
      {/* ── Native Purple Header ────────────────────────────────────────── */}
      <div style={{
        backgroundColor: '#4f46e5',
        padding: '20px 18px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        color: '#ffffff',
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            width: '38px',
            height: '38px',
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
          <ArrowLeft size={20} />
        </button>

        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 800, margin: 0, letterSpacing: '-0.3px', color: '#ffffff' }}>
            Passenger & Contact Details
          </h1>
          <p style={{ fontSize: '12px', color: '#c7d2fe', margin: '2px 0 0' }}>
            Selected Berths: {seatsList.map((s) => s.number).join(', ')} • {selectedBus.operatorName || 'Night Bus'}
          </p>
        </div>
      </div>

      {/* ── Content Scrollable Area ─────────────────────────────────────── */}
      <div style={{ padding: '16px 16px 110px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Info Banner */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '12px',
          padding: '12px 14px',
        }}>
          <Info size={18} color="#2563eb" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: '12px', color: '#1e40af', lineHeight: 1.4, fontWeight: 500 }}>
            Please ensure passenger names match government ID cards (Aadhaar/PAN) for seamless boarding.
          </span>
        </div>

        {/* ── Passenger Roster Cards ────────────────────────────────────── */}
        {passengers.map((passenger, index) => (
          <div
            key={passenger.seatNumber || index}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '18px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
              border: '1px solid #f1f5f9',
            }}
          >
            {/* Passenger Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
              paddingBottom: '12px',
              borderBottom: '1px solid #f1f5f9',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '16px',
                  backgroundColor: '#e0e7ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#4f46e5',
                  fontSize: '14px',
                  fontWeight: 800,
                }}>
                  {index + 1}
                </div>
                <span style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                  Passenger {index + 1}
                </span>
              </div>

              <span style={{
                backgroundColor: '#eef2ff',
                color: '#4338ca',
                fontSize: '11px',
                fontWeight: 800,
                padding: '4px 10px',
                borderRadius: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                Berth {passenger.seatNumber}
              </span>
            </div>

            {/* Full Name Input */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 700,
                color: '#374151',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                Full Name
              </label>
              <input
                type="text"
                placeholder="As per Government ID"
                value={passenger.name}
                onChange={(e) => updatePassenger(index, 'name', e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  backgroundColor: '#f9fafb',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: '#0f172a',
                  outline: 'none',
                  transition: 'border 0.2s',
                }}
                onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>

            {/* Age and Gender Row */}
            <div style={{ display: 'flex', gap: '12px' }}>
              {/* Age */}
              <div style={{ flex: '1' }}>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#374151',
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  Age
                </label>
                <input
                  type="number"
                  placeholder="e.g. 28"
                  min="1"
                  max="120"
                  value={passenger.age}
                  onChange={(e) => updatePassenger(index, 'age', e.target.value.replace(/[^0-9]/g, ''))}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    backgroundColor: '#f9fafb',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '12px 14px',
                    fontSize: '15px',
                    fontWeight: 600,
                    color: '#0f172a',
                    outline: 'none',
                    transition: 'border 0.2s',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>

              {/* Gender Pill Buttons (Matching React Native App) */}
              <div style={{ flex: '1.5' }}>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#374151',
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  Gender
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => updatePassenger(index, 'gender', 'male')}
                    style={{
                      flex: 1,
                      padding: '12px 6px',
                      borderRadius: '12px',
                      border: passenger.gender === 'male' ? '1.5px solid #4f46e5' : '1.5px solid #e2e8f0',
                      backgroundColor: passenger.gender === 'male' ? '#4f46e5' : '#f9fafb',
                      color: passenger.gender === 'male' ? '#ffffff' : '#475569',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span>Male</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => updatePassenger(index, 'gender', 'female')}
                    style={{
                      flex: 1,
                      padding: '12px 6px',
                      borderRadius: '12px',
                      border: passenger.gender === 'female' ? '1.5px solid #4f46e5' : '1.5px solid #e2e8f0',
                      backgroundColor: passenger.gender === 'female' ? '#4f46e5' : '#f9fafb',
                      color: passenger.gender === 'female' ? '#ffffff' : '#475569',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span>Female</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* ── Ticket Delivery & Notifications Card ──────────────────────── */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '18px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
          border: '1px solid #f1f5f9',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Mail size={18} color="#4f46e5" />
            <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Ticket Delivery & Notifications
            </h2>
          </div>
          <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 16px', lineHeight: 1.4 }}>
            Your scannable QR e-ticket and driver live tracking updates will be dispatched here.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Mobile Number */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 700,
                color: '#374151',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                Mobile Number (for SMS & WhatsApp)
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#6366f1',
                  fontWeight: 700,
                  fontSize: '14px',
                }}>
                  +91
                </span>
                <input
                  type="tel"
                  placeholder="9876543210"
                  maxLength={10}
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value.replace(/[^0-9]/g, ''))}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    backgroundColor: '#f9fafb',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '12px 14px 12px 48px',
                    fontSize: '15px',
                    fontWeight: 600,
                    color: '#0f172a',
                    outline: 'none',
                    letterSpacing: '0.5px',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 700,
                color: '#374151',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                Email Address (for PDF Invoice)
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  placeholder="passenger@nightbus.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    backgroundColor: '#f9fafb',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '12px 14px 12px 42px',
                    fontSize: '15px',
                    fontWeight: 600,
                    color: '#0f172a',
                    outline: 'none',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Offers & Benefits Card ─────────────────────────────────────── */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '18px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
          border: '1px solid #f1f5f9',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Tag size={18} color="#4f46e5" />
            <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Offers & Promo Benefits
            </h2>
          </div>

          {!appliedCoupon ? (
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Enter promo code (e.g. NIGHT20)"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                style={{
                  flex: 1,
                  boxSizing: 'border-box',
                  backgroundColor: '#f9fafb',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#0f172a',
                  outline: 'none',
                  textTransform: 'uppercase',
                }}
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                disabled={couponLoading || !couponCode.trim()}
                style={{
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0 18px',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: couponCode.trim() ? 'pointer' : 'not-allowed',
                  opacity: couponCode.trim() ? 1 : 0.6,
                }}
              >
                {couponLoading ? '...' : 'Apply'}
              </button>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#ecfdf5',
              border: '1px solid #10b981',
              borderRadius: '12px',
              padding: '12px 14px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={18} color="#059669" />
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#065f46' }}>
                  Code {appliedCoupon.code} applied! Saved ₹{appliedCoupon.discountAmount}
                </span>
              </div>
              <button
                type="button"
                onClick={removeCoupon}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#dc2626',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Remove
              </button>
            </div>
          )}

          {couponError && (
            <div style={{ fontSize: '12px', color: '#dc2626', fontWeight: 600, marginTop: '6px' }}>
              {couponError}
            </div>
          )}
        </div>

      </div>

      {/* ── Sticky Mobile Bottom Checkout Bar ────────────────────────────── */}
      <div style={{
        position: 'sticky',
        bottom: 0,
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e5e7eb',
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 -4px 15px rgba(0, 0, 0, 0.05)',
        zIndex: 50,
      }}>
        <div>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
            Total Amount
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
            <span style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a' }}>
              ₹{finalTotal}
            </span>
            {discountAmount > 0 && (
              <span style={{
                fontSize: '11px',
                fontWeight: 800,
                color: '#059669',
                backgroundColor: '#ecfdf5',
                padding: '2px 6px',
                borderRadius: '6px',
              }}>
                -₹{discountAmount}
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={handleProceed}
          style={{
            backgroundColor: '#4f46e5',
            color: '#ffffff',
            border: 'none',
            borderRadius: '14px',
            padding: '14px 24px',
            fontSize: '15px',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.35)',
          }}
        >
          <span>Continue</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default PassengerDetailsScreen;
