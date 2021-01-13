import { createSlice } from "@reduxjs/toolkit";

export const stepSlice = createSlice({
  name: "Step",
  initialState: {
    value: 0,
  },
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      if (state.value > 0) {
        state.value -= 1;
      }
      return state;
    },
  },
});

export const { increment, decrement } = stepSlice.actions;

export default stepSlice.reducer;
