import React, { useRef, useState, useEffect } from "react";
import { FaTimes, FaPlus } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import { parse } from "papaparse";
import { useForm, useFieldArray } from "react-hook-form";
import { io } from "socket.io-client";
import Plot from "react-plotly.js";
import { Card, Input, Button } from "components";
import { inputFieldModelsText } from "constants";

const ModelsText = () => {
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

  const socket = useRef();
  const fileInputRef = useRef(null);
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [csvData, setCsvData] = useState(null);
  const selectCategoryRef = useRef(null);
  const [category, setCategory] = useState();
  const [text, setText] = useState();
  const [epochsHistory, setEpochsHistory] = useState([]);
  const [downloadLink, setDownloadLink] = useState(null);
  const [numberSlider, setNumberSlider] = useState(0);
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

    socket.current.on("epoch_update/text_classification", (epochs) => {
      console.log(epochs);
      setEpochsHistory((prev) => [...prev, JSON.parse(epochs)]);
    });
    socket.current.on("training_completed/text_classification", (results) => {
      console.log(results);
      const parsedData = JSON.parse(results);
      setDownloadLink(parsedData);
    });
  }, []);

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

  const handleCsvSubmission = async () => {
    const file = fileInputRef.current.files[0];
    if (file) {
      const text = await file.text();
      const { data } = parse(text, { header: true });
      setCsvHeaders(Object.keys(data[0]));
      setCsvData(data);
    }
  };

  const handleCategory = () => {
    const selectedCategoryLabel = selectCategoryRef.current.value;
    const selectedText = csvHeaders.find(
      (csvHeader) => csvHeader !== selectedCategoryLabel
    );
    setCategory(selectedCategoryLabel);
    setText(selectedText);
  };

  console.log(category);
  console.log(text);
  console.log(csvData);
  console.log(csvHeaders);

  const onSubmit = (data) => {
    console.log("dd");
    console.log({
      ...data,
      category: category,
      text: text,
      datset: csvData.slice(0, 2),
    });
    setEpochsHistory([]);
    socket.current.emit(
      "train/text_classification",
      JSON.stringify({
        ...data,
        category: category,
        text: text,
        dataset: csvData, //.slice(0, 400),
      })
    );
  };

  console.log(epochsHistory);

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
  console.log(csvData);
  console.log(numberSlider);
  console.log(category);
  console.log();

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

  const handleOutsideClick = (event) => {
    console.log(event);
    if (displayPlot && !event.target.closest(".animate-presence")) {
      setDisplayPlot(null);
    }
  };
  console.log(lowestAndHighestIndex);

  // {epochsHistory.length > 0 &&  epochsHistory.find((props, index) => ())}
  return (
    <div onClick={handleOutsideClick}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid lg:grid-cols-2 grid-cols-1 gap-4 ml-4 mt-12 h-max-content"
      >
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
        {csvHeaders.length > 0 && (
          <Card color="blue" classStyle="min-h-[150px]">
            <label htmlFor="Category">Category Label</label>
            <select name="Category" id="Category" ref={selectCategoryRef}>
              {csvHeaders.map((csvHeader) => (
                <option value={csvHeader} key={csvHeader}>
                  {csvHeader}
                </option>
              ))}
            </select>
            <Button
              color="blue"
              text="Submit"
              type="button"
              func={handleCategory}
            />
          </Card>
        )}
        {csvHeaders.length > 0 && (
          <Card classStyle={`min-h-[200px]`}>
            <div className="relative">
              <Input
                type="number"
                name="numberSlider"
                label="Number"
                register={register}
                onChange={(value) => {
                  console.log(value);
                  isNaN(value) || csvData.length - 1 < value
                    ? setNumberSlider(null)
                    : value === ""
                    ? setNumberSlider(Number(0))
                    : setNumberSlider(Number(value));
                }}
                value={numberSlider == null ? "" : Number(numberSlider)}
                min={`0`}
                max={`${csvData.length - 1}`}
              />
            </div>
            {numberSlider != null && (
              <>
                <motion.div
                  key={numberSlider ? numberSlider : "empty"}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div className="h-[100px] overflow-auto">
                    <motion.div>
                      Category: {csvData[numberSlider][category]}
                    </motion.div>
                    <motion.div>
                      Message: {csvData[numberSlider][text]}
                    </motion.div>
                  </motion.div>
                </motion.div>
                <Button
                  color="grey"
                  type="button"
                  text="Prev"
                  func={() =>
                    setNumberSlider((prev) =>
                      prev === 0 ? csvData.length - 1 : prev - 1
                    )
                  }
                />
                <Button
                  color="grey"
                  type="button"
                  text="Next"
                  func={() =>
                    setNumberSlider((prev) =>
                      prev === csvData.length - 1 ? 0 : prev + 1
                    )
                  }
                />
              </>
            )}
          </Card>
        )}
        <Card color="blue" classStyle="min-h-[150px]">
          {inputFieldModelsText.map(({ type, name, label, color }) => (
            <div className="relative w-[300px] mt-[40px]">
              <Input
                type={type}
                name={name}
                label={label}
                color={color}
                register={register}
              />
            </div>
          ))}
        </Card>
        <Card>
          <div className="flex justify-center items-center flex-wrap w-full h-full">
            {fields.map(({ id }, index) => (
              <div key={id} className="flex flex-row mb-12">
                <div className="relative flex flex-col mr-4">
                  <label
                    className={"font-semibold uppercase text-[#1c1c1c]"}
                    htmlFor="layers"
                  >
                    <span
                      className={`relative inline-flex tracking-[0.15em] transition-[0.2s] ease-in-out -translate-y-[15px]`}
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
                <div className="relative ">
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
        <Card></Card>
      </form>
      <div className="grid lg:grid-cols-2 grid-cols-1 gap-4 ml-4 mt-4 h-max-content">
        {epochsHistory.length != 0 && (
          <Card color="grey" classStyle="w-full col-span-4">
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

export default ModelsText;
