// ==================== src/screens/owner/OwnerDashboardScreen.jsx (100% AUTHENTIC MOBILE APP REPLICA) ====================
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getOwnerDashboard } from '../../services/ownerService';
import { 
  Bus, 
  Wallet, 
  Users, 
  MapPin, 
  Calendar, 
  Plus, 
  ArrowRight, 
  TrendingUp, 
  Radio, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Layers, 
  Compass, 
  DollarSign,
  ChevronRight,
  ShieldCheck,
  Bell
} from 'lucide-react';

const OwnerDashboardScreen = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const [stats, setStats] = useState({
    todayEarnings: 42800,
    monthEarnings: 894500,
    activeBuses: 4,
    totalBuses: 6,
    occupancyRate: '88%',
    todayBookings: 64,
  });

  const fleet = [
    { id: 'b1', name: 'Night Bus Royal Star', number: 'MP-04-NB-1122', type: 'AC Sleeper 2+1', seats: 36, status: 'On Route', route: 'Bhopal ➔ Indore' },
    { id: 'b2', name: 'Night Bus Gold Line', number: 'MP-09-NB-5544', type: 'Multi-Axle Volvo Sleeper', seats: 40, status: 'Boarding', route: 'Bhopal ➔ Ujjain' },
    { id: 'b3', name: 'Night Bus Comfort Seater', number: 'MP-20-NB-7788', type: 'Push-Back Seater', seats: 45, status: 'Scheduled', route: 'Jabalpur ➔ Amarkantak' },
    { id: 'b4', name: 'Night Bus Express Star', number: 'MP-19-NB-3300', type: 'AC Sleeper 2+1', seats: 36, status: 'In Depot', route: 'Rewa ➔ Omkareshwar' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#f9fafb', minHeight: '100%' }}>
      {/* ── Native Purple Header ────────────────────────────────────────── */}
      <div style={{
        backgroundColor: '#4f46e5',
        padding: '16px 18px 24px',
        color: '#ffffff',
        borderBottomLeftRadius: '26px',
        borderBottomRightRadius: '26px',
        boxShadow: '0 4px 15px rgba(79, 70, 229, 0.25)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#c7d2fe', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Fleet Operations Cockpit
            </div>
            <div style={{ fontSize: '20px', fontWeight: 900, color: '#ffffff', marginTop: '2px' }}>
              {user?.name || 'Bus Operator'} 👋
            </div>
          </div>

          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            padding: '4px 10px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: 800,
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}>
            <ShieldCheck size={13} />
            <span>Verified Owner</span>
          </div>
        </div>

        {/* Top Earnings Overview Card */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          borderRadius: '16px',
          padding: '14px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backdropFilter: 'blur(10px)',
        }}>
          <div>
            <div style={{ fontSize: '11px', color: '#e0e7ff', fontWeight: 700 }}>
              TODAY'S FLEET REVENUE
            </div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#ffffff', marginTop: '2px' }}>
              ₹{stats.todayEarnings.toLocaleString()}
            </div>
          </div>
          <div style={{
            backgroundColor: '#10b981',
            color: '#ffffff',
            fontSize: '11px',
            fontWeight: 800,
            padding: '4px 8px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
          }}>
            <TrendingUp size={12} />
            <span>+14% Today</span>
          </div>
        </div>
      </div>

      {/* ── Quick Actions Grid ─────────────────────────────────────────── */}
      <div style={{ padding: '20px 16px 0' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 900, color: '#0f172a', margin: '0 0 12px' }}>
          Operations Control Center
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          
          <div
            onClick={() => navigate('/owner/buses')}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '18px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              cursor: 'pointer',
              border: '1px solid #f1f5f9',
            }}
          >
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: '#eef2ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#4f46e5',
              marginBottom: '10px',
            }}>
              <Bus size={22} />
            </div>
            <div style={{ fontSize: '14px', fontWeight: 900, color: '#0f172a' }}>Manage Fleet</div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
              {stats.totalBuses} Coaches, Berths & Layouts
            </div>
          </div>

          <div
            onClick={() => navigate('/owner/routes/builder')}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '18px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              cursor: 'pointer',
              border: '1px solid #f1f5f9',
            }}
          >
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: '#ecfdf5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#059669',
              marginBottom: '10px',
            }}>
              <MapPin size={22} />
            </div>
            <div style={{ fontSize: '14px', fontWeight: 900, color: '#0f172a' }}>Route Builder</div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
              Stops, Fares & Night Timetables
            </div>
          </div>

          <div
            onClick={() => navigate('/owner/yatra')}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '18px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              cursor: 'pointer',
              border: '1px solid #f1f5f9',
            }}
          >
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: '#fef3c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#d97706',
              marginBottom: '10px',
            }}>
              <Sparkles size={22} />
            </div>
            <div style={{ fontSize: '14px', fontWeight: 900, color: '#0f172a' }}>Yatra Tours 🛕</div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
              Publish Pilgrimages & Manifests
            </div>
          </div>

          <div
            onClick={() => navigate('/owner/revenue')}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '18px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              cursor: 'pointer',
              border: '1px solid #f1f5f9',
            }}
          >
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: '#fdf2f8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#db2777',
              marginBottom: '10px',
            }}>
              <Wallet size={22} />
            </div>
            <div style={{ fontSize: '14px', fontWeight: 900, color: '#0f172a' }}>Payouts & Wallet</div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
              ₹{stats.monthEarnings.toLocaleString()} Settled
            </div>
          </div>

        </div>
      </div>

      {/* ── Key Metrics Cards Row ───────────────────────────────────────── */}
      <div style={{ padding: '20px 16px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '14px',
            border: '1px solid #f1f5f9',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
          }}>
            <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>
              ACTIVE ON ROAD
            </div>
            <div style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', marginTop: '4px' }}>
              {stats.activeBuses} <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>/ {stats.totalBuses}</span>
            </div>
            <div style={{ fontSize: '10px', color: '#059669', fontWeight: 700, marginTop: '2px' }}>
              2 in scheduled maintenance
            </div>
          </div>

          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '14px',
            border: '1px solid #f1f5f9',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
          }}>
            <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>
              BERTH OCCUPANCY
            </div>
            <div style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', marginTop: '4px' }}>
              {stats.occupancyRate}
            </div>
            <div style={{ fontSize: '10px', color: '#4f46e5', fontWeight: 700, marginTop: '2px' }}>
              {stats.todayBookings} Berths Reserved
            </div>
          </div>
        </div>
      </div>

      {/* ── Live Fleet Tracking List ────────────────────────────────────── */}
      <div style={{ padding: '24px 16px 100px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 900, color: '#0f172a', margin: 0 }}>
            Active Fleet Status
          </h2>
          <button
            onClick={() => navigate('/owner/buses')}
            style={{ background: 'none', border: 'none', color: '#4f46e5', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}
          >
            All Buses →
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {fleet.map((bus) => (
            <div
              key={bus.id}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '14px',
                border: '1px solid #f1f5f9',
                boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                  {bus.name}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                  {bus.number} • {bus.route}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  padding: '3px 8px',
                  borderRadius: '6px',
                  backgroundColor: bus.status === 'On Route' ? '#ecfdf5' : bus.status === 'Boarding' ? '#fffbeb' : '#f1f5f9',
                  color: bus.status === 'On Route' ? '#059669' : bus.status === 'Boarding' ? '#d97706' : '#475569',
                }}>
                  {bus.status}
                </span>

                <button
                  onClick={() => navigate(`/live-tracking/${bus.number}`)}
                  style={{
                    backgroundColor: '#eef2ff',
                    color: '#4f46e5',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '6px 8px',
                    fontSize: '11px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Radio size={12} color="#10b981" />
                  <span>GPS</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default OwnerDashboardScreen;
