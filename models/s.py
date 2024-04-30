import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler
from keras.models import Sequential
from keras.layers import Dense, LSTM


def generate_time_series(length=1000, long_term_dependence=True, attack=True):
    # Tworzenie sekwencji czasowej symulującej długoterminowe zależności
    if long_term_dependence:
        trend = np.arange(length) * 0.05  # Tworzenie trendu wzrostowego
    else:
        trend = np.zeros(length)

    # Symulowanie pojedynczego ataku sieciowego
    if attack:
        attack_start = np.random.randint(0, length - 200)
        attack_traffic = np.zeros(length)
        attack_traffic[attack_start : attack_start + 200] = np.random.normal(
            loc=100, scale=20, size=200
        )
    else:
        attack_traffic = np.zeros(length)

    # Tworzenie całkowitego szeregu czasowego
    traffic = trend + attack_traffic

    return traffic


# Generowanie szeregu czasowego
traffic_series = generate_time_series()
# Wykres szeregu czasowego
plt.figure(figsize=(10, 6))
plt.plot(traffic_series)
plt.title("Bardziej złożony szereg czasowy")
plt.xlabel("Czas")
plt.ylabel("Wartość")
plt.grid(True)
plt.show()

df = pd.DataFrame({"Ruch sieciowy": traffic_series})
df.reset_index(inplace=True)
df.to_csv("s.csv", index=False)

print("Dane zostały zapisane do pliku CSV: traffic_data.csv")
