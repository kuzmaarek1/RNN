import React, { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { parse } from "papaparse";
import { useForm, useFieldArray } from "react-hook-form";
import Plot from "react-plotly.js";
import { io } from "socket.io-client";
import axios from "axios";

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
  console.log(csvData);

  const handleEvaluate = async () => {
    try {
      console.log({ ...txtData, y_test: csvData });
      const response = await axios.post(
        "http://127.0.0.1:5000/evaluate/time_series",
        { ...txtData, y_test: csvData }
      );
      console.log(response.data);
      setResponseState(response.data);
    } catch (error) {
      console.error("Błąd podczas wysyłania zapytania POST:", error);
    }
  };
  return (
    <div onClick={handleOutsideClick} className="flex gap-[12px]">
      <div>
        <div className="text-[#1c1c1c] font-[14px] font-[600]">Select file</div>
        <div className="bg-[#e3f5ff]  rounded-[16px] custom-box-shadow p-8">
          <input
            type="file"
            className="mb-4"
            ref={fileInputTxtRef}
            accept=".txt"
          />
          <button
            className="relative uppercase spacing tracking-widest font-[400] text-base py-[10px] duration-500 w-[150px] rounded-[16px] border-[2px] border-[#A1E3CB] text-[#1c1c1c] group
            hover:bg-[#A1E3CB] hover:tracking-[0.25em] before:content-[''] before:absolute before:inset-[2px]"
            onClick={handleTxtSubmission}
          >
            <span className="relative z-10 flex justify-center">Submit</span>
            <i
              className="box-shadow-button group-hover:before:w-[8px] group-hover:before:left-[calc(50%)]  group-hover:before:delay-[0.5s]
              before:content-[''] before:absolute  before:w-[10px] before:h-[6px] before:bg-[white] before:border-[2px] before:border-[#A1E3CB] before:top-[-3.5px] before:left-[80%] before:translate-x-[-50%] before:duration-500 before:delay-[0.5s]
              group-hover:after:w-[8px]  group-hover:after:left-[calc(50%)]  group-hover:after:delay-[0.5s]
              after:content-[''] after:absolute after:w-[10px] after:h-[6px] after:bg-[white] after:border-[2px] after:border-[#A1E3CB] after:bottom-[-3.5px] after:left-[20%] after:translate-x-[-50%] after:duration-500 after:delay-[0.5s]"
            ></i>
          </button>
        </div>
      </div>
      {txtData && (
        <div>
          <div className="text-[#1c1c1c] font-[14px] font-[600]">
            Select file
          </div>
          <div className="bg-[#e3f5ff]  rounded-[16px] custom-box-shadow p-8">
            <input
              type="file"
              className="mb-4"
              ref={fileInputCsvRef}
              accept=".csv"
            />
            <button
              className="relative uppercase spacing tracking-widest font-[400] text-base py-[10px] duration-500 w-[150px] rounded-[16px] border-[2px] border-[#A1E3CB] text-[#1c1c1c] group
            hover:bg-[#A1E3CB] hover:tracking-[0.25em] before:content-[''] before:absolute before:inset-[2px]"
              onClick={handleCsvSubmission}
            >
              <span className="relative z-10 flex justify-center">Submit</span>
              <i
                className="box-shadow-button group-hover:before:w-[8px] group-hover:before:left-[calc(50%)]  group-hover:before:delay-[0.5s]
              before:content-[''] before:absolute  before:w-[10px] before:h-[6px] before:bg-[white] before:border-[2px] before:border-[#A1E3CB] before:top-[-3.5px] before:left-[80%] before:translate-x-[-50%] before:duration-500 before:delay-[0.5s]
              group-hover:after:w-[8px]  group-hover:after:left-[calc(50%)]  group-hover:after:delay-[0.5s]
              after:content-[''] after:absolute after:w-[10px] after:h-[6px] after:bg-[white] after:border-[2px] after:border-[#A1E3CB] after:bottom-[-3.5px] after:left-[20%] after:translate-x-[-50%] after:duration-500 after:delay-[0.5s]"
              ></i>
            </button>
          </div>
        </div>
      )}
      {txtData && <button onClick={handleEvaluate}>Submit</button>}
      {responseState &&
        responseState?.results.map((state, index) => (
          <div key={state.feature} onClick={() => setSelectedId(index)}>
            {state.feature}
          </div>
        ))}
      {selectedId !== null && (
        <motion.div className="animate-presence" layoutId={selectedId}>
          {Object.entries(responseState?.results[selectedId]).map(
            ([key, value]) =>
              key !== "predictions" &&
              key !== "feature" &&
              key !== "y_test" && (
                <div key={key}>
                  {key}: {value}
                </div>
              )
          )}
          <motion.button onClick={() => setSelectedId(null)}>
            Close
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};

export default Evaluate;
