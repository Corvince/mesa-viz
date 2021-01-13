import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Vega } from "react-vega";
import { RootState } from "../../store";
import { selectStep } from "../modelStates/modelStatesReducer";
import { cloneDeep } from "lodash-es";
import { GridCell, Typography } from "rmwc";
import "@rmwc/grid/styles";
import "@rmwc/typography/styles";
import { useMySocket } from "../websocket/websocket";

export function VegaCharts() {
  const { sendJsonMessage } = useMySocket();
  const step = useSelector((state: RootState) => state.modelStates.currentStep);
  const specs = useSelector((state: RootState) => state.chart.specs);
  const stepData = useSelector(selectStep(step));
  const models = cloneDeep(stepData?.data);

  if (models) {
    const charts = models.map((model: any, idx) => {
      const handleClick = (_name: string, data: object | unknown) =>
        sendJsonMessage({
          type: "call_method",
          data: {
            model_id: idx,
            data: data,
          },
        });

      return (
        <GridCell key={model.modelId} span={4}>
          <Typography
            use="headline6"
            style={{ display: "flex", justifyContent: "center" }}
          >
            Model {idx + 1}
          </Typography>
          {specs.map((spec, idx) => (
            <Vega
              key={idx}
              spec={spec}
              data={model.data}
              patch={specPatch}
              signalListeners={{ get_datum: handleClick }}
            />
          ))}
        </GridCell>
      );
    });
    return <>{charts}</>;
  }
  return <div>nothing</div>;
}

function specPatch(spec: object) {
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
      {
        name: "get_key",
        on: [{ events: "keydown", update: "event.key" }],
      },
    ]; //@ts-ignore
    spec.data = [{ name: "agents" }, { name: "model" }, { name: "data_0" }];
  }
  return spec;
}
