import tensorflow as tf

# Definicja prostego modelu rekurencyjnego
model = tf.keras.Sequential(
    [
        tf.keras.layers.GRU(units=1000, input_shape=(1, 1)),
    ]
)

# Wyświetlenie podsumowania modelu
model.summary()
