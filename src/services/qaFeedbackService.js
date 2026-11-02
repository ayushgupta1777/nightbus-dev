// ==================== src/services/qaFeedbackService.js ====================
import api from './api';

const fallbackFetch = async (method, endpoint, body = null) => {
  const localUrl = `http://localhost:5000/api${endpoint}`;
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const fetchOpts = {
    method: method.toUpperCase(),
    headers
  };
  if (body && method.toLowerCase() !== 'get') {
    fetchOpts.body = JSON.stringify(body);
  }

  const res = await fetch(localUrl, fetchOpts);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP ${res.status}`);
  }
  return await res.json();
};

export const qaFeedbackService = {
  /**
   * Submit new QA feedback or bug report with automatic telemetry
   */
  submitFeedback: async (feedbackData) => {
    try {
      return await api.post('/qa-feedback', feedbackData);
    } catch (err) {
      // If production host doesn't have route yet, seamlessly fall back to local backend
      if (err.status === 404 || err.isNetworkError || !err.status) {
        return await fallbackFetch('post', '/qa-feedback', feedbackData);
      }
      throw err;
    }
  },

  /**
   * Fetch all QA feedback reports
   */
  getFeedback: async (params = {}) => {
    try {
      return await api.get('/qa-feedback', params);
    } catch (err) {
      if (err.status === 404 || err.isNetworkError || !err.status) {
        const queryStr = new URLSearchParams(params).toString();
        return await fallbackFetch('get', `/qa-feedback${queryStr ? '?' + queryStr : ''}`);
      }
      throw err;
    }
  },

  /**
   * Fetch next pending issue for autonomous resolution
   */
  getNextPending: async () => {
    try {
      return await api.get('/qa-feedback/next');
    } catch (err) {
      if (err.status === 404 || err.isNetworkError || !err.status) {
        return await fallbackFetch('get', '/qa-feedback/next');
      }
      throw err;
    }
  },

  /**
   * Update feedback status & resolution notes
   */
  updateFeedback: async (id, updateData) => {
    try {
      return await api.patch(`/qa-feedback/${id}`, updateData);
    } catch (err) {
      if (err.status === 404 || err.isNetworkError || !err.status) {
        return await fallbackFetch('patch', `/qa-feedback/${id}`, updateData);
      }
      throw err;
    }
  },

  /**
   * Delete feedback ticket
   */
  deleteFeedback: async (id) => {
    try {
      return await api.delete(`/qa-feedback/${id}`);
    } catch (err) {
      if (err.status === 404 || err.isNetworkError || !err.status) {
        return await fallbackFetch('delete', `/qa-feedback/${id}`);
      }
      throw err;
    }
  }
};

export default qaFeedbackService;
