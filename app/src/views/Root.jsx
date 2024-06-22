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
} from "views";

const Root = () => {
  return (
    <Routes>
      <Route path="/models/time_series" element={<ModelsTimeSeries />} />
      <Route path="/training/time_series" element={<Training />} />
      <Route path="/training/text" element={<Training />} />
      <Route path="/evaluate/time_series" element={<EvaluateTimeSeries />} />
      <Route path="/predict/time_series" element={<PredictTimeSeries />} />
      <Route path="/compare/time_series" element={<CompareTimeSeries />} />
      <Route path="*" element={<Navigate to="/models/time_series" />} />
      <Route path="/models/text" element={<ModelsText />} />
      <Route path="/predict/text" element={<PredictText />} />
      <Route path="/evaluate/text" element={<EvaluateText />} />
      <Route path="/compare/text" element={<CompareText />} />
      <Route path="/preparation/text" element={<DataPreparation />} />
    </Routes>
  );
};

export default Root;
