import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Card } from "components";
import { PlotContainer } from "views";

const DataVisualization = ({
  YLabels,
  setSelectedId,
  selectedId,
  chartData,
}) => {
  return (
    <>
      <div className="lg:col-span-2">
        <Card>
          <div className="flex justify-center items-center gap-[5px] flex-wrap">
            {YLabels.map((YLabel, index) => (
              <motion.div
                key={YLabel}
                layoutId={YLabel}
                onClick={() => setSelectedId("selectedId", YLabel)}
                className={`${
                  index % 4 === 0
                    ? "border-[#95A4FC]"
                    : index % 4 === 1
                    ? "border-[#BAEDBD]"
                    : index % 4 === 2
                    ? "border-[#1C1C1C]"
                    : "border-[#B1E3FF]"
                } border-[2px] mb-[10px] w-[200px] h-[50px] rounded-[16px] flex justify-center items-center cursor-pointer`}
              >
                <motion.div>{YLabel}</motion.div>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>
      <AnimatePresence onClick={(event) => event.stopPropagation()}>
        {selectedId && (
          <Card layoutId={selectedId} setSelectedId={setSelectedId}>
            <PlotContainer
              data={[
                {
                  x: chartData.map((dataPoint) => dataPoint.label),
                  y: chartData.map((dataPoint) => dataPoint.value),
                  type: "scatter",
                  mode: "lines",
                  marker: { color: "#82ca9d" },
                },
              ]}
              title={`Feauture - ${selectedId}`}
              classStyle={`w-[75vw]`}
            />
          </Card>
        )}
      </AnimatePresence>
    </>
  );
};

export default DataVisualization;
