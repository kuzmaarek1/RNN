import React from "react";
import { FaTimes } from "react-icons/fa";
import { motion } from "framer-motion";
import { Animation } from "views";

const Card = ({
  color,
  layoutId,
  setSelectedId,
  classStyle,
  children,
  classStyleDiv,
  small,
}) => {
  return layoutId || layoutId === 0 ? (
    <div
      className={`${classStyle} fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-50`}
    >
      <motion.div
        className={`${
          color === "green"
            ? "bg-[#e3f5ff] border-[#A1E3CB]"
            : color === "blue"
            ? "bg-[#e5ecf6] border-[#95A4FC]"
            : "bg-[#F7F9FB] border-[#A8C5DA]"
        } ${
          small ? "p-6" : "p-12"
        } animate-presence rounded-[16px] border-[3px] custom-box-shadow relative
        `}
        layoutId={layoutId}
      >
        {children}
        <motion.button
          className="absolute top-0 right-0 m-5 text-[#95A4FC]"
          onClick={() => setSelectedId(null)}
          type="button"
        >
          <FaTimes />
        </motion.button>
      </motion.div>
    </div>
  ) : (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.3,
      }}
      className="relative"
    >
      <div
        className={`${classStyle} ${
          color === "green"
            ? "bg-[#e3f5ff] border-[#A1E3CB] before:border-[#A1E3CB] after:border-[#A1E3CB]"
            : color === "blue"
            ? "bg-[#e5ecf6] border-[#95A4FC] before:border-[#95A4FC] after:border-[#95A4FC]"
            : "bg-[#F7F9FB] border-[#A8C5DA] before:border-[#A8C5DA] after:border-[#A8C5DA]"
        } rounded-[16px] border-[2px] p-8 relative flex flex-rows 
        before:content-[''] before:absolute before:w-[10px] before:h-[6px] before:bottom-0 before:bg-[white] before:border-[2px] before:top-[-3.5px] before:left-[85%] before:translate-x-[-50%]  before:translate-x-[-50%] 
        after:content-[''] after:absolute after:w-[10px] after:h-[6px] after:bottom-0 after:bg-[white] after:border-[2px] after:bottom-[-3.5px] after:left-[15%] after:translate-x-[-80%] after:translate-x-[-80%]`}
      >
        <div className={classStyleDiv}>{children}</div>
      </div>
    </motion.div>
  );
};

export default Card;
