import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import Root from "views/Root";
import Navbar from "components/Navbar";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Router>
      <div className="flex flex-rows">
        <Navbar />
        <Root />
      </div>
    </Router>
  </React.StrictMode>
);
