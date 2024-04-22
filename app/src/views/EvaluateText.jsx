import React, { useState, useRef, useEffect } from "react";
import { parse } from "papaparse";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { useForm, useFieldArray } from "react-hook-form";
import Plot from "react-plotly.js";
import { Card, Button, Input, MetricsBox } from "components";

const EvaluateText = () => {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm();

  const fileInputTxtRef = useRef(null);
  const fileInputCsvRef = useRef(null);
  const [txtData, setTxtData] = useState(null);

  const [csvData, setCsvData] = useState(null);
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [responseState, setResponseState] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  const handleTxtSubmission = async () => {
    const file = fileInputTxtRef.current.files[0];
    if (file) {
      const text = await file.text();
      console.log(text);
      const data = JSON.parse(text);
      //setTxtHeaders(Object.keys(data[0]));
      setTxtData(data);
    }
  };
  console.log(txtData);
  /*
  const onSubmit = async (data) => {
    console.log({ ...txtData, ...data });
    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/predict/text_classification",
        { ...txtData, ...data }
      );
      console.log(response.data);
      setResponseState(response.data);
    } catch (error) {
      console.error("Błąd podczas wysyłania zapytania POST:", error);
    }
  };
*/
  const handleCsvSubmissionAndEvaluate = async () => {
    const file = fileInputCsvRef.current.files[0];
    if (file) {
      const text = await file.text();
      const { data } = parse(text, { header: true });
      setCsvHeaders(Object.keys(data[0]));
      setCsvData(data);
      try {
        console.log({ ...txtData, dataset: data });
        const response = await axios.post(
          "http://127.0.0.1:5000/evaluate/text_classification",
          { ...txtData, dataset: data }
        );
        console.log(response.data);
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
    console.log(event);
    if (selectedId && !event.target.closest(".animate-presence")) {
      setSelectedId(null);
    }
  };

  console.log(responseState);

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
  console.log(allEntries);
  console.log(responseState?.confusion_matrix);
  console.log(responseState?.labels);

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
    <div onClick={handleOutsideClick} className="flex flex-col gap-8">
      <Card color="green" classStyle="min-h-[150px]">
        <div className="text-[#1c1c1c] font-[14px] font-[600]">Select file</div>
        <input
          type="file"
          className="mb-4"
          ref={fileInputTxtRef}
          accept=".txt"
        />
        <Button
          color="green"
          text="Submit"
          type="button"
          func={handleTxtSubmission}
        />
      </Card>
      {txtData && (
        <Card color="blue">
          <div className="text-[#1c1c1c] font-[14px] font-[600]">
            Select file
          </div>
          <input
            type="file"
            className="mb-4"
            ref={fileInputCsvRef}
            accept=".csv"
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
        <Card>
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
        <Card color="green">
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
              // width: 800,
              // height: 400,
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
              //legend: { orientation: 'h' },
            }}
          />
        </Card>
      )}
      {responseState && (
        <Card color="green">
          <div className="relative flex flex-col gap-4">
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

export default EvaluateText;
