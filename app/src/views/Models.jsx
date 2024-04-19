import React, { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaTimes, FaPlus } from "react-icons/fa";
import Select from "react-select";
import { parse } from "papaparse";
import { useForm, useFieldArray } from "react-hook-form";
import Plot from "react-plotly.js";
import { io } from "socket.io-client";
import { Button, Card, Input } from "components";
import { inputFieldModelsTimeSeries } from "constants";

const customStyles = {
  control: (provided, state) => ({
    ...provided,
    position: "relative",
    width: "100%",
    padding: "10px 0px",
    background: "transparent",
    border: "none",
    outline: "none",
    borderRadius: "0px",
    color: "black",
    textTransform: "uppercase",
    fontSize: "1em",
    letterSpacing: "0.05em",
    borderBottom:
      (!state.isFocused || state.isFocused) &&
      "2px solid " +
        (state.selectProps.color === "green"
          ? "#A1E3CB"
          : state.selectProps.color === "blue"
          ? "#95A4FC"
          : "#A8C5DA"),
    boxShadow: state.isFocused ? "none" : "none",
    className: "input",
  }),
};

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
  console.log(watch("y_feauture")?.length === 0);
  console.log(watch("y_feauture"));
  return (
    <div onClick={handleOutsideClick}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid lg:grid-cols-2 grid-cols-1 gap-4 ml-4 mt-12 h-max-content"
      >
        <div>
          <Card color="green" classStyle="min-h-[150px]">
            <div className="text-[#1c1c1c] font-[14px] font-[600]">
              Select file
            </div>
            <input
              type="file"
              className="mb-4"
              ref={fileInputRef}
              accept=".csv"
            />
            <Button
              color="green"
              text="Submit"
              type="button"
              func={handleCsvSubmission}
            />
          </Card>
        </div>
        {csvHeaders.length > 0 && (
          <div>
            <Card color="blue" classStyle="min-h-[150px]">
              <label htmlFor="XLabel">X labels</label>
              <select name="XLabel" id="XLabel" ref={selectXLabelRef}>
                {csvHeaders.map((csvHeader) => (
                  <option value={csvHeader} key={csvHeader}>
                    {csvHeader}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                text="Submit"
                color="blue"
                func={handleXLabel}
              />
            </Card>
          </div>
        )}
        {YLabels.length > 0 && (
          <div className="lg:col-span-2">
            <Card>
              <div className="flex gap-[5px] flex-wrap">
                {YLabels.map((YLabel, index) => (
                  <motion.div
                    key={YLabel}
                    layoutId={YLabel}
                    onClick={() => setSelectedId(YLabel)}
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
                    <motion.div>{YLabel}</motion.div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </div>
        )}
        <AnimatePresence onClick={(event) => event.stopPropagation()}>
          {selectedId && (
            <Card layoutId={selectedId} setSelectedId={setSelectedId}>
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
            </Card>
          )}
        </AnimatePresence>
        {YLabels.length > 0 && (
          <>
            <Card color="green">
              <div className="relative w-[300px] mt-[20px]">
                <label
                  className={`${
                    watch("y_feauture")?.length === 0 ||
                    watch("y_feauture") === undefined
                      ? "absolute left-0 p-[20px_0px] pointer-events-none text-[black] uppercase"
                      : "font-semibold uppercase"
                  }`}
                  htmlFor="y_feauture"
                >
                  {"Y feature".split("").map((letter, i) => (
                    <span
                      className={`relative inline-flex tracking-[0.05em] transition-[0.2s] ease-in-out
               `}
                      style={{ transitionDelay: `${i * 0.1}s` }}
                    >
                      {letter === " " ? "\u00A0" : letter}
                    </span>
                  ))}
                </label>
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
                  styles={customStyles}
                  color="green"
                  placeholder={null}
                />
              </div>
              {inputFieldModelsTimeSeries.map(
                ({ type, name, label, color }) => (
                  <div className="relative w-[300px] mt-[40px]">
                    <Input
                      type={type}
                      name={name}
                      label={label}
                      color={color}
                      register={register}
                    />
                  </div>
                )
              )}
            </Card>
            <Card>
              <div className="flex justify-center items-center flex-wrap w-full h-full">
                {fields.map(({ id }, index) => (
                  <div key={id} className="flex flex-row mb-12">
                    <div className="relative flex flex-col mr-4">
                      <label
                        className={"font-semibold uppercase text-[#1c1c1c]"}
                        htmlFor={`models[${index}].layers`}
                      >
                        <span
                          className={`-translate-y-[15px] relative inline-flex tracking-[0.15em] transition-[0.2s] ease-in-out`}
                        >
                          Layers
                        </span>
                      </label>
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
                    </div>
                    <div className="relative">
                      <Input
                        type="number"
                        name={`models[${index}].units`}
                        label="Units"
                        color="grey"
                        register={register}
                      />
                    </div>
                    <div className="relative flex flex-col ml-4">
                      <label
                        className={"font-semibold uppercase text-[#1c1c1c]"}
                        htmlFor={`models[${index}].layers`}
                      >
                        <span
                          className={`-translate-y-[15px] relative inline-flex tracking-[0.15em] transition-[0.2s] ease-in-out`}
                        >
                          Return sequences
                        </span>
                      </label>
                      <input
                        type="checkbox"
                        id="returnSequences"
                        name="returnSequences"
                        {...register(`models[${index}].returnSequences`)}
                        defaultChecked={true}
                      />
                    </div>
                    <button
                      className="text-[#95A4FC]"
                      type="button"
                      onClick={() => remove(index)}
                    >
                      <FaTimes />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  className="text-[#95A4FC]"
                  onClick={() => append({})}
                >
                  <FaPlus />
                </button>
                <Button text="Submit" color="blue" type="submit" />
              </div>
            </Card>
          </>
        )}
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
