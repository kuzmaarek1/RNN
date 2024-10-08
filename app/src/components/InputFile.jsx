import React, { forwardRef, useState } from "react";
import { GrDocumentCsv, GrDocumentTxt } from "react-icons/gr";
import Button from "./Button";

const InputFile = forwardRef(({ fileAcept, multiple, color }, ref) => {
  const [fileName, setFileName] = useState(
    multiple ? "Choose a files…" : "Choose a file…"
  );

  const handleCustomBtnClick = () => {
    ref.current.click();
  };

  const handleFileInputChange = (event) => {
    const files = event.target.files;
    if (files.length > 0) {
      const maxLength = 10;
      const truncatedName =
        multiple && files.length > 1
          ? `${files.length} files selected`
          : files[0].name.length > maxLength
          ? files[0].name.substring(0, maxLength) + "..."
          : files[0].name;

      setFileName(truncatedName);
    } else {
      setFileName(multiple ? "Choose a files…" : "Choose a file…");
    }
  };

  const IconsStyles = `${
    fileName === "Choose a file…" || fileName === "Choose a files…"
      ? "text-red-500"
      : "text-black"
  } w-[30px] h-[30px]`;

  return (
    <div>
      <input
        type="file"
        id="input_file"
        className="mb-4"
        ref={ref}
        accept={fileAcept === ".csv" ? ".csv" : ".txt"}
        hidden
        multiple={multiple}
        onChange={handleFileInputChange}
      />
      <div className="flex gap-4 justify-center items-center">
        {fileAcept === ".csv" ? (
          <GrDocumentCsv className={IconsStyles} />
        ) : (
          <GrDocumentTxt className={IconsStyles} />
        )}
        <label htmlFor="input_file">
          <Button
            color={color}
            text={fileName}
            type="button"
            func={handleCustomBtnClick}
            classStyle="sm:w-[300px] w-[210px]"
            file={true}
          />
        </label>
      </div>
    </div>
  );
});

export default InputFile;
