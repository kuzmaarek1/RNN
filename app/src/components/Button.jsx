import React from "react";

const Button = ({ text, func }) => {
  return (
    <button
      className="button relative uppercase spacing tracking-widest font-[400] text-base py-[10px] duration-500 w-[150px] rounded-[16px] border-[2px]  text-[#1c1c1c] group
            hover:border-[#A1E3CB] hover:tracking-[0.25em] before:content-[''] before:absolute before:inset-[2px]"
      onClick={func}
    >
      <span className="relative z-10 flex justify-center">{text}</span>
      <i
        className="box-shadow-button group-hover:before:w-[10px] group-hover:before:left-[calc(50%)] 
              before:content-[''] before:absolute  before:w-[10px] before:h-[6px] before:bg-[white] before:border-[2px] before:border-[#A1E3CB] before:top-[-3.5px] before:left-[80%] before:translate-x-[-50%]
              group-hover:after:w-[10px]  group-hover:after:left-[calc(50%)]
              after:content-[''] after:absolute after:w-[10px] after:h-[6px] after:bg-[white] after:border-[2px] after:border-[#A1E3CB] after:bottom-[-3.5px] after:left-[20%] after:translate-x-[-50%]"
      ></i>
    </button>
  );
};

export default Button;
