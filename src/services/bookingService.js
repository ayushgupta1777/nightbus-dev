// ==================== src/services/bookingService.js ====================
import api from './api';

export const createBooking = async (bookingData) => {
  return await api.post('/bookings', bookingData);
};

export const getBookingDetails = async (bookingId) => {
  return await api.get(`/bookings/${bookingId}`);
};

export const getUserBookings = async (userId, params = {}) => {
  return await api.get(`/bookings/user/${userId}`, params);
};

export const cancelBooking = async (bookingId, reason = '') => {
  return await api.put(`/bookings/${bookingId}/cancel`, { reason });
};

export const getQRCode = async (bookingId, segmentId = null) => {
  const url = segmentId 
    ? `/bookings/${bookingId}/qr-code?segmentId=${segmentId}`
    : `/bookings/${bookingId}/qr-code`;
  return await api.get(url);
};

export const verifyBooking = async (bookingId, segmentId) => {
  return await api.post('/boarding/verify', { bookingId, segmentId });
};

export const createRazorpayOrder = async (orderData) => {
  return await api.post('/payment/create-order', orderData);
};

export const verifyRazorpayPayment = async (verificationData) => {
  return await api.post('/payment/verify-payment', verificationData);
};

export const applyCoupon = async (code, amount) => {
  return await api.post('/coupons/apply', { code, amount });
};
