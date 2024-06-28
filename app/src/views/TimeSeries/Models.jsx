import React, { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaTimes, FaPlus } from "react-icons/fa";
import { parse } from "papaparse";
import { useForm, useFieldArray } from "react-hook-form";
import Plot from "react-plotly.js";
import { io } from "socket.io-client";
import { Button, Card, Input, InputFile, SelectInput } from "components";
import { inputFieldModelsTimeSeries } from "constants";

const Models = () => {
  const { register, handleSubmit, control, watch, setValue } = useForm();

  const { fields, remove, append } = useFieldArray({
    control,
    name: "models",
  });

  const socket = useRef();
  const fileInputRef = useRef(null);
  const [csvData, setCsvData] = useState(null);
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [YLabels, setYLabels] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [downloadLink, setDownloadLink] = useState(null);
  const [epochsHistory, setEpochsHistory] = useState([]);
  const [displayPlot, setDisplayPlot] = useState(null);
  const [selectedTab, setSelectedTab] = useState("loss");

  useEffect(() => {
    socket.current = io("http://127.0.0.1:5000", {
      transports: ["websocket"],
      upgrade: false,
      reconnection: true,
      maxHttpBufferSize: 1e8,
      maxChunkedMessageSize: 1e8,
    });
    socket.current.on("epoch_update", (epochs) => {
      setEpochsHistory((prev) => [...prev, JSON.parse(epochs)]);
    });
    socket.current.on("training_completed", (results) => {
      const parsedData = JSON.parse(results);
      setDownloadLink(parsedData);
    });
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
  const handleXLabel = () => {
    const selectedXLabel = watch("XLabel");
    const YLabels = csvHeaders.filter(
      (csvHeader) => csvHeader !== selectedXLabel
    );
    setYLabels(YLabels);
  };

  const handleOutsideClick = (event) => {
    if (
      (selectedId || displayPlot) &&
      !event.target.closest(".animate-presence")
    ) {
      if (selectedId) setSelectedId(null);
      else setDisplayPlot(null);
    }
  };

  const onSubmit = (data) => {
    setEpochsHistory([]);
    socket.current.emit(
      "train/time_series",
      JSON.stringify({
        ...data,
        dataset: csvData,
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

  const variants = {
    hidden: { y: 20, opacity: 0, scale: 0.8 },
    visible: { y: 0, opacity: 1, scale: 1 },
    exit: { y: -20, opacity: 0, scale: 0.8 },
  };

  const transition = {
    duration: 0.2,
    ease: [0.42, 0, 0.58, 1],
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
            <Card
              color="blue"
              classStyle="min-h-[150px]"
              classStyleDiv="flex flex-col justify-center items-center w-full gap-4"
            >
              <SelectInput
                options={csvHeaders}
                label="X Label"
                name="XLabel"
                isMulti={false}
                color="blue"
                setValue={setValue}
                watch={watch("XLabel")}
              />
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
              <div className="flex justify-center items-center gap-[5px] flex-wrap">
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
              <div className="bg-[white] border-[2px] border-[#95A4FC] rounded-[16px] flex justify-center items-center p-2">
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
                      text: `Feauture - ${selectedId}`,
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
            </Card>
          )}
        </AnimatePresence>
        {YLabels.length > 0 && (
          <>
            <Card color="green">
              <SelectInput
                options={YLabels}
                label="y feauture"
                name="y_feauture"
                isMulti={true}
                color="green"
                setValue={setValue}
                watch={watch("y_feauture")}
              />
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
            <Card
              classStyle="min-h-[150px]"
              classStyleDiv="flex flex-col justify-center items-center w-full gap-4"
            >
              <div className="flex justify-center items-center flex-wrap w-full h-full">
                <AnimatePresence>
                  {fields.map(({ id }, index) => (
                    <motion.div
                      variants={variants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      transition={transition}
                      key={id}
                      className="flex flex-row mb-12"
                    >
                      <div className="relative">
                        <SelectInput
                          options={[
                            "RNN",
                            "LSTM",
                            "GRU",
                            "ConvLSTM2D",
                            "Dense",
                          ]}
                          label="Layers"
                          name={`models[${index}].layers`}
                          isMulti={false}
                          color="grey"
                          setValue={setValue}
                          watch={watch(`models[${index}].layers`)}
                          styled={"w-[140px] mt-[-2px] mr-[8px]"}
                        />
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
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div className="flex flex-row gap-4">
                  <Button
                    type="button"
                    text={
                      <div className="text-[#95A4FC]">
                        <FaPlus />
                      </div>
                    }
                    func={() => append({})}
                    color="blue"
                    classStyle="h-[45px]"
                  />
                  <Button text="Submit" color="blue" type="submit" />
                </div>
              </div>
            </Card>
          </>
        )}
      </form>
      <div className="sm:w-[83vw] mb-12 grid lg:grid-cols-2 grid-cols-1 gap-4 ml-4 mt-4 h-max-content">
        <div className="lg:col-span-2">
          {epochsHistory.length != 0 && (
            <Card
              color="grey"
              classStyle="min-h-[150px]"
              classStyleDiv="flex flex-col justify-center items-center w-full gap-4"
            >
              <div className="custom-scrollbar-gray w-[90%] flex overflow-auto gap-2">
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
      </div>
      <AnimatePresence onClick={(event) => event.stopPropagation()}>
        {displayPlot && (
          <Card layoutId={displayPlot} setSelectedId={setDisplayPlot}>
            <div className="flex mb-8 gap-4 justify-center">
              {epochsHistory.length > 0 &&
                Object.entries(epochsHistory[0]).map(
                  ([key, _], index) =>
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
                <div className="bg-[white] pt-12 border-[2px] border-[#95A4FC] rounded-[16px] flex justify-center items-center p-2">
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
                      },
                    ].filter(Boolean)}
                    layout={{
                      width: "5vw",
                      height: "500px",
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
