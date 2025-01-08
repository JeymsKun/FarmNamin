import { createSlice } from '@reduxjs/toolkit';

const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    profile: null,
    products: [],
  },
  reducers: {
    setProfile: (state, action) => {
      state.profile = action.payload;
    },
    setProducts: (state, action) => {
      state.products = action.payload;
    },
    clearProfile: (state) => {
      state.profile = null;
    },
    clearProducts: (state) => {
      state.products = [];
    },
  },
});

export const { setProfile, setProducts, clearProfile, clearProducts } = profileSlice.actions;
export default profileSlice.reducer;