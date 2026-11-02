// ==================== src/store/slices/authSlice.js ====================
import { createSlice } from '@reduxjs/toolkit';
import { getAuthData, clearAuthData } from '../../services/authService';

const initialAuth = getAuthData();

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: initialAuth.user || null,
    token: initialAuth.token || null,
    activeRole: initialAuth.user?.role || 'customer',
    isLoading: false,
    error: null,
  },
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.activeRole = action.payload.activeRole || action.payload.user?.role || 'customer';
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.activeRole = 'customer';
      clearAuthData();
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
    setActiveRole: (state, action) => {
      state.activeRole = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setCredentials, logout, updateUser, setActiveRole, setLoading, setError } = authSlice.actions;
export default authSlice.reducer;
