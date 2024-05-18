import React from "react";

const Button = ({ text, func, color, type, classStyle, file }) => {
  return (
    <div>
      <button
        className={`${classStyle} button relative uppercase spacing tracking-widest font-[400] text-base py-[10px] duration-500 w-[150px] rounded-[16px] border-[2px]
         ${
           color === "green"
             ? "border-[#A1E3CB]"
             : color === "blue"
             ? "border-[#95A4FC]"
             : "border-[#A8C5DA]"
         } 
         ${file && "font-[600]"}
         text-[#1c1c1c] group
         hover:tracking-[0.25em] before:content-[''] before:absolute before:inset-[2px]`}
        onClick={func}
        type={type}
      >
        <span className="relative flex justify-center">{text}</span>
        <i
          className={`box-shadow-button group-hover:before:w-[10px] group-hover:before:left-[calc(50%)] 
            before:content-[''] before:absolute before:w-[10px] before:h-[6px] before:bg-[white] before:border-[2px] 
            ${
              color === "green"
                ? "before:border-[#A1E3CB] after:border-[#A1E3CB] box-shadow-button-green"
                : color === "blue"
                ? "before:border-[#95A4FC] after:border-[#95A4FC] box-shadow-button-blue"
                : "before:border-[#A8C5DA] after:border-[#A8C5DA] box-shadow-button-grey"
            } 
            before:top-[-3.5px] before:left-[80%] before:translate-x-[-50%]
            group-hover:after:w-[10px]  group-hover:after:left-[calc(50%)]
            after:content-[''] after:absolute after:w-[10px] after:h-[6px] after:bg-[white] after:border-[2px] after:bottom-[-3.5px] after:left-[20%] after:translate-x-[-50%]`}
        ></i>
      </button>
    </div>
  );
};

export default Button;
