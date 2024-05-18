import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense
import numpy as np

# Przygotowanie danych szeregu czasowego
# Załóżmy, że mamy szereg czasowy y, który chcemy przewidzieć
y = np.array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])  # Przykładowe dane szeregu czasowego


# Przygotowanie danych wejściowych i wyjściowych
def prepare_data(data, n_steps):
    X, y = [], []
    for i in range(len(data)):
        end_ix = i + n_steps
        if end_ix > len(data) - 1:
            break
        seq_x, seq_y = data[i:end_ix], data[end_ix]
        X.append(seq_x)
        y.append(seq_y)
    return np.array(X), np.array(y)


n_steps = 3  # Liczba kroków czasowych
X, y = prepare_data(y, n_steps)
print(X)
print(y)
# Tworzenie modelu RNN
model = Sequential()
model.add(LSTM(50, activation="relu", input_shape=(n_steps, 1), return_sequences=True))
model.add(LSTM(50, activation="relu", return_sequences=False))
model.add(Dense(1))
model.compile(optimizer="adam", loss="mse")

# Trenowanie modelu
model.fit(X, y, epochs=200)

# Przygotowanie danych testowych
x_input = np.array([7, 8, 9])  # Przykładowe dane testowe
x_input = x_input.reshape((1, n_steps, 1))

# Przewidywanie na podstawie danych testowych
y_pred = model.predict(x_input, verbose=0)
print("Przewidywana wartość:", y_pred[0][0])

"""
Tak, w przypadku modelu sekwencja-do-sekwencji (seq to seq) zalecane jest ustawienie return_sequences=True, a w przypadku modelu sekwencja-do-wektora (seq to vector) zalecane jest ustawienie return_sequences=False.

Oto dlaczego:

Sekwencja-do-sekwencji (seq to seq):

W przypadku modelu, w którym zarówno dane wejściowe, jak i wyjściowe są sekwencjami, return_sequences=True jest zalecane, ponieważ chcemy, aby każda warstwa w modelu LSTM zwracała sekwencję danych wyjściowych, a nie tylko ostatnią wartość. Pozwala to na zachowanie informacji o sekwencji podczas przetwarzania.
Dzięki temu możemy przewidywać kolejne wartości na podstawie całej sekwencji danych wejściowych, co jest przydatne w problemach, takich jak przewidywanie szeregów czasowych lub tłumaczenie maszynowe.
Sekwencja-do-wektora (seq to vector):

W przypadku modelu, który przekształca sekwencję wejściową w pojedynczy wektor wyjściowy, return_sequences=False jest zalecane. Wtedy tylko ostatnia warstwa LSTM będzie zwracać pojedynczy wektor, co jest odpowiednie dla tego rodzaju zadania.
Ostateczny wektor może zawierać informacje o całej sekwencji wejściowej, ale model przekształca tę sekwencję w pojedynczy wynik, co może być wystarczające dla problemów, takich jak klasyfikacja sekwencji lub analiza sentymentu tekstu.
"""
