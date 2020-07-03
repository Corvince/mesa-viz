import { html, render, Hybrids, define, property } from "hybrids";
import embed from "vega-embed";
import * as vega from "vega";
import { send } from "./websocket";

export interface VegaElements extends HTMLElement {
  specs: [];
  n_simulations: number;
  sims: [];
  views: any;
  model_states: any;
}

export const VegaViews: Hybrids<VegaElements> = {
  specs: [],
  views: ({ specs }) => createViews(specs),
  n_simulations: 1,
  sims: ({ n_simulations }) => [...Array(n_simulations).keys()],
  model_states: {
    ...property([]),
    observe: updateViews,
  },
  render: render(
    ({ specs, sims }) => html`
      ${sims.map(
        (n) => html`
          <div class="model" id="model${n}">
            ${specs.map((_, index) => html` <div id="view${index}"></div> `)}
          </div>
        `
      )}
    `,
    { shadowRoot: false }
  ),
};

function createViews(specs) {
  let models = [...document.querySelectorAll(".model")];
  let views = models.map((model) =>
    [...model.children].map(async (view_container, index) => {
      let result = await embed(<HTMLElement>view_container, specs[index], {
        patch: [
          {
            path: "/signals",
            op: "add",
            value: [
              {
                name: "get_datum",
                on: [
                  {
                    events: "click",
                    update: "datum",
                  },
                ],
              },
              {
                name: "get_key",
                on: [
                  {
                    events: "keydown",
                    update: "event.key",
                  },
                ],
              },
            ],
          },
        ],
      });
      result.view.addSignalListener(
        "get_datum",
        sendSignal.bind(result.view.container())
      );
      /* result.view.addSignalListener(
        "get_key",
        sendKey.bind(result.view.container())
      ); */
      /* result.view.addEventListener("click", function (event, item) {
        event.preventDefault();
        event.target.setAttribute("tabindex", 1);
        event.target.focus();
        console.log("CLICK", event, item);
      });*/
      result.view.addEventListener("keydown", sendKey);
      return result;
    })
  );
  return views;
}

export async function updateViews(store, data) {
  data.forEach((modelData, index) => {
    let { agents, ...model } = modelData;
    let agentChange = vega.changeset().insert(agents).remove(vega.truthy);
    store.views[index].map(async (aview) => {
      let result = await aview;
      let view = result.view;
      let datasets = view.getState({
        data: vega.truthy,
      }).data;
      if ("agents" in datasets) {
        view.change("agents", agentChange);
      }
      if ("model" in datasets) {
        view.insert("model", model);
      }
      view.runAsync();
    });
  });
}

function sendKey(event, item) {
  console.log(event);
  console.log(item);
  let model_id = parseInt(event.target.parentElement.parentElement.id.slice(5));
  send({
    type: "key_press",
    data: {
      model_id: model_id,
      data: { key: event.key },
    },
  });
}

const sendSignal = function (name, value = {}) {
  this.firstChild.setAttribute("tabindex", 1);
  this.firstChild.focus();
  let model_id = parseInt(this.parentElement.id.slice(5));
  send({
    type: "call_method",
    data: {
      model_id: model_id,
      data: value,
    },
  });
};

define("vega-elements", VegaViews);
