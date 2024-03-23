import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Models, Predict } from "views";

const Root = () => {
  return (
    <Routes>
      <Route path="/models/time_series" element={<Models />} />
      <Route path="/predict/time_series" element={<Predict />} />
      <Route path="*" element={<Navigate to="/models/time_series" />} />
    </Routes>
  );
};

export default Root;
