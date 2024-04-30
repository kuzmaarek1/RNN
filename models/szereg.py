import numpy as np
import matplotlib.pyplot as plt

# Tworzenie szeregu czasowego
np.random.seed(0)
t = np.arange(0, 100, 0.1)
seasonality = 10 * np.sin(2 * np.pi * t / 20)  # sezonowość
trend = 0.02 * t**2  # trend kwadratowy
noise = np.random.normal(0, 0.5, len(t))  # szum gaussowski

# Łączenie składowych
complex_series = seasonality + trend + noise

# Wykres szeregu czasowego
plt.figure(figsize=(10, 6))
plt.plot(t, complex_series, label="Complex Time Series")
plt.xlabel("Time")
plt.ylabel("Value")
plt.title("Complex Time Series")
plt.legend()
plt.show()

"""
import numpy as np
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from keras.models import Sequential
from keras.layers import Dense, SimpleRNN

# Generowanie danych
np.random.seed(0)
t = np.arange(2000)
x = np.sin(0.02 * t) + np.random.normal(0, 0.2, size=2000)
plt.plot(x)
plt.title("Wygenerowany szereg czasowy")
plt.show()

import pandas as pd

# Zapis danych do DataFrame
df = pd.DataFrame({"t": t, "x": x})

# Zapis do pliku CSV
df.to_csv("sinusoidal_data.csv", index=False)

print("Dane zostały zapisane do pliku CSV.")
"""
