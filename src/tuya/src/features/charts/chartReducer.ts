import { createSlice } from "@reduxjs/toolkit";

export const chartSlice = createSlice({
  name: "chart",
  initialState: {
    specs: [],
    data: [],
  },
  reducers: {
    createSpec: (state, action) => {
      state.specs = action.payload[0];
    },
    renderData: (state, action) => {
      console.log(action.payload);
      state.data = JSON.parse(action.payload[0]);
    },
  },
});

export const { createSpec } = chartSlice.actions;

export default chartSlice.reducer;
