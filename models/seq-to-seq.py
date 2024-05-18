import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense
import numpy as np


# Przygotowanie danych
def prepare_data_seq_to_seq(data, n_steps):
    X, y = [], []
    for i in range(len(data)):
        end_ix = i + n_steps
        if end_ix > len(data) - 1:
            break
        seq_x, seq_y = data[i:end_ix], data[i + 1 : end_ix + 1]
        X.append(seq_x)
        y.append(seq_y)
    return np.array(X), np.array(y)


# Przykładowe dane szeregu czasowego y
y = np.array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])


# Przygotowanie danych wejściowych i wyjściowych dla modelu seq to seq
n_steps = 3  # Liczba kroków czasowych
X, y = prepare_data_seq_to_seq(y, n_steps)
print(X)
print(y)
# Tworzenie modelu LSTM
model = Sequential()
model.add(LSTM(50, activation="relu", input_shape=(n_steps, 1), return_sequences=False))
model.add(Dense(1))
model.compile(optimizer="adam", loss="mse")

# Trenowanie modelu
model.fit(X, y, epochs=5)

predicted_values = model.predict(X)
print(predicted_values)
"""
[[0 1 2]
 [1 2 3]
 [2 3 4]
 [3 4 5]
 [4 5 6]
 [5 6 7]
 [6 7 8]]
[[1 2 3]
 [2 3 4]
 [3 4 5]
 [4 5 6]
 [5 6 7]
 [6 7 8]
 [7 8 9]]
 działa bo return sekewnce true (domyślne reruen sekwencce false)
"""
