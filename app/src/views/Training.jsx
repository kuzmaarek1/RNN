import React, { useState, useRef } from "react";
import { Card, Button } from "components";
import Plot from "react-plotly.js";
import { AnimatePresence, motion } from "framer-motion";

const Training = () => {
  const fileInputRef = useRef();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedTab, setSelectedTab] = useState("loss");

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

  const data = selectedFiles?.map(({ content, name }, index) => ({
    x: content?.history[selectedTab].map((value, index) => index + 1),
    y: content?.history[selectedTab].map((value) => value),
    type: "scatter",
    mode: "lines",
    name: name,
  }));

  console.log(data);

  return (
    <div className="flex flex-col gap-8">
      <Card color="green" classStyle="min-h-[150px]">
        <div className="text-[#1c1c1c] font-[14px] font-[600]">Select file</div>
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

      <Card>
        <div className="flex mb-8 gap-4 justify-center">
          {selectedFiles.length > 0 &&
            Object.entries(selectedFiles[0]?.content?.history).map(
              ([key, value], index) => (
                <div key={index} onClick={() => setSelectedTab(key)}>
                  <div
                    className={`${
                      key === selectedTab ? "relative" : ""
                    } border-[#95A4FC] border-[2px] w-[150px] h-[50px] rounded-[16px] flex justify-center items-center cursor-pointer`}
                  >
                    {key}
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
                data={data}
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
    </div>
  );
};

export default Training;
