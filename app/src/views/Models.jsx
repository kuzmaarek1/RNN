import React, { useState, useRef, useMemo, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaTimes, FaPlus } from "react-icons/fa";
import { parse } from "papaparse";
import { useForm, useFieldArray } from "react-hook-form";
import { inputFieldModelsTimeSeries, inputFieldModelsText } from "constants";
import { useModels } from "hooks/useModels.js";
import {
  PlotContainer,
  TimeSeriesDataVisualization,
  TextDataVisualization,
} from "views";
import {
  Button,
  Card,
  Input,
  InputFile,
  SelectInput,
  CheckboxInput,
} from "components";

const Models = ({ options }) => {
  const fileInputRef = useRef(null);
  const { register, handleSubmit, control, watch, reset, setValue } = useForm();
  const { fields, remove, append } = useFieldArray({
    control,
    name: "models",
  });
  const {
    csvData,
    csvHeaders,
    YLabels,
    selectedId,
    displayPlot,
    selectedTab,
    epochsHistory,
    downloadLink,
    numberSlider,
    updateFile,
    socket,
  } = useModels(options);

  useEffect(() => {
    reset();
  }, [options]);

  const handleOutsideClick = (event) => {
    if (
      (selectedId || displayPlot) &&
      !event.target.closest(".animate-presence")
    ) {
      if (selectedId) updateFile("selectedId", null);
      else updateFile("displayPlot", null);
    }
  };

  const onSubmit = (data) => {
    updateFile("epochsHistory", []);
    socket.current.emit(
      options === "TimeSeries"
        ? "train/time_series"
        : "train/text_classification",
      JSON.stringify({
        ...data,
        dataset: csvData,
        ...(options !== "TimeSeries" && {
          category: watch("Category"),
          text: csvHeaders.find((csvHeader) => csvHeader !== watch("Category")),
        }),
      })
    );
  };

  const handleCsvSubmission = async () => {
    const file = fileInputRef.current.files[0];
    if (file) {
      const text = await file.text();
      const { data } = parse(text, { header: true });
      updateFile("csvHeaders", Object.keys(data[0]));
      updateFile("csvData", data);
    }
  };

  const selectConfig = {
    TimeSeries: {
      label: "X Label",
      name: "XLabel",
      inputField: inputFieldModelsTimeSeries,
    },
    Text: {
      label: "Category",
      name: "Category",
      inputField: inputFieldModelsText,
    },
  };

  const handleLabelOrCategoryInput = () => {
    const selectedValue = watch(name);
    if (watch(name)) {
      const availableYLabels = csvHeaders.filter(
        (csvHeader) => csvHeader !== selectedValue
      );
      updateFile("YLabels", availableYLabels);
    }
  };

  const { label, name, inputField } = useMemo(() => {
    return selectConfig[options];
  }, [options]);

  const chartData = () =>
    csvData?.map((row, index) => {
      const value = parseFloat(row[selectedId]);
      return {
        label: index,
        value: value,
      };
    });

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
  const transition = {
    duration: 0.2,
    ease: [0.42, 0, 0.58, 1],
  };
  const variants = {
    hidden: { y: 20, opacity: 0, scale: 0.8 },
    visible: { y: 0, opacity: 1, scale: 1 },
    exit: { y: -20, opacity: 0, scale: 0.8 },
  };

  return (
    <div onClick={handleOutsideClick} className="w-full">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-[calc(100%-2rem)] grid mx-4 px-4 lg:grid-cols-2 grid-cols-1 gap-4 mt-12 h-max-content"
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
              label={label}
              name={name}
              isMulti={false}
              color="blue"
              setValue={setValue}
              watch={watch(name)}
            />
            <Button
              color="blue"
              text="Submit"
              type="button"
              func={handleLabelOrCategoryInput}
            />
          </Card>
        )}
        {watch(name) &&
          YLabels.length > 0 &&
          (options === "TimeSeries" ? (
            <TimeSeriesDataVisualization
              YLabels={YLabels}
              selectedId={selectedId}
              setSelectedId={updateFile}
              chartData={chartData()}
            />
          ) : (
            <TextDataVisualization
              register={register}
              numberSlider={numberSlider}
              setNumberSlider={updateFile}
              category={
                numberSlider !== null && csvData[numberSlider][watch(name)]
              }
              text={numberSlider !== null && csvData[numberSlider][YLabels]}
              size={csvData.length}
              transition={transition}
              variants={variants}
            />
          ))}
        {watch(name) && YLabels.length > 0 && (
          <>
            <Card
              color={options == "TimeSeries" ? `green` : "blue"}
              classStyle="lg:px-8 px-4 py-8 flex justify-center lg:justify-start"
            >
              {options == "TimeSeries" && (
                <SelectInput
                  options={YLabels}
                  label="y feauture"
                  name="y_feauture"
                  isMulti={true}
                  color="green"
                  setValue={setValue}
                  watch={watch("y_feauture")}
                />
              )}
              {inputField.map(({ type, name, label, color }, index) => (
                <div
                  className={`relative sm:w-[300px] w-[250px] mt-8 ${
                    index === 0 && options === "Text" && "mt-[10px]"
                  }`}
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
            <Card
              classStyle="min-h-[150px]"
              classStyleDiv="flex flex-col justify-center items-center w-full"
            >
              <div className="flex justify-center items-center flex-wrap w-full h-full">
                <AnimatePresence>
                  {fields.map(({ id }, index) => (
                    <motion.div
                      variants={variants}
                      layout
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      transition={transition}
                      key={id}
                      className="flex flex-row flex-wrap mb-12 gap-6 relative justify-center items-center"
                    >
                      <div className="relative flex flex-col flex-1 justify-center items-center">
                        <motion.div
                          key={index + 1}
                          initial={{ scale: 0 }}
                          animate={{ rotate: 360, scale: 1 }}
                          transition={{
                            type: "spring",
                            stiffness: 260,
                            damping: 20,
                          }}
                          className="text-[#F7F9FB] font-bold text-[50px] font-outline outline-text"
                        >
                          {index + 1}
                        </motion.div>
                        <button
                          className="mt-[-10px] flex justify-center items-center w-[50px] text-[#95A4FC] text-center relative py-1 px-4 rounded-[16px] border-[2px] border-[#A8C5DA]  h-full left-0 top-0 right-0
                                    hover:before:w-[10px] hover:before:left-[calc(50%)]
                                    before:content-[''] before:absolute before:w-[10px] before:h-[6px] before:bg-[white] 
                                    before:border-[2px] before:border-[#A8C5DA] box-shadow-button-blue
                                    before:top-[-3.5px] before:left-[80%] before:translate-x-[-50%]
                                    hover:after:w-[10px] hover:after:left-[calc(50%)]
                                    after:content-[''] after:absolute after:w-[10px] after:h-[6px] after:bg-[white] 
                                    after:border-[2px] after:border-[#A8C5DA] after:bottom-[-3.5px] after:left-[20%]
                                    after:translate-x-[-50%]"
                          type="button"
                          onClick={() => remove(index)}
                        >
                          <FaTimes />
                        </button>
                      </div>
                      <div className="flex flex-row flex-wrap justify-center items-center gap-6">
                        <div className="flex flex-col h-[100%] justify-center gap-6">
                          <div className="relative">
                            <SelectInput
                              options={[
                                "RNN",
                                "LSTM",
                                "GRU",
                                options == "TimeSeries"
                                  ? "ConvLSTM2D"
                                  : "RepeatVector",
                                "Dense",
                              ]}
                              label="Layers"
                              name={`models[${index}].layers`}
                              isMulti={false}
                              color="grey"
                              setValue={setValue}
                              watch={watch(`models[${index}].layers`)}
                              styled={"w-[200px] mt-[-2px] mr-[8px]"}
                            />
                          </div>
                          <div className="relative w-[200px] mt-[-2px] mr-[8px]">
                            <Input
                              type="number"
                              name={`models[${index}].units`}
                              label="Units"
                              color="grey"
                              register={register}
                            />
                          </div>
                        </div>
                        <div className="flex flex-col h-[100%] justify-center gap-2">
                          <CheckboxInput
                            id={`models[${index}].returnSequences`}
                            label="Sequences"
                            register={register}
                            defaultChecked={false}
                          />
                          <CheckboxInput
                            id={`models[${index}].bidirectional`}
                            label="Bidirectional"
                            register={register}
                            defaultChecked={false}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  <motion.div
                    variants={variants}
                    layout
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ duration: 0.1 }}
                    className="flex flex-row flex-wrap items-center justify-center gap-4"
                  >
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
                  </motion.div>
                </AnimatePresence>
              </div>
            </Card>
          </>
        )}
      </form>
      <div className="w-[calc(100%-2rem)] grid lg:grid-cols-2 grid-cols-1 gap-4 px-4 mx-4 mt-4 mb-12 h-max-content">
        <div className="lg:col-span-2">
          {epochsHistory.length != 0 && (
            <Card
              color="grey"
              classStyle="min-h-[150px]"
              classStyleDiv="flex flex-col justify-center items-center w-full gap-4"
            >
              <div className="w-[90%] flex overflow-auto gap-2">
                <div>
                  {Object.entries(epochsHistory[0]).map(([key, value]) => (
                    <div>
                      <div className="flex w-[110px] flex-nowrap justify-center items-center border-[2px] border-[#A8C5DA] mb-1 p-1 rounded-[16px]">
                        {key.charAt(0).toUpperCase() +
                          key.slice(1).replace(/_/g, " ")}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="custom-scrollbar-gray flex overflow-auto gap-2">
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
              </div>
              {downloadLink && (
                <div className="w-full flex justify-center items-center flex-wrap gap-6">
                  <div className="relative w-[300px] mt-[20px]">
                    <Input
                      type="text"
                      name="name_file"
                      label="Name File"
                      color="grey"
                      register={register}
                    />
                  </div>
                  <Button
                    type="button"
                    color="grey"
                    text="Download"
                    func={handleDownload}
                  />
                  <motion.div
                    layoutId={1}
                    onClick={() => updateFile("displayPlot", 1)}
                    className="border-[2px] border-[#A8C5DA] w-[150px] h-[45px] rounded-[16px] flex justify-center items-center cursor-pointer"
                  >
                    Display Plot
                  </motion.div>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
      <AnimatePresence onClick={(event) => event.stopPropagation()}>
        {displayPlot && (
          <Card layoutId={displayPlot} setSelectedId={updateFile}>
            <div className="flex flex-wrap gap-4 mb-4 justify-center">
              {epochsHistory.length > 0 &&
                Object.entries(epochsHistory[0]).map(
                  ([key, _], index) =>
                    key !== "epoch" &&
                    !key.includes("val") && (
                      <div
                        key={index}
                        onClick={() => updateFile("selectedTab", key)}
                      >
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
                <PlotContainer
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
                  title={`${selectedTab
                    .charAt(0)
                    .toUpperCase()}${selectedTab.slice(1)}`}
                  classStyle={`w-[75vw]`}
                />
              </motion.div>
            </AnimatePresence>
          </Card>
        )}
      </AnimatePresence>
    </div>
  );
};
export default Models;
