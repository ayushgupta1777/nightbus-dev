// ==================== src/services/api.js ====================
import { API_URL, getActiveBaseUrl } from '../config';

/**
 * Build query string from params object
 */
const buildQueryString = (params) => {
  if (!params || Object.keys(params).length === 0) {
    return '';
  }

  const searchParams = new URLSearchParams();
  Object.keys(params).forEach((key) => {
    const value = params[key];
    if (value !== null && value !== undefined && value !== '') {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

/**
 * Enhanced error handling
 */
const handleAPIError = (error, endpoint) => {
  if (error.status) {
    return {
      message: error.message || `API Error: ${error.status}`,
      code: error.code || 'API_ERROR',
      status: error.status,
      data: error.data,
      response: error.response || {
        status: error.status,
        data: error.data,
      },
    };
  }

  if (error.name === 'AbortError') {
    return {
      message: 'Request timeout - please check your internet connection',
      code: 'TIMEOUT',
      status: 0,
      isTimeout: true,
    };
  }

  if (error.message === 'Failed to fetch' || error.message?.includes('fetch')) {
    return {
      message: 'Network error - unable to connect to server',
      code: 'NETWORK_ERROR',
      status: 0,
      isNetworkError: true,
    };
  }

  return {
    message: error.message || 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
    status: 0,
    originalError: error,
  };
};

/**
 * Make API request with fetch
 */
const makeRequest = async (endpoint, options = {}) => {
  const {
    method = 'GET',
    body = null,
    headers = {},
    timeout = 30000,
    params = null,
    skipAuth = false,
  } = options;

  const currentApiUrl = `${getActiveBaseUrl()}/api`;
  const queryString = params ? buildQueryString(params) : '';
  const url = `${currentApiUrl}${endpoint}${queryString}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeout);

  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    const requestHeaders = {
      'Content-Type': 'application/json',
      ...headers,
    };

    if (token && !skipAuth) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
      requestHeaders['x-auth-token'] = token;
    }

    const fetchOptions = {
      method,
      headers: requestHeaders,
      signal: controller.signal,
    };

    if (body) {
      fetchOptions.body = JSON.stringify(body);
    }

    const response = await fetch(url, fetchOptions);
    clearTimeout(timeoutId);

    const contentType = response.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }
    }

    if (!response.ok) {
      const error = new Error(data.message || `HTTP ${response.status}`);
      error.status = response.status;
      error.data = data;
      error.response = { status: response.status, data };
      throw error;
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    const parsedError = handleAPIError(error, endpoint);
    throw parsedError;
  }
};

export const api = {
  get: (endpoint, configOrParams = null, options = {}) => {
    if (configOrParams && typeof configOrParams === 'object' && ('params' in configOrParams || 'headers' in configOrParams || 'timeout' in configOrParams)) {
      return makeRequest(endpoint, { method: 'GET', ...configOrParams });
    }
    return makeRequest(endpoint, { method: 'GET', params: configOrParams, ...options });
  },

  post: (endpoint, body = null, options = {}) =>
    makeRequest(endpoint, { method: 'POST', body, ...options }),

  put: (endpoint, body = null, options = {}) =>
    makeRequest(endpoint, { method: 'PUT', body, ...options }),

  patch: (endpoint, body = null, options = {}) =>
    makeRequest(endpoint, { method: 'PATCH', body, ...options }),

  delete: (endpoint, options = {}) =>
    makeRequest(endpoint, { method: 'DELETE', ...options }),

  upload: async (endpoint, formData, options = {}) => {
    const currentApiUrl = `${getActiveBaseUrl()}/api`;
    const url = `${currentApiUrl}${endpoint}`;
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    const headers = { ...options.headers };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      headers['x-auth-token'] = token;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    return await response.json();
  },
};

export default api;
