import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { Button, Card, Input } from "components";

const PredictText = () => {
  const fileInputTxtRef = useRef(null);
  const [txtData, setTxtData] = useState(null);
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm();
  const [responseState, setResponseState] = useState(null);

  const handleTxtSubmission = async () => {
    const file = fileInputTxtRef.current.files[0];
    if (file) {
      const text = await file.text();
      console.log(text);
      const data = JSON.parse(text);
      //setTxtHeaders(Object.keys(data[0]));
      setTxtData(data);
    }
  };
  console.log(txtData);

  const onSubmit = async (data) => {
    console.log({ ...txtData, ...data });
    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/predict/text_classification",
        { ...txtData, ...data }
      );
      console.log(response.data);
      setResponseState(response.data);
    } catch (error) {
      console.error("Błąd podczas wysyłania zapytania POST:", error);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 grid-cols-1 gap-4 ml-4 mt-12 h-max-content">
      <div>
        <Card color="green" classStyle="min-h-[150px]">
          <div className="text-[#1c1c1c] font-[14px] font-[600]">
            Select file
          </div>
          <input
            type="file"
            className="mb-4"
            ref={fileInputTxtRef}
            accept=".txt"
          />
          <Button
            color="green"
            text="Submit"
            type="button"
            func={handleTxtSubmission}
          />
        </Card>
      </div>
      <Card color="blue" classStyle="min-h-[150px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="relative">
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
      {responseState && (
        <Card classStyle="min-h-[150px]">
          <div>{responseState.results}</div>
        </Card>
      )}
    </div>
  );
};

export default PredictText;
