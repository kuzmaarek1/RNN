import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import {
  Models,
  Evaluate,
  Predict,
  Compare,
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
      <Route path="/models/time_series" element={<Models />} />
      <Route path="/training/time_series" element={<Training />} />
      <Route path="/training/text" element={<Training />} />
      <Route path="/evaluate/time_series" element={<Evaluate />} />
      <Route path="/predict/time_series" element={<Predict />} />
      <Route path="/compare/time_series" element={<Compare />} />
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
