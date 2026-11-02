// ==================== src/services/authService.js ====================
import api from './api';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

export const storeAuthData = (token, user) => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Error storing auth data:', error);
  }
};

export const getAuthData = () => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const userStr = localStorage.getItem(USER_KEY);
    const user = userStr ? JSON.parse(userStr) : null;
    return { token, user };
  } catch (error) {
    console.error('Error retrieving auth data:', error);
    return { token: null, user: null };
  }
};

export const clearAuthData = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
};

export const sendOTP = async (phone) => {
  return await api.post('/auth/send-otp', { phone });
};

export const verifyOTP = async (phone, otp) => {
  const response = await api.post('/auth/verify-otp', { phone, otp });
  if (response.token && response.user) {
    storeAuthData(response.token, response.user);
  }
  return response;
};

export const sendEmailOTP = async (email, type = null) => {
  const payload = { email };
  if (type) payload.type = type;
  return await api.post('/auth/send-email-otp', payload);
};

export const verifyEmailOTP = async (email, otp) => {
  return await api.post('/auth/verify-email-otp', { email, otp });
};

export const login = async (email, password = null, otp = null) => {
  const payload = { email };
  if (password) payload.password = password;
  if (otp) payload.otp = otp;

  const response = await api.post('/auth/login', payload);
  if (response.token && response.user) {
    storeAuthData(response.token, response.user);
  }
  return response;
};

export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  if (response.token && response.user) {
    storeAuthData(response.token, response.user);
  }
  return response;
};

export const testLogin = async (phone, role = 'customer') => {
  const response = await api.post('/auth/test-login', { phone, role });
  if (response.success && response.token && response.user) {
    storeAuthData(response.token, response.user);
  }
  return response;
};

export const logout = async () => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    console.error('Logout API error:', error);
  } finally {
    clearAuthData();
  }
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  if (response.success && response.user) {
    const { token } = getAuthData();
    if (token) {
      storeAuthData(token, response.user);
    }
  }
  return response;
};
