import "./App.css";
import React, { useContext, useMemo, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { decrement, increment } from "./features/model/modelReducer";

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

function App() {
  // const dispatch = useDispatch();
  // dispatch(connect("wss://echo.websocket.org"));

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
        <GridCell span={4}>
          <VegaView />
        </GridCell>
      </Grid>
    </div>
  );
}

export default App;

function ModelController() {
  const step = useSelector((state: RootState) => state.model.value);
  const dispatch = useDispatch();
  const { sendJsonMessage } = useMySocket();

  return (
    <div>
      {step}
      <Button
        onClick={() => {
          dispatch(increment());
          sendJsonMessage({ type: "step", data: { step: step + 1 } });
        }}
      >
        +
      </Button>
      <Button onClick={() => dispatch(decrement())}>-</Button>
    </div>
  );
}

function VegaView() {
  const specs = useSelector((state: RootState) => state.chart.specs);
  const data = useSelector((state: RootState) => state.chart.data);

  const mydata = { agents: { ...data.agents } };

  if (specs && data) {
    return <Vega spec={specs} data={mydata} />;
  }
  return <div>nothing to see</div>;
}
