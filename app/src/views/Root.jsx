import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import {
  ModelsTimeSeries,
  EvaluateTimeSeries,
  PredictTimeSeries,
  CompareTimeSeries,
  ModelsText,
  PredictText,
  EvaluateText,
  Training,
  CompareText,
  DataPreparation,
  Models,
} from "views";

const Root = () => {
  return (
    <Routes>
      <Route
        path="/models/time_series"
        element={<Models key="TimeSeries" options="TimeSeries" />}
      />
      <Route
        path="/training/time_series"
        element={<Training key="TimeSeries" />}
      />
      <Route path="/training/text" element={<Training key="Text" />} />
      <Route path="/evaluate/time_series" element={<EvaluateTimeSeries />} />
      <Route path="/predict/time_series" element={<PredictTimeSeries />} />
      <Route path="/compare/time_series" element={<CompareTimeSeries />} />
      <Route path="*" element={<Navigate to="/models/time_series" />} />
      <Route
        path="/models/text"
        element={<Models key="Text" options="Text" />}
      />
      <Route path="/predict/text" element={<PredictText />} />
      <Route path="/evaluate/text" element={<EvaluateText />} />
      <Route path="/compare/text" element={<CompareText />} />
      <Route path="/preparation/text" element={<DataPreparation />} />
    </Routes>
  );
};

export default Root;
