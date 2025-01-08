import { createSlice } from '@reduxjs/toolkit';

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState: [],
  reducers: {
    setFavorites: (state, action) => {
      return action.payload;
    },
    addFavorite: (state, action) => {
      state.push(action.payload);
    },
    removeFavorite: (state, action) => {
      return state.filter(favorite => favorite.id !== action.payload.id);
    },
  },
});

export const { setFavorites, addFavorite, removeFavorite } = favoritesSlice.actions;
export default favoritesSlice.reducer;