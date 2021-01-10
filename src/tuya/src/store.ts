import { configureStore } from "@reduxjs/toolkit";
import chartReducer from "./features/charts/chartReducer";
import controllerReducer from "./features/controller/controllerReducer";
import modelStatesReducer from "./features/modelStates/modelStatesReducer";
import parameterReducer from "./features/parameters/parameterReducer";

const store = configureStore({
  reducer: {
    controller: controllerReducer,
    modelStates: modelStatesReducer,
    chart: chartReducer,
    parameter: parameterReducer,
  },
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
