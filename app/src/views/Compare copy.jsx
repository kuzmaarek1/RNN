import React, { useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useForm, useFieldArray } from "react-hook-form";
import Plot from "react-plotly.js";
import { Card, Button } from "components";
import { metricsErrorTimeSeries } from "constants";

const Compare = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef();
  const [selectedId, setSelectedId] = useState(null);
  const [selectedTab, setSelectedTab] = useState("mean_absolute_error");
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm();

  const {
    fields: fieldsYLabels,
    remove: removeYLabel,
    append: appendYLabel,
  } = useFieldArray({
    control,
    name: "y_labels",
  });

  const {
    fields: fieldsLegend,
    remove: removeLegend,
    append: appendLegend,
  } = useFieldArray({
    control,
    name: "legends",
  });

  const [yLabels, setYLabels] = useState([]);
  const [legends, setLegends] = useState([]);
  //const yLabels = watch("y_labels");

  // const legends = watch("legends");
  console.log(legends);

  const handleFileChange = async (event) => {
    const files = fileInputRef.current.files;
    const selectedFilesArray = [];
    setSelectedFiles([]);
    for (let i = 0; i < files.length; i++) {
      if (files[i]) {
        const text = await files[i].text();
        console.log(text);
        const data = JSON.parse(text);
        selectedFilesArray.push({ name: files[i].name, content: data });
      }
    }
    setSelectedFiles((prev) => [...prev, ...selectedFilesArray]);
  };
  console.log(selectedFiles);
  console.log(selectedId);
  console.log(
    selectedFiles.map(({ content: { results } }) => {
      const findFeatured = results?.find(
        ({ feature, mean_absolute_error }) =>
          String(selectedId) == String(feature)
      );
      return findFeatured ? findFeatured.mean_absolute_error : 0;
    })
  );
  console.log(watch(`y_labels_${`responseState.txt`}`));

  console.log(
    yLabels?.map((yLabel) =>
      selectedFiles?.filter(
        ({ name }) => String(watch(`y_labels_${name}`)) === String(yLabel.name)
      )
    )
  );

  yLabels?.map((yLabel) =>
    selectedFiles?.filter(
      ({ name }) => String(watch(`y_labels_${name}`)) === String(yLabel.name)
    )
  );
  console.log(yLabels?.map((yLabel) => yLabel.name));

  const legendsFilter = legends?.map((legend) =>
    selectedFiles?.filter(
      ({ name }) => String(watch(`legends_${name}`)) === String(legend.name)
    )
  );

  console.log(legendsFilter);
  console.log(watch(`y_labels_responseState (7)`));
  const fetchData = (error) => {
    const data = legends?.map((legend) => {
      return {
        x: selectedFiles
          .filter(({ content: { results }, name }) => {
            const findFeatured = results.find(
              ({ feature }) => String(selectedId) === String(feature)
            );
            return (
              findFeatured &&
              String(watch(`legends_${name}`)) === String(legend.name)
            );
          })
          .map(({ content: { results }, name }) => {
            const findFeatured = results.find(
              ({ feature }) => String(selectedId) === String(feature)
            );
            return findFeatured ? String(watch(`y_labels_${name}`)) : undefined;
          }),
        y: selectedFiles
          .filter(({ content: { results }, name }) => {
            const findFeatured = results.find(
              ({ feature }) => String(selectedId) === String(feature)
            );
            return (
              findFeatured &&
              String(watch(`legends_${name}`)) === String(legend.name)
            );
          })
          .map(({ content: { results } }) => {
            const findFeatured = results.find(
              ({ feature }) => String(selectedId) === String(feature)
            );
            return findFeatured ? findFeatured[error] : undefined;
          }),
        type: "bar",
        name: legend.name,
      };
    });
    return data;
  };

  //(({ content }) =>
  //content?.results.find(({ feature }) => feature !== String(selectedId))
  //);
  console.log(yLabels);
  console.log(watch("y_labels"));
  const onSubmit = ({ y_labels, legends, ...props }) => {
    setYLabels(y_labels);
    setLegends(legends);
    console.log(props);
    //Object.entries(props).forEach(([key, value]) => setValue(key, value.txt));
  };
  const handleOutsideClick = (event) => {
    console.log(event);
    if (selectedId && !event.target.closest(".animate-presence")) {
      setSelectedId(null);
    }
  };
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
              multiple
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".txt"
            />
            <Button
              color="green"
              text="Submit"
              type="button"
              func={() => fileInputRef.current.click()}
            />
          </Card>
        </div>
        <div>
          <Card color="blue" classStyle="min-h-[150px]">
            <h4>Selected Featured:</h4>
            <div className="flex gap-[5px] flex-wrap">
              {selectedFiles[0]?.content?.results?.map(({ feature }, index) => (
                <motion.div
                  key={index}
                  onClick={() => setSelectedId(feature)}
                  layoutId={feature}
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
                  <motion.div>{feature}</motion.div>
                </motion.div>
              ))}
            </div>
          </Card>
        </div>
        <Card>
          {selectedFiles?.map(({ name }, index) => (
            <div>
              <li key={index}>{name}</li>
              <select
                id="layers"
                name="layers"
                {...register(`y_labels_${name}`)}
                defaultValue={"None"}
              >
                <option value="None">None</option>
                {yLabels.map((yLabel, index) => (
                  <option key={index} value={yLabel.name}>
                    {yLabel.name}
                  </option>
                ))}
              </select>
              <select
                id="layers"
                name="layers"
                {...register(`legends_${name}`)}
                defaultValue={"None"}
              >
                <option value="None">None</option>
                {legends.map((legend, index) => (
                  <option key={index} value={legend.name}>
                    {legend.name}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </Card>
        <Card>
          {fieldsYLabels.map(({ id }, index) => (
            <div key={id}>
              <input type="text" {...register(`y_labels[${index}].name`)} />
              <button
                type="button"
                onClick={() => {
                  const newYLabels = yLabels.filter((_, idx) => idx !== index);
                  removeYLabel(index);
                  setYLabels(newYLabels);
                }}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              appendYLabel({});
            }}
          >
            Add yLabel
          </button>
        </Card>
        <Card>
          {fieldsLegend.map(({ id }, index) => (
            <div key={id}>
              {" "}
              <input type="text" {...register(`legends[${index}].name`)} />
              <button
                type="button"
                onClick={() => {
                  const newLegend = legends.filter((_, idx) => idx !== index);
                  removeLegend(index);
                  setLegends(newLegend);
                }}
              >
                Remove
              </button>
            </div>
          ))}
          <button type="button" onClick={() => appendLegend({})}>
            Add legend
          </button>
          <button type="subit">Submit</button>
        </Card>
        <AnimatePresence onClick={(event) => event.stopPropagation()}>
          {selectedId !== null && (
            <Card
              color="blue"
              layoutId={selectedId}
              setSelectedId={setSelectedId}
            >
              <div className="flex flex-row gap-4 mb-8 p-2">
                {metricsErrorTimeSeries.map(({ name, title }) => (
                  <div
                    key={name}
                    //className={`${
                    //name === selectedTab
                    //? "realtive w-[150px] "
                    //: "w-[150px] flex justify-center"
                    //}`}
                    onClick={() => setSelectedTab(name)}
                  >
                    <div
                      className={`${
                        name === selectedTab ? "relative" : ""
                      } border-[#95A4FC] border-[2px] w-[150px] h-[50px] rounded-[16px] flex justify-center items-center cursor-pointer`}
                      //className="flex justify-center"
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
                        title: "Bar Chart",
                        xaxis: {
                          title: "Value",
                        },
                        yaxis: {
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
      </form>
    </div>
  );
};

export default Compare;