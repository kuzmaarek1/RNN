import numpy as np
import matplotlib.pyplot as plt
import pandas as pd


# mport numpy as np
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense


# Generowanie danych szeregu czasowego
def generate_time_series(length=2000, num_attacks=5):
    # Tworzenie sekwencji czasowej symulującej normalny ruch sieciowy
    normal_traffic = np.random.normal(loc=50, scale=10, size=length)

    # Tworzenie zmian w ruchu sieciowym w zależności od pory dnia
    time_of_day = np.linspace(0, 2 * np.pi, length)
    daily_variation = 20 * np.sin(time_of_day) + 50

    # Inicjalizacja sekwencji ataków
    attack_traffic = np.zeros(length)

    # Symulowanie ataków sieciowych
    for _ in range(num_attacks):
        attack_start = np.random.randint(0, length - 200)
        attack_traffic[attack_start : attack_start + 200] += np.random.normal(
            loc=100, scale=20, size=200
        )

    # Sumowanie wszystkich składników
    traffic = normal_traffic + attack_traffic + daily_variation

    return traffic


# Generowanie danych
traffic_series = generate_time_series()

# Wykres szeregu czasowego
plt.figure(figsize=(10, 6))
plt.plot(traffic_series)
plt.title("Przykładowy szereg czasowy: Ruch sieciowy z większą liczbą ataków")
plt.xlabel("Czas")
plt.ylabel("Ruch sieciowy")
plt.grid(True)
plt.show()

# Zapis danych do pliku CSV
df = pd.DataFrame({"Ruch sieciowy": traffic_series})
df.reset_index(inplace=True)
df.to_csv("traffic_data1.csv", index=False)

print("Dane zostały zapisane do pliku CSV: traffic_data.csv")
