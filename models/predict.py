import tensorflow as tf
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
import matplotlib.pyplot as plt
import numpy as np
from sklearn import metrics

# Ścieżka do pliku, w którym zapisany jest model
path_to_save = "../files/models/model_1710525159_9319bd39.keras"

# Załaduj model
model = tf.keras.models.load_model(path_to_save)

print(model.summary())

df = pd.read_csv("C:/Users/akuzm/OneDrive/Pulpit/praca/GOOG.csv")
data = df[["close", "high"]]
print(data)
dataset = data.values
scaler = MinMaxScaler(feature_range=(0, 1))
scaled_data = scaler.fit_transform(dataset)

scaled_data = scaled_data[1220:1258, :]

time_step = 30  # to pasowało by dać do zmiennej
x_test = []
y_test = []
for i in range(time_step, len(scaled_data)):
    x_test.append(scaled_data[i - time_step : i, :])
    y_test.append(scaled_data[i, :])

x_test, y_test = np.array(x_test), np.array(y_test)

predictions = model.predict(x_test)
print(predictions)
print(y_test)

print(f"Mean Absolute Error: {metrics.mean_absolute_error(y_test, predictions)}")
print(f"Mean Squared Error: {metrics.mean_squared_error(y_test, predictions)}")
print(
    f"Root Mean Squared Error: {np.sqrt(metrics.mean_squared_error(y_test, predictions))}"
)
print(f"R2_Score: {metrics.r2_score(y_test, predictions)}")


# scaler = MinMaxScaler(feature_range=(0, 1))
predictions = scaler.inverse_transform(predictions)
y_test = scaler.inverse_transform(y_test)

plt.figure(figsize=(16, 6))
plt.plot([1, 2, 3, 4, 5, 6, 7, 8], predictions[:, 0])
plt.plot([1, 2, 3, 4, 5, 6, 7, 8], y_test[:, 0])
plt.show()

for idx, i in enumerate(filter):
    print(i)
    print(y_test[:, idx])
    print(predictions[:, idx])
    print(
        f"Mean Absolute Error: {metrics.mean_absolute_error(y_test[:, idx], predictions[:, idx])}"
    )
    print(
        f"Mean Squared Error: {metrics.mean_squared_error(y_test[:, idx], predictions[:, idx])}"
    )
    print(
        f"Root Mean Squared Error: {np.sqrt(metrics.mean_squared_error(y_test[:,idx], predictions[:, idx]))}"
    )
    print(f"R2_Score: {metrics.r2_score(y_test[:, idx], predictions[:, idx])}")
    """
    print(f"Mean Absolute Error: {metrics.mean_absolute_error(y_test, predictions)}")
    print(f"Mean Squared Error: {metrics.mean_squared_error(y_test, predictions)}")
    print(
        f"Root Mean Squared Error: {np.sqrt(metrics.mean_squared_error(y_test, predictions))}"
    )
    print(f"R2_Score: {metrics.r2_score(y_test, predictions)}")
    """
