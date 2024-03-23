import React from "react";
import ReactDOM from "react-dom/client";
import Root from "views/Root";
import AppProviders from "providers";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AppProviders>
      <Root />
    </AppProviders>
  </React.StrictMode>
);
