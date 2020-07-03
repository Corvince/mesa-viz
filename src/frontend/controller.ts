import { define, html, Hybrids, render, property } from "hybrids";
import "@material/mwc-button";
import "@material/mwc-slider";
import { Slider } from "@material/mwc-slider";
import { send } from "./websocket";

export interface ModelController extends HTMLElement {
  currentStep: number;
  maxStep: number;
  isRunning: boolean;
  labelStartStop: string;
}

export const Controller: Hybrids<ModelController> = {
  currentStep: 0,
  maxStep: 1,
  isRunning: false,
  labelStartStop: ({ isRunning }) => (isRunning ? "Stop" : "Start"),
  render: ({ isRunning, labelStartStop, currentStep, maxStep }) => html`
    <div>
      <mwc-button onclick=${toggleRunning}>${labelStartStop}</mwc-button>
      <mwc-button disabled=${isRunning} onclick=${handleStep}>Step</mwc-button>
      <mwc-button onclick=${reset}>Reset</mwc-button>
    </div>
    <div>
      <span>0</span
      ><mwc-slider
        pin
        markers
        step="1"
        min="0"
        max=${maxStep}
        value=${currentStep}
        oninput=${sliderSelect}
      ></mwc-slider
      ><span>${maxStep}</span>
    </div>
  `,
};

function handleStep(host: ModelController) {
  requestState(host.currentStep + 1);
}

export function toggleRunning(host: ModelController) {
  host.isRunning = !host.isRunning;
  requestState(host.currentStep + 1);
}

export function reset(host: ModelController) {
  host.currentStep = 0;
  host.maxStep = 1;
  send({ type: "reset", data: {} });
}

export function requestState(step: number) {
  send({ type: "step", data: { step: step } });
}

function sliderSelect(host: ModelController, event: CustomEvent) {
  let step = (<Slider>event.target).value;
  requestState(step);
}

define("model-controller", Controller);
