import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    schedules: [], 
};

const scheduleSlice = createSlice({
    name: 'schedules',
    initialState,
    reducers: {
        setSchedules: (state, action) => {
            state.schedules = action.payload; 
        },
    },
});

export const { setSchedules } = scheduleSlice.actions;

export default scheduleSlice.reducer;