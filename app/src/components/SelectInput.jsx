import React, { useState } from "react";
import Select, { NonceProvider } from "react-select";

const SelectInput = ({
  options,
  label,
  name,
  isMulti,
  color,
  setValue,
  watch,
  styled,
}) => {
  const colorBorder =
    color === "green" ? "#A1E3CB" : color === "blue" ? "#95A4FC" : "#A8C5DA";

  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      position: "relative",
      width: "100%",
      padding: "5px 0px",
      background: "transparent",
      border: "none",
      outline: "none",
      borderRadius: "0px",
      color: "black",
      textTransform: "uppercase",
      fontSize: "1em",
      letterSpacing: "0.05em",
      borderBottom: `2px solid ${colorBorder}`,
      "&:hover": {
        borderBottom: `2px solid ${colorBorder}`,
      },
      boxShadow: "none",
    }),

    indicatorSeparator: (provided, state) => ({
      ...provided,
      backgroundColor: colorBorder,
    }),

    dropdownIndicator: (provided, state) => ({
      ...provided,
      color: colorBorder,
      "&:hover": {
        cursor: "pointer",
        color: colorBorder,
      },
    }),

    noOptionsMessage: (provided, state) => ({
      ...provided,
      color: "black",
      backgroundColor: colorBorder,
      borderRadius: "15px",
    }),

    clearIndicator: (provided, state) => ({
      ...provided,
      color: colorBorder,
      "&:hover": {
        cursor: "pointer",
        color: colorBorder,
      },
    }),

    multiValue: (provided, state) => ({
      ...provided,
      backgroundColor: colorBorder,
    }),

    menu: (provided, state) => ({
      ...provided,
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      fontSize: "0.8em",
      border: `2px solid ${colorBorder}`,
      outline: "none",
      background: "#e3f5ff",
      boxShadow: "none",
    }),
    menuList: (provided, state) => ({
      ...provided,
      border: "none",
      maxHeight: "200px",
      overflowY: "auto",
      scrollbarWidth: "thin",
      scrollbarColor: `${colorBorder} transparent`,
      border: "none",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? colorBorder : "white",
      color: state.isSelected ? "grey" : "black",
      cursor: state.isSelected ? "not-allowed" : "default",
      display: state.isSelected ? "none" : "",
      borderRadius: "15px",
      border: `1px solid ${colorBorder}`,
    }),
    input: (provided, state) => ({
      ...provided,
      textTransform: "uppercase",
      color: "black",
    }),
  };

  const [selectedOptions, setSelectedOptions] = useState([]);
  const optionsState = options.map((option) => ({
    value: option,
    label: option,
  }));
  const [focused, setFocused] = useState(false);

  const handleChange = (selectedOptions) => {
    setSelectedOptions(selectedOptions);
    const selectedValues = isMulti
      ? selectedOptions.map((option) => option.value)
      : selectedOptions.value;
    setValue(name, selectedValues);
  };

  return (
    <div className={`relative ${styled ? styled : "w-[300px]"}`}>
      <label
        className={`absolute left-0 
        mt-[-8px] ${
          styled && (watch?.length === 0 || watch === undefined) && !focused
            ? "p-[20px_0px]"
            : "p-[20px_0px]"
        } pointer-events-none text-[black] uppercase`}
        htmlFor={name}
      >
        {label.split("").map((letter, i) => (
          <span
            className={`relative inline-flex tracking-[0.05em] transition-[0.2s] ease-in-out
                     ${
                       !(
                         (watch?.length === 0 || watch === undefined) &&
                         !focused
                       ) &&
                       "transform font-semibold  uppercase translate-y-[-22px]"
                     }
               `}
            style={{ transitionDelay: `${i * 0.1}s` }}
          >
            {letter === " " ? "\u00A0" : letter}
          </span>
        ))}
      </label>
      <Select
        id={name}
        name={name}
        options={optionsState}
        value={selectedOptions}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        isMulti={isMulti}
        styles={customStyles}
        color={color}
        placeholder={null}
      />
    </div>
  );
};

export default SelectInput;
