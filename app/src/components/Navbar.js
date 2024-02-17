import React from "react";

const Navbar = () => {
  return (
    <div className="w-[212px] h-[924px] flex flex-col p-[12px] border-r-[1px] border-r-[#1c1c1c1a] border-r-solid gap-[4px]">
      <div className="text-[#1c1c1c] text-[14px] font-[400]">
        Recurrent neural network
      </div>
      <div className="text-[#1c1c1c66] text-[14px] font-[400]">Time series</div>
      <div className="text-[#1c1c1c] text-[14px] font-[400] bg-[#1c1c1c0d] p-[8px] rounded-[8px]">
        Datasets
      </div>
      <div className="text-[#1c1c1c] text-[14px] font-[400] bg-[#1c1c1c0d] p-[8px] rounded-[8px]">
        Models
      </div>
      <div className="text-[#1c1c1c66] text-[14px] font-[400]">Text</div>
      <div className="text-[#1c1c1c] text-[14px] font-[400] bg-[#1c1c1c0d] p-[8px] rounded-[8px]">
        Datasets
      </div>
      <div className="text-[#1c1c1c] text-[14px] font-[400] bg-[#1c1c1c0d] p-[8px] rounded-[8px]">
        Models
      </div>
    </div>
  );
};

export default Navbar;
