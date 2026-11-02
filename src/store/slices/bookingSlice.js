// ==================== src/store/slices/bookingSlice.js ====================
import { createSlice } from '@reduxjs/toolkit';

const bookingSlice = createSlice({
  name: 'booking',
  initialState: {
    selectedSeats: [],
    bookingDetails: null,
    bookings: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    selectSeats: (state, action) => {
      state.selectedSeats = action.payload;
    },
    toggleSeat: (state, action) => {
      const seat = action.payload;
      const index = state.selectedSeats.findIndex((s) => s.seatNumber === seat.seatNumber);
      if (index > -1) {
        state.selectedSeats.splice(index, 1);
      } else {
        state.selectedSeats.push(seat);
      }
    },
    setBookingDetails: (state, action) => {
      state.bookingDetails = action.payload;
    },
    addBooking: (state, action) => {
      state.bookings.unshift(action.payload);
    },
    setBookings: (state, action) => {
      state.bookings = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearBooking: (state) => {
      state.selectedSeats = [];
      state.bookingDetails = null;
      state.error = null;
    },
  },
});

export const {
  selectSeats,
  toggleSeat,
  setBookingDetails,
  addBooking,
  setBookings,
  setLoading,
  setError,
  clearBooking,
} = bookingSlice.actions;

export default bookingSlice.reducer;
