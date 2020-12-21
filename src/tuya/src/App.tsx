import "./App.css";
import React, { useContext, useMemo, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import useWebSocket, { ReadyState } from "react-use-websocket";
// import ModelController from "./ModelController";

// import InputParameters from "./InputParameters";
import {
  Button,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerSubtitle,
  DrawerTitle,
  Grid,
  GridCell,
  List,
  ListItem,
  SimpleTopAppBar,
  TopAppBarFixedAdjust,
} from "rmwc";
import "@rmwc/top-app-bar/styles";
import "@rmwc/drawer/styles";
import "@rmwc/grid/styles";
import "@rmwc/button/styles";
import { RootState } from "./store";

import { useCallback } from "react";
import { useMySocket } from "./features/websocket/websocket";
import { Vega } from "react-vega";
import {
  selectStep,
  modelStatesSelectors,
  displayStep,
  reset,
} from "./features/modelStates/modelStatesReducer";
import { VegaCharts } from "./features/charts/VegaCharts";
import { Root } from "postcss";

function App() {
  const ready = useSelector((state: RootState) => state.modelStates.ready);

  return (
    <div>
      <SimpleTopAppBar
        fixed
        navigationIcon={true}
        title="Mesa"
        actionItems={[{ icon: "file_download" }]}
      />
      <TopAppBarFixedAdjust />
      <Drawer dismissible open={false}>
        <DrawerHeader>
          <DrawerTitle>DrawerHeader</DrawerTitle>
          <DrawerSubtitle>Subtitle</DrawerSubtitle>
        </DrawerHeader>
        <DrawerContent>
          <List>
            <ListItem>Cookies</ListItem>
            <ListItem>Pizza</ListItem>
            <ListItem>Icecream</ListItem>
          </List>
        </DrawerContent>
      </Drawer>
      <Grid>
        <GridCell span={4}>
          <ModelController />
        </GridCell>
        <GridCell span={4}>{ready && <VegaCharts />}</GridCell>
      </Grid>
    </div>
  );
}

export default App;

function ModelController() {
  const { sendJsonMessage } = useMySocket();
  const step = useSelector((state: RootState) => state.modelStates.currentStep);
  const dispatch = useDispatch();

  return (
    <div>
      {step}
      <Button
        onClick={() => {
          sendJsonMessage({ type: "step", data: { step: step + 1 } });
        }}
      >
        +
      </Button>
      <input
        type="text"
        onChange={(e) => dispatch(displayStep(e.target.value))}
      />
      <Button onClick={() => sendJsonMessage({ type: "reset", data: {} })}>
        Reset
      </Button>
    </div>
  );
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

function VegaView() {
  const specs = useSelector((state: RootState) => state.chart.specs);
  const data = useSelector(selectStep(1));
  let thisdata = JSON.parse(JSON.stringify(Object.assign({}, data)));

  if (data) {
    let { agents, ...model } = thisdata.modelState[0];

    let mydata = { agents: agents };
    console.log(mydata);
    return (
      <Vega
        spec={specs[0]}
        data={mydata}
        patch={mypatch}
        signalListeners={{ get_datum: handleClick }}
      />
    );
  }
  return <div>nothing to see</div>;
}
