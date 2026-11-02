// ==================== src/store/store.js ====================
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import journeyReducer from './slices/journeySlice';
import bookingReducer from './slices/bookingSlice';
import walletReducer from './slices/walletSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    journey: journeyReducer,
    booking: bookingReducer,
    wallet: walletReducer,
  },
  devTools: true,
});

export default store;
