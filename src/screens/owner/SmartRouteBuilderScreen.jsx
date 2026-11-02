// ==================== src/screens/owner/SmartRouteBuilderScreen.jsx (ROUTE CREATION, LISTING & DELETION ENGINE) ====================
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getOwnerRoutes, createRoute, deleteRoute, updateRouteStatus } from '../../services/ownerService';
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
  ArrowRight,
  Search,
  Pause,
  Play,
  Edit3,
  AlertTriangle,
  ArrowLeftRight,
  Layers,
  X
} from 'lucide-react';

const INITIAL_CORRIDORS = [
  {
    _id: 'rt_demo_01',
    name: 'Bhopal - Indore Direct Overnight',
    source: { city: 'Bhopal', terminal: 'ISBT Terminal' },
    destination: { city: 'Indore', terminal: 'Vijay Nagar Bus Port' },
    departureTime: '21:30',
    arrivalTime: '06:00',
    baseFare: 899,
    distanceKm: 194,
    status: 'active',
    intermediateStops: [
      { stopName: 'Mandideep Toll Bypass', km: 22, haltMins: 5, fare: 150, type: 'pickup' },
      { stopName: 'Sihora Highway Food Plaza', km: 110, haltMins: 30, fare: 500, type: 'food' },
      { stopName: 'Dewas Bypass Junction', km: 165, haltMins: 10, fare: 750, type: 'drop' },
    ],
  },
  {
    _id: 'rt_demo_02',
    name: 'Jabalpur - Katni Express Sleeper',
    source: { city: 'Jabalpur', terminal: 'ISBT Damoh Naka' },
    destination: { city: 'Katni', terminal: 'New Bus Stand Katni' },
    departureTime: '20:00',
    arrivalTime: '23:30',
    baseFare: 450,
    distanceKm: 92,
    status: 'active',
    intermediateStops: [
      { stopName: 'Panagar Crossing', km: 18, haltMins: 5, fare: 100, type: 'pickup' },
      { stopName: 'Sihora Highway Food Plaza', km: 45, haltMins: 20, fare: 250, type: 'food' },
      { stopName: 'Sleemanabad Bypass', km: 68, haltMins: 5, fare: 350, type: 'drop' },
    ],
  },
  {
    _id: 'rt_demo_03',
    name: 'Rewa - Bhopal Super Fast Night Cruiser',
    source: { city: 'Rewa', terminal: 'New Bus Stand Rewa' },
    destination: { city: 'Bhopal', terminal: 'Nadra Bus Stand Bhopal' },
    departureTime: '19:30',
    arrivalTime: '07:00',
    baseFare: 1150,
    distanceKm: 485,
    status: 'paused',
    intermediateStops: [
      { stopName: 'Satna Bus Stand', km: 54, haltMins: 15, fare: 250, type: 'pickup' },
      { stopName: 'Maihar Bypass Dhaba', km: 92, haltMins: 30, fare: 450, type: 'food' },
      { stopName: 'Katni Bypass', km: 140, haltMins: 10, fare: 650, type: 'drop' },
      { stopName: 'Damoh ISBT', km: 250, haltMins: 15, fare: 850, type: 'drop' },
    ],
  },
];

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

const LOCAL_STORAGE_KEY = 'nightbus_fleet_routes';

const SmartRouteBuilderScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Mode: 'list' (All Corridors & Deletion) vs 'create' (Smart Route Builder)
  const [activeTab, setActiveTab] = useState(() => {
    return location.pathname.includes('/builder') ? 'create' : 'list';
  });

  // Routes dataset with local storage persistence
  const [routes, setRoutes] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_CORRIDORS;
  });

  // Filter & Search state in list view
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'paused'

  // Route Form State (Builder)
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
  const [notification, setNotification] = useState('');

  // Delete Confirmation Modal State
  const [routeToDelete, setRouteToDelete] = useState(null);

  // Sync to local storage whenever routes change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(routes));
    } catch {}
  }, [routes]);

  // Load online routes if available
  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const res = await getOwnerRoutes();
        if (res && res.success && Array.isArray(res.routes) && res.routes.length > 0) {
          // Merge with unique IDs
          const normalized = res.routes.map(r => ({
            _id: r._id,
            name: r.name || r.routeName || `${r.fromStop?.name || 'Origin'} - ${r.toStop?.name || 'Destination'}`,
            source: { city: r.fromStop?.city || r.source?.city || 'Bhopal', terminal: r.fromStop?.name || r.source?.terminal || 'ISBT' },
            destination: { city: r.toStop?.city || r.destination?.city || 'Indore', terminal: r.toStop?.name || r.destination?.terminal || 'Stand' },
            departureTime: r.schedule?.[0]?.departureTime || r.departureTime || '21:30',
            arrivalTime: r.schedule?.[0]?.arrivalTime || r.arrivalTime || '06:00',
            baseFare: r.basePrice || r.baseFare || 899,
            distanceKm: r.distance || 194,
            status: r.status || (r.isActive ? 'active' : 'paused'),
            intermediateStops: r.stops || [],
          }));
          setRoutes(prev => {
            const existingIds = new Set(prev.map(p => p._id));
            const newOnes = normalized.filter(n => !existingIds.has(n._id));
            return [...prev, ...newOnes];
          });
        }
      } catch {
        // Fallback to local storage state
      }
    };
    fetchRoutes();
  }, []);

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

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
      if (diffMins < 0) diffMins += 24 * 60;
      const h = Math.floor(diffMins / 60);
      const m = diffMins % 60;
      return `${h}h ${m > 0 ? `${m}m` : ''} duration`;
    } catch {
      return '8h 30m duration';
    }
  };

  // Create & Save New Route
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const newRouteId = 'rt_' + Date.now();
    const newRouteObj = {
      _id: newRouteId,
      name: routeName.trim(),
      source: { city: sourceCity.trim(), terminal: sourceTerminal.trim() },
      destination: { city: destinationCity.trim(), terminal: destinationTerminal.trim() },
      departureTime,
      arrivalTime,
      baseFare: Number(baseFare),
      distanceKm: Math.round(150 + Math.random() * 250),
      status: 'active',
      intermediateStops: [...intermediateStops],
    };

    try {
      await createRoute(newRouteObj);
    } catch {}

    // Add to list and persist
    setRoutes(prev => [newRouteObj, ...prev]);
    showToast(`🎉 Route "${newRouteObj.name}" created and published!`);
    setLoading(false);

    // Switch to All Routes list view so user can see it immediately with deletion options
    setActiveTab('list');
  };

  // Toggle Route Active / Paused Status
  const handleToggleStatus = async (routeId) => {
    const target = routes.find(r => r._id === routeId);
    if (!target) return;
    const newStatus = target.status === 'active' ? 'paused' : 'active';

    try {
      await updateRouteStatus(routeId, { isActive: newStatus === 'active', status: newStatus });
    } catch {}

    setRoutes(prev => prev.map(r => r._id === routeId ? { ...r, status: newStatus } : r));
    showToast(`Route "${target.name}" is now ${newStatus.toUpperCase()}`);
  };

  // Confirm and Execute Deletion of Route
  const handleConfirmDelete = async () => {
    if (!routeToDelete) return;
    const id = routeToDelete._id;
    const deletedName = routeToDelete.name;

    try {
      await deleteRoute(id);
    } catch {}

    setRoutes(prev => prev.filter(r => r._id !== id));
    setRouteToDelete(null);
    showToast(`🗑️ Route "${deletedName}" permanently deleted!`);
  };

  // Quick 1-click Return Route Generator
  const handleCreateReturnRoute = (sourceRoute) => {
    const returnName = `${sourceRoute.destination.city} - ${sourceRoute.source.city} Return Express`;
    const newReturnObj = {
      _id: 'rt_ret_' + Date.now(),
      name: returnName,
      source: { ...sourceRoute.destination },
      destination: { ...sourceRoute.source },
      departureTime: '22:00',
      arrivalTime: '06:30',
      baseFare: sourceRoute.baseFare,
      distanceKm: sourceRoute.distanceKm,
      status: 'active',
      intermediateStops: [...sourceRoute.intermediateStops].reverse(),
    };

    setRoutes(prev => [newReturnObj, ...prev]);
    showToast(`↩ Return corridor "${returnName}" generated successfully!`);
  };

  // Filtered routes list
  const filteredRoutes = routes.filter(r => {
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesQuery = !searchQuery || 
      r.name?.toLowerCase().includes(q) ||
      r.source?.city?.toLowerCase().includes(q) ||
      r.destination?.city?.toLowerCase().includes(q);
    return matchesStatus && matchesQuery;
  });

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
              Route & Corridor Engine
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
              Fleet Ops
            </span>
          </div>
          <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px', marginBottom: 0 }}>
            Create new corridors, assign stops & manage or delete active route schedules.
          </p>
        </div>
      </div>

      {/* ─── Notification Toast Banner ─── */}
      {notification && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: '#ecfdf5',
          border: '1.5px solid #a7f3d0',
          borderRadius: '14px',
          padding: '12px 16px',
          marginBottom: '16px',
          color: '#065f46',
          fontSize: '0.88rem',
          fontWeight: 600,
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.1)',
        }}>
          <CheckCircle2 size={18} color="#10b981" />
          <span>{notification}</span>
        </div>
      )}

      {/* ─── Primary Navigation Mode Tabs (All Routes vs Create New Route) ─── */}
      <div style={{
        display: 'flex',
        background: '#e2e8f0',
        borderRadius: '14px',
        padding: '4px',
        marginBottom: '16px',
      }}>
        <button
          type="button"
          onClick={() => setActiveTab('list')}
          style={{
            flex: 1,
            background: activeTab === 'list' ? '#ffffff' : 'transparent',
            color: activeTab === 'list' ? '#0f172a' : '#64748b',
            border: 'none',
            borderRadius: '10px',
            padding: '9px 12px',
            fontSize: '12.5px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            boxShadow: activeTab === 'list' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.15s ease',
          }}
        >
          <Layers size={15} color={activeTab === 'list' ? '#f59e0b' : '#64748b'} />
          <span>All Corridors ({routes.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('create')}
          style={{
            flex: 1,
            background: activeTab === 'create' ? '#ffffff' : 'transparent',
            color: activeTab === 'create' ? '#0f172a' : '#64748b',
            border: 'none',
            borderRadius: '10px',
            padding: '9px 12px',
            fontSize: '12.5px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            boxShadow: activeTab === 'create' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.15s ease',
          }}
        >
          <Plus size={15} color={activeTab === 'create' ? '#10b981' : '#64748b'} />
          <span>+ Create New Route</span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* MODE 1: ALL CORRIDORS & ROUTES LIST (WITH DELETION & ACTIONS)      */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === 'list' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Search & Filter Bar */}
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            padding: '10px 14px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            flexWrap: 'wrap',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '10px',
              padding: '6px 10px',
              flex: 1,
              minWidth: '180px',
            }}>
              <Search size={15} color="#64748b" />
              <input
                type="text"
                placeholder="Search corridors or cities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  fontSize: '12px',
                  color: '#0f172a',
                }}
              />
            </div>

            {/* Status Filter Chips */}
            <div style={{ display: 'flex', gap: '6px' }}>
              {[
                { id: 'all', label: `All (${routes.length})` },
                { id: 'active', label: `Active (${routes.filter(r => r.status === 'active').length})` },
                { id: 'paused', label: `Paused (${routes.filter(r => r.status === 'paused').length})` },
              ].map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => setStatusFilter(chip.id)}
                  style={{
                    background: statusFilter === chip.id ? '#1e293b' : '#f1f5f9',
                    color: statusFilter === chip.id ? '#ffffff' : '#475569',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '6px 10px',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Empty State */}
          {filteredRoutes.length === 0 && (
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '30px 20px',
              textAlign: 'center',
              border: '1px solid #e2e8f0',
            }}>
              <Compass size={36} color="#94a3b8" style={{ margin: '0 auto 10px' }} />
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                No Corridors Found
              </h3>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 16px' }}>
                You have no routes matching your filter. Create a new route corridor in seconds.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('create')}
                style={{
                  background: '#f59e0b',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '9px 16px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Plus size={16} />
                <span>Create New Route</span>
              </button>
            </div>
          )}

          {/* Route Cards */}
          {filteredRoutes.map((route) => {
            const isActive = route.status === 'active';

            return (
              <div
                key={route._id}
                style={{
                  background: '#ffffff',
                  borderRadius: '18px',
                  padding: '16px',
                  border: isActive ? '1px solid #e2e8f0' : '1.5px dashed #cbd5e1',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  opacity: isActive ? 1 : 0.85,
                }}
              >
                {/* Header: Name, Status Badge, Route ID */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                        {route.name}
                      </span>
                      <span style={{
                        background: isActive ? '#ecfdf5' : '#fffbeb',
                        border: `1px solid ${isActive ? '#a7f3d0' : '#fde68a'}`,
                        color: isActive ? '#059669' : '#b45309',
                        fontSize: '10.5px',
                        fontWeight: 800,
                        padding: '1px 6px',
                        borderRadius: '6px',
                        textTransform: 'uppercase',
                      }}>
                        {isActive ? '● Active' : '⏸ Paused'}
                      </span>
                    </div>

                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                      ID: <span style={{ fontFamily: 'monospace' }}>{route._id}</span> • {route.distanceKm || 194} km highway corridor
                    </div>
                  </div>

                  <span style={{
                    fontSize: '13px',
                    fontWeight: 800,
                    color: '#059669',
                    background: '#f0fdf4',
                    padding: '3px 8px',
                    borderRadius: '8px',
                    border: '1px solid #bbf7d0',
                  }}>
                    ₹{route.baseFare} Base
                  </span>
                </div>

                {/* Corridor Path: Origin ➔ Destination */}
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #f1f5f9',
                  borderRadius: '12px',
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                }}>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: '#059669', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={13} color="#10b981" />
                      <span>{route.source?.city} ({route.source?.terminal})</span>
                    </div>
                    <div style={{ fontSize: '10.5px', color: '#64748b', paddingLeft: '17px' }}>
                      Departs: <strong style={{ color: '#0f172a' }}>{route.departureTime}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#94a3b8' }}>
                    <div style={{ width: '18px', height: '1.5px', background: '#cbd5e1' }} />
                    <ArrowRight size={14} color="#64748b" />
                    <div style={{ width: '18px', height: '1.5px', background: '#cbd5e1' }} />
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                      <span>{route.destination?.city} ({route.destination?.terminal})</span>
                      <MapPin size={13} color="#ef4444" />
                    </div>
                    <div style={{ fontSize: '10.5px', color: '#64748b', paddingRight: '17px' }}>
                      Arrives: <strong style={{ color: '#0f172a' }}>{route.arrivalTime}</strong>
                    </div>
                  </div>
                </div>

                {/* Intermediate Stops pill */}
                {Array.isArray(route.intermediateStops) && route.intermediateStops.length > 0 && (
                  <div style={{ fontSize: '11px', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Coffee size={13} color="#ea580c" />
                    <span>
                      <strong>{route.intermediateStops.length} Intermediate Halts:</strong> {route.intermediateStops.map(s => s.stopName || s.name).slice(0, 3).join(', ')}
                      {route.intermediateStops.length > 3 ? ` +${route.intermediateStops.length - 3} more` : ''}
                    </span>
                  </div>
                )}

                {/* ─── ACTION BUTTONS (DELETE, PAUSE, RETURN ROUTE) ─── */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  paddingTop: '6px',
                  borderTop: '1px solid #f1f5f9',
                  flexWrap: 'wrap',
                }}>
                  {/* Pause / Resume */}
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(route._id)}
                    style={{
                      background: isActive ? '#fffbeb' : '#ecfdf5',
                      border: `1px solid ${isActive ? '#fde68a' : '#a7f3d0'}`,
                      color: isActive ? '#b45309' : '#059669',
                      borderRadius: '8px',
                      padding: '6px 11px',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {isActive ? <Pause size={13} /> : <Play size={13} />}
                    <span>{isActive ? 'Pause' : 'Resume'}</span>
                  </button>

                  {/* 1-Click Generate Return Route */}
                  <button
                    type="button"
                    onClick={() => handleCreateReturnRoute(route)}
                    style={{
                      background: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      color: '#334155',
                      borderRadius: '8px',
                      padding: '6px 11px',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                    title="Generate opposite return route"
                  >
                    <ArrowLeftRight size={13} />
                    <span>+ Return Route</span>
                  </button>

                  {/* Red Delete Button */}
                  <button
                    type="button"
                    onClick={() => setRouteToDelete(route)}
                    style={{
                      marginLeft: 'auto',
                      background: '#fef2f2',
                      border: '1px solid #fca5a5',
                      color: '#dc2626',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'background 0.15s ease',
                    }}
                    title="Permanently delete route"
                  >
                    <Trash2 size={13} color="#dc2626" />
                    <span>Delete Route</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* MODE 2: SMART ROUTE BUILDER & CREATOR FORM                          */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === 'create' && (
        <>
          {/* Quick Preset Corridors */}
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

          {/* Live Route Preview Flow Banner */}
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

            {/* Nodes */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
            }}>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#818cf8' }}>
                  <div style={{ width: '22px', height: '2px', background: 'rgba(255, 255, 255, 0.2)' }} />
                  <Bus size={14} color="#818cf8" />
                  <div style={{ width: '22px', height: '2px', background: 'rgba(255, 255, 255, 0.2)' }} />
                </div>
                <div style={{ fontSize: '9.5px', color: '#94a3b8', marginTop: '3px' }}>
                  {intermediateStops.length} Waypoints
                </div>
              </div>

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
            {/* Card 1: Corridor Definition */}
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

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '12px',
              }}>
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

            {/* Card 2: Schedule & Fare */}
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

            {/* Card 3: Intermediate Waypoints */}
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

            {/* Bottom Save Action Bar */}
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
        </>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* DELETE ROUTE CONFIRMATION MODAL                                    */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {routeToDelete && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '16px',
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '420px',
            padding: '22px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
            border: '1px solid #fee2e2',
            textAlign: 'center',
          }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px',
            }}>
              <AlertTriangle size={28} color="#dc2626" />
            </div>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
              Delete Fleet Corridor?
            </h3>

            <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.45, margin: '0 0 18px 0' }}>
              Are you sure you want to permanently delete <strong>"{routeToDelete.name}"</strong>? This corridor will be removed from fleet schedules and booking search engines.
            </p>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setRouteToDelete(null)}
                style={{
                  flex: 1,
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  color: '#334155',
                  borderRadius: '12px',
                  padding: '11px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  border: 'none',
                  color: '#ffffff',
                  borderRadius: '12px',
                  padding: '11px',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.35)',
                }}
              >
                <Trash2 size={15} />
                <span>Yes, Delete Route</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartRouteBuilderScreen;
