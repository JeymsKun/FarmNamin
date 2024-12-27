import { configureStore } from '@reduxjs/toolkit';
import productReducer from './productSlice';
import postReducer from './postSlice';
import allProductReducer from './allProductSlice'; 
import favoritesSliceReducer from './favoritesSlice';

const store = configureStore({
  reducer: {
    product: productReducer, 
    post: postReducer,
    allProducts: allProductReducer,
    favorites: favoritesSliceReducer,
  },
});

export default store;