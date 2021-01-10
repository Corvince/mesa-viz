import React from "react";
import { useSelector } from "react-redux";
import { Slider, Select } from "rmwc";
import { Parameter } from "./parameterReducer";
import { RootState } from "../../store";

export default function Parameters() {
  const parameters = useSelector((state: RootState) => state.parameter);

  const params = parameters.map((parameter: Parameter) => (
    <InputParameter param={parameter} />
  ));

  return <>{params}</>;
}

function InputParameter({ param }: { param: Parameter }) {
  switch (param.param_type) {
    case "slider":
      return <MesaSlider param={param} />;
    case "choice":
      return <MesaSelect input={param} />;
    default:
      return <div>Invalid input: {param.toString()}</div>;
  }
}

function MesaSlider({ param }: { param: Parameter }) {
  console.log(param.model_values);
  const sliders = param.model_values.map((value) => {
    return (
      <Slider
        value={value}
        min={param.min_value}
        max={param.max_value}
        step={param.step}
      />
    );
  });
  return <>{sliders}</>;
}

function MesaSelect(props: any) {
  return <Select />;
}
