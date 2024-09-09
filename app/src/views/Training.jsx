import React, { useState, useRef } from "react";
import { Card, Button, InputFile } from "components";
import Plot from "react-plotly.js";
import { AnimatePresence, motion } from "framer-motion";

const Training = () => {
  const fileInputRef = useRef();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedTab, setSelectedTab] = useState("loss");
  const [selectedTabFile, setSelectedTabFile] = useState(null);

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
    setSelectedTabFile(files[0] ? 1 : null);
  };

  const data = selectedFiles?.map(({ content, name }, index) => ({
    x: content?.history[selectedTab].map((value, index) => index + 1),
    y: content?.history[selectedTab].map((value) => value),
    type: "scatter",
    mode: "lines",
    name: name.replace(".txt", ""),
  }));

  const handleOutsideClick = (event) => {
    if (selectedId && !event.target.closest(".animate-presence")) {
      setSelectedId(null);
    }
  };

  return (
    <div
      onClick={handleOutsideClick}
      className="sm:w-[83vw] sm:ml-[236px] flex flex-col gap-4 ml-4 mt-12 mb-12 h-max-content"
    >
      <Card
        color="green"
        classStyle="min-h-[150px]"
        classStyleDiv="flex flex-row flex-wrap justify-center items-center w-full gap-4"
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
          func={() => handleFileChange()}
        />
      </Card>
      {selectedFiles.length > 0 && (
        <>
          <Card classStyleDiv="flex flex-row justify-center items-center w-full gap-4">
            {Object.entries(selectedFiles[0]?.content?.history).map(
              ([key, value], index) =>
                key !== "epoch" &&
                !key.includes("val") && (
                  <motion.div
                    key={`${key}_chart`}
                    layoutId={`${key}_chart`}
                    onClick={() => setSelectedId(`${key}_chart`)}
                    className={`border-[#95A4FC] border-[2px] mb-[10px] w-[200px] h-[50px] rounded-[16px] flex justify-center items-center cursor-pointer`}
                  >
                    {key.charAt(0).toUpperCase() +
                      key.slice(1).replace(/_/g, " ")}
                  </motion.div>
                )
            )}
          </Card>
          <AnimatePresence onClick={(event) => event.stopPropagation()}>
            {selectedId && (
              <Card layoutId={selectedId} setSelectedId={setSelectedId}>
                <div className="flex mb-8 gap-4 justify-center">
                  {selectedFiles.map(({ name }, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedTabFile(index + 1)}
                    >
                      <div
                        className={`${
                          index + 1 === selectedTabFile ? "relative" : ""
                        } border-[#95A4FC] border-[2px] w-[150px] h-[50px] rounded-[16px] flex justify-center items-center cursor-pointer`}
                      >
                        {name.replace(".txt", "")}
                        {index + 1 === selectedTabFile ? (
                          <motion.div
                            className="before:content-[''] before:absolute before:w-[10px] before:h-[6px] before:bottom-0 before:bg-[white] before:border-[2px] before:top-[-3.5px] before:left-[50%] before:translate-x-[-50%] before:border-[#95A4FC] before:translate-x-[-50%] box-shadow-blue
                          after:content-[''] after:absolute after:w-[10px] after:h-[6px] after:bottom-0 after:bg-[white] after:border-[2px] after:bottom-[-4px] after:left-[50%] after:translate-x-[-50%] after:border-[#95A4FC] after:translate-x-[-50%]"
                            layoutId={selectedTabFile}
                          />
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedTabFile ? selectedTabFile : "empty"}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="bg-[white] pt-12 border-[2px] border-[#95A4FC] rounded-[16px] flex justify-center items-center p-2">
                      <Plot
                        data={[
                          {
                            x: selectedFiles[
                              selectedTabFile - 1
                            ]?.content?.history[
                              selectedId.replace("_chart", "")
                            ].map((_, index) => index),
                            y: selectedFiles[
                              selectedTabFile - 1
                            ]?.content?.history[
                              selectedId.replace("_chart", "")
                            ].map((value, index) => value),
                            type: "scatter",
                            mode: "lines",
                            name: "trening",
                          },
                          selectedFiles[selectedTabFile - 1]?.content?.history[
                            `val_${selectedId.replace("_chart", "")}`
                          ] !== undefined && {
                            x: selectedFiles[
                              selectedTabFile - 1
                            ]?.content?.history[
                              `val_${selectedId.replace("_chart", "")}`
                            ].map((_, index) => index),
                            y: selectedFiles[
                              selectedTabFile - 1
                            ]?.content?.history[
                              `val_${selectedId.replace("_chart", "")}`
                            ].map((value, index) => value),
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
          <Card classStyleDiv="flex flex-col justify-center items-center w-full gap-4">
            <div className="flex mb-8 gap-4 justify-center">
              {Object.entries(selectedFiles[0]?.content?.history).map(
                ([key, _], index) => (
                  <div key={index} onClick={() => setSelectedTab(key)}>
                    <div
                      className={`${
                        key === selectedTab ? "relative" : ""
                      } border-[#95A4FC] border-[2px] w-[150px] text-center p-[8px] h-[50px] rounded-[16px] flex justify-center items-center cursor-pointer`}
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
                    data={data}
                    layout={{
                      width: "5vw",
                      height: "500px",
                      // width: 800,
                      // height: 400,
                      title: {
                        text: `${
                          selectedTab.charAt(0).toUpperCase() +
                          selectedTab.slice(1).toLowerCase().replace(/_/g, " ")
                        }`,
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
        </>
      )}
    </div>
  );
};

export default Training;
