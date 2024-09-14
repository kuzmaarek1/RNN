import React, { useState, useRef } from "react";
import Papa from "papaparse";
import { useForm } from "react-hook-form";
import { Button, Card, Input, InputFile } from "components";

const DataPreparation = () => {
  const fileInputRef = useRef();
  const [shuffledData, setShuffledData] = useState(null);
  const { register, watch } = useForm();

  const shuffleData = () => {
    const file = fileInputRef.current.files[0];
    if (file)
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        complete: (result) => {
          const shuffled = [...result.data];
          shuffled.sort(() => Math.random() - 0.5);
          setShuffledData(shuffled);
        },
      });
  };

  const downloadShuffledData = () => {
    if (shuffledData) {
      const csv = Papa.unparse(shuffledData);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.setAttribute("download", watch("name_file"));
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <form className="w-[calc(100%-2rem)] flex flex-col gap-4 mx-4 mt-12 mb-12 h-max-content">
      <Card
        color="green"
        classStyleDiv="flex flex-col justify-center items-center w-full gap-4"
      >
        <InputFile
          ref={fileInputRef}
          fileAcept=".csv"
          multiple={false}
          color="green"
        />
        <Button text="Prepare" color="green" type="button" func={shuffleData} />
      </Card>
      {shuffledData && (
        <Card
          color="blue"
          classStyleDiv="flex flex-rows justify-center items-center w-full gap-4"
        >
          <div className="relative">
            <Input
              type="text"
              name="name_file"
              label="Name File"
              color="grey"
              register={register}
            />
          </div>
          <div className="mt-4">
            <Button
              text="Download"
              color="blue"
              type="button"
              func={downloadShuffledData}
            />
          </div>
        </Card>
      )}
    </form>
  );
};

export default DataPreparation;
