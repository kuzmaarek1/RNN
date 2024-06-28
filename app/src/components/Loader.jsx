import React from "react";
import { ThreeDots } from "react-loader-spinner";

const Loader = () => (
  <ThreeDots
    height="80"
    width="80"
    radius="9"
    color={"green"}
    ariaLabel="three-dots-loading"
    wrapperStyle={{}}
    wrapperClassName=""
    visible={true}
  />
);

export default Loader;
