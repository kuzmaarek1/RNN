import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { parse } from "papaparse";
import Plot from "react-plotly.js";

const App = () => {
  const { register, handleSubmit } = useForm();
  const [chartData, setChartData] = useState(null);

  const onSubmit = async (data) => {
    const file = data.csvFile[0];
    const text = await file.text();
    const { data: csvData } = parse(text, { header: true });

    const parsedData = csvData.map((row, index) => ({
      label: index,
      value: parseFloat(row.close),
    }));

    setChartData(parsedData);
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input type="file" {...register("csvFile")} accept=".csv" />
        <button type="submit">Submit</button>
      </form>
      {chartData && (
        <div style={{ width: 800, height: 400 }}>
          <Plot
            data={[
              {
                x: chartData.map((dataPoint) => dataPoint.label),
                y: chartData.map((dataPoint) => dataPoint.value),
                type: "scatter",
                mode: "lines",
                marker: { color: "#82ca9d" },
              },
            ]}
            layout={{
              width: 800,
              height: 400,
              title: {
                text: "Time Series",
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
              //legend: { orientation: 'h' },
            }}
          />
        </div>
      )}
    </div>
  );
};

export default App;
