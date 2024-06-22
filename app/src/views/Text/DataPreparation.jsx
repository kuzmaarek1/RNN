import React, { useState } from "react";
import Papa from "papaparse";
import { useForm } from "react-hook-form";
import { Button, Card, Input } from "components";

const DataPreparation = () => {
  const [fileData, setFileData] = useState(null);
  const [shuffledData, setShuffledData] = useState(null);
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm();

  const handleFileInputChange = (event) => {
    const file = event.target.files[0];
    setShuffledData(null);

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      complete: (result) => {
        setFileData(result.data);
      },
    });
  };

  const shuffleData = () => {
    if (fileData) {
      const shuffled = [...fileData];
      shuffled.sort(() => Math.random() - 0.5);
      setShuffledData(shuffled);
    }
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
    <form className="grid lg:grid-cols-2 grid-cols-1 gap-4 ml-4 mt-12 h-max-content">
      <Card color="green">
        <input type="file" accept=".csv" onChange={handleFileInputChange} />
        <Button text="Prepare" color="green" type="button" func={shuffleData} />
      </Card>
      {shuffledData && (
        <Card color="blue">
          <h2 className="mb-2">Prepared Data:</h2>
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
