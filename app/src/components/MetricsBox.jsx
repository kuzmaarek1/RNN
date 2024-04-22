import React from "react";

const MetricsBox = ({ text }) => {
  return (
    <div className="flex p-2 justify-center items-center border-[2px] border-[#A8C5DA] mb-1 p-1 rounded-[16px]">
      {text}
    </div>
  );
};

export default MetricsBox;
