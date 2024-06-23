import React, { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { parse } from "papaparse";
import { useForm } from "react-hook-form";
import Plot from "react-plotly.js";
import { io } from "socket.io-client";
import axios from "axios";
import { Button, Input, Card, InputFile } from "components";

const Evaluate = () => {
  const { register, watch } = useForm();

  const socket = useRef();
  const fileInputTxtRef = useRef(null);
  const fileInputCsvRef = useRef(null);
  const [txtData, setTxtData] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [responseState, setResponseState] = useState(null);

  useEffect(() => {
    socket.current = io("http://127.0.0.1:5000");
    socket.current.on("epoch_update", (epochs) => {});
    socket.current.on("training_completed", (results) => {
      const parsedData = JSON.parse(results);
    });
  }, []);

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
        const response = await axios.post(
          "http://127.0.0.1:5000/evaluate/time_series",
          { ...txtData, y_test: data }
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
      {responseState && (
        <Card
          classStyle="min-h-[150px]"
          classStyleDiv="flex flex-row flex-wrap justify-center items-center w-full gap-4"
        >
          <div className="flex gap-[5px]  flex-row flex-wrap">
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
                <motion.div>{state.feature}</motion.div>
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
            setSelectedId={setSelectedId}
          >
            <motion.div>
              <div className="w-full flex justify-center items-center font-semibold uppercase">
                Metrics errors {responseState?.results[selectedId - 1].feature}
              </div>
              <div className="bg-[white] border-[2px] border-[#95A4FC] rounded-[16px] flex justify-center items-center p-2">
                <Plot
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
                      x: responseState?.results[
                        selectedId - 1
                      ]?.predictions?.map((value, index) => index),
                      y: responseState?.results[
                        selectedId - 1
                      ]?.predictions?.map((value, index) => value),
                      type: "scatter",
                      mode: "lines",
                      name: "predictions",
                    },
                  ]}
                  layout={{
                    //width: "5vw",
                    height: "100px",
                    // width: 800,
                    // height: 400,
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
                    //margin: { t: 30, r: 30 },
                    //legend: { orientation: 'h' },
                  }}
                />
              </div>
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
