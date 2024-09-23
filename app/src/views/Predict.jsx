import React, { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { parse } from "papaparse";
import { useForm } from "react-hook-form";
import axios from "axios";
import { Card, Button, Input, InputFile } from "components";
import { PlotContainer } from "views";

const Predict = ({ options }) => {
  const { register, watch } = useForm();
  const fileInputTxtRef = useRef(null);
  const fileInputCsvRef = useRef(null);
  const [txtData, setTxtData] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [feature, setFeature] = useState();
  const [csvData, setCsvData] = useState(null);
  const [responseState, setResponseState] = useState(null);

  const handleTxtSubmission = async () => {
    const file = fileInputTxtRef.current.files[0];
    if (file) {
      const text = await file.text();
      const data = JSON.parse(text);
      setTxtData(data);
    }
  };

  const handleCsvSubmission = async () => {
    const file = fileInputCsvRef.current.files[0];
    if (file) {
      const text = await file.text();
      const { data } = parse(text, { header: true });
      setCsvData(data);
    }
  };
  const handleOutsideClick = (event) => {
    if (selectedId && !event.target.closest(".animate-presence")) {
      setSelectedId(null);
    }
  };

  const handlePredict = async (data) => {
    try {
      const payload = {
        ...txtData,
        ...(options === "TimeSeries"
          ? { y_test: csvData, next_time_steps: watch("next_time_steps") }
          : { text_predict: watch("text_predict") }),
      };
      const response = await axios.post(
        options == "TimeSeries"
          ? "http://127.0.0.1:5000/predict/time_series"
          : "http://127.0.0.1:5000/predict/text_classification",
        payload
      );
      setResponseState(response.data);
    } catch (error) {
      console.error("Błąd podczas wysyłania zapytania POST:", error);
    }
  };

  console.log("text_predict");

  return (
    <div
      onClick={handleOutsideClick}
      className="w-[calc(100%-2rem)] flex flex-col gap-4 mx-4 mt-12 mb-12 h-max-content"
    >
      <Card
        color="green"
        classStyle="min-h-[150px]"
        classStyleDiv="flex flex-row flex-wrap justify-center items-center w-full gap-4"
      >
        <InputFile
          ref={fileInputTxtRef}
          fileAcept=".txt"
          multiple={false}
          color="green"
        />
        <Button
          color="green"
          text="Submit"
          type="button"
          func={handleTxtSubmission}
        />
      </Card>
      {txtData && (
        <Card
          color="blue"
          classStyleDiv="flex flex-row flex-wrap justify-center items-center w-full gap-4"
        >
          {options == "TimeSeries" ? (
            <InputFile
              ref={fileInputCsvRef}
              fileAcept=".csv"
              multiple={false}
              color="blue"
            />
          ) : (
            <div className="relative w-[250px] sm:w-[500px]">
              <Input
                type="textarea"
                name="text_predict"
                label="Text"
                color="blue"
                register={register}
              />
            </div>
          )}

          <Button
            type="button"
            text="Submit"
            color="blue"
            func={
              options === "TimeSeries" ? handleCsvSubmission : handlePredict
            }
          />
        </Card>
      )}
      {csvData && options == "TimeSeries" && (
        <Card
          color="grey"
          classStyle="min-h-[150px]"
          classStyleDiv="flex flex-wrap justify-center items-center w-full gap-4"
        >
          <div className="relative mb-4">
            <Input
              type="number"
              name="next_time_steps"
              label="Next time steps"
              color="blue"
              register={register}
            />
          </div>
          <Button
            type="button"
            text="Submit"
            color="blue"
            func={handlePredict}
          />
        </Card>
      )}
      {responseState && options === "TimeSeries" && (
        <>
          <Card classStyleDiv="flex flex-row flex-wrap justify-center items-center w-full gap-4">
            <div className="flex gap-[5px] flex-wrap">
              {responseState?.results.map((state, index) => (
                <motion.div
                  key={index + 1}
                  layoutId={index + 1}
                  onClick={() => {
                    setSelectedId(index + 1);
                    setFeature(state.feature);
                  }}
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
                  <motion.div>{state.feature}</motion.div>
                </motion.div>
              ))}
            </div>
          </Card>
          <AnimatePresence onClick={(event) => event.stopPropagation()}>
            {selectedId !== null && (
              <Card
                layoutId={selectedId}
                setSelectedId={() => setSelectedId(null)}
              >
                <motion.div>
                  <PlotContainer
                    data={[
                      {
                        x: csvData.map((_, index) => index),
                        y: csvData.map((value) => value[feature]),
                        type: "scatter",
                        mode: "lines",
                        name: "test",
                        marker: { color: "#82ca9d" },
                      },
                      {
                        x: responseState?.results[
                          selectedId - 1
                        ]?.predictions.map(
                          (_, index) => responseState?.split_index + index
                        ),

                        y: responseState?.results[
                          selectedId - 1
                        ]?.predictions.map((value) => value),
                        type: "scatter",
                        mode: "lines",
                        name: "pred",
                      },
                    ]}
                    title="Predictions"
                    classStyle={`w-[75vw]`}
                  />
                </motion.div>
              </Card>
            )}
          </AnimatePresence>
        </>
      )}
      {responseState && options == "Text" && (
        <Card classStyleDiv="flex flex-row justify-center items-center w-full gap-4">
          <div className="flex flex-nowrap justify-center items-center border-[2px] border-[#A8C5DA] mb-1 pt-2 pb-2 pl-5 pr-5 rounded-[16px]">
            Prediction
          </div>
          <div className="flex flex-nowrap justify-center items-center border-[2px] border-[#A8C5DA] mb-1 pt-2 pb-2 pl-5 pr-5 rounded-[16px]">
            {responseState.results}
          </div>
        </Card>
      )}
    </div>
  );
};

export default Predict;
