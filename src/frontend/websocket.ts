import { ModelController, states } from "./controller";
import { VegaViews } from "./views";

/** Open the websocket connection; support TLS-specific URLs when appropriate */
const ws = new window.WebSocket(
  (window.location.protocol === "https:" ? "wss://" : "ws://") +
    window.location.host +
    "/ws"
);

let vega_views = document.querySelector("vega-elements") as VegaElements;

/**
 * Turn an object into a string to send to the server, and send it.
 * @param {string} message - The message to send to the Python server
 */

export function send(message: any) {
  const msg = JSON.stringify(message);
  ws.send(msg);
}

/**
 * reset the model once the websocket is open
 */
ws.onopen = () => {
  send({ type: "reset", data: {} });
};
let controller = document.querySelector("model-controller") as ModelController;

/**
 * Parse and handle an incoming message on the WebSocket connection.
 * @param {string} message - the message received from the WebSocket
 */
ws.onmessage = function (message) {
  if (message.data === "connected") {
    return;
  }
  let msg = JSON.parse(message.data);
  console.log(msg);
  switch (msg.type) {
    case "model_state":
      // Update visualization state
      //let vega_views = document.querySelector("vega-elements") as VegaElements
      vega_views.model_states = msg.data.map((state) => JSON.parse(state));
      //states.push(msg.data.map(state => JSON.parse(state)))
      // Workaround to display timeline correctly (but delayed)
      //document
      //  .querySelector("fps-control")
      //  .shadowRoot.querySelector("#timeline").value = store.currentStep
      // Init next step if model is running
      //if (store.running) {
      //  store.timeout = setTimeout(incrementStep, 1000 / store.fps, {
      //    store: store
      //  })
      //}
      controller.currentStep = msg.step;
      controller.maxStep = Math.max(controller.maxStep, msg.step + 1);
      if (controller.isRunning) {
        send({ type: "step", data: { step: msg.step + 1 } });
      }
      break;
    case "end":
      // We have reached the end of the model
      // store.done = true

      controller.isRunning = false;
      break;
    case "model_params":
      // Create input elements for each model parameter
      // msg.params.forEach(param => addParameter(store, param))
      break;
    case "vega_specs":
      let specifications = msg.data.map((spec) => JSON.parse(spec));
      vega_views.specs = specifications;
      vega_views.n_simulations = msg.n_sims;
      break;
    default:
      // There shouldn't be any other message
      console.log("Unexpected message.");
      console.log(msg);
  }
};
