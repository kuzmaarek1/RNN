import React from "react";
import { FaTimes } from "react-icons/fa";
import { motion } from "framer-motion";

const Card = ({ color, layoutId, setSelectedId, children }) => {
  return layoutId ? (
    <div className="fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-50">
      <motion.div
        className={`${
          color === "green"
            ? "bg-[#e3f5ff]"
            : color === "blue"
            ? "bg-[#e5ecf6]"
            : "bg-[#F7F9FB]"
        }  animate-presence rounded-[16px] custom-box-shadow p-12 relative`}
        layoutId={layoutId}
      >
        {children}
        <motion.button
          className="absolute top-0 right-0 m-5 text-[#95A4FC]"
          onClick={() => setSelectedId(null)}
        >
          <FaTimes />
        </motion.button>
      </motion.div>
    </div>
  ) : (
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
