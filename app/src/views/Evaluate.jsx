import React, { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { parse } from "papaparse";
import { useForm } from "react-hook-form";
import axios from "axios";
import { Button, Input, Card, InputFile, MetricsBox } from "components";
import PlotContainer from "./PlotContainer";

const Evaluate = ({ options }) => {
  const { register, watch } = useForm();
  const fileInputTxtRef = useRef(null);
  const fileInputCsvRef = useRef(null);
  const [txtData, setTxtData] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [responseState, setResponseState] = useState(null);

  const handleTxtSubmission = async () => {
    setResponseState(null);
    const file = fileInputTxtRef.current.files[0];
    if (file) {
      const text = await file.text();
      const data = JSON.parse(text);
      setTxtData(data);
    }
  };

  const handleOutsideClick = (event) => {
    if (
      (selectedId || selectedId === 0) &&
      !event.target.closest(".animate-presence")
    ) {
      setSelectedId(null);
    }
  };

  const handleCsvSubmissionAndEvaluate = async () => {
    const file = fileInputCsvRef.current.files[0];

    if (file) {
      const text = await file.text();
      const { data } = parse(text, { header: true });
      try {
        const url =
          options === "TimeSeries"
            ? "http://127.0.0.1:5000/evaluate/time_series"
            : "http://127.0.0.1:5000/evaluate/text_classification";

        const payload =
          options === "TimeSeries"
            ? { ...txtData, y_test: data }
            : { ...txtData, dataset: data };

        const response = await axios.post(url, payload);

        setResponseState(response.data);
      } catch (error) {
        console.error("Błąd podczas wysyłania zapytania POST:", error);
      }
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

  return (
    <div
      onClick={handleOutsideClick}
      className="w-[calc(100%-2rem)] flex flex-col gap-4 mx-4 mt-12 mb-12 h-max-content"
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
      {responseState && options === "TimeSeries" && (
        <Card
          classStyle="min-h-[150px]"
          classStyleDiv="flex flex-row flex-wrap justify-center items-center w-full gap-4"
        >
          <div className="flex gap-[5px] justify-center items-center flex-row flex-wrap">
            {responseState?.results.map((state, index) => (
              <motion.div
                key={index + 1}
                layoutId={index + 1}
                onClick={() => setSelectedId(index + 1)}
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
                <motion.div>{state?.feature}</motion.div>
              </motion.div>
            ))}
          </div>
        </Card>
      )}
      <AnimatePresence onClick={(event) => event.stopPropagation()}>
        {selectedId !== null && (
          <Card
            small={true}
            layoutId={selectedId}
            setSelectedId={() => setSelectedId(null)}
          >
            <motion.div>
              <div className="w-full flex justify-center items-center font-semibold uppercase">
                Metrics errors {responseState?.results[selectedId - 1].feature}
              </div>

              <PlotContainer
                data={[
                  {
                    x: responseState?.results[selectedId - 1]?.y_test?.map(
                      (value, index) => index
                    ),
                    y: responseState?.results[selectedId - 1]?.y_test?.map(
                      (value, index) => value
                    ),
                    type: "scatter",
                    mode: "lines",
                    name: "y_test",
                  },
                  {
                    x: responseState?.results[selectedId - 1]?.predictions?.map(
                      (value, index) => index
                    ),
                    y: responseState?.results[selectedId - 1]?.predictions?.map(
                      (value, index) => value
                    ),
                    type: "scatter",
                    mode: "lines",
                    name: "pred",
                  },
                ]}
                classStyle={`w-[75vw]`}
                title={"Time Series"}
              />
              <div className="flex flex-col items-center justify-center gap-1 mt-2">
                {Object.entries(responseState?.results[selectedId - 1]).map(
                  ([key, value]) =>
                    key !== "predictions" &&
                    key !== "feature" &&
                    key !== "y_test" && (
                      <div className="flex overflow-auto gap-2" key={key}>
                        <div className="flex w-[300px] justify-center items-center border-[2px] border-[#A8C5DA] rounded-[16px]">
                          {key
                            .replace(/error/gi, "")
                            .replace(/_/g, " ")
                            .toUpperCase()}
                        </div>
                        <div className="flex w-[300px] justify-center items-center border-[2px] border-[#A8C5DA] rounded-[16px]">
                          {value.toFixed(3)}
                        </div>
                      </div>
                    )
                )}
              </div>
            </motion.div>
          </Card>
        )}
      </AnimatePresence>
      {allEntries.length > 0 && options === "Text" && (
        <Card
          classStyle="min-h-[150px]"
          classStyleDiv="flex flex-row flex-wrap justify-center items-center w-full gap-4"
        >
          <PlotContainer
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
            title="Confusion Matrix"
            XTitle="Predicted Label"
            YTitle="True Label"
            annotations={generateAnnotations(
              responseState?.labels,
              responseState?.labels.slice().reverse(),
              responseState?.confusion_matrix.slice().reverse()
            )}
            classStyle={`sm:w-[50vw] w-[90vw]`}
          />
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
