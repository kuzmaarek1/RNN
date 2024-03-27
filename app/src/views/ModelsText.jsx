import React, { useRef, useState, useEffect } from "react";
import { parse } from "papaparse";
import { useForm, useFieldArray } from "react-hook-form";
import { io } from "socket.io-client";

const ModelsText = () => {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm();

  const { fields, remove, append } = useFieldArray({
    control,
    name: "models",
  });

  const socket = useRef();
  const fileInputRef = useRef(null);
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [csvData, setCsvData] = useState(null);
  const selectCategoryRef = useRef(null);
  const [category, setCategory] = useState();
  const [text, setText] = useState();
  const [epochsHistory, setEpochsHistory] = useState([]);
  const [downloadLink, setDownloadLink] = useState(null);

  useEffect(() => {
    socket.current = io("http://127.0.0.1:5000");
    socket.current.on("epoch_update/text_classification", (epochs) => {
      console.log(epochs);
      setEpochsHistory((prev) => [...prev, JSON.parse(epochs)]);
    });
    socket.current.on("training_completed/text_classification", (results) => {
      console.log(results);
      const parsedData = JSON.parse(results);
      setDownloadLink(parsedData);
    });
  }, []);

  const handleCsvSubmission = async () => {
    const file = fileInputRef.current.files[0];
    if (file) {
      const text = await file.text();
      const { data } = parse(text, { header: true });
      setCsvHeaders(Object.keys(data[0]));
      setCsvData(data);
    }
  };

  const handleCategory = () => {
    const selectedCategoryLabel = selectCategoryRef.current.value;
    const selectedText = csvHeaders.find(
      (csvHeader) => csvHeader !== selectedCategoryLabel
    );
    setCategory(selectedCategoryLabel);
    setText(selectedText);
  };

  console.log(category);
  console.log(text);
  console.log(csvData);
  console.log(csvHeaders);

  const onSubmit = (data) => {
    console.log({
      ...data,
      category: category,
      text: text,
      datset: csvData,
    });
    socket.current.emit(
      "train/text_classification",
      JSON.stringify({
        ...data,
        category: category,
        text: text,
        dataset: csvData,
      })
    );
  };

  console.log(epochsHistory);

  const handleDownload = () => {
    if (downloadLink) {
      const dataToDownload = JSON.stringify(downloadLink);
      const blob = new Blob([dataToDownload], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "models.txt";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  };

  return (
    <div className="flex gap-[12px]">
      <div>
        <div className="text-[#1c1c1c] font-[14px] font-[600]">Select file</div>
        <div className="bg-[#e3f5ff]  rounded-[16px] custom-box-shadow p-8">
          <input
            type="file"
            className="mb-4"
            ref={fileInputRef}
            accept=".csv"
          />
          <button
            className="relative uppercase spacing tracking-widest font-[400] text-base py-[10px] duration-500 w-[150px] rounded-[16px] border-[2px] border-[#A1E3CB] text-[#1c1c1c] group
            hover:bg-[#A1E3CB] hover:tracking-[0.25em] before:content-[''] before:absolute before:inset-[2px]"
            onClick={handleCsvSubmission}
          >
            <span className="relative z-10 flex justify-center">Submit</span>
            <i
              className="box-shadow-button group-hover:before:w-[8px] group-hover:before:left-[calc(50%)]  group-hover:before:delay-[0.5s]
              before:content-[''] before:absolute  before:w-[10px] before:h-[6px] before:bg-[white] before:border-[2px] before:border-[#A1E3CB] before:top-[-3.5px] before:left-[80%] before:translate-x-[-50%] before:duration-500 before:delay-[0.5s]
              group-hover:after:w-[8px]  group-hover:after:left-[calc(50%)]  group-hover:after:delay-[0.5s]
              after:content-[''] after:absolute after:w-[10px] after:h-[6px] after:bg-[white] after:border-[2px] after:border-[#A1E3CB] after:bottom-[-3.5px] after:left-[20%] after:translate-x-[-50%] after:duration-500 after:delay-[0.5s]"
            ></i>
          </button>
        </div>
      </div>
      {csvHeaders.length > 0 && (
        <div className="bg-[#e5ecf6] h-[50px] rounded-[16px] custom-box-shadow">
          <label htmlFor="Category">Category Label</label>
          <select name="Category" id="Category" ref={selectCategoryRef}>
            {csvHeaders.map((csvHeader) => (
              <option value={csvHeader} key={csvHeader}>
                {csvHeader}
              </option>
            ))}
          </select>
          <button onClick={handleCategory}>Submit Category</button>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <label htmlFor="num_words">Num Words</label>
        <input
          type="number"
          id="num_words"
          name="num_words"
          {...register(`num_words`)}
        />
        <label htmlFor="max_text_len">Max text len</label>
        <input
          type="number"
          id="max_text_len"
          name="max_text_len"
          {...register(`max_text_len`)}
        />
        <label htmlFor="batch_size">Batch size</label>
        <input
          type="number"
          id="batch_size"
          name="batch_size"
          {...register(`batch_size`)}
        />
        <label htmlFor="epochs">Epochs</label>
        <input
          type="number"
          id="epochs"
          name="epochs"
          {...register(`epochs`)}
        />
        {fields.map(({ id }, index) => (
          <div key={id}>
            <label htmlFor="layers">Layers</label>
            <select
              id="layers"
              name="layers"
              {...register(`models[${index}].layers`)}
              defaultValue="RNN"
            >
              <option value="RNN">RNN</option>
              <option value="LSTM">LSTM</option>
              <option value="GRU">GRU</option>
            </select>
            <label htmlFor="units">Units</label>
            <input
              type="number"
              id="units"
              name="units"
              {...register(`models[${index}].units`)}
            />
            <label htmlFor="returnSequences">Return_sequences</label>
            <input
              type="checkbox"
              id="returnSequences"
              name="returnSequences"
              {...register(`models[${index}].returnSequences`)}
              defaultChecked={true}
            />
            <button type="button" onClick={() => remove(index)}>
              Remove
            </button>
          </div>
        ))}
        <button type="button" onClick={() => append({})}>
          Add model
        </button>
        <input type="submit" />
      </form>
      {epochsHistory.length != 0 &&
        epochsHistory.map((props, index) => (
          <div key={index}>
            <div>{props.epoch}</div>
            <div>{props.loss}</div>
          </div>
        ))}
      {downloadLink && (
        <div>
          <button onClick={handleDownload}>Download Results</button>
        </div>
      )}
    </div>
  );
};

export default ModelsText;
