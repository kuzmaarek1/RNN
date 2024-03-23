import React, { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { parse } from "papaparse";
import { useForm, useFieldArray } from "react-hook-form";
import Plot from "react-plotly.js";
import { io } from "socket.io-client";

const Models = () => {
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
  const fileInputRef = useRef(null);
  const selectXLabelRef = useRef(null);
  const [csvData, setCsvData] = useState(null);
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [XLabel, setXLabel] = useState(); //sort
  const [YLabels, setYLabels] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [downloadLink, setDownloadLink] = useState(null);

  useEffect(() => {
    socket.current = io("http://127.0.0.1:5000");
    socket.current.on("epoch_update", (epochs) => {
      console.log(epochs);
      //setOnlineUsers(users);
    });
    socket.current.on("training_completed", (results) => {
      console.log(results);
      const parsedData = JSON.parse(results);
      setDownloadLink(parsedData.path);
      //setOnlineUsers(users);
    });
    /*
    return () => {
      socket.disconnect(); // Rozłączenie socket.io po zakończeniu komponentu
    };*/
  }, []);

  const chartData = csvData?.map((row, index) => {
    const value = parseFloat(row[selectedId]);
    return {
      label: index,
      value: value,
    };
  });

  const handleCsvSubmission = async () => {
    const file = fileInputRef.current.files[0];
    if (file) {
      const text = await file.text();
      const { data } = parse(text, { header: true });
      setCsvHeaders(Object.keys(data[0]));
      setCsvData(data);
    }
  };
  console.log(csvData);
  const handleXLabel = () => {
    const selectedXLabel = selectXLabelRef.current.value;
    const YLabels = csvHeaders.filter(
      (csvHeader) => csvHeader !== selectedXLabel
    );
    setXLabel(selectedXLabel);
    setYLabels(YLabels);
  };
  const handleOutsideClick = (event) => {
    console.log(event);
    if (selectedId && !event.target.closest(".animate-presence")) {
      setSelectedId(null);
    }
  };

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

  const handleDownload = () => {
    if (downloadLink) {
      window.location.href = `http://127.0.0.1:5000/download/${downloadLink}`;
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
            ref={fileInputRef}
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
      {csvHeaders.length > 0 && (
        <div className="bg-[#e5ecf6] h-[50px] rounded-[16px] custom-box-shadow">
          <label htmlFor="XLabel">X labels</label>
          <select name="XLabel" id="XLabel" ref={selectXLabelRef}>
            {csvHeaders.map((csvHeader) => (
              <option value={csvHeader} key={csvHeader}>
                {csvHeader}
              </option>
            ))}
          </select>
          <button onClick={handleXLabel}>Submit XLabel</button>
        </div>
      )}
      <div className="w-[100%] bg-[green] flex flex-row flex-wrap">
        {YLabels.length > 0 &&
          YLabels.map((YLabel, index) => (
            <motion.div
              key={YLabel}
              layoutId={YLabel}
              onClick={() => setSelectedId(YLabel)}
              className="bg-[#f7f9fb] h-[50px] rounded-[16px]  w-[20%]"
            >
              <motion.div>{YLabel}</motion.div>
            </motion.div>
          ))}
      </div>
      <AnimatePresence onClick={(event) => event.stopPropagation()}>
        {selectedId && (
          <motion.div className="animate-presence" layoutId={selectedId}>
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
            <motion.button onClick={() => setSelectedId(null)}>
              Close
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
      <form onSubmit={handleSubmit(onSubmit)}>
        {fields.map(({ id }, index) => (
          <div key={id}>
            <label htmlFor="layers">Layers</label>
            <select
              id="layers"
              name="layers"
              {...register(`models[${index}].layers`)}
              defaultValue="RNN"
            >
              <option value="RNN">RNN</option>
              <option value="LSTM">LSTM</option>
              <option value="GRU">GRU</option>
            </select>
            <label htmlFor="units">Units</label>
            <input
              type="number"
              id="units"
              name="units"
              {...register(`models[${index}].units`)}
            />
            <label htmlFor="returnSequences">Return_sequences</label>
            <input
              type="checkbox"
              id="returnSequences"
              name="returnSequences"
              {...register(`models[${index}].returnSequences`)}
              defaultChecked={true}
            />
            <button type="button" onClick={() => remove(index)}>
              Remove
            </button>
          </div>
        ))}
        <button type="button" onClick={() => append({})}>
          Add model
        </button>
        <input type="submit" />
      </form>
      {downloadLink && (
        <div>
          <button onClick={handleDownload}>Download Results</button>
        </div>
      )}
    </div>
  );
};

export default Models;
