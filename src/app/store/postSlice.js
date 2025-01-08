import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedPost: null,
};

const postSlice = createSlice({
  name: 'post',
  initialState,
  reducers: {
    setSelectedPost(state, action) {
      state.selectedPost = action.payload;
    },
    clearSelectedPost(state) {
      state.selectedPost = null;
    },
  },
});


export const { setSelectedPost, clearSelectedPost } = postSlice.actions;
export default postSlice.reducer;