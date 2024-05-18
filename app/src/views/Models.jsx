import React, { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaTimes, FaPlus } from "react-icons/fa";
import Select from "react-select";
import { parse } from "papaparse";
import { useForm, useFieldArray } from "react-hook-form";
import Plot from "react-plotly.js";
import { io } from "socket.io-client";
import { Button, Card, Input, InputFile } from "components";
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
    letterSpacing: state.isFocused ? "0em" : "0.05em",
    borderBottom:
      "2px solid " +
      (state.selectProps.color === "green"
        ? "#A1E3CB"
        : state.selectProps.color === "blue"
        ? "#95A4FC"
        : "#A8C5DA"),
    "&:hover": {
      borderBottom:
        "2px solid " +
        (state.selectProps.color === "green"
          ? "#A1E3CB"
          : state.selectProps.color === "blue"
          ? "#95A4FC"
          : "#A8C5DA"),
    },
    borderColor: state.isFocused ? "red" : "red",
    boxShadow: state.isFocused ? "none" : "none",
    className: "input",
  }),
  // indicatorContainer:()
  indicatorSeparator: (provided, state) => ({
    ...provided,
    backgroundColor: "#A1E3CB",
  }),

  dropdownIndicator: (provided, state) => ({
    ...provided,
    color: "#A1E3CB", // kolor wskaźnika rozwijania
    "&:hover": {
      cursor: "pointer",
      color: "#A1E3CB",
    },
  }),

  noOptionsMessage: (provided, state) => ({
    ...provided,
    color: "black",
    backgroundColor: "#A1E3CB",

    borderRadius: "15px",
  }),

  clearIndicator: (provided, state) => ({
    ...provided,
    color: "#A1E3CB", // kolor wskaźnika rozwijania
    "&:hover": {
      cursor: "pointer",
      color: "#A1E3CB",
    },
  }),

  multiValue: (provided, state) => ({
    ...provided,
    backgroundColor: state.isHover ? "green" : "#A1E3CB",
  }),
  /*
  multiValueRemove: (provided, state) => ({
    ...provided,
    "&:hover": {
      backgroundColor: "green",
    },
  }),
  */
  menu: (provided, state) => ({
    ...provided,
    //color: "red",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    //borderRadius: "15px",
    fontSize: "0.8em",
    border:
      "2px solid " +
      (state.selectProps.color === "green"
        ? "#A1E3CB"
        : state.selectProps.color === "blue"
        ? "#95A4FC"
        : "#A8C5DA"),
    outline: "none",
    background: "#e3f5ff",
    boxShadow: "none",
  }),
  menuList: (provided, state) => ({
    ...provided,
    border: "none",
    maxHeight: "200px", // Set a maximum height for the menu
    overflowY: "auto", // Enable vertical scrolling
    scrollbarWidth: "thin", // Set the width of the scrollbar
    scrollbarColor: "#A1E3CB transparent",
    border: "none",
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused ? "#A1E3CB" : "white",
    borderRadius: "15px",
    border:
      "1px solid " +
      (state.selectProps.color === "green"
        ? "#A1E3CB"
        : state.selectProps.color === "blue"
        ? "#95A4FC"
        : "#A8C5DA"),

    /*
    backgroundColor: state.isSelected ? "green" : "white",
    color: state.isSelected ? "white" : "black",
    "&:hover": {
      backgroundColor: "lightblue",
      color: "black",
    },
    */
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
  const [displayPlot, setDisplayPlot] = useState(null);
  const [selectedTab, setSelectedTab] = useState("loss");

  const options = YLabels.map((YLabel) => ({
    value: YLabel,
    label: YLabel,
  }));

  useEffect(() => {
    socket.current = io("http://127.0.0.1:5000", {
      transports: ["websocket"],
      upgrade: false,
      reconnection: true,
      maxHttpBufferSize: 1e8,
      maxChunkedMessageSize: 1e8,
    });
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
    console.log(file);
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
    if (
      (selectedId || displayPlot) &&
      !event.target.closest(".animate-presence")
    ) {
      if (selectedId) setSelectedId(null);
      else setDisplayPlot(null);
    }
  };

  const onSubmit = (data) => {
    console.log({
      ...data,
      datset: csvData,
      // y_feauture: ["close", "high"],
    }); // Wyświetlenie danych w konsoli
    setEpochsHistory([]);
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
      a.download = `${watch("name_file")}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  };
  console.log(watch("y_feauture")?.length === 0);
  console.log(watch("y_feauture"));

  const findExtremeIndex = (epochsHistory, index, compareFunc) => {
    return epochsHistory.reduce((extremeIndex, currentValue, currentIndex) => {
      return compareFunc(
        currentValue[index],
        epochsHistory[extremeIndex][index]
      )
        ? currentIndex
        : extremeIndex;
    }, 0);
  };

  const lowestIndex = (index) =>
    findExtremeIndex(
      epochsHistory,
      index,
      (currentValue, minValue) => currentValue < minValue
    );

  const highestIndex = (index) =>
    findExtremeIndex(
      epochsHistory,
      index,
      (currentValue, maxValue) => currentValue > maxValue
    );

  const lowestAndHighestIndex =
    epochsHistory.length > 0
      ? Object.entries(epochsHistory[0]).map(([key]) =>
          key != "epoch"
            ? {
                key: key,
                lowestIndex: lowestIndex(key),
                highestIndex: highestIndex(key),
              }
            : {
                key: key,
              }
        )
      : null;

  const [fileName, setFileName] = useState("Choose a file…");

  const handleFileInputChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const maxLength = 20;
      const truncatedName =
        file.name.length > maxLength
          ? file.name.substring(0, maxLength) + "..."
          : file.name;

      setFileName(truncatedName);
      console.log(file.name);
    } else {
      setFileName("Choose a file…");
    }
  };

  const handleCustomBtnClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div onClick={handleOutsideClick}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="sm:w-[83vw] grid lg:grid-cols-2 grid-cols-1 gap-4 ml-4 mt-12 h-max-content"
      >
        <div>
          <Card
            color="green"
            classStyle="min-h-[150px]"
            classStyleDiv="flex flex-col justify-center items-center w-full gap-4"
          >
            <InputFile
              ref={fileInputRef}
              fileAcept=".csv"
              multiple={false}
              color="green"
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
              <div className="relative w-[300px]">
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
                ({ type, name, label, color }, index) => (
                  <div className={`relative w-[300px] mt-8`}>
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
                        <option value="ConvLSTM2D">ConvLSTM2D</option>
                        <option value="Dense">Dense</option>
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
                          Sequences
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
                    <div className="relative flex flex-col ml-4">
                      <label
                        className={"font-semibold uppercase text-[#1c1c1c]"}
                        htmlFor={`models[${index}].layers`}
                      >
                        <span
                          className={`-translate-y-[15px] relative inline-flex tracking-[0.15em] transition-[0.2s] ease-in-out`}
                        >
                          Bidirectional
                        </span>
                      </label>
                      <input
                        type="checkbox"
                        id="bidirectional"
                        name="bidirectional"
                        {...register(`models[${index}].bidirectional`)}
                        defaultChecked={false}
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
      <div className="grid lg:grid-cols-2 grid-cols-1 gap-4 ml-4 mt-4 h-max-content">
        {epochsHistory.length != 0 && (
          <Card color="grey" classStyle="w-full col-span-2">
            <div className="flex overflow-auto gap-2">
              <div>
                {Object.entries(epochsHistory[0]).map(([key, value]) => (
                  <div>
                    <div className="flex w-[150px] flex-nowrap justify-center items-center border-[2px] border-[#A8C5DA] mb-1 p-1 rounded-[16px]">
                      {key.charAt(0).toUpperCase() +
                        key.slice(1).replace(/_/g, " ")}
                    </div>
                  </div>
                ))}
              </div>
              {epochsHistory.length > 0 &&
                epochsHistory.map((props, index) => (
                  <div key={index}>
                    {Object.entries(props).map(([key, value]) =>
                      key === "epoch" ? (
                        <div
                          key={`${key}-${index}`}
                          className="flex justify-center items-center border-[2px] border-[#A8C5DA] mb-1 p-1 rounded-[16px]"
                        >
                          {props.epoch + 1}
                        </div>
                      ) : (
                        <div
                          key={`${key}-${index}`}
                          className={`flex justify-center items-center border-[2px] border-[#A8C5DA] mb-1 p-1 rounded-[16px] ${
                            index ===
                            lowestAndHighestIndex.find(
                              (metrics) => key === metrics.key
                            )?.lowestIndex
                              ? key.includes("loss")
                                ? "bg-green-200"
                                : "bg-red-200"
                              : index ===
                                lowestAndHighestIndex.find(
                                  (metrics) => key === metrics.key
                                )?.highestIndex
                              ? key.includes("loss")
                                ? "bg-red-200"
                                : "bg-green-200"
                              : ""
                          }`}
                        >
                          {value.toFixed(5)}
                        </div>
                      )
                    )}
                  </div>
                ))}
            </div>
            {downloadLink && (
              <div className="w-full flex justify-center items-center gap-6">
                <div className="relative w-[300px] mt-[20px]">
                  <Input
                    type="text"
                    name="name_file"
                    label="Name File"
                    color="grey"
                    register={register}
                  />
                </div>
                <motion.div
                  layoutId={1}
                  onClick={() => setDisplayPlot(1)}
                  className="border-[2px] border-[#A8C5DA] w-[150px] h-[45px] rounded-[16px] flex justify-center items-center cursor-pointer"
                >
                  Display Plot
                </motion.div>
                <Button
                  type="button"
                  color="grey"
                  text="Download"
                  func={handleDownload}
                />
              </div>
            )}
          </Card>
        )}
      </div>
      <AnimatePresence onClick={(event) => event.stopPropagation()}>
        {displayPlot && (
          <Card layoutId={displayPlot} setSelectedId={setDisplayPlot}>
            <div className="flex mb-8 gap-4 justify-center">
              {epochsHistory.length > 0 &&
                Object.entries(epochsHistory[0]).map(
                  ([key, value], index) =>
                    key !== "epoch" &&
                    !key.includes("val") && (
                      <div key={index} onClick={() => setSelectedTab(key)}>
                        <div
                          className={`${
                            key === selectedTab ? "relative" : ""
                          } border-[#95A4FC] border-[2px] w-[150px] h-[50px] rounded-[16px] flex justify-center items-center cursor-pointer`}
                        >
                          {key.charAt(0).toUpperCase() +
                            key.slice(1).replace(/_/g, " ")}
                          {key === selectedTab ? (
                            <motion.div
                              className="before:content-[''] before:absolute before:w-[10px] before:h-[6px] before:bottom-0 before:bg-[white] before:border-[2px] before:top-[-3.5px] before:left-[50%] before:translate-x-[-50%] before:border-[#95A4FC] before:translate-x-[-50%] box-shadow-blue
                          after:content-[''] after:absolute after:w-[10px] after:h-[6px] after:bottom-0 after:bg-[white] after:border-[2px] after:bottom-[-4px] after:left-[50%] after:translate-x-[-50%] after:border-[#95A4FC] after:translate-x-[-50%]"
                              layoutId={selectedTab}
                            />
                          ) : null}
                        </div>
                      </div>
                    )
                )}
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedTab ? selectedTab : "empty"}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="bg-[white] border-[2px] border-[#95A4FC] rounded-[16px] flex justify-center items-center p-2">
                  <Plot
                    data={[
                      {
                        x: epochsHistory.map(
                          (epochHistory) => epochHistory.epoch + 1
                        ),
                        y: epochsHistory.map(
                          (epochHistory) => epochHistory[selectedTab]
                        ),
                        type: "scatter",
                        mode: "lines",
                        name: "training",
                        // marker: { color: "#82ca9d" },
                      },
                      epochsHistory[0][`val_${selectedTab}`] !== undefined && {
                        x: epochsHistory.map(
                          (epochHistory) => epochHistory.epoch + 1
                        ),
                        y: epochsHistory.map(
                          (epochHistory) => epochHistory[`val_${selectedTab}`]
                        ),
                        type: "scatter",
                        mode: "lines",
                        name: "val",
                        //  marker: { color: "#82ca9d" },
                      },
                    ].filter(Boolean)}
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
                </div>
              </motion.div>
            </AnimatePresence>
          </Card>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Models;
