import {
  createSlice,
  createEntityAdapter,
  createSelector,
} from "@reduxjs/toolkit";
import { cloneDeep } from "lodash";
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
  data: {
    modelId: number;
    agents: [{ unique_id: number | string }];
    model: any;
  }[];
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
      const modelsData = action.payload.modelStates.map((modelState, idx) => {
        const { agents, ...model } = modelState.state;
        let lastValues = modelStates
          .getSelectors()
          .selectById(state, action.payload.step - 1)?.data[idx]?.model;
        console.log(lastValues);
        if (lastValues === undefined) {
          lastValues = {};
          const test = {};
          for (const key of Object.keys(model)) {
            lastValues[key] = [];
          }
        }
        const newValues = cloneDeep(lastValues);
        for (const [key, value] of Object.entries(model)) {
          newValues[key].push(value);
        }
        console.log(newValues);
        return {
          modelId: modelState.modelId,
          agents: agents,
          model: newValues,
        };
      });
      const entity = { step: action.payload.step, data: modelsData };
      modelStates.upsertOne(state, entity);
      state.currentStep = entity.step;
      state.maxStep = entity.step;
    },
    reset() {
      return modelStates.getInitialState({ currentStep: 0, maxStep: 0 });
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
