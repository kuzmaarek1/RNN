import React, { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { parse } from "papaparse";
import { useForm, useFieldArray } from "react-hook-form";
import Plot from "react-plotly.js";
import { io } from "socket.io-client";
import axios from "axios";
import { Card, Button, Input } from "components";

const Predict = () => {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm();

  const { fields, remove, append } = useFieldArray({
    control,
    name: "models",
  });

  const socket = useRef();
  const fileInputTxtRef = useRef(null);
  const fileInputCsvRef = useRef(null);
  const [txtData, setTxtData] = useState(null);
  const [txtHeaders, setTxtHeaders] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [feature, setFeature] = useState();

  const [csvData, setCsvData] = useState(null);
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [responseState, setResponseState] = useState(null);

  useEffect(() => {
    socket.current = io("http://127.0.0.1:5000");
    socket.current.on("epoch_update", (epochs) => {
      console.log(epochs);
      //setOnlineUsers(users);
    });
    socket.current.on("training_completed", (results) => {
      console.log(results);
      const parsedData = JSON.parse(results);
      //setDownloadLink(parsedData.path);
      //setOnlineUsers(users);
    });
    /*
    return () => {
      socket.disconnect(); // Rozłączenie socket.io po zakończeniu komponentu
    };*/
  }, []);

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

  const handleOutsideClick = (event) => {
    console.log(event);
    if (selectedId && !event.target.closest(".animate-presence")) {
      setSelectedId(null);
    }
  };

  /*
  const onSubmit = (data) => {
    console.log({
      ...data,
      datset: csvData,
      y_feauture: ["close", "high"],
    }); // Wyświetlenie danych w konsoli
    socket.current.emit(
      "train/time_series",
      JSON.stringify({
        ...data,
        dataset: csvData,
        y_feauture: ["close", "high"],
      })
    );
  };
*/

  const handleCsvSubmission = async () => {
    const file = fileInputCsvRef.current.files[0];
    if (file) {
      const text = await file.text();
      const { data } = parse(text, { header: true });
      setCsvHeaders(Object.keys(data[0]));
      setCsvData(data);
    }
  };

  const handlePredict = async () => {
    try {
      console.log({ ...txtData, y_test: csvData });
      const response = await axios.post(
        "http://127.0.0.1:5000/predict/time_series",
        {
          ...txtData,
          y_test: csvData,
          next_time_steps: watch("next_time_steps"),
        }
      );
      console.log(response.data);
      setResponseState(response.data);
    } catch (error) {
      console.error("Błąd podczas wysyłania zapytania POST:", error);
    }
  };
  //console.log(csvData.map((value) => value[feature]));
  console.log(responseState?.results[selectedId - 1]);
  console.log(responseState?.results[selectedId]);
  //console.log(csvData.length);
  console.log(responseState?.split_index);

  return (
    <div
      onClick={handleOutsideClick}
      className="grid lg:grid-cols-2 grid-cols-1 gap-4 ml-4 mt-12 h-max-content"
    >
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
            func={handleCsvSubmission}
          />
        </Card>
      )}
      {csvData && (
        <Card color="grey">
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
        <Card>
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
                      x: responseState?.results[selectedId - 1].predictions.map(
                        (value, index) => responseState?.split_index + index
                        //csvData.length - responseState.split_index + index
                      ),

                      y: responseState?.results[selectedId - 1].predictions.map(
                        (value) => value
                      ),
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
              </motion.div>
            </motion.div>
          </Card>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Predict;
