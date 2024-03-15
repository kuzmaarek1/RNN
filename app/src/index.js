import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import Predict from "./Predict";
import Animation from "./Animation";
import Text from "./TextAnimation.js";
import Navbar from "./components/Navbar.js";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <div className="flex flex-rows">
      <Navbar />
      <Predict />
    </div>
  </React.StrictMode>
);
