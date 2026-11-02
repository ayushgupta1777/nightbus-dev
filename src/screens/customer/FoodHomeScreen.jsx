// ==================== src/screens/customer/FoodHomeScreen.jsx ====================
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  UtensilsCrossed, 
  Plus, 
  Minus, 
  ShoppingBag, 
  CheckCircle2, 
  MapPin, 
  Clock, 
  Star,
  Bus,
  ShieldCheck,
  Phone,
  ArrowLeft,
  Navigation,
  ChevronRight,
  Info,
  Sparkles,
  Coffee,
  X
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
    haltPoint: {
      name: 'Sihora Highway Food Plaza',
      highway: 'NH-30 Katni - Jabalpur Corridor',
      time: '22:45',
      duration: '25 min halt',
      status: 'Halt in ~15 mins',
      rating: '4.9',
      fssai: 'FSSAI Lic: 104230008912',
    }
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
    seats: ['L1'],
    passengers: [{ name: 'Rajesh Verma', age: '28', gender: 'male', seatNumber: 'L1' }],
    amount: 1888,
    status: 'confirmed',
    haltPoint: {
      name: 'Ashta Highway Food Mall',
      highway: 'SH-18 Bhopal - Indore Corridor',
      time: '23:45',
      duration: '20 min halt',
      status: 'Halt in ~45 mins',
      rating: '4.8',
      fssai: 'FSSAI Lic: 104210007421',
    }
  },
];

const MENU_CATEGORIES = ['All Items', 'Thalis & Combos', 'Biryani & Rice', 'Hot Chai & Snacks', 'Desserts'];

const HIGHWAY_MENU = [
  { 
    id: 'f1', 
    name: 'Deluxe Paneer Thali', 
    category: 'Thalis & Combos', 
    price: 180, 
    rating: 4.8, 
    reviews: 142, 
    isVeg: true, 
    tag: 'Bestseller',
    desc: 'Paneer butter masala, dal fry, 4 butter tawa rotis, jeera rice, gulab jamun, salad & pickle.' 
  },
  { 
    id: 'f2', 
    name: 'Dhaba Dal Makhani & Jeera Rice Combo', 
    category: 'Thalis & Combos', 
    price: 140, 
    rating: 4.7, 
    reviews: 98, 
    isVeg: true, 
    tag: 'Popular',
    desc: 'Slow cooked black lentils with white butter, served with fragrant cumin basmati rice and roasted papad.' 
  },
  { 
    id: 'f3', 
    name: 'Hyderabadi Veg Dum Biryani Handi', 
    category: 'Biryani & Rice', 
    price: 160, 
    rating: 4.9, 
    reviews: 188, 
    isVeg: true, 
    tag: 'Chef Special',
    desc: 'Layered saffron basmati rice with marinated vegetables, served with cucumber raita and spicy salan.' 
  },
  { 
    id: 'f4', 
    name: 'Amritsari Chole & Fluffy Bhature (2 Pcs)', 
    category: 'Thalis & Combos', 
    price: 130, 
    rating: 4.6, 
    reviews: 76, 
    isVeg: true, 
    desc: 'Spiced Pindi chickpeas simmered with aromatic spices, served with two fresh balloon bhaturas and pickled onions.' 
  },
  { 
    id: 'f5', 
    name: 'Fresh Paneer Pakoda Plate (6 Pcs)', 
    category: 'Hot Chai & Snacks', 
    price: 90, 
    rating: 4.7, 
    reviews: 110, 
    isVeg: true, 
    desc: 'Crispy gram flour battered fresh cottage cheese fritters dusted with chaat masala & mint-coriander chutney.' 
  },
  { 
    id: 'f6', 
    name: 'Kulhad Masala Adrak Chai (2 Cups)', 
    category: 'Hot Chai & Snacks', 
    price: 50, 
    rating: 4.9, 
    reviews: 260, 
    isVeg: true, 
    tag: 'Night Bus Must-Have',
    desc: 'Fresh crushed ginger, green cardamom and whole spices brewed in milk, served boiling hot in clay earthen kulhads.' 
  },
  { 
    id: 'f7', 
    name: 'Hot Gulab Jamun (2 Pieces)', 
    category: 'Desserts', 
    price: 50, 
    rating: 4.8, 
    reviews: 64, 
    isVeg: true, 
    desc: 'Warm khoya dumplings soaked in rose and green cardamom scented sugar syrup.' 
  },
];

const FoodHomeScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Active Ticket & Passenger State
  const [activeBooking, setActiveBooking] = useState(SEEDED_DEFAULT_BOOKINGS[0]);
  const [showSwitchTicketModal, setShowSwitchTicketModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All Items');

  // Cart & Ordering State
  const [cart, setCart] = useState({});
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('berth_cash');
  const [cookingInstructions, setCookingInstructions] = useState('');
  const [passengerPhone, setPassengerPhone] = useState('+91 98261 44521');
  const [ordered, setOrdered] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState('');

  // 1. Resolve Active Booking Context
  useEffect(() => {
    let resolved = location.state?.booking;

    if (!resolved) {
      try {
        const stored = localStorage.getItem('user_bookings');
        if (stored) {
          const list = JSON.parse(stored);
          if (Array.isArray(list) && list.length > 0) {
            resolved = list[0];
          }
        }
      } catch {
        // fallback
      }
    }

    if (!resolved) {
      resolved = SEEDED_DEFAULT_BOOKINGS[0];
    }

    // Attach verified halt point if missing
    if (!resolved.haltPoint) {
      const match = SEEDED_DEFAULT_BOOKINGS.find(
        (b) => b.from?.toLowerCase() === resolved.from?.toLowerCase()
      );
      resolved.haltPoint = match ? match.haltPoint : SEEDED_DEFAULT_BOOKINGS[0].haltPoint;
    }

    setActiveBooking(resolved);
  }, [location.state]);

  const addToCart = (id) => {
    setCart((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  const removeFromCart = (id) => {
    setCart((prev) => {
      const copy = { ...prev };
      if (copy[id] > 1) {
        copy[id] -= 1;
      } else {
        delete copy[id];
      }
      return copy;
    });
  };

  const cartItemsCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const cartTotal = Object.entries(cart).reduce((acc, [id, qty]) => {
    const item = HIGHWAY_MENU.find((m) => m.id === id);
    return acc + (item?.price || 0) * qty;
  }, 0);

  const handleConfirmOrder = () => {
    const orderId = 'NB-FD-' + Math.floor(100000 + Math.random() * 900000);
    setPlacedOrderId(orderId);
    setShowCheckoutModal(false);
    setOrdered(true);
  };

  const filteredMenu = selectedCategory === 'All Items'
    ? HIGHWAY_MENU
    : HIGHWAY_MENU.filter((m) => m.category === selectedCategory);

  const primarySeat = activeBooking?.seats?.[0] || 'L6';
  const passengerName = activeBooking?.passengers?.[0]?.name || 'Rajesh Verma';
  const halt = activeBooking?.haltPoint || SEEDED_DEFAULT_BOOKINGS[0].haltPoint;

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100%', paddingBottom: cartItemsCount > 0 ? '110px' : '40px' }}>
      
      {/* ── Top Header Bar ─────────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
        color: '#ffffff',
        padding: '16px 16px 20px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => navigate(-1)}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: 'none',
                borderRadius: '10px',
                color: '#ffffff',
                width: '34px',
                height: '34px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 900, letterSpacing: '0.2px' }}>
                Highway Berth Food Delivery
              </div>
              <div style={{ fontSize: '11px', color: '#cbd5e1' }}>
                Hot Dhaba Meals Hand-Delivered To Your Sleeper Berth
              </div>
            </div>
          </div>

          <span style={{
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
            color: '#10b981',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: 800,
            padding: '4px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}>
            <ShieldCheck size={13} />
            FSSAI Verified
          </span>
        </div>

        {/* ── ACTIVE TICKET & BERTH CONTEXT CARD (Exclusive for booked route) ── */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '14px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          padding: '12px 14px',
          backdropFilter: 'blur(10px)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
                boxShadow: '0 0 8px #10b981',
              }} />
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#a7f3d0', textTransform: 'uppercase' }}>
                Active Route Ticket Verified
              </span>
            </div>

            <button
              onClick={() => setShowSwitchTicketModal(true)}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                color: '#ffffff',
                borderRadius: '8px',
                padding: '3px 8px',
                fontSize: '10px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Switch Ticket / Berth
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 900, color: '#ffffff' }}>
                {activeBooking?.from} → {activeBooking?.to}
              </div>
              <div style={{ fontSize: '11px', color: '#cbd5e1' }}>
                {activeBooking?.busName} • {activeBooking?.busNumber}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '10px', color: '#cbd5e1', fontWeight: 700 }}>DELIVERY BERTH</div>
              <div style={{
                fontSize: '15px',
                fontWeight: 900,
                color: '#34d399',
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                padding: '2px 8px',
                borderRadius: '6px',
                display: 'inline-block',
              }}>
                Berth {primarySeat}
              </div>
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>{passengerName}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT AREA ────────────────────────────────────────────────── */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* ── HIGHWAY HALT REST STOP BANNER (Clean High-Contrast) ────────────── */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '14px 16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: '#fef3c7',
                color: '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <UtensilsCrossed size={22} />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 800, color: '#d97706', textTransform: 'uppercase' }}>
                    SCHEDULED DELIVERY REST STOP
                  </span>
                  <span style={{
                    backgroundColor: '#ecfdf5',
                    color: '#059669',
                    fontSize: '9px',
                    fontWeight: 800,
                    padding: '2px 6px',
                    borderRadius: '6px',
                  }}>
                    {halt.status}
                  </span>
                </div>

                {/* High Contrast Visible Name */}
                <div style={{ fontSize: '15px', fontWeight: 900, color: '#0f172a', margin: '2px 0' }}>
                  {halt.name}
                </div>
                <div style={{ fontSize: '11px', color: '#475569' }}>
                  {halt.highway} • Halt time: <strong style={{ color: '#0f172a' }}>{halt.time}</strong> ({halt.duration})
                </div>
              </div>
            </div>

            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '6px 8px',
              textAlign: 'center',
              flexShrink: 0,
            }}>
              <div style={{ fontSize: '11px', fontWeight: 900, color: '#059669', display: 'flex', alignItems: 'center', gap: '3px', justifyContent: 'center' }}>
                <Star size={11} fill="#059669" /> {halt.rating}
              </div>
              <div style={{ fontSize: '9px', color: '#64748b', fontWeight: 700 }}>Halt Rating</div>
            </div>
          </div>

          <div style={{
            marginTop: '12px',
            paddingTop: '10px',
            borderTop: '1px dashed #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '11px',
            color: '#64748b',
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Clock size={13} color="#4f46e5" /> Orders close 10m before bus halts
            </span>
            <span style={{ fontWeight: 700, color: '#0f172a' }}>
              Handover directly inside bus at Berth {primarySeat}
            </span>
          </div>
        </div>

        {/* ── ORDER SUCCESS SCREEN ───────────────────────────────────────────── */}
        {ordered ? (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            border: '1px solid #e2e8f0',
            padding: '24px 20px',
            textAlign: 'center',
            boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#ecfdf5',
              color: '#059669',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
            }}>
              <CheckCircle2 size={36} />
            </div>

            <div style={{ fontSize: '12px', fontWeight: 800, color: '#059669', textTransform: 'uppercase' }}>
              ORDER DISPATCHED TO HIGHWAY KITCHEN
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', margin: '6px 0 10px' }}>
              Meal Confirmed for Berth {primarySeat}!
            </h2>
            <div style={{
              display: 'inline-block',
              backgroundColor: '#f1f5f9',
              padding: '4px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 800,
              color: '#334155',
              marginBottom: '16px',
            }}>
              Order ID: {placedOrderId}
            </div>

            <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5, maxWidth: '400px', margin: '0 auto 20px' }}>
              Fresh preparation has begun at <strong>{halt.name}</strong>. The rest stop delivery runner will coordinate with Captain Mahesh Yadav and deliver directly to <strong>Berth {primarySeat}</strong> when your bus arrives at {halt.time}.
            </p>

            {/* Live Kitchen Status Steps */}
            <div style={{
              backgroundColor: '#f8fafc',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              padding: '16px',
              textAlign: 'left',
              marginBottom: '20px',
            }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
                Live Delivery Stages
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CheckCircle2 size={16} color="#059669" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>Order Transmitted to Dhaba</div>
                    <div style={{ fontSize: '10px', color: '#64748b' }}>Acknowledged by kitchen manager</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    backgroundColor: '#4f46e5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: '10px',
                    fontWeight: 900,
                  }}>•</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#4f46e5' }}>Fresh Highway Preparation</div>
                    <div style={{ fontSize: '10px', color: '#64748b' }}>Hot rotis & sealed hygienic packaging</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', opacity: 0.6 }}>
                  <span style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    border: '1px solid #94a3b8',
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Runner Waiting at Bus Bay</div>
                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>Meets conductor upon bus entry</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', opacity: 0.6 }}>
                  <span style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    border: '1px solid #94a3b8',
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Handover to Berth {primarySeat}</div>
                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>Payment collected via {paymentMethod === 'berth_cash' ? 'Cash/UPI QR at berth' : 'Prepaid Online'}</div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={() => navigate(`/live-tracking/${activeBooking._id}`)}
                style={{
                  backgroundColor: '#4f46e5',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 18px',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Navigation size={15} />
                <span>Track Bus Arrival ({halt.time})</span>
              </button>

              <button
                onClick={() => { setOrdered(false); setCart({}); }}
                style={{
                  backgroundColor: '#f1f5f9',
                  color: '#334155',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Add More Items
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* ── CATEGORY FILTER PILLS ───────────────────────────────────────── */}
            <div style={{
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              paddingBottom: '4px',
              scrollbarWidth: 'none',
            }}>
              {MENU_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      whiteSpace: 'nowrap',
                      padding: '8px 14px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 800,
                      border: isSelected ? '1px solid #4f46e5' : '1px solid #cbd5e1',
                      backgroundColor: isSelected ? '#4f46e5' : '#ffffff',
                      color: isSelected ? '#ffffff' : '#475569',
                      cursor: 'pointer',
                      boxShadow: isSelected ? '0 2px 8px rgba(79, 70, 229, 0.25)' : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* ── HIGHWAY MENU CARDS (High-Contrast & Clean) ──────────────────── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredMenu.map((item) => {
                const qty = cart[item.id] || 0;

                return (
                  <div
                    key={item.id}
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '16px',
                      border: '1px solid #e2e8f0',
                      padding: '16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '14px',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      {/* Veg Indicator & Tag */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{
                          width: '14px',
                          height: '14px',
                          border: '2px solid #10b981',
                          borderRadius: '3px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                        </span>

                        {item.tag && (
                          <span style={{
                            backgroundColor: '#fef3c7',
                            color: '#b45309',
                            fontSize: '9px',
                            fontWeight: 800,
                            padding: '1px 6px',
                            borderRadius: '4px',
                          }}>
                            {item.tag}
                          </span>
                        )}

                        <span style={{
                          backgroundColor: '#ecfdf5',
                          color: '#059669',
                          fontSize: '10px',
                          fontWeight: 800,
                          padding: '1px 6px',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                        }}>
                          <Star size={10} fill="#059669" /> {item.rating}
                        </span>
                      </div>

                      {/* Item Name */}
                      <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                        {item.name}
                      </div>

                      {/* Price */}
                      <div style={{ fontSize: '15px', fontWeight: 900, color: '#059669', marginBottom: '6px' }}>
                        ₹{item.price}
                      </div>

                      {/* Description */}
                      <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.4, margin: 0 }}>
                        {item.desc}
                      </p>
                    </div>

                    {/* Quantity Add / Counter Button */}
                    <div style={{ flexShrink: 0, marginTop: '12px' }}>
                      {qty === 0 ? (
                        <button
                          onClick={() => addToCart(item.id)}
                          style={{
                            backgroundColor: '#ffffff',
                            color: '#059669',
                            border: '1.5px solid #059669',
                            borderRadius: '10px',
                            padding: '6px 16px',
                            fontSize: '12px',
                            fontWeight: 800,
                            cursor: 'pointer',
                            boxShadow: '0 2px 4px rgba(5, 150, 105, 0.1)',
                          }}
                        >
                          + ADD
                        </button>
                      ) : (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          backgroundColor: '#059669',
                          borderRadius: '10px',
                          padding: '4px 8px',
                          boxShadow: '0 2px 6px rgba(5, 150, 105, 0.25)',
                        }}>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#ffffff',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '2px',
                            }}
                          >
                            <Minus size={14} />
                          </button>

                          <span style={{
                            color: '#ffffff',
                            fontSize: '13px',
                            fontWeight: 900,
                            minWidth: '18px',
                            textAlign: 'center',
                          }}>
                            {qty}
                          </span>

                          <button
                            onClick={() => addToCart(item.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#ffffff',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '2px',
                            }}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* ── FLOATING BOTTOM CART BAR ─────────────────────────────────────────── */}
      {cartItemsCount > 0 && !ordered && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#0f172a',
          color: '#ffffff',
          padding: '12px 18px',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.25)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 500,
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        }}>
          <div>
            <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>
              {cartItemsCount} {cartItemsCount === 1 ? 'Item' : 'Items'} • Hand-Delivered
            </div>
            <div style={{ fontSize: '18px', fontWeight: 900, color: '#34d399' }}>
              ₹{cartTotal}
            </div>
          </div>

          <button
            onClick={() => setShowCheckoutModal(true)}
            style={{
              backgroundColor: '#10b981',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '10px 18px',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 10px rgba(16, 185, 129, 0.4)',
            }}
          >
            <ShoppingBag size={16} />
            <span>Deliver to Berth {primarySeat}</span>
          </button>
        </div>
      )}

      {/* ── CHECKOUT MODAL DRAWER ────────────────────────────────────────────── */}
      {showCheckoutModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.65)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          backdropFilter: 'blur(4px)',
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderTopLeftRadius: '24px',
            borderTopRightRadius: '24px',
            maxWidth: '520px',
            width: '100%',
            padding: '20px',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                  Confirm Highway Berth Delivery
                </h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  Halt Stop: {halt.name} ({halt.time})
                </span>
              </div>
              <button
                onClick={() => setShowCheckoutModal(false)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={18} color="#64748b" />
              </button>
            </div>

            {/* Target Berth Card */}
            <div style={{
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: '14px',
              padding: '12px 14px',
              marginBottom: '14px',
            }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#059669', textTransform: 'uppercase' }}>
                TARGET PASSENGER & BERTH
              </div>
              <div style={{ fontSize: '15px', fontWeight: 900, color: '#065f46', marginTop: '2px' }}>
                {passengerName} • Berth {primarySeat}
              </div>
              <div style={{ fontSize: '12px', color: '#047857' }}>
                Bus: {activeBooking?.busNumber} ({activeBooking?.busName})
              </div>
            </div>

            {/* Selected Items Summary */}
            <div style={{ marginBottom: '14px' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#334155', marginBottom: '8px' }}>
                Order Summary
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {Object.entries(cart).map(([id, qty]) => {
                  const item = HIGHWAY_MENU.find((m) => m.id === id);
                  if (!item) return null;
                  return (
                    <div key={id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span style={{ color: '#0f172a' }}>{qty}x {item.name}</span>
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>₹{item.price * qty}</span>
                    </div>
                  );
                })}
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: '15px', color: '#0f172a' }}>
                  <span>Total Payable:</span>
                  <span style={{ color: '#059669' }}>₹{cartTotal}</span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#334155', marginBottom: '8px' }}>
                Payment Method
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('berth_cash')}
                  style={{
                    padding: '10px',
                    borderRadius: '10px',
                    border: paymentMethod === 'berth_cash' ? '2px solid #059669' : '1px solid #cbd5e1',
                    backgroundColor: paymentMethod === 'berth_cash' ? '#ecfdf5' : '#ffffff',
                    color: paymentMethod === 'berth_cash' ? '#065f46' : '#475569',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                >
                  Pay at Berth (Cash / UPI)
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('prepaid')}
                  style={{
                    padding: '10px',
                    borderRadius: '10px',
                    border: paymentMethod === 'prepaid' ? '2px solid #4f46e5' : '1px solid #cbd5e1',
                    backgroundColor: paymentMethod === 'prepaid' ? '#eef2ff' : '#ffffff',
                    color: paymentMethod === 'prepaid' ? '#3730a3' : '#475569',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                >
                  Pay Online (Instant)
                </button>
              </div>
            </div>

            {/* Passenger Phone for Delivery Coordination */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                Mobile Number for Berth Runner Coordination:
              </label>
              <input
                type="text"
                value={passengerPhone}
                onChange={(e) => setPassengerPhone(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  color: '#0f172a',
                  outline: 'none',
                }}
              />
            </div>

            {/* Submit Order */}
            <button
              onClick={handleConfirmOrder}
              style={{
                width: '100%',
                backgroundColor: '#10b981',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '14px',
                fontSize: '14px',
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
              }}
            >
              <CheckCircle2 size={18} />
              <span>Confirm Order • Dispatch to {halt.name}</span>
            </button>
          </div>
        </div>
      )}

      {/* ── SWITCH TICKET / BERTH MODAL ──────────────────────────────────────── */}
      {showSwitchTicketModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.65)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          backdropFilter: 'blur(4px)',
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            maxWidth: '420px',
            width: '100%',
            padding: '20px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                Select Booked Route & Berth
              </h3>
              <button
                onClick={() => setShowSwitchTicketModal(false)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={16} color="#64748b" />
              </button>
            </div>

            <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '14px' }}>
              Highway food delivery is only permitted for passengers on active Night Bus routes. Choose your booked journey:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {SEEDED_DEFAULT_BOOKINGS.map((b) => {
                const isSelected = activeBooking?.pnr === b.pnr;
                return (
                  <div
                    key={b.pnr}
                    onClick={() => {
                      setActiveBooking(b);
                      setShowSwitchTicketModal(false);
                    }}
                    style={{
                      border: isSelected ? '2px solid #4f46e5' : '1px solid #cbd5e1',
                      backgroundColor: isSelected ? '#f5f3ff' : '#ffffff',
                      borderRadius: '12px',
                      padding: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a' }}>
                        {b.from} → {b.to}
                      </span>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        backgroundColor: '#ecfdf5',
                        color: '#059669',
                        padding: '2px 6px',
                        borderRadius: '6px',
                      }}>
                        Berth {b.seats[0]}
                      </span>
                    </div>

                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                      {b.busName} • PNR: {b.pnr}
                    </div>
                    <div style={{ fontSize: '10px', color: '#4f46e5', fontWeight: 700, marginTop: '2px' }}>
                      Halt: {b.haltPoint.name} ({b.haltPoint.time})
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default FoodHomeScreen;

