import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { Provider } from "react-redux";
import store from "./store";
import { SocketHandler } from "./features/websocket/websocket";

ReactDOM.render(
  <Provider store={store}>
    <SocketHandler>
      <App />
    </SocketHandler>
  </Provider>,
  document.getElementById("root")
);
