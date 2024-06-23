import React, { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { parse } from "papaparse";
import { useForm } from "react-hook-form";
import Plot from "react-plotly.js";
import { io } from "socket.io-client";
import axios from "axios";
import { Card, Button, Input, InputFile } from "components";

const Predict = () => {
  const { register, watch } = useForm();
  const socket = useRef();
  const fileInputTxtRef = useRef(null);
  const fileInputCsvRef = useRef(null);
  const [txtData, setTxtData] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [feature, setFeature] = useState();
  const [csvData, setCsvData] = useState(null);
  const [responseState, setResponseState] = useState(null);

  useEffect(() => {
    socket.current = io("http://127.0.0.1:5000");
    socket.current.on("epoch_update", (epochs) => {});
    socket.current.on("training_completed", (results) => {
      const parsedData = JSON.parse(results);
    });
  }, []);

  const handleTxtSubmission = async () => {
    const file = fileInputTxtRef.current.files[0];
    if (file) {
      const text = await file.text();
      const data = JSON.parse(text);
      setTxtData(data);
    }
  };

  const handleOutsideClick = (event) => {
    if (selectedId && !event.target.closest(".animate-presence")) {
      setSelectedId(null);
    }
  };

  const handleCsvSubmission = async () => {
    const file = fileInputCsvRef.current.files[0];
    if (file) {
      const text = await file.text();
      const { data } = parse(text, { header: true });
      setCsvData(data);
    }
  };

  const handlePredict = async () => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/predict/time_series",
        {
          ...txtData,
          y_test: csvData,
          next_time_steps: watch("next_time_steps"),
        }
      );
      setResponseState(response.data);
    } catch (error) {
      console.error("Błąd podczas wysyłania zapytania POST:", error);
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
            func={handleCsvSubmission}
          />
        </Card>
      )}
      {csvData && (
        <Card
          color="grey"
          classStyle="min-h-[150px]"
          classStyleDiv="flex flex-wrap justify-center items-center w-full gap-4"
        >
          <div className="relative mb-4">
            <Input
              type="number"
              name="next_time_steps"
              label="Next time steps"
              color="blue"
              register={register}
            />
          </div>
          <Button
            type="button"
            text="Submit"
            color="blue"
            func={handlePredict}
          />
        </Card>
      )}
      {responseState && (
        <Card classStyleDiv="flex flex-row flex-wrap justify-center items-center w-full gap-4">
          <div className="flex gap-[5px] flex-wrap">
            {responseState?.results.map((state, index) => (
              <motion.div
                key={index + 1}
                layoutId={index + 1}
                onClick={() => {
                  setSelectedId(index + 1);
                  setFeature(state.feature);
                }}
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
          <Card layoutId={selectedId} setSelectedId={setSelectedId}>
            <motion.div>
              <motion.div>
                <div className="bg-[white] pt-12 border-[2px] border-[#95A4FC] rounded-[16px] flex justify-center items-center p-2">
                  <Plot
                    data={[
                      {
                        x: csvData.map((value, index) => index),
                        y: csvData.map((value) => value[feature]),
                        type: "scatter",
                        mode: "lines",
                        name: "testing",
                        marker: { color: "#82ca9d" },
                      },
                      {
                        x: responseState?.results[
                          selectedId - 1
                        ].predictions.map(
                          (value, index) => responseState?.split_index + index
                          //csvData.length - responseState.split_index + index
                        ),

                        y: responseState?.results[
                          selectedId - 1
                        ].predictions.map((value) => value),
                        type: "scatter",
                        mode: "lines",
                        name: "predictions",
                      },
                    ]}
                    layout={{
                      width: "5vw",
                      height: "500px",
                      // width: 800,
                      // height: 400,
                      title: {
                        text: "Predictions",
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
              </motion.div>
            </motion.div>
          </Card>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Predict;
