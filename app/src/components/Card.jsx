import React from "react";

const Card = ({ color, children }) => {
  return (
    <div
      className={`${
        color === "green"
          ? "bg-[#e3f5ff]"
          : color === "blue"
          ? "bg-[#e5ecf6]"
          : "bg-[#F7F9FB]"
      } rounded-[16px] custom-box-shadow p-8`}
    >
      {children}
    </div>
  );
};

export default Card;
