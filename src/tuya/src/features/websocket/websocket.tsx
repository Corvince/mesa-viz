import React, { useEffect, useState, useRef, FunctionComponent } from "react";
import useWebSocket from "react-use-websocket";
import store from "../../store";

const socket_url =
  (window.location.protocol === "https:" ? "wss://" : "ws://") +
  window.location.host +
  "/ws";

export function SocketHandler({ children }: any) {
  const { sendJsonMessage } = useWebSocket(socket_url, {
    share: true,
    onMessage: (e) => {
      console.log(e);
      const action = JSON.parse(e.data);
      store.dispatch(action);
    },
    retryOnError: true,
  });
  useEffect(() => {
    sendJsonMessage({ type: "reset", data: {} });
  }, []);
  return children;
}

export function useMySocket() {
  const mysocket = useWebSocket(socket_url, {
    share: true,
  });
  return mysocket;
}
