export const circleCoordinates = [
  { cx: "5", cy: "119.76" },
  { cx: "136.66666666666666", cy: "134.8902" },
  { cx: "268.3333333333333", cy: "8.020000000000003" },
  { cx: "400", cy: "96.98919999999998" },
  { cx: "531.6666666666666", cy: "83.52000000000001" },
  { cx: "663.3333333333333", cy: "98.62" },
  { cx: "795", cy: "91.07000000000002" },
];

export const navbarTitle = [
  "models",
  "training",
  "evaluate",
  "compare",
  "predict",
];

export const navbarItems = [
  { title: "Time series", link: "time_series" },
  { title: "Text", link: "text" },
];
export const metricsErrorTimeSeries = [
  { name: "mean_absolute_error", title: "Mean Absolute" },
  { name: "mean_percentage_error", title: "Mean Percentage" },
  { name: "mean_squared_error", title: "Mean Squared" },
  { name: "r2_score", title: "R2" },
  { name: "root_mean_squared_error", title: "Root mean squared" },
];

export const inputFieldModelsTimeSeries = [
  {
    type: "number",
    name: "time_step",
    label: "Time Step",
    color: "green",
  },
  {
    type: "number",
    name: "batch_size",
    label: "Batch size",
    color: "green",
  },
  {
    type: "number",
    name: "epochs",
    label: "Epochs",
    color: "green",
  },
];

export const inputFieldModelsText = [
  {
    type: "number",
    name: "num_words",
    label: "Num words",
    color: "blue",
  },
  {
    type: "number",
    name: "max_text_len",
    label: "Max text len",
    color: "blue",
  },
  {
    type: "number",
    name: "batch_size",
    label: "Batch size",
    color: "blue",
  },
  {
    type: "number",
    name: "epochs",
    label: "Epochs",
    color: "blue",
  },
];
