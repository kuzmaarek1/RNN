import numpy as np
from keras.models import Sequential
from keras.layers import Dense, SimpleRNN

# Przykładowe dane wejściowe różnej długości
# Zakładamy, że mamy sekwencje liczb całkowitych o różnych długościach
input_data = [[1, 2, 3], [4, 5], [6, 7, 8, 9]]

# Zwykła sieć neuronowa
model_nn = Sequential(
    [
        Dense(10, input_shape=(3,)),  # Przyjmujemy wejścia o stałej długości 3
        Dense(1),  # Warstwa wyjściowa
    ]
)

# Sieć rekurencyjna (RNN)
model_rnn = Sequential(
    [
        SimpleRNN(
            10, input_shape=(None, 1)
        ),  # None oznacza, że sieć RNN może przyjmować dane o dowolnej długości
        Dense(1),  # Warstwa wyjściowa
    ]
)

# Przygotowanie danych wejściowych i wyjściowych
X = input_data
# X = [np.array(seq)[:, np.newaxis].tolist() for seq in input_data]
y = [np.random.random((len(input_data), 1))]

print(X)
print(y)
"""
# Trenowanie modelu zwykłej sieci neuronowej
model_nn.compile(optimizer="adam", loss="mse")
model_nn.fit(X, y, epochs=5)
"""

# Trenowanie modelu sieci rekurencyjnej (RNN)
model_rnn.compile(optimizer="adam", loss="mse")
model_rnn.fit(X, y, epochs=5)

# Przykładowe dane testowe
test_data = [[1, 2], [4, 5, 6, 7], [8, 9, 10]]

# Predykcja dla modelu zwykłej sieci neuronowej
"""
X_test_nn = np.array(
    [
        np.pad(np.array(seq), (0, max(map(len, test_data)) - len(seq)))
        for seq in test_data
    ]
)[:, :, np.newaxis]
predictions_nn = model_nn.predict(X_test_nn)
print("Predictions NN:")
print(predictions_nn)
"""
# Predykcja dla modelu sieci rekurencyjnej (RNN)
X_test_rnn = np.array([np.array(seq)[:, np.newaxis] for seq in test_data])
predictions_rnn = model_rnn.predict(X_test_rnn)
print("Predictions RNN:")
print(predictions_rnn)
