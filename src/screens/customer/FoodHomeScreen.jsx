// ==================== src/screens/customer/FoodHomeScreen.jsx ====================
import React, { useState } from 'react';
import { 
  UtensilsCrossed, 
  Plus, 
  Minus, 
  ShoppingBag, 
  CheckCircle2, 
  MapPin, 
  Clock, 
  Star,
  Bus
} from 'lucide-react';

const FoodHomeScreen = () => {
  const [selectedStation, setSelectedStation] = useState('Highway Star Rest Stop (01:30 AM)');
  const [cart, setCart] = useState({});
  const [ordered, setOrdered] = useState(false);

  const menu = [
    { id: 'f1', name: 'Deluxe Paneer Thali', price: 180, rating: 4.8, isVeg: true, desc: 'Paneer butter masala, dal fry, 4 rotis, jeera rice, salad & sweet' },
    { id: 'f2', name: 'Dal Makhani & Jeera Rice Combo', price: 140, rating: 4.7, isVeg: true, desc: 'Slow cooked black dal with aromatic basmati rice' },
    { id: 'f3', name: 'Hyderabadi Veg Dum Biryani', price: 160, rating: 4.9, isVeg: true, desc: 'Served with cool cucumber raita & spicy salan' },
    { id: 'f4', name: 'Masala Dosa & Sambar', price: 110, rating: 4.6, isVeg: true, desc: 'Crispy golden dosa with potato masala and fresh coconut chutney' },
    { id: 'f5', name: 'Kulhad Adrak Chai (2 Cups)', price: 50, rating: 4.9, isVeg: true, desc: 'Fresh ginger cardamom milk tea served in clay kulhads' },
  ];

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
    const item = menu.find((m) => m.id === id);
    return acc + (item?.price || 0) * qty;
  }, 0);

  const handleCheckout = () => {
    setOrdered(true);
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 20px 100px' }}>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h1 style={{ fontSize: '1.45rem' }}>Onboard Highway Food Delivery</h1>
          <span className="badge badge-rose">Berth Delivery</span>
        </div>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          Order hot, hygienic meals from verified highway dhabas delivered right to your bus sleeper berth during scheduled halts.
        </p>
      </div>

      {ordered ? (
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
          <h2 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Meal Order Dispatched to Kitchen!</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
            Your meal is being prepared at <strong>Highway Star Rest Stop</strong>. The delivery partner will meet your bus conductor and hand it to your berth when the bus pulls in at 01:30 AM.
          </p>
          <button onClick={() => { setOrdered(false); setCart({}); }} className="btn btn-primary">
            Order More Items
          </button>
        </div>
      ) : (
        <>
          {/* Halt point selector */}
          <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <MapPin size={18} color="#f43f5e" />
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>DELIVERY HALT POINT</span>
                <div style={{ fontWeight: 600, color: '#fff' }}>{selectedStation}</div>
              </div>
            </div>
            <span className="badge badge-emerald">30 Min Stop Guaranteed</span>
          </div>

          {/* Menu items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {menu.map((item) => {
              const qty = cart[item.id] || 0;

              return (
                <div
                  key={item.id}
                  className="glass-panel"
                  style={{
                    padding: '20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '16px',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        width: '14px',
                        height: '14px',
                        border: '2px solid #10b981',
                        borderRadius: '3px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                      </span>
                      <h3 style={{ fontSize: '1.05rem' }}>{item.name}</h3>
                      <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>
                        <Star size={10} fill="#10b981" /> {item.rating}
                      </span>
                    </div>

                    <div className="mono" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#10b981', margin: '4px 0' }}>
                      ₹{item.price}
                    </div>

                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {item.desc}
                    </p>
                  </div>

                  {/* Quantity add/remove button */}
                  <div>
                    {qty === 0 ? (
                      <button
                        onClick={() => addToCart(item.id)}
                        className="btn btn-secondary btn-sm"
                        style={{ minWidth: '90px' }}
                      >
                        + Add
                      </button>
                    ) : (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: '#18181b',
                        padding: '4px 8px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid #10b981',
                      }}>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '2px' }}
                        >
                          <Minus size={14} />
                        </button>
                        <span className="mono" style={{ fontWeight: 700, color: '#10b981', minWidth: '16px', textAlign: 'center' }}>
                          {qty}
                        </span>
                        <button
                          onClick={() => addToCart(item.id)}
                          style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '2px' }}
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

          {/* Floating Cart Checkout Bar */}
          {cartItemsCount > 0 && (
            <div style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'rgba(18, 18, 23, 0.95)',
              backdropFilter: 'blur(20px)',
              borderTop: '1px solid var(--border-subtle)',
              padding: '16px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              zIndex: 100,
            }}>
              <div>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Cart: {cartItemsCount} Items
                </span>
                <div className="mono" style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981' }}>
                  ₹{cartTotal}
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="btn btn-primary btn-lg"
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <ShoppingBag size={18} />
                <span>Deliver to My Berth</span>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FoodHomeScreen;
