import {
  createSlice,
  createEntityAdapter,
  createSelector,
} from "@reduxjs/toolkit";
import { RootState } from "../../store";

export type RawMesaData = {
  running: boolean;
  agents: [{ unique_id: number | string }];
};

export type VegaData = {
  model: { running: boolean };
  agents: [{ unique_id: number | string }];
};

export type ModelStates = {
  step: number;
  data: { modelId: number; data: VegaData }[];
};

const modelStates = createEntityAdapter<ModelStates>({
  selectId: (step) => step.step,
});

interface ModelStatesAction {
  type: string;
  payload: {
    step: number;
    modelStates: [{ modelId: number; state: RawMesaData }];
  };
}

export const modelStatesSlice = createSlice({
  name: "modelStates",
  initialState: modelStates.getInitialState({ currentStep: 0, maxStep: 0 }),
  reducers: {
    stepReceived(state, action: ModelStatesAction) {
      const modelsData = action.payload.modelStates.map((modelState) => {
        const { agents, ...model } = modelState.state;
        const data = { agents: agents, model: model };
        return { modelId: modelState.modelId, data: data };
      });
      const entity = { step: action.payload.step, data: modelsData };
      modelStates.addOne(state, entity);
      state.currentStep = entity.step;
      state.maxStep = entity.step;
    },
    reset(state) {
      state = modelStates.getInitialState({ currentStep: 0, maxStep: 0 });
    },
    displayStep(state, action) {
      state.currentStep = action.payload;
    },
  },
});

export const { stepReceived, displayStep, reset } = modelStatesSlice.actions;

export const modelStatesSelectors = modelStates.getSelectors<RootState>(
  (state) => state.modelStates
);

export const selectStep = (step: number) => (state: RootState) =>
  modelStates.getSelectors().selectById(state.modelStates, step);

export default modelStatesSlice.reducer;
