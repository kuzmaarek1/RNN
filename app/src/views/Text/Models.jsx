import React, { useRef, useState, useEffect } from "react";
import { FaTimes, FaPlus } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import { parse } from "papaparse";
import { useForm, useFieldArray } from "react-hook-form";
import { io } from "socket.io-client";
import Plot from "react-plotly.js";
import { Card, Input, Button, InputFile, SelectInput } from "components";
import { inputFieldModelsText } from "constants";

const Models = () => {
  const { register, handleSubmit, control, watch, setValue } = useForm();

  const { fields, remove, append } = useFieldArray({
    control,
    name: "models",
  });

  const socket = useRef();
  const fileInputRef = useRef(null);
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [csvData, setCsvData] = useState(null);
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
      setEpochsHistory((prev) => [...prev, JSON.parse(epochs)]);
    });
    socket.current.on("training_completed/text_classification", (results) => {
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
    const selectedCategoryLabel = watch("Category");
    const selectedText = csvHeaders.find(
      (csvHeader) => csvHeader !== selectedCategoryLabel
    );
    setCategory(selectedCategoryLabel);
    setText(selectedText);
  };

  const onSubmit = (data) => {
    setEpochsHistory([]);
    socket.current.emit(
      "train/text_classification",
      JSON.stringify({
        ...data,
        category: category,
        text: text,
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
    if (displayPlot && !event.target.closest(".animate-presence")) {
      setDisplayPlot(null);
    }
  };

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
    <div onClick={handleOutsideClick} className="w-full">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-[calc(100%-2rem)] grid lg:grid-cols-2 grid-cols-1 gap-4 mx-4 mt-12 h-max-content"
      >
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
        {csvHeaders.length > 0 && (
          <Card
            color="blue"
            classStyle="min-h-[150px]"
            classStyleDiv="flex flex-col justify-center items-center w-full gap-4"
          >
            <SelectInput
              options={csvHeaders}
              label="Category"
              name="Category"
              isMulti={false}
              color="blue"
              setValue={setValue}
              watch={watch("Category")}
            />
            <Button
              color="blue"
              text="Submit"
              type="button"
              func={handleCategory}
            />
          </Card>
        )}
        {category && (
          <div className="lg:col-span-2">
            <Card classStyleDiv="flex flex-col justify-center items-center w-full gap-4">
              <div className="relative sm:w-[400px] w-[200px]">
                <Input
                  type="number"
                  name="numberSlider"
                  label="Number"
                  register={register}
                  onChange={(value) => {
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
                    <motion.div className="h-[210px] overflow-auto">
                      <motion.div className="flex flex-row flex-wrap gap-4 mt-2 justify-center items-center">
                        <motion.div className="flex w-[150px] flex-nowrap justify-center items-center border-[2px] border-[#A8C5DA] mb-1 p-1 rounded-[16px]">
                          Category
                        </motion.div>
                        <motion.div className="flex w-[150px] flex-nowrap justify-center items-center border-[2px] border-[#A8C5DA] mb-1 p-1 rounded-[16px]">
                          {csvData[numberSlider][category]}
                        </motion.div>
                      </motion.div>
                      <motion.div className="flex flex-row flex-wrap gap-4 mt-2">
                        <motion.div className="flex w-[100%] flex-nowrap justify-center items-center border-[2px] border-[#A8C5DA] mb-1 p-1 rounded-[16px]">
                          {csvData[numberSlider][text]}
                        </motion.div>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                  <div className="flex flex-row flex-wrap justify-center items-center gap-4">
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
                  </div>
                </>
              )}
            </Card>
          </div>
        )}
        {category && (
          <Card color="blue" classStyle="min-h-[150px]">
            {inputFieldModelsText.map(({ type, name, label, color }, index) => (
              <div
                className={`relative w-[300px]  ${index != 0 && "mt-[40px]"}`}
              >
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
        )}
        {category && (
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
                    <div className="relative flex flex-col mr-4">
                      <SelectInput
                        options={[
                          "RNN",
                          "LSTM",
                          "GRU",
                          "RepeatVector",
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
        )}
      </form>
      <div className="w-[calc(100%-2rem)] grid lg:grid-cols-2 grid-cols-1 gap-4 mx-4 mt-12 h-max-content">
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
