import pandas as pd
import numpy as np
import random

# Wczytaj dane z pliku CSV
df = pd.read_csv("C:/Users/akuzm/OneDrive/Pulpit/praca/GOOG.csv")

# Utwórz pustą ramkę danych, do której dodamy powielone i zmodyfikowane wiersze
new_rows = []

# Powiel każdy wiersz pięć razy i zmień jego wartości
for index, row in df.iterrows():
    for _ in range(3):
        # Wygeneruj losowe zmiany dla każdej kolumny (poza 'symbol', 'date', 'divCash', 'splitFactor')
        new_row = row.copy()
        for column in df.columns[2:]:  # Pomiń pierwsze dwie kolumny ('symbol', 'date')
            if column not in ["divCash", "splitFactor"]:
                change = random.uniform(-0.01, 0.01)  # Losowe zmiany w zakresie +/- 5%
                new_row[column] += new_row[column] * change
        new_rows.append(new_row)

# Utwórz nowy DataFrame z nowymi wierszami
new_df = pd.DataFrame(new_rows, columns=df.columns)

# Zapisz zmodyfikowany DataFrame do pliku CSV
new_df.to_csv("nowy_plik.csv", index=False)
