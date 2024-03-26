import React, { useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useForm, useFieldArray } from "react-hook-form";
import Plot from "react-plotly.js";

const Compare = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef();
  const [selectedId, setSelectedId] = useState(null);
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

  const yLabels = watch("y_labels");

  const legends = watch("legends");
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
          return findFeatured ? findFeatured.mean_absolute_error : undefined;
        }),
      type: "bar",
      name: legend.name,
    };
  });

  console.log(data);
  //(({ content }) =>
  //content?.results.find(({ feature }) => feature !== String(selectedId))
  //);

  return (
    <div>
      <input
        type="file"
        multiple
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".txt"
      />
      <button onClick={() => fileInputRef.current.click()}>Select Files</button>
      <div>
        <form onSubmit={handleSubmit()}>
          <h4>Selected Files:</h4>
          <ul>
            {
              /*selectedFiles?.map((file, index) => (
            <>
              <li key={index}>{file.name}</li>

              {file.content.results.map(({ feature }, index) => (
                <li key={index} onClick={() => setSelectedId(feature)}>
                  {feature}
                </li>
              ))}
            </>
              ))*/
              selectedFiles[0]?.content?.results?.map(({ feature }, index) => (
                <li key={index} onClick={() => setSelectedId(feature)}>
                  {feature}
                </li>
              ))
            }

            {selectedFiles?.map(({ name }, index) => (
              <div>
                <li key={index}>{name}</li>
                <select
                  id="layers"
                  name="layers"
                  {...register(`y_labels_${name}`)}
                  defaultValue=""
                >
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
                  defaultValue=""
                >
                  {legends.map((legend, index) => (
                    <option key={index} value={legend.name}>
                      {legend.name}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </ul>

          {fieldsYLabels.map(({ id }, index) => (
            <div key={id}>
              <input type="text" {...register(`y_labels[${index}].name`)} />
              <button type="button" onClick={() => removeYLabel(index)}>
                Remove
              </button>
            </div>
          ))}
          <button type="button" onClick={() => appendYLabel({})}>
            Add yLabel
          </button>
          {fieldsLegend.map(({ id }, index) => (
            <div key={id}>
              {" "}
              <input type="text" {...register(`legends[${index}].name`)} />
              <button type="button" onClick={() => removeLegend(index)}>
                Remove
              </button>
            </div>
          ))}
          <button type="button" onClick={() => appendLegend({})}>
            Add legend
          </button>
        </form>
      </div>
      {selectedId !== null && (
        <motion.div className="animate-presence" layoutId={selectedId}>
          {selectedFiles.map(({ content: { results } }) =>
            results.map(
              ({ feature, mean_absolute_error }) =>
                String(selectedId) == String(feature) && (
                  <div>
                    <div>{mean_absolute_error}</div>
                    <Plot
                      data={
                        data
                        /*
                        {
                          x: selectedFiles.map(({ name }) => name),
                          y: selectedFiles.map(({ content: { results } }) => {
                            const findFeatured = results.find(
                              ({ feature, mean_absolute_error }) =>
                                String(selectedId) == String(feature)
                            );
                            return findFeatured
                              ? findFeatured.mean_absolute_error
                              : 0;
                          }),
                          type: "bar",
                          name: "NieArek",
                        },
                        {
                          x: selectedFiles.map(({ name }) => name),
                          y: selectedFiles.map(({ content: { results } }) => {
                            const findFeatured = results.find(
                              ({ feature, mean_absolute_error }) =>
                                String(selectedId) == String(feature)
                            );
                            return findFeatured
                              ? findFeatured.mean_absolute_error
                              : 0;
                          }),
                          type: "bar",
                          name: "NieArek",
                        },*/
                      }
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
                )
            )
          )}
          <motion.button onClick={() => setSelectedId(null)}>
            Close
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};

export default Compare;
