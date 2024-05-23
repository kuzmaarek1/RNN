import pandas as pd
import numpy as np
import pickle
import seaborn as sns
import matplotlib.pyplot as plt
from scalecast.Forecaster import Forecaster

data = pd.read_csv(
    "C:/Users/akuzm/OneDrive/Pulpit/AirPassengers.csv", parse_dates=["Month"]
)

f = Forecaster(y=data["#Passengers"], current_dates=data["Month"])

print(f)

f.plot_pacf(lags=26)
plt.show()

f.seasonal_decompose().plot()
plt.show()

f.set_test_length(
    50
)  # 1. 12 observations to test the results12)       # 1. 12 observations to test the results
f.generate_future_dates(50)  # 2. 12 future points to forecast
f.set_estimator("lstm")  # 3. LSTM neural network

f.manual_forecast(call_me="lstm_default")
f.plot_test_set(ci=True)
plt.show()
