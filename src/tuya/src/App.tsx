import "./App.css";
import React, { useContext, useMemo, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import useWebSocket, { ReadyState } from "react-use-websocket";
// import ModelController from "./ModelController";

// import InputParameters from "./InputParameters";
import {
  Button,
  Drawer,
  DrawerAppContent,
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
import ModelController from "./features/controller/ModelController";
import Parameters from "./features/parameters/ParameterInput";

function App() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <SimpleTopAppBar
        fixed
        navigationIcon={true}
        onNav={() => setOpen(!open)}
        title="Mesa"
        actionItems={[{ icon: "file_download" }]}
      />
      <TopAppBarFixedAdjust />
      <ParameterDrawer open={open} />
      <Main />
      <ModelController />
    </>
  );
}

const Main = React.memo(() => {
  return (
    <DrawerAppContent>
      <Grid>
        <VegaCharts />
      </Grid>
    </DrawerAppContent>
  );
});

export function ParameterDrawer({ open }: { open: boolean }) {
  return (
    <Drawer dismissible open={open}>
      <DrawerHeader>
        <DrawerTitle>Model Parameters</DrawerTitle>
      </DrawerHeader>
      <DrawerContent>
        <Parameters />
      </DrawerContent>
    </Drawer>
  );
}

export default App;
