// ==================== src/store/slices/walletSlice.js ====================
import { createSlice } from '@reduxjs/toolkit';

const walletSlice = createSlice({
  name: 'wallet',
  initialState: {
    balance: 500,
    transactions: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    setBalance: (state, action) => {
      state.balance = action.payload;
    },
    setTransactions: (state, action) => {
      state.transactions = action.payload;
    },
    addTransaction: (state, action) => {
      state.transactions.unshift(action.payload);
      if (action.payload.type === 'credit') {
        state.balance += action.payload.amount;
      } else {
        state.balance -= action.payload.amount;
      }
    },
  },
});

export const { setBalance, setTransactions, addTransaction } = walletSlice.actions;
export default walletSlice.reducer;
