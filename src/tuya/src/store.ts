import { configureStore } from "@reduxjs/toolkit";
import chartReducer from "./features/charts/chartReducer";
import controllerReducer from "./features/controller/controllerReducer";
import modelStatesReducer from "./features/modelStates/modelStatesReducer";

const store = configureStore({
  reducer: {
    controller: controllerReducer,
    modelStates: modelStatesReducer,
    chart: chartReducer,
  },
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
