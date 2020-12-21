import { createSlice } from "@reduxjs/toolkit";

export const chartSlice = createSlice({
  name: "chart",
  initialState: {
    specs: [],
    simulations: 0,
  },
  reducers: {
    createSpec: (state, action) => {
      state.specs = action.payload.specs;
      state.simulations = action.payload.n_sims;
    },
  },
});

export const { createSpec } = chartSlice.actions;

export default chartSlice.reducer;
