// ==================== src/services/staffService.js ====================
import api from './api';

/**
 * Staff Service - Handles staff-specific operations like passenger lists, shift management
 */

// Get current active trip for the staff member
export const getActiveTrip = async () => {
  try {
    const response = await api.get('/staff/active-trip');
    return response;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch active trip');
  }
};

// Get passenger manifest for a specific trip
export const getPassengerManifest = async (tripId) => {
  try {
    const response = await api.get(`/staff/trip/${tripId}/manifest`);
    return response;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch manifest');
  }
};

// Verify boarding (OR Scan or OTP)
export const verifyBoarding = async (data) => {
  try {
    const response = await api.post('/staff/verify-boarding', {
      segmentId: data.segmentId,
      otp: data.otp,
      method: data.method || 'qr_scan',
      location: data.location
    });
    return response;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Verification failed');
  }
};

// Verify Drop/Exit
export const verifyDrop = async (data) => {
  try {
    const response = await api.post('/staff/verify-drop', {
      segmentId: data.segmentId,
      otp: data.otp,
      location: data.location
    });
    return response;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Drop verification failed');
  }
};

// Manual Position Update
export const updatePosition = async (data) => {
  try {
    const response = await api.post('/staff/update-position', {
      tripId: data.tripId,
      stopIndex: data.stopIndex,
      location: data.location,
      isArrival: data.isArrival
    });
    return response;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update position');
  }
};

// Update Trip Status (Running, Paused, Completed)
export const updateTripStatus = async (tripId, status, details) => {
  try {
    const response = await api.post('/staff/trip-status', {
      tripId,
      status,
      details
    });
    return response;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update trip status');
  }
};

export const verifyTicketQR = async (qrData) => {
  return await verifyBoarding({ segmentId: qrData, method: 'qr_scan' });
};

export const verifyTicketManual = async (pnr, otp) => {
  return await verifyBoarding({ segmentId: pnr, otp, method: 'manual' });
};

export default {
  getActiveTrip,
  getPassengerManifest,
  verifyBoarding,
  verifyDrop,
  updatePosition,
  updateTripStatus,
  verifyTicketQR,
  verifyTicketManual
};
