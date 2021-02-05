import { createSlice } from "@reduxjs/toolkit";
import { stepReceived } from "../modelStates/modelStatesReducer";

export const controllerSlice = createSlice({
  name: "controller",
  initialState: {
    currentStep: 0,
    running: false,
  },
  reducers: {
    increment: (state) => {
      state.currentStep += 1;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      (action) => action.type.endsWith("stepReceived"),
      (state) => {
        state.currentStep += 1;
      }
    );
  },
});

export const { increment } = controllerSlice.actions;

export default controllerSlice.reducer;
