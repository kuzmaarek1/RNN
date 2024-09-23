import React from "react";
import Plot from "react-plotly.js";

const PlotContainer = ({
  color,
  data,
  title,
  XTitle,
  YTitle,
  annotations,
  classStyle,
}) => {
  return (
    <div className="flex justify-center items-center flex-col mt-[3px]">
      <div
        className={`$bg-[white] border-[2px]
    ${
      color === "green"
        ? "border-[#A1E3CB]"
        : color === "blue"
        ? "border-[#95A4FC]"
        : "border-[#A8C5DA]"
    } rounded-[16px] tracking-[0.2em] font-[600] flex justify-center items-center pl-[0.8em] pr-[0.6em] py-2 bg-white text-[16px] z-10 mb-[-22px]`}
      >
        {title}
      </div>
      <div className="flex flex-row justify-center items-center w-[100%] relative">
        <div
          className={`bg-[white] border-[2px] ${
            color === "green"
              ? "border-[#A1E3CB]"
              : color === "blue"
              ? "border-[#95A4FC]"
              : "border-[#A8C5DA]"
          } absolute left-0 translate-x-[-50%] translate-y-[calc(-50%+1em)] rounded-[16px] flex justify-center items-center py-1 text-[12px] z-10 tracking-[0.1em] pr-[0.9em] pl-[1em] rotate-[270deg] z-20`}
        >
          {YTitle ? YTitle : "Value"}
        </div>
        <div
          className={`${classStyle} bg-[white] border-[2px]
    ${
      color === "green"
        ? "border-[#A1E3CB]"
        : color === "blue"
        ? "border-[#95A4FC]"
        : "border-[#A8C5DA]"
    } rounded-[16px] flex justify-center items-center p-2 relative`}
        >
          <Plot
            data={data}
            layout={{
              xaxis: {
                tickfont: {
                  size: 10,
                },
                zeroline: false,
              },
              yaxis: {
                tickfont: {
                  size: 10,
                },
                zeroline: false,
              },
              legend: {
                y: 0.95,
                font: {
                  size: 10,
                },
              },
              annotations: annotations ? annotations : [],
              margin: { t: 0, r: 0, l: 40, b: 30 },
            }}
            useResizeHandler={true}
            style={{ width: "100%", height: "500px" }}
          />
        </div>
      </div>
      <div
        className={`$bg-[white] border-[2px]
    ${
      color === "green"
        ? "border-[#A1E3CB]"
        : color === "blue"
        ? "border-[#95A4FC]"
        : "border-[#A8C5DA]"
    } rounded-[16px] flex justify-center items-center py-1 bg-white text-[12px] mt-[-16px] z-10 tracking-[0.1em] pl-[1.0em] pr-[0.9em]`}
      >
        {XTitle ? XTitle : "Index"}
      </div>
    </div>
  );
};

export default PlotContainer;
