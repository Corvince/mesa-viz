import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Vega } from "react-vega";
import { RootState } from "../../store";
import { selectStep } from "../modelStates/modelStatesReducer";
import { cloneDeep } from "lodash-es";
import { GridCell, Typography } from "rmwc";
import "@rmwc/grid/styles";
import "@rmwc/typography/styles";

export function VegaCharts() {
  const step = useSelector((state: RootState) => state.modelStates.currentStep);
  const specs = useSelector((state: RootState) => state.chart.specs);
  const stepData = useSelector(selectStep(step));
  const models = cloneDeep(stepData?.data);

  if (stepData) {
    const charts = models.map((model: any, idx) => (
      <GridCell key={model.modelId} span={4}>
        <Typography
          use="headline6"
          style={{ display: "grid", justifyContent: "center" }}
        >
          Model {idx + 1}
        </Typography>
        {specs.map((spec, idx) => (
          <Vega
            key={idx}
            spec={spec}
            data={model.data}
            patch={mypatch}
            signalListeners={{ get_datum: handleClick }}
          />
        ))}
      </GridCell>
    ));
    console.log(charts);
    return <>{charts}</>;
  }
  console.log("now");

  return <div>nothing</div>;
}

const oldpatch = [
  {
    path: "/data/",
    op: "add",
    value: [
      {
        name: "model",
      },
    ],
  },
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

function mypatch(spec: object) {
  if (spec) {
    //@ts-ignore
    spec.signals = [
      {
        name: "get_datum",
        on: [
          {
            events: "click",
            update: "datum",
          },
        ],
      },
    ]; //@ts-ignore
    spec.data = [{ name: "agents" }, { name: "model" }, { name: "data_0" }];
  }
  return spec;
}

const handleClick = (log, b) => console.log(b);

function VegaItem({ agents, model, spec }: any) {
  let myagent = { ...agents };
  let myspec = cloneDeep({ ...spec });
  console.log(myagent);
  return (
    <Vega
      spec={myspec}
      data={myagent}
      patch={mypatch}
      signalListeners={{ get_datum: handleClick }}
    />
  );
}
