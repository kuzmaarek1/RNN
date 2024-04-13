import React, { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Select from "react-select";
import { parse } from "papaparse";
import { useForm, useFieldArray } from "react-hook-form";
import Plot from "react-plotly.js";
import { io } from "socket.io-client";
import { Button, Card } from "components";

const Models = () => {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm();

  const { fields, remove, append } = useFieldArray({
    control,
    name: "models",
  });

  const [selectedOptions, setSelectedOptions] = useState([]);

  const handleChange = (selectedOptions) => {
    setSelectedOptions(selectedOptions);
  };

  const socket = useRef();
  const fileInputRef = useRef(null);
  const selectXLabelRef = useRef(null);
  const [csvData, setCsvData] = useState(null);
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [XLabel, setXLabel] = useState(); //sort
  const [YLabels, setYLabels] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [downloadLink, setDownloadLink] = useState(null);
  const [epochsHistory, setEpochsHistory] = useState([]);

  const options = YLabels.map((YLabel) => ({
    value: YLabel,
    label: YLabel,
  }));

  useEffect(() => {
    socket.current = io("http://127.0.0.1:5000");
    socket.current.on("epoch_update", (epochs) => {
      console.log(epochs);
      setEpochsHistory((prev) => [...prev, JSON.parse(epochs)]);
      //setOnlineUsers(users);
    });
    socket.current.on("training_completed", (results) => {
      console.log(results);
      const parsedData = JSON.parse(results);
      setDownloadLink(parsedData);
      //setOnlineUsers(users);
    });
    /*
    return () => {
      socket.disconnect(); // Rozłączenie socket.io po zakończeniu komponentu
    };*/
  }, []);

  console.log(epochsHistory);
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
      // y_feauture: ["close", "high"],
    }); // Wyświetlenie danych w konsoli
    socket.current.emit(
      "train/time_series",
      JSON.stringify({
        ...data,
        dataset: csvData,
        //y_feauture: ["close", "high"],
      })
    );
  };

  const handleDownload = () => {
    if (downloadLink) {
      const dataToDownload = JSON.stringify(downloadLink);
      const blob = new Blob([dataToDownload], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "models.txt";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  };

  return (
    <div onClick={handleOutsideClick} className="flex gap-[12px]">
      <div>
        <div className="text-[#1c1c1c] font-[14px] font-[600]">Select file</div>
        <Card>
          <input
            type="file"
            className="mb-4"
            ref={fileInputRef}
            accept=".csv"
          />
          <Button text="Submit" func={handleCsvSubmission} />
        </Card>
      </div>
      {csvHeaders.length > 0 && (
        <div>
          <Card color="blue">
            <label htmlFor="XLabel">X labels</label>
            <select name="XLabel" id="XLabel" ref={selectXLabelRef}>
              {csvHeaders.map((csvHeader) => (
                <option value={csvHeader} key={csvHeader}>
                  {csvHeader}
                </option>
              ))}
            </select>
            <Button text="Submit" color="blue" func={handleXLabel} />
          </Card>
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
        <label htmlFor="y_feauture">Y Feauture</label>
        <Select
          id="y_feauture"
          name="y_feauture"
          options={options}
          value={selectedOptions}
          onChange={handleChange}
          isMulti
          onChange={(selectedOptions) => {
            handleChange(selectedOptions);
            const selectedValues = selectedOptions.map(
              (option) => option.value
            );
            setValue("y_feauture", selectedValues);
          }}
        />
        <div className="relative w-[300px] mb-[40px]">
          <input
            type="number"
            id="time_step"
            name="time_step"
            className="relative w-full p-[10px_0px] bg-[transparent] border-[none] border-b-[2px] border-b-[black] outline-none text-[black] text-[1em] uppercase tracking-[0.05em]
            focus:border-b-[2px] focus:border-b-[green]
            valid:border-b-[2px] valid:border-b-[green]
            input"
            {...register(`time_step`)}
            required
          />
          <label
            htmlFor="time_step"
            className="absolute left-0 p-[10px_0px] pointer-events-none text-[black] uppercase"
          >
            {`Time Step`.split("").map((letter, i) => (
              <span
                className={`relative inline-flex tracking-[0.05em] transition-[0.2s] ease-in-out
               `}
                style={{ transitionDelay: `${i * 0.1}s` }}
              >
                {letter === " " ? "\u00A0" : letter}
              </span>
            ))}
          </label>
        </div>
        <label htmlFor="batch_size">Batch size</label>
        <input
          type="number"
          id="batch_size"
          name="batch_size"
          {...register(`batch_size`)}
        />
        <label htmlFor="epochs">Epochs</label>
        <input
          type="number"
          id="epochs"
          name="epochs"
          {...register(`epochs`)}
        />
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
      {epochsHistory.length != 0 &&
        epochsHistory.map((props, index) => (
          <div key={index}>
            <div>{props.epoch}</div>
            <div>{props.loss}</div>
          </div>
        ))}
      {downloadLink && (
        <Plot
          data={[
            {
              x: epochsHistory.map((epochHistory) => epochHistory.epoch),
              y: epochsHistory.map((epochHistory) => epochHistory.loss),
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
      )}
      {downloadLink && (
        <div>
          <button onClick={handleDownload}>Download Results</button>
        </div>
      )}
    </div>
  );
};

export default Models;
