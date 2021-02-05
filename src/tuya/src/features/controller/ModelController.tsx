import { useDispatch, useSelector } from "react-redux";
import { Button, Card, IconButton, Slider } from "rmwc";
import { RootState } from "../../store";
import React, { useEffect, useState } from "react";
import "@rmwc/slider/styles";
import "@rmwc/card/styles";
import { Root } from "postcss";
import { useMySocket } from "../websocket/websocket";
import { displayStep } from "../modelStates/modelStatesReducer";

export default function ModelController() {
  const maxStep = useSelector((state: RootState) => state.modelStates.maxStep);
  const currentStep = useSelector(
    (state: RootState) => state.modelStates.currentStep
  );
  const { sendJsonMessage } = useMySocket();
  const dispatch = useDispatch();

  function nextStep() {
    if (currentStep === maxStep) {
      sendJsonMessage({ type: "step", data: { step: currentStep + 1 } });
    } else {
      dispatch(displayStep(currentStep + 1));
    }
  }

  return (
    <div
      style={{
        position: "sticky",
        display: "flex",
        bottom: "0px",
        justifyContent: "center",
      }}
    >
      <Card style={{ width: "fit-content" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
          }}
        >
          <span>0</span>
          <Slider
            min={0}
            max={maxStep}
            value={currentStep}
            step={1}
            discrete
            onInput={(e) => dispatch(displayStep(e.detail.value))}
            onChange={(e) => dispatch(displayStep(e.detail.value))}
            style={{ width: "75%" }}
          ></Slider>
          <span>{maxStep}</span>
        </div>
        <div>
          <IconButton
            icon="skip_previous"
            onClick={() => dispatch(displayStep(currentStep - 1))}
          />
          <PlayButton currentStep={currentStep} nextStep={nextStep} />
          <IconButton
            icon="skip_next"
            onClick={() => {
              nextStep();
            }}
          />
          <IconButton
            icon="replay"
            onClick={() => sendJsonMessage({ type: "reset", data: {} })}
          ></IconButton>
        </div>
      </Card>
    </div>
  );
}

function PlayButton({ currentStep, nextStep }) {
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (running) {
      nextStep();
    }
  }, [running, currentStep]);

  return (
    <IconButton
      icon="play_arrow"
      onIcon="stop"
      onClick={() => setRunning(!running)}
    />
  );
}
