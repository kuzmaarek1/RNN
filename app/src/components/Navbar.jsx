import React from "react";
import { NavLink } from "react-router-dom";
import { navbarItems, navbarTitle } from "constants";
import { Animation, TextAnimation } from "views";

const Navbar = () => {
  const NavLinkStyle =
    "text-[#1c1c1c] text-[14px] font-[400] p-[8px] rounded-[8px] hover:bg-[#1c1c1c0d]";

  return (
    <div className="sm:w-[300px] h-[924px] flex flex-col p-[12px] border-r-[1px] border-r-[#1c1c1c1a] border-r-solid gap-[4px]">
      <div className="text-[#1c1c1c] text-[14px] font-[400]">
        Recurrent neural network
      </div>
      {navbarItems.map(({ title, link }) => (
        <>
          <div className="text-[#1c1c1c66] text-[14px] font-[400] text-center">
            {title}
          </div>
          <div className="h-[30px] w-full">
            {title == "Time series" ? <Animation /> : <TextAnimation />}
          </div>
          {navbarTitle.map(
            (props, index) =>
              (props !== "preparation" ||
                (props == "preparation" && title === "Text")) && (
                <NavLink
                  key={index}
                  to={`${props}/${link}`}
                  className={({ isActive }) =>
                    isActive
                      ? `bg-[#1c1c1c0d] ${NavLinkStyle}`
                      : `${NavLinkStyle}`
                  }
                >
                  {props[0].toUpperCase()}
                  {props.slice(1)}
                </NavLink>
              )
          )}
        </>
      ))}
    </div>
  );
};

export default Navbar;
