import { createSlice } from "@reduxjs/toolkit";

export interface Parameter {
  param_type: "number" | "checkbox" | "choice" | "slider" | "static_text";
  name: string;
  value: any;
  min_value: number;
  max_value: number;
  step: number;
  choices: string[];
  description: string;
  parameter: string;
  model_values: (string | number)[];
}

const parameterSlice = createSlice({
  name: "parameter",
  initialState: [],
  reducers: {
    init: (state, action) => {
      return action.payload;
    },
  },
});

export default parameterSlice.reducer;
