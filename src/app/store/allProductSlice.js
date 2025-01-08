import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  products: [],
  loading: false,
  error: null,
};

const allProductSlice = createSlice({
  name: 'allProducts',
  initialState,
  reducers: {
    setProducts: (state, action) => {
      state.products = action.payload;
      state.loading = false; 
    },
    setLoading: (state) => {
      state.loading = true; 
    },
    setError: (state, action) => {
      state.error = action.payload; 
      state.loading = false;
    },
  },
});

export const { setProducts, setLoading, setError } = allProductSlice.actions;

export default allProductSlice.reducer;