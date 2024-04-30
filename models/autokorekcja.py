"""
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

# Ustawienie ziarna generatora liczb losowych dla powtarzalności wyników
np.random.seed(42)

# Parametry generacji szeregu czasowego
years = 2000  # Liczba lat
long_term_amplitude = 20  # Amplituda długoterminowego trendu
long_term_period = 20  # Okres długoterminowego trendu

# Generowanie szeregu czasowego na podstawie funkcji sinusoidalnej
time = np.arange(years)
long_term_trend = long_term_amplitude * np.sin(2 * np.pi / long_term_period * time)

# Dodanie losowego szumu
noise = np.random.normal(0, 5, size=years)
time_series = long_term_trend + noise

# Wykres szeregu czasowego
plt.plot(time, time_series)
plt.title("Szereg czasowy z długoterminowymi zależnościami")
plt.xlabel("Lata")
plt.ylabel("Wartość")
plt.grid(True)
plt.show()

# Zapis do pliku CSV
data = {"Year": time, "Value": time_series}
df = pd.DataFrame(data)
df.to_csv("szereg_czasowy.csv", index=False)
"""

import pandas as pd

# Wczytanie danych
data = pd.read_csv("C:/Users/akuzm/OneDrive/Pulpit/praca/GOOG.csv")

# Obliczenie autokorelacji dla różnych opóźnień czasowych
lags = [1, 5, 10, 20, 600, 800]  # Lista różnych opóźnień czasowych
for lag in lags:
    autocorr = data["close"].autocorr(lag=lag)
    print(f"Autokorelacja dla opóźnienia {lag}: {autocorr}")
