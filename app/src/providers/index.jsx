import React from "react";
import { useCycle } from "framer-motion";
import { BrowserRouter as Router } from "react-router-dom";
import { Navbar } from "components";

const AppProviders = ({ children }) => {
  const [isOpen, toggleOpen] = useCycle(false, true);
  return (
    <Router>
      <div className="flex flex-rows w-full">
        <Navbar isOpen={isOpen} toggleOpen={toggleOpen} />
        <div
          className={`${
            isOpen ? "sm:flex hidden" : "flex"
          } items-center w-[100vw] sm:ml-[220px] sm:w-[calc(100vw-220px)]`}
        >
          {children}
        </div>
      </div>
    </Router>
  );
};

export default AppProviders;
