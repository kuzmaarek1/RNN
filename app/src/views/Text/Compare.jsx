import React, { useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaTimes } from "react-icons/fa";
import Plot from "react-plotly.js";
import { useForm, useFieldArray } from "react-hook-form";
import { Card, Button, InputFile, SelectInput } from "components";
import { metricsTextClassification } from "constants";

const Compare = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedTab, setSelectedTab] = useState("recall");
  const fileInputRef = useRef();

  const { register, handleSubmit, control, watch, setValue } = useForm();

  const {
    fields: fieldsXLabels,
    remove: removeXLabel,
    append: appendXLabel,
  } = useFieldArray({
    control,
    name: "x_labels",
  });

  const {
    fields: fieldsLegend,
    remove: removeLegend,
    append: appendLegend,
  } = useFieldArray({
    control,
    name: "legends",
  });

  const [xLabels, setXLabels] = useState([]);
  const [legends, setLegends] = useState([]);

  const handleFileChange = async (event) => {
    const files = fileInputRef.current.files;
    const selectedFilesArray = [];
    setSelectedFiles([]);
    for (let i = 0; i < files.length; i++) {
      if (files[i]) {
        const text = await files[i].text();
        const data = JSON.parse(text);
        selectedFilesArray.push({ name: files[i].name, content: data });
      }
    }
    setSelectedFiles((prev) => [...prev, ...selectedFilesArray]);
  };

  const fetchData = (selectedMetric) => {
    const data = legends?.map((legend) => {
      return {
        x: selectedFiles
          .filter(({ content: { report }, name }) => {
            const findFeatured = Object.entries(report)?.find(
              ([metric]) => String(selectedId) === String(metric)
            );
            return (
              findFeatured &&
              String(watch(`legends_${name}`)) === String(legend.name)
            );
          })
          .map(({ content: { report }, name }) => {
            const findFeatured = Object.entries(report)?.find(
              ([metric]) => String(selectedId) === String(metric)
            );
            return findFeatured ? String(watch(`x_labels_${name}`)) : undefined;
          }),
        y: selectedFiles
          .filter(({ content: { report }, name }) => {
            const findFeatured = Object.entries(report)?.find(
              ([metric]) => String(selectedId) === String(metric)
            );
            return (
              findFeatured &&
              String(watch(`legends_${name}`)) === String(legend.name)
            );
          })
          .map(({ content: { report } }) => {
            const findFeatured = Object.entries(report)?.find(
              ([metric]) => String(selectedId) === String(metric)
            );
            return findFeatured
              ? selectedId === "accuracy"
                ? findFeatured[1]
                : findFeatured[1][selectedMetric]
              : undefined;
          }),
        text: selectedFiles
          .filter(({ content: { report }, name }) => {
            const findFeatured = Object.entries(report)?.find(
              ([metric]) => String(selectedId) === String(metric)
            );
            return (
              findFeatured &&
              String(watch(`legends_${name}`)) === String(legend.name)
            );
          })
          .map(({ content: { report } }) => {
            const findFeatured = Object.entries(report)?.find(
              ([metric]) => String(selectedId) === String(metric)
            );
            return findFeatured
              ? selectedId === "accuracy"
                ? findFeatured[1].toFixed(2)
                : findFeatured[1][selectedMetric].toFixed(2)
              : undefined;
          }),
        type: "bar",
        name: legend.name,
      };
    });
    return data;
  };

  const onSubmit = ({ x_labels, legends, ...props }) => {
    setXLabels(x_labels);
    setLegends(legends);
  };

  return (
    <div onClick={() => {}}>
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
              fileAcept=".txt"
              multiple={true}
              color="green"
            />
            <Button
              color="green"
              text="Submit"
              type="button"
              func={handleFileChange}
            />
          </Card>
        </div>
        {selectedFiles.length > 0 && (
          <>
            <div>
              <Card
                color="blue"
                classStyle="min-h-[150px]"
                classStyleDiv="flex flex-col justify-center items-center w-full gap-4"
              >
                <h4 className="font-[600] text-base uppercase tracking-widest">
                  Bar chart
                </h4>
                <div className="flex gap-[5px] flex-wrap justify-center">
                  {[
                    ...selectedFiles[0]?.content?.labels,
                    ...["macro avg", "weighted avg", "accuracy"],
                  ]?.map((label, index) => (
                    <motion.div
                      key={index}
                      onClick={() => setSelectedId(label)}
                      layoutId={label}
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
                      <motion.div>{label}</motion.div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </div>
            <Card
              classStyle="min-h-[150px]"
              classStyleDiv="flex flex-col justify-center items-center w-full gap-4"
            >
              {selectedFiles?.map(({ name }, index) => (
                <div className="flex flex-row justify-center items-center mb-6 gap-6">
                  <div
                    className="font-[600] text-base tracking-widest"
                    key={index}
                  >
                    {name}
                  </div>
                  <div className="flex flex-col flex-wrap justify-center items-center gap-6">
                    <SelectInput
                      options={[
                        "None",
                        ...xLabels.map((xLabel) => xLabel.name),
                      ]}
                      label="X Label"
                      name={`x_labels_${name}`}
                      isMulti={false}
                      color="grey"
                      setValue={setValue}
                      watch={watch(`x_labels_${name}`)}
                    />

                    <SelectInput
                      options={[
                        "None",
                        ...legends.map((legend) => legend.name),
                      ]}
                      label="Legends"
                      name={`legends_${name}`}
                      isMulti={false}
                      color="grey"
                      setValue={setValue}
                      watch={watch(`legends_${name}`)}
                    />
                  </div>
                </div>
              ))}
            </Card>
            <Card
              classStyle="min-h-[150px]"
              classStyleDiv="flex flex-col justify-center items-center w-full gap-4"
            >
              {fieldsXLabels.map(({ id }, index) => (
                <div key={id} className="flex gap-2">
                  <input
                    className="relative w-full p-[10px_0px] bg-[transparent] border-[none] outline-none text-[black] text-[1em] uppercase tracking-[0.05em] border-b-[2px] border-[#A8C5DA] input"
                    type="text"
                    {...register(`x_labels[${index}].name`)}
                  />
                  <button
                    type="button"
                    className="text-[#95A4FC]"
                    onClick={() => {
                      const newXLabels = xLabels.filter(
                        (_, idx) => idx !== index
                      );
                      removeXLabel(index);
                      setXLabels(newXLabels);
                    }}
                  >
                    <FaTimes />
                  </button>
                </div>
              ))}
              <Button
                color="grey"
                func={() => {
                  appendXLabel({});
                }}
                type="button"
                text="Add xLabel"
              />
            </Card>
            <Card
              classStyle="min-h-[150px]"
              classStyleDiv="flex flex-col justify-center items-center w-full gap-4"
            >
              {fieldsLegend.map(({ id }, index) => (
                <div key={id} className="flex gap-2">
                  <input
                    className="relative w-full p-[10px_0px] bg-[transparent] border-[none] outline-none text-[black] text-[1em] uppercase tracking-[0.05em] border-b-[2px] border-[#A8C5DA] input"
                    type="text"
                    {...register(`legends[${index}].name`)}
                  />
                  <button
                    type="button"
                    className="text-[#95A4FC]"
                    onClick={() => {
                      const newLegend = legends.filter(
                        (_, idx) => idx !== index
                      );
                      removeLegend(index);
                      setLegends(newLegend);
                    }}
                  >
                    <FaTimes />
                  </button>
                </div>
              ))}
              <Button
                color="grey"
                func={() => {
                  appendLegend({});
                }}
                type="button"
                text="Add legend"
              />
              <Button color="grey" type="submit" text="Submit" />
            </Card>
            <AnimatePresence onClick={(event) => event.stopPropagation()}>
              {selectedId !== null && (
                <Card
                  color="blue"
                  layoutId={selectedId}
                  setSelectedId={setSelectedId}
                >
                  <div className="flex flex-row justify-center gap-4 mb-8 p-2">
                    {selectedId !== "accuracy" &&
                      metricsTextClassification.map(({ name, title }) => (
                        <div key={name} onClick={() => setSelectedTab(name)}>
                          <div
                            className={`${
                              name === selectedTab ? "relative" : ""
                            } border-[#95A4FC] border-[2px] w-[150px] h-[50px] rounded-[16px] flex justify-center items-center cursor-pointer`}
                          >
                            {title}
                            {name === selectedTab ? (
                              <motion.div
                                className="before:content-[''] before:absolute before:w-[10px] before:h-[6px] before:bottom-0 before:bg-[white] before:border-[2px] before:top-[-3.5px] before:left-[50%] before:translate-x-[-50%] before:border-[#95A4FC] before:translate-x-[-50%] box-shadow-blue
                          after:content-[''] after:absolute after:w-[10px] after:h-[6px] after:bottom-0 after:bg-[white] after:border-[2px] after:bottom-[-4px] after:left-[50%] after:translate-x-[-50%] after:border-[#95A4FC] after:translate-x-[-50%]"
                                layoutId={selectedTab}
                              />
                            ) : null}
                          </div>
                        </div>
                      ))}
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
                          data={fetchData(selectedTab)}
                          layout={{
                            width: 800,
                            height: 400,
                            title: `${
                              selectedId !== "accuracy"
                                ? selectedTab.charAt(0).toUpperCase() +
                                  selectedTab.slice(1)
                                : ""
                            } ${
                              selectedId.charAt(0).toUpperCase() +
                              selectedId.slice(1)
                            }`,
                            yaxis: {
                              title: "Value",
                            },
                            xaxis: {
                              title: "Index",
                            },
                          }}
                        />
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </Card>
              )}
            </AnimatePresence>
          </>
        )}
      </form>
    </div>
  );
};

export default Compare;
