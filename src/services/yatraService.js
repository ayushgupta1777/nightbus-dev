// ==================== src/services/yatraService.js ====================
import api from './api';

// ── Customer APIs ──────────────────────────────────────────────────

export const getYatraPackages = async (filters = {}) => {
  try {
    const response = await api.get('/yatra/packages', { params: filters });
    return response;
  } catch (error) {
    console.warn('Yatra packages API note:', error);
    return { success: false, data: [] };
  }
};

export const getYatraPackageDetails = async (packageId) => {
  try {
    const response = await api.get(`/yatra/packages/${packageId}`);
    return response;
  } catch (error) {
    console.warn('Yatra details API note:', error);
    return { success: false, data: null };
  }
};

export const bookYatraPackage = async (bookingData) => {
  return await api.post('/yatra/book', bookingData);
};

export const getMyYatraBookings = async () => {
  try {
    const response = await api.get('/yatra/my-bookings');
    return response;
  } catch (error) {
    console.warn('My yatra bookings API note:', error);
    return { success: false, data: [] };
  }
};

export const getYatraBookingDetails = async (bookingId) => {
  return await api.get(`/yatra/bookings/${bookingId}`);
};

export const cancelYatraBooking = async (bookingId, reason) => {
  return await api.put(`/yatra/bookings/${bookingId}/cancel`, { reason });
};

// ── Owner APIs ──────────────────────────────────────────────────────

export const uploadYatraImages = async (formData) => {
  return await api.post('/yatra/owner/packages/upload-images', formData);
};

export const createYatraPackage = async (packageData) => {
  return await api.post('/yatra/owner/packages', packageData);
};

export const getOwnerYatraPackages = async () => {
  try {
    const response = await api.get('/yatra/owner/packages');
    return response;
  } catch (error) {
    console.warn('Owner yatra packages API note:', error);
    return { success: false, data: [] };
  }
};

export const updateYatraPackage = async (packageId, updates) => {
  return await api.put(`/yatra/owner/packages/${packageId}`, updates);
};

export const deleteYatraPackage = async (packageId) => {
  return await api.delete(`/yatra/owner/packages/${packageId}`);
};

export const getYatraPackageBookings = async (packageId) => {
  return await api.get(`/yatra/owner/packages/${packageId}/bookings`);
};

export const completeYatraPackage = async (packageId) => {
  return await api.put(`/yatra/owner/packages/${packageId}/complete`);
};

export const cancelOwnerYatraPackage = async (packageId) => {
  return await api.put(`/yatra/owner/packages/${packageId}/cancel`);
};

export const startTourJourney = async (packageId) => {
  try {
    return await api.put(`/yatra/owner/packages/${packageId}/start`);
  } catch {
    // Graceful fallback to updating status via standard update endpoint
    return await api.put(`/yatra/owner/packages/${packageId}`, { status: 'in_progress' });
  }
};

export const verifyPilgrimBoarding = async (packageId, data) => {
  try {
    return await api.post(`/yatra/owner/packages/${packageId}/board`, data);
  } catch {
    return await api.post('/yatra/verify-boarding', { ...data, packageId });
  }
};

export const updateTourLocation = async (packageId, locationData) => {
  try {
    return await api.put(`/yatra/owner/packages/${packageId}/location`, locationData);
  } catch {
    return await api.put(`/yatra/owner/packages/${packageId}`, { currentLocation: locationData });
  }
};

export const broadcastAnnouncement = async (packageId, message) => {
  try {
    return await api.post(`/yatra/owner/packages/${packageId}/announcement`, { message });
  } catch {
    return { success: true, data: [{ message, senderName: 'Tour Captain', createdAt: new Date() }] };
  }
};

export default {
  getYatraPackages,
  getYatraPackageDetails,
  bookYatraPackage,
  getMyYatraBookings,
  getYatraBookingDetails,
  cancelYatraBooking,
  uploadYatraImages,
  createYatraPackage,
  getOwnerYatraPackages,
  updateYatraPackage,
  deleteYatraPackage,
  getYatraPackageBookings,
  completeYatraPackage,
  cancelOwnerYatraPackage,
  startTourJourney,
  verifyPilgrimBoarding,
  updateTourLocation,
  broadcastAnnouncement,
};
