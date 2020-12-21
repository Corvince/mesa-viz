import {
  createSlice,
  createEntityAdapter,
  createSelector,
} from "@reduxjs/toolkit";
import { RootState } from "../../store";

export type ModelData = { model: { running: boolean } };

export type AgentData = { agents: object[] };

export type Model = {
  id: number;
  parameters: object[];
  steps: typeof modelStates[];
};

export type ModelState = {
  step: number;
  modelData: { model: object };
  agentData: { agents: object[] };
};

const modelStates = createEntityAdapter<ModelState>({
  selectId: (step) => step.step,
});

interface ModelStateAction {
  type: string;
  payload: {
    step: number;
    modelStates: [{ agents: object[]; running: boolean }];
  };
}

export const modelStatesSlice = createSlice({
  name: "modelStates",
  initialState: {
    currentStep: -1,
    maxStep: -1,
    models: [],
    ready: false,
  },
  reducers: {
    init: (state, action) => {
      state.models = [];
      for (let i = 0; i < action.payload.n_sims; i++) {
        state.models.push(modelStates.getInitialState());
      }
      state.currentStep = -1;
      state.maxStep = -1;
      state.ready = true;
    },
    stepReceived: (state, action: ModelStateAction) => {
      const step = action.payload.step;
      action.payload.modelStates.map((modelState, idx) => {
        const { agents, ...model } = modelState;
        const entity = {
          step: step,
          modelData: { model: model },
          agentData: { agents: agents },
        };
        modelStates.addOne(state.models[idx], entity);
      });
      state.currentStep = step;
      state.maxStep = step;
    },
    displayStep: (state, action) => {
      state.currentStep = action.payload;
    },
    reset: (state) => {
      state.currentStep = 0;
    },
  },
});

export const { stepReceived, displayStep, reset } = modelStatesSlice.actions;

export const modelStatesSelectors = modelStates.getSelectors<RootState>(
  (state) => state.modelStates.models[0]
);

export const selectStep = (modelId: number, step: number) => (
  state: RootState
) =>
  modelStates
    .getSelectors((state: RootState) => state.modelStates.models[modelId])
    .selectById(state, step);

export default modelStatesSlice.reducer;
