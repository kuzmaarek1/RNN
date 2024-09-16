import React from "react";

const CheckboxInput = ({ id, label, register, defaultChecked = false }) => {
  return (
    <div className="relative">
      <input
        type="checkbox"
        id={id}
        name={id}
        {...register(id)}
        defaultChecked={defaultChecked}
        className="hidden"
      />
      <label
        className="group check relative flex flex-row rounded-[16px] gap-1 font-semibold tracking-[0.1em] pr-[0.9em] pl-[1em] py-[8px] text-[#1c1c1c] cursor-pointer text-[12px] transition-all duration-200 checkbox-label"
        htmlFor={id}
      >
        {/* Animated Border and Background */}
        <div
          className="absolute rounded-[16px] border-[2px] border-[#A8C5DA] w-full h-full left-0 top-0
                      group-hover:before:w-[10px] group-hover:before:left-[calc(50%)]
                      before:content-[''] before:absolute before:w-[10px] before:h-[6px] before:bg-[white] 
                      before:border-[2px] before:border-[#A8C5DA] box-shadow-button-blue
                      before:top-[-3.5px] before:left-[80%] before:translate-x-[-50%]
                      group-hover:after:w-[10px] group-hover:after:left-[calc(50%)]
                      after:content-[''] after:absolute after:w-[10px] after:h-[6px] after:bg-[white] 
                      after:border-[2px] after:border-[#A8C5DA] after:bottom-[-3.5px] after:left-[20%]
                      after:translate-x-[-50%]"
        ></div>

        {/* Checkbox Icon */}
        <div>
          <svg width="18px" height="18px" viewBox="0 0 18 18">
            <path d="M1,9 L1,3.5 C1,2 2,1 3.5,1 L14.5,1 C16,1 17,2 17,3.5 L17,14.5 C17,16 16,17 14.5,17 L3.5,17 C2,17 1,16 1,14.5 L1,9 Z"></path>
            <polyline points="1 9 7 14 15 4"></polyline>
          </svg>
        </div>

        {/* Checkbox Label */}
        <div>{label}</div>
      </label>
    </div>
  );
};

export default CheckboxInput;
