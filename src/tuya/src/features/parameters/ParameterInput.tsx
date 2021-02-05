import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
  Slider,
  Select,
  Typography,
  Checkbox,
  CollapsibleList,
  SimpleListItem,
} from "rmwc";
import { Parameter } from "./parameterReducer";
import { RootState } from "../../store";
import "@rmwc/select/styles";
import "@rmwc/slider/styles";
import "@rmwc/list/styles";
import "@rmwc/checkbox/styles";

export default function Parameters() {
  const parameters = useSelector((state: RootState) => state.parameter);

  const params = parameters.map((parameter: Parameter) => (
    <InputParameter param={parameter} key={parameter.parameter} />
  ));

  return <>{params}</>;
}

function InputParameter({ param }: { param: Parameter }) {
  const title = <Typography use="headline6">{param.name}</Typography>;
  let input = param.model_values.map((value, idx) => {
    switch (param.param_type) {
      case "slider":
        return <MesaSlider param={param} value={value} idx={idx} key={idx} />;
      case "choice":
        return <MesaSelect param={param} value={value} idx={idx} key={idx} />;
      case "checkbox":
        return <MesaCheckbox param={param} value={value} idx={idx} key={idx} />;
      default:
        return <div>Invalid input: {param.toString()}</div>;
    }
  });
  return (
    <div style={{ paddingLeft: "10px" }}>
      <CollapsibleList
        handle={<SimpleListItem text={param.name} metaIcon="chevron_right" />}
      >
        {input}
      </CollapsibleList>
    </div>
  );
  return (
    <>
      {title}
      {input}
    </>
  );
}

function MesaSlider({ param, value, idx }: { param: Parameter }) {
  return (
    <div
      style={{
        display: "flex",
        placeItems: "center",
        justifyContent: "space-around",
      }}
    >
      <span>{param.min_value}</span>
      <Slider
        style={{ width: "80%" }}
        value={value}
        min={param.min_value}
        max={param.max_value}
        step={param.step}
        discrete
      />
      <span>{param.max_value}</span>
    </div>
  );
}

function MesaSelect({ param, value, idx }: { param: Parameter }) {
  return (
    <Select
      label={`Model ${idx + 1}`}
      defaultValue={value}
      options={param.choices}
    />
  );
}

function MesaCheckbox({ param }: { param: Parameter }) {
  return (
    <>
      {param.model_values.map((value, idx) => (
        <Checkbox label={`Model ${idx + 1}`} />
      ))}
    </>
  );
}
