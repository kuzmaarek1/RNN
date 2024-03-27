import React from "react";
import { NavLink } from "react-router-dom";

const Navbar = () => {
  const navbarTitle = ["models", "evaluate", "compare", "predict"];

  return (
    <div className="w-[212px] h-[924px] flex flex-col p-[12px] border-r-[1px] border-r-[#1c1c1c1a] border-r-solid gap-[4px]">
      <div className="text-[#1c1c1c] text-[14px] font-[400]">
        Recurrent neural network
      </div>
      <div className="text-[#1c1c1c66] text-[14px] font-[400]">Time series</div>
      {navbarTitle.map((props, index) => (
        <NavLink
          key={index}
          to={`${props}/time_series`}
          className="text-[#1c1c1c] text-[14px] font-[400] bg-[#1c1c1c0d] p-[8px] rounded-[8px]"
        >
          {props[0].toUpperCase()}
          {props.slice(1)}
        </NavLink>
      ))}
      <div className="text-[#1c1c1c66] text-[14px] font-[400]">Text</div>
      {navbarTitle.map((props, index) => (
        <NavLink
          key={index}
          to={`${props}/text`}
          className="text-[#1c1c1c] text-[14px] font-[400] bg-[#1c1c1c0d] p-[8px] rounded-[8px]"
        >
          {props[0].toUpperCase()}
          {props.slice(1)}
        </NavLink>
      ))}
    </div>
  );
};

export default Navbar;
