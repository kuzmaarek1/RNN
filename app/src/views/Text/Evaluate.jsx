import React, { useState, useRef } from "react";
import { parse } from "papaparse";
import axios from "axios";
import { useForm } from "react-hook-form";
import Plot from "react-plotly.js";
import { Card, Button, Input, MetricsBox, InputFile } from "components";

const Evaluate = () => {
  const { register, watch } = useForm();
  const fileInputTxtRef = useRef(null);
  const fileInputCsvRef = useRef(null);
  const [txtData, setTxtData] = useState(null);
  const [responseState, setResponseState] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  const handleTxtSubmission = async () => {
    const file = fileInputTxtRef.current.files[0];
    if (file) {
      const text = await file.text();
      const data = JSON.parse(text);
      setTxtData(data);
    }
  };

  const handleCsvSubmissionAndEvaluate = async () => {
    const file = fileInputCsvRef.current.files[0];
    if (file) {
      const text = await file.text();
      const { data } = parse(text, { header: true });
      try {
        const response = await axios.post(
          "http://127.0.0.1:5000/evaluate/text_classification",
          { ...txtData, dataset: data }
        );
        setResponseState(response.data);
      } catch (error) {
        console.error("Błąd podczas wysyłania zapytania POST:", error);
      }
    }
  };

  const handleDownloadTxt = () => {
    if (responseState) {
      const dataToDownload = JSON.stringify(responseState);
      const blob = new Blob([dataToDownload], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${watch("name_file")}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  };

  const handleOutsideClick = (event) => {
    if (selectedId && !event.target.closest(".animate-presence")) {
      setSelectedId(null);
    }
  };

  const excludedKeys = ["accuracy", "macro avg", "weighted avg"];
  let filteredEntries = [];
  let otherEntries = [];

  if (responseState?.report) {
    filteredEntries = Object.entries(responseState.report).filter(
      ([key]) => key === "macro avg" || key === "weighted avg"
    );

    otherEntries = Object.entries(responseState.report).filter(
      ([key]) => !excludedKeys.includes(key)
    );
  }

  const allEntries = otherEntries.concat(filteredEntries);
  const generateAnnotations = (xValues, yValues, zValues) => {
    var annotations = [];
    for (var i = 0; i < yValues.length; i++) {
      for (var j = 0; j < xValues.length; j++) {
        var currentValue = zValues[i][j];
        var textColor = currentValue !== 0.0 ? "white" : "black";
        var result = {
          xref: "x1",
          yref: "y1",
          x: xValues[j],
          y: yValues[i],
          text: currentValue,
          font: {
            family: "Arial",
            size: 12,
            color: "rgb(50, 171, 96)",
          },
          showarrow: false,
          font: {
            color: textColor,
          },
        };
        annotations.push(result);
      }
    }
    return annotations;
  };

  return (
    <div
      onClick={handleOutsideClick}
      className="sm:w-[83vw] flex flex-col gap-4 ml-4 mt-12 mb-12 h-max-content"
    >
      <Card
        color="green"
        classStyle="min-h-[150px]"
        classStyleDiv="flex flex-row flex-wrap justify-center items-center w-full gap-4"
      >
        <InputFile
          ref={fileInputTxtRef}
          fileAcept=".txt"
          multiple={false}
          color="green"
        />
        <Button
          color="green"
          text="Submit"
          type="button"
          func={handleTxtSubmission}
        />
      </Card>
      {txtData && (
        <Card
          color="blue"
          classStyle="min-h-[150px]"
          classStyleDiv="flex flex-row flex-wrap justify-center items-center w-full gap-4"
        >
          <InputFile
            ref={fileInputCsvRef}
            fileAcept=".csv"
            multiple={false}
            color="blue"
          />
          <Button
            type="button"
            text="Submit"
            color="blue"
            func={handleCsvSubmissionAndEvaluate}
          />
        </Card>
      )}
      {allEntries.length > 0 && (
        <Card
          classStyle="min-h-[150px]"
          classStyleDiv="flex flex-row flex-wrap justify-center items-center w-full gap-4"
        >
          <div className="bg-[white] pt-12 border-[2px]  border-[#A8C5DA] rounded-[16px] flex justify-center items-center p-2">
            <Plot
              data={[
                {
                  type: "heatmap",
                  x: responseState?.labels,
                  y: responseState?.labels.slice().reverse(),
                  z: responseState?.confusion_matrix.slice().reverse(),
                  colorscale: [
                    [0, "#3D9970"],
                    [1, "#001f3f"],
                  ],
                },
              ]}
              layout={{
                width: "5vw",
                height: "500px",
                annotations: generateAnnotations(
                  responseState?.labels,
                  responseState?.labels.slice().reverse(),
                  responseState?.confusion_matrix.slice().reverse()
                ),

                title: {
                  text: "Confusion Matrix",
                },
                xaxis: {
                  title: {
                    text: "Predicted Label",
                    font: {
                      size: 14,
                    },
                    standoff: 8,
                  },
                  zeroline: false,
                },
                yaxis: {
                  title: {
                    text: "True Label",
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
          <div className="grid grid-cols-5 gap-2">
            <MetricsBox text="Category" />
            {allEntries.map((props, index) => (
              <>
                {index == 0 &&
                  Object.entries(props[1]).map(([key, value]) => (
                    <MetricsBox
                      text={key.charAt(0).toUpperCase() + key.slice(1)}
                    />
                  ))}

                <MetricsBox
                  text={props[0].charAt(0).toUpperCase() + props[0].slice(1)}
                />
                {Object.entries(allEntries[0][1]).map(([key, value]) => (
                  <MetricsBox
                    text={
                      key !== "support"
                        ? props[1][key].toFixed(3)
                        : props[1][key]
                    }
                  />
                ))}
              </>
            ))}
            <MetricsBox text="Accuracy" />
            <MetricsBox text={responseState?.report["accuracy"].toFixed(3)} />
          </div>
        </Card>
      )}
      {responseState && (
        <Card
          color="green"
          classStyle="min-h-[150px]"
          classStyleDiv="flex flex-row flex-wrap justify-center items-center w-full gap-4"
        >
          <div className="relative flex flex-row gap-4">
            <Input
              type="text"
              name="name_file"
              label="Name File"
              color="green"
              register={register}
            />
            <Button
              text="Download"
              color="green"
              type="button"
              func={handleDownloadTxt}
            />
          </div>
        </Card>
      )}
    </div>
  );
};

export default Evaluate;
