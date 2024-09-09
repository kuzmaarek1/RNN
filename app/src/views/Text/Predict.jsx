import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { Button, Card, Input, InputFile } from "components";

const Predict = () => {
  const fileInputTxtRef = useRef(null);
  const [txtData, setTxtData] = useState(null);
  const { register, handleSubmit } = useForm();
  const [responseState, setResponseState] = useState(null);

  const handleTxtSubmission = async () => {
    const file = fileInputTxtRef.current.files[0];
    if (file) {
      const text = await file.text();
      const data = JSON.parse(text);
      setTxtData(data);
    }
  };

  const onSubmit = async (data) => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/predict/text_classification",
        { ...txtData, ...data }
      );
      setResponseState(response.data);
    } catch (error) {
      console.error("Błąd podczas wysyłania zapytania POST:", error);
    }
  };

  return (
    <div className="sm:w-[83vw] sm:ml-[236px] flex flex-col gap-4 ml-4 mt-12 mb-12 h-max-content">
      <div>
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
      </div>
      {txtData && (
        <Card
          color="blue"
          classStyle="min-h-[150px]"
          classStyleDiv="flex flex-col justify-center items-center w-full gap-4"
        >
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col justify-center items-center w-full gap-4"
          >
            <div className="relative w-[250px] sm:w-[500px]">
              <Input
                type="textarea"
                name="text_predict"
                label="Text"
                color="blue"
                register={register}
              />
            </div>
            <Button color="blue" text="Submit" type="submit" func={() => {}} />
          </form>
        </Card>
      )}
      {responseState && (
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
