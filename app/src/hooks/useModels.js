import { useEffect, useReducer, useRef } from "react";
import { io } from "socket.io-client";

export const useModels = (options) => {
  const socket = useRef();

  const initialState = {
    csvData: null,
    csvHeaders: [],
    YLabels: [],
    selectedId: null,
    downloadLink: null,
    epochsHistory: [],
    displayPlot: null,
    selectedTab: "loss",
    numberSlider: 0,
  };

  const reducer = (state, action) => {
    switch (action.type) {
      case "SET_EPOCHS_HISTORY":
        return {
          ...state,
          epochsHistory: [...state.epochsHistory, action.payload],
        };
      case "UPDATE_FIELD":
        return { ...state, [action.field]: action.payload };
      case "RESET":
        return initialState;
      default:
        return state;
    }
  };

  const updateFile = (field, newData) => {
    dispatch({ type: "UPDATE_FIELD", field: field, payload: newData });
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    dispatch({ type: "RESET" });

    socket.current = io("http://127.0.0.1:5000", {
      transports: ["websocket"],
      upgrade: false,
      reconnection: true,
      maxHttpBufferSize: 1e8,
      maxChunkedMessageSize: 1e8,
    });

    const epochEvent =
      options === "TimeSeries"
        ? "epoch_update"
        : "epoch_update/text_classification";
    socket.current.on(epochEvent, (epochs) => {
      dispatch({ type: "SET_EPOCHS_HISTORY", payload: JSON.parse(epochs) });
    });

    const completedEvent =
      options === "TimeSeries"
        ? "training_completed"
        : "training_completed/text_classification";
    socket.current.on(completedEvent, (results) => {
      const parsedData = JSON.parse(results);
      updateFile("downloadLink", parsedData);
    });

    return () => {
      socket.current.disconnect();
    };
  }, [options]);

  return { ...state, socket, dispatch, updateFile };
};
