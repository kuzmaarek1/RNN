import React from "react";

const Input = ({ type, name, label, register, color, onChange, ...props }) => {
  const handleChange = (event) => {
    console.log(parseInt(event.target.value, 10));
    if (onChange) {
      onChange(parseInt(event.target.value, 10));
    }
  };

  const classStyle = `relative w-full p-[10px_0px] bg-[transparent] border-[none] outline-none text-[black] text-[1em] uppercase tracking-[0.05em]
            border-b-[2px] ${
              color === "green"
                ? "border-[#A1E3CB]"
                : color === "blue"
                ? "border-[#95A4FC]"
                : "border-[#A8C5DA]"
            } 
            input`;

  const InputField = ({ props }) =>
    type === "textarea" ? (
      <textarea className={classStyle} {...props} />
    ) : (
      <input className={classStyle} {...props} />
    );

  return (
    <>
      {type === "textarea" ? (
        <textarea
          id={name}
          name={name}
          {...(register ? register(name) : {})}
          required
          onChange={handleChange}
          className={classStyle}
          {...props}
        />
      ) : (
        <input
          type={type}
          id={name}
          name={name}
          {...(register ? register(name) : {})}
          required
          onChange={handleChange}
          className={classStyle}
          {...props}
        />
      )}
      <label
        htmlFor={name}
        className="absolute left-0 p-[10px_0px] pointer-events-none text-[black] uppercase"
      >
        {label.split("").map((letter, i) => (
          <span
            className={`relative inline-flex tracking-[0.05em] transition-[0.2s] ease-in-out`}
            style={{ transitionDelay: `${i * 0.1}s` }}
          >
            {letter === " " ? "\u00A0" : letter}
          </span>
        ))}
      </label>
    </>
  );
};

export default Input;
