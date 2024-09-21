import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Card, Button, Input } from "components";

const DataVisualization = ({
  register,
  numberSlider,
  setNumberSlider,
  category,
  text,
  size,
  transition,
  variants,
}) => {
  return (
    <div className="lg:col-span-2">
      <Card classStyleDiv="flex flex-col justify-center items-center w-full gap-4">
        <div className="relative w-[200px]">
          <Input
            type="number"
            name="numberSlider"
            label="Number"
            register={register}
            onChange={(value) => {
              isNaN(value) || size - 1 < value
                ? setNumberSlider("numberSlider", null)
                : value === ""
                ? setNumberSlider("numberSlider", Number(0))
                : setNumberSlider("numberSlider", Number(value));
            }}
            value={numberSlider == null ? "" : Number(numberSlider)}
            min={`0`}
            max={`${size - 1}`}
          />
        </div>
        <AnimatePresence>
          {numberSlider != null && (
            <motion.div
              variants={variants}
              initial="hidden"
              animate="visible"
              exit="exit"
              key="hidden"
              transition={transition}
              className="flex flex-col justify-center items-center w-full gap-2"
            >
              <motion.div
                key={numberSlider ? numberSlider : "empty"}
                initial={{ y: 20, opacity: 0, scale: 0.8 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: -20, opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                layout
              >
                <motion.div>
                  <motion.div className="flex flex-row flex-wrap mt-2 justify-center items-center gap-x-4 gap-y-[14px]">
                    <motion.div className="max-h-[35px] overflow-auto flex flex-wrap w-[150px] justify-center items-center border-[2px] border-[#A8C5DA] mb-[-16px] rounded-[16px] z-8 bg-[#F7F9FB]">
                      Category
                    </motion.div>
                    <motion.div className="max-h-[35px] overflow-auto flex flex-wrap w-[150px] justify-center items-center border-[2px] border-[#A8C5DA] mb-[-16px] p-1 rounded-[16px] z-5 bg-[#F7F9FB]">
                      {category}
                    </motion.div>
                  </motion.div>
                  <motion.div className="flex flex-row flex-wrap gap-4 border-[2px] border-[#A8C5DA] pt-[12px] pb-[4px] rounded-[16px] px-3">
                    <motion.div className="max-h-[150px] flex w-[100%] pt-1 flex-wrap justify-center items-center  overflow-auto">
                      {text}
                    </motion.div>
                  </motion.div>
                </motion.div>
              </motion.div>
              <motion.div className="flex flex-row flex-wrap justify-center items-center gap-x-4 mt-[14px] gap-y-[14px]">
                <Button
                  color="grey"
                  type="button"
                  text="Prev"
                  func={() =>
                    setNumberSlider((prev) =>
                      prev === 0 ? size - 1 : prev - 1
                    )
                  }
                />
                <Button
                  color="grey"
                  type="button"
                  text="Next"
                  func={() =>
                    setNumberSlider((prev) =>
                      prev === size - 1 ? 0 : prev + 1
                    )
                  }
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
};

export default DataVisualization;
