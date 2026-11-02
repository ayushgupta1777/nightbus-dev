// ==================== src/screens/owner/BusManagementScreen.jsx (DAY-WISE SCHEDULE, RETURN ROUTES & BERTH COUNTER ENGINE) ====================
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOwnerBuses, addBus } from '../../services/ownerService';
import { 
  Bus, 
  Plus, 
  ArrowLeft, 
  CheckCircle2, 
  Users, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  X, 
  Wifi, 
  Zap, 
  Layers, 
  Eye, 
  ChevronRight, 
  Info, 
  Phone, 
  Search, 
  AlertCircle, 
  Clock, 
  TrendingUp, 
  Check, 
  Compass, 
  ArrowRight,
  ArrowLeftRight,
  Settings2,
  Ticket,
  IndianRupee,
  Wrench,
  RotateCcw
} from 'lucide-react';

const SEEDED_BUSES = [
  {
    _id: 'b1',
    chassisNumber: 'MP-04-NB-1122',
    busName: 'Night Bus Royal Star',
    busType: 'AC Sleeper 2+1',
    totalSeats: 36,
    routeCount: 3,
    totalSegments: 28,
    fare: 899,
    isActive: true,
    amenities: ['WiFi', 'Charging Port', 'Water Bottle', 'Blanket', 'Pillow'],
    homeDepot: { city: 'Bhopal', pincode: '462001' },
    // Route Corridors
    corridors: [
      {
        id: 'c1',
        name: 'Bhopal ⇄ Indore',
        outbound: { from: 'Bhopal ISBT', to: 'Indore Radisson', departureTime: '21:30', arrivalTime: '06:00', fare: 899 },
        return: { from: 'Indore Radisson', to: 'Bhopal ISBT', departureTime: '22:00', arrivalTime: '06:30', fare: 899 },
      },
      {
        id: 'c2',
        name: 'Bhopal ⇄ Jabalpur',
        outbound: { from: 'Bhopal Habibganj', to: 'Jabalpur ISBT', departureTime: '22:15', arrivalTime: '06:45', fare: 950 },
        return: { from: 'Jabalpur ISBT', to: 'Bhopal Habibganj', departureTime: '21:00', arrivalTime: '05:30', fare: 950 },
      },
    ],
  },
  {
    _id: 'b2',
    chassisNumber: 'MP-09-NB-5544',
    busName: 'Night Bus Gold Line',
    busType: 'Multi-Axle Volvo Sleeper',
    totalSeats: 40,
    routeCount: 2,
    totalSegments: 19,
    fare: 950,
    isActive: true,
    amenities: ['WiFi', 'Charging Port', 'Blanket', 'Reading Light'],
    homeDepot: { city: 'Indore', pincode: '452010' },
    corridors: [
      {
        id: 'c1',
        name: 'Indore ⇄ Ujjain',
        outbound: { from: 'Indore Sarwate', to: 'Ujjain Mahakal', departureTime: '20:00', arrivalTime: '22:30', fare: 450 },
        return: { from: 'Ujjain Mahakal', to: 'Indore Sarwate', departureTime: '06:30', arrivalTime: '09:00', fare: 450 },
      },
      {
        id: 'c2',
        name: 'Indore ⇄ Bhopal Direct',
        outbound: { from: 'Vijay Nagar Bus Port', to: 'ISBT Bhopal', departureTime: '23:00', arrivalTime: '06:30', fare: 950 },
        return: { from: 'ISBT Bhopal', to: 'Vijay Nagar Bus Port', departureTime: '22:00', arrivalTime: '05:30', fare: 950 },
      },
    ],
  },
  {
    _id: 'b3',
    chassisNumber: 'MP-20-NB-7788',
    busName: 'Night Bus Express Cruiser',
    busType: 'Push-Back AC Sleeper',
    totalSeats: 36,
    routeCount: 2,
    totalSegments: 12,
    fare: 650,
    isActive: true,
    amenities: ['Charging Port', 'Water Bottle', 'Blanket'],
    homeDepot: { city: 'Jabalpur', pincode: '482001' },
    corridors: [
      {
        id: 'c1',
        name: 'Jabalpur ⇄ Katni',
        outbound: { from: 'Jabalpur ISBT', to: 'Katni New Bus Stand', departureTime: '19:30', arrivalTime: '22:30', fare: 450 },
        return: { from: 'Katni New Bus Stand', to: 'Jabalpur ISBT', departureTime: '06:00', arrivalTime: '09:00', fare: 450 },
      },
      {
        id: 'c2',
        name: 'Katni ⇄ Rewa',
        outbound: { from: 'Katni New Stand', to: 'Rewa Old Bus Stand', departureTime: '23:00', arrivalTime: '03:30', fare: 550 },
        return: { from: 'Rewa Old Bus Stand', to: 'Katni New Stand', departureTime: '04:00', arrivalTime: '08:30', fare: 550 },
      },
    ],
  },
];

const AVAILABLE_AMENITIES = [
  'WiFi',
  'Charging Port',
  'Water Bottle',
  'Blanket',
  'Pillow',
  'Reading Light',
  'CCTV Safety',
  'Emergency Exit',
];

// Helper: Format date string as YYYY-MM-DD
const getDateStr = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

// Helper: Human readable date label
const getHumanDateLabel = (dateStr) => {
  const today = getDateStr(0);
  const yesterday = getDateStr(-1);
  const tomorrow = getDateStr(1);
  const dayBefore = getDateStr(-2);

  if (dateStr === today) return 'Today';
  if (dateStr === yesterday) return 'Yesterday';
  if (dateStr === tomorrow) return 'Tomorrow';
  if (dateStr === dayBefore) return 'Day Before';

  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[parseInt(parts[1], 10) - 1] || parts[1];
    return `${month} ${parseInt(parts[2], 10)}`;
  }
  return dateStr;
};

// Realistic mock passenger names pool
const PASSENGERS_POOL = [
  { name: 'Ayush Sharma', gender: 'M', age: 29, phone: '9876543210' },
  { name: 'Pooja Verma', gender: 'F', age: 26, phone: '9822334455' },
  { name: 'Deepak Patel', gender: 'M', age: 34, phone: '9711223344' },
  { name: 'Kavita Joshi', gender: 'F', age: 28, phone: '9844556677' },
  { name: 'Rajesh Mehra', gender: 'M', age: 42, phone: '9833445566' },
  { name: 'Sneha Kulkarni', gender: 'F', age: 24, phone: '9899887766' },
  { name: 'Amitabh Sen', gender: 'M', age: 38, phone: '9811224455' },
  { name: 'Megha Singhania', gender: 'F', age: 31, phone: '9877665544' },
  { name: 'Vikram Chouhan', gender: 'M', age: 45, phone: '9866554433' },
  { name: 'Ananya Gupta', gender: 'F', age: 22, phone: '9855443322' },
  { name: 'Sanjay Rathore', gender: 'M', age: 36, phone: '9844332211' },
  { name: 'Neha Tiwari', gender: 'F', age: 27, phone: '9833221100' },
  { name: 'Manoj Dubey', gender: 'M', age: 50, phone: '9822110099' },
  { name: 'Priyanka Saxena', gender: 'F', age: 30, phone: '9811009988' },
  { name: 'Rohan Deshmukh', gender: 'M', age: 25, phone: '9800998877' },
  { name: 'Sunita Jain', gender: 'F', age: 48, phone: '9799887766' },
  { name: 'Gaurav Yadav', gender: 'M', age: 33, phone: '9788776655' },
  { name: 'Divya Malviya', gender: 'F', age: 29, phone: '9777665544' },
  { name: 'Harish Lodhi', gender: 'M', age: 40, phone: '9766554433' },
  { name: 'Ritu Agrawal', gender: 'F', age: 35, phone: '9755443322' },
  { name: 'Naveen Pandey', gender: 'M', age: 28, phone: '9744332211' },
  { name: 'Shweta Shrivastava', gender: 'F', age: 32, phone: '9733221100' },
  { name: 'Alok Mishra', gender: 'M', age: 44, phone: '9722110099' },
  { name: 'Tanvi Soni', gender: 'F', age: 23, phone: '9711009988' },
  { name: 'Pradeep Solanki', gender: 'M', age: 39, phone: '9700998877' },
  { name: 'Bhavna Thakur', gender: 'F', age: 37, phone: '9699887766' },
  { name: 'Kunal Bisen', gender: 'M', age: 30, phone: '9688776655' },
  { name: 'Rashmi Dixit', gender: 'F', age: 41, phone: '9677665544' },
  { name: 'Sachin Rawat', gender: 'M', age: 27, phone: '9666554433' },
  { name: 'Jyoti Kushwaha', gender: 'F', age: 33, phone: '9655443322' },
  { name: 'Vivek Goswami', gender: 'M', age: 46, phone: '9644332211' },
  { name: 'Monika Bunkar', gender: 'F', age: 25, phone: '9633221100' },
  { name: 'Dharmendra Sahu', gender: 'M', age: 37, phone: '9622110099' },
  { name: 'Pallavi Mandloi', gender: 'F', age: 28, phone: '9611009988' },
  { name: 'Yogesh Nagar', gender: 'M', age: 35, phone: '9600998877' },
];

const pseudoHash = (str) => {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(31, h) + str.charCodeAt(i) | 0;
  }
  return Math.abs(h);
};

// Generate comprehensive date-wise bookings for any bus, date, route direction, and custom walk-in bookings
const getBusBookingsForDate = (bus, dateStr, scheduleConfig = {}, customBookings = []) => {
  const today = getDateStr(0);
  const isPast = dateStr < today;
  const isToday = dateStr === today;
  const isFuture = dateStr > today;

  const totalSeats = bus.totalSeats || 36;
  const fare = scheduleConfig.fare || bus.fare || 899;
  const isRestDay = scheduleConfig.isRestDay === true;

  if (isRestDay) {
    return {
      dateStr,
      isPast,
      isToday,
      isFuture,
      isRestDay: true,
      totalSeats,
      bookedCount: 0,
      vacantCount: totalSeats,
      occupancyPercent: 0,
      totalRevenue: 0,
      boardedCount: 0,
      pendingBoardingCount: 0,
      seats: Array.from({ length: totalSeats }, (_, i) => ({
        number: `L${i + 1}`,
        deck: 'lower',
        isBooked: false,
        price: fare,
        isLadies: false,
        passenger: null,
      })),
      bookedSeatsList: [],
    };
  }

  const direction = scheduleConfig.direction || 'outbound';
  const seed = pseudoHash(`${bus._id}_${dateStr}_${direction}`);

  let occupancyTarget;
  if (isPast) {
    occupancyTarget = 0.88 + ((seed % 9) / 100);
  } else if (isToday) {
    occupancyTarget = 0.76 + ((seed % 9) / 100);
  } else {
    const daysAhead = Math.max(1, Math.floor((new Date(dateStr) - new Date(today)) / (1000 * 60 * 60 * 24)));
    occupancyTarget = Math.max(0.25, 0.65 - (daysAhead * 0.12) + ((seed % 8) / 100));
  }

  const bookedCount = Math.min(totalSeats, Math.max(8, Math.round(totalSeats * occupancyTarget)));

  const isSleeper = (bus.busType || '').includes('Sleeper');
  const lowerCount = isSleeper ? Math.floor(totalSeats / 2) : totalSeats;
  const upperCount = isSleeper ? totalSeats - lowerCount : 0;

  const seats = [];
  let passengerIndex = 0;

  // Active route stops
  const fromStop = scheduleConfig.from || (direction === 'return' ? 'Indore Radisson' : 'Bhopal ISBT');
  const toStop = scheduleConfig.to || (direction === 'return' ? 'Bhopal ISBT' : 'Indore Radisson');

  // Lower Deck
  for (let i = 1; i <= lowerCount; i++) {
    const seatNum = isSleeper ? `L${i}` : `S${i}`;
    const customMatch = customBookings.find(c => c.number === seatNum);
    const seatSeed = pseudoHash(`${bus._id}_${dateStr}_${direction}_${seatNum}`);
    const isBooked = customMatch ? true : ((seatSeed % totalSeats) < bookedCount);

    if (customMatch) {
      seats.push({
        number: seatNum,
        deck: 'lower',
        isBooked: true,
        price: customMatch.fare || fare,
        isLadies: customMatch.gender === 'F',
        isCustomBooking: true,
        passenger: {
          name: customMatch.name,
          gender: customMatch.gender || 'M',
          age: customMatch.age || 28,
          phone: customMatch.phone,
          pnr: customMatch.pnr || `NB-CNT-${seatNum}`,
          fromStop,
          toStop,
          boardingTime: scheduleConfig.departureTime || '21:30',
          status: 'confirmed',
          otp: customMatch.otp || '5521',
          farePaid: customMatch.fare || fare,
        }
      });
    } else if (isBooked) {
      const p = PASSENGERS_POOL[passengerIndex % PASSENGERS_POOL.length];
      passengerIndex++;
      const isBoarded = isPast ? true : isToday ? (seatSeed % 10) > 2 : false;
      seats.push({
        number: seatNum,
        deck: 'lower',
        isBooked: true,
        price: fare,
        isLadies: p.gender === 'F',
        passenger: {
          ...p,
          pnr: `NB-${(seed % 8999) + 1000}-${seatNum}`,
          fromStop,
          toStop,
          boardingTime: scheduleConfig.departureTime || '21:30',
          status: isBoarded ? 'boarded' : 'confirmed',
          otp: String(1000 + (seatSeed % 9000)),
          farePaid: fare,
        }
      });
    } else {
      seats.push({
        number: seatNum,
        deck: 'lower',
        isBooked: false,
        price: fare,
        isLadies: false,
        passenger: null,
      });
    }
  }

  // Upper Deck
  if (isSleeper) {
    for (let i = 1; i <= upperCount; i++) {
      const seatNum = `U${i}`;
      const customMatch = customBookings.find(c => c.number === seatNum);
      const seatSeed = pseudoHash(`${bus._id}_${dateStr}_${direction}_${seatNum}`);
      const isBooked = customMatch ? true : ((seatSeed % totalSeats) < bookedCount);

      if (customMatch) {
        seats.push({
          number: seatNum,
          deck: 'upper',
          isBooked: true,
          price: customMatch.fare || (fare + 50),
          isLadies: customMatch.gender === 'F',
          isCustomBooking: true,
          passenger: {
            name: customMatch.name,
            gender: customMatch.gender || 'M',
            age: customMatch.age || 28,
            phone: customMatch.phone,
            pnr: customMatch.pnr || `NB-CNT-${seatNum}`,
            fromStop,
            toStop,
            boardingTime: scheduleConfig.departureTime || '21:30',
            status: 'confirmed',
            otp: customMatch.otp || '5521',
            farePaid: customMatch.fare || (fare + 50),
          }
        });
      } else if (isBooked) {
        const p = PASSENGERS_POOL[passengerIndex % PASSENGERS_POOL.length];
        passengerIndex++;
        const isBoarded = isPast ? true : isToday ? (seatSeed % 10) > 2 : false;
        seats.push({
          number: seatNum,
          deck: 'upper',
          isBooked: true,
          price: fare + 50,
          isLadies: p.gender === 'F',
          passenger: {
            ...p,
            pnr: `NB-${(seed % 8999) + 1000}-${seatNum}`,
            fromStop,
            toStop,
            boardingTime: scheduleConfig.departureTime || '21:30',
            status: isBoarded ? 'boarded' : 'confirmed',
            otp: String(1000 + (seatSeed % 9000)),
            farePaid: fare + 50,
          }
        });
      } else {
        seats.push({
          number: seatNum,
          deck: 'upper',
          isBooked: false,
          price: fare + 50,
          isLadies: false,
          passenger: null,
        });
      }
    }
  }

  const bookedSeatsList = seats.filter(s => s.isBooked);
  const boardedCount = bookedSeatsList.filter(s => s.passenger?.status === 'boarded').length;
  const occupancyPercent = Math.round((bookedSeatsList.length / totalSeats) * 100);
  const totalRevenue = bookedSeatsList.reduce((acc, s) => acc + (s.passenger?.farePaid || s.price), 0);

  return {
    dateStr,
    isPast,
    isToday,
    isFuture,
    isRestDay: false,
    totalSeats,
    bookedCount: bookedSeatsList.length,
    vacantCount: totalSeats - bookedSeatsList.length,
    occupancyPercent,
    totalRevenue,
    boardedCount,
    pendingBoardingCount: bookedSeatsList.length - boardedCount,
    seats,
    bookedSeatsList,
  };
};

const BusManagementScreen = () => {
  const navigate = useNavigate();

  const [buses, setBuses] = useState(SEEDED_BUSES);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Global Date State (Defaults to Today)
  const [selectedDate, setSelectedDate] = useState(() => getDateStr(0));

  // Day-wise Schedule & Route Customization State
  // Format: { [`${busId}_${dateStr}`]: { direction: 'outbound'|'return', corridorId: 'c1', isRestDay: false, departureTime: '21:30' } }
  const [scheduleOverrides, setScheduleOverrides] = useState({});

  // Offline / Walk-in Counter Bookings State
  // Format: { [`${busId}_${dateStr}`]: [ { number: 'L6', name: 'Vikram', phone: '987...', fare: 899 } ] }
  const [customCounterBookings, setCustomCounterBookings] = useState({});

  // Quick Counter Booking Form in modal
  const [counterBookingSeat, setCounterBookingSeat] = useState(null);
  const [counterName, setCounterName] = useState('');
  const [counterPhone, setCounterPhone] = useState('');
  const [counterFare, setCounterFare] = useState('');
  const [counterSuccess, setCounterSuccess] = useState('');

  // Active modal inspection
  const [inspectingBus, setInspectingBus] = useState(null);
  const [inspectModalDate, setInspectModalDate] = useState(() => getDateStr(0));
  const [activeTab, setActiveTab] = useState('deck'); // 'deck' | 'manifest' | 'history'
  const [activeDeck, setActiveDeck] = useState('lower'); // 'lower' | 'upper'
  const [selectedPassenger, setSelectedPassenger] = useState(null);
  const [manifestFilter, setManifestFilter] = useState('all');
  const [searchManifestQuery, setSearchManifestQuery] = useState('');

  // New Coach Registration Form
  const [newBus, setNewBus] = useState({
    busName: '',
    chassisNumber: '',
    busType: 'AC Sleeper 2+1',
    totalSeats: 36,
    fare: 899,
    amenities: ['WiFi', 'Charging Port', 'Blanket'],
    homeDepotCity: 'Bhopal',
    homeDepotPincode: '462001',
  });

  // Helper to get active schedule config for any bus on a date
  const getScheduleConfig = (bus, dateStr) => {
    const key = `${bus._id}_${dateStr}`;
    const override = scheduleOverrides[key] || {};
    const defaultCorridor = bus.corridors?.[0] || {
      name: 'Bhopal ⇄ Indore',
      outbound: { from: 'Bhopal ISBT', to: 'Indore Radisson', departureTime: '21:30', arrivalTime: '06:00', fare: bus.fare || 899 },
      return: { from: 'Indore Radisson', to: 'Bhopal ISBT', departureTime: '22:00', arrivalTime: '06:30', fare: bus.fare || 899 },
    };

    const direction = override.direction || 'outbound';
    const activeLeg = direction === 'return' ? defaultCorridor.return : defaultCorridor.outbound;

    return {
      corridorName: defaultCorridor.name,
      direction,
      from: activeLeg.from,
      to: activeLeg.to,
      departureTime: override.departureTime || activeLeg.departureTime,
      arrivalTime: override.arrivalTime || activeLeg.arrivalTime,
      fare: override.fare || activeLeg.fare,
      isRestDay: override.isRestDay === true,
    };
  };

  // Toggle Outbound ⇄ Return route for a bus on the active date
  const handleToggleRouteDirection = (busId, dateStr) => {
    const key = `${busId}_${dateStr}`;
    setScheduleOverrides(prev => {
      const current = prev[key] || {};
      const newDirection = current.direction === 'return' ? 'outbound' : 'return';
      return {
        ...prev,
        [key]: {
          ...current,
          direction: newDirection,
          isRestDay: false,
        }
      };
    });
  };

  // Toggle Rest Day (Bus off duty in depot) on active date
  const handleToggleRestDay = (busId, dateStr) => {
    const key = `${busId}_${dateStr}`;
    setScheduleOverrides(prev => {
      const current = prev[key] || {};
      const newRestDay = !current.isRestDay;
      return {
        ...prev,
        [key]: {
          ...current,
          isRestDay: newRestDay,
        }
      };
    });
  };

  // Handle Offline Counter Walk-in Booking
  const handleConfirmCounterBooking = (e) => {
    e.preventDefault();
    if (!counterBookingSeat || !counterName.trim() || !counterPhone.trim()) return;

    const key = `${inspectingBus._id}_${inspectModalDate}`;
    const newEntry = {
      number: counterBookingSeat.number,
      name: counterName.trim(),
      phone: counterPhone.trim(),
      fare: Number(counterFare) || counterBookingSeat.price || 899,
      gender: 'M',
      age: 32,
      pnr: `NB-CNT-${counterBookingSeat.number}`,
      otp: String(Math.floor(1000 + Math.random() * 9000)),
    };

    setCustomCounterBookings(prev => ({
      ...prev,
      [key]: [...(prev[key] || []), newEntry]
    }));

    setCounterSuccess(`Berth ${counterBookingSeat.number} reserved for ${counterName}!`);
    setTimeout(() => {
      setCounterBookingSeat(null);
      setCounterName('');
      setCounterPhone('');
      setCounterSuccess('');
    }, 1200);
  };

  // Current modal booking dataset
  const modalBookingData = useMemo(() => {
    if (!inspectingBus) return null;
    const scheduleCfg = getScheduleConfig(inspectingBus, inspectModalDate);
    const key = `${inspectingBus._id}_${inspectModalDate}`;
    const customs = customCounterBookings[key] || [];
    return getBusBookingsForDate(inspectingBus, inspectModalDate, scheduleCfg, customs);
  }, [inspectingBus, inspectModalDate, scheduleOverrides, customCounterBookings]);

  // Overall Fleet Aggregate for selectedDate
  const fleetSummary = useMemo(() => {
    let totalSeats = 0;
    let totalBooked = 0;
    let totalRevenue = 0;
    let activeCoaches = 0;

    buses.forEach(b => {
      const cfg = getScheduleConfig(b, selectedDate);
      if (!cfg.isRestDay && b.isActive) {
        activeCoaches++;
        const key = `${b._id}_${selectedDate}`;
        const customs = customCounterBookings[key] || [];
        const data = getBusBookingsForDate(b, selectedDate, cfg, customs);
        totalSeats += data.totalSeats;
        totalBooked += data.bookedCount;
        totalRevenue += data.totalRevenue;
      }
    });

    const fleetOccupancy = totalSeats > 0 ? Math.round((totalBooked / totalSeats) * 100) : 0;
    return {
      totalSeats,
      totalBooked,
      totalRevenue,
      activeCoaches,
      fleetOccupancy,
    };
  }, [buses, selectedDate, scheduleOverrides, customCounterBookings]);

  // Open inspector for a bus
  const handleOpenInspector = (bus) => {
    setInspectingBus(bus);
    setInspectModalDate(selectedDate);
    setActiveTab('deck');
    setActiveDeck('lower');
    setSelectedPassenger(null);
    setCounterBookingSeat(null);
    setSearchManifestQuery('');
    setManifestFilter('all');
  };

  const handleToggleBoarded = (seatNum) => {
    if (!modalBookingData) return;
    const target = modalBookingData.seats.find(s => s.number === seatNum);
    if (target && target.passenger) {
      target.passenger.status = target.passenger.status === 'boarded' ? 'confirmed' : 'boarded';
      if (selectedPassenger && selectedPassenger.number === seatNum) {
        setSelectedPassenger({ ...selectedPassenger, passenger: { ...target.passenger } });
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc', minHeight: '100%', paddingBottom: '30px' }}>
      
      {/* ─── Hero Header & Day-Wise Operations Bar ─── */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 100%)',
        padding: '16px 18px 20px',
        color: '#ffffff',
        borderBottomLeftRadius: '26px',
        borderBottomRightRadius: '26px',
        boxShadow: '0 8px 24px rgba(49, 46, 129, 0.25)',
      }}>
        {/* Top title and back button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => navigate('/owner/dashboard')}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.18)',
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{ fontSize: '18px', fontWeight: 900, margin: 0 }}>
                  Fleet Operations & Routes
                </h1>
                <span style={{
                  background: 'rgba(245, 158, 11, 0.25)',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                  color: '#fef08a',
                  fontSize: '10px',
                  fontWeight: 800,
                  padding: '2px 7px',
                  borderRadius: '6px',
                  textTransform: 'uppercase',
                }}>
                  Day Operations Hub
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#c7d2fe', margin: '2px 0 0' }}>
                {buses.length} Coaches • Schedule Daily Runs, Return Corridors & Berth Counters
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            style={{
              backgroundColor: '#ffffff',
              color: '#3730a3',
              border: 'none',
              borderRadius: '12px',
              padding: '8px 14px',
              fontSize: '12px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}
          >
            <Plus size={15} />
            <span>Add Coach</span>
          </button>
        </div>

        {/* ─── 14-Day Calendar Slider (Matching Mobile BusTripCalendarScreen) ─── */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.12)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          padding: '10px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#e0e7ff', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Calendar size={13} color="#fde047" />
              <span>ACTIVE SCHEDULE DATE: <strong>{getHumanDateLabel(selectedDate)}</strong> ({selectedDate})</span>
            </span>

            <span style={{
              fontSize: '10px',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '10px',
              backgroundColor: selectedDate === getDateStr(0) 
                ? 'rgba(16, 185, 129, 0.3)' 
                : selectedDate < getDateStr(0)
                  ? 'rgba(148, 163, 184, 0.25)'
                  : 'rgba(56, 189, 248, 0.3)',
              color: selectedDate === getDateStr(0) ? '#a7f3d0' : '#ffffff',
            }}>
              {selectedDate === getDateStr(0) ? '● LIVE TODAY' : selectedDate < getDateStr(0) ? '📜 COMPLETED TRIPS' : '📅 ADVANCE SCHEDULE'}
            </span>
          </div>

          {/* Quick Date Slider Pills */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', scrollbarWidth: 'none' }}>
            {[-2, -1, 0, 1, 2, 3, 4].map((offset) => {
              const dStr = getDateStr(offset);
              const isSelected = selectedDate === dStr;
              return (
                <button
                  key={dStr}
                  type="button"
                  onClick={() => setSelectedDate(dStr)}
                  style={{
                    background: isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.12)',
                    color: isSelected ? '#3730a3' : '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '5px 11px',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {offset === 0 ? '★ Today' : offset === -1 ? 'Yesterday' : offset === 1 ? 'Tomorrow' : getHumanDateLabel(dStr)}
                </button>
              );
            })}

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                padding: '4px 8px',
                fontSize: '11px',
                outline: 'none',
                cursor: 'pointer',
              }}
            />
          </div>
        </div>

        {/* ─── Fleet Operations Summary Bar for This Date ─── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '8px',
          marginTop: '12px',
        }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.10)', padding: '8px 10px', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: '#c7d2fe', fontWeight: 700 }}>ACTIVE RUNS</div>
            <div style={{ fontSize: '14px', fontWeight: 900, color: '#ffffff', marginTop: '1px' }}>
              {fleetSummary.activeCoaches} Coaches
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.10)', padding: '8px 10px', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: '#c7d2fe', fontWeight: 700 }}>BERTHS BOOKED</div>
            <div style={{ fontSize: '14px', fontWeight: 900, color: '#a7f3d0', marginTop: '1px' }}>
              {fleetSummary.totalBooked} / {fleetSummary.totalSeats}
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.10)', padding: '8px 10px', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: '#c7d2fe', fontWeight: 700 }}>FLEET OCCUPANCY</div>
            <div style={{ fontSize: '14px', fontWeight: 900, color: '#fef08a', marginTop: '1px' }}>
              {fleetSummary.fleetOccupancy}%
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.10)', padding: '8px 10px', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: '#c7d2fe', fontWeight: 700 }}>DAY REVENUE</div>
            <div style={{ fontSize: '14px', fontWeight: 900, color: '#ffffff', marginTop: '1px' }}>
              ₹{(fleetSummary.totalRevenue / 1000).toFixed(1)}k
            </div>
          </div>
        </div>
      </div>

      {/* ─── Coaches List with Day-Wise Route Scheduler & Counters ─── */}
      <div style={{ padding: '16px 16px 80px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {buses.map((bus) => {
          const scheduleCfg = getScheduleConfig(bus, selectedDate);
          const key = `${bus._id}_${selectedDate}`;
          const customs = customCounterBookings[key] || [];
          const bookingData = getBusBookingsForDate(bus, selectedDate, scheduleCfg, customs);
          const isSleeper = (bus.busType || '').includes('Sleeper');
          const isReturn = scheduleCfg.direction === 'return';

          return (
            <div
              key={bus._id}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '20px',
                padding: '16px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                border: scheduleCfg.isRestDay ? '1.5px dashed #cbd5e1' : '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                opacity: scheduleCfg.isRestDay ? 0.8 : 1,
              }}
            >
              {/* Top Row: Reg No, Coach Name, Active Coach Toggle */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    backgroundColor: scheduleCfg.isRestDay ? '#f1f5f9' : '#eef2ff',
                    border: '1px solid #c7d2fe',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: scheduleCfg.isRestDay ? '#64748b' : '#4f46e5',
                  }}>
                    <Bus size={24} />
                  </div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 900, color: '#0f172a' }}>
                      {bus.busName}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#059669', backgroundColor: '#ecfdf5', padding: '1px 6px', borderRadius: '4px' }}>
                        {bus.chassisNumber}
                      </span>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>
                        • {bus.busType}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Toggle / Maintenance */}
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => handleToggleRestDay(bus._id, selectedDate)}
                    style={{
                      border: '1px solid #cbd5e1',
                      borderRadius: '10px',
                      padding: '4px 8px',
                      fontSize: '10.5px',
                      fontWeight: 700,
                      backgroundColor: scheduleCfg.isRestDay ? '#fee2e2' : '#f8fafc',
                      color: scheduleCfg.isRestDay ? '#b91c1c' : '#475569',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                    title="Toggle whether coach runs on this date or takes depot rest"
                  >
                    <Wrench size={12} />
                    <span>{scheduleCfg.isRestDay ? 'Depot Rest' : 'Active Run'}</span>
                  </button>
                </div>
              </div>

              {/* ─── Day-Specific Route & Return Route System ─── */}
              {scheduleCfg.isRestDay ? (
                <div style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  color: '#991b1b',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Wrench size={15} color="#dc2626" />
                    <span><strong>Scheduled Rest Day</strong> for {getHumanDateLabel(selectedDate)} (Maintenance & Depot Wash)</span>
                  </div>
                  <button
                    onClick={() => handleToggleRestDay(bus._id, selectedDate)}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #fca5a5',
                      color: '#991b1b',
                      borderRadius: '8px',
                      padding: '3px 8px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Resume Run
                  </button>
                </div>
              ) : (
                <div style={{
                  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '14px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}>
                  {/* Route Corridor Banner */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{
                        background: isReturn ? '#fef3c7' : '#e0e7ff',
                        color: isReturn ? '#92400e' : '#3730a3',
                        fontSize: '10.5px',
                        fontWeight: 800,
                        padding: '2px 7px',
                        borderRadius: '6px',
                        textTransform: 'uppercase',
                      }}>
                        {isReturn ? '↩ Return Leg' : '➔ Outbound Leg'}
                      </span>
                      <strong style={{ fontSize: '13px', color: '#0f172a' }}>
                        {scheduleCfg.from} ➔ {scheduleCfg.to}
                      </strong>
                    </div>

                    {/* 1-Tap Return Route Swapper */}
                    <button
                      type="button"
                      onClick={() => handleToggleRouteDirection(bus._id, selectedDate)}
                      style={{
                        background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '4px 10px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        boxShadow: '0 2px 6px rgba(79, 70, 229, 0.25)',
                      }}
                      title="Switch between Outbound route and Return route"
                    >
                      <ArrowLeftRight size={12} />
                      <span>{isReturn ? 'Switch to Outbound' : 'Switch to Return'}</span>
                    </button>
                  </div>

                  {/* Timings & Base Fare */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px', color: '#64748b' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={13} color="#0284c7" />
                      <span>Dep: <strong style={{ color: '#0f172a' }}>{scheduleCfg.departureTime}</strong> • Arr: <strong style={{ color: '#0f172a' }}>{scheduleCfg.arrivalTime}</strong></span>
                    </span>
                    <span style={{ fontWeight: 800, color: '#059669' }}>
                      ₹{scheduleCfg.fare} Base Sleeper
                    </span>
                  </div>
                </div>
              )}

              {/* ─── LIVE DATE OCCUPANCY & METRICS COUNTER ─── */}
              {!scheduleCfg.isRestDay && (
                <div style={{
                  backgroundColor: '#ffffff',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '14px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Users size={14} color="#4f46e5" />
                      <span style={{ fontSize: '12px', fontWeight: 800, color: '#1e293b' }}>
                        {getHumanDateLabel(selectedDate)} Occupancy Counter:
                      </span>
                    </div>

                    <span style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      color: bookingData.occupancyPercent >= 75 ? '#059669' : '#d97706',
                      backgroundColor: bookingData.occupancyPercent >= 75 ? '#ecfdf5' : '#fffbeb',
                      padding: '2px 8px',
                      borderRadius: '6px',
                    }}>
                      {bookingData.occupancyPercent}% Occupied ({bookingData.bookedCount}/{bookingData.totalSeats})
                    </span>
                  </div>

                  {/* Occupancy Progress Bar */}
                  <div style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: '#e2e8f0',
                    borderRadius: '4px',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      width: `${bookingData.occupancyPercent}%`,
                      height: '100%',
                      backgroundColor: bookingData.occupancyPercent >= 75 ? '#10b981' : '#6366f1',
                      borderRadius: '4px',
                      transition: 'width 0.3s ease',
                    }} />
                  </div>

                  {/* Sub-metrics: Vacant Berths & Revenue for that date */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                    <span>🟢 Vacant Berths: <strong style={{ color: '#0f172a' }}>{bookingData.vacantCount} Available</strong></span>
                    <span>💰 Est. Revenue: <strong style={{ color: '#059669' }}>₹{bookingData.totalRevenue.toLocaleString()}</strong></span>
                  </div>
                </div>
              )}

              {/* Action Buttons: Inspect Bookings & Routes */}
              <div style={{ display: 'flex', gap: '8px', paddingTop: '4px' }}>
                <button
                  type="button"
                  onClick={() => handleOpenInspector(bus)}
                  style={{
                    flex: 1.2,
                    background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '10px 14px',
                    fontSize: '12px',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    boxShadow: '0 3px 10px rgba(79, 70, 229, 0.3)',
                  }}
                >
                  <Eye size={15} />
                  <span>View Seats & Passenger Manifest</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/owner/routes/builder')}
                  style={{
                    flex: 0.8,
                    backgroundColor: '#f1f5f9',
                    color: '#334155',
                    border: '1px solid #cbd5e1',
                    borderRadius: '12px',
                    padding: '10px 12px',
                    fontSize: '12px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                  }}
                >
                  <span>Route Engine</span>
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── 2D SEAT MAP & OFFLINE DEPOT COUNTER BOOKING MODAL ─── */}
      {inspectingBus && modalBookingData && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            width: '100%',
            maxWidth: '480px',
            borderTopLeftRadius: '28px',
            borderTopRightRadius: '28px',
            maxHeight: '92vh',
            overflowY: 'auto',
            padding: '18px 16px 30px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            boxShadow: '0 -10px 30px rgba(0,0,0,0.25)',
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '17px', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                    {inspectingBus.busName}
                  </h3>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#059669', background: '#ecfdf5', padding: '2px 6px', borderRadius: '4px' }}>
                    {inspectingBus.chassisNumber}
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                  {inspectingBus.busType} • {getScheduleConfig(inspectingBus, inspectModalDate).from} ➔ {getScheduleConfig(inspectingBus, inspectModalDate).to}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setInspectingBus(null)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={18} color="#64748b" />
              </button>
            </div>

            {/* Date Switcher Bar Inside Modal */}
            <div style={{
              backgroundColor: '#f1f5f9',
              borderRadius: '14px',
              padding: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#334155', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={13} color="#4f46e5" />
                  <span>Inspecting Date:</span>
                </span>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#4f46e5' }}>
                  {getHumanDateLabel(inspectModalDate)} ({inspectModalDate})
                </span>
              </div>

              {/* Quick Offset Buttons */}
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', scrollbarWidth: 'none' }}>
                {[-2, -1, 0, 1, 2].map((offset) => {
                  const dStr = getDateStr(offset);
                  const isCurrent = inspectModalDate === dStr;
                  return (
                    <button
                      key={dStr}
                      type="button"
                      onClick={() => setInspectModalDate(dStr)}
                      style={{
                        flex: 1,
                        background: isCurrent ? '#4f46e5' : '#ffffff',
                        color: isCurrent ? '#ffffff' : '#334155',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        padding: '6px 8px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {offset === 0 ? '★ Today' : offset === -1 ? 'Yesterday' : offset === 1 ? 'Tomorrow' : getHumanDateLabel(dStr)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4 Metric Tiles for this Date */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px' }}>
              <div style={{ background: '#eef2ff', padding: '10px 8px', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '10px', color: '#6366f1', fontWeight: 800 }}>OCCUPANCY</div>
                <div style={{ fontSize: '15px', fontWeight: 900, color: '#3730a3', marginTop: '2px' }}>
                  {modalBookingData.occupancyPercent}%
                </div>
              </div>

              <div style={{ background: '#ecfdf5', padding: '10px 8px', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '10px', color: '#059669', fontWeight: 800 }}>BOOKED</div>
                <div style={{ fontSize: '15px', fontWeight: 900, color: '#065f46', marginTop: '2px' }}>
                  {modalBookingData.bookedCount}/{modalBookingData.totalSeats}
                </div>
              </div>

              <div style={{ background: '#fffbeb', padding: '10px 8px', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '10px', color: '#d97706', fontWeight: 800 }}>VACANT</div>
                <div style={{ fontSize: '15px', fontWeight: 900, color: '#92400e', marginTop: '2px' }}>
                  {modalBookingData.vacantCount}
                </div>
              </div>

              <div style={{ background: '#fdf2f8', padding: '10px 8px', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '10px', color: '#db2777', fontWeight: 800 }}>REVENUE</div>
                <div style={{ fontSize: '14px', fontWeight: 900, color: '#9d174d', marginTop: '2px' }}>
                  ₹{(modalBookingData.totalRevenue / 1000).toFixed(1)}k
                </div>
              </div>
            </div>

            {/* View Mode Navigation Tabs */}
            <div style={{
              display: 'flex',
              background: '#e2e8f0',
              borderRadius: '12px',
              padding: '3px',
            }}>
              <button
                type="button"
                onClick={() => setActiveTab('deck')}
                style={{
                  flex: 1,
                  background: activeTab === 'deck' ? '#ffffff' : 'transparent',
                  color: activeTab === 'deck' ? '#0f172a' : '#64748b',
                  border: 'none',
                  borderRadius: '9px',
                  padding: '7px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: activeTab === 'deck' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                2D Berth Deck Map
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('manifest')}
                style={{
                  flex: 1,
                  background: activeTab === 'manifest' ? '#ffffff' : 'transparent',
                  color: activeTab === 'manifest' ? '#0f172a' : '#64748b',
                  border: 'none',
                  borderRadius: '9px',
                  padding: '7px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: activeTab === 'manifest' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                Manifest ({modalBookingData.bookedCount})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('history')}
                style={{
                  flex: 1,
                  background: activeTab === 'history' ? '#ffffff' : 'transparent',
                  color: activeTab === 'history' ? '#0f172a' : '#64748b',
                  border: 'none',
                  borderRadius: '9px',
                  padding: '7px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: activeTab === 'history' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                Date Trends
              </button>
            </div>

            {/* ─── TAB 1: 2D SEAT & BERTH DECK ─── */}
            {activeTab === 'deck' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Deck Selector */}
                {isSleeper && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setActiveDeck('lower')}
                      style={{
                        flex: 1,
                        background: activeDeck === 'lower' ? '#4f46e5' : '#ffffff',
                        color: activeDeck === 'lower' ? '#ffffff' : '#475569',
                        border: '1.5px solid #4f46e5',
                        borderRadius: '10px',
                        padding: '6px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Lower Deck (L1 - L18)
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveDeck('upper')}
                      style={{
                        flex: 1,
                        background: activeDeck === 'upper' ? '#4f46e5' : '#ffffff',
                        color: activeDeck === 'upper' ? '#ffffff' : '#475569',
                        border: '1.5px solid #4f46e5',
                        borderRadius: '10px',
                        padding: '6px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Upper Deck (U1 - U18)
                    </button>
                  </div>
                )}

                {/* Color Legend */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 10px',
                  background: '#f8fafc',
                  borderRadius: '8px',
                  fontSize: '10px',
                  fontWeight: 700,
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#ffffff', border: '1px solid #94a3b8' }} />
                    <span>Vacant (Tap to Book)</span>
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#38bdf8' }} />
                    <span>Male</span>
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#f472b6' }} />
                    <span>Female</span>
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#10b981' }} />
                    <span>Boarded ✓</span>
                  </span>
                </div>

                {/* 2D Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(6, 1fr)',
                  gap: '8px',
                  backgroundColor: '#f8fafc',
                  padding: '12px',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                }}>
                  {modalBookingData.seats
                    .filter(s => s.deck === activeDeck)
                    .map((seat) => {
                      const isSelected = selectedPassenger?.number === seat.number;
                      let bgColor = '#ffffff';
                      let textColor = '#334155';
                      let borderColor = '#cbd5e1';

                      if (seat.isBooked) {
                        if (seat.passenger?.status === 'boarded') {
                          bgColor = '#ecfdf5';
                          textColor = '#065f46';
                          borderColor = '#10b981';
                        } else if (seat.isLadies) {
                          bgColor = '#fdf2f8';
                          textColor = '#9d174d';
                          borderColor = '#f472b6';
                        } else {
                          bgColor = '#f0f9ff';
                          textColor = '#0369a1';
                          borderColor = '#38bdf8';
                        }
                      }

                      return (
                        <div
                          key={seat.number}
                          onClick={() => {
                            setSelectedPassenger(seat);
                            if (!seat.isBooked) {
                              setCounterBookingSeat(seat);
                              setCounterFare(String(seat.price || 899));
                            } else {
                              setCounterBookingSeat(null);
                            }
                          }}
                          style={{
                            backgroundColor: bgColor,
                            border: `2px solid ${isSelected ? '#4f46e5' : borderColor}`,
                            borderRadius: '8px',
                            padding: '8px 2px',
                            textAlign: 'center',
                            cursor: 'pointer',
                            boxShadow: isSelected ? '0 0 0 2px #4f46e5' : 'none',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <div style={{ fontSize: '11px', fontWeight: 900, color: textColor }}>
                            {seat.number}
                          </div>
                          <div style={{
                            fontSize: '9px',
                            color: textColor,
                            fontWeight: 700,
                            marginTop: '2px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            padding: '0 2px',
                          }}>
                            {seat.isBooked ? seat.passenger?.name.split(' ')[0] : 'Vacant'}
                          </div>
                        </div>
                      );
                    })}
                </div>

                {/* ─── Selected Booked Seat Passenger Details ─── */}
                {selectedPassenger && selectedPassenger.isBooked && (
                  <div style={{
                    backgroundColor: '#ffffff',
                    border: '1.5px solid #4f46e5',
                    borderRadius: '16px',
                    padding: '14px',
                    boxShadow: '0 4px 14px rgba(79, 70, 229, 0.15)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          backgroundColor: '#4f46e5',
                          color: '#ffffff',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 900,
                        }}>
                          {selectedPassenger.number}
                        </span>
                        <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                          {selectedPassenger.passenger?.name}
                        </span>
                      </div>

                      <span style={{
                        fontSize: '10px',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '8px',
                        backgroundColor: selectedPassenger.passenger?.status === 'boarded' ? '#ecfdf5' : '#fffbeb',
                        color: selectedPassenger.passenger?.status === 'boarded' ? '#059669' : '#d97706',
                      }}>
                        {selectedPassenger.passenger?.status === 'boarded' ? '✓ Boarded (OTP Verified)' : 'Awaiting Boarding'}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '11px', color: '#475569' }}>
                      <div>📱 Phone: <strong style={{ color: '#0f172a' }}>{selectedPassenger.passenger?.phone}</strong></div>
                      <div>🎟️ PNR: <strong style={{ color: '#0f172a' }}>{selectedPassenger.passenger?.pnr}</strong></div>
                      <div>📍 From: <strong style={{ color: '#0f172a' }}>{selectedPassenger.passenger?.fromStop}</strong></div>
                      <div>🏁 To: <strong style={{ color: '#0f172a' }}>{selectedPassenger.passenger?.toStop}</strong></div>
                      <div>💵 Fare Paid: <strong style={{ color: '#059669' }}>₹{selectedPassenger.passenger?.farePaid}</strong></div>
                      <div>🔑 OTP: <strong style={{ color: '#4f46e5' }}>{selectedPassenger.passenger?.otp}</strong></div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                      <button
                        type="button"
                        onClick={() => handleToggleBoarded(selectedPassenger.number)}
                        style={{
                          flex: 1,
                          background: selectedPassenger.passenger?.status === 'boarded' ? '#f1f5f9' : '#10b981',
                          color: selectedPassenger.passenger?.status === 'boarded' ? '#475569' : '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '8px',
                          fontSize: '11px',
                          fontWeight: 800,
                          cursor: 'pointer',
                        }}
                      >
                        {selectedPassenger.passenger?.status === 'boarded' ? 'Unmark Boarding' : 'Mark Passenger as Boarded ✓'}
                      </button>

                      <a
                        href={`tel:${selectedPassenger.passenger?.phone}`}
                        style={{
                          background: '#eef2ff',
                          color: '#4f46e5',
                          border: '1px solid #c7d2fe',
                          borderRadius: '8px',
                          padding: '8px 12px',
                          fontSize: '11px',
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          textDecoration: 'none',
                        }}
                      >
                        <Phone size={12} />
                        <span>Call</span>
                      </a>
                    </div>
                  </div>
                )}

                {/* ─── NEW: QUICK DEPOT COUNTER WALK-IN BOOKING (For Vacant Berth) ─── */}
                {selectedPassenger && !selectedPassenger.isBooked && (
                  <div style={{
                    backgroundColor: '#ffffff',
                    border: '1.5px solid #10b981',
                    borderRadius: '16px',
                    padding: '14px',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.15)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          backgroundColor: '#10b981',
                          color: '#ffffff',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 900,
                        }}>
                          {selectedPassenger.number}
                        </span>
                        <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                          Quick Depot Counter Booking
                        </span>
                      </div>
                      <span style={{ fontSize: '10.5px', color: '#059669', fontWeight: 700 }}>
                        Vacant Berth
                      </span>
                    </div>

                    {counterSuccess ? (
                      <div style={{
                        background: '#ecfdf5',
                        border: '1px solid #a7f3d0',
                        color: '#065f46',
                        padding: '10px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}>
                        <CheckCircle2 size={16} />
                        <span>{counterSuccess}</span>
                      </div>
                    ) : (
                      <form onSubmit={handleConfirmCounterBooking} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#475569', marginBottom: '2px' }}>
                              PASSENGER NAME
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Vikram Sharma"
                              value={counterName}
                              onChange={(e) => setCounterName(e.target.value)}
                              style={{
                                width: '100%',
                                padding: '7px 10px',
                                background: '#f8fafc',
                                border: '1px solid #cbd5e1',
                                borderRadius: '8px',
                                fontSize: '12px',
                                boxSizing: 'border-box',
                              }}
                            />
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#475569', marginBottom: '2px' }}>
                              PHONE NUMBER
                            </label>
                            <input
                              type="tel"
                              required
                              placeholder="10-digit mobile"
                              value={counterPhone}
                              onChange={(e) => setCounterPhone(e.target.value)}
                              style={{
                                width: '100%',
                                padding: '7px 10px',
                                background: '#f8fafc',
                                border: '1px solid #cbd5e1',
                                borderRadius: '8px',
                                fontSize: '12px',
                                boxSizing: 'border-box',
                              }}
                            />
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                          <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#475569', marginBottom: '2px' }}>
                              FARE TO COLLECT (₹)
                            </label>
                            <input
                              type="number"
                              required
                              value={counterFare}
                              onChange={(e) => setCounterFare(e.target.value)}
                              style={{
                                width: '100%',
                                padding: '7px 10px',
                                background: '#f8fafc',
                                border: '1px solid #cbd5e1',
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontWeight: 700,
                                color: '#047857',
                                boxSizing: 'border-box',
                              }}
                            />
                          </div>

                          <div style={{ flex: 1.2, paddingTop: '16px' }}>
                            <button
                              type="submit"
                              style={{
                                width: '100%',
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '8px',
                                fontSize: '12px',
                                fontWeight: 800,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '4px',
                                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                              }}
                            >
                              <Check size={14} />
                              <span>Confirm Counter Ticket</span>
                            </button>
                          </div>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ─── TAB 2: PASSENGER MANIFEST TABLE ─── */}
            {activeTab === 'manifest' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{
                  background: '#f8fafc',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <Search size={15} color="#64748b" />
                  <input
                    type="text"
                    placeholder="Search passenger name, phone, or seat..."
                    value={searchManifestQuery}
                    onChange={(e) => setSearchManifestQuery(e.target.value)}
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

                <div style={{ display: 'flex', gap: '6px' }}>
                  {[
                    { id: 'all', label: `All Booked (${modalBookingData.bookedCount})` },
                    { id: 'boarded', label: `Boarded (${modalBookingData.boardedCount})` },
                    { id: 'pending', label: `Pending (${modalBookingData.pendingBoardingCount})` },
                  ].map((chip) => (
                    <button
                      key={chip.id}
                      type="button"
                      onClick={() => setManifestFilter(chip.id)}
                      style={{
                        background: manifestFilter === chip.id ? '#4f46e5' : '#ffffff',
                        color: manifestFilter === chip.id ? '#ffffff' : '#475569',
                        border: '1px solid #cbd5e1',
                        borderRadius: '14px',
                        padding: '4px 10px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '350px', overflowY: 'auto' }}>
                  {modalBookingData.bookedSeatsList
                    .filter((s) => {
                      if (!searchManifestQuery) return true;
                      const q = searchManifestQuery.toLowerCase();
                      return (
                        s.number.toLowerCase().includes(q) ||
                        s.passenger?.name.toLowerCase().includes(q) ||
                        s.passenger?.phone.includes(q)
                      );
                    })
                    .filter((s) => {
                      if (manifestFilter === 'boarded') return s.passenger?.status === 'boarded';
                      if (manifestFilter === 'pending') return s.passenger?.status !== 'boarded';
                      return true;
                    })
                    .map((seat) => (
                      <div
                        key={seat.number}
                        style={{
                          backgroundColor: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px',
                          padding: '10px 12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '10px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            backgroundColor: seat.passenger?.status === 'boarded' ? '#ecfdf5' : '#eef2ff',
                            color: seat.passenger?.status === 'boarded' ? '#059669' : '#4f46e5',
                            fontWeight: 900,
                            fontSize: '13px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}>
                            {seat.number}
                          </div>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                              {seat.passenger?.name} ({seat.passenger?.gender}, {seat.passenger?.age})
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>
                              📞 {seat.passenger?.phone} • PNR: {seat.passenger?.pnr}
                            </div>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                          <span style={{
                            fontSize: '10px',
                            fontWeight: 800,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            backgroundColor: seat.passenger?.status === 'boarded' ? '#ecfdf5' : '#fffbeb',
                            color: seat.passenger?.status === 'boarded' ? '#059669' : '#d97706',
                          }}>
                            {seat.passenger?.status === 'boarded' ? 'Boarded ✓' : 'Confirmed'}
                          </span>
                          <span style={{ fontSize: '11px', fontWeight: 800, color: '#059669' }}>
                            ₹{seat.passenger?.farePaid}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* ─── TAB 3: DATE TRENDS ─── */}
            {activeTab === 'history' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#334155' }}>
                  Occupancy & Financial Trends (Past 2 Days to Next 2 Days):
                </div>

                {[-2, -1, 0, 1, 2].map((offset) => {
                  const dateStr = getDateStr(offset);
                  const cfg = getScheduleConfig(inspectingBus, dateStr);
                  const key = `${inspectingBus._id}_${dateStr}`;
                  const customs = customCounterBookings[key] || [];
                  const data = getBusBookingsForDate(inspectingBus, dateStr, cfg, customs);
                  const isCurrent = dateStr === inspectModalDate;

                  return (
                    <div
                      key={dateStr}
                      onClick={() => setInspectModalDate(dateStr)}
                      style={{
                        backgroundColor: isCurrent ? '#eef2ff' : '#ffffff',
                        border: `1.5px solid ${isCurrent ? '#4f46e5' : '#e2e8f0'}`,
                        borderRadius: '12px',
                        padding: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 900, color: '#0f172a' }}>
                            {getHumanDateLabel(dateStr)}
                          </span>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>
                            ({dateStr})
                          </span>
                          {offset < 0 && (
                            <span style={{ fontSize: '9px', fontWeight: 800, color: '#64748b', background: '#f1f5f9', padding: '1px 5px', borderRadius: '4px' }}>
                              Finished Trip
                            </span>
                          )}
                          {offset === 0 && (
                            <span style={{ fontSize: '9px', fontWeight: 800, color: '#059669', background: '#ecfdf5', padding: '1px 5px', borderRadius: '4px' }}>
                              Live Today
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>
                          {data.bookedCount} / {data.totalSeats} Berths Occupied ({data.occupancyPercent}%)
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '14px', fontWeight: 900, color: '#059669' }}>
                          ₹{data.totalRevenue.toLocaleString()}
                        </div>
                        <div style={{ fontSize: '10px', color: '#6366f1', fontWeight: 700 }}>
                          {isCurrent ? '● Active View' : 'Click to Load →'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Close Modal Button */}
            <button
              type="button"
              onClick={() => setInspectingBus(null)}
              style={{
                marginTop: '8px',
                width: '100%',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '12px',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Close Seat Inspector
            </button>
          </div>
        </div>
      )}

      {/* ─── Add Coach Modal ─── */}
      {showAddModal && (
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
            gap: '14px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                  Register New Coach
                </h3>
                <span style={{ fontSize: '11px', color: '#64748b' }}>
                  Add coach to fleet and configure corridors
                </span>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} color="#64748b" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (!newBus.busName.trim() || !newBus.chassisNumber.trim()) return;
              const created = {
                _id: 'b_' + Date.now(),
                busName: newBus.busName.trim(),
                chassisNumber: newBus.chassisNumber.trim().toUpperCase(),
                busType: newBus.busType,
                totalSeats: Number(newBus.totalSeats),
                fare: Number(newBus.fare) || 899,
                isActive: true,
                amenities: newBus.amenities,
                homeDepot: { city: newBus.homeDepotCity, pincode: newBus.homeDepotPincode },
                corridors: [
                  {
                    id: 'c1',
                    name: `${newBus.homeDepotCity} ⇄ Bhopal`,
                    outbound: { from: `${newBus.homeDepotCity} Stand`, to: 'Bhopal ISBT', departureTime: '21:30', arrivalTime: '06:00', fare: Number(newBus.fare) || 899 },
                    return: { from: 'Bhopal ISBT', to: `${newBus.homeDepotCity} Stand`, departureTime: '22:00', arrivalTime: '06:30', fare: Number(newBus.fare) || 899 },
                  }
                ]
              };
              setBuses([created, ...buses]);
              setShowAddModal(false);
            }} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                  Coach / Operator Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Night Bus Royal Star"
                  value={newBus.busName}
                  onChange={(e) => setNewBus({ ...newBus, busName: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '10px',
                    fontSize: '13px',
                    marginTop: '4px',
                    boxSizing: 'border-box',
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                  Chassis / Reg Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. MP-04-NB-9988"
                  value={newBus.chassisNumber}
                  onChange={(e) => setNewBus({ ...newBus, chassisNumber: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '10px',
                    fontSize: '13px',
                    marginTop: '4px',
                    boxSizing: 'border-box',
                  }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                    Coach Type
                  </label>
                  <select
                    value={newBus.busType}
                    onChange={(e) => setNewBus({ ...newBus, busType: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1.5px solid #cbd5e1',
                      borderRadius: '10px',
                      fontSize: '13px',
                      marginTop: '4px',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="AC Sleeper 2+1">AC Sleeper 2+1 (36)</option>
                    <option value="Multi-Axle Volvo Sleeper">Multi-Axle Volvo (40)</option>
                    <option value="Push-Back AC Seater">Push-Back Seater (45)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                    Base Fare (₹)
                  </label>
                  <input
                    type="number"
                    value={newBus.fare}
                    onChange={(e) => setNewBus({ ...newBus, fare: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1.5px solid #cbd5e1',
                      borderRadius: '10px',
                      fontSize: '13px',
                      marginTop: '4px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                style={{
                  marginTop: '10px',
                  backgroundColor: '#4f46e5',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px',
                  fontSize: '14px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 3px 10px rgba(79, 70, 229, 0.3)',
                }}
              >
                Register & Initialize Corridors
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusManagementScreen;
