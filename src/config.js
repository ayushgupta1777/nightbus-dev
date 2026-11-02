// ==================== src/config.js ====================

const PROD_URL = 'https://server.nightbusjourney.com';
const LOCAL_URL = 'http://localhost:5000';

// Dynamic server URL from localStorage or defaults to Hostinger Production Server
export const getActiveBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('nb_active_server_url');
    if (saved) return saved;
  }
  return PROD_URL;
};

export const setActiveBaseUrl = (url) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('nb_active_server_url', url);
  }
};

export const BASE_URL = getActiveBaseUrl();
export const API_URL = `${BASE_URL}/api`;
export const SOCKET_URL = BASE_URL;

export const RAZORPAY_KEY_ID = 'rzp_test_T5N8IfOrVbQHGH';

export const CONFIG = {
  PROD_URL,
  LOCAL_URL,
  getActiveBaseUrl,
  setActiveBaseUrl,
  BASE_URL,
  API_URL,
  SOCKET_URL,
  RAZORPAY_KEY_ID,
};

export default CONFIG;
