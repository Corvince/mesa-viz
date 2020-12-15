import { configureStore } from "@reduxjs/toolkit";
import chartReducer from "./features/charts/chartReducer";
import modelReducer from "./features/model/modelReducer";

const store = configureStore({
  reducer: {
    model: modelReducer,
    chart: chartReducer,
  },
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
