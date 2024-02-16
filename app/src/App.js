import React, { useState, useRef } from "react";
import { parse } from "papaparse";
import Plot from "react-plotly.js";

const App = () => {
  const fileInputRef = useRef(null);
  const selectXLabelRef = useRef(null);
  const [csvData, setCsvData] = useState(null);
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [XLabel, setXLabel] = useState(); //sort
  const [YLabels, setYLabels] = useState([]);
  const handleCsvSubmission = async () => {
    const file = fileInputRef.current.files[0];
    if (file) {
      const text = await file.text();
      const { data } = parse(text, { header: true });
      setCsvHeaders(Object.keys(data[0]));
      setCsvData(data);
    }
  };
  console.log(csvHeaders);
  const handleXLabel = () => {
    const selectedXLabel = selectXLabelRef.current.value;
    const YLabels = csvHeaders.filter(
      (csvHeader) => csvHeader !== selectedXLabel
    );
    setXLabel(selectedXLabel);
    setYLabels(YLabels);
  };
  return (
    <div>
      <input type="file" ref={fileInputRef} accept=".csv" />
      <button onClick={handleCsvSubmission}>Submit</button>
      {csvHeaders.length > 0 && (
        <>
          <label htmlFor="XLabel">X labels</label>
          <select name="XLabel" id="XLabel" ref={selectXLabelRef}>
            {csvHeaders.map((csvHeader) => (
              <option value={csvHeader} key={csvHeader}>
                {csvHeader}
              </option>
            ))}
          </select>
          <button onClick={handleXLabel}>Submit XLabel</button>
        </>
      )}
      {YLabels.length > 0 &&
        YLabels.map((YLabel) => {
          const chartData = csvData.map((row, index) => {
            const value = parseFloat(row[YLabel]);
            return {
              label: index,
              value: value,
            };
          });
          return (
            <div key={YLabel}>
              <div>{YLabel}</div>
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
            </div>
          );
        })}
    </div>
  );
};

export default App;
