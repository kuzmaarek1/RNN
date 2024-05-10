import React from "react";
import { FaTimes } from "react-icons/fa";
import { motion } from "framer-motion";
import { Animation } from "views";

const Card = ({ color, layoutId, setSelectedId, classStyle, children }) => {
  return layoutId || layoutId === 0 ? (
    <div
      className={`${classStyle} fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-50`}
    >
      <motion.div
        className={`${
          color === "green"
            ? "bg-[#e3f5ff]"
            : color === "blue"
            ? "bg-[#e5ecf6]"
            : "bg-[#F7F9FB]"
        }  animate-presence rounded-[16px] custom-box-shadow p-12 relative
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
    >
      <div
        className={`${classStyle} ${
          color === "green"
            ? "bg-[#e3f5ff] border-[#A1E3CB]"
            : color === "blue"
            ? "bg-[#e5ecf6] border-[#95A4FC]"
            : "bg-[#F7F9FB] border-[#A8C5DA]"
        } rounded-[16px] border-[2px] p-8 relative flex flex-rows`}
      >
        <div>{children}</div>
      </div>
    </motion.div>
  );
};

export default Card;
