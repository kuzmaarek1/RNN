import React, { useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { Navbar, Card } from "components";

const AppProviders = ({ children }) => {
  return (
    <Router>
      <div className="flex flex-rows">
        <Navbar />
        {children}
      </div>
    </Router>
  );
};

export default AppProviders;
