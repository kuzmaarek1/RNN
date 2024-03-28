import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import {
  Models,
  Evaluate,
  Predict,
  Compare,
  ModelsText,
  PredictText,
} from "views";

const Root = () => {
  return (
    <Routes>
      <Route path="/models/time_series" element={<Models />} />
      <Route path="/evaluate/time_series" element={<Evaluate />} />
      <Route path="/predict/time_series" element={<Predict />} />
      <Route path="/compare/time_series" element={<Compare />} />
      <Route path="*" element={<Navigate to="/models/time_series" />} />
      <Route path="/models/text" element={<ModelsText />} />
      <Route path="/predict/text" element={<PredictText />} />
    </Routes>
  );
};

export default Root;
