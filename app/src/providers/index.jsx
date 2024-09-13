import React from "react";
import { useCycle } from "framer-motion";
import { BrowserRouter as Router } from "react-router-dom";
import { Navbar } from "components";

const AppProviders = ({ children }) => {
  const [isOpen, toggleOpen] = useCycle(false, true);
  return (
    <Router>
      <div className="flex flex-rows">
        <Navbar isOpen={isOpen} toggleOpen={toggleOpen} />
        <div className={`${isOpen} ? "block" : "sm:block hidden"`}>
          {children}
        </div>
      </div>
    </Router>
  );
};

export default AppProviders;
