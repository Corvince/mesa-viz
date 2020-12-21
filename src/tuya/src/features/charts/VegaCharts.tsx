import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Vega, VegaLite } from "react-vega";
import { RootState } from "../../store";
import { ModelData, selectStep } from "../modelStates/modelStatesReducer";
import { cloneDeep } from "lodash-es";

function useMesaData(step: number) {
  const stepData = cloneDeep(useSelector(selectStep(step)));
  if (stepData) {
    const data = stepData.agentData;
    return undefined;
  }
}

export function VegaCharts() {
  const step = useSelector((state: RootState) => state.modelStates.currentStep);
  const specs = useSelector((state: RootState) => state.chart.specs);
  const stepData = useSelector(selectStep(0, step));
  const mydata = cloneDeep(stepData?.agentData);

  if (stepData) {
    return <Vega spec={specs[0]} data={mydata} />;
  }
  console.log("now");

  return <div>nothing</div>;
}

const mypatch = [
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
];

const handleClick = (log, b) => console.log(b);

function VegaItem({ agents, model, spec }: any) {
  let myagent = { ...agents };
  let myspec = { ...spec };
  console.log(myagent);
  return (
    <VegaLite
      spec={myspec}
      data={myagent}
      patch={mypatch}
      signalListeners={{ get_datum: handleClick }}
    />
  );
}
