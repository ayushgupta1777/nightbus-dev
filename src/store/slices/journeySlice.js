// ==================== src/store/slices/journeySlice.js ====================
import { createSlice } from '@reduxjs/toolkit';

const journeySlice = createSlice({
  name: 'journey',
  initialState: {
    searchCriteria: {
      from: '',
      to: '',
      date: new Date().toISOString().split('T')[0],
      passengers: 1,
    },
    availableBuses: [],
    selectedBus: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    setSearchCriteria: (state, action) => {
      state.searchCriteria = { ...state.searchCriteria, ...action.payload };
    },
    setAvailableBuses: (state, action) => {
      state.availableBuses = action.payload;
    },
    setSelectedBus: (state, action) => {
      state.selectedBus = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearJourney: (state) => {
      state.searchCriteria = {
        from: '',
        to: '',
        date: new Date().toISOString().split('T')[0],
        passengers: 1,
      };
      state.availableBuses = [];
      state.selectedBus = null;
      state.error = null;
    },
  },
});

export const {
  setSearchCriteria,
  setAvailableBuses,
  setSelectedBus,
  setLoading,
  setError,
  clearJourney,
} = journeySlice.actions;

export default journeySlice.reducer;
