import React from "react";
import Plot from "react-plotly.js";

const PlotContainer = ({ color, data, title }) => {
  return (
    <div
      className={`bg-[white] border-[2px]
    ${
      color === "green"
        ? "border-[#A1E3CB]"
        : color === "blue"
        ? "border-[#95A4FC]"
        : "border-[#A8C5DA]"
    } rounded-[16px] flex justify-center items-center p-2`}
    >
      <Plot
        data={data}
        layout={{
          width: "5vw",
          height: "500px",
          title: {
            text: title,
          },
          xaxis: {
            title: {
              text: "Index",
              font: {
                size: 14,
              },
              standoff: 8,
            },
            zeroline: false,
          },
          yaxis: {
            title: {
              text: "Value",
              font: {
                size: 14,
              },
              standoff: 3,
            },
            zeroline: false,
          },
          margin: { t: 30, r: 30 },
        }}
      />
    </div>
  );
};

export default PlotContainer;
