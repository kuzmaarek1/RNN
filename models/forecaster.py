import pandas as pd
import numpy as np
import pickle
import seaborn as sns
import matplotlib.pyplot as plt
from scalecast.Forecaster import Forecaster

data = pd.read_csv("GOOG.csv", parse_dates=["date"])
data["date"] = data["date"].dt.tz_localize(None)
f = Forecaster(y=data["close"], current_dates=data["date"])

print(f)

f.plot_acf(lags=500)
plt.show()

f.seasonal_decompose(period=30).plot()
plt.show()

stat, pval, _, _, _, _ = f.adf_test(full_res=True)
print(stat)
print(pval)

data = pd.read_csv("DailyDelhiClimateTrain.csv", parse_dates=["date"])
# data["date"] = data["date"].dt.tz_localize(None)
f = Forecaster(y=data["meantemp"], current_dates=data["date"])

print(f)

f.plot_acf(lags=500)
plt.show()

f.seasonal_decompose(period=30).plot()
plt.show()

stat, pval, _, _, _, _ = f.adf_test(full_res=True)
print(stat)
print(pval)
"""
f.set_test_length(
    50
)  # 1. 12 observations to test the results12)       # 1. 12 observations to test the results
f.generate_future_dates(50)  # 2. 12 future points to forecast
f.set_estimator("lstm")  # 3. LSTM neural network

f.manual_forecast(call_me="lstm_default")
f.plot_test_set(ci=True)
plt.show()
"""
