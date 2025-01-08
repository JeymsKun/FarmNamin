import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    balances: [],
};

const balanceSlice = createSlice({
    name: 'balance',
    initialState,
    reducers: {
        setBalances: (state, action) => {
            state.balances = action.payload;
        },
        clearBalances: (state) => {
            state.balances = [];
        },
    },
});

export const { setBalances, clearBalances } = balanceSlice.actions;

export default balanceSlice.reducer;