import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { Navbar, Card } from "components";

const AppProviders = ({ children }) => (
  <Router>
    <div className="flex flex-rows">
      <Navbar />
      {children}
    </div>
  </Router>
);

export default AppProviders;
