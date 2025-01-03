import { configureStore } from '@reduxjs/toolkit';
import productReducer from './productSlice';
import postReducer from './postSlice';
import allProductReducer from './allProductSlice'; 
import favoritesSliceReducer from './favoritesSlice';
import scheduleReducer from './scheduleSlice';
import balanceSliceReducer from './balanceSlice';

const store = configureStore({
  reducer: {
    product: productReducer, 
    post: postReducer,
    allProducts: allProductReducer,
    favorites: favoritesSliceReducer,
    schedules: scheduleReducer,
    balance: balanceSliceReducer,
  },
});

export default store;