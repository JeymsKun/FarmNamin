import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedPost: null,
  selectedProduct: null,
};

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    setSelectedPost(state, action) {
      state.selectedPost = action.payload;
    },
    setSelectedProduct(state, action) {
      state.selectedProduct = action.payload;
    },
    clearSelectedPost(state) {
      state.selectedPost = null;
    },
    clearSelectedProduct(state) {
      state.selectedProduct = null;
    },
  },
});

export const { setSelectedPost, setSelectedProduct, clearSelectedPost, clearSelectedProduct } = productSlice.actions;
export default productSlice.reducer;