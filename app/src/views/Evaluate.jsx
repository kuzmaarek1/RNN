import React, { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { parse } from "papaparse";
import { useForm, useFieldArray } from "react-hook-form";
import Plot from "react-plotly.js";
import { io } from "socket.io-client";
import axios from "axios";
import { Button, Input, Card } from "components";

const Evaluate = () => {
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
    if (
      (selectedId || selectedId === 0) &&
      !event.target.closest(".animate-presence")
    ) {
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

  const handleCsvSubmissionAndEvaluate = async () => {
    const file = fileInputCsvRef.current.files[0];
    if (file) {
      const text = await file.text();
      const { data } = parse(text, { header: true });
      setCsvHeaders(Object.keys(data[0]));
      setCsvData(data);
      try {
        console.log({ ...txtData, y_test: data });
        const response = await axios.post(
          "http://127.0.0.1:5000/evaluate/time_series",
          { ...txtData, y_test: data }
        );
        console.log(response.data);
        setResponseState(response.data);
      } catch (error) {
        console.error("Błąd podczas wysyłania zapytania POST:", error);
      }
    }
  };

  console.log(responseState);

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
          <div>
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
          </div>
        </Card>
      )}
      {responseState && (
        <Card>
          <div className="flex gap-[5px] flex-wrap">
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
          <Card layoutId={selectedId} setSelectedId={setSelectedId}>
            <motion.div>
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
                    x: responseState?.results[selectedId - 1]?.predictions?.map(
                      (value, index) => index
                    ),
                    y: responseState?.results[selectedId - 1]?.predictions?.map(
                      (value, index) => value
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
              <div className="w-full flex justify-center items-center font-semibold uppercase mb-4">
                Metrics errors {responseState?.results[selectedId - 1].feature}
              </div>
              {Object.entries(responseState?.results[selectedId - 1]).map(
                ([key, value]) =>
                  key !== "predictions" &&
                  key !== "feature" &&
                  key !== "y_test" && (
                    <div className="flex overflow-auto gap-2" key={key}>
                      <div className="flex w-[300px] p-2 justify-center items-center border-[2px] border-[#A8C5DA] mb-1 p-1 rounded-[16px]">
                        {key
                          .replace(/error/gi, "")
                          .replace(/_/g, " ")
                          .toUpperCase()}
                      </div>
                      <div className="flex w-[50%] p-2 justify-center items-center border-[2px] border-[#A8C5DA] mb-1 p-1 rounded-[16px]">
                        {value.toFixed(3)}
                      </div>
                    </div>
                  )
              )}
            </motion.div>
          </Card>
        )}
      </AnimatePresence>
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

export default Evaluate;
