// ==================== src/screens/customer/YatraDetailsScreen.jsx (100% AUTHENTIC MOBILE APP REPLICA) ====================
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getYatraPackageDetails, bookYatraPackage } from '../../services/yatraService';
import { RAZORPAY_KEY_ID } from '../../config';
import { addBooking } from '../../store/slices/bookingSlice';
import confetti from 'canvas-confetti';
import { 
  ArrowLeft, 
  Share2, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Utensils, 
  Bus, 
  CreditCard, 
  Wallet, 
  X, 
  Plus, 
  Trash2, 
  Info,
  Check,
  Star,
  FileText
} from 'lucide-react';

const SEEDED_PACKAGES = {
  yatra_01: {
    _id: 'yatra_01',
    title: 'Char Dham Deluxe Pilgrimage',
    category: 'religious',
    destinationCity: 'Badrinath & Kedarnath',
    departurePoint: { city: 'Haridwar', time: '06:00 AM', location: 'Haridwar Railway Station Gateway' },
    startDate: '2026-11-10',
    endDate: '2026-11-20',
    pricePerPerson: 18999,
    totalSeats: 30,
    bookedSeats: 22,
    images: [
      'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80'
    ],
    highlights: ['VIP Darshan Assist', 'AC Sleeper Coach', 'Helicopter Option', 'Pure Veg Meals', 'Tour Doctor on Board'],
    inclusions: [
      'Dedicated AC Sleeper Berths for entire trip',
      'Clean hotel & deluxe camp stays on twin/triple sharing',
      'All 3 daily Satvik meals (Pure Veg & Jain options)',
      'VIP Darshan priority coordination at shrines',
      'Medical first-aid & oxygen cylinder onboard',
    ],
    exclusions: [
      'Personal puja rituals & dakshina fees',
      'Pony or Palki porter charges on trek',
      'Personal laundry or extra snacks',
    ],
    itinerary: [
      { day: 1, title: 'Haridwar to Barkot', desc: 'Reporting at Haridwar ISBT by 06:00 AM. Scenic mountain transfer to Barkot via Mussoorie.' },
      { day: 2, title: 'Yamunotri Holy Darshan', desc: 'Early morning trek to Yamunotri shrine, holy bath in Surya Kund, and return to Barkot.' },
      { day: 3, title: 'Barkot to Uttarkashi', desc: 'Transfer to Uttarkashi. Evening Aarti at ancient Kashi Vishwanath temple.' },
      { day: 4, title: 'Gangotri Holy Pilgrimage', desc: 'Sacred drive along Bhagirathi river to Gangotri temple. Return to Uttarkashi for rest.' },
      { day: 5, title: 'Kedarnath Base Camp Transfer', desc: 'Drive to Guptkashi/Sonprayag. Health screening and prep for Kedarnath trek.' },
      { day: 6, title: 'Kedarnath Dham Darshan', desc: 'Trek or chopper to Kedarnath shrine. Evening attendance at divine Kedarnath Aarti.' },
      { day: 7, title: 'Badrinath Holy Shrine & Return', desc: 'Darshan at Badrinath temple, Mana village border visit, and scenic return descent to Haridwar.' },
    ],
    mealPlan: {
      type: '100% Satvik Pure Veg',
      breakfast: 'Poha, Idli, Tea, Fruits & Milk',
      lunch: 'Dal, Paneer, Sabzi, Roti, Rice & Sweet',
      dinner: 'Light Khichdi, Dal Tadka, Seasonal Veggies & Halwa',
      jainOption: 'Strict no-onion, no-garlic, root-free meals available on prior request.',
    },
  },
  yatra_02: {
    _id: 'yatra_02',
    title: 'Jyotirlinga Darshan Corridor',
    category: 'religious',
    destinationCity: 'Ujjain & Omkareshwar',
    departurePoint: { city: 'Indore', time: '07:30 AM', location: 'Vijay Nagar Bus Terminal' },
    startDate: '2026-11-15',
    endDate: '2026-11-19',
    pricePerPerson: 8999,
    totalSeats: 36,
    bookedSeats: 28,
    images: [
      'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?w=800&auto=format&fit=crop&q=80',
    ],
    highlights: ['Bhasma Aarti Access', 'Night Sleeper Berths', 'Temple Transfers', 'Jain Food Available'],
    inclusions: [
      'Overnight AC sleeper coach transport',
      'Assisted Bhasma Aarti queue entry pass',
      'Narmada River VIP Ghat boat cruise',
      'All Pure Veg Meals & Fresh refreshments',
    ],
    exclusions: ['Special VIP Abhishek pooja material tickets'],
    itinerary: [
      { day: 1, title: 'Indore to Ujjain & Mahakal Darshan', desc: 'Morning departure to Ujjain. Mahakaleshwar Jyotirlinga darshan & Mahakal Lok corridor tour.' },
      { day: 2, title: 'Early Morning Bhasma Aarti', desc: '03:30 AM sacred Bhasma Aarti at Mahakal. Transfer to Omkareshwar island.' },
      { day: 3, title: 'Omkareshwar & Mamleshwar Darshan', desc: 'Narmada river Parikrama, Omkareshwar darshan, and night return to Indore.' },
    ],
    mealPlan: {
      type: '100% Pure Satvik',
      breakfast: 'Poha, Jalebi & Masala Tea',
      lunch: 'Dal Bafla, Ladoos & Ghee rice',
      dinner: 'Khichdi, Kadhi & Rotis',
      jainOption: 'Jain food available across all stops.',
    },
  },
};

const YatraDetailsScreen = () => {
  const { packageId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth.user);
  const walletBalance = useSelector((state) => state.wallet.balance);

  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'itinerary' | 'meals'
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  // Booking Form State
  const [passengers, setPassengers] = useState([
    { name: user?.name || 'Rajesh Verma', age: '28', gender: 'male', idProofType: 'Aadhaar', idNumber: 'XXXX-XXXX-9012' },
  ]);
  const [contactPhone, setContactPhone] = useState(user?.phone || '8765432109');
  const [mealPreference, setMealPreference] = useState('veg'); // 'veg' | 'jain'
  const [needAssistance, setNeedAssistance] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('online'); // 'online' | 'wallet'

  useEffect(() => {
    loadDetails();
  }, [packageId]);

  const loadDetails = async () => {
    setLoading(true);
    try {
      const res = await getYatraPackageDetails(packageId);
      if (res && res.success && res.data) {
        setPkg(res.data);
      } else {
        setPkg(SEEDED_PACKAGES[packageId] || SEEDED_PACKAGES['yatra_01']);
      }
    } catch {
      setPkg(SEEDED_PACKAGES[packageId] || SEEDED_PACKAGES['yatra_01']);
    } finally {
      setLoading(false);
    }
  };

  const addPassenger = () => {
    if (passengers.length >= 6) {
      alert('Maximum 6 pilgrims per booking');
      return;
    }
    setPassengers([
      ...passengers,
      { name: '', age: '', gender: 'male', idProofType: 'Aadhaar', idNumber: '' },
    ]);
  };

  const removePassenger = (index) => {
    if (passengers.length === 1) return;
    setPassengers(passengers.filter((_, idx) => idx !== index));
  };

  const updatePassenger = (index, field, value) => {
    const updated = [...passengers];
    updated[index] = { ...updated[index], [field]: value };
    setPassengers(updated);
  };

  const triggerConfetti = () => {
    try {
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
    } catch (e) {}
  };

  const handleConfirmYatraBooking = async () => {
    for (let i = 0; i < passengers.length; i++) {
      if (!passengers[i].name.trim()) {
        alert(`Please enter name for Pilgrim ${i + 1}`);
        return;
      }
      if (!passengers[i].age || isNaN(passengers[i].age)) {
        alert(`Please enter valid age for Pilgrim ${i + 1}`);
        return;
      }
    }

    setBookingLoading(true);

    const totalAmount = pkg.pricePerPerson * passengers.length;
    const pnrNumber = 'YT' + Math.floor(10000000 + Math.random() * 90000000);

    const bookingPayload = {
      pnr: pnrNumber,
      isYatra: true,
      packageId: pkg._id,
      title: pkg.title,
      destinationCity: pkg.destinationCity,
      departurePoint: pkg.departurePoint,
      startDate: pkg.startDate,
      endDate: pkg.endDate,
      passengers,
      contact: { phone: contactPhone },
      mealPreference,
      needAssistance,
      amount: totalAmount,
      paymentMethod,
      paymentStatus: 'paid',
      paymentId: 'pay_yatra_' + Date.now(),
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };

    // If online Razorpay selected
    if (paymentMethod === 'online' && typeof window !== 'undefined' && window.Razorpay) {
      try {
        const options = {
          key: RAZORPAY_KEY_ID,
          amount: totalAmount * 100,
          currency: 'INR',
          name: 'Night Bus Yatra Corridors',
          description: `${pkg.title} (${passengers.length} Pilgrims)`,
          image: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png',
          prefill: {
            name: passengers[0].name,
            contact: contactPhone,
          },
          theme: { color: '#4f46e5' },
          handler: async function (response) {
            bookingPayload.paymentId = response.razorpay_payment_id;
            try {
              await bookYatraPackage(bookingPayload);
            } catch (e) {}
            dispatch(addBooking(bookingPayload));
            setBookingSuccess(bookingPayload);
            setShowBookingModal(false);
            setBookingLoading(false);
            triggerConfetti();
          },
          modal: {
            ondismiss: function () {
              setBookingLoading(false);
            },
          },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
        return;
      } catch (err) {
        console.warn('Razorpay open fallback:', err);
      }
    }

    // Direct simulated confirmation
    setTimeout(async () => {
      try {
        await bookYatraPackage(bookingPayload);
      } catch (e) {}
      dispatch(addBooking(bookingPayload));
      setBookingSuccess(bookingPayload);
      setShowBookingModal(false);
      setBookingLoading(false);
      triggerConfetti();
    }, 800);
  };

  if (loading || !pkg) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
        Loading spiritual tour details...
      </div>
    );
  }

  // ── Success Confirmation Screen ─────────────────────────────────────────
  if (bookingSuccess) {
    return (
      <div style={{
        padding: '24px 16px',
        minHeight: '100%',
        backgroundColor: '#f9fafb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          padding: '28px 20px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          width: '100%',
          maxWidth: '380px',
          textAlign: 'center',
          border: '1px solid #f1f5f9',
        }}>
          <div style={{
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            backgroundColor: '#ecfdf5',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
          }}>
            <CheckCircle2 size={38} color="#059669" />
          </div>

          <h1 style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', margin: '0 0 6px' }}>
            Yatra Tour Booked! 🛕
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 20px' }}>
            Your divine pilgrimage tour has been reserved.
          </p>

          <div style={{
            backgroundColor: '#f8fafc',
            border: '1.5px dashed #cbd5e1',
            borderRadius: '16px',
            padding: '16px',
            textAlign: 'left',
            marginBottom: '20px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>YATRA PNR</span>
              <span style={{ fontSize: '15px', fontWeight: 900, color: '#4f46e5' }}>{bookingSuccess.pnr}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>TOUR</span>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>{bookingSuccess.title}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>PILGRIMS</span>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>{bookingSuccess.passengers.length} Pilgrim(s)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 700 }}>Total Paid</span>
              <span style={{ fontSize: '16px', fontWeight: 900, color: '#059669' }}>₹{bookingSuccess.amount}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/my-bookings')}
            style={{
              width: '100%',
              backgroundColor: '#4f46e5',
              color: '#ffffff',
              border: 'none',
              borderRadius: '14px',
              padding: '14px',
              fontSize: '14px',
              fontWeight: 800,
              cursor: 'pointer',
              marginBottom: '10px',
            }}
          >
            View in My Bookings
          </button>

          <button
            onClick={() => navigate('/yatra')}
            style={{
              width: '100%',
              backgroundColor: 'transparent',
              color: '#64748b',
              border: 'none',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              padding: '8px',
            }}
          >
            Back to Yatra List
          </button>
        </div>
      </div>
    );
  }

  const totalAmount = pkg.pricePerPerson * passengers.length;
  const seatsLeft = pkg.totalSeats - (pkg.bookedSeats || 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#f9fafb', minHeight: '100%', position: 'relative' }}>
      
      {/* ── Native Purple Header with Back & Share ──────────────────────── */}
      <div style={{
        position: 'sticky',
        top: 0,
        backgroundColor: '#4f46e5',
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        color: '#ffffff',
        zIndex: 40,
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => navigate('/yatra')}
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
            <h1 style={{ fontSize: '16px', fontWeight: 900, margin: 0, color: '#ffffff' }}>
              Tour Details
            </h1>
            <p style={{ fontSize: '11px', color: '#c7d2fe', margin: '2px 0 0' }}>
              {pkg.destinationCity}
            </p>
          </div>
        </div>

        <button
          onClick={() => alert(`Link copied: Share ${pkg.title} with your spiritual group!`)}
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
          <Share2 size={16} />
        </button>
      </div>

      {/* ── Hero Image with Overlay ─────────────────────────────────────── */}
      <div style={{ position: 'relative', height: '210px', width: '100%', overflow: 'hidden' }}>
        <img
          src={pkg.images?.[0] || 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=800&auto=format&fit=crop&q=80'}
          alt={pkg.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.8) 100%)',
        }} />

        <div style={{ position: 'absolute', bottom: '16px', left: '16px', right: '16px' }}>
          <span style={{
            backgroundColor: '#4f46e5',
            color: '#ffffff',
            padding: '3px 8px',
            borderRadius: '6px',
            fontSize: '10px',
            fontWeight: 800,
            textTransform: 'uppercase',
          }}>
            {pkg.category === 'religious' ? '🕌 Sacred Pilgrimage' : '✨ Special Tour'}
          </span>
          <h2 style={{ color: '#ffffff', fontSize: '19px', fontWeight: 900, margin: '6px 0 2px' }}>
            {pkg.title}
          </h2>
          <div style={{ color: '#cbd5e1', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>{pkg.destinationCity}</span>
            <span>•</span>
            <span>{seatsLeft} Berths Left</span>
          </div>
        </div>
      </div>

      {/* ── Segmented Navigation Tabs ───────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        backgroundColor: '#ffffff',
        padding: '6px 16px',
        borderBottom: '1px solid #e2e8f0',
        position: 'sticky',
        top: '64px',
        zIndex: 30,
      }}>
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'itinerary', label: 'Itinerary' },
          { key: 'meals', label: 'Meals & Stay' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '10px 4px',
              border: 'none',
              background: 'transparent',
              fontSize: '13px',
              fontWeight: 800,
              color: activeTab === tab.key ? '#4f46e5' : '#64748b',
              borderBottom: activeTab === tab.key ? '2.5px solid #4f46e5' : '2.5px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab Content Area ────────────────────────────────────────────── */}
      <div style={{ padding: '16px 16px 120px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <>
            {/* Quick Summary Card */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              border: '1px solid #f1f5f9',
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Calendar size={18} color="#6366f1" />
                  <div>
                    <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Dates</div>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a' }}>{pkg.startDate}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Clock size={18} color="#f59e0b" />
                  <div>
                    <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Departure</div>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a' }}>{pkg.departurePoint?.time || '06:00 AM'}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <MapPin size={18} color="#ef4444" />
                  <div>
                    <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Boarding Point</div>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a' }}>{pkg.departurePoint?.city}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Bus size={18} color="#10b981" />
                  <div>
                    <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Coach Type</div>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a' }}>AC Sleeper 2+1</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Inclusions Card */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              border: '1px solid #f1f5f9',
            }}>
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', margin: '0 0 12px' }}>
                ✓ What's Included in Package
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(pkg.inclusions || []).map((inc, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: '#334155' }}>
                    <CheckCircle2 size={16} color="#059669" style={{ flexShrink: 0, marginTop: '1px' }} />
                    <span>{inc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Exclusions Card */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              border: '1px solid #f1f5f9',
            }}>
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', margin: '0 0 12px' }}>
                ✕ Not Included
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(pkg.exclusions || []).map((exc, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: '#64748b' }}>
                    <X size={15} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{exc}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ITINERARY TAB */}
        {activeTab === 'itinerary' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {(pkg.itinerary || []).map((dayPlan, idx) => (
              <div key={idx} style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                borderLeft: '4px solid #4f46e5',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{
                    backgroundColor: '#e0e7ff',
                    color: '#4338ca',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 800,
                  }}>
                    Day {dayPlan.day}
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                    {dayPlan.title}
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '6px 0 0', lineHeight: 1.5 }}>
                  {dayPlan.desc}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* MEALS & STAY TAB */}
        {activeTab === 'meals' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{
              backgroundColor: '#ecfdf5',
              borderRadius: '16px',
              padding: '16px',
              border: '1px solid #a7f3d0',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Utensils size={18} color="#059669" />
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#065f46' }}>
                  {pkg.mealPlan?.type || '100% Satvik Pure Veg Meals'}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#047857', margin: 0 }}>
                Freshly prepared hygienic vegetarian meals served throughout the journey.
              </p>
            </div>

            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}>
              <h3 style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', margin: '0 0 10px' }}>Daily Meal Schedule</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
                <div>
                  <span style={{ fontWeight: 800, color: '#4f46e5' }}>Breakfast: </span>
                  <span style={{ color: '#475569' }}>{pkg.mealPlan?.breakfast || 'Poha, Idli, Tea, Fruits'}</span>
                </div>
                <div>
                  <span style={{ fontWeight: 800, color: '#4f46e5' }}>Lunch: </span>
                  <span style={{ color: '#475569' }}>{pkg.mealPlan?.lunch || 'Dal, Seasonal Sabzi, Roti, Rice & Sweet'}</span>
                </div>
                <div>
                  <span style={{ fontWeight: 800, color: '#4f46e5' }}>Dinner: </span>
                  <span style={{ color: '#475569' }}>{pkg.mealPlan?.dinner || 'Satvik Khichdi, Veggies & Warm Milk'}</span>
                </div>
              </div>
            </div>

            <div style={{
              backgroundColor: '#fffbeb',
              borderRadius: '16px',
              padding: '14px',
              border: '1px solid #fde68a',
            }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#92400e', marginBottom: '4px' }}>
                Jain Food Protocol
              </div>
              <div style={{ fontSize: '11px', color: '#b45309' }}>
                {pkg.mealPlan?.jainOption || 'Special Jain meal prep without onion, garlic or root crops available. Select Jain in booking.'}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ── Sticky Bottom Action Bar ─────────────────────────────────────── */}
      <div style={{
        position: 'sticky',
        bottom: 0,
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e5e7eb',
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 -4px 15px rgba(0,0,0,0.05)',
        zIndex: 50,
      }}>
        <div>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
            Price Per Pilgrim
          </div>
          <div style={{ fontSize: '20px', fontWeight: 900, color: '#059669' }}>
            ₹{pkg.pricePerPerson?.toLocaleString()}
          </div>
        </div>

        <button
          onClick={() => setShowBookingModal(true)}
          style={{
            backgroundColor: '#4f46e5',
            color: '#ffffff',
            border: 'none',
            borderRadius: '14px',
            padding: '14px 26px',
            fontSize: '14px',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.35)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Sparkles size={16} />
          <span>Book Yatra Package</span>
        </button>
      </div>

      {/* ── Interactive Booking Sheet Modal ──────────────────────────────── */}
      {showBookingModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.65)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            width: '100%',
            maxWidth: '430px',
            borderTopLeftRadius: '28px',
            borderTopRightRadius: '28px',
            maxHeight: '85vh',
            overflowY: 'auto',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                  Yatra Reservation
                </h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  {pkg.title}
                </span>
              </div>
              <button
                onClick={() => setShowBookingModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} color="#64748b" />
              </button>
            </div>

            {/* Pilgrims Count Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                Pilgrim Manifest ({passengers.length})
              </span>
              <button
                type="button"
                onClick={addPassenger}
                style={{
                  backgroundColor: '#eef2ff',
                  color: '#4f46e5',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px 10px',
                  fontSize: '11px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                }}
              >
                <Plus size={13} />
                <span>Add Pilgrim</span>
              </button>
            </div>

            {/* Pilgrims Inputs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {passengers.map((p, idx) => (
                <div key={idx} style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '14px',
                  padding: '12px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#4f46e5' }}>
                      Pilgrim #{idx + 1}
                    </span>
                    {passengers.length > 1 && (
                      <button
                        onClick={() => removePassenger(idx)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    placeholder="Full Name (as per ID)"
                    value={p.name}
                    onChange={(e) => updatePassenger(idx, 'name', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      marginBottom: '8px',
                      boxSizing: 'border-box',
                    }}
                  />

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '8px' }}>
                    <input
                      type="number"
                      placeholder="Age"
                      value={p.age}
                      onChange={(e) => updatePassenger(idx, 'age', e.target.value)}
                      style={{
                        padding: '8px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                      }}
                    />

                    {/* Gender Pills */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                      {['male', 'female'].map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => updatePassenger(idx, 'gender', g)}
                          style={{
                            padding: '6px',
                            borderRadius: '8px',
                            border: 'none',
                            fontSize: '11px',
                            fontWeight: 800,
                            textTransform: 'capitalize',
                            backgroundColor: p.gender === g ? '#4f46e5' : '#e2e8f0',
                            color: p.gender === g ? '#ffffff' : '#475569',
                            cursor: 'pointer',
                          }}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Meal Preference Toggle */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
                Satvik Meal Preference
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setMealPreference('veg')}
                  style={{
                    padding: '8px',
                    borderRadius: '10px',
                    border: mealPreference === 'veg' ? '1.5px solid #059669' : '1px solid #e2e8f0',
                    backgroundColor: mealPreference === 'veg' ? '#ecfdf5' : '#ffffff',
                    color: mealPreference === 'veg' ? '#059669' : '#64748b',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  Pure Veg (Satvik)
                </button>

                <button
                  type="button"
                  onClick={() => setMealPreference('jain')}
                  style={{
                    padding: '8px',
                    borderRadius: '10px',
                    border: mealPreference === 'jain' ? '1.5px solid #059669' : '1px solid #e2e8f0',
                    backgroundColor: mealPreference === 'jain' ? '#ecfdf5' : '#ffffff',
                    color: mealPreference === 'jain' ? '#059669' : '#64748b',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  Jain Food (No Roots)
                </button>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
                Payment Method
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div
                  onClick={() => setPaymentMethod('online')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: paymentMethod === 'online' ? '1.5px solid #4f46e5' : '1px solid #e2e8f0',
                    backgroundColor: paymentMethod === 'online' ? '#eef2ff' : '#ffffff',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CreditCard size={18} color="#4f46e5" />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>Razorpay Online Gateway</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>UPI, Cards, NetBanking (Test Key Active)</div>
                    </div>
                  </div>
                  <input type="radio" checked={paymentMethod === 'online'} readOnly style={{ accentColor: '#4f46e5' }} />
                </div>

                <div
                  onClick={() => setPaymentMethod('wallet')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: paymentMethod === 'wallet' ? '1.5px solid #4f46e5' : '1px solid #e2e8f0',
                    backgroundColor: paymentMethod === 'wallet' ? '#eef2ff' : '#ffffff',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Wallet size={18} color="#4f46e5" />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>Night Bus Wallet</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Available: ₹{walletBalance}</div>
                    </div>
                  </div>
                  <input type="radio" checked={paymentMethod === 'wallet'} readOnly style={{ accentColor: '#4f46e5' }} />
                </div>
              </div>
            </div>

            {/* Total Summary & Confirm Button */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '10px',
              borderTop: '1px solid #e2e8f0',
            }}>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>TOTAL AMOUNT</div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a' }}>₹{totalAmount.toLocaleString()}</div>
              </div>

              <button
                type="button"
                disabled={bookingLoading}
                onClick={handleConfirmYatraBooking}
                style={{
                  backgroundColor: '#4f46e5',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 22px',
                  fontSize: '14px',
                  fontWeight: 800,
                  cursor: bookingLoading ? 'not-allowed' : 'pointer',
                  opacity: bookingLoading ? 0.7 : 1,
                  boxShadow: '0 4px 12px rgba(79, 70, 229, 0.35)',
                }}
              >
                {bookingLoading ? 'Processing...' : 'Pay & Reserve'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default YatraDetailsScreen;
